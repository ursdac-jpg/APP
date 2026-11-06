/* ============================================================
   veilleRegardees.js  --  le repère « Regardée sans résultat clair » des fiches du sas (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Une fiche listée dans outils/sas/deja-regardees.txt a déjà été regardée (par Denis ou par Claude, avec un assistant), mais sans qu'on puisse la valider : la page ne confirme pas tout,
   ou l'on n'est pas sûr que l'employeur ou la structure existe en Dordogne ou en Haute-Vienne. Dans le sas, elle est alors « Jamais vérifiée » (décision de Denis, 05/11/2026) :
   Denis la regarde lui-même et décide de la valider ou de l'effacer. Une fiche pré-validée (« Prête : un clic ») passe avant ce repère.
   Format du fichier (suivi par Git ; L'APPLICATION NE LIT PAS CE FICHIER) : « identifiant | date AAAA-MM-JJ | remarque libre » (la remarque peut contenir « | »).
   Aucune dépendance (Node seul).
   ============================================================ */
'use strict';

const CHEMIN = ['outils', 'sas', 'deja-regardees.txt'];
const RE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Texte -> { ok, lignes: [{ id, date, remarque }] } ; une ligne illisible est une erreur (jamais ignorée en silence).
function lire(texte) {
  const lignes = [], brut = String(texte || '').split(/\r?\n/);
  for (let i = 0; i < brut.length; i++) {
    const l = brut[i].trim();
    if (!l || l.charAt(0) === '#') { continue; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length < 2 || !RE_ID.test(c[0]) || !RE_DATE.test(c[1])) { return { ok: false, erreur: 'Ligne ' + (i + 1) + ' du fichier des fiches déjà regardées illisible : ' + l.slice(0, 60) }; }
    lignes.push({ id: c[0], date: c[1], remarque: c.slice(2).join(' | ') });
  }
  return { ok: true, lignes: lignes };
}

// Ajoute à chaque carte du sas déjà regardée son repère : carte.regardee = { date, remarque }. Rend { ok, annotees }.
function annoter(cartes, texte) {
  const l = lire(texte);
  if (!l.ok) { return { ok: false, erreur: l.erreur, annotees: 0 }; }
  const par = {}; l.lignes.forEach(function (x) { par[x.id] = x; });
  let n = 0;
  cartes.forEach(function (c) { const r = par[c.id]; if (r) { n++; c.regardee = { date: r.date, remarque: r.remarque }; } });
  return { ok: true, annotees: n };
}

module.exports = { CHEMIN: CHEMIN, lire: lire, annoter: annoter };
