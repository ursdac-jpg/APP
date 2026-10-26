const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const EXT = require('./extraction.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await (process.env.DEPOT === 'texte' ? S.deposerEtEnregistrer(p) : S.deposerFichierEtEnregistrer(p));
  await L.clicTexte(p, 'Le garder et le compléter', 'carte Voie 1'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, EXT, 'v1');
  await A.avancer(p, 'v1', 12);
  await A.terminerDocuments(p, 'v1');
  console.log('erreurs:', p.errs);
  await b.close();
})();
