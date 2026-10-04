const { test } = require('node:test');
const assert = require('node:assert/strict');

const { bilanTrouverExperienceParExtrait, bilanResoudreDestinationCorrection } = require('../modules/bilan-candidature/correction/resolutionDestination.js');
const { BILAN_CATALOGUE_AXES } = require('../modules/bilan-candidature/analyse/axeAnalyseRegistry.js');

const EXPERIENCES = [
  { index: 0, poste: 'Chargée de clientèle', missions: 'Gestion d\'un portefeuille diversifié.' },
  { index: 1, poste: 'Assistante commerciale', missions: 'Accueil et suivi administratif.' }
];

function reco(champs) {
  return Object.assign({ id: 'reco-1', contenu: 'x', dimensionsLiees: ['credibilite'], priorite: 'haute', extraitConcerne: null, observationsLiees: ['obs-1'] }, champs);
}

test('bilanTrouverExperienceParExtrait : extrait present mot pour mot dans missions -> experience trouvee, champ identifie', () => {
  const trouve = bilanTrouverExperienceParExtrait('Gestion d\'un portefeuille diversifié', EXPERIENCES);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.champ, 'missions');
});

// TACHE (brique 4, evolutivite) : poste et missions sont cherches
// separement (jamais un champ concatene) -- verifie ici que le champ
// "poste" est bien identifiable independamment de "missions", condition
// necessaire pour qu'une future application automatique sache ECRIRE au
// bon endroit (voir hostDataAdapter.js et resolutionDestination.js).
test('bilanTrouverExperienceParExtrait : extrait present dans poste -> champ identifie comme poste', () => {
  const trouve = bilanTrouverExperienceParExtrait('Chargée de clientèle', EXPERIENCES);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.champ, 'poste');
});

test('bilanTrouverExperienceParExtrait : extrait reformule (non verbatim) -> aucune correspondance', () => {
  assert.equal(bilanTrouverExperienceParExtrait('gestion de portefeuilles variés', EXPERIENCES), null);
});

// TACHE (retour Denis 2026-09-20, Carte 3 "Vos chiffres" disparue par
// intermittence) : la comparaison tolere desormais la mise en forme
// (casse, espaces, ponctuation legere), jamais une reformulation reelle
// (voir le test juste au-dessus, toujours null).
test('bilanTrouverExperienceParExtrait : casse differente -> correspondance quand meme', () => {
  const trouve = bilanTrouverExperienceParExtrait('gestion d\'un portefeuille diversifié', EXPERIENCES);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.champ, 'missions');
});
test('bilanTrouverExperienceParExtrait : espaces multiples/differents -> correspondance quand meme', () => {
  const trouve = bilanTrouverExperienceParExtrait('Gestion  d\'un   portefeuille diversifié', EXPERIENCES);
  assert.equal(trouve.index, 0);
});
test('bilanTrouverExperienceParExtrait : apostrophe/guillemets courbes vs droits -> correspondance quand meme', () => {
  const trouve = bilanTrouverExperienceParExtrait('Gestion d’un portefeuille diversifié', EXPERIENCES);
  assert.equal(trouve.index, 0);
});
test('bilanTrouverExperienceParExtrait : espace avant une ponctuation -> correspondance quand meme', () => {
  const trouve = bilanTrouverExperienceParExtrait('Accueil et suivi administratif .', EXPERIENCES);
  assert.equal(trouve.index, 1);
});
// TACHE (retour Denis 2026-09-20, bug reel confirme avec un vrai JSON de
// diagnostic) : un extrait citant plusieurs missions a la suite, separees
// par des doubles sauts de ligne (comme l'assistant les percoit), doit
// matcher des missions jointes cote code par ". " (joindreMissionsImport(),
// js/app.js) -- meme mots, separateur different, toujours une correspondance.
test('bilanTrouverExperienceParExtrait : plusieurs missions citees a la suite, separees par des sauts de ligne au lieu de points -> correspondance quand meme', () => {
  const missionsJointes = { index: 0, poste: 'Assistante administrative', missions: 'Gestion des agendas. Organisation de réunions. Mise à jour des tableaux Excel. Relation avec les fournisseurs.' };
  const trouve = bilanTrouverExperienceParExtrait('Gestion des agendas \n\nOrganisation de réunions \n\nMise à jour des tableaux Excel \n\nRelation avec les fournisseurs', [missionsJointes]);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.champ, 'missions');
});
// TACHE (retour Denis 2026-09-20, bug reel confirme : reprise de la Carte 3
// atterrissant sur un ecran/une fenetre etrangers a la recommandation) :
// un extrait qui cite une liste de missions commence parfois par une
// etiquette de rubrique ("Missions :") avant la liste elle-meme -- cette
// etiquette ne fait jamais partie du champ missions du dossier, donc la
// recherche de sous-chaine echouait toujours des qu'elle etait presente.
test('bilanTrouverExperienceParExtrait : extrait precede de l\'etiquette "Missions :" -> etiquette ignoree, correspondance quand meme', () => {
  const experience = { index: 0, poste: 'Assistante administrative', missions: 'Accueil physique et téléphonique. Gestion des courriers et des e-mails. Saisie de devis et de factures.' };
  const trouve = bilanTrouverExperienceParExtrait('Missions :\n\nAccueil physique et téléphonique \n\nGestion des courriers et des e-mails \n\nSaisie de devis et de factures', [experience]);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.champ, 'missions');
});

// TACHE (retour Denis 2026-09-20, bug reel confirme avec un vrai JSON de
// diagnostic, 2 recommandations touchees) : un extrait citant le poste PUIS,
// colle, l'entreprise/les dates/toutes les missions ("Assistante
// administrative Entreprise : ABC Services..." en une seule chaine) ne
// matchait ni poste ni missions pris separement -- jamais une simple
// citation d'UN champ. Doit tout de meme rattacher a la bonne experience,
// via le poste qui ouvre l'extrait (repli, jamais une comparaison floue :
// seuil de longueur minimal pour eviter un intitule trop court/generique).
test('bilanTrouverExperienceParExtrait : extrait combinant poste + entreprise + dates + missions en un seul bloc -> rattache via le poste qui ouvre l\'extrait', () => {
  const extraitReel = "Assistante administrative\n\nEntreprise : ABC Services - BergeracPériode : Mars 2023 - Aujourd'hui\n\nMissions :\n\nAccueil physique et téléphonique \n\nGestion des courriers et des e-mails \n\nSaisie de devis et de factures";
  const experiencesReelles = [{ index: 0, poste: 'Assistante administrative', missions: 'Accueil physique et téléphonique. Gestion des courriers et des e-mails. Saisie de devis et de factures.' }];
  const trouveReel = bilanTrouverExperienceParExtrait(extraitReel, experiencesReelles);
  assert.equal(trouveReel.index, 0);
  assert.equal(trouveReel.champ, 'poste');
});
test('bilanTrouverExperienceParExtrait : intitule court/generique -> jamais de rattachement par ce repli (evite un faux positif par coincidence)', () => {
  const experiencesCourtes = [{ index: 0, poste: 'Agent', missions: 'x' }];
  const trouve = bilanTrouverExperienceParExtrait('Agent immobilier independant, rien a voir avec le CV', experiencesCourtes);
  assert.equal(trouve, null);
});

test('bilanTrouverExperienceParExtrait : extrait/liste vides -> null, jamais d\'exception', () => {
  assert.equal(bilanTrouverExperienceParExtrait(null, EXPERIENCES), null);
  assert.equal(bilanTrouverExperienceParExtrait('x', []), null);
  assert.equal(bilanTrouverExperienceParExtrait('x', null), null);
});

test('cascade niveau 1 : extraitConcerne retrouve verbatim -> resolution precise vers l\'experience', () => {
  const r = reco({ extraitConcerne: 'Accueil et suivi administratif' });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'extrait');
  assert.equal(res.cible.index, 1);
  assert.equal(res.cible.champ, 'missions');
  assert.equal(res.libelle, 'Assistante commerciale');
});

test('cascade niveau 2 (repli) : extraitConcerne absent -> resolution par axe', () => {
  const r = reco({ extraitConcerne: null, dimensionsLiees: ['risques'] });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'axe');
  assert.equal(res.cible, 'experiences');
});

// TACHE (brique 3, correction du 2026-08-10) : lisibilite est un cas
// particulier du repli sur axe -- sa cible ('texte-libre') est traitee
// comme la branche structurationDisponible === false, jamais comme un
// axe classique (voir destinationRegistry.js, "DECISION (brique 3)").
test('cascade niveau 2 (repli), cas lisibilite : jamais un ecran precis, meme resultat que structurationDisponible === false', () => {
  const r = reco({ extraitConcerne: null, dimensionsLiees: ['lisibilite'] });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'texte-libre');
  assert.equal(res.cible, null);
});

test('cascade niveau 2 (repli) : extraitConcerne fourni mais introuvable -> resolution par axe, jamais une exception', () => {
  const r = reco({ extraitConcerne: 'un texte qui n\'existe nulle part dans le CV', dimensionsLiees: ['adequation'] });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'axe');
  // TACHE (correctif audit Niveau 2, 2026-08-11) : adequation route vers
  // 'candidature' (metier vise choisi dans ce bloc), plus 'projet-professionnel'.
  assert.equal(res.cible, 'candidature');
});

test('structurationDisponible === false : court-circuite entierement la cascade, meme avec un extrait qui matcherait', () => {
  const r = reco({ extraitConcerne: 'accueil et suivi administratif' });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: false }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'texte-libre');
  assert.equal(res.cible, null);
});

// TACHE (RC-02, Vague 3, 2026-08-22) : regression -- avant l'unification
// du signal, un CV jamais structure (aucune experience, mais pas passe
// par la population 'pret') pouvait echapper au court-circuit et tenter
// une resolution par axe sur une liste vide. structurationDisponible
// couvre desormais ce cas au meme titre que 'pret'.
test('structurationDisponible === false (CV jamais structure, hors population pret) : meme repli texte-libre', () => {
  const r = reco({ extraitConcerne: null, dimensionsLiees: ['risques'] });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: [], structurationDisponible: false }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'texte-libre');
  assert.equal(res.cible, null);
});

test('recommandation liee a plusieurs axes : le plus determinant pilote la resolution par repli', () => {
  const r = reco({ extraitConcerne: null, dimensionsLiees: ['lisibilite', 'credibilite'] });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: EXPERIENCES, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'axe');
  assert.equal(res.cible, 'experiences'); // credibilite (determinant) l'emporte sur lisibilite (amplificateur)
});

test('donnees minimales/absentes : ne leve jamais d\'exception, retombe sur texte-libre', () => {
  const res = bilanResoudreDestinationCorrection(reco({ dimensionsLiees: [] }), {}, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'texte-libre');
});

// --- chantier "enrichissement CV legers via experiencesPerso" (2026-08-22) ---

test('bilanTrouverExperienceParExtrait : matche aussi une experience personnelle (liste=experiencesPerso), liste propagee dans le resultat', () => {
  const experiencesMixtes = [
    { index: 0, liste: 'experiences', poste: 'Chargée de clientèle', missions: 'Gestion d\'un portefeuille diversifié.' },
    { index: 0, liste: 'experiencesPerso', poste: 'Aide au garage familial', missions: 'Réparations mécaniques simples.' }
  ];
  const trouve = bilanTrouverExperienceParExtrait('Réparations mécaniques simples', experiencesMixtes);
  assert.equal(trouve.index, 0);
  assert.equal(trouve.liste, 'experiencesPerso');
  assert.equal(trouve.champ, 'missions');
});

test('bilanTrouverExperienceParExtrait : element sans liste explicite -> liste par defaut "experiences" dans le resultat', () => {
  const trouve = bilanTrouverExperienceParExtrait('Chargée de clientèle', EXPERIENCES);
  assert.equal(trouve.liste, 'experiences');
});

test('cascade niveau 1 : extrait retrouve dans une experience personnelle -> resolution precise, liste experiencesPerso propagee', () => {
  const experiencesMixtes = [
    { index: 0, liste: 'experiencesPerso', poste: 'Aide au garage familial', missions: 'Réparations mécaniques simples.' }
  ];
  const r = reco({ extraitConcerne: 'Réparations mécaniques simples' });
  const res = bilanResoudreDestinationCorrection(r, { experiencesTexte: experiencesMixtes, structurationDisponible: true }, BILAN_CATALOGUE_AXES);
  assert.equal(res.type, 'extrait');
  assert.equal(res.cible.liste, 'experiencesPerso');
  assert.equal(res.cible.index, 0);
});
