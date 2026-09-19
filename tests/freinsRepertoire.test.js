const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const { FREINS_REPERTOIRE } = require('../data/freins.js');

const RACINE = path.join(__dirname, '..');
const promptTexte = fs.readFileSync(path.join(RACINE, 'prompts', 'regard-exterieur.md'), 'utf8');
const moduleTexte = fs.readFileSync(path.join(RACINE, 'modules', 'regard-exterieur', 'index.js'), 'utf8');

// Les 17 codes de la liste fermee du prompt (section "Liste fermée des codes de frein")
const blocCodesPrompt = promptTexte
  .split('Liste fermée des codes de frein')[1]
  .split('Pour chaque frein réellement')[0];
const codesPrompt = [...blocCodesPrompt.matchAll(/^- ([a-zA-Z]+) :/gm)].map((m) => m[1]).sort();

// Les cles de _REGARD_EXTERIEUR_FREINS_LABELS (lues comme texte, le module n'est pas requerable)
const blocLabels = moduleTexte
  .split('var _REGARD_EXTERIEUR_FREINS_LABELS = {')[1]
  .split('};')[0];
const codesLabels = [...blocLabels.matchAll(/^\s{2}([a-zA-Z]+):/gm)].map((m) => m[1]).sort();

// La liste blanche d'URL vérifiées (_REGARD_EXTERIEUR_SITES_AUTORISES), lue
// comme texte. Depuis l'étape 4 du chantier freins, la liste fermée de sites
// n'est plus dans le prompt : cette liste blanche du module est la référence.
const blocSites = moduleTexte
  .split('var _REGARD_EXTERIEUR_SITES_AUTORISES = [')[1]
  .split('];')[0];
const sitesAutorises = [...blocSites.matchAll(/'([^']+)'/g)].map((m) => m[1]);

const clesFichier = Object.keys(FREINS_REPERTOIRE).sort();

test('freins : les 17 codes du fichier == ceux de la liste fermee du prompt', () => {
  assert.deepEqual(clesFichier, codesPrompt);
  assert.equal(clesFichier.length, 17);
});

test('freins : les cles du fichier == celles de _REGARD_EXTERIEUR_FREINS_LABELS', () => {
  assert.deepEqual(clesFichier, codesLabels);
});

test('freins : chaque entree a la forme attendue', () => {
  const niveauxValides = ['vital', 'stabilite', 'emploi'];
  clesFichier.forEach((cle) => {
    const f = FREINS_REPERTOIRE[cle];
    assert.equal(f.code, cle, cle + ' : code doit == cle');
    assert.ok(niveauxValides.includes(f.niveau), cle + ' : niveau invalide (' + f.niveau + ')');
    assert.ok(typeof f.titre === 'string' && f.titre.length > 0, cle + ' : titre manquant');
    assert.ok(typeof f.definition === 'string' && f.definition.length > 0, cle + ' : definition manquante');
    assert.ok(typeof f.commentLever === 'string' && f.commentLever.length > 0, cle + ' : commentLever manquant');
    assert.ok(Array.isArray(f.pistesDeReflexion), cle + ' : pistesDeReflexion doit etre un tableau');
    assert.ok(Array.isArray(f.quiVoir) && f.quiVoir.length > 0, cle + ' : quiVoir vide');
    assert.ok(Array.isArray(f.ressources) && f.ressources.length > 0, cle + ' : ressources vide');
    assert.ok(Array.isArray(f.synonymes) && f.synonymes.length > 0, cle + ' : synonymes vide');
    f.ressources.forEach((r) => {
      assert.ok(typeof r.libelle === 'string' && r.libelle.length > 0, cle + ' : ressource sans libelle');
      assert.ok(Array.isArray(r.motsCles), cle + ' : ressource.motsCles doit etre un tableau');
      assert.ok(r.url === null || typeof r.url === 'string', cle + ' : ressource.url doit etre null ou une chaine');
    });
  });
});

test('freins : aucune URL inventee (toutes dans _REGARD_EXTERIEUR_SITES_AUTORISES)', () => {
  clesFichier.forEach((cle) => {
    FREINS_REPERTOIRE[cle].ressources.forEach((r) => {
      if (r.url) {
        assert.ok(
          sitesAutorises.includes(r.url),
          cle + ' : URL absente de la liste blanche du module -> ' + r.url
        );
      }
    });
  });
});

test('freins : sensible=true uniquement sur violences et addiction', () => {
  const sensibles = clesFichier.filter((cle) => FREINS_REPERTOIRE[cle].sensible === true).sort();
  assert.deepEqual(sensibles, ['addiction', 'violences']);
});

test('freins : niveau vital sur faim / logement / violences / sante / addiction', () => {
  const vitaux = clesFichier.filter((cle) => FREINS_REPERTOIRE[cle].niveau === 'vital').sort();
  assert.deepEqual(vitaux, ['addiction', 'alimentaire', 'hebergement', 'sante', 'violences']);
});
