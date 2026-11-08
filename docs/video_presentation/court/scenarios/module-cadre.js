/* Lot C : présentation de « Comprendre le cadre » (environ 1 minute). Spécificité : des fiches sur les règles et les droits (emploi, formation, aides), avec sources officielles et dates.
   Complémentarité : les chiffres se lisent dans « Comprendre les chiffres », les adresses dans « Qui fait quoi ». Parcours joué dans l'application réelle (Haute-Vienne). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Comprendre le cadre vous explique les règles et les droits qui touchent à l’emploi, à la formation et aux aides, en langage simple.', sous_titre: 'Comprendre le cadre : les règles et les droits, en langage simple.' },
    { id: 'c2', voix: 'Vous choisissez votre département, parce que certaines aides changent d’un territoire à l’autre. Puis vous voyez des rubriques : emploi et contrats, se former, handicap, logement, mobilité.', sous_titre: 'Votre département, puis des rubriques : emploi, formation, logement, mobilité…' },
    { id: 'c3', voix: 'Chaque fiche renvoie vers la source officielle et indique sa date. Vous pouvez aussi voir ce qui a changé récemment, les délais à ne pas rater, et les alertes contre les arnaques.', sous_titre: 'Sources officielles et dates. Ce qui a changé, les délais, les alertes arnaques.' },
    { id: 'c4', voix: 'Ce n’est pas un avis juridique : pour votre situation précise, la bonne personne reste un professionnel.', sous_titre: 'Pas un avis juridique : pour votre situation, un professionnel.' },
    { id: 'c5', voix: 'Les chiffres se lisent dans Comprendre les chiffres. Les adresses près de chez vous se trouvent dans Qui fait quoi.', sous_titre: 'Les chiffres : « Comprendre les chiffres ». Les adresses : « Qui fait quoi ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-carte-accueil="informe"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilActualites'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('#btnSeTenirInformeCommencer'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-comprendre-le-cadre-choisir-territoire]').first(), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-choix-departement="87"]'), 700); await dormir(1.5);
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-rayon="emploi"]'), 800); await dormir(0.4);
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-rayon="former"]'), 800); await dormir(0.4);
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-rayon="logement"]'), 800); await dormir(0.4);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-digest="balayage"]'), 800); await dormir(0.5);
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-pnrr="delais"]'), 800); await dormir(0.5);
    await o.survol(p.locator('[data-comprendre-le-cadre-ouvrir-pnrr="arnaques"]'), 800); await dormir(0.5);
    await o.cliquer(p.locator('[data-comprendre-le-cadre-ouvrir-rayon="emploi"]'), 700); await dormir(1.8);
    await o.defiler(350, 1300); await dormir(0.6);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
