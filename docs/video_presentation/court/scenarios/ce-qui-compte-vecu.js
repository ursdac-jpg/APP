/* Partie « Ce que j'ai vécu » de « Ce qui compte pour moi » (environ 40 secondes) : les deux cartes de la partie. Clé : ce-qui-compte-vecu.
   Textes de voix validés par Denis le 25/11/2026. */
const { jouerPartie } = require('./ce-qui-compte-commun');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Cette partie s’appelle Ce que j’ai vécu. Elle contient deux cartes : vos expériences, et ce qui vous a aidé.', sous_titre: 'Ce que j’ai vécu : vos expériences, et ce qui vous a aidé.' },
    { id: 'c2', voix: 'Mes expériences, côté ressenti vous demande, pour un emploi, un stage, un bénévolat ou une activité, ce que vous avez aimé, ce qui a pesé, et comment vous en sortiez. Ce qui m’a aidé quand c’était difficile liste des appuis, des habitudes, des personnes. Cette carte ne cherche pas à expliquer vos difficultés.', sous_titre: 'Ce que vous avez aimé, ce qui a pesé, et les appuis qui vous ont aidé.' },
    { id: 'c3', voix: 'Vous écrivez avec vos mots, à votre rythme, et vous pouvez passer une question. Rien n’est enregistré sans votre accord.', sous_titre: 'Vos mots, à votre rythme. Rien n’est enregistré sans votre accord.' }
  ],
  async jouer(o) { await jouerPartie(o, 2, 'experiences'); }
};
