/* ============================================================
   capacites_ecrire.js : ecrit modules/cv-pdf-html/cvPdfCapacitesModeles.js a partir de scripts/rendu/capacites.json
   ------------------------------------------------------------
   La table des CAPACITES PAR MODELE est MESUREE par le banc de rendu (scripts/rendu/banc.js, window.__rendu.capacites), jamais ecrite a la main :
     1. navigateur de test (fenetre 738, page rechargee) : (0, eval)(await (await fetch('/scripts/rendu/banc.js?' + Date.now())).text());
                                                           await window.__rendu.capacites('regenerer');   // ecrit scripts/rendu/sortie/capacites.json
     2. copier scripts/rendu/sortie/capacites.json vers scripts/rendu/capacites.json
     3. node scripts/rendu/capacites_ecrire.js
   Le test tests/capacitesModeles.test.js verifie que le fichier genere suit le registre du banc.
   ============================================================ */
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..', '..');
const source = path.join(__dirname, 'capacites.json');
const cible = path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfCapacitesModeles.js');

const table = JSON.parse(fs.readFileSync(source, 'utf8'));
const cles = Object.keys(table).sort((a, b) => (a === 'standard' ? -1 : b === 'standard' ? 1 : a.localeCompare(b)));
const tri = {};
cles.forEach((c) => { tri[c] = table[c]; });

const entete = [
  '// GENERE par scripts/rendu/capacites_ecrire.js a partir de scripts/rendu/capacites.json (mesure par le banc de rendu : ne pas editer a la main, relancer le banc).',
  '// TABLE DES CAPACITES PAR MODELE (chantier docs/CHANTIER_NOUVEAUX_MODELES_ET_OPTIONS_CV_2026-10-20.md, tache A0).',
  '// Regle de Denis (2026-10-20) : un modele ne PROPOSE que les options qu\'il permet, jamais une option impossible a cliquer.',
  '// Cle : "standard", "sobre:<variante>", "creatif:<id>". Valeurs :',
  '//   bandeau, colonne : "natif" (present d\'office) | "ajoutable" (un reglage le fait apparaitre) | "non" ;',
  '//   formesBandeau, formesColonne : formes de bord que le modele sait faire (liste vide = aucun choix de forme).',
  '// Les formes decoratives (calque transparent) vont a tous les modeles : pas de ligne ici.',
  ''
].join('\n');

const lecteurs = `
// Capacites d'un modele (null si le modele est inconnu : l'appelant ne propose alors rien de special).
function _cvCapacitesModele(cle) { return (typeof _CV_CAPACITES_MODELES !== 'undefined' && _CV_CAPACITES_MODELES[cle]) || null; }
// Le modele PEUT-IL avoir un bandeau (natif ou ajoutable) / une colonne coloree ? kind : 'bandeau' ou 'colonne'.
function _cvModelePermet(cle, kind) { var c = _cvCapacitesModele(cle); return !!c && (c[kind] === 'natif' || c[kind] === 'ajoutable'); }
// Formes de bord que le modele propose pour son bandeau ou sa colonne (copie ; liste vide = aucun choix).
function _cvFormesPourModele(cle, kind) { var c = _cvCapacitesModele(cle); var l = c && (kind === 'bandeau' ? c.formesBandeau : c.formesColonne); return l ? l.slice() : []; }
`;

const corps = 'var _CV_CAPACITES_MODELES = ' + JSON.stringify(tri, null, 1) + ';\n';
fs.writeFileSync(cible, entete + corps + lecteurs, 'utf8');
console.log('ecrit : ' + path.relative(racine, cible) + ' (' + cles.length + ' modeles)');
