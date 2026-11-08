/* Lot C : présentation de « M'entraîner à un entretien » (environ 1 minute). Spécificité : on s'entraîne en discutant avec un assistant, sans note ni faux recruteur ;
   la préparation revient dans la page (présentation, points à préparer, questions probables, questions à poser). Complémentarité : Cohérence de mon dossier.
   Tout le parcours est joué à l'écran, dans l'application réelle (CV et réponse de l'assistant fictifs). */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const R = 'C:/Users/Denis/video_travail/ressources/';
const REPONSE = fs.readFileSync(R + 'reponse_fictive_entretien.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'e1', voix: 'M’entraîner à un entretien vous prépare au dialogue. Un assistant en ligne vous pose des questions à partir de votre CV et du poste visé, puis il s’ajuste à vos réponses.', sous_titre: 'M’entraîner à un entretien : des questions à partir de votre CV et du poste visé.' },
    { id: 'e2', voix: 'Ce n’est pas un texte à réciter, ni une simulation notée : personne ne vous juge. Vous déposez votre CV, vous masquez vos coordonnées, vous indiquez le poste visé.', sous_titre: 'Pas de texte à réciter, pas de note. Votre CV masqué, le poste visé.' },
    { id: 'e3', voix: 'Vous répondez aux questions, au clavier ou à voix haute avec un assistant qui le permet. Puis vous collez ici la préparation.', sous_titre: 'Vous répondez, au clavier ou à voix haute, puis vous collez ici la préparation.' },
    { id: 'e4', voix: 'Vous obtenez votre présentation, les points à préparer, les questions probables, et celles à poser au recruteur. Vous pouvez la modifier et choisir sa couleur.', sous_titre: 'Votre présentation, les points à préparer, les questions probables, celles à poser.' },
    { id: 'e5', voix: 'Cette préparation sert ensuite à Cohérence de mon dossier, qui vérifie que ce que vous direz va avec vos documents.', sous_titre: 'Elle sert ensuite à « Cohérence de mon dossier », avec vos documents.' }
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
    await o.bloc('e1');
    await o.cliquer(p.locator('[data-carte-accueil="preparer"]'), 800); await dormir(0.4);
    await o.cliquer(p.locator('#btnCarteAccueilEntretien'), 650); await dormir(1.5);
    await p.evaluate(() => window.scrollBy(0, 250)); await dormir(1.5);
    await o.finDeVoix(0.3);
    await o.bloc('e2');
    await o.cliquer(p.locator('#btnPrepaEntretienCommencer'), 700); await dormir(1.0);
    await p.setInputFiles('#depotPageFichier', R + 'cv_fictif_camille.txt'); await dormir(2.0);
    await o.cliquer(p.locator('[data-retirer-toutes-detections]'), 700).catch(() => {}); await dormir(0.5);
    await o.cliquer(p.locator('#verifDocBtnEnregistrer'), 600); await dormir(0.8);
    await o.cliquer(p.locator('[data-lettre-reponse="non"]'), 600); await dormir(0.5);
    await o.cliquer(p.locator('[data-action="objectif"][data-value="offre"]'), 600); await dormir(0.6);
    await o.cliquer(p.locator('#rechercheMetierCibleInput'), 500); await p.keyboard.type('Agent d’entretien', { delay: 40 }); await dormir(0.5);
    await o.cliquer(p.locator('#btnValiderMetierSaisi'), 500); await dormir(0.6);
    await p.evaluate(() => { const d = document.querySelector('[data-situation-actuelle]').closest('details'); if (d) d.open = true; }); await dormir(0.6);
    await o.cliquer(p.locator('[data-situation-actuelle="recherche"]'), 600); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('e3');
    await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(1.8);
    await o.cliquer(p.locator('button', { hasText: 'Aller sur ChatGPT' }).first(), 700); await dormir(1.3);
    await o.cliquer(p.locator('#validerAssistantIABtn'), 600); await dormir(2.0);
    await o.cliquer(p.locator('#btnContinuerMaintenantIA'), 600); await dormir(1.8);
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await o.cliquer(p.locator('[data-fc="retour"]'), 600); await dormir(0.6);
    await o.cliquer(p.locator('[data-fc="coller"]'), 600); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('e4');
    await o.cliquer(p.locator('#btnContinuerCollage'), 700); await dormir(2.5);
    await o.survol(p.locator('[data-couleur-base="vert"]'), 800); await dormir(0.5);
    await o.defiler(450, 1500); await dormir(0.8);
    await o.survol(p.locator('#btnSuggererLettreModule'), 800); await dormir(0.6);
    await o.finDeVoix(0.3);
    await o.bloc('e5');
    await dormir(2.0);
    await o.finDeVoix(1.0);
  }
};
