const L = require('./lib.js'); const M = require('./saisies2.js');
(async () => {
  const { b, p } = await M.mainJusquAuxDocuments();
  await L.clic(p, '#btnSuivantNavigation', 'Valider le CV');
  await L.clicTexte(p, 'Télécharger le fichier Word', 'Télécharger Word');
  await p.waitForTimeout(2500); await L.etat(p, 'après Word'); await L.photo(p, 'main-8-apres-word');
  console.log((await L.boutons(p)).filter(x => /^button/.test(x)).slice(0, 25).join('\n'));
  console.log('ouvertures:', await p.evaluate(() => window.__ouvertures), 'dialogues:', p.log.filter(l => /DIALOG/.test(l)));
  const fin = p.locator('.barre-navigation-fixe .btn-success');
  console.log('bouton vert présent:', await fin.count());
  if (await fin.count()) { await fin.first().click(); await L.etat(p, 'Merci bien, j\'ai fini'); await L.photo(p, 'main-9-fin'); console.log((await L.boutons(p)).filter(x => /^button/.test(x)).slice(0, 25).join('\n')); }
  console.log('erreurs page:', p.errs);
  await b.close();
})();
