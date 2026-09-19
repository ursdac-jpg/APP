const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ctDemanderRelectureDocument, ctDemanderRelectureDossier } = require('../modules/coherence-transversale/collecte/relectureConfidentialite.js');

test('ctDemanderRelectureDocument : resout avec le contenu valide fourni par l\'ecran', async () => {
  const afficherEcran = (contenu, titre, callbacks) => callbacks.onValider(contenu + ' (relu)');
  const resultat = await ctDemanderRelectureDocument('Mon texte', 'CV', afficherEcran);
  assert.equal(resultat.contenuValide, 'Mon texte (relu)');
});

test('ctDemanderRelectureDocument : rejette avec RelectureAnnulee si l\'utilisateur annule', async () => {
  const afficherEcran = (contenu, titre, callbacks) => callbacks.onAnnuler();
  await assert.rejects(
    () => ctDemanderRelectureDocument('Mon texte', 'CV', afficherEcran),
    (e) => e.code === 'RelectureAnnulee'
  );
});

test('ctDemanderRelectureDossier : relit le CV PUIS la lettre, en sequence (jamais en parallele)', async () => {
  const ordreAppels = [];
  const afficherEcran = (contenu, titre, callbacks) => {
    ordreAppels.push(titre);
    callbacks.onValider(contenu);
  };
  const resultat = await ctDemanderRelectureDossier({ cv: 'Mon CV', lettre: 'Madame, Monsieur...' }, afficherEcran);
  assert.deepEqual(ordreAppels, ['CV', 'lettre de motivation']);
  assert.equal(resultat.cv, 'Mon CV');
  assert.equal(resultat.lettre, 'Madame, Monsieur...');
});

test('ctDemanderRelectureDossier : si la relecture du CV est annulee, la lettre n\'est jamais proposee', async () => {
  const ordreAppels = [];
  const afficherEcran = (contenu, titre, callbacks) => {
    ordreAppels.push(titre);
    if (titre === 'CV') { callbacks.onAnnuler(); return; }
    callbacks.onValider(contenu);
  };
  await assert.rejects(() => ctDemanderRelectureDossier({ cv: 'Mon CV', lettre: 'Madame, Monsieur...' }, afficherEcran));
  assert.deepEqual(ordreAppels, ['CV']);
});

test('ctDemanderRelectureDossier : permet de modifier le contenu pendant la relecture (ex. anonymisation manuelle)', async () => {
  const afficherEcran = (contenu, titre, callbacks) => callbacks.onValider(contenu.replace('Jean Dupont', '[Nom retiré]'));
  const resultat = await ctDemanderRelectureDossier({ cv: 'Jean Dupont, CV', lettre: 'Jean Dupont, lettre' }, afficherEcran);
  assert.equal(resultat.cv, '[Nom retiré], CV');
  assert.equal(resultat.lettre, '[Nom retiré], lettre');
});

// TACHE (chantier "depot CV/lettre/entretien via ouvrirAssistantDepotCV", 2026-08-25)

test('ctDemanderRelectureDocument : dejaValide -> resout immediatement, n\'affiche jamais l\'ecran', async () => {
  let ecranAffiche = false;
  const afficherEcran = () => { ecranAffiche = true; };
  const resultat = await ctDemanderRelectureDocument('Mon texte', 'CV', afficherEcran, true);
  assert.equal(resultat.contenuValide, 'Mon texte');
  assert.equal(ecranAffiche, false);
});

test('ctDemanderRelectureDossier : relit aussi la preparation d\'entretien si presente, apres la lettre', async () => {
  const ordreAppels = [];
  const afficherEcran = (contenu, titre, callbacks) => { ordreAppels.push(titre); callbacks.onValider(contenu); };
  const resultat = await ctDemanderRelectureDossier(
    { cv: 'Mon CV', lettre: 'Madame, Monsieur...', preparationEntretien: 'Présentation : ...' },
    afficherEcran
  );
  assert.deepEqual(ordreAppels, ['CV', 'lettre de motivation', 'préparation d’entretien']);
  assert.equal(resultat.preparationEntretien, 'Présentation : ...');
});

test('ctDemanderRelectureDossier : preparationEntretien absent -> jamais relu, resultat.preparationEntretien = null', async () => {
  const ordreAppels = [];
  const afficherEcran = (contenu, titre, callbacks) => { ordreAppels.push(titre); callbacks.onValider(contenu); };
  const resultat = await ctDemanderRelectureDossier({ cv: 'Mon CV', lettre: 'Madame, Monsieur...' }, afficherEcran);
  assert.deepEqual(ordreAppels, ['CV', 'lettre de motivation']);
  assert.equal(resultat.preparationEntretien, null);
});

test('ctDemanderRelectureDossier : dejaRelu saute la relecture des documents deja relus ailleurs (ex. via le depot)', async () => {
  const ordreAppels = [];
  const afficherEcran = (contenu, titre, callbacks) => { ordreAppels.push(titre); callbacks.onValider(contenu); };
  const resultat = await ctDemanderRelectureDossier(
    { cv: 'Mon CV', lettre: 'Madame, Monsieur...', preparationEntretien: 'Présentation : ...' },
    afficherEcran,
    { cv: true, preparationEntretien: true }
  );
  assert.deepEqual(ordreAppels, ['lettre de motivation']);
  assert.equal(resultat.cv, 'Mon CV');
  assert.equal(resultat.preparationEntretien, 'Présentation : ...');
});
