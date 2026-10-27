const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'boiteaoutils', 'btnCarteAccueilCarnet', 'tuile Mon Carnet');
  await L.clic(p, '#btnCarnetIntroOuvrir', 'Ouvrir mon Carnet'); await p.waitForTimeout(1200);
  await L.photo(p, 'car-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 700));
  const ta = p.locator('textarea:visible').first();
  if (await ta.count()) { await ta.fill('Ma conseillère m’a dit de relancer les employeurs le jeudi.'); await p.waitForTimeout(1500); await L.etat(p, 'après saisie'); await L.photo(p, 'car-3'); }
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  await L.clic(p, '#btnCarnetGarder', '+ Noter'); await p.waitForTimeout(1000); await L.photo(p, 'car-4');
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(300, 900));
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  console.log('erreurs:', p.errs);
  await b.close();
})();
