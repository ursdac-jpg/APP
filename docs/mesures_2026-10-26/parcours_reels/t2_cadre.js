const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'informe', 'btnCarteAccueilActualites', 'tuile cadre');
  await L.clic(p, '#btnSeTenirInformeCommencer', 'Ouvrir'); await p.waitForTimeout(1800);
  await L.photo(p, 'cad-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 26).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 800));
  await L.clicTexte(p, 'Choisir mon territoire', 'Choisir mon territoire'); await p.waitForTimeout(1200); await L.photo(p, 'cad-3');
  await L.clicTexte(p, 'Haute-Vienne (87)', 'département Haute-Vienne'); await p.waitForTimeout(1500);
  await L.photo(p, 'cad-4');
  await L.clicTexte(p, 'Emploi et contrats', 'rayon Emploi et contrats'); await p.waitForTimeout(1500); await L.photo(p, 'cad-5');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 16).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 500));
  const fiche = p.getByText('La période d\'essai', { exact: false }).first();
  if (await fiche.count()) { await fiche.click(); await p.waitForTimeout(1500); await L.etat(p, 'première fiche'); await L.photo(p, 'cad-6'); console.log('texte fiche:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 900)); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
