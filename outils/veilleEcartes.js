/* ============================================================
   veilleEcartes.js  --  l'historique de ce que Denis a ECARTE (changements du balayage, propositions de fiches du cadre)
   ------------------------------------------------------------
   Utilise par outils/veilleChangements.js, outils/veilleFichesSas.js et outils/veilleDepot.js. Node seul, aucune dependance.
   Decision de Denis (09/11/2026, consigne 185) : garder le nom, la date et la raison de ce qui est ecarte ; pouvoir le REMETTRE dans le sas ;
   ne plus reproposer une information identique a une information ecartee (jamais en silence : ce qui est ignore est dit et compte).
   Fichier : outils/sas/ecartes.sas.txt, une entree par ligne en JSON, que l'APPLICATION NE LIT JAMAIS.
   Entree : { id, sorte ('changement' | 'fiche'), ecarte_le, titre, motif, precision, cles, original, reproposee: { nb, derniere } }
     - motif : 'public' (ne concerne pas mon public), 'couvert' (deja couvert par une fiche), 'faux' (fausse ou perimee : seule CETTE version du texte
       est bloquee), 'autre' (avec une precision) ; 'inconnu' pour ce qui a ete retrouve dans l'historique Git (raison non precisee).
     - original : la proposition telle qu'elle etait dans le sas, pour la remettre a l'identique.
   Entree d'un EMPLOYEUR (sorte 'employeur', 09/11/2026) : { ..., lieu, cles: { nom, mots, communes, deps, site, tel }, original: { fichier, ligne } ou null (note a la main) }.
     Motifs : 'ferme' (fermeture confirmee, avec sa source en precision), 'absent' (absent du territoire, NON demontre), 'introuvable' (site disparu et entreprise introuvable), 'autre'.
     Reconnaissance : meme nom (ou tres proche) dans un departement commun. Une FERMETURE vise un etablissement : deux etablissements dont les communes n'ont rien en commun ne sont jamais confondus ;
     « absent du territoire » et « introuvable » visent l'employeur dans tout le departement.
   ============================================================ */
'use strict';
const crypto = require('crypto');

const CHEMIN = 'outils/sas/ecartes.sas.txt';
const MOTIFS_INFO = ['public', 'couvert', 'faux', 'autre'];                     // changements du balayage et fiches du cadre
const MOTIFS_EMPLOYEUR = ['ferme', 'absent', 'introuvable', 'autre'];            // employeurs et pages de recrutement (consigne du 09/11/2026)
const MOTIFS = ['public', 'couvert', 'faux', 'autre', 'ferme', 'absent', 'introuvable', 'inconnu'];
const LIBELLES_MOTIFS = { ferme: 'Fermeture confirmée', absent: 'Absent du territoire (non démontré)', introuvable: 'Site disparu, entreprise introuvable', public: 'Ne concerne pas mon public', couvert: 'Déjà couvert par une fiche', faux: 'Information fausse ou périmée', autre: 'Autre raison', inconnu: 'Raison non précisée' };
const EN_TETE = ['# Historique de ce que Denis a ECARTE (changements du balayage, propositions de fiches) : nom, date, raison, et la proposition d\'origine pour la remettre. L\'application NE LIT PAS ce fichier.',
  '# Une entree par ligne (JSON). Ce qui est ecarte n\'est plus propose par le versement dans les sas ; « Remettre » (outil de veille, « Sas a valider », « Ecartees ») la rend au sas.', ''].join('\n');
const MOTS_VIDES = ['dans', 'pour', 'des', 'les', 'aux', 'avec', 'sur', 'une', 'qui', 'que', 'relatif', 'relative', 'relatifs', 'relatives', 'decret', 'arrete', 'avis', 'loi', 'modifiant', 'portant', 'article', 'application'];

function finDeLigne(t) { return String(t).indexOf('\r\n') !== -1 ? '\r\n' : '\n'; }
function normaliser(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim(); }
function empreinte(s) { return crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 10); }
function mots(s) {
  const vus = {}; const sortie = [];
  normaliser(s).split(' ').forEach(function (m) { if (m.length > 3 && MOTS_VIDES.indexOf(m) === -1 && !vus[m]) { vus[m] = 1; sortie.push(m); } });
  return sortie;
}
function jaccard(a, b) {
  if (!a.length || !b.length) { return 0; }
  const inter = a.filter(function (m) { return b.indexOf(m) !== -1; }).length;
  return inter / (a.length + b.length - inter);
}
// Part des mots du plus court titre qu'on retrouve dans l'autre : un titre repris puis allonge (« ... remboursees » devenu « ... remboursees par l'Assurance maladie »).
function inclusion(a, b) {
  const p = a.length <= b.length ? a : b, g = a.length <= b.length ? b : a;
  if (p.length < 4) { return 0; }
  return p.filter(function (m) { return g.indexOf(m) !== -1; }).length / p.length;
}
function adresse(u) { return String(u || '').trim().toLowerCase().replace(/[#?].*$/, '').replace(/\/+$/, ''); }
function numeros(s) {
  const sortie = []; const re = /n\s*°\s*(\d{4}-\d{1,5})/gi; let m;
  while ((m = re.exec(String(s || '')))) { if (sortie.indexOf(m[1]) === -1) { sortie.push(m[1]); } }
  return sortie;
}

// ---------- cles de reconnaissance ----------
// Changement du balayage (colonnes du sas des changements).
function clesChangement(v) {
  const x = v || {};
  return { mois: String(x.mois || ''), domaine: normaliser(x.domaine), titre: mots(x.intitule), url: adresse(x.source_url),
    nums: numeros([x.intitule, x.nature, x.ce_qui_change].join(' ')), version: empreinte(normaliser(String(x.ce_qui_change || '') + ' ' + String(x.en_vigueur || ''))) };
}
// Proposition de fiche (enregistrement du sas des fiches : genre, fiche, titre, revision, champs).
function clesFiche(r) {
  const x = r || {}, ch = x.champs || {};
  const urls = (x.sources_detail || x.sourcesDetail || []).map(function (d) { return adresse(d && d.url); }).filter(Boolean);
  return { genre: String(x.genre || ''), fiche: String(x.fiche || ''), titre: mots(x.titre), revision: mots(x.revision), urls: urls,
    version: empreinte(JSON.stringify([ch.texte || '', ch.raison || '', ch.remplace_par || ''])) };
}

function hoteDe(u) { return adresse(u).replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]; }
// Employeur ou page de recrutement. info = { nom, communes: [noms normalises], deps: ['24', ...], site, tel } (fabrique par veilleSas.js, qui connait les communes).
function clesEmployeur(info) {
  const x = info || {};
  return { nom: normaliser(x.nom), mots: mots(x.nom), communes: (x.communes || []).map(normaliser).filter(Boolean), deps: (x.deps || []).map(String), site: hoteDe(x.site), tel: String(x.tel || x.telephone || '').replace(/[^0-9]/g, '') };
}
function memeEmployeur(c1, c2, motif) {
  if (c1.deps.length && c2.deps.length && !c1.deps.some(function (d) { return c2.deps.indexOf(d) !== -1; })) { return false; }       // un autre departement : une autre situation
  // Une fermeture vise UN etablissement : un autre etablissement (autre commune) n'est jamais confondu. « Absent du territoire » et « introuvable » visent l'employeur dans tout le departement.
  if (motif !== 'absent' && motif !== 'introuvable' && c1.communes.length && c2.communes.length && !c1.communes.some(function (c) { return c2.communes.indexOf(c) !== -1; })) { return false; }
  if (c1.nom && c1.nom === c2.nom) { return true; }
  const j = jaccard(c1.mots, c2.mots);
  if (j >= 0.8 || inclusion(c1.mots, c2.mots) >= 0.95) { return true; }
  const court = c1.mots.length <= c2.mots.length ? c1.mots : c2.mots, long = c1.mots.length <= c2.mots.length ? c2.mots : c1.mots;
  if (court.length >= 2 && court.every(function (m) { return long.indexOf(m) !== -1; })) { return true; }   // « Clara Automobiles » dans « Toyota Clara Automobiles »
  const unMotCommun = c1.mots.some(function (m) { return c2.mots.indexOf(m) !== -1; });   // meme site (ou meme numero) ET un mot fort du nom en commun
  if (c1.site && c1.site === c2.site && unMotCommun) { return true; }
  if (c1.tel.length >= 8 && c1.tel === c2.tel && unMotCommun) { return true; }
  return false;
}

// ---------- reconnaissance ----------
// Une entree ecartee reconnait-elle ce candidat ? Plus c'est large, plus on risque de bloquer a tort : c'est pourquoi le versement DIT ce qu'il ignore.
function memeChangement(c1, c2) {
  const j = jaccard(c1.titre, c2.titre);
  if (c1.titre.length && c1.titre.join(' ') === c2.titre.join(' ')) { return true; }
  if (j >= 0.8 || inclusion(c1.titre, c2.titre) >= 0.95) { return true; }
  if (c1.mois && c1.mois === c2.mois && c1.domaine && c1.domaine === c2.domaine && j >= 0.6) { return true; }
  // Un meme texte officiel (meme adresse ou meme numero) : on exige un minimum de ressemblance du titre, car une page d'actualites sert de source a plusieurs changements.
  if (c1.url && c1.url === c2.url && j >= 0.3) { return true; }
  if (c1.nums.some(function (n) { return c2.nums.indexOf(n) !== -1; }) && j >= 0.3) { return true; }
  return false;
}
function memeFiche(c1, c2) {
  if (c1.genre !== c2.genre) { return false; }
  if (c1.genre === 'ret') { return c1.fiche === c2.fiche; }
  if (c1.genre === 'maj') {
    if (c1.fiche !== c2.fiche) { return false; }
    return c1.version === c2.version || jaccard(c1.revision, c2.revision) >= 0.6 || (c1.urls.length > 0 && c1.urls.every(function (u) { return c2.urls.indexOf(u) !== -1; }) && c2.urls.length === c1.urls.length);
  }
  if (c1.genre === 'nouv') { return c1.fiche === c2.fiche || jaccard(c1.titre, c2.titre) >= 0.8; }
  return false;
}
// sorte : 'changement' (candidat = colonnes du sas) ou 'fiche' (candidat = enregistrement du sas des fiches). Rend l'entree ecartee reconnue, ou null.
function trouver(ecartes, sorte, candidat) {
  const liste = Array.isArray(ecartes) ? ecartes : [];
  const ck = sorte === 'changement' ? clesChangement(candidat) : (sorte === 'employeur' ? clesEmployeur(candidat) : clesFiche(candidat));
  for (let i = 0; i < liste.length; i++) {
    const e = liste[i]; if (!e || e.sorte !== sorte || !e.cles) { continue; }
    const same = sorte === 'changement' ? memeChangement(e.cles, ck) : (sorte === 'employeur' ? memeEmployeur(e.cles, ck, e.motif) : memeFiche(e.cles, ck));
    if (!same) { continue; }
    if (e.motif === 'faux' && e.cles.version !== ck.version) { continue; }   // « fausse ou perimee » : seule cette version du texte est bloquee
    return e;
  }
  return null;
}

// ---------- fichier ----------
function parser(texte) {
  const sortie = [];
  String(texte || '').split(/\r?\n/).forEach(function (brut) {
    const l = brut.trim(); if (!l || l.charAt(0) === '#') { return; }
    try { const o = JSON.parse(l); if (o && o.id && o.sorte) { sortie.push(o); } } catch (e) { /* ligne illisible : ignoree */ }
  });
  return sortie;
}
function ecrire(entrees, fin) {
  const f = fin || '\n';
  const corps = entrees.map(function (e) { return JSON.stringify(e); }).join(f);
  return EN_TETE.split('\n').join(f) + corps + (entrees.length ? f : '');
}
function identifiantDe(sorte, original) {
  if (sorte === 'changement') { return 'chg-' + String(original.id || empreinte(JSON.stringify(original))); }
  return 'fic-' + String(original.id || empreinte(JSON.stringify(original)));
}
// Fabrique l'entree a partir de la proposition quittant le sas.
function creerEntree(sorte, original, motif, precision, date) {
  const m = MOTIFS.indexOf(motif) !== -1 ? motif : 'inconnu';
  const titre = sorte === 'changement' ? String(original.intitule || '') : String(original.titre || original.fiche || '');
  return { id: identifiantDe(sorte, original), sorte: sorte, ecarte_le: date, titre: titre, motif: m, precision: String(precision || '').replace(/\s+/g, ' ').trim(),
    cles: sorte === 'changement' ? clesChangement(original) : clesFiche(original), original: original, reproposee: { nb: 0, derniere: '' } };
}

// Entree d'un employeur ecarte. p = { fichier ('employeurs' | 'offres'), original (valeurs de la ligne du sas, avec id) ou null, nom, info (voir clesEmployeur), lieu, motif, precision, date }.
function creerEmployeur(p) {
  const m = MOTIFS_EMPLOYEUR.indexOf(p.motif) !== -1 ? p.motif : 'inconnu', info = Object.assign({}, p.info || {}, { nom: p.nom });
  const id = p.original && p.original.id ? 'emp-' + (p.fichier || 'employeurs') + '-' + p.original.id
    : 'emp-note-' + empreinte([normaliser(p.nom), (info.deps || []).join(','), (info.communes || []).join(',')].join('|'));
  return { id: id, sorte: 'employeur', ecarte_le: p.date, titre: String(p.nom || '').replace(/\s+/g, ' ').trim(), lieu: String(p.lieu || ''), motif: m, precision: String(p.precision || '').replace(/\s+/g, ' ').trim(),
    cles: clesEmployeur(info), original: p.original ? { fichier: p.fichier || 'employeurs', ligne: p.original } : null, reproposee: { nb: 0, derniere: '' } };
}

// Actions : { op:'ajouter', entree } | { op:'toucher', id, date } (une proposition identique a ete ignoree) | { op:'precision', id, motif, precision }
//           | { op:'retirer', id } (la proposition est remise dans le sas) | { op:'rendre', id } (idem, sans rien verifier)
function appliquer(texte, actions) {
  const fin = finDeLigne(texte || '\n');
  let liste = parser(texte);
  const resume = { ajoutes: 0, touches: 0, remis: 0, precises: 0 };
  const remis = [];
  for (const a of (actions || [])) {
    const act = a || {};
    if (act.op === 'ajouter') {
      const e = act.entree; if (!e || !e.id) { return { ok: false, erreur: 'Entrée de l\'historique des écartées incomplète.' }; }
      liste = liste.filter(function (x) { return x.id !== e.id; }); liste.push(e); resume.ajoutes++;
    } else if (act.op === 'toucher') {
      const i = liste.findIndex(function (x) { return x.id === act.id; }); if (i < 0) { continue; }
      const r = liste[i].reproposee || { nb: 0, derniere: '' }; liste[i].reproposee = { nb: (r.nb || 0) + 1, derniere: act.date || r.derniere }; resume.touches++;
    } else if (act.op === 'precision') {
      const i = liste.findIndex(function (x) { return x.id === act.id; });
      if (i < 0) { return { ok: false, erreur: 'Entrée introuvable dans l\'historique des écartées.' }; }
      if (MOTIFS.indexOf(act.motif) === -1) { return { ok: false, erreur: 'Raison inconnue.' }; }
      liste[i].motif = act.motif; liste[i].precision = String(act.precision || '').replace(/\s+/g, ' ').trim(); resume.precises++;
    } else if (act.op === 'retirer') {
      const i = liste.findIndex(function (x) { return x.id === act.id; });
      if (i < 0) { return { ok: false, erreur: 'Entrée introuvable dans l\'historique des écartées.' }; }
      remis.push(liste[i]); liste.splice(i, 1); resume.remis++;
    } else { return { ok: false, erreur: 'Action inconnue sur l\'historique des écartées.' }; }
  }
  return { ok: true, texte: ecrire(liste, fin), resume: resume, remis: remis, liste: liste };
}

module.exports = { CHEMIN: CHEMIN, MOTIFS: MOTIFS, MOTIFS_INFO: MOTIFS_INFO, MOTIFS_EMPLOYEUR: MOTIFS_EMPLOYEUR, clesEmployeur: clesEmployeur, creerEmployeur: creerEmployeur, LIBELLES_MOTIFS: LIBELLES_MOTIFS, EN_TETE: EN_TETE, normaliser: normaliser, mots: mots, jaccard: jaccard,
  clesChangement: clesChangement, clesFiche: clesFiche, trouver: trouver, parser: parser, ecrire: ecrire, creerEntree: creerEntree, appliquer: appliquer };
