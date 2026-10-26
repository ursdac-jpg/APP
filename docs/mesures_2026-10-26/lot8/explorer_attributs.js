process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  const liste = async (nom) => { const r = await p.evaluate(() => { const c = {}; document.querySelectorAll('button, [role=button], select, input, label').forEach(e => { [...e.attributes].filter(a => /^data-(mep|ambiance|colonnes|pdf|cv)/.test(a.name)).forEach(a => { c[a.name] = (c[a.name] || 0) + 1; }); }); return c; }); console.log(nom, JSON.stringify(r)); };
  await liste('au chargement');
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await liste('après Créatif');
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1200);
  await p.locator('[data-mep-galerie-creatif="colonneClaire"]').first().click(); await p.waitForTimeout(3500);
  await liste('après modèle colonneClaire');
  await p.screenshot({ path: process.env.CAPTURES + '/editeur_colonneClaire.png', fullPage: false });
  await b.close();
})();
