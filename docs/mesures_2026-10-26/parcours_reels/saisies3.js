const L = require('./lib.js'); const S = require('./saisies.js');
async function assistantJusquALaPage() {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile Créer');
  await L.clic(p, '#btnCreerCvAvecAssistant', 'carte Avec l’assistant');
  await L.clicTexte(p, 'Commencer mon CV', 'Commencer');
  await S.objectifSpontanee(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (objectif)');
  await S.identite(p, L); await S.experience(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (informations)');
  await S.parcoursQuatreQuestions(p, L);
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (parcours)');
  await L.clic(p, '#btnSuivantNavigation', 'Passer à l’action (profil -> assistant)');
  await p.waitForTimeout(1500);
  return { b, p };
}
module.exports = { assistantJusquALaPage };
const REPONSE = { titresProposes: ['Agent d’entretien des bâtiments'], accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.', 'Agent d’entretien autonome.'], accrochesCourtesProposees: ['Dix ans d’entretien.', 'Entretien et dépannages.'], pointsForts: ['Autonomie'], motsCles: ['entretien'],
  recommandations: { typeCV: { valeur: 'chronologique', justification: 'parcours continu' }, postesRecommandes: [], experiencesAMettreEnAvant: [], competencesAValoriser: [], competencesPersonnelles: [], competencesAttenduesMetier: [], rubriquesMasquables: [] } };
async function collerReponseCv(p, L, assistant) {
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (ouvre le choix de l’assistant)');
  await L.clicTexte(p, assistant || 'Claude', 'clic sur l’assistant');
  await p.waitForTimeout(1200);
  await L.clicTexte(p, 'Je comprends, continuer', 'fenêtre « Avant de continuer » : Je comprends');
  await p.waitForTimeout(3500);
  await L.clic(p, '#btnJeSuisDeRetourIA', 'Je suis de retour'); await p.waitForTimeout(1000);
  await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(REPONSE) + '\n```');
  await L.clic(p, '#btnCollerAutoActionIA', 'Coller la réponse'); await p.waitForTimeout(2000);
}
module.exports.collerReponseCv = collerReponseCv;
async function continuerJusquAuxDocuments(p, L) {
  for (let i = 0; i < 5; i++) {
    const route = await p.evaluate(() => pageActuelle); if (route !== 'assistant') { break; }
    await p.locator('.barre-navigation-fixe .barre-navigation button').last().click(); await p.waitForTimeout(2500);
  }
  await L.etat(p, 'Vos documents (arrivée)');
}
module.exports.continuerJusquAuxDocuments = continuerJusquAuxDocuments;
