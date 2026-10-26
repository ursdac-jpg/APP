const L = require('./lib.js'); const S = require('./saisies4.js'); const Sa = require('./saisies.js'); const A = require('./avancer.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'preparer', 'btnCarteAccueilEntretien', 'tuile M’entraîner à un entretien');
  await L.clic(p, '#btnPrepaEntretienCommencer', 'Commencer');
  await S.deposerFichierDepuis(p, 'btnPrepaEntretienDeposerCv');
  await Sa.objectifSpontanee(p, L);
  await L.clicTexte(p, 'En recherche d’emploi', 'situation'); await p.waitForTimeout(800);
  await L.photo(p, 'ent-3');
  const btn = p.locator('#btnSuivantNavigation'); console.log('Continuer actif:', await btn.isEnabled(), '|', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  if (await btn.isEnabled()) { await btn.click(); await p.waitForTimeout(2500); }
  await L.etat(p, 'écran suivant'); await L.photo(p, 'ent-4');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 25).join('\n'));
  await L.clicTexte(p, 'Claude', 'assistant Claude'); await p.waitForTimeout(1200);
  await L.clicTexte(p, 'Je comprends, continuer', 'Je comprends'); await p.waitForTimeout(3500);
  await L.etat(p, 'attente'); await L.photo(p, 'ent-5');
  await L.clic(p, '#btnJeSuisDeRetourIA', 'Je suis de retour'); await p.waitForTimeout(1000);
  await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(require('./entretien.js')) + '\n```');
  await L.clic(p, '#btnCollerAutoEntretien', 'Coller la réponse'); await p.waitForTimeout(2500);
  for (let i = 1; i <= 4; i++) {
    const e = await L.etat(p, 'entretien étape ' + i); await L.photo(p, 'ent-6-etape' + i);
    if (e.route === 'resultats') { break; }
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible').first();
    if (!(await cand.count()) || !(await cand.isEnabled())) { console.log('  BLOQUÉ :', (await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 20).join(' ; ')); break; }
    await cand.click(); await p.waitForTimeout(2500);
  }
  await A.finirDocument(p, 'entretien');
  console.log('erreurs:', p.errs);
  await b.close();
})();
