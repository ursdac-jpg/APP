const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  for (const [tuile, nom] of [['btnCarteAccueilActualites', 'cadre'], ['btnCarteAccueilChiffres', 'chiffres'], ['btnCarteAccueilMonTerritoire', 'quifaitquoi']]) {
    await p.evaluate(() => naviguerVers('cv')); await p.waitForTimeout(800);
    await L.carte(p, 'informe', tuile, 'tuile ' + nom);
    await L.photo(p, 'inf-' + nom + '-1');
    console.log('--- ' + nom); console.log((await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option/.test(x)).join('\n'));
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
