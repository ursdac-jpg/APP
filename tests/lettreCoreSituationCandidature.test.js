const { test } = require('node:test');
const assert = require('node:assert/strict');

// Situation réelle d'une candidature (page « Préparer » de la lettre) : l'offre décide, pas la carte cliquée.
const { aUneOffreLettreCo, situationReelleLettreCo, messageSansOffreLettreCo, candidatureGeneraleCompleteLettreCo, changementCarteEffaceLettreCo, formeCandidatureLettreCo, coLettreEnCoursLettreCo } = require('../modules/lettre-core/situationCandidatureLettreCo.js');

test('aUneOffreLettreCo : le texte ou le lien suffisent, des espaces seuls ne comptent pas', () => {
  assert.equal(aUneOffreLettreCo(), false);
  assert.equal(aUneOffreLettreCo({ texteOffre: '   ', lienOffre: '' }), false);
  assert.equal(aUneOffreLettreCo({ texteOffre: 'Poste de vendeur', lienOffre: '' }), true);
  assert.equal(aUneOffreLettreCo({ texteOffre: '', lienOffre: 'https://exemple.fr/offre' }), true);
});

test('carte offre : avec offre = offre ; sans offre = spontanée, avec ou sans entreprise', () => {
  assert.equal(situationReelleLettreCo({ objectif: 'offre', typeRecherche: 'offre', rechercheCandidature: { entreprise: 'XEFI', texteOffre: 'Technicien' } }), 'offre');
  assert.equal(situationReelleLettreCo({ objectif: 'offre', typeRecherche: 'offre', rechercheCandidature: { entreprise: 'XEFI' } }), 'spontanee_entreprise');
  assert.equal(situationReelleLettreCo({ objectif: 'offre', typeRecherche: 'offre', rechercheCandidature: { entreprise: ' ' } }), 'spontanee_generale');
  assert.equal(situationReelleLettreCo({ objectif: 'offre' }), 'spontanee_generale');
});

test('carte spontanée : « offre » veut dire entreprise précise, « simple » veut dire de façon générale', () => {
  assert.equal(situationReelleLettreCo({ objectif: 'spontanee', typeRecherche: 'offre', rechercheCandidature: { entreprise: 'XEFI' } }), 'spontanee_entreprise');
  assert.equal(situationReelleLettreCo({ objectif: 'spontanee', typeRecherche: 'simple' }), 'spontanee_generale');
  assert.equal(situationReelleLettreCo({ objectif: 'spontanee' }), 'spontanee_generale');
});

test('autres cartes : la situation est la carte elle-même', () => {
  for (const o of ['reconversion', 'stage', 'alternance', 'pmsmp', 'formation']) { assert.equal(situationReelleLettreCo({ objectif: o }), o); }
  assert.equal(situationReelleLettreCo({}), null);
});

test('messageSansOffreLettreCo : nomme l\'entreprise quand elle est saisie', () => {
  assert.equal(messageSansOffreLettreCo('XEFI'), 'Comme vous n’avez pas saisi d’offre d’emploi, votre candidature sera traitée comme une candidature spontanée auprès de : XEFI.');
  assert.equal(messageSansOffreLettreCo(''), 'Comme vous n’avez pas saisi d’offre d’emploi, votre candidature sera traitée comme une candidature spontanée.');
  assert.equal(messageSansOffreLettreCo('  Boulangerie Dupont '), 'Comme vous n’avez pas saisi d’offre d’emploi, votre candidature sera traitée comme une candidature spontanée auprès de : Boulangerie Dupont.');
});

test('candidatureGeneraleCompleteLettreCo : spontanée générale avec métier ou domaine choisi', () => {
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'spontanee', typeRecherche: 'simple', modeRecherche: 'metier', metierCible: 'Plombier' }), true);
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'spontanee', typeRecherche: 'simple', modeRecherche: 'domaine', secteurCible: 'Bâtiment' }), false);   // l'intitulé manque
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'spontanee', typeRecherche: 'simple', modeRecherche: 'domaine', secteurCible: 'Bâtiment', intituleDomaine: 'Aide-maçon polyvalent' }), true);
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'spontanee', typeRecherche: 'simple', modeRecherche: 'metier', metierCible: ' ' }), false);
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'spontanee', typeRecherche: 'offre', modeRecherche: 'metier', metierCible: 'Plombier' }), false);
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'offre', typeRecherche: 'simple', modeRecherche: 'metier', metierCible: 'Plombier' }), false);
});

test('changementCarteEffaceLettreCo : seulement entre offre, spontanée et changer de métier', () => {
  assert.equal(changementCarteEffaceLettreCo('offre', 'spontanee'), true);
  assert.equal(changementCarteEffaceLettreCo('spontanee', 'reconversion'), true);
  assert.equal(changementCarteEffaceLettreCo('offre', 'offre'), false);
  assert.equal(changementCarteEffaceLettreCo(null, 'offre'), false);
  assert.equal(changementCarteEffaceLettreCo('stage', 'offre'), false);
  assert.equal(changementCarteEffaceLettreCo('offre', 'stage'), false);
});

test('candidatureGeneraleCompleteLettreCo : vaut aussi pour changer de métier', () => {
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'reconversion', typeRecherche: 'simple', modeRecherche: 'metier', metierCible: 'Aide-soignant' }), true);
  assert.equal(candidatureGeneraleCompleteLettreCo({ objectif: 'reconversion', typeRecherche: 'offre', modeRecherche: 'metier', metierCible: 'Aide-soignant' }), false);
});

test('formeCandidatureLettreCo : générale, offre ou entreprise précise sans offre', () => {
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'simple', modeRecherche: 'metier' }), 'generale');
  assert.equal(formeCandidatureLettreCo({}), null);
  // avec une offre saisie : toujours « offre »
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'metier', rechercheCandidature: { texteOffre: 'Poste' }, formeChoisie: 'entreprise' }), 'offre');
  // sans offre : le choix fait à l'écran décide
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'metier', rechercheCandidature: {}, formeChoisie: 'entreprise' }), 'entreprise');
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'metier', rechercheCandidature: {}, formeChoisie: 'offre' }), 'offre');
  // choix perdu (page rechargée) : l'entreprise saisie départage
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'metier', rechercheCandidature: { entreprise: 'XEFI' } }), 'entreprise');
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'metier', rechercheCandidature: {} }), 'offre');
  // domaine : jamais d'offre
  assert.equal(formeCandidatureLettreCo({ typeRecherche: 'offre', modeRecherche: 'domaine', rechercheCandidature: { texteOffre: 'x' }, formeChoisie: 'offre' }), 'entreprise');
});

test("coLettreEnCoursLettreCo : le drapeau d'une lettre écrite avec l'assistant ne vaut jamais pour un CV (F6)", () => {
  assert.equal(coLettreEnCoursLettreCo({ _origineCoLettre: true }, 'lettre'), true);
  assert.equal(coLettreEnCoursLettreCo({ _origineCoLettre: true }, 'entretien'), true);
  assert.equal(coLettreEnCoursLettreCo({ _origineCoLettre: true }, 'cv'), false);
  assert.equal(coLettreEnCoursLettreCo({}, 'lettre'), false);
  assert.equal(coLettreEnCoursLettreCo(null, 'lettre'), false);
});
