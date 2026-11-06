/* ============================================================
   veillePassages.js  --  la date du dernier passage de chaque tâche de l'outil de veille (poste de Denis)
   ------------------------------------------------------------
   Décision de Denis (2026-10-31, idée n° 2 de l'amélioration de l'outil de veille) : ces dates ne doivent plus vivre seulement dans le navigateur.
   Un seul fichier, outils/passages.json, suivi par Git : il survit au vidage du navigateur, au changement de poste et à la passation entre comptes.
   Rien d'autre n'est écrit. Une date ne recule jamais (la plus récente gagne). Aucune écriture si le fichier existant est illisible (on ne l'écrase pas).
   Clés : « veille », « mois », « reseau », « chiffres », « lexique », « manuel » et « rayon:<rayon> ». Dates : AAAA-MM-JJ.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const RE_CLE = /^[a-z0-9][a-z0-9:_-]{0,39}$/;
const RE_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_CLES = 100;

function dateReelle(s) {
  if (!RE_DATE.test(s)) { return false; }
  const d = new Date(s + 'T00:00:00Z');
  return !isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

function creerPassages(racine, opt) {
  const o = opt || {};
  const fichier = path.join(racine, 'outils', 'passages.json');
  const aujourdhui = function () { return String(o.maintenant ? o.maintenant() : new Date().toISOString()).slice(0, 10); };
  // Une date au plus tard demain (le décalage entre l'heure locale et l'heure universelle) : jamais une date lointaine dans le futur.
  const limite = function () { return new Date(Date.parse(aujourdhui() + 'T00:00:00Z') + 86400000).toISOString().slice(0, 10); };

  function lireFichier() {
    if (!fs.existsSync(fichier)) { return { ok: true, passages: {} }; }
    try {
      const brut = JSON.parse(fs.readFileSync(fichier, 'utf8')), src = brut && brut.passages && typeof brut.passages === 'object' ? brut.passages : null;
      if (!src) { return { ok: false, erreur: 'Le fichier des passages (outils/passages.json) n\'a pas la forme attendue : rien n\'a été écrit.' }; }
      const passages = {};
      Object.keys(src).forEach(function (k) { if (RE_CLE.test(k) && dateReelle(src[k])) { passages[k] = src[k]; } });
      return { ok: true, passages: passages };
    } catch (e) { return { ok: false, erreur: 'Le fichier des passages (outils/passages.json) est illisible : rien n\'a été écrit.' }; }
  }

  function lire() { return lireFichier(); }

  // donnees : { passages: { cle: 'AAAA-MM-JJ', ... } }. Garde la date la plus récente de chaque clé ; n'écrit que s'il y a du nouveau.
  function noter(donnees) {
    const demande = donnees && donnees.passages;
    if (!demande || typeof demande !== 'object' || Array.isArray(demande)) { return { ok: false, erreur: 'Aucun passage à noter.' }; }
    const actuel = lireFichier(); if (!actuel.ok) { return actuel; }
    const passages = actuel.passages, max = limite(); let change = 0;
    Object.keys(demande).forEach(function (k) {
      const d = demande[k];
      if (!RE_CLE.test(k) || !dateReelle(d) || d > max) { return; }
      if (!passages[k] && Object.keys(passages).length >= MAX_CLES) { return; }
      if (!passages[k] || d > passages[k]) { passages[k] = d; change++; }
    });
    if (change) {
      const trie = {}; Object.keys(passages).sort().forEach(function (k) { trie[k] = passages[k]; });
      const tmp = fichier + '.tmp';
      try { fs.writeFileSync(tmp, JSON.stringify({ passages: trie }, null, 2) + '\n', 'utf8'); fs.renameSync(tmp, fichier); }
      catch (e) { return { ok: false, erreur: 'Impossible d\'écrire les passages : ' + (e && e.message) }; }
    }
    return { ok: true, passages: passages, notes: change };
  }

  return { lire: lire, noter: noter, fichier: fichier };
}

module.exports = { creerPassages };
