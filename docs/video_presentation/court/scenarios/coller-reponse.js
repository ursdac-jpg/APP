/* Lot A, vidéo A3 : coller la réponse de l'assistant dans l'application. 30 s au plus.
   Départ : l'application a déjà envoyé la demande (« Ouvrir maintenant » cliqué hors film, onglet externe bloqué et refermé),
   la réponse fictive est dans le presse-papiers. Écran réel « Collez la réponse de l'assistant ». */
const fs = require('fs');
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const FICHIER = 'C:/Users/Denis/video_travail/ressources/cv_fictif_camille.txt';
const REPONSE = fs.readFileSync('C:/Users/Denis/video_travail/ressources/reponse_fictive_assistant.txt', 'utf8');
module.exports = {
  contexte: { permissions: ['clipboard-read', 'clipboard-write'] },
  blocs: [
    { id: 'a1', voix: 'Quand l’assistant a répondu, copiez toute sa réponse, puis revenez sur l’application.', sous_titre: 'Quand l’assistant a répondu, copiez toute sa réponse, puis revenez ici.' },
    { id: 'a2', voix: 'Cliquez sur « Je suis de retour ».', sous_titre: 'Cliquez sur « Je suis de retour ».' },
    { id: 'a3', voix: 'Puis sur « Coller la réponse ». Si votre navigateur demande l’autorisation de lire ce que vous avez copié, acceptez.', sous_titre: 'Puis « Coller la réponse ». Si le navigateur demande l’autorisation de lire votre copie, acceptez.' },
    { id: 'a4', voix: 'L’application vérifie que tout est lisible. Il ne reste qu’à cliquer sur « Vérifier mes informations ».', sous_titre: 'L’application vérifie que tout est lisible : « Vérifier mes informations ».' }
  ],
  async jouer(o) {
    const p = o.p;
    await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
    o.ctx.on('page', pg => { pg.close().catch(() => {}); });
    await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
    await p.click('[data-carte-accueil="mesdocuments"]'); await dormir(0.6);
    await p.locator('#fenetreERIP .sous-carte-accueil', { hasText: 'Reprendre mon CV' }).first().click(); await dormir(1.0);
    await p.click('#btnReprendreCvCommencer'); await dormir(1.2);
    await p.setInputFiles('#depotPageFichier', FICHIER); await dormir(2.5);
    await p.locator('button', { hasText: 'Retirer toutes les informations sensibles' }).first().click().catch(() => {}); await dormir(0.6);
    await p.click('#verifDocBtnEnregistrer'); await dormir(1.5);
    await p.locator('.carte-objectif', { hasText: 'Voie 1' }).first().click(); await dormir(1.5);
    await p.locator('text=Répondre à une offre').first().click(); await dormir(1.0);
    await p.fill('#rechercheMetierCibleInput', 'Agent d’entretien'); await dormir(0.6);
    await p.click('#btnValiderMetierSaisi'); await dormir(0.8);
    for (const t of ['Je ne sais pas', 'Non']) {
      for (const l of await p.locator('button:visible', { hasText: new RegExp('^' + t + '$') }).all()) { await l.click().catch(() => {}); await dormir(0.2); }
    }
    await p.click('#btnSuivantNavigation'); await dormir(2.0);
    await p.locator('button', { hasText: 'Aller sur ChatGPT' }).first().click(); await dormir(1.5);
    await p.click('#validerAssistantIABtn'); await dormir(3.0);
    await p.click('#btnContinuerMaintenantIA'); await dormir(3.0);
    // La réponse fictive remplace la demande dans le presse-papiers (hors film).
    await p.evaluate(t => navigator.clipboard.writeText(t), REPONSE); await dormir(0.3);
    await p.evaluate(() => window.scrollTo(0, 380)); await dormir(0.5);
    await p.mouse.move(640, 300); o.mx = 640; o.my = 300; await dormir(0.4);
    // ---- début du film
    o.commencer();
    await o.bloc('a1');
    await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('a2');
    await o.cliquer(p.locator('[data-fc="retour"]'), 900); await dormir(1.0);
    await o.finDeVoix(0.3);
    await o.bloc('a3');
    await o.cliquer(p.locator('[data-fc="coller"]'), 900); await dormir(2.0);
    await o.finDeVoix(0.3);
    await o.bloc('a4');
    await o.survol(p.locator('#btnContinuerCollage'), 900); await dormir(1.2);
    await o.finDeVoix(1.0);
  }
};
