// Banc d'essai du prompt « Découvrir mes compétences » (prompts/mes-competences.md) :
// le prompt est bien formé, les profils sont fictifs, et le contrôle automatique attrape les inventions.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const racine = path.join(__dirname, '..');
const prompt = fs.readFileSync(path.join(racine, 'prompts', 'mes-competences.md'), 'utf8');
const { PROFILS } = require('../scripts/essaiMesCompetences/profils.js');
const { verifier, extraireJson, normaliser } = require('../scripts/essaiMesCompetences/verifier.js');
const { messagePasse1, messagePasse2 } = require('../scripts/essaiMesCompetences/essai.js');

const profil = (id) => PROFILS.filter((p) => p.id === id)[0];

function reponse(obj, intro) {
  return (intro || 'J’ai lu vos trois documents. Ils montrent beaucoup de choses concrètes : de l’accueil, du suivi administratif et de l’aide aux personnes.') +
    '\n\n```json\n' + JSON.stringify(obj, null, 2) + '\n```';
}
function comp(o) {
  return Object.assign({
    libelle: 'Accueillir le public', famille: 'savoirFaire', enMotsSimples: 'Recevoir les personnes et répondre à leurs demandes.',
    preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Accueil téléphonique et physique du public' }],
    confirmation: 'relevee', pourLeCV: 'Accueil téléphonique et physique du public',
    pourLOral: 'À l’association, j’assurais l’accueil au téléphone et sur place. Je prenais aussi les rendez-vous.',
    pourPreparer: 'Qu’est-ce que cela a changé pour les personnes accueillies ?', synonymes: ['Recevoir le public', 'Répondre aux appels'], question: ''
  }, o || {});
}

const BONNE = {
  niveauPoste: 'execution',
  niveauPosteIndices: 'Vos documents montrent surtout de l’accueil et du suivi administratif, au niveau employé.',
  competences: [
    comp({ confirmation: 'confirmee', preuves: [
      { typeDocument: 'cv', numeroDocument: 1, extrait: 'Accueil téléphonique et physique du public' },
      { typeDocument: 'recommandation', numeroDocument: 3, extrait: 'l’accueil téléphonique' }] }),
    comp({ libelle: 'Prendre des rendez-vous et tenir un agenda', confirmation: 'confirmee',
      preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Prise de rendez-vous et tenue de l’agenda de trois travailleurs sociaux' },
        { typeDocument: 'recommandation', numeroDocument: 3, extrait: 'la prise de rendez-vous' }],
      pourLeCV: 'Prise de rendez-vous et tenue de l’agenda de trois travailleurs sociaux',
      pourLOral: 'Je tenais l’agenda de trois travailleurs sociaux. Je fixais les rendez-vous avec les familles.', synonymes: ['Gérer un planning', 'Organiser des rendez-vous'] }),
    comp({ libelle: 'Suivre le courrier', confirmation: 'confirmee',
      preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Suivi du courrier et classement des dossiers' },
        { typeDocument: 'recommandation', numeroDocument: 3, extrait: 'le suivi du courrier' }],
      pourLeCV: 'Suivi du courrier et classement des dossiers',
      pourLOral: 'Je m’occupais du courrier de l’association. Je classais aussi les dossiers.', synonymes: ['Gérer le courrier', 'Classer des dossiers'] }),
    comp({ libelle: 'Accompagner dans les démarches administratives', confirmation: 'relevee',
      preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'aide aux démarches administratives' },
        { typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'j’ai accompagné des personnes pour leurs démarches administratives' }],
      pourLeCV: 'Aide aux démarches administratives à l’accueil de jour',
      pourLOral: 'À l’accueil de jour, j’aide des personnes dans leurs démarches administratives. Je leur explique les documents.', synonymes: ['Aider pour les papiers', 'Accompagner les démarches'] }),
    comp({ libelle: 'Expliquer des documents simplement', preuves: [{ typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'à expliquer les documents simplement' }],
      pourLeCV: 'Explication simple de documents administratifs', pourLOral: 'J’ai appris à expliquer les documents simplement. Je le fais à l’accueil de jour.', synonymes: ['Rendre un papier clair', 'Vulgariser'] }),
    comp({ libelle: 'Rassurer les personnes dans les situations tendues', famille: 'savoirEtre',
      preuves: [{ typeDocument: 'recommandation', numeroDocument: 3, extrait: 'a su rassurer les personnes lors de situations tendues' }],
      pourLeCV: 'Savoir rassurer le public en situation tendue', pourLOral: 'Quand une situation était tendue, je rassurais les personnes. C’est ce qu’indique ma lettre de recommandation.', synonymes: ['Calmer une situation', 'Apaiser'] }),
    comp({ libelle: 'Respecter les délais', famille: 'savoirEtre',
      preuves: [{ typeDocument: 'recommandation', numeroDocument: 3, extrait: 'Elle a toujours respecté les délais' }],
      pourLeCV: 'Délais toujours respectés', pourLOral: 'Dans mon travail à l’association, je respectais les délais. Ma lettre de recommandation l’indique.', synonymes: ['Être à l’heure', 'Tenir ses échéances'] }),
    comp({ libelle: 'Aider les personnes âgées au quotidien', preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Aide aux courses, aux repas et à la toilette' }],
      pourLeCV: 'Aide aux courses, aux repas et à la toilette', pourLOral: 'J’ai travaillé comme aide à domicile auprès de personnes âgées. Je les aidais pour les courses et les repas.', synonymes: ['Aider à domicile', 'Accompagner au quotidien'] }),
    comp({ libelle: 'Fiabilité', famille: 'savoirEtre', confirmation: 'aPreciser',
      preuves: [{ typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'Je suis motivée et sérieuse' }],
      pourLeCV: '', pourLOral: '', pourPreparer: '', synonymes: [],
      question: 'Pouvez-vous raconter une situation, à l’accueil ou ailleurs, où l’on a pu compter sur vous ?' })
  ],
  motivations: [
    { libelle: 'Travailler dans l’accompagnement social', preuve: { typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'travailler dans l’accompagnement social' } },
    { libelle: 'Aider quelqu’un à retrouver ses droits', preuve: { typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'j’aime aider quelqu’un à retrouver ses droits' } }
  ]
};
const copie = (o) => JSON.parse(JSON.stringify(o));

test('le prompt existe, porte {{VOIX_HUMAINE}} une fois, sans le mot IA', () => {
  assert.equal(prompt.split('{{VOIX_HUMAINE}}').length - 1, 1);
  assert.ok(!/\bIA\b/.test(prompt), 'jamais le mot IA');
  assert.ok(!/[–—]/.test(prompt.replace('(– ou —)', '')), 'pas de tiret long hors consigne');
});

test('le bloc JSON d’exemple du prompt est du JSON valide avec les bonnes clés', () => {
  const m = prompt.match(/```json\s*(\{\s*"niveauPoste"[\s\S]*?)```/);
  assert.ok(m, 'exemple de format trouvé');
  const o = JSON.parse(m[1]);
  ['niveauPoste', 'niveauPosteIndices', 'competences', 'motivations'].forEach((k) => assert.ok(k in o, k));
  ['libelle', 'famille', 'enMotsSimples', 'preuves', 'confirmation', 'pourLeCV', 'pourLOral', 'pourPreparer', 'synonymes', 'question']
    .forEach((k) => assert.ok(k in o.competences[0], k));
});

test('les profils sont fictifs : coordonnées masquées, aucun courriel ni numéro réel', () => {
  assert.ok(PROFILS.length >= 5);
  PROFILS.forEach((p) => p.documents.forEach((d) => {
    assert.ok(!/@(?!entraide-famille\.example)/.test(d.texte.replace(/\[COURRIEL MASQUÉ\]/g, '')), p.id);
    assert.ok(!/\b0[1-9](?:[ .]?\d{2}){4}\b/.test(d.texte.replace(/05 53 00 00 00/g, '')), p.id);
  }));
});

test('le message du premier passage contient la consigne, la voix humaine et tous les documents', () => {
  const p = profil('accueil_trois_documents');
  const m = messagePasse1(p);
  assert.ok(m.includes('Une voix humaine'));
  assert.ok(!m.includes('{{VOIX_HUMAINE}}'));
  assert.ok(m.includes('DOCUMENT 1 - CV') && m.includes('DOCUMENT 2 - LETTRE DE MOTIVATION') && m.includes('DOCUMENT 3 - LETTRE DE RECOMMANDATION'));
  assert.ok(messagePasse1(profil('chef_equipe_niveau_cadre_choisi')).includes('NIVEAU DU POSTE CHOISI PAR LA PERSONNE'));
});

test('le message du second passage reprend la liste déjà établie et les réponses', () => {
  const m = messagePasse2(profil('accueil_trois_documents'), reponse(BONNE), 'Oui, j’ai remplacé une collègue seule pendant un mois.');
  assert.ok(m.includes('LISTE DÉJÀ ÉTABLIE') && m.includes('RÉPONSES DE LA PERSONNE'));
  assert.ok(m.includes('remplacé une collègue'));
});

test('une bonne réponse passe sans erreur', () => {
  const r = verifier(reponse(BONNE), profil('accueil_trois_documents'));
  assert.deepEqual(r.erreurs, []);
  assert.equal(r.infos.nbCompetences, 9);
  assert.equal(r.infos.repartition.confirmee, 3);
  assert.equal(r.infos.repartition.aPreciser, 1);
  assert.equal(r.infos.nbMotivations, 2);
});

test('une preuve qui n’est pas dans les documents est une erreur (invention)', () => {
  const o = copie(BONNE);
  o.competences[4].preuves[0].extrait = 'Gestion complète d’un standard téléphonique de vingt lignes';
  const r = verifier(reponse(o), profil('accueil_trois_documents'));
  assert.ok(r.erreurs.some((e) => /ABSENT des documents/.test(e)));
});

test('« vous êtes », contexte de vie, nom du signataire et tiret long sont des erreurs', () => {
  const p = profil('accueil_trois_documents');
  assert.ok(verifier(reponse(BONNE, 'Vous êtes une personne rassurante.'), p).erreurs.some((e) => /vous êtes/.test(e)));
  const o1 = copie(BONNE); o1.competences[0].pourLOral = 'J’accueillais le public. Je suis en arrêt maladie depuis peu.';
  assert.ok(verifier(reponse(o1), p).erreurs.some((e) => /Contexte de vie/.test(e)));
  const o2 = copie(BONNE); o2.competences[0].pourLOral = 'J’accueillais le public. Monsieur Delorme l’a écrit.';
  assert.ok(verifier(reponse(o2), p).erreurs.some((e) => /Nom de tiers/.test(e)));
  assert.ok(verifier(reponse(BONNE, 'Voici votre relevé — bonne lecture.'), p).erreurs.some((e) => /Tiret long/.test(e)));
});

test('un chiffre inventé, une compétence confirmée par une seule source, un « à préciser » rédigé : erreurs', () => {
  const p = profil('accueil_trois_documents');
  const o1 = copie(BONNE); o1.competences[0].pourLOral = 'J’accueillais quarante visiteurs. En 2019, j’étais au standard.';
  assert.ok(verifier(reponse(o1), p).erreurs.some((e) => /chiffre « 2019 »/.test(e)));
  const o2 = copie(BONNE); o2.competences[0].preuves = [o2.competences[0].preuves[0]];
  assert.ok(verifier(reponse(o2), p).erreurs.some((e) => /une seule source/.test(e)));
  const o3 = copie(BONNE); o3.competences[8].pourLeCV = 'Personne fiable';
  assert.ok(verifier(reponse(o3), p).erreurs.some((e) => /à préciser/.test(e)));
});

test('« confirmée » sans source tierce, envie classée en compétence, libellé sans verbe, phrases redondantes : signalés', () => {
  const p = profil('accueil_trois_documents');
  const o1 = copie(BONNE); o1.competences[3].confirmation = 'confirmee';
  assert.ok(verifier(reponse(o1), p).erreurs.some((e) => /sans source tierce/.test(e)));
  const o2 = copie(BONNE); o2.competences[4] = comp({ libelle: 'Travailler dans l\u2019accompagnement social', famille: 'savoirs',
    preuves: [{ typeDocument: 'lettreMotivation', numeroDocument: 2, extrait: 'Je souhaite aujourd\u2019hui travailler dans l\u2019accompagnement social' }], pourLeCV: 'Projet dans l\u2019accompagnement social', pourLOral: 'Je souhaite travailler dans l\u2019accompagnement social.' });
  assert.ok(verifier(reponse(o2), p).avertissements.some((w) => /envie ou un projet/.test(w)));
  const o3 = copie(BONNE); o3.competences[0].libelle = 'Accueil du public';
  assert.ok(verifier(reponse(o3), p).avertissements.some((w) => /infinitif/.test(w)));
  const o4 = copie(BONNE); o4.competences[0].pourLOral = 'J\u2019accueillais le public au téléphone et sur place. J\u2019accueillais le public sur place et au téléphone.';
  assert.ok(verifier(reponse(o4), p).avertissements.some((w) => /presque la même chose/.test(w)));
});

test('accent manquant, intitulé seul établi, fonction du signataire, question sur un diplôme : signalés', () => {
  const p = profil('logistique_cv_seul');
  const base = (o) => reponse({ niveauPoste: 'execution', niveauPosteIndices: 'Vos documents montrent surtout des tâches d\u2019entrepôt.', competences: [o], motivations: [] });
  const ok = comp({ libelle: 'Préparer des commandes', preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Préparation d\u2019environ 80 colis par jour' }],
    pourLeCV: 'Préparation d\u2019environ 80 colis par jour', pourLOral: 'J\u2019ai préparé environ 80 colis par jour dans un entrepôt de distribution.', pourPreparer: 'Quelles étapes suiviez-vous ?' });
  assert.deepEqual(verifier(base(ok), p).erreurs, []);
  assert.ok(verifier(base(Object.assign({}, ok, { pourLeCV: 'Preparation d\u2019environ 80 colis par jour' })), p).erreurs.some((e) => /accent manquant/.test(e)));
  const intitule = comp({ libelle: 'Encadrer l\u2019équipe du samedi', preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'Responsable de l\u2019équipe du samedi' }],
    pourLeCV: 'Responsable de l\u2019équipe du samedi', pourLOral: 'J\u2019étais responsable de l\u2019équipe du samedi.' });
  assert.ok(verifier(base(intitule), p).erreurs.some((e) => /intitulé de poste seul/.test(e)));
  assert.ok(verifier(base(Object.assign({}, ok, { pourPreparer: 'À quelle date avez-vous passé ce certificat ?' })), p).avertissements.some((w) => /diplôme ou un certificat/.test(w)));
  const p2 = profil('accueil_trois_documents');
  const o2 = copie(BONNE); o2.competences[0].pourLOral = 'La directrice de l\u2019association indique que j\u2019ai assuré l\u2019accueil.';
  assert.ok(verifier(reponse(o2), p2).erreurs.some((e) => /Nom de tiers/.test(e)));
});

test('un JSON coupé ou invalide, ou « analyseImpossible » à tort, sont signalés', () => {
  const p = profil('accueil_trois_documents');
  assert.ok(verifier('Voici.\n```json\n{ "niveauPoste": "execution", "competences": [', p).erreurs.some((e) => /JSON coupé/.test(e)));
  assert.ok(verifier('Voici.\n```json\n{ "niveauPoste": }\n```', p).erreurs.some((e) => /JSON invalide/.test(e)));
  assert.ok(verifier(reponse({ analyseImpossible: true, message: 'x' }), p).erreurs.some((e) => /analyseImpossible/.test(e)));
});

test('un niveau choisi plus haut que la preuve est signalé à relire, sans être une erreur', () => {
  const p = profil('chef_equipe_niveau_cadre_choisi');
  const o = { niveauPoste: 'technicien', niveauPosteIndices: 'Vos documents montrent surtout l’animation d’une équipe de six personnes.',
    competences: [comp({ libelle: 'Répartir les tâches d’une équipe', preuves: [{ typeDocument: 'cv', numeroDocument: 1, extrait: 'répartition des tâches chaque matin' }],
      pourLeCV: 'Répartition des tâches chaque matin dans une équipe de six', pourLOral: 'Chaque matin, je répartis les tâches entre six préparateurs. Je signale les retards à mon responsable.' })], motivations: [] };
  const r = verifier(reponse(o), p);
  assert.deepEqual(r.erreurs, []);
  assert.ok(r.avertissements.some((w) => /niveau choisi/.test(w)));
});

test('la normalisation ignore accents, apostrophes et ponctuation', () => {
  assert.equal(normaliser('L’accueil téléphonique, la prise…'), normaliser("l'accueil telephonique la prise"));
  assert.ok(extraireJson('a\n```json\n{"a":1}\n```').json.a === 1);
});
