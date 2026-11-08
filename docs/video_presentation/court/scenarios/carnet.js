/* Pilote 3 : Mon Carnet (poser une note, la retrouver, le Carnet toujours à portée). 30 s au plus. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Mon Carnet est un espace pour poser ce qui vous vient, tel que ça vient.', sous_titre: 'Mon Carnet : un espace pour poser ce qui vous vient, tel que ça vient.' },
    { id: 'c2', voix: 'Écrivez votre note, puis cliquez sur Noter.', sous_titre: 'Écrivez votre note, puis cliquez sur Noter.' },
    { id: 'c3', voix: 'Elle s’ajoute à la liste. Vous pouvez la modifier, la supprimer, ou la transformer en Repère.', sous_titre: 'Elle s’ajoute à la liste : modifier, supprimer, ou transformer en Repère.' },
    { id: 'c4', voix: 'Et l’icône sur le côté ouvre le Carnet depuis n’importe quelle page.', sous_titre: 'L’icône sur le côté ouvre le Carnet depuis n’importe quelle page.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('[data-carte-accueil="boiteaoutils"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Mon Carnet' }).first(), 650); await dormir(0.6);
    await o.cliquer(p.locator('#btnCarnetIntroOuvrir'), 700); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('#carnetTexteNouveau'), 600);
    await p.locator('#carnetTexteNouveau').pressSequentially('Appeler l’agence lundi matin pour demander le plan d’accès.', { delay: 38 }); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarnetGarder'), 700); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.survol(p.locator('.carnet-action', { hasText: 'Modifier' }).first(), 800);
    await o.survol(p.locator('.carnet-action', { hasText: 'Transformer en Repère' }).first(), 600);
    await o.survol(p.locator('.carnet-action', { hasText: 'Supprimer' }).first(), 600);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarnet'), 900); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
