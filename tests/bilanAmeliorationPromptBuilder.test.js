const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  bilanFormaterDimensionsLiees, bilanFormaterObjectifs,
  bilanConstruireValeursPlaceholdersAmelioration, bilanConstruirePromptAmelioration
} = require('../modules/bilan-candidature/amelioration/ameliorationPromptBuilder.js');

const TEMPLATE = 'Recommandation: {RECOMMANDATION_CONTENU}\nDimensions: {RECOMMANDATION_DIMENSIONS}\n' +
  'Extrait: {EXTRAIT_CONCERNE_OU_NON_FOURNI}\nObservations: {OBSERVATIONS_RESOLUES}\nObjectifs: {OBJECTIFS_OU_NON_FOURNIS}';

function demandeValide(champsSupp) {
  return Object.assign({
    id: 'dem-1',
    recommandationSelectionnee: {
      id: 'reco-1', contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite', 'impact'],
      extraitConcerne: 'A géré une équipe.'
    },
    observationsResolues: [{ contenu: 'Téléphone présent.' }, { contenu: 'Peu de résultats chiffrés.' }],
    objectifs: []
  }, champsSupp || {});
}

test('bilanFormaterDimensionsLiees : jointes par virgule, message par defaut si vide', () => {
  assert.equal(bilanFormaterDimensionsLiees(['credibilite', 'impact']), 'credibilite, impact');
  assert.equal(bilanFormaterDimensionsLiees([]), 'Non précisé.');
});

test('bilanFormaterObjectifs : joints par point-virgule, message par defaut si vide', () => {
  assert.equal(bilanFormaterObjectifs(['ton direct', 'plus court']), 'ton direct ; plus court');
  assert.match(bilanFormaterObjectifs([]), /Aucun objectif/);
});

test('bilanConstruireValeursPlaceholdersAmelioration : mappe exactement les 10 placeholders du Prompt 2', () => {
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide());
  assert.deepEqual(Object.keys(valeurs).sort(), [
    'ENTREPRISE_CIBLEE_OU_NON_FOURNIE', 'EXTRAIT_CONCERNE_OU_NON_FOURNI', 'OBJECTIFS_OU_NON_FOURNIS',
    'OBSERVATIONS_RESOLUES', 'OFFRE_EMPLOI_OU_NON_FOURNIE', 'PROFIL_RECONVERSION_OU_DEBUTANT',
    'RECOMMANDATION_CONTENU', 'RECOMMANDATION_DIMENSIONS', 'SITE_ENTREPRISE_OU_NON_FOURNI', 'TYPE_STRUCTURE_OU_NON_FOURNI'
  ]);
});

// TACHE (posture prioritaire pour profil reconversion/debutant, 2026-08-24)
test('bilanConstruireValeursPlaceholdersAmelioration : PROFIL_RECONVERSION_OU_DEBUTANT vaut "Oui" si objectif reconversion', () => {
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide(), { objectif: 'reconversion', nombreExperiencesProfessionnelles: 5 });
  assert.equal(valeurs.PROFIL_RECONVERSION_OU_DEBUTANT, 'Oui');
});

test('bilanConstruireValeursPlaceholdersAmelioration : PROFIL_RECONVERSION_OU_DEBUTANT vaut "Non" sans candidature (comportement par defaut inchange)', () => {
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide());
  assert.equal(valeurs.PROFIL_RECONVERSION_OU_DEBUTANT, 'Non');
});

// TACHE (ciblage offre d'emploi, 2026-08-24, demande de Denis) : le Prompt
// 2 doit desormais s'aligner sur le meme contexte que le Prompt 1 --
// verifie ici la hierarchie de defaut ('Non fourni.' si absent) et
// l'exploitation reelle quand la candidature est fournie.
test('bilanConstruireValeursPlaceholdersAmelioration : candidature absente -> les 4 champs de contexte valent "Non fourni."', () => {
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide());
  assert.equal(valeurs.OFFRE_EMPLOI_OU_NON_FOURNIE, 'Non fourni.');
  assert.equal(valeurs.ENTREPRISE_CIBLEE_OU_NON_FOURNIE, 'Non fourni.');
  assert.equal(valeurs.SITE_ENTREPRISE_OU_NON_FOURNI, 'Non fourni.');
  assert.equal(valeurs.TYPE_STRUCTURE_OU_NON_FOURNI, 'Non fourni.');
});

test('bilanConstruireValeursPlaceholdersAmelioration : candidature fournie -> les 4 champs sont repris tels quels', () => {
  const candidature = {
    offreEmploi: 'Vendeur en boulangerie', entrepriseCiblee: 'Boulangerie Dupont',
    siteEntreprise: 'https://boulangerie-dupont.fr', typeStructure: 'Artisanat / commerce de proximité'
  };
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide(), candidature);
  assert.equal(valeurs.OFFRE_EMPLOI_OU_NON_FOURNIE, 'Vendeur en boulangerie');
  assert.equal(valeurs.ENTREPRISE_CIBLEE_OU_NON_FOURNIE, 'Boulangerie Dupont');
  assert.equal(valeurs.SITE_ENTREPRISE_OU_NON_FOURNI, 'https://boulangerie-dupont.fr');
  assert.equal(valeurs.TYPE_STRUCTURE_OU_NON_FOURNI, 'Artisanat / commerce de proximité');
});

test('bilanConstruireValeursPlaceholdersAmelioration : typeStructure "Autre" -> reprend typeStructureAutre, jamais le mot "Autre"', () => {
  const candidature = { typeStructure: 'Autre', typeStructureAutre: 'Coopérative agricole' };
  const valeurs = bilanConstruireValeursPlaceholdersAmelioration(demandeValide(), candidature);
  assert.equal(valeurs.TYPE_STRUCTURE_OU_NON_FOURNI, 'Coopérative agricole');
});

test('bilanConstruirePromptAmelioration : produit un texte sans placeholder restant', () => {
  const prompt = bilanConstruirePromptAmelioration(TEMPLATE, demandeValide(), { maintenant: () => '2026-08-08T00:00:00.000Z' });
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
  assert.equal(prompt.demandeAmeliorationId, 'dem-1');
  assert.equal(prompt.dateGeneration, '2026-08-08T00:00:00.000Z');
});

test('bilanConstruirePromptAmelioration : jamais de champ "id" -- coherent avec bilanConstruirePromptDiagnostic', () => {
  const prompt = bilanConstruirePromptAmelioration(TEMPLATE, demandeValide());
  assert.equal('id' in prompt, false);
});

test('bilanConstruirePromptAmelioration : leve RecommandationInexistante si demandeAmelioration invalide', () => {
  assert.throws(() => bilanConstruirePromptAmelioration(TEMPLATE, null), (erreur) => erreur.code === 'RecommandationInexistante');
});

test('bilanConstruirePromptAmelioration : leve PlaceholderNonResolu si le template contient un placeholder inconnu', () => {
  assert.throws(
    () => bilanConstruirePromptAmelioration('{RECOMMANDATION_CONTENU} {INCONNU}', demandeValide()),
    (erreur) => erreur.code === 'PlaceholderNonResolu' && erreur.details.placeholders.includes('INCONNU')
  );
});

test('integration : tous les placeholders du vrai prompts/bilan-v2.md sont resolus', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2.md'), 'utf8');
  const prompt = bilanConstruirePromptAmelioration(texteReel, demandeValide());
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
});

test('symetrie exacte : les cles injectees correspondent EXACTEMENT aux placeholders reels du prompt -- aucun champ invente, aucun perdu', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2.md'), 'utf8');
  const placeholdersReels = new Set(Array.from(texteReel.matchAll(/\{([A-Z_]+)\}/g), (m) => m[1]));
  const clesInjectees = new Set(Object.keys(bilanConstruireValeursPlaceholdersAmelioration(demandeValide())));
  assert.deepEqual([...clesInjectees].sort(), [...placeholdersReels].sort());
});

// TACHE (chantier "Assistance a la finalisation du CV", brique 2,
// 2026-08-11) : verifie que ce fichier n'a besoin d'AUCUNE modification
// pour le Niveau 2 -- une recommandation sans extraitConcerne (repli sur
// axe, voir resolutionDestination.js) produit deja un prompt valide,
// EXTRAIT_CONCERNE_OU_NON_FOURNI se resolvant via le meme mecanisme
// generique que pour le Niveau 1 (bilanFormaterValeurOptionnelle).
test('integration Niveau 2 : recommandation sans extraitConcerne (repli sur axe) -> prompt reel valide, aucun placeholder restant', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2.md'), 'utf8');
  const demandeNiveau2 = demandeValide({
    recommandationSelectionnee: {
      id: 'reco-1', contenu: 'Préciser le métier visé pour cette candidature.',
      dimensionsLiees: ['adequation'], extraitConcerne: null
    }
  });
  const prompt = bilanConstruirePromptAmelioration(texteReel, demandeNiveau2);
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
});
