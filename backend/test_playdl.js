const play = require('play-dl');

async function testPlay() {
  try {
    const info = await play.video_info('-ImqIW1tJ1A');
    console.log('Title:', info.video_details.title);
    
    console.log('\n--- MUXED (video+audio) ---');
    const muxed = info.format.filter(f => f.hasVideo && f.hasAudio);
    muxed.forEach(f => {
      console.log(`  ${f.qualityLabel} | ${f.mimeType.split(';')[0]} | bitrate:${f.bitrate}`);
    });
    
    console.log('\n--- AUDIO ONLY ---');
    const audio = info.format.filter(f => !f.hasVideo && f.hasAudio);
    audio.forEach(f => {
      console.log(`  ${f.mimeType.split(';')[0]} | bitrate:${f.bitrate}`);
    });
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testPlay().catch(console.error);
