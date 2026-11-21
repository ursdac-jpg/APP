/* ============================================================
   Module « Explorer les métiers » : LOGIQUE PURE (aucun DOM, aucun stockage). Testé par tests/comprendreLesMetiersLogique.test.js.
   Créé le 17/11/2026 (phase 2 du plan de clôture, docs/PLAN_CLOTURE_COMPRENDRE_LES_METIERS_2026-11-16.md).

   Trois parties :
   1. QUESTIONNAIRE « Découvrir mes préférences de métier » (entrée 3) : réponses, points, pourcentages, code à trois lettres, textes qui adoucissent.
      Règle validée par Denis le 16/11/2026 : docs/REGLE_DE_CALCUL_RIASEC_2026-11-16.md. Chaque lettre est ramenée à son propre maximum,
      partie par partie, puis les parties sont moyennées. Un refus ne retire jamais de point.
   2. MÉTIERS qui partagent les lettres de la personne (lettres RIASEC du ROME, data/lettresRiasecRome.js) et niveau d'accès. Jamais « adapté », « meilleur » ni « fait pour vous ».
   3. ENTRÉE 2 « Par actions » : le profil envoyé au moteur de pourcentage existant (data/metiers.js), avec ses réglages propres.

   Données lues : data/questionnaireRiasec.js, data/lettresRiasecRome.js, data/metiers.js (navigateur : globales ; Node : require).
   Chargé après ces fichiers, avant l'écran du module.
   ============================================================ */

var CML_LETTRES = ['R', 'I', 'A', 'S', 'E', 'C'];

// Sources (globales du navigateur, sinon require en Node).
function _cmlSource() {
  if (typeof RIASEC_PARTIE_1 !== 'undefined') {
    return {
      p1: RIASEC_PARTIE_1, p2: RIASEC_PARTIE_2, p3: RIASEC_PARTIE_3, p4: RIASEC_PARTIE_4,
      lettresRome: typeof LETTRES_RIASEC_ROME !== 'undefined' ? LETTRES_RIASEC_ROME : {},
      base: typeof baseMetiers !== 'undefined' ? baseMetiers : [],
      niveauAcces: typeof niveauAccesMetier === 'function' ? niveauAccesMetier : function () { return null; },
      rechercher: typeof rechercherMetiers === 'function' ? rechercherMetiers : null,
      correspond: typeof correspond === 'function' ? correspond : null,
      normaliser: typeof normaliserTexte === 'function' ? normaliserTexte : function (s) { return String(s).toLowerCase(); }
    };
  }
  var q = require('../../data/questionnaireRiasec.js');
  var m = require('../../data/metiers.js');
  return {
    p1: q.RIASEC_PARTIE_1, p2: q.RIASEC_PARTIE_2, p3: q.RIASEC_PARTIE_3, p4: q.RIASEC_PARTIE_4,
    lettresRome: require('../../data/lettresRiasecRome.js').LETTRES_RIASEC_ROME,
    base: m.baseMetiers, niveauAcces: m.niveauAccesMetier, rechercher: m.rechercherMetiers, correspond: m.correspond, normaliser: m.normaliserTexte
  };
}
var _cmlMemo = null;
function _cmlSrc() { if (!_cmlMemo) { _cmlMemo = _cmlSource(); } return _cmlMemo; }

/* ------------------------------------------------------------
   1. QUESTIONNAIRE
   ------------------------------------------------------------ */

var CMQ_PARTIES = ['p1', 'p2', 'p3', 'p4'];

// Réponses proposées et points (les libellés sont ceux validés le 16/11/2026, docs/TEXTES_OUVERTURE_QUESTIONNAIRE_RIASEC_2026-11-16.md).
var _CMQ_OUI_NON = [
  { id: 'oui', libelle: 'Ça me plairait', points: 1 },
  { id: 'non', libelle: 'Ça ne me plairait pas', points: 0 },
  { id: 'nsp', libelle: 'Je ne sais pas', points: 0 }
];
var CMQ_REPONSES = {
  p1: _CMQ_OUI_NON,
  p2: _CMQ_OUI_NON,
  p3: [
    { id: 'pas_encore', libelle: 'Pas encore', points: 0 },
    { id: 'en_progres', libelle: 'En progrès', points: 1 },
    { id: 'a_laise', libelle: 'À l’aise', points: 2 }
  ],
  p4: [
    { id: 'ressemble', libelle: 'Ça me ressemble', points: 2 },
    { id: 'un_peu', libelle: 'Un peu', points: 1 },
    { id: 'pas_vraiment', libelle: 'Pas vraiment', points: 0 }
  ]
};

// Seuils validés le 16/11/2026 (ils pourront être ajustés après les essais réels).
var CMQ_SEUIL_PROCHES = 3;          // deux lettres à moins de 3 points sont « proches »
var CMQ_SEUIL_REPARTIES = 15;       // écart entre la plus haute et la plus basse inférieur à 15 : préférences réparties
var CMQ_SEUIL_PEU_REPONSES = 25;    // lettre la plus haute inférieure à 25 % : aucun code
var CMQ_SEUIL_LETTRE = 10;          // une lettre qui vaut moins de 10 % n'entre pas dans le code (décision de Denis, 17/11/2026) : le code compte 1, 2 ou 3 lettres
var CMQ_SEUIL_AXE = 10;             // un axe n'est dit que si l'écart dépasse 10 points

var CMQ_TEXTES = {
  reparties: 'Vos réponses se ressemblent d’une lettre à l’autre : plusieurs univers vous attirent à peu près autant. Ce n’est ni bon ni mauvais, cela signifie que vous pouvez explorer plusieurs directions.',
  peuReponses: 'Vos réponses ne font pas ressortir de direction nette pour le moment. Vous pouvez recommencer plus tard, ou explorer les métiers un par un.',
  sousSeuil: 'Les autres lettres comptent moins de 10 % dans vos réponses : elles ne sont pas retenues parmi vos lettres principales.',
  frontiere: 'La troisième lettre est très proche de la suivante : les deux univers vous parlent à peu près de la même manière.',
  sansPartie4: 'Ce résultat est calculé sans la partie sur la personnalité.',
  explicationBarres: 'Une préférence peu marquée n’est pas une note : elle dit seulement la place qu’occupe cet univers dans vos choix aujourd’hui.',
  niveaux: {
    tres_marquee: 'Une préférence très marquée',
    marquee: 'Une préférence marquée',
    presente: 'Une préférence présente',
    peu_marquee: 'Une préférence peu marquée'
  },
  // Les deux axes (théorie de Holland prolongée par Prediger) : une phrase, jamais un chiffre.
  personnes: 'Vous vous orientez plutôt vers les personnes que vers les objets.',
  objets: 'Vous vous orientez plutôt vers les objets et les choses concrètes que vers les personnes.',
  donnees: 'Vous vous orientez plutôt vers les données et l’organisation que vers les idées et la création.',
  idees: 'Vous vous orientez plutôt vers les idées et la création que vers les données et l’organisation.'
};

function cmqEnonces(partie) { return _cmlSrc()[partie] || []; }

// Points maximum d'une lettre dans chaque partie : 15 énoncés (partie 1), la somme des parts des 90 lignes (partie 2), 2 points par énoncé (parties 3 et 4).
// Calculés depuis les données, jamais écrits en dur.
function cmqMaximums() {
  var max = { p1: {}, p2: {}, p3: {}, p4: {} };
  CML_LETTRES.forEach(function (L) {
    max.p1[L] = cmqEnonces('p1').filter(function (e) { return e.lettre === L; }).length;
    max.p2[L] = cmqEnonces('p2').reduce(function (somme, ligne) { return somme + ligne.profil[L]; }, 0);
    max.p3[L] = cmqEnonces('p3').filter(function (e) { return e.lettre === L; }).length * 2;
    max.p4[L] = cmqEnonces('p4').filter(function (e) { return e.lettre === L; }).length * 2;
  });
  return max;
}

function _cmqPointsReponse(partie, idReponse) {
  var liste = CMQ_REPONSES[partie] || [];
  for (var i = 0; i < liste.length; i++) { if (liste[i].id === idReponse) { return liste[i].points; } }
  return 0;   // pas de réponse, ou réponse inconnue : zéro point
}

// reponses = { p1: { R1: 'oui', ... }, p2: { F1: 'non', ... }, p3: { ... }, p4: { ... }, partie4Passee: false }
// Retourne les points obtenus par lettre et par partie. Une partie 4 passée n'apporte aucun point.
function cmqPoints(reponses) {
  var r = reponses || {};
  var points = { p1: {}, p2: {}, p3: {}, p4: {} };
  CML_LETTRES.forEach(function (L) { CMQ_PARTIES.forEach(function (p) { points[p][L] = 0; }); });
  CMQ_PARTIES.forEach(function (p) {
    if (p === 'p4' && r.partie4Passee) { return; }
    var donnees = r[p] || {};
    cmqEnonces(p).forEach(function (e) {
      var pts = _cmqPointsReponse(p, donnees[e.id]);
      if (!pts) { return; }
      if (p === 'p2') { CML_LETTRES.forEach(function (L) { points[p][L] += pts * e.profil[L]; }); }
      else { points[p][e.lettre] += pts; }
    });
  });
  return points;
}

// Points -> pourcentage du maximum de CHAQUE lettre (décision d'équilibre du 16/11/2026).
function cmqPourcentagesParties(points) {
  var max = cmqMaximums();
  var pct = { p1: {}, p2: {}, p3: {}, p4: {} };
  CMQ_PARTIES.forEach(function (p) {
    CML_LETTRES.forEach(function (L) { pct[p][L] = max[p][L] > 0 ? (points[p][L] / max[p][L]) * 100 : 0; });
  });
  return pct;
}

function _cmqNiveau(pourcentageArrondi) {
  if (pourcentageArrondi >= 75) { return 'tres_marquee'; }
  if (pourcentageArrondi >= 50) { return 'marquee'; }
  if (pourcentageArrondi >= 25) { return 'presente'; }
  return 'peu_marquee';
}

// Cœur du calcul, à partir des pourcentages par partie (testable avec les exemples chiffrés de la règle).
// pct = { p1: { R: 93, ... }, p2: ..., p3: ..., p4: ... } ; partie4Passee : la partie 4 n'entre pas dans la moyenne (÷ 3 au lieu de ÷ 4).
function cmqResultatDepuisPourcentages(pct, partie4Passee, nbReponses, nbLignes) {
  var parties = partie4Passee ? ['p1', 'p2', 'p3'] : CMQ_PARTIES;
  var valeurs = {}, arrondis = {}, niveaux = {};
  CML_LETTRES.forEach(function (L) {
    var somme = 0;
    parties.forEach(function (p) { somme += pct[p][L]; });
    valeurs[L] = somme / parties.length;
    arrondis[L] = Math.round(valeurs[L]);
    niveaux[L] = _cmqNiveau(arrondis[L]);
  });

  // Classement : valeur décroissante ; à égalité exacte, la lettre la plus haute en partie 1, puis en partie 4, puis l'ordre R, I, A, S, E, C.
  var classement = CML_LETTRES.slice().sort(function (a, b) {
    if (Math.abs(valeurs[a] - valeurs[b]) > 1e-9) { return valeurs[b] - valeurs[a]; }
    if (Math.abs(pct.p1[a] - pct.p1[b]) > 1e-9) { return pct.p1[b] - pct.p1[a]; }
    if (!partie4Passee && Math.abs(pct.p4[a] - pct.p4[b]) > 1e-9) { return pct.p4[b] - pct.p4[a]; }
    return CML_LETTRES.indexOf(a) - CML_LETTRES.indexOf(b);
  });

  var haut = valeurs[classement[0]], bas = valeurs[classement[5]];
  var etat = 'normal';
  // Trop de lignes laissées vides (consigne 508) : aucune lettre, car le code serait fragile ; distinct des réponses « plates » (aucune lettre ne ressort).
  var peuDeLignes = cmlNiveauQuestionnaire(nbReponses, nbLignes) === 0;
  if (peuDeLignes || haut < CMQ_SEUIL_PEU_REPONSES) { etat = 'peu_reponses'; }
  else if (haut - bas < CMQ_SEUIL_REPARTIES) { etat = 'reparties'; }

  var code = etat === 'peu_reponses' ? null : classement.slice(0, 3).filter(function (L) { return arrondis[L] >= CMQ_SEUIL_LETTRE; });
  var v3 = valeurs[classement[2]];
  var troisLettres = !!code && code.length === 3;
  var procheFrontiere = troisLettres && (v3 - valeurs[classement[3]]) < CMQ_SEUIL_PROCHES - 1e-9;
  // Lettres qui servent aux propositions de métiers : le code, et les lettres suivantes si elles sont proches de la troisième.
  var lettresPourMetiers = [];
  if (code) {
    lettresPourMetiers = code.slice();
    for (var i = 3; troisLettres && i < 6; i++) {
      if (v3 - valeurs[classement[i]] < CMQ_SEUIL_PROCHES - 1e-9) { lettresPourMetiers.push(classement[i]); }
    }
  }

  // Les deux axes, sur les valeurs non arrondies.
  var v = valeurs;
  var ecartPersonnes = (v.S + v.E) / 2 - (v.R + v.I) / 2;
  var ecartIdees = (v.C + v.E) / 2 - (v.A + v.I) / 2;
  var axes = {
    personnes: { ecart: ecartPersonnes, phrase: !code ? null : (ecartPersonnes > CMQ_SEUIL_AXE ? CMQ_TEXTES.personnes : (ecartPersonnes < -CMQ_SEUIL_AXE ? CMQ_TEXTES.objets : null)) },
    idees: { ecart: ecartIdees, phrase: !code ? null : (ecartIdees > CMQ_SEUIL_AXE ? CMQ_TEXTES.donnees : (ecartIdees < -CMQ_SEUIL_AXE ? CMQ_TEXTES.idees : null)) }
  };

  // Textes à afficher au-dessus du code, dans l'ordre.
  var messages = [];
  if (etat === 'peu_reponses') { messages.push(CMQ_TEXTES.peuReponses); }
  if (etat === 'reparties') { messages.push(CMQ_TEXTES.reparties); }
  if (procheFrontiere) { messages.push(CMQ_TEXTES.frontiere); }
  if (partie4Passee) { messages.push(CMQ_TEXTES.sansPartie4); }

  return {
    partie4Passee: !!partie4Passee,
    nbReponses: nbLignes > 0 ? nbReponses : null, nbLignes: nbLignes > 0 ? nbLignes : null, peuDeLignes: peuDeLignes,
    parties: pct, valeurs: valeurs, pourcentages: arrondis, niveaux: niveaux,
    classement: classement, etat: etat, code: code, procheFrontiere: procheFrontiere,
    lettresPourMetiers: lettresPourMetiers, axes: axes, messages: messages
  };
}

// Du début à la fin : réponses -> résultat.
function cmqCalculer(reponses) {
  var passee = !!(reponses && reponses.partie4Passee), n = 0, total = 0;
  CMQ_PARTIES.forEach(function (p) { if (p === 'p4' && passee) { return; } n += cmqNombreReponses(reponses, p); total += cmqEnonces(p).length; });
  return cmqResultatDepuisPourcentages(cmqPourcentagesParties(cmqPoints(reponses)), passee, n, total);
}

function cmqLibelleNiveau(niveau) { return CMQ_TEXTES.niveaux[niveau] || ''; }

// Nombre de réponses données dans une partie (pour « Activité 12 sur 90 » et pour savoir si la partie est complète).
function cmqNombreReponses(reponses, partie) {
  var donnees = (reponses && reponses[partie]) || {};
  return cmqEnonces(partie).filter(function (e) { return !!donnees[e.id]; }).length;
}
function cmqPartieComplete(reponses, partie) {
  return cmqNombreReponses(reponses, partie) === cmqEnonces(partie).length;
}

// Ordre d'affichage mélangé des énoncés d'une partie : même graine, même ordre (testable) ; en usage réel, la graine est tirée au hasard à chaque questionnaire.
function _cmqGenerateur(graine) {
  var etat = (graine >>> 0) || 1;
  return function () {                        // mulberry32
    etat = (etat + 0x6D2B79F5) >>> 0;
    var t = etat;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function cmqOrdreMelange(partie, graine) {
  var ids = cmqEnonces(partie).map(function (e) { return e.id; });
  var hasard = _cmqGenerateur(graine);
  for (var i = ids.length - 1; i > 0; i--) {
    var j = Math.floor(hasard() * (i + 1));
    var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
  }
  return ids;
}

// Ce qui est gardé dans la disquette : le RÉSULTAT seulement, jamais les réponses.
function cmqResultatAGarder(calcul, dateTexte) {
  return {
    version: 1,
    date: String(dateTexte || ''),
    etat: calcul.etat,
    code: calcul.code ? calcul.code.slice() : null,
    lettresPourMetiers: calcul.lettresPourMetiers.slice(),
    pourcentages: JSON.parse(JSON.stringify(calcul.pourcentages)),
    // Les pourcentages de chaque partie (24 nombres, jamais une réponse) : ils permettent de recalculer à l'identique tout l'affichage (cmqCalculDepuisGarde).
    parties: JSON.parse(JSON.stringify(calcul.parties)),
    partie4Passee: !!calcul.partie4Passee,
    nbReponses: calcul.nbLignes > 0 ? calcul.nbReponses : null,
    nbLignes: calcul.nbLignes > 0 ? calcul.nbLignes : null
  };
}
// Pourcentages par partie relus avec méfiance : p1 à p3 obligatoires, p4 mise à zéro si absente ; null si inexploitable.
function _cmqPartiesGardees(brut) {
  if (!brut || typeof brut !== 'object') { return null; }
  var res = {};
  for (var k = 0; k < CMQ_PARTIES.length; k++) {
    var p = CMQ_PARTIES[k], src = brut[p], ligne = {};
    if (!src || typeof src !== 'object') {
      if (p === 'p4') { CML_LETTRES.forEach(function (L) { ligne[L] = 0; }); res[p] = ligne; continue; }
      return null;
    }
    for (var i = 0; i < CML_LETTRES.length; i++) {
      var n = Number(src[CML_LETTRES[i]]);
      if (!isFinite(n)) { return null; }
      ligne[CML_LETTRES[i]] = Math.max(0, Math.min(100, n));
    }
    res[p] = ligne;
  }
  return res;
}
// Recalcule tout le résultat (code, niveaux, axes, messages) depuis un résultat gardé ; null si la disquette ne le permet pas.
function cmqCalculDepuisGarde(garde) {
  if (!garde || !garde.parties) { return null; }
  return cmqResultatDepuisPourcentages(garde.parties, !!garde.partie4Passee, garde.nbReponses, garde.nbLignes);
}
// Relit un résultat gardé (venu d'une disquette : jamais de confiance) ; null si le contenu n'est pas exploitable.
function cmqNormaliserResultatGarde(obj) {
  if (!obj || typeof obj !== 'object' || !obj.pourcentages || typeof obj.pourcentages !== 'object') { return null; }
  var pourcentages = {};
  for (var i = 0; i < CML_LETTRES.length; i++) {
    var n = Number(obj.pourcentages[CML_LETTRES[i]]);
    if (!isFinite(n)) { return null; }
    pourcentages[CML_LETTRES[i]] = Math.max(0, Math.min(100, Math.round(n)));
  }
  var codeValide = function (liste) { return Array.isArray(liste) && liste.every(function (L) { return CML_LETTRES.indexOf(L) !== -1; }); };
  var code = codeValide(obj.code) && obj.code.length >= 1 && obj.code.length <= 3 ? obj.code.slice() : null;
  // Le nombre de lignes répondues vient d'une disquette : relu avec méfiance (entiers, au plus 1 000 lignes), sinon aucun niveau n'est dit.
  var nbLignes = Math.floor(Number(obj.nbLignes)), nbReponses = Math.floor(Number(obj.nbReponses));
  if (!(nbLignes > 0 && nbLignes <= 1000 && nbReponses >= 0 && nbReponses <= nbLignes)) { nbLignes = 0; nbReponses = 0; }
  var etat = obj.etat === 'reparties' || obj.etat === 'peu_reponses' ? obj.etat : 'normal';
  if (etat === 'peu_reponses') { code = null; }
  var pourMetiers = codeValide(obj.lettresPourMetiers) && code ? obj.lettresPourMetiers.filter(function (L, k, a) { return a.indexOf(L) === k; }) : (code ? code.slice() : []);
  return { version: 1, date: typeof obj.date === 'string' ? obj.date.slice(0, 40) : '', etat: etat, code: code, lettresPourMetiers: pourMetiers, pourcentages: pourcentages, parties: _cmqPartiesGardees(obj.parties), partie4Passee: !!obj.partie4Passee, nbReponses: nbLignes > 0 ? nbReponses : null, nbLignes: nbLignes > 0 ? nbLignes : null };
}

/* ------------------------------------------------------------
   2. MÉTIERS qui partagent les lettres de la personne ; niveau d'accès
   ------------------------------------------------------------ */

// Niveau d'accès du ROME : 2 sans diplôme, 3 CAP ou BEP, 4 bac, 5 bac + 2, 6 bac + 3, 7 bac + 5, 8 études longues ; null = le ROME ne le dit pas.
var CML_LIBELLES_NIVEAU = { 2: 'Sans diplôme', 3: 'CAP ou BEP', 4: 'Bac', 5: 'Bac + 2', 6: 'Bac + 3', 7: 'Bac + 5', 8: 'Études longues' };
function cmlLibelleNiveauAcces(niveau) {
  return CML_LIBELLES_NIVEAU[niveau] || 'Niveau d’accès non précisé';
}
// Les trois groupes validés le 16/11/2026, plus un quatrième pour les 670 fiches dont le ROME ne donne aucun niveau (17/11/2026) : jamais les ranger d'office dans « court ».
var CML_GROUPES_NIVEAU = [
  { cle: 'court', titre: 'Sans diplôme ou avec une formation courte' },
  { cle: 'moyen', titre: 'Diplôme d’État, bac à bac + 2' },
  { cle: 'long', titre: 'Bac + 3 et plus' },
  { cle: 'non_precise', titre: 'Niveau d’accès non précisé' }
];
function cmlGroupeNiveau(niveau) {
  if (typeof niveau !== 'number') { return 'non_precise'; }
  if (niveau <= 3) { return 'court'; }
  if (niveau <= 5) { return 'moyen'; }
  return 'long';
}
// Range une liste de métiers (déjà ordonnée) en groupes de niveau d'accès : jamais un filtre, tout reste visible, l'ordre est gardé dans chaque groupe.
function cmlGrouperParNiveau(metiers) {
  return CML_GROUPES_NIVEAU.map(function (g) {
    return { cle: g.cle, titre: g.titre, metiers: metiers.filter(function (m) { return cmlGroupeNiveau(cmlNiveauDeMetier(m)) === g.cle; }) };
  }).filter(function (g) { return g.metiers.length > 0; });
}
function cmlNiveauDeMetier(metier) {
  return _cmlSrc().niveauAcces(metier);
}

// Poids de la lettre d'un métier selon son rang (majeure 3, mineure 2) et de la lettre de la personne selon sa place dans son code (3, 2, 1).
var _CML_POIDS_METIER = [3, 2];
var _CML_POIDS_PERSONNE = [3, 2, 1];
// Indice entre 0 et 1 : à quel point les lettres du métier retombent sur celles de la personne, dans le même ordre. 1 = mêmes lettres, même ordre.
function cmlIndiceLettres(lettresPersonne, lettresMetier) {
  var maxPossible = 0, total = 0;
  for (var i = 0; i < lettresMetier.length && i < 2; i++) {
    maxPossible += _CML_POIDS_METIER[i] * _CML_POIDS_PERSONNE[i];
    var rang = lettresPersonne.indexOf(lettresMetier.charAt(i));
    if (rang !== -1) { total += _CML_POIDS_METIER[i] * _CML_POIDS_PERSONNE[Math.min(rang, 2)]; }
  }
  return maxPossible > 0 ? total / maxPossible : 0;
}

// Métiers qui partagent les lettres de la personne, du plus proche au plus lointain (ex aequo : ordre alphabétique). lettres = résultat.lettresPourMetiers.
// Chaque entrée : { metier, lettres, indice, memesLettres, niveau, groupe }. Un métier sans lettre dans le code n'apparaît pas.
function cmlMetiersPourLettres(lettres) {
  var src = _cmlSrc();
  var vus = {};
  var liste = [];
  if (!lettres || !lettres.length) { return liste; }
  src.base.forEach(function (m) {
    var ri = src.lettresRome[m.rome];
    if (!ri) { return; }
    var cle = src.normaliser(m.nom);
    if (vus[cle]) { return; }
    vus[cle] = true;
    var indice = cmlIndiceLettres(lettres, ri);
    if (indice <= 0) { return; }
    var memes = ri.split('').every(function (L) { return lettres.indexOf(L) !== -1; });
    var niveau = src.niveauAcces(m);
    var retrouvees = ri.split('').filter(function (L) { return lettres.indexOf(L) !== -1; }).length;
    liste.push({ metier: m, lettres: ri, indice: indice, memesLettres: memes, niveau: niveau, groupe: cmlGroupeNiveau(niveau), retrouvees: retrouvees, ecart: ri.length - retrouvees });
  });
  // Consigne 488 : à indice égal, le contenu départage (et non plus l'ordre alphabétique) : plus de lettres du métier retrouvées chez la personne (troisième lettre comprise),
  // puis moins de lettres du métier qui ne figurent pas dans son code ; le nom ne vient qu'en dernier.
  liste.sort(function (a, b) {
    if (Math.abs(a.indice - b.indice) > 1e-9) { return b.indice - a.indice; }
    if (a.retrouvees !== b.retrouvees) { return b.retrouvees - a.retrouvees; }
    if (a.ecart !== b.ecart) { return a.ecart - b.ecart; }
    return a.metier.nom.localeCompare(b.metier.nom, 'fr');
  });
  return liste;
}

/* ------------------------------------------------------------
   3. ENTRÉE 2 « Par actions »
   ------------------------------------------------------------ */

// Maximum de choix par page (les mêmes limites que la création du CV) et seuil de la phrase « Vos choix sont très variés ».
var CML_MAX_CHOIX = { actions: 16, activites: 16, environnement: 12 };
var CML_SEUIL_CHOIX_VARIES = 20;
// Réglages réservés à cette entrée (mesure du 17/11/2026 : docs/CALIBRATION_POURCENTAGE_ENTREE_2_2026-11-16.md). Aucun autre écran ne les passe.
var CML_REGLAGES_ENTREE_2 = { pleinMax: 16 };

function cmlEntree2NombreChoix(choix) {
  var c = choix || {};
  return ['actions', 'activites', 'environnement'].reduce(function (t, k) { return t + (Array.isArray(c[k]) ? c[k].length : 0); }, 0);
}
function cmlEntree2ChoixVaries(choix) { return cmlEntree2NombreChoix(choix) > CML_SEUIL_CHOIX_VARIES; }

// Profil envoyé au moteur de pourcentage. Les listes sont tronquées au maximum de chaque page.
function cmlEntree2Profil(choix) {
  var c = choix || {};
  var limiter = function (k) { return (Array.isArray(c[k]) ? c[k] : []).slice(0, CML_MAX_CHOIX[k]); };
  return { actions: limiter('actions'), activites: limiter('activites'), environnement: limiter('environnement'), reglages: CML_REGLAGES_ENTREE_2 };
}
// Échelle de pistes (consigne 505, maquette validée le 21/11/2026) : le pourcentage et le NOM de la liste dépendent du NOMBRE DE CHOIX, pour les chemins 1 et 2.
// Plafond selon le nombre de choix faits : 3 choix 30 %, 4 : 40 %, 5 : 50 %, 6 : 60 %, 7 : 70 %, 8 : 80 %, 9 : 90 %, 10 et plus : 95 % (jamais 100 %). 1 et 2 choix : jamais affichés (aucune liste sous 3 choix).
// Mesuré sur la base (docs/AUDIT_ATTEIGNABILITE_METIERS_EXPLORER_LES_METIERS_2026-11-21.md, §7) : un métier retrouvé dans les dix premiers dès 3 choix dans 43 % des cas seulement : le pourcentage ne peut pas annoncer plus.
var CML_PLAFOND_PAR_NB_CHOIX = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95];
// Part minimale des choix qu'une fiche doit retrouver pour être proposée (au moins un choix) : sinon, un métier qui n'en retrouve qu'un seul parmi plusieurs ne ressort pas.
// La moitié des choix, arrondie au-dessus (décision de Denis, 21/11/2026, consigne 517, option B) : avec 40 %, le minimum passait de 67 % à 40 % selon le nombre de choix et la liste grossissait par dents de scie
// (médiane de 197 métiers à 3 choix, 547 à 5, 210 à 6 : docs/VERIFICATION_STABILITE_EXPLORER_LES_METIERS_2026-11-21.md).
var CML_PART_MINI_CHOIX_RETROUVES = 0.5;
// Nombre minimal de choix qu'une fiche doit retrouver pour être proposée, pour n choix faits (source unique : le classement ET la phrase de l'écran « N métiers retrouvent au moins X de vos choix » le lisent).
// Jamais plus de CML_MINI_CHOIX_PLAFOND (consigne 519) : une fiche ne porte qu'une dizaine de choix du catalogue (médiane 10, maximum 17 sur 1 925 fiches) ; exiger la moitié de 15 choix (8) ou de 20 (10)
// ne laissait aucun métier, même à une personne dont les choix sont cohérents. 5 = la moitié de la fiche médiane. Sans effet jusqu'à 10 choix.
var CML_MINI_CHOIX_PLAFOND = 5;
function cmlChoixMinimum(n) { return Math.min(CML_MINI_CHOIX_PLAFOND, Math.max(1, Math.ceil(CML_PART_MINI_CHOIX_RETROUVES * n - 1e-9))); }
function cmlPlafondChoix(n) {
  return n > 0 ? CML_PLAFOND_PAR_NB_CHOIX[Math.min(Math.floor(n), CML_PLAFOND_PAR_NB_CHOIX.length - 1)] : 0;
}
// Les quatre niveaux d'une liste, COMMUNS aux chemins 1 et 2 (le chemin 3, le questionnaire, garde sa propre démarche). Source unique des noms, des textes et des bornes.
// Sous le minimum, aucune liste : « Pas encore de pistes ». Un niveau ne juge jamais la personne : il dit à quel point la liste est précise.
var CML_MIN_CHOIX_PISTES = 3;
var CML_BORNES_NIVEAUX = [3, 5, 7, 9];
var CML_NIVEAU_PROPOSITION = 2;     // la grande carte « Première proposition » n'existe qu'à partir de ce niveau
var CML_MAX_EGALITES_VEDETTE = 3;   // … et seulement si au plus ce nombre de métiers sont à égalité en tête (sinon en choisir un serait arbitraire)
var CML_NIVEAUX_PISTES = [
  { nom: 'Piste éloignée', texte: 'Avec peu de choix, beaucoup de métiers restent possibles. Ce sont des idées de départ, pas une proposition.',
    texteQ: 'Vos réponses couvrent à peine la moitié du questionnaire : vos lettres peuvent encore changer. Ce sont des idées de départ, pas une proposition.' },
  { nom: 'Piste à explorer', texte: 'Les premiers métiers qui ressortent sont de vraies propositions, mais plusieurs se valent encore. Ce sont des pistes à explorer.',
    texteQ: 'Vos lettres se dessinent, mais elles pourraient encore bouger si vous répondiez aux lignes laissées vides. Ce sont des pistes à explorer.' },
  { nom: 'Piste proche', texte: 'Peu de métiers retrouvent tout ce que vous avez choisi. Lisez leurs fiches pour vérifier qu’ils vous parlent.',
    texteQ: 'Vos lettres sont assez stables. Lisez les fiches des métiers pour vérifier qu’ils vous parlent.' },
  { nom: 'Piste précise', texte: 'La liste est étroite et bien ciblée. Parlez-en avec un conseiller, ou confirmez avec le questionnaire de préférences.',
    texteQ: 'Vos lettres sont stables : presque toutes les lignes ont une réponse. Parlez-en avec un conseiller pour les confirmer.' }
];
// Le questionnaire (chemin 3, consigne 508) : le niveau dépend de la PART DES LIGNES RÉPONDUES (une ligne laissée vide compte zéro), pas d'un nombre de choix.
// Seuils mesurés sur 360 personnes simulées (scripts/auditAtteignabilite/courbe_fiabilite_chemin3.js) : première lettre juste dans 68 % des cas à 40 % de lignes répondues, 75 % à 50 %, 84 % à 67 %, 94 % à 83 %.
// Sous le premier seuil : aucune lettre (état « peu de réponses », comme sous 3 choix pour les chemins 1 et 2). Les réponses sont effacées après le calcul : le nombre de lignes répondues est donc gardé avec le résultat.
var CML_BORNES_NIVEAUX_Q = [0.40, 0.50, 2 / 3, 5 / 6];   // 40 %, 50 %, deux tiers (67 %), cinq sixièmes (83 %) : 120, 150, 200 et 250 lignes sur 300
// 0 = pas encore de pistes ; 1 à 4 = niveau ; null = nombre de lignes inconnu (résultat gardé avant cette règle : aucun niveau n'est dit).
function cmlNiveauQuestionnaire(nbReponses, nbLignes) {
  if (typeof nbReponses !== 'number' || typeof nbLignes !== 'number' || !(nbLignes > 0) || !(nbReponses >= 0)) { return null; }
  var part = nbReponses / nbLignes, niv = 0;
  for (var i = 0; i < CML_BORNES_NIVEAUX_Q.length; i++) { if (part >= CML_BORNES_NIVEAUX_Q[i] - 1e-9) { niv = i + 1; } }
  return niv;
}
// Tout ce que l'écran dit du niveau du questionnaire : { niveau, nbReponses, nbLignes, pct (part répondue, arrondie à l'entier inférieur : jamais « 40 % » sous le seuil), nom, texte, aRepondre (lignes à avoir répondues pour le niveau suivant, 0 si dernier), suivant, minimum (lignes pour le premier niveau) }.
function cmlInfoNiveauQuestionnaire(nbReponses, nbLignes) {
  var niv = cmlNiveauQuestionnaire(nbReponses, nbLignes);
  if (niv === null) { return null; }
  var aRep = function (k) { return Math.ceil(CML_BORNES_NIVEAUX_Q[k] * nbLignes - 1e-9); };
  var base = { niveau: niv, nbReponses: nbReponses, nbLignes: nbLignes, pct: Math.floor(100 * nbReponses / nbLignes + 1e-9), minimum: aRep(0) };
  if (!niv) { base.nom = 'Pas encore de pistes'; base.texte = ''; base.aRepondre = aRep(0); base.suivant = CML_NIVEAUX_PISTES[0].nom; return base; }
  base.nom = CML_NIVEAUX_PISTES[niv - 1].nom; base.texte = CML_NIVEAUX_PISTES[niv - 1].texteQ;
  base.aRepondre = niv < CML_BORNES_NIVEAUX_Q.length ? aRep(niv) : 0;
  base.suivant = niv < CML_NIVEAUX_PISTES.length ? CML_NIVEAUX_PISTES[niv].nom : '';
  return base;
}
// 0 = pas encore de pistes ; 1 à 4 = le niveau de la liste pour ce nombre de choix.
function cmlNiveauPistes(nbChoix) {
  var n = Math.floor(nbChoix || 0), niv = 0;
  for (var i = 0; i < CML_BORNES_NIVEAUX.length; i++) { if (n >= CML_BORNES_NIVEAUX[i]) { niv = i + 1; } }
  return niv;
}
// Tout ce que l'écran dit du niveau : { niveau, nbChoix, nom, texte, reste (choix à ajouter pour le niveau suivant), suivant (nom du niveau suivant), minimum }.
// Niveau 0 : nom « Pas encore de pistes », reste = choix manquants pour voir les premières pistes.
function cmlInfoNiveauPistes(nbChoix) {
  var n = Math.max(0, Math.floor(nbChoix || 0)), niv = cmlNiveauPistes(n);
  if (!niv) { return { niveau: 0, nbChoix: n, nom: 'Pas encore de pistes', texte: '', reste: CML_BORNES_NIVEAUX[0] - n, suivant: CML_NIVEAUX_PISTES[0].nom, minimum: CML_MIN_CHOIX_PISTES }; }
  var v = CML_NIVEAUX_PISTES[niv - 1];
  return { niveau: niv, nbChoix: n, nom: v.nom, texte: v.texte, reste: niv < CML_BORNES_NIVEAUX.length ? CML_BORNES_NIVEAUX[niv] - n : 0, suivant: niv < CML_NIVEAUX_PISTES.length ? CML_NIVEAUX_PISTES[niv].nom : '', minimum: CML_MIN_CHOIX_PISTES };
}
// Combien de métiers sont à égalité en tête ? pcts = les pourcentages de la liste, du plus haut au plus bas.
function cmlEgalitesEnTete(pcts) {
  if (!pcts || !pcts.length) { return 0; }
  return pcts.filter(function (p) { return p === pcts[0]; }).length;
}
// La grande carte « Première proposition » : à partir du niveau 2 ET si au plus 3 métiers sont à égalité en tête. Rend { oui, raison : '' | 'trop-tot' | 'egalite' }.
function cmlVedetteAutorisee(nbChoix, nbEgalitesEnTete) {
  if (cmlNiveauPistes(nbChoix) < CML_NIVEAU_PROPOSITION) { return { oui: false, raison: 'trop-tot' }; }
  if (nbEgalitesEnTete > CML_MAX_EGALITES_VEDETTE) { return { oui: false, raison: 'egalite' }; }
  return { oui: true, raison: '' };
}
// Les choix de la personne, à plat, dans l'ordre du moteur : { cat, item }. Source unique de cet ordre (le reclassement ET la rubrique « Comment vos choix ont été lus » la lisent).
function _cmlListeChoisis(profil) {
  var choisis = [];
  ['activites', 'actions', 'environnement'].forEach(function (cat) {
    (profil[cat] || []).forEach(function (item) { choisis.push({ cat: cat, item: item }); });
  });
  return choisis;
}
// Pour une fiche : quels choix retrouve-t-elle ? Ses deux signatures sont essayées, la meilleure est gardée ({ flags, nb, taille }). Source unique du « retrouvé / pas retrouvé ».
function _cmlFlagsMetier(m, choisis, corr) {
  var meilleure = null;
  [m, m.signatureRome].forEach(function (sig) {
    if (!sig) { return; }
    var flags = choisis.map(function (c) { return (sig[c.cat] || []).some(function (x) { return corr(c.item, x); }); });
    var nb = flags.filter(Boolean).length;
    var taille = ['activites', 'actions', 'environnement'].reduce(function (s, k) { return s + (Array.isArray(sig[k]) ? sig[k].length : 0); }, 0);
    if (!meilleure || nb > meilleure.nb || (nb === meilleure.nb && taille < meilleure.taille)) { meilleure = { flags: flags, nb: nb, taille: taille }; }
  });
  return { flags: meilleure ? meilleure.flags : choisis.map(function () { return false; }), nb: meilleure ? meilleure.nb : 0, taille: meilleure ? meilleure.taille : 0 };
}
// Pour chacun des choix : la fiche (ses deux signatures, la meilleure est gardée) le retrouve-t-elle ? Un choix large (très répandu dans la base) pèse moins qu'un choix précis.
function cmlEntree2Reclasser(liste, profil, src) {
  var corr = src.correspond;
  if (!corr) { return liste; }
  var choisis = _cmlListeChoisis(profil);
  var n = choisis.length;
  if (!n) { return []; }
  var lignes = liste.map(function (m) {
    var f = _cmlFlagsMetier(m, choisis, corr);
    return { m: m, flags: f.flags, nb: f.nb, taille: f.taille };
  });
  var taillBase = (src.base && src.base.length) || 1900;
  var poids = choisis.map(function (c, i) {
    var f = lignes.filter(function (l) { return l.flags[i]; }).length;
    return f > 0 ? Math.log((taillBase + 1) / (f + 1)) : 0;   // un choix que la base ne reconnaît chez personne ne pénalise personne
  });
  var total = poids.reduce(function (s, x) { return s + x; }, 0);
  var plafond = cmlPlafondChoix(n);
  var mini = cmlChoixMinimum(n);
  var retenues = [];
  lignes.forEach(function (l) {
    if (l.nb < mini || total <= 0) { return; }
    var gagne = 0;
    l.flags.forEach(function (ok, i) { if (ok) { gagne += poids[i]; } });
    var part = Math.min(1, gagne / total);
    var exact = plafond * part;
    var copie = {};
    Object.keys(l.m).forEach(function (k) { copie[k] = l.m[k]; });
    copie._moteur = l.m.scoreExact || 0;   // à choix retrouvés égaux, l'ordre des choix dans la fiche et sa précision (calcul du moteur) départagent
    copie.score = Math.min(100, Math.max(1, Math.round(exact)));
    copie.scoreExact = exact;
    copie.partDesChoix = part;
    copie.choixRetrouves = l.nb;
    copie.choixTotal = n;
    copie._taille = l.taille;
    retenues.push(copie);
  });
  retenues.sort(function (a, b) {
    return (b.score - a.score) || (b.scoreExact - a.scoreExact) || (b.choixRetrouves - a.choixRetrouves) ||
      ((b._moteur || 0) - (a._moteur || 0)) || ((a._taille || 99) - (b._taille || 99)) || String(a.nom || '').localeCompare(String(b.nom || ''), 'fr');
  });
  retenues.forEach(function (m) { delete m._taille; delete m._moteur; });
  return retenues;
}
// Les métiers de l'entrée 2, avec le pourcentage « de ressemblance avec vos choix » (jamais une note de la personne). Aucun choix : aucune proposition.
// Le moteur de data/metiers.js donne les candidats et leurs explications ; le pourcentage affiché est recalculé ici (consigne 488) : plafond selon le nombre de choix, puis part des choix retrouvés.
function cmlEntree2Metiers(choix, nombreMax) {
  if (cmlEntree2NombreChoix(choix) === 0) { return []; }
  var profil = cmlEntree2Profil(choix), src = _cmlSrc();
  var candidats = src.rechercher(profil, 5000);
  return cmlEntree2Reclasser(candidats, profil, src).slice(0, nombreMax || 5000);
}

/* ------------------------------------------------------------
   « Comment vos choix ont été lus » (consigne 499, 21/11/2026) : ce que l'application a fait de chacun des choix, sans rien calculer de nouveau pour le classement.
   Ces fonctions ne font que COMPTER avec les mêmes règles que le moteur (_cmlFlagsMetier, poids de rareté) : jamais un second calcul de pourcentage.
   ------------------------------------------------------------ */
// À quel point un choix aide à distinguer les métiers : 3 = beaucoup (porté par moins de 8 % des métiers), 2 = moyennement (moins de 25 %), 1 = un peu ; 0 = la base ne le reconnaît chez aucun métier.
var CML_MOTS_AIDE = ['', 'un peu', 'moyennement', 'beaucoup'];
function cmlNiveauAide(nb, total) {
  if (!(nb > 0) || !(total > 0)) { return 0; }
  var p = nb / total;
  return p < 0.08 ? 3 : (p < 0.25 ? 2 : 1);
}
// Un choix est « peu présent » dans la liste quand moins d'un quart des métiers proposés le retrouvent (un choix que la base ne reconnaît chez aucun métier n'est pas concerné : il ne pèse sur personne).
var CML_PART_CHOIX_PEU_PRESENT = 0.25;
var _cmlMemoLus = { cle: '', nb: [], total: 0, flags: [] }, _cmlMemoLusListe = { cle: '', res: null };
// Chemin 2. choix = { actions, activites, environnement } ; liste = les métiers affichés (déjà classés). Rend null s'il n'y a aucun choix.
// { total (métiers de la base), liste (métiers affichés), lignes : [ { cat, item, nbMetiers (dans toute la base), dansListe (dans la liste affichée) } ], faibles : lignes peu présentes dans la liste }
function cmlChoixLus2(choix, liste) {
  var src = _cmlSrc(), corr = src.correspond;
  if (!corr) { return null; }
  var profil = cmlEntree2Profil(choix), choisis = _cmlListeChoisis(profil);
  if (!choisis.length) { return null; }
  var cle = JSON.stringify(profil), l = liste || [];
  if (_cmlMemoLus.cle !== cle) {
    var nb = choisis.map(function () { return 0; }), vus = {}, total = 0, tous = [];
    src.base.forEach(function (m) {
      var k = src.normaliser(m.nom);
      if (vus[k]) { return; }
      vus[k] = true; total++;
      var fl = _cmlFlagsMetier(m, choisis, corr).flags;
      tous.push(fl);
      fl.forEach(function (ok, i) { if (ok) { nb[i]++; } });
    });
    _cmlMemoLus = { cle: cle, nb: nb, total: total, flags: tous };
  }
  var cleListe = cle + '|' + l.length + '|' + (l.length ? l[0].nom + '|' + l[l.length - 1].nom : '');
  if (_cmlMemoLusListe.cle !== cleListe) {
    var dans = choisis.map(function () { return 0; });
    l.forEach(function (m) { _cmlFlagsMetier(m, choisis, corr).flags.forEach(function (ok, i) { if (ok) { dans[i]++; } }); });
    _cmlMemoLusListe = { cle: cleListe, res: dans };
  }
  var dansListe = _cmlMemoLusListe.res;
  var lignes = choisis.map(function (c, i) { return { cat: c.cat, item: c.item, nbMetiers: _cmlMemoLus.nb[i], dansListe: dansListe[i] }; });
  var faibles = l.length ? lignes.filter(function (x) { return x.nbMetiers > 0 && x.dansListe / l.length < CML_PART_CHOIX_PEU_PRESENT; }) : [];
  return { total: _cmlMemoLus.total, liste: l.length, lignes: lignes, faibles: faibles };
}
// Chemin 3. lettres = le code de la personne (résultat.lettresPourMetiers). { total, liste (métiers qui ont au moins une de ses lettres), lettres : [ { l, rang, nbMajeure } ] }
// nbMajeure = nombre de métiers de la base dont la PREMIÈRE lettre est celle-ci.
function cmlChoixLus3(lettres) {
  var src = _cmlSrc(), vus = {}, total = 0, maj = {};
  if (!lettres || !lettres.length) { return null; }
  src.base.forEach(function (m) {
    var k = src.normaliser(m.nom);
    if (vus[k]) { return; }
    vus[k] = true; total++;
    var ri = src.lettresRome[m.rome];
    if (ri) { maj[ri.charAt(0)] = (maj[ri.charAt(0)] || 0) + 1; }
  });
  var rangs = [];
  for (var i = 0; i < lettres.length; i++) { rangs.push({ l: lettres[i], rang: i + 1, nbMajeure: maj[lettres[i]] || 0 }); }
  return { total: total, liste: cmlMetiersPourLettres(lettres).length, lettres: rangs };
}


/* ------------------------------------------------------------
   « Vos choix vont dans plusieurs directions » (consigne 501, 21/11/2026) : on COMPTE dans la base, sans liste de paires opposées.
   Règle mesurée sur les profils du banc d'essai : à partir de 4 choix, si moins de 5 métiers retrouvent au moins 60 % des choix, le message paraît.
   Constat sur la base, jamais sur la personne. Le choix à retirer est celui dont le retrait donne le plus de métiers (proposé seulement s'il en donne au moins 10).
   ------------------------------------------------------------ */
var CML_PART_COUVERTURE = 0.6, CML_MIN_METIERS_COUVERTURE = 5, CML_MIN_CHOIX_DIRECTIONS = 4;
// flags = pour chaque métier de la base, un tableau « ce choix est retrouvé ou non » ; n = nombre de choix. Rend { n, declenche, nbCouverts, retirer : { index, nb } ou null }.
function cmlDirectionsChoix(flags, n) {
  var res = { n: n, declenche: false, nbCouverts: 0, retirer: null };
  if (!(n >= CML_MIN_CHOIX_DIRECTIONS) || !flags || !flags.length) { return res; }
  var compte = function (sauf) {
    var idx = [], i;
    for (i = 0; i < n; i++) { if (i !== sauf) { idx.push(i); } }
    var mini = Math.ceil(CML_PART_COUVERTURE * idx.length - 1e-9), nb = 0;
    flags.forEach(function (f) { var k = 0; idx.forEach(function (j) { if (f[j]) { k++; } }); if (k >= mini) { nb++; } });
    return nb;
  };
  res.nbCouverts = compte(-1);
  res.declenche = res.nbCouverts < CML_MIN_METIERS_COUVERTURE;
  if (res.declenche) {
    var meilleur = null, i;
    for (i = 0; i < n; i++) { var nb = compte(i); if (!meilleur || nb > meilleur.nb) { meilleur = { index: i, nb: nb }; } }
    if (meilleur && meilleur.nb >= 2 * CML_MIN_METIERS_COUVERTURE) { res.retirer = meilleur; }
  }
  return res;
}
// Chemin 2 : les mêmes « retrouvé / pas retrouvé » que le classement (_cmlFlagsMetier). Rend { cat, item } du choix à retirer dans retirer.choix.
function cmlDirections2(choix) {
  var lus = cmlChoixLus2(choix, []);
  if (!lus) { return null; }
  var profil = cmlEntree2Profil(choix), choisis = _cmlListeChoisis(profil);
  var res = cmlDirectionsChoix(_cmlMemoLus.flags, choisis.length);
  if (res.retirer) { res.retirer.choix = choisis[res.retirer.index]; }
  return res;
}

/* ------------------------------------------------------------
   « À éviter » (consigne 502, 21/11/2026, maquette validée par Denis) : un métier qui porte un choix évité voit son pourcentage DIVISÉ PAR DEUX par choix évité retrouvé,
   et le dit (À vérifier). Jamais d'exclusion en silence : la liste garde tous les métiers, le bouton « Masquer » est un geste de la personne.
   Les choix évités n'entrent pas dans le moteur (ni le plafond, ni la part des choix) : l'effet s'applique après, comme pour les conditions de travail.
   ------------------------------------------------------------ */
var CML_MAX_EVITER = 12;
// evites = [ { cat, item } ] ; liste = métiers classés. Rend une copie classée par pourcentage décroissant (à égalité, l'ordre d'origine) ; chaque métier porte evitesPortes ([ { cat, item } ])
// et, quand il en porte, scoreAvantEvites (le pourcentage d'avant). Sans choix évité, la liste est rendue telle quelle.
function cmlAppliquerEvites(liste, evites) {
  var src = _cmlSrc(), corr = src.correspond;
  if (!corr || !evites || !evites.length) { return liste; }
  var res = liste.map(function (m, rang) {
    var f = _cmlFlagsMetier(m, evites, corr).flags, portes = [];
    f.forEach(function (ok, i) { if (ok) { portes.push(evites[i]); } });
    var copie = {};
    Object.keys(m).forEach(function (k) { copie[k] = m[k]; });
    copie.evitesPortes = portes;
    if (portes.length) {
      copie.scoreAvantEvites = m.score;
      var apres = Math.round((m.score || 0) * Math.pow(0.5, portes.length));
      copie.score = (m.score || 0) > 0 ? Math.max(1, apres) : 0;
    }
    copie._rang = rang;
    return copie;
  });
  res.sort(function (a, b) { return (b.score - a.score) || (a._rang - b._rang); });
  res.forEach(function (m) { delete m._rang; });
  return res;
}

// ---------------- Cartes enrichies (consigne 509, règle ajustée le 21/11/2026 sur la feuille de Denis) ----------------
// Ce que fait le métier (compétences du ROME) et à savoir sur ce métier (conditions de travail) : UNE règle pour les cartes des trois chemins.
//  - compétences : data/competencesRome.js, champ « cartes » (6 phrases par code, calculées à la génération : activités du code pondérées par la rareté de la phrase) ;
//  - conditions : sans les statuts d'emploi (indépendant, intérim, fonction publique, alternance), les plus RARES d'abord (ce sont elles qui distinguent un métier d'un autre), égalité : ordre du ROME.
// Seulement affichées : jamais demandées, jamais comptées dans un score.
var CML_STATUTS_CARTE = ['s_independant', 's_interim', 's_public', 's_alternance'];
var CML_NB_COMPETENCES_CARTE = 3, CML_NB_CONDITIONS_CARTE = 3;
var _cmlFreqCond = null, _cmlFreqCondSource = null;
function _cmlFrequenceConditions(K) {
  if (_cmlFreqCond && _cmlFreqCondSource === K) { return _cmlFreqCond; }
  var f = {};
  Object.keys(K.parCode).forEach(function (c) { K.parCode[c].forEach(function (id) { f[id] = (f[id] || 0) + 1; }); });
  _cmlFreqCond = f; _cmlFreqCondSource = K;
  return f;
}
// Toutes les conditions d'un code (sans les statuts), les plus rares d'abord : [{ id, lib }].
function cmlConditionsCarte(code, K) {
  if (!K || !code || !K.parCode || !K.parCode[code]) { return []; }
  var f = _cmlFrequenceConditions(K);
  return K.parCode[code].filter(function (id) { return CML_STATUTS_CARTE.indexOf(id) === -1 && K.libelles[id]; })
    .sort(function (a, b) { return (f[a] - f[b]) || (K.ordre.indexOf(a) - K.ordre.indexOf(b)); })
    .map(function (id) { return { id: id, lib: K.libelles[id] }; });
}
// Les phrases des cartes pour un code (jusqu'à 6, la plus représentative d'abord) ; [] si le fichier n'est pas chargé ou si le code est inconnu.
function cmlCompetencesCarte(code, CP) {
  if (!CP || !CP.cartes || !code || !CP.cartes[code]) { return []; }
  return CP.cartes[code].map(function (i) { return CP.phrases[i]; }).filter(function (x) { return !!x; });
}
// Tout ce que la carte montre pour un code : { competences, resteCompetences, conditions, resteConditions }. « reste » = ce qui est dans la fiche du métier sans être sur la carte.
function cmlResumeMetier(code, K, CP, nbCompetences, nbConditions) {
  var nc = nbCompetences === undefined ? CML_NB_COMPETENCES_CARTE : nbCompetences, nd = nbConditions === undefined ? CML_NB_CONDITIONS_CARTE : nbConditions;
  var comp = cmlCompetencesCarte(code, CP), conds = cmlConditionsCarte(code, K);
  var totalComp = (CP && CP.parCode && CP.parCode[code]) ? CP.parCode[code].length : 0, vues = comp.slice(0, nc);
  return { competences: vues, resteCompetences: vues.length ? Math.max(0, totalComp - vues.length) : 0, conditions: conds.slice(0, nd), resteConditions: Math.max(0, conds.length - nd) };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CML_LETTRES: CML_LETTRES, CMQ_PARTIES: CMQ_PARTIES, CMQ_REPONSES: CMQ_REPONSES, CMQ_TEXTES: CMQ_TEXTES,
    CMQ_SEUIL_PROCHES: CMQ_SEUIL_PROCHES, CMQ_SEUIL_REPARTIES: CMQ_SEUIL_REPARTIES, CMQ_SEUIL_PEU_REPONSES: CMQ_SEUIL_PEU_REPONSES, CMQ_SEUIL_AXE: CMQ_SEUIL_AXE, CMQ_SEUIL_LETTRE: CMQ_SEUIL_LETTRE,
    cmqEnonces: cmqEnonces, cmqMaximums: cmqMaximums, cmqPoints: cmqPoints, cmqPourcentagesParties: cmqPourcentagesParties,
    cmqResultatDepuisPourcentages: cmqResultatDepuisPourcentages, cmqCalculer: cmqCalculer, cmqLibelleNiveau: cmqLibelleNiveau,
    cmqNombreReponses: cmqNombreReponses, cmqPartieComplete: cmqPartieComplete, cmqOrdreMelange: cmqOrdreMelange,
    cmqResultatAGarder: cmqResultatAGarder, cmqNormaliserResultatGarde: cmqNormaliserResultatGarde, cmqCalculDepuisGarde: cmqCalculDepuisGarde,
    CML_LIBELLES_NIVEAU: CML_LIBELLES_NIVEAU, CML_GROUPES_NIVEAU: CML_GROUPES_NIVEAU,
    cmlLibelleNiveauAcces: cmlLibelleNiveauAcces, cmlGroupeNiveau: cmlGroupeNiveau, cmlGrouperParNiveau: cmlGrouperParNiveau, cmlNiveauDeMetier: cmlNiveauDeMetier,
    cmlIndiceLettres: cmlIndiceLettres, cmlMetiersPourLettres: cmlMetiersPourLettres,
    CML_MAX_CHOIX: CML_MAX_CHOIX, CML_SEUIL_CHOIX_VARIES: CML_SEUIL_CHOIX_VARIES, CML_REGLAGES_ENTREE_2: CML_REGLAGES_ENTREE_2,
    cmlEntree2NombreChoix: cmlEntree2NombreChoix, cmlEntree2ChoixVaries: cmlEntree2ChoixVaries, cmlEntree2Profil: cmlEntree2Profil, cmlEntree2Metiers: cmlEntree2Metiers, cmlPlafondChoix: cmlPlafondChoix, cmlChoixMinimum: cmlChoixMinimum, CML_MINI_CHOIX_PLAFOND: CML_MINI_CHOIX_PLAFOND, CML_PLAFOND_PAR_NB_CHOIX: CML_PLAFOND_PAR_NB_CHOIX,
    CML_MIN_CHOIX_PISTES: CML_MIN_CHOIX_PISTES, CML_BORNES_NIVEAUX: CML_BORNES_NIVEAUX, CML_NIVEAU_PROPOSITION: CML_NIVEAU_PROPOSITION, CML_MAX_EGALITES_VEDETTE: CML_MAX_EGALITES_VEDETTE, CML_NIVEAUX_PISTES: CML_NIVEAUX_PISTES, CML_BORNES_NIVEAUX_Q: CML_BORNES_NIVEAUX_Q, cmlNiveauQuestionnaire: cmlNiveauQuestionnaire, cmlInfoNiveauQuestionnaire: cmlInfoNiveauQuestionnaire,
    cmlNiveauPistes: cmlNiveauPistes, cmlInfoNiveauPistes: cmlInfoNiveauPistes, cmlEgalitesEnTete: cmlEgalitesEnTete, cmlVedetteAutorisee: cmlVedetteAutorisee,
    CML_MOTS_AIDE: CML_MOTS_AIDE, cmlNiveauAide: cmlNiveauAide, CML_PART_CHOIX_PEU_PRESENT: CML_PART_CHOIX_PEU_PRESENT, cmlChoixLus2: cmlChoixLus2, cmlChoixLus3: cmlChoixLus3,
    cmlDirectionsChoix: cmlDirectionsChoix, cmlDirections2: cmlDirections2, CML_PART_COUVERTURE: CML_PART_COUVERTURE, CML_MIN_METIERS_COUVERTURE: CML_MIN_METIERS_COUVERTURE, CML_MIN_CHOIX_DIRECTIONS: CML_MIN_CHOIX_DIRECTIONS,
    CML_MAX_EVITER: CML_MAX_EVITER, cmlAppliquerEvites: cmlAppliquerEvites,
    CML_STATUTS_CARTE: CML_STATUTS_CARTE, CML_NB_COMPETENCES_CARTE: CML_NB_COMPETENCES_CARTE, CML_NB_CONDITIONS_CARTE: CML_NB_CONDITIONS_CARTE,
    cmlConditionsCarte: cmlConditionsCarte, cmlCompetencesCarte: cmlCompetencesCarte, cmlResumeMetier: cmlResumeMetier
  };
}
