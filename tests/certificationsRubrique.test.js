// Rubrique « Certifications » (décision de Denis, 2026-09-30) : automatique dès trois certifications, au choix de la personne sinon (opts.certifsRubrique).
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const contexte = {
  normaliserPourComparaison: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-core/certifications.js', 'utf8'), contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfTemplateA4.js', 'utf8'), contexte);

const CERTIFS = ['Sensibilisation amiante (2026)', 'Habilitation échafaudage fixe & roulant (2026)', 'Module travail en hauteur (2026)', 'Habilitation électrique BS/BEM (2026)'];
const objet = (certifications) => ({ formations: [{ niveau: 'Titre professionnel', intitule: 'Plaquiste', annee: '2025 - 2026' }], certifications });
const preparer = (certifications, opts) => JSON.parse(JSON.stringify(contexte._pdfPreparerContenuFormations({}, objet(certifications), opts || {})));

test('quatre certifications : rubrique à part automatique, les formations ne gardent que les diplômes', () => {
  const r = preparer(CERTIFS);
  assert.deepEqual(r.certifications, CERTIFS);
  assert.equal(r.formations.length, 1);
  assert.equal(r.formations[0].intitule, 'Plaquiste');
});

test('trois certifications : automatique dès trois', () => {
  const r = preparer(CERTIFS.slice(0, 3));
  assert.equal(r.certifications.length, 3);
  assert.equal(r.formations.length, 1);
});

test('deux certifications : restent dans les formations tant que la personne ne choisit pas la rubrique', () => {
  const r = preparer(CERTIFS.slice(0, 2));
  assert.deepEqual(r.certifications, []);
  assert.equal(r.formations.length, 3);
});

test('case « Certifications » cochée avec deux certifications : rubrique à part', () => {
  const r = preparer(CERTIFS.slice(0, 2), { certifsRubrique: true });
  assert.equal(r.certifications.length, 2);
  assert.equal(r.formations.length, 1);
});

test('case décochée avec quatre certifications : retour dans les formations, une ligne chacune', () => {
  const r = preparer(CERTIFS, { certifsRubrique: false });
  assert.deepEqual(r.certifications, []);
  assert.equal(r.formations.length, 5);
});

test('aucune certification : rien ne change', () => {
  const r = preparer([]);
  assert.deepEqual(r.certifications, []);
  assert.equal(r.formations.length, 1);
});
