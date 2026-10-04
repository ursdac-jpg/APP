// ============================================================
// Couleur de CHAQUE ZONE d'un CV creatif (plein ecran) -- socle : registre des zones + generation des couleurs.
//
// TACHE (Denis, 2026-09-29) : pouvoir cliquer sur les zones colorees d'un modele (colonne, bandeau, triangle...) et les recolorer
// (palette, pipette, code, degrade). Maquette : docs/MAQUETTE_COULEURS_PAR_ZONE_2026-09-29.html ; cahier :
// docs/CHANTIER_COULEURS_PAR_ZONE_2026-09-29.md. Decisions de Denis : « liees » par defaut, les deux declenchements (bouton et clic
// direct), modeles simples d'abord.
//
// Principe : une zone = un ensemble de fonds. Chaque zone est soit
//   - 'globale' : elle suit la couleur generale (var(--cv)) du modele. Tant que les couleurs sont LIEES (par defaut), choisir sa couleur
//                 change la couleur generale : titres, fonds et traits changent ensemble (comportement d'aujourd'hui). Une fois
//                 DISSOCIEES, la zone garde sa propre couleur et la couleur generale ne pilote plus que l'ecriture ;
//   - 'fixe'    : la couleur est ecrite en dur dans le modele (ex. colonne bleue de « Colonne et frise ») : elle a toujours la sienne ;
//   - 'texte'   : l'ecriture des titres, qui suit toujours la couleur generale (jamais de couleur propre).
// L'etat vit dans _cvPdfChoixMq (couleursZones, zonesLiees), donc persiste avec le CV et arrive tel quel dans le rendu, puis dans le Word
// (le Word est fabrique a partir de ce meme rendu). Fichier lu par le parent ET par le rendu ; aucun acces au DOM ici (testable sous Node).
// ============================================================

var _PDF_ZONES_COULEUR = [
  { id: 'entete', nom: 'Bandeau du haut', suit: 'globale', angle: 135,
    clic: '.tete-fond, .tete-plat, .tete-pale',
    regles: ['.cv .tete-fond:not(.tete-diag):not(.tete-vague)', '.cv .tete-plat:not(.tete-vague)', '.cv .tete-pale', '.cv .tete-diag::before', '.cv .tete-vague:not(.tete-plat)::before'] },
  { id: 'colonne', nom: 'Colonne colorée', suit: 'globale', angle: 165,
    clic: '.col-fond, .col-pale',
    // Modèles à colonne « vague » : la vague est dessinée par le ::before de la page (les .col-fond y sont sans fond).
    regles: ['.cv .col-fond', '.cv .col-pale', '.cv.col-vague-g::before', '.cv.col-vague-d::before'] },
  { id: 'bloc', nom: 'Bloc coloré', suit: 'globale', angle: 135,
    clic: '.bloc-fond, .bloc-pale',
    regles: ['.cv .bloc-fond', '.cv .bloc-pale'] },
  { id: 'rectangles', nom: 'Rectangles', suit: 'globale', angle: 135,
    clic: '.cv-rect:not(.sobre) .rc-plein',
    regles: ['.cv-rect:not(.sobre) .rc-plein'] },
  { id: 'coin', nom: 'Triangle du haut', suit: 'globale', angle: 120,
    clic: '.fr-coin',
    regles: ['.cv-frise .fr-coin'] },
  { id: 'coin2', nom: 'Petit coin', suit: 'fixe', angle: 135,
    clic: '.fr-coin2',
    regles: ['.cv-frise .fr-coin2'] },
  { id: 'lateral', nom: 'Colonne de gauche', suit: 'fixe', angle: 165,
    clic: '.fr-lat',
    regles: ['.cv-frise .fr-lat'] },
  { id: 'trait', nom: 'Trait sous le nom', suit: 'globale', angle: 90,
    clic: '.cv:not(.sobre) .trait',
    regles: ['.cv:not(.sobre) .trait'] },
  { id: 'bandeNom', nom: 'Bande du nom', suit: 'globale', angle: 165,
    clic: '.bande-nom-vert',
    regles: ['.cv .bande-nom-vert'] },
  { id: 'barreRect', nom: 'Barre des rectangles', suit: 'globale', angle: 135,
    clic: '.cv-rect:not(.sobre) .rc-barre',
    regles: ['.cv-rect:not(.sobre) .rc-barre'] },
  // L'ecriture des titres : suit toujours la couleur generale ; cliquable seulement dans le mode « Modifier les couleurs ».
  { id: 'titres', nom: 'Écriture des titres', suit: 'texte', angle: 0,
    clic: '.cv h2[data-rub], .cv-frise .fr-h, .cv-frise .fr-metier',
    regles: [] }
];

function _pdfZoneCouleur(id) {
  for (var i = 0; i < _PDF_ZONES_COULEUR.length; i++) { if (_PDF_ZONES_COULEUR[i].id === id) { return _PDF_ZONES_COULEUR[i]; } }
  return null;
}

function _pdfHexCouleurValide(h) { return typeof h === 'string' && /^#[0-9a-fA-F]{6}$/.test(h); }

// Liees par defaut : seul un false explicite les dissocie.
function _pdfZonesLieesEffectif(v) { return v !== false; }

// Une zone qui suit la couleur generale n'a PAS de couleur propre tant que les couleurs sont liees.
function _pdfZoneSuitLaGenerale(zone, zonesLiees) {
  return !!zone && zone.suit === 'globale' && _pdfZonesLieesEffectif(zonesLiees);
}

// Valeur CSS d'un fond : couleur unie, ou petit degrade (meme teinte qui s'eclaircit, comme le degrade general du modele).
function _pdfValeurFondZone(zone, choix) {
  var c = choix.c.toLowerCase();
  if (!choix.d) { return c; }
  return 'linear-gradient(' + (zone.angle || 135) + 'deg, ' + c + ', color-mix(in srgb, ' + c + ' 55%, #ffffff))';
}

// CSS ajoute a la fin du rendu : une regle par zone dont la personne a choisi la couleur.
function _pdfCssCouleursZones(couleursZones, zonesLiees) {
  if (!couleursZones || typeof couleursZones !== 'object') { return ''; }
  var css = '';
  _PDF_ZONES_COULEUR.forEach(function (z) {
    var choix = couleursZones[z.id];
    if (!z.regles.length || !choix || !_pdfHexCouleurValide(choix.c)) { return; }
    if (_pdfZoneSuitLaGenerale(z, zonesLiees)) { return; } // liee : c'est la couleur generale qui commande
    css += z.regles.join(', ') + ' { background: ' + _pdfValeurFondZone(z, choix) + ' !important; }';
  });
  return css;
}

// ---- Lisibilite (contraste) : alerte quand une couleur choisie rend le texte difficile a lire ----
// Rapport de contraste WCAG entre deux couleurs '#rrggbb' : de 1 (identiques) a 21 (noir sur blanc). Seuils : 4,5 pour du texte courant, 3 pour un grand texte.
function _pdfLuminanceRelative(hex) {
  var v = [1, 3, 5].map(function (i) {
    var c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function _pdfRatioContraste(hexA, hexB) {
  if (!_pdfHexCouleurValide(hexA) || !_pdfHexCouleurValide(hexB)) { return null; }
  var a = _pdfLuminanceRelative(hexA), b = _pdfLuminanceRelative(hexB);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
// Meme teinte qui s'eclaircit : c'est l'extremite claire du petit degrade d'une zone (voir _pdfValeurFondZone).
function _pdfExtremiteDegrade(hex) {
  var mel = [1, 3, 5].map(function (i) { var c = parseInt(hex.slice(i, i + 2), 16); return Math.round(c * 0.55 + 255 * 0.45); });
  return '#' + mel.map(function (n) { var h = n.toString(16); return h.length < 2 ? '0' + h : h; }).join('');
}
// Verdict pour un texte : 'bon' (>= 4,5, ou >= 3 si grand texte), 'limite' (>= 3), 'faible' (< 3).
function _pdfVerdictContraste(ratio, grandTexte) {
  if (ratio === null) { return 'bon'; }
  if (ratio >= (grandTexte ? 3 : 4.5)) { return 'bon'; }
  return ratio >= 3 ? 'limite' : 'faible';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    _PDF_ZONES_COULEUR: _PDF_ZONES_COULEUR, _pdfZoneCouleur: _pdfZoneCouleur, _pdfHexCouleurValide: _pdfHexCouleurValide,
    _pdfZonesLieesEffectif: _pdfZonesLieesEffectif, _pdfZoneSuitLaGenerale: _pdfZoneSuitLaGenerale,
    _pdfValeurFondZone: _pdfValeurFondZone, _pdfCssCouleursZones: _pdfCssCouleursZones,
    _pdfLuminanceRelative: _pdfLuminanceRelative, _pdfRatioContraste: _pdfRatioContraste, _pdfExtremiteDegrade: _pdfExtremiteDegrade, _pdfVerdictContraste: _pdfVerdictContraste
  };
}
