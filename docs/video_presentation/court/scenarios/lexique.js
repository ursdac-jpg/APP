/* Lot A, vidéo A7 : le Lexique (« Mots de cette page », une fiche, la recherche d'un mot). 30 s au plus.
   Départ : page « Préparer la mise à jour » (Reprendre mon CV, voie 1), préparée avant le début du film. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
module.exports = {
  blocs: [
    { id: 'l1', voix: 'Sur beaucoup de pages, le bouton « Mots de cette page » liste les mots utiles.', sous_titre: 'Sur beaucoup de pages, « Mots de cette page » liste les mots utiles.' },
    { id: 'l2', voix: 'Cliquez sur un mot : sa fiche s’ouvre dans le Lexique, expliquée simplement.', sous_titre: 'Cliquez sur un mot : sa fiche s’ouvre dans le Lexique, expliquée simplement.' },
    { id: 'l3', voix: 'Ce bouton vous ramène à la page où vous étiez.', sous_titre: 'Ce bouton vous ramène à la page où vous étiez.' },
    { id: 'l4', voix: 'Vous pouvez aussi chercher n’importe quel mot, un sigle ou une question.', sous_titre: 'Vous pouvez aussi chercher un mot, un sigle ou une question.' }
  ],
  async jouer(o) {
    const p = o.p;
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Reprendre mon CV' }).first().click(); await dormir(1.0);
    await p.click('#btnReprendreCvCommencer'); await dormir(1.2);
    await p.setInputFiles('#depotPageFichier', FICHIER); await dormir(2.5);
    await p.locator('button', { hasText: 'Retirer toutes les informations sensibles' }).first().click().catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer'); await dormir(1.5);
    await p.locator('.carte-objectif', { hasText: 'Voie 1' }).first().click(); await dormir(1.5);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await p.mouse.move(640, 420); o.mx = 640; o.my = 420; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('l1');
    await o.cliquer(p.locator('.mots-page-bouton').first(), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('l2');
    await o.cliquer(p.locator('.mots-page-zone .chapitre-lexique', { hasText: 'Stage' }).first(), 800); await dormir(0.8);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('l3');
    await o.survol(p.locator('button, a', { hasText: 'Revenir à' }).first(), 800); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('l4');
    await o.cliquer(p.locator('#lexiqueRetourRecherche'), 800); await dormir(0.8);
    await o.cliquer(p.locator('#lexiqueRechercheInput'), 700);
    await p.locator('#lexiqueRechercheInput').pressSequentially('CDD', { delay: 200 }); await dormir(2.6);
    await o.finDeVoix(1.0);
  }
};
