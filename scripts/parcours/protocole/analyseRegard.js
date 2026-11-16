/* Protocole : carte « Outils d'analyse », tuile « Un regard sur mon CV » (route regard-recruteur-intro). Réponse de l'assistant SIMULÉE (format de prompts/regard-recruteur.md). */
const R = require('./reprendreCv.js');
const E = require('./enchainer.js');
const REPONSE_REGARD = {
  modeAnalyse: 'texte', analyseImpossible: false, messageAnalyseImpossible: '', cvCourt: false, messageCvCourt: '', fondDeCouleur: false,
  syntheseOuverture: 'Votre CV montre un parcours d’accueil clair et régulier.',
  axes: [
    { id: 'positif', afficher: true, points: [{ titre: '', constat: 'Cinq ans au même poste d’accueil.', lecture: '', piste: '' }] },
    { id: 'coherence', afficher: true, points: [{ titre: 'Un fil conducteur', constat: 'Toutes les expériences parlent d’accueil.', lecture: 'Le métier visé se comprend vite.', piste: 'Garder ce fil dans la lettre.' }] },
    { id: 'message', afficher: true, points: [{ titre: 'Le message', constat: 'On comprend que vous aimez le contact.', lecture: 'Cela rassure.', piste: 'Ajouter un chiffre si vous en avez un.' }] },
    { id: 'premiere-lecture', afficher: true, points: [{ titre: '', constat: 'Le titre est lisible dès les premières lignes.', lecture: 'Le recruteur sait tout de suite de quel poste il s’agit.', piste: 'Rien à changer.' }] }
  ],
  questionsLieesAuCv: [{ question: 'Pourquoi avoir choisi l’accueil ?', origine: 'Parcours', ceQueLeRecruteurCherche: 'Votre motivation', commentYRepondre: 'Parlez d’un moment où vous avez aidé quelqu’un.' }]
};
module.exports = {
  nom: 'analyseRegard',
  REPONSE_REGARD,
  jouer: async (a, j) => {
    await a.aller('regard-recruteur-intro');
    j.info('départ : ' + await a.clic('#btnRegardRecruteurCommencer')); await a.attendre(800);
    let e = await a.verifier({ h1: 'Un regard sur mon CV' });
    if (!/grisé/.test(e.avant || '') || !e.raison) { j.ko('regard : « Continuer » devrait être grisé avec une raison avant le choix (' + e.avant + ' / ' + e.raison + ')'); } else { j.ok('regard : « Continuer » grisé avec la raison « ' + e.raison + ' »'); }
    j.info('choix « contenu seul » : ' + await a.clic('', 'Lire le contenu seul')); await a.attendre(900);
    e = await a.ecran(); j.info('après le choix : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('texte collé : ' + await a.clic('#depotPageColler')); await a.attendre(600);
    await a.saisir('#depotPageTexte', R.CV_TEXTE); await a.attendre(400);
    j.info('relire et masquer : ' + await a.clic('#depotPageLireTexte')); await a.attendre(1500);
    j.info('retirer les informations sensibles : ' + await a.clic('', 'Retirer toutes les informations')); await a.attendre(700);
    j.info('enregistrer : ' + await a.clic('#verifDocBtnEnregistrer')); await a.attendre(1500);
    e = await a.ecran(); j.info('après le dépôt : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    if (/grisé/.test(e.avant || '')) { j.ko('regard : « Continuer » reste grisé alors que le CV est déposé et relu (' + e.raison + ')'); } else { j.ok('regard : « Continuer » dégrisé après le dépôt'); }
    await E.retourPuisReprendre(a, j, 'regard', async () => {
      const bas = await a.ecran();
      const garde = await a.ev(() => /Déposé et relu|relu/i.test(document.getElementById('app').innerText));
      return (garde || !/grisé/.test(bas.avant || '')) ? true : 'bas ' + bas.avant + ' ' + bas.raison;
    });
    e = await a.ecran();
    if (/Reprendre/.test(e.avant || '')) { j.info('Reprendre : ' + await a.suiv()); await a.attendre(900); }
    e = await a.ecran(); j.info('avant l’assistant : bas « ' + e.avant + ' » raison « ' + e.raison + ' »');
    j.info('vers l’assistant : ' + await a.suiv()); await a.attendre(900);
    await E.collerEtParcourir(a, j, 'regard', REPONSE_REGARD, 1);
    // « Recommencer » : retour à la présentation, confirmation, annulation, puis remise à froid.
    await a.aller('regard-recruteur-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'regard', 'rrBtnRepriseRecommencer');
  }
};
