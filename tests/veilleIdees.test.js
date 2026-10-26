const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const idees = require('../outils/veilleIdees.js');
const { creerDepot } = require('../outils/veilleDepot.js');

const EXISTANTS = [
  { id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', variantes: ['contrat fixe'] },
  { id: 'cse', titre: 'CSE', titreDeTri: 'CSE', variantes: ['comité social et économique'] },
  { id: 'cesu', titre: 'CESU (chèque emploi service universel)', titreDeTri: 'CESU', variantes: [] }
];
const CTX = { existants: EXISTANTS, aujourdhui: '2026-10-20' };

test('liste : ajouter un mot ecrit une ligne, relue telle quelle ; un mot du Lexique ou deja en liste est ignore, jamais ecrit deux fois', () => {
  const r = idees.appliquer('', [{ op: 'ajouter', mot: 'Forfait jours', origine: 'saisi par vous : rendez-vous', porte: 'saisie' }, { op: 'ajouter', mot: 'cdi' }, { op: 'ajouter', mot: 'comité social et économique' }, { op: 'ajouter', mot: 'forfait   JOURS' }], CTX);
  assert.ok(r.ok);
  assert.strictEqual(r.resume.ajoutees.length, 1);
  assert.deepStrictEqual(r.resume.ignorees.map((x) => x.raison), ['existe', 'existe', 'deja-dans-la-liste']);
  assert.strictEqual(r.resume.ignorees[0].id, 'cdi');
  const lignes = idees.parser(r.texte).map(idees.versObjet);
  assert.strictEqual(lignes.length, 1);
  assert.strictEqual(lignes[0].mot, 'Forfait jours');
  assert.strictEqual(lignes[0].etat, 'trier');
  assert.strictEqual(lignes[0].origine, 'saisi par vous : rendez-vous');
  assert.strictEqual(lignes[0].creeLe, '2026-10-20');
  assert.ok(/^#/.test(r.texte), 'l\'en-tete explique que l\'application ne lit pas ce fichier');
  assert.match(r.texte, /L'application NE LIT PAS/);
});
test('liste : un mot proche d\'un mot existant est ajoute mais signale', () => {
  const r = idees.appliquer('', [{ op: 'ajouter', mot: 'chèque emploi service' }], CTX);
  assert.ok(r.ok);
  assert.strictEqual(r.resume.ajoutees[0].proche.id, 'cesu');
});
test('liste : changer l\'etat, ecarter avec un motif (obligatoire et connu), ecrire un brouillon (la liste passe alors « en redaction »)', () => {
  const k = idees.cle('Forfait jours');
  let t = idees.appliquer('', [{ op: 'ajouter', mot: 'Forfait jours' }], CTX).texte;
  assert.ok(!idees.appliquer(t, [{ op: 'etat', k: k, etat: 'ecarte' }], CTX).ok, 'écarter sans motif est refusé');
  assert.ok(!idees.appliquer(t, [{ op: 'etat', k: k, etat: 'ecarte', motif: 'je ne sais pas' }], CTX).ok);
  assert.ok(!idees.appliquer(t, [{ op: 'etat', k: 'inconnu', etat: 'plustard' }], CTX).ok);
  assert.ok(!idees.appliquer(t, [{ op: 'etat', k: k, etat: 'publie' }], CTX).ok, 'publié ne se fixe pas à la main');
  t = idees.appliquer(t, [{ op: 'etat', k: k, etat: 'plustard' }], CTX).texte;
  assert.strictEqual(idees.parser(t)[0].etat, 'plustard');
  t = idees.appliquer(t, [{ op: 'brouillon', k: k, champs: { titre: 'Forfait jours', titreDeTri: 'Forfait jours', univers: 'droit-travail', registres: ['langage-rh', 'langage-juridique'], variantes: ['forfait annuel en jours', 'cadre au forfait'], corps: 'Un texte | avec une barre. Une autre phrase.', relations: [['cdi', 'voir-aussi'], ['cse', 'a-ne-pas-confondre']] } }], CTX).texte;
  const b = idees.versObjet(idees.parser(t)[0]);
  assert.strictEqual(b.etat, 'redaction');
  assert.deepStrictEqual(b.brouillon.registres, ['langage-rh', 'langage-juridique']);
  assert.deepStrictEqual(b.brouillon.variantes, ['forfait annuel en jours', 'cadre au forfait']);
  assert.deepStrictEqual(b.brouillon.relations, [['cdi', 'voir-aussi'], ['cse', 'a-ne-pas-confondre']]);
  assert.strictEqual(b.brouillon.corps, 'Un texte / avec une barre. Une autre phrase.', 'la barre verticale du texte devient « / » (elle sépare les colonnes)');
  t = idees.appliquer(t, [{ op: 'etat', k: k, etat: 'ecarte', motif: idees.MOTIFS[0] }], CTX).texte;
  const e = idees.parser(t)[0];
  assert.strictEqual(e.etat, 'ecarte');
  assert.strictEqual(e.motif, idees.MOTIFS[0]);
  const again = idees.appliquer(t, [{ op: 'ajouter', mot: 'Forfait jours' }], CTX);
  assert.deepStrictEqual(again.resume.ignorees.map((x) => x.etat), ['ecarte'], 'une idée écartée ne revient pas');
});
test('liste : refus clairs (action inconnue, mot vide ou trop long, tiret long)', () => {
  assert.ok(!idees.appliquer('', [{ op: 'inconnue' }], CTX).ok);
  assert.ok(!idees.appliquer('', [{ op: 'ajouter', mot: '  ' }], CTX).ok);
  assert.ok(!idees.appliquer('', [{ op: 'ajouter', mot: 'x'.repeat(121) }], CTX).ok);
  assert.ok(!idees.appliquer('', [{ op: 'ajouter', mot: 'un ' + String.fromCharCode(0x2014) + ' mot' }], CTX).ok);
  assert.ok(!idees.appliquer('', [null], CTX).ok);
});
test('liste : les fins de ligne du fichier sont conservees', () => {
  const t = idees.appliquer('', [{ op: 'ajouter', mot: 'Mot un' }], CTX).texte.replace(/\n/g, '\r\n');
  const r = idees.appliquer(t, [{ op: 'ajouter', mot: 'Mot deux' }], CTX);
  assert.ok(r.texte.indexOf('\r\n') !== -1 && !/[^\r]\n/.test(r.texte));
  assert.strictEqual(idees.parser(r.texte).length, 2);
});

// ---------- le reperage (porte A) sur un mini depot ----------
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function fiche(titre, termes, corps) {
  return '---\nid: x\ntitre: "' + titre + '"\nlexique:\n' + termes.map((t) => '  - terme: "' + t + '"\n    definition: "Une definition."').join('\n') + '\n---\n\n' + corps + '\n';
}
test('reperage : les mots expliques dans une fiche du cadre sans fiche du Lexique, et les sigles qui reviennent, avec leur raison ; rien qui existe deja', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-idees-'));
  try {
    const c = 'modules/comprendre-le-cadre/contenu/emploi/';
    ecrire(d, c + 'a.md', fiche('Fiche A', ['délai de carence', 'CDI', 'niveau A2', 'comité social et économique (CSE)'], 'On parle du SIAD ici. Le SIAD revient.'));
    ecrire(d, c + 'b.md', fiche('Fiche B', ['délai de carence'], 'Le SIAD aussi. Le CDI aussi.'));
    ecrire(d, c + 'c.md', fiche('Fiche C', [], 'Encore le SIAD. Le délai de carence.'));
    ecrire(d, c + 'a.collecte.md', 'jamais lu : ZZZ ZZZ ZZZ');
    ecrire(d, 'modules/comprendre-les-chiffres/contenu/portrait.md', 'Le SIAD et le CHRS.');
    ecrire(d, 'modules/mon-territoire/contenu/lieux.txt', '# commentaire\nid1 | Centre CHRS Un | x\nid2 | Centre CHRS Deux | y\nid3 | Autre | z\n');
    const r = idees.repererIdees(d, EXISTANTS, [], {});
    const mots = r.idees.map((i) => i.mot);
    assert.ok(mots.indexOf('délai de carence') !== -1);
    assert.ok(mots.indexOf('SIAD') !== -1, 'un sigle dans au moins 3 fichiers');
    assert.ok(mots.indexOf('CHRS') !== -1, 'un sigle de structures');
    ['CDI', 'niveau A2', 'comité social et économique (CSE)', 'ZZZ'].forEach((m) => assert.ok(mots.indexOf(m) === -1, m + ' ne doit pas être proposé'));
    const carence = r.idees.find((i) => i.mot === 'délai de carence');
    assert.strictEqual(carence.matiere, 'Une definition.', 'la définition déjà écrite est la matière, jamais le texte du mot');
    assert.match(carence.origine, /fiche du cadre « Fiche A »/);
    assert.ok(r.idees.every((i) => i.origine), 'chaque idée arrive avec sa raison d\'être');
    assert.ok(mots.indexOf('SIAD') < mots.indexOf('CHRS'), 'les plus fortes preuves d\'abord');
    assert.strictEqual(idees.repererIdees(d, EXISTANTS, ['SIAD', 'délai de carence'], {}).idees.filter((i) => ['SIAD', 'délai de carence'].indexOf(i.mot) !== -1).length, 0, 'une idée déjà en liste (même écartée) ne revient pas');
    assert.ok(idees.repererIdees(d, EXISTANTS, [], { max: 1 }).idees.length === 1, 'plafond');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

// ---------- depot : liste et publication d'un mot depuis la liste ----------
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
const LEXIQUE = "var LEXIQUE_FICHES = [\n  {\n    id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', type: 'terme',\n    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],\n    variantesRecherche: ['contrat fixe'],\n    corps: \"Un CDI est un contrat. Il est courant.\",\n    relations: []\n  }\n];\n\nvar LEXIQUE_COLLECTIONS = [];\n";
function depotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-liste-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  fs.mkdirSync(path.join(d, 'modules/comprendre-le-cadre/contenu/emploi'), { recursive: true });
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# Rayon\n');
  ecrire(d, 'data/lexique.js', LEXIQUE);
  ecrire(d, 'scripts/checkLexique.js', "console.log('Aucune erreur.');\n");
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test');t('essai',()=>{});\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
test('depot : ajouter, ecarter puis publier un mot depuis la liste ; la ligne passe a « publie », l\'evolution et le Lexique sont a jour', () => {
  const d = depotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: () => '2026-10-20 15:00' });
    const sans = depot.publier([{ type: 'mots-liste', actions: [{ op: 'ajouter', mot: 'CDI' }] }]);
    assert.ok(!sans.ok); assert.strictEqual(sans.code, 'mots-liste-rien');
    assert.match(sans.erreur, /existe déjà/);
    const r = depot.publier([{ type: 'mots-liste', actions: [{ op: 'ajouter', mot: 'Forfait jours', porte: 'saisie', origine: 'saisi par vous' }, { op: 'ajouter', mot: 'Mot inutile', porte: 'saisie' }] }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(r.resumeListe.ajoutees.length, 2);
    let l = depot.listerListe();
    assert.deepStrictEqual(l.nb, { trier: 2, redaction: 0, plustard: 0, ecarte: 0, publie: 0 });
    const k = l.lignes.find((x) => x.mot === 'Forfait jours').k;
    assert.ok(depot.publier([{ type: 'mots-liste', actions: [{ op: 'etat', k: l.lignes.find((x) => x.mot === 'Mot inutile').k, etat: 'ecarte', motif: 'trop pointu ou éphémère' }] }]).ok);
    const mot = { id: 'forfait-jours', titre: 'Forfait jours', titreDeTri: 'Forfait jours', univers: 'droit-travail', registres: ['langage-rh'], variantes: ['forfait annuel'], corps: 'Un forfait en jours compte le travail en jours. Il ne compte pas les heures.', relations: [['cdi', 'voir-aussi']] };
    const p = depot.publier([{ type: 'lexique-nouveau', mot: mot, origine: 'saisi par vous', sasId: k }]);
    assert.ok(p.ok, JSON.stringify(p));
    assert.deepStrictEqual(p.nouveauxMots, ['forfait-jours']);
    l = depot.listerListe();
    assert.deepStrictEqual(l.nb, { trier: 0, redaction: 0, plustard: 0, ecarte: 1, publie: 1 });
    assert.ok(depot.listerMots().mots.some((m) => m.id === 'forfait-jours'));
    assert.match(fs.readFileSync(path.join(d, 'data/lexique.js'), 'utf8'), /id: 'forfait-jours'/);
    assert.match(git(d, 'show', '--name-only', '--format=%s', 'HEAD').sortie, /mots\.sas\.txt/);
    const a = depot.annuler();
    assert.ok(a.ok, JSON.stringify(a));
    assert.ok(!depot.listerMots().mots.some((m) => m.id === 'forfait-jours'));
    assert.strictEqual(depot.listerListe().nb.redaction + depot.listerListe().nb.trier, 1, 'l\'annulation remet la ligne comme avant');
    // un mot ecarte ne revient pas
    const encore = depot.publier([{ type: 'mots-liste', actions: [{ op: 'ajouter', mot: 'Mot inutile' }] }]);
    assert.ok(!encore.ok); assert.match(encore.erreur, /déjà dans votre liste/);
    // chercher
    assert.deepStrictEqual(depot.chercherMot({ mot: 'contrat fixe' }).exact, { id: 'cdi', titre: 'CDI' });
    assert.strictEqual(depot.chercherMot({ mot: 'Mot inutile' }).dansLaListe.etat, 'ecarte');
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});
