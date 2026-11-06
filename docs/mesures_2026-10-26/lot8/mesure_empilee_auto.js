/* Lot 8 / étape 3 : le choix automatique de la disposition « Empilée ». Pour chacun des 39 modèles, contenu LONG (nom composé, titre long, accroche longue) ou court, SANS toucher à l'en-tête :
   on relève ce que la page fait toute seule (disposition retenue, part de la page prise par l'en-tête, largeur de l'accroche, texte hors page). Lecture seule.
   DEFAUT=1 : comme un CV neuf de l'application (l'en-tête « décalée » est posée d'office quand le modèle l'accepte). Usage : FIXTURE=long|moyen|court BASE=1 (sans l'ajustement du nom Éditorial, pour comparer) MODELES=a,b (facultatif) SORTIE=fichier.json node mesure_empilee_auto.js ; à lancer avant et après le changement pour comparer. */
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 } })).newPage();
  const erreurs = []; p.on('pageerror', e => erreurs.push(String(e).slice(0, 140)));
  await p.goto((process.env.URL_APP || 'http://localhost:8123') + '/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(() => { window.__DEBUG_EMP = true; }); await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  const liste = await p.evaluate(() => window.__rendu.liste().map(m => m.cle));
  const choisis = process.env.MODELES ? process.env.MODELES.split(',') : liste;
  const res = {};
  for (const cle of choisis) {
    res[cle] = await p.evaluate(async ([cle, fixture, defaut, base]) => {
      window.__cvPdfSansRemplissageInitial = !defaut; const copie = window.__rendu.dossierFixe();
      if (fixture === 'long') { const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps. Je souhaite aujourd’hui un poste stable où mon sérieux et ma ponctualité sont reconnus, dans une entreprise qui forme ses équipes. Je suis disponible rapidement.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; }
      if (fixture === 'moyen') { copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dupont-Martin'; }
      window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
      const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
      f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
      f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
      await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; if (base) { w._pdfAjusterNomEditorial = function () {}; } const m = window.__rendu.liste().find(x => x.cle === cle);
      if (window.__DEBUG_EMP) { const o = w._pdfRetirerEnteteDecaleeSiTropEtroite; w.__journal = []; w._pdfRetirerEnteteDecaleeSiTropEtroite = function () { const e = w._cvPdfEnteteLibreMq; w.__journal.push([w._cvPdfCleModeleEntete, e && e.disp, w._pdfEnteteTropHaut(), Math.round(w._pdfLargeurTexteAccroche())].join(':')); return o.apply(this, arguments); }; }
      if (m) { if (m.sobre) { w._pdfChoisirVarianteSobre(m.id); } else { w._pdfChoisirModeleCreatif(m.id); } await new Promise(r => setTimeout(r, 2200)); }
      const d = w.document, tete = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4');
      const pr = pg.getBoundingClientRect(), tr = tete ? tete.getBoundingClientRect() : null;
      const largeur = (typeof w._pdfLargeurTexteAccroche === 'function') ? Math.round(w._pdfLargeurTexteAccroche()) : null;
      const horsPage = tete ? [...tete.querySelectorAll('.blc, .nom, .metier, .accroche')].filter(e => e.getBoundingClientRect().right > pr.right + 1).length : 0;
      const e = w._cvPdfEnteteLibreMq || {};
      const gl = {}; Object.keys(w).filter(k => /^_cvPdfEntete|^_cvPdfEchelle|^_cvPdfTete/.test(k)).forEach(k => { try { gl[k] = JSON.stringify(w[k]).slice(0, 160); } catch (e) {} });
      return { globs: gl, refusee: JSON.stringify(w._cvPdfEmpileeRefusee || {}), journal: (w.__journal || []).join(' > '), etat: [e.libre, e.modif, e.disp].join('/'), auto: !!w._cvPdfEnteteDecaleeAuto, disp: tete ? tete.getAttribute('data-disp') : null, libre: !!(tete && tete.classList.contains('libre')), ratio: tr ? Math.round(tr.height / pr.height * 1000) / 1000 : null, accroche: largeur, horsPage, pages: d.querySelectorAll('.page-a4').length };
    }, [cle, process.env.FIXTURE || 'long', process.env.DEFAUT === '1', process.env.BASE === '1']);
    console.log(cle, JSON.stringify(res[cle]));
  }
  if (process.env.SORTIE) { fs.writeFileSync(process.env.SORTIE, JSON.stringify(res, null, 1)); }
  console.log('erreurs JS :', JSON.stringify(erreurs.slice(0, 3)));
  await b.close();
})();
