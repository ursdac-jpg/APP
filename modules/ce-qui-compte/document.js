/* ============================================================
   modules/ce-qui-compte/document.js
   Espace « Ce qui compte pour moi » : le DOCUMENT imprimable (consigne 566, demande 5, maquette validée le 22/11/2026).
   Pur : ne lit que l'état et les descriptions de cartes, jamais le DOM. Même texte que l'écran de résultat (cqcpmResultat, source unique).
   Quatre usages : le résultat d'une carte, « Tout imprimer » (toutes les cartes gardées), le PAPIER « Ce qui revient dans mes cartes » (papier.js), et la partie
   « Ce qui compte pour moi » de la feuille imprimée de « Ma synthèse » d'Explorer les métiers (syntheseFeuille.js), qui ne reprend que le papier, et seulement s'il est joint
   (consigne 570 : les cartes une à une n'y vont plus).
   Impression : le composant commun ucpmImprimerDocument (modules/un-cv-plusieurs-metiers/page7Fin.js), jamais un second composant.
   Règle de langue : « ce que j'ai exprimé », jamais « ce que je suis » ; aucun score, aucun type, aucun classement de métiers.
   ============================================================ */

var _cqcpmDocL = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('./logique.js')
  : { _cqcpmEsc: _cqcpmEsc, cqcpmCarte: cqcpmCarte, cqcpmResultat: cqcpmResultat, cqcpmReponsesDe: cqcpmReponsesDe, cqcpmCartesGardees: cqcpmCartesGardees,
      cqcpmDateFr: cqcpmDateFr, cqcpmDateDuJour: cqcpmDateDuJour };
var _cqcpmDocP = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('./papier.js')
  : { CQCPM_PAPIER_TITRE: CQCPM_PAPIER_TITRE, CQCPM_PAPIER_PRUDENCE: CQCPM_PAPIER_PRUDENCE, CQCPM_PAPIER_PRUDENCE_ECRAN: CQCPM_PAPIER_PRUDENCE_ECRAN, cqcpmPapier: cqcpmPapier, cqcpmPapierSections: cqcpmPapierSections, cqcpmPapierJoint: cqcpmPapierJoint };

var CQCPM_DOC_PRUDENCE = 'Ce n’est ni une note, ni un profil, ni un diagnostic, et cela ne décrit pas ma personnalité.';
var CQCPM_DOC_NOTE = 'Document personnel : ce que j’ai exprimé ce jour-là, avec mes mots. ' + CQCPM_DOC_PRUDENCE;
var CQCPM_DOC_PIED = 'Rien n’a été envoyé : ce document est produit sur l’appareil de la personne.';
// Mise en page propre au document ; le reste (police, titres, listes) est repris de la feuille de « Ma synthèse » quand elle est chargée.
var CQCPM_DOC_CSS = '.carte{margin:0 0 .6rem}.carte h2{break-after:avoid}.col{border:1px solid #000;padding:.3rem .6rem;margin:.3rem 0;break-inside:avoid}.col b{display:block}';

function _cqcpmDocListe(items) { var E = _cqcpmDocL._cqcpmEsc; return '<ul>' + items.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>'; }

// Une section de résultat en HTML imprimable. Une section vide n'est jamais imprimée (aucune « partie manquante » sur le papier).
function _cqcpmDocSection(s, nomCarte) {
  var E = _cqcpmDocL._cqcpmEsc;
  if (s.vide) { return ''; }
  var h = s.titre === nomCarte ? '' : '<h3>' + E(s.titre) + '</h3>';   // une section qui porte le nom de la carte ne répète pas son titre
  if (s.type === 'texte') { return h + '<p>' + E(s.texte) + '</p>'; }
  if (s.type === 'liste' || s.type === 'option') { return h + _cqcpmDocListe(s.items); }
  if (s.type === 'phrases') { return h + '<ul>' + s.items.map(function (x) { return '<li>' + E(x.lib) + ' : <b>' + E(x.reponse) + '</b></li>'; }).join('') + '</ul>'; }
  if (s.type === 'colonnes') {
    return h + s.colonnes.filter(function (c) { return c.items.length; }).map(function (c) { return '<div class="col"><b>' + E(c.nom) + '</b>' + _cqcpmDocListe(c.items) + '</div>'; }).join('');
  }
  if (s.type === 'entrees') {
    return h + s.items.map(function (e) {
      return '<div class="piste"><b>' + E(e.titre) + '</b>' + e.lignes.map(function (l) { return '<p>' + E(l.lib) + ' : ' + E(l.texte) + '</p>'; }).join('') + '</div>';
    }).join('');
  }
  if (s.type === 'textes') { return h + '<ul>' + s.lignes.map(function (l) { return '<li>' + E(l.lib) + ' : ' + E(l.texte) + '</li>'; }).join('') + '</ul>'; }
  return '';
}

// Le bloc d'une carte : un titre, la date de garde s'il y en a une, puis ses sections. Chaîne vide si la carte n'a rien à imprimer.
// `niveau` : 'h2' (document autonome) ou 'h3' (partie d'une autre feuille, où le titre de la partie est déjà un h2).
function cqcpmHtmlCarteDocument(etat, carteId, niveau) {
  var L = _cqcpmDocL, E = L._cqcpmEsc, carte = L.cqcpmCarte(carteId);
  if (!carte || !etat) { return ''; }
  var r = L.cqcpmResultat(carteId, L.cqcpmReponsesDe(etat, carteId), etat);
  if (!r || r.vide) { return ''; }
  var corps = r.sections.map(function (sec) { return _cqcpmDocSection(sec, carte.nom); }).join('');
  if (!corps) { return ''; }
  var date = etat.gardees && etat.gardees[carteId] ? L.cqcpmDateFr(etat.gardees[carteId].date) : '';
  var t = niveau === 'h3' ? 'h3' : 'h2';
  if (niveau === 'h3') { corps = corps.replace(/<h3>/g, '<h4>').replace(/<\/h3>/g, '</h4>'); }
  return '<div class="carte"><' + t + '>' + E(carte.nom) + '</' + t + '>' + (date ? '<p class="note">Gardé le ' + E(date) + '.</p>' : '') + corps + '</div>';
}

// Les identifiants des cartes à imprimer avec « Tout imprimer » : toutes les cartes gardées.
function cqcpmIdsADocumenter(etat) {
  if (!etat) { return []; }
  return _cqcpmDocL.cqcpmCartesGardees(etat).map(function (c) { return c.id; });
}

// Le document complet (page autonome, noir sur blanc, sans bouton). Une chaîne vide si aucune des cartes n'a quelque chose à imprimer.
function cqcpmHtmlDocument(etat, ids) {
  var E = _cqcpmDocL._cqcpmEsc;
  var blocs = (ids || []).map(function (id) { return cqcpmHtmlCarteDocument(etat, id, 'h2'); }).filter(function (x) { return !!x; });
  if (!blocs.length) { return ''; }
  var css = (typeof SYN_CSS_FEUILLE === 'string' ? SYN_CSS_FEUILLE : '') + CQCPM_DOC_CSS;
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Ce qui compte pour moi</title><style>' + css + '</style></head><body>' +
    '<h1>Ce qui compte pour moi</h1><p class="note">Établi le ' + E(_cqcpmDocL.cqcpmDateFr(_cqcpmDocL.cqcpmDateDuJour())) + '. ' + E(CQCPM_DOC_NOTE) + '</p>' +
    blocs.join('') + '<div class="pied">' + E(CQCPM_DOC_PIED) + '</div></body></html>';
}

// Les parties du papier en HTML imprimable : un titre par partie, jamais une partie vide. `niveau` : le titre des parties ('h2' dans le papier seul, 'h3' dans la feuille de Ma synthèse).
function _cqcpmDocPartiesPapier(etat, niveau) {
  var E = _cqcpmDocL._cqcpmEsc, t = niveau === 'h3' ? 'h3' : 'h2';
  return _cqcpmDocP.cqcpmPapierSections(etat).map(function (s) {
    return '<' + t + '>' + E(s.titreFeuille) + '</' + t + '>' + (s.type === 'liste' ? _cqcpmDocListe(s.valeur) : '<p>' + E(s.valeur) + '</p>');
  }).join('');
}

// Le papier « Ce qui revient dans mes cartes » : page autonome, noir sur blanc, sans bouton. Chaîne vide s'il n'y a pas de papier valide.
function cqcpmHtmlDocumentPapier(etat) {
  var E = _cqcpmDocL._cqcpmEsc, p = _cqcpmDocP.cqcpmPapier(etat);
  if (!p) { return ''; }
  var corps = _cqcpmDocPartiesPapier(etat, 'h2');
  if (!corps) { return ''; }
  var css = (typeof SYN_CSS_FEUILLE === 'string' ? SYN_CSS_FEUILLE : '') + CQCPM_DOC_CSS;
  var n = p.ids.length;
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>' + E(_cqcpmDocP.CQCPM_PAPIER_TITRE) + '</title><style>' + css + '</style></head><body>' +
    '<h1>' + E(_cqcpmDocP.CQCPM_PAPIER_TITRE) + '</h1><p class="note">Établi le ' + E(_cqcpmDocL.cqcpmDateFr(p.date || _cqcpmDocL.cqcpmDateDuJour())) + ', à partir de ' + n + ' cartes. ' + E(_cqcpmDocP.CQCPM_PAPIER_PRUDENCE_ECRAN) + '</p>' +
    corps + '<div class="pied">' + E(CQCPM_DOC_PIED) + '</div></body></html>';
}

// La partie de la feuille de « Ma synthèse » : le papier, SEULEMENT s'il est joint (le numéro de la rubrique est posé par l'appelant). Chaîne vide sinon.
function cqcpmHtmlPartieSynthese(etat) {
  if (!_cqcpmDocP.cqcpmPapierJoint(etat)) { return ''; }
  var corps = _cqcpmDocPartiesPapier(etat, 'h3');
  if (!corps) { return ''; }
  return '<p class="note">Papier « ' + _cqcpmDocL._cqcpmEsc(_cqcpmDocP.CQCPM_PAPIER_TITRE) + ' », que j’ai choisi de joindre. Texte écrit par l’assistant en ligne à partir de mes cartes : il s’adresse à moi, c’est pourquoi il dit « vous ». ' + _cqcpmDocL._cqcpmEsc(_cqcpmDocP.CQCPM_PAPIER_PRUDENCE) + '</p>' + corps;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { cqcpmHtmlCarteDocument: cqcpmHtmlCarteDocument, cqcpmIdsADocumenter: cqcpmIdsADocumenter, cqcpmHtmlDocument: cqcpmHtmlDocument, cqcpmHtmlDocumentPapier: cqcpmHtmlDocumentPapier, cqcpmHtmlPartieSynthese: cqcpmHtmlPartieSynthese };
}
