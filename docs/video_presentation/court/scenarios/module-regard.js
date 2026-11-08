/* Lot C : présentation de « Un regard sur mon CV » (environ 1 minute) : objectif, simulation, étapes, puis la dernière partie = le résultat (consigne 174).
   Mise en place hors film : le parcours complet jusqu'au résultat (réponse fictive collée), comme regard-resultat.js.
   Film : départ sur le résultat, « Revoir la présentation » (bouton réel), retour au module, lecture du résultat. */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
const REPONSE = fs.readFileSync('C:/Users/Denis/video_travail/ressources/reponse_fictive_regard.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'g1', voix: 'Un regard sur mon CV vous prépare au regard qu’un recruteur porte sur votre dossier : ce qui ressort, ce qui peut faire hésiter, les questions probables.', sous_titre: 'Un regard sur mon CV : ce qui ressort, ce qui peut faire hésiter, les questions probables.' },
    { id: 'g2', voix: 'C’est une simulation, pas le verdict d’un vrai recruteur. Chaque doute est une question à vérifier, jamais une vérité sur vous.', sous_titre: 'Une simulation, pas un verdict. Chaque doute est une question à vérifier.' },
    { id: 'g3', voix: 'Vous préparez votre CV, en image ou en texte. Vous masquez votre nom et vos coordonnées, vous indiquez le poste visé. Un assistant en ligne le lit comme le ferait un recruteur.', sous_titre: 'Votre CV, vos informations masquées, le poste visé : un assistant le lit comme un recruteur.' },
    { id: 'g4', voix: 'Le résultat commence par une phrase générale : ce qu’un recruteur voit d’abord.', sous_titre: 'Le résultat : d’abord ce qu’un recruteur voit en premier.' },
    { id: 'g5', voix: 'Puis viennent les points forts et les doutes possibles. Chacun dit ce qui se voit, ce que cela peut dire, et une piste. Ce qui vous parle, vous le gardez comme Repère.', sous_titre: 'Chaque point : ce qui se voit, ce que cela peut dire, une piste. À garder comme Repère.' },
    { id: 'g6', voix: 'Plus bas, les questions qu’un recruteur pourrait poser, avec de l’aide pour y répondre. Ce module complète Analyser ma candidature, qui regarde l’état du CV, et Les mots de votre CV, qui compare le vocabulaire.', sous_titre: 'Plus bas : les questions probables. Un complément d’« Analyser ma candidature » et des mots du CV.' }
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
    await o.bloc('g1');
    await o.cliquer(p.locator('button.btn-revoir-module, button:has-text("Revoir la présentation")').first(), 900); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 200)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('g2');
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('g3');
    await p.evaluate(() => window.scrollBy(0, 300)); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnRegardRecruteurRevenirModuleBas, #btnRegardRecruteurRevenirModuleHaut').first(), 800); await dormir(1.2);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await o.bloc('g4');
    await o.survol(p.locator('text=En parcourant vite le texte').first(), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('g5');
    await o.defiler(330, 1500); await dormir(1.0);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 900); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('g6');
    await o.cliquer(p.locator('summary', { hasText: 'Décoder les questions' }).first(), 900); await dormir(0.8);
    await o.defiler(1100, 1400); await dormir(1.5);
    await o.finDeVoix(1.0);
  }
};
