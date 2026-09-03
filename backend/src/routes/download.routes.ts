import { Router } from 'express';
import ytdl from '@distube/ytdl-core';
import path from 'path';
import os from 'os';
import { randomUUID } from 'crypto';
import fs from 'fs';

const router = Router();

// Create an agent using mobile clients to bypass YouTube's strict data center bot checks
const agent = ytdl.createAgent(undefined, {
  clients: ['ANDROID', 'IOS']
} as any);

router.get('/youtube', async (req, res) => {
  const { id, type } = req.query;

  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'YouTube ID is required' });
    return;
  }

  const url = `https://www.youtube.com/watch?v=${id}`;
  const isAudio = type === 'audio';

  try {
    const info = await ytdl.getInfo(url, { agent });
    const title = info.videoDetails.title.replace(/[^\w\s-]/gi, '_').trim();
    
    const ext = isAudio ? 'mp3' : 'mp4';
    const filename = `${title}_${type}.${ext}`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', isAudio ? 'audio/mpeg' : 'video/mp4');

    const format = ytdl.chooseFormat(info.formats, { 
      quality: isAudio ? 'highestaudio' : 'highest',
      filter: isAudio ? 'audioonly' : 'audioandvideo'
    });

    const stream = ytdl(url, { format, agent });
    stream.pipe(res);

    stream.on('error', (err: any) => {
      console.error('Stream read error:', err);
      if (!res.headersSent) {
        res.removeHeader('Content-Disposition');
        res.removeHeader('Content-Type');
        res.status(500).json({ error: 'Failed to stream media', details: err.message || String(err) });
      } else {
        res.end();
      }
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

    if (!fs.existsSync(tempFilePath)) {
      console.log(`Downloading ${id} for streaming cache...`);
      const info = await ytdl.getInfo(url, { agent });
      const format = ytdl.chooseFormat(info.formats, { quality: 'highest', filter: 'audioandvideo' });
      
      await new Promise<void>((resolve, reject) => {
        const stream = ytdl(url, { format, agent });
        const writeStream = fs.createWriteStream(tempFilePath);
        stream.pipe(writeStream);
        writeStream.on('finish', () => resolve());
        stream.on('error', reject);
        writeStream.on('error', reject);
      });
      
      // Auto-delete the cache file after 1 hour
      setTimeout(() => {
        fs.unlink(tempFilePath, () => console.log(`Cleared cache for ${id}`));
      }, 60 * 60 * 1000); 
    } else {
      console.log(`Serving ${id} from streaming cache...`);
    }

    res.setHeader('Content-Type', 'video/mp4');
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
