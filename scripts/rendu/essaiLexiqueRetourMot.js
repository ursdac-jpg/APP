/* Essai réel : dans le Lexique, « Retour » depuis une fiche garde le mot tapé (consigne 266, 12/11/2026).
   Utilisation : node scripts/rendu/essaiLexiqueRetourMot.js (Playwright via NODE_PATH, sans serveur). */
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');
(async () => {
  const b = await chromium.launch();
  const p = await ouvrir(b, 375);
  const erreurs = []; p.on('pageerror', (e) => erreurs.push(e.message.slice(0, 200)));
  await p.goto('http://app.local/index.html'); await p.waitForTimeout(3500);
  await p.mouse.click(3, 300);
  await p.evaluate(() => { _lexiqueEcranIntro = false; naviguerVers('lexique'); });
  await p.waitForTimeout(1500);
  const etat = () => p.evaluate(() => ({ champ: (document.getElementById('lexiqueRechercheInput') || {}).value, nb: document.querySelectorAll('#lexiqueResultats [data-lexique-fiche]').length, fiche: !!document.getElementById('lexiqueFicheEcran') }));
  await p.fill('#lexiqueRechercheInput', 'licenciement'); await p.waitForTimeout(700);
  console.log('après la frappe :', JSON.stringify(await etat()));
  await p.click('#lexiqueResultats [data-lexique-fiche]'); await p.waitForTimeout(800);
  console.log('fiche ouverte :', JSON.stringify(await etat()));
  await p.click('#lexiqueRetourRecherche'); await p.waitForTimeout(800);
  console.log('Retour (bouton de la page) :', JSON.stringify(await etat()));
  await p.click('#lexiqueResultats [data-lexique-fiche]'); await p.waitForTimeout(800);
  await p.evaluate(() => { const bt = Array.from(document.querySelectorAll('.barre-navigation-fixe button')).find((x) => /Retour/.test(x.innerText)); bt.click(); }); await p.waitForTimeout(800);
  console.log('Retour (barre du bas) :', JSON.stringify(await etat()));
  await p.evaluate(() => naviguerVers('accueil')); await p.waitForTimeout(800);
  await p.evaluate(() => { _lexiqueEcranIntro = false; naviguerVers('lexique'); }); await p.waitForTimeout(1000);
  console.log('nouvelle arrivée :', JSON.stringify(await etat()));
  console.log('erreurs de page :', erreurs.length, erreurs.join(' | '));
  await b.close();
})();
