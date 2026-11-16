const L = require('./lettreRapide.js');
module.exports = { nom: 'ficheRapide', jouer: (a, j) => L.jouerParcours(a, j, 2) };
