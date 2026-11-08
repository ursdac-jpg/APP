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
  _comprendreLesChiffresFormatNombre,
  _comprendreLesChiffresVuesAssembler,
  _comprendreLesChiffresVuesBarresHTML,
  _comprendreLesChiffresVuesCamembertHTML,
  _comprendreLesChiffresVuesPct,
  _comprendreLesChiffresParserFiches,
  _comprendreLesChiffresFicheValeur,
  _comprendreLesChiffresFicheFrance,
  _comprendreLesChiffresFicheClassement,
  _comprendreLesChiffresFicheEcart,
  _comprendreLesChiffresSalaireCarteMoyen,
  _comprendreLesChiffresSalaireCarteExtremes,
  _comprendreLesChiffresSalaireCarteMediane,
  _comprendreLesChiffresNiveauVieCarteTerritoire,
  _comprendreLesChiffresPauvreteCarteTerritoire,
  _comprendreLesChiffresPauvreteCarteFrance,
  _comprendreLesChiffresSmicCarteBeneficiaires,
  _comprendreLesChiffresPouvoirAchatCarte,
  _comprendreLesChiffresRenduCarteEntreprises,
  _comprendreLesChiffresCartesEurope,
  _comprendreLesChiffresEuropeCartesDe,
  _comprendreLesChiffresRenduBlocsEurope,
  _comprendreLesChiffresUEGroupe,
  _comprendreLesChiffresUEGroupesFreins,
  _comprendreLesChiffresParserDocAnnuel,
  _comprendreLesChiffresMaFicheTexte,
  _comprendreLesChiffresMaFicheImpressionHTML
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
  var periodes = { chomage_recensement: { debut: null, fin: { genre: 'annee', n: 0, an: 2023 } } };
  var html = _comprendreLesChiffresRenduEcartsGenerique(items, sourcesMap, { icone: 'bi-x', titre: 'Titre', intro: 'Intro', periodes: periodes });
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

// ---------- bloc « Les entreprises ici » (repères d'entreprises, 2026-10-19) ----------
const fsEntreprises = require('node:fs');
const pathEntreprises = require('node:path');
const {
  _comprendreLesChiffresParserEntreprises,
  _comprendreLesChiffresEvolutionEntiers,
  _comprendreLesChiffresDateEnClair,
  _comprendreLesChiffresPeriodeEnClair
} = require('../modules/comprendre-les-chiffres/index.js');

test('entreprises : le vrai fichier se lit, deux départements, nombres entiers, source présente', () => {
  const md = fsEntreprises.readFileSync(pathEntreprises.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu', 'entreprises-departements.md'), 'utf8');
  const doc = _comprendreLesChiffresParserEntreprises(md);
  assert.ok(doc);
  assert.deepEqual(Object.keys(doc.parDep).sort(), ['24', '87']);
  ['24', '87'].forEach((dep) => {
    const d = doc.parDep[dep];
    ['ouvertures', 'ouverturesPrec', 'ventes', 'ventesPrec'].forEach((k) => assert.ok(Number.isInteger(d[k]) && d[k] > 0, dep + ' ' + k));
    assert.ok(doc.sources[d.sourcesCles[0]].url.startsWith('https://'), dep + ' : source');
  });
  ['24', '87'].forEach((dep) => assert.ok(_comprendreLesChiffresPeriodeEnClair(doc.parDep[dep].periodeDu, doc.parDep[dep].periodeAu).startsWith('du '), dep + ' : période en toutes lettres'));
  // le fichier est soit « a-valider » (bloc caché), soit daté après la validation de Denis : les deux états sont normaux
  assert.ok(doc.verifie_le === 'a-valider' || _comprendreLesChiffresDateEnClair(doc.verifie_le) !== null, 'verifie_le : ' + doc.verifie_le);
  // et « a-valider » ne se lit jamais comme une date, donc cache le bloc
  assert.equal(_comprendreLesChiffresDateEnClair('a-valider'), null);
});

test('entreprises : un nombre mal écrit donne null, jamais NaN ; un département inconnu est ignoré', () => {
  const doc = _comprendreLesChiffresParserEntreprises('---\nperiode: x\nverifie_le: 2026-10\n---\n\n# d\n\n## Dordogne\nouvertures: 3 28\nouvertures_an_precedent: abc\n\n## Gironde\nouvertures: 5\n');
  assert.equal(doc.parDep['24'].ouvertures, 328);
  assert.equal(doc.parDep['24'].ouverturesPrec, null);
  assert.deepEqual(Object.keys(doc.parDep), ['24']);
  assert.equal(_comprendreLesChiffresParserEntreprises('pas d\'en-tête'), null);
});

test('entreprises : évolution en mots, stable sous 3 %, jamais de phrase si une donnée manque', () => {
  assert.equal(_comprendreLesChiffresEvolutionEntiers(328, 348), 'en baisse d’environ 6 %');
  assert.equal(_comprendreLesChiffresEvolutionEntiers(206, 192), 'en hausse d’environ 7 %');
  assert.equal(_comprendreLesChiffresEvolutionEntiers(392, 396), 'à peu près stable');
  assert.equal(_comprendreLesChiffresEvolutionEntiers(5, null), '');
  assert.equal(_comprendreLesChiffresEvolutionEntiers(5, 0), '');
});

test('entreprises : date en clair, jour ou mois seulement, sinon null', () => {
  assert.equal(_comprendreLesChiffresDateEnClair('2026-10-18'), '18 octobre 2026');
  assert.equal(_comprendreLesChiffresDateEnClair('2026-02-01'), '1er février 2026');
  assert.equal(_comprendreLesChiffresDateEnClair('2026-12'), 'décembre 2026');
  assert.equal(_comprendreLesChiffresDateEnClair('a-valider'), null);
  assert.equal(_comprendreLesChiffresDateEnClair('2026-13-01'), null);
});

test('entreprises : date écrite en français (jour/mois/année) lue en toutes lettres, date qui n\'existe pas refusée, période complète ou rien', () => {
  assert.equal(_comprendreLesChiffresDateEnClair('18/10/2026'), '18 octobre 2026');
  assert.equal(_comprendreLesChiffresDateEnClair('01/11/2025'), '1er novembre 2025');
  assert.equal(_comprendreLesChiffresDateEnClair('31/02/2026'), null);
  assert.equal(_comprendreLesChiffresDateEnClair('2026-02-31'), null);
  assert.equal(_comprendreLesChiffresPeriodeEnClair('01/11/2025', '18/10/2026'), 'du 1er novembre 2025 au 18 octobre 2026');
  assert.equal(_comprendreLesChiffresPeriodeEnClair('01/11/2025', ''), '');
  assert.equal(_comprendreLesChiffresPeriodeEnClair('', '18/10/2026'), '');
});

// ---------- Lecture en trois façons : Chiffres / Barres / Camembert (consigne 119) ----------

test("vues : sans barres ni camembert, la lecture d'origine est rendue telle quelle (jamais de bouton vide)", () => {
  assert.equal(_comprendreLesChiffresVuesAssembler('carte-x', '<p>origine</p>', [], null), '<p>origine</p>');
  assert.equal(_comprendreLesChiffresVuesAssembler('carte-x', '<p>origine</p>', [{ titre: 't', lignes: [{ nom: 'a', texte: '1', n: 1 }] }], null), '<p>origine</p>');
});

test("vues : « Camembert » n'apparait que s'il y a un camembert, et « Chiffres » reste le panneau ouvert par defaut", () => {
  const g = [{ titre: 't', lignes: [{ nom: 'a', texte: '7 %', n: 7 }, { nom: 'b', texte: '8 %', n: 8 }] }];
  const sans = _comprendreLesChiffresVuesAssembler('carte-x', '<p>origine</p>', g, null);
  assert.ok(/data-comprendre-les-chiffres-vue-lecture="barres"/.test(sans));
  assert.ok(!/data-comprendre-les-chiffres-vue-lecture="camembert"/.test(sans));
  assert.ok(/data-comprendre-les-chiffres-panneau="chiffres">/.test(sans));
  assert.ok(/data-comprendre-les-chiffres-panneau="barres" hidden/.test(sans));
  const avec = _comprendreLesChiffresVuesAssembler('carte-x', '<p>origine</p>', g,
    { titre: 'c', parts: [{ nom: 'u', texte: '47 %', n: 47 }, { nom: 'v', texte: '53 %', n: 53 }] });
  assert.ok(/data-comprendre-les-chiffres-vue-lecture="camembert"/.test(avec));
});

test("vues : les barres partent de zero (jamais d'ecart grossi) et une valeur nulle n'a pas de barre", () => {
  assert.equal(_comprendreLesChiffresVuesPct(50, 100), 50);
  assert.equal(_comprendreLesChiffresVuesPct(7.9, 8.3), 95);
  assert.equal(_comprendreLesChiffresVuesPct(0, 8), 0);
  assert.equal(_comprendreLesChiffresVuesPct(-0.3, 0.3), 100);
});

test("vues : le choix d'ordre n'est propose qu'a partir de cinq lignes, et une baisse est signalee par une fleche", () => {
  const quatre = _comprendreLesChiffresVuesBarresHTML([{ titre: 't', lignes: [1, 2, 3, 4].map((n) => ({ nom: 'l' + n, texte: String(n), n })) }]);
  assert.ok(!/data-comprendre-les-chiffres-ordre/.test(quatre));
  const cinq = _comprendreLesChiffresVuesBarresHTML([{ titre: 't', lignes: [1, 2, 3, 4, 5].map((n) => ({ nom: 'l' + n, texte: String(n), n })) }]);
  assert.equal((cinq.match(/data-comprendre-les-chiffres-ordre=/g) || []).length, 3);
  const signe = _comprendreLesChiffresVuesBarresHTML([{ titre: 't', signe: true, lignes: [{ nom: 'a', texte: '-0,3 %', n: -0.3 }, { nom: 'b', texte: '0,1 %', n: 0.1 }] }]);
  assert.ok(signe.indexOf('&#8600;') >= 0 && signe.indexOf('&#8599;') >= 0 && /zone-ligne baisse/.test(signe));
});

test("vues : le camembert rend des parts qui font le tour complet (100) et refuse un total nul", () => {
  const html = _comprendreLesChiffresVuesCamembertHTML({ titre: 'c', parts: [{ nom: 'u', texte: '39 %', n: 39 }, { nom: 'v', texte: '61 %', n: 61 }] });
  const parts = [...html.matchAll(/data-pct="([\d.]+)"/g)].map((m) => parseFloat(m[1]));
  assert.equal(parts.length, 2);
  assert.ok(Math.abs(parts[0] + parts[1] - 100) < 0.05);
  assert.equal(_comprendreLesChiffresVuesCamembertHTML({ parts: [{ nom: 'u', texte: '0', n: 0 }, { nom: 'v', texte: '0', n: 0 }] }), '');
  assert.equal(_comprendreLesChiffresVuesCamembertHTML({ parts: [{ nom: 'u', texte: '1', n: 1 }] }), '');
});

// ---------- salaires, niveau de vie, Europe (consignes 119 à 123, 2026-11-06) ----------
const fs = require('node:fs');
const path = require('node:path');
const CONTENU = path.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const lireFiche = (f) => _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, f), 'utf8'));
const espaces = (s) => String(s).replace(/\s/g, ' ');

test("fiches : le parseur lit les trois fichiers (groupes, sources datées, un champ par ligne)", () => {
  const S = lireFiche('salaires-insee.md');
  assert.equal(S.ordre.departements.length, 101);
  assert.equal(S.ordre.regions.length, 18);
  assert.equal(S.ordre.france.length, 1);
  assert.match(S.verifie_le, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(S.sources['insee-salaires-2024'].url.startsWith('https://www.insee.fr/'));
  assert.equal(S.sources['insee-premiere-2079'].url, 'https://www.insee.fr/fr/statistiques/8657156');
  const dordogne = _comprendreLesChiffresFicheValeur(S, 'departements', 'Dordogne', 'salaire_net_mensuel');
  assert.equal(dordogne.n, 2194);
  assert.equal(dordogne.nom, 'Dordogne');
  assert.equal(dordogne.src.cle, 'insee-salaires-2024');
  // « Guadeloupe » existe comme département ET comme région : chaque groupe a la sienne
  assert.ok(_comprendreLesChiffresFicheValeur(S, 'departements', 'Guadeloupe', 'salaire_net_mensuel'));
  assert.ok(_comprendreLesChiffresFicheValeur(S, 'regions', 'Guadeloupe', 'salaire_net_mensuel'));
  // les chiffres nationaux citent leur propre source
  assert.equal(_comprendreLesChiffresFicheFrance(S, 'salaire_mediane').n, 2190);
  assert.equal(_comprendreLesChiffresFicheFrance(S, 'salaire_mediane').src.cle, 'insee-premiere-2079');
  assert.equal(_comprendreLesChiffresFicheFrance(S, 'salaire_net_mensuel').src.cle, 'insee-salaires-2024');
  const E = lireFiche('europe-eurostat.md');
  assert.equal(E.ordre.pays.length, 27);
  assert.equal(_comprendreLesChiffresFicheValeur(E, 'pays', 'France', 'niveau_des_prix').n > 100, true);
  assert.equal(_comprendreLesChiffresFicheValeur(E, 'pays', 'Suède', 'salaire_minimum_mensuel'), null, 'un pays sans salaire minimum légal n’a pas la ligne');
  assert.equal(_comprendreLesChiffresParserFiches('pas d’en-tête'), null);
});

test("fiches : le classement va du plus haut au plus bas, sans rang écrit nulle part", () => {
  const S = lireFiche('salaires-insee.md');
  const cl = _comprendreLesChiffresFicheClassement(S, 'departements', 'salaire_net_mensuel');
  assert.equal(cl.length, 101);
  for (let i = 1; i < cl.length; i++) { assert.ok(cl[i - 1].n >= cl[i].n); }
  const html = _comprendreLesChiffresSalaireCarteExtremes(S);
  assert.ok(html.length > 0);
  assert.ok(!/\d+(er|e|ème)\s+(rang|sur)/i.test(html) && !/classement/i.test(html), 'on situe, on ne classe pas');
});

test("fiches : la carte du salaire moyen compare le département au plus haut, au plus bas et à la France, et chiffre l’écart", () => {
  const S = lireFiche('salaires-insee.md');
  const html = espaces(_comprendreLesChiffresSalaireCarteMoyen(S, 'dep', 'Dordogne', 'la Dordogne'));
  assert.match(html, /2 194 €/);
  assert.match(html, /France entière/);
  assert.match(html, /\(le mieux payé\)/);
  assert.match(html, /\(le moins bien payé\)/);
  assert.match(html, /20 % sous la moyenne de la France/);
  assert.match(html, /data-comprendre-les-chiffres-vue-lecture="barres"/);
  assert.ok(!/data-comprendre-les-chiffres-vue-lecture="camembert"/.test(html), 'un salaire n’est pas la part d’un tout');
});

test("fiches : une carte dont le chiffre manque, ou dont le territoire est inconnu, n’est pas affichée (jamais de rubrique vide)", () => {
  const S = lireFiche('salaires-insee.md');
  assert.equal(_comprendreLesChiffresSalaireCarteMoyen(S, 'dep', 'Atlantide', 'l’Atlantide'), '');
  const sansMediane = _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, 'salaires-insee.md'), 'utf8').replace(/^salaire_mediane:.*\n/m, ''));
  assert.equal(_comprendreLesChiffresSalaireCarteMediane(sansMediane), '');
  const N = lireFiche('niveau-de-vie-insee.md');
  assert.equal(_comprendreLesChiffresNiveauVieCarteTerritoire(N, 'dep', 'Atlantide', 'l’Atlantide'), '');
  assert.ok(_comprendreLesChiffresNiveauVieCarteTerritoire(N, 'dep', 'Haute-Vienne', 'la Haute-Vienne').length > 0);
});

test("fiches : l’Europe cite les pays sans salaire minimum légal d’après le fichier, et situe la France sans la classer", () => {
  const E = lireFiche('europe-eurostat.md');
  const html = espaces(_comprendreLesChiffresCartesEurope(E));
  assert.match(html, /Danemark, Italie, Autriche, Finlande, Suède/);
  assert.match(html, /Voir tous les pays \(22\)/);
  assert.match(html, /Voir tous les pays \(27\)/);
  assert.ok(!/classement/i.test(html));
});

test("fiches : l’écart se dit avec des mots, sous, au-dessus ou au niveau", () => {
  assert.match(espaces(_comprendreLesChiffresFicheEcart(80, 100, 'la moyenne')), /20 % sous la moyenne/);
  assert.match(espaces(_comprendreLesChiffresFicheEcart(110, 100, 'la moyenne')), /10 % au-dessus de la moyenne/);
  assert.match(_comprendreLesChiffresFicheEcart(100, 100, 'la moyenne'), /au niveau de la moyenne/);
});

test("vue Union européenne : chaque indicateur donne deux barres (France, moyenne UE-27), et rien si un chiffre manque ou reste à vérifier", () => {
  const g = _comprendreLesChiffresUEGroupe('Taux de chômage', '8,5 %', '6,2 %');
  assert.deepEqual(g.lignes.map((l) => [l.nom, l.n]), [['France', 8.5], ['Moyenne UE-27', 6.2]]);
  assert.equal(_comprendreLesChiffresUEGroupe('x', '8,5 %', ''), null);
  assert.equal(_comprendreLesChiffresUEGroupe('x', 'à vérifier', '6,2 %'), null);
  const doc = _comprendreLesChiffresParserDocAnnuel(fs.readFileSync(path.join(CONTENU, 'ue-2026.md'), 'utf8').replace(/\r\n/g, '\n'));
  const freins = doc.sections.filter((s) => /frein/i.test(s.slug))[0];
  const groupes = _comprendreLesChiffresUEGroupesFreins(freins);
  assert.ok(groupes.length >= 4, 'les freins comparés se lisent en barres');
  groupes.forEach((x) => assert.equal(x.lignes.length, 2));
});

test("Ma fiche de chiffres : le texte copié donne, pour chaque chiffre, son territoire, sa question, sa valeur et sa source, sans tiret long", () => {
  const texte = _comprendreLesChiffresMaFicheTexte([
    { territoire: 'Dordogne (24)', q: 'Quel est le salaire net mensuel moyen ?', valeur: '2 194 € net par mois', source: 'Insee, publié le 4 décembre 2025' },
    { territoire: 'France', q: 'Combien gagne un salarié ?', valeur: '2 190 €', source: '' }
  ], '2026-11-06');
  const lignes = texte.split('\n');
  assert.equal(lignes[0], 'Ma fiche de chiffres, au 6 novembre 2026');
  assert.match(texte, /1\. Dordogne \(24\) : Quel est le salaire net mensuel moyen \? 2 194 € net par mois\. Source : Insee, publié le 4 décembre 2025\./);
  assert.match(texte, /2\. France : Combien gagne un salarié \? 2 190 €\.$/);
  assert.ok(!/[\u2014\u2013]/.test(texte));
  assert.equal(_comprendreLesChiffresMaFicheTexte([], '2026-11-06').split('\n').length, 3, 'une fiche vide ne contient que son en-tête');
});

test("fiches : l’inflation par pays est lue dans le fichier, chaque pays cite sa source Eurostat, la France est située sans classement", () => {
  const E = lireFiche('europe-eurostat.md');
  assert.equal(_comprendreLesChiffresFicheClassement(E, 'pays', 'inflation_annuelle').length, 27);
  const fr = _comprendreLesChiffresFicheValeur(E, 'pays', 'France', 'inflation_annuelle');
  assert.equal(fr.src.cle, 'eurostat-inflation');
  assert.ok(fr.n > -5 && fr.n < 30);
  const html = espaces(_comprendreLesChiffresCartesEurope(E));
  assert.match(html, /pays par pays \?/);
  assert.match(html, /Voir tous les pays \(27\)/);
  assert.ok(!/classement/i.test(html));
});

test("fiches : le taux de pauvreté est lu dans le fichier, situé face au plus haut, au plus bas et à la France, sans rang", () => {
  const N = lireFiche('niveau-de-vie-insee.md');
  const d = _comprendreLesChiffresFicheValeur(N, 'departements', 'Dordogne', 'taux_pauvrete');
  assert.equal(d.n, 17.1);
  assert.equal(d.src.cle, 'insee-pauvrete-2023');
  assert.equal(_comprendreLesChiffresFicheFrance(N, 'taux_pauvrete').n, 15.9);
  const html = espaces(_comprendreLesChiffresPauvreteCarteTerritoire(N, 'dep', 'Dordogne', 'la Dordogne'));
  assert.match(html, /17,1 %/);
  assert.match(html, /points? au-dessus de la France métropolitaine/);
  assert.ok(!/classement/i.test(html));
  assert.equal(_comprendreLesChiffresPauvreteCarteTerritoire(N, 'dep', 'Atlantide', 'l’Atlantide'), '', 'territoire inconnu : pas de carte vide');
  assert.ok(_comprendreLesChiffresPauvreteCarteFrance(N).length > 0);
});

test("Smic (Dares) : la carte dit « bénéficiaires de la revalorisation », cite la Dares, et disparaît si le chiffre manque", () => {
  const D = lireFiche('smic-dares.md');
  assert.equal(_comprendreLesChiffresFicheFrance(D, 'part_beneficiaires_smic').n, 11.8);
  assert.equal(_comprendreLesChiffresFicheFrance(D, 'part_beneficiaires_smic').src.cle, 'dares-smic-2026');
  const html = espaces(_comprendreLesChiffresSmicCarteBeneficiaires(D));
  assert.match(html, /11,8 %/);
  assert.match(html, /25,6 %/);
  assert.match(html, /0,6 point sous le niveau de novembre 2024 \(12,4 %\)/);
  assert.match(html, /dares\.travail-emploi\.gouv\.fr\/publication\/la-revalorisation-du-smic-au-1er-janvier-2026/);
  assert.ok(!/payés au Smic/.test(html), 'la Dares compte les bénéficiaires de la hausse, pas les salariés payés au Smic');
  assert.ok(!/[–—]/.test(html));
  const sans = _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, 'smic-dares.md'), 'utf8').replace(/^part_beneficiaires_smic: .*\n/m, ''));
  assert.equal(_comprendreLesChiffresSmicCarteBeneficiaires(sans), '');
});

test("Pouvoir d'achat (Insee) : la carte dit le sens, garde les chiffres négatifs, cite l'Insee, et disparaît si le chiffre manque", () => {
  const D = lireFiche('pouvoir-achat-insee.md');
  assert.equal(_comprendreLesChiffresFicheFrance(D, 'pouvoir_achat_2025').n, -0.7);
  assert.equal(_comprendreLesChiffresFicheFrance(D, 'pouvoir_achat_2024').n, 2.2);
  assert.equal(_comprendreLesChiffresFicheFrance(D, 'pouvoir_achat_2025').src.cle, 'insee-comptes-nation-2025');
  const html = espaces(_comprendreLesChiffresPouvoirAchatCarte(D));
  assert.match(html, /-0,7 %/);
  assert.match(html, /a baissé, après \+2,2 % en 2024/);
  assert.match(html, /insee\.fr\/fr\/statistiques\/8996855/);
  assert.match(html, /relevé le 6 novembre 2026/);
  assert.ok(!/20\d\d-\d\d-\d\d/.test(html), 'aucune date à l’anglo-saxonne');
  assert.ok(!/[–—]/.test(html));
  // les points de chaque cause s'additionnent bien en pouvoir d'achat de l'année (à l'arrondi près)
  const somme = ['activite', 'patrimoine', 'prestations', 'impots', 'prix', 'demographie'].reduce((t, c) => t + _comprendreLesChiffresFicheFrance(D, 'pouvoir_achat_contribution_' + c + '_2025').n, 0);
  assert.ok(Math.abs(somme - (-0.7)) < 0.15, 'les causes expliquent le pouvoir d’achat : ' + somme);
  const sans = _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, 'pouvoir-achat-insee.md'), 'utf8').replace(/\r\n/g, '\n').replace(/^pouvoir_achat_\d{4}: .*\n/gm, ''));
  assert.equal(_comprendreLesChiffresPouvoirAchatCarte(sans), '', 'plus aucune année dans le fichier : pas de carte');
  // Depuis la consigne 145, la carte suit la dernière année du fichier : sans 2025, elle dit 2024 (jamais une année périmée écrite dans le code).
  const sans2025 = _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, 'pouvoir-achat-insee.md'), 'utf8').replace(/\r\n/g, '\n').replace(/^pouvoir_achat_2025: .*\n/m, ''));
  assert.match(_comprendreLesChiffresPouvoirAchatCarte(sans2025), /de pouvoir d’achat en 2024/);
});

test("Entreprises (BODACC) : la carte offre Chiffres et Barres, compare le même département à lui-même un an plus tôt, jamais un autre", () => {
  const src = { titre: 'BODACC, annonces commerciales', url: 'https://bodacc-datadila.opendatasoft.com/' };
  const html = espaces(_comprendreLesChiffresRenduCarteEntreprises('entreprises-test', 'Combien ?', 431, 422, 'Phrase.', '', '1er novembre 2025 au 18 octobre 2026', src));
  assert.match(html, /data-comprendre-les-chiffres-vue-lecture="chiffres"/);
  assert.match(html, /data-comprendre-les-chiffres-vue-lecture="barres"/);
  assert.ok(!/data-comprendre-les-chiffres-vue-lecture="camembert"/.test(html), 'pas de camembert : ce ne sont pas les parts d\u2019un tout');
  assert.match(html, /Période relevée/);
  assert.match(html, /Même période un an plus tôt/);
  assert.match(html, /à peu près stable/);
  assert.ok(!/Dordogne|Haute-Vienne/.test(html), 'un seul territoire, jamais le nom d\u2019un autre');
  assert.ok(!/[–—]/.test(html));
  const sansPrec = espaces(_comprendreLesChiffresRenduCarteEntreprises('entreprises-test2', 'Combien ?', 12, null, 'Phrase.', '', '', src));
  assert.ok(!/data-comprendre-les-chiffres-vue-lecture/.test(sansPrec), 'sans année précédente, pas de bascule inutile');
});

test("Europe, économie (Eurostat) : 27 pays, France lue, sens des évolutions, énergie datée 2022, aucune carte vide", () => {
  const EE = lireFiche('europe-economie-eurostat.md');
  assert.equal(EE.ordre.pays.length, 27);
  const fr = (c) => _comprendreLesChiffresFicheValeur(EE, 'pays', 'France', c);
  assert.equal(fr('croissance_pib').n, 0.8, 'la croissance de la France est la même que celle de l’Insee (0,8 %)');
  assert.equal(fr('croissance_pib').src.cle, 'eurostat-croissance');
  assert.equal(fr('part_depenses_energie').src.cle, 'eurostat-depenses-energie');
  ['croissance_pib', 'evolution_emploi', 'taux_emploi', 'evolution_remuneration_nette', 'taux_creation_entreprises', 'taux_cessation_entreprises',
    'part_depenses_alimentation', 'part_depenses_logement', 'part_depenses_energie'].forEach((c) => {
    assert.equal(_comprendreLesChiffresFicheClassement(EE, 'pays', c).length, 27, c + ' : un chiffre par pays');
  });
  // le logement comprend l'énergie du logement : la part de l'énergie est donc plus petite que celle du logement, partout
  EE.ordre.pays.forEach((cle) => {
    const f = EE.groupes.pays[cle], n = (c) => _comprendreLesChiffresNombre(f.champs[c]);
    assert.ok(n('part_depenses_energie') < n('part_depenses_logement'), f.nom + ' : énergie < logement');
  });
  const tout = ['salaires', 'economie', 'entreprises', 'budget'].map((g) => espaces(_comprendreLesChiffresEuropeCartesDe(EE, g))).join(' ');
  assert.match(tout, /\+3,6 %/);
  assert.match(tout, /en 2022, en France/);
  assert.match(tout, /Eurostat ne publie pas ce chiffre pour : Bulgarie/);
  assert.match(tout, /relevé le 6 novembre 2026/);
  assert.ok(!/20\d\d-\d\d-\d\d/.test(tout), 'aucune date à l’anglo-saxonne');
  assert.ok(!/[–—]/.test(tout));
  const sans = _comprendreLesChiffresParserFiches(fs.readFileSync(path.join(CONTENU, 'europe-economie-eurostat.md'), 'utf8').replace(/\r\n/g, '\n').replace(/^## France\n[\s\S]*?\n\n/m, ''));
  assert.equal(_comprendreLesChiffresEuropeCartesDe(sans, 'economie'), '', 'sans la France, aucune carte');
});

test("garde-fou (consigne 134) : l'année écrite dans le texte d'une carte est celle du chiffre relevé, sinon le test échoue et le texte doit être relu", () => {
  // Quand le relevé passe à une année plus récente, le texte écrit dans le code (« en 2025 ») ne doit pas rester : ce test casse, on relit l'explication avec Denis.
  const EE = lireFiche('europe-economie-eurostat.md');
  const PA = lireFiche('pouvoir-achat-insee.md');
  const blocs = ['salaires', 'economie', 'entreprises', 'budget'].map((g) => _comprendreLesChiffresEuropeCartesDe(EE, g)).join('') + _comprendreLesChiffresPouvoirAchatCarte(PA);
  const cartes = blocs.split('<div class="comprendre-les-chiffres-indic"').slice(1);
  assert.ok(cartes.length >= 13, 'les cartes à contrôler sont bien là : ' + cartes.length);
  cartes.forEach((c) => {
    const id = (c.match(/id="comprendre-les-chiffres-carte-([a-z-]+)"/) || [])[1];
    const unite = (c.match(/<span class="comprendre-les-chiffres-unite">([^<]*)</) || [])[1] || '';
    const source = (c.match(/D’après ([^<]*)</) || c.match(/comprendre-les-chiffres-source[^>]*>([^<]*)</) || [])[1] || '';
    const annees = (unite.match(/20\d\d/g) || []).map(Number);
    assert.ok(annees.length > 0, id + ' : une année dans le texte du chiffre');
    const plusRecente = Math.max.apply(null, annees);
    assert.ok(source.indexOf(String(plusRecente)) >= 0, id + ' : le texte dit ' + plusRecente + ' mais la source ne le dit pas : « ' + source.slice(0, 120) + ' »');
  });
});

test("Ma fiche de chiffres : la page imprimée porte le titre, la date, chaque chiffre avec sa source, échappe le texte et n'a aucun tiret long", () => {
  const html = _comprendreLesChiffresMaFicheImpressionHTML([
    { territoire: 'la Dordogne', q: 'Quel est le niveau de vie ?', valeur: '24 150 €', source: 'Insee, Filosofi 2023' },
    { territoire: 'France', q: 'Piège <b>', valeur: '11,8 %', source: '' }
  ], '2026-11-06');
  assert.match(html, /<h1>Ma fiche de chiffres<\/h1>/);
  assert.match(html, /Établie le 6 novembre 2026/);
  assert.match(html, /la Dordogne : Quel est le niveau de vie \?<\/strong> 24 150 €<span class="imp-src">Source : Insee, Filosofi 2023/);
  assert.ok(!html.includes('<b>'), 'le texte est échappé');
  assert.equal((html.match(/<li>/g) || []).length, 2);
  assert.ok(!/[–—]/.test(html));
});

test("portrait : le fichier d'age couvre 96 departements, la France metropolitaine et des extremes plausibles", () => {
  const doc = lireFiche('age-insee.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(doc.ordre.france.length, 1);
  assert.ok(_comprendreLesChiffresDateEnClair(doc.verifie_le));
  const cl = (champ) => Object.keys(doc.groupes.departements).map((k) => _comprendreLesChiffresNombre(doc.groupes.departements[k].champs[champ])).sort((a, b) => b - a);
  const ages = cl('part_65_plus');
  assert.ok(ages[0] > 28 && ages[0] < 40 && ages[95] > 8 && ages[95] < 16, 'extremes des 65 ans et plus');
  assert.ok(doc.groupes.departements.dordogne.champs.part_moins_25);
});

test("portrait : le fichier de formation couvre 96 departements et la France metropolitaine", () => {
  const doc = lireFiche('formation-insee.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(doc.ordre.france.length, 1);
  assert.ok(_comprendreLesChiffresDateEnClair(doc.verifie_le));
  const sans = Object.keys(doc.groupes.departements).map((k) => _comprendreLesChiffresNombre(doc.groupes.departements[k].champs.sans_diplome));
  assert.ok(Math.max(...sans) < 45 && Math.min(...sans) > 10, 'sans diplome plausible');
  assert.ok(doc.groupes.departements['haute-vienne'] || doc.groupes.departements['hautevienne'] || Object.keys(doc.groupes.departements).some((k) => /vienne/.test(k)));
});

test("portrait : le fichier des secteurs couvre 96 departements et les cinq parts font un tout", () => {
  const doc = lireFiche('secteurs-insee.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(doc.ordre.france.length, 1);
  const champs = ['etab_commerce_services', 'etab_administration_sante', 'etab_construction', 'etab_agriculture', 'etab_industrie'];
  Object.keys(doc.groupes.departements).forEach((k) => {
    const total = champs.reduce((t, c) => t + _comprendreLesChiffresNombre(doc.groupes.departements[k].champs[c]), 0);
    assert.ok(total > 98 && total < 102, k + ' : parts a ' + total);
  });
});

test("portrait : le fichier du temps partiel couvre 96 departements et la France metropolitaine", () => {
  const doc = lireFiche('temps-partiel-insee.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(doc.ordre.france.length, 1);
  const v = Object.keys(doc.groupes.departements).map((k) => _comprendreLesChiffresNombre(doc.groupes.departements[k].champs.temps_partiel));
  assert.ok(Math.min(...v) > 5 && Math.max(...v) < 30);
});

test("portrait : le fichier des medecins couvre 96 departements et la France metropolitaine", () => {
  const doc = lireFiche('generalistes-insee.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(_comprendreLesChiffresNombre(doc.groupes.france[doc.ordre.france[0]].champs.densite_medecins), 146);
  const v = Object.keys(doc.groupes.departements).map((k) => _comprendreLesChiffresNombre(doc.groupes.departements[k].champs.densite_medecins));
  assert.ok(Math.min(...v) > 50 && Math.max(...v) < 400);
});

test("portrait : le fichier des demandeurs d'emploi couvre 96 departements et la France metropolitaine", () => {
  const doc = lireFiche('demandeurs-dares.md');
  assert.equal(doc.ordre.departements.length, 96);
  assert.equal(doc.ordre.france.length, 1);
  const f = Object.keys(doc.groupes.departements).map((k) => _comprendreLesChiffresNombre(doc.groupes.departements[k].champs.part_femmes));
  assert.ok(Math.min(...f) > 40 && Math.max(...f) < 60);
});
