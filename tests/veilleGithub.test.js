const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const { spawnSync } = require('node:child_process');
const { creerGithub, groupeDe } = require('../outils/veilleGithub.js');

const JETON = 'github_pat_' + 'A1b2C3d4E5'.repeat(4);
const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex');
const shaBlob = (buf) => sha1(Buffer.concat([Buffer.from('blob ' + buf.length + '\0'), buf]));

// ---------- faux GitHub (en memoire) ----------
function fauxGithub(options) {
  const opt = Object.assign({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: JETON, push: true }, options || {});
  const blobs = {}, arbres = {}, commits = {};
  const journal = [];
  let tete = null;
  function nouvelArbre(entrees) { const id = sha1(Buffer.from(JSON.stringify(entrees))); arbres[id] = entrees; return id; }
  function init(fichiers) {   // fichiers : { chemin: Buffer }
    const e = {};
    Object.keys(fichiers).forEach((p) => { const s = shaBlob(fichiers[p]); blobs[s] = fichiers[p]; e[p] = { mode: '100644', sha: s }; });
    const t = nouvelArbre(e);
    tete = sha1(Buffer.from('commit-initial')); commits[tete] = { tree: t, parents: [] };
  }
  const racine = '/repos/' + opt.proprietaire + '/' + opt.depot;
  const serveur = http.createServer((req, res) => {
    const corps = [];
    req.on('data', (c) => corps.push(c));
    req.on('end', () => {
      const texte = Buffer.concat(corps).toString('utf8');
      const json = texte ? JSON.parse(texte) : null;
      const url = new URL(req.url, 'http://x');
      journal.push({ methode: req.method, chemin: url.pathname, corps: json });
      const rep = (code, objet) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(objet)); };
      if (req.headers.authorization !== 'Bearer ' + opt.jeton) { return rep(401, { message: 'Bad credentials' }); }
      if (req.method === 'GET' && url.pathname === racine) { return opt.depotIntrouvable ? rep(404, { message: 'Not Found' }) : rep(200, { full_name: opt.proprietaire + '/' + opt.depot, permissions: { push: opt.push } }); }
      if (req.method === 'GET' && url.pathname === racine + '/branches/' + opt.branche) { return rep(200, { commit: { sha: tete, commit: { tree: { sha: commits[tete].tree } } } }); }
      let m = /^\/repos\/[^/]+\/[^/]+\/git\/trees\/([0-9a-f]{40})$/.exec(url.pathname);
      if (req.method === 'GET' && m) { const t = arbres[m[1]]; return rep(200, { truncated: !!opt.tronque, tree: Object.keys(t).map((p) => ({ path: p, type: 'blob', mode: t[p].mode, sha: t[p].sha })) }); }
      if (req.method === 'POST' && url.pathname === racine + '/git/blobs') {
        const b = Buffer.from(json.content, json.encoding === 'base64' ? 'base64' : 'utf8'); const s = shaBlob(b); blobs[s] = b; return rep(201, { sha: s });
      }
      if (req.method === 'POST' && url.pathname === racine + '/git/trees') {
        const e = Object.assign({}, arbres[json.base_tree]);
        json.tree.forEach((x) => {
          let s = x.sha;
          if (x.content !== undefined) { const b = Buffer.from(x.content, 'utf8'); s = shaBlob(b); blobs[s] = b; }
          e[x.path] = { mode: x.mode, sha: s };
        });
        return rep(201, { sha: nouvelArbre(e) });
      }
      if (req.method === 'POST' && url.pathname === racine + '/git/commits') {
        const s = sha1(Buffer.from(JSON.stringify(json) + Math.random())); commits[s] = { tree: json.tree, parents: json.parents, message: json.message }; return rep(201, { sha: s });
      }
      if (req.method === 'PATCH' && url.pathname === racine + '/git/refs/heads/' + opt.branche) {
        if (opt.avancerAvantPatch) { opt.avancerAvantPatch(); opt.avancerAvantPatch = null; }
        if (!commits[json.sha] || commits[json.sha].parents[0] !== tete || json.force) { return rep(422, { message: 'Update is not a fast forward' }); }
        tete = json.sha; return rep(200, { ref: 'refs/heads/' + opt.branche });
      }
      return rep(404, { message: 'Not Found' });
    });
  });
  return {
    journal, init, serveur, opt,
    demarrer: () => new Promise((r) => serveur.listen(0, '127.0.0.1', () => r('http://127.0.0.1:' + serveur.address().port))),
    fermer: () => new Promise((r) => { serveur.close(r); serveur.closeAllConnections && serveur.closeAllConnections(); }),
    arbreActuel: () => { const e = arbres[commits[tete].tree]; const sortie = {}; Object.keys(e).forEach((p) => { sortie[p] = blobs[e[p].sha]; }); return sortie; },
    teteActuelle: () => tete, commit: (s) => commits[s],
    avancer: () => { const t = nouvelArbre(Object.assign({}, arbres[commits[tete].tree], { 'autre.txt': { mode: '100644', sha: shaBlob(Buffer.from('autre')) } })); blobs[shaBlob(Buffer.from('autre'))] = Buffer.from('autre'); const s = sha1(Buffer.from('avance' + Math.random())); commits[s] = { tree: t, parents: [tete] }; tete = s; }
  };
}

// ---------- depot local de test ----------
function git(d, ...args) { const r = spawnSync('git', args, { cwd: d, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(d, chemin, contenu) { const p = path.join(d, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, contenu); }
function depotLocal(fichiers) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-github-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'e@example.org'); git(d, 'config', 'user.name', 'E'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  Object.keys(fichiers).forEach((p) => ecrire(d, p, fichiers[p]));
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
function configTemp() { return path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'veille-cfg-')), 'assistant-veille', 'github.json'); }
async function monter(localFichiers, distantFichiers, optionsFaux) {
  const faux = fauxGithub(optionsFaux);
  faux.init(distantFichiers);
  const base = await faux.demarrer();
  const d = depotLocal(localFichiers);
  const cfg = configTemp();
  const gh = creerGithub(d, { apiBase: base, fichierConfig: cfg });
  assert.ok(gh.ecrireConfig({ proprietaire: faux.opt.proprietaire, depot: faux.opt.depot, branche: faux.opt.branche, jeton: JETON }).ok);
  return { faux, d, gh, cfg, fin: async () => { await faux.fermer(); nettoyer(d); nettoyer(path.dirname(path.dirname(cfg))); } };
}
const B = (t) => Buffer.from(t);

// ---------- configuration ----------
test('configuration : validation des noms et du jeton, jamais de jeton renvoye', () => {
  const cfg = configTemp();
  const gh = creerGithub('.', { fichierConfig: cfg });
  assert.deepStrictEqual(gh.etatConfig(), { ok: true, configure: false });
  const bon = { proprietaire: 'denis-d', depot: 'mon.depot_1', branche: 'main', jeton: JETON };
  for (const mauvais of [{ proprietaire: '-x' }, { proprietaire: 'a b' }, { proprietaire: 'a/b' }, { depot: '..' }, { depot: 'a b' }, { depot: 'a/b' }, { branche: 'a..b' }, { branche: 'a b' }, { branche: '' }, { jeton: 'motdepasse' }, { jeton: 'ghp_court' }, { jeton: 'github_pat_ ' + 'x'.repeat(30) }]) {
    assert.ok(!gh.ecrireConfig(Object.assign({}, bon, mauvais)).ok, JSON.stringify(mauvais));
  }
  const ok = gh.ecrireConfig(bon);
  assert.ok(ok.ok && ok.configure);
  assert.strictEqual(ok.jetonFin, JETON.slice(-4));
  assert.ok(JSON.stringify(ok).indexOf(JETON) === -1 && JSON.stringify(gh.etatConfig()).indexOf(JETON) === -1);
  // jeton laisse vide : on garde l'ancien ; effacer supprime le fichier
  assert.ok(gh.ecrireConfig(Object.assign({}, bon, { branche: 'dev', jeton: '' })).ok);
  assert.strictEqual(JSON.parse(fs.readFileSync(cfg, 'utf8')).jeton, JETON);
  assert.strictEqual(gh.ecrireConfig({ effacer: true }).configure, false);
  assert.ok(!fs.existsSync(cfg));
  nettoyer(path.dirname(path.dirname(cfg)));
});

test('groupes : cadre, chiffres, lexique, autres', () => {
  assert.strictEqual(groupeDe('modules/comprendre-le-cadre/contenu/emploi/x.md'), 'cadre');
  assert.strictEqual(groupeDe('modules/comprendre-les-chiffres/contenu/2026-06.md'), 'chiffres');
  assert.strictEqual(groupeDe('data/lexique.js'), 'lexique');
  assert.strictEqual(groupeDe('data/lexique-renvois-cadre.js'), 'lexique');
  assert.strictEqual(groupeDe('data/metiers.js'), 'autres');
  assert.strictEqual(groupeDe('js/app.js'), 'autres');
});

// ---------- test de connexion ----------
test('tester : jeton valide, jeton refuse, depot introuvable, droits en lecture seule', async () => {
  const m = await monter({ 'a.txt': 'a' }, { 'a.txt': B('a') });
  try {
    assert.ok((await m.gh.tester()).ok);
    m.gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: 'github_pat_' + 'Z9y8X7w6V5'.repeat(4) });
    assert.match((await m.gh.tester()).erreur, /refuse le jeton/);
    m.gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: JETON });
    m.faux.opt.push = false;
    assert.match((await m.gh.tester()).erreur, /LIRE.*pas y ECRIRE/);
    m.faux.opt.push = true; m.faux.opt.depotIntrouvable = true;
    assert.match((await m.gh.tester()).erreur, /introuvable/);
    m.gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'inconnue', jeton: JETON }); m.faux.opt.depotIntrouvable = false;
    assert.match((await m.gh.tester()).erreur, /Branche « inconnue »/);
  } finally { await m.fin(); }
});

test('tester : sans connexion a GitHub, message clair', async () => {
  const d = depotLocal({ 'a.txt': 'a' }), cfg = configTemp();
  try {
    const gh = creerGithub(d, { apiBase: 'http://127.0.0.1:1', fichierConfig: cfg });
    gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: JETON });
    assert.match((await gh.tester()).erreur, /Pas de connexion/);
    assert.match((await gh.envoyer()).erreur, /Pas de connexion/);
  } finally { nettoyer(d); nettoyer(path.dirname(path.dirname(cfg))); }
});

// ---------- comparaison ----------
test('comparer : seuls les fichiers qui different sont comptes, par groupe ; ceux presents seulement sur GitHub ne sont pas touches', async () => {
  const local = {
    'modules/comprendre-le-cadre/contenu/emploi/A.md': 'a', 'modules/comprendre-le-cadre/contenu/emploi/B.md': 'b modifie', 'modules/comprendre-le-cadre/contenu/budget/C.md': 'c nouveau',
    'modules/comprendre-les-chiffres/contenu/2026-06.md': 'chiffres', 'data/lexique.js': 'lexique 2', 'js/app.js': 'app'
  };
  const distant = {
    'modules/comprendre-le-cadre/contenu/emploi/A.md': B('a'), 'modules/comprendre-le-cadre/contenu/emploi/B.md': B('b'), 'modules/comprendre-les-chiffres/contenu/2026-06.md': B('chiffres'),
    'data/lexique.js': B('lexique 1'), 'js/app.js': B('app'), 'README.md': B('lu seulement sur GitHub')
  };
  const m = await monter(local, distant);
  try {
    const r = await m.gh.comparer();
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.nbDifferents, 3);   // B (cadre), C (cadre, nouveau), lexique
    assert.deepStrictEqual(r.parGroupe, { cadre: 2, chiffres: 0, lexique: 1, autres: 0 });
    assert.strictEqual(r.nouveaux, 1);
    assert.strictEqual(r.seulementSurGithub, 1);
    assert.strictEqual((await m.gh.comparer(['lexique'])).nbChoisis, 1);
    assert.strictEqual((await m.gh.comparer(['cadre', 'lexique'])).nbChoisis, 3);
    assert.ok(m.faux.journal.every((j) => j.methode === 'GET'), 'comparer ne modifie rien sur GitHub');
  } finally { await m.fin(); }
});

test('comparer : un NOUVEAU module (nouveaux dossiers) enregistre dans Git est cree sur GitHub au meme chemin ; un fichier jamais enregistre est signale, pas envoye', async () => {
  const m = await monter({ 'js/app.js': 'app' }, { 'js/app.js': B('app') });
  try {
    ecrire(m.d, 'modules/mon-nouveau-module/index.js', 'module'); ecrire(m.d, 'modules/mon-nouveau-module/contenu/a.md', 'a');
    git(m.d, 'add', '-A'); git(m.d, 'commit', '-q', '-m', 'nouveau module');
    ecrire(m.d, 'modules/autre-module/jamais-enregistre.js', 'brouillon');
    const cmp = await m.gh.comparer();
    assert.strictEqual(cmp.nbDifferents, 2);
    assert.strictEqual(cmp.nouveaux, 2);
    assert.strictEqual(cmp.nonSuivis, 1);
    const r = await m.gh.envoyer();
    assert.ok(r.ok);
    const f = m.faux.arbreActuel();
    assert.strictEqual(f['modules/mon-nouveau-module/index.js'].toString(), 'module');
    assert.strictEqual(f['modules/mon-nouveau-module/contenu/a.md'].toString(), 'a');
    assert.ok(!f['modules/autre-module/jamais-enregistre.js']);
  } finally { await m.fin(); }
});

test('comparer : un arbre tronque par GitHub est refuse avec une explication', async () => {
  const m = await monter({ 'a.txt': 'a' }, { 'a.txt': B('a') }, { tronque: true });
  try { assert.match((await m.gh.comparer()).erreur, /trop gros/); } finally { await m.fin(); }
});

// ---------- envoi ----------
test('envoyer : seuls les fichiers differents partent, en un seul enregistrement, la branche avance sans force, les autres fichiers de GitHub restent', async () => {
  const local = {}, distant = {};
  for (let i = 0; i < 250; i++) { local['modules/comprendre-le-cadre/contenu/emploi/f' + i + '.md'] = 'version ' + i + (i < 240 ? '' : ' modifiee'); }
  for (let i = 0; i < 240; i++) { distant['modules/comprendre-le-cadre/contenu/emploi/f' + i + '.md'] = B('version ' + i); }   // 240 identiques, 10 nouveaux
  local['data/lexique.js'] = 'lexique v2'; distant['data/lexique.js'] = B('lexique v1');
  distant['LISEZ.md'] = B('uniquement sur GitHub');
  const m = await monter(local, distant);
  try {
    const avantTete = m.faux.teteActuelle();
    const r = await m.gh.envoyer(undefined, 'Essai de mise a jour');
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.nbFichiers, 11);   // 10 nouveaux + lexique
    assert.match(r.adresse, /^https:\/\/github\.com\/denis\/app\/commit\/[0-9a-f]{40}$/);
    const arbres = m.faux.journal.filter((j) => j.methode === 'POST' && /git\/trees$/.test(j.chemin));
    assert.strictEqual(arbres.length, 1);
    assert.strictEqual(arbres[0].corps.tree.length, 11, 'seuls les 11 fichiers differents sont envoyes');
    const patch = m.faux.journal.find((j) => j.methode === 'PATCH');
    assert.strictEqual(patch.corps.force, false);
    assert.ok(!m.faux.journal.some((j) => j.methode === 'DELETE'));
    const commit = m.faux.commit(m.faux.teteActuelle());
    assert.deepStrictEqual(commit.parents, [avantTete]);
    assert.strictEqual(commit.message, 'Essai de mise a jour');
    const final = m.faux.arbreActuel();
    assert.strictEqual(final['data/lexique.js'].toString(), 'lexique v2');
    assert.strictEqual(final['LISEZ.md'].toString(), 'uniquement sur GitHub');
    assert.strictEqual(final['modules/comprendre-le-cadre/contenu/emploi/f245.md'].toString(), 'version 245 modifiee');
    assert.strictEqual(final['modules/comprendre-le-cadre/contenu/emploi/f3.md'].toString(), 'version 3');
    // idempotence : une seconde comparaison ne trouve plus rien, un second envoi non plus
    assert.strictEqual((await m.gh.comparer()).nbDifferents, 0);
    assert.ok((await m.gh.envoyer()).rien);
  } finally { await m.fin(); }
});

test('envoyer : plus de 100 fichiers sont envoyes par paquets d\'arbres, un seul enregistrement final', async () => {
  const local = {}; for (let i = 0; i < 230; i++) { local['docs/f' + i + '.md'] = 'x' + i; }
  const m = await monter(local, { 'docs/f0.md': B('x0') });
  try {
    const r = await m.gh.envoyer();
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.nbFichiers, 229);
    assert.strictEqual(m.faux.journal.filter((j) => j.methode === 'POST' && /git\/trees$/.test(j.chemin)).length, 3);
    assert.strictEqual(m.faux.journal.filter((j) => j.methode === 'POST' && /git\/commits$/.test(j.chemin)).length, 1);
    assert.strictEqual(Object.keys(m.faux.arbreActuel()).length, 230);
  } finally { await m.fin(); }
});

test('envoyer : un fichier binaire passe par l\'envoi de contenu en base 64, intact', async () => {
  const binaire = Buffer.from([0, 1, 2, 3, 255, 254, 0, 128, 200]);
  const d = depotLocal({ 'a.txt': 'a' });
  const faux = fauxGithub(); faux.init({ 'a.txt': B('a') });
  const base = await faux.demarrer(); const cfg = configTemp();
  try {
    fs.writeFileSync(path.join(d, 'image.png'), binaire); git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'image');
    const gh = creerGithub(d, { apiBase: base, fichierConfig: cfg });
    gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: JETON });
    const r = await gh.envoyer();
    assert.ok(r.ok, JSON.stringify(r));
    assert.ok(faux.journal.some((j) => j.methode === 'POST' && /git\/blobs$/.test(j.chemin) && j.corps.encoding === 'base64'));
    assert.ok(faux.arbreActuel()['image.png'].equals(binaire));
  } finally { await faux.fermer(); nettoyer(d); nettoyer(path.dirname(path.dirname(cfg))); }
});

test('envoyer : le filtre par groupe n\'envoie que le groupe choisi', async () => {
  const m = await monter({ 'modules/comprendre-le-cadre/contenu/e/A.md': 'a2', 'data/lexique.js': 'l2', 'js/app.js': 'app2' }, { 'modules/comprendre-le-cadre/contenu/e/A.md': B('a'), 'data/lexique.js': B('l'), 'js/app.js': B('app') });
  try {
    const r = await m.gh.envoyer(['lexique']);
    assert.strictEqual(r.nbFichiers, 1);
    const f = m.faux.arbreActuel();
    assert.strictEqual(f['data/lexique.js'].toString(), 'l2');
    assert.strictEqual(f['js/app.js'].toString(), 'app');
    assert.strictEqual(f['modules/comprendre-le-cadre/contenu/e/A.md'].toString(), 'a');
  } finally { await m.fin(); }
});

test('envoyer : si GitHub a avance pendant l\'envoi, la branche n\'est pas modifiee et le message est clair', async () => {
  const m = await monter({ 'a.txt': 'a2' }, { 'a.txt': B('a') }, { avancerAvantPatch: null });
  try {
    m.faux.opt.avancerAvantPatch = () => m.faux.avancer();
    const r = await m.gh.envoyer();
    assert.ok(!r.ok);
    assert.match(r.erreur, /GitHub a change pendant l'envoi/);
    assert.strictEqual(m.faux.arbreActuel()['a.txt'].toString(), 'a', 'rien n\'est ecrase');
  } finally { await m.fin(); }
});

test('envoyer : un jeton refuse n\'envoie rien ; un fichier en cours de travail ne part jamais (seule la version enregistree)', async () => {
  const m = await monter({ 'a.txt': 'enregistre' }, { 'a.txt': B('ancien') });
  try {
    fs.writeFileSync(path.join(m.d, 'a.txt'), 'brouillon pas fini');
    const cmp = await m.gh.comparer();
    assert.strictEqual(cmp.modificationsNonEnregistrees, 1);
    const r = await m.gh.envoyer();
    assert.ok(r.ok);
    assert.strictEqual(m.faux.arbreActuel()['a.txt'].toString(), 'enregistre');
    m.gh.ecrireConfig({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: 'github_pat_' + 'Z9y8X7w6V5'.repeat(4) });
    const avant = m.faux.journal.filter((j) => j.methode !== 'GET').length;
    assert.ok(!(await m.gh.envoyer()).ok);
    assert.strictEqual(m.faux.journal.filter((j) => j.methode !== 'GET').length, avant);
  } finally { await m.fin(); }
});

test('le code ne force jamais, ne supprime jamais, ne contacte que api.github.com par defaut', () => {
  // (l'option « force » de la suppression du fichier de configuration local, rmSync, n'a rien a voir avec GitHub : on la retire du texte controle)
  const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veilleGithub.js'), 'utf8').replace(/rmSync\([^)]*\)/g, 'rmSync()');
  assert.ok(src.indexOf('force: false') !== -1);
  assert.ok(!/force: true|'DELETE'|"DELETE"|(^|[^.\w])exec\(|execSync|shell\s*:\s*true/.test(src));
  assert.strictEqual((src.match(/api\.github\.com/g) || []).length >= 1, true);
  assert.match(src, /const API_GITHUB = 'https:\/\/api\.github\.com';/);
});
