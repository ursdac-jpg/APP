/* Lot A, vidéo A5 : Besoin d'aide (l'ampoule : visite guidée de la page). 30 s au plus. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'b1', voix: 'L’ampoule, en haut, vous guide sur la page où vous êtes.', sous_titre: 'L’ampoule, en haut, vous guide sur la page où vous êtes.' },
    { id: 'b2', voix: 'Une visite en quelques étapes présente chaque zone. Cliquez sur Suivant pour avancer.', sous_titre: 'Une visite en quelques étapes présente chaque zone : « Suivant » pour avancer.' },
    { id: 'b3', voix: 'Vous pouvez la fermer quand vous voulez, et la rouvrir autant de fois que nécessaire.', sous_titre: 'Fermez-la quand vous voulez, rouvrez-la autant de fois que nécessaire.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Reprendre mon CV' }).first().click(); await dormir(1.0);
    await p.click('#btnReprendreCvCommencer'); await dormir(1.2);
    await p.mouse.move(640, 380); o.mx = 640; o.my = 380; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('b1');
    await o.cliquer(p.locator('#btnAide'), 900); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('b2');
    await o.cliquer(p.locator('#visiteGuideeSuivant'), 800); await dormir(1.8);
    await o.cliquer(p.locator('#visiteGuideeSuivant'), 700); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('b3');
    await o.cliquer(p.locator('#visiteGuideeFermer'), 800); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
