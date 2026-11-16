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
  // Depuis la fiche complète du ROME : le métier se choisit dans les propositions (data-metier-cible-direct). Sinon, ancien chemin : « Valider » puis le domaine.
  const direct = p.locator('[data-metier-cible-direct="Agent d\'entretien"]');
  if (await direct.count()) {
    await o.cliquer(direct.first(), 600); await dormir(0.8);
  } else {
    await o.cliquer(p.locator('#btnValiderMetierSaisi'), 500).catch(() => {}); await dormir(0.6);
    await o.cliquer(p.locator('[data-domaine-metier]').first(), 600); await dormir(0.6);
    await o.cliquer(p.locator('[data-domaine-metier-confirmer]'), 600); await dormir(0.8);
  }
}

// Page commune de « Créer un nouveau CV » (consigne 246) : fait défiler jusqu'au bloc d'une voie ('assistant', 'recit' ou 'main') pour que sa présentation soit à l'écran.
async function versVoie(o, voie) {
  const y = await o.p.evaluate(v => { const e = document.querySelector('[data-voie="' + v + '"]'); return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - 90) : 0; }, voie);
  await o.defiler(y, 1400); await dormir(1.0);
}

// Panneau d'ajout d'une expérience (« Vos informations », 16/11/2026) : intitulé du poste, métier proposé, deux missions et deux compétences cochées, puis « Je valide ».
async function versElement(o, selecteur, marge) {
  const y = await o.p.evaluate(([s, m]) => { const e = document.querySelector(s); return e ? Math.max(0, e.getBoundingClientRect().top + window.scrollY - m) : window.scrollY; }, [selecteur, marge || 160]);
  await o.defiler(y, 800); await dormir(0.3);
}
async function panneauExperienceDebut(o) {
  const p = o.p;
  await versElement(o, '#btnExpProOuvrir', 240);
  await o.cliquer(p.locator('#btnExpProOuvrir'), 350); await dormir(0.3);
  await versElement(o, '#mcPanPoste', 200);
  await o.cliquer(p.locator('#mcPanPoste'), 350);
  await p.keyboard.type('Agent de nettoyage', { delay: 45 }); await dormir(0.9);
  await o.cliquer(p.locator('[data-pan-sugg]', { hasText: 'collectivité' }).first(), 350); await dormir(0.7);
}
async function panneauExperienceFin(o) {
  const p = o.p;
  await o.cliquer(p.locator('[data-pan-mission]').nth(0), 350); await dormir(0.3);
  await o.cliquer(p.locator('[data-pan-mission]').nth(1), 350); await dormir(0.3);
  await versElement(o, '[data-pan-comp]', 240);
  await o.cliquer(p.locator('[data-pan-comp]').nth(0), 350); await dormir(0.2);
  await versElement(o, '#mcPanValider', 360);
  await o.cliquer(p.locator('#mcPanValider'), 350); await dormir(0.7);
  await versElement(o, '#blocERIP-experiences-pro', 120); await dormir(0.8);   // l'expérience ajoutée apparaît dans la liste
}

// Écran « Avant de commencer » (qui choisit les missions et les compétences) : choix d'une carte, demande de confirmation, « Oui, je confirme », puis « Continuer ».
async function questionMissions(o, choix, suivreContinuer) {
  const p = o.p;
  await dormir(1.5);
  await o.survol(p.locator('[data-cm-choix="' + (choix === 'moi' ? 'assistant' : 'moi') + '"]'), 800); await dormir(0.6);
  await o.cliquer(p.locator('[data-cm-choix="' + choix + '"]'), 700); await dormir(0.8);
  await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(1.0);
  await o.cliquer(p.locator('#cmOui'), 700); await dormir(1.0);
  if (suivreContinuer !== false) { await o.cliquer(p.locator('#btnSuivantNavigation'), 700); await dormir(1.5); }
}

module.exports = { dormir, URL, R, preparer, ouvrirTuile, deposerCv, objectifOffre, versVoie, versElement, panneauExperienceDebut, panneauExperienceFin, questionMissions };
