const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const lexique = require('../outils/veilleLexique.js');
const { analyserCandidatsLexique, integrerCandidatsLexique } = require('../outils/veilleDepot.js');

const REEL = fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8');   // lecture seule : jamais ecrit par ces essais
// Charge le fichier (donnees du depot) dans un contexte vide, seulement pour COMPARER le resultat des essais.
const charger = (texte) => vm.runInNewContext(texte + '\n;LEXIQUE_FICHES', {});

function candidat(id, extra, corps) {
  return "{\n  id: '" + id + "',\n  titre: \"Titre modifie\",\n  titreDeTri: \"Titre modifie\", type: 'terme',\n  univers: 'dispositifs',\n  registres: ['langage-cip'],\n  variantesRecherche: [\"variante nouvelle\"],\n  corps: \"" + (corps || 'Nouveau corps du mot.') + '"' + (extra || '\n') + '},\n\n';
}
const RELATIONS = ",\n  relations: [\n    { ficheId: 'pmsmp', type: 'voir-aussi' }\n  ]\n";

test('lexique : tous les mots du vrai fichier sont reperes (meme nombre que le verificateur du projet)', () => {
  const ids = lexique.identifiantsExistants(REEL);
  const reels = charger(REEL);
  assert.strictEqual(ids.length, reels.length);
  assert.strictEqual(JSON.stringify(ids), JSON.stringify(reels.map((f) => f.id)));
});

test('lexique : le lecteur ne se laisse pas tromper par des accolades, guillemets ou « // » a l\'interieur d\'un texte', () => {
  const faux = "var LEXIQUE_FICHES = [\n  {\n    id: 'a', titre: 'Un } et un { dans le titre', corps: \"Texte avec } et { et // pas un commentaire et 'apostrophe' et \\\" guillemet\",\n    relations: [ { ficheId: 'b', type: 'voir-aussi' } ]\n  },\n  // un commentaire avec } et {\n  {\n    id: 'b', titre: 'B', corps: 'B \\' B'\n  }\n];\nvar AUTRE = [{ id: 'c' }];\n";
  assert.deepStrictEqual(lexique.identifiantsExistants(faux), ['a', 'b']);
  const e = lexique.trouverEntree(faux, 'b');
  assert.strictEqual(faux.slice(e.debut, e.fin), "{\n    id: 'b', titre: 'B', corps: 'B \\' B'\n  }");
  assert.deepStrictEqual(lexique.proprietes(faux.slice(lexique.trouverEntree(faux, 'a').debut, lexique.trouverEntree(faux, 'a').fin)).map((p) => p.cle), ['id', 'titre', 'corps', 'relations']);
  assert.strictEqual(lexique.trouverEntree(faux, 'c'), null, 'un identifiant d\'une AUTRE liste n\'est pas un mot du lexique');
});

test('lexique : remplacer un mot du vrai fichier ne change QUE ce mot, et recopie ses champs supplementaires', () => {
  const reels = charger(REEL);
  const avecExtra = reels.find((f) => f.voirAussiChiffres) || reels.find((f) => Object.keys(f).some((k) => ['id', 'titre', 'titreDeTri', 'type', 'gabarit', 'univers', 'registres', 'variantesRecherche', 'corps', 'relations'].indexOf(k) === -1));
  assert.ok(avecExtra, 'le vrai lexique doit contenir au moins un mot avec un champ supplementaire');
  const extras = Object.keys(avecExtra).filter((k) => ['id', 'titre', 'titreDeTri', 'type', 'gabarit', 'univers', 'registres', 'variantesRecherche', 'corps', 'relations'].indexOf(k) === -1);
  const c = analyserCandidatsLexique(candidat(avecExtra.id));
  assert.ok(c.ok, JSON.stringify(c));
  const r = integrerCandidatsLexique(REEL, c, '2026-10', { remplacerExistants: true });
  assert.ok(r.ok, JSON.stringify(r));
  assert.deepStrictEqual(r.remplaces, [avecExtra.id]);
  assert.deepStrictEqual(r.ajoutes, []);
  const apres = charger(r.texte);
  assert.strictEqual(apres.length, reels.length, 'aucun mot perdu ni ajoute');
  apres.forEach((f, i) => {
    if (f.id === avecExtra.id) { return; }
    assert.strictEqual(JSON.stringify(f), JSON.stringify(reels[i]), 'le mot ' + f.id + ' ne doit pas changer');
  });
  const nouveau = apres.find((f) => f.id === avecExtra.id);
  assert.strictEqual(nouveau.titre, 'Titre modifie');
  assert.strictEqual(nouveau.corps, 'Nouveau corps du mot.');
  assert.strictEqual(JSON.stringify(nouveau.variantesRecherche), JSON.stringify(['variante nouvelle']));
  extras.forEach((k) => assert.strictEqual(JSON.stringify(nouveau[k]), JSON.stringify(avecExtra[k]), 'champ conserve : ' + k));
  // relations anciennes gardees si le nouveau texte n'en propose pas
  assert.strictEqual(JSON.stringify(nouveau.relations), JSON.stringify(avecExtra.relations));
});

test('lexique : des relations proposees remplacent les anciennes ; sans relations proposees, les anciennes sont gardees', () => {
  const reels = charger(REEL);
  const avecRel = reels.find((f) => f.relations && f.relations.length && f.id !== 'pmsmp');
  assert.ok(avecRel);
  const r1 = integrerCandidatsLexique(REEL, analyserCandidatsLexique(candidat(avecRel.id, RELATIONS)), '2026-10', { remplacerExistants: true });
  assert.ok(r1.ok, JSON.stringify(r1));
  assert.strictEqual(JSON.stringify(charger(r1.texte).find((f) => f.id === avecRel.id).relations), JSON.stringify([{ ficheId: 'pmsmp', type: 'voir-aussi' }]));
  const r2 = integrerCandidatsLexique(REEL, analyserCandidatsLexique(candidat(avecRel.id)), '2026-10', { remplacerExistants: true });
  assert.strictEqual(JSON.stringify(charger(r2.texte).find((f) => f.id === avecRel.id).relations), JSON.stringify(avecRel.relations));
  assert.ok(r2.conserves[avecRel.id].indexOf('relations') !== -1);
});

test('lexique : sans confirmation, un mot existant arrete tout ; un melange (nouveau + existant) remplace l\'un et ajoute l\'autre', () => {
  const sans = integrerCandidatsLexique(REEL, analyserCandidatsLexique(candidat('pmsmp')), '2026-10');
  assert.ok(!sans.ok);
  assert.strictEqual(sans.code, 'lexique-existant');
  assert.deepStrictEqual(sans.ids, ['pmsmp']);
  const melange = integrerCandidatsLexique(REEL, analyserCandidatsLexique(candidat('pmsmp') + candidat('mot-tout-neuf')), '2026-10', { remplacerExistants: true });
  assert.ok(melange.ok);
  assert.deepStrictEqual(melange.remplaces, ['pmsmp']);
  assert.deepStrictEqual(melange.ajoutes, ['mot-tout-neuf']);
  const apres = charger(melange.texte);
  assert.strictEqual(apres.length, charger(REEL).length + 1);
  assert.strictEqual(apres[apres.length - 1].id, 'mot-tout-neuf');
});

test('lexique : un mot introuvable est refuse clairement', () => {
  const r = lexique.remplacerEntree(REEL, analyserCandidatsLexique(candidat('mot-qui-nexiste-pas')).entrees[0]);
  assert.ok(!r.ok);
  assert.match(r.erreur, /introuvable/);
});

test('lexique : le fichier reel n\'a pas ete modifie par ces essais', () => {
  assert.strictEqual(fs.readFileSync(path.join(__dirname, '..', 'data', 'lexique.js'), 'utf8'), REEL);
});
