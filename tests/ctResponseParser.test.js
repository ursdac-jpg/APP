const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctReconstruireConstat, ctReconstruireRecommandation, ctParserReponseDiagnostic, ctReconstruireParDocument, ctReconstruireNiveau, ctReconstruireSyntheseNarrative, ctReconstruireQuestionsEntretien, ctReconstruireLettreVersionCourte
} = require('../modules/coherence-transversale/diagnostic/responseParser.js');

function extraireJSONDeTest(texte) {
  const match = texte.match(/```json\s*([\s\S]*?)```/);
  if (!match) { return null; }
  try { return JSON.parse(match[1]); } catch (e) { return null; }
}

function reponseValide(overrides) {
  const base = {
    syntheseGenerale: 'Analyse terminée.',
    constats: [{
      ancrage: ['cv.experience[0]', 'lettre.paragraphe[1]'],
      nature: 'incoherence',
      dimension: 'autonomie',
      preuve: ['texte du CV', 'texte de la lettre'],
      message: 'Incohérence détectée.'
    }],
    recommandations: [{
      constatsLies: [0],
      contenu: 'Reformulez ce passage.',
      documentCible: 'lettre',
      modeApplication: 'remplacement',
      texteAncre: 'ancien texte',
      textePropose: 'nouveau texte'
    }]
  };
  return '```json\n' + JSON.stringify(Object.assign(base, overrides || {})) + '\n```';
}

test('ctReconstruireConstat : reconstruit un constat valide', () => {
  const { constat, anomalie } = ctReconstruireConstat({
    ancrage: ['cv.experience[0]'], nature: 'force', dimension: 'rigueur', preuve: ['extrait'], message: 'Point fort.'
  }, 0);
  assert.equal(anomalie, null);
  assert.equal(constat.nature, 'force');
  assert.equal(constat.id, 'constat-0');
});

test('ctReconstruireConstat : ancrage manquant -> ecarte, anomalie consignee', () => {
  const { constat, anomalie } = ctReconstruireConstat({ nature: 'force', preuve: ['x'], message: 'x' }, 0);
  assert.equal(constat, null);
  assert.ok(anomalie);
});

test('ctReconstruireConstat : entree absente/non-objet -> ecarte proprement, jamais une exception', () => {
  assert.doesNotThrow(() => ctReconstruireConstat(null, 0));
  assert.doesNotThrow(() => ctReconstruireConstat('pas un objet', 0));
});

test('ctReconstruireRecommandation : constatsLies resout des INDEX vers les vrais ids des constats deja reconstruits', () => {
  const constatsDejaReconstruits = [{ id: 'constat-0' }, { id: 'constat-1' }];
  const { recommandation, anomalie } = ctReconstruireRecommandation({
    constatsLies: [1], contenu: 'x', documentCible: 'cv', modeApplication: 'conseil'
  }, 0, constatsDejaReconstruits);
  assert.equal(anomalie, null);
  assert.deepEqual(recommandation.constatsLies, ['constat-1']);
});

test('ctReconstruireRecommandation : index hors bornes -> ignore silencieusement cet index, jamais une exception', () => {
  const constatsDejaReconstruits = [{ id: 'constat-0' }];
  const { recommandation, anomalie } = ctReconstruireRecommandation({
    constatsLies: [99], contenu: 'x', documentCible: 'cv', modeApplication: 'conseil'
  }, 0, constatsDejaReconstruits);
  assert.equal(recommandation, null);
  assert.ok(anomalie);
});

test('ctParserReponseDiagnostic : reconstruit syntheseGenerale + constats + recommandations a partir d\'une reponse valide', () => {
  const resultat = ctParserReponseDiagnostic(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.syntheseGenerale, 'Analyse terminée.');
  assert.equal(resultat.constats.length, 1);
  assert.equal(resultat.recommandations.length, 1);
  assert.equal(resultat.recommandations[0].constatsLies[0], resultat.constats[0].id);
  assert.deepEqual(resultat.anomalies, []);
});

test('ctParserReponseDiagnostic : leve ReponseIllisible si aucun JSON identifiable', () => {
  assert.throws(
    () => ctParserReponseDiagnostic('Texte sans aucun bloc JSON.', { extraireJSON: extraireJSONDeTest }),
    (e) => e.code === 'ReponseIllisible'
  );
});

test('ctParserReponseDiagnostic : leve ReponseIncomplete si syntheseGenerale absente', () => {
  const reponse = '```json\n' + JSON.stringify({ constats: [], recommandations: [] }) + '\n```';
  assert.throws(
    () => ctParserReponseDiagnostic(reponse, { extraireJSON: extraireJSONDeTest }),
    (e) => e.code === 'ReponseIncomplete'
  );
});

// TACHE (retour Denis, 2026-08-31, Chantier 4) : sortie de secours du prompt
// quand les pieces fournies ne permettent aucune analyse de coherence.
test('ctParserReponseDiagnostic : { analyseImpossible: true } -> erreur metier dediee SaisieInexploitable, jamais un rapport vide', () => {
  const reponse = '```json\n' + JSON.stringify({ analyseImpossible: true, message: 'Les pièces fournies ne permettent pas d\'analyser la cohérence de la candidature.' }) + '\n```';
  assert.throws(
    () => ctParserReponseDiagnostic(reponse, { extraireJSON: extraireJSONDeTest }),
    (e) => e.code === 'SaisieInexploitable' && /coh[ée]rence/.test(e.message)
  );
});

test('ctParserReponseDiagnostic : un constat mal forme est ecarte SANS faire echouer le reste de la reponse', () => {
  const reponse = reponseValide({
    constats: [
      { nature: 'force', preuve: ['x'], message: 'x' }, // ancrage manquant -> ecarte
      { ancrage: ['cv'], nature: 'force', dimension: 'rigueur', preuve: ['extrait valide'], message: 'Constat valide.' }
    ],
    recommandations: []
  });
  const resultat = ctParserReponseDiagnostic(reponse, { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.constats.length, 1);
  assert.equal(resultat.constats[0].message, 'Constat valide.');
  assert.equal(resultat.anomalies.length, 1);
});

test('ctParserReponseDiagnostic : recommandations vides si l\'IA n\'en produit aucune -> pas une erreur', () => {
  const resultat = ctParserReponseDiagnostic(reponseValide({ recommandations: [] }), { extraireJSON: extraireJSONDeTest });
  assert.deepEqual(resultat.recommandations, []);
});

test('ctReconstruireParDocument : reconstruit titre + pointsForts/pointsFaibles pour chaque document fourni', () => {
  const resultat = ctReconstruireParDocument({
    cv: { titre: 'Vendeur', pointsForts: ['Expérience solide'], pointsFaibles: ['Manque de chiffres'] },
    lettre: { titre: 'Vendeur', pointsForts: [], pointsFaibles: [] }
  });
  assert.deepEqual(resultat.cv, { titre: 'Vendeur', pointsForts: ['Expérience solide'], pointsFaibles: ['Manque de chiffres'] });
  assert.deepEqual(resultat.lettre, { titre: 'Vendeur', pointsForts: [], pointsFaibles: [] });
  assert.equal(resultat.entretien, null);
});

test('ctReconstruireParDocument : titre manquant ou absent/non-objet -> null, jamais une exception', () => {
  assert.doesNotThrow(() => ctReconstruireParDocument(null));
  const resultat = ctReconstruireParDocument({ cv: { pointsForts: ['x'] } });
  assert.equal(resultat.cv, null);
});

test('ctParserReponseDiagnostic : transmet parDocument reconstruit (titre par document, signal de coherence utile meme different d\'un document a l\'autre)', () => {
  const resultat = ctParserReponseDiagnostic(reponseValide({
    parDocument: { cv: { titre: 'Vendeur', pointsForts: ['a', 'b'], pointsFaibles: ['c'] } }
  }), { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.parDocument.cv.titre, 'Vendeur');
  assert.equal(resultat.parDocument.lettre, null);
});

test('ctParserReponseDiagnostic : parDocument absent de la reponse -> jamais une erreur, juste des documents sans titre', () => {
  const resultat = ctParserReponseDiagnostic(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.deepEqual(resultat.parDocument, { cv: null, lettre: null, entretien: null });
});

test('ctReconstruireNiveau : valeur valide transmise telle quelle, invalide/absente -> null', () => {
  assert.equal(ctReconstruireNiveau('coherent'), 'coherent');
  assert.equal(ctReconstruireNiveau('incoherences_majeures'), 'incoherences_majeures');
  assert.equal(ctReconstruireNiveau('valeur inventee'), null);
  assert.equal(ctReconstruireNiveau(undefined), null);
});

test('ctParserReponseDiagnostic : transmet niveau (meme source que syntheseGenerale, jamais deduit des constats -- evite toute contradiction texte/couleur)', () => {
  const resultat = ctParserReponseDiagnostic(reponseValide({ niveau: 'incoherences_mineures' }), { extraireJSON: extraireJSONDeTest });
  assert.equal(resultat.niveau, 'incoherences_mineures');
});

// TACHE (synthese narrative globale, 2026-08-25, DECISION DE DENIS)
test('ctReconstruireSyntheseNarrative : chaine non vide transmise (avec trim), absente/vide/non-chaine -> null', () => {
  assert.equal(ctReconstruireSyntheseNarrative('  Un récit ancré dans les documents.  '), 'Un récit ancré dans les documents.');
  assert.equal(ctReconstruireSyntheseNarrative(''), null);
  assert.equal(ctReconstruireSyntheseNarrative('   '), null);
  assert.equal(ctReconstruireSyntheseNarrative(undefined), null);
  assert.equal(ctReconstruireSyntheseNarrative(42), null);
});

test('ctParserReponseDiagnostic : transmet syntheseNarrative si fournie, null sinon -- jamais une erreur ni un blocage du reste du rapport', () => {
  const avec = ctParserReponseDiagnostic(reponseValide({ syntheseNarrative: 'Cette candidature raconte un parcours cohérent.' }), { extraireJSON: extraireJSONDeTest });
  assert.equal(avec.syntheseNarrative, 'Cette candidature raconte un parcours cohérent.');
  const sans = ctParserReponseDiagnostic(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.equal(sans.syntheseNarrative, null);
});

// TACHE (entretien avance, Pass A, 2026-08-25, DECISION DE DENIS)
test('ctReconstruireQuestionsEntretien : liste de chaines non vides transmise, absente/invalide -> tableau vide', () => {
  assert.deepEqual(ctReconstruireQuestionsEntretien(['Quelle est votre motivation ?', '  ', 42, 'Autre question ?']), ['Quelle est votre motivation ?', 'Autre question ?']);
  assert.deepEqual(ctReconstruireQuestionsEntretien(undefined), []);
  assert.deepEqual(ctReconstruireQuestionsEntretien('pas un tableau'), []);
});

test('ctParserReponseDiagnostic : transmet questionsEntretien si fournies, tableau vide sinon -- jamais une erreur ni un blocage du reste du rapport', () => {
  const avec = ctParserReponseDiagnostic(reponseValide({ questionsEntretien: ['Pouvez-vous préciser ce point de votre parcours ?'] }), { extraireJSON: extraireJSONDeTest });
  assert.deepEqual(avec.questionsEntretien, ['Pouvez-vous préciser ce point de votre parcours ?']);
  const sans = ctParserReponseDiagnostic(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.deepEqual(sans.questionsEntretien, []);
});

// TACHE (version courte de la lettre pour un email, 2026-08-25, DECISION DE DENIS)
test('ctReconstruireLettreVersionCourte : chaine non vide transmise (avec trim), absente/vide/non-chaine -> null', () => {
  assert.equal(ctReconstruireLettreVersionCourte('  Madame, je postule pour...  '), 'Madame, je postule pour...');
  assert.equal(ctReconstruireLettreVersionCourte(''), null);
  assert.equal(ctReconstruireLettreVersionCourte('   '), null);
  assert.equal(ctReconstruireLettreVersionCourte(undefined), null);
});

test('ctParserReponseDiagnostic : transmet lettreVersionCourte si fournie, null sinon -- jamais une erreur ni un blocage du reste du rapport', () => {
  const avec = ctParserReponseDiagnostic(reponseValide({ lettreVersionCourte: 'Version courte pour email.' }), { extraireJSON: extraireJSONDeTest });
  assert.equal(avec.lettreVersionCourte, 'Version courte pour email.');
  const sans = ctParserReponseDiagnostic(reponseValide(), { extraireJSON: extraireJSONDeTest });
  assert.equal(sans.lettreVersionCourte, null);
});
