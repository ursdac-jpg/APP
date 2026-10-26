const L = require('./lib.js'); const S = require('./saisies4.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'analyse', 'btnCarteAccueilCoherence', 'tuile cohérence');
  await L.clic(p, '#ctBoutonJeCommence', 'Je commence'); await p.waitForTimeout(1500);
  await S.deposerFichierDepuis(p, 'btnCtCollecteDeposerCv');
  await L.etat(p, 'CV déposé'); await L.photo(p, 'coh-3');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 18).join('\n'));
  await S.deposerFichierDepuis(p, 'btnCtCollecteDeposerLettre', 'lettre_deposee.txt');
  await L.etat(p, 'lettre déposée'); await L.photo(p, 'coh-4');
  await L.clic(p, '#btnCtCollecteSansEntretien', 'Je n’ai pas d’entretien'); await p.waitForTimeout(800);
  console.log('Continuer actif:', await p.locator('#btnSuivantNavigation').isEnabled(), '|', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (documents)'); await p.waitForTimeout(2000);
  await S.assistantEtColler(p, require('./coherence.js'), 'coh');
  for (let i = 1; i <= 6; i++) {
    const e = await L.etat(p, 'coh écran ' + i); await L.photo(p, 'coh-5-ecran' + i);
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand.isEnabled())) { console.log('  GRISÉ :', (await L.boutons(p)).filter(x => !/aide-option|pastille|jeton/.test(x)).slice(0, 25).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  await p.waitForTimeout(2000);
  await L.clic(p, '#ctBoutonEntretienAvance', 'Aller plus loin : mon entretien'); await p.waitForTimeout(2500); await L.photo(p, 'coh-7');
  console.log('boutons:', (await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join(' ; '));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(300, 1100));
  await p.fill('#ctReponseEntretien0', 'Parce que je cherche un poste stable près de chez moi.'); await p.fill('#ctReponseEntretien1', 'Je préviens mon responsable et je note la référence.');
  await L.clic(p, '#btnValiderEntretienAvance', 'Valider (entretien avancé)'); await p.waitForTimeout(2500); await L.photo(p, 'coh-8');
  console.log('boutons:', (await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 22).join(' ; '));
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(250, 900));
  await S.assistantEtColler(p, { synthese: 'Entretien globalement réussi.', pointsForts: ['Réponses claires'], axesAmelioration: ['Développer un exemple'], recommandations: ['Préparer un exemple chiffré.'], parQuestion: [{ question: 'Pourquoi ce poste ?', resumeReponse: 'Poste stable près de chez moi.', attentesEmployeur: 'Vérifier la motivation.' }, { question: 'Que faites-vous en cas de produit manquant ?', resumeReponse: 'Je préviens mon responsable.', attentesEmployeur: 'Vérifier l’autonomie.' }] }, 'coh-ent');
  for (let i = 1; i <= 4; i++) {
    const e = await L.etat(p, 'coh-ent écran ' + i); await L.photo(p, 'coh-9-ecran' + i);
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .btn-success:visible').first();
    if (!(await cand.count()) || !(await cand.isEnabled())) { console.log('  fin de chaîne. boutons :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 14).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  await L.photo(p, 'coh-6-rapport-apres-6s');
  console.log('titres des boutons grisés:', JSON.stringify(await p.evaluate(() => ['ctBoutonVoirLettre', 'ctBoutonRelancerAnalyse'].map(id => { const b = document.getElementById(id); return b ? { id, disabled: b.disabled, title: b.title, aria: b.getAttribute('aria-label'), explication: (b.parentElement.innerText || '').replace(/\\s+/g, ' ').slice(0, 160) } : { id, absent: true }; }))));
  console.log('états après 6 s:', (await L.boutons(p)).filter(x => /ctBouton|Résumé|Relancer|Voir\/imprimer/.test(x)).join(' ; '));
  console.log('erreurs:', p.errs);
  await b.close();
})();
