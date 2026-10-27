const L = require('./lib.js'); const S = require('./saisies4.js');
const COLLECTE = 'ok ' + JSON.stringify({ territoire: 'Haute-Vienne (87)', pistes: [{ nom: 'Aide-soignante', durable: {}, a_verifier: [], incertitudes: [] }, { nom: 'Agent de service hospitalier', durable: {}, a_verifier: [], incertitudes: [] }], cloture: 'x' });
const FRISE = 'ici : ' + JSON.stringify({ colonnes: [{ nom: 'Aide-soignante', role: 'repere', aujourdhui: 'a', pendant: 'b', apres: 'c' }, { nom: 'Agent de service hospitalier', role: 'depart', aujourdhui: 'd', pendant: 'e', apres: 'f' }], conditions_a_reunir: [], impact_sur_les_droits: [], questions_conseiller: ['Q1'], incertitudes: ['I1'] });
const APL = JSON.stringify({ questions: ['Avez-vous observé ce métier sur le terrain ?', 'Comment financeriez-vous la formation ?'], cloture: 'x' });
const SUPERPO = JSON.stringify({ dimensions: [{ element: 'duree_formation', valeurs: [] }] });
const REPONSES = [COLLECTE, SUPERPO, FRISE, APL];
let n = 0;
(async () => {
  const { b, p } = await L.ouvrir();
  await L.carte(p, 'orientation', 'btnCarteAccueilComparerPistes', 'tuile comparer');
  await L.clic(p, '#btnAideDecisionCommencer', 'Commencer'); await p.waitForTimeout(1500);
  await L.clicTexte(p, 'Je nomme mes pistes', 'Je nomme mes pistes'); await p.waitForTimeout(600);
  const noms = p.locator('input[placeholder^="Nom de la piste"]'); const attr = p.locator('textarea[placeholder^="Ce qui m’attire"]');
  await noms.nth(0).fill('Aide-soignante'); await attr.nth(0).fill('Le contact avec les gens et un métier utile.');
  await noms.nth(1).fill('Agent de service hospitalier'); await attr.nth(1).fill('Je connais déjà l’entretien de locaux.');
  await L.clicTexte(p, 'Sans emploi', 'situation : sans emploi'); await L.clicTexte(p, '26 à 45 ans', 'tranche d’âge'); await L.clicTexte(p, 'Pas concerné(e)', 'handicap : pas concerné');
  await p.waitForTimeout(600); await L.photo(p, 'cmp-3');
  console.log('Continuer actif:', await p.locator('#btnSuivantNavigation').isEnabled(), '|', await p.evaluate(() => (document.getElementById('btnSuivantNavigation') || {}).title));
  for (let i = 1; i <= 24; i++) {
    const cand0 = p.locator('#btnContinuerCollage:visible, #btnSuivantNavigation:visible, .barre-navigation-fixe .btn-success:visible').first();
    const e = await L.etat(p, 'comparer écran ' + i); await L.photo(p, 'cmp-4-ecran' + i);
    if (/Les pistes qu’on a comprises/.test(e.h1) && !global.__etiq) { global.__etiq = true; await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500); await L.photo(p, 'cmp-4b'); console.log('   contrôles :', await p.evaluate(() => [...document.querySelectorAll('select, input[type=radio], .cp-etiquette, [data-cp-etiquette]')].map(e => e.tagName + '#' + e.id + '.' + (e.className||'').toString().slice(0,30) + ' ' + (e.dataset.cpEtiquette||'') + '|vis=' + (e.offsetParent!==null)).slice(0, 12).join(' ; '))); const jet = p.locator('.preparer-jeton[data-cp-etiquette="metier"]'); const k = await jet.count(); for (let j = 0; j < k; j++) { await jet.nth(j).click().catch(() => {}); await p.waitForTimeout(300); } await p.waitForTimeout(600); continue; }
    if (!(await cand0.count())) { console.log('  PAS DE BOUTON PRINCIPAL. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille|jeton/.test(x)).slice(0, 22).join(' ; ')); break; }
    if (!(await cand0.isEnabled())) {
      const msg = (await cand0.getAttribute('title')) || '';
      console.log('  GRISÉ. message:', msg);
      const aP = p.locator('button.pastille-selection, [data-cp-assistant]').first();
      if (n < REPONSES.length && (await aP.count())) { console.log('  -> assistant n°' + (n + 1)); await S.assistantEtCollerBrut(p, REPONSES[n++], 'cmp-a' + n); continue; }
      console.log('  éléments :', (await L.boutons(p)).filter(x => !/aide-option|jeton/.test(x)).slice(0, 25).join(' ; ')); break;
    }
    console.log('  clic sur « ' + (await cand0.textContent()).trim() + ' »'); await cand0.click(); await p.waitForTimeout(2500);
  }
  console.log('erreurs:', p.errs);
  await b.close();
})();
