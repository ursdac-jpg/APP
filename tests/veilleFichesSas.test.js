const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const S = require('../outils/veilleFichesSas.js');
const F = require('../outils/veilleFiche.js');

const RACINE = path.join(__dirname, '..');
// Copies figées de deux fiches du cadre : les vraies fiches changent (c'est le but de l'outil), ces essais ne doivent pas en dépendre.
const CADRE = path.join(RACINE, 'tests', 'fixtures', 'veille_fiches_sas');
const AUJ = '2026-10-31';
const ID = 'emploi-rupture-conventionnelle';
const TEXTE_REEL = fs.readFileSync(path.join(CADRE, ID + '.md'), 'utf8');
const SOURCES_REELLES = (TEXTE_REEL.match(/^sources:\n((?:  - .*\n)+)/m) || ['', ''])[1].split('\n').map((l) => l.replace(/^  - /, '').trim()).filter(Boolean);

function ctx(extra) {
  return Object.assign({
    aujourdhui: AUJ, rayon: 'emploi', rayons: ['emploi', 'budget'],
    trouverFiche: (id) => (id === ID ? { rayon: 'emploi', texte: TEXTE_REEL } : (id === 'emploi-cesu' ? { rayon: 'emploi', texte: fs.readFileSync(path.join(CADRE, 'emploi-cesu.md'), 'utf8') } : null)),
    sourcesConnues: SOURCES_REELLES.concat(['service-public-nouveau']), lexiqueIds: null,
    adresseDe: (s) => 'https://exemple.fr/' + s
  }, extra || {});
}
const corpsActuel = F.corpsDe(F.lire(TEXTE_REEL));
const REPONSE_MAJ = '[FICHE]\nid: ' + ID + '\ntitre: La rupture conventionnelle, comment ça marche ?\nsources:\n' + SOURCES_REELLES.map((s) => '  - ' + s).join('\n') + '\nrevisions:\n  - "2026-10 : précision sur l\'assistance pendant les entretiens"\ntexte:\n' + corpsActuel.replace('pendant lesquels vous pouvez être assisté.', 'pendant lesquels vous pouvez être assisté par un conseiller du salarié.') + '\n[/FICHE]';

test('lireBloc : lit les listes, les mots du Lexique et la prose', () => {
  const b = S.lireBloc('id: x-test\ntitre: « Un titre »\ntags: [a, b]\nlexique:\n  - mot = une définition\nsources:\n  - s1\n  - s2\ntexte:\nPremier paragraphe.\n\nSecond : avec deux-points.');
  assert.strictEqual(b.id, 'x-test'); assert.strictEqual(b.titre, 'Un titre'); assert.deepStrictEqual(b.tags, ['a', 'b']);
  assert.deepStrictEqual(b.lexique, [{ terme: 'mot', definition: 'une définition' }]);
  assert.deepStrictEqual(b.sources, ['s1', 's2']);
  assert.match(b.texte, /^Premier paragraphe\.\n\nSecond : avec deux-points\.$/);
});

test('lireReponse : une fiche qui existe est une mise à jour, la phrase de révision est reprise', () => {
  const r = S.lireReponse(REPONSE_MAJ, ctx());
  assert.strictEqual(r.ok, true); assert.strictEqual(r.items.length, 1);
  assert.strictEqual(r.items[0].genre, 'maj'); assert.strictEqual(r.items[0].rayon, 'emploi'); assert.strictEqual(r.items[0].fiche, ID);
  assert.match(r.items[0].revision, /précision sur l'assistance/);
});

test('lireReponse : une fiche inconnue est nouvelle ; un retrait, un rapport de contrôle et une information brute sont reconnus', () => {
  const nouv = S.lireReponse('[FICHE]\ntitre: Le droit à la déconnexion\npour_qui: Utile si on vous écrit le soir.\nsources:\n  - service-public-nouveau\ntexte:\nUn paragraphe.\n[/FICHE]', ctx());
  assert.strictEqual(nouv.items[0].genre, 'nouv'); assert.strictEqual(nouv.items[0].fiche, 'emploi-le-droit-a-la-deconnexion');
  const ret = S.lireReponse('[RETRAIT]\nfiche: emploi-cesu\nraison: le dispositif a été remplacé\n[/RETRAIT]', ctx());
  assert.strictEqual(ret.items[0].genre, 'ret'); assert.strictEqual(ret.items[0].champs.raison, 'le dispositif a été remplacé');
  const inconnu = S.lireReponse('[RETRAIT]\nfiche: n-existe-pas\nraison: x\n[/RETRAIT]', ctx());
  assert.strictEqual(inconnu.items.length, 0); assert.match(inconnu.notes.join(' '), /n'existe pas/);
  const ctrl = S.lireReponse('[CONTROLE rayon: emploi]\nfiche: emploi-cesu\netat: A JOUR\n[/CONTROLE]', ctx());
  assert.strictEqual(ctrl.controle, true); assert.strictEqual(ctrl.items.length, 0);
  const brut = S.lireReponse('Un mail reçu ce matin qui dit que la règle change.', ctx());
  assert.strictEqual(brut.items[0].genre, 'brut'); assert.strictEqual(S.lireReponse('   ', ctx()).ok, false);
});

test('evaluer (mise à jour) : sur la vraie fiche, la demande part, la phrase est exigée, le diff est donné', () => {
  const rec = S.lireReponse(REPONSE_MAJ, ctx()).items[0];
  const ev = S.evaluer(rec, ctx());
  assert.deepStrictEqual(ev.problemes, []);
  assert.strictEqual(ev.exigeRevision, true);
  assert.strictEqual(ev.demande.type, 'fiche-champs'); assert.strictEqual(ev.demande.nom, ID + '.md'); assert.strictEqual(ev.demande.datation, 'garder');
  assert.ok(ev.corps && ev.corps.apres.join(' ').indexOf('conseiller du salarié') !== -1);
  assert.ok(ev.corps.avant.join(' ').indexOf('conseiller du salarié') === -1);
  // la demande, appliquée par le dépôt, écrit bien la fiche
  const r = F.appliquerModification(TEXTE_REEL, ev.demande, { aujourdhui: AUJ, sourcesConnues: SOURCES_REELLES, lexiqueIds: null });
  assert.strictEqual(r.ok, true, r.erreur); assert.match(r.texte, /conseiller du salarié/);
});

test('evaluer (mise à jour) : rien ne change = un problème dit en clair ; source inconnue refusée', () => {
  const identique = { genre: 'maj', rayon: 'emploi', fiche: ID, titre: 't', champs: { texte: corpsActuel }, revision: '' };
  assert.match(S.evaluer(identique, ctx()).problemes.join(' '), /ne change rien/);
  const inconnue = { genre: 'maj', rayon: 'emploi', fiche: ID, titre: 't', champs: { sources: ['source-qui-n-existe-pas'] }, revision: 'x' };
  assert.match(S.evaluer(inconnue, ctx()).problemes.join(' '), /registre des adresses/);
  const tiret = { genre: 'maj', rayon: 'emploi', fiche: ID, titre: 't', champs: { texte: corpsActuel + '\n\nUn ' + String.fromCharCode(0x2014) + ' long.' }, revision: 'x' };
  assert.match(S.evaluer(tiret, ctx()).problemes.join(' '), /tiret/);
});

test('evaluer (nouvelle fiche) : la fiche construite se relit, la demande est un fichier, les garde-fous parlent', () => {
  const rec = S.lireReponse('[FICHE]\ntitre: Le droit à la déconnexion\npour_qui: Utile si on vous écrit le soir.\ntags: [déconnexion, horaires]\nsources:\n  - service-public-nouveau\nlexique:\n  - déconnexion = ne pas répondre hors du travail\ntexte:\nPremier paragraphe.\n\nSecond paragraphe.\n[/FICHE]', ctx()).items[0];
  const ev = S.evaluer(rec, ctx());
  assert.deepStrictEqual(ev.problemes, []);
  assert.strictEqual(ev.demande.type, 'fiche'); assert.strictEqual(ev.demande.nom, 'emploi-le-droit-a-la-deconnexion.md');
  const relu = F.lire(ev.demande.texte);
  assert.strictEqual(relu.ok, true);
  const ch = F.champs(relu);
  assert.strictEqual(ch.id, 'emploi-le-droit-a-la-deconnexion'); assert.strictEqual(ch.rayon, 'emploi'); assert.strictEqual(ch.statut, 'actif'); assert.strictEqual(ch.verifie_le, AUJ);
  assert.strictEqual(ch.collecte, 'emploi.collecte.md'); assert.deepStrictEqual(ch.sources, ['service-public-nouveau']);
  assert.match(ev.demande.texte, /Premier paragraphe\.\n\nSecond paragraphe\.\n$/);
  assert.match(S.evaluer(Object.assign({}, rec, { champs: Object.assign({}, rec.champs, { sources: ['inconnue'] }) }), ctx()).problemes.join(' '), /registre/);
  assert.match(S.evaluer(Object.assign({}, rec, { champs: Object.assign({}, rec.champs, { sources: [] }) }), ctx()).problemes.join(' '), /Aucune source/);
  assert.match(S.evaluer(Object.assign({}, rec, { fiche: ID }), ctx()).problemes.join(' '), /déjà cet identifiant/);
});

test('evaluer (retrait) : raison obligatoire, fiche déjà retirée refusée, la demande est un retrait', () => {
  const rec = S.lireReponse('[RETRAIT]\nfiche: emploi-cesu\nraison: dispositif remplacé\n[/RETRAIT]', ctx()).items[0];
  const ev = S.evaluer(rec, ctx());
  assert.deepStrictEqual(ev.problemes, []);
  assert.strictEqual(ev.demande.changements.statut, 'retire'); assert.strictEqual(ev.demande.changements.retire_raison, 'dispositif remplacé');
  assert.match(S.evaluer(Object.assign({}, rec, { champs: { raison: '' } }), ctx()).problemes.join(' '), /raison/);
});

test('appliquer : importer, remplacer, retirer ; le fichier se relit', () => {
  const rec = S.lireReponse(REPONSE_MAJ, ctx()).items[0];
  let r = S.appliquer('', [{ op: 'importer', items: [rec] }], { aujourdhui: AUJ });
  assert.strictEqual(r.ok, true); assert.strictEqual(r.resume.importes, 1);
  const l = S.parserSas(r.texte); assert.strictEqual(l.length, 1); assert.strictEqual(l[0].id, 'maj-' + ID); 
  const avant = S.empreinteProposition(l[0]);
  r = S.appliquer(r.texte, [{ op: 'importer', items: [Object.assign({}, rec, { revision: 'une autre phrase' })] }], { aujourdhui: AUJ });   // une nouvelle version remplace la proposition
  assert.strictEqual(r.resume.remplaces, 1); assert.notStrictEqual(S.empreinteProposition(S.parserSas(r.texte)[0]), avant);
  const liste = S.lister(r.texte, ctx());
  assert.strictEqual(liste.total, 1); assert.ok(liste.lignes[0].demande);
  assert.strictEqual(S.appliquer(r.texte, [{ op: 'retirer', id: 'inconnu' }], {}).ok, false);
  r = S.appliquer(r.texte, [{ op: 'retirer', id: 'maj-' + ID }], {});
  assert.strictEqual(S.parserSas(r.texte).length, 0);
  assert.strictEqual(S.appliquer('', [{ op: 'inconnue' }], {}).ok, false);
});

test('construirePrompt : le message redonne la proposition, les adresses et le format de réponse', () => {
  const rec = S.lireReponse(REPONSE_MAJ, ctx()).items[0];
  const p = S.construirePrompt(rec, ctx(), 'SOCLE');
  assert.match(p, /^SOCLE/); assert.match(p, /\[FICHE\]/); assert.match(p, /Verdict/); assert.match(p, /https:\/\/exemple\.fr\//);
  assert.ok(!/[—–]/.test(p));
});
