/* Protocole : carte « Vous hésitez encore ? », tuile « Un CV, plusieurs métiers » (route un-cv-plusieurs-metiers-intro). Réponse de l'assistant SIMULÉE (format de prompts/ucpm-metiers.md).
   Seules les premières étapes (dépôt, métiers proposés, étape suivante) sont jouées ici ; les huit étapes complètes ont leurs essais dans scripts/parcours/parcours_smoke.js. */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const REPONSE_METIERS = {
  synthese: { metier: 'Agent d’accueil', competencesCles: ['Accueil du public', 'Gestion du standard'], experiences: [{ intitule: 'Agent d’accueil, mairie de Bergerac', missionsPrincipales: ['Accueillir et orienter les habitants'], competencesRetirees: ['Écoute', 'Organisation'] }] },
  intitulesMemeMetier: [{ intituleMasculin: 'Agent d’accueil', intituleFeminin: 'Agente d’accueil', retrouveDansLeCV: 'Accueil et orientation des habitants' }, { intituleMasculin: 'Hôte d’accueil', intituleFeminin: 'Hôtesse d’accueil', retrouveDansLeCV: 'Accueil du public' }],
  autresMetiers: [{ metierMasculin: 'Secrétaire administratif', metierFeminin: 'Secrétaire administrative', retrouveDansLeCV: ['Gestion du standard', 'Organisation'], aVerifier: '' }, { metierMasculin: 'Conseiller clientèle', metierFeminin: 'Conseillère clientèle', retrouveDansLeCV: ['Accueil du public'], aVerifier: '' }]
};
module.exports = {
  nom: 'orientationUcpm',
  REPONSE_METIERS,
  jouer: async (a, j) => {
    await R.deposerCv(a, j, 'un-cv-plusieurs-metiers-intro', '#btnUcpmCommencer', 'Un CV, plusieurs métiers', 'un-cv-plusieurs-metiers');
    let e = await a.ecran();
    j.info('après le dépôt : ' + e.hash + ' bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    if (/grisé/.test(e.avant || '')) { j.ko('un CV plusieurs métiers : « Continuer » grisé alors que le CV est déposé et relu (' + e.raison + ')'); } else { j.ok('un CV plusieurs métiers : « Continuer » actif dès que le CV est déposé et relu'); }
    await E.retourPuisReprendre(a, j, 'un CV plusieurs métiers', async () => {
      const bas = await a.ecran();
      const garde = await a.ev(() => /Déposé et relu/i.test(document.getElementById('app').innerText));
      return (garde || !/grisé/.test(bas.avant || '')) ? true : 'bas ' + bas.avant + ' ' + bas.raison;
    });
    e = await a.ecran();
    j.info('après la reprise : bas « ' + e.avant + ' » raison « ' + e.raison + ' » encart ' + (await a.ev(() => !!document.querySelector('#app .encart-reprise-module'))));
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await E.collerEtParcourir(a, j, 'un CV plusieurs métiers', REPONSE_METIERS, 1);
    // « Recommencer » : retour à la présentation, confirmation, annulation, puis remise à froid.
    await a.aller('un-cv-plusieurs-metiers-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'un CV plusieurs métiers', 'btnUcpmRepriseRecommencer');
  }
};
