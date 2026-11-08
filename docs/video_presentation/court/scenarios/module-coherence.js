/* Lot C : présentation de « Cohérence de mon dossier » (environ 1 minute) : objectif, ce que le module ne fait pas, étapes, puis la dernière partie = le rapport (consigne 174).
   Mise en place hors film : le parcours réel jusqu'au rapport (CV et lettre fictifs déposés, masqués, offre visée, réponse fictive collée).
   Film : départ sur le rapport, « Revoir la présentation » (bouton réel), retour au module, lecture du rapport. */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const R = 'C:/Users/Denis/video_travail/ressources/';
const REPONSE = fs.readFileSync(R + 'reponse_fictive_coherence.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'c1', voix: 'Cohérence de mon dossier vérifie que votre CV, votre lettre et votre préparation d’entretien racontent la même histoire.', sous_titre: 'Cohérence de mon dossier : le CV, la lettre et l’entretien racontent la même histoire.' },
    { id: 'c2', voix: 'On ne cherche pas une faute : on repère des écarts, et vous gardez la main. Vous déposez votre CV et votre lettre, votre préparation d’entretien si vous en avez une. Un assistant en ligne les compare, et vous collez sa réponse.', sous_titre: 'On repère des écarts, pas des fautes. Vos documents, un assistant les compare.' },
    { id: 'c3', voix: 'Le rapport s’ouvre sur une synthèse, puis sur ce qui concorde et ce qui peut s’enrichir, entre vos documents.', sous_titre: 'Le rapport : une synthèse, ce qui concorde, ce qui peut s’enrichir.' },
    { id: 'c4', voix: 'Les recommandations s’appliquent directement : à la lettre, ou au CV. Chaque point peut aussi se garder comme Repère.', sous_titre: 'Des recommandations à appliquer à la lettre ou au CV. À garder comme Repère.' },
    { id: 'c5', voix: 'Chaque document se retrouve sur une page, modifiable. Vous pouvez relancer l’analyse, ou aller plus loin avec votre entretien.', sous_titre: 'Chaque document modifiable. Relancer l’analyse, ou aller plus loin avec l’entretien.' },
    { id: 'c6', voix: 'Ce module compare les documents entre eux. Analyser ma candidature regarde le CV seul, et Un regard sur mon CV imagine la lecture d’un recruteur.', sous_titre: 'Ici, les documents entre eux. Le CV seul et le regard d’un recruteur sont d’autres modules.' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => naviguerVers('coherence-transversale')); await dormir(0.8);
    await p.click('#ctBoutonJeCommence'); await dormir(1.2);
    await p.setInputFiles('#depotPageFichier-cv', R + 'cv_fictif_camille.txt'); await dormir(2.5);
    await p.click('[data-retirer-toutes-detections]').catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer'); await dormir(1.5);
    await p.setInputFiles('#depotPageFichier-lettre', R + 'lettre_fictive_camille.txt'); await dormir(2.5);
    await p.click('[data-retirer-toutes-detections]').catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer').catch(() => {}); await dormir(1.5);
    await p.click('#btnCtCollecteSansEntretien'); await dormir(0.8);
    await p.locator('[data-ct-situation="offre"]').click(); await dormir(1.0);
    await p.click('#btnSuivantNavigation'); await dormir(2.5);
    await p.locator('button', { hasText: 'Aller sur ChatGPT' }).first().click(); await dormir(1.5);
    await p.click('#validerAssistantIABtn'); await dormir(2.5);
    await p.click('#btnContinuerMaintenantIA'); await dormir(2.5);
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await p.click('[data-fc="retour"]'); await dormir(0.8);
    await p.click('[data-fc="coller"]'); await dormir(2.5);
    await p.click('#btnContinuerCollage'); await dormir(3.5);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.4);
    await p.mouse.move(640, 560); o.mx = 640; o.my = 560; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('c1');
    await o.cliquer(p.locator('#btnCoherenceRevoirPresentation'), 900); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 220)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('c2');
    await p.evaluate(() => window.scrollBy(0, 400)); await dormir(1.8);
    await p.evaluate(() => window.scrollBy(0, 400)); await dormir(1.8);
    await o.finDeVoix(0.3);
    await o.cliquer(p.locator('#ctBoutonRevenirModule, button:has-text("Revenir au module")').first(), 800); await dormir(1.2);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.5);
    await o.bloc('c3');
    await o.cliquer(p.locator('summary', { hasText: 'Synthèse' }).first(), 900); await dormir(1.2);
    await o.defiler(300, 1300); await dormir(0.6);
    await o.cliquer(p.locator('summary', { hasText: 'Points forts' }).first(), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('c4');
    await o.cliquer(p.locator('summary', { hasText: 'Recommandations pour la Lettre' }).first(), 900); await dormir(0.8);
    await o.survol(p.locator('button', { hasText: 'Appliquer à ma lettre' }).first(), 800);
    await o.survol(p.locator('button', { hasText: 'Garder comme Repère' }).first(), 700);
    await o.finDeVoix(0.3);
    await o.bloc('c5');
    await o.defiler(700, 1500); await dormir(0.6);
    await o.survol(p.locator('#ctBoutonRelancerAnalyse'), 800); await dormir(0.5);
    await o.survol(p.locator('#ctBoutonEntretienAvance'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('c6');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
