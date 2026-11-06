const test = require('node:test');
const assert = require('node:assert');
const T = require('../outils/veilleTerritoire.js');
const S = require('../outils/veilleSas.js');

// Demande de Denis (04/11/2026) : valider environ 500 fiches du sas d'un seul « Enregistrer », sans plafond de 100.
// Ajouter au registre ET retirer du sas passent par deux plafonds : les deux doivent laisser passer 500 fiches.

const AUJ = '2026-11-04';
const ENTETE = '# Registre des structures\n# FORMAT : id | type | nom | description | commune | zone | telephone | site | portee | rayons | source | date\n#\n';
const CTX = {
  aujourdhui: AUJ, secteurs: ['commerce-vente'], secteursLibelles: [{ cle: 'commerce-vente', libelle: 'Commerce et vente' }],
  communes: ['limoges'], communesNoms: ['Limoges']
};
const ligne = (id) => [id, 'ccas', 'Nom ' + id, 'une phrase', 'Limoges', '', '', 'https://' + id + '.example.org/', '87', 'logement', 'Source de depart', ''].join(' | ');
const ids = (n) => Array.from({ length: n }, (_, i) => 'fiche-' + i + '-87');

test('registre : 500 fiches ajoutées en un seul enregistrement', () => {
  const actions = ids(500).map((id) => ({ op: 'ajouter', id: id, valeurs: { type: 'ccas', nom: 'Nom ' + id, description: 'une phrase', commune: 'Limoges', site: 'https://' + id + '.example.org/', portee: '87', rayons: 'logement', source: 'Source' }, dater: true }));
  const r = T.appliquer('lieux', ENTETE, actions, AUJ, CTX);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(r.resume.ajoutes, 500);
});

test('registre : au-delà du plafond (1 000), la demande est refusée avec un message clair', () => {
  const actions = ids(1001).map((id) => ({ op: 'ajouter', id: id, valeurs: {}, dater: true }));
  const r = T.appliquer('lieux', ENTETE, actions, AUJ, CTX);
  assert.ok(!r.ok);
  assert.ok(/1000 au plus/.test(r.erreur));
});

test('sas : 500 fiches retirées en un seul enregistrement', () => {
  const texte = '# sas\n#\n' + ids(500).map(ligne).join('\n') + '\n';
  const r = S.appliquer('lieux', texte, ids(500).map((id) => ({ op: 'retirer', id: id })), { lieux: ENTETE, employeurs: '' }, CTX, AUJ);
  assert.ok(r.ok, r.erreur);
  assert.strictEqual(r.resume.retires, 500);
});
