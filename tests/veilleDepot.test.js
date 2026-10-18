const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot, validerFichier, ajouterLigneReadme, rayonsExistants } = require('../outils/veilleDepot.js');

// ---------- depot de test jetable (jamais le vrai depot) ----------
function git(dossier, ...args) {
  const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' });
  return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') };
}
function ecrire(dossier, chemin, texte) {
  const p = path.join(dossier, chemin);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, texte, 'utf8');
}
const README = '# Rayon\n\n## Les 2 fiches\n\n| id | titre |\n|---|---|\n| `emploi-un` | Premier |\n| `emploi-deux` | Deuxieme |\n\nSuite du texte.\n';
function fiche(id, titre) { return '---\nid: ' + id + '\ntitre: ' + titre + '\n---\n\nCorps de la fiche.\n'; }
function creerDepotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-depot-'));
  git(d, 'init', '-q', '-b', 'master');
  git(d, 'config', 'user.email', 'essai@example.org');
  git(d, 'config', 'user.name', 'Essai');
  git(d, 'config', 'commit.gpgsign', 'false');
  git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', README);
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', fiche('emploi-un', 'Premier'));
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-deux.md', fiche('emploi-deux', 'Deuxieme'));
  fs.mkdirSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage'), { recursive: true });
  ecrire(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-06.md', 'ancien balayage\n');
  ecrire(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md', 'ancien chiffres\n');
  // copies derivees factices (le vrai script lit les fiches ; ici un compteur suffit)
  ecrire(d, 'scripts/genererBaseVeille.js', "const fs=require('fs'),p=require('path');const r=p.join(__dirname,'..');const n=fs.readdirSync(p.join(r,'modules/comprendre-le-cadre/contenu/emploi')).length;fs.mkdirSync(p.join(r,'outils'),{recursive:true});fs.writeFileSync(p.join(r,'outils','base_fiches.js'),'// base '+n+'\\n');\n");
  ecrire(d, 'scripts/genererRenvoisCadre.js', "const fs=require('fs'),p=require('path');const r=p.join(__dirname,'..');fs.mkdirSync(p.join(r,'data'),{recursive:true});fs.writeFileSync(p.join(r,'data','lexique-renvois-cadre.js'),'// renvois\\n');\n");
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test'),a=require('node:assert'),fs=require('fs'),p=require('path');t('essai',()=>{ if(fs.existsSync(p.join(__dirname,'..','ECHEC.flag'))){a.fail('echec voulu');} });\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  // etat de depart enregistre, y compris les copies derivees
  spawnSync(process.execPath, ['scripts/genererBaseVeille.js'], { cwd: d });
  spawnSync(process.execPath, ['scripts/genererRenvoisCadre.js'], { cwd: d });
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };

// ---------- README ----------
test('README : ajoute la ligne d\'une fiche nouvelle et met le nombre a jour', () => {
  const r = ajouterLigneReadme(README, 'emploi-trois', 'Troisieme');
  assert.ok(r.ok && r.ajoutee);
  assert.match(r.texte, /## Les 3 fiches/);
  assert.match(r.texte, /\| `emploi-deux` \| Deuxieme \|\n\| `emploi-trois` \| Troisieme \|\n/);
  assert.match(r.texte, /Suite du texte\./);
});
test('README : une fiche deja listee n\'est pas ajoutee deux fois', () => {
  const r = ajouterLigneReadme(README, 'emploi-un', 'Premier');
  assert.ok(r.ok && !r.ajoutee);
  assert.strictEqual(r.texte, README);
});
test('README : sans tableau « Les N fiches », refus clair', () => {
  const r = ajouterLigneReadme('# Rien ici\n', 'x', 'X');
  assert.ok(!r.ok);
  assert.match(r.erreur, /Les N fiches/);
});
test('README : le caractere « | » du titre ne casse pas le tableau, les fins de ligne sont conservees', () => {
  const crlf = README.replace(/\n/g, '\r\n');
  const r = ajouterLigneReadme(crlf, 'emploi-trois', 'A | B');
  assert.ok(r.ok);
  assert.ok(r.texte.indexOf('\r\n') !== -1 && !/[^\r]\n/.test(r.texte));
  assert.match(r.texte, /A \/ B/);
});

// ---------- validation ----------
test('validation : refuse les noms, rayons, types et contenus dangereux', () => {
  const d = creerDepotDeTest();
  try {
    const rayons = rayonsExistants(d);
    assert.deepStrictEqual(rayons, ['emploi']);
    const v = (f) => validerFichier(d, f, rayons);
    const bonne = { type: 'fiche', rayon: 'emploi', nom: 'emploi-trois.md', texte: fiche('emploi-trois', 'T') };
    assert.ok(v(bonne).ok);
    assert.strictEqual(v(bonne).chemin, 'modules/comprendre-le-cadre/contenu/emploi/emploi-trois.md');
    const refus = [
      Object.assign({}, bonne, { nom: '../../index.html' }),
      Object.assign({}, bonne, { nom: 'EMPLOI.md' }),
      Object.assign({}, bonne, { nom: 'readme.md' }),
      Object.assign({}, bonne, { nom: 'x.collecte.md' }),
      Object.assign({}, bonne, { nom: 'emploi-trois.js' }),
      Object.assign({}, bonne, { rayon: 'balayage' }),
      Object.assign({}, bonne, { rayon: 'methode' }),
      Object.assign({}, bonne, { rayon: '../..' }),
      Object.assign({}, bonne, { rayon: 'inconnu' }),
      Object.assign({}, bonne, { texte: fiche('autre-id', 'T') }),
      Object.assign({}, bonne, { texte: 'pas d\'entete' }),
      Object.assign({}, bonne, { texte: bonne.texte + 'un ' + String.fromCharCode(0x2014) + ' tiret' }),
      Object.assign({}, bonne, { texte: bonne.texte + 'un ' + String.fromCharCode(0x2013) + ' tiret' }),
      Object.assign({}, bonne, { texte: bonne.texte + 'x'.repeat(200001) }),
      Object.assign({}, bonne, { texte: bonne.texte + '\u0000' }),
      Object.assign({}, bonne, { texte: '' }),
      Object.assign({}, bonne, { type: 'lexique' }),
      Object.assign({}, bonne, { type: '../x' }),
      { type: 'balayage', nom: '2026-13.md', texte: 'x' },
      { type: 'balayage', nom: '../2026-06.md', texte: 'x' },
      { type: 'chiffres', nom: 'portrait-2026.md', texte: 'x' },
      { type: 'collecte', rayon: 'emploi', nom: 'autre.collecte.md', texte: 'x' },
      null, 'texte', 42
    ];
    refus.forEach((f, i) => assert.ok(!v(f).ok, 'cas ' + i + ' devrait etre refuse : ' + JSON.stringify(f && f.nom)));
    assert.ok(v({ type: 'balayage', nom: '2026-09.md', texte: 'x' }).ok);
    assert.strictEqual(v({ type: 'chiffres', nom: '2026-09.md', texte: 'x' }).chemin, 'modules/comprendre-les-chiffres/contenu/2026-09.md');
    assert.ok(v({ type: 'collecte', rayon: 'emploi', nom: 'emploi.collecte.md', texte: 'x' }).ok);
  } finally { nettoyer(d); }
});

// ---------- publication ----------
test('publier : une fiche nouvelle est ecrite, listee dans le README, enregistree (Git local) sans toucher au travail en cours', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'notes-en-cours.txt', 'travail sans rapport');
    git(d, 'add', 'notes-en-cours.txt'); git(d, 'commit', '-q', '-m', 'notes');
    ecrire(d, 'notes-en-cours.txt', 'travail sans rapport, modifie et non enregistre');
    const depot = creerDepot(d);
    const r = depot.publier([{ type: 'fiche', rayon: 'emploi', nom: 'emploi-trois.md', texte: fiche('emploi-trois', 'Troisieme') }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.ok(fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-trois.md')));
    assert.match(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), 'utf8'), /## Les 3 fiches[\s\S]*emploi-trois/);
    assert.match(fs.readFileSync(path.join(d, 'outils/base_fiches.js'), 'utf8'), /base 4/);
    const vus = git(d, 'show', '--name-only', '--format=%s', 'HEAD').sortie;
    assert.match(vus, /Veille : mise a jour du contenu \(1 fichier\)/);
    assert.match(vus, /emploi-trois\.md/);
    assert.match(vus, /README\.md/);
    assert.match(vus, /base_fiches\.js/);
    assert.ok(!/notes-en-cours/.test(vus), 'le travail en cours ne doit pas etre enregistre');
    assert.match(git(d, 'status', '--porcelain').sortie, /notes-en-cours\.txt/);
    assert.strictEqual(git(d, 'remote').sortie.trim(), '');
    assert.ok(r.resteAFaire.length === 1 && /Les adresses/.test(r.resteAFaire[0]));
    assert.deepStrictEqual(r.nouvelles, ['emploi-trois']);
  } finally { nettoyer(d); }
});

test('publier : une fiche existante est mise a jour sans toucher au README ; balayage et chiffres sont acceptes', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d);
    const r = depot.publier([
      { type: 'fiche', rayon: 'emploi', nom: 'emploi-un.md', texte: fiche('emploi-un', 'Premier') + 'nouvelle phrase\n' },
      { type: 'balayage', nom: '2026-09.md', texte: 'balayage de septembre\n' },
      { type: 'chiffres', nom: '2026-09.md', texte: 'chiffres de septembre\n' }
    ]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), 'utf8'), README);
    assert.ok(fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md')));
    assert.ok(fs.existsSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/2026-09.md')));
    assert.deepStrictEqual(r.nouvelles, []);
  } finally { nettoyer(d); }
});

test('publier : un fichier cible deja modifie et non enregistre arrete tout, rien n\'est ecrit', () => {
  const d = creerDepotDeTest();
  try {
    const cible = 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md';
    ecrire(d, cible, fiche('emploi-un', 'Premier') + 'travail de quelqu\'un d\'autre\n');
    const avant = fs.readFileSync(path.join(d, cible), 'utf8');
    const r = creerDepot(d).publier([{ type: 'fiche', rayon: 'emploi', nom: 'emploi-un.md', texte: fiche('emploi-un', 'Premier') + 'ma version\n' }]);
    assert.ok(!r.ok);
    assert.strictEqual(r.code, 'travail-en-cours');
    assert.strictEqual(fs.readFileSync(path.join(d, cible), 'utf8'), avant);
    assert.strictEqual(git(d, 'log', '--oneline').sortie.trim().split('\n').length, 1);
  } finally { nettoyer(d); }
});

test('publier : si les verifications echouent, tout est remis comme avant et rien n\'est enregistre', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'ECHEC.flag', 'x');   // fait echouer le test du depot de test (fichier non suivi, sans rapport avec la publication)
    const readmeAvant = fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), 'utf8');
    const baseAvant = fs.readFileSync(path.join(d, 'outils/base_fiches.js'), 'utf8');
    const r = creerDepot(d).publier([{ type: 'fiche', rayon: 'emploi', nom: 'emploi-trois.md', texte: fiche('emploi-trois', 'Troisieme') }]);
    assert.ok(!r.ok, 'publication reussie alors que les verifications devaient echouer : ' + JSON.stringify(r));
    assert.strictEqual(r.code, 'tests');
    assert.ok(!fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-trois.md')));
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), 'utf8'), readmeAvant);
    assert.strictEqual(fs.readFileSync(path.join(d, 'outils/base_fiches.js'), 'utf8'), baseAvant);
    assert.strictEqual(git(d, 'log', '--oneline').sortie.trim().split('\n').length, 1);
    assert.match(r.erreur, /rien n'est publie/);
  } finally { nettoyer(d); }
});

test('publier : refuse hors de la branche principale, liste vide, trop de fichiers, doublons', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d);
    assert.strictEqual(depot.publier([]).code, 'vide');
    assert.strictEqual(depot.publier(new Array(61).fill({ type: 'balayage', nom: '2026-09.md', texte: 'x' })).code, 'trop');
    const f = { type: 'balayage', nom: '2026-09.md', texte: 'x' };
    assert.strictEqual(depot.publier([f, f]).code, 'invalide');
    git(d, 'checkout', '-q', '-b', 'autre');
    assert.strictEqual(depot.publier([f]).code, 'branche');
    assert.ok(!fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md')));
  } finally { nettoyer(d); }
});

test('annuler : defait la derniere publication par un nouvel enregistrement ; refuse si un enregistrement plus recent existe', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d);
    assert.strictEqual(depot.annuler().code, 'rien');
    const r = depot.publier([{ type: 'fiche', rayon: 'emploi', nom: 'emploi-trois.md', texte: fiche('emploi-trois', 'Troisieme') }]);
    assert.ok(r.ok);
    const a = depot.annuler();
    assert.ok(a.ok, JSON.stringify(a));
    assert.ok(!fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-trois.md')));
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), 'utf8'), README);
    assert.match(git(d, 'log', '-1', '--format=%s').sortie, /^Revert/);
    assert.strictEqual(depot.annuler().code, 'rien');
    // un enregistrement plus recent interdit l'annulation
    const r2 = depot.publier([{ type: 'balayage', nom: '2026-09.md', texte: 'x\n' }]);
    assert.ok(r2.ok);
    ecrire(d, 'autre.txt', 'a'); git(d, 'add', 'autre.txt'); git(d, 'commit', '-q', '-m', 'autre');
    assert.strictEqual(depot.annuler().code, 'plus-recente');
  } finally { nettoyer(d); }
});

test('publication : le code n\'utilise jamais de push, de shell, ni d\'ajout global', () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veilleDepot.js'), 'utf8');
  assert.ok(!/'push'|"push"|shell\s*:\s*true|(^|[^.\w])exec\(|execSync|'-A'|"-A"|'--all'|'\.'\s*\]/.test(src));
  assert.strictEqual((src.match(/spawnSync\(/g) || []).length, 1);
});

// ---------- Lexique ----------
const { analyserCandidatsLexique, integrerCandidatsLexique } = require('../outils/veilleDepot.js');
const TIRET_LONG = String.fromCharCode(0x2014);
function entreeLex(id, extra) {
  return '// nouveau · source : exemple ' + TIRET_LONG + ' page\n{\n  id: \'' + id + '\',\n  titre: "Un mot \\"nouveau\\"",\n  titreDeTri: "Un mot", type: \'terme\',\n  univers: \'dispositifs\',\n  registres: [\'langage-cip\', \'langage-france-travail\'],\n  variantesRecherche: ["variante un", "variante deux"],\n  corps: "Le corps du mot, sur une seule ligne."' + (extra || '\n') + '},\n\n';
}
const RELS = ',\n  relations: [\n    { ficheId: \'autre-mot\', type: \'voir-aussi\' },\n    { ficheId: \'troisieme\', type: \'a-ne-pas-confondre\' }\n  ]\n';
const LEXIQUE = '/* en-tete */\n\nvar LEXIQUE_FICHES = [\n\n  // -- Famille : Test --\n\n  {\n    id: \'existant\', titre: \'Existant\', titreDeTri: \'Existant\', type: \'terme\',\n    univers: \'dispositifs\', registres: [], variantesRecherche: [],\n    corps: "Corps."\n  }\n];\n\nvar LEXIQUE_COLLECTIONS = [];\n';

test('Lexique : les entrees de l\'outil sont reconnues (avec ou sans relations), les commentaires retires', () => {
  const r = analyserCandidatsLexique(entreeLex('mot-un') + entreeLex('mot-deux', RELS) + '{\n  id: \'notion-un\',\n  titre: "Une notion",\n  titreDeTri: "Une notion", type: \'notion\',\n  gabarit: \'situation\',\n  univers: \'dispositifs\',\n  registres: [],\n  variantesRecherche: [],\n  corps: "Corps."\n},\n\n');
  assert.ok(r.ok, JSON.stringify(r));
  assert.deepStrictEqual(r.ids, ['mot-un', 'mot-deux', 'notion-un']);
  assert.ok(!/\/\//.test(r.texte), 'les commentaires de l\'outil sont retires');
  assert.ok(r.texte.indexOf(TIRET_LONG) === -1);
  assert.match(r.texte, /relations: \[/);
});

test('Lexique : tout ce qui n\'est pas une entree du format de l\'outil est refuse (aucun code n\'est jamais execute)', () => {
  const bonne = entreeLex('mot-un');
  const refus = {
    'code apres une entree': bonne + 'require(\'fs\').writeFileSync(\'x\', \'y\');\n',
    'code avant': 'process.exit(1);\n' + bonne,
    'champ injecte': bonne.replace('corps: "Le corps du mot, sur une seule ligne."', 'corps: "x" + require(\'fs\').readFileSync(\'a\')'),
    'guillemet non echappe': bonne.replace('Le corps du mot', 'Le "corps" du mot'),
    'chaine sur deux lignes': bonne.replace('sur une seule ligne', 'sur\ndeux lignes'),
    'identifiant avec majuscule': bonne.replace('id: \'mot-un\'', 'id: \'Mot-Un\''),
    'identifiant avec espace': bonne.replace('id: \'mot-un\'', 'id: \'mot un\''),
    'champ manquant (corps)': bonne.replace(/  corps: .*\n/, ''),
    'champs dans le desordre': bonne.replace('  univers: \'dispositifs\',\n', '').replace('  titre:', '  univers: \'dispositifs\',\n  titre:'),
    'relation inconnue': entreeLex('mot-un', ',\n  relations: [\n    { ficheId: \'x\', type: \'supprimer\' }\n  ]\n'),
    'relation avec code': entreeLex('mot-un', ',\n  relations: [\n    { ficheId: \'x\', type: \'voir-aussi\' }, evil()\n  ]\n'),
    'entree non fermee': bonne.replace('},\n', ''),
    'accolades parasites': '}); evil(); ({\n' + bonne,
    'vide': '',
    'deux fois le meme id': bonne + bonne
  };
  Object.keys(refus).forEach((k) => assert.ok(!analyserCandidatsLexique(refus[k]).ok, k));
});

test('Lexique : l\'insertion se fait a la fin de la liste des fiches, avec la virgule, sans toucher au reste', () => {
  const c = analyserCandidatsLexique(entreeLex('mot-un'));
  const r = integrerCandidatsLexique(LEXIQUE, c, '2026-10');
  assert.ok(r.ok);
  assert.match(r.texte, /corps: "Corps\."\n  \},\n\n  \/\/ -- Ajouts de la veille 2026-10 --\n\n  \{\n    id: 'mot-un'/);
  assert.match(r.texte, /  \},\n\];\n\nvar LEXIQUE_COLLECTIONS = \[\];/);
  assert.ok(r.texte.startsWith('/* en-tete */'));
  assert.ok(r.texte.indexOf('id: \'existant\'') < r.texte.indexOf('id: \'mot-un\''));
  assert.ok(!integrerCandidatsLexique(LEXIQUE, analyserCandidatsLexique(entreeLex('existant')), '2026-10').ok, 'un mot deja present est refuse');
  assert.ok(!integrerCandidatsLexique('rien', c, '2026-10').ok);
});

test('publier : un mot nouveau du Lexique est ajoute a data/lexique.js, verifie, enregistre ; un mot existant est refuse', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'data/lexique.js', LEXIQUE);
    ecrire(d, 'scripts/checkLexique.js', 'const fs=require(\'fs\'),p=require(\'path\');const t=fs.readFileSync(p.join(__dirname,\'..\',\'data\',\'lexique.js\'),\'utf8\');if(t.indexOf(\'ERREUR_VOULUE\')!==-1){console.log(\'1 erreur\');process.exit(1);}console.log(\'Aucune erreur.\');\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'lexique');
    const depot = creerDepot(d);
    const r = depot.publier([{ type: 'lexique', nom: 'lexique-candidats-2026-10.js', texte: entreeLex('mot-un', RELS) }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.deepStrictEqual(r.nouveauxMots, ['mot-un']);
    const l = fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8');
    assert.ok(l.indexOf('id: \'mot-un\'') !== -1 && l.indexOf('id: \'existant\'') !== -1);
    assert.match(git(d, 'show', '--name-only', '--format=%s', 'HEAD').sortie, /data\/lexique\.js/);
    const avant = fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8');
    const r2 = depot.publier([{ type: 'lexique', nom: 'lexique-candidats-2026-10.js', texte: entreeLex('existant') }]);
    assert.ok(!r2.ok); assert.strictEqual(r2.code, 'lexique-existant'); assert.deepStrictEqual(r2.ids, ['existant']);
    assert.strictEqual(fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8'), avant);
    assert.ok(!depot.publier([{ type: 'lexique', nom: 'autre.js', texte: entreeLex('mot-trois') }]).ok);
  } finally { nettoyer(d); }
});

test('publier : si la verification du Lexique echoue, tout est remis comme avant', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'data/lexique.js', LEXIQUE);
    ecrire(d, 'scripts/checkLexique.js', 'console.log(\'1 erreur : voulue\');process.exit(1);\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'lexique');
    const avant = fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8');
    const r = creerDepot(d).publier([{ type: 'lexique', nom: 'lexique-candidats-2026-10.js', texte: entreeLex('mot-un') }]);
    assert.ok(!r.ok); assert.strictEqual(r.code, 'lexique-verification');
    assert.strictEqual(fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8'), avant);
    assert.strictEqual(git(d, 'log', '--oneline').sortie.trim().split('\n').length, 2);
  } finally { nettoyer(d); }
});

// ---------- Lexique : remplacer un mot, digests annuels, « A confronter », liens ----------
test('publier : un mot existant du Lexique est remplace APRES confirmation, ses champs supplementaires sont gardes, verification et annulation', () => {
  const d = creerDepotDeTest();
  try {
    const lex = LEXIQUE.replace("corps: \"Corps.\"\n  }", "corps: \"Corps.\",\n    voirAussiChiffres: \"Voir les chiffres\"\n  }");
    ecrire(d, 'data/lexique.js', lex);
    ecrire(d, 'scripts/checkLexique.js', 'console.log(\'Aucune erreur.\');\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'lexique');
    const depot = creerDepot(d);
    const f = [{ type: 'lexique', nom: 'lexique-candidats-2026-10.js', texte: entreeLex('existant') }];
    const sans = depot.publier(f);
    assert.ok(!sans.ok); assert.strictEqual(sans.code, 'lexique-existant');
    assert.strictEqual(fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8'), lex, 'sans confirmation, rien ne change');
    const avec = depot.publier(f, { remplacerExistants: true });
    assert.ok(avec.ok, JSON.stringify(avec));
    assert.deepStrictEqual(avec.motsRemplaces, ['existant']);
    assert.deepStrictEqual(avec.nouveauxMots, []);
    const apres = fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8');
    assert.ok(apres.indexOf('Le corps du mot, sur une seule ligne.') !== -1);
    assert.ok(apres.indexOf('voirAussiChiffres: "Voir les chiffres"') !== -1, 'le champ supplementaire est conserve');
    assert.ok(apres.indexOf('corps: "Corps."') === -1, 'l\'ancien texte est remplace');
    assert.ok(depot.annuler().ok);
    assert.strictEqual(fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8'), lex, 'annuler remet le fichier comme avant');
  } finally { nettoyer(d); }
});

test('publier : les digests annuels exigent le format du module ; « A confronter » est range hors du code de l\'application', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d);
    const brut = 'Voici la reponse de l\'assistant, pas encore mise en forme.\n';
    const r0 = depot.publier([{ type: 'portrait', nom: 'portrait-2026.md', texte: brut }]);
    assert.ok(!r0.ok); assert.match(r0.erreur, /pas encore au format du module/);
    const bon = '---\ntype: portrait\nannee: 2026\nverifie_le: 2026-09\n---\n\nCorps du portrait.\n';
    assert.ok(!depot.publier([{ type: 'portrait', nom: 'portrait-2027.md', texte: bon }]).ok, 'annee differente du nom');
    assert.ok(!depot.publier([{ type: 'ue', nom: 'ue-2026.md', texte: bon }]).ok, 'mauvais type pour un digest europeen');
    assert.ok(!depot.publier([{ type: 'portrait', nom: '../portrait-2026.md', texte: bon }]).ok);
    const ok = depot.publier([{ type: 'portrait', nom: 'portrait-2026.md', texte: bon }, { type: 'ue', nom: 'ue-2026.md', texte: bon.replace('type: portrait', 'type: chiffres-ue') }]);
    assert.ok(ok.ok, JSON.stringify(ok));
    assert.ok(fs.existsSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/portrait-2026.md')));
    assert.ok(fs.existsSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/ue-2026.md')));
    const c = depot.publier([{ type: 'confronter', nom: '2026-09.md', texte: '# A confronter\n\nSignal un.\n' }]);
    assert.ok(c.ok, JSON.stringify(c));
    assert.ok(fs.existsSync(path.join(d, 'docs/veille/a-confronter/2026-09.md')));
    assert.ok(!depot.publier([{ type: 'confronter', nom: 'autre.md', texte: 'x' }]).ok);
  } finally { nettoyer(d); }
});

test('publier : les adresses (valider, modifier, ajouter, supprimer) s\'enregistrent ligne par ligne ; une adresse utilisee par une fiche ne se supprime pas ; annulable', () => {
  const d = creerDepotDeTest();
  try {
    const REGISTRE = '# Registre\n\nlegifrance | https://www.legifrance.gouv.fr/ | 2026-09-06 | national\nasso-24 | https://asso24.example.org/ |  | 24\nlibre | https://libre.example.org/ | 2026-01-01 | national\n';
    ecrire(d, 'modules/comprendre-le-cadre/liens-verifies.txt', REGISTRE);
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', '---\nid: emploi-un\ntitre: Premier\nsources:\n  - legifrance\n---\nCorps\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'liens');
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-07', maintenant: () => '2026-10-07 09:15' });
    const liste = depot.listerLiens();
    assert.ok(liste.ok);
    assert.strictEqual(liste.aujourdhui, '2026-10-07');
    assert.deepStrictEqual(liste.liens.map((l) => [l.nom, l.date, l.nbFiches]), [['legifrance', '2026-09-06', 1], ['asso-24', '', 0], ['libre', '2026-01-01', 0]]);
    const refus = depot.publier([{ type: 'liens', actions: [{ op: 'supprimer', nom: 'legifrance' }] }]);
    assert.ok(!refus.ok); assert.strictEqual(refus.code, 'liens'); assert.match(refus.erreur, /utilisee par 1 fiche/);
    assert.ok(!depot.publier([{ type: 'liens', actions: [{ op: 'valider', nom: 'legifrance' }, { op: 'valider', nom: 'inconnue' }] }]).ok);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/liens-verifies.txt'), 'utf8'), REGISTRE, 'un refus ne change rien');
    const r = depot.publier([{ type: 'liens', actions: [
      { op: 'valider', nom: 'asso-24' }, { op: 'modifier', nom: 'libre', adresse: 'https://libre-nouveau.example.org/' },
      { op: 'ajouter', nom: 'nouveau', adresse: 'https://nouveau.example.org/', portee: '87' }
    ] }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.deepStrictEqual(r.resumeLiens, { valides: 1, modifies: 1, supprimes: 0, ajoutes: 1 });
    const journal = fs.readFileSync(path.join(d, 'outils/journal_modifications.txt'), 'utf8');
    assert.ok(journal.indexOf('2026-10-07 09:15 | liens | asso-24 | modifiée') !== -1 && journal.indexOf('| liens | nouveau | ajoutée') !== -1 && journal.indexOf('| liens | legifrance') === -1, 'seules les adresses touchées sont journalisées');
    assert.strictEqual(depot.listerLiens().liens.filter((l) => l.nom === 'libre')[0].modifieLe, '2026-10-07 09:15');
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/liens-verifies.txt'), 'utf8'),
      '# Registre\n\nlegifrance | https://www.legifrance.gouv.fr/ | 2026-09-06 | national\nasso-24 | https://asso24.example.org/ | 2026-10-07 | 24\nlibre | https://libre-nouveau.example.org/ | 2026-10-07 | national\nnouveau | https://nouveau.example.org/ |  | 87\n');
    assert.ok(depot.annuler().ok);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/liens-verifies.txt'), 'utf8'), REGISTRE);
    // une modification qui ne change rien est signalee
    assert.ok(depot.publier([{ type: 'liens', actions: [{ op: 'valider', nom: 'legifrance' }] }]).ok);
    assert.strictEqual(depot.publier([{ type: 'liens', actions: [{ op: 'valider', nom: 'legifrance' }] }]).code, 'liens-rien', 'valider deux fois le meme jour ne change rien');
  } finally { nettoyer(d); }
});

test('publier : une fiche du cadre modifiee champ par champ s\'enregistre avec sa revision et son heure ; refus clairs ; echec des tests = tout remis ; annulable', () => {
  const d = creerDepotDeTest();
  try {
    const chemin = path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md');
    const AVANT = '---\nid: emploi-un\nrayon: emploi\ntitre: "Premier"\ntags: [a, b]\nverifie_le: 2026-09-01\nrevisions: []\ncollecte: emploi.collecte.md\n---\n\nPremier paragraphe.\n';
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', AVANT);
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'fiche');
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-18', maintenant: () => '2026-10-18 14:35' });
    const fic = (plus) => [Object.assign({ type: 'fiche-champs', rayon: 'emploi', nom: 'emploi-un.md', datation: 'garder' }, plus)];
    // refus : pas de phrase, fiche inconnue (jamais une creation), tiret long, rayon inconnu
    const sansPhrase = depot.publier(fic({ changements: { titre: 'Nouveau' } }));
    assert.ok(!sansPhrase.ok); assert.strictEqual(sansPhrase.code, 'fiche-champs'); assert.match(sansPhrase.erreur, /en une phrase/);
    const absente = depot.publier([{ type: 'fiche-champs', rayon: 'emploi', nom: 'emploi-neuve.md', changements: { titre: 'X' }, revision: 'essai' }]);
    assert.ok(!absente.ok); assert.strictEqual(absente.code, 'fiche-absente');
    assert.ok(!depot.publier(fic({ changements: { titre: 'Un ' + String.fromCharCode(0x2014) + ' tiret' }, revision: 'essai' })).ok);
    assert.ok(!depot.publier([{ type: 'fiche-champs', rayon: 'inconnu', nom: 'emploi-un.md', changements: { titre: 'X' }, revision: 'essai' }]).ok);
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), AVANT, 'un refus ne change rien');
    // echec des tests : tout est remis comme avant
    fs.writeFileSync(path.join(d, 'ECHEC.flag'), 'x');
    const echec = depot.publier(fic({ changements: { titre: 'Nouveau' }, revision: 'titre change' }));
    assert.ok(!echec.ok); assert.strictEqual(echec.code, 'tests');
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), AVANT);
    fs.rmSync(path.join(d, 'ECHEC.flag'));
    // la bonne publication
    const r = depot.publier(fic({ changements: { titre: 'Nouveau titre', corps: 'Premier paragraphe.\n\nSecond paragraphe.' }, revision: 'titre plus clair et paragraphe ajoute', datation: 'redater' }));
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.resumeFiches.length, 1);
    assert.strictEqual(r.resumeFiches[0].action, 'modifiée');
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'),
      '---\nid: emploi-un\nrayon: emploi\ntitre: "Nouveau titre"\ntags: [a, b]\nverifie_le: 2026-10-18\nrevisions:\n  - "2026-10 : titre plus clair et paragraphe ajoute"\ncollecte: emploi.collecte.md\n---\n\nPremier paragraphe.\n\nSecond paragraphe.\n');
    const journal = fs.readFileSync(path.join(d, 'outils/journal_modifications.txt'), 'utf8');
    assert.ok(journal.indexOf('2026-10-18 14:35 | cadre | emploi-un | modifiée | titre plus clair et paragraphe ajoute') !== -1);
    assert.ok(depot.annuler().ok);
    assert.strictEqual(fs.readFileSync(chemin, 'utf8'), AVANT, 'l\'annulation remet la fiche d\'avant');
  } finally { nettoyer(d); }
});

test('lister les fiches du cadre : une ligne par fiche (sans les fiches « methode »), avec la date et l\'heure de la derniere modification ; lire une fiche champ par champ', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', '---\nid: emploi-un\nrayon: emploi\ntitre: "Premier"\ntags: [a, b]\nverifie_le: 2026-09-01\nsources:\n  - legifrance\nrevisions: []\ncollecte: emploi.collecte.md\n---\n\nPremier paragraphe.\n');
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.collecte.md', 'collecte\n');
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-cassee.md', 'Pas d\'en-tete\n');
    ecrire(d, 'modules/comprendre-le-cadre/contenu/methode/methode-un.md', '---\nid: methode-un\ntitre: Titre sans guillemets\n---\n\nTexte.\n');
    ecrire(d, 'modules/comprendre-le-cadre/liens-verifies.txt', 'legifrance | https://www.legifrance.gouv.fr/ | 2026-09-06 | national\nasso | https://asso.example.org/ |  | 24\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'fiches');
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-18', maintenant: () => '2026-10-18 14:35' });
    const l = depot.listerFiches();
    assert.ok(l.ok);
    assert.deepStrictEqual(l.fiches.map((f) => [f.rayon, f.id, f.titre, f.verifieLe, f.modifieLe]), [['emploi', 'emploi-cassee', 'emploi-cassee', '', ''], ['emploi', 'emploi-deux', 'Deuxieme', '', ''], ['emploi', 'emploi-un', 'Premier', '2026-09-01', '']]);
    assert.strictEqual(l.fiches[0].illisible, true, 'une fiche sans l\'en-tete habituel est signalee illisible');
    assert.deepStrictEqual(l.rayons, { emploi: 3 });
    assert.ok(depot.publier([{ type: 'fiche-champs', rayon: 'emploi', nom: 'emploi-un.md', changements: { titre: 'Titre neuf' }, revision: 'essai' }]).ok);
    assert.strictEqual(depot.listerFiches().fiches.filter((f) => f.id === 'emploi-un')[0].modifieLe, '2026-10-18 14:35');
    const f = depot.lireFiche('emploi', 'emploi-un');
    assert.ok(f.ok);
    assert.strictEqual(f.champs.titre, 'Titre neuf');
    assert.deepStrictEqual(f.champs.sources, ['legifrance']);
    assert.strictEqual(f.corps, 'Premier paragraphe.');
    assert.deepStrictEqual(f.verrouilles.map((v) => v.cle), ['id', 'rayon', 'collecte']);
    assert.deepStrictEqual(f.registre, [{ nom: 'legifrance', date: '2026-09-06' }, { nom: 'asso', date: '' }]);
    assert.strictEqual(f.modifieLe, '2026-10-18 14:35');
    // refus : rayon inconnu ou « methode », nom detourne, fiche absente, fiche illisible
    assert.ok(!depot.lireFiche('methode', 'methode-un').ok);
    assert.ok(!depot.lireFiche('inconnu', 'emploi-un').ok);
    assert.ok(!depot.lireFiche('emploi', '../../../package').ok);
    assert.ok(!depot.lireFiche('emploi', 'emploi-absente').ok);
    assert.ok(!depot.lireFiche('emploi', 'emploi-cassee').ok);
  } finally { nettoyer(d); }
});

test('historique : le journal est lu du plus recent au plus ancien, avec le rayon des fiches du cadre et la phrase ; sans journal, une liste vide', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-18', maintenant: () => '2026-10-18 14:35' });
    assert.deepStrictEqual(depot.listerHistorique().entrees, []);
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', '---\nid: emploi-un\nrayon: emploi\ntitre: "Premier"\nverifie_le: 2026-09-01\nrevisions: []\ncollecte: emploi.collecte.md\n---\n\nTexte.\n');
    ecrire(d, 'outils/journal_modifications.txt', '# Journal\n2026-10-16 09:00 | lieux | asso-un | modifiée\n2026-10-17 | liens | legifrance | ajoutée\nligne cassée\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'journal');
    assert.ok(depot.publier([{ type: 'fiche-champs', rayon: 'emploi', nom: 'emploi-un.md', changements: { titre: 'Neuf' }, revision: 'titre | plus clair' }]).ok);
    const h = depot.listerHistorique();
    assert.ok(h.ok);
    assert.deepStrictEqual(h.entrees.map((e) => [e.quand, e.registre, e.fiche, e.action, e.rayon]), [
      ['2026-10-18 14:35', 'cadre', 'emploi-un', 'modifiée', 'emploi'],
      ['2026-10-17', 'liens', 'legifrance', 'ajoutée', ''],
      ['2026-10-16 09:00', 'lieux', 'asso-un', 'modifiée', '']
    ]);
    assert.strictEqual(h.entrees[0].phrase, 'titre / plus clair', 'une barre verticale dans la phrase est remplacee');
    assert.strictEqual(h.total, 3);
  } finally { nettoyer(d); }
});

test('chiffres : lister, lire et modifier un digest et un lieu ; la confirmation de la source est exigee ; journal, annulation, echec des tests', () => {
  const d = creerDepotDeTest();
  try {
    const ENT = '---\nperiode: "avril a juin 2026"\nverifie_le: 2026-10-13\nsources:\n  - "INSEE | Taux | https://www.insee.fr/fr/statistiques/1 | 2026-10-05"\n---\n';
    const DIGEST = ENT + '\n## Taux de chomage localise\n\n- Dordogne (24) : **7,9 %** (2e trimestre 2026) ; précédent : 7,8 %. Source : INSEE, taux | https://www.insee.fr/fr/statistiques/1\n  serie: T1 2026: 7,8 % ; T2 2026: 7,9 %\n';
    const ZONES = '---\nperiode: 1er trimestre 2026\nverifie_le: 2026-09\nsources:\n  - "src-a | Source A | https://exemple.org/a | 2026-09-12"\n---\n\n# 24\n\n## Bergerac\nvaleur: 8,5 %\nsources: src-a\n\nParagraphe.\n';
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md', DIGEST);
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/zones-emploi.md', ZONES);
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/portrait-2026.md', '---\ntype: portrait\nannee: 2026\nverifie_le: 2026-09\nsources:\n  - "INSEE | Comparateur | https://www.insee.fr/fr/statistiques/1 | 2026-09"\n---\n\n## X\n\n- Un chiffre : **10 %**. Source : INSEE, comparateur | https://www.insee.fr/fr/statistiques/1\n');
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/methode/comment-lire.md', '---\nid: methode-comment-lire\ntype: methode\ntitre: Comment lire\npour_qui: Toute personne.\ntags: a, b\n---\n\nTexte de la methode.\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'chiffres');
    const depot = creerDepot(d, { aujourdhui: () => '2026-10-18', maintenant: () => '2026-10-18 14:35' });
    const l = depot.listerChiffres();
    assert.deepStrictEqual(l.fichiers.map((f) => [f.fichier, f.forme, f.nb]), [['2026-06.md', 'digest', 1], ['portrait-2026.md', 'annuel', 1], ['zones-emploi.md', 'territoire', 1], ['methode/comment-lire.md', 'methode', 1]]);
    const g = depot.lireChiffres('2026-06.md');
    assert.ok(g.ok); assert.strictEqual(g.entrees[0].valeur, '7,9 %'); assert.strictEqual(g.entrees[0].aPrecedent, true); assert.strictEqual(g.entrees[0].serie.length, 2);
    assert.ok(!depot.lireChiffres('portrait-2025.md').ok && !depot.lireChiffres('../x.md').ok && !depot.lireChiffres('methode/../x.md').ok);
    assert.strictEqual(depot.lireChiffres('zones-emploi.md').lieux[0].champs[0].forme, 'nombre');
    const pub = (fichier, demande, phrase) => depot.publier([{ type: 'chiffres-champs', nom: fichier, demande: demande, phrase: phrase }]);
    // refus : sans confirmation, fichier non pris en charge, format
    const sans = pub('2026-06.md', { ref: 'Taux de chomage localise | Dordogne (24)', changes: { valeur: '8,3 %' } });
    assert.ok(!sans.ok); assert.strictEqual(sans.code, 'chiffres-champs'); assert.match(sans.erreur, /confirmez/);
    assert.ok(!pub('portrait-2026.md', { ref: 'x' }).ok);
    assert.ok(!pub('2026-06.md', { ref: 'Taux de chomage localise | Dordogne (24)', changes: { valeur: '8.3 %' }, confirmeSource: true }).ok);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md'), 'utf8'), DIGEST, 'un refus ne change rien');
    // echec des tests : tout remis
    fs.writeFileSync(path.join(d, 'ECHEC.flag'), 'x');
    const echec = pub('2026-06.md', { ref: 'Taux de chomage localise | Dordogne (24)', changes: { valeur: '8,3 %', serie: [{ p: 'T1 2026', v: '7,8 %' }, { p: 'T2 2026', v: '8,3 %' }] }, confirmeSource: true }, 'essai');
    assert.ok(!echec.ok); assert.strictEqual(echec.code, 'tests');
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md'), 'utf8'), DIGEST);
    fs.rmSync(path.join(d, 'ECHEC.flag'));
    // bonne publication du digest
    const r = pub('2026-06.md', { ref: 'Taux de chomage localise | Dordogne (24)', changes: { valeur: '8,3 %', serie: [{ p: 'T1 2026', v: '7,8 %' }, { p: 'T2 2026', v: '8,3 %' }] }, confirmeSource: true }, 'point T2 2026 : 7,9 % devient 8,3 %');
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.resumeChiffres[0].action, 'chiffre modifie'.replace('modifie', 'modifié'));
    const apres = fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md'), 'utf8');
    assert.ok(apres.indexOf('**8,3 %**') !== -1 && apres.indexOf('T2 2026: 8,3 %') !== -1 && apres.indexOf('| 2026-10-18"') !== -1 && apres.indexOf('verifie_le: 2026-10-13') !== -1);
    const journal = fs.readFileSync(path.join(d, 'outils/journal_modifications.txt'), 'utf8');
    assert.ok(journal.indexOf('2026-10-18 14:35 | chiffres | 2026-06.md : Taux de chomage localise / Dordogne (24) | chiffre modifié | point T2 2026') !== -1 || journal.indexOf('| chiffres | 2026-06.md : Taux de chomage localise | Dordogne (24) |') === -1);
    assert.strictEqual(depot.listerChiffres().fichiers[0].modifieLe, '2026-10-18 14:35');
    assert.ok(depot.annuler().ok);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md'), 'utf8'), DIGEST);
    // un lieu
    const rz = pub('zones-emploi.md', { lieu: 'Bergerac', champs: { valeur: '8,9 %' }, prose: 'Nouveau paragraphe.', confirmeSource: true, datation: 'redater' }, 'taux mis a jour');
    assert.ok(rz.ok, JSON.stringify(rz));
    const z = fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/zones-emploi.md'), 'utf8');
    assert.ok(z.indexOf('valeur: 8,9 %') !== -1 && z.indexOf('Nouveau paragraphe.') !== -1 && z.indexOf('verifie_le: 2026-10\n') !== -1 && z.indexOf('src-a | Source A | https://exemple.org/a | 2026-10-18') !== -1);
    // portrait : une puce ; fiche methode
    const pl = depot.lireChiffres('portrait-2026.md');
    assert.strictEqual(pl.puces[0].source.nom, 'INSEE, comparateur');
    assert.ok(!pub('portrait-2026.md', { ref: pl.puces[0].ref, texte: 'Un chiffre : **12 %**.' }).ok, 'un chiffre change : confirmation exigee');
    const rp = pub('portrait-2026.md', { ref: pl.puces[0].ref, texte: 'Un chiffre : **12 %**.', confirmeSource: true }, 'chiffre corrige');
    assert.ok(rp.ok, JSON.stringify(rp));
    assert.ok(fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/portrait-2026.md'), 'utf8').indexOf('- Un chiffre : **12 %**. Source : INSEE, comparateur | https://www.insee.fr/fr/statistiques/1\n') !== -1);
    const ml = depot.lireChiffres('methode/comment-lire.md');
    assert.strictEqual(ml.champs.titre, 'Comment lire'); assert.strictEqual(ml.verrouilles.id, 'methode-comment-lire');
    assert.ok(pub('methode/comment-lire.md', { changes: { titre: 'Comment bien lire', corps: 'Nouveau texte.' } }, 'titre et texte').ok);
    const mf = fs.readFileSync(path.join(d, 'modules/comprendre-les-chiffres/contenu/methode/comment-lire.md'), 'utf8');
    assert.ok(mf.indexOf('titre: Comment bien lire\n') !== -1 && mf.indexOf('Nouveau texte.\n') !== -1 && mf.indexOf('tags: a, b\n') !== -1);
    assert.ok(!pub('methode/../../x.md', { changes: { titre: 'x' } }).ok);
    const j2 = fs.readFileSync(path.join(d, 'outils/journal_modifications.txt'), 'utf8');
    assert.ok(j2.indexOf('| chiffres | methode/comment-lire.md | texte modifié | titre et texte') !== -1);
  } finally { nettoyer(d); }
});
