/* Lot C : présentation de « Employeurs près de chez moi » (environ 1 minute). Spécificité : des adresses d'employeurs du département, rangées par secteur, pour une candidature
   spontanée ; pas d'offres recopiées. Complémentarité : le CV et la lettre se préparent dans « Me préparer à candidater », « Qui fait quoi » répond aux autres besoins.
   Parcours joué à l'écran, dans l'application réelle (département de la Haute-Vienne, secteur Propreté). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'm1', voix: 'Employeurs près de chez moi vous donne des adresses d’employeurs de votre département, pour candidater même quand il n’y a pas d’annonce.', sous_titre: 'Employeurs près de chez moi : des adresses, même sans annonce.' },
    { id: 'm2', voix: 'Beaucoup d’emplois ne sont jamais annoncés. Vous choisissez votre département, puis un secteur, ou vous tapez un métier.', sous_titre: 'Beaucoup d’emplois ne sont pas annoncés. Votre département, puis un secteur ou un métier.' },
    { id: 'm3', voix: 'Vous voyez la liste des employeurs, par commune. Chaque fiche donne des conseils pour candidater, et mène à la page de recrutement de l’employeur.', sous_titre: 'La liste par commune. Chaque fiche : des conseils, et la page de recrutement.' },
    { id: 'm4', voix: 'Ce n’est pas une liste d’offres, ni une recommandation : les listes ne sont pas complètes, et une erreur peut être signalée. Les offres publiées se trouvent sur les pages des employeurs eux-mêmes.', sous_titre: 'Pas une liste d’offres, ni une recommandation. Une erreur peut se signaler.' },
    { id: 'm5', voix: 'Votre CV et votre lettre se préparent dans Me préparer à candidater. Pour le logement ou les déplacements, c’est Qui fait quoi.', sous_titre: 'CV et lettre : « Me préparer à candidater ». Autres besoins : « Qui fait quoi ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('m1');
    await o.cliquer(p.locator('[data-carte-accueil="preparer"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilEmployeurs'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('m2');
    await o.cliquer(p.locator('#btnEmployeursCommencer'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-mt-choisir-departement]'), 700); await dormir(1.2);
    await o.cliquer(p.locator('[data-choix-departement="87"]'), 700); await dormir(1.5);
    await o.survol(p.locator('#mtSaisieRecherche'), 800); await dormir(0.4);
    await o.survol(p.locator('[data-mt-offres]'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('m3');
    await o.cliquer(p.locator('[data-mt-secteur="proprete"]'), 700); await dormir(1.5);
    await o.cliquer(p.locator('[data-mt-commune="secteur"][data-mt-commune-v="Limoges"]'), 700); await dormir(1.5);
    await o.cliquer(p.locator('[data-mt-fiche="onet-proprete"]'), 700); await dormir(1.5);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.8);
    await o.defiler(350, 1300); await dormir(0.6);
    await o.survol(p.locator('a', { hasText: 'Page de recrutement' }).first(), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('m4');
    await o.survol(p.locator('button', { hasText: 'Signaler une erreur' }).first(), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('m5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
