/* Largeur propre au modèle (27/10/2026) par la VRAIE galerie : 1) chaque modèle arrive à la largeur de sa recette ; 2) une largeur réglée à la main (45) est conservée au changement de modèle ;
   3) revenir à la largeur de la recette (non manuelle) laisse le modèle suivant reprendre la sienne ; 4) pages, en-tête. Usage : node verif_largeur_propre.js */
process.env.CONTROLES = '0';
const { vers } = require('../vers_editeur.js');
const IDS = ['mqColonne', 'bandeauVertical', 'duoOvale', 'rubanDiagonal', 'vagueMarine', 'diagonalesContrastees', 'medaillon'];
(async () => {
  const { b, p } = await vers();
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const releve = () => p.evaluate(() => { const w = document.querySelector('#zonePdfInlineCV iframe').contentWindow, d = w.document; const r = w._PDF_CREATIF_RECETTES[w._cvPdfCreatifVariante];
    const c = d.querySelector('.corps.deux > div:first-child') || d.querySelector('.corps > div'), pg = d.querySelector('.page-a4');
    return { modele: w._cvPdfCreatifVariante, curseur: d.getElementById('regLargeurColonneGauche').value, recette: r && r.largeurColonneGauche, colonnePct: c ? Math.round(c.getBoundingClientRect().width / pg.getBoundingClientRect().width * 100) : null, pages: d.querySelectorAll('.page-a4').length }; });
  const clic = async (id) => { const l = p.locator('[data-mep-galerie-creatif="' + id + '"]').first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await p.waitForTimeout(4200); };
  console.log('--- 1) largeur de la recette');
  for (const id of IDS) { await clic(id); console.log(JSON.stringify(await releve())); }
  console.log('--- 2) largeur à la main (45) conservée');
  await p.evaluate(() => { const sl = document.querySelector('#zonePdfInlineCV iframe').contentWindow.document.getElementById('regLargeurColonneGauche'); sl.value = '45'; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(2500);
  for (const id of ['duoOvale', 'medaillon', 'bandeauVertical']) { await clic(id); console.log(JSON.stringify(await releve())); }
  console.log('--- 3) retour à 35 à la main puis modèle à 50');
  await p.evaluate(() => { const sl = document.querySelector('#zonePdfInlineCV iframe').contentWindow.document.getElementById('regLargeurColonneGauche'); sl.value = '35'; sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); });
  await p.waitForTimeout(2500); await clic('rubanDiagonal'); console.log(JSON.stringify(await releve()));
  await b.close();
})();
