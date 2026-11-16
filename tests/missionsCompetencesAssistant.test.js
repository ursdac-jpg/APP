const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const etape = require('../modules/missions-competences/etape.js');

// Lot 4 (consigne 305) : l'étape avec l'assistant. Les choix de la personne ne sont jamais remplacés ; l'assistant ne fait que compléter.
const racine = path.join(__dirname, '..');

function etatAvec(miss, perso, comp) {
  const e = etape.mcEtatVide();
  e.miss = miss || {}; e.perso = perso || {}; e.comp = comp || {};
  return e;
}

test('chemin avec l\'assistant : (a) si la personne a fait un choix dans l\'étape, (b) sinon comme avant', () => {
  assert.equal(etape.mcCheminAssistant(etape.mcEtatVide()), 'b');
  assert.equal(etape.mcCheminAssistant(null), 'b');
  assert.equal(etape.mcCheminAssistant(etatAvec({ x1: ['Accueillir le public'] })), 'a');
  assert.equal(etape.mcCheminAssistant(etatAvec({}, { x1: ['Ma mission'] })), 'a');
  assert.equal(etape.mcCheminAssistant(etatAvec({}, {}, { x1: { sf: ['Soins'] } })), 'a');
  assert.equal(etape.mcCheminAssistant(etatAvec({ x1: [] }, { x2: [] }, { x1: { sf: [] } })), 'b', 'des listes vides ne sont pas un choix');
});

test('missions de la personne : seulement si elle a fait des choix pour CETTE expérience', () => {
  const etat = etatAvec({ x1: ['Accueillir le public'] });
  const avec = { idEtape: 'x1', poste: 'Caissier', missions: 'Tenir la caisse\nAccueillir le public' };
  const sans = { idEtape: 'x2', poste: 'Livreur', missions: 'Conduire un camion' };
  const sansId = { poste: 'Autre', missions: 'Une ligne' };
  assert.deepEqual(etape.mcMissionsPersonne(etat, avec), ['Tenir la caisse', 'Accueillir le public'], 'les lignes du dossier, celles qu\'elle avait déjà comprises');
  assert.deepEqual(etape.mcMissionsPersonne(etat, sans), [], 'aucun choix pour cette expérience : l\'assistant garde son rôle d\'avant');
  assert.deepEqual(etape.mcMissionsPersonne(etat, sansId), []);
  assert.deepEqual(etape.mcMissionsPersonne(null, avec), []);
  assert.deepEqual(etape.mcMissionsPersonne(etat, null), []);
});

test('une mission écrite par la personne compte comme un choix', () => {
  const etat = etatAvec({}, { x1: ['Ma mission à moi'] });
  assert.deepEqual(etape.mcMissionsPersonne(etat, { idEtape: 'x1', missions: 'Ma mission à moi' }), ['Ma mission à moi']);
});

test('fusion : les lignes de la personne passent en premier, intactes ; l\'assistant ne fait que compléter, sans doublon', () => {
  const f = etape.mcFusionnerMissionsAssistant(
    ['Tenir la caisse', 'Accueillir le public'],
    ['Accueillir le public.', 'TENIR LA CAISSE', 'Réaliser le réassort.', 'Réaliser le réassort', 'Contrôler les prix']
  );
  assert.deepEqual(f.choix, ['Tenir la caisse', 'Accueillir le public']);
  assert.deepEqual(f.complements, ['Réaliser le réassort.', 'Contrôler les prix'], 'doublons avec la personne et entre eux écartés (ponctuation et casse ignorées)');
});

test('fusion : listes vides ou absentes sans erreur', () => {
  assert.deepEqual(etape.mcFusionnerMissionsAssistant([], []), { choix: [], complements: [] });
  assert.deepEqual(etape.mcFusionnerMissionsAssistant(undefined, undefined), { choix: [], complements: [] });
  assert.deepEqual(etape.mcFusionnerMissionsAssistant([' Une  ligne '], null).choix, ['Une ligne']);
});

test('js/app.js : le brouillon de l\'assistant garde les choix de la personne et décoche les compléments par défaut', () => {
  const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  assert.ok(app.includes('mcMissionsPersonne(dossier.etapeMC, trouverEntreeExperienceIA(dossier.experiences || [], poste, entreprise))'), 'le brouillon lit les choix de la personne');
  assert.ok(app.includes('mcFusionnerMissionsAssistant(lignesPersonne, correspondanceMissions(poste, entreprise))'));
  assert.ok(app.includes("origine: 'personne'") && app.includes("origine: 'assistant'"));
  assert.ok(/garder: gardeesListe === null \? false/.test(app), 'compléments décochés au premier passage');
  assert.ok(app.includes("typeof mcMissionsPersonne !== 'function'"), 'sans la brique, le comportement d\'avant est inchangé');
});

test("propositions en plus : seulement ce qui n'est pas déjà dans les lignes de la personne, avec l'état coché", () => {
  const lignes = ['Tenir la caisse', 'Accueillir le public'];
  const pool = ['Tenir la caisse', 'Accueillir le public', 'Réaliser le réassort.', 'Contrôler les prix.', 'CONTRÔLER LES PRIX'];
  const gardees = ['Tenir la caisse', 'Accueillir le public', 'Contrôler les prix'];
  assert.deepEqual(etape.mcComplementsAssistant(lignes, pool, gardees), [
    { texte: 'Réaliser le réassort.', coche: false },
    { texte: 'Contrôler les prix.', coche: true }
  ]);
  assert.deepEqual(etape.mcComplementsAssistant(lignes, [], []), []);
  assert.deepEqual(etape.mcComplementsAssistant(lignes, lignes, lignes), [], 'rien de plus que ses choix : aucun cadre');
});

test('régler une proposition : ajout et retrait sans jamais toucher aux lignes de la personne', () => {
  const lignes = ['Tenir la caisse', 'Accueillir le public'];
  const gardees = ['Tenir la caisse', 'Accueillir le public'];
  const avec = etape.mcReglerComplement(gardees, lignes, 'Réaliser le réassort.', true);
  assert.deepEqual(avec, ['Tenir la caisse', 'Accueillir le public', 'Réaliser le réassort.']);
  assert.deepEqual(gardees, ['Tenir la caisse', 'Accueillir le public'], "la liste d'origine n'est pas modifiée");
  assert.deepEqual(etape.mcReglerComplement(avec, lignes, 'REALISER LE REASSORT', true), avec, 'ajouter deux fois ne double pas');
  assert.deepEqual(etape.mcReglerComplement(avec, lignes, 'Réaliser le réassort', false), gardees);
  assert.deepEqual(etape.mcReglerComplement(gardees, lignes, 'Absente', false), gardees, "retirer ce qui n'y est pas ne change rien");
  assert.deepEqual(etape.mcReglerComplement(undefined, lignes, 'Réaliser le réassort.', true), ['Tenir la caisse', 'Accueillir le public', 'Réaliser le réassort.'], 'sans liste retenue, on part des lignes de la personne');
  assert.deepEqual(etape.mcReglerComplement([], lignes, 'X', false), lignes);
});

test("« La mise en page » : le cadre, la ligne d'invitation, le clic et les deux fonctions de l'aperçu sont câblés", () => {
  const cartes = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfCartesMaquette.js'), 'utf8');
  const reglages = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfPanneauReglages.js'), 'utf8');
  const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
  const css = fs.readFileSync(path.join(racine, 'css', 'mise-en-page-maquette.css'), 'utf8');
  assert.ok(cartes.includes('function _mepPropositionsEnPlus') && cartes.includes('function _mepHtmlBlocEnPlus'));
  assert.ok(cartes.includes("_mepHtmlMissionsPickerMq('exp', i, segments, choisieListe, n, ouvert, plus, extras)"));
  assert.ok(cartes.includes('en plus de vos choix'), "ligne d'invitation");
  assert.ok(app.includes('data-mep-exp-plus') && app.includes('mcReglerComplement('), 'le clic');
  assert.ok(app.includes('_pdfFixerMissionAffichee') && app.includes('_pdfRetirerRangMission'));
  assert.ok(reglages.includes('function _pdfFixerMissionAffichee') && reglages.includes('function _pdfRetirerRangMission'), "fonctions de l'aperçu");
  assert.ok(css.includes('.miss-en-plus'), 'le style');
  assert.ok(!/#[0-9a-fA-F]{3,6}/.test(css.slice(css.indexOf('.miss-en-plus'), css.indexOf('.miss-en-plus') + 900)), 'couleurs par variables (mode sombre)');
});
