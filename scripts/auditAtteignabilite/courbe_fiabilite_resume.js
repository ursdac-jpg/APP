'use strict';
// Résume les courbes de fiabilité : un tableau par chemin. À lancer après courbe_fiabilite_chemin1.js et courbe_fiabilite_chemin2.js (toutes les tranches).
const fs = require('fs');
const med = (a) => { a = a.slice().sort((x, y) => x - y); return a.length ? a[a.length >> 1] : 0; };
const lire = (fichiers) => fichiers.filter((f) => fs.existsSync(f)).reduce((t, f) => t.concat(JSON.parse(fs.readFileSync(f))), []);
const tableau = (titre, v) => {
  console.log('== ' + titre);
  console.log('choix | essais | métier dans les 10 premiers | premier | liste (médiane) | à égalité en tête (médiane) | % de tête (médiane) | % du métier (médiane)');
  for (let k = 1; k <= 10; k++) {
    const x = v.filter((e) => e.k === k); if (!x.length) { continue; }
    const p = (f) => (x.filter(f).length / x.length * 100).toFixed(0) + ' %';
    console.log(k + ' | ' + x.length + ' | ' + p((e) => e.rang >= 0 && e.rang < 10) + ' | ' + p((e) => e.rang === 0) + ' | ' + med(x.map((e) => e.n)) + ' | ' + med(x.map((e) => e.ex)) + ' | ' + med(x.map((e) => e.top)) + ' | ' + med(x.map((e) => e.pct)));
  }
};
tableau('Chemin 2', lire([0, 1, 2, 3, 4, 5].map((i) => 'courbe2_' + i + '.json')));
tableau('Chemin 1', lire(['courbe1.json']));
