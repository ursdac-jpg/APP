/* ============================================================
   Module « Mettre mon CV en page, sans rien changer » : lecteur de PDF qui GARDE LES LIGNES.
   Chantier : docs/CHANTIER_CV_SANS_ASSISTANT_2026-10-22.md (section 4ter, essai 1).

   Pourquoi un lecteur à part : lireFichierCV() (data/metiers.js) recolle tous les morceaux de texte d'un PDF avec une espace, donc tout le CV
   devient UNE seule ligne ; il est partagé par d'autres parcours et n'est volontairement pas modifié ici.

   Ce fichier contient des fonctions PURES (testées par `npm test`, avec des morceaux de texte fabriqués) et une seule fonction qui touche pdf.js
   (csaLirePdfEnLignes, test navigateur). Un « morceau » est { s: texte, x, y, w, h } en points de page, y croissant vers le haut (comme pdf.js).
   Les écarts larges entre deux morceaux d'une même ligne sont écrits avec une TABULATION : c'est la séparation entre deux cases d'une grille.
   ============================================================ */

/* Un même texte écrit plusieurs fois au même endroit (gras simulé, ombre) ne doit sortir qu'une fois. */
function csaSansSuperposition(items) {
  var vus = [];
  return items.filter(function (i) {
    var doublon = vus.some(function (v) { return v.s === i.s && Math.abs(v.x - i.x) <= 2.5 && Math.abs(v.y - i.y) <= 2.5; });
    if (!doublon) { vus.push(i); }
    return !doublon;
  });
}

/* Regroupe les morceaux par hauteur sur la page (une ligne par hauteur), de haut en bas ; dans une ligne, de gauche à droite. */
function csaLignesDepuisItems(items) {
  var tri = items.slice().sort(function (a, b) { return (b.y - a.y) || (a.x - b.x); });
  var lignes = [];
  tri.forEach(function (it) {
    var tol = Math.max(2, 0.45 * it.h), l = null;
    for (var k = lignes.length - 1; k >= 0 && k >= lignes.length - 4; k--) { if (Math.abs(lignes[k].y - it.y) <= tol) { l = lignes[k]; break; } }
    if (!l) { l = { y: it.y, items: [] }; lignes.push(l); }
    l.items.push(it);
  });
  return lignes.map(function (l) {
    var its = l.items.sort(function (a, b) { return a.x - b.x; }), t = '', fin = null;
    its.forEach(function (it) {
      var ecart = fin === null ? 0 : it.x - fin;
      t += (fin !== null ? (ecart > 1.2 * it.h ? '\t' : (ecart > 0.18 * it.h && !/\s$/.test(t) && !/^\s/.test(it.s) ? ' ' : '')) : '') + it.s;
      fin = it.x + it.w;
    });
    t = t.replace(/[  ]+/g, ' ').replace(/ ?\t ?/g, '\t').replace(/\t+/g, '\t').trim();
    /* « C O M P É T E N C E S » (lettres espacées) : on recolle les lettres isolées. */
    if (/^(?:\S ){3,}\S(?: \S)*$/.test(t.replace(/\t/g, ' ')) && t.replace(/[\s\t]/g, '').length >= 4) { t = t.replace(/\t/g, ' ').replace(/(\S) (?=\S)/g, '$1'); }
    return { y: l.y, texte: t };
  }).filter(function (l) { return l.texte; });
}

/* Deux vraies colonnes occupent à peu près la même hauteur de page ; une petite grille au milieu d'un CV d'une colonne, non. */
function csaEtendueSimilaire(items, xDebut, g, xFin) {
  function etendue(liste) { if (!liste.length) { return 0; } var ys = liste.map(function (i) { return i.y; }); return Math.max.apply(null, ys) - Math.min.apply(null, ys); }
  var e1 = etendue(items.filter(function (i) { return i.x >= xDebut && i.x + i.w <= g; })), e2 = etendue(items.filter(function (i) { return i.x >= g && i.x + i.w <= xFin; }));
  return Math.max(e1, e2) > 0 && Math.min(e1, e2) / Math.max(e1, e2) >= 0.45;
}

/* Les gouttières = les bandes verticales presque vides entre deux colonnes (il peut y en avoir plusieurs). */
function csaTrouverGouttieres(items, largeur) {
  var etroits = items.filter(function (i) { return i.w < 0.6 * largeur && i.s.trim(); });
  if (etroits.length < 20) { return []; }
  var compte = [], n = Math.ceil(largeur) + 2, k;
  for (k = 0; k < n; k++) { compte.push(0); }
  etroits.forEach(function (i) { for (var x = Math.max(0, Math.floor(i.x)); x <= Math.min(n - 1, Math.ceil(i.x + i.w)); x++) { compte[x]++; } });
  var seuil = Math.max(3, Math.round(0.08 * etroits.length)), bandes = [], debut = null;
  for (k = Math.floor(0.08 * largeur); k <= Math.ceil(0.92 * largeur); k++) {
    if (compte[k] <= seuil) { if (debut === null) { debut = k; } }
    else if (debut !== null) { if (k - debut >= 10) { bandes.push((debut + k) / 2); } debut = null; }
  }
  /* On ne garde une bande que s'il y a du texte de chaque côté, sur une hauteur comparable. */
  return bandes.filter(function (g, idx) {
    var avant = idx === 0 ? 0 : bandes[idx - 1], apres = idx === bandes.length - 1 ? Infinity : bandes[idx + 1];
    var gauche = etroits.filter(function (i) { return i.x >= avant && i.x + i.w <= g; }).length;
    var droite = etroits.filter(function (i) { return i.x >= g && i.x + i.w <= apres; }).length;
    return gauche >= 8 && droite >= 8 && csaEtendueSimilaire(etroits, avant, g, apres);
  });
}

/* Lit UNE page : une colonne, ou plusieurs lues l'une après l'autre. Retourne { lignes: [texte], colonnes, gouttieres }. */
function csaLirePageEnLignes(items, largeur) {
  items = csaSansSuperposition(items);
  var gs = csaTrouverGouttieres(items, largeur);
  if (!gs.length) { return { lignes: csaLignesDepuisItems(items).map(function (l) { return l.texte; }), colonnes: 1, gouttieres: [] }; }
  var bandeau = [], cols = [], c;
  gs.concat([Infinity]).forEach(function () { cols.push([]); });
  var enHaut = items.filter(function (i) { return !gs.some(function (g) { return i.x < g && i.x + i.w > g + 1; }); }).reduce(function (m, i) { return Math.max(m, i.y); }, 0);
  items.forEach(function (i) {
    /* Un morceau qui enjambe une gouttière n'est une ligne « d'en-tête » que s'il est tout en haut, au-dessus du texte des colonnes ; sinon il reste dans sa colonne. */
    var coupe = gs.some(function (g) { return i.x < g && i.x + i.w > g + 1; });
    if (coupe && i.y >= enHaut - 2) { bandeau.push(i); return; }
    c = 0; while (c < gs.length && i.x + i.w / 2 > gs[c]) { c++; }
    cols[c].push(i);
  });
  /* Une colonne dont presque chaque morceau est sur la même ligne qu'un morceau de sa voisine de gauche (dates rangées à droite des postes, cases d'une
     grille) n'est pas une vraie colonne : on la recolle ligne par ligne. */
  for (c = cols.length - 1; c >= 1; c--) {
    if (!cols[c].length || !cols[c - 1].length) { continue; }
    var alignes = cols[c].filter(function (i) {
      return cols[c - 1].some(function (j) { return Math.abs(j.y - i.y) <= Math.max(2, 0.45 * i.h); });
    }).length;
    if (alignes >= 0.6 * cols[c].length) { cols[c - 1] = cols[c - 1].concat(cols[c]); cols[c] = []; }
  }
  var sortie = csaLignesDepuisItems(bandeau);
  cols.forEach(function (col) { sortie = sortie.concat(csaLignesDepuisItems(col)); });
  return { lignes: sortie.map(function (l) { return l.texte; }), colonnes: cols.filter(function (col) { return col.length; }).length, gouttieres: gs.map(Math.round) };
}

/* Lit un PDF (ArrayBuffer) et rend le texte avec ses lignes (une ligne par saut de ligne, une page après l'autre). Touche pdf.js : test navigateur.
   pdf.js est chargé à la demande, comme le fait lireFichierCV() (chargerScript, data/metiers.js). */
function csaLirePdfEnLignes(donnees) {
  var promessePdf = (typeof window !== 'undefined' && window.pdfjsLib) ? Promise.resolve()
    : chargerScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  return promessePdf.then(function () {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return window.pdfjsLib.getDocument({ data: donnees }).promise;
  }).then(function (pdf) {
    var pages = []; for (var p = 1; p <= pdf.numPages; p++) { pages.push(p); }
    return Promise.all(pages.map(function (num) {
      return pdf.getPage(num).then(function (page) {
        var largeur = page.view[2] - page.view[0];
        return page.getTextContent().then(function (c) {
          var items = c.items.map(function (i) { return { s: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: Math.abs(i.height || i.transform[3] || 10) }; })
            .filter(function (i) { return i.s !== ''; });
          return csaLirePageEnLignes(items, largeur).lignes;
        });
      });
    }));
  }).then(function (parPage) { return parPage.map(function (l) { return l.join('\n'); }).join('\n\n'); });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { csaSansSuperposition: csaSansSuperposition, csaLignesDepuisItems: csaLignesDepuisItems, csaTrouverGouttieres: csaTrouverGouttieres, csaLirePageEnLignes: csaLirePageEnLignes };
}
