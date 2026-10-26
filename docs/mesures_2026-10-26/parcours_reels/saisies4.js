const L = require('./lib.js'); const CV = require('./cvtexte.js');
async function deposerCv(p) {
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvReprendre', 'tuile Reprendre mon CV');
  await L.clic(p, '#btnReprendreCvCommencer', 'Déposer mon CV');
  await L.clic(p, '#btnPrepLEDeposerCv', 'Déposer mon fichier'); await p.waitForTimeout(1000);
  await L.clic(p, '#btnAfficherCollageTexteWizard', 'Coller le texte directement'); await p.waitForTimeout(800);
}
module.exports = { deposerCv, CV };
async function deposerEtEnregistrer(p) {
  await deposerCv(p);
  await p.locator('#texteCollageWizardCV').fill(CV); await p.waitForTimeout(600);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (dépôt du texte)'); await p.waitForTimeout(2500);
  await L.clicTexte(p, 'Retirer tout ce qui est en jaune', 'Retirer tout ce qui est en jaune'); await p.waitForTimeout(600);
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (vérification)'); await p.waitForTimeout(3000);
}
module.exports.deposerEtEnregistrer = deposerEtEnregistrer;
async function assistantEtColler(p, contenu, prefixe) {
  await L.clicTexte(p, 'Claude', prefixe + ' assistant Claude'); await p.waitForTimeout(1200);
  await L.clicTexte(p, 'Je comprends, continuer', prefixe + ' Je comprends'); await p.waitForTimeout(3500);
  await L.clic(p, '#btnJeSuisDeRetourIA', prefixe + ' Je suis de retour'); await p.waitForTimeout(1000);
  await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(contenu) + '\n```');
  await L.clic(p, '[id^="btnCollerAuto"]:visible', prefixe + ' Coller la réponse'); await p.waitForTimeout(2500);
}
module.exports.assistantEtColler = assistantEtColler;
async function deposerFichierEtEnregistrer(p) {
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvReprendre', 'tuile Reprendre mon CV');
  await L.clic(p, '#btnReprendreCvCommencer', 'Déposer mon CV');
  await L.clic(p, '#btnPrepLEDeposerCv', 'Déposer mon fichier'); await p.waitForTimeout(1000);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.locator('#fichierWizardCVBouton').click()]);
  await fc.setFiles(__dirname + '/cv_camille.txt'); await p.waitForTimeout(4000);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (dépôt du fichier)'); await p.waitForTimeout(2500);
  const jaune = p.getByText('Retirer tout ce qui est en jaune', { exact: false }).first(); if (await jaune.count()) { await jaune.click(); await p.waitForTimeout(600); }
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (vérification)'); await p.waitForTimeout(3000);
}
module.exports.deposerFichierEtEnregistrer = deposerFichierEtEnregistrer;
// Depose le CV par la fenetre commune (vrai choix de fichier) depuis le bouton d'un module quelconque
async function deposerFichierDepuis(p, btnId, fichier) {
  await L.clic(p, '#' + btnId, 'Déposer mon fichier (' + btnId + ')'); await p.waitForTimeout(1000);
  const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.locator('#fichierWizardCVBouton').click()]);
  await fc.setFiles(__dirname + '/' + (fichier || 'cv_camille.txt')); await p.waitForTimeout(4000);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (dépôt du fichier)'); await p.waitForTimeout(2500);
  const jaune = p.getByText('Retirer tout ce qui est en jaune', { exact: false }).first(); if (await jaune.count()) { await jaune.click(); await p.waitForTimeout(600); }
  await L.clic(p, '#verifDocBtnEnregistrer', 'Enregistrer'); await p.waitForTimeout(1200);
  await L.clic(p, '#btnContinuerWizard', 'Continuer (vérification)'); await p.waitForTimeout(3000);
}
module.exports.deposerFichierDepuis = deposerFichierDepuis;
