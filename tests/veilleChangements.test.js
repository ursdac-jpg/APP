const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const C = require('../outils/veilleChangements.js');
const { creerDepot } = require('../outils/veilleDepot.js');

const AUJ = '2026-10-15';
const DIGEST = [
  '---', 'type: balayage', 'periode: "Juin à septembre 2026"', 'publie_le: 2026-09', 'territoire: national', 'sources:',
  '  - "service-public.gouv.fr | Titre A | [https://www.service-public.gouv.fr/a](https://www.service-public.gouv.fr/a) | 2026-09-18"',
  '---', '',
  '# Ce qui a changé, Juin à septembre 2026', '',
  '## Emploi et contrats de travail', '',
  '### Changement A', 'Type : décret, publié le 2026-06-12, en vigueur le 2026-09-01.', 'Concerne : salariés', 'Ce qui change : texte A.', 'Source : [Titre A](https://www.service-public.gouv.fr/a)', '',
  '## Mobilité et aides associées', '', '_Rien de nouveau retenu ce trimestre._', ''
].join('\n');

const bon = {
  mois: '2026-09', periode: 'Juin à septembre 2026', domaine: 'Emploi et contrats de travail', intitule: 'Changement B',
  nature: 'décrets et arrêté du 2026-08-06', en_vigueur: '2026-08-08', concerne: 'agents publics', ce_qui_change: 'texte B.',
  source_titre: 'La page B', source_url: 'https://www.fonction-publique.gouv.fr/b', origine: 'balayage'
};

test('verifierChangement : un changement complet est valide', () => {
  assert.deepStrictEqual(C.verifierChangement(bon), []);
});
test('verifierChangement : date d\'entree en vigueur obligatoire, jamais « a verifier », jamais de tiret long, source en https', () => {
  const pb = (modif) => C.verifierChangement(Object.assign({}, bon, modif)).join(' / ');
  assert.match(pb({ en_vigueur: '' }), /obligatoire/);
  assert.match(pb({ en_vigueur: '2026-09' }), /AAAA-MM-JJ/);
  assert.match(pb({ en_vigueur: 'à vérifier' }), /AAAA-MM-JJ|a verifier/);
  assert.match(pb({ ce_qui_change: 'date à vérifier' }), /a verifier/);
  assert.match(pb({ concerne: 'agents — publics' }), /tiret/);
  assert.match(pb({ source_url: 'http://exemple.fr/x' }), /https/);
  assert.match(pb({ domaine: '' }), /domaine/i);
  assert.deepStrictEqual(C.verifierChangement(Object.assign({}, bon, { en_vigueur: 'prévu 2027-01-01' })), []);
  assert.deepStrictEqual(C.verifierChangement(Object.assign({}, bon, { en_vigueur: 'sans objet' })), []);
});

test('integrerDansDigest : ajoute au domaine existant, avec « Vérifié le » et la source dans l\'en-tête', () => {
  const r = C.integrerDansDigest(DIGEST, bon, AUJ, '');
  assert.ok(r.ok && !r.remplace);
  assert.match(r.texte, /### Changement B\nType : décrets et arrêté du 2026-08-06, en vigueur le 2026-08-08\.\nConcerne : agents publics\nCe qui change : texte B\.\nSource : \[La page B\]\(https:\/\/www\.fonction-publique\.gouv\.fr\/b\)\nVérifié le : 2026-10-15\n/);
  assert.match(r.texte, /  - "fonction-publique\.gouv\.fr \| La page B \| \[https:\/\/www\.fonction-publique\.gouv\.fr\/b\]\(https:\/\/www\.fonction-publique\.gouv\.fr\/b\) \| 2026-10-15"\n---/);
  assert.ok(r.texte.indexOf('### Changement A') < r.texte.indexOf('### Changement B'));
  assert.ok(r.texte.indexOf('### Changement B') < r.texte.indexOf('## Mobilité'));
  assert.match(r.texte, /Vérifié le : 2026-10-15\n\n## Mobilité/);
});
test('integrerDansDigest : remplace le changement de meme intitule (pas de doublon) et garde les autres', () => {
  const v = Object.assign({}, bon, { intitule: 'Changement A', ce_qui_change: 'texte A corrigé.' });
  const r = C.integrerDansDigest(DIGEST, v, AUJ, '');
  assert.ok(r.ok && r.remplace);
  assert.strictEqual((r.texte.match(/### Changement A/g) || []).length, 1);
  assert.match(r.texte, /texte A corrigé\./);
  assert.ok(!/texte A\.\n/.test(r.texte));
  assert.match(r.texte, /_Rien de nouveau retenu ce trimestre\._/);
});
test('integrerDansDigest : un domaine « rien de nouveau » perd sa note quand un changement y entre ; un domaine absent est cree', () => {
  const r1 = C.integrerDansDigest(DIGEST, Object.assign({}, bon, { domaine: 'Mobilité et aides associées', intitule: 'Aide mobilité' }), AUJ, '');
  assert.ok(r1.ok);
  assert.ok(!/_Rien de nouveau/.test(r1.texte));
  assert.match(r1.texte, /## Mobilité et aides associées\n\n### Aide mobilité/);
  const r2 = C.integrerDansDigest(DIGEST, Object.assign({}, bon, { domaine: 'Retraite' }), AUJ, '');
  assert.ok(r2.ok);
  assert.match(r2.texte, /\n## Retraite\n\n### Changement B/);
});
test('integrerDansDigest : un trimestre pas encore cree recoit son en-tete et sa periode', () => {
  const r = C.integrerDansDigest('', Object.assign({}, bon, { mois: '2026-12', periode: 'Octobre à décembre 2026' }), AUJ, 'Octobre à décembre 2026');
  assert.ok(r.ok);
  assert.match(r.texte, /^---\ntype: balayage\nperiode: "Octobre à décembre 2026"\npublie_le: 2026-12\nterritoire: national\nsources:\n {2}- "fonction-publique\.gouv\.fr/);
  assert.match(r.texte, /# Ce qui a changé, Octobre à décembre 2026/);
});
test('integrerDansDigest : refuse un changement incomplet ou « a verifier »', () => {
  assert.ok(!C.integrerDansDigest(DIGEST, Object.assign({}, bon, { en_vigueur: '' }), AUJ, '').ok);
  assert.ok(!C.integrerDansDigest(DIGEST, Object.assign({}, bon, { concerne: 'à vérifier' }), AUJ, '').ok);
});
test('integrerDansDigest : les fins de ligne du fichier sont conservees (CRLF)', () => {
  const r = C.integrerDansDigest(DIGEST.replace(/\n/g, '\r\n'), bon, AUJ, '');
  assert.ok(r.ok);
  assert.ok(!/[^\r]\n/.test(r.texte));
});

test('blocPublie : rend le texte publie du changement (et rien sil nest pas dans le digest) ; lister le fournit', () => {
  const v = Object.assign({}, bon, { intitule: 'Changement A' });
  const b = C.blocPublie(DIGEST, v);
  assert.match(b, /^### Changement A\nType : décret, publié le 2026-06-12, en vigueur le 2026-09-01\.\nConcerne : salariés\nCe qui change : texte A\.\nSource : /);
  assert.ok(!/Mobilité/.test(b));
  assert.strictEqual(C.blocPublie(DIGEST, bon), '');
  const l = C.lister(C.ecrireSas([Object.assign({}, v, { id: 'x' })], '\n'), () => DIGEST);
  assert.ok(l.lignes[0].dejaPublie && /Changement A/.test(l.lignes[0].publie));
});

test('sas : aller-retour du fichier, identifiants stables', () => {
  const v = Object.assign({}, bon, { id: C.identifiant(bon.mois, bon.domaine, bon.intitule) });
  const texte = C.ecrireSas([v], '\n');
  const lu = C.parserSas(texte);
  assert.strictEqual(lu.length, 1);
  assert.match(lu[0].id, /^2026-09-changement-b-[0-9a-f]{6}$/);
  assert.strictEqual(lu[0].periode, 'Juin à septembre 2026');
  assert.strictEqual(C.ecrireSas(lu, '\n'), texte);
});
test('appliquer : importer (doublons ignores), valider (sort du sas et entre dans le digest), retirer', () => {
  const ctx = { aujourdhui: AUJ, digest: (m) => (m === '2026-09' ? DIGEST : '') };
  const idB = C.identifiant('2026-09', bon.domaine, 'Changement B'), idC = C.identifiant('2026-09', bon.domaine, 'Changement C');
  const imp = C.appliquer(C.ecrireSas([], '\n'), [{ op: 'importer', lignes: [bon, bon, Object.assign({}, bon, { intitule: 'Changement C' })] }], ctx);
  assert.ok(imp.ok);
  assert.strictEqual(imp.resume.importes, 2); assert.strictEqual(imp.resume.ignores, 1);
  assert.strictEqual(C.parserSas(imp.texteSas).length, 2);
  const val = C.appliquer(imp.texteSas, [{ op: 'valider', id: idB }], ctx);
  assert.ok(val.ok);
  assert.strictEqual(val.resume.valides, 1);
  assert.strictEqual(C.parserSas(val.texteSas).length, 1);
  assert.match(val.digests['2026-09'], /### Changement B/);
  const inc = C.appliquer(imp.texteSas, [{ op: 'valider', id: idC, valeurs: { en_vigueur: '' } }], ctx);
  assert.ok(!inc.ok && /obligatoire/.test(inc.erreur));
  const corr = C.appliquer(imp.texteSas, [{ op: 'valider', id: idC, valeurs: { en_vigueur: '2026-11-01' } }], ctx);
  assert.ok(corr.ok && /en vigueur le 2026-11-01/.test(corr.digests['2026-09']));
  const ret = C.appliquer(imp.texteSas, [{ op: 'retirer', id: idC }], ctx);
  assert.ok(ret.ok && C.parserSas(ret.texteSas).length === 1);
  assert.ok(!C.appliquer(imp.texteSas, [{ op: 'retirer', id: 'inconnu' }], ctx).ok);
});

test('reprise : un digest deja publie se lit entierement et les dates absentes restent vides (on ne devine rien)', () => {
  const texte = DIGEST + [
    '### Texte sans date lisible', 'Type : décret, publié le 2026-07-31, en vigueur à vérifier.', 'Concerne : public', 'Ce qui change : une phrase.', 'Source : [T](https://exemple.fr/t)', '',
    '### Information sans entrée en vigueur', 'Type : publication statistique DREETS, publié le 2026-09-18, en vigueur le N/A.', 'Concerne : public', 'Ce qui change : une autre phrase.', 'Source : [T2](https://exemple.fr/t2)', '',
    '### Date en vigueur partielle', 'Type : circulaire, publié le 2026-04-30, en vigueur le 2026.', 'Concerne : public', 'Ce qui change : encore une phrase.', 'Source : [T3](https://exemple.fr/t3)', ''
  ].join('\n');
  const lus = C.changementsDuDigest(texte, '2026-09');
  assert.strictEqual(lus.length, 4);
  assert.strictEqual(new Set(lus.map((x) => x.id)).size, lus.length, 'identifiants uniques');
  lus.forEach((x) => { assert.ok(x.intitule && x.domaine && x.ce_qui_change && x.source_url, x.intitule); });
  const par = (re) => lus.find((x) => re.test(x.intitule));
  assert.strictEqual(par(/Changement A/).en_vigueur, '2026-09-01');
  assert.strictEqual(par(/sans date lisible/).en_vigueur, '');
  assert.ok(C.verifierChangement(par(/sans date lisible/)).length > 0, 'un changement sans date ne peut pas etre valide');
  assert.strictEqual(par(/sans entrée en vigueur/).en_vigueur, 'sans objet');
  assert.strictEqual(par(/partielle/).en_vigueur, '', 'une date incomplete n\'est pas devinee');
  assert.ok(!/en vigueur/.test(par(/partielle/).nature), 'la nature ne garde pas la mention incomplete');
});

// ---------- les digests reels : format et marque « Vérifié le » ----------
test('digests reels : chaque changement a ses 4 lignes ; « Vérifié le » est une vraie date et exclut « à vérifier »', () => {
  const dossier = path.join(__dirname, '..', 'modules', 'comprendre-le-cadre', 'contenu', 'balayage');
  fs.readdirSync(dossier).filter((f) => /^\d{4}-\d{2}\.md$/.test(f)).forEach((f) => {
    const texte = fs.readFileSync(path.join(dossier, f), 'utf8');
    assert.match(texte, /^---\r?\n[\s\S]*?\bperiode:/, f + ' : en-tete');
    texte.split(/\r?\n(?=### )/).slice(1).forEach((bloc) => {
      const bloc1 = bloc.split(/\r?\n(?=## |_)/)[0];
      const titre = bloc1.split(/\r?\n/)[0];
      ['Type :', 'Concerne :', 'Ce qui change :', 'Source :'].forEach((k) => { assert.ok(bloc1.indexOf('\n' + k) !== -1, f + ' : « ' + titre + ' » sans « ' + k + ' »'); });
      const mv = /Vérifié le : (.+)/.exec(bloc1);
      if (mv) {
        assert.match(mv[1].trim(), /^\d{4}-\d{2}-\d{2}$/, f + ' : « Vérifié le » doit etre une date (' + titre + ')');
        assert.ok(!/à vérifier/i.test(bloc1), f + ' : « ' + titre + ' » est marque verifie mais contient « a verifier »');
      }
    });
  });
});

// ---------- publication complete dans un depot jetable ----------
function git(dossier, ...args) { const r = spawnSync('git', args, { cwd: dossier, encoding: 'utf8' }); return { code: r.status, sortie: String(r.stdout || '') + String(r.stderr || '') }; }
function ecrire(dossier, chemin, texte) { const p = path.join(dossier, chemin); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, texte, 'utf8'); }
function depotJetable() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-chg-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai');
  git(d, 'config', 'commit.gpgsign', 'false'); git(d, 'config', 'core.autocrlf', 'false');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/emploi/README.md', '# R\n\n## Les 0 fiche\n\n| id | titre |\n|---|---|\n');
  ecrire(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md', DIGEST);
  ecrire(d, 'outils/sas/changements.sas.txt', C.ecrireSas([], '\n'));
  ecrire(d, 'scripts/genererBaseVeille.js', "require('fs').writeFileSync(require('path').join(__dirname,'..','outils','base_fiches.js'),'x');");
  ecrire(d, 'scripts/genererRenvoisCadre.js', "require('fs').mkdirSync(require('path').join(__dirname,'..','data'),{recursive:true});require('fs').writeFileSync(require('path').join(__dirname,'..','data','lexique-renvois-cadre.js'),'x');");
  ecrire(d, 'tests/ok.test.js', "require('node:test')('ok',()=>{});");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  spawnSync(process.execPath, ['scripts/genererBaseVeille.js'], { cwd: d }); spawnSync(process.execPath, ['scripts/genererRenvoisCadre.js'], { cwd: d });
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
test('publier (type changements) : importer puis valider ecrit le digest et le sas dans UN enregistrement annulable', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    const r1 = depot.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: [bon] }] }]);
    assert.ok(r1.ok, JSON.stringify(r1));
    assert.strictEqual(r1.resumeChangements.importes, 1);
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md'), 'utf8'), DIGEST, 'importer ne touche pas au digest public');
    const l = depot.listerChangements();
    assert.ok(l.ok && l.total === 1 && l.lignes[0].problemes.length === 0 && l.lignes[0].dejaPublie === false);
    const r2 = depot.publier([{ type: 'changements', actions: [{ op: 'valider', id: l.lignes[0].id }] }]);
    assert.ok(r2.ok, JSON.stringify(r2));
    const digest = fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md'), 'utf8');
    assert.match(digest, /### Changement B[\s\S]*Vérifié le : 2026-10-15/);
    assert.strictEqual(depot.listerChangements().total, 0);
    const a = depot.annuler();
    assert.ok(a.ok, JSON.stringify(a));
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md'), 'utf8'), DIGEST);
    assert.strictEqual(depot.listerChangements().total, 1, 'l\'annulation remet le changement dans le sas');
  } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
});
test('publier (type changements) : un changement sans date d\'entree en vigueur est refuse, rien n\'est ecrit', () => {
  const d = depotJetable();
  try {
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    assert.ok(depot.publier([{ type: 'changements', actions: [{ op: 'importer', lignes: [Object.assign({}, bon, { en_vigueur: '' })] }] }]).ok);
    const l = depot.listerChangements();
    assert.ok(l.lignes[0].problemes.length > 0);
    const r = depot.publier([{ type: 'changements', actions: [{ op: 'valider', id: l.lignes[0].id }] }]);
    assert.ok(!r.ok && r.code === 'changements' && /obligatoire/.test(r.erreur));
    assert.strictEqual(fs.readFileSync(path.join(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md'), 'utf8'), DIGEST);
  } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
});

// ---------- « Faire vérifier par un assistant » : prompt et lecture de la réponse ----------
test('construirePrompt : le changement, le socle, trois modèles de style et le format de réponse y sont', () => {
  const ex = C.exemplesDeStyle(DIGEST + '\n### Autre\nType : décret, en vigueur le 2026-09-02.\nConcerne : tous\nCe qui change : une phrase assez longue pour servir de modèle de style à l\'assistant, sans jargon.\nSource : [T](https://exemple.fr/z)\n', '2026-09');
  const p = C.construirePrompt(Object.assign({}, bon, { en_vigueur: '' }), ex, 'Nous sommes le 2026-10-15. SOCLE DE RECHERCHE.');
  assert.match(p, /^Nous sommes le 2026-10-15\. SOCLE DE RECHERCHE\./);
  assert.match(p, /Intitulé : Changement B/);
  assert.match(p, /En vigueur le : \(vide\)/);
  assert.match(p, /Style d'écriture attendu/);
  assert.match(p, /\[VERIFICATION\][\s\S]*\[\/VERIFICATION\]/);
  assert.match(p, /sans objet/);
  assert.ok(!/[\u2013\u2014]/.test(p), 'jamais de tiret long dans le prompt');
  assert.ok(!/\bIA\b/.test(p), 'jamais le mot IA');
});
test('lireReponse : range les valeurs, ignore « non trouvé » et « inchangé », refuse les valeurs mal écrites', () => {
  const rep = [
    'Voici ma réponse.', '[VERIFICATION]', 'statut: corrigé',
    'en_vigueur: 2026-09-01 (contrats conclus à compter de cette date)', 'en_vigueur_page: https://normandie.dreets.gouv.fr/page.', 'en_vigueur_citation: « à compter du 1er septembre 2026 »',
    'nature: inchangé', 'concerne: Non trouvé', 'ce_qui_change: texte proposé.', 'ce_qui_change_page: https://www.francecompetences.fr/fiche/x/',
    'source_titre: **Le référentiel complet**', 'source_url: https://www.francecompetences.fr/fiche/x/', 'remarque: une phrase', '[/VERIFICATION]'
  ].join('\n');
  const r = C.lireReponse(rep, { en_vigueur: '', source_url: 'https://www.francecompetences.fr/', ce_qui_change: 'texte proposé.' });
  assert.ok(r.ok);
  assert.strictEqual(r.statut, 'corrigé');
  const par = (c) => r.propositions.find((q) => q.champ === c);
  assert.strictEqual(par('en_vigueur').propose, '2026-09-01');
  assert.strictEqual(par('en_vigueur').page, 'https://normandie.dreets.gouv.fr/page');
  assert.match(par('en_vigueur').citation, /1er septembre 2026/);
  assert.ok(!par('nature') && !par('concerne'), 'inchangé et non trouvé ne proposent rien');
  assert.strictEqual(par('source_titre').propose, 'Le référentiel complet');
  assert.ok(par('ce_qui_change').identique);
  const mauvais = C.lireReponse('[VERIFICATION]\nen_vigueur: septembre 2026\nsource_url: http://x.fr\nconcerne: date à vérifier\nnature: un tiret \u2014 long\n[/VERIFICATION]', {});
  assert.ok(mauvais.propositions.every((q) => q.probleme), JSON.stringify(mauvais.propositions));
  assert.ok(!C.lireReponse('pas de bloc', {}).ok);
  assert.strictEqual(C.lireReponse('[VERIFICATION]\nen_vigueur: sans objet\n[/VERIFICATION]', {}).propositions[0].propose, 'sans objet');
  assert.strictEqual(C.lireReponse('[VERIFICATION]\nen_vigueur: prévu 2027-01-01\n[/VERIFICATION]', {}).propositions[0].propose, 'prévu 2027-01-01');
});
test('listerChangements : fournit des modèles de style pris dans le digest publié', () => {
  const d = depotJetable();
  try {
    ecrire(d, 'modules/comprendre-le-cadre/contenu/balayage/2026-09.md', DIGEST.replace('Ce qui change : texte A.', 'Ce qui change : une phrase assez longue pour servir de modèle de style à l\'assistant, sans jargon.'));
    const depot = creerDepot(d, { aujourdhui: () => AUJ });
    const l = depot.listerChangements();
    assert.ok(l.exemples.length >= 1 && /modèle de style/.test(l.exemples[0].ce_qui_change));
    const pr = depot.promptChangement({ valeurs: bon, socle: 'SOCLE' });
    assert.ok(pr.ok && /SOCLE/.test(pr.prompt) && /Changement B/.test(pr.prompt));
    assert.ok(depot.lireReponseChangement({ texte: '[VERIFICATION]\nen_vigueur: 2026-08-08\n[/VERIFICATION]', actuel: {} }).ok);
  } finally { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } }
});
