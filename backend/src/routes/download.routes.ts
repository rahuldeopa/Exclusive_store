import { Router } from 'express';

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
      .filter(f => f.mime_type && f.mime_type.startsWith('audio'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));

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
      .filter(f => f.has_video && f.has_audio)
      .sort((a, b) => (b.height || 0) - (a.height || 0));

    let format = muxed[0];
    
    // Fallback to video-only if no muxed format is available
    if (!format) {
      const videos = (info.streaming_data?.adaptive_formats || [])
        .filter(f => f.mime_type && f.mime_type.startsWith('video'))
        .sort((a, b) => (b.height || 0) - (a.height || 0));
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

export default router;
