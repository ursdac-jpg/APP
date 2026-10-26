// Vérifie que chaque règle de l'inventaire figure dans un fichier de prompt de la lettre.
// Usage : node scripts/lettreInventaire/verifier.js <fichier> [coupe]
// « coupe » : ignore le profil et le CV ajoutés en bas d'un fichier d'essai.
const fs = require('fs');
const regles = require('./inventaire.js');
function norm(s) { return s.toLowerCase().replace(/[’]/g, "'").replace(/\u00a0/g, ' '); }
function verifier(chemin, coupeProfil) {
  let t = fs.readFileSync(chemin, 'utf8');
  if (coupeProfil) { const i = t.indexOf('CONTEXTE DE LA CANDIDATURE\n- Objectif'); if (i > 0) t = t.slice(0, i); }
  const n = norm(t);
  const manquantes = regles.filter(r => !r[2].split('|').some(m => n.includes(norm(m))));
  return { longueur: t.length, total: regles.length, manquantes };
}
const [, , chemin, coupe] = process.argv;
if (!chemin) { console.log('Usage : node scripts/lettreInventaire/verifier.js <fichier> [coupe]'); process.exit(2); }
const r = verifier(chemin, coupe === 'coupe');
console.log(chemin.split(/[\/]/).pop(), '| caracteres:', r.longueur, '| regles:', r.total, '| manquantes:', r.manquantes.length);
r.manquantes.forEach(m => console.log('  MANQUE', m[0], '-', m[1], '<<', m[2], '>>'));
process.exit(r.manquantes.length ? 1 : 0);
