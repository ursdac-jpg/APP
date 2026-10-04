// Année(s) proposée(s) pour une certification sans année, quand le CV la range sous une formation (retour Denis 2026-09-30, CV « Nicolas POIROT »).
const { test } = require('node:test');
const assert = require('node:assert/strict');

const inc = require('../data/incoherencesImport.js');

const TEXTE = [
  'DIPLÔMES & FORMATIONS',
  '2018 - 2019 : BTS Maintenance des systèmes (niveau), Lycée PRE DE CORDY, Sarlat',
  '2016 - 2018 : Bac Pro Electricien (mention assez bien), Lycée HELENE DUC SUD PERIGORD, Bergerac',
  '2019 - 2020 : Sésame Numérique (niveau), LA WAB, Bergerac',
  '2025 - 2026 : Titre professionnel Plaquiste, IDC PRO, Bergerac',
  ' Sensibilisation amiante, Habilitation échafaudage fixe & roulant, Module travail en hauteur,',
  ' Habilitation électrique BS/BEM & module Règles Générale de sécurité'
].join('\n');

const JEU = {
  formations: [
    { niveau: 'BTS', intitule: 'Maintenance des systèmes', annee: '2018 - 2019' },
    { niveau: 'Bac Pro', intitule: 'Electricien', annee: '2016 - 2018' },
    { niveau: 'Sésame Numérique', intitule: 'Sésame Numérique', annee: '2019 - 2020' },
    { niveau: 'Titre professionnel', intitule: 'Plaquiste', annee: '2025 - 2026' }
  ],
  certifications: ['Sensibilisation amiante', 'Habilitation échafaudage fixe & roulant', 'Module travail en hauteur', 'Habilitation électrique BS/BEM']
};

test('certification rangée sous une formation : les années de la formation sont proposées, jamais imposées', () => {
  const points = inc.pointsCertificationsSansAnnee([JEU], []);
  assert.equal(points.length, 4);
  inc.suggererAnneesCertifications(points, [JEU], TEXTE);
  points.forEach((p) => {
    assert.deepEqual(p.suggestions, ['2025', '2026'], p.extrait);
    assert.match(p.question, /Plaquiste/);
    assert.match(p.question, /2025 - 2026/);
  });
});

test('la réponse choisie (une année proposée) est appliquée à la certification', () => {
  const objet = { certifications: ['Sensibilisation amiante'] };
  const points = inc.pointsCertificationsSansAnnee([objet], []);
  inc.suggererAnneesCertifications(points, [JEU], TEXTE);
  assert.ok(inc.appliquerPrecisionCible(objet, points[0].cible, points[0].suggestions[1]));
  assert.equal(objet.certifications[0], 'Sensibilisation amiante (2026)');
});

test('sans texte du CV, ou sans formation reconnue au-dessus, aucune année n’est proposée', () => {
  const p1 = inc.pointsCertificationsSansAnnee([JEU], []);
  inc.suggererAnneesCertifications(p1, [JEU], '');
  assert.equal(p1[0].suggestions, undefined);
  const p2 = inc.pointsCertificationsSansAnnee([JEU], []);
  inc.suggererAnneesCertifications(p2, [JEU], 'Sensibilisation amiante\nAutre ligne');
  assert.equal(p2[0].suggestions, undefined);
});

test('une ligne datée entre la formation et la certification coupe le lien : rien n’est proposé', () => {
  const texte = '2025 - 2026 : Titre professionnel Plaquiste, IDC PRO\n2023 : Agent technique, X\nSensibilisation amiante';
  const pts = inc.pointsCertificationsSansAnnee([{ formations: JEU.formations, certifications: ['Sensibilisation amiante'] }], []);
  inc.suggererAnneesCertifications(pts, [JEU], texte);
  assert.equal(pts[0].suggestions, undefined);
});
