/* ============================================================
   modules/ats/resultatParser.js
   ------------------------------------------------------------
   Interprete la reponse collee par la personne (sortie de prompts/ats.md)
   en un objet propre, consommable par l'ecran « Resultat » du module
   « Les mots de votre CV ».

   Reutilise extraireBlocJSONDepuisTexte() (js/app.js, deja eprouvee en
   production : fences ```json, extraction entre accolades, guillemets
   typographiques normalises, virgules superflues) -- jamais une
   reimplementation. En navigateur c'est un global (js/app.js charge avant
   ce fichier) ; en Node, l'appelant l'injecte via deps.extraireJSON.

   PARSER TOLERANT, JAMAIS TOUT-OU-RIEN :
   - Aucun JSON identifiable        -> { lisible: false }.
   - JSON avec analyseImpossible    -> { lisible: true, analyseImpossible: true, ... }.
   - Sinon : chaque liste est reconstruite entree par entree. Une entree
     invalide est ECARTEE et consignee dans `anomalies` -- jamais un throw.

   Robustesse imposee par les tests manuels du prompt (2026-09-03,
   docs/PLAN_ATS_2026-09-03.md etape 7) :
   - DEDOUBLONNAGE : un terme de la reference present dans deux des quatre
     listes n'est garde que dans la plus prioritaire
     (dejaExprime > peutEtreFormuleAutrement > aVerifier > pasRetrouve).
   - EXTRAITS VERIFIES : chaque extraitCV / phraseCV / texteCache.bloc doit
     figurer dans le CV reellement soumis (a la casse et aux espaces pres).
     Sinon l'entree est ecartee (l'assistant a fabrique un extrait).
   - `sources` ignore si aucun terme n'a origine "web".
   - `texteCache.extraits` ignore si suspect vaut false ou si le contenu est
     le gabarit "..." recopie du prompt.

   `anomalies` = OUTIL DE DIAGNOSTIC TECHNIQUE, jamais une source de donnees :
   aucun composant en aval ne doit lire `anomalies` pour fonctionner.
   ============================================================ */

var ATS_ORIGINES_VALIDES = ['offre', 'fiche-metier', 'web'];

// --- Outils de comparaison de texte ---------------------------------

// Normalisation pour comparer un extrait au CV : minuscules, espaces
// (y compris insecables et retours ligne) reduits a un seul, bords rognes.
function _atsNormaliser(texte) {
  return String(texte == null ? '' : texte)
    .toLowerCase()
    .replace(/[\s ]+/g, ' ')
    .trim();
}

// Un extrait est "reel" s'il apparait dans le CV soumis apres normalisation.
// Le gabarit "..." du prompt et les chaines vides ne sont jamais reels.
function _atsExtraitReel(extrait, cvNormalise) {
  var e = _atsNormaliser(extrait);
  if (!e || e === '...' || e === '…') { return false; }
  if (!cvNormalise) { return false; }
  return cvNormalise.indexOf(e) !== -1;
}

function _atsChaineNonVide(v) {
  return typeof v === 'string' && v.trim().length > 0;
}

function _atsNettoyerOrigine(v) {
  return ATS_ORIGINES_VALIDES.indexOf(v) !== -1 ? v : null;
}

// --- Reconstruction d'une entree par liste --------------------------

function _atsEntreeDejaExprime(brut, ctx) {
  if (!brut || !_atsChaineNonVide(brut.terme)) {
    ctx.anomalies.push('dejaExprime : entree sans terme, ecartee');
    return null;
  }
  return { terme: brut.terme.trim(), origine: _atsNettoyerOrigine(brut.origine) };
}

function _atsEntreePeutEtreFormuleAutrement(brut, ctx) {
  if (!brut || !_atsChaineNonVide(brut.terme)) {
    ctx.anomalies.push('peutEtreFormuleAutrement : entree sans terme, ecartee');
    return null;
  }
  if (!_atsChaineNonVide(brut.piste)) {
    ctx.anomalies.push('peutEtreFormuleAutrement (' + brut.terme + ') : sans piste, ecartee');
    return null;
  }
  if (!_atsExtraitReel(brut.extraitCV, ctx.cvNormalise)) {
    ctx.anomalies.push('peutEtreFormuleAutrement (' + brut.terme + ') : extraitCV absent du CV soumis, entree ecartee');
    return null;
  }
  return {
    terme: brut.terme.trim(),
    origine: _atsNettoyerOrigine(brut.origine),
    extraitCV: String(brut.extraitCV).trim(),
    piste: brut.piste.trim()
  };
}

function _atsEntreePasRetrouve(brut, ctx) {
  if (!brut || !_atsChaineNonVide(brut.terme)) {
    ctx.anomalies.push('pasRetrouve : entree sans terme, ecartee');
    return null;
  }
  return {
    terme: brut.terme.trim(),
    origine: _atsNettoyerOrigine(brut.origine),
    note: _atsChaineNonVide(brut.note) ? brut.note.trim() : null
  };
}

function _atsEntreeAVerifier(brut, ctx) {
  if (!brut || !_atsChaineNonVide(brut.termeReference)) {
    ctx.anomalies.push('aVerifier : entree sans termeReference, ecartee');
    return null;
  }
  // termeCV est un passage du CV : on le verifie comme un extrait.
  if (_atsChaineNonVide(brut.termeCV) && !_atsExtraitReel(brut.termeCV, ctx.cvNormalise)) {
    ctx.anomalies.push('aVerifier (' + brut.termeReference + ') : termeCV absent du CV soumis, entree ecartee');
    return null;
  }
  return {
    termeReference: brut.termeReference.trim(),
    termeCV: _atsChaineNonVide(brut.termeCV) ? brut.termeCV.trim() : null,
    note: _atsChaineNonVide(brut.note) ? brut.note.trim() : null
  };
}

function _atsEntreeChangement(brut, ctx) {
  if (!brut || !_atsChaineNonVide(brut.motReference)) {
    ctx.anomalies.push('changementsPrioritaires : entree sans motReference, ecartee');
    return null;
  }
  if (!_atsExtraitReel(brut.phraseCV, ctx.cvNormalise)) {
    ctx.anomalies.push('changementsPrioritaires (' + brut.motReference + ') : phraseCV absente du CV soumis, entree ecartee');
    return null;
  }
  return {
    phraseCV: String(brut.phraseCV).trim(),
    motReference: brut.motReference.trim(),
    condition: _atsChaineNonVide(brut.condition) ? brut.condition.trim() : null,
    experienceConcernee: _atsChaineNonVide(brut.experienceConcernee) ? brut.experienceConcernee.trim() : null
  };
}

// --- Reconstruction generique d'une liste --------------------------

function _atsListe(source, reconstruire, ctx) {
  if (!Array.isArray(source)) { return []; }
  var resultat = [];
  source.forEach(function (brut) {
    var entree = reconstruire(brut, ctx);
    if (entree) { resultat.push(entree); }
  });
  return resultat;
}

// --- Dedoublonnage entre les quatre listes -------------------------
// Un terme de la reference ne doit apparaitre qu'une fois. Priorite :
// dejaExprime > peutEtreFormuleAutrement > aVerifier > pasRetrouve.
// Comparaison sur le terme normalise (le terme de la reference, cote
// aVerifier c'est `termeReference`).

function _atsDedoublonner(sortie, ctx) {
  var vus = {};
  function cle(t) { return _atsNormaliser(t); }

  sortie.dejaExprime = sortie.dejaExprime.filter(function (e) {
    var k = cle(e.terme);
    if (vus[k]) { return false; }
    vus[k] = 'dejaExprime';
    return true;
  });
  sortie.peutEtreFormuleAutrement = sortie.peutEtreFormuleAutrement.filter(function (e) {
    var k = cle(e.terme);
    if (vus[k]) { ctx.anomalies.push('« ' + e.terme +' » deja dans ' + vus[k] + ', retire de peutEtreFormuleAutrement'); return false; }
    vus[k] = 'peutEtreFormuleAutrement';
    return true;
  });
  sortie.aVerifier = sortie.aVerifier.filter(function (e) {
    var k = cle(e.termeReference);
    if (vus[k]) { ctx.anomalies.push('« ' + e.termeReference + ' » deja dans ' + vus[k] + ', retire de aVerifier'); return false; }
    vus[k] = 'aVerifier';
    return true;
  });
  sortie.pasRetrouve = sortie.pasRetrouve.filter(function (e) {
    var k = cle(e.terme);
    if (vus[k]) { ctx.anomalies.push('« ' + e.terme + ' » deja dans ' + vus[k] + ', retire de pasRetrouve'); return false; }
    vus[k] = 'pasRetrouve';
    return true;
  });
}

// --- texteCache ---------------------------------------------------

function _atsTexteCache(brut, ctx) {
  var vide = { suspect: false, extraits: [], explication: null };
  if (!brut || brut.suspect !== true) { return vide; }

  var extraits = [];
  if (Array.isArray(brut.extraits)) {
    brut.extraits.forEach(function (ex) {
      if (!ex || typeof ex !== 'object') { return; }
      var bloc = _atsChaineNonVide(ex.bloc) ? ex.bloc.trim() : '';
      if (!bloc || bloc === '...' || bloc === '…') { return; }
      // Le bloc suspect doit figurer dans le CV soumis (sinon l'assistant l'a invente,
      // ou il vient d'une autre conversation).
      if (!_atsExtraitReel(bloc, ctx.cvNormalise)) {
        ctx.anomalies.push('texteCache : bloc absent du CV soumis, extrait ignore');
        return;
      }
      extraits.push({
        avant: _atsChaineNonVide(ex.avant) && ex.avant.trim() !== '...' ? ex.avant.trim() : '',
        bloc: bloc,
        apres: _atsChaineNonVide(ex.apres) && ex.apres.trim() !== '...' ? ex.apres.trim() : ''
      });
    });
  }

  // suspect true mais aucun extrait verifiable : on retombe sur "pas suspect"
  // cote applicatif -- on ne montre jamais une alerte sans extrait a l'appui.
  if (!extraits.length) {
    ctx.anomalies.push('texteCache : suspect=true sans extrait verifiable, ramene a suspect=false');
    return vide;
  }

  return {
    suspect: true,
    extraits: extraits,
    explication: _atsChaineNonVide(brut.explication) && brut.explication.trim() !== '...' ? brut.explication.trim() : null
  };
}

// --- sansOffre / sources ----------------------------------------

function _atsSansOffre(brut) {
  if (!brut || typeof brut !== 'object') { return null; }
  var mots = Array.isArray(brut.motsPrioritaires)
    ? brut.motsPrioritaires.filter(_atsChaineNonVide).map(function (m) { return m.trim(); }).slice(0, 3)
    : [];
  var clarif = _atsChaineNonVide(brut.clarificationProjet) ? brut.clarificationProjet.trim() : null;
  if (!mots.length && !clarif) { return null; }
  return { motsPrioritaires: mots, clarificationProjet: clarif };
}

function _atsSources(brut, aUnTermeWeb, ctx) {
  if (!aUnTermeWeb) {
    if (Array.isArray(brut) && brut.length) {
      ctx.anomalies.push('sources fournies sans aucun terme d\'origine "web", liste ignoree');
    }
    return [];
  }
  if (!Array.isArray(brut)) { return []; }
  return brut
    .filter(function (s) { return s && _atsChaineNonVide(s.url); })
    .map(function (s) {
      return {
        url: s.url.trim(),
        date: _atsChaineNonVide(s.date) ? s.date.trim() : null,
        objet: _atsChaineNonVide(s.objet) ? s.objet.trim() : null
      };
    });
}

// --- Point d'entree --------------------------------------------

// deps.extraireJSON : (texte) -> objet|null. Defaut = extraireBlocJSONDepuisTexte
// (global navigateur, ou require('../../js/app.js') en Node).
// modeReference (facultatif) : 'offre' | 'metier', le mode REELLEMENT choisi
// par la personne (_atsEtat.modeReference). Sert uniquement de garde-fou pour
// `sansOffre` (voir plus bas) -- absent, le comportement est inchange.
function parserResultatAts(reponseCollee, cvTexte, deps, modeReference) {
  deps = deps || {};
  var extraireJSON = deps.extraireJSON
    || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null)
    || null;

  var base = {
    lisible: false,
    analyseImpossible: false,
    messageImpossible: null,
    cvPeuFourni: false,
    referenceFaible: false,
    texteCache: { suspect: false, extraits: [], explication: null },
    dejaExprime: [],
    peutEtreFormuleAutrement: [],
    pasRetrouve: [],
    aVerifier: [],
    changementsPrioritaires: [],
    sansOffre: null,
    sources: [],
    anomalies: []
  };

  if (!extraireJSON) {
    base.anomalies.push('Aucune fonction d\'extraction JSON disponible (extraireBlocJSONDepuisTexte).');
    return base;
  }

  var obj = null;
  try { obj = extraireJSON(reponseCollee); } catch (e) { obj = null; }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    return base; // lisible: false
  }

  base.lisible = true;

  if (obj.analyseImpossible === true) {
    base.analyseImpossible = true;
    base.messageImpossible = _atsChaineNonVide(obj.message)
      ? obj.message.trim()
      : 'Le CV fourni ne permet pas de comparer son vocabulaire.';
    return base;
  }

  var ctx = { anomalies: base.anomalies, cvNormalise: _atsNormaliser(cvTexte) };
  if (!ctx.cvNormalise) {
    base.anomalies.push('CV soumis vide ou absent : les extraits ne peuvent pas etre verifies, listes ancrees sur le CV ecartees.');
  }

  base.cvPeuFourni = obj.cvPeuFourni === true;
  base.referenceFaible = obj.referenceFaible === true;

  base.dejaExprime = _atsListe(obj.dejaExprime, _atsEntreeDejaExprime, ctx);
  base.peutEtreFormuleAutrement = _atsListe(obj.peutEtreFormuleAutrement, _atsEntreePeutEtreFormuleAutrement, ctx)
    .slice(0, 5); // plafond du prompt (section 4)
  base.pasRetrouve = _atsListe(obj.pasRetrouve, _atsEntreePasRetrouve, ctx);
  base.aVerifier = _atsListe(obj.aVerifier, _atsEntreeAVerifier, ctx);

  _atsDedoublonner(base, ctx);

  base.changementsPrioritaires = _atsListe(obj.changementsPrioritaires, _atsEntreeChangement, ctx);
  // Un motReference distinct par changement (section 5 du prompt), plafond 3.
  var motsVus = {};
  base.changementsPrioritaires = base.changementsPrioritaires.filter(function (c) {
    var k = _atsNormaliser(c.motReference);
    if (motsVus[k]) { ctx.anomalies.push('changement en double sur « ' + c.motReference + ' », retire'); return false; }
    motsVus[k] = true;
    return true;
  }).slice(0, 3);

  base.texteCache = _atsTexteCache(obj.texteCache, ctx);
  base.sansOffre = _atsSansOffre(obj.sansOffre);
  // Garde-fou "incoherence entre modes" (prompts/ats.md section 6 :
  // "sansOffre present uniquement en mode metier, vaut null en mode
  // offre"). Si l'assistant l'a quand meme rempli alors que la personne a
  // fourni une offre, l'ecran "Resultat" afficherait un bloc "Sans offre
  // precise" qui contredit ce qu'elle a saisi -- on l'ignore plutot que de
  // faire confiance a l'assistant sur ce point.
  if (modeReference === 'offre' && base.sansOffre) {
    ctx.anomalies.push('sansOffre fourni en mode offre (interdit par la consigne), ignore');
    base.sansOffre = null;
  }

  var aUnTermeWeb = [].concat(base.dejaExprime, base.peutEtreFormuleAutrement, base.pasRetrouve)
    .some(function (e) { return e.origine === 'web'; });
  base.sources = _atsSources(obj.sources, aUnTermeWeb, ctx);

  return base;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parserResultatAts: parserResultatAts,
    _atsNormaliser: _atsNormaliser,
    _atsExtraitReel: _atsExtraitReel
  };
}
