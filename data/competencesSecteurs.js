/* ============================================================
   data/competencesSecteurs.js
   ------------------------------------------------------------
   Referentiel de competences ATTENDUES par secteur (21 secteurs de baseMetiers.secteur), redige le 2026-09-29 et relu par Denis.
   Genere depuis docs/BROUILLON_REFERENTIEL_SECTEURS_2026-09-29.md et docs/BROUILLON_SECTEUR_SANTE_ET_SOINS_2026-09-29.md.
   Statut : NON verifie sur les fiches officielles France Travail (ROME).
   Ce sont des competences ATTENDUES dans le secteur, jamais des affirmations sur la personne. « titresHabilitations » (permis, CACES,
   diplome d'Etat...) n'est PAS une competence : ne jamais l'afficher comme acquis pour la personne.
   Cle = libelle exact du secteur, comme baseMetiers[i].secteur (data/metiers.js).
   ============================================================ */
var COMPETENCES_SECTEURS = {
  "Administration, gestion et bureau": {
    "savoirFaire": [
      "Accueil physique et téléphonique",
      "Bureautique (traitement de texte, tableur)",
      "Gestion administrative et classement",
      "Rédaction de courriers et de comptes rendus",
      "Saisie comptable",
      "Facturation et suivi des paiements",
      "Planification et gestion d'agenda",
      "Gestion de la paie ou des dossiers du personnel",
      "Coordination d'une équipe",
      "Analyse de données simples",
      "Gestion des fournitures et des commandes",
      "Orientation du public"
    ],
    "savoirEtre": [
      "Organisation",
      "Rigueur",
      "Discrétion et confidentialité",
      "Fiabilité",
      "Sens du service",
      "Communication",
      "Écoute",
      "Polyvalence",
      "Autonomie",
      "Capacité à gérer les priorités",
      "Réactivité",
      "Esprit d'équipe"
    ],
    "savoirs": [
      "Outils bureautiques",
      "Procédures administratives",
      "Notions de comptabilité générale",
      "Bases du droit du travail",
      "Orthographe et rédaction professionnelle",
      "Fonctionnement des services publics locaux"
    ],
    "titresHabilitations": "aucun diplôme obligatoire pour débuter ; titres professionnels (secrétaire assistant, assistant de gestion, comptable assistant), certifications bureautiques (TOSA, ICDL)"
  },
  "Agriculture, nature et espaces verts": {
    "savoirFaire": [
      "Plantation, semis et entretien des végétaux",
      "Taille et élagage",
      "Conduite de machines agricoles",
      "Traitements et soins aux cultures",
      "Récolte et conditionnement",
      "Entretien du matériel",
      "Soins aux animaux",
      "Vinification et travail en cave",
      "Entretien d'espaces verts",
      "Lecture de la météo et des cycles",
      "Organisation du travail saisonnier",
      "Encadrement d'une petite équipe"
    ],
    "savoirEtre": [
      "Endurance physique",
      "Autonomie",
      "Adaptabilité aux saisons et aux conditions",
      "Patience",
      "Rigueur",
      "Sens de l'observation",
      "Esprit d'équipe",
      "Sens des responsabilités",
      "Organisation",
      "Goût du travail en extérieur",
      "Fiabilité",
      "Sens de la sécurité"
    ],
    "savoirs": [
      "Végétaux et cycles de culture",
      "Matériel agricole et motorisé",
      "Techniques de taille et de traitement",
      "Notions de botanique",
      "Règles de sécurité et produits phytosanitaires",
      "Alimentation et reproduction animale"
    ],
    "titresHabilitations": "Certiphyto, CACES, permis B ou tracteur selon les postes"
  },
  "Artisanat et création": {
    "savoirFaire": [
      "Conception et réalisation d'une pièce",
      "Travail manuel de précision",
      "Lecture de plans et de croquis",
      "Assemblage et finition",
      "Composition (florale, bijou, meuble)",
      "Conseil et prise de commande sur mesure",
      "Gestion des matières et des stocks",
      "Entretien des outils",
      "Restauration",
      "Présentation et mise en valeur des produits",
      "Suivi des commandes",
      "Gestion administrative d'un atelier"
    ],
    "savoirEtre": [
      "Créativité",
      "Sens du détail",
      "Patience",
      "Rigueur",
      "Relation client",
      "Autonomie",
      "Précision",
      "Sens esthétique",
      "Persévérance",
      "Organisation",
      "Esprit d'équipe",
      "Curiosité"
    ],
    "savoirs": [
      "Connaissance des matériaux",
      "Techniques de menuiserie fine",
      "Techniques de bijouterie et gemmologie",
      "Connaissance des fleurs et compositions",
      "Histoire des styles"
    ],
    "titresHabilitations": "CAP ou brevet du métier"
  },
  "Banque, assurance et immobilier": {
    "savoirFaire": [
      "Accueil et conseil d'un client",
      "Analyse d'une situation financière",
      "Vente de produits et négociation",
      "Montage et suivi d'un dossier",
      "Rédaction de contrats et de comptes rendus",
      "Prospection",
      "Estimation d'un bien ou d'un risque",
      "Gestion administrative",
      "Suivi d'un portefeuille client",
      "Explication d'une réglementation",
      "Organisation de visites ou de rendez-vous",
      "Respect des procédures de conformité"
    ],
    "savoirEtre": [
      "Relation client",
      "Communication",
      "Rigueur",
      "Autonomie",
      "Sens de la confidentialité",
      "Sens de la négociation",
      "Écoute",
      "Sens commercial",
      "Organisation",
      "Fiabilité",
      "Persévérance",
      "Présentation soignée"
    ],
    "savoirs": [
      "Produits bancaires et financiers de base",
      "Réglementation bancaire",
      "Produits et droit des assurances",
      "Droit immobilier de base",
      "Marché immobilier local"
    ],
    "titresHabilitations": "carte professionnelle immobilière, ORIAS pour l'assurance, formations réglementées"
  },
  "Bâtiment et travaux publics": {
    "savoirFaire": [
      "Lecture de plans",
      "Traçage et prise de mesures",
      "Pose et assemblage de matériaux",
      "Préparation des supports",
      "Finitions",
      "Installation et raccordement",
      "Utilisation d'outils et de machines",
      "Conduite d'engins",
      "Travail en hauteur en sécurité",
      "Réparation et dépannage",
      "Coordination d'une équipe de chantier",
      "Approvisionnement et gestion du matériel"
    ],
    "savoirEtre": [
      "Endurance physique",
      "Sens de la sécurité",
      "Esprit d'équipe",
      "Rigueur",
      "Autonomie",
      "Précision",
      "Sens du détail",
      "Organisation",
      "Persévérance",
      "Responsabilité",
      "Adaptabilité aux intempéries et aux lieux",
      "Raisonnement logique"
    ],
    "savoirs": [
      "Normes de construction",
      "Sécurité sur chantier",
      "Matériaux de construction",
      "Lecture de schémas techniques",
      "Outillage",
      "Gestes et postures"
    ],
    "titresHabilitations": "habilitations électriques, CACES engins, travail en hauteur, attestation amiante selon le chantier"
  },
  "Coiffure et esthétique": {
    "savoirFaire": [
      "Coupe, coloration, mise en forme",
      "Soins du visage et du corps",
      "Épilation et maquillage",
      "Conseil personnalisé",
      "Accueil et prise de rendez-vous",
      "Encaissement",
      "Entretien et désinfection du matériel",
      "Gestion des stocks de produits",
      "Diagnostic de cheveux ou de peau",
      "Vente de produits",
      "Organisation du planning",
      "Respect des règles d'hygiène"
    ],
    "savoirEtre": [
      "Créativité",
      "Relation client",
      "Écoute",
      "Sens du détail",
      "Rigueur",
      "Présentation soignée",
      "Discrétion",
      "Patience",
      "Communication",
      "Résistance à la station debout",
      "Sens du service",
      "Adaptabilité"
    ],
    "savoirs": [
      "Techniques de coiffure",
      "Colorimétrie",
      "Techniques de soins esthétiques",
      "Connaissance des produits cosmétiques",
      "Hygiène et sécurité des salons"
    ],
    "titresHabilitations": "CAP coiffure ou esthétique, brevet professionnel"
  },
  "Commerce et vente": {
    "savoirFaire": [
      "Conseil et vente",
      "Accueil de la clientèle",
      "Encaissement et tenue de caisse",
      "Mise en rayon et merchandising",
      "Gestion des stocks et des commandes",
      "Étiquetage et contrôle des prix",
      "Négociation",
      "Traitement des réclamations",
      "Gestion de la relation client par téléphone",
      "Bureautique de base",
      "Entretien de l'espace de vente",
      "Suivi des ventes et des objectifs"
    ],
    "savoirEtre": [
      "Sens du service",
      "Relation client",
      "Écoute",
      "Sourire et accueil",
      "Patience",
      "Rigueur",
      "Organisation",
      "Autonomie",
      "Réactivité",
      "Esprit d'équipe",
      "Sens du détail",
      "Résistance à la station debout et à la pression"
    ],
    "savoirs": [
      "Techniques de vente",
      "Connaissance des produits",
      "Règles d'hygiène et d'affichage",
      "Gestion d'un point de vente",
      "Outils informatiques de caisse",
      "Rotation des produits"
    ],
    "titresHabilitations": "aucun obligatoire (certificat de capacité alcool ou permis de vente selon les produits)"
  },
  "Communication, culture et événementiel": {
    "savoirFaire": [
      "Rédaction et animation de contenus",
      "Création graphique",
      "Prise de vue et retouche",
      "Installation et réglage de matériel son et lumière",
      "Organisation d'un événement",
      "Accueil et conseil du public",
      "Classement et gestion d'un fonds documentaire",
      "Gestion de réseaux sociaux",
      "Gestion de projet",
      "Suivi d'un budget simple",
      "Animation d'un groupe",
      "Veille et recherche d'informations"
    ],
    "savoirEtre": [
      "Créativité",
      "Communication",
      "Adaptabilité",
      "Sens du détail",
      "Autonomie",
      "Réactivité",
      "Organisation",
      "Rigueur",
      "Sens du service",
      "Esprit d'équipe",
      "Curiosité",
      "Disponibilité (horaires décalés)"
    ],
    "savoirs": [
      "Réseaux sociaux et stratégie de contenu",
      "Logiciels de création graphique",
      "Techniques photographiques",
      "Organisation d'événements",
      "Matériel de sonorisation et d'éclairage",
      "Classification documentaire"
    ],
    "titresHabilitations": "habilitations électriques pour la technique, diplômes du secteur culturel"
  },
  "Éducation et formation": {
    "savoirFaire": [
      "Animation d'une séance de formation",
      "Préparation de supports pédagogiques",
      "Évaluation des acquis",
      "Accompagnement individuel d'un apprenant",
      "Transmission d'un savoir-faire",
      "Adaptation à un public en difficulté",
      "Suivi de présence et de progression",
      "Rédaction de bilans",
      "Gestion d'un groupe",
      "Accompagnement d'un élève handicapé dans les gestes du quotidien",
      "Collaboration avec l'équipe éducative",
      "Utilisation d'outils numériques de formation"
    ],
    "savoirEtre": [
      "Pédagogie",
      "Patience",
      "Écoute",
      "Empathie",
      "Bienveillance",
      "Communication",
      "Adaptabilité",
      "Organisation",
      "Sens de la sécurité",
      "Sang-froid",
      "Rigueur",
      "Sens des responsabilités"
    ],
    "savoirs": [
      "Ingénierie pédagogique",
      "Techniques d'évaluation",
      "Connaissance du handicap en milieu scolaire",
      "Code de la route et pédagogie de la conduite",
      "Cadre réglementaire de la formation"
    ],
    "titresHabilitations": "BEPECASER, titre de formateur, formations à l'accompagnement du handicap"
  },
  "Hôtellerie, restauration et tourisme": {
    "savoirFaire": [
      "Service en salle et prise de commande",
      "Préparation et dressage des plats",
      "Respect des règles d'hygiène alimentaire",
      "Accueil et enregistrement des clients",
      "Gestion des réservations",
      "Encaissement",
      "Entretien des chambres et des espaces",
      "Préparation des boissons",
      "Conseil et information touristique",
      "Gestion des stocks",
      "Coordination d'une brigade ou d'une équipe",
      "Plonge et entretien du matériel"
    ],
    "savoirEtre": [
      "Sens du service",
      "Sourire et accueil",
      "Communication",
      "Résistance physique et au stress",
      "Adaptabilité",
      "Esprit d'équipe",
      "Rigueur",
      "Politesse et présentation soignée",
      "Réactivité",
      "Sens du détail",
      "Discrétion",
      "Disponibilité (horaires décalés)"
    ],
    "savoirs": [
      "Hygiène alimentaire (HACCP)",
      "Techniques de service",
      "Techniques culinaires",
      "Langues étrangères",
      "Logiciels de réservation",
      "Offre et patrimoine touristiques locaux"
    ],
    "titresHabilitations": "formation HACCP, permis d'exploitation ou certificat de capacité selon le poste"
  },
  "Industrie, production et énergie": {
    "savoirFaire": [
      "Conduite et surveillance d'une machine ou d'une ligne",
      "Lecture de plans et de schémas",
      "Réglage et contrôle de la qualité",
      "Maintenance préventive et dépannage",
      "Assemblage et câblage",
      "Soudage ou usinage",
      "Respect des consignes de sécurité",
      "Conditionnement et traçabilité",
      "Diagnostic d'une panne",
      "Relevé et suivi de production",
      "Travail en hauteur",
      "Petite mécanique et électricité de base"
    ],
    "savoirEtre": [
      "Rigueur",
      "Respect des normes et des consignes",
      "Sens de la sécurité",
      "Fiabilité",
      "Autonomie",
      "Sens du détail",
      "Esprit d'équipe",
      "Adaptabilité",
      "Endurance",
      "Raisonnement logique",
      "Réactivité",
      "Vigilance"
    ],
    "savoirs": [
      "Règles de sécurité industrielle",
      "Procédures qualité",
      "Lecture de schémas",
      "Fonctionnement d'une ligne de production",
      "Normes d'hygiène (HACCP)",
      "Électricité et mécanique de base"
    ],
    "titresHabilitations": "habilitations électriques, CACES, certificats de soudage, travail en hauteur"
  },
  "Informatique et numérique": {
    "savoirFaire": [
      "Programmation",
      "Conception et test d'une application",
      "Administration et dépannage d'un poste ou d'un réseau",
      "Maintenance de sites internet",
      "Gestion de bases de données",
      "Analyse d'un besoin",
      "Documentation technique",
      "Assistance aux utilisateurs",
      "Gestion de projet",
      "Veille technologique",
      "Installation et déploiement",
      "Sécurité informatique de base"
    ],
    "savoirEtre": [
      "Raisonnement logique",
      "Autonomie",
      "Rigueur",
      "Curiosité et apprentissage continu",
      "Persévérance",
      "Sens de l'analyse",
      "Communication technique",
      "Esprit d'équipe",
      "Organisation",
      "Adaptabilité",
      "Patience",
      "Sens du service"
    ],
    "savoirs": [
      "Langages de programmation",
      "Bases de données",
      "Méthodes agiles",
      "Réseaux et protocoles",
      "Création et maintenance de sites",
      "Notions de cybersécurité"
    ],
    "titresHabilitations": "titres professionnels du numérique, certifications éditeurs"
  },
  "Mécanique et automobile": {
    "savoirFaire": [
      "Diagnostic d'une panne",
      "Entretien et révision d'un véhicule",
      "Réparation mécanique",
      "Utilisation d'outils de diagnostic électronique",
      "Remplacement de pièces",
      "Réparation de carrosserie",
      "Préparation et application de peinture",
      "Contrôle qualité",
      "Lecture de documentation technique",
      "Conseil au client",
      "Gestion des pièces",
      "Respect des procédures du constructeur"
    ],
    "savoirEtre": [
      "Rigueur",
      "Précision",
      "Autonomie",
      "Raisonnement logique",
      "Sens du détail",
      "Sens du service",
      "Organisation",
      "Curiosité technique",
      "Patience",
      "Sens de la sécurité",
      "Fiabilité",
      "Esprit d'équipe"
    ],
    "savoirs": [
      "Mécanique automobile",
      "Électronique embarquée",
      "Peinture automobile",
      "Matériaux composites",
      "Règles de sécurité en atelier",
      "Normes environnementales de l'atelier"
    ],
    "titresHabilitations": "CAP ou bac pro du secteur, habilitation électrique véhicules hybrides et électriques"
  },
  "Métiers animaliers": {
    "savoirFaire": [
      "Soins d'hygiène et de confort aux animaux",
      "Observation du comportement et de l'état de santé",
      "Contention et manipulation en sécurité",
      "Toilettage",
      "Assistance à une consultation",
      "Nourrissage et suivi de l'alimentation",
      "Entretien des locaux et des enclos",
      "Accueil et conseil des propriétaires",
      "Gestion des stocks",
      "Désinfection du matériel",
      "Tenue des dossiers",
      "Encadrement d'animaux en groupe"
    ],
    "savoirEtre": [
      "Patience",
      "Empathie envers les animaux et leurs propriétaires",
      "Sens de l'observation",
      "Autonomie",
      "Sang-froid",
      "Rigueur",
      "Communication",
      "Réactivité",
      "Endurance",
      "Sens des responsabilités",
      "Persévérance",
      "Douceur et calme"
    ],
    "savoirs": [
      "Notions médicales de base",
      "Comportement animalier",
      "Hygiène et asepsie",
      "Alimentation et santé des animaux",
      "Techniques de toilettage",
      "Réglementation du bien-être animal"
    ],
    "titresHabilitations": "ASV, diplôme vétérinaire, certificat de capacité selon l'activité"
  },
  "Métiers de bouche (artisanat)": {
    "savoirFaire": [
      "Fabrication (pain, pâtisserie, découpe)",
      "Préparation et cuisson",
      "Respect de l'hygiène et de la chaîne du froid",
      "Décoration et présentation des produits",
      "Gestion des matières premières et des stocks",
      "Conseil et vente",
      "Entretien du laboratoire",
      "Traçabilité",
      "Organisation de la production",
      "Travail de nuit ou tôt le matin",
      "Utilisation des machines",
      "Contrôle qualité"
    ],
    "savoirEtre": [
      "Rigueur",
      "Créativité",
      "Endurance physique",
      "Sens du service",
      "Précision",
      "Respect des normes",
      "Autonomie",
      "Sens du détail",
      "Organisation",
      "Relation client",
      "Esprit d'équipe",
      "Régularité"
    ],
    "savoirs": [
      "Panification et fermentation",
      "Techniques de pâtisserie",
      "Découpe des viandes",
      "Hygiène alimentaire (HACCP)",
      "Chaîne du froid et traçabilité"
    ],
    "titresHabilitations": "CAP du métier, formation HACCP"
  },
  "Propreté et gestion des déchets": {
    "savoirFaire": [
      "Nettoyage et désinfection des locaux",
      "Utilisation des produits et du matériel d'entretien",
      "Tri et collecte des déchets",
      "Manutention de charges",
      "Conduite d'un véhicule ou d'une machine de nettoyage",
      "Balayage et entretien de la voie publique",
      "Contrôle et relevé (eau, installations)",
      "Petite maintenance du matériel",
      "Respect des protocoles de nettoyage",
      "Signalement des anomalies",
      "Organisation d'une tournée",
      "Rédaction de comptes rendus simples"
    ],
    "savoirEtre": [
      "Rigueur",
      "Autonomie",
      "Fiabilité",
      "Organisation",
      "Endurance physique",
      "Sens de la sécurité",
      "Esprit d'équipe",
      "Discrétion",
      "Réactivité",
      "Sens de l'observation",
      "Ponctualité",
      "Sang-froid"
    ],
    "savoirs": [
      "Protocoles de nettoyage",
      "Sécurité des produits",
      "Tri et gestion des déchets",
      "Sécurité sur la voie publique",
      "Traitement et analyse de l'eau",
      "Gestes et postures"
    ],
    "titresHabilitations": "permis B ou C selon les tournées ; habilitations propres au traitement de l'eau"
  },
  "Santé et soins": {
    "savoirFaire": [
      "Soins d'hygiène et de confort",
      "Aide à la toilette et à l'habillage",
      "Mobilisation et transferts en sécurité",
      "Prise de constantes (température, pouls, tension)",
      "Observation de l'état de la personne",
      "Bionettoyage et entretien des locaux",
      "Application des protocoles d'hygiène et d'asepsie",
      "Aide à la prise des repas",
      "Transmission orale et écrite des informations",
      "Accueil et orientation des patients et de leurs proches",
      "Gestes de premiers secours",
      "Tenue des dossiers et gestion des rendez-vous"
    ],
    "savoirEtre": [
      "Empathie",
      "Bienveillance",
      "Respect de la dignité et de l'intimité",
      "Discrétion et secret professionnel",
      "Sens de l'observation",
      "Rigueur",
      "Patience",
      "Écoute",
      "Travail en équipe",
      "Sang-froid",
      "Réactivité",
      "Sens des responsabilités"
    ],
    "savoirs": [
      "Protocoles de soins",
      "Hygiène hospitalière",
      "Règles de sécurité et prévention des risques",
      "Terminologie médicale de base",
      "Droits des patients",
      "Manutention et ergonomie"
    ],
    "titresHabilitations": "diplômes d'État (aide-soignant, infirmier, ambulancier), attestations de formation aux gestes et soins d'urgence"
  },
  "Sécurité": {
    "savoirFaire": [
      "Surveillance et ronde",
      "Contrôle d'accès",
      "Intervention et gestion d'un incident",
      "Rédaction de rapports et de mains courantes",
      "Gestes de premiers secours",
      "Utilisation d'un système de vidéosurveillance ou d'alarme",
      "Accueil et orientation du public",
      "Prévention incendie",
      "Gestion d'un conflit",
      "Communication radio",
      "Planification d'une mission",
      "Respect des consignes et des procédures"
    ],
    "savoirEtre": [
      "Sang-froid",
      "Discipline",
      "Sens de la hiérarchie",
      "Rigueur",
      "Fiabilité",
      "Sens des responsabilités",
      "Discrétion",
      "Vigilance",
      "Sens du devoir",
      "Maîtrise de soi",
      "Esprit d'équipe",
      "Condition physique"
    ],
    "savoirs": [
      "Consignes incendie",
      "Gestes de premiers secours",
      "Notions de droit pénal et de procédure",
      "Sécurité publique",
      "Règles d'usage de la force et de légitime défense"
    ],
    "titresHabilitations": "carte professionnelle (CQP APS), SSIAP, concours pour la gendarmerie"
  },
  "Social et services à la personne": {
    "savoirFaire": [
      "Accompagnement dans les actes de la vie quotidienne",
      "Aide à la toilette et à l'habillage",
      "Préparation et aide aux repas",
      "Entretien du logement et du linge",
      "Animation d'activités",
      "Écoute et entretien individuel",
      "Accompagnement dans les démarches administratives",
      "Observation et transmission des informations",
      "Éveil et soins aux jeunes enfants",
      "Construction d'un projet avec la personne",
      "Orientation vers les partenaires",
      "Rédaction de comptes rendus"
    ],
    "savoirEtre": [
      "Empathie",
      "Bienveillance",
      "Écoute",
      "Patience",
      "Discrétion et respect de la vie privée",
      "Respect de la dignité",
      "Fiabilité",
      "Sens des responsabilités",
      "Adaptabilité",
      "Sens de l'organisation",
      "Persévérance",
      "Travail en équipe"
    ],
    "savoirs": [
      "Gestes de premiers secours",
      "Développement de l'enfant",
      "Connaissance du handicap et de la perte d'autonomie",
      "Dispositifs d'aide sociale",
      "Règles de sécurité à domicile",
      "Droit social de base"
    ],
    "titresHabilitations": "diplômes d'État (éducateur, assistant de service social), titre professionnel ADVF, CAP AEPE"
  },
  "Sport, animation et loisirs": {
    "savoirFaire": [
      "Animation de séances et d'activités",
      "Préparation d'un programme",
      "Transmission d'une technique",
      "Surveillance et sécurité d'un groupe",
      "Gestes de premiers secours",
      "Encadrement de publics variés",
      "Coaching individuel",
      "Organisation d'événements",
      "Gestion du matériel",
      "Conseil aux pratiquants",
      "Adaptation d'une activité au niveau du groupe",
      "Accueil du public"
    ],
    "savoirEtre": [
      "Pédagogie",
      "Dynamisme",
      "Communication",
      "Sens de la sécurité",
      "Créativité",
      "Adaptabilité",
      "Esprit d'équipe",
      "Motivation",
      "Rigueur",
      "Sang-froid",
      "Écoute",
      "Sens de l'autorité bienveillante"
    ],
    "savoirs": [
      "Techniques d'animation",
      "Techniques sportives et pédagogie du sport",
      "Réglementation des accueils collectifs de mineurs",
      "Techniques de remise en forme",
      "Techniques de sauvetage",
      "Procédures d'urgence"
    ],
    "titresHabilitations": "BAFA, BPJEPS, BNSSA, diplôme de maître-nageur"
  },
  "Transport et logistique": {
    "savoirFaire": [
      "Préparation et contrôle de commandes",
      "Chargement et déchargement",
      "Conduite d'un véhicule ou d'un engin",
      "Gestion des stocks et des flux",
      "Lecture d'un plan d'itinéraire",
      "Utilisation d'un terminal ou d'un logiciel d'entrepôt",
      "Tri et étiquetage des colis",
      "Manutention en sécurité (gestes et postures)",
      "Suivi des livraisons",
      "Accueil et information des clients ou voyageurs",
      "Planification des tournées",
      "Contrôle du matériel et du véhicule"
    ],
    "savoirEtre": [
      "Ponctualité et respect des délais",
      "Rigueur",
      "Organisation",
      "Autonomie",
      "Sens de la sécurité",
      "Fiabilité",
      "Sens du service",
      "Endurance physique",
      "Sang-froid",
      "Esprit d'équipe",
      "Réactivité",
      "Gestion du temps"
    ],
    "savoirs": [
      "Règles de sécurité en entrepôt",
      "Code de la route",
      "Réglementation du transport",
      "Chaîne logistique",
      "Gestes et postures",
      "Logiciels de gestion d'entrepôt"
    ],
    "titresHabilitations": "CACES 1, 3, 5 ; permis B, C, D ; FIMO / FCO selon le métier"
  }
};

if (typeof module !== 'undefined' && module.exports) { module.exports = { COMPETENCES_SECTEURS: COMPETENCES_SECTEURS }; }
