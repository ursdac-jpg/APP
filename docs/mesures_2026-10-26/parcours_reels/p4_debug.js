const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const EXT = require('./extraction.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await (process.env.DEPOT === 'texte' ? S.deposerEtEnregistrer(p) : S.deposerFichierEtEnregistrer(p));
  await L.clicTexte(p, 'Le garder et le compléter', 'carte Voie 1'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, EXT, 'v1');
  const avant = await p.evaluate(() => ({ cvAnalyse: dossier.cvAnalyse, mode: dossier.modeCreation, nbExp: (dossier.experiences || []).length, objectif: dossier.objectif }));
  console.log('avant Continuer:', JSON.stringify(avant));
  await L.photo(p, 'v1-3-avant-continuer');
  await p.locator('#btnSuivantNavigation:visible, #btnContinuerCollage:visible').first().click(); await p.waitForTimeout(2500);
  await L.etat(p, 'après Continuer');
  console.log('après:', JSON.stringify(await p.evaluate(() => ({ cvAnalyse: dossier.cvAnalyse, mode: dossier.modeCreation, nbExp: (dossier.experiences || []).length, route: pageActuelle }))));
  await L.photo(p, 'v1-4-apres');
  console.log('texte visible:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').slice(0, 500));
  await b.close();
})();
