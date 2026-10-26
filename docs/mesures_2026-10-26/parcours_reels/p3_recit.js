const L = require('./lib.js');
const ANALYSE = { reciteNettoye: 'J’ai travaillé quatre ans comme agent d’entretien dans des bureaux à Limoges.', fragments: [{ texteBrut: 'J’ai travaillé quatre ans comme agent d’entretien dans des bureaux', origine: 'professionnel', propositions: ['Entretenir des bureaux au quotidien', 'Gérer les produits et le matériel'], competencesProposees: [{ texte: 'Nettoyage de locaux professionnels', categorie: 'savoirFaire', preuve: ['agent d’entretien'] }] }], questionsCiblees: [{ texte: 'En quelle année avez-vous commencé ?', fragmentIndex: 0, type: 'date' }] };
const REPONSE_CV = { titresProposes: ['Agent d’entretien'], accrochesProposees: ['Quatre ans d’entretien de bureaux.', 'Agent d’entretien rigoureux.'], accrochesCourtesProposees: ['Quatre ans d’entretien.'], pointsForts: ['Rigueur'], motsCles: ['entretien'], recommandations: { typeCV: { valeur: 'chronologique', justification: 'parcours continu' }, postesRecommandes: [], experiencesAMettreEnAvant: [], competencesAValoriser: [], competencesPersonnelles: [], competencesAttenduesMetier: [], rubriquesMasquables: [] } };
let passeColle = 1;
(async () => {
  const { b, p } = await L.ouvrir();
  await L.clicTexte(p, 'Mes documents', 'carte');
  await L.clic(p, '#btnCarteAccueilCvNouveau', 'tuile Créer');
  await L.clic(p, '#btnCreerCvRecit', 'carte À partir de mon récit');
  await L.clic(p, '#btnDecouverteCommencer', 'Raconter mon parcours');
  await p.fill('#decouverteRecitTexte', 'J’ai travaillé quatre ans comme agent d’entretien dans des bureaux à Limoges. Je nettoyais douze locaux par jour et je gérais les produits.');
  await L.clicTexte(p, 'Madame', 'civilité'); await L.clicTexte(p, 'Candidature spontanée', 'objectif');
  await L.photo(p, 'recit-2b');
  await L.clic(p, '#btnContinuerDecouverte', 'Continuer (récit)'); await p.waitForTimeout(1500);
  await L.clicTexte(p, 'Claude', 'assistant Claude'); await p.waitForTimeout(1200);
  await L.clicTexte(p, 'Je comprends, continuer', 'Je comprends'); await p.waitForTimeout(3500);
  await L.etat(p, 'chez l’assistant');
  console.log((await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille/.test(x)).slice(0, 14).join(' ; '));
  await L.clic(p, '#btnJeSuisDeRetourIA', 'Je suis de retour'); await p.waitForTimeout(1000);
  await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(ANALYSE) + '\n```');
  await L.clic(p, '#btnCollerAutoDecouverte', 'Coller la réponse'); await p.waitForTimeout(2500);
  await L.photo(p, 'recit-4-collage');
  for (let i = 1; i <= 14; i++) {
    const e = await L.etat(p, 'étape ' + i); await L.photo(p, 'recit-6-etape' + i);
    if (e.route !== 'decouverte') { break; }
    // actions propres à chaque écran
    if (/Découverte de vos compétences/.test(e.h1)) {
      await p.getByText('Nettoyage de locaux professionnels', { exact: true }).first().click().catch(() => {}); await p.waitForTimeout(500);
      await p.locator('.btn-valider-fragment').first().click().catch(() => {}); await p.waitForTimeout(800);
      const d = p.locator('#reponseCibleeDebut_0'); if (await d.count()) { await d.selectOption('2019').catch(() => {}); }
      const f = p.locator('#reponseCibleeFin_0'); if (await f.count()) { await f.selectOption('2023').catch(() => {}); }
      await p.waitForTimeout(600);
    }
    if (/Vos informations/.test(e.h1)) {
      for (const [id, v] of [['identitePrenom','Camille'],['identiteNom','Martin'],['identiteTelephone','0612345678'],['identiteEmail','camille.martin@exemple.fr'],['identiteCodePostal','87000'],['identiteVille','Limoges']]) { const c = p.locator('#' + id); if (await c.count() && await c.isVisible()) { await c.fill(v); } else { console.log('  champ absent sur cet écran :', id); } }
      await p.waitForTimeout(600); const en = p.locator('#btnEnregistrerIdentite'); if (await en.count() && await en.isEnabled()) { await en.click(); await p.waitForTimeout(800); }
    }
    if (i > 3 && /Choisissez votre assistant/.test(e.h1)) {
      await L.clicTexte(p, 'Claude', 'assistant Claude (2e passage)'); await p.waitForTimeout(1200);
      await L.clicTexte(p, 'Je comprends, continuer', 'Je comprends (2e passage)'); await p.waitForTimeout(3500); continue;
    }
    if (i > 3 && /Collez la réponse/.test(e.h1)) {
      await L.clic(p, '#btnJeSuisDeRetourIA', 'Je suis de retour (2e passage)'); await p.waitForTimeout(1000);
      await p.evaluate(txt => navigator.clipboard.writeText(txt), '```json\n' + JSON.stringify(REPONSE_CV) + '\n```');
      await L.clic(p, '#btnCollerAutoActionIA, #btnCollerAutoDecouverte', 'Coller la réponse (2e passage)'); await p.waitForTimeout(2500);
    }
    const cand = p.locator('#btnContinuerDecouverte:visible, #btnSuivantNavigation:visible, #btnContinuerCollage:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON CONTINUER, éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 25).join(' ; ')); break; }
    if (!(await cand.isEnabled())) { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(500); await L.photo(p, 'recit-grise'); console.log('  CONTINUER GRISÉ, éléments :', (await L.boutons(p)).filter(x => !/aide-option|pastille/.test(x)).slice(0, 30).join(' ; ')); break; }
    await cand.click(); await p.waitForTimeout(2500);
  }
  const bar = '.barre-navigation-fixe .barre-navigation button';
  await L.photo(p, 'recit-7-documents');
  await L.clic(p, bar + ':first-child', 'RETOUR depuis Vos documents (récit)'); await p.waitForTimeout(1000);
  const r1 = await p.evaluate(() => pageActuelle);
  if (r1 !== 'resultats') { const c = p.locator('#btnContinuerDecouverte:visible, #btnSuivantNavigation:visible, #btnContinuerCollage:visible').first(); if (await c.count() && await c.isEnabled()) { await c.click(); await p.waitForTimeout(2500); await L.etat(p, 'retour aux documents'); } }
  await L.clic(p, bar + ':last-child', 'Valider le CV'); await p.waitForTimeout(1500);
  await L.clicTexte(p, 'Télécharger le fichier Word', 'Télécharger Word'); await p.waitForTimeout(2500);
  await L.etat(p, 'après export');
  console.log('suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer/.test(x)).join(' ; '));
  const fin = p.locator('.barre-navigation-fixe .btn-success'); if (await fin.count()) { await fin.first().click(); await L.etat(p, 'Merci bien, j’ai fini'); await L.photo(p, 'recit-8-fin'); console.log('fenêtre:', await p.evaluate(() => { const f = document.querySelector('#fenetreERIP, .fenetre-erip-overlay.visible'); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 400) : 'aucune'; })); }
  console.log('erreurs:', p.errs);
  await b.close();
})();
