// Reformuler, VERSION 1 (« La plus proche de votre CV ») : plus de deuxième passage chez l'assistant (maquette 4, 27/10/2026).
// Contrôle : après « Votre profil », « Continuer » arrive directement sur la mise en page, en mode fidèle, sans « Choisissez votre assistant ».
const R = './';
const L = require(R + 'lib.js'); const S = require(R + 'saisies4.js'); const A = require(R + 'avancer.js'); const Sa = require(R + 'saisies.js'); const REF = require(R + 'reformule.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await S.deposerFichierEtEnregistrer(p);
  await L.clicTexte(p, 'Le reformuler et le présenter', 'carte Voie 2'); await p.waitForTimeout(1500);
  await Sa.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (Préparer)'); await p.waitForTimeout(1500);
  await S.assistantEtColler(p, REF, 'v1');
  await A.avancer(p, 'v1', 6);
  const version = process.env.VERSION === '2' ? 1 : 0;
  await p.getByText('Choisir celle-ci', { exact: false }).nth(version).click(); await p.waitForTimeout(2000);
  await L.clic(p, '#btnSuivantNavigation', 'passer à la mise en forme'); await p.waitForTimeout(2500);
  await L.clic(p, '#btnSuivantNavigation', 'Récupérer votre CV : Continuer'); await p.waitForTimeout(2500);
  const e = await A.avancer(p, 'v1b', 8);
  await p.waitForTimeout(4000);
  const out = {};
  out.route = await p.evaluate(() => pageActuelle);
  out.drapeaux = await p.evaluate(() => JSON.stringify({ fidele: dossier.modeFidele, sansSecondePasse: dossier._reformulerSansSecondePasse, origine: dossier._origineReformuler, missionsGlobal: (dossier.pdfReglages || {}).missionsGlobal }));
  out.assistantVisible = await p.evaluate(() => !!document.querySelector('#choix-ia, [id*="choix-ia"], #btnChoixAssistant') || /Choisissez votre assistant/.test(document.body.innerText));
  out.adaptationVisible = await p.evaluate(() => /Adaptation au métier/.test(document.body.innerText));
  out.miseEnPageVisible = await p.evaluate(() => /mise en page|Mes modèles|Garder celui-ci/i.test(document.body.innerText));
  out.titres = await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].filter(e => e.offsetParent !== null).map(e => e.textContent.trim()).slice(0, 12));
  out.objetCV = await p.evaluate(() => { const o = normaliserDonneesCV(dossier); const r = {}; Object.keys(o).forEach(k => { const v = o[k]; r[k] = Array.isArray(v) ? v.length + ' élément(s)' : (v && typeof v === 'object' ? Object.keys(v).filter(x => v[x] && (!Array.isArray(v[x]) || v[x].length)).join(',') : String(v === undefined || v === null ? '' : v).slice(0, 70)); }); return r; });
  out.experiences = await p.evaluate(() => (dossier.experiences || []).map(e => e.poste + ' | ' + e.entreprise + ' | ' + e.dateDebut + '-' + e.dateFin + ' | missions: ' + String(e.missions || '').split('\n').filter(Boolean).length));
  out.listes = await p.evaluate(() => JSON.stringify({ titre: dossier.titreCV, accroche: (dossier.ia && dossier.ia.cv && dossier.ia.cv.profil) || '', competencesCV: dossier.competencesCV, savoirEtreCV: dossier.savoirEtreCV, savoirsCV: dossier.savoirsCV, formations: (dossier.formations || []).length, langues: dossier.langues, loisirs: dossier.loisirs, certifications: dossier.certifications, logiciels: dossier.logiciels, permis: dossier.permis, infos: dossier.informationsNonClassees }));
  await L.photo(p, 'v1-documents');
  console.log('dernier écran:', JSON.stringify(e && e.route));
  console.log(JSON.stringify(out, null, 1)); console.log('erreurs:', p.errs);
  await b.close();
})();
