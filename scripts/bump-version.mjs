// Versiyani bir joyda oshiradi: js/version.js, version.json va sw.js bir xil bo'ladi.
// Ishlatish: node scripts/bump-version.mjs        (keyingi raqam)   yoki   node scripts/bump-version.mjs 20
import fs from 'fs';
const root = new URL('../', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const cur = +(fs.readFileSync(root + 'js/version.js', 'utf8').match(/bio-v(\d+)/)?.[1] || 0), next = +process.argv[2] || cur + 1, id = 'bio-v' + next;
fs.writeFileSync(root + 'js/version.js', fs.readFileSync(root + 'js/version.js', 'utf8').replace(/bio-v\d+/, id));
fs.writeFileSync(root + 'version.json', JSON.stringify({ v: id }) + '\n');
fs.writeFileSync(root + 'sw.js', fs.readFileSync(root + 'sw.js', 'utf8').replace(/const VER = 'bio-v\d+'/, `const VER = '${id}'`));
console.log('Versiya:', id);
