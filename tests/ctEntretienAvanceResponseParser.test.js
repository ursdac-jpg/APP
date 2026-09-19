const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctReconstruireEntreeParQuestion, ctParserReponseEntretienAvance
} = require('../modules/coherence-transversale/diagnostic/entretienAvanceResponseParser.js');

function extraireJSONDeTest(texte) {
  const match = texte.match(/```json\s*([\s\S]*?)```/);
  if (!match) { return null; }
  try { return JSON.parse(match[1]); } catch (e) { return null; }
}

function reponseValide(overrides) {
  const base = {
    synthese: 'Entretien globalement réussi.',
    pointsForts: ['Réponses claires'],
    axesAmelioration: ['Développer davantage un exemple'],
    recommandations: ['Préparer un exemple chiffré pour la question sur les résultats.'],
    parQuestion: [{ question: 'Présentez-vous.', resumeReponse: 'Parcours de vendeur, 3 ans.', attentesEmployeur: 'Vérifier la cohérence du discours avec le CV.' }]
  };
  return '```json\n' + JSON.stringify(Object.assign(base, overrides || {})) + '\n```';
}

test('ctReconstruireEntreeParQuestion : reconstruit une entree valide', () => {
  const { entree, anomalie } = ctReconstruireEntreeParQuestion({ question: 'Q ?', resumeReponse: 'R', attentesEmployeur: 'A' }, 0);
  assert.equal(anomalie, null);
  assert.deepEqual(entree, { question: 'Q ?', resumeReponse: 'R', attentesEmployeur: 'A' });
});

test('ctReconstruireEntreeParQuestion : question manquante -> ecarte, anomalie consignee', () => {
  const { entree, anomalie } = ctReconstruireEntreeParQuestion({ resumeReponse: 'R' }, 0);
  assert.equal(entree, null);
  assert.ok(anomalie);
});

test('ctReconstruireEntreeParQuestion : entree absente/non-objet -> ecarte proprement, jamais une exception', () => {
  assert.doesNotThrow(() => ctReconstruireEntreeParQuestion(null, 0));
  assert.doesNotThrow(() => ctReconstruireEntreeParQuestion('pas un objet', 0));
});

test('ctParserReponseEntretienAvance : reconstruit synthese + pointsForts + axesAmelioration + recommandations + parQuestion', () => {
  const resultat = ctParserReponseEntretienAvance(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.synthese, 'Entretien globalement réussi.');
  assert.deepEqual(resultat.pointsForts, ['Réponses claires']);
  assert.deepEqual(resultat.axesAmelioration, ['Développer davantage un exemple']);
  assert.deepEqual(resultat.recommandations, ['Préparer un exemple chiffré pour la question sur les résultats.']);
  assert.equal(resultat.parQuestion.length, 1);
  assert.deepEqual(resultat.anomalies, []);
});

test('ctParserReponseEntretienAvance : leve ReponseIllisible si aucun JSON identifiable', () => {
  assert.throws(
    () => ctParserReponseEntretienAvance('Texte sans aucun bloc JSON.', { extraireJSON: extraireJSONDeTest }),
    (e) => e.code === 'ReponseIllisible'
  );
});

test('ctParserReponseEntretienAvance : leve ReponseIncomplete si synthese absente', () => {
  const reponse = '```json\n' + JSON.stringify({ pointsForts: [], parQuestion: [] }) + '\n```';
  assert.throws(
    () => ctParserReponseEntretienAvance(reponse, { extraireJSON: extraireJSONDeTest }),
    (e) => e.code === 'ReponseIncomplete'
  );
});

test('ctParserReponseEntretienAvance : une entree parQuestion mal formee est ecartee SANS faire echouer le reste', () => {
  const reponse = reponseValide({
    parQuestion: [
      { resumeReponse: 'R sans question' },
      { question: 'Question valide ?', resumeReponse: 'R', attentesEmployeur: 'A' }
    ]
  });
  const resultat = ctParserReponseEntretienAvance(reponse, { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.parQuestion.length, 1);
  assert.equal(resultat.parQuestion[0].question, 'Question valide ?');
  assert.equal(resultat.anomalies.length, 1);
});

test('ctParserReponseEntretienAvance : recommandations/pointsForts/axesAmelioration/parQuestion vides si absents -- pas une erreur', () => {
  const resultat = ctParserReponseEntretienAvance(reponseValide({ pointsForts: [], axesAmelioration: [], recommandations: [], parQuestion: [] }), { extraireJSON: extraireJSONDeTest });
  assert.deepEqual(resultat.pointsForts, []);
  assert.deepEqual(resultat.axesAmelioration, []);
  assert.deepEqual(resultat.recommandations, []);
  assert.deepEqual(resultat.parQuestion, []);
});
