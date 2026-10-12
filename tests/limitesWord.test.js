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
