const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCreerAttente, bilanGenererIdAttente, bilanAttenteEstValide, bilanValiderAttente, bilanAttenteEtatCouverture
} = require('../modules/bilan-candidature/modeles/attente.js');

function attenteValide(champsSupp) {
  return bilanCreerAttente(Object.assign({
    contenu: 'Accueillir un public en difficulte avec ecoute et bienveillance',
    axeLie: 'adequation',
    observationsLiees: ['adequation-obs-0']
  }, champsSupp || {}), 0);
}

test('bilanGenererIdAttente : deterministe (memes entrees => meme id)', () => {
  assert.equal(bilanGenererIdAttente('adequation', 0), bilanGenererIdAttente('adequation', 0));
  assert.notEqual(bilanGenererIdAttente('adequation', 0), bilanGenererIdAttente('adequation', 1));
  assert.equal(bilanGenererIdAttente('adequation', 2), 'adequation-attente-2');
});

test('bilanCreerAttente : id genere si absent, jamais fourni par l\'IA', () => {
  const attente = attenteValide();
  assert.equal(attente.id, 'adequation-attente-0');
  assert.equal(attente.axeLie, 'adequation');
});

test('bilanCreerAttente : observationsLiees vide accepte a la creation (etat "aucun element", pas une erreur)', () => {
  const attente = attenteValide({ observationsLiees: [] });
  assert.deepEqual(attente.observationsLiees, []);
});

test('bilanAttenteEstValide : contenu manquant invalide', () => {
  const attente = attenteValide({ contenu: '' });
  assert.equal(bilanAttenteEstValide(attente), false);
});

test('bilanAttenteEstValide : axeLie manquant invalide (contrairement a Recommandation, une Attente orpheline en observations reste valide, mais jamais sans axe)', () => {
  const attente = attenteValide({ axeLie: null });
  assert.equal(bilanAttenteEstValide(attente), false);
});

test('bilanAttenteEstValide : observationsLiees vide reste valide (pas une erreur, l\'invariant "jamais orpheline" de Recommandation ne s\'applique pas ici)', () => {
  const attente = attenteValide({ observationsLiees: [] });
  assert.equal(bilanAttenteEstValide(attente), true);
});

test('bilanValiderAttente : leve ReponseIncomplete si mal formee', () => {
  assert.throws(() => bilanValiderAttente(attenteValide({ contenu: '' })),
    (erreur) => erreur.code === 'ReponseIncomplete');
});

test('bilanAttenteEtatCouverture : aucune observation liee => "aucun"', () => {
  assert.equal(bilanAttenteEtatCouverture(attenteValide({ observationsLiees: [] })), 'aucun');
});

test('bilanAttenteEtatCouverture : une observation liee => "un"', () => {
  assert.equal(bilanAttenteEtatCouverture(attenteValide({ observationsLiees: ['adequation-obs-0'] })), 'un');
});

test('bilanAttenteEtatCouverture : deux observations liees ou plus => "plusieurs"', () => {
  assert.equal(bilanAttenteEtatCouverture(attenteValide({ observationsLiees: ['adequation-obs-0', 'adequation-obs-1'] })), 'plusieurs');
  assert.equal(bilanAttenteEtatCouverture(attenteValide({ observationsLiees: ['adequation-obs-0', 'adequation-obs-1', 'adequation-obs-2'] })), 'plusieurs');
});

test('bilanAttenteEtatCouverture : jamais stocke sur l\'objet lui-meme', () => {
  const attente = attenteValide();
  assert.equal(attente.etat, undefined);
  assert.equal(attente.etatCouverture, undefined);
});
