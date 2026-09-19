const { test } = require('node:test');
const assert = require('node:assert/strict');

const { bilanResoudreChampExperience } = require('../modules/bilan-candidature/assistance/resolutionChampExperience.js');

test('une seule experience : resolution unique, index 0, champ missions, liste experiences par defaut', () => {
  const res = bilanResoudreChampExperience([{ poste: 'Vendeur', missions: 'Accueil client.' }]);
  assert.deepEqual(res, { type: 'unique', destination: { liste: 'experiences', index: 0, champ: 'missions' } });
});

test('plusieurs experiences : selection, une destination candidate par experience, toutes sur missions', () => {
  const res = bilanResoudreChampExperience([
    { poste: 'Vendeur', missions: 'a' },
    { poste: 'Caissier', missions: 'b' },
    { poste: 'Manager', missions: 'c' }
  ]);
  assert.equal(res.type, 'selection');
  assert.deepEqual(res.destinations, [
    { liste: 'experiences', index: 0, champ: 'missions' },
    { liste: 'experiences', index: 1, champ: 'missions' },
    { liste: 'experiences', index: 2, champ: 'missions' }
  ]);
});

// --- chantier "enrichissement CV legers via experiencesPerso" (2026-08-22) ---

test('liste combinee (experiences + experiencesPerso) : une seule experience personnelle, aucune professionnelle -> unique, liste experiencesPerso propagee', () => {
  const res = bilanResoudreChampExperience([{ liste: 'experiencesPerso', index: 0, poste: 'Aide au garage familial', missions: 'Reparations, accueil clients.' }]);
  assert.deepEqual(res, { type: 'unique', destination: { liste: 'experiencesPerso', index: 0, champ: 'missions' } });
});

test('liste combinee : 1 experience pro + 1 experience perso -> selection (ambigu), chaque destination garde sa propre liste/index', () => {
  const res = bilanResoudreChampExperience([
    { liste: 'experiences', index: 0, poste: 'Vendeur', missions: 'a' },
    { liste: 'experiencesPerso', index: 0, poste: 'Aide au garage familial', missions: 'b' }
  ]);
  assert.equal(res.type, 'selection');
  assert.deepEqual(res.destinations, [
    { liste: 'experiences', index: 0, champ: 'missions' },
    { liste: 'experiencesPerso', index: 0, champ: 'missions' }
  ]);
});

test('element sans son propre index (ancien contrat) -> retombe sur la position, jamais undefined', () => {
  const res = bilanResoudreChampExperience([{ poste: 'x', missions: 'y' }]);
  assert.equal(res.destination.index, 0);
  assert.equal(res.destination.liste, 'experiences');
});

test('aucune experience : indisponible, jamais une exception', () => {
  assert.deepEqual(bilanResoudreChampExperience([]), { type: 'indisponible' });
});

test('experiences absent (undefined/null) : meme comportement qu\'un tableau vide', () => {
  assert.deepEqual(bilanResoudreChampExperience(undefined), { type: 'indisponible' });
  assert.deepEqual(bilanResoudreChampExperience(null), { type: 'indisponible' });
});

// TACHE (regle V1, pas un postulat definitif -- voir resolutionChampExperience.js) :
// verifie que le champ retenu est bien 'missions', jamais 'poste', quel
// que soit le nombre d'experiences.
test('le champ retenu est toujours missions, jamais poste, coherent avec la regle V1 documentee', () => {
  const uniqueRes = bilanResoudreChampExperience([{ poste: 'x', missions: 'y' }]);
  assert.equal(uniqueRes.destination.champ, 'missions');
  const selectionRes = bilanResoudreChampExperience([{ poste: 'x', missions: 'y' }, { poste: 'z', missions: 'w' }]);
  assert.ok(selectionRes.destinations.every((d) => d.champ === 'missions'));
});
