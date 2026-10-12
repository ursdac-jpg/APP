'use strict';
// Ressemblance entre les modèles de CV de la galerie, calculée à partir des rendus enregistrés (data/miniatures/*.json, fabriqués par le banc de rendu).
// Outil de décision pour le chantier « variété » (docs/AUDIT_VIGNETTES_MODELES_CV_2026-10-11.md) : il ne décide rien, il classe les paires de modèles les plus proches.
// Usage : node scripts/rendu/ressemblance.js [seuil, 0 à 1, 0,8 par défaut]
//
// Méthode (signature visuelle, si les miniatures la portent) : l'ensemble des styles réellement appliqués aux éléments structurants (couleurs, filets, arrondis, ombres, espacement des lettres...), ce qui compte aussi la COULEUR.
// À défaut, méthode par classes : pour chaque modèle, l'ensemble de ses « traits » = les classes du CV (page, en-tête, corps, rubriques, pastilles...), le style des éléments structurants
// (arrière-plans, bordures, arrondis des règles de style qui s'appliquent aux classes présentes) et le nombre de colonnes. Deux modèles se ressemblent d'autant plus que leurs ensembles se recouvrent
// (indice de Jaccard : 1 = mêmes traits). C'est une mesure de STRUCTURE : elle ne voit ni la couleur de départ ni le texte.

const fs = require('node:fs');
const path = require('node:path');

const dossier = path.join(__dirname, '..', '..', 'data', 'miniatures');
const seuil = parseFloat(process.argv[2] || '0.8');

function traits(d) {
  // Signature visuelle (styles reellement appliques, fabriquee par le banc de rendu) : plus fidele que les classes pour les differences faites en style seulement.
  const t = new Set();
  const html = d.html;
  // les classes de chaque élément, avec la balise (une classe utilisée par un h2 n'est pas la même chose que sur un div)
  const re = /<(\w+)([^>]*?)>/g;
  let m;
  while ((m = re.exec(html))) {
    const balise = m[1];
    const c = /class="([^"]*)"/.exec(m[2]);
    if (c) { c[1].split(/\s+/).filter(Boolean).forEach((k) => t.add(balise + '.' + k)); }
    const s = /style="([^"]*)"/.exec(m[2]);
    if (s) {
      // dans le style en ligne, seules comptent les propriétés de forme (pas les valeurs de couleur ni de longueur)
      s[1].split(';').map((x) => x.split(':')[0].trim()).filter(Boolean).forEach((p) => t.add(balise + '@' + p));
    }
  }
  // règles de style propres au modèle : sélecteurs dont les classes sont présentes dans le HTML
  const classesPresentes = new Set(Array.from(t).map((x) => x.split('.').slice(1).join('.')).filter(Boolean));
  const regles = d.css.match(/[^{}]+\{[^{}]*\}/g) || [];
  regles.forEach((r) => {
    const sel = r.slice(0, r.indexOf('{')).trim();
    const corps = r.slice(r.indexOf('{') + 1, -1);
    const cls = (sel.match(/\.[\w-]+/g) || []).map((x) => x.slice(1));
    if (!cls.length || !cls.every((k) => classesPresentes.has(k))) { return; }
    // trait = sélecteur + propriétés de forme déclarées (sans les valeurs)
    corps.split(';').map((x) => x.split(':')[0].trim()).filter((p) => /^(background|border|clip-path|display|grid|flex|position|transform|border-radius|content|box-shadow|text-transform|font-weight|columns?)/.test(p))
      .forEach((p) => t.add('regle:' + sel + '|' + p));
  });
  return t;
}
function signature(d) { return (Array.isArray(d.signature) && d.signature.length) ? new Set(d.signature) : null; }

const modeles = fs.readdirSync(dossier).filter((f) => f.endsWith('.json')).sort().map((f) => {
  const d = JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'));
  return { cle: d.cle, nom: d.nom, traits: traits(d), signature: signature(d) };
});

function jaccard(a, b) {
  let commun = 0;
  a.forEach((x) => { if (b.has(x)) { commun++; } });
  return commun / (a.size + b.size - commun);
}

const paires = [];
for (let i = 0; i < modeles.length; i++) {
  for (let j = i + 1; j < modeles.length; j++) {
    // Deux methodes : classes et formes de style, signature visuelle (styles appliques). Aucune des deux ne voit tout (la signature ignore la structure de la frise, les classes ignorent la couleur) :
    // on retient la PLUS BASSE : deux modeles ne sont juges proches que si les deux methodes le disent.
    const sc = jaccard(modeles[i].traits, modeles[j].traits);
    const ss = (modeles[i].signature && modeles[j].signature) ? jaccard(modeles[i].signature, modeles[j].signature) : 1;
    paires.push({ a: modeles[i], b: modeles[j], s: Math.min(sc, ss) });
  }
}
paires.sort((x, y) => y.s - x.s);

console.log(modeles.length + ' modèles, ' + paires.length + ' paires. Paires dont la ressemblance de structure atteint ' + seuil + ' :');
paires.filter((p) => p.s >= seuil).forEach((p) => console.log((p.s * 100).toFixed(0).padStart(3) + ' %  ' + p.a.nom + ' (' + p.a.cle.split(':')[0] + ')  /  ' + p.b.nom + ' (' + p.b.cle.split(':')[0] + ')'));

// pour chaque modèle : son plus proche voisin
console.log('\nPlus proche voisin de chaque modèle :');
modeles.forEach((m) => {
  const mieux = paires.filter((p) => p.a === m || p.b === m)[0];
  const autre = mieux.a === m ? mieux.b : mieux.a;
  console.log((mieux.s * 100).toFixed(0).padStart(3) + ' %  ' + m.nom + ' (' + m.cle.split(':')[0] + ')  ->  ' + autre.nom);
});
