const { Innertube } = require('youtubei.js');

async function test() {
  const yt = await Innertube.create();
  const info = await yt.getBasicInfo('-ImqIW1tJ1A');
  
  console.log('Title:', info.basic_info.title);
  console.log('Muxed formats:', info.streaming_data?.formats?.length || 0);
  console.log('Adaptive formats:', info.streaming_data?.adaptive_formats?.length || 0);
  
  console.log('\n--- MUXED (video+audio) ---');
  const muxed = info.streaming_data?.formats || [];
  muxed.forEach(f => {
    console.log('  ' + (f.quality_label || '?') + ' | ' + (f.mime_type || '').split(';')[0] + ' | ' + f.width + 'x' + f.height + ' | bitrate:' + f.bitrate);
  });
  
  console.log('\n--- AUDIO-ONLY (adaptive) ---');
  const audio = (info.streaming_data?.adaptive_formats || []).filter(f => f.mime_type && f.mime_type.startsWith('audio'));
  audio.forEach(f => {
    console.log('  ' + (f.mime_type || '').split(';')[0] + ' | bitrate:' + f.bitrate + ' | ' + (f.audio_quality || '?'));
  });
  
  console.log('\n--- VIDEO-ONLY (adaptive, top 5) ---');
  const video = (info.streaming_data?.adaptive_formats || []).filter(f => f.mime_type && f.mime_type.startsWith('video'));
  video.sort((a, b) => (b.height || 0) - (a.height || 0));
  video.slice(0, 5).forEach(f => {
    console.log('  ' + (f.quality_label || '?') + ' | ' + (f.mime_type || '').split(';')[0] + ' | ' + f.width + 'x' + f.height + ' | bitrate:' + f.bitrate);
  });
}

test().catch(e => console.error('ERROR:', e.message));
