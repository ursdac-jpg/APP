const test = require('node:test');
const assert = require('node:assert');
const V = require('../outils/veillePreuveVerif.js');

const PUBLIC = () => Promise.resolve([{ address: '93.184.216.34' }]);
const LONG = ' Le texte de la page continue avec de nombreuses informations utiles pour les personnes en recherche d\'emploi, des démarches, des délais, des montants et des adresses.'.repeat(6);
function page(corps, extra) { return new Response('<html><head><title>Page</title></head><body><p>' + corps + '</p></body></html>', Object.assign({ status: 200, headers: { 'content-type': 'text/html; charset=utf-8' } }, extra || {})); }
function faux(table) {
  return (url) => {
    const r = table[url];
    if (!r) { return Promise.resolve(new Response('', { status: 404 })); }
    // Une réponse neuve à chaque appel (un clone resterait lié à l'original et bloquerait l'annulation de la lecture).
    return r.clone().text().then(function (texte) { return new Response(texte, { status: r.status, headers: r.headers }); });
  };
}
const PASSAGE = 'Le titre de séjour doit être renouvelé deux mois avant son expiration';

test('comparer : retrouvé malgré accents, majuscules, ponctuation ; proche si quelques mots changent ; non retrouvé sinon', () => {
  const texte = 'bla le titre de sejour doit etre renouvele deux mois avant son expiration bla';
  assert.strictEqual(V.comparer(texte, 'Le TITRE de séjour, doit être renouvelé : deux mois avant son expiration.').verdict, 'retrouve');
  assert.strictEqual(V.comparer(texte, 'Le titre de séjour doit être renouvelé trois mois avant son expiration').verdict, 'proche');
  assert.strictEqual(V.comparer(texte, 'Aucun renouvellement n\'est nécessaire pour les étudiants étrangers inscrits').verdict, 'non-retrouve');
});

test('adresses acceptées : https public sans port ni identifiant, 300 caractères au plus', () => {
  assert.ok(V.adresseAcceptable('https://www.service-public.fr/page'));
  for (const a of ['http://exemple.fr/p', 'https://exemple.fr:8443/p', 'https://u:p@exemple.fr/p', 'https://exemple.fr/ p', 'ftp://exemple.fr', '', 'https://exemple.fr/' + 'a'.repeat(300)]) { assert.ok(!V.adresseAcceptable(a), a); }
});

test('verifier : retrouvé, non retrouvé, adresse introuvable, refusée, page affichée par script, adresse interdite', async () => {
  const f = faux({
    'https://a.gouv.fr/ok': page(PASSAGE + '.' + LONG),
    'https://a.gouv.fr/autre': page('Une tout autre information sans rapport avec la question posée.' + LONG),
    'https://a.gouv.fr/refus': new Response('', { status: 403 }),
    'https://a.gouv.fr/script': page('Chargement')
  });
  const r = await V.verifier([
    { id: 'f-1', adresse: 'https://a.gouv.fr/ok', passage: PASSAGE },
    { id: 'f-2', adresse: 'https://a.gouv.fr/autre', passage: PASSAGE },
    { id: 'f-3', adresse: 'https://a.gouv.fr/inexistante', passage: PASSAGE },
    { id: 'f-4', adresse: 'https://a.gouv.fr/refus', passage: PASSAGE },
    { id: 'f-5', adresse: 'https://a.gouv.fr/script', passage: PASSAGE },
    { id: 'f-6', adresse: 'http://a.gouv.fr/ok', passage: PASSAGE },
    { id: 'f-7', adresse: 'https://a.gouv.fr/ok', passage: 'oui' }
  ], { fetch: f, resoudre: PUBLIC });
  assert.strictEqual(r.ok, true);
  const v = {}; r.resultats.forEach((x) => { v[x.id] = x.verdict; });
  assert.deepStrictEqual(v, { 'f-1': 'retrouve', 'f-2': 'non-retrouve', 'f-3': 'adresse-introuvable', 'f-4': 'non-lisible', 'f-5': 'non-lisible', 'f-6': 'non-lisible', 'f-7': 'non-lisible' });
});

test('verifier : un site privé ou local n\'est jamais ouvert ; une même page n\'est lue qu\'une fois ; trop de lignes ou liste vide = refus clair', async () => {
  let appels = 0;
  const f = (url) => { appels++; return Promise.resolve(page(PASSAGE + LONG)); };
  const prive = await V.verifier([{ id: 'p-1', adresse: 'https://interne.exemple/page', passage: PASSAGE }], { fetch: f, resoudre: () => Promise.resolve([{ address: '10.0.0.5' }]) });
  assert.strictEqual(prive.resultats[0].verdict, 'non-lisible');
  assert.strictEqual(appels, 0, 'aucune requête vers un site privé');
  appels = 0;
  await V.verifier([{ id: 'm-1', adresse: 'https://a.gouv.fr/ok', passage: PASSAGE }, { id: 'm-2', adresse: 'https://a.gouv.fr/ok', passage: PASSAGE }], { fetch: f, resoudre: PUBLIC });
  assert.strictEqual(appels, 1, 'la même adresse est lue une seule fois');
  assert.strictEqual((await V.verifier([])).ok, false);
  const trop = Array.from({ length: V.MAX_LIGNES + 1 }, (_, i) => ({ id: 'x-' + i, adresse: 'https://a.gouv.fr/ok', passage: PASSAGE }));
  assert.strictEqual((await V.verifier(trop)).ok, false);
});
