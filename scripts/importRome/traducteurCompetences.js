'use strict';
/* ============================================================
   scripts/importRome/traducteurCompetences.js
   Calcul partagé (génération des fiches du ROME, complément des fiches écrites à la main) : traduit les compétences d'un code du ROME en mots du vocabulaire
   de l'application (tables : tablesCompetences.js), classés par poids. Une seule règle pour tous les usages.
   ============================================================ */
const TC = require('./tablesCompetences.js');
// Ligne de traduction d'une compétence du ROME : règle de macro-compétence d'abord, sinon ligne de l'objectif
const traduireCompetence = (c) => (TC.MACROS.filter((r) => r[0].test(c.macro))[0] || [null, TC.OBJECTIFS[c.objectif] || { sf: [], se: [] }])[1];
// Fréquence de chaque mot dans l'ensemble des codes du ROME (un mot présent partout, comme « Rigueur », pèse peu) : calculée une fois le ROME chargé
let dfMots = null, nbCodesRome = 0;
function calculerFrequences(romeCharge) {
  dfMots = {}; const codes = Object.keys(romeCharge.codes); nbCodesRome = codes.length;
  codes.forEach((code) => {
    const vus = new Set();
    romeCharge.codes[code].competences.forEach((c) => { const l = traduireCompetence(c); (l.sf || []).concat(l.se || []).forEach((m) => vus.add(m)); });
    vus.forEach((m) => { dfMots[m] = (dfMots[m] || 0) + 1; });
  });
}
const poidsMot = (m) => Math.log(nbCodesRome / Math.max(1, dfMots[m] || 1)) + 0.2;
// Mots d'un code classés par poids (nombre de compétences x rareté), côté « sf », « se » ou « sv »
function motsDuCode(f, cote) {
  const n = {}, ordre = [];
  f.competences.forEach((c) => (traduireCompetence(c)[cote] || []).forEach((m) => { if (!(m in n)) { n[m] = 0; ordre.push(m); } n[m]++; }));
  const score = {}; Object.keys(n).forEach((m) => { score[m] = n[m] * (cote === 'sv' ? 1 : poidsMot(m)); });
  return Object.keys(score).sort((a, b) => (score[b] - score[a]) || (ordre.indexOf(a) - ordre.indexOf(b))).map((m) => ({ mot: m, nb: n[m], score: score[m] }));
}


module.exports = { traduireCompetence, calculerFrequences, motsDuCode };
