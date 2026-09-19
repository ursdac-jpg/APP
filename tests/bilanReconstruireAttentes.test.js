const { test } = require('node:test');
const assert = require('node:assert/strict');

// Teste bilanReconstruireAxe/bilanReconstruireAttentes/bilanResoudreObservationParTexte
// directement, SANS passer par bilanParserReponseDiagnostic ni js/app.js
// (extraireBlocJSONDepuisTexte) : ces fonctions n'ont besoin que d'objets
// JS deja extraits, jamais du texte brut colle par la personne.
const {
  bilanReconstruireAxe, bilanReconstruireAttentes, bilanResoudreObservationParTexte
} = require('../modules/bilan-candidature/diagnostic/diagnosticResponseParser.js');

const IDS_AXES_CONNUS = ['adequation', 'credibilite'];

test('bilanResoudreObservationParTexte : correspondance exacte trouvee', () => {
  const observations = [
    { id: 'adequation-obs-0', contenu: 'A accueilli 40 usagers par jour.' },
    { id: 'adequation-obs-1', contenu: 'A coordonné une équipe de 5 personnes.' }
  ];
  assert.equal(bilanResoudreObservationParTexte('A coordonné une équipe de 5 personnes.', observations), 'adequation-obs-1');
});

test('bilanResoudreObservationParTexte : aucune correspondance => null', () => {
  const observations = [{ id: 'adequation-obs-0', contenu: 'Texte réel.' }];
  assert.equal(bilanResoudreObservationParTexte('Texte qui ne correspond à rien.', observations), null);
});

test('bilanResoudreObservationParTexte : deux observations au texte identique => premiere occurrence retenue (regle deterministe)', () => {
  const observations = [
    { id: 'adequation-obs-0', contenu: 'Texte dupliqué.' },
    { id: 'adequation-obs-1', contenu: 'Texte dupliqué.' }
  ];
  assert.equal(bilanResoudreObservationParTexte('Texte dupliqué.', observations), 'adequation-obs-0');
});

test('bilanReconstruireAttentes : contenu manquant => attente ignorée, anomalie ChampManquant', () => {
  const anomalies = [];
  const attentes = bilanReconstruireAttentes([{ observationsLiees: [] }], 'axes[0]', 'adequation', [], anomalies);
  assert.equal(attentes.length, 0);
  assert.equal(anomalies.length, 1);
  assert.equal(anomalies[0].type, 'ChampManquant');
});

test('bilanReconstruireAttentes : observationsLiees non resolue => anomalie ReferenceInconnue, attente conservee sans cette reference', () => {
  const anomalies = [];
  const observations = [{ id: 'adequation-obs-0', contenu: 'Observation réelle.' }];
  const attentes = bilanReconstruireAttentes(
    [{ contenu: 'Accueillir un public', observationsLiees: ['Texte inexistant.'] }],
    'axes[0]', 'adequation', observations, anomalies
  );
  assert.equal(attentes.length, 1);
  assert.deepEqual(attentes[0].observationsLiees, []);
  assert.equal(anomalies.some((a) => a.type === 'ReferenceInconnue'), true);
});

test('bilanReconstruireAttentes : resolution correcte texte -> id, attente valide construite', () => {
  const anomalies = [];
  const observations = [
    { id: 'adequation-obs-0', contenu: 'A accueilli 40 usagers par jour.' },
    { id: 'adequation-obs-1', contenu: 'A recueilli les besoins des habitants.' }
  ];
  const attentes = bilanReconstruireAttentes(
    [{ contenu: 'Accueillir un public', observationsLiees: ['A accueilli 40 usagers par jour.', 'A recueilli les besoins des habitants.'] }],
    'axes[0]', 'adequation', observations, anomalies
  );
  assert.equal(attentes.length, 1);
  assert.equal(attentes[0].contenu, 'Accueillir un public');
  assert.equal(attentes[0].axeLie, 'adequation');
  assert.deepEqual(attentes[0].observationsLiees, ['adequation-obs-0', 'adequation-obs-1']);
  assert.equal(anomalies.length, 0);
});

test('bilanReconstruireAttentes : attente sans observation liee reste valide (etat "aucun element", pas une erreur)', () => {
  const anomalies = [];
  const attentes = bilanReconstruireAttentes(
    [{ contenu: 'Respecter la confidentialité', observationsLiees: [] }],
    'axes[0]', 'adequation', [], anomalies
  );
  assert.equal(attentes.length, 1);
  assert.deepEqual(attentes[0].observationsLiees, []);
  assert.equal(anomalies.length, 0);
});

test('bilanReconstruireAttentes : attentesBrutes absent (diagnostic ancien) => tableau vide, aucune anomalie', () => {
  const anomalies = [];
  const attentes = bilanReconstruireAttentes(undefined, 'axes[0]', 'adequation', [], anomalies);
  assert.deepEqual(attentes, []);
  assert.equal(anomalies.length, 0);
});

test('bilanReconstruireAxe : attentes absentes de l\'entree brute => axe.attentes vide (compatibilite ancien diagnostic)', () => {
  const resultat = bilanReconstruireAxe({ id: 'adequation', restitutionQualitative: 'convaincant' }, 0, IDS_AXES_CONNUS);
  assert.deepEqual(resultat.axe.attentes, []);
});

test('bilanReconstruireAxe : integration complete, attentes reliees aux observations du meme axe', () => {
  const axeBrut = {
    id: 'adequation',
    restitutionQualitative: 'convaincant',
    observationsArgumentees: [
      { texte: 'A accueilli 40 usagers par jour.', observationsFactuellesLiees: [] },
      { texte: 'A géré un stock de 200 références.', observationsFactuellesLiees: [] }
    ],
    pointsForts: [], pointsFaibles: [], incoherences: [], risques: [],
    attentes: [
      { contenu: 'Accueillir un public', observationsLiees: ['A accueilli 40 usagers par jour.'] },
      { contenu: 'Gérer un stock', observationsLiees: ['A géré un stock de 200 références.'] },
      { contenu: 'Respecter la confidentialité', observationsLiees: [] }
    ]
  };
  const resultat = bilanReconstruireAxe(axeBrut, 0, IDS_AXES_CONNUS);
  assert.equal(resultat.axe.attentes.length, 3);
  assert.equal(resultat.axe.attentes[0].observationsLiees[0], resultat.axe.observationsArgumentees[0].id);
  assert.equal(resultat.axe.attentes[1].observationsLiees[0], resultat.axe.observationsArgumentees[1].id);
  assert.deepEqual(resultat.axe.attentes[2].observationsLiees, []);
  assert.equal(resultat.anomalies.length, 0);
});
