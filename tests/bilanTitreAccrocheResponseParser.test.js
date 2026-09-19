const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');

const { bilanParserReponseTitreAccroche } = require('../modules/bilan-candidature/amelioration/titreAccrocheResponseParser.js');

const DEPENDANCES = { extraireJSON: extraireBlocJSONDepuisTexte };

function texteColleDepuis(objet, avecTexteParasite) {
  const bloc = '```json\n' + JSON.stringify(objet, null, 2) + '\n```';
  return avecTexteParasite
    ? 'Voici les propositions :\n\n' + bloc + '\n\nN\'hésitez pas à les adapter !'
    : bloc;
}

test('cas nominal : titre et accroches presents', () => {
  const resultat = bilanParserReponseTitreAccroche(
    texteColleDepuis({ titre: 'Chargé de clientèle', accroches: ['Accroche A.', 'Accroche B.', 'Accroche C.'] }),
    DEPENDANCES
  );
  assert.equal(resultat.titre, 'Chargé de clientèle');
  assert.deepEqual(resultat.accroches, ['Accroche A.', 'Accroche B.', 'Accroche C.']);
});

test('texte parasite avant/après le JSON : extrait quand meme le bloc', () => {
  const resultat = bilanParserReponseTitreAccroche(texteColleDepuis({ titre: 'Vendeur', accroches: ['x'] }, true), DEPENDANCES);
  assert.equal(resultat.titre, 'Vendeur');
});

test('titre seul (accroches absentes) : reste un resultat valide', () => {
  const resultat = bilanParserReponseTitreAccroche(texteColleDepuis({ titre: 'Vendeur', accroches: [] }), DEPENDANCES);
  assert.equal(resultat.titre, 'Vendeur');
  assert.deepEqual(resultat.accroches, []);
});

test('accroches seules (titre absent) : reste un resultat valide', () => {
  const resultat = bilanParserReponseTitreAccroche(texteColleDepuis({ titre: '', accroches: ['x', 'y'] }), DEPENDANCES);
  assert.equal(resultat.titre, '');
  assert.deepEqual(resultat.accroches, ['x', 'y']);
});

test('accroches contenant des elements non-chaines : filtres, jamais un echec', () => {
  const resultat = bilanParserReponseTitreAccroche(texteColleDepuis({ titre: 'x', accroches: ['a', 42, null, '  b  '] }), DEPENDANCES);
  assert.deepEqual(resultat.accroches, ['a', 'b']);
});

test('ni titre ni accroche exploitable -> ReponseIncomplete', () => {
  assert.throws(
    () => bilanParserReponseTitreAccroche(texteColleDepuis({ titre: '', accroches: [] }), DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIncomplete'
  );
});

test('aucun JSON dans le texte -> ReponseIllisible', () => {
  assert.throws(
    () => bilanParserReponseTitreAccroche('Réponse sans aucun bloc de code.', DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIllisible'
  );
});
