const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Consigne 396 : parcours « à partir de mon récit », étape 9 « Vos expériences » : voir ce que l'assistant a retrouvé, le retirer, le remettre, en ajouter d'autres avec le panneau.
const racine = path.join(__dirname, '..');
const parcours = fs.readFileSync(path.join(racine, 'modules', 'decouverte-competences', 'decouverteParcours.js'), 'utf8');
const panneau = fs.readFileSync(path.join(racine, 'modules', 'missions-competences', 'panneau.js'), 'utf8');

const corps = panneau.slice(panneau.indexOf('function mcPanneauActif()'), panneau.indexOf('// ---------- Dates'));
function actif(ctx) {
  const f = new Function('MC_OUVERT', 'dossier', 'pageActuelle', '_decouverteNumeroCourant', '_depuisBilanVersProjet', '_pageOrigineAvantProjet', '_blocEditionCvBilanEnCours', '_expInlineModeUnique',
    corps + '; return mcPanneauActif();');
  return f(ctx.mc !== false, ctx.dossier || {}, ctx.page, ctx.etape, false, null, false, false);
}

test('le panneau est actif à l’étape 9 du parcours « à partir de mon récit », et seulement là pour ce parcours', () => {
  assert.equal(actif({ page: 'decouverte', etape: 9 }), true);
  assert.equal(actif({ page: 'decouverte', etape: 8 }), false, 'les autres étapes du récit ne montrent pas les expériences');
  assert.equal(actif({ page: 'decouverte', etape: 10 }), false);
  assert.equal(actif({ page: 'decouverte', etape: 9, mc: false }), false, 'module fermé : l’ancien formulaire');
});

test('le panneau reste actif là où il l’était (Vos informations, nouveau CV ou correction) et inactif ailleurs', () => {
  assert.equal(actif({ page: 'projet', dossier: { modeCreation: 'nouveau' } }), true);
  assert.equal(actif({ page: 'projet', dossier: { modeCreation: 'maj' } }), true);
  assert.equal(actif({ page: 'projet', dossier: {} }), false);
  assert.equal(actif({ page: 'resultats', dossier: { modeCreation: 'nouveau' } }), false);
});

test('l’assistant a retrouvé : copie gardée après le mapping, repère posé, retrait et remise sans doublon ni perte des modifications', () => {
  assert.ok(parcours.includes('etat.experiencesRecit = (resultatMapping.valeurs.misesAJour.experiences'));
  assert.ok(parcours.includes("x.idRecit = 'r' + (k + 1)"));
  assert.ok(parcours.includes('_decouverteHtmlExperiencesRecit()') && parcours.includes('_decouverteBrancherExperiencesRecit();'));
  assert.ok(parcours.includes('data-decouv-recit'));
  // retrait : la copie est mise à jour avec la version modifiée par la personne, puis l'expérience sort du dossier ; remise : seulement si elle n'y est pas déjà
  assert.ok(parcours.includes('entree.exp = JSON.parse(JSON.stringify(dossier.experiences[idx]));'));
  assert.ok(parcours.includes('if (idx === -1) { dossier.experiences.push('));
});

test('l’écran : texte simple, rassurant, sans tiret long ni mot interdit', () => {
  const bloc = parcours.slice(parcours.indexOf('function _decouverteHtmlExperiencesRecit'), parcours.indexOf('function etapeVosExperiences'));
  assert.ok(bloc.includes('Ce que l’assistant a retrouvé dans votre récit'));
  assert.ok(bloc.includes('vous pouvez la remettre quand vous voulez'));
  assert.ok(!bloc.includes(String.fromCharCode(0x2013)) && !bloc.includes(String.fromCharCode(0x2014)));
  assert.ok(!/\bIA\b/.test(bloc));
});
