const { test } = require('node:test');
const assert = require('node:assert/strict');
const { familleVosDocuments } = require('../modules/vos-documents/familles.js');

// Valeurs MESUREES dans le navigateur le 26/10/2026 (docs/mesures_2026-10-26/matrice_vos_documents.REFERENCE.json) :
// chaque cas = les signaux de la famille (comme poses par la sonde) et ce que « Vos documents » affichait.
// Etape 0 de docs/CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md : le registre decrit l'existant, il ne le change pas.
const CAS = [
  { nom: '01 creer a la main', s: { modeCreation: 'nouveau', creationSansAssistant: true, docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'creer-main', barre: 'CREER_CV_SANS', indexBarre: 4, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'accueil' } },
  { nom: '02 creer avec l’assistant', s: { modeCreation: 'nouveau', creationSansAssistant: false, docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'creer-assistant', barre: 'CREER_CV', indexBarre: 5, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'accueil' } },
  { nom: '03 recit', s: { decouverteVersResultats: true, docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'recit', barre: 'DECOUVERTE', indexBarre: 6, titre: 'Vos documents', retour: { type: 'fonction', cible: 'reafficherDecouverteCompetences()' }, fin: 'fenetre-et-maintenant' } },
  { nom: '04 mettre a jour (voie 1)', s: { modeCreation: 'maj', docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'maj', barre: 'MAJ_CV', indexBarre: 4, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'fenetre-et-maintenant' } },
  { nom: '05 reformuler (barre de « Mettre a jour », constat C1)', s: { modeCreation: 'maj', origineReformuler: true, docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'reformuler', barre: 'MAJ_CV', indexBarre: 4, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'accueil' } },
  { nom: '06 voie 3', s: { modeCreation: 'maj', modeFidele: true, docActif: 'cv', origine: 'cv-sans-assistant' },
    attendu: { famille: 'voie3', barre: 'CSA', indexBarre: 4, titre: 'Vos documents', retour: { type: 'route', cible: 'cv-sans-assistant' }, fin: 'fenetre-et-maintenant' } },
  { nom: '07 lettre rapide', s: { modeCreation: 'pret', docActif: 'lettre', origine: 'cv' },
    attendu: { famille: 'pret', barre: 'PREPARER_LETTRE_ENTRETIEN', indexBarre: 4, titre: 'Ma lettre de motivation rapide', retour: { type: 'route', cible: 'cv' }, fin: 'accueil' } },
  { nom: '07 bis entretien rapide', s: { modeCreation: 'pret', docActif: 'entretien', origine: 'cv' },
    attendu: { famille: 'pret', barre: 'PREPARER_LETTRE_ENTRETIEN', indexBarre: 4, titre: 'Ma fiche de préparation à l’entretien', retour: { type: 'route', cible: 'cv' }, fin: 'fenetre-effacement' } },
  { nom: '08 ecrire ma lettre', s: { origineCoLettre: true, docActif: 'lettre', origine: 'cv' },
    attendu: { famille: 'co-lettre', barre: 'CO_LETTRE', indexBarre: 3, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'accueil' } },
  { nom: '09 m’entrainer a l’entretien', s: { docActif: 'entretien', origine: 'prepa-entretien' },
    attendu: { famille: 'prepa-entretien', barre: 'PREPA_ENTRETIEN', indexBarre: 3, titre: 'Votre préparation d’entretien', retour: { type: 'route', cible: 'prepa-entretien' }, fin: 'fenetre-effacement' } },
  { nom: '10 un CV, plusieurs metiers', s: { modeCreation: 'maj', docActif: 'cv', origine: 'un-cv-plusieurs-metiers' },
    attendu: { famille: 'ucpm', barre: 'UCPM', indexBarre: 2, titre: 'Vos documents', retour: { type: 'fonction', cible: 'ucpmRetourDepuisEditeur()' }, fin: 'fenetre-et-maintenant' } },
  { nom: '11 bilan', s: { docActif: 'cv', origine: 'bilan' },
    attendu: { famille: 'bilan', barre: 'ANCIENNE', indexBarre: null, titre: 'Vos documents', retour: { type: 'route', cible: 'bilan' }, fin: 'fenetre-et-maintenant' } },
  { nom: '12 arrivee directe', s: { docActif: 'cv', origine: 'cv' },
    attendu: { famille: 'direct', barre: 'ANCIENNE', indexBarre: null, titre: 'Vos documents', retour: { type: 'route', cible: 'cv' }, fin: 'fenetre-et-maintenant' } }
];

CAS.forEach(function (c) {
  test('famille ' + c.nom + ' : barre, titre, retour et fin comme mesures', () => {
    assert.deepEqual(familleVosDocuments(c.s), c.attendu);
  });
});

test('precedence : l’essai de modeles l’emporte sur tout', () => {
  const r = familleVosDocuments({ essaiModeles: true, modeCreation: 'nouveau', decouverteVersResultats: true, docActif: 'cv' });
  assert.equal(r.famille, 'essai-modeles');
  assert.equal(r.titre, 'Nos modèles de CV');
});

test('precedence : la voie 3 passe avant le recit et avant « Mettre a jour »', () => {
  assert.equal(familleVosDocuments({ origine: 'cv-sans-assistant', modeFidele: true, decouverteVersResultats: true, modeCreation: 'maj', docActif: 'cv' }).famille, 'voie3');
});

test('precedence : le recit passe avant « Un CV, plusieurs metiers » et avant les modes de creation', () => {
  assert.equal(familleVosDocuments({ decouverteVersResultats: true, origine: 'un-cv-plusieurs-metiers', modeCreation: 'nouveau', docActif: 'cv' }).famille, 'recit');
});

test('precedence : l’entretien du module d’entrainement passe avant « J’ai deja un CV »', () => {
  assert.equal(familleVosDocuments({ origine: 'prepa-entretien', docActif: 'entretien', modeCreation: 'pret' }).famille, 'prepa-entretien');
});

test('un parcours « origine prepa-entretien » sur un CV (document actif cv) ne prend pas la barre de l’entretien', () => {
  assert.notEqual(familleVosDocuments({ origine: 'prepa-entretien', docActif: 'cv' }).famille, 'prepa-entretien');
});

test('la lettre deja importee suffit a reconnaitre « Ecrire ma lettre » (memes signaux que afficherProgression)', () => {
  assert.equal(familleVosDocuments({ lettreDejaImportee: true, docActif: 'lettre', origine: 'cv' }).famille, 'co-lettre');
});

test('recit termine : tous les reperes sont verts (index 7), sinon le repere « Mon CV » est courant (index 6)', () => {
  assert.equal(familleVosDocuments({ decouverteVersResultats: true, cvTermine: true, docActif: 'cv' }).indexBarre, 7);
  assert.equal(familleVosDocuments({ decouverteVersResultats: true, cvTermine: false, docActif: 'cv' }).indexBarre, 6);
});

test('un aspect du module « Un CV, plusieurs metiers » est la page 5 de sa barre, la reference la page 3', () => {
  assert.equal(familleVosDocuments({ origine: 'un-cv-plusieurs-metiers', aspectUcpm: true, docActif: 'cv' }).indexBarre, 4);
  assert.equal(familleVosDocuments({ origine: 'un-cv-plusieurs-metiers', aspectUcpm: false, docActif: 'cv' }).indexBarre, 2);
});

test('retour : import direct de session = page d’avant l’import, repli accueil', () => {
  assert.deepEqual(familleVosDocuments({ importDirect: true, pageAvantImport: 'bilan', docActif: 'cv' }).retour, { type: 'route', cible: 'bilan' });
  assert.deepEqual(familleVosDocuments({ importDirect: true, docActif: 'cv' }).retour, { type: 'route', cible: 'cv' });
});

test('retour : sans origine connue, repli « Votre profil » (comme resultatsCibleRetour)', () => {
  assert.deepEqual(familleVosDocuments({ docActif: 'cv' }).retour, { type: 'route', cible: 'revelation' });
});

test('fin : la regle de Denis (pas de fenetre si la page propose deja la suite) s’applique aujourd’hui a « nouveau », Reformuler et la lettre seulement', () => {
  assert.equal(familleVosDocuments({ modeCreation: 'nouveau', docActif: 'cv' }).fin, 'accueil');
  assert.equal(familleVosDocuments({ modeCreation: 'maj', origineReformuler: true, docActif: 'cv' }).fin, 'accueil');
  assert.equal(familleVosDocuments({ modeCreation: 'maj', docActif: 'lettre' }).fin, 'accueil');
  // Constat C17 : les autres CV ouvrent « Et maintenant ? » alors que la page propose deja la suite ; ce test change quand la decision de Denis est appliquee.
  assert.equal(familleVosDocuments({ modeCreation: 'maj', docActif: 'cv' }).fin, 'fenetre-et-maintenant');
  assert.equal(familleVosDocuments({ decouverteVersResultats: true, docActif: 'cv' }).fin, 'fenetre-et-maintenant');
});

test('sans signaux : ne plante pas et retombe sur l’arrivee directe', () => {
  assert.equal(familleVosDocuments().famille, 'direct');
  assert.equal(familleVosDocuments({}).barre, 'ANCIENNE');
});

// Filet croise : le titre du registre doit rester egal au H1 releve dans le navigateur (fichier de reference de la matrice de mesure).
test('les titres du registre sont ceux de la matrice de reference mesuree dans le navigateur', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const ref = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'docs', 'mesures_2026-10-26', 'matrice_vos_documents.REFERENCE.json'), 'utf8'));
  const parNom = Object.fromEntries(ref.map(function (r) { return [r.nom, r]; }));
  const correspondance = { '01-nouveau-main': 0, '02-nouveau-assistant': 1, '03-recit': 2, '04-maj': 3, '05-reformuler': 4, '06-voie3': 5, '07-pret-lettre': 6, '09-prepa-entretien': 9, '10-ucpm': 10, '11-bilan': 11, '12-direct': 12 };
  Object.keys(correspondance).forEach(function (nom) {
    const cas = CAS.filter(function (c) { return c.nom.indexOf(nom.slice(0, 2)) === 0 && c.nom.indexOf('bis') === -1; })[0];
    const h1 = parNom[nom].h1.replace(/^\S+\s+/, '');   // retire l'icone « 📄 »
    assert.equal(familleVosDocuments(cas.s).titre, h1, nom);
  });
});
