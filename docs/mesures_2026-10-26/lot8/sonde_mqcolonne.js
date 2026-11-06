/* mqColonne, contenu long : quel bloc de l'en-tête dépasse de la page, et de combien ? Lecture seule + capture. Usage : MODELE=mqColonne node sonde_mqcolonne.js */
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  const cle = process.env.MODELE || 'mqColonne';
  const r = await p.evaluate(async (cle) => {
    window.__cvPdfSansRemplissageInitial = false; const copie = window.__rendu.dossierFixe();
    const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke';
    window.dossier = copie; const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
    f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
    f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
    await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; const m = window.__rendu.liste().find(x => x.cle === 'creatif:' + cle);
    if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 3000));
    const d = w.document, tete = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4'), pr = pg.getBoundingClientRect();
    const hors = [...tete.querySelectorAll('*')].filter(e => e.getBoundingClientRect().right > pr.right + 1 || e.getBoundingClientRect().left < pr.left - 1).map(e => ({ cls: e.className, tag: e.tagName, txt: (e.textContent || '').slice(0, 40), g: Math.round(e.getBoundingClientRect().left - pr.left), d: Math.round(e.getBoundingClientRect().right - pr.right) }));
    return { disp: w._cvPdfEnteteLibreMq && w._cvPdfEnteteLibreMq.disp, tete: tete.className + ' | ' + (tete.style.cssText || '').slice(0, 200), hors: hors.slice(0, 12), grille: w.getComputedStyle(tete).gridTemplateColumns, page: Math.round(pr.width) };
  }, cle);
  console.log(JSON.stringify(r, null, 1));
  await p.screenshot({ path: path.join(__dirname, 'sonde_' + cle + '.png'), clip: { x: 0, y: 0, width: 800, height: 380 } });
  await b.close();
})();
