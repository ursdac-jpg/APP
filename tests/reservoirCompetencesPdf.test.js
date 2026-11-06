const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// cvPdfDonnees.js est un script de navigateur (sans export) : on le charge dans un contexte isole.
const contexte = {};
vm.createContext(contexte);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfDonnees.js', 'utf8'), contexte);
// (tableaux d'un autre contexte : comparaison via JSON pour ignorer la difference de prototype)
const reservoir = function (x) { return JSON.parse(JSON.stringify(contexte.construireReservoirCompetencesPdf(x))); };

test('reservoir de competences : professionnelles = savoir-faire + savoirs, sans doublon (accents et casse ignores)', () => {
  const r = reservoir({ competences: { savoirFaire: ['Préparation de commandes', 'Conduite de chariots'], savoirs: ['preparation de commandes', 'Hygiène'], savoirEtre: [] } });
  assert.deepEqual(r.pro, ['Préparation de commandes', 'Conduite de chariots', 'Hygiène']);
});

test('reservoir de competences : comportementales = savoir-etre + competences personnelles (formes texte ou objet)', () => {
  const r = reservoir({ competences: { savoirEtre: ['Patient', 'Rigueur'] }, competencesPersonnelles: [{ competence: 'rigueur' }, { competence: 'Ponctualité' }] });
  assert.deepEqual(r.comportementales, ['Patient', 'Rigueur', 'Ponctualité']);
});

test('reservoir de competences : dossier vide ne plante pas', () => {
  assert.deepEqual(reservoir({}), { pro: [], comportementales: [] });
  assert.deepEqual(reservoir(null), { pro: [], comportementales: [] });
});

// Maquette v3 (2026-11-04) : domaine choisi par la personne pour un metier saisi librement.
const contexteSecteurs = {};
vm.createContext(contexteSecteurs);
vm.runInContext(fs.readFileSync(__dirname + '/../data/competencesSecteurs.js', 'utf8') + '\nthis.COMPETENCES_SECTEURS = COMPETENCES_SECTEURS;', contexteSecteurs);
vm.runInContext(fs.readFileSync(__dirname + '/../modules/cv-pdf-html/cvPdfDonnees.js', 'utf8'), contexteSecteurs);

test('secteur du referentiel : le domaine choisi par la personne passe avant celui de l\'assistant', () => {
  const r = contexteSecteurs.cvResoudreSecteurReferentiel(null, null, 'Sécurité', 'Artisanat et création');
  assert.equal(r.nom, 'Artisanat et création');
  assert.equal(r.origine, 'metier');
});

test('secteur du referentiel : sans domaine choisi, celui de l\'assistant reste utilise ; la fiche du metier passe toujours en premier', () => {
  assert.equal(contexteSecteurs.cvResoudreSecteurReferentiel(null, null, 'Sécurité', '').origine, 'assistant');
  assert.equal(contexteSecteurs.cvResoudreSecteurReferentiel({ secteur: 'Santé et soins' }, null, null, 'Artisanat et création').origine, 'fiche');
});

test('secteur du referentiel : un nom qui n\'est pas l\'un des 21 domaines est ignore', () => {
  assert.equal(contexteSecteurs.cvResoudreSecteurReferentiel(null, null, null, 'Domaine inventé'), null);
});
