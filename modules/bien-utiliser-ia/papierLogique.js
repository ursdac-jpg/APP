/* ============================================================
   modules/bien-utiliser-ia/papierLogique.js
   Chemin 2 : ce que le CODE fait d'un papier collé, sans l'assistant : masquer les numéros, lire les dates et les délais, préparer l'alerte calme.
   Logique pure, testée : tests/bienUtiliserIaPapier.test.js. L'application ne calcule jamais une date de fin à partir d'un délai : elle montre le délai tel qu'il est écrit.
   Décisions de Denis (23/11/2026, consigne 589) : alerte de date faite par le code, calme, avec « Je l'ai vu » ; reprise de la date dans la demande seulement si la personne le souhaite ;
   masquage automatique des numéros de téléphone, courriels et IBAN, jamais des noms ni des adresses.
   Dépend de buiaDateFrancaise (comprendreLogique.js) et de _buiaNorm (modelesLogique.js). Noms : buia / BUIA / _buia.
   ============================================================ */

var _buiaP = (typeof module !== 'undefined' && module.exports && typeof require === 'function')
  ? Object.assign({}, require('./comprendreLogique.js'), require('./modelesLogique.js'))
  : { buiaDateFrancaise: buiaDateFrancaise, _buiaNorm: _buiaNorm };

// ---------------- Masquage ----------------
var BUIA_MASQUE_COURRIEL = '[courriel masqué]';
var BUIA_MASQUE_IBAN = '[IBAN masqué]';
var BUIA_MASQUE_TELEPHONE = '[numéro masqué]';

// Remplace les courriels, les IBAN et les numéros de téléphone français. Jamais les noms ni les adresses : la personne les masque elle-même.
// Retour : { texte, courriels, iban, telephones, total }. L'ordre compte : un IBAN contient des chiffres que le téléphone prendrait pour lui.
function buiaMasquer(texte) {
  var t = String(texte === undefined || texte === null ? '' : texte), n = { courriels: 0, iban: 0, telephones: 0 };
  t = t.replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, function () { n.courriels++; return BUIA_MASQUE_COURRIEL; });
  t = t.replace(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,3})?\b/g, function () { n.iban++; return BUIA_MASQUE_IBAN; });
  t = t.replace(/(?:\+33 ?\(?0?\)? ?|0033 ?|\b0)[1-9](?:[ .-]?\d{2}){4}\b/g, function () { n.telephones++; return BUIA_MASQUE_TELEPHONE; });
  return { texte: t, courriels: n.courriels, iban: n.iban, telephones: n.telephones, total: n.courriels + n.iban + n.telephones };
}
// Le message sous le papier, après le masquage.
function buiaMessageMasquage(resultat) {
  var total = resultat && typeof resultat.total === 'number' ? resultat.total : 0;
  var suite = ' Vos nom et adresse restent à masquer vous-même.';
  return total ? (total + ' élément' + (total > 1 ? 's' : '') + ' masqué' + (total > 1 ? 's' : '') + '.' + suite) : ('Aucun numéro ni courriel repéré.' + suite);
}

// ---------------- Lecture des dates ----------------
var _BUIA_MOIS = { janvier: 0, janv: 0, fevrier: 1, fevr: 1, mars: 2, avril: 3, avr: 3, mai: 4, juin: 5, juillet: 6, juil: 6, aout: 7, septembre: 8, sept: 8, octobre: 9, oct: 9, novembre: 10, nov: 10, decembre: 11, dec: 11 };
var _BUIA_RE_MOIS = '(janvier|janv|fevrier|fevr|mars|avril|avr|mai|juin|juillet|juil|aout|septembre|sept|octobre|oct|novembre|nov|decembre|dec)\\.?(?![a-z])';
var _BUIA_RE_JOUR = '(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)';

function _buiaDateValide(annee, mois, jour) {
  var d = new Date(annee, mois, jour);
  return (d.getFullYear() === annee && d.getMonth() === mois && d.getDate() === jour) ? d : null;
}
// Minuit du jour donné (la comparaison se fait toujours entre jours, jamais entre heures).
function _buiaMinuit(date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
// Nombre de jours entre aujourd'hui et la date (négatif si passée).
function buiaJoursEntre(aujourdhui, date) { return Math.round((_buiaMinuit(date).getTime() - _buiaMinuit(aujourdhui).getTime()) / 86400000); }

// Année probable d'une date écrite sans année : celle qui tombe le plus près d'aujourd'hui.
function _buiaAnneeProche(aujourdhui, mois, jour) {
  var a = aujourdhui.getFullYear(), meilleur = null, ecart = Infinity;
  [a - 1, a, a + 1].forEach(function (an) {
    var d = _buiaDateValide(an, mois, jour);
    if (d) { var e = Math.abs(buiaJoursEntre(aujourdhui, d)); if (e < ecart) { ecart = e; meilleur = d; } }
  });
  return meilleur;
}

// La phrase qui contient la date (au plus 220 caractères), pour la montrer à la personne.
function _buiaPhraseAutour(ligne, debut) {
  var avant = ligne.slice(0, debut), apres = ligne.slice(debut);
  var i = Math.max(avant.lastIndexOf('. '), avant.lastIndexOf('! '), avant.lastIndexOf('? '));
  var m = /[.!?]\s/.exec(apres);
  var phrase = ligne.slice(i === -1 ? 0 : i + 2, m ? debut + m.index + 1 : ligne.length).trim();
  return phrase.length > 220 ? phrase.slice(0, 217).trim() + '...' : phrase;
}

// Formulations lues (texte sans accent, casse ignorée) :
//   « 12 novembre 2026 », « 1er mars 2026 », « 3 déc. 2026 », « 12/11/2026 », « 12-11-2026 », « 12.11.2026 », « 12/11/26 » ;
//   sans année, seulement quand le contexte est clair : « mardi 24 novembre », « avant le 30 novembre », « au 5 décembre ». L'année retenue est la plus proche d'aujourd'hui.
// Une date sans année qui commence une période (« du 1er mars au 31 mai 2026 ») est ignorée : elle n'est pas une échéance.
// Retour : [{ date, phrase, sansAnnee }], sans doublon de jour.
function buiaLireDates(texte, aujourdhui) {
  var aj = (aujourdhui instanceof Date && !isNaN(aujourdhui.getTime())) ? aujourdhui : new Date();
  var res = [], vus = {};
  function ajouter(d, phrase, sansAnnee) {
    if (!d) { return; }
    var k = d.getTime();
    if (!vus[k]) { vus[k] = 1; res.push({ date: d, phrase: phrase, sansAnnee: !!sansAnnee }); }
  }
  String(texte === undefined || texte === null ? '' : texte).split(/\n+/).forEach(function (ligne) {
    var n = _buiaP._buiaNorm(ligne), m, re;
    // Les lignes sont normalisées lettre pour lettre : les positions restent les mêmes dans la ligne d'origine.
    re = new RegExp('(\\d{1,2})(?:er)?\\s+' + _BUIA_RE_MOIS + '\\s+(\\d{4})(?!\\d)', 'g');
    while ((m = re.exec(n))) { ajouter(_buiaDateValide(+m[3], _BUIA_MOIS[m[2]], +m[1]), _buiaPhraseAutour(ligne, m.index), false); }
    re = /(\d{1,2})([\/.-])(\d{1,2})\2(\d{4}|\d{2})(?!\d)/g;
    while ((m = re.exec(n))) {
      var av = m.index > 0 ? n.charAt(m.index - 1) : '', ap = n.charAt(m.index + m[0].length);
      if (/[\d\/.-]/.test(av) || /[\d\/-]/.test(ap) || (ap === '.' && /\d/.test(n.charAt(m.index + m[0].length + 1)))) { continue; } // un numéro de téléphone ou de dossier n'est pas une date
      if (m[4].length === 2 && m[2] !== '/') { continue; }
      var an = m[4].length === 2 ? 2000 + (+m[4]) : +m[4];
      ajouter(_buiaDateValide(an, +m[3] - 1, +m[1]), _buiaPhraseAutour(ligne, m.index), false);
    }
    re = new RegExp('(?:^|[^a-z0-9])(?:' + _BUIA_RE_JOUR + '|(le|au|du))\\s+(\\d{1,2})(?:er)?\\s+' + _BUIA_RE_MOIS + '(?!\\s*\\d{4})', 'g');
    while ((m = re.exec(n))) {
      var suite = n.slice(m.index + m[0].length);
      if (m[2] === 'du' || /^\s+(?:au|jusqu\S{0,3}\s*au)\s+(?:le\s+)?\d/.test(suite)) { continue; } // « du 1er mars au 31 mai » : le début d'une période, pas une échéance
      ajouter(_buiaAnneeProche(aj, _BUIA_MOIS[m[4]], +m[3]), _buiaPhraseAutour(ligne, m.index), true);
    }
  });
  res.sort(function (a, b) { return a.date.getTime() - b.date.getTime(); });
  return res;
}

// ---------------- Lecture des délais ----------------
// Un délai écrit en durée (« délai de 15 jours à compter de la réception ») : montré tel qu'il est écrit, jamais converti en date.
function buiaLireDelais(texte) {
  var t = String(texte === undefined || texte === null ? '' : texte), res = [], m;
  var re = /(?:dans un )?d[eé]lai de (?:\d+|[a-zéèêû]+)\s+(?:jours?|semaines?|mois|heures?)(?: (?:calendaires|ouvrés|ouvrables))?(?: à compter [^.\n,;:]*)?/gi;
  while ((m = re.exec(t))) { var d = m[0].trim().replace(/^dans un /i, ''); if (res.indexOf(d) === -1) { res.push(d); } }
  var re2 = /\bsous (?:\d+|[a-zéèêû]+)\s+(?:jours?|semaines?|mois|heures?)(?: (?:calendaires|ouvrés|ouvrables))?(?: à compter [^.\n,;:]*)?/gi;
  while ((m = re2.exec(t))) { var d2 = m[0].trim(); if (res.indexOf(d2) === -1) { res.push(d2); } }
  return res;
}

// ---------------- L'alerte ----------------
var BUIA_JOURS_ALERTE = 14;
// Retour : { proches, autres, delais, passeeNonCourrier } ; vide (null) s'il n'y a rien à analyser.
//  proches : dates des 14 prochains jours (aujourd'hui compris) ; autres : le reste, avec sa nature (courrier, passée, à venir).
//  Une « date du courrier » est la date d'envoi, écrite en tête (« Ville, le 12 novembre 2026 ») : ce n'est jamais une échéance.
function buiaAlerteDates(texte, aujourdhui) {
  var t = String(texte === undefined || texte === null ? '' : texte).trim();
  if (!t) { return null; }
  var aj = (aujourdhui instanceof Date && !isNaN(aujourdhui.getTime())) ? aujourdhui : new Date();
  var proches = [], autres = [], passeeNonCourrier = false;
  buiaLireDates(t, aj).forEach(function (x) {
    var j = buiaJoursEntre(aj, x.date), item = { date: x.date, phrase: x.phrase, jours: j, sansAnnee: x.sansAnnee };
    if (j >= 0 && j <= BUIA_JOURS_ALERTE) { proches.push(item); return; }
    item.nature = /^[^,]{2,70},\s*le\s/i.test(x.phrase) ? 'courrier' : (j < 0 ? 'passee' : 'avenir');
    if (item.nature === 'passee') { passeeNonCourrier = true; }
    autres.push(item);
  });
  return { proches: proches, autres: autres, delais: buiaLireDelais(t), passeeNonCourrier: passeeNonCourrier };
}

function buiaLibelleJours(j) { return j === 0 ? 'aujourd’hui' : (j === 1 ? 'demain' : 'dans ' + j + ' jours'); }

// « Une date proche a été repérée dans votre courrier : mardi 24 novembre 2026 (demain). » (une phrase par date proche)
function buiaPhrasesProches(alerte) {
  if (!alerte) { return []; }
  return alerte.proches.map(function (x) {
    return { titre: 'Une date proche a été repérée dans votre courrier : ' + _buiaP.buiaDateFrancaise(x.date, { jourSemaine: true, annee: true }) + ' (' + buiaLibelleJours(x.jours) + ').',
      conseil: 'Vérifiez-la dans le courrier.', phrase: 'Phrase du courrier : « ' + x.phrase + ' »' };
  });
}
// Le message calme sous les dates proches : les délais écrits en durée, puis les autres dates. Chaîne vide s'il n'y a rien à dire.
function buiaTexteAlerteDouce(alerte) {
  if (!alerte) { return ''; }
  var txt = [];
  if (alerte.delais.length) {
    txt.push((alerte.delais.length > 1 ? 'Des délais sont indiqués : ' : 'Un délai est indiqué : ') + alerte.delais.map(function (x) { return '« ' + x + ' »'; }).join(' ; ') +
      '. Lisez-' + (alerte.delais.length > 1 ? 'les' : 'le') + ' avec attention : l’application ne peut pas en tirer une date.');
  }
  if (alerte.autres.length) {
    var liste = alerte.autres.map(function (x) {
      return _buiaP.buiaDateFrancaise(x.date, { annee: true }) + (x.nature === 'courrier' ? ' (date du courrier)' : (x.nature === 'passee' ? ' (passée)' : ' (à venir)'));
    }).join(' ; ');
    txt.push('Autres dates repérées : ' + liste + '.' + (alerte.passeeNonCourrier ? ' Pour une date passée, vérifiez dans le courrier si une démarche reste à faire.' : ''));
  }
  return txt.join(' ');
}
// La ligne ajoutée à la demande SEULEMENT si la personne le souhaite (case « Ajouter cette date à ma demande »). Chaîne vide s'il n'y a pas de date proche.
function buiaLigneRepriseDate(alerte) {
  if (!alerte || !alerte.proches.length) { return ''; }
  return 'Une date proche est écrite dans le courrier : ' + alerte.proches.map(function (x) { return _buiaP.buiaDateFrancaise(x.date, { annee: true }); }).join(' ; ') + '. Mets-la tout en haut de ta réponse, en une phrase calme.';
}
// La ligne de la date du jour, toujours ajoutée à une demande qui parle d'un délai.
function buiaLigneDateDuJour(aujourdhui) {
  var d = (aujourdhui instanceof Date && !isNaN(aujourdhui.getTime())) ? aujourdhui : new Date();
  return 'Aujourd’hui, nous sommes le ' + _buiaP.buiaDateFrancaise(d, { annee: true }) + '.';
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buiaMasquer: buiaMasquer, buiaMessageMasquage: buiaMessageMasquage, buiaJoursEntre: buiaJoursEntre, buiaLireDates: buiaLireDates, buiaLireDelais: buiaLireDelais,
    buiaAlerteDates: buiaAlerteDates, buiaLibelleJours: buiaLibelleJours, buiaPhrasesProches: buiaPhrasesProches, buiaTexteAlerteDouce: buiaTexteAlerteDouce,
    buiaLigneRepriseDate: buiaLigneRepriseDate, buiaLigneDateDuJour: buiaLigneDateDuJour, BUIA_JOURS_ALERTE: BUIA_JOURS_ALERTE,
    BUIA_MASQUE_COURRIEL: BUIA_MASQUE_COURRIEL, BUIA_MASQUE_IBAN: BUIA_MASQUE_IBAN, BUIA_MASQUE_TELEPHONE: BUIA_MASQUE_TELEPHONE };
}
