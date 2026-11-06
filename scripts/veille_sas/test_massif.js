// Teste TOUS les sites et pages de recrutement du sas des employeurs qui ne viennent pas d'une vérification (source sans « Denis » ni « testés »).
// Usage : node scripts/veille_sas/test_massif.js [fichier-resultat.json]   (14 requêtes en parallèle, environ 3 minutes pour 850 adresses)
// Résultat : un tableau JSON (id, nom, champ site/recrutement, url, statut, titre, nomPresent). Sert ensuite à appliquer_massif.js.
const fs = require('fs'), path = require('path'), os = require('os');
const R = path.join(__dirname, '..', '..'); const sortie = process.argv[2] || path.join(os.tmpdir(), 'test_massif.json');
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const items = [];
fs.readFileSync(path.join(R, 'outils/sas/employeurs.sas.txt'), 'utf8').split(/\r?\n/).forEach(l => {
  if (!l.trim() || l[0] === '#') return; const d = l.split('|').map(x => x.trim()); if (d.length < 10 || /Denis|testés/.test(d[9])) return;
  if (d[6]) items.push({ id: d[0], nom: d[2], nat: d[1], champ: 'site', url: d[6] });
  if (d[7]) items.push({ id: d[0], nom: d[2], nat: d[1], champ: 'recrutement', url: d[7] });
});
const mots = nom => norm(nom).split(' ').filter(w => w.length > 3 && !['groupe', 'etablissements', 'ets', 'entreprise', 'societe', 'cabinet', 'agence', 'maison', 'association', 'centre'].includes(w));
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
