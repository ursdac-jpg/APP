const { test } = require('node:test');
const assert = require('node:assert/strict');

// Logique PURE de "Préparer un entretien" (fiche de préparation, dossier.ia.
// entretien). Ajoutee lors de l'audit de stabilisation du 2026-09-12 : ce
// fichier n'avait jusque-la aucune couverture Node, contrairement a ses
// equivalents CV/lettre/ATS/Regard recruteur.
const { normaliserDonneesEntretien } = require('../modules/entretien-editor/normaliserDonneesEntretien.js');

test('normaliserDonneesEntretien : assemble identite + metier/entreprise + contenu IA', () => {
  const d = {
    identite: { civilite: 'Monsieur', nom: 'Martin', prenom: 'Paul' },
    metierCible: 'Vendeur en magasin',
    rechercheCandidature: { entreprise: 'Carrefour' },
    ia: {
      entretien: {
        presentation: 'Présentez-vous en 2 minutes.',
        pointsAPreparer: ['Votre motivation', 'Vos disponibilités'],
        questionsAnticipees: [{ question: 'Pourquoi ce poste ?', pistes: ['expérience'], amorce: 'Parce que...' }],
        questionsDuCandidat: ['Quels sont les horaires ?']
      }
    }
  };
  const r = normaliserDonneesEntretien(d);
  assert.deepEqual(r.identite, { civilite: 'Monsieur', nom: 'Martin', prenom: 'Paul' });
  assert.equal(r.metierVise, 'Vendeur en magasin');
  assert.equal(r.entreprise, 'Carrefour');
  assert.equal(r.presentation, 'Présentez-vous en 2 minutes.');
  assert.deepEqual(r.pointsAPreparer, ['Votre motivation', 'Vos disponibilités']);
  assert.deepEqual(r.questionsAnticipees, [{ question: 'Pourquoi ce poste ?', pistes: ['expérience'], amorce: 'Parce que...' }]);
  assert.deepEqual(r.questionsDuCandidat, ['Quels sont les horaires ?']);
});

test('normaliserDonneesEntretien : metierVise se replie sur secteurCible si pas de metier precis', () => {
  const r = normaliserDonneesEntretien({ secteurCible: 'Commerce et vente' });
  assert.equal(r.metierVise, 'Commerce et vente');
});

test('normaliserDonneesEntretien : questions anticipees au format ancien (chaine simple) converties a la volee', () => {
  const d = { ia: { entretien: { questionsAnticipees: ['Une ancienne question ?', ''] } } };
  const r = normaliserDonneesEntretien(d);
  // la chaine vide est filtree (question obligatoire)
  assert.deepEqual(r.questionsAnticipees, [{ question: 'Une ancienne question ?', pistes: [], amorce: '' }]);
});

test('normaliserDonneesEntretien : question anticipee objet sans "question" -> filtree', () => {
  const d = { ia: { entretien: { questionsAnticipees: [{ pistes: ['x'] }, { question: 'Valide ?' }] } } };
  const r = normaliserDonneesEntretien(d);
  assert.equal(r.questionsAnticipees.length, 1);
  assert.equal(r.questionsAnticipees[0].question, 'Valide ?');
});

test('normaliserDonneesEntretien : dossier vide -> tous les champs a leur defaut, jamais d\'exception', () => {
  const r = normaliserDonneesEntretien({});
  assert.deepEqual(r.identite, { civilite: null, nom: '', prenom: '' });
  assert.equal(r.metierVise, '');
  assert.equal(r.entreprise, '');
  assert.equal(r.presentation, '');
  assert.deepEqual(r.pointsAPreparer, []);
  assert.deepEqual(r.questionsAnticipees, []);
  assert.deepEqual(r.questionsDuCandidat, []);
});

test('normaliserDonneesEntretien : undefined -> memes defauts, jamais d\'exception', () => {
  const r = normaliserDonneesEntretien(undefined);
  assert.equal(r.metierVise, '');
});
