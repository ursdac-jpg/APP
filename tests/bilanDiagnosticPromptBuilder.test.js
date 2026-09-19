const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanFormaterValeurOptionnelle, bilanFormaterObservationsDeterministes, bilanFormaterTypeStructure,
  bilanConstruireValeursPlaceholders, bilanConstruirePromptDiagnostic
} = require('../modules/bilan-candidature/diagnostic/diagnosticPromptBuilder.js');

const TEMPLATE = 'Niveau: {NIVEAU_ANALYSE}\nCV: {CV}\nMetier: {METIER_VISE_OU_NON_FOURNI}\n' +
  'Offre: {OFFRE_EMPLOI_OU_NON_FOURNIE}\nEntreprise: {ENTREPRISE_CIBLEE_OU_NON_FOURNIE}\n' +
  'Observations: {OBSERVATIONS_DETERMINISTES}';

function candidatureValidee(champsSupp) {
  return Object.assign({ id: 'c1', cv: 'Mon CV', hashContenu: 'h1', confidentialiteValidee: true }, champsSupp || {});
}

test('bilanFormaterValeurOptionnelle : valeur absente => "Non fourni."', () => {
  assert.equal(bilanFormaterValeurOptionnelle(null), 'Non fourni.');
  assert.equal(bilanFormaterValeurOptionnelle(''), 'Non fourni.');
  assert.equal(bilanFormaterValeurOptionnelle('Boulanger'), 'Boulanger');
});

test('bilanFormaterObservationsDeterministes : liste vide => message explicite, jamais une liste vide muette', () => {
  assert.match(bilanFormaterObservationsDeterministes([]), /Aucune observation/);
});

test('bilanFormaterObservationsDeterministes : une ligne par observation', () => {
  const texte = bilanFormaterObservationsDeterministes([{ contenu: 'Téléphone présent.' }, { contenu: 'Aucun chevauchement.' }]);
  assert.equal(texte, '- Téléphone présent.\n- Aucun chevauchement.');
});

test('bilanConstruireValeursPlaceholders : mappe exactement les 11 placeholders du Prompt 1', () => {
  const valeurs = bilanConstruireValeursPlaceholders(candidatureValidee({ metierVise: 'Boulanger' }), { niveau: 2, observations: [] });
  assert.deepEqual(Object.keys(valeurs).sort(), [
    'CV', 'ELEMENTS_DEJA_IDENTIFIES_OU_NON_FOURNIS', 'ENTREPRISE_CIBLEE_OU_NON_FOURNIE', 'METIER_VISE_OU_NON_FOURNI',
    'NIVEAU_ANALYSE', 'OBSERVATIONS_DETERMINISTES', 'OFFRE_EMPLOI_OU_NON_FOURNIE',
    'POINTS_DEJA_CONNUS_OU_NON_FOURNIS', 'PROFIL_RECONVERSION_OU_DEBUTANT',
    'SITE_ENTREPRISE_OU_NON_FOURNI', 'TYPE_STRUCTURE_OU_NON_FOURNI'
  ]);
  assert.equal(valeurs.NIVEAU_ANALYSE, '2');
  assert.equal(valeurs.METIER_VISE_OU_NON_FOURNI, 'Boulanger');
});

// TACHE (chantier "ignorer un point du rapport", 2026-08-25)
test('bilanConstruireValeursPlaceholders : POINTS_DEJA_CONNUS_OU_NON_FOURNIS transmis tel quel, ou "Non fourni." si absent', () => {
  const avec = bilanConstruireValeursPlaceholders(candidatureValidee({ pointsDejaConnus: '- Ajouter un chiffre a la mission X.' }), { niveau: 1, observations: [] });
  assert.equal(avec.POINTS_DEJA_CONNUS_OU_NON_FOURNIS, '- Ajouter un chiffre a la mission X.');
  const sans = bilanConstruireValeursPlaceholders(candidatureValidee(), { niveau: 1, observations: [] });
  assert.equal(sans.POINTS_DEJA_CONNUS_OU_NON_FOURNIS, 'Non fourni.');
});

// TACHE (posture prioritaire pour profil reconversion/debutant, 2026-08-24)
test('bilanConstruireValeursPlaceholders : PROFIL_RECONVERSION_OU_DEBUTANT vaut "Oui" si objectif reconversion', () => {
  const valeurs = bilanConstruireValeursPlaceholders(candidatureValidee({ objectif: 'reconversion', nombreExperiencesProfessionnelles: 5 }), { niveau: 1, observations: [] });
  assert.equal(valeurs.PROFIL_RECONVERSION_OU_DEBUTANT, 'Oui');
});

test('bilanConstruireValeursPlaceholders : PROFIL_RECONVERSION_OU_DEBUTANT vaut "Oui" si aucune experience professionnelle', () => {
  const valeurs = bilanConstruireValeursPlaceholders(candidatureValidee({ objectif: 'offre', nombreExperiencesProfessionnelles: 0 }), { niveau: 1, observations: [] });
  assert.equal(valeurs.PROFIL_RECONVERSION_OU_DEBUTANT, 'Oui');
});

test('bilanConstruireValeursPlaceholders : PROFIL_RECONVERSION_OU_DEBUTANT vaut "Non" sinon', () => {
  const valeurs = bilanConstruireValeursPlaceholders(candidatureValidee({ objectif: 'offre', nombreExperiencesProfessionnelles: 3 }), { niveau: 1, observations: [] });
  assert.equal(valeurs.PROFIL_RECONVERSION_OU_DEBUTANT, 'Non');
});

// TACHE (ciblage offre d'emploi, 2026-08-24, demande de Denis) : typeStructure
// vaut soit une categorie fixe, soit 'Autre' -- dans ce dernier cas le texte
// utile est typeStructureAutre, jamais le mot generique 'Autre'.
test('bilanFormaterTypeStructure : categorie fixe reprise telle quelle', () => {
  assert.equal(bilanFormaterTypeStructure({ typeStructure: 'Association (loi 1901) / économie sociale et solidaire' }), 'Association (loi 1901) / économie sociale et solidaire');
});

test('bilanFormaterTypeStructure : absent => "Non fourni."', () => {
  assert.equal(bilanFormaterTypeStructure({}), 'Non fourni.');
});

test('bilanFormaterTypeStructure : "Autre" avec precision => reprend la precision, jamais le mot "Autre"', () => {
  assert.equal(bilanFormaterTypeStructure({ typeStructure: 'Autre', typeStructureAutre: 'Coopérative agricole' }), 'Coopérative agricole');
});

test('bilanFormaterTypeStructure : "Autre" sans precision => message explicite, jamais une chaine vide muette', () => {
  assert.equal(bilanFormaterTypeStructure({ typeStructure: 'Autre' }), 'Autre (non précisé).');
});

test('bilanConstruirePromptDiagnostic : produit un texte sans aucun placeholder restant', () => {
  const prompt = bilanConstruirePromptDiagnostic(TEMPLATE, candidatureValidee(), { niveau: 1, observations: [] }, { maintenant: () => '2026-08-08T00:00:00.000Z' });
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
  assert.equal(prompt.niveau, 1);
  assert.equal(prompt.hashContexteUtilise, 'h1');
  assert.equal(prompt.dateGeneration, '2026-08-08T00:00:00.000Z');
});

test('bilanConstruirePromptDiagnostic : leve RelectureNonValidee si confidentialiteValidee n\'est pas true', () => {
  assert.throws(
    () => bilanConstruirePromptDiagnostic(TEMPLATE, candidatureValidee({ confidentialiteValidee: false }), { niveau: 1, observations: [] }),
    (erreur) => erreur.code === 'RelectureNonValidee'
  );
});

test('bilanConstruirePromptDiagnostic : leve PlaceholderNonResolu si le template contient un placeholder inconnu', () => {
  assert.throws(
    () => bilanConstruirePromptDiagnostic('{CV} {PLACEHOLDER_INCONNU}', candidatureValidee(), { niveau: 1, observations: [] }),
    (erreur) => erreur.code === 'PlaceholderNonResolu' && erreur.details.placeholders.includes('PLACEHOLDER_INCONNU')
  );
});
