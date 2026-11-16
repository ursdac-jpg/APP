/* Impression RÉELLE des modèles de CV : combien de pages Chrome imprime-t-il, comparé aux pages mesurées dans l'aperçu ?
   (registre des bugs : « un CV qui tient sur une page à l'écran passe sur 2 pages à l'impression », 07/10/2026).
   Méthode : le banc de rendu (scripts/rendu/banc.js) rend chaque modèle dans un cadre caché, comme l'application ; juste avant que le cadre soit retiré,
   on garde le document COMPLET du cadre (c'est lui que l'application imprime : iframe.contentWindow.print()), puis Chrome l'imprime en PDF (page.pdf, A4,
   marges de la feuille de style) et on compte les pages du PDF.
   Utilisation : NODE_PATH=<dossier>/node_modules node scripts/rendu/imprimerReel.js [filtre sur le nom ou la clé du modèle] [--tous]
   Option --sans-remplissage : comme le banc (aucun remplissage automatique à l'ouverture) ; par défaut le remplissage de l'application est ACTIF, comme pour une vraie personne.
   Sans filtre : tous les modèles. Affiche seulement les écarts (pages imprimées différentes des pages de l'aperçu) ; --tous affiche chaque modèle. */
const fs = require('fs');
const path = require('path');
const { ouvrirPage } = require('../parcours/protocole/outils.js');

(async () => {
  const filtre = (process.argv[2] && !process.argv[2].startsWith('--')) ? process.argv[2].toLowerCase() : '';
  const tous = process.argv.includes('--tous');
  const { b, p } = await ouvrirPage(1280);
  const banc = fs.readFileSync(path.join(__dirname, 'banc.js'), 'utf8');
  await p.evaluate(banc);
  // Le banc coupe le remplissage automatique d'ouverture (comparaison à réglages par défaut) : par défaut on le laisse ACTIF, comme dans l'application.
  if (!process.argv.includes('--sans-remplissage')) { await p.evaluate(() => { Object.defineProperty(window, '__cvPdfSansRemplissageInitial', { get: () => false, set: () => {}, configurable: true }); window.__bancRemplissage = true; }); }
  // Garde le document complet du cadre avant son retrait.
  await p.evaluate(() => {
    const retirer = HTMLIFrameElement.prototype.remove;
    window.__docsCadre = [];
    HTMLIFrameElement.prototype.remove = function () {
      try { window.__docsCadre.push('<!DOCTYPE html>' + this.contentDocument.documentElement.outerHTML); } catch (e) { /* rien */ }
      return retirer.call(this);
    };
  });
  const liste = await p.evaluate(() => window.__rendu.liste());
  const choisis = liste.filter((m) => !filtre || (m.cle + ' ' + m.nom).toLowerCase().includes(filtre));
  const ecarts = [];
  const lignes = [];
  for (const m of choisis) {
    const r = await p.evaluate(async (cle) => {
      const mod = window.__rendu.liste().find((x) => x.cle === cle);
      window.__docsCadre.length = 0;
      const res = await window.__rendu.rendre(mod, false);
      return { pagesApercu: res.nbPages, doc: window.__docsCadre[window.__docsCadre.length - 1] || '' };
    }, m.cle);
    if (!r.doc) { lignes.push(m.cle + ' : document du cadre non récupéré'); continue; }
    const q = await b.newPage();
    await q.setContent(r.doc, { waitUntil: 'load' });
    await q.waitForTimeout(1500);
    const pdf = await q.pdf({ preferCSSPageSize: true, printBackground: true });
    await q.close();
    const imprimees = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
    const ligne = m.cle + ' (' + m.nom + ') : aperçu ' + r.pagesApercu + ' page(s), imprimé ' + imprimees;
    lignes.push(ligne);
    if (imprimees !== r.pagesApercu) { ecarts.push(ligne); }
  }
  (tous ? lignes : ecarts).forEach((l) => console.log(l));
  console.log('\n' + choisis.length + ' modèle(s) imprimé(s), ' + ecarts.length + ' écart(s).');
  await b.close();
})();
