const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  for (const [tuile, nom] of [['btnCarteAccueilBilan', 'bilan'], ['btnCarteAccueilRegardRecruteur', 'regard'], ['btnCarteAccueilAts', 'ats'], ['btnCarteAccueilCoherence', 'coherence']]) {
    await p.evaluate(() => naviguerVers('cv')); await p.waitForTimeout(800);
    await L.carte(p, 'analyse', tuile, 'tuile ' + nom);
    await L.photo(p, 'an-' + nom + '-1');
    console.log('--- ' + nom); console.log((await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option/.test(x)).join('\n'));
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
