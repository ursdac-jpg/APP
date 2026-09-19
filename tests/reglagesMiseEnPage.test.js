const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  REGLAGES_MISE_EN_PAGE_CHAMPS,
  reglagesMiseEnPageParDefaut,
  reglageMiseEnPageValide,
  fusionnerReglagesMiseEnPage
} = require('../modules/cv-mise-en-page/reglagesMiseEnPage.js');

// --- Defauts repris A L'IDENTIQUE de _PDF_ETAT_DEFAUT / defauts Word / A5
//     (INVENTAIRE_REGLAGES_CV_2026-09-02.md sect. J.4 / J.6). Ce bloc est le
//     garde-fou : si un defaut derive, le test tombe.
const DEFAUTS_ATTENDUS = {
  format: 'a4-detaille',
  colonnes: '2',
  taille: 11,
  echelleA5: 11,
  colonnesInversees: false,
  separateurColonnes: false,
  formeColonnes: 'rectangle',
  largeurColonneGauche: 35,
  accent: '#2f6690',
  accentClair: '#d9e8f2',
  fondColonnes: 'droite',
  fondColonnesEffet: 'fondSeul',
  degradeColonnes: 'fonce-clair',
  fondColonnePleineHauteur: false,
  texteFondColonnes: 'blanc',
  couleurFondCompetences: '#e9e9e9',
  couleurTextePuces: '#1b1b1b',
  bandeauEnTete: true,
  formeEnTete: 'rectangle',
  degradeBandeau: 'fonce-clair',
  bandeauDisponibilite: false,
  dispositionEntete: '3colonnes',
  anneauPhoto: false,
  positionLibreEntete: true,
  largeurAccrocheLibre: 30,
  largeurMetierLibre: 32,
  police: 'segoe',
  styleTitres: 'souligne',
  lectureGuidee: false,
  styleCompetences: 'pastille',
  icones: false,
  iconesCoordonnees: false,
  styleBordures: 'fine',
  styleProfessionnel: 'epure',
  stylePersonnel: 'epure',
  bandeauCompetencesCles: false,
  coinsArrondis: false,
  ordreExperiences: 'pertinence',
  formatExperiences: 'standard',
  sansAccroche: false,
  accrocheItalique: false,
  ordreDatesPoste: 'poste',
  lettreJointe: false,
  regroupement: false,
  formationsMisesEnAvant: false,
  fondColonnesA5: 'droite',
  enteteInverseeA5: false,
  remplirPageA5: false,
  allure: 'defaut',
  formations: 'complet'
};

test('reglagesMiseEnPage : les defauts documentes sont respectes A L\'IDENTIQUE', () => {
  const d = reglagesMiseEnPageParDefaut();
  Object.keys(DEFAUTS_ATTENDUS).forEach((cle) => {
    assert.deepEqual(d[cle], DEFAUTS_ATTENDUS[cle], `defaut inattendu pour "${cle}"`);
  });
});

test('reglagesMiseEnPage : les 6 cases "mettre en evidence" sont toutes false', () => {
  const d = reglagesMiseEnPageParDefaut();
  assert.deepEqual(d.souligner, { poste: false, dates: false, entreprise: false });
  assert.deepEqual(d.italique, { poste: false, dates: false, entreprise: false });
});

test('reglagesMiseEnPage : liste unique des rubriques = tout visible par defaut', () => {
  const d = reglagesMiseEnPageParDefaut();
  Object.keys(d.rubriques).forEach((k) => assert.equal(d.rubriques[k], true, k));
  assert.ok('logiciels' in d.rubriques, 'la rubrique "logiciels" doit figurer dans la liste');
});

test('reglagesMiseEnPage : ordreRubriques par defaut = [] (ordre automatique du moteur)', () => {
  assert.deepEqual(reglagesMiseEnPageParDefaut().ordreRubriques, []);
});

test('reglagesMiseEnPage : chaque champ du schema a un defaut valide pour son propre type', () => {
  const d = reglagesMiseEnPageParDefaut();
  Object.keys(REGLAGES_MISE_EN_PAGE_CHAMPS).forEach((cle) => {
    const champ = REGLAGES_MISE_EN_PAGE_CHAMPS[cle];
    // seul cas admis ou le defaut n'est pas "valide" au sens strict : un hex
    // optionnel a null (separateurCouleur).
    if (champ.type === 'hex' && d[cle] === null) { return; }
    assert.ok(reglageMiseEnPageValide(cle, d[cle]), `defaut invalide pour "${cle}" (type ${champ.type})`);
  });
});

test('reglagesMiseEnPage : chaque enum a au moins 2 valeurs et un defaut dans la liste', () => {
  Object.keys(REGLAGES_MISE_EN_PAGE_CHAMPS).forEach((cle) => {
    const champ = REGLAGES_MISE_EN_PAGE_CHAMPS[cle];
    if (champ.type !== 'enum') { return; }
    assert.ok(Array.isArray(champ.valeurs) && champ.valeurs.length >= 2, `${cle} : enum sans valeurs`);
    assert.ok(champ.valeurs.indexOf(champ.defaut) !== -1, `${cle} : defaut hors de la liste`);
  });
});

test('reglagesMiseEnPage : parDefaut() renvoie un objet NEUF a chaque appel (pas de partage de reference)', () => {
  const a = reglagesMiseEnPageParDefaut();
  const b = reglagesMiseEnPageParDefaut();
  a.rubriques.langues = false;
  a.souligner.poste = true;
  a.ordreRubriques.push('experiences');
  assert.equal(b.rubriques.langues, true);
  assert.equal(b.souligner.poste, false);
  assert.deepEqual(b.ordreRubriques, []);
});

test('reglageMiseEnPageValide : accepte le bon, refuse le mauvais', () => {
  assert.ok(reglageMiseEnPageValide('colonnes', '1'));
  assert.ok(!reglageMiseEnPageValide('colonnes', '3'));
  assert.ok(reglageMiseEnPageValide('accent', '#abcdef'));
  assert.ok(!reglageMiseEnPageValide('accent', 'bleu'));
  assert.ok(reglageMiseEnPageValide('taille', 12.5));
  assert.ok(!reglageMiseEnPageValide('taille', 20));
  assert.ok(reglageMiseEnPageValide('bandeauEnTete', false));
  assert.ok(!reglageMiseEnPageValide('bandeauEnTete', 'oui'));
  assert.ok(!reglageMiseEnPageValide('champInexistant', 'x'));
  assert.ok(reglageMiseEnPageValide('souligner', { poste: true }));
  assert.ok(!reglageMiseEnPageValide('souligner', { poste: 'x' }));
  assert.ok(!reglageMiseEnPageValide('souligner', { inconnu: true }));
});

test('fusionnerReglagesMiseEnPage : applique le valide, ignore l\'invalide et l\'inconnu', () => {
  const base = reglagesMiseEnPageParDefaut();
  const out = fusionnerReglagesMiseEnPage(base, {
    colonnes: '1',            // valide
    taille: 999,              // invalide -> ignore
    accent: 'rouge',          // invalide -> ignore
    champBidon: 42,           // inconnu -> ignore
    lectureGuidee: true       // valide
  });
  assert.equal(out.colonnes, '1');
  assert.equal(out.taille, 11);           // inchange
  assert.equal(out.accent, '#2f6690');    // inchange
  assert.equal(out.lectureGuidee, true);
  assert.ok(!('champBidon' in out));
  // base non mutee
  assert.equal(base.colonnes, '2');
  assert.equal(base.lectureGuidee, false);
});

test('fusionnerReglagesMiseEnPage : les map fusionnent clef par clef', () => {
  const base = reglagesMiseEnPageParDefaut();
  const out = fusionnerReglagesMiseEnPage(base, {
    souligner: { poste: true },                 // dates/entreprise inchanges
    rubriques: { loisirs: false, inconnue: true } // inconnue ignoree
  });
  assert.deepEqual(out.souligner, { poste: true, dates: false, entreprise: false });
  assert.equal(out.rubriques.loisirs, false);
  assert.equal(out.rubriques.langues, true);
  assert.ok(!('inconnue' in out.rubriques));
  assert.equal(base.souligner.poste, false); // base non mutee
});

test('fusionnerReglagesMiseEnPage : patch absent / null -> copie neuve du socle', () => {
  const base = reglagesMiseEnPageParDefaut();
  const out = fusionnerReglagesMiseEnPage(base, null);
  assert.deepEqual(out, base);
  out.colonnes = '1';
  assert.equal(base.colonnes, '2');
});
