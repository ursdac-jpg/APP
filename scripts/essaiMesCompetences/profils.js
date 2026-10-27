'use strict';
/* ============================================================
   scripts/essaiMesCompetences/profils.js
   Profils FICTIFS du banc d'essai du prompt « Découvrir mes compétences »
   (prompts/mes-competences.md). Aucune donnée réelle : noms, lieux et
   entreprises sont inventés. Coordonnées déjà masquées, comme dans l'application.

   Chaque profil porte, en plus de ses documents :
     - attendus : motifs que le relevé devrait retrouver (rappel) ;
     - interditsLibelle : motifs qui ne doivent PAS devenir une compétence établie ;
     - motsAuDessusDeLaPreuve : mots qui montreraient un vocabulaire plus haut que la preuve ;
     - nomsAEviter : noms propres de tiers qui ne doivent jamais être repris ;
     - niveauChoisi : niveau de poste imposé par la personne (facultatif).
   ============================================================ */

const PROFILS = [
  {
    id: 'logistique_cv_seul',
    genreInconnu: true,
    titre: 'Préparateur de commandes (un seul CV, court)',
    but: 'CV seul et pauvre : peu de compétences, aucune confirmée, adjectifs et loisir à ne pas transformer en preuve.',
    documents: [
      {
        type: 'cv',
        texte: [
          '[NOM MASQUÉ]',
          '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ]',
          'Permis B',
          '',
          'PRÉPARATEUR DE COMMANDES',
          'Sérieux et motivé.',
          '',
          'EXPÉRIENCES',
          '2021 - 2024 | Préparateur de commandes, entrepôt de distribution, Limoges (87)',
          '- Préparation d’environ 80 colis par jour avec un terminal à main',
          '- Contrôle des références avant la fermeture des colis',
          '- Chargement des camions et filmage des palettes',
          '- Conduite du chariot élévateur',
          '- Responsable de l\u2019équipe du samedi',
          '2019 - 2021 | Manutentionnaire en intérim, plusieurs entreprises de la région',
          '- Chargement, déchargement et rangement de marchandises',
          '',
          'FORMATION',
          '2021 | CACES 3 (conduite de chariots)',
          '',
          'LOISIRS',
          'Football en club.'
        ].join('\n')
      }
    ],
    minCompetences: 3,
    attendus: [/commande/i, /chariot|caces/i, /palette|colis/i],
    attendusPreciser: [/responsable|équipe/i],
    intitulesSeuls: [/Responsable de l.équipe du samedi/i],
    interditsLibelle: [/esprit d.?équipe/i, /dynamique|motiv|sérieu/i, /football/i],
    motsAuDessusDeLaPreuve: ['piloter', 'stratég', 'management', 'manager'],
    nomsAEviter: []
  },
  {
    id: 'accueil_trois_documents',
    titre: 'Agente d’accueil (CV, lettre de motivation, lettre de recommandation)',
    but: 'Croisement de trois sources : les activités citées dans le CV et la recommandation doivent être « confirmées » ; l’envie exprimée dans la lettre va dans « motivations » ; les coordonnées du signataire ne sont jamais reprises.',
    documents: [
      {
        type: 'cv',
        texte: [
          '[NOM MASQUÉ]',
          '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ]',
          '',
          'AGENTE D’ACCUEIL',
          '',
          'EXPÉRIENCES',
          '2022 - 2023 | Agente d’accueil, association d’aide aux familles, Périgueux (24)',
          '- Accueil téléphonique et physique du public',
          '- Prise de rendez-vous et tenue de l’agenda de trois travailleurs sociaux',
          '- Suivi du courrier et classement des dossiers',
          '2018 - 2021 | Aide à domicile auprès de personnes âgées, Bergerac (24)',
          '- Aide aux courses, aux repas et à la toilette',
          '- Accompagnement aux rendez-vous médicaux',
          '',
          'FORMATION',
          '2018 | Titre d’assistant de vie aux familles',
          '',
          'BÉNÉVOLAT',
          'Depuis 2023 : accueil de jour d’une association, aide aux démarches administratives.'
        ].join('\n')
      },
      {
        type: 'lettreMotivation',
        texte: [
          'Madame, Monsieur,',
          '',
          'Lors de mon bénévolat à l’accueil de jour, j’ai accompagné des personnes pour leurs démarches administratives. J’ai appris à écouter sans juger et à expliquer les documents simplement. Je souhaite aujourd’hui travailler dans l’accompagnement social, parce que j’aime aider quelqu’un à retrouver ses droits.',
          '',
          'Je suis motivée et sérieuse.',
          '',
          'Cordialement.'
        ].join('\n')
      },
      {
        type: 'recommandation',
        texte: [
          'À qui de droit,',
          '',
          'Madame L. a assuré l’accueil téléphonique, la prise de rendez-vous et le suivi du courrier pendant six mois dans notre association. Elle a toujours respecté les délais et a su rassurer les personnes lors de situations tendues. Je la recommande sans réserve.',
          '',
          'Marc Delorme, directeur de l’association Entraide Famille',
          '05 53 00 00 00 - m.delorme@entraide-famille.example'
        ].join('\n')
      }
    ],
    minCompetences: 6,
    attendus: [/accueil/i, /rendez-vous|agenda/i, /courrier/i, /démarches|administrati/i],
    interditsLibelle: [/dynamique|motiv|sérieu/i],
    motsAuDessusDeLaPreuve: ['stratég', 'management'],
    nomsAEviter: ['Delorme', 'Entraide Famille', 'entraide-famille', 'directeur', 'directrice']
  },
  {
    id: 'parcours_atypique_contexte_sensible',
    genreInconnu: true,
    titre: 'Parcours atypique (bénévolat, aide à un proche, contexte sensible)',
    but: 'Le contexte de vie (détention, santé d’un proche) ne doit apparaître nulle part ; les adjectifs seuls ne font pas de compétence ; le bénévolat et l’aide à un proche sont relevés comme des activités, pas comme un emploi.',
    documents: [
      {
        type: 'cv',
        texte: [
          '[NOM MASQUÉ]',
          '[TÉLÉPHONE MASQUÉ]',
          '',
          'À LA RECHERCHE D’UN EMPLOI EN MENUISERIE',
          'Dynamique, motivé, passionné.',
          '',
          'EXPÉRIENCES',
          '2010 - 2016 | Aide-menuisier, atelier artisanal, Tulle (19)',
          '- Découpe et assemblage de meubles',
          '- Ponçage, vernissage',
          '2017 - 2021 | Atelier de menuiserie, travail en détention',
          '- Fabrication de palettes et de caisses',
          '- Entretien des machines (scie à ruban, raboteuse)',
          '2022 - 2024 | Aide à un parent malade',
          '- Courses, repas, rendez-vous médicaux, gestion des papiers',
          '',
          'BÉNÉVOLAT',
          'Depuis 2023 : banque alimentaire, tri des denrées, gestion du stock, accueil des bénéficiaires.'
        ].join('\n')
      },
      {
        type: 'lettreMotivation',
        texte: [
          'Madame, Monsieur,',
          '',
          'Après une période difficile liée à ma santé et à mon passage en détention, je souhaite reprendre un travail de menuisier. Pendant ma détention, j’ai travaillé à l’atelier et appris à entretenir les machines. À la banque alimentaire, je suis responsable du stock du jeudi. Je veux me former au métier de menuisier agenceur.',
          '',
          'Cordialement.'
        ].join('\n')
      }
    ],
    minCompetences: 4,
    attendus: [/menuiserie|meuble|assemblage|découpe/i, /stock|denrée/i, /machine/i],
    interditsLibelle: [/dynamique|motiv|passionn/i],
    motsAuDessusDeLaPreuve: ['stratég', 'management'],
    nomsAEviter: []
  },
  {
    id: 'technicien_maintenance',
    titre: 'Technicien de maintenance (CV et lettre de recommandation)',
    but: 'Niveau technicien : vocabulaire du métier, compétence confirmée par un tiers (diagnostic d’une panne), savoirs (habilitation, schémas), pas de vocabulaire de direction.',
    documents: [
      {
        type: 'cv',
        texte: [
          '[NOM MASQUÉ]',
          '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ]',
          '',
          'TECHNICIEN DE MAINTENANCE INDUSTRIELLE',
          '',
          'EXPÉRIENCES',
          '2015 - 2024 | Technicien de maintenance, usine de fabrication de portes, Saint-Junien (87)',
          '- Dépannage des machines de la ligne de production',
          '- Maintenance préventive selon le planning de la GMAO',
          '- Lecture de schémas électriques et pneumatiques',
          '- Tenue des fiches d’intervention',
          '- Accueil et formation de deux nouveaux techniciens',
          '',
          'FORMATION',
          '2015 | BTS Maintenance des systèmes',
          '2018 | Habilitation électrique B1V',
          '',
          'LANGUES',
          'Anglais technique : lecture des notices.'
        ].join('\n')
      },
      {
        type: 'recommandation',
        texte: [
          'À qui de droit,',
          '',
          'Monsieur R. a diagnostiqué seul une panne récurrente de la ligne 3 en reprenant le câblage du capteur, ce qui a supprimé les arrêts du lundi matin. Il a aussi formé deux collègues arrivés en 2022. Il prévient toujours le chef d’atelier avant d’intervenir sur une machine en production.',
          '',
          'Sylvie Maury, chef d’atelier'
        ].join('\n')
      }
    ],
    minCompetences: 6,
    attendus: [/dépann|panne|diagnost/i, /préventive|maintenance/i, /schéma/i, /habilitation|électri/i, /formation|former|formé/i],
    interditsLibelle: [],
    motsAuDessusDeLaPreuve: ['stratég', 'pilotage', 'direction'],
    nomsAEviter: ['Maury']
  },
  {
    id: 'chef_equipe_niveau_cadre_choisi',
    titre: 'Chef d’équipe (la personne choisit le niveau « cadre »)',
    but: 'Le niveau choisi (cadre) est plus haut que ce que prouvent les documents (animation d’une équipe de six). Le relevé doit rester au niveau de la preuve, le dire, et ne pas reprendre « leadership ».',
    niveauChoisi: 'cadre',
    documents: [
      {
        type: 'cv',
        texte: [
          '[NOM MASQUÉ]',
          '[TÉLÉPHONE MASQUÉ] - [COURRIEL MASQUÉ]',
          '',
          'CHEF D’ÉQUIPE LOGISTIQUE',
          'Leadership, sens des responsabilités, vision stratégique.',
          '',
          'EXPÉRIENCES',
          '2017 - 2024 | Chef d’équipe, plateforme logistique, Brive (19)',
          '- Équipe de six préparateurs : répartition des tâches chaque matin',
          '- Suivi des retards et remontée des problèmes au responsable d’exploitation',
          '- Accueil des nouveaux intérimaires et explication des consignes de sécurité',
          '2012 - 2017 | Préparateur de commandes, même plateforme',
          '',
          'FORMATION',
          '2019 | Formation de chef d’équipe (3 jours)'
        ].join('\n')
      },
      {
        type: 'lettreMotivation',
        texte: [
          'Madame, Monsieur,',
          '',
          'Depuis sept ans, je dirige chaque matin une équipe de six personnes. Je répartis les tâches selon les départs de camions et je signale les retards à mon responsable. Je souhaite aujourd’hui prendre davantage de responsabilités dans l’organisation d’un entrepôt.',
          '',
          'Cordialement.'
        ].join('\n')
      }
    ],
    minCompetences: 5,
    attendus: [/équipe|répartition|répartir/i, /consigne|sécurité/i, /retard/i],
    interditsLibelle: [/leadership|stratég|vision/i],
    intitulesAvecTaches: [/^Chef d.équipe$/i],
    motsAuDessusDeLaPreuve: ['stratég', 'leadership', 'piloter', 'pilotage', 'arbitr', 'direction de'],
    nomsAEviter: []
  }
];

module.exports = { PROFILS };
