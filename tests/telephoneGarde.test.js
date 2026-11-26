/* Garde-fous « téléphone » (audit du 24/11/2026, docs/AUDIT_TELEPHONE_2026-11-24.md).
   Ces tests lisent les fichiers (pas de navigateur). Le balayage complet des 68 routes à 375 px se lance à part : npm run telephone. */
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');

function fichiers(dossier, ext, sortie) {
  fs.readdirSync(path.join(RACINE, dossier), { withFileTypes: true }).forEach((e) => {
    const rel = path.join(dossier, e.name);
    if (e.isDirectory()) { if (['node_modules', 'vendor', 'tests', 'docs', 'outils', 'scripts'].indexOf(e.name) === -1) { fichiers(rel, ext, sortie); } }
    else if (ext.indexOf(path.extname(e.name)) !== -1) { sortie.push(rel); }
  });
  return sortie;
}

test('index.html déclare la largeur de l\'écran (sans elle, le téléphone affiche une page d\'ordinateur réduite)', () => {
  assert.ok(/<meta name="viewport" content="width=device-width, initial-scale=1(\.0)?">/.test(lire('index.html')));
});

test('aucune colonne de grille ne demande plus de place qu\'un téléphone n\'en a (minmax avec une largeur fixe sans min(..., 100%))', () => {
  const fautifs = [];
  ['css', 'modules', 'js', 'data'].forEach((d) => fichiers(d, ['.css', '.js'], []).forEach((f) => {
    const t = lire(f);
    const re = /minmax\(\s*(?!min\()([0-9.]+)(rem|px)\s*,/g;
    let m;
    while ((m = re.exec(t))) {
      const px = m[2] === 'rem' ? Number(m[1]) * 16 : Number(m[1]);
      if (px > 300) { fautifs.push(f + ' : minmax(' + m[1] + m[2] + ', ...)'); }
    }
  }));
  assert.deepStrictEqual(fautifs, [], 'une colonne de plus de 300 px déborde sur un écran de 375 px : écrire minmax(min(Xrem, 100%), 1fr)');
});

test('la règle « écran tactile » garde ses zones à toucher de 44 px (boutons du haut, flèches, étapes)', () => {
  const css = lire('css/style.css');
  const i = css.indexOf('Écran tactile (24/11/2026');
  assert.ok(i !== -1, 'bloc « Écran tactile » présent');
  const bloc = css.slice(i, css.indexOf('Boutons repliables (15/11/2026'));
  assert.ok(/@media \(pointer: coarse\), \(max-width: 768px\)/.test(bloc));
  ['#btnPreferencesAffichage::after', '#btnAide::after', '#btnSessionTransfert::after', '#btnNouveautes::after', '#btnIntroduction::after', '#btnCarnet::after', '.pastille-etape-action::after', '.fleche-bouton::after'].forEach((s) => {
    assert.ok(bloc.indexOf(s) !== -1, s + ' garde sa zone à toucher');
  });
  assert.ok(/min-width: 44px; min-height: 44px/.test(bloc), 'au moins 44 px');
  assert.ok(!/color|background/.test(bloc.replace(/\/\*[\s\S]*?\*\//g, '')), 'aucune couleur : le mode sombre n\'est pas concerné');
});

test('le balayage téléphone existe et se lance avec npm run telephone', () => {
  const pkg = JSON.parse(lire('package.json'));
  assert.strictEqual(pkg.scripts.telephone, 'node scripts/rendu/balayageTelephone.js');
  assert.strictEqual(pkg.scripts['telephone:parcours'], 'node scripts/rendu/balayageTelephoneParcours.js');
  assert.strictEqual(pkg.scripts['telephone:modules'], 'node scripts/rendu/balayageTelephoneModules.js');
  // La mesure est écrite une seule fois (mesureTelephone.js) et partagée par le balayage des routes et celui des parcours.
  const s = lire('scripts/rendu/mesureTelephone.js');
  assert.ok(/isMobile: true, hasTouch: true/.test(s), 'téléphone simulé tactile');
  assert.ok(/SEUIL_CIBLE = 44/.test(s));
  assert.ok(/mesureTelephone/.test(lire('scripts/rendu/balayageTelephone.js')), 'le balayage des routes utilise la mesure partagée');
  assert.ok(/mesureTelephone/.test(lire('scripts/rendu/balayageTelephoneModules.js')), 'le balayage des modules utilise la mesure partagée');
  assert.ok(/mesureTelephone/.test(lire('scripts/parcours/protocole/outils.js')), 'le protocole des parcours utilise la mesure partagée');
});

test('plein écran « Régler le CV » : « Agrandir le CV » et « Outils » réservés au téléphone, poignées agrandies seulement sur la page agrandie', () => {
  const css = lire('css/mise-en-page-maquette.css');
  const js = lire('modules/cv-pdf-html/cvPdfPleinEcranMaquette.js');
  // masqués par défaut (ordinateur), montrés seulement dans la règle écran tactile ou étroit
  assert.ok(/\.mep-mq \.mq-agrandir, \.mep-mq \.mq-outils-btn \{ display: none; \}/.test(css), 'boutons masqués hors téléphone');
  const bloc = css.slice(css.indexOf('.mep-mq .mq-agrandir, .mep-mq .mq-outils-btn { display: none; }'));
  assert.ok(/@media \(pointer: coarse\), \(max-width: 768px\) \{\s*\.mep-mq \.mq-agrandir \{ display: inline-flex; \}/.test(bloc), 'bouton montré sur téléphone');
  // l'échelle agrandie et les classes ne s'appliquent que si l'écran est tactile ou étroit (même condition que les feuilles de style)
  assert.ok(/matchMedia\('\(pointer: coarse\), \(max-width: 768px\)'\)/.test(js));
  assert.ok(/function _mqAgrandi\(\) \{ return !!\(_mqPlein\.agrandi && _mqTactile\(\)\); \}/.test(js));
  // les règles de grosses poignées exigent à la fois « tactile » et « zoome »
  const regles = js.split('\n').filter((l) => /\.mq-poi|\.mq-poignee|\.mq-fleche|\.mq-x/.test(l) && /tactile/.test(l));
  assert.ok(regles.length >= 5);
  regles.forEach((l) => assert.ok(/\.tactile\.zoome/.test(l), 'règle tactile sans zoome : ' + l.slice(0, 80)));
});

test('champs de saisie à 16 px au moins sur téléphone (sinon un iPhone zoome sur la page) : règle unique et contrôle dans la mesure partagée', () => {
  const css = lire('css/style.css');
  const i = css.indexOf('champs de saisie à 16 px au moins');
  assert.ok(i > 0, 'bloc de la règle absent');
  const bloc = css.slice(i);
  assert.ok(/@media \(pointer: coarse\), \(max-width: 768px\) \{[\s\S]*font-size: max\(16px, 1em\) !important;/.test(bloc), 'règle réservée au tactile ou à l\'écran étroit');
  assert.ok(/champsPetits/.test(lire('scripts/rendu/mesureTelephone.js')), 'la mesure partagée contrôle les champs');
  assert.ok(/champsPetits/.test(lire('scripts/rendu/balayageTelephone.js')), 'le balayage des routes signale les champs trop petits');
});

test('essai avec saisies (25/11/2026) : fonctions partagées, parcours de « Ce qui compte pour moi », mots très longs sans débordement', () => {
  const m = lire('scripts/rendu/mesureTelephone.js');
  assert.ok(/function remplirChamps\(/.test(m) && /function controleClavier\(/.test(m), 'remplissage des champs et contrôle du clavier dans la mesure partagée');
  assert.ok(/remplirChamps/.test(lire('scripts/rendu/balayageTelephoneModules.js')) && /--saisies/.test(lire('scripts/rendu/balayageTelephoneModules.js')), 'le balayage des modules sait saisir');
  const o = lire('scripts/parcours/protocole/outils.js');
  assert.ok(/remplir: async/.test(o) && /clavier: async/.test(o), 'le protocole sait remplir et simuler le clavier');
  const c = lire('scripts/parcours/protocole/cqcpmCartes.js');
  assert.ok(/a\.remplir\(\)/.test(c) && /a\.clavier\(\)/.test(c) && /cqcpmAllerCarte/.test(c), 'le parcours des cartes remplit, contrôle le clavier et ouvre chaque carte');
  // réponses en boutons de 40 px portées à 44 px sur téléphone
  const css = lire('css/style.css');
  assert.ok(/@media \(pointer: coarse\), \(max-width: 768px\) \{\s*body \.cqcpm-rep button\.petit, body \.cqcpm-val \.cqcpm-rep button \{ min-height: 44px; \}/.test(css));
  // un mot ou une adresse très long ne doit pas élargir la page (deux colonnes de « Bien utiliser l'IA »)
  const b = lire('modules/bien-utiliser-ia/bienUtiliserIa.css');
  assert.ok(/\.buia-deux-col > \* \{ min-width: 0; \}/.test(b) && /\.buia-demande-texte \{ overflow-wrap: anywhere; \}/.test(b));
});
