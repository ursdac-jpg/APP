const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  bilanConstruirePromptAmeliorationLot
} = require('../modules/bilan-candidature/amelioration/ameliorationPromptBuilder.js');

function demandeValide(id, champsSupp) {
  return Object.assign({
    id: id,
    recommandationSelectionnee: {
      id: 'reco-' + id, contenu: 'Ajouter un résultat chiffré.', dimensionsLiees: ['credibilite', 'impact'],
      extraitConcerne: 'A géré une équipe.'
    },
    observationsResolues: [{ contenu: 'Téléphone présent.' }],
    objectifs: []
  }, champsSupp || {});
}

// TACHE (ciblage offre d'emploi, 2026-08-24) : ce fichier n'existait pas --
// bilanConstruirePromptAmeliorationLot() n'avait jusqu'ici aucune
// couverture directe. Ajoute en meme temps que le contexte de candidature
// (offre/entreprise/site/structure), resolu UNE SEULE FOIS dans l'en-tete
// du lot (jamais repete par recommandation, voir ameliorationPromptBuilder.js).
test('integration : tous les placeholders du vrai prompts/bilan-v2-lot.md sont resolus, sans candidature', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [demandeValide('dem-1'), demandeValide('dem-2')], {});
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
  assert.deepEqual(prompt.demandeAmeliorationIds, ['dem-1', 'dem-2']);
});

test('contexte de candidature : resolu une seule fois dans l\'en-tete, identique pour toutes les recommandations du lot', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  const candidature = {
    offreEmploi: 'Vendeur en boulangerie', entrepriseCiblee: 'Boulangerie Dupont',
    siteEntreprise: 'https://boulangerie-dupont.fr', typeStructure: 'Autre', typeStructureAutre: 'Coopérative agricole'
  };
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [demandeValide('dem-1'), demandeValide('dem-2')], {}, candidature);
  const occurrences = prompt.texte.split('Boulangerie Dupont').length - 1;
  assert.equal(occurrences, 1, 'l\'entreprise ciblee ne doit apparaitre qu\'une fois, dans l\'en-tete du lot, jamais repetee par bloc');
  assert.match(prompt.texte, /Coopérative agricole/);
  assert.doesNotMatch(prompt.texte, /\{[A-Z_]+\}/);
});

test('sans candidature ni contexteDestination : les 4 champs de contexte + Experience concernee valent "Non fourni." dans le texte reel, comportement par defaut inchange', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [demandeValide('dem-1')], {});
  const occurrencesNonFourni = prompt.texte.split('Non fourni.').length - 1;
  // 4 champs de contexte de candidature + 1 Experience concernee
  // (correctif "suggestion pertinente par experience", 2026-08-25).
  assert.equal(occurrencesNonFourni, 5);
});

test('leve RecommandationInexistante si le lot est vide', () => {
  assert.throws(() => bilanConstruirePromptAmeliorationLot('texte', [], {}), (erreur) => erreur.code === 'RecommandationInexistante');
});

// TACHE (correctif "suggestion pertinente par experience", Carte 3, 2026-08-25)

test('RECOMMANDATION_ID resolu utilise demande.id, pas recommandationSelectionnee.id -- distingue 2 demandes issues de la MEME recommandation (multi-experiences)', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  // memes recommandationSelectionnee.id ('reco-r1') pour les 2 demandes --
  // c'est exactement le cas d'une recommandation appliquee a 2 experiences.
  const d1 = demandeValide('dem-a', { recommandationSelectionnee: { id: 'reco-r1', contenu: 'X', dimensionsLiees: [] } });
  const d2 = demandeValide('dem-b', { recommandationSelectionnee: { id: 'reco-r1', contenu: 'X', dimensionsLiees: [] } });
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [d1, d2], {});
  assert.match(prompt.texte, /Identifiant : dem-a/);
  assert.match(prompt.texte, /Identifiant : dem-b/);
  assert.doesNotMatch(prompt.texte, /Identifiant : reco-r1/);
});

test('EXPERIENCE_CONCERNEE_OU_NON_FOURNIE : "Non fourni." quand demande.contexteDestination est absent (comportement par defaut inchange)', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [demandeValide('dem-1')], {});
  assert.match(prompt.texte, /Expérience concernée :\*\* Non fourni\./);
});

test('EXPERIENCE_CONCERNEE_OU_NON_FOURNIE : reprend demande.contexteDestination tel quel quand fourni', () => {
  const texteReel = fs.readFileSync(path.join(__dirname, '../prompts/bilan-v2-lot.md'), 'utf8');
  const demande = demandeValide('dem-1', { contexteDestination: 'Assistante administrative - ABC Services. Missions actuelles : Accueil physique.' });
  const prompt = bilanConstruirePromptAmeliorationLot(texteReel, [demande], {});
  assert.match(prompt.texte, /Assistante administrative - ABC Services\. Missions actuelles : Accueil physique\./);
});
