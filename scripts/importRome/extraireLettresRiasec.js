/* ============================================================
   scripts/importRome/extraireLettresRiasec.js : écrit data/lettresRiasecRome.js
   ------------------------------------------------------------
   Les lettres RIASEC de chaque métier (champ `ri` des fiches du ROME : majeure puis mineure) vivent dans les 14 fichiers
   data/rome/fiche_A.js à fiche_N.js, qui pèsent 9 Mo et sont chargés à la demande. Le module « Explorer les métiers »
   a besoin de ces seules lettres pour proposer des métiers à partir du code de la personne : on les extrait ici dans un
   petit fichier (environ 30 Ko).

   À relancer après chaque régénération des fiches du ROME (node scripts/importRome/genererMetiersRome.js ...) :
     node scripts/importRome/extraireLettresRiasec.js
   Le test tests/lettresRiasecRome.test.js échoue si le petit fichier n'est plus à jour.
   ============================================================ */
const fs = require('fs');
const path = require('path');

function lireLettres(racine) {
  const g = { };
  g.window = g;
  g.FICHES_ROME = {};
  fs.readdirSync(path.join(racine, 'data/rome')).filter((f) => /^fiche_[A-N]\.js$/.test(f)).sort().forEach((f) => {
    new Function('window', fs.readFileSync(path.join(racine, 'data/rome', f), 'utf8'))(g);
  });
  const sortie = {};
  Object.keys(g.FICHES_ROME).sort().forEach((code) => {
    const ri = g.FICHES_ROME[code].ri;
    if (ri) { sortie[code] = ri; }
  });
  return sortie;
}

function contenu(lettres) {
  const codes = Object.keys(lettres);
  const lignes = [];
  for (let i = 0; i < codes.length; i += 8) {
    lignes.push('  ' + codes.slice(i, i + 8).map((c) => JSON.stringify(c) + ': ' + JSON.stringify(lettres[c])).join(', '));
  }
  return `/* ============================================================
   data/lettresRiasecRome.js : FICHIER GÉNÉRÉ, NE JAMAIS LE MODIFIER À LA MAIN.
   Les lettres RIASEC de chaque métier du ROME (France Travail), majeure puis mineure : ${codes.length} codes.
   Extrait des fiches data/rome/fiche_A.js à fiche_N.js par : node scripts/importRome/extraireLettresRiasec.js
   (à relancer après chaque régénération des fiches ; tests/lettresRiasecRome.test.js vérifie qu'il est à jour).
   Sert au module « Explorer les métiers » : proposer des métiers sans charger 9 Mo de fiches.
   ============================================================ */
var LETTRES_RIASEC_ROME = {
${lignes.join(',\n')}
};

if (typeof window !== 'undefined') { window.LETTRES_RIASEC_ROME = LETTRES_RIASEC_ROME; }
if (typeof module !== 'undefined' && module.exports) { module.exports = { LETTRES_RIASEC_ROME: LETTRES_RIASEC_ROME }; }
`;
}

if (require.main === module) {
  const racine = path.join(__dirname, '..', '..');
  const lettres = lireLettres(racine);
  fs.writeFileSync(path.join(racine, 'data/lettresRiasecRome.js'), contenu(lettres), 'utf8');
  console.log('data/lettresRiasecRome.js écrit : ' + Object.keys(lettres).length + ' codes.');
}
module.exports = { lireLettres, contenu };
