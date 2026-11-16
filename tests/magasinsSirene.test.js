'use strict';
// Magasins des enseignes relevés dans le registre des entreprises (consigne 303) : règles de reconnaissance, mise en forme des adresses, fusion sans doublon avec la saisie manuelle.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const L = require('../modules/mon-territoire/logique.js');
const G = require('../scripts/genererMagasinsSirene.js');
const { ENSEIGNES } = require('../scripts/magasinsSireneConfig.js');

const etab = (o) => Object.assign({ etat_administratif: 'A', date_fermeture: null, activite_principale: '47.11D', liste_enseignes: [], nom_commercial: null, adresse: '1 RUE X 24000 PERIGUEUX', siret: '1', commune: '24322' }, o);

test('reconnaissance : l\'enseigne déclarée suffit, en mot entier', () => {
  assert.ok(G.correspond(etab({ liste_enseignes: ['INTERMARCHE'] }), { nom_complet: 'SOCIETE MONTPON DISTRIBUTION' }, ENSEIGNES.intermarche));
  assert.ok(G.correspond(etab({ liste_enseignes: ['BISTROT DU MARCHE-INTERMARCHE'] }), { nom_complet: 'X' }, ENSEIGNES.intermarche));
  assert.equal(G.correspond(etab({ liste_enseignes: ['INTERMARCHEUR'] }), { nom_complet: 'X' }, ENSEIGNES.intermarche), null, 'pas de mot partiel');
});

test('reconnaissance : jamais un établissement fermé, ni un code d\'activité hors liste, ni un non-diffusible', () => {
  const ent = { nom_complet: 'LIDL' };
  assert.equal(G.correspond(etab({ etat_administratif: 'F', liste_enseignes: ['LIDL'] }), ent, ENSEIGNES.lidl), null);
  assert.equal(G.correspond(etab({ date_fermeture: '2024-01-01', liste_enseignes: ['LIDL'] }), ent, ENSEIGNES.lidl), null);
  assert.equal(G.correspond(etab({ activite_principale: '68.20A', liste_enseignes: ['LIDL'] }), ent, ENSEIGNES.lidl), null);
  assert.equal(G.correspond(etab({ liste_enseignes: ['LIDL'] }), { nom_complet: '[NON-DIFFUSIBLE]' }, ENSEIGNES.lidl), null);
});

test('reconnaissance : un nom courant ne compte que déclaré comme enseigne (Action, Boulanger le boulanger)', () => {
  assert.equal(G.correspond(etab({ activite_principale: '47.19B' }), { nom_complet: 'ACTION ET PRODUCTIONS ARTISTIQUES' }, ENSEIGNES['action-dordogne']), null, 'la raison sociale ne suffit pas');
  assert.ok(G.correspond(etab({ activite_principale: '47.19B', liste_enseignes: ['ACTION'] }), { nom_complet: 'ACTION FRANCE' }, ENSEIGNES['action-dordogne']));
  assert.equal(G.correspond(etab({ activite_principale: '10.71C' }), { nom_complet: 'BOULANGER' }, ENSEIGNES.boulanger), null, 'un boulanger n\'est pas l\'enseigne Boulanger');
  assert.equal(G.correspond(etab({ activite_principale: '47.43Z' }), { nom_complet: 'JEAN BOULANGER', nature_juridique: '1000' }, ENSEIGNES.boulanger), null, 'un nom de famille n\'est pas une enseigne');
});

test('reconnaissance : la raison sociale compte quand elle commence par l\'alias, sauf entrepreneur individuel', () => {
  const im = ENSEIGNES.intermarche;
  assert.equal(G.correspond(etab({}), { nom_complet: 'INTERMARCHE SAINT-CYPRIEN', nature_juridique: '5499' }, im).via, 'societe');
  assert.equal(G.correspond(etab({}), { nom_complet: 'INTERMARCHE ALAIN', nature_juridique: '1000' }, im), null);
  assert.equal(G.correspond(etab({}), { nom_complet: 'SOCIETE INTERMARCHE', nature_juridique: '5499' }, im), null, 'alias en début de raison sociale exigé');
  assert.equal(G.correspond(etab({}), { nom_complet: 'LIDL (LIDL)', nature_juridique: '5499' }, ENSEIGNES.lidl), null, 'un nom court exige enseigne déclarée');
});

test('choix de la fiche : l\'alias le plus précis l\'emporte (Carrefour Market et non Carrefour)', () => {
  const c = G.choisirEnseigne([{ id: 'carrefour', alias: 'carrefour' }, { id: 'carrefour-market', alias: 'carrefour market' }]);
  assert.equal(c.id, 'carrefour-market');
});

test('mise en forme des adresses : sans code postal ni commune, abréviations développées, majuscules rendues', () => {
  assert.equal(G.formaterAdresse('95 AV GEORGES POMPIDOU BRION SUD 24700 MONTPON-MENESTEROL', '24700'), '95 Avenue Georges Pompidou Brion Sud');
  assert.equal(G.formaterAdresse('435 AVENUE D\'AQUITAINE 24150 LALINDE', '24150'), '435 Avenue d\'Aquitaine');
  assert.equal(G.formaterAdresse('6 RUE DU COMMERCE 24400 SAINT-MEDARD-DE-MUSSIDAN', '24400'), '6 Rue du Commerce');
  assert.equal(G.formaterAdresse('LIEUDIT BRION NORD RTE DE BORDEAUX 24700 MONTPON-MENESTEROL', '24700'), 'Lieu-dit Brion Nord Route de Bordeaux');
  assert.equal(G.formaterAdresse('12 RUE DE LA REPUBLIQUE 87000 LIMOGES CEDEX 1', '87000'), '12 Rue de la République');
});

test('mtMemeAdresse : même magasin écrit autrement, deux magasins différents', () => {
  assert.ok(L.mtMemeAdresse('14 rue Durou', '14 Rue Durou, 24100 Bergerac', 'Bergerac'));
  assert.ok(L.mtMemeAdresse('21 Route de Bordeaux, Centre Commercial Brion Sud, 24700 Montpon-Ménestérol', 'Brion Sud Route de Bordeaux', 'Montpon-Ménestérol'));
  assert.ok(!L.mtMemeAdresse('14 rue Durou', '28 avenue Pasteur', 'Bergerac'));
  assert.ok(!L.mtMemeAdresse('14 rue Durou', '16 rue Durou', 'Bergerac'), 'deux numéros différents dans la même rue : deux magasins');
  assert.ok(!L.mtMemeAdresse('', '14 rue Durou', 'Bergerac'));
});

const REGISTRE = [
  'lidl | enseigne | Lidl | commerce-vente | Bergerac:28 avenue Pasteur ; Limoges | | | | spontanee | test | ',
  'chaussea | enseigne | Chaussea | commerce-vente | Limoges ; Boisseuil::05 55 00 00 00 | | | | spontanee | test | ',
  'boulangerie-x | local | Boulangerie X | artisanat-bouche | Bergerac:1 rue A | | | | spontanee | test | '
].join('\n');
const GENERES = [
  '# commentaire',
  'lidl | Bergerac:28 Avenue Pasteur ; Bergerac:3 Rue Neuve ; Limoges:4 Avenue de Locarno ; Montpon-Ménestérol:Route de Bordeaux',
  'chaussea | Limoges:10 Rue du Commerce ; Boisseuil:Zone commerciale',
  'boulangerie-x | Bergerac:9 rue B',
  'inconnu | Bergerac:1 rue Z'
].join('\n');

test('fusion : la saisie manuelle l\'emporte, aucun doublon, une commune sans adresse reçoit les adresses trouvées', () => {
  const fiches = L.mtParserEmployeurs(REGISTRE).lignes;
  const ajoutes = L.mtFusionnerMagasins(fiches, L.mtParserMagasinsGeneres(GENERES));
  const lidl = fiches[0].etablissementsListe.map((e) => e.commune + ':' + e.adresse);
  assert.deepEqual(lidl, ['Bergerac:28 avenue Pasteur', 'Bergerac:3 Rue Neuve', 'Limoges:4 Avenue de Locarno', 'Montpon-Ménestérol:Route de Bordeaux'], 'doublon de Pasteur évité, Limoges sans adresse remplacée');
  const cha = fiches[1].etablissementsListe.map((e) => e.commune + ':' + e.adresse + ':' + e.telephone);
  assert.deepEqual(cha, ['Boisseuil::05 55 00 00 00', 'Limoges:10 Rue du Commerce:', 'Boisseuil:Zone commerciale:'], 'un numéro saisi à la main est gardé');
  assert.equal(ajoutes, 5);
  assert.equal(fiches[2].etablissementsListe.length, 1, 'une fiche locale n\'est jamais complétée');
});

test('fusion : un fichier vide ou absent ne change rien', () => {
  const fiches = L.mtParserEmployeurs(REGISTRE).lignes;
  assert.equal(L.mtFusionnerMagasins(fiches, L.mtParserMagasinsGeneres('')), 0);
  assert.equal(fiches[0].etablissementsListe.length, 2);
});

test('fichier généré (s\'il existe) : chaque ligne vise une enseigne du registre, des communes connues, sans doublon', () => {
  const f = path.join(__dirname, '..', 'modules', 'mon-territoire', 'contenu', 'magasins-generes.txt');
  if (!fs.existsSync(f)) { return; }
  const contenu = path.join(__dirname, '..', 'modules', 'mon-territoire', 'contenu');
  const registre = {};
  L.mtParserEmployeurs(fs.readFileSync(path.join(contenu, 'employeurs.txt'), 'utf8')).lignes.forEach((e) => { registre[e.id] = e; });
  const communes = {};
  ['communes-24.txt', 'communes-87.txt'].forEach((n) => L.mtParserCommunes(fs.readFileSync(path.join(contenu, n), 'utf8')).lignes.forEach((c) => { communes[c.cle] = true; }));
  const texte = fs.readFileSync(f, 'utf8');
  assert.ok(!/[–—]/.test(texte), 'aucun tiret long');
  const parId = L.mtParserMagasinsGeneres(texte);
  Object.keys(parId).forEach((id) => {
    assert.ok(registre[id] && registre[id].nature === 'enseigne', id + ' : doit être une fiche enseigne du registre');
    const vus = {};
    parId[id].forEach((e) => {
      assert.ok(communes[L.mtNormaliser(e.commune)], id + ' : commune inconnue ' + e.commune);
      const cle = L.mtNormaliser(e.commune) + '|' + L.mtNormaliser(e.adresse);
      assert.ok(!vus[cle], id + ' : doublon ' + cle);
      vus[cle] = true;
    });
  });
});

test('configuration : chaque enseigne configurée a des alias et des codes d\'activité', () => {
  Object.keys(ENSEIGNES).forEach((id) => {
    assert.ok(ENSEIGNES[id].alias.length && ENSEIGNES[id].naf.length, id);
  });
});

// ---------- Découverte des chaînes (lecture seule) ----------
const D = require('../scripts/decouvrirEnseignesSirene.js');
const rep = (nom, etabs, extra) => ({ results: [Object.assign({ nom_complet: nom, nombre_etablissements_ouverts: etabs.length, nature_juridique: '5499', matching_etablissements: etabs }, extra || {})] });
const unEtab = (o) => Object.assign({ etat_administratif: 'A', date_fermeture: null, activite_principale: '56.10C', liste_enseignes: ['MUCCHI BACH'], nom_commercial: null, adresse: '1 RUE X', siret: String(Math.random()), commune: '24294' }, o);

test('découverte : seuls les établissements ouverts, dans une commune du module, avec une marque déclarée, sont retenus', () => {
  const communes = { '24294': 'Montpon-Ménestérol', '24322': 'Périgueux' };
  const r = rep('SAS X', [unEtab({ siret: 'a' }), unEtab({ siret: 'b', etat_administratif: 'F' }), unEtab({ siret: 'c', liste_enseignes: [] }), unEtab({ siret: 'd', commune: '99999' }), unEtab({ siret: 'e', liste_enseignes: [], nom_commercial: 'MA MARQUE' })]);
  const m = D.marques(r, communes);
  assert.deepEqual(m.map((x) => x.siret).sort(), ['a', 'e']);
});

test('découverte : une marque présente dans plusieurs communes est regroupée ; un entrepreneur individuel est écarté', () => {
  const communes = { '24294': 'Montpon-Ménestérol', '24322': 'Périgueux' };
  const l = D.marques(rep('SAS X', [unEtab({ siret: 'a' }), unEtab({ siret: 'b', commune: '24322' })]), communes)
    .concat(D.marques(rep('JEAN DUPONT', [unEtab({ siret: 'z', liste_enseignes: ['DUPONT'] })], { nature_juridique: '1000' }), communes));
  const g = D.regrouper(l);
  assert.equal(Object.keys(g).length, 1);
  assert.equal(Object.keys(g['mucchi bach'].communes).length, 2);
});

test('mise en forme des adresses : numéros de case postale, étage, centre commercial et répétitions nettoyés', () => {
  assert.equal(G.formaterAdresse('CS 10203 669 AVENUE SIMONE VEIL 24200 SARLAT-LA-CANEDA', '24200'), '669 Avenue Simone Veil');
  assert.equal(G.formaterAdresse('ET 12 RUE DES ANGLAIS 87000 LIMOGES', '87000'), '12 Rue des Anglais');
  assert.equal(G.formaterAdresse('C C SAINT MARTIAL 39 B AVENUE GARIBALDI 87000 LIMOGES', '87000'), 'Centre commercial Saint Martial 39 B Avenue Garibaldi');
  assert.equal(G.formaterAdresse('CENTRE CCIAL LA FEUILLERAIE LA FEUILLERAIE 24750 TRELISSAC', '24750'), 'Centre commercial la Feuilleraie');
  assert.equal(G.formaterAdresse('LIEU DIT BRION NORD ROUTE DE BORDEAUX 24700 MONTPON-MENESTEROL', '24700'), 'Lieu-dit Brion Nord Route de Bordeaux');
  assert.equal(G.formaterAdresse('PARC COMMERCIAL LES MARTINES 87200 SAINT-JUNIEN', '87200'), 'Parc Commercial les Martines');
});

test('reconnaissance : la raison sociale ne compte pas quand une autre enseigne est déclarée (Centrakor et Malin Plaisir)', () => {
  assert.equal(G.correspond(etab({ liste_enseignes: ['MALIN PLAISIR'] }), { nom_complet: 'CENTRAKOR STORES', nature_juridique: '5499' }, ENSEIGNES.centrakor), null);
  assert.ok(G.correspond(etab({}), { nom_complet: 'CENTRAKOR STORES', nature_juridique: '5499' }, ENSEIGNES.centrakor));
});

test('reconnaissance : « Leclerc » seul (nom de rue, station) ne suffit pas, « E.Leclerc » oui', () => {
  assert.equal(G.correspond(etab({ liste_enseignes: ['STATION AVENUE LECLERC'] }), { nom_complet: 'X' }, ENSEIGNES['e-leclerc']), null);
  assert.ok(G.correspond(etab({ liste_enseignes: ['E. LECLERC'] }), { nom_complet: 'X' }, ENSEIGNES['e-leclerc']));
  assert.ok(G.correspond(etab({ liste_enseignes: ['PROXI-RELAIS E.LECLERC'] }), { nom_complet: 'X' }, ENSEIGNES['e-leclerc']));
});

test('fusion : le numéro de la fiche ne passe pas pour celui des magasins ajoutés', () => {
  const reg = [
    'a | enseigne | A | commerce-vente | Bergerac:1 rue X | 05 53 00 00 01 | | | spontanee | test | ',
    'b | enseigne | B | commerce-vente | Bergerac:1 rue X ; Creysse:2 rue Y | 05 53 00 00 02 | | | spontanee | test | ',
    'c | enseigne | C | commerce-vente | Bergerac:1 rue X | 05 53 00 00 03 | | | spontanee | test | '
  ].join('\n');
  const fiches = L.mtParserEmployeurs(reg).lignes;
  L.mtFusionnerMagasins(fiches, L.mtParserMagasinsGeneres('a | Limoges:3 rue Z\nb | Limoges:3 rue Z'));
  assert.equal(fiches[0].telephone, '', 'le numéro quitte la fiche');
  assert.equal(fiches[0].etablissementsListe[0].telephone, '05 53 00 00 01', 'un seul magasin saisi : le numéro lui revient');
  assert.equal(fiches[0].nbMagasinsGeneres, 1);
  assert.ok(fiches[0].etablissementsListe[1].genere);
  assert.equal(fiches[1].telephone, '05 53 00 00 02', 'deux magasins saisis : le numéro reste sur la fiche, sans choix arbitraire');
  assert.equal(fiches[1].telephoneUnMagasin, true, 'et il est présenté comme présenté pour un seul magasin');
  assert.ok(fiches[1].etablissementsListe.every((x) => !x.telephone));
  assert.equal(fiches[2].telephone, '05 53 00 00 03', 'fiche sans magasin ajouté : rien ne change');
  assert.equal(fiches[2].nbMagasinsGeneres, undefined);
});

test('date du relevé des magasins lue dans l\'en-tête', () => {
  assert.equal(L.mtDateReleveMagasins('# x\n# FICHIER ... Relevé du 2026-11-14.\nlidl | A:b'), '2026-11-14');
  assert.equal(L.mtDateReleveMagasins(''), '');
});

// ---------- Numéros de téléphone ----------
test('numéros : mis au format français, un seul numéro, jamais un numéro étranger ou incomplet', () => {
  assert.equal(G.telephoneFrancais('+33 5 53 05 65 00'), '05 53 05 65 00');
  assert.equal(G.telephoneFrancais('05.53.05.65.00'), '05 53 05 65 00');
  assert.equal(G.telephoneFrancais('0553056500'), '05 53 05 65 00');
  assert.equal(G.telephoneFrancais('+33 (0)5 53 05 65 00; +33 5 55 00 00 00'), '05 53 05 65 00');
  assert.equal(G.telephoneFrancais('+32 2 123 45 67'), '');
  assert.equal(G.telephoneFrancais('12345'), '');
  assert.equal(G.telephoneFrancais(''), '');
});

test('numéros : retenu seulement pour la même enseigne et à moins de 150 m', () => {
  const magasin = { lat: 45.0, lon: 0.15 };
  const proche = { nom: 'Intermarché', marque: '', tel: '+33 5 53 00 00 01', lat: 45.0005, lon: 0.15 };      // environ 55 m
  const loin = { nom: 'Intermarché', marque: '', tel: '+33 5 53 00 00 02', lat: 45.01, lon: 0.15 };         // environ 1 100 m
  const autre = { nom: 'Lidl', marque: 'Lidl', tel: '+33 5 53 00 00 03', lat: 45.0001, lon: 0.15 };          // très près, autre enseigne
  assert.equal(G.telephoneProche(magasin, [loin, autre, proche], ENSEIGNES.intermarche), '05 53 00 00 01');
  assert.equal(G.telephoneProche(magasin, [loin, autre], ENSEIGNES.intermarche), '');
  assert.equal(G.telephoneProche({ lat: NaN, lon: NaN }, [proche], ENSEIGNES.intermarche), '');
});

test('fusion : un magasin saisi sans numéro reçoit celui du relevé, un numéro saisi n\'est jamais remplacé', () => {
  const reg = 'z | enseigne | Z | commerce-vente | Bergerac:1 rue X ; Creysse:2 rue Y:05 53 11 11 11 | | | | spontanee | test | ';
  const fiches = L.mtParserEmployeurs(reg).lignes;
  L.mtFusionnerMagasins(fiches, L.mtParserMagasinsGeneres('z | Bergerac:1 Rue X:05 53 22 22 22 ; Creysse:2 Rue Y:05 53 33 33 33'));
  const l = fiches[0].etablissementsListe;
  assert.equal(l.length, 2);
  assert.equal(l[0].telephone, '05 53 22 22 22');
  assert.ok(l[0].telephoneReleve);
  assert.equal(l[1].telephone, '05 53 11 11 11');
  assert.ok(!l[1].telephoneReleve);
});

test('numéros officiels : appliqués au bon magasin (même commune, même rue), jamais ailleurs, et le fichier réel est lisible', () => {
  const o = G.lireTelephonesOfficiels();
  assert.ok(o.length >= 9, 'le fichier des numéros officiels est lu');
  o.forEach((x) => assert.match(x.telephone, /^0[1-9]( \d{2}){4}$/));
  assert.equal(G.telephoneOfficiel(o, { id: 'e-leclerc', commune: 'Sarlat-la-Canéda', adresse: '402 Avenue Simone Veil' }), '05 53 31 35 35');
  assert.equal(G.telephoneOfficiel(o, { id: 'e-leclerc', commune: 'Bergerac', adresse: '101 Avenue Pasteur' }), '', 'autre commune : aucun numéro');
  assert.equal(G.telephoneOfficiel(o, { id: 'intermarche', commune: 'Sarlat-la-Canéda', adresse: '402 Avenue Simone Veil' }), '', 'autre enseigne : aucun numéro');
});

test('outil de veille : les magasins relevés absents de la fiche sont proposés (nouveaux), les numéros manquants aussi (compléments), jamais un doublon', () => {
  const T = require('../outils/veilleTerritoire.js');
  const fiche = { nature: 'enseigne', etablissements: 'Bergerac:1 rue X ; Creysse:2 rue Y:05 53 11 11 11 ; Nontron' };
  const generes = [
    { commune: 'Bergerac', adresse: '1 Rue X', telephone: '05 53 22 22 22' },   // même magasin, la fiche n'a pas de numéro : complément
    { commune: 'Creysse', adresse: '2 Rue Y', telephone: '05 53 33 33 33' },     // même magasin, la fiche a déjà son numéro : rien
    { commune: 'Bergerac', adresse: '40 avenue Z', telephone: '' },              // autre magasin de la même commune : nouveau
    { commune: 'Lalinde', adresse: '3 route W', telephone: '' }                  // autre commune : nouveau
  ];
  const r = T.magasinsReleves(fiche, generes);
  assert.deepEqual(r.nouveaux.map((x) => x.commune + ':' + x.adresse), ['Bergerac:40 avenue Z', 'Lalinde:3 route W']);
  assert.deepEqual(r.complements, [{ commune: 'Bergerac', adresse: '1 rue X', telephone: '05 53 22 22 22' }]);
  assert.deepEqual(T.magasinsReleves({ nature: 'local', etablissements: 'Bergerac:1 rue X' }, generes), { nouveaux: [], complements: [] }, 'seulement les enseignes');
  assert.deepEqual(T.magasinsReleves(fiche, undefined), { nouveaux: [], complements: [] });
});
