const L = require('./lib.js'); const M = require('./saisies3.js');
(async () => {
  const { b, p } = await M.assistantJusquALaPage();
  await M.collerReponseCv(p, L);
  await L.clic(p, '#btnContinuerCollage', 'Continuer (assistant -> documents)'); await p.waitForTimeout(3000);
  await L.etat(p, 'Vos documents (arrivée, avec assistant)'); await L.photo(p, 'assist-5-documents');
  console.log('sections:', (await p.evaluate(() => [...document.querySelectorAll('.assistant-rect-tete')].filter(e => e.offsetParent).map(e => e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)))).join(' | '));
  console.log('accroches proposées visibles:', await p.evaluate(() => /Dix ans d.entretien/.test(document.body.innerText)));
  await L.clic(p, '.barre-navigation-fixe .barre-navigation button:first-child', 'RETOUR depuis Vos documents'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (re-aller aux documents)'); await p.waitForTimeout(2500);
  await L.clic(p, '#btnSuivantNavigation', 'Valider le CV'); await p.waitForTimeout(1500);
  await L.clicTexte(p, 'Télécharger le fichier Word', 'Télécharger Word'); await p.waitForTimeout(2500);
  await L.etat(p, 'après export'); 
  console.log('suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer/.test(x)).join(' ; '));
  const fin = p.locator('.barre-navigation-fixe .btn-success'); if (await fin.count()) { await fin.first().click(); await L.etat(p, 'Merci bien, j’ai fini'); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
