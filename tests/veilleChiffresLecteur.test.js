'use strict';
// Relecture par le lecteur de l'APPLICATION : ce que l'outil de veille écrit est bien ce que l'application comprend.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const C = require('../outils/veilleChiffres.js');
require('./_domStub').installerStubDom();
const App = require('../modules/comprendre-les-chiffres/index.js');

const DOSSIER = path.resolve(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const lire = (f) => fs.readFileSync(path.join(DOSSIER, f), 'utf8').replace(/\r\n/g, '\n');

test('lecteur de l\'application : une entrée modifiée par l\'outil est relue avec ses nouvelles valeurs, et toutes les autres entrées sont relues à l\'identique', () => {
  const t = lire('2026-06.md');
  const g = C.lireDigest(t);
  const cible = g.entrees.filter((e) => e.entree && e.entree.serie.length >= 5 && e.entree.precedent && e.entree.repere)[0];
  assert.ok(cible, 'une entrée avec série et précédent existe');
  const e = cible.entree, serie = e.serie.map((x) => ({ p: x.p, v: x.v }));
  serie[serie.length - 1].v = '9,9 %';
  const r = C.modifierDigest(t, { ref: cible.ref, changes: { valeur: '9,9 %', serie: serie, repere: 'Phrase de lecture refaite pour l\'essai.' }, confirmeSource: true }, { aujourdhui: '2026-10-18' });
  assert.ok(r.ok, r.erreur);
  const avant = App._comprendreLesChiffresParserDigest(t), apres = App._comprendreLesChiffresParserDigest(r.texte);
  assert.ok(avant && apres);
  let trouvee = 0;
  Object.keys(avant.sections).forEach((sec) => {
    assert.strictEqual(apres.sections[sec].length, avant.sections[sec].length, sec + ' : nombre d\'entrées');
    avant.sections[sec].forEach((x, i) => {
      const y = apres.sections[sec][i];
      if (x.labelBrut === e.label && x.valeur === e.valeur && x.serie.length === e.serie.length && x.precedent === e.precedent) {
        trouvee++;
        assert.strictEqual(y.valeur, '9,9 %');
        assert.strictEqual(y.serie[y.serie.length - 1].v, 9.9);
        assert.strictEqual(y.repere, 'Phrase de lecture refaite pour l\'essai.');
        assert.strictEqual(y.sourceUrl, x.sourceUrl);
        assert.strictEqual(y.precedent, x.precedent);
      } else { assert.deepStrictEqual(y, x, sec + ' : une autre entrée a changé'); }
    });
  });
  assert.strictEqual(trouvee, 1, 'l\'entrée modifiée est retrouvée une seule fois');
});

test('lecteur de l\'application : un lieu modifié par l\'outil est relu avec ses nouvelles valeurs (zones d\'emploi)', () => {
  const t = lire('zones-emploi.md');
  const bloc = C.lireTerritoire(t).blocs[0];
  const r = C.modifierTerritoire(t, { lieu: bloc.nom, groupe: bloc.groupe, champs: { valeur: '9,9 %' }, prose: 'Paragraphe refait pour l\'essai.', confirmeSource: true }, { aujourdhui: '2026-10-18' });
  assert.ok(r.ok, r.erreur);
  const avant = App._comprendreLesChiffresParserZonesEmploi(t), apres = App._comprendreLesChiffresParserZonesEmploi(r.texte);
  assert.ok(avant && apres);
  assert.ok(JSON.stringify(apres).indexOf('9,9 %') !== -1, 'la nouvelle valeur est relue');
  assert.ok(JSON.stringify(apres).indexOf('Paragraphe refait pour l\'essai.') !== -1, 'le nouveau paragraphe est relu');
  assert.strictEqual(JSON.stringify(avant).indexOf('9,9 %'), -1);
});
