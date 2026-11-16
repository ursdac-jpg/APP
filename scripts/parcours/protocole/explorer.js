/* Exploration (outil de mise au point des scénarios) : node scripts/parcours/protocole/lancer.js explorer <routeDepart> <selecteurDepart>
   Variables d'environnement : EXP_ROUTE, EXP_CLIC (sélecteur à cliquer au départ), EXP_ETAPES (nombre de « Continuer »). Affiche chaque écran et ses commandes. */
module.exports = {
  nom: 'explorer',
  jouer: async (a, j) => {
    await a.aller(process.env.EXP_ROUTE || 'creer-cv');
    if (process.env.EXP_CLIC) { console.log('clic départ : ' + await a.clic(process.env.EXP_CLIC)); await a.attendre(1000); }
    if (process.env.EXP_SET) { const m = JSON.parse(process.env.EXP_SET); for (const k of Object.keys(m)) { console.log('saisie ' + k + ' : ' + await a.saisir(k, m[k])); } await a.attendre(500); }
    await a.ev(() => { window.open = function () { return {}; }; });
    if (process.env.EXP_CLICS) { const m = JSON.parse(process.env.EXP_CLICS); for (const c of m) { console.log('clic ' + JSON.stringify(c) + ' : ' + await a.clic(c[0], c[1])); await a.attendre(c[2] || 1500); } }
    const n = Number(process.env.EXP_ETAPES) || 6;
    for (let i = 0; i < n; i++) {
      const e = await a.ecran();
      const champs = await a.ev(() => [].slice.call(document.querySelectorAll('#app input, #app select, #app textarea')).filter((x) => window.__P.visible(x)).map((x) => (x.id || x.name || x.type) + '[' + x.type + ']=' + String(x.value).slice(0, 15)));
      const btns = await a.ev(() => [].slice.call(document.querySelectorAll('#app button, #app summary, #app [role=button]')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 38)).filter(Boolean).slice(0, 45));
      const texte = await a.ev(() => document.getElementById('app').innerText.replace(/\s+/g, ' ').slice(0, Number(1100)));
      console.log('\n=== ' + (i + 1) + ' | ' + e.hash + ' « ' + e.h1 + ' » | barre : ' + e.barre + ' | bas : ' + e.avant + (e.raison ? ' | raison : ' + e.raison : ''));
      console.log('champs : ' + champs.join(' ; '));
      console.log('boutons : ' + btns.join(' ; '));
      console.log('texte : ' + texte);
      const fen = await a.ev(() => { const f = document.querySelector('#fenetreERIP.visible, .fenetre-erip-overlay.visible, .modal.show'); return f ? { t: f.innerText.replace(/\s+/g, ' ').slice(0, 500), b: [].slice.call(f.querySelectorAll('button')).filter((x) => window.__P.visible(x)).map((x) => (x.id ? '#' + x.id + ' ' : '') + window.__P.lib(x).slice(0, 40)) } : null; });
      if (fen) { console.log('FENÊTRE : ' + fen.t); console.log('  boutons fenêtre : ' + fen.b.join(' ; ')); }
      const s = await a.suiv();
      console.log('--> ' + s);
      if (!s.startsWith('ok')) { break; }
    }
  }
};
