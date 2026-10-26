// « Mode fidèle » de la voie 3 de « Reprendre mon CV » (Lot 7) : tout ce que la personne a écrit apparaît, rien n'est déduit ni retiré.
// Éteint partout ailleurs : sans le drapeau, le CV se construit exactement comme avant.
// Les deux fichiers du noyau CV sont des scripts du navigateur (fonctions globales) : on les charge dans un contexte isolé, avec des fonctions de l'application simulées.
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const ctx = { console: console };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.savoirFaireActuels = () => ['Déduit des loisirs'];
ctx.savoirEtreActuels = () => ['Endurance'];
ctx.obtenirSavoirs = () => ['Savoir deviné d’après un métier'];
vm.createContext(ctx);
['modules/cv-core/extraireDonneesCV.js', 'modules/cv-core/normaliserDonneesCV.js'].forEach((f) => {
  vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f });
});
const extraire = (d) => ctx.extraireDonneesCV(d);
const normaliser = (d) => ctx.normaliserDonneesCV(d);

const dossierBase = (extra) => Object.assign({
  identite: { nom: 'Martin', prenom: 'Camille' },
  competencesCV: ['Gestion des contrats', 'Rigueur', 'Accueil'], savoirEtreCV: ['Rigueur'], savoirsCV: ['Assurance'],
  experiences: [{ poste: 'Agent', entreprise: 'Sécuritas', lieu: '', dateDebut: '2020-01', dateFin: '2022-01', missions: 'Agent\nSurveiller les accès' }]
}, extra || {});

test('sans le drapeau : les compétences déduites et devinées sont lues, comme avant', () => {
  const r = extraire(dossierBase());
  assert.deepStrictEqual(Array.from(r.competences.savoirFaire), ['Déduit des loisirs']);
  assert.deepStrictEqual(Array.from(r.competences.savoirEtre), ['Endurance']);
  assert.deepStrictEqual(Array.from(r.competences.savoirs), ['Savoir deviné d’après un métier']);
});

test('avec le drapeau : seules les listes écrites par la personne sont lues, rangées comme elle les a rangées', () => {
  const r = extraire(dossierBase({ modeFidele: true }));
  assert.deepStrictEqual(Array.from(r.competences.savoirFaire), ['Gestion des contrats', 'Accueil']);
  assert.deepStrictEqual(Array.from(r.competences.savoirEtre), ['Rigueur']);
  assert.deepStrictEqual(Array.from(r.competences.savoirs), ['Assurance']);
});

test('mode fidèle : aucune mission n’est retirée ; sans le drapeau, une mission qui répète le poste l’est toujours', () => {
  const avec = normaliser(dossierBase({ modeFidele: true }));
  const sans = normaliser(dossierBase());
  assert.strictEqual(avec.experiences[0].missions, 'Agent\nSurveiller les accès');
  assert.strictEqual(sans.experiences[0].missions, 'Surveiller les accès');
  assert.strictEqual(avec.meta.modeFidele, true);
  assert.strictEqual(sans.meta.modeFidele, false);
});

test('le drapeau ne vaut que pour true : une valeur approximative ne change rien', () => {
  ['oui', 1, 'true', {}].forEach((v) => {
    assert.strictEqual(normaliser(dossierBase({ modeFidele: v })).meta.modeFidele, false);
  });
});
