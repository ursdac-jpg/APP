/* Présentation du chemin « Les emplois en demande » (environ 1 minute). Clé : chemin-recrute. Parcours joué dans l'application réelle. */
const { preparer, versModule, versAccueilModule, entrerChemin, dormir } = require('./metiers-commun');
module.exports = {
  blocs: [
    { id: 'r1', voix: 'Les emplois en demande, c’est pour vous si vous cherchez surtout un emploi. Ici, ce sont les besoins des employeurs qui guident, pas vos envies.', sous_titre: 'Les emplois en demande : ce sont les besoins des employeurs qui guident.' },
    { id: 'r2', voix: 'Vous choisissez votre département. Vous voyez ce que les employeurs prévoient de recruter, avec des graphiques que vous pouvez masquer.', sous_titre: 'Votre département : ce que les employeurs prévoient de recruter, en graphiques.' },
    { id: 'r3', voix: 'Les métiers saisonniers, ceux qui sont difficiles à pourvoir, et les endroits où l’on recrute en continu ont chacun leur rubrique.', sous_titre: 'Métiers saisonniers, difficiles à pourvoir, recrutement en continu.' },
    { id: 'r4', voix: 'Puis vous cochez jusqu’à cinq métiers, vous préparez une demande, et vous la copiez dans l’assistant en ligne de votre choix. Les nombres sont des intentions d’employeurs, jamais des embauches garanties.', sous_titre: 'Jusqu’à cinq métiers, une demande à copier. Des intentions d’employeurs, pas des embauches.' }
  ],
  async jouer(o) {
    const p = o.p;
    await preparer(o); await versModule(o); await versAccueilModule(o);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('r1');
    await o.survol(p.locator('[data-cml="entrer"]').nth(3), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('r2');
    await entrerChemin(o, 'recrute');
    await o.cliquer(p.locator('[data-cml="recruteDep"]', { hasText: 'Haute-Vienne' }), 700).catch(() => {}); await dormir(1.2);
    await o.defiler(300, 1800); await dormir(0.6);
    await o.cliquer(p.locator('button', { hasText: 'Barres' }).first(), 700).catch(() => {}); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('r3');
    await o.cliquer(p.locator('[data-cml="recruteAller"]', { hasText: 'saisonniers' }).first(), 800); await dormir(1.8);
    await o.cliquer(p.locator('[data-cml="recruteAller"]', { hasText: 'difficiles' }).first(), 800).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('r4');
    await o.cliquer(p.locator('[data-cml="recruteAller"]', { hasText: 'Chercher des offres' }).first(), 800); await dormir(1.8);
    await o.cliquer(p.locator('.pmf-grille input').first(), 700).catch(() => {}); await dormir(0.8);
    await o.cliquer(p.locator('.pmf-grille input').nth(1), 700).catch(() => {}); await dormir(0.8);
    await o.defiler(700, 2400); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
