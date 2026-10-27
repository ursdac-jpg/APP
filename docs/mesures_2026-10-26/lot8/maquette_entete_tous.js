/* Lot 8 / maquette de l'en-tête empilée : pour chaque modèle, le même CV (nom, titre et accroche longs) tel qu'aujourd'hui, puis avec la disposition empilée PROTOTYPÉE par un style injecté
   (photo et nom sur une ligne ; titre pleine largeur sur deux lignes au plus, taille ajustée ; coordonnées sur une ligne ; accroche en bas, pleine largeur).
   Rien n'est modifié dans l'application : ce sont des captures du vrai rendu. Usage : SORTIE=dossier node maquette_entete.js */
const { chromium } = require('playwright'); const fs = require('fs');
const SORTIE = process.env.SORTIE || '/tmp/maquette_entete'; fs.mkdirSync(SORTIE, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const cle of (process.env.MODELES || 'standard,creatif:mqBandeau,creatif:mqDiagonale,creatif:colonneBandeau,creatif:sidebarVague,creatif:chronoFonce').split(',')) {
    const info = await p.evaluate(async (cle) => {
      window.__cvPdfSansRemplissageInitial = true; const copie = window.__rendu.dossierFixe();
      const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.';
      copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke';
      window.dossier = copie;
      const old = document.getElementById('__mq'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__mq'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('Marie-Hélène Dubois-Vandenbroucke', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow, d = w.document; const m = window.__rendu.liste().find(x => x.cle === cle);
      if (m) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 2000)); }
      const ratio = () => { const t = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4'); return Math.round(t.getBoundingClientRect().height / pg.getBoundingClientRect().height * 1000) / 1000; };
      const t0 = d.querySelector('#conteneurPage .tete'), cv0 = d.querySelector('.cv'); const pv0 = w.getComputedStyle(cv0, '::before');
      const colSousEntete = /col-vague/.test(cv0.className) && pv0.content !== 'none' && parseFloat(pv0.top) < t0.getBoundingClientRect().bottom - cv0.getBoundingClientRect().top - 10 && pv0.backgroundColor !== 'rgba(0, 0, 0, 0)' && !cv0.classList.contains('col-vide');
      return { avant: ratio(), structure: [...t0.children].map(e => (e.className || 'div').toString().split(' ')[0] + ':' + [...e.children].map(c => String(c.className).split(' ')[0]).join('+')).join(' | '), teteClasses: t0.className, colonneSousEntete: colSousEntete };
    }, cle);
    const nom = cle.replace(/[^a-zA-Z0-9]/g, '_');
    await p.screenshot({ path: SORTIE + '/' + nom + '__avant.png', clip: { x: 0, y: 0, width: 794, height: 560 } });
    const apres = await p.evaluate(async () => {
      const f = document.getElementById('__mq'), w = f.contentWindow, d = w.document, tete = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4');
      const st = d.createElement('style'); st.id = '__proto';
      st.textContent = `.cv .tete{display:flex !important;flex-direction:column !important;gap:6px !important;grid-template-columns:none !important}
.cv .tete > *{width:100% !important;max-width:none !important;margin:0 !important;min-width:0 !important}
.cv .tete > div:first-child{display:grid !important;grid-template-columns:auto 1fr;column-gap:16px;align-items:center}
.cv .tete > div:first-child > .nom{grid-column:2;grid-row:1;margin:0 !important}
.cv .tete > div:first-child > .photo-mq{grid-column:1;grid-row:1;margin:0 !important}
.cv .tete > div:first-child > .coord{grid-column:1 / -1;grid-row:2;display:flex !important;flex-wrap:wrap;gap:2px 18px;margin-top:4px !important}
.cv .tete .metier{text-align:left !important;line-height:1.15 !important}
.cv .tete .accroche{text-align:left !important;border-left:0 !important;padding-left:0 !important}`;
      d.head.appendChild(st);
      const met = tete.querySelector('.metier'); let fs0 = parseFloat(w.getComputedStyle(met).fontSize), lh = () => parseFloat(w.getComputedStyle(met).lineHeight) || fs0 * 1.15;
      met.style.setProperty('font-size', fs0 + 'px', 'important');
      for (let i = 0; i < 40 && met.getBoundingClientRect().height > 2.1 * lh() && fs0 > 13; i++) { fs0 -= 1; met.style.setProperty('font-size', fs0 + 'px', 'important'); }
      await new Promise(r => setTimeout(r, 300));
      return { apres: Math.round(tete.getBoundingClientRect().height / pg.getBoundingClientRect().height * 1000) / 1000, tailleTitre: fs0, lignesTitre: Math.round(met.getBoundingClientRect().height / lh()) };
    });
    await p.screenshot({ path: SORTIE + '/' + nom + '__apres.png', clip: { x: 0, y: 0, width: 794, height: 560 } });
    console.log(cle, JSON.stringify(Object.assign({}, info, apres)));
  }
  await b.close();
})();
