const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const E = require('../outils/veilleEcartes.js');

// Écarter, ne plus reproposer, remettre : bout en bout dans un dépôt jetable (jamais le vrai). Décision de Denis, 09/11/2026, consigne 185.
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-ecart-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai');
  git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# R\n\n## Les 0 fiche\n\n| id | titre |\n|---|---|\n');
  ecrire(d, 'scripts/genererBaseVeille.js', "require('fs').writeFileSync(require('path').join(__dirname,'..','outils','base_fiches.js'),'x');");
  ecrire(d, 'scripts/genererRenvoisCadre.js', "require('fs').mkdirSync(require('path').join(__dirname,'..','data'),{recursive:true});require('fs').writeFileSync(require('path').join(__dirname,'..','data','lexique-renvois-cadre.js'),'x');");
  ecrire(d, 'tests/ok.test.js', "require('node:test')('ok',()=>{});");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  spawnSync(process.execPath, ['scripts/genererBaseVeille.js'], { cwd: d }); spawnSync(process.execPath, ['scripts/genererRenvoisCadre.js'], { cwd: d });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const MANDAT = { mois: '2026-10', domaine: 'Emploi et contrats de travail', intitule: 'Certification des compétences acquises dans un mandat électif local', nature: 'décret, publié le 2026-10-07', en_vigueur: '', concerne: 'Élus locaux', ce_qui_change: 'Une certification est possible.', source_titre: 'Légifrance', source_url: '' };
const REVENU = { mois: '2026-10', domaine: 'Emploi et contrats de travail', intitule: 'Formations aux compétences acquises dans un mandat électif local', nature: 'décret n° 2026-929 du 6 octobre 2026', en_vigueur: '2026-10-08', concerne: 'Élus locaux', ce_qui_change: 'Les formations comptent comme du temps de travail.', source_titre: 'Légifrance', source_url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000054956301' };
const AUTRE = { mois: '2026-10', domaine: 'Logement', intitule: 'Revalorisation des aides au logement de 1,15 %', nature: 'arrêté du 28 septembre 2026', en_vigueur: '2026-10-01', concerne: 'Locataires', ce_qui_change: 'Hausse de 1,15 %.', source_titre: 'Service-Public', source_url: 'https://www.service-public.gouv.fr/particuliers/actualites/A16807' };

test('changement : écarter demande une raison, garde l\'historique ; le même décret revenu est ignoré et DIT ; remettre le rend au sas', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-11-06' });
    assert.ok(depot.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: [MANDAT] }] }]).ok);
    const id = depot.listerChangements().lignes[0].id;
    // pas de raison : refusé, rien n'est écrit
    const sans = depot.publier([{ type: 'changements', actions: [{ op: 'ecarter', id }] }]);
    assert.strictEqual(sans.ok, false); assert.match(sans.erreur, /pourquoi/);
    assert.strictEqual(depot.listerChangements().total, 1);
    // « autre » sans précision : refusé
    assert.strictEqual(depot.publier([{ type: 'changements', actions: [{ op: 'ecarter', id, motif: 'autre' }] }]).ok, false);
    // avec une raison : la proposition quitte le sas, l'historique la garde
    const r = depot.publier([{ type: 'changements', actions: [{ op: 'ecarter', id, motif: 'public' }] }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.strictEqual(depot.listerChangements().total, 0);
    let h = depot.listerEcartes(); assert.strictEqual(h.total, 1);
    assert.strictEqual(h.lignes[0].titre, MANDAT.intitule); assert.strictEqual(h.lignes[0].ecarteLe, '2026-11-06'); assert.strictEqual(h.lignes[0].motif, 'public');
    assert.deepStrictEqual(h.lignes[0].reproposee, { nb: 0, derniere: '' });
    // le même décret revient (autre intitulé) avec une autre : seule l'autre entre, l'ignorée est nommée
    const depot2 = creerDepot(d, { aujourdhui: () => '2026-11-09' });
    const v = depot2.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: [REVENU, AUTRE] }] }]);
    assert.ok(v.ok, JSON.stringify(v));
    assert.strictEqual(v.resumeChangements.importes, 1);
    assert.strictEqual(v.resumeChangements.ecartes.length, 1);
    assert.strictEqual(v.resumeChangements.ecartes[0].titre, REVENU.intitule); assert.strictEqual(v.resumeChangements.ecartes[0].motif, 'public');
    assert.deepStrictEqual(depot2.listerChangements().lignes.map((l) => l.valeurs.intitule), [AUTRE.intitule]);
    h = depot2.listerEcartes(); assert.deepStrictEqual(h.lignes[0].reproposee, { nb: 1, derniere: '2026-11-09' });
    // une proposition qui n'ajoute rien au sas (tout est écarté) : le compteur monte quand même
    const v2 = depot2.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: [REVENU] }] }]);
    assert.ok(v2.ok, JSON.stringify(v2)); assert.strictEqual(depot2.listerEcartes().lignes[0].reproposee.nb, 2);
    // remettre : la proposition d'origine retourne dans le sas, à l'identique, et l'historique se vide
    const m = depot2.publier([{ type: 'ecartes', actions: [{ op: 'remettre', id: h.lignes[0].id }] }]);
    assert.ok(m.ok, JSON.stringify(m)); assert.strictEqual(m.resumeEcartes.remis.length, 1);
    assert.strictEqual(depot2.listerEcartes().total, 0);
    assert.ok(depot2.listerChangements().lignes.some((l) => l.valeurs.intitule === MANDAT.intitule), 'remis dans le sas');
    // et une fois remis, le même décret peut de nouveau être proposé sans être ignoré (il est déjà au sas : remplacé, pas ignoré à tort)
    assert.strictEqual(git(d, 'status', '--porcelain').sortie.trim(), '', 'tout est enregistré dans Git');
  } finally { nettoyer(d); }
});

test('fiche : écarter une proposition, ne plus la reproposer, la remettre', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-11-06' });
    const prop = { genre: 'nouv', rayon: 'emploi', fiche: 'emploi-mandat-electif', titre: 'Les formations du mandat électif', champs: { titre: 'Les formations du mandat électif', texte: 'Un texte.' }, revision: '' };
    assert.ok(depot.publier([{ type: 'fiches-sas', actions: [{ op: 'importer', items: [prop] }] }]).ok);
    const id = depot.listerFichesSas().lignes[0].id;
    assert.strictEqual(depot.publier([{ type: 'fiches-sas', actions: [{ op: 'ecarter', id, motif: 'couvert' }] }]).ok, true);
    assert.strictEqual(depot.listerFichesSas().total, 0);
    assert.strictEqual(depot.listerEcartes().lignes[0].sorte, 'fiche');
    const v = depot.publier([{ type: 'fiches-sas', actions: [{ op: 'importer', items: [Object.assign({}, prop, { fiche: 'emploi-formations-mandat' })] }] }]);
    assert.ok(v.ok, JSON.stringify(v)); assert.strictEqual(v.resumeFichesSas.importes, 0); assert.strictEqual(v.resumeFichesSas.ecartes.length, 1);
    assert.strictEqual(depot.listerFichesSas().total, 0);
    const m = depot.publier([{ type: 'ecartes', actions: [{ op: 'remettre', id: depot.listerEcartes().lignes[0].id }] }]);
    assert.ok(m.ok, JSON.stringify(m)); assert.strictEqual(depot.listerFichesSas().total, 1); assert.strictEqual(depot.listerEcartes().total, 0);
  } finally { nettoyer(d); }
});

test('compléter la raison d\'une écartée ; l\'historique est du texte que l\'application ne lit jamais', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => '2026-11-09' });
    const e = E.creerEntree('changement', Object.assign({ id: 'x' }, MANDAT), 'inconnu', '', '2026-11-06');
    ecrire(d, E.CHEMIN, E.ecrire([e]));
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'historique');
    assert.strictEqual(depot.listerEcartes().lignes[0].motifLibelle, 'Raison non précisée');
    const r = depot.publier([{ type: 'ecartes', actions: [{ op: 'precision', id: e.id, motif: 'autre', precision: 'trop local' }] }]);
    assert.ok(r.ok, JSON.stringify(r));
    const l = depot.listerEcartes().lignes[0]; assert.strictEqual(l.motif, 'autre'); assert.strictEqual(l.precision, 'trop local');
  } finally { nettoyer(d); }
});
