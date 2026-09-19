const { test } = require('node:test');
const assert = require('node:assert/strict');
const { reglagesMiseEnPageParDefaut, fusionnerReglagesMiseEnPage } =
  require('../modules/cv-mise-en-page/reglagesMiseEnPage.js');
const {
  traduireVersReglagesProjetXXL,
  traduireVersEtatWord,
  lireDepuisReglagesProjetXXL,
  TRAD_PROJETXXL_COLONNES_DEFAUT,
  TRAD_RUBRIQUES_MASQUABLES
} = require('../modules/cv-mise-en-page/reglagesTraducteurs.js');

// --- Chaine codee couleur + colonnes (reproduit idComposeurComplet, app.js ~28367)

test('traducteur Word : la chaine `couleur` encode l\'accent en hex, sans suffixe si colonnes = defaut', () => {
  const d = reglagesMiseEnPageParDefaut(); // accent #2f6690, colonnes '2'
  const w = traduireVersEtatWord(d);
  assert.equal(TRAD_PROJETXXL_COLONNES_DEFAUT, 2);
  assert.equal(w.couleur, 'projetxxl-hex:2F6690');
});

test('traducteur Word : colonnes 1 (non defaut) ajoute le suffixe _1col', () => {
  const c = fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { colonnes: '1' });
  assert.equal(traduireVersEtatWord(c).couleur, 'projetxxl-hex:2F6690_1col');
});

test('traducteur Word : un accent personnalise est repercute dans la chaine (majuscules, sans #)', () => {
  const c = fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { accent: '#1e3a5f' });
  assert.equal(traduireVersEtatWord(c).couleur, 'projetxxl-hex:1E3A5F');
});

// --- Format

test('traducteur Word : mapping des 5 formats', () => {
  const base = reglagesMiseEnPageParDefaut();
  assert.deepEqual(pick(traduireVersEtatWord(fmt(base, 'a4-detaille'))), { formatPage: 'A4' });
  assert.deepEqual(pick(traduireVersEtatWord(fmt(base, 'a4-essentiel'))), { formatPage: 'A4-essentiel' });
  assert.deepEqual(pick(traduireVersEtatWord(fmt(base, 'a4-integral'))), { formatPage: 'A4-integral' });
  assert.deepEqual(pick(traduireVersEtatWord(fmt(base, 'a5-portrait'))), { formatPage: 'A5', modeleA5: 'portrait' });
  assert.deepEqual(pick(traduireVersEtatWord(fmt(base, 'a5-paysage'))), { formatPage: 'A5', modeleA5: 'paysage' });
  function fmt(b, f) { return fusionnerReglagesMiseEnPage(b, { format: f }); }
  function pick(w) { const o = { formatPage: w.formatPage }; if (w.modeleA5) o.modeleA5 = w.modeleA5; return o; }
});

// --- Police : liste Word (Arial/Calibri/Georgia/Garamond) ou null

test('traducteur Word : police mappee si Word la connait, sinon null (jamais un remplacement arbitraire)', () => {
  const p = (police) => traduireVersReglagesProjetXXL(
    fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), { police })).police;
  assert.equal(p('georgia'), 'Georgia');
  assert.equal(p('garamond'), 'Garamond');
  assert.equal(p('arial'), 'Arial');
  assert.equal(p('calibri'), 'Calibri');
  assert.equal(p('segoe'), null);   // pas d'equivalent Word
  assert.equal(p('verdana'), null);
  assert.equal(p('times'), null);
});

// --- Derivation styleTitres / lecture guidee (Word n'a pas de "styleTitres" direct)

test('traducteur Word : styleTitres "bandeau" -> coloration lectureGuidee + variante rectangle', () => {
  const r = trad({ styleTitres: 'bandeau' });
  assert.equal(r.coloration, 'lectureGuidee');
  assert.equal(r.lectureGuideeVariante, 'rectangle');
});

test('traducteur Word : lectureGuidee seule (sans bandeau) -> coloration lectureGuidee + variante titre', () => {
  const r = trad({ lectureGuidee: true, styleTitres: 'souligne' });
  assert.equal(r.coloration, 'lectureGuidee');
  assert.equal(r.lectureGuideeVariante, 'titre');
});

test('traducteur Word : ni bandeau ni lecture guidee -> coloration aucune', () => {
  const r = trad({ styleTitres: 'souligne', lectureGuidee: false });
  assert.equal(r.coloration, 'aucune');
  assert.equal(r.lectureGuideeVariante, null);
});

test('traducteur Word : bandeau a la priorite sur lectureGuidee pour la variante', () => {
  const r = trad({ styleTitres: 'bandeau', lectureGuidee: true });
  assert.equal(r.lectureGuideeVariante, 'rectangle');
});

// --- "Mettre en evidence" : maps canoniques -> 6 booleens plats

test('traducteur Word : souligner/italique (maps) -> 6 cles plates', () => {
  const r = trad({
    souligner: { poste: true, entreprise: true },
    italique: { dates: true }
  });
  assert.equal(r.soulignerPoste, true);
  assert.equal(r.soulignerDates, false);
  assert.equal(r.soulignerEntreprise, true);
  assert.equal(r.italiquePoste, false);
  assert.equal(r.italiqueDates, true);
  assert.equal(r.italiqueEntreprise, false);
});

// --- ordreDatesPoste : vocabulaire different

test('traducteur Word : ordreDatesPoste dates/poste -> dateAvant/posteAvant', () => {
  assert.equal(trad({ ordreDatesPoste: 'dates' }).ordreDatesPoste, 'dateAvant');
  assert.equal(trad({ ordreDatesPoste: 'poste' }).ordreDatesPoste, 'posteAvant');
});

// --- Passe-plats simples + valeurs par defaut du traducteur

test('traducteur Word : passe-plats booleens', () => {
  const r = trad({
    icones: true, iconesCoordonnees: true, bandeauDisponibilite: true,
    separateurColonnes: true, colonnesInversees: true, lettreJointe: true,
    regroupement: true, fondColonnePleineHauteur: true, bandeauEnTete: false
  });
  assert.equal(r.iconesRubriques, true);
  assert.equal(r.iconesCoordonnees, true);
  assert.equal(r.bandeauDisponibilite, true);
  assert.equal(r.separateurColonnes, true);
  assert.equal(r.colonnesInversees, true);
  assert.equal(r.lettreJointe, true);
  assert.equal(r.regroupementActif, true);
  assert.equal(r.fondColonneEtendueEntete, true);
  assert.equal(r.fondTete, false);
});

test('traducteur Word : allure -> sobreActif (creatif hors perimetre)', () => {
  assert.equal(trad({ allure: 'sobre' }).sobreActif, true);
  assert.equal(trad({ allure: 'defaut' }).sobreActif, false);
  assert.equal(trad({ allure: 'creatif' }).sobreActif, false);
});

test('traducteur Word : couleur d\'entreprise = activation seule (le hex est lu ailleurs)', () => {
  assert.equal(trad({ couleurEntrepriseActive: true }).couleurEntrepriseActive, true);
  assert.equal(trad({}).couleurEntrepriseActive, false);
});

test('traducteur Word : blocMisEnAvant "" (canon) -> null (Word)', () => {
  const r = trad({ blocMisEnAvant: '', blocMisEnAvantGauche: 'competences' });
  assert.equal(r.blocMisEnAvant, null);
  assert.equal(r.blocMisEnAvantGauche, 'competences');
});

test('traducteur Word : separateurCouleur (hex canon) non exprimable -> separateurCouleurBase null', () => {
  const r = trad({ separateurCouleur: '#abcdef' });
  assert.equal(r.separateurCouleurBase, null);
});

test('traducteur Word : n\'emet AUCUNE cle de bookkeeping du Composeur', () => {
  const r = traduireVersReglagesProjetXXL(reglagesMiseEnPageParDefaut());
  ['tailleBonus', 'enteteBonus', 'capaciteExperiencesBonus', 'missionsBonus',
   'bonusCapacites', 'detailForceParCompetences', 'strategieForcee',
   'optionDebordement', 'creatifActif', 'creatifModele'].forEach((cle) => {
    assert.ok(!(cle in r), `le traducteur ne doit pas emettre "${cle}" (bookkeeping Composeur)`);
  });
});

test('traducteur Word : n\'emet PAS les champs sans consommateur Word', () => {
  const r = traduireVersReglagesProjetXXL(reglagesMiseEnPageParDefaut());
  ['ordreRubriques', 'taille', 'sansAccroche', 'formations'].forEach((cle) => {
    assert.ok(!(cle in r), `"${cle}" ne doit pas apparaitre dans reglagesProjetXXL`);
  });
});

test('traducteur Word : rubriques a masquer -- emis seulement si au moins une masquee, round-trip', () => {
  const base = reglagesMiseEnPageParDefaut();
  // tout visible -> rien d'emis
  assert.ok(!('rubriques' in traduireVersReglagesProjetXXL(base)));
  // masque loisirs + permis
  const canon = fusionnerReglagesMiseEnPage(base, { rubriques: { loisirs: false, permis: false } });
  const r = traduireVersReglagesProjetXXL(canon);
  assert.deepEqual(r.rubriques, { loisirs: false, permis: false });
  // round-trip : la map complete revient, seules loisirs/permis a false
  const p = lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {});
  TRAD_RUBRIQUES_MASQUABLES.forEach((k) => {
    assert.equal(p.rubriques[k], (k === 'loisirs' || k === 'permis') ? false : true);
  });
  // entree vide -> tout visible
  const p0 = lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, {});
  TRAD_RUBRIQUES_MASQUABLES.forEach((k) => { assert.equal(p0.rubriques[k], true); });
});

test('traducteur Word : interligne / espacementParas / marges -- emis seulement si != defaut, round-trip', () => {
  const base = reglagesMiseEnPageParDefaut();
  const r0 = traduireVersReglagesProjetXXL(base);
  assert.ok(!('interligne' in r0));
  assert.ok(!('espacementParas' in r0));
  assert.ok(!('marges' in r0));
  ['serre', 'aere'].forEach((v) => {
    const r = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { interligne: v }));
    assert.equal(r.interligne, v);
    assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {}).interligne, v);
  });
  ['serre', 'large'].forEach((v) => {
    const r = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { espacementParas: v }));
    assert.equal(r.espacementParas, v);
    assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {}).espacementParas, v);
  });
  ['etroites', 'larges'].forEach((v) => {
    const r = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { marges: v }));
    assert.equal(r.marges, v);
    assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {}).marges, v);
  });
});

test('traducteur Word : veuves -- emis seulement si false (defaut true), round-trip', () => {
  const base = reglagesMiseEnPageParDefaut();
  assert.ok(!('veuves' in traduireVersReglagesProjetXXL(base)));
  const r = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { veuves: false }));
  assert.equal(r.veuves, false);
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {}).veuves, false);
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', {}, {}).veuves, true);
});

test('traducteur Word : densite / alignement -- emis seulement si != defaut, round-trip', () => {
  const base = reglagesMiseEnPageParDefaut();
  // defauts neutres -> non emis
  const r0 = traduireVersReglagesProjetXXL(base);
  assert.ok(!('densite' in r0));
  assert.ok(!('alignement' in r0));
  // densite 'aere' / 'compact'
  ['aere', 'compact'].forEach((v) => {
    const r = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { densite: v }));
    assert.equal(r.densite, v);
    assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', r, {}).densite, v);
  });
  // alignement 'justifie'
  const rj = traduireVersReglagesProjetXXL(fusionnerReglagesMiseEnPage(base, { alignement: 'justifie' }));
  assert.equal(rj.alignement, 'justifie');
  assert.equal(lireDepuisReglagesProjetXXL('projetxxl-hex:2F6690', rj, {}).alignement, 'justifie');
});

test('traducteur Word : entree vide -> objet complet avec les defauts du traducteur (jamais d\'exception)', () => {
  const r = traduireVersReglagesProjetXXL();
  assert.equal(r.coloration, 'aucune');
  assert.equal(r.fondColonnes, 'droite');
  assert.equal(r.ordreDatesPoste, 'dateAvant');
  const w = traduireVersEtatWord();
  assert.equal(w.formatPage, 'A4');
  assert.ok(w.couleur.startsWith('projetxxl-hex:'));
});

function trad(patch) {
  return traduireVersReglagesProjetXXL(
    fusionnerReglagesMiseEnPage(reglagesMiseEnPageParDefaut(), patch));
}
