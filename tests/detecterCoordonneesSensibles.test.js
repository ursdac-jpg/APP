const { test } = require('node:test');
const assert = require('node:assert/strict');

// detecterCoordonneesSensibles() (data/metiers.js) est la brique partagee du
// surlignage de masquage (Bilan, Cohérence, "Créer un nouveau CV", "Préparer
// ma lettre et mon entretien"...) et, depuis le 2026-09-17, du pre-remplissage
// automatique de dossier.identite.telephone/.email dans "Co-construire ma
// lettre" (_coLettreDetecterCoordonneesDepuisCV(), meme fichier). Logique
// pure (regex uniquement), aucune dependance DOM.
const { detecterCoordonneesSensibles } = require('../data/metiers.js');

function valeurs(trouves, icone) {
  return trouves.filter(function (t) { return t.icone === icone; }).map(function (t) { return t.valeur; });
}

test('telephone : formats espace/point/tiret detectes', () => {
  const t = detecterCoordonneesSensibles('Contact : 06 12 34 56 78 ou 06.12.34.56.78 ou 06-12-34-56-78');
  assert.deepEqual(valeurs(t, '📞'), ['06 12 34 56 78', '06.12.34.56.78', '06-12-34-56-78']);
});

test('email : cas normal, suivi d\'un saut de ligne', () => {
  const t = detecterCoordonneesSensibles('Email : jean.dupont@exemple.fr\nExperience : ...');
  assert.deepEqual(valeurs(t, '📧'), ['jean.dupont@exemple.fr']);
});

// TACHE (retour utilisateur 2026-09-17, bug reel confirme) : un CV sans
// espace entre l'e-mail et le mot suivant ("...frPermis" au lieu de "...fr
// Permis") faisait avaler ce mot par l'ancienne regex ({2,} glouton, aucune
// raison de s'arreter a "fr").
// TACHE (retour utilisateur 2026-09-17, suite -- "il n'y a que le telephone
// qui est repris, pas le courriel") : le 1er correctif rejetait ENTIEREMENT
// l'e-mail dans ce cas (mieux vaut rien qu'une valeur tronquee), mais c'est
// justement le cas le plus courant (extraction PDF sans saut de ligne) --
// affine : une MAJUSCULE juste apres le TLD ("P" de "Permis") est un signal
// fiable de mot colle par accident (aucun TLD reel ne continue par une
// majuscule), donc desormais coupee correctement plutot que rejetee.
test('email : mot colle juste apres SANS espace, mais qui commence par une majuscule -> coupe correctement au TLD', () => {
  const t = detecterCoordonneesSensibles('sophie.martin@email.frPermis B, vehicule personnel');
  assert.deepEqual(valeurs(t, '📧'), ['sophie.martin@email.fr']);
});

// Le risque d'origine (tronquer un VRAI TLD plus long, non enumere) reste
// couvert : une minuscule ou un chiffre juste apres reste un signal
// ambigu (pourrait etre la suite du meme domaine) -> toujours rejete
// entierement, jamais de valeur coupee au mauvais endroit.
test('email : mot colle juste apres en minuscule -> toujours aucune detection (ambigu, jamais de valeur corrompue)', () => {
  const t = detecterCoordonneesSensibles('sophie.martin@email.frpermis, vehicule personnel');
  assert.deepEqual(valeurs(t, '📧'), []);
});

test('email : mot colle mais separe par un signe de ponctuation reste detecte correctement', () => {
  const t = detecterCoordonneesSensibles('Email: sophie.martin@email.fr, Permis B');
  assert.deepEqual(valeurs(t, '📧'), ['sophie.martin@email.fr']);
});

test('email : TLD de 4 lettres (info) toujours reconnue', () => {
  const t = detecterCoordonneesSensibles('contact@site.info et suite du texte');
  assert.deepEqual(valeurs(t, '📧'), ['contact@site.info']);
});

// TACHE (retour utilisateur 2026-09-17, "il y a l'adresse, il y a le mail,
// autant les mettre directement dans le formulaire") : code postal + ville
// -- forme quasi fixe en France (5 chiffres + nom propre), assez fiable
// pour un pre-remplissage. La rue elle-meme (numero + nom de voie) n'a
// aucune forme fiable et n'est jamais tentee (meme prudence que pour le
// nom/prenom).
test('adresse : code postal + ville simple detectee', () => {
  const t = detecterCoordonneesSensibles('12 rue de la Paix, 75001 Paris\nTéléphone : 06 12 34 56 78');
  assert.deepEqual(valeurs(t, '📍'), ['75001 Paris']);
});

test('adresse : ville composee (trait d\'union, 2 mots capitalises) detectee entierement', () => {
  const t = detecterCoordonneesSensibles('63000 Clermont-Ferrand');
  assert.deepEqual(valeurs(t, '📍'), ['63000 Clermont-Ferrand']);
});

test('adresse : code postal invalide (00000) non detecte', () => {
  const t = detecterCoordonneesSensibles('Référence dossier 00000 Non');
  assert.deepEqual(valeurs(t, '📍'), []);
});
