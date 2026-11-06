const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const mots = require('../outils/veilleMots.js');
const regles = require('../scripts/checkLexique.js');

// Le lot de mots du Lexique : plusieurs mots dans un seul enregistrement, aide aux registres, tests ciblés.
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
const mot = (id, titre, corps) => ['  {', "    id: '" + id + "', titre: '" + titre + "', titreDeTri: '" + titre + "', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],", "    variantesRecherche: [],", '    corps: "' + corps + '",', '    relations: []', '  }'].join('\n');
const LEXIQUE = ['/* en-tete */', '', 'var LEXIQUE_FICHES = [', '', [mot('cdi', 'CDI', 'Un CDI est un contrat sans date de fin prevue. Il est courant.'), mot('cdd', 'CDD', 'Un CDD est un contrat qui a une date de fin. Il remplace une absence.')].join(',\n'), '];', '', 'var LEXIQUE_COLLECTIONS = [];', ''].join('\n');
function creerDepotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-lot-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  fs.mkdirSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi'), { recursive: true });
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# Rayon\n');
  ecrire(d, 'data/lexique.js', LEXIQUE);
  ecrire(d, 'scripts/checkLexique.js', "console.log('Aucune erreur.');\n");
  ecrire(d, 'tests/lexique.test.js', "const t=require('node:test');t('lexique essai',()=>{});\n");
  ecrire(d, 'tests/ailleurs.test.js', "const t=require('node:test'),a=require('node:assert');t('ailleurs',()=>{ a.fail('ne doit pas etre lance'); });\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const lire = (d, c) => fs.readFileSync(path.join(d, c), 'utf8');
const horloge = () => '2026-10-29 10:00';

test('lot : deux mots partent dans un seul enregistrement, chacun avec son avant et son après, sans lancer les tests étrangers au Lexique', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const r = depot.publier([
      { type: 'lexique-champs', id: 'cdi', champs: { registres: ['langage-rh', 'langage-juridique'] }, phrase: 'registre ajouté' },
      { type: 'lexique-champs', id: 'cdd', champs: { corps: 'Un CDD est un contrat qui a une date de fin. Il sert aux remplacements.' }, phrase: 'texte précisé' }
    ]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.resumeLexique.length, 2);
    const apres = lire(d, 'data/lexique.js');
    assert.ok(/langage-juridique/.test(apres) && /remplacements/.test(apres), 'les deux mots sont écrits');
    const evo = mots.lireEvolution(lire(d, 'outils/evolution_lexique.txt'));
    assert.deepStrictEqual(evo.map((e) => e.champ).sort(), ['corps', 'registres']);
    const journal = lire(d, 'outils/journal_modifications.txt');
    assert.match(journal, /\| lexique \| cdi \| modifiée \| registre ajouté/);
    assert.match(journal, /\| lexique \| cdd \| modifiée \| texte précisé/);
    assert.strictEqual(git(d, 'rev-list', '--count', 'HEAD').sortie.trim(), '2', 'un seul enregistrement pour les deux mots');
    const a = depot.annuler();
    assert.ok(a.ok, JSON.stringify(a));
    assert.strictEqual(lire(d, 'data/lexique.js'), LEXIQUE, 'annuler défait tout le lot');
  } finally { nettoyer(d); }
});

test('lot : si un seul mot est refusé, aucun mot du lot n\'est écrit', () => {
  const d = creerDepotDeTest();
  try {
    const r = creerDepot(d, { maintenant: horloge }).publier([
      { type: 'lexique-champs', id: 'cdi', champs: { registres: ['langage-rh', 'langage-juridique'] }, phrase: 'ok' },
      { type: 'lexique-champs', id: 'cdd', champs: { registres: [] }, phrase: 'refusé' }
    ]);
    assert.strictEqual(r.ok, false);
    assert.strictEqual(r.code, 'lexique-mot');
    assert.strictEqual(lire(d, 'data/lexique.js'), LEXIQUE);
  } finally { nettoyer(d); }
});

test('lot : le même mot deux fois, ou un mot avec un autre type de fichier du Lexique, reste refusé', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const r = depot.publier([
      { type: 'lexique-champs', id: 'cdi', champs: { registres: ['langage-rh', 'langage-juridique'] }, phrase: 'a' },
      { type: 'lexique-champs', id: 'cdi', champs: { registres: ['langage-rh', 'langage-cip'] }, phrase: 'b' }
    ]);
    assert.strictEqual(r.ok, false);
    assert.match(r.erreur, /deux fois/);
  } finally { nettoyer(d); }
});

test('aide : chaque registre connu a une phrase d\'aide, et la liste des mots la transmet', () => {
  regles.REGISTRES_CONNUS.forEach((k) => assert.ok(mots.AIDE_REGISTRES[k] && mots.AIDE_REGISTRES[k].length > 20, 'aide manquante pour ' + k));
  Object.keys(mots.AIDE_REGISTRES).forEach((k) => assert.ok(regles.REGISTRES_CONNUS.indexOf(k) !== -1, 'aide pour un registre inconnu : ' + k));
  Object.keys(mots.AIDE_REGISTRES).forEach((k) => assert.ok(!/[—–]/.test(mots.AIDE_REGISTRES[k]), 'tiret long dans ' + k));
});
