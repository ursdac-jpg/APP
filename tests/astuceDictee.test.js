const { test } = require('node:test');
const assert = require('node:assert/strict');
const { astuceDicteeDetecterAppareil: detecter, htmlAstuceDictee, ASTUCE_DICTEE_APPAREILS } = require('../modules/astuce-dictee/astuceDictee.js');

test('dictée : reconnaît Windows, Mac, iPhone, iPad, Android', () => {
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120', platform: 'Win32', maxTouchPoints: 0 }), 'windows');
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605', platform: 'MacIntel', maxTouchPoints: 0 }), 'mac');
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari', platform: 'iPhone', maxTouchPoints: 5 }), 'iphone');
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) Safari', platform: 'iPad', maxTouchPoints: 5 }), 'iphone');
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120 Mobile', platform: 'Linux armv81', maxTouchPoints: 5 }), 'android');
});

test('dictée : un iPad récent qui se présente comme un Mac est reconnu comme iPad', () => {
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605', platform: 'MacIntel', maxTouchPoints: 5 }), 'iphone');
});

test('dictée : appareil inconnu ou navigateur absent -> autre, sans erreur', () => {
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541) Chrome/120', platform: 'Linux x86_64', maxTouchPoints: 0 }), 'autre');
  assert.equal(detecter({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120', platform: 'Linux x86_64' }), 'autre');
  assert.equal(detecter(null), 'autre');
  assert.equal(detecter({}), 'autre');
});

test('dictée : chaque appareil a ses trois gestes et une aide « si rien ne se passe »', () => {
  Object.keys(ASTUCE_DICTEE_APPAREILS).forEach((cle) => {
    assert.equal(ASTUCE_DICTEE_APPAREILS[cle].pas.length, 3, cle);
    assert.ok(ASTUCE_DICTEE_APPAREILS[cle].aide.length > 20, cle);
  });
});

test('dictée : le texte affiché est celui de l’appareil, les quatre cas sinon', () => {
  const win = htmlAstuceDictee('encart', null, 'windows');
  assert.match(win, /Comment faire sur mon ordinateur Windows \?/);
  assert.match(win, />H</);
  assert.doesNotMatch(win, /iPhone/);
  const and = htmlAstuceDictee('ligne', null, 'android');
  assert.match(and, /Android/);
  assert.match(and, /astuce-dictee-ligne/);
  const autre = htmlAstuceDictee('encart', null, 'autre');
  ['Windows', 'Mac', 'iPhone', 'Android'].forEach((m) => assert.match(autre, new RegExp(m)));
});

test('dictée : jamais de tiret long ni de mot « IA » dans les textes', () => {
  ['windows', 'mac', 'iphone', 'android', 'autre'].forEach((a) => {
    ['encart', 'ligne'].forEach((f) => {
      const h = htmlAstuceDictee(f, null, a);
      assert.doesNotMatch(h, /[—–]/);
      assert.doesNotMatch(h, /\bIA\b/);
    });
  });
});

test('dictée : forme « bouton » (consigne 219) : un bouton ovale qui dit l’appareil et déplie les gestes', () => {
  const win = htmlAstuceDictee('bouton', null, 'windows');
  assert.match(win, /astuce-dictee-bouton/);
  assert.match(win, /<summary>[^<]*Dicter à la voix : comment faire sur mon ordinateur Windows \?/);
  assert.match(win, /<ol>/);
  const autre = htmlAstuceDictee('bouton', null, 'autre');
  assert.match(autre, /Dicter à la voix : comment faire \?/);
  ['Windows', 'Mac', 'iPhone', 'Android'].forEach((m) => assert.match(autre, new RegExp(m)));
  ['windows', 'mac', 'iphone', 'android', 'autre'].forEach((a) => {
    const h = htmlAstuceDictee('bouton', null, a);
    assert.doesNotMatch(h, /[—–]/);
    assert.doesNotMatch(h, /\bIA\b/);
  });
});
