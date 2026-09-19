const { test } = require('node:test');
const assert = require('node:assert/strict');

require('./_domStub').installerStubDom();
const { extraireBlocJSONDepuisTexte } = require('../js/app.js');

const { bilanParserReponseAmelioration, bilanParserReponseAmeliorationLot } = require('../modules/bilan-candidature/amelioration/ameliorationResponseParser.js');

const DEPENDANCES = { extraireJSON: extraireBlocJSONDepuisTexte };

function demandeAmelioration(champsSupp) {
  return Object.assign({
    id: 'dem-1',
    recommandationSelectionnee: { id: 'reco-1' }
  }, champsSupp || {});
}

function texteColleDepuis(objet, avecTexteParasite) {
  const bloc = '```json\n' + JSON.stringify(objet, null, 2) + '\n```';
  return avecTexteParasite
    ? 'Voici la proposition d\'amélioration :\n\n' + bloc + '\n\nN\'hésitez pas à l\'adapter !'
    : bloc;
}

test('cas nominal : construit une PropositionAmelioration complete', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'Texte amélioré.', justification: 'Répond à l\'observation X.', actionsConcretes: ['Copier ce texte à la place du paragraphe actuel.'] }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(proposition.proposition, 'Texte amélioré.');
  assert.equal(proposition.actionsConcretes.length, 1);
});

test('texte parasite avant/après le JSON : extrait quand meme le bloc', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', actionsConcretes: [] }, true),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(proposition.proposition, 'x');
});

test('actionsConcretes absent ou mal forme : tableau vide, jamais un echec (liste vide = resultat normal)', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.deepEqual(proposition.actionsConcretes, []);
});

test('actionsConcretes contenant des elements non-chaines : filtres, jamais un echec', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', actionsConcretes: ['valide', 42, null, '   '] }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.deepEqual(proposition.actionsConcretes, ['valide']);
});

test('traçabilité : demandeAmeliorationId et recommandationId viennent toujours de la DemandeAmelioration, jamais de la reponse IA', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', demandeAmeliorationId: 'dem-usurpe', recommandationId: 'reco-usurpe' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(proposition.demandeAmeliorationId, 'dem-1');
  assert.equal(proposition.recommandationId, 'reco-1');
});

test('proposition manquante : leve ReponseIncomplete', () => {
  assert.throws(
    () => bilanParserReponseAmelioration(texteColleDepuis({ justification: 'y' }), demandeAmelioration(), DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIncomplete' && erreur.details.propositionPresente === false
  );
});

test('justification manquante : leve ReponseIncomplete', () => {
  assert.throws(
    () => bilanParserReponseAmelioration(texteColleDepuis({ proposition: 'x' }), demandeAmelioration(), DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIncomplete' && erreur.details.justificationPresente === false
  );
});

test('aucun JSON identifiable : leve ReponseIllisible', () => {
  assert.throws(
    () => bilanParserReponseAmelioration('Juste du texte libre, pas de JSON.', demandeAmelioration(), DEPENDANCES),
    (erreur) => erreur.code === 'ReponseIllisible'
  );
});

test('DemandeAmelioration invalide fournie au parseur : leve RecommandationInexistante', () => {
  assert.throws(
    () => bilanParserReponseAmelioration(texteColleDepuis({ proposition: 'x', justification: 'y' }), null, DEPENDANCES),
    (erreur) => erreur.code === 'RecommandationInexistante'
  );
});

// TACHE (contrat Niveau 2, 2026-08-11, voir docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md)

test('action valide (completer/creer) : transmise telle quelle', () => {
  const propositionCompleter = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', action: 'completer' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(propositionCompleter.action, 'completer');

  const propositionCreer = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', action: 'creer' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(propositionCreer.action, 'creer');
});

test('action absente (cas extraitConcerne present, Niveau 1) : null, jamais un echec', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(proposition.action, null);
});

test('action hors enumeration (ex. "remplacer", deja couvert par le Niveau 1) : null, jamais un echec', () => {
  const proposition = bilanParserReponseAmelioration(
    texteColleDepuis({ proposition: 'x', justification: 'y', action: 'remplacer' }),
    demandeAmelioration(), DEPENDANCES
  );
  assert.equal(proposition.action, null);
});

// TACHE (correctif "suggestion pertinente par experience", Carte 3, 2026-08-25)

function texteColleTableauDepuis(items) {
  return '```json\n' + JSON.stringify(items, null, 2) + '\n```';
}

test('bilanParserReponseAmeliorationLot : correspond par demande.id, pas par recommandationSelectionnee.id -- 2 demandes de la MEME recommandation (multi-experiences) restent distinctes', () => {
  const demandes = [
    demandeAmelioration({ id: 'dem-a', recommandationSelectionnee: { id: 'reco-r1' } }),
    demandeAmelioration({ id: 'dem-b', recommandationSelectionnee: { id: 'reco-r1' } })
  ];
  const propositions = bilanParserReponseAmeliorationLot(
    texteColleTableauDepuis([
      { id: 'dem-a', proposition: 'Texte pour experience A.', justification: 'y' },
      { id: 'dem-b', proposition: 'Texte pour experience B.', justification: 'y' }
    ]),
    demandes, DEPENDANCES
  );
  assert.equal(propositions.length, 2);
  const parId = {}; propositions.forEach((p) => { parId[p.demandeAmeliorationId] = p; });
  assert.equal(parId['dem-a'].proposition, 'Texte pour experience A.');
  assert.equal(parId['dem-b'].proposition, 'Texte pour experience B.');
  assert.equal(parId['dem-a'].recommandationId, 'reco-r1');
  assert.equal(parId['dem-b'].recommandationId, 'reco-r1');
});

test('bilanParserReponseAmeliorationLot : pertinent absent de la reponse -> true par defaut', () => {
  const propositions = bilanParserReponseAmeliorationLot(
    texteColleTableauDepuis([{ id: 'dem-1', proposition: 'x', justification: 'y' }]),
    [demandeAmelioration()], DEPENDANCES
  );
  assert.equal(propositions[0].pertinent, true);
});

test('bilanParserReponseAmeliorationLot : pertinent: false transmis tel quel', () => {
  const propositions = bilanParserReponseAmeliorationLot(
    texteColleTableauDepuis([{ id: 'dem-1', proposition: 'x', justification: 'y', pertinent: false }]),
    [demandeAmelioration()], DEPENDANCES
  );
  assert.equal(propositions[0].pertinent, false);
});
