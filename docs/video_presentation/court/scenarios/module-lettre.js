/* Lot C : présentation de « Écrire ma lettre avec l'assistant » (environ 1 minute). Spécificité : on n'écrit pas seul, l'assistant propose, la personne garde la main ;
   la lettre co-écrite revient dans la page, mise en page, modifiable. Complémentarité : Cohérence de mon dossier vérifie ensuite que la lettre va avec le CV.
   Tout le parcours est joué à l'écran, dans l'application réelle (CV et réponse de l'assistant fictifs). */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const R = 'C:/Users/Denis/video_travail/ressources/';
const REPONSE = fs.readFileSync(R + 'reponse_fictive_lettre.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'l1', voix: 'Écrire ma lettre avec l’assistant vous évite la page blanche. Vous n’écrivez pas seul : l’assistant propose, et vous gardez la main sur chaque phrase.', sous_titre: 'Écrire ma lettre avec l’assistant : pas de page blanche, vous gardez la main sur chaque phrase.' },
    { id: 'l2', voix: 'Rien n’est écrit sans que vous le validiez. Vous déposez votre CV, vous masquez vos coordonnées, puis vous dites quel poste vous visez.', sous_titre: 'Votre CV masqué, le poste visé. Rien n’est écrit sans votre accord.' },
    { id: 'l3', voix: 'Un assistant en ligne échange avec vous, au clavier ou à la voix. Vous reprenez, modifiez, coupez, autant de fois qu’il le faut. Puis vous collez ici la lettre écrite ensemble.', sous_titre: 'Vous échangez avec l’assistant, puis vous collez ici la lettre écrite ensemble.' },
    { id: 'l4', voix: 'Votre lettre apparaît mise en page, modifiable. Vous choisissez la feuille A4, ou un message court pour un courriel, puis vous la validez.', sous_titre: 'La lettre mise en page : feuille A4 ou message pour un courriel. Vous la validez.' },
    { id: 'l5', voix: 'Pour vérifier que cette lettre va bien avec votre CV, il y a Cohérence de mon dossier.', sous_titre: 'Ensuite, « Cohérence de mon dossier » vérifie que la lettre va avec votre CV.' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('l1');
    await o.cliquer(p.locator('[data-carte-accueil="preparer"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilLettre'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('l2');
    await o.cliquer(p.locator('#btnCoLettreCommencer'), 700); await dormir(1.0);
    await p.setInputFiles('#depotPageFichier', R + 'cv_fictif_camille.txt'); await dormir(2.0);
    await o.cliquer(p.locator('[data-retirer-toutes-detections]'), 700).catch(() => {}); await dormir(0.5);
    await o.cliquer(p.locator('#verifDocBtnEnregistrer'), 600); await dormir(0.8);
    await o.cliquer(p.locator('[data-action="objectif"][data-value="offre"]'), 600); await dormir(0.6);
    await o.cliquer(p.locator('#rechercheMetierCibleInput'), 500); await p.keyboard.type('Agent d’entretien', { delay: 40 }); await dormir(0.5);
    await o.cliquer(p.locator('#btnValiderMetierSaisi'), 500); await dormir(0.6);
    await p.evaluate(() => { const d = document.querySelector('[data-situation-actuelle]').closest('details'); if (d) d.open = true; }); await dormir(0.6);
    await o.cliquer(p.locator('[data-situation-actuelle="recherche"]'), 600); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('l3');
    await o.cliquer(p.locator('#btnCoLettreVersAssistantBarre'), 700); await dormir(1.8);
    await o.cliquer(p.locator('button', { hasText: 'Aller sur ChatGPT' }).first(), 700); await dormir(1.3);
    await o.cliquer(p.locator('#validerAssistantIABtn'), 600); await dormir(2.0);
    await o.cliquer(p.locator('#btnContinuerMaintenantIA'), 600); await dormir(1.8);
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await o.cliquer(p.locator('[data-fc="retour"]'), 600); await dormir(0.6);
    await o.cliquer(p.locator('[data-fc="coller"]'), 600); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('l4');
    await o.cliquer(p.locator('#btnContinuerCollage'), 700); await dormir(2.5);
    await p.locator('#btnEnregistrerIdentite').scrollIntoViewIfNeeded(); await o.cliquer(p.locator('#btnEnregistrerIdentite'), 700); await dormir(2.0);
    await p.evaluate(() => window.scrollTo(0, 0)); await dormir(0.8);
    await o.survol(p.locator('[data-format-page="A4-essentiel"]'), 800); await dormir(0.6);
    await o.survol(p.locator('#btnSuivantNavigation'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('l5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
