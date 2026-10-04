/* ============================================================
   modules/cv-core/dates.js
   ------------------------------------------------------------
   Dates d'un CV (C4, 2026-09-26) : fonctions PURES, testables en Node, sans dependance.
   - normaliserDateImport(texte)  : « Sept. 2023 », « 09/2023 », « 2023-09 », « 2023 » -> « 2023-09 » ou « 2023 » ('' si aucune).
                                    Le MOIS est conserve quand il est ecrit (avant, seule l'annee etait gardee : le mois etait perdu).
   - separerDatesDuTitre(titre)   : « Chargee de formation (2019-2022) » -> { titre: « Chargee de formation », dateDebut: « 2019 »,
                                    dateFin: « 2022 », periode: « 2019 - 2022 », trouve: true }. Les dates n'ont rien a faire dans un titre :
                                    elles vont dans les champs de dates.
   - formaterDateCourte(date)     : « 2023-09 » -> « sept. 2023 » ; « 2023 » -> « 2023 ».
   ============================================================ */

var _DATES_MOIS = { janvier: 1, janv: 1, jan: 1, fevrier: 2, fevr: 2, fev: 2, mars: 3, avril: 4, avr: 4, mai: 5, juin: 6, juillet: 7, juil: 7,
  aout: 8, septembre: 9, sept: 9, sep: 9, octobre: 10, oct: 10, novembre: 11, nov: 11, decembre: 12, dec: 12 };
var _DATES_NOMS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

function _datesSansAccents(t) { return String(t === undefined || t === null ? '' : t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
function _datesDeuxChiffres(n) { return ('0' + n).slice(-2); }

function normaliserDateImport(texte) {
  var t = _datesSansAccents(texte).trim();
  if (!t) { return ''; }
  var m;
  // jj/mm/aaaa : le jour est ignore, le mois est garde
  if ((m = t.match(/(?:^|\D)(\d{1,2})[\/.\-](\d{1,2})[\/.\-]((?:19|20)\d{2})(?!\d)/)) && +m[2] >= 1 && +m[2] <= 12) { return m[3] + '-' + _datesDeuxChiffres(m[2]); }
  // aaaa-mm
  if ((m = t.match(/((?:19|20)\d{2})[\/.\-](\d{1,2})(?!\d)/)) && +m[2] >= 1 && +m[2] <= 12) { return m[1] + '-' + _datesDeuxChiffres(m[2]); }
  // mm/aaaa
  if ((m = t.match(/(?:^|\D)(\d{1,2})[\/.\-]\s?((?:19|20)\d{2})(?!\d)/)) && +m[1] >= 1 && +m[1] <= 12) { return m[2] + '-' + _datesDeuxChiffres(m[1]); }
  // mois ecrit + annee
  if ((m = t.match(/([a-z]+)\.?\s+((?:19|20)\d{2})(?!\d)/)) && _DATES_MOIS[m[1]]) { return m[2] + '-' + _datesDeuxChiffres(_DATES_MOIS[m[1]]); }
  if ((m = t.match(/(?:^|\D)((?:19|20)\d{2})(?!\d)/))) { return m[1]; }
  return '';
}

function formaterDateCourte(date) {
  var m = String(date || '').match(/^((?:19|20)\d{2})-(\d{2})$/);
  if (!m) { return String(date || '').slice(0, 4); }
  var mois = parseInt(m[2], 10);
  return (mois >= 1 && mois <= 12) ? (_DATES_NOMS_COURTS[mois - 1] + ' ' + m[1]) : m[1];
}

var _DATES_MOIS_RE = 'janvier|janv|fevrier|fevr|fev|mars|avril|avr|mai|juin|juillet|juil|aout|septembre|sept|sep|octobre|oct|novembre|nov|decembre|dec';
var _DATES_DT = '(?:(?:0?[1-9]|1[0-2])[\\/.\\-]\\s?)?(?:19|20)\\d{2}|(?:' + _DATES_MOIS_RE + ')\\.?\\s+(?:19|20)\\d{2}';
var _DATES_FIN = '(?:' + _DATES_DT + "|aujourd'?hui|present|actuel|actuellement|en cours|ce jour)";
var _DATES_PLAGE = '(?:(?:de|depuis|du|en)\\s+)?(' + _DATES_DT + ")(?:\\s*(?:-|–|—|a|au|jusqu'?a|jusqu'?au|/)\\s*(" + _DATES_FIN + '))?';
var _DATES_SEP = '[\\s\\-–—:,]';

function separerDatesDuTitre(titre) {
  var original = String(titre === undefined || titre === null ? '' : titre);
  var sans = _datesSansAccents(original);
  var motifs = [
    new RegExp(_DATES_SEP + '*\\(\\s*' + _DATES_PLAGE + '\\s*\\)\\s*$'),      // ... (2019-2022)
    new RegExp(_DATES_SEP + '+' + _DATES_PLAGE + '\\s*$'),                     // ... - 2019 - 2022
    new RegExp('^\\s*\\(\\s*' + _DATES_PLAGE + '\\s*\\)' + _DATES_SEP + '*'),  // (2019-2022) ...
    new RegExp('^\\s*' + _DATES_PLAGE + _DATES_SEP + '+')                      // 2019-2022 : ...
  ];
  for (var i = 0; i < motifs.length; i++) {
    var m = sans.match(motifs[i]);
    if (!m) { continue; }
    var reste = (original.slice(0, m.index) + original.slice(m.index + m[0].length)).replace(/^[\s\-–—:,]+|[\s\-–—:,]+$/g, '').trim();
    if (!reste) { continue; }
    var debut = normaliserDateImport(m[1]);
    var fin = m[2] ? normaliserDateImport(m[2]) : '';
    if (!debut) { continue; }
    var periode = fin && fin !== debut ? debut + ' - ' + fin : debut;
    // enCours : l'ecrit dit explicitement « depuis 2013 » ou « 2013 - aujourd'hui » (jamais deduit d'une annee seule, voir dateFinImportee)
    var enCours = !fin && (!!m[2] || /\bdepuis\b/.test(m[0]));
    return { titre: reste, dateDebut: debut, dateFin: fin, periode: periode, trouve: true, enCours: enCours };
  }
  return { titre: original, dateDebut: '', dateFin: '', periode: '', trouve: false, enCours: false };
}

// Annee seule (retour Denis 2026-10-01) : quand le CV ne donne QU'UNE annee pour une experience (« 2013 »), cela veut dire « cette annee-la » ; on n'en deduit
// jamais « depuis 2013 jusqu'a aujourd'hui ». « En cours » n'est retenu que si le CV ou l'assistant l'ecrit (« en cours », « aujourd'hui », « depuis 2013 »).
// Dans le dossier, une date de fin vide veut dire « en cours » : une annee seule recoit donc la MEME annee en debut et en fin.
function estMentionEnCours(texte) {
  return /\b(en cours|present|actuel|actuellement|ce jour|maintenant|toujours en poste|toujours en activite)\b|aujourd.?hui/.test(_datesSansAccents(texte));
}
function dateFinImportee(dateDebut, dateFinBrute, enCoursDuTitre) {
  var brut = String(dateFinBrute === undefined || dateFinBrute === null ? '' : dateFinBrute).trim();
  if (estMentionEnCours(brut)) { return ''; }
  var lue = normaliserDateImport(brut);
  if (lue) { return lue; }
  if (enCoursDuTitre) { return ''; }
  return String(dateDebut || '');
}

// Ordre chronologique des experiences et des formations extraites (retour Denis 2026-09-30) : toujours du plus recent au plus ancien,
// jamais melange. Une experience sans date de fin = « en cours » = la plus recente ; sans aucune date = apres les autres, dans son
// ordre d'origine. Formations : la date de fin, sinon l'annee. Le tri est stable (a dates egales l'ordre d'origine est garde).
function _datesRangAnnee(texte, moisParDefaut) {
  var d = normaliserDateImport(texte);
  if (!d) { return 0; }
  var m = d.match(/^((?:19|20)\d{2})(?:-(\d{2}))?$/);
  return m ? (+m[1]) * 100 + (m[2] ? +m[2] : moisParDefaut) : 0;
}
function cleChronologiqueExperience(e) {
  var debut = _datesRangAnnee(e && e.dateDebut, 1);
  var fin = _datesRangAnnee(e && e.dateFin, 12);
  if (!debut && !fin) { return null; }
  return { fin: fin || 999912, debut: debut || fin };
}
function cleChronologiqueFormation(f) {
  var fin = _datesRangAnnee(f && f.dateFin, 12);
  var debut = _datesRangAnnee(f && f.dateDebut, 1);
  if (!fin) {
    var annees = String((f && f.annee) || '').match(/(?:19|20)\d{2}/g);
    if (annees) { fin = Math.max.apply(null, annees.map(Number)) * 100 + 12; }
  }
  if (!fin && !debut) { return null; }
  return { fin: fin || debut, debut: debut || fin };
}
function trierDuPlusRecent(liste, cle) {
  if (!Array.isArray(liste)) { return liste; }
  return liste.map(function (x, i) { return { x: x, i: i, k: cle(x) }; }).sort(function (a, b) {
    if (!a.k && !b.k) { return a.i - b.i; }
    if (!a.k) { return 1; }
    if (!b.k) { return -1; }
    if (a.k.fin !== b.k.fin) { return b.k.fin - a.k.fin; }
    if (a.k.debut !== b.k.debut) { return b.k.debut - a.k.debut; }
    return a.i - b.i;
  }).map(function (o) { return o.x; });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normaliserDateImport: normaliserDateImport, separerDatesDuTitre: separerDatesDuTitre, formaterDateCourte: formaterDateCourte,
    estMentionEnCours: estMentionEnCours, dateFinImportee: dateFinImportee,
    cleChronologiqueExperience: cleChronologiqueExperience, cleChronologiqueFormation: cleChronologiqueFormation, trierDuPlusRecent: trierDuPlusRecent };
}
