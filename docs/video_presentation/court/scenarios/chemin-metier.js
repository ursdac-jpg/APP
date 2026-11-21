/* Présentation du chemin « Chercher un métier » (environ 1 minute). Clé : chemin-metier. Parcours joué dans l'application réelle, depuis l'écran des quatre chemins.
   Refaite le 21/11/2026 (consigne 520) : nouveau nom du chemin, niveau de la liste (échelle de pistes) et cartes enrichies (ce que vous y feriez, à savoir sur ce métier). */
const { preparer, versModule, versAccueilModule, entrerChemin, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Chercher un métier, c’est pour vous si vous avez un métier en tête, ou si vous voulez mieux comprendre un métier que vous connaissez mal.', sous_titre: 'Chercher un métier : vous avez un métier en tête, ou vous voulez le comprendre.' },
    { id: 'c2', voix: 'Vous tapez le nom du métier, un autre nom, un sigle, ou un simple mot. Vous pouvez aussi partir de ce que vous savez faire, de votre niveau d’études ou d’un secteur.', sous_titre: 'Un nom, un sigle, un mot, ou vos compétences, votre niveau, un secteur.' },
    { id: 'c3', voix: 'Plus vous faites de choix, plus la liste se précise, et elle porte un nom, de piste éloignée à piste précise. Chaque carte montre ce que vous y feriez et ce qu’il faut savoir du métier.', sous_titre: 'La liste porte un nom qui dit sa précision. Chaque carte : ce que vous y feriez, à savoir.' },
    { id: 'c4', voix: 'La fiche du métier dit ce qu’il demande : les savoir-être, les savoir-faire et les savoirs. Elle donne aussi le niveau pour y accéder et ses conditions de travail.', sous_titre: 'La fiche : savoir-être, savoir-faire, savoirs, niveau, conditions de travail.' },
    { id: 'c5', voix: 'En bas de la fiche, vous trouvez des métiers proches, et vous pouvez chercher des offres. Un pourcentage ne dit jamais si vous êtes fait pour un métier.', sous_titre: 'Des métiers proches, des offres. Un pourcentage ne dit jamais si vous êtes fait pour un métier.' }
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
    await o.cliquer(p.locator('#pmQ'), 700); await p.keyboard.type('écoute', { delay: 90 }); await dormir(1.2);
    await o.cliquer(p.locator('button[data-pm="add"]').first(), 800); await dormir(0.8);
    await o.cliquer(p.locator('#pmQ'), 600); await p.locator('#pmQ').fill(''); await p.keyboard.type('organiser', { delay: 90 }); await dormir(1.2);
    await o.cliquer(p.locator('button[data-pm="add"]').first(), 800); await dormir(0.8);
    await o.cliquer(p.locator('#pmQ'), 600); await p.locator('#pmQ').fill(''); await p.keyboard.type('conseiller', { delay: 90 }); await dormir(1.2);
    await o.cliquer(p.locator('button[data-pm="add"]').first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await p.evaluate(() => { const z = document.getElementById('zRes'); if (z) { z.scrollIntoView(); } }); await dormir(1.5);
    await o.defiler(520, 2200); await dormir(1.2);
    await o.defiler(300, 1600); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(p.locator('button', { hasText: 'Voir la fiche' }).first(), 800); await dormir(1.8);
    await o.defiler(520, 2200); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.defiler(1500, 2600); await dormir(0.8);
    await o.survol(p.locator('text=Chercher des offres en ce moment').first(), 900).catch(() => {}); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
