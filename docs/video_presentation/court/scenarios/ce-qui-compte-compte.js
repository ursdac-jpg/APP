/* Partie « Ce qui compte » de « Ce qui compte pour moi » (environ 40 secondes) : les deux cartes de la partie. Clé : ce-qui-compte-compte.
   Textes de voix validés par Denis le 25/11/2026. */
const { jouerPartie } = require('./ce-qui-compte-commun');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Cette partie s’appelle Ce qui compte. Elle contient deux cartes : ce que vous attendez d’un travail, et les conditions dans lesquelles vous vous sentez bien.', sous_titre: 'Ce qui compte : ce que vous attendez d’un travail, et dans quelles conditions.' },
    { id: 'c2', voix: 'Ce qui compte au travail propose dix-neuf repères à ranger en trois piles : essentiel, important, moins important pour l’instant. Comment je veux travailler passe en revue le lieu, le rythme, les horaires, le contact, le cadre et les déplacements : ce que vous voulez, ce à quoi vous pouvez vous adapter, ce que vous préférez éviter.', sous_titre: 'Dix-neuf repères à ranger en trois piles, puis vos conditions de travail.' },
    { id: 'c3', voix: 'Vos choix restent les vôtres. L’application ne note rien et ne tire aucune conclusion sur vous.', sous_titre: 'Vos choix restent les vôtres. L’application ne note rien.' }
  ],
  async jouer(o) { await jouerPartie(o, 1, 'valeurs'); }
};
