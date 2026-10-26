const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(3000);
  const cartes = await p.evaluate(() => [...document.querySelectorAll('button, a')].filter(e => /Mes documents/i.test(e.textContent)).map(e => e.id + ' | ' + e.textContent.trim().slice(0, 60)));
  console.log(cartes.slice(0, 5));
  await p.getByText('Mes documents', { exact: false }).first().click(); await p.waitForTimeout(1500);
  const tuiles = await p.evaluate(() => [...document.querySelectorAll('[id^="btnCarteAccueil"]')].filter(e => e.offsetParent).map(e => e.id + ' | ' + e.textContent.trim().replace(/\s+/g, ' ').slice(0, 90)));
  console.log(tuiles);
  await p.screenshot({ path: '/tmp/claude-0/-home-user-APP/642c3445-eb3e-5259-ba86-29201aa22f54/scratchpad/captures/carte_mes_documents.png' });
  await b.close();
})();
