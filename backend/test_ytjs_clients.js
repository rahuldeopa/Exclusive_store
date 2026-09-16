const { Innertube } = require('youtubei.js');

async function test() {
  const clients = ['WEB', 'ANDROID', 'IOS', 'TV_EMBEDDED'];
  
  for (const client of clients) {
    try {
      console.log(`\nTesting client: ${client}`);
      const yt = await Innertube.create({ retrieve_player: false });
      const info = await yt.getBasicInfo('-ImqIW1tJ1A', client);
      
      console.log('Title:', info.basic_info.title);
      console.log('Muxed formats:', info.streaming_data?.formats?.length || 0);
      
      const muxed = info.streaming_data?.formats || [];
      muxed.forEach(f => {
        console.log('  ' + (f.quality_label || '?') + ' | ' + (f.mime_type || '').split(';')[0] + ' | ' + f.width + 'x' + f.height + ' | bitrate:' + f.bitrate);
      });
    } catch (err) {
      console.error('Error with', client, err.message);
    }
  }
}

test().catch(e => console.error('ERROR:', e.message));
