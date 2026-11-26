/* Garde-fou « téléphone », écrans INTERNES des parcours (audit du 24/11/2026, docs/AUDIT_TELEPHONE_2026-11-24.md, lot 2).
   Rejoue les parcours scénarisés du protocole (scripts/parcours/protocole/) à 375 px dans un téléphone simulé ; chaque écran traversé reçoit la mesure
   « téléphone » (débordement, contenu coupé, cibles de moins de 44 px : scripts/rendu/mesureTelephone.js, la même que npm run telephone).
   Utilisation : npm run telephone:parcours            (tous les parcours, 3 à la fois, 10 minutes environ)
                 node scripts/rendu/balayageTelephoneParcours.js creerAssistant,lettreRapide   (certains parcours seulement)
   Affiche les anomalies « téléphone » regroupées par parcours. Les autres écarts du protocole (hors téléphone) sont comptés à part : ils relèvent du protocole des parcours.
   Les assistants en ligne sont SIMULÉS : seul l'affichage est mesuré, jamais le contenu des réponses. Jamais chargé par l'application. Code de sortie 0 = rien, 1 = au moins un défaut. */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const DOSSIER = path.join(__dirname, '..', 'parcours', 'protocole');
const LARGEUR = 375;
const PARALLELE = 3;
const EXCLUS = ['lancer', 'outils', 'enchainer', 'reprise', 'explorer', 'exploreDepot'];   // aides et outils de mise au point, pas des parcours à jouer

const demandes = (process.argv[2] || '').split(',').filter(Boolean);
const parcours = demandes.length ? demandes : fs.readdirSync(DOSSIER).filter((f) => /\.js$/.test(f)).map((f) => f.replace('.js', '')).filter((n) => EXCLUS.indexOf(n) === -1);

function jouer(nom) {
  return new Promise((fin) => {
    const t0 = Date.now();
    const p = spawn(process.execPath, [path.join(DOSSIER, 'lancer.js'), nom, String(LARGEUR)], { stdio: 'ignore' });
    const delai = setTimeout(() => { p.kill(); }, 15 * 60 * 1000);
    p.on('close', () => { clearTimeout(delai); fin({ nom, secondes: Math.round((Date.now() - t0) / 1000) }); });
  });
}

(async () => {
  const file = parcours.slice(), faits = [];
  await Promise.all(Array.from({ length: PARALLELE }, async () => { while (file.length) { faits.push(await jouer(file.shift())); } }));
  let nbTel = 0, nbEcrans = 0, nbAutres = 0;
  const manquants = [];
  faits.sort((a, b) => a.nom.localeCompare(b.nom)).forEach((f) => {
    const fichier = path.join(DOSSIER, 'sorties', f.nom + '_' + LARGEUR + '.json');
    if (!fs.existsSync(fichier) || fs.statSync(fichier).mtimeMs < Date.now() - 30 * 60 * 1000) { manquants.push(f.nom); return; }
    const j = JSON.parse(fs.readFileSync(fichier, 'utf8'));
    nbEcrans += j.ecrans.length;
    const ecarts = j.lignes.filter((l) => l.n === 'ECART');
    const tel = ecarts.filter((l) => /téléphone : /.test(l.t)), autres = ecarts.length - tel.length;
    nbTel += tel.length; nbAutres += autres;
    console.log(`${f.nom} : ${j.ecrans.length} écrans, ${tel.length} anomalie(s) téléphone, ${autres} autre(s) écart(s) du protocole (${f.secondes} s)`);
    const vus = new Set();
    tel.forEach((l) => { const k = l.t; if (!vus.has(k)) { vus.add(k); console.log('   - ' + k.slice(0, 280)); } });
  });
  if (manquants.length) { console.log('\nPARCOURS SANS RÉSULTAT (arrêt ou délai dépassé) : ' + manquants.join(', ')); }
  console.log(`\nTéléphone ${LARGEUR} px : ${parcours.length} parcours, ${nbEcrans} écrans mesurés, ${nbTel} anomalie(s) téléphone, ${nbAutres} autre(s) écart(s) du protocole.`);
  process.exit(nbTel || manquants.length ? 1 : 0);
})();
