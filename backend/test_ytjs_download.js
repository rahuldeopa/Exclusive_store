const { Innertube, streamToIterable } = require('youtubei.js');
const fs = require('fs');

async function testDownload() {
  const yt = await Innertube.create();
  
  console.log('Fetching info...');
  
  try {
    // Attempt to download video+audio
    console.log('Attempting to download video+audio stream...');
    const stream = await yt.download('-ImqIW1tJ1A', {
      type: 'video+audio',
      quality: 'best'
    });
    
    console.log('Stream created successfully! Writing 1MB to test...');
    let bytes = 0;
    for await (const chunk of streamToIterable(stream)) {
      bytes += chunk.length;
      if (bytes > 1024 * 1024) break; // just test if we get data
    }
    console.log(`Success! Got ${bytes} bytes of muxed data.`);
  } catch (err) {
    console.error('Download video+audio failed:', err.message);
  }
}

testDownload().catch(console.error);
