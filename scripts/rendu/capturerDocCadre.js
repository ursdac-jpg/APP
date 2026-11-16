/* Capture d'écran du document COMPLET du cadre d'aperçu d'un modèle (panneau caché compris, tel que l'application le montre).
   Utilisation : node scripts/rendu/capturerDocCadre.js <filtre du modèle> <fichier.png> [sombre] */
const fs = require('fs');
const path = require('path');
const { ouvrirPage } = require('../parcours/protocole/outils.js');
(async () => {
  const filtre = (process.argv[2] || 'rectangles').toLowerCase();
  const sortie = process.argv[3] || path.join(__dirname, 'sorties_rectangles', 'doc_cadre.png');
  const { b, p } = await ouvrirPage(1280);
  await p.evaluate(fs.readFileSync(path.join(__dirname, 'banc.js'), 'utf8'));
  await p.evaluate(() => { Object.defineProperty(window, '__cvPdfSansRemplissageInitial', { get: () => false, set: () => {}, configurable: true }); window.__bancRemplissage = true;
    const retirer = HTMLIFrameElement.prototype.remove; window.__docsCadre = [];
    HTMLIFrameElement.prototype.remove = function () { try { window.__docsCadre.push('<!DOCTYPE html>' + this.contentDocument.documentElement.outerHTML); } catch (e) {} return retirer.call(this); }; });
  const liste = await p.evaluate(() => window.__rendu.liste());
  const m = liste.find((x) => (x.cle + ' ' + x.nom).toLowerCase().includes(filtre) && !x.sobre);
  const doc = await p.evaluate(async (cle) => { const mod = window.__rendu.liste().find((x) => x.cle === cle); window.__docsCadre.length = 0; await window.__rendu.rendre(mod, false); return window.__docsCadre[window.__docsCadre.length - 1]; }, m.cle);
  const q = await b.newPage(); await q.setViewportSize({ width: 900, height: 1300 });
  await q.setContent(doc, { waitUntil: 'load' }); await q.waitForTimeout(800);
  await q.screenshot({ path: sortie, fullPage: true });
  console.log('capture : ' + sortie); await b.close();
})();
