/* Onglet « Prospection des structures » (consigne 270) : la recherche avec un FAUX réseau, la lecture du résultat, les routes du serveur. */
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { lancer, lireResultat } = require('../scripts/prospectionStructures.js');
const { creerProspection } = require('../outils/veilleProspection.js');
const { demarrer } = require('../outils/serveur_veille.js');

const URL_CSV = 'https://static.data.gouv.fr/resources/x/20261109-130030/structures-inclusion-2026-11-09.csv';
const ENTETE = 'id,siret,nom,commune,code_postal,code_insee,adresse,complement_adresse,longitude,latitude,telephone,courriel,site_web,description,source,date_maj,lien_source,horaires_accueil,accessibilite_lieu,reseaux_porteurs';
const csv = (lignes) => ENTETE + '\n' + lignes.join('\n') + '\n';
const ligne = (id, nom, siret, tel, maj) => [id, siret, nom, 'Limoges', '87000', '87085', '1 rue A', '', '', '', tel, '', '', 'Une description', 'dora', maj, '', '', '', "['ei']"].join(',');

function dossierTemporaire() {
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), 'prosp-'));
  fs.mkdirSync(path.join(racine, 'modules', 'mon-territoire', 'contenu'), { recursive: true });
  fs.mkdirSync(path.join(racine, 'outils', 'sas'), { recursive: true });
  fs.writeFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), '');
  fs.writeFileSync(path.join(racine, 'outils', 'sas', 'lieux.sas.txt'), '');
  return racine;
}
// Faux réseau : data.gouv.fr rend le jeu de données, static.data.gouv.fr le CSV, la base officielle un établissement actif ou fermé.
function fauxReseau(contenuCsv, journal, options) {
  const o = options || {};
  return async function (url) {
    journal.push(url);
    if (/api\/1\/datasets/.test(url)) { return { ok: true, status: 200, json: async () => ({ resources: [{ url: o.urlCsv || URL_CSV, filesize: 1000 }] }) }; }
    if (url.indexOf('https://static.data.gouv.fr/') === 0) { return { ok: true, status: 200, arrayBuffer: async () => Buffer.from(contenuCsv, 'utf8') }; }
    const m = /q=(\d+)/.exec(url);
    if (m) {
      const etat = m[1] === '22222222222222' ? 'F' : 'A';
      return { ok: true, status: 200, json: async () => ({ results: [{ siege: { siret: m[1] }, matching_etablissements: [{ siret: m[1], etat_administratif: etat, libelle_commune: 'LIMOGES' }] }] }) };
    }
    return { ok: false, status: 404 };
  };
}
const AUJOURDHUI = '2026-11-12';

test('la recherche télécharge, vérifie, écrit le résultat et ne touche ni au registre ni au sas', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures'), journal = [], progres = [];
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2026-09-01'), ligne('b', 'Atelier Fermé', '22222222222222', '0555010204', '2026-09-01')]);
  const r = await lancer({ racine, dossier, fetch: fauxReseau(contenu, journal), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI, surProgres: (t, p) => progres.push(p) });
  assert.strictEqual(r.ok, true);
  assert.strictEqual(r.fichierDu, '09/11/2026');
  const res = JSON.parse(fs.readFileSync(path.join(dossier, 'resultat.json'), 'utf8'));
  assert.deepStrictEqual(res.candidates.map((c) => c.nom), ['Atelier Bon']);
  assert.strictEqual(res.compte.fermees, 1);
  assert.strictEqual(res.origine, URL_CSV);
  assert.ok(progres.length >= 4 && progres[progres.length - 1] === 100 && progres.every((p, i) => i === 0 || p >= progres[i - 1]), 'l\'avancement ne recule pas');
  assert.ok(!fs.existsSync(path.join(dossier, 'structures_telechargees.csv')), 'le gros fichier téléchargé est supprimé');
  assert.strictEqual(fs.readFileSync(path.join(racine, 'outils', 'sas', 'lieux.sas.txt'), 'utf8'), '', 'le sas n\'est pas écrit');
  assert.strictEqual(fs.readFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), 'utf8'), '', 'le registre n\'est pas écrit');
  const hotes = new Set(journal.map((u) => new URL(u).hostname));
  assert.deepStrictEqual(Array.from(hotes).sort(), ['recherche-entreprises.api.gouv.fr', 'static.data.gouv.fr', 'www.data.gouv.fr']);
});

test('le même fichier une seconde fois : « rien de nouveau », sans retélécharger ; avec « chercher quand même », on refait', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2026-09-01')]);
  const base = { racine, dossier, pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI };
  await lancer(Object.assign({ fetch: fauxReseau(contenu, []) }, base));
  const journal = [];
  const r2 = await lancer(Object.assign({ fetch: fauxReseau(contenu, journal) }, base));
  assert.strictEqual(r2.pasDeNouveau, true);
  assert.ok(!journal.some((u) => u.indexOf('https://static.data.gouv.fr/') === 0), 'rien n\'est retéléchargé');
  const journal3 = [];
  const r3 = await lancer(Object.assign({ fetch: fauxReseau(contenu, journal3), force: true }, base));
  assert.ok(!r3.pasDeNouveau);
  assert.ok(journal3.some((u) => u.indexOf('https://static.data.gouv.fr/') === 0));
});

test('une adresse de fichier qui n\'est pas sur static.data.gouv.fr est refusée', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const f = fauxReseau('', [], { urlCsv: 'https://exemple.org/structures-inclusion-2026-11-09.csv' });
  await assert.rejects(() => lancer({ racine, dossier, fetch: f, pause: 0, aujourdhui: AUJOURDHUI }), /introuvable/);
});

test('un site qui ne répond pas donne une erreur claire et ne casse pas le résultat précédent', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2026-09-01')]);
  await lancer({ racine, dossier, fetch: fauxReseau(contenu, []), pause: 0, aujourdhui: AUJOURDHUI });
  const avant = fs.readFileSync(path.join(dossier, 'resultat.json'), 'utf8');
  await assert.rejects(() => lancer({ racine, dossier, force: true, fetch: async () => { throw new Error('réseau coupé'); }, aujourdhui: AUJOURDHUI }), /ne répond pas/);
  assert.strictEqual(fs.readFileSync(path.join(dossier, 'resultat.json'), 'utf8'), avant);
});

test('un fichier qui n\'a pas le bon format ne change rien', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  await assert.rejects(() => lancer({ racine, dossier, fetch: fauxReseau('a,b\n1,2\n', []), pause: 0, aujourdhui: AUJOURDHUI }), /pas le format attendu/);
  assert.ok(!fs.existsSync(path.join(dossier, 'resultat.json')));
});

test('la lecture retire ce qui est entré dans le sas depuis la recherche', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2026-09-01'), ligne('c', 'Atelier Deux', '33333333333333', '0555010299', '2026-09-01')]);
  await lancer({ racine, dossier, fetch: fauxReseau(contenu, []), pause: 0, aujourdhui: AUJOURDHUI });
  assert.strictEqual(lireResultat({ racine, dossier }).candidates.length, 2);
  fs.writeFileSync(path.join(racine, 'outils', 'sas', 'lieux.sas.txt'), 'atelier-bon-87 | siae | Atelier Bon | | Limoges | | 05 55 01 02 03 | | 87 | emploi | source | \n');
  const l = lireResultat({ racine, dossier });
  assert.deepStrictEqual(l.candidates.map((c) => c.nom), ['Atelier Deux']);
  assert.strictEqual(l.dejaMaintenant, 1);
});

test('la lecture dit « absent » sans résultat, et refuse un fichier abîmé', () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  assert.strictEqual(lireResultat({ racine, dossier }).absent, true);
  fs.mkdirSync(dossier, { recursive: true });
  fs.writeFileSync(path.join(dossier, 'resultat.json'), '{pas du json');
  const l = lireResultat({ racine, dossier });
  assert.strictEqual(l.ok, false);
  assert.match(l.erreur, /abîmé/);
});

test('le module serveur : une seule recherche à la fois, avancement lisible, erreur gardée', async () => {
  const racine = dossierTemporaire();
  let finir;
  const p = creerProspection(racine, { lancer: (o) => new Promise((ok) => { o.surProgres('Téléchargement...', 20); finir = () => ok({ ok: true, fichierDu: '09/11/2026' }); }) });
  assert.strictEqual(p.chercher({}).ok, true);
  assert.strictEqual(p.chercher({}).ok, false, 'pas deux recherches en même temps');
  assert.strictEqual(p.etat().enCours, true);
  assert.strictEqual(p.etat().etape, 'Téléchargement...');
  finir(); await new Promise((r) => setTimeout(r, 10));
  assert.strictEqual(p.etat().termine, true);
  assert.strictEqual(p.etat().fichierDu, '09/11/2026');
  const q = creerProspection(racine, { lancer: () => Promise.reject(new Error('panne')) });
  q.chercher({}); await new Promise((r) => setTimeout(r, 10));
  assert.strictEqual(q.etat().erreur, 'panne');
  assert.strictEqual(q.etat().enCours, false);
});

test('le serveur local : les trois routes exigent le jeton et rendent du JSON', async () => {
  const racine = dossierTemporaire();
  const prospection = creerProspection(racine, { lancer: async () => ({ ok: true, fichierDu: '' }) });
  const s = await new Promise((resolve, reject) => demarrer(0, (e, serveur) => e ? reject(e) : resolve(serveur), undefined, { prospection }));
  const port = s.address().port, jeton = s.jetonDeLancement;
  const appeler = (chemin, avecJeton) => new Promise((resolve, reject) => {
    const r = http.request({ host: '127.0.0.1', port, path: chemin, method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, avecJeton ? { 'X-Veille-Jeton': jeton } : {}) }, (res) => {
      const m = []; res.on('data', (c) => m.push(c)); res.on('end', () => resolve({ code: res.statusCode, corps: Buffer.concat(m).toString('utf8') }));
    });
    r.on('error', reject); r.end('{}');
  });
  try {
    for (const chemin of ['/api/prospection/lire', '/api/prospection/etat', '/api/prospection/chercher']) {
      assert.strictEqual((await appeler(chemin, false)).code, 403, chemin + ' sans jeton');
      const r = await appeler(chemin, true);
      assert.strictEqual(r.code, 200, chemin);
      assert.strictEqual(JSON.parse(r.corps).ok, true, chemin);
    }
  } finally { await new Promise((r) => s.close(r)); }
});

test('la recherche enregistre aussi le recoupement du registre, sans l\'écrire ; lireResultat ne garde que les fiches encore au registre', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const reg = path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt');
  const avant = 'fermee-87 | siae | Atelier Fermé | | Limoges | | 05 55 01 02 04 | | 87 | emploi | source | 2026-10-01\nretiree-87 | siae | Atelier Bon | | Limoges | | 05 55 01 02 03 | https://autre.example.org/ | 87 | emploi | source | 2026-10-01\n';
  fs.writeFileSync(reg, avant);
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2025-01-01'), ligne('b', 'Atelier Fermé', '22222222222222', '0555010204', '2025-01-01')]);
  await lancer({ racine, dossier, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  const res = JSON.parse(fs.readFileSync(path.join(dossier, 'resultat.json'), 'utf8'));
  assert.strictEqual(res.recoupement.recoupees, 2, 'même des fiches de plus de 12 mois sont retrouvées');
  assert.ok(res.recoupement.aRevoir.some((x) => x.id === 'fermee-87' && /fermé/.test(x.raisons.join(' '))));
  assert.strictEqual(fs.readFileSync(reg, 'utf8'), avant, 'le registre n\'est pas écrit');
  fs.writeFileSync(reg, avant.split('\n').filter((l) => l.indexOf('fermee-87') !== 0).join('\n'));
  const lu = lireResultat({ racine, dossier });
  assert.ok(!lu.recoupement.aRevoir.some((x) => x.id === 'fermee-87'), 'une fiche retirée du registre ne s\'affiche plus');
});

// ---- Décisions de Denis : écarter, trancher, remettre en jeu, verrou du sas (consigne 270, suite 4)
const { decider, verifier, lireDecisions, cleNom } = require('../scripts/prospectionStructures.js');
const ligneVille = (id, nom, siret, tel, maj, ville, insee, site) => [id, siret, nom, ville, '24000', insee, '1 rue A', '', '', '', tel, '', site || '', 'Une description', 'dora', maj, '', '', '', "['ei']"].join(',');
async function preparerDecisions(registre) {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  fs.writeFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), registre || '');
  const contenu = csv([
    ligneVille('a', 'Atelier Bon', '11111111111111', '0553010203', '2026-09-01', 'Périgueux', '24322'),
    ligneVille('b', 'Cc Isle Vern Salembre En Perigord', '', '0553808686', '2026-09-01', 'Saint-Astier', '24347', 'https://www.ccivs.fr/'),
    ligneVille('c', 'Atelier Neuf', '33333333333333', '0553010299', '2026-09-01', 'Bergerac', '24037')
  ]);
  await lancer({ racine, dossier, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  return { racine, dossier };
}
const REG_CC = 'cc-ivs-24 | collectivite-etat | Communauté de communes - Isle Vern Salembre en Périgord | | Saint-Astier | | 05 53 03 45 82 | https://lannuaire.service-public.gouv.fr/x | 24 | emploi | source | 2026-10-01\n';

test('une fiche qui ressemble à une fiche publiée est orange, les autres sont vertes', async () => {
  const { racine, dossier } = await preparerDecisions(REG_CC);
  const l = lireResultat({ racine, dossier });
  const par = {}; l.candidates.forEach((c) => { par[c.nom] = c; });
  assert.strictEqual(par['Cc Isle Vern Salembre En Perigord'].controle, 'orange');
  assert.strictEqual(par['Cc Isle Vern Salembre En Perigord'].rapprochements[0].id, 'cc-ivs-24');
  assert.ok(par['Cc Isle Vern Salembre En Perigord'].rapprochements[0].motifs.indexOf('même commune') !== -1);
  assert.strictEqual(par['Atelier Bon'].controle, 'vert');
});

test('le verrou du sas : rien ne sort tant qu\'une fiche est à trancher, puis les lignes sortent', async () => {
  const { racine, dossier } = await preparerDecisions(REG_CC);
  const ids = lireResultat({ racine, dossier }).candidates.map((c) => c.id);
  const v = verifier({ racine, dossier }, ids);
  assert.strictEqual(v.bloque, true);
  assert.deepStrictEqual(v.lignes, []);
  assert.deepStrictEqual(v.aTrancher, ['Cc Isle Vern Salembre En Perigord']);
  const orange = lireResultat({ racine, dossier }).candidates.find((c) => c.controle === 'orange');
  assert.strictEqual(decider({ racine, dossier }, { op: 'trancher', id: orange.id, choix: 'antenne', regId: 'cc-ivs-24' }).ok, true);
  const v2 = verifier({ racine, dossier }, ids);
  assert.strictEqual(v2.bloque, false);
  assert.strictEqual(v2.lignes.length, 3);
  const antenne = v2.lignes.find((x) => /Cc Isle Vern/.test(x));
  assert.ok(/Antenne de Communauté de communes - Isle Vern Salembre en Périgord, à Saint-Astier\./.test(antenne), 'la phrase de l\'antenne est préparée');
  assert.strictEqual(antenne.split(' | ').length, 14, 'la ligne porte la date, le mail et l\'adresse');
  assert.ok(/, \d{5} Saint-Astier$/.test(antenne.split(' | ')[13]), 'l\'adresse finit par le code postal et la commune');
});

test('« même structure » : la fiche disparaît et la fiche existante passe à revoir avec ce qui diffère', async () => {
  const { racine, dossier } = await preparerDecisions(REG_CC);
  const orange = lireResultat({ racine, dossier }).candidates.find((c) => c.controle === 'orange');
  assert.strictEqual(decider({ racine, dossier }, { op: 'trancher', id: orange.id, choix: 'meme', regId: 'cc-ivs-24' }).ok, true);
  const l = lireResultat({ racine, dossier });
  assert.ok(!l.candidates.some((c) => c.id === orange.id));
  assert.strictEqual(l.decisionsRetenues.length, 1);
  const x = l.recoupement.aRevoir.find((z) => z.id === 'cc-ivs-24');
  assert.ok(x, 'la fiche existante est à revoir');
  assert.ok(x.raisons.some((z) => /même structure/.test(z)) && x.raisons.some((z) => /autre téléphone/.test(z)) && x.raisons.some((z) => /autre site/.test(z)));
  // revenir sur la décision
  assert.strictEqual(decider({ racine, dossier }, { op: 'detrancher', cle: l.decisionsRetenues[0].cle }).ok, true);
  assert.ok(lireResultat({ racine, dossier }).candidates.some((c) => c.id === orange.id && c.controle === 'orange'));
});

test('écarter : la fiche disparaît, ne revient pas à la recherche suivante, et se remet en jeu', async () => {
  const { racine, dossier } = await preparerDecisions('');
  const bon = lireResultat({ racine, dossier }).candidates.find((c) => c.nom === 'Atelier Bon');
  assert.strictEqual(decider({ racine, dossier }, { op: 'ecarter', id: bon.id, raison: 'Autre', texte: '' }).ok, false, '« Autre » demande un texte');
  assert.strictEqual(decider({ racine, dossier }, { op: 'ecarter', id: bon.id, raison: 'Une raison inventée' }).ok, false);
  assert.strictEqual(decider({ racine, dossier }, { op: 'ecarter', id: bon.id, raison: 'Hors de mon public', texte: ' ce n\'est   qu\'une permanence ' }).ok, true);
  let l = lireResultat({ racine, dossier });
  assert.ok(!l.candidates.some((c) => c.nom === 'Atelier Bon'));
  assert.strictEqual(l.ecarteesParVous.length, 1);
  assert.strictEqual(l.ecarteesParVous[0].texte, 'ce n\'est qu\'une permanence');
  assert.match(l.ecarteesParVous[0].date, /^\d{4}-\d{2}-\d{2}$/);
  // une nouvelle recherche (même fichier forcé) ne la ramène pas
  const contenu = csv([ligneVille('a', 'Atelier Bon', '11111111111111', '0553010203', '2026-09-01', 'Périgueux', '24322')]);
  await lancer({ racine, dossier, force: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  assert.ok(!lireResultat({ racine, dossier }).candidates.some((c) => c.nom === 'Atelier Bon'));
  // remise en jeu
  assert.strictEqual(decider({ racine, dossier }, { op: 'remettre', cle: l.ecarteesParVous[0].cle }).ok, true);
  l = lireResultat({ racine, dossier });
  assert.ok(l.candidates.some((c) => c.nom === 'Atelier Bon'));
  assert.strictEqual(l.ecarteesParVous.length, 0);
});

test('une fiche écartée est reconnue même si son identifiant change (par le SIRET, ou le nom et la commune)', async () => {
  const { racine, dossier } = await preparerDecisions('');
  const bon = lireResultat({ racine, dossier }).candidates.find((c) => c.nom === 'Atelier Bon');
  decider({ racine, dossier }, { op: 'ecarter', id: bon.id, raison: 'Structure fermée' });
  const contenu = csv([ligneVille('autre-identifiant', 'Atelier Bon', '11111111111111', '0553010204', '2026-10-01', 'Autre ville', '24322')]);
  await lancer({ racine, dossier, force: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  assert.ok(!lireResultat({ racine, dossier }).candidates.some((c) => c.nom === 'Atelier Bon'), 'même SIRET, autre commune et autre téléphone : toujours écartée');
});

test('remettre en jeu une fiche écartée d\'office : elle revient à la recherche suivante', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const contenu = csv([ligneVille('e', 'Collège Jules Ferry', '', '0553010203', '2026-09-01', 'Périgueux', '24322')]);
  await lancer({ racine, dossier, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  let l = lireResultat({ racine, dossier });
  assert.strictEqual(l.candidates.length, 0);
  assert.strictEqual(l.ecartees.length, 1);
  assert.strictEqual(decider({ racine, dossier }, { op: 'remettre-office', cle: l.ecartees[0].cle }).ok, true);
  assert.strictEqual(lireResultat({ racine, dossier }).ecartees[0].remise, true);
  await lancer({ racine, dossier, force: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  l = lireResultat({ racine, dossier });
  assert.deepStrictEqual(l.candidates.map((c) => c.nom), ['Collège Jules Ferry']);
});

test('les décisions n\'écrivent que decisions.json : jamais le registre ni le sas', async () => {
  const { racine, dossier } = await preparerDecisions(REG_CC);
  const avantReg = fs.readFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), 'utf8');
  const bon = lireResultat({ racine, dossier }).candidates.find((c) => c.nom === 'Atelier Bon');
  decider({ racine, dossier }, { op: 'ecarter', id: bon.id, raison: 'Hors de mon public' });
  assert.strictEqual(fs.readFileSync(path.join(racine, 'modules', 'mon-territoire', 'contenu', 'lieux.txt'), 'utf8'), avantReg);
  assert.strictEqual(fs.readFileSync(path.join(racine, 'outils', 'sas', 'lieux.sas.txt'), 'utf8'), '');
  assert.ok(fs.existsSync(path.join(dossier, 'decisions.json')));
  assert.strictEqual(Object.keys(lireDecisions(dossier).ecartees).length, 1);
  assert.strictEqual(decider({ racine, dossier }, { op: 'inconnue' }).ok, false);
});

test('le module serveur transmet les décisions et le verrou', async () => {
  const { racine, dossier } = await preparerDecisions(REG_CC);
  const p = creerProspection(racine, { lancer: async () => ({ ok: true }) });
  const ids = p.lire().candidates.map((c) => c.id);
  assert.strictEqual(p.verifier({ ids: ids }).bloque, true);
  assert.strictEqual(p.decider({ op: 'ecarter', id: 'pas-un-id', raison: 'Hors de mon public' }).ok, false);
  assert.strictEqual(p.verifier({ ids: 'pas une liste' }).lignes.length, 0);
});

// ---- Deuxième source : FINESS (consigne 270, suite 5, 13/11/2026)
const zlib = require('node:zlib');
const { nomFiness, extraireFiness } = require('../scripts/prospectionStructures.js');
// Un fichier FINESS minuscule, dans la même mise en forme que le vrai (JSON sur 2 espaces, un établissement géographique par « ege »).
function ege(num, nom, cat, cog, tel, siret, fermeture) {
  return { informationsGeneralesEGE: { numFinessEge: num, nomEgeLong: nom, nomEgeCourt: nom, dateFermeture: fermeture || null, siret: siret || null }, categorieentiteGeographiqueExercice: cat,
    adresse: [{ cogCommune: cog, ligneAcheminement: 'LIMOGES', codePostal: '87000', ligneQuatre: '1 RUE A' }], contact: [{ telecom: { telephone: tel } }], etatObjet: 'A' };
}
function fichierFiness(dossier, egeListe) {
  const pm = { informationsGeneralesPMEJ: { denominationPm: 'ASSOCIATION TEST' }, ege: egeListe, etatObjet: 'A' };
  const corps = JSON.stringify(pm, null, 2).split('\n').slice(1, -1).map((l) => '  ' + l).join('\n');
  const texte = '{\n  "schemaVersion" : "v1.0.0",\n  "generatedAt" : "2026-11-12T03:05:03.1",\n  "gco" : [ ],\n  "pmej" : [ {\n' + corps + '\n  }, {\n' + corps + '\n  } ]\n}\n';
  const f = path.join(dossier, 'finess_test.json.gz'); fs.mkdirSync(dossier, { recursive: true }); fs.writeFileSync(f, zlib.gzipSync(texte)); return f;
}

test('les noms FINESS reçoivent une casse lisible et les accents des mots courants', () => {
  assert.strictEqual(nomFiness('HEBERGEMENT D\'INSERTION ET D\'URGENCE'), 'Hébergement d\'insertion et d\'urgence');
  assert.strictEqual(nomFiness('ESAT BERTRAN DE BORN'), 'ESAT Bertran de Born');
  assert.strictEqual(nomFiness('MR RESIDENCE ACCUEIL DE MONTPON'), 'Maison relais résidence Accueil de Montpon');
});

test('la lecture du fichier FINESS garde les établissements ouverts de 24 et 87 dans les catégories utiles', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const f = fichierFiness(dossier, [
    ege('870000001', 'ESAT DU TEST', '246', '87085', '0555010101', '11111111111111'),
    ege('870000002', 'PHARMACIE DU CENTRE', '620', '87085', '0555010102'),
    ege('330000003', 'ESAT AILLEURS', '246', '33063', '0555010103'),
    ege('870000004', 'ESAT FERME', '246', '87085', '0555010104', '', '2020-01-01')
  ]);
  const r = await extraireFiness(f);
  assert.strictEqual(r.jour, '2026-11-12');
  assert.deepStrictEqual(r.lignes.map((l) => l.nom), ['ESAT du Test', 'ESAT du Test']);   // le fichier compte deux fois la même association
  assert.strictEqual(r.lignes[0].finess.label, 'ESAT');
  assert.strictEqual(r.lignes[0].siret, '11111111111111');
});

test('FINESS comme deuxième source : fiche classée, ligne du sas, avertissements, réutilisation 30 jours', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const f = fichierFiness(dossier, [ege('870000001', 'ESAT DU TEST', '246', '87085', '0555010101', '11111111111111'), ege('870000005', 'MAISON RELAIS DU PARC', '258', '87085', '0555010105', '')]);
  // Une fiche de data.inclusion a le même téléphone que « Maison relais du parc » : on garde celle de data.inclusion.
  const contenu = csv([ligne('a', 'Maison du Parc Limoges', '33333333333333', '0555010105', '2026-09-01')]);
  const r = await lancer({ racine, dossier, fichierFiness: f, finess: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  assert.strictEqual(r.ok, true);
  const res = JSON.parse(fs.readFileSync(path.join(dossier, 'resultat.json'), 'utf8'));
  assert.deepStrictEqual(res.candidates.map((c) => c.nom).sort(), ['ESAT du Test', 'ESAT du Test', 'Maison du Parc Limoges']);
  const esat = res.candidates.find((c) => c.origine === 'finess');
  assert.strictEqual(esat.type, 'handicap');
  assert.strictEqual(esat.rayons, 'handicap,emploi');
  assert.strictEqual(esat.ligne, 'esat-du-test-limoges-87 | handicap | ESAT du Test |  | Limoges |  | 05 55 01 01 01 |  | 87 | handicap,emploi | FINESS, ESAT, fichier du 12/11/2026 ; base officielle : active ; à vérifier |  |  | 1 Rue A, 87000 Limoges');
  assert.ok(esat.avertissements.some((a) => /fichier FINESS/.test(a)));
  assert.ok(esat.avertissements.some((a) => /même téléphone est donné à 2 fiches/.test(a)), 'les deux fiches de l\'association (même téléphone) sont signalées');
  assert.strictEqual(res.compte.doublonsSources, 2);   // la maison relais du fichier compte deux fois
  assert.strictEqual(res.finess.nbLignes, 4);
  assert.ok(fs.existsSync(path.join(dossier, 'finess_extrait.json')));
  // Fichier data.inclusion inchangé et liste FINESS récente (moins de 30 jours) : rien de nouveau.
  const r3 = await lancer({ racine, dossier, finess: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  assert.strictEqual(r3.pasDeNouveau, true);
  // Liste FINESS vieille de plus de 30 jours : la recherche reprend (et, sans réseau FINESS, garde l'ancienne liste en le disant).
  const r4 = await lancer({ racine, dossier, finess: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: '2026-12-20' });
  assert.ok(!r4.pasDeNouveau);
  assert.ok(/FINESS/.test(r4.finess.avertissement) && /reprise/.test(r4.finess.avertissement));
  assert.strictEqual(r4.finess.nbLignes, 4);
});

test('si FINESS ne répond pas, la recherche se termine quand même et le dit', async () => {
  const racine = dossierTemporaire(), dossier = path.join(racine, 'outils', 'prospection_structures');
  const contenu = csv([ligne('a', 'Atelier Bon', '11111111111111', '0555010203', '2026-09-01')]);
  const r = await lancer({ racine, dossier, finess: true, fetch: fauxReseau(contenu, []), pause: 0, pauseLimite: 0, aujourdhui: AUJOURDHUI });
  assert.strictEqual(r.ok, true);
  assert.ok(/FINESS/.test(r.finess.avertissement));
  const l = lireResultat({ racine, dossier });
  assert.deepStrictEqual(l.candidates.map((c) => c.nom), ['Atelier Bon']);
  assert.ok(/FINESS/.test(l.finess.avertissement));
});
