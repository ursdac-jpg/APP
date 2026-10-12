// Genere outils/base_fiches.js : la base des fiches de « Comprendre le cadre » pour l'outil de veille.
//
// Pourquoi : l'outil de veille (outils/veille.html) s'ouvre en double-cliquant le fichier, sans serveur ;
// un navigateur interdit alors de lire d'autres fichiers du disque, d'ou l'ancienne fenetre « choisir les
// fichiers .md a la main ». Ce script ecrit tout le contenu des fiches dans UN fichier .js que la page
// charge avec <script src>, ce qui marche aussi en double-clic.
//
// Usage :   node scripts/genererBaseVeille.js
// A relancer apres toute modification d'une fiche (le double-clic « Mettre a jour la base de l'outil de
// veille.bat » le fait). La source de verite reste les fichiers .md ; ce fichier est une copie generee.

var fs = require('fs');
var path = require('path');

var RACINE = path.join(__dirname, '..');
var CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
var SORTIE = path.join(RACINE, 'outils', 'base_fiches.js');

function dateDuJour() {
  var d = new Date();
  var p = function (n) { return (n < 10 ? '0' : '') + n; };
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}

var fiches = [];
fs.readdirSync(CONTENU).sort().forEach(function (rayon) {
  var dossier = path.join(CONTENU, rayon);
  if (!fs.statSync(dossier).isDirectory()) { return; }
  if (rayon === 'balayage' || rayon === 'methode') { return; }
  fs.readdirSync(dossier).sort().forEach(function (nom) {
    if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
    var texte = fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n');
    fiches.push({ fichier: nom, texte: texte });
  });
});

var contenu = '// FICHIER GENERE par scripts/genererBaseVeille.js : ne pas modifier a la main.\n'
  + '// Copie des fiches de modules/comprendre-le-cadre/contenu/ pour outils/veille.html.\n'
  + 'window.BASE_VEILLE = ' + JSON.stringify({ genere: dateDuJour(), fiches: fiches }) + ';\n';
fs.writeFileSync(SORTIE, contenu, 'utf8');
console.log('outils/base_fiches.js ecrit : ' + fiches.length + ' fiches, ' + Math.round(contenu.length / 1024) + ' Ko.');
