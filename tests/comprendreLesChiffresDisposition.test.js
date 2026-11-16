const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Disposition des cartes sur écran d'ordinateur (maquette validée par Denis le 10/11/2026, consignes 236 et 237) :
// trimestres rangés par année, six tuiles du chômage (jamais l'autre département suivi), texte de l'inflation calculé.
// Chaque chiffre nouveau garde sa source au survol (consigne 237).
require('./_domStub').installerStubDom();

const M = require('../modules/comprendre-les-chiffres/index.js');
const DOSSIER = path.join(__dirname, '../modules/comprendre-les-chiffres');
const DIGEST = M._comprendreLesChiffresParserDigest(fs.readFileSync(path.join(DOSSIER, 'contenu/2026-06.md'), 'utf8'));
const INFLATION = JSON.parse(fs.readFileSync(path.join(DOSSIER, 'donnees/smic-inflation.json'), 'utf8')).inflation;
const clone = (o) => JSON.parse(JSON.stringify(o));
const sansSource = (h) => (h.match(/<span class="chiffre"(?! data-source=")/g) || []).length;

function tuiles(departement, niveau) {
  global.departementRessourcesMemorise = () => departement;
  M._comprendreLesChiffresEtat.niveau = niveau;
  const carte = M.COMPRENDRE_LES_CHIFFRES_CARTES.find((c) => c.slug === 'chomage');
  const entrees = DIGEST.sections.chomage;
  const choisir = (code, metro) => {
    let t = null;
    if (code === 'fr' && metro) { entrees.forEach((x) => { if (x.terr === 'fr' && /m[eé]tropolitaine/i.test(x.labelBrut) && !t) { t = x; } }); }
    entrees.forEach((x) => { if (x.terr === code && !t) { t = x; } });
    return t;
  };
  const e = choisir(niveau === 'na' ? 'na' : departement, false);
  const d = M._comprendreLesChiffresVuesDonnees(carte, e, entrees, choisir);
  return d.groupes.find((g) => g.territoires);
}

test('digest : la zone euro est reconnue comme un territoire à part, avec sa source Eurostat et sa série', () => {
  assert.equal(M._comprendreLesChiffresClasserTerritoire('Zone euro'), 'ze');
  assert.equal(M._comprendreLesChiffresClasserTerritoire('Union européenne (UE-27)'), 'ue');
  assert.equal(M._comprendreLesChiffresClasserTerritoire('France entière (hors Mayotte)'), 'fr');
  const ze = DIGEST.sections.chomage.find((x) => x.terr === 'ze');
  assert.ok(ze, 'ligne zone euro dans le digest');
  assert.equal(ze.valeur, '6,4 %');
  assert.match(ze.sourceNom, /Eurostat/);
  assert.equal(ze.serieAnnuelle.length, 7);
  assert.equal(DIGEST.sections.chomage.find((x) => x.terr === 'ue').valeur, '6,0 %');
});

test('chômage : six tuiles pour un département (le territoire, la région, la France métropolitaine, la France entière, l\'Union européenne, la zone euro)', () => {
  const g = tuiles('24', 'dep');
  assert.deepEqual(g.lignes.map((l) => l.nom), ['Dordogne (24)', 'Nouvelle-Aquitaine', 'France métropolitaine', 'France entière', 'Union européenne', 'Zone euro']);
  assert.deepEqual(g.lignes.map((l) => l.texte), ['7,9 %', '7,5 %', '8,1 %', '8,2 %', '6,0 %', '6,4 %']);
  assert.deepEqual(g.lignes.map((l) => l.periode), ['2e trimestre 2026', '2e trimestre 2026', '2e trimestre 2026', '3e trimestre 2026 (le plus récent)', 'moyenne de l’année 2025', 'moyenne de l’année 2025']);
  assert.equal(g.lignes.filter((l) => l.recent).length, 1);
  g.lignes.forEach((l) => assert.ok(l.source, 'source de ' + l.nom));
});

test('chômage : jamais l\'autre département suivi dans les chiffres d\'un département (pas de comparaison Dordogne / Haute-Vienne)', () => {
  const dordogne = tuiles('24', 'dep').lignes.map((l) => l.nom).join(' | ');
  assert.ok(!/Haute-Vienne/.test(dordogne));
  const hv = tuiles('87', 'dep').lignes.map((l) => l.nom).join(' | ');
  assert.ok(/Haute-Vienne \(87\)/.test(hv));
  assert.ok(!/Dordogne/.test(hv));
});

test('chômage : le chiffre national plus récent, l\'Union européenne et la zone euro n\'entrent pas dans les barres (autre période)', () => {
  const g = tuiles('24', 'dep');
  assert.equal(g.lignes.filter((l) => l.horsBarres).length, 3);
  const html = M._comprendreLesChiffresVuesAssembler('t', '<p></p>', [g], null);
  const i = html.indexOf('data-comprendre-les-chiffres-panneau="barres"');
  assert.ok(i > -1, 'panneau des barres');
  const panneau = html.slice(i);
  assert.equal((panneau.match(/comprendre-les-chiffres-zone-ligne/g) || []).length, 3, 'trois barres : territoire, région, France métropolitaine');
  const noms = (panneau.match(/comprendre-les-chiffres-zone-nom">([^<]*)</g) || []).map((x) => x.replace(/^.*">/, '').replace('<', ''));
  assert.deepEqual(noms, ['Dordogne (24)', 'Nouvelle-Aquitaine', 'France métropolitaine']);
});

test('chômage : au niveau région, les cinq tuiles de la région, de la France et de l\'Europe', () => {
  const g = tuiles('24', 'na');
  assert.deepEqual(g.lignes.map((l) => l.nom).slice(0, 2), ['Nouvelle-Aquitaine', 'France métropolitaine']);
  assert.ok(!g.lignes.some((l) => /Dordogne|Haute-Vienne/.test(l.nom)));
});

test('tuiles : le trimestre est écrit sur chaque tuile, les chiffres gardent leur source au survol', () => {
  const g = tuiles('24', 'dep');
  const h = M._comprendreLesChiffresVuesLignesHTML([g]);
  assert.equal((h.match(/comprendre-les-chiffres-ligne-periode/g) || []).length, 6);
  assert.ok(h.includes('comprendre-les-chiffres-lignes--tuiles'));
  assert.equal(sansSource(h), 0);
  assert.ok(h.includes('Eurostat'));
  assert.ok(!new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(h));
});

test('trimestres par année : une ligne par année, le dernier en plein, le même trimestre un an avant entouré, les trimestres inconnus vides', () => {
  const lignes = [['T3 2024', '45,5 %'], ['T4 2024', '45,3 %'], ['T1 2025', '43,6 %'], ['T2 2025', '44,8 %'], ['T3 2025', '44,7 %'], ['T4 2025', '45,5 %'],
    ['T1 2026', '46,9 %'], ['T2 2026', '47,4 %'], ['T3 2026', '48,1 %']].map((p, i) => ({ nom: p[0], texte: p[1], n: i, source: 'Dares - ' + p[0] }));
  const h = M._comprendreLesChiffresMatriceTrimestresHTML({ lignes });
  assert.equal((h.match(/<tr><th scope="row">/g) || []).length, 3);
  assert.ok(h.indexOf('>2024<') < h.indexOf('>2025<') && h.indexOf('>2025<') < h.indexOf('>2026<'));
  assert.equal((h.match(/<td class="dernier">/g) || []).length, 1);
  assert.ok(/<td class="dernier">[^<]*<span class="chiffre"[^>]*>48,1 %/.test(h));
  assert.ok(/<td class="an-avant">[^<]*<span class="chiffre"[^>]*>44,7 %/.test(h));
  assert.equal((h.match(/<td class="vide">/g) || []).length, 3, 'T1 et T2 2024, T4 2026');
  assert.equal(sansSource(h), 0);
  assert.ok(h.includes('même trimestre un an avant'));
});

test('trimestres par année : une étiquette qui n\'est pas « T3 2025 » ne produit aucun tableau (jamais une place devinée)', () => {
  assert.equal(M._comprendreLesChiffresMatriceTrimestresHTML({ lignes: [{ nom: 'Octobre', texte: '1', n: 1 }, { nom: 'T1 2025', texte: '2', n: 2 }] }), '');
  assert.equal(M._comprendreLesChiffresMatriceTrimestresHTML({ lignes: [{ nom: 'T1 2025', texte: '2', n: 2 }] }), '');
});

test('trimestres par année : la carte longue durée garde la liste (téléphone) ET le tableau (écran large), sans la case d\'un an avant si elle manque', () => {
  global.departementRessourcesMemorise = () => '24';
  const carte = M.COMPRENDRE_LES_CHIFFRES_CARTES.find((c) => c.slug === 'longue-duree');
  const entrees = DIGEST.sections['longue-duree'];
  const e = entrees.find((x) => x.terr === '24');
  const d = M._comprendreLesChiffresVuesDonnees(carte, e, entrees, (code) => entrees.find((x) => x.terr === code));
  const g = d.groupes.find((x) => x.matrice);
  assert.ok(g, 'groupe des trimestres');
  const h = M._comprendreLesChiffresVuesLignesHTML([g]);
  assert.ok(h.includes('comprendre-les-chiffres-vues-groupe--trimestres'));
  assert.ok(h.includes('comprendre-les-chiffres-ligne'), 'la liste reste');
  assert.ok(h.includes('comprendre-les-chiffres-matrice'), 'le tableau est là');
  assert.match(g.lignes[0].source, /ancienneté d'inscription.* - 3e trimestre 2024$/, 'chaque case porte son propre trimestre');
  assert.match(g.lignes[2].source, / - 1er trimestre 2025$/);
  const court = { lignes: g.lignes.slice(-3) };
  assert.ok(!M._comprendreLesChiffresMatriceTrimestresHTML(court).includes('an-avant'));
});

test('inflation : le texte « Ce que cela veut dire » est calculé, sourcé chiffre par chiffre, et suit les données', () => {
  const h = M._comprendreLesChiffresInflationLecture(INFLATION);
  assert.ok(h.includes('Ce que cela veut dire, concrètement'));
  assert.match(h, /103,40 €/);
  assert.match(h, /Ce qui monte le plus vite :<\/b> l’énergie \(<span class="chiffre"[^>]*>24,1 %<\/span>\), les produits frais/);
  assert.match(h, /Ce qui monte le moins vite/);
  assert.match(h, /les produits manufacturés \(<span class="chiffre"[^>]*>-0,2 %<\/span>, les prix baissent\)/);
  assert.match(h, /Depuis septembre :<\/b> le rythme s’accélère pour l’énergie, les services et les produits manufacturés ; il ralentit pour l’alimentation \(dont les produits frais et l’autre alimentation\)/);
  assert.match(h, /Sur un seul mois :<\/b> en octobre, les prix ont monté de <span class="chiffre"[^>]*>0,4 %<\/span> \(septembre : <span class="chiffre"[^>]*>-0,3 %/);
  assert.match(h, /3,8 %/);
  assert.equal(sansSource(h), 0);
  assert.ok((h.match(/<span class="chiffre"/g) || []).length >= 9);
  assert.ok(!new RegExp('[' + String.fromCharCode(0x2013, 0x2014) + ']').test(h));
});

test('inflation : une donnée qui manque n\'écrit pas la phrase correspondante, un mois de baisse change le verbe', () => {
  const x = clone(INFLATION);
  delete x.dernier.harmonise_sur_un_an;
  delete x.dernier.sur_un_mois;
  const h = M._comprendreLesChiffresInflationLecture(x);
  assert.ok(!h.includes('Union européenne') && !h.includes('seul mois'));
  const y = clone(INFLATION);
  y.dernier.sur_un_mois = -0.2;
  assert.match(M._comprendreLesChiffresInflationLecture(y), /ont baissé de <span class="chiffre"[^>]*>0,2 %/);
  const z = clone(INFLATION);
  z.dernier.sur_un_an = -0.4;
  assert.match(M._comprendreLesChiffresInflationLecture(z), /99,60 €/);
  assert.equal(M._comprendreLesChiffresInflationLecture({ dernier: {} }), '');
});

test('où se situe : un titre au-dessus de chaque barre, celui du département choisi puis celui de la Nouvelle-Aquitaine', () => {
  const oss = DIGEST.ouSeSituer;
  const titres = (dep) => {
    global.departementRessourcesMemorise = () => dep;
    M._comprendreLesChiffresEtat.niveau = 'dep';
    const h = M._comprendreLesChiffresRenduOuSeSituer(oss, { valeur: '7,9 %' }, { valeur: '7,5 %' });
    return (h.match(/oss-tete">([^<]*)</g) || []).map((x) => x.replace(/^.*">/, '').replace('<', ''));
  };
  assert.deepEqual(titres('24'), ['Où se situe la Dordogne', 'Où se situe la Nouvelle-Aquitaine']);
  assert.deepEqual(titres('87'), ['Où se situe la Haute-Vienne', 'Où se situe la Nouvelle-Aquitaine']);
});
