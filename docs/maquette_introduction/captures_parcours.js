/* Captures réelles d'un parcours « Créer un CV à la main » avec un personnage fictif (Camille Martin), pour l'Introduction (01/11/2026).
   Réutilise les outils de docs/mesures_2026-10-26/parcours_reels (vrais clics). Ne modifie que le dossier du navigateur de test.
   Usage : URL_APP=http://localhost:8124 CONTROLES=0 VIEWPORT=1000x720 node captures_parcours.js */
const path = require('path');
process.env.CAPTURES = process.env.CAPTURES || __dirname;
const R = path.join(__dirname, '..', 'mesures_2026-10-26', 'parcours_reels');
const L = require(path.join(R, 'lib.js')); const S = require(path.join(R, 'saisies.js'));
(async () => {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile Créer');
  await p.setViewportSize({ width: 1000, height: 1100 }); await p.waitForTimeout(500); await L.photo(p, 'i_cv_1_choix'); await p.setViewportSize({ width: 1000, height: 720 }); await p.waitForTimeout(300);
  await L.clic(p, '#btnCreerCvSansAssistant', 'carte À la main');
  await L.clicTexte(p, 'Commencer mon CV', 'Commencer');
  await S.objectifSpontanee(p, L);
  await L.photo(p, 'i_cv_2_objectif');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (objectif)');
  await S.identite(p, L); await S.experience(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (informations)');
  await S.parcoursQuatreQuestions(p, L);
  await L.photo(p, 'i_cv_3_parcours');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (parcours)');
  await L.photo(p, 'i_cv_4_profil');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (profil -> documents)');
  await p.waitForTimeout(3500);
  console.log((await L.boutons(p)).slice(0, 40).join('\n'));
  console.log('erreurs page:', p.errs);
  await b.close();
})();
