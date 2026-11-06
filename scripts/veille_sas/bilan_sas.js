// Bilan réel du sas : pour chaque fichier (lieux, employeurs), nombre de fiches prêtes (prévalidées), déjà regardées sans résultat clair, jamais regardées.
// À lancer AVANT de proposer un message à l'assistant ou d'annoncer ce qu'il reste (leçon 9.106). Usage : node scripts/veille_sas/bilan_sas.js
'use strict';
const fs = require('fs');
const sas = require('../../outils/veilleSas.js');
['lieux', 'employeurs'].forEach(function (f) {
  const cartes = sas.lister(f, fs.readFileSync('outils/sas/' + f + '.sas.txt', 'utf8'), {}).lignes;
  const prev = new Set(fs.readFileSync('outils/sas/prevalidees.txt', 'utf8').split('\n').filter(function (l) { return l.indexOf(f + ' | ') === 0; }).map(function (l) { return l.split(' | ')[1]; }));
  const deja = new Set(fs.readFileSync('outils/sas/deja-regardees.txt', 'utf8').split('\n').filter(function (l) { return l && l[0] !== '#'; }).map(function (l) { return l.split(' | ')[0]; }));
  let p = 0, d = 0, n = 0;
  cartes.forEach(function (c) { if (prev.has(c.id)) { p++; } else if (deja.has(c.id)) { d++; } else { n++; } });
  console.log(f + ' : ' + cartes.length + ' fiches dans le sas | prêtes ' + p + ' | déjà regardées ' + d + ' | jamais regardées ' + n);
});
