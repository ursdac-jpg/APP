'use strict';
/* ============================================================
   scripts/importRome/echantillonPhrasesCV.js
   Produit la feuille d'échantillon que Denis relit : 100 phrases tirées au hasard (tirage fixe) parmi celles que la personne pourra cocher
   pour son CV (50 missions, 30 compétences, 20 phrases réécrites à la main).
     node scripts/importRome/echantillonPhrasesCV.js [graine]
   Écrit docs/ECHANTILLON_PHRASES_CV.md (à relire, puis à renommer avec la date du jour si on le garde).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const PCV = require('./phrasesCV.js');

const racine = path.join(__dirname, '..', '..');
const fiches = {};
'ABCDEFGHIJKLMN'.split('').forEach((l) => { Object.assign(fiches, require(path.join(racine, 'data', 'rome', 'fiche_' + l + '.js')).FICHES_ROME_LETTRE); });
const corrections = JSON.parse(fs.readFileSync(PCV.FICHIER_CORRECTIONS, 'utf8'));
const relues = new Set();
Object.keys(corrections).forEach((k) => { [].concat(corrections[k]).forEach((v) => relues.add(PCV.orthographe(v))); });

let graine = Number(process.argv[2]) || 20261114;
const hasard = () => { graine = (graine * 1103515245 + 12345) % 2147483648; return graine / 2147483648; };
const codes = Object.keys(fiches).filter((c) => fiches[c].mi && fiches[c].k).sort();
function tirer(n, extraire) {
  const sortie = [], vu = new Set();
  let garde = 0;
  while (sortie.length < n && garde++ < 100000) {
    const c = codes[Math.floor(hasard() * codes.length)];
    const p = extraire(fiches[c]);
    if (!p || vu.has(p)) { continue; }
    vu.add(p); sortie.push([c, p]);
  }
  return sortie;
}
const missions = tirer(50, (e) => e.mi[Math.floor(hasard() * e.mi.length)]);
const competences = tirer(30, (e) => { const g = e.k[Math.floor(hasard() * e.k.length)]; return g[2][Math.floor(hasard() * g[2].length)]; });
const reecrites = tirer(20, (e) => { const l = e.mi.filter((x) => relues.has(x)); return l.length ? l[Math.floor(hasard() * l.length)] : null; });
const nom = (c) => (fiches[c].n && fiches[c].n[0]) || '';
const ligne = (x, i) => (i + 1) + '. **' + x[0] + '**' + (nom(x[0]) ? ' (' + nom(x[0]) + ')' : '') + ' : ' + x[1];

const texte = '# Échantillon de 100 phrases du CV à relire\n\n' +
  'Voici 100 phrases tirées au hasard parmi celles que la personne pourra cocher pour son CV : 50 missions, 30 compétences, 20 phrases réécrites à la main. Le tirage est fixe : en relançant la génération, vous retrouvez les mêmes numéros.\n\n' +
  'Pour chaque phrase, trois questions : est-elle bien écrite et à l’infinitif ? Le sens est-il fidèle à un métier réel ? Pourriez-vous la voir telle quelle sur votre CV ? Notez simplement les numéros à revoir.\n\n' +
  '## 50 missions\n\n' + missions.map(ligne).join('\n') +
  '\n\n## 30 compétences\n\n' + competences.map((x, i) => ligne(x, i + 50)).join('\n') +
  '\n\n## 20 phrases réécrites à la main\n\n' + reecrites.map((x, i) => ligne(x, i + 80)).join('\n') + '\n';
if (/[—–]/.test(texte)) { throw new Error('tiret long dans l’échantillon'); }
fs.writeFileSync(path.join(racine, 'docs', 'ECHANTILLON_PHRASES_CV.md'), texte);
console.log('Échantillon écrit : ' + missions.length + ' missions, ' + competences.length + ' compétences, ' + reecrites.length + ' phrases réécrites');
