const { test } = require('node:test');
const assert = require('node:assert/strict');
const { formaterTelephone, formaterNom, formaterPrenom, inverserNomPrenom } = require('../modules/cv-core/identiteFormat.js');

// Retour Denis 2026-10-01 : un point toutes les deux chiffres, partout ; le nom en majuscules, le prénom avec une majuscule ; une flèche pour les inverser.

test('téléphone : un point toutes les deux chiffres, quelle que soit la façon de l\'écrire', () => {
  ['0612345678', '06 12 34 56 78', '06.12.34.56.78', '06-12-34-56-78', ' 06 12.34 56-78 '].forEach((t) => assert.equal(formaterTelephone(t), '06.12.34.56.78', t));
  assert.equal(formaterTelephone('05 55 12 34 56'), '05.55.12.34.56');
});

test('téléphone : indicatif +33 conservé, numéro étranger ou incomplet laissé tel quel, vide reste vide', () => {
  assert.equal(formaterTelephone('+33 6 12 34 56 78'), '+33.6.12.34.56.78');
  assert.equal(formaterTelephone('0033612345678'), '+33.6.12.34.56.78');
  assert.equal(formaterTelephone('+44 20 7946 0958'), '+44 20 7946 0958');
  assert.equal(formaterTelephone('06 12 34'), '06 12 34');
  assert.equal(formaterTelephone(''), '');
  assert.equal(formaterTelephone(undefined), '');
});

test('nom en majuscules, prénom avec une majuscule à chaque partie', () => {
  assert.equal(formaterNom('Seddiki'), 'SEDDIKI');
  assert.equal(formaterNom('de la Fontaine'), 'DE LA FONTAINE');
  assert.equal(formaterPrenom('ISMAHENE'), 'Ismahene');
  assert.equal(formaterPrenom('jean-pierre'), 'Jean-Pierre');
  assert.equal(formaterPrenom('MARIE ANNE'), 'Marie Anne');
  assert.equal(formaterPrenom('d\'artagnan'), 'D\'Artagnan');
  assert.equal(formaterPrenom('élodie'), 'Élodie');
});

test('inverser : le prénom devient le nom (majuscules), le nom devient le prénom (majuscule initiale)', () => {
  assert.deepEqual(inverserNomPrenom('ISMAHENE', 'SEDDIKI'), { nom: 'SEDDIKI', prenom: 'Ismahene' });
  assert.deepEqual(inverserNomPrenom('Seddiki', 'Ismahene'), { nom: 'ISMAHENE', prenom: 'Seddiki' });
  assert.deepEqual(inverserNomPrenom('', 'Camille'), { nom: 'CAMILLE', prenom: '' });
});

test('inverser deux fois ramène à l\'écriture conventionnelle de départ', () => {
  const d = { nom: 'MARTIN', prenom: 'Camille' };
  const a = inverserNomPrenom(d.nom, d.prenom), b = inverserNomPrenom(a.nom, a.prenom);
  assert.deepEqual(b, d);
});

// Retour Denis 2026-10-01 : le CV enregistré s'appelle « NOM_poste » (DUPONT_vendeur.pdf, DUPONT_vendeur.docx).
const { nomFichierCV } = require('../modules/cv-core/identiteFormat.js');

test('nom du fichier : NOM_poste, nom en majuscules et poste en minuscules', () => {
  assert.equal(nomFichierCV({ identite: { prenom: 'Michel', nom: 'Dupont' }, metierCible: 'Vendeur' }, 'pdf'), 'DUPONT_vendeur.pdf');
  assert.equal(nomFichierCV({ identite: { prenom: 'Michel', nom: 'DUPONT' }, metierCible: 'vendeur' }, 'docx'), 'DUPONT_vendeur.docx');
});

test('nom du fichier : sans accent, mots reliés par des tirets, titre du CV si pas de métier visé', () => {
  assert.equal(nomFichierCV({ identite: { nom: 'de la Fontaine' }, titreCV: 'Agent de sécurité' }), 'DE-LA-FONTAINE_agent-de-securite');
  assert.equal(nomFichierCV({ identite: { nom: 'Élodie-Martin' }, metierCible: 'Aide-soignante' }, 'pdf'), 'ELODIE-MARTIN_aide-soignante.pdf');
});

test('nom du fichier : poste trop long coupé à un mot entier, sans poste le nom seul, sans rien « cv »', () => {
  const long = nomFichierCV({ identite: { nom: 'Martin' }, metierCible: 'Assistante administrative commerciale et communication internationale' }, 'pdf');
  assert.ok(long.length <= 'MARTIN_'.length + 40 + 4, long);
  assert.ok(!/-\.pdf$/.test(long) && !/_.*--/.test(long), long);
  assert.equal(nomFichierCV({ identite: { nom: 'Martin' } }, 'pdf'), 'MARTIN.pdf');
  assert.equal(nomFichierCV({ identite: { prenom: 'Camille' } }), 'CAMILLE');
  assert.equal(nomFichierCV({}, 'pdf'), 'cv.pdf');
  assert.equal(nomFichierCV(undefined), 'cv');
});

// Retour Denis 2026-10-01 : « Permis B » écrit dans le CV et non capté par l'assistant : filet sans assistant.
const { detecterPermisDansTexte } = require('../modules/cv-core/identiteFormat.js');

test('permis : « Bergerac Permis B » (comme dans le CV de Nicolas) est capté', () => {
  assert.deepEqual(detecterPermisDansTexte('Nicolas POIROT poirotnicolas@outlook.fr Bergerac Permis B TECHNICIEN SUPERIEUR'), { possede: true, categories: ['B'], vehicule: null });
});

test('permis : plusieurs catégories et véhicule', () => {
  assert.deepEqual(detecterPermisDansTexte('Permis A et B, véhiculé'), { possede: true, categories: ['A', 'B'], vehicule: true });
  assert.deepEqual(detecterPermisDansTexte('Titulaire du permis de conduire (B)'), { possede: true, categories: ['B'], vehicule: null });
  assert.deepEqual(detecterPermisDansTexte('Permis : B, C'), { possede: true, categories: ['B', 'C'], vehicule: null });
});

test('permis : sans permis, permis en cours, texte sans permis', () => {
  assert.equal(detecterPermisDansTexte('Sans permis').possede, false);
  assert.equal(detecterPermisDansTexte('Permis B en cours de préparation'), null);
  assert.equal(detecterPermisDansTexte('Aucune mention ici. Un contrôle qualité ayant permis de gagner du temps.'), null);
});
