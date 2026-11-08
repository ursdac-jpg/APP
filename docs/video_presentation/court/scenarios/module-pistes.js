/* Lot C : présentation de « Comparer mes pistes » (environ 1 minute). Spécificité : deux ou trois pistes mises côte à côte avec la même structure, sans note ni gagnant, pour décider soi-même ; le panier de pistes.
   Complémentarité : « Un CV, plusieurs métiers » une fois les métiers choisis, les fiches métier et la recherche pour alimenter le panier. Parcours joué dans l'application réelle. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'p1', voix: 'Comparer mes pistes vous aide quand vous hésitez entre deux ou trois pistes : des métiers, des formations, des projets.', sous_titre: 'Comparer mes pistes : vous hésitez entre deux ou trois pistes.' },
    { id: 'p2', voix: 'Cette comparaison ne désigne pas une meilleure option. Il n’y a ni note, ni gagnant : chaque piste est présentée de la même façon, et vous décidez vous-même.', sous_titre: 'Ni note, ni gagnant : chaque piste est présentée de la même façon.' },
    { id: 'p3', voix: 'Vous ajoutez vos pistes comme vous voulez : en racontant ce qui vous fait hésiter, en les nommant, ou en collant un texte utile. Puis vous dites où vous en êtes.', sous_titre: 'Vous racontez, vous nommez vos pistes, ou vous collez un texte. Où vous en êtes.' },
    { id: 'p4', voix: 'Pour chaque piste, une fiche avec la même structure : ce qu’elle demande, ce qu’elle ouvre, ce qui est à vérifier aujourd’hui, avec la date et la source, et des questions à vous poser.', sous_titre: 'Une fiche par piste : ce qu’elle demande, ouvre, à vérifier, des questions.' },
    { id: 'p5', voix: 'Quand vos métiers sont choisis, Un CV, plusieurs métiers prépare un CV et une lettre pour chacun.', sous_titre: 'Métiers choisis : « Un CV, plusieurs métiers » prépare CV et lettres.' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('p1');
    await o.cliquer(p.locator('[data-carte-accueil="orientation"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilComparerPistes'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('p2');
    await o.defiler(350, 1800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('p3');
    await o.cliquer(p.locator('#btnAideDecisionCommencer'), 700); await dormir(1.5);
    await o.cliquer(p.locator('summary', { hasText: 'Je nomme mes pistes' }), 700); await dormir(0.8);
    await o.cliquer(p.locator('[data-cp-piste-nom="0"]'), 600); await p.keyboard.type('CAP Agent de propreté', { delay: 35 }); await dormir(0.4);
    await o.cliquer(p.locator('[data-cp-piste-nom="1"]'), 600); await p.keyboard.type('Aide à domicile', { delay: 35 }); await dormir(0.6);
    await o.cliquer(p.locator('summary', { hasText: 'Où en êtes-vous en ce moment' }), 700).catch(() => {}); await dormir(0.8);
    await o.cliquer(p.locator('[data-cp-situation="sans-emploi"]'), 700).catch(() => {}); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('p4');
    await o.defiler(350, 1500); await dormir(0.8);
    await o.survol(p.locator('#btnSuivantNavigation'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('p5');
    await o.cliquer(p.locator('#btnComparerRevoirPresentation'), 700).catch(() => {}); await dormir(1.8);
    await o.finDeVoix(1.0);
  }
};
