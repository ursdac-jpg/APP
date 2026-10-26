const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const mots = require('../outils/veilleMots.js');

// ---------- depot de test jetable (jamais le vrai depot) ----------
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
const LEXIQUE = [
  '/* en-tete */', '', 'var LEXIQUE_FICHES = [', '',
  '  {', "    id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh', 'langage-juridique'],",
  "    variantesRecherche: ['contrat fixe', 'poste stable'],", '    corps: "Un CDI est un contrat sans date de fin prevue. Il est la forme habituelle d\'embauche.",', '    relations: [', "      { ficheId: 'cdd', type: 'a-ne-pas-confondre' }", '    ]', '  },',
  '  {', "    id: 'cdd', titre: 'CDD', titreDeTri: 'CDD', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],",
  "    variantesRecherche: ['contrat court'],", '    corps: "Un CDD est un contrat qui a une date de fin. Il sert a remplacer ou a renforcer une equipe.",', '    relations: []', '  },',
  '  {', "    id: 'pmsmp', titre: 'PMSMP', titreDeTri: 'PMSMP', type: 'terme',", "    univers: 'dispositifs', registres: ['langage-cip'],",
  "    variantesRecherche: [],", '    corps: "Une PMSMP permet de decouvrir un metier. Elle dure peu de temps.",', '    relations: [],', '    voirAussiChiffres: "Voir ici"', '  }', '];', '', 'var LEXIQUE_COLLECTIONS = [];', ''
].join('\n');
function creerDepotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-lexique-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  fs.mkdirSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi'), { recursive: true });
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# Rayon\n');
  ecrire(d, 'data/lexique.js', LEXIQUE);
  ecrire(d, 'scripts/checkLexique.js', "console.log('Aucune erreur.');\n");
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test'),a=require('node:assert'),fs=require('fs'),p=require('path');t('essai',()=>{ if(fs.existsSync(p.join(__dirname,'..','ECHEC.flag'))){a.fail('echec voulu');} });\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const lire = (d, c) => fs.readFileSync(path.join(d, c), 'utf8');
const horloge = () => '2026-10-20 14:05';

// ---------- les controles d'un mot ----------
const EXISTANTS = [{ id: 'cdi', titre: 'CDI', variantes: ['contrat fixe'], relations: [] }, { id: 'cdd', titre: 'CDD', variantes: [], relations: [] }];
const BON = { id: 'nouveau-mot', titre: 'Nouveau mot', titreDeTri: 'Nouveau mot', univers: 'dispositifs', registres: ['langage-cip'], variantes: ['un autre nom'], corps: 'Une phrase simple. Une autre phrase simple.', relations: [['cdi', 'voir-aussi']] };

test('controles : un mot correct passe, sans erreur ni avertissement', () => {
  const v = mots.verifierMot(BON, EXISTANTS, { nouveau: true });
  assert.deepStrictEqual(v.erreurs, []);
  assert.deepStrictEqual(v.avertissements, []);
});
test('controles : les refus bloquants (vide, famille, registres, plafonds, doublons, renvois, tirets, « a verifier »)', () => {
  const cas = (modif, opt, attendu) => {
    const v = mots.verifierMot(Object.assign({}, BON, modif), EXISTANTS, opt || { nouveau: true });
    assert.ok(v.erreurs.some((e) => attendu.test(e)), 'attendu ' + attendu + ' dans ' + JSON.stringify(v.erreurs));
  };
  cas({ titre: ' ' }, null, /titre est vide/);
  cas({ corps: '' }, null, /texte du mot est vide/);
  cas({ univers: 'inconnu' }, null, /famille/);
  cas({ registres: [] }, null, /registres/);
  cas({ registres: ['a', 'b', 'c', 'd'] }, null, /3 registres/);
  cas({ variantes: ['a', 'b', 'c', 'd', 'e'] }, null, /4 mots de recherche/);
  cas({ variantes: ['Mot', 'mot'] }, null, /répété/);
  cas({ id: 'cdi' }, null, /existe déjà/);
  cas({ id: 'Mauvais Id' }, null, /identifiant/);
  cas({ titre: 'cdi' }, null, /porte déjà ce titre/);
  cas({ relations: [['inconnu', 'voir-aussi']] }, null, /inconnu/);
  cas({ relations: [['cdi', 'voir-aussi'], ['cdd', 'voir-aussi'], ['cdd', 'a-ne-pas-confondre']] }, null, /en double/);
  cas({ relations: [['nouveau-mot', 'voir-aussi']] }, null, /lui-même/);
  cas({ corps: 'Un texte ' + String.fromCharCode(0x2014) + ' avec un tiret long. Deux phrases.' }, null, /tiret/);
  cas({ corps: 'Cette information est à vérifier. Deux phrases.' }, null, /à vérifier/);
});
test('controles : les avertissements ne bloquent pas (chiffre ou date, nombre de phrases, mot de recherche deja pris, aucun renvoi)', () => {
  const v = mots.verifierMot(Object.assign({}, BON, { corps: 'Une seule phrase sans chiffre.', variantes: ['contrat fixe'], relations: [] }), EXISTANTS, { nouveau: true });
  assert.deepStrictEqual(v.erreurs, []);
  assert.ok(v.avertissements.some((a) => /1 phrase/.test(a)));
  assert.ok(v.avertissements.some((a) => /déjà un mot de recherche/.test(a)));
  assert.ok(v.avertissements.some((a) => /Aucun renvoi/.test(a)));
});
test('controles : un chiffre dans le texte est une ERREUR pour un mot neuf et pour une fiche hors liste de transition, un simple avertissement pour une fiche encore sur la liste', () => {
  const avecChiffre = Object.assign({}, BON, { corps: 'Depuis 2026, une aide de 12 mois. Elle change.' });
  const neuf = mots.verifierMot(avecChiffre, EXISTANTS, { nouveau: true });
  assert.ok(neuf.erreurs.some((e) => /Chiffre ou date repéré/.test(e) && /bloc « Les chiffres à jour »/.test(e)));
  const horsListe = mots.verifierMot(avecChiffre, [], { original: BON, phrase: 'x', transition: ['autre-fiche'] });
  assert.ok(horsListe.erreurs.some((e) => /Chiffre ou date repéré/.test(e)));
  const surLaListe = mots.verifierMot(avecChiffre, [], { original: BON, phrase: 'x', transition: [BON.id] });
  assert.ok(!surLaListe.erreurs.some((e) => /Chiffre ou date/.test(e)));
  assert.ok(surLaListe.avertissements.some((a) => /liste de transition/.test(a)));
});
test('controles : modifier un mot exige une phrase, et dit ce qui change', () => {
  const original = { id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', univers: 'contrats-statuts-emploi', registres: ['langage-rh'], variantes: ['contrat fixe'], corps: 'Un texte. Un autre.', relations: [] };
  const apres = Object.assign({}, original, { variantes: ['contrat fixe', 'poste stable'] });
  const sans = mots.verifierMot(apres, [EXISTANTS[1]], { original: original, phrase: '' });
  assert.deepStrictEqual(sans.modifies, ['variantes']);
  assert.ok(sans.erreurs.some((e) => /en une phrase/.test(e)));
  const avec = mots.verifierMot(apres, [EXISTANTS[1]], { original: original, phrase: 'mot de recherche ajouté' });
  assert.deepStrictEqual(avec.erreurs, []);
  assert.deepStrictEqual(mots.verifierMot(original, [EXISTANTS[1]], { original: original, phrase: '' }).modifies, []);
});
test('controles : l\'identifiant propose pour un mot neuf (sans accent, avec des traits d\'union) et ce que le depot propose', () => {
  assert.strictEqual(mots.idPropose('Délai de carence'), 'delai-de-carence');
  assert.strictEqual(mots.idPropose("L'ARE (allocation)  "), 'l-are-allocation');
  assert.deepStrictEqual(creerDepot(os.tmpdir()).proposerMot({ mot: 'Forfait jours ?' }), { ok: true, id: 'forfait-jours', titreDeTri: 'Forfait jours' });
  assert.ok(!creerDepot(os.tmpdir()).proposerMot({ mot: ' ' }).ok);
});
test('controles : le titre de tri propose, les libelles lus dans le module du Lexique, l\'evolution relue', () => {
  assert.strictEqual(mots.titreDeTriPropose('Que veut dire "autonomie" ?'), 'Que veut dire autonomie');
  assert.strictEqual(mots.titreDeTriPropose('CESU (chèque emploi service universel)'), 'CESU chèque emploi service universel');
  const lib = mots.libellesDepuis("var _LEXIQUE_LIBELLES_UNIVERS = {\n  'droit-travail': 'Droit du travail',\n  formation: 'Formation',\n  'autre': 'Pas autorise'\n};\n", '_LEXIQUE_LIBELLES_UNIVERS', ['droit-travail', 'formation', 'dispositifs']);
  assert.deepStrictEqual(lib, { 'droit-travail': 'Droit du travail', formation: 'Formation', dispositifs: 'dispositifs' });
  const evo = mots.ajouterEvolution('', mots.lignesEvolution('2026-10-20 10:00', 'cdi', 'CDI', 'modifié', 'phrase', [{ champ: 'corps', avant: 'a', apres: 'b' }]));
  mots.lireEvolution(evo + '{pas du json\n');
  const lu = mots.lireEvolution(mots.ajouterEvolution(evo, mots.lignesEvolution('2026-10-20 11:00', 'cdi', 'CDI', 'modifié', 'plus tard', [{ champ: 'titre', avant: 'CDI', apres: 'Le CDI' }])));
  assert.strictEqual(lu.length, 2);
  assert.strictEqual(lu[0].champ, 'titre', 'du plus recent au plus ancien');
});

// ---------- la liste, les controles du serveur, la publication ----------
test('depot : la liste des mots est lue dans le depot, avec leurs champs, les libelles et les regles', () => {
  const d = creerDepotDeTest();
  try {
    const r = creerDepot(d).listerMots();
    assert.ok(r.ok);
    assert.deepStrictEqual(r.mots.map((m) => m.id), ['cdi', 'cdd', 'pmsmp']);
    assert.strictEqual(r.mots.find((m) => m.id === 'cdi').entrants, 0);
    assert.strictEqual(r.mots.find((m) => m.id === 'cdd').entrants, 1, 'cdd est cite par cdi');
    assert.strictEqual(r.mots.find((m) => m.id === 'pmsmp').chiffres, 'Voir ici');
    assert.strictEqual(r.regles.maxVariantes, 4);
    assert.ok(r.univers.dispositifs);
    assert.ok(creerDepot(d).verifierMotLexique({ mot: { id: 'cdi', corps: 'Autre texte. Deux phrases.' }, phrase: '' }).erreurs.length >= 1);
    assert.ok(!creerDepot(d).verifierMotLexique({ mot: { id: 'inconnu' } }).ok);
  } finally { nettoyer(d); }
});
test('publier : modifier un mot ne change que ses champs, ajoute l\'avant et l\'apres, le journal, puis s\'annule', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const avant = lire(d, 'data/lexique.js');
    const r = depot.publier([{ type: 'lexique-champs', id: 'cdi', champs: { variantes: ['contrat fixe', 'poste stable', 'contrat sans date de fin'], corps: 'Un CDI est un contrat sans date de fin prevue. Il reste le plus courant.' }, phrase: 'mot de recherche ajouté, texte précisé' }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.deepStrictEqual(r.resumeLexique[0].champs.sort(), ['corps', 'variantes']);
    const apres = lire(d, 'data/lexique.js');
    assert.ok(apres.indexOf('"contrat sans date de fin"') !== -1 || apres.indexOf("'contrat sans date de fin'") !== -1);
    assert.strictEqual(apres.slice(apres.indexOf("id: 'cdd'")), avant.slice(avant.indexOf("id: 'cdd'")), 'les autres mots ne bougent pas d\'un octet');
    const evo = mots.lireEvolution(lire(d, 'outils/evolution_lexique.txt'));
    assert.deepStrictEqual(evo.map((e) => e.champ).sort(), ['corps', 'variantes']);
    assert.strictEqual(evo.find((e) => e.champ === 'variantes').avant, 'contrat fixe ; poste stable');
    assert.strictEqual(evo[0].quand, '2026-10-20 14:05');
    assert.match(lire(d, 'outils/journal_modifications.txt'), /2026-10-20 14:05 \| lexique \| cdi \| modifiée \| mot de recherche ajouté, texte précisé/);
    assert.match(git(d, 'show', '--name-only', '--format=%s', 'HEAD').sortie, /evolution_lexique\.txt/);
    assert.strictEqual(depot.listerMots().mots.find((m) => m.id === 'cdi').modifieLe, '2026-10-20 14:05');
    const a = depot.annuler();
    assert.ok(a.ok, JSON.stringify(a));
    assert.strictEqual(lire(d, 'data/lexique.js'), avant);
    assert.ok(!fs.existsSync(path.join(d, 'outils/evolution_lexique.txt')) || !/"champ"/.test(lire(d, 'outils/evolution_lexique.txt')));
  } finally { nettoyer(d); }
});
test('publier : une modification sans phrase, sans changement, d\'un mot inconnu ou invalide est refusee, rien n\'est ecrit', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const avant = lire(d, 'data/lexique.js');
    const cas = (f, code) => { const r = depot.publier([f]); assert.ok(!r.ok, JSON.stringify(r)); assert.strictEqual(r.code, code, JSON.stringify(r)); assert.strictEqual(lire(d, 'data/lexique.js'), avant); };
    cas({ type: 'lexique-champs', id: 'cdi', champs: { corps: 'Un autre texte. Deux phrases.' }, phrase: '' }, 'lexique-mot');
    cas({ type: 'lexique-champs', id: 'cdi', champs: { corps: 'Un CDI est un contrat sans date de fin prevue. Il est la forme habituelle d\'embauche.' }, phrase: 'rien' }, 'lexique-rien');
    cas({ type: 'lexique-champs', id: 'inexistant', champs: { corps: 'x. y.' }, phrase: 'x' }, 'mot-absent');
    cas({ type: 'lexique-champs', id: 'cdi', champs: { registres: [] }, phrase: 'x' }, 'lexique-mot');
    cas({ type: 'lexique-champs', id: 'cdi', champs: { relations: [['introuvable', 'voir-aussi']] }, phrase: 'x' }, 'lexique-mot');
    assert.strictEqual(git(d, 'log', '--oneline').sortie.trim().split('\n').length, 1);
  } finally { nettoyer(d); }
});
test('publier : un mot neuf est ajoute a la fin (titre du bloc une seule fois), avec son evolution ; un identifiant deja pris est refuse', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const r = depot.publier([{ type: 'lexique-nouveau', mot: BON, origine: 'sigle présent dans 3 fiches' }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.deepStrictEqual(r.nouveauxMots, ['nouveau-mot']);
    const r2 = depot.publier([{ type: 'lexique-nouveau', mot: Object.assign({}, BON, { id: 'second-mot', titre: 'Second mot', titreDeTri: 'Second mot', relations: [] }), origine: 'saisi par vous' }]);
    assert.ok(r2.ok, JSON.stringify(r2));
    const l = lire(d, 'data/lexique.js');
    assert.strictEqual(l.split('Ajouts de la veille 2026-10').length - 1, 1, 'le titre du bloc n\'est pas repete');
    assert.ok(l.indexOf("id: 'nouveau-mot'") < l.indexOf("id: 'second-mot'"));
    const m = depot.listerMots().mots;
    assert.strictEqual(m.length, 5);
    assert.deepStrictEqual(m.find((x) => x.id === 'nouveau-mot').relations, [['cdi', 'voir-aussi']]);
    assert.deepStrictEqual(m.find((x) => x.id === 'second-mot').relations, []);
    assert.strictEqual(mots.lireEvolution(lire(d, 'outils/evolution_lexique.txt')).filter((e) => e.action === 'créé' && e.id === 'nouveau-mot').length, 7, 'une ligne par champ');
    const r3 = depot.publier([{ type: 'lexique-nouveau', mot: BON, origine: '' }]);
    assert.ok(!r3.ok); assert.strictEqual(r3.code, 'lexique-mot');
  } finally { nettoyer(d); }
});
test('publier : si la verification du Lexique echoue, tout est remis comme avant (fichier du mot et evolution)', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'scripts/checkLexique.js', "console.log('1 erreur : voulue');process.exit(1);\n"); git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'verif');
    const avant = lire(d, 'data/lexique.js');
    const r = creerDepot(d, { maintenant: horloge }).publier([{ type: 'lexique-champs', id: 'cdi', champs: { titre: 'Le CDI' }, phrase: 'titre' }]);
    assert.ok(!r.ok); assert.strictEqual(r.code, 'lexique-verification');
    assert.strictEqual(lire(d, 'data/lexique.js'), avant);
    assert.ok(!fs.existsSync(path.join(d, 'outils/evolution_lexique.txt')));
  } finally { nettoyer(d); }
});
