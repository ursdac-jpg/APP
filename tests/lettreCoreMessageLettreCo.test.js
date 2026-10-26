const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Message copie par « Écrire ma lettre avec l'assistant » : prompt + profil,
// puis le CV relu et masqué (plus de second temps « Copier mon CV »).
const { construireMessageLettreCo, TITRE_SECTION_CV_LETTRE_CO } = require('../modules/lettre-core/construireMessageLettreCo.js');

test('construireMessageLettreCo : le CV est ajouté après le profil, sous le titre que le prompt cite', () => {
  const m = construireMessageLettreCo('PROMPT\n\nCONTEXTE DE LA CANDIDATURE\n- Objectif : spontanee', 'Technicien\nSODITELEM 2021');
  assert.ok(m.startsWith('PROMPT'));
  assert.ok(m.indexOf('CONTEXTE DE LA CANDIDATURE') < m.indexOf('CV DE LA PERSONNE'));
  assert.ok(m.endsWith('CV DE LA PERSONNE (déjà relu et masqué par elle)\nTechnicien\nSODITELEM 2021'));
});

test('construireMessageLettreCo : espaces superflus retirés, une seule section de CV', () => {
  const m = construireMessageLettreCo('PROMPT   \n\n', '   Mon CV   \n');
  assert.equal(m, 'PROMPT\n\nCV DE LA PERSONNE (déjà relu et masqué par elle)\nMon CV');
  assert.equal(m.split(TITRE_SECTION_CV_LETTRE_CO).length, 2);
});

test('construireMessageLettreCo : sans texte de CV, le message le dit au lieu de mentir', () => {
  for (const vide of ['', '   ', null, undefined]) {
    const m = construireMessageLettreCo('PROMPT', vide);
    assert.ok(m.includes('CV DE LA PERSONNE\nAucun texte de CV'));
    assert.ok(!m.includes('déjà relu'));
  }
});

test('construireMessageLettreCo : le prompt de production cite la même section et plus l\'ancien jeton', () => {
  const prompt = fs.readFileSync(path.join(__dirname, '..', 'prompts', 'lettre-co.md'), 'utf8');
  assert.ok(prompt.includes('« ' + TITRE_SECTION_CV_LETTRE_CO + ' »'), 'le prompt doit nommer la section du CV');
  assert.ok(!prompt.includes('CONSIGNE_TRANSMISSION_CV'), 'l\'ancien jeton ne doit plus figurer');
  assert.ok(prompt.includes('{{VOIX_HUMAINE}}'), 'le jeton de la voix humaine doit rester');
});

test('construireMessageLettreCo : la lettre de recommandation vient après le CV, une seule fois', () => {
  const section = 'LETTRE DE RECOMMANDATION (relue et masquée par la personne), de la part de : Ancien employeur\nIl est fiable.';
  const m = construireMessageLettreCo('PROMPT', 'Mon CV', section);
  assert.ok(m.endsWith('Mon CV\n\n' + section));
  assert.equal(m.split('LETTRE DE RECOMMANDATION (relue').length, 2);
  assert.equal(construireMessageLettreCo('PROMPT', 'Mon CV', ''), construireMessageLettreCo('PROMPT', 'Mon CV'));
  assert.ok(construireMessageLettreCo('PROMPT', '', section).endsWith(section));
});
