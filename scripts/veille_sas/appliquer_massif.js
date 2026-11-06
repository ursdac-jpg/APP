// Retire du sas les sites et pages de recrutement dont le nom de domaine n'existe pas (vérifié DEUX fois par DNS) ou dont la page de recrutement est en 404/410.
// Usage : node scripts/veille_sas/appliquer_massif.js [fichier-resultat.json]    ;  DRY=1 pour simuler sans écrire.
// Ne touche qu'aux colonnes site et recrutement. À lancer APRÈS test_massif.js, puis valider_sas.js, npm test, commit du sas seul.
const fs = require('fs'), dns = require('dns').promises, path = require('path'), os = require('os');
const R = path.join(__dirname, '..', '..'); const entree = process.argv[2] || path.join(os.tmpdir(), 'test_massif.json');
const res = JSON.parse(fs.readFileSync(entree, 'utf8'));
(async () => {
  const hotes = [...new Set(res.filter(x => x.statut === 'ERR' && x.err === 'ENOTFOUND').map(x => new URL(x.url).hostname))]; const mort = {};
  await Promise.all(hotes.map(async h => { let ok = false; for (let t = 0; t < 2; t++) { try { await dns.lookup(h); ok = true; break; } catch (e) {} } mort[h] = !ok; }));
  const retirer = new Set();
  res.forEach(x => { const k = x.id + '|' + x.champ;
    if (x.statut === 'ERR' && x.err === 'ENOTFOUND' && mort[new URL(x.url).hostname]) retirer.add(k);
    else if (x.champ === 'recrutement' && (x.statut === 404 || x.statut === 410)) retirer.add(k); });
  const f = path.join(R, 'outils/sas/employeurs.sas.txt'); const t = fs.readFileSync(f, 'utf8'); const eol = t.includes('\r\n') ? '\r\n' : '\n'; let ns = 0, nr = 0;
  const out = t.split(/\r?\n/).map(l => { const c = l.split('|'); if (c.length < 10) return l; const id = c[0].trim(); let ch = false;
    if (retirer.has(id + '|site') && c[6].trim()) { c[6] = ' '; ns++; ch = true; }
    if (retirer.has(id + '|recrutement') && c[7].trim()) { c[7] = ' '; nr++; ch = true; }
    return ch ? c.join('|') : l; });
  if (!process.env.DRY) fs.writeFileSync(f, out.join(eol), 'utf8');
  console.log('sites retirés', ns, '| pages de recrutement retirées', nr);
})();
