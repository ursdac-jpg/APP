const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerEnvoi, NOM_DOSSIER } = require('../outils/veilleEnvoi.js');

function git(d, ...args) { const r = spawnSync('git', args, { cwd: d, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(d, chemin, texte) { const p = path.join(d, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte); }
function enregistrer(d, message, date) {
  git(d, 'add', '-A');
  const env = Object.assign({}, process.env, date ? { GIT_AUTHOR_DATE: date, GIT_COMMITTER_DATE: date } : {});
  spawnSync('git', ['commit', '-q', '-m', message], { cwd: d, env: env });
}
function depot() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-envoi-'));
  git(d, 'init', '-q', '-b', 'master');
  git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, '.gitignore', NOM_DOSSIER + '/\n');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
function fichiersDe(dossier) {
  const sortie = [];
  (function lire(d, pre) { fs.readdirSync(d, { withFileTypes: true }).forEach((e) => { if (e.isDirectory()) { lire(path.join(d, e.name), pre + e.name + '/'); } else { sortie.push(pre + e.name); } }); })(dossier, '');
  return sortie.sort();
}

test('envoi : sans envoi precedent connu, tout est prepare, en lots de 100 au plus, ranges comme dans le depot', () => {
  const d = depot();
  try {
    for (let i = 0; i < 230; i++) { ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/fiche-' + String(i).padStart(3, '0') + '.md', 'f' + i); }
    ecrire(d, 'data/lexique.js', 'lexique');
    enregistrer(d, 'depart');
    const r = creerEnvoi(d).preparer();
    assert.ok(r.ok);
    assert.strictEqual(r.nbFichiers, 232);   // 230 fiches + lexique + .gitignore
    assert.strictEqual(r.nbLots, 3);
    assert.deepStrictEqual(r.lots, ['lot-01', 'lot-02', 'lot-03']);
    const sortie = path.join(d, NOM_DOSSIER);
    ['lot-01', 'lot-02', 'lot-03'].forEach((lot, i) => {
      const f = fichiersDe(path.join(sortie, lot));
      assert.ok(f.length <= 100 && f.length > 0, lot + ' : ' + f.length);
      if (i < 2) { assert.strictEqual(f.length, 100); }
    });
    // arborescence conservee
    assert.ok(fichiersDe(path.join(sortie, 'lot-01')).some((c) => c.indexOf('modules/comprendre-le-cadre/contenu/emploi/fiche-') === 0));
    assert.ok(fs.existsSync(path.join(sortie, 'LISEZ-MOI.txt')));
    assert.match(fs.readFileSync(path.join(sortie, 'LISEZ-MOI.txt'), 'utf8'), /232 fichiers modifies[\s\S]*3 lots de 100/);
    assert.ok(!fs.existsSync(path.join(sortie, 'A_SUPPRIMER_sur_GitHub.txt')));
  } finally { nettoyer(d); }
});

test('envoi : apres « J\'ai tout envoye », seuls les fichiers modifies partent, dans leur dossier, les autres restent', () => {
  const d = depot();
  try {
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/A.md', 'a');
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/B.md', 'b');
    ecrire(d, 'modules/comprendre-le-cadre/contenu/budget/C.md', 'c');
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/2026-06.md', 'chiffres');
    ecrire(d, 'data/lexique.js', 'lexique 1');
    enregistrer(d, 'depart');
    const envoi = creerEnvoi(d);
    assert.ok(envoi.marquerEnvoye().ok);
    assert.strictEqual(envoi.etat().nbFichiers, 0);
    // modifications : B (emploi), le lexique, et un nouveau chiffres ; A et C inchanges
    ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/B.md', 'b modifie');
    ecrire(d, 'data/lexique.js', 'lexique 2');
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/2026-09.md', 'chiffres 09');
    enregistrer(d, 'maj');
    const r = envoi.preparer();
    assert.ok(r.ok);
    assert.strictEqual(r.nbFichiers, 3);
    assert.strictEqual(r.nbLots, 1);
    assert.deepStrictEqual(fichiersDe(path.join(d, NOM_DOSSIER, 'lot-01')), [
      'data/lexique.js', 'modules/comprendre-le-cadre/contenu/emploi/B.md', 'modules/comprendre-les-chiffres/contenu/2026-09.md'
    ]);
    assert.strictEqual(fs.readFileSync(path.join(d, NOM_DOSSIER, 'lot-01', 'modules/comprendre-le-cadre/contenu/emploi/B.md'), 'utf8'), 'b modifie');
    assert.ok(!fichiersDe(path.join(d, NOM_DOSSIER)).some((c) => /A\.md$|C\.md$/.test(c)), 'les fichiers inchanges ne doivent pas partir');
  } finally { nettoyer(d); }
});

test('envoi : un fichier supprime est liste a part, et le dossier de sortie est refait a neuf a chaque preparation', () => {
  const d = depot();
  try {
    ecrire(d, 'docs/a.md', 'a'); ecrire(d, 'docs/b.md', 'b');
    enregistrer(d, 'depart');
    const envoi = creerEnvoi(d);
    envoi.marquerEnvoye();
    fs.rmSync(path.join(d, 'docs/b.md'));
    ecrire(d, 'docs/a.md', 'a2');
    enregistrer(d, 'maj');
    const r = envoi.preparer();
    assert.deepStrictEqual(r.supprimes, ['docs/b.md']);
    assert.match(fs.readFileSync(path.join(d, NOM_DOSSIER, 'A_SUPPRIMER_sur_GitHub.txt'), 'utf8'), /docs\/b\.md/);
    // un reste d'une preparation precedente disparait
    ecrire(d, NOM_DOSSIER + '/vieux-reste.txt', 'x');
    const r2 = envoi.preparer();
    assert.ok(r2.ok);
    assert.ok(!fs.existsSync(path.join(d, NOM_DOSSIER, 'vieux-reste.txt')));
  } finally { nettoyer(d); }
});

test('envoi : sans etiquette, une date de dernier envoi limite aux fichiers modifies apres cette date', () => {
  const d = depot();
  try {
    ecrire(d, 'docs/ancien.md', 'a'); enregistrer(d, 'ancien', '2026-08-01T10:00:00');
    ecrire(d, 'docs/recent.md', 'r'); enregistrer(d, 'recent', '2026-09-20T10:00:00');
    const envoi = creerEnvoi(d);
    const r = envoi.preparer('2026-09-01');
    assert.ok(r.ok);
    assert.strictEqual(r.depart.origine, 'date');
    assert.deepStrictEqual(fichiersDe(path.join(d, NOM_DOSSIER, 'lot-01')), ['docs/recent.md']);
    assert.strictEqual(envoi.preparer('2026-13-45').ok, false);
    assert.strictEqual(envoi.preparer('nimporte quoi').ok, false);
    // une date anterieure a tout : tout part
    assert.strictEqual(envoi.preparer('2020-01-01').nbFichiers, 3);   // .gitignore + 2 fiches
  } finally { nettoyer(d); }
});

test('envoi : un fichier en cours de travail (non enregistre) part dans sa version ENREGISTREE', () => {
  const d = depot();
  try {
    ecrire(d, 'docs/a.md', 'version enregistree'); enregistrer(d, 'depart');
    ecrire(d, 'docs/a.md', 'brouillon pas fini');
    const r = creerEnvoi(d).preparer();
    assert.ok(r.ok);
    assert.strictEqual(r.modificationsNonEnregistrees, 1);
    assert.strictEqual(fs.readFileSync(path.join(d, NOM_DOSSIER, 'lot-01', 'docs/a.md'), 'utf8'), 'version enregistree');
  } finally { nettoyer(d); }
});

test('envoi : le dossier de sortie n\'est jamais envoye lui-meme ; « J\'ai tout envoye » est une etiquette locale, jamais un push', () => {
  const d = depot();
  try {
    ecrire(d, 'docs/a.md', 'a'); enregistrer(d, 'depart');
    const envoi = creerEnvoi(d);
    envoi.preparer();
    assert.ok(!envoi.preparer().ok === false);
    assert.ok(!fichiersDe(path.join(d, NOM_DOSSIER)).some((c) => c.indexOf(NOM_DOSSIER) !== -1));
    assert.ok(envoi.marquerEnvoye().ok);
    assert.match(git(d, 'tag').sortie, /envoye-github/);
    assert.strictEqual(git(d, 'remote').sortie.trim(), '');
    const src = fs.readFileSync(path.join(__dirname, '..', 'outils', 'veilleEnvoi.js'), 'utf8');
    assert.ok(!/'push'|"push"|shell\s*:\s*true|(^|[^.\w])exec\(|execSync/.test(src));
  } finally { nettoyer(d); }
});
