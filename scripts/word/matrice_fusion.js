// Fusionne un NOUVEAU fichier de reglages « sans effet » (issu de matrice_rapport.js sur une matrice mesuree APRES le grisage) dans le fichier de donnees
// existant modules/cv-pdf-html/cvPdfOptionsParModele.js, sans rien retirer. Un inventaire fait apres le grisage ne voit plus les reglages deja grises :
// regenerer le fichier depuis lui effacerait le grisage existant, d'ou cette fusion (2026-10-01).
// Usage : node scripts/word/matrice_fusion.js <nouveau.js> [date AAAA-MM-JJ]
const fs = require('fs');
const path = require('path');
const [, , nouveau, date] = process.argv;
const cible = path.join(__dirname, '..', '..', 'modules', 'cv-pdf-html', 'cvPdfOptionsParModele.js');
const lire = (f) => {
  const txt = fs.readFileSync(f, 'utf8');
  const m = /var _MEP_SANS_EFFET_PAR_MODELE = (\{[\s\S]*\});\s*$/.exec(txt.replace(/\r\n/g, '\n'));
  if (!m) { throw new Error('format inconnu : ' + f); }
  return { txt: txt.replace(/\r\n/g, '\n'), objet: JSON.parse(m[1]) };
};
const ancien = lire(cible), neuf = lire(nouveau);
let ajoutes = 0;
Object.keys(neuf.objet).forEach((modele) => {
  const liste = ancien.objet[modele] = ancien.objet[modele] || [];
  neuf.objet[modele].forEach((id) => { if (liste.indexOf(id) === -1) { liste.push(id); ajoutes++; } });
});
const entete = ancien.txt.split('var _MEP_SANS_EFFET_PAR_MODELE')[0].replace(/inventaire du \d{4}-\d{2}-\d{2}/, 'inventaire du ' + (date || new Date().toISOString().slice(0, 10)) + ' (fusionne avec les precedents)');
const corps = 'var _MEP_SANS_EFFET_PAR_MODELE = {\n' + Object.keys(ancien.objet).map((m) => ' ' + JSON.stringify(m) + ': [\n' + ancien.objet[m].map((id) => '  ' + JSON.stringify(id)).join(',\n') + '\n ]').join(',\n') + '\n};\n';
fs.writeFileSync(cible, entete + corps);
console.log(JSON.stringify({ modeles: Object.keys(ancien.objet).length, ajoutes }));
