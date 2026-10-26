/* Lance le banc de rendu officiel (scripts/rendu/banc.js, mode « verifier ») : compare les empreintes HTML, CSS, Word, pages et capacités de TOUS les modèles à scripts/rendu/registre.json.
   DESACTIVER=1 : coupe le garde-fou de lisibilité avant (pour savoir si un écart vient de lui). Usage : node verifier_banc.js */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 738, height: 1000 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  if (process.env.DESACTIVER) { await p.evaluate(() => { window._lisibiliteGarder = undefined; }); }
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  p.evaluate(() => window.__rendu.lancer('verifier')).catch(e => console.log('ERREUR', String(e).slice(0, 200)));
  for (let i = 0; i < 600; i++) {
    await p.waitForTimeout(2000);
    const e = await p.evaluate(() => window.__rendu.etat && { fait: window.__rendu.etat.fait, total: window.__rendu.etat.total, termine: window.__rendu.etat.termine });
    if (i % 15 === 0) { console.log(JSON.stringify(e)); }
    if (e && e.termine) { break; }
  }
  const r = await p.evaluate(() => { const e = window.__rendu.etat; return { ecarts: e.ecarts, sansReference: e.sansReference, erreurs: e.erreurs, tropColores: e.tropColores, avertissement: e.avertissement }; });
  console.log(JSON.stringify(r, null, 1));
  await b.close();
})();
