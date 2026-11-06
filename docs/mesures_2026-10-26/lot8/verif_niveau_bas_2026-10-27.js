/* Niveau bas du 27/10/2026 : département (Comprendre le cadre), majuscules de Mes Repères, dictée vocale sans « Windows + H », « Retour » du récit sans session. Usage : node verif_niveau_bas_2026-10-27.js */
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1280, height: 900 } })).newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  await p.goto('http://localhost:8123/index.html'); await p.waitForTimeout(2500); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(2500);
  const lire = async (route) => { await p.evaluate(r => naviguerVers(r), route); await p.waitForTimeout(1500); return p.evaluate(() => document.body.innerText); };
  let t = await lire('comprendre-le-cadre');
  console.log('cadre : département', /Choisir mon département/.test(t), '| territoire restant', /territoire/i.test(t));
  t = await lire('reperes'); console.log('reperes (page) : Non analysés', /Non analysés/.test(t), '| ancien Non Analysés', /Non Analysés/.test(t), '| Windows + H', /Windows \+ H/.test(t), '| dictée vocale', /dictée vocale de votre appareil/.test(t));
  t = await lire('carnet'); console.log('carnet : Windows + H', /Windows \+ H/.test(t), '| dictée vocale', /dictée vocale de votre appareil/.test(t));
  await p.evaluate(() => { _decouverteRenduEtape = null; }); await p.evaluate(() => reafficherDecouverteCompetences()); await p.waitForTimeout(1500);
  console.log('retour récit sans session -> route :', await p.evaluate(() => pageActuelle));
  console.log('erreurs :', JSON.stringify(errs));
  await b.close();
})();
