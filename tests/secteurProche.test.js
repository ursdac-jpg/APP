/* ============================================================
   tests/secteurProche.test.js  (R.7, 2026-09-29)
   ------------------------------------------------------------
   Metier vise ABSENT de la base : l'assistant renvoie `secteurProche` (nom exact d'un des 21 secteurs) ; l'application applique le
   referentiel de ce secteur. Ordre de fiabilite : fiche du metier, secteur choisi par la personne, secteur rapproche par l'assistant.
   Un nom qui n'est pas l'un des 21 secteurs est ignore (jamais bloquant, jamais une competence inventee).
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const ctx = { console: console };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: { appendChild() {} } };
vm.createContext(ctx);
[
  'data/metiers.js', 'data/competencesSecteurs.js', 'modules/cv-core/dates.js', 'modules/cv-core/certifications.js', 'modules/cv-core/extraireDonneesCV.js',
  'modules/cv-core/normaliserDonneesCV.js', 'modules/cv-core/moteurDecisionCV.js', 'modules/cv-editor/formatA5CV.js',
  'modules/cv-composeur/composeurProfil.js', 'modules/cv-composeur/composeurComposants.js', 'modules/cv-composeur/composeurRegles.js',
  'modules/cv-composeur/composeurDedoublonnage.js', 'modules/cv-composeur/composeurComposition.js', 'modules/cv-composeur/composeurStrategies.js',
  'modules/cv-composeur/composeurTheme.js', 'modules/cv-pdf-html/cvPdfDonnees.js'
].forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));

const secteurs = () => Array.from(vm.runInContext('Object.keys(COMPETENCES_SECTEURS)', ctx));

function dossier(metierCible, secteurCible, secteurProche) {
  return {
    objectif: 'offre', metierCible: metierCible || null, secteurCible: secteurCible || null,
    identite: { nom: 'Test', prenom: 'Camille' },
    experiences: [{ poste: 'Employée polyvalente', entreprise: 'Maison de quartier', lieu: '', dateDebut: '2019', dateFin: '', missions: 'Accueil du public' }],
    experiencesPerso: [], formations: [], certifications: [], langues: [], logiciels: [], loisirs: [], engagements: [],
    permis: {}, valeurs: [], activites: [], actions: [], environnement: [],
    ia: { cv: { recommandations: { secteurProche: secteurProche || '', competencesAttenduesMetier: [] } } }
  };
}
const donnees = (d) => { ctx.dossier = d; return ctx.construireDonneesPdfCV(d, 'A4-detaille', false, false, null); };

test('R.7 : métier absent de la base + secteur proche valide : le référentiel de ce secteur est appliqué, l\'origine est « assistant »', () => {
  const nom = secteurs().find((s) => /Sant/.test(s));
  const r = donnees(dossier('Podologue équin', null, nom));
  assert.strictEqual(r.secteurReferentiel.nom, nom);
  assert.strictEqual(r.secteurReferentiel.origine, 'assistant');
  assert.ok(r.qualitesAttenduesMetier.length > 0, 'les qualités du secteur sont proposées');
  assert.ok(r.competencesProAttendues.length > 0, 'les compétences professionnelles du secteur sont proposées');
});

test('R.7 : le nom du secteur est reconnu sans tenir compte de la casse ni des accents ; le libellé exact du référentiel est gardé', () => {
  const nom = secteurs().find((s) => /Sant/.test(s));
  const r = donnees(dossier('Podologue équin', null, nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')));
  assert.strictEqual(r.secteurReferentiel.nom, nom);
});

test('R.7 : un nom de secteur inconnu est ignoré (aucune compétence, aucune erreur)', () => {
  const r = donnees(dossier('Podologue équin', null, 'Secteur inventé par l\'assistant'));
  assert.strictEqual(r.secteurReferentiel, null);
  assert.strictEqual(r.competencesProAttendues.length, 0);
  assert.strictEqual(r.qualitesAttenduesMetier.length, 0);
});

test('R.7 : la fiche du métier de la base passe avant le secteur proposé par l\'assistant', () => {
  const autre = secteurs().find((s) => /Transport|Logistique|Commerce/.test(s));
  const r = donnees(dossier('Aide-soignant', null, autre));
  assert.strictEqual(r.secteurReferentiel.origine, 'fiche');
  assert.notStrictEqual(r.secteurReferentiel.nom, autre);
});

test('R.7 : le secteur choisi par la personne passe avant celui de l\'assistant', () => {
  const [a, b] = secteurs();
  const r = donnees(dossier(null, a, b));
  assert.strictEqual(r.secteurReferentiel.nom, a);
  assert.strictEqual(r.secteurReferentiel.origine, 'choix');
});

test('R.7 : sans métier, sans secteur et sans secteur proche : aucun référentiel', () => {
  assert.strictEqual(donnees(dossier()).secteurReferentiel, null);
});

test('R.7 : le moteur de décision transporte le secteur proche, vide par défaut', () => {
  const d = dossier('Podologue équin', null, '  Santé et soins  ');
  const decide = ctx.appliquerMoteurDecisionCV(ctx.normaliserDonneesCV(d), d.ia.cv.recommandations, {});
  assert.strictEqual(decide.secteurProche, 'Santé et soins');
  assert.strictEqual(ctx.appliquerMoteurDecisionCV(ctx.normaliserDonneesCV(d), {}, {}).secteurProche, '');
});

test('R.7 : le prompt du CV connaît la clé secteurProche', () => {
  const prompt = fs.readFileSync(path.join(racine, 'prompts/cv.md'), 'utf8');
  assert.ok(prompt.indexOf('"secteurProche"') !== -1);
  assert.ok(prompt.indexOf('Le métier visé n’est pas dans notre base') !== -1);
});
