const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
require('./_domStub').installerStubDom();
const { signatureProfilAssistant } = require('../js/app.js');

// Consigne 324 : la page « L'assistant en ligne » réaffiche ses rubriques seulement si les informations saisies AVANT l'assistant ont changé.
const base = () => ({
  experiences: [{ poste: 'Aide-soignante', entreprise: 'EHPAD', dateDebut: '2020', dateFin: '2022', missions: 'Aider à la toilette', estStage: false }],
  formations: [{ intitule: 'CAP', etablissement: 'Lycée' }],
  etapeMC: { miss: { x1: ['Soins'] } },
  ia: { cv: { pointsForts: ['A'] } }
});

test('même contenu = même empreinte ; sans dossier, jamais d’erreur', () => {
  assert.equal(signatureProfilAssistant(base()), signatureProfilAssistant(base()));
  assert.equal(typeof signatureProfilAssistant(undefined), 'string');
});

test('une expérience, une formation, une mission ou un choix de l’étape qui change change l’empreinte', () => {
  const ref = signatureProfilAssistant(base());
  let d = base(); d.experiences.push({ poste: 'Serveuse', entreprise: 'Le Relais' });
  assert.notEqual(signatureProfilAssistant(d), ref);
  d = base(); d.experiences[0].missions = 'Autre mission';
  assert.notEqual(signatureProfilAssistant(d), ref);
  d = base(); d.formations[0].intitule = 'Bac pro';
  assert.notEqual(signatureProfilAssistant(d), ref);
  d = base(); d.etapeMC.miss.x1 = ['Soins', 'Repas'];
  assert.notEqual(signatureProfilAssistant(d), ref);
});

test('ce que la personne retouche sur la page de création du CV ne change pas l’empreinte', () => {
  const ref = signatureProfilAssistant(base());
  const d = base();
  d.ia.cv.pointsForts = ['Autre point fort'];
  d.ia.cv.titresProposes = ['Un autre titre'];
  d.experiences[0].estStage = true;
  d.pdfReglages = { couleur: 'rouge' };
  assert.equal(signatureProfilAssistant(d), ref);
});

test('la page : empreinte prise à chaque import (CV, lettre, entretien), rubriques masquées seulement quand la réponse est à jour', () => {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  ['ia.cv', 'ia.lettre', 'ia.entretien'].forEach((c) => assert.ok(app.includes('dossier.' + c + '.signatureProfilAssistant = signatureProfilAssistant(dossier)'), c));
  assert.ok(app.includes('function _assistantModeApresImport(type)'));
  assert.ok(app.includes("modeSynthese === 'perimee'") && app.includes('(rubriquesDeDepart ?'));
  assert.ok(app.includes("etatAccordeon[modeSynthese === 'synthese' ? 'relecture-ia' : 'choix-ia'] = true"));
});
