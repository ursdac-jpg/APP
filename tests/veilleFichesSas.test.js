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
  assert.match(S.evaluer(inconnue, ctx()).problemes.join(' '), /sans adresse/, 'une source inconnue sans aucune adresse bloque, avec un message clair');
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

test('sources : le détail de la collecte suit la proposition ; une source hors registre se complète à la main ou se retire (consigne 135)', () => {
  const rep = '[FICHE]\ntitre: Une fiche nationale\npour_qui: Utile si on touche une allocation.\nsources:\n  - service-public-nouveau\n  - source-inconnue\ntexte:\nUn paragraphe.\n[/FICHE]';
  const rec = S.lireReponse(rep, ctx()).items[0];
  rec.sourcesDetail = [{ nom: 'source-inconnue', titre: 'Décret du 25 juin 2026 relatif au calcul de l\'AAH', url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000000' }, { nom: 'Mauvais Nom', titre: 'ignoré', url: 'https://x.fr' }];
  const contexte = ctx({ adresseDe: (s) => (s === 'service-public-nouveau' ? 'https://exemple.fr/sp' : '') });
  let r = S.appliquer('', [{ op: 'importer', items: [rec] }], { aujourdhui: AUJ });
  assert.strictEqual(r.ok, true);
  const rg = S.parserSas(r.texte)[0];
  assert.deepStrictEqual(rg.sources_detail.map((d) => d.nom), ['source-inconnue'], 'un nom invalide est écarté');
  let l = S.lister(r.texte, contexte).lignes[0];
  const inconnue = l.sources.filter((s) => s.nom === 'source-inconnue')[0];
  assert.strictEqual(inconnue.auRegistre, false); assert.match(inconnue.titre, /Décret du 25 juin 2026/); assert.match(inconnue.adressePropose, /^https:\/\/www\.legifrance/);
  assert.strictEqual(l.sources.filter((s) => s.nom === 'service-public-nouveau')[0].auRegistre, true);
  assert.deepStrictEqual(l.problemes, [], "une source inconnue dont la collecte a donné l'adresse https ne bloque plus : elle est ajoutée au registre à l'enregistrement");
  assert.deepStrictEqual(l.sourcesAAjouter.map((x) => [x.nom, x.adresse, x.portee]), [['source-inconnue', 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000000000000', 'national']]);
  assert.strictEqual(inconnue.aAjouter, true);
  // une source ajoutée à la main, puis une source retirée
  r = S.appliquer(r.texte, [{ op: 'sources', id: rg.id, ajouter: [{ nom: 'ma-source', titre: 'Page ajoutée à la main', url: 'https://exemple.fr/ma' }], retirer: ['source-inconnue'] }], { aujourdhui: AUJ });
  assert.strictEqual(r.ok, true);
  l = S.lister(r.texte, ctx({ adresseDe: () => '' })).lignes[0];
  assert.deepStrictEqual(l.sources.map((s) => s.nom), ['service-public-nouveau', 'ma-source']);
  assert.strictEqual(l.sources[1].titre, 'Page ajoutée à la main');
  assert.strictEqual(S.appliquer(r.texte, [{ op: 'sources', id: rg.id, ajouter: [{ nom: 'Pas Valide' }] }], {}).ok, false, 'nom court invalide refusé');
  assert.strictEqual(S.appliquer(r.texte, [{ op: 'sources', id: 'inconnu', ajouter: [] }], {}).ok, false);
});

test('construirePrompt : le message redonne la proposition, les adresses et le format de réponse', () => {
  const rec = S.lireReponse(REPONSE_MAJ, ctx()).items[0];
  const p = S.construirePrompt(rec, ctx(), 'SOCLE');
  assert.match(p, /^SOCLE/); assert.match(p, /\[FICHE\]/); assert.match(p, /Verdict/); assert.match(p, /https:\/\/exemple\.fr\//);
  assert.ok(!/[—–]/.test(p));
});

test('sources : ajout automatique au registre (adresse https connue), blocage seulement sans adresse ou en http', () => {
  const base = { genre: 'nouv', rayon: 'emploi', fiche: 'emploi-essai-sources', titre: 'Essai', champs: { titre: 'Essai', pour_qui: 'Utile si.', texte: 'Un paragraphe.', territoire: '24', sources: ['service-public-nouveau', 'nouvelle-https', 'nouvelle-http', 'nouvelle-vide'] },
    sources_detail: [{ nom: 'nouvelle-https', titre: 'Titre complet', url: 'https://exemple.org/p' }, { nom: 'nouvelle-http', titre: 'Mairie', url: 'http://mairie.example.org/' }] };
  const ev = S.evaluer(base, ctx());
  assert.deepStrictEqual(ev.sourcesAAjouter, [{ nom: 'nouvelle-https', titre: 'Titre complet', adresse: 'https://exemple.org/p', portee: '24' }], 'la portée de la fiche est reprise');
  const pb = ev.problemes.join(' ');
  assert.match(pb, /nouvelle-vide/); assert.match(pb, /sans adresse/);
  assert.match(pb, /nouvelle-http/); assert.match(pb, /en http/);
  assert.ok(!/nouvelle-https/.test(pb), "la source dont l'adresse est connue ne bloque pas");
  // sans les deux sources en défaut, plus aucun blocage et la demande de publication existe
  const propre = JSON.parse(JSON.stringify(base)); propre.champs.sources = ['service-public-nouveau', 'nouvelle-https'];
  const ev2 = S.evaluer(propre, ctx());
  assert.deepStrictEqual(ev2.problemes, []); assert.ok(ev2.demande && ev2.demande.type === 'fiche');
});

test('sources : une mise à jour qui ajoute une source connue par la collecte ne bloque pas non plus', () => {
  const rec = { genre: 'maj', rayon: 'emploi', fiche: ID, titre: 't', champs: { sources: SOURCES_REELLES.concat(['source-nouvelle']) }, revision: 'Source ajoutée.',
    sources_detail: [{ nom: 'source-nouvelle', titre: 'Page officielle', url: 'https://exemple.org/officielle' }] };
  const ev = S.evaluer(rec, ctx());
  assert.deepStrictEqual(ev.problemes, []);
  assert.deepStrictEqual(ev.sourcesAAjouter.map((x) => x.nom), ['source-nouvelle']);
  assert.ok(ev.demande && ev.demande.type === 'fiche-champs');
});

test('sources : le bloc [SOURCES] d\'une réponse donne les adresses des sources nouvelles, et elles survivent au remplacement', () => {
  const rep = '[FICHE]\ntitre: Une fiche\npour_qui: Utile si.\nsources:\n  - service-public-nouveau\n  - page-officielle\ntexte:\nUn paragraphe.\n[/FICHE]\n\n[SOURCES]\n- page-officielle | Page officielle du ministère | https://exemple.org/officielle\nautre-source | Non citée par la fiche | https://exemple.org/autre\nmauvaise ligne sans barres\n[/SOURCES]';
  assert.deepStrictEqual(S.lireBlocSources(rep).map((d) => d.nom), ['page-officielle', 'autre-source']);
  const lu = S.lireReponse(rep, ctx());
  assert.deepStrictEqual(lu.items[0].sourcesDetail.map((d) => d.nom), ['page-officielle'], 'seules les sources citées par la fiche sont gardées');
  assert.strictEqual(lu.notes.length, 0, 'le bloc [SOURCES] n\'est pas signalé comme un passage ignoré');
  let r = S.appliquer('', [{ op: 'importer', items: lu.items }], { aujourdhui: AUJ });
  assert.strictEqual(S.lister(r.texte, ctx()).lignes[0].problemes.length, 0);
  // une réponse qui remplace la proposition sans redonner l'adresse garde celle qui était déjà complète
  const sansBloc = S.lireReponse('[FICHE]\ntitre: Une fiche corrigée\npour_qui: Utile si.\nsources:\n  - service-public-nouveau\n  - page-officielle\ntexte:\nUn paragraphe corrigé.\n[/FICHE]', ctx());
  sansBloc.items[0].fiche = lu.items[0].fiche;
  r = S.appliquer(r.texte, [{ op: 'importer', items: sansBloc.items }], { aujourdhui: AUJ });
  const rg = S.parserSas(r.texte)[0];
  assert.deepStrictEqual((rg.sources_detail || []).map((d) => d.nom), ['page-officielle']);
  assert.match(S.construirePrompt(rg, ctx(), ''), /\[SOURCES\]/, 'le message à l\'assistant demande le bloc [SOURCES] pour toute source nouvelle');
});

test('phrase générale : obligatoire dès que le texte cite un chiffre ; sans chiffre ; écrite dans la fiche ; lue dans la réponse ; modifiable à la main', () => {
  const base = { genre: 'nouv', rayon: 'emploi', fiche: 'emploi-essai-phrase', titre: 'Essai', champs: { titre: 'Essai', pour_qui: 'Utile si.', texte: 'Vous avez droit à 3 mois de cumul.', territoire: 'national', sources: ['service-public-nouveau'] } };
  // chiffres dans le texte, pas de phrase : bloqué avec une phrase claire
  const sans = S.evaluer(base, ctx());
  assert.match(sans.problemes.join(' '), /phrase générale/); assert.strictEqual(sans.phrase.exigee, true); assert.strictEqual(sans.demande, null);
  // une phrase avec un chiffre (en chiffres, ou en lettres devant une unité) est refusée
  ['Le cumul dure 3 mois.', 'Le cumul dure trois mois.'].forEach((p) => {
    const pb = S.evaluer(Object.assign({}, base, { champs: Object.assign({}, base.champs, { phrase_generale: p }) }), ctx()).problemes.join(' ');
    assert.match(pb, /aucun chiffre/, p);
  });
  // une bonne phrase : plus de blocage, et la fiche écrite la porte (avant la ligne collecte), comme les fiches existantes
  const bonne = 'Le cumul est limité dans le temps ; demandez à votre conseiller où trouver la durée exacte.';
  const ok = S.evaluer(Object.assign({}, base, { champs: Object.assign({}, base.champs, { phrase_generale: bonne }) }), ctx());
  assert.deepStrictEqual(ok.problemes, []); assert.strictEqual(ok.demande.type, 'fiche');
  assert.strictEqual(F.champs(F.lire(ok.demande.texte)).phrase_generale, bonne);
  assert.ok(ok.demande.texte.indexOf('phrase_generale:') < ok.demande.texte.indexOf('collecte:'));
  // sans chiffre dans le texte, la phrase reste facultative
  assert.deepStrictEqual(S.evaluer(Object.assign({}, base, { champs: Object.assign({}, base.champs, { texte: 'Un paragraphe.' }) }), ctx()).problemes, []);
  // la réponse de l'assistant : la ligne phrase_generale est lue (sur une ou plusieurs lignes)
  const lu = S.lireReponse('[FICHE]\ntitre: Une fiche\npour_qui: Utile si.\nsources:\n  - service-public-nouveau\nphrase_generale: Première partie\n  suite de la phrase.\ntexte:\nUn paragraphe.\n[/FICHE]', ctx()).items[0];
  assert.strictEqual(lu.champs.phrase_generale, 'Première partie suite de la phrase.');
  // la personne l'écrit ou la corrige à la main : opération « phrase »
  const sas = S.ecrireSas([Object.assign({ id: 'nouv-essai', cree_le: AUJ, origine: 'test', revision: '' }, base)], '\n');
  const r = S.appliquer(sas, [{ op: 'phrase', id: 'nouv-essai', phrase: '  Une   phrase\nsimple.  ' }], ctx());
  assert.ok(r.ok, JSON.stringify(r)); assert.strictEqual(S.parserSas(r.texte)[0].champs.phrase_generale, 'Une phrase simple.');
  assert.ok(!S.appliquer(sas, [{ op: 'phrase', id: 'inconnue', phrase: 'x' }], ctx()).ok);
  // une mise à jour qui ajoute des chiffres au texte sans phrase propre est bloquée aussi ; avec une phrase, elle passe
  const maj = S.lireReponse(REPONSE_MAJ, ctx()).items[0];
  assert.ok(maj, 'la mise à jour de référence se lit');
});
