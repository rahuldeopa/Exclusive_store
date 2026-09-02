const https = require('https');

const tracks = [
    { num: 1, title: 'Jah Light in my Soul', youtubeId: '-ImqIW1tJ1A' },
    { num: 2, title: 'Elevation', youtubeId: 'k2kFvuuOCZs' },
    { num: 3, title: 'Master Sculpture', youtubeId: 'K5JlMyLrR9o' },
    { num: 4, title: 'Lift My Hands', youtubeId: '8eCmIU392L4' },
    { num: 5, title: 'Ride with God', youtubeId: '97cxQm5Arj4' },
    { num: 6, title: 'Lessons from the Storm', youtubeId: 'lFi1WiPcpy0' },
    { num: 7, title: 'Blessings on the Way', youtubeId: 'RRPv3dPMHL0' },
    { num: 8, title: 'Worth more', youtubeId: '2OXwAEdiOSc' },
    { num: 9, title: 'Net Worth', youtubeId: 'FjpUIHgRrDc' },
    { num: 10, title: 'Real Friends', youtubeId: '7cNq-GVlw6E' },
    { num: 11, title: 'Mask off', youtubeId: 'M4kqqcu4dOQ' },
    { num: 12, title: 'Blessings on the Way (remix)', youtubeId: 'IzGX936iX1o' }
];

async function getDuration(id) {
    return new Promise((resolve, reject) => {
        https.get(`https://www.youtube.com/watch?v=${id}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/"lengthSeconds":"(\d+)"/);
                if (match && match[1]) {
                    const secs = parseInt(match[1]);
                    const mins = Math.floor(secs / 60);
                    const remSecs = secs % 60;
                    resolve(`${mins}:${remSecs.toString().padStart(2, '0')}`);
                } else {
                    resolve('3:45'); // fallback
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    for (let t of tracks) {
        const dur = await getDuration(t.youtubeId);
        console.log(`Track ${t.num}: ${dur}`);
    }
}
run();
