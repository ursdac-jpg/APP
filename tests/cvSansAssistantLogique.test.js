// Module « Mettre mon CV en page, sans rien changer » : logique pure (modules/cv-sans-assistant/logique.js).
// Les deux CV d'exemple sont ceux de la maquette (docs/MAQUETTE_CV_SANS_ASSISTANT_2026-10-22.html) ; les personnes y sont inventées.
const test = require('node:test');
const assert = require('node:assert');
const L = require('../modules/cv-sans-assistant/logique.js');

const CV_A = [
  'Camille RIVIÈRE', 'Chargée de clientèle', '06 12 34 56 78', 'camille.riviere@email.fr', '12 rue des Tilleuls', '24100 Bergerac', '',
  'Conseillère clientèle expérimentée, à l’aise à l’accueil comme au téléphone, je cherche un poste stable près de chez moi.', '',
  'EXPÉRIENCE PROFESSIONNELLE', '',
  'Chargée de clientèle - Assurances du Périgord, Bergerac', 'Mars 2019 - Juin 2024',
  '- Accueil physique et téléphonique de 40 clients par jour', '- Souscription et suivi des contrats auto et habitation',
  '- Traitement des réclamations et suivi des sinistres', '- Formation de deux nouvelles collègues', '',
  'Hôtesse de caisse - Supermarché du Centre, Périgueux', '2015 - 2019', '- Encaissement et gestion de la caisse', '- Mise en rayon et inventaires', '',
  'FORMATION', '',
  'BTS Négociation et digitalisation de la relation client', 'Lycée Maine de Biran, Bergerac, 2015', '',
  'Baccalauréat professionnel Commerce', 'Lycée Jean Capelle, Bergerac, 2013', '',
  'COMPÉTENCES', 'Logiciels d’assurance, Excel, Word', 'Gestion des réclamations', 'Écoute et patience', 'Esprit d’équipe', '',
  'LANGUES', 'Français : langue maternelle', 'Anglais : B1', '',
  'CENTRES D’INTÉRÊT', 'Randonnée, bénévolat à la banque alimentaire, lecture', '',
  'Permis B, véhicule personnel', 'Disponible immédiatement'
].join('\n');

const CV_B = [
  'BENALI Karim', 'Ouvrier polyvalent du bâtiment', '07 98 76 54 32 - karim.benali@email.fr', 'Limoges 87000', '',
  'MON PARCOURS', '',
  '2021 - 2024   Maçon polyvalent, Entreprise Dupré Construction (Limoges)', 'Maçonnerie, coffrage, ferraillage', 'Conduite de petits engins sur chantier', 'Respect des règles de sécurité', '',
  '2018 - 2021   Manœuvre, Société Bâti-Limousin (Isle)', 'Aide aux maçons et aux couvreurs', 'Chargement et déchargement des matériaux', '',
  'CE QUE JE SAIS FAIRE', 'Lecture de plans', 'Maçonnerie', 'Conduite de mini-pelle', '',
  'ÉCOLE ET DIPLÔMES', 'CAP Maçon - 2018', 'Centre de formation des apprentis du bâtiment, Limoges', 'CACES R482 cat. A et B - 2022', 'SST (Sauveteur secouriste du travail) - 2023', '',
  'QUI JE SUIS', 'Sérieux, ponctuel, aime le travail en équipe', '',
  'Arabe et français : courant', 'Anglais : notions', 'Permis B et C', 'Football le week-end, bricolage', 'Reconnu travailleur handicapé (RQTH)'
].join('\n');

const rubs = (blocs) => blocs.map((b) => b.rub);

test('titres : reconnus sans accent, sans espace ni ponctuation ; un titre inconnu en majuscules est « à classer » ; une ligne ordinaire n\'est pas un titre', () => {
  assert.strictEqual(L.csaTypeTitre('EXPÉRIENCES PROFESSIONNELLES').rub, 'experience');
  assert.strictEqual(L.csaTypeTitre('C O M P É T E N C E S').rub, 'competences');
  assert.strictEqual(L.csaTypeTitre('COMPÉTENCESPROFESSIONNELLES').rub, 'competences');
  assert.strictEqual(L.csaTypeTitre('Centres d’intérêt :').rub, 'loisirs');
  assert.strictEqual(L.csaTypeTitre('SAVOIR-ÊTRE').rub, 'qualites');
  assert.strictEqual(L.csaTypeTitre('CE QUE JE SAIS FAIRE').rub, 'aclasser');
  assert.strictEqual(L.csaTypeTitre('Camille RIVIÈRE'), null);
  assert.strictEqual(L.csaTypeTitre('- Formation de deux nouvelles collègues'), null);
  assert.strictEqual(L.csaTypeTitre('06 12 34 56 78'), null);
});

test('CV rangé (A) : chaque bloc est classé tout seul, par titre ou par contenu', () => {
  const blocs = L.csaDecouper(CV_A);
  assert.deepStrictEqual(rubs(blocs), ['identite', 'accroche', 'experience', 'experience', 'formation', 'formation', 'competences', 'langues', 'loisirs', 'identite', 'autres']);
  assert.strictEqual(blocs[2].origine, 'EXPÉRIENCE PROFESSIONNELLE');
  assert.strictEqual(blocs[3].origine, '');
  assert.strictEqual(blocs[9].auto, 'contenu');   // « Permis B » reconnu même rangé sous les centres d'intérêt
});

test('CV en désordre (B) : ce qui est sûr est classé, le reste est « à classer » avec une proposition quand il y en a une', () => {
  const blocs = L.csaDecouper(CV_B);
  assert.deepStrictEqual(rubs(blocs), ['identite', 'experience', 'experience', 'aclasser', 'formation', 'aclasser', 'langues', 'identite', 'loisirs', 'autres']);
  assert.strictEqual(blocs[3].prop, undefined);          // « CE QUE JE SAIS FAIRE » : aucune idée sûre
  assert.strictEqual(blocs[5].prop, 'qualites');          // « QUI JE SUIS : Sérieux, ponctuel... » : proposition « Qualités ? »
});

test('fiches de A : identité, titre, accroche, expériences et formations lues', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_A));
  assert.deepStrictEqual({ nom: F.identite.nom, prenom: F.identite.prenom, tel: F.identite.telephone, mail: F.identite.email, cp: F.identite.codePostal, ville: F.identite.ville, adr: F.identite.adresse },
    { nom: 'RIVIÈRE', prenom: 'Camille', tel: '06 12 34 56 78', mail: 'camille.riviere@email.fr', cp: '24100', ville: 'Bergerac', adr: '12 rue des Tilleuls' });
  assert.strictEqual(F.titre, 'Chargée de clientèle');
  assert.ok(F.accroche.indexOf('Conseillère clientèle expérimentée') === 0);
  assert.strictEqual(F.identite.permis, 'Permis B, véhicule personnel');
  assert.strictEqual(F.experience.length, 2);
  const e = F.experience[0];
  assert.deepStrictEqual({ poste: e.poste, ent: e.entreprise, lieu: e.lieu, debut: e.debut, fin: e.fin }, { poste: 'Chargée de clientèle', ent: 'Assurances du Périgord', lieu: 'Bergerac', debut: 'mars 2019', fin: 'juin 2024' });
  assert.strictEqual(e.missions.length, 4);
  assert.strictEqual(e.missions[0], 'Accueil physique et téléphonique de 40 clients par jour');   // la puce est retirée, pas un mot de plus
  assert.deepStrictEqual({ debut: F.experience[1].debut, fin: F.experience[1].fin }, { debut: '2015', fin: '2019' });
  const f = F.formation[0];
  assert.deepStrictEqual({ i: f.intitule, a: f.annee, e: f.etablissement, l: f.lieu }, { i: 'BTS Négociation et digitalisation de la relation client', a: '2015', e: 'Lycée Maine de Biran', l: 'Bergerac' });
  assert.deepStrictEqual(F.competences.slice(0, 3), ['Logiciels d’assurance', 'Excel', 'Word']);
  assert.deepStrictEqual(F.autres, ['Disponible immédiatement']);
  assert.strictEqual(F.titres.experience, 'Expérience professionnelle');
});

test('fiches de B : ville écrite avant le code postal, date au début de la ligne du poste, lignes en trop d\'une formation rangées en certifications avec une alerte', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_B));
  assert.deepStrictEqual({ nom: F.identite.nom, prenom: F.identite.prenom, cp: F.identite.codePostal, ville: F.identite.ville }, { nom: 'BENALI', prenom: 'Karim', cp: '87000', ville: 'Limoges' });
  assert.ok(F.devine['identite.nom'] && F.devine['identite.ville']);
  assert.deepStrictEqual({ poste: F.experience[0].poste, ent: F.experience[0].entreprise, lieu: F.experience[0].lieu, debut: F.experience[0].debut }, { poste: 'Maçon polyvalent', ent: 'Entreprise Dupré Construction', lieu: 'Limoges', debut: '2021' });
  assert.strictEqual(F.formation.length, 1);
  assert.deepStrictEqual({ i: F.formation[0].intitule, a: F.formation[0].annee, e: F.formation[0].etablissement }, { i: 'CAP Maçon', a: '2018', e: 'Centre de formation des apprentis du bâtiment' });
  assert.deepStrictEqual(F.certifications, ['CACES R482 cat. A et B - 2022', 'SST (Sauveteur secouriste du travail) - 2023']);
  assert.ok(F.alertes.some((a) => a.cle === 'formation'));
  assert.strictEqual(F.identite.permis, 'Permis B et C');
});

test('gestes de la personne : choisir une rubrique, couper, fusionner (sans toucher aux blocs d\'origine)', () => {
  const blocs = L.csaDecouper(CV_B);
  const apres = L.csaChoisirRubrique(blocs, 3, 'competences');
  assert.strictEqual(apres[3].rub, 'competences'); assert.strictEqual(apres[3].auto, 'choix'); assert.strictEqual(blocs[3].rub, 'aclasser');
  const coupe = L.csaCouperApres(blocs, 4, 1);
  assert.strictEqual(coupe.length, blocs.length + 1);
  assert.strictEqual(coupe[4].lignes.length, 2); assert.strictEqual(coupe[5].lignes.length, 2); assert.strictEqual(coupe[5].rub, 'formation');
  const fusion = L.csaFusionnerAvecLeDessus(coupe, 5);
  assert.strictEqual(fusion.length, blocs.length);
  assert.strictEqual(fusion[4].lignes.length, 4);
  assert.strictEqual(L.csaFusionnerAvecLeDessus(blocs, 0), blocs);
});

test('rubrique libre : un bloc « à classer » rangé dans Autres informations donne son titre à la rubrique ; un 2e titre différent n\'est pas perdu', () => {
  let blocs = L.csaDecouper(CV_B);
  blocs = L.csaChoisirRubrique(blocs, 3, 'autres');
  let F = L.csaConstruireFiches(blocs);
  assert.strictEqual(F.titres.autres, 'Ce que je sais faire');
  assert.ok(F.autres.indexOf('Lecture de plans') !== -1 && F.autres.indexOf('CE QUE JE SAIS FAIRE') === -1);
  blocs = L.csaChoisirRubrique(blocs, 5, 'autres');
  F = L.csaConstruireFiches(blocs);
  assert.strictEqual(F.titres.autres, 'Ce que je sais faire');
  assert.ok(F.autres.indexOf('QUI JE SUIS') !== -1, 'le titre du 2e bloc reste écrit');
  assert.ok(F.alertes.some((a) => a.cle === 'autres'));
});

test('rien ne se perd : toutes les lignes utiles du CV A se retrouvent dans les fiches (comptage)', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_A));
  // identité 8 (nom, prénom, tél, courriel, adresse, cp, ville, permis) + titre + accroche + 2 expériences (5+4 puis 5+2 = 16 sans le lieu manquant) + 2 formations (4+4) + 6 compétences + 2 langues + 3 loisirs + 1 autre
  assert.ok(L.csaCompter(F) >= 45, 'comptage = ' + L.csaCompter(F));
});

test('décisions pour la fiche du CV : au format de fusionnerDonnees, dates et permis écrits comme l\'import', () => {
  const D = L.csaVersDecisions(L.csaConstruireFiches(L.csaDecouper(CV_A)));
  assert.strictEqual(D.identite.champsAAppliquer.nom, 'RIVIÈRE');
  assert.strictEqual(D.identite.champsAAppliquer.telephone, '06 12 34 56 78');
  assert.deepStrictEqual(D.presentation.champsAAppliquer.titre, 'Chargée de clientèle');
  const e0 = D.experiences.elementsAAjouter[0];
  assert.deepStrictEqual({ d: e0.dateDebut, f: e0.dateFin, s: e0.stage, n: e0.missions.length }, { d: '2019-03', f: '2024-06', s: null, n: 4 });
  assert.deepStrictEqual({ d: D.experiences.elementsAAjouter[1].dateDebut, f: D.experiences.elementsAAjouter[1].dateFin }, { d: '2015', f: '2019' });
  assert.strictEqual(D.formations.elementsAAjouter[0].annee, '2015');
  assert.deepStrictEqual(D.langues.elementsAAjouter, [{ langue: 'Français', niveau: 'langue maternelle' }, { langue: 'Anglais', niveau: 'B1' }]);
  assert.deepStrictEqual(D.permis.champsAAppliquer, { possede: true, categories: ['B'], vehicule: true });
  assert.deepStrictEqual(D.informationsNonClassees.elementsAAjouter, ['Disponible immédiatement']);
  assert.ok(D.competences.savoirFaire.elementsAAjouter.indexOf('Excel') !== -1);
  // Aucune catégorie que l'import ne connaît pas.
  const connues = ['identite', 'presentation', 'experiences', 'formations', 'competences', 'langues', 'certifications', 'logiciels', 'permis', 'loisirs', 'engagements', 'experiencesPerso', 'informationsNonClassees'];
  Object.keys(D).forEach((k) => assert.ok(connues.indexOf(k) !== -1, 'catégorie inconnue : ' + k));
});

test('langues : « Français : langue maternelle », « Anglais - B1 », « Arabe (courant) », « Espagnol »', () => {
  assert.deepStrictEqual(L.csaDecoupeLangue('Français : langue maternelle'), { langue: 'Français', niveau: 'langue maternelle' });
  assert.deepStrictEqual(L.csaDecoupeLangue('Anglais - B1'), { langue: 'Anglais', niveau: 'B1' });
  assert.deepStrictEqual(L.csaDecoupeLangue('Arabe (courant)'), { langue: 'Arabe', niveau: 'courant' });
  assert.deepStrictEqual(L.csaDecoupeLangue('Espagnol'), { langue: 'Espagnol', niveau: '' });
});

test('nom et prénom : les mots en majuscules sont le nom', () => {
  assert.deepStrictEqual(L.csaSeparerNomPrenom('BENALI Karim'), { nom: 'BENALI', prenom: 'Karim' });
  assert.deepStrictEqual(L.csaSeparerNomPrenom('Camille RIVIÈRE'), { nom: 'RIVIÈRE', prenom: 'Camille' });
  assert.deepStrictEqual(L.csaSeparerNomPrenom('Camille Martin'), { nom: 'Martin', prenom: 'Camille' });
});

test('périodes : une ligne qui n\'est qu\'une période est lue, une ligne de texte non', () => {
  assert.deepStrictEqual(L.csaPlageSeule('Mars 2019 - Juin 2024'), { debut: '2019-03', fin: '2024-06', enCours: false });
  assert.deepStrictEqual(L.csaPlageSeule('2018'), { debut: '2018', fin: '', enCours: false });
  assert.deepStrictEqual(L.csaPlageSeule('depuis 2021 - aujourd\'hui'), { debut: '2021', fin: '', enCours: true });
  assert.strictEqual(L.csaPlageSeule('Assistante en 2019 chez nous'), null);
});

// Un CV tel que la lecture d'un PDF le rend : AUCUNE ligne vide entre deux expériences ni entre deux formations, métier en capitales dans l'en-tête, titres en lettres espacées.
const CV_PDF = [
  'AGENTE D’ACCUEIL ET', 'Camille', 'MARTIN DE SÉCURITÉ', '06.12.34.56.78', 'camille.martin@exemple.fr', 'Limoges, 87000',
  'COMPÉTENCES PROFESSIONNELLES', 'Ponctualité •\tRègles d\'hygiène •', 'Sens du contact • Lecture de schémas •',
  'COMPÉTENCES COMPORTEMENTALES', 'Organisation • Gestion du temps • Rigueur • Endurance • Autonomie • Adaptabilité',
  'EXPÉRIENCES PROFESSIONNELLES',
  'Agent de sécurité - Sécuritas, Limoges\t2022 - 2024', 'Surveiller les accès.', 'Contrôler les badges.',
  'Hôtesse d’accueil - Clinique du Parc, Limoges\t2019 - 2021', 'Accueillir les patients.', 'Gérer les rendez-vous.',
  'FORMATIONS', 'CAP - Agent de prévention - AFPA\t2021', 'Certification - SST\t2024',
  'LANGUES', 'Anglais - niveau B1', 'C E N T R E S D ’ I N T É R Ê T', 'Cuisine', 'Randonnée'
].join('\n');

test('lecture d\'un PDF : le métier en capitales de l\'en-tête reste dans l\'en-tête, l\'identité est lue, le nom est choisi avec le courriel', () => {
  const blocs = L.csaDecouper(CV_PDF);
  assert.strictEqual(blocs[0].rub, 'identite');
  const F = L.csaConstruireFiches(blocs);
  assert.strictEqual(F.identite.telephone, '06.12.34.56.78');
  assert.strictEqual(F.identite.email, 'camille.martin@exemple.fr');
  assert.deepStrictEqual({ cp: F.identite.codePostal, ville: F.identite.ville }, { cp: '87000', ville: 'Limoges' });   // « Limoges, 87000 »
  assert.deepStrictEqual({ prenom: F.identite.prenom, nom: F.identite.nom }, { prenom: 'Camille', nom: 'MARTIN' });   // les deux mots du courriel, sur deux lignes
  assert.strictEqual(F.titre, 'AGENTE D’ACCUEIL ET DE SÉCURITÉ');   // la suite du titre, venue avec le nom, est recollée
});

test('lecture d\'un PDF : deux expériences sans ligne vide entre elles sont séparées, avec leurs missions', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_PDF));
  assert.strictEqual(F.experience.length, 2);
  assert.deepStrictEqual({ p: F.experience[0].poste, e: F.experience[0].entreprise, l: F.experience[0].lieu, d: F.experience[0].debut, f: F.experience[0].fin, m: F.experience[0].missions }, { p: 'Agent de sécurité', e: 'Sécuritas', l: 'Limoges', d: '2022', f: '2024', m: ['Surveiller les accès.', 'Contrôler les badges.'] });
  assert.deepStrictEqual({ p: F.experience[1].poste, d: F.experience[1].debut, f: F.experience[1].fin, m: F.experience[1].missions.length }, { p: 'Hôtesse d’accueil', d: '2019', f: '2021', m: 2 });
});

test('lecture d\'un PDF : une formation par ligne (année au bout) est séparée ; une ligne de certification va en certifications', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_PDF));
  assert.strictEqual(F.formation.length, 1);
  assert.deepStrictEqual({ i: F.formation[0].intitule, a: F.formation[0].annee }, { i: 'CAP - Agent de prévention - AFPA', a: '2021' });
  assert.deepStrictEqual(F.certifications, ['Certification - SST 2024']);
});

test('lecture d\'un PDF : puces au milieu d\'une ligne = plusieurs éléments ; titre en lettres espacées reconnu', () => {
  const F = L.csaConstruireFiches(L.csaDecouper(CV_PDF));
  assert.deepStrictEqual(F.competences, ['Ponctualité', 'Règles d\'hygiène', 'Sens du contact', 'Lecture de schémas']);
  assert.deepStrictEqual(F.qualites, ['Organisation', 'Gestion du temps', 'Rigueur', 'Endurance', 'Autonomie', 'Adaptabilité']);
  assert.deepStrictEqual(F.loisirs, ['Cuisine', 'Randonnée']);
});

test('séparation des expériences : une période seule appartient à la ligne de poste du dessus, jamais à la mission d\'avant', () => {
  const g = L.csaScinderExperiences(['Poste A - Société X', '2020 - 2022', '- mission 1', 'Poste B - Société Y', '2018 - 2020', '- mission 2']);
  assert.strictEqual(g.length, 2);
  assert.strictEqual(g[0][0], 'Poste A - Société X'); assert.strictEqual(g[1][0], 'Poste B - Société Y');
  assert.strictEqual(L.csaScinderExperiences(['Poste seul - Société', '2020 - 2022', '- mission']).length, 1);
});

test('nom : sans courriel, la première ligne courte ; un seul mot est le prénom si le courriel commence par lui', () => {
  assert.strictEqual(L.csaIndexNom(['Chargée de clientèle', 'Camille RIVIÈRE'], ''), 0);
  assert.strictEqual(L.csaIndexNom(['Chargée de clientèle', 'Camille RIVIÈRE'], 'camille.riviere@email.fr'), 1);
  assert.deepStrictEqual(L.csaSeparerNomPrenom('Camille', 'camille.martin@exemple.fr'), { nom: '', prenom: 'Camille' });
  assert.deepStrictEqual(L.csaSeparerNomPrenom('Martin', 'camille.martin@exemple.fr'), { nom: 'Martin', prenom: '' });
});

test('titre écrit sur deux lignes (« COMPÉTENCES » puis « COMPORTEMENTALES ») : lu comme un seul titre ; une ligne de symboles seuls est ignorée', () => {
  const blocs = L.csaDecouper(['Nom Prénom', 'a@b.fr', 'COMPÉTENCES', 'COMPORTEMENTALES', 'Rigueur', '■', 'Autonomie'].join('\n'));
  assert.deepStrictEqual(blocs.map((b) => b.rub), ['identite', 'qualites']);
  assert.deepStrictEqual(blocs[1].lignes, ['Rigueur', 'Autonomie']);
});

test('une période seule sans titre au-dessus ne commence pas une expérience ; une expérience vide n\'est pas créée', () => {
  assert.strictEqual(L.csaScinderExperiences(['Poste A - Société X', '2020 - 2022', '- mission', '2026', '- autre mission', 'Poste B - Société Y', '2018 - 2020']).length, 2);
  const F = L.csaConstruireFiches(L.csaDecouper(['EXPÉRIENCES', '2026', '2025'].join('\n')));
  assert.strictEqual(F.experience.length, 0);
  assert.ok(F.autres.indexOf('2026') !== -1, 'les lignes ne sont pas perdues');
});

test('saisie à la main : des fiches vides, les mêmes que celles d\'un CV déposé, donnent les mêmes décisions pour la fiche du CV', () => {
  const F = L.csaFicheVide();
  assert.strictEqual(L.csaCompter(F), 0);
  assert.strictEqual(F.experience.length, 1); assert.strictEqual(F.formation.length, 1);
  // La personne remplit à la main.
  Object.assign(F.identite, { nom: 'DUPONT', prenom: 'Marie', telephone: '06 11 22 33 44', email: 'marie.dupont@email.fr', codePostal: '19000', ville: 'Tulle', permis: 'Permis B' });
  F.titre = 'Aide à domicile';
  Object.assign(F.experience[0], { poste: 'Aide à domicile', entreprise: 'ADMR', lieu: 'Tulle', debut: '2021', enCours: true, missions: ['Aide à la toilette', 'Préparation des repas'] });
  Object.assign(F.formation[0], { intitule: 'CAP Accompagnant éducatif petite enfance', annee: '2020' });
  F.qualites.push('Patience'); F.langues.push('Français : langue maternelle'); F.autres.push('Disponible le week-end');
  const D = L.csaVersDecisions(F);
  assert.deepStrictEqual({ d: D.experiences.elementsAAjouter[0].dateDebut, f: D.experiences.elementsAAjouter[0].dateFin, n: D.experiences.elementsAAjouter[0].missions.length }, { d: '2021', f: '', n: 2 });   // « en cours » : fin vide
  assert.strictEqual(D.formations.elementsAAjouter[0].annee, '2020');
  assert.deepStrictEqual(D.competences.savoirEtre.elementsAAjouter, ['Patience']);
  assert.deepStrictEqual(D.permis.champsAAppliquer, { possede: true, categories: ['B'] });   // pas de véhicule écrit : rien n'est inventé
  assert.deepStrictEqual(D.informationsNonClassees.elementsAAjouter, ['Disponible le week-end']);
});

test('saisie à la main : les cartes laissées vides ne produisent rien dans la fiche du CV', () => {
  const D = L.csaVersDecisions(L.csaFicheVide());
  assert.strictEqual(D.experiences.elementsAAjouter.length, 0);
  assert.strictEqual(D.formations.elementsAAjouter.length, 0);
  assert.deepStrictEqual(D.identite.champsAAppliquer, {});
  assert.strictEqual(D.permis, undefined);
});

test('aucun tiret long dans les textes du module', () => {
  const fs = require('node:fs');
  ['logique.js', 'lecteurPdf.js', 'index.js'].forEach((f) => {
    const t = fs.readFileSync(__dirname + '/../modules/cv-sans-assistant/' + f, 'utf8');
    assert.ok(!/[–—]/.test(t), f + ' contient un tiret long');
  });
});

test('csaTexteAplati : un PDF recollé sur une ligne est détecté, un CV avec ses lignes non', () => {
  const long = 'Camille Rivière Chargée de clientèle Assurances du Périgord '.repeat(10);
  assert.strictEqual(L.csaTexteAplati(long), true);
  const avecLignes = long.replace(/ Chargée/g, '\nChargée').replace(/ Assurances/g, '\nAssurances');
  assert.strictEqual(L.csaTexteAplati(avecLignes), false);
  assert.strictEqual(L.csaTexteAplati('Court texte sur une ligne'), false);
  assert.strictEqual(L.csaTexteAplati(''), false);
});

test('CSA_OUVERT est un drapeau booléen (il ferme ou ouvre la carte de la voie 3)', () => {
  assert.strictEqual(typeof L.CSA_OUVERT, 'boolean');
});

test('csaIntitulesDOrigine : seuls les titres du CV d’origine différents de l’intitulé affiché par défaut deviennent des intitulés (clé = nom d’origine de la rubrique)', () => {
  const defauts = { 'Expérience professionnelle': 'Expériences professionnelles' };
  const r = L.csaIntitulesDOrigine({ qualites: 'Savoir-être', experience: 'Expériences professionnelles', formation: 'Mon parcours scolaire', autres: 'Qui je suis', loisirs: 'Centres d’intérêt', competences: '' }, defauts);
  assert.deepStrictEqual(r, { 'Compétences comportementales': 'Savoir-être', 'Formations': 'Mon parcours scolaire', 'Informations complémentaires': 'Qui je suis' });
  assert.deepStrictEqual(L.csaIntitulesDOrigine({ autres: 'x'.repeat(41) }, defauts), {});
  assert.deepStrictEqual(L.csaIntitulesDOrigine({}, defauts), {});
});
