/* Titres des pages de travail (28/10/2026) : le titre est le nom du module, l'étape est en sous-titre. Ouvre chaque module par sa route et relève h1 + sous-titre. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
  const erreurs = []; p.on('pageerror', e => erreurs.push(String(e)));
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  const lire = (n) => p.evaluate((n) => { const h = document.querySelector('#app h1'), s = document.querySelector('#app h1 + .sousTitre'); return n + ' => h1 « ' + (h ? h.textContent.trim() : '(aucun)') + ' » | sous-titre « ' + (s ? s.textContent.trim().slice(0, 80) : '(aucun)') + ' »'; }, n).then(console.log);
  await p.evaluate(() => { dossier.identite = dossier.identite || {}; });
  for (const [route, fn] of [['comparer-pistes', () => ouvrirComparerPistes()], ['un-cv-plusieurs-metiers', () => ouvrirUnCvPlusieursMetiers()], ['regard-recruteur', () => ouvrirRegardRecruteur()], ['ats', () => ouvrirAts()]]) {
    await p.evaluate((r) => naviguerVers(r), route); await p.waitForTimeout(2000); await lire(route + ' (présentation)');
    const ids = { 'comparer-pistes': 'btnAideDecisionCommencer', 'un-cv-plusieurs-metiers': null, 'regard-recruteur': 'btnRegardRecruteurCommencer', 'ats': 'btnAtsCommencer' };
    const bt = ids[route] ? p.locator('#' + ids[route]) : p.locator('#app button:visible').filter({ hasText: /Commencer/ }).first();
    if (await bt.count()) { await bt.click().catch(() => {}); await p.waitForTimeout(2500); await lire(route + ' (page de travail)'); } else { console.log(route, ': bouton de départ introuvable'); }
  }
  console.log('erreurs JS :', erreurs.length ? erreurs.join(' / ') : 'aucune');
  await b.close();
})();
