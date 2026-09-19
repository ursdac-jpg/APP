/* ============================================================
   modules/ats/detectionTexteCache.js
   ------------------------------------------------------------
   Reperage local (aucun assistant) d'un passage qui ressemble a une
   liste de mots-cles hors contexte dans le TEXTE d'un CV -- une des
   techniques employees pour influencer un logiciel de tri (mots ecrits
   en blanc, en marge, en police minuscule : au copier / coller la
   couleur et la taille sont perdues, mais le texte, lui, reste).

   Fonctionne EN COMPLEMENT de la consigne du prompt (prompts/ats.md
   section 3), jamais en remplacement : decision D3, docs/PLAN_ATS.
   L'ecran « Resultat » affiche l'union des deux reperages.

   NE BLOQUE JAMAIS. Retourne seulement de l'information ; c'est la
   personne qui juge (un profil technique qui liste 30 outils est un
   faux positif possible, CHANTIER_ATS section 4). Heuristique
   volontairement prudente : mieux vaut rater un cas que crier au loup.

   Deux tiers de detection, puis un repli :
   - TIER 1 : un bloc separe du reste par un ecart d'espaces anormal
     (3+ espaces ou une tabulation) -- l'ecart est deja un signal fort.
   - TIER 2 : une longue clause delimitee par une ponctuation forte, sans
     virgules et quasiment sans mots de liaison (ni phrase, ni liste).
   - Repli : un meme terme non trivial repete de facon anormale.

   Ce qu'elle ne peut pas voir : le texte reellement invisible (couleur,
   taille) -- dit explicitement a la personne cote interface.
   ============================================================ */

// Mots de liaison / outils du francais. Une vraie phrase en contient
// beaucoup ; un bloc de mots-cles quasiment aucun.
var ATS_MOTS_OUTILS = {
  'le': 1, 'la': 1, 'les': 1, 'un': 1, 'une': 1, 'des': 1, 'du': 1, 'de': 1, 'd': 1,
  'et': 1, 'ou': 1, 'a': 1, 'au': 1, 'aux': 1, 'en': 1, 'dans': 1, 'sur': 1, 'sous': 1,
  'pour': 1, 'par': 1, 'avec': 1, 'sans': 1, 'chez': 1, 'vers': 1, 'entre': 1,
  'je': 1, 'j': 1, 'tu': 1, 'il': 1, 'elle': 1, 'on': 1, 'nous': 1, 'vous': 1, 'ils': 1, 'elles': 1,
  'mon': 1, 'ma': 1, 'mes': 1, 'ton': 1, 'ta': 1, 'tes': 1, 'son': 1, 'sa': 1, 'ses': 1,
  'notre': 1, 'nos': 1, 'votre': 1, 'vos': 1, 'leur': 1, 'leurs': 1, 'ce': 1, 'cet': 1, 'cette': 1, 'ces': 1,
  'que': 1, 'qui': 1, 'quoi': 1, 'dont': 1, 'ainsi': 1, 'donc': 1, 'mais': 1, 'car': 1, 'puis': 1,
  'est': 1, 'sont': 1, 'etait': 1, 'etaient': 1, 'ai': 1, 'as': 1, 'ont': 1, 'avais': 1, 'avait': 1,
  'plus': 1, 'tres': 1, 'bien': 1, 'aussi': 1, 'lors': 1, 'apres': 1, 'avant': 1, 'pendant': 1
};

// Petits mots a ignorer dans la detection de repetition (bruit courant).
var ATS_STOPWORDS_REPETITION = Object.assign({}, ATS_MOTS_OUTILS, {
  'cv': 1, 'poste': 1, 'entreprise': 1, 'experience': 1, 'experiences': 1,
  'competences': 1, 'competence': 1, 'formation': 1, 'formations': 1, 'ans': 1
});

// Marqueur interne pour un ecart d'espaces anormal. Caractere de controle
// qui ne peut pas apparaitre dans un CV colle. Retire avant tout affichage.
var ATS_SEP = String.fromCharCode(1);

function _atsSansAccents(s) {
  var t = String(s == null ? '' : s);
  return t.normalize ? t.normalize('NFD').replace(/[̀-ͯ]/g, '') : t;
}

function _atsMotsDe(chaine) {
  return _atsSansAccents(chaine)
    .toLowerCase()
    .replace(/[^a-z0-9'’\s-]/g, ' ')
    .split(/[\s'’-]+/)
    .filter(function (m) { return m.length > 0; });
}

function _atsMesurer(chaine) {
  var mots = _atsMotsDe(chaine);
  var outils = 0;
  mots.forEach(function (m) { if (ATS_MOTS_OUTILS[m]) { outils++; } });
  return {
    nbMots: mots.length,
    nbVirgules: (String(chaine).match(/,/g) || []).length,
    ratioOutils: mots.length ? outils / mots.length : 1
  };
}

// TIER 1 : l'ecart d'espaces anormal est deja un signal fort -> seuil large.
function _atsBlocMalColleSuspect(bloc) {
  var m = _atsMesurer(bloc);
  return m.nbMots >= 6 && m.nbVirgules <= 1 && m.ratioOutils < 0.22;
}

// TIER 2 : sans le signal de l'espacement -> seuil beaucoup plus strict.
function _atsRunSuspect(run) {
  var m = _atsMesurer(run);
  return m.nbMots >= 9 && m.nbVirgules <= 1 && m.ratioOutils < 0.12;
}

// { avant, bloc, apres } depuis le texte propre : quelques mots de
// contexte de chaque cote, tels quels.
function _atsContexte(textePropre, bloc) {
  var b = bloc.replace(/\s+/g, ' ').trim();
  var idx = textePropre.indexOf(b);
  if (idx === -1) { return { avant: '', bloc: b, apres: '' }; }
  var avant = textePropre.slice(0, idx).trim().split(/\s+/).filter(Boolean).slice(-8).join(' ');
  var apres = textePropre.slice(idx + b.length).trim().split(/\s+/).filter(Boolean).slice(0, 8).join(' ');
  return { avant: avant, bloc: b, apres: apres };
}

// Un terme non trivial repete de facon anormale : indice de bourrage.
function _atsTermeSurRepresente(texte) {
  var mots = _atsMotsDe(texte);
  if (mots.length < 40) { return null; }
  var compte = {};
  mots.forEach(function (m) {
    if (m.length < 4 || ATS_STOPWORDS_REPETITION[m]) { return; }
    compte[m] = (compte[m] || 0) + 1;
  });
  var pire = null;
  Object.keys(compte).forEach(function (m) {
    if (compte[m] >= 5 && (!pire || compte[m] > compte[pire])) { pire = m; }
  });
  return pire;
}

// --- Point d'entree ------------------------------------------------

// texteCV : le texte du CV (deja extrait du fichier / de la photo par
// ouvrirAssistantDepotCV, ou colle directement).
// Retour : { suspect: bool, extraits: [ { avant, bloc, apres } ] }.
function detecterTexteCache(texteCV) {
  var resultat = { suspect: false, extraits: [] };
  var brut = String(texteCV == null ? '' : texteCV);
  if (brut.trim().length < 20) { return resultat; }

  var marque = brut.replace(/\r\n?/g, '\n').replace(/[^\S\n]{3,}|\t+/g, ATS_SEP);
  var propre = marque.split(ATS_SEP).join(' ').replace(/[^\S\n]+/g, ' ');
  var vus = {};

  function ajouter(bloc) {
    if (resultat.extraits.length >= 3) { return; }
    var cle = _atsSansAccents(bloc).toLowerCase().replace(/\s+/g, ' ').slice(0, 60);
    if (vus[cle]) { return; }
    vus[cle] = true;
    resultat.extraits.push(_atsContexte(propre, bloc));
  }

  // TIER 1 -- segments isoles par un ecart d'espaces anormal.
  marque.split(ATS_SEP).forEach(function (bloc) {
    bloc.split(/[.!?;:\n]+/).forEach(function (seg) {
      seg = seg.replace(/\s+/g, ' ').trim();
      if (seg && _atsBlocMalColleSuspect(seg)) { ajouter(seg); }
    });
  });

  // TIER 2 -- clauses delimitees par une ponctuation forte.
  if (!resultat.extraits.length) {
    propre.split(/[.!?;:\n]+/).forEach(function (run) {
      run = run.replace(/\s+/g, ' ').trim();
      if (run && _atsRunSuspect(run)) { ajouter(run); }
    });
  }

  // Repli -- terme sur-represente.
  if (!resultat.extraits.length) {
    var terme = _atsTermeSurRepresente(brut);
    if (terme) {
      var reg = new RegExp('([^\\s]+\\s+){0,6}[^\\s]*' + terme + '[^\\s]*(\\s+[^\\s]+){0,6}', 'i');
      var m = propre.match(reg);
      if (m) { ajouter(m[0]); }
    }
  }

  resultat.suspect = resultat.extraits.length > 0;
  return resultat;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    detecterTexteCache: detecterTexteCache,
    _atsRunSuspect: _atsRunSuspect,
    _atsBlocMalColleSuspect: _atsBlocMalColleSuspect
  };
}
