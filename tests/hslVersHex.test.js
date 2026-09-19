const { test } = require('node:test');
const assert = require('node:assert/strict');
require('./_domStub').installerStubDom();
const { hslVersHex } = require('../js/app.js');

test('hslVersHex : noir, blanc, gris', () => {
  assert.equal(hslVersHex(0, 0, 0), '000000');
  assert.equal(hslVersHex(0, 0, 100), 'FFFFFF');
  assert.equal(hslVersHex(0, 0, 50), '808080');
});

test('hslVersHex : couleurs primaires pures', () => {
  assert.equal(hslVersHex(0, 100, 50), 'FF0000');
  assert.equal(hslVersHex(120, 100, 50), '00FF00');
  assert.equal(hslVersHex(240, 100, 50), '0000FF');
});

test('hslVersHex : retourne toujours 6 caracteres hexadecimaux majuscules', () => {
  for (let h = 0; h < 360; h += 37) {
    const hex = hslVersHex(h, 60, 45);
    assert.match(hex, /^[0-9A-F]{6}$/);
  }
});
