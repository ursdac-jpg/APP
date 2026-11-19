'use strict';
/* ============================================================
   scripts/importRome/ajouterSavoirEtreFiches.js
   Ajoute aux fichiers data/rome/fiche_*.js DÉJÀ PRODUITS le champ « e » : les savoir-être professionnels OFFICIELS du ROME (France Travail) de chaque code
   (au plus 5 par métier, 16 libellés différents en tout). Les fiches complètes n'en avaient pas ; les listes courtes de data/metiersRome.js (plafonnées à 4,
   mêlées de mots tirés des compétences) ne sont PAS touchées : elles servent au CV, à la lettre et aux prompts.
   Ne modifie rien d'autre dans les fiches. Idempotent. À relancer après un nouveau paquet ROME :
     node scripts/importRome/ajouterSavoirEtreFiches.js <dossier CSV ROME>
   (genererMetiersRome.js produit le même champ « e » quand il régénère les fiches en entier.)
   ============================================================ */
const fs = require('fs');
const path = require('path');
const { chargerRome, libelleSavoirEtre } = require('./lireRome.js');

const dossierCsv = process.argv[2];
if (!dossierCsv) { console.error('Indiquez le dossier du paquet CSV du ROME.'); process.exit(1); }
const rome = chargerRome(dossierCsv);
const dossier = path.join(__dirname, '..', '..', 'data', 'rome');
const fichiers = fs.readdirSync(dossier).filter((f) => /^fiche_[A-N]\.js$/.test(f)).sort();
// En-tête jusqu'à la fin de la ligne qui ferme le commentaire (fins de ligne Windows possibles : le saut de ligne est gardé tel quel)
const FIN_ENTETE = /^[\s\S]*?\*\/\r?\n/;

let nbFiches = 0, nbSansSavoirEtre = 0, nbLibelles = 0;
fichiers.forEach((f) => {
  const chemin = path.join(dossier, f);
  const donnees = require(chemin).FICHES_ROME_LETTRE;
  Object.keys(donnees).forEach((code) => {
    const source = rome.codes[code];
    delete donnees[code].e;
    const liste = source && source.savoirEtre ? source.savoirEtre.map(libelleSavoirEtre) : [];
    if (liste.length) { donnees[code].e = liste; nbFiches++; nbLibelles += liste.length; } else { nbSansSavoirEtre++; }
  });
  const ancien = fs.readFileSync(chemin, 'utf8');
  let entete = ancien.match(FIN_ENTETE)[0];
  if (entete.indexOf('e = savoir-être') === -1) {
    entete = entete.replace('ri = lettres RIASEC du métier (majeure puis mineure).', 'ri = lettres RIASEC du métier (majeure puis mineure), e = savoir-être professionnels officiels du ROME (au plus 5, libellés du ROME, orthographe corrigée).');
  }
  const corps = '(function (g) {\n  var P = g.FICHES_ROME = g.FICHES_ROME || {};\n  var donnees = ' + JSON.stringify(donnees) + ';\n  Object.keys(donnees).forEach(function (c) { P[c] = donnees[c]; });\n  if (typeof module !== "undefined" && module.exports) { module.exports = { FICHES_ROME_LETTRE: donnees }; }\n})(typeof window !== "undefined" ? window : globalThis);\n';
  fs.writeFileSync(chemin, entete + corps);
});
console.log('Fiches avec savoir-être officiels : ' + nbFiches + ' (' + nbLibelles + ' libellés posés) ; fiches sans savoir-être dans le ROME : ' + nbSansSavoirEtre);
