const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'analyse', 'btnCarteAccueilAts', 'tuile ATS');
  await L.clic(p, '#btnAtsCommencer', 'Commencer');
  await S.deposerFichierDepuis(p, 'btnAtsDeposerCV');
  await L.etat(p, 'après dépôt'); await L.photo(p, 'ats-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join('\n'));
  console.log('message bouton:', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(600, 1500));
  await L.clicTexte(p, 'Un métier précis', 'un métier précis');
  console.log('champs visibles:', await p.evaluate(() => [...document.querySelectorAll('input, textarea, select')].filter(e => e.offsetParent).map(e => e.tagName + '#' + e.id + ' ' + (e.placeholder || '')).join(' ; ')));
  await L.photo(p, 'ats-3b');
  const inp = p.locator('input[id*=etier]:visible, input[placeholder*=métier]:visible').first(); await inp.scrollIntoViewIfNeeded(); await inp.click(); await inp.pressSequentially('agent d', { delay: 70 }); await p.waitForTimeout(1300);
  await p.locator('.option-metier-ajout-nom').first().click(); await p.waitForTimeout(900);
  console.log('Continuer actif:', await p.locator('#btnSuivantNavigation').isEnabled(), '|', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  await L.photo(p, 'ats-4');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(2000);
  await S.assistantEtColler(p, require('./ats.js'), 'ats');
  for (let i = 1; i <= 6; i++) {
    const e = await L.etat(p, 'ats écran ' + i); await L.photo(p, 'ats-5-ecran' + i);
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand.isEnabled())) { console.log('  GRISÉ :', (await L.boutons(p)).filter(x => !/aide-option|pastille|jeton/.test(x)).slice(0, 25).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
