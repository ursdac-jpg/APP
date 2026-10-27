const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  for (const [tuile, nom] of [['btnCarteAccueilReperes', 'reperes'], ['btnCarteAccueilCarnet', 'carnet'], ['btnCarteAccueilLexique', 'lexique']]) {
    await p.evaluate(() => naviguerVers('cv')); await p.waitForTimeout(800);
    await L.carte(p, 'boiteaoutils', tuile, 'tuile ' + nom);
    await L.photo(p, 'bo-' + nom + '-1');
    console.log('--- ' + nom); console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join('\n'));
    console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 500));
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
