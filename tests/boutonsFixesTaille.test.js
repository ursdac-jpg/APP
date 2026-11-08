'use strict';
// Les boutons persistants (icônes rondes du haut, Introduction, Carnet, Journal, panier, retour) gardent la taille de l'accueil
// quand le palier d'écran agrandit le contenu d'un module (décision Denis, 08/11/2026).
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

test('la variable --echelle-fixe annule le palier d\'écran', () => {
  assert.match(css, /--echelle-fixe:\s*calc\(var\(--palier-barre, 1\) \/ var\(--palier-taille, 1\)\)/);
});

test('chaque bouton persistant est compensé par --echelle-fixe', () => {
  const ids = ['btnPreferencesAffichage', 'btnAide', 'btnSessionTransfert', 'btnNouveautes', 'btnCarnet', 'btnJournalParcours', 'btnComparerPanier', 'btnIntroduction', 'btnRetourModuleExterne'];
  const bloc = css.slice(css.indexOf('--echelle-fixe:'));
  const regles = bloc.split('}').filter((r) => r.indexOf('{') !== -1);
  ids.forEach((id) => {
    const ok = regles.some((r) => {
      const morceaux = r.split('{');
      const corps = morceaux[morceaux.length - 1];
      const selecteurs = morceaux[morceaux.length - 2];
      return selecteurs.split(',').some((sel) => sel.trim() === 'html #' + id) && corps.indexOf('var(--echelle-fixe)') !== -1;
    });
    assert.ok(ok, id + ' doit être compensé');
  });
});
