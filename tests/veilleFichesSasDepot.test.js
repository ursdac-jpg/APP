const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');

// Depot jetable (jamais le vrai) : meme montage que tests/veilleDepot.test.js, avec une fiche lisible champ par champ.
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
const README = '# Rayon\n\n## Les 2 fiches\n\n| id | titre |\n|---|---|\n| `emploi-un` | Premier |\n| `emploi-deux` | Deuxieme |\n\nSuite du texte.\n';
function fiche(id, titre) {
  return '---\nid: ' + id + '\nrayon: emploi\ntitre: "' + titre + '"\npour_qui: "Utile si essai."\ntags: [essai]\nterritoire: national\nstatut: actif\nfrein: false\nverifie_le: 2026-09-01\nsources:\n  - source-un\nrevisions: []\ncollecte: emploi.collecte.md\n---\n\nCorps de la fiche.\n';
}
function creerDepotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-fsas-'));
  git(d, 'init', '-q', '-b', 'master'); ecrire(d, '.gitignore', 'outils/controles/\n'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', README);
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md', fiche('emploi-un', 'Premier'));
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-deux.md', fiche('emploi-deux', 'Deuxieme'));
  ecrire(d, 'scripts/genererBaseVeille.js', "const fs=require('fs'),p=require('path');fs.mkdirSync(p.join(__dirname,'..','outils'),{recursive:true});fs.writeFileSync(p.join(__dirname,'..','outils','base_fiches.js'),'// '+fs.readdirSync(p.join(__dirname,'..','modules/comprendre-le-cadre/contenu/emploi')).length+'\\n');\n");
  ecrire(d, 'scripts/genererRenvoisCadre.js', "const fs=require('fs'),p=require('path');fs.mkdirSync(p.join(__dirname,'..','data'),{recursive:true});fs.writeFileSync(p.join(__dirname,'..','data','lexique-renvois-cadre.js'),'// ok\\n');\n");
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test');t('essai',()=>{});\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  spawnSync(process.execPath, ['scripts/genererBaseVeille.js'], { cwd: d }); spawnSync(process.execPath, ['scripts/genererRenvoisCadre.js'], { cwd: d });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const lire = (d, c) => fs.readFileSync(path.join(d, c), 'utf8');

test('sas des fiches : du texte collé à la publication, pour une mise à jour, une nouvelle fiche et un retrait', () => {
  const d = creerDepotDeTest(); const depot = creerDepot(d);
  try {
    // 1. lecture de ce que l'assistant a répondu (rien n'est écrit)
    const lu = depot.lireReponseFichesSas({ rayon: 'emploi', texte: [
      '[FICHE]', 'id: emploi-un', 'titre: Premier', 'revisions:', '  - "2026-10 : paragraphe précisé"', 'texte:', 'Corps de la fiche, précisé.', '[/FICHE]',
      '[FICHE]', 'titre: Une fiche neuve', 'pour_qui: Utile si neuf.', 'tags: [neuf]', 'sources:', '  - source-un', 'texte:', 'Un paragraphe neuf.', '[/FICHE]',
      '[RETRAIT]', 'fiche: emploi-deux', 'raison: plus d\'actualité', '[/RETRAIT]'].join('\n') });
    assert.strictEqual(lu.ok, true); assert.deepStrictEqual(lu.items.map((i) => i.proposition.genre), ['maj', 'nouv', 'ret']);
    lu.items.forEach((i) => assert.deepStrictEqual(i.problemes, [], i.id));
    assert.strictEqual(fs.existsSync(path.join(d, 'outils/sas/fiches.sas.txt')), false);

    // 2. rangement dans le sas (aucun test lancé, rien de public)
    const ranger = depot.publier([{ type: 'fiches-sas', actions: [{ op: 'importer', items: lu.items.map((i) => i.proposition) }] }]);
    assert.strictEqual(ranger.ok, true, ranger.erreur); assert.strictEqual(ranger.resumeFichesSas.importes, 3);
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md'), /Corps de la fiche\.\n$/);
    const liste = depot.listerFichesSas(); assert.strictEqual(liste.total, 3);
    assert.ok(liste.lignes.every((l) => l.demande), 'chaque proposition porte sa demande de publication');
    // le repère « pré-vérifié » reste sur le poste : aucun enregistrement Git, et il tombe si la proposition est remplacée
    const pre = depot.marquerPrevFichesSas({ id: 'maj-emploi-un', prev: true });
    assert.strictEqual(pre.ok, true); assert.ok(depot.listerFichesSas().lignes.filter((l) => l.id === 'maj-emploi-un')[0].prev);
    assert.strictEqual(git(d, 'status', '--porcelain', '--', 'outils/controles').sortie.trim(), '');   // dossier ignoré par Git (ajouté au .gitignore du dépôt d'essai)
    assert.strictEqual(depot.marquerPrevFichesSas({ id: 'inconnue', prev: true }).ok, false);

    // 3. « C'est bon » sur les trois : les demandes partent avec le retrait des propositions du sas, en UN enregistrement
    const l = depot.listerFichesSas().lignes, par = (g) => l.filter((x) => x.genre === g)[0];
    const maj = Object.assign({}, par('maj').demande, { revision: 'paragraphe précisé' });
    const r = depot.publier([maj, par('nouv').demande, par('ret').demande, { type: 'fiches-sas', actions: l.map((x) => ({ op: 'retirer', id: x.id })) }]);
    assert.strictEqual(r.ok, true, r.erreur + ' ' + (r.details || ''));
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md'), /Corps de la fiche, précisé\./);
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-un.md'), /2026-\d\d : paragraphe précisé/);
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-deux.md'), /statut: retire/);
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-deux.md'), /retire_raison: "plus d'actualité"/);
    const neuve = lire(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-une-fiche-neuve.md');
    assert.match(neuve, /^---\nid: emploi-une-fiche-neuve\nrayon: emploi\n/); assert.match(neuve, /\nUn paragraphe neuf\.\n$/);
    assert.match(lire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md'), /\| `emploi-une-fiche-neuve` \| Une fiche neuve \|/);
    assert.strictEqual(depot.listerFichesSas().total, 0);
    assert.strictEqual(git(d, 'log', '--oneline').sortie.trim().split('\n').length, 3);   // départ, rangement, publication
    // 4. l'annulation de la dernière publication remet tout, sas compris
    assert.strictEqual(depot.annuler().ok, true);
    assert.strictEqual(depot.listerFichesSas().total, 3);
    assert.ok(!fs.existsSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi/emploi-une-fiche-neuve.md')));
  } finally { nettoyer(d); }
});

test('sas des fiches : une proposition refusée par les contrôles reste dans le sas avec son problème dit en clair', () => {
  const d = creerDepotDeTest(); const depot = creerDepot(d);
  try {
    const lu = depot.lireReponseFichesSas({ rayon: 'emploi', texte: '[FICHE]\nid: emploi-un\ntitre: Premier\ntexte:\nUn ' + String.fromCharCode(0x2014) + ' tiret long.\n[/FICHE]' });
    assert.match(lu.items[0].problemes.join(' '), /tiret/);
    const brut = depot.lireReponseFichesSas({ rayon: 'emploi', texte: 'Un texte copié à la main, sans bloc.' });
    assert.strictEqual(brut.items[0].proposition.genre, 'brut');
    const sans = depot.lireReponseFichesSas({ texte: '[FICHE]\ntitre: Sans rayon\ntexte:\nx\n[/FICHE]' });
    assert.match(sans.notes.join(' '), /rayon/);
    assert.strictEqual(depot.publier([{ type: 'fiches-sas', actions: [{ op: 'retirer', id: 'maj-absente' }] }]).ok, false);
    assert.strictEqual(depot.promptFicheSas({ id: 'maj-absente' }).ok, false);
  } finally { nettoyer(d); }
});
