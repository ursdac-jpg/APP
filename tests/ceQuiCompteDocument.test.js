const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../modules/ce-qui-compte/logique.js');
const Pap = require('../modules/ce-qui-compte/papier.js');
const Doc = require('../modules/ce-qui-compte/document.js');

// Un état de session avec deux cartes gardées : « Ma journée idéale » (textes) et « Ce qui m'a aidé » (carte très personnelle, non cochée d'avance).
function etatDeTest() {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'journee', 'matin', 'Un café au calme, <sans> courir');
  L.cqcpmPoserReponse(etat, 'journee', 'faire', 'Je répare des objets');
  L.cqcpmGarder(etat, 'journee', '2026-11-22');
  L.cqcpmPoserReponse(etat, 'aide', 'aide', 'Une voisine qui m’écoutait');
  L.cqcpmGarder(etat, 'aide', '2026-11-22');
  return etat;
}

test('le document d’une carte reprend les réponses, échappées, sans section vide', () => {
  const etat = etatDeTest();
  const h = Doc.cqcpmHtmlCarteDocument(etat, 'journee', 'h2');
  assert.match(h, /<h2>Ma journée idéale de travail<\/h2>/);
  assert.match(h, /Gardé le 22 novembre 2026/);
  assert.match(h, /&lt;sans&gt;/);
  assert.doesNotMatch(h, /<sans>/);
  assert.match(h, /Je répare des objets/);
  assert.equal((h.match(/Ma journée idéale de travail/g) || []).length, 1, 'le titre de la carte n’est pas répété par sa section');
  assert.doesNotMatch(h, /La fin de journée/, 'une réponse vide n’est jamais imprimée');
});

test('une carte sans aucune réponse n’imprime rien', () => {
  const etat = L.cqcpmEtatInitial();
  assert.equal(Doc.cqcpmHtmlCarteDocument(etat, 'journee', 'h2'), '');
  assert.equal(Doc.cqcpmHtmlDocument(etat, ['journee', 'envies']), '');
  assert.equal(Doc.cqcpmHtmlCarteDocument(etat, 'carte-inconnue', 'h2'), '');
});

test('un résultat non gardé peut être imprimé (sans date de garde)', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmPoserReponse(etat, 'journee', 'soir', 'Je rentre content');
  const h = Doc.cqcpmHtmlCarteDocument(etat, 'journee', 'h2');
  assert.match(h, /Je rentre content/);
  assert.doesNotMatch(h, /Gardé le/);
});

test('« Tout imprimer » prend toutes les cartes gardées, y compris la plus personnelle', () => {
  const etat = etatDeTest();
  assert.deepEqual(Doc.cqcpmIdsADocumenter(etat), ['journee', 'aide']);
  assert.deepEqual(Doc.cqcpmIdsADocumenter(null), []);
});

test('le document complet : titre, phrase de prudence, pied, aucun mot de profil', () => {
  const etat = etatDeTest();
  const h = Doc.cqcpmHtmlDocument(etat, Doc.cqcpmIdsADocumenter(etat));
  assert.match(h, /<h1>Ce qui compte pour moi<\/h1>/);
  assert.match(h, /ne décrit pas ma personnalité/);
  assert.match(h, /Rien n’a été envoyé/);
  assert.match(h, /Ma journée idéale de travail/);
  assert.match(h, /Ce qui m’a aidé/);
  assert.doesNotMatch(h, /—|–/, 'jamais de tiret long');
  assert.doesNotMatch(h, /facultatif/i);
});

const REPONSE = '{"fin":"complet","revient":["Fabriquer de vos mains."],"compte":["Être libre de vous organiser."],"deuxDirections":"Liberté et horaires : à regarder métier par métier.","preciser":"Ce que vous accepteriez.","questions":["Est-ce concret ?"]}';
function etatAvecPapier() {
  const etat = etatDeTest();
  L.cqcpmChoisirEnvoi(etat, 'aide', false);
  L.cqcpmPoserReponse(etat, 'valeurs', 'situation', 'Un atelier libre');
  L.cqcpmGarder(etat, 'valeurs', '2026-11-22');
  Pap.cqcpmPoserPapier(etat, Pap.cqcpmAnalyserPapier(REPONSE).parties, '2026-11-23');
  return etat;
}

test('le papier en document : titre, parties du papier, phrase de prudence, pied ; vide sans papier', () => {
  const etat = etatAvecPapier();
  const h = Doc.cqcpmHtmlDocumentPapier(etat);
  assert.match(h, /<h1>Ce qui revient dans mes cartes<\/h1>/);
  assert.match(h, /<h2>Ce qui revient<\/h2>/);
  assert.match(h, /<h2>Ce qui pourrait être précisé<\/h2>/, 'la feuille n’emploie ni « vous » ni « moi » dans ses titres');
  assert.match(h, /Fabriquer de vos mains/);
  assert.match(h, /Établi le 23 novembre 2026, à partir de 2 cartes/);
  assert.match(h, /ni une note, ni un profil, ni un diagnostic/);
  assert.match(h, /ce que vous avez écrit ce jour-là/, 'la prudence du papier imprimé dit « vous », comme le corps du papier');
  assert.doesNotMatch(h, /j’ai écrit|me convient/, 'aucune première personne dans le papier imprimé');
  assert.match(h, /Rien n’a été envoyé/);
  assert.doesNotMatch(h, /—|–/);
  assert.equal(Doc.cqcpmHtmlDocumentPapier(etatDeTest()), '');
});

test('la partie de la feuille de Ma synthèse : seulement le papier, seulement s’il est joint, titres en h3', () => {
  const etat = etatAvecPapier();
  assert.equal(Doc.cqcpmHtmlPartieSynthese(etat), '', 'non joint : rien dans la feuille');
  Pap.cqcpmJoindrePapier(etat, true);
  const h = Doc.cqcpmHtmlPartieSynthese(etat);
  assert.match(h, /<h3>Ce qui revient<\/h3>/);
  assert.match(h, /que j’ai choisi de joindre/);
  assert.match(h, /Texte écrit par l’assistant en ligne à partir de mes cartes : il s’adresse à moi, c’est pourquoi il dit « vous »/, 'la feuille dit qui parle quand le texte passe de « vous » à « je »');
  assert.doesNotMatch(h, /<h2>/, 'le titre de la partie est posé par la feuille');
  assert.doesNotMatch(h, /Ma journée idéale|Je répare des objets/, 'jamais les cartes une à une');
  Pap.cqcpmJoindrePapier(etat, false);
  assert.equal(Doc.cqcpmHtmlPartieSynthese(etat), '');
  assert.equal(Doc.cqcpmHtmlPartieSynthese(L.cqcpmEtatInitial()), '');
});

test('toutes les cartes, remplies de façon plausible, produisent un document sans erreur', () => {
  const etat = L.cqcpmEtatInitial();
  L.cqcpmCartes().forEach((c) => {
    L.cqcpmChampsDeCarte(c).forEach((ch) => {
      if (ch.type === 'texte') { L.cqcpmPoserReponse(etat, c.id, ch.id, 'Un texte de ' + c.id); }
    });
    L.cqcpmGarder(etat, c.id, '2026-11-22');
  });
  const h = Doc.cqcpmHtmlDocument(etat, Doc.cqcpmIdsADocumenter(etat));
  assert.ok(h.length > 500);
  assert.doesNotMatch(h, /undefined|\[object/);
});
