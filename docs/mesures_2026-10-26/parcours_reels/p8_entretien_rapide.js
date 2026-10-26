const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const LET = require('./lettre.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvPret', 'tuile Lettre et entretien rapide');
  await L.clic(p, '#btnPrepLettreEntretienCommencer', 'Déposer mon CV');
  await L.clic(p, '#btnPrepLEDeposerCv', 'Déposer mon fichier'); await p.waitForTimeout(1000);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.locator('#fichierWizardCVBouton').click()]);
  await fc.setFiles(__dirname + '/cv_camille.txt'); await p.waitForTimeout(4000);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (dépôt)'); await p.waitForTimeout(2500);
  const jaune = p.getByText('Retirer tout ce qui est en jaune', { exact: false }).first(); if (await jaune.count()) { await jaune.click(); await p.waitForTimeout(600); }
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (vérification)'); await p.waitForTimeout(3000);
  await L.clicTexte(p, 'Ma fiche de préparation à l’entretien', 'Parcours 2 : entretien'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, require('./extraction.js'), 'rap');
  await A.avancer(p, 'rap', 8);
  await L.photo(p, 'rap-4-documents');
  await L.clic(p, '#btnSuivantNavigation', 'rap documents : Continuer'); await p.waitForTimeout(1200);
  await S.assistantEtColler(p, require('./entretien.js'), 'rap-2e'); 
  console.log('zones:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('textarea')].map(t => t.id + '=' + (t.value || '').slice(0, 50)))), '| alertes:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('.text-danger, .alert-danger, [style*="color:#"]')].filter(e => e.offsetParent).map(e => e.textContent.trim().slice(0, 140)).slice(0, 3))));
  for (let i = 1; i <= 3; i++) {
    const principal = p.locator('.barre-navigation-fixe .barre-navigation button').last();
    const txt = ((await principal.textContent()) || '').trim();
    console.log(`  [rap] bouton principal = « ${txt} »`);
    if (!/Continuer|Valider/.test(txt)) { break; }
    const interne = p.locator('#btnContinuerCollage:visible').first();
    if (await interne.count()) { await interne.click(); } else { await principal.click(); }
    await p.waitForTimeout(2500);
  }
  await L.etat(p, 'fiche prête');
  await L.photo(p, 'rap-6-lettre-validee');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 25).join('\n'));
  await p.getByText('Télécharger le Word', { exact: false }).first().click().catch(e => console.log('  clic Word impossible', String(e).slice(0, 80))); await p.waitForTimeout(2500);
  await L.etat(p, 'rap après export');
  console.log('suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer/.test(x)).join(' ; ') || '(aucune)');
  const fin = p.locator('.barre-navigation-fixe .btn-success');
  if (await fin.count()) { await fin.first().click(); await p.waitForTimeout(1500); const f = await p.evaluate(() => { const x = document.querySelector('.fenetre-erip-overlay.visible'); return x ? x.innerText.replace(/\s+/g, ' ').slice(0, 300) : null; }); await L.etat(p, 'rap après j’ai fini'); console.log('  fenêtre :', f || 'aucune'); } else { console.log('  PAS de bouton j’ai fini'); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
