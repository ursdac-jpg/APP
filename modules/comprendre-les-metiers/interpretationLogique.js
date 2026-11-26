/* ============================================================
   Module « Explorer les métiers » : INTERPRÉTATION D'UN CHEMIN, LOGIQUE PURE (aucun DOM, aucun stockage). Testé par tests/interpretationChemin.test.js.
   Créé le 22/11/2026 (consignes 537 et 543, maquette docs/MAQUETTE_INTERPRETATION_PAR_CHEMIN_ET_QUESTIONS_EXPLORER_LES_METIERS_2026-11-22.html, validée).
   Étape 1 : le chemin « Chercher un métier » seulement. Les chemins 2 et 3 réutiliseront ces fonctions avec leur propre prompt.

   Trois choses, jamais mélangées :
   1. LA DEMANDE : la même source que « Ma lecture » (synConstruireDemande, syntheseLectureLogique.js) avec la portée 'metier' : seul le passage 1, le parcours, la situation et les mots libres ;
   2. LA RÉPONSE (intAnalyser) : un seul bloc de données "fin":"complet" ; texte nettoyé comme partout (aucun lien, aucun tiret long, aucune balise) ;
      une réponse vide, coupée, mal formée ou sans contenu ne donne jamais une page à moitié fausse ;
   3. LES QUESTIONS : au plus cinq, chacune avec un sujet de la liste fermée (INT_SUJETS) ; un sujet inconnu devient « autre » ; deux questions du même sujet dans un même chemin : la première reste.
      Un nombre de questions sous INT_MIN_QUESTIONS n'est pas refusé : l'interprétation est gardée, le drapeau questionsInsuffisantes propose de redemander (décision de Denis, consigne 543).
   Les questions restent CACHÉES : l'écran de l'interprétation n'en montre que le nombre ; elles ne s'ouvrent qu'à l'étape suivante (la synthèse globale).
   ============================================================ */

var _intBase = (typeof synConstruireDemande === 'function')
  ? { demande: synConstruireDemande, extraire: _synlExtraireBloc, nettoyer: synNettoyerTexteLecture }
  : (function () { var s = require('./syntheseLectureLogique.js'); return { demande: s.synConstruireDemande, extraire: s.synExtraireBlocReponse, nettoyer: s.synNettoyerTexteLecture }; })();

// Liste fermée des sujets de question : c'est elle qui permet de repérer les doublons entre chemins (la même question posée par deux chemins n'est posée qu'une fois).
// Elle est aussi écrite dans prompts/interpretation-chemin-metier.md (un test vérifie que les deux sont identiques).
var INT_SUJETS = ['physique', 'horaires', 'secteur', 'plaisir', 'essayer', 'contact', 'collectif', 'responsabilite', 'mobilite', 'rythme', 'cadre', 'autre'];
var INT_MAX_QUESTIONS = 5;      // plafond par chemin (décision de Denis, consigne 543)
var INT_MIN_QUESTIONS = 3;      // en dessous, on propose de redemander
var INT_MAX_REPONSES = 6, INT_MIN_REPONSES = 2;
var INT_CHAMPS_TEXTE = ['choix', 'parcours', 'limites'];

// La demande de l'interprétation du chemin 1 : mêmes données que « Ma lecture », sans les autres passages.
// chemin = 'metier' (par défaut), 'actions' ou 'q' : seul ce passage est écrit dans la demande.
function intConstruireDemande(modele, donnees, chemin) {
  return _intBase.demande(modele, donnees, ['metier', 'actions', 'q'].indexOf(chemin) !== -1 ? chemin : 'metier');
}

// Une empreinte courte et stable d'un texte (jamais un secret) : elle sert à reconnaître que les choix d'un chemin n'ont pas changé depuis l'interprétation.
function intEmpreinte(texte) {
  var h = 5381, t = String(texte === null || texte === undefined ? '' : texte);
  for (var k = 0; k < t.length; k++) { h = ((h * 33) ^ t.charCodeAt(k)) >>> 0; }
  return 'h' + h.toString(36);
}
function _intEmpreinteValide(x) { return typeof x === 'string' && /^h[0-9a-z]{1,10}$/.test(x); }

function _intTexte(t) { return _intBase.nettoyer(t); }

function _intQuestions(brut) {
  var vus = {}, out = [];
  (Array.isArray(brut) ? brut : []).forEach(function (q) {
    if (!q || typeof q !== 'object' || out.length >= INT_MAX_QUESTIONS) { return; }
    var texte = _intTexte(q.texte);
    var reps = [];
    (Array.isArray(q.reponses) ? q.reponses : []).forEach(function (r) {
      var t = _intTexte(r);
      if (t && t.length <= 120 && reps.indexOf(t) === -1) { reps.push(t); }
    });
    reps = reps.slice(0, INT_MAX_REPONSES);
    if (!texte || reps.length < INT_MIN_REPONSES) { return; }
    var sujet = String(q.sujet || '').toLowerCase().replace(/[^a-z]/g, '');
    if (INT_SUJETS.indexOf(sujet) === -1) { sujet = 'autre'; }
    // Deux questions du même sujet dans un même chemin ne sont pas gardées (sauf « autre », qui ne se regroupe jamais).
    if (sujet !== 'autre') { if (vus[sujet]) { return; } vus[sujet] = true; }
    out.push({ sujet: sujet, texte: texte, reponses: reps, plusieurs: q.plusieurs === true });
  });
  return out;
}

function _intMetiers(brut) {
  return (Array.isArray(brut) ? brut : []).map(function (m) {
    if (!m || typeof m !== 'object') { return null; }
    return { metier: _intBase.nettoyer(m.metier, 200), sens: _intTexte(m.sens), verifier: _intTexte(m.verifier) };
  }).filter(function (m) { return m && m.metier; });
}

// Nombre de parties lisibles de l'interprétation (les trois textes et la liste de métiers).
function intNbParties(i) {
  if (!i) { return 0; }
  return INT_CHAMPS_TEXTE.filter(function (k) { return !!i[k]; }).length + ((i.metiers && i.metiers.length) ? 1 : 0);
}

// Retourne { ok, interpretation } ou { ok:false, raison: 'vide' | 'coupee' | 'illisible' | 'sans_contenu' }.
// interpretation = { choix, parcours, limites, metiers: [{ metier, sens, verifier }], questions: [{ sujet, texte, reponses, plusieurs }], questionsInsuffisantes }.
function intAnalyser(texte) {
  var brut = String(texte === null || texte === undefined ? '' : texte);
  if (!brut.trim()) { return { ok: false, raison: 'vide' }; }
  var bloc = _intBase.extraire(brut);
  if (!bloc) { return { ok: false, raison: 'illisible' }; }
  var marque = /"fin"\s*:\s*"complet"/.test(bloc);
  var obj = null;
  try { obj = JSON.parse(bloc); } catch (e1) {
    try { obj = JSON.parse(bloc.replace(/,\s*([}\]])/g, '$1')); } catch (e2) { obj = null; }
  }
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) { return { ok: false, raison: marque ? 'illisible' : 'coupee' }; }
  if (!marque && String(obj.fin || '').replace(/\s+/g, '').toLowerCase() !== 'complet') { return { ok: false, raison: 'coupee' }; }
  var i = { choix: _intTexte(obj.choix), parcours: _intTexte(obj.parcours), limites: _intTexte(obj.limites), metiers: _intMetiers(obj.metiers), questions: _intQuestions(obj.questions), questionsInsuffisantes: false };
  if (intNbParties(i) < 2) { return { ok: false, raison: 'sans_contenu' }; }
  i.questionsInsuffisantes = i.questions.length < INT_MIN_QUESTIONS;
  return { ok: true, interpretation: i };
}

/* ------------------------------------------------------------
   4. Les questions, au moment de la synthèse (étape 2, consigne 543) : regrouper les doublons, garder les réponses, écrire ce qui part dans la demande
   ------------------------------------------------------------ */

// Les trois chemins : n = numéro du passage dans « Ma synthèse », cle = clé de l'interprétation et du chemin (cmvEntrerDansChemin).
var INT_CHEMINS = [
  { n: 1, cle: 'metier', nom: 'Chercher un métier', icone: 'bi-search' },
  { n: 2, cle: 'actions', nom: 'Partir de vos envies', icone: 'bi-list-check' },
  { n: 3, cle: 'q', nom: 'Le questionnaire de préférences', icone: 'bi-hexagon' }
];
var INT_NON = '__non';          // « Je préfère ne pas répondre » : compte comme répondu, ne part jamais dans la demande
var INT_MAX_LIBRE = 300;        // mots écrits par la personne pour une question
// Une question n'est pas reposée quand la personne a déjà cliqué la réponse dans « Ce que les tests ne disent pas » (décision de Denis, consigne 543, point 3).
var INT_SUJETS_CONNUS = { mobilite: ['deplacer', 'permis'], secteur: ['rester', 'changer'] };

function intListeFr(a) { return a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' et ' + a[a.length - 1]; }
// « passage 1 », « passages 1 et 2 » : les mêmes mots que la demande à l'assistant (« PASSAGE 1, … »).
function intNomsPassages(ns) { return (ns.length > 1 ? 'passages ' : 'passage ') + intListeFr(ns.map(String)); }

// interpretations = { metier: { questions }, actions: ..., q: ... } ; actifs = numéros des passages pris en compte ; complements = identifiants cochés dans « Ce que les tests ne disent pas ».
// Retourne { brut, uniques: [{ cle, sujet, texte, reponses, plusieurs, chemins: [n] }], doublons, connues }.
// Deux questions du même sujet n'en font qu'une (la première écrite reste) ; « autre » ne se regroupe jamais.
function intRegrouperQuestions(interpretations, actifs, complements) {
  var map = {}, ordre = [], brut = 0, connues = 0, comp = Array.isArray(complements) ? complements : [];
  INT_CHEMINS.forEach(function (c) {
    var i = interpretations && interpretations[c.cle];
    if (!i || !Array.isArray(i.questions) || (actifs || []).indexOf(c.n) === -1) { return; }
    i.questions.forEach(function (q, k) {
      brut++;
      var deja = INT_SUJETS_CONNUS[q.sujet];
      if (deja && deja.some(function (id) { return comp.indexOf(id) !== -1; })) { connues++; return; }
      var cle = q.sujet === 'autre' ? 'autre:' + c.n + ':' + k : q.sujet;
      if (map[cle]) { if (map[cle].chemins.indexOf(c.n) === -1) { map[cle].chemins.push(c.n); } return; }
      map[cle] = { cle: cle, sujet: q.sujet, texte: q.texte, reponses: q.reponses.slice(), plusieurs: !!q.plusieurs, chemins: [c.n] };
      ordre.push(cle);
    });
  });
  var uniques = ordre.map(function (cle) { return map[cle]; });
  return { brut: brut, uniques: uniques, doublons: brut - connues - uniques.length, connues: connues };
}

// Une réponse = { choix: [libellés], libre }. Retourne la nouvelle réponse (rien n'est modifié sur place) ; une valeur qui n'est pas proposée est ignorée.
function intBasculerReponse(rep, question, valeur) {
  var cur = { choix: (rep && Array.isArray(rep.choix)) ? rep.choix.slice() : [], libre: (rep && typeof rep.libre === 'string') ? rep.libre : '' };
  if (valeur === INT_NON) { cur.choix = cur.choix.indexOf(INT_NON) !== -1 ? [] : [INT_NON]; return cur; }
  if (!question || question.reponses.indexOf(valeur) === -1) { return cur; }
  cur.choix = cur.choix.filter(function (x) { return x !== INT_NON; });
  var p = cur.choix.indexOf(valeur);
  if (p !== -1) { cur.choix.splice(p, 1); }
  else if (question.plusieurs) { cur.choix.push(valeur); }
  else { cur.choix = [valeur]; }
  return cur;
}
function intRepondue(rep) { return !!(rep && ((Array.isArray(rep.choix) && rep.choix.length) || (typeof rep.libre === 'string' && rep.libre.trim()))); }
function intNbRepondues(uniques, reponses) {
  return (uniques || []).filter(function (q) { return intRepondue(reponses && reponses[q.cle]); }).length;
}
// Les mots de la personne : nettoyés comme tout texte, et bornés.
function intNettoyerLibre(t) { var s = _intTexte(t); return s.length > INT_MAX_LIBRE ? s.slice(0, INT_MAX_LIBRE).trim() : s; }

// Les lignes qui partent dans la demande de la synthèse : une par question répondue, jamais « ne pas répondre », jamais le texte d'une interprétation.
function intLignesReponses(uniques, reponses) {
  var lignes = [];
  (uniques || []).forEach(function (q) {
    var r = reponses && reponses[q.cle];
    if (!intRepondue(r)) { return; }
    var choix = (r.choix || []).filter(function (x) { return x !== INT_NON && q.reponses.indexOf(x) !== -1; }), libre = intNettoyerLibre(r.libre);
    if (!choix.length && !libre) { return; }
    lignes.push('- ' + q.texte + ' (' + intNomsPassages(q.chemins) + ') : ' + choix.join(' ; ') + (choix.length && libre ? ' ; ' : '') + (libre ? '« ' + libre + ' »' : ''));
  });
  return lignes;
}

/* ------------------------------------------------------------
   5. Vers la disquette et depuis elle (étape 2b, consigne 543) : seulement quand la personne a gardé sa synthèse (voir synPourFichier, syntheseLogique.js)
   Gardés : les interprétations reçues (textes nettoyés, questions) et les réponses CLIQUÉES. Jamais les mots écrits par la personne, jamais les passages mis de côté.
   Une interprétation relue n'a plus de repère de choix : elle reste valable jusqu'à ce que la personne refasse des choix (voir intVerifierPeremption, interpretation.js).
   ------------------------------------------------------------ */
var INT_CLES_CHEMINS = ['metier', 'actions', 'q'];
var INT_MAX_CLES_REPONSES = 40;
var INT_VERSION_FICHIER = 1;

function _intInterpretationNettoyee(i) {
  if (!i || typeof i !== 'object' || Array.isArray(i)) { return null; }
  var o = { choix: _intTexte(i.choix), parcours: _intTexte(i.parcours), limites: _intTexte(i.limites), metiers: _intMetiers(i.metiers), questions: _intQuestions(i.questions), questionsInsuffisantes: false };
  if (intNbParties(o) < 2) { return null; }
  o.questionsInsuffisantes = o.questions.length < INT_MIN_QUESTIONS;
  o.date = typeof i.date === 'string' ? i.date.replace(/[^0-9A-Za-z\/\-: ]/g, '').slice(0, 40) : '';
  // Chemins 2 et 3 : l'empreinte des choix est gardée, pour retirer l'interprétation si les choix relus sont autres. Chemin 1 : jamais (ses choix ne sont pas dans la disquette).
  if (_intEmpreinteValide(i.signature)) { o.signature = i.signature; }
  return o;
}
// Les réponses cliquées : { clé de question : [libellés] }. Les mots libres ne sont jamais gardés.
function _intReponsesCliquees(reponses) {
  var out = {}, n = 0;
  if (!reponses || typeof reponses !== 'object') { return out; }
  Object.keys(reponses).forEach(function (cle) {
    if (n >= INT_MAX_CLES_REPONSES || !/^[a-z]+(:\d:\d)?$/.test(cle)) { return; }
    var r = reponses[cle];
    var choix = (r && Array.isArray(r.choix)) ? r.choix : (Array.isArray(r) ? r : []);
    var propres = [];
    choix.forEach(function (x) { if (typeof x === 'string' && x.length <= 120 && propres.indexOf(x) === -1 && propres.length < INT_MAX_REPONSES) { propres.push(x); } });
    if (propres.length) { out[cle] = propres; n++; }
  });
  return out;
}
// Retourne { version, interpretations: { clé: interprétation }, reponses: { clé: [libellés] } } ou null s'il n'y a rien à garder.
function intPourFichier(interpretations, reponses) {
  var inter = {}, n = 0;
  INT_CLES_CHEMINS.forEach(function (cle) {
    var i = interpretations && _intInterpretationNettoyee(interpretations[cle]);
    if (i) { inter[cle] = i; n++; }
  });
  if (!n) { return null; }
  return { version: INT_VERSION_FICHIER, interpretations: inter, reponses: _intReponsesCliquees(reponses) };
}
// Relit avec méfiance ce qui vient d'un fichier. Retourne { interpretations, reponsesQ } (la signature est vide : voir plus haut) ou null.
function intNormaliserDepuisFichier(brut) {
  if (!brut || typeof brut !== 'object' || Array.isArray(brut) || !brut.interpretations || typeof brut.interpretations !== 'object') { return null; }
  var inter = {}, n = 0;
  INT_CLES_CHEMINS.forEach(function (cle) {
    var i = _intInterpretationNettoyee(brut.interpretations[cle]);
    if (i) { if (!i.signature) { i.signature = null; } inter[cle] = i; n++; }
  });
  if (!n) { return null; }
  var rq = _intReponsesCliquees(brut.reponses), reponsesQ = {};
  Object.keys(rq).forEach(function (cle) { reponsesQ[cle] = { choix: rq[cle], libre: '' }; });
  return { interpretations: inter, reponsesQ: reponsesQ };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INT_SUJETS: INT_SUJETS, INT_MAX_QUESTIONS: INT_MAX_QUESTIONS, INT_MIN_QUESTIONS: INT_MIN_QUESTIONS, intConstruireDemande: intConstruireDemande, intAnalyser: intAnalyser, intNbParties: intNbParties,
    INT_CHEMINS: INT_CHEMINS, INT_NON: INT_NON, INT_MAX_LIBRE: INT_MAX_LIBRE, INT_SUJETS_CONNUS: INT_SUJETS_CONNUS, intNomsPassages: intNomsPassages, intRegrouperQuestions: intRegrouperQuestions,
    intBasculerReponse: intBasculerReponse, intRepondue: intRepondue, intNbRepondues: intNbRepondues, intNettoyerLibre: intNettoyerLibre, intLignesReponses: intLignesReponses, intEmpreinte: intEmpreinte,
    intPourFichier: intPourFichier, intNormaliserDepuisFichier: intNormaliserDepuisFichier, INT_VERSION_FICHIER: INT_VERSION_FICHIER };
}
