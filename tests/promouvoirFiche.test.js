const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('vm');
const { promouvoir, identifiantDepuisNom, retirerDuGenere, insererDansManuel } = require('../scripts/importRome/promouvoirFiche.js');

// Le script de promotion (une fiche du ROME devient une fiche écrite à la main) est essayé ici SANS écrire dans les vrais fichiers :
// on charge les textes obtenus dans un contexte isolé et on vérifie qu'il reste une seule base cohérente.
function charger(texteManuel, texteGenere) {
  const ctx = { console }; vm.createContext(ctx);
  vm.runInContext(texteGenere + ';', ctx);
  vm.runInContext(texteManuel + ';', ctx);
  return { detaillees: vm.runInContext('baseMetiersDetaillees', ctx), generees: vm.runInContext('METIERS_ROME', ctx), base: vm.runInContext('baseMetiers', ctx) };
}

test('promouvoirFiche : la fiche passe du fichier généré au fichier à la main, sans doublon, avec ses listes de départ', () => {
  const avant = promouvoir('Caténairiste', { ecrire: false });
  const { detaillees, generees, base } = charger(avant.nouveauManuel, avant.nouveauGenere);
  const fiche = detaillees.find((m) => m.rome === 'N4406');
  assert.ok(fiche, 'la fiche est dans les fiches à la main');
  assert.equal(fiche.niveau, 'detaillee');
  assert.equal(fiche.nom, 'Caténairiste');
  assert.equal(JSON.stringify(fiche.actions), JSON.stringify(avant.fiche.actions));
  assert.equal(JSON.stringify(fiche.savoirs), JSON.stringify(avant.fiche.savoirs), 'les apostrophes des savoirs sont bien protégées');
  assert.equal(fiche.argumentsCV.length, 0);
  assert.equal(generees.filter((m) => m.rome === 'N4406').length, 0, 'plus dans le fichier généré');
  assert.equal(base.filter((m) => m.rome === 'N4406').length, 1, 'une seule fois dans la base unique');
  assert.equal(detaillees.length, 136);
});

test('promouvoirFiche : retrouve la fiche par code, identifiant ou nom ; refuse une fiche déjà à la main', () => {
  assert.equal(promouvoir('N4406').fiche.id, 'rome_N4406');
  assert.equal(promouvoir('rome_N4406').fiche.id, 'rome_N4406');
  assert.equal(promouvoir('caténairiste').fiche.id, 'rome_N4406');
  assert.throws(() => promouvoir('Couturier'), /Aucune fiche générée/);
});

test('promouvoirFiche : retirer la dernière fiche du fichier généré remet les virgules en ordre', () => {
  const texte = 'var METIERS_ROME = [\n  {"id":"rome_A1"},\n  {"id":"rome_B2"}\n];\n';
  const sans = retirerDuGenere(texte, 'rome_B2');
  assert.equal(sans, 'var METIERS_ROME = [\n  {"id":"rome_A1"}\n];\n');
  assert.doesNotThrow(() => vm.runInNewContext(sans + ';METIERS_ROME'));
  assert.equal(identifiantDepuisNom('Aide d\'élevage (agricole)'), 'aide_d_elevage');
});

test('promouvoirFiche : l\'insertion respecte les fins de ligne du fichier à la main', () => {
  const texte = 'const baseMetiersDetaillees = [\r\n  { id: \'a\' }\r\n];\r\n\r\n/* ------------------------------------------------------------\r\n   UNE SEULE BASE (test)';
  const r = insererDansManuel(texte, '  { id: \'b\' }');
  assert.ok(r.indexOf('\r\n') !== -1 && !/[^\r]\n/.test(r), 'tout en CRLF');
  assert.ok(r.indexOf("{ id: 'a' },\r\n  { id: 'b' }") !== -1);
});
