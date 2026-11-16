/* Protocole : carte « Boîte à outils », tuile « Découvrir mes compétences » (route mes-competences-intro). Réponse de l'assistant SIMULÉE (format de prompts/mes-competences.md). */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const REPONSE_COMPETENCES = {
  niveauPoste: 'execution', niveauPosteIndices: 'Accueil du public et standard.',
  competences: [{ libelle: 'Accueillir et orienter le public', famille: 'savoirFaire', enMotsSimples: 'Recevoir les gens et leur dire où aller.', preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Accueil du public' }], confirmation: 'relevee', pourLeCV: 'Accueil et orientation du public', pourLOral: 'Je reçois les personnes et je les guide.', pourPreparer: 'Préparer un exemple de situation difficile.', synonymes: ['Recevoir', 'Guider'], question: '' }],
  motivations: []
};
module.exports = {
  REPONSE_COMPETENCES,
  nom: 'boiteCompetences',
  jouer: async (a, j) => {
    await a.aller('mes-competences-intro');
    j.info('départ : ' + await a.clic('#btnMesCompCommencer')); await a.attendre(900);
    let e = await a.verifier({ hash: '#mes-competences' });
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('compétences : « Continuer » devrait être grisé avec une raison au départ (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('compétences : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    j.info('déposer un CV : ' + await a.clic('#btnMcDeposer_cv')); await a.attendre(900);
    e = await a.ecran();
    j.info('après « Déposer un CV » : ' + e.hash + ' fenêtre ' + e.fenetre + ' boutons : ' + await E.boutons(a));
    j.info('coller le texte : ' + await a.clic('#depotPageColler')); await a.attendre(600);
    await a.saisir('#depotPageTexte', R.CV_TEXTE); await a.attendre(400);
    j.info('relire et masquer : ' + await a.clic('#depotPageLireTexte')); await a.attendre(1500);
    j.info('retirer les informations sensibles : ' + await a.clic('', 'Retirer toutes les informations')); await a.attendre(700);
    j.info('enregistrer : ' + await a.clic('#verifDocBtnEnregistrer')); await a.attendre(1500);
    e = await a.ecran(); j.info('après le dépôt : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('compétences : « Continuer » reste grisé alors qu’un CV est déposé et relu (' + e.raison + ')'); } else { j.ok('compétences : « Continuer » dégrisé après le dépôt d’un CV'); }
    await E.retourPuisReprendre(a, j, 'compétences', async () => {
      const bas = await a.ecran();
      const garde = await a.ev(() => /Camille|relu|Déposé/i.test(document.getElementById('app').innerText));
      return (garde && !/grisé/.test(bas.avant || '')) ? true : 'bas ' + bas.avant + ' ' + bas.raison + ' garde ' + garde;
    });
    e = await a.ecran();
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    e = await a.ecran(); j.info('après Continuer : ' + e.hash + ' bas « ' + e.avant + ' » raison « ' + e.raison + ' » barre ' + e.barre);
    await E.collerEtParcourir(a, j, 'compétences', REPONSE_COMPETENCES, 1, true);
    e = await a.ecran();
    j.info('relecture : bas « ' + e.avant + ' » raison « ' + e.raison + ' » boutons ' + await E.boutons(a));
    if (/grisé/.test(e.avant || '')) { if (!e.raison) { j.ko('compétences (relecture) : « Continuer » grisé sans raison affichée'); } else { j.ok('compétences (relecture) : « Continuer » grisé avec la raison « ' + e.raison + ' »'); } }
    j.info('relecture : ' + await a.clic('', 'C’est exact')); await a.attendre(600);
    e = await a.ecran(); j.info('après « C’est exact » : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('compétences (relecture) : « Continuer » reste grisé après avoir répondu sur la seule ligne (' + e.raison + ')'); } else { j.ok('compétences (relecture) : « Continuer » actif'); }
    j.info('vers Terminé : ' + await a.suiv()); await a.attendre(900);
    e = await a.ecran(); j.info('Terminé : ' + e.hash + ' « ' + e.h1 + ' » bas « ' + e.avant + ' » barre ' + e.barre);
    j.info('boutons Terminé : ' + await E.boutons(a));
    const r = await a.retour(); e = await a.ecran(); j.info('Retour depuis Terminé : ' + r + ' → ' + e.hash + ' barre ' + e.barre + ' bas « ' + e.avant + ' »');
    await E.chaineRetour(a, j, 'compétences');
    // « Recommencer » : retour à la présentation, confirmation, annulation, puis remise à froid.
    await a.aller('mes-competences-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'compétences', 'btnMesCompRepriseRecommencer');
    j.info('fenêtre finale : ' + await a.ev(() => { const f = document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'); return f ? f.innerText.replace(/s+/g, ' ').slice(0, 400) : 'aucune'; }));
  }
};
