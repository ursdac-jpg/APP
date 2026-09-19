const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  ctFormaterValeurOptionnelle, ctFormaterConstatsDeterministes, ctConstruireValeursPlaceholders, ctConstruirePromptDiagnostic
} = require('../modules/coherence-transversale/diagnostic/promptBuilder.js');

function dossierValide(overrides) {
  return Object.assign({
    id: 'dossier-1', cv: 'Mon CV', lettre: 'Madame, Monsieur...',
    offreEmploi: null, entrepriseCiblee: null, siteEntreprise: null, typeStructure: null, preparationEntretien: null, questionsPersonne: null,
    hashContenu: 'abc123', confidentialiteValidee: true
  }, overrides || {});
}

test('ctFormaterValeurOptionnelle : valeur presente renvoyee telle quelle, sinon "Non fournie."', () => {
  assert.equal(ctFormaterValeurOptionnelle('x'), 'x');
  assert.equal(ctFormaterValeurOptionnelle(null), 'Non fournie.');
  assert.equal(ctFormaterValeurOptionnelle(''), 'Non fournie.');
});

test('ctFormaterConstatsDeterministes : une ligne par constat, message uniquement', () => {
  const texte = ctFormaterConstatsDeterministes([{ message: 'Duplication détectée.' }, { message: 'Autre constat.' }]);
  assert.equal(texte, '- Duplication détectée.\n- Autre constat.');
});

test('ctFormaterConstatsDeterministes : aucun constat -> message explicite', () => {
  assert.equal(ctFormaterConstatsDeterministes([]), 'Aucun constat déterministe disponible.');
  assert.equal(ctFormaterConstatsDeterministes(null), 'Aucun constat déterministe disponible.');
});

test('ctConstruireValeursPlaceholders : mappe exactement les 9 placeholders du prompt', () => {
  const valeurs = ctConstruireValeursPlaceholders(dossierValide(), []);
  assert.deepEqual(Object.keys(valeurs).sort(), [
    'CONSTATS_DETERMINISTES', 'CV', 'ENTREPRISE_OU_NON_FOURNIE', 'LETTRE',
    'OFFRE_OU_NON_FOURNIE', 'PREPARATION_ENTRETIEN_OU_NON_FOURNIE', 'QUESTIONS_PERSONNE_OU_NON_FOURNIES',
    'SITE_ENTREPRISE_OU_NON_FOURNI', 'TYPE_STRUCTURE_OU_NON_FOURNI'
  ]);
  assert.equal(valeurs.CV, 'Mon CV');
  assert.equal(valeurs.LETTRE, 'Madame, Monsieur...');
});

// TACHE (couche "qualites/traits", 2026-08-25, DECISION DE DENIS) : type
// de structure, utilise par la nouvelle dimension "registre de langage
// adapte au secteur vise" (prompts/coherence-transversale.md, section
// "Analyse transversale").
test('ctConstruireValeursPlaceholders : TYPE_STRUCTURE_OU_NON_FOURNI resout dossier.typeStructure, "Non fournie." si absent', () => {
  const avec = ctConstruireValeursPlaceholders(dossierValide({ typeStructure: 'Artisanat / commerce de proximité' }), []);
  assert.equal(avec.TYPE_STRUCTURE_OU_NON_FOURNI, 'Artisanat / commerce de proximité');
  const sans = ctConstruireValeursPlaceholders(dossierValide(), []);
  assert.equal(sans.TYPE_STRUCTURE_OU_NON_FOURNI, 'Non fournie.');
});

test('ctConstruirePromptDiagnostic : leve RelectureNonValidee si confidentialiteValidee n\'est pas true', () => {
  assert.throws(
    () => ctConstruirePromptDiagnostic('{CV} {LETTRE}', dossierValide({ confidentialiteValidee: false }), []),
    (e) => e.code === 'RelectureNonValidee'
  );
});

test('ctConstruirePromptDiagnostic : leve PlaceholderNonResolu si le template attend un placeholder inconnu', () => {
  assert.throws(
    () => ctConstruirePromptDiagnostic('{CV} {UN_PLACEHOLDER_QUI_N_EXISTE_PAS}', dossierValide(), []),
    (e) => e.code === 'PlaceholderNonResolu'
  );
});

test('ctConstruirePromptDiagnostic : resout tous les placeholders et retourne texte/dateGeneration/hashContexteUtilise', () => {
  const template = 'CV : {CV}\nLettre : {LETTRE}\nOffre : {OFFRE_OU_NON_FOURNIE}\nEntreprise : {ENTREPRISE_OU_NON_FOURNIE}\nSite : {SITE_ENTREPRISE_OU_NON_FOURNI}\nEntretien : {PREPARATION_ENTRETIEN_OU_NON_FOURNIE}\nConstats : {CONSTATS_DETERMINISTES}';
  const resultat = ctConstruirePromptDiagnostic(template, dossierValide(), [], { maintenant: () => '2026-08-25T00:00:00.000Z' });
  assert.ok(resultat.texte.indexOf('CV : Mon CV') !== -1);
  assert.ok(resultat.texte.indexOf('Offre : Non fournie.') !== -1);
  assert.equal(resultat.dateGeneration, '2026-08-25T00:00:00.000Z');
  assert.equal(resultat.hashContexteUtilise, 'abc123');
});
