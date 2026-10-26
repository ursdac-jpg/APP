const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'informe', 'btnCarteAccueilMonTerritoire', 'tuile qui fait quoi');
  await L.clic(p, '#btnMonTerritoireCommencer', 'Ouvrir'); await p.waitForTimeout(2000);
  await L.clicTexte(p, 'Choisir mon département', 'Choisir mon département'); await p.waitForTimeout(1000);
  await L.clicTexte(p, 'Haute-Vienne (87)', 'département'); await p.waitForTimeout(2500); await L.photo(p, 'qfq-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 900));
  console.log('erreurs:', p.errs);
  await b.close();
})();
