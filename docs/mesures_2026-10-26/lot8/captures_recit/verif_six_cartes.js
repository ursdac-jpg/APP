/* Récit, six cartes (28/10/2026) : vrais clics sur chaque carte ; relève le panneau qui s'ouvre, l'objectif enregistré, l'état de « Continuer », les erreurs JS. Usage : node verif_six_cartes.js */
const { chromium } = require('playwright');
(async () => { const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1000, height: 1000 } })).newPage();
  const err = []; p.on('pageerror', e => err.push(String(e)));
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500);
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  await p.evaluate(() => naviguerVers('decouverte-intro')); await p.waitForTimeout(1500); await p.click('#btnDecouverteCommencer'); await p.waitForTimeout(2500);
  console.log('cartes :', await p.evaluate(() => [...document.querySelectorAll('.grille-objectif [data-value]')].map(e => e.dataset.value).join(', ')));
  for (const id of ['reconversion', 'alternance', 'formation', 'stage', 'offre', 'spontanee', 'alternance']) {
    await p.locator('.grille-objectif [data-value="' + id + '"]').click(); await p.waitForTimeout(1500);
    console.log(id, JSON.stringify(await p.evaluate(() => { const c = document.getElementById('decouverteComposantCandidature'); const cont = [...document.querySelectorAll('.barre-navigation-fixe button')].find(x => /Continuer/.test(x.textContent));
      return { objectif: dossier.objectif, actives: [...document.querySelectorAll('.carte-objectif--actif')].map(e => e.dataset.value), panneau: c ? c.innerText.replace(/\s+/g, ' ').slice(0, 110) : '(aucun)', continuerGrise: cont ? (cont.disabled || cont.getAttribute('aria-disabled') === 'true' || /disabled|grise/.test(cont.className)) : null }; })));
  }
  console.log('erreurs JS :', err.join(' / ') || 'aucune');
  await b.close(); })();
