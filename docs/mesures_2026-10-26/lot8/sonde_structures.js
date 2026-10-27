/* Lot 8 / lisibilité : de quoi est fait le fond derrière le texte dans les cas fautifs ? Pour chaque cas (modèle + réglages) on relève les classes du CV, le fond de l'en-tête,
   le fond de colonne (pseudo-élément du CV ou bloc .col-fond), les variables de forme (--clip-bandeau, --clip-colonne, --hors) et ce que renvoie elementsFromPoint au milieu d'un texte.
   Lecture seule. Usage : node sonde_structures.js */
const { chromium } = require('playwright');
const CAS = [
  ['creatif:colonneClaire', { regBandeauEnTete: true, regBordBandeau: 'vallonne' }],
  ['creatif:chronoFonce', { regBandeauEnTete: true, regBordBandeau: 'droit' }],
  ['sobre:mq-bandeau', { regColonnes: '2', regFondColonnes: 'gauche', regColonneBordDroit: true }],
  ['creatif:colonneBandeau', { regBordBandeau: 'contour' }],
  ['creatif:sidebarVague', { regColonneBordDroit: false, regColonneForme: 'contour' }],
  ['sobre:mq-epure', { regColonnes: '2', regFondColonnes: 'gauche', regColonneBordDroit: true }],
];
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const [cle, regs] of CAS) {
    const r = await p.evaluate(async ([cle, regs]) => {
      const m = window.__rendu.liste().find(x => x.cle === cle);
      // rendu via le banc, mais on garde le cadre : on refait le montage ici
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe(); window.dossier = copie;
      const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('Camille Martin', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow;
      if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); }
      await new Promise(r => setTimeout(r, 1800));
      const ordre = ['regColonnes', 'regFondColonnes', 'regBandeauEnTete', 'regColonneBordDroit', 'regColonneArche', 'regColonneForme', 'regBordBandeau'];
      for (const id of ordre) { if (!(id in regs)) { continue; } const e = w.document.getElementById(id); if (!e) { continue; } if (e.type === 'checkbox') { e.checked = !!regs[id]; } else { e.value = regs[id]; } e.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 150)); }
      await new Promise(r => setTimeout(r, 900));
      const d = w.document, cv = d.querySelector('#conteneurPage .cv'), cs = w.getComputedStyle(cv), tete = cv.querySelector('.tete'), pv = w.getComputedStyle(cv, '::before');
      const nom = cv.querySelector('.nom'); let sous = []; if (nom) { const q = nom.getBoundingClientRect(); sous = d.elementsFromPoint(q.left + q.width / 2, q.top + q.height / 2).slice(0, 6).map(e => e.tagName.toLowerCase() + '.' + String(e.className).slice(0, 30)); }
      const res = {
        cvClasses: cv.className, teteClasses: tete && tete.className, teteFond: tete && w.getComputedStyle(tete).backgroundColor, teteImage: tete && w.getComputedStyle(tete).backgroundImage.slice(0, 50),
        teteAvant: tete && (w.getComputedStyle(tete, '::before').content !== 'none' ? w.getComputedStyle(tete, '::before').backgroundColor : null),
        cvAvant: pv.content !== 'none' ? { bg: pv.backgroundColor, img: pv.backgroundImage.slice(0, 40), top: pv.top, left: pv.left, w: pv.width, h: pv.height, clip: pv.clipPath.slice(0, 40) } : null,
        colFond: [...cv.querySelectorAll('.col-fond')].map(e => ({ cls: e.className, bg: w.getComputedStyle(e).backgroundColor, clip: w.getComputedStyle(e).clipPath.slice(0, 30) })).slice(0, 3),
        variables: ['--clip-bandeau', '--clip-colonne', '--hors', '--hors-actif', '--cv'].map(v => v + '=' + (cs.getPropertyValue(v) || '').slice(0, 50)),
        nomCouleur: nom && w.getComputedStyle(nom).color, sousLeNom: sous
      };
      f.remove(); return res;
    }, [cle, regs]);
    console.log('\n=== ' + cle + ' ' + JSON.stringify(regs)); console.log(JSON.stringify(r, null, 1));
  }
  await b.close();
})();
