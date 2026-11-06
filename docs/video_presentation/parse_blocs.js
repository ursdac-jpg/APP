const fs = require('fs');
const [,, src, out] = process.argv;
const t = fs.readFileSync(src, 'utf8').split(/\r?\n/);
const i0 = t.findIndex(l => l.startsWith('## Texte à lire'));
let plan = 0; const blocs = [];
for (const l of t.slice(i0 + 1)) {
  if (/^## /.test(l)) break;
  let m = l.match(/^\*\*Plan (\d+)\*\*/); if (m) { plan = +m[1]; continue; }
  m = l.match(/^(\d+)\. (.+)$/); if (m && plan) {
    const aff = m[2].replace(/ \/ /g, '\n');
    blocs.push({ plan, n: +m[1], id: 'p' + plan + '_' + String(m[1]).padStart(2, '0'), sous_titre: aff, voix: m[2].replace(/ \/ /g, ' ') });
  }
}
fs.writeFileSync(out, JSON.stringify(blocs, null, 1));
console.log(blocs.length + ' blocs');
