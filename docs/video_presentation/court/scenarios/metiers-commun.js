/* Gestes communs des six vidéos du module « Explorer les métiers » (module, quatre chemins, Ma synthèse), consigne 484.
   Une seule source : le départ (page, assistants externes bloqués), l'entrée dans le module et dans un chemin, joués à l'écran dans l'application réelle. */
const { dormir } = require('../lib');
const URL = 'http://localhost:8123/index.html';

async function preparer(o) {
  const p = o.p;
  await o.ctx.route(/chatgpt|openai|perplexity/, r => r.abort());
  o.ctx.on('page', pg => { pg.close().catch(() => {}); });
  await p.goto(URL); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} }); await p.reload(); await p.waitForFunction(() => typeof naviguerVers !== 'undefined'); await dormir(1.5);
  await p.mouse.move(640, 620); o.mx = 640; o.my = 620; await dormir(0.4);
}

// Depuis l'accueil de l'application : la carte « Vous hésitez encore ? », puis « Explorer les métiers » (page de présentation du module).
async function versModule(o) {
  const p = o.p;
  await o.cliquer(p.locator('[data-carte-accueil="orientation"]'), 800); await dormir(0.4);
  await o.cliquer(p.locator('#btnCarteAccueilComprendreMetiers'), 650); await dormir(1.8);
}
// De la présentation du module à l'écran des quatre chemins.
async function versAccueilModule(o) {
  await o.cliquer(o.p.locator('#btnCmlCommencer'), 650); await dormir(1.5);
}
// Ouvre un chemin depuis l'écran des quatre chemins (clé : metier, actions, q, recrute).
async function entrerChemin(o, cle) {
  const b = o.p.locator('[data-cml="entrer"]').nth({ metier: 0, actions: 1, q: 2, recrute: 3 }[cle]);
  await o.cliquer(b, 700); await dormir(1.5);
}
module.exports = { preparer, versModule, versAccueilModule, entrerChemin, dormir };
