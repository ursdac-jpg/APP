'use strict';
// Les scripts de l'application sont classiques : tous les noms écrits en début de ligne (function X, var X) sont des noms GLOBAUX partagés par tous les fichiers de index.html.
// Deux fichiers qui déclarent le même nom s'écrasent l'un l'autre sans erreur au chargement (trouvé le 25/11/2026 : « _buiaP » de papierLogique.js écrasé par une fonction de
// modelesUi.js, les chemins « Modèles » et « Écrire » de « Bien utiliser l'IA » plantaient). Les tests Node ne chargent pas ces fichiers ensemble : ce garde-fou lit index.html.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
// Collisions connues, jamais corrigées à chaud (effet à vérifier au navigateur avant d'y toucher) : nom -> raison.
const CONNUES = {
  MOTS_VIDES_RECHERCHE_ERIP: 'data/baseConnaissancesERIP.js et data/extractionConceptsERIP.js : deux listes, la seconde gagne',
  _mepRerendre: 'function de cvPdfCartesMaquette.js remplacée par la variable de js/app.js, qui reçoit le « rerendre » du panneau à son ouverture'
};

test('aucun nom global n\u2019est déclaré dans deux fichiers chargés par index.html (hors collisions connues)', () => {
  const html = fs.readFileSync(path.join(racine, 'index.html'), 'utf8');
  const fichiers = [...html.matchAll(/<script src="([^"?]+)"/g)].map((m) => m[1]).filter((f) => fs.existsSync(path.join(racine, f)) && !/^vendor\//.test(f));
  assert.ok(fichiers.length > 100, 'index.html lu');
  const decl = {};
  fichiers.forEach((f) => {
    const t = fs.readFileSync(path.join(racine, f), 'utf8').replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
    t.split('\n').forEach((l) => {
      const m = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(l) || /^(?:var|let|const)\s+([A-Za-z_$][\w$]*)\s*(?:=|;)/.exec(l);
      if (m) { (decl[m[1]] = decl[m[1]] || new Set()).add(f); }
    });
  });
  const collisions = Object.keys(decl).filter((k) => decl[k].size > 1 && !CONNUES[k]);
  assert.deepStrictEqual(collisions.map((k) => k + ' : ' + [...decl[k]].join(' et ')), [], 'noms déclarés dans plusieurs fichiers');
});
