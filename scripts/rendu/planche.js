'use strict';
// Planche de comparaison des modèles de CV les plus proches (aide à la décision pour le chantier « variété »).
// Fabrique un fichier HTML autonome, à ouvrir dans un navigateur : docs/PLANCHE_MODELES_PROCHES.html
// Usage : node scripts/rendu/planche.js [seuil, 0 à 1, 0,9 par défaut]
// Les modèles sont ceux de data/miniatures/ (vrais rendus fabriqués par le banc) ; la ressemblance est celle de scripts/rendu/ressemblance.js.

const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const racine = path.join(__dirname, '..', '..');
const seuil = parseFloat(process.argv[2] || '0.9');
const sortie = execFileSync(process.execPath, [path.join(__dirname, 'ressemblance.js'), String(seuil)], { encoding: 'utf8' });

const paires = [];
sortie.split('\n').forEach((l) => {
  const m = /^\s*(\d+) %\s+(.+?) \((creatif|sobre)\)\s+\/\s+(.+?) \((creatif|sobre)\)\s*$/.exec(l);
  // un même modèle présent en Créatif et en Sobre (Photo et frise, Rectangles arrondis) est voulu : ce n'est pas un doublon
  if (m && m[2] !== m[4]) { paires.push({ s: +m[1], a: { nom: m[2], fam: m[3] }, b: { nom: m[4], fam: m[5] } }); }
});

const dossier = path.join(racine, 'data', 'miniatures');
const parNom = {};
fs.readdirSync(dossier).filter((f) => f.endsWith('.json')).forEach((f) => {
  const d = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
  parNom[d.cle] = d;
});
const trouver = (x) => parNom[x.fam + ':' + Object.keys(parNom).map((c) => c.split(':')[1]).find((id) => parNom[x.fam + ':' + id] && parNom[x.fam + ':' + id].nom === x.nom)];

const echapper = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
// Le HTML d'un modèle est enfermé dans un compartiment étanche (shadow root déclaratif) pour que les styles des modèles ne se mélangent pas.
function feuille(d, largeur) {
  const echelle = largeur / 794;
  return '<div class="cadre" style="width:' + largeur + 'px;height:' + Math.round(largeur * 1123 / 794) + 'px"><template shadowrootmode="open"><style>:host{all:initial;display:block;position:relative;overflow:hidden;}' +
    '.ech{position:absolute;top:0;left:0;width:794px;transform-origin:0 0;transform:scale(' + echelle + ');}' + d.css + '</style><div class="ech">' + d.html + '</div></template></div>';
}

let html = '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Modèles de CV proches</title><style>' +
  ':root{--fond:#f4f6f9;--carte:#fff;--texte:#1c2430;--discret:#5b6675;--bord:#cfd6df;--accent:#0d6efd}' +
  '@media (prefers-color-scheme:dark){:root{--fond:#161a20;--carte:#1f252d;--texte:#e8ecf1;--discret:#a3adba;--bord:#3a4452;--accent:#6ea8fe}}' +
  'body{margin:0;background:var(--fond);color:var(--texte);font:16px/1.45 "Segoe UI",system-ui,sans-serif;padding:1.2rem 16px 3rem}' +
  'h1{font-size:1.5rem;margin:0 0 .3rem}.sous{color:var(--discret);margin:0 0 1.5rem;max-width:46rem}' +
  '.paire{background:var(--carte);border:1px solid var(--bord);border-radius:14px;padding:1rem 1.1rem 1.2rem;margin:0 0 1.4rem;max-width:44rem}' +
  '.paire h2{font-size:1.1rem;margin:0 0 .15rem}.score{color:var(--discret);font-size:.9rem;margin:0 0 .8rem}' +
  '.duo{display:flex;gap:1rem;flex-wrap:wrap}.modele{text-align:center}.modele b{display:block;margin-top:.4rem;font-size:.95rem}' +
  '.cadre{border:1px solid var(--bord);border-radius:6px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.12)}' +
  '.famille{font-size:.8rem;color:var(--discret)}' +
  '</style></head><body><h1>Modèles de CV qui se ressemblent</h1>' +
  '<p class="sous">Chaque paire montre deux modèles de la galerie, rendus par le vrai moteur de CV avec le même CV d’exemple. Le pourcentage mesure la ressemblance de <b>structure</b> (pas de la couleur). À chaque paire : faut-il garder les deux tels quels, donner une particularité à l’un, les fusionner, ou en retirer un ?</p>';
paires.forEach((p, i) => {
  const da = trouver(p.a), db = trouver(p.b);
  if (!da || !db) { return; }
  html += '<section class="paire"><h2>' + (i + 1) + '. ' + echapper(p.a.nom) + ' et ' + echapper(p.b.nom) + '</h2><p class="score">Ressemblance de structure : ' + p.s + ' %</p><div class="duo">' +
    '<div class="modele">' + feuille(da, 250) + '<b>' + echapper(p.a.nom) + '</b><span class="famille">' + (p.a.fam === 'sobre' ? 'Sobre' : 'Créatif') + '</span></div>' +
    '<div class="modele">' + feuille(db, 250) + '<b>' + echapper(p.b.nom) + '</b><span class="famille">' + (p.b.fam === 'sobre' ? 'Sobre' : 'Créatif') + '</span></div></div></section>';
});
html += '</body></html>';
const fichier = path.join(racine, 'docs', 'PLANCHE_MODELES_PROCHES.html');
fs.writeFileSync(fichier, html, 'utf8');
console.log(paires.length + ' paires écrites dans ' + fichier + ' (' + Math.round(html.length / 1024) + ' ko)');
