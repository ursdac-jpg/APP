/* ============================================================
   veilleAttente.js  --  les fiches « inaccessibles pour l'instant » (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Un site fermé quelque temps (maintenance, sécurité, panne) garde sa fiche, mais son lien n'est plus montré au public : message neutre, téléphone conservé.
   La liste est gardée dans modules/mon-territoire/contenu/en-attente.txt (suivi par Git ; L'APPLICATION LE LIT) : « registre | identifiant | raison | constat | dernier avis ».
   Le FORMAT (lecture, contrôle, règle des 90 jours) vit dans modules/mon-territoire/logique.js : cet outil ne fait que l'écrire. Les dates sont celles du jour de l'outil,
   jamais écrites par Claude. Aucune dépendance (Node seul).
   ============================================================ */
'use strict';

const L = require('../modules/mon-territoire/logique.js');

const CHEMIN = ['modules', 'mon-territoire', 'contenu', 'en-attente.txt'];
const ENTETE = [
  '# Fiches « inaccessibles pour l\'instant » : un site fermé quelque temps (maintenance, sécurité, panne) garde sa fiche, mais son lien n\'est plus montré au public (message neutre, téléphone conservé).',
  '# Format : registre (lieux, employeurs ou offres) | identifiant de la fiche | raison (maintenance, securite, panne ou autre) | date du constat | date du dernier avis de Denis (« garder en attente »).',
  '# Écrit par l\'outil de veille (module « Qui fait quoi »). Au bout de 90 jours sans nouvel avis, l\'outil demande : garder en attente ou retirer la fiche. Rien ne s\'efface tout seul.'
];

function texteDe(lignes) {
  return ENTETE.concat(lignes.map(function (x) { return [x.registre, x.id, x.motif, x.constat, x.avis].join(' | '); })).join('\n') + '\n';
}

// Applique des actions et rend { ok, texte, resume: { mises, gardees, retirees } } ; n'écrit rien nulle part.
//   { op: 'mettre', registre, id, motif }  : la fiche passe en attente (constat et avis = aujourd'hui) ; elle doit exister dans son registre
//   { op: 'garder', registre, id }         : « garder en attente » : le dernier avis devient aujourd'hui (le rappel des 90 jours repart)
//   { op: 'retirer', registre, id }        : « il est revenu » : le lien est de nouveau montré (la ligne disparaît)
// ids : { lieux: [identifiants], employeurs: [...], offres: [...] } ; supprimes : { 'lieux:identifiant': true } = fiches retirées du registre dans la même publication (leur ligne d'attente part avec).
function appliquer(texte, actions, aujourdhui, ids, supprimes) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(aujourdhui || ''))) { return { ok: false, erreur: 'Date du jour illisible.' }; }
  const lu = L.mtParserAttente(texte);
  if (lu.erreurs.length) { return { ok: false, erreur: 'Le fichier des fiches en attente est illisible (' + lu.erreurs[0] + ').' }; }
  let lignes = lu.lignes.slice();
  const resume = { mises: 0, gardees: 0, retirees: 0 };
  for (const a of (Array.isArray(actions) ? actions : [])) {
    if (!a || ['mettre', 'garder', 'retirer'].indexOf(a.op) === -1) { return { ok: false, erreur: 'Action « ' + String(a && a.op).slice(0, 20) + ' » inconnue pour les fiches en attente.' }; }
    if (L.MT_ATTENTE_REGISTRES.indexOf(a.registre) === -1 || !/^[a-z0-9][a-z0-9-]{1,80}$/.test(String(a.id || ''))) { return { ok: false, erreur: 'Fiche illisible (registre ou identifiant).' }; }
    const i = lignes.findIndex(function (x) { return x.registre === a.registre && x.id === a.id; });
    if (a.op === 'mettre') {
      if (!L.MT_ATTENTE_MOTIFS[a.motif]) { return { ok: false, erreur: a.id + ' : choisissez la raison (maintenance, sécurité, panne ou autre).' }; }
      if (ids && !(ids[a.registre] || []).some(function (x) { return x === a.id; })) { return { ok: false, erreur: 'La fiche « ' + a.id + ' » n\'existe pas dans le registre « ' + a.registre + ' » : rien n\'est mis en attente.' }; }
      const nouvelle = { registre: a.registre, id: a.id, motif: a.motif, constat: aujourdhui, avis: aujourdhui };
      if (i === -1) { lignes.push(nouvelle); } else { lignes[i] = nouvelle; }
      resume.mises++; continue;
    }
    if (i === -1) { return { ok: false, erreur: a.id + ' : cette fiche n\'est pas en attente.' }; }
    if (a.op === 'garder') { lignes[i] = Object.assign({}, lignes[i], { avis: aujourdhui }); resume.gardees++; }
    else { lignes.splice(i, 1); resume.retirees++; }
  }
  if (supprimes) { lignes = lignes.filter(function (x) { return !supprimes[x.registre + ':' + x.id]; }); }
  return { ok: true, texte: texteDe(lignes), resume: resume };
}

module.exports = { CHEMIN: CHEMIN, ENTETE: ENTETE, appliquer: appliquer };
