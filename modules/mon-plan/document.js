/* ============================================================
   modules/mon-plan/document.js
   « Mon plan » : le DOCUMENT imprimable (le plan seul) et la rubrique de la feuille imprimée de « Ma synthèse » (consigne 618 : seulement si la personne
   a joint son plan, jamais envoyé à l'assistant). Pur : ne lit que l'état, jamais le DOM. Testé par tests/monPlanDocument.test.js.
   Impression : le composant commun ucpmImprimerDocument (modules/un-cv-plusieurs-metiers/page7Fin.js), jamais un second composant.
   Les fiches des freins restent à l'écran : la feuille ne reprend que le plan.
   ============================================================ */

var _mplDocL = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? require('./logique.js')
  : { MPL_TITRE: MPL_TITRE, MPL_PRUDENCE: MPL_PRUDENCE, MPL_POINT_SEMAINE: MPL_POINT_SEMAINE, mplPlan: mplPlan, mplJoint: mplJoint, mplEstFait: mplEstFait };

var MPL_DOC_PIED = 'Rien n’a été envoyé : ce document est produit sur l’appareil de la personne.';
var MPL_DOC_CSS = '.case{display:inline-block;width:.9em;height:.9em;border:1px solid #000;margin-right:.45rem;vertical-align:-.1em;text-align:center;line-height:.9em;font-size:.8em}ul.actions{list-style:none;padding-left:0}h2,h3{break-after:avoid}';

function _mplDocE(t) { return String(t === undefined || t === null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
var _MPL_DOC_MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
function mplDateLongue(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? (+m[3]) + ' ' + _MPL_DOC_MOIS[+m[2] - 1] + ' ' + m[1] : '';
}
function mplDateCourte(iso) {
  var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  return m ? m[3] + '/' + m[2] + '/' + m[1] : '';
}

// Le corps du plan, noir sur blanc. h = balise des titres ('h2' pour le document seul, 'h3' dans la feuille de « Ma synthèse »).
// Les actions cochées à l'écran sont cochées sur la feuille.
function mplHtmlCorpsPlan(etat, h) {
  var p = _mplDocL.mplPlan(etat), E = _mplDocE;
  if (!p) { return ''; }
  var t = function (x) { return '<' + h + '>' + E(x) + '</' + h + '>'; };
  var html = '';
  if (p.rappel) { html += t('Ce que j’ai indiqué') + '<p>' + E(p.rappel) + '</p>'; }
  if (p.priorites.length) { html += t('Mes priorités') + '<ol>' + p.priorites.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ol>'; }
  p.semaines.forEach(function (s, i) {
    if (!s.actions.length) { return; }
    html += t('Semaine ' + (i + 1)) + '<ul class="actions">' + s.actions.map(function (a, j) {
      return '<li><span class="case">' + (_mplDocL.mplEstFait(etat, i, j) ? '✓' : '') + '</span>' + E(a.texte) + '</li>';
    }).join('') + '</ul>';
  });
  if (p.obstacles.length) { html += t('Si quelque chose me freine') + p.obstacles.map(function (o) { return '<p>Si ' + E(o.si) + ', alors ' + E(o.alors) + '.</p>'; }).join(''); }
  html += t('Mon point de la semaine') + '<ul>' + _mplDocL.MPL_POINT_SEMAINE.map(function (q) { return '<li>' + E(q) + '</li>'; }).join('') + '</ul>';
  if (p.parler.length) { html += t('Ce dont j’aimerais parler avec la personne qui m’accompagne') + '<ul>' + p.parler.map(function (x) { return '<li>' + E(x.texte) + '</li>'; }).join('') + '</ul>'; }
  return html;
}

// Le document seul (« Imprimer ou enregistrer en PDF »). Chaîne vide s'il n'y a pas de plan.
function mplHtmlDocument(etat, cssCommun) {
  var p = _mplDocL.mplPlan(etat), E = _mplDocE;
  if (!p) { return ''; }
  var date = mplDateLongue(p.date);
  return '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>' + E(_mplDocL.MPL_TITRE) + '</title><style>' + (cssCommun || '') + MPL_DOC_CSS + '</style></head><body>' +
    '<h1>' + E(_mplDocL.MPL_TITRE) + '</h1><p class="note">' + (date ? 'Établi le ' + E(date) + ', à partir de ce que j’ai écrit. ' : '') + E(_mplDocL.MPL_PRUDENCE) + '</p>' +
    mplHtmlCorpsPlan(etat, 'h2') + '<div class="pied">' + E(MPL_DOC_PIED) + '</div></body></html>';
}

// La rubrique de la feuille de « Ma synthèse » : SEULEMENT si le plan est joint (le titre numéroté est posé par l'appelant). Chaîne vide sinon.
function mplHtmlPartieSynthese(etat) {
  if (!_mplDocL.mplJoint(etat)) { return ''; }
  var corps = mplHtmlCorpsPlan(etat, 'h3');
  if (!corps) { return ''; }
  var p = _mplDocL.mplPlan(etat), date = mplDateCourte(p.date);
  return '<p class="note">Plan que j’ai choisi de joindre' + (date ? ', préparé le ' + _mplDocE(date) : '') + ' avec l’assistant en ligne à partir de ce que j’ai écrit. ' + _mplDocE(_mplDocL.MPL_PRUDENCE) + '</p>' + MPL_DOC_STYLE_FEUILLE + corps;
}
// Les cases de la feuille de « Ma synthèse » (la feuille a sa propre feuille de style : la règle des cases est ajoutée ici, une seule fois).
var MPL_DOC_STYLE_FEUILLE = '<style>' + MPL_DOC_CSS + '</style>';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MPL_DOC_PIED: MPL_DOC_PIED, mplDateLongue: mplDateLongue, mplDateCourte: mplDateCourte, mplHtmlCorpsPlan: mplHtmlCorpsPlan, mplHtmlDocument: mplHtmlDocument, mplHtmlPartieSynthese: mplHtmlPartieSynthese };
}
