const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const moteur = require('../modules/cv-core/moteurDecisionCV.js');

// Lot 6 (consigne 395) : « mettre en avant » les missions qui comptent le plus pour le métier visé. L'assistant propose, la personne clique, le moteur ne fait que réordonner.
const racine = path.join(__dirname, '..');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
const cartes = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfCartesMaquette.js'), 'utf8');
const iframe = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfPanneauReglages.js'), 'utf8');
const prompt = fs.readFileSync(path.join(racine, 'prompts', 'cv-choix-personne.md'), 'utf8');

const src = app.slice(app.indexOf('function _retirerMarkdownIA'), app.indexOf('function normaliserQuestionAnticipeeIA'));
const src2 = app.slice(app.indexOf('function normaliserMissionsEnAvantIA'), app.indexOf('function normaliserMissionsPlusCourtesIA'));
const normaliser = new Function(src + '\n' + src2 + '; return normaliserMissionsEnAvantIA;')();

const texte = 'Tenir la caisse.\nAccueillir le public.\nGérer les stocks de la réserve.\nRéaliser l’inventaire.';

test('les lignes indiquées passent en premier, dans l’ordre demandé, les autres gardent leur ordre', () => {
  assert.equal(moteur.mettreEnAvantMissionsCV(texte, [{ lignes: ['réaliser l’inventaire', 'Gérer les stocks de la réserve'] }]),
    'Réaliser l’inventaire.\nGérer les stocks de la réserve.\nTenir la caisse.\nAccueillir le public.');
  assert.deepEqual(moteur.ordreMissionsEnAvant(['a', 'b', 'c'], ['c']), [2, 0, 1]);
});

test('aucun texte n’est modifié, rien n’est ajouté ni retiré : mêmes lignes, autre ordre', () => {
  const avant = texte.split('\n').sort();
  const apres = moteur.mettreEnAvantMissionsCV(texte, [{ lignes: ['Accueillir le public', 'Réaliser l’inventaire'] }]).split('\n').sort();
  assert.deepEqual(apres, avant);
});

test('une ligne reformulée ou absente est ignorée ; déjà en tête ou aucune ligne retrouvée : rien ne change', () => {
  assert.equal(moteur.mettreEnAvantMissionsCV(texte, [{ lignes: ['Une phrase que la personne n’a pas écrite'] }]), texte);
  assert.equal(moteur.mettreEnAvantMissionsCV(texte, [{ lignes: ['Tenir la caisse'] }]), texte);
  assert.equal(moteur.ordreMissionsEnAvant(['a', 'b'], ['a']), null);
  assert.equal(moteur.mettreEnAvantMissionsCV(undefined, [{ lignes: ['x'] }]), undefined);
  assert.equal(moteur.mettreEnAvantMissionsCV(texte, []), texte);
});

test('trois lignes au plus, sans doublon', () => {
  assert.deepEqual(moteur.rangsMissionsEnAvant(['a', 'b', 'c', 'd', 'e'], ['e', 'd', 'c', 'b', 'e']), [4, 3, 2]);
});

test('moteur du CV : rien sans le clic, réordonne seulement pour l’expérience concernée après le clic', () => {
  const objetCV = { experiences: [
    { poste: 'Employé libre-service', entreprise: 'Super U', missions: texte },
    { poste: 'Caissier', entreprise: 'Leclerc', missions: texte }
  ], formations: [], langues: [], certifications: [], loisirs: [], engagements: [], competences: { savoirFaire: [], savoirEtre: [], savoirs: [] } };
  const entree = { poste: 'Employé libre-service', entreprise: 'Super U', lignes: ['Réaliser l’inventaire'], raison: 'Le poste vise la gestion de stock.' };
  const reco = (utilisee) => ({ experiencesAMettreEnAvant: [{ poste: 'Employé libre-service', entreprise: 'Super U' }, { poste: 'Caissier', entreprise: 'Leclerc' }],
    missionsEnAvant: [Object.assign({}, entree, utilisee === undefined ? {} : { utilisee })] });
  global.dossier = { pdfReglages: {} };
  const sans = moteur.appliquerMoteurDecisionCV(JSON.parse(JSON.stringify(objetCV)), reco(undefined), {});
  assert.ok(sans.experiences.every((e) => e.missions === texte), 'sans clic : aucun changement');
  const non = moteur.appliquerMoteurDecisionCV(JSON.parse(JSON.stringify(objetCV)), reco(false), {});
  assert.ok(non.experiences.every((e) => e.missions === texte), 'après « revenir en arrière » : comme avant');
  const oui = moteur.appliquerMoteurDecisionCV(JSON.parse(JSON.stringify(objetCV)), reco(true), {});
  const u = oui.experiences.filter((e) => e.poste === 'Employé libre-service')[0], c = oui.experiences.filter((e) => e.poste === 'Caissier')[0];
  assert.ok(u.missions.startsWith('Réaliser l’inventaire.\n'), 'la ligne passe en premier');
  assert.equal(c.missions, texte, 'une autre expérience n’est pas touchée');
  delete global.dossier;
});

test('lecture de la réponse : trois lignes au plus, une expérience sans ligne écartée, jamais d’erreur', () => {
  const r = normaliser([
    { poste: 'Caissier', entreprise: 'Super U', lignes: ['a', ' b ', 'c', 'd'], raison: ' Parce que. ' },
    { poste: 'Sans ligne', lignes: [] }, null, 'texte'
  ]);
  assert.equal(r.length, 1);
  assert.deepEqual(r[0].lignes, ['a', 'b', 'c']);
  assert.equal(r[0].raison, 'Parce que.');
  assert.deepEqual(normaliser(undefined), []);
});

test('l’écran : la carte, le clic et le suivi des choix précis de missions sont en place ; une fois le clic fait, on peut revenir en arrière', () => {
  ['_mepHtmlEnAvantExperience', 'data-mep-exp-enavant', 'Oui, les mettre en premier', 'Revenir en arri&egrave;re', 'rangsMissionsEnAvant'].forEach((m) => assert.ok(cartes.includes(m), m));
  assert.ok(app.includes("'[data-mep-exp-enavant]'") && app.includes('entree.utilisee = true') && app.includes('entree.utilisee = false'));
  assert.ok(app.includes("'_pdfPermuterMissionsChoisies'") && iframe.includes('function _pdfPermuterMissionsChoisies'));
});

test('le prompt : trois lignes au plus, recopiées mot pour mot, rien de modifié, la personne décide ; jamais de tiret long ni de « IA »', () => {
  assert.ok(prompt.includes('`missionsEnAvant`'));
  assert.ok(prompt.includes('1 à 3 lignes au maximum') && prompt.includes('mot pour mot') && prompt.includes('par un clic'));
  assert.ok(!prompt.includes(String.fromCharCode(0x2013)) && !prompt.includes(String.fromCharCode(0x2014)));
  assert.ok(!/\bIA\b/.test(prompt));
});
