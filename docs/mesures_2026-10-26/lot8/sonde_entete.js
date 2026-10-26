/* Lot 8 / en-tête : pourquoi l'en-tête prend-il 40 % de la page (Sobre « Éditorial ») ou fait-il déborder l'accroche (« Colonne ») avec un texte long ?
   Rend le modèle (contenu LONG), relève la hauteur de l'en-tête, la largeur du texte de l'accroche, la disposition, et ce que répondent les garde-fous de l'application.
   Réglages facultatifs passés en JSON : REGS='{"regFondColonnes":"droite"}'. Lecture seule. Usage : MODELE=sobre:mq-editorial node sonde_entete.js */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  const cle = process.env.MODELE || 'sobre:mq-editorial', regs = JSON.parse(process.env.REGS || '{}'), fixture = process.env.FIXTURE || 'long';
  const r = await p.evaluate(async ([cle, regs, fixture]) => {
    window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
    const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.';
    if (fixture === 'long') { copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; }
    window.dossier = copie;
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
    f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
    f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('Marie-Hélène Dubois-Vandenbroucke', copie)); f.contentDocument.close();
    await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow, d = w.document; const m = window.__rendu.liste().find(x => x.cle === cle);
    if (m) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 2000)); }
    for (const id of Object.keys(regs)) { const e = d.getElementById(id); if (!e) { continue; } if (e.type === 'checkbox') { e.checked = !!regs[id]; } else { e.value = regs[id]; } e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 700)); }
    const cv = d.querySelector('#conteneurPage .cv'), pg = d.querySelector('.page-a4').getBoundingClientRect(), tete = cv.querySelector('.tete'), tr = tete.getBoundingClientRect();
    const blocs = [...tete.querySelectorAll('.nom, .metier, .accroche, .coord, .photo-mq, .blc')].map(e => { const q = e.getBoundingClientRect(); return e.className.toString().slice(0, 22) + ' ' + (e.getAttribute('data-bl') || '') + ' [' + Math.round(q.left - pg.left) + ',' + Math.round(q.top - pg.top) + ' ' + Math.round(q.width) + 'x' + Math.round(q.height) + ']'; });
    return { cvClasses: cv.className, teteClasses: tete.className, teteStyle: tete.getAttribute('style'), dataDisp: tete.getAttribute('data-disp'), dispositionSelect: (d.getElementById('regDispositionEntete') || {}).value, positionLibre: (d.getElementById('regPositionLibreEntete') || {}).checked, hauteurEntete: Math.round(tr.height), ratio: Math.round(tr.height / pg.height * 1000) / 1000, accrocheLargeur: Math.round(w._pdfLargeurTexteAccroche()), tropHaut: w._pdfEnteteTropHaut(), accEtroite: w._pdfAccrocheTropEtroite(), echelle: (d.getElementById('regEchelle') || {}).value, blocs: blocs.slice(0, 12), enteteLibreMq: JSON.stringify(w._cvPdfEnteteLibreMq || null).slice(0, 200), decaleeAuto: w._cvPdfEnteteDecaleeAuto };
  }, [cle, regs, fixture]);
  console.log(JSON.stringify(r, null, 1));
  if (process.env.CAPTURE) { await p.screenshot({ path: process.env.CAPTURE, clip: { x: 0, y: 0, width: 794, height: 520 } }); }
  await b.close();
})();
