const test = require('node:test');
const assert = require('node:assert');
const { limitesWordPourReglages, phraseLimitesWord, _LIMITES_WORD } = require('../modules/cv-word/limitesWord.js');
// tiret cadratin ou demi-cadratin (codes construits ici pour ne pas ecrire le caractere lui-meme)
const aUnTiret = (t) => String(t).indexOf(String.fromCharCode(0x2013)) !== -1 || String(t).indexOf(String.fromCharCode(0x2014)) !== -1;

test('limites Word : aucun ecart pour un modele que Word reproduit', () => {
  assert.deepStrictEqual(limitesWordPourReglages({ regCreatifActif: true, creatifVariante: 'colonneFoncee' }), []);
  assert.deepStrictEqual(limitesWordPourReglages({ regSobreActif: true, sobreVariante: 'mq-bandeau' }), []);
  assert.strictEqual(phraseLimitesWord({ regCreatifActif: true, creatifVariante: 'sidebarVague' }), '');
});

test('limites Word : reglages absents ou invalides ne produisent ni erreur ni message', () => {
  assert.deepStrictEqual(limitesWordPourReglages(null), []);
  assert.deepStrictEqual(limitesWordPourReglages(undefined), []);
  assert.deepStrictEqual(limitesWordPourReglages('x'), []);
  assert.strictEqual(phraseLimitesWord({}), '');
});

test('limites Word : « Colonne foncée et rubans » est signale, avec le conseil PDF', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'colonneRuban' };
  assert.strictEqual(limitesWordPourReglages(pr).length, 1);
  const phrase = phraseLimitesWord(pr);
  assert.match(phrase, /ruban/);
  assert.match(phrase, /PDF/);
});

test('limites Word : le modele n\'est signale que s\'il est reellement actif', () => {
  assert.deepStrictEqual(limitesWordPourReglages({ regCreatifActif: false, creatifVariante: 'colonneRuban' }), []);
});

test('limites Word : texte propre (pas de tiret cadratin ni demi-cadratin, accents conserves)', () => {
  _LIMITES_WORD.forEach((l) => {
    assert.ok(!aUnTiret(l.ce), l.id);
    assert.ok(l.ce.length > 10, l.id);
  });
  assert.ok(!aUnTiret(phraseLimitesWord({ regCreatifActif: true, creatifVariante: 'colonneRuban' })));
});

test('limites Word : deux ecarts se joignent en une seule phrase', () => {
  const faux = [{ id: 'a', quand: () => true, ce: 'première chose' }, { id: 'b', quand: () => true, ce: 'seconde chose' }];
  _LIMITES_WORD.push(...faux);
  try {
    assert.match(phraseLimitesWord({}), /première chose, et seconde chose/);
  } finally {
    _LIMITES_WORD.length -= faux.length;
  }
});

test('limites Word : « Colonne claire » (carte) est signalée, avec le conseil PDF et la promesse d’adaptation dans Word', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'colonneClaire' };
  assert.strictEqual(limitesWordPourReglages(pr).length, 1);
  const phrase = phraseLimitesWord(pr);
  assert.match(phrase, /filet de couleur/);
  assert.match(phrase, /PDF/);
  assert.match(phrase, /adapté/);
  assert.ok(!aUnTiret(phrase));
});

test('limites Word : Ruban diagonal est signale comme Colonne foncee et rubans (rubans en rectangles)', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'rubanDiagonal' };
  assert.strictEqual(limitesWordPourReglages(pr).length, 1);
  assert.match(phraseLimitesWord(pr), /ruban/);
});

test('limites Word : Cadre de page (double cadre) est signale', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'mqCadre' };
  assert.strictEqual(limitesWordPourReglages(pr).length, 1);
  assert.match(phraseLimitesWord(pr), /cadre/);
});

test('limites Word : le ruban court avec texte a deux tons est signale (couleur mot par mot dans Word), pas sans lui', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'mqBandeau', regBordBandeau: 'rubanCourt', regTexteHors: 'dessous' };
  assert.strictEqual(limitesWordPourReglages(pr).length, 1);
  const phrase = phraseLimitesWord(pr);
  assert.match(phrase, /ruban/);
  assert.match(phrase, /mot par mot/);
  assert.match(phrase, /PDF/);
  assert.ok(!aUnTiret(phrase));
  // sans réglage enregistré du texte qui sort : le réglage d'office (couleur du bandeau) s'applique, donc signalé aussi
  assert.strictEqual(limitesWordPourReglages({ regSobreActif: true, regBordBandeau: 'rubanCourt' }).length, 1);
  // « Ne rien changer » : le PDF garde le texte blanc comme le Word, aucun écart
  assert.deepStrictEqual(limitesWordPourReglages({ regCreatifActif: true, regBordBandeau: 'rubanCourt', regTexteHors: 'aucun' }), []);
  // une autre forme de bandeau, ou aucun modèle actif : rien (vu reproduit dans un vrai Word)
  assert.deepStrictEqual(limitesWordPourReglages({ regCreatifActif: true, regBordBandeau: 'pointe', regTexteHors: 'dessous' }), []);
  assert.deepStrictEqual(limitesWordPourReglages({ regCreatifActif: false, regSobreActif: false, regBordBandeau: 'rubanCourt' }), []);
});

test('limites Word : plusieurs ecarts se disent dans UN SEUL message', () => {
  const pr = { regCreatifActif: true, creatifVariante: 'colonneRuban', regBordBandeau: 'rubanCourt', regTexteHors: 'dessous', formesDeco: [{ forme: 'rond' }] };
  assert.strictEqual(limitesWordPourReglages(pr).length, 3);
  const phrase = phraseLimitesWord(pr);
  assert.strictEqual((phrase.match(/Ce modèle est surtout fait pour le PDF/g) || []).length, 1);
});

test('compositions du CV : seuls deux écarts vus dans Word sont annoncés (diagonale, L) ; équerre, plaque, volets, étiquette, ruban et quarts de cercle n’annoncent rien', () => {
  const L = require('../modules/cv-word/limitesWord.js');
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'diagonale' }), ['la ligne oblique qui coupe l’en-tête devient presque droite']);
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'l' }), ['le coin arrondi du L devient un coin droit']);
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'quart' }), [], 'les quarts de cercle sont reproduits depuis le 2026-10-23');
  ['equerre', 'plaque', 'volets', 'etiquette', 'ruban', ''].forEach((id) => assert.deepStrictEqual(L.limitesWordPourReglages({ composition: id }), [], id));
});

test('décor ajouté : aucun des quatre décors n’annonce d’écart dans Word', () => {
  const L = require('../modules/cv-word/limitesWord.js');
  ['equerre', 'ruban', 'quarts', 'plaque'].forEach((id) => assert.deepStrictEqual(L.limitesWordPourReglages({ decor: { id } }), [], id));
  assert.deepStrictEqual(L.limitesWordPourReglages({ decor: {} }), []);
});

test('compositions à deux colonnes : seule l’étiquette annonce un écart dans Word (arrondie aussi en bas)', () => {
  const L = require('../modules/cv-word/limitesWord.js');
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'etiquette', regColonnes: '2' }), ['l’étiquette de couleur est aussi arrondie en bas']);
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'etiquette', regColonnes: '1' }), []);
  ['equerre', 'plaque', 'volets', 'carte', 'l', 'diagonale'].forEach((id) => assert.ok(!L.limitesWordPourReglages({ composition: id, regColonnes: '2' }).some((p) => /étiquette/.test(p)), id));
});
test('compositions : la diagonale n’annonce rien à deux colonnes (l’oblique y est reproduite), mais le fait à une colonne', () => {
  const L = require('../modules/cv-word/limitesWord.js');
  assert.deepStrictEqual(L.limitesWordPourReglages({ composition: 'diagonale', regColonnes: '2' }), []);
  assert.strictEqual(L.limitesWordPourReglages({ composition: 'diagonale', regColonnes: '1' }).length, 1);
});
