'use strict';
// « Les adresses de l'application » (consigne 92) : rassembler les adresses citées, les ouvrir (faux réseau), garder le résultat, « gardées telles quelles »,
// « à corriger », rappel mensuel, garde-fous. Aucun accès à Internet, dépôt temporaire.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { creerAdresses, rassembler, FAMILLES } = require('../outils/veilleAdresses.js');

const TIRETS = new RegExp('[' + String.fromCharCode(0x2013) + String.fromCharCode(0x2014) + ']');

function ecrire(racine, rel, texte) { const p = path.join(racine, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotTemporaire() {
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), 'adresses-'));
  ecrire(racine, 'modules/comprendre-le-cadre/liens-verifies.txt', [
    '# registre', 'caf-aides | https://www.caf.fr/aides | 2026-10-01 | national', 'ancien-site | https://www.disparu.fr/page | | national', 'sans-usage | https://www.orphelin.fr/ | | 24', ''
  ].join('\n'));
  ecrire(racine, 'modules/comprendre-le-cadre/contenu/aides/aides-logement.md', '---\nid: aides-logement\ntitre: "Les aides"\nsources:\n  - caf-aides\n  - ancien-site\n---\nTexte\n');
  ecrire(racine, 'data/indexFichesCadre.js', 'var INDEX_FICHES_CADRE = [\n{"id":"aides-logement","rayon":"aides","titre":"Les aides au logement"}\n];\n');
  ecrire(racine, 'data/lexique.js', [
    'var LEXIQUE = [', '  {', "    id: 'cdd', titre: 'CDD', type: 'terme',", '    detailsAJour: {', "      source: { nom: 'Service-Public', url: 'https://www.service-public.gouv.fr/F1' },", '    },', '  },',
    "  // https://www.commentaire.fr/ne-compte-pas", ']', ''].join('\n'));
  ecrire(racine, 'data/freins.js', "var F = [\n  { libelle: 'Banque alimentaire', url: 'https://www.banquealimentaire.org', motsCles: [] },\n  { libelle: 'Lien http', url: 'http://www.ancien-http.fr/page' }\n];\n");
  return racine;
}
function reseau(table) {
  const appels = [];
  const f = function (url) {
    appels.push(String(url));
    const r = table[String(url)];
    if (r instanceof Error) { return Promise.reject(r); }
    return Promise.resolve(new Response('', { status: r === undefined ? 200 : r }));
  };
  f.appels = appels;
  return f;
}

test('rassembler : les adresses de chaque famille, chacune avec OÙ elle est utilisée ; les commentaires du code sont ignorés', () => {
  const racine = depotTemporaire();
  const t = rassembler(racine);
  assert.ok(t['https://www.caf.fr/aides'] && /Les aides au logement/.test(t['https://www.caf.fr/aides'][0].ou), 'fiche citée par son titre');
  assert.ok(/aucune fiche/.test(t['https://www.orphelin.fr/'][0].ou), 'adresse du registre sans fiche : dit clairement');
  assert.ok(t['https://www.service-public.gouv.fr/F1'][0].ou.indexOf('« CDD »') !== -1, 'le Lexique nomme le MOT');
  assert.ok(/Répertoire des freins/.test(t['https://www.banquealimentaire.org'][0].ou));
  assert.strictEqual(t['https://www.commentaire.fr/ne-compte-pas'], undefined, 'un commentaire n\'est vu de personne');
  ecrire(racine, 'data/lexique.js', fs.readFileSync(path.join(racine, 'data/lexique.js'), 'utf8').replace(']\n', "  {\n    id: 'second-niveau-mam',\n    titre: 'Nuance utile',\n    suivi: {\n      source: { nom: 'Monenfant', url: 'https://monenfant.fr/mam' }\n    }\n  },\n]\n"));
  assert.ok(rassembler(racine)['https://monenfant.fr/mam'][0].ou.indexOf('En savoir plus : mam') !== -1, 'un second niveau nomme son mot, pas « Nuance utile »');
  assert.deepStrictEqual(t['https://www.caf.fr/aides'][0].nom, 'caf-aides', 'le nom du registre est gardé pour ouvrir la fenêtre de correction');
  const seulementLexique = rassembler(racine, ['lexique']);
  assert.deepStrictEqual(Object.keys(seulementLexique), ['https://www.service-public.gouv.fr/F1', 'https://monenfant.fr/mam']);
});

test('rassembler : fonctionne sur le dépôt réel et trouve les quatre familles', () => {
  const racine = path.resolve(__dirname, '..');
  const t = rassembler(racine), vues = {};
  Object.keys(t).forEach((u) => t[u].forEach((x) => { vues[x.famille] = (vues[x.famille] || 0) + 1; }));
  FAMILLES.forEach((f) => assert.ok(vues[f.id] > 0, 'famille ' + f.id + ' sans adresse'));
  Object.keys(t).forEach((u) => assert.ok(/^https?:\/\/[^\s]+\.[^\s]+/.test(u), 'adresse lisible : ' + u));
});

test('contrôle : chaque réponse est rangée, le résultat est gardé, les http ne sont pas ouverts', async () => {
  const racine = depotTemporaire();
  const f = reseau({ 'https://www.caf.fr/aides': 200, 'https://www.disparu.fr/page': 404, 'https://www.orphelin.fr/': 403, 'https://www.service-public.gouv.fr/F1': 200, 'https://www.banquealimentaire.org': new Error('boom') });
  const a = creerAdresses(racine, { fetch: f, maintenant: () => '2026-11-05T10:00:00Z' });
  const r = a.demarrer({});
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.total, 6, 'cinq adresses https et une http');
  await a.attendre();
  assert.ok(!f.appels.some((u) => u.indexOf('http://') === 0), 'rien n\'est ouvert en http');
  const e = a.etat();
  assert.strictEqual(e.enCours, false);
  assert.strictEqual(e.derniere, '2026-11-05 10:00');
  const parUrl = {}; e.lignes.forEach((l) => { parUrl[l.url] = l; });
  assert.strictEqual(parUrl['https://www.disparu.fr/page'].etat, 'absente');
  assert.strictEqual(parUrl['https://www.orphelin.fr/'].etat, 'refuse');
  assert.strictEqual(parUrl['https://www.banquealimentaire.org'].etat, 'sans-reponse');
  assert.strictEqual(e.compte.repond, 2);
  assert.strictEqual(e.compte['non-controlee'], 1);
  assert.strictEqual(e.aSignaler, 3);
  assert.ok(fs.existsSync(path.join(racine, 'outils', 'controles', 'adresses.json')), 'dernier résultat gardé');
  assert.ok(parUrl['https://www.disparu.fr/page'].nouvelle, 'première fois : nouvelle');
  assert.ok(/Les aides au logement/.test(parUrl['https://www.disparu.fr/page'].ou[0]), 'dit où elle est utilisée');
});

test('« garder tel quel » : disparaît de la liste, garde la note, réapparaît si le résultat change, se retire', async () => {
  const racine = depotTemporaire();
  const f = reseau({ 'https://www.disparu.fr/page': 404 });
  const a = creerAdresses(racine, { fetch: f, maintenant: () => '2026-11-05T10:00:00Z' });
  a.demarrer({ familles: ['cadre'] }); await a.attendre();
  assert.strictEqual(a.garder({ url: 'https://www.disparu.fr/page', note: '  La page   s\'affiche chez moi ' }).ok, true);
  let e = a.etat();
  assert.ok(!e.lignes.some((l) => l.url === 'https://www.disparu.fr/page'));
  assert.strictEqual(e.gardees.length, 1);
  assert.strictEqual(e.gardees[0].note, 'La page s\'affiche chez moi');
  assert.strictEqual(e.compte.absente, 0, 'une adresse gardée ne compte plus dans les alertes');
  // Le résultat change (le site répond autrement) : l'adresse revient d'elle-même avec l'ancienne note.
  const f2 = reseau({ 'https://www.disparu.fr/page': 403 });
  const b = creerAdresses(racine, { fetch: f2, maintenant: () => '2026-12-05T10:00:00Z' });
  b.demarrer({ familles: ['cadre'] }); await b.attendre();
  e = b.etat();
  const l = e.lignes.find((x) => x.url === 'https://www.disparu.fr/page');
  assert.ok(l && l.etat === 'refuse' && l.ancienneGarde && l.ancienneGarde.etat === 'absente');
  assert.strictEqual(l.nouvelle, false, 'elle posait déjà problème au contrôle précédent : pas « nouvelle »');
  assert.strictEqual(b.nePlusGarder({ url: 'https://www.disparu.fr/page' }).ok, true);
  assert.strictEqual(b.nePlusGarder({ url: 'https://www.disparu.fr/page' }).ok, false);
});

test('« garder » : refuse une adresse absente du résultat, un tiret long, et un contrôle déjà en cours', async () => {
  const racine = depotTemporaire();
  const a = creerAdresses(racine, { fetch: reseau({ 'https://www.disparu.fr/page': 404 }), maintenant: () => '2026-11-05T10:00:00Z' });
  assert.strictEqual(a.garder({ url: 'https://www.disparu.fr/page', note: 'x' }).ok, false, 'pas encore de résultat');
  const r = a.demarrer({ familles: ['cadre'] });
  assert.strictEqual(a.demarrer({}).ok, false, 'un seul contrôle à la fois');
  assert.ok(r.ok); await a.attendre();
  assert.strictEqual(a.garder({ url: 'https://www.disparu.fr/page', note: 'ok ' + String.fromCharCode(0x2014) + ' bon' }).ok, false);
  assert.strictEqual(a.garder({ url: 'https://ailleurs.example.org/', note: 'x' }).ok, false, 'une adresse venue de la fenêtre est refusée');
  assert.strictEqual(a.demarrer({ familles: ['inconnue'] }).ok, false);
  assert.strictEqual(a.demarrer({ familles: [] }).ok, false);
});

test('un site protégé contre les robots n’est pas « mène ailleurs » : il est « refusée aux robots »', async () => {
  const racine = depotTemporaire();
  const f = function (url) { return Promise.resolve(Object.defineProperty(new Response('', { status: 200 }), 'url', { value: 'https://validate.perfdrive.com/abc?x=1' })); };
  const a = creerAdresses(racine, { fetch: f, maintenant: () => '2026-11-05T10:00:00Z' });
  a.demarrer({ familles: ['cadre'] }); await a.attendre();
  const e = a.etat();
  assert.ok(e.lignes.length > 0 && e.lignes.every((l) => l.etat === 'refuse' && l.finale === ''), 'aucune alerte « ailleurs » pour une page de protection');
  assert.strictEqual(e.compte.ailleurs, 0);
});

test('« à corriger » : un repère pour Claude, rien n\'est modifié dans les données', async () => {
  const racine = depotTemporaire();
  const avant = fs.readFileSync(path.join(racine, 'data/lexique.js'), 'utf8');
  const a = creerAdresses(racine, { fetch: reseau({ 'https://www.service-public.gouv.fr/F1': 404 }), maintenant: () => '2026-11-05T10:00:00Z' });
  a.demarrer({ familles: ['lexique'] }); await a.attendre();
  assert.strictEqual(a.marquer({ url: 'https://www.service-public.gouv.fr/F1' }).ok, true);
  assert.strictEqual(a.etat().lignes[0].aCorriger, true);
  assert.strictEqual(a.marquer({ url: 'https://www.service-public.gouv.fr/F1', valeur: false }).ok, true);
  assert.strictEqual(a.etat().lignes[0].aCorriger, false);
  assert.strictEqual(a.marquer({ url: 'https://inconnue.fr/' }).ok, false);
  assert.strictEqual(fs.readFileSync(path.join(racine, 'data/lexique.js'), 'utf8'), avant, 'le Lexique n\'est jamais écrit');
});

test('aperçu : nombres par famille, rappel mensuel après trente jours, bilan de Qui fait quoi repris sans rien rouvrir', async () => {
  const racine = depotTemporaire();
  const qfq = { ok: true, registres: [{ fichier: 'employeurs', cartes: 3 }] };
  let jour = '2026-11-05T10:00:00Z';
  const a = creerAdresses(racine, { fetch: reseau({}), maintenant: () => jour, controleSas: { bilanMensuel: () => qfq } });
  let p = a.apercu();
  assert.strictEqual(p.aFaire, true, 'jamais contrôlé : à faire');
  assert.strictEqual(p.derniere, '');
  assert.strictEqual(p.familles.find((x) => x.id === 'cadre').total, 3);
  assert.strictEqual(p.qfq, qfq, 'Qui fait quoi : bilan existant repris');
  a.demarrer({ familles: ['lexique'] }); await a.attendre();
  p = a.apercu(); assert.strictEqual(p.aFaire, false); assert.strictEqual(p.jours, 0);
  jour = '2026-12-04T10:00:00Z'; p = a.apercu(); assert.strictEqual(p.aFaire, false, '29 jours');
  jour = '2026-12-06T10:00:00Z'; p = a.apercu(); assert.strictEqual(p.aFaire, true, '31 jours');
});

test('un fichier de résultat illisible ne casse rien', () => {
  const racine = depotTemporaire();
  ecrire(racine, 'outils/controles/adresses.json', '{pas du json');
  ecrire(racine, 'outils/controles/adresses_gardees.json', '[]');
  const a = creerAdresses(racine, {});
  assert.strictEqual(a.etat().controlees, 0);
  assert.strictEqual(a.apercu().aFaire, true);
});

test('le module n\'écrit que dans outils/controles et ne contient aucun tiret long', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veilleAdresses.js'), 'utf8');
  assert.ok(!TIRETS.test(src));
  const ecritures = src.match(/write\w*Sync\(/g) || [];
  assert.ok(ecritures.length === 1, 'une seule écriture (le fichier temporaire), jamais ailleurs');
});
