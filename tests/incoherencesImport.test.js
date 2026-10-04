const { test } = require('node:test');
const assert = require('node:assert/strict');

// Détecteurs d'incohérences d'un CV importé (2026-09-30), partagés par tous les parcours qui reçoivent un CV.
const inc = require('../data/incoherencesImport.js');
const metiers = require('../data/metiers.js');

test('dates : fin avant le début => question avec la suggestion inversée ; dates normales ou en cours => rien', () => {
  const pts = inc.pointsDatesIncoherentes([
    { poste: 'Serveuse', dateDebut: '2024', dateFin: '2021' },
    { poste: 'Coiffeuse', dateDebut: '2023', dateFin: '2024' },
    { poste: 'Stage', dateDebut: '2026', dateFin: '' }
  ], [], 2026);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].suggestion, '2021 à 2024');
  assert.equal(pts[0].cible.poste, 'Serveuse');
});

test('dates : une année lointaine pose une question sans suggestion', () => {
  const pts = inc.pointsDatesIncoherentes([{ poste: 'Aide', dateDebut: '2030', dateFin: '' }], [], 2026);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].suggestion, '');
});

test('dates : la réponse « 2021 à 2024 » corrige la bonne expérience, en gardant le mois ; une réponse ambiguë ne change rien', () => {
  const objet = { experiences: [{ poste: 'Serveuse', dateDebut: '03/2024', dateFin: '2021' }, { poste: 'Autre', dateDebut: '2024', dateFin: '2021' }] };
  const cible = { type: 'dates', poste: 'Serveuse', dateDebut: '03/2024', dateFin: '2021' };
  assert.equal(inc.appliquerDatesPrecisees(objet, cible, '2021'), false);
  assert.equal(objet.experiences[0].dateDebut, '03/2024');
  assert.equal(inc.appliquerDatesPrecisees(objet, cible, '2021 à 2024'), true);
  assert.equal(objet.experiences[0].dateDebut, '03/2021');
  assert.equal(objet.experiences[0].dateFin, '2024');
  assert.equal(objet.experiences[1].dateDebut, '2024', 'l\'autre expérience n\'est pas touchée');
});

test('rubriques : un titre de rubrique pris pour un emploi et une attestation rangée en formation ou en loisirs sont remis en place', () => {
  const objet = {
    experiences: [
      { poste: 'Loisirs', entreprise: '', missions: ['Danse.', 'Musique'] },
      { poste: 'Serveuse', entreprise: 'Café', missions: ['Service'], dateDebut: '2021', dateFin: '2022' },
      { poste: 'Certifications', entreprise: '', missions: 'SST' }
    ],
    formations: [{ intitule: 'SST', annee: '2024', etablissement: '' }, { intitule: 'CAP Cuisine', etablissement: 'Lycée' }, { intitule: 'BAFA', etablissement: '' }],
    certifications: [], loisirs: ['Lecture', 'HACCP'], logiciels: []
  };
  const n = inc.reclasserRubriquesMalRangees(objet);
  assert.deepEqual(objet.experiences.map((e) => e.poste), ['Serveuse']);
  assert.deepEqual(objet.loisirs, ['Lecture', 'Danse', 'Musique']);
  assert.deepEqual(objet.formations.map((f) => f.intitule), ['CAP Cuisine', 'BAFA'], 'un diplôme comme le BAFA n\'est jamais déplacé');
  assert.deepEqual(objet.certifications, ['SST (2024)', 'HACCP'], 'pas de doublon : la version détaillée remplace la simple');
  assert.equal(n, 4);
});

test('texte brut : « sSsT » et une période à l\'envers sont signalés ; un CV normal ne produit rien', () => {
  const r = inc.incoherencesDansTexte('Certifications : sSsT\nServeuse 2024 - 2021\nAssistante 2021 - 2024\nOutil iPad et LinkedIn', 2026);
  assert.equal(r.length, 2);
  assert.equal(r[0].suggestion, 'SST');
  assert.equal(r[1].suggestion, '2021 - 2024');
  assert.deepEqual(inc.incoherencesDansTexte('Assistante de vie, CACES 3, SST, PSC1. Stage 2025 - 2026. Anglais A2. HTML et CSS.', 2026), []);
});

test('import : au plus 4 questions posées par le code, certifications et dates ensemble', () => {
  const pts = metiers.pointsIncoherencesImport([{ certifications: ['sSsT', 'Hacpp'], experiences: [{ poste: 'A', dateDebut: '2024', dateFin: '2021' }, { poste: 'B', dateDebut: '2025', dateFin: '2020' }, { poste: 'C', dateDebut: '2026', dateFin: '2019' }] }], []);
  assert.equal(pts.length, 4);
});

test('qualités : « Rigueur NI » et « Organisation A » posent une question (suggestion = le mot seul) ; une qualité normale non', () => {
  const pts = inc.pointsQualitesDouteuses([['Créativité', 'Rigueur NI', 'Organisation A', 'Gestion du temps', 'Écoute']], []);
  assert.deepEqual(pts.map((p) => p.suggestion), ['Rigueur', 'Organisation']);
  const s = { savoirEtre: ['Rigueur NI', 'Écoute'], certifications: [], experiences: [] };
  assert.equal(metiers.remplacerPrecisionDansListes(s, 'Rigueur NI', 'Rigueur'), true);
  assert.deepEqual(s.savoirEtre, ['Rigueur', 'Écoute']);
});

test('reformuler : une mission recopiée deux fois par l\'assistant n\'apparaît qu\'une fois', () => {
  const st = metiers._reformulerCvNettoyerStruct({ experiences: [{ poste: 'Stage', missions: ['Aider à la toilette.', 'Préparer les repas.', 'Aider à la toilette.'] }] });
  assert.deepEqual(st.experiences[0].missions, ['Aider à la toilette.', 'Préparer les repas.']);
});

test('texte brut : « Rigueur NI » et « Organisation A » (parasites de lecture) sont signalés ; niveau de langue, permis et titres jamais', () => {
  const texte = ['Compétences comportementales', 'Créativité', 'Rigueur NI', 'Organisation A', 'Gestion du temps', 'Langues', 'Anglais A2', 'Permis B', 'Certifications', 'SST'].join(String.fromCharCode(10));
  const r = inc.incoherencesDansTexte(texte, 2026);
  assert.deepEqual(r.map((x) => x.suggestion), ['Rigueur', 'Organisation']);
  assert.deepEqual(inc.incoherencesDansTexte('Anglais A2' + String.fromCharCode(10) + 'Permis B' + String.fromCharCode(10) + 'Agent AD', 2026), []);
});

test('qualités absentes du CV : une faute de lecture d\'image corrigée (« Gestlon » / « Gestion ») n\'est pas une invention', () => {
  const source = 'Titulaire du Titre professionnel Assistante de vie aux familles. Compétences comportementales : Créativité, Rigueur, Organisation A A, Gestlon du temps, Écoute, Bienveillance. Stage au CIAS de Beaumont, accompagnement de personnes âgées, aide à la toilette et aux repas.';
  const pts = inc.pointsQualitesAbsentes([['Créativité', 'Rigueur', 'Organisation', 'Gestion du temps', 'Écoute', 'Bienveillance', 'Patience']], source, []);
  assert.deepEqual(pts.map((p) => p.extrait), ['Patience']);
});

test('qualités absentes du CV : question « la retirer ? » seulement si le texte source est assez long ; la réponse retire la qualité', () => {
  const source = 'Titulaire du Titre professionnel Assistante de vie aux familles. Compétences comportementales : Créativité, Rigueur, Organisation, Écoute, Bienveillance. Stage au CIAS de Beaumont, accompagnement de personnes âgées, aide à la toilette et aux repas. Danse, musique, cuisine.';
  const pts = inc.pointsQualitesAbsentes([['Créativité', 'Écoute', 'Patience', 'Discrétion']], source, []);
  assert.deepEqual(pts.map((p) => p.extrait), ['Patience', 'Discrétion']);
  assert.equal(pts[0].retirer, true);
  assert.deepEqual(inc.pointsQualitesAbsentes([['Patience']], 'texte trop court', []), []);
  const s = { savoirEtre: ['Créativité', 'Patience'] };
  assert.equal(metiers.remplacerPrecisionDansListes(s, 'Patience', metiers.PRECISION_RETIRER), true);
  assert.deepEqual(s.savoirEtre, ['Créativité']);
});

test('certification citée dans une expérience : question « obtenue pendant cette expérience ? » avec l’année', () => {
  const inc = require('../data/incoherencesImport.js');
  const experiences = [{ poste: 'Agent de sécurité', dateDebut: '2019', dateFin: '2022', missions: ['Surveillance du site', 'SSIAP 1', 'Accueil des visiteurs'] }];
  const pts = inc.pointsCertificationsDansExperience(experiences);
  assert.equal(pts.length, 1);
  assert.equal(pts[0].extrait, 'SSIAP 1');
  assert.match(pts[0].question, /obtenue pendant cette expérience/);
  assert.match(pts[0].question, /année/);
  assert.equal(pts[0].cible.type, 'certifExperience');
  // pas de question pour une mission ordinaire
  assert.equal(inc.pointsCertificationsDansExperience([{ poste: 'X', missions: ['Accueil', 'Caisse'] }]).length, 0);
});

test('réponse « Oui, 2021 » : l’année est ajoutée dans l’expérience et dans les certifications ; « Non, 2018 » la retire de l’expérience', () => {
  const inc = require('../data/incoherencesImport.js');
  const fabrique = () => ({ experiences: [{ poste: 'Agent de sécurité', missions: ['Surveillance', 'SSIAP 1'] }], certifications: ['SSIAP 1'] });
  const cible = { type: 'certifExperience', poste: 'Agent de sécurité', certification: 'SSIAP 1' };
  const oui = fabrique();
  assert.equal(inc.appliquerPrecisionCible(oui, cible, 'Oui, 2021'), true);
  assert.deepEqual(oui.experiences[0].missions, ['Surveillance', 'SSIAP 1 (2021)']);
  assert.deepEqual(oui.certifications, ['SSIAP 1 (2021)']);
  const non = fabrique();
  assert.equal(inc.appliquerPrecisionCible(non, cible, 'Non, 2018'), true);
  assert.deepEqual(non.experiences[0].missions, ['Surveillance']);
  assert.deepEqual(non.certifications, ['SSIAP 1 (2018)']);
  // sans année ni « non » : rien n'est modifié
  const rien = fabrique();
  assert.equal(inc.appliquerPrecisionCible(rien, cible, 'Oui'), false);
  assert.deepEqual(rien.experiences[0].missions, ['Surveillance', 'SSIAP 1']);
  // missions en texte : même résultat
  const texte = { experiences: [{ poste: 'Agent de sécurité', missions: 'Surveillance\n- SSIAP 1' }], certifications: [] };
  assert.equal(inc.appliquerPrecisionCible(texte, cible, 'Oui, 2021'), true);
  assert.equal(texte.experiences[0].missions, 'Surveillance\n- SSIAP 1 (2021)');
  assert.deepEqual(texte.certifications, ['SSIAP 1 (2021)']);
});

test('certification sous une formation : la période de la formation n’est pas recopiée, la question de l’année est posée', () => {
  const jeu = {
    formations: [{ intitule: 'Titre professionnel Plaquiste', annee: '2025 - 2026' }],
    experiences: [],
    certifications: ['Habilitation électrique BS/BEM (IDC PRO, Bergerac, 2025-2026)', 'SST (2022)', 'Module travail en hauteur (2025-2026)']
  };
  const pts = metiers.pointsIncoherencesImport([jeu], []);
  assert.deepEqual(jeu.certifications, ['Habilitation électrique BS/BEM (IDC PRO, Bergerac)', 'SST (2022)', 'Module travail en hauteur']);
  assert.equal(pts.filter((p) => p.titre === 'Année de certification').length, 2);
  const p = pts.find((x) => x.titre === 'Année de certification');
  assert.match(p.question, /En quelle année/);
  assert.equal(inc.appliquerPrecisionCible(jeu, pts[0].cible, 'En 2025'), true);
  assert.equal(jeu.certifications[0], 'Habilitation électrique BS/BEM (IDC PRO, Bergerac, 2025)');
  // une année seule, même égale à celle de la formation, n'est jamais touchée
  const jeu2 = { formations: [{ intitule: 'F', annee: '2025 - 2026' }], certifications: ['SST (2025)'] };
  metiers.pointsIncoherencesImport([jeu2], []);
  assert.deepEqual(jeu2.certifications, ['SST (2025)']);
});

test('certifications sans année : une question chacune, l’année donnée est ajoutée ; une certification déjà datée n’en pose pas', () => {
  const jeu = { certifications: ['Sensibilisation amiante', 'SST (2022)', 'Module travail en hauteur'], formations: [], experiences: [] };
  const pts = metiers.pointsIncoherencesImport([jeu], []).filter((p) => p.titre === 'Année de certification');
  assert.deepEqual(pts.map((p) => p.extrait), ['Sensibilisation amiante', 'Module travail en hauteur']);
  assert.equal(inc.appliquerPrecisionCible(jeu, pts[0].cible, 'En 2023'), true);
  assert.equal(jeu.certifications[0], 'Sensibilisation amiante (2023)');
});

test('réponse de l’assistant (Reformuler) : expériences et formations rangées du plus récent au plus ancien', () => {
  const rep = { propositions: [{ experiences: [
    { poste: 'A', dateDebut: '2021', dateFin: '2021', missions: ['x'] },
    { poste: 'B', dateDebut: '2025', dateFin: '2026', missions: ['x'] },
    { poste: 'C', dateDebut: '2023', dateFin: '2024', missions: ['x'] }], formations: [{ intitule: 'F1', annee: '2016 - 2018' }, { intitule: 'F2', annee: '2025 - 2026' }] }] };
  const r = metiers._reformulerCvParserReponse(JSON.stringify(rep), { extraireJSON: (t) => JSON.parse(t) });
  assert.ok(r.propositions);
  assert.deepEqual(r.propositions[0].struct.experiences.map((e) => e.poste), ['B', 'C', 'A']);
  assert.deepEqual(r.propositions[0].struct.formations.map((f) => f.intitule), ['F2', 'F1']);
});
