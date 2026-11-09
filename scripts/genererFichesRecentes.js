// Génère modules/comprendre-le-cadre/donnees/fiches-recentes.json : les fiches de « Comprendre le cadre » ajoutées ou mises à jour, pour le bloc « Dans les fiches »
// de « Ce qui a changé récemment » (consigne 186 de Denis, 09/11/2026).
//
// SOURCE UNIQUE : le journal outils/journal_modifications.txt, que l'outil de veille remplit à chaque dépôt (« date heure | cadre | identifiant | ajoutée ou modifiée | phrase »).
// L'application ne lit pas le journal (il porte des notes de travail) : elle lit ce petit fichier généré, qui ne garde que l'identifiant, le rayon, le titre et les dates.
// Le fichier ne se modifie jamais à la main : tests/fichesRecentes.test.js échoue s'il n'est plus identique à ce que ce script produit.
//
// Usage :  node scripts/genererFichesRecentes.js            (écrit le fichier)
//          node scripts/genererFichesRecentes.js --verifier (compare seulement, code de sortie 1 s'il diffère)
// Se relance tout seul avec genererBaseVeille.js (donc à chaque dépôt de l'outil de veille).

'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const JOURNAL = path.join(RACINE, 'outils', 'journal_modifications.txt');
const CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
const SORTIE = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'donnees', 'fiches-recentes.json');

// Où se trouve chaque fiche et quel est son titre : { identifiant : { rayon, titre } }.
function fichesExistantes() {
  const sortie = {};
  fs.readdirSync(CONTENU).sort().forEach(function (rayon) {
    const dossier = path.join(CONTENU, rayon);
    if (!fs.statSync(dossier).isDirectory() || rayon === 'balayage' || rayon === 'methode') { return; }
    fs.readdirSync(dossier).sort().forEach(function (nom) {
      if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
      const texte = fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n');
      const m = texte.match(/^titre:\s*(.+)$/m);
      sortie[nom.replace(/\.md$/, '')] = { rayon: rayon, titre: m ? m[1].trim().replace(/^"|"$/g, '') : nom.replace(/\.md$/, '') };
    });
  });
  return sortie;
}

// Les lignes du journal qui concernent les fiches du cadre : une entrée par fiche, avec sa dernière date et, s'il y en a une, sa date d'ajout.
function construire(texteJournal) {
  const existantes = fichesExistantes();
  const par = {};
  String(texteJournal === undefined ? (fs.existsSync(JOURNAL) ? fs.readFileSync(JOURNAL, 'utf8') : '') : texteJournal).split(/\r?\n/).forEach(function (ligne) {
    const c = ligne.split(' | ');
    if (c.length < 4 || c[1].trim() !== 'cadre') { return; }
    const date = c[0].trim().slice(0, 10), id = c[2].trim(), action = c[3].trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !existantes[id] || (action !== 'ajoutée' && action !== 'modifiée')) { return; }
    const e = par[id] || (par[id] = { id: id, rayon: existantes[id].rayon, titre: existantes[id].titre, date: '', ajoutee: '' });
    if (date > e.date) { e.date = date; }
    if (action === 'ajoutée' && (!e.ajoutee || date < e.ajoutee)) { e.ajoutee = date; }
  });
  return Object.keys(par).map(function (k) { return par[k]; }).sort(function (a, b) { return a.date < b.date ? 1 : (a.date > b.date ? -1 : (a.id < b.id ? -1 : 1)); });
}

function texteSortie(liste) { return JSON.stringify(liste, null, 1) + '\n'; }

function ecrire() {
  const liste = construire();
  fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
  fs.writeFileSync(SORTIE, texteSortie(liste), 'utf8');
  return liste.length;
}

module.exports = { construire: construire, texteSortie: texteSortie, ecrire: ecrire, SORTIE: SORTIE };

if (require.main === module) {
  if (process.argv.indexOf('--verifier') !== -1) {
    const actuel = fs.existsSync(SORTIE) ? fs.readFileSync(SORTIE, 'utf8').replace(/\r\n/g, '\n') : '';
    if (actuel !== texteSortie(construire())) { console.error('fiches-recentes.json n\'est plus à jour : relancer node scripts/genererFichesRecentes.js'); process.exit(1); }
    console.log('fiches-recentes.json à jour.');
  } else {
    console.log(ecrire() + ' fiches récentes écrites dans ' + path.relative(RACINE, SORTIE));
  }
}
