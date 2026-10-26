const L = require('./lib.js');
// Clique « Continuer » ecran par ecran en journalisant. Retourne la derniere etat. S'arrete si bloque.
async function avancer(p, prefixe, max) {
  let e;
  for (let i = 1; i <= (max || 12); i++) {
    e = await L.etat(p, prefixe + ' écran ' + i); await L.photo(p, prefixe + '-ecran' + i);
    if (e.route === 'resultats') { return e; }
    const cand = p.locator('#btnSuivantNavigation:visible, #btnContinuerCollage:visible, #btnContinuerDecouverte:visible, .barre-navigation-fixe .barre-navigation button.btn-primary:visible').first();
    if (!(await cand.count())) { console.log('  PAS DE BOUTON CONTINUER. Éléments :', (await L.boutons(p)).filter(x => /^button/.test(x) && !/aide-option|pastille/.test(x)).slice(0, 18).join(' ; ')); return e; }
    if (!(await cand.isEnabled())) { console.log('  CONTINUER GRISÉ. Éléments :', (await L.boutons(p)).filter(x => !/aide-option|pastille/.test(x)).slice(0, 22).join(' ; ')); return e; }
    await cand.click(); await p.waitForTimeout(2500);
  }
  return e;
}
module.exports = { avancer };
async function terminerDocuments(p, prefixe, options) {
  options = options || {};
  const bar = '.barre-navigation-fixe .barre-navigation button';
  if (!options.sansRetour) {
    await L.clic(p, bar + ':first-child', prefixe + ' RETOUR depuis Vos documents'); await p.waitForTimeout(1000);
    const r = await p.evaluate(() => pageActuelle);
    if (r !== 'resultats') { await avancer(p, prefixe + ' (retour aux documents)', 8); }
  }
  await L.clic(p, bar + ':last-child', prefixe + ' Valider le CV'); await p.waitForTimeout(1500);
  const wd = p.getByText('Télécharger le fichier Word', { exact: false }).first();
  if (await wd.count()) { await wd.click().catch(() => {}); await p.waitForTimeout(2500); }
  const e = await L.etat(p, prefixe + ' après export');
  console.log('  suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer/.test(x)).map(x => x.replace(/button#btnSuggerer\w*\.btn /, '')).join(' ; ') || '(aucune)');
  const fin = p.locator('.barre-navigation-fixe .btn-success');
  if (await fin.count()) {
    await fin.first().click(); await p.waitForTimeout(1500);
    const f = await p.evaluate(() => { const x = document.querySelector('.fenetre-erip-overlay.visible'); return x ? x.innerText.replace(/\s+/g, ' ').slice(0, 300) : null; });
    await L.etat(p, prefixe + ' après « Merci bien, j’ai fini »');
    console.log('  fenêtre après « j’ai fini » :', f || 'aucune');
  } else { console.log('  PAS de bouton « Merci bien, j’ai fini »'); }
  return e;
}
module.exports.terminerDocuments = terminerDocuments;
// Clique le bouton principal du bas jusqu'a ce que « Valider le CV » (ou « Valider ») apparaisse. Journalise.
async function jusquAValider(p, prefixe, max) {
  for (let i = 1; i <= (max || 8); i++) {
    const principal = p.locator('.barre-navigation-fixe .barre-navigation button').last();
    const txt = ((await principal.textContent()) || '').trim();
    console.log(`  [${prefixe}] bouton principal = « ${txt} » (${await principal.isEnabled() ? 'actif' : 'grisé'}), route=${await p.evaluate(() => pageActuelle)}`);
    if (/Valider/.test(txt)) { return true; }
    if (!(await principal.isEnabled())) { return false; }
    const interne = p.locator('#btnContinuerCollage:visible').first();
    if (await interne.count()) { await interne.click(); } else { await principal.click(); }
    await p.waitForTimeout(2500);
  }
  return false;
}
module.exports.jusquAValider = jusquAValider;
// Fin d'un document lettre ou entretien : Valider, export Word, « j'ai fini »
async function finirDocument(p, prefixe) {
  const principal = p.locator('#btnSuivantNavigation:visible').first();
  if (await principal.count()) { await principal.click(); await p.waitForTimeout(1800); await L.etat(p, prefixe + ' après Valider'); }
  const wd = p.getByText(/Télécharger le (fichier )?Word/, { exact: false }).first();
  if (await wd.count()) { await wd.click().catch(() => {}); await p.waitForTimeout(2500); }
  const e = await L.etat(p, prefixe + ' après export');
  console.log('  suggestions:', (await L.boutons(p)).filter(x => /btnSuggerer|M’entraîner|Écrire ma lettre/.test(x)).join(' ; ') || '(aucune)');
  const fin = p.locator('.barre-navigation-fixe .btn-success');
  if (await fin.count()) {
    await fin.first().click(); await p.waitForTimeout(1500);
    const f = await p.evaluate(() => { const x = document.querySelector('.fenetre-erip-overlay.visible'); return x ? x.innerText.replace(/\s+/g, ' ').slice(0, 300) : null; });
    await L.etat(p, prefixe + ' après « j’ai fini »'); console.log('  fenêtre après « j’ai fini » :', f || 'aucune');
  } else { console.log('  PAS de bouton « Merci bien, j’ai fini »'); }
  return e;
}
module.exports.finirDocument = finirDocument;
