/* Lot C : présentation de « Comprendre les chiffres » (environ 1 minute). Spécificité : des chiffres officiels datés (chômage, emploi, Smic, prix), expliqués en une phrase et comparés,
   du département à l'Union européenne, avec une fiche à garder. Complémentarité : les règles dans « Comprendre le cadre », les adresses dans « Qui fait quoi ». Parcours joué dans l'application réelle. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'h1', voix: 'Comprendre les chiffres vous montre l’état de l’emploi près de chez vous, avec des chiffres officiels, expliqués simplement.', sous_titre: 'Comprendre les chiffres : l’emploi près de chez vous, expliqué simplement.' },
    { id: 'h2', voix: 'Vous choisissez un territoire : votre département, votre région, la France entière, ou l’Union européenne.', sous_titre: 'Votre département, votre région, la France ou l’Union européenne.' },
    { id: 'h3', voix: 'Chaque chiffre est écrit en gros, expliqué en une phrase, daté, et comparé au trimestre précédent. Vous trouvez le chômage, le Smic, les prix.', sous_titre: 'Chaque chiffre : en gros, expliqué, daté et comparé.' },
    { id: 'h4', voix: 'Et vous pouvez ajouter un chiffre à votre fiche, pour la garder ou la montrer à un conseiller.', sous_titre: 'Vous ajoutez un chiffre à votre fiche, pour la garder.' },
    { id: 'h5', voix: 'Ce sont des chiffres, pas des conseils. Les règles se trouvent dans Comprendre le cadre, et les adresses dans Qui fait quoi.', sous_titre: 'Des chiffres, pas des conseils. Règles : « Comprendre le cadre ». Adresses : « Qui fait quoi ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('h1');
    await o.cliquer(p.locator('[data-carte-accueil="informe"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilChiffres'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('h2');
    await o.cliquer(p.locator('#btnComprendreLesChiffresCommencer'), 700); await dormir(1.2);
    const ch = p.locator('[data-comprendre-les-chiffres-choisir-territoire]').first();
    if (await ch.count()) { await o.cliquer(ch, 700); await dormir(1.2); await o.cliquer(p.locator('[data-choix-departement="87"]'), 700); await dormir(1.5); }
    await o.survol(p.locator('[data-comprendre-les-chiffres-niveau="na"]'), 800); await dormir(0.3);
    await o.cliquer(p.locator('[data-comprendre-les-chiffres-niveau="fr"]'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-comprendre-les-chiffres-niveau="dep"]'), 700); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('h3');
    await o.defiler(450, 1800); await dormir(0.8);
    await o.cliquer(p.locator('[data-comprendre-les-chiffres-vue-lecture="barres"]').first(), 700); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('h4');
    await o.survol(p.locator('[data-comprendre-les-chiffres-fiche-ajouter]').first(), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('h5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
