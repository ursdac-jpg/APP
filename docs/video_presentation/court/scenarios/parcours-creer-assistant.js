/* Lot C : « Créer un nouveau CV », porte « Avec l'assistant en ligne » (environ 1 minute). Spécificité : on remplit ses informations, puis un assistant en ligne aide à les formuler (étape « Assistant »).
   Complémentarité : « À la main, sans assistant » pour tout écrire soi-même, « À partir de mon récit » pour partir d'une histoire. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'b1', voix: 'Créer mon CV avec l’assistant en ligne : vous remplissez vos informations, puis un assistant en ligne vous aide à les formuler.', sous_titre: 'Avec l’assistant en ligne : vous remplissez, il aide à formuler.' },
    { id: 'bq', voix: 'Avant de commencer, une seule question : qui choisit les missions et les compétences de vos expériences ? Vous les choisissez vous-même, ou l’assistant vous les propose. Il n’y a pas de mauvais choix. Une fois confirmé, il ne change plus pour ce CV.', sous_titre: 'Une question : vous choisissez les missions et compétences, ou l’assistant les propose. Choix confirmé, définitif pour ce CV.' },
    { id: 'b2', voix: 'Vous commencez par votre objectif : le poste ou le type de démarche que vous visez. Les étapes sont toutes affichées en haut de la page, dont l’étape Assistant.', sous_titre: 'D’abord votre objectif. Les étapes en haut, dont « Assistant ».' },
    { id: 'b3', voix: 'Vous renseignez vos informations. Pour chaque expérience, vous tapez le poste, vous choisissez le métier, puis vous cochez les missions et les compétences que vous avez vraiment. Rien n’est ajouté avant Je valide.', sous_titre: 'Le poste, le métier, ce que vous avez vraiment fait. Rien n’est ajouté avant « Je valide ».' },
    { id: 'b3c', voix: 'L’application prépare un message à copier chez l’assistant, et vous rapportez sa réponse ici. Il peut proposer de mettre en premier les missions qui comptent le plus pour le métier visé : c’est vous qui décidez.', sous_titre: 'Un message à copier chez l’assistant, sa réponse ici. Mettre en premier : c’est vous qui décidez.' },
    { id: 'b4', voix: 'Vous relisez tout, vous gardez ce qui vous va, et vous modifiez ce que vous voulez. Rien n’est envoyé sans votre accord.', sous_titre: 'Vous relisez, vous gardez, vous modifiez. Rien n’est envoyé sans votre accord.' },
    { id: 'b5', voix: 'Pour tout écrire vous-même, voyez À la main, sans assistant. Pour partir de votre histoire, voyez À partir de mon récit.', sous_titre: 'Tout écrire soi-même : « À la main ». Partir de votre histoire : « À partir de mon récit ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('b1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await C.versVoie(o, 'assistant');
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnCreerCvAvecAssistant'), 700); await dormir(1.5);   // départ direct : d'abord la question « Avant de commencer »
    await o.bloc('bq');
    await C.questionMissions(o, 'moi');
    await o.finDeVoix(0.3);
    await o.bloc('b2');
    await C.objectifOffre(o);
    await o.finDeVoix(0.3);
    await o.bloc('b3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(2.0);
    await C.panneauExperienceDebut(o);
    await C.panneauExperienceFin(o);
    await o.finDeVoix(0.3);
    await o.bloc('b3c');
    await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('b4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('b5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
