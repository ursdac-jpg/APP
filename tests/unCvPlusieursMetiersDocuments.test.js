const { test } = require('node:test');
const assert = require('node:assert/strict');

// Module « Un CV, plusieurs métiers » : documents à télécharger (page 7), logique pure.
const doc = require('../modules/un-cv-plusieurs-metiers/logiqueDocuments.js');
const NL = String.fromCharCode(10);

const identite = { civilite: 'Madame', prenom: 'Camille', nom: 'Martin', adresse: '12 rue des Lilas', codePostal: '87000', ville: 'Limoges', telephone: '06 12 34 56 78', email: 'camille.martin@example.org' };

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

// Lettres mises en page par les gabarits de la lettre (24/10/2026).
const { ucpmPoliceLettreDepuisCv, ucpmPreparerDossierLettre } = require('../modules/un-cv-plusieurs-metiers/logiqueDocuments.js');

test('police de la lettre : serif reste serif, le reste devient Arial, vide = Georgia', () => {
  assert.equal(ucpmPoliceLettreDepuisCv('georgia'), 'Georgia');
  assert.equal(ucpmPoliceLettreDepuisCv('times'), 'Times New Roman');
  assert.equal(ucpmPoliceLettreDepuisCv('garamond'), 'Times New Roman');
  assert.equal(ucpmPoliceLettreDepuisCv('segoe'), 'Arial');
  assert.equal(ucpmPoliceLettreDepuisCv('calibri'), 'Arial');
  assert.equal(ucpmPoliceLettreDepuisCv(''), 'Georgia');
  assert.equal(ucpmPoliceLettreDepuisCv(null), 'Georgia');
});

test('dossier de lettre : texte, entreprise, recruteur, poste, modèle et police sont posés', () => {
  const copie = { identite: { nom: 'Durand' }, objectif: 'offre', offre: { structure: 'Autre société' }, metierCible: 'Ancien' };
  const r = ucpmPreparerDossierLettre(copie, { texte: 'Madame Martin,\n\nCorps.', employeur: ' Boutique Élise ', civiliteRecruteur: 'Madame', nomRecruteur: 'Martin', titre: 'Vendeuse', gabarit: 'g3', jetonPolice: 'times' });
  assert.equal(r.ia.lettre.lettre.texte, 'Madame Martin,\n\nCorps.');
  assert.deepEqual(r.rechercheCandidature, { entreprise: 'Boutique Élise', civiliteRecruteur: 'Madame', nomRecruteur: 'Martin' });
  assert.equal(r.objectif, '');
  assert.equal(r.metierCible, 'Vendeuse');
  assert.equal(r.titreCV, 'Vendeuse');
  assert.equal(r.lettreDestinataire.gabarit, 'g3');
  assert.equal(r.lettreDestinataire.police, 'Times New Roman');
  assert.equal(r.lettreDestinataire.couleur, '');
  assert.equal(r.identite.nom, 'Durand');
});

test('dossier de lettre : sans entreprise ni recruteur, rien d’inventé', () => {
  const r = ucpmPreparerDossierLettre({}, { texte: 'Texte.', titre: 'Agent d’accueil' });
  assert.equal(r.rechercheCandidature.entreprise, '');
  assert.equal(r.rechercheCandidature.nomRecruteur, '');
  assert.equal(r.lettreDestinataire.gabarit, 'g0');
});
