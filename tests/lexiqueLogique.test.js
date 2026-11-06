const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE du module Lexique. Ajoutee lors de l'audit de
// stabilisation du 2026-09-12 : ce module n'avait jusque-la aucune
// couverture Node, contrairement a ses voisins ATS/Regard recruteur.
// Ces fonctions lisent les globales LEXIQUE_FICHES/LEXIQUE_COLLECTIONS/
// LEXIQUE_SECOND_NIVEAU/normaliserTexte (chargees en vrai par un
// <script> navigateur) : on les pose ici avec un petit jeu de fiches,
// jamais le vrai corpus de data/lexique.js (deja couvert par
// scripts/checkLexique.js).
const { normaliserTexte } = require('../data/metiers.js');
global.normaliserTexte = normaliserTexte;
global.LEXIQUE_FICHES = [
  { id: 'cdi', titre: 'Contrat à durée indéterminée', variantesRecherche: ['cdi'], relations: [{ type: 'voir-aussi', ficheId: 'cdd' }] },
  { id: 'cdd', titre: 'Contrat à durée déterminée', variantesRecherche: ['cdd'] },
  { id: 'sans-lien', titre: 'Fiche isolée', variantesRecherche: [] }
];
global.LEXIQUE_COLLECTIONS = [
  { id: 'coll-contrats', fichesOrdonnees: ['cdi', 'cdd'] },
  { id: 'coll-solo', fichesOrdonnees: ['cdd'] }
];
global.LEXIQUE_SECOND_NIVEAU = [
  { id: 'sn-details', fichesEntree: ['cdi'] }
];

const {
  _lexiqueRechercher,
  _lexiqueConstruireIndexRelations,
  _lexiqueConstruireIndexCollections,
  _lexiqueConstruireIndexSecondNiveau
} = require('../modules/lexique/index.js');

test('rechercher : trouve par titre (insensible aux accents/majuscules)', () => {
  const r = _lexiqueRechercher('DUREE INDETERMINEE');
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 'cdi');
});

test('rechercher : trouve par variante de recherche', () => {
  const r = _lexiqueRechercher('cdd');
  assert.equal(r.length, 1);
  assert.equal(r[0].id, 'cdd');
});

test('rechercher : texte vide, espaces seuls, ou sans resultat -> tableau vide, jamais d\'exception', () => {
  assert.deepEqual(_lexiqueRechercher(''), []);
  assert.deepEqual(_lexiqueRechercher('   '), []);
  assert.deepEqual(_lexiqueRechercher('mot introuvable xyz'), []);
});

test('rechercher : caracteres speciaux ne cassent jamais la recherche', () => {
  assert.doesNotThrow(() => _lexiqueRechercher('%^*()[]{}.*+?'));
});

test('indexRelations : fusionne les relations declarees dans les 2 sens, dedupliquees', () => {
  const idx = _lexiqueConstruireIndexRelations();
  assert.deepEqual(Object.keys(idx['cdi']['voir-aussi']), ['cdd']);
  assert.deepEqual(Object.keys(idx['cdd']['voir-aussi']), ['cdi']);
  assert.deepEqual(idx['sans-lien'], { 'voir-aussi': {}, 'a-ne-pas-confondre': {} });
});

test('indexCollections : inverse fichesOrdonnees -> id de fiche -> liste de collections', () => {
  const idx = _lexiqueConstruireIndexCollections();
  assert.deepEqual(idx['cdi'], ['coll-contrats']);
  assert.deepEqual(idx['cdd'], ['coll-contrats', 'coll-solo']);
  assert.equal(idx['sans-lien'], undefined);
});

test('indexSecondNiveau : inverse fichesEntree -> id de fiche -> liste d\'entrees de second niveau', () => {
  const idx = _lexiqueConstruireIndexSecondNiveau();
  assert.deepEqual(idx['cdi'], ['sn-details']);
  assert.equal(idx['cdd'], undefined);
});

// ---------- « Les chiffres a jour » d'une fiche (chantier du 20 octobre 2026) : la regle des 6 mois, avec des dates simulees ----------
const { _lexiqueEtatDetails, _lexiqueRenduDetails, _lexiqueCorpsAffiche, _lexiqueEtatSuivi, _lexiqueRenduCorpsSecondNiveau, _lexiqueDateFr, LEXIQUE_SEUIL_MOIS_DETAILS } = require('../modules/lexique/index.js');
global.echapperAttribut = function (t) { return String(t || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
const BLOC_TEST = {
  verifieLe: '2026-10-12',
  source: { nom: 'service-public.fr', url: 'https://www.service-public.fr' },
  lignes: [{ libelle: 'Plafond', valeur: '1 500 €', categorie: 'montant', peutChanger: true }, { libelle: 'Décret', valeur: '26 février 2026', categorie: 'date', peutChanger: false }]
};

test('chiffres a jour : la regle des 6 mois, jour par jour (dates simulees)', () => {
  assert.equal(LEXIQUE_SEUIL_MOIS_DETAILS, 6);
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2026-10-12'), 'ajour', 'le jour meme');
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2027-04-10'), 'ajour', 'presque 6 mois');
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2027-04-13'), 'message', '6 mois revolus');
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2028-01-01'), 'message');
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2026-10-12', 3), 'ajour');
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2027-01-20', 3), 'message', 'seuil reglable a 3 mois');
});

test('chiffres a jour : horloge de l\'appareil en retard, jamais verifie, faits qui ne changent pas, bloc mal forme', () => {
  assert.equal(_lexiqueEtatDetails(BLOC_TEST, '2025-01-01'), 'ajour', 'horloge avant la verification : jamais masque a tort');
  assert.equal(_lexiqueEtatDetails(Object.assign({}, BLOC_TEST, { verifieLe: '' }), '2026-10-20'), 'message', 'jamais verifie');
  assert.equal(_lexiqueEtatDetails(Object.assign({}, BLOC_TEST, { verifieLe: undefined }), '2026-10-20'), 'message');
  assert.equal(_lexiqueEtatDetails(Object.assign({}, BLOC_TEST, { verifieLe: 'bientot' }), '2026-10-20'), 'message');
  const stable = Object.assign({}, BLOC_TEST, { verifieLe: '', lignes: [{ libelle: 'Fin', valeur: '31 décembre 2024', categorie: 'date', peutChanger: false }] });
  assert.equal(_lexiqueEtatDetails(stable, '2040-01-01'), 'stable', 'un fait passe ne se perime jamais, meme sans date');
  [undefined, null, 5, {}, { lignes: [] }, { lignes: 'x', source: BLOC_TEST.source }, { lignes: BLOC_TEST.lignes }, { lignes: BLOC_TEST.lignes, source: {} }].forEach((m) => {
    assert.equal(_lexiqueEtatDetails(m, '2026-10-20'), 'absent', JSON.stringify(m));
  });
});

test('chiffres a jour : le rendu (bloc, message general, rien), tout est echappe et la source n\'est un lien que si elle est en https', () => {
  const fiche = { id: 'x', detailsAJour: BLOC_TEST };
  const ajour = _lexiqueRenduDetails(fiche, '2026-10-20');
  assert.match(ajour, /data-lexique-chiffres="ajour"/);
  assert.match(ajour, /Les chiffres à jour/);
  assert.match(ajour, /<dt>Plafond<\/dt><dd>1 500 €<\/dd>/);
  assert.match(ajour, /Vérifié le 12 octobre 2026\./);
  assert.match(ajour, /href="https:\/\/www\.service-public\.fr"[^>]*rel="noopener noreferrer"/);
  assert.match(ajour, /vous quittez l’application/);
  const perime = _lexiqueRenduDetails(fiche, '2027-06-01');
  assert.match(perime, /data-lexique-chiffres="message"/);
  assert.ok(perime.indexOf('1 500') === -1, 'aucun chiffre du bloc n\'est montre quand il est perime');
  assert.match(perime, /changent régulièrement/);
  assert.match(perime, /service-public\.fr/);
  assert.equal(_lexiqueRenduDetails({ id: 'y' }, '2026-10-20'), '');
  const piege = { detailsAJour: { verifieLe: '2026-10-12', source: { nom: '<b>x</b>', url: 'javascript:alert(1)' }, lignes: [{ libelle: '<img src=x onerror=alert(1)>', valeur: '"a" & b', categorie: 'date', peutChanger: true }] } };
  const h = _lexiqueRenduDetails(piege, '2026-10-20');
  assert.ok(h.indexOf('<img') === -1 && h.indexOf('<b>') === -1, 'HTML brut jamais insere');
  assert.ok(h.indexOf('href=') === -1, 'une adresse qui n\'est pas en https n\'est jamais un lien');
  assert.match(h, /&quot;a&quot; &amp; b/);
  const stable = _lexiqueRenduDetails({ detailsAJour: { verifieLe: '', source: BLOC_TEST.source, lignes: [BLOC_TEST.lignes[1]] } }, '2040-01-01');
  assert.match(stable, /data-lexique-chiffres="stable"/);
  assert.ok(stable.indexOf('Vérifié le') === -1, 'un fait passe ne porte pas de date de verification');
  assert.equal(_lexiqueDateFr('2026-11-01'), '1er novembre 2026');
  assert.equal(_lexiqueDateFr('n’importe quoi'), '');
});

test('phrase generale : le texte precis tant que le bloc est a jour, la phrase generale ensuite (consigne 95)', () => {
  const fiche = { id: 'x', corps: 'Une aide de 1 500 € par mois.', detailsAJour: Object.assign({}, BLOC_TEST, { phraseGenerale: 'Une aide dont le montant change.' }) };
  assert.equal(_lexiqueCorpsAffiche(fiche, '2026-12-01'), 'Une aide de 1 500 € par mois.', 'a jour : texte precis');
  assert.equal(_lexiqueCorpsAffiche(fiche, '2027-04-13'), 'Une aide dont le montant change.', 'plus de 6 mois : phrase generale');
  const jamais = { id: 'y', corps: 'Texte precis.', detailsAJour: Object.assign({}, BLOC_TEST, { verifieLe: '', phraseGenerale: 'Phrase generale.' }) };
  assert.equal(_lexiqueCorpsAffiche(jamais, '2026-12-01'), 'Phrase generale.', 'jamais verifie : phrase generale');
  const sansPhrase = { id: 'z', corps: 'Texte precis.', detailsAJour: BLOC_TEST };
  assert.equal(_lexiqueCorpsAffiche(sansPhrase, '2028-01-01'), 'Texte precis.', 'sans phrase generale : le texte reste');
  assert.equal(_lexiqueCorpsAffiche({ id: 'w', corps: 'Sans bloc.' }, '2028-01-01'), 'Sans bloc.');
});

test('second niveau : texte précis tant que le suivi a moins de 6 mois, phrase générale ensuite (consigne 95 étendue)', () => {
  const entree = { id: 'sn', corps: 'Depuis le 1er septembre 2026, la durée est de 15 mois.', suivi: { verifieLe: '2026-11-03', source: { nom: 'Service Public', url: 'https://www.service-public.gouv.fr/x' }, phraseGenerale: 'Une durée qui change.' } };
  assert.equal(_lexiqueEtatSuivi(entree.suivi, '2026-12-01'), 'ajour');
  assert.equal(_lexiqueEtatSuivi(entree.suivi, '2027-05-04'), 'ajour', 'presque 6 mois');
  assert.equal(_lexiqueEtatSuivi(entree.suivi, '2027-05-06'), 'message', '6 mois révolus');
  assert.equal(_lexiqueEtatSuivi(Object.assign({}, entree.suivi, { verifieLe: '' }), '2026-12-01'), 'message', 'jamais daté');
  assert.equal(_lexiqueEtatSuivi(undefined, '2026-12-01'), 'absent');
  assert.equal(_lexiqueEtatSuivi(Object.assign({}, entree.suivi, { phraseGenerale: '' }), '2026-12-01'), 'absent', 'sans phrase générale : le texte reste');
  const ajour = _lexiqueRenduCorpsSecondNiveau(entree, '2026-12-01');
  assert.ok(/15 mois/.test(ajour) && /Vérifié le 3 novembre 2026/.test(ajour) && /href="https:\/\/www.service-public.gouv.fr\/x"/.test(ajour));
  const message = _lexiqueRenduCorpsSecondNiveau(entree, '2027-06-01');
  assert.ok(/Une durée qui change\./.test(message) && !/15 mois/.test(message) && /data-lexique-suivi="message"/.test(message) && /href="https:\/\/www.service-public.gouv.fr\/x"/.test(message));
  assert.equal(_lexiqueRenduCorpsSecondNiveau({ id: 'sans', corps: 'Texte <b>brut</b>.' }, '2027-06-01'), '<p class="mb-0">Texte &lt;b&gt;brut&lt;/b&gt;.</p>');
});
