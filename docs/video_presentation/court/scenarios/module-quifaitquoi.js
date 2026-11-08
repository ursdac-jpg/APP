/* Lot C : présentation de « Qui fait quoi » (environ 1 minute). Spécificité : des adresses rassemblées par territoire (employeurs, formation, aides), par domaine, avec la date de vérification.
   Complémentarité : les règles dans « Comprendre le cadre », les chiffres dans « Comprendre les chiffres », les candidatures dans « Employeurs près de chez moi ». Parcours joué dans l'application réelle. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'q1', voix: 'Qui fait quoi vous montre à qui vous adresser dans votre département, pour l’emploi, la formation, le logement ou les déplacements.', sous_titre: 'Qui fait quoi : à qui s’adresser dans votre département.' },
    { id: 'q2', voix: 'Les adresses utiles existent, mais elles sont dispersées. Ici, elles sont rassemblées par territoire. Vous choisissez votre département, et si vous le souhaitez, votre commune.', sous_titre: 'Des adresses rassemblées par territoire. Votre département, et votre commune.' },
    { id: 'q3', voix: 'Puis vous choisissez un domaine, ou vous tapez ce que vous cherchez. Vous voyez une liste, et chaque fiche dit où c’est et comment joindre la structure.', sous_titre: 'Un domaine, ou un mot. Chaque fiche : où c’est, comment joindre.' },
    { id: 'q4', voix: 'Ce n’est pas une liste d’offres d’emploi, et personne n’y est recommandé. Rien n’est enregistré ailleurs que sur votre appareil.', sous_titre: 'Pas d’offres d’emploi, pas de recommandation. Rien n’est enregistré ailleurs.' },
    { id: 'q5', voix: 'Pour comprendre vos droits, voyez Comprendre le cadre. Pour candidater chez un employeur, voyez Employeurs près de chez moi.', sous_titre: 'Vos droits : « Comprendre le cadre ». Candidater : « Employeurs près de chez moi ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    o.commencer();
    await o.bloc('q1');
    await o.cliquer(p.locator('[data-carte-accueil="informe"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilMonTerritoire'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('q2');
    await o.cliquer(p.locator('#btnMonTerritoireCommencer'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-mt-choisir-departement]'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-choix-departement="87"]'), 700); await dormir(1.5);
    await o.survol(p.locator('#mtSaisieCommune'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('q3');
    await o.survol(p.locator('#mtSaisieRecherche'), 800); await dormir(0.4);
    await o.cliquer(p.locator('[data-mt-domaine="social"]'), 700); await dormir(1.8);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('q4');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('q5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
