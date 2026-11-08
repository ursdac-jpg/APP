/* Lot C : gestes communs des huit vidéos de la carte « Mes documents » (Créer un nouveau CV x3, Reprendre mon CV x3, Lettre et entretien en version rapide x2).
   Une seule source : le départ (page, assistants externes bloqués), l'ouverture d'une tuile et le dépôt du CV fictif de Camille, joués à l'écran dans l'application réelle. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';
const R = 'C:/Users/Denis/video_travail/ressources/';

async function preparer(o) {
  const p = o.p;
  await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
  o.ctx.on('page', pg => { pg.close().catch(() => {}); });
  await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
}

// Ouvre la carte « Mes documents » puis une tuile, et fait défiler la présentation (la voix du premier bloc est déjà lancée par l'appelant).
async function ouvrirTuile(o, tuileId, pas) {
  const p = o.p;
  await o.cliquer(p.locator('[data-carte-accueil="mesdocuments"]'), 800); await dormir(0.4);
  await o.cliquer(p.locator('#' + tuileId), 650); await dormir(1.5);
  if (pas) { await p.evaluate(n => window.scrollBy(0, n), pas); await dormir(1.5); }
}

// Dépose le CV fictif sur la page de dépôt, retire les coordonnées, enregistre.
async function deposerCv(o) {
  const p = o.p;
  await p.setInputFiles('#depotPageFichier', R + 'cv_fictif_camille.txt'); await dormir(2.0);
  await o.cliquer(p.locator('[data-retirer-toutes-detections]'), 700).catch(() => {}); await dormir(0.5);
  await o.cliquer(p.locator('#verifDocBtnEnregistrer'), 600); await dormir(1.2);
}

// Objectif « Répondre à une offre » + métier saisi + situation, jusqu'à « Continuer » actif (parcours de création).
async function objectifOffre(o) {
  const p = o.p;
  await o.cliquer(p.locator('[data-action="objectif"][data-value="offre"]'), 600); await dormir(0.6);
  await o.cliquer(p.locator('#rechercheMetierCibleInput'), 500).catch(() => {});
  await p.keyboard.type('Agent d’entretien', { delay: 40 }); await dormir(0.5);
  await o.cliquer(p.locator('#btnValiderMetierSaisi'), 500).catch(() => {}); await dormir(0.6);
  await o.cliquer(p.locator('[data-domaine-metier]').first(), 600); await dormir(0.6);
  await o.cliquer(p.locator('[data-domaine-metier-confirmer]'), 600); await dormir(0.8);
}

module.exports = { dormir, URL, R, preparer, ouvrirTuile, deposerCv, objectifOffre };
