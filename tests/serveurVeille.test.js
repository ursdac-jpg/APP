const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { demarrer } = require('../outils/serveur_veille.js');

// Demarre le serveur sur un port libre choisi par le systeme (127.0.0.1) et rend { port, jeton, fermer }.
function lancer(options) {
  return new Promise((resolve, reject) => {
    demarrer(0, (erreur, serveur) => {
      if (erreur) { return reject(erreur); }
      resolve({ serveur, port: serveur.address().port, jeton: serveur.jetonDeLancement, fermer: () => new Promise((r) => serveur.close(r)) });
    }, undefined, options);
  });
}
function requete(port, chemin, options, corps) {
  const o = Object.assign({ host: '127.0.0.1', port, path: chemin, method: 'GET' }, options || {});
  return new Promise((resolve, reject) => {
    const r = http.request(o, (res) => {
      const morceaux = [];
      res.on('data', (c) => morceaux.push(c));
      res.on('end', () => resolve({ code: res.statusCode, entetes: res.headers, corps: Buffer.concat(morceaux) }));
    });
    r.on('error', reject);
    if (corps !== undefined) { r.write(corps); }
    r.end();
  });
}
const HTML = path.join(__dirname, '..', 'outils', 'veille.html');
const sansJeton = (buf) => buf.toString('utf8').replace(/<meta name="veille-jeton" content="[0-9a-f]+">\n/, '');

// Faux depot et faux envoi : on teste le serveur, pas l'ecriture (couverte par veilleDepot.test.js et veilleEnvoi.test.js).
function faux() {
  const appels = [];
  return {
    appels,
    depot: { publier: (f, o) => { appels.push(['publier', f, o]); return { ok: true, vu: f }; }, listerLiens: () => { appels.push(['liens']); return { ok: true, liens: [], aujourdhui: '2026-10-07' }; }, annuler: () => { appels.push(['annuler']); return { ok: true }; }, etat: () => ({ branche: 'master', modifications: 0, annulable: false }) },
    envoi: { etat: (d) => ({ ok: true, depuis: d }), preparer: (d) => { appels.push(['preparer', d]); return { ok: true }; }, marquerEnvoye: () => { appels.push(['marquer']); return { ok: true }; }, dossier: () => 'C:\\dossier-fixe\\A_envoyer_sur_GitHub' },
    ouvrir: (c) => { appels.push(['ouvrir', c]); }
  };
}
const json = (o) => JSON.stringify(o);
const entetesJson = (jeton) => ({ 'Content-Type': 'application/json', 'X-Veille-Jeton': jeton });

test('serveur de veille : n\'ecoute que sur 127.0.0.1', async () => {
  const s = await lancer();
  try { assert.strictEqual(s.serveur.address().address, '127.0.0.1'); } finally { await s.fermer(); }
});

test('serveur de veille : sert l\'outil (avec son jeton) et sa base, identiques aux fichiers du dossier', async () => {
  const s = await lancer();
  try {
    const page = await requete(s.port, '/veille.html');
    assert.strictEqual(page.code, 200);
    assert.match(page.entetes['content-type'], /text\/html/);
    assert.strictEqual(sansJeton(page.corps), fs.readFileSync(HTML, 'utf8'));
    assert.ok(page.corps.toString('utf8').indexOf('<meta name="veille-jeton" content="' + s.jeton + '">') !== -1);
    const racine = await requete(s.port, '/');
    assert.strictEqual(racine.code, 200);
    const base = await requete(s.port, '/base_fiches.js');
    assert.strictEqual(base.code, 200);
    assert.match(base.entetes['content-type'], /javascript/);
    assert.ok(base.corps.toString('utf8').indexOf(s.jeton) === -1, 'le jeton n\'est ecrit que dans la page');
  } finally { await s.fermer(); }
});

test('serveur de veille : chaque lancement tire son propre jeton', async () => {
  const a = await lancer(), b = await lancer();
  try { assert.notStrictEqual(a.jeton, b.jeton); assert.ok(/^[0-9a-f]{48}$/.test(a.jeton)); } finally { await a.fermer(); await b.fermer(); }
});

test('serveur de veille : aucun autre fichier n\'est servi (dossier parent, fichiers de l\'application, noms detournes)', async () => {
  const s = await lancer();
  try {
    for (const chemin of ['/package.json', '/../package.json', '/%2e%2e/package.json', '/..%2fpackage.json', '/index.html', '/modules/comprendre-le-cadre/index.js', '/serveur_veille.js', '/veilleDepot.js', '/veilleEnvoi.js',
      '/Lancer%20l\'outil%20de%20veille.bat', '/veille.html/../../package.json', '/outils/veille.html', '/base_fiches.js/..', '/%00', '//etc/passwd']) {
      const r = await requete(s.port, chemin);
      assert.ok(r.code === 404 || r.code === 400, chemin + ' : ' + r.code);
      assert.ok(!/"name"\s*:\s*"assistantia-mlb"/.test(r.corps.toString('utf8')), chemin + ' ne doit rien reveler');
    }
  } finally { await s.fermer(); }
});

test('serveur de veille : la partie « ? » de l\'adresse n\'a aucune influence sur le fichier servi', async () => {
  const s = await lancer();
  try {
    const r = await requete(s.port, '/veille.html?fichier=../package.json');
    assert.strictEqual(r.code, 200);
    assert.strictEqual(sansJeton(r.corps), fs.readFileSync(HTML, 'utf8'));
  } finally { await s.fermer(); }
});

test('serveur de veille : refuse PUT, DELETE, PATCH, OPTIONS, et POST hors de /api ; HEAD reste permis', async () => {
  const s = await lancer();
  try {
    for (const m of ['PUT', 'DELETE', 'PATCH', 'OPTIONS']) {
      const r = await requete(s.port, '/veille.html', { method: m });
      assert.strictEqual(r.code, 405, m);
    }
    assert.strictEqual((await requete(s.port, '/veille.html', { method: 'POST' }, '{}')).code, 405);
    assert.strictEqual((await requete(s.port, '/base_fiches.js', { method: 'POST' }, '{}')).code, 405);
    const tete = await requete(s.port, '/veille.html', { method: 'HEAD' });
    assert.strictEqual(tete.code, 200);
    assert.strictEqual(tete.corps.length, 0);
  } finally { await s.fermer(); }
});

test('serveur de veille : refuse une requete dont l\'adresse n\'est pas locale (protection contre un site web tiers)', async () => {
  const s = await lancer();
  try {
    for (const hote of ['evil.example.com', 'evil.example.com:' + s.port, '127.0.0.1.evil.com', 'localhost.evil.com', '192.168.1.10:' + s.port]) {
      const r = await requete(s.port, '/veille.html', { headers: { Host: hote } });
      assert.strictEqual(r.code, 403, 'Host « ' + hote + ' »');
      const p = await requete(s.port, '/api/publier', { method: 'POST', headers: Object.assign({ Host: hote }, entetesJson(s.jeton)) }, '{}');
      assert.strictEqual(p.code, 403, 'POST, Host « ' + hote + ' »');
    }
    const ok = await requete(s.port, '/veille.html', { headers: { Host: 'localhost:' + s.port } });
    assert.strictEqual(ok.code, 200);
  } finally { await s.fermer(); }
});

test('serveur de veille : la reponse d\'etat est la seule route GET d\'API et ne revele rien du dossier', async () => {
  const s = await lancer();
  try {
    const r = await requete(s.port, '/api/etat');
    assert.strictEqual(r.code, 200);
    const j = JSON.parse(r.corps.toString('utf8'));
    assert.deepStrictEqual(Object.keys(j).sort(), ['serveur', 'version']);
    for (const c of ['/api/autre', '/api/publier', '/api/envoi/preparer', '/api/annuler']) { assert.strictEqual((await requete(s.port, c)).code, 404, c); }
  } finally { await s.fermer(); }
});

test('API : un POST sans jeton, avec un mauvais jeton, d\'une autre origine ou sans JSON est refuse, et rien n\'est appele', async () => {
  const f = faux();
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    const corps = json({ fichiers: [{ type: 'balayage', nom: '2026-09.md', texte: 'x' }] });
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, corps)).code, 403);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: entetesJson('0'.repeat(48)) }, corps)).code, 403);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: entetesJson('') }, corps)).code, 403);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: Object.assign({ Origin: 'https://evil.example.com' }, entetesJson(s.jeton)) }, corps)).code, 403);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: Object.assign({ Origin: 'null' }, entetesJson(s.jeton)) }, corps)).code, 403);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: { 'Content-Type': 'text/plain', 'X-Veille-Jeton': s.jeton } }, corps)).code, 415);
    assert.deepStrictEqual(f.appels, []);
  } finally { await s.fermer(); }
});

test('API : avec le bon jeton, la publication, l\'annulation et les lots sont transmis tels quels aux modules', async () => {
  const f = faux();
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    const h = entetesJson(s.jeton);
    const fichiers = [{ type: 'balayage', nom: '2026-09.md', texte: 'x' }];
    const r = await requete(s.port, '/api/publier', { method: 'POST', headers: Object.assign({ Origin: 'http://127.0.0.1:' + s.port }, h) }, json({ fichiers }));
    assert.strictEqual(r.code, 200);
    assert.deepStrictEqual(JSON.parse(r.corps.toString('utf8')), { ok: true, vu: fichiers });
    assert.strictEqual((await requete(s.port, '/api/annuler', { method: 'POST', headers: h }, '{}')).code, 200);
    assert.strictEqual((await requete(s.port, '/api/envoi/preparer', { method: 'POST', headers: h }, json({ depuis: '2026-09-01' }))).code, 200);
    assert.strictEqual((await requete(s.port, '/api/envoi/marquer', { method: 'POST', headers: h }, '')).code, 200);
    assert.strictEqual((await requete(s.port, '/api/inconnue', { method: 'POST', headers: h }, '{}')).code, 404);
    assert.deepStrictEqual(f.appels.map((a) => a[0]), ['publier', 'annuler', 'preparer', 'marquer']);
    assert.strictEqual(f.appels[2][1], '2026-09-01');
  } finally { await s.fermer(); }
});

test('API : la liste des adresses est reservee au bon jeton, et la confirmation de remplacement d\'un mot n\'est transmise que si elle est explicite', async () => {
  const f = faux();
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    assert.strictEqual((await requete(s.port, '/api/liens/lister', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, '{}')).code, 403);
    assert.strictEqual((await requete(s.port, '/api/liens/lister')).code, 404, 'pas de GET');
    assert.deepStrictEqual(f.appels, []);
    const l = await requete(s.port, '/api/liens/lister', { method: 'POST', headers: entetesJson(s.jeton) }, '{}');
    assert.strictEqual(l.code, 200);
    assert.deepStrictEqual(JSON.parse(l.corps.toString('utf8')), { ok: true, liens: [], aujourdhui: '2026-10-07' });
    const h = entetesJson(s.jeton);
    await requete(s.port, '/api/publier', { method: 'POST', headers: h }, json({ fichiers: [], remplacerExistants: 'oui' }));
    await requete(s.port, '/api/publier', { method: 'POST', headers: h }, json({ fichiers: [] }));
    const pubs = f.appels.filter((a) => a[0] === 'publier');
    assert.deepStrictEqual(pubs.map((a) => a[2]), [{ remplacerExistants: true }, { remplacerExistants: false }]);
  } finally { await s.fermer(); }
});

test('API : « ouvrir le dossier » n\'utilise JAMAIS un chemin envoye par la requete', async () => {
  const f = faux();
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    const r = await requete(s.port, '/api/envoi/ouvrir', { method: 'POST', headers: entetesJson(s.jeton) }, json({ dossier: 'C:\\Windows', chemin: 'C:\\', cible: '..\\..' }));
    assert.strictEqual(r.code, 200);
    assert.deepStrictEqual(f.appels, [['ouvrir', 'C:\\dossier-fixe\\A_envoyer_sur_GitHub']]);
  } finally { await s.fermer(); }
});

test('API : un corps trop gros ou un JSON invalide est refuse', async () => {
  const f = faux();
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    const h = entetesJson(s.jeton);
    assert.strictEqual((await requete(s.port, '/api/publier', { method: 'POST', headers: h }, '{pas du json')).code, 400);
    let code = 0;
    try { code = (await requete(s.port, '/api/publier', { method: 'POST', headers: h }, '"' + 'x'.repeat(6 * 1024 * 1024 + 10) + '"')).code; } catch (e) { code = 413; /* connexion coupee par le serveur */ }
    assert.strictEqual(code, 413);
    assert.deepStrictEqual(f.appels, []);
  } finally { await s.fermer(); }
});

test('API : une erreur interne d\'un module est renvoyee proprement, sans arreter le serveur', async () => {
  const f = faux();
  f.depot.publier = () => { throw new Error('boum'); };
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir });
  try {
    const r = await requete(s.port, '/api/publier', { method: 'POST', headers: entetesJson(s.jeton) }, '{}');
    assert.strictEqual(r.code, 500);
    assert.strictEqual((await requete(s.port, '/api/etat')).code, 200);
  } finally { await s.fermer(); }
});

test('API GitHub : les routes sont transmises au module, le jeton ne ressort jamais, un module en erreur ne casse pas le serveur', async () => {
  const f = faux();
  const JETON = 'github_pat_' + 'A1b2C3d4E5'.repeat(4);
  const github = {
    etatConfig: () => ({ ok: true, configure: true, proprietaire: 'denis', depot: 'app', branche: 'main', jetonFin: JETON.slice(-4) }),
    ecrireConfig: (d) => { f.appels.push(['config', d.proprietaire]); return { ok: true, configure: true, jetonFin: String(d.jeton).slice(-4) }; },
    tester: async () => ({ ok: true, depot: 'denis/app' }),
    comparer: async (g) => { f.appels.push(['comparer', g]); return { ok: true, nbDifferents: 2 }; },
    envoyer: async (g, m) => { f.appels.push(['envoyer', g, m]); return { ok: true, nbFichiers: 2 }; }
  };
  const s = await lancer({ depot: f.depot, envoi: f.envoi, ouvrir: f.ouvrir, github });
  try {
    const h = entetesJson(s.jeton);
    const config = await requete(s.port, '/api/github/config', { method: 'POST', headers: h }, json({ proprietaire: 'denis', depot: 'app', branche: 'main', jeton: JETON }));
    assert.strictEqual(config.code, 200);
    assert.ok(config.corps.toString('utf8').indexOf(JETON) === -1, 'le jeton ne doit jamais etre renvoye');
    assert.ok((await requete(s.port, '/api/github/etat', { method: 'POST', headers: h }, '{}')).corps.toString('utf8').indexOf(JETON) === -1);
    assert.deepStrictEqual(JSON.parse((await requete(s.port, '/api/github/tester', { method: 'POST', headers: h }, '{}')).corps.toString('utf8')), { ok: true, depot: 'denis/app' });
    assert.strictEqual((await requete(s.port, '/api/github/comparer', { method: 'POST', headers: h }, json({ groupes: ['cadre'] }))).code, 200);
    assert.strictEqual((await requete(s.port, '/api/github/envoyer', { method: 'POST', headers: h }, json({ groupes: ['lexique'], message: 'm' }))).code, 200);
    assert.deepStrictEqual(f.appels, [['config', 'denis'], ['comparer', ['cadre']], ['envoyer', ['lexique'], 'm']]);
    // sans jeton de page : refuse, rien n'est appele
    assert.strictEqual((await requete(s.port, '/api/github/envoyer', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, '{}')).code, 403);
    assert.strictEqual(f.appels.length, 3);
    // un module qui echoue (promesse rejetee) : 500 propre, le serveur continue
    github.envoyer = async () => { throw new Error('boum'); };
    assert.strictEqual((await requete(s.port, '/api/github/envoyer', { method: 'POST', headers: h }, '{}')).code, 500);
    assert.strictEqual((await requete(s.port, '/api/etat')).code, 200);
  } finally { await s.fermer(); }
});

test('serveur de veille : il n\'ecrit rien lui-meme (l\'ecriture est dans les modules a listes fermees) et n\'ouvre que la fenetre du navigateur', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'serveur_veille.js'), 'utf8');
  assert.ok(!/writeFile|appendFile|createWriteStream|unlink|rmSync|rename|mkdir|execSync|(^|[^.\w])exec\(|execFile|fork\(|'push'/.test(src), 'aucune ecriture ni execution attendue');
  assert.strictEqual((src.match(/spawn\(/g) || []).length, 1);
});

test('lanceur : un fichier .bat distinct, sans toucher a « Mettre a jour la base »', () => {
  const dossier = path.join(__dirname, '..', 'outils');
  const bats = fs.readdirSync(dossier).filter((f) => /\.bat$/i.test(f));
  assert.ok(bats.indexOf('Lancer l\'outil de veille.bat') !== -1);
  assert.ok(bats.indexOf('Mettre a jour la base de l\'outil de veille.bat') !== -1);
  const bat = fs.readFileSync(path.join(dossier, 'Lancer l\'outil de veille.bat'), 'utf8');
  assert.match(bat, /serveur_veille\.js/);
  // jamais de tiret cadratin ni demi-cadratin (codes construits ici pour ne pas ecrire le caractere lui-meme)
  assert.ok(bat.indexOf(String.fromCharCode(0x2013)) === -1 && bat.indexOf(String.fromCharCode(0x2014)) === -1);
});
