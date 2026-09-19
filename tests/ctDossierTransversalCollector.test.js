const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ctCollecterDossierTransversal } = require('../modules/coherence-transversale/collecte/dossierTransversalCollector.js');

function dependancesDeTest(overrides) {
  return Object.assign({
    lecteurs: {
      lireCv: () => 'Mon CV complet',
      lireLettreTexte: () => 'Madame, Monsieur, déjà rédigée dans l’app.',
      lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireSiteEntreprise: () => 'https://boulangerie-dupont.fr',
      lireEntretienTexte: () => ''
    },
    afficherEcran: (contenu, titre, callbacks) => callbacks.onValider(contenu),
    maintenant: () => '2026-08-25T00:00:00.000Z'
  }, overrides || {});
}

test('ctCollecterDossierTransversal : assemble cv (app) + lettre (app) + entreprise/site (app)', async () => {
  const dossier = await ctCollecterDossierTransversal({}, dependancesDeTest());
  assert.equal(dossier.cv, 'Mon CV complet');
  assert.equal(dossier.lettre, 'Madame, Monsieur, déjà rédigée dans l’app.');
  assert.equal(dossier.entrepriseCiblee, 'Boulangerie Dupont');
  assert.equal(dossier.siteEntreprise, 'https://boulangerie-dupont.fr');
  assert.equal(dossier.confidentialiteValidee, true);
});

test('ctCollecterDossierTransversal : cv saisi manuellement (depot frais) prioritaire sur celui deja dans l\'app', async () => {
  const dossier = await ctCollecterDossierTransversal({ cv: 'CV fraîchement déposé.' }, dependancesDeTest());
  assert.equal(dossier.cv, 'CV fraîchement déposé.');
});

test('ctCollecterDossierTransversal : lettre saisie manuellement prioritaire sur celle deja dans l\'app', async () => {
  const dossier = await ctCollecterDossierTransversal({ lettre: 'Lettre collée manuellement.' }, dependancesDeTest());
  assert.equal(dossier.lettre, 'Lettre collée manuellement.');
});

test('ctCollecterDossierTransversal : offreEmploi transmis tel quel (saisie libre, jamais lu de l\'app)', async () => {
  const dossier = await ctCollecterDossierTransversal({ offreEmploi: 'Texte de l\'offre' }, dependancesDeTest());
  assert.equal(dossier.offreEmploi, 'Texte de l\'offre');
});

test('ctCollecterDossierTransversal : offreEmploi se replie sur le texte deja memorise (dossier.rechercheCandidature.texteOffre) si non saisi', async () => {
  const dossier = await ctCollecterDossierTransversal({}, dependancesDeTest({
    lecteurs: Object.assign({}, dependancesDeTest().lecteurs, { lireTexteOffre: () => 'Offre déjà mémorisée.' })
  }));
  assert.equal(dossier.offreEmploi, 'Offre déjà mémorisée.');
});

test('ctCollecterDossierTransversal : preparationEntretien saisi manuellement prioritaire sur celui deja dans l\'app', async () => {
  const dossier = await ctCollecterDossierTransversal({ preparationEntretien: 'Synthèse déposée manuellement.' }, dependancesDeTest({
    lecteurs: Object.assign({}, dependancesDeTest().lecteurs, { lireEntretienTexte: () => 'Synthèse déjà dans l’app.' })
  }));
  assert.equal(dossier.preparationEntretien, 'Synthèse déposée manuellement.');
});

test('ctCollecterDossierTransversal : dependances.dejaRelu transmis a ctDemanderRelectureDossier (aucun ecran pour les documents deja relus)', async () => {
  const titresAffiches = [];
  const dossier = await ctCollecterDossierTransversal({}, dependancesDeTest({
    afficherEcran: (contenu, titre, callbacks) => { titresAffiches.push(titre); callbacks.onValider(contenu); },
    dejaRelu: { cv: true, lettre: true }
  }));
  assert.deepEqual(titresAffiches, []);
  assert.equal(dossier.confidentialiteValidee, true);
});

test('ctCollecterDossierTransversal : typeStructure transmis tel quel si fourni, null sinon', async () => {
  const avec = await ctCollecterDossierTransversal({ typeStructure: 'Artisanat / commerce de proximité' }, dependancesDeTest());
  assert.equal(avec.typeStructure, 'Artisanat / commerce de proximité');
  const sans = await ctCollecterDossierTransversal({}, dependancesDeTest());
  assert.equal(sans.typeStructure, null);
});

test('ctCollecterDossierTransversal : questionsPersonne transmis tel quel si fourni, null sinon', async () => {
  const avec = await ctCollecterDossierTransversal({ questionsPersonne: 'Ai-je assez insisté sur mon autonomie ?' }, dependancesDeTest());
  assert.equal(avec.questionsPersonne, 'Ai-je assez insisté sur mon autonomie ?');
  const sans = await ctCollecterDossierTransversal({}, dependancesDeTest());
  assert.equal(sans.questionsPersonne, null);
});

test('ctCollecterDossierTransversal : rejette avec DossierTransversalInvalide si la lettre manque partout (app ET saisie libre) - jamais d\'ecran de relecture ouvert', async () => {
  let ecranOuvert = false;
  await assert.rejects(
    () => ctCollecterDossierTransversal({}, dependancesDeTest({
      lecteurs: {
        lireCv: () => 'Mon CV', lireLettreTexte: () => '',
        lireEntrepriseCiblee: () => null, lireSiteEntreprise: () => null, lireEntretienTexte: () => ''
      },
      afficherEcran: () => { ecranOuvert = true; }
    })),
    (e) => e.code === 'DossierTransversalInvalide'
  );
  assert.equal(ecranOuvert, false);
});

test('ctCollecterDossierTransversal : rejette avec RelectureAnnulee si la personne annule, jamais confidentialiteValidee a true', async () => {
  await assert.rejects(
    () => ctCollecterDossierTransversal({}, dependancesDeTest({
      afficherEcran: (contenu, titre, callbacks) => callbacks.onAnnuler()
    })),
    (e) => e.code === 'RelectureAnnulee'
  );
});
