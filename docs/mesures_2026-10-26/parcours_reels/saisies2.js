const L = require('./lib.js'); const S = require('./saisies.js');
// Va jusqu'a "Vos documents" a la main (chemin direct, vrais clics)
async function mainJusquAuxDocuments() {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile Créer');
  await L.clic(p, '#btnCreerCvSansAssistant', 'carte À la main');
  await L.clicTexte(p, 'Commencer mon CV', 'Commencer');
  await S.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (objectif)');
  await S.identite(p, L); await S.experience(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (informations)');
  await S.parcoursQuatreQuestions(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (parcours)');
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (profil -> documents)');
  await p.waitForTimeout(2500);
  return { b, p };
}
module.exports = { mainJusquAuxDocuments };
