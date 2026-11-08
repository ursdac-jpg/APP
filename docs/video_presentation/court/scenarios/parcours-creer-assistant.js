/* Lot C : « Créer un nouveau CV », porte « Avec l'assistant en ligne » (environ 1 minute). Spécificité : on remplit ses informations, puis un assistant en ligne aide à les formuler (étape « Assistant »).
   Complémentarité : « À la main, sans assistant » pour tout écrire soi-même, « À partir de mon récit » pour partir d'une histoire. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'b1', voix: 'Créer mon CV avec l’assistant en ligne : vous remplissez vos informations, puis un assistant en ligne vous aide à les formuler.', sous_titre: 'Avec l’assistant en ligne : vous remplissez, il aide à formuler.' },
    { id: 'b2', voix: 'Vous commencez par votre objectif : le poste ou le type de démarche que vous visez. Les étapes sont toutes affichées en haut de la page, dont l’étape Assistant.', sous_titre: 'D’abord votre objectif. Les étapes en haut, dont « Assistant ».' },
    { id: 'b3', voix: 'Vous renseignez vos informations, votre parcours, votre profil. L’application prépare ensuite un message à copier chez l’assistant, et vous rapportez sa réponse ici.', sous_titre: 'Vos informations, puis un message à copier chez l’assistant, et sa réponse ici.' },
    { id: 'b4', voix: 'Vous relisez tout, vous gardez ce qui vous va, et vous modifiez ce que vous voulez. Rien n’est envoyé sans votre accord.', sous_titre: 'Vous relisez, vous gardez, vous modifiez. Rien n’est envoyé sans votre accord.' },
    { id: 'b5', voix: 'Pour tout écrire vous-même, voyez À la main, sans assistant. Pour partir de votre histoire, voyez À partir de mon récit.', sous_titre: 'Tout écrire soi-même : « À la main ». Partir de votre histoire : « À partir de mon récit ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('b1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await o.cliquer(p.locator('#btnCreerCvAvecAssistant'), 700); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('b2');
    await o.cliquer(p.locator('#btnCreerCvCommencer'), 700); await dormir(1.5);
    await C.objectifOffre(o);
    await o.finDeVoix(0.3);
    await o.bloc('b3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(2.0);
    await o.defiler(250, 1300); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('b4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('b5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
