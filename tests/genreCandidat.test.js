const { test } = require('node:test');
const assert = require('node:assert/strict');
const { genreDuCandidat, consigneGenreCandidat } = require('../modules/cv-core/genreCandidat.js');
const { bilanConstruirePromptTitreAccroche } = require('../modules/bilan-candidature/amelioration/titreAccrochePromptBuilder.js');

// Retour Denis 2026-10-01 : le titre et l'accroche du CV d'une femme etaient au masculin. Une seule consigne d'accord pour tous les prompts.

test('genre : Madame = feminin, Monsieur = masculin, vide ou « Ne pas préciser » = inconnu', () => {
  assert.equal(genreDuCandidat({ identite: { civilite: 'Madame' } }), 'feminin');
  assert.equal(genreDuCandidat({ identite: { civilite: 'Monsieur' } }), 'masculin');
  assert.equal(genreDuCandidat({ identite: { civilite: '' } }), 'inconnu');
  assert.equal(genreDuCandidat({ identite: { civilite: 'Ne pas préciser' } }), 'inconnu');
  assert.equal(genreDuCandidat({}), 'inconnu');
});

test('consigne feminine : accord explicite du titre et de l\'accroche', () => {
  const c = consigneGenreCandidat({ identite: { civilite: 'Madame' } });
  assert.match(c, /féminin \(Madame\)/);
  assert.match(c, /titre du CV/);
  assert.match(c, /phrase d’accroche/);
  assert.doesNotMatch(c, /masculin \(Monsieur\)/);
});

test('genre inconnu : jamais le masculin par défaut, on suit les accords du CV, sinon forme neutre', () => {
  const c = consigneGenreCandidat({ identite: {} });
  assert.match(c, /non précisé/);
  assert.match(c, /accords déjà écrits/);
  assert.match(c, /forme neutre/);
  assert.match(c, /N’écris jamais au masculin par défaut/);
});

test('la consigne ne contient aucun tiret cadratin et ne touche pas à la formule d\'adresse de la lettre', () => {
  ['Madame', 'Monsieur', ''].forEach((civilite) => {
    const c = consigneGenreCandidat({ identite: { civilite } });
    assert.ok(!/[—–]/.test(c));
    assert.match(c, /formule d’adresse au destinataire/);
  });
});

test('Bilan : le prompt titre et accroche reçoit la consigne de genre à la place de la voix humaine', () => {
  globalThis.consigneGenreCandidat = () => 'CONSIGNE_GENRE_TEST';
  try {
    const r = bilanConstruirePromptTitreAccroche('Début {VOIX_HUMAINE} Fin', { cv: 'cv' });
    assert.match(r.texte, /CONSIGNE_GENRE_TEST/);
  } finally { delete globalThis.consigneGenreCandidat; }
  const sans = bilanConstruirePromptTitreAccroche('Début {VOIX_HUMAINE} Fin', { cv: 'cv' });
  assert.ok(!/CONSIGNE_GENRE_TEST/.test(sans.texte));
});
