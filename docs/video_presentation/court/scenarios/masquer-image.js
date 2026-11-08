/* Pilote 1 : masquer les informations personnelles sur l'image d'un CV (rectangles). Écran « Un regard sur mon CV ». 30 s au plus. */
const { dormir } = require('../lib');
const CV = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.png';
module.exports = {
  blocs: [
    { id: 'm1', voix: 'Avant l’envoi à l’assistant en ligne, masquez ce qui est personnel.', sous_titre: 'Avant l’envoi à l’assistant en ligne, masquez ce qui est personnel.' },
    { id: 'm2', voix: 'Cliquez et faites glisser : un rectangle noir recouvre la photo, le nom et les coordonnées.', sous_titre: 'Cliquez et faites glisser : un rectangle noir recouvre la photo, le nom et les coordonnées.' },
    { id: 'm3', voix: 'Un rectangle de trop ? Cliquez dessus.', sous_titre: 'Un rectangle de trop ? Cliquez dessus.' },
    { id: 'm4', voix: 'Enregistrer prépare une copie masquée. Votre image d’origine n’est pas modifiée.', sous_titre: 'Enregistrer prépare une copie masquée. Votre image d’origine n’est pas modifiée.' },
    { id: 'm5', voix: 'Puis, Continuer.', sous_titre: 'Puis, Continuer.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto('http://localhost:8123/index.html'); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => naviguerVers('regard-recruteur')); await dormir(0.8);
    await p.click('#btnRegardRecruteurCommencer'); await dormir(0.8);
    await p.getByText('Lire aussi la présentation').first().click(); await dormir(0.6);
    await p.setInputFiles('input[data-rr-ajouter-images]', CV); await dormir(2.0);
    await p.click('#rrBtnMasquerImages'); await dormir(1.8);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.mouse.move(640, 560); await dormir(0.5);
    // ---- début du film
    o.commencer();
    await o.bloc('m1'); await o.finDeVoix(0.3);
    await o.bloc('m2');
    await o.defiler(400, 700); await dormir(0.3);
    const zone = async () => p.locator('#verifDocCanvas').boundingBox();
    const R = async (fx0, fy0, fx1, fy1) => { const bb = await zone(); await o.glisser(bb.x + bb.width * fx0, bb.y + bb.height * fy0, bb.x + bb.width * fx1, bb.y + bb.height * fy1, 550); };
    await R(0.08, 0.02, 0.26, 0.135);       // photo
    await R(0.36, 0.03, 0.68, 0.078);      // nom
    await R(0.03, 0.155, 0.31, 0.285);     // coordonnées
    await o.finDeVoix(0.5);
    await o.bloc('m3');
    await R(0.03, 0.30, 0.31, 0.40);       // rectangle de trop (compétences)
    await dormir(0.3);
    { const bb = await zone(); await o.cliquerA(bb.x + bb.width * 0.17, bb.y + bb.height * 0.35, 700); }
    await o.finDeVoix(0.4);
    await o.bloc('m4');
    await o.survol(p.locator('#verifDocBtnEnregistrer'), 800); await dormir(0.2);
    const dl = p.waitForEvent('download', { timeout: 6000 }).catch(() => null);
    await o.cliquer(p.locator('#verifDocBtnEnregistrer'), 300); await dl; await dormir(0.6);
    await o.finDeVoix(0.4);
    await o.bloc('m5');
    await o.cliquer(p.locator('#rrBtnImagesMasquees'), 800);
    await o.finDeVoix(0.9);
  }
};
