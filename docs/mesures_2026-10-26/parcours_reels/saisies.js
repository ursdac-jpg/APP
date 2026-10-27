// Saisies reelles communes (vrais clics et vraie frappe)
async function objectifSpontanee(p, L) {
  await L.clicTexte(p, 'Candidature spontanée', 'objectif : candidature spontanée');
  await L.clicTexte(p, 'Un métier précis', 'un métier précis');
  const inp = p.locator('#rechercheMetierCibleInput'); await inp.scrollIntoViewIfNeeded(); await inp.click(); await inp.pressSequentially('agent d', { delay: 70 }); await p.waitForTimeout(1300);
  await p.locator('.option-metier-ajout-nom').first().click(); await p.waitForTimeout(900);
  await L.clicTexte(p, 'Je me présente de façon générale', 'présentation générale');
}
module.exports = { objectifSpontanee };
async function identite(p, L) {
  await p.fill('#identitePrenom', 'Camille'); await p.fill('#identiteNom', 'Martin'); await p.fill('#identiteTelephone', '0612345678');
  await p.fill('#identiteEmail', 'camille.martin@exemple.fr'); await p.fill('#identiteCodePostal', '87000'); await p.fill('#identiteVille', 'Limoges');
  await p.waitForTimeout(500);
  await L.clic(p, '#btnEnregistrerIdentite', 'Enregistrer mon identité');
}
module.exports.identite = identite;
async function experience(p, L) {
  await L.clic(p, '#btnExpProOuvrir', 'Ajouter une expérience (ouvre le formulaire)');
  await p.fill('#xPoste', 'Agent d’entretien'); await p.fill('#xEntreprise', 'Clean Limousin'); await p.fill('#xDebut', '2019'); await p.fill('#xFin', '2023');
  await p.fill('#xMissions', 'Nettoyage de bureaux, 12 locaux par jour, gestion des produits.');
  await p.waitForTimeout(500);
  await L.clic(p, '#btnExpProValider', 'Ajouter cette expérience (valider)');
}
module.exports.experience = experience;
async function parcoursQuatreQuestions(p, L) {
  const champs = ['activites', 'actions', 'environnement', 'valeurs'];
  for (const champ of champs) {
    const carte = p.locator('.vp-carte[data-vp-champ="' + champ + '"]').first();
    await carte.scrollIntoViewIfNeeded().catch(() => {});
    await carte.click({ timeout: 4000 }).catch(e => console.log('  !! carte', champ, String(e).slice(0, 80)));
    await p.waitForTimeout(700);
  }
}
module.exports.parcoursQuatreQuestions = parcoursQuatreQuestions;
