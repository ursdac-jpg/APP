/* Présentation du module « Créer un nouveau CV » (environ 1 minute) : les trois chemins en une fois. Clé : creer. Parcours joué dans l'application réelle (page commune du module). */
const C = require('./mesdocuments-commun');
const { dormir } = C;
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Vous n’avez pas encore de CV, ou vous voulez repartir d’une page blanche. Il y a trois chemins.', sous_titre: 'Créer un nouveau CV : une page blanche, trois chemins.' },
    { id: 'c2', voix: 'Avec l’assistant en ligne : vous remplissez vos informations, et il vous aide à les formuler.', sous_titre: 'Chemin 1 : avec l’assistant en ligne.' },
    { id: 'c3', voix: 'À partir de votre récit : vous racontez ce que vous avez vécu, avec vos mots, et l’assistant en tire vos expériences et vos compétences.', sous_titre: 'Chemin 2 : à partir de votre récit.' },
    { id: 'c4', voix: 'À la main, sans assistant : vous écrivez tout vous-même, et rien n’est envoyé nulle part.', sous_titre: 'Chemin 3 : à la main, sans assistant.' },
    { id: 'c5', voix: 'À la fin, vous avez un CV à enregistrer en PDF ou en Word. Vous pouvez recommencer autrement quand vous voulez.', sous_titre: 'À la fin : un CV en PDF ou en Word. Vous pouvez recommencer autrement.' }
  ],
  async jouer(o) {
    await C.preparer(o);
    o.commencer();
    await o.bloc('c1');
    await C.ouvrirTuile(o, 'btnCarteAccueilCvNouveau', 0); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await C.versVoie(o, 'assistant');
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await C.versVoie(o, 'recit');
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await C.versVoie(o, 'main');
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.defiler(300, 1500); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
