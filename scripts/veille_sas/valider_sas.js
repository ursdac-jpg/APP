// Contrôle de forme du sas des employeurs (mêmes règles que l'application, sauf « sans date de vérification », normal dans un sas).
// Usage : node scripts/veille_sas/valider_sas.js   -> affiche le nombre de fiches et les erreurs.
const fs = require('fs'), path = require('path');
const R = path.join(__dirname, '..', '..');
const L = require(path.join(R, 'modules/mon-territoire/logique.js'));
const T = require(path.join(R, 'outils/veilleTerritoire.js'));
const lignes = fs.readFileSync(path.join(R, 'outils/sas/employeurs.sas.txt'), 'utf8').split(/\r?\n/).filter(x => x.trim() && x[0] !== '#');
const date = new Date().toISOString().slice(0, 10);
const erreurs = L.mtVerifierEmployeurs(lignes.join('\n'), T.contexteDepuis(R, date)).filter(x => !/sans date de vérification/.test(x));
console.log(lignes.length + ' fiches ; ' + erreurs.length + ' erreur(s)');
if (erreurs.length) { console.log(erreurs.join('\n')); process.exit(1); }
