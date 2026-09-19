/* ============================================================
   Garde-fou anti-derive : le catalogue des axes (code) et le texte du
   Prompt 1 (prompts/bilan-v1.md) decrivent la MEME realite en deux
   endroits differents -- un fichier ecrit pour un humain (le prompt),
   un fichier ecrit pour etre execute (le registre). Rien n'empeche
   techniquement de modifier l'un sans l'autre.

   Ce test est le garde-fou choisi : pas de generation automatique du
   prompt depuis le code (le prompt contient des criteres qualitatifs
   ecrits a la main, non derivables d'une simple liste de donnees -- voir
   l'en-tete de axeAnalyseRegistry.js pour la reflexion complete). A la
   place : si quelqu'un modifie un id, un nom ou un niveau minimum d'un
   cote sans repercuter l'autre, CE TEST ECHOUE. C'est le mecanisme le
   plus simple qui rende l'oubli difficile, sans pipeline de generation.
   ============================================================ */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { BILAN_CATALOGUE_AXES } = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');

const texteBilanV1 = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v1.md'), 'utf8');

test('coherence catalogue <-> prompt : la liste d\'id du schema JSON contient exactement les ids du registre, dans le meme ordre', () => {
  const ligneEnum = texteBilanV1.match(/"id":\s*"([a-z_|]+)"/);
  assert.ok(ligneEnum, 'Ligne "id": "..." introuvable dans prompts/bilan-v1.md -- le prompt a-t-il change de forme ?');
  const idsPrompt = ligneEnum[1].split('|');
  const idsRegistre = BILAN_CATALOGUE_AXES.map((axe) => axe.id);
  assert.deepEqual(idsPrompt, idsRegistre);
});

test('coherence catalogue <-> prompt : chaque axe du registre est present dans le prompt avec le meme nom', () => {
  BILAN_CATALOGUE_AXES.forEach((axe) => {
    const motif = new RegExp('\\*\\*([^*]+)\\*\\*\\s*\\(`' + axe.id + '`');
    const trouve = texteBilanV1.match(motif);
    assert.ok(trouve, `Axe "${axe.id}" introuvable dans le prompt sous la forme "**Nom** (\`${axe.id}\`...)"`);
    assert.equal(trouve[1], axe.nom, `Nom divergent pour "${axe.id}" : registre="${axe.nom}", prompt="${trouve[1]}"`);
  });
});

test('coherence catalogue <-> prompt : le niveau minimum annonce dans le prompt correspond au registre', () => {
  BILAN_CATALOGUE_AXES.forEach((axe) => {
    const motif = new RegExp('`' + axe.id + '`,\\s*niveau\\s*(?:min\\.\\s*)?(\\d)');
    const trouve = texteBilanV1.match(motif);
    assert.ok(trouve, `Niveau minimum introuvable dans le prompt pour "${axe.id}"`);
    assert.equal(Number(trouve[1]), axe.niveauMinimum, `Niveau minimum divergent pour "${axe.id}" : registre=${axe.niveauMinimum}, prompt=${trouve[1]}`);
  });
});

test('coherence catalogue <-> prompt : le catalogue reste a 9 axes des deux cotes (Projection recruteur absente du prompt en tant qu\'axe)', () => {
  assert.equal(BILAN_CATALOGUE_AXES.length, 9);
  assert.match(texteBilanV1, /Projection recruteur n'apparaît pas dans cette liste/);
});

// TACHE (consolidation Bilan, bloc 1.4) : chaque axe porte un texte
// "ceQuOnRegarde" (couche 2 du rapport), reformulation pour la personne de
// la section 2 du prompt. Ce test force son ajout quand on ajoute un axe,
// et interdit les derives de forme deja bannies partout dans l'app.
test('couche 2 : chaque axe du catalogue a un texte "ceQuOnRegarde" non vide et bien forme', () => {
  BILAN_CATALOGUE_AXES.forEach((axe) => {
    assert.equal(typeof axe.ceQuOnRegarde, 'string', `ceQuOnRegarde manquant pour "${axe.id}"`);
    assert.ok(axe.ceQuOnRegarde.trim().length >= 30, `ceQuOnRegarde trop court pour "${axe.id}" : "${axe.ceQuOnRegarde}"`);
    assert.doesNotMatch(axe.ceQuOnRegarde, /[—–]|--/, `Tiret cadratin ou double tiret interdit dans ceQuOnRegarde de "${axe.id}"`);
    assert.doesNotMatch(axe.ceQuOnRegarde, /\bIA\b/, `Le mot "IA" ne doit jamais etre visible (ceQuOnRegarde de "${axe.id}")`);
  });
});
