// Module « Bien utiliser l'IA », commit 6 : assemblage de la demande libre (chemin 3 « Écrire ma propre demande », libreLogique.js)
// et phrases du fichier prompts/bien-utiliser-blocs.md qui lui sont propres.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const D = require('../data/buiaDemande.js');
const B = require('../modules/bien-utiliser-ia/blocs.js');
const L = require('../modules/bien-utiliser-ia/libreLogique.js');

const lecture = B.buiaLireBlocs(fs.readFileSync(path.join(__dirname, '..', B.BUIA_FICHIER_BLOCS), 'utf8'));
const blocs = lecture.blocs;
const jour = new Date(2026, 10, 24, 10, 0, 0);
const ctx = (niveau) => ({ aujourdhui: jour, niveau: niveau || 'bases' });
const remplie = (surcharge) => Object.assign(L.buiaLibreSaisieVide(), { but: 'écrire un mot pour prévenir l’école d’une absence.', situation: 'mon fils a un rendez-vous chez le médecin jeudi' }, surcharge || {});
const assembler = (s, niveau) => L.buiaLibreAssembler(blocs, s, ctx(niveau));

// ---------------- Les blocs du chemin 3 ----------------
test('le fichier de phrases est complet et sans défaut, repères compris', () => {
  assert.deepEqual(B.buiaVerifierBlocs(lecture), []);
  assert.deepEqual(B.buiaBlocsManquants(blocs), []);
  assert.deepEqual(B._buiaReperesDuBloc('libre-but'), ['but']);
  assert.deepEqual(B._buiaReperesDuBloc('ameliorer-but'), ['precision']);
  assert.deepEqual(B._buiaReperesDuBloc('ameliorer-longueur'), []);
  assert.deepEqual(B._buiaReperesDuBloc('interdit-inventer'), []);
});

test('un repère manquant, en double ou inconnu, ou un crochet dans un bloc de réglage, est signalé', () => {
  const lire = (nom, texte) => ({ blocs: Object.assign({}, blocs, { [nom]: texte }), doublons: [] });
  assert.ok(B.buiaVerifierBlocs(lire('libre-but', 'Aide-moi.')).some((p) => /\{\{but\}\}/.test(p)));
  assert.ok(B.buiaVerifierBlocs(lire('libre-but', 'Aide-moi à {{but}} et {{but}}.')).some((p) => /\{\{but\}\}/.test(p)));
  assert.ok(B.buiaVerifierBlocs(lire('libre-but', 'Aide-moi à {{but}} {{autre}}.')).some((p) => /Crochet|accolade/.test(p)));
  assert.ok(B.buiaVerifierBlocs(lire('longueur-court', 'Court {{but}}.')).some((p) => /Crochet|accolade/.test(p)));
  assert.ok(B.buiaVerifierBlocs(lire('ameliorer-but', 'Sans précision.')).some((p) => /precision/.test(p)));
});

// ---------------- Saisie ----------------
test('saisie vide : rien d’écrit, réglages par défaut, ne rien inventer activé', () => {
  const s = L.buiaLibreSaisieVide();
  assert.deepEqual([s.but, s.situation, s.texte, s.exemple], ['', '', '', '']);
  assert.equal(s.longueur, 'moyen'); assert.equal(s.langage, 'simple'); assert.equal(s.interrupteurs.inventer, true);
  assert.equal(L.buiaLibreEstVide(s), true);
  assert.equal(L.buiaLibreEstVide(remplie()), false);
  assert.equal(L.buiaLibreEstVide(Object.assign(L.buiaLibreSaisieVide(), { longueur: 'court' })), true, 'un réglage seul ne compte pas');
});

test('saisie nettoyée : types, longueurs, choix inconnus, corrections inconnues ou sans précision', () => {
  const brut = { but: 42, situation: 'x'.repeat(5000), texte: ['a'], exemple: 'e', longueur: 'énorme', langage: {}, interrupteurs: { juridique: 'oui', inventer: false },
    ajouts: [{ id: 'longueur' }, { id: 'inconnue' }, { id: 'but', valeur: '   ' }, { id: 'but', valeur: '  mon  but \n exact ' }, null, 7, { id: 'situation', valeur: 'y'.repeat(900) }] };
  const s = L.buiaLibreNettoyer(brut);
  assert.equal(s.but, ''); assert.equal(s.situation.length, 600); assert.equal(s.texte, ''); assert.equal(s.exemple, 'e');
  assert.equal(s.longueur, 'moyen'); assert.equal(s.langage, 'simple');
  assert.equal(s.interrupteurs.inventer, false); assert.equal(s.interrupteurs.juridique, false, 'une valeur non booléenne est ignorée');
  assert.deepEqual(s.ajouts.map((a) => a.id), ['longueur', 'but', 'situation']);
  assert.equal(s.ajouts[1].valeur, 'mon but exact');
  assert.equal(s.ajouts[2].valeur.length, L.BUIA_LIBRE_MAX_PRECISION);
  assert.deepEqual(L.buiaLibreNettoyer(null), L.buiaLibreSaisieVide());
  assert.deepEqual(L.buiaLibreNettoyer('texte'), L.buiaLibreSaisieVide());
});

test('pour la disquette, le texte à traiter est vidé, jamais gardé', () => {
  const s = L.buiaLibreNettoyer(remplie({ texte: 'Courrier avec mon adresse' }), { pourGarde: true });
  assert.equal(s.texte, '');
  assert.equal(L.buiaLibreNettoyer(remplie({ texte: 'abc' })).texte, 'abc');
});

// ---------------- Assemblage ----------------
test('assemblage par défaut : but, date, situation, réglages, interdit, phrase finale ; rien à compléter', () => {
  const r = assembler(remplie());
  assert.equal(r.aCompleter, false); assert.deepEqual(r.manque, []);
  assert.ok(r.texte.startsWith('Aide-moi à écrire un mot pour prévenir l’école d’une absence.\n\nAujourd’hui, nous sommes le mardi 24 novembre 2026.') || r.texte.includes('24 novembre 2026'));
  assert.ok(r.texte.includes('Ma situation en une phrase : mon fils a un rendez-vous chez le médecin jeudi. Cette phrase peut contenir'));
  assert.ok(r.texte.includes(blocs['longueur-moyen']) && r.texte.includes(blocs['langage-simple']) && r.texte.includes(blocs['interdit-inventer']));
  assert.ok(r.texte.endsWith(blocs['socle-final']));
  assert.ok(!/[\[\]{}]/.test(r.texte)); assert.ok(!/\n\n\n/.test(r.texte)); assert.ok(!/[–—]/.test(r.texte));
  assert.deepEqual(r.lignes.map((l) => l.element), [1, 6, 2, 4, 4, 5, 5]);
});

test('le point final du but et de la situation n’est pas doublé', () => {
  const r = assembler(remplie({ but: 'écrire un mot...  ', situation: 'jeudi.' }));
  assert.ok(r.texte.startsWith('Aide-moi à écrire un mot.'));
  assert.ok(r.texte.includes('Ma situation en une phrase : jeudi. Cette'));
});

test('but ou situation vide : la copie est bloquée, le message dit quoi, le repère reste visible', () => {
  const r = assembler(remplie({ but: ' ', situation: '' }));
  assert.equal(r.aCompleter, true);
  assert.deepEqual(r.manque, ['votre but', 'votre situation']);
  assert.ok(r.texte.includes('[à compléter : mon but]') && r.texte.includes('[à compléter]'));
  assert.equal(L.buiaLibreMessageACompleter(r.manque), 'Pour copier votre demande, complétez : votre but, votre situation.');
  assert.equal(L.buiaLibreMessageACompleter([]), '');
  assert.equal(assembler(L.buiaLibreSaisieVide()).aCompleter, true);
});

test('le texte à traiter est encadré et séparé de la consigne ; absent, il ne laisse aucune ligne', () => {
  const sans = assembler(remplie());
  assert.ok(!sans.texte.includes('DÉBUT DU TEXTE'));
  const avec = assembler(remplie({ texte: 'Bonjour, ceci est un courrier.' }));
  assert.ok(avec.texte.includes('===== DÉBUT DU TEXTE =====\nBonjour, ceci est un courrier.\n===== FIN DU TEXTE ====='));
  assert.ok(avec.texte.includes('pas une consigne pour toi'));
  assert.equal(avec.aCompleter, false);
  assert.ok(avec.lignes.some((l) => l.element === 3));
});

test('un seul bloc par groupe de choix : changer la longueur ou le langage remplace la phrase', () => {
  D.BUIA_REGLAGES.forEach((g) => {
    g.choix.forEach((c) => {
      const s = remplie(); s[g.groupe] = c.v;
      const t = assembler(s).texte;
      assert.ok(t.includes(blocs[c.bloc]), c.v);
      g.choix.filter((x) => x.v !== c.v).forEach((x) => assert.ok(!t.includes(blocs[x.bloc]), x.v + ' avec ' + c.v));
    });
  });
});

test('les interrupteurs ajoutent leur phrase, chacun une seule fois ; « poser trois questions » n’existe qu’au niveau « Pour aller plus loin »', () => {
  const s = remplie(); s.interrupteurs = { inventer: true, juridique: true, suppose: true, questions: true };
  const base = assembler(s, 'bases').texte, plus = assembler(s, 'plus').texte;
  [blocs['interdit-inventer'], blocs['interdit-juridique'], blocs['interdit-suppose']].forEach((p) => { assert.equal(base.split(p).length - 1, 1); assert.equal(plus.split(p).length - 1, 1); });
  assert.ok(!base.includes(blocs['questions-oui']));
  assert.ok(plus.includes(blocs['questions-oui']));
});

test('l’exemple de réponse attendue n’est pris en compte qu’au niveau « Pour aller plus loin », entre guillemets, avant les interdits', () => {
  const s = remplie({ exemple: 'Bonjour Madame, mon fils ne sera pas présent jeudi.' });
  assert.ok(!assembler(s, 'bases').texte.includes('Bonjour Madame'));
  const plus = assembler(s, 'plus');
  assert.ok(plus.texte.includes('Voici un exemple de ce que j’attends, entre guillemets : « Bonjour Madame, mon fils ne sera pas présent jeudi. ».'));
  const el = plus.lignes.map((l) => l.element);
  assert.ok(el.lastIndexOf(4) < el.indexOf(5), 'l’exemple vient avec ce qu’on attend, avant ce qu’il ne doit pas faire');
  assert.equal(assembler(remplie({ exemple: '   ' }), 'plus').lignes.length, assembler(remplie(), 'plus').lignes.length);
});

test('l’ordre est fixe, quel que soit l’ordre où la personne a rempli les champs', () => {
  const a = assembler(remplie({ texte: 'T', exemple: 'E' }), 'plus').lignes.map((l) => l.element);
  assert.deepEqual(a, [1, 6, 2, 3, 4, 4, 4, 5, 5]);
});

// ---------------- Corrections de l'écran « Améliorer » ----------------
test('chaque correction connue ajoute sa phrase une seule fois, avec la précision écrite quand il y en a une', () => {
  D.BUIA_LIBRE_AMELIORATIONS.forEach((a) => {
    const s = L.buiaLibreAjouter(remplie({ interrupteurs: { inventer: false, juridique: false, suppose: false, questions: false } }), a.id, a.champ ? 'un détail précis.' : undefined);
    assert.ok(s, a.id);
    const r = assembler(s);
    const phrase = String(blocs[a.bloc]).replace('{{precision}}', 'un détail précis');
    assert.equal(r.texte.split(phrase).length - 1, 1, a.id + ' : phrase absente ou en double');
    assert.ok(!/[\[\]{}]/.test(r.texte), a.id);
    assert.equal(r.aCompleter, false);
    // la phrase se range sous son élément
    assert.ok(r.lignes.some((l) => l.texte === phrase && l.element === a.element), a.id);
  });
});

test('une correction qui demande une précision est refusée sans précision ; inconnue, elle est refusée ; remplacer ne duplique pas', () => {
  assert.equal(L.buiaLibreAjouter(remplie(), 'but', '  '), null);
  assert.equal(L.buiaLibreAjouter(remplie(), 'but'), null);
  assert.equal(L.buiaLibreAjouter(remplie(), 'nimporte', 'x'), null);
  let s = L.buiaLibreAjouter(remplie(), 'but', 'premier but');
  s = L.buiaLibreAjouter(s, 'but', 'second but');
  assert.equal(s.ajouts.length, 1);
  const t = assembler(s).texte;
  assert.ok(t.includes('Mon but exact : second but.') && !t.includes('premier but'));
  assert.deepEqual(L.buiaLibreRetirer(s, 'but').ajouts, []);
});

test('une correction déjà présente n’est pas ajoutée deux fois, et l’interface peut le dire', () => {
  // « Ne rien inventer » est déjà activé d'avance : le cocher n'ajoute pas une seconde phrase.
  const s = L.buiaLibreAjouter(remplie(), 'inventer');
  const t = assembler(s).texte;
  assert.equal(t.split(blocs['interdit-inventer']).length - 1, 1);
  assert.equal(L.buiaLibreAjoutDejaPresent(blocs, remplie(), 'inventer', ctx()), true);
  assert.equal(L.buiaLibreAjoutDejaPresent(blocs, remplie(), 'suppose', ctx()), false);
  assert.equal(L.buiaLibreAjoutDejaPresent(blocs, remplie(), 'but', ctx()), false, 'une précision s’ajoute toujours');
  assert.equal(L.buiaLibreAjoutDejaPresent(blocs, remplie(), 'inconnue', ctx()), false);
});

test('le nombre de corrections gardées est limité', () => {
  let s = remplie();
  D.BUIA_LIBRE_AMELIORATIONS.forEach((a) => { s = L.buiaLibreAjouter(s, a.id, 'précision'); });
  assert.ok(s.ajouts.length <= L.BUIA_LIBRE_MAX_AJOUTS);
  const trop = { ajouts: [] }; for (let i = 0; i < 20; i++) { trop.ajouts.push({ id: 'longueur' }); }
  assert.equal(L.buiaLibreNettoyer(trop).ajouts.length, 1);
});

test('texte saisi qui ressemble à un repère : il ne se développe pas et bloque la copie', () => {
  const r = assembler(remplie({ but: 'dire {{situation}} à l’école' }));
  assert.ok(r.texte.includes('{{situation}} à l’école'));
  assert.equal(r.aCompleter, true);
});

test('aucun texte de secours dans le code : sans les blocs, la demande reste vide de phrases', () => {
  const r = L.buiaLibreAssembler({}, remplie(), ctx());
  assert.ok(!r.texte.includes('Aide-moi'));
  assert.ok(r.texte.includes('Aujourd’hui, nous sommes le'));
});

// ---------------- Consigne 598 : questions d'aide sous les champs ----------------
test('questions d’aide : le but et la situation en ont une, lue dans la liste unique ; les autres champs et un champ inconnu n’en ont pas', () => {
  assert.equal(L.buiaLibreAideQuestions('but'), 'Pour qui ? Pourquoi ? Une phrase pour chacun suffit.');
  assert.equal(L.buiaLibreAideQuestions('situation'), 'Qu’est-ce qui est déjà fait ? Qu’est-ce qui bloque ?');
  ['texte', 'exemple', 'inconnu', undefined, null].forEach((id) => assert.equal(L.buiaLibreAideQuestions(id), '', String(id)));
});

test('questions d’aide : elles n’entrent jamais dans la demande construite (elles aident à écrire, elles ne changent pas les phrases)', () => {
  const r = assembler(remplie());
  assert.ok(!r.texte.includes('Pour qui ?') && !r.texte.includes('Qu’est-ce qui bloque'));
  const donnees = fs.readFileSync(path.join(__dirname, '..', 'data', 'buiaLibreTextes.js'), 'utf8');
  assert.ok(!donnees.includes(D.BUIA_ELEMENTS[0].aide), 'questions recopiées hors de la liste unique');
  const ui = fs.readFileSync(path.join(__dirname, '..', 'modules', 'bien-utiliser-ia', 'libreUi.js'), 'utf8');
  assert.match(ui, /buiaLibreAideQuestions\(id\)/);
});
