/* Lot C : « Créer un nouveau CV », porte « À la main, sans assistant » (environ 1 minute). Spécificité : on écrit soi-même, étape par étape, rien n'est envoyé nulle part.
   Complémentarité : « Avec l'assistant en ligne » pour les formulations, « À partir de mon récit » pour qui n'a pas de parcours classique. Parcours joué dans l'application réelle. */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'a1', voix: 'Créer mon CV à la main, sans assistant : vous écrivez vous-même vos informations, étape par étape. Rien n’est envoyé nulle part.', sous_titre: 'À la main, sans assistant : vous écrivez vous-même. Rien n’est envoyé.' },
    { id: 'a2', voix: 'C’est le parcours pour garder tout sous la main. Vous indiquez d’abord votre objectif : répondre à une offre, une candidature spontanée, un stage, une formation.', sous_titre: 'D’abord votre objectif : offre, spontanée, stage, formation…' },
    { id: 'a3', voix: 'Puis vous renseignez vos informations, votre parcours et votre profil avec vos propres mots. Personne ne reformule à votre place : le CV reste le vôtre.', sous_titre: 'Vos informations, votre parcours, votre profil, avec vos mots. Le CV reste le vôtre.' },
    { id: 'a4', voix: 'À la fin, vous choisissez un modèle, en PDF ou en Word. Vous pourrez ensuite préparer votre lettre et votre entretien.', sous_titre: 'À la fin : un modèle, en PDF ou en Word. Puis la lettre et l’entretien.' },
    { id: 'a5', voix: 'Si vous voulez de l’aide pour les formulations, voyez Avec l’assistant en ligne. Sans parcours classique, voyez À partir de mon récit.', sous_titre: 'Aide aux formulations : « Avec l’assistant ». Sans parcours classique : « À partir de mon récit ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await C.preparer(o);
    o.commencer();
    await o.bloc('a1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await o.cliquer(p.locator('#btnCreerCvSansAssistant'), 700); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('a2');
    await o.cliquer(p.locator('#btnCreerCvCommencer'), 700); await dormir(1.5);
    await C.objectifOffre(o);
    await o.finDeVoix(0.3);
    await o.bloc('a3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(2.0);
    await o.defiler(250, 1300); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('a4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('a5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
