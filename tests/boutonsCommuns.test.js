'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const B = require('../modules/boutons-communs/logique.js');

// Boutons communs (consignes 125 et 126) : plus aucune ligne de texte cliquable.
test('bouton externe : un vrai bouton avec cadre, le nom en clair, la mention « Vous quittez l’application » en dessous', () => {
  const h = B.boutonExterneHtml('https://exemple.fr/a?b=1&c=2', 'Mission locale de Périgueux');
  assert.match(h, /<a class="btn btn-outline-primary bouton-externe"/);
  assert.ok(h.indexOf('href="https://exemple.fr/a?b=1&amp;c=2"') !== -1, 'adresse échappée');
  assert.ok(h.indexOf('target="_blank"') !== -1 && h.indexOf('rel="noopener noreferrer"') !== -1);
  assert.ok(h.indexOf('Mission locale de Périgueux</a>') !== -1);
  assert.ok(h.indexOf('<span class="bouton-externe-note">Vous quittez l’application</span>') !== -1);
  assert.ok(B.boutonExterneHtml('https://exemple.fr', 'X', { petit: true }).indexOf('btn btn-outline-primary btn-sm') !== -1);
  assert.ok(B.boutonExterneHtml('https://exemple.fr', 'X', { note: false }).indexOf('bouton-externe-note') === -1);
});

test('bouton externe : le libellé est du texte (échappé) et seule une adresse web http(s) est acceptée', () => {
  const h = B.boutonExterneHtml('https://exemple.fr', '<b>"Piège" & co</b>');
  assert.ok(h.indexOf('<b>') === -1 && h.indexOf('&lt;b&gt;&quot;Piège&quot; &amp; co&lt;/b&gt;') !== -1);
  ['javascript:alert(1)', 'data:text/html,x', '', null, undefined, '//exemple.fr', 'ftp://x.fr'].forEach((u) => assert.equal(B.boutonExterneHtml(u, 'X'), '', String(u)));
});

test('adresse avec bouton carte : l’adresse reste du texte, le bouton « Voir sur la carte » est à côté', () => {
  const h = B.adresseAvecCarteHtml('12 rue des Écoles, 24000 Périgueux', 'https://www.google.com/maps/search/?api=1&query=x');
  assert.ok(h.indexOf('<span class="text-break">12 rue des Écoles, 24000 Périgueux</span>') !== -1);
  assert.match(h, /<a class="btn btn-sm btn-outline-primary bouton-externe ms-1" href="https:\/\/www\.google\.com\/maps\/search\/\?api=1&amp;query=x"[^>]*>.*Voir sur la carte<\/a>/);
  assert.ok(!/<a [^>]*>12 rue/.test(h), 'l’adresse n’est jamais une ligne de texte cliquable');
  assert.equal(B.adresseAvecCarteHtml('1 rue X', ''), '<span class="text-break">1 rue X</span>', 'sans adresse de carte : le texte seul');
});

test('nom du bouton d’un site de structure : le nom seul, jamais l’adresse web', () => {
  assert.equal(B.libelleSiteStructure('Mission locale de Périgueux'), 'Voir le site : Mission locale de Périgueux');
  assert.equal(B.libelleSiteStructure('  '), 'Voir le site');
  assert.equal(B.libelleSiteStructure(), 'Voir le site');
});

test('fiche de structure : aucune ligne de texte cliquable (tout lien est un bouton), le site porte le nom de la structure', () => {
  const L = require('../modules/mon-territoire/logique.js');
  const s = { titre: 'Mission locale de Périgueux', type: 'mission-locale', commune: 'Périgueux', url: 'https://www.exemple.fr/ml', verifie: true, adresse: '12 rue des Écoles, 24000 Périgueux', telephone: '05 53 00 00 00', mail: 'contact@exemple.fr', date: '2026-10-20' };
  [{ appel: true, ecrire: true }, { appel: false, ecrire: false }].forEach((o) => {
    const h = L.mtCarteStructureHtml(s, o);
    const liens = h.match(/<a [^>]*>/g) || [];
    assert.ok(liens.length >= 2, 'au moins la carte et le site');
    liens.forEach((a) => assert.ok(/class="btn /.test(a), 'lien sans cadre : ' + a));
    assert.ok(h.indexOf('Voir le site : Mission locale de Périgueux</a>') !== -1, 'le site porte le nom de la structure');
    assert.ok(h.indexOf('>https://www.exemple.fr/ml<') === -1, 'jamais l’adresse web écrite comme lien');
    assert.ok(h.indexOf('Vous quittez l’application') !== -1);
    assert.ok(/<span class="text-break">12 rue des Écoles, 24000 Périgueux<\/span>/.test(h), 'adresse écrite en texte simple');
  });
});

test('numéro d’urgence en grand (3114) : bouton « Appeler le 3114 » sur téléphone, simple texte ailleurs', () => {
  const L = require('../modules/mon-territoire/logique.js');
  const tel = L.mtTelephoneAffiche('3114', true, { grand: true }), ailleurs = L.mtTelephoneAffiche('3114', false, { grand: true });
  assert.match(tel, /<a class="btn btn-lg fw-bold btn-outline-primary"[^>]*href="tel:3114"[^>]*>.*Appeler le 3114<\/a>/);
  assert.ok(ailleurs.indexOf('<a ') === -1 && ailleurs.indexOf('3114') !== -1);
});
