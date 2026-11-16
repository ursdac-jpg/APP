/* Reprise : « Accueil » en cours de voie, retour par la page commune, « Continuer » doit ramener à l'écran quitté. */
async function tester(a, j, nom, routeCommune) {
  const rep = await a.accueilPuisPageCommune(nom, routeCommune);
  j.info(nom + ' : page commune après être sorti (depuis ' + rep.avant.hash + ' « ' + rep.avant.h1 + ' ») : ' + JSON.stringify(rep.boutons));
  const cont = rep.boutons.find((x) => /Continuer|Reprendre/.test(x) && /^btn/.test(x));
  if (!cont) { j.ko(nom + ' : aucun bouton « Reprendre » sur la page commune alors que la voie est commencée'); return; }
  await a.ev(() => { const b = [].slice.call(document.querySelectorAll('#app button')).filter((x) => /Continuer|Reprendre/.test(x.innerText) && window.__P.visible(x))[0]; b.click(); });
  await a.attendre(1200);
  const ec = await a.ecran();
  if (ec.hash !== rep.avant.hash) { j.ko(nom + ' : « Reprendre » ramène à ' + ec.hash + ' « ' + ec.h1 + ' » au lieu de ' + rep.avant.hash + ' « ' + rep.avant.h1 + ' »'); }
  else if (ec.h1 !== rep.avant.h1) { j.ko(nom + ' : « Reprendre » ramène à la bonne page mais pas au bon écran : « ' + ec.h1 + ' » au lieu de « ' + rep.avant.h1 + ' »'); }
  else { j.ok(nom + ' : « Reprendre » ramène à ' + ec.hash + ' « ' + ec.h1 + ' »'); }
}
module.exports = { tester };
