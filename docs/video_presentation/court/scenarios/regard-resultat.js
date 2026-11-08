/* Lot A, vidéo A8 : lire le résultat d'un regard sur le CV (« Un regard sur mon CV », mode texte). 30 s au plus.
   Départ : écran « Ce qu'on voit sur votre CV » (réponse fictive collée hors film). */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
const REPONSE = fs.readFileSync('C:/Users/Denis/video_travail/ressources/reponse_fictive_regard.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'r1', voix: 'Le regard commence par une phrase générale : ce qu’un recruteur voit d’abord.', sous_titre: 'Le regard commence par une phrase générale : ce qu’un recruteur voit d’abord.' },
    { id: 'r2', voix: 'Les parties importantes sont ouvertes, les autres se déplient d’un clic. Un point dit ce qui se voit, ce que cela peut dire, et une piste.', sous_titre: 'Les parties importantes sont ouvertes. Chaque point : ce qui se voit, ce que cela peut dire, une piste.' },
    { id: 'r3', voix: 'Plus bas, les questions qu’un recruteur pourrait poser, avec de l’aide pour y répondre.', sous_titre: 'Plus bas, les questions qu’un recruteur pourrait poser, avec de l’aide pour répondre.' },
    { id: 'r4', voix: 'Ce qui vous parle, vous le gardez dans une fiche.', sous_titre: 'Ce qui vous parle, vous le gardez dans une fiche.' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => naviguerVers('regard-recruteur')); await dormir(0.8);
    await p.click('#btnRegardRecruteurCommencer'); await dormir(0.9);
    await p.getByText('Lire le contenu seul').first().click(); await dormir(0.8);
    await p.setInputFiles('#depotPageFichier', FICHIER); await dormir(2.5);
    await p.click('[data-retirer-toutes-detections]').catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer'); await dormir(1.2);
    await p.locator('[data-mode-recherche]', { hasText: 'Un métier précis' }).first().click(); await dormir(0.6);
    await p.locator('[data-type-recherche]', { hasText: 'simplement un emploi' }).first().click(); await dormir(0.6);
    await p.click('#btnSuivantNavigation'); await dormir(1.8);
    await p.locator('button', { hasText: 'Aller sur ChatGPT' }).first().click(); await dormir(1.5);
    await p.click('#validerAssistantIABtn'); await dormir(2.5);
    await p.click('#btnContinuerMaintenantIA'); await dormir(2.5);
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await p.click('[data-fc="retour"]'); await dormir(0.8);
    await p.click('[data-fc="coller"]'); await dormir(2.5);
    await p.click('#btnContinuerCollage'); await dormir(2.5);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await p.mouse.move(640, 560); o.mx = 640; o.my = 560; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('r1');
    await o.survol(p.locator('text=En parcourant vite le texte').first(), 900); await dormir(1.2);
    await o.finDeVoix(0.3);
    await o.bloc('r2');
    await o.defiler(330, 1500); await dormir(1.2);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 900); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('r3');
    await o.cliquer(p.locator('summary', { hasText: 'Décoder les questions' }).first(), 900); await dormir(0.8);
    await o.defiler(1100, 1400); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('r4');
    await o.survol(p.locator('#btnSuivantNavigation'), 900); await dormir(1.2);
    await o.finDeVoix(1.0);
  }
};
