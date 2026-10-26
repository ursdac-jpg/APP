const { test } = require('node:test');
const assert = require('node:assert/strict');

// Contrôles du texte de la lettre (C4, 24/10/2026).
const { conseilLongueurLettreCo, phrasesDuTexteLettreCo, phrasesProchesLettreCo, retirerPhraseLettreCo } = require('../modules/lettre-core/controleTexteLettreCo.js');

test('longueur : courte sous le seuil, rien sinon, rien si vide', () => {
  assert.equal(conseilLongueurLettreCo(120), 'courte');
  assert.equal(conseilLongueurLettreCo(170), null);
  assert.equal(conseilLongueurLettreCo(250), null);
  assert.equal(conseilLongueurLettreCo(0), null);
});

test('phrases : la formule d’appel et la signature courtes sont ignorées', () => {
  const p = phrasesDuTexteLettreCo('Madame, Monsieur,\n\nJ’ai travaillé trois ans en boulangerie. Je sais accueillir les clients !\n\nCordialement,\nMarie Durand');
  assert.deepEqual(p, ['J’ai travaillé trois ans en boulangerie.', 'Je sais accueillir les clients !']);
});

test('phrases proches : deux formulations quasi identiques sont repérées', () => {
  const texte = 'Je suis une personne rigoureuse et organisée dans mon travail quotidien.\n\nJ’aime le contact avec les clients.\n\nDans mon travail quotidien, je suis une personne organisée et rigoureuse.';
  const paires = phrasesProchesLettreCo(texte);
  assert.equal(paires.length, 1);
  assert.match(paires[0].premiere, /^Je suis une personne rigoureuse/);
  assert.match(paires[0].seconde, /^Dans mon travail quotidien/);
});

test('phrases proches : des phrases différentes ne sont pas signalées', () => {
  const texte = 'J’ai tenu la caisse pendant deux ans dans un supermarché.\n\nMon projet est de devenir responsable de rayon dans votre magasin.';
  assert.deepEqual(phrasesProchesLettreCo(texte), []);
});

test('retirer une phrase : le reste est conservé, sans blanc double', () => {
  const texte = 'Première phrase du premier paragraphe.\n\nPhrase à retirer absolument ici.\n\nTroisième paragraphe qui reste.';
  assert.equal(retirerPhraseLettreCo(texte, 'Phrase à retirer absolument ici.'), 'Première phrase du premier paragraphe.\n\nTroisième paragraphe qui reste.');
  assert.equal(retirerPhraseLettreCo('Une phrase. Deux phrase ici. Trois.', 'Deux phrase ici.'), 'Une phrase. Trois.');
  assert.equal(retirerPhraseLettreCo('Texte.', 'Absente.'), 'Texte.');
});
