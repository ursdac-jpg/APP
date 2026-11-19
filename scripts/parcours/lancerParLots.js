/* ============================================================
   scripts/parcours/lancerParLots.js
   Joue les essais de parcours (parcours_smoke.js) UN PAR UN, chacun dans sa propre page propre, plusieurs en parallèle, avec un délai maximal par essai.
   Écrit le résultat au fur et à mesure dans un fichier JSON (reprise possible : les essais déjà faits sont sautés, sauf avec « refaire »).
   Usage : node scripts/parcours/lancerParLots.js <sortie.json> [ids,virgules] [travailleurs] [delai_secondes] [largeur] [refaire]
     Sans identifiant : tous les essais (sauf « banc », à jouer seul avec la largeur 738).
     Exemples : node scripts/parcours/lancerParLots.js sortie.json "" 3 600 1280
                node scripts/parcours/lancerParLots.js banc.json banc 1 600 738
   Conseils (16/11/2026) : 3 travailleurs au plus, 4 fait échouer des essais lourds à tort (délais de rendu). Les essais de mise en page du CV
   (tirage*, compositions, colonnes*, formes*, enteteAgrandi, enteteDecale) durent de 3 à 15 minutes : prévoir un délai de 2400 secondes.
   Variable d'environnement ATTENTE_FIXE=1 : pauses fixes comme avant le 18/11/2026 (par défaut, l'attente est adaptative : voir `attente` dans parcours_smoke.js).
   Jamais chargé par l'application.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..', '..');
const { ouvrir } = require('./lancerEssais.js');
const { chromium } = require('playwright');
const smoke = fs.readFileSync(path.join(__dirname, 'parcours_smoke.js'), 'utf8');
const sortie = process.argv[2];
let ids = (process.argv[3] || '').split(',').filter(Boolean);
const NB = parseInt(process.argv[4] || '4', 10), DELAI = parseInt(process.argv[5] || '150', 10) * 1000, LARGEUR = parseInt(process.argv[6] || '1280', 10);
if (!ids.length) {
  const ligne = smoke.split('\n').find((l) => l.indexOf('var PARCOURS = {') >= 0);
  ids = [...ligne.matchAll(/(?:^|[{,]\s*)(\w+):\s*parcours\w+/g)].map((m) => m[1]).filter((k) => k !== 'banc');
}
console.log('essais à jouer :', ids.length);
const resultats = {};
if (fs.existsSync(sortie)) { try { Object.assign(resultats, JSON.parse(fs.readFileSync(sortie, 'utf8'))); } catch (e) { /* départ à neuf */ } }
const file = ids.filter((i) => !resultats[i] || process.argv[7] === 'refaire');
async function un(b, id) {
  const t0 = Date.now();
  const p = await ouvrir(b, LARGEUR);
  const errs = [];
  p.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 200)));
  p.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) { errs.push('CONSOLE ' + m.text().slice(0, 160)); } });
  let r;
  try {
    await p.goto('http://app.local/index.html');
    await p.waitForTimeout(3500);
    await p.mouse.click(3, 600);
    await p.waitForTimeout(300);
    if (process.env.ATTENTE_FIXE) { await p.evaluate(() => { window.__attenteFixe = true; }); }
    await p.evaluate(smoke);
    r = await Promise.race([
      p.evaluate(async (i) => await window.__parcours([i]), id),
      new Promise((res) => setTimeout(() => res({ delai: true }), DELAI))
    ]);
  } catch (e) { r = { erreur: String(e.message || e).slice(0, 300) }; }
  const duree = Math.round((Date.now() - t0) / 1000);
  try { await p.context().close(); } catch (e) { /* page déjà fermée */ }
  return { nbOk: r.nbOk || 0, nbEchecs: r.nbEchecs || 0, echecs: (r.echecs || []).map((e) => JSON.stringify(e).slice(0, 400)), delai: !!r.delai, erreur: r.erreur || null, errs: errs.slice(0, 4), duree };
}
(async () => {
  const b = await chromium.launch();
  let i = 0, faits = 0;
  async function ouvrier() {
    while (i < file.length) {
      const id = file[i++];
      resultats[id] = await un(b, id);
      faits++;
      const r = resultats[id];
      console.log((r.delai ? 'DELAI ' : r.erreur ? 'ERREUR ' : r.nbEchecs ? 'ECHEC ' : 'ok ') + id + ' ' + r.nbOk + '/' + (r.nbOk + r.nbEchecs) + ' ' + r.duree + 's (' + faits + '/' + file.length + ')');
      fs.writeFileSync(sortie, JSON.stringify(resultats, null, 1));
    }
  }
  await Promise.all(Array.from({ length: NB }, ouvrier));
  await b.close();
  const tous = Object.entries(resultats);
  console.log('FIN : essais', tous.length, '| avec échec', tous.filter(([, r]) => r.nbEchecs).length, '| délai', tous.filter(([, r]) => r.delai).length, '| erreur', tous.filter(([, r]) => r.erreur).length);
})();
