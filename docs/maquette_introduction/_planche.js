// Outil de travail : planche de contrôle d'un dossier de captures. Usage : node _planche.js dossier [colonnes] [largeur]
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const dossier = process.argv[2]; const col = +(process.argv[3] || 4); const larg = +(process.argv[4] || 360);
(async () => {
  const fichiers = fs.readdirSync(dossier).filter(f => /^[^_].*\.png$/.test(f)).sort();
  fs.writeFileSync(path.join(dossier, '_planche.html'), '<body style="margin:0;background:#bbb;display:grid;grid-template-columns:repeat(' + col + ',' + larg + 'px);gap:6px;font:12px sans-serif">' + fichiers.map(f => '<div>' + f + '<img style="width:' + larg + 'px;display:block" src="' + f + '"></div>').join('') + '</body>');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: col * (larg + 6), height: 600 } });
  await p.goto('file:///' + path.resolve(dossier, '_planche.html').split(path.sep).join('/')); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(dossier, '_planche.png'), fullPage: true }); await b.close(); console.log(fichiers.length);
})();
