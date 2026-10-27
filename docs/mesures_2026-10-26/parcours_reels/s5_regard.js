const L = require('./lib.js'); const S = require('./saisies4.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'analyse', 'btnCarteAccueilRegardRecruteur', 'tuile regard');
  await L.clic(p, '#btnRegardRecruteurCommencer', 'Commencer'); await p.waitForTimeout(1500);
  await L.photo(p, 'rr-2');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 20).join('\n'));
  console.log('inputs fichier:', await p.evaluate(() => [...document.querySelectorAll('input[type=file]')].map(i => i.id + ' accept=' + i.accept)));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(300, 1400));
  await p.locator('input[type=file][accept="image/*"]').setInputFiles(__dirname + '/cv_camille.png'); await p.waitForTimeout(3000);
  await L.etat(p, 'après ajout de l’image'); await L.photo(p, 'rr-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join('\n'));
  console.log('message bouton:', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(700, 1800));
  await L.clicTexte(p, 'Masquer mes images', 'Masquer mes images'); await p.waitForTimeout(2500); await L.photo(p, 'rr-4-outil');
  const cv = p.locator('canvas').first(); const bb = await cv.boundingBox();
  await p.mouse.move(bb.x + bb.width * 0.05, bb.y + bb.height * 0.03); await p.mouse.down(); await p.mouse.move(bb.x + bb.width * 0.6, bb.y + bb.height * 0.12, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(600);
  await L.photo(p, 'rr-5-rectangle');
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer (masque)'); await p.waitForTimeout(1500);
  console.log('bouton images masquées:', await p.evaluate(() => { const b = document.getElementById('rrBtnImagesMasquees'); return b ? (b.disabled ? 'grisé' : 'actif') + ' ' + b.textContent.trim() : 'absent'; }));
  await L.photo(p, 'rr-6');
  const bm = p.locator('#rrBtnImagesMasquees'); if (await bm.isEnabled()) { await bm.click(); await p.waitForTimeout(2000); await L.etat(p, 'images masquées'); await L.photo(p, 'rr-7'); console.log('message bouton:', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title)); console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(900, 1600)); }
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(2000);
  await S.assistantEtColler(p, require('./regard.js'), 'regard');
  for (let i = 1; i <= 6; i++) {
    const e = await L.etat(p, 'regard écran ' + i); await L.photo(p, 'rr-8-ecran' + i);
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand.isEnabled())) { console.log('  GRISÉ :', (await L.boutons(p)).filter(x => !/aide-option|pastille|jeton/.test(x)).slice(0, 25).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  console.log('erreurs:', p.errs);
  console.log('fenêtre/outil:', (await p.evaluate(() => { const f = document.querySelector('.fenetre-erip-overlay.visible, #rrMasqueur, canvas'); return f ? (f.innerText || f.tagName).replace(/\s+/g, ' ').slice(0, 600) : 'rien'; })));
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join('\n'));
  await b.close();
})();
