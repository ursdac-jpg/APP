/* Éditorial, nom long : quelle combinaison garde le plus grand nom ? Pour chaque largeur de la zone du nom (défaut, 42 %, 50 %, 58 %), mot jamais coupé (overflow-wrap normal),
   police du nom réduite juste assez pour que le plus long mot tienne ; relevé : taille du nom, lignes du nom, part de la page prise par l'en-tête, largeur de l'accroche. */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const larg of [null, 42, 50, 58]) {
    const r = await p.evaluate(async (larg) => {
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe(); copie.photo = { url: '', inclure: false, souhaitee: 'non' };
      const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke';
      window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; w._pdfChoisirVarianteSobre('mq-editorial'); await new Promise(r => setTimeout(r, 2200));
      const d = w.document, tete = d.querySelector('#conteneurPage .tete'), nom = tete.querySelector('.nom'), pg = d.querySelector('.page-a4');
      if (larg) { tete.style.gridTemplateColumns = larg + '% 1fr'; }
      nom.style.overflowWrap = 'normal'; nom.style.wordBreak = 'normal';
      const plusLong = nom.innerText.split(/[\s-]+/).reduce((a, m) => m.length > a.length ? m : a, '');
      const mes = d.createElement('span'); mes.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap;font:' + w.getComputedStyle(nom).font + ';letter-spacing:' + w.getComputedStyle(nom).letterSpacing; d.body.appendChild(mes);
      const L = nom.getBoundingClientRect().width; let fs = 46; nom.style.fontSize = fs + 'px';
      for (; fs > 14; fs -= 1) { mes.style.fontSize = fs + 'px'; mes.textContent = plusLong.toUpperCase() === plusLong ? plusLong : plusLong; if (mes.getBoundingClientRect().width <= L - 2) { break; } }
      nom.style.fontSize = fs + 'px'; await new Promise(r => setTimeout(r, 300));
      const acc = tete.querySelector('.accroche'); const lignes = Math.round(nom.getBoundingClientRect().height / (fs * 1));
      return { largeurNom: Math.round(L), plusLongMot: plusLong, taillePx: fs, lignesNom: lignes, ratio: Math.round(tete.getBoundingClientRect().height / pg.getBoundingClientRect().height * 1000) / 1000, accrocheLarg: Math.round(acc.getBoundingClientRect().width) };
    }, larg);
    console.log('zone du nom', larg || 'défaut', JSON.stringify(r));
    await p.screenshot({ path: 'combi_' + (larg || 'defaut') + '.png', clip: { x: 20, y: 40, width: 760, height: 420 } });
  }
  await b.close();
})();
