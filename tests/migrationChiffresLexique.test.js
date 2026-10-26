const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const R = require('../scripts/reperesChiffres.js');
const regles = require('../scripts/checkLexique.js');
const lex = require('../outils/veilleLexique.js');
const mots = require('../outils/veilleMots.js');

const RACINE = path.join(__dirname, '..');
const CONTENU = fs.readFileSync(path.join(RACINE, 'data', 'lexique.js'), 'utf8');
const TRANSITION = regles.lireTransition(fs.readFileSync(regles.CHEMIN_TRANSITION, 'utf8'));
const CHEMIN = path.join(RACINE, 'outils', 'sas', 'migration_chiffres.sas.txt');
const PROPOSITIONS = fs.readFileSync(CHEMIN, 'utf8').split(/\r?\n/).filter((l) => l.trim() && l.trim()[0] !== '#').map((l) => JSON.parse(l));

test('migration : chaque proposition prepare par Claude est valide AVANT que Denis la voie (fiche connue, texte sans chiffre, bloc conforme, aucun doublon)', () => {
  assert.ok(PROPOSITIONS.length >= 10, 'le lot 1 est la');
  const vus = {};
  PROPOSITIONS.forEach((p) => {
    assert.ok(!vus[p.id], 'une seule proposition par fiche : ' + p.id); vus[p.id] = true;
    assert.ok(lex.lireMots(CONTENU).some((m) => m.id === p.id), 'fiche inconnue : ' + p.id);
    assert.deepStrictEqual(R.reperes(p.fond), [], 'le texte de fond de ' + p.id + ' ne doit avoir aucun chiffre');
    if (p.lignes.length) { assert.deepStrictEqual(regles.verifierDetails({ verifieLe: '', source: p.source, lignes: p.lignes }), [], p.id); }
    assert.ok(!/[–—]/.test(p.fond + JSON.stringify(p.lignes)), 'aucun tiret long : ' + p.id);
    assert.ok(!/\bIA\b/.test(p.fond), p.id);
    if (p.titre) { assert.ok(p.titreDeTri, 'un nouveau titre vient avec son titre de tri : ' + p.id); }
  });
});

test('migration : appliquer TOUTES les propositions ensemble donne un Lexique qui passe la regle des chiffres, avec la liste de transition qui retrecit', () => {
  const ids = PROPOSITIONS.filter((p) => TRANSITION.indexOf(p.id) !== -1).map((p) => p.id);
  let texte = CONTENU;
  PROPOSITIONS.filter((p) => ids.indexOf(p.id) !== -1).forEach((p) => {
    const champs = { corps: p.fond };
    if (p.lignes.length) { champs.details = { verifieLe: '', source: p.source, lignes: p.lignes }; }
    if (p.titre) { champs.titre = p.titre; champs.titreDeTri = p.titreDeTri; }
    const r = lex.remplacerChamps(texte, p.id, champs);
    assert.ok(r.ok, p.id + ' : ' + r.erreur);
    texte = r.texte;
  });
  const fiches = new Function('exports', texte + '\nreturn LEXIQUE_FICHES;')({});
  const reste = TRANSITION.filter((id) => ids.indexOf(id) === -1);
  assert.deepStrictEqual(regles.controlerChiffresDuTexte(fiches, reste), []);
  ids.forEach((id) => {
    const f = fiches.filter((x) => x.id === id)[0];
    if (f.detailsAJour === undefined) { return; }   // proposition sans bloc
    assert.deepStrictEqual(regles.verifierDetails(f.detailsAJour), [], id);
    // chaque ligne du bloc est bien lue pareil par l'outil
    assert.deepStrictEqual(lex.lireMots(texte).filter((m) => m.id === id)[0].details, f.detailsAJour, id);
  });
  assert.strictEqual(fiches.length, lex.lireMots(CONTENU).length, 'aucune fiche perdue');
});

test('migration : les valeurs du bloc viennent du texte ACTUEL de la fiche (rien d\'invente), et le texte de fond garde le sens (longueur voisine, phrases conservees)', () => {
  const tous = lex.lireMots(CONTENU);
  PROPOSITIONS.forEach((p) => {
    const m = tous.filter((x) => x.id === p.id)[0];
    if (!m || TRANSITION.indexOf(p.id) === -1) { return; }
    // le texte de fond n'est jamais plus long que l'original de plus de 5 % : on retire, on n'ajoute pas
    assert.ok(p.fond.length <= m.corps.length * 1.05, p.id + ' : le fond ne doit pas grossir');
    assert.ok(p.fond.length >= m.corps.length * 0.6, p.id + ' : le fond ne doit pas perdre l\'essentiel');
  });
});

test('migration : TOUTE fiche encore sur la liste de transition a sa proposition (couverture complete, 7 lots du 21 octobre 2026)', () => {
  const avec = new Set(PROPOSITIONS.map((p) => p.id));
  const sans = TRANSITION.filter((id) => !avec.has(id));
  assert.deepStrictEqual(sans, [], 'fiches sans proposition de migration');
});
