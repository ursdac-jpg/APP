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
      normaliser: typeof normaliserTexte === 'function' ? normaliserTexte : function (s) { return String(s).toLowerCase(); }
    };
  }
  var q = require('../../data/questionnaireRiasec.js');
  var m = require('../../data/metiers.js');
  return {
    p1: q.RIASEC_PARTIE_1, p2: q.RIASEC_PARTIE_2, p3: q.RIASEC_PARTIE_3, p4: q.RIASEC_PARTIE_4,
    lettresRome: require('../../data/lettresRiasecRome.js').LETTRES_RIASEC_ROME,
    base: m.baseMetiers, niveauAcces: m.niveauAccesMetier, rechercher: m.rechercherMetiers, normaliser: m.normaliserTexte
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
function cmqResultatDepuisPourcentages(pct, partie4Passee) {
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
  if (haut < CMQ_SEUIL_PEU_REPONSES) { etat = 'peu_reponses'; }
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
    parties: pct, valeurs: valeurs, pourcentages: arrondis, niveaux: niveaux,
    classement: classement, etat: etat, code: code, procheFrontiere: procheFrontiere,
    lettresPourMetiers: lettresPourMetiers, axes: axes, messages: messages
  };
}

// Du début à la fin : réponses -> résultat.
function cmqCalculer(reponses) {
  return cmqResultatDepuisPourcentages(cmqPourcentagesParties(cmqPoints(reponses)), !!(reponses && reponses.partie4Passee));
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
    partie4Passee: !!calcul.partie4Passee
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
  return cmqResultatDepuisPourcentages(garde.parties, !!garde.partie4Passee);
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
  var etat = obj.etat === 'reparties' || obj.etat === 'peu_reponses' ? obj.etat : 'normal';
  if (etat === 'peu_reponses') { code = null; }
  var pourMetiers = codeValide(obj.lettresPourMetiers) && code ? obj.lettresPourMetiers.filter(function (L, k, a) { return a.indexOf(L) === k; }) : (code ? code.slice() : []);
  return { version: 1, date: typeof obj.date === 'string' ? obj.date.slice(0, 40) : '', etat: etat, code: code, lettresPourMetiers: pourMetiers, pourcentages: pourcentages, parties: _cmqPartiesGardees(obj.parties), partie4Passee: !!obj.partie4Passee };
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
    liste.push({ metier: m, lettres: ri, indice: indice, memesLettres: memes, niveau: niveau, groupe: cmlGroupeNiveau(niveau) });
  });
  liste.sort(function (a, b) {
    if (Math.abs(a.indice - b.indice) > 1e-9) { return b.indice - a.indice; }
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
// Les métiers de l'entrée 2, avec le pourcentage « de compatibilité avec vos choix » (jamais une note de la personne). Aucun choix : aucune proposition.
function cmlEntree2Metiers(choix, nombreMax) {
  if (cmlEntree2NombreChoix(choix) === 0) { return []; }
  return _cmlSrc().rechercher(cmlEntree2Profil(choix), nombreMax || 5000);
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
    cmlEntree2NombreChoix: cmlEntree2NombreChoix, cmlEntree2ChoixVaries: cmlEntree2ChoixVaries, cmlEntree2Profil: cmlEntree2Profil, cmlEntree2Metiers: cmlEntree2Metiers
  };
}
