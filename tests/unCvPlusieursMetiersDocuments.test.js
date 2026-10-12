const { test } = require('node:test');
const assert = require('node:assert/strict');

// Module « Un CV, plusieurs métiers » : documents à télécharger (page 7), logique pure.
const doc = require('../modules/un-cv-plusieurs-metiers/logiqueDocuments.js');
const NL = String.fromCharCode(10);

const identite = { civilite: 'Madame', prenom: 'Camille', nom: 'Martin', adresse: '12 rue des Lilas', codePostal: '87000', ville: 'Limoges', telephone: '06 12 34 56 78', email: 'camille.martin@example.org' };

test('lettre : les coordonnées de la personne, une ligne vide est omise', () => {
  assert.deepEqual(doc.ucpmCoordonneesLettre(identite), ['Camille Martin', '12 rue des Lilas', '87000 Limoges', '06 12 34 56 78', 'camille.martin@example.org']);
  assert.deepEqual(doc.ucpmCoordonneesLettre({ nom: 'Martin', ville: 'Limoges' }), ['Martin', 'Limoges']);
  assert.deepEqual(doc.ucpmCoordonneesLettre(null), []);
});

test('lettre : le destinataire n’apparaît que si l’employeur ou le recruteur sont connus', () => {
  assert.deepEqual(doc.ucpmDestinataireLettre({}), []);
  assert.deepEqual(doc.ucpmDestinataireLettre({ employeur: 'Habitat 87' }), ['Habitat 87']);
  assert.deepEqual(doc.ucpmDestinataireLettre({ employeur: 'Habitat 87', civiliteRecruteur: 'Madame', nomRecruteur: 'Durand' }), ['Habitat 87', 'Madame Durand']);
});

test('lettre : lieu et date à la française, sans ville la date seule', () => {
  assert.equal(doc.ucpmLieuDateLettre(identite, '10 octobre 2026'), 'Limoges, le 10 octobre 2026');
  assert.equal(doc.ucpmLieuDateLettre({}, '1er novembre 2026'), 'Le 1er novembre 2026');
});

test('lettre : les paragraphes sont séparés par une ligne vide, les lignes d’un paragraphe restent ensemble', () => {
  const t = 'Madame, Monsieur,' + NL + NL + 'Premier paragraphe' + NL + 'suite.' + NL + NL + NL + 'Cordialement.' + NL;
  assert.deepEqual(doc.ucpmParagraphesLettre(t), [['Madame, Monsieur,'], ['Premier paragraphe', 'suite.'], ['Cordialement.']]);
  assert.deepEqual(doc.ucpmParagraphesLettre(''), []);
});

test('lettre : la feuille porte coordonnées, destinataire, date, texte, signature, et protège le HTML', () => {
  const texte = 'Madame Durand,' + NL + NL + 'Je candidate <vite> & bien.' + NL + NL + 'Cordialement.' + NL + NL + 'Camille Martin';
  const h = doc.ucpmHtmlLettre({ identite, objectif: { employeur: 'Habitat 87', civiliteRecruteur: 'Madame', nomRecruteur: 'Durand' }, texte, dateTexte: '10 octobre 2026', police: '"Georgia", serif' });
  assert.match(h, /class="expediteur"/);
  assert.match(h, /<p class="nom">Camille Martin<\/p>/);
  assert.match(h, /<p>Habitat 87<\/p><p>Madame Durand<\/p>/);
  assert.match(h, /Limoges, le 10 octobre 2026/);
  assert.match(h, /Je candidate &lt;vite&gt; &amp; bien\./);
  assert.match(h, /<p class="signature">Camille Martin<\/p>/);
  assert.match(h, /font-family:'Georgia', serif/, 'la police du CV est reprise');
  assert.doesNotMatch(h, /<vite>/);
});

test('lettre : sans destinataire connu, seule la date est à droite ; police par défaut', () => {
  const h = doc.ucpmHtmlLettre({ identite, objectif: {}, texte: 'Madame, Monsieur,', dateTexte: '10 octobre 2026' });
  assert.match(h, /<div class="destinataire"><p class="lieu-date">Limoges, le 10 octobre 2026<\/p><\/div>/);
  assert.match(h, /Segoe UI/);
});

test('document imprimé : une pièce par compartiment étanche, saut de page entre les pièces, page A4 sans marge', () => {
  const html = doc.ucpmDocumentImpression('MARTIN_mes-cv', [{ css: '.cv{color:red}', html: '<div class="cv">A</div>' }, { css: doc.UCPM_CSS_LETTRE, html: '<div class="ucpm-lettre">B</div>' }]);
  assert.match(html, /<title>MARTIN_mes-cv<\/title>/);
  assert.equal((html.match(/<template shadowrootmode="open">/g) || []).length, 2);
  assert.match(html, /@page\{size:210mm 297mm;margin:0;\}/);
  assert.match(html, /\.ucpm-feuille\{display:block;break-after:page/);
  assert.ok(html.indexOf('.cv{color:red}') < html.indexOf('ucpm-lettre'), 'ordre des pièces respecté');
});

test('document imprimé : le titre est protégé', () => {
  assert.match(doc.ucpmDocumentImpression('A <b> & "B"', []), /<title>A &lt;b&gt; &amp; &quot;B&quot;<\/title>/);
});

test('pages annoncées : les pages de chaque CV, plus une page par lettre', () => {
  assert.equal(doc.ucpmPagesDocument([1, 1, 2], 0), 4);
  assert.equal(doc.ucpmPagesDocument([1, 1], 2), 4);
  assert.equal(doc.ucpmPagesDocument([], 3), 3);
  assert.equal(doc.ucpmPagesDocument([0, 'x'], 0), 2, 'une valeur inconnue compte pour une page');
});

test('CV très rempli : moins de 40 px libres sur une page, jamais pour un CV déjà sur plusieurs pages ni sans mesure', () => {
  assert.equal(doc.UCPM_MARGE_SECURITE_PX, 40);
  assert.equal(doc.ucpmCvTresRempli(33, 1), true, 'le cas relevé le 2026-10-07');
  assert.equal(doc.ucpmCvTresRempli(63, 1), false);
  assert.equal(doc.ucpmCvTresRempli(40, 1), false, 'pile à la marge : pas d’alerte');
  assert.equal(doc.ucpmCvTresRempli(10, 2), false, 'plusieurs pages : c’est l’autre message');
  assert.equal(doc.ucpmCvTresRempli(null, 1), false, 'mesure impossible : on ne dit rien');
  assert.equal(doc.ucpmCvTresRempli(undefined, 1), false);
});

test('CV très rempli : le message sous le CV', () => {
  assert.equal(doc.ucpmTexteAlerteCv(2, 500), 'Ce CV passe sur 2 pages.');
  assert.match(doc.ucpmTexteAlerteCv(1, 20), /très rempli.*deux pages à l’impression/);
  assert.equal(doc.ucpmTexteAlerteCv(1, 120), '');
  assert.equal(doc.ucpmTexteAlerteCv(1, null), '');
  assert.doesNotMatch(doc.ucpmTexteAlerteCv(1, 20), new RegExp(String.fromCharCode(0x2014) + '|' + String.fromCharCode(0x2013)));
});

test('CV dans un compartiment étanche : « :root » devient « :host » pour garder couleurs et tailles', () => {
  const css = ':root { --cv: #1f2a44; --kh: 1.46; } .cv { color: var(--cv); } .x:rootless { a: b; }';
  const r = doc.ucpmCssPourCompartiment(css);
  assert.match(r, /^:host \{ --cv: #1f2a44; --kh: 1\.46; \}/);
  assert.doesNotMatch(r, /:root/);
  assert.match(r, /\.x:rootless/, 'un nom plus long qui commence pareil n’est pas touché');
  assert.equal(doc.ucpmCssPourCompartiment(null), '');
});
