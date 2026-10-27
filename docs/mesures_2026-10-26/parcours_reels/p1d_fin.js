const L = require('./lib.js'); const M = require('./saisies2.js'); const M3 = require('./saisies3.js'); const A = require('./avancer.js');
(async () => {
  console.log('=== À LA MAIN');
  let r = await M.mainJusquAuxDocuments(); await A.terminerDocuments(r.p, 'main'); await r.b.close();
  console.log('=== AVEC ASSISTANT');
  r = await M3.assistantJusquALaPage(); await M3.collerReponseCv(r.p, L); await M3.continuerJusquAuxDocuments(r.p, L); await A.terminerDocuments(r.p, 'assist'); await r.b.close();
})();
