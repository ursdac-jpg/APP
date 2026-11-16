// Pourcentage de cohérence des métiers (consigne 410, décisions de Denis du 16/11/2026).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../data/metiers.js');

const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const base = { savoirFaire: [], savoirEtre: [], savoirFaireDeduits: [], savoirEtreDeduits: [], savoirs: [], niveauPersonne: 2 };

test('plus la personne donne de choix, plus le pourcentage monte', () => {
  const fiche = M.baseMetiers.filter((m) => m.nom === 'Conseiller de vente')[0];
  const scoreAvec = (k) => {
    const p = Object.assign({}, base, { actions: [], activites: [], environnement: [] });
    const cles = ['actions', 'activites', 'environnement'];
    let n = 0;
    for (let rang = 0; n < k && rang < 20; rang++) {
      cles.forEach((cle) => { const v = (fiche[cle] || [])[rang]; if (v !== undefined && n < k) { p[cle].push(v); n++; } });
    }
    const r = M.rechercherMetiers(p, 5000).filter((m) => m.nom === fiche.nom)[0];
    return r ? r.score : 0;
  };
  assert.ok(scoreAvec(2) < 55, 'deux choix : le pourcentage reste bas');
  assert.ok(scoreAvec(5) > scoreAvec(2) + 10, 'cinq choix : nettement plus haut que deux');
});

test('le facteur de quantité monte doucement de 0,45 à 1, jamais en dessous ni au-dessus', () => {
  const f = (n, plein) => M.facteurInformation({ actions: new Array(n).fill('x') }, plein);
  assert.ok(Math.abs(f(1) - 0.45) < 1e-9, 'un seul élément : plancher');
  assert.strictEqual(f(30), 1, 'trente éléments : plein');
  assert.strictEqual(f(24, 24), 1, 'la fiche compte 24 éléments : plein dès 24');
  for (let n = 1; n < 30; n++) { assert.ok(f(n + 1) >= f(n), 'le facteur ne baisse jamais quand la personne ajoute un élément'); }
  assert.ok(f(25) - f(24) < f(3) - f(2), 'la montée s’adoucit à l’approche du plein');
});

test('une personne qui a tout ce que la fiche demande atteint 100 %', () => {
  ['Conseiller de vente', 'Cariste', 'Maçon'].forEach((nom) => {
    const fiche = M.baseMetiers.filter((m) => m.nom === nom)[0];
    const p = { niveauPersonne: 5, actions: fiche.actions.slice(), activites: fiche.activites.slice(), environnement: fiche.environnement.slice(), savoirFaire: fiche.savoirFaire.slice(), savoirEtre: fiche.savoirEtre.slice(), savoirs: (fiche.savoirs || []).slice() };
    const r = M.rechercherMetiers(p, 5000).filter((m) => m.nom === nom)[0];
    assert.strictEqual(r.score, 100, nom + ' : profil complet = 100 %');
    assert.strictEqual(r.contresens, 0);
  });
});

test('chaque élément indiqué que la fiche ne cite pas retire un point', () => {
  const fiche = M.baseMetiers.filter((m) => m.nom === 'Cariste')[0];
  const complet = { niveauPersonne: 5, actions: fiche.actions.slice(), activites: fiche.activites.slice(), environnement: fiche.environnement.slice(), savoirFaire: fiche.savoirFaire.slice(), savoirEtre: fiche.savoirEtre.slice(), savoirs: [] };
  const autre = M.baseMetiers.filter((m) => m.nom !== 'Cariste' && (m.actions || []).some((a) => fiche.actions.indexOf(a) === -1))[0];
  const intrus = autre.actions.filter((a) => fiche.actions.indexOf(a) === -1).slice(0, 2);
  const avec = Object.assign({}, complet, { actions: complet.actions.concat(intrus) });
  const de = (p) => M.rechercherMetiers(p, 5000).filter((m) => m.nom === 'Cariste')[0];
  assert.strictEqual(de(avec).contresens, intrus.length, 'les intrus sont comptés');
  assert.ok(de(complet).score - de(avec).score >= 1, 'au moins un point perdu');
  assert.ok(de(complet).score - de(avec).score <= 6, 'jamais la moitié du pourcentage');
});

test('à pourcentage affiché égal, le pourcentage exact départage avant le nom', () => {
  const liste = [{ nom: 'A', score: 60, scoreExact: 59.6 }, { nom: 'B', score: 60, scoreExact: 60.4 }, { nom: 'C', score: 61, scoreExact: 60.6 }];
  assert.deepStrictEqual(liste.sort(M.comparerMetiersParScore).map((m) => m.nom), ['C', 'B', 'A']);
});

test('les compétences déduites des choix ne comptent pas dans la quantité et pèsent peu', () => {
  assert.strictEqual(M.nbElementsProfil({ actions: ['a', 'b'], savoirFaireDeduits: ['x', 'y', 'z'], savoirEtreDeduits: ['t'] }), 2);
  const p = Object.assign({}, base, { actions: ['soigner'], activites: ['personnes_agees'], savoirFaireDeduits: ['Soins'], savoirEtreDeduits: ['Empathie'] });
  const r = M.rechercherMetiers(p, 5)[0];
  assert.ok(r.score > 0 && Array.isArray(r.communes.savoirFaire), 'le classement fonctionne avec des compétences déduites');
});

test('le profil de l’application sépare les compétences écrites et celles déduites des choix', () => {
  assert.match(app, /function _separerCompetencesDeduites\(/);
  assert.match(app, /savoirFaireDeduits: sf\.deduites/);
  assert.match(app, /function deduireCompetences\(seulementChoix\)/);
});
