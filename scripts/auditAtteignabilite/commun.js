const fs = require('fs'), path = require('path'), vm = require('vm');
const RACINE = path.join(__dirname, '..', '..');
['data/actionsProfessionnelles.js', 'data/personnesMaterielsLieux.js', 'data/environnementsTravail.js'].forEach((f) => vm.runInThisContext(fs.readFileSync(path.join(RACINE, f), 'utf8'), { filename: f }));
const M = require(path.join(RACINE, 'data/metiers.js'));
const L = require(RACINE + '/modules/comprendre-les-metiers/logique.js');
const C = require(RACINE + '/modules/comprendre-les-metiers/parMetierCalcul.js');
const { pmdDonnees } = require(RACINE + '/modules/comprendre-les-metiers/parMetierDonnees.js');
const CAT = { activites: vm.runInThisContext('CATALOGUE_PERSONNES_MATERIELS_LIEUX'), actions: vm.runInThisContext('CATALOGUE_ACTIONS_PRO'), environnement: vm.runInThisContext('CATALOGUE_ENVIRONNEMENTS_TRAVAIL') };
module.exports = { M, L, C, pmdDonnees, CAT, RACINE };
