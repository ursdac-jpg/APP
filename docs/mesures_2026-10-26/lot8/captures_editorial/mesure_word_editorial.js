/* Éditorial, nom long : que contient le Word ? Taille du nom (demi-points) et largeurs de la grille de l'en-tête, pour un nom court et un nom long. Lecture seule. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 738, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const [prenom, nomFam] of [['Camille', 'Martin'], ['Marie-Hélène', 'Dubois-Vandenbroucke']]) {
    const r = await p.evaluate(async ([prenom, nomFam]) => {
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe(); copie.photo = { url: '', inclure: false, souhaitee: 'non' };
      copie.identite.prenom = prenom; copie.identite.nom = nomFam; window.dossier = copie;
      const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:-10000px;top:0;width:794px;height:1123px;border:0;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; w._pdfChoisirVarianteSobre('mq-editorial'); await new Promise(r => setTimeout(r, 2500));
      try { w._pdfPersisterReglages(); } catch (e) {}
      const res = await exporterCvWord(copie); const zip = await JSZip.loadAsync(res.blob); const xml = await zip.file('word/document.xml').async('string');
      const i = xml.indexOf(nomFam.split('-')[0].toUpperCase()); const j = xml.indexOf(prenom.slice(0, 5));
      const k = Math.min(...[i, j].filter(x => x >= 0));
      const avant = xml.slice(Math.max(0, k - 900), k + 80);
      const sz = [...avant.matchAll(/<w:sz w:val="(\d+)"/g)].map(m => +m[1]).pop();
      const grille = (xml.match(/<w:tblGrid>.*?<\/w:tblGrid>/) || [''])[0];
      f.remove();
      return { tailleNomDemiPoints: sz, grille: grille.slice(0, 200), trouve: k >= 0, longueurXml: xml.length };
    }, [prenom, nomFam]);
    console.log(prenom, nomFam, JSON.stringify(r));
  }
  await b.close();
})();
