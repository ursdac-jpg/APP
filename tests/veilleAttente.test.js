const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const A = require('../outils/veilleAttente.js');
const { creerDepot } = require('../outils/veilleDepot.js');

// Les fiches « inaccessibles pour l'instant » : un site fermé quelque temps garde sa fiche, son lien est caché au public (contenu/en-attente.txt, lu par l'application).
// Le FORMAT est celui de modules/mon-territoire/logique.js (testé dans monTerritoire.test.js) ; ici : l'écriture par l'outil et la publication.
// Les essais travaillent sur des registres FIGÉS (jamais sur les vrais fichiers).

const AUJ = '2026-10-31';
const IDS = { lieux: ['ccas-demo-24', 'asso-udaf-87'], employeurs: ['aldi'], offres: [] };

test('attente : « mettre » écrit la fiche avec la raison et la date du jour (constat et avis) ; la fiche doit exister', () => {
  const r = A.appliquer('', [{ op: 'mettre', registre: 'lieux', id: 'ccas-demo-24', motif: 'maintenance' }], AUJ, IDS);
  assert.ok(r.ok, r.erreur);
  assert.match(r.texte, /^lieux \| ccas-demo-24 \| maintenance \| 2026-10-31 \| 2026-10-31$/m);
  assert.deepStrictEqual(r.resume, { mises: 1, gardees: 0, retirees: 0 });
  assert.equal(A.appliquer('', [{ op: 'mettre', registre: 'lieux', id: 'fiche-inconnue', motif: 'panne' }], AUJ, IDS).ok, false, 'fiche absente du registre : refusée');
  assert.equal(A.appliquer('', [{ op: 'mettre', registre: 'lieux', id: 'ccas-demo-24', motif: 'au-hasard' }], AUJ, IDS).ok, false, 'raison inconnue : refusée');
  assert.equal(A.appliquer('', [{ op: 'mettre', registre: 'inconnu', id: 'ccas-demo-24', motif: 'panne' }], AUJ, IDS).ok, false, 'registre inconnu : refusé');
});

test('attente : « garder » renouvelle seulement le dernier avis (le constat reste) ; « retirer » fait revenir le lien', () => {
  const texte = A.appliquer('', [{ op: 'mettre', registre: 'employeurs', id: 'aldi', motif: 'securite' }], '2026-07-01', IDS).texte;
  const garde = A.appliquer(texte, [{ op: 'garder', registre: 'employeurs', id: 'aldi' }], AUJ, IDS);
  assert.ok(garde.ok);
  assert.match(garde.texte, /^employeurs \| aldi \| securite \| 2026-07-01 \| 2026-10-31$/m);
  const retire = A.appliquer(garde.texte, [{ op: 'retirer', registre: 'employeurs', id: 'aldi' }], AUJ, IDS);
  assert.ok(retire.ok);
  assert.ok(!/aldi/.test(retire.texte.split('\n').filter((l) => l[0] !== '#').join('\n')));
  assert.equal(A.appliquer('', [{ op: 'garder', registre: 'lieux', id: 'asso-udaf-87' }], AUJ, IDS).ok, false, 'une fiche qui n\'est pas en attente ne peut pas être gardée');
});

test('attente : une fiche retirée du registre dans la même publication quitte la liste ; un fichier illisible arrête tout', () => {
  const texte = A.appliquer('', [{ op: 'mettre', registre: 'lieux', id: 'ccas-demo-24', motif: 'panne' }, { op: 'mettre', registre: 'lieux', id: 'asso-udaf-87', motif: 'autre' }], AUJ, IDS).texte;
  const r = A.appliquer(texte, [], AUJ, null, { 'lieux:ccas-demo-24': true });
  assert.ok(r.ok);
  assert.ok(!/ccas-demo-24/.test(r.texte.split('\n').filter((l) => l[0] !== '#').join('\n')));
  assert.match(r.texte, /asso-udaf-87/);
  assert.equal(A.appliquer('lieux | ccas-demo-24 | panne | pas-une-date | 2026-10-31', [], AUJ, IDS).ok, false);
});

// ---------- publication dans un dépôt jetable ----------
const git = (d, ...a) => spawnSync('git', a, { cwd: d, encoding: 'utf8' });
const ecrire = (d, p, t) => { const c = path.join(d, p); fs.mkdirSync(path.dirname(c), { recursive: true }); fs.writeFileSync(c, t); };
const ENTETE_LIEUX = '# Registre des structures\n# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n#\n';
const LIEUX = ENTETE_LIEUX +
  'ccas-demo-24 | ccas | CCAS de Demo | aide sociale, domiciliation | Perigueux | | 05 53 00 00 00 | https://ccas-demo.example.org/ | 24 | logement | Source de depart | 2026-10-01\n' +
  'asso-udaf-87 | budget-endettement | UDAF de la Haute-Vienne | point conseil budget | Limoges | | | https://udaf87.example.org/ | 87 | budget | Source de depart | 2026-10-01\n';
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-attente-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/mon-territoire/contenu/lieux.txt', LIEUX);
  ecrire(d, 'modules/mon-territoire/contenu/employeurs.txt', '# Registre des employeurs\n#\n');
  ecrire(d, 'outils/veille.html', '<html></html>\n');
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test');t('essai',()=>{});\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyerDepot = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };

test('depot : mettre en attente, garder, réafficher ; la liste du registre montre l\'état ; retirer la fiche la sort aussi de la liste d\'attente', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ, maintenant: () => AUJ + ' 14:32' });
    const fichier = path.join(d, 'modules/mon-territoire/contenu/en-attente.txt');
    const r = depot.publier([{ type: 'attente', actions: [{ op: 'mettre', registre: 'lieux', id: 'ccas-demo-24', motif: 'maintenance' }, { op: 'mettre', registre: 'lieux', id: 'asso-udaf-87', motif: 'panne' }] }]);
    assert.ok(r.ok, r.erreur);
    assert.deepStrictEqual(r.resumeAttente, { mises: 2, gardees: 0, retirees: 0 });
    assert.match(fs.readFileSync(fichier, 'utf8'), /lieux \| ccas-demo-24 \| maintenance \| 2026-10-31 \| 2026-10-31/);
    const liste = depot.listerTerritoire('lieux').lignes.filter((l) => l.id === 'ccas-demo-24')[0];
    assert.equal(liste.attente.motif, 'maintenance');
    assert.equal(liste.attente.libelle, 'maintenance');
    assert.equal(liste.attente.jours, 0);
    assert.equal(liste.attente.arevoir, false);
    assert.equal(depot.listerTerritoire('lieux').lignes.filter((l) => l.id === 'asso-udaf-87')[0].attente.motif, 'panne');

    assert.equal(depot.publier([{ type: 'attente', actions: [{ op: 'garder', registre: 'lieux', id: 'ccas-demo-24' }] }]).ok, false, 'rien ne change le même jour : refusé sans bruit');
    const rr = depot.publier([{ type: 'attente', actions: [{ op: 'retirer', registre: 'lieux', id: 'ccas-demo-24' }] }]);
    assert.ok(rr.ok, rr.erreur);
    assert.ok(!/ccas-demo-24/.test(fs.readFileSync(fichier, 'utf8').split('\n').filter((l) => l[0] !== '#').join('\n')));
    assert.equal(depot.listerTerritoire('lieux').lignes.filter((l) => l.id === 'ccas-demo-24')[0].attente, undefined);

    // retirer la fiche du registre : sa ligne d'attente part avec elle (jamais une ligne orpheline)
    const rs = depot.publier([{ type: 'territoire', fichier: 'lieux', actions: [{ op: 'supprimer', id: 'asso-udaf-87' }] }]);
    assert.ok(rs.ok, rs.erreur);
    assert.ok(!/asso-udaf-87/.test(fs.readFileSync(fichier, 'utf8').split('\n').filter((l) => l[0] !== '#').join('\n')));
    assert.equal(depot.publier([{ type: 'attente', actions: [{ op: 'mettre', registre: 'lieux', id: 'asso-udaf-87', motif: 'panne' }] }]).ok, false, 'la fiche n\'existe plus');
  } finally { nettoyerDepot(d); }
});

test('depot : une fiche en attente depuis 90 jours sans nouvel avis est signalée « à revoir » ; « garder » relance le compte', () => {
  const d = depotJetable();
  try {
    ecrire(d, 'modules/mon-territoire/contenu/en-attente.txt', 'lieux | ccas-demo-24 | securite | 2026-07-01 | 2026-07-01\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'attente ancienne');
    const depot = creerDepot(d, { aujourdhui: () => AUJ, maintenant: () => AUJ + ' 14:32' });
    const avant = depot.listerTerritoire('lieux').lignes.filter((l) => l.id === 'ccas-demo-24')[0].attente;
    assert.equal(avant.jours, 122);
    assert.equal(avant.arevoir, true);
    assert.ok(depot.publier([{ type: 'attente', actions: [{ op: 'garder', registre: 'lieux', id: 'ccas-demo-24' }] }]).ok);
    const apres = depot.listerTerritoire('lieux').lignes.filter((l) => l.id === 'ccas-demo-24')[0].attente;
    assert.equal(apres.constat, '2026-07-01');
    assert.equal(apres.avis, AUJ);
    assert.equal(apres.arevoir, false);
  } finally { nettoyerDepot(d); }
});
