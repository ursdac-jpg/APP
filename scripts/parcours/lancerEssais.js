/* ============================================================
   scripts/parcours/lancerEssais.js
   Lance les essais de parcours (parcours_smoke.js) dans un navigateur de test (Playwright), SANS serveur : les fichiers de
   http://app.local/ sont servis depuis le disque par le navigateur lui-même, tout le reste du réseau est refusé.
   Pour les séances où l'outil de prévisualisation n'existe pas (session dans le nuage). Jamais chargé par l'application.
     node scripts/parcours/lancerEssais.js unCvPlusieursMetiers,ucpmHistorique sortie.json
   Sans identifiant : tous les essais. Affiche le nombre de réussites, les échecs et les erreurs de console.
   Exporte aussi ouvrir(navigateur, largeur) : une page déjà branchée sur http://app.local/ (captures d'écran, essais à la main).
   Constat du 26/10/2026 : 5 essais de « Un CV, plusieurs métiers » échouent déjà dans ce navigateur de test (impression, fichiers), avant comme après toute modification.
   ============================================================ */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.json': 'application/json', '.txt': 'text/plain; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
async function ouvrir(b, largeur) {
  const ctx = await b.newContext({ viewport: { width: largeur || 1280, height: 900 } });
  // Pas de serveur : les requêtes http://app.local/... sont servies depuis le disque par le navigateur de test.
  await ctx.route('http://app.local/**', async (route) => {
    const u = new URL(route.request().url());
    let f = path.join(RACINE, decodeURIComponent(u.pathname));
    if (f.endsWith('/')) { f += 'index.html'; }
    try { const corps = fs.readFileSync(f); await route.fulfill({ status: 200, body: corps, headers: { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' } }); }
    catch (e) { await route.fulfill({ status: 404, body: 'introuvable' }); }
  });
  await ctx.route(/^https?:\/\/(?!app\.local).*/, (route) => route.abort());
  const p = await ctx.newPage();
  return p;
}
module.exports = { ouvrir };
if (require.main === module) (async () => {
  const ids = (process.argv[2] || '').split(',').filter(Boolean);
  const sortie = process.argv[3] || 'smoke-out.json';
  const b = await chromium.launch();
  const p = await ouvrir(b);
  const errs = [];
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message.slice(0, 200)));
  p.on('console', m => { if (m.type() === 'error') { errs.push('CONSOLE ' + m.text().slice(0, 160)); } });
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  await p.evaluate(fs.readFileSync(path.join(__dirname, 'parcours_smoke.js'), 'utf8'));
  const res = await p.evaluate(async (ids) => { return await window.__parcours(ids.length ? ids : undefined); }, ids);
  fs.writeFileSync(sortie, JSON.stringify({ nbOk: res.nbOk, nbEchecs: res.nbEchecs, echecs: res.echecs, errs }, null, 1));
  console.log('ok', res.nbOk, 'echecs', res.nbEchecs);
  (res.echecs || []).slice(0, 15).forEach(e => console.log(' -', JSON.stringify(e).slice(0, 220)));
  console.log('erreurs console/page :', errs.length, errs.slice(0, 5).join(' | ').slice(0, 400));
  await b.close();
})();
