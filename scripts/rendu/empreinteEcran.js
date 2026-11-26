/* Empreinte d'affichage (audit téléphone du 24/11/2026) : prouve qu'un changement « téléphone » ne bouge rien sur les autres écrans.
   Pour chaque route et chaque largeur demandée, relève la position et la taille de TOUS les éléments visibles (hors boutons fixes animés) et les range dans un fichier.
   Utilisation : node scripts/rendu/empreinteEcran.js enregistrer avant.json [largeurs]     (largeurs : 1280,1024,800 par défaut)
                 node scripts/rendu/empreinteEcran.js comparer avant.json [largeurs]       (compare avec l'état actuel des fichiers, affiche chaque écart)
   Méthode : enregistrer AVANT la modification (fichiers d'origine), puis comparer APRÈS. Un écart sous 0,5 px est ignoré. Jamais chargé par l'application. */
const fs = require('fs');
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');

const [, , MODE, FICHIER, LARGEURS_TXT] = process.argv;
const LARGEURS = (LARGEURS_TXT || '1280,1024,800').split(',').map(Number);

function empreinte() {
  const out = {};
  const nom = (e, i) => (e.id ? '#' + e.id : e.tagName.toLowerCase() + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/)[0] : '') + ':' + i);
  document.querySelectorAll('body *').forEach((e, i) => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0 || cs.display === 'none' || cs.visibility === 'hidden') { return; }
    if (cs.position === 'fixed' || e.closest('.barre-navigation-fixe')) { return; }       // éléments fixes : leur position suit la fenêtre, on les compare à part
    out[nom(e, i)] = [Math.round((r.left + scrollX) * 2) / 2, Math.round((r.top + scrollY) * 2) / 2, Math.round(r.width * 2) / 2, Math.round(r.height * 2) / 2];
  });
  return out;
}

(async () => {
  const b = await chromium.launch();
  const res = {};
  for (const larg of LARGEURS) {
    const p = await ouvrir(b, larg);
    await p.goto('http://app.local/index.html');
    await p.waitForTimeout(3500);
    const routes = await p.evaluate(() => Object.keys(routes));
    for (const route of routes) {
      try {
        await p.evaluate((r) => { naviguerVers(r); window.scrollTo(0, 0); }, route);
        await p.waitForTimeout(500);
        res[larg + ' px | ' + route] = await p.evaluate(empreinte);
      } catch (e) { res[larg + ' px | ' + route] = { erreur: String(e.message).slice(0, 80) }; }
    }
    await p.context().close();
  }
  await b.close();
  if (MODE === 'enregistrer') { fs.writeFileSync(FICHIER, JSON.stringify(res)); console.log('Empreinte enregistrée : ' + Object.keys(res).length + ' pages dans ' + FICHIER); return; }
  const avant = JSON.parse(fs.readFileSync(FICHIER, 'utf8'));
  let nbPages = 0, nbEcarts = 0;
  Object.keys(res).forEach((k) => {
    nbPages++;
    const a = avant[k] || {}, n = res[k];
    const noms = new Set(Object.keys(a).concat(Object.keys(n)));
    const diffs = [];
    noms.forEach((x) => {
      if (!a[x] || !n[x]) { diffs.push(x + ' ' + (a[x] ? 'a disparu' : 'est apparu')); return; }
      if (a[x].some((v, i) => Math.abs(v - n[x][i]) > 0.5)) { diffs.push(x + ' ' + a[x].join(',') + ' → ' + n[x].join(',')); }
    });
    if (diffs.length) { nbEcarts += diffs.length; console.log('[' + k + '] ' + diffs.length + ' élément(s) changé(s), par exemple : ' + diffs.slice(0, 3).join(' ; ')); }
  });
  console.log('\nComparaison : ' + nbPages + ' pages, ' + nbEcarts + ' écart(s).');
  process.exit(nbEcarts ? 1 : 0);
})();
