const test = require('node:test');
const assert = require('node:assert');
const S = require('../modules/synthese-assistant/logique.js');

test('synthèse : période d’une expérience (deux années, une seule, aucune)', () => {
  assert.strictEqual(S.periodeExperienceSynthese({ dateDebut: '2021-03', dateFin: '2024-01' }), '2021 à 2024');
  assert.strictEqual(S.periodeExperienceSynthese({ dateDebut: '2021-03', dateFin: '2021-09' }), '2021');
  assert.strictEqual(S.periodeExperienceSynthese({ dateDebut: '2019' }), '2019');
  assert.strictEqual(S.periodeExperienceSynthese({}), '');
});

test('synthèse : le CV montre l’intitulé et trois expériences au plus', () => {
  const r = S.resumeCvSynthese({
    titreCV: 'Cariste-magasinier',
    experiences: [
      { poste: 'Cariste', entreprise: 'Logistique du Sud', dateDebut: '2021-03', dateFin: '2024-01' },
      { poste: 'Aide boulanger', entreprise: 'Boulangerie Dupuis', dateDebut: '2019', dateFin: '2021' },
      { poste: 'Manutentionnaire', entreprise: '', dateDebut: '2018' },
      { poste: 'Stagiaire', entreprise: 'X' }
    ]
  });
  assert.strictEqual(r.intitule, 'Cariste-magasinier');
  assert.deepStrictEqual(r.experiences, ['Cariste · Logistique du Sud (2021 à 2024)', 'Aide boulanger · Boulangerie Dupuis (2019 à 2021)', 'Manutentionnaire (2018)']);
});

test('synthèse : texte du CV déposé : intitulé et trois lignes datées', () => {
  const texte = ['', '', 'Cariste CACES 3', 'alex@mail.fr', 'Expérience', 'Cariste, Logistique du Sud, 2021 - 2024', 'Aide boulanger, 2019 - 2021', 'Née le 3 mars 1990', 'Stage 2018', 'Autre 2017'].join('\n');
  const r = S.resumeCvSynthese({ texteCv: texte, titreCV: 'Ancien CV' });
  assert.strictEqual(r.intitule, 'Cariste CACES 3');
  assert.deepStrictEqual(r.experiences, ['Cariste, Logistique du Sud, 2021 - 2024', 'Aide boulanger, 2019 - 2021', 'Stage 2018']);
});

test('synthèse : objet de la lettre déposée', () => {
  assert.strictEqual(S.objetLettreSynthese('Madame, Monsieur,\nObjet : Candidature au poste de cariste\nJe vous écris'), 'Candidature au poste de cariste');
  assert.strictEqual(S.objetLettreSynthese('Madame, Monsieur,\n\nJe vous écris pour le poste de cariste.'), 'Je vous écris pour le poste de cariste.');
  assert.strictEqual(S.objetLettreSynthese(''), '');
});

test('synthèse : jetons de candidature, seulement ce qui est renseigné', () => {
  const j = S.jetonsCandidatureSynthese({ libelleObjectif: 'Répondre à une offre', metierCible: 'Cariste', entreprise: 'Logistique du Sud', texteOffre: 'x'.repeat(100), civiliteRecruteur: 'Madame', nomRecruteur: 'Martin' });
  assert.deepStrictEqual(j.slice(0, 3), ['Type : Répondre à une offre', 'Métier visé : Cariste', 'Entreprise : Logistique du Sud']);
  assert.ok(j.some((t) => t.startsWith('Offre : ') && t.endsWith('…')));
  assert.ok(j.includes('Destinataire : Madame Martin'));
  assert.deepStrictEqual(S.jetonsCandidatureSynthese({}), []);
});

test('synthèse : jetons des choix, valeurs par défaut comprises, choix restant à faire visible', () => {
  const groupes = [
    { champ: 'niveauPoste', titre: 'Niveau du poste recherché', options: [['employe', 'Employé'], ['cadre', 'Cadre']] },
    { champ: 'niveauLangage', titre: 'Niveau de langage', options: [['naturel', 'Naturel'], ['professionnel', 'Professionnel']] },
    { champ: 'ton', titre: 'Ton', options: [['equilibre', 'Équilibré'], ['dynamique', 'Dynamique']] }
  ];
  const defauts = { niveauLangage: 'professionnel', ton: 'equilibre' };
  assert.deepStrictEqual(S.jetonsChoixSynthese({ ton: 'dynamique', niveauPoste: 'employe' }, groupes, defauts, 'En recherche d’emploi'),
    ['Niveau du poste : employé', 'Langage : professionnel', 'Ton : dynamique', 'Situation : en recherche d’emploi']);
  assert.deepStrictEqual(S.jetonsChoixSynthese({}, groupes, defauts, ''), ['Niveau du poste : à choisir', 'Langage : professionnel', 'Ton : équilibré', 'Situation : à indiquer']);
});

test('synthèse : description d’un appui sans le nom du signataire', () => {
  assert.strictEqual(S.descriptionAppuiSynthese({ texte: 'Je recommande Alex. Signé Martin Dupont', role: 'Ancien employeur' }), 'Lettre de recommandation (ancien employeur) : lettre courte');
  assert.strictEqual(S.descriptionAppuiSynthese(null), '');
});

test('synthèse : résumé du CV en plusieurs lignes à partir des informations lues', () => {
  const l = S.lignesResumeCvStructureSynthese({
    titreCV: 'Cariste-magasinier',
    experiences: [{ poste: 'Cariste', entreprise: 'Logistique du Sud', dateDebut: '2021-03', dateFin: '2024-01' }, { poste: 'Aide boulanger', entreprise: '', dateDebut: '2019', dateFin: '2021' }],
    formations: [{ intitule: 'CACES 3', annee: '2021' }],
    competences: { savoirFaire: ['Conduite de chariot', 'Préparation de commandes'], savoirEtre: ['Rigueur'] },
    langues: [{ langue: 'Français', niveau: 'langue maternelle' }],
    certifications: ['CACES 3'],
    permis: { possede: true, categories: ['B'] }
  });
  const m = Object.fromEntries(l.map((x) => [x.libelle, x.valeur]));
  assert.strictEqual(m['Métier'], 'Cariste-magasinier');
  assert.strictEqual(m['2 expériences'], 'Cariste chez Logistique du Sud (2021 à 2024) ; Aide boulanger (2019 à 2021)');
  assert.strictEqual(m['Formation'], 'CACES 3 (2021)');
  assert.strictEqual(m['Compétences'], 'Conduite de chariot, Préparation de commandes, Rigueur');
  assert.strictEqual(m['Permis'], 'catégorie B');
  assert.deepStrictEqual(S.lignesResumeCvStructureSynthese({}), []);
});
