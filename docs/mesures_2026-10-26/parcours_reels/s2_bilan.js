const L = require('./lib.js'); const S = require('./saisies4.js'); const Sa = require('./saisies.js'); const A = require('./avancer.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'analyse', 'btnCarteAccueilBilan', 'tuile Analyser ma candidature');
  await L.clic(p, '#btnBilanIntroCommencer', 'Commencer'); await p.waitForTimeout(1500);
  await S.deposerFichierDepuis(p, 'btnPreparerDeposerCv');
  await L.photo(p, 'bil-3-apres-depot');
  const e = await L.etat(p, 'après dépôt');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|carte-objectif/.test(x)).slice(0, 20).join('\n'));
  console.log('message bouton:', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(300, 1100));
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(2000); await L.photo(p, 'bil-4');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|carte-objectif/.test(x)).slice(0, 24).join('\n'));
  await S.assistantEtColler(p, require('./bilan.js'), 'bilan');
  await p.locator('#btnContinuerCollage').click(); await p.waitForTimeout(2500);
  await L.etat(p, 'bilan rapport'); 
  await L.clicTexte(p, 'Organiser mon CV', 'Organiser mon CV'); await p.waitForTimeout(2500);
  await L.photo(p, 'bil-7');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 14).join('\n'));
  await S.assistantEtColler(p, require('./extraction.js'), 'bilan-2');
  await A.avancer(p, 'bilan-fin', 4);
  // Traiter les recommandations une par une (vraie fin du parcours)
  for (let t = 0; t < 6; t++) {
    const b1 = p.getByRole('button', { name: /J’en ai déjà pris connaissance/ }).first();
    if (!(await b1.count())) { break; }
    await b1.click().catch(() => {}); await p.waitForTimeout(1200);
  }
  await L.etat(p, 'bilan après traitement des recommandations'); await L.photo(p, 'bil-9');
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(500); await L.photo(p, 'bil-9-bas');
  const ch = p.getByRole('button', { name: 'Choisir', exact: true }).first(); if (await ch.count()) { await ch.click(); await p.waitForTimeout(1500); await L.etat(p, 'bilan après Choisir'); await L.photo(p, 'bil-10'); await p.locator('button.btn', { hasText: /^Corriger$/ }).first().click(); await p.waitForTimeout(2000); await L.etat(p, 'après bouton Corriger'); await L.photo(p, 'bil-12');
await p.fill('#xMissions', 'Nettoyage de bureaux, 12 locaux par jour. Gestion des produits et du matériel.'); await p.waitForTimeout(400);
  await L.clic(p, '#btnExpProValider', 'Valider ces modifications'); await p.waitForTimeout(1800); await L.photo(p, 'bil-13');
  for (let q = 1; q <= 4; q++) {
    const c = p.locator('#btnSuivantNavigation:visible, #btnContinuerCollage:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await c.count()) || !(await c.isEnabled())) { console.log('  fin de chaîne :', (await c.count()) ? 'grisé' : 'absent'); break; }
    console.log('  clic sur « ' + (await c.textContent()).trim() + ' »'); await c.click(); await p.waitForTimeout(2500); await L.etat(p, 'bilan suite ' + q); await L.photo(p, 'bil-14-' + q);
    console.log('   boutons:', (await L.boutons(p)).filter(x => !/aide-option|jeton|pastille|Garder|prise|d’accord/.test(x)).slice(0, 14).join(' ; '));
  }
  console.log('boutons:', (await L.boutons(p)).filter(x => !/aide-option|jeton|pastille|Garder|prise|d’accord/.test(x)).slice(0, 20).join(' ; ')); }
  console.log('tous les boutons visibles:', (await p.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.textContent.trim().replace(/\s+/g, ' ').slice(0, 45)))).join(' ; '));
  await L.photo(p, 'bil-8-fin');
  console.log('erreurs:', p.errs);
  await b.close();
})();
