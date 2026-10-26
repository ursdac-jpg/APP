/* Lot 8 / F27 : contrôle par VRAIS CLICS (onglets Bandeau et Colonne de l'aperçu) de deux cas trouvés par le balayage automatique. Lecture seule.
   Usage : CAPTURES=dossier node verif_reelle_f27.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  const SC = process.env.CAPTURES || '/tmp';
  const cas = async (famille, modele, onglet, nomCapture, forme, libelle) => {
    await p.locator('[data-mep-allure="' + famille + '"]').first().click(); await p.waitForTimeout(2200);
    await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(800);
    await p.locator('[data-mep-galerie-' + famille + '="' + modele + '"]').first().click(); await p.waitForTimeout(3500);
    const on = p.locator('[data-mep-onglet="' + onglet + '"]').first();
    console.log(modele, 'onglet', onglet, 'présent :', await on.count());
    if (!(await on.count())) { return; }
    await on.click(); await p.waitForTimeout(1200);
    const btns = await p.evaluate(() => [...document.querySelectorAll('#mepPanneauxForme button')].filter(e => e.offsetParent).map(e => (e.getAttribute('data-mep-forme') || e.getAttribute('data-mep-formebandeau') || e.className || '') + '|' + (e.title || e.textContent.trim()).slice(0, 24)));
    console.log('  boutons du panneau :', btns.slice(0, 30).join(' ; '));
    const bt = p.locator('#mepPanneauxForme button[data-mep-forme="' + forme + '"], #mepPanneauxForme button:has-text("' + libelle + '")').first();
    await bt.click(); await p.waitForTimeout(3500);
    const f = p.locator('#zonePdfInlineCV iframe').first(); await f.scrollIntoViewIfNeeded().catch(() => {});
    await f.screenshot({ path: SC + '/' + nomCapture + '.png' });
  };
  await cas('creatif', 'colonneClaire', 'bandeau', 'reel_colonneClaire_bandeau', 'droit', 'Droit');
  await b.close();
})();
