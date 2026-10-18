#!/usr/bin/env node
/* ============================================================
   scripts/essai_prompts_ucpm.js
   Banc d'essai des prompts du module « Un CV, plusieurs métiers » (2026-10-08).

   Deux usages, sans aucune dépendance :
     node scripts/essai_prompts_ucpm.js generer
        -> écrit dans docs/essais_prompts_ucpm/ des fichiers .txt PRÊTS À COLLER
           dans un assistant en ligne (un fichier = une demande complète).
     node scripts/essai_prompts_ucpm.js verifier <metiers|accroches|lettres> <fichier_reponse.txt> [nombre_attendu]
        -> lit la réponse collée dans un fichier texte et contrôle ce qu'une machine
           peut contrôler : JSON valide ou coupé, nombre d'éléments, longueurs,
           formules interdites, tirets longs, ressemblance entre les lettres, mots
           d'invention probables, présence de l'objectif.
   Rien de ce que dit l'assistant n'est jamais jugé « bon » par ce script : il signale
   seulement ce qui doit être relu par une personne.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const RACINE = path.join(__dirname, '..');

/* ---------- Données d'essai (CV fictif, déjà masqué) ---------- */
const CV_TEST = [
  '[NOM MASQUÉ]',
  '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ] - [ADRESSE MASQUÉE]',
  'Permis B - Véhicule personnel',
  '',
  'AGENT D’ENTRETIEN DES BÂTIMENTS',
  'Agent d’entretien expérimenté (dix ans) en résidences collectives, en collectivité et en entreprise de peinture. Autonome, ponctuel, attentif aux consignes de sécurité. Sait travailler seul comme en équipe, et rendre compte au gestionnaire ou au responsable.',
  '',
  'EXPÉRIENCES PROFESSIONNELLES',
  '2019 - 2024 | Agent d’entretien en résidence (bailleur social), Limoges (87)',
  '- Entretien courant de 120 logements et des parties communes (halls, escaliers, caves, locaux poubelles)',
  '- Petits dépannages : plomberie (robinets, siphons, joints, chasses d’eau), remplacement de prises, d’interrupteurs et d’ampoules',
  '- Peinture de cages d’escalier et remise en état des logements libérés (état des lieux de sortie, petites réparations, nettoyage)',
  '- Relation avec les locataires, signalement des pannes au gestionnaire, suivi des interventions des entreprises extérieures',
  '- Gestion d’un stock de produits et de petit matériel, commandes mensuelles',
  '2016 - 2019 | Agent polyvalent des services techniques, commune de 6 000 habitants (87)',
  '- Entretien des bâtiments communaux (école, salle des fêtes, mairie) et des espaces verts (tonte, taille de haies, désherbage)',
  '- Petits travaux de maçonnerie (rebouchage, joints de carrelage) et de menuiserie (serrures, portes, étagères)',
  '- Montage et démontage de barnums, tables et scènes pour les fêtes locales ; déneigement et salage en hiver',
  '- Respect des consignes de sécurité, port des équipements de protection, entretien des outils',
  '2014 - 2016 | Aide-peintre, entreprise de peinture en bâtiment, Limoges',
  '- Préparation des supports (ponçage, enduit, rebouchage), peinture intérieure, pose de revêtements muraux, finitions',
  '- Chargement et rangement du matériel, protection des sols et du mobilier',
  '2012 - 2014 | Employé de libre-service, supermarché (CDD et intérim)',
  '- Mise en rayon, réassort, contrôle des dates, étiquetage',
  '- Accueil et renseignement des clients, aide en caisse en renfort',
  '',
  'FORMATIONS ET HABILITATIONS',
  '2014 | CAP Peintre applicateur de revêtements',
  '2018 | SST (sauveteur secouriste du travail), recyclage en 2022',
  '2021 | Habilitation électrique BS (électricité de base)',
  '2022 | Gestes et postures, prévention des risques (1 jour)',
  '',
  'COMPÉTENCES',
  'Petite plomberie - Peinture et finitions - Électricité de base (BS) - Entretien des espaces verts - Petite maçonnerie et menuiserie - Gestion de stock - Lecture de consignes et d’états des lieux - Relation avec le public - Travail en équipe',
  'Outils numériques : messagerie, tableur simple (suivi de stock)',
  '',
  'LANGUES : français (langue maternelle) ; anglais (notions)',
  'ENGAGEMENT : bénévole à la banque alimentaire (tri et distribution, deux samedis par mois) depuis 2020',
  'LOISIRS : bricolage, pêche, potager'
].join('\n');

const PROFIL_VALIDE = [
  'Titre du CV de référence : Agent d’entretien des bâtiments',
  'Accroche retenue : Agent d’entretien des bâtiments, autonome et ponctuel, avec dix ans d’expérience en résidences collectives et en collectivité.',
  'Compétences clés : petite plomberie, peinture et finitions, électricité de base (habilitation BS), entretien des espaces verts, petite maçonnerie et menuiserie, gestion de stock, travail en équipe.',
  'Expériences :',
  '- 2019-2024, agent d’entretien en résidence : 120 logements et parties communes, dépannages en plomberie et électricité de base, peinture des cages d’escalier, remise en état des logements libérés, relation avec les locataires, gestion d’un stock de produits.',
  '- 2016-2019, agent polyvalent des services techniques d’une commune : bâtiments communaux et espaces verts, petits travaux de maçonnerie et de menuiserie, montage de barnums, déneigement.',
  '- 2014-2016, aide-peintre : préparation des supports, peinture intérieure, revêtements muraux, finitions.',
  '- 2012-2014, employé de libre-service : mise en rayon, réassort, accueil des clients.',
  'Formations : CAP Peintre applicateur de revêtements (2014) ; SST (2018, recyclage 2022) ; habilitation électrique BS (2021) ; gestes et postures (2022).',
  'Engagement : bénévole à la banque alimentaire depuis 2020. Permis B.'
].join('\n');

const LIGNES = {
  offre: 'la motivation et l’intérêt de la personne pour ce poste et cette offre.',
  spontanee: 'le courage, la curiosité et l’affirmation de soi : la personne ose aller vers l’entreprise sans offre.',
  reconversion: 'les compétences transversales : ce que la personne peut apporter au nouveau métier grâce à ses acquis des autres métiers.',
  stage: 'l’engagement, l’assiduité et l’investissement (parfois au-delà des heures de formation, sur le temps libre) ; un stage de formation permet d’affiner et de concrétiser sur le terrain les théories vues en formation : la personne bâtit son expérience.',
  pmsmp: 'la découverte du métier : la personne veut le voir de près, le comprendre et tester son projet.',
  alternance: 'l’engagement dans la durée et l’assiduité, la capacité à faire le lien entre la formation et l’entreprise, la motivation pour apprendre un métier en situation de travail.',
  formation: 'ce qui prépare à la formation visée (expériences, diplômes, prérequis) et la motivation et le projet quand le CV les montre.'
};
const OBJECTIFS_PREMIER = [
  { k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : entretien et maintenance des bâtiments ; contrat : CDI ; temps plein' },
  { k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans ; objectif : apprendre un second métier du bâtiment' },
  { k: 'formation', details: 'organisme de formation ; durée : environ 6 mois ; la personne cherche une formation qui complète ses compétences en électricité' }
];
const NOM_OBJECTIF = { offre: 'Réponse à une offre', spontanee: 'Candidature spontanée', reconversion: 'Changement de métier', stage: 'Stage de formation', pmsmp: 'Stage d’immersion (PMSMP)', alternance: 'Alternance', formation: 'Entrée en formation' };
// Les dix CV d'essai (le premier est le CV de référence : pas d'accroche à écrire pour lui).
const METIERS = [
  { metier: 'Agent d’entretien des bâtiments', k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : entretien et maintenance des bâtiments ; contrat : CDI ; temps plein' },
  { metier: 'Peintre en bâtiment', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans ; début souhaité : septembre prochain ; disponibilités : horaires de journée, à temps plein en entreprise', employeur: 'Lacroix Peinture (entreprise fictive pour l’essai)', poste: 'Peintre en bâtiment en alternance' },
  { metier: 'Électricien d’entretien', k: 'formation', details: 'formation visée : électricité du bâtiment ; organisme de formation ; durée : environ 6 mois ; début souhaité : prochaine session ; disponible à temps plein' },
  { metier: 'Plombier', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans' },
  { metier: 'Ouvrier paysagiste', k: 'spontanee', details: 'type de structure : collectivité ou entreprise privée ; secteur : espaces verts ; contrat : CDI' },
  { metier: 'Poseur de revêtements muraux', k: 'alternance', details: 'type de structure : entreprise privée ; secteur : bâtiment ; durée : 2 ans' },
  { metier: 'Agent de propreté', k: 'spontanee', details: 'type de structure : entreprise privée ou collectivité ; secteur : propreté et entretien ; contrat : CDI ; temps plein' },
  { metier: 'Agent de service en collectivité', k: 'spontanee', details: 'type de structure : collectivité ; secteur : services en collectivité ; contrat : CDI' },
  { metier: 'Agent logistique', k: 'spontanee', details: 'type de structure : entreprise privée ; secteur : logistique ; contrat : CDI ; temps plein ; disponible immédiatement ; mobilité dans un rayon de 40 km' },
  { metier: 'Gardien d’immeuble', k: 'offre', details: 'type de structure : entreprise privée ; secteur : immobilier ; contrat : CDI ; disponible dans un mois', employeur: 'Résidences des Tilleuls (entreprise fictive pour l’essai)', recruteur: 'Madame Claire Martin', poste: 'Gardien d’immeuble (H/F)', offre: 'Poste en CDI dans une résidence de 90 logements. Missions : entretien des parties communes, petits dépannages, relation avec les locataires, suivi des interventions des entreprises extérieures. Profil attendu : sens du contact, autonomie, notions de plomberie et d’électricité, rigueur dans le suivi.' }
];

/* ---------- Génération des textes à coller ---------- */
function lire(f) { return fs.readFileSync(path.join(RACINE, f), 'utf8').replace(/\r\n/g, '\n'); }
function voix() { return lire('prompts/_voix-humaine.md').trim(); }
const FORME_F = { 'Électricien d’entretien': 'Électricienne d’entretien', 'Plombier': 'Plombière', 'Ouvrier paysagiste': 'Ouvrière paysagiste', 'Poseur de revêtements muraux': 'Poseuse de revêtements muraux', 'Gardien d’immeuble': 'Gardienne d’immeuble' };
function nomMetier(m, g) { return g === 'f' ? (FORME_F[m.metier] || m.metier) : m.metier; }
function blocMetiers(liste, g) {
  return liste.map((m, i) => (i + 1) + '. Métier : ' + nomMetier(m, g) + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Ligne directrice de cet objectif : ' + LIGNES[m.k] + '\n   Détails : ' + m.details).join('\n\n');
}
// Les accroches retenues (première de chaque métier, essai des accroches V3 au féminin du 2026-10-08) : les lettres partent de ce que l'application aurait réellement.
const ACCROCHES_F = {
  'Agent d’entretien des bâtiments': 'Agent d’entretien des bâtiments, autonome et ponctuel, avec dix ans d’expérience en résidences collectives et en collectivité.',
  'Peintre en bâtiment': 'CAP Peintre applicateur de revêtements et expérience en peinture intérieure, avec préparation des supports, revêtements muraux et finitions.',
  'Électricien d’entretien': 'Habilitation électrique BS et expérience des dépannages en électricité de base en résidence, pour préparer une formation en électricité du bâtiment.',
  'Plombier': 'Pratique des dépannages en plomberie en résidence, sur 120 logements, avec expérience de l’entretien courant et de la remise en état.',
  'Ouvrier paysagiste': 'Expérience des espaces verts dans les services techniques d’une commune, avec entretien des extérieurs et travaux réalisés sur les bâtiments communaux.',
  'Poseur de revêtements muraux': 'CAP Peintre applicateur de revêtements et pratique des revêtements muraux, de la préparation des supports et des finitions.',
  'Agent de propreté': 'Expérience de l’entretien de parties communes et de 120 logements en résidence, avec remise en état des logements libérés.',
  'Agent de service en collectivité': 'Expérience d’agent polyvalent des services techniques d’une commune, sur les bâtiments communaux, les espaces verts et les petits travaux.',
  'Agent logistique': 'Expérience de la gestion d’un stock de produits en résidence, complétée par la mise en rayon et le réassort en libre-service.',
  'Gardien d’immeuble': 'Expérience de 2019 à 2024 dans une résidence de 120 logements, avec entretien des parties communes, dépannages et relation avec les locataires.'
};
function blocCvLettres(liste, g) {
  return liste.map((m, i) => (i + 1) + '. Titre du CV : ' + nomMetier(m, g || 'f') + '\n   Accroche retenue : ' + (ACCROCHES_F[m.metier] || m.accroche || '') + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Ligne directrice de cet objectif : ' + LIGNES[m.k] + '\n   Détails : ' + m.details + (m.employeur ? '\n   Employeur : ' + m.employeur : '') + (m.recruteur ? '\n   Recruteur : ' + m.recruteur : '') + (m.poste ? '\n   Poste visé : ' + m.poste : '') + (m.offre ? '\n   Extrait de l’offre : ' + m.offre : '')).join('\n\n');
}
function genreTexte(g) { return g === 'f' ? 'Féminin : la personne est une femme. Accorde tous les adjectifs et participes au féminin (habituée, motivée...).' : (g === 'm' ? 'Masculin : la personne est un homme. Accorde tous les adjectifs et participes au masculin (habitué, motivé...).' : 'Non précisé : n’emploie aucun mot qui s’accorde au masculin ou au féminin ; tourne les phrases avec des noms.'); }
function demandeOffres(liste, dept) {
  const nomObj = { spontanee: 'candidature spontanée', offre: 'emploi', reconversion: 'emploi dans un nouveau métier', stage: 'stage de formation', pmsmp: 'stage d’immersion (PMSMP)', alternance: 'alternance', formation: 'entrée en formation' };
  const lignes = liste.map((m, i) => (i + 1) + '. ' + m.metier + ' : ' + nomObj[m.k]).join('\n');
  const texte = lire('prompts/ucpm-offres.md').replace(/<!--[\s\S]*?-->\s*/, '');
  return texte.replace('{DATE}', '8 octobre 2026').replace('{DEPARTEMENT}', dept).replace('{METIERS}', lignes).trim() + '\n';
}
/* ---------- Passages 7 et 8 (2026-10-15) : lettres retravaillées et préparation d'entretien ---------- */
// Lettres d'essai (comme l'application les montrerait : sans signature, la personne en a modifié une à la main).
const P = (...paragraphes) => paragraphes.join('\n\n');
const LETTRES_ESSAI = {
  'Agent d’entretien des bâtiments': P(
    'Madame, Monsieur,',
    'Depuis dix ans, j’entretiens des bâtiments collectifs : une résidence de 120 logements, puis les services techniques d’une commune. Je vous écris sans attendre une offre, parce que votre structure gère des bâtiments où ce travail se fait au quotidien, et que je connais ce que cela demande.',
    'Dans ma dernière résidence, je réglais les petits dépannages en plomberie et en électricité de base, je peignais les cages d’escalier et je remettais en état les logements libérés. Je tenais aussi le stock de produits et je parlais chaque jour avec les locataires, pour comprendre ce qui devait être réparé en priorité.',
    'Avant cela, dans les services techniques d’une commune, j’ai entretenu les bâtiments communaux et les espaces verts, fait de petits travaux de maçonnerie et de menuiserie, monté des barnums et déneigé en hiver.',
    'Je cherche un CDI à temps plein, en entreprise privée ou en collectivité, où je peux continuer ce travail d’entretien et de maintenance. Je serais heureux d’en parler avec vous.',
    'Cordialement.'),
  'Peintre en bâtiment': P(
    'Madame, Monsieur,',
    'Le CAP Peintre applicateur de revêtements que j’ai passé en 2014 m’a appris la préparation des supports, la peinture intérieure, les revêtements muraux et les finitions. J’ai ensuite travaillé deux ans comme aide-peintre, puis peint des cages d’escalier et remis en état des logements dans une résidence de 120 logements.',
    'Aujourd’hui, je veux apprendre ce métier plus loin, en alternance sur deux ans, dans une entreprise du bâtiment. Chez Lacroix Peinture, je pourrais appliquer ce que je sais déjà et apprendre les techniques que je n’ai pas encore pratiquées, directement sur les chantiers.',
    'Dans la résidence, je préparais les murs des logements libérés : rebouchage, ponçage, sous-couche, puis deux couches de peinture. Je choisissais les quantités de produit à commander et je rangeais le matériel en fin de journée. C’est ce travail de finition que je veux faire en entreprise, avec un maître d’apprentissage qui me montre les gestes que je ne connais pas encore.',
    'Je suis disponible à partir de septembre prochain, à temps plein en entreprise, sur des horaires de journée.',
    'Je vous remercie de l’attention que vous porterez à ma candidature.',
    'Cordialement.'),
  'Gardien d’immeuble': P(
    'Madame Martin,',
    'Votre résidence de 90 logements cherche un gardien. Pendant cinq ans, de 2019 à 2024, j’ai tenu une résidence de 120 logements : parties communes, petits dépannages, remise en état des logements libérés et relation avec les locataires.',
    'Je sais faire un petit dépannage en plomberie ou en électricité de base, et noter ce qui doit être suivi. J’ai aussi l’habitude de suivre le travail des entreprises extérieures et de rendre compte de ce qui a été fait, ce que demande votre annonce.',
    'Chaque matin, je faisais le tour des parties communes : escaliers, caves, locaux poubelles, éclairage. Je notais ce qui devait être réparé et je prévenais le bureau de la résidence. Quand un locataire me signalait une fuite ou une panne, je me rendais sur place, je regardais ce que je pouvais régler moi-même et je transmettais le reste à l’entreprise concernée.',
    'Je cherche un CDI dans une résidence comme la vôtre, où je peux continuer ce travail de proximité. Je suis disponible dans un mois.',
    'Cordialement.')
};
const REMARQUES_ESSAI = {
  'Agent d’entretien des bâtiments': 'Parler de mon bénévolat à la banque alimentaire. Faire un peu plus chaleureux. Raccourcir le premier paragraphe.',
  'Gardien d’immeuble': ''
};
function blocLettresRetravail(liste) {
  return liste.map((m, i) => (i + 1) + '. Titre du CV : ' + nomMetier(m, 'f') + '\n   Accroche retenue : ' + (ACCROCHES_F[m.metier] || '') + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Ligne directrice de cet objectif : ' + LIGNES[m.k] + '\n   Détails : ' + m.details + (m.employeur ? '\n   Employeur : ' + m.employeur : '') + (m.recruteur ? '\n   Recruteur : ' + m.recruteur : '') + (m.poste ? '\n   Poste visé : ' + m.poste : '') + (m.offre ? '\n   Extrait de l’offre : ' + m.offre : '') +
    '\n   Lettre actuelle (texte de la personne, à retravailler) :\n"""\n' + (LETTRES_ESSAI[m.metier] || '') + '\n"""\n   Ce que la personne veut changer ou ajouter : ' + (REMARQUES_ESSAI[m.metier] || 'aucune remarque')).join('\n\n');
}
function blocMetiersPreparation(liste, periodes) {
  return liste.map((m, i) => (i + 1) + '. Métier : ' + nomMetier(m, 'f') + '\n   Titre du CV : ' + nomMetier(m, 'f') + '\n   Accroche retenue : ' + (ACCROCHES_F[m.metier] || '') + '\n   Objectif : ' + NOM_OBJECTIF[m.k] + '\n   Détails : ' + m.details + (m.employeur ? '\n   Employeur : ' + m.employeur : '') + (m.poste ? '\n   Poste visé : ' + m.poste : '') + (m.offre ? '\n   Extrait de l’offre : ' + m.offre : '') +
    '\n   Changement de métier par rapport au CV de référence : ' + (m.metier === METIERS[0].metier ? 'non (même métier que le CV de référence)' : 'oui (un autre métier que celui du CV de référence)') +
    '\n   Périodes sans activité repérées par l’application : ' + (periodes || 'aucune') +
    '\n   Lettre actuelle (sans signature) :\n"""\n' + (LETTRES_ESSAI[m.metier] || 'non écrite') + '\n"""').join('\n\n');
}
const REGLAGES_GENERAL = 'Mode : général (plusieurs métiers, version courte)\nNiveau d’exigence : Réaliste\nNombre de questions par métier : 5 à 6\nSujets : le parcours ; les points délicats ; pourquoi ce métier ou ce changement\nPistes de réponse : oui, courtes';
const REGLAGES_APPROFONDI = 'Mode : approfondi (un seul métier)\nNiveau d’exigence : Exigeant\nNombre de questions par métier : 10\nSujets : le parcours ; les points délicats (périodes sans activité, ruptures) ; pourquoi cette entreprise ou cette structure ; pourquoi ce changement de métier ou de secteur ; les compétences, avec des exemples ; les mises en situation\nPistes de réponse : oui';
function genererRetravailEtPreparation(ecrire, voix) {
  const pr = lire('prompts/ucpm-lettres-retravail.md').replace('{{VOIX_HUMAINE}}', voix());
  const pp = lire('prompts/ucpm-preparation.md').replace('{{VOIX_HUMAINE}}', voix());
  const trois = [METIERS[0], METIERS[1], METIERS[9]];
  ecrire('05_retravail_V1_3.txt', pr.replace('{GENRE}', genreTexte('f')).replace('{PROFIL}', PROFIL_VALIDE).replace('{LETTRES}', blocLettresRetravail(trois)));
  ecrire('06_preparation_V1_general_3.txt', pp.replace('{GENRE}', genreTexte('f')).replace('{REGLAGES}', REGLAGES_GENERAL).replace('{PROFIL}', PROFIL_VALIDE).replace('{METIERS}', blocMetiersPreparation(trois, 'depuis 2024 (environ un an et demi) : aucune expérience indiquée sur le CV')));
  ecrire('06_preparation_V1_approfondi_1.txt', pp.replace('{GENRE}', genreTexte('f')).replace('{REGLAGES}', REGLAGES_APPROFONDI).replace('{PROFIL}', PROFIL_VALIDE).replace('{METIERS}', blocMetiersPreparation([METIERS[9]], 'depuis 2024 (environ un an et demi) : aucune expérience indiquée sur le CV')));
}
function generer() {
  const dossier = path.join(RACINE, 'docs', 'essais_prompts_ucpm');
  fs.mkdirSync(dossier, { recursive: true });
  const ecrire = (nom, texte) => { fs.writeFileSync(path.join(dossier, nom), texte, 'utf8'); console.log('écrit : docs/essais_prompts_ucpm/' + nom + ' (' + texte.length + ' signes)'); };
  const pm = lire('prompts/ucpm-metiers.md'), pa = lire('prompts/ucpm-accroches.md').replace('{{VOIX_HUMAINE}}', voix()), pl = lire('prompts/ucpm-lettres.md').replace('{{VOIX_HUMAINE}}', voix());
  const blocObjectifs = OBJECTIFS_PREMIER.map((o, i) => (i + 1) + '. ' + NOM_OBJECTIF[o.k] + '\n   Ligne directrice : ' + LIGNES[o.k] + '\n   Détails : ' + o.details).join('\n\n');
  ecrire('01_metiers_V5.txt', pm.replace('{INTITULE}', 'Agent d’entretien des bâtiments').replace('{OBJECTIFS}', blocObjectifs).replace('{CV}', CV_TEST));
  const autres = METIERS.slice(1);
  [['02_accroches_V3_9_feminin.txt', autres, 'f'], ['02_accroches_V3_9_masculin.txt', autres, 'm'], ['02_accroches_V3_9_neutre.txt', autres, 'n']].forEach(([nom, liste, g]) => {
    ecrire(nom, pa.replace('{GENRE}', genreTexte(g)).replace('{PROFIL}', PROFIL_VALIDE).replace('{METIERS}', blocMetiers(liste, g)));
  });
  [[3, '03_lettres_V6_3.txt'], [5, '03_lettres_V6_5.txt'], [10, '03_lettres_V6_10.txt']].forEach(([n, nom]) => {
    ecrire(nom, pl.replace('{GENRE}', genreTexte('f')).replace('{PROFIL}', PROFIL_VALIDE).replace('{CVS}', blocCvLettres(METIERS.slice(0, n))));
  });
  ecrire('03_lettres_V6_10_masculin.txt', pl.replace('{GENRE}', genreTexte('m')).replace('{PROFIL}', PROFIL_VALIDE).replace('{CVS}', blocCvLettres(METIERS.slice(0, 10), 'm')));
  genererRetravailEtPreparation(ecrire, voix);
  ecrire('04_offres_V4_2.txt', demandeOffres(METIERS.slice(2, 4), 'Haute-Vienne (87)'));
  ecrire('04_offres_V4_6.txt', demandeOffres(METIERS.slice(0, 6), 'Haute-Vienne (87)'));
}

/* ---------- Vérification d'une réponse ---------- */
const INTERDITES = ['passionné', 'fort de', 'forte de', 'riche de', 'dynamique et motivé', 'véritable atout', 'riche expérience', 'au sein de', 'force de proposition', 'n’hésitez pas', 'n\'hésitez pas', 'exceptionnel', 'incontournable', 'remarquable', 'métier d’avenir'];
const PIEGES = ['BTS', 'licence', 'master', 'ingénieur', 'CACES', 'bac pro', 'DUT', 'H0V', 'permis poids lourd', 'permis C1', 'brevet pro', 'DEUST', 'titre professionnel'];
const MOTS_OBJECTIF = { offre: /offre|annonce|poste/i, spontanee: /spontan|sans offre|sans attendre|sans annonce|candidature|initiative|d’offre|d'offre|absence d|aucune offre|offre publiée|offre soit|poste soit publié|publication d/i, reconversion: /transf|nouveau métier|reconversion|changer|changement|autres métiers|acquis/i, stage: /stage/i, pmsmp: /immersion|découvr/i, alternance: /alternance|apprentissage/i, formation: /formation/i };
function mots(s) { return String(s || '').toLowerCase().replace(/[^a-zàâäçéèêëîïôöùûüœ0-9’' -]/g, ' ').split(/\s+/).filter(Boolean); }
function jaccard(a, b) { const A = new Set(a), B = new Set(b); let i = 0; A.forEach(x => { if (B.has(x)) { i++; } }); return i / ((A.size + B.size - i) || 1); }
// La lecture de la réponse est celle de l'application (une seule source : modules/un-cv-plusieurs-metiers/logique.js).
const LOGIQUE_UCPM = require('../modules/un-cv-plusieurs-metiers/logique.js');
function extraireJson(texte) {
  const r = LOGIQUE_UCPM.ucpmExtraireJson(texte);
  if (!r.erreur) { return r; }
  return { erreur: r.erreur + (r.coupe ? ' : probablement COUPÉE avant la fin. Fin reçue : « ' + String(texte).trim().slice(-120).replace(/\n/g, ' ') + ' »' : '') };
}
function verifier(type, fichier, attendu, genre) {
  const sortie = []; let alertes = 0;
  const ok = m => sortie.push('OK        : ' + m), att = m => { alertes++; sortie.push('ATTENTION : ' + m); };
  const brut = fs.readFileSync(fichier, 'utf8');
  const r = extraireJson(brut);
  if (r.erreur) { att(r.erreur); console.log(sortie.join('\n')); console.log('\nRésultat : ' + alertes + ' point(s) à voir.'); return; }
  ok('JSON valide');
  if (r.echappes) { att('la réponse contient ' + r.echappes + ' caractère(s) d’échappement Markdown (barre oblique inverse avant un crochet) venant de la copie : l’application devra les retirer avant de lire le JSON'); }
  if (/[–—]/.test(brut)) { att('la réponse contient un tiret long (interdit)'); } else { ok('aucun tiret long'); }
  if (/\bIA\b/.test(brut)) { att('le mot « IA » apparaît dans la réponse'); }
  const bas = brut.toLowerCase();
  const trouvees = INTERDITES.filter(f => bas.includes(f.toLowerCase()));
  if (trouvees.length) { att('formules d’assistant repérées : ' + trouvees.join(', ')); } else { ok('aucune formule d’assistant de la liste'); }
  const cvBas = CV_TEST.toLowerCase();
  const texteSansVerif = type === 'metiers' ? JSON.stringify({ s: r.json.synthese, m: r.json.intitulesMemeMetier, a: (r.json.autresMetiers || []).map(x => x.retrouveDansLeCV) }) : brut;
  const motEntier = (texte, mot) => new RegExp('(^|[^a-zàâäçéèêëîïôöùûüœ])' + mot.toLowerCase() + '($|[^a-zàâäçéèêëîïôöùûüœ])').test(texte.toLowerCase());
  const inventes = PIEGES.filter(p => motEntier(texteSansVerif, p) && !motEntier(CV_TEST, p));
  if (inventes.length) { att('mots absents du CV mais présents dans la réponse (invention possible, à relire) : ' + inventes.join(', ')); } else { ok('aucun diplôme ou titre « piège » ajouté'); }
  if (type === 'metiers') {
    const j = r.json, s = j.synthese || {};
    // Le sexe n'est pas connu à ce stade : chaque intitulé doit exister sous ses deux formes (champs ...Masculin et ...Feminin).
    const sansDeuxFormes = []; const identiques = [];
    (j.autresMetiers || []).forEach(x => { if (!x.metierMasculin || !x.metierFeminin) { sansDeuxFormes.push(x.metier || x.metierMasculin || '?'); } else if (x.metierMasculin === x.metierFeminin && /(ien|ier|eur|teur|gnon)$/i.test(x.metierMasculin.split(' ')[0])) { identiques.push(x.metierMasculin); } x.metier = x.metier || x.metierMasculin; });
    (j.intitulesMemeMetier || []).forEach(x => { if (!x.intituleMasculin || !x.intituleFeminin) { sansDeuxFormes.push(x.intitule || x.intituleMasculin || '?'); } else if (x.intituleMasculin === x.intituleFeminin && /(ien|ier|eur|teur|gnon)$/i.test(x.intituleMasculin.split(' ')[0])) { identiques.push(x.intituleMasculin); } x.intitule = x.intitule || x.intituleMasculin; });
    if (sansDeuxFormes.length) { att('intitulés sans les deux formes (masculin et féminin) : ' + sansDeuxFormes.join(', ')); } else { ok('tous les intitulés ont leurs deux formes, masculine et féminine'); }
    if (identiques.length) { att('forme féminine identique à la masculine, probablement fausse : ' + identiques.join(', ')); }
    s.metier ? ok('métier du CV : ' + s.metier) : att('synthèse sans métier');
    const nc = (s.competencesCles || []).length; (nc >= 4 && nc <= 8) ? ok(nc + ' compétences clés') : att(nc + ' compétences clés (4 à 8 attendues)');
    const ne = (s.experiences || []).length; (ne >= 4 && ne <= 5) ? ok(ne + ' expériences retrouvées') : att(ne + ' expériences (4 attendues pour ce CV, 5 avec le bénévolat)');
    const im = (j.intitulesMemeMetier || []).length; (im >= 3 && im <= 6) ? ok(im + ' autres intitulés du même métier') : att(im + ' autres intitulés du même métier (3 à 6 attendus)');
    const am = j.autresMetiers || []; (am.length >= 5 && am.length <= 10) ? ok(am.length + ' autres métiers') : att(am.length + ' autres métiers (5 à 10 attendus)');
    am.forEach(x => { const n = (x.retrouveDansLeCV || []).length; if (n < 1 || n > 2) { att('« ' + x.metier + ' » : ' + n + ' élément(s) du CV cité(s) (1 ou 2 attendus)'); } });
    const dernier = am.map(x => (x.retrouveDansLeCV || []).join('|')); if (new Set(dernier).size < dernier.length) { att('des métiers citent exactement les mêmes éléments du CV'); }
    const regl = am.filter(x => /pharmac|infirmi|médecin|avocat|conducteur|grutier/i.test(x.metier)); if (regl.length) { att('métier réglementé proposé : ' + regl.map(x => x.metier).join(', ')); } else { ok('aucun métier réglementé proposé'); }
    const av = am.filter(x => x.aVerifier).map(x => x.metier + ' (' + x.aVerifier + ')'); sortie.push('INFO      : métiers marqués « À vérifier » : ' + (av.join(' ; ') || 'aucun') + '  (à confirmer : « électricien » devrait l’être)');
    const dup = (j.intitulesMemeMetier || []).filter(x => am.some(y => mots(y.metier).join(' ') === mots(x.intitule).join(' '))); if (dup.length) { att('un même intitulé apparaît dans les deux colonnes'); }
  } else {
    const liste = Array.isArray(r.json) ? r.json : [];
    if (attendu) { liste.length === attendu ? ok(attendu + ' éléments rendus, comme demandé') : att(liste.length + ' élément(s) rendu(s) au lieu de ' + attendu); }
    liste.forEach((x, i) => { if (x.id !== i + 1) { att('l’élément ' + (i + 1) + ' porte l’id ' + x.id); } });
    if (type === 'accroches') {
      liste.forEach(x => {
        const a = x.accroches || []; if (a.length !== 2) { att('« ' + x.metier + ' » : ' + a.length + ' accroche(s) au lieu de 2'); }
        a.forEach((t, i) => { const n = mots(t).length; if (n < 15 || n > 28) { att('« ' + x.metier + ' » accroche ' + (i + 1) + ' : ' + n + ' mots (15 à 28 attendus)'); } if (/\bje\b|\bj’|\bj'/i.test(t)) { att('« ' + x.metier + ' » accroche ' + (i + 1) + ' : emploie « je » (style CV attendu, sans « je »)'); } });
        if (a.length === 2 && jaccard(mots(a[0]), mots(a[1])) > 0.6) { att('« ' + x.metier + ' » : ses deux accroches sont presque identiques'); }
      });
      for (let i = 0; i < liste.length; i++) { for (let k = i + 1; k < liste.length; k++) { const s1 = jaccard(mots((liste[i].accroches || [])[0]), mots((liste[k].accroches || [])[0])); if (s1 > 0.6) { att('« ' + liste[i].metier + ' » et « ' + liste[k].metier + ' » ont des accroches presque identiques'); } } }
    }
    if (type === 'accroches' || type === 'lettres' || type === 'retravail') {
      // Expressions qui reviennent trop souvent d'un texte à l'autre (suites de 4 mots répétées dans au moins 4 textes).
      const textes = liste.map(x => type === 'accroches' ? (x.accroches || []) : [String(x.lettre || '')]).reduce((a, b) => a.concat(b), []);
      const compte = {};
      textes.forEach(t => { const w = mots(t), vus = new Set(); for (let i = 0; i + 4 <= w.length; i++) { const k = w.slice(i, i + 4).join(' '); if (!vus.has(k)) { vus.add(k); compte[k] = (compte[k] || 0) + 1; } } });
      const seuil = type === 'accroches' ? 4 : 3;
      const repetees = Object.keys(compte).filter(k => compte[k] >= seuil).sort((a, b) => compte[b] - compte[a]).slice(0, 4);
      if (repetees.length) { att('expressions répétées dans plusieurs textes : ' + repetees.map(k => '« ' + k + ' » (' + compte[k] + ' fois)').join(' ; ')); } else { ok('pas d’expression répétée d’un texte à l’autre'); }
      const debuts = {}; textes.forEach(t => { const d = mots(type === 'lettres' || type === 'retravail' ? t.replace(/^\s*(Madame|Monsieur)[^\n]*\n+/i, '') : t).slice(0, 1).join(' '); debuts[d] = (debuts[d] || 0) + 1; });
      const frequent = Object.keys(debuts).filter(d => debuts[d] >= Math.max(3, Math.ceil(textes.length / 4))).map(d => '« ' + d + ' » (' + debuts[d] + ' fois sur ' + textes.length + ')');
      if (frequent.length) { att('débuts de phrase qui se répètent : ' + frequent.join(' ; ')); }
      const g = genre || 'n', avant = alertes;
      const MASC = ['habitué', 'expérimenté', 'motivé', 'qualifié', 'formé', 'diplômé', 'attentif', 'rigoureux', 'sérieux', 'impliqué', 'investi', 'ponctuel', 'prêt', 'convaincu', 'heureux', 'ravi', 'content', 'reconnaissant', 'curieux'];
      const FEM = ['habituée', 'expérimentée', 'motivée', 'qualifiée', 'formée', 'diplômée', 'attentive', 'rigoureuse', 'sérieuse', 'impliquée', 'investie', 'ponctuelle', 'prête', 'convaincue', 'heureuse', 'ravie', 'contente', 'reconnaissante', 'curieuse'];
      const lettres = 'a-zàâäçéèêëîïôöùûüœ';
      liste.forEach(x => {
        const bas = (type === 'accroches' ? (x.accroches || []).join(' ') : String(x.lettre || '')).toLowerCase();
        const trouve = mot => { let i = bas.indexOf(mot); while (i >= 0) { const av = i === 0 ? ' ' : bas[i - 1], ap = bas[i + mot.length] || ' '; if (!/[a-zàâäçéèêëîïôöùûüœ]/.test(av) && !/[a-zàâäçéèêëîïôöùûüœ]/.test(ap) && bas.slice(i + mot.length, i + mot.length + 2) !== '(e') { return true; } i = bas.indexOf(mot, i + 1); } return false; };
        const m = MASC.filter(trouve), f = FEM.filter(trouve);
        if (g === 'f' && m.length) { att('« ' + x.metier + ' » : forme masculine alors que la personne est une femme : ' + m.join(', ')); }
        if (g === 'm' && f.length) { att('« ' + x.metier + ' » : forme féminine alors que la personne est un homme : ' + f.join(', ')); }
        if (g === 'n' && (m.length || f.length)) { att('« ' + x.metier + ' » : forme accordée (' + m.concat(f).join(', ') + ') alors que le sexe n’est pas précisé : formulation neutre attendue'); }
      });
      if (alertes === avant) { ok('accords conformes au sexe indiqué (' + ({ f: 'féminin', m: 'masculin', n: 'non précisé' })[g] + ')'); }
    }
    if (type === 'lettres') {
      const ordre = METIERS.map(m => m.k);
      liste.forEach((x, i) => {
        const t = String(x.lettre || ''), n = mots(t).length;
        if (n < 140 || n > 270) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ' + n + ' mots (140 à 270 attendus selon l’objectif)'); }
        const att_ = METIERS[i] || {};
        if (att_.recruteur) { const nomR = att_.recruteur.split(' ').slice(-1)[0]; if (!new RegExp('^\\s*(Madame|Monsieur) ' + nomR, 'i').test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : le recruteur est nommé (' + att_.recruteur + ') : la lettre doit commencer par « ' + att_.recruteur.split(' ')[0] + ' ' + nomR + ', »'); } }
        else if (!/^\s*Madame, Monsieur/i.test(t)) { att('lettre ' + (i + 1) + ' : ne commence pas par « Madame, Monsieur, »'); }
        if (att_.employeur) { const nomE = att_.employeur.split(' (')[0]; if (t.indexOf(nomE) < 0) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : l’employeur « ' + nomE + ' » n’est pas cité'); } }
        if (att_.offre && !/offre|annonce|poste (de|proposé|publié)/i.test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : une offre est fournie mais la lettre n’en parle pas'); }
        if (/[\[\]]/.test(t)) { att('lettre ' + (i + 1) + ' : contient des crochets (texte à compléter)'); }
        const k = ordre[i]; if (k && !MOTS_OBJECTIF[k].test(t)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ne semble pas parler de son objectif (' + NOM_OBJECTIF[k] + ')'); }
        if ((t.match(/\n\n/g) || []).length < 2) { att('lettre ' + (i + 1) + ' : moins de 3 paragraphes'); }
        const corps = t.replace(/^\s*Madame, Monsieur,?\s*/i, '');
        if (/^(je|j’|j')/i.test(corps)) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : commence par « je » (interdit : VOUS d’abord)'); }
        const phrases = corps.split(/[.!?]\s+/).filter(z => z.trim().length > 10), enJe = phrases.filter(z => /^(je|j’|j')/i.test(z.trim())).length;
        if (phrases.length && enJe / phrases.length > 0.5) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ' + enJe + ' phrases sur ' + phrases.length + ' commencent par « je »'); }
      });
      const ouvertures = liste.map(x => mots(String(x.lettre || '').replace(/^\s*Madame, Monsieur,?/i, '')).slice(0, 8).join(' '));
      if (new Set(ouvertures).size < ouvertures.length) { att('des lettres ont la même ouverture'); } else if (liste.length) { ok('ouvertures toutes différentes'); }
      let max = 0, paire = '';
      for (let i = 0; i < liste.length; i++) { for (let k = i + 1; k < liste.length; k++) { const s2 = jaccard(mots(liste[i].lettre), mots(liste[k].lettre)); if (s2 > max) { max = s2; paire = (i + 1) + ' et ' + (k + 1); } } }
      if (liste.length > 1) { max > 0.55 ? att('lettres ' + paire + ' très proches (ressemblance ' + Math.round(max * 100) + ' %)') : ok('lettres bien distinctes (ressemblance maximale ' + Math.round(max * 100) + ' %)'); }
      const longueurs = liste.map(x => mots(x.lettre).length); if (longueurs.length > 2) { sortie.push('INFO      : longueur des lettres, dans l’ordre : ' + longueurs.join(', ') + ' mots (si elles raccourcissent vers la fin, l’assistant s’essouffle)'); }
    }
    if (type === 'retravail') {
      // Passage 7 : les lettres retravaillées (essai 05_retravail_V1_3.txt : lettres 1 et 2 de l'essai + la 10e, la première avec des remarques).
      const cibles = [METIERS[0], METIERS[1], METIERS[9]];
      const interdits = ['je me permets', 'prête à m’engager', 'prêt à m’engager', 'heureuse de pouvoir', 'heureux de pouvoir', 'contente de pouvoir', 'content de pouvoir', 'ravie que', 'ravi que', 'ravie de', 'ravi de', 'contente de', 'content de', 'utile au quotidien', 'sur la durée'];
      const fins = [];
      liste.forEach((x, i) => {
        const t = String(x.lettre || ''), n = mots(t).length, bas2 = t.toLowerCase();
        if (n > 300) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : ' + n + ' mots (300 au plus, une page A4)'); }
        if (!/^\s*(Madame|Monsieur)/i.test(t)) { att('lettre ' + (i + 1) + ' : ne commence pas par une formule d’appel'); }
        if (/camille/i.test(t)) { att('lettre ' + (i + 1) + ' : contient le nom de la personne (la signature est ajoutée par l’application)'); }
        const trouves = interdits.filter(f => bas2.includes(f)); if (trouves.length) { att('lettre ' + (i + 1) + ' : formules ou engagements ajoutés : ' + trouves.join(', ')); }
        if ((t.match(/\n\n/g) || []).length < 2) { att('lettre ' + (i + 1) + ' : moins de 3 paragraphes'); }
        const original = mots(LETTRES_ESSAI[(cibles[i] || {}).metier] || '').length;
        if (original && !(REMARQUES_ESSAI[(cibles[i] || {}).metier]) && Math.abs(n - original) / original > 0.3) { att('lettre ' + (i + 1) + ' (' + x.metier + ') : sans remarque, elle passe de ' + original + ' à ' + n + ' mots (20 % attendus, 30 % tolérés)'); }
        const paras = t.trim().split(/\n\n/); let fin = paras.pop().trim(); if (mots(fin).length <= 4 && paras.length) { fin = paras.pop().trim(); } fins.push(fin.toLowerCase());
      });
      if (liste[0] && !/bénévol|banque alimentaire/i.test(String(liste[0].lettre))) { att('lettre 1 : la remarque « parler de mon bénévolat » n’est pas suivie'); } else if (liste[0]) { ok('lettre 1 : le bénévolat de la remarque est repris'); }
      if (new Set(fins).size < fins.length) { att('deux lettres se terminent par la même formule : ' + fins.join(' | ')); } else if (fins.length) { ok('formules de fin toutes différentes'); }
      const l1 = liste[0] ? mots(liste[0].lettre).length : 0, o1 = mots(LETTRES_ESSAI[METIERS[0].metier]).length;
      sortie.push('INFO      : lettre 1 (remarque « raccourcir le premier paragraphe », « plus chaleureux ») : ' + o1 + ' mots avant, ' + l1 + ' après ; à RELIRE : le ton est-il plus chaleureux sans formule d’assistant ?');
    }
    if (type === 'preparation-general' || type === 'preparation-approfondi') {
      // Passage 8 : préparations d'entretien. Arguments : <type> <fichier> <nombre de métiers> <f|m|n> [niveau] [nombre de questions].
      const general = type === 'preparation-general';
      const niveau = process.argv[7] || (general ? 'realiste' : 'exigeant'), nbQ = parseInt(process.argv[8], 10) || (general ? 5 : 10);
      const sujetsOk = ['parcours', 'motivation', 'delicat', 'entreprise', 'changement', 'competences', 'situation', 'qualites', 'pratique'], delicats = ['delicat', 'entreprise', 'changement', 'qualites'];
      const relanceAttendue = /exigeant/.test(niveau);
      const lim = { question: 18, attente: 12, piste: 25, relance: 10, atout: 15 }, tol = 3;
      const sensibles = /\b(santé|handicap|enfants?|famille|âge|enceinte|grossesse|religion|origines?|marié|célibataire)\b/i;
      liste.forEach((x, i) => {
        const nom = '« ' + (x.metier || ('métier ' + (i + 1))) + ' »', qs = Array.isArray(x.questions) ? x.questions : [];
        (general ? qs.length === 5 : qs.length === nbQ) ? ok(nom + ' : ' + qs.length + ' questions') : att(nom + ' : ' + qs.length + ' questions au lieu de ' + (general ? 5 : nbQ));
        let nbDelicat = 0, mots_ = 0;
        qs.forEach((q, k) => {
          const rep_ = nom + ' question ' + (k + 1);
          if (sujetsOk.indexOf(q.sujet) < 0) { att(rep_ + ' : sujet « ' + q.sujet + ' » inconnu'); }
          const attendu_ = delicats.indexOf(q.sujet) >= 0; if (attendu_ !== !!q.delicate) { att(rep_ + ' : delicate=' + q.delicate + ' alors que le sujet « ' + q.sujet + ' » demande ' + attendu_); }
          if (q.delicate) { nbDelicat++; }
          [['question', lim.question], ['attente', lim.attente], ['piste', lim.piste], ['relance', lim.relance]].forEach(([champ, max]) => { const n = mots(q[champ] || '').length; mots_ += n; if (n > max + tol) { att(rep_ + ' : ' + champ + ' de ' + n + ' mots (' + max + ' au plus, ' + tol + ' tolérés)'); } });
          if (!q.attente) { att(rep_ + ' : pas de « ce que le recruteur cherche »'); }
          if (!q.piste && !(!general && process.argv[9] === 'sans-pistes')) { att(rep_ + ' : pas de piste de réponse'); }
          if (relanceAttendue && !q.relance) { att(rep_ + ' : pas de relance alors que le niveau est « ' + niveau + ' »'); }
          if (!relanceAttendue && q.relance) { att(rep_ + ' : une relance alors que le niveau est « ' + niveau + ' »'); }
          if (sensibles.test(q.question)) { att(rep_ + ' : question sur un sujet que le recruteur n’a pas le droit d’aborder : ' + q.question); }
        });
        const am = Array.isArray(x.aMettreEnAvant) ? x.aMettreEnAvant : [];
        am.length === 3 ? ok(nom + ' : 3 atouts à mettre en avant') : att(nom + ' : ' + am.length + ' atouts au lieu de 3');
        am.forEach((a, k) => { const n = mots(a).length; mots_ += n; if (n > lim.atout + tol) { att(nom + ' atout ' + (k + 1) + ' : ' + n + ' mots (' + lim.atout + ' au plus)'); } });
        if (!qs.some(q => q.sujet === 'delicat')) { att(nom + ' : aucune question sur la période sans activité (« depuis 2024 » est signalée dans la demande)'); } else { ok(nom + ' : la période sans activité est abordée'); }
        if (new Set(qs.map(q => String(q.question).toLowerCase())).size < qs.length) { att(nom + ' : deux questions identiques'); }
        sortie.push('INFO      : ' + nom + ' : ' + mots_ + ' mots au total (une page A4 à 11 points en tient environ 480 avec les conseils ; mesure exacte à l’écran)');
      });
      const g = genre || 'n'; const joint = JSON.stringify(liste);
      if (/camille|0612|@/i.test(joint)) { att('la réponse contient un nom, un numéro ou un courriel de la personne'); } else { ok('aucune donnée personnelle dans la réponse'); }
      if (g === 'f' && /\b(prêt|rigoureux|motivé)\b/i.test(joint)) { att('forme masculine alors que la personne est une femme'); }
    }
  }
  console.log(sortie.join('\n'));
  console.log('\nRésultat : ' + (alertes ? alertes + ' point(s) à voir (voir ATTENTION ci-dessus), puis RELIRE à la main.' : 'aucune alerte automatique, mais RELIRE à la main (le script ne juge pas la qualité).'));
}

const [, , commande, a1, a2, a3, a4] = process.argv;
if (commande === 'generer') { generer(); }
else if (commande === 'verifier' && a1 && a2) { verifier(a1, a2, a3 ? parseInt(a3, 10) : null, a4 || 'n'); }
else { console.log('Usage :\n  node scripts/essai_prompts_ucpm.js generer\n  node scripts/essai_prompts_ucpm.js verifier <metiers|accroches|lettres|retravail|preparation-general|preparation-approfondi> <fichier_reponse.txt> [nombre_attendu] [f|m|n] [niveau] [nombre_de_questions]'); }
