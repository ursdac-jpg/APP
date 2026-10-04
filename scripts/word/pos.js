// Positions brutes d'un mot (premier trouve) : navigateur (px) et Word (px = points / 0,75). Usage : node scripts/word/pos.js <dossier> <nom> mot1 mot2 ...
const fs = require('fs'), path = require('path');
const [, , d, nom, ...mots] = process.argv;
const lire = (f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8').replace(/^\uFEFF/, ''));
const n = lire(nom + '.mots.json'), w = lire(nom + '.word.json');
for (const t of mots) {
  const a = n.find((m) => (Array.isArray(m) ? m[0] : m.t) === t), b = w.mots.find((m) => m.t === t);
  const ax = a && (Array.isArray(a) ? a[1] : a.x), ay = a && (Array.isArray(a) ? a[2] : a.y);
  console.log(t.padEnd(16), 'nav x=' + (ax !== undefined ? ax.toFixed(1) : '-'), 'y=' + (ay !== undefined ? ay.toFixed(1) : '-'), '| word x=' + (b ? (b.x / 0.75).toFixed(1) : '-'), 'y=' + (b ? (b.y / 0.75).toFixed(1) : '-'));
}
