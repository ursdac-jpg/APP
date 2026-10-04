/* ============================================================
   tests/conservationInformations.test.js  (C5, 2026-09-26)
   ------------------------------------------------------------
   « Aucune information saisie ne se perd entre le dossier et le CV. »
   Un MARQUEUR unique est place dans chaque champ du dossier (poste, entreprise, lieu, dates, missions, diplome, centre, langue,
   certification, logiciel, loisir, engagement...), puis on verifie qu'il ressort a chaque etape :
     1. l'objet CV normalise ;
     2. la composition (contenu retenu, partage par le PDF et le Word) ;
     3. le HTML du PDF (rendu de la maquette), en A4 et en A4 complet ; en A4 essentiel, le retrait doit etre ANNONCE
        (composition.rubriquesTronquees), jamais silencieux.
   Le moteur de decision (js/app.js, non chargeable en Node) n'est pas dans cette chaine : voir docs/PASSATION_SESSION_2026-09-26.md
   (sortir le moteur de decision de app.js = etape suivante de C5).
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

const racine = path.join(__dirname, '..');
const ctx = { console: console };
ctx.window = ctx; ctx.globalThis = ctx;
ctx.document = {
  getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {},
  createElement: () => ({ style: {}, setAttribute() {}, appendChild() {} }), head: { appendChild() {} }, body: { appendChild() {} }
};
vm.createContext(ctx);
[
  'data/metiers.js', 'modules/cv-core/dates.js', 'modules/cv-core/certifications.js', 'modules/cv-core/extraireDonneesCV.js', 'modules/cv-core/normaliserDonneesCV.js',
  'modules/cv-editor/formatA5CV.js',
  'modules/cv-composeur/composeurProfil.js', 'modules/cv-composeur/composeurComposants.js', 'modules/cv-composeur/composeurRegles.js',
  'modules/cv-composeur/composeurDedoublonnage.js', 'modules/cv-composeur/composeurComposition.js', 'modules/cv-composeur/composeurStrategies.js',
  'modules/cv-composeur/composeurTheme.js',
  'modules/cv-pdf-html/cvPdfDonnees.js', 'modules/cv-pdf-html/cvPdfTemplateA4.js', 'modules/cv-pdf-html/cvPdfCouleursZones.js', 'modules/cv-pdf-html/cvPdfTemplateMaquette.js'
].forEach((f) => vm.runInContext(fs.readFileSync(path.join(racine, f), 'utf8'), ctx, { filename: f }));

function creerDossier() {
  const exp = (n) => ({ poste: 'MKPOSTE' + n, entreprise: 'MKENTREPRISE' + n, lieu: 'MKLIEU' + n, dateDebut: '20' + (10 + n) + '-03', dateFin: '20' + (11 + n) + '-06',
    missions: 'MKMISSION' + n + 'A\nMKMISSION' + n + 'B' });
  const form = (n) => ({ niveau: 'MKNIVEAU' + n, intitule: 'MKDIPLOME' + n, annee: '20' + (10 + n), etablissement: 'MKCENTRE' + n, lieu: 'MKLIEUFORM' + n });
  return {
    objectif: 'offre',
    identite: { civilite: 'Madame', nom: 'MKNOM', prenom: 'MKPRENOM', telephone: '0600000000', email: 'mk@exemple.fr', ville: 'MKVILLE', codePostal: '75000' },
    experiences: [1, 2, 3, 4].map(exp),
    experiencesPerso: [], formations: [1, 2, 3, 4, 5].map(form),
    langues: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({ langue: 'MKLANGUE' + n, niveau: 'B2' })),
    certifications: [1, 2, 3, 4, 5].map((n) => 'MKCERTIF' + n + ' (MKORGANISME' + n + ', 2023)'),
    logiciels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => 'MKLOGICIEL' + n),
    loisirs: [1, 2, 3, 4, 5, 6, 7, 8].map((n) => 'MKLOISIR' + n),
    engagements: [1, 2, 3, 4].map((n) => ({ texte: 'MKENGAGEMENT' + n, dateDebut: '2018', dateFin: '2019', missions: '' })),
    permis: { possede: true, categories: ['B'], vehicule: true },
    valeurs: [], activites: [], actions: [], environnement: [], contrat: [], tempsTravail: []
  };
}
// Insensible a la casse : le rendu met en forme certains noms (ex. la ville « MKVILLE » s'ecrit « Mkville »).
function marqueursAbsents(texte, marqueurs) { const t = String(texte).toLowerCase(); return marqueurs.filter((m) => t.indexOf(m.toLowerCase()) === -1); }
const serie = (prefixe, n) => Array.from({ length: n }, (_, i) => prefixe + (i + 1));

const MARQUEURS_TOUS = [].concat(
  ['MKNOM', 'MKPRENOM', 'MKVILLE'],
  serie('MKPOSTE', 4), serie('MKENTREPRISE', 4), serie('MKLIEU', 4),
  serie('MKDIPLOME', 5), serie('MKCENTRE', 5), serie('MKLANGUE', 8), serie('MKCERTIF', 5), serie('MKLOGICIEL', 10), serie('MKLOISIR', 8),
  serie('MKENGAGEMENT', 4)
);

test('conservation 1/3 : l\'objet CV normalise garde chaque information du dossier', () => {
  const objet = ctx.normaliserDonneesCV(creerDossier());
  const texte = JSON.stringify(objet);
  const absents = marqueursAbsents(texte, MARQUEURS_TOUS.concat(serie('MKMISSION', 4).map((m) => m + 'A'), serie('MKLIEUFORM', 5), serie('MKNIVEAU', 5)));
  assert.strictEqual(absents.length, 0, 'informations perdues a la normalisation : ' + absents.join(', '));
  // les dates des experiences gardent le mois
  assert.ok(texte.indexOf('2011-03') !== -1 && texte.indexOf('2012-06') !== -1);
});

function genererPdf(format) {
  const donnees = ctx.construireDonneesPdfCV(creerDossier(), format, false, false, null);
  const resultat = ctx._pdfConstruireMaquette(donnees.objetCV, donnees.composition, { competencesProfessionnelles: [], competencesComportementales: [] }, '');
  return { donnees, html: resultat.pageHtml || '' };
}

test('conservation 2/3 : PDF A4 (detaille) : formations, langues, loisirs, certifications, logiciels, engagements ne sont plus plafonnes', () => {
  const { html, donnees } = genererPdf('A4-detaille');
  assert.ok(html.length > 500, 'le rendu PDF est vide');
  const attendus = MARQUEURS_TOUS.filter((m) => !/^MKMISSION/.test(m));
  const absents = marqueursAbsents(html, attendus);
  assert.strictEqual(absents.length, 0, 'absents du PDF A4 : ' + absents.join(', '));
  assert.strictEqual((donnees.composition.rubriquesTronquees || []).length, 0);
});

test('conservation 2/3 : PDF A4 complet : idem', () => {
  const { html } = genererPdf('A4-integral');
  const absents = marqueursAbsents(html, MARQUEURS_TOUS.filter((m) => !/^MKMISSION/.test(m)));
  assert.strictEqual(absents.length, 0, 'absents du PDF A4 complet : ' + absents.join(', '));
});

test('conservation 3/3 : PDF A4 essentiel : ce qui est retire est ANNONCE (rubriquesTronquees), jamais silencieux', () => {
  const { html, donnees } = genererPdf('A4-essentiel');
  const tronquees = donnees.composition.rubriquesTronquees || [];
  const noms = tronquees.map((r) => r.nom);
  assert.ok(tronquees.length > 0, 'le test ne verifie rien : A4 essentiel devrait retirer au moins une rubrique de ce dossier charge');
  // chaque rubrique dont un marqueur manque dans le HTML est dans la liste annoncee
  const rubriques = { formations: serie('MKDIPLOME', 5), langues: serie('MKLANGUE', 8), 'centres d’intérêt': serie('MKLOISIR', 8), certifications: serie('MKCERTIF', 5) };
  Object.keys(rubriques).forEach((nom) => {
    const manque = marqueursAbsents(html, rubriques[nom]).length > 0;
    if (manque) { assert.ok(noms.indexOf(nom) !== -1, 'rubrique « ' + nom + ' » tronquee sans etre annoncee'); }
  });
});

test('conservation : les experiences et leurs lieux, dates et missions arrivent au PDF A4', () => {
  const { html } = genererPdf('A4-detaille');
  ['MKPOSTE1', 'MKENTREPRISE1', 'MKPOSTE4', 'MKENTREPRISE4'].forEach((m) => assert.ok(html.indexOf(m) !== -1, m + ' absent'));
  // au moins une mission de chaque experience retenue est visible
  [1, 2, 3, 4].forEach((n) => assert.ok(html.indexOf('MKMISSION' + n + 'A') !== -1, 'mission de l\'experience ' + n + ' absente'));
});

test('conservation : PDF A4 detaille : TOUTES les missions saisies arrivent au CV (plus de coupe fixe, decision Denis 2026-09-29)', () => {
  const { html } = genererPdf('A4-detaille');
  [1, 2, 3, 4].forEach((n) => ['A', 'B'].forEach((l) => assert.ok(html.indexOf('MKMISSION' + n + l) !== -1, 'mission ' + n + l + ' coupee sans avoir ete demandee')));
});

test('conservation : une seule experience avec 7 missions : les 7 arrivent au PDF A4 detaille', () => {
  const dossier = creerDossier();
  dossier.experiences = [{ poste: 'MKPOSTE1', entreprise: 'MKENTREPRISE1', lieu: 'MKLIEU1', dateDebut: '2019', dateFin: '',
    missions: [1, 2, 3, 4, 5, 6, 7].map((n) => 'MKSEPT' + n).join(String.fromCharCode(10)) }];
  const donnees = ctx.construireDonneesPdfCV(dossier, 'A4-detaille', false, false, null);
  const html = (ctx._pdfConstruireMaquette(donnees.objetCV, donnees.composition, { competencesProfessionnelles: [], competencesComportementales: [] }, '').pageHtml) || '';
  const absents = marqueursAbsents(html, serie('MKSEPT', 7));
  assert.strictEqual(absents.length, 0, 'missions coupees : ' + absents.join(', '));
});

test('conservation : les compétences regroupées par thème par l\'assistant sont dans le réservoir de « Choisir » (aucune perdue pour la personne)', () => {
  const themes = [{ theme: 'T1', items: [{ texte: 'MKTH1' }, { texte: 'MKTH2' }] }, { theme: 'T2', items: [{ texte: 'MKTH3' }, { texte: 'MKSF1' }] }];
  const reservoir = ctx.construireReservoirCompetencesPdf({ competences: { savoirFaire: ['MKSF1', 'MKSF2'], savoirs: [], savoirEtre: [] }, competencesGroupeesParTheme: themes, competencesPersonnelles: [] });
  ['MKSF1', 'MKSF2', 'MKTH1', 'MKTH2', 'MKTH3'].forEach((m) => assert.ok(Array.from(reservoir.pro).indexOf(m) !== -1, m + ' absent du réservoir'));
  assert.strictEqual(Array.from(reservoir.pro).filter((m) => m === 'MKSF1').length, 1, 'doublon dans le réservoir');
});

test('LOT 3.0 : toutes les comportementales proposées par l\'assistant (même non gardées) sont dans le réservoir de « Choisir »', () => {
  const objet = { competences: { savoirFaire: [], savoirs: [], savoirEtre: ['MKSE1'] },
    competencesPersonnelles: [{ competence: 'MKCP1' }],
    competencesPersonnellesProposees: [{ competence: 'MKCP1' }, { competence: 'MKCP2' }, { competence: 'MKCP3' }] };
  const reservoir = ctx.construireReservoirCompetencesPdf(objet);
  ['MKSE1', 'MKCP1', 'MKCP2', 'MKCP3'].forEach((m) => assert.ok(Array.from(reservoir.comportementales).indexOf(m) !== -1, m + ' absent'));
  assert.strictEqual(Array.from(reservoir.comportementales).filter((m) => m === 'MKCP1').length, 1, 'doublon');
});

test('LOT 3.4 : les qualités attendues pour le poste s\'ajoutent après les comportementales connues, dans la limite des places ; option décochée : aucune', () => {
  const donnees = ctx.construireDonneesPdfCV(creerDossier(), 'A4-detaille', false, false, null);
  const opts = (extra) => Object.assign({ competencesProfessionnelles: [], competencesComportementales: ['MKCONNUE1', 'MKCONNUE2'], reservoirCompetences: { pro: [], comportementales: ['MKCONNUE1', 'MKCONNUE2', 'MKQ1', 'MKQ2', 'MKQ3', 'MKQ4'] },
    qualitesAttenduesMetier: ['MKQ1', 'MKQ2', 'MKQ3', 'MKQ4'], placesQualitesMetier: 3 }, extra || {});
  const html = (o) => (ctx._pdfConstruireMaquette(donnees.objetCV, donnees.composition, o, '').pageHtml) || '';
  const actif = html(opts());
  ['MKCONNUE1', 'MKCONNUE2', 'MKQ1', 'MKQ2', 'MKQ3'].forEach((m) => assert.ok(actif.indexOf(m) !== -1, m + ' absent'));
  assert.ok(actif.indexOf('MKQ4') === -1, 'au-delà des places laissées, la 4e qualité ne s\'affiche pas d\'office');
  assert.ok(actif.indexOf('MKCONNUE1') < actif.indexOf('MKQ1'), 'les qualités connues passent avant les qualités attendues');
  const inactif = html(opts({ qualitesMetierActives: false }));
  assert.ok(inactif.indexOf('MKCONNUE1') !== -1);
  ['MKQ1', 'MKQ2', 'MKQ3', 'MKQ4'].forEach((m) => assert.ok(inactif.indexOf(m) === -1, m + ' visible alors que l\'option est décochée'));
});
