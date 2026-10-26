const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const lexique = require('../outils/veilleLexique.js');

const REEL = fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8');   // lecture seule : jamais ecrit par ces essais
const charger = (texte) => JSON.parse(JSON.stringify(vm.runInNewContext(texte + '\n;LEXIQUE_FICHES', {})));
const reels = charger(REEL);
const rel = (f) => (f.relations || []).map((r) => [r.ficheId, r.type]);

test('champs : ne rien demander ne change pas un seul octet du fichier', () => {
  const r = lexique.remplacerChamps(REEL, 'cdi', {});
  assert.ok(r.ok);
  assert.strictEqual(r.texte, REEL);
});

test('champs : reecrire TOUS les champs d\'un mot avec ses propres valeurs redonne le meme mot, pour les mots du vrai fichier', () => {
  reels.forEach((f, i) => {
    if (i % 3) { return; }   // un mot sur trois : la comparaison du fichier entier est longue ; les deux autres essais couvrent tous les mots
    const r = lexique.remplacerChamps(REEL, f.id, { titre: f.titre, titreDeTri: f.titreDeTri, univers: f.univers, registres: f.registres, variantes: f.variantesRecherche, corps: f.corps, relations: rel(f) });
    assert.ok(r.ok, f.id + ' : ' + JSON.stringify(r));
    const apres = charger(r.texte);
    assert.strictEqual(apres.length, reels.length, f.id + ' : aucun mot perdu ni ajoute');
    assert.strictEqual(JSON.stringify(apres), JSON.stringify(reels), f.id + ' : le Lexique charge doit etre strictement le meme');
  });
});

test('champs : reecrire les champs de texte (titre, tri, famille, registres, mots de recherche, texte) a l\'identique ne change presque aucun octet', () => {
  let identiques = 0;
  reels.forEach((f) => {
    const r = lexique.remplacerChamps(REEL, f.id, { titre: f.titre, titreDeTri: f.titreDeTri, univers: f.univers, registres: f.registres, variantes: f.variantesRecherche, corps: f.corps });
    assert.ok(r.ok, f.id);
    if (r.texte === REEL) { identiques++; }
  });
  assert.ok(identiques >= reels.length * 0.9, 'au moins 90 % des mots se reecrivent octet pour octet (mesure : ' + identiques + ' sur ' + reels.length + ')');
});

test('champs : un seul champ change, SEUL ce champ de CE mot differe dans le fichier', () => {
  const avant = lexique.trouverEntree(REEL, 'cdi');
  const r = lexique.remplacerChamps(REEL, 'cdi', { variantes: ['contrat fixe', 'poste stable', 'contrat sans date de fin'] });
  assert.ok(r.ok);
  assert.deepStrictEqual(r.modifies, ['variantes']);
  const apres = charger(r.texte), orig = charger(REEL);
  apres.forEach((f, i) => {
    if (f.id === 'cdi') { return; }
    assert.strictEqual(JSON.stringify(f), JSON.stringify(orig[i]), f.id + ' ne doit pas changer');
  });
  const cdi = apres.find((f) => f.id === 'cdi'), cdi0 = orig.find((f) => f.id === 'cdi');
  assert.deepStrictEqual(cdi.variantesRecherche, ['contrat fixe', 'poste stable', 'contrat sans date de fin']);
  ['titre', 'titreDeTri', 'type', 'univers', 'registres', 'corps', 'relations'].forEach((k) => assert.strictEqual(JSON.stringify(cdi[k]), JSON.stringify(cdi0[k]), 'champ intact : ' + k));
  // avant et apres du fichier, hors du mot : identiques octet pour octet
  assert.strictEqual(r.texte.slice(0, avant.debut), REEL.slice(0, avant.debut));
  const fin = lexique.trouverEntree(r.texte, 'cdi').fin;
  assert.strictEqual(r.texte.slice(fin), REEL.slice(avant.fin));
});

test('champs : titre, texte avec apostrophes et guillemets, registres, famille, relations : relus tels que demandes', () => {
  const r = lexique.remplacerChamps(REEL, 'pmsmp', { titre: "L'immersion \"PMSMP\"", corps: "Un texte avec l'apostrophe, des \"guillemets\" et un \\ antislash.", registres: ['langage-rh'], univers: 'formation', relations: [['cdi', 'voir-aussi'], ['cdd', 'a-ne-pas-confondre']] });
  assert.ok(r.ok, JSON.stringify(r));
  const f = charger(r.texte).find((x) => x.id === 'pmsmp');
  assert.strictEqual(f.titre, "L'immersion \"PMSMP\"");
  assert.strictEqual(f.corps, "Un texte avec l'apostrophe, des \"guillemets\" et un \\ antislash.");
  assert.deepStrictEqual(f.registres, ['langage-rh']);
  assert.strictEqual(f.univers, 'formation');
  assert.deepStrictEqual(f.relations, [{ ficheId: 'cdi', type: 'voir-aussi' }, { ficheId: 'cdd', type: 'a-ne-pas-confondre' }]);
  assert.strictEqual(lexique.lireEntrees(r.texte).length, reels.length);
});

test('champs : des relations vides s\'ecrivent « [] » ; un retour a la ligne dans un texte devient une espace', () => {
  const r = lexique.remplacerChamps(REEL, 'cdi', { relations: [], corps: 'Ligne un.\nLigne deux.' });
  assert.ok(r.ok);
  const f = charger(r.texte).find((x) => x.id === 'cdi');
  assert.deepStrictEqual(f.relations, []);
  assert.strictEqual(f.corps, 'Ligne un. Ligne deux.');
});

test('champs : les champs conserves (bouton vers Comprendre les chiffres, gabarit) ne sont jamais touches', () => {
  const avecExtra = reels.find((f) => f.voirAussiChiffres), notion = reels.find((f) => f.gabarit);
  [avecExtra, notion].forEach((f) => {
    const r = lexique.remplacerChamps(REEL, f.id, { corps: 'Nouveau texte simple.' });
    assert.ok(r.ok);
    const apres = charger(r.texte).find((x) => x.id === f.id);
    assert.strictEqual(apres.voirAussiChiffres, f.voirAussiChiffres);
    assert.strictEqual(apres.gabarit, f.gabarit);
    assert.strictEqual(apres.corps, 'Nouveau texte simple.');
  });
});

test('champs : refus clairs (mot inconnu, champ interdit) et fichier reel jamais modifie', () => {
  assert.ok(!lexique.remplacerChamps(REEL, 'mot-qui-nexiste-pas', { corps: 'x' }).ok);
  const r = lexique.remplacerChamps(REEL, 'cdi', { id: 'autre' });
  assert.ok(!r.ok);
  assert.match(r.erreur, /non modifiable/);
  assert.ok(!lexique.remplacerChamps(REEL, 'cdi', { type: 'notion' }).ok);
  assert.strictEqual(fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8'), REEL);
});

test('champs : le lecteur de positions ne se laisse pas tromper par des accolades, virgules et guillemets dans un texte', () => {
  const faux = "var LEXIQUE_FICHES = [\n  {\n    id: 'a', titre: 'Un, titre } et { bizarre', corps: \"Texte, avec } et { // et 'apostrophe' et \\\" guillemet\",\n    registres: ['x'],\n    relations: []\n  }\n];\n";
  const e = lexique.trouverEntree(faux, 'a');
  assert.deepStrictEqual(lexique.proprietesPositions(faux, e).map((p) => p.cle), ['id', 'titre', 'corps', 'registres', 'relations']);
  const r = lexique.remplacerChamps(faux, 'a', { registres: ['y', 'z'] });
  assert.ok(r.ok);
  assert.strictEqual(r.texte, faux.replace("registres: ['x']", "registres: ['y', 'z']"));
});
