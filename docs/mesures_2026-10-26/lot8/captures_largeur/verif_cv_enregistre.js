/* CV déjà enregistré : la largeur persistée (ancienne, 35 imposé ; ou à la main, 45) est-elle reprise telle quelle à la réouverture, sans le changement de modèle ? */
process.env.CONTROLES = '0';
const { vers } = require('../vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const lire = (n) => p.evaluate((n) => ({ n, curseur: document.querySelector('#zonePdfInlineCV iframe').contentDocument.getElementById('regLargeurColonneGauche').value, persiste: (dossier.pdfReglages || {}).regLargeurColonneGauche }), n).then(r => console.log(JSON.stringify(r)));
  await p.locator('[data-mep-galerie-creatif="duoOvale"]').first().click(); await p.waitForTimeout(4200); await lire('modèle 50');
  await p.evaluate(() => _mepFormeAppliquer.largeurColonne(45)); await p.waitForTimeout(3500); await lire('main 45');
  for (const v of ['35', '45', '50']) {
    await p.evaluate((v) => { dossier.pdfReglages = dossier.pdfReglages || {}; dossier.pdfReglages.regLargeurColonneGauche = v; naviguerVers('accueil'); }, v); await p.waitForTimeout(1500);
    await p.evaluate(() => naviguerVers('resultats')); await p.waitForTimeout(5000); await lire('réouverture avec ' + v);
  }
  await b.close();
})();
