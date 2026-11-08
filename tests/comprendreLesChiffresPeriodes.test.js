const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
// Périodes structurées (consigne 145 de Denis, 07/11/2026) : dès qu'un fichier de données change de période, les phrases des cartes suivent toutes seules.
require('./_domStub').installerStubDom();
const {
  _comprendreLesChiffresPeriodeLire, _comprendreLesChiffresPeriodeMots, _comprendreLesChiffresPeriodeSubstituer,
  _comprendreLesChiffresParserFiches, _comprendreLesChiffresEuropeCartesDe, _comprendreLesChiffresPouvoirAchatCarte
} = require('../modules/comprendre-les-chiffres/index.js');

const CONTENU = path.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const brut = (f) => fs.readFileSync(path.join(CONTENU, f), 'utf8').replace(/\r\n/g, '\n');
const lireFiche = (f) => _comprendreLesChiffresParserFiches(brut(f));
const espaces = (s) => String(s).replace(/\s/g, ' ');

test('périodes : une année, un trimestre, un semestre et un intervalle se lisent ; le reste est refusé', () => {
  assert.deepEqual(_comprendreLesChiffresPeriodeLire('2025'), { debut: null, fin: { genre: 'annee', n: 0, an: 2025 } });
  assert.equal(_comprendreLesChiffresPeriodeLire('T2 2026').fin.genre, 'trimestre');
  assert.equal(_comprendreLesChiffresPeriodeLire('S2 2025 > S2 2026').debut.an, 2025);
  ['', 'abc', '2025 > ', 'T5 2026', 'S3 2026', '1999', '2024 > 2025 > 2026'].forEach((x) => assert.equal(_comprendreLesChiffresPeriodeLire(x), null, 'refusé : « ' + x + ' »'));
});

test('périodes : les phrases sont écrites en bon français (en 2025, au 1er trimestre 2027, entre le 2e semestre 2026 et le 2e semestre 2027)', () => {
  const doc = { periodes: { a: _comprendreLesChiffresPeriodeLire('2024 > 2025'), b: _comprendreLesChiffresPeriodeLire('T1 2026 > T1 2027'), c: _comprendreLesChiffresPeriodeLire('S2 2026 > S2 2027') } };
  const f = (t, k) => _comprendreLesChiffresPeriodeSubstituer(t, doc, k);
  assert.equal(f('{en_fin} ({entre})', 'a'), 'en 2025 (entre 2024 et 2025)');
  assert.equal(f('{en_fin}, par rapport {en_debut}', 'b'), 'au 1er trimestre 2027, par rapport au 1er trimestre 2026');
  assert.equal(f('{entre}', 'c'), 'entre le 2e semestre 2026 et le 2e semestre 2027');
  assert.equal(f('{fin} et {fin@a}', 'c'), '2e semestre 2027 et 2025', 'une autre source se désigne par @clé');
});

test('périodes : une période absente donne null (la carte n\'est pas affichée plutôt qu\'une phrase sans année)', () => {
  const doc = { periodes: { a: _comprendreLesChiffresPeriodeLire('2025') } };
  assert.equal(_comprendreLesChiffresPeriodeSubstituer('{fin}', doc, 'inconnue'), null);
  assert.equal(_comprendreLesChiffresPeriodeSubstituer('{entre}', doc, 'a'), null, 'un intervalle demandé sur une année seule');
  assert.equal(_comprendreLesChiffresPeriodeSubstituer('sans jeton', doc, 'inconnue'), 'sans jeton');
});

test('périodes : le fichier Europe déclare une période lisible pour chaque source, et sa dernière année est celle du titre de la source', () => {
  const E = lireFiche('europe-economie-eurostat.md');
  const cles = Object.keys(E.sources);
  assert.ok(cles.length >= 12);
  cles.forEach((k) => {
    const per = E.periodes[k];
    assert.ok(per, k + ' : période manquante ou illisible dans le bloc « periodes: »');
    assert.ok(E.sources[k].titre.indexOf(String(per.fin.an)) >= 0, k + ' : le titre de la source ne dit pas ' + per.fin.an);
    if (per.debut && E.sources[k].titre.indexOf('un an plus tôt') < 0) { assert.ok(E.sources[k].titre.indexOf(String(per.debut.an)) >= 0, k + ' : le titre ne dit pas ' + per.debut.an); }
  });
});

test('périodes : si le fichier Europe passe à 2026 et 2027, les cartes disent 2026 et 2027 sans toucher au code', () => {
  let md = brut('europe-economie-eurostat.md');
  md = md.replace('"eurostat-croissance | 2025"', '"eurostat-croissance | 2026"').replace('"eurostat-evolution-remuneration | 2024 > 2025"', '"eurostat-evolution-remuneration | 2025 > 2026"')
    .replace('"eurostat-faillites | T2 2025 > T2 2026"', '"eurostat-faillites | T1 2026 > T1 2027"').replace('"eurostat-depenses-energie | 2022"', '"eurostat-depenses-energie | 2023"');
  const html = espaces(['salaires', 'economie', 'entreprises', 'budget'].map((g) => _comprendreLesChiffresEuropeCartesDe(_comprendreLesChiffresParserFiches(md), g)).join(''));
  assert.match(html, /de croissance de l’économie en 2026, en France/);
  assert.match(html, /Certains chiffres de 2026 sont encore provisoires/);
  assert.match(html, /d’évolution de la rémunération nette entre 2025 et 2026, en France/);
  assert.match(html, /en plus ou en moins au 1er trimestre 2027, par rapport au 1er trimestre 2026, en France/);
  assert.match(html, /Variation du nombre de déclarations de faillite entre le 1er trimestre 2026 et le 1er trimestre 2027\./);
  assert.match(html, /au gaz et aux autres combustibles en 2023, en France/);
  assert.match(html, /jusqu’à 2023/);
  assert.ok(!/croissance de l’économie en 2025/.test(html), 'plus aucune ancienne année pour cette carte');
});

test('périodes : sans la période d\'une source, SA carte disparaît et les autres restent', () => {
  const md = brut('europe-economie-eurostat.md').replace('  - "eurostat-croissance | 2025"\n', '');
  const html = _comprendreLesChiffresEuropeCartesDe(_comprendreLesChiffresParserFiches(md), 'economie');
  assert.ok(!/eu-croissance/.test(html), 'carte sans période : non affichée');
  assert.ok(/eu-taux-emploi/.test(html), 'les autres cartes restent');
});

test('pouvoir d\'achat : l\'année de la carte est la dernière année du fichier (2026 ajouté = tout passe à 2026, sans toucher au code)', () => {
  const D0 = lireFiche('pouvoir-achat-insee.md');
  const h0 = espaces(_comprendreLesChiffresPouvoirAchatCarte(D0));
  assert.match(h0, /de pouvoir d’achat en 2025/);
  assert.match(h0, /Ce qui a joué en 2025/);
  assert.match(h0, /après \+2,2 % en 2024/);
  let md = brut('pouvoir-achat-insee.md').replace('pouvoir_achat_2025: -0,7 %\n', 'pouvoir_achat_2025: -0,7 %\npouvoir_achat_2026: 1,1 %\n');
  md = md.replace(/pouvoir_achat_contribution_(\w+)_2025: (.*)\n/g, (m, c, v) => m + 'pouvoir_achat_contribution_' + c + '_2026: ' + v + '\n');
  const h1 = espaces(_comprendreLesChiffresPouvoirAchatCarte(_comprendreLesChiffresParserFiches(md)));
  assert.match(h1, /de pouvoir d’achat en 2026/);
  assert.match(h1, /Ce qui a joué en 2026/);
  assert.match(h1, /après -0,7 % en 2025/);
  assert.ok(/\+1,1 %/.test(h1));
});

test('périodes : aucun tiret long dans le fichier Europe ni dans le script de relevé', () => {
  assert.ok(!/[–—]/.test(brut('europe-economie-eurostat.md')));
  assert.ok(!/[–—]/.test(fs.readFileSync(path.join(__dirname, '..', 'scripts', 'releveEuropeEconomieEurostat.py'), 'utf8')));
});

// ---------- Bloc 2 : les cartes du portrait ----------
const m2 = require('../modules/comprendre-les-chiffres/index.js');
const CARTES = m2.COMPRENDRE_LES_CHIFFRES_PORTRAIT_CHIFFRES_CARTES, FICHIERS = m2.COMPRENDRE_LES_CHIFFRES_FICHES_FICHIERS;

test('portrait : chaque fichier de comparaison et le fichier des départements déclarent des périodes lisibles, d\'accord avec le titre de leur source', () => {
  ['age-insee.md', 'formation-insee.md', 'secteurs-insee.md', 'temps-partiel-insee.md', 'generalistes-insee.md', 'demandeurs-dares.md', 'portrait-chiffres.md'].forEach((f) => {
    const D = lireFiche(f), cles = Object.keys(D.periodes);
    assert.ok(cles.length >= 1, f + ' : bloc « periodes: » manquant');
    cles.forEach((k) => {
      assert.ok(D.sources[k], f + ' : la période ' + k + ' ne correspond à aucune source');
      assert.ok(D.sources[k].titre.indexOf(String(D.periodes[k].fin.an)) >= 0, f + ' : le titre de ' + k + ' ne dit pas ' + D.periodes[k].fin.an);
    });
  });
});

test('portrait : toutes les notes des cartes se complètent avec la période du fichier de comparaison (aucun jeton oublié, aucune année écrite à la main)', () => {
  CARTES.forEach((c) => {
    const cle = c.groupes.filter((g) => g.comparer)[0].comparer, D = lireFiche(FICHIERS[cle]);
    const note = _comprendreLesChiffresPeriodeSubstituer(c.note, D, m2._comprendreLesChiffresPeriodeUnique(D));
    assert.ok(note && !/[{}]/.test(note), c.id + ' : note incomplète : ' + note);
    assert.ok(/20\d\d/.test(note), c.id + ' : la note doit dire une année');
    assert.ok(!/20\d\d/.test(c.note), c.id + ' : une année est écrite à la main dans la note du code : ' + c.note.slice(0, 80));
    c.groupes.forEach((g) => assert.ok(!/20\d\d/.test(g.titre), c.id + ' : année écrite à la main dans le titre « ' + g.titre + ' »'));
  });
});

test('portrait : si un fichier passe à une autre période, la note suit (recensement 2027, 1er trimestre 2027)', () => {
  const carte = (id) => CARTES.filter((c) => c.id === id)[0];
  const F = lireFiche('formation-insee.md');
  F.periodes['insee-diplomes-2022'] = _comprendreLesChiffresPeriodeLire('2027');
  assert.match(_comprendreLesChiffresPeriodeSubstituer(carte('portrait-formation').note, F, m2._comprendreLesChiffresPeriodeUnique(F)), /recensement 2027\./);
  const Dd = lireFiche('demandeurs-dares.md');
  Dd.periodes['dares-inscrits-communes-2025t4'] = _comprendreLesChiffresPeriodeLire('T1 2027');
  assert.match(_comprendreLesChiffresPeriodeSubstituer(carte('portrait-demandeurs').note, Dd, m2._comprendreLesChiffresPeriodeUnique(Dd)), /1er trimestre 2027, effectifs arrondis/);
  const P = lireFiche('portrait-chiffres.md');
  const rsa = carte('portrait-demandeurs').groupes.filter((g) => /RSA/.test(g.titre))[0].titre;
  assert.equal(_comprendreLesChiffresPeriodeSubstituer(rsa, P, 'dataemploi-24'), 'Bénéficiaires du RSA (France Travail, 1er trimestre 2026)');
});

// ---------- Bloc 3 : la plage d'années des croisements ----------
test('croiser : la plage « 2019-2025 » est lue dans les séries annuelles du digest (jamais écrite à la main) et suit un digest plus récent', () => {
  const { _comprendreLesChiffresParserDigest, _comprendreLesChiffresPlageAnnees, COMPRENDRE_LES_CHIFFRES_CROISABLES } = require('../modules/comprendre-les-chiffres/index.js');
  const md = fs.readFileSync(path.join(CONTENU, '2026-06.md'), 'utf8').replace(/\r\n/g, '\n');
  const d = _comprendreLesChiffresParserDigest(md);
  assert.equal(_comprendreLesChiffresPlageAnnees(d), '2019-2025');
  // un digest qui irait jusqu'à 2026 : la plage suit
  const plus = _comprendreLesChiffresParserDigest(md.replace(/(serie_annuelle: [^\n]*?)2025: ([\d,]+ %)/g, '$12025: $2 ; 2026: $2'));
  assert.equal(_comprendreLesChiffresPlageAnnees(plus), '2019-2026');
  assert.equal(_comprendreLesChiffresPlageAnnees({ sections: {} }), '');
  COMPRENDRE_LES_CHIFFRES_CROISABLES.filter((c) => c.periode === 'annee').forEach((c) => assert.ok(!/20\d\d/.test(c.label) && /\{plage\}/.test(c.label), c.cle + ' : plage écrite à la main'));
});

// ---------- Bloc 3 : zones d'emploi (année du recensement) et position dans la fourchette ----------
test('zones d’emploi : l’année du recensement du libellé est lue dans le fichier ; sans période, la ligne n’est pas affichée', () => {
  const { _comprendreLesChiffresParserZonesEmploi, _comprendreLesChiffresRenduEcartsGenerique } = require('../modules/comprendre-les-chiffres/index.js');
  const md = brut('zones-emploi.md');
  const z = _comprendreLesChiffresParserZonesEmploi(md);
  assert.equal(z.periodes.chomage_recensement.fin.an, 2023);
  const rendu = (zz) => _comprendreLesChiffresRenduEcartsGenerique(zz.parDep['24'], zz.sources, { titre: 'T', icone: 'bi-x', periode: zz.periode, periodes: zz.periodes, intro: 'i' });
  assert.match(rendu(z), /Chômage \(recensement 2023\)/);
  // le recensement suivant : le libellé suit
  const z27 = _comprendreLesChiffresParserZonesEmploi(md.replace('"chomage_recensement | 2023"', '"chomage_recensement | 2028"'));
  assert.match(rendu(z27), /Chômage \(recensement 2028\)/);
  // période retirée : la barre disparaît plutôt que d’afficher une année fausse
  const sans = _comprendreLesChiffresParserZonesEmploi(md.replace(/\n {2}- "chomage_recensement \| 2023"/, ''));
  assert.ok(!/Chômage \(recensement/.test(rendu(sans)));
});

test('chômage : la phrase « où l’on se situe dans la fourchette » est calculée, jamais écrite d’avance', () => {
  const { _comprendreLesChiffresPositionFourchette: pos } = require('../modules/comprendre-les-chiffres/index.js');
  assert.match(pos('6,0 %', '5,7 % (1982)', '10,9 % (2015)'), /dans le bas/);
  assert.match(pos('7,9 %', '5,7 % (1982)', '10,9 % (2015)'), /milieu/);
  assert.match(pos('10,5 %', '5,7 % (1982)', '10,9 % (2015)'), /dans le haut/);
  assert.match(pos('11,2 %', '5,7 % (1982)', '10,9 % (2015)'), /plus haut que le sommet/);
  assert.match(pos('4,0 %', '5,7 % (1982)', '10,9 % (2015)'), /plus bas que le creux/);
  assert.equal(pos('n.c.', '5,7 %', '10,9 %'), '');
});

// ---------- Bloc 4 : le Smic (dates et montants lus dans le fichier) ----------
test('périodes : un mois (2025-12) et un jour (2026-01-01) se lisent et s’écrivent en bon français', () => {
  const doc = { periodes: { s: _comprendreLesChiffresPeriodeLire('2025-12 > 2026-01-01'), p: _comprendreLesChiffresPeriodeLire('2024-11') } };
  const f = (t, k) => _comprendreLesChiffresPeriodeSubstituer(t, doc, k);
  assert.equal(f('fin {debut}, {en_fin}', 's'), 'fin décembre 2025, au 1er janvier 2026');
  assert.equal(f('le niveau de {fin} ({en_fin})', 'p'), 'le niveau de novembre 2024 (en novembre 2024)');
  assert.equal(_comprendreLesChiffresPeriodeMots(_comprendreLesChiffresPeriodeLire('2027-07-15').fin, true), 'au 15 juillet 2027');
  ['2026-13', '2026-02-32', '2026-00-01', '2026-1-1'].forEach((x) => assert.equal(_comprendreLesChiffresPeriodeLire(x), null, 'refusé : ' + x));
});

test('Smic (Dares) : les dates et les montants de la carte viennent du fichier, et suivent un fichier plus récent', () => {
  const { _comprendreLesChiffresSmicCarteBeneficiaires: carte, _comprendreLesChiffresFormatEuros } = require('../modules/comprendre-les-chiffres/index.js');
  const texte = (D) => espaces(carte(D).replace(/<[^>]+>/g, ' '));
  const D = lireFiche('smic-dares.md');
  const t = texte(D);
  assert.match(t, /au 1er janvier 2026/);
  assert.match(t, /fin décembre 2025/);
  assert.match(t, /11,88 € brut de l’heure/);
  assert.match(t, /12,02 €/);
  assert.match(t, /niveau de novembre 2024/);
  assert.match(t, /45,2 % des salariés du privé/);
  assert.match(t, /17,9 millions des 27,1 millions/);
  // l'année de la période est celle du titre de la source
  assert.ok(D.sources['dares-smic-2026'].titre.indexOf(String(D.periodes['dares-smic-2026'].fin.an)) >= 0);
  // le Smic de 2027 : tout suit sans toucher au code
  const D27 = lireFiche('smic-dares.md');
  D27.periodes['dares-smic-2026'] = _comprendreLesChiffresPeriodeLire('2026-12 > 2027-01-01');
  D27.periodes['smic-precedente'] = _comprendreLesChiffresPeriodeLire('2026-01');
  D27.groupes.france[Object.keys(D27.groupes.france)[0]].champs.smic_horaire_ancien = '12,02 €';
  D27.groupes.france[Object.keys(D27.groupes.france)[0]].champs.smic_horaire_nouveau = '12,30 €';
  const t27 = texte(D27);
  assert.match(t27, /au 1er janvier 2027/);
  assert.match(t27, /fin décembre 2026/);
  assert.match(t27, /12,02 € brut de l’heure.*12,30 €/);
  assert.match(t27, /niveau de janvier 2026/);
  assert.ok(!/2025|11,88/.test(t27), 'rien de l’ancienne édition ne doit rester');
  // sans la période de la source : pas de carte ; sans les montants : la phrase reste juste, sans montant
  const sans = lireFiche('smic-dares.md'); delete sans.periodes['dares-smic-2026'];
  assert.equal(carte(sans), '');
  const sansMontants = lireFiche('smic-dares.md');
  delete sansMontants.groupes.france[Object.keys(sansMontants.groupes.france)[0]].champs.smic_horaire_ancien;
  assert.match(texte(sansMontants), /entre l’ancien et le nouveau Smic/);
  assert.ok(_comprendreLesChiffresFormatEuros);
});

test('Smic : aucune année ni montant du Smic écrits à la main dans la carte du code', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'index.js'), 'utf8');
  const debut = src.indexOf('function _comprendreLesChiffresSmicCarteBeneficiaires');
  const corps = src.slice(debut, src.indexOf('\n}\n', debut));
  assert.ok(!/20\d\d/.test(corps.replace(/\/\/[^\n]*/g, '')), 'une année est écrite à la main dans la carte Smic');
  assert.ok(!/\b1[12],\d\d\b|\b45,2\b|\b17,9\b|\b27,1\b/.test(corps), 'un montant est écrit à la main dans la carte Smic');
});

test('outil de veille : les champs du pouvoir d’achat d’une année suivante sont connus d’avance', () => {
  const { formeDuChamp } = require('../outils/veilleChiffres.js');
  assert.equal(formeDuChamp('pouvoir_achat_2026'), 'nombre');
  assert.equal(formeDuChamp('pouvoir_achat_contribution_prix_2027'), 'nombre');
  assert.equal(formeDuChamp('pouvoir_achat_contribution_inconnue_2027'), undefined);
  assert.equal(formeDuChamp('smic_horaire_nouveau'), 'eur');
});

// ---------- Outil de veille : les sept fichiers du portrait et les périodes de l'en-tête (consigne 146, bloc 4) ----------
const FICHIERS_PORTRAIT = ['age-insee.md', 'formation-insee.md', 'secteurs-insee.md', 'temps-partiel-insee.md', 'generalistes-insee.md', 'demandeurs-dares.md', 'portrait-chiffres.md'];

test('outil de veille : la grammaire des périodes est la même que celle de l’application', () => {
  const { RE_PERIODE } = require('../outils/veilleChiffres.js');
  ['2025', 'T2 2026', 'S2 2025', 'S1 2024', '2025-12', '2026-01-01', '2024 > 2025', 'T4 2025>T1 2026', '2025-12 > 2026-01-01', 'T5 2026', 'S3 2025', '2025 >', '> 2025', '2025-13', '2026-01-32',
    '25', 'T2', 'deux mille', '2025 > 2026 > 2027', '1999'].forEach((t) => {
    assert.equal(RE_PERIODE.test(t), _comprendreLesChiffresPeriodeLire(t) !== null, 'désaccord sur « ' + t + ' »');
  });
});

test('outil de veille : les sept fichiers du portrait se lisent, se réécrivent à l’identique, et chaque donnée a la forme attendue', () => {
  const C = require('../outils/veilleChiffres.js');
  FICHIERS_PORTRAIT.forEach((f) => {
    const t = brut(f), l = C.lireTerritoire(t);
    assert.ok(l.ok, f + ' : ' + l.erreur);
    assert.equal(C.territoireEnTexte(l), t, f + ' : réécriture à l’identique');
    assert.equal(C.territoireEnTexte(l, { toutCanonique: true }), t, f + ' : forme canonique');
    l.blocs.forEach((b) => b.champs.filter((x) => x.cle !== 'sources').forEach((x) => {
      const forme = C.formeDuChamp(x.cle);
      assert.ok(forme, f + ' : champ inconnu de l’outil « ' + x.cle + ' »');
      assert.ok(C.RE_FORME[forme].test(x.valeur), f + ' : ' + b.nom + ' ' + x.cle + ' « ' + x.valeur + ' »');
    }));
    const periodes = C.periodesDeLEntete(l.entete), ids = l.sources.map((s) => s.id);
    assert.ok(periodes.length >= 1, f + ' : au moins une période déclarée');
    periodes.forEach((p) => {
      assert.ok(ids.indexOf(p.id) !== -1, f + ' : la période de « ' + p.id + ' » ne vise aucune source');
      assert.ok(C.RE_PERIODE.test(p.valeur) && _comprendreLesChiffresPeriodeLire(p.valeur), f + ' : période illisible « ' + p.valeur + ' »');
    });
  });
});

test('outil de veille : changer la période d’une source change l’en-tête, date la source et exige la confirmation', () => {
  const C = require('../outils/veilleChiffres.js');
  const t = brut('age-insee.md'), cx = { aujourdhui: '2026-12-20' };
  const premier = C.lireTerritoire(t).blocs[0];
  const idSrc = C.periodesDeLEntete(C.lireTerritoire(t).entete)[0].id;
  // sans confirmation : refusé
  const sans = C.modifierTerritoire(t, { lieu: premier.nom, groupe: premier.groupe, champs: {}, periodes: { [idSrc]: '2024' } }, cx);
  assert.equal(sans.ok, false); assert.match(sans.erreur, /confirmez/);
  // avec confirmation : la période change, la source est datée, rien d’autre ne bouge
  const r = C.modifierTerritoire(t, { lieu: premier.nom, groupe: premier.groupe, champs: { part_65_plus: '19,5 %' }, periodes: { [idSrc]: '2024' }, confirmeSource: true }, cx);
  assert.ok(r.ok, r.erreur);
  assert.deepEqual(r.resume.champs, ['part_65_plus', 'periodes']);
  const apres = C.lireTerritoire(r.texte);
  assert.equal(C.periodesDeLEntete(apres.entete)[0].valeur, '2024');
  assert.ok(apres.sources.filter((s) => s.id === idSrc)[0].date.startsWith('2026-12'), 'la source est datée');
  assert.equal(r.texte.split('\n').length, t.split('\n').length, 'aucune ligne ajoutée ni perdue');
  // la période seule est une modification (et exige aussi la confirmation)
  const seule = C.modifierTerritoire(t, { lieu: premier.nom, groupe: premier.groupe, champs: {}, periodes: { [idSrc]: '2024' }, confirmeSource: true }, cx);
  assert.ok(seule.ok && seule.resume.champs.join() === 'periodes', JSON.stringify(seule));
  // une période inchangée ne change rien
  const rien = C.modifierTerritoire(t, { lieu: premier.nom, groupe: premier.groupe, champs: {}, periodes: { [idSrc]: C.periodesDeLEntete(C.lireTerritoire(t).entete)[0].valeur }, confirmeSource: true }, cx);
  assert.equal(rien.ok, false);
});

test('outil de veille : une période mal écrite ou visant une source inconnue est refusée', () => {
  const C = require('../outils/veilleChiffres.js');
  const t = brut('formation-insee.md'), cx = { aujourdhui: '2026-12-20' }, b = C.lireTerritoire(t).blocs[0];
  const idSrc = C.periodesDeLEntete(C.lireTerritoire(t).entete)[0].id;
  ['2025 en gros', 'T5 2026', '25', '2025–2026'].forEach((v) => {
    const r = C.modifierTerritoire(t, { lieu: b.nom, groupe: b.groupe, champs: {}, periodes: { [idSrc]: v }, confirmeSource: true }, cx);
    assert.equal(r.ok, false, v); assert.match(r.erreur, /période/i);
  });
  const inconnue = C.modifierTerritoire(t, { lieu: b.nom, groupe: b.groupe, champs: {}, periodes: { 'source-inventee': '2025' }, confirmeSource: true }, cx);
  assert.equal(inconnue.ok, false); assert.match(inconnue.erreur, /absente de l/);
  const liste = C.modifierTerritoire(t, { lieu: b.nom, groupe: b.groupe, champs: {}, periodes: ['2025'], confirmeSource: true }, cx);
  assert.equal(liste.ok, false);
});

test('outil de veille : un fichier sans bloc « periodes: » en reçoit un, juste après les sources', () => {
  const C = require('../outils/veilleChiffres.js');
  const sans = brut('formation-insee.md').replace(/periodes:\n(?:  - ".*"\n)+/, '');
  assert.ok(sans.indexOf('periodes:') === -1);
  const b = C.lireTerritoire(sans).blocs[0], idSrc = C.lireTerritoire(sans).sources[0].id;
  const r = C.modifierTerritoire(sans, { lieu: b.nom, groupe: b.groupe, champs: {}, periodes: { [idSrc]: '2023' }, confirmeSource: true }, { aujourdhui: '2026-12-20' });
  assert.ok(r.ok, r.erreur);
  const e = C.lireTerritoire(r.texte).entete;
  assert.deepEqual(C.periodesDeLEntete(e).map((p) => [p.id, p.valeur]), [[idSrc, '2023']]);
  assert.ok(e.indexOf('periodes:') > e.indexOf('  - "' + idSrc + ' | '), 'le bloc vient après la source');
});
