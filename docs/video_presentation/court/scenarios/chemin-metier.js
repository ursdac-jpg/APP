/* Présentation du chemin « Par un métier » (environ 1 minute). Clé : chemin-metier. Parcours joué dans l'application réelle, depuis l'écran des quatre chemins. */
const { preparer, versModule, versAccueilModule, entrerChemin, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Par un métier, c’est pour vous si vous avez un métier en tête, ou si vous voulez mieux comprendre un métier que vous connaissez mal.', sous_titre: 'Par un métier : vous avez un métier en tête, ou vous voulez le comprendre.' },
    { id: 'c2', voix: 'Vous tapez le nom du métier, un autre nom, un sigle, ou un simple mot. Vous pouvez aussi partir de ce que vous savez faire, de votre niveau d’études ou d’un secteur.', sous_titre: 'Un nom, un sigle, un mot, ou vos compétences, votre niveau, un secteur.' },
    { id: 'c3', voix: 'La fiche du métier dit ce qu’il demande : les savoir-être, les savoir-faire et les savoirs. Elle donne aussi le niveau pour y accéder et ses conditions de travail.', sous_titre: 'La fiche : savoir-être, savoir-faire, savoirs, niveau, conditions de travail.' },
    { id: 'c4', voix: 'En bas de la fiche, vous trouvez des métiers proches, et vous pouvez chercher des offres. Un pourcentage ne dit jamais si vous êtes fait pour un métier.', sous_titre: 'Des métiers proches, des offres. Un pourcentage ne dit jamais si vous êtes fait pour un métier.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o); await versModule(o); await versAccueilModule(o);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('c1');
    await o.survol(p.locator('[data-cml="entrer"]').nth(0), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await entrerChemin(o, 'metier');
    await o.cliquer(p.locator('#pmQ'), 700); await p.keyboard.type('aide soign', { delay: 90 }); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('button[data-pm="sgm"]').first(), 800); await dormir(1.8);
    await o.defiler(520, 2200); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.defiler(1500, 2600); await dormir(0.8);
    await o.survol(p.locator('text=Chercher des offres en ce moment').first(), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
