const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  const erreurs = [];
  p.on('pageerror', e => erreurs.push(String(e).slice(0, 160)));
  await p.goto('http://localhost:8123/index.html');
  await p.waitForTimeout(3500);
  const info = await p.evaluate(() => ({
    dossier: typeof dossier, nav: typeof naviguerVers, pr: typeof pageResultats,
    titre: document.title, corps: document.body.innerText.slice(0, 200)
  }));
  console.log(JSON.stringify(info), erreurs.length, erreurs.slice(0, 3));
  await b.close();
})();
