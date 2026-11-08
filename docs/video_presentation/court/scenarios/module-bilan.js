/* Lot C : présentation de « Analyser ma candidature » (environ 1 minute) : objectif, ce que le module ne fait pas, étapes, puis la dernière partie = le rapport (consigne 174).
   Mise en place hors film : le parcours réel jusqu'au rapport (CV fictif déposé, masqué, offre visée, réponse fictive collée), comme les autres modules d'analyse.
   Film : départ sur le rapport, « Revoir la présentation » (bouton réel), retour au module, lecture du rapport. */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
const REPONSE = fs.readFileSync('C:/Users/Denis/video_travail/ressources/reponse_fictive_bilan.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'b1', voix: 'Analyser ma candidature fait l’état des lieux de votre CV : ce qui est solide, ce qui peut faire hésiter un recruteur, ce qui peut s’améliorer.', sous_titre: 'Analyser ma candidature : ce qui est solide, ce qui peut faire hésiter, ce qui peut s’améliorer.' },
    { id: 'b2', voix: 'Votre CV n’est pas vous : ce n’est ni une note, ni un jugement. Vous déposez votre CV, vous masquez vos coordonnées, vous indiquez l’offre visée si vous en avez une. Un assistant en ligne le lit, et vous collez sa réponse.', sous_titre: 'Ni une note, ni un jugement. Votre CV masqué, l’offre visée, la réponse de l’assistant.' },
    { id: 'b3', voix: 'Le rapport commence par une synthèse, puis la première lecture du recruteur : ce qu’il perçoit en quelques secondes.', sous_titre: 'Le rapport : une synthèse, puis la première lecture du recruteur.' },
    { id: 'b4', voix: 'Chaque dimension est classée : convaincante, ou à ajuster. Pour chaque point, vous pouvez le garder comme Repère, dire que vous en avez pris connaissance, ou que vous n’êtes pas d’accord. Rien n’est effacé.', sous_titre: 'Chaque point : à garder comme Repère, « pris connaissance » ou « pas d’accord ». Rien n’est effacé.' },
    { id: 'b5', voix: 'Les recommandations sont concrètes, de la plus importante à la moindre. Vous corrigez dans l’application, ou vous imprimez une fiche de synthèse.', sous_titre: 'Des recommandations concrètes. Corriger dans l’application, ou imprimer une fiche de synthèse.' },
    { id: 'b6', voix: 'Ce module regarde l’état du CV. Un regard sur mon CV imagine la lecture d’un recruteur, et Les mots de votre CV compare le vocabulaire.', sous_titre: 'Ici, l’état du CV. Le regard d’un recruteur et les mots du CV sont d’autres modules.' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => naviguerVers('bilan')); await dormir(0.8);
    await p.click('#btnBilanIntroCommencer'); await dormir(1.2);
    await p.setInputFiles('#depotPageFichier', FICHIER); await dormir(2.5);
    await p.click('[data-retirer-toutes-detections]').catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer'); await dormir(1.5);
    await p.locator('[data-preparer-situation="offre"]').click(); await dormir(1.0);
    await p.fill('#ciblageOffre', 'Agent d’entretien H/F. Nettoyage de bureaux, entretien des surfaces, respect des consignes d’hygiène, gestion des stocks de produits.');
    await p.click('#btnSuivantNavigation'); await dormir(2.0);
    await p.locator('button', { hasText: 'Aller sur ChatGPT' }).first().click(); await dormir(1.5);
    await p.click('#validerAssistantIABtn'); await dormir(2.5);
    await p.click('#btnContinuerMaintenantIA'); await dormir(2.5);
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await p.click('[data-fc="retour"]'); await dormir(0.8);
    await p.click('[data-fc="coller"]'); await dormir(2.5);
    await p.click('#btnContinuerCollage'); await dormir(3.0);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await p.mouse.move(640, 560); o.mx = 640; o.my = 560; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('b1');
    await o.cliquer(p.locator('#btnRevoirPresentationBilan'), 900); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 220)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('b2');
    await p.evaluate(() => window.scrollBy(0, 400)); await dormir(1.8);
    await p.evaluate(() => window.scrollBy(0, 400)); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#btnBilanIntroRevenir, #btnBilanRevenirModuleHaut').first(), 800); await dormir(1.2);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await o.bloc('b3');
    await o.cliquer(p.locator('summary', { hasText: 'Première lecture du recruteur' }).first(), 900); await dormir(1.2);
    await o.defiler(300, 1300); await dormir(0.8);
    await o.finDeVoix(0.3);
    await o.bloc('b4');
    await o.cliquer(p.locator('summary', { hasText: 'Analyse par dimension' }).first(), 900); await dormir(0.8);
    await o.cliquer(p.locator('summary', { hasText: 'Points convaincants' }).first(), 900); await dormir(0.8);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 800);
    await o.survol(p.locator('button', { hasText: 'déjà pris connaissance' }).first(), 700);
    await o.survol(p.locator('button', { hasText: 'pas d’accord' }).first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('b5');
    await o.cliquer(p.locator('summary', { hasText: 'Recommandations' }).first(), 900); await dormir(0.8);
    await o.defiler(500, 1500); await dormir(0.6);
    await o.survol(p.locator('button', { hasText: 'Imprimer une fiche de synthèse' }), 900); await dormir(0.6);
    await o.survol(p.locator('#btnAgirOrganiserCV'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('b6');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
