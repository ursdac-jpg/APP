const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'boiteaoutils', 'btnCarteAccueilReperes', 'tuile Mes Repères');
  await L.clic(p, '#btnReperesIntroCommencer', 'Je commence'); await p.waitForTimeout(800);
  const compte = async () => p.evaluate(() => ({ items: document.querySelectorAll('.reperes-item-head').length, stockage: (() => { try { return Object.keys(localStorage).filter(k => /repere/i.test(k)).map(k => k + ':' + (localStorage.getItem(k) || '').length); } catch (e) { return []; } })() }));
  console.log('avant:', JSON.stringify(await compte()));
  await L.clicTexte(p, 'Garder une réflexion', 'Garder une réflexion'); await p.locator('.reperes-type-btn', { hasText: 'Idée' }).click(); await p.waitForTimeout(800);
  console.log('formulaire ouvert, rien tapé:', JSON.stringify(await compte()));
  await p.locator('#reperesSaisieAnnuler').click(); await p.waitForTimeout(800);
  console.log('après Annuler:', JSON.stringify(await compte()));
  await L.photo(p, 'rep-6-apres-annuler');
  await b.close();
})();
