/* Lot 8 : d'où viennent les 36 % de largeur de colonne après un clic sur un modèle de la galerie ? Lecture seule. MODE=actuel|conserve */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers(); const MODE = process.env.MODE || 'actuel';
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const lire = async (nom) => console.log(MODE, nom, JSON.stringify(await p.evaluate(() => {
    const d = document.querySelector('#zonePdfInlineCV iframe').contentDocument, e = d.getElementById('regLargeurColonneGauche');
    return { curseur: e && e.value, grille: (d.getElementById('conteneurPage').innerHTML.match(/grid-template-columns:[0-9.]+%/) || [''])[0], persiste: (dossier.pdfReglages || {}).regLargeurColonneGauche, canon: (dossier.reglagesMiseEnPageCV || {}).largeurColonneGauche };
  })));
  const clic = async (id) => { if (MODE === 'conserve') { await p.evaluate(() => _mepConserverApercuPendant(4000)); } const l = p.locator('[data-mep-galerie-creatif="' + id + '"]').first(); await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click(); await p.waitForTimeout(4200); };
  await clic('duoOvale'); await lire('après duoOvale');
  await p.evaluate(() => { _mepFormeAppliquer.largeurColonne(45); }); await p.waitForTimeout(3500); await lire('après réglage manuel 45');
  await clic('colonneClaire'); await lire('après colonneClaire (le réglage manuel survit-il ?)');
  await clic('medaillon'); await lire('après medaillon');
  await b.close();
})();
