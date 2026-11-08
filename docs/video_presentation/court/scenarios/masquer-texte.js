/* Lot A, vidéo A2 : masquer des informations dans un texte (relecture du CV déposé). 30 s au plus.
   Départ : le CV fictif est déjà déposé (préparé avant le début du film), écran « Vérifier le texte de votre CV ». */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
module.exports = {
  blocs: [
    { id: 'm1', voix: 'Une fois votre CV déposé, vous le relisez avant d’aller plus loin.', sous_titre: 'Une fois votre CV déposé, vous le relisez avant d’aller plus loin.' },
    { id: 'm2', voix: 'Les coordonnées repérées sont surlignées. Cliquez sur la croix pour en retirer une, ou sur le bouton jaune pour toutes les retirer.', sous_titre: 'Les coordonnées repérées sont surlignées : la croix en retire une, le bouton jaune les retire toutes.' },
    { id: 'm3', voix: 'L’application ne repère pas tout. Un employeur, une rue, un proche : effacez-les directement dans le texte.', sous_titre: 'L’application ne repère pas tout : un employeur, une rue, un proche… effacez-les dans le texte.' },
    { id: 'm4', voix: 'Rien n’est masqué à votre place. Vous décidez de ce qui reste.', sous_titre: 'Rien n’est masqué à votre place : vous décidez de ce qui reste.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Reprendre mon CV' }).first().click(); await dormir(1.0);
    await p.click('#btnReprendreCvCommencer'); await dormir(1.2);
    await p.setInputFiles('#depotPageFichier', FICHIER); await dormir(2.5);
    await p.evaluate(() => { const h = [...document.querySelectorAll('h2,h3,h4')].find(e => /Vérifier le texte/.test(e.textContent)); if (h) window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 120); });
    await p.mouse.move(640, 380); o.mx = 640; o.my = 380; await dormir(0.5);
    // ---- début du film
    o.commencer();
    await o.bloc('m1');
    await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('m2');
    const croix = p.locator('button', { hasText: /^✕$/ }).first();
    await o.cliquer(croix, 800); await dormir(0.6);
    await o.cliquer(p.locator('button', { hasText: 'Retirer toutes les informations sensibles' }).first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('m3');
    const zone = p.locator('#verifDocTextarea');
    await o.cliquer(zone, 800);
    await p.evaluate(() => { const t = document.getElementById('verifDocTextarea'); const i = t.value.indexOf('12 rue des Lilas,'); t.focus(); t.setSelectionRange(i, i + '12 rue des Lilas,'.length); }); await dormir(1.0);
    await p.keyboard.press('Delete'); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('m4');
    await dormir(1.2);
    await o.finDeVoix(1.0);
  }
};
