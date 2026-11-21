/* Présentation du chemin « Partir de vos envies » (environ 1 minute). Clé : chemin-actions. Parcours joué dans l'application réelle.
   Refaite le 21/11/2026 (consigne 520) : nouveau nom du chemin, page « Ce que j'évite » (cinq pages), niveau de la liste (échelle de pistes). */
const { preparer, versModule, versAccueilModule, entrerChemin, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'a1', voix: 'Partir de vos envies, c’est pour vous si vous ne savez pas encore quel métier choisir, mais que vous savez ce qui vous plaît.', sous_titre: 'Partir de vos envies : vous savez ce qui vous plaît, pas encore quel métier.' },
    { id: 'a2', voix: 'Vous choisissez ce qui vous attire : avec qui ou avec quoi vous vous verriez travailler, quelles actions, quels lieux. Sans vous demander si vous en êtes capable.', sous_titre: 'Avec qui, avec quoi, quelles actions, quels lieux. Sans vous demander si vous en êtes capable.' },
    { id: 'a3', voix: 'Vous pouvez dire ce que vous voulez éviter, puis ce qui serait facile ou difficile pour vous. Cela ajuste le classement, mais aucun métier n’est retiré sans que vous le sachiez.', sous_titre: 'Ce que vous évitez, facile ou difficile : le classement s’ajuste, rien n’est retiré en silence.' },
    { id: 'a4', voix: 'Des métiers vous sont alors proposés, dans une liste qui porte un nom : plus vous faites de choix, plus elle se précise. Le pourcentage est une évaluation, jamais une mesure, et vous pouvez modifier vos choix à tout moment.', sous_titre: 'La liste porte un nom, de piste éloignée à piste précise. Le pourcentage est une évaluation.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o); await versModule(o); await versAccueilModule(o);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('a1');
    await o.survol(p.locator('[data-cml="entrer"]').nth(1), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('a2');
    await entrerChemin(o, 'actions');
    await o.cliquer(p.locator('[data-cml="choix"]').nth(0), 700); await o.cliquer(p.locator('[data-cml="choix"]').nth(3), 700); await o.cliquer(p.locator('[data-cml="choix"]').nth(14), 700).catch(() => {});
    await dormir(0.6);
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.5);
    await o.cliquer(p.locator('[data-cml="choix"]').nth(0), 700).catch(() => {}); await o.cliquer(p.locator('[data-cml="choix"]').nth(2), 700).catch(() => {});
    await dormir(0.6);
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.5);
    await o.cliquer(p.locator('[data-cml="choix"]').nth(0), 700).catch(() => {}); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('a3');
    // Page « Ce que j'évite » (rien n'y est choisi : la page peut se passer), puis « Facile ou difficile ».
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.8);
    await o.defiler(300, 1800); await dormir(0.8);
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(1.8);
    await o.defiler(300, 1800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('a4');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 800); await dormir(3.5);
    await p.evaluate(() => window.scrollTo(0, 0)); await o.defiler(1100, 3000); await dormir(1.0);
    await o.defiler(500, 2000); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
