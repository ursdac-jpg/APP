/* Captures de la maquette « Éditorial » : état actuel, nom ajusté pour tenir (option A), Empilée (option B), contenu long puis court. Usage : node options_editorial.js (depuis ce dossier). */
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const fixture of ['long', 'court']) {
    for (const option of ['actuel', 'A', 'B']) {
      await p.evaluate(async ([fixture, option]) => {
        window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe(); copie.photo = { url: '', inclure: false, souhaitee: 'non' };
        if (fixture === 'long') { const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; }
        window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
        const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
        f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
        f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
        await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow;
        w._pdfChoisirVarianteSobre('mq-editorial'); await new Promise(r => setTimeout(r, 2200));
        if (option === 'B') { w._cvPdfEnteteLibreMq = { libre: true, modif: true, disp: '5', pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} }; w._pdfRafraichir(); await new Promise(r => setTimeout(r, 2500)); }
        if (option === 'A') {
          const nom = w.document.querySelector('#conteneurPage .tete .nom');
          if (nom) { let t = 0; const lim = () => nom.scrollWidth > nom.clientWidth + 1 || [...nom.querySelectorAll('*')].some(x => x.scrollWidth > x.clientWidth + 1); let fs = parseFloat(w.getComputedStyle(nom).fontSize);
            // plus grand mot du nom : il doit tenir sur une ligne de la colonne
            const mots = nom.innerText.split(/[\s]+/); const mesure = document.createElement('span'); mesure.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + w.getComputedStyle(nom).font; w.document.body.appendChild(mesure);
            const largeurCol = nom.getBoundingClientRect().width; let plusLong = ''; mots.forEach(m => { if (m.length > plusLong.length) { plusLong = m; } }); mesure.textContent = plusLong;
            const l = mesure.getBoundingClientRect().width; if (l > largeurCol) { nom.style.fontSize = (fs * largeurCol / l * 0.97) + 'px'; } nom.style.overflowWrap = 'normal'; nom.style.wordBreak = 'normal'; mesure.remove(); }
          await new Promise(r => setTimeout(r, 400));
        }
      }, [fixture, option]);
      await p.screenshot({ path: path.join(__dirname, 'editorial_' + fixture + '_' + option + '.png'), clip: { x: 20, y: 40, width: 760, height: 420 } });
      console.log(fixture, option, 'ok');
    }
  }
  await b.close();
})();
