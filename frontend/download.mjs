import fs from 'fs';
import https from 'https';

const url = "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzIwZWE4NjJiZDY5NzRlZjhiM2E0NjMzNzI5NDllZmUyEgsSBxD42oz_qBsYAZIBJAoKcHJvamVjdF9pZBIWQhQxMDM5MjQyODMzNzE0MTQ2MjExNw&filename=&opi=89354086";

https.get(url, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('screen.html', data);
    console.log('done');
  });
}).on('error', (err) => {
  console.error(err);
});
