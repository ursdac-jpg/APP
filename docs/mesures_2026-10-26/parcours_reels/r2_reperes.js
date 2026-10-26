const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'boiteaoutils', 'btnCarteAccueilReperes', 'tuile Mes Repères');
  await L.clic(p, '#btnReperesIntroCommencer', 'Je commence'); await p.waitForTimeout(1200);
  await L.photo(p, 'rep-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 30).join('\n'));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 800));
  await L.clicTexte(p, 'Garder une réflexion', 'Garder une réflexion'); await p.waitForTimeout(1000);
  await L.photo(p, 'rep-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  console.log('champs:', await p.evaluate(() => [...document.querySelectorAll('input, textarea, select')].filter(e => e.offsetParent).map(e => e.tagName + '#' + e.id + ' ' + (e.placeholder || '')).join(' ; ')));
  await p.locator('.reperes-type-btn', { hasText: 'Idée' }).click(); await p.waitForTimeout(800);
  await L.photo(p, 'rep-4');
  console.log('champs:', await p.evaluate(() => [...document.querySelectorAll('input, textarea, select')].filter(e => e.offsetParent).map(e => e.tagName + '#' + e.id + ' ' + (e.placeholder || '')).join(' ; ')));
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|reperes-type/.test(x)).slice(0, 24).join('\n'));
  const t = p.locator('textarea:visible, input[type=text]:visible').first();
  if (await t.count()) { await t.fill('Demander à ma conseillère comment présenter mes quatre ans d’entretien de bureaux.'); await p.waitForTimeout(500); }
  const gard = p.getByText(/Garder cette|Enregistrer|Garder$/).first(); console.log('bouton garder:', await gard.count() ? (await gard.textContent()).trim() : 'introuvable');
  if (await gard.count()) { await gard.click(); await p.waitForTimeout(1200); }
  await L.etat(p, 'après garder'); await L.photo(p, 'rep-5');
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 700));
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 24).join('\n'));
  console.log('erreurs:', p.errs);
  await b.close();
})();
