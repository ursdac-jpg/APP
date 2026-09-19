/* ============================================================
   modules/regard-recruteur/rapportResponseParser.js
   ------------------------------------------------------------
   Interprete la reponse collee par la personne (sortie de
   prompts/regard-recruteur.md) en RapportRegardRecruteur, selon le
   contrat de docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md.

   Pur, sans DOM. Node-testable (tests/regardRecruteurResponseParser.test.js).

   MODULE AUTONOME (objectif Niveau 2, decision Denis 2026-09-03) : aucune
   dependance dure a js/app.js ni au module Bilan.
   - `extraireJSON` est injectable (dependances.extraireJSON). Defaut :
     le global extraireBlocJSONDepuisTexte s'il est charge (navigateur),
     sinon un extracteur minimal embarque ci-dessous.
   - L'assainissement typographique (tirets longs -> tiret court) est
     embarque, pas emprunte au module Bilan.

   Principes du schema, appliques ici :
   - Les 6 axes et leur ordre sont FIXES cote code, jamais lus depuis la
     reponse. L'assistant ne remplit que le contenu.
   - modeAnalyse et siteEntrepriseFourni viennent du CONTEXTE (connus avec
     certitude par l'application), jamais de la reponse.
   - `afficher` est RECALCULE (jamais celui de la reponse) : un axe
     s'affiche seulement s'il a au moins un point ET n'est pas hors sujet
     (presentation / couleurs en mode texte).
   - `pointsARetenir` est CONSTRUIT par le code a partir des `piste` des
     axes, jamais produit par l'assistant.
   - Une question sans `origine` ancree dans le CV est retiree.
   ============================================================ */

// Ordre canonique des axes (schema section 4). Ne jamais reordonner.
var REGARD_RECRUTEUR_AXES = ['positif', 'coherence', 'message', 'premiere-lecture', 'presentation', 'couleurs'];

var _RR_AXES_IMAGE_SEULEMENT = ['presentation', 'couleurs'];
var _RR_PLAFOND_POINTS = { 'positif': 5, 'coherence': 3, 'message': 5, 'premiere-lecture': 1, 'presentation': 6, 'couleurs': 2 };
var _RR_PLAFOND_QUESTIONS = 5;          // affichage : les 5 premieres (schema section 4)
var _RR_PLAFOND_A_RETENIR = 6;
var _RR_ORDRE_A_RETENIR = ['coherence', 'message', 'presentation', 'couleurs'];  // schema section 6
var _RR_A_RETENIR_VIDE = "Rien d'urgent a changer : votre CV est deja lisible.";

var _RR_MSG_ANALYSE_IMPOSSIBLE_DEFAUT =
  "Nous n'avons pas reussi a lire ce CV. Verifiez que vous avez bien ajoute l'image ou le document a ce message, que l'image est nette, ou que le texte est complet, puis reessayez.";
var _RR_MSG_CV_COURT_DEFAUT =
  "Votre CV est encore court : cette lecture est forcement partielle, c'est normal a ce stade.";

// ---- utilitaires internes ----

function _rrErreur(code, message) {
  var e = new Error(message || code);
  e.code = code;
  e.nom = 'ErreurRegardRecruteur';
  return e;
}

function _rrTexte(v) {
  return (typeof v === 'string') ? v.trim() : '';
}

// Tirets longs (cadratin, demi-cadratin...) -> tiret court. Regle 0bis :
// jamais de tiret cadratin, meme dans une sortie d'assistant.
function _rrAssainir(v) {
  if (typeof v !== 'string') { return v; }
  return v
    .replace(/[—–‒―−]/g, '-')
    .replace(/ /g, ' ')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

// Filet minimal si le global extraireBlocJSONDepuisTexte n'est pas la
// (contexte Node du test, ou module deploye seul). Volontairement plus
// simple que celui de js/app.js : les cas rares (guillemets courbes,
// valeurs sans guillemets) sont couverts par le vrai extracteur en
// production ; ici on veut juste que le module reste autonome.
function _rrExtraireJSONFallback(texte) {
  var brut = (texte || '').trim();
  if (!brut) { return null; }
  var candidats = [brut];
  var bloc = brut.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (bloc) { candidats.push(bloc[1].trim()); }
  var a = brut.indexOf('{');
  var b = brut.lastIndexOf('}');
  if (a !== -1 && b > a) { candidats.push(brut.slice(a, b + 1)); }
  var normalises = candidats.map(function (c) {
    return c
      .replace(/[“”‟″]/g, '"')
      .replace(/[‘’‛′]/g, "'")
      .replace(/,(\s*[}\]])/g, '$1');
  });
  candidats = candidats.concat(normalises);
  for (var i = 0; i < candidats.length; i++) {
    try {
      var o = JSON.parse(candidats[i]);
      if (o && typeof o === 'object' && !Array.isArray(o)) { return o; }
    } catch (e) { /* candidat suivant */ }
  }
  return null;
}

function _rrNormaliserPoint(p) {
  if (!p || typeof p !== 'object') { return { titre: '', constat: '', lecture: '', piste: '' }; }
  return {
    titre: _rrAssainir(_rrTexte(p.titre)),
    constat: _rrAssainir(_rrTexte(p.constat)),
    lecture: _rrAssainir(_rrTexte(p.lecture)),
    piste: _rrAssainir(_rrTexte(p.piste))
  };
}

// Schema section 6 : les `piste` non vides, dans l'ordre coherence >
// message > presentation > couleurs, dedoublonnees, plafonnees a 6.
// Jamais depuis `positif` ni `premiere-lecture`. Si rien : la phrase
// de repli.
function _rrConstruirePointsARetenir(axes) {
  var axeParId = {};
  axes.forEach(function (a) { axeParId[a.id] = a; });
  var vues = Object.create(null);
  var liste = [];
  _RR_ORDRE_A_RETENIR.forEach(function (id) {
    var axe = axeParId[id];
    if (!axe || !axe.afficher) { return; }
    axe.points.forEach(function (p) {
      if (!p.piste) { return; }
      var cle = p.piste.toLowerCase().replace(/\s+/g, ' ').trim();
      if (vues[cle]) { return; }
      vues[cle] = true;
      liste.push(p.piste);
    });
  });
  liste = liste.slice(0, _RR_PLAFOND_A_RETENIR);
  return liste.length ? liste : [_RR_A_RETENIR_VIDE];
}

function _rrRapportVide(modeAnalyse) {
  return {
    modeAnalyse: modeAnalyse,
    analyseImpossible: false,
    messageAnalyseImpossible: '',
    cvCourt: false,
    messageCvCourt: '',
    syntheseOuverture: '',
    axes: REGARD_RECRUTEUR_AXES.map(function (id) { return { id: id, afficher: false, points: [] }; }),
    questionsLieesAuCv: [],
    pointsARetenir: []
  };
}

// ---- parser principal ----

// texteColle : la reponse brute de l'assistant (peut contenir de la prose
//   autour du bloc JSON).
// contexte : { modeAnalyse: 'image'|'texte', siteEntrepriseFourni: bool }
//   -- connu avec certitude par l'application, jamais lu dans la reponse.
// dependances : { extraireJSON } -- injectable.
// Retourne un RapportRegardRecruteur. Leve une ErreurRegardRecruteur de
// code 'reponse_illisible' si aucun JSON exploitable (l'assistant a
// refuse, a commente la consigne, ou la reponse est tronquee).
function regardRecruteurParserRapport(texteColle, contexte, dependances) {
  contexte = contexte || {};
  dependances = dependances || {};
  var modeAnalyse = (contexte.modeAnalyse === 'texte') ? 'texte' : 'image';
  var siteEntrepriseFourni = contexte.siteEntrepriseFourni === true;

  var extraireJSON = dependances.extraireJSON
    || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : _rrExtraireJSONFallback);

  var brut = extraireJSON(texteColle);
  if (!brut || typeof brut !== 'object' || Array.isArray(brut)) {
    throw _rrErreur('reponse_illisible', "Aucun bloc JSON exploitable dans la reponse.");
  }

  // L'assistant a bien repondu, mais pas dans la forme attendue (il a
  // commente la consigne, decrit sa demarche...) : aucun champ connu.
  var aUnChampConnu = ('axes' in brut) || (brut.analyseImpossible === true)
    || ('syntheseOuverture' in brut) || ('questionsLieesAuCv' in brut) || ('cvCourt' in brut);
  if (!aUnChampConnu) {
    throw _rrErreur('reponse_illisible', "La reponse ne suit pas le format demande.");
  }

  // --- analyseImpossible : on renvoie le rapport vide + le message ---
  if (brut.analyseImpossible === true) {
    var vide = _rrRapportVide(modeAnalyse);
    vide.analyseImpossible = true;
    vide.messageAnalyseImpossible = _rrAssainir(_rrTexte(brut.messageAnalyseImpossible)) || _RR_MSG_ANALYSE_IMPOSSIBLE_DEFAUT;
    return vide;
  }

  // --- axes : on part de l'ordre canonique, jamais de celui de la reponse ---
  var axesParId = Object.create(null);
  if (Array.isArray(brut.axes)) {
    brut.axes.forEach(function (a) {
      if (a && typeof a === 'object' && typeof a.id === 'string') { axesParId[a.id.trim()] = a; }
    });
  }

  var axes = REGARD_RECRUTEUR_AXES.map(function (id) {
    var src = axesParId[id];
    var pointsBruts = (src && Array.isArray(src.points)) ? src.points : [];
    var points = pointsBruts
      .map(_rrNormaliserPoint)
      .filter(function (p) { return p.constat.length > 0; });

    if (id === 'premiere-lecture') {
      points = points.slice(0, 1);
    } else if (id === 'couleurs' && !siteEntrepriseFourni) {
      // Sans le site de l'entreprise : on retire le point sur ses codes visuels.
      points = points.filter(function (p) { return !/entreprise|codes?\s+visuels?/i.test(p.titre); });
    }
    points = points.slice(0, _RR_PLAFOND_POINTS[id]);

    var horsSujetTexte = (modeAnalyse === 'texte' && _RR_AXES_IMAGE_SEULEMENT.indexOf(id) !== -1);
    return { id: id, afficher: !horsSujetTexte && points.length > 0, points: points };
  });

  // --- questions liees au CV : origine obligatoire, classees, plafond 5 ---
  var questions = [];
  if (Array.isArray(brut.questionsLieesAuCv)) {
    questions = brut.questionsLieesAuCv
      .map(function (q) {
        if (!q || typeof q !== 'object') { return null; }
        return {
          question: _rrAssainir(_rrTexte(q.question)),
          origine: _rrAssainir(_rrTexte(q.origine)),
          ceQueLeRecruteurCherche: _rrAssainir(_rrTexte(q.ceQueLeRecruteurCherche)),
          commentYRepondre: _rrAssainir(_rrTexte(q.commentYRepondre))
        };
      })
      .filter(function (q) { return q && q.question.length > 0 && q.origine.length > 0; })
      .slice(0, _RR_PLAFOND_QUESTIONS);
  }

  return {
    modeAnalyse: modeAnalyse,
    analyseImpossible: false,
    messageAnalyseImpossible: '',
    cvCourt: brut.cvCourt === true,
    messageCvCourt: (brut.cvCourt === true)
      ? (_rrAssainir(_rrTexte(brut.messageCvCourt)) || _RR_MSG_CV_COURT_DEFAUT)
      : '',
    syntheseOuverture: _rrAssainir(_rrTexte(brut.syntheseOuverture)),
    axes: axes,
    questionsLieesAuCv: questions,
    pointsARetenir: _rrConstruirePointsARetenir(axes)
  };
}

// Verifie qu'un objet a la forme d'un RapportRegardRecruteur exploitable
// par les ecrans. Utilise dans les tests et en garde-fou avant rendu.
function regardRecruteurRapportEstValide(r) {
  if (!r || typeof r !== 'object') { return false; }
  if (typeof r.analyseImpossible !== 'boolean') { return false; }
  if (r.analyseImpossible) { return typeof r.messageAnalyseImpossible === 'string' && r.messageAnalyseImpossible.length > 0; }
  if (!Array.isArray(r.axes) || r.axes.length !== REGARD_RECRUTEUR_AXES.length) { return false; }
  for (var i = 0; i < r.axes.length; i++) {
    if (r.axes[i].id !== REGARD_RECRUTEUR_AXES[i]) { return false; }
    if (typeof r.axes[i].afficher !== 'boolean' || !Array.isArray(r.axes[i].points)) { return false; }
  }
  if (!Array.isArray(r.questionsLieesAuCv)) { return false; }
  if (!Array.isArray(r.pointsARetenir) || r.pointsARetenir.length === 0) { return false; }
  return true;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    regardRecruteurParserRapport: regardRecruteurParserRapport,
    regardRecruteurRapportEstValide: regardRecruteurRapportEstValide,
    REGARD_RECRUTEUR_AXES: REGARD_RECRUTEUR_AXES
  };
}
