const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctCreerEntretienAvance, ctMarquerEntretienAvanceComplet, ctMarquerEntretienAvanceEchecParsing, ctEntretienAvanceEstValide
} = require('../modules/coherence-transversale/modeles/entretienAvance.js');

test('ctCreerEntretienAvance : statut "genere" par defaut, resultat/texteBrutReponseIA nuls', () => {
  const e = ctCreerEntretienAvance({ dossierId: 'dossier-1', questionsReponses: [{ question: 'Q1', reponse: 'R1' }] });
  assert.equal(e.statut, 'genere');
  assert.equal(e.resultat, null);
  assert.equal(e.texteBrutReponseIA, null);
  assert.deepEqual(e.questionsReponses, [{ question: 'Q1', reponse: 'R1' }]);
});

test('ctMarquerEntretienAvanceComplet : retourne une COPIE, ne modifie jamais l\'original', () => {
  const original = ctCreerEntretienAvance({ dossierId: 'dossier-1' });
  const complet = ctMarquerEntretienAvanceComplet(original, { synthese: 'x' }, 'texte brut');
  assert.equal(original.statut, 'genere');
  assert.equal(complet.statut, 'complete');
  assert.deepEqual(complet.resultat, { synthese: 'x' });
});

test('ctMarquerEntretienAvanceEchecParsing : statut echec_parsing, resultat reste null', () => {
  const original = ctCreerEntretienAvance({ dossierId: 'dossier-1' });
  const echec = ctMarquerEntretienAvanceEchecParsing(original, 'texte illisible');
  assert.equal(echec.statut, 'echec_parsing');
  assert.equal(echec.resultat, null);
  assert.equal(echec.texteBrutReponseIA, 'texte illisible');
});

test('ctEntretienAvanceEstValide : complete sans resultat -> invalide ; genere valide -> valide', () => {
  const genere = ctCreerEntretienAvance({ dossierId: 'dossier-1' });
  assert.equal(ctEntretienAvanceEstValide(genere), true);
  const incomplet = ctCreerEntretienAvance({ dossierId: 'dossier-1' });
  incomplet.statut = 'complete';
  assert.equal(ctEntretienAvanceEstValide(incomplet), false);
});
