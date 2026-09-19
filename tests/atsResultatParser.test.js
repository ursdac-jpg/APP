const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');
const { parserResultatAts } = require('../modules/ats/resultatParser.js');

const DEPS = { extraireJSON: extraireBlocJSONDepuisTexte };

// CV de reference utilise par la plupart des cas (mode offre, magasin).
const CV = "Employe polyvalent de magasin, 2021 a 2024. Mise en rayon, tenue de caisse, "
  + "accueil et renseignement des clients, reception des livraisons, rangement de la reserve, "
  + "formation des nouveaux collegues.";

function colle(objet, avecProse) {
  const bloc = '```json\n' + JSON.stringify(objet, null, 2) + '\n```';
  return avecProse ? 'Voici la comparaison :\n\n' + bloc + '\n\nBonne continuation !' : bloc;
}

function reponseValide(champs) {
  return Object.assign({
    analyseImpossible: false,
    cvPeuFourni: false,
    referenceFaible: false,
    texteCache: { suspect: false },
    dejaExprime: [{ terme: 'mise en rayon', origine: 'offre' }],
    peutEtreFormuleAutrement: [{
      terme: 'gestion des stocks', origine: 'offre',
      extraitCV: 'reception des livraisons, rangement de la reserve',
      piste: 'Si vous suiviez les quantites, vous pouvez ecrire « gestion des stocks ».'
    }],
    pasRetrouve: [{ terme: 'inventaire', origine: 'offre', note: 'Ne l\'ajoutez pas si vous ne l\'avez pas fait.' }],
    aVerifier: [],
    changementsPrioritaires: [{
      phraseCV: 'reception des livraisons, rangement de la reserve',
      motReference: 'gestion des stocks', condition: 'si vous suiviez les quantites',
      experienceConcernee: 'Employe polyvalent de magasin'
    }],
    sansOffre: null,
    sources: []
  }, champs || {});
}

test('reponse valide dans un bloc + prose : lisible, listes reconstruites', () => {
  const r = parserResultatAts(colle(reponseValide(), true), CV, DEPS);
  assert.equal(r.lisible, true);
  assert.equal(r.analyseImpossible, false);
  assert.equal(r.dejaExprime.length, 1);
  assert.equal(r.peutEtreFormuleAutrement.length, 1);
  assert.equal(r.peutEtreFormuleAutrement[0].terme, 'gestion des stocks');
  assert.equal(r.changementsPrioritaires.length, 1);
});

test('aucun JSON identifiable : lisible = false', () => {
  const r = parserResultatAts('Je ne peux pas faire cela sans plus de contexte, desole.', CV, DEPS);
  assert.equal(r.lisible, false);
  assert.equal(r.dejaExprime.length, 0);
});

test('analyseImpossible : drapeau et message', () => {
  const r = parserResultatAts(colle({ analyseImpossible: true, message: 'Le CV fourni ne permet pas.' }), CV, DEPS);
  assert.equal(r.lisible, true);
  assert.equal(r.analyseImpossible, true);
  assert.match(r.messageImpossible, /ne permet pas/);
});

test('meme terme dans dejaExprime et pasRetrouve : garde seulement dans dejaExprime', () => {
  const r = parserResultatAts(colle(reponseValide({
    dejaExprime: [{ terme: 'gestion des stocks', origine: 'offre' }],
    pasRetrouve: [{ terme: 'Gestion des stocks', origine: 'offre' }]
  })), CV, DEPS);
  assert.equal(r.dejaExprime.length, 1);
  assert.equal(r.pasRetrouve.length, 0);
  assert.ok(r.anomalies.some(a => /pasRetrouve/.test(a)));
});

test('extraitCV fabrique (absent du CV) : entree ecartee + anomalie', () => {
  const r = parserResultatAts(colle(reponseValide({
    peutEtreFormuleAutrement: [{
      terme: 'relation client', origine: 'offre',
      extraitCV: 'Je conseillais chaque client sur mesure',
      piste: 'Vous pouvez ecrire « relation client ».'
    }]
  })), CV, DEPS);
  assert.equal(r.peutEtreFormuleAutrement.length, 0);
  assert.ok(r.anomalies.some(a => /extraitCV absent/.test(a)));
});

test('phraseCV fabriquee dans un changement prioritaire : entree ecartee', () => {
  const r = parserResultatAts(colle(reponseValide({
    changementsPrioritaires: [{
      phraseCV: 'Je pilotais un budget de 2 millions', motReference: 'gestion des stocks',
      condition: 'si...', experienceConcernee: 'x'
    }]
  })), CV, DEPS);
  assert.equal(r.changementsPrioritaires.length, 0);
});

test('peutEtreFormuleAutrement sans piste : ecartee', () => {
  const r = parserResultatAts(colle(reponseValide({
    peutEtreFormuleAutrement: [{ terme: 'gestion des stocks', origine: 'offre', extraitCV: 'rangement de la reserve', piste: '' }]
  })), CV, DEPS);
  assert.equal(r.peutEtreFormuleAutrement.length, 0);
});

test('sources fournies sans terme d\'origine web : ignorees + anomalie', () => {
  const r = parserResultatAts(colle(reponseValide({
    sources: [{ url: 'https://francetravail.fr', date: '2026-09', objet: 'ROME' }]
  })), CV, DEPS);
  assert.equal(r.sources.length, 0);
  assert.ok(r.anomalies.some(a => /sources/.test(a)));
});

test('sources gardees si un terme a origine web', () => {
  const r = parserResultatAts(colle(reponseValide({
    dejaExprime: [{ terme: 'accueil', origine: 'web' }],
    sources: [{ url: 'https://francetravail.fr/fiche', date: '2026-09', objet: 'fiche ROME' }]
  })), CV, DEPS);
  assert.equal(r.sources.length, 1);
  assert.equal(r.sources[0].url, 'https://francetravail.fr/fiche');
});

test('texteCache suspect=true mais bloc = gabarit "..." : ramene a suspect=false', () => {
  const r = parserResultatAts(colle(reponseValide({
    texteCache: { suspect: true, extraits: [{ avant: '...', bloc: '...', apres: '...' }], explication: '...' }
  })), CV, DEPS);
  assert.equal(r.texteCache.suspect, false);
  assert.equal(r.texteCache.extraits.length, 0);
});

test('texteCache suspect=true avec un bloc reellement present dans le CV : conserve', () => {
  const cvPiege = CV + "   management gestion de projet leadership reporting budget pilotage agile scrum   Centres d'interet : randonnee.";
  const r = parserResultatAts(colle(reponseValide({
    texteCache: {
      suspect: true,
      extraits: [{
        avant: 'formation des nouveaux collegues.',
        bloc: 'management gestion de projet leadership reporting budget pilotage agile scrum',
        apres: "Centres d'interet"
      }],
      explication: 'Suite de termes sans phrase ni contexte.'
    }
  })), cvPiege, DEPS);
  assert.equal(r.texteCache.suspect, true);
  assert.equal(r.texteCache.extraits.length, 1);
  assert.match(r.texteCache.explication, /sans phrase/);
});

test('texteCache suspect=true avec un bloc absent du CV : ignore', () => {
  const r = parserResultatAts(colle(reponseValide({
    texteCache: { suspect: true, extraits: [{ avant: 'x', bloc: 'blockchain nft web3 metavers', apres: 'y' }], explication: 'z' }
  })), CV, DEPS);
  assert.equal(r.texteCache.suspect, false);
});

test('plafond 5 sur peutEtreFormuleAutrement', () => {
  const items = [];
  for (let i = 0; i < 8; i++) {
    items.push({ terme: 'terme' + i, origine: 'offre', extraitCV: 'mise en rayon', piste: 'Vous pouvez ecrire « terme' + i + ' ».' });
  }
  const r = parserResultatAts(colle(reponseValide({ peutEtreFormuleAutrement: items })), CV, DEPS);
  assert.equal(r.peutEtreFormuleAutrement.length, 5);
});

test('changementsPrioritaires : plafond 3 et motReference distinct', () => {
  const r = parserResultatAts(colle(reponseValide({
    changementsPrioritaires: [
      { phraseCV: 'mise en rayon', motReference: 'A', condition: 's', experienceConcernee: 'x' },
      { phraseCV: 'tenue de caisse', motReference: 'A', condition: 's', experienceConcernee: 'x' },
      { phraseCV: 'reception des livraisons', motReference: 'B', condition: 's', experienceConcernee: 'x' },
      { phraseCV: 'rangement de la reserve', motReference: 'C', condition: 's', experienceConcernee: 'x' },
      { phraseCV: 'formation des nouveaux collegues', motReference: 'D', condition: 's', experienceConcernee: 'x' }
    ]
  })), CV, DEPS);
  assert.equal(r.changementsPrioritaires.length, 3);
  const mots = r.changementsPrioritaires.map(c => c.motReference);
  assert.deepEqual(mots, ['A', 'B', 'C']);
});

test('mode metier : sansOffre reconstruit (3 mots max), cvPeuFourni transmis', () => {
  const r = parserResultatAts(colle(reponseValide({
    cvPeuFourni: true,
    sansOffre: { motsPrioritaires: ['accueil', 'gestion administrative', 'standard telephonique', 'quatrieme'], clarificationProjet: 'Vous visez un poste d\'accueil.' }
  })), CV, DEPS);
  assert.equal(r.cvPeuFourni, true);
  assert.equal(r.sansOffre.motsPrioritaires.length, 3);
  assert.match(r.sansOffre.clarificationProjet, /accueil/);
});

test('garde-fou incoherence de mode : sansOffre rempli malgre un mode offre est ignore', () => {
  // prompts/ats.md section 6 : sansOffre est reserve au mode metier. Si
  // l'assistant l'a quand meme rempli alors que la personne a fourni une
  // offre (modeReference 'offre' passe explicitement), l'ecran ne doit
  // jamais afficher "Sans offre precise" -- ca contredirait ce qu'elle a
  // saisi. Sans le 4e argument (comportement historique, cas ci-dessus),
  // rien ne change : le garde-fou est opt-in.
  const r = parserResultatAts(colle(reponseValide({
    sansOffre: { motsPrioritaires: ['accueil'], clarificationProjet: 'Vous visez un poste d\'accueil.' }
  })), CV, DEPS, 'offre');
  assert.equal(r.sansOffre, null);
  assert.ok(r.anomalies.some(a => /sansOffre fourni en mode offre/.test(a)));
});

test('guillemets typographiques dans le JSON (echec reel de ChatGPT) : extraits et parses', () => {
  const brut = '{\n'
    + '  “analyseImpossible”: false,\n'
    + '  “dejaExprime”: [ { “terme”: “mise en rayon”, “origine”: “offre” } ],\n'
    + '  “peutEtreFormuleAutrement”: [], “pasRetrouve”: [], “aVerifier”: [],\n'
    + '  “changementsPrioritaires”: [], “sansOffre”: null, “sources”: [],\n'
    + '  “texteCache”: { “suspect”: false }\n'
    + '}';
  const r = parserResultatAts(brut, CV, DEPS);
  assert.equal(r.lisible, true);
  assert.equal(r.dejaExprime.length, 1);
  assert.equal(r.dejaExprime[0].terme, 'mise en rayon');
});

test('origine inconnue : ramenee a null, entree conservee', () => {
  const r = parserResultatAts(colle(reponseValide({
    dejaExprime: [{ terme: 'mise en rayon', origine: 'inventee' }]
  })), CV, DEPS);
  assert.equal(r.dejaExprime.length, 1);
  assert.equal(r.dejaExprime[0].origine, null);
});

test('jamais de throw sur des listes de types inattendus', () => {
  assert.doesNotThrow(() => {
    parserResultatAts(colle(reponseValide({
      dejaExprime: 'pas un tableau', peutEtreFormuleAutrement: null,
      pasRetrouve: [null, 42, { terme: 'inventaire', origine: 'offre' }],
      aVerifier: [{}], changementsPrioritaires: undefined
    })), CV, DEPS);
  });
});
