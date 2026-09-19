const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  bilanValiderElementsRelectureAvantEcriture, bilanAppliquerElementsRelecture
} = require('../modules/bilan-candidature/assistance/ecritureRelecture.js');

function dossierAvecExperiences(experiences) {
  return { experiences: experiences };
}

function element(champs) {
  return Object.assign({
    id: 'reco-1', dimension: 'credibilite', texteActuel: null,
    texteApres: 'Texte propose.', destination: { index: 0, champ: 'missions' }
  }, champs || {});
}

// --- remplacement (Niveau 1, extrait deja identifie -- un texte existant est remplace) ---

test('remplacement : Niveau 1, un texte existant est integralement remplace par le texte propose', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Chargé de clientèle', missions: 'Gestion d\'un portefeuille diversifié.' }]);
  const el = element({
    texteActuel: 'Gestion d\'un portefeuille diversifié.',
    texteApres: 'Pilotage d\'un portefeuille de 40 comptes clients.',
    destination: { index: 0, champ: 'missions' }
  });
  bilanAppliquerElementsRelecture(dossier, [el]);
  assert.equal(dossier.experiences[0].missions, 'Pilotage d\'un portefeuille de 40 comptes clients.');
});

// --- complement (Niveau 2, action 'completer' -- le champ avait deja un contenu, enrichi) ---

test('complement : Niveau 2 action completer, le champ avait deja un contenu, remplace par la version enrichie', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Vendeur', missions: 'Accueil client.' }]);
  const el = element({
    texteActuel: 'Accueil client.',
    texteApres: 'Accueil et conseil client, avec un objectif mensuel de satisfaction de 95%.',
    destination: { index: 0, champ: 'missions' }
  });
  bilanAppliquerElementsRelecture(dossier, [el]);
  assert.equal(dossier.experiences[0].missions, 'Accueil et conseil client, avec un objectif mensuel de satisfaction de 95%.');
});

// --- creation (Niveau 2, action 'creer' -- le champ etait vide, rempli pour la premiere fois) ---

test('creation : Niveau 2 action creer, le champ etait vide, rempli pour la premiere fois', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Stagiaire', missions: '' }]);
  const el = element({
    texteActuel: null,
    texteApres: 'Participation à la refonte du site vitrine de l\'entreprise.',
    destination: { index: 0, champ: 'missions' }
  });
  bilanAppliquerElementsRelecture(dossier, [el]);
  assert.equal(dossier.experiences[0].missions, 'Participation à la refonte du site vitrine de l\'entreprise.');
});

// --- champ poste, pas seulement missions ---

test('ecrit aussi le champ poste, pas seulement missions', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Vendeur', missions: 'x' }]);
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Vendeur conseil', destination: { index: 0, champ: 'poste' } })]);
  assert.equal(dossier.experiences[0].poste, 'Vendeur conseil');
});

// --- plusieurs elements en un seul appel ---

test('applique plusieurs elements en un seul appel, chacun a son propre index', () => {
  const dossier = dossierAvecExperiences([
    { poste: 'A', missions: 'a' }, { poste: 'B', missions: 'b' }
  ]);
  bilanAppliquerElementsRelecture(dossier, [
    element({ id: 'r1', texteApres: 'A amélioré', destination: { index: 0, champ: 'poste' } }),
    element({ id: 'r2', texteApres: 'b amélioré', destination: { index: 1, champ: 'missions' } })
  ]);
  assert.equal(dossier.experiences[0].poste, 'A amélioré');
  assert.equal(dossier.experiences[1].missions, 'b amélioré');
});

// --- atomicite ---

test('atomicite : une destination invalide parmi plusieurs bloque TOUT le lot, rien n\'est ecrit', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  const valide = element({ id: 'r1', texteApres: 'nouveau texte', destination: { index: 0, champ: 'missions' } });
  const invalide = element({ id: 'r2', texteApres: 'x', destination: { index: 5, champ: 'missions' } }); // hors limites
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [valide, invalide]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
  assert.equal(dossier.experiences[0].missions, 'a'); // le premier element, pourtant valide, n'a pas ete ecrit
});

// --- defense en profondeur ---

test('index hors limites -> DestinationEcritureInvalide, aucune ecriture', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [element({ destination: { index: 3, champ: 'missions' } })]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
});

test('champ hors enumeration (ex. un champ candidature egare) -> DestinationEcritureInvalide', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [element({ destination: { index: 0, champ: 'metierCible' } })]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
});

test('destination absente -> DestinationEcritureInvalide, jamais une exception generique', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [element({ destination: null })]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
});

// --- ecriture 'ajout' (correctif "suggestion pertinente par experience", Carte 3, 2026-08-25) ---

test('ecriture "ajout" : le texte propose s\'ajoute a la suite du contenu existant, jamais ne l\'ecrase', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Assistante administrative', missions: 'Accueil physique et telephonique.\nGestion des agendas.' }]);
  bilanAppliquerElementsRelecture(dossier, [element({
    texteApres: 'Sens du service et bonne communication.',
    destination: { index: 0, champ: 'missions' },
    ecriture: 'ajout'
  })]);
  assert.equal(dossier.experiences[0].missions, 'Accueil physique et telephonique.\nGestion des agendas.\nSens du service et bonne communication.');
});

test('ecriture "ajout" sur un champ vide (creation) : pas de saut de ligne parasite en tete', () => {
  const dossier = dossierAvecExperiences([{ poste: 'Stagiaire', missions: '' }]);
  bilanAppliquerElementsRelecture(dossier, [element({
    texteApres: 'Participation a la refonte du site vitrine.',
    destination: { index: 0, champ: 'missions' },
    ecriture: 'ajout'
  })]);
  assert.equal(dossier.experiences[0].missions, 'Participation a la refonte du site vitrine.');
});

test('ecriture absente ou "remplacement" : comportement historique inchange, remplacement integral', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'Ancien texte.' }]);
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Nouveau texte complet.', destination: { index: 0, champ: 'missions' } })]);
  assert.equal(dossier.experiences[0].missions, 'Nouveau texte complet.');
});

test('ecriture "ajout" : n\'affecte jamais un autre element du meme lot ecrit en "remplacement"', () => {
  const dossier = dossierAvecExperiences([
    { poste: 'A', missions: 'Missions A existantes.' },
    { poste: 'B', missions: 'Missions B existantes.' }
  ]);
  bilanAppliquerElementsRelecture(dossier, [
    element({ id: 'r1', texteApres: 'Ajout pour A.', destination: { index: 0, champ: 'missions' }, ecriture: 'ajout' }),
    element({ id: 'r2', texteApres: 'Remplacement pour B.', destination: { index: 1, champ: 'missions' } })
  ]);
  assert.equal(dossier.experiences[0].missions, 'Missions A existantes.\nAjout pour A.');
  assert.equal(dossier.experiences[1].missions, 'Remplacement pour B.');
});

test('tableau vide -> aucun effet, jamais une exception', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.doesNotThrow(() => bilanAppliquerElementsRelecture(dossier, []));
  assert.equal(dossier.experiences[0].missions, 'a');
});

test('bilanValiderElementsRelectureAvantEcriture : reutilisable seule, sans effet de bord', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.doesNotThrow(() => bilanValiderElementsRelectureAvantEcriture(dossier, [element()]));
  assert.equal(dossier.experiences[0].missions, 'a'); // valider seul n'ecrit jamais
});

// --- chantier "enrichissement CV legers via experiencesPerso" (2026-08-22) ---

test('destination.liste absent -> ecrit dans dossier.experiences (retrocompatible, comportement inchange)', () => {
  const dossier = { experiences: [{ poste: 'A', missions: 'a' }], experiencesPerso: [{ intitule: 'B', missions: 'b' }] };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'a amélioré', destination: { index: 0, champ: 'missions' } })]);
  assert.equal(dossier.experiences[0].missions, 'a amélioré');
  assert.equal(dossier.experiencesPerso[0].missions, 'b'); // jamais touche
});

test('destination.liste = experiencesPerso, champ missions -> ecrit dans dossier.experiencesPerso, jamais dossier.experiences', () => {
  const dossier = { experiences: [{ poste: 'A', missions: 'a' }], experiencesPerso: [{ intitule: 'Aide au garage', missions: 'b' }] };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'b amélioré', destination: { liste: 'experiencesPerso', index: 0, champ: 'missions' } })]);
  assert.equal(dossier.experiencesPerso[0].missions, 'b amélioré');
  assert.equal(dossier.experiences[0].missions, 'a'); // jamais touche
});

test('destination.liste = experiencesPerso, champ poste -> ecrit dans intitule (correspondance de champ), jamais un champ "poste" inexistant', () => {
  const dossier = { experiences: [], experiencesPerso: [{ intitule: 'Aide au garage', missions: 'b' }] };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Mécanicien amateur', destination: { liste: 'experiencesPerso', index: 0, champ: 'poste' } })]);
  assert.equal(dossier.experiencesPerso[0].intitule, 'Mécanicien amateur');
  assert.equal(dossier.experiencesPerso[0].poste, undefined);
});

test('destination.liste inconnue -> DestinationEcritureInvalide, jamais une ecriture dans un tableau au hasard', () => {
  const dossier = dossierAvecExperiences([{ poste: 'A', missions: 'a' }]);
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [element({ destination: { liste: 'formations', index: 0, champ: 'missions' } })]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
});

// --- chantier "titre et accroche du CV" (2026-08-25) : destination.liste = 'dossier' ---

test('destination.liste = dossier, champ titreCV -> ecrit dossier.titreCV, aucun index requis', () => {
  const dossier = { titreCV: '', experiences: [] };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Chargé de clientèle', destination: { liste: 'dossier', champ: 'titreCV' } })]);
  assert.equal(dossier.titreCV, 'Chargé de clientèle');
});

test('destination.liste = dossier, champ accroche -> ecrit dossier.ia.cv.profil, meme champ que l\'ancien module', () => {
  const dossier = { experiences: [] };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Professionnelle engagée, 5 ans d\'expérience en relation client.', destination: { liste: 'dossier', champ: 'accroche' } })]);
  assert.equal(dossier.ia.cv.profil, 'Professionnelle engagée, 5 ans d\'expérience en relation client.');
});

test('destination.liste = dossier, champ accroche : dossier.ia deja present -> jamais ecrase, seul .cv.profil est touche', () => {
  const dossier = { experiences: [], ia: { cv: { pointsForts: ['Rigueur'] }, lettre: { accroche: 'x' } } };
  bilanAppliquerElementsRelecture(dossier, [element({ texteApres: 'Nouvelle accroche.', destination: { liste: 'dossier', champ: 'accroche' } })]);
  assert.equal(dossier.ia.cv.profil, 'Nouvelle accroche.');
  assert.deepEqual(dossier.ia.cv.pointsForts, ['Rigueur']);
  assert.equal(dossier.ia.lettre.accroche, 'x');
});

test('destination.liste = dossier, ecriture "ajout" : se comporte comme pour une experience, ajoute a la suite', () => {
  const dossier = { titreCV: 'Ancien titre', experiences: [] };
  bilanAppliquerElementsRelecture(dossier, [element({
    texteApres: 'complément', destination: { liste: 'dossier', champ: 'titreCV' }, ecriture: 'ajout'
  })]);
  assert.equal(dossier.titreCV, 'Ancien titre\ncomplément');
});

test('destination.liste = dossier, champ hors enumeration -> DestinationEcritureInvalide, aucune ecriture', () => {
  const dossier = { experiences: [], metierCible: 'Vendeur' };
  assert.throws(
    () => bilanAppliquerElementsRelecture(dossier, [element({ destination: { liste: 'dossier', champ: 'metierCible' } })]),
    (erreur) => erreur.code === 'DestinationEcritureInvalide'
  );
  assert.equal(dossier.metierCible, 'Vendeur');
});
