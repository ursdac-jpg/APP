'use strict';
// Produit modules/comprendre-les-chiffres/donnees/bmo-metiers.json : pour chaque département, les 10 métiers
// les plus cités par les employeurs dans l'enquête « Besoins en main-d'œuvre » (France Travail).
// Source lue : le fichier de l'enquête déjà converti par l'outil de prospection (dossier voisin PROSPECTION/donnees/bmo.json).
// Mise à jour une fois par an (enquête publiée au printemps) : voir docs/VERIFICATIONS_A_DATE_FIXE.md.
// Usage : node scripts/genereBmoMetiers.js [publie_le AAAA-MM-JJ] [fichier bmo.json]
//   ou   : node scripts/genereBmoMetiers.js --xlsx AAAA-MM-JJ   (nouvelle enquête : lit le fichier .xlsx le plus récent de
//          PROSPECTION/donnees_externes/bmo, rafraîchit aussi la copie lue par l'outil de prospection, puis écrit le fichier du module)
// Les nombres masqués par le secret statistique sont ignorés : tous les chiffres affichés sont donc des minimums.
const fs = require('fs');
const path = require('path');

const NOMS_DEPARTEMENTS = { '24': 'Dordogne', '87': 'Haute-Vienne' };
const SORTIE = path.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'donnees', 'bmo-metiers.json');

function topMetiers(lignes, dep, combien) {
  const m = {};
  for (const l of lignes) {
    const nom = l[1], de = l[2], met = l[5], s = l[7];
    if (de !== dep || met == null) { continue; }
    const o = m[nom] = m[nom] || { met: 0, s: 0 };
    o.met += met;
    if (s != null) { o.s += s; }
  }
  return Object.keys(m)
    .map(function (k) { return { nom: k, met: m[k].met, s: Math.min(m[k].s, m[k].met) }; })
    .sort(function (a, b) { return b.met - a.met || (a.nom < b.nom ? -1 : 1); })
    .slice(0, combien);
}

function genere(donnees, publieLe, verifieLe) {
  const sortie = {
    annee: donnees.annee,
    publie_le: publieLe,
    verifie_le: verifieLe,
    source: {
      nom: 'France Travail, enquête Besoins en main-d’œuvre ' + donnees.annee,
      url: 'https://statistiques.francetravail.org/bmo'
    },
    departements: {}
  };
  Object.keys(NOMS_DEPARTEMENTS).forEach(function (dep) {
    sortie.departements[dep] = { nom: NOMS_DEPARTEMENTS[dep], metiers: topMetiers(donnees.lignes, dep, 10) };
  });
  return sortie;
}

if (require.main === module) {
  const aujourdhui = new Date();
  const z = function (n) { return (n < 10 ? '0' : '') + n; };
  const iso = aujourdhui.getFullYear() + '-' + z(aujourdhui.getMonth() + 1) + '-' + z(aujourdhui.getDate());
  const prospection = path.join(__dirname, '..', '..', 'PROSPECTION');
  let publieLe, donnees;
  if (process.argv[2] === '--xlsx') {
    publieLe = process.argv[3];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(publieLe))) { console.error('Indiquez la date de publication de l’enquête : node scripts/genereBmoMetiers.js --xlsx AAAA-MM-JJ'); process.exit(1); }
    const dossier = path.join(prospection, 'donnees_externes', 'bmo');
    const fichiers = fs.existsSync(dossier) ? fs.readdirSync(dossier).filter(function (x) { return /\.xlsx$/i.test(x); }).sort().reverse() : [];
    if (!fichiers.length) { console.error('Aucun fichier .xlsx dans ' + dossier); process.exit(1); }
    donnees = require(path.join(prospection, 'lib', 'bmo.js')).convertirXlsx(fs.readFileSync(path.join(dossier, fichiers[0])));
    donnees.fichier = fichiers[0];
    fs.writeFileSync(path.join(prospection, 'donnees', 'bmo.json'), JSON.stringify(donnees), 'utf8');
    console.log('Fichier lu : ' + fichiers[0]);
  } else {
    publieLe = process.argv[2] || '2026-04-21';
    donnees = JSON.parse(fs.readFileSync(process.argv[3] || path.join(prospection, 'donnees', 'bmo.json'), 'utf8'));
  }
  fs.writeFileSync(SORTIE, JSON.stringify(genere(donnees, publieLe, iso), null, 2) + '\n', 'utf8');
  console.log('Écrit : ' + SORTIE + ' (enquête ' + donnees.annee + ', publiée le ' + publieLe + ', vérifiée le ' + iso + ')');
}

module.exports = { genere, topMetiers };
