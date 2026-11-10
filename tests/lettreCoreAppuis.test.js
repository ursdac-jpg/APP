const { test } = require('node:test');
const assert = require('node:assert/strict');

// Panneau « Vos appuis » (étape (g) du chantier lettre) : plusieurs lettres de recommandation, une seule envoyée, nom du signataire repéré.
const A = require('../modules/lettre-core/appuisLettreCo.js');

test('ajout : texte vide refusé, rôle inconnu ramené à « non précisé », trois lettres au plus', () => {
  assert.deepEqual(A.ajouterRecommandationLettreCo([], '   ', 'Ancien employeur'), []);
  let l = A.ajouterRecommandationLettreCo([], 'Texte 1', 'Rôle inventé');
  assert.deepEqual(l, [{ id: 1, texte: 'Texte 1', role: '' }]);
  l = A.ajouterRecommandationLettreCo(l, 'Texte 2', 'Ancien employeur');
  l = A.ajouterRecommandationLettreCo(l, 'Texte 3', 'Tuteur de stage');
  l = A.ajouterRecommandationLettreCo(l, 'Texte 4', 'Autre');
  assert.equal(l.length, A.MAX_RECOMMANDATIONS_LETTRE_CO);
  assert.deepEqual(l.map((r) => r.id), [1, 2, 3]);
});

test('retrait puis ajout : les identifiants ne se réutilisent pas', () => {
  let l = A.ajouterRecommandationLettreCo([], 'A', '');
  l = A.ajouterRecommandationLettreCo(l, 'B', '');
  l = A.retirerRecommandationLettreCo(l, 1);
  l = A.ajouterRecommandationLettreCo(l, 'C', '');
  assert.deepEqual(l.map((r) => r.id), [2, 3]);
});

test('rôle : modifiable, jamais hors liste ; la liste d\'origine n\'est pas modifiée', () => {
  const l = A.ajouterRecommandationLettreCo([], 'A', '');
  const l2 = A.definirRoleRecommandationLettreCo(l, 1, 'Formateur ou enseignant');
  assert.equal(l[0].role, '');
  assert.equal(l2[0].role, 'Formateur ou enseignant');
  assert.equal(A.definirRoleRecommandationLettreCo(l2, 1, 'Pirate')[0].role, '');
});

test('une seule lettre est envoyée : la choisie, sinon la première, sinon rien', () => {
  let l = A.ajouterRecommandationLettreCo([], 'A', '');
  l = A.ajouterRecommandationLettreCo(l, 'B', '');
  assert.equal(A.recommandationEnvoyeeLettreCo(l, 2).texte, 'B');
  assert.equal(A.recommandationEnvoyeeLettreCo(l, 99).texte, 'A');
  assert.equal(A.recommandationEnvoyeeLettreCo(l, null).texte, 'A');
  assert.equal(A.recommandationEnvoyeeLettreCo([], 1), null);
});

test('section du message : format cité par le prompt', () => {
  assert.equal(A.sectionRecommandationLettreCo({ id: 1, texte: ' Il est fiable. ', role: 'Ancien employeur' }),
    'LETTRE DE RECOMMANDATION (relue et masquée par la personne), de la part de : Ancien employeur\nIl est fiable.');
  assert.ok(A.sectionRecommandationLettreCo({ id: 1, texte: 'x', role: '' }).includes('de la part de : Autre'));
  assert.equal(A.sectionRecommandationLettreCo(null), '');
  assert.equal(A.sectionRecommandationLettreCo({ id: 1, texte: '  ', role: '' }), '');
});

test('nom du signataire : en bas de la lettre, avec fonction après une virgule, avec civilité', () => {
  const l1 = 'Je soussigné, responsable de l\'agence, souhaite le recommander.\n\nCordialement,\n\nJean Dupont\nResponsable d\'agence';
  assert.deepEqual(A.nomsSignatureLettreCo(l1), ['Jean Dupont']);
  const l2 = 'Il a travaillé chez nous en 2021.\n\nBien cordialement,\nMonsieur Paul Martin, directeur';
  assert.deepEqual(A.nomsSignatureLettreCo(l2), ['Paul Martin']);
  const l3 = 'Texte.\n\nMARIE LECLERC';
  assert.deepEqual(A.nomsSignatureLettreCo(l3), ['MARIE LECLERC']);   // tout en capitales : reconnu aussi
});

test('nom du signataire : après « Je soussigné », et pas de faux nom sur une formule de politesse', () => {
  assert.deepEqual(A.nomsSignatureLettreCo('Je soussigné Pierre Durand, gérant de la société, atteste ceci.\n\nFait à Bergerac, le 12 mars 2025.\nCordialement'), ['Pierre Durand']);
  assert.deepEqual(A.nomsSignatureLettreCo('Il est ponctuel.\n\nBien cordialement\nService Ressources Humaines'), []);
  assert.deepEqual(A.nomsSignatureLettreCo(''), []);
});


// 28/10/2026 : deux appuis de plus (maquette « Vos appuis » validée) : le document « Mes compétences » et le texte libre.
test('texte libre : vide rien, espaces retirés, plafonné, sans nom ajouté', () => {
  assert.equal(A.sectionTexteLibreLettreCo('   '), '');
  assert.equal(A.sectionTexteLibreLettreCo(null), '');
  const s = A.sectionTexteLibreLettreCo('  Je suis ponctuel.\r\nJ’aime le contact.  ');
  assert.match(s, /^CE QUE LA PERSONNE AJOUTE AVEC SES MOTS/);
  assert.ok(s.endsWith('Je suis ponctuel.\nJ’aime le contact.'));
  assert.equal(A.nettoyerTexteLibreAppui('x'.repeat(A.TEXTE_LIBRE_APPUI_MAX + 500)).length, A.TEXTE_LIBRE_APPUI_MAX);
});

test('Mes compétences : section sans nom ni preuves ni envies, rien tant que le document est absent ou vide', () => {
  assert.equal(A.sectionMesCompetencesLettreCo(null), '');
  assert.equal(A.sectionMesCompetencesLettreCo({ vide: true, sections: [] }), '');
  const doc = {
    titre: 'Mes compétences', nom: 'Camille Durand', vide: false,
    sections: [{ id: 'a', titre: 'Savoir-faire', lignes: [
      { libelle: 'Accueillir le public', pourLeCV: 'Accueil et orientation du public', confirmation: 'confirmee', preuves: [{ source: 'Mon CV', extrait: 'Camille Durand a accueilli' }], pourLOral: 'oral' },
      { libelle: 'Trier le courrier', pourLeCV: '', confirmation: 'declaree', preuves: [] }
    ] }],
    envies: [{ libelle: 'Travailler en équipe', preuve: { source: 'Mon CV', extrait: 'envie' } }]
  };
  const s = A.sectionMesCompetencesLettreCo(doc);
  assert.match(s, /^COMPÉTENCES RELEVÉES PAR LA PERSONNE/);
  assert.match(s, /- Accueillir le public : Accueil et orientation du public \(confirmé par une autre personne\)/);
  assert.match(s, /- Trier le courrier$/m);
  assert.doesNotMatch(s, /Camille|Durand|oral|envie|Travailler en équipe|Mon CV/);
  assert.equal(A.compterLignesMesCompetences(doc), 2);
  assert.equal(A.compterLignesMesCompetences(null), 0);
});

// Consigne 219 (10/11/2026) : le document « Mes compétences » que la personne dépose elle-même part avec les autres appuis.
test('document « Mes compétences » déposé : section dédiée, plafonnée, vide si rien', () => {
  assert.equal(A.sectionMesCompetencesDeposeLettreCo(''), '');
  assert.equal(A.sectionMesCompetencesDeposeLettreCo('   '), '');
  const s = A.sectionMesCompetencesDeposeLettreCo('Je sais tenir une caisse.\r\nJe sais accueillir.');
  assert.match(s, /^COMPÉTENCES RELEVÉES PAR LA PERSONNE/);
  assert.match(s, /Je sais tenir une caisse\.\nJe sais accueillir\./);
  const long = A.sectionMesCompetencesDeposeLettreCo('x'.repeat(A.TEXTE_MES_COMPETENCES_DEPOSE_MAX + 500));
  assert.ok(long.length <= A.TEXTE_MES_COMPETENCES_DEPOSE_MAX + 200, 'le texte déposé est plafonné');
});
