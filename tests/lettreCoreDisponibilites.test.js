const { test } = require('node:test');
const assert = require('node:assert/strict');

// Horaires acceptés (candidature spontanée et changer de métier, page « Préparer » de la lettre).
const { HORAIRES_EMPLOI, texteHorairesProfil } = require('../modules/lettre-core/disponibilitesLettreCo.js');

test('HORAIRES_EMPLOI : valeurs uniques, libellés non vides, sans tiret long', () => {
  const vals = HORAIRES_EMPLOI.map((h) => h.val);
  assert.equal(new Set(vals).size, vals.length);
  HORAIRES_EMPLOI.forEach((h) => {
    assert.ok(h.val && h.label);
    assert.ok(!/[–—]/.test(h.val + h.label));
  });
  assert.ok(vals.includes('Soirée') && vals.includes('Week-end') && vals.includes('Nuit'));
});

test('texteHorairesProfil : vide sans choix ou avec des valeurs inconnues', () => {
  assert.equal(texteHorairesProfil(), '');
  assert.equal(texteHorairesProfil([]), '');
  assert.equal(texteHorairesProfil(['Inconnu']), '');
  assert.equal(texteHorairesProfil(null), '');
});

test('texteHorairesProfil : une ligne dans l\'ordre des horaires proposés', () => {
  assert.equal(texteHorairesProfil(['Week-end', 'Soirée']), '- Horaires acceptés : Soirée, Week-end\n');
});

test('texteHorairesProfil : tout coché = tous les horaires', () => {
  const tous = HORAIRES_EMPLOI.map((h) => h.val);
  const t = texteHorairesProfil(tous);
  assert.ok(t.startsWith('- Horaires acceptés : tous les horaires ('));
  assert.ok(t.endsWith(')\n'));
  tous.forEach((v) => assert.ok(t.includes(v)));
});
