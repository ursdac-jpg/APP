const test = require('node:test');
const assert = require('node:assert');
const V = require('../outils/veilleVerification.js');

const EMP = { fichier: 'employeurs', nom: 'Biocoop Périgueux', valeurs: { nature: 'enseigne', commune: 'Périgueux', site: 'https://www.biocoop.fr/magasin-biocoop_perigueux', recrutement: 'https://www.biocoop.fr/recrutement', telephone: '05 53 00 00 00' } };
const TIRET = new RegExp(String.fromCharCode(0x2013) + '|' + String.fromCharCode(0x2014));

test('prompt individuel : la fiche, ses valeurs actuelles, ses mots de réponse, aucun tiret long', () => {
  const r = V.construireIndividuel(EMP);
  assert.strictEqual(r.ok, true);
  assert.match(r.prompt, /^@Recherche sur le Web/);
  assert.match(r.prompt, /UNE seule fiche/);
  assert.match(r.prompt, /Biocoop Périgueux/);
  assert.match(r.prompt, /https:\/\/www\.biocoop\.fr\/recrutement/);
  assert.match(r.prompt, /05 53 00 00 00/);
  assert.match(r.prompt, /mot \| statut \| valeur lue \| adresse exacte de la page lue/);
  assert.match(r.prompt, /confirmé, corrigé, non vérifiable, fermée ou absente/);
  assert.match(r.prompt, /Aucun portail|aucun annuaire/i);
  assert.ok(!TIRET.test(r.prompt));
  assert.deepStrictEqual(r.champs.map((c) => c.cle), ['site', 'recrutement', 'telephone']);
});

test('prompt individuel : une valeur absente est annoncée « à chercher », un registre inconnu est refusé', () => {
  const r = V.construireIndividuel({ fichier: 'lieux', nom: 'Asso Entraide', valeurs: { commune: 'Bergerac', site: 'https://entraide.example.fr' } });
  assert.match(r.prompt, /Téléphone actuel[^\n]*\(aucun, à chercher\)/);
  assert.match(r.prompt, /Mail \(adresse de service\) actuel[^\n]*\(aucun, à chercher\)/);
  assert.strictEqual(V.construireIndividuel({ fichier: 'zones', nom: 'x' }).ok, false);
  assert.strictEqual(V.construireIndividuel({ fichier: 'lieux', nom: '  ' }).ok, false);
});

test('prompt individuel : les magasins d\'une enseigne sont ajoutés (dix au plus) et non remplaçables', () => {
  const etabs = [];
  for (let i = 1; i <= 12; i++) { etabs.push({ commune: 'Ville' + i, adresse: i + ' rue du Marché', telephone: '05 53 00 00 ' + (10 + i) }); }
  const r = V.construireIndividuel(Object.assign({}, EMP, { etabs: etabs }));
  assert.strictEqual(r.champs.filter((c) => c.genre === 'magasin').length, 10);
  assert.match(r.prompt, /Magasin de Ville1 actuel \(réponds avec le mot « magasin-1 »\)/);
  assert.match(r.prompt, /adresse ; téléphone/);
});

test('lecture individuelle : confirmé, corrigé, non vérifiable, fermée ou absente ; l\'adresse est extraite d\'un lien en markdown', () => {
  const champs = V.construireIndividuel(EMP).champs;
  const rep = [
    'téléphone | corrigé | 05 53 00 00 01 | [biocoop.fr](https://www.biocoop.fr/magasin-biocoop_perigueux) | Tél. : 05 53 00 00 01',
    'site | confirmé | https://www.biocoop.fr/magasin-biocoop_perigueux | https://www.biocoop.fr/magasin-biocoop_perigueux | Biocoop Périgueux',
    '1. recrutement | Non vérifiable | | | page impossible à ouvrir'
  ].join('\n');
  const l = V.lireIndividuel(rep, champs);
  assert.strictEqual(l.ok, true);
  const par = {}; l.lignes.forEach((x) => { par[x.cle] = x; });
  assert.strictEqual(par.telephone.statut, 'corrigé');
  assert.strictEqual(par.telephone.valeur, '05 53 00 00 01');
  assert.strictEqual(par.telephone.page, 'https://www.biocoop.fr/magasin-biocoop_perigueux');
  assert.strictEqual(par.telephone.peutMettre, true);
  assert.strictEqual(par.site.statut, 'confirmé');
  assert.strictEqual(par.site.peutMettre, false);
  assert.strictEqual(par.recrutement.statut, 'non vérifiable');
  assert.deepStrictEqual(l.manquantes, []);
});

test('lecture individuelle : un « corrigé » identique à l\'actuel devient « confirmé » ; sans page lue, la ligne est signalée', () => {
  const champs = V.construireIndividuel(EMP).champs;
  const l = V.lireIndividuel('telephone | corrigé | 0553000000 | https://www.biocoop.fr/x | Tél. 05 53 00 00 00\nsite | confirmé | https://www.biocoop.fr/magasin-biocoop_perigueux | | rien', champs);
  assert.strictEqual(l.lignes[0].statut, 'confirmé');
  assert.strictEqual(l.lignes[0].identique, true);
  assert.strictEqual(l.lignes[0].peutMettre, false);
  assert.match(l.lignes[1].probleme, /page lue n'est pas indiquée/);
  assert.deepStrictEqual(l.manquantes, ['Page de recrutement']);
});

test('lecture individuelle : valeurs refusées (numéro illisible, adresse http, tiret long, mail faux, intermédiaire d\'offres, statut inconnu)', () => {
  const champs = V.construireIndividuel(EMP).champs;
  const l = V.lireIndividuel('telephone | corrigé | 12 34 | https://a.fr/p | x\nsite | corrigé | http://www.biocoop.fr | https://a.fr/p | x\nrecrutement | peut-être | | |', champs);
  assert.match(l.lignes[0].probleme, /numéro illisible/);
  assert.match(l.lignes[1].probleme, /adresse en https/);
  assert.match(l.lignes[2].probleme, /statut illisible/);
  assert.ok(l.lignes.every((x) => !x.peutMettre));
  const lieu = V.construireIndividuel({ fichier: 'lieux', nom: 'Asso', valeurs: {} }).champs;
  const m = V.lireIndividuel('mail | corrigé | pas un mail | https://a.fr/p | x', lieu);
  assert.match(m.lignes[0].probleme, /mail illisible/);
  const off = V.construireIndividuel({ fichier: 'offres', nom: 'Société X', valeurs: { page: 'https://x.fr/offres' } }).champs;
  const o = V.lireIndividuel('page | corrigé | https://fr.indeed.com/cmp/x | https://fr.indeed.com/cmp/x | x', off);
  assert.match(o.lignes[0].probleme, /intermédiaire/);
  const t = V.lireIndividuel('mail | corrigé | contact' + String.fromCharCode(0x2014) + '@asso.fr | https://a.fr/p | x', lieu);
  assert.ok(t.lignes[0].probleme);
});

test('lecture individuelle : un magasin corrigé est affiché mais jamais proposé à recopier ; réponse vide = erreur claire', () => {
  const champs = V.construireIndividuel(Object.assign({}, EMP, { etabs: [{ commune: 'Limoges', adresse: '3 rue A', telephone: '05 55 00 00 00' }] })).champs;
  const l = V.lireIndividuel('magasin-1 | corrigé | 5 rue B ; 05 55 00 00 01 | https://www.biocoop.fr/limoges | adresse lue', champs);
  assert.strictEqual(l.lignes[0].statut, 'corrigé');
  assert.strictEqual(l.lignes[0].peutMettre, false);
  const vide = V.lireIndividuel('Voici mon analyse sans tableau.', champs);
  assert.strictEqual(vide.ok, false);
  assert.match(vide.erreur, /Aucune ligne reconnue/);
});

test('lecture individuelle : puces, numéros, barres de tableau, en-tête recopié et lignes étrangères sont absorbés', () => {
  const champs = V.construireIndividuel(EMP).champs;
  const rep = ['```', '| mot | statut | valeur lue | adresse exacte de la page lue | citation |', '| site | confirmé | https://www.biocoop.fr/a | https://www.biocoop.fr/a | ok |', '- telephone | confirmé | 05 53 00 00 00 | https://www.biocoop.fr/a | ok', '```', 'Remarque hors tableau | bizarre'].join('\n');
  const l = V.lireIndividuel(rep, champs);
  assert.deepStrictEqual(l.lignes.map((x) => x.cle), ['site', 'telephone']);
  assert.strictEqual(l.inconnues.length, 1);
});

test('prompt de groupe : huit fiches au plus, aucune valeur à recopier demandée, statuts de tri', () => {
  const fiches = [];
  for (let i = 1; i <= 11; i++) { fiches.push({ fichier: 'employeurs', id: 'emp-' + i, nom: 'Employeur ' + i, valeurs: { site: 'https://emp' + i + '.fr', telephone: '05 53 00 00 0' + (i % 10) } }); }
  const r = V.construireGroupe(fiches);
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.nb, 8);
  assert.match(r.prompt, /1 \| Employeur 1 \| site officiel actuel : https:\/\/emp1\.fr/);
  assert.ok(!/Employeur 9/.test(r.prompt));
  assert.match(r.prompt, /Tu ne proposes aucune valeur à recopier/);
  assert.match(r.prompt, /Statuts possibles : confirmé, à regarder, introuvable/);
  assert.ok(!TIRET.test(r.prompt));
  assert.strictEqual(V.construireGroupe([]).ok, false);
});

test('lecture de groupe : tri par numéro, fiches manquantes signalées, statut inconnu signalé', () => {
  const g = V.construireGroupe([
    { fichier: 'employeurs', id: 'a', nom: 'Alpha', valeurs: {} }, { fichier: 'lieux', id: 'b', nom: 'Bravo', valeurs: {} }, { fichier: 'offres', id: 'c', nom: 'Charlie', valeurs: {} }
  ]);
  const rep = ['numéro | nom | statut | ce qui diffère | adresse', '1 | Alpha | confirmé | | https://alpha.fr/a', '2 | Bravo | À regarder | téléphone différent | https://bravo.fr/c', '9 | Inconnu | confirmé | | '].join('\n');
  const l = V.lireGroupe(rep, g.fiches);
  assert.deepStrictEqual(l.lignes.map((x) => [x.id, x.statut]), [['a', 'confirmé'], ['b', 'à regarder']]);
  assert.strictEqual(l.lignes[1].diff, 'téléphone différent');
  assert.strictEqual(l.lignes[1].page, 'https://bravo.fr/c');
  assert.deepStrictEqual(l.manquantes, ['Charlie']);
  assert.strictEqual(l.inconnues.length, 1);
  const x = V.lireGroupe('3 | Charlie | peut-être | |', g.fiches);
  assert.match(x.lignes[0].probleme, /statut illisible/);
});

test('fiche d\'information : prompt individuel (titre, texte, sources, date en français, six points au plus) et refus d\'une fiche vide', () => {
  const r = V.construireFiche({ rayon: 'budget', id: 'x', titre: 'Les aides au transport', verifieLe: '2026-10-13', territoire: 'national', corps: 'Le plafond est de 500 euros.', change: ['les montants'], sources: ['https://www.service-public.fr/a'] });
  assert.strictEqual(r.ok, true);
  assert.match(r.prompt, /Vérifie UNE seule fiche d'information/);
  assert.match(r.prompt, /Dernière vérification : 13\/10\/2026/);
  assert.match(r.prompt, /Le plafond est de 500 euros\./);
  assert.match(r.prompt, /six au plus/);
  assert.match(r.prompt, /Statuts possibles : confirmé, corrigé, non vérifiable, obsolète/);
  assert.ok(!TIRET.test(r.prompt));
  assert.strictEqual(V.construireFiche({ titre: 'x', corps: '' }).ok, false);
});

test('fiche d\'information : lecture par point, jamais de valeur à recopier, page absente signalée', () => {
  const l = V.lireFiche(['point | statut | ce que dit la fiche | ce que tu as lu | adresse | citation', 'plafond | corrigé | 500 euros | 600 euros | https://www.service-public.fr/x | Le plafond est de 600 euros', 'dispositif | Obsolète | Aide X | supprimée | | rien', 'âge | peut-être | 26 | 26 | https://a.fr | x'].join('\n'));
  assert.strictEqual(l.lignes.length, 3);
  assert.strictEqual(l.lignes[0].statut, 'corrigé');
  assert.strictEqual(l.lignes[0].valeur, '600 euros');
  assert.ok(l.lignes.every((x) => x.peutMettre === false));
  assert.match(l.lignes[1].probleme, /page lue n'est pas indiquée/);
  assert.match(l.lignes[2].probleme, /statut illisible/);
  assert.strictEqual(V.lireFiche('du texte sans tableau').ok, false);
});

test('groupe de fiches d\'information : texte coupé, statut obsolète lu', () => {
  const g = V.construireGroupe([{ fichier: 'fiches', id: 'budget:x', nom: 'Aides', verifieLe: '2026-01-05', corps: 'a'.repeat(5000) }]);
  const ligne = g.prompt.split('\n').filter((x) => x.indexOf('1 | Aides') === 0)[0];
  assert.match(ligne, /vérifiée le 05\/01\/2026/);
  assert.ok(ligne.length < 1400);
  assert.match(g.prompt, /obsolète/);
  const l = V.lireGroupe('1 | Aides | obsolète | dispositif supprimé | https://a.fr/p', g.fiches);
  assert.strictEqual(l.lignes[0].statut, 'obsolète');
});
