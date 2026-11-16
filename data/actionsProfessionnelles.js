/* ============================================================
   data/actionsProfessionnelles.js
   ------------------------------------------------------------
   TACHE 21A puis 21C : referentiel des actions professionnelles
   ("Que faisiez-vous souvent ?").

   Ce fichier est la source de reference pour :
   - la liste des actions affichees (categorie, icone) ;
   - le moteur d'identification automatique des competences
     (savoir-faire, savoir-etre, savoirs) ;
   - les metiers associes a chaque action.

   Structure par action :
   {
     id: identifiant unique (utilise par dossier.actions),
     label: libelle affiche,
     icon: icone affichee sur la carte,
     categorie: nom de la categorie (redondant avec le groupe,
                mais permet une recherche directe par id sans
                parcourir tous les groupes),
     savoirFaire: [...],   // termes DEJA presents dans categorieCompetence (app.js)
     savoirEtre: [...],    // termes DEJA presents dans categorieCompetence (app.js)
     savoirs: [...],       // connaissances/notions, libres
     metiers: [...]        // noms EXACTS de metiers (memes chaines que
                            // baseMetiers[].nom dans data/metiers.js)
   }

   Evolutivite : pour ajouter une action, ajouter une entree dans le
   tableau "items" de la categorie concernee (ou une nouvelle categorie
   directement dans CATALOGUE_ACTIONS_PRO). Pour enrichir une action
   existante, modifier ses tableaux savoirFaire/savoirEtre/savoirs/metiers.
   Aucune modification du code des composants n'est necessaire.

   IMPORTANT (migration progressive, TACHE 21A/21C) :
   - L'ancienne constante "dataActions" et l'ancien dictionnaire
     "mappingCompetences" (voir js/app.js) restent INCHANGES et
     continuent de fonctionner. Ils seront supprimes uniquement lors
     de la TACHE 21D, apres validation complete.
   - Les identifiants communs aux deux systemes (organiser, reparer,
     conseiller, vendre, transporter, nettoyer, former, soigner,
     cuisiner, construire, analyser, creer) remontent donc les memes
     competences via les deux systemes en parallele (sans doublon a
     l'affichage, la fonction ajouter() du moteur etant deduplicatrice).
   - Les metiers cites ici n'ont volontairement pas ete inventes pour
     les actions de la categorie Creation (aucun metier de ce type
     dans le referentiel des metiers actuel) : mieux vaut une liste
     vide qu'une association hasardeuse. Facilement complete plus tard.

   TACHE (fusion "Votre parcours", etape 1, 2026-09-02) : les 6 categories
   d'affichage sont regroupees en 4, par redistribution (jamais un
   fourre-tout "Autres") :
     - "Administration" (calculer, classer, saisir, communiquer_ecrit,
       archiver) -> "Organisation, gestion, administration"
     - "Cuisine" (cuisiner, 1 seule action) -> "Technique et fabrication" (famille scindee le 12/11/2026, consigne 262, en 4 : "Fabriquer et construire", "Reparer et entretenir", "Transport et logistique", "Surveiller, manipuler, programmer" ; aucun id ni aucune competence modifie)
     - 14/11/2026 (consigne 283) : "cuisiner" quitte "Fabriquer et construire" pour la famille "Cuisiner et servir" (cuisiner, servir, preparer_boissons : deux nouvelles actions, Denis ne trouvait ni le service ni la cuisine)
     - "Creation" -> reste seule, renommee "Creation et conception"
     - "Relationnel" -> inchange
   AUCUN id, AUCUN savoirFaire/savoirEtre/savoirs/metiers modifie : seule
   l'etiquette "categorie" (groupe + carte deplacee) change. Les lectures
   par id (moteur de competences, texteProfil) ne sont pas affectees.
   ============================================================ */

var CATALOGUE_ACTIONS_PRO = [
  {
    categorie: 'Organisation, gestion, administration',
    icone: '📋',
    items: [
      { id: 'organiser', label: 'Organiser, planifier', icon: '📋', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Planification', 'Gestion de projet'], savoirEtre: ['Coordination', 'Organisation', 'Gestion du temps'],
        savoirs: [], metiers: ['Chef d\'équipe', 'Assistant administratif'] },
      { id: 'gerer', label: 'Gérer', icon: '📊', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Gestion administrative', 'Gestion de projet'], savoirEtre: ['Organisation', 'Responsabilité'],
        savoirs: [], metiers: ['Comptable / Assistant comptable', 'Chef d\'équipe'] },
      { id: 'controler', label: 'Contrôler, diagnostiquer', icon: '🔍', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Diagnostic', 'Analyse de données'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Agent de production', 'Technicien de maintenance', 'Mécanicien automobile'] },
      { id: 'analyser', label: 'Analyser', icon: '📈', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Analyse de données', 'Raisonnement logique', 'Rédaction'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Comptable / Assistant comptable', 'Développeur informatique'] },
      { id: 'negocier', label: 'Négocier', icon: '🤝', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Négociation', 'Persuasion'], savoirEtre: ['Communication'],
        savoirs: [], metiers: ['Conseiller de vente', 'Chef d\'équipe'] },
      { id: 'calculer', label: 'Calculer', icon: '🧮', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Gestion financière'], savoirEtre: ['Rigueur'],
        savoirs: ['Bases de comptabilité'], metiers: ['Comptable / Assistant comptable'] },
      { id: 'classer', label: 'Classer, archiver', icon: '🗂', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Gestion administrative'], savoirEtre: ['Organisation', 'Rigueur'],
        savoirs: [], metiers: ['Assistant administratif', 'Secrétaire médicale'] },
      { id: 'saisir', label: 'Saisir', icon: '📑', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Bureautique'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Assistant administratif', 'Secrétaire médicale', 'Téléconseiller'] },
      { id: 'communiquer_ecrit', label: 'Communiquer par écrit', icon: '📧', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Rédaction', 'Bureautique'], savoirEtre: ['Communication'],
        savoirs: [], metiers: ['Assistant administratif', 'Secrétaire médicale'] },
      { id: 'gerer_stocks_acheter', label: 'Gérer des stocks, acheter', icon: '🏷️', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Gestion des stocks', 'Gestion financière'], savoirEtre: ['Rigueur', 'Organisation'],
        savoirs: [], metiers: ['Logisticien', 'Responsable de magasin', 'Préparateur de commandes / Magasinier'] },
      { id: 'piloter_projet', label: 'Piloter un projet ou un chantier', icon: '🚩', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Gestion de projet', 'Planification'], savoirEtre: ['Responsabilité', 'Coordination'],
        savoirs: [], metiers: ['Chef de chantier', 'Chef d\'équipe'] },
      { id: 'appliquer_consignes_securite', label: 'Appliquer les règles de sécurité', icon: '🦺', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Vigilance'], savoirEtre: ['Sécurité', 'Respect des règles', 'Respect des normes'],
        savoirs: ['Règles de sécurité'], metiers: ['Agent de production', 'Manœuvre / Aide de chantier', 'Agent de sécurité'] },
      { id: 'encadrer_animer', label: 'Encadrer ou animer un groupe', icon: '🧭', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Management', 'Animation'], savoirEtre: ['Leadership', 'Esprit d\'équipe', 'Responsabilité'],
        savoirs: [], metiers: ['Chef d\'équipe', 'Chef de chantier', 'Animateur', 'Éducateur sportif'] },
      { id: 'organiser_evenement', label: 'Organiser un événement, communiquer', icon: '🎪', categorie: 'Organisation, gestion, administration',
        savoirFaire: ['Planification', 'Animation'], savoirEtre: ['Communication', 'Organisation', 'Créativité'],
        savoirs: [], metiers: ['Animateur evenementiel', 'Community manager', 'Animateur'] }
    ]
  },
  {
    categorie: 'Relationnel',
    icone: '🤝',
    items: [
      { id: 'conseiller', label: 'Conseiller', icon: '💬', categorie: 'Relationnel',
        savoirFaire: ['Conseil'], savoirEtre: ['Communication', 'Pédagogie'],
        savoirs: [], metiers: ['Conseiller de vente', 'Agent d\'accueil'] },
      // TACHE (retour utilisateur 2026-09-20) : "Accompagner" est un verbe
      // trop generique (CIP, coach, educateur... autant que ADVF/AES) pour
      // porter un savoir-faire aussi specifique que "Soins" -- une personne
      // en insertion professionnelle qui coche cette carte tres naturelle
      // pour son metier n'a pas a se retrouver avec un savoir-faire de
      // soignant. Le signal "Soins" reste disponible et correct via des
      // cartes sans ambiguite : "Soigner" (ce meme catalogue), "Des
      // patients" (CATALOGUE_PERSONNES_MATERIELS_LIEUX), "Etablissement de
      // sante" (CATALOGUE_ENVIRONNEMENTS_TRAVAIL). Meme principe deja
      // applique a "Accueillir"/"Aider" ci-dessous : savoirFaire vide,
      // seulement des savoir-etre.
      { id: 'accompagner', label: 'Accompagner, aider', icon: '🤝', categorie: 'Relationnel',
        savoirFaire: [], savoirEtre: ['Empathie', 'Aide à la personne', 'Patience', 'Entraide'],
        savoirs: [], metiers: ['Assistant de vie aux familles (ADVF)', 'Accompagnant éducatif et social (AES)'] },
      { id: 'vendre', label: 'Vendre', icon: '🛒', categorie: 'Relationnel',
        savoirFaire: ['Négociation', 'Persuasion'], savoirEtre: ['Relation client'],
        savoirs: [], metiers: ['Conseiller de vente', 'Vendeur en alimentation'] },
      { id: 'former', label: 'Former', icon: '🎓', categorie: 'Relationnel',
        savoirFaire: ['Formation', 'Transmission'], savoirEtre: ['Pédagogie'],
        savoirs: [], metiers: ['Formateur / Éducateur', 'Animateur'] },
      { id: 'soigner', label: 'Soigner', icon: '❤️', categorie: 'Relationnel',
        savoirFaire: ['Soins', 'Précision'], savoirEtre: ['Empathie'],
        savoirs: ['Notions d\'anatomie et de premiers secours'], metiers: ['Aide-soignant', 'Infirmier'] },
      { id: 'accueillir', label: 'Accueillir', icon: '📞', categorie: 'Relationnel',
        savoirFaire: [], savoirEtre: ['Accueil', 'Communication', 'Sens du service'],
        savoirs: [], metiers: ['Agent d\'accueil', 'Réceptionniste en hôtellerie'] },
      { id: 'informer', label: 'Informer', icon: '📢', categorie: 'Relationnel',
        savoirFaire: ['Rédaction'], savoirEtre: ['Communication', 'Sens du service'],
        savoirs: [], metiers: ['Agent d\'accueil', 'Agent d\'accueil touristique'] },
      { id: 'expliquer_presenter', label: 'Expliquer, présenter à l\'oral', icon: '📽️', categorie: 'Relationnel',
        savoirFaire: ['Transmission'], savoirEtre: ['Communication', 'Pédagogie'],
        savoirs: [], metiers: ['Formateur / Éducateur', 'Guide touristique', 'Conseiller de vente'] },
      { id: 'encaisser', label: 'Encaisser, tenir une caisse', icon: '💶', categorie: 'Relationnel',
        savoirFaire: ['Gestion financière'], savoirEtre: ['Rigueur', 'Accueil'],
        savoirs: ['Encaissement'], metiers: ['Hôte de caisse', 'Conseiller de vente', 'Barman / Employé de café', 'Serveur en restauration', 'Vendeur en alimentation'] }
    ]
  },
  {
    categorie: 'Fabriquer et construire',
    icone: '🏗',
    items: [
      { id: 'construire', label: 'Construire', icon: '🏗', categorie: 'Fabriquer et construire',
        savoirFaire: ['Bâtiment', 'Lecture de plans', 'Travail manuel'], savoirEtre: [],
        savoirs: ['Normes de sécurité sur chantier'], metiers: ['Maçon', 'Manœuvre / Aide de chantier'] },
      { id: 'fabriquer', label: 'Fabriquer', icon: '⚙️', categorie: 'Fabriquer et construire',
        savoirFaire: ['Travail manuel', 'Technique', 'Précision'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Soudeur', 'Opérateur d\'usinage (commande numérique)'] },
      { id: 'monter', label: 'Monter', icon: '🔨', categorie: 'Fabriquer et construire',
        savoirFaire: ['Travail manuel', 'Technique', 'Précision'], savoirEtre: [],
        savoirs: [], metiers: ['Menuisier poseur', 'Plaquiste'] },
      { id: 'decouper', label: 'Découper', icon: '✂️', categorie: 'Fabriquer et construire',
        savoirFaire: ['Travail manuel', 'Précision'], savoirEtre: ['Sécurité'],
        savoirs: [], metiers: ['Boucher', 'Opérateur en transformation des viandes / conserverie'] },
      { id: 'installer', label: 'Installer', icon: '🔌', categorie: 'Fabriquer et construire',
        savoirFaire: ['Technique', 'Réparation'], savoirEtre: ['Sécurité'],
        savoirs: [], metiers: ['Électricien', 'Plombier'] },
      { id: 'amenager_espace', label: 'Aménager un espace', icon: '🪑', categorie: 'Fabriquer et construire',
        savoirFaire: ['Installation', 'Finition'], savoirEtre: ['Créativité', 'Organisation'],
        savoirs: [], metiers: ['Merchandiseur', 'Fleuriste', 'Ouvrier paysagiste / Jardinier'] },
      { id: 'utiliser_machines_outils', label: 'Utiliser des machines, des outils', icon: '🏭', categorie: 'Fabriquer et construire',
        savoirFaire: ['Technique', 'Précision'], savoirEtre: ['Sécurité', 'Rigueur'],
        savoirs: [], metiers: ['Agent de production', 'Opérateur d\'usinage (commande numérique)', 'Conducteur de ligne de production'] }
    ]
  },
  {
    categorie: 'Cuisiner et servir',
    icone: '🍽️',
    items: [
      { id: 'cuisiner', label: 'Cuisiner', icon: '🍳', categorie: 'Cuisiner et servir',
        savoirFaire: ['Cuisine'], savoirEtre: ['Créativité', 'Respect des normes'],
        savoirs: ['Règles d\'hygiène alimentaire (HACCP)'], metiers: ['Cuisinier / Commis de cuisine', 'Employé polyvalent de restauration / Aide de cuisine', 'Boulanger'] },
      { id: 'servir', label: 'Servir à table ou au comptoir', icon: '🍽️', categorie: 'Cuisiner et servir',
        savoirFaire: ['Service en salle', 'Relation client'], savoirEtre: ['Sens du service', 'Rapidité'],
        savoirs: ['Règles d\'hygiène alimentaire (HACCP)'], metiers: ['Serveur en restauration', 'Barman / Employé de café'] },
      { id: 'preparer_boissons', label: 'Préparer des boissons', icon: '☕', categorie: 'Cuisiner et servir',
        savoirFaire: ['Préparation de boissons'], savoirEtre: ['Sens du service', 'Rapidité'],
        savoirs: [], metiers: ['Barman / Employé de café'] }
    ]
  },
  {
    categorie: 'Réparer et entretenir',
    icone: '🔧',
    items: [
      { id: 'reparer', label: 'Réparer', icon: '🔧', categorie: 'Réparer et entretenir',
        savoirFaire: ['Diagnostic', 'Réparation', 'Maintenance'], savoirEtre: [],
        savoirs: [], metiers: ['Technicien de maintenance', 'Mécanicien automobile'] },
      { id: 'entretenir_maintenir', label: 'Entretenir, maintenir', icon: '🧰', categorie: 'Réparer et entretenir',
        savoirFaire: ['Maintenance', 'Entretien'], savoirEtre: ['Rigueur', 'Fiabilité'],
        savoirs: [], metiers: ['Technicien de maintenance', 'Agent de maintenance des bâtiments', 'Agent polyvalent de collectivite'] },
      { id: 'nettoyer', label: 'Nettoyer', icon: '🧹', categorie: 'Réparer et entretenir',
        savoirFaire: ['Hygiène', 'Entretien'], savoirEtre: ['Rigueur'],
        savoirs: ['Produits et dosages d\'entretien'], metiers: ['Agent d\'entretien', 'Agent de service hospitalier (ASH)'] },
      { id: 'trier_environnement', label: 'Trier, protéger l\'environnement', icon: '♻️', categorie: 'Réparer et entretenir',
        savoirFaire: ['Collecte'], savoirEtre: ['Respect des règles', 'Responsabilité'],
        savoirs: ['Règles de tri et de recyclage'], metiers: ['Agent de tri', 'Agent de collecte des dechets', 'Agent de propreté urbaine / Ripeur', 'Technicien de traitement des eaux'] },
      { id: 'cultiver_entretenir_plantes', label: 'Cultiver, entretenir des plantes', icon: '🌱', categorie: 'Réparer et entretenir',
        savoirFaire: ['Travail manuel', 'Entretien'], savoirEtre: ['Patience', 'Endurance'],
        savoirs: ['Notions de culture des plantes'], metiers: ['Ouvrier horticole / Maraîcher', 'Ouvrier paysagiste / Jardinier', 'Arboriculteur', 'Fleuriste'] }
    ]
  },
  {
    categorie: 'Transport et logistique',
    icone: '🚚',
    items: [
      { id: 'transporter', label: 'Transporter', icon: '🚚', categorie: 'Transport et logistique',
        savoirFaire: ['Logistique', 'Conduite'], savoirEtre: ['Respect des délais'],
        savoirs: ['Réglementation du transport routier'], metiers: ['Chauffeur-livreur', 'Cariste'] },
      { id: 'conduire', label: 'Conduire / Piloter', icon: '🚜', categorie: 'Transport et logistique',
        savoirFaire: ['Conduite'], savoirEtre: ['Sécurité', 'Autonomie'],
        savoirs: ['Code de la route'], metiers: ['Chauffeur routier', 'Conducteur d\'engins de chantier'] },
      { id: 'livrer', label: 'Livrer', icon: '📬', categorie: 'Transport et logistique',
        savoirFaire: ['Logistique', 'Conduite'], savoirEtre: ['Respect des délais', 'Fiabilité'],
        savoirs: [], metiers: ['Chauffeur-livreur', 'Livreur à vélo'] },
      { id: 'preparer_commandes', label: 'Préparer des commandes', icon: '📦', categorie: 'Transport et logistique',
        savoirFaire: ['Gestion des stocks', 'Logistique'], savoirEtre: ['Rigueur', 'Organisation'],
        savoirs: [], metiers: ['Préparateur de commandes / Magasinier', 'Cariste'] },
      { id: 'manutentionner_emballer', label: 'Manutentionner, emballer', icon: '📥', categorie: 'Transport et logistique',
        savoirFaire: ['Manutention', 'Logistique'], savoirEtre: ['Endurance', 'Rigueur'],
        savoirs: [], metiers: ['Manutentionnaire / Agent de quai', 'Employé libre-service', 'Préparateur de commandes / Magasinier'] }
    ]
  },
  {
    categorie: 'Surveiller, manipuler, programmer',
    icone: '🔬',
    items: [
      { id: 'surveiller_securiser', label: 'Surveiller, sécuriser', icon: '🔦', categorie: 'Surveiller, manipuler, programmer',
        savoirFaire: ['Surveillance', 'Vigilance'], savoirEtre: ['Sang-froid', 'Fiabilité'],
        savoirs: ['Règles de sécurité'], metiers: ['Agent de sécurité', 'Maître-nageur sauveteur', 'Gendarme'] },
      { id: 'reagir_urgence', label: 'Réagir à un imprévu, une urgence', icon: '🚨', categorie: 'Surveiller, manipuler, programmer',
        savoirFaire: ['Intervention'], savoirEtre: ['Sang-froid', 'Réactivité', 'Adaptabilité'],
        savoirs: ['Gestes de premiers secours'], metiers: ['Ambulancier / Auxiliaire ambulancier', 'Maître-nageur sauveteur', 'Agent de sécurité'] },
      { id: 'manipuler_produits', label: 'Manipuler, préparer des produits', icon: '🧪', categorie: 'Surveiller, manipuler, programmer',
        savoirFaire: ['Précision', 'Technique'], savoirEtre: ['Rigueur', 'Respect des normes'],
        savoirs: ['Règles d\'hygiène'], metiers: ['Opérateur de production chimique', 'Opérateur de production agroalimentaire', 'Préparateur en pharmacie'] },
      { id: 'rechercher_tester', label: 'Rechercher, tester', icon: '🔬', categorie: 'Surveiller, manipuler, programmer',
        savoirFaire: ['Analyse de données', 'Raisonnement logique', 'Observation'], savoirEtre: ['Rigueur', 'Persévérance'],
        savoirs: [], metiers: ['Technicien qualité', 'Développeur informatique'] },
      { id: 'programmer', label: 'Programmer', icon: '💻', categorie: 'Surveiller, manipuler, programmer',
        savoirFaire: ['Raisonnement logique', 'Technique'], savoirEtre: ['Rigueur', 'Autonomie'],
        savoirs: ['Langages de programmation'], metiers: ['Développeur informatique'] }
    ]
  },
  {
    categorie: 'Création et conception',
    icone: '🎨',
    items: [
      { id: 'creer', label: 'Créer', icon: '🎨', categorie: 'Création et conception',
        savoirFaire: ['Innovation', 'Expression artistique'], savoirEtre: ['Créativité'],
        savoirs: [], metiers: [] },
      { id: 'rediger', label: 'Rédiger', icon: '✍️', categorie: 'Création et conception',
        savoirFaire: ['Rédaction'], savoirEtre: ['Créativité'],
        savoirs: [], metiers: [] },
      { id: 'imaginer', label: 'Imaginer', icon: '💡', categorie: 'Création et conception',
        savoirFaire: ['Innovation'], savoirEtre: ['Créativité'],
        savoirs: [], metiers: [] },
      { id: 'dessiner', label: 'Dessiner, photographier', icon: '✏️', categorie: 'Création et conception',
        savoirFaire: ['Expression artistique'], savoirEtre: ['Créativité'],
        savoirs: [], metiers: [] },
      { id: 'concevoir', label: 'Concevoir', icon: '📐', categorie: 'Création et conception',
        savoirFaire: ['Innovation', 'Traçage de plans'], savoirEtre: ['Créativité', 'Rigueur'],
        savoirs: [], metiers: ['Développeur informatique', 'Graphiste', 'Ébéniste', 'Webmaster'] }
    ]
  }
];
