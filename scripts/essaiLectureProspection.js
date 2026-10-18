// Essai de lecture de l'API publique « Recherche d'entreprises » : toutes les entreprises actives ayant un etablissement dans UNE commune, section d'activite par section.
// Usage : node scripts/essaiLectureProspection.js <fichier-de-sortie.json> [code-commune INSEE, defaut 24037 = Bergerac]
// ATTENTION : la sortie contient des noms de dirigeants (donnees de personnes) : ne jamais l'ecrire dans le depot ; la mettre hors du depot ou dans un dossier ignore par git.
// Constats du 2026-10-17 : voir docs/ESSAI_LECTURE_PROSPECTION_BERGERAC_2026-10-17.md.
const fs = require('fs'); const path = require('path');
const SORTIE = process.argv[2];
const COMMUNE = process.argv[3] || '24037';
const SECTIONS = 'ABCDEFGHIJKLMNOPQRSTU'.split('');
const attente = (ms) => new Promise(r => setTimeout(r, ms));
async function page(section, n) {
  const u = 'https://recherche-entreprises.api.gouv.fr/search?code_commune=' + COMMUNE + '&section_activite_principale=' + section + '&etat_administratif=A&per_page=25&page=' + n;
  for (let t = 0; t < 4; t++) {
    const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (r.status === 429) { await attente(1500 * (t + 1)); continue; }
    if (!r.ok) throw new Error(section + ' p' + n + ' ' + r.status);
    return r.json();
  }
  throw new Error('429 persistant');
}
(async () => {
  const toutes = {}; const parSection = {};
  for (const s of SECTIONS) {
    let n = 1, total = null;
    while (true) {
      const j = await page(s, n);
      if (total === null) { total = j.total_results; parSection[s] = total; }
      (j.results || []).forEach(e => { toutes[e.siren] = e; });
      if (n >= j.total_pages || n >= 400) break;
      n++; await attente(150);
    }
    console.log(s, parSection[s], 'cumul', Object.keys(toutes).length);
  }
  fs.writeFileSync(SORTIE, JSON.stringify({ parSection, entreprises: Object.values(toutes) }));
  console.log('FIN', Object.keys(toutes).length);
})().catch(e => console.log('ERR', e.message));
