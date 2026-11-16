const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Blocs « écarts » (départements de la région, régions de France) : le code désigne LUI-MÊME les taux les plus bas
// et les plus hauts à partir de TOUS les territoires du fichier (chantier du 10/11/2026, décision de Denis :
// le site s'adapte aux données, plus aucune phrase de classement écrite à la main).
require('./_domStub').installerStubDom();

const {
  _comprendreLesChiffresParserZonesEmploi: parser,
  _comprendreLesChiffresChoisirEcarts: choisir,
  COMPRENDRE_LES_CHIFFRES_DEPARTEMENTS_SUIVIS: DEP_SUIVIS,
  COMPRENDRE_LES_CHIFFRES_REGIONS_SUIVIES: REG_SUIVIES
} = require('../modules/comprendre-les-chiffres/index.js');

const DOSSIER = path.resolve(__dirname, '..', 'modules', 'comprendre-les-chiffres', 'contenu');
const lire = (f) => parser(fs.readFileSync(path.join(DOSSIER, f), 'utf8').replace(/\r\n/g, '\n'));
const item = (nom, valeur, texte) => ({ nom: nom, valeur: valeur, stats: {}, sourcesCles: [], paragraphes: texte ? [texte] : [] });

test('écarts automatiques : le plus bas, le plus haut et les territoires suivis, dans cet ordre, avec une phrase calculée', () => {
  const r = choisir([item('A', '6,0 %', 'ta'), item('B', '8,0 %', 'tb'), item('C', '7,0 %', 'tc'), item('D', '7,5 %', 'td')], ['C'],
    { periode: '2e trimestre 2026', portee: 'de la région', unite: 'département' });
  assert.deepEqual(r.map((x) => x.nom), ['A', 'B', 'C']);
  assert.match(r[0].paragraphes[0], /le plus bas de la région au 2e trimestre 2026\.$/);
  assert.match(r[1].paragraphes[0], /le plus haut de la région/);
  assert.match(r[2].paragraphes[0], /1 point au-dessus du taux le plus bas et 1 point en dessous du plus haut/);
  assert.equal(r[0].paragraphes[1], 'ta', 'le texte du territoire suit la phrase calculée');
});

test('écarts automatiques : une égalité au plus bas montre les deux territoires, sans nommer l\'autre', () => {
  const r = choisir([item('A', '6,3 %'), item('B', '6,3 %'), item('C', '8,4 %'), item('D', '7,0 %')], [], { periode: 'p', unite: 'département' });
  assert.deepEqual(r.map((x) => x.nom), ['A', 'B', 'C']);
  assert.match(r[0].paragraphes[0], /à égalité avec un autre département présenté aussi ici/);
  assert.doesNotMatch(r[0].paragraphes[0], /\bB\b/);
});

test('écarts automatiques : l\'égalité s\'accorde au féminin pour les régions', () => {
  const r = choisir([item('A', '6,8 %'), item('B', '6,8 %'), item('C', '10,0 %')], [], { periode: 'p', portee: 'de France métropolitaine', unite: 'région', feminin: true });
  assert.match(r[0].paragraphes[0], /à égalité avec une autre région présentée aussi ici\.$/);
});

test('écarts automatiques : un territoire suivi qui est lui-même un extrême n\'apparaît qu\'une fois, avec la phrase de l\'extrême', () => {
  const r = choisir([item('A', '6,0 %'), item('B', '8,0 %'), item('C', '7,0 %')], ['B'], { periode: 'p' });
  assert.deepEqual(r.map((x) => x.nom), ['A', 'B']);
  assert.match(r[1].paragraphes[0], /le plus haut/);
});

test('écarts automatiques : sans deux taux lisibles, la liste est rendue telle quelle', () => {
  const l = [item('A', 'n.d.'), item('B', '7,0 %')];
  assert.equal(choisir(l, ['A'], {}), l);
  assert.deepEqual(choisir([], [], {}), []);
});

test('écarts automatiques : l\'écart en points s\'écrit à la française (un seul « point » sous 2)', () => {
  const r = choisir([item('A', '6,0 %'), item('B', '8,3 %'), item('C', '7,9 %')], ['C'], { periode: 'p' });
  assert.match(r[2].paragraphes[0], /1,9 point au-dessus du taux le plus bas et 0,4 point en dessous du plus haut/);
  const r2 = choisir([item('A', '6,0 %'), item('B', '9,0 %'), item('C', '8,0 %')], ['C'], { periode: 'p' });
  assert.match(r2[2].paragraphes[0], /2 points au-dessus du taux le plus bas et 1 point en dessous du plus haut/);
});

for (const [fichier, groupe, nb, suivis] of [['departements-region.md', 'na', 12, DEP_SUIVIS], ['regions-france.md', 'fr', 13, REG_SUIVIES]]) {
  test(fichier + ' : tous les territoires sont présents, leurs taux se lisent, et les territoires suivis existent', () => {
    const d = lire(fichier), liste = d.parDep[groupe];
    assert.equal(liste.length, nb, 'nombre de territoires');
    assert.equal(new Set(liste.map((z) => z.nom)).size, nb, 'aucun doublon');
    liste.forEach((z) => assert.match(z.valeur, /^\d+,\d %$/, z.nom + ' : taux'));
    suivis.forEach((s) => assert.ok(liste.some((z) => z.nom === s), 'territoire suivi absent : ' + s));
    assert.equal(d.periode, '2e trimestre 2026');
  });

  test(fichier + ' : le texte des territoires que le code va MONTRER existe (sinon il faut le rédiger avant de publier les nouveaux taux)', () => {
    const d = lire(fichier);
    const choisis = choisir(d.parDep[groupe], suivis, { periode: d.periode });
    assert.ok(choisis.length >= 3, 'au moins deux extrêmes et un territoire suivi');
    choisis.forEach((z) => {
      assert.ok(z.paragraphes.length >= 2, z.nom + ' est un extrême ou un territoire suivi : il lui faut un texte (et ses chiffres de population et de diplômes)');
      ['part_65_et_plus', 'part_sans_diplome', 'part_diplome_superieur'].forEach((c) => assert.ok(z.stats && z.stats[c], z.nom + ' : ' + c));
    });
  });

  test(fichier + ' : aucun texte ne porte de classement ni ne compare deux territoires nommés (le classement est calculé par le code)', () => {
    const d = lire(fichier), noms = d.parDep[groupe].map((z) => z.nom);
    d.parDep[groupe].forEach((z) => {
      const texte = z.paragraphes.join(' ');
      assert.doesNotMatch(texte, /le plus (haut|bas)|la plus (haute|basse)|les plus (hauts|bas)|extrêmes?|entre ces deux|plus proche d/i, z.nom + ' : phrase de classement écrite à la main');
      noms.filter((n) => n !== z.nom && z.nom.indexOf(n) === -1).forEach((n) => {
        // un nom peut apparaître comme lieu (Niort, Cognac...), jamais comme autre territoire comparé
        assert.ok(texte.indexOf(n) === -1, z.nom + ' cite un autre territoire : ' + n);
      });
    });
  });
}

test('écarts automatiques : avec les taux du 2e trimestre 2026, le bloc montre Deux-Sèvres et la Corrèze (égalité), la Charente, la Dordogne et la Haute-Vienne', () => {
  const d = lire('departements-region.md');
  const r = choisir(d.parDep.na, DEP_SUIVIS, { periode: d.periode, portee: 'de la région', unite: 'département' });
  assert.deepEqual(r.map((x) => x.nom).sort(), ['Charente', 'Corrèze', 'Deux-Sèvres', 'Dordogne', 'Haute-Vienne']);
  const dr = lire('regions-france.md');
  const rr = choisir(dr.parDep.fr, REG_SUIVIES, { periode: dr.periode });
  assert.deepEqual(rr.map((x) => x.nom).sort(), ['Bretagne', 'Hauts-de-France', 'Nouvelle-Aquitaine', 'Pays de la Loire']);
});
