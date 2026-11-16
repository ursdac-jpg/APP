const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const etape = require('../modules/missions-competences/etape.js');

// Lot 5 (consigne 311) : voie 1 de la reprise, « Compléter avec la fiche du métier » dans le formulaire d'une expérience.
const racine = path.join(__dirname, '..');
const ui = fs.readFileSync(path.join(racine, 'modules', 'missions-competences', 'ui.js'), 'utf8');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');

test("le formulaire d'expérience appelle la brique, branche son clic et reporte le texte validé chez l'assistant", () => {
  assert.ok(app.includes('mcHtmlComplementReprise(_expInlineEditIndex)'), 'le bouton est dans le formulaire (modification seulement)');
  assert.ok(app.includes('mcBrancherComplementReprise(rerender)'), 'le clic est câblé');
  assert.ok(app.includes('mcApresValidationExperience(_expInlineEditIndex)'), 'le report après « Valider »');
});

test('le bouton ne vaut que pour « Corriger mon CV » (mode maj), module ouvert, hors fenêtre du Bilan', () => {
  const corps = ui.slice(ui.indexOf('function _mcRepApplicable'), ui.indexOf('function _mcRepRedessiner'));
  assert.ok(corps.includes("MC_OUVERT !== true"), 'derrière l\'interrupteur');
  assert.ok(corps.includes("dossier.modeCreation !== 'maj'"), 'jamais dans les autres parcours (la voie 2 ne reçoit rien)');
  assert.ok(corps.includes('_depuisBilanVersProjet'), 'pas dans la fenêtre du Bilan');
});

test("seules les fiches reconnues (A) ou proches (B) donnent le bouton ; sinon rien (consigne 284)", () => {
  const corps = ui.slice(ui.indexOf('function _mcRepFiche(exp)'), ui.indexOf('function _mcRepSelection'));
  assert.ok(corps.includes("r.niveau === 'A'") && corps.includes("r.niveau === 'B'"));
  assert.ok(!corps.includes("'C'"), 'les rapprochements approchants ne donnent pas le bouton');
  assert.ok(ui.includes("if (!rech) { return ''; }"), 'aucune fiche : rien d\'affiché');
});

test("les missions déjà dans le CV sont affichées cochées et verrouillées, sans doublon avec la fiche", () => {
  assert.ok(ui.includes('vp-carte vp-longue coche fixe'), 'cochées, non cliquables');
  assert.ok(ui.includes('Déjà dans votre CV'));
  assert.ok(ui.includes('cles[mcCleTexte(m)] && !cochee'), 'une mission déjà présente n\'est pas reproposée');
});

test("le report chez l'assistant remplace seulement les missions de CETTE expérience", () => {
  const dossier = { ia: { cv: { recommandations: { savoirFaireParExperience: [
    { poste: 'Caissier', entreprise: 'Super U', missions: ['Version assistant.'] },
    { poste: 'Livreur', entreprise: '', missions: ['Livrer.'] }
  ] } } } };
  const src = ui.slice(ui.indexOf('function mcReporterMissionsChezAssistant'), ui.indexOf('// Ce que la personne a tapé'));
  const trouver = (liste, poste, entreprise) => liste.filter((s) => s.poste === poste && s.entreprise === entreprise)[0];
  const f = new Function('dossier', 'trouverEntreeExperienceIA', 'mcLignes', src + '; return mcReporterMissionsChezAssistant;')(dossier, trouver, etape.mcLignes);
  assert.equal(f({ poste: 'Caissier', entreprise: 'Super U', missions: 'Tenir la caisse\nAccueillir' }), true);
  assert.deepEqual(dossier.ia.cv.recommandations.savoirFaireParExperience[0].missions, ['Tenir la caisse', 'Accueillir']);
  assert.deepEqual(dossier.ia.cv.recommandations.savoirFaireParExperience[1].missions, ['Livrer.'], 'les autres expériences ne bougent pas');
  assert.equal(f({ poste: 'Absent', entreprise: '', missions: 'X' }), false, 'pas de réponse de l\'assistant pour cette expérience : rien à reporter');
});

// Lot 6 (consigne 312) : voie 3, « Le refaire moi-même dans un modèle ».
const csa = fs.readFileSync(path.join(racine, 'modules', 'cv-sans-assistant', 'index.js'), 'utf8');

test("voie 3 : la carte d'expérience porte le bouton et le clic passe par la brique", () => {
  assert.ok(csa.includes('mcHtmlComplementVoie3(n, e)'), 'le bouton est sur chaque carte');
  assert.ok(csa.includes('mcClicComplementVoie3(ev, F,'), 'le clic est branché');
  assert.ok(ui.includes('function mcHtmlComplementVoie3') && ui.includes('function mcClicComplementVoie3'));
});

test('le panneau est UN seul, partagé par les deux voies (aucune copie)', () => {
  assert.equal(ui.split('function _mcRepHtmlPanneau(').length - 1, 1);
  assert.ok(ui.includes('_mcRepHtmlPanneau(rech, _mcRepSelection(s.code, rech)'), 'voie 3');
  assert.ok(ui.includes('return _mcRepHtmlPanneau(rech, _mcRepSelection(_mcRep.choisi[id], rech)'), 'voie 1');
});

test('bascule d\'une ligne : ajoute, retire seulement ce que la fiche a ajouté, jamais ce que la personne a écrit', () => {
  const b = etape.mcBasculerAjout;
  let r = b(['Ma ligne'], [], 'Accueillir le public');
  assert.deepEqual(r.liste, ['Ma ligne', 'Accueillir le public']);
  assert.deepEqual(r.ajoutes, ['Accueillir le public']);
  assert.equal(r.ajoute, true);
  r = b(r.liste, r.ajoutes, 'ACCUEILLIR LE PUBLIC.');
  assert.deepEqual(r.liste, ['Ma ligne'], 'un second clic retire la ligne ajoutée par la fiche');
  assert.deepEqual(r.ajoutes, []);
  r = b(['Ma ligne'], [], 'ma ligne');
  assert.deepEqual(r.liste, ['Ma ligne'], 'une ligne de la personne n\'est ni doublée ni retirée');
  assert.deepEqual(r.ajoutes, []);
  assert.deepEqual(b(undefined, undefined, 'X').liste, ['X']);
  assert.deepEqual(b(['A'], [], '  ').liste, ['A']);
  const avant = ['A']; b(avant, [], 'B');
  assert.deepEqual(avant, ['A'], 'la liste d\'origine n\'est pas modifiée');
});

test('voie 3 : un changement de fiche retire les ajouts de la fiche, pas ceux de la personne', () => {
  const src = ui.slice(ui.indexOf('function _mc3RetirerAjouts'), ui.indexOf('// Branché sur le clic'));
  const F = { competences: ['Patience', 'Accompagnement'], qualites: ['Écoute'] };
  const e = { missions: ['Ma ligne', 'Ajoutée par la fiche'] };
  const s = { ajoute: { m: ['Ajoutée par la fiche'], sf: ['Accompagnement'], se: ['Écoute'] } };
  new Function('_mc3Present', 'mcCleTexte', '_MC3_RUBRIQUE', 'F', 'e', 's', src + '; _mc3RetirerAjouts(F, e, s);')(
    (liste, texte) => (liste || []).some((x) => etape.mcCleTexte(x) === etape.mcCleTexte(texte)), etape.mcCleTexte, { sf: 'competences', se: 'qualites' }, F, e, s);
  assert.deepEqual(e.missions, ['Ma ligne']);
  assert.deepEqual(F.competences, ['Patience']);
  assert.deepEqual(F.qualites, []);
  assert.deepEqual(s.ajoute, { m: [], sf: [], se: [] });
});
