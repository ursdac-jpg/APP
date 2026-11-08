/* Lot B, vidéo B6 : la page « Vos informations » (route projet) = répertoire des informations professionnelles (consigne 176). 30 s au plus.
   Départ : parcours « À la main, sans assistant », objectif « Répondre à une offre » choisi hors film, page ouverte en haut. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
module.exports = {
  blocs: [
    { id: 'c1', voix: 'Cette page est votre répertoire d’informations professionnelles.', sous_titre: 'Cette page est votre répertoire d’informations professionnelles.' },
    { id: 'c2', voix: 'Formations, expériences, langues, permis : vous les rangez ici, une seule fois.', sous_titre: 'Formations, expériences, langues, permis : rangés ici, une seule fois.' },
    { id: 'c3', voix: 'Par exemple, une expérience : le poste, l’employeur, les dates.', sous_titre: 'Par exemple, une expérience : le poste, l’employeur, les dates.' },
    { id: 'c4', voix: 'Ces informations seront reprises ensuite : elles apparaîtront sur votre CV.', sous_titre: 'Elles seront reprises ensuite : elles apparaîtront sur votre CV.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.click('#btnCarteAccueilCvNouveau'); await dormir(1.5);
    await p.click('#btnCreerCvSansAssistant'); await dormir(1.5);
    await p.click('#btnCreerCvCommencer'); await dormir(1.5);
    await p.click('[data-action="objectif"][data-value="offre"]'); await dormir(0.8);
    await p.evaluate(() => naviguerVers('projet')); await dormir(2.0);
    await p.locator('[data-blocs-tout="fermer"]').click(); await dormir(0.6);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.mouse.move(640, 250); o.mx = 640; o.my = 250; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.survol(p.locator('h1, h2').filter({ hasText: 'Vos informations' }).first(), 800); await dormir(0.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await o.cliquer(p.locator('[data-blocs-tout="ouvrir"]'), 700); await dormir(0.5);
    await p.evaluate(() => window.scrollBy(0, 900)); await dormir(1.0);
    await p.evaluate(() => window.scrollBy(0, 700)); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('c3');
    await p.evaluate(() => { const e = document.querySelector('#btnExpProOuvrir'); if (e) e.scrollIntoView({ block: 'center', behavior: 'instant' }); }); await dormir(0.4);
    await o.cliquer(p.locator('#btnExpProOuvrir'), 700); await dormir(0.8);
    await p.evaluate(() => { const e = [...document.querySelectorAll('h3,h4,h5,div')].find(x => x.textContent.trim() === 'Ajouter une expérience'); if (e) e.scrollIntoView({ block: 'start', behavior: 'instant' }); window.scrollBy(0, -120); }); await dormir(0.5);
    await o.cliquer(p.getByPlaceholder(/Vendeur/), 600); await p.getByPlaceholder(/Vendeur/).pressSequentially('Agent polyvalent', { delay: 60 }); await dormir(0.3);
    await o.cliquer(p.getByPlaceholder(/Boulangerie Martin/), 600); await p.getByPlaceholder(/Boulangerie Martin/).pressSequentially('Entreprise exemple', { delay: 60 }); await dormir(0.4);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.survol(p.locator('#btnSuivantNavigation'), 900); await dormir(0.8);
    await o.finDeVoix(1.0);
  }
};
