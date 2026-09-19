const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanResoudrePlaceholders, bilanChargerTemplate, bilanReinitialiserCacheTemplate
} = require('../modules/bilan-candidature/diagnostic/promptTemplateLoader.js');

beforeEach(() => { bilanReinitialiserCacheTemplate(); });

test('bilanResoudrePlaceholders : remplace chaque {CLE} par valeurs.CLE', () => {
  const resultat = bilanResoudrePlaceholders('Bonjour {NOM}, niveau {NIVEAU}.', { NOM: 'Alex', NIVEAU: '2' });
  assert.equal(resultat.texte, 'Bonjour Alex, niveau 2.');
  assert.deepEqual(resultat.placeholdersNonResolus, []);
});

test('bilanResoudrePlaceholders : generique -- ne connait aucun nom specifique au Prompt 1', () => {
  const resultat = bilanResoudrePlaceholders('{QUOI_QUE_CE_SOIT}', { QUOI_QUE_CE_SOIT: 'valeur' });
  assert.equal(resultat.texte, 'valeur');
});

test('bilanResoudrePlaceholders : signale les placeholders non resolus, ne les efface pas', () => {
  const resultat = bilanResoudrePlaceholders('{A} et {B}', { A: 'x' });
  assert.equal(resultat.texte, 'x et {B}');
  assert.deepEqual(resultat.placeholdersNonResolus, ['B']);
});

test('bilanResoudrePlaceholders : valeur null/undefined traitee comme non fournie', () => {
  const resultat = bilanResoudrePlaceholders('{A}', { A: null });
  assert.deepEqual(resultat.placeholdersNonResolus, ['A']);
});

test('bilanResoudrePlaceholders : template vide ou sans placeholder => aucun probleme', () => {
  assert.deepEqual(bilanResoudrePlaceholders('texte sans placeholder', {}).placeholdersNonResolus, []);
  assert.equal(bilanResoudrePlaceholders('', {}).texte, '');
});

test('bilanChargerTemplate : retourne le texte du lecteur injecte', async () => {
  const texte = await bilanChargerTemplate('prompts/bilan-v1.md', () => 'contenu du template');
  assert.equal(texte, 'contenu du template');
});

test('bilanChargerTemplate : met en cache -- un second appel sur le MEME chemin ne rappelle pas le lecteur', async () => {
  let appels = 0;
  const lecteur = () => { appels += 1; return 'texte'; };
  await bilanChargerTemplate('prompts/bilan-v1.md', lecteur);
  await bilanChargerTemplate('prompts/bilan-v1.md', lecteur);
  assert.equal(appels, 1);
});

test('bilanChargerTemplate : deux chemins differents ne partagent JAMAIS leur cache (correction du 2026-08-08)', async () => {
  const texte1 = await bilanChargerTemplate('prompts/bilan-v1.md', () => 'texte du Prompt 1');
  const texte2 = await bilanChargerTemplate('prompts/bilan-v2.md', () => 'texte du Prompt 2');
  assert.equal(texte1, 'texte du Prompt 1');
  assert.equal(texte2, 'texte du Prompt 2');
});

test('bilanChargerTemplate : un echec n\'est jamais mis en cache -- un appel suivant sur le meme chemin retente', async () => {
  let tentative = 0;
  const lecteur = () => {
    tentative += 1;
    if (tentative === 1) { return Promise.reject(new Error('panne réseau')); }
    return 'texte apres retablissement';
  };
  await assert.rejects(() => bilanChargerTemplate('prompts/bilan-v1.md', lecteur));
  const texte = await bilanChargerTemplate('prompts/bilan-v1.md', lecteur);
  assert.equal(texte, 'texte apres retablissement');
  assert.equal(tentative, 2);
});

test('bilanReinitialiserCacheTemplate : sans argument, vide tous les chemins', async () => {
  let appels = 0;
  const lecteur = () => { appels += 1; return 'texte'; };
  await bilanChargerTemplate('prompts/bilan-v1.md', lecteur);
  bilanReinitialiserCacheTemplate();
  await bilanChargerTemplate('prompts/bilan-v1.md', lecteur);
  assert.equal(appels, 2);
});
