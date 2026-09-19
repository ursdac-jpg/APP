const { test } = require('node:test');
const assert = require('node:assert/strict');
const { bilanDemanderRelectureCv, BILAN_MESSAGE_TRANSPARENCE_RELECTURE } = require('../modules/bilan-candidature/collecte/relectureConfidentialite.js');

test('bilanDemanderRelectureCv : se resout avec le contenu valide par l\'utilisateur', async () => {
  const afficherEcran = (contenu, callbacks) => { callbacks.onValider(contenu + ' (relu et modifie)'); };
  const resultat = await bilanDemanderRelectureCv('CV original', afficherEcran);
  assert.equal(resultat.contenuValide, 'CV original (relu et modifie)');
});

test('bilanDemanderRelectureCv : rejette avec RelectureAnnulee si l\'utilisateur annule', async () => {
  const afficherEcran = (contenu, callbacks) => { callbacks.onAnnuler(); };
  await assert.rejects(
    () => bilanDemanderRelectureCv('CV original', afficherEcran),
    (erreur) => erreur.code === 'RelectureAnnulee'
  );
});

test('bilanDemanderRelectureCv : ne se resout jamais sans action explicite (aucun appel de callback = aucune resolution)', async () => {
  let resolu = false;
  const afficherEcran = () => {}; // ne fait rien, comme un ecran encore ouvert
  bilanDemanderRelectureCv('CV original', afficherEcran).then(() => { resolu = true; });
  await new Promise((r) => setTimeout(r, 10));
  assert.equal(resolu, false);
});

// TACHE (RC-02, architecture finale, 2026-08-22) : dejaValide -- ce texte
// a deja ete relu ailleurs (ex. depot leger), resout immediatement sans
// jamais afficher l'ecran. Capacite de la primitive elle-meme, pas un
// ecran factice injecte par un appelant.
test('bilanDemanderRelectureCv : dejaValide === true resout immediatement, sans jamais appeler afficherEcran', async () => {
  let afficherEcranAppele = false;
  const afficherEcran = () => { afficherEcranAppele = true; };
  const resultat = await bilanDemanderRelectureCv('CV deja relu ailleurs', afficherEcran, true);
  assert.equal(resultat.contenuValide, 'CV deja relu ailleurs');
  assert.equal(afficherEcranAppele, false);
});

test('bilanDemanderRelectureCv : dejaValide absent/false -> comportement normal, ecran affiche', async () => {
  let afficherEcranAppele = false;
  const afficherEcran = (contenu, callbacks) => { afficherEcranAppele = true; callbacks.onValider(contenu); };
  await bilanDemanderRelectureCv('CV a relire', afficherEcran, false);
  assert.equal(afficherEcranAppele, true);
});

test('BILAN_MESSAGE_TRANSPARENCE_RELECTURE : rappelle explicitement l\'absence d\'anonymisation automatique', () => {
  assert.match(BILAN_MESSAGE_TRANSPARENCE_RELECTURE, /Aucune anonymisation automatique/);
});
