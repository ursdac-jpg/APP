const L = require('./lib.js'); const M = require('./saisies3.js');
(async () => {
  const { b, p } = await M.assistantJusquALaPage();
  await M.collerReponseCv(p, L);
  await M.continuerJusquAuxDocuments(p, L);
  await L.photo(p, 'assist-7-documents');
  console.log('accroche proposée visible:', await p.evaluate(() => /Dix ans d.entretien|Agent d.entretien autonome/.test(document.body.innerText)));
  await L.clic(p, '.barre-navigation-fixe .barre-navigation button:first-child', 'RETOUR depuis Vos documents'); 
  await M.continuerJusquAuxDocuments(p, L);
  await L.clic(p, '.barre-navigation-fixe .barre-navigation button:last-child', 'Valider le CV'); await p.waitForTimeout(1500);
  await L.clicTexte(p, 'Télécharger le fichier Word', 'Télécharger Word'); await p.waitForTimeout(2500);
  await L.etat(p, 'après export');
  console.log('suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer/.test(x)).join(' ; '));
  const fin = p.locator('.barre-navigation-fixe .btn-success'); if (await fin.count()) { await fin.first().click(); await L.etat(p, 'Merci bien, j’ai fini'); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
