/* ============================================================
   veillePrevalidees.js  --  le repère « Pré-validée » des fiches du sas (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Une fiche du sas est « pré-validée » quand elle a déjà été contrôlée (par Claude avec l'accord de Denis, ou à la main par Denis) : l'outil la signale en grand dans la fenêtre du sas,
   avec la RAISON de ce contrôle, pour que Denis puisse la retrouver, en choisir plusieurs et leur donner son « C'est bon ». Ce repère ne publie rien et ne date rien : le « C'est bon » reste celui de Denis.
   Le repère est gardé dans outils/sas/prevalidees.txt (suivi par Git ; L'APPLICATION NE LIT PAS CE FICHIER), une ligne par fiche : « sas | identifiant | base du contrôle | empreinte ».
   L'EMPREINTE résume le contenu de la fiche au moment du contrôle (tout sauf la source et la date). Si la fiche est modifiée ensuite, l'empreinte ne correspond plus : le repère devient
   « modifiée depuis » et la fiche n'est plus proposée au cochage en bloc. Aucune date n'est écrite ici (la date de pré-validation est celle du commit Git).
   Aucune dépendance (Node seul).
   ============================================================ */
'use strict';
const crypto = require('crypto');

const CHEMIN = ['outils', 'sas', 'prevalidees.txt'];
const SAS = ['employeurs', 'lieux', 'offres'];
const RE_ID = /^[a-z0-9][a-z0-9-]{0,120}$/;
// Les bases possibles d'une pré-validation : le code (gardé dans le fichier) et le libellé affiché dans le coin de la fiche.
const BASES = {
  'texte-denis': 'Adresses et numéros copiés par Denis depuis la page officielle',
  'denis-main': 'Site ouvert et confirmé à la main par Denis',
  'test-et-assistant': 'Site testé : l\'assistant a lu la page, le nom et la zone y figurent',
  'appel-denis': 'Numéro confirmé par un appel de Denis'
};
// Le niveau d'une base : « main » = vérifié par Denis lui-même (texte copié, site ouvert, appel) ; « assistant » = l'assistant a lu la page et l'adresse a été testée (Denis n'a pas encore ouvert la page).
const NIVEAUX = { 'texte-denis': 'main', 'denis-main': 'main', 'appel-denis': 'main', 'test-et-assistant': 'assistant' };
// Une fiche déposée par la prospection (marque « Via prospection ; ») dont les coordonnées ont été vérifiées à la main par Denis, avec la date écrite par la prospection : « vérifiées à la main le JJ/MM/AAAA ».
const RE_VERIFIEE_PROSPECTION = /^Via prospection ;.*vérifiées? à la main le \d{2}\/\d{2}\/\d{4}/;
function baseDepuisSource(valeurs) { return RE_VERIFIEE_PROSPECTION.test(String((valeurs && valeurs.source) || '').trim()) ? 'denis-main' : ''; }
const ENTETE = [
  '# Fiches du sas PRE-VALIDEES : deja controlees, que Denis peut retrouver et cocher en bloc dans l\'outil de veille. L\'application NE LIT PAS ce fichier.',
  '# Format : sas (employeurs, lieux ou offres) | identifiant de la fiche | base du controle (texte-denis, denis-main, test-et-assistant ou appel-denis) | empreinte de la fiche au moment du controle.',
  '# Si la fiche est modifiee ensuite, l\'empreinte ne correspond plus et le repere devient « modifiee depuis ». Aucune date ici : la date est celle du commit.'
];

// L'empreinte d'une fiche : tout son contenu sauf la source, la date et l'identifiant (deja dans la cle). Colonnes lues dans l'ordre alphabétique : l'ordre du fichier ne compte pas.
function empreinte(valeurs) {
  const v = valeurs || {};
  const morceaux = Object.keys(v).filter(function (k) { return k !== 'source' && k !== 'date' && k !== 'id'; }).sort().map(function (k) { return k + '=' + String(v[k] == null ? '' : v[k]).trim(); });
  return crypto.createHash('sha1').update(morceaux.join('\n')).digest('hex').slice(0, 10);
}

// Texte -> { ok, lignes: [{ sas, id, base, empreinte }] } ; une ligne illisible est une erreur (jamais ignorée en silence).
function lire(texte) {
  const lignes = [], brut = String(texte || '').split(/\r?\n/);
  for (let i = 0; i < brut.length; i++) {
    const l = brut[i].trim();
    if (!l || l.charAt(0) === '#') { continue; }
    const c = l.split('|').map(function (x) { return x.trim(); });
    if (c.length !== 4 || SAS.indexOf(c[0]) === -1 || !RE_ID.test(c[1]) || !BASES[c[2]] || !/^[0-9a-f]{10}$/.test(c[3])) { return { ok: false, erreur: 'Ligne ' + (i + 1) + ' du fichier des fiches pré-validées illisible : « ' + l.slice(0, 80) + ' ».' }; }
    lignes.push({ sas: c[0], id: c[1], base: c[2], empreinte: c[3] });
  }
  return { ok: true, lignes: lignes };
}

// Ajoute (ou remplace) le repère de fiches : demandes = [{ id, base, valeurs }] ; retire aussi les lignes dont la fiche n'est plus dans le sas (publiée ou écartée). Rend le nouveau texte.
function ecrire(texteAvant, sas, demandes, idsPresents) {
  const l = lire(texteAvant);
  if (!l.ok) { throw new Error(l.erreur); }
  const present = {}; (idsPresents || []).forEach(function (id) { present[id] = true; });
  const gardees = l.lignes.filter(function (x) { return !(x.sas === sas && (!present[x.id] || demandes.some(function (d) { return d.id === x.id; }))); });
  demandes.forEach(function (d) {
    if (!BASES[d.base]) { throw new Error('Base de pré-validation inconnue : ' + d.base); }
    if (!present[d.id]) { throw new Error('Fiche absente du sas ' + sas + ' : ' + d.id); }
    gardees.push({ sas: sas, id: d.id, base: d.base, empreinte: empreinte(d.valeurs) });
  });
  gardees.sort(function (a, b) { return a.sas === b.sas ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0) : (a.sas < b.sas ? -1 : 1); });
  return ENTETE.concat(gardees.map(function (x) { return [x.sas, x.id, x.base, x.empreinte].join(' | '); })).join('\n') + '\n';
}

// Ajoute à chaque carte du sas (rendue par veilleSas.lister) son repère : { base, libelle, valide } ; valide = false quand la fiche a changé depuis le contrôle.
function annoter(sas, cartes, texte) {
  const l = lire(texte);
  if (!l.ok || SAS.indexOf(sas) === -1) { return { ok: l.ok, erreur: l.erreur, annotees: 0 }; }
  const par = {}; l.lignes.forEach(function (x) { if (x.sas === sas) { par[x.id] = x; } });
  let n = 0;
  cartes.forEach(function (c) {
    const p = par[c.id]; if (!p) { return; }
    n++; c.prevalidee = { base: p.base, niveau: NIVEAUX[p.base], libelle: BASES[p.base], valide: p.empreinte === empreinte(c.valeurs) };
  });
  return { ok: true, annotees: n };
}

module.exports = { CHEMIN: CHEMIN, SAS: SAS, BASES: BASES, NIVEAUX: NIVEAUX, baseDepuisSource: baseDepuisSource, empreinte: empreinte, lire: lire, ecrire: ecrire, annoter: annoter };
