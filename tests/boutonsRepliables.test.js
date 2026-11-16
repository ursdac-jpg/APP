'use strict';
// Boutons repliables (consignes 332 à 332 sexies) : logique pure + garde-fous de la structure (flèches, feuille de style, règle « par-dessus, jamais de décalage »).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../modules/boutons-repliables/logique.js');
const NV = require('../modules/nouveautes/logique.js');

const lire = (...p) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const html = lire('index.html');
const css = lire('css', 'style.css');

test('au départ rien n\'est replié (première visite comme avant)', () => {
  assert.deepStrictEqual(L.brEtatInitial(), { gauche: false, intro: false, droite: false });
  assert.deepStrictEqual(L.brLireEtat(null), L.brEtatInitial());
  assert.deepStrictEqual(L.brLireEtat('pas du json'), L.brEtatInitial());
  assert.deepStrictEqual(L.brLireEtat('{"gauche":"oui"}'), L.brEtatInitial());
});

test('replier / déplier un groupe change ce groupe seulement, et l\'état se relit à l\'identique', () => {
  const e1 = L.brBasculer(L.brEtatInitial(), 'droite');
  assert.deepStrictEqual(e1, { gauche: false, intro: false, droite: true });
  assert.deepStrictEqual(L.brLireEtat(L.brEcrireEtat(e1)), e1);
  assert.deepStrictEqual(L.brBasculer(e1, 'droite'), L.brEtatInitial());
  assert.deepStrictEqual(L.brBasculer(e1, 'inconnu'), e1);
  assert.deepStrictEqual(L.brEtatInitial(), { gauche: false, intro: false, droite: false }, 'l\'état de départ n\'est jamais modifié');
});

test('chaque bouton fixe appartient à un seul groupe, comme décidé', () => {
  assert.strictEqual(L.brGroupeDe('btnNouveautes'), 'gauche');
  assert.strictEqual(L.brGroupeDe('btnSessionTransfert'), 'gauche');
  assert.strictEqual(L.brGroupeDe('btnIntroduction'), 'intro');
  assert.strictEqual(L.brGroupeDe('btnCarnet'), 'droite');
  assert.strictEqual(L.brGroupeDe('btnJournalParcours'), 'droite');
  assert.strictEqual(L.brGroupeDe('btnComparerPanier'), 'droite');
  assert.strictEqual(L.brGroupeDe('btnAutre'), null);
});

test('textes des flèches en français simple', () => {
  assert.strictEqual(L.brLibelleFleche('gauche', false), 'Cacher les boutons du haut');
  assert.strictEqual(L.brLibelleFleche('gauche', true), 'Montrer les boutons du haut');
  assert.strictEqual(L.brLibelleFleche('intro', false), 'Cacher Introduction');
  assert.strictEqual(L.brLibelleFleche('droite', true), 'Montrer les boutons de droite');
});

test('seules les animations de clignotement sont relayées par la flèche', () => {
  assert.ok(L.brEstAnimationPulse('pulseAccentPersistant'));
  assert.ok(L.brEstAnimationPulse('carnetPulseConfirmation'));
  assert.ok(L.brEstAnimationPulse('reperesPulseJournal'));
  assert.ok(!L.brEstAnimationPulse('spin'));
  assert.ok(!L.brEstAnimationPulse(undefined));
});

test('Nouveautés : une rubrique regardée est retirée du total, le reste demeure', () => {
  assert.strictEqual(NV.nvNombreRestant(3, 'appli', { appli: true }), 0);
  assert.strictEqual(NV.nvNombreRestant(3, 'appli', { regles: true }), 3);
  assert.strictEqual(NV.nvNombreRestant(null, 'regles', { appli: true }), null);
  const vus = NV.nvLireVus('{"appli":true,"corriges":true}');
  const total = NV.nvTotalPastille(NV.nvNombreRestant(3, 'appli', vus), NV.nvNombreRestant(2, 'regles', vus), NV.nvNombreRestant(13, 'corriges', vus));
  assert.strictEqual(total, 2);
  const tout = NV.nvLireVus('{"appli":true,"regles":true,"corriges":true}');
  assert.strictEqual(NV.nvTotalPastille(NV.nvNombreRestant(3, 'appli', tout), NV.nvNombreRestant(2, 'regles', tout), NV.nvNombreRestant(13, 'corriges', tout)), 0, 'tout vu : plus de chiffre');
  assert.deepStrictEqual(NV.nvLireVus('n importe quoi'), { appli: false, regles: false, corriges: false });
});

test('index.html : les trois flèches existent, Introduction a la sienne juste après son bouton', () => {
  ['flecheBoutonsGauche', 'flecheIntroduction', 'flecheBoutonsDroite'].forEach((id) => assert.ok(new RegExp('id="' + id + '"[^>]*aria-expanded="true"').test(html), id));
  assert.ok(/id="btnIntroduction"[^>]*>[^<]*<i[^>]*><\/i> Introduction<\/button>\s*<button[^>]*id="flecheIntroduction"/.test(html), 'la flèche d\'Introduction suit son bouton (affichée seulement avec lui)');
  assert.ok(html.indexOf('modules/boutons-repliables/logique.js') !== -1 && html.indexOf('modules/boutons-repliables/index.js') !== -1);
  assert.ok(html.indexOf('boutons-repliables/index.js') < html.indexOf('<script src="js/app.js"'), 'chargé avant js/app.js');
});

test('feuille de style : par-dessus la page, jamais de décalage, mode sombre, clavier', () => {
  const bloc = css.slice(css.indexOf('Boutons repliables (15/11/2026'));
  assert.ok(bloc.length > 500);
  assert.ok(/\[data-theme="sombre"\] \.fleche-bouton/.test(bloc), 'mode sombre');
  assert.ok(/visibility: hidden/.test(bloc), 'un bouton rangé ne se prend pas au clavier');
  assert.ok(/translateX\(-320px\)/.test(bloc) && /translateX\(320px\)/.test(bloc), 'les boutons glissent derrière la flèche');
  assert.ok(/pulseAccentPersistant 1\.8s ease-in-out infinite/.test(bloc), 'la flèche relaie le clignotement');
  assert.ok(/#flecheBoutonsDroite \{ top: 165px; \}/.test(bloc), 'à la hauteur du Journal (161 + 26)');
  assert.ok(!/(^|[^-])(margin|padding)[^;]*;[^}]*repli-/.test(bloc), 'aucune marge ni aucun remplissage ne change au repli');
  assert.ok(/html \.fleche-bouton \{ font-size: calc\(1rem \* var\(--echelle-fixe\)\)/.test(css), 'taille compensée comme les autres boutons fixes');
});

test('le repli ne touche jamais à la place réservée par la barre des étapes (pas de décalage de page)', () => {
  const bloc = css.slice(css.indexOf('Boutons repliables (15/11/2026'));
  assert.ok(!/\.progression/.test(bloc.replace(/Téléphone[^\n]*\n/, '')), 'le bloc ne modifie pas .progression');
  assert.ok(!/body\.repli-[a-z]+[^{]*\{[^}]*(width|height|margin|padding|left|right|top)\s*:/.test(bloc.replace(/transition[^;]*;/g, '')), 'les classes de repli ne changent ni taille ni position, seulement l\'apparence');
});
