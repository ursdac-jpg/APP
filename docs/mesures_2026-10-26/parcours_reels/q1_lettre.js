const L = require('./lib.js'); const LET = require('./lettre.js'); const A = require('./avancer.js'); const S = require('./saisies4.js'); const Sa = require('./saisies.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'preparer', 'btnCarteAccueilLettre', 'tuile Écrire ma lettre avec l’assistant');
  await L.clic(p, '#btnCoLettreCommencer', 'Commencer');
  await S.deposerFichierDepuis(p, 'btnCoLettreDeposerCv');
  await Sa.objectifSpontanee(p, L);
  await L.clicTexte(p, 'En recherche d’emploi', 'situation : en recherche d’emploi'); await p.waitForTimeout(800);
  const e = await L.etat(p, 'après situation');
  console.log('message bouton:', await p.evaluate(() => { const b = document.getElementById('btnCoLettreVersAssistantBarre'); return b ? (b.title || '(aucun message)') : 'absent'; }));
  await L.photo(p, 'lettre-3');
  const btn = p.locator('#btnCoLettreVersAssistantBarre'); console.log('Continuer actif:', await btn.isEnabled());
  if (await btn.isEnabled()) { await btn.click(); await p.waitForTimeout(2500); await L.etat(p, 'Continuer (Préparer -> Assistant)'); await L.photo(p, 'lettre-4'); console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 20).join('\n')); }
  await S.assistantEtColler(p, LET, 'lettre');
  await L.photo(p, 'lettre-5-apres-collage');
  for (let i = 1; i <= 6; i++) {
    const e = await L.etat(p, 'lettre étape ' + i); await L.photo(p, 'lettre-6-etape' + i);
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .barre-navigation button.btn-primary:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand.isEnabled())) { console.log('  GRISÉ. Éléments :', (await L.boutons(p)).filter(x => !/aide-option|pastille|jeton/.test(x)).slice(0, 25).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  await L.clic(p, '#btnEnregistrerIdentite', 'Enregistrer mon identité'); await p.waitForTimeout(2500);
  await L.photo(p, 'lettre-7-apres-identite');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 30).join('\n'));
  await A.finirDocument(p, 'lettre');
  console.log('erreurs:', p.errs);
  await b.close();
})();
