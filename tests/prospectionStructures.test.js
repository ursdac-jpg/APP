/* Prospection des structures (consigne 270) : les règles du script, sans réseau ni fichier. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const { adresseLisible, ajouterAdresse, parserCsv, preparer, telephoneFormate, siteHttps, classer, recouper, ressemble, registreParse, slug } = require('../scripts/prospectionStructures.js');
const L = require('../modules/mon-territoire/logique.js');

const AUJOURDHUI = '2026-11-12';
function fiche(o) {
  return Object.assign({ id: 'x--1', siret: '', nom: 'Atelier Test', commune: 'Limoges', code_postal: '87000', code_insee: '87085', adresse: '1 rue A', telephone: '+33555010203', site_web: 'https://test.example.org/', description: 'Une description.', source: 'dora', date_maj: '2026-09-01', reseaux_porteurs: "['ei']" }, o || {});
}

test('le CSV est lu avec guillemets, virgules et retours à la ligne dans un champ', () => {
  const l = parserCsv('a,b,c\r\n1,"x, y",3\r\n"4","ligne 1\nligne 2",6\r\n');
  assert.strictEqual(l.length, 2);
  assert.strictEqual(l[0].b, 'x, y');
  assert.strictEqual(l[1].b, 'ligne 1\nligne 2');
});

test('le téléphone est mis au format du registre, ou refusé', () => {
  assert.strictEqual(telephoneFormate('+33555010203'), '05 55 01 02 03');
  assert.strictEqual(telephoneFormate('0555010203'), '05 55 01 02 03');
  assert.strictEqual(telephoneFormate('3949'), '');
  assert.strictEqual(telephoneFormate(''), '');
});

test('seule une adresse https est gardée', () => {
  assert.strictEqual(siteHttps('https://a.fr/'), 'https://a.fr/');
  assert.strictEqual(siteHttps('http://a.fr/'), '');
  assert.strictEqual(siteHttps(''), '');
});

test('le type n’est proposé que si le réseau porteur le dit clairement', () => {
  assert.strictEqual(classer(fiche()).type, 'siae');
  assert.strictEqual(classer(fiche({ reseaux_porteurs: "['plie']" })).type, 'plie');
  assert.strictEqual(classer(fiche({ reseaux_porteurs: '', source: 'mediation-numerique' })).type, 'inclusion-numerique');
  assert.strictEqual(classer(fiche({ reseaux_porteurs: '', source: 'dora' })), null);
});

test('filtres : département, ancienneté, contact, école, comité, fermé, déjà connu', () => {
  const lignes = [
    fiche({ nom: 'Bonne structure' }),
    fiche({ nom: 'Autre département', code_insee: '33063' }),
    fiche({ nom: 'Trop ancienne', date_maj: '2025-01-01' }),
    fiche({ nom: 'Sans contact', telephone: '', site_web: '' }),
    fiche({ nom: 'Collège Jules Ferry' }),
    fiche({ nom: 'COMITE ENTREPRISE UDAF' }),
    fiche({ nom: 'Fermée', siret: '11111111111111' }),
    fiche({ nom: 'Déjà au registre', telephone: '0555999999', site_web: '' })
  ];
  const r = preparer(lignes, {
    aujourdhui: AUJOURDHUI,
    officiel: { '11111111111111': { etat: 'F' } },
    lieuxExistants: 'deja-au-registre-87 | siae | Déjà au registre | | Limoges | | 05 55 99 99 99 | | 87 | emploi | source | 2026-10-01'
  });
  assert.deepStrictEqual(r.candidates.map((c) => c.nom), ['Bonne structure']);
  assert.strictEqual(r.compte.sansContact, 1);
  assert.strictEqual(r.compte.fermees, 1);
  assert.strictEqual(r.compte.dejaConnues, 1);
  assert.strictEqual(r.ecartees.length, 3);
});

test('une fiche sans SIRET est gardée mais marquée « existence à confirmer »', () => {
  const r = preparer([fiche({ siret: '' })], { aujourdhui: AUJOURDHUI });
  assert.strictEqual(r.candidates[0].etatOfficiel, 'aucun SIRET');
  assert.ok(r.candidates[0].avertissements.some((a) => /existence à confirmer/.test(a)));
});

test('une fiche dont la commune diffère de la base officielle est signalée', () => {
  const r = preparer([fiche({ siret: '22222222222222' })], { aujourdhui: AUJOURDHUI, officiel: { '22222222222222': { etat: 'A', commune: 'SAINT-ASTIER' } } });
  assert.ok(r.candidates[0].avertissements.some((a) => /commune différente/.test(a)));
});

test('une fiche non classée n’a pas de ligne prête pour le sas', () => {
  const r = preparer([fiche({ reseaux_porteurs: '' })], { aujourdhui: AUJOURDHUI });
  assert.strictEqual(r.candidates[0].aClasser, true);
  assert.strictEqual(r.candidates[0].ligne, '');
});

test('la ligne du sas respecte les règles du registre (avec une date de vérification)', () => {
  const r = preparer([fiche({ siret: '33333333333333' })], { aujourdhui: AUJOURDHUI, officiel: { '33333333333333': { etat: 'A', commune: 'Limoges' } } });
  const ligne = r.candidates[0].ligne;
  assert.ok(ligne, 'une ligne est attendue');
  const cases = ligne.split(' | ');
  assert.strictEqual(cases.length, 14, '14 colonnes : la date et le mail restent vides, l\'adresse est remplie');
  assert.strictEqual(cases[11], '');
  assert.strictEqual(cases[12], '');
  assert.strictEqual(cases[13], '1 rue A, 87000 Limoges');
  cases[11] = '2026-11-12';
  assert.deepStrictEqual(L.mtVerifierLieux(cases.join(' | '), { aujourdhui: AUJOURDHUI }), []);
  assert.ok(!new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(ligne), 'aucun tiret long');
});

test('les identifiants sont uniques et sans commune répétée', () => {
  const r = preparer([fiche({ nom: 'Atelier Limoges' }), fiche({ nom: 'Atelier Limoges' })], { aujourdhui: AUJOURDHUI });
  assert.strictEqual(r.candidates.length, 2);
  assert.notStrictEqual(r.candidates[0].id, r.candidates[1].id);
  assert.strictEqual(slug('Éléa & Co'), 'elea-co');
  assert.ok(r.candidates[0].id.indexOf('limoges-limoges') === -1);
});

// ---- Recoupement du registre (consigne 270, suite)
const REGISTRE = [
  'a-tel | siae | Atelier Test | | Limoges | | 05 55 01 02 03 | https://ancien.example.org/ | 87 | emploi | source | 2026-10-01',
  'b-page | siae | Autre Atelier | | Limoges | | 05 55 99 00 11 | https://test2.example.org/ | 87 | emploi | source | 2026-10-01',
  'c-nom | ccas | CCAS de Nontron | | Nontron | | 05 53 00 00 01 | | 24 | emploi | source | 2026-10-01',
  'd-absente | ccas | CCAS Absent | | Limoges | | 05 55 77 77 77 | | 87 | emploi | source | 2026-10-01',
  'e-national | ccas | National | | | | 05 55 01 02 03 | | national | emploi | source | 2026-10-01'
].join('\n');

test('recoupement : fermée, autre téléphone, autre site ; les fiches absentes du fichier ne sont pas couvertes', () => {
  const lignes = [
    fiche({ nom: 'Atelier Test', siret: '11111111111111', telephone: '0555010203', site_web: 'https://nouveau.example.org/' }),
    fiche({ nom: 'Autre Atelier', siret: '22222222222222', telephone: '0555880088', site_web: 'https://test2.example.org/' }),
    fiche({ nom: 'CCAS de Nontron', commune: 'Nontron', code_insee: '24311', telephone: '0553000001', site_web: '' })
  ];
  const r = recouper(lignes, REGISTRE, { officiel: { '22222222222222': { etat: 'F' }, '11111111111111': { etat: 'A' } } });
  assert.strictEqual(r.total, 4, 'les fiches nationales ne comptent pas');
  assert.strictEqual(r.recoupees, 3);
  assert.strictEqual(r.sansEcart, 1);
  const par = {}; r.aRevoir.forEach((x) => { par[x.id] = x; });
  assert.ok(par['a-tel'].raisons.some((z) => /autre site/.test(z)), 'retrouvée par le téléphone, site différent');
  assert.ok(par['b-page'].raisons.some((z) => /fermé/.test(z)) && par['b-page'].raisons.some((z) => /autre téléphone/.test(z)));
  assert.strictEqual(r.aRevoir[0].id, 'b-page', 'les fermées passent en premier');
  assert.ok(!par['c-nom'] && !par['d-absente']);
  assert.deepStrictEqual(r.sirets.sort(), ['11111111111111', '22222222222222']);
});

test('recoupement : un autre chemin sur le même site, ou un téléphone absent du registre, ne déclenche pas d\'alerte', () => {
  const lignes = [fiche({ nom: 'Atelier Test', telephone: '0555010203', site_web: 'https://ancien.example.org/autre-page' })];
  const r = recouper(lignes, 'x | siae | Atelier Test | | Limoges | | | https://ancien.example.org/ | 87 | emploi | s | 2026-10-01', {});
  assert.strictEqual(r.recoupees, 1);
  assert.strictEqual(r.aRevoir.length, 0);
});

test('ressemblance : la même structure sous un autre nom est signalée, une structure voisine non', () => {
  const reg = registreParse([
    'cc-ivs-24 | collectivite-etat | Communauté de communes - Isle Vern Salembre en Périgord | | Saint-Astier | | 05 53 03 45 82 | | 24 | emploi | s | 2026-10-01',
    'cci-dordogne | appui-aux-employeurs | Chambre de commerce et d\'industrie de la Dordogne | | | | | | 24 | emploi | s | 2026-10-01',
    'anefa-dordogne-24 | appui-aux-employeurs | ANEFA Dordogne | | Coulounieix-Chamiers | | | | 24 | emploi | s | 2026-10-01',
    'ij-24 | formation-jeunes | Info Jeunes - Coulounieix-Chamiers | | Coulounieix-Chamiers | | | | 24 | emploi | s | 2026-10-01',
    'cc-autre-24 | collectivite-etat | Communauté de communes - Isle Loue Auvézère en Périgord | | Payzac | | | | 24 | emploi | s | 2026-10-01'
  ].join('\n'));
  const trouve = (n, commune) => ressemble({ nom: n, commune: commune || 'Limoges', dep: '24' }, reg).map((x) => x.id);
  assert.deepStrictEqual(trouve('Cc Isle Vern Salembre En Perigord', 'Saint-Astier'), ['cc-ivs-24']);
  assert.deepStrictEqual(trouve('CHAMBRE DE COMMERCE ET D\'INDUSTRIE - DORDOGNE'), ['cci-dordogne']);
  assert.deepStrictEqual(trouve('ASSO NAT EMPLOI FORMATION EN AGRICULTURE', 'Coulounieix-Chamiers'), ['anefa-dordogne-24'], 'sigle dans la même commune');
  assert.deepStrictEqual(trouve('ASSO NAT EMPLOI FORMATION EN AGRICULTURE', 'Limoges'), [], 'sigle seulement dans la même commune');
  assert.deepStrictEqual(trouve('Médiathèque de Couzeix', 'Couzeix'), []);
  assert.strictEqual(ressemble({ nom: 'Cc Isle Vern Salembre En Perigord', commune: 'Saint-Astier', dep: '87' }, reg).length, 0, 'jamais d\'un autre département');
  const r = preparer([fiche({ nom: 'Cc Isle Vern Salembre En Perigord', commune: 'Saint-Astier', code_insee: '24347' })], { aujourdhui: AUJOURDHUI, lieuxExistants: 'cc-ivs-24 | collectivite-etat | Communauté de communes - Isle Vern Salembre en Périgord | | Saint-Astier | | 05 53 03 45 82 | | 24 | emploi | s | 2026-10-01' });
  assert.ok(r.candidates[0].avertissements.some((a) => /ressemble à une fiche déjà publiée/.test(a)));
});

test('l\'adresse du fichier part au sas : casse refaite si tout est en majuscules, 12 colonnes si le fichier n\'en donne pas', () => {
  assert.strictEqual(adresseLisible('PLACE DU CHAMP DE FOIRE', '24300', 'Nontron').texte, 'Place du Champ de Foire, 24300 Nontron');
  assert.strictEqual(adresseLisible("AVENUE D'AQUITAINE", '24000', 'Périgueux').texte, "Avenue d'Aquitaine, 24000 Périgueux");
  assert.strictEqual(adresseLisible('Place PAUL BERT', '24300', 'Nontron').converti, false, 'une adresse déjà en casse mixte est gardée telle quelle');
  assert.strictEqual(adresseLisible('', '24300', 'Nontron').texte, '');
  const off = { '33333333333333': { etat: 'A', commune: 'Limoges' } };
  const c = preparer([fiche({ adresse: 'RUE DE LA PAIX', siret: '33333333333333' })], { aujourdhui: AUJOURDHUI, officiel: off }).candidates[0];
  assert.strictEqual(c.adresseRegistre, 'Rue de la Paix, 87000 Limoges');
  assert.ok(c.avertissements.some((a) => /adresse écrite en majuscules/.test(a)));
  const sans = preparer([fiche({ adresse: '', siret: '33333333333333' })], { aujourdhui: AUJOURDHUI, officiel: off }).candidates[0];
  assert.strictEqual(sans.ligne.split(' | ').length, 12);
});

test('un ancien résultat (ligne à 12 colonnes) est mis à niveau sans doublon', () => {
  const c = { ligne: 'a | siae | A |  | Limoges |  | 05 55 01 02 03 |  | 87 | emploi | s | ', adresse: '3 RUE B', cp: '87000', commune: 'Limoges', avertissements: [] };
  ajouterAdresse(c); ajouterAdresse(c);
  assert.strictEqual(c.ligne.split(' | ').length, 14);
  assert.ok(c.ligne.endsWith(' | 3 Rue B, 87000 Limoges'));
  assert.strictEqual(c.avertissements.length, 1);
});
