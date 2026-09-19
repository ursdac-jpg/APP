const { test } = require('node:test');
const assert = require('node:assert/strict');

// On charge index.js SANS _domStub ni app.js : le fichier ne touche au DOM
// ni aux globals que dans le corps de ses fonctions, jamais au chargement.
const rr = require('../modules/regard-recruteur/index.js');

test('index.js se charge en Node sans dependance au chargement', () => {
  assert.equal(typeof rr.regardRecruteurEtatNeuf, 'function');
  assert.equal(typeof rr._rrEtapeIndex, 'function');
});

test('_rrEtapeIndex : chaque vue tombe sur la bonne pastille (0..3)', () => {
  assert.equal(rr._rrEtapeIndex('preparer'), 0);
  assert.equal(rr._rrEtapeIndex('masquer'), 0);
  assert.equal(rr._rrEtapeIndex('choix-assistant'), 1);
  assert.equal(rr._rrEtapeIndex('chez'), 1);
  assert.equal(rr._rrEtapeIndex('coller'), 1);
  assert.equal(rr._rrEtapeIndex('erreur-lecture'), 1);
  assert.equal(rr._rrEtapeIndex('regard'), 2);
  assert.equal(rr._rrEtapeIndex('fiche'), 3);
  assert.equal(rr._rrEtapeIndex('inconnue'), -1);
});

test('RR_VUES et RR_ETAPES : formes attendues', () => {
  assert.equal(rr.RR_VUES.length, 8);
  assert.equal(rr.RR_ETAPES.length, 4);
  assert.deepEqual(rr.RR_ETAPES.map(e => e.label), ['Préparer', 'Envoyer', 'Le regard', 'Ma fiche']);
});

test('5 questions générales fixes, chacune complète', () => {
  assert.equal(rr.RR_QUESTIONS_GENERALES.length, 5);
  rr.RR_QUESTIONS_GENERALES.forEach(o => {
    assert.ok(o.q && o.cherche && o.repondre);
  });
});

test('état neuf : mode image, rien de rempli', () => {
  const e = rr.regardRecruteurEtatNeuf();
  assert.equal(e.vue, 'preparer');
  assert.equal(e.modeTexte, false);
  assert.deepEqual(e.images, []);
  assert.equal(e.rapport, null);
});

test('export/restauration : un état vide n\'est pas sauvegardé', () => {
  rr.regardRecruteurRestaurerEtatDepuisSauvegarde(null);
  assert.equal(rr.regardRecruteurExporterEtatPourSauvegarde(), null);
});

test('export/restauration : un état avec du contenu fait un aller-retour', () => {
  const snap = Object.assign(rr.regardRecruteurEtatNeuf(), {
    vue: 'regard',
    images: [{ nom: 'cv.png', dataUrl: 'data:image/png;base64,AAAA', masquee: true }],
    rapport: { analyseImpossible: false, axes: [], questionsLieesAuCv: [], pointsARetenir: ['x'] }
  });
  rr.regardRecruteurRestaurerEtatDepuisSauvegarde(snap);
  const dehors = rr.regardRecruteurExporterEtatPourSauvegarde();
  assert.ok(dehors);
  assert.equal(dehors.vue, 'regard');
  assert.equal(dehors.images[0].nom, 'cv.png');
  assert.equal(dehors.images[0].masquee, true);
  assert.equal(dehors.images[0].dataUrl, 'data:image/png;base64,AAAA');
  // objet distinct (copie profonde), pas la même référence
  assert.notEqual(dehors, snap);
});

test('restauration d\'un snapshot invalide -> état nul', () => {
  rr.regardRecruteurRestaurerEtatDepuisSauvegarde({ vue: 'nawak' });
  assert.equal(rr.regardRecruteurExporterEtatPourSauvegarde(), null);
});

test('_rrTexteBrut retire les balises et normalise les espaces', () => {
  assert.equal(rr._rrTexteBrut('Le message<span> que</span>&nbsp;votre CV envoie'), 'Le message que votre CV envoie');
});
