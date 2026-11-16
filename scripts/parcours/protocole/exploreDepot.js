/* Outil de mise au point : dépose un CV simulé dans le module visé puis affiche chaque écran en avançant avec « Continuer ».
   EXP_ROUTE (route), EXP_BTN (bouton « commencer » de la présentation), EXP_H1 (titre), EXP_ETAPES (nombre d'écrans), EXP_CLICS (liste JSON [[sélecteur, regex, attente], ...] jouée après le dépôt). */
const R = require('./reprendreCv.js');
module.exports = {
  nom: 'exploreDepot',
  jouer: async (a, j) => {
    await R.deposerCv(a, j, process.env.EXP_ROUTE, process.env.EXP_BTN, process.env.EXP_H1);
    if (process.env.EXP_CLICS) { for (const c of JSON.parse(process.env.EXP_CLICS)) { console.log('clic ' + JSON.stringify(c) + ' : ' + await a.clic(c[0], c[1])); await a.attendre(c[2] || 800); } }
    await a.ev(() => { window.open = function () { return {}; }; });
    const n = Number(process.env.EXP_ETAPES) || 3;
    for (let i = 0; i < n; i++) {
      const e = await a.ecran();
      const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)).filter(Boolean).join(' ; '));
      const txt = await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, 1200));
      const champs = await a.ev(() => [].slice.call(document.querySelectorAll('#app input, #app select, #app textarea')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || x.type) + '[' + x.type + ']').join(' ; '));
      console.log('\n=== ' + (i + 1) + ' | ' + e.hash + ' « ' + e.h1 + ' » | barre : ' + e.barre + ' | bas : ' + e.avant + (e.raison ? ' | raison : ' + e.raison : ''));
      console.log('champs : ' + champs); console.log('boutons : ' + btns); console.log('texte : ' + txt);
      const s = await a.suiv(); console.log('--> ' + s); if (!s.startsWith('ok')) { break; }
    }
  }
};
