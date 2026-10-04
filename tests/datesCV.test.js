const test = require('node:test');
const assert = require('node:assert');
const { normaliserDateImport, separerDatesDuTitre, formaterDateCourte } = require('../modules/cv-core/dates.js');

test('normaliserDateImport : le mois est conserve quand il est ecrit', () => {
  assert.strictEqual(normaliserDateImport('Septembre 2023'), '2023-09');
  assert.strictEqual(normaliserDateImport('sept. 2023'), '2023-09');
  assert.strictEqual(normaliserDateImport('09/2023'), '2023-09');
  assert.strictEqual(normaliserDateImport('2023-09'), '2023-09');
  assert.strictEqual(normaliserDateImport('15/09/2023'), '2023-09');
  assert.strictEqual(normaliserDateImport('Février 2021'), '2021-02');
  assert.strictEqual(normaliserDateImport('2020'), '2020');
  assert.strictEqual(normaliserDateImport('Depuis mars 2023'), '2023-03');
  assert.strictEqual(normaliserDateImport("aujourd'hui"), '');
  assert.strictEqual(normaliserDateImport(''), '');
});

test('separerDatesDuTitre : les dates quittent le titre pour les champs de dates', () => {
  let r = separerDatesDuTitre('Chargée de formation (2019-2022)');
  assert.deepStrictEqual([r.titre, r.dateDebut, r.dateFin, r.trouve], ['Chargée de formation', '2019', '2022', true]);
  r = separerDatesDuTitre('Hôtesse d’accueil - Sept. 2017 - juin 2019');
  assert.deepStrictEqual([r.titre, r.dateDebut, r.dateFin], ['Hôtesse d’accueil', '2017-09', '2019-06']);
  r = separerDatesDuTitre('2016 : Licence Langues Étrangères Appliquées');
  assert.deepStrictEqual([r.titre, r.dateDebut, r.periode], ['Licence Langues Étrangères Appliquées', '2016', '2016']);
  r = separerDatesDuTitre('Master 2 - Directrice RH - 2023 - 2024');
  assert.deepStrictEqual([r.titre, r.periode], ['Master 2 - Directrice RH', '2023 - 2024']);
  r = separerDatesDuTitre('Responsable de site depuis 2019');
  assert.deepStrictEqual([r.titre, r.dateDebut, r.dateFin], ['Responsable de site', '2019', '']);
});

test('separerDatesDuTitre : un titre sans date, ou reduit a une date, reste intact', () => {
  assert.strictEqual(separerDatesDuTitre('Chargée de formation').trouve, false);
  assert.strictEqual(separerDatesDuTitre('Chargée de formation').titre, 'Chargée de formation');
  assert.strictEqual(separerDatesDuTitre('2019').trouve, false);
  assert.strictEqual(separerDatesDuTitre('Technicien 3D').trouve, false);
});

test('formaterDateCourte : mois abrege ou annee', () => {
  assert.strictEqual(formaterDateCourte('2023-09'), 'sept. 2023');
  assert.strictEqual(formaterDateCourte('2023-02'), 'févr. 2023');
  assert.strictEqual(formaterDateCourte('2023'), '2023');
  assert.strictEqual(formaterDateCourte(''), '');
});

test('ordre chronologique : expériences du plus récent au plus ancien, « en cours » en premier, sans date en dernier', () => {
  const { cleChronologiqueExperience, trierDuPlusRecent } = require('../modules/cv-core/dates.js');
  const liste = [
    { poste: 'A', dateDebut: '2015', dateFin: '2018' },
    { poste: 'Sans date' },
    { poste: 'C', dateDebut: 'Sept. 2022', dateFin: '' },
    { poste: 'B', dateDebut: '2019', dateFin: '2021' },
    { poste: 'B2', dateDebut: '09/2019', dateFin: '06/2021' }
  ];
  const postes = trierDuPlusRecent(liste, cleChronologiqueExperience).map((e) => e.poste);
  assert.deepStrictEqual(postes, ['C', 'B', 'B2', 'A', 'Sans date']);
  // à dates égales, l'ordre d'origine est gardé ; la liste d'origine n'est pas modifiée
  assert.strictEqual(liste[0].poste, 'A');
});

test('ordre chronologique : formations par date de fin ou année, les plus récentes d’abord', () => {
  const { cleChronologiqueFormation, trierDuPlusRecent } = require('../modules/cv-core/dates.js');
  const liste = [
    { intitule: 'Bac', annee: '2012' },
    { intitule: 'SST', annee: '2024' },
    { intitule: 'CAP', annee: '2013-2015' },
    { intitule: 'Sans année' }
  ];
  assert.deepStrictEqual(trierDuPlusRecent(liste, cleChronologiqueFormation).map((f) => f.intitule), ['SST', 'CAP', 'Bac', 'Sans année']);
});
