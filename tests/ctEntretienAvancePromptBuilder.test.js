const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctFormaterValeurOptionnelleEA, ctFormaterQuestionsReponsesEA, ctFormaterListeRecommandationsEA,
  ctConstruireValeursPlaceholdersEntretienAvance, ctConstruirePromptEntretienAvance
} = require('../modules/coherence-transversale/diagnostic/entretienAvancePromptBuilder.js');

function dossierValide(overrides) {
  return Object.assign({
    id: 'dossier-1', cv: 'Mon CV', lettre: 'Madame, Monsieur...',
    offreEmploi: null, entrepriseCiblee: null, siteEntreprise: null, typeStructure: null,
    confidentialiteValidee: true
  }, overrides || {});
}

test('ctFormaterValeurOptionnelleEA : valeur presente renvoyee telle quelle, sinon "Non fournie."', () => {
  assert.equal(ctFormaterValeurOptionnelleEA('x'), 'x');
  assert.equal(ctFormaterValeurOptionnelleEA(null), 'Non fournie.');
});

test('ctFormaterQuestionsReponsesEA : une entree Q/R par ligne, reponse vide -> mention explicite', () => {
  const texte = ctFormaterQuestionsReponsesEA([{ question: 'Depuis quand ?', reponse: 'Trois ans.' }, { question: 'Pourquoi ce poste ?', reponse: '' }]);
  assert.ok(texte.indexOf('- Q : Depuis quand ?\n  R : Trois ans.') !== -1);
  assert.ok(texte.indexOf('(pas de réponse donnée)') !== -1);
});

test('ctFormaterQuestionsReponsesEA : aucune question -> "Aucune."', () => {
  assert.equal(ctFormaterQuestionsReponsesEA([]), 'Aucune.');
  assert.equal(ctFormaterQuestionsReponsesEA(null), 'Aucune.');
});

test('ctFormaterListeRecommandationsEA : accepte des objets {contenu} ou des chaines, "Aucune." si vide', () => {
  assert.equal(ctFormaterListeRecommandationsEA([{ contenu: 'Reformuler ce passage.' }]), '- Reformuler ce passage.');
  assert.equal(ctFormaterListeRecommandationsEA(['Texte brut.']), '- Texte brut.');
  assert.equal(ctFormaterListeRecommandationsEA([]), 'Aucune.');
});

test('ctConstruireValeursPlaceholdersEntretienAvance : mappe les 10 placeholders attendus', () => {
  const diagnosticPrecedent = { resultat: { syntheseGenerale: 'Candidature cohérente.' } };
  const valeurs = ctConstruireValeursPlaceholdersEntretienAvance(dossierValide(), diagnosticPrecedent, [], [], []);
  assert.deepEqual(Object.keys(valeurs).sort(), [
    'CV', 'ENTREPRISE_OU_NON_FOURNIE', 'LETTRE', 'OFFRE_OU_NON_FOURNIE',
    'QUESTIONS_REPONSES_PERSONNE', 'RECOMMANDATIONS_APPLIQUEES_OU_AUCUNE', 'RECOMMANDATIONS_NON_APPLIQUEES_OU_AUCUNE',
    'SITE_ENTREPRISE_OU_NON_FOURNI', 'SYNTHESE_ANALYSE_PRECEDENTE', 'TYPE_STRUCTURE_OU_NON_FOURNI'
  ]);
  assert.equal(valeurs.SYNTHESE_ANALYSE_PRECEDENTE, 'Candidature cohérente.');
});

test('ctConstruirePromptEntretienAvance : leve RelectureNonValidee si confidentialiteValidee n\'est pas true', () => {
  assert.throws(
    () => ctConstruirePromptEntretienAvance('{CV}', dossierValide({ confidentialiteValidee: false }), null, [], [], []),
    (e) => e.code === 'RelectureNonValidee'
  );
});

test('ctConstruirePromptEntretienAvance : leve PlaceholderNonResolu si le template attend un placeholder inconnu', () => {
  assert.throws(
    () => ctConstruirePromptEntretienAvance('{CV} {UN_PLACEHOLDER_QUI_N_EXISTE_PAS}', dossierValide(), null, [], [], []),
    (e) => e.code === 'PlaceholderNonResolu'
  );
});

test('ctConstruirePromptEntretienAvance : resout tous les placeholders et retourne texte/dateGeneration', () => {
  const template = 'CV:{CV}\nLETTRE:{LETTRE}\nOFFRE:{OFFRE_OU_NON_FOURNIE}\nENTREPRISE:{ENTREPRISE_OU_NON_FOURNIE}\nSITE:{SITE_ENTREPRISE_OU_NON_FOURNI}\nSTRUCTURE:{TYPE_STRUCTURE_OU_NON_FOURNI}\nSYNTHESE:{SYNTHESE_ANALYSE_PRECEDENTE}\nQR:{QUESTIONS_REPONSES_PERSONNE}\nAPPLIQUEES:{RECOMMANDATIONS_APPLIQUEES_OU_AUCUNE}\nNON_APPLIQUEES:{RECOMMANDATIONS_NON_APPLIQUEES_OU_AUCUNE}';
  const resultat = ctConstruirePromptEntretienAvance(
    template, dossierValide(), { resultat: { syntheseGenerale: 'Cohérent.' } },
    [{ question: 'Q1', reponse: 'R1' }], [{ contenu: 'Reco appliquée.' }], [{ contenu: 'Reco non appliquée.' }],
    { maintenant: () => '2026-08-25T00:00:00.000Z' }
  );
  assert.ok(resultat.texte.indexOf('CV:Mon CV') !== -1);
  assert.ok(resultat.texte.indexOf('SYNTHESE:Cohérent.') !== -1);
  assert.ok(resultat.texte.indexOf('APPLIQUEES:- Reco appliquée.') !== -1);
  assert.ok(resultat.texte.indexOf('NON_APPLIQUEES:- Reco non appliquée.') !== -1);
  assert.equal(resultat.dateGeneration, '2026-08-25T00:00:00.000Z');
});
