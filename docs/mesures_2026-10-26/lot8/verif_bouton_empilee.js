/* Le bouton « Empilée » du grand aperçu : caché pour frise et friseFoncee, visible pour les autres (27/10/2026). Vrais clics jusqu'à l'éditeur. Usage : node verif_bouton_empilee.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  for (const id of ['mqBandeau', 'frise', 'friseFoncee', 'colonneClaire']) {
    const l = p.locator('[data-mep-galerie-creatif="' + id + '"]').first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await p.waitForTimeout(3500);
    await p.evaluate(() => ouvrirPleinEcranMaquette()); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => { const bt = document.querySelector('#mqSegDisp button[data-v="5"]'); const vis = el => { for (let e = el; e; e = e.parentElement) { if (getComputedStyle(e).display === 'none') { return false; } } return true; }; return { present: !!bt, styleDisplay: bt ? bt.style.display : null, voisinVisible: !!document.querySelector('#mqSegDisp button[data-v="4"]') && vis(document.querySelector('#mqSegDisp button[data-v="4"]')), empileeVisible: !!bt && vis(bt), overlay: !!document.querySelector('#mqSegDisp') }; });
    console.log(id, JSON.stringify(r));
    await p.evaluate(() => fermerPleinEcranMaquette()); await p.waitForTimeout(1500);
  }
  await b.close();
})();
