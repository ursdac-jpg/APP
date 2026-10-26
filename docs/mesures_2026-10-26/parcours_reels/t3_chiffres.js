const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'informe', 'btnCarteAccueilChiffres', 'tuile chiffres');
  await L.clic(p, '#btnComprendreLesChiffresCommencer', 'Ouvrir'); await p.waitForTimeout(2500);
  await L.photo(p, 'chi-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 26).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 900));
  await L.clicTexte(p, 'Choisir mon département', 'Choisir mon département'); await p.waitForTimeout(1000);
  await L.clicTexte(p, 'Haute-Vienne (87)', 'département'); await p.waitForTimeout(3000); await L.photo(p, 'chi-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 20).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(300, 1400));
  console.log('erreurs:', p.errs);
  await b.close();
})();
