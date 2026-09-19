const { test } = require('node:test');
const assert = require('node:assert/strict');
const { ctLireDonneesBrutes, ctLecteursParDefaut } = require('../modules/coherence-transversale/collecte/hostDataAdapter.js');

function lecteursDeTest(valeurs) {
  valeurs = valeurs || {};
  return {
    lireCv: () => valeurs.cv,
    lireEntrepriseCiblee: () => valeurs.entrepriseCiblee,
    lireSiteEntreprise: () => valeurs.siteEntreprise,
    lireLettreTexte: () => valeurs.lettre,
    lireEntretienTexte: () => valeurs.preparationEntretien
  };
}

test('ctLireDonneesBrutes : transmet les valeurs des lecteurs injectes', () => {
  const brut = ctLireDonneesBrutes(lecteursDeTest({ cv: 'Mon CV', lettre: 'Madame, Monsieur...', entrepriseCiblee: 'Boulangerie Dupont' }));
  assert.equal(brut.cv, 'Mon CV');
  assert.equal(brut.lettre, 'Madame, Monsieur...');
  assert.equal(brut.entrepriseCiblee, 'Boulangerie Dupont');
});

test('ctLireDonneesBrutes : champs absents => null, jamais undefined (cv => chaine vide)', () => {
  const brut = ctLireDonneesBrutes(lecteursDeTest({}));
  assert.equal(brut.cv, '');
  assert.equal(brut.entrepriseCiblee, null);
  assert.equal(brut.siteEntreprise, null);
  assert.equal(brut.lettre, null);
  assert.equal(brut.preparationEntretien, null);
});

// ---------- ctLecteursParDefaut (fonctions globales de l'app, simulees) ----------

test('lireCv : relaie texteProfilEffectif(\'cv\')', () => {
  global.texteProfilEffectif = (type) => (type === 'cv' ? 'Texte de base du CV.' : '');
  try {
    assert.equal(ctLecteursParDefaut().lireCv(), 'Texte de base du CV.');
  } finally {
    delete global.texteProfilEffectif;
  }
});

test('lireCv : fonction globale absente -> chaine vide, jamais une exception', () => {
  assert.doesNotThrow(() => ctLecteursParDefaut().lireCv());
  assert.equal(ctLecteursParDefaut().lireCv(), '');
});

test('lireSiteEntreprise : relaie siteCibleActuel()', () => {
  global.siteCibleActuel = () => 'https://boulangerie-dupont.fr';
  try {
    assert.equal(ctLecteursParDefaut().lireSiteEntreprise(), 'https://boulangerie-dupont.fr');
  } finally {
    delete global.siteCibleActuel;
  }
});

test('lireLettreTexte : lit dossier.ia.lettre.lettre.texte', () => {
  global.dossier = { ia: { lettre: { lettre: { texte: 'Madame, Monsieur, ...' } } } };
  try {
    assert.equal(ctLecteursParDefaut().lireLettreTexte(), 'Madame, Monsieur, ...');
  } finally {
    delete global.dossier;
  }
});

test('lireLettreTexte : aucune lettre generee -> chaine vide, jamais une exception', () => {
  global.dossier = {};
  try {
    assert.doesNotThrow(() => ctLecteursParDefaut().lireLettreTexte());
    assert.equal(ctLecteursParDefaut().lireLettreTexte(), '');
  } finally {
    delete global.dossier;
  }
});

test('lireEntretienTexte : recompose un texte lisible', () => {
  global.dossier = {
    ia: {
      entretien: {
        presentation: 'Bonjour, je suis...',
        pointsAPreparer: ['Mettre en avant la rigueur'],
        questionsAnticipees: [{ question: 'Pourquoi ce poste ?', pistes: ['motivation', 'projet'] }],
        questionsDuCandidat: ['Quelles perspectives d’évolution ?']
      }
    }
  };
  try {
    const texte = ctLecteursParDefaut().lireEntretienTexte();
    assert.ok(texte.indexOf('Bonjour, je suis...') !== -1);
    assert.ok(texte.indexOf('Mettre en avant la rigueur') !== -1);
    assert.ok(texte.indexOf('Pourquoi ce poste ?') !== -1);
    assert.ok(texte.indexOf('Quelles perspectives d’évolution ?') !== -1);
  } finally {
    delete global.dossier;
  }
});

test('lireEntretienTexte : dossier.ia.entretien absent -> chaine vide, jamais une exception', () => {
  global.dossier = {};
  try {
    assert.doesNotThrow(() => ctLecteursParDefaut().lireEntretienTexte());
    assert.equal(ctLecteursParDefaut().lireEntretienTexte(), '');
  } finally {
    delete global.dossier;
  }
});

test('lireTexteOffre : lit dossier.rechercheCandidature.texteOffre', () => {
  global.dossier = { rechercheCandidature: { texteOffre: 'Texte de l’offre déjà mémorisé.' } };
  try {
    assert.equal(ctLecteursParDefaut().lireTexteOffre(), 'Texte de l’offre déjà mémorisé.');
  } finally {
    delete global.dossier;
  }
});

test('lireTexteOffre : absent -> chaine vide, jamais une exception', () => {
  global.dossier = {};
  try {
    assert.doesNotThrow(() => ctLecteursParDefaut().lireTexteOffre());
    assert.equal(ctLecteursParDefaut().lireTexteOffre(), '');
  } finally {
    delete global.dossier;
  }
});
