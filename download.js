import fs from 'fs';
import path from 'path';

async function download(url, filename) {
  console.log(`Downloading ${url} to ${filename}...`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const buffer = await response.arrayBuffer();
  fs.writeFileSync(filename, Buffer.from(buffer));
}

(async () => {
  fs.mkdirSync('public', { recursive: true });
  await download('https://1000logos.net/wp-content/uploads/2018/01/Wharton-logo.png', 'public/wharton.png');
  await download('https://www.rwandajob.com/sites/rwandajob.com/files/logo/cmu.png', 'public/cmu.png');
  await download('https://d2lk14jtvqry1q.cloudfront.net/media/small_Harvard_Business_school_38878553f3_b074adb226_995c02a75c_73f2f72714.png', 'public/hbs.png');
  console.log('Done!');
})();
