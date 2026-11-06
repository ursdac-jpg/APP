// Source unique du Smic et de l'inflation (modules/comprendre-les-chiffres/donnees/smic-inflation.json, consigne 117).
// Rien d'autre ne doit recopier un montant du Smic qui ne soit pas dans ce fichier.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const RACINE = path.join(__dirname, '..');
const SOURCE = JSON.parse(fs.readFileSync(path.join(RACINE, 'modules/comprendre-les-chiffres/donnees/smic-inflation.json'), 'utf8'));
const S = SOURCE.smic;
const arrondi = (x) => Math.round(x * 100) / 100;
const fr = (n) => n.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

test('Smic : les montants mensuels sont cohérents avec les montants horaires (35 h par semaine, 151,67 h par mois)', () => {
  assert.strictEqual(arrondi(S.en_vigueur.horaire_brut * 35 * 52 / 12), S.en_vigueur.mensuel_brut_35h);
  assert.strictEqual(arrondi(S.precedent.horaire_brut * 35 * 52 / 12), S.precedent.mensuel_brut_35h);
});

test('Smic : le pourcentage de la dernière revalorisation correspond aux deux montants horaires', () => {
  assert.strictEqual(arrondi((S.en_vigueur.horaire_brut / S.precedent.horaire_brut - 1) * 100), S.en_vigueur.pourcentage);
});

test('Smic : dates lisibles, décision avant ou le jour de l\'effet, aucune date d\'effet future', () => {
  ['effet', 'annonce', 'decision'].forEach((k) => assert.match(S.en_vigueur[k], /^\d{4}-\d{2}-\d{2}$/, k));
  assert.match(S.precedent.effet, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(S.en_vigueur.decision <= S.en_vigueur.effet);
  assert.ok(S.precedent.effet < S.en_vigueur.effet);
  assert.ok(S.en_vigueur.effet <= SOURCE.verifie_le, 'la date d\'effet ne peut pas dépasser la date de vérification');
});

test('Règles qui gardent le Smic du 1er janvier : les montants cités se déduisent du Smic du 1er janvier', () => {
  const texte = S.regles_qui_gardent_la_valeur_du_1er_janvier.join(' ');
  assert.ok(texte.indexOf(fr(arrondi(S.precedent.horaire_brut * 1820 * 1.6 / 12))) !== -1, 'plafond du cumul (160 %)');
  assert.ok(texte.indexOf(fr(arrondi(S.precedent.horaire_brut * 1820 / 3))) !== -1, 'tiers du Smic annuel');
  assert.ok(texte.indexOf(fr(S.precedent.mensuel_brut_35h)) !== -1, 'Smic mensuel du 1er janvier');
});

test('Inflation : valeurs plausibles, mois lisibles, prochaine publication après la dernière', () => {
  const I = SOURCE.inflation;
  assert.match(I.dernier.mois, /^\d{4}-\d{2}$/); assert.match(I.precedent.mois, /^\d{4}-\d{2}$/);
  assert.ok(I.precedent.mois < I.dernier.mois);
  [I.dernier.sur_un_an, I.dernier.sur_un_mois, I.precedent.sur_un_an].forEach((v) => assert.ok(typeof v === 'number' && Math.abs(v) < 30));
  assert.ok(I.prochaine_publication > I.dernier.publie_le);
  assert.ok(I.sources.every((s) => /^https:\/\//.test(s.url)));
  assert.ok(S.sources.every((s) => /^https:\/\//.test(s.url)));
});

test('Aucun texte du Lexique ni des fiches ne cite un montant mensuel du Smic absent de la source', () => {
  const connus = [fr(S.en_vigueur.mensuel_brut_35h), fr(S.precedent.mensuel_brut_35h)];
  const fichiers = ['data/lexique.js', 'data/lexique-renvois-cadre.js'];
  const base = path.join(RACINE, 'modules/comprendre-le-cadre/contenu');
  fs.readdirSync(base).forEach((rayon) => {
    const d = path.join(base, rayon);
    if (fs.statSync(d).isDirectory()) { fs.readdirSync(d).filter((f) => /\.md$/.test(f)).forEach((f) => fichiers.push(path.relative(RACINE, path.join(d, f)))); }
  });
  const trouves = [];
  fichiers.forEach((f) => {
    const t = fs.readFileSync(path.join(RACINE, f), 'utf8').replace(/[  ]/g, ' ');
    (t.match(/\b1 [89]\d\d,\d\d\b/g) || []).forEach((m) => { if (connus.indexOf(m) === -1) { trouves.push(f + ' : ' + m); } });
  });
  assert.deepStrictEqual(trouves, [], 'montant du Smic absent de modules/comprendre-les-chiffres/donnees/smic-inflation.json (à corriger ou à ajouter à la source)');
});
