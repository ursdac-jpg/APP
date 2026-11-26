/* Protocole : la reprise de « À partir de mon récit » (route decouverte-intro), consigne 258 : même forme que « Reprendre mon CV ».
   On ouvre la voie depuis la page commune, on écrit un début de récit, on retourne à la présentation du module : elle doit proposer « Reprendre » (barre du bas) et « Recommencer » (bloc), sans rien griser. */
const E = require('./enchainer.js');
const DEBUT = 'J’ai travaillé cinq ans comme agent d’accueil à la mairie de Bergerac, et j’aide aussi mes voisins pour leurs papiers.';
module.exports = {
  nom: 'reprendreRecit',
  jouer: async (a, j) => {
    await a.aller('creer-cv');
    j.info('départ voie 2 : ' + await a.clic('#btnCreerCvRecit')); await a.attendre(1000);
    await a.attendre(900); await require('./reprendreCv.js').passerChoixMissions(a, j, 'assistant');
    await a.saisir('#decouverteRecitTexte', DEBUT); await a.attendre(500);
    await a.aller('decouverte-intro'); await a.attendre(900);
    const m1 = await E.mesureReprise(a, j, 'récit (présentation)');
    if (m1.forme === 'A') { j.ok('récit : la reprise a la forme de « Reprendre mon CV » (bloc sur la présentation, « Recommencer » seul, « Reprendre » en bas à droite)'); } else { j.ko('récit : la reprise n’a pas la forme de « Reprendre mon CV » (consigne 258)'); }
    j.info('Reprendre : ' + await a.suiv()); await a.attendre(1200);
    const m2 = await E.mesureReprise(a, j, 'récit (page de travail)');
    if (m2.encart || m2.gel) { j.ko('récit : la page de travail reste grisée ou porte encore un encart après « Reprendre »'); } else { j.ok('récit : la page de travail est libre après « Reprendre »'); }
    const garde = await a.ev(() => (document.getElementById('decouverteRecitTexte') || {}).value || '');
    if (garde.length < 50) { j.ko('récit : le début de récit est perdu après « Reprendre »'); } else { j.ok('récit : le début de récit est gardé après « Reprendre »'); }
    await a.aller('decouverte-intro'); await a.attendre(900);
    await E.testerRecommencer(a, j, 'récit', 'btnDecouverteRepriseRecommencer');
  }
};
