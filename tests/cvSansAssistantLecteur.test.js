// Module « Mettre mon CV en page, sans rien changer » : lecteur de PDF qui garde les lignes (modules/cv-sans-assistant/lecteurPdf.js).
// Fonctions pures, essayées avec des morceaux de texte fabriqués (x, y en points de page, y croissant vers le haut). pdf.js lui-même : test navigateur.
const test = require('node:test');
const assert = require('node:assert');
const { csaSansSuperposition, csaLignesDepuisItems, csaTrouverGouttieres, csaLirePageEnLignes } = require('../modules/cv-sans-assistant/lecteurPdf.js');

const m = (s, x, y, w, h) => ({ s: s, x: x, y: y, w: w === undefined ? s.length * 5 : w, h: h === undefined ? 10 : h });

test('lecteur : des morceaux à la même hauteur forment une ligne, de haut en bas', () => {
  const l = csaLignesDepuisItems([m('Seconde ligne', 40, 700), m('Première', 40, 750), m('ligne', 90, 750)]);
  assert.deepStrictEqual(l.map((x) => x.texte), ['Première ligne', 'Seconde ligne']);
});

test('lecteur : un grand écart entre deux morceaux d\'une ligne devient une tabulation (deux cases d\'une grille)', () => {
  const l = csaLignesDepuisItems([m('Ponctualité', 40, 700), m('Rigueur', 300, 700)]);
  assert.strictEqual(l[0].texte, 'Ponctualité\tRigueur');
});

test('lecteur : des lettres espacées sont recollées (« C O M P É T E N C E S »)', () => {
  const lettres = 'COMPÉTENCES'.split('').map((c, k) => m(c, 40 + k * 8, 700, 5));
  const l = csaLignesDepuisItems(lettres);
  assert.strictEqual(l[0].texte, 'COMPÉTENCES');
});

test('lecteur : un texte écrit deux fois au même endroit ne sort qu\'une fois, mais deux mots identiques à deux endroits restent', () => {
  const r = csaSansSuperposition([m('Camille', 40, 750), m('Camille', 40.5, 750.4), m('Camille', 40, 600)]);
  assert.strictEqual(r.length, 2);
});

// Une page de 595 points : colonne de gauche (x 30 à 170), colonne de droite (x 250 à 560), même hauteur de page.
function pageDeuxColonnes() {
  const items = [];
  for (let k = 0; k < 14; k++) { items.push(m('Gauche ' + k, 30, 780 - k * 40, 120)); items.push(m('Droite ' + k + ' avec un texte plus long', 250, 780 - k * 40 + 7, 280)); }
  return items;
}
test('lecteur : deux colonnes sont lues l\'une après l\'autre (la gauche d\'abord), jamais ligne à ligne', () => {
  const r = csaLirePageEnLignes(pageDeuxColonnes(), 595);
  assert.strictEqual(r.colonnes, 2);
  assert.strictEqual(r.lignes[0], 'Gauche 0');
  assert.strictEqual(r.lignes[13], 'Gauche 13');
  assert.strictEqual(r.lignes[14], 'Droite 0 avec un texte plus long');
});

test('lecteur : un CV d\'une colonne avec une petite grille au milieu n\'est pas coupé en deux', () => {
  const items = [];
  for (let k = 0; k < 30; k++) { items.push(m('Ligne de texte numéro ' + k + ' assez longue pour la page', 40, 800 - k * 22, 330)); }
  for (let k = 0; k < 4; k++) { items.push(m('Case gauche', 40, 500 - k * 20, 100), m('Case droite', 300, 500 - k * 20, 100)); }
  const r = csaLirePageEnLignes(items, 595);
  assert.strictEqual(r.colonnes, 1);
});

test('lecteur : les dates rangées à droite des postes sont recollées à leur poste (une ligne, séparée par une tabulation)', () => {
  const items = [];
  for (let k = 0; k < 12; k++) { items.push(m('Poste numéro ' + k + ' chez un employeur', 40, 780 - k * 55, 300)); items.push(m('Mission ' + k + ' réalisée sur le terrain', 40, 780 - k * 55 - 18, 280)); items.push(m('20' + (10 + k) + ' - 20' + (11 + k), 470, 780 - k * 55, 80)); }
  const r = csaLirePageEnLignes(items, 595);
  assert.ok(r.lignes.some((l) => /^Poste numéro 0 chez un employeur\t2010 - 2011$/.test(l)), r.lignes.slice(0, 4).join(' | '));
});

test('lecteur : un titre qui enjambe la gouttière en haut de page reste en tête ; un morceau qui l\'enjambe plus bas reste dans sa colonne', () => {
  const items = pageDeuxColonnes();
  items.push(m('NOM PRÉNOM EN TÊTE DE PAGE', 100, 830, 300));
  items.push(m('morceau large au milieu', 120, 400, 250));
  const r = csaLirePageEnLignes(items, 595);
  assert.strictEqual(r.lignes[0], 'NOM PRÉNOM EN TÊTE DE PAGE');
  assert.ok(r.lignes.indexOf('morceau large au milieu') !== -1);
});

test('lecteur : trop peu de texte pour parler de colonnes', () => {
  assert.deepStrictEqual(csaTrouverGouttieres([m('Un', 40, 700), m('Deux', 300, 700)], 595), []);
});
