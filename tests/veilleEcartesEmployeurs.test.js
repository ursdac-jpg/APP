const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const E = require('../outils/veilleEcartes.js');

// Historique des employeurs écartés (consigne du 09/11/2026) : un employeur qui n'est plus en activité ou absent du territoire n'est plus reproposé, ni remplacé par un homonyme d'ailleurs.
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-emp-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai');
  git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# R\n\n## Les 0 fiche\n\n| id | titre |\n|---|---|\n');
  ecrire(d, 'modules/mon-territoire/contenu/communes-24.txt', '24322 | Périgueux | 24000 | 200040392 | CA Le Grand Périgueux\n24037 | Bergerac | 24100 | 200040392 | CA Bergeracoise\n');
  ecrire(d, 'modules/mon-territoire/contenu/communes-87.txt', '87085 | Limoges | 87000 | 248719312 | CU Limoges Métropole\n');
  ecrire(d, 'scripts/genererBaseVeille.js', "require('fs').writeFileSync(require('path').join(__dirname,'..','outils','base_fiches.js'),'x');");
  ecrire(d, 'scripts/genererRenvoisCadre.js', "require('fs').mkdirSync(require('path').join(__dirname,'..','data'),{recursive:true});require('fs').writeFileSync(require('path').join(__dirname,'..','data','lexique-renvois-cadre.js'),'x');");
  ecrire(d, 'tests/ok.test.js', "require('node:test')('ok',()=>{});");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  spawnSync(process.execPath, ['scripts/genererBaseVeille.js'], { cwd: d }); spawnSync(process.execPath, ['scripts/genererRenvoisCadre.js'], { cwd: d });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const ligne = (id, nom, commune, site) => [id, 'local', nom, 'automobile', commune + ':12 rue de la Gare', '', site || '', '', 'spontanee', 'Proposée par un assistant, source non donnée', ''].join(' | ');

test('reconnaissance : même nom dans le même département ; jamais un autre département, ni un autre établissement', () => {
  const info = (nom, communes, deps, site) => ({ nom, communes, deps, site });
  const e = E.creerEmployeur({ fichier: 'employeurs', original: { id: 'clara-24' }, nom: 'Clara Automobiles', info: info('Clara Automobiles', ['perigueux'], ['24'], 'https://www.clara-auto.fr'), lieu: 'Périgueux', motif: 'ferme', precision: 'BODACC 2026', date: '2026-11-09' });
  assert.ok(E.trouver([e], 'employeur', info('Clara Automobiles', ['perigueux'], ['24'], '')), 'même nom, même commune');
  assert.ok(E.trouver([e], 'employeur', info('CLARA automobiles', [], ['24'], '')), 'même nom, commune non précisée, même département');
  assert.strictEqual(E.trouver([e], 'employeur', info('Clara Automobiles', ['limoges'], ['87'], '')), null, 'autre département');
  assert.strictEqual(E.trouver([e], 'employeur', info('Clara Automobiles', ['bergerac'], ['24'], '')), null, 'autre établissement du même département');
  assert.strictEqual(E.trouver([e], 'employeur', info('Garage Gauthier', ['perigueux'], ['24'], '')), null, 'un autre employeur');
  assert.ok(E.trouver([e], 'employeur', info('Clara Auto Périgueux', ['perigueux'], ['24'], 'https://clara-auto.fr/contact')), 'même site, nom proche');
  assert.ok(E.trouver([e], 'employeur', info('Toyota Clara Automobiles', ['perigueux'], ['24'], '')), 'un nom plus long qui contient le nom écarté');
  // « absent du territoire » vise l'employeur dans tout le département, pas une seule commune
  const absent = E.creerEmployeur({ fichier: 'employeurs', original: null, nom: 'JBS Plomberie', info: info('JBS Plomberie', ['boulazac'], ['24'], ''), lieu: '', motif: 'absent', precision: '', date: '2026-11-09' });
  assert.ok(E.trouver([absent], 'employeur', info('JBS Plomberie', ['bergerac'], ['24'], '')), 'autre commune du même département');
  assert.strictEqual(E.trouver([absent], 'employeur', info('JBS Plomberie', ['limoges'], ['87'], '')), null, 'autre département');
});

test('le sas des employeurs : écarter demande une raison ; l\'employeur écarté n\'est plus proposé (et c\'est dit) ; un homonyme d\'ailleurs passe ; remettre le rend au sas', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-11-09' });
    const L1 = ligne('clara-automobiles-24', 'Clara Automobiles', 'Périgueux', 'https://www.clara-auto.fr');
    const imp = depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'importer', lignes: [L1] }] }]);
    assert.ok(imp.ok, JSON.stringify(imp));
    // sans raison : refusé, rien n'est retiré
    const sans = depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'ecarter', id: 'clara-automobiles-24' }] }]);
    assert.strictEqual(sans.ok, false); assert.match(sans.erreur, /pourquoi/);
    assert.strictEqual(depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'ecarter', id: 'clara-automobiles-24', motif: 'autre' }] }]).ok, false, '« autre » sans précision');
    assert.strictEqual(depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'ecarter', id: 'clara-automobiles-24', motif: 'public' }] }]).ok, false, 'une raison qui n\'est pas celle des employeurs');
    // avec une raison : la fiche quitte le sas, l'historique la garde avec son lieu
    const ec = depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'ecarter', id: 'clara-automobiles-24', motif: 'ferme', precision: 'Liquidation judiciaire, BODACC du 12/10/2026' }] }]);
    assert.ok(ec.ok, JSON.stringify(ec));
    let h = depot.listerEcartes(); assert.strictEqual(h.total, 1);
    assert.strictEqual(h.lignes[0].sorte, 'employeur'); assert.strictEqual(h.lignes[0].titre, 'Clara Automobiles'); assert.strictEqual(h.lignes[0].motif, 'ferme');
    assert.match(h.lignes[0].lieu, /Périgueux/); assert.match(h.lignes[0].lieu, /Dordogne/); assert.strictEqual(h.lignes[0].peutRemettre, true);
    // le même employeur proposé de nouveau (autre identifiant) : l'analyse dit « écartée », rien n'est importé, le compteur monte
    const a = depot.analyserLot('employeurs', ligne('clara-auto-perigueux', 'Clara Automobiles', 'Périgueux', ''));
    assert.ok(a.ok); assert.strictEqual(a.lignes[0].statut, 'ecartee'); assert.strictEqual(a.lignes[0].ecartee.motif, 'ferme'); assert.strictEqual(a.resume.ecartees, 1);
    const v = depot.publier([{ type: 'sas', fichier: 'employeurs', actions: [{ op: 'importer', lignes: [ligne('clara-auto-perigueux', 'Clara Automobiles', 'Périgueux', '')] }] }]);
    assert.ok(v.ok, JSON.stringify(v)); assert.strictEqual(v.resumeSas.importes, 0); assert.strictEqual(v.resumeSas.ecartes.length, 1);
    assert.strictEqual(depot.listerSas('employeurs').lignes.length, 0);
    assert.strictEqual(depot.listerEcartes().lignes[0].reproposee.nb, 1);
    // un homonyme dans un autre département, ou une autre commune du même département : proposés normalement
    assert.strictEqual(depot.analyserLot('employeurs', ligne('clara-limoges', 'Clara Automobiles', 'Limoges', '')).lignes[0].statut, 'prete');
    assert.strictEqual(depot.analyserLot('employeurs', ligne('clara-bergerac', 'Clara Automobiles', 'Bergerac', '')).lignes[0].statut, 'prete');
    // remettre : la fiche d'origine retourne dans le sas, à l'identique, et l'historique se vide
    const m = depot.publier([{ type: 'ecartes', actions: [{ op: 'remettre', id: h.lignes[0].id }] }]);
    assert.ok(m.ok, JSON.stringify(m)); assert.strictEqual(depot.listerEcartes().total, 0);
    const cartes = depot.listerSas('employeurs').lignes; assert.strictEqual(cartes.length, 1); assert.strictEqual(cartes[0].id, 'clara-automobiles-24');
    assert.strictEqual(git(d, 'status', '--porcelain').sortie.trim(), '', 'tout est enregistré dans Git');
  } finally { nettoyer(d); }
});

test('noter un employeur disparu à la main : demande le territoire et la raison, puis il n\'est plus proposé ; on peut le retirer de l\'historique', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-11-09' });
    const noter = (a) => depot.publier([{ type: 'ecartes', actions: [Object.assign({ op: 'noter' }, a)] }]);
    assert.strictEqual(noter({ nom: '', dep: '24', motif: 'ferme' }).ok, false);
    assert.strictEqual(noter({ nom: 'JBS Plomberie', motif: 'absent' }).ok, false, 'sans territoire');
    assert.strictEqual(noter({ nom: 'JBS Plomberie', dep: '24', motif: 'public' }).ok, false, 'raison non valable');
    const r = noter({ nom: 'JBS Plomberie', dep: '24', motif: 'absent', precision: '' });
    assert.ok(r.ok, JSON.stringify(r));
    const h = depot.listerEcartes(); assert.strictEqual(h.total, 1); assert.strictEqual(h.lignes[0].peutRemettre, false); assert.match(h.lignes[0].lieu, /Dordogne/);
    assert.strictEqual(depot.analyserLot('employeurs', ligne('jbs-plomberie-bergerac', 'JBS Plomberie', 'Bergerac', '')).lignes[0].statut, 'ecartee');
    assert.strictEqual(depot.analyserLot('employeurs', ligne('jbs-plomberie-limoges', 'JBS Plomberie', 'Limoges', '')).lignes[0].statut, 'prete');
    const m = depot.publier([{ type: 'ecartes', actions: [{ op: 'remettre', id: h.lignes[0].id }] }]);
    assert.ok(m.ok, JSON.stringify(m)); assert.strictEqual(depot.listerEcartes().total, 0);
    assert.strictEqual(depot.analyserLot('employeurs', ligne('jbs-plomberie-bergerac', 'JBS Plomberie', 'Bergerac', '')).lignes[0].statut, 'prete');
  } finally { nettoyer(d); }
});

test('les changements et les fiches gardent leurs propres raisons', () => {
  assert.deepStrictEqual(E.MOTIFS_INFO, ['public', 'couvert', 'faux', 'autre']);
  assert.deepStrictEqual(E.MOTIFS_EMPLOYEUR, ['ferme', 'absent', 'introuvable', 'autre']);
  ['ferme', 'absent', 'introuvable'].forEach((m) => assert.ok(E.LIBELLES_MOTIFS[m]));
});
