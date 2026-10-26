const L = require('./lib.js'); const M = require('./saisies2.js');
(async () => {
  const { b, p } = await M.mainJusquAuxDocuments();
  await L.etat(p, 'Vos documents (arrivée)'); await L.photo(p, 'main-6-documents-arrivee');
  console.log((await L.boutons(p)).filter(x => /^button/.test(x)).slice(0, 40).join('\n'));
  console.log('sections:', await p.evaluate(() => [...document.querySelectorAll('.accordeon-titre-groupe, .assistant-rect-tete, h2, h3')].filter(e => e.offsetParent).map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 50))));
  await L.clic(p, '#btnSuivantNavigation', 'Valider le CV');
  await L.photo(p, 'main-7-valide');
  console.log((await L.boutons(p)).filter(x => /^button/.test(x)).slice(0, 40).join('\n'));
  console.log('erreurs page:', p.errs, p.log.filter(l => /DIALOG/.test(l)));
  await b.close();
})();
