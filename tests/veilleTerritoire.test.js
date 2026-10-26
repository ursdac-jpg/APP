const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const T = require('../outils/veilleTerritoire.js');
const { creerDepot, validerFichier } = require('../outils/veilleDepot.js');

// Les registres de « Qui fait quoi » dans l'outil de veille : lire, valider, modifier, supprimer, ajouter, en reutilisant les regles de l'application.
// Plan : docs/PLAN_MON_TERRITOIRE_PREMICES_2026-10-12.md (phase 3).
const RACINE = path.join(__dirname, '..');
const lire = (p) => fs.readFileSync(path.join(RACINE, p), 'utf8');
const AUJ = '2026-10-20';
const ctx = T.contexteDepuis(RACINE, AUJ);
// Copies FIGEES des registres (tests/fixtures) : ces essais ne dependent jamais du contenu vivant, qui evolue avec l'outil de veille.
const LIEUX = lire('tests/fixtures/mon-territoire-lieux.txt');
const EMPLOYEURS = lire('tests/fixtures/mon-territoire-employeurs.txt');
const nouvelle = { type: 'ccas', nom: 'Une association', description: 'fait des choses utiles', site: 'https://exemple.fr/', portee: '24', rayons: 'logement', source: 'Essai' };

test('contexteDepuis : lit les 21 secteurs et les communes de tous les departements du depot (Dordogne et Haute-Vienne)', () => {
  assert.strictEqual(ctx.secteurs.length, 21);
  assert.ok(ctx.communes.length >= 698);
  assert.ok(ctx.communes.indexOf('perigueux') !== -1 && ctx.communes.indexOf('limoges') !== -1);
});

test('lister : les 11 structures avec leur fraicheur, les colonnes et leurs choix fermes', () => {
  const r = T.lister('lieux', LIEUX, '2026-10-12', ctx);
  assert.ok(r.ok);
  assert.strictEqual(r.lignes.length, 11);
  assert.ok(r.lignes.every((l) => l.fraicheur === 'recente'));
  assert.strictEqual(T.lister('lieux', LIEUX, '2028-01-01', ctx).lignes[0].fraicheur, 'a-reverifier');
  const type = r.colonnes.filter((c) => c.cle === 'type')[0];
  assert.strictEqual(type.choix.length, 28);
  assert.strictEqual(T.lister('employeurs', EMPLOYEURS, AUJ, ctx).colonnes.filter((c) => c.cle === 'secteur')[0].choix.length, 21);
  assert.ok(!T.lister('inconnu', '', AUJ, ctx).ok);
});

test('valider : seule la ligne touchee change (date du jour), commentaires et autres lignes restent identiques', () => {
  const r = T.appliquer('lieux', LIEUX, [{ op: 'valider', id: 'siao-dordogne' }], AUJ, ctx);
  assert.ok(r.ok); assert.strictEqual(r.resume.valides, 1);
  const a = LIEUX.split('\n'), b = r.texte.split('\n');
  assert.strictEqual(a.length, b.length);
  const changees = a.map((x, i) => [x, b[i]]).filter((p) => p[0] !== p[1]);
  assert.strictEqual(changees.length, 1);
  assert.match(changees[0][1], /^siao-dordogne \|/);
  assert.match(changees[0][1], /\| 2026-10-20$/);
});

test('modifier : changer le site efface la date (il faut le reverifier), sauf si on date aujourd\'hui', () => {
  const sans = T.appliquer('lieux', LIEUX, [{ op: 'modifier', id: 'adil-dordogne', valeurs: { site: 'https://autre.example.org/' } }], AUJ, ctx);
  assert.ok(!sans.ok, 'un site sans date est refuse par les regles de l\'application');
  assert.match(sans.erreur, /sans date/);
  const avec = T.appliquer('lieux', LIEUX, [{ op: 'modifier', id: 'adil-dordogne', valeurs: { site: 'https://autre.example.org/' }, dater: true }], AUJ, ctx);
  assert.ok(avec.ok);
  assert.match(avec.texte, /adil-dordogne [^\n]*https:\/\/autre\.example\.org\/ \| 24 \| logement \| [^\n]* \| 2026-10-20/);
  const texteSeul = T.appliquer('lieux', LIEUX, [{ op: 'modifier', id: 'adil-dordogne', valeurs: { description: 'texte corrige' } }], AUJ, ctx);
  assert.ok(texteSeul.ok);
  assert.match(texteSeul.texte, /texte corrige[^\n]*\| 2026-09-06/, 'un texte corrige garde la date de verification de l\'adresse');
});

test('ajouter : exige la date quand il y a un site ; la fiche s\'ajoute apres la derniere ligne', () => {
  const refus = T.appliquer('lieux', LIEUX, [{ op: 'ajouter', id: 'nouvelle-asso', valeurs: nouvelle }], AUJ, ctx);
  assert.ok(!refus.ok); assert.match(refus.erreur, /sans date/);
  const r = T.appliquer('lieux', LIEUX, [{ op: 'ajouter', id: 'nouvelle-asso', valeurs: nouvelle, dater: true }], AUJ, ctx);
  assert.ok(r.ok); assert.strictEqual(r.resume.ajoutes, 1);
  const lignes = r.texte.split('\n').filter((l) => l.trim());
  assert.match(lignes[lignes.length - 1], /^nouvelle-asso \| ccas \| Une association \| fait des choses utiles \| \| \| \| https:\/\/exemple\.fr\/ \| 24 \| logement \| Essai \| 2026-10-20$/);
  assert.ok(!T.appliquer('lieux', LIEUX, [{ op: 'ajouter', id: 'siao-dordogne', valeurs: nouvelle, dater: true }], AUJ, ctx).ok, 'identifiant deja pris');
});

test('refus : type inconnu, rayon inconnu, barre verticale, tiret long, nom de personne, colonne non modifiable, deux actions sur la meme fiche', () => {
  const essai = (v, morceau) => { const r = T.appliquer('lieux', LIEUX, [{ op: 'ajouter', id: 'x-essai', valeurs: Object.assign({}, nouvelle, v), dater: true }], AUJ, ctx); assert.ok(!r.ok, JSON.stringify(v)); assert.match(r.erreur, morceau); };
  essai({ type: 'nimporte' }, /type inconnu/);
  essai({ rayons: 'nimporte' }, /rayon inconnu/);
  essai({ nom: 'A | B' }, /barre verticale/);
  essai({ description: 'phrase — avec tiret' }, /tiret long/);
  essai({ nom: 'Madame Dupont' }, /personne/);
  assert.match(T.appliquer('lieux', LIEUX, [{ op: 'ajouter', id: 'x-essai', valeurs: { date: '2026-01-01' }, dater: true }], AUJ, ctx).erreur, /non modifiable/);
  assert.match(T.appliquer('lieux', LIEUX, [{ op: 'valider', id: 'siao-dordogne' }, { op: 'valider', id: 'siao-dordogne' }], AUJ, ctx).erreur, /deux modifications/);
  assert.match(T.appliquer('lieux', LIEUX, [{ op: 'valider', id: 'inconnue-1' }], AUJ, ctx).erreur, /introuvable/);
  assert.match(T.appliquer('lieux', LIEUX, [{ op: 'detruire', id: 'siao-dordogne' }], AUJ, ctx).erreur, /action inconnue/);
  assert.ok(!T.appliquer('lieux', LIEUX, [], AUJ, ctx).ok);
});

test('employeurs : un site de plus avec sa date, secteur et commune controles', () => {
  const r = T.appliquer('employeurs', EMPLOYEURS, [{ op: 'modifier', id: 'netto', valeurs: { site: 'https://www.netto.fr/' }, dater: true }], AUJ, ctx);
  assert.ok(r.ok);
  assert.match(r.texte, /netto \| enseigne \| Netto \| commerce-vente \| Bergerac:8 rue Claude Bernard \| \| https:\/\/www\.netto\.fr\/ \| \| non-indique \| [^\n]* \| 2026-10-20/);
  const mauvais = T.appliquer('employeurs', EMPLOYEURS, [{ op: 'ajouter', id: 'zz-essai', valeurs: { nature: 'local', nom: 'Essai', secteur: 'inconnu', etablissements: 'Nulleville:1 rue A', modes: 'non-indique', source: 'Essai' } }], AUJ, ctx);
  assert.ok(!mauvais.ok); assert.match(mauvais.erreur, /secteur inconnu|commune inconnue/);
});

// ---------- avec le depot de publication (depot jetable) ----------
function git(d, ...args) { const r = spawnSync('git', args, { cwd: d, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(d, chemin, texte) { const p = path.join(d, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-territoire-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai');
  git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/mon-territoire/contenu/lieux.txt', LIEUX);
  ecrire(d, 'modules/mon-territoire/contenu/employeurs.txt', EMPLOYEURS);
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test'),a=require('node:assert'),fs=require('fs'),p=require('path');t('essai',()=>{ if(fs.existsSync(p.join(__dirname,'..','ECHEC.flag'))){a.fail('echec voulu');} });\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };

test('Publier : validerFichier accepte le type territoire et refuse un registre inconnu', () => {
  assert.ok(validerFichier(RACINE, { type: 'territoire', fichier: 'lieux', actions: [{ op: 'valider', id: 'siao-dordogne' }] }, []).ok);
  assert.ok(!validerFichier(RACINE, { type: 'territoire', fichier: 'ailleurs.txt', actions: [{ op: 'valider', id: 'x' }] }, []).ok);
  assert.ok(!validerFichier(RACINE, { type: 'territoire', fichier: 'lieux', actions: [] }, []).ok);
});

test('Publier : valider une structure enregistre une seule ligne, annulable ; un refus ne change rien ; rien a changer est refuse', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    const liste = depot.listerTerritoire('lieux');
    assert.ok(liste.ok); assert.strictEqual(liste.lignes.length, 11);
    const chemin = path.join(d, 'modules/mon-territoire/contenu/lieux.txt');
    const refus = depot.publier([{ type: 'territoire', fichier: 'lieux', actions: [{ op: 'ajouter', id: 'nouvelle-asso', valeurs: nouvelle }] }]);
    assert.ok(!refus.ok); assert.strictEqual(refus.code, 'territoire'); assert.match(refus.erreur, /sans date/);
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), LIEUX, 'un refus ne change rien');
    const r = depot.publier([{ type: 'territoire', fichier: 'lieux', actions: [{ op: 'valider', id: 'siao-dordogne' }, { op: 'ajouter', id: 'nouvelle-asso', valeurs: nouvelle, dater: true }] }]);
    assert.ok(r.ok, JSON.stringify(r)); assert.deepStrictEqual(r.resumeTerritoire, { valides: 1, modifies: 0, supprimes: 0, ajoutes: 1 });
    assert.ok(fs.readFileSync(chemin, 'utf8').indexOf('nouvelle-asso') !== -1);
    assert.strictEqual(git(d, 'status', '--porcelain').sortie.trim(), '', 'tout est enregistre');
    assert.strictEqual(depot.publier([{ type: 'territoire', fichier: 'lieux', actions: [{ op: 'valider', id: 'siao-dordogne' }] }]).code, 'territoire-rien', 'valider deux fois le meme jour ne change rien');
    assert.ok(depot.annuler().ok);
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), LIEUX, 'l\'annulation remet le registre comme avant');
  } finally { nettoyer(d); }
});

test('Publier : si les verifications automatiques echouent, le registre est remis comme avant', () => {
  const d = depotJetable();
  try {
    fs.writeFileSync(path.join(d, 'ECHEC.flag'), 'x');
    const r = creerDepot(d, { aujourdhui: () => AUJ }).publier([{ type: 'territoire', fichier: 'lieux', actions: [{ op: 'valider', id: 'siao-dordogne' }] }]);
    assert.ok(!r.ok); assert.strictEqual(r.code, 'tests');
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/lieux.txt'), 'utf8'), LIEUX);
  } finally { nettoyer(d); }
});

// ---------- les pages d'offres des employeurs (offres.txt) : liste « à revérifier » et contrôle automatique ----------

const OFFRES = lire('tests/fixtures/mon-territoire-offres.txt');
const { controler, classer } = require('../outils/veilleControle.js');

test('offres : lister donne le seuil de 6 mois, l\'ancienneté en mois, les colonnes cachées, le contrôle automatique possible', () => {
  const r = T.lister('offres', OFFRES, '2026-10-17', ctx);
  assert.ok(r.ok); assert.strictEqual(r.lignes.length, 3);
  assert.deepStrictEqual(r.regle, { revoirMois: 6, masqueeMois: 12 });
  assert.strictEqual(r.controlable, true);
  assert.strictEqual(T.lister('lieux', LIEUX, '2026-10-12', ctx).controlable, false);
  assert.deepStrictEqual(r.colonnes.filter((c) => c.cachee).map((c) => c.cle), ['controle', 'stages']);
  const par = {}; r.lignes.forEach((l) => { par[l.id] = l; });
  assert.strictEqual(par['a-local'].fraicheur, 'recente');
  assert.strictEqual(par['lidl'].fraicheur, 'a-reverifier', 'six mois et plus : à revérifier');
  assert.strictEqual(par['lidl'].mois, 6);
  assert.strictEqual(par['mairie'].fraicheur, 'a-reverifier');
  assert.strictEqual(r.colonnes.filter((c) => c.cle === 'famille')[0].choix.length, 4);
  assert.strictEqual(r.colonnes.filter((c) => c.cle === 'territoire')[0].choix.length, 4);
  assert.strictEqual(r.colonnes.filter((c) => c.cle === 'secteur')[0].choix.length, 21);
});

test('offres : valider met la date du jour ; changer la page sans « j\'ai ouvert » est refusé ; avec, c\'est accepté', () => {
  const v = T.appliquer('offres', OFFRES, [{ op: 'valider', id: 'lidl' }], '2026-10-20', ctx);
  assert.ok(v.ok, v.erreur); assert.match(v.texte, /lidl \| employeur \| Lidl \| commerce-vente \| national \| https:\/\/emplois\.lidl\.fr\/ \| lidl \| Registre \| 2026-10-20/);
  const sans = T.appliquer('offres', OFFRES, [{ op: 'modifier', id: 'lidl', valeurs: { page: 'https://emplois.lidl.fr/nouvelle' } }], '2026-10-20', ctx);
  assert.ok(!sans.ok); assert.match(sans.erreur, /cochez « J'ai ouvert la page »/);
  const avec = T.appliquer('offres', OFFRES, [{ op: 'modifier', id: 'lidl', valeurs: { page: 'https://emplois.lidl.fr/nouvelle' }, dater: true }], '2026-10-20', ctx);
  assert.ok(avec.ok, avec.erreur); assert.match(avec.texte, /nouvelle \| lidl \| Registre \| 2026-10-20/);
});

test('offres : ajouter exige la date, refuse un intermédiaire et une fiche d\'employeur inconnue ; controle et stages ne se modifient pas ici', () => {
  const valeurs = { famille: 'employeur', nom: 'Nouveau', secteur: 'sante', territoire: '24', page: 'https://nouveau.example/offres', source: 'Essai' };
  assert.ok(!T.appliquer('offres', OFFRES, [{ op: 'ajouter', id: 'nouveau', valeurs: valeurs }], '2026-10-20', ctx).ok);
  assert.ok(T.appliquer('offres', OFFRES, [{ op: 'ajouter', id: 'nouveau', valeurs: valeurs, dater: true }], '2026-10-20', ctx).ok);
  const interm = T.appliquer('offres', OFFRES, [{ op: 'ajouter', id: 'nouveau', valeurs: Object.assign({}, valeurs, { page: 'https://fr.indeed.com/emplois' }), dater: true }], '2026-10-20', ctx);
  assert.ok(!interm.ok); assert.match(interm.erreur, /intermédiaire/);
  const inconnue = T.appliquer('offres', OFFRES, [{ op: 'ajouter', id: 'nouveau', valeurs: Object.assign({}, valeurs, { employeur: 'fiche-qui-n-existe-pas' }), dater: true }], '2026-10-20', ctx);
  assert.ok(!inconnue.ok); assert.match(inconnue.erreur, /fiche d’employeur inconnue/);
  const ctl = T.appliquer('offres', OFFRES, [{ op: 'modifier', id: 'lidl', valeurs: { controle: '2026-10-20' } }], '2026-10-20', ctx);
  assert.ok(!ctl.ok); assert.match(ctl.erreur, /non modifiable/);
});

test('contrôle automatique : cinq catégories, une réponse refusée aux robots n\'est jamais déclarée bonne', async () => {
  assert.strictEqual(classer('https://a.fr/o', { statut: 200, finale: 'https://www.a.fr/o' }, null).etat, 'repond');
  assert.strictEqual(classer('https://a.fr/o', { statut: 200, finale: 'https://autre.com/x' }, null).etat, 'ailleurs');
  assert.strictEqual(classer('https://a.fr/o', { statut: 403 }, null).etat, 'refuse');
  assert.strictEqual(classer('https://a.fr/o', { statut: 429 }, null).etat, 'refuse');
  assert.strictEqual(classer('https://a.fr/o', { statut: 404 }, null).etat, 'absente');
  assert.strictEqual(classer('https://a.fr/o', { statut: 500 }, null).etat, 'sans-reponse');
  assert.strictEqual(classer('https://a.fr/o', null, { cause: { code: 'ENOTFOUND' } }).etat, 'absente');
  assert.strictEqual(classer('https://a.fr/o', null, new Error('délai')).etat, 'sans-reponse');
  const reponses = { 'https://ok.example/': { status: 200, url: 'https://ok.example/' }, 'https://bloque.example/': { status: 403, url: 'https://bloque.example/' }, 'https://mort.example/': { status: 404, url: 'https://mort.example/' } };
  const faux = async (url) => { if (url.indexOf('panne') !== -1) { throw new Error('panne'); } return reponses[url]; };
  const r = await controler([{ id: 'a', url: 'https://ok.example/' }, { id: 'b', url: 'https://bloque.example/' }, { id: 'c', url: 'https://mort.example/' }, { id: 'd', url: 'https://panne.example/' },
    { id: 'e', url: 'http://pas-https.example/' }, { id: 'f', url: 'https://localhost/x' }, { id: 'g', url: 'https://192.168.0.1/' }], { fetch: faux });
  assert.deepStrictEqual(r.map((x) => x.id + ':' + x.etat), ['a:repond', 'b:refuse', 'c:absente', 'd:sans-reponse', 'e:sans-reponse', 'f:sans-reponse', 'g:sans-reponse']);
  assert.match(r[4].detail, /non contrôlée/);
});

test('contrôle automatique : le depot ne controle que les pages d\'offres, et ne lit jamais d\'adresse venue de la fenêtre', () => {
  const depot = creerDepot(RACINE, { aujourdhui: () => AUJ });
  assert.ok(!depot.controlerTerritoire('lieux').ok);
  assert.ok(!depot.controlerTerritoire('../../etc/passwd').ok);
  assert.strictEqual(depot.controlerTerritoire.length, 1, 'un seul argument : le nom du registre, aucune adresse');
});

test('outils/veille.html : les scripts de la page se lisent sans erreur (une faute de syntaxe y fait disparaître le bouton Dépôt et bloque tous les boutons)', () => {
  const h = lire('outils/veille.html');
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m, n = 0;
  while ((m = re.exec(h))) { n++; assert.doesNotThrow(() => new Function(m[1]), 'script ' + n + ' de outils/veille.html'); }
  assert.ok(n >= 2);
});

test('enregistrement interrompu : l\'outil le repère, le montre, puis le termine (rangé) ou le défait (comme avant)', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    assert.strictEqual(depot.etat().interrompue, null, 'rien en suspens au départ');
    const chemin = path.join(d, 'modules/mon-territoire/contenu/lieux.txt');
    fs.writeFileSync(chemin, LIEUX.replace('siao-dordogne', 'siao-dordogne'.toUpperCase()));   // un fichier écrit mais jamais rangé
    const i = depot.etat().interrompue;
    assert.ok(i && i.chemins.indexOf('modules/mon-territoire/contenu/lieux.txt') !== -1, 'le fichier en suspens est repéré');
    assert.ok(i.resume.length >= 2, 'les lignes changées sont montrées');
    // un nouvel enregistrement est refusé avec un message en clair
    const refus = depot.publier([{ type: 'territoire', fichier: 'employeurs', actions: [{ op: 'valider', id: 'aldi' }] }]);
    assert.ok(refus.ok || refus.code !== 'travail-en-cours' || /interrompu/.test(refus.erreur));
    // annuler : le fichier redevient comme avant
    assert.ok(depot.reprendre('annuler').ok);
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), LIEUX);
    assert.strictEqual(depot.etat().interrompue, null);
    // terminer : les contrôles passent, le changement est rangé
    fs.writeFileSync(chemin, LIEUX.replace('siao-dordogne', 'siao-dordogne'.toUpperCase()));
    const fin = depot.reprendre('terminer');
    assert.ok(fin.ok, JSON.stringify(fin));
    assert.strictEqual(git(d, 'status', '--porcelain').sortie.trim(), '', 'tout est rangé');
    assert.strictEqual(depot.etat().interrompue, null);
    assert.ok(!depot.reprendre('annuler').ok, 'rien à reprendre une fois rangé');
  } finally { nettoyer(d); }
});

test('sas des pages d\'offres : une page proposée est contrôlée comme la rubrique, un doublon est reconnu, une page validée entre dans offres.txt avec la date du jour', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    ecrire(d, 'modules/mon-territoire/contenu/offres.txt', fs.readFileSync(path.join(RACINE, 'tests/fixtures/mon-territoire-offres.txt'), 'utf8'));
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'offres');
    const bonne = 'cdg-exemple-24 | portail-officiel | Centre de gestion d\'exemple | administration | 24 | https://exemple.fr/emplois | | Essai | | |';
    const lot = bonne + '\nmauvais-24 | portail-officiel | Mauvais | administration | 99 | http://exemple.fr/x | | | | |\nint-24 | employeur | Indeed | sante | 24 | https://fr.indeed.com/emplois | | Essai | | |\nlidl-bis | employeur | Lidl | commerce-vente | national | https://emplois.lidl.fr/ | | Essai | | |';
    const r = depot.analyserLot('offres', lot);
    assert.ok(r.ok);
    const par = {}; r.lignes.forEach((l) => { par[l.valeurs ? l.valeurs.id : l.numero] = l; });
    assert.strictEqual(par['cdg-exemple-24'].statut, 'prete');
    assert.strictEqual(par['mauvais-24'].statut, 'corriger');
    assert.ok(par['mauvais-24'].problemes.some((p) => /territoire inconnu/.test(p.message)));
    assert.strictEqual(par['int-24'].statut, 'corriger');
    assert.ok(par['int-24'].problemes.some((p) => /intermédiaire/.test(p.message)), 'un site d\'offres est refusé');
    assert.strictEqual(par['lidl-bis'].statut, 'connue', 'même nom qu\'une page déjà publiée');
    const imp = depot.publier([{ type: 'sas', fichier: 'offres', actions: [{ op: 'importer', lignes: [bonne] }] }]);
    assert.ok(imp.ok, JSON.stringify(imp));
    assert.strictEqual(depot.listerSas('offres').lignes.length, 1);
    const pub = depot.publier([
      { type: 'territoire', fichier: 'offres', actions: [{ op: 'ajouter', id: 'cdg-exemple-24', valeurs: { famille: 'portail-officiel', nom: 'Centre de gestion d\'exemple', secteur: 'administration', territoire: '24', page: 'https://exemple.fr/emplois', source: 'Essai' }, dater: true }] },
      { type: 'sas', fichier: 'offres', actions: [{ op: 'retirer', id: 'cdg-exemple-24' }] }]);
    assert.ok(pub.ok, JSON.stringify(pub));
    assert.match(fs.readFileSync(path.join(d, 'modules/mon-territoire/contenu/offres.txt'), 'utf8'), /cdg-exemple-24 \| portail-officiel \| .* \| 2026-10-20/);
    assert.strictEqual(depot.listerSas('offres').lignes.length, 0);
  } finally { nettoyer(d); }
});

test('sas des téléphones : le numéro se corrige dans la carte (formaté en 10 chiffres) et la page garde le garde-fou du script', () => {
  const h = lire('outils/veille.html');
  assert.ok(/data-sas-champ="' \+ esc\(l\.id\) \+ '\|telephone"/.test(h), 'la carte d\'un numéro proposé a un champ à corriger');
  assert.ok(/function sasFormatTel/.test(h) && /sasFormatTel\(sasValeur\(l, 'telephone'\)\)/.test(h), 'le numéro publié est celui du champ, mis au format 05 53 00 00 00');
  const re = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
  let m; while ((m = re.exec(h))) { assert.doesNotThrow(() => new Function(m[1])); }
});

test('sas des téléphones : un numéro court (116 606) est accepté et mis en forme ; la carte propose de chercher la structure sur le web', () => {
  const S = require('../outils/veilleSas.js');
  assert.strictEqual(S.formatTelephone('116606'), '116 606');
  assert.strictEqual(S.formatTelephone('3919'), '3919');
  assert.strictEqual(S.formatTelephone('1234'), null);
  const h = lire('outils/veille.html');
  assert.ok(/Chercher la structure sur le web/.test(h), 'bouton de recherche dans la carte d\'un numéro proposé');
  assert.ok(h.indexOf('^116') !== -1 && h.indexOf('1[578]') !== -1, 'la fenêtre met les numéros courts en forme');
});

test('modifier : le numero d\'un MAGASIN (Commune:adresse:05 53 00 00 00) efface la date comme un numero de fiche ; une adresse corrigee seule la garde', () => {
  const sans = T.appliquer('employeurs', EMPLOYEURS, [{ op: 'modifier', id: 'aldi', valeurs: { etablissements: 'Bergerac:124 avenue Charles de Gaulle:05 53 00 00 00' } }], AUJ, ctx);
  assert.ok(!sans.ok, 'un numero de magasin sans date est refuse');
  assert.match(sans.erreur, /sans date/);
  const avec = T.appliquer('employeurs', EMPLOYEURS, [{ op: 'modifier', id: 'aldi', valeurs: { etablissements: 'Bergerac:124 avenue Charles de Gaulle:05 53 00 00 00' }, dater: true }], AUJ, ctx);
  assert.ok(avec.ok, avec.erreur);
  assert.match(avec.texte, /Bergerac:124 avenue Charles de Gaulle:05 53 00 00 00 \|[^\n]*\| 2026-10-20/);
  const adresse = T.appliquer('employeurs', EMPLOYEURS, [{ op: 'modifier', id: 'aldi', valeurs: { etablissements: 'Bergerac:126 avenue Charles de Gaulle' } }], AUJ, ctx);
  assert.ok(adresse.ok, adresse.erreur);
  assert.match(adresse.texte, /126 avenue Charles de Gaulle \|[^\n]*\| 2026-10-12/, 'une adresse corrigee garde la date');
});

test('modifier : le debut de la source « Via prospection ; » ne se perd ni ne s\'ajoute (la fiche changerait de rubrique)', () => {
  const ligne = 'pros-essai | local | Exemple Prospection | commerce-vente | Bergerac:1 rue A | | | | non-indique | Via prospection ; Registre des entreprises (Sirene) | ';
  const texte = EMPLOYEURS.replace(/\s*$/, '\n') + ligne + '\n';
  const perd = T.appliquer('employeurs', texte, [{ op: 'modifier', id: 'pros-essai', valeurs: { source: 'Registre des entreprises (Sirene)' } }], AUJ, ctx);
  assert.ok(!perd.ok); assert.match(perd.erreur, /Via prospection/);
  const ajoute = T.appliquer('employeurs', texte, [{ op: 'modifier', id: 'netto', valeurs: { source: 'Via prospection ; Sirene' } }], AUJ, ctx);
  assert.ok(!ajoute.ok); assert.match(ajoute.erreur, /Via prospection/);
  const garde = T.appliquer('employeurs', texte, [{ op: 'modifier', id: 'pros-essai', valeurs: { source: 'Via prospection ; Registre des entreprises (Sirene), site ouvert' } }], AUJ, ctx);
  assert.ok(garde.ok, JSON.stringify(garde));
  const autre = T.appliquer('employeurs', texte, [{ op: 'modifier', id: 'pros-essai', valeurs: { nom: 'Exemple Prospection bis' } }], AUJ, ctx);
  assert.ok(autre.ok, JSON.stringify(autre));
});
