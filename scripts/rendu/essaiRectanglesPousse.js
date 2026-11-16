/* Essai réel du texte qui se pousse dans les rectangles de compétences (modèle « Rectangles arrondis », consigne 265, 12/11/2026).
   Méthode : le banc rend le modèle (créatif ou sobre), puis, avant la capture, un crochet pose les rectangles en position LIBRE
   (« Savoirs » posé sur « Compétences comportementales » ou autre disposition), laisse l'application recalculer, mesure et garde une capture.
   Utilisation : NODE_PATH=<dossier>/node_modules node scripts/rendu/essaiRectanglesPousse.js [sobre] [sombre]
   Affiche pour chaque scénario : le texte encore caché derrière un autre rectangle (doit être 0), le nombre de colonnes choisies, les hauteurs.
   Captures dans scripts/rendu/sorties_rectangles/. */
const fs = require('fs');
const path = require('path');
const { ouvrirPage } = require('../parcours/protocole/outils.js');

const SCENARIOS = {
  depart: { pos: {}, larg: {}, libre: true },
  savoirs_sur_comportementales: { pos: { b3: { x: 40, y: 150 } }, larg: { b3: 56 }, libre: true },
  savoirs_sur_pro: { pos: { b3: { x: 4, y: 40 } }, larg: { b3: 50 }, libre: true },
  comportementales_sur_pro: { pos: { b2: { x: 20, y: 20 } }, larg: { b2: 60 }, libre: true },
  presque_tout_couvert: { pos: { b3: { x: 46, y: 30 } }, larg: { b3: 66 }, plan: { b3: 3 }, libre: true }
};

(async () => {
  const sobre = process.argv.includes('sobre');
  const sombre = process.argv.includes('sombre');
  const dossierSortie = path.join(__dirname, 'sorties_rectangles');
  fs.mkdirSync(dossierSortie, { recursive: true });
  const { b, p } = await ouvrirPage(1280);
  await p.evaluate(fs.readFileSync(path.join(__dirname, 'banc.js'), 'utf8'));
  await p.evaluate(() => { Object.defineProperty(window, '__cvPdfSansRemplissageInitial', { get: () => false, set: () => {}, configurable: true }); window.__bancRemplissage = true; });
  await p.evaluate(() => {
    const retirer = HTMLIFrameElement.prototype.remove;
    window.__docsCadre = [];
    HTMLIFrameElement.prototype.remove = function () {
      try { window.__docsCadre.push('<!DOCTYPE html>' + this.contentDocument.documentElement.outerHTML); } catch (e) { /* rien */ }
      return retirer.call(this);
    };
  });
  const liste = await p.evaluate(() => window.__rendu.liste());
  const modele = liste.find((m) => /rectangles/i.test(m.cle + ' ' + m.nom) && (!!m.sobre === sobre));
  if (!modele) { console.log('modèle introuvable'); await b.close(); return; }
  let pire = 0;
  for (const [nom, sc] of Object.entries(SCENARIOS)) {
    const r = await p.evaluate(async ({ cle, sc }) => {
      window.__bancAvantCapture = async (w) => {
        const base = w._cvPdfEnteteLibreMq || {};
        w._pdfMqDefinirEntete(Object.assign({}, base, { libre: true, modif: true, pos: sc.pos, larg: sc.larg, plan: sc.plan || {}, hautBl: {}, hautB: null, haut: base.haut || null, ech: base.ech || {}, sty: base.sty || {}, lig: base.lig || {} }));
        await new Promise((ok) => setTimeout(ok, 1500));
        const d = w.document, zone = d.querySelector('.rc-boxes.libre');
        const info = { zone: !!zone, boites: [], caches: 0 };
        if (zone) {
          const zr = zone.getBoundingClientRect();
          const blcs = Array.from(zone.children).filter((e) => e.classList.contains('blc'));
          const z = (e) => parseInt(e.style.zIndex, 10) || 0;
          blcs.forEach((blc, i) => {
            const box = blc.querySelector('.rc-box'), ul = box.querySelector('ul');
            const r = blc.getBoundingClientRect();
            info.boites.push({ bl: blc.getAttribute('data-bl'), x: Math.round(r.left - zr.left), y: Math.round(r.top - zr.top), w: Math.round(r.width), h: Math.round(r.height), cols: ul.style.columnCount || 'défaut', couvert: blc.getAttribute('data-couvert') || '', pad: box.style.paddingLeft + '/' + box.style.paddingTop });
            const autres = blcs.filter((a, j) => j !== i && (z(a) > z(blc) || (z(a) === z(blc) && j > i)));
            box.querySelectorAll('.rc-boxt, li').forEach((el) => {
              const pl = d.createRange(); pl.selectNodeContents(el);
              Array.from(pl.getClientRects()).forEach((q) => {
                if (q.width <= 0) { return; }
                autres.forEach((a) => { const c = a.getBoundingClientRect(); if (!(q.right <= c.left + 1 || q.left >= c.right - 1 || q.bottom <= c.top + 1 || q.top >= c.bottom - 1)) { info.caches++; } });
              });
            });
          });
          info.hauteurZone = Math.round(zr.height);
        }
        window.__infoEssai = info;
      };
      const mod = window.__rendu.liste().find((x) => x.cle === cle);
      window.__docsCadre.length = 0;
      const res = await window.__rendu.rendre(mod, false);
      return { info: window.__infoEssai, pages: res.nbPages, doc: window.__docsCadre[window.__docsCadre.length - 1] || '' };
    }, { cle: modele.cle, sc });
    const q = await b.newPage();
    await q.setViewportSize({ width: 900, height: 1200 });
    await q.setContent(r.doc, { waitUntil: 'load' });
    if (sombre) { await q.evaluate(() => document.documentElement.setAttribute('data-theme', 'sombre')); }
    await q.waitForTimeout(500);
    const el = await q.$('.rc-boxes.libre');
    if (el) { await el.screenshot({ path: path.join(dossierSortie, (sobre ? 'sobre_' : 'creatif_') + nom + '.png') }); }
    await q.close();
    const i = r.info || {};
    pire = Math.max(pire, i.caches || 0);
    console.log(nom + ' : texte encore caché = ' + i.caches + ', pages ' + r.pages + ', zone ' + i.hauteurZone + ' px');
    (i.boites || []).forEach((x) => console.log('   ' + x.bl + ' x' + x.x + ' y' + x.y + ' ' + x.w + 'x' + x.h + ' colonnes ' + x.cols + (x.couvert ? ' ENTIÈREMENT COUVERT' : '') + ' marge ' + x.pad));
  }
  console.log('\n' + (pire === 0 ? 'OK : aucun texte caché' : 'ATTENTION : du texte reste caché'));
  await b.close();
})();
