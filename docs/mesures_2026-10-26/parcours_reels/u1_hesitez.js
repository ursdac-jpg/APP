const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  for (const [tuile, nom] of [['btnCarteAccueilComparerPistes', 'comparer'], ['btnCarteAccueilUnCvPlusieursMetiers', 'ucpm']]) {
    await p.evaluate(() => naviguerVers('cv')); await p.waitForTimeout(800);
    await L.carte(p, 'orientation', tuile, 'tuile ' + nom);
    await L.photo(p, 'hes-' + nom + '-1');
    console.log('--- ' + nom); console.log((await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option/.test(x)).join('\n'));
    const c = p.locator('[id$="Commencer"]:visible, [id*="Commencer"]:visible').first();
    if (await c.count()) { await c.click(); await p.waitForTimeout(2000); await L.etat(p, 'Commencer ' + nom); await L.photo(p, 'hes-' + nom + '-2'); console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 20).join('\n')); console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 700)); }
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
