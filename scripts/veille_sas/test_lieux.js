// Teste TOUS les sites des structures du sas (outils/sas/lieux.sas.txt) : réponse, titre, nom de la structure présent dans la page.
// Usage : node scripts/veille_sas/test_lieux.js [fichier-resultat.json]   (14 requêtes en parallèle, quelques minutes)
// Ne modifie aucun fichier du sas : le résultat sert à décider quoi chercher au cloud et quoi ouvrir à la main.
const fs = require('fs'), path = require('path'), os = require('os');
const R = path.join(__dirname, '..', '..'); const sortie = process.argv[2] || path.join(os.tmpdir(), 'test_lieux.json');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const items = [];
fs.readFileSync(path.join(R, 'outils/sas/lieux.sas.txt'), 'utf8').split(/\r?\n/).forEach(l => {
  if (!l.trim() || l[0] === '#') return; const d = l.split('|').map(x => x.trim()); if (d.length < 8 || !/^https:\/\//.test(d[7])) return;
  items.push({ id: d[0], nom: d[2], url: d[7] });
});
const mots = nom => norm(nom).split(' ').filter(w => w.length > 3 && !['association', 'centre', 'maison', 'service', 'services', 'departement', 'departemental', 'haute', 'vienne', 'dordogne', 'limoges', 'perigueux', 'nationale', 'social', 'sociale'].includes(w));
let i = 0; const res = [];
async function un(it) {
  try {
    const r = await fetch(it.url, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(12000) });
    const t = (await r.text()).slice(0, 60000); const m = t.match(/<title[^>]*>([^<]*)/i); const titre = m ? m[1].trim() : '';
    const ws = mots(it.nom); const corps = norm(titre + ' ' + t.slice(0, 30000));
    it.statut = r.status; it.final = r.url; it.titre = titre.slice(0, 60); it.nomPresent = ws.length ? ws.some(w => corps.includes(w)) : null;
  } catch (e) { it.statut = 'ERR'; it.err = (e.cause && e.cause.code) || e.message.slice(0, 40); }
  res.push(it);
}
async function worker() { while (i < items.length) await un(items[i++]); }
(async () => { await Promise.all(Array.from({ length: 14 }, worker)); fs.writeFileSync(sortie, JSON.stringify(res, null, 1)); console.log(res.length + ' adresses testées -> ' + sortie); })();
