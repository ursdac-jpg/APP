const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

// Retour Denis 2026-10-01 : « si on a les infos, il faut les afficher » : une expérience personnelle CITÉE garde ses dates et son lieu.
const contexte = {
  normaliserPourComparaison: (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
};
vm.createContext(contexte);
['modules/cv-core/certifications.js', 'modules/cv-pdf-html/cvPdfTemplateA4.js', 'modules/cv-pdf-html/cvPdfTemplateMaquette.js']
  .forEach((f) => vm.runInContext(fs.readFileSync(__dirname + '/../' + f, 'utf8'), contexte));
const ligne = (item) => JSON.parse(JSON.stringify(contexte._pdfPersoCiteeLigne(item)));

test('citée : intitulé, période et lieu quand ils sont connus', () => {
  assert.deepEqual(ligne({ intitule: 'Bénévole aux Restos du Coeur', dateDebut: '2019', dateFin: '2021', lieu: 'Limoges' }), { titre: 'Bénévole aux Restos du Coeur', details: '2019 - 2021, Limoges' });
});

test('citée : une année seule reste une année (« 2019 », jamais « en cours »)', () => {
  assert.deepEqual(ligne({ intitule: 'Bricolage', dateDebut: '2019', dateFin: '2019' }), { titre: 'Bricolage', details: '2019' });
});

test('citée : sans date ni lieu, rien n\'est ajouté ; un texte simple reste tel quel', () => {
  assert.deepEqual(ligne({ intitule: 'Jardinage' }), { titre: 'Jardinage', details: '' });
  assert.deepEqual(ligne('Cuisine'), { titre: 'Cuisine', details: '' });
  assert.deepEqual(ligne({ texte: 'Aide aux devoirs', dateDebut: '2022' }), { titre: 'Aide aux devoirs', details: '2022 - en cours' });
});
