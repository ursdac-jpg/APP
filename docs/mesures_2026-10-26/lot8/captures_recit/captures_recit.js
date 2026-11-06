/* Récit « Raconter mon parcours », étape « Ce que vous visez » : rendus réels de la page aujourd'hui (3 cartes) et avec les 6 cartes (les trois cartes ajoutées sont fabriquées dans la page à partir de OBJECTIF_CHOIX_CANDIDATURE et du même CSS ; aucun code de l'application n'est modifié). Usage : node captures_recit.js */
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch();
  for (const [nom, w] of [['bureau', 1000], ['telephone', 375]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1.5 })).newPage();
    await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
    await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
    await p.evaluate(() => naviguerVers('decouverte-intro')); await p.waitForTimeout(1500);
    await p.click('#btnDecouverteCommencer'); await p.waitForTimeout(2500);
    const cliche = async (suffixe) => { await p.mouse.move(2, 2); await p.waitForTimeout(500); const r = await p.evaluate(() => { const g = document.querySelector('.grille-objectif'); const bb = g.getBoundingClientRect(); return { y: bb.top + window.scrollY, h: bb.height }; });
      await p.screenshot({ path: path.join(__dirname, nom + '_' + suffixe + '.png'), fullPage: true, clip: { x: 0, y: Math.max(0, r.y - 150), width: w, height: r.h + 190 } }); };
    await cliche('3_cartes');
    await p.evaluate(() => { const g = document.querySelector('.grille-objectif'), ids = [...g.querySelectorAll('[data-value]')].map(e => e.dataset.value);
      OBJECTIF_CHOIX_CANDIDATURE.filter(o => ids.indexOf(o.id) === -1).forEach(o => { const bt = document.createElement('button'); bt.type = 'button'; bt.className = 'carte-objectif'; bt.dataset.value = o.id;
        bt.innerHTML = '<i class="bi ' + o.icon + '" aria-hidden="true"></i><span class="carte-objectif-titre">' + o.title + '</span><span class="carte-objectif-desc">' + o.desc + '</span>'; g.appendChild(bt); });
      const ordre = OBJECTIF_CHOIX_CANDIDATURE.map(o => o.id); [...g.children].sort((a, c) => ordre.indexOf(a.dataset.value) - ordre.indexOf(c.dataset.value)).forEach(e => g.appendChild(e)); });
    await cliche('6_cartes');
  }
  await b.close(); })();
