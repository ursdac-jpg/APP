const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  for (const [tuile, cmd, nom] of [['btnCarteAccueilRegardRecruteur', '#btnRegardRecruteurCommencer', 'regard'], ['btnCarteAccueilAts', '#btnAtsCommencer', 'ats'], ['btnCarteAccueilCoherence', '#ctBoutonJeCommence', 'coherence']]) {
    await p.evaluate(() => naviguerVers('cv')); await p.waitForTimeout(800);
    await L.carte(p, 'analyse', tuile, 'tuile ' + nom);
    await L.clic(p, cmd, 'Commencer ' + nom); await p.waitForTimeout(1500);
    await L.photo(p, 'an-' + nom + '-2');
    console.log('--- ' + nom); console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|carte-objectif/.test(x)).slice(0, 18).join('\n'));
    console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 500));
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
