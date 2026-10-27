// Atteint la page « Vos documents » (éditeur de CV) par de vrais clics : créer un CV à la main. Réutilisé par les mesures du Lot 8.
const L = require('../parcours_reels/lib.js'); const S = require('../parcours_reels/saisies.js');
async function vers() {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile Créer');
  await L.clic(p, '#btnCreerCvSansAssistant', 'carte À la main');
  await L.clicTexte(p, 'Commencer mon CV', 'Commencer');
  await S.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'objectif');
  await S.identite(p, L); await S.experience(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'informations');
  await S.parcoursQuatreQuestions(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'parcours');
  await L.clic(p, '#btnSuivantNavigation', 'profil');
  await p.waitForTimeout(4000);
  return { b, p };
}
module.exports = { vers };
