const fs = require('fs');
const path = require('path');
const https = require('https');

const dest = path.join(__dirname, '../node_modules/youtube-dl-exec/bin/yt-dlp');

console.log('Downloading statically compiled yt-dlp_linux to replace the python-dependent one...');

// Ensure directory exists
const dir = path.dirname(dest);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = fs.createWriteStream(dest);

function download(url) {
  https.get(url, (response) => {
    if (response.statusCode === 302 || response.statusCode === 301) {
      download(response.headers.location);
    } else if (response.statusCode === 200) {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        fs.chmodSync(dest, '755');
        console.log('yt-dlp_linux successfully downloaded and permissions set!');
      });
    } else {
      console.error('Failed to download yt-dlp_linux, status code:', response.statusCode);
      file.close();
      fs.unlink(dest, () => {});
    }
  }).on('error', (err) => {
    fs.unlink(dest, () => {});
    console.error('Error downloading yt-dlp_linux:', err.message);
  });
}

// Download the linux standalone binary
download('https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux');
