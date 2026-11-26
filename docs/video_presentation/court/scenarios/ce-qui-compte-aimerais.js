/* Partie « Ce que j'aimerais » de « Ce qui compte pour moi » (environ 40 secondes) : les trois cartes de la partie. Clé : ce-qui-compte-aimerais.
   Textes de voix validés par Denis le 25/11/2026. */
const { jouerPartie } = require('./ce-qui-compte-commun');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Cette partie s’appelle Ce que j’aimerais. Elle contient trois cartes pour mettre des mots sur vos envies : si tout était possible, qu’est-ce que vous voudriez vivre, apprendre ou créer ?', sous_titre: 'Ce que j’aimerais : trois cartes pour mettre des mots sur vos envies.' },
    { id: 'c2', voix: 'Si rien ne m’arrêtait vous invite à écrire quelques envies, puis à en retenir trois. Ceux qui m’inspirent parle d’une personne, d’un personnage ou d’une œuvre qui vous marque. Ma journée idéale de travail décrit une journée qui vous ferait du bien, du réveil jusqu’au soir.', sous_titre: 'Des envies, des personnes qui vous inspirent, une journée idéale de travail.' },
    { id: 'c3', voix: 'Il n’y a ni bonne ni mauvaise réponse, et rien n’est noté. Vous commencez par la carte que vous voulez.', sous_titre: 'Ni bonne ni mauvaise réponse, rien n’est noté.' }
  ],
  async jouer(o) { await jouerPartie(o, 0, 'envies'); }
};
