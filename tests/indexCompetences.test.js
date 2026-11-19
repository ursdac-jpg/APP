const { test } = require('node:test');
const assert = require('node:assert/strict');
const { construireIndex, lireFiches } = require('../scripts/importRome/genererIndexCompetences.js');
const { INDEX_COMPETENCES: INDEX } = require('../data/rome/indexCompetences.js');
const { phrases } = require('../data/competencesRome.js').COMPETENCES_ROME;

// Index complet des compétences (data/rome/indexCompetences.js) : calculé à partir des fiches complètes, jamais écrit à la main.
const fiches = lireFiches();
const codeDe = (s) => s.replace(/\+\d*$/, '');
const coeurDe = (s) => { const m = s.match(/\+(\d*)$/); return m ? (m[1] === '' ? 1 : Number(m[1])) : 0; };

test('l’index correspond exactement aux fiches : sinon relancer node scripts/importRome/genererIndexCompetences.js', () => {
  assert.deepEqual(INDEX, construireIndex(fiches, INDEX.of));
  const sansNom = require('../data/competencesRome.js').COMPETENCES_ROME.objectifs.filter((o) => !INDEX.of[o]);
  assert.deepEqual(sansNom, [], 'familles de savoir-faire sans nom');
});

test('les 489 macro-compétences sont toutes dans l’index et ne renvoient qu’à des métiers qui existent', () => {
  assert.equal(phrases.length, 489);
  assert.equal(Object.keys(INDEX.sf).length, 489);
  Object.keys(INDEX.sf).forEach((m) => {
    assert.ok(Number(m) >= 0 && Number(m) < 489, 'numéro de macro hors limites : ' + m);
    INDEX.sf[m].forEach((s) => {
      const f = fiches[codeDe(s)];
      assert.ok(f, 'code inconnu : ' + s);
      const g = f.k.find((x) => x[0] === Number(m));
      assert.ok(g, codeDe(s) + ' ne contient pas la macro ' + m);
      assert.equal(coeurDe(s), g[1], 'cœur de métier différent pour ' + s);
    });
  });
});

test('savoir-faire : le métier où la compétence compte le plus passe en premier (cœur de métier d’abord)', () => {
  Object.keys(INDEX.sf).forEach((m) => {
    const liste = INDEX.sf[m].map(coeurDe);
    for (let i = 1; i < liste.length; i++) { assert.ok(liste[i - 1] >= liste[i], 'mauvais classement pour la macro ' + m); }
  });
});

test('savoirs : seuls ceux qui figurent dans au moins deux métiers sont dans l’index, chaque lien est vrai', () => {
  assert.equal(INDEX.sv.length, 6413);
  const vus = new Set();
  INDEX.sv.forEach((e) => {
    assert.ok(!vus.has(e[0]), 'savoir en double : ' + e[0]); vus.add(e[0]);
    assert.ok(e[2].length >= 2, 'savoir sur un seul métier dans l’index : ' + e[0]);
    e[2].forEach((s) => {
      const f = fiches[codeDe(s)];
      assert.ok(f, 'code inconnu : ' + s);
      const g = f.s.find((x) => x[2].indexOf(e[0]) !== -1);
      assert.ok(g, codeDe(s) + ' ne contient pas le savoir « ' + e[0] + ' »');
      assert.equal(g[0], e[1]);
    });
  });
});

test('savoirs : aucun savoir d’un seul métier n’est cliquable (il n’est donc jamais dans l’index)', () => {
  const nb = {};
  Object.keys(fiches).forEach((c) => (fiches[c].s || []).forEach((g) => g[2].forEach((l) => { (nb[l] = nb[l] || new Set()).add(c); })));
  const seuls = Object.keys(nb).filter((l) => nb[l].size === 1);
  assert.equal(seuls.length, 7272);
  const dansIndex = new Set(INDEX.sv.map((e) => e[0]));
  assert.deepEqual(seuls.filter((l) => dansIndex.has(l)), []);
});

test('savoir-être officiels : 16 libellés, 5 au plus par métier, orthographe française, et l’index dit vrai', () => {
  assert.equal(Object.keys(INDEX.se).length, 16);
  Object.keys(fiches).forEach((c) => {
    const e = fiches[c].e || [];
    assert.ok(e.length <= 5, c + ' a plus de 5 savoir-être');
    e.forEach((l) => {
      assert.ok(!/'/.test(l), 'apostrophe droite dans « ' + l + ' »');
      assert.ok(!/^Etre\b/.test(l), '« Etre » sans accent : ' + l);
      assert.ok(!/[\u2013\u2014]/.test(l), 'tiret long dans « ' + l + ' »');
      assert.ok(INDEX.se[l] && INDEX.se[l].indexOf(c) !== -1, c + ' absent de l’index pour « ' + l + ' »');
    });
  });
  const avec = Object.keys(fiches).filter((c) => fiches[c].e && fiches[c].e.length).length;
  assert.ok(avec >= 1900, 'trop peu de fiches avec savoir-être : ' + avec);
});

test('les listes courtes de data/metiersRome.js ne sont pas touchées par l’enrichissement des fiches', () => {
  const { baseMetiers } = require('../data/metiers.js');
  const f = baseMetiers.find((m) => m.rome === 'F1104' && Array.isArray(m.savoirEtre));
  assert.ok(f, 'fiche courte F1104 introuvable');
  assert.ok(f.savoirEtre.length <= 4, 'les listes courtes restent plafonnées à 4');
});
