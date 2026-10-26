/* Lot 8 / tâche 1 (suite) : quels gestes de l'éditeur REMPLACENT le cadre de l'aperçu (= clignotement) et lesquels le conservent ?
   Pour chaque commande visible (premier exemplaire de chaque type), un vrai clic, puis la même boucle d'images que mesure_clignotement.js.
   Lecture seule. Usage : CAPTURES=dossier node mesure_gestes.js */
process.env.CONTROLES = '0';
const { vers } = require('./vers_editeur.js');
const fs = require('fs');
const TYPES = ['allure', 'galerie-creatif', 'galerie-sobre', 'look', 'base', 'nuance', 'colonnes', 'bandeau', 'formecolonnes', 'colonnesinv', 'fondcolonnes', 'police', 'interligne', 'marge-mm', 'titrescasse', 'titresesp', 'styletitres', 'format-simple', 'stylefam-pro', 'dispcomp-pro', 'mode-presentation', 'niveau-detail', 'position-dates', 'formepuce', 'coord-gras', 'sepexp', 'anneauphoto', 'lectureguidee', 'org-colonnes', 'org-reduire', 'org-agrandir', 'degradebandeau', 'fondeffet', 'bordures', 'coinsarrondis', 'veuves', 'espparas', 'stylecomp', 'liste-2col', 'form-style', 'style-lieu', 'evid-simple', 'evid', 'regroupement', 'formatexp', 'coulcomp', 'coulpuces', 'textefond', 'colcol', 'secondaire'];
(async () => {
  const { b, p } = await vers();
  await p.evaluate(() => {
    window.__j = []; window.__go = false; window.__stamp = 0;
    const boucle = t => {
      if (window.__go) {
        const z = document.getElementById('zonePdfInlineCV'), f = z && z.querySelector('iframe');
        if (f && !f.__s) { f.__s = ++window.__stamp; }
        let pret = false, rw = null;
        try { pret = !!(f && f.contentDocument && f.contentDocument.querySelector('#conteneurPage .cv')); rw = Math.round(f.getBoundingClientRect().width); } catch (e) {}
        window.__j.push({ stamp: f ? f.__s : null, pret, rw, photo: typeof _mepPhotoApercu !== 'undefined' && !!_mepPhotoApercu });
      }
      requestAnimationFrame(boucle);
    };
    requestAnimationFrame(boucle);
  });
  await p.locator('[data-mep-allure="creatif"]').first().click(); await p.waitForTimeout(2500);
  await p.locator('[data-mep-galerie-tous="1"]').first().click().catch(() => {}); await p.waitForTimeout(1000);
  const lignes = [];
  for (const t of TYPES) {
    const sel = '[data-mep-' + t + ']';
    const n = await p.locator(sel).count();
    if (!n) { lignes.push({ type: t, resultat: 'absent' }); continue; }
    // premier exemplaire VISIBLE qui n'est pas déjà l'état actif
    let cible = null;
    for (let i = 0; i < Math.min(n, 12) && !cible; i++) { const l = p.locator(sel).nth(i); if (await l.isVisible().catch(() => false)) { cible = l; } }
    if (!cible) { lignes.push({ type: t, resultat: 'invisible (panneau fermé)' }); continue; }
    await cible.scrollIntoViewIfNeeded().catch(() => {});
    await p.evaluate(() => { window.__j = []; window.__go = true; window.__stampAvant = (document.querySelector('#zonePdfInlineCV iframe') || {}).__s || 0; });
    try { await cible.click({ timeout: 3000 }); } catch (e) { lignes.push({ type: t, resultat: 'clic impossible' }); await p.evaluate(() => { window.__go = false; }); continue; }
    await p.waitForTimeout(3800);
    const j = await p.evaluate(() => { window.__go = false; return window.__j; });
    const stamps = [...new Set(j.map(x => x.stamp))];
    lignes.push({ type: t, cadres: stamps.length, remplace: stamps.length > 1, imagesSansPret: j.filter(x => !x.pret).length, imagesPhoto: j.filter(x => x.photo).length, largeurs: [...new Set(j.filter(x => x.pret).map(x => x.rw))].join('/') });
    console.log(JSON.stringify(lignes[lignes.length - 1]));
  }
  fs.writeFileSync((process.env.CAPTURES || '/tmp') + '/gestes.json', JSON.stringify(lignes, null, 1));
  await b.close();
})();
