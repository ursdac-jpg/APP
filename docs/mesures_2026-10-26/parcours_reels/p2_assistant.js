const L = require('./lib.js'); const M = require('./saisies3.js');
const REPONSE = { titresProposes: ['Agent d’entretien des bâtiments'], accrochesProposees: ['Dix ans d’entretien de bâtiments collectifs.', 'Agent d’entretien autonome.'], accrochesCourtesProposees: ['Dix ans d’entretien.', 'Entretien et dépannages.'], pointsForts: ['Autonomie'], motsCles: ['entretien'],
  recommandations: { typeCV: { valeur: 'chronologique', justification: 'parcours continu' }, postesRecommandes: [], experiencesAMettreEnAvant: [], competencesAValoriser: [], competencesPersonnelles: [], competencesAttenduesMetier: [], rubriquesMasquables: [] } };
(async () => {
  const { b, p } = await M.assistantJusquALaPage();
  await L.clic(p, '#btnSuivantNavigation', 'Continuer (ouvre le choix de l’assistant)');
  await L.clicTexte(p, 'Claude', 'clic sur l’assistant Claude');
  await p.waitForTimeout(1500); await L.photo(p, 'assist-3-apres-choix');
  await L.clicTexte(p, 'Je comprends, continuer', 'fenêtre « Avant de continuer vers Claude » : Je comprends');
  await p.waitForTimeout(5000); await L.etat(p, 'après « Je comprends » (attente 5 s)'); await L.photo(p, 'assist-3b-apres-comprends');
  console.log('onglets simulés ouverts:', await p.evaluate(() => window.__ouvertures), '| dialogues:', p.log.filter(l => /DIALOG/.test(l)));
  console.log('boutons:', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|jeton|pastille/.test(x)).slice(0, 14).join(' ; '));
  await L.clic(p, '#btnJeSuisDeRetourIA', 'Je suis de retour'); await p.waitForTimeout(1200);
  await L.photo(p, 'assist-3c-retour');
  await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(REPONSE) + '\n```');
  await L.clic(p, '#btnCollerAutoActionIA', 'Coller la réponse (presse-papiers réel)'); await p.waitForTimeout(2500);
  await L.etat(p, 'après collage'); await L.photo(p, 'assist-4-apres-collage');
  console.log('texte:', (await p.evaluate(() => document.body.innerText)).replace(/\s+/g, ' ').match(/(Relire|Vos propositions|accroche|Choisissez votre accroche)[^.]{0,120}/i));
  console.log('boutons:', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|jeton|pastille/.test(x)).slice(0, 25).join(' ; '));
  console.log('erreurs:', p.errs);
  await b.close();
})();
