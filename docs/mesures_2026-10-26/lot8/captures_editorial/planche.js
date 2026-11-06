/* Planche de comparaison « Éditorial » : 4 noms x 4 options (C = aujourd'hui, A = nom rapetissé, B = Empilée, D = par paliers). Usage : node planche.js */
const { chromium } = require('playwright'); const path = require('path');
const NOMS = { court: ['Camille', 'Martin', false], moyen: ['Marie-Hélène', 'Dupont-Martin', false], long: ['Marie-Hélène', 'Dubois-Vandenbroucke', false], photo: ['Marie-Hélène', 'Dubois-Vandenbroucke', true] };
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const cle of Object.keys(NOMS)) for (const opt of ['C', 'A', 'B', 'D']) {
    const info = await p.evaluate(async ([nomEntier, opt]) => {
      const [prenom, nomFam, avecPhoto] = nomEntier;
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
      if (!avecPhoto) { copie.photo = { url: '', inclure: false, souhaitee: 'non' }; }
      const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = prenom; copie.identite.nom = nomFam;
      window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; w._pdfChoisirVarianteSobre('mq-editorial'); await new Promise(r => setTimeout(r, 2200));
      if (opt === 'B') { w._cvPdfEnteteLibreMq = { libre: true, modif: true, disp: '5', pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} }; w._pdfRafraichir(); await new Promise(r => setTimeout(r, 2500)); }
      const d = w.document, tete = d.querySelector('#conteneurPage .tete'), nom = tete.querySelector('.nom'), pg = d.querySelector('.page-a4');
      let taille = null;
      if (opt === 'A' || opt === 'D') {
        nom.style.overflowWrap = 'normal'; nom.style.wordBreak = 'normal';
        const plusLong = nom.innerText.split(/[\s-]+/).reduce((a, m) => m.length > a.length ? m : a, '');
        const mes = d.createElement('span'); mes.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + w.getComputedStyle(nom).font + ';letter-spacing:' + w.getComputedStyle(nom).letterSpacing; d.body.appendChild(mes); mes.textContent = plusLong;
        const ajuste = () => { const L = nom.getBoundingClientRect().width; let fs = 46; for (; fs > 14; fs--) { mes.style.fontSize = fs + 'px'; if (mes.getBoundingClientRect().width <= L - 2) { break; } } return fs; };
        taille = ajuste();
        if (opt === 'D') { for (const larg of [42, 50, 58]) { if (taille >= 38) { break; } tete.style.gridTemplateColumns = larg + '% 1fr'; taille = ajuste(); } }
        nom.style.fontSize = taille + 'px'; mes.remove(); await new Promise(r => setTimeout(r, 300));
      }
      return { taille, ratio: Math.round(tete.getBoundingClientRect().height / pg.getBoundingClientRect().height * 1000) / 10 };
    }, [NOMS[cle], opt]);
    await p.screenshot({ path: path.join(__dirname, 'planche', cle + '_' + opt + '.png'), clip: { x: 24, y: 48, width: 756, height: 340 } });
    console.log(cle, opt, JSON.stringify(info));
  }
  await b.close();
})();
