'use strict';
// Contrôle automatique des cartes du sas des employeurs : lecture du contenu des pages, preuves, garde-fous, tâche de fond. Aucun accès à Internet (faux réseau).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const C = require('../outils/veilleControle.js');
const { creerControleSas, tachesDeCarte, verdictDe, resume } = require('../outils/veilleControleSas.js');

const PUBLIC = function () { return Promise.resolve([{ address: '93.184.216.34' }]); };
function page(corps, extra) { return new Response(corps, Object.assign({ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }, extra || {})); }
function reseau(table) {
  const appels = [];
  const f = function (url) {
    appels.push(String(url));
    const r = table[String(url)];
    if (r instanceof Error) { return Promise.reject(r); }
    if (typeof r === 'function') { return Promise.resolve(r()); }
    if (!r) { return Promise.resolve(new Response('', { status: 404 })); }
    // Une réponse neuve à chaque appel (un même objet ne se lit qu'une fois, et annuler la lecture d'une copie attendrait l'autre copie).
    return r.clone().text().then(function (texte) { return new Response(texte, { status: r.status, headers: r.headers }); });
  };
  f.appels = appels;
  return f;
}

test('ipPrivee : refuse les adresses locales, privées, de liaison locale et réservées ; accepte une adresse publique', () => {
  ['127.0.0.1', '10.1.2.3', '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.1.1', '100.64.0.1', '0.0.0.0', '224.0.0.1', '::1', 'fd00::1', 'fe80::1', '::ffff:127.0.0.1', 'pas une ip'].forEach((ip) => assert.strictEqual(C.ipPrivee(ip), true, ip));
  ['93.184.216.34', '8.8.8.8', '172.32.0.1', '2606:2800:220:1:248:1893:25c8:1946'].forEach((ip) => assert.strictEqual(C.ipPrivee(ip), false, ip));
});

test('analyserHtml : titre décodé, texte sans scripts ni styles, numéros des liens tel: et des données structurées retrouvés', () => {
  const p = C.analyserHtml('<html><head><title>Secaut &amp; Fils &#233;lectricit&eacute;</title><style>.a{color:red}</style><script>var tel="0100000000"</script>'
    + '<script type="application/ld+json">{"@type":"Store","telephone":"+33 5 53 11 22 33"}</script></head><body><h1>Bienvenue</h1><a href="tel:+33553445566">Appelez</a><p>Bergerac, Dordogne</p></body></html>');
  assert.strictEqual(p.titre, 'Secaut & Fils électricité');
  assert.ok(p.normTexte.indexOf('bienvenue') !== -1 && p.normTexte.indexOf('color') === -1 && p.normTexte.indexOf('var tel') === -1);
  assert.ok(p.chiffres.indexOf('553112233') !== -1, 'numéro des données structurées');
  assert.ok(p.chiffres.indexOf('553445566') !== -1, 'numéro du lien tel:');
  assert.ok(p.chiffres.indexOf('0100000000') === -1, 'rien venu d\'un script');
});

test('preuvesDePage : nom dans le titre ou la page, commune, numéros en toutes écritures (05..., +33 5..., 0033 5...)', () => {
  const p = C.analyserHtml('<title>Boulangerie Dupont Bergerac</title><body>Contactez-nous au 05 53 00 00 01 ou au +33 5 53 00 00 02. Nous sommes à Bergerac.</body>');
  const r = C.preuvesDePage(p, { nom: 'Boulangerie Dupont', commune: 'Bergerac', numeros: ['05.53.00.00.01', '0033 5 53 00 00 02', '05 53 99 99 99', ''] });
  assert.strictEqual(r.nomTitre, true); assert.strictEqual(r.nomPage, true); assert.strictEqual(r.communeTrouvee, true);
  assert.deepStrictEqual(r.numeros.map((x) => x.trouve), [true, true, false, false]);
  const autre = C.preuvesDePage(p, { nom: 'Garage Martin', commune: 'Limoges', numeros: [] });
  assert.strictEqual(autre.nomTitre, false); assert.strictEqual(autre.nomPage, false); assert.strictEqual(autre.communeTrouvee, false);
  assert.strictEqual(C.preuvesDePage(null, {}), null);
  assert.strictEqual(C.preuvesDePage(p, { nom: 'Les Magasin', commune: '', numeros: [] }).nomPage, false, 'les mots banals ne comptent pas');
  assert.strictEqual(C.preuvesDePage(p, { nom: 'X', commune: '', numeros: [] }).communeTrouvee, null, 'sans commune : pas de preuve');
});

test('lireEtClasser : répond (avec la page), mène ailleurs, refuse les robots, n\'existe plus, nom de domaine introuvable, pas de réponse', async () => {
  const f = reseau({
    'https://a.fr/': page('<title>A</title>'),
    'https://b.fr/': new Response('', { status: 301, headers: { location: 'https://autre-site.com/' } }),
    'https://autre-site.com/': page('<title>Autre</title>'),
    'https://c.fr/': new Response('', { status: 403 }),
    'https://d.fr/': new Response('', { status: 404 }),
    'https://e.fr/': new Response('', { status: 500 })
  });
  const o = { fetch: f, resoudre: PUBLIC };
  assert.strictEqual((await C.lireEtClasser('https://a.fr/', o)).etat, 'repond');
  assert.strictEqual((await C.lireEtClasser('https://a.fr/', o)).page.titre, 'A');
  const b = await C.lireEtClasser('https://b.fr/', o); assert.strictEqual(b.etat, 'ailleurs'); assert.match(b.finale, /autre-site/);
  assert.strictEqual((await C.lireEtClasser('https://c.fr/', o)).etat, 'refuse');
  assert.strictEqual((await C.lireEtClasser('https://d.fr/', o)).etat, 'absente');
  assert.strictEqual((await C.lireEtClasser('https://e.fr/', o)).etat, 'sans-reponse');
  const dnsAbsent = () => Promise.reject(Object.assign(new Error('introuvable'), { code: 'ENOTFOUND' }));
  const inconnu = await C.lireEtClasser('https://inexistant.fr/', { fetch: f, resoudre: dnsAbsent });
  assert.strictEqual(inconnu.etat, 'absente'); assert.match(inconnu.detail, /n.existe pas/);
  const delai = await C.lireEtClasser('https://a.fr/', { fetch: () => Promise.reject(Object.assign(new Error('délai'), { name: 'TimeoutError' })), resoudre: PUBLIC });
  assert.strictEqual(delai.etat, 'sans-reponse');
});

test('garde-fous : une redirection vers un site privé, local ou en http n\'est JAMAIS suivie ; un nom qui pointe vers une adresse privée n\'est jamais ouvert', async () => {
  const f = reseau({
    'https://piege.fr/': new Response('', { status: 302, headers: { location: 'https://interne.exemple/secret' } }),
    'https://interne.exemple/secret': page('<title>Données internes</title>'),
    'https://piege2.fr/': new Response('', { status: 302, headers: { location: 'http://exemple.fr/' } }),
    'https://piege3.fr/': new Response('', { status: 302, headers: { location: 'https://127.0.0.1:8791/' } }),
    'https://nom-prive.fr/': page('<title>Interne</title>')
  });
  const resoudre = (h) => Promise.resolve([{ address: h === 'interne.exemple' || h === 'nom-prive.fr' ? '10.0.0.5' : '93.184.216.34' }]);
  const o = { fetch: f, resoudre: resoudre };
  const r1 = await C.lireEtClasser('https://piege.fr/', o); assert.strictEqual(r1.etat, 'sans-reponse'); assert.ok(!r1.page);
  assert.ok(f.appels.indexOf('https://interne.exemple/secret') === -1, 'le site interne n\'a jamais été ouvert');
  const r2 = await C.lireEtClasser('https://piege2.fr/', o); assert.strictEqual(r2.etat, 'ailleurs'); assert.ok(!r2.page);
  const r3 = await C.lireEtClasser('https://piege3.fr/', o); assert.strictEqual(r3.etat, 'sans-reponse');
  assert.ok(f.appels.indexOf('https://127.0.0.1:8791/') === -1);
  const r4 = await C.lireEtClasser('https://nom-prive.fr/', o); assert.strictEqual(r4.etat, 'sans-reponse');
  assert.ok(f.appels.indexOf('https://nom-prive.fr/') === -1, 'une adresse qui résout vers un réseau privé n\'est pas ouverte');
});

test('garde-fous : la lecture est plafonnée, trop de redirections sont refusées, un fichier non texte n\'est pas lu', async () => {
  const gros = 'x'.repeat(C.TAILLE_MAX_LECTURE * 3);
  const p = await C.lirePage('https://gros.fr/', { fetch: reseau({ 'https://gros.fr/': page('<title>Gros</title>' + gros) }), resoudre: PUBLIC });
  assert.ok(p.html.length <= C.TAILLE_MAX_LECTURE, 'au plus 500 Ko lus : ' + p.html.length);
  const boucle = reseau({ 'https://boucle.fr/': new Response('', { status: 302, headers: { location: 'https://boucle.fr/' } }) });
  const b = await C.lireEtClasser('https://boucle.fr/', { fetch: () => Promise.resolve(new Response('', { status: 302, headers: { location: 'https://boucle.fr/' } })), resoudre: PUBLIC });
  assert.strictEqual(b.etat, 'sans-reponse'); assert.match(b.detail, /redirections/);
  const pdf = await C.lireEtClasser('https://pdf.fr/', { fetch: reseau({ 'https://pdf.fr/': new Response('%PDF-1.4', { status: 200, headers: { 'content-type': 'application/pdf' } }) }), resoudre: PUBLIC });
  assert.strictEqual(pdf.etat, 'repond'); assert.ok(!pdf.page, 'un fichier non texte n\'est pas lu');
  void boucle;
});

test('tachesDeCarte : adresses https seulement, numéros de la carte et des magasins', () => {
  const t = tachesDeCarte({ id: 'u-1', nom: 'U', valeurs: { nom: 'Super U', site: 'http://pas-https.fr', recrutement: 'https://r.fr/', telephone: '05 53 00 00 00' }, etabs: [{ commune: 'Nontron', adresse: '', telephone: '05 53 11 11 11' }, { commune: 'Terrasson', adresse: '', telephone: '' }] });
  assert.deepStrictEqual({ site: t.site, recrutement: t.recrutement, commune: t.commune, numeros: t.numeros }, { site: '', recrutement: 'https://r.fr/', commune: 'Nontron', numeros: ['05 53 00 00 00', '05 53 11 11 11'] });
});

test('verdictDe : « complet » seulement si le site répond avec le nom, la page de recrutement répond ET chaque numéro est retrouvé ; sinon « partiel » ou « main », avec le motif', () => {
  const ok = { site: { url: 'https://a.fr', etat: 'repond', nomTitre: true }, numeros: [{ numero: '05', trouve: true }] };
  assert.deepStrictEqual(verdictDe(ok), { verdict: 'complet', motif: '' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'repond', nomPage: true }, recrutement: { etat: 'repond' }, numeros: [] }), { verdict: 'complet', motif: '' }, 'aucun numéro à vérifier');
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'repond', nomTitre: true }, numeros: [{ numero: '05', trouve: false }] }), { verdict: 'partiel', motif: 'numero' }, 'un numéro non retrouvé : jamais « complet »');
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'repond', nomTitre: true }, numeros: [{ numero: '05', trouve: true }, { numero: '06', trouve: false }] }), { verdict: 'partiel', motif: 'numero' }, 'un seul numéro manquant suffit');
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'repond', nomPage: true }, recrutement: { etat: 'absente' }, numeros: [] }), { verdict: 'partiel', motif: 'recrutement' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'repond' }, numeros: [] }), { verdict: 'main', motif: 'nom' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'refuse' } }), { verdict: 'main', motif: 'refuse' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'absente' } }), { verdict: 'main', motif: 'introuvable' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'ailleurs' } }), { verdict: 'main', motif: 'ailleurs' });
  assert.deepStrictEqual(verdictDe({ site: { url: 'https://a.fr', etat: 'sans-reponse' } }), { verdict: 'main', motif: 'sans-reponse' });
  assert.deepStrictEqual(verdictDe({ site: { url: '', etat: 'absente' } }), { verdict: 'main', motif: 'sans-site' });
});

test('liensContact et liensRecrutement : mêmes site ou domaine seulement, https, jamais un fichier ni un mailto, les plus probables d\'abord', () => {
  const html = '<a href="/contact">Nous contacter</a><a href="https://autre.fr/contact">x</a><a href="mailto:a@b.fr">Contact</a><a href="/nous-contacter.pdf">contact</a><a href="/magasin/contact-bergerac">Bergerac</a><a href="/mentions">Mentions</a>'
    + '<a href="/offres">Nos offres d\'emploi</a><a href="https://careers.exemple.fr/">Rejoignez-nous</a><a href="/carrieres/recrutement">Carrières</a><a href="https://jobs.autre-groupe.com/">Recrutement</a><a href="http://exemple.fr/recrutement">Recrutement</a>';
  assert.deepStrictEqual(C.liensContact(html, 'https://www.exemple.fr/'), ['https://www.exemple.fr/contact', 'https://www.exemple.fr/magasin/contact-bergerac']);
  const r = C.liensRecrutement(html, 'https://www.exemple.fr/');
  assert.strictEqual(r[0].url, 'https://www.exemple.fr/carrieres/recrutement', 'le plus probable d\'abord');
  assert.ok(r.some((x) => x.url === 'https://careers.exemple.fr/'), 'un sous-domaine du même domaine est accepté');
  assert.ok(!r.some((x) => /autre-groupe|^http:/.test(x.url)), 'ni un autre domaine, ni http');
  assert.ok(r.length <= 4);
  const faux = C.liensRecrutement('<a href="/services/remploi-recyclage">Remploi et recyclage</a><a href="/emploi">Emploi</a><a href="/nos-emplois">Nos emplois</a>', 'https://www.exemple.fr/').map((x) => x.url);
  assert.deepStrictEqual(faux, ['https://www.exemple.fr/emploi', 'https://www.exemple.fr/nos-emplois'], '« remploi » ne compte pas comme « emploi »');
});

test('lecture d\'un site : la page « Contact » est lue aussi (numéro retrouvé), les pages de recrutement TROUVÉES sont proposées si elles répondent, sans changer l\'état de l\'adresse', async () => {
  const f = reseau({
    'https://exemple.fr/': page('<title>Exemple</title><a href="/contact">Contact</a><a href="/recrutement">Recrutement</a><a href="/morte">Carrières</a>'),
    'https://exemple.fr/contact': page('<p>Appelez le 05 53 00 00 09</p>'),
    'https://exemple.fr/recrutement': page('<title>Recrutement Exemple</title>'),
    'https://exemple.fr/morte': new Response('', { status: 404 })
  });
  const s = await C.lireEtClasser('https://exemple.fr/', { fetch: f, resoudre: PUBLIC });
  assert.strictEqual(s.etat, 'repond');
  assert.deepStrictEqual(s.pagesContact, ['https://exemple.fr/contact']);
  assert.deepStrictEqual(s.recrutementTrouve.map((x) => x.url), ['https://exemple.fr/recrutement'], 'la page qui répond 404 n\'est pas proposée');
  assert.strictEqual(C.preuvesDePage(s.page, { nom: 'Exemple', commune: '', numeros: ['05 53 00 00 09'] }).numeros[0].trouve, true, 'le numéro est sur la page Contact');
  const sans = await C.lireEtClasser('https://exemple.fr/', { fetch: f, resoudre: PUBLIC, sansContact: true });
  assert.strictEqual(C.preuvesDePage(sans.page, { nom: 'Exemple', commune: '', numeros: ['05 53 00 00 09'] }).numeros[0].trouve, false);
});

function fauxDepot(lignes) { return { listerSas: (f) => (f === 'employeurs' ? { ok: true, lignes: lignes } : { ok: false, erreur: 'inconnu' }) }; }
function carte(id, nom, site, extra) { return Object.assign({ id: id, nom: nom, valeurs: { nom: nom, site: site, recrutement: '', telephone: '05 53 00 00 01' }, etabs: [{ commune: 'Bergerac', adresse: '', telephone: '' }] }, extra || {}); }

test('contrôle du sas : tâche de fond, un site partagé n\'est lu qu\'une fois, résultat gardé sur le poste, un seul contrôle à la fois, identifiants refusés', async () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'ctl-sas-'));
  try {
    const f = reseau({
      'https://magasins-u.test/': () => page('<title>Magasins U</title><p>Bergerac 05 53 00 00 01</p>'),
      'https://mort.test/': new Error('x'),
      'https://refus.test/': new Response('', { status: 403 })
    });
    const lignes = [carte('super-u-24', 'Magasins U', 'https://magasins-u.test/'), carte('hyper-u-24', 'Magasins U', 'https://magasins-u.test/'), carte('mort', 'Mort', 'https://mort.test/'), carte('refus', 'Refus', 'https://refus.test/'), carte('sans-site', 'Sans site', '')];
    const c = creerControleSas(dossier, fauxDepot(lignes), { fetch: f, resoudre: PUBLIC, maintenant: () => '2026-10-18T14:30:00' });
    assert.strictEqual(c.etat().enCours, false);
    assert.strictEqual(c.demarrer({ ids: ['Pas Un Id'] }).ok, false);
    assert.strictEqual(c.demarrer({ ids: [] }).ok, false);
    assert.strictEqual(c.demarrer({ ids: ['inconnu'] }).ok, false);
    const d = c.demarrer({ tout: true }); assert.deepStrictEqual({ ok: d.ok, total: d.total }, { ok: true, total: 5 });
    assert.strictEqual(c.demarrer({ tout: true }).ok, false, 'un seul contrôle à la fois');
    assert.strictEqual(c.etat().enCours, true);
    await c.attendre();
    const e = c.etat(); assert.strictEqual(e.fait, 5);
    assert.strictEqual(f.appels.filter((u) => u === 'https://magasins-u.test/').length, 1, 'le site partagé n\'est ouvert qu\'une fois');
    assert.strictEqual(e.resultats['super-u-24'].verdict, 'complet'); assert.strictEqual(e.resultats['hyper-u-24'].verdict, 'complet');
    assert.strictEqual(e.resultats['super-u-24'].site.nomTitre, true); assert.strictEqual(e.resultats['super-u-24'].site.communeTrouvee, true);
    assert.deepStrictEqual(e.resultats['super-u-24'].numeros, [{ numero: '05 53 00 00 01', trouve: true }]);
    assert.strictEqual(e.resultats['mort'].site.etat, 'sans-reponse'); assert.strictEqual(e.resultats['mort'].verdict, 'main'); assert.strictEqual(e.resultats['mort'].motif, 'sans-reponse');
    assert.strictEqual(e.resultats['refus'].site.etat, 'refuse'); assert.strictEqual(e.resultats['refus'].verdict, 'main'); assert.strictEqual(e.resultats['refus'].motif, 'refuse');
    assert.strictEqual(e.resultats['sans-site'].site.etat, 'absente'); assert.strictEqual(e.resultats['sans-site'].verdict, 'main'); assert.strictEqual(e.resultats['sans-site'].motif, 'sans-site');
    assert.strictEqual(e.resultats['super-u-24'].date, '2026-10-18 14:30');
    // Le dernier résultat est gardé dans un fichier local, et relu au prochain lancement.
    assert.ok(fs.existsSync(c.chemin()));
    const relu = creerControleSas(dossier, fauxDepot(lignes), { fetch: f, resoudre: PUBLIC });
    assert.strictEqual(relu.etat().resultats['super-u-24'].verdict, 'complet');
    // Un fichier d'une ancienne version (verdicts « ok ») est ignoré : les cartes sont à recontrôler.
    fs.writeFileSync(c.chemin(), JSON.stringify({ version: 1, cartes: { 'super-u-24': { verdict: 'ok' } } }), 'utf8');
    assert.deepStrictEqual(creerControleSas(dossier, fauxDepot(lignes), { fetch: f, resoudre: PUBLIC }).etat().resultats, {}, 'ancienne version ignorée');
    // Contrôler seulement certaines cartes met à jour celles-là et garde les autres.
    assert.strictEqual(c.demarrer({ ids: ['mort'] }).total, 1); await c.attendre();
    assert.strictEqual(c.etat().resultats['super-u-24'].verdict, 'complet');
  } finally { fs.rmSync(dossier, { recursive: true, force: true }); }
});

test('contrôle du sas : le fichier du dernier résultat est dans un dossier ignoré par Git, et la fenêtre ne peut jamais fournir une adresse', () => {
  const gi = fs.readFileSync(path.resolve(__dirname, '..', '.gitignore'), 'utf8');
  assert.ok(/^outils\/controles\/$/m.test(gi), 'outils/controles/ doit être dans .gitignore');
  const src = fs.readFileSync(path.resolve(__dirname, '..', 'outils', 'veilleControleSas.js'), 'utf8');
  assert.ok(!/donnees\.(site|url|adresse|recrutement)/.test(src), 'aucune adresse lue dans la demande');
});

// ---------- structures, pages d'offres, registre publié, comparaison avec le contrôle précédent (2026-10-18) ----------
test('tachesDeCarte : structures (site, commune, numéro), pages d\'offres (page, employeur) et employeurs ne lisent chacun que leurs propres colonnes', () => {
  assert.deepStrictEqual(tachesDeCarte({ id: 's1', nom: 'CAF', valeurs: { nom: 'CAF de la Dordogne', commune: 'Périgueux', telephone: '32 30', site: 'https://www.caf.fr' } }, 'lieux'),
    { id: 's1', nom: 'CAF de la Dordogne', commune: 'Périgueux', site: 'https://www.caf.fr', recrutement: '', numeros: ['32 30'] });
  assert.deepStrictEqual(tachesDeCarte({ id: 'o1', nom: 'x', valeurs: { nom: 'Page offres', employeur: 'Mairie de Bergerac', page: 'https://emploi.bergerac.fr/', source: 'a' } }, 'offres'),
    { id: 'o1', nom: 'Mairie de Bergerac', commune: '', site: 'https://emploi.bergerac.fr/', recrutement: '', numeros: [] });
  assert.strictEqual(tachesDeCarte({ id: 's2', nom: 'Sans site', valeurs: { nom: 'Sans site', site: 'http://pas-https.fr', telephone: '' } }, 'lieux').site, '');
  assert.deepStrictEqual(tachesDeCarte({ id: 's3', nom: 'Sans numéro', valeurs: { nom: 'Sans numéro', site: 'https://a.fr' } }, 'lieux').numeros, []);
});

test('contrôle : les structures et les pages d\'offres du sas, et le registre publié, se contrôlent comme les employeurs ; les compléments de numéros sont refusés ; un contrôle à la fois', async () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'ctl-gen-'));
  try {
    const f = reseau({ 'https://caf.test/': () => page('<title>CAF de la Dordogne</title><p>Périgueux, appelez le 05 53 00 00 01</p>'), 'https://offres.test/': () => page('<title>Mairie de Bergerac : nos offres</title>') });
    const depot = {
      listerSas: (fi) => ({ ok: true, lignes: fi === 'lieux' ? [{ id: 'caf-24', nom: 'CAF', valeurs: { nom: 'CAF de la Dordogne', commune: 'Périgueux', telephone: '05 53 00 00 01', site: 'https://caf.test/' } }]
        : (fi === 'offres' ? [{ id: 'mairie', nom: 'm', valeurs: { employeur: 'Mairie de Bergerac', page: 'https://offres.test/' } }] : []) }),
      listerTerritoire: (fi) => ({ ok: true, lignes: fi === 'lieux' ? [{ id: 'caf-pub', nom: 'CAF', valeurs: { nom: 'CAF de la Dordogne', commune: 'Périgueux', telephone: '05 53 99 99 99', site: 'https://caf.test/' } }] : [] })
    };
    const c = creerControleSas(dossier, depot, { fetch: f, resoudre: PUBLIC, maintenant: () => '2026-10-18T10:00:00' });
    assert.strictEqual(c.demarrer({ genre: 'sas', fichier: 'complements', tout: true }).ok, false, 'compléments non pris en charge');
    assert.strictEqual(c.demarrer({ genre: 'autre', fichier: 'lieux', tout: true }).ok, false);
    assert.strictEqual(c.demarrer({ genre: 'sas', fichier: 'lieux', tout: true }).ok, true);
    assert.strictEqual(c.demarrer({ genre: 'sas', fichier: 'offres', tout: true }).ok, false, 'un seul contrôle à la fois');
    assert.strictEqual(c.etat({ genre: 'sas', fichier: 'offres' }).ailleurs, true, 'un contrôle tourne, mais sur un autre fichier');
    await c.attendre();
    assert.strictEqual(c.etat({ genre: 'sas', fichier: 'lieux' }).resultats['caf-24'].verdict, 'complet', 'nom, commune et numéro retrouvés sur la page');
    assert.strictEqual(c.demarrer({ genre: 'sas', fichier: 'offres', tout: true }).total, 1); await c.attendre();
    assert.strictEqual(c.etat({ genre: 'sas', fichier: 'offres' }).resultats['mairie'].verdict, 'complet');
    // Le registre publié : un autre espace, avec son propre fichier, et le numéro de la fiche publiée n'est PAS sur la page : « à compléter ».
    assert.strictEqual(c.demarrer({ genre: 'registre', fichier: 'lieux', tout: true }).total, 1); await c.attendre();
    const pub = c.etat({ genre: 'registre', fichier: 'lieux' }).resultats['caf-pub'];
    assert.deepStrictEqual({ verdict: pub.verdict, motif: pub.motif }, { verdict: 'partiel', motif: 'numero' });
    assert.notStrictEqual(c.chemin('registre', 'lieux'), c.chemin('sas', 'lieux'));
    assert.deepStrictEqual(c.etat({ genre: 'sas', fichier: 'lieux' }).resultats['caf-pub'], undefined, 'les espaces ne se mélangent pas');
  } finally { fs.rmSync(dossier, { recursive: true, force: true }); }
});

test('contrôle : au contrôle suivant, le résultat précédent est gardé comme « avant » pour dire ce qui a changé', async () => {
  const dossier = fs.mkdtempSync(path.join(os.tmpdir(), 'ctl-avant-'));
  try {
    let corps = '<title>Garage Martin</title><p>Tel 05 53 00 00 01</p>';
    const f = (u) => Promise.resolve(page(corps));
    const depot = { listerTerritoire: () => ({ ok: true, lignes: [{ id: 'g', nom: 'Garage Martin', valeurs: { nom: 'Garage Martin', commune: '', telephone: '05 53 00 00 01', site: 'https://garage.test/' } }] }) };
    const c = creerControleSas(dossier, depot, { fetch: f, resoudre: PUBLIC, maintenant: () => '2026-04-01T09:00:00' });
    c.demarrer({ genre: 'registre', fichier: 'lieux', tout: true }); await c.attendre();
    const un = c.etat({ genre: 'registre', fichier: 'lieux' }).resultats.g; assert.strictEqual(un.verdict, 'complet'); assert.strictEqual(un.avant, undefined, 'premier contrôle : rien avant');
    corps = '<title>Garage Martin</title><p>Nous avons déménagé.</p>';
    const c2 = creerControleSas(dossier, depot, { fetch: f, resoudre: PUBLIC, maintenant: () => '2026-10-18T09:00:00' });
    c2.demarrer({ genre: 'registre', fichier: 'lieux', tout: true }); await c2.attendre();
    const deux = c2.etat({ genre: 'registre', fichier: 'lieux' }).resultats.g;
    assert.deepStrictEqual({ verdict: deux.verdict, motif: deux.motif }, { verdict: 'partiel', motif: 'numero' }, 'le numéro n\'est plus sur la page');
    assert.deepStrictEqual(deux.avant, { date: '2026-04-01 09:00', verdict: 'complet', motif: '', site: 'repond', recrutement: '', numeros: '1/1' });
    assert.strictEqual(resume(null), null);
  } finally { fs.rmSync(dossier, { recursive: true, force: true }); }
});
