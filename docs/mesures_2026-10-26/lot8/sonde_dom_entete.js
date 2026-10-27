/* Lot 8 / maquette de l'en-tête empilée : structure réelle de l'en-tête (enfants, classes, grille) de plusieurs modèles avec un contenu long. Lecture seule. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const cle of (process.env.MODELES || 'standard,creatif:mqBandeau,creatif:mqDiagonale,creatif:colonneBandeau,creatif:sidebarVague').split(',')) {
    const r = await p.evaluate(async (cle) => {
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
      const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.';
      copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke';
      window.dossier = copie;
      const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('Marie-Hélène Dubois-Vandenbroucke', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow, d = w.document; const m = window.__rendu.liste().find(x => x.cle === cle);
      if (m) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 2000)); }
      const tete = d.querySelector('#conteneurPage .tete'), cs = w.getComputedStyle(tete);
      const kids = [...tete.children].map(e => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 26) + (e.getAttribute('data-bl') ? '[' + e.getAttribute('data-bl') + ']' : '') + ' > ' + [...e.children].map(c => String(c.className).slice(0, 14)).join(','));
      const r = { cle, teteClasses: tete.className, grille: cs.gridTemplateColumns, enfants: kids, cvClasses: d.querySelector('.cv').className.slice(0, 80) };
      f.remove(); return r;
    }, cle);
    console.log(JSON.stringify(r));
  }
  await b.close();
})();
