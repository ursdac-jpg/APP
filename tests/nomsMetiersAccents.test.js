// Noms des métiers (tâche A4a de « Ma synthèse », défaut trouvé le 18/11/2026) : le fichier du ROME écrivait « Eleveur », « Educateur », « Accompagnant d'eleves »...
// sans accent sur la majuscule. Le répertoire des appellations (data/repertoireRome.js) les écrit correctement : aucun nom de la base ne doit s'en écarter par les seuls accents.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const M = require('../data/metiers.js');

const racine = path.join(__dirname, '..');
const REP = new Function(fs.readFileSync(path.join(racine, 'data', 'repertoireRome.js'), 'utf8') + '; return REPERTOIRE_ROME;')();
const sansAccent = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const cle = (s) => sansAccent(s).toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();

test('noms des métiers : aucun nom de la base ne diffère du répertoire du ROME par les seuls accents', () => {
  const parCode = {};
  REP.metiers.forEach((l) => { (parCode[l[1] + '|' + cle(l[0])] = parCode[l[1] + '|' + cle(l[0])] || []).push(l[0]); });
  const defauts = [];
  M.baseMetiers.forEach((m) => {
    const candidats = parCode[m.rome + '|' + cle(m.nom)];
    if (!candidats || candidats.indexOf(m.nom) !== -1) { return; }
    const memeAuxAccentsPres = candidats.filter((x) => sansAccent(x) === sansAccent(m.nom));
    if (memeAuxAccentsPres.length) { defauts.push(m.nom + ' => ' + memeAuxAccentsPres[0]); }
  });
  assert.deepEqual(defauts, []);
});

test('noms des métiers : les noms corrigés se retrouvent encore par leur ancienne écriture sans accent (sessions et listes déjà gardées)', () => {
  [['Educateur canin', 'Éducateur canin'], ['Eleveur de bovins', 'Éleveur de bovins'], ['Animateur evenementiel', 'Animateur événementiel'],
    ["Accompagnant d'eleves en situation de handicap (AESH)", "Accompagnant d'élèves en situation de handicap (AESH)"], ['Etalagiste', 'Étalagiste']].forEach(([ancien, nouveau]) => {
    // La recherche par nom de l'application (metierParNom, première étape) compare les noms normalisés : sans accent, sans majuscule.
    const trouver = (nom) => M.baseMetiers.filter((m) => M.normaliserTexte(m.nom) === M.normaliserTexte(nom))[0];
    assert.ok(trouver(ancien), ancien + ' introuvable');
    assert.equal(trouver(ancien).nom, nouveau);
    assert.equal(trouver(nouveau).nom, nouveau);
  });
});

test('générateur du ROME : la table des mots à accentuer remet les accents sans toucher au reste du nom', () => {
  const source = fs.readFileSync(path.join(racine, 'scripts', 'importRome', 'genererMetiersRome.js'), 'utf8');
  const bloc = source.match(/const MOTS_A_ACCENTUER[\s\S]*?\n}\n/);
  assert.ok(bloc, 'table introuvable');
  const corriger = new Function(bloc[0].replace(/\n}\n$/, '\n}\n') + '; return corrigerAccentsNom;')();
  assert.equal(corriger("Eleveur d'animaux sauvages"), "Éleveur d'animaux sauvages");
  assert.equal(corriger("Administrateur de l'Etat"), "Administrateur de l'État");
  assert.equal(corriger('Professeur de Français Langue Etrangère (FLE)'), 'Professeur de Français Langue Étrangère (FLE)');
  assert.equal(corriger('Electricien de maintenance'), 'Électricien de maintenance');
  assert.equal(corriger('Conseiller de vente'), 'Conseiller de vente');
});
