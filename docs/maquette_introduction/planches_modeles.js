/* Planches de vrais modèles de CV pour l'Introduction (01/11/2026) : les miniatures de data/miniatures/ (vrais rendus du moteur de CV,
   avec un CV d'exemple fixe) sont posées dans une page vide du navigateur de test, puis photographiées. Lecture seule.
   Usage : URL_APP=http://localhost:8124 node planches_modeles.js */
const { chromium } = require('playwright');
const path = require('path');
const URL_APP = process.env.URL_APP || 'http://localhost:8124';
const PLANCHES = {
  modeles_sobres: ['sobre_mq-editorial', 'sobre_mq-bandeau', 'sobre_mq-cartes-couleurs', 'sobre_mq-chrono', 'sobre_mq-grille', 'sobre_mq-photo', 'sobre_mq-epure', 'sobre_mq-technique'],
  modeles_creatifs: ['creatif_colonneFoncee', 'creatif_vagueMarine', 'creatif_medaillon', 'creatif_mqBandeau', 'creatif_losangeVert', 'creatif_duoOvale', 'creatif_triangleSavoir', 'creatif_colonneClaire']
};
const UN_SEUL = { modele_grand: 'creatif_colonneFoncee' };
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 1 });
  const p = await ctx.newPage();
  await p.goto(URL_APP + '/index.html'); await p.waitForTimeout(1500);
  async function planche(nom, cles, colonnes, largeur) {
    await p.evaluate(async ({ cles, colonnes, largeur }) => {
      document.body.innerHTML = '<div id="pl" style="display:grid;grid-template-columns:repeat(' + colonnes + ',' + largeur + 'px);gap:22px;padding:22px;background:#eef2f8;width:max-content;font-family:Segoe UI,system-ui,sans-serif"></div>';
      const hote = document.getElementById('pl');
      for (const cle of cles) {
        const d = await (await fetch('data/miniatures/' + cle + '.json')).json();
        const carte = document.createElement('div');
        carte.innerHTML = '<div class="m" style="width:' + largeur + 'px;height:' + Math.round(largeur * 1.414) + 'px;box-shadow:0 2px 10px rgba(0,0,0,.2);background:#fff"></div>' +
          (colonnes > 1 ? '<div style="text-align:center;font-weight:700;color:#0b1a33;margin-top:6px;font-size:15px">' + d.nom + '</div>' : '');
        hote.appendChild(carte);
        const el = carte.querySelector('.m');
        const racine = el.attachShadow({ mode: 'open' });
        racine.innerHTML = '<style>:host{all:initial;display:block;position:relative;overflow:hidden;}.mini-ech{position:absolute;top:0;left:0;width:794px;transform-origin:0 0;transform:scale(' + (largeur / 794) + ');}' + d.css + '</style><div class="mini-ech">' + d.html + '</div>';
      }
    }, { cles, colonnes, largeur });
    await p.waitForTimeout(600);
    await p.locator('#pl').screenshot({ path: path.join(__dirname, nom + '.png') });
    console.log('ok', nom);
  }
  for (const nom of Object.keys(PLANCHES)) { await planche(nom, PLANCHES[nom], 4, 235); }
  await planche('modele_grand', [UN_SEUL.modele_grand], 1, 520);
  await b.close();
})();
