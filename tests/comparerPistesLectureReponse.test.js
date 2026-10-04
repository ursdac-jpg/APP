const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./_domStub').installerStubDom();
global.FREINS_REPERTOIRE = require('../data/freins.js').FREINS_REPERTOIRE;
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');
global.extraireBlocJSONDepuisTexte = extraireBlocJSONDepuisTexte;
const cp = require('../modules/comparer-pistes/index.js');

// Extrait fidèle de la réponse réelle collée par Denis le 2026-09-30 (CAP plomberie, Dordogne) : antislashs devant _ [ ] (affichage mis en
// forme copié), étiquettes de sources en fin de phrase, valeurs « null » écrites en texte.
const AS = String.fromCharCode(92);
const REPONSE_REELLE = [
  '{' + AS,
  ' "territoire": "le département de la Dordogne (24), en Nouvelle-Aquitaine",' + AS,
  ' "pistes": ' + AS + '[' + AS,
  ' {' + AS,
  ' "nom": "CAP plomberie",' + AS,
  ' "durable": {' + AS,
  ' "en' + AS + '_quoi' + AS + '_ca' + AS + '_consiste": "Le CAP monteur en installations sanitaires prépare aux activités de plomberie.",' + AS,
  ' "niveau' + AS + '_ou' + AS + '_diplome": "CAP monteur en installations sanitaires, niveau 3. Le CAP se prépare généralement en 2 ans après la 3e.  Onisep  ",' + AS,
  ' "activites' + AS + '_principales": "Préparer une intervention, installer et raccorder des canalisations.  France Travail+1  ",' + AS,
  ' "handicap' + AS + '_amenagements": null' + AS,
  ' },' + AS,
  ' "a' + AS + '_verifier": ' + AS + '[' + AS,
  ' {' + AS,
  ' "element": "duree' + AS + '_formation",' + AS,
  ' "valeur": "null",' + AS,
  ' "unite": "null",' + AS,
  ' "portee": "departementale",' + AS,
  ' "source": { "nom": "France Travail", "url": "https://candidat.francetravail.fr/formations/detail/11302324" },' + AS,
  ' "date' + AS + '_info": null' + AS,
  ' },' + AS,
  ' {' + AS,
  ' "element": "remuneration' + AS + '_embauche",' + AS,
  ' "valeur": "1868-1868",' + AS,
  ' "unite": "euros' + AS + '_brut' + AS + '_mensuel",' + AS,
  ' "portee": "nationale",' + AS,
  ' "source": { "nom": "Onisep", "url": null },' + AS,
  ' "date' + AS + '_info": null' + AS,
  ' }' + AS,
  ' ' + AS + '],' + AS,
  ' "incertitudes": ' + AS + '[ "La fiche indique 840 heures mais pas de durée en semaines." ' + AS + ']' + AS,
  ' }' + AS,
  ' ' + AS + '],' + AS,
  ' "cloture": "Ces informations servent à préparer un échange avec un conseiller."' + AS,
  ' }'
].join('\n');

test('collecte : la réponse réelle avec antislashs et étiquettes de sources est lue', () => {
  const r = cp.comparerParserCollecte(REPONSE_REELLE);
  assert.equal(r.erreur, undefined);
  assert.equal(r.pistes.length, 1);
  assert.equal(r.pistes[0].nom, 'CAP plomberie');
  assert.equal(r.territoire, 'le département de la Dordogne (24), en Nouvelle-Aquitaine');
  const av = r.pistes[0].a_verifier;
  assert.equal(av[0].element, 'duree_formation');
  assert.equal(av[0].valeur, null);
  assert.equal(av[1].valeur, '1868-1868');
  assert.equal(r.pistes[0].incertitudes.length, 1);
});

test('collecte : les étiquettes de sources en fin de phrase sont retirées des textes affichés', () => {
  const r = cp.comparerParserCollecte(REPONSE_REELLE);
  const d = r.pistes[0].durable;
  assert.equal(d.niveau_ou_diplome, 'CAP monteur en installations sanitaires, niveau 3. Le CAP se prépare généralement en 2 ans après la 3e.');
  assert.equal(d.activites_principales, 'Préparer une intervention, installer et raccorder des canalisations.');
});

test('étiquette de source : un texte normal n\'est jamais tronqué', () => {
  assert.equal(cp.comparerNettoyerEtiquetteSource('Travail manuel et physique.'), 'Travail manuel et physique.');
  assert.equal(cp.comparerNettoyerEtiquetteSource('Salaire de 1 800 euros. Voir aussi la convention.'), 'Salaire de 1 800 euros. Voir aussi la convention.');
  assert.equal(cp.comparerNettoyerEtiquetteSource('Formation en 2 ans.  Onisep+1  '), 'Formation en 2 ans.');
  assert.equal(cp.comparerNettoyerEtiquetteSource(null), null);
});

test('collecte : une réponse au format propre est lue exactement comme avant', () => {
  const propre = JSON.stringify({ territoire: 'Dordogne', pistes: [{ nom: 'A', durable: { x: 'y.' }, a_verifier: [{ element: 'lieux', valeur: 'Périgueux', source: { nom: 'FT', url: null } }], incertitudes: [] }], cloture: 'ok' });
  const r = cp.comparerParserCollecte(propre);
  assert.equal(r.pistes[0].a_verifier[0].valeur, 'Périgueux');
  assert.equal(r.pistes[0].durable.x, 'y.');
});
