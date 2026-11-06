/* Captures réelles de l'application pour la maquette de l'Introduction (01/11/2026). Vue « tous les modules ouverts » : Employeurs et Qui fait quoi s'ouvrent bientôt au public et l'Introduction en parle.
   Lecture seule : ne modifie rien dans l'application. Usage : URL_APP=http://localhost:8124 node captures.js */
const { chromium } = require('playwright');
const path = require('path');
const URL_APP = process.env.URL_APP || 'http://localhost:8124';
const SORTIE = __dirname;
(async () => {
  const b = await chromium.launch();
  async function nouvelle(largeur, hauteur) {
    const ctx = await b.newContext({ viewport: { width: largeur, height: hauteur }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto(URL_APP + '/index.html'); await p.waitForTimeout(2000);
    await p.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await p.reload(); await p.waitForTimeout(2000);
    return p;
  }
  let p = await nouvelle(1000, 760);
  await p.screenshot({ path: path.join(SORTIE, 'accueil.png') });
  await p.evaluate(() => window.scrollTo(0, 640)); await p.waitForTimeout(500); await p.screenshot({ path: path.join(SORTIE, 'accueil_bas.png') }); await p.evaluate(() => window.scrollTo(0, 0));
  await p.click('[data-carte-accueil="mesdocuments"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(SORTIE, 'mes_documents.png') });
  await p.close();
  p = await nouvelle(1000, 760);
  await p.click('[data-carte-accueil="boiteaoutils"]'); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(SORTIE, 'boite_a_outils.png') });
  await p.close();
  p = await nouvelle(375, 760);
  await p.screenshot({ path: path.join(SORTIE, 'accueil_telephone.png') });
  await b.close();
  console.log('ok');
})();
