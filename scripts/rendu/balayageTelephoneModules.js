/* Garde-fou « téléphone », modules sans parcours scénarisé (audit du 24/11/2026, lot « autres modules », 25/11/2026).
   Pour chaque route demandée (par défaut : les modules que le protocole des parcours ne traverse pas), ouvre la page dans un téléphone simulé (375 x 812, écran tactile),
   touche UN PAR UN les boutons, titres repliables et onglets visibles (premier niveau), puis ceux de chaque nouvel écran obtenu (deuxième niveau), et mesure chaque
   état distinct avec la MÊME mesure que `npm run telephone` (scripts/rendu/mesureTelephone.js, source unique).
   Aucune saisie, aucune donnée : le navigateur est vierge. Les ouvertures d'onglet et les téléchargements sont neutralisés.
   Limite : ce n'est pas un parcours (rien n'est saisi ni collé) ; il montre les écrans que les boutons ouvrent, pas ceux qui demandent une réponse de l'assistant.
   Avec --saisies (essai du 25/11/2026) : à chaque écran, remplit d'abord tous les champs visibles (texte court, texte long avec un mot très long, listes, cases à cocher), puis touche les
   boutons, puis simule le CLAVIER ouvert (écran de 375 x 420) : un champ touché ne doit pas rester caché sous une barre fixe ni sortir de l'écran.
   Utilisation : npm run telephone:modules   (ou : node scripts/rendu/balayageTelephoneModules.js [route1,route2] [--largeur=375] [--sombre] [--saisies])
   Jamais chargé par l'application. Code de sortie 0 = tout passe, 1 = au moins un défaut. */
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');
const { mesurer, anomalies, optionsTelephone, SEUIL_CIBLE, remplirChamps: remplir, controleClavier } = require('./mesureTelephone.js');

const ARGS = process.argv.slice(2);
const LARGEUR = Number((ARGS.find((a) => /^--largeur=/.test(a)) || '--largeur=375').split('=')[1]);
const SOMBRE = ARGS.indexOf('--sombre') !== -1;
const SAISIES = ARGS.indexOf('--saisies') !== -1;
const ROUTES_DEMANDEES = (ARGS.find((a) => !/^--/.test(a)) || '').split(',').filter(Boolean);
const ROUTES_PAR_DEFAUT = [
  'introduction', 'introduction-diaporama', 'introduction-video', 'nouveautes', 'lexique', 'carnet', 'reperes',
  'mes-competences-intro', 'mes-competences', 'ce-qui-compte-intro', 'ce-qui-compte',
  'bien-utiliser-ia-intro', 'bien-utiliser-ia', 'bien-utiliser-ia-comprendre', 'bien-utiliser-ia-fonctionne', 'bien-utiliser-ia-modeles', 'bien-utiliser-ia-ecrire',
  'comprendre-les-metiers-intro', 'comprendre-les-metiers', 'decouverte-intro', 'employeurs-intro', 'complement-cv'
];
const MAX_PREMIER_NIVEAU = 30;   // boutons touchés depuis l'écran d'entrée
const MAX_DEUXIEME_NIVEAU = 8;   // boutons touchés depuis chaque nouvel écran
const MAX_ETATS = 60;            // états mesurés par route

// Exécutés dans la page.
function candidats() {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const l = [].slice.call(document.querySelectorAll('#app button, #app summary, #app [role=tab], #app a[href^="#"], #app [role=button]')).filter(vis).filter((e) => !e.disabled && !e.closest('.barre-navigation-fixe') && e.type !== 'file' && !e.closest('label'));
  return l.map((e) => ((e.id ? '#' + e.id + ' ' : '') + ((e.innerText || e.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40))));
}
function signature() {
  const h = document.querySelector('#app h1, #app h2');
  return location.hash + '|' + (h ? h.innerText.replace(/\s+/g, ' ').trim().slice(0, 40) : '') + '|' + document.querySelectorAll('#app details[open]').length + '|' + Math.round(document.getElementById('app').innerText.length / 40);
}
function toucher(i) {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const l = [].slice.call(document.querySelectorAll('#app button, #app summary, #app [role=tab], #app a[href^="#"], #app [role=button]')).filter(vis).filter((e) => !e.disabled && !e.closest('.barre-navigation-fixe') && e.type !== 'file' && !e.closest('label'));
  if (!l[i]) { return false; }
  window.open = function () { return {}; };
  l[i].click();
  return true;
}

(async () => {
  const b = await chromium.launch();
  const p = await ouvrir(b, LARGEUR, optionsTelephone(LARGEUR));
  const erreursPage = [];
  p.on('pageerror', (e) => erreursPage.push(e.message.slice(0, 160)));
  p.on('dialog', (d) => d.dismiss().catch(() => {}));
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  // Les modules encore fermés au public (BUIA_OUVERT, CQCPM_OUVERT : ouverts seulement sur localhost) sont ouverts ici, pour qu'ils soient prêts avant leur ouverture.
  await p.evaluate((s) => {
    if (s) { document.documentElement.setAttribute('data-theme', 'sombre'); }
    ['BUIA_OUVERT', 'CQCPM_OUVERT', 'MESCOMP_OUVERT'].forEach((n) => { try { window[n] = true; } catch (e) { /* absent */ } });
  }, SOMBRE);
  const toutes = await p.evaluate(() => Object.keys(routes));
  const routes = (ROUTES_DEMANDEES.length ? ROUTES_DEMANDEES : ROUTES_PAR_DEFAUT).filter((r) => toutes.indexOf(r) !== -1);
  const defauts = [];
  let nbEtats = 0;
  const ouvrirRoute = async (route, chemin) => {
    await p.evaluate((r) => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { /* rien */ } naviguerVers(r); window.scrollTo(0, 0); }, route);
    await p.waitForTimeout(450);
    if (SAISIES) { await p.evaluate(remplir); await p.waitForTimeout(250); }
    for (const i of chemin) { const ok = await p.evaluate(toucher, i); if (!ok) { return false; } await p.waitForTimeout(500); if (SAISIES) { await p.evaluate(remplir); await p.waitForTimeout(250); } }
    return true;
  };
  for (const route of routes) {
    const vus = new Set();
    let etatsRoute = 0;
    const mesurerEtat = async (libelle) => {
      const sig = await p.evaluate(signature);
      if (vus.has(sig)) { return null; }
      vus.add(sig);
      const avant = erreursPage.length;
      const m = await p.evaluate(mesurer, { seuil: SEUIL_CIBLE });
      const an = anomalies(m, LARGEUR);
      if (erreursPage.length > avant) { an.push('erreur de page ' + erreursPage.slice(avant).join(' | ')); }
      if (SAISIES) {
        await p.setViewportSize({ width: LARGEUR, height: 420 }); await p.waitForTimeout(250);
        const ck = await p.evaluate(controleClavier);
        await p.setViewportSize({ width: LARGEUR, height: 812 }); await p.waitForTimeout(250);
        ck.forEach((x) => an.push('clavier ouvert : ' + x));
      }
      nbEtats++; etatsRoute++;
      an.forEach((x) => defauts.push(route + ' > ' + libelle + ' [' + sig.split('|').slice(0, 2).join(' ') + '] : ' + x));
      return sig;
    };
    try {
      if (!(await ouvrirRoute(route, []))) { continue; }
      const sig0 = await mesurerEtat('entrée');
      const noms = await p.evaluate(candidats);
      for (let i = 0; i < Math.min(noms.length, MAX_PREMIER_NIVEAU) && etatsRoute < MAX_ETATS; i++) {
        if (!(await ouvrirRoute(route, [i]))) { continue; }
        const sig1 = await mesurerEtat('« ' + noms[i] + ' »');
        if (!sig1 || sig1 === sig0) { continue; }
        const noms2 = await p.evaluate(candidats);
        for (let k = 0; k < Math.min(noms2.length, MAX_DEUXIEME_NIVEAU) && etatsRoute < MAX_ETATS; k++) {
          if (!(await ouvrirRoute(route, [i, k]))) { continue; }
          await mesurerEtat('« ' + noms[i] + ' » puis « ' + noms2[k] + ' »');
        }
      }
    } catch (e) { defauts.push(route + ' : impossible à explorer (' + String(e.message).slice(0, 100) + ')'); }
    console.log('  ' + route + ' : ' + etatsRoute + ' état(s) distinct(s) mesuré(s)');
  }
  await b.close();
  console.log(`Téléphone ${LARGEUR} px${SOMBRE ? ' (sombre)' : ''}${SAISIES ? ' avec saisies et clavier ouvert' : ''} : ${nbEtats} états mesurés sur ${routes.length} routes de modules sans parcours scénarisé.`);
  if (defauts.length) { console.log('\nDÉFAUTS :'); defauts.forEach((d) => console.log(' - ' + d)); }
  else { console.log('Aucun défaut.'); }
  process.exit(defauts.length ? 1 : 0);
})();
