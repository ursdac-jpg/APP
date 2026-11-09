// Demande de Denis (09/11/2026) : « il ne doit plus jamais y avoir de doublon ». Il avait versé dans le sas 5 fiches déjà écrites et 8 changements déjà publiés.
// Trois gardes, indépendantes de ce que la page affiche : le sas des fiches, le sas des changements et la liste de « Travailler avec Claude » refusent ce qui est déjà pris en compte.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const C = require('../outils/veilleChangements.js');
const S = require('../outils/veilleFichesSas.js');
const F = require('../outils/veilleFiche.js');
const { creerRetours } = require('../outils/veilleRetours.js');

const RACINE = path.join(__dirname, '..');
const CADRE = path.join(RACINE, 'tests', 'fixtures', 'veille_fiches_sas');
const AUJ = '2026-11-09';

/* ---------- le sas des changements ---------- */
const v = {
  mois: '2026-10', periode: 'octobre 2026', domaine: 'Emploi et contrats de travail', intitule: 'Un changement déjà publié',
  nature: 'décret du 2026-10-06', en_vigueur: '2026-10-08', concerne: 'salariés', ce_qui_change: 'texte du changement.',
  source_titre: 'La page', source_url: 'https://www.service-public.gouv.fr/a', origine: 'balayage'
};
const digestAvec = (vv) => C.integrerDansDigest('', vv, '2026-11-09', vv.periode).texte;

test('changements : un changement déjà publié à l\'identique n\'entre pas dans le sas, et le résumé le dit', () => {
  const ctx = { aujourdhui: AUJ, digest: (m) => (m === '2026-10' ? digestAvec(v) : '') };
  const r = C.appliquer(C.ecrireSas([], '\n'), [{ op: 'importer', lignes: [v, Object.assign({}, v, { intitule: 'Un autre changement' })] }], ctx);
  assert.ok(r.ok);
  assert.strictEqual(r.resume.importes, 1);
  assert.deepStrictEqual(r.resume.dejaPublies.map((x) => x.titre), ['Un changement déjà publié']);
  assert.deepStrictEqual(C.parserSas(r.texteSas).map((l) => l.intitule), ['Un autre changement']);
});

test('changements : la date de vérification ne compte pas, mais un texte différent reste une mise à jour possible, et « forcer » passe toujours', () => {
  const publie = digestAvec(v).replace(/Vérifié le : .*/, 'Vérifié le : 2026-01-01');
  const ctx = { aujourdhui: AUJ, digest: () => publie };
  assert.strictEqual(C.identiquePublie(publie, v), true);
  const modifie = Object.assign({}, v, { ce_qui_change: 'un texte corrigé.' });
  assert.strictEqual(C.identiquePublie(publie, modifie), false);
  assert.strictEqual(C.appliquer(C.ecrireSas([], '\n'), [{ op: 'importer', lignes: [modifie] }], ctx).resume.importes, 1);
  assert.strictEqual(C.appliquer(C.ecrireSas([], '\n'), [{ op: 'importer', lignes: [v], forcer: true }], ctx).resume.importes, 1);
});

/* ---------- le sas des fiches ---------- */
const ID = 'emploi-rupture-conventionnelle';
const TEXTE = fs.readFileSync(path.join(CADRE, ID + '.md'), 'utf8');
const titreActuel = F.champs(F.lire(TEXTE)).titre;
const cx = () => ({
  aujourdhui: AUJ, rayon: 'emploi', rayons: ['emploi'], sourcesConnues: null, lexiqueIds: null,
  trouverFiche: (id) => (id === ID ? { rayon: 'emploi', texte: TEXTE } : null), adresseDe: () => ''
});
const propo = (genre, fiche, champs) => ({ genre, rayon: 'emploi', fiche, titre: (champs && champs.titre) || fiche, champs: champs || {}, revision: '' });

test('fiches : une mise à jour qui ne change rien n\'entre pas dans le sas, une nouvelle fiche dont l\'identifiant existe non plus', () => {
  const ctx = { aujourdhui: AUJ, contexteEvaluation: cx };
  const rien = propo('maj', ID, { titre: titreActuel });
  assert.match(S.dejaPriseEnCompte(Object.assign({ id: 'x' }, rien), cx()), /déjà à jour/);
  const r = S.appliquer('', [{ op: 'importer', items: [rien, propo('nouv', ID, { titre: 'Autre titre' })] }], ctx);
  assert.ok(r.ok);
  assert.strictEqual(r.resume.importes, 0);
  assert.strictEqual(r.resume.dejaPrises.length, 2);
  assert.deepStrictEqual(S.parserSas(r.texte), []);
});

test('fiches : une vraie modification entre dans le sas, « forcer » passe toujours, et sans contexte de lecture on ne devine rien', () => {
  const vraie = propo('maj', ID, { titre: 'Un titre vraiment différent' });
  const avec = S.appliquer('', [{ op: 'importer', items: [vraie] }], { aujourdhui: AUJ, contexteEvaluation: cx });
  assert.strictEqual(avec.resume.importes, 1); assert.strictEqual(avec.resume.dejaPrises.length, 0);
  const rien = propo('maj', ID, { titre: titreActuel });
  assert.strictEqual(S.appliquer('', [{ op: 'importer', items: [rien], forcer: true }], { aujourdhui: AUJ, contexteEvaluation: cx }).resume.importes, 1);
  assert.strictEqual(S.appliquer('', [{ op: 'importer', items: [rien] }], { aujourdhui: AUJ }).resume.importes, 1);
});

/* ---------- la liste de « Travailler avec Claude » ---------- */
test('propositions : un changement déjà publié à l\'identique n\'est pas proposé à verser, il est compté à part', () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-doublon-'));
  try {
    const balayage = path.join(d, 'modules', 'comprendre-le-cadre', 'contenu', 'balayage');
    fs.mkdirSync(balayage, { recursive: true }); fs.writeFileSync(path.join(balayage, '2026-10.md'), digestAvec(v), 'utf8');
    const prop = path.join(d, 'outils', 'retours', '2026-11-09', 'propositions');
    fs.mkdirSync(prop, { recursive: true });
    fs.writeFileSync(path.join(prop, 'balayage.json'), JSON.stringify([v, Object.assign({}, v, { intitule: 'Un autre changement' })]), 'utf8');
    const x = creerRetours(d, { maintenant: () => new Date(2026, 10, 9, 20, 0) }).propositions().propositions[0];
    assert.deepStrictEqual(x.lignes.map((l) => l.intitule), ['Un autre changement']);
    assert.strictEqual(x.deja, 1);
  } finally { fs.rmSync(d, { recursive: true, force: true }); }
});

test('le câblage : le dépôt donne au sas des fiches de quoi juger, et la page ne compte plus ce qui est déjà pris en compte ; aucun tiret long', () => {
  const depot = fs.readFileSync(path.join(RACINE, 'outils', 'veilleDepot.js'), 'utf8');
  assert.ok(/contexteEvaluation: function/.test(depot) && /fiches-sas-deja/.test(depot) && /changements-deja/.test(depot));
  const page = fs.readFileSync(path.join(RACINE, 'outils', 'veille.html'), 'utf8');
  assert.ok(/function itemDejaPrisEnCompte/.test(page) && /Déjà pris en compte/.test(page) && /e\.deja = p\.deja/.test(page));
  ['veilleSasJamaisDeDoublon.test.js'].forEach((f) => assert.ok(!/[\u2013\u2014]/.test(fs.readFileSync(path.join(__dirname, f), 'utf8'))));
  ['veilleRetours.js', 'veilleChangements.js', 'veilleFichesSas.js'].forEach((f) => {
    const t = fs.readFileSync(path.join(RACINE, 'outils', f), 'utf8');
    assert.ok(!/[\u2013\u2014]/.test(t.slice(t.indexOf('GARDE ANTI-DOUBLON') >= 0 ? t.indexOf('GARDE ANTI-DOUBLON') : 0, (t.indexOf('GARDE ANTI-DOUBLON') >= 0 ? t.indexOf('GARDE ANTI-DOUBLON') : 0) + 1200)), f + ' : tiret long dans la garde');
  });
});
