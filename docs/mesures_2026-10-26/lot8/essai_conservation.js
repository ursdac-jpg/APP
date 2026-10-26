/* Lot 8 / tâche 1 (essai du remède, SANS modifier l'application) : avant un clic sur un modèle de la galerie, on active à la main la conservation de l'aperçu
   (_mepConserverApercuPendant, déjà utilisée par le dé et par « Mise en page »). On compare, pour la même suite de modèles :
   (a) le chemin actuel, (b) le chemin avec conservation : nombre de cadres, largeur 794 aperçue, et EMPREINTE du CV final (doit être identique).
   Usage : CAPTURES=dossier MODE=actuel|conserve node essai_conservation.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
(async () => {
  const { b, p } = await vers();
  const MODE = process.env.MODE || 'actuel';
  await p.evaluate(() => {
    window.__j = []; window.__go = false; window.__stamp = 0;
    const boucle = t => { if (window.__go) { const f = document.querySelector('#zonePdfInlineCV iframe'); if (f && !f.__s) { f.__s = ++window.__stamp; } let pret = false, rw = null; try { pret = !!f.contentDocument.querySelector('#conteneurPage .cv'); rw = Math.round(f.getBoundingClientRect().width); } catch (e) {} window.__j.push({ s: f ? f.__s : null, pret, rw }); } requestAnimationFrame(boucle); };
    requestAnimationFrame(boucle);
  });
  const FAM = process.env.FAMILLE || 'creatif';
  await p.locator('[data-mep-allure="' + FAM + '"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const tousIds = await p.evaluate((FAM) => [...document.querySelectorAll('[data-mep-galerie-' + FAM + ']')].map(e => e.getAttribute('data-mep-galerie-' + FAM)), FAM);
  for (const id of (process.env.MODELES ? process.env.MODELES.split(',') : tousIds)) {
    await p.evaluate(() => { window.__j = []; window.__go = true; });
    if (MODE === 'conserve') { await p.evaluate(() => _mepConserverApercuPendant(4000)); }
    const l = p.locator('[data-mep-galerie-' + FAM + '="' + id + '"]').first();
    await l.scrollIntoViewIfNeeded().catch(() => {}); await l.click();
    await p.waitForTimeout(4200);
    const r = await p.evaluate(() => {
      window.__go = false; const j = window.__j; const f = document.querySelector('#zonePdfInlineCV iframe');
      let h = '', n = 0; try { const c = f.contentDocument.getElementById('conteneurPage'); h = c.innerHTML.replace(/ contenteditable="[^"]*"/g, ''); } catch (e) {}
      window.__html = h;
      let x = 2166136261; for (let i = 0; i < h.length; i++) { x ^= h.charCodeAt(i); x = (x * 16777619) >>> 0; }
      return { cadres: new Set(j.map(a => a.s)).size, largeur794: j.filter(a => a.rw === 794).length, empreinte: x.toString(16) + ':' + h.length };
    });
    console.log(MODE, id, JSON.stringify(r));
    if (process.env.DUMP) { require('fs').writeFileSync(process.env.DUMP + '/' + MODE + '_' + id + '.html', await p.evaluate(() => window.__html)); }
  }
  await b.close();
})();
