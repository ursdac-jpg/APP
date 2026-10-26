const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { creerDepot } = require('../outils/veilleDepot.js');
const mots = require('../outils/veilleMots.js');
const lex = require('../outils/veilleLexique.js');

// Le module de l'application pose ses globales au chargement : memes decors que tests/lexiqueLogique.test.js.
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;
global.LEXIQUE_FICHES = global.LEXIQUE_FICHES || [];
global.LEXIQUE_COLLECTIONS = global.LEXIQUE_COLLECTIONS || [];
global.LEXIQUE_SECOND_NIVEAU = global.LEXIQUE_SECOND_NIVEAU || [];
global.echapperAttribut = global.echapperAttribut || function (t) { return String(t || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
const app = require('../modules/lexique/index.js');

const SRC = { nom: 'service-public.fr', url: 'https://www.service-public.fr' };
const LIGNE = { libelle: 'Plafond', valeur: '1 500 €', categorie: 'montant', peutChanger: true };
const FAIT = { libelle: 'Fin', valeur: '31 décembre 2024', categorie: 'date', peutChanger: false };
const BLOC = { verifieLe: '2026-10-12', source: SRC, lignes: [LIGNE, FAIT] };

function jourPlus(iso, n) { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

test('l\'outil et l\'application disent la meme chose du meme bloc, jour apres jour (jamais deux regles qui derivent)', () => {
  const traduit = { sans: 'absent', stable: 'stable', ajour: 'ajour', bientot: 'ajour', perime: 'message', jamais: 'message' };
  const cas = [BLOC, Object.assign({}, BLOC, { verifieLe: '' }), Object.assign({}, BLOC, { lignes: [FAIT] }), Object.assign({}, BLOC, { lignes: [FAIT], verifieLe: '' }),
    Object.assign({}, BLOC, { verifieLe: 'bientot' }), Object.assign({}, BLOC, { lignes: [] }), Object.assign({}, BLOC, { source: {} }), null, {}, { illisible: 'x' }];
  let n = 0;
  cas.forEach((b) => {
    for (let j = -400; j <= 500; j += 3) {
      const auj = jourPlus('2026-10-12', j);
      const a = app._lexiqueEtatDetails(b, auj, 6), o = mots.etatDetails(b, auj, 6);
      assert.strictEqual(traduit[o], a, JSON.stringify(b) + ' au ' + auj + ' : outil ' + o + ', application ' + a);
      n++;
    }
  });
  assert.ok(n > 1000);
  [3, 9, 12].forEach((s) => { for (let j = 0; j <= 450; j += 5) { const auj = jourPlus('2026-10-12', j); assert.strictEqual(traduit[mots.etatDetails(BLOC, auj, s)], app._lexiqueEtatDetails(BLOC, auj, s)); } });
});

test('etat cote outil : a jour, bientot (le dernier mois), perime, jamais verifie, faits qui ne changent pas, pas de bloc', () => {
  assert.strictEqual(mots.etatDetails(BLOC, '2026-10-20', 6), 'ajour');
  assert.strictEqual(mots.etatDetails(BLOC, '2027-03-20', 6), 'bientot');
  assert.strictEqual(mots.etatDetails(BLOC, '2027-04-20', 6), 'perime');
  assert.strictEqual(mots.etatDetails(Object.assign({}, BLOC, { verifieLe: '' }), '2026-10-20', 6), 'jamais');
  assert.strictEqual(mots.etatDetails(Object.assign({}, BLOC, { lignes: [FAIT] }), '2040-01-01', 6), 'stable');
  assert.strictEqual(mots.etatDetails(null, '2026-10-20', 6), 'sans');
});

test('le seuil est LU dans le module de l\'application : une seule valeur', () => {
  const texte = fs.readFileSync(path.join(__dirname, '..', 'modules', 'lexique', 'index.js'), 'utf8');
  assert.strictEqual(mots.lireSeuilDetails(texte), app.LEXIQUE_SEUIL_MOIS_DETAILS);
  assert.strictEqual(mots.lireSeuilDetails('rien'), 6);
});

// ---------- depot de test jetable ----------
function git(d, ...a) { return spawnSync('git', a, { cwd: d, encoding: 'utf8' }); }
function ecrire(d, c, t) { const p = path.join(d, c); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, t, 'utf8'); }
const FICHES = [
  '/* en-tete */', '', 'var LEXIQUE_FICHES = [', '',
  '  {', "    id: 'cdi', titre: 'CDI', titreDeTri: 'CDI', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],",
  "    variantesRecherche: ['contrat fixe'],", '    corps: "Un CDI est un contrat sans date de fin prevue. Il est la forme habituelle d\'embauche.",', "    relations: [],", '  },',
  '  {', "    id: 'cdd', titre: 'CDD', titreDeTri: 'CDD', type: 'terme',", "    univers: 'contrats-statuts-emploi', registres: ['langage-rh'],",
  "    variantesRecherche: [],", '    corps: "Un CDD est un contrat qui a une date de fin. Il sert a remplacer une equipe.",', "    relations: []", '  }',
  '];', ''
].join('\n');
function creerDepotDeTest() {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), 'veille-details-'));
  git(d, 'init', '-q', '-b', 'master'); git(d, 'config', 'user.email', 'essai@example.org'); git(d, 'config', 'user.name', 'Essai'); git(d, 'config', 'commit.gpgsign', 'false');
  ecrire(d, 'data/lexique.js', FICHES);
  ecrire(d, 'modules/lexique/index.js', 'var LEXIQUE_SEUIL_MOIS_DETAILS = 4;\n');
  ecrire(d, 'scripts/checkLexique.js', "console.log('Aucune erreur.');\n");
  ecrire(d, 'tests/ok.test.js', "const t=require('node:test');t('essai',()=>{});\n");
  ecrire(d, 'package.json', '{"name":"essai","private":true}\n');
  git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'depart');
  return d;
}
const nettoyer = (d) => { try { fs.rmSync(d, { recursive: true, force: true }); } catch (e) { /* tant pis */ } };
const lire = (d, c) => fs.readFileSync(path.join(d, c), 'utf8');
const horloge = () => '2026-10-20 14:05';
const MOT = { id: 'forfait-jours', titre: 'Forfait jours', titreDeTri: 'Forfait jours', univers: 'droit-travail', registres: ['langage-rh'], variantes: ['cadre au forfait'], corps: 'Une façon de décompter le temps de travail en jours. Elle concerne certains cadres.', relations: [{ ficheId: 'cdi', type: 'voir-aussi' }].map((r) => [r.ficheId, r.type]) };

test('un mot neuf peut naitre avec son bloc « Les chiffres a jour » ; la liste dit son etat et le seuil lu dans le module', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge, aujourdhui: () => '2026-10-20' });
    const r = depot.publier([{ type: 'lexique-nouveau', mot: Object.assign({}, MOT, { details: BLOC }), origine: 'saisi par vous' }]);
    assert.ok(r.ok, JSON.stringify(r));
    const texte = lire(d, 'data/lexique.js');
    assert.match(texte, /detailsAJour: \{\n\s+verifieLe: '2026-10-12'/);
    const l = depot.listerMots();
    assert.strictEqual(l.seuilMois, 4);
    const m = l.mots.find((x) => x.id === 'forfait-jours');
    assert.deepStrictEqual(m.details, BLOC);
    assert.strictEqual(m.detailsEtat, 'ajour');
    assert.strictEqual(l.mots.find((x) => x.id === 'cdi').detailsEtat, 'sans');
    assert.strictEqual(new Function('exports', texte + '\nreturn LEXIQUE_FICHES;')({}).filter((f) => f.id === 'forfait-jours')[0].detailsAJour.lignes.length, 2, 'le fichier se charge pour de vrai');
    const mal = depot.publier([{ type: 'lexique-nouveau', mot: Object.assign({}, MOT, { id: 'autre-mot', titre: 'Autre mot', titreDeTri: 'Autre mot', details: Object.assign({}, BLOC, { lignes: [] }) }), origine: '' }]);
    assert.ok(!mal.ok); assert.strictEqual(mal.code, 'lexique-mot');
  } finally { nettoyer(d); }
});

test('ajouter puis retirer un bloc sur une fiche existante, par l\'enregistrement de l\'outil', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge, aujourdhui: () => '2026-10-20' });
    const avant = lire(d, 'data/lexique.js');
    const r = depot.publier([{ type: 'lexique-champs', id: 'cdi', champs: { details: BLOC }, phrase: 'chiffres ajoutés' }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.deepStrictEqual(lex.lireMots(lire(d, 'data/lexique.js')).find((x) => x.id === 'cdi').details, BLOC);
    const evo = mots.lireEvolution(lire(d, 'outils/evolution_lexique.txt')).filter((e) => e.champ === 'details');
    assert.strictEqual(evo.length, 1);
    assert.match(evo[0].apres, /vérifié le 2026-10-12/);
    const r2 = depot.publier([{ type: 'lexique-champs', id: 'cdi', champs: { details: null }, phrase: 'chiffres retirés' }]);
    assert.ok(r2.ok, JSON.stringify(r2));
    assert.strictEqual(lire(d, 'data/lexique.js'), avant, 'retire : fichier d\'origine');
  } finally { nettoyer(d); }
});

test('le controle en direct renvoie les reperes du texte avec leur position (pour « placer dans le bloc »)', () => {
  const d = creerDepotDeTest();
  try {
    const depot = creerDepot(d, { maintenant: horloge });
    const corps = 'Une aide de 500 € pendant douze mois, depuis le 1er janvier 2026.';
    const v = depot.verifierMotLexique({ nouveau: true, mot: Object.assign({}, MOT, { corps: corps }) });
    assert.ok(v.ok);
    assert.strictEqual(v.corpsVerifie, corps);
    assert.deepStrictEqual(v.reperes.map((r) => [r.cat, r.texte]), [['montant', '500 €'], ['duree', 'douze mois'], ['date', '1er janvier 2026']]);
    v.reperes.forEach((r) => assert.strictEqual(corps.slice(r.debut, r.fin), r.texte));
  } finally { nettoyer(d); }
});

test('migration : la fiche sort de la liste de transition DANS LE MEME enregistrement quand son texte n\'a plus de chiffre', () => {
  const d = creerDepotDeTest();
  try {
    ecrire(d, 'data/lexique.js', lire(d, 'data/lexique.js').replace('Il est la forme habituelle d\'embauche.', 'Il est la forme habituelle d\'embauche, depuis 2026.'));
    ecrire(d, 'outils/lexique_transition_chiffres.txt', '# liste\ncdi\n');
    git(d, 'add', '-A'); git(d, 'commit', '-q', '-m', 'cdi avec chiffre');
    const depot = creerDepot(d, { maintenant: horloge, aujourdhui: () => '2026-10-20' });
    // encore un chiffre dans le texte alors que la fiche n'est PAS sur la liste : refuse en direct
    const refuse = depot.verifierMotLexique({ nouveau: false, mot: { id: 'cdd', corps: 'Un CDD dure douze mois. Il est court.' }, phrase: 'x' });
    assert.ok(refuse.erreurs.some((e) => /Chiffre ou date repéré/.test(e)));
    const texteSans = 'Un CDI est un contrat sans date de fin prevue. Il est la forme habituelle d\'embauche.';
    const r = depot.publier([{ type: 'lexique-champs', id: 'cdi', champs: { corps: texteSans, details: { verifieLe: '2026-10-20', source: SRC, lignes: [{ libelle: 'Année', valeur: '2026', categorie: 'date', peutChanger: false }] } }, phrase: 'chiffre déplacé dans le bloc' }]);
    assert.ok(r.ok, JSON.stringify(r));
    assert.doesNotMatch(lire(d, 'outils/lexique_transition_chiffres.txt'), /^cdi$/m);
    assert.match(lire(d, 'outils/lexique_transition_chiffres.txt'), /# liste/, 'les commentaires de la liste restent');
    assert.ok(/\bdetailsAJour\b/.test(lire(d, 'data/lexique.js')));
  } finally { nettoyer(d); }
});
