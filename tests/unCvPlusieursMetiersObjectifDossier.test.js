const { test } = require('node:test');
const assert = require('node:assert/strict');

// Adaptateur brouillon d'objectif <-> forme du dossier de la lettre (chantier F14, 24/10/2026) : fonctions pures, aucun DOM.
const base = require('../modules/un-cv-plusieurs-metiers/logique.js');
global.UCPM_MAX_METIERS = base.UCPM_MAX_METIERS;
global.UCPM_MIN_METIERS_POUR_CREER = base.UCPM_MIN_METIERS_POUR_CREER;
const m = require('../modules/un-cv-plusieurs-metiers/logiqueMetiers.js');
const a = require('../modules/un-cv-plusieurs-metiers/logiqueObjectifDossier.js');
const { raisonsBlocageLettreCo } = require('../modules/lettre-core/raisonsBlocageLettreCo.js');
const TYPES = ['Entreprise privée', 'Association', 'Collectivité'];

function brouillon(demarche, plus) { return Object.assign(m.ucpmObjectifVide(demarche), plus || {}); }

test('le brouillon porte la forme, l’intitulé et les horaires, et la normalisation les garde', () => {
  const o = m.ucpmNormaliserObjectif(brouillon('spontanee', { forme: 'generale', intitule: 'Plaquiste', horaires: ['Jour', 'Soir'] }));
  assert.equal(o.forme, 'generale');
  assert.equal(o.intitule, 'Plaquiste');
  assert.deepEqual(o.horaires, ['Jour', 'Soir']);
  assert.deepEqual(m.ucpmObjectifVide('offre').horaires, []);
});

test('les prompts reçoivent la forme, l’intitulé mis en avant et les horaires', () => {
  const t = m.ucpmDetailsObjectif(brouillon('spontanee', { forme: 'entreprise', cible: 'secteur', secteur: 'Bâtiment', intitule: 'Plaquiste', horaires: ['Jour'] }));
  assert.match(t, /intitulé mis en avant[^;]*: Plaquiste/);
  assert.match(t, /candidature : adressée à une entreprise précise, sans offre/);
  assert.match(t, /horaires acceptés : Jour/);
});

test('forme de candidature <-> typeRecherche et formeChoisie', () => {
  assert.deepEqual(a.ucpmFormeVersDossier('offre', ''), { typeRecherche: 'offre', formeChoisie: 'offre' });
  assert.deepEqual(a.ucpmFormeVersDossier('spontanee', 'generale'), { typeRecherche: 'simple', formeChoisie: null });
  assert.deepEqual(a.ucpmFormeVersDossier('spontanee', 'entreprise'), { typeRecherche: 'offre', formeChoisie: 'entreprise' });
  assert.deepEqual(a.ucpmFormeVersDossier('reconversion', 'offre'), { typeRecherche: 'offre', formeChoisie: 'offre' });
  assert.deepEqual(a.ucpmFormeVersDossier('spontanee', ''), { typeRecherche: null, formeChoisie: null });
  ['generale', 'entreprise'].forEach((f) => { const x = a.ucpmFormeVersDossier('spontanee', f); assert.equal(a.ucpmFormeDepuisDossier('spontanee', x.typeRecherche, x.formeChoisie, 'metier'), f); });
  ['generale', 'entreprise', 'offre'].forEach((f) => { const x = a.ucpmFormeVersDossier('reconversion', f); assert.equal(a.ucpmFormeDepuisDossier('reconversion', x.typeRecherche, x.formeChoisie, 'metier'), f); });
});

test('hors famille emploi : pas de forme de dossier', () => {
  assert.equal(a.ucpmObjectifVersDossier(brouillon('stage'), {}), null);
  assert.equal(a.ucpmEstDemarcheEmploi('pmsmp'), false);
  assert.equal(a.ucpmEstDemarcheEmploi('reconversion'), true);
});

test('aller-retour d’une spontanée vers une entreprise précise, secteur et intitulé', () => {
  const o = brouillon('spontanee', {
    forme: 'entreprise', cible: 'secteur', secteur: 'Bâtiment', intitule: 'Plaquiste', employeur: 'Maçonnerie Martin', typeStructure: 'Autre', typeStructureAutre: 'Coopérative',
    civiliteRecruteur: 'Madame', nomRecruteur: 'Durand', contrat: ['CDI'], tempsTravail: ['Temps plein'], horaires: ['Jour'], disponibleA: 'Immédiatement'
  });
  const d = a.ucpmObjectifVersDossier(o, { base: { prenom: 'inchangé', rechercheCandidature: { couleurEntreprise: 'x' } }, typesStructure: TYPES });
  assert.equal(d.objectif, 'spontanee');
  assert.equal(d.modeRecherche, 'domaine');
  assert.equal(d.secteurCible, 'Bâtiment');
  assert.deepEqual(d.intituleDomaine, { secteur: 'Bâtiment', intitule: 'Plaquiste' });
  assert.equal(d.typeRecherche, 'offre');
  assert.equal(d.formeChoisie, 'entreprise');
  assert.equal(d.rechercheCandidature.entreprise, 'Maçonnerie Martin');
  assert.equal(d.rechercheCandidature.typeStructure, 'Coopérative');
  assert.equal(d.rechercheCandidature.couleurEntreprise, 'x');      // ce que le brouillon ne connaît pas est conservé
  assert.deepEqual(d.spontanee.dispo, ['Immédiatement']);
  assert.equal(d.metierCible, '');
  const retour = a.ucpmObjectifDepuisDossier(d, o, { typesStructure: TYPES });
  assert.deepEqual(retour, o);
});

test('aller-retour d’une réponse à une offre : texte de l’offre, poste, type de structure de la liste', () => {
  const o = brouillon('offre', { employeur: 'Boulangerie Lenoir', posteOffre: 'Vendeur', texteOffre: 'Vendeur en boulangerie, CDI.', typeStructure: 'Association' });
  const d = a.ucpmObjectifVersDossier(o, { typesStructure: TYPES });
  assert.equal(d.modeRecherche, 'metier');
  assert.equal(d.typeRecherche, 'offre');
  assert.equal(d.rechercheCandidature.texteOffre, 'Vendeur en boulangerie, CDI.');
  assert.equal(d.offre.poste, 'Vendeur');
  const retour = a.ucpmObjectifDepuisDossier(d, o, { typesStructure: TYPES });
  assert.equal(retour.forme, 'offre');
  assert.equal(retour.posteOffre, 'Vendeur');
  assert.equal(retour.typeStructure, 'Association');
  assert.equal(retour.typeStructureAutre, '');
});

test('les choix faits dans la brique reviennent dans le brouillon (changer de forme, vider un champ)', () => {
  const o = brouillon('reconversion', { forme: 'generale', cible: 'metier', ancienType: 'metier', ancienValeur: 'plaquiste' });
  const d = a.ucpmObjectifVersDossier(o, { typesStructure: TYPES });
  d.typeRecherche = 'offre'; d.formeChoisie = 'entreprise'; d.rechercheCandidature.entreprise = 'Atelier Roux'; d.horaires = ['Soir', 'Nuit']; d.reconversion.dispo = ['Sous 15 jours'];
  const retour = a.ucpmObjectifDepuisDossier(d, o, { typesStructure: TYPES });
  assert.equal(retour.forme, 'entreprise');
  assert.equal(retour.employeur, 'Atelier Roux');
  assert.deepEqual(retour.horaires, ['Soir', 'Nuit']);
  assert.equal(retour.disponibleA, 'Sous 15 jours');
  assert.equal(retour.ancienValeur, 'plaquiste');                  // champ propre au module : conservé
  d.reconversion.dispo = [];
  assert.equal(a.ucpmObjectifDepuisDossier(d, retour, { typesStructure: TYPES }).disponibleA, '');
});

test('raisons de blocage : les règles de la lettre, sans le CV ni la situation', () => {
  const R = (o, un) => a.ucpmRaisonsObjectif(o, un, raisonsBlocageLettreCo);
  assert.deepEqual(R(null, true), ['choisir un objectif']);
  assert.deepEqual(R(brouillon('stage'), true), []);
  assert.deepEqual(R(brouillon('offre'), true), []);                                        // une offre sans offre devient une spontanée : ne bloque pas
  assert.equal(R(brouillon('spontanee'), true).length, 1);                                    // la forme n'est pas dite
  assert.deepEqual(R(brouillon('spontanee', { forme: 'generale', cible: 'metier' }), true), []);
  assert.equal(R(brouillon('spontanee', { forme: 'entreprise', cible: 'metier' }), true).length, 1);   // entreprise précise sans nom, pour un seul métier
  assert.deepEqual(R(brouillon('spontanee', { forme: 'entreprise', cible: 'metier' }), false), []);    // plusieurs métiers : jamais le nom
  assert.ok(R(brouillon('spontanee', { forme: 'generale', cible: 'secteur', secteur: 'Bâtiment' }), true).some((x) => /intitulé/.test(x)));
  assert.deepEqual(R(brouillon('spontanee', { forme: 'generale', cible: 'secteur', secteur: 'Bâtiment', intitule: 'Plaquiste' }), true), []);
  assert.equal(R(brouillon('reconversion'), true).length, 1);
});
