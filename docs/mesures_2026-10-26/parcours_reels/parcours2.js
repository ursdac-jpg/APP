const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const res = {};
  async function neuf() {
    const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
    p.errs = []; p.on('pageerror', e => p.errs.push(String(e).slice(0, 140)));
    await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(3000); return p;
  }
  const att = (p, ms) => p.waitForTimeout(ms || 1200);
  // A. Nouveau a la main : objectif -> projet -> votre-parcours -> revelation, puis Retour
  for (const sans of [true, false]) {
    const p = await neuf();
    await p.evaluate((sans) => { try { localStorage.clear(); } catch (e) {} dossier.modeCreation = 'nouveau'; dossier.creationSansAssistant = sans; dossier.objectif = 'spontanee'; }, sans);
    const trace = [];
    for (const r of ['projet', 'votre-parcours', 'revelation']) {
      await p.evaluate(r => naviguerVers(r), r); await att(p, 1500);
      trace.push(await p.evaluate(() => pageActuelle));
    }
    const textes = await p.evaluate(() => ({
      intertitres: [...document.querySelectorAll('.revelation-intertitre')].map(e => e.textContent.trim()),
      suivant: (document.getElementById('btnSuivantNavigation') || {}).textContent
    }));
    // clic reel sur Retour
    await p.click('.barre-navigation button:first-child'); await att(p, 1500);
    const apres = await p.evaluate(() => pageActuelle);
    res[sans ? 'A-main' : 'A-assistant'] = { trace, textes, retourVa: apres, erreurs: p.errs.length };
    await p.close();
  }
  // B. Recit : etat perdu (rechargement) puis Retour sur Vos documents
  {
    const p = await neuf();
    await p.evaluate(() => { dossier.modeCreation = 'nouveau'; dossier.decouverteTerminee = true; dossier.dernierDocumentPrepare = 'cv'; });
    await p.evaluate(() => naviguerVers('resultats')); await att(p, 2500);
    await p.click('.barre-navigation button:first-child'); await att(p, 1500);
    res['B-recit-retour'] = { route: await p.evaluate(() => pageActuelle), h1: await p.evaluate(() => (document.querySelector('h1') || {}).textContent), erreurs: p.errs.length };
    await p.close();
  }
  // C. Reformuler : barre sur les ecrans intermediaires objectif/projet/revelation (mode maj + _origineReformuler)
  {
    const p = await neuf();
    await p.evaluate(() => { dossier.modeCreation = 'maj'; dossier.cvAnalyse = true; dossier._origineReformuler = true; dossier.objectif = 'spontanee'; });
    const out = [];
    for (const r of ['objectif', 'projet', 'revelation', 'resultats']) {
      await p.evaluate(r => naviguerVers(r), r); await att(p, 1500);
      out.push([r, await p.evaluate(() => [...document.querySelectorAll('.pastille-etape-action-label')].map(e => e.textContent.trim()).join(' > '))]);
    }
    res['C-reformuler-barre'] = out; await p.close();
  }
  console.log(JSON.stringify(res, null, 1));
  await b.close();
})();
