/* Lot 8 / tâche 1 : le clignotement au changement de MODÈLE.
   Vrais clics dans l'éditeur de CV (créé à la main), puis, à chaque geste (modèle de la galerie, autre modèle, dé « Style rapide »), une boucle à chaque image
   (requestAnimationFrame) note : combien de cadres d'aperçu existent, lequel (tampon posé sur le cadre), s'il est prêt (un .cv rendu), sa largeur et sa position,
   la hauteur de la page, et la présence d'une « photo » de l'aperçu (_mepPhotoApercu). Verdict : un cadre REMPLACÉ ou une image sans aperçu prêt = clignotement.
   Lecture seule. Usage : CAPTURES=dossier node mesure_clignotement.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
const fs = require('fs');
(async () => {
  const { b, p } = await vers();
  await p.evaluate(() => {
    window.__j = []; window.__go = false; let n = 0;
    const boucle = t => {
      if (window.__go) {
        const z = document.getElementById('zonePdfInlineCV'), fr = document.querySelectorAll('#zonePdfInlineCV iframe, iframe.apercu-cv, #mepGarageApercu iframe');
        const f = z && z.querySelector('iframe');
        if (f && !f.__s) { f.__s = ++window.__stamp || (window.__stamp = 1); }
        let pret = false, rw = null, rl = null;
        try { pret = !!(f && f.contentDocument && f.contentDocument.querySelector('#conteneurPage .cv')); const r = f.getBoundingClientRect(); rw = Math.round(r.width); rl = Math.round(r.left); } catch (e) {}
        window.__j.push({ t: Math.round(t), zone: !!z, nbCadres: fr.length, stamp: f ? f.__s : null, pret, rw, rl, h: document.documentElement.scrollHeight, photo: typeof _mepPhotoApercu !== 'undefined' && !!_mepPhotoApercu, garage: !!document.getElementById('mepGarageApercu'), sy: Math.round(window.scrollY) });
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  });
  async function geste(nom, action, ms) {
    await p.evaluate(() => { window.__j = []; window.__go = true; });
    await action(); await p.waitForTimeout(ms || 4500);
    const j = await p.evaluate(() => { window.__go = false; return window.__j; });
    const stamps = [...new Set(j.map(x => x.stamp))];
    const sansApercu = j.filter(x => !x.pret).length;
    const largeurs = [...new Set(j.filter(x => x.pret).map(x => x.rw))];
    const positions = [...new Set(j.filter(x => x.pret).map(x => x.rl))];
    const hauteurs = [...new Set(j.map(x => x.h))];
    const photoImgs = j.filter(x => x.photo).length;
    const garages = j.filter(x => x.garage).length;
    const cadresMax = Math.max(...j.map(x => x.nbCadres));
    const res = { geste: nom, images: j.length, cadresDistincts: stamps.length, imagesSansApercuPret: sansApercu, imagesAvecPhoto: photoImgs, imagesEnGarage: garages, cadresMax, largeursAperçu: largeurs, positionsAperçu: positions, hauteursPage: hauteurs.length, hauteurMinMax: [Math.min(...hauteurs), Math.max(...hauteurs)] };
    console.log(JSON.stringify(res));
    return { res, j };
  }
  const tout = [];
  // 1. ouvrir la galerie des modèles Créatif
  await p.locator('[data-mep-allure="creatif"]').first().click().catch(e => console.log('allure creatif', String(e).slice(0, 80)));
  await p.waitForTimeout(3000);
  const tous = p.locator('[data-mep-galerie-tous="1"]').first();
  if (await tous.count()) { await tous.click(); await p.waitForTimeout(1500); }
  const ids = await p.evaluate(() => [...document.querySelectorAll('[data-mep-galerie-creatif]')].map(e => e.getAttribute('data-mep-galerie-creatif')));
  console.log('modèles Créatif visibles dans la galerie :', ids.join(', '));
  const choisir = id => async () => { await p.locator('[data-mep-galerie-creatif="' + id + '"]').first().scrollIntoViewIfNeeded().catch(() => {}); await p.locator('[data-mep-galerie-creatif="' + id + '"]').first().click(); };
  tout.push(await geste('modèle ' + ids[0], choisir(ids[0])));
  const ids2 = await p.evaluate(() => [...document.querySelectorAll('[data-mep-galerie-creatif]')].map(e => e.getAttribute('data-mep-galerie-creatif')));
  tout.push(await geste('modèle ' + (ids2[1] || ids2[0]), choisir(ids2[1] || ids2[0])));
  tout.push(await geste('modèle ' + (ids2[2] || ids2[0]), choisir(ids2[2] || ids2[0])));
  tout.push(await geste('dé « Style rapide »', async () => { await p.locator('#btnMepDe').first().scrollIntoViewIfNeeded().catch(() => {}); await p.locator('#btnMepDe').first().click(); }, 6000));
  tout.push(await geste('dé « Style rapide » (2)', async () => { await p.locator('#btnMepDe').first().click(); }, 6000));
  // un réglage simple : le nombre de colonnes
  const col = p.locator('[data-mep-colonnes="2"]').first();
  if (await col.count()) { tout.push(await geste('réglage : deux colonnes', async () => { await col.click(); }, 4500)); }
  fs.writeFileSync((process.env.CAPTURES || '/tmp') + '/clignotement_journal.json', JSON.stringify(tout.map(t => ({ res: t.res, premiersImages: t.j.slice(0, 400) })), null, 0));
  await b.close();
})();
