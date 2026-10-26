/* Demande de Denis (26/10/2026) : « je ne veux pas que l'image bouge en tous les sens quand je clique sur le mode aléatoire : l'image disparaissait, apparaissait à
   l'endroit puis reparaissait en bas, un lag, une danse, un freeze ».
   Vrais clics sur le dé « Style rapide » dans chaque allure (Standard, Sobre, Créatif) ; à CHAQUE image (requestAnimationFrame) on note : position et taille du cadre de
   l'aperçu, position et taille du CV dans le cadre, défilement de la page, hauteur de la page, cadre prêt ou non ; et pendant tout le geste : nombre d'appels de
   pageResultats() (refonte complète de la page), nombre de fois où le CV est refait dans le cadre, plus longue pause entre deux images (freeze).
   Verdicts par clic : danse = positions ou tailles qui changent ; disparition = image sans CV ou CV de hauteur nulle ; saut du défilement ; freeze > 120 ms.
   Lecture seule. Usage : CAPTURES=dossier CLICS=10 node mesure_danse_de.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
const fs = require('fs');
(async () => {
  const { b, p } = await vers();
  await p.evaluate(() => {
    window.__n = { pageResultats: 0, refaits: 0, garages: 0 };
    const pr = window.pageResultats; window.pageResultats = function () { window.__n.pageResultats++; return pr.apply(this, arguments); };
    const gz = window._mepGarerZoneApercu; window._mepGarerZoneApercu = function () { const r = gz.apply(this, arguments); if (r) { window.__n.garages++; } return r; };
    window.__j = []; window.__go = false; window.__stamp = 0; let dernier = 0;
    const boucle = t => {
      if (window.__go) {
        const f = document.querySelector('#zonePdfInlineCV iframe'); if (f && !f.__s) { f.__s = ++window.__stamp; }
        let r = null, cvr = null, pret = false;
        try {
          const q = f.getBoundingClientRect(); r = [Math.round(q.top), Math.round(q.left), Math.round(q.width), Math.round(q.height)];
          const cv = f.contentDocument.querySelector('#conteneurPage .cv'); pret = !!cv;
          if (cv) { if (!f.__obs) { f.__obs = new MutationObserver(() => { window.__n.refaits++; }); f.__obs.observe(f.contentDocument.getElementById('conteneurPage'), { childList: true }); } const c = cv.getBoundingClientRect(); cvr = [Math.round(c.top), Math.round(c.height), Math.round(c.width)]; }
        } catch (e) {}
        window.__j.push({ t, dt: dernier ? t - dernier : 0, s: f ? f.__s : null, r, cvr, pret, sy: Math.round(window.scrollY), h: document.documentElement.scrollHeight });
      }
      dernier = t; requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  });
  const CLICS = parseInt(process.env.CLICS || '8', 10);
  const lignes = [];
  for (const allure of ['defaut', 'sobre', 'creatif']) {
    await p.locator('[data-mep-allure="' + allure + '"]').first().click().catch(() => {}); await p.waitForTimeout(3500);
    for (let k = 0; k < CLICS; k++) {
      await p.locator('#btnMepDe').first().scrollIntoViewIfNeeded().catch(() => {});
      await p.evaluate(() => { window.__n = { pageResultats: 0, refaits: 0, garages: 0 }; window.__j = []; window.__go = true; });
      await p.locator('#btnMepDe').first().click();
      await p.waitForTimeout(5000);
      const o = await p.evaluate(() => { window.__go = false; return { j: window.__j, n: window.__n }; });
      const j = o.j.filter(x => x.pret || true);
      const uniq = a => [...new Set(a)];
      const tops = uniq(j.filter(x => x.r).map(x => x.r[0])), larg = uniq(j.filter(x => x.r).map(x => x.r[2])), haut = uniq(j.filter(x => x.r).map(x => x.r[3]));
      const cvTops = uniq(j.filter(x => x.cvr).map(x => x.cvr[0])), cvHauts = uniq(j.filter(x => x.cvr).map(x => x.cvr[1]));
      const sy = uniq(j.map(x => x.sy)), pages = uniq(j.map(x => x.h));
      const sansCv = j.filter(x => !x.pret || (x.cvr && x.cvr[1] < 100)).length;
      const pause = Math.max(...j.map(x => x.dt));
      const l = { allure, clic: k + 1, appelsPageResultats: o.n.pageResultats, cvRefaitsDansLeCadre: o.n.refaits, cadresDistincts: uniq(j.map(x => x.s)).length, positionsHaut: tops.length, largeurs: larg.join('/'), hauteursCadre: haut.length, positionsCv: cvTops.length, hauteursCv: cvHauts.length, defilementsDistincts: sy.length, hauteursPage: pages.length, imagesSansCv: sansCv, plusLonguePauseMs: Math.round(pause), images: j.length };
      lignes.push(l); console.log(JSON.stringify(l));
    }
  }
  fs.writeFileSync((process.env.CAPTURES || '/tmp') + '/danse_de.json', JSON.stringify(lignes, null, 1));
  await b.close();
})();
