/* Lance le banc de rendu des modèles de CV (scripts/rendu/banc.js) dans le navigateur de test, SANS serveur de développement.
   Utilisation : node scripts/rendu/lancerBanc.js verifier      (compare au registre : liste les écarts)
                 node scripts/rendu/lancerBanc.js regenerer     (écrit registre.json, capacités et les miniatures dans scripts/rendu/sortie/)
   Les écritures que le banc demande à `/__ecrire/` (serveur_dev.py) sont reçues ici et déposées dans scripts/rendu/sortie/.
   Après « regenerer » : copier sortie/registre.json dans scripts/rendu/, les sortie/<famille>_<id>.json dans data/miniatures/ (voir docs/PLAN_BANC_ET_MINIATURES_2026-10-11.md). */
const fs = require('fs');
const path = require('path');
const { ouvrirPage } = require('../parcours/protocole/outils.js');

(async () => {
  const mode = process.argv[2] === 'regenerer' ? 'regenerer' : 'verifier';
  const sortie = path.join(__dirname, 'sortie');
  fs.mkdirSync(sortie, { recursive: true });
  const { b, p } = await ouvrirPage(738);
  await p.route('http://app.local/__ecrire/**', async (route) => {
    const nom = decodeURIComponent(new URL(route.request().url()).pathname.replace('/__ecrire/', ''));
    if (!nom || nom.includes('..') || nom.startsWith('.') || nom.includes('/')) { await route.fulfill({ status: 400, body: 'refusé' }); return; }
    fs.writeFileSync(path.join(sortie, nom), route.request().postData() || '');
    await route.fulfill({ status: 200, body: 'ok' });
  });
  await p.evaluate(fs.readFileSync(path.join(__dirname, 'banc.js'), 'utf8'));
  await p.evaluate(({ mode }) => { window.__rendu.lancer(mode, mode === 'regenerer' ? { rendus: true } : {}); }, { mode });
  let etat = null;
  for (let i = 0; i < 400; i++) {
    await p.waitForTimeout(2000);
    etat = await p.evaluate(() => { const e = window.__rendu.etat; return e ? { fait: e.fait, total: e.total, termine: e.termine, ecarts: e.ecarts, sansReference: e.sansReference, erreurs: e.erreurs, tropColores: e.tropColores } : null; });
    if (etat && etat.termine) { break; }
  }
  console.log('mode ' + mode + ' : ' + (etat ? etat.fait + '/' + etat.total : 'pas d\'état'));
  if (etat) {
    console.log('écarts : ' + (etat.ecarts.length ? '\n  ' + etat.ecarts.join('\n  ') : 'aucun'));
    if (etat.sansReference.length) { console.log('sans référence : ' + etat.sansReference.join(', ')); }
    if (etat.erreurs.length) { console.log('erreurs : ' + etat.erreurs.join(' | ')); }
  }
  await b.close();
})();
