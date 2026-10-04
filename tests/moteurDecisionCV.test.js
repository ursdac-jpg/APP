/* ============================================================
   tests/moteurDecisionCV.test.js  (C5, 2026-09-26)
   ------------------------------------------------------------
   Le moteur de decision de candidature (modules/cv-core/moteurDecisionCV.js, sorti de js/app.js) est maintenant testable :
   - C1 : une experience AJOUTEE APRES l'ecran de choix n'est jamais absente du CV (bug reel du 26/09), alors qu'une experience
          examinee puis decochee reste exclue ;
   - C3 : une rubrique masquee par l'assistant est signalee, et reaffichee sur demande ; langues et loisirs ne sont jamais masques ;
   - aucun plafond quand aucune capacite n'est fournie (PDF).
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
function creerContexte(dossier) {
  const ctx = { console: console };
  ctx.window = ctx; ctx.globalThis = ctx;
  ctx.document = { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
    createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: { appendChild() {} } };
  vm.createContext(ctx);
  ['data/metiers.js', 'modules/cv-core/dates.js', 'modules/cv-core/extraireDonneesCV.js', 'modules/cv-core/normaliserDonneesCV.js', 'modules/cv-core/moteurDecisionCV.js']
    .forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));
  ctx.dossier = dossier;
  return ctx;
}
function dossierDeBase() {
  // Des intitules DISTINCTS (le moteur rapproche les postes par mots significatifs : « Poste 1 » et « Poste 3 » seraient jugés identiques).
  const noms = [['Chargée de formation', 'Allianz'], ['Hôtesse d’accueil', 'Groupe Pénélope'], ['Responsable de site', 'Montrouge Services']];
  const exp = (n) => ({ poste: noms[n - 1][0], entreprise: noms[n - 1][1], lieu: '', dateDebut: '201' + n, dateFin: '201' + (n + 1), missions: 'Mission ' + n });
  return {
    identite: { nom: 'Test', prenom: 'Camille' }, experiences: [1, 2, 3].map(exp), experiencesPerso: [], formations: [], certifications: ['SST', 'PSC1', 'TOEIC'],
    langues: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ langue: 'Langue' + n, niveau: 'B2' })), loisirs: ['Judo', 'Salsa'], logiciels: [], engagements: [],
    permis: {}, valeurs: [], activites: [], actions: [], environnement: []
  };
}
const postes = (objet) => objet.experiences.map((e) => e.poste);

test('C1 : une experience ajoutee apres l\'ecran de choix est ajoutee au CV ; une experience decochee reste exclue', () => {
  const dossier = dossierDeBase();
  const ctx = creerContexte(dossier);
  const objetCV = ctx.normaliserDonneesCV(dossier);
  // L'ecran de choix a examine les experiences 1 et 2 : la personne a GARDE la 1 et DECOCHE la 2. L'experience 3 a ete ajoutee apres.
  const reco = {
    experiencesAMettreEnAvant: [{ poste: 'Chargée de formation', entreprise: 'Allianz', justification: 'x' }],
    savoirFaireParExperienceProposees: [{ poste: 'Chargée de formation', entreprise: 'Allianz', missions: [] }, { poste: 'Hôtesse d’accueil', entreprise: 'Groupe Pénélope', missions: [] }]
  };
  const decide = ctx.appliquerMoteurDecisionCV(objetCV, reco, {});
  const p = postes(decide);
  assert.ok(p.indexOf('Chargée de formation') !== -1, 'l\'experience gardee doit rester');
  assert.ok(p.indexOf('Responsable de site') !== -1, 'l\'experience ajoutee apres le choix doit apparaitre sur le CV');
  assert.ok(p.indexOf('Hôtesse d’accueil') === -1, 'l\'experience decochee doit rester exclue');
});

test('sans recommandation, toutes les experiences sont conservees', () => {
  const dossier = dossierDeBase();
  const ctx = creerContexte(dossier);
  const decide = ctx.appliquerMoteurDecisionCV(ctx.normaliserDonneesCV(dossier), {}, {});
  assert.strictEqual(decide.experiences.length, 3);
});

test('C3 : une rubrique masquee par l\'assistant est signalee ; « reafficher » la remet', () => {
  const dossier = dossierDeBase();
  const ctx = creerContexte(dossier);
  const objetCV = ctx.normaliserDonneesCV(dossier);
  const reco = { rubriquesMasquables: [{ rubrique: 'Certifications', justification: 'peu utile' }] };
  let decide = ctx.appliquerMoteurDecisionCV(objetCV, reco, {});
  assert.strictEqual(decide.certifications.length, 0);
  const signalees = decide.rubriquesMasqueesParAssistant;
  assert.strictEqual(signalees.length, 1);
  assert.strictEqual(signalees[0].cle, 'certifications');
  assert.strictEqual(signalees[0].nb, 3);
  assert.strictEqual(signalees[0].reaffichee, false);
  dossier.rubriquesReaffichees = ['certifications'];
  decide = ctx.appliquerMoteurDecisionCV(objetCV, reco, {});
  assert.strictEqual(decide.certifications.length, 3);
  assert.strictEqual(decide.rubriquesMasqueesParAssistant[0].reaffichee, true);
});

test('les langues et les loisirs ne sont jamais masques, meme si l\'assistant le recommande', () => {
  const dossier = dossierDeBase();
  const ctx = creerContexte(dossier);
  const reco = { rubriquesMasquables: [{ rubrique: 'Langues', justification: 'x' }, { rubrique: 'Centres d\'intérêt', justification: 'x' }, { rubrique: 'loisirs', justification: 'x' }] };
  const decide = ctx.appliquerMoteurDecisionCV(ctx.normaliserDonneesCV(dossier), reco, {});
  assert.strictEqual(decide.langues.length, 8);
  assert.strictEqual(decide.loisirs.length, 2);
});

test('aucune capacite fournie = aucun plafond sur les listes (langues)', () => {
  const dossier = dossierDeBase();
  const ctx = creerContexte(dossier);
  const decide = ctx.appliquerMoteurDecisionCV(ctx.normaliserDonneesCV(dossier), {}, {});
  assert.strictEqual(decide.langues.length, 8);
});

test('estDoublonProbable / texteExisteDeja : comparaison insensible a la casse et aux espaces', () => {
  const ctx = creerContexte(dossierDeBase());
  assert.strictEqual(ctx.texteExisteDeja(['Excel', 'Word'], ' excel '), true);
  assert.strictEqual(ctx.texteExisteDeja(['Excel'], 'Access'), false);
  assert.strictEqual(ctx.estDoublonProbable({ poste: 'Chargée', entreprise: 'Allianz' }, { poste: 'chargée ', entreprise: 'ALLIANZ' }, ['poste', 'entreprise']), true);
  assert.strictEqual(ctx.estDoublonProbable({ poste: 'A', entreprise: 'B' }, { poste: 'A', entreprise: 'C' }, ['poste', 'entreprise']), false);
});

test('R8-3 : une experience personnelle remontee en professionnel par la personne survit aux recommandations de l\'assistant', () => {
  const dossier = dossierDeBase();
  dossier.experiencesPerso = [
    { intitule: 'Accompagnement de personnes âgées', detail: '', dateDebut: '2015', dateFin: '', missions: 'Aide aux repas', remonteeEnPro: true },
    { intitule: 'Gestion du foyer', detail: '', dateDebut: '2010', dateFin: '2014', missions: '' }
  ];
  const ctx = creerContexte(dossier);
  const objetCV = ctx.normaliserDonneesCV(dossier);
  const reco = { experiencesAMettreEnAvant: [{ poste: 'Chargée de formation', entreprise: 'Allianz', justification: 'x' }] };
  const decide = ctx.appliquerMoteurDecisionCV(objetCV, reco, {});
  const p = postes(decide);
  assert.strictEqual(p.filter((x) => x === 'Accompagnement de personnes âgées').length, 1, 'presente une seule fois en professionnel');
  assert.deepStrictEqual(Array.from(decide.experiencesPersonnelles.map((e) => e.intitule)), ['Gestion du foyer'], 'et absente de la rubrique personnelle');
});

test('LOT 3.3 : les qualités attendues pour le poste écartent les entrées vides et les doublons du savoir-être connu et des qualités de l\'assistant', () => {
  const dossier = dossierDeBase();
  dossier.competences = { savoirFaire: [], savoirs: [], savoirEtre: ['Patience', 'Écoute'] };
  const ctx = creerContexte(dossier);
  const objetCV = ctx.normaliserDonneesCV(dossier);
  // Le savoir-être du dossier vient de js/app.js (non chargé en Node) : fourni directement.
  objetCV.competences = { savoirFaire: [], savoirs: [], savoirEtre: ['Patience', 'Écoute'] };
  const reco = {
    competencesPersonnelles: [{ competence: 'Empathie', source: 's', justification: '' }],
    competencesPersonnellesProposees: [{ competence: 'Empathie', source: 's', justification: '' }, { competence: 'Fiabilité', source: 's', justification: '' }],
    competencesAttenduesMetier: [
      { competence: 'Discipline', justification: 'attendue' }, { competence: '', justification: 'vide' }, { competence: 'Écoute active', justification: 'double le savoir-être connu' },
      { competence: 'Empathie', justification: 'double une proposition' }, { competence: 'Fiabilité', justification: 'double une proposition non gardée' },
      { competence: 'Sens de la hiérarchie', justification: 'attendue' }, { competence: 'Discipline', justification: 'répétée' }
    ]
  };
  const decide = ctx.appliquerMoteurDecisionCV(objetCV, reco, {});
  assert.deepStrictEqual(Array.from(decide.competencesAttenduesMetier.map((c) => c.competence)), ['Discipline', 'Sens de la hiérarchie']);
});
