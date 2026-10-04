/* ============================================================
   modules/cv-core/couleursEntreprise.js  (2026-09-26, demande de Denis)
   ------------------------------------------------------------
   Jusqu'a TROIS couleurs d'entreprise pour le CV en PDF :
     1. principale  : l'accent du CV (titres, barres, bandeaux) ;
     2. secondaire  : la 2e teinte du degrade (« accent clair ») ;
     3. details     : la couleur des pastilles de competences.
   Fonctions PURES (aucun acces au dossier ni au DOM) pour etre testees en Node (tests/couleursEntreprise.test.js) :
   - lecture / validation des couleurs (assistant en ligne ou saisie a la main), jamais plus de trois ;
   - CORRECTION AUTOMATIQUE DU CONTRASTE : la couleur de marque reconnue est gardee telle quelle dans le dossier ; c'est la couleur
     APPLIQUEE au CV qui est ajustee (assombrie ou eclaircie, meme teinte) pour que le texte reste lisible :
       principale  -> lisible avec du texte BLANC (bandeaux, barres) et sur fond blanc (titres) ;
       secondaire  -> 2e teinte du degrade, sous du texte BLANC (contraste minimum 3, gros texte) ;
       details     -> fond des pastilles : lisible avec du texte sombre.
   Fichier charge par index.html AVANT js/app.js ; noms globaux (pas de module).
   ============================================================ */

var _COULEUR_TEXTE_SOMBRE_CV = '#1c2430';

function _couleurValide(brut) {
  var m = /^#?([0-9a-f]{6})$/i.exec(String(brut === null || brut === undefined ? '' : brut).trim());
  return m ? ('#' + m[1].toLowerCase()) : '';
}

function _composantesCouleur(hex) {
  var h = _couleurValide(hex).replace('#', '');
  return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)];
}

function luminanceCouleur(hex) {
  var lin = _composantesCouleur(hex).map(function (v) {
    var c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

function rapportContrasteCouleurs(a, b) {
  var la = luminanceCouleur(a), lb = luminanceCouleur(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function _melangerCouleurs(hex, cible, t) {
  var a = _composantesCouleur(hex), b = _composantesCouleur(cible);
  return '#' + [0, 1, 2].map(function (i) {
    return ('0' + Math.round(a[i] + (b[i] - a[i]) * t).toString(16)).slice(-2);
  }).join('');
}

// Principale : assombrie (meme teinte) tant qu'elle n'est pas lisible avec du texte blanc.
function couleurPourTexteBlanc(hex, minRatio) {
  var base = _couleurValide(hex);
  if (!base) { return ''; }
  var min = minRatio || 4.5;
  for (var t = 0; t <= 1.0001; t += 0.04) {
    var c = _melangerCouleurs(base, '#000000', t);
    if (rapportContrasteCouleurs(c, '#ffffff') >= min) { return c; }
  }
  return '#000000';
}

// Secondaire et details (fonds) : eclaircie (meme teinte) tant qu'un texte sombre n'y est pas lisible.
function couleurPourTexteSombre(hex, texteSombre, minRatio) {
  var base = _couleurValide(hex);
  if (!base) { return ''; }
  var texte = _couleurValide(texteSombre) || _COULEUR_TEXTE_SOMBRE_CV;
  var min = minRatio || 4.5;
  for (var t = 0; t <= 1.0001; t += 0.04) {
    var c = _melangerCouleurs(base, '#ffffff', t);
    if (rapportContrasteCouleurs(c, texte) >= min) { return c; }
  }
  return '#ffffff';
}

// Reponse de l'assistant en ligne : une liste (0 a 3 couleurs), ou l'ancien champ « une seule couleur ». Toujours #RRGGBB en
// majuscules, sans doublon, jamais plus de trois ; une valeur qui n'est pas une couleur est ignoree.
function normaliserCouleursEntrepriseIA(liste, ancienneCouleur) {
  var brut = Array.isArray(liste) ? liste.slice() : (typeof liste === 'string' && liste ? [liste] : []);
  if (!brut.length && ancienneCouleur) { brut = [ancienneCouleur]; }
  var vues = {}, res = [];
  brut.forEach(function (x) {
    var c = _couleurValide(x);
    if (c && !vues[c] && res.length < 3) { vues[c] = true; res.push(c.toUpperCase()); }
  });
  return res;
}

// Couleurs de l'entreprise du dossier (dossier.rechercheCandidature) : les trous sont comblees (une 2e couleur sans principale devient
// la principale). Retourne { liste, principale, secondaire, details } en #rrggbb minuscules ('' si absente).
function couleursEntrepriseDuDossier(rc) {
  var r = rc || {};
  var liste = [r.couleurEntreprise, r.couleurEntreprise2, r.couleurEntreprise3].map(_couleurValide).filter(Boolean);
  return { liste: liste, principale: liste[0] || '', secondaire: liste[1] || '', details: liste[2] || '' };
}

// Couleurs APPLIQUEES au CV (contraste corrige) a partir de celles du dossier.
function couleursEntrepriseAppliquees(rc) {
  var c = couleursEntrepriseDuDossier(rc);
  return {
    principale: c.principale ? couleurPourTexteBlanc(c.principale) : '',
    secondaire: c.secondaire ? couleurPourTexteBlanc(c.secondaire, 3) : '',
    details: c.details ? couleurPourTexteSombre(c.details) : '',
    nombre: c.liste.length
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { luminanceCouleur: luminanceCouleur, rapportContrasteCouleurs: rapportContrasteCouleurs, couleurPourTexteBlanc: couleurPourTexteBlanc,
    couleurPourTexteSombre: couleurPourTexteSombre, normaliserCouleursEntrepriseIA: normaliserCouleursEntrepriseIA,
    couleursEntrepriseDuDossier: couleursEntrepriseDuDossier, couleursEntrepriseAppliquees: couleursEntrepriseAppliquees };
}
