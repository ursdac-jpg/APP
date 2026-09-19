const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  bilanCollecterCandidature, bilanCollecterDonneesStructureesAnalyse
} = require('../modules/bilan-candidature/collecte/contexteCandidatureCollector.js');

function dependancesDeTest(overrides) {
  return Object.assign({
    lecteurs: {
      lireCv: () => 'Mon CV complet',
      lireMetierVise: () => 'Boulanger',
      lireEntrepriseCiblee: () => 'Boulangerie Dupont'
    },
    afficherEcranRelecture: (contenu, callbacks) => { callbacks.onValider(contenu); },
    maintenant: () => '2026-08-08T00:00:00.000Z'
  }, overrides || {});
}

test('bilanCollecterCandidature : assemble cv + metierVise + entrepriseCiblee + offreEmploi (saisie libre)', async () => {
  const candidature = await bilanCollecterCandidature({ offreEmploi: 'Texte de l\'offre' }, dependancesDeTest());
  assert.equal(candidature.cv, 'Mon CV complet');
  assert.equal(candidature.metierVise, 'Boulanger');
  assert.equal(candidature.entrepriseCiblee, 'Boulangerie Dupont');
  assert.equal(candidature.offreEmploi, 'Texte de l\'offre');
});

// TACHE (ciblage offre d'emploi, 2026-08-24, demande de Denis)
test('bilanCollecterCandidature : siteEntreprise/typeStructure/typeStructureAutre (saisie libre) transportes tels quels', async () => {
  const candidature = await bilanCollecterCandidature({
    siteEntreprise: 'https://boulangerie-dupont.fr', typeStructure: 'Autre', typeStructureAutre: 'Coopérative agricole'
  }, dependancesDeTest());
  assert.equal(candidature.siteEntreprise, 'https://boulangerie-dupont.fr');
  assert.equal(candidature.typeStructure, 'Autre');
  assert.equal(candidature.typeStructureAutre, 'Coopérative agricole');
});

// TACHE (chantier "Coherence transversale CV/lettre/entretien", 2026-08-25)
test('bilanCollecterCandidature : siteEntreprise se replie sur brut.siteEntreprise si non saisi, meme principe que entrepriseCiblee', async () => {
  const candidature = await bilanCollecterCandidature({}, dependancesDeTest({
    lecteurs: {
      lireCv: () => 'Mon CV complet',
      lireMetierVise: () => 'Boulanger',
      lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireSiteEntreprise: () => 'https://boulangerie-dupont.fr'
    }
  }));
  assert.equal(candidature.siteEntreprise, 'https://boulangerie-dupont.fr');
});

test('bilanCollecterCandidature : siteEntreprise saisi manuellement est prioritaire sur brut.siteEntreprise', async () => {
  const candidature = await bilanCollecterCandidature({ siteEntreprise: 'https://site-corrige.fr' }, dependancesDeTest({
    lecteurs: {
      lireCv: () => 'Mon CV complet',
      lireMetierVise: () => 'Boulanger',
      lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireSiteEntreprise: () => 'https://site-auto-detecte.fr'
    }
  }));
  assert.equal(candidature.siteEntreprise, 'https://site-corrige.fr');
});

// TACHE (transfert Coherence transversale -> Bilan, 2026-08-25, DECISION DE DENIS)
test('bilanCollecterCandidature : offreEmploi se replie sur brut.offreEmploi (memorise app-wide par Coherence transversale) si non saisi', async () => {
  const candidature = await bilanCollecterCandidature({}, dependancesDeTest({
    lecteurs: {
      lireCv: () => 'Mon CV complet', lireMetierVise: () => 'Boulanger', lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireOffreEmploi: () => 'Offre déjà mémorisée par Cohérence transversale.'
    }
  }));
  assert.equal(candidature.offreEmploi, 'Offre déjà mémorisée par Cohérence transversale.');
});

test('bilanCollecterCandidature : offreEmploi saisi manuellement sur l\'ecran de ciblage est prioritaire sur brut.offreEmploi', async () => {
  const candidature = await bilanCollecterCandidature({ offreEmploi: 'Offre corrigée sur l\'écran' }, dependancesDeTest({
    lecteurs: {
      lireCv: () => 'Mon CV complet', lireMetierVise: () => 'Boulanger', lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireOffreEmploi: () => 'Offre auto-détectée'
    }
  }));
  assert.equal(candidature.offreEmploi, 'Offre corrigée sur l\'écran');
});

test('bilanCollecterCandidature : typeStructure se replie sur brut.typeStructure si non saisi', async () => {
  const candidature = await bilanCollecterCandidature({}, dependancesDeTest({
    lecteurs: {
      lireCv: () => 'Mon CV complet', lireMetierVise: () => 'Boulanger', lireEntrepriseCiblee: () => 'Boulangerie Dupont',
      lireTypeStructure: () => 'Association (loi 1901) / économie sociale et solidaire'
    }
  }));
  assert.equal(candidature.typeStructure, 'Association (loi 1901) / économie sociale et solidaire');
});

test('bilanCollecterCandidature : elementsCoherenceTransversale (saisie libre) transporte tel quel, null si absent', async () => {
  const avec = await bilanCollecterCandidature({ elementsCoherenceTransversale: '- Ajoutez des chiffres concrets.' }, dependancesDeTest());
  assert.equal(avec.elementsCoherenceTransversale, '- Ajoutez des chiffres concrets.');
  const sans = await bilanCollecterCandidature({}, dependancesDeTest());
  assert.equal(sans.elementsCoherenceTransversale, null);
});

test('bilanCollecterCandidature : entrepriseCiblee en saisie libre est prioritaire sur celle deja connue de l\'app', async () => {
  const candidature = await bilanCollecterCandidature({ entrepriseCiblee: 'Autre boulangerie' }, dependancesDeTest());
  assert.equal(candidature.entrepriseCiblee, 'Autre boulangerie');
});

test('bilanCollecterCandidature : sans saisie libre, entrepriseCiblee reste celle deja connue de l\'app (comportement inchange)', async () => {
  const candidature = await bilanCollecterCandidature({}, dependancesDeTest());
  assert.equal(candidature.entrepriseCiblee, 'Boulangerie Dupont');
});

test('bilanCollecterCandidature : confidentialiteValidee passe a true apres relecture validee', async () => {
  const candidature = await bilanCollecterCandidature({}, dependancesDeTest());
  assert.equal(candidature.confidentialiteValidee, true);
});

test('bilanCollecterCandidature : le contenu valide par la relecture remplace le cv d\'origine', async () => {
  const deps = dependancesDeTest({
    afficherEcranRelecture: (contenu, callbacks) => { callbacks.onValider('CV apres retrait du telephone'); }
  });
  const candidature = await bilanCollecterCandidature({}, deps);
  assert.equal(candidature.cv, 'CV apres retrait du telephone');
});

test('bilanCollecterCandidature : rejette CandidatureInvalide si cv vide, sans jamais afficher l\'ecran de relecture', async () => {
  let ecranAffiche = false;
  const deps = dependancesDeTest({
    lecteurs: { lireCv: () => '', lireMetierVise: () => null, lireEntrepriseCiblee: () => null },
    afficherEcranRelecture: () => { ecranAffiche = true; }
  });
  await assert.rejects(() => bilanCollecterCandidature({}, deps), (erreur) => erreur.code === 'CandidatureInvalide');
  assert.equal(ecranAffiche, false);
});

test('bilanCollecterCandidature : rejette RelectureAnnulee si l\'utilisateur annule, confidentialiteValidee reste false', async () => {
  const deps = dependancesDeTest({
    afficherEcranRelecture: (contenu, callbacks) => { callbacks.onAnnuler(); }
  });
  await assert.rejects(() => bilanCollecterCandidature({}, deps), (erreur) => erreur.code === 'RelectureAnnulee');
});

// TACHE (RC-02, architecture finale, 2026-08-22) : cvDejaRelu propage
// jusqu'a bilanDemanderRelectureCv() -- verifie ici l'integration, pas
// seulement la primitive isolee (deja testee dans
// bilanRelectureConfidentialite.test.js).
test('bilanCollecterCandidature : cvDejaRelu === true saute la relecture, le cv du lecteur est utilise tel quel', async () => {
  let ecranAffiche = false;
  const deps = dependancesDeTest({
    afficherEcranRelecture: () => { ecranAffiche = true; },
    cvDejaRelu: true
  });
  const candidature = await bilanCollecterCandidature({}, deps);
  assert.equal(candidature.cv, 'Mon CV complet');
  assert.equal(candidature.confidentialiteValidee, true);
  assert.equal(ecranAffiche, false);
});

test('bilanCollecterDonneesStructureesAnalyse : passe-plat transparent vers hostDataAdapter, seul point de couplage confine a collecte/', () => {
  const lecteurs = { lireExperiencesDates: () => [{ dateDebut: 2020, dateFin: 2022 }] };
  const structure = bilanCollecterDonneesStructureesAnalyse(lecteurs);
  assert.deepEqual(structure.experiencesDates, [{ dateDebut: 2020, dateFin: 2022 }]);
});
