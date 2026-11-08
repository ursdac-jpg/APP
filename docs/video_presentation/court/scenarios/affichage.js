/* Lot A, vidéo A4 : préférences d'affichage (thème, grands boutons, taille du texte). 30 s au plus. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'p1', voix: 'La roue, en haut à gauche, ouvre vos préférences d’affichage.', sous_titre: 'La roue, en haut à gauche, ouvre vos préférences d’affichage.' },
    { id: 'p2', voix: 'Choisissez le thème clair ou sombre : le changement est immédiat.', sous_titre: 'Choisissez le thème clair ou sombre : le changement est immédiat.' },
    { id: 'p3', voix: 'Vous pouvez aussi agrandir les boutons, et agrandir le texte.', sous_titre: 'Vous pouvez aussi agrandir les boutons, et agrandir le texte.' },
    { id: 'p4', voix: 'Vos choix sont gardés sur cet appareil. Vous les retrouvez à chaque visite.', sous_titre: 'Vos choix sont gardés sur cet appareil, pour vos prochaines visites.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 380); o.mx = 640; o.my = 380; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('p1');
    await o.cliquer(p.locator('#btnPreferencesAffichage'), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('p2');
    const pan = p.locator('#panneauPreferencesAffichage');
    await o.cliquer(pan.locator('button', { hasText: /^Sombre$/ }), 800); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.bloc('p3');
    await o.cliquer(pan.locator('.pref-affichage-groupe', { hasText: 'Grands boutons' }).locator('button', { hasText: /^Activé$/ }), 800); await dormir(0.6);
    await o.cliquer(pan.locator('summary', { hasText: 'Taille du texte' }), 700); await dormir(0.5);
    await o.cliquer(pan.locator('button', { hasText: /^Grand$/ }), 700); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('p4');
    await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
