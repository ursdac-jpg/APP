// Génère data/indexFichesCadre.js : l'index des fiches de « Comprendre le cadre » lu par la barre de recherche de l'accueil (consigne 101).
//
// Pourquoi : la recherche de l'accueil ne charge pas les rayons (un chargement paresseux à la demande). Elle lit donc cet index, petit et statique :
// pour chaque fiche, son identifiant, son rayon, son titre, sa phrase « Utile si… », ses mots-clés et son territoire. Jamais le corps de la fiche.
// La source de vérité reste les fichiers .md ; ce fichier est une copie générée (un test vérifie qu'elle est à jour).
//
// Usage :   node scripts/genererIndexFichesCadre.js
// À relancer après toute modification d'une fiche (le double-clic « Mettre a jour la base de l'outil de veille.bat » le fait aussi).
'use strict';

const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const CONTENU = path.join(RACINE, 'modules', 'comprendre-le-cadre', 'contenu');
const SORTIE = path.join(RACINE, 'data', 'indexFichesCadre.js');

// Les dossiers qui ne sont pas des rayons de fiches (balayage = notes de veille, methode = textes du module).
const DOSSIERS_IGNORES = ['balayage', 'methode'];

function construireIndex(parserFiche) {
  const index = [];
  fs.readdirSync(CONTENU).sort().forEach(function (rayon) {
    const dossier = path.join(CONTENU, rayon);
    if (!fs.statSync(dossier).isDirectory() || DOSSIERS_IGNORES.indexOf(rayon) !== -1) { return; }
    fs.readdirSync(dossier).sort().forEach(function (nom) {
      if (!/\.md$/.test(nom) || /^README\.md$/i.test(nom) || /\.collecte\.md$/.test(nom)) { return; }
      const f = parserFiche(fs.readFileSync(path.join(dossier, nom), 'utf8').replace(/\r\n/g, '\n'));
      if (!f || !f.id || !f.titre || f.statut !== 'actif') { return; }
      index.push({ id: f.id, rayon: f.rayon || rayon, titre: f.titre, pour_qui: f.pour_qui || '', tags: f.tags || [], territoire: f.territoire || 'national' });
    });
  });
  return index;
}

function contenuFichier(index) {
  return '// FICHIER GENERE par scripts/genererIndexFichesCadre.js : ne pas modifier a la main.\n'
    + '// Index des fiches de modules/comprendre-le-cadre/contenu/ pour la barre de recherche de l\'accueil (consigne 101).\n'
    + 'var INDEX_FICHES_CADRE = [\n' + index.map(function (f) { return JSON.stringify(f); }).join(',\n') + '\n];\n';
}

if (require.main === module) {
  require('../tests/_domStub').installerStubDom();
  const M = require('../modules/comprendre-le-cadre/index.js');
  const index = construireIndex(M._comprendreLeCadreParserFiche);
  fs.writeFileSync(SORTIE, contenuFichier(index), 'utf8');
  console.log('Index des fiches du Cadre : ' + index.length + ' fiches écrites dans data/indexFichesCadre.js');
}

module.exports = { construireIndex, contenuFichier, SORTIE };
