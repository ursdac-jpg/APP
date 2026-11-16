const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const etape = require('../modules/missions-competences/etape.js');
const moteur = require('../modules/cv-core/moteurDecisionCV.js');

// Consigne 318 : les compléments de l'assistant (doublons de sens, versions plus courtes, compétences en plus) dans « La mise en page ».
const racine = path.join(__dirname, '..');
const cartes = fs.readFileSync(path.join(racine, 'modules', 'cv-pdf-html', 'cvPdfCartesMaquette.js'), 'utf8');
const app = fs.readFileSync(path.join(racine, 'js', 'app.js'), 'utf8');
const css = fs.readFileSync(path.join(racine, 'css', 'mise-en-page-maquette.css'), 'utf8');

const segments = ['Aider les patients à la toilette', 'Effectuer les soins d’hygiène des patients.', 'Surveiller l’état de santé des patients et alerter l’infirmière', 'Distribuer les repas'];

test('doublons : les deux lignes sont retrouvées (casse et point ignorés) ; une ligne reformulée ou identique = rien n’est montré', () => {
  assert.deepEqual(etape.mcRangsDoublon({ lignes: ['aider les patients à la toilette.', 'Effectuer les soins d’hygiène des patients'] }, segments), [0, 1]);
  assert.equal(etape.mcRangsDoublon({ lignes: ['Aider les patients à la toilette', 'Une ligne que la personne n’a pas'] }, segments), null);
  assert.equal(etape.mcRangsDoublon({ lignes: ['Distribuer les repas', 'distribuer les repas.'] }, segments), null);
  assert.equal(etape.mcRangsDoublon({ lignes: ['seule'] }, segments), null);
  assert.equal(etape.mcRangsDoublon(null, segments), null);
});

test('doublons : garder la première retire la seconde, et inversement ; garder les deux ou sans choix ne retire rien', () => {
  assert.deepEqual(etape.mcRangsARetirer('premiere', [0, 1]), [1]);
  assert.deepEqual(etape.mcRangsARetirer('seconde', [0, 1]), [0]);
  assert.deepEqual(etape.mcRangsARetirer('deux', [0, 1]), []);
  assert.deepEqual(etape.mcRangsARetirer('', [0, 1]), []);
  assert.deepEqual(etape.mcRangsARetirer('premiere', null), []);
});

test('compétences en plus : famille par type, sans doublon, sans ce que la personne a déjà, les ajoutées restent cochées', () => {
  const entrees = [
    { competence: 'Utiliser un lève-personne', type: 'savoirFaire', justification: 'Vous citez le transfert des patients.' },
    { competence: 'Patience', type: 'savoirEtre', justification: 'Vu au bénévolat.' },
    { competence: 'patience', type: 'savoirEtre', justification: 'doublon' },
    { competence: 'Soins d’hygiène', type: 'savoirFaire', justification: 'déjà dans la liste' },
    { competence: 'Rigueur', type: 'savoirEtre', justification: 'ajoutée par un clic' },
    { competence: '', type: 'savoirFaire' }
  ];
  const r = etape.mcCompetencesEnPlusAffichables(entrees, ['Soins d’hygiène'], ['Écoute'], { comp: ['Rigueur'] });
  assert.deepEqual(r.pro.map((x) => x.nom), ['Utiliser un lève-personne']);
  assert.equal(r.pro[0].pourquoi, 'Vous citez le transfert des patients.');
  assert.deepEqual(r.comp.map((x) => x.nom + ':' + x.ajoutee), ['Patience:false', 'Rigueur:true']);
  assert.equal(etape.mcFamilleCompetenceEnPlus('savoirEtre'), 'comp');
  assert.equal(etape.mcFamilleCompetenceEnPlus('savoirFaire'), 'pro');
  assert.deepEqual(etape.mcCompetencesEnPlusAffichables(undefined, undefined, undefined, undefined), { pro: [], comp: [] });
});

test('compétences en plus : ce que l’assistant a déjà cité ailleurs dans sa réponse n’est pas reproposé (consigne 320), sauf si la personne l’a ajouté', () => {
  const reco = {
    competencesAValoriser: [{ competence: 'Transmission des observations' }],
    competencesPersonnelles: [{ competence: 'Sens de l’observation' }],
    competencesPersonnellesProposees: ['Réactivité']
  };
  const noms = etape.mcNomsDejaCites(reco);
  assert.deepEqual(noms, ['Transmission des observations', 'Sens de l’observation', 'Réactivité']);
  const entrees = [
    { competence: 'transmission des observations', type: 'savoirFaire', justification: 'a' },
    { competence: 'Sens de l’observation', type: 'savoirEtre', justification: 'b' },
    { competence: 'Réactivité', type: 'savoirEtre', justification: 'c' },
    { competence: 'Utiliser un lève-personne', type: 'savoirFaire', justification: 'd' }
  ];
  const r = etape.mcCompetencesEnPlusAffichables(entrees, [], [], {}, noms);
  assert.deepEqual(r.pro.map((x) => x.nom), ['Utiliser un lève-personne']);
  assert.deepEqual(r.comp, []);
  const r2 = etape.mcCompetencesEnPlusAffichables(entrees, [], [], { comp: ['Réactivité'] }, noms);
  assert.deepEqual(r2.comp.map((x) => x.nom + ':' + x.ajoutee), ['Réactivité:true']);
  assert.deepEqual(etape.mcNomsDejaCites(undefined), []);
  assert.ok(cartes.includes('mcNomsDejaCites(reco)'), 'l’écran passe les noms déjà cités');
});

test('versions plus courtes : la ligne de la personne reste affichée ; utilisée = la version courte figure dans la liste du CV', () => {
  const entree = { ligne: segments[2], plusCourte: 'Surveiller les patients.' };
  const avant = etape.mcVersionsCourtesParRang([entree], segments);
  assert.equal(avant[2].utilisee, false);
  assert.equal(avant[2].origine, segments[2]);
  const apres = etape.mcVersionsCourtesParRang([entree], ['a', 'b', 'Surveiller les patients', 'c']);
  assert.equal(apres[2].utilisee, true, 'la version courte est retrouvée à sa place');
  assert.equal(apres[2].origine, segments[2], 'le texte montré reste celui de la personne');
  assert.deepEqual(etape.mcVersionsCourtesParRang([{ ligne: 'Absente', plusCourte: 'x' }], segments), {});
  assert.deepEqual(etape.mcVersionsCourtesParRang([{ ligne: segments[0] }], segments), {});
});

test('moteur du CV : la version courte remplace la ligne seulement quand elle est utilisée, le point final est repris', () => {
  const texte = 'Aider à la toilette.\nSurveiller l’état de santé des patients, alerter l’infirmière.\nServir les repas.';
  const c = { ligne: 'Surveiller l’état de santé des patients, alerter l’infirmière', plusCourte: 'Surveiller les patients.' };
  assert.equal(moteur.appliquerVersionsCourtesCV(texte, [c]), 'Aider à la toilette.\nSurveiller les patients.\nServir les repas.');
  assert.equal(moteur.appliquerVersionsCourtesCV(texte, []), texte);
  assert.equal(moteur.appliquerVersionsCourtesCV('Sans point\nAutre', [{ ligne: 'Sans point', plusCourte: 'Court.' }]), 'Court\nAutre');
  assert.equal(moteur.appliquerVersionsCourtesCV(undefined, [c]), undefined);
});

test('moteur du CV : appliquerMoteurDecisionCV n’utilise la version courte que pour l’expérience concernée et quand utilisee est vrai', () => {
  const objetCV = { experiences: [
    { poste: 'Aide-soignant', entreprise: 'Hôpital', missions: 'Aider à la toilette.\nSurveiller l’état de santé des patients, alerter l’infirmière.' },
    { poste: 'Caissier', entreprise: 'Super U', missions: 'Surveiller l’état de santé des patients, alerter l’infirmière.' }
  ], formations: [], langues: [], certifications: [], loisirs: [], engagements: [], competences: { savoirFaire: [], savoirEtre: [], savoirs: [] } };
  const entree = { poste: 'Aide-soignant', entreprise: 'Hôpital', ligne: 'Surveiller l’état de santé des patients, alerter l’infirmière', plusCourte: 'Surveiller les patients.' };
  const reco = (utilisee) => ({ experiencesAMettreEnAvant: [{ poste: 'Aide-soignant', entreprise: 'Hôpital' }, { poste: 'Caissier', entreprise: 'Super U' }], missionsPlusCourtes: [Object.assign({}, entree, utilisee === undefined ? {} : { utilisee })] });
  global.dossier = { pdfReglages: {} };
  const sans = moteur.appliquerMoteurDecisionCV(JSON.parse(JSON.stringify(objetCV)), reco(undefined), {});
  assert.ok(sans.experiences[0].missions.includes('alerter l’infirmière'), 'sans clic : la phrase d’origine');
  const avec = moteur.appliquerMoteurDecisionCV(JSON.parse(JSON.stringify(objetCV)), reco(true), {});
  const aide = avec.experiences.filter((e) => e.poste === 'Aide-soignant')[0], caissier = avec.experiences.filter((e) => e.poste === 'Caissier')[0];
  assert.ok(aide.missions.includes('Surveiller les patients.') && !aide.missions.includes('alerter'), 'avec clic : la version courte');
  assert.ok(caissier.missions.includes('alerter l’infirmière'), 'une autre expérience n’est pas touchée');
  delete global.dossier;
});

test('l’écran : cartes, gestionnaires et styles sont en place, derrière MC_OUVERT, sans tiret long', () => {
  ['_mepComplementsExperience', '_mepHtmlDoublonsExperience', '_mepHtmlInvitationCourtes', '_mepHtmlCompetencesEnPlus', 'data-mep-exp-doublon', 'data-mep-exp-courte', 'data-mep-comp-plus', 'Pourquoi : '].forEach((m) => assert.ok(cartes.includes(m), m));
  assert.ok(cartes.includes("MC_OUVERT !== 'undefined' && MC_OUVERT === true") || cartes.includes("typeof MC_OUVERT !== 'undefined' && MC_OUVERT === true"));
  ['data-mep-exp-doublon', 'data-mep-exp-courte', 'data-mep-comp-plus'].forEach((m) => assert.ok(app.includes("'[" + m + "]'"), 'gestionnaire ' + m));
  assert.ok(app.includes("_mepDefinirChoixMq('competencesAjoutees'"));
  ['.complement-assistant', '.ligne-courte', '.champ-comp-plus', 'small.pourquoi', '.conseil-missions.ok'].forEach((m) => assert.ok(css.includes(m), m));
  const bloc = css.slice(css.indexOf('Compléments de l\'assistant (consigne 318'));
  assert.ok(!bloc.includes(String.fromCharCode(0x2013)) && !bloc.includes(String.fromCharCode(0x2014)));
});
