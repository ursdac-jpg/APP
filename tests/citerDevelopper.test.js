/* ============================================================
   tests/citerDevelopper.test.js  (2026-11-15)
   ------------------------------------------------------------
   « Citer ou développer » : logique pure (modules/citer-developper/logique.js). Consignes 354 à 357 de Denis.
   Maquette : docs/MAQUETTE_CITER_OU_DEVELOPPER_2026-11-15.html. L'interface (js/app.js) reste vérifiée au navigateur.
   ============================================================ */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const L = require('../modules/citer-developper/logique.js');

// Les 31 certifications du catalogue de l'application (CATALOGUE_CERTIFICATIONS, js/app.js) : lues dans le code, jamais recopiées ici.
function certificationsDuCatalogue() {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const debut = app.indexOf('var CATALOGUE_CERTIFICATIONS = [');
  const bloc = app.slice(debut, app.indexOf('];', debut));
  const items = [];
  bloc.replace(/items: \[([^\]]*)\]/g, (m, liste) => { liste.replace(/'([^']*)'/g, (m2, v) => { items.push(v); return m2; }); return m; });
  return items;
}

test('toute certification du catalogue écrite en sigle a son nom complet', () => {
  const items = certificationsDuCatalogue();
  assert.ok(items.length >= 31, 'le catalogue compte 31 certifications');
  const sansNom = items.filter(i => /^[A-Z0-9]{2,6}$|^R4\d\d$|^BE /.test(i) && !L.cdNomCompletCertification(i));
  assert.deepEqual(sansNom, [], 'sigles sans nom complet');
  assert.equal(L.cdNomCompletCertification('SST'), 'Sauveteur Secouriste du Travail');
  assert.equal(L.cdNomCompletCertification('sst'), 'Sauveteur Secouriste du Travail');
  assert.equal(L.cdNomCompletCertification('BE Manœuvre'), L.CD_NOMS_COMPLETS_CERTIFS['BE Manœuvre']);
  assert.equal(L.cdNomCompletCertification('Soudure'), '');
  assert.equal(L.cdNomCompletCertification('Ma formation maison'), '');
  assert.equal(L.cdNomCompletCertification(''), '');
});

test('les noms complets ne contiennent ni tiret long ni le mot « IA »', () => {
  Object.keys(L.CD_NOMS_COMPLETS_CERTIFS).forEach(k => {
    const t = L.CD_NOMS_COMPLETS_CERTIFS[k];
    assert.ok(!/[—–]/.test(t), k);
    assert.ok(!/\bIA\b/.test(t), k);
  });
  assert.ok(!/[—–]/.test(L.CD_MARQUEUR_CITE + L.CD_MARQUEUR_DEVELOPPE + L.CD_REGLE_CITE));
  assert.ok(!/IA/.test(L.CD_REGLE_CITE));
});

test('la question n’a de sens que là où des missions sont possibles', () => {
  assert.equal(L.cdQuestionPossible('loisirs', 'Football'), false);
  assert.equal(L.cdQuestionPossible('formations', 'CAP Cuisine'), false, 'les diplômes ont déjà leur propre question');
  assert.equal(L.cdQuestionPossible('certifications', 'SST'), true);
  assert.equal(L.cdQuestionPossible('certifications', 'Habilitation de mon ancien employeur'), true, 'un élément écrit par la personne reçoit la question');
  ['PIX', 'ICDL', 'TOSA', 'TOEIC', 'TOEFL', 'Linguaskill', 'DELF', 'DALF', 'pix'].forEach(c => assert.equal(L.cdQuestionPossible('certifications', c), false, c));
  assert.equal(L.cdQuestionPossible('engagements', 'Président d’association'), true);
  assert.equal(L.cdQuestionPossible('experiencesPerso', 'Gestion d’un foyer'), true);
  assert.equal(L.cdQuestionPossible('engagements', 'Un engagement écrit librement'), true);
});

test('mode réel : réponse explicite d’abord, sans réponse cité sauf missions déjà écrites', () => {
  assert.equal(L.cdModeEffectif('dev', ''), 'dev');
  assert.equal(L.cdModeEffectif('oui', ''), 'dev');
  assert.equal(L.cdModeEffectif('cite', 'une mission écrite'), 'cite', 'une réponse « cité » l’emporte sur du texte resté en mémoire');
  assert.equal(L.cdModeEffectif('non', 'x'), 'cite');
  assert.equal(L.cdModeEffectif(null, ''), 'cite');
  assert.equal(L.cdModeEffectif(undefined, '   '), 'cite');
  assert.equal(L.cdModeEffectif(null, 'Gérer le budget'), 'dev', 'rien n’est perdu pour les données d’avant');
});

test('missions en liste : une par ligne, lignes vides retirées', () => {
  assert.deepEqual(L.cdMissionsEnListe('a\n\n b \r\nc'), ['a', 'b', 'c']);
  assert.deepEqual(L.cdMissionsEnListe(['x', ' ', 'y']), ['x', 'y']);
  assert.deepEqual(L.cdMissionsEnListe(null), []);
});

test('garantie à l’import : seules les propositions sur un élément développé sont gardées', () => {
  const propositions = [
    { certification: 'SST', missions: ['a'] },
    { certification: 'CACES R482', missions: ['b'] },
    { certification: 'Inconnu', missions: ['c'] },
    { certification: '', missions: ['d'] }
  ];
  const gardees = L.cdGarderSeulementDeveloppes(propositions, 'certification', ['SST']);
  assert.deepEqual(gardees.map(p => p.certification), ['SST']);
  assert.deepEqual(L.cdGarderSeulementDeveloppes(propositions, 'certification', []), [], 'rien de développé : tout est retiré');
  assert.deepEqual(L.cdGarderSeulementDeveloppes(null, 'certification', ['SST']), []);
  const tolerant = L.cdGarderSeulementDeveloppes([{ texte: 'Président d’association (2019-2022)', missions: ['x'] }], 'texte', ['Président d’association']);
  assert.equal(tolerant.length, 1, 'le nom peut porter une période à la suite');
});

test('nom de l’élément : chaîne ou objet', () => {
  assert.equal(L.cdNomElement('SST'), 'SST');
  assert.equal(L.cdNomElement({ texte: 'Bénévolat' }), 'Bénévolat');
  assert.equal(L.cdNomElement({ intitule: 'Gestion d’un foyer' }), 'Gestion d’un foyer');
  assert.equal(L.cdNomElement(null), '');
});

test('à citer dans le profil : réponse « cité », ou « développé » sans aucune mission écrite', () => {
  assert.equal(L.cdEstCite('cite', 'a'), true);
  assert.equal(L.cdEstCite('dev', ''), true, 'développer sans mission = rien à reformuler, donc cité');
  assert.equal(L.cdEstCite('dev', 'a\nb'), false);
  assert.equal(L.cdEstCite(null, ''), true);
  assert.equal(L.cdEstCite(null, 'Gérer le budget'), false);
});

// ---- Missions proposées aux certifications (cases à cocher), modules/citer-developper/missionsCertifications.js ----
const M = require('../modules/citer-developper/missionsCertifications.js');
Object.assign(global, { cdNormaliser: L.cdNormaliser });

test('chaque certification du catalogue qui reçoit la question a ses missions à cocher, et elles sont propres', () => {
  const items = certificationsDuCatalogue();
  const avecQuestion = items.filter(c => L.cdQuestionPossible('certifications', c));
  assert.ok(avecQuestion.length >= 23, 'les 23 certifications de métier');
  avecQuestion.forEach(c => {
    const liste = M.cdMissionsProposees(c);
    assert.ok(liste.length >= 9 && liste.length <= 12, c + ' : environ 10 missions (' + liste.length + ')');
    assert.equal(new Set(liste).size, liste.length, c + ' : pas de doublon');
    liste.forEach(m => {
      assert.ok(!/[—–]/.test(m) && !/\bIA\b/.test(m) && !/confirmer/i.test(m), c + ' : ' + m);
      assert.ok(m === m.trim() && /^[A-ZÉÈÀ]/.test(m), c + ' : majuscule et pas d’espace en trop : ' + m);
    });
  });
  // Aucune certification sans question n'a de missions proposées
  items.filter(c => !L.cdQuestionPossible('certifications', c)).forEach(c => assert.deepEqual(M.cdMissionsProposees(c), [], c));
  assert.deepEqual(M.cdMissionsProposees('Ma formation maison'), []);
  assert.equal(M.cdMissionsProposees('sst')[0], M.CD_MISSIONS_CERTIFS['SST'][0], 'insensible à la casse');
});

// Les deux catalogues d'éléments : lus dans le code, jamais recopiés ici.
function elementsDuCatalogue(nom) {
  const app = fs.readFileSync(path.join(__dirname, '..', 'js', 'app.js'), 'utf8');
  const debut = app.indexOf('var ' + nom + ' = [');
  const bloc = app.slice(debut, app.indexOf('];', debut));
  const items = [];
  bloc.replace(/items: \[([^\]]*)\]/g, (m, liste) => { liste.replace(/'((?:[^'\\]|\\.)*)'/g, (m2, v) => { items.push(v.replace(/\\'/g, '\'')); return m2; }); return m; });
  return items;
}
const E = require('../modules/citer-developper/missionsEngagementsExperiences.js');
Object.assign(global, { CD_MISSIONS_ELEMENTS: E.CD_MISSIONS_ELEMENTS });

test('chaque engagement et chaque expérience personnelle du catalogue a ses missions à cocher, propres et en nombre raisonnable', () => {
  const engagements = elementsDuCatalogue('CATALOGUE_ENGAGEMENTS');
  const experiences = elementsDuCatalogue('CATALOGUE_EXPERIENCES_PERSO');
  assert.equal(engagements.length, 29);
  assert.equal(experiences.length, 36);
  engagements.forEach(c => check(c, M.cdMissionsProposees(c, 'engagements')));
  experiences.forEach(c => check(c, M.cdMissionsProposees(c, 'experiencesPerso')));
  function check(c, liste) {
    assert.ok(liste.length >= 8 && liste.length <= 12, c + ' : ' + liste.length + ' missions');
    assert.equal(new Set(liste).size, liste.length, c + ' : pas de doublon');
    liste.forEach(m => {
      assert.ok(!/[—–]/.test(m) && !/\bIA\b/.test(m), c + ' : ' + m);
      assert.ok(m === m.trim() && /^[A-ZÉÈÀ]/.test(m), c + ' : ' + m);
    });
  }
  // Les éléments en commun partagent une seule liste
  ['Aidant familial', 'Accompagnement de personnes âgées', 'Organisation d\'événements'].forEach(c =>
    assert.deepEqual(M.cdMissionsProposees(c, 'engagements'), M.cdMissionsProposees(c, 'experiencesPerso'), c));
  // Apostrophe typographique tolérée, élément libre sans case
  assert.ok(M.cdMissionsProposees('Président d’association', 'engagements').length >= 8);
  assert.deepEqual(M.cdMissionsProposees('Un engagement écrit librement', 'engagements'), []);
  // Une liste de métier n'est jamais proposée à un engagement
  assert.deepEqual(M.cdMissionsProposees('SST', 'engagements'), []);
});

test('prudence : un BS ne fait ni diagnostic ni dépannage, un BE Manœuvre ne travaille pas sur des pièces nues', () => {
  assert.ok(!M.cdMissionsProposees('BS').some(m => /diagnostic|dépann/i.test(m)));
  assert.ok(!M.cdMissionsProposees('BE Manœuvre').some(m => /remplacer|raccorder|dépann/i.test(m)));
});

test('cases cochées et mots de la personne : un seul texte, aller-retour sans perte', () => {
  const p = M.cdMissionsProposees('SST');
  const texte = M.cdAssemblerMissions([p[2], p[0]], ['Former mes collègues aux gestes de premiers secours']);
  assert.deepEqual(M.cdMissionsCochees(texte, p), [p[0], p[2]], 'dans l’ordre de la liste proposée');
  assert.deepEqual(M.cdMissionsLibres(texte, p), ['Former mes collègues aux gestes de premiers secours']);
  assert.equal(M.cdAssemblerMissions(M.cdMissionsCochees(texte, p), M.cdMissionsLibres(texte, p)).split('\n').length, 3);
  assert.equal(M.cdAssemblerMissions([p[0]], [p[0].toLowerCase(), '  ', 'Autre']), p[0] + '\nAutre', 'pas de doublon, pas de ligne vide');
  assert.deepEqual(M.cdMissionsCochees('', p), []);
  assert.deepEqual(M.cdMissionsLibres(null, p), []);
});

// ---- Texte transmis à l'assistant : engagements et expériences personnelles (modules/cv-core/normaliserDonneesCV.js) ----
// Les fonctions du module sont des globaux du navigateur : on les expose ici comme le fait index.html.
Object.assign(global, L);
const { _cvProfilEngagements, _cvProfilLignesExperiencesPerso } = require('../modules/cv-core/normaliserDonneesCV.js');

test('profil : un engagement développé donne ses missions, un engagement seulement cité est marqué sans mission', () => {
  const t = _cvProfilEngagements([
    { texte: 'Président d’association', dateDebut: '2019', dateFin: '2022', missions: 'Animer les réunions', developper: 'dev' },
    { texte: 'Secourisme', missions: '' },
    { texte: 'Judo', missions: 'Entraîner les enfants', developper: 'cite' },
    'Trésorier'
  ]);
  assert.ok(t.includes('Président d’association (2019-2022) - Missions de la personne : Animer les réunions'));
  assert.ok(t.includes('Secourisme - À CITER SEULEMENT'));
  assert.ok(t.includes('Judo - À CITER SEULEMENT'));
  assert.ok(!t.includes('Entraîner les enfants'), 'les missions d’un élément cité ne sont pas transmises');
  assert.ok(t.includes('Trésorier - À CITER SEULEMENT'));
});

test('profil : expériences personnelles, mêmes règles', () => {
  const l = _cvProfilLignesExperiencesPerso([
    { intitule: 'Gestion d’un foyer', dateDebut: '2010', missions: 'Planifier le budget' },
    { intitule: 'Aidant familial', missions: '', developper: 'cite' },
    { intitule: 'Garde d’enfants', missions: 'Accompagner les devoirs', developper: 'cite' }
  ]);
  assert.ok(l[0].includes('Missions de la personne : Planifier le budget'), 'des missions déjà écrites valent « développé »');
  assert.ok(l[1].endsWith('À CITER SEULEMENT'));
  assert.ok(l[2].endsWith('À CITER SEULEMENT') && !l[2].includes('devoirs'));
});

test('profil : sans le module, le format d’avant est gardé tel quel', () => {
  Object.keys(L).forEach(k => { delete global[k]; });
  const t = _cvProfilEngagements(['Judo', { texte: 'Restos du cœur', missions: '' }]);
  assert.ok(!t.includes('À CITER SEULEMENT'));
  assert.ok(t.startsWith('- Engagements : Judo, Restos du cœur'));
  Object.assign(global, L);
});
