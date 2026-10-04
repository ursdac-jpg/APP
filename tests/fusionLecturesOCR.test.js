/* Fusion de deux lectures OCR (2026-09-29) : la colonne laterale foncee d'un CV
   image (competences, langues, certifications, centres d'interet) n'est vue que
   par la seconde lecture. Textes d'essai fictifs, construits sur le schema reel
   observe (deux colonnes melangees ligne a ligne par la lecture noir et blanc). */
const test = require('node:test');
const assert = require('node:assert/strict');
const { fusionnerLecturesOCR } = require('../data/metiers.js');

const STANDARD = [
  'MARIE EXEMPLE',
  'Titulaire du titre professionnel Assistante de vie, je souhaite accompagner',
  'des personnes âgées et dépendantes. Mon stage au centre communal',
  'm\'a permis de pratiquer l\'aide à la toilette et l\'habillage.',
  'Stage',
  '2026',
  'Aide Cuisine - serveuse',
  '2021 - 2022'
].join('\n');

const SEUIL = [
  'Compétences Ville, 00000',
  'comportementales',
  'Créativité',
  'Rigueur Lu ; ;',
  'Gestion du temps personnes âgées et dépendantes. Mon stage au centre communal',
  'Écoute permis de pratiquer l\'aide à la toilette et l\'habillage.',
  'Langues',
  'Anglais - A2',
  'Certifications',
  'ssT',
  'Centres d\'intérêt',
  'Danse',
  'Musique',
  'Stage',
  'Cuisine',
  '2026'
].join('\n');

test('fusionnerLecturesOCR : retrouve rubriques et éléments de la colonne latérale', () => {
  const r = fusionnerLecturesOCR(STANDARD, SEUIL);
  ['Langues', 'Certifications', 'Créativité', 'Rigueur', 'Danse', 'Musique', 'Cuisine', 'Écoute'].forEach((m) => {
    assert.ok(r.ajouts.some((a) => a.indexOf(m) !== -1), 'manque : ' + m);
  });
  assert.ok(r.ajouts.some((a) => /anglais/i.test(a) && /a2/i.test(a)), 'Anglais A2');
  assert.ok(r.ajouts.some((a) => /sst/i.test(a)), 'SST');
  assert.ok(r.ajouts.some((a) => /gestion du temps/i.test(a)), 'Gestion du temps');
});

test('fusionnerLecturesOCR : le texte standard est conservé intégralement, le bloc ajouté est annoncé', () => {
  const r = fusionnerLecturesOCR(STANDARD, SEUIL);
  assert.ok(r.texte.startsWith(STANDARD));
  assert.match(r.texte, /Lecture complémentaire du document/);
});

test('fusionnerLecturesOCR : ne recopie pas ce que la première lecture a déjà', () => {
  const r = fusionnerLecturesOCR(STANDARD, SEUIL);
  assert.ok(!r.ajouts.some((a) => /^Stage$/.test(a)), 'ligne déjà lue');
  assert.ok(!r.ajouts.some((a) => /^2026$/.test(a)), 'ligne déjà lue');
  assert.ok(!r.ajouts.some((a) => /personnes âgées|habillage|toilette/i.test(a)), 'texte de la colonne principale recopié');
});

test('fusionnerLecturesOCR : rien de plus dans la seconde lecture => texte inchangé ; entrées vides sans erreur', () => {
  assert.equal(fusionnerLecturesOCR(STANDARD, STANDARD).texte, STANDARD);
  assert.equal(fusionnerLecturesOCR('', '').texte, '');
  assert.equal(fusionnerLecturesOCR(null, undefined).texte, '');
});
