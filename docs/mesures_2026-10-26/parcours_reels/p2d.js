const L = require('./lib.js'); const M = require('./saisies3.js');
(async () => {
  const { b, p } = await M.assistantJusquALaPage();
  await M.collerReponseCv(p, L);
  for (let i = 1; i <= 6; i++) {
    const e = await p.evaluate(() => ({ route: pageActuelle, ouverts: [...document.querySelectorAll('.assistant-rect-tete[aria-expanded="true"], .assistant-rect.ouvert .assistant-rect-tete')].map(x => x.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)), bas: [...document.querySelectorAll('.barre-navigation-fixe button')].filter(x => x.offsetParent).map(x => (x.disabled ? '(grisé) ' : '') + x.textContent.trim()).join(' | ') }));
    console.log(`#${i} route=${e.route} ouverts=[${e.ouverts.join(' ; ')}] bas=${e.bas}`);
    await L.photo(p, 'assist-6-etape' + i);
    if (e.route !== 'assistant') { break; }
    const btn = p.locator('.barre-navigation-fixe .barre-navigation button').last();
    if (!(await btn.isEnabled())) { console.log('  Continuer grisé, arrêt'); break; }
    await btn.click(); await p.waitForTimeout(2500);
  }
  await L.etat(p, 'fin de boucle');
  await b.close();
})();
