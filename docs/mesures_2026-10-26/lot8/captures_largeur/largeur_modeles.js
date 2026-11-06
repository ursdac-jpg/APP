/* Largeur de colonne propre à chaque modèle (L8-4) : pour les modèles dont la recette a une autre largeur que les 36 % rendus à l'arrivée, deux captures de la page entière :
   « aujourd'hui » (curseur à 35, comme la galerie le laisse) et « recette » (curseur à la largeur de la recette). Relevé : largeur réelle de la colonne (%), part de page de l'en-tête,
   largeur de l'accroche, texte hors page, nombre de pages. FIXTURE=court|long. Usage : node largeur_modeles.js */
const { chromium } = require('playwright'); const path = require('path');
const MODELES = { mqColonne: 38, bandeauVertical: 40, duoOvale: 50, rubanDiagonal: 50, vagueMarine: 50, diagonalesContrastees: 50, medaillon: 32 };
const FIX = process.env.FIXTURE || 'court';
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 900, height: 1180 }, deviceScaleFactor: 1.5 })).newPage();
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(async () => { (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text()); });
  for (const [id, larg] of Object.entries(MODELES)) {
    for (const etat of ['actuel', 'recette']) {
      const r = await p.evaluate(async ([id, larg, etat, fix]) => {
        window.__cvPdfSansRemplissageInitial = false; const copie = window.__rendu.dossierFixe();
        if (fix === 'long') { const accL = 'Agent de sécurité rigoureux, j’ai appris à garder mon calme dans des situations parfois tendues et à bien accueillir le public. J’ai travaillé en équipe, de jour comme de nuit, avec le sens des responsabilités. Je sais rédiger un rapport clair, contrôler des accès et alerter à temps.'; copie.ia = copie.ia || {}; copie.ia.cv = copie.ia.cv || {}; copie.ia.cv.accrochesProposees = [accL]; copie.ia.cv.accrocheIdx = 0; copie.ia.cv.profil = accL; copie.titreCV = 'Agent de sécurité et de prévention, surveillance et accueil du public'; copie.metierCible = copie.titreCV; copie.identite.prenom = 'Marie-Hélène'; copie.identite.nom = 'Dubois-Vandenbroucke'; }
        window.dossier = copie; const old = document.getElementById('__ee'); if (old) { old.remove(); }
        const f = document.createElement('iframe'); f.id = '__ee'; f.style.cssText = 'position:fixed;left:0;top:0;width:794px;height:1123px;border:0;background:#fff;z-index:99999;'; document.body.appendChild(f);
        f.contentWindow.__cvPdfDossierSource = copie; f.contentWindow.__cvPdfModeGrandApercu = false;
        f.contentDocument.open(); f.contentDocument.write(construirePageInteractivePdfA4('X', copie)); f.contentDocument.close();
        await new Promise(r => setTimeout(r, 2500)); const w = f.contentWindow; w._pdfChoisirModeleCreatif(id); await new Promise(r => setTimeout(r, 3000));
        const sl = w.document.getElementById('regLargeurColonneGauche'); const avant = sl.value;
        { const v = etat === 'recette' ? larg : 35; sl.value = String(v); sl.dispatchEvent(new Event('input', { bubbles: true })); sl.dispatchEvent(new Event('change', { bubbles: true })); await new Promise(r => setTimeout(r, 2500)); }   // « actuel » = ce que la galerie laisse (35), « recette » = la largeur de la recette
        const d = w.document, tete = d.querySelector('#conteneurPage .tete'), pg = d.querySelector('.page-a4'), pr = pg.getBoundingClientRect();
        const corps = d.querySelector('.corps.deux > div:first-child') || d.querySelector('.corps > div');
        const acc = (typeof w._pdfLargeurTexteAccroche === 'function') ? Math.round(w._pdfLargeurTexteAccroche()) : null;
        const hors = tete ? [...tete.querySelectorAll('.blc, .nom, .metier, .accroche')].filter(e => e.getBoundingClientRect().right > pr.right + 1).length : 0;
        return { curseur: sl.value, curseurAvant: avant, colonnePct: corps ? Math.round(corps.getBoundingClientRect().width / pr.width * 100) : null, enteteParPage: tete ? Math.round(tete.getBoundingClientRect().height / pr.height * 1000) / 10 : null, accroche: acc, horsPage: hors, pages: d.querySelectorAll('.page-a4').length };
      }, [id, larg, etat, FIX]);
      await p.screenshot({ path: path.join(__dirname, FIX + '_' + id + '_' + etat + '.png'), clip: { x: 0, y: 0, width: 794, height: 1123 } });
      console.log(FIX, id, etat, JSON.stringify(r));
    }
  }
  await b.close();
})();
