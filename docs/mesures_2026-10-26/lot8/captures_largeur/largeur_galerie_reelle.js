/* L8-4 par la VRAIE galerie (clics) : pour chaque modèle à largeur de recette différente, la largeur obtenue après le clic sur la vignette (« aujourd'hui »), puis avec le curseur mis à la largeur de la recette.
   Captures de la page entière (cadre de l'aperçu). Usage : node largeur_galerie_reelle.js */
process.env.CONTROLES = '0';
const { vers } = require('../vers_editeur.js'); const path = require('path');
const MODELES = { mqColonne: 38, bandeauVertical: 40, duoOvale: 50, rubanDiagonal: 50, vagueMarine: 50, diagonalesContrastees: 50, medaillon: 32 };
(async () => {
  const { b, p } = await vers();
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const releve = () => p.evaluate(() => {
    const f = document.querySelector('#zonePdfInlineCV iframe'), w = f.contentWindow, d = w.document, pg = d.querySelector('.page-a4'), pr = pg.getBoundingClientRect();
    const sl = d.getElementById('regLargeurColonneGauche'), tete = d.querySelector('#conteneurPage .tete'), corps = d.querySelector('.corps.deux > div:first-child') || d.querySelector('.corps > div');
    const acc = typeof w._pdfLargeurTexteAccroche === 'function' ? Math.round(w._pdfLargeurTexteAccroche()) : null;
    return { curseur: sl.value, colonnePct: corps ? Math.round(corps.getBoundingClientRect().width / pr.width * 100) : null, enteteParPage: tete ? Math.round(tete.getBoundingClientRect().height / pr.height * 1000) / 10 : null, accroche: acc, pages: d.querySelectorAll('.page-a4').length };
  });
  for (const [id, larg] of Object.entries(MODELES)) {
    const l = p.locator('[data-mep-galerie-creatif="' + id + '"]').first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await p.waitForTimeout(4200);
    const a = await releve(); console.log(id, 'actuel', JSON.stringify(a));
    const el = p.locator('#zonePdfInlineCV iframe').first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    await el.screenshot({ path: path.join(__dirname, id + '_actuel.png') });
    await p.evaluate((v) => { const w = document.querySelector('#zonePdfInlineCV iframe').contentWindow; const sl = w.document.getElementById('regLargeurColonneGauche'); sl.value = String(v); sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); }, larg);
    await p.waitForTimeout(3000);
    const r = await releve(); console.log(id, 'recette', JSON.stringify(r));
    await el.screenshot({ path: path.join(__dirname, id + '_recette.png') });
  }
  await b.close();
})();
