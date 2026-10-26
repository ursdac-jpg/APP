const L = require('./lib.js'); const S = require('./saisies4.js'); const A = require('./avancer.js'); const fs = require('fs');
const REP = require('path').join(__dirname, '..', '..', 'essais_prompts_ucpm', 'reponses') + '/';
const EXT = require('./extraction.js');
let nbAssistant = 0;
const REPONSES = [() => '```json\n' + JSON.stringify(EXT) + '\n```', () => '```json\n' + JSON.stringify(require('./saisies3.js').REPONSE) + '\n```', () => fs.readFileSync(REP + '02_accroches_V2_neutre_chatgpt_1.txt', 'utf8'), () => fs.readFileSync(REP + '03_lettres_V6_10_feminin_chatgpt_1.txt', 'utf8')];
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'orientation', 'btnCarteAccueilUnCvPlusieursMetiers', 'tuile UCPM');
  await L.clic(p, '#btnUcpmCommencer', 'Commencer');
  await S.deposerFichierDepuis(p, 'btnUcpmDeposer');
  await L.clic(p, '#btnUcpmVersAssistant', 'Choisir mon assistant (dans la page)'); await p.waitForTimeout(1200);
  await S.assistantEtCollerBrut(p, fs.readFileSync(REP + '01_metiers_V5_chatgpt_1.txt', 'utf8'), 'ucpm-metiers');
  await L.etat(p, 'ucpm après collage des métiers'); await L.photo(p, 'ucpm-5');
  for (let i = 1; i <= 40; i++) {
    const info = await p.evaluate(() => ({ titresH2: [...document.querySelectorAll('h2, .ucpm-titre-page')].filter(e => e.offsetParent).map(e => e.textContent.trim().slice(0, 50)).slice(0, 3), courant: (document.querySelector('.pastille-etape-action.active, .pastille-etape-action--courante, .pastille-etape-action.courant') || {}).textContent }));
    const e = await L.etat(p, 'ucpm écran ' + i); await L.photo(p, 'ucpm-6-ecran' + i);
    console.log('   repère courant:', (info.courant || '?').trim(), '| sous-titres:', info.titresH2.join(' / '));
    if (/Les métiers que je vise/.test(e.h1)) { const cb = p.locator('input[type=checkbox]:visible'); const n = await cb.count(); for (let k = 0; k < Math.min(3, n); k++) { await cb.nth(k).check().catch(() => {}); await p.waitForTimeout(300); } await p.waitForTimeout(600); await L.clic(p, '#btnUcpmChoisirObjectif', 'Choisir mon objectif'); await p.waitForTimeout(1000);
      await p.locator('[data-ucpm-carte="alternance"]').click(); await p.waitForTimeout(500);
      await p.locator('[data-ucpm-dispo="Sous 15 jours"]').click(); await p.waitForTimeout(400);
      await p.locator('[data-ucpm-cible="metier"]').click(); await p.waitForTimeout(500);
      await L.photo(p, 'ucpm-7b');
      await L.clic(p, '#btnUcpmAppliquerObjectif', 'Appliquer'); await p.waitForTimeout(1200); await L.photo(p, 'ucpm-7-objectif'); }
    if (/Mes CV/.test(e.h1) && (global.__tentAcc = (global.__tentAcc || 0) + 1) <= 3) {
      const ouvr = p.getByRole('button', { name: /Choisir ma phrase d’accroche/ }); const no = await ouvr.count();
      for (let k = 0; k < no; k++) { await ouvr.nth(0).click().catch(() => {}); await p.waitForTimeout(500); }
      const props = p.locator('label:has-text("Proposition 1") input[type=radio]:visible, input[type=radio]:visible'); const np = await props.count(); console.log('   choix de phrases visibles :', np);
      const faits = await p.evaluate(() => { let n = 0; document.querySelectorAll('input[type=radio]').forEach(r => { const t = ((r.closest('label') || {}).textContent || '') + ((r.parentElement || {}).textContent || ''); if (/Proposition 1/.test(t) && !r.checked) { r.click(); n++; } }); return n; }); console.log('   propositions 1 cochées :', faits); await p.waitForTimeout(800);
      await L.photo(p, 'ucpm-8-accroche'); continue;
    }
    const cand = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand.isEnabled()) && /Choisissez un assistant et collez|Importez la réponse de l’assistant|Demandez .* à l’assistant et collez|à l’assistant et collez sa réponse/.test((await cand.getAttribute('title')) || '') && nbAssistant < REPONSES.length) { console.log('  -> assistant n°' + (nbAssistant + 1) + ' sur « ' + e.h1 + ' »'); await S.assistantEtCollerBrut(p, REPONSES[nbAssistant++](), 'ucpm-a' + nbAssistant); continue; }
    if (!(await cand.isEnabled())) { console.log('  GRISÉ. message:', await cand.getAttribute('title'), '| éléments :', (await L.boutons(p)).filter(x => !/aide-option|pastille|jeton/.test(x)).slice(0, 24).join(' ; ')); break; }
    console.log('  clic sur « ' + (await cand.textContent()).trim() + ' »'); await cand.click(); await p.waitForTimeout(2500);
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
