'use strict';
/* ============================================================
   scripts/importRome/tablesRome.js
   Tables de correspondance ROME (France Travail) -> choix de l'application (consigne 263, import des métiers du ROME).
   SEULE SOURCE des correspondances de l'import : à relire par Denis ; toute correction se fait ICI, puis on régénère data/metiersRome.js.
   (scripts/couvertureListesParcours.js garde sa propre copie historique, utilisée pour la mesure du 12/11/2026 : elle n'est plus la référence.)
   Les identifiants (clés) sont ceux des catalogues data/personnesMaterielsLieux.js, data/actionsProfessionnelles.js, data/environnementsTravail.js :
   le générateur vérifie qu'ils existent tous.
   ============================================================ */

// Contextes de travail « Publics spécifiques » du ROME -> choix de « Avec qui »
const PUBLICS = {
  "clients": [
  "Clientèle de particuliers",
  "Clientèle d'entreprises",
  "Clientèle de professionnels",
  "Clientèle d'affaires",
  "Particuliers",
  "Clientèle d'organismes publics"
  ],
  "enfants": [
  "Enfants",
  "Mineurs (- 18 ans)",
  "Nourrissons",
  "Enfants de 3 à 6 ans",
  "Enfants de moins de 3 ans",
  "Enfants de 6 à 10 ans",
  "Enfants de moins de 3 ans en situation de handicap",
  "Enfants de plus de 3 ans en situation de handicap"
  ],
  "personnes_agees": [
  "Personnes âgées",
  "Résidents"
  ],
  "patients": [
  "Patients",
  "Personnes médicalisées"
  ],
  "eleves_etudiants": [
  "Public scolaire",
  "Etudiants"
  ],
  "adolescents": [
  "Adolescents"
  ],
  "personnes_handicap": [
  "Personnes en situation de handicap",
  "Public mal entendant",
  "Public mal voyant",
  "Personnes à mobilité réduite",
  "Enfants de moins de 3 ans en situation de handicap",
  "Enfants de plus de 3 ans en situation de handicap"
  ],
  "personnes_en_difficulte": [
  "Personnes vulnérables",
  "Personnes sous main de justice",
  "Jeunes en insertion",
  "Demandeurs d'emploi",
  "Publics en situation d'illettrisme"
  ],
  "familles": [
  "Familles"
  ],
  "salaries_professionnels": [
  "Salariés",
  "Professionnels de santé",
  "Créateurs d'entreprise",
  "Bénévoles"
  ],
  "partenaires_fournisseurs": [
  "Partenaires Publics et Privés",
  "Travail avec des organisations ou partenaires internationaux"
  ],
  "sportifs": [
  "Sportifs"
  ],
  "usagers_public": [
  "Tous types de public",
  "Usagers",
  "Adultes"
  ]
  };

// Contextes « Types de structures » et « Conditions de travail » du ROME -> choix de « Où vous travailliez »
const LIEUX = {
  "bureau": [
  "En bureau d'études"
  ],
  "teletravail_domicile": [
  "Possibilité de télétravail"
  ],
  "usine": [
  "En atelier",
  "En milieu industriel",
  "En ligne ou ilot de production",
  "Entreprise industrielle",
  "Industries chimiques",
  "Industries de santé",
  "Industrie pharmaceutique",
  "Entreprises spécialisées en carrosserie-peinture"
  ],
  "magasin": [
  "Commerce de proximité",
  "Etablissement de distribution en gros",
  "Concessions"
  ],
  "sante": [
  "Etablissement de santé",
  "En bloc opératoire",
  "En salle d'accouchement"
  ],
  "ecole_formation": [
  "Etablissement scolaire",
  "Organisme de formation"
  ],
  "cuisine": [
  "Etablissement de restauration traditionnelle",
  "Etablissement de restauration rapide",
  "Etablissement de restauration collective",
  "Bar, Brasserie",
  "Hôtellerie / Restauration"
  ],
  "hotel": [
  "Hôtellerie",
  "Hébergement et hôtellerie de plein air"
  ],
  "administration": [
  "Organisme public",
  "Collectivités territoriales",
  "Instances de santé",
  "Organismes de logements sociaux",
  "Secteur de la Défense",
  "Organisme militaire"
  ],
  "laboratoire": [
  "En laboratoire",
  "Laboratoire de recherche et développement",
  "Laboratoire de biologie médicale",
  "En salle blanche"
  ],
  "domicile": [
  "Au domicile d'un particulier",
  "Au domicile de l'intervenant",
  "Particuliers employeurs"
  ],
  "exterieur": [
  "En extérieur",
  "Sur chantier",
  "Entreprises de travaux publics",
  "En grande hauteur",
  "En altitude"
  ],
  "exploitation_agricole": [
  "Exploitation agricole",
  "Travail avec des animaux"
  ],
  "espaces_verts": [
  "Entreprises de génie écologique"
  ],
  "evenementiel": [
  "Structure de loisirs, culturelle ou touristique",
  "Institution culturelle",
  "Opérateurs de voyages et de séjours"
  ],
  "salle_sport": [
  "Structure sportive",
  "En club sportif",
  "En milieu aquatique"
  ],
  "aeroport_gare": [
  "En zone aéroportuaire",
  "Opérateurs aéroportuaires",
  "Opérateurs de transports en commun"
  ],
  "port": [
  "En zone portuaire",
  "En milieu maritime",
  "Structures maritimes"
  ],
  "route": [
  "Entreprises privées de transport sanitaire"
  ],
  "entrepot_logistique": [
  "En zone frigorifique"
  ],
  "social_creche": [
  "Etablissement social ou médico-social (EHPAD, résidence senior, ...)",
  "Structure médico-sociale",
  "Crèche, halte-garderie",
  "Maison d'Assistantes Maternelles (MAM)"
  ],
  "association": [
  "Association",
  "Structures de l'Economie Sociale et Solidaire"
  ],
  "cabinet_pharmacie": [
  "Cabinet libéral",
  "Officine"
  ],
  "medias_studio": [
  "Entreprises de médias",
  "En studio",
  "Société de production audiovisuelle",
  "Structures de l'édition"
  ],
  "centre_appels": [
  "Centres d'appels"
  ],
  "securite_penitentiaire": [
  "Etablissement pénitentiaire",
  "Entreprises de sécurité privée",
  "Port d'arme et de munitions",
  "Port de gilet pare-balles"
  ]
  };

// Sous-catégories de savoirs du ROME -> choix de « Avec quoi » (les animaux, végétaux, produits dangereux et installations électriques se repèrent par mots, voir MOTS_*)
const MATIERES = {
  "Produits, outils et matières > Outils, machines, équipement matériel": [
  "machines",
  "outils"
  ],
  "Produits, outils et matières > Véhicules": [
  "vehicules"
  ],
  "Produits, outils et matières > Produits finis, services": [
  "produits"
  ],
  "Domaines d'expertise > Logiciels, progiciels": [
  "ordinateur"
  ],
  "Domaines d'expertise > Langages informatiques": [
  "ordinateur"
  ],
  "Normes et procédés > Documentations, cartes et plans": [
  "documents"
  ],
  "Produits, outils et matières > Matières, matériaux": [
  "materiaux"
  ],
  "Produits, outils et matières > Mode, textile et accessoires": [
  "tissus_vetements"
  ],
  "Produits, outils et matières > Aliments et spécialités culinaires": [
  "aliments"
  ],
  "Produits, outils et matières > Instruments de musique": [
  "instruments_objets_art"
  ],
  "Produits, outils et matières > Objets d'art": [
  "instruments_objets_art"
  ]
  };
const MOTS_ANIMAUX = [
  ['chevaux', /cheva|équin|équid|poney|équitation/i],
  ['abeilles', /abeille|apicul|miel|ruche/i],
  ['soins_veterinaires', /vétérinaire|veterinaire/i],
  ['elevage_ferme', /élevage|bovin|porc|volaille|ovin|caprin|lait|traite|poisson|pisci|aquacol|conchyl/i],
  ['animaux_compagnie', /animal|animaux|chien|chat|félin|canin|toilett/i]
];
const MOTS_VEGETAUX = /plante|végétaux|vegetaux|arbre|semis|fleur|gazon|forêt|essences|horticol|maraîch|viticol/i;
const MOTS_PRODUITS_DANGEREUX = /produits? chimiques?|produits? dangereux|matières? dangereuses|toxique|inflammable|explosi|amiante|solvant|pesticide|phytosanitaire/i;
const MOTS_INSTALLATIONS_ELECTRIQUES = /électrique|electrique|haute tension|basse tension|courant fort|habilitation électrique|électricité/i;

// Resserrée le 12/11/2026 après lecture de 30 fiches : objectifs trop généraux retirés (cadre juridique, respect des règles, traiter des informations, argumenter, stratégie commerciale)
// Un lieu qui n'a de sens que dans un secteur (« Cabinet libéral » vaut aussi pour un notaire ou un assureur : le choix « Cabinet médical / Pharmacie » ne s'applique qu'en santé)
const LIEUX_SEULEMENT_DANS_SECTEUR = { cabinet_pharmacie: 'Santé et soins' };

// Les 84 « objectifs » de compétences du ROME -> actions de « Ce que vous faisiez » (un objectif absent = aucune action, c'est voulu : fonctions de cadre dirigeant, de stratégie ou de politique publique)
const OBJECTIFS_ACTIONS = {
  '1A1': ['encadrer_animer'], '1B1': ['encadrer_animer'], '1B2': ['encadrer_animer'], '1C2': ['gerer'],
  '1D1': ['conseiller'], '1D2': ['former'], '1D3': ['accompagner'], '1D4': ['former'],
  '1E1': ['accompagner', 'soigner'], '1E2': ['accompagner'], '1E3': ['soigner'], '1E4': ['soigner'],
  '2A2': ['communiquer_ecrit'], '2A3': ['organiser_evenement'], '2A4': ['creer', 'dessiner'],
  '2B1': ['creer'], '2B2': ['creer'], '2B3': ['expliquer_presenter'],
  '2C1': ['analyser'], '2C2': ['concevoir'], '2C3': ['rechercher_tester'],
  '2D1': ['programmer'], '2D2': ['programmer'], '2D3': ['analyser'],
  '3A1': ['concevoir'], '3B1': ['fabriquer', 'utiliser_machines_outils'], '3B2': ['manipuler_produits'], '3B3': ['utiliser_machines_outils'], '3B4': ['cultiver_entretenir_plantes'], '3B6': ['cuisiner'],
  '3C1': ['amenager_espace'], '3D1': ['piloter_projet'], '3D2': ['construire'],
  '3E1': ['reparer'], '3E2': ['entretenir_maintenir'], '3E3': ['entretenir_maintenir'],
  '3F1': ['controler'], '3F2': ['appliquer_consignes_securite'], '3G1': ['controler'], '3G2': ['controler'], '3G3': ['controler'],
  '3H1': ['gerer_stocks_acheter'], '3H2': ['manutentionner_emballer'], '3I1': ['preparer_commandes', 'livrer'], '3J1': ['transporter', 'conduire'],
  '4A1': ['classer', 'saisir'], '4A2': ['calculer'], '4B1': ['gerer_stocks_acheter'], '4C1': ['gerer', 'controler'], '4C2': ['gerer'],
  '4D2': ['negocier'], '4D3': ['negocier'],
  '4E1': ['surveiller_securiser'], '4E2': ['trier_environnement'], '4F1': ['gerer'], '4F3': ['gerer'],
  '5A1': ['accueillir', 'informer'], '5A2': ['conseiller', 'vendre'], '5B1': ['vendre'], '5B3': ['vendre'], '5B4': ['conseiller'], '5B5': ['vendre'],
  '5C1': ['piloter_projet'], '5C3': ['organiser'], '5C5': ['encadrer_animer'],
  '6A2': ['expliquer_presenter'], '6A3': ['communiquer_ecrit'],
  '6B2': ['reagir_urgence']
};

// Affinage : un libellé de macro-compétence qui nomme précisément une action (l'objectif seul ne la distingue pas)
const MACROS_ACTIONS = [
  [/caisse|encaiss/i, 'encaisser'],
  [/nettoy|désinfect|desinfect/i, 'nettoyer'],
  [/commande|préparer des produits|colis/i, 'preparer_commandes'],
  [/livraison|livrer/i, 'livrer'],
  [/(conduire|piloter) .*(véhicule|engin|camion|autobus|train|navire|bateau|aéronef)/i, 'conduire'],
  [/classer|archiv/i, 'classer'],
  [/inventaire|stock/i, 'gerer_stocks_acheter'],
  [/planifi|planning|organiser/i, 'organiser'],
  [/informer|renseign/i, 'informer'],
  [/négoci|negoci/i, 'negocier'],
  [/relation commerciale|vendre|vente/i, 'vendre'],
  [/accueillir, orienter, renseigner/i, 'conseiller'],
  [/diagnostic technique/i, 'reparer']
];

// Règles ajoutées le 13/11/2026 (consigne 280, une seule source) : ce que les premières fiches écrites à la main apportaient et que le générateur ne déduisait pas.
// Un savoir-être du ROME qui nomme une action (compte pour 2 compétences)
const SAVOIR_ETRE_ACTIONS = { 'Faire preuve de créativité, d\'inventivité': ['creer'] };
// Un objectif du ROME qui dit avec qui l'on travaille : toujours retenu s'il pèse au moins 2 compétences
const OBJECTIFS_ACTIVITES_TOUJOURS = { '5A1': ['clients'], '5A2': ['clients'], '5B1': ['clients'], '5B4': ['clients'] };

// Les 16 macro-compétences « Savoir-être professionnel » du ROME -> savoir-être de l'application
const SAVOIR_ETRE = {
  'Faire preuve de rigueur et de précision': ['Rigueur'],
  'Organiser son travail selon les priorités et les objectifs': ['Organisation'],
  'Avoir l\'esprit d\'équipe': ['Esprit d\'équipe'],
  'Faire preuve d\'autonomie': ['Autonomie'],
  'Etre force de proposition': ['Motivation'],
  'Faire preuve de leadership': ['Leadership'],
  'Faire preuve de réactivité': ['Réactivité'],
  'Etre à l\'écoute, faire preuve d\'empathie': ['Écoute', 'Empathie'],
  'Faire preuve de sens des responsabilités': ['Responsabilité'],
  'Faire preuve de créativité, d\'inventivité': ['Créativité'],
  'Etre ouvert aux changements': ['Adaptabilité'],
  'Avoir le sens du service': ['Sens du service'],
  'Faire preuve de contrôle de soi': ['Sang-froid'],
  'Faire preuve de curiosité, d\'ouverture d\'esprit': ['Apprentissage'],
  'Faire preuve de persévérance': ['Persévérance'],
  'Inspirer, donner du sens': ['Leadership']
};

// Catégories de savoirs du ROME retenues pour la liste « savoirs » d'une fiche, par ordre de préférence (jamais les certifications ni habilitations : ce sont des titres)
const CATEGORIES_SAVOIRS = ['Techniques professionnelles', 'Normes et procédés', 'Domaines d\'expertise', 'Produits, outils et matières'];
const SOUS_CATEGORIES_SAVOIRS_EXCLUES = ['Domaines d\'expertise > Langues'];

// Plafonds par fiche (une fiche ROME ne doit pas écraser les fiches détaillées au score : voir docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md)

// ---------------------------------------------------------------------------------------------
// COMBLER LES « RIEN » (retour de Denis 12/11/2026) : le ROME ne dit pas toujours avec qui ni avec quoi on travaille (ni où), surtout pour les métiers de gestion,
// de coordination ou de droit. On l'INTERPRÈTE alors à partir des objectifs de compétences du code. Ces règles sont des déductions de notre fait (pas des données du ROME) :
// à relire. Un objectif ne compte que s'il pèse au moins SEUIL_OBJECTIF_IMPLICITE compétences du code (sauf ceux de OBJECTIFS_SANS_SEUIL, qui nomment leur objet).
// ---------------------------------------------------------------------------------------------
const SEUIL_OBJECTIF_IMPLICITE = 2;
const OBJECTIFS_SANS_SEUIL = ['1E4', '3B4', '3B6'];
// Objectif ROME -> « Avec qui, avec quoi » sous-entendu (identifiants de data/personnesMaterielsLieux.js)
const OBJECTIFS_ACTIVITES = {
  '1B1': ['collegues'], '1B2': ['collegues'], '6A1': ['collegues'], '5C5': ['collegues'],
  '1D3': ['personnes_en_difficulte'], '1E3': ['patients'],
  '4A1': ['documents'], '4A2': ['documents'], '4D1': ['documents'], '4D3': ['documents'], '6A3': ['documents'], '6B3': ['documents'],
  '2D1': ['ordinateur'], '2D3': ['ordinateur'], '2A4': ['ordinateur'],
  '5A1': ['clients'], '5A2': ['clients'], '5B1': ['clients'], '5B4': ['clients'],
  '5C3': ['partenaires_fournisseurs'], '4B1': ['partenaires_fournisseurs'],
  '3H1': ['marchandises'], '3H2': ['marchandises'], '3I1': ['marchandises'], '3J1': ['vehicules'],
  '3B2': ['produits'], '3D2': ['materiaux'], '3E2': ['machines'], '3B6': ['aliments'], '2B2': ['instruments_objets_art']
};
// Objectif ROME -> lieu sous-entendu, seulement quand le ROME n'en donne aucun (identifiants de data/environnementsTravail.js)
const OBJECTIFS_LIEUX = { '3J1': ['route'], '3I1': ['entrepot_logistique'], '2D1': ['bureau'], '2D3': ['bureau'], '4A1': ['bureau'], '4A2': ['bureau'], '3D1': ['exterieur'], '3D2': ['exterieur'], '1E3': ['sante'] };
// Secteur -> lieu habituel, en dernier recours et seulement pour les secteurs de bureau
const LIEU_PAR_DEFAUT_DU_SECTEUR = { 'Informatique et numérique': 'bureau', 'Administration, gestion et bureau': 'bureau', 'Banque, assurance et immobilier': 'bureau' };

// Verbes de compétences du ROME -> action de l'application, pour les cartes que les objectifs ne retrouvaient pas (rédiger, installer, monter, découper, imaginer).
// Le verbe est lu au début du libellé de la compétence ; compte comme une compétence de plus pour l'action (même seuil que les autres).
const VERBES_ACTIONS = [
  [/^rédiger/i, 'rediger'],
  [/^(installer|poser|implanter|raccorder|réaliser (la |une |l')?(pose|installation))/i, 'installer'],
  [/^(monter|assembler|câbler|réaliser (une |un |le |l')?(opération de )?(câblage|montage|assemblage))/i, 'monter'],
  [/^(découper|débiter|trancher|désosser|dépecer)/i, 'decouper'],
  [/^(imaginer|inventer|concevoir des (supports|visuels|concepts|idées|campagnes))/i, 'imaginer']
];
// Outils numériques que le ROME range avec les autres outils : carte « Des appareils numériques »
const MOTS_APPAREILS_NUMERIQUES = /tablette|smartphone|GPS|géolocalisation|informatique nomade|applis? mobile|caméra|appareil photo|terminal (de paiement|mobile|portable)/i;
// Lieux « espaces verts » : le ROME dit seulement « en extérieur » ou « exploitation agricole »
const MOTS_ESPACES_VERTS = /paysag|jardin|espaces? verts?|arbre|forest|forêt|golf|arboricul|horticul/i;
// Conditions de travail du ROME qui disent avec qui ou avec quoi on travaille (utilisées seulement si le ROME ne donne pas déjà 2 choix)
const CONDITIONS_VERS_ACTIVITES = {
  'En contact avec du public': ['usagers_public'],
  'Manipulation de produits à risques': ['produits_dangereux']
};
// « À SAVOIR SUR CE MÉTIER » (décision Denis 12/11/2026) : les conditions de travail du ROME (horaires, déplacements, charges, tenue, statut...) ne sont PAS des choix demandés à
// la personne ni des critères de score : elles s'affichent seulement dans la fiche du métier, en phrases simples et rassurantes. Ordre = ordre d'affichage.
// Chaque règle : [identifiant, motif sur le libellé du ROME, phrase affichée]. Les identifiants en « s_ » sont des statuts d'emploi (affichés sur une seule ligne).
const CONDITIONS_REGLES = [
  ['nuit', /^Travail de nuit/, 'Travail de nuit possible'],
  ['weekend', /week-ends|dimanche|samedi/, 'Travail le week-end ou les jours fériés possible'],
  ['horaires', /décalés|irrégulier|roulement|posté|fractionnés|astreinte|urgence|horaires variables/, 'Horaires variables ou décalés (astreintes, roulement)'],
  ['saisonnier', /Travail saisonnier|vacances scolaires|Contrat travail saisonnier/, 'Travail saisonnier ou pendant les vacances scolaires'],
  ['deplacements', /^Déplacements professionnels/, 'Déplacements professionnels'],
  ['charges', /charges lourdes/, 'Port de charges'],
  ['debout', /Station debout|Position pénible/, 'Longtemps debout ou dans des positions fatigantes'],
  ['assis', /Station assise/, 'Longtemps assis'],
  ['repetitif', /répétitif|cadence/, 'Gestes répétitifs ou cadence à tenir'],
  ['precision', /motricité fine/, 'Gestes précis et minutieux'],
  ['tenue', /équipement de protection|tenue professionnelle|uniforme|équipement d'hygiène|gilet pare-balles|Port d'arme/, 'Tenue ou équipement de protection à porter'],
  ['securite', /dangereux|produits à risques|gaz, aérosol|hautes températures|basses températures|hostile|nucléaire|hyperbare|Risques de chutes|grande hauteur|En altitude|exigu|atmosphère contrôlée|climatique difficile/, 'Consignes de sécurité à respecter (machines, produits, chaleur, hauteur...)'],
  ['bruit', /bruyant/, 'Environnement bruyant'],
  ['exterieur', /^En extérieur|^Sur chantier|maritime|portuaire/, 'Travail en extérieur, par tous les temps'],
  ['public', /contact avec du public/, 'Contact régulier avec le public'],
  ['domicile', /domicile d'un particulier|domicile de l'intervenant/, 'Interventions au domicile de personnes'],
  ['isole', /situation isolée/, 'Moments de travail seul ou isolé'],
  ['teletravail', /télétravail/, 'Télétravail possible'],
  ['s_independant', /Travailleur indépendant|Profession libérale|Artiste-auteur/, 'Possible en indépendant'],
  ['s_interim', /^Intérim/, 'Possible en intérim'],
  ['s_public', /Fonctionnaire|Salarié secteur public/, 'Possible dans la fonction publique'],
  ['s_alternance', /^Alternance/, 'Possible en alternance']
];
// Seuils pour retenir une action : au moins SEUIL_ACTION_MIN compétences du ROME ET SEUIL_ACTION_PART de la première action (réglés par mesure sur les fiches à la main, 13/11/2026)
const SEUIL_ACTION_MIN = 2, SEUIL_ACTION_PART = 0.3;
const PLAFONDS = { actions: 6, publics: 3, matieres: 3, implicites: 3, activites: 6, lieux: 3, savoirFaire: 6, savoirEtre: 4, savoirs: 6, partMiniMot: 0.12 };

module.exports = { SEUIL_ACTION_MIN, SEUIL_ACTION_PART, SAVOIR_ETRE_ACTIONS, OBJECTIFS_ACTIVITES_TOUJOURS, CONDITIONS_REGLES, VERBES_ACTIONS, MOTS_APPAREILS_NUMERIQUES, MOTS_ESPACES_VERTS, CONDITIONS_VERS_ACTIVITES, SEUIL_OBJECTIF_IMPLICITE, OBJECTIFS_SANS_SEUIL, OBJECTIFS_ACTIVITES, OBJECTIFS_LIEUX, LIEU_PAR_DEFAUT_DU_SECTEUR, LIEUX_SEULEMENT_DANS_SECTEUR, PUBLICS, LIEUX, MATIERES, MOTS_ANIMAUX, MOTS_VEGETAUX, MOTS_PRODUITS_DANGEREUX, MOTS_INSTALLATIONS_ELECTRIQUES, OBJECTIFS_ACTIONS, MACROS_ACTIONS, SAVOIR_ETRE, CATEGORIES_SAVOIRS, SOUS_CATEGORIES_SAVOIRS_EXCLUES, PLAFONDS };
