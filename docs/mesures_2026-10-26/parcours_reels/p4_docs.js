const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const EXT = require('./extraction.js'); const M3 = require('./saisies3.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await S.deposerFichierEtEnregistrer(p);
  await L.clicTexte(p, 'Le garder et le compléter', 'carte Voie 1'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, EXT, 'v1');
  await A.avancer(p, 'v1', 6);
  // 2e passage de l'assistant, dans « Vos documents »
  await L.clic(p, '#btnSuivantNavigation', 'v1 documents : Continuer (ouvre le choix de l’assistant)');
  await S.assistantEtColler(p, M3.REPONSE, 'v1-2e');
  console.log('valeurs des zones de collage:', JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('textarea')].map(t => t.id + '=' + (t.value || '').slice(0, 60)))));
  const ok = await A.jusquAValider(p, 'v1', 8);
  await L.photo(p, 'v1-6-pret-a-valider');
  if (ok) { await A.terminerDocuments(p, 'v1', { sansRetour: true }); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
