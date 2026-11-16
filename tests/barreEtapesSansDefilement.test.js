const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 331 (Denis, 15/11/2026, présentation 1) : la barre des étapes se resserre toute seule, jamais de barre de défilement.
const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');
const fonction = app.slice(app.indexOf('function barreEtapesModule('), app.indexOf('// Bouton "Revoir la presentation" / note 1re fois'));

test('la barre est dans un cadre qui mesure la place, avec la ligne « Étape x sur y » pour téléphone', () => {
  assert.ok(fonction.includes('<div class="barre-etapes-cadre"><div class="barre-etapes-bilan'));
  assert.ok(fonction.includes("'</div>' + phraseEtapeTel + '</div>'"));
  assert.ok(fonction.includes("'<p class=\"barre-etapes-tel\">Étape ' + (idx + 1) + ' sur ' + etapes.length + ' : ' + etapes[idx].label"));
});

test('plus de défilement dans la barre', () => {
  const bloc = css.slice(css.indexOf('.barre-etapes-cadre {'), css.indexOf('.barre-etapes-bilan .pastille-etape-action { padding: 0.3rem 0.7rem'));
  assert.ok(bloc.includes('container-type: inline-size'));
  assert.ok(bloc.includes('overflow: hidden') && !bloc.includes('overflow-x: auto'));
});

test('niveaux de resserrement en rem (ils suivent « Texte plus grand »), texte jamais sous 0,875 rem', () => {
  const niveaux = css.match(/@container \(max-width: \d+rem\)/g) || [];
  assert.deepEqual(niveaux, ['@container (max-width: 84rem)', '@container (max-width: 75rem)', '@container (max-width: 45rem)', '@container (max-width: 26rem)', '@container (max-width: 18rem)']);
  const zone = css.slice(css.indexOf('@container (max-width: 84rem)'), css.indexOf('@container (max-width: 18rem)'));
  assert.ok(!/font-size: 0\.8rem/.test(zone) && !/font-size: 0\.75rem/.test(zone));
});

test('aucun tiret long dans ce qui a été écrit', () => {
  const zone = fonction + css.slice(css.indexOf('.barre-etapes-cadre {'), css.indexOf('.barre-etapes-cadre {') + 800);
  assert.ok(!zone.includes(String.fromCharCode(0x2013)) && !zone.includes(String.fromCharCode(0x2014)));
});
