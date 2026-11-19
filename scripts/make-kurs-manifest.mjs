// kurs5/ papkasidagi fayllar ro'yxatini manifest.json ga yozadi. Ishga tushirish: node scripts/make-kurs-manifest.mjs
import { readdirSync, statSync, writeFileSync } from 'fs'; import { join, relative, sep } from 'path';
const root = 'kurs5', out = [];
const walk = d => { for (const n of readdirSync(d).sort()) { const p = join(d, n); statSync(p).isDirectory() ? walk(p) : n !== 'manifest.json' && out.push(relative(root, p).split(sep).join('/')); } };
walk(root); writeFileSync(join(root, 'manifest.json'), JSON.stringify({ files: out }, null, 1)); console.log(out.length, 'fayl');
