const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Logique PURE du module « Qui fait quoi » (annuaire local : employeurs, puis structures). Contient aussi le contrôle des fichiers de données réels :
// une ligne mal écrite dans contenu/employeurs.txt fait échouer ce test. Plan : docs/PLAN_MON_TERRITOIRE_PREMICES_2026-10-12.md.
const L = require('../modules/mon-territoire/logique.js');
const RACINE = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(RACINE, p), 'utf8');

const secteurs = vm.runInNewContext(lire('data/secteurs.js') + ';SECTEURS_DETAIL')
  .map((s) => ({ cle: s.cle, libelle: s.libelle }));
const communes = L.mtParserCommunes(lire('modules/mon-territoire/contenu/communes-24.txt'));
const texteEmployeurs = lire('modules/mon-territoire/contenu/employeurs.txt');   // le vrai registre : seulement des controles de validite, jamais de nombre ni de contenu precis
// Copies FIGEES pour les tests unitaires : un ajout legitime dans les vrais registres ne doit jamais faire echouer ces essais.
const FIX_EMPLOYEURS = lire('tests/fixtures/mon-territoire-employeurs.txt');
const FIX_LIEUX = lire('tests/fixtures/mon-territoire-lieux.txt');

// ---------- fraîcheur et affichage des coordonnées ----------

test('mtFraicheur : sans date, récente, à revérifier au bout de 12 mois, date future invalide', () => {
  assert.equal(L.mtFraicheur('', '2026-10-12'), 'sans-date');
  assert.equal(L.mtFraicheur('pas une date', '2026-10-12'), 'sans-date');
  assert.equal(L.mtFraicheur('2026-10-12', '2026-10-12'), 'recente');
  assert.equal(L.mtFraicheur('2025-10-13', '2026-10-12'), 'recente');
  assert.equal(L.mtFraicheur('2025-10-12', '2026-10-12'), 'a-reverifier');
  assert.equal(L.mtFraicheur('2024-01-01', '2026-10-12'), 'a-reverifier');
  assert.equal(L.mtFraicheur('2026-11-01', '2026-10-12'), 'future');
});

test('mtContactAffichable : rien ne s\'affiche sans date récente, jamais un téléphone périmé', () => {
  const ligne = { date: '2026-10-12', site: 'https://a.fr/', telephone: '05 53 00 00 00', recrutement: '' };
  assert.deepEqual(L.mtContactAffichable(ligne, '2026-10-20'), { site: true, telephone: true, recrutement: false });
  assert.deepEqual(L.mtContactAffichable(ligne, '2028-01-01'), { site: false, telephone: false, recrutement: false });
  assert.deepEqual(L.mtContactAffichable({ date: '', site: 'https://a.fr/', telephone: '', recrutement: '' }, '2026-10-20'), { site: false, telephone: false, recrutement: false });
});

// ---------- lecture des fichiers ----------

test('mtParserRegistre : colonnes vides et dernière colonne vide acceptées, commentaires ignorés, mauvais nombre de colonnes signalé', () => {
  const r = L.mtParserRegistre('# commentaire\n\na | b | | d |\nx | y\n', ['c1', 'c2', 'c3', 'c4', 'c5']);
  assert.equal(r.lignes.length, 1);
  assert.deepEqual([r.lignes[0].c1, r.lignes[0].c2, r.lignes[0].c3, r.lignes[0].c4, r.lignes[0].c5], ['a', 'b', '', 'd', '']);
  assert.equal(r.erreurs.length, 1);
});

test('mtParserEtablissements et mtParserModes', () => {
  assert.deepEqual(L.mtParserEtablissements('Bergerac:14 rue Durou ; Creysse:154 avenue de la Roque'),
    [{ commune: 'Bergerac', adresse: '14 rue Durou', telephone: '' }, { commune: 'Creysse', adresse: '154 avenue de la Roque', telephone: '' }]);
  assert.deepEqual(L.mtParserModes('spontanee, concours'), ['spontanee', 'concours']);
  assert.deepEqual(L.mtParserModes(''), []);
});

// ---------- commune de la personne (D9) ----------

test('mtTrouverCommune : nom sans accent ni majuscule, code postal, plusieurs, inconnue', () => {
  assert.equal(L.mtTrouverCommune(communes.lignes, 'bergerac').statut, 'trouvee');
  assert.equal(L.mtTrouverCommune(communes.lignes, 'BERGERAC').communes[0].epci, '200070647');
  assert.equal(L.mtTrouverCommune(communes.lignes, 'Périgueux').statut, 'trouvee');
  assert.equal(L.mtTrouverCommune(communes.lignes, '24100').statut, 'plusieurs');
  assert.equal(L.mtTrouverCommune(communes.lignes, 'zzzzzz').statut, 'inconnue');
  assert.equal(L.mtTrouverCommune(communes.lignes, '').statut, 'inconnue');
  assert.equal(L.mtTrouverCommune(communes.lignes, '99999').statut, 'inconnue');
});

test('mtDansMonIntercommunalite : vrai seulement si un établissement est dans la même intercommunalité', () => {
  const e = L.mtParserEmployeurs(FIX_EMPLOYEURS).lignes.filter((x) => x.id === 'intermarche')[0];
  const bergerac = L.mtTrouverCommune(communes.lignes, 'Bergerac').communes[0];
  const perigueux = L.mtTrouverCommune(communes.lignes, 'Périgueux').communes[0];
  assert.equal(L.mtDansMonIntercommunalite(e, communes.lignes, bergerac), true);
  assert.equal(L.mtDansMonIntercommunalite(e, communes.lignes, perigueux), false);
  assert.equal(L.mtDansMonIntercommunalite(e, communes.lignes, null), false);
});

// ---------- listes, tri, recherche ----------

test('mtEmployeursDuSecteur : tri alphabétique, jamais un classement', () => {
  const liste = L.mtParserEmployeurs(FIX_EMPLOYEURS).lignes;
  const noms = L.mtEmployeursDuSecteur(liste, 'commerce-vente').map((e) => e.nom);
  assert.deepEqual(noms, noms.slice().sort((a, b) => a.localeCompare(b, 'fr')));
  assert.deepEqual(L.mtEmployeursDuSecteur(liste, 'btp'), []);
});

test('mtPaginer : pas de bouton « suivants » sous 12 lignes, 12 par 12 au-delà (12 se range en 1, 2, 3 ou 4 colonnes sans ligne incomplète)', () => {
  const l = Array.from({ length: 25 }, (_, i) => i);
  assert.equal(L.mtPaginer(l.slice(0, 4)).restants, 0);
  assert.equal(L.mtPaginer(l).page.length, 12);
  assert.equal(L.mtPaginer(l).restants, 13);
  assert.equal(L.mtPaginer(l, 24).page.length, 24);
  assert.equal(L.mtPaginer(l, 40).restants, 0);
});

test('mtRechercherEmployeurs et mtRechercherSecteurs : par nom, secteur, métier, commune ; deux lettres minimum', () => {
  const liste = L.mtParserEmployeurs(FIX_EMPLOYEURS).lignes;
  assert.ok(L.mtRechercherEmployeurs(liste, secteurs, 'lidl').some((e) => e.id === 'lidl'));
  assert.ok(L.mtRechercherEmployeurs(liste, secteurs, 'caissier').length >= 1);
  assert.ok(L.mtRechercherEmployeurs(liste, secteurs, 'Creysse').some((e) => e.id === 'intermarche'));
  assert.deepEqual(L.mtRechercherEmployeurs(liste, secteurs, 'l'), []);
  assert.deepEqual(L.mtRechercherEmployeurs(liste, secteurs, 'plombier'), []);
  assert.ok(L.mtRechercherSecteurs(secteurs, 'plombier').some((s) => s.cle === 'btp'));
});

// ---------- vérificateur : cas refusés ----------

// Les communes de TOUS les départements du module (Dordogne et Haute-Vienne) : un contrôle de données ne doit refuser ni Limoges ni Bergerac.
const toutesCommunes = communes.lignes.concat(L.mtParserCommunes(lire('modules/mon-territoire/contenu/communes-87.txt')).lignes);
const ctx = { secteurs: secteurs.map((s) => s.cle), communes: toutesCommunes.map((c) => c.cle), aujourdhui: '2026-10-12' };
// Les vrais fichiers (lieux.txt, employeurs.txt) sont controles avec la VRAIE date du jour : l'outil de veille date une fiche validee d'aujourd'hui,
// et une date fixe dans le passe la refusait (« date dans le futur »), ce qui annulait tout enregistrement de Denis (2026-10-15).
const dateDuJourReelle = (() => { const d = new Date(), p = (n) => (n < 10 ? '0' : '') + n; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); })();
const ctxReel = Object.assign({}, ctx, { aujourdhui: dateDuJourReelle });
const base = 'x1 | enseigne | Exemple | commerce-vente | Bergerac:1 rue A | | | | non-indique | Sirene |';
const refus = (ligne, morceau) => {
  const e = L.mtVerifierEmployeurs(ligne, ctx);
  assert.ok(e.some((m) => m.indexOf(morceau) !== -1), 'attendu « ' + morceau + ' », obtenu : ' + JSON.stringify(e));
};

test('mtVerifierEmployeurs : une ligne correcte passe', () => {
  assert.deepEqual(L.mtVerifierEmployeurs(base, ctx), []);
});

test('mtVerifierEmployeurs : refuse les lignes mal écrites', () => {
  refus(base + '\n' + base, 'identifiant en double');
  refus(base.replace('enseigne', 'autre'), 'nature inconnue');
  refus(base.replace('commerce-vente', 'inconnu'), 'secteur inconnu');
  refus(base.replace('Bergerac', 'Nulleville'), 'commune inconnue');
  refus(base.replace('non-indique', 'toujours'), 'mode inconnu');
  refus(base.replace('| Exemple |', '| Madame Dupont |'), 'personne');
  refus(base.replace('Sirene |', 'Sirene | 2026-13-45'), 'date invalide');
  refus(base.replace('Sirene |', 'Sirene | 2027-01-01'), 'futur');
  refus(base.replace('| | | | non', '| 05 53 00 00 00 | | | non'), 'sans date');
  refus(base.replace('| | | | non', '| 0553 | | | non').replace('Sirene |', 'Sirene | 2026-10-12'), 'téléphone mal écrit');
  refus(base.replace('| | | | non', '| | http://a.fr | | non').replace('Sirene |', 'Sirene | 2026-10-12'), 'https');
  refus(base.replace('Exemple', 'Exemple — test'), 'tiret long');
  refus('x1 | enseigne | Exemple', 'colonnes');
});

// ---------- fichiers de données réels ----------

test('contenu/employeurs.txt : aucune erreur, aucune ligne mal écrite', () => {
  assert.deepEqual(L.mtVerifierEmployeurs(texteEmployeurs, ctxReel), []);
});

test('contenu/communes-24.txt : 503 communes, toutes avec code, nom, code postal et intercommunalité', () => {
  assert.equal(communes.erreurs.length, 0);
  assert.equal(communes.lignes.length, 503);
  communes.lignes.forEach((c) => { assert.ok(c.code && c.nom && c.codesPostaux.length && c.epci && c.epciNom, c.nom); });
});

test('contenu/communes-87.txt : 195 communes de la Haute-Vienne, toutes complètes, aucun nom commun avec la Dordogne (un contrôle par nom reste sans ambiguïté)', () => {
  const c87 = L.mtParserCommunes(lire('modules/mon-territoire/contenu/communes-87.txt'));
  assert.equal(c87.erreurs.length, 0);
  assert.equal(c87.lignes.length, 195);
  c87.lignes.forEach((c) => { assert.ok(/^87\d{3}$/.test(c.code) && c.nom && c.codesPostaux.length && c.epci && c.epciNom, c.nom); });
  const noms24 = communes.lignes.map((c) => c.cle);
  assert.deepEqual(c87.lignes.filter((c) => noms24.indexOf(c.cle) !== -1).map((c) => c.nom), []);
  assert.ok(c87.lignes.some((c) => c.nom === 'Limoges' && c.codesPostaux.indexOf('87000') !== -1));
});

test('chaque secteur de data/secteurs.js a son icône et ses exemples de métiers', () => {
  secteurs.forEach((s) => { assert.ok(L.MT_SECTEURS_AFFICHAGE[s.cle] && L.MT_SECTEURS_AFFICHAGE[s.cle].icone && L.MT_SECTEURS_AFFICHAGE[s.cle].exemples, s.cle); });
  assert.equal(secteurs.length, 21);
  assert.equal(Object.keys(L.MT_SECTEURS_AFFICHAGE).length, 21);
});

test('types de structure : 28, et ceux du Lexique y figurent avec le même identifiant', () => {
  assert.equal(Object.keys(L.MT_TYPES).length, 28);
  ['france-travail', 'mission-locale', 'cap-emploi', 'plie', 'caf', 'siae'].forEach((id) => { assert.ok(L.MT_TYPES[id], id); });
});

test('module fermé au public par défaut (D11) ; aucun tiret long dans les fichiers du module', () => {
  // Fermé au public (décision de Denis, 2026-10-18, avant l'envoi vers GitHub) : visible seulement sur son poste (localhost) ; à passer à true pour ouvrir au public.
  assert.equal(L.MT_OUVERT, false, 'MT_OUVERT : le module est fermé au public ; le passer à true seulement pour l’ouvrir (et adapter ce test)');
  const avant = global.location;
  try {
    global.location = { hostname: 'localhost' }; assert.equal(L.mtEstEnLocal(), true, 'machine locale reconnue'); assert.equal(L.mtOuvert(), true, 'visible sur le poste de Denis');
    global.location = { hostname: 'denis.github.io' }; assert.equal(L.mtEstEnLocal(), false); assert.equal(L.mtOuvert(), false, 'caché en ligne');
  } finally { if (avant === undefined) { delete global.location; } else { global.location = avant; } }
  ['modules/mon-territoire/logique.js', 'modules/mon-territoire/contenu/employeurs.txt'].forEach((f) => {
    assert.ok(!/[–—]/.test(lire(f)), f);
  });
});

// ---------- structures (lieux) : fichier réel et migration du rayon Logement ----------

const texteLieux = lire('modules/mon-territoire/contenu/lieux.txt');
const lieuxReels = L.mtParserLieux(texteLieux);
const lieux = L.mtParserLieux(FIX_LIEUX);

test('contenu/lieux.txt : aucune erreur, aucune ligne mal écrite', () => {
  assert.deepEqual(L.mtVerifierLieux(texteLieux, ctxReel), []);
});

test('mtVerifierLieux : refuse les lignes mal écrites', () => {
  const ligne = 'x1 | ccas | Un organisme | une phrase | | | | | national | logement | Source |';
  const refuse = (t, morceau) => { const e = L.mtVerifierLieux(t, ctx); assert.ok(e.some((m) => m.indexOf(morceau) !== -1), 'attendu « ' + morceau + ' », obtenu : ' + JSON.stringify(e)); };
  assert.deepEqual(L.mtVerifierLieux(ligne, ctx), []);
  refuse(ligne + '\n' + ligne, 'identifiant en double');
  refuse(ligne.replace('| ccas |', '| inventé |'), 'type inconnu');
  refuse(ligne.replace('national', 'mondial'), 'portée inconnue');
  refuse(ligne.replace('logement', 'nimporte'), 'rayon inconnu');
  refuse(ligne.replace('| | | | | national', '| | | | https://a.fr/ | national'), 'sans date');
  refuse(ligne.replace('Un organisme', 'Madame Dupont'), 'personne');
  refuse(ligne.replace('Source |', 'Source | 2030-01-01'), 'futur');
  refuse(ligne.replace('une phrase', 'une phrase \u2014 tiret'), 'tiret long');
});

const HISTORIQUE_LOGEMENT = ['115-samu-social', 'siao-dordogne', 'accueils-de-jour-dordogne', 'ccas-domiciliation', 'conseil-departemental-dordogne-fsl', 'adil-dordogne',
  'action-logement-nouvelle-aquitaine', 'caf-dordogne-logement', 'prefecture-dordogne-dalo', 'habitat-jeunes-perigord', 'asso-soliha-dordogne'];

test('migration du rayon Logement : les 11 structures d\'origine (national, région, Dordogne) sont toutes dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'logement');
  HISTORIQUE_LOGEMENT.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id + ' (si le retrait est voulu et validé par Denis, le noter ici)');
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
  const al = nouveaux.filter((x) => x.id === 'action-logement-nouvelle-aquitaine')[0];
  assert.ok(al.description.indexOf('Visale') !== -1 && al.description.indexOf('Loca-Pass') !== -1, 'Action Logement doit citer Visale et Loca-Pass');
});

test('collecte du rayon Logement : ne garde plus aucune structure (tout vit dans lieux.txt, sinon elles ne s\'affichent pas)', () => {
  const collecte = lire('modules/comprendre-le-cadre/contenu/logement/logement.collecte.md');
  const ids = [];
  let dans = false;
  collecte.split(/\r?\n/).forEach((l) => {
    if (/^structures:/.test(l)) { dans = true; return; }
    if (dans) { const m = l.match(/^\s*-\s*"([^ |]+) \|/); if (m) ids.push(m[1]); else if (/^\S/.test(l)) dans = false; }
  });
  assert.deepEqual(ids.sort(), [], 'une structure du rayon Logement a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('une seule source de vérité : aucune adresse du registre liens-verifies.txt ne double une structure du répertoire (D14)', () => {
  const registre = lire('modules/comprendre-le-cadre/liens-verifies.txt').split(/\r?\n/).filter((l) => l.trim() && l.trim()[0] !== '#').map((l) => l.split(' | ')[0].trim());
  const doublons = lieuxReels.lignes.map((l) => l.id).filter((id) => registre.indexOf(id) !== -1);
  assert.deepEqual(doublons, [], 'ces structures sont dans lieux.txt : retirer leur ligne de liens-verifies.txt (l\'adresse et la date se tiennent à un seul endroit)');
});

const HISTORIQUE_ACCOMPAGNEMENT = ['france-travail', 'cap-emploi-dordogne', 'conseil-departemental-dordogne-insertion', 'structures-iae-dordogne', 'inae-nouvelle-aquitaine',
  'plie-et-maison-emploi-dordogne', 'apec', 'asso-base-24', 'asso-la-main-forte-24', 'asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24',
  'asso-france-alzheimer-24', 'asso-unafam-24', 'asso-croix-marine-24', 'asso-saveurs-du-bois-du-roc-24', 'asso-geiq-24'];

test('migration du rayon accompagnement : les 16 structures déplacées, la Mission locale du Périgord Noir (D13) et le PLIE du Bergeracois (D15) sont dans le répertoire', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'accompagnement');
  HISTORIQUE_ACCOMPAGNEMENT.concat(['asso-mission-locale-perigord-noir-24', 'plie-bergeracois']).forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
  const mls = L.mtLieuxDuType(lieuxReels.lignes, 'mission-locale').filter((x) => x.portee === '24');
  assert.ok(mls.length >= 3, 'les trois Missions locales de la Dordogne');
  assert.ok(!lieuxReels.lignes.some((x) => x.id === 'mission-locale-perigord'), 'le générique est fusionné dans les Missions locales réelles (D13)');
});

function idsDeCollecte(rayon) {
  const ids = [];
  let dans = false;
  lire('modules/comprendre-le-cadre/contenu/' + rayon + '/' + rayon + '.collecte.md').split(/\r?\n/).forEach((l) => {
    if (/^structures:/.test(l)) { dans = true; return; }
    if (dans) { const m = l.match(/^\s*-\s*"([^ |]+) \|/); if (m) ids.push(m[1]); else if (/^\S/.test(l)) dans = false; }
  });
  return ids.sort();
}

test('collecte du rayon accompagnement : ne garde que les annuaires en ligne (D8) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('accompagnement'), ['annuaire-acteurs-dordogne', 'carto-inclusion-numerique', 'dora-services-insertion', 'figem-annuaire-gem'],
    'une structure du rayon accompagnement a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

const HISTORIQUE_MOBILITE = ['plateforme-mobilite-dordogne', 'conseil-regional-nouvelle-aquitaine-transports', 'conseil-departemental-dordogne-mobilite', 'auto-ecoles-associatives-sociales',
  'asso-afac-24', 'asso-auto-mobilite-solidaire-dordogne', 'asso-plateforme-must', 'asso-atchoum-24'];

test('migration du rayon mobilité : les 8 structures déplacées sont dans le répertoire, avec adresse et date ; la Mission locale du Périgord Noir y figure aussi (le générique est fusionné)', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'mobilite');
  HISTORIQUE_MOBILITE.concat(['asso-mission-locale-perigord-noir-24']).forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon mobilité : ne garde que les services en ligne (D8) et les deux Missions locales (texte propre au rayon) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('mobilite'), ['asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24', 'covoit-modalis', 'france-mobilites-solutions', 'mes-aides-france-travail'],
    'une structure du rayon mobilité a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

const HISTORIQUE_BUDGET = ['banque-france-succursales', 'ccas-mairie', 'caf-dordogne', 'msa-dordogne-lot-et-garonne', 'udaf-dordogne', 'cresus-nouvelle-aquitaine',
  'croix-rouge-secours-catholique-microcredit', 'restos-du-coeur-dordogne', 'banque-alimentaire-dordogne', 'secours-populaire-dordogne', 'epiceries-sociales-solidaires', 'asso-la-maison-24'];

test('migration du rayon budget : les 12 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'budget');
  HISTORIQUE_BUDGET.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon budget : ne garde que les services en ligne (D8) et les structures déjà migrées avec un texte propre au rayon ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('budget'), ['asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24',
    'conseil-departemental-dordogne-insertion', 'mesquestionsdargent-pcb', 'point-conseil-budget-annuaire'],
    'une structure du rayon budget a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

const HISTORIQUE_JEUNES = ['france-travail-jeunes-dordogne', 'e2c-perigueux', 'epide-nouvelle-aquitaine', 'psad-plateforme-suivi-appui-decrocheurs-dordogne', 'cfa-et-ecoles-de-production-nouvelle-aquitaine', 'asso-crij-nouvelle-aquitaine'];

test('migration du rayon jeunes : les 6 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'jeunes');
  HISTORIQUE_JEUNES.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon jeunes : ne garde que le service civique (service en ligne, D8) et les trois Missions locales (texte propre au rayon) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('jeunes'), ['agence-service-civique', 'asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24', 'asso-mission-locale-perigord-noir-24'],
    'une structure du rayon jeunes a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : chaque rayon migré affiché par le module a son domaine (social ou formation)', () => {
  assert.equal(L.mtDomaineDuRayon('logement'), 'social');
  assert.equal(L.mtDomaineDuRayon('budget'), 'social');
  assert.equal(L.mtDomaineDuRayon('jeunes'), 'formation');
  assert.equal(L.mtDomaineDuRayon('rayon-inexistant'), '');
});

const HISTORIQUE_GARDE = ['relais-petite-enfance', 'pmi-dordogne', 'france-travail-garde', 'ccas-commune'];

test('migration du rayon garde : les 4 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'garde');
  HISTORIQUE_GARDE.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon garde : ne garde que les services en ligne (D8) et les structures déjà migrées avec un texte propre au rayon ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('garde'), ['asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24', 'caf-dordogne', 'monenfant-annuaire', 'pajemploi-urssaf'],
    'une structure du rayon garde a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('le générique « Missions locales du Périgord » n\'est plus cité par aucun rayon ni par le registre des adresses (fusionné dans les Missions locales réelles, D13)', () => {
  const rayons = fs.readdirSync(path.join(RACINE, 'modules/comprendre-le-cadre/contenu')).filter((r) => fs.existsSync(path.join(RACINE, 'modules/comprendre-le-cadre/contenu', r, r + '.collecte.md')));
  rayons.forEach((r) => { assert.ok(idsDeCollecte(r).indexOf('mission-locale-perigord') === -1, r); });
  assert.ok(!/^mission-locale-perigord \| /m.test(lire('modules/comprendre-le-cadre/liens-verifies.txt')));
});

test('mtDomaineDuRayon : la garde est dans « Vie pratique »', () => {
  assert.equal(L.mtDomaineDuRayon('garde'), 'vie-pratique');
});

const HISTORIQUE_HANDICAP = ['mdph-dordogne', 'agefiph-delegation-nouvelle-aquitaine', 'medecine-du-travail-service-prevention-sante', 'entreprises-adaptees-esat-dordogne', 'cdad-dordogne-points-justice', 'asso-apf-24'];

test('migration du rayon handicap : les 6 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'handicap');
  HISTORIQUE_HANDICAP.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon handicap : ne garde que Cap emploi (déjà migré, texte propre au rayon) et France Travail de la Dordogne (adresse pas encore vérifiée) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('handicap'), ['cap-emploi-dordogne', 'france-travail-dordogne'],
    'une structure du rayon handicap a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : le handicap est dans « Social »', () => {
  assert.equal(L.mtDomaineDuRayon('handicap'), 'social');
});

const HISTORIQUE_FORMER = ['mon-cep-operateur-nouvelle-aquitaine', 'transitions-pro-nouvelle-aquitaine', 'france-travail-formation', 'conseil-regional-nouvelle-aquitaine-formation', 'france-vae-point-relais-conseil', 'afpa-greta-cnam-dordogne'];

test('migration du rayon former : les 6 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'former');
  HISTORIQUE_FORMER.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon former : ne garde que les structures déjà migrées avec un texte propre au rayon (APEC, deux Missions locales) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('former'), ['apec', 'asso-mission-locale-du-bergeracois-24', 'asso-mission-locale-du-grand-perigueux-24'],
    'une structure du rayon former a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : « Se former » est dans « Formation »', () => {
  assert.equal(L.mtDomaineDuRayon('former'), 'formation');
});

const HISTORIQUE_EMPLOI = ['inspection-du-travail-ddets-dordogne', 'conseil-de-prud-hommes-perigueux-bergerac'];

test('migration du rayon emploi : les 2 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'emploi');
  HISTORIQUE_EMPLOI.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon emploi : ne garde que les structures déjà migrées avec un texte propre au rayon (France Travail, points-justice, insertion par l\'activité économique, Cap emploi) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('emploi'), ['cap-emploi-dordogne', 'cdad-dordogne-points-justice', 'france-travail', 'structures-iae-dordogne'],
    'une structure du rayon emploi a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : « Contrats et droit du travail » est dans « Social »', () => {
  assert.equal(L.mtDomaineDuRayon('emploi'), 'social');
});

const HISTORIQUE_JURIDIQUE = ['cdad-dordogne', 'bureau-aide-juridictionnelle-perigueux', 'defenseur-des-droits-delegues-dordogne', 'france-victimes-dordogne', 'ordre-avocats-perigueux', 'asso-cidff-24', 'cdad-dordogne-points-justice', 'inspection-du-travail-ddets-dordogne', 'conseil-de-prud-hommes-perigueux-bergerac'];
const HISTORIQUE_JUSTICE = ['spip-dordogne', 'france-travail-justice-dordogne', 'structures-iae-milieu-penitentiaire', 'cdad-dordogne-points-justice'];

test('migration des rayons juridique et justice : toutes les structures déplacées ou fusionnées sont dans le répertoire, avec adresse et date', () => {
  const jur = L.mtLieuxDuRayon(lieuxReels.lignes, 'juridique');
  HISTORIQUE_JURIDIQUE.forEach((id) => {
    const n = jur.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue (juridique) : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
  const jus = L.mtLieuxDuRayon(lieuxReels.lignes, 'justice');
  HISTORIQUE_JUSTICE.forEach((id) => {
    const n = jus.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue (justice) : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte des rayons juridique et justice : ne gardent que les services en ligne et annuaires, et les structures déjà migrées à texte propre ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('juridique'), [], 'une structure du rayon juridique a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
  assert.deepEqual(idsDeCollecte('justice'), ['associations-post-sentencielles-dordogne', 'casier-judiciaire-national', 'siao-dordogne'],
    'une structure du rayon justice a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('les génériques fusionnés (points-justice, prud\'hommes, inspection du travail) ne sont plus cités nulle part', () => {
  ['point-justice-dordogne', 'point-justice-perigueux-bergerac', 'conseil-prudhommes-perigueux-bergerac', 'dreets-inspection-travail-dordogne'].forEach((id) => {
    ['juridique', 'justice', 'emploi', 'handicap'].forEach((r) => assert.ok(idsDeCollecte(r).indexOf(id) === -1, id + ' encore cité dans ' + r));
  });
});

test('mtDomaineDuRayon : juridique et justice sont dans « Droits et justice »', () => {
  assert.equal(L.mtDomaineDuRayon('juridique'), 'droits-justice');
  assert.equal(L.mtDomaineDuRayon('justice'), 'droits-justice');
});

const HISTORIQUE_SANTE = ['cpam-dordogne', 'france-services'];

test('migration du rayon sante : les 2 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'sante');
  HISTORIQUE_SANTE.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon sante : ne garde plus aucune structure ; tout vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('sante'), [],
    'une structure du rayon sante a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : la santé est dans « Vie pratique »', () => {
  assert.equal(L.mtDomaineDuRayon('sante'), 'vie-pratique');
});

const HISTORIQUE_SENIORS = ['assurance-retraite-carsat-nouvelle-aquitaine', 'france-services'];

test('migration du rayon seniors : la CARSAT est déplacée et France Services fusionné, dans le répertoire avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'seniors');
  HISTORIQUE_SENIORS.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon seniors : ne garde que le service en ligne info-retraite.fr (D8) ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('seniors'), ['info-retraite-mon-compte-retraite'],
    'une structure du rayon seniors a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
  assert.ok(idsDeCollecte('sante').indexOf('france-services-point-retraite') === -1);
});

test('mtDomaineDuRayon : la retraite est dans « Vie pratique »', () => {
  assert.equal(L.mtDomaineDuRayon('seniors'), 'vie-pratique');
});

const HISTORIQUE_CREER = ['chambre-metiers-artisanat-dordogne', 'cci-dordogne', 'bge-perigord', 'adie-nouvelle-aquitaine', 'initiative-perigord', 'france-active-nouvelle-aquitaine', 'asso-coopalpha-24', 'asso-iriscop-24', 'asso-la-traverse-bergerac-24'];

test('migration du rayon creer : les 9 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'creer');
  HISTORIQUE_CREER.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon creer : ne garde que France Travail de la Dordogne (adresse pas encore vérifiée) ; le générique des coopératives est fusionné avec les deux fiches précises', () => {
  assert.deepEqual(idsDeCollecte('creer'), ['france-travail-createur-dordogne'],
    'une structure du rayon creer a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
  assert.ok(lire('modules/comprendre-le-cadre/liens-verifies.txt').indexOf('cooperative-activite-emploi-dordogne') === -1);
});

test('mtDomaineDuRayon : la création d\'activité a son propre domaine', () => {
  assert.equal(L.mtDomaineDuRayon('creer'), 'creer');
});

const HISTORIQUE_FRANCAIS = ['ofii-nouvelle-aquitaine', 'centres-sociaux-dordogne', 'cd24-service-social', 'france-travail-formation-francais', 'region-nouvelle-aquitaine-savoirs-de-base', 'etablissements-scolaires-oepre', 'cimade-perigueux', 'asso-ligue-de-l-enseignement-24'];

test('migration du rayon francais : les 8 structures déplacées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'francais');
  HISTORIQUE_FRANCAIS.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon francais : ne garde que l\'annuaire des centres d\'examen DELF ; le reste vit dans lieux.txt', () => {
  assert.deepEqual(idsDeCollecte('francais'), ['centres-examen-delf-dordogne'],
    'une structure du rayon francais a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
});

test('mtDomaineDuRayon : « Apprendre le français » est dans « Accueil et langue »', () => {
  assert.equal(L.mtDomaineDuRayon('francais'), 'accueil-langue');
});

const HISTORIQUE_ETRANGER = ['prefecture-dordogne-etrangers', 'enic-naric-france', 'cimade-nouvelle-aquitaine', 'spada-dordogne', 'asso-france-terre-d-asile-24', 'ofii-nouvelle-aquitaine'];

test('migration du rayon etranger : les 5 structures déplacées et l\'OFII fusionné sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'etranger');
  HISTORIQUE_ETRANGER.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon etranger : ne garde que les services en ligne (ANEF, ANTS) et les points-justice (déjà migrés, texte propre « droit des étrangers ») ; l\'OFII de Bordeaux est fusionné', () => {
  assert.deepEqual(idsDeCollecte('etranger'), ['anef-etrangers', 'ants-permis', 'cdad-dordogne-points-justice'],
    'une structure du rayon etranger a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
  assert.ok(lire('modules/comprendre-le-cadre/liens-verifies.txt').indexOf('ofii-direction-territoriale-bordeaux') === -1);
});

test('mtDomaineDuRayon : « Venir de l\'étranger » est dans « Accueil et langue »', () => {
  assert.equal(L.mtDomaineDuRayon('etranger'), 'accueil-langue');
});

const HISTORIQUE_EMPLOYEURS = ['urssaf-nouvelle-aquitaine', 'dreets-nouvelle-aquitaine-inspection-travail', 'france-travail-espace-employeur', 'cci-dordogne', 'chambre-metiers-artisanat-dordogne', 'medecine-du-travail-service-prevention-sante'];

test('migration du rayon employeurs : les 3 structures déplacées et les 3 fiches fusionnées sont dans le répertoire, avec adresse et date', () => {
  const nouveaux = L.mtLieuxDuRayon(lieuxReels.lignes, 'employeurs');
  HISTORIQUE_EMPLOYEURS.forEach((id) => {
    const n = nouveaux.filter((x) => x.id === id)[0];
    assert.ok(n, 'structure perdue : ' + id);
    assert.ok(n.site && n.date, id + ' : adresse et date');
  });
});

test('collecte du rayon employeurs : ne garde plus aucune structure ; la CCI, la chambre de métiers et le SPST de la Dordogne sont fusionnés', () => {
  assert.deepEqual(idsDeCollecte('employeurs'), [],
    'une structure du rayon employeurs a été ajoutée à la collecte : la mettre dans modules/mon-territoire/contenu/lieux.txt');
  assert.ok(lire('modules/comprendre-le-cadre/liens-verifies.txt').indexOf('spst-19-24-perigueux') === -1);
});

test('mtDomaineDuRayon : « Appui aux employeurs » a son domaine ; les 17 rayons de Comprendre le cadre sont tous migrés', () => {
  assert.equal(L.mtDomaineDuRayon('employeurs'), 'appui-employeurs');
  assert.deepEqual(L.MT_RAYONS.filter((r) => L.MT_RAYONS_MIGRES.indexOf(r) === -1), []);
  L.MT_RAYONS.forEach((r) => assert.ok(L.mtDomaineDuRayon(r), 'rayon sans domaine : ' + r));
});

const HISTORIQUE_HAUTE_VIENNE = ['asso-varlin-pont-neuf', 'asso-aleas-87', 'asso-unafam-87', 'asso-reseau-alliage-87', 'asso-udaf-87', 'asso-restos-du-coeur-87', 'asso-banque-alimentaire-87', 'asso-lire-87', 'asso-apf-87', 'asso-mission-locale-rurale-87', 'asso-cidff-limousin', 'asso-arsl-87', 'asso-soliha-limousin', 'asso-adil-87', 'asso-mobilim-87', 'cpam-haute-vienne', 'spsti-23-87-limoges'];

test('migration de la Haute-Vienne : les 17 structures locales sont dans le répertoire (portée 87), avec adresse https et date', () => {
  HISTORIQUE_HAUTE_VIENNE.forEach((id) => {
    const l = lieuxReels.lignes.filter((x) => x.id === id)[0];
    assert.ok(l, 'structure perdue : ' + id);
    assert.equal(l.portee, '87', id);
    assert.ok(/^https:\/\//.test(l.site) && l.date, id + ' : adresse https et date');
  });
});

test('Haute-Vienne : aucune structure de portée 87 ne reste dans les collectes ni dans le registre des adresses (une seule source de vérité)', () => {
  const registre = lire('modules/comprendre-le-cadre/liens-verifies.txt');
  HISTORIQUE_HAUTE_VIENNE.forEach((id) => {
    assert.ok(!new RegExp('^' + id + ' \\| ', 'm').test(registre), id + ' encore dans le registre');
    L.MT_RAYONS.forEach((r) => assert.ok(idsDeCollecte(r).indexOf(id) === -1, id + ' encore dans la collecte ' + r));
  });
});

test('mtLieuxVisibles : une personne voit la France, la région et SON département, jamais un autre département', () => {
  const parc = (dep) => L.mtLieuxVisibles(lieuxReels.lignes, dep).map((x) => x.id);
  const en24 = parc('24'), en87 = parc('87');
  assert.ok(en24.indexOf('asso-udaf-87') === -1 && en87.indexOf('asso-udaf-87') !== -1);
  assert.ok(en87.indexOf('mdph-dordogne') === -1 && en24.indexOf('mdph-dordogne') !== -1);
  assert.ok(en24.indexOf('france-travail') !== -1 && en87.indexOf('france-travail') !== -1, 'le national est partout');
  assert.deepEqual(parc(null), en24, 'département non renseigné : traité comme la Dordogne');
  assert.deepEqual(parc('ailleurs'), en24);
  lieuxReels.lignes.forEach((l) => assert.ok(['national', 'region', '24', '87'].indexOf(l.portee) !== -1, l.id));
});

// ---------- les départements du module : une seule table, aucun nom écrit en dur dans l'interface ----------

test('MT_DEPARTEMENTS : Dordogne et Haute-Vienne ouverts, chacun avec ses formes grammaticales, son fichier de communes et son exemple', () => {
  assert.deepEqual(L.mtDepartementsOuverts().map((d) => d.code), ['24', '87']);
  assert.equal(L.mtDepartement('24').en, 'en Dordogne');
  assert.equal(L.mtDepartement('24').dans, 'dans la Dordogne');
  assert.equal(L.mtDepartement('87').en, 'dans la Haute-Vienne', '« en Haute-Vienne » serait une faute');
  assert.equal(L.mtDepartement('87').le, 'la Haute-Vienne');
  Object.keys(L.MT_DEPARTEMENTS).forEach((k) => {
    const d = L.MT_DEPARTEMENTS[k];
    assert.ok(d.code === k && d.nom && d.le && d.en && d.dans && d.exemple && /^communes-\d+\.txt$/.test(d.communes), k);
    assert.ok(fs.existsSync(path.join(RACINE, 'modules/mon-territoire/contenu', d.communes)), 'fichier de communes absent : ' + d.communes);
    assert.ok(L.MT_PORTEES.indexOf(k) !== -1, 'la portée ' + k + ' doit exister');
  });
  assert.equal(L.mtDepartementOuvert('24'), true);
  assert.equal(L.mtDepartementOuvert('ailleurs'), false);
  assert.equal(L.mtDepartementOuvert(null), false);
  assert.equal(L.mtMajuscule(L.mtDepartement('24').dans), 'Dans la Dordogne');
});

test('phrase « territoire non couvert » : construite à partir de la table, nomme les départements ouverts, jamais une impasse', () => {
  assert.equal(L.mtNomsDesDepartementsOuverts(), 'la Dordogne et la Haute-Vienne');
  const p = L.mtPhraseTerritoireNonCouvert('ailleurs');
  assert.ok(/votre territoire/.test(p) && /la Dordogne et la Haute-Vienne/.test(p) && /petit à petit/.test(p), p);
});

test('ajouter un département = une ligne dans la table : la phrase et la visibilité suivent, sans toucher au code', () => {
  L.MT_DEPARTEMENTS['23'] = { code: '23', nom: 'Creuse', le: 'la Creuse', en: 'en Creuse', dans: 'dans la Creuse', exemple: 'Guéret ou 23000', communes: 'communes-24.txt', ouvert: false };
  try {
    // fermé : la personne de la Creuse voit son nom et où les listes existent
    assert.equal(L.mtDepartementOuvert('23'), false);
    assert.ok(/pour la Creuse\./.test(L.mtPhraseTerritoireNonCouvert('23')) && /la Dordogne et la Haute-Vienne/.test(L.mtPhraseTerritoireNonCouvert('23')));
    // ouvert : il rejoint la liste, trois noms bien assemblés
    L.MT_DEPARTEMENTS['23'].ouvert = true;
    assert.equal(L.mtNomsDesDepartementsOuverts(), 'la Creuse, la Dordogne et la Haute-Vienne', 'ordre alphabétique, pas un classement');
    assert.ok(L.mtLieuxVisibles([{ portee: '23' }, { portee: '24' }, { portee: 'national' }], '23').some((l) => l.portee === '23'));
    assert.ok(!L.mtLieuxVisibles([{ portee: '23' }, { portee: '24' }], '24').some((l) => l.portee === '23'));
  } finally { delete L.MT_DEPARTEMENTS['23']; }
  assert.equal(L.mtNomsDesDepartementsOuverts(), 'la Dordogne et la Haute-Vienne');
});

test('un département fermé : ses structures ne sont plus visibles et la personne retombe sur le territoire par défaut', () => {
  L.MT_DEPARTEMENTS['87'].ouvert = false;
  try {
    assert.equal(L.mtNomsDesDepartementsOuverts(), 'la Dordogne');
    assert.ok(!L.mtLieuxVisibles(lieuxReels.lignes, '87').some((l) => l.portee === '87'));
    assert.ok(/Elle existe pour la Dordogne, et/.test(L.mtPhraseTerritoireNonCouvert('87')));
  } finally { L.MT_DEPARTEMENTS['87'].ouvert = true; }
});

test('mtCommunesDuDepartement : chaque commune appartient à un seul département (le code INSEE commence par son numéro)', () => {
  const toutes = toutesCommunes;
  const en24 = L.mtCommunesDuDepartement(toutes, '24'), en87 = L.mtCommunesDuDepartement(toutes, '87');
  assert.equal(en24.length, 503);
  assert.equal(en87.length, 195);
  assert.equal(en24.length + en87.length, toutes.length);
  assert.ok(en87.some((c) => c.nom === 'Limoges') && !en24.some((c) => c.nom === 'Limoges'));
  assert.equal(L.mtTrouverCommune(en87, 'Limoges').statut, 'trouvee');
  assert.equal(L.mtTrouverCommune(en87, 'Bergerac').statut, 'inconnue', 'Bergerac n\'est pas en Haute-Vienne');
  assert.equal(L.mtTrouverCommune(en24, 'Limoges').statut, 'inconnue');
});

test('mtEmployeursDuDepartement : chaque liste ne garde que les employeurs du département, et pour une enseigne présente dans deux départements, que ses établissements de ce département', () => {
  const emp = L.mtParserEmployeurs(
    'a | enseigne | Enseigne A | commerce-vente | Bergerac:1 rue A ; Limoges:2 rue B | | | | non-indique | s | 2026-10-01\n' +
    'b | local | Local B | btp | Limoges:3 rue C | | | | non-indique | s | 2026-10-01\n' +
    'c | local | Local C | btp | Bergerac:4 rue D | | | | non-indique | s | 2026-10-01\n').lignes;
  const d24 = L.mtEmployeursDuDepartement(emp, toutesCommunes, '24'), d87 = L.mtEmployeursDuDepartement(emp, toutesCommunes, '87');
  assert.deepEqual(d24.map((e) => e.id), ['a', 'c']);
  assert.deepEqual(d87.map((e) => e.id), ['a', 'b']);
  assert.deepEqual(d24[0].etablissementsListe.map((x) => x.commune), ['Bergerac']);
  assert.deepEqual(d87[0].etablissementsListe.map((x) => x.commune), ['Limoges']);
  assert.equal(emp[0].etablissementsListe.length, 2, 'l\'original n\'est pas modifié');
  assert.deepEqual(L.mtEmployeursDuDepartement(emp, toutesCommunes, '23'), []);
});

test('garde : l\'interface du module n\'écrit AUCUN nom ni numéro de département en dur (tout vient de la table MT_DEPARTEMENTS)', () => {
  const ui = lire('modules/mon-territoire/index.js');
  assert.ok(!/Dordogne|Haute-Vienne|Haute Vienne/.test(ui), 'un nom de département est écrit dans modules/mon-territoire/index.js : utiliser _mtDepInfo()');
  assert.ok(!/['"](24|87)['"]/.test(ui), 'un numéro de département est écrit dans modules/mon-territoire/index.js : utiliser _mtDepInfo().code');
  assert.ok(!/Dordogne|Haute-Vienne/.test(lire('data/metiers.js').split('function pageIntroMonTerritoire')[1].split('\nfunction ')[0]), 'la présentation du module ne nomme aucun département');
});

test('présentation « Employeurs près de chez moi » : message central, aucun département en dur, aucun tiret long, route et aide branchées', () => {
  const metiers = lire('data/metiers.js');
  const page = metiers.split('function pageIntroEmployeursTerritoire')[1].split('\nfunction ')[0];
  assert.ok(/Beaucoup d’emplois ne sont jamais annoncés/.test(page), 'le message central (emplois non annoncés) est dans la présentation');
  assert.ok(/candidature spontanée/.test(page), 'la candidature spontanée est expliquée');
  assert.ok(/ne recopie <strong>pas les offres d’emploi/.test(page), 'la présentation dit qu\'aucune offre n\'est recopiée');
  assert.ok(/Employeurs qui publient leurs offres/.test(page), 'la présentation renvoie vers la rubrique des pages d\'offres');
  assert.ok(!/Dordogne|Haute-Vienne/.test(page), 'la présentation ne nomme aucun département');
  assert.ok(!/[—–]/.test(page), 'aucun tiret long');
  assert.ok(!/\bIA\b/.test(page), 'jamais le mot IA');
  const app = lire('js/app.js');
  assert.ok(/'employeurs-intro': pageIntroEmployeursTerritoire/.test(app), 'la route employeurs-intro existe');
  assert.ok(/AIDE_PAGES\['employeurs-intro'\]/.test(app), 'la présentation des employeurs a son aide');
});

test('flèche « Précédent » : la brique d\'historique interne existe et le module l\'utilise à chaque changement d\'écran', () => {
  const app = lire('js/app.js');
  ['historiqueInterneBrancher', 'historiqueInterneEmpiler', 'historiqueInterneMarquer'].forEach((f) => assert.ok(new RegExp('function ' + f + '\\(').test(app), f + ' existe dans js/app.js'));
  assert.ok(/e\.state\.interne/.test(app), 'popstate restaure l\'état interne');
  const ui = lire('modules/mon-territoire/index.js');
  assert.ok(/historiqueInterneEmpiler\('mon-territoire'/.test(ui), 'le module empile une entrée à chaque écran');
  assert.ok(/historiqueInterneMarquer\('mon-territoire'/.test(ui), 'le module marque l\'entrée courante à chaque dessin');
  assert.ok(/function _mtInscrireHistorique/.test(ui) && /_mtInscrireHistorique\(\);/.test(ui), 'le module s\'inscrit au dessin de la page (js/app.js est chargé après lui)');
  assert.ok(!/^historiqueInterneBrancher/m.test(ui), 'jamais d\'inscription au chargement du fichier (échec silencieux)');
});

test('flèche « Précédent » : « Analyser ma candidature » branche la brique d\'historique à son dessin central, sans inscription au chargement', () => {
  const app = lire('js/app.js');
  assert.ok(/function historiqueInterneSynchroniser\(/.test(app), 'la brique sait suivre un module dont l\'écran se déduit de son état');
  const dessin = app.split('function pageBilanCandidature() {')[1].split('\nfunction ')[0];
  assert.ok(/_bilanSynchroniserHistorique\(diagnostic\);/.test(dessin), 'pageBilanCandidature() synchronise l\'historique à chaque dessin');
  assert.ok(/historiqueInterneBrancher\('bilan', _bilanRestaurerHistorique\)/.test(app), 'le module s\'inscrit auprès de la brique');
  const restaurer = app.split('function _bilanRestaurerHistorique(')[1].split('\nfunction ')[0];
  assert.ok(/return 'sauter'/.test(restaurer), 'un écran d\'avant le diagnostic reçu est dépassé');
  assert.ok(/bilanAbandonnerDiagnostic\(\)/.test(restaurer), 'un diagnostic en attente s\'abandonne comme avec « Retour »');
  assert.ok(!/reprisePendante\s*=/.test(restaurer), 'le choix « Continuer / Recommencer » ne revient jamais par la flèche du navigateur');
});

// ---------- zones, option C et phrase « selon votre commune » (D12) ----------

const bergerac = { code: '24037', nom: 'Bergerac', cle: 'bergerac', epci: '200070647' };
const perigueux = { code: '24322', nom: 'Périgueux', cle: 'perigueux', epci: '200040392' };

test('mtParserZone et mtZoneCouvre : vrai ou faux seulement si la zone et la commune sont connues, sinon null (jamais deviné)', () => {
  assert.deepEqual(L.mtParserZone('epci:200070647 ; commune:Sarlat-la-Canéda'), [{ genre: 'epci', valeur: '200070647' }, { genre: 'commune', valeur: 'Sarlat-la-Canéda' }]);
  assert.deepEqual(L.mtParserZone(''), []);
  assert.strictEqual(L.mtZoneCouvre('epci:200070647 ; epci:200040889', bergerac), true);
  assert.strictEqual(L.mtZoneCouvre('epci:200070647', perigueux), false);
  assert.strictEqual(L.mtZoneCouvre('commune:Périgueux', perigueux), true);
  assert.strictEqual(L.mtZoneCouvre('', bergerac), null, 'zone pas relevée');
  assert.strictEqual(L.mtZoneCouvre('epci:200070647', null), null, 'commune pas indiquée');
});

test('le PLIE du Bergeracois couvre Bergerac et pas Périgueux (zone relevée sur la page officielle)', () => {
  const plie = lieuxReels.lignes.filter((x) => x.id === 'plie-bergeracois')[0];
  assert.strictEqual(L.mtZoneCouvre(plie.zone, bergerac), true);
  assert.strictEqual(L.mtZoneCouvre(plie.zone, perigueux), false);
});

test('mtOrdonnerParCommune et mtNotesSelonCommune : le guichet qui couvre la commune passe en premier ; sans zone connue, une phrase honnête', () => {
  const st = (id, type, couvre, portee) => ({ id, type, couvre, portee: portee || '24' });
  const sansZone = [st('ml-a', 'mission-locale', null), st('ml-b', 'mission-locale', null), st('ml-c', 'mission-locale', null)];
  assert.deepEqual(L.mtOrdonnerParCommune(sansZone).map((x) => x.id), ['ml-a', 'ml-b', 'ml-c'], 'sans zone, l\'ordre ne change pas');
  const notes = L.mtNotesSelonCommune(sansZone);
  assert.strictEqual(notes.length, 1);
  assert.match(notes[0], /dépend de votre commune de résidence/);
  const avecZone = [st('ml-a', 'mission-locale', false), st('ml-b', 'mission-locale', true), st('ml-c', 'mission-locale', null)];
  assert.deepEqual(L.mtOrdonnerParCommune(avecZone).map((x) => x.id), ['ml-b', 'ml-a', 'ml-c'], 'celle qui couvre la commune d\'abord, aucune retirée');
  assert.deepEqual(L.mtNotesSelonCommune(avecZone), [], 'une structure reconnue : plus de phrase');
  assert.deepEqual(L.mtNotesSelonCommune([st('ml-a', 'mission-locale', null)]), [], 'un seul guichet : rien à dire');
  assert.deepEqual(L.mtNotesSelonCommune([st('n1', 'mission-locale', null, 'national'), st('n2', 'mission-locale', null, 'national')]), [], 'le national ne dépend pas de la commune');
  assert.deepEqual(L.mtNotesSelonCommune([st('x', 'ccas', null), st('y', 'ccas', null)]), [], 'seuls les types qui dépendent de la commune sont concernés');
});

test('mtVerifierLieux : zone mal écrite, intercommunalité ou commune inconnue refusées', () => {
  const base = 'x1 | plie | Un PLIE | une phrase | | ZONE | | | 24 | accompagnement | Source |';
  const refuse = (zone, morceau) => { const e = L.mtVerifierLieux(base.replace('ZONE', zone), ctx2); assert.ok(e.some((m) => m.indexOf(morceau) !== -1), JSON.stringify(e)); };
  const ctx2 = Object.assign({}, ctx, { epci: toutesCommunes.map((c) => c.epci).filter((v, i, a) => a.indexOf(v) === i) });
  assert.deepEqual(L.mtVerifierLieux(base.replace('ZONE', 'epci:200070647 ; commune:Bergerac'), ctx2), []);
  refuse('epci:999', 'intercommunalité inconnue');
  refuse('commune:Nulleville', 'commune inconnue');
  refuse('Bergerac', 'zone mal écrite');
});

test('mtLieuEnStructure : lien cliquable seulement si daté de moins de 12 mois ; mtLieuxDuRayon en ordre alphabétique', () => {
  const l = lieux.lignes.filter((x) => x.id === 'siao-dordogne')[0];
  assert.deepEqual([L.mtLieuEnStructure(l, '2026-10-12').verifie, L.mtLieuEnStructure(l, '2026-10-12').url], [true, l.site]);
  assert.deepEqual([L.mtLieuEnStructure(l, '2028-01-01').verifie, L.mtLieuEnStructure(l, '2028-01-01').url], [false, '']);
  const noms = L.mtLieuxDuRayon(lieux.lignes, 'logement').map((x) => x.nom);
  assert.deepEqual(noms, noms.slice().sort((a, b) => a.localeCompare(b, 'fr')));
  assert.equal(L.mtRayonMigre('logement'), true);
  assert.equal(L.mtRayonMigre('mobilite'), true);
  assert.equal(L.mtRayonMigre('rayon-inexistant'), false);
});

test('mtRechercherLieux : les mots des freins sensibles (violences, addiction) ne renvoient aucune structure, même si le mot figure dans une description ; un mot ordinaire reste trouvé', () => {
  ['violences', 'violence', 'addiction', 'alcool', 'drogue'].forEach((mot) => assert.deepEqual(L.mtRechercherLieux(lieuxReels.lignes, mot, FREINS_REPERTOIRE), [], mot));
  assert.ok(L.mtRequeteSensible(FREINS_REPERTOIRE, 'violences conjugales'));
  assert.ok(!L.mtRequeteSensible(FREINS_REPERTOIRE, 'logement'));
  assert.ok(!L.mtRequeteSensible(FREINS_REPERTOIRE, 'ccas'));
  assert.ok(L.mtRechercherLieux(lieuxReels.lignes, 'cpam', FREINS_REPERTOIRE).length >= 1);
});

test('mtRechercherLieux : par nom, description ou type ; Action Logement trouvé par Loca-Pass et Visale', () => {
  assert.ok(L.mtRechercherLieux(lieux.lignes, 'loca-pass').some((x) => x.id === 'action-logement-nouvelle-aquitaine'));
  assert.ok(L.mtRechercherLieux(lieux.lignes, 'visale').some((x) => x.id === 'action-logement-nouvelle-aquitaine'));
  assert.ok(L.mtRechercherLieux(lieux.lignes, '115').length >= 1);
  assert.deepEqual(L.mtRechercherLieux(lieux.lignes, 'a'), []);
});

// ---------- freins, types et fiches du Lexique (phase 3bis) ----------

const { FREINS_REPERTOIRE } = require('../data/freins.js');

test('mtFreinsCorrespondants : les mots qu\'on tape vraiment trouvent le frein ; jamais un frein sensible', () => {
  const codes = (q) => L.mtFreinsCorrespondants(FREINS_REPERTOIRE, q).map((f) => f.code);
  assert.ok(codes('pas de voiture').indexOf('mobilite') !== -1);
  assert.ok(codes('logement').indexOf('hebergement') !== -1);
  assert.ok(codes('expulsion').indexOf('hebergement') !== -1);
  assert.deepEqual(codes('a'), []);
  // violences et addiction sont « sensibles » : jamais proposés par cette recherche, même avec leurs propres mots
  assert.equal(FREINS_REPERTOIRE.violences.sensible, true);
  assert.equal(FREINS_REPERTOIRE.addiction.sensible, true);
  ['violences', 'addiction', 'frappe', 'alcool', 'drogue'].forEach((mot) => {
    assert.ok(codes(mot).indexOf('violences') === -1 && codes(mot).indexOf('addiction') === -1, mot);
  });
});

test('mtLieuxPourFrein : par type OU par rayon, en ordre alphabétique ; rien pour un frein sensible', () => {
  const heb = L.mtLieuxPourFrein(lieux.lignes, FREINS_REPERTOIRE.hebergement);
  assert.ok(heb.length >= 8);
  assert.ok(heb.some((l) => l.id === 'siao-dordogne') && heb.some((l) => l.id === 'conseil-departemental-dordogne-fsl'), 'le rayon logement apporte aussi les aides (FSL, DALO)');
  const noms = heb.map((l) => l.nom);
  assert.deepEqual(noms, noms.slice().sort((a, b) => a.localeCompare(b, 'fr')));
  assert.deepEqual(L.mtLieuxPourFrein(lieux.lignes, FREINS_REPERTOIRE.violences), []);
  assert.deepEqual(L.mtLieuxPourFrein(lieux.lignes, FREINS_REPERTOIRE.addiction), []);
  assert.deepEqual(L.mtLieuxPourFrein(lieux.lignes, null), []);
  assert.deepEqual(L.mtLieuxPourFrein(lieux.lignes, FREINS_REPERTOIRE.mobilite), [], 'pas encore de structure de mobilité dans le répertoire : rien, jamais un bloc vide');
});

test('mtFreinParTitre, mtTypeDeFicheLexique, mtLieuxDuType', () => {
  assert.equal(L.mtFreinParTitre(FREINS_REPERTOIRE, FREINS_REPERTOIRE.hebergement.titre).code, 'hebergement');
  assert.equal(L.mtFreinParTitre(FREINS_REPERTOIRE, 'titre inconnu'), null);
  assert.equal(L.mtTypeDeFicheLexique('caf'), 'caf');
  assert.equal(L.mtTypeDeFicheLexique('iae'), 'siae');
  assert.equal(L.mtTypeDeFicheLexique('une-fiche-quelconque'), '');
  assert.ok(L.mtLieuxDuType(lieux.lignes, 'caf').some((l) => l.id === 'caf-dordogne-logement'));
  assert.deepEqual(L.mtLieuxDuType(lieux.lignes, 'plie'), []);
});

test('freins : chaque frein a ses types (identifiants du répertoire) et ses rayons (rayons de Comprendre le cadre)', () => {
  const codes = Object.keys(FREINS_REPERTOIRE);
  assert.equal(codes.length, 17);
  codes.forEach((c) => {
    const f = FREINS_REPERTOIRE[c];
    assert.ok(Array.isArray(f.types) && f.types.length >= 1, c + ' : types');
    f.types.forEach((t) => assert.ok(L.MT_TYPES[t], c + ' : type inconnu ' + t));
    assert.ok(Array.isArray(f.rayons), c + ' : rayons');
    f.rayons.forEach((r) => assert.ok(L.MT_RAYONS.indexOf(r) !== -1, c + ' : rayon inconnu ' + r));
  });
});

// ---------- rubrique « Employeurs qui publient leurs offres » (contenu/offres.txt) ----------

const texteOffres = lire('modules/mon-territoire/contenu/offres.txt');
const offresReelles = L.mtParserOffres(texteOffres).lignes;
const idsFiches = L.mtParserEmployeurs(texteEmployeurs).lignes.map((e) => e.id);
const ctxOffres = Object.assign({}, ctxReel, { employeurs: idsFiches });
const ligneOffre = 'x1 | employeur | Exemple | commerce-vente | 24 | https://exemple.fr/offres | | Site de l\'employeur | 2026-10-12 | |';
const refusOffre = (texte, morceau) => {
  const e = L.mtVerifierOffres(texte, ctx);
  assert.ok(e.some((m) => m.indexOf(morceau) !== -1), 'attendu « ' + morceau + ' », obtenu : ' + JSON.stringify(e));
};

test('contenu/offres.txt : aucune erreur, aucune ligne mal écrite', () => {
  assert.deepEqual(L.mtVerifierOffres(texteOffres, ctxOffres), []);
  assert.ok(offresReelles.length >= 20);
  assert.ok(!/[–—]/.test(texteOffres));
});

test('mtVerifierOffres : une ligne correcte passe, les lignes mal écrites sont refusées', () => {
  assert.deepEqual(L.mtVerifierOffres(ligneOffre, ctx), []);
  refusOffre(ligneOffre.replace('| 2026-10-12 |', '| |'), 'sans date de vérification');
  refusOffre(ligneOffre.replace('| 2026-10-12 |', '| 2027-01-01 |'), 'futur');
  refusOffre(ligneOffre.replace('employeur |', 'autre |'), 'famille inconnue');
  refusOffre(ligneOffre.replace('commerce-vente', 'inconnu'), 'secteur inconnu');
  refusOffre(ligneOffre.replace('| 24 |', '| 99 |'), 'territoire inconnu');
  refusOffre(ligneOffre.replace('https://exemple.fr', 'http://exemple.fr'), 'https');
  refusOffre(ligneOffre.replace('https://exemple.fr/offres', 'https://fr.indeed.com/emplois'), 'intermédiaire');
  refusOffre(ligneOffre.replace('https://exemple.fr/offres', 'https://www.hellowork.com/fr-fr/emploi/x.html'), 'intermédiaire');
  refusOffre(ligneOffre.replace('| Exemple |', '| Madame Dupont |'), 'personne');
  refusOffre(ligneOffre.replace('Exemple', 'Exemple — test'), 'tiret long');
  refusOffre(ligneOffre + '\n' + ligneOffre, 'identifiant en double');
  refusOffre('x1 | employeur | Exemple', 'colonnes');
  const e = L.mtVerifierOffres(ligneOffre.replace('| | Site', '| inconnu | Site'), { secteurs: ctx.secteurs, aujourdhui: ctx.aujourdhui, employeurs: ['lidl'] });
  assert.ok(e.some((m) => m.indexOf('fiche d’employeur inconnue') !== -1));
});

test('mtFraicheurOffre : récente moins de 6 mois, à revérifier de 6 à 12 mois, masquée au-delà, sans date ou future', () => {
  assert.equal(L.mtFraicheurOffre('2026-10-17', '2026-10-17'), 'recente');
  assert.equal(L.mtFraicheurOffre('2026-10-17', '2027-04-16'), 'recente');
  assert.equal(L.mtFraicheurOffre('2026-10-17', '2027-04-17'), 'a-reverifier');
  assert.equal(L.mtFraicheurOffre('2026-10-17', '2027-10-16'), 'a-reverifier');
  assert.equal(L.mtFraicheurOffre('2026-10-17', '2027-10-17'), 'masquee');
  assert.equal(L.mtFraicheurOffre('', '2026-10-17'), 'masquee');
  assert.equal(L.mtFraicheurOffre('2026-12-01', '2026-10-17'), 'masquee');
});

test('mtGroupeOffre : quatre groupes d\'après la famille (privé local, grands employeurs, fonction publique, groupements et chambres)', () => {
  assert.equal(L.mtGroupeOffre({ famille: 'employeur', territoire: '24' }), 'pres');
  assert.equal(L.mtGroupeOffre({ famille: 'employeur', territoire: '87' }), 'pres');
  assert.equal(L.mtGroupeOffre({ famille: 'employeur', territoire: 'national' }), 'grands');
  assert.equal(L.mtGroupeOffre({ famille: 'employeur', territoire: 'region' }), 'grands');
  assert.equal(L.mtGroupeOffre({ famille: 'portail-officiel', territoire: '24' }), 'public');
  assert.equal(L.mtGroupeOffre({ famille: 'portail-officiel', territoire: 'national' }), 'public');
  assert.equal(L.mtGroupeOffre({ famille: 'groupement', territoire: '87' }), 'groupements');
  assert.equal(L.mtGroupeOffre({ famille: 'federation', territoire: '87' }), 'groupements');
  assert.deepEqual(L.MT_GROUPES_OFFRES, ['pres', 'grands', 'public', 'groupements']);
});

test('mtOffresParGroupe : un employeur dans un seul groupe, ordre alphabétique, département, secteur, pages anciennes masquées', () => {
  const o = L.mtParserOffres([
    'b-local | employeur | Bravo local | sante | 24 | https://b.fr/o | | s | 2026-10-12 | |',
    'a-local | employeur | Alpha local | sante | 24 | https://a.fr/o | | s | 2026-10-12 | |',
    'autre-dep | employeur | Hors zone | sante | 87 | https://h.fr/o | | s | 2026-10-12 | |',
    'grand | employeur | Grand | commerce-vente | national | https://g.fr/o | | s | 2026-10-12 | |',
    'mairie | portail-officiel | Mairie | administration | 24 | https://m.fr/o | | s | 2026-10-12 | |',
    'etat | portail-officiel | État | administration | national | https://e.fr/o | | s | 2026-10-12 | |',
    'gp | groupement | GEIQ | btp | 24 | https://geiq.fr/o | | s | 2026-10-12 | |',
    'vieux | employeur | Vieux | sante | 24 | https://v.fr/o | | s | 2024-01-01 | |'
  ].join('\n')).lignes;
  const g = L.mtOffresParGroupe(o, '24', '2026-10-17');
  assert.deepEqual(g.pres.map((x) => x.nom), ['Alpha local', 'Bravo local']);
  assert.deepEqual(g.grands.map((x) => x.nom), ['Grand']);
  assert.deepEqual(g.public.map((x) => x.nom), ['État', 'Mairie']);
  assert.deepEqual(g.groupements.map((x) => x.nom), ['GEIQ']);
  const tous = [].concat(g.pres, g.grands, g.public, g.groupements);
  assert.equal(new Set(tous.map((x) => x.id)).size, tous.length);
  assert.ok(!tous.some((x) => x.id === 'autre-dep' || x.id === 'vieux'));
  assert.deepEqual(L.mtOffresParGroupe(o, '24', '2026-10-17', 'sante').pres.map((x) => x.nom), ['Alpha local', 'Bravo local']);
  assert.equal(L.mtOffresParGroupe(o, '24', '2026-10-17', 'sante').grands.length, 0);
  assert.deepEqual(L.mtOffresParGroupe(o, '87', '2026-10-17').pres.map((x) => x.nom), ['Hors zone']);
});

test('mtOffreDeLEmployeur : le bouton « Ses offres publiées » n\'existe que si la page est datée et récente', () => {
  const o = L.mtParserOffres('l | employeur | Lidl | commerce-vente | national | https://emplois.lidl.fr/ | lidl | s | 2026-10-12 | |').lignes;
  assert.equal(L.mtOffreDeLEmployeur(o, 'lidl', '2026-10-17').page, 'https://emplois.lidl.fr/');
  assert.equal(L.mtOffreDeLEmployeur(o, 'aldi', '2026-10-17'), null);
  assert.equal(L.mtOffreDeLEmployeur(o, 'lidl', '2028-01-01'), null);
});

test('une seule source : une fiche d\'employeur dont la page est dans offres.txt ne garde pas une autre adresse dans sa colonne « page de recrutement »', () => {
  L.mtParserEmployeurs(texteEmployeurs).lignes.forEach((e) => {
    const o = offresReelles.filter((x) => x.employeur === e.id)[0];
    if (e.recrutement && o) { assert.equal(e.recrutement, o.page, e.id); }
  });
});

test('mtRechercherOffres : « offres » ou « recrutement » propose la rubrique, le nom d\'un employeur de la liste aussi, jamais une page masquée ni d\'un autre département', () => {
  const o = L.mtParserOffres([
    'sec | employeur | Securitas France | securite | national | https://carrieres.securitas.fr/ | | s | 2026-10-12 | |',
    'cdef | employeur | Centre de l\'enfance | social-personne | 87 | https://c.fr/o | | s | 2026-10-12 | |',
    'vieux | employeur | Securitas ancien | securite | 24 | https://v.fr/o | | s | 2024-01-01 | |'
  ].join('\n')).lignes;
  const r = L.mtRechercherOffres(o, '24', '2026-10-17', 'offres d\'emploi');
  assert.equal(r.motCle, true);
  assert.equal(L.mtRechercherOffres(o, '24', '2026-10-17', 'Recrutement').motCle, true);
  assert.equal(L.mtRechercherOffres(o, '24', '2026-10-17', 'caissier').motCle, false);
  assert.deepEqual(L.mtRechercherOffres(o, '24', '2026-10-17', 'securitas').pages.map((x) => x.id), ['sec']);
  assert.deepEqual(L.mtRechercherOffres(o, '24', '2026-10-17', 'enfance').pages, []);
  assert.deepEqual(L.mtRechercherOffres(o, '87', '2026-10-17', 'enfance').pages.map((x) => x.id), ['cdef']);
  assert.deepEqual(L.mtRechercherOffres(o, '24', '2026-10-17', 'se'), { motCle: false, pages: [] });
});

test('nature « interim » : une agence d\'intérim n\'a pas de secteur ; les autres natures en gardent un', () => {
  const agence = 'adecco-bergerac-24 | interim | Adecco Bergerac | | Bergerac:109 Rue Neuve d\'Argenson | 05 53 57 79 99 | https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/bergerac/ADFR_144 | | non-indique | Source | 2026-10-10';
  assert.deepEqual(L.mtVerifierEmployeurs(agence, ctx), []);
  refus(agence.replace('| interim |', '| local |'), 'secteur inconnu');
  refus(agence.replace('| interim |', '| autre |'), 'nature inconnue');
  assert.deepEqual(L.mtVerifierEmployeurs(agence.replace('| Adecco Bergerac | |', '| Adecco Bergerac | commerce-vente |'), ctx), []);
});

test('liens de l\'écran Insertion : une seule source (registre des adresses), datés, jamais écrits en dur dans le module', () => {
  const registre = lire('modules/comprendre-le-cadre/liens-verifies.txt');
  const liens = L.mtLiensDepuisRegistre(registre);
  ['siae-annuaire-inae', 'siae-plateforme-inclusion', 'siae-aide-pass-iae', 'siae-francetravail-iae'].forEach((nom) => {
    assert.ok(liens[nom] && /^https:\/\//.test(liens[nom].adresse) && /^\d{4}-\d{2}-\d{2}$/.test(liens[nom].date), nom);
  });
  const ui = lire('modules/mon-territoire/index.js');
  assert.ok(!/inae-nouvelleaquitaine\.org|plateforme\.inclusion\.gouv\.fr|aide\.emplois\.inclusion|insertion-par-lactivite/.test(ui), 'une adresse de l\'écran Insertion est écrite dans le code au lieu du registre');
  ['siae-annuaire-inae', 'siae-plateforme-inclusion', 'siae-aide-pass-iae', 'siae-francetravail-iae'].forEach((nom) => assert.ok(ui.indexOf("'" + nom + "'") !== -1, nom + ' est utilisé par l\'écran'));
  const l = L.mtLiensDepuisRegistre('# commentaire\nun | https://exemple.fr/ | 2026-10-17 | national\nmauvais | http://exemple.fr/ | 2026-10-17 | national\n');
  assert.deepEqual(Object.keys(l), ['un']);
  assert.equal(L.mtLienAffichable(l, 'un', '2026-12-01'), 'https://exemple.fr/');
  assert.equal(L.mtLienAffichable(l, 'un', '2027-11-01'), '', 'plus de 12 mois : plus de lien');
  assert.equal(L.mtLienAffichable(l, 'absent', '2026-12-01'), '');
  assert.equal(L.mtLienAffichable({ un: { adresse: 'https://exemple.fr/', date: '' } }, 'un', '2026-12-01'), '', 'sans date : pas de lien');
});

test('numéros de téléphone : 10 chiffres ou numéro court national (15, 115, 3919, 116 006), jamais un numéro inventé', () => {
  const bon = ['05 53 00 00 00', '+33 5 53 00 00 00', '116 606', '3919', '115', '15', '112', '3949'];
  bon.forEach((t) => assert.ok(L.mtTelephoneValide(t), t));
  ['12', '1234', '06 12', '116606', '0553', 'abc'].forEach((t) => assert.ok(!L.mtTelephoneValide(t), t));
  assert.equal(L.mtFormaterTelephone('116606'), '116 606');
  assert.equal(L.mtFormaterTelephone('+33 5 53 00 00 00'), '05 53 00 00 00');
  assert.equal(L.mtFormaterTelephone('0033553000000'), '05 53 00 00 00');
  assert.equal(L.mtFormaterTelephone('3919'), '3919');
  assert.equal(L.mtFormaterTelephone('1234'), null);
  const ligne = 'france-victimes | acces-au-droit | France Victimes | aide aux victimes | | | 116 006 | https://www.france-victimes.fr/ | national | juridique | Site officiel | 2026-10-10';
  assert.deepEqual(L.mtVerifierLieux(ligne, ctx), []);
  refus('x1 | enseigne | Exemple | commerce-vente | Bergerac:1 rue A | 1234 | | | non-indique | Sirene | 2026-10-10', 'téléphone mal écrit');
});

// ---------- numéro de téléphone PAR MAGASIN (2026-10-18) : « Commune:adresse:05 53 00 00 00 » ----------
test('mtParserEtablissements : un numéro facultatif à la fin de chaque magasin ; une adresse sans numéro ou avec « : » reste intacte', () => {
  const l = L.mtParserEtablissements('Boulazac Isle Manoire:12 Avenue Marcel Paul:05 53 05 62 50 ; Montignac-Lascaux:64 ZA des Sechoirs ; Bergerac:: 05 53 00 00 00 ; Perigueux ; Creysse:Rue A : etage 2');
  assert.deepEqual(l, [
    { commune: 'Boulazac Isle Manoire', adresse: '12 Avenue Marcel Paul', telephone: '05 53 05 62 50' },
    { commune: 'Montignac-Lascaux', adresse: '64 ZA des Sechoirs', telephone: '' },
    { commune: 'Bergerac', adresse: '', telephone: '05 53 00 00 00' },
    { commune: 'Perigueux', adresse: '', telephone: '' },
    { commune: 'Creysse', adresse: 'Rue A : etage 2', telephone: '' }
  ]);
});
test('mtEtablissementsEnTexte : relit ce que mtParserEtablissements a lu (les fiches sans numéro ne changent pas)', () => {
  ['Bergerac:14 rue Durou ; Creysse:154 avenue de la Roque', 'Boulazac:12 Avenue:05 53 05 62 50 ; Montignac:64 ZA'].forEach((t) => {
    assert.equal(L.mtEtablissementsEnTexte(L.mtParserEtablissements(t)), t);
  });
});
test('mtVerifierEmployeurs : un numéro de magasin mal écrit est refusé ; un numéro de magasin exige une date de vérification', () => {
  const avecTel = 'x1 | enseigne | Exemple | commerce-vente | Bergerac:1 rue A:05 53 05 62 50 ; Creysse:2 rue B | | | | non-indique | Sirene |';
  refus(avecTel, 'téléphone, site ou page de recrutement sans date');
  assert.deepEqual(L.mtVerifierEmployeurs(avecTel + ' 2026-10-10', ctx), []);
  refus(avecTel.replace('05 53 05 62 50', '05 53 05') + ' 2026-10-10', 'téléphone mal écrit pour le magasin de Bergerac');
  assert.deepEqual(L.mtVerifierEmployeurs(avecTel.replace('05 53 05 62 50', '+33 5 53 05 62 50') + ' 2026-10-10', ctx), []);
});
