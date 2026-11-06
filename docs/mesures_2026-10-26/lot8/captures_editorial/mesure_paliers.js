/* Éditorial, mélange par paliers (27/10/2026) : vrai flux de l'application, sans réglage manuel. Pour chaque nom : taille du nom, colonnes de l'en-tête, part de la page, largeur de l'accroche,
   mot coupé ou non (le plus long mot tient-il dans la zone du nom ?), disposition finale (4 = décalée, 5 = Empilée, null = d'origine). Usage : node mesure_paliers.js [A5] */
const { chromium } = require('playwright'); const path = require('path');
const NOMS = {
  court: ['Camille', 'Martin', false], moyen: ['Marie-Hélène', 'Dupont-Martin', false], long: ['Marie-Hélène', 'Dubois-Vandenbroucke', false], photo: ['Marie-Hélène', 'Dubois-Vandenbroucke', true],
  legerLong: ['Jean-Baptiste', 'Montgolfier', false], extreme: ['Anne-Charlotte', 'Vandenberghe-Montgolfier', true],
  tresLong: ['Jean-Christophe', 'Rakotomalala-Andrianampoinimerina', true], unSeulMot: ['Amélie', 'Constantinopolitaine', false]
};
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const cle of Object.keys(NOMS)) {
    const info = await p.evaluate(async (nomEntier) => {
      const [prenom, nomFam, avecPhoto] = nomEntier;
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
      if (!avecPhoto) { copie.photo = { url: '', inclure: false, souhaitee: 'non' }; }
      const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = prenom; copie.identite.nom = nomFam;
      window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; w._pdfChoisirVarianteSobre('mq-editorial'); await new Promise(r => setTimeout(r, 3500));
      const d = w.document, tete = d.querySelector('#conteneurPage .tete'), nom = tete.querySelector('.nom'), pg = d.querySelector('.page-a4');
      const cs = w.getComputedStyle(nom);
      const mes = d.createElement('span'); mes.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font-family:' + cs.fontFamily + ';font-weight:' + cs.fontWeight + ';letter-spacing:' + cs.letterSpacing + ';font-size:' + cs.fontSize; d.body.appendChild(mes);
      const plusLong = nom.textContent.replace(/-/g, '- ').split(/\s+/).reduce((a, m) => m.length > a.length ? m : a, ''); mes.textContent = plusLong;
      const motLarg = Math.round(mes.getBoundingClientRect().width), nomLarg = Math.round(nom.getBoundingClientRect().width); mes.remove();
      const acc = tete.querySelector('.accroche');
      return { disp: (w._cvPdfEnteteLibreMq && w._cvPdfEnteteLibreMq.disp) || null, taillePx: parseFloat(cs.fontSize), colonnes: tete.style.gridTemplateColumns || '', plusLong, motLarg, nomLarg, motCoupe: motLarg > nomLarg, ratioPct: Math.round(tete.getBoundingClientRect().height / pg.getBoundingClientRect().height * 1000) / 10, accrocheLarg: acc ? Math.round(acc.getBoundingClientRect().width) : null };
    }, NOMS[cle]);
    await p.screenshot({ path: path.join(__dirname, 'paliers_' + cle + '.png'), clip: { x: 24, y: 48, width: 756, height: 340 } });
    console.log(cle, JSON.stringify(info));
  }
  await b.close();
})();
