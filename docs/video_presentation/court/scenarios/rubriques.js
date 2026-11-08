/* Lot B, vidéo B3 : choisir ses rubriques (par exemple les compétences). 30 s au plus.
   Départ : « Nos modèles de CV », modèle standard (hors film), « Réglages supplémentaires » en haut de l'écran. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Chaque rubrique du CV a sa carte de réglages. Prenons les compétences.', sous_titre: 'Chaque rubrique a sa carte de réglages. Prenons les compétences.' },
    { id: 'c2', voix: 'Le bandeau « Compétences clés » les regroupe sous l’en-tête. Un clic sur Oui.', sous_titre: 'Le bandeau « Compétences clés » les regroupe sous l’en-tête : un clic sur Oui.' },
    { id: 'c3', voix: 'L’aperçu change tout de suite. Un clic sur Non ramène l’affichage d’avant.', sous_titre: 'L’aperçu change tout de suite. Un clic sur Non ramène l’affichage d’avant.' },
    { id: 'c4', voix: 'Même principe pour les autres rubriques : vous choisissez ce qui s’affiche, et ce qui reste de côté.', sous_titre: 'Même principe pour les autres rubriques : afficher, ou laisser de côté.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.click('#btnCarteAccueilCvNouveau'); await dormir(1.5);
    await p.click('#btnMgVoirModeles'); await dormir(2.5);
    await p.evaluate(() => { const e = document.querySelector('#mepRegSupp > summary'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -90); }); await dormir(0.6);
    await p.mouse.move(640, 300); o.mx = 640; o.my = 300; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('#mepRegSupp > summary'), 700); await dormir(0.8);
    await p.evaluate(() => { const e = document.querySelector('#mepSupp-comp > summary'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -90); }); await dormir(0.4);
    await o.cliquer(p.locator('#mepSupp-comp > summary'), 700); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await p.evaluate(() => { const e = document.querySelector('[data-mep-bandeaucompcles="1"]'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.4);
    await o.cliquer(p.locator('[data-mep-bandeaucompcles="1"]'), 700); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await o.cliquer(p.locator('[data-mep-bandeaucompcles="0"]'), 700); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(p.locator('#mepSupp-comp > summary'), 700); await dormir(0.5);
    await p.evaluate(() => { const e = document.querySelector('#mepSupp-autres > summary'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -90); }); await dormir(0.4);
    await o.cliquer(p.locator('#mepSupp-autres > summary'), 700); await dormir(0.6);
    await o.survol(p.locator('[data-mep-rubrique="experiencesPersonnelles"][data-mep-rubrique-vis="0"]'), 700);
    await o.survol(p.locator('[data-mep-rubrique="engagements"][data-mep-rubrique-vis="1"]'), 700);
    await o.finDeVoix(1.0);
  }
};
