// Garde-fous du banc d'essai du moteur de « Explorer les métiers » (consigne 491, 19/11/2026).
// Le banc complet (scripts/bancEssaiMoteur.js, une quinzaine de secondes) se lance à la main ; ici, seulement les mesures rapides.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const B = require('../scripts/bancEssaiMoteur.js');

test('profils types : au moins 7 des 10 premiers métiers dans un secteur attendu, en moyenne (mesure de départ : 0,84 sur les 5 premiers)', () => {
  const m = B.mesurerPersonas();
  assert.equal(m.lignes.length, B.PERSONAS.length);
  assert.ok(m.coherence5Moyenne >= 0.75, 'cohérence des 5 premiers : ' + m.coherence5Moyenne);
  assert.ok(m.coherence10Moyenne >= 0.7, 'cohérence des 10 premiers : ' + m.coherence10Moyenne);
  m.lignes.forEach((l) => assert.ok(l.meilleurScore <= 100 && l.nbMetiers > 0, l.titre));
});

test('stabilité : même profil, même résultat ; un choix général ajouté garde la majorité des dix premiers ; deux profils opposés ne partagent rien', () => {
  const s = B.mesurerStabilite();
  assert.equal(s.deterministe, true);
  assert.ok(s.recouvrementAjoutGeneral >= 0.7, 'recouvrement : ' + s.recouvrementAjoutGeneral);
  assert.equal(s.recouvrementOpposes, 0);
});

test('chemin 3 : les dix premiers métiers de chaque code n’ont que des lettres du code ; les égalités en tête restent mesurées', () => {
  const c = B.mesurerChemin3();
  assert.equal(c.lignes.length, B.CODES_RIASEC.length);
  assert.ok(c.coherence10Moyenne >= 0.95);
  c.lignes.forEach((l) => assert.ok(l.nbMetiers > 0 && l.egalitesEnTete >= 1, l.code));
});

test('la mesure de départ et la feuille du jury sont rangées dans docs/bancEssai', () => {
  const depart = JSON.parse(fs.readFileSync(path.join(B.DOSSIER, 'mesure_depart.json'), 'utf8'));
  assert.equal(depart.version, 1);
  assert.ok(depart.agregats.c2_unChoix_scoreMax <= 25, 'un seul choix : au plus 25 % (consigne 488)');
  const feuille = fs.readFileSync(path.join(B.DOSSIER, 'feuille_jury.html'), 'utf8');
  assert.match(feuille, /Pertinent/);
  assert.match(feuille, /Absurde/);
  assert.ok(!/[—–]/.test(feuille), 'aucun tiret long');
});
