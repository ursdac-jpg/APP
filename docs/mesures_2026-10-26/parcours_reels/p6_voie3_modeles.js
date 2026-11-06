// Voies 1 et 3 de « Reprendre mon CV » avec « Voir nos modèles » (maquette 3, 2026-10-27) : VOIE=3 (défaut) ou VOIE=1.
const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const EXT = require('./extraction.js'); const M3 = require('./saisies3.js');
(async () => {
  const voie = process.env.VOIE || '3';
  const { b, p } = await L.ouvrir(); const out = {};
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvReprendre', 'tuile Reprendre mon CV');
  await L.clic(p, '#btnReprendreCvCommencer', 'Déposer mon CV'); await p.waitForTimeout(1500);
  out.invitation = await p.evaluate(() => !!document.getElementById('mgInvitation'));
  out.voiesBloquees = await p.evaluate(() => document.querySelectorAll('[data-reprendre-voie][aria-disabled="true"]').length);
  await L.photo(p, 'v' + voie + 'm-depot-avant');
  await L.clic(p, '#btnMgVoirModeles', 'Regarder nos modèles'); await p.waitForTimeout(7000);
  await L.clic(p, '#btnMgGarder', 'Garder ce modèle'); await p.waitForTimeout(2500);
  await L.clic(p, '#btnSuivantNavigation', 'J’ai fini de regarder'); await p.waitForTimeout(2500);
  out.retour = await p.evaluate(() => pageActuelle + ' | ' + (document.querySelector('h1') || {}).textContent);
  out.invitationApres = await p.evaluate(() => (document.getElementById('mgInvitation') || {}).innerText);
  await L.photo(p, 'v' + voie + 'm-depot-apres');
  await L.clic(p, '#btnPrepLEDeposerCv', 'Déposer mon fichier'); await p.waitForTimeout(1000);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.locator('#fichierWizardCVBouton').click()]);
  await fc.setFiles(__dirname + '/cv_camille.txt'); await p.waitForTimeout(4000);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (dépôt du fichier)'); await p.waitForTimeout(2500);
  const jaune = p.getByText('Retirer tout ce qui est en jaune', { exact: false }).first(); if (await jaune.count()) { await jaune.click(); await p.waitForTimeout(600); }
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (vérification)'); await p.waitForTimeout(3000);
  out.invitationApresDepot = await p.evaluate(() => !!document.getElementById('mgInvitation') && /sur 5/.test(document.getElementById('mgInvitation').innerText));
  if (voie === '3') {
    await L.clicTexte(p, 'Le refaire moi-même', 'carte Voie 3'); await p.waitForTimeout(1500);
    await A.avancer(p, 'v3', 8);
  } else {
    await L.clicTexte(p, 'Le garder et le compléter', 'carte Voie 1'); await p.waitForTimeout(1500);
    await Sa.objectifSpontanee(p, L);
    await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
    await S.assistantEtColler(p, EXT, 'v1');
    await A.avancer(p, 'v1', 6);
    await L.clic(p, '#btnSuivantNavigation', 'documents : Continuer'); await p.waitForTimeout(1500);
    await S.assistantEtColler(p, M3.REPONSE, 'v1-2e'); await p.waitForTimeout(1500);
    if (await p.locator('#btnContinuerCollage:visible').count()) { await p.locator('#btnContinuerCollage:visible').first().click(); } else { await p.locator('.barre-navigation-fixe .barre-navigation button').last().click(); }
    await p.waitForTimeout(8000);
  }
  await p.waitForTimeout(5000);
  out.route = await p.evaluate(() => pageActuelle);
  out.mesModeles = await p.evaluate(() => { const e = document.getElementById('blocMgMesModeles'); return e ? e.innerText.slice(0, 160) : null; });
  out.actif = await p.evaluate(() => dossier.modeleGardeActifId);
  out.boutons = (await L.boutons(p)).filter(x => /Garder celui|Valider|Remodeler/.test(x)).join(' ; ');
  await L.photo(p, 'v' + voie + 'm-documents');
  console.log(JSON.stringify(out, null, 1)); console.log('erreurs:', p.errs);
  await b.close();
})();
