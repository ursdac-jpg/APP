/* Lot B, vidéo B1 : choisir un modèle de CV (allure, famille, modèle, « Garder ce modèle »). 30 s au plus.
   Départ : « Nos modèles de CV » (CV d'exemple), préparé avant le début du film. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'b1', voix: 'Pour choisir un modèle, commencez par l’allure : sobre, standard ou créatif.', sous_titre: 'Pour choisir un modèle, commencez par l’allure : sobre, standard ou créatif.' },
    { id: 'b2', voix: 'Puis une famille de modèles, et un modèle : l’aperçu change tout de suite.', sous_titre: 'Puis une famille, et un modèle : l’aperçu change tout de suite.' },
    { id: 'b3', voix: 'Il vous plaît ? Cliquez sur « Garder ce modèle ».', sous_titre: 'Il vous plaît ? Cliquez sur « Garder ce modèle ».' },
    { id: 'b4', voix: 'Vous pouvez en garder jusqu’à cinq, pour les comparer ensuite.', sous_titre: 'Vous pouvez en garder jusqu’à cinq, pour les comparer ensuite.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.click('#btnCarteAccueilCvNouveau'); await dormir(1.5);
    await p.click('#btnMgVoirModeles'); await dormir(2.5);
    await p.locator('[data-mep-allure]', { hasText: 'Standard' }).first().click().catch(() => {}); await dormir(1.0);
    await p.evaluate(() => { const e = document.querySelector('[data-mep-allure]'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.5);
    await p.mouse.move(640, 420); o.mx = 640; o.my = 420; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('b1');
    await o.cliquer(p.locator('[data-mep-allure]', { hasText: 'Sobre' }).first(), 800); await dormir(1.0);
    await o.cliquer(p.locator('[data-mep-allure]', { hasText: 'Créatif' }).first(), 800); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('b2');
    await o.cliquer(p.locator('[data-mep-galerie-fam="formes"]'), 800); await dormir(0.9);
    const vign = p.locator('[data-mep-galerie-creatif]');
    await o.cliquer(vign.nth(1), 800); await dormir(1.4);
    await o.finDeVoix(0.3);
    await o.bloc('b3');
    await o.cliquer(p.locator('#btnMgGarder'), 900); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('b4');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
