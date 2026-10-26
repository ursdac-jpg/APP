const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'preparer', 'btnCarteAccueilEmployeurs', 'tuile Employeurs près de chez moi');
  await p.waitForTimeout(1500); await L.etat(p, 'écran'); await L.photo(p, 'empl-1');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 30).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 700));
  await L.clic(p, '#btnEmployeursCommencer', 'Voir les employeurs'); await p.waitForTimeout(2500); await L.photo(p, 'empl-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 30).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 900));
  console.log('erreurs:', p.errs);
  await b.close();
})();
