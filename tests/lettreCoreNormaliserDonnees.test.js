const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE de "Co-construire ma lettre" (et de tout consommateur de
// dossier.ia.lettre). Ajoutee lors de l'audit de stabilisation du
// 2026-09-12 : ce fichier n'avait jusque-la aucune couverture Node,
// contrairement a ses equivalents CV/ATS/Regard recruteur.
const { normaliserDonneesLettre } = require('../modules/lettre-core/normaliserDonneesLettre.js');

test('normaliserDonneesLettre : assemble identite + contenu IA + date du jour', () => {
  const d = {
    identite: { civilite: 'Madame', nom: 'Dupont', prenom: 'Marie', adresse: '1 rue A', codePostal: '87000', ville: 'Limoges', telephone: '0600000000', email: 'm@d.fr' },
    ia: { lettre: { lettre: { objet: 'Candidature vendeuse', texte: 'Bonjour.\n\nCordialement.', texteCourt: 'Court.' } } }
  };
  const r = normaliserDonneesLettre(d);
  assert.deepEqual(r.identite, { civilite: 'Madame', nom: 'Dupont', prenom: 'Marie', adresse: '1 rue A', codePostal: '87000', ville: 'Limoges', telephone: '0600000000', email: 'm@d.fr' });
  assert.equal(r.objet, 'Candidature vendeuse');
  assert.equal(r.texte, 'Bonjour.\n\nCordialement.');
  assert.equal(r.texteCourt, 'Court.');
  assert.equal(typeof r.date, 'string');
  assert.ok(r.date.length > 0);
});

test('normaliserDonneesLettre : dossier vide -> tous les champs a leur defaut, jamais d\'exception', () => {
  const r = normaliserDonneesLettre({});
  assert.deepEqual(r.identite, { civilite: null, nom: '', prenom: '', adresse: '', codePostal: '', ville: '', telephone: '', email: '' });
  assert.equal(r.objet, '');
  assert.equal(r.texte, '');
  assert.equal(r.texteCourt, '');
});

test('normaliserDonneesLettre : undefined -> memes defauts, jamais d\'exception', () => {
  const r = normaliserDonneesLettre(undefined);
  assert.equal(r.texte, '');
  assert.equal(r.objet, '');
});

test('normaliserDonneesLettre : 3 sauts de ligne consecutifs ou plus -> reduits a 2 (1 ligne vide)', () => {
  const d = { ia: { lettre: { lettre: { texte: 'Un.\n\n\n\n\nDeux.\n\n\nTrois.' } } } };
  const r = normaliserDonneesLettre(d);
  assert.equal(r.texte, 'Un.\n\nDeux.\n\nTrois.');
});

test('normaliserDonneesLettre : espaces de debut/fin retires du texte', () => {
  const d = { ia: { lettre: { lettre: { texte: '\n\n  Bonjour.  \n\n' } } } };
  const r = normaliserDonneesLettre(d);
  assert.equal(r.texte, 'Bonjour.');
});

test('normaliserDonneesLettre : texteCourt absent (reponses anciennes) -> chaine vide, pas undefined', () => {
  const d = { ia: { lettre: { lettre: { objet: 'X', texte: 'Y' } } } };
  const r = normaliserDonneesLettre(d);
  assert.equal(r.texteCourt, '');
});
