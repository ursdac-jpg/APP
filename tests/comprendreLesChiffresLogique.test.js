const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module "Comprendre les chiffres" (jumeau de
// "Comprendre le cadre", 2e sous-carte de "Se tenir informe"). Ajoute
// lors du chantier de stabilisation (audit du 2026-09-13) : ce module
// n'avait jusque-la aucune couverture Node. Perimetre cible sur le
// parseur de zones d'emploi, le rendu generique "ecarts" (reutilise 4
// fois : zones d'emploi, departements/region, regions/France,
// professions sante), le calcul de base du graphe en barres (LECONS
// 9.36 -- ne jamais exagerer un petit ecart) et le calcul de tendance,
// pas exhaustif sur les 2900+ lignes du fichier (essentiellement du
// rendu HTML et du branchement DOM).
require('./_domStub').installerStubDom();

const {
  _comprendreLesChiffresParserZonesEmploi,
  _comprendreLesChiffresRenduEcartsGenerique,
  _comprendreLesChiffresRenduGraphe,
  _comprendreLesChiffresTendance,
  _comprendreLesChiffresNombre,
  _comprendreLesChiffresFormatNombre
} = require('../modules/comprendre-les-chiffres/index.js');

// ---------- _comprendreLesChiffresNombre ----------

test('_comprendreLesChiffresNombre : extrait le premier nombre, virgule ou point, avec ou sans unite', () => {
  assert.equal(_comprendreLesChiffresNombre('environ 7,8 %'), 7.8);
  assert.equal(_comprendreLesChiffresNombre('19 000'), 19000);
  assert.equal(_comprendreLesChiffresNombre('-0,1 %'), -0.1);
});

test('_comprendreLesChiffresNombre : aucun nombre trouve renvoie null, jamais NaN', () => {
  assert.equal(_comprendreLesChiffresNombre('rien de chiffre'), null);
  assert.equal(_comprendreLesChiffresNombre(''), null);
});

// ---------- _comprendreLesChiffresFormatNombre ----------

test('_comprendreLesChiffresFormatNombre : espace comme separateur de milliers au-dela de 1000', () => {
  assert.equal(_comprendreLesChiffresFormatNombre(19000), '19 000');
});

test('_comprendreLesChiffresFormatNombre : virgule francaise, un seul chiffre apres la virgule sous 1000', () => {
  assert.equal(_comprendreLesChiffresFormatNombre(7.85), '7,9');
  assert.equal(_comprendreLesChiffresFormatNombre(7), '7');
});

// ---------- _comprendreLesChiffresTendance ----------

test('_comprendreLesChiffresTendance : ecart au-dela du seuil donne hausse ou baisse', () => {
  assert.equal(_comprendreLesChiffresTendance(null, { valeur: '7.0', anPrecedent: '8.0' }).mot, 'en légère baisse');
  assert.equal(_comprendreLesChiffresTendance(null, { valeur: '9.0', anPrecedent: '8.0' }).mot, 'en légère hausse');
});

test('_comprendreLesChiffresTendance : ecart sous le seuil (2% de la valeur, minimum 0,05) donne stable', () => {
  assert.equal(_comprendreLesChiffresTendance(null, { valeur: '8.0', anPrecedent: '7.9' }).mot, 'à peu près stable');
});

test('_comprendreLesChiffresTendance : valeurEstVariation lit directement le signe de la valeur (emploi salarie)', () => {
  assert.equal(_comprendreLesChiffresTendance({ valeurEstVariation: true }, { valeur: '-0.1' }).mot, 'en légère baisse');
  assert.equal(_comprendreLesChiffresTendance({ valeurEstVariation: true }, { valeur: '0.01' }).mot, 'à peu près stable');
});

test('_comprendreLesChiffresTendance : ni valeur ni precedent exploitables renvoie null', () => {
  assert.equal(_comprendreLesChiffresTendance(null, { valeur: '', anPrecedent: '' }), null);
});

// ---------- _comprendreLesChiffresRenduGraphe (LECONS 9.36) ----------
// Regle : la base du graphe ne doit jamais exagerer un petit ecart --
// "0,2 point ne doit pas faire une barre 5 fois plus courte".

test('_comprendreLesChiffresRenduGraphe : un petit ecart entre points reste visuellement proportionne (jamais ecrase)', () => {
  var svg = _comprendreLesChiffresRenduGraphe({ serie: [{ label: 'T1 2026', v: 7.5 }, { label: 'T2 2026', v: 7.7 }] });
  var hauteurs = svg.match(/height="([\d.]+)"/g).map((h) => parseFloat(h.match(/[\d.]+/)[0]));
  var [hMin, hMax] = hauteurs;
  assert.ok(hMax > hMin, 'la plus grande valeur doit donner la plus haute barre');
  // La regle LECONS 9.36 interdit un ecart demesure (ex. barre 5x plus
  // courte) pour un petit ecart de donnees : le ratio doit rester proche de 1.
  assert.ok(hMin / hMax > 0.5, 'un ecart de 0,2 point ne doit pas ecraser la plus petite barre (ratio observe : ' + (hMin / hMax).toFixed(2) + ')');
});

test('_comprendreLesChiffresRenduGraphe : toutes les valeurs identiques donnent des barres de meme hauteur (pas de division par zero)', () => {
  var svg = _comprendreLesChiffresRenduGraphe({ serie: [{ label: 'T1', v: 7.5 }, { label: 'T2', v: 7.5 }] });
  var hauteurs = svg.match(/height="([\d.]+)"/g);
  assert.equal(hauteurs[0], hauteurs[1]);
});

test('_comprendreLesChiffresRenduGraphe : moins de 2 points, rien a tracer (chaine vide)', () => {
  assert.equal(_comprendreLesChiffresRenduGraphe({ serie: [{ label: 'T1', v: 5 }] }), '');
  assert.equal(_comprendreLesChiffresRenduGraphe({ serie: [] }), '');
});

// ---------- _comprendreLesChiffresRenduEcartsGenerique ----------
// Coeur de rendu partage par les 4 blocs "ecarts" du module (zones
// d'emploi, departements/region, regions/France, professions sante).

test('_comprendreLesChiffresRenduEcartsGenerique : sans items, rien a afficher', () => {
  assert.equal(_comprendreLesChiffresRenduEcartsGenerique([], {}, {}), '');
  assert.equal(_comprendreLesChiffresRenduEcartsGenerique(null, {}, {}), '');
});

test('_comprendreLesChiffresRenduEcartsGenerique : barres mises a l\'echelle sur le max des items affiches (jamais une echelle fixe)', () => {
  var items = [
    { nom: 'Zone A', valeur: '7.5', stats: {}, sourcesCles: [], paragraphes: [] },
    { nom: 'Zone B', valeur: '15', stats: {}, sourcesCles: [], paragraphes: [] }
  ];
  var html = _comprendreLesChiffresRenduEcartsGenerique(items, {}, { icone: 'bi-x', titre: 'Titre', intro: 'Intro' });
  var pct = html.match(/width:(\d+)%/g).map((p) => parseInt(p.match(/\d+/)[0], 10));
  assert.equal(pct[0], 50);
  assert.equal(pct[1], 100);
});

test('_comprendreLesChiffresRenduEcartsGenerique : chaque item et ses chiffres secondaires apparaissent dans le rendu', () => {
  var items = [{ nom: 'Zone A', valeur: '7.5', stats: { chomage_recensement: '8,2' }, sourcesCles: ['insee'], paragraphes: ['Texte de contexte.'] }];
  var sourcesMap = { insee: { titre: 'INSEE', url: 'https://insee.fr' } };
  var html = _comprendreLesChiffresRenduEcartsGenerique(items, sourcesMap, { icone: 'bi-x', titre: 'Titre', intro: 'Intro' });
  assert.ok(html.includes('Zone A'));
  assert.ok(html.includes('Chômage (recensement 2023)'));
  assert.ok(html.includes('Texte de contexte.'));
  assert.ok(html.includes('https://insee.fr'));
});

test('_comprendreLesChiffresRenduEcartsGenerique : une source jamais citee par un item n\'est pas affichee (pas de pastille orpheline)', () => {
  var items = [{ nom: 'Zone A', valeur: '7.5', stats: {}, sourcesCles: [], paragraphes: [] }];
  var sourcesMap = { insee: { titre: 'INSEE', url: 'https://insee.fr' } };
  var html = _comprendreLesChiffresRenduEcartsGenerique(items, sourcesMap, { icone: 'bi-x', titre: 'Titre', intro: 'Intro' });
  assert.ok(!html.includes('INSEE'));
});

// ---------- _comprendreLesChiffresParserZonesEmploi ----------

test('_comprendreLesChiffresParserZonesEmploi : sans frontmatter valide, renvoie null', () => {
  assert.equal(_comprendreLesChiffresParserZonesEmploi('pas de frontmatter'), null);
});

test('_comprendreLesChiffresParserZonesEmploi : departements, zones, valeur et chiffres secondaires reconnus extraits', () => {
  var md = '---\n' +
    'periode: T2 2026\n' +
    'verifie_le: 2026-09\n' +
    'sources:\n' +
    '  - insee | INSEE | https://insee.fr\n' +
    '---\n' +
    '# 24\n' +
    '## Zone A\n' +
    'valeur: 7.5\n' +
    'sources: insee\n' +
    'chomage_recensement: 8,2\n' +
    'Texte libre ici.\n';
  var out = _comprendreLesChiffresParserZonesEmploi(md);
  assert.equal(out.periode, 'T2 2026');
  assert.deepEqual(out.sources.insee, { titre: 'INSEE', url: 'https://insee.fr' });
  assert.equal(out.parDep['24'].length, 1);
  var zone = out.parDep['24'][0];
  assert.equal(zone.nom, 'Zone A');
  assert.equal(zone.valeur, '7.5');
  assert.deepEqual(zone.sourcesCles, ['insee']);
  assert.equal(zone.stats.chomage_recensement, '8,2');
  assert.deepEqual(zone.paragraphes, ['Texte libre ici.']);
});

test('_comprendreLesChiffresParserZonesEmploi : une cle inconnue (hors liste fixe) n\'est jamais prise pour un chiffre secondaire', () => {
  var md = '---\nperiode: T2 2026\n---\n# 24\n## Zone A\nvaleur: 7.5\ncle_inventee: 42\n';
  var out = _comprendreLesChiffresParserZonesEmploi(md);
  assert.equal(out.parDep['24'][0].stats, undefined);
  assert.ok(out.parDep['24'][0].paragraphes.some((p) => p.includes('cle_inventee')));
});

test('_comprendreLesChiffresParserZonesEmploi : plusieurs departements et plusieurs zones restent bien separes', () => {
  var md = '---\nperiode: T2 2026\n---\n# 24\n## Zone A\nvaleur: 7.5\n# 87\n## Zone B\nvaleur: 6.2\n';
  var out = _comprendreLesChiffresParserZonesEmploi(md);
  assert.deepEqual(Object.keys(out.parDep), ['24', '87']);
  assert.equal(out.parDep['24'][0].nom, 'Zone A');
  assert.equal(out.parDep['87'][0].nom, 'Zone B');
});
