/* ============================================================
   veillePreuveVerif.js  --  « retrouver le passage » : l'outil ouvre la page citée par l'assistant et cherche le passage recopié (outil de veille, poste de Denis)
   ------------------------------------------------------------
   Phase 2 de la preuve par ligne (décision de Denis, 2026-10-31). Un passage « mot pour mot » est vérifiable par le code : on lit la page citée
   et on regarde si le passage s'y trouve (sans tenir compte des accents, des majuscules, de la ponctuation et des espaces).
   Verdicts :
     retrouve           le passage est dans la page.
     proche             la plupart des mots sont dans la page, dans le bon ordre (recopie imparfaite) : à regarder.
     non-retrouve       la page a été lue et le passage n'y est pas : signal fort contre l'assistant.
     adresse-introuvable la page citée n'existe pas (404, 410 ou nom de domaine inconnu) : signal fort (adresse inventée ?).
     non-lisible        l'outil ne peut pas conclure (site qui refuse les robots, page affichée par script, document PDF, autre site, délai) : NEUTRE, jamais une accusation.
   Garde-fous : on ne lit que des adresses https de sites publics (pas de port, pas d'identifiant, pas de site privé ou local), au plus 40 pages par demande,
   500 Ko par page, lecture seule, rien n'est gardé ni écrit. Ce module ne décide de rien : il rend des verdicts, l'outil de veille les affiche.
   Exception assumée au principe « jamais une adresse venue de la page » : ici l'adresse vient d'une réponse d'assistant que Denis a collée et il clique lui-même
   sur « Vérifier » après avoir vu les sites qui seront ouverts.
   Aucune dépendance autre que veilleControle.js (Node seul).
   ============================================================ */
'use strict';
const controle = require('./veilleControle.js');

const MAX_LIGNES = 40;
const PARALLELE = 4;
const TEXTE_MIN = 300;          // en dessous, la page s'affiche probablement par script : on ne conclut pas
const TEXTE_PLAFOND = 240000;   // au-delà, la page a été lue en partie seulement : on ne conclut pas sur une absence
const SEUIL_PROCHE = 0.7;

function adresseAcceptable(a) {
  const s = String(a || '');
  if (s.length > 300 || !/^https:\/\/\S+$/.test(s)) { return false; }
  try { const u = new URL(s); return u.protocol === 'https:' && !u.username && !u.password && !u.port && !!u.hostname; } catch (e) { return false; }
}
function jetons(s) { return controle.normaliser(s).split(' ').filter(Boolean); }

// Compare le passage au texte normalisé de la page. Rend { verdict: 'retrouve' | 'proche' | 'non-retrouve', taux }.
function comparer(normTexte, passage) {
  const t = jetons(passage), texte = ' ' + String(normTexte || '') + ' ';
  if (!t.length) { return { verdict: 'non-retrouve', taux: 0 }; }
  if (texte.indexOf(' ' + t.join(' ') + ' ') !== -1) { return { verdict: 'retrouve', taux: 1 }; }
  const n = Math.min(3, t.length), groupes = [];
  for (let i = 0; i + n <= t.length; i++) { groupes.push(t.slice(i, i + n).join(' ')); }
  const trouves = groupes.filter(function (g) { return texte.indexOf(' ' + g + ' ') !== -1; }).length;
  const taux = groupes.length ? trouves / groupes.length : 0;
  return { verdict: taux >= SEUIL_PROCHE ? 'proche' : 'non-retrouve', taux: Math.round(taux * 100) / 100 };
}

async function verifierUne(ligne, opt, cache) {
  const sortie = { id: String(ligne.id) };
  const adresse = String(ligne.adresse || ''), passage = String(ligne.passage || '');
  if (!adresseAcceptable(adresse)) { return Object.assign(sortie, { verdict: 'non-lisible', detail: 'Adresse non contrôlée : seules les adresses https de sites publics, sans numéro de port, sont ouvertes.' }); }
  if (jetons(passage).length < 3) { return Object.assign(sortie, { verdict: 'non-lisible', detail: 'Le passage est trop court pour être retrouvé.' }); }
  if (!cache.has(adresse)) { cache.set(adresse, controle.lireEtClasser(adresse, { fetch: opt.fetch, resoudre: opt.resoudre, sansContact: true })); }
  const lue = await cache.get(adresse);
  if (lue.etat === 'absente') { return Object.assign(sortie, { verdict: 'adresse-introuvable', detail: 'La page citée n\'existe pas (' + lue.detail.replace(/\s+/g, ' ').trim() + ')' }); }
  if (lue.etat !== 'repond' || !lue.page) { return Object.assign(sortie, { verdict: 'non-lisible', detail: lue.etat === 'refuse' ? 'Le site refuse la lecture automatique : ouvrez la page vous-même.' : (lue.etat === 'ailleurs' ? 'L\'adresse renvoie vers un autre site : ouvrez la page vous-même.' : 'La page n\'a pas pu être lue : ouvrez-la vous-même.') }); }
  const normTexte = lue.page.normTexte || '';
  if (normTexte.length < TEXTE_MIN) { return Object.assign(sortie, { verdict: 'non-lisible', detail: 'La page s\'affiche par script ou ne contient presque pas de texte : l\'outil ne peut pas la lire. Ouvrez-la vous-même.' }); }
  const c = comparer(normTexte, passage);
  if (c.verdict === 'non-retrouve' && normTexte.length >= TEXTE_PLAFOND) { return Object.assign(sortie, { verdict: 'non-lisible', detail: 'La page est très longue : l\'outil n\'en a lu qu\'une partie. Ouvrez-la vous-même.' }); }
  const detail = c.verdict === 'retrouve' ? 'Le passage est bien dans la page.'
    : (c.verdict === 'proche' ? 'Le passage est presque identique à la page (' + Math.round(c.taux * 100) + ' % des groupes de mots retrouvés) : recopie imparfaite, à regarder.'
      : 'La page a été lue et le passage n\'y est pas.');
  return Object.assign(sortie, { verdict: c.verdict, detail: detail, taux: c.taux });
}

// lignes : [{ id, adresse, passage }] -> { ok, resultats: [{ id, verdict, detail }] }. opt : { fetch, resoudre } (pour les tests).
async function verifier(lignes, opt) {
  if (!Array.isArray(lignes) || !lignes.length) { return { ok: false, erreur: 'Aucun passage à vérifier.' }; }
  if (lignes.length > MAX_LIGNES) { return { ok: false, erreur: 'Trop de passages d\'un coup (' + MAX_LIGNES + ' au plus).' }; }
  const o = opt || {}, cache = new Map(), liste = lignes.filter(function (l) { return l && typeof l === 'object' && /^[a-z0-9][a-z0-9-]{0,120}$/.test(String(l.id || '')); });
  const resultats = new Array(liste.length);
  let suivant = 0;
  async function travailleur() {
    while (suivant < liste.length) {
      const i = suivant++;
      try { resultats[i] = await verifierUne(liste[i], o, cache); }
      catch (e) { resultats[i] = { id: String(liste[i].id), verdict: 'non-lisible', detail: 'La page n\'a pas pu être lue : ouvrez-la vous-même.' }; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLELE, liste.length) }, travailleur));
  return { ok: true, resultats: resultats };
}

module.exports = { verifier: verifier, comparer: comparer, adresseAcceptable: adresseAcceptable, MAX_LIGNES: MAX_LIGNES };
