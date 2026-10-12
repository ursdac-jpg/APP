'use strict';
// Maquette « avant / après » d'un modèle enrichi (chantier variété) : montre la miniature enregistrée dans le dernier commit (avant) et celle du dossier de travail (après),
// à côté du modèle proche qui a motivé l'enrichissement. Fichier HTML autonome, à ouvrir dans un navigateur.
// Usage : node scripts/rendu/maquette_avant_apres.js <cle> <cle du voisin> <fichier de sortie> "<titre>" "<ce qui change>"
//   exemple : node scripts/rendu/maquette_avant_apres.js creatif:colonneBandeau creatif:colonneFoncee docs/MAQUETTE_X.html "Colonne et bandeau" "La colonne devient pâle"
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const racine = path.join(__dirname, '..', '..');
const [cle, voisin, sortie, titre, change] = process.argv.slice(2);
const nomFichier = (c) => 'data/miniatures/' + c.replace(':', '_') + '.json';
const apres = (c) => JSON.parse(fs.readFileSync(path.join(racine, nomFichier(c)), 'utf8'));
const avant = (c) => JSON.parse(execFileSync('git', ['show', 'HEAD:' + nomFichier(c)], { cwd: racine, encoding: 'utf8', maxBuffer: 20e6 }));
const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
function feuille(d, largeur) {
  const echelle = largeur / 794;
  return '<div class="cadre" style="width:' + largeur + 'px;height:' + Math.round(largeur * 1123 / 794) + 'px"><template shadowrootmode="open"><style>:host{all:initial;display:block;position:relative;overflow:hidden;width:' + largeur + 'px;height:' + Math.round(largeur * 1123 / 794) + 'px;background:#fff}' +
    '.ech{position:absolute;top:0;left:0;width:794px;transform-origin:0 0;transform:scale(' + echelle + ');}' + d.css + '</style><div class="ech">' + d.html + '</div></template></div>';
}
const vignette = (d, leg, expl) => '<figure>' + feuille(d, 250) + '<figcaption><b>' + echapper(leg) + '</b><br>' + echapper(expl) + '</figcaption></figure>';
const a = avant(cle), b = apres(cle), v = apres(voisin);
const html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + echapper(titre) + ' enrichi</title><style>' +
  ':root{--fond:#f4f6f9;--texte:#1c2430;--discret:#5b6675;--bord:#cfd6df}@media (prefers-color-scheme:dark){:root{--fond:#161a20;--texte:#e8ecf1;--discret:#a3adba;--bord:#3a4452}}' +
  'body{font:15px/1.5 system-ui,sans-serif;background:var(--fond);color:var(--texte);margin:0;padding:24px 16px}h1{font-size:20px;margin:0 0 6px}p{color:var(--discret);margin:0 0 18px;max-width:46em}' +
  '.rang{display:flex;gap:18px;flex-wrap:wrap}figure{margin:0;width:250px}.cadre{border:1px solid var(--bord);border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.12)}figcaption{font-size:13px;color:var(--discret);margin-top:8px}figcaption b{color:var(--texte)}' +
  '</style></head><body><h1>' + echapper(titre) + ' : avant et après</h1><p>' + echapper(change) + ' Le modèle proche est montré à droite pour comparer.</p><div class="rang">' +
  vignette(a, 'Avant', 'Le modèle tel qu’il était.') + vignette(b, 'Après', 'Le modèle enrichi.') + vignette(v, 'Modèle proche : ' + v.nom, 'Celui dont il se rapprochait.') + '</div></body></html>';
fs.writeFileSync(path.join(racine, sortie), html);
console.log('maquette écrite : ' + sortie);
