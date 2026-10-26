/* ============================================================
   modules/lettre-core/controleTexteLettreCo.js
   ------------------------------------------------------------
   Controles du texte de la lettre sous l'apercu (C4, 24/10/2026) :
   - conseil de longueur quand la lettre est courte ;
   - repérage de phrases quasi identiques, avec « supprimer cette phrase ».
   Fonctions pures, testees en Node (tests/lettreCoreControleTexte.test.js).
   Elles ne modifient jamais le texte d'elles-memes : la personne decide.
   ============================================================ */

// En dessous, la lettre est jugee courte (une lettre de motivation convaincante tient en 200 a 300 mots).
var SEUIL_LETTRE_COURTE_CO = 170;
var MOTS_OUTILS_CONTROLE_CO = ['dans', 'pour', 'avec', 'mon', 'ma', 'mes', 'une', 'des', 'les', 'que', 'qui', 'est', 'sur', 'par', 'vous', 'votre', 'nous', 'notre', 'aux', 'ses', 'son', 'cette', 'ces', 'ainsi', 'afin', 'plus', 'tout', 'tous'];

// null si la longueur convient, 'courte' si la lettre manque de matiere.
function conseilLongueurLettreCo(nbMots) {
  return (nbMots > 0 && nbMots < SEUIL_LETTRE_COURTE_CO) ? 'courte' : null;
}

// Decoupe un texte en phrases (fin de phrase . ! ? ou fin de ligne). Les lignes de 4 mots ou moins (formule d'appel, signature) sont ignorees.
function phrasesDuTexteLettreCo(texte) {
  var phrases = [];
  String(texte || '').split(/\r?\n/).forEach(function (ligne) {
    (ligne.match(/[^.!?…]+[.!?…]*/g) || []).forEach(function (p) {
      var propre = p.trim();
      if (propre.split(/\s+/).filter(Boolean).length > 4) { phrases.push(propre); }
    });
  });
  return phrases;
}

function motsSignificatifsLettreCo(phrase) {
  var vus = {};
  String(phrase).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).forEach(function (m) {
    if (m.length > 2 && MOTS_OUTILS_CONTROLE_CO.indexOf(m) === -1) { vus[m] = true; }
  });
  return Object.keys(vus);
}

// Paires de phrases dont les mots significatifs se recouvrent a 60 % ou plus (au moins 5 mots chacune). Une paire par phrase au plus.
function phrasesProchesLettreCo(texte) {
  var phrases = phrasesDuTexteLettreCo(texte);
  var mots = phrases.map(motsSignificatifsLettreCo);
  var paires = [];
  var dejaVues = {};
  for (var i = 0; i < phrases.length; i++) {
    if (mots[i].length < 5) { continue; }
    for (var j = i + 1; j < phrases.length; j++) {
      if (dejaVues[j] || mots[j].length < 5) { continue; }
      var communs = mots[i].filter(function (m) { return mots[j].indexOf(m) !== -1; }).length;
      var union = mots[i].length + mots[j].length - communs;
      if (communs / union >= 0.6) { paires.push({ premiere: phrases[i], seconde: phrases[j] }); dejaVues[j] = true; break; }
    }
  }
  return paires;
}

// Texte sans la phrase donnee (premiere occurrence), espaces et lignes vides remis en ordre.
function retirerPhraseLettreCo(texte, phrase) {
  var t = String(texte || '');
  var i = t.indexOf(phrase);
  if (i === -1) { return t; }
  var apres = t.slice(i + phrase.length).replace(/^[ \t]+/, '');
  var avant = t.slice(0, i);
  // Phrase seule sur sa ligne : on retire la ligne vide en trop plutot que de laisser un blanc double.
  if (/\n[ \t]*$/.test(avant) && /^\r?\n/.test(apres)) { apres = apres.replace(/^\r?\n/, ''); if (/\n[ \t]*$/.test(avant) && /^\r?\n/.test(apres)) { apres = apres.replace(/^\r?\n/, ''); } }
  return (avant + apres).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n');
}

if (typeof module !== 'undefined') {
  module.exports = {
    SEUIL_LETTRE_COURTE_CO: SEUIL_LETTRE_COURTE_CO,
    conseilLongueurLettreCo: conseilLongueurLettreCo,
    phrasesDuTexteLettreCo: phrasesDuTexteLettreCo,
    phrasesProchesLettreCo: phrasesProchesLettreCo,
    retirerPhraseLettreCo: retirerPhraseLettreCo
  };
}
