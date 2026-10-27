import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Dynamic import bypass for ESM packages in a CommonJS TypeScript project
const importDynamic = new Function('modulePath', 'return import(modulePath)');

// Initialize Innertube globally
let yt: any = null;
async function getYT() {
  if (!yt) {
    const { Innertube } = await importDynamic('youtubei.js');
    yt = await Innertube.create({ retrieve_player: false });
  }
  return yt;
}

/**
 * Download endpoint — uses youtubei.js (pure Node.js).
 * Works on Vercel serverless functions (no binary dependencies).
 * 
 * GET /api/download/youtube?id=YOUTUBE_ID&type=audio
 */
router.get('/youtube', async (req, res) => {
  const { id, type } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'YouTube ID is required' });
    return;
  }
  
  if (type !== 'audio') {
    res.status(400).json({ error: 'Only audio downloads are supported natively on Vercel' });
    return;
  }

  try {
    console.log(`[Download] Fetching info for ${id}...`);
    const youtube = await getYT();
    const info = await youtube.getBasicInfo(id);
    
    const title = (info.basic_info.title || 'audio').replace(/[^\w\s-]/gi, '_').trim();

    // Get all audio-only formats, sorted by bitrate (highest first)
    const audioFormats = (info.streaming_data?.adaptive_formats || [])
      .filter((f: any) => f.mime_type && f.mime_type.startsWith('audio'))
      .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

    const format = audioFormats[0];

    if (!format || !format.url) {
      throw new Error('No audio format found');
    }

    const ext = format.mime_type?.includes('webm') ? 'webm' : 'm4a';
    const mimeType = format.mime_type?.split(';')[0] || 'audio/mp4';

    console.log(`[Download] Audio format: ${mimeType} @ ${format.bitrate}bps`);

    res.setHeader('Content-Disposition', `attachment; filename="${title}_audio.${ext}"`);
    res.setHeader('Content-Type', mimeType);

    // Fetch the stream URL directly and pipe it to the response
    const streamRes = await fetch(format.url);
    if (!streamRes.ok || !streamRes.body) {
      throw new Error(`Failed to fetch stream: ${streamRes.statusText}`);
    }

    // Convert Web ReadableStream to Node.js stream and pipe
    // @ts-ignore
    const nodeStream = require('stream').Readable.fromWeb(streamRes.body);
    nodeStream.pipe(res);

    req.on('close', () => {
      nodeStream.destroy();
    });

  } catch (error: any) {
    console.error('[Download] Error:', error.message);
    if (!res.headersSent) {
      res.removeHeader('Content-Disposition');
      res.removeHeader('Content-Type');
      res.status(500).json({ error: 'Failed to download media', details: error.message || String(error) });
    }
  }
});

/**
 * Streaming endpoint — uses youtubei.js for direct proxy streaming.
 * Used by the custom video player for proxy playback.
 * 
 * GET /api/download/stream?id=YOUTUBE_ID
 */
router.get('/stream', async (req, res) => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'YouTube ID is required' });
    return;
  }

  try {
    const youtube = await getYT();
    const info = await youtube.getBasicInfo(id);

    // Get best pre-muxed format for streaming, or highest video-only if no muxed
    const muxed = (info.streaming_data?.formats || [])
      .filter((f: any) => f.has_video && f.has_audio)
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

    let format = muxed[0];
    
    // Fallback to video-only if no muxed format is available
    if (!format) {
      const videos = (info.streaming_data?.adaptive_formats || [])
        .filter((f: any) => f.mime_type && f.mime_type.startsWith('video'))
        .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));
      format = videos[0];
    }

    if (!format || !format.url) throw new Error('No streamable format found');

    const mimeType = format.mime_type?.split(';')[0] || 'video/mp4';
    res.setHeader('Content-Type', mimeType);

    console.log(`[Stream] Serving ${id}: ${format.width}x${format.height}`);

    const streamRes = await fetch(format.url);
    if (!streamRes.ok || !streamRes.body) throw new Error('Failed to fetch stream');

    // @ts-ignore
    const nodeStream = require('stream').Readable.fromWeb(streamRes.body);
    nodeStream.pipe(res);

    req.on('close', () => {
      nodeStream.destroy();
    });

  } catch (error: any) {
    console.error('[Stream] Error:', error.message);
    if (!res.headersSent) {
      res.removeHeader('Content-Type');
      res.status(500).json({ error: 'Failed to stream media', details: error.message || String(error) });
    }
  }
});

/**
 * Audio Cache Directory Setup
 */
const AUDIO_CACHE_DIR = path.join(process.cwd(), 'cache', 'audio');
if (!fs.existsSync(AUDIO_CACHE_DIR)) {
  fs.mkdirSync(AUDIO_CACHE_DIR, { recursive: true });
}

// Track in-progress downloads to prevent duplicate concurrent network fetches
const activeDownloads = new Map<string, Promise<boolean>>();

async function cacheAudioFile(id: string, confirmParam: string): Promise<boolean> {
  const dataFile = path.join(AUDIO_CACHE_DIR, `${id}.data`);
  const metaFile = path.join(AUDIO_CACHE_DIR, `${id}.meta.json`);

  if (fs.existsSync(dataFile) && fs.existsSync(metaFile)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      const stat = fs.statSync(dataFile);
      if (meta.contentLength && stat.size === meta.contentLength && stat.size > 0) {
        return true;
      }
    } catch {
      // Continue to re-cache
    }
  }

  if (activeDownloads.has(id)) {
    return await activeDownloads.get(id)!;
  }

  const downloadPromise = (async () => {
    try {
      console.log(`[Audio Cache] Starting background cache download for ${id}...`);
      const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download${confirmParam}`;
      const driveRes = await fetch(driveUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
      });

      if (!driveRes.ok || !driveRes.body) {
        console.error(`[Audio Cache] Failed to fetch ${id}: status ${driveRes.status}`);
        return false;
      }

      const contentType = driveRes.headers.get('content-type') || 'audio/wav';
      const contentLengthHeader = driveRes.headers.get('content-length');
      const expectedLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;

      const tempFile = path.join(AUDIO_CACHE_DIR, `${id}.tmp_${Date.now()}`);
      const fileStream = fs.createWriteStream(tempFile);

      // @ts-ignore
      const nodeStream = require('stream').Readable.fromWeb(driveRes.body);

      await new Promise<void>((resolve, reject) => {
        nodeStream.pipe(fileStream);
        fileStream.on('finish', () => resolve());
        fileStream.on('error', reject);
        nodeStream.on('error', reject);
      });

      const actualStat = fs.statSync(tempFile);
      fs.renameSync(tempFile, dataFile);
      fs.writeFileSync(metaFile, JSON.stringify({
        contentType,
        contentLength: actualStat.size || expectedLength,
        cachedAt: new Date().toISOString()
      }));

      console.log(`[Audio Cache] Finished caching ${id} (${actualStat.size} bytes)`);
      return true;
    } catch (err: any) {
      console.error(`[Audio Cache] Error caching ${id}:`, err.message);
      return false;
    } finally {
      activeDownloads.delete(id);
    }
  })();

  activeDownloads.set(id, downloadPromise);
  return await downloadPromise;
}

/**
 * Google Drive Audio Proxy & Cache
 * - Automatically caches downloaded audio on disk for sub-5ms instant response.
 * - Supports prefetching adjacent tracks ahead of time.
 * - Supports HTTP 206 Range requests for seeking and fast buffering.
 * 
 * GET /api/download/drive-audio?id=GOOGLE_DRIVE_FILE_ID&confirm=t&prefetch=true
 */
router.get('/drive-audio', async (req, res) => {
  const { id, confirm, prefetch } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Google Drive ID is required' });
    return;
  }

  const confirmParam = confirm ? `&confirm=${confirm}` : '';
  const dataFile = path.join(AUDIO_CACHE_DIR, `${id}.data`);
  const metaFile = path.join(AUDIO_CACHE_DIR, `${id}.meta.json`);

  // Check if file is already fully cached on disk
  let isCached = false;
  let meta: any = null;
  if (fs.existsSync(dataFile) && fs.existsSync(metaFile)) {
    try {
      meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
      const stat = fs.statSync(dataFile);
      if (meta.contentLength && stat.size === meta.contentLength && stat.size > 0) {
        isCached = true;
      }
    } catch {
      isCached = false;
    }
  }

  // Handle Prefetch Request (sent by queue prefetcher)
  if (prefetch === 'true') {
    if (isCached) {
      res.json({ cached: true, instant: true });
      return;
    }
    // Launch background caching without waiting
    cacheAudioFile(id, confirmParam).catch(() => {});
    res.json({ prefetching: true, message: 'Prefetch initiated' });
    return;
  }

  // ================= Cache HIT: Serve from local disk instantly (<5ms) =================
  if (isCached && meta) {
    const stat = fs.statSync(dataFile);
    const totalSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', meta.contentType || 'audio/wav');
    res.setHeader('X-Cache-Status', 'HIT');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = (end - start) + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Content-Length': chunkSize,
      });

      const stream = fs.createReadStream(dataFile, { start, end });
      stream.pipe(res);
      req.on('close', () => stream.destroy());
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
      });
      const stream = fs.createReadStream(dataFile);
      stream.pipe(res);
      req.on('close', () => stream.destroy());
    }
    return;
  }

  // ================= Cache MISS: Stream directly from Drive & cache simultaneously =================
  // Trigger cache download in background for next time
  cacheAudioFile(id, confirmParam).catch(() => {});

  try {
    const driveUrl = `https://drive.usercontent.google.com/download?id=${id}&export=download${confirmParam}`;
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    };

    if (req.headers.range) {
      headers['Range'] = req.headers.range;
    }

    const driveRes = await fetch(driveUrl, { headers });

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('X-Cache-Status', 'MISS');

    const contentType = driveRes.headers.get('content-type') || 'audio/wav';
    res.setHeader('Content-Type', contentType);

    const contentLength = driveRes.headers.get('content-length');
    if (contentLength) {
      res.setHeader('Content-Length', contentLength);
    }

    const contentRange = driveRes.headers.get('content-range');
    if (contentRange) {
      res.setHeader('Content-Range', contentRange);
    }

    res.status(driveRes.status);

    if (!driveRes.body) {
      res.end();
      return;
    }

    // @ts-ignore
    const nodeStream = require('stream').Readable.fromWeb(driveRes.body);
    nodeStream.pipe(res);

    req.on('close', () => {
      nodeStream.destroy();
    });
  } catch (error: any) {
    console.error('[Drive Audio] Error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to stream audio', details: error.message || String(error) });
    }
  }
});

export default router;

