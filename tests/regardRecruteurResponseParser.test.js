const { test } = require('node:test');
const assert = require('node:assert/strict');

// Module AUTONOME : le parser n'a AUCUNE dependance a js/app.js.
// On ne charge donc ni _domStub ni app.js -- le test reste isole du
// chantier en cours sur js/app.js (autre fenetre).
const {
  regardRecruteurParserRapport,
  regardRecruteurRapportEstValide,
  REGARD_RECRUTEUR_AXES
} = require('../modules/regard-recruteur/rapportResponseParser.js');

const CTX_IMAGE = { modeAnalyse: 'image', siteEntrepriseFourni: true };
const CTX_IMAGE_SANS_SITE = { modeAnalyse: 'image', siteEntrepriseFourni: false };
const CTX_TEXTE = { modeAnalyse: 'texte', siteEntrepriseFourni: false };

// Enveloppe un objet dans un texte realiste (prose + bloc ```json```),
// comme une vraie reponse collee -- exerce l'extracteur de repli embarque.
function texteColleDepuis(objet, avecProse) {
  const bloc = '```json\n' + JSON.stringify(objet, null, 2) + '\n```';
  return avecProse
    ? 'Bien sur, voici mon analyse :\n\n' + bloc + '\n\nN\'hesitez pas si vous avez des questions.'
    : bloc;
}

function point(sur) {
  return Object.assign({ titre: 'Titre', constat: 'Un constat.', lecture: 'Une lecture.', piste: 'Une piste.' }, sur);
}

function reponseDeBase(sur) {
  return Object.assign({
    modeAnalyse: 'image',
    analyseImpossible: false,
    cvCourt: false,
    syntheseOuverture: 'Votre CV se lit sans effort.',
    axes: [
      { id: 'positif', afficher: true, points: [point({ piste: '' }), point({ titre: 'B', piste: '' })] },
      { id: 'coherence', afficher: true, points: [point({ piste: 'Rapprocher le titre du poste vise.' })] },
      { id: 'message', afficher: true, points: [point({ piste: 'Mettre une phrase d\'accroche en haut.' })] },
      { id: 'premiere-lecture', afficher: true, points: [point({ piste: '' })] },
      { id: 'presentation', afficher: true, points: [point({ piste: 'Aerer les marges.' }), point({ titre: 'P2', piste: 'Une seule police.' }), point({ titre: 'P3', piste: 'Aligner les dates.' })] },
      { id: 'couleurs', afficher: true, points: [point({ titre: 'Nombre de couleurs', piste: 'Se limiter a deux couleurs.' })] }
    ],
    questionsLieesAuCv: [
      { question: 'Pourquoi ce changement de secteur ?', origine: 'Passage de la vente a la logistique', ceQueLeRecruteurCherche: 'La coherence du projet', commentYRepondre: 'Relier les deux par une competence commune.' }
    ]
  }, sur);
}

test('reponse nominale : 6 axes dans l\'ordre canonique, prose autour du JSON', () => {
  const r = regardRecruteurParserRapport(texteColleDepuis(reponseDeBase(), true), CTX_IMAGE);
  assert.equal(regardRecruteurRapportEstValide(r), true);
  assert.deepEqual(r.axes.map(a => a.id), REGARD_RECRUTEUR_AXES);
  assert.equal(r.analyseImpossible, false);
  assert.equal(r.syntheseOuverture, 'Votre CV se lit sans effort.');
});

test('afficher est recalcule : un axe sans point utile passe a false', () => {
  const rep = reponseDeBase({
    axes: [
      { id: 'positif', afficher: true, points: [point()] },
      { id: 'coherence', afficher: true, points: [] },                       // vide -> false
      { id: 'message', afficher: true, points: [point({ constat: '' })] },   // constat vide -> retire -> false
      { id: 'premiere-lecture', afficher: true, points: [point()] },
      { id: 'presentation', afficher: true, points: [point()] },
      { id: 'couleurs', afficher: true, points: [point()] }
    ]
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  const parId = Object.fromEntries(r.axes.map(a => [a.id, a]));
  assert.equal(parId['coherence'].afficher, false);
  assert.equal(parId['message'].afficher, false);
  assert.equal(parId['positif'].afficher, true);
});

test('mode texte : presentation et couleurs ne s\'affichent pas, meme si l\'assistant envoie des points', () => {
  const r = regardRecruteurParserRapport(texteColleDepuis(reponseDeBase({ modeAnalyse: 'texte' })), CTX_TEXTE);
  const parId = Object.fromEntries(r.axes.map(a => [a.id, a]));
  assert.equal(parId['presentation'].afficher, false);
  assert.equal(parId['couleurs'].afficher, false);
  assert.equal(r.modeAnalyse, 'texte');
  // le mode vient du contexte, jamais de la reponse
  const r2 = regardRecruteurParserRapport(texteColleDepuis(reponseDeBase({ modeAnalyse: 'texte' })), CTX_IMAGE);
  assert.equal(r2.modeAnalyse, 'image');
});

test('couleurs : le point sur les codes de l\'entreprise saute si le site n\'est pas fourni', () => {
  const rep = reponseDeBase({
    axes: reponseDeBase().axes.map(a => a.id !== 'couleurs' ? a : {
      id: 'couleurs', afficher: true, points: [
        point({ titre: 'Nombre de couleurs', piste: 'Deux couleurs maximum.' }),
        point({ titre: 'Codes visuels de l\'entreprise', piste: 'Rapprocher du bleu de la marque.' })
      ]
    })
  });
  const avecSite = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  const sansSite = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE_SANS_SITE);
  assert.equal(avecSite.axes.find(a => a.id === 'couleurs').points.length, 2);
  assert.equal(sansSite.axes.find(a => a.id === 'couleurs').points.length, 1);
});

test('premiere-lecture : plafonnee a exactement 1 point', () => {
  const rep = reponseDeBase({
    axes: reponseDeBase().axes.map(a => a.id !== 'premiere-lecture' ? a : {
      id: 'premiere-lecture', afficher: true, points: [point({ titre: 'A' }), point({ titre: 'B' }), point({ titre: 'C' })]
    })
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.axes.find(a => a.id === 'premiere-lecture').points.length, 1);
});

test('plafonds par axe respectes (message : 5 max)', () => {
  const rep = reponseDeBase({
    axes: reponseDeBase().axes.map(a => a.id !== 'message' ? a : {
      id: 'message', afficher: true, points: Array.from({ length: 9 }, (_, i) => point({ titre: 'M' + i }))
    })
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.axes.find(a => a.id === 'message').points.length, 5);
});

test('questions : celle sans origine ancree dans le CV est retiree', () => {
  const rep = reponseDeBase({
    questionsLieesAuCv: [
      { question: 'Q avec origine', origine: 'Trou de 2019 a 2021', ceQueLeRecruteurCherche: 'x', commentYRepondre: 'y' },
      { question: 'Q sans origine', origine: '', ceQueLeRecruteurCherche: 'x', commentYRepondre: 'y' }
    ]
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.questionsLieesAuCv.length, 1);
  assert.equal(r.questionsLieesAuCv[0].question, 'Q avec origine');
});

test('questions : plafonnees a 5 a l\'affichage', () => {
  const rep = reponseDeBase({
    questionsLieesAuCv: Array.from({ length: 8 }, (_, i) => ({
      question: 'Q' + i, origine: 'O' + i, ceQueLeRecruteurCherche: 'x', commentYRepondre: 'y'
    }))
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.questionsLieesAuCv.length, 5);
});

test('pointsARetenir : construits par le code depuis coherence/message/presentation/couleurs, dedoublonnes, plafond 6', () => {
  const r = regardRecruteurParserRapport(texteColleDepuis(reponseDeBase()), CTX_IMAGE);
  assert.ok(r.pointsARetenir.length >= 1 && r.pointsARetenir.length <= 6);
  // aucune piste issue de positif ni de premiere-lecture (elles etaient vides ici de toute facon)
  assert.ok(r.pointsARetenir.includes('Rapprocher le titre du poste vise.'));
  assert.ok(r.pointsARetenir.includes('Mettre une phrase d\'accroche en haut.'));
  // l'ordre commence par coherence puis message
  assert.equal(r.pointsARetenir[0], 'Rapprocher le titre du poste vise.');
});

test('pointsARetenir : phrase de repli si aucune piste', () => {
  const rep = reponseDeBase({
    axes: reponseDeBase().axes.map(a => ({ id: a.id, afficher: true, points: [point({ piste: '' })] }))
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.pointsARetenir.length, 1);
  assert.match(r.pointsARetenir[0], /deja lisible/);
});

test('analyseImpossible : on renvoie le rapport vide + un message', () => {
  const rep = { analyseImpossible: true, messageAnalyseImpossible: 'Image trop floue pour etre lue.' };
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.analyseImpossible, true);
  assert.equal(r.messageAnalyseImpossible, 'Image trop floue pour etre lue.');
  assert.equal(regardRecruteurRapportEstValide(r), true);
  assert.equal(r.axes.every(a => a.afficher === false), true);
});

test('analyseImpossible sans message : message de repli', () => {
  const r = regardRecruteurParserRapport(texteColleDepuis({ analyseImpossible: true }), CTX_IMAGE);
  assert.ok(r.messageAnalyseImpossible.length > 0);
});

test('cvCourt : drapeau + message conserves, le rapport reste exploitable', () => {
  const r = regardRecruteurParserRapport(texteColleDepuis(reponseDeBase({ cvCourt: true, messageCvCourt: 'CV encore leger.' })), CTX_IMAGE);
  assert.equal(r.cvCourt, true);
  assert.equal(r.messageCvCourt, 'CV encore leger.');
  assert.equal(regardRecruteurRapportEstValide(r), true);
});

test('tiret cadratin dans un champ : remplace par un tiret court', () => {
  const rep = reponseDeBase({ syntheseOuverture: 'Votre CV est clair — et bien structure.' });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.syntheseOuverture.includes('—'), false);
  assert.match(r.syntheseOuverture, /clair - et bien/);
});

test('aucun JSON exploitable : leve reponse_illisible', () => {
  assert.throws(
    () => regardRecruteurParserRapport('Je ne peux pas analyser ce document, desole.', CTX_IMAGE),
    (e) => e.code === 'reponse_illisible'
  );
});

test('JSON valide mais sans aucun champ connu : leve reponse_illisible', () => {
  assert.throws(
    () => regardRecruteurParserRapport(texteColleDepuis({ commentaire: 'Voici ma demarche', etapes: [1, 2, 3] }), CTX_IMAGE),
    (e) => e.code === 'reponse_illisible'
  );
});

test('axe inconnu dans la reponse (ancien prompt) : ignore en silence, 6 axes en sortie', () => {
  const rep = reponseDeBase();
  rep.axes.push({ id: 'autres-questions', afficher: true, points: [point()] });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  assert.equal(r.axes.length, 6);
  assert.deepEqual(r.axes.map(a => a.id), REGARD_RECRUTEUR_AXES);
});

test('positif : le constat est conserve meme sans lecture ni piste', () => {
  const rep = reponseDeBase({
    axes: reponseDeBase().axes.map(a => a.id !== 'positif' ? a : {
      id: 'positif', afficher: true, points: [{ titre: 'Titre lisible', constat: 'Le titre est visible d\'emblee.' }]
    })
  });
  const r = regardRecruteurParserRapport(texteColleDepuis(rep), CTX_IMAGE);
  const p = r.axes.find(a => a.id === 'positif').points[0];
  assert.equal(p.constat, 'Le titre est visible d\'emblee.');
  assert.equal(p.piste, '');
});
