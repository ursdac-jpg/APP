const L = require('./lib.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvReprendre', 'tuile Reprendre mon CV');
  await L.clic(p, '#btnReprendreCvCommencer', 'Déposer mon CV');
  await L.clic(p, '#btnPrepLEDeposerCv', 'Déposer mon fichier'); await p.waitForTimeout(1000);
  console.log('inputs fichier:', await p.evaluate(() => [...document.querySelectorAll('input[type=file]')].map(i => i.id + ' accept=' + i.accept)));
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.locator('#fichierWizardCVBouton').click()]);
  await fc.setFiles('/tmp/claude-0/-home-user-APP/642c3445-eb3e-5259-ba86-29201aa22f54/scratchpad/outils/cv_camille.txt'); await p.waitForTimeout(6000);
  console.log('erreurs page:', p.errs, '| zone:', await p.evaluate(() => { const z = document.querySelector('#zoneAnalyseWizardCV, [id*=nalyse]'); return z ? z.innerText.slice(0, 200) : 'pas de zone'; }));
  await L.etat(p, 'après choix du fichier'); await L.photo(p, 'repr-fichier-1');
  console.log((await L.boutons(p)).filter(x => /btn|textarea/.test(x) && !/aide-option/.test(x)).slice(0, 14).join('\n'));
  console.log('dossier:', JSON.stringify(await p.evaluate(() => ({ cvAnalyse: dossier.cvAnalyse, longueurTexte: (dossier.cvTexte || '').length }))));
  await b.close();
})();
