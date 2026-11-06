/* Controle des cibles de l'aide guidee : liste les etapes (pages et fenetres) dont AUCUN selecteur n'a de trace dans le code (une promesse sans bouton).
   Utilisation : node scripts/parcours/controle_cibles_aide.js  (0 attendu). Ne dit rien des etats : voir inventaire_aide.js pour l'ecran. */
const { chromium } = require('playwright');
const { ouvrir } = require('./lancerEssais.js');
const fs = require('fs'), path = require('path');
function lireTout(dir, sortie) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (f.name === 'node_modules' || f.name === 'A_envoyer_sur_GitHub' || f.name === 'docs' || f.name === 'tests' || f.name === 'scripts') continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) lireTout(p, sortie);
    else if (/\.(js|html|css|txt|md)$/.test(f.name) && !/^_tmp/.test(f.name)) sortie.push(fs.readFileSync(p, 'utf8'));
  }
  return sortie;
}
(async () => {
  const b = await chromium.launch(); const p = await ouvrir(b);
  await p.goto('http://app.local/index.html'); await p.waitForTimeout(3500);
  const liste = await p.evaluate(() => {
    const o = [];
    Object.keys(AIDE_PAGES).forEach(r => (AIDE_PAGES[r] || []).forEach(e => o.push(['PAGE', r, e.selecteur, (e.titre || '')])));
    Object.keys(AIDE_FENETRES).forEach(r => (AIDE_FENETRES[r] || []).forEach(e => o.push(['FENETRE', r, e.selecteur, (e.titre || '')])));
    return o;
  });
  await b.close();
  const src = lireTout('.', []).join('\n').split('\n').filter(l => !/selecteur:|cible:/.test(l)).join('\n');
  const morts = [];
  const vivant = (j) => { let c = j; if (j[0] === '#' || j[0] === '.') c = j.slice(1); else c = j.slice(1).split(/[=\]^$*~|]/)[0]; if (!c) return true; if (/^fcRacine/.test(c)) return src.includes("'fcRacine' +"); if (src.includes(c)) return true; const k = c.lastIndexOf('_'); return k > 3 && src.includes(c.slice(0, k + 1)); };
  for (const [t, r, sel, titre] of liste) {
    const alts = sel.split(',').map(a => a.trim());
    const ok = alts.some(a => (a.match(/#[A-Za-z0-9_-]+|\.[A-Za-z][A-Za-z0-9_-]*|\[[a-z-]+[^\]]*\]/g) || []).every(vivant));
    if (!ok) morts.push(t + ' | ' + r + ' | ' + sel + ' | ' + titre);
  }
  console.log('etapes', liste.length, 'sans trace dans le code', morts.length);
  morts.forEach(m => console.log(m));
})();
