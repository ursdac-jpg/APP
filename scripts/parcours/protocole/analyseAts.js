/* Protocole : carte « Outils d'analyse », tuile « Les mots de votre CV (ATS) » (route ats). Réponse de l'assistant SIMULÉE (format de prompts/ats.md). */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const REPONSE_ATS = {
  analyseImpossible: false, cvPeuFourni: false, referenceFaible: false, texteCache: { suspect: false },
  dejaExprime: [{ terme: 'accueil du public', origine: 'fiche-metier' }],
  peutEtreFormuleAutrement: [{ terme: 'orientation des visiteurs', origine: 'fiche-metier', extraitCV: 'Accueil et orientation des habitants', piste: 'Reprendre le mot « visiteurs » si cela correspond à votre expérience.' }],
  pasRetrouve: [{ terme: 'gestion des conflits', origine: 'fiche-metier', note: 'À ajouter seulement si vous l’avez réellement pratiqué.' }],
  aVerifier: [], changementsPrioritaires: [{ phraseCV: 'Accueil et orientation des habitants', motReference: 'visiteurs', condition: 'si vous accueilliez aussi des visiteurs', experienceConcernee: 'Mairie de Bergerac' }],
  sansOffre: { motsPrioritaires: ['accueil', 'orientation', 'public'], clarificationProjet: 'Précisez le type de structure visé.' }, sources: []
};
module.exports = {
  nom: 'analyseAts',
  REPONSE_ATS,
  jouer: async (a, j) => {
    await R.deposerCv(a, j, 'ats', '#btnAtsCommencer', 'Les mots de votre CV');
    let e = await a.ecran();
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('ats : « Continuer » devrait être grisé avec une raison tant que la référence n’est pas choisie (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('ats : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    j.info('métier précis : ' + await a.clic('', '^Un métier précis$')); await a.attendre(600);
    await a.saisir('#rechercheMetierCibleInput', 'agent d’accueil'); await a.attendre(700);
    j.info('métier saisi : ' + await a.clic('#btnValiderMetierSaisi')); await a.attendre(800);
    j.info('domaine : ' + await a.clic('.carte-domaine-metier', 'Administration') + ' / ' + await a.clic('[data-domaine-metier-confirmer]')); await a.attendre(900);
    e = await a.ecran(); j.info('après le métier : « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('ats : « Continuer » reste grisé alors que CV et métier sont donnés (' + e.raison + ')'); } else { j.ok('ats : « Continuer » dégrisé'); }
    await E.retourPuisReprendre(a, j, 'ats', async () => {
      const t = await a.ev(() => ({ metier: /agent d’accueil/i.test(document.getElementById('app').innerText) }));
      const bas = await a.ecran();
      return (!/grisé/.test(bas.avant || '') && t.metier) ? true : JSON.stringify(t) + ' bas ' + bas.avant + ' ' + bas.raison;
    });
    e = await a.ecran();
    j.info('encart de reprise sur la page Préparer : ' + (await a.ev(() => !!document.querySelector('#app .encart-reprise-module'))) + ' | bas « ' + e.avant + ' »');
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await a.verifier({ hash: '#ats', etape: 'Assistant' });
    await E.collerEtParcourir(a, j, 'ats', REPONSE_ATS, 1);
    // « Recommencer » : retour à la présentation, confirmation, annulation, puis remise à froid.
    await a.aller('ats-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'ats', 'btnAtsRepriseRecommencer');
  }
};
