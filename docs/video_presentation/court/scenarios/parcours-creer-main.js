/* Lot C : « Créer un nouveau CV », porte « À la main, sans assistant » (environ 1 minute). Spécificité : on écrit soi-même, étape par étape, rien n'est envoyé nulle part.
   Complémentarité : « Avec l'assistant en ligne » pour les formulations, « À partir de mon récit » pour qui n'a pas de parcours classique. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'a1', voix: 'Créer mon CV à la main, sans assistant : vous écrivez vous-même vos informations, étape par étape. Rien n’est envoyé nulle part.', sous_titre: 'À la main, sans assistant : vous écrivez vous-même. Rien n’est envoyé.' },
    { id: 'a2', voix: 'C’est le chemin pour garder tout sous la main. Vous indiquez d’abord votre objectif : répondre à une offre, une candidature spontanée, un stage, une formation.', sous_titre: 'D’abord votre objectif : offre, spontanée, stage, formation…' },
    { id: 'a3', voix: 'Puis vous renseignez vos informations avec vos mots. Pour chaque expérience, vous tapez le poste, vous choisissez le métier, puis vous cochez les missions et les compétences que vous avez vraiment. Rien n’est ajouté avant Je valide.', sous_titre: 'Le poste, le métier, ce que vous avez vraiment fait. Rien n’est ajouté avant « Je valide ».' },
    { id: 'a3c', voix: 'Une étape suivante vous montre ce que demande le métier que vous visez. Personne ne reformule à votre place : le CV reste le vôtre.', sous_titre: 'Ce que demande le métier visé. Personne ne reformule : le CV reste le vôtre.' },
    { id: 'a4', voix: 'À la fin, vous choisissez un modèle, en PDF ou en Word. Vous pourrez ensuite préparer votre lettre et votre entretien.', sous_titre: 'À la fin : un modèle, en PDF ou en Word. Puis la lettre et l’entretien.' },
    { id: 'a5', voix: 'Si vous voulez de l’aide pour les formulations, voyez Avec l’assistant en ligne. Sans parcours classique, voyez À partir de mon récit.', sous_titre: 'Aide aux formulations : « Avec l’assistant ». Sans parcours classique : « À partir de mon récit ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('a1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await C.versVoie(o, 'main');
    await o.finDeVoix(0.3);
    await o.bloc('a2');
    await o.cliquer(p.locator('#btnCreerCvSansAssistant'), 700); await dormir(1.5);   // départ direct sur « Votre objectif »
    await C.objectifOffre(o);
    await o.finDeVoix(0.3);
    await o.bloc('a3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(2.0);
    await C.panneauExperienceDebut(o);
    await C.panneauExperienceFin(o);
    await o.finDeVoix(0.3);
    await o.bloc('a3c');
    await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('a4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('a5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
