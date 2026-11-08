// BOUTONS COMMUNS : plus aucune ligne de texte cliquable (consignes 125 et 126 de Denis, maquette validée le 07/11/2026 :
// docs/MAQUETTE_BOUTONS_FIN_DES_LIENS_2026-11-07.html). Logique pure, sans DOM (testée sous Node, tests/boutonsCommuns.test.js).
// Une seule source de vérité pour « un bouton vers un site extérieur » et « une adresse avec son bouton carte » : Qui fait quoi, Mon territoire, le Lexique,
// Regard extérieur et Comprendre le cadre l'appellent tous. Chargé avant js/app.js (index.html).
//
// Règle : un clic qui mène quelque part est un BOUTON (cadre, jamais souligné). Seule exception : un mot cliquable au milieu d'une phrase qui continue.
// Un bouton vers un site extérieur porte le NOM de la structure (jamais l'adresse web) et dit « Vous quittez l'application » juste en dessous.

var BOUTONS_COMMUNS_NOTE_SORTIE = 'Vous quittez l’application';

function boutonsCommunsEchapper(t) {
  return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Une adresse web sûre : http ou https seulement (jamais « javascript: » ni autre), sinon chaîne vide.
function boutonsCommunsUrlSure(url) {
  var u = String(url == null ? '' : url).trim();
  return /^https?:\/\//i.test(u) ? u : '';
}

// Le bouton vers un site extérieur. `libelle` est du TEXTE (échappé ici). Options :
//   petit : true  = bouton réduit (dans une fiche) ; note : false = sans la mention « Vous quittez l'application » (défaut : avec) ;
//   classe : classes ajoutées ; bloc : true = le bouton et sa mention forment un bloc (défaut : true).
// Rend '' si l'adresse n'est pas une adresse web.
function boutonExterneHtml(url, libelle, options) {
  var o = options || {}, u = boutonsCommunsUrlSure(url);
  if (!u) { return ''; }
  var bouton = '<a class="btn btn-outline-primary' + (o.petit ? ' btn-sm' : '') + ' bouton-externe' + (o.classe ? ' ' + boutonsCommunsEchapper(o.classe) : '') + '" href="' + boutonsCommunsEchapper(u) +
    '" target="_blank" rel="noopener noreferrer"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> ' + boutonsCommunsEchapper(libelle) + '</a>';
  if (o.note === false) { return bouton; }
  return '<span class="bouton-externe-bloc">' + bouton + '<span class="bouton-externe-note">' + BOUTONS_COMMUNS_NOTE_SORTIE + '</span></span>';
}

// Le bouton « Voir sur la carte » (un site de cartes est un site extérieur : même cadre que les autres boutons extérieurs). `urlCarte` vient de mtUrlCarte.
function boutonCarteHtml(urlCarte) {
  var u = boutonsCommunsUrlSure(urlCarte);
  if (!u) { return ''; }
  return '<a class="btn btn-sm btn-outline-primary bouton-externe ms-1" href="' + boutonsCommunsEchapper(u) + '" target="_blank" rel="noopener noreferrer"><i class="bi bi-map" aria-hidden="true"></i> Voir sur la carte</a>';
}

// L'adresse écrite en texte simple, avec le bouton carte à côté (si on a une adresse de carte).
function adresseAvecCarteHtml(adresse, urlCarte) {
  return '<span class="text-break">' + boutonsCommunsEchapper(adresse) + '</span>' + boutonCarteHtml(urlCarte);
}

// Le nom du bouton d'un site de structure : « Voir le site : <nom> » (le nom seul, jamais l'adresse web ; pas d'article à accorder).
function libelleSiteStructure(nom) {
  var n = String(nom == null ? '' : nom).trim();
  return n ? 'Voir le site : ' + n : 'Voir le site';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BOUTONS_COMMUNS_NOTE_SORTIE: BOUTONS_COMMUNS_NOTE_SORTIE, boutonsCommunsEchapper: boutonsCommunsEchapper, boutonsCommunsUrlSure: boutonsCommunsUrlSure,
    boutonExterneHtml: boutonExterneHtml, boutonCarteHtml: boutonCarteHtml, adresseAvecCarteHtml: adresseAvecCarteHtml, libelleSiteStructure: libelleSiteStructure
  };
}
