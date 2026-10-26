const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const Sa = require('./saisies.js'); const REF = require('./reformule.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await (process.env.DEPOT === 'texte' ? S.deposerEtEnregistrer(p) : S.deposerFichierEtEnregistrer(p));
  await L.clicTexte(p, 'Le reformuler et le présenter', 'carte Voie 2'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, REF, 'v2');
  await A.avancer(p, 'v2', 6);
  await L.clicTexte(p, 'Choisir celle-ci', 'v2 Choisir la 1re version'); await p.waitForTimeout(2000);
  await L.photo(p, 'v2-3-apres-choix');
  await L.clic(p, '#btnSuivantNavigation', 'v2 C’est bon, passer à la mise en forme'); await p.waitForTimeout(2500);
  await L.photo(p, 'v2-4-sorties');
  await L.clic(p, '#btnReformulerVersModele', 'v2 Continuer (vers le modèle)'); await p.waitForTimeout(2500);
  await A.avancer(p, 'v2b', 6);
  await L.photo(p, 'v2-5a-documents-arrivee');
  await L.clic(p, '#btnSuivantNavigation', 'v2 documents : Continuer'); await p.waitForTimeout(1500);
  await L.photo(p, 'v2-5b-apres-continuer');
  console.log((await L.boutons(p)).filter(x => !/aide-option|jeton|pastille/.test(x)).slice(0, 20).join('\n'));
  await S.assistantEtColler(p, require('./saisies3.js').REPONSE, 'v2-2e');
  const ok = await A.jusquAValider(p, 'v2', 8);
  await L.photo(p, 'v2-5-documents');
  if (ok) { await A.terminerDocuments(p, 'v2', { sansRetour: false }); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
