/* ============================================================
   veilleMotsVerifies.js  --  « ce mot a été revérifié le ... » : la date de dernière vérification de chaque mot du Lexique (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Les mots du Lexique sont de purs textes : data/lexique.js ne porte AUCUNE date de vérification (doctrine, principe 1). Pour pouvoir revérifier « de temps en temps »
   les mots les plus anciens d'abord, la date est gardée à part, dans outils/lexique_verifications.txt (suivi par Git, comme les autres registres de l'outil ;
   L'APPLICATION NE LIT PAS CE FICHIER) : « identifiant | date ». La date est celle du clic de Denis (« Marquer ce mot comme vérifié »), jamais écrite par Claude
   ni par un assistant. Un mot sans ligne est « jamais vérifié ». Au bout de six mois, un mot réapparaît dans « À revérifier ».
   Aucune dépendance (Node seul).
   ============================================================ */
'use strict';

const CHEMIN = ['outils', 'lexique_verifications.txt'];
const SEUIL_MOIS = 6;
const RE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ENTETE = [
  '# Date de dernière vérification des mots du Lexique (faite par Denis, avec le prompt « Faire vérifier ce mot »). L\'application NE LIT PAS ce fichier : seul l\'outil de veille s\'en sert.',
  '# Format : identifiant du mot | date de la vérification. Un mot absent d\'ici est « jamais vérifié » ; au bout de six mois il réapparaît dans « À revérifier ».'
];

// Texte -> { ok, lignes: [{ id, date }] } ; une ligne illisible est une erreur (jamais ignorée en silence).
function lire(texte) {
  const lignes = [], brut = String(texte || '').split(/\r?\n/);
  for (let i = 0; i < brut.length; i++) {
    const l = brut[i].trim();
    if (!l || l.charAt(0) === '#') { continue; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length !== 2 || !RE_ID.test(c[0]) || !RE_DATE.test(c[1])) { return { ok: false, erreur: 'Ligne ' + (i + 1) + ' du fichier des vérifications de mots illisible : ' + l.slice(0, 60) }; }
    lignes.push({ id: c[0], date: c[1] });
  }
  return { ok: true, lignes: lignes };
}

// { 'identifiant': 'AAAA-MM-JJ' } (texte illisible : aucune date, jamais une exception).
function dates(texte) {
  const r = lire(texte), m = {};
  if (r.ok) { r.lignes.forEach(function (x) { m[x.id] = x.date; }); }
  return m;
}

function moisEntre(depuis, jusqua) {
  const a = new Date(depuis + 'T00:00:00Z'), b = new Date(jusqua + 'T00:00:00Z');
  return (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()) - (b.getUTCDate() < a.getUTCDate() ? 1 : 0);
}

// 'jamais' (aucune date), 'a-revoir' (six mois ou plus), 'recent'.
function etat(date, aujourdhui, mois) {
  if (!RE_DATE.test(String(date || ''))) { return 'jamais'; }
  if (!RE_DATE.test(String(aujourdhui || ''))) { return 'recent'; }
  return moisEntre(date, aujourdhui) >= (mois || SEUIL_MOIS) ? 'a-revoir' : 'recent';
}

// Applique des actions { op: 'ajouter', id } : écrit ou renouvelle la date du jour. ids : les identifiants des mots du Lexique (le mot doit exister).
// Rend { ok, texte, resume: { ajoutes, renouveles } } ; n'écrit rien nulle part.
function appliquer(texte, actions, aujourdhui, ids) {
  if (!RE_DATE.test(String(aujourdhui || ''))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = lire(texte);
  if (!lu.ok) { return lu; }
  const lignes = lu.lignes.slice(), resume = { ajoutes: 0, renouveles: 0 };
  for (const a of (Array.isArray(actions) ? actions : [])) {
    if (!a || a.op !== 'ajouter') { return { ok: false, erreur: 'Action « ' + String(a && a.op).slice(0, 20) + ' » inconnue pour les vérifications de mots.' }; }
    if (!RE_ID.test(String(a.id || ''))) { return { ok: false, erreur: 'Identifiant de mot illisible.' }; }
    if (ids && ids.indexOf(a.id) === -1) { return { ok: false, erreur: 'Le mot « ' + a.id + ' » n\'existe pas dans le Lexique : rien n\'est mémorisé.' }; }
    const i = lignes.findIndex(function (x) { return x.id === a.id; });
    if (i === -1) { lignes.push({ id: a.id, date: aujourdhui }); resume.ajoutes++; } else { lignes[i] = { id: a.id, date: aujourdhui }; resume.renouveles++; }
  }
  return { ok: true, texte: ENTETE.concat(lignes.map(function (x) { return x.id + ' | ' + x.date; })).join('\n') + '\n', resume: resume };
}

module.exports = { CHEMIN: CHEMIN, SEUIL_MOIS: SEUIL_MOIS, ENTETE: ENTETE, lire: lire, dates: dates, etat: etat, moisEntre: moisEntre, appliquer: appliquer };
