/* Garde-fou « téléphone » (audit du 24/11/2026, docs/AUDIT_TELEPHONE_2026-11-24.md, lot 5).
   Ouvre chaque route de l'application dans un téléphone simulé (375 x 812, écran tactile), en clair puis en sombre, et refuse :
     - une page plus large que l'écran (défilement de côté), un élément qui sort de l'écran, ou un contenu coupé par un cadre à débordement masqué ;
     - une erreur de page ;
     - une cible tactile (bouton, lien, champ) de moins de 44 px, sauf celles de la liste `TOLEREES` plus bas (dette connue, à résorber).
   Limite : seules les pages d'entrée des routes sont ouvertes. Les écrans internes d'un parcours sont mesurés par le protocole des parcours : npm run telephone:parcours.
   La mesure elle-même est dans scripts/rendu/mesureTelephone.js (source unique).
   Utilisation : npm run telephone   (ou : node scripts/rendu/balayageTelephone.js [route1,route2] [--largeur=375])
   Aucun serveur : les fichiers sont servis depuis le disque (voir scripts/parcours/lancerEssais.js). Playwright vient du dossier parent du dépôt.
   Jamais chargé par l'application. Code de sortie 0 = tout passe, 1 = au moins un défaut. */
const { chromium } = require('playwright');
const { ouvrir } = require('../parcours/lancerEssais.js');
const { mesurer, optionsTelephone, SEUIL_CIBLE, estToleree } = require('./mesureTelephone.js');

const ARGS = process.argv.slice(2);
const LARGEUR = Number((ARGS.find((a) => /^--largeur=/.test(a)) || '--largeur=375').split('=')[1]);
const ROUTES_DEMANDEES = (ARGS.find((a) => !/^--/.test(a)) || '').split(',').filter(Boolean);
(async () => {
  const b = await chromium.launch();
  const p = await ouvrir(b, LARGEUR, optionsTelephone(LARGEUR));
  const erreursPage = [];
  p.on('pageerror', (e) => erreursPage.push(e.message.slice(0, 160)));
  await p.goto('http://app.local/index.html');
  await p.waitForTimeout(3500);
  const routes = ROUTES_DEMANDEES.length ? ROUTES_DEMANDEES : await p.evaluate(() => Object.keys(routes));
  const defauts = [], dette = [], petitesParCible = {};
  let nbMesures = 0;
  for (const theme of ['clair', 'sombre']) {
    await p.evaluate((t) => { if (t === 'sombre') { document.documentElement.setAttribute('data-theme', 'sombre'); } else { document.documentElement.removeAttribute('data-theme'); } }, theme);
    for (const route of routes) {
      const avant = erreursPage.length;
      let m;
      try {
        await p.evaluate((r) => { naviguerVers(r); window.scrollTo(0, 0); }, route);
        await p.waitForTimeout(450);
        m = await p.evaluate(mesurer, { seuil: SEUIL_CIBLE });
      } catch (e) { defauts.push(`[${theme}] ${route} : impossible à mesurer (${String(e.message).slice(0, 100)})`); continue; }
      nbMesures++;
      if (m.largeurPage > LARGEUR) { defauts.push(`[${theme}] ${route} : la page fait ${m.largeurPage} px de large pour un écran de ${LARGEUR} px`); }
      if (m.sortants.length) { defauts.push(`[${theme}] ${route} : ${m.sortants.length} élément(s) sortent de l'écran, par exemple ${m.sortants.slice(0, 3).join(', ')}`); }
      if (m.coupes.length) { defauts.push(`[${theme}] ${route} : ${m.coupes.length} élément(s) coupé(s) à droite, par exemple ${m.coupes.slice(0, 3).join(', ')}`); }
      if (m.champsPetits.length) { defauts.push(`[${theme}] ${route} : ${m.champsPetits.length} champ(s) de saisie en dessous de 16 px (un iPhone zoomerait), par exemple ${m.champsPetits.slice(0, 3).join(', ')}`); }
      if (erreursPage.length > avant) { defauts.push(`[${theme}] ${route} : erreur de page ${erreursPage.slice(avant).join(' | ')}`); }
      const nonToleres = m.petites.filter((t) => !estToleree(t));
      nonToleres.forEach((t) => { const cle = t.replace(/^(\S+) .*/, '$1') + ' (' + t.replace(/^\S+ /, '') + ')'; (petitesParCible[cle] = petitesParCible[cle] || new Set()).add(route); });
      if (nonToleres.length) { dette.push(`[${theme}] ${route} : ${nonToleres.length} cible(s) de moins de ${SEUIL_CIBLE} px, par exemple ${nonToleres.slice(0, 3).join(', ')}`); }
    }
  }
  await b.close();
  console.log(`Téléphone ${LARGEUR} px : ${nbMesures} pages mesurées (${routes.length} routes, clair et sombre).`);
  if (defauts.length) { console.log('\nDÉFAUTS (débordement ou erreur) :'); defauts.forEach((d) => console.log(' - ' + d)); }
  if (dette.length) {
    // Résumé par cible : la même cible revient sur beaucoup de pages (boutons fixes du haut, barre d'étapes) ; le détail page par page vient avec --detail.
    console.log('\nCIBLES TROP PETITES (moins de ' + SEUIL_CIBLE + ' px), regroupées, avec le nombre de routes touchées :');
    Object.keys(petitesParCible).sort((a, c) => petitesParCible[c].size - petitesParCible[a].size).forEach((k) => console.log(' - ' + k + ' : ' + petitesParCible[k].size + ' route(s)'));
    if (ARGS.indexOf('--detail') !== -1) { console.log('\nDétail page par page :'); dette.forEach((d) => console.log(' - ' + d)); }
  }
  if (!defauts.length && !dette.length) { console.log('Aucun défaut.'); }
  process.exit(defauts.length || dette.length ? 1 : 0);
})();
