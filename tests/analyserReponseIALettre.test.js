const { test } = require('node:test');
const assert = require('node:assert/strict');

// Import de la réponse de l'assistant pour la lettre (étape (d) du chantier lettre, 24/10/2026) :
// une lettre sans texte est refusée, du texte après le bloc JSON est toléré.
require('./_domStub').installerStubDom();
const { analyserReponseIALettre } = require('../js/app.js');

const lettre = { accroche: 'Une accroche.', arguments: ['A', 'B'], versions: [{ objet: 'Candidature spontanée : Technicien', texte: 'Madame, Monsieur,\n\nBonjour.\n\nCordialement.' }] };
const enBloc = (o) => '```json\n' + JSON.stringify(o) + '\n```';

test('une lettre complète est acceptée', () => {
  const r = analyserReponseIALettre(enBloc(lettre));
  assert.equal(r.succes, true);
  assert.equal(r.valeurs.versions[0].texte, 'Madame, Monsieur,\n\nBonjour.\n\nCordialement.');
});

test('versions vide avec accroche et arguments : refusé, message clair', () => {
  const r = analyserReponseIALettre(enBloc({ accroche: 'x', arguments: ['a'], versions: [] }));
  assert.equal(r.succes, false);
  assert.ok(/texte de la lettre/.test(r.erreur));
});

test('une version sans texte (objet seul) : refusée', () => {
  const r = analyserReponseIALettre(enBloc({ accroche: 'x', arguments: ['a'], versions: [{ objet: 'Candidature', texte: '' }] }));
  assert.equal(r.succes, false);
});

test('le texte après le bloc JSON (question finale sur l\'e-mail) est toléré', () => {
  const apres = enBloc(lettre) + '\n\nVoulez-vous aussi une version courte, à coller dans le corps d\'un e-mail ?\n\n1. Oui, je veux une version courte pour un e-mail.\n2. Non merci.';
  const r = analyserReponseIALettre('Votre lettre est prête. Copiez le code.\n\n' + apres);
  assert.equal(r.succes, true);
  assert.equal(r.valeurs.versions.length, 1);
});

test('texte vide ou sans JSON : refusé comme avant', () => {
  assert.equal(analyserReponseIALettre('').succes, false);
  assert.equal(analyserReponseIALettre('Bonjour, voici ma lettre sans code.').succes, false);
});

test('ancien format avec le champ « lettre » unique : toujours accepté', () => {
  const r = analyserReponseIALettre(enBloc({ accroche: 'x', arguments: [], lettre: { objet: 'O', texte: 'Texte de la lettre.' } }));
  assert.equal(r.succes, true);
});
