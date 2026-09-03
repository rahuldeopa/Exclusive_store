import { Router } from 'express';
import youtubedl from 'youtube-dl-exec';
import ffmpegPath from 'ffmpeg-static';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import fs from 'fs';

const router = Router();

router.get('/youtube', async (req, res) => {
  const { id, type } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'YouTube ID is required' });
    return;
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const isAudio = type === 'audio';

  try {
    let cookiesPath: string | undefined;
    if (process.env.YOUTUBE_COOKIES) {
      cookiesPath = path.join(os.tmpdir(), `youtube-cookies-${randomUUID()}.txt`);
      fs.writeFileSync(cookiesPath, process.env.YOUTUBE_COOKIES.replace(/\\n/g, '\n'));
    }

    let title = 'media';
    try {
      const infoOpts: any = {
        dumpSingleJson: true,
        noCheckCertificates: true,
        noWarnings: true,
        preferFreeFormats: true,
      };
      
      if (cookiesPath) {
        infoOpts.cookies = cookiesPath;
      } else {
        infoOpts.extractorArgs = 'youtube:player_client=ios,android';
      }

      const info = await youtubedl(url, infoOpts);
      if (info && (info as any).title) {
        title = (info as any).title.replace(/[^\w\s-]/gi, '_').trim();
      }
    } catch (e) {
      console.warn('Failed to fetch title', e);
    }

    const ext = isAudio ? 'wav' : 'mp4';
    const filename = `${title}_${type}.${ext}`;
    
    const tempFilePath = path.join(os.tmpdir(), `${randomUUID()}.${ext}`);

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', isAudio ? 'audio/wav' : 'video/mp4');

    const options: any = {
      f: isAudio ? 'bestaudio' : 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
      output: tempFilePath,
      ffmpegLocation: ffmpegPath || undefined,
      noWarnings: true,
    };

    if (cookiesPath) {
      options.cookies = cookiesPath;
    } else {
      options.extractorArgs = 'youtube:player_client=ios,android';
    }

    if (isAudio) {
      options.x = true;
      options.audioFormat = 'wav';
    }

    await youtubedl(url, options);

    const stream = fs.createReadStream(tempFilePath);
    stream.pipe(res);
    
    stream.on('end', () => {
      fs.unlink(tempFilePath, (err) => {
        if (err) console.error('Failed to delete temp file:', err);
      });
    });
    
    stream.on('error', (err) => {
      console.error('Stream read error:', err);
      fs.unlink(tempFilePath, () => {});
      if (!res.headersSent) res.status(500).end();
    });

    req.on('close', () => {
      stream.destroy();
      fs.unlink(tempFilePath, () => {});
      if (cookiesPath) fs.unlink(cookiesPath, () => {});
    });

    stream.on('end', () => {
      if (cookiesPath) fs.unlink(cookiesPath, () => {});
    });

  } catch (error: any) {
    console.error('Error downloading YouTube media:', error);
    if (!res.headersSent) {
      res.removeHeader('Content-Disposition');
      res.removeHeader('Content-Type');
      res.status(500).json({ error: 'Failed to download media', details: error.message || String(error) });
    }
  }
});

router.get('/stream', async (req, res) => {
  const { id } = req.query;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'YouTube ID is required' });
    return;
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  
  try {
    const ext = 'mp4';
    const tempFilePath = path.join(os.tmpdir(), `yt_cache_${id}.${ext}`);

    // Check if we already downloaded this video recently to support rapid seeking
    if (!fs.existsSync(tempFilePath)) {
      console.log(`Downloading ${id} for streaming cache...`);
      
      let cookiesPath: string | undefined;
      if (process.env.YOUTUBE_COOKIES) {
        cookiesPath = path.join(os.tmpdir(), `youtube-cookies-${randomUUID()}.txt`);
        fs.writeFileSync(cookiesPath, process.env.YOUTUBE_COOKIES.replace(/\\n/g, '\n'));
      }

      const options: any = {
        f: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best',
        output: tempFilePath,
        ffmpegLocation: ffmpegPath || undefined,
        noWarnings: true,
      };

      if (cookiesPath) {
        options.cookies = cookiesPath;
      } else {
        options.extractorArgs = 'youtube:player_client=ios,android';
      }

      await youtubedl(url, options);
      
      if (cookiesPath) fs.unlink(cookiesPath, () => {});
      
      // Auto-delete the cache file after 1 hour to prevent disk space issues
      setTimeout(() => {
        fs.unlink(tempFilePath, () => console.log(`Cleared cache for ${id}`));
      }, 60 * 60 * 1000); 
    } else {
      console.log(`Serving ${id} from streaming cache...`);
    }

    res.setHeader('Content-Type', 'video/mp4');
    
    // Using sendFile enables Express to handle Range requests for seeking automatically!
    res.sendFile(tempFilePath);
    
  } catch (error: any) {
    console.error('Error streaming YouTube media:', error);
    if (!res.headersSent) {
      res.removeHeader('Content-Type');
      res.status(500).json({ error: 'Failed to stream media', details: error.message || String(error) });
    }
  }
});

export default router;
