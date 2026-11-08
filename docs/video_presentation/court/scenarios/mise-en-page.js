/* Lot B, vidéo B2 : bandeau, composition, formes (régler la mise en page avec les boutons au-dessus de l'aperçu). 30 s au plus.
   Départ : « Nos modèles de CV », modèle « Bandeau entier » choisi (hors film). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Au-dessus de l’aperçu : le bandeau, la composition, les formes.', sous_titre: 'Au-dessus de l’aperçu : le bandeau, la composition, les formes.' },
    { id: 'c2', voix: 'Le bandeau : choisissez sa forme, arrondie, en vague, en pointe.', sous_titre: 'Le bandeau : choisissez sa forme, arrondie, en vague, en pointe.' },
    { id: 'c3', voix: 'La composition place autrement le nom, la photo et les coordonnées.', sous_titre: 'La composition place autrement le nom, la photo, les coordonnées.' },
    { id: 'c4', voix: 'Les formes décoratives : vous les déplacez, vous choisissez leur taille et leur orientation. Le résultat est à droite.', sous_titre: 'Les formes se déplacent : taille et orientation au choix. Résultat à droite.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.click('#btnCarteAccueilCvNouveau'); await dormir(1.5);
    await p.click('#btnMgVoirModeles'); await dormir(2.5);
    await p.locator('[data-mep-allure]', { hasText: 'Créatif' }).first().click(); await dormir(1.2);
    await p.locator('[data-mep-galerie-creatif="mqBandeau"]').first().click(); await dormir(1.5);
    await p.evaluate(() => { const e = document.querySelector('[data-mep-onglet="bandeau"]'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -140); }); await dormir(0.6);
    await p.mouse.move(640, 300); o.mx = 640; o.my = 300; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.survol(p.locator('[data-mep-onglet="bandeau"]').first(), 650);
    await o.survol(p.locator('[data-mep-onglet="composition"]').first(), 700);
    await o.survol(p.locator('[data-mep-onglet="formes"]').first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await o.cliquer(p.locator('[data-mep-onglet="bandeau"]').first(), 700); await dormir(0.6);
    await o.cliquer(p.locator('[data-mep-forme="vallonne"]'), 650); await dormir(0.7);
    await o.cliquer(p.locator('[data-mep-forme="pointe"]'), 700); await dormir(0.7);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('[data-mep-onglet="composition"]').first(), 700); await dormir(0.6);
    await o.cliquer(p.locator('[data-mep-compo="equerre"]'), 650); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(p.locator('[data-mep-onglet="formes"]').first(), 700); await dormir(0.6);
    await o.cliquer(p.locator('[data-mep-proposition="losange"]'), 650); await dormir(0.8);
    await o.survol(p.locator('.gab-tiroir-note').filter({ hasText: 'bouger librement' }).first(), 700); await dormir(0.6);
    await o.finDeVoix(1.0);
  }
};
