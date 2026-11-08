/* Lot C, vidéo pilote : présentation de « Mon Carnet » (environ 1 minute). Objectif, spécificité, complémentarité (Repères),
   bouton propre (l'icône du Carnet, consigne 175). Ton homogène (consigne 172), jamais de mot sur la difficulté. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Mon Carnet est un espace à vous, pour poser ce qui vous vient : une idée, un souvenir de travail, un numéro, une offre repérée. Pas de forme imposée, pas de catégorie à choisir.', sous_titre: 'Mon Carnet : un espace à vous pour poser ce qui vous vient. Ni forme imposée, ni catégorie à choisir.' },
    { id: 'c2', voix: 'Écrivez votre note, puis cliquez sur Noter. Elle s’ajoute en haut de la liste, avec un titre court proposé à partir de vos premiers mots.', sous_titre: 'Écrivez votre note, puis « Noter ». Elle s’ajoute en haut de la liste, avec un titre court proposé.' },
    { id: 'c3', voix: 'Astuce : la dictée vocale de votre appareil permet de parler au lieu d’écrire.', sous_titre: 'Astuce : la dictée vocale de votre appareil permet de parler au lieu d’écrire.' },
    { id: 'c4', voix: 'Vous pouvez relire une note, la modifier ou la supprimer quand vous voulez. Le Carnet ne corrige rien, et ne lit jamais vos notes de lui-même.', sous_titre: 'Relire, modifier, supprimer, quand vous voulez. Le Carnet ne corrige rien et ne lit rien de lui-même.' },
    { id: 'c5', voix: 'Une note peut aussi devenir un Repère : elle rejoint alors Mes Repères. Vous choisissez le moment.', sous_titre: 'Une note peut devenir un Repère : elle rejoint Mes Repères, au moment que vous choisissez.' },
    { id: 'c6', voix: 'Et l’icône du Carnet, sur le côté de l’écran, l’ouvre depuis n’importe quelle page : vous notez sans quitter ce que vous faisiez.', sous_titre: 'L’icône du Carnet l’ouvre depuis n’importe quelle page : vous notez sans quitter ce que vous faisiez.' }
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
    await o.cliquer(p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Mon Carnet' }).first(), 650); await dormir(1.0);
    await o.survol(p.locator('.carnet-couverture-h1').first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnCarnetIntroOuvrir'), 700); await dormir(0.6);
    await o.bloc('c2');
    await o.cliquer(p.locator('#carnetTexteNouveau'), 600);
    await p.locator('#carnetTexteNouveau').pressSequentially('Appeler l’agence lundi matin pour demander le plan d’accès.', { delay: 45 }); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarnetGarder'), 700); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    if (await p.locator('.carnet-astuce').count()) { await o.survol(p.locator('.carnet-astuce').first(), 800); }
    await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('.carnet-action', { hasText: 'Modifier' }).first(), 800);
    await o.survol(p.locator('.carnet-action', { hasText: 'Supprimer' }).first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.survol(p.locator('.carnet-action', { hasText: 'Transformer en Repère' }).first(), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarnet'), 900); await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
