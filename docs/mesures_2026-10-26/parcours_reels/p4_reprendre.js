const L = require('./lib.js'); const S = require('./saisies4.js');
(async () => {
  const { b, p } = await L.ouvrir();
  await S.deposerEtEnregistrer(p);
  await L.photo(p, 'repr-6-apres-verif');
  console.log((await L.boutons(p)).filter(x => !/aide-option/.test(x)).slice(0, 25).join('\n'));
  console.log('fenêtre:', await p.evaluate(() => { const f = document.querySelector('.fenetre-erip-overlay.visible'); return f ? f.innerText.replace(/\s+/g, ' ').slice(0, 600) : 'aucune'; }));
  console.log('erreurs:', p.errs);
  await b.close();
})();
