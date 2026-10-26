const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await S.deposerEtEnregistrer(p);
  await L.clicTexte(p, 'Le refaire moi-même', 'carte Voie 3'); await p.waitForTimeout(1500);
  await A.avancer(p, 'v3', 8);
  await A.terminerDocuments(p, 'v3');
  console.log('erreurs:', p.errs);
  await b.close();
})();
