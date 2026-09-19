const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

require('./_domStub').installerStubDom();
const { _atsConstruirePrompt, atsEtatNeuf } = require('../modules/ats/index.js');

const TEMPLATE = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'ats.md'), 'utf8');

test('mode offre : placeholders remplis, aucun {PLACEHOLDER} residuel', () => {
  const etat = Object.assign(atsEtatNeuf(), {
    modeReference: 'offre',
    cvTexte: 'Employé de magasin. Mise en rayon, tenue de caisse.',
    ciblage: {
      metierCible: 'Employé de libre-service',
      saisieLibre: 'Offre : employé de libre-service. Missions : mise en rayon, encaissement.',
      entreprise: 'Supermarché Coste',
      site: 'https://coste.fr',
      typeStructure: 'Entreprise privée (secteur marchand)'
    }
  });
  const p = _atsConstruirePrompt(TEMPLATE, etat);
  assert.equal(/\{[A-Z_]+\}/.test(p), false, 'aucun placeholder non résolu');
  assert.match(p, /Mode de référence :\*\* offre/);
  assert.match(p, /Employé de magasin/);
  assert.match(p, /Supermarché Coste/);
  assert.match(p, /Offre : employé de libre-service/);
  assert.match(p, /Entreprise privée/);
});

test('mode metier : offre = Non fournie, métier + ROME + vocabulaire remplis', () => {
  const etat = Object.assign(atsEtatNeuf(), {
    modeReference: 'metier',
    cvTexte: 'Secrétaire médicale. Accueil des patients, prise de rendez-vous.',
    metier: { nom: 'Agent d’accueil', rome: 'M1601', vocabulaire: 'Bureautique, Accueil, Standard téléphonique' }
  });
  const p = _atsConstruirePrompt(TEMPLATE, etat);
  assert.equal(/\{[A-Z_]+\}/.test(p), false);
  assert.match(p, /Mode de référence :\*\* metier/);
  assert.match(p, /Métier visé :\*\* Agent d’accueil/);
  assert.match(p, /Code ROME de la fiche métier \(mode metier\) :\*\* M1601/);
  assert.match(p, /Bureautique, Accueil, Standard téléphonique/);
  assert.match(p, /Offre d'emploi \(mode offre\) :\*\* Non fournie/);
});

test('champs manquants : valeurs de repli propres, jamais "undefined"', () => {
  const p = _atsConstruirePrompt(TEMPLATE, Object.assign(atsEtatNeuf(), { modeReference: 'offre', cvTexte: 'CV minimal.' }));
  assert.equal(p.indexOf('undefined'), -1);
  // la section "Données à comparer" ne doit plus contenir de placeholder
  const section = p.slice(p.indexOf('## Données à comparer'));
  assert.equal(/\{[A-Z_]+\}/.test(section), false);
  assert.match(p, /Entreprise ciblée :\*\* Non fournie/);
  assert.match(p, /Type de structure :\*\* Non fourni/);
});
