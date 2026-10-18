/* ============================================================
   veilleSansNumero.js  --  mémoriser « cette fiche n'a pas de numéro de téléphone » (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Une fiche publiée sans numéro réapparaît dans le sas des numéros jusqu'à ce que Denis ait vérifié qu'il n'y en a vraiment pas. Cette confirmation est gardée dans
   modules/mon-territoire/contenu/sans-numero.txt (suivi par Git, comme les registres ; L'APPLICATION NE LIT PAS CE FICHIER) : « registre | identifiant | date ».
   La date est celle de la confirmation de Denis (jamais écrite par Claude) : au bout de six mois la fiche réapparaît pour être revérifiée.
   Aucune dépendance (Node seul).
   ============================================================ */
'use strict';

const CHEMIN = ['modules', 'mon-territoire', 'contenu', 'sans-numero.txt'];
const REGISTRES = ['lieux', 'employeurs'];
const RE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ENTETE = [
  '# Fiches publiées dont Denis a VÉRIFIÉ qu\'elles n\'ont pas de numéro de téléphone. L\'application NE LIT PAS ce fichier : seul l\'outil de veille s\'en sert (sas des numéros).',
  '# Format : registre (lieux ou employeurs) | identifiant de la fiche | date de la confirmation de Denis. Au bout de six mois, la fiche réapparaît dans le sas des numéros pour être revérifiée.'
];

// Texte -> { ok, lignes: [{ registre, id, date }] } ; une ligne illisible est une erreur (jamais ignorée en silence).
function lire(texte) {
  const lignes = [];
  const brut = String(texte || '').split(/\r?\n/);
  for (let i = 0; i < brut.length; i++) {
    const l = brut[i].trim();
    if (!l || l.charAt(0) === '#') { continue; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length !== 3 || REGISTRES.indexOf(c[0]) === -1 || !RE_ID.test(c[1]) || !RE_DATE.test(c[2])) { return { ok: false, erreur: 'Ligne ' + (i + 1) + ' du fichier « sans numéro » illisible : ' + l.slice(0, 60) }; }
    lignes.push({ registre: c[0], id: c[1], date: c[2] });
  }
  return { ok: true, lignes: lignes };
}

// { 'lieux:identifiant': 'AAAA-MM-JJ' } (texte illisible : aucune confirmation, jamais une exception).
function confirmations(texte) {
  const r = lire(texte), m = {};
  if (r.ok) { r.lignes.forEach(function (x) { m[x.registre + ':' + x.id] = x.date; }); }
  return m;
}

function moisEntre(depuis, jusqua) {
  const a = new Date(depuis + 'T00:00:00Z'), b = new Date(jusqua + 'T00:00:00Z');
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
}

// Une confirmation est valable moins de `mois` mois (défaut 6) : après, la fiche est à revérifier.
function estValable(date, aujourdhui, mois) {
  if (!RE_DATE.test(String(date || '')) || !RE_DATE.test(String(aujourdhui || ''))) { return false; }
  const m = moisEntre(date, aujourdhui);
  return m >= 0 && m < (mois || 6);
}

// Applique des actions { op: 'ajouter', registre, id } : écrit ou renouvelle la confirmation du jour. ids : { lieux: [identifiants], employeurs: [...] } (la fiche doit exister).
// Rend { ok, texte, resume: { ajoutes, renouveles } } ; n'écrit rien nulle part.
function appliquer(texte, actions, aujourdhui, ids) {
  if (!RE_DATE.test(String(aujourdhui || ''))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = lire(texte);
  if (!lu.ok) { return lu; }
  const lignes = lu.lignes.slice();
  const resume = { ajoutes: 0, renouveles: 0 };
  for (const a of (Array.isArray(actions) ? actions : [])) {
    if (!a || a.op !== 'ajouter') { return { ok: false, erreur: 'Action « ' + String(a && a.op).slice(0, 20) + ' » inconnue pour le fichier « sans numéro ».' }; }
    if (REGISTRES.indexOf(a.registre) === -1 || !RE_ID.test(String(a.id || ''))) { return { ok: false, erreur: 'Fiche illisible (registre ou identifiant).' }; }
    if (ids && !(ids[a.registre] || []).some(function (x) { return x === a.id; })) { return { ok: false, erreur: 'La fiche « ' + a.id + ' » n\'existe pas dans le registre « ' + a.registre + ' » : rien n\'est mémorisé.' }; }
    const i = lignes.findIndex(function (x) { return x.registre === a.registre && x.id === a.id; });
    if (i === -1) { lignes.push({ registre: a.registre, id: a.id, date: aujourdhui }); resume.ajoutes++; }
    else { lignes[i] = { registre: a.registre, id: a.id, date: aujourdhui }; resume.renouveles++; }
  }
  const sortie = ENTETE.concat(lignes.map(function (x) { return x.registre + ' | ' + x.id + ' | ' + x.date; })).join('\n') + '\n';
  return { ok: true, texte: sortie, resume: resume };
}

// Les fiches PUBLIÉES sans aucun numéro (ni général, ni par magasin), moins celles qu'un numéro proposé attend déjà et celles confirmées « sans numéro » il y a moins de six mois.
// registres : { lieux: texte, employeurs: texte }. Rend des cartes au format du sas des numéros (generee: true).
function cartesSansNumero(registres, texteSans, aujourdhui, ciblesEnAttente) {
  const territoire = require('./veilleTerritoire.js');
  const logique = require('../modules/mon-territoire/logique.js');
  const conf = confirmations(texteSans), attente = {}, cartes = [];
  (ciblesEnAttente || []).forEach(function (c) { attente[c] = true; });
  REGISTRES.forEach(function (reg) {
    territoire.analyser(registres[reg] || '', territoire.FICHIERS[reg].colonnes).lignes.filter(function (l) { return l.id; }).forEach(function (l) {
      const v = l.valeurs;
      if (String(v.telephone || '').trim()) { return; }
      if (reg === 'employeurs' && logique.mtParserEtablissements(v.etablissements).some(function (e) { return String(e.telephone || '').trim(); })) { return; }
      if (attente[l.id]) { return; }
      const d = conf[reg + ':' + l.id];
      if (d && estValable(d, aujourdhui, 6)) { return; }
      cartes.push({ id: 'sans-' + reg + '-' + l.id, nom: v.nom || l.id, generee: true, derniereConfirmation: d || '', fiche: v, valeurs: { cible: l.id, registre: reg, telephone: '', source: '' } });
    });
  });
  return cartes;
}

module.exports = { cartesSansNumero: cartesSansNumero, CHEMIN: CHEMIN, ENTETE: ENTETE, lire: lire, confirmations: confirmations, estValable: estValable, moisEntre: moisEntre, appliquer: appliquer };
