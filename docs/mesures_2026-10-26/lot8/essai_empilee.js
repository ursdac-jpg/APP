/* Lot 8 / étape 1 : la disposition « Empilée » (disp = 5 de l'en-tête libre) sur du VRAI rendu, contenu court ou long. Active l'état comme le ferait le bouton « Empilée » du grand aperçu.
   Relevé : hauteur de l'en-tête (part de la page), texte hors page, chevauchements entre les quatre blocs, taille du titre, lignes du titre. Captures avant / après.
   Usage : SORTIE=dossier FIXTURE=long|court MODELES=a,b node essai_empilee.js */
const { chromium } = require('playwright'); const fs = require('fs');
const SORTIE = process.env.SORTIE || '/tmp/essai_empilee'; fs.mkdirSync(SORTIE, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  const erreurs = []; p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const cle of (process.env.MODELES || 'standard,creatif:mqBandeau,creatif:colonneBandeau,creatif:sidebarVague').split(',')) {
    const nom = cle.replace(/[^a-zA-Z0-9]/g, '_');
    const mesure = () => p.evaluate(() => {
      const f = document.getElementById('__ee'), w = f.contentWindow, d = w.document, tete = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4'), pr = pg.getBoundingClientRect(), tr = tete.getBoundingClientRect();
      const blocs = [...tete.querySelectorAll('.blc')].map(e => { const q = e.getBoundingClientRect(); return { bl: e.getAttribute('data-bl'), x: Math.round(q.left - pr.left), y: Math.round(q.top - pr.top), r: Math.round(q.right - pr.left), b: Math.round(q.bottom - pr.top) }; });
      const chev = []; for (let i = 0; i < blocs.length; i++) for (let j = i + 1; j < blocs.length; j++) { const a = blocs[i], c = blocs[j]; if (Math.min(a.r, c.r) - Math.max(a.x, c.x) > 2 && Math.min(a.b, c.b) - Math.max(a.y, c.y) > 2) { chev.push(a.bl + '/' + c.bl); } }
      const met = tete.querySelector('.metier'); const lh = met ? (parseFloat(w.getComputedStyle(met).lineHeight) || parseFloat(w.getComputedStyle(met).fontSize) * 1.2) : 0;
      return { disp: tete.getAttribute('data-disp'), libre: tete.classList.contains('libre'), ratio: Math.round(tr.height / pr.height * 1000) / 1000, horsPage: blocs.filter(x => x.r > pr.width + 1).map(x => x.bl), chevauchements: chev, tailleTitre: met ? Math.round(parseFloat(w.getComputedStyle(met).fontSize)) : null, lignesTitre: met ? Math.round(met.getBoundingClientRect().height / lh) : null };
    });
    await p.evaluate(async ([cle, fixture]) => {
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
      if (fixture === 'long') { const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; }
      window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; const m = window.__rendu.liste().find(x => x.cle === cle);
      if (m) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 2000)); }
    }, [cle, process.env.FIXTURE || 'long']);
    const avant = await mesure(); await p.screenshot({ path: SORTIE + '/' + nom + '__avant.png', clip: { x: 0, y: 0, width: 794, height: 560 } });
    await p.evaluate(async () => { const w = document.getElementById('__ee').contentWindow; w._cvPdfEnteteLibreMq = { libre: true, modif: true, disp: '5', pos: {}, larg: {}, haut: null, ech: {}, sty: {}, plan: {} }; w._pdfRafraichir(); await new Promise(r => setTimeout(r, 2500)); });
    const apres = await mesure(); await p.screenshot({ path: SORTIE + '/' + nom + '__apres.png', clip: { x: 0, y: 0, width: 794, height: 560 } });
    console.log(cle, 'AVANT', JSON.stringify(avant), 'APRÈS', JSON.stringify(apres));
  }
  console.log('erreurs JS :', JSON.stringify(erreurs.slice(0, 3)));
  await b.close();
})();
