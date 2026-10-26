const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'boiteaoutils', 'btnCarteAccueilLexique', 'tuile Lexique');
  await L.clic(p, '#btnLexiqueIntroOuvrir', 'Ouvrir le Lexique'); await p.waitForTimeout(1500);
  await L.photo(p, 'lex-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 18).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 500));
  const champ = p.locator('input[type=search]:visible, input[type=text]:visible').first();
  await champ.click(); await champ.pressSequentially('CDD', { delay: 90 }); await p.waitForTimeout(1500); await L.etat(p, 'recherche CDD'); await L.photo(p, 'lex-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 12).join('\n'));
  const fiche = p.locator('.list-group-item').first();
  if (await fiche.count()) { await fiche.click(); await p.waitForTimeout(1200); await L.etat(p, 'fiche ouverte'); await L.photo(p, 'lex-4'); console.log('texte fiche:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 700)); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
