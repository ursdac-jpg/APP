/* Lot A, vidéo A1 : importer son CV (fichier, photo, texte copié). 30 s au plus.
   Départ : page « Reprendre votre CV », étape « Votre CV » (préparée avant le début du film). */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const IMAGE = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
module.exports = {
  blocs: [
    { id: 'i1', voix: 'Pour commencer, vous déposez votre CV, sous la forme que vous avez.', sous_titre: 'Pour commencer, vous déposez votre CV, sous la forme que vous avez.' },
    { id: 'i2', voix: 'Il est dans un document ouvert ? Copiez-le, puis cliquez sur Coller le texte.', sous_titre: 'Votre CV est dans un document ouvert ? Copiez-le, puis cliquez sur « Coller le texte ».' },
    { id: 'i3', voix: 'Sinon, cliquez sur Choisir un fichier : PDF, Word, texte, ou même une photo.', sous_titre: 'Sinon, « Choisir un fichier » : PDF, Word, texte, ou même une photo.' },
    { id: 'i4', voix: 'Le texte est lu dans votre navigateur. Il n’est envoyé nulle part. Relisez-le et corrigez-le si besoin.', sous_titre: 'Le texte est lu dans votre navigateur, il n’est envoyé nulle part. Relisez-le, corrigez-le.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Reprendre mon CV' }).first().click(); await dormir(1.0);
    await p.click('#btnReprendreCvCommencer'); await dormir(1.2);
    await p.evaluate(() => window.scrollTo(0, 0));
    await p.mouse.move(640, 300); o.mx = 640; o.my = 300; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('i1');
    await o.defiler(300, 1200);
    await o.survol(p.locator('#depotPageChoisir'), 800);
    await o.finDeVoix(0.3);
    await o.bloc('i2');
    await o.survol(p.locator('#depotPageColler'), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('i3');
    const fc = p.waitForEvent('filechooser', { timeout: 8000 });
    await o.cliquer(p.locator('#depotPageChoisir'), 800);
    const ch = await fc; await ch.setFiles(IMAGE); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('i4');
    await p.waitForFunction(() => document.body.innerText.indexOf('Vérifier le texte de votre CV') >= 0, null, { timeout: 15000 }).catch(() => {});
    await o.defiler(520, 1500); await dormir(1.0);
    await o.finDeVoix(1.0);
  }
};
