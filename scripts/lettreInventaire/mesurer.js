// Mesure une lettre finale (paragraphes séparés par une ligne vide) : mots par paragraphe, total,
// groupes de trois mots répétés d'un paragraphe à l'autre, nombre de mentions de noms donnés.
// Usage : node scripts/lettreInventaire/mesurer.js <fichier> [nom1 nom2 ...]
const fs = require('fs');
const [, , chemin, ...noms] = process.argv;
if (!chemin) { console.log('Usage : node scripts/lettreInventaire/mesurer.js <fichier> [noms...]'); process.exit(2); }
const t = fs.readFileSync(chemin, 'utf8').replace(/\r/g, '').trim();
const paras = t.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean);
const mots = s => s.split(/\s+/).filter(Boolean);
const norm = s => s.toLowerCase().replace(/[’]/g, "'").replace(/[.,;:!?()«»"]/g, ' ');
let total = 0;
paras.forEach((p, i) => { const n = mots(p).length; total += n; console.log('paragraphe ' + (i + 1) + ' : ' + n + ' mots'); });
console.log('TOTAL : ' + total + ' mots');
const vide = new Set(['de', 'la', 'le', 'les', 'des', 'du', 'un', 'une', 'et', 'en', 'à', 'a', 'au', 'aux', 'je', 'j\'', 'mon', 'ma', 'mes', 'vous', 'votre', 'vos', 'pour', 'dans', 'sur', 'que', 'qui', 'ce', 'cette', 'd\'', 'l\'']);
const tri = new Map();
paras.forEach((p, i) => {
  const w = mots(norm(p)).filter(Boolean);
  for (let k = 0; k + 2 < w.length; k++) {
    const g = w.slice(k, k + 3);
    if (g.filter(x => !vide.has(x)).length < 2) continue;
    const cle = g.join(' ');
    if (!tri.has(cle)) tri.set(cle, new Set());
    tri.get(cle).add(i + 1);
  }
});
const rep = [...tri].filter(([, s]) => s.size > 1);
console.log('groupes de 3 mots présents dans plusieurs paragraphes : ' + rep.length);
rep.forEach(([g, s]) => console.log('  « ' + g + ' » : paragraphes ' + [...s].join(', ')));
noms.forEach(n => console.log('mentions de ' + n + ' : ' + (norm(t).match(new RegExp(norm(n).trim(), 'g')) || []).length));
const motifs = ['nouvelles technologies', 'systèmes et réseaux', 'maintenance informatique', 'je souhaite', 'fonctionnement', 'autonom'];
motifs.forEach(m => { const c = (norm(t).match(new RegExp(m, 'g')) || []).length; if (c > 1) console.log('motif « ' + m + ' » : ' + c + ' fois'); });
