/* ============================================================
   metiers.js — Moteur de rapprochement métiers ERIP
   ------------------------------------------------------------
   Fichier autonome contenant :
   1. La base des fiches métiers (baseMetiers)
   2. Le moteur de score (rechercherMetiers)
   3. Le générateur d'affichage Bootstrap (genererHTMLMetiers)

   Le vocabulaire (activites, actions, environnement, valeurs,
   savoirFaire, savoirEtre) est aligné sur les identifiants et
   libellés de l'Assistant Parcours Professionnel :
   - activites : clients, machines, enfants, personnes_agees,
     collegues, seul, exterieur, magasin, bureau, deplacement
   - actions : organiser, reparer, conseiller, vendre, transporter,
     nettoyer, former, soigner, cuisiner, construire, analyser, creer
   - environnement : bureau, usine, route, domicile, magasin,
     exterieur, sante, cuisine
   - valeurs : stabilite, salaire, horaires_fixes, contact_humain,
     exterieur, evolution, autonomie, proximite

   Pour ajouter un métier : copier une fiche, adapter les champs.

   Chantier compétences (2026-09-16, docs/PLAN_COMPETENCES_2026-09-15.md
   étape 6) : avant d'inventer un nouveau libellé de savoirFaire ou de
   savoirEtre, vérifier d'abord dans data/competences.js (categorieCompetence)
   si un terme existant convient déjà -- même discipline que pour les
   identifiants activites/actions/environnement/valeurs ci-dessus. Mesuré :
   129 métiers très variés (21 secteurs) ne génèrent que 70 libellés
   distincts de savoirFaire/savoirEtre au total -- cette économie ne tient
   que si le vocabulaire existant est réutilisé en priorité, faute de quoi
   le référentiel se fragmente au même rythme que les savoirs (192 libellés
   distincts, quasiment un par métier -- normal pour une connaissance
   spécifique, à éviter pour un savoir-faire/savoir-être générique).
   scripts/checkCompetences.js détecte après coup les manquements probables
   à cette règle (terme absent proche d'un terme existant).

   Fusion 2026-09-15 : les 129 fiches vivent ici en dur (65 d'origine +
   63 issues de l'ancien data/referentielMetiersERIP.js + 1 issue de
   l'ancien data/metiersComplementaires.js, fichiers supprimés). Les
   commentaires de section ci-dessous ("---------- Nom ----------")
   viennent de ces anciens fichiers et marquent encore leur origine.
   ============================================================ */

const baseMetiers = [
  {
    id: "conseiller_vente", nom: "Conseiller de vente", rome: "D1214", secteur: "Commerce et vente",    activites: ["clients", "magasin", "collegues", "marchandises"],
    actions: ["vendre", "conseiller"],
    environnement: ["magasin"],
    valeurs: ["contact_humain", "evolution"],
    savoirFaire: ["Merchandising", "Gestion des stocks", "Négociation", "Persuasion", "Conseil"],
    savoirEtre: ["Relation client", "Communication", "Écoute", "Sens du service", "Accueil"],
    savoirs: ["Techniques de vente", "Connaissance des produits", "Encaissement"]
  },
  {
    id: "agent_accueil", nom: "Agent d'accueil", rome: "M1601", secteur: "Administration, gestion et bureau",    activites: ["clients", "bureau", "ordinateur", "documents"],
    actions: ["conseiller", "organiser"],
    environnement: ["bureau"],
    valeurs: ["contact_humain", "horaires_fixes"],
    savoirFaire: ["Bureautique", "Gestion administrative", "Conseil"],
    savoirEtre: ["Accueil", "Communication", "Écoute", "Patience", "Sens du service"],
    savoirs: ["Standard téléphonique", "Procédures d'accueil"]
  },
  {
    id: "teleconseiller", nom: "Téléconseiller", rome: "D1408", secteur: "Commerce et vente",    activites: ["clients", "bureau", "collegues", "ordinateur", "documents"],
    actions: ["conseiller", "vendre"],
    environnement: ["bureau"],
    valeurs: ["contact_humain", "horaires_fixes"],
    savoirFaire: ["Bureautique", "Négociation", "Persuasion", "Conseil"],
    savoirEtre: ["Relation client", "Communication", "Écoute", "Patience"],
    savoirs: ["Outils informatiques", "Scripts d'appel"]
  },
  {
    id: "employe_libre_service", nom: "Employé libre-service", rome: "D1507", secteur: "Commerce et vente",    activites: ["magasin", "seul", "collegues", "marchandises"],
    actions: ["organiser", "nettoyer"],
    environnement: ["magasin"],
    valeurs: ["stabilite", "horaires_fixes", "proximite"],
    savoirFaire: ["Merchandising", "Gestion des stocks", "Entretien"],
    savoirEtre: ["Rigueur", "Organisation", "Autonomie", "Endurance"],
    savoirs: ["Rotation des produits", "Règles d'hygiène"]
  },
  {
    id: "preparateur_commandes", nom: "Préparateur de commandes / Magasinier", rome: "N1103", secteur: "Transport et logistique",    activites: ["machines", "seul", "collegues", "marchandises"],
    actions: ["organiser", "transporter"],
    environnement: ["usine"],
    valeurs: ["stabilite", "autonomie", "salaire"],
    savoirFaire: ["Logistique", "Gestion des stocks", "Conduite", "Planification"],
    savoirEtre: ["Rigueur", "Organisation", "Autonomie", "Respect des délais"],
    savoirs: ["CACES", "Logiciels de gestion d'entrepôt"]
  },
  {
    id: "cariste", nom: "Cariste", rome: "N1101", secteur: "Transport et logistique",    activites: ["machines", "seul", "marchandises"],
    actions: ["transporter", "organiser"],
    environnement: ["usine"],
    valeurs: ["stabilite", "salaire"],
    savoirFaire: ["Conduite", "Logistique", "Gestion des stocks"],
    savoirEtre: ["Rigueur", "Sécurité", "Autonomie"],
    savoirs: ["CACES 1-3-5", "Règles de sécurité entrepôt"]
  },
  {
    id: "chauffeur_livreur", nom: "Chauffeur-livreur", rome: "N4105", secteur: "Transport et logistique",    activites: ["deplacement", "seul", "clients", "marchandises", "vehicules"],
    actions: ["transporter", "organiser"],
    environnement: ["route"],
    valeurs: ["autonomie", "proximite"],
    savoirFaire: ["Conduite", "Logistique", "Planification"],
    savoirEtre: ["Autonomie", "Gestion du temps", "Respect des délais", "Sens du service"],
    savoirs: ["Code de la route", "Lecture d'itinéraires"]
  },
  {
    id: "chauffeur_routier", nom: "Chauffeur routier", rome: "N4101", secteur: "Transport et logistique",    activites: ["deplacement", "seul", "vehicules"],
    actions: ["transporter"],
    environnement: ["route"],
    valeurs: ["autonomie", "salaire"],
    savoirFaire: ["Conduite", "Logistique"],
    savoirEtre: ["Autonomie", "Fiabilité", "Respect des délais"],
    savoirs: ["Code de la route", "Réglementation des transports", "Permis C"]
  },
  {
    id: "agent_entretien", nom: "Agent d'entretien", rome: "K2204", secteur: "Propreté et gestion des déchets",    activites: ["seul", "outils"],
    actions: ["nettoyer", "organiser"],
    environnement: ["bureau", "domicile"],
    valeurs: ["autonomie", "horaires_fixes", "proximite"],
    savoirFaire: ["Hygiène", "Entretien"],
    savoirEtre: ["Rigueur", "Autonomie", "Organisation", "Fiabilité"],
    savoirs: ["Protocoles de nettoyage", "Sécurité des produits"]
  },
  {
    id: "advf", nom: "Assistant de vie aux familles (ADVF)", rome: "K1302", secteur: "Social et services à la personne",    activites: ["personnes_agees", "seul", "deplacement"],
    actions: ["soigner", "cuisiner", "nettoyer"],
    environnement: ["domicile"],
    valeurs: ["contact_humain", "proximite"],
    savoirFaire: ["Soins", "Hygiène", "Cuisine", "Entretien"],
    savoirEtre: ["Empathie", "Aide à la personne", "Écoute", "Patience", "Bienveillance"],
    savoirs: ["Gestes de premiers secours", "Manutention des personnes"]
  },
  {
    id: "aide_soignant", nom: "Aide-soignant", rome: "J1501", secteur: "Santé et soins",    activites: ["personnes_agees", "collegues"],
    actions: ["soigner"],
    environnement: ["sante"],
    valeurs: ["contact_humain", "stabilite"],
    savoirFaire: ["Soins", "Hygiène", "Précision"],
    savoirEtre: ["Empathie", "Écoute", "Bienveillance", "Travail en équipe"],
    savoirs: ["Protocoles de soins", "Hygiène hospitalière", "Gestes de premiers secours"]
  },
  {
    id: "infirmier", nom: "Infirmier", rome: "J1506", secteur: "Santé et soins",    activites: ["personnes_agees", "collegues"],
    actions: ["soigner", "organiser", "analyser"],
    environnement: ["sante"],
    valeurs: ["contact_humain", "evolution", "salaire"],
    savoirFaire: ["Soins", "Précision", "Planification"],
    savoirEtre: ["Empathie", "Rigueur", "Responsabilité", "Travail en équipe"],
    savoirs: ["Pharmacologie", "Protocoles médicaux"]
  },
  {
    id: "auxiliaire_petite_enfance", nom: "Auxiliaire petite enfance", rome: "K1303", secteur: "Social et services à la personne",    activites: ["enfants", "collegues"],
    actions: ["soigner", "former", "creer"],
    environnement: ["sante"],
    valeurs: ["contact_humain", "horaires_fixes"],
    savoirFaire: ["Soins", "Hygiène", "Transmission"],
    savoirEtre: ["Patience", "Bienveillance", "Pédagogie", "Créativité", "Sécurité"],
    savoirs: ["Développement de l'enfant", "Règles de sécurité"]
  },
  {
    id: "animateur", nom: "Animateur", rome: "G1202", secteur: "Sport, animation et loisirs",    activites: ["enfants", "collegues", "exterieur"],
    actions: ["former", "creer", "organiser"],
    environnement: ["exterieur"],
    valeurs: ["contact_humain", "evolution"],
    savoirFaire: ["Transmission", "Gestion de projet", "Planification"],
    savoirEtre: ["Pédagogie", "Créativité", "Communication", "Adaptabilité", "Esprit d'équipe"],
    savoirs: ["Réglementation ACM", "Techniques d'animation"]
  },
  {
    id: "formateur", nom: "Formateur / Éducateur", rome: "K2111", secteur: "Éducation et formation",    activites: ["enfants", "collegues", "bureau"],
    actions: ["former", "conseiller", "organiser"],
    environnement: ["bureau"],
    valeurs: ["contact_humain", "evolution"],
    savoirFaire: ["Formation", "Transmission", "Conseil", "Rédaction"],
    savoirEtre: ["Pédagogie", "Patience", "Communication", "Écoute"],
    savoirs: ["Ingénierie pédagogique", "Techniques d'évaluation"]
  },
  {
    id: "serveur", nom: "Serveur en restauration", rome: "G1803", secteur: "Hôtellerie, restauration et tourisme",    activites: ["clients", "collegues"],
    actions: ["vendre", "conseiller"],
    environnement: ["cuisine"],
    valeurs: ["contact_humain"],
    savoirFaire: ["Négociation", "Conseil"],
    savoirEtre: ["Sens du service", "Communication", "Endurance", "Adaptabilité", "Accueil"],
    savoirs: ["Hygiène alimentaire (HACCP)", "Techniques de service", "Encaissement"]
  },
  {
    id: "cuisinier", nom: "Cuisinier / Commis de cuisine", rome: "G1602", secteur: "Hôtellerie, restauration et tourisme",    activites: ["collegues", "machines"],
    actions: ["cuisiner", "organiser"],
    environnement: ["cuisine"],
    valeurs: ["evolution"],
    savoirFaire: ["Cuisine", "Hygiène", "Précision", "Planification"],
    savoirEtre: ["Rigueur", "Créativité", "Esprit d'équipe", "Endurance", "Respect des normes"],
    savoirs: ["Techniques culinaires", "Hygiène alimentaire (HACCP)"]
  },
  {
    id: "agent_production", nom: "Agent de production", rome: "H2909", secteur: "Industrie, production et énergie",    activites: ["machines", "collegues"],
    actions: ["construire", "analyser", "organiser"],
    environnement: ["usine"],
    valeurs: ["stabilite", "horaires_fixes", "salaire"],
    savoirFaire: ["Technique", "Précision", "Maintenance"],
    savoirEtre: ["Rigueur", "Esprit d'équipe", "Respect des normes", "Fiabilité"],
    savoirs: ["Règles de sécurité", "Procédures qualité"]
  },
  {
    id: "technicien_maintenance", nom: "Technicien de maintenance", rome: "I1304", secteur: "Industrie, production et énergie",    activites: ["machines", "seul", "deplacement", "outils"],
    actions: ["reparer", "analyser"],
    environnement: ["usine"],
    valeurs: ["autonomie", "evolution", "salaire"],
    savoirFaire: ["Diagnostic", "Réparation", "Maintenance", "Technique", "Lecture de plans"],
    savoirEtre: ["Autonomie", "Rigueur", "Adaptabilité"],
    savoirs: ["Lecture de schémas", "Habilitations électriques"]
  },
  {
    id: "mecanicien", nom: "Mécanicien automobile", rome: "I1604", secteur: "Mécanique et automobile",    activites: ["machines", "seul", "vehicules", "outils"],
    actions: ["reparer", "analyser"],
    environnement: ["usine"],
    valeurs: ["stabilite", "autonomie"],
    savoirFaire: ["Diagnostic", "Réparation", "Maintenance", "Technique", "Précision"],
    savoirEtre: ["Rigueur", "Autonomie", "Raisonnement logique"],
    savoirs: ["Mécanique automobile", "Électronique embarquée"]
  },
  {
    id: "macon", nom: "Maçon", rome: "F1703", secteur: "Bâtiment et travaux publics",    activites: ["exterieur", "collegues", "machines", "outils"],
    actions: ["construire"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "salaire"],
    savoirFaire: ["Bâtiment", "Lecture de plans", "Travail manuel"],
    savoirEtre: ["Endurance", "Esprit d'équipe", "Sécurité", "Rigueur"],
    savoirs: ["Normes de construction", "Sécurité sur chantier"]
  },
  {
    id: "peintre", nom: "Peintre en bâtiment", rome: "F1606", secteur: "Bâtiment et travaux publics",    activites: ["seul", "exterieur", "outils"],
    actions: ["construire", "creer"],
    environnement: ["exterieur", "domicile"],
    valeurs: ["autonomie", "proximite"],
    savoirFaire: ["Bâtiment", "Travail manuel", "Précision"],
    savoirEtre: ["Rigueur", "Autonomie", "Créativité"],
    savoirs: ["Types de peintures", "Préparation des surfaces"]
  },
  {
    id: "plombier", nom: "Plombier", rome: "F1603", secteur: "Bâtiment et travaux publics",    activites: ["seul", "deplacement", "clients", "outils"],
    actions: ["reparer", "construire"],
    environnement: ["domicile", "exterieur"],
    valeurs: ["autonomie", "proximite", "salaire"],
    savoirFaire: ["Réparation", "Diagnostic", "Lecture de plans", "Travail manuel"],
    savoirEtre: ["Autonomie", "Rigueur", "Sens du service"],
    savoirs: ["Normes de plomberie", "Lecture de plans hydrauliques"]
  },
  {
    id: "electricien", nom: "Électricien", rome: "F1602", secteur: "Bâtiment et travaux publics",    activites: ["seul", "deplacement", "machines", "outils"],
    actions: ["reparer", "construire", "analyser"],
    environnement: ["exterieur", "domicile"],
    valeurs: ["autonomie", "evolution", "salaire"],
    savoirFaire: ["Technique", "Lecture de plans", "Diagnostic", "Précision"],
    savoirEtre: ["Rigueur", "Sécurité", "Autonomie", "Raisonnement logique"],
    savoirs: ["Normes électriques", "Lecture de schémas électriques", "Habilitations"]
  },
  {
    id: "paysagiste", nom: "Ouvrier paysagiste / Jardinier", rome: "A1203", secteur: "Agriculture, nature et espaces verts",    activites: ["exterieur", "seul", "machines", "outils"],
    actions: ["creer", "nettoyer", "construire"],
    environnement: ["exterieur", "espaces_verts"],
    valeurs: ["exterieur", "autonomie", "proximite"],
    savoirFaire: ["Entretien", "Travail manuel", "Conduite"],
    savoirEtre: ["Endurance", "Autonomie", "Créativité", "Adaptabilité"],
    savoirs: ["Végétaux", "Matériel motorisé"]
  },
  {
    id: "ouvrier_agricole", nom: "Ouvrier agricole / viticole", rome: "A1405", secteur: "Agriculture, nature et espaces verts",    activites: ["exterieur", "collegues", "machines", "outils"],
    actions: ["transporter", "organiser", "nettoyer"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "proximite"],
    savoirFaire: ["Travail manuel", "Conduite", "Entretien"],
    savoirEtre: ["Endurance", "Adaptabilité", "Esprit d'équipe"],
    savoirs: ["Cycle de la vigne", "Matériel agricole"]
  },
  {
    id: "agent_securite", nom: "Agent de sécurité", rome: "K2503", secteur: "Sécurité",    activites: ["seul", "magasin", "clients"],
    actions: ["analyser", "organiser"],
    environnement: ["magasin", "bureau"],
    valeurs: ["stabilite", "horaires_fixes"],
    savoirFaire: ["Planification"],
    savoirEtre: ["Sécurité", "Rigueur", "Fiabilité", "Responsabilité"],
    savoirs: ["CQP APS", "Consignes incendie", "Gestes de premiers secours"]
  },
  {
    id: "assistant_administratif", nom: "Assistant administratif", rome: "M1607", secteur: "Administration, gestion et bureau",    activites: ["bureau", "seul", "collegues", "ordinateur", "documents"],
    actions: ["organiser", "analyser"],
    environnement: ["bureau"],
    valeurs: ["stabilite", "horaires_fixes"],
    savoirFaire: ["Bureautique", "Gestion administrative", "Rédaction", "Planification"],
    savoirEtre: ["Organisation", "Rigueur", "Communication", "Fiabilité"],
    savoirs: ["Outils bureautiques", "Orthographe", "Procédures administratives"]
  },
  {
    id: "comptable", nom: "Comptable / Assistant comptable", rome: "M1203", secteur: "Administration, gestion et bureau",    activites: ["bureau", "seul", "ordinateur", "documents"],
    actions: ["analyser", "organiser"],
    environnement: ["bureau"],
    valeurs: ["stabilite", "salaire", "evolution"],
    savoirFaire: ["Analyse de données", "Gestion financière", "Bureautique", "Rédaction"],
    savoirEtre: ["Rigueur", "Organisation", "Raisonnement logique"],
    savoirs: ["Comptabilité générale", "Droit fiscal", "Logiciels comptables"]
  },
  {
    id: "chef_equipe", nom: "Chef d'équipe", rome: "M1302", secteur: "Administration, gestion et bureau",    activites: ["collegues", "machines", "documents"],
    actions: ["organiser", "former", "analyser"],
    environnement: ["usine", "exterieur"],
    valeurs: ["evolution", "salaire"],
    savoirFaire: ["Management", "Gestion de projet", "Planification", "Formation"],
    savoirEtre: ["Leadership", "Coordination", "Responsabilité", "Travail en équipe"],
    savoirs: ["Règles de sécurité", "Gestion de planning"]
  },
  {
    id: "developpeur", nom: "Développeur informatique", rome: "M1855", secteur: "Informatique et numérique",    activites: ["bureau", "seul", "collegues", "ordinateur"],
    actions: ["analyser", "creer"],
    environnement: ["bureau"],
    valeurs: ["evolution", "autonomie", "salaire"],
    savoirFaire: ["Analyse de données", "Innovation", "Rédaction", "Gestion de projet"],
    savoirEtre: ["Raisonnement logique", "Autonomie", "Rigueur", "Apprentissage"],
    savoirs: ["Langages de programmation", "Bases de données", "Méthodes agiles"]
  },
  {
    id: "employe_polyvalent_restauration", nom: "Employé polyvalent de restauration / Aide de cuisine", rome: "G1603", secteur: "Hôtellerie, restauration et tourisme",    activites: ["clients", "collegues"],
    actions: ["cuisiner", "nettoyer", "organiser"],
    environnement: ["cuisine"],
    valeurs: ["contact_humain", "proximite"],
    savoirFaire: ["Cuisine", "Hygiène", "Entretien"],
    savoirEtre: ["Adaptabilité", "Esprit d'équipe", "Endurance", "Sens du service"],
    savoirs: ["Hygiène alimentaire (HACCP)", "Préparation froide et chaude"]
  },
  {
    id: "plongeur", nom: "Plongeur en restauration", rome: "G1605", secteur: "Hôtellerie, restauration et tourisme",    activites: ["collegues", "seul"],
    actions: ["nettoyer", "organiser"],
    environnement: ["cuisine"],
    valeurs: ["proximite", "stabilite"],
    savoirFaire: ["Hygiène", "Entretien"],
    savoirEtre: ["Endurance", "Rigueur", "Esprit d'équipe"],
    savoirs: ["Hygiène alimentaire (HACCP)", "Matériel de plonge"]
  },
  {
    id: "receptionniste", nom: "Réceptionniste en hôtellerie", rome: "G1703", secteur: "Hôtellerie, restauration et tourisme",    activites: ["clients", "bureau", "ordinateur", "documents"],
    actions: ["conseiller", "organiser"],
    environnement: ["bureau"],
    valeurs: ["contact_humain", "evolution"],
    savoirFaire: ["Bureautique", "Gestion administrative", "Conseil", "Planification"],
    savoirEtre: ["Accueil", "Communication", "Sens du service", "Adaptabilité"],
    savoirs: ["Anglais et langues étrangères", "Logiciels de réservation", "Encaissement"]
  },
  {
    id: "employe_etage", nom: "Employé d'étage en hôtellerie", rome: "G1501", secteur: "Hôtellerie, restauration et tourisme",    activites: ["seul", "collegues"],
    actions: ["nettoyer", "organiser"],
    environnement: ["bureau"],
    valeurs: ["horaires_fixes", "proximite"],
    savoirFaire: ["Hygiène", "Entretien"],
    savoirEtre: ["Rigueur", "Autonomie", "Fiabilité"],
    savoirs: ["Protocoles de nettoyage", "Présentation des chambres"]
  },
  {
    id: "barman", nom: "Barman / Employé de café", rome: "G1801", secteur: "Hôtellerie, restauration et tourisme",    activites: ["clients", "collegues"],
    actions: ["vendre", "conseiller", "cuisiner"],
    environnement: ["cuisine"],
    valeurs: ["contact_humain"],
    savoirFaire: ["Cuisine", "Négociation"],
    savoirEtre: ["Sens du service", "Communication", "Endurance", "Accueil"],
    savoirs: ["Encaissement", "Règles d'hygiène", "Préparation des boissons"]
  },
  {
    id: "accueil_touristique", nom: "Agent d'accueil touristique", rome: "G1101", secteur: "Hôtellerie, restauration et tourisme",    activites: ["clients", "bureau", "exterieur", "ordinateur"],
    actions: ["conseiller", "organiser"],
    environnement: ["bureau", "exterieur"],
    valeurs: ["contact_humain", "exterieur"],
    savoirFaire: ["Conseil", "Planification", "Bureautique"],
    savoirEtre: ["Accueil", "Communication", "Adaptabilité", "Écoute"],
    savoirs: ["Patrimoine local", "Anglais et langues étrangères"]
  },
  {
    id: "ouvrier_chai", nom: "Ouvrier de chai / Agent de cave", rome: "A1413", secteur: "Agriculture, nature et espaces verts",    activites: ["machines", "collegues", "exterieur"],
    actions: ["organiser", "nettoyer", "analyser"],
    environnement: ["usine", "exterieur"],
    valeurs: ["proximite", "stabilite"],
    savoirFaire: ["Technique", "Hygiène", "Précision", "Travail manuel"],
    savoirEtre: ["Rigueur", "Esprit d'équipe", "Endurance"],
    savoirs: ["Vinification", "Hygiène alimentaire", "CACES"]
  },
  {
    id: "ouvrier_horticole", nom: "Ouvrier horticole / Maraîcher", rome: "A1414", secteur: "Agriculture, nature et espaces verts",    activites: ["exterieur", "seul", "collegues", "outils"],
    actions: ["creer", "nettoyer", "organiser"],
    environnement: ["exterieur", "espaces_verts"],
    valeurs: ["exterieur", "proximite"],
    savoirFaire: ["Travail manuel", "Entretien"],
    savoirEtre: ["Endurance", "Rigueur", "Autonomie"],
    savoirs: ["Végétaux et cycles de culture", "Techniques de plantation"]
  },
  {
    id: "conducteur_engins_agricoles", nom: "Conducteur d'engins agricoles", rome: "A1101", secteur: "Agriculture, nature et espaces verts",    activites: ["machines", "exterieur", "seul", "vehicules"],
    actions: ["transporter", "reparer"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "autonomie"],
    savoirFaire: ["Conduite", "Maintenance", "Travail manuel"],
    savoirEtre: ["Autonomie", "Rigueur", "Adaptabilité"],
    savoirs: ["Matériel agricole", "Règles de sécurité"]
  },
  {
    id: "operateur_agroalimentaire", nom: "Opérateur de production agroalimentaire", rome: "H2102", secteur: "Industrie, production et énergie",    activites: ["machines", "collegues"],
    actions: ["cuisiner", "organiser", "analyser"],
    environnement: ["usine"],
    valeurs: ["stabilite", "horaires_fixes"],
    savoirFaire: ["Technique", "Hygiène", "Précision"],
    savoirEtre: ["Rigueur", "Esprit d'équipe", "Respect des normes"],
    savoirs: ["Hygiène alimentaire (HACCP)", "Procédures qualité"]
  },
  {
    id: "operateur_decoupe", nom: "Opérateur en transformation des viandes / conserverie", rome: "H2101", secteur: "Industrie, production et énergie",    activites: ["machines", "collegues"],
    actions: ["cuisiner", "analyser"],
    environnement: ["usine"],
    valeurs: ["stabilite", "salaire"],
    savoirFaire: ["Précision", "Hygiène", "Travail manuel", "Technique"],
    savoirEtre: ["Rigueur", "Endurance", "Respect des normes"],
    savoirs: ["Découpe", "Chaîne du froid", "Traçabilité"]
  },
  {
    id: "operateur_chimie", nom: "Opérateur de production chimique", rome: "H2301", secteur: "Industrie, production et énergie",    activites: ["machines", "collegues"],
    actions: ["analyser", "organiser"],
    environnement: ["usine"],
    valeurs: ["salaire", "stabilite", "evolution"],
    savoirFaire: ["Technique", "Précision", "Analyse de données"],
    savoirEtre: ["Rigueur", "Sécurité", "Respect des normes"],
    savoirs: ["Procédés chimiques", "Règles de sécurité", "CACES"]
  },
  {
    id: "soudeur", nom: "Soudeur", rome: "H2913", secteur: "Industrie, production et énergie",    activites: ["machines", "seul"],
    actions: ["construire", "reparer"],
    environnement: ["usine", "exterieur"],
    valeurs: ["salaire", "stabilite"],
    savoirFaire: ["Technique", "Précision", "Travail manuel", "Lecture de plans"],
    savoirEtre: ["Rigueur", "Autonomie"],
    savoirs: ["Procédés de soudage", "Lecture de plans", "Règles de sécurité"]
  },
  {
    id: "usineur", nom: "Opérateur d'usinage (commande numérique)", rome: "H2903", secteur: "Industrie, production et énergie",    activites: ["machines", "seul"],
    actions: ["construire", "analyser"],
    environnement: ["usine"],
    valeurs: ["salaire", "evolution"],
    savoirFaire: ["Technique", "Précision", "Lecture de plans"],
    savoirEtre: ["Rigueur", "Autonomie", "Raisonnement logique"],
    savoirs: ["Machines à commande numérique", "Métrologie"]
  },
  {
    id: "ash", nom: "Agent de service hospitalier (ASH)", rome: "J1301", secteur: "Santé et soins",    activites: ["personnes_agees", "collegues", "seul"],
    actions: ["nettoyer", "organiser"],
    environnement: ["sante"],
    valeurs: ["stabilite", "contact_humain"],
    savoirFaire: ["Hygiène", "Entretien"],
    savoirEtre: ["Rigueur", "Bienveillance", "Esprit d'équipe"],
    savoirs: ["Hygiène hospitalière", "Protocoles de bionettoyage"]
  },
  {
    id: "aes", nom: "Accompagnant éducatif et social (AES)", rome: "K1301", secteur: "Social et services à la personne",    activites: ["personnes_agees", "collegues"],
    actions: ["soigner", "former"],
    environnement: ["sante", "domicile"],
    valeurs: ["contact_humain", "stabilite"],
    savoirFaire: ["Soins", "Transmission"],
    savoirEtre: ["Empathie", "Aide à la personne", "Patience", "Bienveillance", "Écoute"],
    savoirs: ["Connaissance du handicap", "Gestes de premiers secours"]
  },
  {
    id: "menage_domicile", nom: "Employé de ménage à domicile", rome: "K1304", secteur: "Social et services à la personne",    activites: ["seul"],
    actions: ["nettoyer", "organiser"],
    environnement: ["domicile"],
    valeurs: ["proximite", "autonomie", "horaires_fixes"],
    savoirFaire: ["Entretien", "Hygiène", "Cuisine"],
    savoirEtre: ["Autonomie", "Fiabilité", "Rigueur"],
    savoirs: ["Produits d'entretien", "Repassage"]
  },
  {
    id: "secretaire_medicale", nom: "Secrétaire médicale", rome: "M1609", secteur: "Santé et soins",    activites: ["bureau", "clients", "ordinateur", "documents"],
    actions: ["organiser", "conseiller"],
    environnement: ["sante", "bureau"],
    valeurs: ["stabilite", "horaires_fixes"],
    savoirFaire: ["Bureautique", "Gestion administrative", "Rédaction", "Planification"],
    savoirEtre: ["Accueil", "Communication", "Écoute", "Organisation"],
    savoirs: ["Terminologie médicale", "Logiciels de gestion de cabinet"]
  },
  {
    id: "ambulancier", nom: "Ambulancier / Auxiliaire ambulancier", rome: "J1305", secteur: "Santé et soins",    activites: ["deplacement", "personnes_agees", "collegues", "vehicules"],
    actions: ["transporter", "soigner"],
    environnement: ["route", "sante"],
    valeurs: ["contact_humain", "autonomie"],
    savoirFaire: ["Conduite", "Soins"],
    savoirEtre: ["Empathie", "Sécurité", "Sens du service"],
    savoirs: ["Gestes d'urgence", "Code de la route", "Diplôme d'État d'ambulancier"]
  },
  {
    id: "hote_caisse", nom: "Hôte de caisse", rome: "D1505", secteur: "Commerce et vente",    activites: ["clients", "magasin", "marchandises"],
    actions: ["vendre", "organiser"],
    environnement: ["magasin"],
    valeurs: ["contact_humain", "horaires_fixes", "proximite"],
    savoirFaire: ["Conseil"],
    savoirEtre: ["Accueil", "Relation client", "Rigueur", "Patience"],
    savoirs: ["Encaissement", "Rendu de monnaie"]
  },
  {
    id: "vendeur_alimentation", nom: "Vendeur en alimentation", rome: "D1106", secteur: "Commerce et vente",    activites: ["clients", "magasin", "marchandises"],
    actions: ["vendre", "conseiller"],
    environnement: ["magasin"],
    valeurs: ["contact_humain", "proximite"],
    savoirFaire: ["Conseil", "Hygiène"],
    savoirEtre: ["Accueil", "Sens du service", "Communication"],
    savoirs: ["Hygiène alimentaire", "Encaissement", "Produits du terroir"]
  },
  {
    id: "boulanger", nom: "Boulanger", rome: "D1102", secteur: "Métiers de bouche (artisanat)",    activites: ["seul", "machines"],
    actions: ["cuisiner", "creer"],
    environnement: ["cuisine", "magasin"],
    valeurs: ["autonomie", "proximite"],
    savoirFaire: ["Cuisine", "Précision", "Travail manuel"],
    savoirEtre: ["Rigueur", "Créativité", "Endurance"],
    savoirs: ["Panification", "Hygiène alimentaire", "Fermentation"]
  },
  {
    id: "boucher", nom: "Boucher", rome: "D1101", secteur: "Métiers de bouche (artisanat)",    activites: ["clients", "magasin", "machines"],
    actions: ["cuisiner", "vendre", "conseiller"],
    environnement: ["magasin"],
    valeurs: ["proximite", "salaire"],
    savoirFaire: ["Précision", "Travail manuel", "Hygiène", "Conseil"],
    savoirEtre: ["Rigueur", "Relation client", "Sens du service"],
    savoirs: ["Découpe des viandes", "Chaîne du froid", "Traçabilité"]
  },
  {
    id: "coiffeur", nom: "Coiffeur", rome: "D1202", secteur: "Coiffure et esthétique",    activites: ["clients"],
    actions: ["creer", "conseiller", "vendre"],
    environnement: ["magasin"],
    valeurs: ["contact_humain", "proximite"],
    savoirFaire: ["Précision", "Conseil"],
    savoirEtre: ["Créativité", "Relation client", "Écoute", "Communication"],
    savoirs: ["Techniques de coiffure", "Colorimétrie", "Hygiène"]
  },
  {
    id: "manoeuvre_btp", nom: "Manœuvre / Aide de chantier", rome: "F1704", secteur: "Bâtiment et travaux publics",    activites: ["exterieur", "collegues", "outils"],
    actions: ["construire", "transporter", "nettoyer"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "salaire"],
    savoirFaire: ["Travail manuel", "Bâtiment"],
    savoirEtre: ["Endurance", "Esprit d'équipe", "Sécurité"],
    savoirs: ["Sécurité sur chantier", "Outillage"]
  },
  {
    id: "menuisier_poseur", nom: "Menuisier poseur", rome: "F1607", secteur: "Bâtiment et travaux publics",    activites: ["seul", "deplacement", "clients", "outils"],
    actions: ["construire", "reparer"],
    environnement: ["domicile", "exterieur"],
    valeurs: ["autonomie", "proximite"],
    savoirFaire: ["Travail manuel", "Précision", "Lecture de plans", "Bâtiment"],
    savoirEtre: ["Rigueur", "Autonomie", "Sens du service"],
    savoirs: ["Menuiseries et fermetures", "Prise de mesures"]
  },
  {
    id: "plaquiste", nom: "Plaquiste", rome: "F1604", secteur: "Bâtiment et travaux publics",    activites: ["seul", "collegues", "outils"],
    actions: ["construire"],
    environnement: ["exterieur", "domicile"],
    valeurs: ["autonomie", "salaire"],
    savoirFaire: ["Bâtiment", "Travail manuel", "Précision", "Lecture de plans"],
    savoirEtre: ["Rigueur", "Autonomie"],
    savoirs: ["Isolation", "Matériaux de construction sèche"]
  },
  {
    id: "couvreur", nom: "Couvreur", rome: "F1610", secteur: "Bâtiment et travaux publics",    activites: ["exterieur", "collegues", "outils"],
    actions: ["construire", "reparer"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "salaire"],
    savoirFaire: ["Bâtiment", "Travail manuel", "Lecture de plans"],
    savoirEtre: ["Endurance", "Sécurité", "Rigueur"],
    savoirs: ["Matériaux de couverture", "Travail en hauteur", "Zinguerie"]
  },
  {
    id: "conducteur_engins_chantier", nom: "Conducteur d'engins de chantier", rome: "F1302", secteur: "Bâtiment et travaux publics",    activites: ["machines", "exterieur", "vehicules"],
    actions: ["construire", "transporter"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "salaire"],
    savoirFaire: ["Conduite", "Technique", "Précision"],
    savoirEtre: ["Sécurité", "Rigueur", "Autonomie"],
    savoirs: ["CACES engins de chantier", "Lecture de plans", "Sécurité sur chantier"]
  },
  {
    id: "agent_maintenance_batiment", nom: "Agent de maintenance des bâtiments", rome: "I1203", secteur: "Industrie, production et énergie",    activites: ["seul", "deplacement", "machines", "outils"],
    actions: ["reparer", "construire", "organiser"],
    environnement: ["bureau", "domicile"],
    valeurs: ["autonomie", "stabilite"],
    savoirFaire: ["Réparation", "Maintenance", "Diagnostic", "Travail manuel", "Bâtiment"],
    savoirEtre: ["Autonomie", "Adaptabilité", "Sens du service"],
    savoirs: ["Électricité de base", "Plomberie de base", "Règles de sécurité"]
  },
  {
    id: "carrossier", nom: "Carrossier-peintre automobile", rome: "I1606", secteur: "Mécanique et automobile",    activites: ["machines", "seul", "vehicules", "outils"],
    actions: ["reparer", "creer"],
    environnement: ["usine"],
    valeurs: ["stabilite", "salaire"],
    savoirFaire: ["Réparation", "Précision", "Travail manuel", "Diagnostic"],
    savoirEtre: ["Rigueur", "Créativité"],
    savoirs: ["Peinture automobile", "Matériaux composites"]
  },
  {
    id: "conducteur_bus", nom: "Conducteur de transport en commun", rome: "N4103", secteur: "Transport et logistique",    activites: ["clients", "deplacement", "seul", "vehicules"],
    actions: ["transporter"],
    environnement: ["route"],
    valeurs: ["stabilite", "horaires_fixes", "contact_humain"],
    savoirFaire: ["Conduite"],
    savoirEtre: ["Accueil", "Patience", "Sécurité", "Fiabilité"],
    savoirs: ["Permis D", "Réglementation du transport de personnes"]
  },
  {
    id: "manutentionnaire", nom: "Manutentionnaire / Agent de quai", rome: "N1105", secteur: "Transport et logistique",    activites: ["collegues", "seul", "marchandises"],
    actions: ["transporter", "organiser"],
    environnement: ["usine"],
    valeurs: ["salaire", "stabilite"],
    savoirFaire: ["Logistique", "Travail manuel"],
    savoirEtre: ["Endurance", "Esprit d'équipe", "Rigueur"],
    savoirs: ["Gestes et postures", "Règles de sécurité"]
  },
  {
    id: "agent_proprete_urbaine", nom: "Agent de propreté urbaine / Ripeur", rome: "K2303", secteur: "Propreté et gestion des déchets",    activites: ["exterieur", "collegues"],
    actions: ["nettoyer", "transporter"],
    environnement: ["exterieur"],
    valeurs: ["exterieur", "stabilite", "horaires_fixes"],
    savoirFaire: ["Entretien", "Conduite"],
    savoirEtre: ["Endurance", "Esprit d'équipe", "Fiabilité"],
    savoirs: ["Tri des déchets", "Sécurité sur la voie publique"]
  },
  // ---------- Agriculture / Viticulture ----------
  {
    id: 'vigneron', nom: 'Vigneron', famille: 'Agriculture et viticulture', secteur: 'Agriculture, nature et espaces verts',
    rome: 'A1418', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, A1401 (ancien, meme erreur que sur Arboriculteur) = "Cueilleur
    // de fruits". A1418 "Viticulteur / Viticultrice" verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1418/viticulteur-viticultrice
    // ("Vigneron" n'est pas l'intitule ROME officiel mais reste le terme
    // usuel, garde tel quel dans cette base).
    activites: ['exterieur', 'outils', 'vehicules'], actions: ['construire'],
    environnement: ['exploitation_agricole', 'exterieur'], valeurs: ['exterieur', 'autonomie', 'metier_sens'],
    savoirFaire: ['Travail manuel', 'Technique', 'Entretien', 'Traitement phytosanitaire'], savoirEtre: ['Endurance', 'Autonomie', 'Rigueur', 'Esprit d\'équipe'],
    savoirs: ['Cycle de la vigne', 'Techniques de vinification de base'],
    argumentsCV: ['travailler en extérieur au rythme des saisons viticoles'],
    argumentsLettre: ['contribuer à la production viticole locale, un secteur qui me tient à cœur'],
    pistesEntretien: ['Décrire une tâche viticole réalisée au fil des saisons (taille, vendanges, entretien du sol).'],
    synonymes: ['ouvrier viticole', 'exploitant viticole'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'arboriculteur', nom: 'Arboriculteur', famille: 'Agriculture et viticulture', secteur: 'Agriculture, nature et espaces verts',
    rome: 'A1405', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, A1401 correspond en realite a "Cueilleur de fruits" (verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1405/arboriculteur-arboricultrice).
    activites: ['exterieur', 'outils'], actions: ['construire'],
    environnement: ['exploitation_agricole', 'exterieur', 'espaces_verts'], valeurs: ['exterieur', 'autonomie'],
    savoirFaire: ['Travail manuel', 'Technique', 'Taille et élagage', 'Traitement phytosanitaire'], savoirEtre: ['Endurance', 'Adaptabilité'],
    savoirs: ['Cycle des arbres fruitiers', 'Techniques de taille et de traitement', 'Botanique'],
    argumentsCV: ['entretenir des vergers dans le respect des cycles naturels'],
    argumentsLettre: ['mettre mon goût du travail en extérieur au service de la production fruitière'],
    pistesEntretien: ['Expliquer les principales tâches saisonnières en arboriculture.'],
    synonymes: ['ouvrier arboricole'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'apiculteur', nom: 'Apiculteur', famille: 'Agriculture et viticulture', secteur: 'Agriculture, nature et espaces verts',
    rome: 'A1429', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1429/apiculteur-apicultrice)
    activites: ['exterieur', 'outils'], actions: ['construire'],
    environnement: ['exploitation_agricole', 'exterieur'], valeurs: ['exterieur', 'autonomie', 'metier_sens'],
    savoirFaire: ['Travail manuel', 'Extraction du miel', 'Manipulation des ruches'], savoirEtre: ['Patience', 'Autonomie', 'Rigueur'],
    savoirs: ['Cycle des abeilles', 'Techniques d\'apiculture de base'],
    argumentsCV: ['assurer le suivi de ruches et la production de miel'],
    argumentsLettre: ['exercer un métier de plein air en lien avec la biodiversité'],
    pistesEntretien: ['Décrire le suivi d\'une ruche sur une saison.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'chef_de_culture', nom: 'Chef de culture viticole', famille: 'Agriculture et viticulture', secteur: 'Agriculture, nature et espaces verts',
    rome: 'A1420', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Chef / Cheffe de culture responsable d'unite de production agricole",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1420)
    activites: ['exterieur', 'outils', 'collegues'], actions: ['organiser', 'gerer', 'construire'],
    environnement: ['exploitation_agricole', 'exterieur'], valeurs: ['responsabilites', 'autonomie', 'metier_sens'],
    savoirFaire: ['Planification', 'Gestion de projet', 'Technique', 'Diagnostic'], savoirEtre: ['Responsabilité', 'Organisation', 'Leadership'],
    savoirs: ['Cycle de la vigne', 'Encadrement d\'équipe agricole'],
    argumentsCV: ['coordonner les travaux viticoles sur l\'ensemble d\'une exploitation'],
    argumentsLettre: ['mettre mon expérience du terrain au service de l\'encadrement d\'une équipe viticole'],
    pistesEntretien: ['Décrire une situation d\'organisation du travail d\'une équipe sur une exploitation.'],
    synonymes: ['responsable d\'exploitation viticole'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Restauration ----------
  {
    id: 'patissier', nom: 'Pâtissier', famille: 'Hôtellerie-restauration', secteur: 'Métiers de bouche (artisanat)',
    rome: 'D1104', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/D1104)
    activites: ['clients', 'outils'], actions: ['cuisiner', 'creer'],
    environnement: ['cuisine'], valeurs: ['metier_sens', 'fier_metier'],
    savoirFaire: ['Cuisine', 'Précision', 'Expression artistique'], savoirEtre: ['Créativité', 'Rigueur', 'Respect des normes', 'Autonomie'],
    savoirs: ['Règles d\'hygiène alimentaire (HACCP)', 'Techniques de pâtisserie'],
    argumentsCV: ['réaliser des créations pâtissières dans le respect des normes d\'hygiène'],
    argumentsLettre: ['allier précision technique et créativité au quotidien'],
    pistesEntretien: ['Décrire une réalisation pâtissière dont vous êtes fier.'],
    synonymes: ['artisan pâtissier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'chef_cuisine', nom: 'Chef de cuisine', famille: 'Hôtellerie-restauration', secteur: 'Hôtellerie, restauration et tourisme',
    rome: 'G1601', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1601)
    activites: ['clients', 'collegues', 'outils'], actions: ['cuisiner', 'organiser', 'creer'],
    environnement: ['cuisine'], valeurs: ['responsabilites', 'fier_metier', 'metier_sens'],
    savoirFaire: ['Cuisine', 'Gestion de projet', 'Gestion des stocks'], savoirEtre: ['Créativité', 'Responsabilité', 'Leadership', 'Réactivité'],
    savoirs: ['Règles d\'hygiène alimentaire (HACCP)', 'Gestion d\'une brigade'],
    argumentsCV: ['encadrer une équipe en cuisine et élaborer les cartes'],
    argumentsLettre: ['mettre mon expérience culinaire au service d\'une équipe et d\'un établissement'],
    pistesEntretien: ['Décrire une carte ou un plat que vous avez conçu.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'sommelier', nom: 'Sommelier', famille: 'Hôtellerie-restauration', secteur: 'Hôtellerie, restauration et tourisme',
    rome: 'G1804', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1804/sommelier-sommeliere)
    activites: ['clients'], actions: ['conseiller', 'vendre'],
    environnement: ['cuisine', 'hotel'], valeurs: ['contact_humain', 'metier_sens', 'fier_metier'],
    savoirFaire: ['Conseil', 'Hygiène'], savoirEtre: ['Relation client', 'Communication', 'Sens du détail', 'Autonomie', 'Créativité'],
    savoirs: ['Connaissance des vins et accords mets-vins'],
    argumentsCV: ['conseiller une clientèle sur le choix des vins'],
    argumentsLettre: ['partager ma connaissance des vins avec une clientèle exigeante'],
    pistesEntretien: ['Décrire un accord mets-vins que vous recommanderiez.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- BTP ----------
  {
    id: 'charpentier', nom: 'Charpentier', famille: 'BTP', secteur: 'Bâtiment et travaux publics',
    rome: 'F1503', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/F1503)
    activites: ['outils', 'exterieur'], actions: ['construire', 'monter'],
    environnement: ['exterieur'], valeurs: ['exterieur', 'fier_metier'],
    savoirFaire: ['Bâtiment', 'Lecture de plans', 'Travail manuel', 'Assemblage', 'Traçage de plans'], savoirEtre: ['Précision', 'Sécurité'],
    savoirs: ['Normes de sécurité sur chantier'],
    argumentsCV: ['realiser des ouvrages en bois dans le respect des plans et des normes'],
    argumentsLettre: ['mettre mon savoir-faire manuel au service de projets de construction'],
    pistesEntretien: ['Décrire un ouvrage en charpente que vous avez réalisé.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'carreleur', nom: 'Carreleur', famille: 'BTP', secteur: 'Bâtiment et travaux publics',
    rome: 'F1608', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/F1608)
    activites: ['outils'], actions: ['construire', 'monter'],
    environnement: ['exterieur'], valeurs: ['fier_metier'],
    savoirFaire: ['Travail manuel', 'Précision', 'Planification'], savoirEtre: ['Rigueur', 'Sens du détail', 'Persévérance'],
    savoirs: ['Techniques de pose de carrelage'],
    argumentsCV: ['réaliser des poses de carrelage soignées'],
    argumentsLettre: ['apporter un travail minutieux sur des chantiers variés'],
    pistesEntretien: ['Décrire une pose de carrelage complexe réalisée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'chef_chantier', nom: 'Chef de chantier', famille: 'BTP', secteur: 'Bâtiment et travaux publics',
    rome: 'F1202', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Chef / Cheffe de chantier batiment",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/F1202/chef-cheffe-de-chantier-batiment)
    activites: ['collegues', 'outils'], actions: ['organiser', 'gerer', 'construire'],
    environnement: ['exterieur'], valeurs: ['responsabilites', 'fier_metier'],
    savoirFaire: ['Planification', 'Bâtiment', 'Lecture de plans', 'Gestion des stocks'], savoirEtre: ['Responsabilité', 'Leadership', 'Organisation'],
    savoirs: ['Normes de sécurité sur chantier', 'Coordination d\'équipe BTP'],
    argumentsCV: ['coordonner une équipe et le suivi d\'un chantier'],
    argumentsLettre: ['mettre mon expérience du terrain au service de l\'encadrement de chantier'],
    pistesEntretien: ['Décrire une situation de coordination d\'équipe sur un chantier.'],
    synonymes: ['conducteur de travaux junior'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'grutier', nom: 'Grutier', famille: 'BTP', secteur: 'Bâtiment et travaux publics',
    rome: 'F1301', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/F1301/grutier-grutiere)
    activites: ['machines', 'outils'], actions: ['conduire'],
    environnement: ['exterieur'], valeurs: ['autonomie', 'pas_physique'],
    savoirFaire: ['Conduite', 'Technique', 'Levage'], savoirEtre: ['Sécurité', 'Rigueur', 'Autonomie'],
    savoirs: ['Consignes de sécurité de levage', 'Types de grues'],
    argumentsCV: ['assurer la conduite d\'une grue en respectant les consignes de sécurité'],
    argumentsLettre: ['exercer un métier technique nécessitant précision et vigilance'],
    pistesEntretien: ['Décrire une manœuvre de levage délicate.'],
    synonymes: ['conducteur de grue'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'monteur_reseaux_electriques', nom: 'Monteur de réseaux électriques', famille: 'BTP', secteur: 'Industrie, production et énergie',
    rome: 'F1605', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, F1608 correspond en realite a "Carreleur / Carreleuse"
    // (verifie https://candidat.francetravail.fr/metierscope/fiche-metier/F1605/monteur-monteuse-de-reseaux-electriques).
    activites: ['outils', 'exterieur'], actions: ['installer', 'construire'],
    environnement: ['exterieur'], valeurs: ['exterieur', 'fier_metier'],
    savoirFaire: ['Technique', 'Réparation', 'Diagnostic', 'Câblage'], savoirEtre: ['Sécurité', 'Rigueur'],
    savoirs: ['Normes électriques', 'Consignes de sécurité en hauteur', 'Habilitation électrique'],
    argumentsCV: ['installer et entretenir des réseaux électriques extérieurs'],
    argumentsLettre: ['contribuer au développement des infrastructures énergétiques locales'],
    pistesEntretien: ['Décrire une intervention sur un réseau électrique.'],
    synonymes: ['électricien réseaux'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'technicien_froid_climatisation', nom: 'Technicien froid et climatisation', famille: 'BTP', secteur: 'Industrie, production et énergie',
    rome: 'I1306', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, I1302 correspond en realite a "Automaticien". I1306
    // ("Frigoriste") est l'appellation officielle la plus proche, verifiee
    // https://candidat.francetravail.fr/metierscope/fiche-metier/I1306/frigoriste
    // (nom du metier garde tel quel dans cette base).
    activites: ['outils', 'machines'], actions: ['installer', 'reparer', 'diagnostiquer'],
    environnement: ['exterieur', 'usine'], valeurs: ['autonomie', 'missions_variees'],
    savoirFaire: ['Technique', 'Diagnostic', 'Réparation', 'Installation'], savoirEtre: ['Rigueur', 'Autonomie'],
    savoirs: ['Fluides frigorigènes et normes associées', 'Thermodynamique'],
    argumentsCV: ['installer et dépanner des systèmes de froid et de climatisation'],
    argumentsLettre: ['exercer un métier technique en constante évolution'],
    pistesEntretien: ['Décrire un dépannage de système de climatisation.'],
    synonymes: ['frigoriste'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Industrie / Logistique ----------
  {
    id: 'technicien_qualite', nom: 'Technicien qualité', famille: 'Industrie', secteur: 'Industrie, production et énergie',
    rome: 'H1528', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Technicien / Technicienne qualite en industrie",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/H1528/technicien-technicienne-qualite-en-industrie)
    activites: ['documents', 'machines'], actions: ['controler', 'analyser'],
    environnement: ['usine', 'laboratoire'], valeurs: ['calme', 'missions_variees'],
    savoirFaire: ['Diagnostic', 'Analyse de données', 'Formation'], savoirEtre: ['Rigueur', 'Sens du détail', 'Esprit d\'équipe', 'Réactivité'],
    savoirs: ['Normes qualité industrielle'],
    argumentsCV: ['contrôler la conformité des produits selon les normes en vigueur'],
    argumentsLettre: ['garantir la qualité des produits par un contrôle rigoureux'],
    pistesEntretien: ['Décrire un contrôle qualité ayant permis d\'identifier un problème.'],
    synonymes: ['contrôleur qualité'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'regleur_cn', nom: 'Régleur sur machine à commande numérique', famille: 'Industrie', secteur: 'Industrie, production et énergie',
    rome: 'H2912', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Regleur / Regleuse d'equipements industriels",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/H2912/regleur-regleuse-equipements-industriels)
    activites: ['machines', 'outils'], actions: ['programmer', 'reparer', 'diagnostiquer'],
    environnement: ['usine'], valeurs: ['missions_variees', 'autonomie'],
    savoirFaire: ['Technique', 'Précision', 'Diagnostic'], savoirEtre: ['Rigueur', 'Autonomie', 'Esprit d\'équipe'],
    savoirs: ['Programmation de machines à commande numérique'],
    argumentsCV: ['régler et programmer des machines à commande numérique'],
    argumentsLettre: ['exercer un métier technique au cœur de la production industrielle'],
    pistesEntretien: ['Décrire un réglage de machine réalisé.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'conducteur_ligne', nom: 'Conducteur de ligne de production', famille: 'Industrie', secteur: 'Industrie, production et énergie',
    rome: null, fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : H2909 (ancien
    // code) est en realite "Assembleur monteur", retire. Pas de code ROME
    // generique unique pour ce metier : le ROME classe les conducteurs de
    // ligne par filiere industrielle (agroalimentaire, bois, chimie,
    // textile...) -- a trancher avec Denis si un code approximatif
    // (ex. H3301, conditionnement) doit etre choisi.
    activites: ['machines'], actions: ['controler', 'diagnostiquer'],
    environnement: ['usine'], valeurs: ['horaires_fixes', 'stabilite'],
    savoirFaire: ['Technique', 'Diagnostic', 'Vigilance'], savoirEtre: ['Rigueur', 'Sécurité', 'Esprit d\'équipe'],
    savoirs: ['Fonctionnement d\'une ligne de production'],
    argumentsCV: ['assurer le pilotage et la surveillance d\'une ligne de production'],
    argumentsLettre: ['garantir la continuité et la qualité d\'une production industrielle'],
    pistesEntretien: ['Décrire une intervention suite à un incident sur une ligne.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'logisticien', nom: 'Logisticien', famille: 'Transport et logistique', secteur: 'Transport et logistique',
    rome: 'N1301', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // affichee "Responsable logistique",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/N1301)
    activites: ['marchandises', 'documents'], actions: ['organiser', 'gerer'],
    environnement: ['entrepot_logistique'], valeurs: ['missions_variees', 'responsabilites'],
    savoirFaire: ['Logistique', 'Gestion des stocks', 'Planification', 'Gestion financière'], savoirEtre: ['Organisation', 'Rigueur', 'Esprit d\'équipe'],
    savoirs: ['Chaîne logistique', 'Gestion des flux'],
    argumentsCV: ['organiser et optimiser les flux logistiques d\'un entrepôt'],
    argumentsLettre: ['mettre mes compétences organisationnelles au service de la chaîne logistique'],
    pistesEntretien: ['Décrire une amélioration apportée à un processus logistique.'],
    synonymes: ['gestionnaire logistique'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'agent_tri', nom: 'Agent de tri', famille: 'Transport et logistique', secteur: 'Transport et logistique',
    rome: 'N1103', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : aucune fiche
    // ROME n'existe sous l'intitule "agent de tri" hors dechets -- N1103,
    // deja present, correspond en realite a "Preparateur / Preparatrice de
    // commandes" (verifie https://candidat.francetravail.fr/metierscope/fiche-metier/N1103),
    // la fiche la plus proche du tri/rangement en logistique. Nom du metier
    // garde tel quel (choix editorial de cette base) ; POINT A CONFIRMER
    // AVEC DENIS si un renommage est preferable.
    activites: ['marchandises'], actions: ['controler', 'transporter'],
    environnement: ['entrepot_logistique'], valeurs: ['horaires_fixes', 'pas_physique'],
    savoirFaire: ['Gestion des stocks', 'Gestion administrative'], savoirEtre: ['Rigueur', 'Endurance', 'Réactivité'],
    savoirs: ['Procédures de tri logistique'],
    argumentsCV: ['assurer le tri et l\'acheminement des marchandises'],
    argumentsLettre: ['contribuer à la fluidité d\'une chaîne logistique'],
    pistesEntretien: ['Décrire une journée type en centre de tri.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'livreur_velo', nom: 'Livreur à vélo', famille: 'Transport et logistique', secteur: 'Transport et logistique',
    rome: 'N4104', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, N4105 (ancien) decrit des tournees motorisees ; N4104
    // "Coursier / Coursiere" precise explicitement les vehicules 2-4 roues
    // motorises OU NON, verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/N4104/coursier-coursiere
    activites: ['vehicules', 'clients'], actions: ['transporter'],
    environnement: ['route'], valeurs: ['autonomie', 'temps_libre', 'choisir_horaires'],
    savoirFaire: ['Logistique'], savoirEtre: ['Autonomie', 'Endurance', 'Respect des délais', 'Sens du service', 'Sécurité'],
    savoirs: ['Code de la route'],
    argumentsCV: ['assurer des livraisons rapides en autonomie'],
    argumentsLettre: ['exercer une activité physique et autonome au contact de la ville'],
    pistesEntretien: ['Décrire l\'organisation d\'une tournée de livraison.'],
    synonymes: ['coursier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Administration / RH ----------
  {
    id: 'gestionnaire_rh', nom: 'Gestionnaire ressources humaines', famille: 'Administration et gestion', secteur: 'Administration, gestion et bureau',
    rome: null, fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : M1502 (ancien)
    // = "Charge de recrutement", trop restreint (le profil ici est gestion
    // administrative/paie/droit du travail). M1501 serait plus proche mais
    // deja attribue a "Assistant ressources humaines" dans cette base (pas
    // de doublon de code ROME sur 2 fiches) -- laisse a null, POINT A
    // TRANCHER AVEC DENIS (distinction assistant/gestionnaire a clarifier
    // cote ROME, ou accepter le doublon de code).
    activites: ['documents', 'collegues', 'ordinateur'], actions: ['gerer', 'organiser', 'communiquer_ecrit'],
    environnement: ['bureau', 'administration'], valeurs: ['stabilite', 'responsabilites'],
    savoirFaire: ['Gestion administrative', 'Bureautique', 'Accompagnement'], savoirEtre: ['Rigueur', 'Organisation', 'Communication'],
    savoirs: ['Droit du travail de base', 'Gestion de la paie'],
    argumentsCV: ['assurer la gestion administrative du personnel'],
    argumentsLettre: ['mettre mes compétences administratives au service des ressources humaines'],
    pistesEntretien: ['Décrire une procédure RH que vous avez gérée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'assistant_rh', nom: 'Assistant ressources humaines', famille: 'Administration et gestion', secteur: 'Administration, gestion et bureau',
    rome: 'M1501', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/M1501)
    activites: ['documents', 'collegues', 'ordinateur'], actions: ['classer', 'saisir', 'communiquer_ecrit'],
    environnement: ['bureau', 'administration'], valeurs: ['stabilite', 'calme'],
    savoirFaire: ['Bureautique', 'Gestion administrative', 'Accompagnement'], savoirEtre: ['Rigueur', 'Organisation'],
    savoirs: ['Bases du droit du travail'],
    argumentsCV: ['assister la gestion administrative du personnel'],
    argumentsLettre: ['apporter mon sérieux au sein d\'un service ressources humaines'],
    pistesEntretien: ['Décrire une tâche administrative RH réalisée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Social / Insertion / Formation ----------
  {
    id: 'conseiller_insertion_professionnelle', nom: 'Conseiller en insertion professionnelle', famille: 'Social et formation', secteur: 'Social et services à la personne',
    rome: 'K1801', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K1801/conseiller-conseillere-en-insertion-professionnelle)
    activites: ['clients', 'collegues', 'ordinateur'], actions: ['conseiller', 'accompagner', 'informer'],
    environnement: ['bureau', 'administration'], valeurs: ['sentir_utile', 'contact_humain', 'metier_sens'],
    savoirFaire: ['Conseil', 'Accompagnement', 'Animation'], savoirEtre: ['Empathie', 'Écoute', 'Communication', 'Pédagogie', 'Sens du service'],
    savoirs: ['Dispositifs d\'insertion professionnelle', 'Marché de l\'emploi'],
    argumentsCV: ['accompagner des personnes dans leur parcours d\'insertion professionnelle'],
    argumentsLettre: ['mettre mon écoute et ma pédagogie au service de l\'accompagnement des publics en insertion'],
    pistesEntretien: ['Décrire un accompagnement individuel que vous avez mené.'],
    synonymes: ['CIP', 'conseiller emploi'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'educateur_specialise', nom: 'Éducateur spécialisé', famille: 'Social et formation', secteur: 'Social et services à la personne',
    rome: 'K1207', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K1207/educateur-specialise-educatrice-specialisee)
    activites: ['enfants', 'personnes_agees', 'patients'], actions: ['accompagner', 'aider', 'former'],
    environnement: ['sante'], valeurs: ['sentir_utile', 'metier_sens', 'contact_humain'],
    savoirFaire: ['Formation', 'Diagnostic', 'Animation'], savoirEtre: ['Empathie', 'Patience', 'Écoute', 'Bienveillance'],
    savoirs: ['Accompagnement social et educatif'],
    argumentsCV: ['accompagner des personnes en difficulté dans leur parcours de vie'],
    argumentsLettre: ['mettre mon sens de l\'écoute au service de personnes en situation de vulnérabilité'],
    pistesEntretien: ['Décrire une situation d\'accompagnement éducatif menée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'assistant_social', nom: 'Assistant de service social', famille: 'Social et formation', secteur: 'Social et services à la personne',
    rome: 'K1201', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Assistant social / Assistante sociale",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K1201/assistant-social-assistante-sociale)
    activites: ['clients', 'famille', 'documents'], actions: ['accompagner', 'conseiller', 'informer'],
    environnement: ['bureau', 'administration'], valeurs: ['sentir_utile', 'metier_sens'],
    savoirFaire: ['Conseil', 'Gestion administrative', 'Accompagnement'], savoirEtre: ['Empathie', 'Écoute', 'Bienveillance'],
    savoirs: ['Dispositifs d\'aide sociale', 'Droit social'],
    argumentsCV: ['accompagner des personnes dans leurs démarches sociales'],
    argumentsLettre: ['mettre mon sens de l\'écoute au service de publics en difficulté'],
    pistesEntretien: ['Décrire un accompagnement social mené de bout en bout.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'moniteur_auto_ecole', nom: 'Moniteur auto-école', famille: 'Social et formation', secteur: 'Éducation et formation',
    rome: 'K2110', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : appellation
    // officielle ROME "Enseignant / Enseignante de la conduite et de la
    // securite routiere" (metier reglemente, titre professionnel requis),
    // verifie https://candidat.francetravail.fr/metierscope/fiche-metier/K2110/moniteur-monitrice-auto-ecole
    // (nom garde tel quel dans cette base, plus parlant pour ce public).
    activites: ['eleves_etudiants', 'vehicules'], actions: ['former', 'conduire'],
    environnement: ['ecole_formation', 'route'], valeurs: ['contact_humain', 'metier_sens', 'autonomie'],
    savoirFaire: ['Formation', 'Conduite', 'Diagnostic'], savoirEtre: ['Patience', 'Pédagogie', 'Sécurité'],
    savoirs: ['Code de la route', 'Pédagogie de la conduite'],
    argumentsCV: ['former des candidats à la conduite et au code de la route'],
    argumentsLettre: ['transmettre les bonnes pratiques de conduite avec patience et rigueur'],
    pistesEntretien: ['Décrire l\'accompagnement d\'un élève en difficulté.'],
    synonymes: ['enseignant de la conduite'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'aesh', nom: 'Accompagnant d\'eleves en situation de handicap (AESH)', famille: 'Social et formation', secteur: 'Éducation et formation',
    rome: 'K2113', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K2113/accompagnant-accompagnante-des-eleves-en-situation-de-handicap-aesh) :
    // code ROME corrige (K2104 pointe aujourd'hui vers un metier voisin mais
    // distinct, "Surveillant en milieu scolaire").
    activites: ['enfants', 'eleves_etudiants'], actions: ['accompagner', 'aider'],
    environnement: ['ecole_formation'], valeurs: ['sentir_utile', 'metier_sens', 'contact_humain'],
    savoirFaire: ['Soutien scolaire', 'Accompagnement', 'Collaboration'], savoirEtre: ['Patience', 'Empathie', 'Bienveillance', 'Adaptabilité', 'Organisation'],
    savoirs: ['Accompagnement du handicap en milieu scolaire'],
    argumentsCV: ['accompagner des élèves en situation de handicap dans leur scolarité'],
    argumentsLettre: ['mettre ma patience et mon adaptabilité au service d\'enfants en situation de handicap'],
    pistesEntretien: ['Décrire une situation d\'adaptation pour un élève accompagné.'],
    synonymes: ['AVS', 'auxiliaire de vie scolaire'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'garde_enfants_domicile', nom: 'Garde d\'enfants à domicile', famille: 'Services à la personne', secteur: 'Social et services à la personne',
    rome: 'K1303', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K1303/garde-enfant)
    activites: ['enfants', 'famille'], actions: ['aider', 'accompagner'],
    environnement: ['domicile'], valeurs: ['sentir_utile', 'choisir_horaires', 'contact_humain'],
    savoirFaire: ['Cuisine', 'Soins', 'Entretien'], savoirEtre: ['Patience', 'Bienveillance', 'Responsabilité', 'Organisation', 'Persévérance'],
    savoirs: ['Sécurité et éveil de l\'enfant'],
    argumentsCV: ['assurer la garde et l\'éveil d\'enfants à domicile'],
    argumentsLettre: ['mettre ma bienveillance au service de familles ayant besoin de confiance'],
    pistesEntretien: ['Décrire une activité d\'éveil proposée à un enfant gardé.'],
    synonymes: ['nourrice à domicile', 'baby-sitter'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Commerce ----------
  {
    id: 'responsable_magasin', nom: 'Responsable de magasin', famille: 'Commerce', secteur: 'Commerce et vente',
    rome: 'D1301', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, D1401 (ancien) = "Assistant commercial". D1301 (management
    // de magasin de detail) verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/D1301/responsable-de-magasin
    activites: ['clients', 'collegues', 'marchandises'], actions: ['gerer', 'organiser', 'vendre'],
    environnement: ['magasin'], valeurs: ['responsabilites', 'evolution'],
    savoirFaire: ['Merchandising', 'Gestion des stocks', 'Gestion de projet', 'Négociation'], savoirEtre: ['Leadership', 'Organisation', 'Relation client', 'Rigueur'],
    savoirs: ['Gestion commerciale d\'un point de vente'],
    argumentsCV: ['manager une équipe et piloter l\'activité commerciale d\'un magasin'],
    argumentsLettre: ['mettre mon sens du commerce et du management au service d\'un point de vente'],
    pistesEntretien: ['Décrire une action commerciale que vous avez pilotée.'],
    synonymes: ['directeur de magasin'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'merchandiseur', nom: 'Merchandiseur', famille: 'Commerce', secteur: 'Commerce et vente',
    rome: 'D1506', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Charge / Chargee de merchandising",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/D1506/marchandiseur-marchandiseuse)
    activites: ['marchandises', 'produits'], actions: ['organiser', 'creer'],
    environnement: ['magasin'], valeurs: ['missions_variees', 'metier_sens'],
    savoirFaire: ['Merchandising', 'Négociation'], savoirEtre: ['Créativité', 'Sens du détail', 'Esprit d\'équipe'],
    savoirs: ['Techniques de merchandising visuel'],
    argumentsCV: ['optimiser la présentation des produits en magasin'],
    argumentsLettre: ['mettre mon sens esthétique au service de la mise en valeur des produits'],
    pistesEntretien: ['Décrire une implantation produit réalisée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Artisanat / Beauté ----------
  {
    id: 'fleuriste', nom: 'Fleuriste', famille: 'Artisanat', secteur: 'Artisanat et création',
    rome: 'D1209', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, A1408 (ancien) = "Eleveur d'animaux sauvages", sans rapport.
    // D1209 verifie https://candidat.francetravail.fr/metierscope/fiche-metier/D1209/fleuriste
    activites: ['clients', 'produits'], actions: ['creer', 'vendre', 'conseiller'],
    environnement: ['magasin'], valeurs: ['metier_sens', 'fier_metier'],
    savoirFaire: ['Merchandising', 'Gestion des stocks', 'Gestion administrative'], savoirEtre: ['Créativité', 'Relation client', 'Sens du détail', 'Esprit d\'équipe', 'Rigueur'],
    savoirs: ['Connaissance des fleurs et compositions florales'],
    argumentsCV: ['réaliser des compositions florales pour une clientèle variée'],
    argumentsLettre: ['mettre ma créativité au service d\'un commerce de proximité'],
    pistesEntretien: ['Décrire une composition florale réalisée pour un événement.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'estheticienne', nom: 'Esthéticienne', famille: 'Artisanat', secteur: 'Coiffure et esthétique',
    rome: 'D1208', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/D1208/estheticien-estheticienne)
    activites: ['clients'], actions: ['conseiller', 'vendre'],
    environnement: ['magasin'], valeurs: ['contact_humain', 'metier_sens'],
    savoirFaire: ['Maquillage', 'Épilation', 'Soins', 'Gestion des stocks'], savoirEtre: ['Relation client', 'Sens du détail', 'Écoute', 'Rigueur', 'Créativité'],
    savoirs: ['Techniques de soins esthétiques', 'Connaissance des produits cosmétiques', 'Encaissement'],
    argumentsCV: ['réaliser des soins esthétiques adaptés à chaque cliente'],
    argumentsLettre: ['mettre mon sens du contact et du soin au service d\'une clientèle'],
    pistesEntretien: ['Décrire un soin esthétique que vous maîtrisez particulièrement.'],
    synonymes: ['esthéticien'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'ebeniste', nom: 'Ébéniste', famille: 'Artisanat', secteur: 'Artisanat et création',
    rome: 'H2207', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/H2207/ebeniste)
    activites: ['outils'], actions: ['fabriquer', 'creer'],
    environnement: ['usine'], valeurs: ['fier_metier', 'metier_sens', 'autonomie'],
    savoirFaire: ['Travail manuel', 'Précision', 'Lecture de plans', 'Finition', 'Marqueterie'], savoirEtre: ['Créativité', 'Sens du détail', 'Patience'],
    savoirs: ['Techniques de menuiserie fine'],
    argumentsCV: ['concevoir et réaliser des meubles sur mesure'],
    argumentsLettre: ['mettre ma passion du travail du bois au service de créations uniques'],
    pistesEntretien: ['Décrire une pièce de mobilier que vous avez réalisée.'],
    synonymes: ['menuisier d\'art'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'bijoutier', nom: 'Bijoutier', famille: 'Artisanat', secteur: 'Artisanat et création',
    rome: 'B1605', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/B1605/bijoutier-bijoutiere)
    activites: ['outils', 'clients'], actions: ['fabriquer', 'creer', 'vendre'],
    environnement: ['magasin'], valeurs: ['fier_metier', 'metier_sens'],
    savoirFaire: ['Travail manuel', 'Précision', 'Assemblage'], savoirEtre: ['Créativité', 'Sens du détail', 'Patience'],
    savoirs: ['Techniques de bijouterie', 'Gemmologie'],
    argumentsCV: ['créer et réparer des bijoux avec précision'],
    argumentsLettre: ['mettre ma minutie au service d\'un artisanat de précision'],
    pistesEntretien: ['Décrire la création ou réparation d\'un bijou.'],
    synonymes: ['joaillier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'toiletteur_animalier', nom: 'Toiletteur animalier', famille: 'Artisanat', secteur: 'Métiers animaliers',
    rome: 'A1503', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1503/toiletteur-toiletteuse-animaux)
    activites: ['clients'], actions: ['soigner'],
    environnement: ['magasin'], valeurs: ['metier_sens', 'contact_humain'],
    savoirFaire: ['Soins', 'Observation'], savoirEtre: ['Patience', 'Empathie', 'Sens du détail', 'Autonomie', 'Adaptabilité'],
    savoirs: ['Techniques de toilettage animalier'],
    argumentsCV: ['réaliser le toilettage d\'animaux dans le respect de leur bien-être'],
    argumentsLettre: ['mettre ma patience et mon amour des animaux au service de ce métier'],
    pistesEntretien: ['Décrire le toilettage d\'un animal difficile.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Numérique / Création ----------
  {
    id: 'technicien_reseau', nom: 'Technicien réseau informatique', famille: 'Numérique', secteur: 'Informatique et numérique',
    rome: 'M1816', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Technicien / Technicienne reseaux informatiques et telecoms",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/M1816/technicien-technicienne-reseaux-informatiques-et-telecoms)
    activites: ['ordinateur', 'appareils_numeriques'], actions: ['installer', 'diagnostiquer', 'reparer'],
    environnement: ['bureau'], valeurs: ['missions_variees', 'autonomie'],
    savoirFaire: ['Technique', 'Diagnostic', 'Déploiement'], savoirEtre: ['Rigueur', 'Autonomie'],
    savoirs: ['Réseaux informatiques', 'Dépannage informatique', 'Protocoles réseau (TCP/IP)'],
    argumentsCV: ['installer et dépanner des infrastructures réseau'],
    argumentsLettre: ['mettre mes compétences techniques au service du bon fonctionnement des réseaux'],
    pistesEntretien: ['Décrire un dépannage réseau réalisé.'],
    synonymes: ['technicien informatique'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'webmaster', nom: 'Webmaster', famille: 'Numérique', secteur: 'Informatique et numérique',
    rome: null, fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : POINT A
    // TRANCHER AVEC DENIS -- "Webmaster" n'existe plus dans le referentiel
    // ROME actuel, absorbe par M1855 "Developpeur / Developpeuse web", un
    // profil plus code/programmation que le "gestionnaire de site" generaliste
    // que ce metier represente probablement pour ce public. Pas de code ROME
    // assigne pour eviter de deformer le metier ; competences ajoutees
    // limitees a celles clairement generiques.
    activites: ['ordinateur'], actions: ['programmer', 'creer'],
    environnement: ['bureau', 'teletravail_domicile'], valeurs: ['teletravail', 'missions_variees', 'evolution'],
    savoirFaire: ['Technique', 'Innovation', 'Assistance'], savoirEtre: ['Autonomie', 'Rigueur'],
    savoirs: ['Création et maintenance de sites internet'],
    argumentsCV: ['créer et maintenir des sites internet'],
    argumentsLettre: ['mettre mes compétences numériques au service de projets web'],
    pistesEntretien: ['Décrire un site internet que vous avez créé ou maintenu.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'community_manager', nom: 'Community manager', famille: 'Numérique', secteur: 'Communication, culture et événementiel',
    rome: 'E1101', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/E1101/community-manager
    // -- competences deja bien couvertes par l'existant, code ROME ajoute seulement)
    activites: ['ordinateur', 'appareils_numeriques'], actions: ['communiquer_ecrit', 'creer', 'informer'],
    environnement: ['bureau', 'teletravail_domicile'], valeurs: ['teletravail', 'missions_variees', 'evolution'],
    savoirFaire: ['Rédaction', 'Innovation'], savoirEtre: ['Créativité', 'Communication', 'Adaptabilité'],
    savoirs: ['Réseaux sociaux et stratégie de contenu'],
    argumentsCV: ['animer les réseaux sociaux et la communauté en ligne d\'une structure'],
    argumentsLettre: ['mettre ma créativité au service de la communication digitale'],
    pistesEntretien: ['Décrire une campagne ou publication que vous avez conçue.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'graphiste', nom: 'Graphiste', famille: 'Création', secteur: 'Communication, culture et événementiel',
    rome: 'E1205', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Designer graphique" (intitule ROME actualise),
    // https://candidat.francetravail.fr/metierscope/fiche-metier/E1205/graphiste)
    activites: ['ordinateur'], actions: ['creer', 'dessiner', 'imaginer'],
    environnement: ['bureau', 'teletravail_domicile'], valeurs: ['teletravail', 'metier_sens', 'fier_metier'],
    savoirFaire: ['Expression artistique', 'Innovation'], savoirEtre: ['Créativité', 'Sens du détail', 'Adaptabilité'],
    savoirs: ['Logiciels de création graphique'],
    argumentsCV: ['concevoir des supports visuels pour différents supports de communication'],
    argumentsLettre: ['mettre ma créativité graphique au service de vos projets de communication'],
    pistesEntretien: ['Décrire une création graphique dont vous êtes fier.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'photographe', nom: 'Photographe', famille: 'Création', secteur: 'Communication, culture et événementiel',
    rome: 'E1201', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/E1201/photographe-professionnel-photographe-professionnelle)
    activites: ['appareils_numeriques', 'clients'], actions: ['photographier', 'creer'],
    environnement: ['route', 'evenementiel'], valeurs: ['metier_sens', 'missions_variees', 'autonomie'],
    savoirFaire: ['Expression artistique', 'Gestion administrative'], savoirEtre: ['Créativité', 'Sens du détail', 'Adaptabilité', 'Autonomie'],
    savoirs: ['Techniques photographiques et retouche d\'image'],
    argumentsCV: ['réaliser des reportages photographiques pour des événements ou des clients'],
    argumentsLettre: ['mettre mon regard artistique au service de vos événements ou projets'],
    pistesEntretien: ['Décrire un reportage photo réalisé.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Tourisme / Hôtellerie ----------
  {
    id: 'guide_touristique', nom: 'Guide touristique', famille: 'Tourisme', secteur: 'Hôtellerie, restauration et tourisme',
    rome: 'G1201', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, G1101 (ancien) = "Agent d'accueil touristique" (poste
    // sedentaire), alors que G1201 "Guide-accompagnateur" correspond mieux
    // a l'accompagnement de groupes deja decrit ici, verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1201/guide-accompagnateur-guide-accompagnatrice
    activites: ['clients'], actions: ['informer', 'accueillir'],
    environnement: ['aeroport_gare', 'evenementiel'], valeurs: ['contact_humain', 'metier_sens', 'missions_variees'],
    savoirFaire: ['Conseil', 'Gestion des réservations'], savoirEtre: ['Communication', 'Accueil', 'Adaptabilité', 'Sens du service', 'Autonomie', 'Coordination'],
    savoirs: ['Patrimoine et culture locale'],
    argumentsCV: ['faire découvrir le patrimoine local à des visiteurs variés'],
    argumentsLettre: ['partager ma connaissance du territoire avec des visiteurs'],
    pistesEntretien: ['Décrire une visite guidée que vous avez animée.'],
    synonymes: ['guide-conférencier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'concierge_hotel', nom: 'Concierge d\'hôtel', famille: 'Tourisme', secteur: 'Hôtellerie, restauration et tourisme',
    rome: 'G1701', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1701/concierge-hotel)
    activites: ['clients'], actions: ['accueillir', 'informer', 'conseiller'],
    environnement: ['hotel'], valeurs: ['contact_humain', 'metier_sens'],
    savoirFaire: ['Conseil', 'Gestion des réservations', 'Bureautique'], savoirEtre: ['Accueil', 'Sens du service', 'Communication', 'Coordination'],
    savoirs: ['Offre touristique locale'],
    argumentsCV: ['accueillir et conseiller une clientèle hôtelière exigeante'],
    argumentsLettre: ['mettre mon sens du service au cœur de l\'expérience client'],
    pistesEntretien: ['Décrire une demande client particulière que vous avez satisfaite.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'chef_reception', nom: 'Chef de reception', famille: 'Tourisme', secteur: 'Hôtellerie, restauration et tourisme',
    rome: 'G1706', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Chef / Cheffe de reception en hotellerie",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1706/chef-cheffe-de-reception-en-hotellerie)
    activites: ['clients', 'collegues'], actions: ['organiser', 'accueillir', 'gerer'],
    environnement: ['hotel'], valeurs: ['responsabilites', 'contact_humain'],
    savoirFaire: ['Gestion administrative', 'Planification', 'Gestion des réservations'], savoirEtre: ['Leadership', 'Accueil', 'Organisation', 'Coordination'],
    savoirs: ['Gestion hôtelière'],
    argumentsCV: ['coordonner l\'équipe de réception et l\'accueil de la clientèle'],
    argumentsLettre: ['mettre mon expérience de l\'accueil au service du management d\'une équipe'],
    pistesEntretien: ['Décrire une situation de gestion d\'équipe en réception.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Sport ----------
  {
    id: 'educateur_sportif', nom: 'Éducateur sportif', famille: 'Sport et animation', secteur: 'Sport, animation et loisirs',
    rome: 'G1204', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1204/educateur-sportif-educatrice-sportive)
    activites: ['enfants', 'eleves_etudiants', 'clients'], actions: ['former', 'accompagner'],
    environnement: ['salle_sport'], valeurs: ['contact_humain', 'metier_sens', 'bonne_ambiance'],
    savoirFaire: ['Formation', 'Conseil', 'Surveillance'], savoirEtre: ['Pédagogie', 'Communication', 'Adaptabilité', 'Esprit d\'équipe', 'Motivation', 'Rigueur'],
    savoirs: ['Techniques sportives et pédagogie du sport'],
    argumentsCV: ['encadrer des séances sportives pour des publics variés'],
    argumentsLettre: ['transmettre ma passion du sport avec pédagogie'],
    pistesEntretien: ['Décrire une séance que vous avez animée.'],
    synonymes: ['moniteur sportif'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'moniteur_fitness', nom: 'Moniteur de fitness', famille: 'Sport et animation', secteur: 'Sport, animation et loisirs',
    rome: 'G1217', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Moniteur / Monitrice en salle de sport",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1217/moniteur-monitrice-en-salle-de-sport)
    activites: ['clients'], actions: ['former', 'accompagner'],
    environnement: ['salle_sport'], valeurs: ['contact_humain', 'bonne_ambiance', 'choisir_horaires'],
    savoirFaire: ['Coaching', 'Formation', 'Animation'], savoirEtre: ['Communication', 'Adaptabilité', 'Motivation', 'Sécurité'],
    savoirs: ['Techniques de remise en forme'],
    argumentsCV: ['animer des cours collectifs de fitness'],
    argumentsLettre: ['transmettre mon énergie et ma motivation à une clientèle variée'],
    pistesEntretien: ['Décrire un cours collectif que vous animez régulièrement.'],
    synonymes: ['coach sportif'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'maitre_nageur', nom: 'Maître-nageur sauveteur', famille: 'Sport et animation', secteur: 'Sport, animation et loisirs',
    rome: 'G1224', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/G1224/maitre-nageur-sauveteur-maitre-nageuse-sauveteuse)
    activites: ['clients', 'enfants'], actions: ['former', 'controler'],
    environnement: ['salle_sport'], valeurs: ['responsabilites', 'contact_humain'],
    savoirFaire: ['Soins', 'Formation', 'Surveillance'], savoirEtre: ['Sécurité', 'Rigueur', 'Communication'],
    savoirs: ['Techniques de sauvetage aquatique', 'Premiers secours', 'Procédures d\'urgence'],
    argumentsCV: ['assurer la surveillance et l\'enseignement de la natation'],
    argumentsLettre: ['mettre ma vigilance et mon sens des responsabilités au service de la sécurité des baigneurs'],
    pistesEntretien: ['Décrire une intervention de sécurité en piscine.'],
    synonymes: ['MNS'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'animateur_evenementiel', nom: 'Animateur evenementiel', famille: 'Sport et animation', secteur: 'Communication, culture et événementiel',
    rome: 'L1104', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : code ROME
    // corrige, G1203 (ancien) = "Animateur jeunesse" (socio-educatif),
    // L1104 "Animateur / Animatrice evenementiel" est une correspondance
    // exacte de titre, verifie
    // https://candidat.francetravail.fr/metierscope/fiche-metier/L1104/animateur-animatrice-evenementiel
    activites: ['clients'], actions: ['organiser', 'informer', 'accueillir'],
    environnement: ['evenementiel'], valeurs: ['contact_humain', 'missions_variees', 'bonne_ambiance'],
    savoirFaire: ['Gestion de projet', 'Animation'], savoirEtre: ['Communication', 'Adaptabilité', 'Sens du service', 'Créativité'],
    savoirs: ['Organisation d\'événements'],
    argumentsCV: ['animer et coordonner des événements pour un public varié'],
    argumentsLettre: ['mettre mon dynamisme au service de vos événements'],
    pistesEntretien: ['Décrire un événement que vous avez animé ou organisé.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'technicien_son_lumiere', nom: 'Technicien son et lumière', famille: 'Sport et animation', secteur: 'Communication, culture et événementiel',
    rome: null, fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : pas de fiche
    // ROME unique combinant son et lumiere -- le referentiel separe
    // L1504 "Eclairagiste" et L1508 "Ingenieur du son" (qui cite d'ailleurs
    // "Technicien son du spectacle vivant et de l'evenementiel" comme
    // appellation rattachee). Laisse a null plutot que de choisir arbitrairement
    // l'un des deux ; competences ci-dessous couvrent les 2 aspects.
    activites: ['machines', 'outils'], actions: ['installer', 'controler'],
    environnement: ['evenementiel'], valeurs: ['missions_variees', 'autonomie'],
    savoirFaire: ['Technique', 'Installation'], savoirEtre: ['Rigueur', 'Adaptabilité', 'Autonomie', 'Créativité', 'Réactivité'],
    savoirs: ['Matériel de sonorisation et d\'éclairage'],
    argumentsCV: ['installer et régler le matériel son et lumière d\'un événement'],
    argumentsLettre: ['mettre ma maîtrise technique au service de la réussite d\'événements'],
    pistesEntretien: ['Décrire une installation technique réalisée pour un événement.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Santé (accessible, hors professions reglementees longues) ----------
  {
    id: 'assistant_dentaire', nom: 'Assistant dentaire', famille: 'Santé', secteur: 'Santé et soins',
    rome: 'J1312', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/J1312/assistant-assistante-dentaire)
    activites: ['patients', 'documents'], actions: ['accueillir', 'aider'],
    environnement: ['sante'], valeurs: ['sentir_utile', 'contact_humain', 'stabilite'],
    savoirFaire: ['Assistance', 'Soins', 'Hygiène', 'Gestion administrative'], savoirEtre: ['Rigueur', 'Accueil', 'Empathie', 'Réactivité'],
    savoirs: ['Hygiène et asepsie en cabinet dentaire'],
    argumentsCV: ['assister le praticien et accueillir les patients d\'un cabinet dentaire'],
    argumentsLettre: ['mettre mon sens de l\'hygiène et de l\'accueil au service d\'un cabinet dentaire'],
    pistesEntretien: ['Décrire l\'accueil d\'un patient anxieux.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'preparateur_pharmacie', nom: 'Préparateur en pharmacie', famille: 'Santé', secteur: 'Santé et soins',
    rome: 'J1307', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/J1307/preparateur-preparatrice-en-pharmacie)
    activites: ['clients', 'produits'], actions: ['conseiller', 'vendre'],
    environnement: ['sante', 'magasin'], valeurs: ['sentir_utile', 'stabilite', 'contact_humain'],
    savoirFaire: ['Conseil', 'Gestion des stocks', 'Assistance'], savoirEtre: ['Rigueur', 'Relation client', 'Écoute', 'Organisation'],
    savoirs: ['Connaissance des médicaments courants'],
    argumentsCV: ['délivrer des médicaments et conseiller une clientèle en pharmacie'],
    argumentsLettre: ['mettre ma rigueur au service de la santé des patients'],
    pistesEntretien: ['Décrire un conseil apporté à un client en pharmacie.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'brancardier', nom: 'Brancardier', famille: 'Santé', secteur: 'Santé et soins',
    rome: 'J1308', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/J1308/brancardier-brancardiere)
    activites: ['patients'], actions: ['transporter', 'aider'],
    environnement: ['sante'], valeurs: ['sentir_utile', 'stabilite'],
    savoirFaire: ['Brancardage', 'Manutention', 'Accompagnement', 'Observation'], savoirEtre: ['Empathie', 'Sécurité', 'Endurance', 'Réactivité', 'Adaptabilité'],
    savoirs: ['Manutention et transport de patients'],
    argumentsCV: ['assurer le transport des patients au sein d\'un établissement de santé'],
    argumentsLettre: ['mettre mon sens du service au cœur d\'un établissement de santé'],
    pistesEntretien: ['Décrire une situation de prise en charge d\'un patient.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Immobilier / Banque / Assurance / Culture ----------
  {
    id: 'agent_immobilier', nom: 'Agent immobilier', famille: 'Immobilier et finance', secteur: 'Banque, assurance et immobilier',
    rome: 'C1504', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/C1504/agent-immobilier-agente-immobiliere)
    activites: ['clients', 'documents'], actions: ['negocier', 'conseiller', 'vendre'],
    environnement: ['bureau'], valeurs: ['evolution', 'autonomie', 'salaire'],
    savoirFaire: ['Négociation', 'Conseil', 'Analyse de données'], savoirEtre: ['Relation client', 'Communication', 'Autonomie', 'Rigueur'],
    savoirs: ['Droit immobilier de base', 'Marché immobilier local'],
    argumentsCV: ['accompagner des clients dans leurs projets immobiliers'],
    argumentsLettre: ['mettre mon sens de la négociation au service de vos projets immobiliers'],
    pistesEntretien: ['Décrire une transaction immobilière menée.'],
    synonymes: ['négociateur immobilier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'conseiller_bancaire', nom: 'Conseiller bancaire', famille: 'Immobilier et finance', secteur: 'Banque, assurance et immobilier',
    rome: 'C1206', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Conseiller / Conseillere de clientele bancaire",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/C1206/conseiller-conseillere-de-clientele-bancaire)
    activites: ['clients', 'documents', 'ordinateur'], actions: ['conseiller', 'vendre', 'gerer'],
    environnement: ['bureau'], valeurs: ['stabilite', 'evolution', 'contact_humain'],
    savoirFaire: ['Conseil', 'Gestion administrative', 'Analyse de données', 'Gestion financière'], savoirEtre: ['Relation client', 'Rigueur', 'Communication'],
    savoirs: ['Produits bancaires et financiers de base', 'Réglementation bancaire'],
    argumentsCV: ['conseiller une clientèle sur ses produits bancaires'],
    argumentsLettre: ['mettre ma rigueur et mon sens du conseil au service d\'une clientèle bancaire'],
    pistesEntretien: ['Décrire un conseil bancaire apporté à un client.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'agent_assurance', nom: 'Agent d\'assurance', famille: 'Immobilier et finance', secteur: 'Banque, assurance et immobilier',
    rome: 'C1102', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : pas de fiche
    // ROME intitulee litteralement "agent d'assurance" -- C1102 (Conseiller
    // commercial et relation client en assurances, dont une appellation
    // associee est "Agent commercial en assurances") est le meilleur
    // correspondant, verifie https://candidat.francetravail.fr/metierscope/fiche-metier/C1102/conseiller-conseillere-en-assurances
    activites: ['clients', 'documents'], actions: ['conseiller', 'vendre', 'gerer'],
    environnement: ['bureau'], valeurs: ['stabilite', 'evolution'],
    savoirFaire: ['Conseil', 'Négociation', 'Rédaction', 'Développement commercial'], savoirEtre: ['Relation client', 'Communication', 'Rigueur'],
    savoirs: ['Produits d\'assurance de base', 'Droit des assurances'],
    argumentsCV: ['conseiller et accompagner une clientèle en matière d\'assurance'],
    argumentsLettre: ['mettre mon sens du conseil au service de la protection de vos clients'],
    pistesEntretien: ['Décrire une souscription d\'assurance accompagnée.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'bibliothecaire', nom: 'Bibliothécaire', famille: 'Culture', secteur: 'Communication, culture et événementiel',
    rome: 'K1603', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K1603/bibliothecaire)
    activites: ['clients', 'documents'], actions: ['classer', 'informer', 'conseiller'],
    environnement: ['administration'], valeurs: ['calme', 'metier_sens', 'stabilite'],
    savoirFaire: ['Gestion administrative', 'Conseil'], savoirEtre: ['Organisation', 'Sens du service', 'Rigueur', 'Accueil'],
    savoirs: ['Classification documentaire'],
    argumentsCV: ['gérer les collections et accueillir le public d\'une bibliothèque'],
    argumentsLettre: ['mettre mon organisation et mon goût pour la culture au service du public'],
    pistesEntretien: ['Décrire une animation ou un conseil de lecture proposé au public.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Environnement / Énergie ----------
  {
    id: 'technicien_eolien', nom: 'Technicien de maintenance éolienne', famille: 'Énergie et environnement', secteur: 'Industrie, production et énergie',
    rome: 'I1321', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Technicien / Technicienne de maintenance d'eoliennes",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/I1321/technicien-technicienne-de-maintenance-eoliennes)
    activites: ['machines', 'outils'], actions: ['reparer', 'diagnostiquer', 'controler'],
    environnement: ['exterieur'], valeurs: ['exterieur', 'evolution', 'missions_variees'],
    savoirFaire: ['Technique', 'Maintenance', 'Diagnostic', 'Surveillance'], savoirEtre: ['Sécurité', 'Rigueur', 'Autonomie', 'Esprit d\'équipe'],
    savoirs: ['Fonctionnement des éoliennes', 'Travail en hauteur'],
    argumentsCV: ['assurer la maintenance d\'installations éoliennes'],
    argumentsLettre: ['contribuer au développement des énergies renouvelables'],
    pistesEntretien: ['Décrire une intervention de maintenance en hauteur.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'agent_collecte_dechets', nom: 'Agent de collecte des dechets', famille: 'Énergie et environnement', secteur: 'Propreté et gestion des déchets',
    rome: 'K2303', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Equipier / Equipiere de collecte de dechets" (appellation officielle
    // "Agent / Agente de collecte de dechets" incluse),
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K2303/equipier-equipiere-de-collecte-de-dechets)
    activites: ['vehicules', 'exterieur'], actions: ['transporter', 'nettoyer'],
    environnement: ['exterieur', 'route'], valeurs: ['exterieur', 'horaires_fixes', 'metier_sens'],
    savoirFaire: ['Collecte', 'Manutention', 'Vigilance'], savoirEtre: ['Endurance', 'Sécurité', 'Rigueur', 'Sang-froid'],
    savoirs: ['Tri et gestion des déchets'],
    argumentsCV: ['assurer la collecte et le tri des déchets dans le respect des consignes de sécurité'],
    argumentsLettre: ['contribuer à la propreté et à la gestion environnementale du territoire'],
    pistesEntretien: ['Décrire l\'organisation d\'une tournée de collecte.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'technicien_eaux', nom: 'Technicien de traitement des eaux', famille: 'Énergie et environnement', secteur: 'Propreté et gestion des déchets',
    rome: 'K2322', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/K2322/technicien-technicienne-en-traitement-des-eaux)
    activites: ['machines', 'outils'], actions: ['controler', 'diagnostiquer'],
    environnement: ['exterieur', 'usine'], valeurs: ['stabilite', 'metier_sens'],
    savoirFaire: ['Diagnostic', 'Technique', 'Maintenance', 'Rédaction'], savoirEtre: ['Rigueur', 'Sécurité', 'Autonomie', 'Esprit d\'équipe', 'Réactivité'],
    savoirs: ['Traitement et analyse de l\'eau'],
    argumentsCV: ['assurer le suivi et le contrôle d\'installations de traitement des eaux'],
    argumentsLettre: ['contribuer à la qualité et à la gestion des ressources en eau'],
    pistesEntretien: ['Décrire un contrôle de qualité de l\'eau réalisé.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },

  // ---------- Administration / collectivite ----------
  {
    id: 'agent_polyvalent_collectivite', nom: 'Agent polyvalent de collectivite', famille: 'Administration et gestion', secteur: 'Administration, gestion et bureau',
    rome: 'I1203', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Agent / Agente d'entretien du batiment" (appellation exacte "Agent
    // d'entretien maintenance polyvalent en collectivite"),
    // https://candidat.francetravail.fr/metierscope -- recherche "agent polyvalent").
    // ATTENTION Denis : ce ROME classe ce metier chez France Travail dans le
    // secteur "Maintenance, entretien et nettoyage", pas "Administration,
    // gestion et bureau" comme ici. Laisse tel quel (choix de classification
    // deja fait pour cette base), a reconsiderer si besoin.
    activites: ['documents', 'exterieur', 'clients'], actions: ['organiser', 'nettoyer', 'accueillir'],
    environnement: ['administration', 'exterieur'], valeurs: ['stabilite', 'missions_variees'],
    savoirFaire: ['Maintenance', 'Réparation', 'Travail manuel', 'Diagnostic', 'Entretien'], savoirEtre: ['Adaptabilité', 'Organisation', 'Sens du service', 'Autonomie', 'Réactivité'],
    savoirs: ['Fonctionnement des services publics locaux'],
    argumentsCV: ['assurer des missions polyvalentes au service d\'une collectivité'],
    argumentsLettre: ['mettre ma polyvalence au service d\'une collectivité locale'],
    pistesEntretien: ['Décrire la diversité des missions réalisées au sein d\'une collectivité.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  // TACHE (retour utilisateur : catalogue "Animaux", point 13) : 5
  // nouveaux metiers, prealables indispensables au catalogue -- sans eux,
  // la plupart de ses entrees n'auraient eu aucun metier reel a proposer
  // derriere (seuls Apiculteur et Toiletteur animalier existaient avant).
  {
    id: 'veterinaire', nom: 'Vétérinaire', famille: 'Santé animale', secteur: 'Métiers animaliers',
    rome: 'A1504', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1504/veterinaire
    // -- metier reglemente (diplome d'Etat + inscription a l'Ordre).
    activites: ['patients', 'outils'], actions: ['soigner', 'diagnostiquer'],
    environnement: ['sante'], valeurs: ['metier_sens', 'contact_humain'],
    savoirFaire: ['Diagnostic', 'Soins'], savoirEtre: ['Empathie', 'Rigueur', 'Responsabilité', 'Communication'],
    savoirs: ['Notions médicales de base', 'Pharmacologie'],
    argumentsCV: ['assurer le diagnostic et les soins des animaux dans le respect de leur bien-être'],
    argumentsLettre: ['mettre ma rigueur et mon empathie au service de la santé animale'],
    pistesEntretien: ['Décrire une consultation ou une intervention marquante.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'auxiliaire_veterinaire', nom: 'Auxiliaire vétérinaire', famille: 'Santé animale', secteur: 'Métiers animaliers',
    rome: 'A1501', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1501/auxiliaire-veterinaire)
    activites: ['patients', 'clients'], actions: ['soigner', 'accueillir'],
    environnement: ['sante'], valeurs: ['metier_sens', 'contact_humain'],
    savoirFaire: ['Soins', 'Assistance', 'Gestion des stocks'], savoirEtre: ['Empathie', 'Patience', 'Rigueur', 'Réactivité', 'Accueil'],
    savoirs: ['Notions médicales de base', 'Hygiène et asepsie en cabinet vétérinaire'],
    argumentsCV: ['assister le vétérinaire et accueillir les propriétaires d\'animaux'],
    argumentsLettre: ['mettre mon sens de l\'accueil et mon amour des animaux au service d\'un cabinet vétérinaire'],
    pistesEntretien: ['Décrire l\'accueil d\'un propriétaire inquiet pour son animal.'],
    synonymes: ['ASV'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'agent_equestre', nom: 'Agent équestre / Palefrenier', famille: 'Agriculture et viticulture', secteur: 'Métiers animaliers',
    rome: 'A1421', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Palefrenier soigneur / Palefreniere soigneuse",
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1421/palefrenier-soigneur-palefreniere-soigneuse)
    activites: ['exterieur', 'outils'], actions: ['soigner', 'nettoyer'],
    environnement: ['exploitation_agricole', 'exterieur'], valeurs: ['exterieur', 'metier_sens'],
    savoirFaire: ['Soins', 'Entretien'], savoirEtre: ['Rigueur', 'Endurance', 'Autonomie'],
    savoirs: ['Alimentation et santé du cheval', 'Contention animale'],
    argumentsCV: ['assurer les soins quotidiens et l\'entretien des chevaux et de leurs installations'],
    argumentsLettre: ['mettre mon endurance et mon sens du soin au service d\'une structure équestre'],
    pistesEntretien: ['Décrire une journée type auprès des chevaux.'],
    synonymes: ['palefrenier', 'lad'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'eleveur', nom: 'Éleveur', famille: 'Agriculture et viticulture', secteur: 'Agriculture, nature et espaces verts',
    rome: null, fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16) : pas de code
    // ROME generique "Eleveur" -- le referentiel decoupe par espece (A1407
    // bovins, A1410 ovins/caprins, A1411 porcins, A1439 equides, A1409
    // volailles/lapins...). Laisse a null plutot que de choisir une espece
    // au hasard ; POINT A TRANCHER AVEC DENIS si cette fiche doit rester
    // generique ou etre declinee par filiere.
    activites: ['exterieur', 'outils'], actions: ['soigner', 'gerer'],
    environnement: ['exploitation_agricole', 'exterieur'], valeurs: ['exterieur', 'autonomie', 'metier_sens'],
    savoirFaire: ['Soins', 'Gestion administrative', 'Négociation'], savoirEtre: ['Autonomie', 'Rigueur', 'Endurance', 'Organisation'],
    savoirs: ['Alimentation et reproduction animale'],
    argumentsCV: ['assurer le suivi sanitaire et la gestion d\'un cheptel'],
    argumentsLettre: ['contribuer à la production animale locale, un secteur qui me tient à cœur'],
    pistesEntretien: ['Décrire une tâche d\'élevage réalisée au fil des saisons.'],
    synonymes: [], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'agent_animalier', nom: 'Agent animalier', famille: 'Services', secteur: 'Métiers animaliers',
    rome: 'A1506', fap: null,
    // TACHE (chantier competences, enrichissement 2026-09-16, fiche officielle
    // "Soigneur animalier / Soigneuse animaliere" (parcs, refuges, elevages),
    // https://candidat.francetravail.fr/metierscope/fiche-metier/A1506/soigneur-animalier-soigneuse-animaliere)
    activites: ['clients', 'outils'], actions: ['soigner', 'nettoyer', 'accueillir'],
    environnement: ['espaces_verts', 'exterieur'], valeurs: ['metier_sens', 'contact_humain'],
    savoirFaire: ['Soins', 'Entretien', 'Observation'], savoirEtre: ['Empathie', 'Rigueur', 'Patience', 'Persévérance'],
    savoirs: ['Comportement animalier de base'],
    argumentsCV: ['assurer les soins quotidiens et l\'entretien des espaces d\'un refuge ou d\'un parc animalier'],
    argumentsLettre: ['mettre mon sens du soin et ma patience au service du bien-être animal'],
    pistesEntretien: ['Décrire une situation de prise en charge d\'un animal difficile.'],
    synonymes: ['soigneur animalier'], motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  },
  {
    id: 'gendarme', nom: 'Gendarme', famille: 'Sécurité et défense', secteur: 'Sécurité',
    rome: 'K1706', fap: null,
    // TACHE (ajout manuel, verifie) : identifiants reels, confirmes dans
    // les 4 catalogues existants -- pas de mots inventes.
    activites: ['clients', 'vehicules', 'documents', 'collegues'],
    actions: ['controler', 'aider', 'conduire', 'rediger'],
    environnement: ['administration', 'exterieur'],
    valeurs: ['metier_sens', 'responsabilites', 'stabilite', 'travail_equipe'],
    savoirFaire: ['Intervention', 'Rédaction de procédures', 'Secourisme'],
    savoirEtre: ['Rigueur', 'Sang-froid', 'Sens du devoir', 'Esprit d\'équipe', 'Discrétion'],
    savoirs: ['Droit pénal', 'Procédure judiciaire', 'Sécurité publique'],
    argumentsCV: ['protéger et assister le public au quotidien, avec rigueur et sang-froid'],
    argumentsLettre: ['contribuer à la sécurité et à la protection des citoyens, dans le respect strict de la loi'],
    pistesEntretien: ['Décrire une situation gérée avec calme malgré un contexte tendu ou imposé.'],
    synonymes: ['gendarme adjoint', 'sous-officier de gendarmerie', 'militaire de la gendarmerie'],
    motsCles: [], conceptsAssocies: [],
    niveauPertinence: null
  }
];

/* ------------------------------------------------------------
   SECTEURS_APP -- liste controlee des secteurs de metier (chantier
   "Candidater depuis la recherche + secteurs", sous-lot 1, 2026-09-04).
   C'est desormais la SEULE valeur acceptee pour <fiche>.secteur sur les 129
   fiches de baseMetiers ci-dessus. Verifie par tests/secteursMetiers.test.js.
   Ordre = ordre d'affichage (nombre de fiches decroissant). Les fiches de
   secteur (explication) + les metiers phares = sous-lot 2 (data/secteurs.js).
   ------------------------------------------------------------ */
var SECTEURS_APP = [
  { cle: "btp", libelle: "B\u00e2timent et travaux publics" },
  { cle: "industrie", libelle: "Industrie, production et \u00e9nergie" },
  { cle: "hotellerie-restauration", libelle: "H\u00f4tellerie, restauration et tourisme" },
  { cle: "agriculture-nature", libelle: "Agriculture, nature et espaces verts" },
  { cle: "transport-logistique", libelle: "Transport et logistique" },
  { cle: "sante", libelle: "Sant\u00e9 et soins" },
  { cle: "social-personne", libelle: "Social et services \u00e0 la personne" },
  { cle: "commerce-vente", libelle: "Commerce et vente" },
  { cle: "administration", libelle: "Administration, gestion et bureau" },
  { cle: "communication-culture", libelle: "Communication, culture et \u00e9v\u00e9nementiel" },
  { cle: "animalier", libelle: "M\u00e9tiers animaliers" },
  { cle: "proprete", libelle: "Propret\u00e9 et gestion des d\u00e9chets" },
  { cle: "sport-animation", libelle: "Sport, animation et loisirs" },
  { cle: "numerique", libelle: "Informatique et num\u00e9rique" },
  { cle: "banque-assurance-immobilier", libelle: "Banque, assurance et immobilier" },
  { cle: "artisanat", libelle: "Artisanat et cr\u00e9ation" },
  { cle: "artisanat-bouche", libelle: "M\u00e9tiers de bouche (artisanat)" },
  { cle: "education-formation", libelle: "\u00c9ducation et formation" },
  { cle: "automobile", libelle: "M\u00e9canique et automobile" },
  { cle: "securite", libelle: "S\u00e9curit\u00e9" },
  { cle: "coiffure-esthetique", libelle: "Coiffure et esth\u00e9tique" }
];

/* Groupements de metiers "connaissance generale" (ex-SECTEURS_ALIMENTAIRE_SAISONNIER
   / SECTEURS_QUI_RECRUTENT_GENERALEMENT de js/app.js, qui filtraient sur des
   LIBELLES de secteur disparus a la fusion). Passes en IDENTIFIANTS de metier :
   memes membres exactement (calcul sur les anciens libelles, sur les 129 fiches),
   filtrage plus robuste. Purement informatif, jamais une statistique de marche.
   Consommes par metiersSaisonnierAlimentaire() / metiersQuiRecrutentGeneralement()
   / le tri de pistesRecommandees() (js/app.js). */
var METIERS_SAISONNIER_ALIMENTAIRE = [
  "serveur", "cuisinier", "ouvrier_agricole", "employe_polyvalent_restauration",
  "plongeur", "receptionniste", "employe_etage", "barman", "accueil_touristique",
  "ouvrier_horticole", "conducteur_engins_agricoles", "operateur_agroalimentaire",
  "operateur_decoupe", "vendeur_alimentation", "boulanger", "boucher", "arboriculteur",
  "apiculteur", "patissier", "chef_cuisine", "sommelier", "guide_touristique",
  "concierge_hotel", "chef_reception", "agent_equestre", "eleveur"
];
var METIERS_QUI_RECRUTENT_GENERALEMENT = [
  "employe_libre_service", "preparateur_commandes", "cariste", "chauffeur_livreur",
  "chauffeur_routier", "agent_entretien", "advf", "aide_soignant", "infirmier", "macon",
  "peintre", "plombier", "electricien", "agent_securite", "ash", "aes", "menage_domicile",
  "secretaire_medicale", "ambulancier", "manoeuvre_btp", "menuisier_poseur", "plaquiste",
  "couvreur", "conducteur_engins_chantier", "conducteur_bus", "manutentionnaire",
  "charpentier", "carreleur", "chef_chantier", "grutier", "logisticien", "agent_tri",
  "livreur_velo", "garde_enfants_domicile", "assistant_dentaire", "preparateur_pharmacie",
  "brancardier", "veterinaire", "auxiliaire_veterinaire"
];

/* ------------------------------------------------------------
   MOTEUR DE SCORE
   Pondération (total = 100) :
   Activités 25, Actions 25, Savoir-faire 20, Savoir-être 15,
   Savoirs 10, Valeurs + environnement 5.
   Note : si le profil ne contient aucun "savoirs" (cas actuel de
   l'application), la pondération est automatiquement redistribuée
   pour que le score reste sur 100.
   ------------------------------------------------------------ */

const PONDERATION = {
  activites: 25,
  actions: 25,
  savoirFaire: 20,
  savoirEtre: 15,
  savoirs: 10,
  valeursEnvironnement: 5
};

function normaliserTexte(texte) {
  return String(texte)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_-]/g, " ")
    .trim();
}

// Découpe un libellé en mots-clés normalisés (le "s" final est retiré
// pour que "clients" corresponde à "client").
function motsCles(texte) {
  return normaliserTexte(texte)
    .split(/\s+/)
    .filter(function (mot) { return mot.length >= 3; })
    .map(function (mot) {
      return mot.length > 3 && mot.charAt(mot.length - 1) === "s" ? mot.slice(0, -1) : mot;
    });
}

// Deux libellés correspondent si identiques après normalisation, ou si
// tous les mots-clés du plus court se retrouvent dans le plus long
// ("client" correspond à "Relation client", mais "reparer" ne
// correspond pas à "preparer").
function correspond(a, b) {
  var na = normaliserTexte(a);
  var nb = normaliserTexte(b);
  if (na === nb) return true;
  var motsA = motsCles(a);
  var motsB = motsCles(b);
  if (motsA.length === 0 || motsB.length === 0) return false;
  var court = motsA.length <= motsB.length ? motsA : motsB;
  var long_ = motsA.length <= motsB.length ? motsB : motsA;
  return court.every(function (mot) { return long_.indexOf(mot) !== -1; });
}

// Compare une liste du profil avec une liste du métier.
// Le taux est calculé par rapport à la plus petite des deux listes :
// si la personne a coché 2 éléments et que les 2 correspondent,
// la catégorie est pleinement couverte.
function comparerListes(listeProfil, listeMetier) {
  var profil = Array.isArray(listeProfil) ? listeProfil : [];
  var metier = Array.isArray(listeMetier) ? listeMetier : [];
  if (profil.length === 0 || metier.length === 0) {
    return { taux: 0, correspondances: [], vide: profil.length === 0 };
  }
  var correspondances = metier.filter(function (itemMetier) {
    return profil.some(function (itemProfil) { return correspond(itemProfil, itemMetier); });
  });
  var referentiel = Math.min(metier.length, profil.length);
  return {
    taux: Math.min(correspondances.length / referentiel, 1),
    correspondances: correspondances,
    vide: false
  };
}

function calculerScoreMetier(profil, metier) {
  var points = 0;
  var poidsUtilise = 0;
  var raisons = [];

  function ajouter(resultat, poids, formatRaison) {
    if (!resultat.vide) {
      points += resultat.taux * poids;
      poidsUtilise += poids;
      resultat.correspondances.forEach(function (c) { raisons.push(formatRaison(c)); });
    }
  }

  ajouter(comparerListes(profil.activites, metier.activites), PONDERATION.activites,
    function (c) { return "Vous aimez travailler " + libelleActivite(c); });
  ajouter(comparerListes(profil.actions, metier.actions), PONDERATION.actions,
    function (c) { return "Vous aimez " + normaliserTexte(c); });
  ajouter(comparerListes(profil.savoirFaire, metier.savoirFaire), PONDERATION.savoirFaire,
    function (c) { return "Savoir-faire en commun : " + c; });
  ajouter(comparerListes(profil.savoirEtre, metier.savoirEtre), PONDERATION.savoirEtre,
    function (c) { return "Savoir-etre en commun : " + c; });
  ajouter(comparerListes(profil.savoirs, metier.savoirs), PONDERATION.savoirs,
    function (c) { return "Connaissance utile : " + c; });

  var rValeurs = comparerListes(profil.valeurs, metier.valeurs);
  var rEnv = comparerListes(profil.environnement, metier.environnement);
  if (!rValeurs.vide || !rEnv.vide) {
    var tauxVE = ((rValeurs.vide ? 0 : rValeurs.taux) + (rEnv.vide ? 0 : rEnv.taux)) /
      ((rValeurs.vide ? 0 : 1) + (rEnv.vide ? 0 : 1));
    points += tauxVE * PONDERATION.valeursEnvironnement;
    poidsUtilise += PONDERATION.valeursEnvironnement;
    rEnv.correspondances.forEach(function (c) { raisons.push("Environnement souhaite : " + normaliserTexte(c)); });
    rValeurs.correspondances.forEach(function (c) { raisons.push("Valeur partagee : " + normaliserTexte(c)); });
  }

  var score = poidsUtilise > 0 ? Math.round((points / poidsUtilise) * 100) : 0;

  var copie = {};
  for (var cle in metier) { copie[cle] = metier[cle]; }
  copie.score = score;
  copie.raisons = raisons;
  return copie;
}

// Libellés lisibles pour les identifiants d'activités
function libelleActivite(id) {
  var libelles = {
    clients: "avec des clients",
    machines: "avec des machines",
    enfants: "avec des enfants",
    personnes_agees: "avec des personnes âgées",
    collegues: "en équipe",
    seul: "de façon autonome",
    exterieur: "en extérieur",
    magasin: "en magasin",
    bureau: "en bureau",
    deplacement: "en déplacement"
  };
  return libelles[id] || normaliserTexte(id);
}

/* ------------------------------------------------------------
   FONCTION PRINCIPALE
   profil = { activites, actions, environnement, valeurs,
              savoirFaire, savoirEtre, savoirs } (champs facultatifs)
   Retourne les 5 meilleurs métiers (score > 0), triés.
   ------------------------------------------------------------ */

function rechercherMetiers(profil, nombreMax) {
  var max = nombreMax || 5;
  var p = profil || {};
  var profilComplet = {
    activites: p.activites || [],
    actions: p.actions || [],
    environnement: p.environnement || [],
    valeurs: p.valeurs || [],
    savoirFaire: p.savoirFaire || [],
    savoirEtre: p.savoirEtre || [],
    savoirs: p.savoirs || []
  };

  // Compatibilité : un champ "competences" non trié est fusionné
  // dans savoir-faire et savoir-être.
  if (Array.isArray(p.competences) && p.competences.length > 0) {
    profilComplet.savoirFaire = profilComplet.savoirFaire.concat(p.competences);
    profilComplet.savoirEtre = profilComplet.savoirEtre.concat(p.competences);
  }

  return baseMetiers
    .map(function (metier) { return calculerScoreMetier(profilComplet, metier); })
    .map(function (metier) {
      // "J'accepte egalement" : bonus applique uniquement aux metiers deja
      // compatibles (score > 0), pour elargir sans jamais proposer un metier
      // sans rapport avec les competences de la personne.
      if (metier.score > 0 && p.accepte && p.accepte.length) {
        var bonus = 0;
        if (p.accepte.indexOf('alimentaire') !== -1 && METIERS_ALIMENTAIRE.indexOf(metier.id) !== -1) { bonus += 10; }
        if (p.accepte.indexOf('saisonnier') !== -1 && METIERS_SAISONNIERS.indexOf(metier.id) !== -1) { bonus += 10; }
        if (bonus > 0) { metier.score = Math.min(100, metier.score + bonus); }
      }
      return metier;
    })
    .filter(function (metier) { return metier.score > 0; })
    .sort(function (a, b) { return b.score - a.score; })
    .slice(0, max);
}

/* ------------------------------------------------------------
   AFFICHAGE (Bootstrap 5)
   conteneur.innerHTML = genererHTMLMetiers(metiers);
   ------------------------------------------------------------ */

function couleurBarre(score) {
  if (score >= 70) return "bg-success";
  if (score >= 45) return "bg-info";
  if (score >= 25) return "bg-warning";
  return "bg-secondary";
}

function genererHTMLMetiers(metiers) {
  if (!metiers || metiers.length === 0) {
    return '<div class="alert alert-light border">' +
      "Aucun métier ne ressort pour le moment. " +
      "Complétez davantage de choix pour affiner les résultats." +
      "</div>";
  }

  // TACHE (retour utilisateur 2026-09-13) : "je veux avoir toutes les
  // recommandations sur deux colonnes, pour optimiser l'espace" -- les
  // cartes etaient empilees en pleine largeur les unes sous les autres
  // (grille .pourquoi-metiers-grille, css/style.css, repli 1 colonne sous
  // 700px).
  var html = "";
  metiers.forEach(function (metier) {
    var raisonsHTML = metier.raisons
      .slice(0, 4)
      .map(function (r) { return '<li class="small text-muted">&#10004; ' + r + "</li>"; })
      .join("");

    html +=
      '<div class="card mb-3 shadow-sm">' +
        '<div class="card-body">' +
          '<div class="d-flex justify-content-between align-items-center mb-2 flex-wrap gap-2">' +
            '<h5 class="card-title mb-0">' + metier.nom + "</h5>" +
            '<a href="' + lienFicheROME(metier) + '" target="_blank" rel="noopener" ' +
  'class="badge bg-light text-dark border text-decoration-none" ' +
  'title="Voir la fiche métier sur France Travail">' +
  metier.secteur + " &middot; ROME " + metier.rome + " &#x1F517;" +
"</a>" +
          "</div>" +
          (metier.sansScore
            ? '<p class="small text-success mb-2">&#10004; Métier ouvert aux débutants, sans expérience exigée.</p>'
            : '<div class="progress mb-2" style="height:18px;" role="progressbar" ' +
              'aria-valuenow="' + metier.score + '" aria-valuemin="0" aria-valuemax="100">' +
              '<div class="progress-bar ' + couleurBarre(metier.score) + '" ' +
                'style="width:' + metier.score + '%;">' +
                metier.score + " % de cohérence" +
              "</div></div>") +
          (raisonsHTML
            ? '<p class="mb-1 fw-semibold small">Pourquoi ce métier ?</p>' +
              '<ul class="list-unstyled mb-0">' + raisonsHTML + "</ul>"
            : "") +
          // TACHE (Contrat d'ancrage ERIP v1, chantier 2 -- docs/CHANTIER_JOURNAL_DE_PARCOURS.md) :
          // meme mecanisme que sur le Bilan CV. Seul appelant reel de
          // genererHTMLMetiers() (voir contenuPourquoiMetiers(), js/app.js) --
          // le point d'insertion reste donc precis, jamais partage avec les
          // chips compactes (carteMetierResumeHTML()), trop denses pour
          // porter ce bouton.
          (typeof reperesBoutonAncre === "function"
            ? '<div class="mt-2">' + reperesBoutonAncre({ libelle: "Métier suggéré : " + metier.nom }) + "</div>"
            : "") +
        "</div>" +
      "</div>";
  });
  return '<div class="pourquoi-metiers-grille">' + html + '</div>';
}

// Lien direct vers la fiche métier MétierScope (France Travail).
// Le code ROME suffit, France Travail complète l'adresse tout seul.
function lienFicheROME(metier) {
  return "https://candidat.francetravail.fr/metierscope/fiche-metier/" + metier.rome;
}

// Retrouve une fiche de la base a partir d'un nom saisi (souple : accents,
// pluriels, correspondance partielle). Renvoie null si rien ne matche.
function metierParNom(nom) {
  var cible = normaliserTexte(nom);
  if (cible.length < 3) { return null; }
  // 1. correspondance exacte (nom court sans / ni parenthese)
  for (var i = 0; i < baseMetiers.length; i++) {
    var court = normaliserTexte(baseMetiers[i].nom.split('/')[0].split('(')[0]);
    if (court === cible || normaliserTexte(baseMetiers[i].nom) === cible) { return baseMetiers[i]; }
  }
  // 2. correspondance partielle par mots-cles
  for (var j = 0; j < baseMetiers.length; j++) {
    if (correspond(nom, baseMetiers[j].nom.split('/')[0].split('(')[0])) { return baseMetiers[j]; }
  }
  return null;
}

// TACHE (chantier competences, etape 7, 2026-09-16,
// docs/PLAN_COMPETENCES_2026-09-15.md) : metiersPourCompetence(),
// fermerFenetreCompetence() et ouvrirFenetreCompetence() supprimees --
// code mort confirme (aucun appelant dans tout le depot, verifie par grep
// avant suppression), orphelin depuis le tout premier commit du depot
// (retrait de son declencheur pour un bug de fenetres superposees, jamais
// pour un defaut de fond -- voir docs/CHANTIER_COMPETENCES.md section 4.1).
// Le principe utile (tri par pertinence d'une liste de metiers deja
// filtree par competence) est repris par metiersTriesParPertinence()
// (js/app.js, etape 3 du meme chantier), qui reutilise calculerScoreMetier()
// au lieu d'une ponderation isolee.

// TACHE (retour utilisateur : fenetres superposees) : l'ancien detecteur
// global de clic sur les badges de competence (ouvrirFenetreCompetence) a
// ete retire -- il reagissait a n'importe quel badge vert/bleu/cyan sur
// TOUTE la page, y compris ceux deja geres explicitement par le systeme
// plus recent (app.js, data-competence-nom + ouvrirPanneauChoixMetiersAssocies()/
// ouvrirDescriptifMetier()), ce qui ouvrait les 2 fenetres en meme temps sur
// un seul clic. Le systeme app.js couvre deja tous les badges cliquables
// existants de maniere explicite (attribut dedie, cablage precis) : plus
// besoin d'une detection automatique globale en parallele. Le style
// (curseur + survol) reste, ces badges restent visuellement cliquables.
(function () {
  if (typeof document === 'undefined') { return; }

  // Curseur main + effet de survol sur les badges cliquables
  var style = document.createElement('style');
  style.textContent =
    'span.badge.bg-success, span.badge.bg-primary, span.badge.bg-info { cursor: pointer; transition: 0.15s; } ' +
    'span.badge.bg-success:hover, span.badge.bg-primary:hover, span.badge.bg-info:hover ' +
    '{ transform: scale(1.07); box-shadow: 0 3px 10px rgba(0,0,0,0.25); }';
  (document.head || document.documentElement).appendChild(style);
})();
/* ------------------------------------------------------------
   METIERS ACCESSIBLES SANS EXPERIENCE
   ------------------------------------------------------------ */

var METIERS_DEBUTANTS = [
  "manoeuvre_btp", "employe_libre_service", "plongeur",
  "employe_polyvalent_restauration", "agent_entretien", "manutentionnaire",
  "preparateur_commandes", "ouvrier_agricole", "ouvrier_horticole",
  "employe_etage", "agent_proprete_urbaine", "hote_caisse",
  "menage_domicile", "ash", "agent_accueil", "teleconseiller",
  "conducteur_engins_chantier", "agent_securite", "vendeur_alimentation",
  "ouvrier_chai", "cariste"
];

// "J'accepte egalement" : metiers a retour rapide a l'emploi (Emploi alimentaire)
var METIERS_ALIMENTAIRE = [
  "preparateur_commandes", "cariste", "manutentionnaire", "chauffeur_livreur",
  "employe_libre_service", "hote_caisse", "vendeur_alimentation", "conseiller_vente",
  "serveur", "employe_polyvalent_restauration", "plongeur", "cuisinier",
  "agent_entretien", "agent_proprete_urbaine", "menage_domicile",
  "ouvrier_agricole", "ouvrier_horticole", "agent_production",
  "operateur_agroalimentaire", "manoeuvre_btp", "ash"
];

// "J'accepte egalement" : metiers saisonniers (Emploi saisonnier)
var METIERS_SAISONNIERS = [
  "ouvrier_chai", "ouvrier_agricole", "conducteur_engins_agricoles", "ouvrier_horticole",
  "serveur", "cuisinier", "employe_polyvalent_restauration", "plongeur", "barman",
  "receptionniste", "employe_etage", "accueil_touristique", "animateur"
];

function rechercherMetiersDebutants(nombreMax) {
  var max = nombreMax || 5;
  var ids = METIERS_DEBUTANTS.slice();
  for (var i = ids.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = ids[i]; ids[i] = ids[j]; ids[j] = tmp;
  }
  var resultats = [];
  ids.slice(0, max).forEach(function (id) {
    var metier = null;
    for (var k = 0; k < baseMetiers.length; k++) {
      if (baseMetiers[k].id === id) { metier = baseMetiers[k]; break; }
    }
    if (metier) {
      var copie = {};
      for (var cle in metier) { copie[cle] = metier[cle]; }
      copie.sansScore = true;
      copie.raisons = [
        "Recrute sans expérience préalable",
        "Formation assurée à la prise de poste"
      ];
      resultats.push(copie);
    }
  });
  return resultats;
}

function rienEteChoisi() {
  if (typeof dossier === 'undefined' || !dossier) { return true; }
  var total = (dossier.activites || []).length + (dossier.actions || []).length +
    (dossier.environnement || []).length + (dossier.valeurs || []).length +
    (dossier.loisirs || []).length + (dossier.engagements || []).length +
    (dossier.experiencesPerso || []).length;
  return total === 0 && !dossier.cvAnalyse;
}

function metiersPourAffichage() {
  if (rienEteChoisi()) { return rechercherMetiersDebutants(); }
  var resultats = rechercherMetiers(construireProfil());
  return resultats.length > 0 ? resultats : rechercherMetiersDebutants();
}

function chargerScript(url) {
  return new Promise(function (ok, ko) {
    var s = document.createElement('script');
    s.src = url; s.onload = ok; s.onerror = ko;
    document.head.appendChild(s);
  });
}

// ============================================================
// DETECTION INTELLIGENTE DU DOCUMENT DEPOSE (Tache 1)
// ------------------------------------------------------------
// Objectif unique de cette tache : DETECTER, jamais BLOQUER ni MODIFIER
// l'interface (Tache 2) ni le champ de depot lui-meme (accept=".pdf,.docx,
// .txt" -- l'elargir aux images fait partie de la Tache 2, pas de celle-ci).
// Ces fonctions sont pensees pour etre testables independamment de tout
// depot reel de fichier.
// ============================================================

// Seuil INDICATIF, pas une regle rigide -- sert uniquement a distinguer
// "peu de texte" de "texte detecte". Un chiffre de depart raisonnable,
// ajustable si l'usage reel montre qu'il est mal calibre (aucune science
// exacte derriere ce nombre).
var SEUIL_MOTS_PEU_DE_TEXTE = 30;

// Type de fichier, uniquement d'apres son nom -- ne prejuge jamais de son
// contenu reel (un .pdf peut etre du texte ou un scan, voir plus bas).
function detecterTypeFichier(nomFichier) {
  var nom = (nomFichier || '').toLowerCase();
  if (nom.endsWith('.txt')) { return 'txt'; }
  if (nom.endsWith('.docx')) { return 'docx'; }
  if (nom.endsWith('.pdf')) { return 'pdf'; }
  if (/\.(jpe?g|png|webp|heic|heif|gif|bmp)$/.test(nom)) { return 'image'; }
  return 'inconnu';
}

// Evaluation PROGRESSIVE du texte extrait -- jamais un simple seuil
// binaire "assez/pas assez". 3 niveaux, comme demande : aucun, peu,
// detecte. Compte les mots plutot que les caracteres (plus robuste face a
// des espaces multiples issus de l'extraction PDF).
function evaluerNiveauTexte(texteExtrait) {
  var texte = (texteExtrait || '').trim();
  if (!texte) { return 'aucun'; }
  var nbMots = texte.split(/\s+/).filter(Boolean).length;
  if (nbMots === 0) { return 'aucun'; }
  if (nbMots < SEUIL_MOTS_PEU_DE_TEXTE) { return 'peu'; }
  return 'detecte';
}

// Construit la recommandation (jamais un blocage, sauf le cas image/scan
// certain ou l'analyse rapide n'a tout simplement aucune matiere pour
// fonctionner -- ce n'est pas une restriction arbitraire, c'est un fait
// technique : l'analyse rapide ne sait lire que du texte).
//
// niveau : 'analyse_rapide_suffisante' | 'ia_fortement_recommandee' | 'ia_uniquement'
// texteDisponible : est-ce que le parcours "Analyse rapide" a
// seulement un sens a proposer pour ce document ?
function determinerRecommandationDocument(typeFichier, niveauTexte) {
  if (typeFichier === 'image') {
    return {
      niveau: 'ia_uniquement',
      texteDisponible: false,
      message: 'Votre document est une image ou un scan. Vous allez pouvoir le vérifier et masquer les ' +
        'informations sensibles avant de l\'envoyer à l\'assistant.'
    };
  }
  if (typeFichier === 'pdf') {
    if (niveauTexte === 'aucun') {
      return {
        niveau: 'ia_uniquement',
        texteDisponible: false,
        message: 'Votre document semble être un scan (aucun texte n\'a pu être lu directement). Vous allez ' +
          'pouvoir le vérifier et masquer les informations sensibles avant de l\'envoyer à l\'assistant.'
      };
    }
    if (niveauTexte === 'peu') {
      return {
        niveau: 'ia_fortement_recommandee',
        texteDisponible: true,
        message: 'Votre document semble contenir peu de texte directement lisible (peut-être un scan partiel ' +
          'ou une mise en page complexe). Vérifiez bien le texte extrait à l\'étape suivante avant de l\'envoyer.'
      };
    }
    return {
      niveau: 'analyse_rapide_suffisante',
      texteDisponible: true,
      message: 'Votre document semble être un texte exploitable. Vous allez pouvoir le vérifier et le corriger ' +
        'avant de l\'envoyer à l\'assistant.'
    };
  }
  // .docx et .txt : toujours consideres comme du texte, aucune ambiguite
  // possible pour ces formats (pas de notion de "docx scanne").
  return {
    niveau: 'analyse_rapide_suffisante',
    texteDisponible: true,
    message: 'Votre document semble être un texte exploitable. Vous allez pouvoir le vérifier et le corriger ' +
      'avant de l\'envoyer à l\'assistant.'
  };
}

// Point d'entree unique de cette tache : detecte le type, tente
// l'extraction si pertinent (reutilise lireFichierCV(), aucune logique
// d'extraction dupliquee), et retourne une recommandation structuree.
// Ne modifie jamais rien dans dossier -- fonction d'analyse pure, la
// decision de l'utiliser revient a la Tache 2 (interface).
function analyserDocumentDepose(fichier) {
  var typeFichier = detecterTypeFichier(fichier.name);

  if (typeFichier === 'image') {
    // Aucune tentative d'extraction : techniquement impossible aujourd'hui
    // (pas d'OCR cote client), et sans objet pour une image.
    return Promise.resolve({
      typeFichier: 'image',
      niveauTexte: null,
      texteExtrait: '',
      recommandation: determinerRecommandationDocument('image', null)
    });
  }

  if (typeFichier === 'inconnu') {
    return Promise.reject(new Error('Format non pris en charge.'));
  }

  return lireFichierCV(fichier).then(function (texte) {
    // .docx/.txt : toujours "detecte" (pas d'ambiguite pour ces formats).
    // .pdf : evaluation progressive reelle du texte obtenu.
    var niveauTexte = (typeFichier === 'pdf') ? evaluerNiveauTexte(texte) : 'detecte';
    return {
      typeFichier: typeFichier,
      niveauTexte: niveauTexte,
      texteExtrait: texte,
      recommandation: determinerRecommandationDocument(typeFichier, niveauTexte)
    };
  });
}

function lireFichierCV(fichier) {
  var nom = fichier.name.toLowerCase();
  if (nom.endsWith('.txt')) {
    return fichier.text();
  }
  if (nom.endsWith('.pdf')) {
    var promessePdf = window.pdfjsLib
      ? Promise.resolve()
      : chargerScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
    return promessePdf.then(function () {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      return fichier.arrayBuffer();
    }).then(function (donnees) {
      return window.pdfjsLib.getDocument({ data: donnees }).promise;
    }).then(function (pdf) {
      var pages = [];
      for (var i = 1; i <= pdf.numPages; i++) { pages.push(i); }
      return Promise.all(pages.map(function (num) {
        return pdf.getPage(num).then(function (page) {
          return page.getTextContent();
        }).then(function (contenu) {
          return contenu.items.map(function (item) { return item.str; }).join(' ');
        });
      }));
    }).then(function (textes) { return textes.join(' '); });
  }
  if (nom.endsWith('.docx')) {
    var promesseMammoth = window.mammoth
      ? Promise.resolve()
      : chargerScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
    return promesseMammoth.then(function () {
      return fichier.arrayBuffer();
    }).then(function (donnees) {
      return window.mammoth.extractRawText({ arrayBuffer: donnees });
    }).then(function (resultat) { return resultat.value; });
  }
  return Promise.reject(new Error('Format non pris en charge. Utilisez un fichier PDF, DOCX ou TXT.'));
}

function fermerFenetreCV() {
  var f = document.getElementById('fenetreCV');
  if (f) { f.remove(); }
}

// Complement tache 8 : le parametre "options" permet de reutiliser exactement cette
// fenetre depuis l'ecran ACTION (carte "Lettre de motivation") quand aucun CV n'est
// encore disponible. Seuls les textes et l'etape suivante changent :
// - options.titre / options.intro : textes adaptes au contexte
// - options.onTerminer() : appelee a la place de la navigation vers "objectif"
//   (le mode de creation du CV n'est alors pas modifie, car il ne s'agit pas du
//   parcours initial de creation du CV)
// ============================================================
// ASSISTANT DE DEPOT DU CV -- WIZARD
// ------------------------------------------------------------
// Remplace l'ancienne ouvrirFenetreCV() (retiree, Tache 6) -- point d'entree
// unique desormais pour le depot/analyse du CV et le contexte "lettre".
//
// Philosophie validee, valable pour TOUTES les etapes :
// - une etape = une responsabilite = une decision ;
// - jamais d'accumulation visuelle -- le contenu est INTEGRALEMENT
//   remplace a chaque etape, jamais empile (contrairement a l'ancienne
//   fenetre, qui grossissait au fil du parcours) ;
// - "Retour" ne fait jamais perdre une information deja saisie -- un etat
//   partage unique (etat), jamais recree entre deux etapes, que chaque
//   etape lit pour se pre-remplir plutot que repartir de zero.
// ============================================================

function fermerAssistantDepotCV() {
  var f = document.getElementById('assistantDepotCV');
  if (f) { f.remove(); }
}

// TACHE (retour utilisateur : "je veux le tel/mail en jaune pour les
// trouver plus facilement", option B validée) : detecte les telephones
// (formats francais courants, espaces/points/tirets optionnels) et les
// emails dans un texte, et affiche le resultat en lecture seule, en
// evidence (fond jaune), au-dessus du textarea correspondant -- jamais
// dans le textarea lui-meme (un <textarea> ne peut afficher aucune mise
// en forme). Purement indicatif : n'efface rien automatiquement, la
// personne reste seule a decider et a modifier le texte.
// TACHE (chantier "fenetre de verification unifiee") : detection etendue
// -- telephone/email deja existants, ajout URL generique + profils
// LinkedIn/GitHub (demande explicite). Nom/prenom volontairement EXCLU
// (refuse explicitement : trop complexe a fiabiliser pour la valeur
// ajoutee). LinkedIn/GitHub sont retires du texte AVANT la recherche
// d'URL generique pour ne jamais afficher deux fois la meme information
// (une fois comme "reseau", une fois comme "URL") -- une seule categorie
// par occurrence trouvee, la plus specifique.
// TACHE (point 2, stabilisation Bilan, 2026-08-22, DECISION DE DENIS :
// chercher d'abord la solution la moins risquee avant de conclure a
// l'impossibilite) : age et nom AJOUTES, mais seulement via des formes
// SANS AMBIGUITE -- jamais un "X ans" nu (rejete a dessein : "3 ans
// d'experience"/"5 ans de pratique" sont partout dans un CV, un faux
// positif y serait quasi systematique, exactement la raison qui avait
// deja fait ecarter le nom en 2026-08-08). "âgé(e) de X ans"/"né(e)
// le.../né(e) en 19XX/20XX" ne s'emploient jamais pour une duree
// d'experience -- precision elevee, quitte a rater les CV qui donnent
// simplement l'age sans cette formule. Meme logique pour le nom :
// seulement les formes EXPLICITEMENT introduites ("Nom :", "Prénom :",
// "Je m'appelle ...") -- un nom seul, sans etiquette, reste NON detecte
// (glisser vers une heuristique positionnelle/typographique reintroduirait
// exactement le risque de faux positifs deja ecarte pour la meme raison).
function detecterCoordonneesSensibles(texte) {
  var regexTelephone = /(?<!\d)0[1-9](?:[\s.\-]?\d{2}){4}(?!\d)|(?:\+33|00[\s.\-]?33)[\s.\-]?(?:\(0\)[\s.\-]?)?[1-9](?:[\s.\-]?\d{2}){4}/g;
  // TACHE (retour utilisateur 2026-09-17, bug reel confirme : "sophie.martin@email.frPermis"
  // -- un CV sans espace entre l'e-mail et le mot suivant faisait avaler ce
  // mot par la detection, {2,} etant glouton et n'ayant aucune raison de
  // s'arreter a "fr") : domaine plafonne a {2,4} (fr/com/net/org/info -- les
  // TLD reellement rencontres dans un CV francais).
  // TACHE (retour utilisateur 2026-09-17, suite -- "il n'y a que le numero
  // de telephone qui est repris, pas le courriel") : le correctif du dessus
  // rejetait ENTIEREMENT l'e-mail des qu'une lettre quelconque suivait le
  // TLD colle (cas le plus courant : extraction PDF qui perd le saut de
  // ligne entre l'e-mail et le mot suivant, ex. "...frPermis"). Affine :
  // le lookahead ne rejette plus que si le caractere suivant est une
  // MINUSCULE ou un chiffre (une vraie continuation du meme domaine, ex.
  // ".info" ne doit jamais etre coupe en ".in") -- une MAJUSCULE juste
  // apres (comme le "P" de "Permis") est au contraire un signal fiable de
  // mot colle par accident (aucun TLD reel ne continue par une majuscule),
  // donc desormais accepte comme fin de correspondance. Le risque de
  // troncature reel (couper un TLD plus long non enumere) reste couvert :
  // il ne peut survenir que si le caractere suivant est en minuscule, cas
  // toujours rejete comme avant.
  var regexEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,4}(?![a-z0-9])/g;
  // TACHE (retour utilisateur 2026-09-17, "il y a l'adresse, il y a le
  // mail, si on peut deja avancer avec ces informations la") : la rue
  // (numero + nom de voie) n'a aucune forme fiable a reconnaitre par regex
  // (aucun marqueur, format libre -- meme risque de faux positif que pour
  // le nom/prenom, deja ecarte pour la meme raison) -- non tentee. Le
  // code postal + ville, en revanche, a une forme quasi fixe en France (5
  // chiffres suivis d'un nom propre) : signal assez fiable pour etre
  // repris ici, memes precautions que le reste de cette fonction (mieux
  // vaut ne rien detecter qu'une valeur fausse). Plage 01000-98999 exclut
  // les faux codes (00000, 99000+) sans exclure les DOM (971xx-988xx).
  var regexCodePostalVille = /\b(?:0[1-9]|[1-9]\d)\d{3}[ \t]+[A-ZÀ-Ý][a-zà-ÿ'’]+(?:[ \t-][A-ZÀ-Ý][a-zà-ÿ'’]+)*\b/g;
  var regexReseau = /(?:https?:\/\/)?(?:[a-zA-Z0-9-]+\.)?(?:linkedin\.com\/(?:in|pub)\/[a-zA-Z0-9\-_%]+|github\.com\/[a-zA-Z0-9\-_]+)\/?/gi;
  var regexUrl = /(?:https?:\/\/[^\s,;()<>]+)|(?:\bwww\.[^\s,;()<>]+)/g;
  // TACHE (correctif, verifie en navigateur, 2026-08-22) : lookbehind
  // (?<![a-zà-ÿ]) a la place du \b initial -- \w (donc \b) ne reconnait en
  // JS que [A-Za-z0-9_], jamais les lettres accentuees : un \b colle a
  // "Âgé"/"Né" echouait silencieusement. Mais retirer purement et
  // simplement ce \b (1ere version) ouvrait un vrai risque de faux positif
  // signale par Denis : "ne" est la fin de nombreux mots ("usine",
  // "Domaine"...), donc "l'usine en 1990" aurait matche "ne en 1990" en
  // sous-chaine. Le lookbehind negatif redonne une vraie frontiere de mot,
  // compatible avec les lettres accentuees (deja utilise ailleurs dans ce
  // fichier pour le telephone, meme mecanisme).
  var regexAge = /(?<![a-zà-ÿ])âgée?\s+de\s+\d{1,2}\s*ans\b|(?<![a-zà-ÿ])n[ée]e?\s+le\s+\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4}\b|(?<![a-zà-ÿ])n[ée]e?\s+en\s+(?:19|20)\d{2}\b/gi;
  var regexNom = /\b(?:nom\s*:\s*|pr[ée]nom\s*:\s*|je\s+m['’]appelle\s+)[A-ZÀ-Ý][a-zà-ÿ'’-]+(?:\s+[A-ZÀ-Ý][A-Za-zà-ÿ'’-]+)?/gi;

  function dedupe(liste) { return liste.filter(function (v, i, arr) { return arr.indexOf(v) === i; }); }

  var telephones = dedupe(texte.match(regexTelephone) || []);
  var emails = dedupe(texte.match(regexEmail) || []);
  var codesPostauxVilles = dedupe(texte.match(regexCodePostalVille) || []);
  var reseaux = dedupe(texte.match(regexReseau) || []);
  var texteSansReseaux = reseaux.reduce(function (t, r) { return t.split(r).join(' '); }, texte);
  var urls = dedupe(texteSansReseaux.match(regexUrl) || []);
  var ages = dedupe(texte.match(regexAge) || []);
  // TACHE (point 2, suggestion de Denis, 2026-08-22) : croisement avec
  // l'email deja detecte -- si l'email contient "prenom.nom" (ou
  // "prenom_nom"/"prenom-nom") ET que ces 2 memes mots se retrouvent
  // COTE A COTE dans le texte (dans un ordre ou l'autre), c'est un signal
  // FORT (2 sources independantes qui se confirment), jamais un simple mot
  // capitalise seul -- exclut par construction le nom d'une entreprise
  // (qui n'a aucune raison de partager ses 2 morceaux avec l'email
  // personnel de la personne). Vient S'AJOUTER a regexNom (formes
  // etiquetees), jamais un remplacement.
  var nomsDepuisEmail = [];
  emails.forEach(function (email) {
    var local = (email.split('@')[0] || '');
    var jetons = local.split(/[._+-]/).filter(function (j) { return /^[a-zà-ÿ]{2,}$/i.test(j); });
    for (var i = 0; i < jetons.length - 1; i++) {
      var a = jetons[i], b = jetons[i + 1];
      var trouve = texte.match(new RegExp('\\b' + a + '\\s+' + b + '\\b', 'i')) ||
        texte.match(new RegExp('\\b' + b + '\\s+' + a + '\\b', 'i'));
      if (trouve) { nomsDepuisEmail.push(trouve[0]); }
    }
  });
  var noms = dedupe((texte.match(regexNom) || []).concat(nomsDepuisEmail));

  return [].concat(
    telephones.map(function (v) { return { valeur: v, icone: '📞' }; }),
    emails.map(function (v) { return { valeur: v, icone: '📧' }; }),
    codesPostauxVilles.map(function (v) { return { valeur: v, icone: '📍' }; }),
    reseaux.map(function (v) { return { valeur: v, icone: '🔗' }; }),
    urls.map(function (v) { return { valeur: v, icone: '🌐' }; }),
    ages.map(function (v) { return { valeur: v, icone: '🎂' }; }),
    noms.map(function (v) { return { valeur: v, icone: '🪪' }; })
  );
}

function afficherDetectionCoordonnees(texte) {
  var zone = document.getElementById('verifDocDetectionZone');
  if (!zone) { return; }
  var trouves = detecterCoordonneesSensibles(texte);
  if (!trouves.length) { zone.innerHTML = ''; return; }
  zone.innerHTML = '<p class="small text-muted mb-1">Coordonnées détectées dans le texte ci-dessous - pensez à les retirer si vous ne voulez pas les envoyer :</p>' +
    '<div class="d-flex flex-wrap gap-2">' +
    trouves.map(function (t) {
      return '<span style="background:#FEF3C7;color:#92400E;border:1px solid #FDE68A;border-radius:6px;padding:0.2rem 0.6rem;font-size:0.85rem;font-weight:600;">' +
        t.icone + ' ' + echapperAttribut(t.valeur) + '</span>';
    }).join('') + '</div>';
}

// TACHE (point 1, stabilisation Bilan, 2026-08-22) : construit le HTML du
// calque de surbrillance (voir htmlVerificationDocument(), mode 'texte') --
// reutilise EXACTEMENT la meme detection que les badges ci-dessus
// (detecterCoordonneesSensibles()), jamais une 2e logique de reperage.
//Echappement fait morceau par morceau (jamais sur le texte deja
// echappe) pour que la recherche des valeurs detectees reste fiable.
function construireHTMLSurbrillanceDetection(texte) {
  var texteSource = texte || '';
  var trouves = detecterCoordonneesSensibles(texteSource);
  if (!trouves.length) { return echapperAttribut(texteSource); }
  function echapperRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var valeursUniques = trouves.map(function (t) { return t.valeur; })
    .filter(function (v, i, arr) { return arr.indexOf(v) === i; })
    // Plus longues d'abord : une valeur plus courte incluse dans une plus
    // longue (rare mais possible) ne doit jamais "manger" une partie d'une
    // correspondance plus longue.
    .sort(function (a, b) { return b.length - a.length; });
  var regexGlobale = new RegExp(valeursUniques.map(echapperRegex).join('|'), 'g');
  var resultat = '';
  var dernierIndex = 0;
  texteSource.replace(regexGlobale, function (correspondance, index) {
    resultat += echapperAttribut(texteSource.slice(dernierIndex, index));
    resultat += '<mark style="background:#FEF3C7;color:#92400E;border-radius:3px;">' + echapperAttribut(correspondance) + '</mark>';
    dernierIndex = index + correspondance.length;
    return correspondance;
  });
  resultat += echapperAttribut(texteSource.slice(dernierIndex));
  return resultat;
}

/* ============================================================
   COMPOSANT PARTAGE : fenetre de verification/masquage d'un document
   ------------------------------------------------------------
   TACHE (chantier "fenetre de verification unifiee") : remplace 3
   implementations qui divergeaient (wizard CV/Lettre, Preparer un
   entretien, Bilan de candidature) par un seul point d'entree, valide
   au prealable via une maquette. Ne reimplemente RIEN du masquage --
   reutilise a l'identique initialiserCanvasEditeur() (dessin/suppression
   de rectangles multiples, deja existant), ouvrirGrandEditeurMasquage(),
   calculerNouvelleRotation(), construireCanvasDocumentSecurise()/
   telechargerDocumentSecurise(), afficherDetectionCoordonnees() (etendue
   juste au-dessus). Seuls la hierarchie visuelle, le message de role et
   le guidage par pulse sont nouveaux.

   cfg = {
     mode: 'texte' | 'image',
     titreDocument: string (ex. 'CV', 'lettre de motivation') -- utilise
       dans le message de role et le nom du fichier telecharge,
     texteInitial: string (mode texte),
     img: HTMLImageElement (mode image),
     etatPartage: { rotationDegres, rectangles, echelleAffichageEditeur }
       (mode image -- MEME forme que partout ailleurs, mutee sur place),
     nomFichierTelecharge: string (mode image, optionnel),
     avecEtapeSuivante: bool (mode image, defaut true -- encart "Et
       ensuite ?" une fois le document enregistre),
     onEnregistre: function(resultat) -- resultat = { mode:'texte', texte }
       ou { mode:'image', blob }. Seul point de contact avec l'appelant :
       chaque parcours garde son PROPRE bouton "Continuer" (deja dans son
       propre pied de fenetre/wizard), ce composant ne fait que signaler
       que l'enregistrement est termine.
   }
   htmlVerificationDocument(cfg) fournit le HTML (a inserer par
   l'appelant dans SON PROPRE conteneur -- wizard, fenetre ERIP...).
   cablerVerificationDocument(cfg) cable les interactions, a appeler une
   fois ce HTML present dans le DOM (apres l'avoir insere ET, pour le
   mode image, apres avoir charge cfg.img).
   ============================================================ */
function htmlVerificationDocument(cfg) {
  // TACHE (rapprochement maquette, hierarchie du titre) : etiquette
  // d'etape (petite, discrete) + titre principal (grand, gras) rendus ICI,
  // a l'interieur du composant partage -- desormais la SEULE source du
  // titre affiche, quel que soit l'appelant. Les 3 appelants (wizard CV,
  // Preparer un entretien, Bilan) passent donc un titre vide a leur propre
  // enveloppe (fenetre ERIP / chrome du wizard), pour ne jamais l'afficher
  // deux fois. cfg.etapeLabel/cfg.titre restent optionnels : chaque
  // appelant peut preciser le texte le plus juste pour son contexte (ex.
  // "Etape 2 - Verification" pour le wizard, simplement "Verification"
  // pour Entretien/Bilan qui n'ont pas de numerotation d'etape visible).
  var etapeLabel = cfg.etapeLabel || 'Vérification';
  var titrePrincipal = cfg.titre || (cfg.mode === 'texte'
    ? 'Vérifier le texte'
    : 'Vérifier votre ' + (cfg.titreDocument || 'document'));
  var enteteHTML = '<p class="verif-doc-eyebrow">' + echapperAttribut(etapeLabel) + '</p>' +
    '<h3 class="verif-doc-titre">' + echapperAttribut(titrePrincipal) + '</h3>';

  var iconePersonne = cfg.mode === 'image' ? ', photo' : '';
  var roleHTML = '<p class="verif-doc-role"><span class="verif-doc-role-icone">&#128274;</span> Relisez ' +
    (cfg.titreDocument ? 'ce document (' + echapperAttribut(cfg.titreDocument) + ')' : 'ce document') +
    ', corrigez-le si besoin, puis masquez ce que vous ne voulez pas envoyer à l’assistant : nom, ' +
    'coordonnées' + iconePersonne + '.</p>';

  if (cfg.mode === 'texte') {
    // TACHE (point 1, stabilisation Bilan, 2026-08-22, DECISION DE DENIS) :
    // surbrillance REELLE des coordonnees detectees, directement dans le
    // texte -- pas seulement les badges deja existants juste au-dessus.
    // Technique volontairement peu invasive : un calque <div> (verifDocSurbrillance)
    // superpose exactement le textarea (memes classes form-control/verif-doc-textarea,
    // donc meme police/marges), le vrai texte du textarea devient invisible
    // (color:transparent, caret conserve) -- AUCUN changement du contrat
    // existant (champ.value reste le textarea natif, jamais un contenteditable,
    // jamais un changement de la logique de lecture/ecriture).
    return enteteHTML + roleHTML +
      '<div id="verifDocDetectionZone" class="mb-2"></div>' +
      '<div style="position:relative;">' +
      '<div id="verifDocSurbrillance" class="form-control verif-doc-textarea" aria-hidden="true" style="font-size:0.85rem;' +
      'position:absolute;top:0;left:0;width:100%;height:100%;margin:0;pointer-events:none;white-space:pre-wrap;' +
      'word-wrap:break-word;overflow-y:auto;background:transparent;border-color:transparent;box-shadow:none;color:var(--text-strong);"></div>' +
      // TACHE (retour utilisateur, 2026-08-24) : rows reduit de 14 a 8 --
      // avec le pied de fenetre desormais fixe (voir afficherEtape()), le
      // bouton Enregistrer (juste apres ce textarea dans le contenu, donc
      // DANS la zone qui defile) restait hors champ sur un CV de taille
      // courante, au point d'etre pris pour supprime. Le textarea garde son
      // propre defilement interne pour le texte long (inchange), seule sa
      // hauteur VISIBLE diminue, pour que le bouton Enregistrer tienne dans
      // l'ecran sans avoir a decouvrir un 2e defilement (celui de la zone
      // de contenu, distinct de celui du textarea).
      '<textarea class="form-control verif-doc-textarea" id="verifDocTextarea" rows="8" ' +
      'style="font-size:0.85rem;position:relative;background:transparent;color:transparent;caret-color:var(--text-strong);"></textarea>' +
      '</div>' +
      '<div class="text-center verif-doc-video-ligne">' + htmlDeclencheurDemoVideo('masquage-texte') + '</div>' +
      '<div class="verif-doc-enregistrer-ligne">' +
      '<button type="button" id="verifDocBtnEnregistrer" class="btn btn-primary verif-doc-btn-enregistrer" ' +
      'style="font-weight:700;">&#128190; Enregistrer</button>' +
      '</div>';
  }

  return enteteHTML + roleHTML +
    '<div class="d-flex justify-content-center gap-2 verif-doc-rotation-ligne">' +
    '<button type="button" id="verifDocBtnRotGauche" class="btn btn-sm btn-outline-secondary">&#8634; Pivoter à gauche</button>' +
    '<button type="button" id="verifDocBtnRotDroite" class="btn btn-sm btn-outline-secondary">&#8635; Pivoter à droite</button>' +
    '</div>' +
    '<div class="verif-doc-canvaszone">' +
    '<canvas id="verifDocCanvas" style="max-width:100%;border-radius:8px;cursor:crosshair;"></canvas>' +
    '</div>' +
    '<p class="text-muted small text-center verif-doc-hint">Cliquez-glissez sur le document pour masquer une zone. ' +
    'Cliquez sur un rectangle existant pour le supprimer.</p>' +
    '<div class="verif-doc-actions">' +
    '<button type="button" id="verifDocBtnMasquageInfo" class="btn verif-doc-btn-action bouton-incitation-action">&#128274; Masquage local</button>' +
    '<button type="button" id="verifDocBtnAgrandir" title="Agrandir l’aperçu" class="btn verif-doc-btn-action verif-doc-btn-action-jaune pulse-verif-jaune">' +
    '&#128470;&#65039; Agrandir</button>' +
    '</div>' +
    '<div class="verif-doc-enregistrer-ligne">' +
    '<button type="button" id="verifDocBtnEnregistrer" class="btn btn-primary verif-doc-btn-enregistrer" ' +
    'style="font-weight:700;">&#128190; Enregistrer</button>' +
    '</div>' +
    (cfg.avecEtapeSuivante !== false
      ? '<div id="verifDocNextPanel" class="verif-doc-next-panel" style="display:none;">' +
        '<p class="fw-bold mb-2">&#128206; Une fois l’assistant ouvert</p>' +
        '<ol class="small ps-3 mb-2">' +
        '<li>Collez le prompt : appuyez sur <kbd>Ctrl</kbd>+<kbd>V</kbd>, puis sur <strong>Entrée</strong>.</li>' +
        '<li>Glissez ce document (téléchargé juste au-dessus) dans la conversation.</li>' +
        '</ol>' +
        '<p class="small mb-2">L’assistant ne peut pas lire votre document sans cette pièce jointe.</p>' +
        htmlDeclencheurDemoVideo('masquage-image') +
        '</div>'
      : '');
}

// Namespace tres simple : une seule instance de ce composant affichee a
// la fois dans toute l'application (comme pour les fenetres ERIP) --
// jamais besoin d'ids parametres. cfg._enregistre/_masquagePulseActif
// sont poses ici, jamais lus ailleurs que par cette fonction.
function cablerVerificationDocument(cfg) {
  var btnEnregistrer = document.getElementById('verifDocBtnEnregistrer');

  function marquerEnregistre() {
    cfg._enregistre = true;
    btnEnregistrer.classList.remove('bouton-incitation-action');
    btnEnregistrer.classList.add('verif-doc-fige');
    btnEnregistrer.innerHTML = '&#9989; Document enregistré';
    var panneauSuivant = document.getElementById('verifDocNextPanel');
    if (panneauSuivant) { panneauSuivant.style.display = 'block'; }
  }

  if (cfg.mode === 'texte') {
    var champ = document.getElementById('verifDocTextarea');
    // TACHE (point 1, stabilisation Bilan, 2026-08-22) : calque de
    // surbrillance, synchronise sur le contenu ET le defilement du
    // textarea -- rafraichirSurbrillance() reutilise la meme detection
    // que les badges (construireHTMLSurbrillanceDetection()), jamais une
    // 2e logique. Absent si le calque n'existe pas (autres modes/appelants
    // n'ayant pas ce mode, garde-fou standard).
    var surbrillance = document.getElementById('verifDocSurbrillance');
    function rafraichirSurbrillance() {
      if (surbrillance) { surbrillance.innerHTML = construireHTMLSurbrillanceDetection(champ.value); }
    }
    champ.value = cfg.texteInitial || '';
    afficherDetectionCoordonnees(champ.value);
    rafraichirSurbrillance();
    champ.addEventListener('input', function () {
      afficherDetectionCoordonnees(champ.value);
      rafraichirSurbrillance();
      // TACHE (Preparer un entretien, navigation entre documents) : callback
      // optionnelle, distincte de onEnregistre -- garde une trace du brouillon
      // AVANT meme le clic sur Enregistrer, pour ne rien perdre si la
      // personne change de document (CV <-> lettre) sans avoir enregistre.
      // Absente pour le wizard CV/Bilan (usage a un seul document, jamais
      // fournie), aucun effet sur ces 2 parcours.
      if (typeof cfg.onModification === 'function') { cfg.onModification(champ.value); }
    });
    champ.addEventListener('scroll', function () {
      if (surbrillance) { surbrillance.scrollTop = champ.scrollTop; }
    });

    btnEnregistrer.addEventListener('click', function () {
      if (cfg._enregistre) { return; }
      marquerEnregistre();
      if (typeof cfg.onEnregistre === 'function') { cfg.onEnregistre({ mode: 'texte', texte: champ.value }); }
    });
    // TACHE (bouton Retour, wizard) : reaffichage apres un aller-retour --
    // si ce document a deja ete enregistre precedemment, retrouve
    // directement l'etat fige plutot que de faire croire qu'il faut
    // recliquer Enregistrer (etat.texteVerifie/imageEditee, poses par les
    // appelants, servent de temoin -- meme principe deja utilise pour
    // etat.imageEditee avant ce chantier).
    if (cfg._dejaEnregistre) { marquerEnregistre(); }
    return;
  }

  // ---- mode image ----
  var btnMasquageInfo = document.getElementById('verifDocBtnMasquageInfo');
  var btnAgrandir = document.getElementById('verifDocBtnAgrandir');

  // TACHE (guidage par pulse, demande explicite) : un seul signal a la
  // fois. A l'ouverture : pulse BLEU sur "Masquage local" (rappel de
  // confidentialite, bouton d'info), pulse JAUNE sur "Agrandir" (invite a
  // essayer la grande vue). Des qu'un rectangle existe (quelle que soit
  // la vue -- petite ou "Agrandir" -- ou l'action -- dessin ou rotation
  // qui les a effaces), les deux pulses s'arretent et le pulse se
  // deplace seul sur Enregistrer. Jamais sticky : reevalue a chaque
  // changement, y compris apres une rotation qui reinitialise les
  // rectangles.
  function synchroniserPulseMasquage() {
    if (cfg._enregistre) { return; }
    var masque = !!(cfg.etatPartage.rectangles && cfg.etatPartage.rectangles.length);
    btnMasquageInfo.classList.toggle('bouton-incitation-action', !masque);
    btnAgrandir.classList.toggle('pulse-verif-jaune', !masque);
    btnEnregistrer.classList.toggle('bouton-incitation-action', masque);
  }

  var canvas = document.getElementById('verifDocCanvas');
  var redessiner = initialiserCanvasEditeur(canvas, cfg.img, cfg.etatPartage, 560, synchroniserPulseMasquage);

  document.getElementById('verifDocBtnRotGauche').addEventListener('click', function () {
    cfg.etatPartage.rotationDegres = calculerNouvelleRotation(cfg.etatPartage.rotationDegres, 'gauche');
    cfg.etatPartage.rectangles = [];
    redessiner();
    synchroniserPulseMasquage();
  });
  document.getElementById('verifDocBtnRotDroite').addEventListener('click', function () {
    cfg.etatPartage.rotationDegres = calculerNouvelleRotation(cfg.etatPartage.rotationDegres, 'droite');
    cfg.etatPartage.rectangles = [];
    redessiner();
    synchroniserPulseMasquage();
  });
  // TACHE (retour utilisateur : regrouper l'aide en une seule bulle) :
  // "Comment faire ?" disparait comme bouton separe -- son contenu, ainsi
  // que le lien video autrefois affiche en permanence, rejoignent la
  // bulle ouverte par "Masquage local", qui garde sa place et son role
  // dans la paire d'actions principales (seul ce que fait le clic
  // change). Appel direct a ouvrirFenetreERIP() plutot qu'a
  // ouvrirBulleAide() : cette derniere enveloppe tout contenu dans un
  // UNIQUE <p>, incompatible avec plusieurs rubriques structurees.
  btnMasquageInfo.addEventListener('click', function () {
    ouvrirFenetreERIP({
      titre: 'Comment faire ?',
      contenuHTML:
        '<p class="fw-bold mb-1">&#128394;&#65039; Masquer une information</p>' +
        '<p class="small mb-3">Cliquez-glissez sur le document pour dessiner un rectangle noir sur une information ' +
        'à masquer (nom, adresse, téléphone, photo...). Cliquez sur un rectangle existant pour le supprimer. Vous ' +
        'pouvez en dessiner autant que nécessaire.</p>' +
        '<p class="fw-bold mb-1">&#128274; Pourquoi masquer ces informations</p>' +
        '<p class="small mb-3">Rien n’est envoyé nulle part avant votre validation, à l’étape suivante. Masquer vos ' +
        'informations personnelles évite de les transmettre inutilement à l’assistant.</p>' +
        '<p class="fw-bold mb-1">&#128270; Le bouton Agrandir</p>' +
        '<p class="small mb-3">Ouvre une vue plus grande du document : pratique pour masquer précisément une petite ' +
        'zone.</p>' +
        htmlDeclencheurDemoVideo('masquage-image')
    });
  });
  btnAgrandir.addEventListener('click', function () {
    ouvrirGrandEditeurMasquage(cfg.etatPartage, cfg.img, function () { redessiner(); synchroniserPulseMasquage(); });
  });

  synchroniserPulseMasquage();

  btnEnregistrer.addEventListener('click', function () {
    if (cfg._enregistre) { return; }
    btnEnregistrer.disabled = true;
    btnEnregistrer.innerHTML = 'Enregistrement en cours...';
    var canvasFinal = construireCanvasDocumentSecurise(
      cfg.img, cfg.etatPartage.rotationDegres, cfg.etatPartage.rectangles, cfg.etatPartage.echelleAffichageEditeur);
    canvasFinal.toBlob(function (blob) {
      btnEnregistrer.disabled = false;
      btnEnregistrer.classList.remove('bouton-incitation-action');
      telechargerDocumentSecurise(blob, cfg.nomFichierTelecharge);
      marquerEnregistre();
      if (typeof cfg.onEnregistre === 'function') { cfg.onEnregistre({ mode: 'image', blob: blob }); }
    }, 'image/png');
  });

  // Reaffichage apres un aller-retour ("Retour" puis re-avance) : le
  // document a deja ete enregistre une premiere fois -- retrouve
  // directement l'etat fige (voir etat.imageEditee, deja pose par les
  // appelants pour ce meme usage avant ce chantier).
  if (cfg._dejaEnregistre) { marquerEnregistre(); }
}

function ouvrirAssistantDepotCV(mode, options) {
  fermerAssistantDepotCV();
  var modeCV = mode || 'maj';
  var contexte = options || {};
  // TACHE (retour utilisateur : "je veux avoir les trois chemins de la
  // boite a outils... creer un CV, modifier un CV, mettre a jour un CV") :
  // point d'entree UNIQUE des modes "pret"/"maj" (carte d'accueil ET
  // panneau guide de recherche, tous deux appellent cette meme fonction,
  // voir js/app.js) -- un seul endroit a instrumenter pour couvrir les 2
  // chemins vers chacun de ces 2 modes. "nouveau" n'a pas de point
  // d'entree unique equivalent : trackee directement a ses 2 sites
  // d'appel (js/app.js).
  if (typeof trackEvenement === 'function') { trackEvenement('mode_creation_choisi', { mode: modeCV }); }

  // TACHE 1 : etat partage unique. Les champs ci-dessous anticipent les
  // besoins des Taches 2 a 5 (juste leur NOM, pas leur logique) -- ce n'est
  // pas une anticipation artificielle de fonctionnalites non demandees,
  // c'est la structure de donnees necessaire au fonctionnement meme du
  // wizard deja valide (dossier, methode, image editee, assistant, reponse).
  // TACHE (RC-02, Vague 3, 2026-08-22) : contexte.texteInitial/etapeInitiale
  // (tous deux optionnels, retro-compatibles -- absents, rien ne change
  // pour les 3 appelants existants CV/Lettre/Entretien) permettent d'entrer
  // directement a l'etape 3 (structuration) avec un texte deja pret,
  // deja relu ailleurs -- jamais un nouveau depot, jamais une nouvelle
  // relecture. Fonction PLATEFORME, generique : ne sait pas d'ou vient ce
  // texte ni pourquoi (voir structurerTexteExistant() plus bas, seul
  // appelant a ce jour).
  var etat = {
    etapeCourante: contexte.etapeInitiale || 1,
    fichier: null,
    resultatAnalyse: null,
    modeEditeur: contexte.texteInitial ? 'texte' : null,
    imageEditee: null,
    assistantChoisi: null,
    texteReponseIA: '',
    texteDocumentPrepare: contexte.texteInitial || null,
    texteVerifie: !!contexte.texteInitial
  };

  var fenetre = document.createElement('div');
  fenetre.id = 'assistantDepotCV';
  fenetre.style.cssText = 'position:fixed;inset:0;background:rgba(11,26,51,0.55);' +
    'display:flex;align-items:center;justify-content:center;z-index:2000;padding:1rem;';
  document.body.appendChild(fenetre);
  // TACHE (retour utilisateur : plus de fermeture au clic sur le fond) :
  // la croix (fermerAssistantDepotCVBtn, plus bas) reste le seul moyen
  // explicite de fermer, en plus de la fin naturelle du parcours.

  function etapeSuivanteWizard() {
    fermerAssistantDepotCV();
    if (contexte && typeof contexte.onTerminer === 'function') {
      contexte.onTerminer();
    } else {
      dossier.modeCreation = modeCV;
      naviguerVers('objectif');
    }
  }

  // TACHE 1 : coeur du squelette. Remplace INTEGRALEMENT le contenu a
  // chaque appel (jamais d'accumulation) et pose un pied de page uniforme
  // (Retour a gauche des l'etape 2, Continuer a droite), dont le
  // comportement est fourni par la definition de l'etape elle-meme.
  // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a CV/
  // Lettre/Entretien, pour la coherence de tout le parcours") : coupe
  // systematiquement tout decompte herite d'un rendu precedent AVANT de
  // reconstruire quoi que ce soit -- meme precaution que naviguerVers()/
  // afficherEtape() (Decouverte), js/app.js. Redemarre seulement plus bas
  // (etape 4, cablerEtape4()) si les conditions sont toujours reunies.
  function afficherEtape(numero) {
    clearInterval(_intervalleDecompteIA);
    etat.etapeCourante = numero;
    var etape = obtenirDefinitionEtape(numero);
    // TACHE (bug reel trouve en verifiant "Retour" depuis le pont
    // structurerTexteExistant()) : quand le wizard est ouvert directement
    // a une etape avancee (contexte.etapeInitiale, ex. etape 3 -- aucun
    // fichier n'a jamais ete depose), "Retour" ne doit jamais redescendre
    // en dessous de l'etape juste avant l'entree -- au-dela, l'etape 1
    // (depot de fichier) n'a aucune donnee reelle a afficher et devient un
    // ecran casse (Continuer actif sans fichier depose). Plancher = etape
    // d'entree - 1 (la revue du contenu deja fourni reste legitime, un
    // pas plus loin non). Sans etapeInitiale (parcours normal), plancher
    // reste 1 -- comportement inchange.
    var etapePlancher = Math.max(1, (contexte.etapeInitiale || 1) - 1);

    // TACHE (retour utilisateur : bouton Continuer difficilement atteignable
    // sur l'etape Verification, 2026-08-24) : pied de fenetre desormais FIXE
    // (jamais defile avec le contenu) -- avant ce correctif, Retour/Continuer
    // vivaient DANS le meme conteneur overflow-y:auto que le contenu, donc
    // descendaient hors champ des que le texte du CV (textarea rows=14 +
    // badges de coordonnees) depassait 90vh. Pire : la molette au-dessus du
    // textarea fait defiler SON PROPRE contenu interne (pas la fenetre), donc
    // il fallait deplacer la souris hors du texte pour esperer atteindre
    // Continuer -- jamais decouvert naturellement. Desormais : seule la zone
    // de contenu (id=wizardZoneContenuDefilante) defile, le pied de fenetre
    // (Retour/Continuer, avec son pulse deja existant) reste toujours visible
    // en bas de la fenetre, quelle que soit la hauteur du contenu.
    fenetre.innerHTML =
      '<div style="background:white;border-radius:1.5rem;max-width:680px;width:100%;' +
      'max-height:90vh;display:flex;flex-direction:column;padding:0;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
      '<div style="padding:1.5rem 1.5rem 0 1.5rem;overflow-y:auto;flex:1 1 auto;min-height:0;">' +
      '<div class="d-flex justify-content-between align-items-center mb-3">' +
      '<h5 class="mb-0">' + etape.titre + '</h5>' +
      '<button type="button" id="fermerAssistantDepotCVBtn" class="btn btn-sm btn-outline-secondary" ' +
      'style="border-radius:50%;width:32px;height:32px;padding:0;">&#10005;</button>' +
      '</div>' +
      '<div id="contenuEtapeWizard">' + etape.contenuHTML + '</div>' +
      '</div>' +
      // TACHE (rapprochement maquette, pied de fenetre) : un peu plus de
      // respiration (mt-3/pt-3 -> mt-4/pt-4) -- meme gabarit pour les 4
      // etapes du wizard, coherent avec le reste des espacements repris
      // de la maquette.
      '<div class="d-flex justify-content-between align-items-center" style="flex:0 0 auto;padding:1rem 1.5rem 1.5rem 1.5rem;border-top:1px solid #E5E7EB;">' +
      (numero > etapePlancher || (numero === etapePlancher && typeof contexte.onRetourEtape1 === 'function')
        ? '<button type="button" id="btnRetourWizard" class="btn btn-outline-secondary">&#8592; Retour</button>'
        : '<span></span>') +
      (etape.boutonMilieuHTML || '<span></span>') +
      (etape.masquerContinuer ? '' :
      '<button type="button" id="btnContinuerWizard" class="btn btn-primary"' +
      (etape.peutContinuer ? '' : ' disabled') + '>' + (etape.libelleContinuer || 'Continuer &#8594;') + '</button>') +
      '</div></div>';

    document.getElementById('fermerAssistantDepotCVBtn').addEventListener('click', fermerAssistantDepotCV);
    var btnRetour = document.getElementById('btnRetourWizard');
    if (btnRetour) {
      btnRetour.addEventListener('click', function () {
        // TACHE (retour utilisateur : bouton Retour vers le choix initial) :
        // depuis le plancher (etape 1 en temps normal, ou l'etape juste
        // avant contexte.etapeInitiale pour une entree directe -- voir
        // etapePlancher plus haut), si ce wizard a ete ouvert avec un point
        // de retour explicite (onRetourEtape1), Retour y renvoie plutot que
        // de continuer a redescendre vers une etape jamais reellement visitee.
        if (numero === etapePlancher && typeof contexte.onRetourEtape1 === 'function') {
          fermerAssistantDepotCV();
          contexte.onRetourEtape1();
        } else {
          allerEtapePrecedente(numero);
        }
      });
    }
    if (!etape.masquerContinuer) {
      document.getElementById('btnContinuerWizard').addEventListener('click', function () {
        if (typeof etape.onContinuer === 'function') { etape.onContinuer(); }
      });
    }
    if (typeof etape.onCablerBoutonMilieu === 'function') { etape.onCablerBoutonMilieu(); }

    if (typeof etape.onAfficher === 'function') { etape.onAfficher(); }
  }

  // TACHE 2 : navigation arriere consciente des etapes sautees -- si
  // l'etape 2 ne s'applique pas (methode rapide, ou document texte pour
  // la methode IA), "Retour" depuis l'etape 3 doit revenir a l'etape 1,
  // jamais s'arreter sur une etape 2 qui n'a jamais ete affichee.
  function allerEtapePrecedente(depuis) {
    afficherEtape(Math.max(1, depuis - 1));
  }

  // TACHE 2 (Etape 1) : cable le depot de fichier + la detection deja
  // construite (analyserDocumentDepose(), Tache 1 du chantier precedent) --
  // aucune logique dupliquee. Si l'etat contient deja un resultat d'analyse
  // (retour en arriere puis re-avance), le reaffiche directement plutot
  // que d'exiger un nouveau depot.
  function cablerEtape1() {
    var inputFichier = document.getElementById('fichierWizardCV');
    var zoneAnalyse = document.getElementById('zoneAnalyseEtape1');
    var btnAfficherCollage = document.getElementById('btnAfficherCollageTexteWizard');
    var zoneCollageTexte = document.getElementById('zoneCollageTexteWizard');
    var texteCollageWizard = document.getElementById('texteCollageWizardCV');
    var btnAnnulerCollageTexte = document.getElementById('btnAnnulerCollageTexteWizard');

    var btnPasser = document.getElementById('btnPasserEtapeWizard');
    if (btnPasser) {
      btnPasser.addEventListener('click', function () {
        fermerAssistantDepotCV();
        if (typeof contexte.onDocumentPrepare === 'function') { contexte.onDocumentPrepare(null); }
      });
    }

    if (etat.resultatAnalyse) {
      afficherRecommandation(etat.resultatAnalyse);
      if (btnAfficherCollage) { btnAfficherCollage.style.display = 'none'; }
    } else if (etat.modeEditeur === 'texte' && !etat.fichier) {
      // TACHE (Retour n'efface rien) : un texte colle a l'etape 1, puis
      // Retour depuis l'etape 2 -- on le reaffiche tel quel plutot que de
      // reperdre la saisie.
      zoneCollageTexte.style.display = 'block';
      texteCollageWizard.value = etat.texteDocumentPrepare || '';
      btnAfficherCollage.style.display = 'none';
      inputFichier.disabled = true;
    }

    inputFichier.addEventListener('change', function () {
      if (!inputFichier.files.length) { return; }
      etat.fichier = inputFichier.files[0];
      // Fichier et texte colle sont mutuellement exclusifs -- choisir un
      // fichier efface tout texte colle en attente (jamais les deux
      // sources actives a la fois).
      etat.modeEditeur = null;
      etat.texteDocumentPrepare = null;
      if (texteCollageWizard) { texteCollageWizard.value = ''; }
      if (zoneCollageTexte) { zoneCollageTexte.style.display = 'none'; }
      if (btnAfficherCollage) { btnAfficherCollage.style.display = 'none'; }
      var btnContinuer = document.getElementById('btnContinuerWizard');
      if (btnContinuer) { btnContinuer.disabled = true; }
      zoneAnalyse.innerHTML = '<div class="alert alert-light border mb-0">&#8987; Analyse du document en cours...</div>';

      analyserDocumentDepose(etat.fichier).then(function (resultatAnalyse) {
        dossier.cvTexte = resultatAnalyse.texteExtrait || '';
        dossier.cvAnalyse = true;
        etat.resultatAnalyse = resultatAnalyse;
        // TACHE (unification du parcours) : un seul mode restant --
        // l'application ne demande plus de choisir, elle oriente
        // automatiquement vers l'editeur adapte (texte ou graphique).
        etat.modeEditeur = resultatAnalyse.recommandation.texteDisponible ? 'texte' : 'image';
        afficherRecommandation(resultatAnalyse);
      }).catch(function (erreur) {
        zoneAnalyse.innerHTML = '<div class="alert alert-warning mb-0">Impossible de lire ce fichier (' +
          erreur.message + ').</div>';
      });
    });

    if (btnAfficherCollage) {
      btnAfficherCollage.addEventListener('click', function () {
        zoneCollageTexte.style.display = 'block';
        btnAfficherCollage.style.display = 'none';
        inputFichier.disabled = true;
        texteCollageWizard.focus();
      });
    }

    if (btnAnnulerCollageTexte) {
      btnAnnulerCollageTexte.addEventListener('click', function () {
        texteCollageWizard.value = '';
        zoneCollageTexte.style.display = 'none';
        if (btnAfficherCollage) { btnAfficherCollage.style.display = 'block'; }
        inputFichier.disabled = false;
        etat.modeEditeur = null;
        etat.texteDocumentPrepare = null;
        var btnContinuer = document.getElementById('btnContinuerWizard');
        if (btnContinuer) { btnContinuer.disabled = true; }
      });
    }

    if (texteCollageWizard) {
      texteCollageWizard.addEventListener('input', function () {
        var texte = texteCollageWizard.value;
        var btnContinuer = document.getElementById('btnContinuerWizard');
        etat.fichier = null;
        if (texte.trim()) {
          etat.modeEditeur = 'texte';
          etat.texteDocumentPrepare = texte;
          if (btnContinuer) { btnContinuer.disabled = false; }
        } else {
          etat.modeEditeur = null;
          etat.texteDocumentPrepare = null;
          if (btnContinuer) { btnContinuer.disabled = true; }
        }
      });
    }

    function afficherRecommandation(resultatAnalyse) {
      zoneAnalyse.innerHTML =
        '<div class="mb-2" style="background:#EFF6FF;border:1px solid #BFDBFE;border-radius:8px;padding:0.6rem 0.9rem;">' +
        '<p class="mb-0 small"><strong>&#128161; ' + (etat.modeEditeur === 'texte' ? 'Document texte détecté' : 'Document image/scan détecté') +
        '</strong> - ' + resultatAnalyse.recommandation.message + '</p>' +
        '</div>';
      var btnContinuer = document.getElementById('btnContinuerWizard');
      if (btnContinuer) { btnContinuer.disabled = false; }
    }
  }

  // TACHE (chantier "fenetre de verification unifiee") : ne construit plus
  // sa propre barre d'outils/canvas -- delegue entierement a
  // htmlVerificationDocument()/cablerVerificationDocument() (voir plus
  // haut dans ce fichier), le meme composant que Preparer un entretien et
  // le Bilan de candidature. etat (rotationDegres/rectangles/
  // echelleAffichageEditeur) est deja exactement la forme attendue par
  // cfg.etatPartage -- transmis tel quel, aucune conversion necessaire.
  function cablerEtape2() {
    var zoneEditeur = document.getElementById('zoneEditeurCV');

    function afficherEditeur(img) {
      etat.imageSource = img;
      if (typeof etat.rotationDegres !== 'number') { etat.rotationDegres = 0; }
      if (!etat.rectangles) { etat.rectangles = []; }

      var cfgVerif = {
        mode: 'image',
        etapeLabel: 'Étape 2 · Vérification',
        titreDocument: (contexte && contexte.titreDocument) || 'CV',
        img: img,
        etatPartage: etat,
        nomFichierTelecharge: ((contexte && contexte.titreDocument) || 'cv') + '-verifie.png',
        avecEtapeSuivante: true,
        _dejaEnregistre: !!etat.imageEditee,
        onEnregistre: function (resultat) {
          etat.imageEditee = resultat.blob;
          var btnContinuer = document.getElementById('btnContinuerWizard');
          if (btnContinuer) { btnContinuer.disabled = false; btnContinuer.classList.add('bouton-incitation-action'); }
        }
      };
      zoneEditeur.innerHTML = htmlVerificationDocument(cfgVerif);
      cablerVerificationDocument(cfgVerif);
    }

    // TACHE 3 ("Retour" ne perd rien) : si le document a deja ete charge
    // (aller-retour dans le wizard), on reaffiche directement l'etat deja
    // construit plutot que de recharger/reconvertir le fichier.
    if (etat.imageSource) {
      afficherEditeur(etat.imageSource);
    } else {
      chargerImageDepuisFichier(etat.fichier).then(afficherEditeur).catch(function (erreur) {
        zoneEditeur.innerHTML = '<div class="alert alert-warning mb-0">' + erreur.message + '</div>';
      });
    }
  }

  // ============================================================
  // ETAPE 3 : ANALYSE ASSISTEE PAR IA (Tache 4)
  // ------------------------------------------------------------
  // Absorbe directement dans le wizard, comme demande -- plus de fenetre
  // separee. Reutilise ASSISTANTS_IA et ETAPES_ASSISTANT_IA_TEXTE (deja
  // partagees, app.js), aucune duplication de ces listes. Une nouvelle
  // liste d'etapes est necessaire pour le mode "image securisee" (collage
  // automatique, valide dans notre echange) -- differente de l'ancien
  // mode "piece jointe manuelle" utilise par l'ancienne fenetre.
  // ============================================================

  // TACHE (retour utilisateur : plus de copie d'image en double) : un seul
  // parcours desormais -- le document (masque si vous avez utilise l'outil
  // prevu a cet effet) est deja telecharge a l'Etape 2 (bouton Enregistrer),
  // il ne reste qu'a le glisser dans la conversation avec l'assistant
  // choisi.
  // TACHE (menage confidentialite) : "anonymise" retire du texte -- rien ne
  // garantit que la personne a reellement dessine un rectangle de masquage,
  // ce mot affirmait a tort un etat systematiquement atteint.
  var ETAPES_ASSISTANT_IA_IMAGE_SECURISEE_TELECHARGEMENT = [
    'Le prompt d’instructions est <strong>automatiquement copié</strong> dans votre presse-papiers.',
    'Votre document a déjà été téléchargé à l’étape précédente.',
    'Une fois sur le site de {ASSISTANT}, cliquez dans la zone de conversation et faites <strong>Ctrl + V</strong> ' +
    'pour coller le prompt.',
    'Glissez ensuite le document téléchargé dans la conversation, puis appuyez sur <strong>Entrée</strong>.',
    'Une fois sa réponse affichée, cliquez sur le bouton "Copier" de {ASSISTANT}.',
    'Revenez ensuite ici pour importer cette réponse.'
  ];
  // TACHE : detection simple -- ClipboardItem + navigator.clipboard.write()
  // doivent tous les deux exister pour pouvoir copier une image.

  // TACHE (chantier "fenetre de verification unifiee") : choisir une
  // pastille ouvre desormais DIRECTEMENT ouvrirFenetreAssistantIA() (js/
  // app.js) -- exactement le meme "Avant de continuer" (etapes, aperçu du
  // rond bleu, decompte) que la page Action et Decouverte, au lieu d'une
  // explication inline ecrite en propre ici. rendreExplication()/
  // lancerEnvoiVersAssistantIA() sont retirees : leur contenu (liste
  // d'etapes, video, astuce image, construction du texte a copier) vit
  // desormais dans ouvrirConfirmationAssistantWizard() ci-dessous, simple
  // assemblage des parametres attendus par la primitive partagee -- aucune
  // logique de confirmation dupliquee.
  // TACHE (Vague 1, point 6 -- harmonisation) : remplace les cartes
  // propres a ce wizard par lignePastillesAssistantsIA(), le meme
  // composant deja utilise par la page Action, Decouverte, et le Bilan de
  // candidature (choix diagnostic, amelioration d'une recommandation) --
  // seule la CONFIRMATION qui suit (ouvrirConfirmationAssistantWizard, ci-
  // dessous) etait deja harmonisee jusqu'ici, pas ce choix initial. Meme
  // groupement "Sans compte"/"Compte necessaire" que partout ailleurs ;
  // idActif memorise le choix si la personne revient sur cette etape,
  // seule difference deliberee avec les autres appelants (voir
  // lignePastillesAssistantsIA()).
  function cablerEtape3() {
    var zone = document.getElementById('zoneEtape3');
    var idActif = etat.assistantChoisi ? etat.assistantChoisi.id : null;

    zone.innerHTML =
      // TACHE (retour utilisateur : "une personne a bloqué ici sans
      // comprendre qu'il faut cliquer sur une pastille") : titre
      // agrandi (etait un simple <p> discret), instruction explicite
      // ajoutee juste en dessous plutot que sous-entendue par le seul
      // titre.
      '<p class="fw-bold mb-1" style="font-size:1.3rem;">Choisissez votre assistant</p>' +
      '<p class="small text-muted mb-2">Cliquez sur une des pastilles ci-dessous : l’application prépare et copie ' +
      'tout pour vous, puis ouvre l’assistant.</p>' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;margin-bottom:0.6rem;">' +
      '<span class="small" style="width:130px;flex-shrink:0;font-weight:700;color:#374151;">Sans compte</span>' +
      lignePastillesAssistantsIA(ASSISTANTS_IA.filter(function (a) { return ASSISTANTS_SANS_COMPTE_IA.indexOf(a.id) !== -1; }), '#DCFCE7', '#86E0B0', '#14532D', 'data-assistant-wizard', idActif) +
      '</div>' +
      '<div style="display:flex;flex-wrap:wrap;align-items:center;gap:0.5rem;">' +
      '<span class="small" style="width:130px;flex-shrink:0;font-weight:700;color:#374151;">Compte nécessaire</span>' +
      lignePastillesAssistantsIA(ASSISTANTS_IA.filter(function (a) { return ASSISTANTS_SANS_COMPTE_IA.indexOf(a.id) === -1; }), '#EFF6FF', '#BFDBFE', '#1E3A5F', 'data-assistant-wizard', idActif) +
      '</div>';

    document.querySelectorAll('[data-assistant-wizard]').forEach(function (pastille) {
      pastille.addEventListener('click', function () {
        var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === pastille.dataset.assistantWizard; })[0];
        if (!assistant) { return; }
        etat.assistantChoisi = assistant;
        ouvrirConfirmationAssistantWizard(assistant);
      });
    });
  }

  // TACHE (chantier "fenetre de verification unifiee") : reprend EXACTEMENT
  // les parametres attendus par ouvrirFenetreAssistantIA() (js/app.js,
  // meme fonction que la page Action) -- etapes (liste deja partagee,
  // ETAPES_ASSISTANT_IA_IMAGE_SECURISEE_TELECHARGEMENT/TEXTE), video de
  // demonstration, astuce "image refusee", et construction du texte a
  // copier (retire d'ici l'ancien lancerEnvoiVersAssistantIA(), aucune
  // logique changee -- seul le PORTEUR de cette logique change).
  function ouvrirConfirmationAssistantWizard(assistant) {
    var etapesAssistant = etat.modeEditeur === 'image'
      ? ETAPES_ASSISTANT_IA_IMAGE_SECURISEE_TELECHARGEMENT
      : ETAPES_ASSISTANT_IA_TEXTE;
    // TACHE (retour utilisateur : "la vidéo n'est pas la bonne, il faut
    // mettre importer_IA.mp4") : cette etape couvre tout l'aller-retour
    // (envoi ET recuperation de la reponse), et c'est bien importer_IA.mp4
    // (deja utilisee ailleurs sous la cle 'import-reponse-ia') qui montre
    // ce parcours complet -- pas 'export-ia-texte' (Exp_imp_ai.mp4), qui
    // ne montre que l'envoi seul.
    var idDemoExport = etat.modeEditeur === 'image' ? 'export-ia-image' : 'import-reponse-ia';

    ouvrirFenetreAssistantIA({
      nomAssistant: assistant.nom,
      idAssistant: assistant.id,
      urlAssistant: assistant.url,
      etapes: etapesAssistant,
      idDemoVideo: idDemoExport,
      avecAstuceImageRefusee: etat.modeEditeur === 'image',
      construireTexteACopier: function () {
        if (etat.modeEditeur === 'image') {
          // TACHE (retour utilisateur : l'image n'atteint jamais l’assistant) :
          // le document a deja ete telecharge a l'Etape 2 (bouton
          // Enregistrer) -- un seul scenario possible, glisser ce fichier
          // dans la conversation.
          var instructions = promptsExternesCharges['extraction-cv'] || promptParDefaut('extraction-cv');
          var messageImage = 'Le document à analyser (image) est fourni séparément : glissez le fichier téléchargé dans la conversation.';
          return instructions.replace(/Voici le texte du CV à lire\s*:\s*$/, messageImage);
        }
        // TACHE (retour utilisateur : retrait Anonymiser) : texte brut,
        // plus de version anonymisee.
        var texteDocument = etat.texteDocumentPrepare || dossier.cvTexte;
        return promptCache('extraction-cv', texteDocument);
      },
      onApresValidation: function (urlAssistant, nomAssistant) {
        // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
        // CV/Lettre/Entretien") : window.open() ne se declenche pas ici --
        // urlAssistant/nomAssistant voyagent jusqu'a l'etape 4
        // (cablerEtape4()) via _etatTransitionIA (js/app.js, globale, deja
        // partagee par la page Action et Decouverte), qui decide seule du
        // moment ou l'ouverture reelle se declenche.
        _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
        afficherEtape(4);
      }
    });
  }

  // TACHE 1 : definitions PROVISOIRES des 4 etapes -- juste assez pour
  // valider la mecanique de navigation avant d'y apporter du contenu reel
  // (Taches 2 a 5). Chaque etape est deja individuellement identifiable,
  // navigable dans les deux sens, sans aucune accumulation visuelle.
  // ETAPE 4 : import de la reponse de l’assistant -- reutilise integralement le
  // pipeline deja construit (analyserReponseImport/SPECIFICATION_IMPORT/
  // ouvrirEcranValidationImport), aucune logique dupliquee.
  function cablerEtape4() {
    var messageImport = document.getElementById('messageImportWizard');
    activerCollageInstantane({
      idZoneAuto: 'zoneCollageAutoWizard',
      idZoneApercu: 'zoneApercuCollageWizard',
      idTextarea: 'texteCollageWizard',
      idBoutonColler: 'btnCollerAutoWizard',
      idBoutonCollerManuel: 'btnCollerManuelWizard',
      idBoutonEffacerRecoller: 'btnEffacerRecoller',
      idBoutonImporter: 'btnImporterWizard',
      onErreur: function (message) { messageImport.style.color = 'var(--danger)'; messageImport.textContent = '⚠️ ' + message; },
      onEffacer: function () { messageImport.textContent = ''; },
      onSucces: function (texte, estAjout) { messageImport.style.color = 'var(--success-strong)'; messageImport.textContent = estAjout ? '✅ Morceau suivant ajouté à la suite. Copiez le prochain morceau puis recliquez, ou cliquez Importer si c’était le dernier.' : '✅ Réponse importée automatiquement depuis le presse-papiers. Si la réponse de l’assistant fait plusieurs morceaux, copiez le morceau suivant puis cliquez sur "Coller un morceau supplémentaire", juste en dessous : il s’ajoutera à la suite. Vérifiez l’aperçu ci-dessous, puis cliquez sur "Importer".'; },
      onCollerManuel: function () { messageImport.textContent = ''; }
    });

    // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
    // CV/Lettre/Entretien") : etat desactive/actif du rond bleu +
    // decompte/bannieres -- copie adaptee du bloc equivalent de
    // brancherEvenementsResultats() (js/app.js, accordeon ActionIA) et de
    // etapeCollerReponse() (decouverteParcours.js). btnJeSuisDeRetourIA
    // reprend le MEME id que les 2 autres parcours :
    // installerEcouteurVisibiliteRetourIA() (deja installe globalement,
    // js/app.js) intensifie donc son pulse au retour de visibilite de
    // l'onglet, sans code supplementaire ici.
    var btnCollerAutoWizard = document.getElementById('btnCollerAutoWizard');
    var texteBtnCollerAutoWizard = document.getElementById('texteBtnCollerAutoWizard');
    if (_etatTransitionIA && btnCollerAutoWizard) {
      if (_etatTransitionIA.phase === 'revenu') {
        btnCollerAutoWizard.disabled = false;
        btnCollerAutoWizard.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
        btnCollerAutoWizard.classList.add('pulse-collage-retour');
        if (texteBtnCollerAutoWizard) { texteBtnCollerAutoWizard.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
      } else {
        // decompte ou ouvert : jamais cliquable avant le retour confirme
        // (meme securite UX que la page Action/Decouverte).
        btnCollerAutoWizard.disabled = true;
        btnCollerAutoWizard.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
        btnCollerAutoWizard.classList.add('rond-collage-desactive');
        if (texteBtnCollerAutoWizard) { texteBtnCollerAutoWizard.textContent = 'Ce bouton s’activera à votre retour.'; }
      }

      // Ouvre reellement l'assistant (window.open repousse jusqu'ici
      // depuis lancerEnvoiVersAssistantIA()) -- a la fin du decompte OU au
      // clic sur "Continuer maintenant". Phase 'bloque' geree comme cote
      // page Action/Decouverte : un window.open() declenche depuis un
      // minuteur (sans clic direct) est bloque silencieusement par le
      // navigateur (retourne null).
      function ouvrirAssistantWizardEnAttente() {
        // TACHE (bug reel trouve en construisant ce chantier : "fermer le
        // wizard pendant le decompte ouvre quand meme un popup 5s plus
        // tard") : fermerAssistantDepotCV() DETRUIT fenetre (f.remove()),
        // contrairement a Decouverte qui se contente de la MASQUER -- sans
        // ce garde-fou, le minuteur du decompte survivrait a la fermeture
        // et ouvrirait un onglet surprise vers l'assistant meme apres que
        // la personne ait ferme la fenetre. btnCollerAutoWizard n'existe
        // QUE si l'etape 4 de CE wizard est toujours affichee.
        if (!document.getElementById('btnCollerAutoWizard')) { clearInterval(_intervalleDecompteIA); return; }
        // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
        // (js/app.js) -- meme correctif, tous les parcours.
        recopierTexteAssistantPuisOuvrir(function () {
          var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
          _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
          // TACHE (retour utilisateur : "je veux bien aussi" le suivi popup
          // bloque pour ces 3 nouveaux parcours) : mesure combien de
          // navigateurs bloquent reellement l'ouverture automatique --
          // mode (pret/maj) inclus pour distinguer les 2 cartes d'accueil.
          if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') {
            trackEvenement('cv_depot_popup_bloque', { mode: modeCV });
          }
          afficherEtape(4);
        });
      }

      if (_etatTransitionIA.phase === 'decompte') {
        var btnContinuerMaintenantIA = document.getElementById('btnContinuerMaintenantIA');
        if (btnContinuerMaintenantIA) {
          btnContinuerMaintenantIA.addEventListener('click', function () {
            clearInterval(_intervalleDecompteIA);
            ouvrirAssistantWizardEnAttente();
          });
        }
        _intervalleDecompteIA = setInterval(function () {
          _etatTransitionIA.secondesRestantes -= 1;
          var compteurDecompteIA = document.getElementById('compteurDecompteIA');
          if (compteurDecompteIA) { compteurDecompteIA.textContent = _etatTransitionIA.secondesRestantes; }
          if (_etatTransitionIA.secondesRestantes <= 0) {
            clearInterval(_intervalleDecompteIA);
            ouvrirAssistantWizardEnAttente();
          }
        }, 1000);
      } else if (_etatTransitionIA.phase === 'bloque') {
        var btnOuvrirBloqueIA = document.getElementById('btnOuvrirBloqueIA');
        if (btnOuvrirBloqueIA) {
          btnOuvrirBloqueIA.addEventListener('click', function () { ouvrirAssistantWizardEnAttente(); });
        }
      } else if (_etatTransitionIA.phase === 'ouvert') {
        var btnJeSuisDeRetourIA = document.getElementById('btnJeSuisDeRetourIA');
        if (btnJeSuisDeRetourIA) {
          // TACHE (decision explicite de l'utilisateur, chantier "ecran
          // tampon avant l’assistant") : retour MANUEL uniquement, jamais de
          // detection automatique -- meme regle que les 2 autres parcours.
          btnJeSuisDeRetourIA.addEventListener('click', function () {
            _etatTransitionIA.phase = 'revenu';
            afficherEtape(4);
          });
        }
      }
    }

    document.getElementById('btnImporterWizard').addEventListener('click', function () {
      var texteColle = document.getElementById('texteCollageWizard').value;
      var resultatImport = analyserReponseImport(texteColle, SPECIFICATION_IMPORT);
      if (!resultatImport.succes) {
        messageImport.style.color = 'var(--danger)';
        messageImport.textContent = '⚠️ ' + resultatImport.erreur;
        return;
      }
      // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
      // CV/Lettre/Entretien") : import reellement termine -- la transition
      // en attente n'a plus lieu d'etre (meme reinitialisation que dans
      // les 2 autres parcours).
      _etatTransitionIA = null;
      var nomFichier = (etat.fichier && etat.fichier.name) || '';
      var typeSource = /\.docx$/i.test(nomFichier) ? 'cv_word' : (/\.pdf$/i.test(nomFichier) ? 'cv_pdf' : 'autre');
      dossier.imports.courant = {
        schemaVersion: 1,
        typeSource: typeSource,
        date: new Date().toISOString(),
        donnees: resultatImport.valeurs
      };
      // TACHE (retour utilisateur : bouton Retour sur validation d'import) :
      // le wizard n'est PLUS ferme avant d'ouvrir l'ecran de validation --
      // il reste present (juste recouvert visuellement par l'ecran de
      // validation, z-index superieur), pour pouvoir y revenir sans tout
      // reperdre si la personne clique sur "Retour" (reaffiche l'Etape 2,
      // le texte deja saisi/colle reste intact dans etat.texteDocumentPrepare).
      // etapeSuivanteWizard() ferme deja le wizard elle-meme (voir plus bas).
      ouvrirEcranValidationImport(etapeSuivanteWizard, function () { afficherEtape(2); });
    });
  }

  function obtenirDefinitionEtape(numero) {
    if (numero === 1) {
      return {
        titre: (contexte && contexte.titre) || 'Étape 1 · Déposer votre document',
        contenuHTML:
          '<p class="text-muted small">' + ((contexte && contexte.intro) ||
          'Formats acceptés : PDF, Word (.docx), texte (.txt), ou une photo/scan de ' +
          'votre CV (.jpg, .png...). Votre document est lu directement dans votre navigateur, il n’est envoyé nulle part.') + '</p>' +
          '<input type="file" id="fichierWizardCV" class="form-control mb-2" ' +
          'accept=".pdf,.docx,.txt,.jpg,.jpeg,.png,.webp,.heic">' +
          // TACHE (retour utilisateur : "je ne peux pas coller mon texte,
          // je dois obligatoirement choisir un fichier") : alternative de
          // collage direct, sous le choix de fichier -- fichier et texte
          // colle sont mutuellement exclusifs (jamais les deux sources
          // actives a la fois, voir cablerEtape1 plus bas), pour ne
          // jamais laisser planer un doute sur quel contenu part
          // reellement vers l’assistant.
          '<p class="text-center text-muted small mb-2">ou</p>' +
          '<button type="button" id="btnAfficherCollageTexteWizard" class="btn btn-outline-secondary btn-sm w-100 mb-2">' +
          '&#128203; Coller le texte directement</button>' +
          '<div id="zoneCollageTexteWizard" style="display:none;">' +
          '<p class="text-muted small mb-1">Si votre document est déjà sous forme de texte (pas un fichier), collez-le ici :</p>' +
          '<textarea id="texteCollageWizardCV" class="form-control mb-1" rows="8" placeholder="Collez votre texte ici..."></textarea>' +
          '<button type="button" id="btnAnnulerCollageTexteWizard" class="btn btn-outline-secondary btn-sm mb-2">Annuler et choisir un fichier</button>' +
          '</div>' +
          '<div id="zoneAnalyseEtape1"></div>' +
          // TACHE (Entretien, document facultatif) : n apparait que si
          // contexte.optionnel est vrai (ex. lettre de motivation) --
          // absent par defaut, comportement du CV inchange.
          (contexte && contexte.optionnel
            ? '<button type="button" id="btnPasserEtapeWizard" class="btn btn-outline-secondary btn-sm mt-2">Passer cette étape</button>'
            : ''),
        // TACHE (unification du parcours) : Continuer disponible des que
        // le document est analyse (plus de choix de methode a faire).
        peutContinuer: !!etat.modeEditeur,
        onContinuer: function () { afficherEtape(2); },
        onAfficher: function () { cablerEtape1(); }
      };
    }
    // TACHE (chantier "fenetre de verification unifiee") : delegue au
    // composant partage htmlVerificationDocument()/cablerVerificationDocument()
    // (meme composant que Preparer un entretien et le Bilan de candidature).
    // "Enregistrer" vit desormais DANS le corps (a cote du canvas/textarea),
    // le pied du wizard ne garde que Retour/Continuer -- boutonMilieuHTML
    // n'est donc plus utilise ici pour l'etape 2.
    if (numero === 2) {
      var titreDocEtape2 = (contexte && contexte.titreDocument) || 'CV';
      if (etat.modeEditeur === 'texte') {
        return {
          // TACHE (rapprochement maquette) : titre vide ici -- desormais
          // rendu par htmlVerificationDocument() lui-meme (etiquette
          // d'etape + titre principal), jamais affiche deux fois.
          titre: '',
          contenuHTML: htmlVerificationDocument({ mode: 'texte', titreDocument: titreDocEtape2, etapeLabel: 'Étape 2 · Vérification' }),
          // TACHE : Continuer reste bloque tant que le texte n'a pas ete
          // reellement enregistre (etat.texteVerifie sert de temoin, meme
          // principe que etat.imageEditee cote image).
          peutContinuer: !!etat.texteVerifie,
          libelleContinuer: 'Continuer &#8594;',
          onContinuer: function () {
            // TACHE (Entretien, sortie anticipee) : si l appelant ne veut
            // que le document prepare (pas d extraction IA structuree),
            // on s arrete ici. Comportement par defaut inchange sinon.
            if (typeof contexte.onDocumentPrepare === 'function') {
              fermerAssistantDepotCV();
              contexte.onDocumentPrepare({ type: 'texte', valeur: etat.texteDocumentPrepare });
              return;
            }
            afficherEtape(3);
          },
          onAfficher: function () {
            cablerVerificationDocument({
              mode: 'texte',
              titreDocument: titreDocEtape2,
              texteInitial: (typeof etat.texteDocumentPrepare === 'string') ? etat.texteDocumentPrepare : dossier.cvTexte,
              _dejaEnregistre: !!etat.texteVerifie,
              onEnregistre: function (resultat) {
                etat.texteDocumentPrepare = resultat.texte;
                etat.texteVerifie = true;
                var btnContinuer = document.getElementById('btnContinuerWizard');
                if (btnContinuer) { btnContinuer.disabled = false; btnContinuer.classList.add('bouton-incitation-action'); }
              }
            });
          }
        };
      }
      return {
        // TACHE (rapprochement maquette) : titre vide ici aussi, meme
        // raison que la branche texte ci-dessus.
        titre: '',
        contenuHTML: '<div id="zoneEditeurCV" class="text-center"><p class="text-muted small">Chargement du document...</p></div>',
        // TACHE : Continuer reste bloque tant que le document n'a pas ete
        // reellement enregistre (etat.imageEditee sert de temoin, deja
        // present si on revient sur cette etape apres un aller-retour).
        peutContinuer: !!etat.imageEditee,
        libelleContinuer: 'Continuer &#8594;',
        onContinuer: function () {
          // TACHE (retour utilisateur : parcours "Co-construire votre
          // lettre de motivation") : meme crochet de sortie anticipee que
          // le mode texte (voir plus haut) -- manquait ici jusqu'a present.
          // En mode image, rien a transmettre directement (le fichier est
          // deja telecharge sur le poste, voir cablerEtape2) : on signale
          // juste que le document est pret, la personne le glisse
          // elle-meme dans la conversation avec l'assistant.
          if (typeof contexte.onDocumentPrepare === 'function') {
            fermerAssistantDepotCV();
            contexte.onDocumentPrepare({ type: 'image' });
            return;
          }
          afficherEtape(3);
        },
        onAfficher: function () { cablerEtape2(); }
      };
    }
    if (numero === 3) {
      return {
        titre: 'Étape 3 · Analyse assistée',
        contenuHTML: '<div id="zoneEtape3"></div>',
        // TACHE (chantier "fenetre de verification unifiee") : plus de
        // bouton "Continuer" generique ici -- choisir une pastille ouvre
        // DIRECTEMENT la confirmation (ouvrirConfirmationAssistantWizard(),
        // via ouvrirFenetreAssistantIA()), exactement comme sur la page
        // Action. "J'ai déjà ma réponse" reste le seul bouton de pied de
        // page pour cette etape.
        masquerContinuer: true,
        // TACHE (retour utilisateur : eviter de rouvrir l'assistant pour
        // rien) : si l'Etape 4 a deja ete affichee au moins une fois dans
        // CETTE session du wizard (la personne est deja allee jusqu'a
        // l'assistant), un bouton supplementaire permet d'y retourner
        // directement -- sans redeclencher la copie du prompt ni
        // rouvrir un nouvel onglet vers l'assistant.
        boutonMilieuHTML: etat.etape4DejaVisitee
          ? '<button type="button" id="btnDejaVuAssistant" class="btn btn-outline-primary">J’ai déjà ma réponse &#8594;</button>'
          : '',
        onCablerBoutonMilieu: function () {
          var btn = document.getElementById('btnDejaVuAssistant');
          if (btn) { btn.addEventListener('click', function () { afficherEtape(4); }); }
        },
        onAfficher: function () { cablerEtape3(); }
      };
    }
    return {
      titre: 'Étape 4 · Importer la réponse',
      contenuHTML:
        // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
        // CV/Lettre/Entretien") : meme banniere partagee que la page
        // Action/Decouverte (htmlBanniereTransitionIA(), js/app.js) --
        // decompte/popup bloque/bouton "Je suis de retour", jamais une 2e
        // version dupliquee du texte.
        '<p class="small text-muted mb-2">Vous revenez de ' +
        (_etatTransitionIA ? '<strong>' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</strong>' : 'l’assistant') +
        '. Cliquez sur son bouton <strong>"Copier"</strong> juste sous sa réponse, puis collez-la ci-dessous.</p>' +
        htmlBanniereTransitionIA() +
        // TACHE (retour utilisateur : coller en un clic, generalise) :
        // reutilise le composant partage (app.js), voir son commentaire
        // pour le detail du comportement (lecture seule, Entree globale,
        // filet de secours).
        htmlCollageInstantane('Wizard',
          '<div class="d-flex align-items-center gap-2 mb-2 mt-2">' +
          // TACHE (retour utilisateur : "je clique sur la vidéo par erreur
          // 2 fois sur 3") : "Importer" etait un petit bouton bootstrap
          // standard (btn-sm), nettement moins visible que "Voir la
          // démonstration" juste en dessous (grand bouton bleu en
          // pilule) -- la personne cliquait le mauvais des deux par
          // reflexe visuel. Meme style proeminent que "Importer dans le
          // CV" (page Action) desormais, pour qu'il soit clairement le
          // bouton principal de cette etape.
          // TACHE (retour utilisateur : "je clique sur la vidéo par
          // erreur" persiste malgré le style proéminent ci-dessus --
          // cause réelle : même bleu que "Voir la démonstration", donc
          // même prééminence visuelle) : le bouton vidéo est désormais
          // gris neutre (.demo-video-declencheur, css/style.css), et ce
          // bouton pulse en plus une fois visible (.bouton-incitation-action).
          '<button type="button" id="btnImporterWizard" class="bouton-incitation-action" style="font-size:1.05rem;font-weight:700;padding:0.65rem 1.5rem;' +
          'background:#0d6efd;color:#FFFFFF;border:none;border-radius:999px;box-shadow:0 4px 14px rgba(13,110,253,.4);">&#128229; Importer</button>' +
          '<button type="button" class="btn btn-outline-secondary btn-sm" id="btnEffacerRecoller">Effacer et recoller</button>' +
          '</div>') +
        '<div id="messageImportWizard" class="mt-2 small"></div>' +
        // TACHE (chantier "Videos d'accompagnement") : bloc Astuce, affiche
        // uniquement si le document depose etait une image/PDF -- sans
        // objet en mode texte.
        (etat.modeEditeur === 'image' ? htmlBlocAstuceImageRefusee() : ''),
      masquerContinuer: true,
      onAfficher: function () {
        // TACHE (retour utilisateur : eviter de rouvrir l'assistant pour
        // rien) : marque cette etape comme deja visitee, pour que
        // l'Etape 3 propose ensuite un raccourci direct (voir plus haut).
        etat.etape4DejaVisitee = true;
        cablerEtape4();
      }
    };
  }

  afficherEtape(contexte.etapeInitiale || 1);
}

// TACHE (RC-02, Vague 3, 2026-08-22) : fonction PLATEFORME, generique --
// obtient un texte de CV exploitable, sans jamais forcer la structuration
// en champs. Reutilise cvDisponible() (js/app.js) : CV deja construit
// dans ERIP -> callback immediat avec le texte reconstruit ; sinon, ouvre
// l'assistant de depot en mode LEGER (onDocumentPrepare : depot + relecture
// seulement, jamais la structuration) et rappelle callback une fois le
// texte relu obtenu.
// callback(resultat) : resultat = { texte, dejaRelu }.
//   dejaRelu indique si ce texte a deja ete valide par une relecture de
//   confidentialite -- vrai pour le depot leger, faux pour un CV deja
//   construit dans ERIP (jamais relu pour CET usage). L'appelant decide
//   seul de ce qu'il fait de cette information (ex. sauter sa propre
//   relecture) -- cette fonction ne connait rien d'un diagnostic, d'une
//   recommandation, ou du Bilan.
//   texte === null : cas non couvert par cette voie legere (document
//   depose sans texte exploitable localement, ex. scan/image) -- laisse
//   a l'appelant le choix de son propre repli (V1 : voir demarrerBilanCandidature()).
function obtenirOuDeposerTexteCV(callback) {
  if (typeof cvDisponible === 'function' && cvDisponible()) {
    callback({ texte: texteProfilEffectif('cv'), dejaRelu: false });
    return;
  }
  ouvrirAssistantDepotCV(dossier.modeCreation || 'maj', {
    onDocumentPrepare: function (resultat) {
      callback(resultat.type === 'texte'
        ? { texte: resultat.valeur, dejaRelu: true }
        : { texte: null, dejaRelu: false });
    }
  });
}

// TACHE (RC-02, Vague 3, 2026-08-22) : fonction PLATEFORME, generique --
// reprend un texte deja pret (deja relu/valide ailleurs) et l'envoie
// directement a la structuration en champs, sans jamais redemander de
// depot ni de relecture. options : { mode, onTerminer }.
// TACHE (retour Denis 2026-09-19, "je ne veux pas de fenetre a part") :
// n'ouvre plus ouvrirAssistantDepotCV() (ancien wizard modal, etape 3) --
// passe desormais par le sous-etat EN PAGE _etatBilan.organisation (voir
// htmlBilanOrganisation()/brancherEvenementsOrganisation(), js/app.js).
// Seul appelant reel a ce jour : assurerCVStructure() ci-dessous (Bilan) --
// la fonction reste ecrite pour rester generique (options.mode), mais son
// point de sortie (_etatBilan) est desormais propre au Bilan ; un futur
// appelant hors Bilan devra generaliser ce point avant de l'utiliser.
function structurerTexteExistant(texte, options) {
  options = options || {};
  if (typeof _etatBilan === 'undefined' || !_etatBilan) { return; }
  _etatBilan.organisation = { ecran: 'choix-assistant', onTerminer: options.onTerminer };
  if (typeof pageBilanCandidature === 'function') { pageBilanCandidature(); }
}

// TACHE (Carte 3 "accompagne du debut a la fin", 2026-08-24, DECISION DE
// DENIS) : fonction PLATEFORME, generique -- garantit qu'un CV structure
// (dossierAStructureExperiences()) existe avant d'executer une action qui
// en depend. Deja structure -> callback() immediat. Sinon, structure le
// CV via structurerTexteExistant() ci-dessus (meme mecanisme deja eprouve,
// extraction-cv.md) puis callback() une fois la structure obtenue.
// Volontairement PAS specifique au Bilan ni a la Carte 3 : tout futur
// module ayant le meme prerequis (ATS, coherence transversale,
// preparation entretien...) appelle cette meme fonction plutot que d'en
// ecrire une copie -- capacite reutilisable de l'application, jamais un
// detour propre a un seul parcours.
function assurerCVStructure(callback) {
  if (dossierAStructureExperiences()) { callback(); return; }
  var candidature = (typeof bilanObtenirCandidature === 'function') ? bilanObtenirCandidature() : null;
  var texteCV = (candidature && candidature.cv) || dossier.cvTexte || '';
  // TACHE (retour utilisateur, 2026-08-24, CORRIGE) : explique AVANT
  // d'ouvrir le passage par l’assistant a quoi il sert. Premiere version disait "ce
  // n'est pas un nouveau bilan" -- ecartee par Denis : meme dit pour
  // rassurer, ca plante l'idee de repetition dans la tete de la personne.
  // Formulation desormais uniquement positive/prospective (ce que ca va
  // permettre), jamais ce que ce n'est pas.
  confirmerAction(
    'Organiser votre CV',
    'Nous allons organiser votre CV en rubriques (expériences, formations…) pour pouvoir vous proposer, juste après, les corrections identifiées lors de votre bilan directement au bon endroit. Cette étape passe par l’assistant et ne dure que quelques instants.',
    'Continuer', 'btn-primary',
    function () {
      structurerTexteExistant(texteCV, {
        onTerminer: function () { callback(); }
      });
    }
  );
}

// ============================================================
// EDITEUR DE DOCUMENT (Tache 3, Etape 2)
// ------------------------------------------------------------
// Petit editeur volontairement limite : rotation, rectangles noirs,
// suppression d'un rectangle -- jamais un logiciel de retouche complet.
// Fonctionne a l'identique pour une image et un PDF scanne (converti de
// facon transparente en image via pdf.js, deja utilise ailleurs dans
// l'application pour l'extraction de texte).
// ============================================================

// Fonctions PURES (aucune dependance au DOM/canvas), testables isolement.

// Trouve l'INDEX du dernier rectangle (le plus recent, dessine au-dessus)
// contenant le point (x, y), ou -1 si aucun. Utilise pour le clic de
// suppression.
function trouverRectangleSousPoint(rectangles, x, y) {
  for (var i = (rectangles || []).length - 1; i >= 0; i--) {
    var r = rectangles[i];
    if (x >= r.x && x <= r.x + r.largeur && y >= r.y && y <= r.y + r.hauteur) { return i; }
  }
  return -1;
}

// Cycle de rotation par pas de 90°, toujours ramene entre 0 et 359.
function calculerNouvelleRotation(rotationActuelle, sens) {
  var delta = (sens === 'gauche') ? -90 : 90;
  return ((rotationActuelle || 0) + delta + 360) % 360;
}

// Convertit un rectangle exprime en coordonnees d'AFFICHAGE (canvas mis a
// l'echelle pour tenir dans la fenetre) vers des coordonnees a la
// RESOLUTION REELLE du document -- indispensable pour ne pas envoyer une
// version degradee a l’assistant au moment de generer le document securise.
function convertirRectanglePourExport(rectangleAffichage, echelleAffichage) {
  var e = echelleAffichage || 1;
  return {
    x: rectangleAffichage.x / e,
    y: rectangleAffichage.y / e,
    largeur: rectangleAffichage.largeur / e,
    hauteur: rectangleAffichage.hauteur / e
  };
}

// TACHE 3 (transparence PDF/image) : point d'entree unique, quel que soit
// le format d'origine -- retourne toujours une <img> chargee, prete a
// dessiner sur un canvas. La personne n'a jamais besoin de savoir si son
// document etait un PDF ou une image.
function chargerImageDepuisFichier(fichier) {
  var nom = (fichier.name || '').toLowerCase();
  if (nom.endsWith('.pdf')) { return chargerPremierePagePDFCommeImage(fichier); }
  return new Promise(function (resoudre, rejeter) {
    var url = URL.createObjectURL(fichier);
    var img = new Image();
    img.onload = function () { resoudre(img); };
    img.onerror = function () { rejeter(new Error('Impossible de charger ce document.')); };
    img.src = url;
  });
}

// Convertit la 1ere page d'un PDF en image, via pdf.js -- reutilise
// exactement le meme chargement paresseux que lireFichierCV() (Tache 1,
// moteur d'import), aucune logique dupliquee.
function chargerPremierePagePDFCommeImage(fichier) {
  var promessePdfLib = window.pdfjsLib
    ? Promise.resolve()
    : chargerScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  return promessePdfLib.then(function () {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    return fichier.arrayBuffer();
  }).then(function (donnees) {
    return window.pdfjsLib.getDocument({ data: donnees }).promise;
  }).then(function (pdf) {
    return pdf.getPage(1);
  }).then(function (page) {
    var viewport = page.getViewport({ scale: 2 });
    var canvasTemp = document.createElement('canvas');
    canvasTemp.width = viewport.width;
    canvasTemp.height = viewport.height;
    var ctxTemp = canvasTemp.getContext('2d');
    return page.render({ canvasContext: ctxTemp, viewport: viewport }).promise.then(function () {
      return new Promise(function (resoudre, rejeter) {
        var img = new Image();
        img.onload = function () { resoudre(img); };
        img.onerror = function () { rejeter(new Error('Impossible de convertir la page PDF en image.')); };
        img.src = canvasTemp.toDataURL('image/png');
      });
    });
  });
}

// TACHE (retour utilisateur : bouton "agrandir") : les rectangles de
// masquage sont stockes en coordonnees d'AFFICHAGE (echelle du canvas au
// moment ou ils ont ete dessines, cf. convertirRectanglePourExport()
// juste au-dessus). Pour pouvoir dessiner/afficher les MEMES rectangles
// sur un canvas a une autre echelle (petite vue <-> grande vue), il
// suffit de les reconvertir proportionnellement -- pas de matrice
// complexe puisque la rotation est deja appliquee identiquement des deux
// cotes, seule l'echelle finale differe.
function rebasculerRectanglesVersEchelle(etatPartage, nouvelleEchelle) {
  var echelleActuelle = etatPartage.echelleAffichageEditeur;
  if (echelleActuelle && echelleActuelle !== nouvelleEchelle) {
    var facteur = nouvelleEchelle / echelleActuelle;
    (etatPartage.rectangles || []).forEach(function (r) {
      r.x *= facteur; r.y *= facteur; r.largeur *= facteur; r.hauteur *= facteur;
    });
  }
  etatPartage.echelleAffichageEditeur = nouvelleEchelle;
}

// TACHE (retour utilisateur : bouton "agrandir") : rendu + interactions
// souris du canvas d'edition, extraits pour etre reutilises A L'IDENTIQUE
// par la petite vue (dans la fenetre) et la grande vue (bouton agrandir) --
// aucune logique dupliquee entre les deux.
function initialiserCanvasEditeur(canvas, img, etatPartage, largeurMax, onRectanglesModifies) {
  var ctx = canvas.getContext('2d');

  function redessiner() {
    var rotation = etatPartage.rotationDegres || 0;
    var largeurFinale = (rotation === 90 || rotation === 270) ? img.height : img.width;
    var hauteurFinale = (rotation === 90 || rotation === 270) ? img.width : img.height;
    var echelle = Math.min(1, largeurMax / largeurFinale);
    rebasculerRectanglesVersEchelle(etatPartage, echelle);

    canvas.width = largeurFinale * echelle;
    canvas.height = hauteurFinale * echelle;

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(echelle, echelle);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    ctx.restore();

    (etatPartage.rectangles || []).forEach(function (r) {
      ctx.fillStyle = 'black';
      ctx.fillRect(r.x, r.y, r.largeur, r.hauteur);
    });
  }

  var dessinEnCours = null;
  canvas.addEventListener('mousedown', function (e) {
    var rectCanvas = canvas.getBoundingClientRect();
    dessinEnCours = {
      xDepart: e.clientX - rectCanvas.left, yDepart: e.clientY - rectCanvas.top,
      xActuel: e.clientX - rectCanvas.left, yActuel: e.clientY - rectCanvas.top
    };
  });
  canvas.addEventListener('mousemove', function (e) {
    if (!dessinEnCours) { return; }
    var rectCanvas = canvas.getBoundingClientRect();
    dessinEnCours.xActuel = e.clientX - rectCanvas.left;
    dessinEnCours.yActuel = e.clientY - rectCanvas.top;
    redessiner();
    ctx.fillStyle = 'black';
    ctx.fillRect(
      Math.min(dessinEnCours.xDepart, dessinEnCours.xActuel),
      Math.min(dessinEnCours.yDepart, dessinEnCours.yActuel),
      Math.abs(dessinEnCours.xActuel - dessinEnCours.xDepart),
      Math.abs(dessinEnCours.yActuel - dessinEnCours.yDepart)
    );
  });
  canvas.addEventListener('mouseup', function () {
    if (!dessinEnCours) { return; }
    var distance = Math.hypot(dessinEnCours.xActuel - dessinEnCours.xDepart, dessinEnCours.yActuel - dessinEnCours.yDepart);
    if (distance < 5) {
      var indexTrouve = trouverRectangleSousPoint(etatPartage.rectangles, dessinEnCours.xDepart, dessinEnCours.yDepart);
      if (indexTrouve !== -1) { etatPartage.rectangles.splice(indexTrouve, 1); }
    } else {
      etatPartage.rectangles.push({
        x: Math.min(dessinEnCours.xDepart, dessinEnCours.xActuel),
        y: Math.min(dessinEnCours.yDepart, dessinEnCours.yActuel),
        largeur: Math.abs(dessinEnCours.xActuel - dessinEnCours.xDepart),
        hauteur: Math.abs(dessinEnCours.yActuel - dessinEnCours.yDepart)
      });
    }
    dessinEnCours = null;
    redessiner();
    if (typeof onRectanglesModifies === 'function') { onRectanglesModifies(); }
  });

  redessiner();
  return redessiner;
}

// TACHE (retour utilisateur : bulles d'aide) : composant generique reutilise
// pour les 3 textes d'aide de l'etape 2 -- meme principe de fermeture que
// la fenetre wizard elle-meme (clic sur le fond OU sur la croix).
// TACHE (migration Design System - Phase 2, chantier "metiers.js", 1ere
// migration) : devient une recette qui appelle la primitive
// ouvrirFenetreERIP() (definie dans app.js, chargee et executee bien avant
// tout clic utilisateur qui pourrait invoquer cette fonction -- aucun
// probleme d'ordre de chargement entre les deux fichiers). Ne construit
// plus son propre overlay, sa propre croix, ni sa propre logique de clic
// exterieur. Contrat public STRICTEMENT inchange : meme signature
// (titre, texteHTML), aucune valeur de retour avant comme apres.
// Le titre optionnel (peut etre null) est normalise en chaine vide avant
// d'etre transmis a la primitive, pour ne jamais afficher le mot "null".
function ouvrirBulleAide(titre, texteHTML) {
  ouvrirFenetreERIP({
    titre: titre || '',
    contenuHTML: '<p class="mb-0" style="font-size:1.1rem;line-height:1.5;">' + texteHTML + '</p>'
  });
}

// TACHE (retour utilisateur : bouton "agrandir") : grande vue de l'editeur,
// MEME etat partage (etatPartage.rectangles/rotationDegres/imageSource)
// que la petite vue -- tout changement fait ici (rotation exclue, non
// demandee dans la grande vue) est immediatement repercute, y compris
// apres fermeture. A la fermeture, rafraichit la petite vue pour refleter
// les eventuelles modifications.
function ouvrirGrandEditeurMasquage(etatPartage, img, onFermeture) {
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(11,26,51,0.55);' +
    'display:flex;align-items:center;justify-content:center;z-index:2200;padding:1rem;';
  // TACHE (retour utilisateur : encore plus grande) : plafond releve de
  // 1000 a 1400px -- c'est lui qui limitait la taille reelle sur les
  // grands ecrans (95vw/95vh servaient deja de plafond proportionnel,
  // inchanges).
  var largeurMax = Math.min(1400, window.innerWidth * 0.9, window.innerHeight * 0.85);
  overlay.innerHTML =
    '<div style="background:white;border-radius:1rem;max-width:95vw;max-height:95vh;overflow:auto;padding:1.5rem;box-shadow:0 20px 60px rgba(0,0,0,0.3);">' +
    '<div class="d-flex justify-content-between align-items-center mb-2">' +
    '<h6 class="mb-0">Masquer une information</h6>' +
    '<button type="button" id="btnFermerGrandEditeur" class="btn btn-sm btn-outline-secondary" ' +
    'style="border-radius:50%;width:32px;height:32px;padding:0;">&#10005;</button>' +
    '</div>' +
    '<div class="d-flex justify-content-center gap-2 mb-2">' +
    '<button type="button" id="btnRotationGaucheGrand" class="btn btn-sm btn-outline-secondary">&#8634; Pivoter à gauche</button>' +
    '<button type="button" id="btnRotationDroiteGrand" class="btn btn-sm btn-outline-secondary">&#8635; Pivoter à droite</button>' +
    '</div>' +
    '<p class="text-muted mb-2" style="font-size:1.05rem;">Cliquez-glissez pour dessiner un rectangle noir sur une ' +
    'information à masquer. Cliquez sur un rectangle existant pour le supprimer.</p>' +
    '<canvas id="canvasGrandEditeurCV" style="max-width:100%;border:1px solid #E5E7EB;border-radius:8px;cursor:crosshair;"></canvas>' +
    '</div>';
  document.body.appendChild(overlay);
  function fermer() {
    overlay.remove();
    if (typeof onFermeture === 'function') { onFermeture(); }
  }
  // TACHE (retour utilisateur : plus de fermeture au clic sur le fond) :
  // la croix (btnFermerGrandEditeur) reste le seul moyen explicite de fermer.
  document.getElementById('btnFermerGrandEditeur').addEventListener('click', fermer);
  var redessinerGrand = initialiserCanvasEditeur(document.getElementById('canvasGrandEditeurCV'), img, etatPartage, largeurMax);
  // TACHE (retour utilisateur : rotation dans la grande vue) : meme
  // comportement que la petite vue (les 2 boutons existants, meme regle
  // de reinitialisation des zones masquees a la rotation -- coherence
  // partagee via calculerNouvelleRotation(), deja utilisee ailleurs).
  document.getElementById('btnRotationGaucheGrand').addEventListener('click', function () {
    etatPartage.rotationDegres = calculerNouvelleRotation(etatPartage.rotationDegres, 'gauche');
    etatPartage.rectangles = [];
    redessinerGrand();
  });
  document.getElementById('btnRotationDroiteGrand').addEventListener('click', function () {
    etatPartage.rotationDegres = calculerNouvelleRotation(etatPartage.rotationDegres, 'droite');
    etatPartage.rectangles = [];
    redessinerGrand();
  });
}

// Cable l'etape 2 : charge le document (image ou PDF, de facon
// transparente), affiche le canvas d'edition, les boutons de rotation, et
// la gestion souris (glisser = dessiner un rectangle, clic simple sur un
// rectangle existant = le supprimer).

function telechargerDocumentSecurise(blob, nomFichier) {
  var url = URL.createObjectURL(blob);
  var lien = document.createElement('a');
  lien.href = url;
  lien.download = nomFichier || 'document-securise.png';
  lien.click();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

// TACHE (Preparer un entretien, Etape 2) : version PARAMETREE de la
// generation "document securise" (rotation + rectangles "cuits" a pleine
// resolution) -- ne depend d'aucun etat ferme, reutilisable pour n'importe
// quel document. Seule implementation restante depuis le chantier "fenetre
// de verification unifiee" (l'ancienne genererDocumentSecurise(), a etat
// ferme, a ete retiree -- cablerVerificationDocument() appelle desormais
// celle-ci pour tous les parcours). Reutilise convertirRectanglePourExport(),
// deja hissee au niveau global.
function construireCanvasDocumentSecurise(img, rotationDegres, rectangles, echelleAffichageEditeur) {
  var rotation = rotationDegres || 0;
  var largeurFinale = (rotation === 90 || rotation === 270) ? img.height : img.width;
  var hauteurFinale = (rotation === 90 || rotation === 270) ? img.width : img.height;
  var canvasFinal = document.createElement('canvas');
  canvasFinal.width = largeurFinale;
  canvasFinal.height = hauteurFinale;
  var ctxFinal = canvasFinal.getContext('2d');
  ctxFinal.save();
  ctxFinal.translate(canvasFinal.width / 2, canvasFinal.height / 2);
  ctxFinal.rotate(rotation * Math.PI / 180);
  ctxFinal.drawImage(img, -img.width / 2, -img.height / 2);
  ctxFinal.restore();
  (rectangles || []).forEach(function (rectangleAffichage) {
    var r = convertirRectanglePourExport(rectangleAffichage, echelleAffichageEditeur);
    ctxFinal.fillStyle = 'black';
    ctxFinal.fillRect(r.x, r.y, r.largeur, r.hauteur);
  });
  return canvasFinal;
}


// ---------- Ecran "Choisir mon assistant" (remplace la fenetre ouvrirChoixIAEntretien) ----------

// TACHE (chantier "elimination des fenetres de depot CV", module 3/3,
// 2026-09-04) : vraie page, meme composant partage que Bilan/Decouverte/
// Coherence/Co-construire ma lettre (htmlChoixAssistantBilanCorps(),
// dette B.2) au lieu d'une liste de pastilles maison en couleurs figees
// (stylePastilleInline() -- corrige au passage, cet ecran n'etait jamais
// theme-aware). demarrerEnvoiIAEntretien() (ouvrirFenetreAssistantIA(),
// confirmation breve avant redirection) reste INCHANGEE : ce n'est pas
// une fenetre de saisie de document.
function _prepaEntretienRendreChoixAssistant() {
  var html = barreEtapesModule(PREPA_ENTRETIEN_NAV_ETAPES, 1) + _prepaEntretienBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-mic"></i> Préparer un entretien d’embauche</h1>' +
    '<p class="sousTitre">Le clic prépare et copie automatiquement votre demande, puis ouvre l’assistant choisi.</p></div>' +
    '<div class="cv-section prepa-entretien-etape-choix-ia">' +
    '<h4>&#128172; Choisissez votre assistant</h4>' +
    '<p class="text-muted small mb-3">Vous n’aurez qu’à faire Ctrl+V, puis glisser le fichier téléchargé à l’étape précédente dans la conversation.</p>' +
    htmlChoixAssistantBilanCorps({
      idErreur: 'prepaEntretienErreurChoixIA', attrAssistant: 'data-assistant-prepa-entretien',
      etapes: ETAPES_DETAIL_CHOIX_IA,
      texteConfidentialite: 'Vos documents ont déjà été relus et masqués au moment du dépôt.'
    }) +
    '</div>';
  app.innerHTML = '<div class="page-catalogue-contenu">' + html + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_prepaEntretienRetourPreparer()' }) + '</div>';
  _prepaEntretienBrancherBandePresentation();

  document.querySelectorAll('[data-assistant-prepa-entretien]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantPrepaEntretien; })[0];
      if (!assistant) { return; }
      demarrerEnvoiIAEntretien(assistant);
    });
  });
  if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_choix_assistant_affiche'); }
}

// ============================================================
// TACHE (retour utilisateur : "Co-construire votre lettre de motivation",
// icone dediee sur l'accueil) : parcours autonome, distinct de la lettre
// V2 integree (accordeon page Action) -- utilise le prompt V1 tres complet
// et conversationnel (prompts/lettre-v1.md), qui redemande lui-meme tout
// ce dont il a besoin au fil du dialogue. Reutilise le systeme de
// depot/verification/masquage CV deja existant (ouvrirAssistantDepotCV,
// via son crochet de sortie anticipee onDocumentPrepare) -- CV UNIQUEMENT,
// jamais de lettre a deposer ici (ce serait contradictoire, le but de cet
// ecran est justement d'en ecrire une). Le CV n'est PAS injecte
// automatiquement dans le prompt copie (choix assume : la personne le
// donne elle-meme pendant le dialogue avec l’assistant, pour une experience
// moins "programmee").
// ============================================================
// TACHE (generalisation du patron "page d'introduction de module",
// demande Denis 2026-08-31) : "Co-construire ma lettre", "Preparer un
// entretien" et "Decouvrir mes competences" sont des cascades de fenetres
// (pas des pages routees). Denis veut qu'ils aient une VRAIE page de
// presentation, comme Carnet/Lexique/Bilan -- avec, quand un travail
// existe deja, une synthese de ce qui a ete fait. Le rendu utilise le
// meme langage visuel que les autres pages d'intro. La cascade de
// fenetres elle-meme n'est jamais touchee : seul le point d'entree
// devient une page (`naviguerVers`), dont le CTA lance la cascade.
//
// config : { titre, sousTitre, blocsHTML, ctaId, ctaLabel, syntheseHTML?,
//   detour?, detourLogo?, detourBoutonId?, detourCtaId?, onRevenir? }
// detour : true quand cette presentation est affichee EN DETOUR depuis un
// ecran de travail routee (parcours en cours) -- on ajoute alors le bouton
// partage "Revenir au module" (haut + bas), la note adaptee, et "Retour"
// revient au module. Modules concernes : Decouverte, Comparer mes pistes.
// TACHE (retour Denis, 2026-08-31, Chantier 6) : encart repliable sur les
// pages d'introduction de TOUS les modules. Public reel : beneficiaires
// afghans, malaisiens... peu a l'aise avec le francais. Titre visible +
// "cliquez pour plus d'informations" : 80 % ne l'ouvriront pas, ceux qui
// l'ouvrent sauront pourquoi. Texte long valide par Denis. Une seule
// source a maintenir -- a inserer aussi dans les futures maquettes de
// modules (notamment les 3 parcours de la carte "Mes documents").
function htmlEncartMultilingue(courte) {
  // courte : Carnet / Lexique / Repères -- pas de passage assistant qui produit
  // du texte, donc on garde seulement "traduire la page + écrire dans sa langue"
  // (decision Denis, 2026-08-31, option 2).
  var corps = courte
    ? '<p class="mb-0">Votre navigateur peut souvent traduire cette page dans votre langue ' +
      '(clic droit sur la page, ou le menu du navigateur, puis « Traduire »). Vous pouvez alors ' +
      'écrire vos réponses dans votre langue.</p>'
    : '<p class="mb-2">Votre navigateur peut souvent traduire cette page dans votre langue ' +
      '(clic droit sur la page, ou le menu du navigateur, puis « Traduire »). Vous pouvez alors ' +
      'répondre aux questions dans votre langue : votre CV et votre lettre de motivation seront, ' +
      'eux, rédigés en français correct.</p>' +
      '<p class="mb-0">Pour dicter à la voix dans votre langue : la dictée de Windows ' +
      '(touches <span style="white-space:nowrap;">Windows + H</span>) suit la langue de l’ordinateur, ' +
      'le plus souvent le français. Sinon, utilisez la dictée vocale de Google Docs, ou le micro du ' +
      'clavier de votre téléphone, puis collez le texte ici.</p>';
  return '<details class="encart-multilingue" style="margin:0.9rem 0;border:1px solid var(--border);' +
    'border-left:3px solid var(--accent);border-radius:8px;">' +
    '<summary style="cursor:pointer;padding:0.65rem 0.9rem;font-weight:600;">' +
    '&#127757; Vous préférez une autre langue ? ' +
    '<span style="font-weight:400;font-size:0.9rem;color:var(--text-muted);">Cliquez ici pour plus d’informations.</span>' +
    '</summary>' +
    '<div style="padding:0 0.9rem 0.85rem;font-size:0.92rem;">' + corps + '</div></details>';
}

function htmlPageIntroModuleParcours(config) {
  return '<div class="page-catalogue-contenu intro-module-parcours">' +
    (config.detour && typeof htmlBoutonRevoirModule === 'function'
      ? htmlBoutonRevoirModule(config.detourBoutonId || 'btnIntroParcoursRevenir',
          config.detourLogo || 'bi-signpost-2', 'Revenir au module', true)
      : '') +
    // TACHE (retour Denis, 2026-09-04) : la barre d'etapes NE s'affiche
    // plus sur la page d'introduction (revient sur la decision du
    // 2026-08-31 ci-dessous, qui l'affichait en sourdine) -- une page
    // d'introduction n'est pas un ecran de travail, elle est deja assez
    // chargee. config.etapes reste utilise ailleurs (afficherProgression,
    // js/app.js) pour la barre des VRAIS ecrans de travail, inchange.
    '<div class="text-center"><h1>' + config.titre + '</h1>' +
    (config.sousTitre ? '<p class="sousTitre">' + config.sousTitre + '</p>' : '') +
    '</div>' +
    (config.syntheseHTML || '') +
    config.blocsHTML +
    htmlEncartMultilingue() +
    // config.ctaMasque : la page porte deja son choix ailleurs (bloc
    // "Continuer / Recommencer" de _introBlocReprise) -> pas de gros bouton
    // en bas, sauf en detour (toujours "Revenir au module").
    ((config.ctaMasque && !config.detour)
      ? ''
      : '<div class="text-center" style="margin-top:1.25rem;">' +
        (config.detour
          ? '<button type="button" id="' + (config.detourCtaId || 'btnIntroParcoursRevenirBas') + '" class="btn btn-primary btn-lg">Revenir au module &#8594;</button>'
          : '<button type="button" id="' + config.ctaId + '" class="btn btn-primary btn-lg"' +
            (config.ctaDesactive ? ' disabled' : '') + '>' + config.ctaLabel + '</button>' +
            // TACHE (retour Denis, 2026-08-31) : module pas encore construit -> CTA
            // desactive + une note sous le bouton. `--text-muted` est un jeton
            // adapte au mode sombre (jamais la classe Bootstrap .text-muted seule).
            (config.ctaNote ? '<p style="margin:.55rem 0 0;color:var(--text-muted);font-size:.9rem;">' + config.ctaNote + '</p>' : '')) +
        '</div>') +
    '</div>' +
    // "Retour" -> panneau de la carte de l'accueil d'ou le module a ete
    // choisi (jamais l'accueil nu : bouton "Accueil" de la barre pour ca).
    // config.carteRetour : 'preparer' | 'boiteaoutils' | 'analyse' | 'accueil'
    // (defaut 'boiteaoutils'). Chantier accueil Bloc 2. En detour, "Retour"
    // revient au module (chantier "bouton presentation").
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null,
      { onclickPrecedent: (config.detour && config.onRevenirExpr
        ? config.onRevenirExpr
        : "retourVersCarteAccueil('" + (config.carteRetour || 'boiteaoutils') + "')") }) + '</div>';
}
// Cable le CTA (config.ctaId -> config.onCta) + d'eventuels boutons de la
// synthese (chaque {id, action} de config.actionsSynthese) + en detour, les
// deux boutons "Revenir au module" (haut + bas) -> config.onRevenir.
function brancherPageIntroModuleParcours(config) {
  var btn = document.getElementById(config.ctaId);
  if (btn && typeof config.onCta === 'function') {
    btn.addEventListener('click', config.onCta);
  }
  if (config.detour && typeof config.onRevenir === 'function') {
    [config.detourBoutonId || 'btnIntroParcoursRevenir', config.detourCtaId || 'btnIntroParcoursRevenirBas'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('click', config.onRevenir); }
    });
  }
  (config.actionsSynthese || []).forEach(function (a) {
    var el = document.getElementById(a.id);
    if (el && typeof a.action === 'function') { el.addEventListener('click', a.action); }
  });
}

// Bandeau de synthese "travail deja fait" en tete de page d'intro --
// meme intention que le bandeau detour du Bilan. `lignes` = tableau de
// chaines HTML ; `boutonsHTML` = HTML des boutons d'action.
function _introBlocSynthese(titreHTML, lignes, boutonsHTML) {
  return '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);border-left:4px solid var(--accent);border-radius:12px;padding:1.1rem 1.3rem;">' +
    '<p class="mb-1" style="font-size:1.05rem;"><strong>' + titreHTML + '</strong></p>' +
    (lignes && lignes.length ? '<ul class="mb-2" style="padding-left:1.2rem;">' + lignes.map(function (l) { return '<li>' + l + '</li>'; }).join('') + '</ul>' : '') +
    (boutonsHTML ? '<div class="d-flex gap-2 flex-wrap">' + boutonsHTML + '</div>' : '') +
    '</div>';
}

// TACHE (chantier "bouton presentation", 2026-09-01) : pour les modules en
// cascade de fenetres (Lettre, Entretien), le travail deja fait ne se
// "reprend" pas ecran par ecran -- mais la page de presentation porte
// quand meme le choix "Continuer / Recommencer", au meme langage visuel
// que l'encart des modules routes. `texte` : ce qui a deja ete fait.
// `idContinuer`/`idRecommencer` : boutons cables par l'appelant
// (actionsSynthese). "Recommencer" en fond saumon, jamais rouge.
function _introBlocReprise(texteHTML, idContinuer, idRecommencer, libelleContinuer) {
  return '<div class="cv-section" style="margin-bottom:1rem;background:var(--accent-bg-subtle);border-left:4px solid var(--accent);border-radius:12px;padding:1.1rem 1.3rem;">' +
    '<p class="mb-2" style="font-size:1.05rem;"><strong>' + texteHTML + '</strong></p>' +
    '<div class="d-flex gap-2 flex-wrap">' +
    '<button type="button" id="' + idContinuer + '" class="btn btn-primary">' + (libelleContinuer || 'Continuer') + '</button>' +
    '<button type="button" id="' + idRecommencer + '" class="btn btn-recommencer-module">Recommencer</button>' +
    '</div></div>';
}

// Blocs communs de mise en forme pour ouvrirIntroModuleParcours (memes
// conventions visuelles que les pages d'intro : cv-section, encart accent).
function _introBlocSection(titre, corpsHTML) {
  return '<div class="cv-section" style="margin-bottom:0.9rem;"><h4>' + titre + '</h4>' + corpsHTML + '</div>';
}
function _introBlocAccroche(texteHTML) {
  return '<div class="cv-section" style="margin-bottom:0.9rem;background:var(--accent-bg-subtle);text-align:center;"><p class="mb-0">' + texteHTML + '</p></div>';
}
function _introBlocEncart(icone, texteHTML, variante) {
  var fond = variante === 'ok' ? 'var(--success-bg-subtle)' : 'var(--accent-bg-subtle)';
  var filet = variante === 'ok' ? 'var(--success)' : 'var(--accent)';
  return '<div class="cv-section" style="margin-bottom:0.5rem;background:' + fond + ';border-left:3px solid ' + filet + ';"><p class="mb-0 small">' + icone + ' ' + texteHTML + '</p></div>';
}

// TACHE (dette B.1, chantier "elimination des fenetres de depot CV",
// docs/CHANTIER_ELIMINATION_FENETRES_DEPOT_CV.md, module 1 sur 3,
// 2026-09-04) : le depot du CV, le choix de l'assistant et la recuperation
// de la reponse etaient jusqu'ici une cascade de 4 fenetres modales
// (ouvrirDepotLettreV1 -> ouvrirChoixAssistantLettreV1 ->
// ouvrirFenetreAssistantIA -> ouvrirRecuperationLettreV1), ouverte des le
// clic sur la tuile, sans aucune page derriere. Bascule sur de VRAIES
// pages routees (meme patron que Coherence transversale : etat en
// variables de module, dispatcher dans pageCoLettre(), "Retour" ramene a
// l'ecran precedent au sens strict, "Revoir la presentation" pour
// remonter jusqu'a l'intro). ouvrirFenetreAssistantIA() -- le petit ecran
// tampon "vous allez etre redirige" -- N'EST PAS concerne : ce n'est pas
// une fenetre de SAISIE de document, c'est la meme confirmation breve deja
// partagee par Bilan/Coherence/Decouverte/page Action, qui se referme
// d'elle-meme des le clic sur "Je comprends, continuer".
var _coLettreEcran = 'intro'; // 'intro' | 'depot' | 'choix-assistant' | 'reponse'
// TACHE (retour utilisateur 2026-09-17) : l'ecran quitte au moment ou la
// tuile "Co-construire ma lettre" (Accueil) force _coLettreEcran a 'intro'
// -- restaure par le bouton "Continuer" de l'encart de reprise, sur le
// meme principe que "Mes documents" (_prepLEEcran force a 'intro' par la
// tuile, jamais par la navigation interne du module).
var _coLettreEcranRepris = null;
// TACHE (retour utilisateur 2026-09-17, precision : le bloc 4 doit etre
// PRESENT des le 1er affichage comme les blocs 1/2/3 -- seul son etat
// ouvert/ferme est conditionnel) : blocs 3 et 4 suivent desormais le MEME
// principe que les blocs 1/2 -- chacun s'ouvre tant que sa propre etape
// n'est pas franchie, se referme de lui-meme une fois franchie, sans
// bouton de validation separe ("Ces reglages me conviennent" retire, sans
// plus-value une fois ce principe applique -- voir contenuRectangleStyleCV()
// et son parametre masquerBoutonValider). _coLettreAdaptationValidee
// (variable intermediaire, ex-mecanisme de "validation" manuelle) est donc
// retiree : plus necessaire.
var _coLettreDetour = false;  // "Revoir la presentation" en detour depuis un ecran de travail
var _coLettreDocument = null; // { type: 'texte' | 'image', valeur } -- resultat de ouvrirAssistantDepotCV
// TACHE (refonte L1, etape 9, 2026-09-10, docs/CHANTIER_L1_CO_LETTRE_MOTIVATION.md) :
// trou de confidentialite -- le chemin "Ou coller le texte" de l'ecran 2 sautait
// la relecture/masquage (seul le chemin fichier passe par ouvrirAssistantDepotCV,
// qui masque). Sur le modele de _prepLE (bloc 2 "Relire, verifier, corriger,
// masquer"), le CV colle en texte doit passer par bilanDemanderRelectureCv avant
// que le CTA "Choisir mon assistant" ne s'active. Chemin fichier / image = deja
// relu (la modale a masque), _coLettreCvRelu passe a true a onDocumentPrepare.
var _coLettreCvRelu = false;
var _coLettreReponseEstImage = false; // transmis a l'ecran "reponse" (ex-parametre estImage de ouvrirRecuperationLettreV1)
var _coLettreReponseTexteCv = null;   // idem pour texteCV (bouton "Copier mon CV" de l'ecran "reponse")
// TACHE (retour utilisateur 2026-09-17, ecran "reponse") : suit si "Copier
// mon CV" a deja ete clique au moins une fois sur ce passage -- tant que
// non, "Je suis de retour" reste bloque (voir _coLettreRendreReponse). Remis
// a false a chaque nouvelle entree sur l'ecran (onApresValidation), jamais
// pendant les re-rendus internes de l'ecran (sinon le clic serait oublie).
var _coLettreCvCopie = false;
// TACHE (retour utilisateur 2026-09-17, bug reel confirme : "Retour" depuis
// "Vos documents" apres import ramenait sur un ecran de collage vide, comme
// si le travail deja fait avait disparu) : force l'ecran "reponse" a
// afficher a nouveau la zone de collage (voir _coLettreRendreReponse) meme
// si une lettre est deja importee -- pose uniquement par le bouton "Coller
// une nouvelle reponse" de l'ecran "deja importee". Remis a false a chaque
// nouvelle entree normale sur l'ecran (onApresValidation), comme
// _coLettreCvCopie juste au-dessus.
var _coLettreReponseForcerCollage = false;

// Barre d'etapes du module -- source unique, utilisee par l'intro (config
// passee a htmlPageIntroModuleParcours, jamais affichee sur l'intro
// elle-meme depuis le retrait de la barre des pages d'introduction, voir
// B.5) ET par les 3 ecrans de travail ci-dessous.
var CO_LETTRE_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Rédiger', icone: '&#128395;&#65039;' },
  { label: 'Terminé', icone: '&#9989;' }
];

// Dispatcher (route 'co-lettre', meme principe que pageCoherenceTransversale
// et pagePreparerLettreEntretien) : tant que _coLettreEcran n'a pas ete
// remis a 'intro' (Terminé, ou jamais commence), on atterrit directement
// sur l'ecran de travail en cours -- jamais de retour force a l'intro.
function pageCoLettre() {
  if (_coLettreDetour) { _coLettreRendreIntro(); return; }
  if (_coLettreEcran === 'depot') { _coLettreRendreDepot(); return; }
  if (_coLettreEcran === 'choix-assistant') { _coLettreRendreChoixAssistant(); return; }
  if (_coLettreEcran === 'reponse') { _coLettreRendreReponse(); return; }
  _coLettreRendreIntro();
}

// "Retour" d'un ecran de travail ou bouton "Revoir la presentation" ->
// intro affichee PAR-DESSUS le travail en cours (non destructif, rien
// n'est perdu). Meme mecanisme que ctRevenirALaPresentation() (Coherence,
// correctif RC-03) et _prepLEVoirPresentation() (Préparer ma lettre et mon
// entretien).
function _coLettreVoirPresentation() {
  _coLettreDetour = true;
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}
// "Revenir au module" depuis l'intro en detour -> ecran de travail quitte
// (_coLettreEcran n'a jamais bouge pendant le detour).
function _coLettreRevenirModule() {
  _coLettreDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}
// TACHE (retour Denis, 2026-09-07, BUG REEL : "Retour" depuis l'ecran de
// depot bouclait avec l'intro) : _coLettreVoirPresentation() (detour) n'est
// PAS le bon mecanisme ici -- l'intro EN DETOUR revient elle-meme sur
// 'depot' via son propre "Retour"/"Revenir au module", ce qui cree une
// boucle a 2 ecrans au lieu de continuer a reculer vers l'accueil. Le
// depot est le TOUT PREMIER ecran de travail : son "Retour" doit afficher
// l'intro en mode NORMAL (pas en detour), pour que le propre "Retour" de
// l'intro continue ensuite vers l'accueil de la carte -- meme patron deja
// correct que _prepLERetourIntro() ("Preparer ma lettre et mon entretien")
// et ctRetourDepuisCollecte() (Coherence). Non destructif : _coLettreDocument
// n'est jamais efface ici.
function _coLettreRetourIntro() {
  _coLettreEcran = 'intro';
  _coLettreDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}
// "Retour" depuis l'ecran "Choisir mon assistant" -> revient au depot du
// CV (l'ecran precedent au sens strict), sans rien detruire : le CV deja
// depose reste marque comme depose.
function _coLettreRetourDepot() {
  _coLettreEcran = 'depot';
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}
// "Retour" depuis l'ecran "Coller la reponse" -> revient au choix de
// l'assistant (permet de repartir avec un autre assistant).
function _coLettreRetourChoixAssistant() {
  _coLettreEcran = 'choix-assistant';
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}
// Relance complete du parcours (bouton "Recommencer" de l'intro) : efface
// le CV depose, repart de zero. La lettre deja ecrite (dossier.ia.lettre)
// n'est PAS effacee ici -- meme regle que partout ailleurs, rien n'est
// perdu tant qu'une nouvelle lettre n'est pas enregistree par-dessus.
function _coLettreRecommencer() {
  _coLettreDocument = null;
  _coLettreCvRelu = false;
  _coLettreEcran = 'depot';
  _coLettreEcranRepris = null;
  if (typeof naviguerVers === 'function') { naviguerVers('co-lettre'); }
}

// TACHE (retour Denis, 2026-08-31) : vraie page de presentation du module
// "Co-construire ma lettre de motivation" (route 'co-lettre'), avec
// synthese du travail deja fait. Atteinte depuis la tuile Boite a outils.
function _coLettreRendreIntro() {
  var lettreFaite = !!(dossier.ia && dossier.ia.lettre &&
    (dossier.ia.lettre.accroche || (dossier.ia.lettre.arguments || []).length ||
      (dossier.ia.lettre.lettre && dossier.ia.lettre.lettre.texte)));
  // TACHE (retour utilisateur 2026-09-17, point 6 : "Continuer/Recommencer
  // comme dans Mes documents") : jusqu'ici, l'encart de reprise ne
  // reconnaissait qu'une lettre DEJA TERMINEE (lettreFaite) -- un CV depose
  // mais pas encore transmis a l'assistant (etape "Preparer" ou "Assistant")
  // ne montrait rien de tel, alors que la tuile Accueil (voir plus bas,
  // brancher('btnCarteAccueilLettre', ...)) force desormais _coLettreEcran a
  // 'intro' a chaque retour, comme "Mes documents". Sans cette 2e detection,
  // tout travail non termine semblerait perdu.
  var travailEnCours = !lettreFaite && !!_coLettreDocument;
  function confirmerRecommencer() {
    if (typeof confirmerAction !== 'function') { _coLettreRecommencer(); return; }
    confirmerAction(
      'Recommencer une lettre de motivation ?',
      'Vous allez repartir du dépôt de votre CV pour une nouvelle lettre. La lettre déjà écrite reste accessible tant que vous n’en enregistrez pas une autre.',
      'Recommencer', 'btn-danger', _coLettreRecommencer
    );
  }
  var syntheseHTML = '';
  var actionsSynthese = [];
  if (!_coLettreDetour && lettreFaite) {
    // TACHE (chantier "bouton presentation", 2026-09-01) : meme langage que
    // l'encart "Continuer / Recommencer" des modules routes.
    syntheseHTML = _introBlocReprise(
      'Vous avez déjà travaillé une lettre de motivation.',
      'btnCoLettreContinuer', 'btnCoLettreRecommencer', 'Voir ma lettre');
    actionsSynthese.push({
      id: 'btnCoLettreContinuer',
      action: function () { dossier.dernierDocumentPrepare = 'lettre'; naviguerVers('resultats'); }
    });
    actionsSynthese.push({ id: 'btnCoLettreRecommencer', action: confirmerRecommencer });
  } else if (!_coLettreDetour && travailEnCours) {
    syntheseHTML = _introBlocReprise(
      'Vous avez commencé à préparer votre lettre de motivation.',
      'btnCoLettreContinuer', 'btnCoLettreRecommencer', 'Continuer');
    actionsSynthese.push({
      id: 'btnCoLettreContinuer',
      action: function () {
        // TACHE (point 6) : _coLettreEcranRepris retient l'ecran quitte au
        // moment ou la tuile a force 'intro' (voir plus bas) -- jamais
        // invente, repli sur 'depot' seulement si absent (1ere reprise
        // apres un rechargement de page, ou l'etat en memoire est perdu).
        _coLettreEcran = _coLettreEcranRepris || 'depot';
        naviguerVers('co-lettre');
      }
    });
    actionsSynthese.push({ id: 'btnCoLettreRecommencer', action: confirmerRecommencer });
  }
  var config = {
    carteRetour: 'preparer',
    detour: _coLettreDetour,
    detourLogo: 'bi-pen',
    detourBoutonId: 'btnCoLettreRevenirModuleHaut',
    detourCtaId: 'btnCoLettreRevenirModuleBas',
    onRevenir: _coLettreRevenirModule,
    onRevenirExpr: '_coLettreRevenirModule()',
    titre: '<i class="bi bi-pen"></i> Co-construire ma lettre de motivation',
    sousTitre: 'Vous n’écrivez pas seul : un assistant en ligne propose, vous gardez la main sur chaque phrase.',
    etapes: CO_LETTRE_NAV_ETAPES,
    ctaId: 'btnCoLettreCommencer',
    ctaLabel: 'Écrire ma lettre de motivation &#8594;',
    ctaMasque: (!_coLettreDetour && (lettreFaite || travailEnCours)),
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    onCta: function () { _coLettreEcran = 'depot'; naviguerVers('co-lettre'); },
    blocsHTML:
        _introBlocAccroche('<strong>La page blanche est le vrai obstacle d’une lettre de motivation.</strong> Ici, vous n’en partez pas. Vous avancez à deux, à votre rythme.') +
        _introBlocSection('&#127919; À quoi ça sert',
          '<p class="mb-0">Écrire une lettre qui vous ressemble, sans rester bloqué devant une feuille vide. L’assistant propose une structure et des formulations à partir de votre parcours réel ; vous choisissez ce que vous gardez, ce que vous changez, ce que vous enlevez.</p>') +
        _introBlocSection('&#128203; Ce qui va se passer',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Vous choisissez un assistant en ligne (ChatGPT ou un autre) et vous échangez avec lui, <strong>au clavier ou à la voix</strong>.</li>' +
          '<li>Vous partez de votre CV, sous la forme que vous avez : un fichier, une photo, un scan, ou simplement le texte collé. Pas besoin qu’il soit mis en forme ni créé dans l’application.</li>' +
          '<li>Vous le relisez à l’écran et vous masquez ce que vous ne voulez pas transmettre (nom, adresse, téléphone).</li>' +
          '<li>Vous indiquez le poste visé et, si vous les avez, l’offre et le nom de l’entreprise.</li>' +
          '<li>L’assistant propose un plan et des phrases. Vous reprenez, modifiez, coupez, autant de fois qu’il le faut.</li>' +
          '<li>Quand la lettre vous convient, vous la rapportez ici.</li>' +
          '</ul>') +
        _introBlocSection('&#128683; Ce que ce module ne fait pas',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Ce n’est pas une lettre générée d’un clic qu’il n’y aurait plus qu’à envoyer.</li>' +
          '<li>Ce n’est pas une analyse de votre CV : ici, on rédige un document, on ne fait pas l’état des lieux de votre candidature.</li>' +
          '<li>Rien n’est écrit à votre place sans que vous le validiez. La lettre reste la vôtre.</li>' +
          '</ul>') +
        _introBlocSection('&#128077; Vous gardez la main',
          '<p class="mb-0">À chaque étape, c’est vous qui décidez : ce que vous transmettez, ce que vous gardez du texte proposé, ce que vous reformulez. L’assistant propose, vous tranchez.</p>') +
        _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Repartir avec votre lettre au format Word (DOCX), prête à joindre à votre candidature.</li>' +
          '<li>En copier une version courte pour le corps d’un e-mail, ou l’ouvrir en aperçu pour la relire et l’imprimer.</li>' +
          '</ul>') +
        _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
          '<p class="mb-0">À tout moment, vous pouvez mettre de côté une réflexion utile sur votre parcours (un doute, une idée, une chose à en dire) dans Mes Repères, pour vous ou votre conseiller.</p>') +
        _introBlocSection('&#128172; Comment ça se passe concrètement',
          '<p class="mb-0">L’application prépare et copie le texte de départ pour vous. Vous le collez sur le site de l’assistant, vous échangez avec lui, puis vous revenez coller la lettre ici. Vous êtes guidé à chaque étape ; vous n’avez rien à taper pour démarrer.</p>') +
        _introBlocSection('&#9989; Bon à savoir',
          _introBlocEncart('&#128274;', 'Avant de transmettre votre CV, vous passez par un écran de vérification où vous pouvez masquer votre nom, votre adresse ou votre téléphone.') +
          _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir enregistré votre lettre, sinon elle sera perdue à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_intro_affichee'); }
}

// ---------- Ecran "Votre CV" (remplace la fenetre ouvrirDepotLettreV1) ----------

// TACHE (chantier "elimination des fenetres de depot CV", module 1/3) :
// meme langage visuel que le bloc 1 de la page "Preparer" depliante
// (bilanCorpsCiblageOffreHTML / htmlPreparerLettreEntretienDepliante,
// classe .bilan-preparer reutilisee telle quelle -- brique visuelle
// partagee, nommee d'apres son premier consommateur comme
// bilanCorpsCiblageOffreHTML) : un seul document ici (le CV), pas de bloc
// "situation"/"offre" -- ce parcours n'en a jamais demande.
// Bande "Revoir la présentation" partagée par les 3 écrans de travail --
// même bouton, même place, même note (une seule fois "vue") sur chacun.
function _coLettreBandePresentation() {
  var bouton = '<div><button type="button" id="btnCoLettreRevoirPres" class="btn-revoir-module">' +
    '<i class="bi bi-pen"></i> Revoir la présentation</button></div>' +
    (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue()
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '');
  return (typeof htmlBandeRepriseModule === 'function') ? htmlBandeRepriseModule(bouton, '') : bouton;
}
// Cable le bouton ci-dessus -- a appeler par chacun des 3 ecrans apres rendu.
function _coLettreBrancherBandePresentation() {
  var btn = document.getElementById('btnCoLettreRevoirPres');
  if (btn) { btn.addEventListener('click', _coLettreVoirPresentation); }
}

// TACHE (refonte L1 "Co-construire ma lettre", etape 6, 2026-09-07,
// docs/CHANTIER_L1_CO_LETTRE_MOTIVATION.md §3ter) : l'ecran "Preparer"
// passe d'un bloc unique (le CV) a une page depliante a 2 blocs. Bloc 2
// "L'entreprise et le poste" ajoute -- une lettre de motivation s'adresse
// a une entreprise precise. 100% briques existantes, aucune nouvelle :
//   - poste vise -> dossier.metierCible (champ deja lu par texteProfil)
//   - bilanCorpsCiblageOffreHTML() + bilanCablerCiblageOffre() +
//     bilanLireCiblageOffre() : entreprise / site / offre / type de
//     structure (meme bloc que le Bilan et "Preparer ma lettre et mon
//     entretien")
//   - contenuCiviliteRecruteurCandidature() +
//     wireCiviliteEtCouleurRecruteurCandidature() : civilite + nom du
//     recruteur (formule d'appel de la lettre)
// Tout est facultatif : seul le CV depose active le CTA.
function _coLettreRendreDepot() {
  var cvPresent = !!_coLettreDocument;
  var estImage = cvPresent && _coLettreDocument.type === 'image';
  // Chemin fichier / image = deja masque par ouvrirAssistantDepotCV (la modale
  // fait son propre ecran de verification). Chemin "Ou coller le texte" = brut
  // tant que _coLettreCvRelu n'est pas passe a true par bilanDemanderRelectureCv.
  var cvRelu = cvPresent && (estImage || _coLettreCvRelu);
  // TACHE (retour utilisateur 2026-09-17, point 2) : "L'entreprise et le
  // poste" (simple champ texte + entreprise/offre) est remplace par le
  // fonctionnement de "Votre objectif" (pageObjectif(), js/app.js) : type de
  // candidature (OBJECTIF_CHOIX_CANDIDATURE, memes cartes) puis
  // contenuModeRecherche()/contenuCandidature() (memes fonctions, memes
  // champs metier/domaine/offre/entreprise/site/type de structure -- rien
  // invente). Civilite et nom du recruteur restent le mecanisme deja en
  // place pour "avez-vous un contact dans l'entreprise" juste en dessous.
  var candidatureRenseignee = !!dossier.objectif;
  var estStageAlternancePmsmp = !!dossier.objectif && ['stage', 'alternance', 'pmsmp'].indexOf(dossier.objectif) !== -1;
  // TACHE (retour utilisateur 2026-09-17, precision : "je veux voir le 4eme
  // point comme les 3 autres des la 1ere page, mais qu'il s'ouvre quand les
  // conditions sont reunies") : bloc 4 "Adaptation au metier" est toujours
  // PRESENT (comme les blocs 1/2/3), seul son etat ouvert/ferme depend de
  // cette etape cle du bloc 3 -- pas du premier choix de type de
  // candidature (trop tot, tout le detail entreprise/offre arrive encore
  // apres).
  // TACHE (retour utilisateur 2026-09-17, bug reel confirme : "candidature
  // spontanee + metier precis -> le bloc 3 se ferme des que je choisis
  // n'importe quoi d'autre, pas seulement a la question sur le
  // recruteur") : civiliteRecruteurTouchee est LE seul signal utilise
  // desormais, pour les 6 objectifs (pas seulement stage/alternance/pmsmp) --
  // contenuModeRecherche() pose lui aussi cette question tot ou tard (via
  // contenuCoordonneesEntrepriseBilanInline si offre, ou
  // contenuCandidatureReduiteSansStructure si spontanee/reconversion en
  // recherche simple, toutes deux ecrivent le MEME drapeau, voir
  // wireCiviliteEtCouleurRecruteurCandidature()/wireCandidatureReduiteSansStructure(),
  // js/app.js) -- dossier.modeRecherche seul (1er choix du bloc 3) etait
  // trop tot, avant meme d'avoir vu cette question.
  var etapeCleCandidatureFranchie = !!(dossier.rechercheCandidature && dossier.rechercheCandidature.civiliteRecruteurTouchee);
  var prefsLettreCourantes = dossier.preferencesIAParType.lettre;
  // TACHE (retour utilisateur 2026-09-17, meme demande) : "Adaptation au
  // metier" (meme composant que "Creer un nouveau CV", contenuRectangleStyleCV(),
  // deja unifie plus tot ce jour pour pageResultats()) doit aussi etre posee
  // ICI, avant le passage chez l'assistant -- jusqu'ici, dossier.preferencesIAParType.lettre
  // restait toujours a ses valeurs par defaut pour ce parcours, le ton de la
  // lettre ne s'adaptait donc jamais aux choix de la personne.
  // TACHE (retour utilisateur 2026-09-17, suite) : appliquerDefautsStyleCV()
  // n'etait jamais appelee pour ce parcours (seul pageAssistant()/pageResultats()
  // le faisaient, voir js/app.js) -- meme reglages par defaut ICI que dans
  // "Creer un nouveau CV" (niveau de langage/vocabulaire/ton/longueur
  // pre-choisis, seuls "niveau de poste" et "situation actuelle" restent a
  // renseigner). Idempotente (ne remplit que les valeurs encore nulles) :
  // sans effet une fois la personne deja passee par le bloc 4.
  if (typeof appliquerDefautsStyleCV === 'function') { appliquerDefautsStyleCV('lettre'); }
  // TACHE (retour utilisateur 2026-09-17, bug reel confirme : "le point 4
  // est vert des l'arrivee, avant meme d'avoir depose le CV") :
  // appliquerDefautsStyleCV() ci-dessus remplit niveauLangage/adaptationMetier/
  // ton/longueur DES le tout premier rendu -- un simple "!!valeur" les
  // comptait donc comme "personnalise" alors que ce sont des defauts
  // silencieux, jamais un choix reel de la personne. "Personnalise" ne
  // compte desormais que : niveauPoste/situationActuelle (jamais de
  // defaut, donc toute valeur y est un vrai choix), OU une valeur qui
  // S'ECARTE du defaut pour les 4 autres champs (preuve d'un choix actif,
  // pas juste la presence d'une valeur).
  var stylePersonnalise = !!(prefsLettreCourantes.niveauPoste || dossier.situationActuelle ||
    (prefsLettreCourantes.niveauLangage && prefsLettreCourantes.niveauLangage !== STYLE_CV_DEFAUTS.niveauLangage) ||
    (prefsLettreCourantes.adaptationMetier && prefsLettreCourantes.adaptationMetier !== STYLE_CV_DEFAUTS.adaptationMetier) ||
    (prefsLettreCourantes.ton && prefsLettreCourantes.ton !== STYLE_CV_DEFAUTS.ton) ||
    (prefsLettreCourantes.longueur && prefsLettreCourantes.longueur !== STYLE_CV_DEFAUTS.longueur));
  var html = barreEtapesModule(CO_LETTRE_NAV_ETAPES, 0) + _coLettreBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-pen"></i> Co-construire ma lettre de motivation</h1>' +
    '<p class="sousTitre">Tout se prépare ici, sur une seule page qui se déplie. On part de votre CV, puis on précise à qui la lettre s’adresse.</p></div>' +
    '<details class="bloc-depli' + (cvPresent ? ' bd-ok' : '') + '" id="coLettreBlocCv"' + (!cvPresent ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">1</span><span class="preparer-titre">Votre CV</span>' +
    '<span class="pilule-etat ' + (cvPresent ? 'pe-ok">Déposé &middot; vous pouvez le changer' : 'pe-attente">À déposer') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (cvPresent
      ? '<div class="carte-preparer-ok"><strong>&#9989; Déposé</strong>' +
        '<button type="button" id="btnCoLettreChangerCv" class="btn btn-outline-secondary btn-sm ms-2">Changer de CV</button></div>' +
        '<p class="preparer-detail">Un seul CV à la fois. « Changer de CV » remplace celui-ci.</p>'
      : '<p>Déposez votre CV, ou collez son texte. Il est lu directement dans votre navigateur, <strong>il n’est envoyé nulle part</strong> à ce stade.</p>' +
        '<div class="d-flex gap-2 flex-wrap">' +
        '<button type="button" id="btnCoLettreDeposerCv" class="btn btn-primary btn-sm">Déposer mon fichier</button>' +
        '<button type="button" id="btnCoLettreCollerCv" class="btn btn-outline-secondary btn-sm">Ou coller le texte</button>' +
        '</div>' +
        '<p class="preparer-detail"><strong>Tous les formats sont acceptés</strong> : PDF, Word, .txt, une photo ou une capture d’écran. Pour une photo ou un scan, une fenêtre s’ouvre le temps de préparer l’image, puis vous revenez ici.</p>' +
        '<div id="coLettreCollerZone" hidden class="mt-2">' +
        '<textarea id="coLettreCollerTexte" class="form-control form-control-sm" rows="6" placeholder="Collez ici le texte de votre CV"></textarea>' +
        '<div class="mt-2"><button type="button" id="btnCoLettreCollerValider" class="btn btn-outline-secondary btn-sm">Annuler</button></div>' +
        '</div>') +
    '</div></details>' +
    // Bloc 2 : Relire, verifier, corriger, masquer -- OBLIGATOIRE. Meme brique
    // que _prepLE (bilanDemanderRelectureCv). Pour un CV colle en texte, c'est
    // le SEUL ecran de masquage : sans lui, le "Copier mon CV" de l'ecran 4
    // enverrait le CV brut (nom, telephone, courriel) a l'assistant.
    '<details class="bloc-depli' + (cvRelu ? ' bd-ok' : '') + '" id="coLettreBlocRelecture"' + (cvPresent && !cvRelu ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">2</span><span class="preparer-titre">Relire, vérifier, corriger, masquer</span>' +
    '<span class="preparer-oblig">obligatoire</span>' +
    '<span class="pilule-etat ' + (cvRelu ? 'pe-ok">Relu et validé' : 'pe-info">À faire &middot; modifiable ensuite') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (estImage
      ? '<p>Vous avez masqué directement sur l’image à l’étape précédente. Rien d’autre à faire ici.</p>'
      : '<p>Vous <strong>corrigez le texte</strong> si besoin, et vous <strong>masquez ce que vous ne voulez pas transmettre</strong> à l’assistant (téléphone, courriel, adresse, liens). Rien n’est masqué à votre place.</p>' +
        '<p class="preparer-detail">Le <strong>téléphone, le courriel, les liens, le code postal et la ville</strong>, l’âge ou la date de naissance étiquetés sont <strong>surlignés en jaune</strong> pour que vous les repériez. Le nom, le prénom et le numéro de rue ne sont repérés que sous la forme « Nom : … » ou dans le courriel : vérifiez le reste vous-même.</p>' +
        '<div class="d-flex gap-2 flex-wrap align-items-center">' +
        '<button type="button" id="btnCoLettreRelecture" class="btn btn-primary btn-sm"' + (cvPresent ? '' : ' disabled') + '>' + (cvRelu ? 'Revoir la relecture' : 'Ouvrir la relecture') + '</button>' +
        (typeof htmlDeclencheurDemoVideo === 'function' ? htmlDeclencheurDemoVideo('masquage-texte') : '') +
        '</div>' +
        (cvPresent ? '' : '<p class="preparer-detail">Déposez d’abord votre CV (partie 1) pour pouvoir le relire.</p>')) +
    '</div></details>' +
    '<details class="bloc-depli' + (candidatureRenseignee ? ' bd-ok' : '') + '" id="coLettreBlocCible"' + (cvPresent && cvRelu && !etapeCleCandidatureFranchie ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">3</span><span class="preparer-titre">Votre candidature</span>' +
    '<span class="preparer-oblig">facultatif</span>' +
    '<span class="pilule-etat ' + (candidatureRenseignee ? 'pe-ok">Renseigné' : 'pe-info">Facultatif &middot; conseillé si vous l’avez') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    '<p>Une lettre de motivation s’adresse à une entreprise précise. Plus vous en dites ici, plus elle sera ciblée. Tout est facultatif.</p>' +
    '<p class="mb-2">Quel type de candidature préparez-vous ?</p>' +
    '<div class="grille-objectif">' +
    OBJECTIF_CHOIX_CANDIDATURE.map(function (o) {
      return '<button type="button" class="carte-objectif' + (dossier.objectif === o.id ? ' carte-objectif--actif' : '') + '" data-action="objectif" data-value="' + o.id + '">' +
        '<i class="bi ' + o.icon + '" aria-hidden="true"></i>' +
        '<span class="carte-objectif-titre">' + o.title + '</span>' +
        '<span class="carte-objectif-desc">' + o.desc + '</span>' +
        '</button>';
    }).join('') +
    '</div>' +
    (dossier.objectif
      // TACHE (retour utilisateur 2026-09-17, bug reel trouve au test
      // navigateur : "Connaissez-vous la personne..." apparaissait EN
      // DOUBLE) : contenuModeRecherche()/contenuCandidature() posent deja
      // eux-memes la question civilite/nom du recruteur (via
      // contenuCoordonneesEntrepriseBilanInline / contenuCandidatureReduiteSansStructure /
      // contenuCandidature -- les 3 chemins la contiennent deja), exactement
      // comme sur "Votre objectif". Le bloc contenuCiviliteRecruteurCandidature()
      // separe qui vivait ici avant (ancien bloc "L'entreprise et le poste")
      // est donc retire, jamais recree.
      // TACHE (retour utilisateur 2026-09-17, "les couleurs de l'entreprise
      // ne concernent que le CV, jamais la lettre") : contenuCouleurEntrepriseCandidature()
      // a deja son propre garde-fou (docActifActuel() !== 'cv' -> ''), mais
      // docActifActuel() se rabat sur dossier.dernierDocumentPrepare, qui ne
      // vaut 'lettre' qu'APRES l'import final (voir plus bas) -- pendant tout
      // cet ecran "Preparer", il valait encore 'cv' (ou le repli general),
      // laissant la question apparaitre a tort. Bascule locale le temps de
      // ce seul appel, restauree juste apres -- jamais une modification du
      // garde-fou partage lui-meme (les autres appelants de cette fonction,
      // eux, resolvent docActifActuel() correctement). contenuCandidature(true) :
      // "Je ne sais pas" n'est plus precoche (voir la fonction) -- l'etape
      // cle qui ouvre le bloc 4 (etapeCleCandidatureFranchie plus haut) doit
      // correspondre a une vraie reponse de la personne, jamais a un defaut
      // silencieux.
      ? '<div class="mt-3">' + (function () {
          var docPrepareAvant = dossier.dernierDocumentPrepare;
          dossier.dernierDocumentPrepare = 'lettre';
          var htmlCandidature = estStageAlternancePmsmp ? contenuCandidature(true) : contenuModeRecherche();
          dossier.dernierDocumentPrepare = docPrepareAvant;
          return htmlCandidature;
        })() + '</div>'
      : '') +
    '</div></details>' +
    // TACHE (retour utilisateur 2026-09-17, point 2 (suite)) : "Adaptation au
    // metier" -- meme composant que "Creer un nouveau CV"
    // (contenuRectangleStyleCV(), deja source unique depuis la refonte du
    // meme jour du panneau equivalent de "Vos documents"). Posee AVANT le
    // passage chez l'assistant (bloc 4, avant le bouton "Choisir mon
    // assistant" plus bas), pour que le ton de la lettre s'adapte reellement
    // aux choix de la personne -- jusqu'ici, ce reglage n'existait pas du
    // tout pour ce parcours.
    // TACHE (retour utilisateur 2026-09-17, precision) : le bloc 4 est
    // desormais TOUJOURS present, comme les blocs 1/2/3 (visible des le 1er
    // affichage) -- seul son etat ouvert/ferme reste conditionnel, exactement
    // comme les blocs 1 et 2 : ouvert des que l'etape cle du bloc 3 est
    // franchie, puis se referme de lui-meme une fois "Votre situation en ce
    // moment" renseignee (voir bouton "Choisir mon assistant" plus bas, qui
    // en depend desormais) -- plus de bouton de validation separe
    // (masquerBoutonValider=true, voir contenuRectangleStyleCV()).
    '<details class="bloc-depli' + (stylePersonnalise ? ' bd-ok' : '') + '" id="coLettreBlocAdaptation"' + (etapeCleCandidatureFranchie && !dossier.situationActuelle ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">4</span><span class="preparer-titre">Adaptation au métier</span>' +
    '<span class="preparer-oblig">facultatif</span>' +
    '<span class="pilule-etat ' + (stylePersonnalise ? 'pe-ok">Personnalisé' : 'pe-info">Facultatif &middot; l’assistant s’adapte seul') + '</span></summary>' +
    '<div class="bloc-depli-corps">' + contenuRectangleStyleCV('lettre', true, true) + '</div>' +
    '</details>' +
    // TACHE (retour utilisateur 2026-09-17, "votre situation en ce moment
    // ... c'est une information importante pour la redaction de la lettre") :
    // "Choisir mon assistant" exige desormais, en plus du CV depose et relu,
    // que dossier.situationActuelle soit renseigne (bloc 4) -- "Votre
    // candidature" (bloc 3) reste seul facultatif. Raison du blocage
    // toujours visible sous le bouton (pas seulement au survol -- public
    // peu a l'aise avec l'informatique, voir CLAUDE.md), + attribut title
    // pour l'info-bulle au survol sur les ecrans qui la supportent.
    (function () {
      var raisonsBlocageCta = [];
      if (!cvPresent) { raisonsBlocageCta.push('déposer votre CV'); }
      else if (!cvRelu) { raisonsBlocageCta.push('relire votre CV'); }
      if (!dossier.situationActuelle) { raisonsBlocageCta.push('indiquer votre situation actuelle dans « Adaptation au métier »'); }
      var ctaBloque = raisonsBlocageCta.length > 0;
      return '<div class="text-center" style="margin-top:1.4rem;">' +
        '<button type="button" id="btnCoLettreVersAssistant" class="btn btn-primary btn-lg"' +
        (ctaBloque ? ' disabled title="Il reste à ' + echapperAttribut(raisonsBlocageCta.join(' et à ')) + '."' : '') +
        '>Choisir mon assistant &#8594;</button>' +
        (ctaBloque
          ? '<p class="preparer-detail" style="margin-top:.5rem;color:var(--warning-strong);">&#9888;&#65039; Il reste à ' + raisonsBlocageCta.join(' et à ') + '.</p>'
          : '<p class="preparer-detail" style="margin-top:.5rem;">Vous pouvez choisir votre assistant. « Votre candidature » peut rester vide.</p>');
    })() +
    '</div>';

  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer co-lettre-parcours">' + html + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_coLettreRetourIntro()' }) + '</div>';
  _coLettreBrancherDepot();
  if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_depot_affiche'); }
}

// TACHE (retour utilisateur 2026-09-17, point 3 : "le CV n'est pas
// anonymise, l'application redemande quand meme les coordonnees") :
// detecterCoordonneesSensibles() (plus haut dans ce fichier) est deja
// utilisee pour surligner ce qu'il faudrait masquer avant transmission a
// l'assistant -- reutilisee ICI pour pre-remplir dossier.identite,
// jamais une 2e logique de reperage. Seuls telephone et e-mail sont assez
// fiables pour un pre-remplissage sans relecture humaine (le nom n'est
// repere que sous des formes etiquetees "Nom : ...", rarement la facon
// d'ecrire son nom en tete de CV ; l'adresse postale n'est pas detectee du
// tout) -- ces deux champs restent a completer a la main comme avant,
// via le meme encart "Vos coordonnees" (_coLettreBlocCoordonnees()). Sur le
// chemin fichier/photo, ce texte peut deja avoir ete masque dans la fenetre
// de depot elle-meme (voir onDocumentPrepare) : sans effet la ou la
// personne a deja retire ces informations, la detection echoue simplement
// -- comportement attendu, jamais une erreur. N'ecrase jamais une valeur
// deja saisie par la personne (Vos informations, ou un depot precedent).
// TACHE (retour utilisateur 2026-09-17, "il y a l'adresse, il y a le mail,
// autant les mettre directement dans le formulaire") : code postal + ville
// desormais repris aussi (voir regexCodePostalVille, detecterCoordonneesSensibles())
// -- la rue elle-meme (numero + nom de voie) reste hors de portee d'une
// regex fiable, comme le nom/prenom, jamais tentee pour ne pas risquer une
// valeur fausse.
function _coLettreDetecterCoordonneesDepuisCV(texte) {
  if (typeof dossier === 'undefined' || !dossier || !dossier.identite || !texte) { return; }
  if (typeof detecterCoordonneesSensibles !== 'function') { return; }
  var trouves = detecterCoordonneesSensibles(texte);
  if (!dossier.identite.telephone) {
    var tel = trouves.filter(function (t) { return t.icone === '📞'; })[0];
    if (tel) { dossier.identite.telephone = tel.valeur; }
  }
  if (!dossier.identite.email) {
    var mail = trouves.filter(function (t) { return t.icone === '📧'; })[0];
    if (mail) { dossier.identite.email = mail.valeur; }
  }
  if (!dossier.identite.codePostal && !dossier.identite.ville) {
    var cpVille = trouves.filter(function (t) { return t.icone === '📍'; })[0];
    if (cpVille) {
      var m = /^(\d{5})\s+(.+)$/.exec(cpVille.valeur);
      if (m) { dossier.identite.codePostal = m[1]; dossier.identite.ville = m[2]; }
    }
  }
}
function _coLettreBrancherDepot() {
  _coLettreBrancherBandePresentation();

  var btnDeposer = document.getElementById('btnCoLettreDeposerCv');
  if (btnDeposer) {
    btnDeposer.addEventListener('click', function () {
      // TACHE (comportement inchange) : meme mecanisme que l'ancienne
      // ouvrirDepotLettreV1() -- ouvre la fenetre de depot existante
      // (lecture de fichier/photo, techniquement impossible autrement
      // qu'une fenetre), une seule fois, refermee des le document pret.
      // Seule la DESTINATION change : une vraie page, pas une 2e fenetre.
      ouvrirAssistantDepotCV('pret', {
        onDocumentPrepare: function (documentPrepare) {
          if (!documentPrepare) { return; }
          _coLettreDocument = documentPrepare;
          // La modale a deja fait son ecran de verification / masquage
          // (texte) ou de masquage sur l'image : ce CV est deja relu.
          _coLettreCvRelu = true;
          if (documentPrepare.type === 'texte') { _coLettreDetecterCoordonneesDepuisCV(documentPrepare.valeur); }
          // TACHE (retour utilisateur 2026-09-17, bug reel confirme :
          // "apres l'import du CV, l'appli va direct sur la page Assistant,
          // sans respecter le parcours du module") : sautait tout droit sur
          // 'choix-assistant', contrairement au chemin "coller le texte"
          // (voir plus bas, _coLettreRendreDepot() apres validation) qui
          // reste sur la page pour laisser remplir le bloc 3 "L'entreprise
          // et le poste". Reste desormais sur la page "Preparer" dans les
          // deux cas -- seul le bouton "Choisir mon assistant" (deja cable
          // plus bas) fait passer a l'ecran suivant.
          _coLettreRendreDepot();
        },
        onRetourEtape1: function () { _coLettreRendreDepot(); }
      });
    });
  }

  var btnColler = document.getElementById('btnCoLettreCollerCv');
  var zoneColler = document.getElementById('coLettreCollerZone');
  var champColler = document.getElementById('coLettreCollerTexte');
  var btnCollerValider = document.getElementById('btnCoLettreCollerValider');
  if (btnColler && zoneColler) {
    btnColler.addEventListener('click', function () { zoneColler.hidden = !zoneColler.hidden; if (!zoneColler.hidden && champColler) { champColler.focus(); } });
  }
  if (champColler && btnCollerValider) {
    champColler.addEventListener('input', function () {
      btnCollerValider.textContent = champColler.value.trim() ? 'Enregistrer ce texte' : 'Annuler';
    });
    btnCollerValider.addEventListener('click', function () {
      var t = champColler.value.trim();
      if (!t) { zoneColler.hidden = true; return; }
      _coLettreDocument = { type: 'texte', valeur: t };
      // Texte colle = BRUT. On reste sur la page "Preparer" : le bloc 2
      // "Relire, verifier, masquer" s'ouvre, le CTA reste bloque tant que
      // bilanDemanderRelectureCv n'a pas ete faite.
      _coLettreCvRelu = false;
      // Detection AVANT tout masquage (voir le commentaire de la fonction) :
      // le texte brut colle est le seul moment ou telephone/e-mail sont
      // encore surs d'etre presents tels quels.
      _coLettreDetecterCoordonneesDepuisCV(t);
      _coLettreRendreDepot();
    });
  }

  var btnChanger = document.getElementById('btnCoLettreChangerCv');
  if (btnChanger) {
    btnChanger.addEventListener('click', function () { _coLettreDocument = null; _coLettreCvRelu = false; _coLettreRendreDepot(); });
  }

  // ----- Bloc 2 : Relire, verifier, corriger, masquer (brique partagee
  // bilanDemanderRelectureCv, meme que _prepLE). Ne concerne que le CV
  // colle en texte : le chemin fichier/image a deja ete masque par la
  // modale (_coLettreCvRelu = true). -----
  var btnRelecture = document.getElementById('btnCoLettreRelecture');
  if (btnRelecture && typeof bilanDemanderRelectureCv === 'function') {
    btnRelecture.addEventListener('click', function () {
      if (!_coLettreDocument || _coLettreDocument.type !== 'texte') { return; }
      bilanDemanderRelectureCv(_coLettreDocument.valeur, undefined, _coLettreCvRelu).then(function (res) {
        _coLettreDocument.valeur = res.contenuValide;
        _coLettreCvRelu = true;
        _coLettreRendreDepot();
      }).catch(function (erreur) {
        if (erreur && erreur.code === 'RelectureAnnulee') { return; }
        if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_relecture_erreur', { code: erreur && erreur.code }); }
      });
    });
  }

  // ----- Bloc 3 : Votre candidature (briques partagees de "Votre objectif") -----
  var blocCible = document.getElementById('coLettreBlocCible');
  if (blocCible && typeof activerChampsStandardises === 'function') { activerChampsStandardises(blocCible); }

  document.querySelectorAll('#coLettreBlocCible [data-action="objectif"]').forEach(function (el) {
    el.addEventListener('click', function () {
      definirObjectifCandidature(this.dataset.value);
      _coLettreRendreDepot();
    });
  });
  // TACHE (retour utilisateur 2026-09-17, point 2) : contenuModeRecherche()/
  // contenuCandidature() + leurs cablages (wireModeRecherche/wireObjectifDetails)
  // sont les MEMES fonctions que "Votre objectif" (pageObjectif(), js/app.js) --
  // rien recopie, seul le rerender change (_coLettreRendreDepot au lieu de
  // pageObjectif). wireEvidenceMetierCible() n'a d'effet que si l'element
  // #banniereMetierCibleZone-related qu'elle cible est present -- inoffensif ici.
  if (dossier.objectif) {
    if (['stage', 'alternance', 'pmsmp'].indexOf(dossier.objectif) !== -1) {
      if (typeof wireObjectifDetails === 'function') { wireObjectifDetails(_coLettreRendreDepot); }
    } else if (typeof wireModeRecherche === 'function') {
      wireModeRecherche(_coLettreRendreDepot);
      if (typeof wireEvidenceMetierCible === 'function') { wireEvidenceMetierCible(); }
    }
  }

  // ----- Bloc 4 : Adaptation au metier (contenuRectangleStyleCV(), meme
  // composant que "Creer un nouveau CV"/"Vos documents") -----
  document.querySelectorAll('#coLettreBlocAdaptation [data-style-cv-champ]').forEach(function (el) {
    el.addEventListener('click', function () {
      var champ = this.getAttribute('data-style-cv-champ');
      var valeur = this.getAttribute('data-style-cv-valeur');
      var prefs = dossier.preferencesIAParType.lettre;
      prefs[champ] = (prefs[champ] === valeur) ? null : valeur;
      _coLettreRendreDepot();
    });
  });
  document.querySelectorAll('#coLettreBlocAdaptation [data-situation-actuelle]').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = this.getAttribute('data-situation-actuelle');
      dossier.situationActuelle = (dossier.situationActuelle === v) ? null : v;
      _coLettreRendreDepot();
    });
  });

  var btnSuite = document.getElementById('btnCoLettreVersAssistant');
  if (btnSuite) {
    btnSuite.addEventListener('click', function () {
      if (btnSuite.disabled || !_coLettreDocument) { return; }
      // Garde-fou confidentialite : jamais vers l'assistant sans relecture
      // (un CV colle en texte non relu partirait brut a l'ecran 4).
      var estImageSuite = _coLettreDocument.type === 'image';
      if (!estImageSuite && !_coLettreCvRelu) { return; }
      _coLettreEcran = 'choix-assistant';
      naviguerVers('co-lettre');
    });
  }
}

// TACHE (refonte "Mes documents", Phase 1, 2026-09-01, plan
// docs/PLAN_REFONTE_MES_DOCUMENTS_2026-09-01.md) : carte "Preparer ma lettre
// et mon entretien" (ex "J'ai deja un CV", mode dossier.modeCreation = 'pret').
// Route unique 'preparer-lettre-entretien', 2 ecrans (drapeau _prepLEEcran) :
//   'intro' -> _prepLERendreIntro() : page de presentation (patron partage,
//              bloc 1.1).
//   'depot' -> _prepLERendreDepot() : page "Preparer" DEPLIANTE (bloc 1.2)
//              qui remplace les 4 sous-ecrans de la modale ouvrirAssistantDepotCV.
//              La modale n'est PAS modifiee : gardee en repli photo/scan.
// TACHE (refonte "Mes documents", Phase 1 & 2) : etat PARTAGE par les deux
// parcours "depose un CV existant" -- 'pret' (Preparer ma lettre et mon
// entretien) et 'maj' (Mettre a jour mon CV). Meme page "Preparer"
// depliante, meme etat, meme code : seuls le contenu de l'intro, les
// libelles de la barre d'etapes et la destination du CTA changent selon
// _prepLEMode.
var _prepLEEcran = 'intro';
var _prepLEEtat = null;
var _prepLEDetour = false; // "Revoir la presentation" en detour depuis la depliante
var _prepLEMode = 'pret';  // 'pret' | 'maj' | 'reformuler'

// Barres d'etapes des deux parcours (vocabulaire commun). Source unique,
// utilisees par l'intro (en sourdine) ET par afficherProgression (js/app.js)
// sur les ecrans de travail.
var PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Réponse', icone: '&#128229;' },
  { label: 'Vos informations', icone: '&#128203;' },
  { label: 'Vos documents', icone: '&#128196;' }
];
var MAJ_CV_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Réponse', icone: '&#128229;' },
  { label: 'Corriger mon CV', icone: '&#9999;&#65039;' },
  { label: 'Vos documents', icone: '&#128196;' }
];
// TACHE (chantier « Reformuler et presenter mon CV », etape 1) : barre du
// 4e parcours. Vocabulaire commun (Preparer / Assistant / Reponse), puis
// « Verifier » (choix entre les 2 versions) et « Mise en forme » (sorties).
// Une icone par etape, comme les autres barres.
var REFORMULER_CV_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Réponse', icone: '&#128229;' },
  { label: 'Vérifier', icone: '&#128269;' },
  { label: 'Mise en forme', icone: '&#128196;' }
];
// Index de la barre pour chaque ecran de travail (pret / maj). Preparer(0) /
// Assistant(1) / Reponse(2) se font avant d'atterrir sur ces pages ->
// objectif / projet / revelation = phase 3 (Mon projet / Corriger mon CV),
// resultats = 4.
function _prepLENavIndex(activeId) {
  if (activeId === 'resultats') { return 4; }
  return 3;
}

// TACHE (refonte "Mes documents", Phase 3a puis 3b, 2026-09-02) : barre
// d'etapes du parcours "Creer un nouveau CV" (mode 'nouveau'). 6 reperes.
// Phase 3b faite : les 4 anciens ecrans Experience/Actions/Environnement/
// Attentes sont fusionnes dans la page unique 'votre-parcours'.
// TACHE (retour Denis 2026-09-19) : "Votre parcours" et "Vos informations"
// intervertis -- decision Denis, retour terrain : la 1re question de
// "Votre parcours" ("repensez a vos experiences passees") n'avait aucun
// sens tant que la personne n'avait encore rien saisi de concret. Elle
// saisit desormais ses experiences/formations d'abord ("Vos informations"),
// PUIS "Votre parcours" (avec quoi/comment elle a travaille) s'appuie sur
// ce qu'elle vient de se remettre en tete. Voir _creerCvRouteParIndex,
// pageObjectif()/pageProjet()/pageVotreParcours() (js/app.js) pour la
// navigation correspondante -- change UNIQUEMENT pour 'nouveau' : les
// autres parcours (maj/pret/reformuler) n'ont jamais eu d'etape "Votre
// parcours", rien a inverser chez eux (verifie, aucune route n'y menait).
var CREER_CV_NAV_ETAPES = [
  { label: 'Votre objectif', icone: '&#127919;' },
  { label: 'Vos informations', icone: '&#128203;' },
  { label: 'Votre parcours', icone: '&#129517;' },
  { label: 'Votre profil', icone: '&#128269;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'Vos documents', icone: '&#128196;' }
];
function _creerCvNavIndex(activeId) {
  switch (activeId) {
    case 'objectif': return 0;
    case 'projet': return 1;
    case 'votre-parcours': return 2;
    case 'revelation': return 3;
    // TACHE (refonte parcours guide, etape 5, sous-etape 5.1) : "Assistant"
    // devient une vraie page (route 'assistant', pageAssistant()) pour le
    // parcours 'nouveau'. Le jalon d'index 4 mene desormais quelque part.
    case 'assistant': return 4;
    case 'resultats': return 5;
    default: return 0;
  }
}
// Inverse de _creerCvNavIndex ci-dessus (index -> route). Source unique
// partagee entre la barre d'etapes cliquable (afficherProgression() dans
// app.js, qui remplace l'index 5 par un traitement special avant d'appeler
// cette fonction -- "Vos documents" doit y restaurer le bon document
// d'origine, voir _assistantRetourDocPrecedent()) et "Continuer" sur
// l'ecran d'intro (pageCreerCv() plus bas -- retour utilisateur
// 2026-09-15, "je dois reprendre a la page la plus avancee, pas toujours
// a la 1ere", puis "une session importee doit pouvoir reprendre jusque
// sur Vos documents") : ce 2e appelant, lui, utilise l'index 5 tel quel
// -- tant que le CV n'est pas termine (seul cas ou ce bouton existe),
// dossier.dernierDocumentPrepare vaut forcement encore 'cv' (lettre/
// entretien restent verrouilles jusqu'a cvTermine/lettreTerminee), donc
// aucune ambiguite sur le document a rouvrir.
function _creerCvRouteParIndex(i) {
  switch (i) {
    case 0: return 'objectif';
    case 1: return 'projet';
    case 2: return 'votre-parcours';
    case 3: return 'revelation';
    case 4: return 'assistant';
    case 5: return 'resultats';
    default: return null;
  }
}
// Route de l'ecran d'intro du parcours en cours.
function _prepLERouteActuelle() {
  if (_prepLEMode === 'maj') { return 'mettre-a-jour-cv'; }
  if (_prepLEMode === 'reformuler') { return 'reformuler-cv'; }
  return 'preparer-lettre-entretien';
}

// Ramene a l'ecran d'intro (bouton "Retour" de la barre du bas de la
// depliante). Global : reference en chaine dans onclickPrecedent.
function _prepLERetourIntro() {
  _prepLEEcran = 'intro';
  _prepLEDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers(_prepLERouteActuelle()); }
}

// Bloc 1.4 : ouvrir l'intro EN DETOUR depuis la page depliante -- ou, avec
// une routeRetour (chaine), depuis un ecran de travail PARTAGE du pipeline
// (projet / revelation / resultats). Dans ce dernier cas, "Revenir au
// module" ramene sur CET ecran, pas sur la depliante.
var _prepLEDetourRetourRoute = null;
function _prepLEVoirPresentation(routeRetour) {
  _prepLEDetourRetourRoute = (typeof routeRetour === 'string') ? routeRetour : null;
  _prepLEDetour = true;
  if (typeof naviguerVers === 'function') { naviguerVers(_prepLERouteActuelle()); }
}
// Bloc 1.4 : revenir a la page depliante depuis l'intro en detour -- ou a
// l'ecran de travail memorise (_prepLEDetourRetourRoute).
function _prepLERevenirModule() {
  _prepLEDetour = false;
  if (_prepLEDetourRetourRoute) {
    var r = _prepLEDetourRetourRoute;
    _prepLEDetourRetourRoute = null;
    if (typeof naviguerVers === 'function') { naviguerVers(r); }
    return;
  }
  _prepLEEcran = 'depot';
  if (typeof naviguerVers === 'function') { naviguerVers(_prepLERouteActuelle()); }
}

// Polissage pret/maj (Denis 2026-09-04) : bande "Revoir la presentation" sur
// les ecrans de travail PARTAGES (projet / revelation / resultats), comme
// le Bilan l'a sur tous les siens. Rendue seulement en mode pret / maj ;
// rien pour 'nouveau' (son propre bouton vit sur sa page d'intro 'creer-cv')
// ni les autres contextes. Bouton en chaine onclick (meme patron que les
// pastilles de la barre d'etapes), aucun cablage a ajouter.
function _prepLEBandeRevoirSurEcran(routeEcran) {
  if (typeof dossier === 'undefined' || !dossier ||
      (dossier.modeCreation !== 'pret' && dossier.modeCreation !== 'maj')) { return ''; }
  if (typeof htmlBandeRepriseModule !== 'function') { return ''; }
  var logo = (dossier.modeCreation === 'maj') ? 'bi-pencil-square' : 'bi-file-earmark-check';
  var bouton = '<div><button type="button" class="btn-revoir-module" ' +
    'onclick="_prepLEVoirPresentation(\'' + routeEcran + '\'); return false;">' +
    '<i class="bi ' + logo + '"></i> Revoir la présentation</button></div>' +
    (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue()
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '');
  return htmlBandeRepriseModule(bouton, '');
}

// TACHE (retour utilisateur 2026-09-16) : dispatcher etendu aux ecrans
// 'echange'/'valider' (choix assistant + collage + validation, desormais
// EN PAGE, voir _prepLERendreEchange()/_prepLERendreValider() plus bas)
// -- meme structure de garde-fous que pageReformulerCv() (sans CV relu ou
// sans import en attente, on retombe sur l'ecran precedent plutot que sur
// une page cassee, ex. rechargement ou navigation directe).
function pagePreparerLettreEntretien() {
  _prepLEMode = 'pret';
  if (_prepLEDetour) { _prepLERendreIntro(); return; }
  if (_prepLEEcran === 'depot') { _prepLERendreDepot(); return; }
  var cvEnMemoirePrepLE = !!(_prepLEEtat && _prepLEEtat.cvTexte && _prepLEEtat.relectureFaite);
  if (_prepLEEcran === 'echange' && cvEnMemoirePrepLE) { _prepLERendreEchange(); return; }
  if (_prepLEEcran === 'echange') { _prepLEEcran = 'depot'; return pagePreparerLettreEntretien(); }
  _prepLERendreIntro();
}

function pageMettreAJourCv() {
  _prepLEMode = 'maj';
  if (_prepLEDetour) { _majCvRendreIntro(); return; }
  if (_prepLEEcran === 'depot') { _prepLERendreDepot(); return; }
  var cvEnMemoireMaj = !!(_prepLEEtat && _prepLEEtat.cvTexte && _prepLEEtat.relectureFaite);
  if (_prepLEEcran === 'echange' && cvEnMemoireMaj) { _prepLERendreEchange(); return; }
  if (_prepLEEcran === 'echange') { _prepLEEcran = 'depot'; return pageMettreAJourCv(); }
  _majCvRendreIntro();
}

// TACHE (retour utilisateur 2026-09-16) : extrait de l'ancien clic direct
// de btnPrepLERecommencer -- meme reinitialisation, desormais derriere une
// confirmation (voir _prepLERendreIntro juste en dessous, meme patron que
// _reformulerCvRecommencer()).
function _prepLERecommencer() {
  _prepLEEtat = null;
  _prepLEEcran = 'depot';
  naviguerVers('preparer-lettre-entretien');
}
function _prepLERendreIntro() {
  // Bloc 1.4 : reprise / synthese.
  var travailEnCours = !!(_prepLEEtat && _prepLEEtat.cvTexte);
  // TACHE (retour utilisateur 2026-09-16, bug reel confirme : "Voir mon CV
  // m'amene direct sur Vos documents, je n'ai meme pas fait le 1er passage
  // IA") : cvDisponible() (js/app.js) vaut vrai des que dossier.cvAnalyse
  // est vrai -- un champ que 'pret' n'ecrit JAMAIS lui-meme (seul
  // _reformulerCvVersModele() l'ecrit), et qui ne survit pas non plus a un
  // simple rechargement de page via _prepLEMode (jamais persiste, retombe
  // sur 'pret' par defaut). Un dossier ayant teste 'reformuler' (ou charge
  // via la disquette) avant 'pret', dans la MEME session ou apres un
  // rechargement, faisait donc croire a tort que CE CV 'pret' etait deja
  // entierement pret. dossier.objectif (persistant, choisi sur "Votre
  // objectif" -- jamais atteignable sans avoir termine la structuration)
  // est un signal fiable et propre a 'pret', qui survit un rechargement.
  var cvPret = !!(typeof dossier !== 'undefined' && dossier.modeCreation === 'pret' && dossier.objectif);
  var syntheseHTML = '';
  var actionsSynthese = [];
  // TACHE (retour utilisateur 2026-09-16, "je ne comprends pas la logique de
  // Voir mon CV" -- bug reel confirme) : une fois le CV structure (cvPret),
  // le vrai document en cours n'est plus forcement le CV -- une carte bloc 3
  // ("Pourquoi etes-vous ici ?") est TOUJOURS choisie avant d'atteindre cet
  // etat (dossier.pretChoixPremier, seul chemin vers 'echange'), donc
  // docActifActuel() (js/app.js, dossier.dernierDocumentPrepare ou repli
  // 'lettre' pour 'pret') designe deja le bon document. La regle demandee :
  // document ACTUELLEMENT actif FINI (dossier.documentsEnregistres, deja
  // enregistre/telecharge) => "Voir [le document]", nomme correctement et
  // menant directement dessus. Document actif PAS fini => Continuer/
  // Recommencer (jamais "Voir mon CV" force, qui ecrasait le document en
  // cours au profit du CV et perdait la place de la personne).
  if (!_prepLEDetour && cvPret) {
    var docActifPret = dossier.dernierDocumentPrepare || 'lettre';
    var docPretTermine = !!(dossier.documentsEnregistres && dossier.documentsEnregistres[docActifPret]);
    var libelleDocPret = docActifPret === 'entretien' ? 'préparation d’entretien' : (docActifPret === 'lettre' ? 'lettre de motivation' : 'CV');
    if (docPretTermine) {
      syntheseHTML = _introBlocSynthese(
        '&#128196; Votre ' + libelleDocPret + ' est ' + (docActifPret === 'cv' ? 'prêt' : 'prête') + '.',
        [],
        '<button type="button" id="btnPrepLEVoirDoc" class="btn btn-outline-primary" style="border-radius:12px;">Voir ' +
        (docActifPret === 'cv' ? 'mon' : 'ma') + ' ' + libelleDocPret + '</button>'
      );
      actionsSynthese.push({ id: 'btnPrepLEVoirDoc', action: function () { naviguerVers('resultats'); } });
    } else {
      syntheseHTML = _introBlocReprise(
        (docActifPret === 'entretien' ? 'Vous avez commencé votre préparation d’entretien.' : 'Vous avez commencé à préparer votre ' + libelleDocPret + '.'),
        'btnPrepLEReprendreDoc', 'btnPrepLERecommencerDoc', 'Continuer');
      actionsSynthese.push({ id: 'btnPrepLEReprendreDoc', action: function () { naviguerVers('resultats'); } });
      actionsSynthese.push({
        id: 'btnPrepLERecommencerDoc',
        action: function () {
          if (typeof confirmerAction !== 'function') { _prepLERecommencer(); return; }
          confirmerAction(
            'Recommencer cette préparation depuis le début ?',
            'Vous allez repartir d’une page blanche pour ce parcours. Ce que vous avez déjà saisi sera perdu.',
            'Recommencer', 'btn-danger', _prepLERecommencer
          );
        }
      });
    }
  } else if (!_prepLEDetour && travailEnCours) {
    // TACHE (retour utilisateur 2026-09-16, "fait pareil ici" -- meme
    // correctif que _reformulerCvRendreIntro(), deja valide) : "Continuer"
    // ramenait TOUJOURS au depot, meme une fois la structuration terminee
    // et la personne deja avancee sur "Mon projet" ; "Recommencer" effacait
    // sans jamais demander confirmation. pretDejaStructure reprend le meme
    // signal que reformulerDejaStructure (dossier.modeCreation bascule sur
    // 'pret' par structurerTexteExistant()/onTerminer UNIQUEMENT une fois
    // la structuration terminee, voir plus haut dans ce fichier).
    var pretDejaStructure = !!(dossier.modeCreation === 'pret' && _prepLEMode === 'pret');
    syntheseHTML = _introBlocReprise(
      'Vous avez commencé à préparer votre lettre et votre entretien.',
      'btnPrepLEReprendre', 'btnPrepLERecommencer', 'Continuer');
    actionsSynthese.push({
      id: 'btnPrepLEReprendre',
      action: function () {
        // TACHE (retour utilisateur 2026-09-16, "je retourne sur la page la
        // plus avancee... si j'etais au bout je me retrouve au bout") :
        // _prepLEEcran (persistant pour la session, jamais remis a zero par
        // un aller-retour par l'accueil) retient deja precisement ou la
        // personne s'est arretee ('depot'/'echange'/'valider') -- ne JAMAIS
        // l'ecraser ici, laisser pagePreparerLettreEntretien() (son propre
        // dispatcher, garde-fous inclus) le resoudre lui-meme. Seul le cas
        // "deja structure" (au-dela meme de ces 3 ecrans) a besoin d'une
        // redirection explicite. TACHE (retour utilisateur 2026-09-16,
        // suite -- capture d'ecran montrant un atterrissage sur "Votre
        // objectif" alors que la personne etait deja sur "Vos documents") :
        // 'objectif' n'est que la PREMIERE etape apres la structuration --
        // CORRECTIF (2026-09-16, meme jour) : la 1ere version utilisait par
        // erreur dossier.decouverteTerminee (drapeau d'un module totalement
        // different, "Decouverte de competences") comme signal de progres
        // ici -- toujours faux en pratique, ce qui renvoyait TOUJOURS vers
        // 'objectif'. dossier.objectif (deja utilise pour cvPret plus haut)
        // est le seul signal correct : ce bloc n'est de toute facon atteint
        // que quand cvPret est faux, donc dossier.objectif n'est pas encore
        // pose -- ecrit ainsi (plutot qu'en dur) pour rester correct si cette
        // condition change un jour.
        if (pretDejaStructure) { naviguerVers(dossier.objectif ? 'resultats' : 'objectif'); return; }
        if (_prepLEEcran !== 'depot' && _prepLEEcran !== 'echange') { _prepLEEcran = 'depot'; }
        naviguerVers('preparer-lettre-entretien');
      }
    });
    actionsSynthese.push({
      id: 'btnPrepLERecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { _prepLERecommencer(); return; }
        confirmerAction(
          'Recommencer cette préparation depuis le début ?',
          'Vous allez repartir d’une page blanche pour ce parcours. Ce que vous avez déjà saisi sera perdu.',
          'Recommencer', 'btn-danger', _prepLERecommencer
        );
      }
    });
  }
  var config = {
    carteRetour: 'mesdocuments',
    detour: _prepLEDetour,
    detourLogo: 'bi-file-earmark-check',
    detourBoutonId: 'btnPrepLERevenirModuleHaut',
    detourCtaId: 'btnPrepLERevenirModuleBas',
    onRevenir: _prepLERevenirModule,
    onRevenirExpr: '_prepLERevenirModule()',
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    ctaMasque: (!_prepLEDetour && (travailEnCours || cvPret)),
    titre: '<i class="bi bi-file-earmark-check"></i> Préparer ma lettre et mon entretien',
    sousTitre: 'Vous avez déjà un CV complet. On le reprend tel quel, sans rien vous faire ressaisir, pour préparer votre lettre de motivation puis votre entretien.',
    // Barre reprise de la constante partagee (plus de copie a la main).
    etapes: PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES,
    ctaId: 'btnPrepLettreEntretienCommencer',
    ctaLabel: 'Déposer mon CV &#8594;',
    onCta: function () {
      dossier.decouverteTerminee = false;
      _prepLEEcran = 'depot';
      naviguerVers('preparer-lettre-entretien');
    },
    blocsHTML:
      _introBlocAccroche('<strong>Rien n’est jamais envoyé sans votre accord.</strong> Vous verrez chaque étape avant qu’elle se produise, et vous pourrez tout modifier.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-2">À partir de votre CV existant, l’application prépare votre <strong>lettre de motivation</strong>, puis votre <strong>préparation d’entretien</strong>. Votre CV n’est pas modifié : il sert de base.</p>' +
        _introBlocEncart('&#9993;&#65039;', 'C’est le chemin <strong>rapide</strong> : l’application part du contenu de votre CV, déjà prêt, et va à l’essentiel. Vous n’avez rien à réécrire.')) +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous déposez votre CV (fichier ou copier-coller) puis vous relisez, corrigez si besoin, et masquez ce que vous ne voulez pas transmettre.</li>' +
        '<li>Vous indiquez pourquoi vous faites ce CV, et si vous le savez, l’entreprise et l’offre visées.</li>' +
        '<li>Un assistant en ligne lit votre CV et en ressort les informations : expériences, compétences, formations.</li>' +
        '<li>Vous vérifiez ce qui a été compris, vous corrigez si besoin.</li>' +
        '<li>Vous choisissez ce que vous préparez : la lettre, puis l’entretien.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce parcours ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne réécrit pas votre CV et ne change pas sa mise en page.</li>' +
        '<li>Il ne porte pas de regard critique sur votre CV.</li>' +
        '<li>Il ne crée pas de CV à partir de rien.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Produire une lettre de motivation adaptée à l’offre visée.</li>' +
        '<li>Vous entraîner aux questions d’un entretien d’embauche.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">À tout moment, vous pouvez mettre de côté une réflexion utile sur votre parcours (un doute, une idée, une chose à en dire) dans Mes Repères, pour vous ou votre conseiller.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Vous restez sur une seule page pour tout préparer. Une fois prêt, vous copiez un texte, vous le collez chez un assistant en ligne (dans un nouvel onglet), puis vous revenez coller sa réponse ici. La barre en haut vous permet de revenir à une étape déjà faite quand vous voulez.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('preparer_lettre_entretien_intro_affichee'); }
}

// TACHE (retour utilisateur 2026-09-16) : extrait de l'ancien clic direct
// de btnMajCvRecommencer -- meme reinitialisation, desormais derriere une
// confirmation (voir _majCvRendreIntro juste en dessous, meme patron que
// _reformulerCvRecommencer()/_prepLERecommencer()).
function _majCvRecommencer() {
  _prepLEEtat = null;
  _prepLEEcran = 'depot';
  naviguerVers('mettre-a-jour-cv');
}
// TACHE (refonte "Mes documents", Phase 2, 2026-09-02) : page d'introduction
// routee de la carte "Mettre a jour mon CV" (mode dossier.modeCreation = 'maj').
// Route 'mettre-a-jour-cv'. Reutilise la MEME page "Preparer" depliante que
// 'pret' (_prepLERendreDepot / htmlPreparerLettreEntretienDepliante) -- seuls
// le contenu de cette intro, la barre d'etapes et le CTA changent.
function _majCvRendreIntro() {
  var travailEnCours = !!(_prepLEEtat && _prepLEEtat.cvTexte);
  // TACHE (retour utilisateur 2026-09-16) : meme correctif que cvPret
  // (_prepLERendreIntro() plus haut dans ce fichier) -- dossier.objectif,
  // persistant et propre a un vrai passage par la structuration, remplace
  // cvDisponible()/dossier.cvAnalyse (jamais ecrit par 'maj', fragile a un
  // rechargement ou a un test anterieur de 'reformuler' dans la meme
  // session).
  // BUG CORRIGE (retour Denis 2026-09-19 : "j'etais sur Reformuler, je suis
  // alle sur Mettre a jour mon CV, le bouton Continuer/Recommencer est la
  // alors que je n'ai rien fait dans CE parcours") : 'reformuler' ECRIT
  // reellement dossier.modeCreation = 'maj' (aliasing assume, voir
  // _prepLERendreDepot()) -- un passage par "Reformuler" jusqu'a l'objectif,
  // dans la MEME session, laissait dossier.modeCreation='maj' + dossier.objectif
  // deja poses avant meme d'avoir touche "Mettre a jour". _prepLEMode ne
  // protege PAS ici (pageMettreAJourCv() l'ecrase toujours a 'maj' avant
  // d'appeler cette fonction, meme juste apres bascule depuis 'reformuler') :
  // seul dossier._modeCreationVia (ecrit UNIQUEMENT par _prepLERendreDepot(),
  // reflete le _prepLEMode reel au moment ou modeCreation a ete pose) dit
  // qui a VRAIMENT produit ce dossier.modeCreation='maj'. Meme correctif
  // symetrique applique a cvReformule/reformulerDejaStructure
  // (_reformulerCvRendreIntro(), plus bas dans ce fichier).
  var cvMaj = !!(typeof dossier !== 'undefined' && dossier.modeCreation === 'maj' && dossier.objectif && dossier._modeCreationVia === 'maj');
  var syntheseHTML = '';
  var actionsSynthese = [];
  // TACHE (retour utilisateur 2026-09-16, meme correctif que cvPret ci-dessus
  // dans ce fichier) : "Voir mon CV" ne doit apparaitre que si le CV est
  // reellement fini (enregistre/telecharge, dossier.documentsEnregistres.cv)
  // -- sinon Continuer/Recommencer, jamais un "Voir" qui mene sur un document
  // pas encore termine.
  if (!_prepLEDetour && cvMaj) {
    var cvMajTermine = !!(dossier.documentsEnregistres && dossier.documentsEnregistres.cv);
    if (cvMajTermine) {
      syntheseHTML = _introBlocSynthese(
        '&#9999;&#65039; Votre CV a été récupéré. Vous pouvez maintenant en corriger le contenu.',
        [],
        '<button type="button" id="btnMajCvVoirCv" class="btn btn-outline-primary" style="border-radius:12px;">Voir mon CV</button>'
      );
      actionsSynthese.push({ id: 'btnMajCvVoirCv', action: function () { naviguerVers('resultats'); } });
    } else {
      syntheseHTML = _introBlocReprise(
        'Votre CV a été récupéré. Vous pouvez continuer à le mettre à jour.',
        'btnMajCvVoirCvReprendre', 'btnMajCvVoirCvRecommencer', 'Continuer');
      actionsSynthese.push({ id: 'btnMajCvVoirCvReprendre', action: function () { naviguerVers('resultats'); } });
      actionsSynthese.push({
        id: 'btnMajCvVoirCvRecommencer',
        action: function () {
          if (typeof confirmerAction !== 'function') { _majCvRecommencer(); return; }
          confirmerAction(
            'Recommencer cette mise à jour depuis le début ?',
            'Vous allez repartir d’une page blanche pour ce parcours. Ce que vous avez déjà saisi sera perdu.',
            'Recommencer', 'btn-danger', _majCvRecommencer
          );
        }
      });
    }
  } else if (!_prepLEDetour && travailEnCours) {
    // TACHE (retour utilisateur 2026-09-16, "fait pareil ici" -- meme
    // correctif que _reformulerCvRendreIntro()/_prepLERendreIntro(), deja
    // valides) : "Continuer" ramenait TOUJOURS au depot, meme une fois la
    // structuration terminee et la personne deja avancee sur "Mon projet" ;
    // "Recommencer" effacait sans jamais demander confirmation.
    // majDejaStructure reprend le meme signal que reformulerDejaStructure/
    // pretDejaStructure (dossier.modeCreation bascule sur 'maj' par
    // structurerTexteExistant()/onTerminer UNIQUEMENT une fois la
    // structuration terminee, voir plus haut dans ce fichier).
    // TACHE (retour Denis 2026-09-19) : _prepLEMode remplace par
    // dossier._modeCreationVia -- meme raison que cvMaj plus haut
    // (_prepLEMode toujours 'maj' ici, jamais un signal fiable).
    var majDejaStructure = !!(dossier.modeCreation === 'maj' && dossier._modeCreationVia === 'maj');
    syntheseHTML = _introBlocReprise(
      'Vous avez commencé à mettre à jour votre CV.',
      'btnMajCvReprendre', 'btnMajCvRecommencer', 'Continuer');
    actionsSynthese.push({
      id: 'btnMajCvReprendre',
      action: function () {
        // TACHE (retour utilisateur 2026-09-16) : voir le commentaire
        // equivalent de _prepLERendreIntro() -- meme principe, ne jamais
        // ecraser _prepLEEcran ici, et pousser jusqu'a 'resultats' si la
        // personne est allee plus loin que 'objectif' (voir le
        // commentaire complet pres de pretDejaStructure).
        // CORRECTIF (2026-09-16, meme jour, meme bug que pretDejaStructure
        // ci-dessus dans ce fichier) : dossier.decouverteTerminee est le
        // drapeau d'un module totalement different ("Decouverte de
        // competences") -- toujours faux ici en pratique. dossier.objectif
        // est le seul signal correct (ce bloc n'est atteint que quand cvMaj
        // est faux, donc pas encore pose -- ecrit ainsi pour rester correct
        // si cette condition change un jour).
        if (majDejaStructure) { naviguerVers(dossier.objectif ? 'resultats' : 'objectif'); return; }
        if (_prepLEEcran !== 'depot' && _prepLEEcran !== 'echange') { _prepLEEcran = 'depot'; }
        naviguerVers('mettre-a-jour-cv');
      }
    });
    actionsSynthese.push({
      id: 'btnMajCvRecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { _majCvRecommencer(); return; }
        confirmerAction(
          'Recommencer la mise à jour depuis le début ?',
          'Vous allez repartir d’une page blanche pour ce CV. Ce que vous avez déjà saisi dans ce parcours sera perdu.',
          'Recommencer', 'btn-danger', _majCvRecommencer
        );
      }
    });
  }
  var config = {
    carteRetour: 'mesdocuments',
    detour: _prepLEDetour,
    detourLogo: 'bi-pencil-square',
    detourBoutonId: 'btnMajCvRevenirModuleHaut',
    detourCtaId: 'btnMajCvRevenirModuleBas',
    onRevenir: _prepLERevenirModule,
    onRevenirExpr: '_prepLERevenirModule()',
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    ctaMasque: (!_prepLEDetour && (travailEnCours || cvMaj)),
    titre: '<i class="bi bi-pencil-square"></i> Mettre à jour mon CV',
    sousTitre: 'On repart de votre CV existant. On en récupère les informations, vous les mettez à jour et les complétez, puis vous choisissez la présentation.',
    etapes: MAJ_CV_NAV_ETAPES,
    ctaId: 'btnMajCvCommencer',
    ctaLabel: 'Déposer mon CV &#8594;',
    onCta: function () {
      dossier.decouverteTerminee = false;
      _prepLEEcran = 'depot';
      naviguerVers('mettre-a-jour-cv');
    },
    blocsHTML:
      _introBlocAccroche('<strong>Rien n’est jamais envoyé sans votre accord.</strong> Vous verrez chaque étape avant qu’elle se produise, et vous pourrez tout modifier.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-2">Reprendre un CV existant pour le remettre à jour : ajouter une expérience, corriger une date, retravailler une formulation. La mise en forme, vous la choisissez ensuite.</p>' +
        _introBlocEncart('&#128196;', '<strong>La mise en page de votre CV d’origine n’est pas conservée.</strong> L’application en récupère les <strong>informations</strong>, les met à jour et les complète, puis vous les propose dans l’un de nos modèles (PDF ou Word), que vous choisissez. Si aucun ne vous convient, vous pouvez copier le texte et le mettre en forme sur une autre plateforme. Vous n’êtes jamais bloqué.')) +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous déposez votre CV (fichier, copier-coller, photo ou scan) puis vous relisez, corrigez si besoin, et masquez ce que vous ne voulez pas transmettre.</li>' +
        '<li>Un assistant en ligne en ressort vos informations : expériences, compétences, formations.</li>' +
        '<li>Vous arrivez directement à l’étape de correction du contenu, champ par champ.</li>' +
        '<li>Vous choisissez la mise en forme et vous exportez.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce parcours ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne crée pas de CV à partir de rien : il lui faut un CV de départ.</li>' +
        '<li>Il ne porte pas de regard critique sur votre CV.</li>' +
        '<li>Il ne réécrit pas tout à votre place : vous gardez la main sur chaque correction.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Mettre votre CV à jour en forme : plusieurs modèles, PDF ou Word.</li>' +
        '<li>Préparer votre lettre de motivation.</li>' +
        '<li>Vous entraîner aux questions d’un entretien d’embauche.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">À tout moment, une réflexion utile sur votre parcours peut être mise de côté dans Mes Repères, pour vous ou votre conseiller.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Vous restez sur une seule page pour tout préparer. Une fois prêt, vous copiez un texte, vous le collez chez un assistant en ligne (dans un nouvel onglet), puis vous revenez coller sa réponse ici. La barre en haut vous permet de revenir à une étape déjà faite quand vous voulez.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('mettre_a_jour_cv_intro_affichee'); }
}

// TACHE (chantier « Reformuler et presenter mon CV », 2026-09-07,
// docs/CHANTIER_REFORMULER_ET_PRESENTER_CV.md) : 4e parcours de « Mes
// documents ». Route 'reformuler-cv'. Reutilise la MEME page "Preparer"
// depliante que 'pret'/'maj' (_prepLEMode = 'reformuler') pour le depot ;
// apres "Preparer", parcours PROPRE (jamais structurerTexteExistant),
// SANS AUCUNE fenetre modale (decision Denis 2026-09-07). Peu de pages :
//   'depot'    -> page "Preparer" depliante (CV + relecture + poste vise)
//   'echange'  -> UNE page : choix de l'assistant + collage de la reponse
//   'verifier' -> choix des 2 propositions + verification (etape 5)
function pageReformulerCv() {
  _prepLEMode = 'reformuler';
  if (_prepLEDetour) { _reformulerCvRendreIntro(); return; }
  if (_prepLEEcran === 'depot') { _prepLERendreDepot(); return; }
  // Compat : anciens noms d'ecrans ('assistant' / 'collage') regroupes en
  // une seule page 'echange' (decision Denis 2026-09-07 : regrouper les
  // pages, choix de l'assistant + collage de la reponse sur la meme page).
  if (_prepLEEcran === 'assistant' || _prepLEEcran === 'collage') { _prepLEEcran = 'echange'; }
  // Ecrans post-depot : garde-fou -- sans CV relu en memoire, on retombe
  // sur le depot (ex. rechargement, navigation directe).
  var cvEnMemoire = !!(_prepLEEtat && _prepLEEtat.cvTexte && _prepLEEtat.relectureFaite);
  var reponseEnMemoire = cvEnMemoire && !!(_prepLEEtat.reponseAssistant);
  if (_prepLEEcran === 'echange' && cvEnMemoire) { _reformulerCvRendreEchange(); return; }
  if (_prepLEEcran === 'verifier' && reponseEnMemoire) { _reformulerCvRendreVerifier(); return; }
  if (_prepLEEcran === 'sorties' && reponseEnMemoire) { _reformulerCvRendreSorties(); return; }
  if (_prepLEEcran === 'verifier' || _prepLEEcran === 'sorties') {
    _prepLEEcran = cvEnMemoire ? 'echange' : 'depot';
    return pageReformulerCv();
  }
  if (_prepLEEcran === 'echange') { _prepLEEcran = 'depot'; _prepLERendreDepot(); return; }
  _reformulerCvRendreIntro();
}

function _reformulerCvRetourDepot() {
  _prepLEEcran = 'depot';
  if (typeof naviguerVers === 'function') { naviguerVers('reformuler-cv'); }
}
function _reformulerCvRetourEchange() {
  if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
  _prepLEEcran = 'echange';
  if (typeof naviguerVers === 'function') { naviguerVers('reformuler-cv'); }
}

// Le bloc de contexte ajoute au prompt reformuler-cv.md : poste/domaine
// vise (bloc 3 de "Preparer", NECESSAIRE), offre eventuelle (bloc 4), et
// le texte du CV deja relu/masque (_prepLEEtat.cvTexte).
function _reformulerCvContexteTexte() {
  var rc = (typeof dossier !== 'undefined' && dossier.rechercheCandidature) || {};
  var poste = (rc.reformulerPoste || '').trim();
  var secteur = (rc.reformulerSecteur || '').trim();
  var offre = (rc.lienOffre || '').trim();
  var cvTexte = (_prepLEEtat && _prepLEEtat.cvTexte) || '';
  return 'POSTE OU DOMAINE VISÉ :\n' +
    'Poste : ' + (poste || 'non précisé') + '\n' +
    'Domaine ou secteur : ' + (secteur || 'non précisé') + '\n\n' +
    'OFFRE VISÉE :\n' + (offre || 'Non fournie.') + '\n\n' +
    'CV DE LA PERSONNE :\n' + cvTexte;
}
function _reformulerCvComposerPrompt() {
  if (typeof promptCache === 'function') { return promptCache('reformuler-cv', _reformulerCvContexteTexte()); }
  var base = (typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges['reformuler-cv']) ||
    (typeof promptParDefaut === 'function' ? promptParDefaut('reformuler-cv') : '');
  return base + '\n\n' + _reformulerCvContexteTexte();
}

// ---------- Ecran UNIQUE "Envoyer et recuperer" (choix assistant + collage) ----------
// Decision Denis 2026-09-07 : une seule page, deux blocs deplies, comme la
// page "Preparer". Aucune fenetre modale (pas meme "Avant de continuer vers X",
// que Cohérence / Co-lettre avaient conservee). Bloc B (collage) se debloque
// des qu'un assistant est choisi. Cette fonction se rappelle elle-meme a
// chaque changement d'etat (assistant choisi, phase de transition).
function _reformulerCvRendreEchange() {
  if (typeof _intervalleDecompteIA !== 'undefined') { clearInterval(_intervalleDecompteIA); }
  var assistantChoisi = !!_etatTransitionIA;
  var etapeBarre = assistantChoisi ? 2 : 1;

  // ----- Bloc A : choix de l'assistant -----
  var blocA = assistantChoisi
    ? '<details class="bloc-depli bd-ok" id="reformulerBlocA">' +
      '<summary><span class="preparer-num">1</span><span class="preparer-titre">Votre assistant</span>' +
      '<span class="pilule-etat pe-ok">' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail">Le texte à copier a été préparé pour <strong>' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</strong>.</p>' +
      '<button type="button" id="btnReformulerChangerAssistant" class="btn btn-outline-secondary btn-sm">Choisir un autre assistant</button>' +
      '</div></details>'
    : '<details class="bloc-depli" id="reformulerBlocA" open>' +
      '<summary><span class="preparer-num">1</span><span class="preparer-titre">Choisissez votre assistant</span>' +
      '<span class="pilule-etat pe-attente">À choisir</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="text-muted small mb-3">Cliquez sur un assistant. L’application prépare et copie tout pour vous, puis l’ouvre dans un nouvel onglet.</p>' +
      htmlChoixAssistantBilanCorps({
        idErreur: 'reformulerErreurChoixIA', attrAssistant: 'data-assistant-reformuler',
        etapes: ETAPES_DETAIL_CHOIX_IA,
        texteConfidentialite: 'Votre CV a déjà été relu et masqué au moment du dépôt. Rien d’autre n’est transmis avant que vous choisissiez un assistant.'
      }) +
      '</div></details>';

  // ----- Bloc B : collage de la reponse -----
  var blocB = assistantChoisi
    ? '<details class="bloc-depli" id="reformulerBlocB" open>' +
      '<summary><span class="preparer-num">2</span><span class="preparer-titre">Collez la réponse de l’assistant</span>' +
      '<span class="pilule-etat pe-info">À faire</span></summary>' +
      '<div class="bloc-depli-corps">' +
      htmlBanniereTransitionIA() +
      '<p class="text-muted small">Une fois que l’assistant vous a renvoyé les deux versions de votre CV, ' +
      'copiez <strong>toute sa réponse</strong>, puis revenez ici.</p>' +
      htmlCollageInstantane('ReformulerCv',
        '<div class="d-flex gap-2 mb-2 mt-2">' +
        '<button type="button" id="btnReformulerCvVersVerifier" class="btn btn-primary btn-lg" disabled>&#8594; Continuer</button>' +
        '<button type="button" id="btnEffacerRecollerReformulerCv" class="btn btn-outline-secondary">Effacer et recoller</button>' +
        '</div>') +
      '<div id="messageReformulerCvCollage" class="small mb-2"></div>' +
      '</div></details>'
    : '<details class="bloc-depli" id="reformulerBlocB">' +
      '<summary><span class="preparer-num">2</span><span class="preparer-titre">Collez la réponse de l’assistant</span>' +
      '<span class="pilule-etat pe-attente">Choisissez d’abord un assistant</span></summary>' +
      '<div class="bloc-depli-corps"><p class="preparer-detail">Cette partie se débloque dès que vous avez choisi un assistant ci-dessus.</p></div></details>';

  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
    barreEtapesModule(REFORMULER_CV_NAV_ETAPES, etapeBarre) + _prepLEBandeRevoirSurEcran('reformuler-cv') +
    '<div class="text-center"><h1><i class="bi bi-brush"></i> Reformuler et présenter mon CV</h1>' +
    '<p class="sousTitre">Votre CV part chez l’assistant de votre choix, puis vous revenez coller sa réponse ici. Tout se passe sur cette page.</p></div>' +
    blocA + blocB +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_reformulerCvRetourDepot()' }) + '</div>';
  if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_echange_affiche', { assistantChoisi: assistantChoisi }); }

  // ----- Cablage bloc A -----
  document.querySelectorAll('[data-assistant-reformuler]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantReformuler; })[0];
      if (!assistant) { return; }
      if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_assistant_choisi', { assistant: assistant.id }); }
      // TACHE (retour Denis 2026-09-19, point 1 -- "cette fenetre doit
      // apparaitre partout") : il manquait l'ecran tampon "Avant de
      // continuer vers X" (consignes + Ctrl+V), deja en place ailleurs
      // (Decouverte, Bilan, Un regard sur mon CV) -- ce bloc copiait le
      // prompt directement au clic, sans jamais l'ouvrir. Reutilise
      // ouvrirFenetreAssistantIA() telle quelle (js/app.js) : construction
      // du texte + copie seulement au clic sur "Je comprends, continuer".
      if (typeof ouvrirFenetreAssistantIA !== 'function') { return; }
      ouvrirFenetreAssistantIA({
        nomAssistant: assistant.nom,
        idAssistant: assistant.id,
        urlAssistant: assistant.url,
        construireTexteACopier: function () { return _reformulerCvComposerPrompt(); },
        onApresValidation: function (urlAssistant, nomAssistant) {
          _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
          _reformulerCvRendreEchange();
        }
      });
    });
  });
  var btnChanger = document.getElementById('btnReformulerChangerAssistant');
  if (btnChanger) {
    btnChanger.addEventListener('click', function () {
      if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
      _etatTransitionIA = null;
      _reformulerCvRendreEchange();
    });
  }

  if (!assistantChoisi) { return; }

  // ----- Cablage bloc B : transition + collage -----
  var message = document.getElementById('messageReformulerCvCollage');
  var btnColler = document.getElementById('btnCollerAutoReformulerCv');
  var texteBtnColler = document.getElementById('texteBtnCollerAutoReformulerCv');

  if (_etatTransitionIA && btnColler) {
    if (_etatTransitionIA.phase === 'revenu') {
      btnColler.disabled = false;
      btnColler.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
      btnColler.classList.add('pulse-collage-retour');
      if (texteBtnColler) { texteBtnColler.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
    } else {
      btnColler.disabled = true;
      btnColler.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
      btnColler.classList.add('rond-collage-desactive');
      if (texteBtnColler) { texteBtnColler.textContent = 'Ce bouton s’activera à votre retour.'; }
    }

    var ouvrirAssistantEnAttente = function () {
      if (!document.getElementById('btnCollerAutoReformulerCv')) { clearInterval(_intervalleDecompteIA); return; }
      // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
      // (js/app.js) -- meme correctif, tous les parcours.
      recopierTexteAssistantPuisOuvrir(function () {
        var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
        _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
        if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_popup_bloque'); }
        _reformulerCvRendreEchange();
      });
    };

    if (_etatTransitionIA.phase === 'decompte') {
      var btnMaintenant = document.getElementById('btnContinuerMaintenantIA');
      if (btnMaintenant) { btnMaintenant.addEventListener('click', function () { clearInterval(_intervalleDecompteIA); ouvrirAssistantEnAttente(); }); }
      _intervalleDecompteIA = setInterval(function () {
        _etatTransitionIA.secondesRestantes -= 1;
        var compteur = document.getElementById('compteurDecompteIA');
        if (compteur) { compteur.textContent = _etatTransitionIA.secondesRestantes; }
        if (_etatTransitionIA.secondesRestantes <= 0) { clearInterval(_intervalleDecompteIA); ouvrirAssistantEnAttente(); }
      }, 1000);
    } else if (_etatTransitionIA.phase === 'bloque') {
      var btnBloque = document.getElementById('btnOuvrirBloqueIA');
      if (btnBloque) { btnBloque.addEventListener('click', ouvrirAssistantEnAttente); }
    } else if (_etatTransitionIA.phase === 'ouvert') {
      var btnRetour = document.getElementById('btnJeSuisDeRetourIA');
      if (btnRetour) { btnRetour.addEventListener('click', function () { _etatTransitionIA.phase = 'revenu'; _reformulerCvRendreEchange(); }); }
      var btnRouvrir = document.getElementById('btnRouvrirSiteIA');
      if (btnRouvrir) { btnRouvrir.addEventListener('click', ouvrirAssistantEnAttente); }
    }
  }

  var btnVersVerifier = document.getElementById('btnReformulerCvVersVerifier');
  activerCollageInstantane({
    idZoneAuto: 'zoneCollageAutoReformulerCv', idZoneApercu: 'zoneApercuCollageReformulerCv',
    idTextarea: 'texteCollageReformulerCv', idBoutonColler: 'btnCollerAutoReformulerCv',
    idBoutonCollerManuel: 'btnCollerManuelReformulerCv', idBoutonEffacerRecoller: 'btnEffacerRecollerReformulerCv',
    idBoutonImporter: 'btnReformulerCvVersVerifier',
    onErreur: function (msg) { message.style.color = 'var(--danger)'; message.textContent = '⚠️ ' + msg; },
    onEffacer: function () { message.textContent = ''; if (btnVersVerifier) { btnVersVerifier.disabled = true; } },
    onCollerManuel: function () { message.textContent = ''; },
    onSucces: function (texte, estAjout) {
      _prepLEEtat.reponseAssistant = texte;
      _etatTransitionIA = null;
      if (btnVersVerifier) { btnVersVerifier.disabled = false; }
      message.style.color = 'var(--success-strong)';
      message.textContent = estAjout
        ? '✅ Morceau suivant ajouté à la suite. Copiez le morceau suivant puis recliquez, ou cliquez Continuer si c’était le dernier.'
        : '✅ Réponse importée. Si la réponse fait plusieurs morceaux, copiez le suivant puis cliquez « Coller un morceau supplémentaire ».';
    }
  });

  if (btnVersVerifier) {
    btnVersVerifier.addEventListener('click', function () {
      var t = (document.getElementById('texteCollageReformulerCv') || {}).value || _prepLEEtat.reponseAssistant || '';
      if (!t.trim()) {
        message.style.color = 'var(--danger)';
        message.textContent = '⚠️ Collez d’abord la réponse de l’assistant dans la zone ci-dessus.';
        return;
      }
      _prepLEEtat.reponseAssistant = t;
      _prepLEEcran = 'verifier';
      naviguerVers('reformuler-cv');
    });
  }
}

// ---------- Etape 5 : parsing de la reponse + ecran "Verifier" ----------

// TACHE (retour utilisateur 2026-09-16) : reformuler-cv.md renvoie desormais
// du JSON (comme ats.md/regard-recruteur.md/extraction-cv.md), plus une
// prose avec delimiteurs "=== PROPOSITION n ===" et balises [ORIGINE : ...]/
// [PISTE : ...] a re-analyser par heuristique -- l'assistant range lui-meme
// chaque information dans le bon champ, jamais un parseur maison qui devine.
// Reutilise extraireBlocJSONDepuisTexte() (js/app.js, deja eprouvee : fences
// ```json, guillemets typographiques, virgules superflues), jamais une
// reimplementation (LECONS 13). PARSER TOLERANT : un champ manquant ou du
// mauvais type retombe sur une valeur vide, jamais un throw.
// Renvoie :
//   { pasUnCv: '<phrase>' }                          si pasUnCV: true
//   { propositions: [ {struct, piste}, ... ] }        sinon (0 a 2 entrees)
function _reformulerCvStr(v) { return (typeof v === 'string') ? v.trim() : ''; }
function _reformulerCvArr(v) { return Array.isArray(v) ? v : []; }
// Nettoie une proposition brute (JSON.parse direct de la reponse) en
// structure fiable, chaque champ toujours du bon type -- jamais undefined,
// jamais une exception si l'assistant omet ou deforme un champ.
function _reformulerCvNettoyerStruct(p) {
  p = p || {};
  return {
    titre: _reformulerCvStr(p.titre),
    accroche: _reformulerCvStr(p.accroche),
    accrocheInventee: !!p.accrocheInventee,
    experiences: _reformulerCvArr(p.experiences).map(function (e) {
      e = e || {};
      return {
        poste: _reformulerCvStr(e.poste), entreprise: _reformulerCvStr(e.entreprise),
        dateDebut: _reformulerCvStr(e.dateDebut), dateFin: _reformulerCvStr(e.dateFin),
        missions: _reformulerCvArr(e.missions).map(_reformulerCvStr).filter(Boolean)
      };
    }).filter(function (e) { return e.poste || e.missions.length; }),
    formations: _reformulerCvArr(p.formations).map(function (f) {
      f = f || {};
      return { intitule: _reformulerCvStr(f.intitule), annee: _reformulerCvStr(f.annee) };
    }).filter(function (f) { return f.intitule; }),
    competences: _reformulerCvArr(p.competences).map(function (c) {
      c = c || {};
      return { intitule: _reformulerCvStr(c.intitule), origine: _reformulerCvStr(c.origine) };
    }).filter(function (c) { return c.intitule; }),
    langues: _reformulerCvArr(p.langues).map(function (l) {
      l = l || {};
      return { langue: _reformulerCvStr(l.langue), niveau: _reformulerCvStr(l.niveau) };
    }).filter(function (l) { return l.langue; }),
    loisirs: _reformulerCvArr(p.loisirs).map(_reformulerCvStr).filter(Boolean),
    certifications: _reformulerCvArr(p.certifications).map(_reformulerCvStr).filter(Boolean),
    logiciels: _reformulerCvArr(p.logiciels).map(_reformulerCvStr).filter(Boolean),
    informationsComplementaires: _reformulerCvArr(p.informationsComplementaires).map(_reformulerCvStr).filter(Boolean)
  };
}
// TACHE (retour utilisateur 2026-09-16, "il faut imperativement que cette
// information [le permis] soit captee" + identite acceptee si la personne
// choisit de la transmettre) : identite/permis sont des informations de LA
// PERSONNE, pas d'une proposition de reformulation -- un seul jeu au niveau
// racine de la reponse (jamais duplique par proposition). Meme forme que
// SPECIFICATION_IMPORT (js/app.js, categories 'identite'/'permis') pour
// rejoindre exactement les memes champs de dossier.identite/dossier.permis
// que le parcours "Mettre a jour mon CV" -- une seule source de verite pour
// ces 2 structures dans toute l'application.
function _reformulerCvNettoyerIdentite(id) {
  id = id || {};
  return {
    civilite: _reformulerCvStr(id.civilite), nom: _reformulerCvStr(id.nom), prenom: _reformulerCvStr(id.prenom),
    telephone: _reformulerCvStr(id.telephone), email: _reformulerCvStr(id.email), adresse: _reformulerCvStr(id.adresse),
    codePostal: _reformulerCvStr(id.codePostal), ville: _reformulerCvStr(id.ville)
  };
}
function _reformulerCvNettoyerPermis(p) {
  p = p || {};
  return {
    possede: (p.possede === true || p.possede === false) ? p.possede : null,
    categories: _reformulerCvArr(p.categories).map(_reformulerCvStr).filter(Boolean),
    vehicule: (p.vehicule === true || p.vehicule === false) ? p.vehicule : null
  };
}
// deps.extraireJSON : (texte) -> objet|null. Meme patron que parserResultatAts()
// (modules/ats/resultatParser.js) : par defaut extraireBlocJSONDepuisTexte()
// (global navigateur) ; en Node, l'appelant l'injecte (cette fonction ne
// depend jamais du DOM elle-meme, seul extraireBlocJSONDepuisTexte le fait
// via echapperAttribut ailleurs dans js/app.js -- jamais charge en Node).
function _reformulerCvParserReponse(brut, deps) {
  deps = deps || {};
  var extraireJSON = deps.extraireJSON || (typeof extraireBlocJSONDepuisTexte === 'function' ? extraireBlocJSONDepuisTexte : null);
  var donnees = null;
  if (extraireJSON) { try { donnees = extraireJSON(brut); } catch (e) { donnees = null; } }
  if (!donnees || typeof donnees !== 'object' || Array.isArray(donnees)) {
    return { pasUnCv: 'La réponse reçue ne contient pas de résultat exploitable.' };
  }
  if (donnees.pasUnCV) {
    return { pasUnCv: _reformulerCvStr(donnees.message) || 'Le texte reçu ne ressemble pas à un CV.' };
  }
  var propositions = _reformulerCvArr(donnees.propositions).slice(0, 2).map(function (p) {
    return { struct: _reformulerCvNettoyerStruct(p), piste: _reformulerCvStr(p && p.piste) };
  });
  return {
    propositions: propositions,
    identite: _reformulerCvNettoyerIdentite(donnees.identite),
    permis: _reformulerCvNettoyerPermis(donnees.permis)
  };
}

// Rend une proposition (struct nettoyee ci-dessus) en HTML : chaque rubrique
// deja identifiee par l'assistant (jamais devinee par une heuristique sur le
// texte) -> <h3> + <ul>. "origine"/"accrocheInventee" -> annotation grise
// visible, meme rendu que les anciennes balises [ORIGINE : ...].
function _reformulerCvRenduCorpsProposition(struct) {
  struct = struct || {};
  var html = '';
  if (struct.titre) { html += '<p class="reformuler-titre-cv"><strong>' + echapperAttribut(struct.titre) + '</strong></p>'; }
  if (struct.accroche) {
    html += '<h3 class="reformuler-rubrique">Profil</h3><p class="reformuler-ligne">' + echapperAttribut(struct.accroche) +
      (struct.accrocheInventee ? ' <span class="reformuler-origine">(accroche proposée à partir de votre CV, à vérifier)</span>' : '') + '</p>';
  }
  if (struct.experiences.length) {
    html += '<h3 class="reformuler-rubrique">Expériences professionnelles</h3>';
    struct.experiences.forEach(function (e) {
      var entete = [e.poste, e.entreprise].filter(Boolean).join(' - ');
      var dates = [e.dateDebut, e.dateFin || 'aujourd’hui'].filter(Boolean).join(' - ');
      if (entete || dates) {
        html += '<p class="reformuler-ligne"><strong>' + echapperAttribut(entete) + '</strong>' +
          (dates ? ' <span class="reformuler-origine">(' + echapperAttribut(dates) + ')</span>' : '') + '</p>';
      }
      if (e.missions.length) { html += '<ul class="reformuler-liste">' + e.missions.map(function (m) { return '<li>' + echapperAttribut(m) + '</li>'; }).join('') + '</ul>'; }
    });
  }
  if (struct.formations.length) {
    html += '<h3 class="reformuler-rubrique">Formation</h3><ul class="reformuler-liste">' +
      struct.formations.map(function (f) { return '<li>' + echapperAttribut([f.intitule, f.annee].filter(Boolean).join(' - ')) + '</li>'; }).join('') + '</ul>';
  }
  if (struct.competences.length) {
    html += '<h3 class="reformuler-rubrique">Compétences</h3><ul class="reformuler-liste">' +
      struct.competences.map(function (c) {
        return '<li>' + echapperAttribut(c.intitule) + (c.origine ? ' <span class="reformuler-origine">(d’origine : ' + echapperAttribut(c.origine) + ')</span>' : '') + '</li>';
      }).join('') + '</ul>';
  }
  if (struct.langues.length) {
    html += '<h3 class="reformuler-rubrique">Langues</h3><ul class="reformuler-liste">' +
      struct.langues.map(function (l) { return '<li>' + echapperAttribut([l.langue, l.niveau].filter(Boolean).join(' - ')) + '</li>'; }).join('') + '</ul>';
  }
  if (struct.certifications.length) {
    html += '<h3 class="reformuler-rubrique">Certifications</h3><ul class="reformuler-liste">' +
      struct.certifications.map(function (c) { return '<li>' + echapperAttribut(c) + '</li>'; }).join('') + '</ul>';
  }
  if (struct.logiciels.length) {
    html += '<h3 class="reformuler-rubrique">Logiciels et outils</h3><ul class="reformuler-liste">' +
      struct.logiciels.map(function (l) { return '<li>' + echapperAttribut(l) + '</li>'; }).join('') + '</ul>';
  }
  if (struct.loisirs.length) {
    html += '<h3 class="reformuler-rubrique">Centres d’intérêt</h3><ul class="reformuler-liste">' +
      struct.loisirs.map(function (l) { return '<li>' + echapperAttribut(l) + '</li>'; }).join('') + '</ul>';
  }
  if (struct.informationsComplementaires.length) {
    html += '<h3 class="reformuler-rubrique">Informations complémentaires</h3><ul class="reformuler-liste">' +
      struct.informationsComplementaires.map(function (i) { return '<li>' + echapperAttribut(i) + '</li>'; }).join('') + '</ul>';
  }
  return html;
}

// "Ce qui a change", calcule directement depuis la structure (plus besoin de
// re-analyser du texte pour compter les rubriques/[ORIGINE : ...]).
function _reformulerCvResumeChangements(struct) {
  struct = struct || {};
  var nbOrigine = (struct.competences || []).filter(function (c) { return c.origine; }).length;
  var lignes = [];
  if (nbOrigine) { lignes.push(nbOrigine + ' intitulé(s) de compétence rapproché(s) du vocabulaire du poste (l’intitulé d’origine reste affiché entre parenthèses).'); }
  lignes.push('Formulations retravaillées : verbes d’action, phrases plus courtes.');
  lignes.push('Le fond n’a pas changé : mêmes expériences, mêmes dates, mêmes diplômes.');
  return lignes;
}

// Texte final "propre" d'une proposition, pour "Récupérer le texte de mon
// CV" et la zone d'edition libre de l'etape 5b -- serialise la structure en
// texte lisible (rubriques en majuscules, puces "-"). Sens UNIQUE
// (structure -> texte, jamais reanalyse ensuite) : contrairement a l'ancien
// format prose, ce texte n'a plus besoin d'etre reinterprete, la structure
// fiable existe deja a cote (voir _reformulerCvVersModele()).
function _reformulerCvTexteFinalProposition(struct) {
  struct = struct || {};
  // TACHE : defensif meme si l'appelant reel passe toujours un struct deja
  // nettoye par _reformulerCvNettoyerStruct() (chaque champ liste garanti
  // present) -- _reformulerCvArr() retombe sur [] pour tout champ absent ou
  // mal type, jamais une exception.
  var experiences = _reformulerCvArr(struct.experiences);
  var formations = _reformulerCvArr(struct.formations);
  var competences = _reformulerCvArr(struct.competences);
  var langues = _reformulerCvArr(struct.langues);
  var certifications = _reformulerCvArr(struct.certifications);
  var logiciels = _reformulerCvArr(struct.logiciels);
  var loisirs = _reformulerCvArr(struct.loisirs);
  var informationsComplementaires = _reformulerCvArr(struct.informationsComplementaires);
  var lignes = [];
  if (struct.titre) { lignes.push(struct.titre); lignes.push(''); }
  if (struct.accroche) { lignes.push('PROFIL'); lignes.push(struct.accroche); lignes.push(''); }
  if (experiences.length) {
    lignes.push('EXPÉRIENCES PROFESSIONNELLES');
    experiences.forEach(function (e) {
      e = e || {};
      var entete = [e.poste, e.entreprise].filter(Boolean).join(' - ');
      var dates = [e.dateDebut, e.dateFin || 'Aujourd’hui'].filter(Boolean).join(' - ');
      if (entete || dates) { lignes.push(entete + (dates ? ' (' + dates + ')' : '')); }
      _reformulerCvArr(e.missions).forEach(function (m) { lignes.push('- ' + m); });
      lignes.push('');
    });
  }
  if (formations.length) {
    lignes.push('FORMATION');
    formations.forEach(function (f) { f = f || {}; lignes.push([f.intitule, f.annee].filter(Boolean).join(' - ')); });
    lignes.push('');
  }
  if (competences.length) {
    lignes.push('COMPÉTENCES');
    competences.forEach(function (c) { lignes.push('- ' + (c && c.intitule)); });
    lignes.push('');
  }
  if (langues.length) {
    lignes.push('LANGUES');
    langues.forEach(function (l) { l = l || {}; lignes.push([l.langue, l.niveau].filter(Boolean).join(' - ')); });
    lignes.push('');
  }
  if (certifications.length) {
    lignes.push('CERTIFICATIONS');
    certifications.forEach(function (c) { lignes.push('- ' + c); });
    lignes.push('');
  }
  if (logiciels.length) {
    lignes.push('LOGICIELS ET OUTILS');
    logiciels.forEach(function (l) { lignes.push('- ' + l); });
    lignes.push('');
  }
  if (loisirs.length) {
    lignes.push('CENTRES D’INTÉRÊT');
    loisirs.forEach(function (l) { lignes.push('- ' + l); });
    lignes.push('');
  }
  if (informationsComplementaires.length) {
    lignes.push('INFORMATIONS COMPLÉMENTAIRES');
    informationsComplementaires.forEach(function (i) { lignes.push('- ' + i); });
    lignes.push('');
  }
  return lignes.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------- Ecran "Verifier" (5a choix des 2 versions, 5b verification) ----------
function _reformulerCvRendreVerifier() {
  var brut = (_prepLEEtat && _prepLEEtat.reponseAssistant) || '';
  var parse = _reformulerCvParserReponse(brut);

  // Cas "ce n'est pas un CV" : message clair, aucun CV fabrique.
  if (parse.pasUnCv) {
    app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
      barreEtapesModule(REFORMULER_CV_NAV_ETAPES, 3) +
      '<div class="text-center"><h1><i class="bi bi-brush"></i> Vérifier votre CV reformulé</h1></div>' +
      '<div class="reformuler-encart reformuler-encart-alerte">' +
      '<strong>L’assistant n’a pas reconnu un CV.</strong> Ce qu’il a lu ressemble plutôt à : ' +
      echapperAttribut(parse.pasUnCv) + '.<br>' +
      // TACHE (retour utilisateur 2026-09-16, verifie en direct sur ChatGPT :
      // le MEME texte, redemande a l'identique, a fonctionne au 2e essai) :
      // ce refus est souvent un incident isole de l'assistant sur un texte
      // long, pas un vrai probleme du CV ou de la copie -- le premier
      // reflexe est donc de redemander, avant de faire douter la personne
      // de son propre CV.
      '<strong>Le plus simple : redemandez à l’assistant</strong> (une nouvelle conversation, en recollant le même texte) - ce genre de réponse est souvent un incident isolé, qui ne se reproduit pas au 2ᵉ essai.<br>' +
      'Si ça persiste, revenez à l’étape précédente et vérifiez que vous avez bien collé ' +
      'la réponse complète de l’assistant, ou recommencez en déposant votre CV.' +
      '</div>' +
      '<div class="text-center"><button type="button" id="btnReformulerRetourEchange" class="btn btn-primary">&#8592; Revenir à l’étape précédente</button></div>' +
      '</div>' +
      '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_reformulerCvRetourEchange()' }) + '</div>';
    var bp = document.getElementById('btnReformulerRetourEchange');
    if (bp) { bp.addEventListener('click', _reformulerCvRetourEchange); }
    if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_verifier_pas_un_cv'); }
    return;
  }

  var props = parse.propositions || [];
  var choix = (_prepLEEtat && typeof _prepLEEtat.propositionChoisie === 'number') ? _prepLEEtat.propositionChoisie : null;
  if (choix !== null && !props[choix]) { choix = null; }

  // ----- 5a : choix entre les deux versions -----
  if (choix === null) {
    var cartes = props.map(function (p, i) {
      var renduHtml = _reformulerCvRenduCorpsProposition(p.struct);
      var titreCarte = (i === 0) ? 'La plus proche de votre CV' : 'Notre version recommandée';
      return '<div class="reformuler-carte-choix">' +
        '<h3>' + (i === 0 ? '&#128204; ' : '&#11088; ') + titreCarte + '</h3>' +
        (p.piste ? '<p class="reformuler-piste">' + echapperAttribut(p.piste) + '</p>' : '') +
        '<div class="reformuler-apercu" id="reformulerApercu' + i + '">' + renduHtml + '</div>' +
        '<div class="text-center mt-2">' +
        '<button type="button" class="btn btn-outline-secondary btn-sm" data-reformuler-deplier="' + i + '">&#9660; Déplier pour tout lire</button> ' +
        '<button type="button" class="btn btn-primary" data-reformuler-choisir="' + i + '">Choisir celle-ci &#8594;</button>' +
        '</div></div>';
    }).join('');

    var alerteIncomplet = (props.length < 2)
      ? '<div class="reformuler-encart reformuler-encart-alerte">Une seule version a été trouvée dans la réponse. ' +
        'Si l’assistant en a renvoyé deux, revenez à l’étape précédente et recollez toute sa réponse.</div>'
      : '';

    app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
      barreEtapesModule(REFORMULER_CV_NAV_ETAPES, 3) + _prepLEBandeRevoirSurEcran('reformuler-cv') +
      '<div class="text-center"><h1><i class="bi bi-brush"></i> Choisissez une version</h1>' +
      '<p class="sousTitre">Le fond est le même dans les deux : mêmes expériences, mêmes dates, mêmes diplômes. ' +
      'Seules la formulation et la mise en ordre changent.</p></div>' +
      alerteIncomplet +
      '<div class="text-center mb-3"><button type="button" id="btnReformulerVoirOriginal" class="btn btn-outline-secondary btn-sm">&#128196; Voir mon CV d’origine</button></div>' +
      '<div id="reformulerZoneOriginal" hidden class="reformuler-encart"><strong>Votre CV d’origine :</strong>' +
      '<pre class="reformuler-original">' + echapperAttribut((_prepLEEtat && _prepLEEtat.cvTexte) || '') + '</pre></div>' +
      '<div class="reformuler-cartes-choix">' + cartes + '</div>' +
      '</div>' +
      '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_reformulerCvRetourEchange()' }) + '</div>';

    var btnOrig = document.getElementById('btnReformulerVoirOriginal');
    if (btnOrig) {
      btnOrig.addEventListener('click', function () {
        var z = document.getElementById('reformulerZoneOriginal');
        if (z) { z.hidden = !z.hidden; }
      });
    }
    document.querySelectorAll('[data-reformuler-deplier]').forEach(function (b) {
      b.addEventListener('click', function () {
        var ap = document.getElementById('reformulerApercu' + b.dataset.reformulerDeplier);
        if (ap) { ap.classList.toggle('reformuler-apercu-ouvert'); b.textContent = ap.classList.contains('reformuler-apercu-ouvert') ? '▲ Réduire' : '▼ Déplier pour tout lire'; }
      });
    });
    document.querySelectorAll('[data-reformuler-choisir]').forEach(function (b) {
      b.addEventListener('click', function () { _reformulerCvChoisirProposition(parseInt(b.dataset.reformulerChoisir, 10)); });
    });
    if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_verifier_choix_affiche', { nbPropositions: props.length }); }
    return;
  }

  // ----- 5b : verification de la version retenue -----
  var propChoisie = props[choix];
  var rendu5bHtml = _reformulerCvRenduCorpsProposition(propChoisie.struct);
  var resume = _reformulerCvResumeChangements(propChoisie.struct);
  var texteFinalCourant = function () {
    return (_prepLEEtat.texteFinalEdite != null)
      ? _prepLEEtat.texteFinalEdite
      : _reformulerCvTexteFinalProposition(propChoisie.struct);
  };

  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
    barreEtapesModule(REFORMULER_CV_NAV_ETAPES, 3) + _prepLEBandeRevoirSurEcran('reformuler-cv') +
    '<div class="text-center"><h1><i class="bi bi-brush"></i> Vérifiez votre CV reformulé</h1>' +
    '<p class="sousTitre">Vous avez choisi « ' + (choix === 0 ? 'la plus proche de votre CV' : 'notre version recommandée') + ' ». ' +
    'Le fond n’a pas changé. Vous pouvez tout modifier ici.</p></div>' +
    '<div class="reformuler-encart reformuler-encart-resume"><strong>Ce qui a changé</strong><ul>' +
    resume.map(function (l) { return '<li>' + echapperAttribut(l) + '</li>'; }).join('') + '</ul></div>' +
    '<div class="text-center mb-2">' +
    '<button type="button" id="btnReformulerRevoirChoix" class="btn btn-outline-secondary btn-sm">&#8592; Revenir au choix des deux versions</button> ' +
    '<button type="button" id="btnReformulerModifierTexte" class="btn btn-outline-secondary btn-sm">&#9998; Modifier le texte</button>' +
    '</div>' +
    '<div id="reformulerZoneRendu" class="reformuler-cv-rendu">' + rendu5bHtml + '</div>' +
    '<div id="reformulerZoneEdition" hidden><textarea id="reformulerTexteEdition" class="form-control reformuler-textarea" rows="18">' +
    echapperAttribut(texteFinalCourant()) +
    '</textarea><p class="preparer-detail">Vous modifiez librement. En repassant à l’affichage normal, votre texte est conservé tel quel.</p></div>' +
    '<div class="text-center mt-3">' +
    '<button type="button" id="btnReformulerVersSorties" class="btn btn-primary btn-lg">C’est bon, passer à la mise en forme &#8594;</button>' +
    '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_reformulerCvRevenirAuChoix()' }) + '</div>';

  var btnRevoir = document.getElementById('btnReformulerRevoirChoix');
  if (btnRevoir) { btnRevoir.addEventListener('click', _reformulerCvRevenirAuChoix); }

  var btnModifier = document.getElementById('btnReformulerModifierTexte');
  var zoneRendu = document.getElementById('reformulerZoneRendu');
  var zoneEdition = document.getElementById('reformulerZoneEdition');
  var champEdition = document.getElementById('reformulerTexteEdition');
  if (btnModifier && zoneRendu && zoneEdition && champEdition) {
    btnModifier.addEventListener('click', function () {
      var versEdition = zoneEdition.hidden;
      if (versEdition) {
        // On part du texte final courant (balises deja retirees).
        champEdition.value = texteFinalCourant();
      } else {
        _prepLEEtat.texteFinalEdite = champEdition.value;
      }
      zoneEdition.hidden = !versEdition;
      zoneRendu.hidden = versEdition;
      btnModifier.innerHTML = versEdition ? '&#8592; Revenir à l’affichage normal' : '&#9998; Modifier le texte';
    });
  }
  var btnSorties = document.getElementById('btnReformulerVersSorties');
  if (btnSorties) {
    btnSorties.addEventListener('click', function () {
      if (zoneEdition && !zoneEdition.hidden && champEdition) { _prepLEEtat.texteFinalEdite = champEdition.value; }
      _prepLEEtat.cvReformuleFinal = texteFinalCourant();
      // TACHE (retour utilisateur 2026-09-16) : garde la structure fiable a
      // cote du texte -- "Remplir un de nos modeles" (etape 6,
      // _reformulerCvVersModele()) s'appuie dessus, jamais sur le texte
      // (potentiellement modifie librement juste au-dessus, "Modifier le
      // texte" ne sert que pour "Recuperer le texte de mon CV").
      _prepLEEtat.propositionChoisieStruct = propChoisie.struct;
      // TACHE (retour utilisateur 2026-09-16) : identite/permis vivent au
      // niveau racine de `parse` (pas par proposition, voir
      // _reformulerCvParserReponse plus haut) -- capturés ici au meme moment
      // que la structure choisie, pour que _reformulerCvVersModele() les
      // ecrive dans dossier.identite/dossier.permis quel que soit le chemin
      // (Continuer vers un modele OU Recuperer le texte, les deux y passent).
      _prepLEEtat.propositionChoisieIdentite = parse.identite;
      _prepLEEtat.propositionChoisiePermis = parse.permis;
      _prepLEEcran = 'sorties';
      naviguerVers('reformuler-cv');
    });
  }
  if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_verifier_5b_affiche', { proposition: choix }); }
}

function _reformulerCvChoisirProposition(i) {
  if (!_prepLEEtat) { return; }
  _prepLEEtat.propositionChoisie = i;
  // texteFinalEdite (edition libre) est propre a une proposition : remis a
  // zero a chaque (re)choix.
  _prepLEEtat.texteFinalEdite = null;
  if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_proposition_choisie', { proposition: i }); }
  naviguerVers('reformuler-cv');
}
function _reformulerCvRevenirAuChoix() {
  if (!_prepLEEtat) { return; }
  _prepLEEtat.propositionChoisie = null;
  _prepLEEtat.texteFinalEdite = null;
  naviguerVers('reformuler-cv');
}

// ---------- Etape 6, sortie "modele" ----------
// TACHE (retour utilisateur 2026-09-16, bug reel confirme : "CV tronque,
// massacre" -- identite rangee dans les formations, aucune experience
// captee) : cette fonction structurait elle-meme le CV reformule, par un
// parseur deterministe maison sur le TEXTE de la reponse (heuristiques sur
// les majuscules/mots-cles). Fragile en pratique, 2 bugs confirmes en
// testant : "INFORMATIONS PERSONNELLES"/"INFORMATIONS COMPLEMENTAIRES"
// reconnues comme "FORMATIONS" (simple sous-chaine : "formation" est
// litteralement contenu dans "inFORMATIONs") ; un intitule de poste ecrit en
// majuscules a l'interieur d'une experience interprete a tort comme un
// nouveau titre de rubrique, ce qui coupe le bloc EXPERIENCES et perd tout
// son contenu.
//
// reformuler-cv.md renvoie desormais du JSON (voir _reformulerCvParserReponse
// plus haut) : la structure fiable existe deja, plus besoin de la redeviner
// depuis du texte. Prend directement la structure de la proposition choisie
// (propositionChoisieStruct, posee par _reformulerCvRendreVerifier() au
// clic sur "C'est bon, passer a la mise en forme") -- jamais le texte, qui
// peut avoir ete librement modifie par la personne juste avant (voir
// "Modifier le texte", reserve a "Recuperer le texte de mon CV").
//
// TACHE (retour utilisateur 2026-09-16, refuse explicitement) : PAS de
// fenetre modale ici (structurerTexteExistant()/ouvrirAssistantDepotCV()
// envisage un temps, puis explicitement refuse par Denis -- ce module
// n'a droit a aucune fenetre, decision 2026-09-07 deja actee, coherence
// avec le reste de l'appli qui n'utilise plus que des pages). Le "2e passage
// IA" que Denis demande est celui qui existe deja plus loin dans le
// parcours normal "Mettre a jour mon CV" (panneau "Adaptation au metier" +
// sa propre interaction avec l'assistant, deja sur la page, jamais une
// fenetre) -- cette fonction se contente de ne pas le court-circuiter, en
// alimentant dossier.experiences/formations/... correctement des le depart.
function _reformulerCvVersModele(struct) {
  if (typeof dossier === 'undefined' || !dossier) { return; }
  struct = struct || {};
  if (struct.titre) { dossier.titreCV = struct.titre; }
  if (struct.accroche) {
    if (!dossier.ia) { dossier.ia = (typeof creerDossierIAVide === 'function') ? creerDossierIAVide() : {}; }
    if (!dossier.ia.cv) { dossier.ia.cv = {}; }
    dossier.ia.cv.profil = struct.accroche;
  }
  if (struct.experiences.length) {
    dossier.experiences = struct.experiences.map(function (e) {
      return { poste: e.poste, entreprise: e.entreprise, lieu: '',
        dateDebut: e.dateDebut, dateFin: e.dateFin, missions: e.missions.join('\n') };
    });
  }
  if (struct.formations.length) {
    dossier.formations = struct.formations.map(function (f) { return { niveau: '', intitule: f.intitule, annee: f.annee }; });
  }
  if (struct.competences.length) { dossier.competencesCV = struct.competences.map(function (c) { return c.intitule; }); }
  if (struct.langues.length) { dossier.langues = struct.langues.slice(); dossier.languesFrancaisUniquement = false; }
  if (struct.loisirs.length) { dossier.loisirs = struct.loisirs.slice(); }
  if (struct.certifications.length) { dossier.certifications = struct.certifications.slice(); }
  if (struct.logiciels.length) { dossier.logiciels = struct.logiciels.slice(); }
  // TACHE (retour utilisateur 2026-09-16) : permis, vehicule, disponibilite,
  // mobilite... rangees par le prompt (point 2 de reformuler-cv.md) dans
  // informationsComplementaires, jamais dans experiences/formations. Meme
  // champ que celui deja rempli par l'import de CV (extraction-cv.md,
  // CONFIG_CHAMPS_IMPORT, cle "informationsNonClassees") -- reutilise ici,
  // rien invente. Concatene (ne remplace pas) au cas ou le dossier en
  // contenait deja avant ce passage.
  if (struct.informationsComplementaires.length) {
    dossier.informationsNonClassees = (dossier.informationsNonClassees || []).concat(struct.informationsComplementaires.slice());
  }
  // TACHE (retour utilisateur 2026-09-16, "il faut imperativement que cette
  // information [le permis] soit captee" -- vraie plus-value en zone rurale
  // -- et "l'identite aussi, si la personne choisit de la transmettre, on
  // doit etre capable de la capter") : identite/permis, poses au niveau
  // racine de la reponse (voir _reformulerCvParserReponse et leur capture
  // dans _prepLEEtat au choix de la proposition, plus haut). Ecrits dans
  // dossier.identite/dossier.permis, les MEMES champs structures que le
  // parcours "Mettre a jour mon CV" (extraction-cv.md) -- plus jamais
  // perdus dans un champ texte libre. Champ par champ (jamais tout
  // l'objet d'un coup) pour ne pas ecraser une valeur deja saisie a la
  // main par une valeur vide si l'assistant n'a rien trouve pour CE champ
  // precis.
  var identiteReformulee = (_prepLEEtat && _prepLEEtat.propositionChoisieIdentite) || {};
  if (identiteReformulee.civilite || identiteReformulee.nom || identiteReformulee.prenom ||
    identiteReformulee.telephone || identiteReformulee.email || identiteReformulee.adresse ||
    identiteReformulee.codePostal || identiteReformulee.ville) {
    dossier.identite = dossier.identite || {};
    ['civilite', 'nom', 'prenom', 'telephone', 'email', 'adresse', 'codePostal', 'ville'].forEach(function (champ) {
      if (identiteReformulee[champ]) { dossier.identite[champ] = identiteReformulee[champ]; }
    });
  }
  var permisReformule = (_prepLEEtat && _prepLEEtat.propositionChoisiePermis) || {};
  if (permisReformule.possede !== null || permisReformule.vehicule !== null || permisReformule.categories.length) {
    dossier.permis = dossier.permis || {};
    if (permisReformule.possede !== null) { dossier.permis.possede = permisReformule.possede; }
    if (permisReformule.vehicule !== null) { dossier.permis.vehicule = permisReformule.vehicule; }
    if (permisReformule.categories.length) { dossier.permis.categories = permisReformule.categories.slice(); }
  }
  dossier.modeCreation = 'maj';
  dossier.cvAnalyse = true;
  dossier.cvTexte = _reformulerCvTexteFinalProposition(struct);
  dossier.decouverteTerminee = false;
  // TACHE (retour utilisateur 2026-09-16) : signale que ce CV vient de
  // "Reformuler et presenter mon CV" -- lu par pageResultats()/
  // terminerParcours() (js/app.js) pour ne plus jamais proposer la lettre
  // de motivation sur ce parcours.
  dossier._origineReformuler = true;
  dossier.dernierDocumentPrepare = 'cv';
  // TACHE (retour utilisateur 2026-09-16, option 1 validee) : "Votre
  // objectif" (etape suivante, pageObjectif()) redemandait le metier/domaine
  // deja donne au bloc 3 de "Preparer" -- rechercheCandidature.reformulerPoste/
  // .reformulerSecteur sont des champs propres a CE module, jamais lus par
  // "Votre objectif" (qui utilise dossier.modeRecherche + metierCible/
  // metiersCandidats/metiersHorsRepertoire ou secteurCible, un mecanisme plus
  // riche -- fiches metier, puces -- partage avec le Bilan). Pre-remplit ICI
  // le VRAI mecanisme (ajouterMetierHorsRepertoire()/secteurCible, jamais une
  // simple copie de chaine) pour que cet ecran arrive deja repondu sur cette
  // partie. Poste vise -> traite en "metier hors repertoire" (saisie libre,
  // jamais recherchee dans notre repertoire ici -- pas d'ambiguite a lever).
  // Seule reste a trancher la categorie de candidature (emploi/stage/
  // reconversion...) : question neuve, jamais posee avant ce point.
  var rcReformuler = dossier.rechercheCandidature || {};
  var reformulerAUneOffre = !!(rcReformuler.lienOffre && rcReformuler.lienOffre.trim());
  if (rcReformuler.reformulerPoste && rcReformuler.reformulerPoste.trim()) {
    dossier.modeRecherche = 'metier';
    dossier.typeRecherche = reformulerAUneOffre ? 'offre' : 'simple';
    if (typeof ajouterMetierHorsRepertoire === 'function') { ajouterMetierHorsRepertoire(rcReformuler.reformulerPoste.trim()); }
  } else if (rcReformuler.reformulerSecteur && rcReformuler.reformulerSecteur.trim()) {
    dossier.modeRecherche = 'domaine';
    dossier.typeRecherche = reformulerAUneOffre ? 'offre' : 'simple';
    dossier.secteurCible = rcReformuler.reformulerSecteur.trim();
  }
  _prepLEEcran = 'intro';
  if (typeof trackEvenement === 'function') {
    trackEvenement('reformuler_cv_sortie_modele_structure', {
      nbExp: struct.experiences.length, nbForm: struct.formations.length, nbComp: struct.competences.length
    });
  }
  naviguerVers('objectif');
}

// ---------- Etape 6 : l'ecran des deux sorties ----------
function _reformulerCvRendreSorties() {
  var texte = (_prepLEEtat && _prepLEEtat.cvReformuleFinal) || '';
  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
    barreEtapesModule(REFORMULER_CV_NAV_ETAPES, 4) + _prepLEBandeRevoirSurEcran('reformuler-cv') +
    '<div class="text-center"><h1><i class="bi bi-brush"></i> Récupérer votre CV</h1>' +
    '<p class="sousTitre">Votre CV reformulé est prêt.</p></div>' +
    '<div class="reformuler-cartes-choix">' +
    // ----- Sortie A : le texte -----
    '<div class="reformuler-carte-choix">' +
    '<h3>&#128203; Récupérer le texte de mon CV</h3>' +
    '<p class="preparer-detail">Le texte reformulé, rangé par rubrique, prêt à coller sur Canva, un traitement de ' +
    'texte, ou une autre plateforme de CV. La mise en forme, vous la faites là-bas.</p>' +
    '<textarea id="reformulerTexteACopier" class="form-control reformuler-textarea" rows="12" readonly>' + echapperAttribut(texte) + '</textarea>' +
    '<div class="text-center mt-2"><button type="button" id="btnReformulerCopierTexte" class="btn btn-primary">&#128203; Copier le texte</button></div>' +
    '</div>' +
    // ----- Sortie B : un de nos modeles -----
    '<div class="reformuler-carte-choix">' +
    '<h3>&#128196; Remplir un de nos modèles</h3>' +
    '<p class="preparer-detail">Votre CV reformulé est rangé dans nos rubriques (expériences, formations, ' +
    'compétences...). Vous vérifiez et complétez à l’écran suivant, notamment vos coordonnées, puis vous ' +
    'choisissez un modèle (PDF ou Word).</p>' +
    '<div class="text-center"><button type="button" id="btnReformulerVersModele" class="btn btn-primary">Continuer vers un modèle &#8594;</button></div>' +
    '</div>' +
    '</div>' +
    '<div class="text-center mt-3"><button type="button" id="btnReformulerRetourVerif" class="btn btn-outline-secondary btn-sm">&#8592; Revenir à la vérification</button></div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_reformulerCvRevenirVerifierDepuisSorties()' }) + '</div>';

  var btnCopier = document.getElementById('btnReformulerCopierTexte');
  if (btnCopier) {
    btnCopier.addEventListener('click', function () {
      if (typeof copierTexteVersPressePapier === 'function') { copierTexteVersPressePapier(texte, btnCopier); }
      else if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(texte); }
      if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_sortie_texte_copie'); }
    });
  }
  var btnModele = document.getElementById('btnReformulerVersModele');
  if (btnModele) {
    btnModele.addEventListener('click', function () {
      if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_sortie_modele'); }
      // TACHE (retour utilisateur 2026-09-16) : la structure fiable
      // (propositionChoisieStruct, posee par _reformulerCvRendreVerifier()),
      // jamais le texte -- voir le commentaire de _reformulerCvVersModele().
      _reformulerCvVersModele(_prepLEEtat && _prepLEEtat.propositionChoisieStruct);
    });
  }
  var btnRetour = document.getElementById('btnReformulerRetourVerif');
  if (btnRetour) { btnRetour.addEventListener('click', _reformulerCvRevenirVerifierDepuisSorties); }
  if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_sorties_affiche'); }
}

function _reformulerCvRevenirVerifierDepuisSorties() {
  _prepLEEcran = 'verifier';
  if (typeof naviguerVers === 'function') { naviguerVers('reformuler-cv'); }
}

// TACHE (retour utilisateur 2026-09-16) : extrait de l'ancien clic direct
// de btnReformulerCvRecommencer -- meme reinitialisation, desormais derriere
// une confirmation (voir _reformulerCvRendreIntro juste en dessous).
function _reformulerCvRecommencer() {
  _prepLEEtat = null;
  _prepLEEcran = 'depot';
  naviguerVers('reformuler-cv');
}
function _reformulerCvRendreIntro() {
  var travailEnCours = !!(_prepLEEtat && _prepLEEtat.cvTexte);
  // TACHE (retour utilisateur 2026-09-16) : une fois une version choisie et
  // "Continuer vers un modele" clique, _reformulerCvVersModele() (plus haut
  // dans ce fichier) bascule dossier.modeCreation sur 'maj' et envoie la
  // personne dans l'assistant "Mettre a jour mon CV" (objectif/projet/...)
  // -- le CV reformule existe deja, _prepLEEtat.cvTexte (le depot D'ORIGINE,
  // jamais mis a jour par cette bascule) serait alors trompeur ici (il
  // ramenerait sur l'ancien depot, pas sur le CV reformule reellement en
  // cours). Meme detection que cvMaj dans _majCvRendreIntro() -- ce module
  // est celui qui a produit ce CV tant que _prepLEMode n'a pas change
  // (seul un nouveau clic sur une AUTRE tuile CV le changerait, voir
  // ouvrirCarteAccueil()).
  // TACHE (retour Denis 2026-09-19) : _prepLEMode remplace par
  // dossier._modeCreationVia -- pageReformulerCv() ecrase _prepLEMode a
  // 'reformuler' de facon inconditionnelle a CHAQUE rendu (meme juste apres
  // bascule depuis 'maj'/'pret'), donc jamais un signal fiable ici. Voir
  // le commentaire de cvMaj dans _majCvRendreIntro() (meme bug, meme fix).
  var cvReformule = !!(typeof cvDisponible === 'function' && cvDisponible() &&
    typeof dossier !== 'undefined' && dossier.modeCreation === 'maj' && dossier._modeCreationVia === 'reformuler');
  var syntheseHTML = '';
  var actionsSynthese = [];
  if (!_prepLEDetour && cvReformule) {
    syntheseHTML = _introBlocSynthese(
      '&#9999;&#65039; Votre CV reformulé est prêt.',
      [],
      '<button type="button" id="btnReformulerCvVoirCv" class="btn btn-outline-primary" style="border-radius:12px;">Voir mon CV</button>'
    );
    actionsSynthese.push({ id: 'btnReformulerCvVoirCv', action: function () { dossier.dernierDocumentPrepare = 'cv'; naviguerVers('resultats'); } });
  } else if (!_prepLEDetour && travailEnCours) {
    // TACHE (retour utilisateur 2026-09-16, "coherent avec l'ensemble des
    // modules -- Creer un nouveau CV a deja cette fonction, corrigee et
    // validee, inspire-toi-en") : memes 2 defauts que _creerCvRendreIntro()
    // avant sa correction -- "Continuer" ramenait TOUJOURS au depot, meme
    // une fois la structuration terminee et la personne deja avancee sur
    // "Mon projet" ; "Recommencer" effacait sans jamais demander confirmation.
    // reformulerDejaStructure reprend le meme signal que cvReformule
    // juste au-dessus (dossier.modeCreation bascule sur 'maj' par
    // structurerTexteExistant()/onTerminer UNIQUEMENT une fois la
    // structuration terminee, voir plus haut dans ce fichier) : au-dela de
    // ce point, la reprise doit reprendre sur "Mon projet", plus jamais
    // rejouer le depot/l'assistant.
    var reformulerDejaStructure = !!(dossier.modeCreation === 'maj' && dossier._modeCreationVia === 'reformuler');
    syntheseHTML = _introBlocReprise(
      'Vous avez commencé à reformuler votre CV.',
      'btnReformulerCvReprendre', 'btnReformulerCvRecommencer', 'Continuer');
    actionsSynthese.push({
      id: 'btnReformulerCvReprendre',
      action: function () {
        if (reformulerDejaStructure) { naviguerVers('objectif'); return; }
        _prepLEEcran = 'depot';
        naviguerVers('reformuler-cv');
      }
    });
    actionsSynthese.push({
      id: 'btnReformulerCvRecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { _reformulerCvRecommencer(); return; }
        confirmerAction(
          'Recommencer la reformulation depuis le début ?',
          'Vous allez repartir d’une page blanche pour ce CV. Ce que vous avez déjà saisi dans ce parcours sera perdu.',
          'Recommencer', 'btn-danger', _reformulerCvRecommencer
        );
      }
    });
  }
  var config = {
    carteRetour: 'mesdocuments',
    detour: _prepLEDetour,
    detourLogo: 'bi-brush',
    detourBoutonId: 'btnReformulerCvRevenirModuleHaut',
    detourCtaId: 'btnReformulerCvRevenirModuleBas',
    onRevenir: _prepLERevenirModule,
    onRevenirExpr: '_prepLERevenirModule()',
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    ctaMasque: (!_prepLEDetour && (travailEnCours || cvReformule)),
    titre: '<i class="bi bi-brush"></i> Reformuler et présenter mon CV',
    sousTitre: 'Votre CV contient tout ce qu’il faut. On garde vos informations telles quelles : on retravaille seulement la formulation, l’ordre et la mise en forme.',
    etapes: REFORMULER_CV_NAV_ETAPES,
    ctaId: 'btnReformulerCvCommencer',
    ctaLabel: 'Déposer mon CV &#8594;',
    onCta: function () {
      dossier.decouverteTerminee = false;
      _prepLEEcran = 'depot';
      naviguerVers('reformuler-cv');
    },
    blocsHTML:
      _introBlocAccroche('<strong>Rien n’est jamais envoyé sans votre accord.</strong> Vous verrez chaque étape avant qu’elle se produise, et vous pourrez tout modifier.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-2">Vous avez un CV complet et à jour, mais sa présentation ne vous satisfait pas. Un assistant en ligne le <strong>reformule de façon professionnelle</strong> : verbes d’action, phrases claires, rubriques bien rangées, vocabulaire rapproché du poste que vous visez. Vous récupérez ensuite votre CV dans l’un de nos modèles, ou son texte pour le mettre en forme ailleurs.</p>' +
        _introBlocEncart('&#128204;', 'La différence avec un assistant en ligne où vous écririez librement : ici, la consigne est <strong>cadrée</strong>. L’assistant n’a pas le droit d’inventer une expérience, un diplôme ou un chiffre. Il reformule ce que vous avez écrit, il ne le remplace pas.')) +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous déposez votre CV (fichier, copier-coller, photo ou scan), puis vous relisez et masquez ce que vous ne voulez pas transmettre.</li>' +
        '<li>Vous indiquez <strong>le poste ou le domaine que vous visez</strong> : c’est ce qui permet d’adapter le vocabulaire.</li>' +
        '<li>Un assistant en ligne vous renvoie <strong>deux versions</strong> de votre CV, reformulées et remises en forme : une très proche de votre CV, une autre un peu différente. Vous choisissez.</li>' +
        '<li>Vous relisez la version choisie, en la comparant si besoin avec votre CV d’origine.</li>' +
        '<li>Vous choisissez la sortie : un de nos modèles (PDF ou Word), ou le texte à copier ailleurs.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce parcours ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il n’ajoute rien à votre CV : ni expérience, ni diplôme, ni compétence, ni date qui n’y figurent pas.</li>' +
        '<li>Il ne porte pas de regard critique sur le fond de votre CV : il en soigne la formulation et la présentation, pas le contenu.</li>' +
        '<li>Il ne crée pas de CV à partir de rien, et il ne corrige pas le contenu en profondeur : il part d’un CV déjà complet et juste.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Récupérer votre CV mis en forme, en PDF ou en Word.</li>' +
        '<li>Préparer votre lettre de motivation, puis vous entraîner à l’entretien.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">À tout moment, une réflexion utile sur votre parcours peut être mise de côté dans Mes Repères, pour vous ou votre conseiller.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Vous restez sur une seule page pour tout préparer. Une fois prêt, vous copiez un texte, vous le collez chez un assistant en ligne (dans un nouvel onglet), puis vous revenez coller sa réponse ici. La barre en haut vous permet de revenir à une étape déjà faite quand vous voulez.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_intro_affichee'); }
}

// TACHE (refonte "Mes documents", Phase 3a, 2026-09-02) : page d'introduction
// routee de la carte "Creer un nouveau CV" (mode 'nouveau'). Route 'creer-cv'.
// Contrairement a 'pret'/'maj', PAS de page "Preparer" depliante (rien a
// deposer, on part de zero) : intro simple -> CTA -> parcours guide existant
// (naviguerVers('objectif')). Le parcours lui-meme n'est PAS refondu (la
// barre d'etapes compacte est ajoutee via afficherProgression ; le
// regroupement des 4 ecrans = Phase 3b, a part).
// TACHE (retour utilisateur 2026-09-15, point reel confirme) : contrairement
// a 'pret'/'maj'/'reformuler' (_prepLERendreIntro/_majCvRendreIntro/
// _reformulerCvRendreIntro) et a co-lettre/prepa-entretien (_coLettreRendreIntro/
// _prepaEntretienRendreIntro), cette intro etait la SEULE des modules "Mes
// documents" sans le choix "Continuer / Recommencer" -- son CTA reinitialisait
// inconditionnellement (competencesCV/savoirsCV perdus) a CHAQUE clic, meme en
// plein milieu d'un CV deja commence, sans jamais poser la question. Meme
// patron que les autres : _creerCvRecommencer() reprend EXACTEMENT l'ancien
// reset inconditionnel (aucun changement de ce qu'il efface), seulement
// desormais derriere un choix explicite + confirmation (CV = le plus
// engageant des 5 parcours, donc confirmation systematique, comme co-lettre).
function _creerCvRecommencer() {
  if (typeof effacerSauvegarde === 'function') { effacerSauvegarde(); }
  dossier.modeCreation = 'nouveau';
  // TACHE (retour utilisateur 2026-09-15, "pas de lien entre le CV et les
  // autres documents") : voir le commentaire equivalent pres de
  // structurerTexteExistant() (maj/reformuler) dans ce fichier.
  dossier.dernierDocumentPrepare = 'cv';
  if (typeof trackEvenement === 'function') { trackEvenement('mode_creation_choisi', { mode: 'nouveau' }); }
  dossier.cvAnalyse = false;
  dossier.competencesCV = undefined;
  dossier.savoirsCV = undefined;
  dossier.decouverteTerminee = false;
  // TACHE (retour utilisateur 2026-09-15) : _barreEtapesMaxAtteint ("point
  // le plus loin jamais atteint", js/app.js) ne redescend jamais tout seul
  // -- sans ce reset, "Continuer" sur ce nouveau CV (voir btnCreerCvReprendre
  // plus bas dans ce fichier) pourrait renvoyer vers une etape avancee
  // (voire "Vos documents") heritee de l'ANCIEN CV termine dans cette meme
  // session, alors que celui-ci recommence de zero.
  if (typeof _barreEtapesMaxAtteint !== 'undefined' && typeof CREER_CV_NAV_ETAPES !== 'undefined') {
    _barreEtapesMaxAtteint.delete(CREER_CV_NAV_ETAPES);
  }
  naviguerVers('objectif');
}
function pageCreerCv() {
  var cvNouveauFait = !!(dossier.modeCreation === 'nouveau' && dossier.cvTermine);
  var travailEnCours = !!(dossier.modeCreation === 'nouveau' && dossier.objectif && !dossier.cvTermine);
  var syntheseHTML = '';
  var actionsSynthese = [];
  if (cvNouveauFait) {
    // TACHE (retour utilisateur 2026-09-15) : jusqu'ici, seul "Voir mon CV"
    // (un bouton en contour, discret) etait propose -- rien pour repartir
    // de zero, et l'etat "deja termine" se remarquait mal. Meme brique que
    // travailEnCours juste en dessous (_introBlocReprise, boutons pleins) :
    // consistance, et les deux issues (voir / recommencer) cote a cote.
    syntheseHTML = _introBlocReprise(
      '&#10024; Votre CV est prêt.',
      'btnCreerCvVoirCv', 'btnCreerCvRecommencerFait', 'Voir mon CV');
    actionsSynthese.push({ id: 'btnCreerCvVoirCv', action: function () { dossier.dernierDocumentPrepare = 'cv'; naviguerVers('resultats'); } });
    actionsSynthese.push({
      id: 'btnCreerCvRecommencerFait',
      action: function () {
        confirmerAction(
          'Recommencer un CV depuis le début ?',
          'Vous allez repartir d’une page blanche pour ce CV. Votre CV actuel sera perdu.',
          'Recommencer', 'btn-danger', _creerCvRecommencer
        );
      }
    });
  } else if (travailEnCours) {
    syntheseHTML = _introBlocReprise(
      'Vous avez déjà commencé à créer votre CV.',
      'btnCreerCvReprendre', 'btnCreerCvRecommencer', 'Continuer');
    // TACHE (retour utilisateur 2026-09-15, bug reel confirme : "Continuer
    // doit reprendre a la page la plus avancee, pas toujours a la 1ere") :
    // naviguerVers('objectif') ramenait systematiquement au tout debut du
    // parcours, meme si la personne avait deja avance bien plus loin (ex.
    // "Votre profil", "Assistant") avant de revenir sur cet ecran d'intro.
    // _barreEtapesMaxAtteint (js/app.js, alimente par afficherProgression()
    // a chaque etape visitee dans CETTE session) retrouve l'index le plus
    // loin reellement atteint ; _creerCvRouteParIndex() (juste au-dessus
    // dans ce fichier, meme source que la barre d'etapes cliquable) le
    // traduit en route. Repli sur 'objectif' si rien n'a encore ete
    // enregistre (jamais d'exception).
    actionsSynthese.push({
      id: 'btnCreerCvReprendre',
      action: function () {
        var maxAtteint = (typeof _barreEtapesMaxAtteint !== 'undefined' && typeof CREER_CV_NAV_ETAPES !== 'undefined')
          ? _barreEtapesMaxAtteint.get(CREER_CV_NAV_ETAPES) : undefined;
        // TACHE (retour utilisateur 2026-09-15, suite -- bug reel confirme :
        // "une session importee arrivee sur Vos documents doit pouvoir y
        // revenir avec Continuer") : l'index 5 ("Vos documents") est un
        // arret legitime ici -- on peut avoir deja atteint "Vos documents"
        // (assistant termine) SANS que le CV soit "termine" au sens de
        // dossier.cvTermine (qui n'est pose qu'en avancant jusqu'a
        // "Exporter" DANS "Vos documents", voir btnContinuerApercu plus
        // haut dans ce fichier) -- ce bouton reste donc bien affiche
        // (travailEnCours) alors meme que "Vos documents" a deja ete vu.
        // Contamination entre 2 CV de la meme session (le WeakMap ne
        // redescend jamais) geree a la source par _creerCvRecommencer()
        // (reinitialise ce repere), pas ici par un plafond arbitraire.
        var route = (typeof maxAtteint === 'number') ? _creerCvRouteParIndex(maxAtteint) : null;
        naviguerVers(route || 'objectif');
      }
    });
    actionsSynthese.push({
      id: 'btnCreerCvRecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { _creerCvRecommencer(); return; }
        confirmerAction(
          'Recommencer un CV depuis le début ?',
          'Vous allez repartir d’une page blanche pour ce CV. Ce que vous avez déjà saisi dans ce parcours sera perdu.',
          'Recommencer', 'btn-danger', _creerCvRecommencer
        );
      }
    });
  }
  var config = {
    carteRetour: 'mesdocuments',
    titre: '<i class="bi bi-stars"></i> Créer un nouveau CV',
    sousTitre: 'On part d’une page blanche. L’application vous accompagne pas à pas, une question à la fois.',
    etapes: CREER_CV_NAV_ETAPES,
    ctaId: 'btnCreerCvCommencer',
    ctaLabel: 'Commencer mon CV &#8594;',
    ctaMasque: (travailEnCours || cvNouveauFait),
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    onCta: _creerCvRecommencer,
    blocsHTML:
      _introBlocAccroche('<strong>Rien n’est jamais envoyé sans votre accord.</strong> Vous verrez chaque étape avant qu’elle se produise, et vous pourrez tout modifier.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-2">Construire un CV complet à partir de zéro : vos expériences, vos compétences, votre projet. À la fin, vous obtenez un CV prêt à mettre en forme, puis vous pourrez préparer votre lettre de motivation et votre entretien.</p>' +
        _introBlocEncart('&#128196;', 'Les modèles de mise en page sont les nôtres (PDF et Word). S’ils ne correspondent pas à ce que vous cherchez, vous pouvez à tout moment <strong>copier le texte de votre CV</strong> et le mettre en forme sur une autre plateforme de création de CV. Vous n’êtes jamais bloqué.')) +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous indiquez votre objectif : le poste ou le type de poste que vous visez.</li>' +
        '<li>Vous racontez votre parcours : ce que vous avez fait, où, dans quelles conditions.</li>' +
        '<li>Vous précisez votre projet et vos attentes.</li>' +
        '<li>Un assistant en ligne vous aide à formuler tout cela de façon professionnelle.</li>' +
        '<li>Vous choisissez la mise en forme et vous exportez votre CV (PDF ou Word).</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce parcours ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Il ne part pas d’un CV que vous auriez déjà : ici, on écrit tout ensemble, depuis le début.</li>' +
        '<li>Il ne porte pas de regard critique sur un CV existant.</li>' +
        '<li>Il ne rédige pas votre lettre à votre place, phrase par phrase.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Mettre votre CV en forme : plusieurs modèles, en PDF ou en Word.</li>' +
        '<li>Préparer votre lettre de motivation.</li>' +
        '<li>Vous entraîner aux questions d’un entretien d’embauche.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">À tout moment, vous pouvez mettre de côté une réflexion utile sur votre parcours (un doute, une idée, une chose à en dire) dans Mes Repères, pour vous ou votre conseiller.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Vous avancez page par page. Une barre en haut montre où vous en êtes, et vous pouvez revenir à une étape déjà faite quand vous voulez. Pour la partie assistant, vous copiez un texte, vous le collez chez un assistant en ligne dans un nouvel onglet, puis vous revenez coller sa réponse ici. L’application ne remplit rien toute seule : vous validez chaque étape.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('creer_cv_intro_affichee'); }
}

// --- Bloc 1.2 : page "Preparer" DEPLIANTE (remplace les 4 sous-ecrans de
// la modale ouvrirAssistantDepotCV pour le cas texte / copier-coller ;
// modale gardee en repli photo/scan). Reprend la structure et les classes
// de htmlBilanPreparer() (js/app.js), meme langage visuel. Le CTA reutilise
// structurerTexteExistant() (data/metiers.js) : texte deja relu -> etape 3
// du wizard (choix assistant + import extraction-cv.md) -> objectif. -----
function _prepLERendreDepot() {
  if (!_prepLEEtat) {
    _prepLEEtat = { cvTexte: null, dejaRelu: false, relectureFaite: false, situationTouchee: false };
  }
  // La personne s'est engagee dans ce parcours : le mode ('pret' / 'maj' /
  // 'reformuler') est fixe des maintenant (comme le handler "nouveau" le
  // fait a l'entree).
  // DECISION (chantier « Reformuler et presenter mon CV », etape 3, 2026-09-07) :
  // 'reformuler' garde les semantiques 'maj' pour dossier.modeCreation (CV
  // considere complet, carte CV non verrouillee, sorties PDF/Word). Le
  // branchement propre au module (page "Preparer", ecrans post-reponse) se
  // fait sur _prepLEMode / la route 'reformuler-cv', JAMAIS via une 4e
  // valeur de modeCreation -- eviter d'auditer les ~40 lecteurs existants.
  if (typeof dossier !== 'undefined' && dossier) {
    dossier.modeCreation = (_prepLEMode === 'reformuler') ? 'maj' : _prepLEMode;
    // TACHE (retour Denis 2026-09-19, bug reprise partagee "Reformuler"/
    // "Mettre a jour") : 'reformuler' et 'maj' ecrivent tous deux
    // dossier.modeCreation = 'maj' (aliasing decide ci-dessus) -- rien ne
    // disait ensuite QUI avait reellement produit cette valeur. _prepLEMode
    // ne peut pas servir de signal a la lecture (pageMettreAJourCv()/
    // pageReformulerCv() l'ecrasent tous deux inconditionnellement a chaque
    // rendu, avant meme d'atteindre _majCvRendreIntro()/_reformulerCvRendreIntro()).
    // dossier._modeCreationVia fige ici, au seul point d'ecriture de
    // dossier.modeCreation pour ce trio, le _prepLEMode REEL du moment :
    // seule source de verite pour distinguer les deux plus loin.
    dossier._modeCreationVia = _prepLEMode;
  }
  app.innerHTML = htmlPreparerLettreEntretienDepliante();
  brancherPreparerLettreEntretienDepliante();
  if (typeof trackEvenement === 'function') {
    var evtDepot = _prepLEMode === 'maj' ? 'mettre_a_jour_cv_depot_affiche'
      : (_prepLEMode === 'reformuler' ? 'reformuler_cv_depot_affiche' : 'preparer_lettre_entretien_depot_affiche');
    trackEvenement(evtDepot);
  }
}

function htmlPreparerLettreEntretienDepliante() {
  var etat = _prepLEEtat;
  var estMaj = (_prepLEMode === 'maj');
  var estReformuler = (_prepLEMode === 'reformuler');
  var logoModule = estReformuler ? 'bi-brush' : (estMaj ? 'bi-pencil-square' : 'bi-file-earmark-check');
  var navEtapes = estReformuler ? REFORMULER_CV_NAV_ETAPES
    : (estMaj ? MAJ_CV_NAV_ETAPES : PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES);
  var cvPresent = !!etat.cvTexte;
  var relu = !!etat.relectureFaite;
  // Mode 'reformuler' : bloc 3 = "poste ou domaine vise", NECESSAIRE
  // (au moins l'un des deux), au lieu de "Pourquoi ce CV ?".
  var rc = (typeof dossier !== 'undefined' && dossier.rechercheCandidature) || {};
  var reformulerCibleOk = !!(
    (rc.reformulerPoste && rc.reformulerPoste.trim()) ||
    (rc.reformulerSecteur && rc.reformulerSecteur.trim()));
  var situationConnue = !!(typeof dossier !== 'undefined' && dossier.objectif);
  var objectifLabel = '';
  if (situationConnue && typeof OBJECTIF_CHOIX_CANDIDATURE !== 'undefined') {
    var o = OBJECTIF_CHOIX_CANDIDATURE.filter(function (x) { return x.id === dossier.objectif; })[0];
    objectifLabel = o ? o.title : dossier.objectif;
  }
  var n = 0;
  var blocs = [];

  // ---------- Bloc 1 : Votre CV ----------
  n++;
  blocs.push(
    '<details class="bloc-depli' + (cvPresent ? ' bd-ok' : '') + '" id="prepLEBloc1"' + (!cvPresent ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">' + n + '</span><span class="preparer-titre">Votre CV</span>' +
    '<span class="pilule-etat ' + (cvPresent ? 'pe-ok">Déposé &middot; vous pouvez le changer' : 'pe-attente">À déposer') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (cvPresent
      ? '<div class="carte-preparer-ok"><strong>&#9989; Déposé</strong>' +
        '<button type="button" id="btnPrepLEChangerCv" class="btn btn-outline-secondary btn-sm ms-2">Changer de CV</button></div>' +
        '<p class="preparer-detail">Un seul CV à la fois. « Changer de CV » remplace celui-ci.</p>'
      : '<p>Déposez votre CV, ou collez son texte. Il est lu directement dans votre navigateur, <strong>il n’est envoyé nulle part</strong> à ce stade.</p>' +
        '<div class="d-flex gap-2 flex-wrap">' +
        '<button type="button" id="btnPrepLEDeposerCv" class="btn btn-primary btn-sm">Déposer mon fichier</button>' +
        '<button type="button" id="btnPrepLECollerCv" class="btn btn-outline-secondary btn-sm">Ou coller le texte</button>' +
        '</div>' +
        '<p class="preparer-detail"><strong>Tous les formats sont acceptés</strong> : PDF, Word, .txt, une photo ou une capture d’écran. Pour une photo ou un scan, une fenêtre s’ouvre le temps de préparer l’image, puis vous revenez ici.</p>' +
        '<div id="prepLECollerZone" hidden class="mt-2">' +
        '<textarea id="prepLECollerTexte" class="form-control form-control-sm" rows="6" placeholder="Collez ici le texte de votre CV"></textarea>' +
        '<div class="mt-2"><button type="button" id="btnPrepLECollerValider" class="btn btn-outline-secondary btn-sm">Annuler</button></div>' +
        '</div>') +
    '</div></details>'
  );

  // ---------- Bloc 2 : Relire, verifier, corriger, masquer ----------
  n++;
  blocs.push(
    '<details class="bloc-depli' + (relu ? ' bd-ok' : '') + '" id="prepLEBloc2"' + (cvPresent && !relu ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">' + n + '</span><span class="preparer-titre">Relire, vérifier, corriger, masquer</span>' +
    '<span class="preparer-oblig">obligatoire</span>' +
    '<span class="pilule-etat ' + (relu ? 'pe-ok">Relu et validé' : 'pe-info">À faire &middot; modifiable ensuite') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    '<p>Vous <strong>corrigez le texte</strong> si besoin, et vous <strong>masquez ce que vous ne voulez pas transmettre</strong> à l’assistant. Rien n’est masqué à votre place.</p>' +
    '<p class="preparer-detail">Le <strong>téléphone, le courriel, les liens</strong> (LinkedIn…), <strong>le code postal et la ville</strong>, l’âge ou la date de naissance étiquetés sont <strong>surlignés en jaune</strong> dans le texte pour que vous les repériez. Le nom, le prénom et le numéro de rue ne sont repérés que sous la forme « Nom : … » ou dans le courriel - vérifiez le reste vous-même. Pour une photo, vous masquez directement sur l’image.</p>' +
    '<div class="d-flex gap-2 flex-wrap align-items-center">' +
    '<button type="button" id="btnPrepLERelecture" class="btn btn-primary btn-sm"' + (cvPresent ? '' : ' disabled') + '>Ouvrir la relecture</button>' +
    (typeof htmlDeclencheurDemoVideo === 'function' ? htmlDeclencheurDemoVideo('masquage-texte') : '') +
    '</div>' +
    (cvPresent ? '' : '<p class="preparer-detail">Déposez d’abord votre CV (partie 1) pour pouvoir le relire.</p>') +
    '</div></details>'
  );

  // ---------- Bloc 3 ----------
  n++;
  if (estReformuler) {
    // TACHE (retour utilisateur 2026-09-16) : fusion de l'ancien bloc 3
    // ("Le poste ou le domaine que vous visez", 2 champs texte libres
    // remplissables en meme temps -- incoherent : Denis voulait un VRAI
    // choix, pas les deux a la fois) et de l'ancien bloc 4 ("L'offre
    // visee") en un seul bloc -- l'offre visee suit directement, "dans la
    // continuite". "Domaine" passe d'un champ libre a un menu (SECTEURS_APP,
    // deja la liste controlee/partagee des 21 secteurs -- LECONS 13, jamais
    // une 2e liste) + "Autre" en repli texte libre, meme patron EXACT que
    // "Type de structure" du bloc offre juste en dessous
    // (bilanCorpsCiblageOffreHTML(), #ciblageTypeStructure/Autre).
    // etat.reformulerCibleType (transitoire, comme etat.cvTexte) retient le
    // choix entre les 2 rendus de cet ecran -- devine a partir des donnees
    // deja saisies (anciennes sessions a 2 champs remplis : "poste"
    // l'emporte, rien n'est perdu, le domaine reste rempli sous l'autre
    // onglet) la toute premiere fois seulement.
    if (!etat.reformulerCibleType) {
      etat.reformulerCibleType = (!(rc.reformulerPoste && rc.reformulerPoste.trim()) &&
        (rc.reformulerSecteur && rc.reformulerSecteur.trim())) ? 'domaine' : 'poste';
    }
    var cibleType = etat.reformulerCibleType;
    var secteurValeur = rc.reformulerSecteur || '';
    var secteurEstAutre = !!secteurValeur && SECTEURS_APP.every(function (s) { return s.libelle !== secteurValeur; });
    blocs.push(
      '<details class="bloc-depli' + (reformulerCibleOk ? ' bd-ok' : '') + '" id="prepLEBloc3"' + (cvPresent && relu && !reformulerCibleOk ? ' open' : '') + '>' +
      '<summary><span class="preparer-num">' + n + '</span><span class="preparer-titre">Le poste, le domaine ou l’offre visée</span>' +
      '<span class="preparer-oblig">nécessaire</span>' +
      '<span class="pilule-etat ' + (reformulerCibleOk ? 'pe-ok">Renseigné' : 'pe-info">Nécessaire pour adapter le vocabulaire') + '</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p>C’est indispensable ici : sans cela, le vocabulaire de vos compétences resterait générique. Choisissez un poste précis, ou seulement un domaine si vous ne visez pas un poste en particulier.</p>' +
      // TACHE (retour utilisateur 2026-09-16) : conteneur dedie -- necessaire
      // pour scoper activerChampsStandardises() (voir le cablage plus bas)
      // aux SEULS champs poste/domaine. bilanCablerCiblageOffre() appelle
      // deja sa propre activerChampsStandardises() sur #prepLEBloc4Corps ;
      // sans ce conteneur separe, appeler activerChampsStandardises() sur
      // tout le bloc (desormais parent des 2 sous-parties, fusion oblige)
      // cablerait les champs entreprise/site UNE 2e FOIS (majuscule
      // automatique et navigation Entree dupliquees a chaque frappe).
      '<div id="prepLEReformulerCibleZone">' +
      '<div class="preparer-jetons mb-2">' +
      '<button type="button" class="preparer-jeton' + (cibleType === 'poste' ? ' preparer-jeton-actif' : '') + '" data-reformuler-cible-type="poste">Un poste précis</button>' +
      '<button type="button" class="preparer-jeton' + (cibleType === 'domaine' ? ' preparer-jeton-actif' : '') + '" data-reformuler-cible-type="domaine">Un domaine ou secteur</button>' +
      '</div>' +
      '<div id="prepLEReformulerPosteZone" class="mb-1"' + (cibleType !== 'poste' ? ' style="display:none;"' : '') + '>' +
      '<label class="form-label small fw-bold" for="prepLEReformulerPoste">Poste visé</label>' +
      '<input type="text" class="form-control form-control-sm" id="prepLEReformulerPoste" placeholder="Ex. : agent logistique, aide à domicile..." value="' + echapperAttribut(rc.reformulerPoste || '') + '"></div>' +
      '<div id="prepLEReformulerSecteurZone" class="mb-1"' + (cibleType !== 'domaine' ? ' style="display:none;"' : '') + '>' +
      '<label class="form-label small fw-bold" for="prepLEReformulerSecteurSelect">Domaine ou secteur</label>' +
      '<select class="form-select form-select-sm" id="prepLEReformulerSecteurSelect">' +
      '<option value="">Choisir un domaine</option>' +
      SECTEURS_APP.map(function (s) {
        return '<option value="' + echapperAttribut(s.libelle) + '"' + (secteurValeur === s.libelle ? ' selected' : '') + '>' + s.libelle + '</option>';
      }).join('') +
      '<option value="Autre"' + (secteurEstAutre ? ' selected' : '') + '>Autre...</option>' +
      '</select>' +
      '<input type="text" class="form-control form-control-sm mt-2" id="prepLEReformulerSecteurAutre" placeholder="Précisez le domaine" style="' + (secteurEstAutre ? '' : 'display:none;') + '" value="' + (secteurEstAutre ? echapperAttribut(secteurValeur) : '') + '"></div>' +
      '</div>' +
      '<div class="mt-3 pt-3" style="border-top:1px solid var(--border);">' +
      '<p class="mb-1"><strong>Si vous connaissez déjà l’offre</strong> <span class="assistant-badge-fac">facultatif</span></p>' +
      '<p class="preparer-detail">Le vocabulaire de vos compétences s’aligne alors sur ce qu’elle demande, plutôt que de rester général.</p>' +
      '<div id="prepLEBloc4Corps">' + bilanCorpsCiblageOffreHTML() + '</div>' +
      '</div>' +
      '</div></details>'
    );
  }
  // TACHE (retour utilisateur 2026-09-16, "des informations qui sont en
  // double... pourquoi ce CV, on peut completement l'enlever, parce
  // qu'apres le premier passage IA, on se retrouve sur les memes cartes")
  // : les anciens blocs 3 ("Pourquoi ce CV ?", memes 6 cartes que
  // OBJECTIF_CHOIX_CANDIDATURE) et 4 ("L'offre visee", meme
  // bilanCorpsCiblageOffreHTML()) retires pour 'pret'/'maj' -- strict
  // doublon de ce que "Votre objectif" (pageObjectif(), js/app.js) offre
  // deja juste apres, en mieux (elle ajoute meme le choix precis du
  // metier/domaine, la civilite du recruteur et la couleur d'entreprise,
  // absents ici). Non touche pour 'reformuler' : son bloc 3 fusionne
  // (voir ci-dessus) un besoin different, necessaire des l'appel a
  // l'assistant pour orienter le vocabulaire de la reformulation elle-meme
  // -- 'objectif' arrive trop tard pour ce role.
  // TACHE (retour utilisateur 2026-09-16, "avant d'aller au niveau
  // d'assistant, que la personne choisisse clairement pourquoi elle est
  // la -- lettre de motivation ou preparation d'entretien") : uniquement
  // 'pret' (le seul des 3 modes ou lettre ET entretien sont deux issues
  // egalement possibles des le depart, le CV n'etant jamais modifie).
  // N'importe jamais rien, ne bloque jamais "Choisir mon assistant" (le
  // parcours continue a l'identique quel que soit le choix) : sert
  // seulement a orienter par quel document commencer, et a proposer
  // ensuite l'autre en "Et maintenant ?" (voir suggestionSuivante(),
  // js/app.js).
  if (!estMaj && !estReformuler) {
    // TACHE (retour utilisateur 2026-09-16, suite : "je veux les 2 options
    // sous forme de cartes bien visibles, je ne peux pas choisir
    // d'assistant tant que je n'ai pas choisi un parcours -- encore mieux,
    // enleve completement le bouton Choisir l'assistant, le clic sur une
    // carte fait continuer") : les 2 jetons discrets sont remplaces par 2
    // GRANDES cartes (.carte-objectif, memes classes que "Votre objectif" --
    // deja approuvees par Denis, jamais un style invente ici) ; le bouton
    // "Choisir mon assistant" du pied de page (voir plus bas) disparait
    // pour 'pret' -- le clic sur une carte EST directement l'action
    // "continuer vers l'assistant" (voir son cablage, _prepLEVersAssistant
    // dans brancherPreparerLettreEntretienDepliante()). Desactivees tant
    // que le CV n'est pas depose ET relu (memes conditions que l'ancien
    // bouton) : impossible de choisir un parcours avant d'avoir un CV a
    // transmettre.
    var choixPremier = dossier.pretChoixPremier || null;
    var pretPeutContinuer = cvPresent && relu;
    blocs.push(
      '<details class="bloc-depli' + (choixPremier ? ' bd-ok' : '') + '" id="prepLEBloc3"' + (cvPresent && relu && !choixPremier ? ' open' : '') + '>' +
      '<summary><span class="preparer-num">' + n + '</span><span class="preparer-titre">Pourquoi êtes-vous ici ?</span>' +
      '<span class="preparer-oblig">conseillé</span>' +
      '<span class="pilule-etat ' + (choixPremier ? 'pe-ok">' + (choixPremier === 'lettre' ? 'Lettre de motivation' : 'Préparation d’entretien') : 'pe-info">À choisir') + '</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p>Cliquez sur une carte pour continuer directement vers l’assistant. Vous pourrez préparer les deux à la suite : ce choix sert seulement à décider par lequel commencer.</p>' +
      (pretPeutContinuer ? '' : '<p class="preparer-detail">Déposez et relisez d’abord votre CV (parties 1 et 2 ci-dessus) pour pouvoir continuer.</p>') +
      '<div class="grille-objectif">' +
      '<button type="button" class="carte-objectif' + (choixPremier === 'lettre' ? ' carte-objectif--actif' : '') + '" data-pret-choix-premier="lettre"' + (pretPeutContinuer ? '' : ' disabled') + '>' +
      '<i class="bi bi-envelope" aria-hidden="true"></i>' +
      '<span class="carte-objectif-titre">Une lettre de motivation</span>' +
      '<span class="carte-objectif-desc">Commencer par rédiger la lettre.</span>' +
      '</button>' +
      '<button type="button" class="carte-objectif' + (choixPremier === 'entretien' ? ' carte-objectif--actif' : '') + '" data-pret-choix-premier="entretien"' + (pretPeutContinuer ? '' : ' disabled') + '>' +
      '<i class="bi bi-mic" aria-hidden="true"></i>' +
      '<span class="carte-objectif-titre">Une préparation d’entretien</span>' +
      '<span class="carte-objectif-desc">Commencer par préparer l’entretien.</span>' +
      '</button>' +
      '</div>' +
      '</div></details>'
    );
  }

  // Barre d'etapes du module (Preparer = etape 0) + bouton "Revoir la
  // presentation" JUSTE EN DESSOUS -- exactement le meme placement et le
  // meme rendu que le Bilan / Coherence / Comparer (barre d'etapes puis
  // bande-reprise-module, en tete du contenu du module), pour ne jamais
  // confondre avec les boutons d'application en haut de la page.
  var barreHaut = barreEtapesModule(navEtapes, 0);
  var boutonPres = '<div><button type="button" id="btnPrepLERevoirPres" class="btn-revoir-module">' +
    '<i class="bi ' + logoModule + '"></i> Revoir la présentation</button></div>' +
    (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue()
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '');
  var bandePres = (typeof htmlBandeRepriseModule === 'function') ? htmlBandeRepriseModule(boutonPres, '') : boutonPres;

  return '<div class="page-catalogue-contenu bilan-preparer">' +
    barreHaut + bandePres +
    '<div class="text-center"><h1><i class="bi ' + logoModule + '"></i> ' + (estReformuler ? 'Préparer votre CV' : (estMaj ? 'Préparer la mise à jour' : 'Préparer votre candidature')) + '</h1>' +
    '<p class="sousTitre">Tout se prépare ici, sur une seule page qui se déplie. Vous pourrez rouvrir une partie déjà faite à tout moment.</p></div>' +
    blocs.join('') +
    // TACHE (retour utilisateur 2026-09-16) : bouton retire pour 'pret' --
    // le clic sur une des 2 cartes du bloc 3 ci-dessus fait deja directement
    // "continuer" (voir _prepLEVersAssistant()). Inchange pour 'maj'/
    // 'reformuler', qui n'ont pas ce choix prealable.
    (!estMaj && !estReformuler ? '' :
      '<div class="text-center" style="margin-top:1.4rem;">' +
      '<button type="button" id="btnPrepLEVersAssistant" class="btn btn-primary btn-lg"' + (cvPresent && relu && (!estReformuler || reformulerCibleOk) ? '' : ' disabled') + '>Choisir mon assistant &#8594;</button>' +
      '<p class="preparer-detail" style="margin-top:.5rem;">' + (estReformuler
        ? 'Ce bouton s’active une fois « Votre CV » déposé et relu, et « Le poste ou le domaine visé » renseigné. « L’offre visée » peut rester vide.'
        : 'Ce bouton s’active une fois « Votre CV » déposé et relu.') + '</p>' +
      '</div>') +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_prepLERetourIntro()' }) + '</div>';
}

function brancherPreparerLettreEntretienDepliante() {
  var etat = _prepLEEtat;

  var btnRevoirPres = document.getElementById('btnPrepLERevoirPres');
  if (btnRevoirPres) { btnRevoirPres.addEventListener('click', _prepLEVoirPresentation); }

  var btnDeposer = document.getElementById('btnPrepLEDeposerCv');
  if (btnDeposer) {
    btnDeposer.addEventListener('click', function () {
      obtenirOuDeposerTexteCV(function (r) {
        if (!r || r.texte === null) {
          // Photo / scan : repli sur la modale complete (comportement
          // d'origine, jamais modifie). Elle mene elle-meme a l'objectif.
          ouvrirAssistantDepotCV('pret');
          return;
        }
        etat.cvTexte = r.texte;
        etat.dejaRelu = !!r.dejaRelu;
        etat.relectureFaite = !!r.dejaRelu;
        _prepLERendreDepot();
      });
    });
  }

  var btnColler = document.getElementById('btnPrepLECollerCv');
  var zoneColler = document.getElementById('prepLECollerZone');
  var champColler = document.getElementById('prepLECollerTexte');
  var btnCollerValider = document.getElementById('btnPrepLECollerValider');
  if (btnColler && zoneColler) {
    btnColler.addEventListener('click', function () { zoneColler.hidden = !zoneColler.hidden; if (!zoneColler.hidden && champColler) { champColler.focus(); } });
  }
  if (champColler && btnCollerValider) {
    champColler.addEventListener('input', function () {
      btnCollerValider.textContent = champColler.value.trim() ? 'Enregistrer ce texte' : 'Annuler';
    });
    btnCollerValider.addEventListener('click', function () {
      var t = champColler.value.trim();
      if (!t) { zoneColler.hidden = true; return; }
      etat.cvTexte = t;
      etat.dejaRelu = false;
      etat.relectureFaite = false;
      _prepLERendreDepot();
    });
  }

  var btnChanger = document.getElementById('btnPrepLEChangerCv');
  if (btnChanger) {
    btnChanger.addEventListener('click', function () {
      etat.cvTexte = null; etat.dejaRelu = false; etat.relectureFaite = false;
      _prepLERendreDepot();
    });
  }

  var btnRelecture = document.getElementById('btnPrepLERelecture');
  if (btnRelecture) {
    btnRelecture.addEventListener('click', function () {
      if (!etat.cvTexte) { return; }
      bilanDemanderRelectureCv(etat.cvTexte, undefined, etat.dejaRelu).then(function (res) {
        etat.cvTexte = res.contenuValide;
        etat.relectureFaite = true;
        _prepLERendreDepot();
      }).catch(function (erreur) {
        if (erreur && erreur.code === 'RelectureAnnulee') { return; }
        if (typeof trackEvenement === 'function') { trackEvenement('preparer_lettre_entretien_relecture_erreur', { code: erreur && erreur.code }); }
      });
    });
  }

  // TACHE (retour utilisateur 2026-09-16) : remplace l'ancien cablage de
  // "Pourquoi ce CV ?" (data-preple-situation, bloc retire -- doublon de
  // "Votre objectif") -- nouveau bloc 3, 'pret' uniquement (voir
  // htmlPreparerLettreEntretienDepliante() plus haut). TACHE (retour
  // utilisateur 2026-09-16, suite : "le clic sur une carte fait
  // directement continuer, enleve le bouton Choisir l'assistant") : le
  // clic n'ouvre plus seulement un re-rendu local -- il enregistre le
  // choix ET enchaine tout de suite sur l'assistant, meme geste que
  // l'ancien btnPrepLEVersAssistant (desormais retire pour 'pret', voir
  // plus bas) pour ce meme mode. Les cartes desactivees (CV pas encore
  // depose/relu) ne recoivent jamais ce clic (attribut natif "disabled").
  document.querySelectorAll('[data-pret-choix-premier]').forEach(function (el) {
    el.addEventListener('click', function () {
      dossier.pretChoixPremier = this.dataset.pretChoixPremier;
      _prepLEEcran = 'echange';
      if (typeof trackEvenement === 'function') {
        trackEvenement('preparer_lettre_entretien_vers_assistant', { choixPremier: dossier.pretChoixPremier });
      }
      naviguerVers('preparer-lettre-entretien');
    });
  });

  // ----- Bloc 3, mode 'reformuler' : poste / domaine vise (NECESSAIRE) -----
  // Ecriture immediate dans dossier.rechercheCandidature ; le CTA est
  // reactive a la frappe SANS re-render complet (ne pas rejouer l'animation
  // d'ouverture des blocs -- voir LECONS 9.5).
  if (_prepLEMode === 'reformuler') {
    // TACHE (retour utilisateur 2026-09-16) : scope a la seule zone
    // poste/domaine (#prepLEReformulerCibleZone), jamais tout #prepLEBloc3
    // -- ce dernier contient desormais aussi #prepLEBloc4Corps (fusion des
    // 2 blocs), deja cable par bilanCablerCiblageOffre() plus bas (qui
    // appelle sa propre activerChampsStandardises()) -- cibler tout le
    // bloc doublerait ce cablage sur entreprise/site.
    var zoneCible = document.getElementById('prepLEReformulerCibleZone');
    if (zoneCible && typeof activerChampsStandardises === 'function') { activerChampsStandardises(zoneCible); }
    var majCtaReformuler = function () {
      var b = document.getElementById('btnPrepLEVersAssistant');
      if (!b) { return; }
      var r = dossier.rechercheCandidature || {};
      var ok = !!((r.reformulerPoste && r.reformulerPoste.trim()) || (r.reformulerSecteur && r.reformulerSecteur.trim()));
      b.disabled = !(etat.cvTexte && etat.relectureFaite && ok);
    };
    var champPoste = document.getElementById('prepLEReformulerPoste');
    if (champPoste) {
      champPoste.addEventListener('input', function () {
        if (!dossier.rechercheCandidature) { dossier.rechercheCandidature = {}; }
        dossier.rechercheCandidature.reformulerPoste = champPoste.value;
        majCtaReformuler();
      });
    }
    var selectSecteur = document.getElementById('prepLEReformulerSecteurSelect');
    var champSecteurAutre = document.getElementById('prepLEReformulerSecteurAutre');
    var ecrireSecteurDepuisChamps = function () {
      if (!dossier.rechercheCandidature) { dossier.rechercheCandidature = {}; }
      dossier.rechercheCandidature.reformulerSecteur = (selectSecteur.value === 'Autre') ? champSecteurAutre.value : selectSecteur.value;
      majCtaReformuler();
    };
    if (selectSecteur && champSecteurAutre) {
      selectSecteur.addEventListener('change', function () {
        champSecteurAutre.style.display = (selectSecteur.value === 'Autre') ? '' : 'none';
        ecrireSecteurDepuisChamps();
      });
      champSecteurAutre.addEventListener('input', ecrireSecteurDepuisChamps);
    }
    // Choix "Un poste precis" / "Un domaine ou secteur" : bascule
    // d'affichage SANS re-render complet (LECONS 9.5) -- vide le champ
    // inutilise pour un VRAI choix exclusif (retour utilisateur : "soit
    // l'un soit l'autre"), jamais une valeur fantome qui repartirait quand
    // meme dans le prompt (_reformulerCvContexteTexte() envoie toujours
    // les 2 lignes "Poste"/"Domaine", meme vide -> "non precise").
    document.querySelectorAll('[data-reformuler-cible-type]').forEach(function (bouton) {
      bouton.addEventListener('click', function () {
        var type = this.dataset.reformulerCibleType;
        if (etat.reformulerCibleType === type) { return; }
        etat.reformulerCibleType = type;
        document.querySelectorAll('[data-reformuler-cible-type]').forEach(function (b) {
          b.classList.toggle('preparer-jeton-actif', b === bouton);
        });
        var zonePoste = document.getElementById('prepLEReformulerPosteZone');
        var zoneSecteur = document.getElementById('prepLEReformulerSecteurZone');
        if (zonePoste) { zonePoste.style.display = (type === 'poste') ? '' : 'none'; }
        if (zoneSecteur) { zoneSecteur.style.display = (type === 'domaine') ? '' : 'none'; }
        if (!dossier.rechercheCandidature) { dossier.rechercheCandidature = {}; }
        if (type === 'poste') {
          dossier.rechercheCandidature.reformulerSecteur = '';
          if (selectSecteur) { selectSecteur.value = ''; }
          if (champSecteurAutre) { champSecteurAutre.value = ''; champSecteurAutre.style.display = 'none'; }
        } else {
          dossier.rechercheCandidature.reformulerPoste = '';
          if (champPoste) { champPoste.value = ''; }
        }
        majCtaReformuler();
      });
    });
  }

  // ----- Bloc 4 : L'offre visee -----
  var bloc4 = document.getElementById('prepLEBloc4Corps');
  if (bloc4 && typeof bilanCablerCiblageOffre === 'function') { bilanCablerCiblageOffre(bloc4); }

  var btnSuite = document.getElementById('btnPrepLEVersAssistant');
  if (btnSuite) {
    btnSuite.addEventListener('click', function () {
      if (btnSuite.disabled) { return; }
      // Persiste le ciblage (entreprise / site / offre / type de structure)
      // dans dossier.rechercheCandidature -- meme structure que
      // ouvrirFormulaireCoordonneesEntreprise (js/app.js), lue par
      // texteProfil() pour le prompt cv.md sur la page Action.
      if (bloc4 && typeof bilanLireCiblageOffre === 'function') {
        var s = bilanLireCiblageOffre(bloc4);
        if (!dossier.rechercheCandidature) {
          dossier.rechercheCandidature = { entreprise: '', site: '', lienOffre: '', civiliteRecruteur: '', nomRecruteur: '', mettreEnAvantCouleurEntreprise: false, couleurEntreprise: '' };
        }
        if (s.entrepriseCiblee) { dossier.rechercheCandidature.entreprise = s.entrepriseCiblee; }
        if (s.siteEntreprise) { dossier.rechercheCandidature.site = s.siteEntreprise; }
        if (s.offreEmploi) { dossier.rechercheCandidature.lienOffre = s.offreEmploi; }
        if (s.typeStructure) {
          dossier.rechercheCandidature.typeStructure = (s.typeStructure === 'Autre' && s.typeStructureAutre) ? s.typeStructureAutre : s.typeStructure;
        }
      }
      var texteCv = etat.cvTexte;

      // Mode 'reformuler' : ne PAS passer par structurerTexteExistant()
      // (extraction-cv.md + parcours guide). Le CV relu part vers la page
      // UNIQUE 'echange' (choix de l'assistant + collage de la reponse),
      // puis l'ecran "Verifier".
      if (_prepLEMode === 'reformuler') {
        _prepLEEcran = 'echange';
        if (typeof trackEvenement === 'function') { trackEvenement('reformuler_cv_vers_assistant'); }
        naviguerVers('reformuler-cv');
        return;
      }

      // TACHE (audit de stabilisation, 2026-09-12, finding 7) : l'etat
      // disait 'intro' des l'ouverture du wizard alors que l'ecran reellement
      // visible en dessous reste 'depot' (le wizard se ferme sans re-rendre
      // la page en dessous, voir onRetourEtape1 plus haut) -- fragilite sans
      // bug constate, corrigee par coherence etat/DOM. Remettre a neuf pour
      // une eventuelle prochaine entree n'est de toute facon pas necessaire
      // ici : chaque clic sur une tuile de "Mes documents" (ouvrirCarteAccueil)
      // reinitialise deja _prepLEEcran = 'intro' avant de naviguer.
      // structurerTexteExistant() ouvre le wizard a l'etape 3 (choix
      // assistant + import extraction-cv.md).
      // TACHE (retour utilisateur 2026-09-16, "pas de fenetre nulle part,
      // integre a la page -- regarde ce qui a deja ete fait, inspire-toi
      // de ca") : meme geste que 'reformuler' juste au-dessus -- ne passe
      // plus par structurerTexteExistant()/ouvrirAssistantDepotCV() (le
      // wizard en fenetre, garde tel quel pour ses AUTRES appelants :
      // assurerCVStructure(), utilisee par Bilan/ATS/Coherence). Le CV
      // relu part vers la page 'echange' dediee a 'pret'/'maj'
      // (_prepLERendreEchange(), meme patron que _reformulerCvRendreEchange()
      // : choix de l'assistant puis collage de la reponse, sur cette meme
      // page), puis l'ecran 'valider' (_prepLERendreValider(), meme ecran
      // de validation categorisee qu'avant -- comparerDonnees()/
      // genererEcranValidationImport()/fusionnerDonnees(), simplement
      // rendu ICI plutot que dans une fenetre).
      _prepLEEcran = 'echange';
      if (typeof trackEvenement === 'function') {
        trackEvenement(_prepLEMode === 'maj' ? 'mettre_a_jour_cv_vers_assistant' : 'preparer_lettre_entretien_vers_assistant');
      }
      naviguerVers(_prepLEMode === 'maj' ? 'mettre-a-jour-cv' : 'preparer-lettre-entretien');
    });
  }
}

// TACHE (retour utilisateur 2026-09-16) : destination commune une fois la
// structuration terminee pour 'pret'/'maj' -- appelee par le bouton
// Continuer de _prepLERendreEchange() une fois l'import applique. Reprend
// a l'identique l'ancien onTerminer de structurerTexteExistant() (meme
// ecritures, meme destination), seul le point d'appel change.
function _prepLETerminerStructuration() {
  var modeParcours = _prepLEMode;
  dossier.modeCreation = modeParcours;
  // TACHE (retour utilisateur 2026-09-15, "pas de lien entre le CV et les
  // autres documents") : (re)entrer en maj/reformuler du CV redevient le
  // document actif -- evite qu'un dernierDocumentPrepare reste bloque sur
  // 'lettre'/'entretien' d'un passage precedent et masque a tort des
  // reglages propres au CV (ex. couleur entreprise, voir
  // contenuCouleurEntrepriseCandidature() dans js/app.js). 'pret' ne
  // touche jamais au CV (aucune regeneration Composeur) : exclu.
  if (modeParcours !== 'pret') { dossier.dernierDocumentPrepare = 'cv'; }
  // TACHE (retour utilisateur 2026-09-16, regression reelle corrigee en
  // urgence : "toute la page objectif a disparu") : la destination reste
  // 'objectif' (comportement d'origine, jamais change ici) -- "Vos
  // informations" (pageProjet(), route 'projet') reste atteignable
  // NORMALEMENT depuis la suite du parcours (navigation habituelle),
  // jamais en sautant "Votre objectif" (les 6 cartes de candidature),
  // etape necessaire, jamais redondante avec "Vos informations".
  naviguerVers('objectif');
}
function _prepLERetourDepot() {
  _prepLEEcran = 'depot';
  if (typeof naviguerVers === 'function') { naviguerVers(_prepLEMode === 'maj' ? 'mettre-a-jour-cv' : 'preparer-lettre-entretien'); }
}

// ---------- Ecran UNIQUE "pret"/"maj" : choix assistant + collage -------
// TACHE (retour utilisateur 2026-09-16, "pas de fenetre nulle part, integre
// a la page") : meme patron EXACT que _reformulerCvRendreEchange() plus
// haut dans ce fichier (deja valide) -- une seule page, deux blocs
// deplies, aucune fenetre modale. Seules differences : le prompt
// (extraction-cv.md via promptCache(), pas reformuler-cv.md) et la suite
// (ecran 'valider' -- categories a cocher -- au lieu de 'verifier' -- 2
// propositions a comparer -- la reponse d'extraction-cv.md n'a pas cette
// forme).
function _prepLERendreEchange() {
  if (typeof _intervalleDecompteIA !== 'undefined') { clearInterval(_intervalleDecompteIA); }
  var estMajEchange = (_prepLEMode === 'maj');
  var navEtapesEchange = estMajEchange ? MAJ_CV_NAV_ETAPES : PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES;
  var assistantChoisi = !!_etatTransitionIA;
  var etapeBarre = assistantChoisi ? 2 : 1;

  // ----- Bloc A : choix de l'assistant -----
  var blocA = assistantChoisi
    ? '<details class="bloc-depli bd-ok" id="prepLEEchangeBlocA">' +
      '<summary><span class="preparer-num">1</span><span class="preparer-titre">Votre assistant</span>' +
      '<span class="pilule-etat pe-ok">' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="preparer-detail">Le texte à copier a été préparé pour <strong>' + echapperAttribut(_etatTransitionIA.nomAssistant) + '</strong>.</p>' +
      '<button type="button" id="btnPrepLEChangerAssistant" class="btn btn-outline-secondary btn-sm">Choisir un autre assistant</button>' +
      '</div></details>'
    : '<details class="bloc-depli" id="prepLEEchangeBlocA" open>' +
      '<summary><span class="preparer-num">1</span><span class="preparer-titre">Choisissez votre assistant</span>' +
      '<span class="pilule-etat pe-attente">À choisir</span></summary>' +
      '<div class="bloc-depli-corps">' +
      '<p class="text-muted small mb-3">Cliquez sur un assistant. L’application prépare et copie tout pour vous, puis l’ouvre dans un nouvel onglet.</p>' +
      htmlChoixAssistantBilanCorps({
        idErreur: 'prepLEErreurChoixIA', attrAssistant: 'data-assistant-prep-le',
        etapes: ETAPES_DETAIL_CHOIX_IA,
        texteConfidentialite: 'Votre CV a déjà été relu et masqué au moment du dépôt. Rien d’autre n’est transmis avant que vous choisissiez un assistant.'
      }) +
      '</div></details>';

  // ----- Bloc B : collage de la reponse -----
  var blocB = assistantChoisi
    ? '<details class="bloc-depli" id="prepLEEchangeBlocB" open>' +
      '<summary><span class="preparer-num">2</span><span class="preparer-titre">Collez la réponse de l’assistant</span>' +
      '<span class="pilule-etat pe-info">À faire</span></summary>' +
      '<div class="bloc-depli-corps">' +
      htmlBanniereTransitionIA() +
      '<p class="text-muted small">Une fois que l’assistant vous a renvoyé son analyse, ' +
      'copiez <strong>toute sa réponse</strong>, puis revenez ici.</p>' +
      htmlCollageInstantane('PrepLE',
        '<div class="d-flex gap-2 mb-2 mt-2">' +
        '<button type="button" id="btnPrepLEVersValider" class="btn btn-primary btn-lg" disabled>&#8594; Continuer</button>' +
        '<button type="button" id="btnEffacerRecollerPrepLE" class="btn btn-outline-secondary">Effacer et recoller</button>' +
        '</div>') +
      '<div id="messagePrepLECollage" class="small mb-2"></div>' +
      '</div></details>'
    : '<details class="bloc-depli" id="prepLEEchangeBlocB">' +
      '<summary><span class="preparer-num">2</span><span class="preparer-titre">Collez la réponse de l’assistant</span>' +
      '<span class="pilule-etat pe-attente">Choisissez d’abord un assistant</span></summary>' +
      '<div class="bloc-depli-corps"><p class="preparer-detail">Cette partie se débloque dès que vous avez choisi un assistant ci-dessus.</p></div></details>';

  var titrePage = estMajEchange ? 'Préparer la mise à jour' : 'Préparer votre candidature';
  var logoPage = estMajEchange ? 'bi-pencil-square' : 'bi-file-earmark-check';
  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer">' +
    barreEtapesModule(navEtapesEchange, etapeBarre) + _prepLEBandeRevoirSurEcran(estMajEchange ? 'mettre-a-jour-cv' : 'preparer-lettre-entretien') +
    '<div class="text-center"><h1><i class="bi ' + logoPage + '"></i> ' + titrePage + '</h1>' +
    '<p class="sousTitre">Votre CV part chez l’assistant de votre choix, puis vous revenez coller sa réponse ici. Tout se passe sur cette page.</p></div>' +
    blocA + blocB +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_prepLERetourDepot()' }) + '</div>';
  if (typeof trackEvenement === 'function') { trackEvenement((estMajEchange ? 'mettre_a_jour_cv' : 'preparer_lettre_entretien') + '_echange_affiche', { assistantChoisi: assistantChoisi }); }

  // ----- Cablage bloc A -----
  document.querySelectorAll('[data-assistant-prep-le]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantPrepLe; })[0];
      if (!assistant) { return; }
      if (typeof trackEvenement === 'function') { trackEvenement((estMajEchange ? 'mettre_a_jour_cv' : 'preparer_lettre_entretien') + '_assistant_choisi', { assistant: assistant.id }); }
      // TACHE (retour Denis 2026-09-19, point 1 du chantier "Reformuler et
      // presenter mon CV" -- "cette fenetre doit apparaitre partout") :
      // meme defaut trouve ici, MEME fonction partagee que le bloc A de
      // reformuler-cv (_reformulerCvRendreEchange()) -- corrige a l'identique,
      // meme raisonnement (voir son commentaire juste au-dessus dans ce
      // fichier). Couvre "Mettre a jour mon CV" ET "Preparer ma lettre et
      // mon entretien", qui partagent cette meme fonction.
      if (typeof ouvrirFenetreAssistantIA !== 'function') { return; }
      ouvrirFenetreAssistantIA({
        nomAssistant: assistant.nom,
        idAssistant: assistant.id,
        urlAssistant: assistant.url,
        construireTexteACopier: function () { return promptCache('extraction-cv', (_prepLEEtat && _prepLEEtat.cvTexte) || ''); },
        onApresValidation: function (urlAssistant, nomAssistant) {
          _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
          _prepLERendreEchange();
        }
      });
    });
  });
  var btnChangerAssistant = document.getElementById('btnPrepLEChangerAssistant');
  if (btnChangerAssistant) {
    btnChangerAssistant.addEventListener('click', function () {
      if (typeof _intervalleDecompteIA !== 'undefined' && _intervalleDecompteIA) { clearInterval(_intervalleDecompteIA); }
      _etatTransitionIA = null;
      _prepLERendreEchange();
    });
  }

  if (!assistantChoisi) { return; }

  // ----- Cablage bloc B : transition + collage -----
  var messagePrepLE = document.getElementById('messagePrepLECollage');
  var btnCollerPrepLE = document.getElementById('btnCollerAutoPrepLE');
  var texteBtnCollerPrepLE = document.getElementById('texteBtnCollerAutoPrepLE');

  if (_etatTransitionIA && btnCollerPrepLE) {
    if (_etatTransitionIA.phase === 'revenu') {
      btnCollerPrepLE.disabled = false;
      btnCollerPrepLE.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
      btnCollerPrepLE.classList.add('pulse-collage-retour');
      if (texteBtnCollerPrepLE) { texteBtnCollerPrepLE.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
    } else {
      btnCollerPrepLE.disabled = true;
      btnCollerPrepLE.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
      btnCollerPrepLE.classList.add('rond-collage-desactive');
      if (texteBtnCollerPrepLE) { texteBtnCollerPrepLE.textContent = 'Ce bouton s’activera à votre retour.'; }
    }

    var ouvrirAssistantEnAttentePrepLE = function () {
      if (!document.getElementById('btnCollerAutoPrepLE')) { clearInterval(_intervalleDecompteIA); return; }
      // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
      // (js/app.js) -- meme correctif, tous les parcours.
      recopierTexteAssistantPuisOuvrir(function () {
        var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
        _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
        if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') { trackEvenement('prep_le_popup_bloque'); }
        _prepLERendreEchange();
      });
    };

    if (_etatTransitionIA.phase === 'decompte') {
      var btnMaintenantPrepLE = document.getElementById('btnContinuerMaintenantIA');
      if (btnMaintenantPrepLE) { btnMaintenantPrepLE.addEventListener('click', function () { clearInterval(_intervalleDecompteIA); ouvrirAssistantEnAttentePrepLE(); }); }
      _intervalleDecompteIA = setInterval(function () {
        _etatTransitionIA.secondesRestantes -= 1;
        var compteurPrepLE = document.getElementById('compteurDecompteIA');
        if (compteurPrepLE) { compteurPrepLE.textContent = _etatTransitionIA.secondesRestantes; }
        if (_etatTransitionIA.secondesRestantes <= 0) { clearInterval(_intervalleDecompteIA); ouvrirAssistantEnAttentePrepLE(); }
      }, 1000);
    } else if (_etatTransitionIA.phase === 'bloque') {
      var btnBloquePrepLE = document.getElementById('btnOuvrirBloqueIA');
      if (btnBloquePrepLE) { btnBloquePrepLE.addEventListener('click', ouvrirAssistantEnAttentePrepLE); }
    } else if (_etatTransitionIA.phase === 'ouvert') {
      var btnRetourPrepLE = document.getElementById('btnJeSuisDeRetourIA');
      if (btnRetourPrepLE) { btnRetourPrepLE.addEventListener('click', function () { _etatTransitionIA.phase = 'revenu'; _prepLERendreEchange(); }); }
      var btnRouvrirPrepLE = document.getElementById('btnRouvrirSiteIA');
      if (btnRouvrirPrepLE) { btnRouvrirPrepLE.addEventListener('click', ouvrirAssistantEnAttentePrepLE); }
    }
  }

  var btnVersValider = document.getElementById('btnPrepLEVersValider');
  activerCollageInstantane({
    idZoneAuto: 'zoneCollageAutoPrepLE', idZoneApercu: 'zoneApercuCollagePrepLE',
    idTextarea: 'texteCollagePrepLE', idBoutonColler: 'btnCollerAutoPrepLE',
    idBoutonCollerManuel: 'btnCollerManuelPrepLE', idBoutonEffacerRecoller: 'btnEffacerRecollerPrepLE',
    idBoutonImporter: 'btnPrepLEVersValider',
    onErreur: function (msg) { messagePrepLE.style.color = 'var(--danger)'; messagePrepLE.textContent = '⚠️ ' + msg; },
    onEffacer: function () { messagePrepLE.textContent = ''; if (btnVersValider) { btnVersValider.disabled = true; } },
    onCollerManuel: function () { messagePrepLE.textContent = ''; },
    onSucces: function (texte, estAjout) {
      _prepLEEtat.reponseAssistant = texte;
      _etatTransitionIA = null;
      if (btnVersValider) { btnVersValider.disabled = false; }
      messagePrepLE.style.color = 'var(--success-strong)';
      messagePrepLE.textContent = estAjout
        ? '✅ Morceau suivant ajouté à la suite. Copiez le morceau suivant puis recliquez, ou cliquez Continuer si c’était le dernier.'
        : '✅ Réponse importée. Si la réponse fait plusieurs morceaux, copiez le suivant puis cliquez « Coller un morceau supplémentaire ».';
    }
  });

  if (btnVersValider) {
    btnVersValider.addEventListener('click', function () {
      var t = (document.getElementById('texteCollagePrepLE') || {}).value || _prepLEEtat.reponseAssistant || '';
      if (!t.trim()) {
        messagePrepLE.style.color = 'var(--danger)';
        messagePrepLE.textContent = '⚠️ Collez d’abord la réponse de l’assistant dans la zone ci-dessus.';
        return;
      }
      var resultatImport = analyserReponseImport(t, SPECIFICATION_IMPORT);
      if (!resultatImport.succes) {
        if (typeof trackEvenement === 'function') { trackEvenement('erreur_import', { document: 'cv', contexte: 'prep-le' }); }
        messagePrepLE.style.color = 'var(--danger)';
        messagePrepLE.textContent = '⚠️ ' + resultatImport.erreur;
        return;
      }
      // TACHE (retour utilisateur 2026-09-16, "cet ecran de validation n'a
      // aucune plus-value... enleve-le completement") : plus d'ecran de
      // validation categorisee intermediaire -- les informations
      // reconnues sont appliquees directement au dossier (fusionnerDonnees()
      // avec une acceptation complete, voir _decisionsAccepterTout() plus
      // bas), puis la personne atterrit sur "Vos informations" (deja la
      // bonne page pour verifier/corriger/supprimer, voir
      // _prepLETerminerStructuration()).
      var resultatComparaison = comparerDonnees(dossier, resultatImport.valeurs, SPECIFICATION_IMPORT);
      var decisions = _decisionsAccepterTout(resultatComparaison, SPECIFICATION_IMPORT);
      fusionnerDonnees(dossier, decisions, SPECIFICATION_IMPORT);
      if (typeof trackEvenement === 'function') { trackEvenement((estMajEchange ? 'mettre_a_jour_cv' : 'preparer_lettre_entretien') + '_import_applique'); }
      _prepLETerminerStructuration();
    });
  }
}
// TACHE (retour utilisateur 2026-09-16) : equivalent de
// lireDecisionsValidationImport() (js/app.js), mais SANS ecran a lire --
// accepte tout ce que comparerDonnees() a trouve (nouveaux ET doublons
// probables, fusionnerDonnees() re-verifie de toute facon l'existence
// reelle avant d'ajouter, voir texteExisteDeja()/estDoublonProbable()).
// Seule exception : un CHAMP en conflit (deja rempli dans le dossier avec
// une valeur DIFFERENTE de celle importee) n'est jamais ecrase
// automatiquement -- la personne le corrige elle-meme sur "Vos
// informations" si elle prefere la version importee, jamais un
// remplacement silencieux d'une valeur deja saisie a la main.
function _decisionsAccepterTout(resultatComparaison, specification) {
  var decisions = {};
  specification.forEach(function (spec) {
    var res = resultatComparaison[spec.cle];
    if (!res) { return; }
    if (spec.type === 'liste-textes' || spec.type === 'liste-objets') {
      decisions[spec.cle] = { elementsAAjouter: (res.nouveaux || []).concat(res.doublonsProbables || []) };
    } else if (spec.type === 'objet') {
      var champsAAppliquer = {};
      (res.nouveaux || []).forEach(function (n) { champsAAppliquer[n.champ] = n.valeur; });
      decisions[spec.cle] = { champsAAppliquer: champsAAppliquer };
    } else if (spec.type === 'objet-de-listes-textes') {
      var sousDecisions = {};
      spec.champs.forEach(function (sousChamp) {
        var sousRes = res[sousChamp] || {};
        sousDecisions[sousChamp] = { elementsAAjouter: (sousRes.nouveaux || []).concat(sousRes.doublonsProbables || []) };
      });
      decisions[spec.cle] = sousDecisions;
    }
  });
  return decisions;
}

// TACHE (migration Design System - Phase 2, chantier "metiers.js", 2e
// migration) : devient une recette qui appelle la primitive
// ouvrirFenetreERIP(). Le selecteur des tuiles, auparavant scope par l'id
// de la fenetre elle-meme (#choixPreparationAccueil, qui disparait avec la
// migration), est desormais scope a l'element racine retourne par la
// primitive -- meme principe que toutes les recettes deja migrees.
function fermerChoixPreparationAccueil() {
  fermerFenetreERIP();
}

// TACHE (retour Denis, 2026-08-31 ; chantier "Reorganisation de la page
// d'accueil", Bloc 2 -- docs/CHANTIER_ACCUEIL_DECISIONS_2026-08-31.md) :
// "Retour" depuis la page de presentation d'un module ne mene PAS a
// l'accueil nu (il y a deja un bouton "Accueil" pour ca) mais rouvre le
// PANNEAU DE LA CARTE d'ou le module a ete choisi. A cabler sur
// options.onclickPrecedent des barres de navigation des pages d'intro de
// module, jamais sur les ecrans de travail (eux repassent par la
// presentation du module -- patron D5d).
// `id` : l'une des 6 cartes de l'accueil ('mesdocuments' | 'preparer' |
// 'boiteaoutils' | 'analyse' | 'informe' | 'orientation'), dont on rouvre le
// panneau ; ou 'accueil' pour rester simplement sur l'accueil.
function retourVersCarteAccueil(id) {
  if (typeof naviguerVers === 'function') { naviguerVers('cv'); }
  var cartes = ['mesdocuments', 'preparer', 'boiteaoutils', 'analyse', 'informe', 'orientation'];
  if (cartes.indexOf(id) !== -1) { ouvrirCarteAccueil(id); }
}
// Compat : anciens appels (modules de la carte "Boite a outils" : Reperes,
// Carnet, Lexique, Decouverte). Coherence et Bilan ont ete bascules sur
// retourVersCarteAccueil('analyse') directement.
function retourVersBoiteAOutils() { retourVersCarteAccueil('boiteaoutils'); }

// Ouvre le panneau d'une carte de l'accueil (fenetre ERIP + sous-cartes).
// Les 6 cartes ont le MEME panneau, meme "Se tenir informe" et "Vous hesitez
// encore ?" qui n'ont qu'une sous-carte aujourd'hui (base stable, prete pour
// d'autres modules -- decision Denis 2026-08-31). Remplace l'ancienne fenetre
// unique "Preparer ma candidature" a 12 tuiles : chaque tuile est desormais
// rangee dans le panneau de sa carte (redistribution
// CHANTIER_ACCUEIL_DECISIONS_2026-08-31.md §5). Aucune logique de parcours
// dupliquee : chaque sous-carte appelle le point d'entree deja existant.
// TACHE (relais pt 7, textes valides par Denis 2026-08-31 ; structure et
// distances reprises TELLES QUELLES de la maquette validee) : contenu du
// petit "i" de chaque panneau de carte. Une phrase d'intro + une ligne par
// sous-carte, sous un angle DIFFERENT de la description de la sous-carte
// (jamais une redite). Chaque ligne : [libelle, icone Bootstrap, texte].
// TACHE (refonte "Mes documents", Phase 1 bloc 1.0, 2026-09-01, plan
// docs/PLAN_REFONTE_MES_DOCUMENTS_2026-09-01.md) : SOURCE UNIQUE des 3
// parcours CV de la carte "Mes documents". Avant, les 3 libelles etaient
// recopies a la main dans 3 endroits (INFOS_CARTE_ACCUEIL ci-dessous,
// CONFIGS.mesdocuments dans ouvrirCarteAccueil(), et la liste de puces
// passee a htmlCarteAccueil() dans js/app.js) -- toute renommage devait
// etre fait 3 fois. Desormais un seul tableau, lu par les 3.
//   btnId       : id du bouton de la tuile (cable dans ouvrirCarteAccueil)
//   icone       : classe Bootstrap Icons, la MEME pour la tuile et le "i"
//   titre       : libelle affiche (tuile + puce + "i")
//   description : phrase de la tuile
//   infobulle   : ligne du "i", sous un angle DIFFERENT de la description
// Ordre voulu par Denis (2026-09-01) : les deux parcours qui agissent sur le
// CV d'abord (Creer, Mettre a jour), puis "la suite" une fois le CV pret.
var MES_DOCUMENTS_PARCOURS = [
  {
    btnId: 'btnCarteAccueilCvNouveau',
    icone: 'bi-stars',
    titre: 'Créer un nouveau CV',
    description: 'Construisez votre CV : il vous permettra ensuite de produire vos autres documents.',
    infobulle: 'Quand vous n’avez pas encore de CV, ou que vous préférez repartir de zéro.'
  },
  {
    // TACHE (chantier « Reformuler et presenter mon CV », etape 1, 2026-09-07,
    // docs/CHANTIER_REFORMULER_ET_PRESENTER_CV.md) : 4e parcours de « Mes
    // documents », pour un CV complet mais mal presente. Reutilise le tuyau
    // de « Mettre a jour mon CV » (_prepLEMode = 'reformuler').
    btnId: 'btnCarteAccueilCvReformuler',
    icone: 'bi-brush',
    titre: 'Reformuler et présenter mon CV',
    description: 'Votre CV est complet mais mal présenté : on le reformule proprement et on adapte le vocabulaire au poste visé, sans toucher au fond.',
    infobulle: 'Quand votre CV est complet et juste, mais mal présenté.'
  },
  {
    btnId: 'btnCarteAccueilCvMaj',
    icone: 'bi-pencil-square',
    titre: 'Mettre à jour mon CV',
    description: 'Déposez votre CV : mettez à jour son contenu, puis préparez vos autres documents de candidature.',
    infobulle: 'Quand vous avez du contenu à corriger, dater ou compléter.'
  },
  {
    btnId: 'btnCarteAccueilCvPret',
    icone: 'bi-file-earmark-check',
    titre: 'Préparer ma lettre et mon entretien',
    description: 'Vous avez déjà un CV. On s’en sert directement comme base pour produire votre lettre de motivation et une préparation d’entretien, rapidement et sans rien vous faire ressaisir.',
    infobulle: 'Quand votre CV est prêt et que vous voulez aller vite vers la lettre et l’entretien.'
  }
];

var INFOS_CARTE_ACCUEIL = {
  mesdocuments: {
    // TACHE (chantier « Reformuler et presenter mon CV », etape 1 ; option A
    // 2026-09-07 apres retour Denis : la bulle disait deux fois le nom de
    // chaque module) : structure alignee sur les autres cartes -- une phrase
    // d'intro, puis une ligne par parcours (infobulle = "quand le choisir").
    intro: 'Quatre parcours, selon l’état de votre CV et ce que vous voulez en faire.',
    items: MES_DOCUMENTS_PARCOURS.map(function (p) { return [p.titre, p.icone, p.infobulle]; })
  },
  preparer: {
    intro: 'De quoi arriver plus tranquille le jour de la rencontre. Aucun CV n’est demandé pour commencer.',
    items: [
      ['Co-construire ma lettre', 'bi-pen', 'Vous n’êtes jamais seul devant la page : l’assistant propose, vous décidez.'],
      ['Préparer un entretien', 'bi-mic', 'Vous vous exercez à voix haute ou au clavier, autant de fois que vous voulez.'],
      ['Un regard sur mon CV', 'bi-image', 'Vous verrez ce qui ressort en premier, et ce qui peut faire hésiter.']
    ]
  },
  boiteaoutils: {
    intro: 'Des outils que vous ouvrez quand vous en avez besoin, sans ordre imposé et sans que rien ne soit noté.',
    items: [
      ['Découvrir mes compétences', 'bi-stars', 'Utile même si vous n’avez jamais eu de CV ni d’emploi déclaré.'],
      ['Mes Repères', 'bi-bookmark-star', 'Pour ne pas perdre une pensée juste parce qu’elle est venue au mauvais moment.'],
      ['Mon Carnet', 'bi-journal-text', 'Vous écrivez d’abord ; vous verrez plus tard ce que vous en faites, ou rien.'],
      ['Lexique', 'bi-book', 'Rien à préparer : vous cherchez un mot au moment où il vous arrête.']
    ]
  },
  analyse: {
    intro: 'Un avis extérieur sur votre candidature avant de l’envoyer. Ces outils demandent un CV déjà prêt.',
    items: [
      ['Analyser ma candidature', 'bi-graph-up', 'L’assistant que vous choisissez ; le copier-coller reste manuel, rien ne part tout seul.'],
      ['Cohérence de mon dossier', 'bi-check2-circle', 'Repère les endroits où vos documents ne disent pas tout à fait la même chose.'],
      ['Les mots de votre CV (ATS)', 'bi-card-checklist', 'Comparez le vocabulaire de votre CV à celui d’un métier ou d’une offre. Ni un logiciel de tri, ni une note : la même vérification, en clair.']
    ]
  },
  informe: {
    intro: 'Un aperçu de ce qui bouge dans l’emploi et la formation, sans le stress d’un fil d’actualités.',
    items: [
      ['Comprendre le cadre', 'bi-newspaper', 'Organisé par rayon (emploi, logement, mobilité, droits...), avec une recherche à affiner si vous ne savez pas par où commencer.'],
      ['Comprendre les chiffres', 'bi-bar-chart', 'Le chômage, l’emploi, les métiers qui recrutent près de chez vous : des chiffres officiels, expliqués simplement, datés.']
    ]
  },
  orientation: {
    intro: 'Pour quand le projet n’est pas encore clair : de quoi poser les choses et décider à son rythme.',
    items: [
      ['Comparer mes pistes', 'bi-signpost-split', 'Deux ou trois pistes, ou deux situations, mises côte à côte pour choisir vous-même.']
    ]
  }
};

// Le declencheur "i", place dans le titre de la fenetre (juste apres le nom
// de la carte, comme la maquette). La bulle, elle, est rendue dans le corps
// (position: fixed, placee en JS depuis le declencheur -- comme la maquette).
function htmlDeclencheurInfoCarte(id) {
  if (!INFOS_CARTE_ACCUEIL[id]) { return ''; }
  return ' <button type="button" class="carte-accueil-info-trigger" id="btnInfoCarteAccueil" ' +
    'aria-expanded="false" aria-label="En savoir plus sur cette carte"><i class="bi bi-info-circle"></i></button>';
}
function htmlBulleInfoCarte(id) {
  var info = INFOS_CARTE_ACCUEIL[id];
  if (!info) { return ''; }
  var items = info.items.map(function (it) {
    return '<div class="carte-accueil-info-item">' +
      '<i class="bi ' + it[1] + '"></i>' +
      '<span><strong>' + it[0] + '</strong><span>' + it[2] + '</span></span>' +
      '</div>';
  }).join('');
  return '<div class="carte-accueil-info-bulle" id="bulleInfoCarteAccueil">' +
    '<button type="button" class="carte-accueil-info-fermer" id="btnFermerInfoCarteAccueil" aria-label="Fermer">&#10005;</button>' +
    '<p>' + info.intro + '</p>' + items +
    '</div>';
}

// Cablage du "i" : ouverture au survol ET au clic (le clic "epingle" la
// bulle -- elle reste ouverte quand la souris repart ; tactile = clic).
// Bulle position: fixed, placee sous le declencheur, replacee au
// defilement/redimensionnement. Modele : maquette validee, jamais reinvente.
function brancherInfoCarteAccueil(overlay) {
  var trigger = overlay.querySelector('#btnInfoCarteAccueil');
  var bulle = overlay.querySelector('#bulleInfoCarteAccueil');
  if (!trigger || !bulle) { return; }
  var epinglee = false;

  // TACHE : la boite ERIP porte un `transform` (animation d'entree) -- un
  // `position: fixed` a l'interieur s'ancrerait a la boite, pas a l'ecran.
  // On sort donc la bulle dans <body> pour qu'elle soit vraiment fixe
  // par-dessus toute la page (comme la maquette). Nettoyage de l'orpheline
  // precedente, puis retrait quand la fenetre se ferme.
  var orpheline = document.getElementById('bulleInfoCarteAccueilBody');
  if (orpheline) { orpheline.remove(); }
  bulle.id = 'bulleInfoCarteAccueilBody';
  document.body.appendChild(bulle);
  function nettoyer() { if (bulle && bulle.parentNode) { bulle.remove(); } }
  var btnFermerFenetre = overlay.querySelector('#fenetreERIPFermerBtn');
  if (btnFermerFenetre) { btnFermerFenetre.addEventListener('click', nettoyer); }
  var btnRetour = overlay.querySelector('#btnRetourCarteAccueil');
  if (btnRetour) { btnRetour.addEventListener('click', nettoyer); }

  function positionner() {
    var r = trigger.getBoundingClientRect();
    var largeur = bulle.offsetWidth || 300;
    var gauche = Math.min(r.left, window.innerWidth - largeur - 12);
    bulle.style.left = Math.max(12, gauche) + 'px';
    // La bulle ne doit jamais deborder sous le bas de l'ecran : sinon son
    // bas (et sa zone de defilement) devient inatteignable, surtout au
    // toucher. On place sous le declencheur quand il y a assez de place,
    // sinon on l'ancre en haut de l'ecran, et on borne sa hauteur a la
    // place reellement disponible (le contenu defile a l'interieur).
    var margeBas = 16;
    var sousLeDeclencheur = r.bottom + 8;
    var placeEnDessous = window.innerHeight - sousLeDeclencheur - margeBas;
    if (placeEnDessous >= 200) {
      bulle.style.top = sousLeDeclencheur + 'px';
      bulle.style.maxHeight = placeEnDessous + 'px';
    } else {
      var hautFixe = 64;
      bulle.style.top = hautFixe + 'px';
      bulle.style.maxHeight = (window.innerHeight - hautFixe - margeBas) + 'px';
    }
  }
  function ouvrir() {
    bulle.classList.add('ouverte');
    positionner();
    trigger.setAttribute('aria-expanded', 'true');
    trigger.classList.remove('carte-accueil-info-pulse');
  }
  function fermer() {
    bulle.classList.remove('ouverte');
    trigger.setAttribute('aria-expanded', 'false');
    epinglee = false;
  }

  trigger.addEventListener('mouseenter', ouvrir);
  trigger.addEventListener('mouseleave', function () { if (!epinglee) { fermer(); } });
  trigger.addEventListener('click', function (e) {
    e.stopPropagation();
    epinglee = !epinglee;
    if (epinglee) { ouvrir(); } else { fermer(); }
  });
  bulle.addEventListener('click', function (e) { e.stopPropagation(); });
  var fermerBtn = bulle.querySelector('#btnFermerInfoCarteAccueil');
  if (fermerBtn) { fermerBtn.addEventListener('click', function (e) { e.stopPropagation(); fermer(); }); }
  // Clic n'importe ou ailleurs (dans la fenetre OU sur le fond) -> ferme la bulle.
  document.addEventListener('click', function () { if (bulle.classList.contains('ouverte')) { fermer(); } });
  overlay.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && bulle.classList.contains('ouverte')) { e.stopPropagation(); fermer(); }
  }, true);
  window.addEventListener('resize', function () { if (bulle.classList.contains('ouverte')) { positionner(); } });
  var corps = overlay.querySelector('.fenetre-erip-corps');
  if (corps) { corps.addEventListener('scroll', function () { if (bulle.classList.contains('ouverte')) { positionner(); } }, { passive: true }); }

  // Relais pt 8 : le "i" d'un panneau ouvert passe devant les icones
  // persistantes -> on coupe leur pulse (coordinateur js/app.js) tant que
  // le panneau est la.
  if (typeof _pulsePersistantViderTout === 'function') { _pulsePersistantViderTout(); }
  // Pulse d'invitation une seule fois a l'ouverture du panneau (accent).
  void trigger.offsetWidth;
  trigger.classList.add('carte-accueil-info-pulse');
}

function ouvrirCarteAccueil(id) {
  function tuile(btnId, icone, label, description) {
    // `icone` : soit une classe Bootstrap Icons ("bi-..."), soit une entite
    // HTML / un emoji objet (ex. l'ancre du module Reperes, absente du jeu
    // d'icones auto-heberge). LECONS 9.9 : on garde l'icone d'identite reelle
    // de chaque module.
    var htmlIcone = (icone.indexOf('bi-') === 0)
      ? '<i class="bi ' + icone + '"></i>'
      : '<span class="sous-carte-accueil-emoji" aria-hidden="true">' + icone + '</span>';
    return '<button type="button" id="' + btnId + '" class="sous-carte-accueil">' +
      htmlIcone +
      '<strong>' + label + '</strong>' +
      '<span>' + description + '</span>' +
    '</button>';
  }
  function track(outil) {
    if (typeof trackEvenement === 'function') { trackEvenement('outil_utilise', { outil: outil }); }
  }
  function brancher(btnId, fn) {
    var b = document.getElementById(btnId);
    if (b) { b.addEventListener('click', fn); }
  }
  // TACHE (module Reperes, etape 7 -- signal de decouverte unique) : meme
  // mecanisme EXACT qu'avant (flag localStorage, jamais redeclenche une fois
  // vu). Vit ici : c'est l'orchestrateur qui decide de signaler l'existence
  // d'un module, jamais le module qui le reclame.
  function pulseDecouverteUneFois(cle, btnId) {
    try {
      if (localStorage.getItem(cle)) { return; }
      var b = document.getElementById(btnId);
      if (!b) { return; }
      // Un seul pulse a la fois (relais pt 8) : si une autre sous-carte de
      // ce panneau pulse deja (1re ouverture avec plusieurs modules
      // nouveaux), on ne consomme PAS le drapeau -- ce module sera signale
      // a la prochaine ouverture, un module a la fois.
      if (document.querySelector('.sous-carte-accueil.aide-pulse-repere')) { return; }
      localStorage.setItem(cle, '1');
      b.classList.add('aide-pulse-repere');
    } catch (e) { /* pas grave */ }
  }

  // --- Les 6 cartes ouvrent le MEME panneau (fenetre ERIP + sous-cartes),
  // meme quand il n'y a qu'une seule sous-carte : Denis veut une base
  // identique et stable, prete a accueillir d'autres modules sans tout
  // reconfigurer (decision 2026-08-31). ---
  var CONFIGS = {
    mesdocuments: { titre: '<i class="bi bi-folder2-open titre-icone-accent"></i> Mes documents',
      tuiles: MES_DOCUMENTS_PARCOURS.map(function (p) { return tuile(p.btnId, p.icone, p.titre, p.description); }) },
    preparer: { titre: '<i class="bi bi-person titre-icone-accent"></i> Me préparer à candidater', tuiles: [
      tuile('btnCarteAccueilLettre', 'bi-pen', 'Co-construire ma lettre',
        'Vous écrivez la lettre avec un assistant, phrase par phrase, en prenant le temps.'),
      tuile('btnCarteAccueilEntretien', 'bi-mic', 'Préparer un entretien',
        'Une séance d’entraînement : vous répondez à des questions d’entretien, à l’écrit ou à voix haute, et l’assistant réagit à vos réponses.'),
      tuile('btnCarteAccueilRegardRecruteur', 'bi-image', 'Un regard sur mon CV',
        'Anticipez le regard d’un recruteur sur votre dossier : ce qui ressort, ce qui peut faire hésiter.')
    ] },
    boiteaoutils: { titre: '<i class="bi bi-briefcase titre-icone-accent"></i> Boîte à outils', tuiles: [
      tuile('btnCarteAccueilDecouverte', 'bi-stars', 'Découvrir mes compétences',
        'Partez de ce que vous avez vécu pour en tirer un CV, même sans expérience.'),
      tuile('btnCarteAccueilReperes', 'bi-bookmark-star', 'Mes Repères',
        'Gardez les réflexions utiles de votre parcours, pour vous ou votre conseiller.'),
      tuile('btnCarteAccueilCarnet', 'bi-journal-text', 'Mon Carnet',
        'Notez librement ce qui vous passe par la tête, sans rien décider tout de suite.'),
      tuile('btnCarteAccueilLexique', 'bi-book', 'Lexique',
        'Cherchez un mot du monde du travail dès qu’il vous bloque, expliqué simplement.')
    ] },
    analyse: { titre: '<i class="bi bi-graph-up-arrow titre-icone-accent"></i> Outils d’analyse', tuiles: [
      tuile('btnCarteAccueilBilan', 'bi-graph-up', 'Analyser ma candidature',
        'Un assistant repère ce qui mérite d’être renforcé dans votre CV.'),
      tuile('btnCarteAccueilCoherence', 'bi-check2-circle', 'Cohérence de mon dossier',
        'Vérifiez que votre CV, votre lettre et votre entretien racontent la même histoire.'),
      tuile('btnCarteAccueilAts', 'bi-card-checklist', 'Les mots de votre CV (ATS)',
        'Comparez le vocabulaire de votre CV à celui d’un métier ou d’une offre. Ni un logiciel de tri, ni une note : la même vérification, en clair.')
    ] },
    informe: { titre: '<i class="bi bi-newspaper titre-icone-accent"></i> Se tenir informé', tuiles: [
      tuile('btnCarteAccueilActualites', 'bi-newspaper', 'Comprendre le cadre',
        'Des fiches courtes et des liens officiels sur l’emploi, la formation et les dispositifs, à consulter quand vous en avez besoin.'),
      tuile('btnCarteAccueilChiffres', 'bi-bar-chart', 'Comprendre les chiffres',
        'Le chômage, l’emploi, les métiers qui recrutent près de chez vous : des chiffres officiels, expliqués simplement, datés.')
    ] },
    orientation: { titre: '<i class="bi bi-signpost-split titre-icone-accent"></i> Vous hésitez encore ?', tuiles: [
      tuile('btnCarteAccueilComparerPistes', 'bi-signpost-split', 'Comparer mes pistes',
        'Mettez deux ou trois pistes, ou deux situations, côte à côte pour choisir en connaissance de cause.')
    ] }
  };
  var conf = CONFIGS[id];
  if (!conf) { return; }

  var overlay = ouvrirFenetreERIP({
    titre: conf.titre + htmlDeclencheurInfoCarte(id),
    taille: 'large',
    contenuHTML:
      htmlBulleInfoCarte(id) +
      '<div class="grille-sous-cartes-accueil">' + conf.tuiles.join('') + '</div>' +
      // TACHE (retour Denis 2026-08-31) : en plus de la croix, un vrai bouton
      // "Retour" discret (jamais plus marque que la croix), qui ramene a
      // l'accueil (le panneau est une fenetre posee dessus -> fermer suffit).
      '<div class="carte-accueil-pied">' +
      '<button type="button" class="btn-retour-carte-accueil" id="btnRetourCarteAccueil">&#8592; Retour</button>' +
      '</div>'
  });

  brancher('btnRetourCarteAccueil', function () { fermerFenetreERIP(); });
  if (overlay) { brancherInfoCarteAccueil(overlay); }

  if (id === 'informe') {
    brancher('btnCarteAccueilActualites', function () {
      track('se_tenir_informe'); fermerFenetreERIP(); naviguerVers('se-tenir-informe-intro');
    });
    brancher('btnCarteAccueilChiffres', function () {
      track('comprendre_les_chiffres'); fermerFenetreERIP(); naviguerVers('comprendre-les-chiffres-intro');
    });
    return;
  }
  if (id === 'orientation') {
    brancher('btnCarteAccueilComparerPistes', function () {
      track('aide_decision_orientation'); fermerFenetreERIP(); naviguerVers('aide-decision-intro');
    });
    return;
  }

  if (id === 'mesdocuments') {
    // TACHE (refonte "Mes documents", Phase 3a, 2026-09-02) : "Creer un
    // nouveau CV" passe par une page d'intro routee (pageCreerCv), comme
    // 'pret'/'maj' et les autres modules. Les resets (effacerSauvegarde,
    // cvAnalyse, ...) sont deplaces dans le CTA de cette intro -> ne rien
    // effacer si la personne ne fait que regarder la presentation.
    brancher('btnCarteAccueilCvNouveau', function () {
      track('creer_nouveau_cv');
      if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
      naviguerVers('creer-cv');
    });
    // TACHE (refonte "Mes documents", Phase 1 bloc 1.1, 2026-09-01) :
    // "Preparer ma lettre et mon entretien" passe desormais par une PAGE
    // d'introduction routee (pagePreparerLettreEntretien), comme les autres
    // modules -- plus d'ouverture directe de la modale. Son CTA lance
    // ouvrirAssistantDepotCV('pret') (bloc 1.2 : page "Preparer" depliante).
    // "Mettre a jour" garde l'entree directe jusqu'a sa Phase 2.
    // TACHE (retour Denis, 2026-08-31, Chantier 2+3) : deposer un CV
    // existant -> ce CV ne vient pas de Decouverte -> reset ici, au point
    // d'entree (on ne touche PAS ouvrirAssistantDepotCV, fonction partagee).
    brancher('btnCarteAccueilCvPret', function () {
      track('preparer_lettre_entretien');
      dossier.decouverteTerminee = false;
      // TACHE (retour utilisateur 2026-09-16, bug reel confirme : "je saisis
      // mon CV, je vais a l'accueil, je reviens -- aucune reprise proposee,
      // je repars de zero") : _prepLEEtat = null etait pose ICI de facon
      // INCONDITIONNELLE, a chaque clic sur cette tuile -- y compris en
      // rentrant dans le MEME parcours deja en cours, effacant le travail
      // avant meme que _prepLERendreIntro() ait pu verifier travailEnCours
      // (voir son "actionsSynthese"/_introBlocReprise, jamais atteignable
      // par ce chemin). _prepLEEtat n'est ecrit que par 'pret'/'maj'/
      // 'reformuler' (jamais par Decouverte, verifie) -- ne le reinitialiser
      // que lors d'un vrai CHANGEMENT de parcours (_prepLEMode different),
      // jamais en revenant sur celui deja en cours.
      // TACHE (retour utilisateur 2026-09-16, bug reel confirme : "voir mon
      // CV m'amene direct sur Vos documents, alors que je n'ai meme pas
      // fait le 1er passage IA") : dossier.cvAnalyse (utilise par
      // cvDisponible(), js/app.js) n'est JAMAIS ecrit par 'pret'/'maj',
      // seulement par _reformulerCvVersModele() -- un passage precedent par
      // "Reformuler" dans la MEME session le laissait a true, faisant
      // croire a tort que ce CV 'pret' etait deja entierement pret. Meme
      // garde que _prepLEEtat juste au-dessus : reset uniquement lors d'un
      // vrai changement de parcours.
      if (_prepLEMode !== 'pret') { _prepLEEtat = null; dossier.cvAnalyse = false; }
      _prepLEEcran = 'intro'; _prepLEDetour = false; _prepLEMode = 'pret';
      if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
      naviguerVers('preparer-lettre-entretien');
    });
    // TACHE (chantier « Reformuler et presenter mon CV », etape 1, 2026-09-07) :
    // 4e tuile. Meme point d'entree que 'pret'/'maj' (reset du residuel +
    // page d'intro routee), mode 'reformuler'.
    brancher('btnCarteAccueilCvReformuler', function () {
      track('reformuler_cv');
      dossier.decouverteTerminee = false;
      // Meme correctif que btnCarteAccueilCvPret juste au-dessus (_prepLEEtat
      // ET dossier.cvAnalyse). Ici, contrairement a pret/maj, "reformuler"
      // ECRIT reellement cvAnalyse (_reformulerCvVersModele()) -- garde
      // volontairement conditionnee au changement de mode, pour ne jamais
      // effacer un "Voir mon CV" legitime en revenant sur un reformuler deja
      // termine.
      if (_prepLEMode !== 'reformuler') { _prepLEEtat = null; dossier.cvAnalyse = false; }
      _prepLEEcran = 'intro'; _prepLEDetour = false; _prepLEMode = 'reformuler';
      if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
      naviguerVers('reformuler-cv');
    });
    // TACHE (refonte "Mes documents", Phase 2, 2026-09-02) : "Mettre a jour"
    // passe desormais par sa page d'intro routee + la MEME page "Preparer"
    // depliante que 'pret' (mode = 'maj'), au lieu d'ouvrir la modale.
    brancher('btnCarteAccueilCvMaj', function () {
      track('mettre_a_jour_cv');
      dossier.decouverteTerminee = false;
      // Meme correctif que btnCarteAccueilCvPret juste au-dessus.
      if (_prepLEMode !== 'maj') { _prepLEEtat = null; dossier.cvAnalyse = false; }
      _prepLEEcran = 'intro'; _prepLEDetour = false; _prepLEMode = 'maj';
      if (typeof fermerFenetreERIP === 'function') { fermerFenetreERIP(); }
      naviguerVers('mettre-a-jour-cv');
    });
    return;
  }

  if (id === 'preparer') {
    brancher('btnCarteAccueilLettre', function () {
      track('co_construire_lettre'); fermerFenetreERIP();
      // TACHE (retour utilisateur 2026-09-17, point 6 : "Continuer/Recommencer
      // comme dans Mes documents") : jusqu'ici, ce clic naviguait tel quel --
      // le dispatcher pageCoLettre() redeposait directement sur l'ecran de
      // travail quitte (_coLettreEcran inchange), sans jamais repasser par
      // l'intro et son encart de reprise. Meme principe que btnCarteAccueilCvPret/
      // Maj/Reformuler juste au-dessus : la tuile force TOUJOURS l'ecran a
      // 'intro', en gardant celui quitte pour le bouton "Continuer" de
      // l'encart (_coLettreEcranRepris, jamais ecrase si deja rempli par un
      // aller-retour precedent tant que l'ecran quitte etait deja 'intro').
      if (_coLettreEcran !== 'intro') { _coLettreEcranRepris = _coLettreEcran; }
      _coLettreEcran = 'intro';
      _coLettreDetour = false;
      naviguerVers('co-lettre');
    });
    brancher('btnCarteAccueilEntretien', function () {
      track('preparer_entretien'); fermerFenetreERIP();
      // TACHE (retour utilisateur 2026-09-17, meme principe que
      // btnCarteAccueilLettre juste au-dessus) : la tuile force TOUJOURS
      // l'ecran a 'intro', en gardant celui quitte pour le bouton
      // "Continuer" de l'encart de reprise (_prepaEntretienEcranRepris).
      if (_prepaEntretienEcran !== 'intro') { _prepaEntretienEcranRepris = _prepaEntretienEcran; }
      _prepaEntretienEcran = 'intro';
      _prepaEntretienDetour = false;
      naviguerVers('prepa-entretien');
    });
    brancher('btnCarteAccueilRegardRecruteur', function () {
      track('regard_recruteur'); fermerFenetreERIP(); naviguerVers('regard-recruteur-intro');
    });
    return;
  }

  if (id === 'boiteaoutils') {
    pulseDecouverteUneFois('aps_reperes_decouverte_vue', 'btnCarteAccueilReperes');
    pulseDecouverteUneFois('aps_carnet_decouverte_vue', 'btnCarteAccueilCarnet');
    pulseDecouverteUneFois('aps_lexique_decouverte_vue', 'btnCarteAccueilLexique');
    brancher('btnCarteAccueilDecouverte', function () {
      track('decouvrir_competences'); fermerFenetreERIP(); naviguerVers('decouverte-intro');
    });
    brancher('btnCarteAccueilReperes', function () {
      track('reperes'); fermerFenetreERIP();
      if (typeof reperesDemarrer === 'function') { reperesDemarrer(); }
    });
    brancher('btnCarteAccueilCarnet', function () {
      track('carnet'); fermerFenetreERIP();
      if (typeof carnetDemarrer === 'function') { carnetDemarrer(); }
    });
    brancher('btnCarteAccueilLexique', function () {
      track('lexique'); fermerFenetreERIP();
      if (typeof lexiqueDemarrer === 'function') { lexiqueDemarrer(); }
    });
    return;
  }

  if (id === 'analyse') {
    pulseDecouverteUneFois('aps_coherence_transversale_decouverte_vue', 'btnCarteAccueilCoherence');
    brancher('btnCarteAccueilBilan', function () {
      track('bilan_candidature'); fermerFenetreERIP();
      if (typeof demarrerBilanCandidature === 'function') { demarrerBilanCandidature(); }
    });
    brancher('btnCarteAccueilCoherence', function () {
      track('coherence_transversale'); fermerFenetreERIP();
      if (typeof ctDemarrer === 'function') { ctDemarrer(); }
    });
    brancher('btnCarteAccueilAts', function () {
      track('ats'); fermerFenetreERIP(); naviguerVers('ats-intro');
    });
    return;
  }
}

// Compat : "Preparer ma candidature" pointait vers la carte "Me preparer a
// candidater" (Lettre / Entretien). Encore appele par les crochets de
// "retour etape 1" du depot Lettre/Entretien.
function ouvrirChoixPreparationAccueil() { ouvrirCarteAccueil('preparer'); }

// TACHE (integration module Bilan de candidature) : point d'entree unique
// de l'outil, appele depuis la tuile "Analyser ma candidature" de la
// Boite a outils -- meme role que ouvrirParcoursEntretien()/ouvrirDepotLettreV1()
// pour leurs tuiles respectives. pageBilanCandidature() (js/app.js) est une
// page independante du tunnel CV/Lettre/Entretien, jamais rattachee a
// docActifActuel().
//
// TACHE (RC-02, architecture finale -- "une seule candidature, source de
// verite des l'entree", 2026-08-22) : le Bilan n'a plus besoin d'un CV
// structure pour fonctionner -- sa seule mission est de comprendre un CV,
// jamais de le construire. N'ouvre donc plus jamais l'assistant de depot
// en mode complet (structuration en champs) : obtenirOuDeposerTexteCV()
// (meme fichier) s'occupe seul d'obtenir un texte exploitable, via un
// depot LEGER si necessaire (depot + relecture, jamais la structuration).
// Construire son CV dans ERIP reste possible, mais devient un second
// parcours, propose depuis le rapport une fois le diagnostic obtenu (voir
// htmlBilanRapport(), js/app.js), jamais impose en amont.
//
// La candidature du Bilan est deposee ICI, des que le texte est obtenu --
// jamais retardee jusqu'au choix d'un assistant sur l'ecran du Bilan
// (analyse UX menee avec Denis : relecture avant choix d'assistant,
// aligne sur CV/Lettre/Entretien, jamais apres comme c'etait le cas
// avant ce chantier). bilanDemarrerDiagnostic() (js/app.js) n'a donc plus
// qu'a lire cette candidature deja validee, jamais a la construire.
// TACHE (retour utilisateur, 2026-08-24) : si une candidature est deja en
// cours (la personne a quitte le Bilan puis y revient, dans la meme
// session), demande desormais explicitement Reprendre/Recommencer au
// lieu de reafficher silencieusement l'ancien etat -- meme principe deja
// applique a Decouverte (voir recommencer(), commentaire "reprendre ou
// repartir de zero"), jamais invente ici pour la premiere fois.
function demarrerBilanCandidature() {
  // TACHE (D5a puis D5b, 2026-08-30, DECISION DE DENIS) : quand un TRAVAIL
  // est en cours (pas seulement une candidature deposee -- inclut l'ecran
  // "Preparer" sans depot), on n'affiche plus une boite de dialogue mais
  // on atterrit sur la PAGE DE PRESENTATION du module (mode detour,
  // _etatBilan.voirIntro), qui porte un bandeau "Vous avez une analyse en
  // cours" + boutons "Continuer mon analyse" / "Recommencer a zero"
  // (htmlBilanIntro + brancherEvenementsBilanIntro, js/app.js). Le reset
  // vit dans bilanRecommencerAnalyse() (js/app.js).
  var candidatureExistante = (typeof bilanObtenirCandidature === 'function') ? bilanObtenirCandidature() : null;
  var diagnosticExistant = (typeof bilanObtenirDiagnostic === 'function') ? bilanObtenirDiagnostic() : null;
  var etatEcran = (typeof _etatBilan !== 'undefined' && _etatBilan) ? _etatBilan : {};
  var travailEnCours = !!(candidatureExistante || diagnosticExistant ||
    etatEcran.preparer || etatEcran.correction || etatEcran.assistance);
  if (travailEnCours) {
    // TACHE (chantier "bouton presentation", 2026-09-01, alignement sur
    // Coherence) : on atterrit au DERNIER ecran de travail, avec l'encart
    // "Continuer / Recommencer" a droite + module gele (etatEcran.reprise
    // Pendante) -- plus sur la page de presentation avec un bandeau.
    if (etatEcran) { etatEcran.reprisePendante = true; etatEcran.voirIntro = null; }
    naviguerVers('bilan');
    return;
  }
  // Pas de travail en cours : on nettoie un eventuel detour perime.
  if (etatEcran) { etatEcran.voirIntro = null; etatEcran.reprisePendante = null; }
  // TACHE (consolidation Bilan, bloc 1.2, Vague 1, 2026-08-30) : premiere
  // entree dans le module (aucune candidature en cours) -> on atterrit sur
  // la page d'introduction (htmlBilanIntro(), js/app.js), dont le bouton
  // "Analyser mon CV" appelle demarrerBilanCandidatureAvecDepot(). Les
  // autres points d'entree restent inchanges : "Recommencer" (ci-dessus) et
  // "Corriger dans le Bilan" (modules/coherence-transversale/ui.js) vont
  // toujours directement au depot.
  naviguerVers('bilan');
}
// TACHE (ciblage offre d'emploi, 2026-08-24, DECISION DE DENIS) : 10
// categories couvrant la NATURE/STATUT de l'employeur (jamais sa TAILLE --
// choix explicite : une PME et une TPE du meme secteur parlent le meme
// registre, alors qu'une association/un hopital public/une entreprise
// privee attendent des vocabulaires differents, l'objectif reel ici).
// 'Autre' toujours en dernier, associe a un champ texte libre (voir
// bilanCorpsCiblageOffreHTML() ci-dessous, bloc 4 de htmlBilanPreparer()).
var BILAN_TYPES_STRUCTURE = [
  'Entreprise privée (secteur marchand)',
  'Fonction publique d’État (administrations, ministères, écoles publiques...)',
  'Fonction publique territoriale (mairies, départements, régions...)',
  'Fonction publique hospitalière (hôpitaux publics, EHPAD publics...)',
  'Établissement sanitaire ou médico-social privé (cliniques privées, EHPAD privés, cabinets)',
  'Association (loi 1901) / économie sociale et solidaire',
  'Coopérative (SCOP, SCIC...)',
  'Artisanat / commerce de proximité',
  'Établissement d’enseignement (public ou privé, formation)',
  'Autre'
];

// TACHE (consolidation Bilan, bloc 3.3, 2026-08-30) : bilanOuvrirChoixSituation()
// (modale "Quelle est votre situation actuelle ?", 6 tuiles) a ete RETIREE.
// La situation se choisit maintenant dans le bloc 3 de htmlBilanPreparer()
// (js/app.js) : memes choix (OBJECTIF_CHOIX_CANDIDATURE), meme effet
// (definirObjectifCandidature()), meme regle "ne s'affiche pas si
// dossier.objectif est deja connu".

// TACHE (ciblage offre d'emploi, 2026-08-24, DECISION DE DENIS ;
// consolidation Bilan, bloc 3.3, 2026-08-30) : collecte offre d'emploi /
// entreprise / site internet / type de structure, exploitee par
// prompts/bilan-v1.md et prompts/bilan-v2.md quand fournie, sans aucun
// effet si rien n'est renseigne (voir bilanFormaterValeurOptionnelle --
// "Non fourni." partout ou une valeur manque). La modale historique
// bilanOuvrirCiblageOffreEmploi() a ete RETIREE : ces champs vivent
// desormais dans le bloc 4 de htmlBilanPreparer() (js/app.js). Corps
// extrait en trois fonctions PARTAGEES -- un seul HTML, un seul cablage,
// une seule lecture (regle "une seule source de verite").
//
// UX du champ offre d'emploi (demande explicite de Denis) : un lien seul
// n'est pas toujours consultable par l'assistant de la personne -- des
// qu'une URL est detectee dans ce champ, un second champ apparait pour
// coller le contenu reel de l'offre si elle y a acces. Si les deux sont
// remplis, le contenu prime (plus utile a l’assistant qu'un lien brut).
function bilanCorpsCiblageOffreHTML() {
  return '<div class="mb-3"><label class="form-label small fw-bold">Entreprise ciblée</label>' +
    '<input type="text" class="form-control form-control-sm" id="ciblageEntreprise" placeholder="Ex. Boulangerie Dupont" value="' + echapperAttribut((typeof entrepriseCibleActuelle === 'function' && entrepriseCibleActuelle()) || '') + '"></div>' +
    // Pre-rempli depuis dossier.rechercheCandidature.site si deja memorise
    // (meme source que siteCibleActuel()) -- la personne reste libre de
    // corriger avant de continuer.
    '<div class="mb-3"><label class="form-label small fw-bold">Site internet de l’entreprise</label>' +
    '<input type="url" class="form-control form-control-sm" id="ciblageSite" placeholder="https://..." value="' + echapperAttribut((typeof siteCibleActuel === 'function' && siteCibleActuel()) || '') + '"></div>' +
    '<div class="mb-3"><label class="form-label small fw-bold">Offre d’emploi</label>' +
    '<textarea class="form-control form-control-sm" id="ciblageOffre" rows="3" placeholder="Collez ici le texte de l’offre, ou son lien">' +
    echapperAttribut((typeof dossier !== 'undefined' && dossier.rechercheCandidature && dossier.rechercheCandidature.texteOffre) || '') +
    '</textarea>' +
    '<div id="ciblageOffreContenuBloc" style="display:none;" class="mt-2">' +
    '<label class="form-label small fw-bold">Vous avez accès au contenu de cette offre ?</label>' +
    '<p class="text-muted small mb-1">Un lien seul n’est pas toujours consultable par l’assistant : si vous pouvez copier le texte de l’offre, collez-le ici pour une analyse plus fiable.</p>' +
    '<textarea class="form-control form-control-sm" id="ciblageOffreContenu" rows="4" placeholder="Collez ici le contenu complet de l’offre"></textarea>' +
    '</div></div>' +
    '<div class="mb-3"><label class="form-label small fw-bold">Type de structure</label>' +
    '<select class="form-select form-select-sm" id="ciblageTypeStructure">' +
    '<option value="">Non précisé</option>' +
    BILAN_TYPES_STRUCTURE.map(function (t) {
      var typeStructureMemorise = (typeof dossier !== 'undefined' && dossier.rechercheCandidature && dossier.rechercheCandidature.typeStructure) || '';
      return '<option value="' + echapperAttribut(t) + '"' + (typeStructureMemorise === t ? ' selected' : '') + '>' + t + '</option>';
    }).join('') +
    '</select>' +
    '<input type="text" class="form-control form-control-sm mt-2" id="ciblageTypeStructureAutre" style="display:none;" placeholder="Précisez le type de structure"></div>';
}

// Cable les interactions du corps ci-dessus sur une racine donnee (overlay
// de la modale, ou conteneur du bloc 4 de "Preparer") : detection d'URL
// dans le champ offre -> 2e champ, choix "Autre" -> champ libre. onChange
// (optionnel) est appele a chaque saisie utile, sur le MEME jeu de champs
// que la version modale d'origine (entreprise / site / offre / contenu
// d'offre en 'input', type de structure en 'change') -- jamais le champ
// "Autre".
function bilanCablerCiblageOffre(racine, onChange) {
  activerChampsStandardises(racine);

  var champOffre = racine.querySelector('#ciblageOffre');
  var blocContenu = racine.querySelector('#ciblageOffreContenuBloc');
  function ressembleAUneURL(valeur) { return /^https?:\/\/\S+$/.test((valeur || '').trim()); }
  champOffre.addEventListener('input', function () {
    blocContenu.style.display = ressembleAUneURL(champOffre.value) ? '' : 'none';
  });

  var selectStructure = racine.querySelector('#ciblageTypeStructure');
  var champAutre = racine.querySelector('#ciblageTypeStructureAutre');
  selectStructure.addEventListener('change', function () {
    champAutre.style.display = (selectStructure.value === 'Autre') ? '' : 'none';
  });

  if (typeof onChange === 'function') {
    // TACHE (dette B.1, resorption du reliquat interne au collecteur #1,
    // 2026-09-04) : champAutre ajoute a cette liste -- oublie initialement
    // (les 2 autres consommateurs, bloc 4 de "Preparer" et Coherence, ne
    // passent pas d'onChange : ils relisent tout via bilanLireCiblageOffre()
    // au clic final, jamais affectes par ce manque). Sans lui, un
    // consommateur en ecriture immediate (wireModeRecherche) ne capte
    // jamais la frappe dans le champ libre "Autre".
    [racine.querySelector('#ciblageEntreprise'), racine.querySelector('#ciblageSite'),
      champOffre, racine.querySelector('#ciblageOffreContenu'), champAutre].forEach(function (champ) {
      champ.addEventListener('input', onChange);
    });
    selectStructure.addEventListener('change', onChange);
  }
}

// Lit les champs du corps ci-dessus sur une racine donnee -> saisieLibre,
// exactement dans la forme attendue par bilanDeposerCandidature()
// (core/moduleOrchestrator.js). Contenu colle prioritaire sur le lien brut.
function bilanLireCiblageOffre(racine) {
  var typeStructure = racine.querySelector('#ciblageTypeStructure').value;
  var typeStructureAutre = racine.querySelector('#ciblageTypeStructureAutre').value.trim();
  var offreBrute = racine.querySelector('#ciblageOffre').value.trim();
  var offreContenu = racine.querySelector('#ciblageOffreContenu').value.trim();
  return {
    entrepriseCiblee: racine.querySelector('#ciblageEntreprise').value.trim() || null,
    siteEntreprise: racine.querySelector('#ciblageSite').value.trim() || null,
    offreEmploi: (offreContenu || offreBrute) || null,
    typeStructure: typeStructure || null,
    typeStructureAutre: (typeStructure === 'Autre' && typeStructureAutre) ? typeStructureAutre : null
  };
}

// TACHE (consolidation Bilan, bloc 3.3, 2026-08-30) : bilanOuvrirCiblageOffreEmploi()
// (modale "Cibler votre analyse") a ete RETIREE. Ces champs vivent
// desormais dans le bloc 4 de htmlBilanPreparer() (js/app.js), via les
// trois fonctions partagees ci-dessus (bilanCorpsCiblageOffreHTML /
// bilanCablerCiblageOffre / bilanLireCiblageOffre). Le depot se fait au
// bouton "Choisir mon assistant" du bas de la page "Preparer".

// TACHE (transfert Coherence transversale -> Bilan, 2026-08-25, DECISION
// DE DENIS) : global transitoire (une seule utilisation), jamais persiste
// (ne fait pas partie de dossier, jamais sauvegarde par la disquette).
// Ecrit par modules/coherence-transversale/ui.js juste avant d'appeler
// demarrerBilanCandidatureAvecDepot() ci-dessous ; lu et remis a null au
// depot final, dans brancherEvenementsBilanPreparer() (js/app.js).
var _ctElementsPourBilan = null;

function demarrerBilanCandidatureAvecDepot() {
  // TACHE (integration module Bilan de candidature, tracking Umami) : point
  // d'entree reel de l'outil -- meme convention que decouverte_demarree
  // (decouverteParcours.js).
  if (typeof trackEvenement === 'function') { trackEvenement('bilan_ouvert'); }
  // TACHE (consolidation Bilan, bloc 3.3, 2026-08-30) : fin de la cascade
  // de 2 a 4 fenetres modales avant d'entrer dans le module. Tout se passe
  // desormais sur l'ecran "Preparer" (htmlBilanPreparer, js/app.js), une
  // seule page depliante :
  //   depot du CV / coller le texte  -> bloc 1 (obtenirOuDeposerTexteCV)
  //   relire / masquer               -> bloc 2 (bilanDemanderRelectureCv)
  //   "votre situation"              -> bloc 3 (definirObjectifCandidature)
  //   ciblage entreprise / offre     -> bloc 4 (bilanCorpsCiblageOffreHTML)
  //   transfert Coherence transversale + depot de la candidature -> bouton
  //     "Choisir mon assistant" du bas (brancherEvenementsBilanPreparer).
  // bilanEntrerPreparation() (js/app.js) pose _etatBilan.preparer puis
  // navigue vers le module.
  if (typeof bilanEntrerPreparation === 'function') {
    bilanEntrerPreparation();
  } else if (typeof naviguerVers === 'function') {
    naviguerVers('bilan');
  }
}

// TACHE (migration Design System, chantier "metiers.js", 7e migration) :
// devient une recette qui appelle la primitive ouvrirFenetreERIP(), taille
// "standard" (520px). fermerChoixAssistantLettreV1() est retiree (aucun
// appelant externe, verifie avant suppression) : fermerFenetreERIP() migre
// desormais ce role.
//
// DECISION D'ARCHITECTURE prise en amont, hors perimetre de cette seule
// migration (point d'architecture dedie) : la largeur d'origine (560px) ne
// correspond a aucun palier de la primitive (standard/520, large/700).
// Plutot que d'ajouter une largeur personnalisee au contrat public de la
// primitive pour un cas unique, un recensement empirique de TOUTES les
// largeurs de fenetre ayant existe dans app.js et metiers.js a montre que
// 560px est un cas isole (5 des 6 largeurs historiques se regroupent
// naturellement autour de 480-520 ou 680-700 -- aucun besoin recurrent
// d'une troisieme famille de largeur). Choix retenu : "standard" (520px,
// ecart de 40px), qui rattache cette fenetre a son groupe naturel plutot
// que de creer une exception. Rendu visuel (lisibilite, disposition des
// elements sur cette largeur legerement reduite) NON suppose ici -- fait
// partie du protocole de validation comportementale fourni a part.
// ---------- Ecran "Choisir mon assistant" (remplace la fenetre ouvrirChoixAssistantLettreV1) ----------

// TACHE (chantier "elimination des fenetres de depot CV", module 1/3,
// 2026-09-04) : vraie page, meme composant partage que Bilan/Decouverte/
// Coherence (htmlChoixAssistantBilanCorps(), dette B.2) au lieu d'une
// liste de boutons maison dans une fenetre. ouvrirFenetreAssistantIA() --
// le petit ecran tampon de confirmation avant redirection -- reste
// INCHANGE : ce n'est pas une fenetre de saisie de document, c'est la
// meme confirmation breve deja partagee par les 4 autres parcours.
// TACHE (audit de stabilisation, 2026-09-12, finding 3) : etapes propres a
// Co-construire ma lettre -- meme gabarit que ETAPES_DETAIL_CHOIX_IA
// (js/app.js, contenu propre au circuit CV), jamais reutilise tel quel :
// Co-lettre n'a pas d'ecran de relecture ou l'on decoche/reordonne, la
// lettre se construit par dialogue avec l'assistant puis se colle en une
// seule fois (voir _coLettreRendreReponse ci-dessous).
var _CO_LETTRE_ETAPES_DETAIL = [
  { titre: 'Copie', detail: 'Votre CV relu et vos informations de candidature (poste, entreprise) sont copiés automatiquement, rien à écrire vous-même.' },
  { titre: 'Dialogue', detail: 'L’assistant vous propose une lettre phrase par phrase, en discutant avec vous : vous prenez le temps de la construire ensemble.' },
  { titre: 'Lettre complète', detail: 'Une fois d’accord, l’assistant vous renvoie la lettre complète, prête à être collée ici.' },
  { titre: 'Votre choix', detail: 'Vous relisez la lettre collée, vous l’enregistrez au format qui vous convient. Rien n’est appliqué avant que vous l’ayez vue.' }
];

function _coLettreRendreChoixAssistant() {
  var html = barreEtapesModule(CO_LETTRE_NAV_ETAPES, 1) + _coLettreBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-pen"></i> Co-construire ma lettre de motivation</h1>' +
    '<p class="sousTitre">Une lettre de motivation écrite avec l’assistant de votre choix.</p></div>' +
    '<div class="cv-section co-lettre-etape-choix-ia">' +
    '<h4>&#128172; Choisissez votre assistant</h4>' +
    '<p class="text-muted small mb-3">Cliquez sur un assistant ci-dessous. L’application prépare et copie tout pour vous, puis ouvre l’assistant.</p>' +
    htmlChoixAssistantBilanCorps({
      idErreur: 'coLettreErreurChoixIA', attrAssistant: 'data-assistant-co-lettre',
      etapes: _CO_LETTRE_ETAPES_DETAIL,
      texteConfidentialite: 'Votre CV a déjà été relu et masqué au moment du dépôt. Rien d’autre n’est transmis avant que vous choisissiez un assistant.'
    }) +
    '</div>';
  app.innerHTML = '<div class="page-catalogue-contenu co-lettre-parcours">' + html + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_coLettreRetourDepot()' }) + '</div>';
  _coLettreBrancherChoixAssistant();
  if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_choix_assistant_affiche'); }
}

function _coLettreBrancherChoixAssistant() {
  _coLettreBrancherBandePresentation();
  var documentPrepare = _coLettreDocument;
  var estTexte = documentPrepare && documentPrepare.type === 'texte';
  var estImage = documentPrepare && documentPrepare.type === 'image';

  document.querySelectorAll('[data-assistant-co-lettre]').forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      var assistant = ASSISTANTS_IA.filter(function (a) { return a.id === bouton.dataset.assistantCoLettre; })[0];
      if (!assistant) { return; }

      // TACHE (retour utilisateur : "ca marche pas -- au moment de coller
      // le CV, le presse-papiers contenait encore le prompt") : bug de
      // sequencement deja corrige -- le CV n'est JAMAIS copie ici, seul le
      // prompt (+ le profil) l'est (voir construireTexteACopier ci-dessous).
      // Le bouton "Copier mon CV" vit sur l'ecran suivant, affiche une fois
      // l'assistant ouvert : plus rien ne peut ecraser le presse-papiers
      // entre le clic et le collage du CV.
      var etapesLettreCo = estImage
        ? [
          'Le prompt de démarrage est <strong>automatiquement copié</strong> dans votre presse-papiers.',
          'Votre CV protégé a déjà été téléchargé à l’étape précédente.',
          'Une fois sur le site de {ASSISTANT}, cliquez dans la zone de conversation et faites <span class="cle-pulse">Ctrl + V</span>, puis appuyez sur <strong>Entrée</strong>.',
          'Quand {ASSISTANT} vous le demandera pendant l’échange, glissez le fichier téléchargé dans la conversation.'
        ]
        : estTexte
          ? [
            'Le prompt de démarrage est <strong>automatiquement copié</strong> dans votre presse-papiers.',
            'Une fois sur le site de {ASSISTANT}, cliquez dans la zone de conversation et faites <span class="cle-pulse">Ctrl + V</span>, puis appuyez sur <strong>Entrée</strong>.',
            'Quand {ASSISTANT} vous demandera votre CV pendant l’échange, revenez sur cette page : un bouton « Copier mon CV » vous attendra, juste avant de retourner le coller.'
          ]
          : [
            'Le prompt de démarrage est <strong>automatiquement copié</strong> dans votre presse-papiers.',
            'Une fois sur le site de {ASSISTANT}, cliquez dans la zone de conversation et faites <span class="cle-pulse">Ctrl + V</span>, puis appuyez sur <strong>Entrée</strong>.',
            'Quand {ASSISTANT} vous demandera votre CV pendant l’échange, collez-le en texte ou déposez le fichier si la plateforme le permet.'
          ];

      ouvrirFenetreAssistantIA({
        nomAssistant: assistant.nom,
        idAssistant: assistant.id,
        urlAssistant: assistant.url,
        etapes: etapesLettreCo,
        // TACHE (chantier "Videos d'accompagnement") : la branche texte
        // utilise un copier-coller (comme le reste de l'application), plus
        // un fichier a glisser -- video pertinente uniquement pour le cas
        // image (fichier reellement incontournable).
        idDemoVideo: estImage ? 'export-ia-image' : undefined,
        construireTexteACopier: function () {
          // TACHE (refonte L1 "Co-construire ma lettre", 2026-09-07,
          // docs/CHANTIER_L1_CO_LETTRE_MOTIVATION.md) : le prompt
          // prompts/lettre-co.md recoit le profil structure
          // (texteProfilEffectif('lettre'), meme mecanisme que lettre.md V2
          // et entretien.md via promptCache) -- l'assistant ne redemande
          // donc plus ce que l'application sait deja. Un seul jeton,
          // {CONSIGNE_TRANSMISSION_CV}, remplace ici selon le type reel de
          // document depose, pour ne jamais proposer une option impossible
          // (coller du texte pour un CV scanne). Plus de mot "Start", donc
          // plus de jeton {INSTRUCTION_BLOCAGE_CV}.
          var consigneCv = estTexte
            ? 'Demande-lui de coller le texte de son CV dans la conversation.'
            : estImage
              ? 'Demande-lui de deposer le fichier de son CV dans la conversation.'
              : 'Demande-lui de coller le texte de son CV, ou de deposer le fichier si la plateforme le permet.';
          var base = (typeof promptCache === 'function')
            ? promptCache('lettre-co', texteProfilEffectif('lettre'))
            : ((typeof promptsExternesCharges !== 'undefined' && promptsExternesCharges['lettre-co']) || '');
          return base.replace(/\{CONSIGNE_TRANSMISSION_CV\}/g, consigneCv);
        },
        onApresValidation: function (urlAssistant, nomAssistant) {
          // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
          // CV/Lettre/Entretien, pour la coherence de tout le parcours") :
          // window.open() ne se declenche pas ici -- urlAssistant/nomAssistant
          // voyagent jusqu'a l'ecran "reponse" via _etatTransitionIA (js/
          // app.js, globale, deja partagee par les 4 autres parcours), qui
          // decide seule du moment ou l'ouverture reelle se declenche.
          _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
          _coLettreReponseEstImage = estImage;
          _coLettreReponseTexteCv = estTexte ? ((documentPrepare && documentPrepare.valeur) || '') : null;
          _coLettreCvCopie = false;
          _coLettreReponseForcerCollage = false;
          _coLettreEcran = 'reponse';
          naviguerVers('co-lettre');
        }
      });
    });
  });
}

// TACHE (retour utilisateur : impression a la fin, comme pour l'entretien) :
// meme principe que ouvrirRecuperationEntretien() -- collage instantane,
// analyse de la reponse (meme forme JSON que lettre.md V2 : accroche/
// arguments/lettre{objet,texte}, voir prompts/lettre-v1.md elargi), puis
// generation du VRAI document Word natif (genererDocxNatifLettre, deja
// existante -- reutilisee telle quelle, aucune logique dupliquee).
// TACHE (chantier "Videos d'accompagnement") : parametre estImage ajoute
// (facultatif, false par defaut) -- seul changement de signature necessaire
// pour piloter l'affichage du bloc Astuce, sans quoi cette fonction n'avait
// aucun moyen de savoir si le document depose etait une image/PDF (voir
// ouvrirChoixAssistantLettreV1(), seul appelant, mis a jour en consequence).
// ---------- Ecran "Coller la reponse" (remplace la fenetre ouvrirRecuperationLettreV1) ----------

// TACHE (chantier "elimination des fenetres de depot CV", module 1/3,
// 2026-09-04) : meme contenu et memes mecanismes EXACTEMENT (decompte/
// popup bloque/"je suis de retour", collage instantane, analyse JSON,
// generation DOCX) que l'ancienne fenetre -- seul le conteneur change
// (page routee au lieu de ouvrirFenetreERIP). "Terminé" navigue
// desormais vers "Vos documents" au lieu de fermer une fenetre.

// TACHE (refonte L1 « Co-construire ma lettre », etape 10, 2026-09-10,
// docs/CHANTIER_L1_CO_LETTRE_MOTIVATION.md) : rappel des coordonnees qui
// iront en EN-TETE de la lettre. genererDocxNatifLettre() reconstruit
// l'en-tete expediteur localement a partir de dossier.identite (voir
// modules/lettre-core/normaliserDonneesLettre.js). Si la personne est
// venue directement sur L1 sans remplir « Vos informations », l'en-tete
// serait vide -> encart + bouton pour completer via la fenetre partagee
// bilanOuvrirFenetreCoordonnees(). NON bloquant : le DOCX se genere quand
// meme. Place AVANT la zone de collage (decision Denis, cahier §7).
function _coLettreBlocCoordonnees() {
  var id = (typeof dossier !== 'undefined' && dossier.identite) || {};
  var nomComplet = [id.prenom, id.nom].filter(Boolean).join(' ').trim();
  var cpVille = [id.codePostal, id.ville].filter(Boolean).join(' ').trim();
  var complet = !!(nomComplet && id.telephone && id.email);
  // TACHE (retour utilisateur 2026-09-17, capture d'ecran : "sophie.martin@email.frPermis"
  // colle a la lecture des coordonnees juste au-dessus d'un encart qui disait
  // "il manque nom/telephone/courriel" alors que 2 des 3 etaient deja la) :
  // 2 corrections. 1) Le message nommait toujours les 3 champs, qu'ils
  // manquent ou non (telephone/e-mail desormais pre-remplis automatiquement
  // depuis le CV, voir _coLettreDetecterCoordonneesDepuisCV -- le message
  // devient trompeur des qu'un seul des 3 est deja rempli) : ne cite plus que
  // ce qui manque reellement. 2) Tant que ce n'est pas complet, la lecture
  // brute (nom/adresse/telephone/email deja captes) ne s'affiche plus du
  // tout au-dessus de l'encart -- seul l'encart, desormais bien plus visible
  // (memes couleurs que "Il manque vos coordonnees" de Vos documents,
  // pageResultats()/js/app.js -- reutilisees, pas inventees) et pulse 10 s
  // en bleu (retour utilisateur : le pulse jaune se voyait mal sur le fond
  // deja jaune de l'encart -- .bouton-incitation-action, classe deja
  // existante ailleurs dans l'app pour ce meme usage, jamais un nouveau
  // pulse invente).
  var champsManquants = [];
  if (!nomComplet) { champsManquants.push('nom'); }
  if (!id.telephone) { champsManquants.push('téléphone'); }
  if (!id.email) { champsManquants.push('courriel'); }
  var lignes = [];
  if (nomComplet) { lignes.push(echapperAttribut(nomComplet)); }
  if (id.adresse) { lignes.push(echapperAttribut(id.adresse)); }
  if (cpVille) { lignes.push(echapperAttribut(cpVille)); }
  if (id.telephone) { lignes.push(echapperAttribut(id.telephone)); }
  if (id.email) { lignes.push(echapperAttribut(id.email)); }
  return '<div id="coLettreZoneCoordonnees" class="cv-section" style="margin-bottom:0.9rem;">' +
    '<h4>&#128100; Vos coordonnées</h4>' +
    '<p class="preparer-detail">Elles apparaîtront en <strong>en-tête de votre lettre</strong>. Elles ne sont jamais transmises à l’assistant.</p>' +
    (complet
      ? (lignes.length ? '<p class="mb-2" style="line-height:1.5;">' + lignes.join('<br>') + '</p>' : '') +
        '<button type="button" id="btnCoLettreModifierCoordonnees" class="btn btn-outline-secondary btn-sm">Modifier</button>'
      : '<div class="cv-section bouton-incitation-action" style="margin:0;background:var(--warning-bg-subtle);border:1px solid var(--warning-border);">' +
        '<p class="mb-2 small" style="color:var(--warning-strong);">&#9888;&#65039; Il manque ' + champsManquants.join(', ') +
        ' pour l’en-tête de votre lettre. Vous pouvez compléter maintenant ou plus tard : le document se génère quand même.</p>' +
        '<button type="button" id="btnCoLettreModifierCoordonnees" class="btn btn-primary btn-sm">Compléter mes coordonnées</button></div>') +
    '</div>';
}

function _coLettreBrancherCoordonnees() {
  var btn = document.getElementById('btnCoLettreModifierCoordonnees');
  if (!btn || typeof bilanOuvrirFenetreCoordonnees !== 'function') { return; }
  btn.addEventListener('click', function () {
    bilanOuvrirFenetreCoordonnees(function () {
      var z = document.getElementById('coLettreZoneCoordonnees');
      if (z) { z.outerHTML = _coLettreBlocCoordonnees(); _coLettreBrancherCoordonnees(); }
    });
  });
}

// TACHE (retour utilisateur 2026-09-17, point 4) : _coLettreLettreImprimableHtml()
// et _coLettreOuvrirApercuLettre() (panneau iframe d'apercu/impression
// propre a cet ecran) sont retirees -- leur seul appelant (le bouton
// "Aperçu / Imprimer" de l'ecran "Coller la reponse") a disparu avec la
// bascule vers l'interface moderne de "Vos documents" (voir _coLettreRendreReponse()
// plus haut), qui a deja son propre apercu + impression, source unique pour
// toute lettre du dossier.

function _coLettreRendreReponse() {
  var estImage = _coLettreReponseEstImage;
  var texteCV = _coLettreReponseTexteCv;
  // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a CV/
  // Lettre/Entretien") : coupe systematiquement tout decompte herite d'un
  // rendu precedent AVANT de reconstruire quoi que ce soit -- cette
  // fonction se rappelle elle-meme a chaque changement de phase (voir plus
  // bas), meme precaution que naviguerVers()/afficherEtape() (js/app.js,
  // decouverteParcours.js).
  clearInterval(_intervalleDecompteIA);
  // TACHE (retour utilisateur 2026-09-17, bug reel confirme : "j'importe ma
  // lettre, je la vois dans Vos documents, je clique Retour et je retombe
  // sur un ecran de collage vide -- comme si le travail avait disparu") :
  // la lettre et les coordonnees NE sont PAS perdues (dossier.ia.lettre /
  // dossier.identite ne sont jamais effaces par une navigation), mais cet
  // ecran, lui, repart de zero a chaque re-rendu (le texte colle ne vit que
  // dans le textarea du DOM, _etatTransitionIA est remis a null au moment
  // de l'import, voir plus bas). _etatTransitionIA === null ICI ne peut
  // arriver que par ce chemin (l'entree normale, onApresValidation plus
  // bas, pose TOUJOURS une transition fraiche) -- signal fiable pour
  // distinguer "on revient apres coup" de "on est en plein parcours".
  // Affiche donc un ecran de confirmation (lettre deja la, coordonnees
  // deja visibles/modifiables) plutot que de refaire croire qu'il faut
  // tout recoller. "Coller une nouvelle reponse" (_coLettreReponseForcerCollage)
  // permet de revenir volontairement a l'ecran de collage normal.
  var lettreDejaImportee = !_etatTransitionIA && !_coLettreReponseForcerCollage && !!(dossier.ia && dossier.ia.lettre &&
    (dossier.ia.lettre.texte || (dossier.ia.lettre.versions && dossier.ia.lettre.versions.length)));
  if (lettreDejaImportee) {
    var contenuDejaImporteHTML = '<div class="cv-section" style="margin-bottom:1rem;background:var(--success-bg-subtle);border-left:4px solid var(--success);border-radius:12px;padding:1.1rem 1.3rem;">' +
      '<p class="mb-2" style="font-size:1.05rem;"><strong>&#9989; Votre lettre a déjà été importée.</strong></p>' +
      '<div class="d-flex gap-2 flex-wrap">' +
      '<button type="button" id="btnCoLettreVoirLettreImportee" class="btn btn-primary">Voir ma lettre dans « Vos documents » &#8594;</button>' +
      '<button type="button" id="btnCoLettreRecollerReponse" class="btn btn-outline-secondary">Coller une nouvelle réponse</button>' +
      '</div></div>' +
      _coLettreBlocCoordonnees();
    app.innerHTML = '<div class="page-catalogue-contenu co-lettre-parcours">' +
      barreEtapesModule(CO_LETTRE_NAV_ETAPES, 2) + _coLettreBandePresentation() +
      '<div class="text-center"><h1><i class="bi bi-pen"></i> Votre lettre de motivation</h1></div>' +
      contenuDejaImporteHTML +
      '</div>' +
      '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_coLettreRetourChoixAssistant()' }) + '</div>';
    _coLettreBrancherBandePresentation();
    _coLettreBrancherCoordonnees();
    var btnVoirLettreImportee = document.getElementById('btnCoLettreVoirLettreImportee');
    if (btnVoirLettreImportee) {
      btnVoirLettreImportee.addEventListener('click', function () { dossier.dernierDocumentPrepare = 'lettre'; naviguerVers('resultats'); });
    }
    var btnRecollerReponse = document.getElementById('btnCoLettreRecollerReponse');
    if (btnRecollerReponse) {
      btnRecollerReponse.addEventListener('click', function () { _coLettreReponseForcerCollage = true; _coLettreRendreReponse(); });
    }
    if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_reponse_deja_importee_affichee'); }
    return;
  }
  // TACHE (retour utilisateur : bug de sequencement -- "Copier mon CV"
  // deplace depuis l'ecran "Choisir mon assistant", voir son commentaire) :
  // affiche EN MEME TEMPS que l'onglet de l'assistant s'ouvre (voir son
  // appelant) -- la personne colle d'abord le prompt dans l'assistant,
  // PUIS revient sur cet onglet ERIP pour copier son CV maintenant, juste
  // avant de retourner le coller. Plus aucune autre action ERIP entre les
  // deux ne vient recopier quoi que ce soit dans le presse-papiers.
  // TACHE (retour utilisateur 2026-09-17, ecran "reponse") : bloc remonte
  // EN PREMIER (voir plus bas) -- c'est le premier geste reel du parcours
  // (le CV n'est copie qu'ici, jamais avant, voir commentaire plus haut).
  // Bouton agrandi (meme gabarit que le rond "Coller la reponse" plus bas,
  // htmlCollageInstantane()/js/app.js -- taille identique demandee par
  // Denis, aucune valeur inventee) et pulse tant que non clique
  // (bouton-incitation-action). Paragraphe ajoute : la personne ne savait
  // pas QUOI faire de ce bouton ("il manque d'informations") -- explique
  // desormais que la lettre se construit sur la page de l'assistant, qui a
  // deja le contexte mais pas encore le CV, et QUE ce bouton sert a aller
  // le coller la-bas (onglet du navigateur, pas un lien clique par l'appli).
  var attendCopieCv = !!texteCV && !_coLettreCvCopie;
  // TACHE (retour utilisateur 2026-09-17, precision : "la pire des choses,
  // ce serait que le bouton pulse trop tot -- la personne clique, ca
  // remplace le prompt par le CV dans le presse-papiers, et pour repartir
  // a zero elle sera perdue") : le prompt est copie des le clic sur
  // l'assistant (ecran precedent), AVANT ce decompte -- tant que la
  // personne n'a pas vraiment ete redirigee (fenetre encore en 'decompte'
  // ou bloquee par le navigateur), coller le CV maintenant ecraserait ce
  // prompt dans le presse-papiers avant meme qu'il ait ete colle chez
  // l'assistant. "Copier mon CV" reste donc desactive jusqu'a la phase
  // 'ouvert' (redirection reelle, decompte ecoule OU clic manuel sur
  // "Ouvrir [Assistant] maintenant" si le popup a ete bloque) -- puis
  // 'revenu' (apres "Je suis de retour"), ou le reclic reste sans risque.
  var cvCopiablemaintenant = !!(_etatTransitionIA && (_etatTransitionIA.phase === 'ouvert' || _etatTransitionIA.phase === 'revenu'));
  var nomAssistantActuel = (_etatTransitionIA && _etatTransitionIA.nomAssistant) || 'l’assistant';
  var htmlCopierCv = texteCV
    // TACHE (correctif mode sombre, decouvert en verifiant cet ecran une
    // fois devenu une page, 2026-09-04) : #EFF6FF etait deja un hex fige
    // dans l'ancienne fenetre (jamais theme-aware, meme defaut qu'ici) --
    // corrige au passage en jeton var(--...).
    ? '<div class="mb-3 p-3 text-center" style="background:var(--accent-bg-subtle);border-radius:8px;">' +
      '<p class="mb-2" style="line-height:1.5;">Votre lettre est en cours de construction sur la page de l’assistant : ' +
      'il a déjà vos réponses et le contexte de votre candidature, mais pas encore votre CV. Copiez-le ci-dessous, ' +
      'puis retournez sur l’onglet de l’assistant <strong>(barre de votre navigateur, en haut)</strong> : cliquez dans ' +
      'la zone de conversation, faites <span class="cle-pulse">Ctrl + V</span>, puis validez. C’est là-bas que la ' +
      'lettre continue de se construire.</p>' +
      // TACHE (retour utilisateur : "mettre le bouton 'Copier mon CV' en
      // plus grand, visible, aussi grand que 'Coller la reponse'") : meme
      // style que le bouton #btnCollerAuto* (htmlCollageInstantane(),
      // js/app.js) -- gabarit unique repris tel quel plutot que reinvente.
      // TACHE (retour utilisateur 2026-09-17, suite) : desactive (meme
      // classe grisee que "Je suis de retour" desactive, .rond-collage-
      // desactive, css/style.css -- source unique) tant que
      // cvCopiablemaintenant est faux ; ne pulse que si en plus le clic est
      // vraiment possible.
      '<button type="button" id="btnCopierCvLettreV1" title="Copier mon CV"' +
      (!cvCopiablemaintenant ? ' disabled' : '') +
      (!cvCopiablemaintenant ? ' class="rond-collage-desactive"' : (attendCopieCv ? ' class="bouton-incitation-action"' : '')) +
      ' style="border:none;border-radius:12px;background:var(--accent);color:#FFFFFF;font-weight:700;' +
      'font-size:1.05rem;padding:0.75rem 1.6rem;box-shadow:0 4px 14px rgba(13,110,253,.4);cursor:pointer;">' +
      '&#128203; Copier mon CV</button>' +
      (!cvCopiablemaintenant
        ? '<p class="small text-muted mt-2 mb-0">Ce bouton s’activera une fois que vous serez vraiment redirigé vers ' +
          echapperAttribut(nomAssistantActuel) + (_etatTransitionIA && _etatTransitionIA.phase === 'bloque' ? ' (cliquez sur « Ouvrir ' + echapperAttribut(nomAssistantActuel) + ' maintenant » ci-dessous)' : '') + '.</p>'
        : (_coLettreCvCopie
          ? '<p class="small mt-2 mb-0" style="color:var(--success-strong);">&#10003; CV copié. Vous pouvez le recopier à tout moment si besoin.</p>'
          : '')) +
      '</div>'
    : '';
  var contenuHTML =
    // TACHE (retour utilisateur 2026-09-17, ecran "reponse") : ordre
    // reconstruit pour suivre exactement l'ordre reel des gestes -- 1) on
    // copie le CV et on va le coller chez l'assistant, 2) on revient et on
    // le confirme via "Je suis de retour" (bloque tant que 1 n'est pas
    // fait, voir plus bas), 3) on colle la reponse (deja bloque tant que
    // 2 n'est pas fait, htmlCollageInstantane deja gate sur la phase
    // 'revenu'), 4) les coordonnees (necessaires a l'en-tete de la lettre)
    // n'apparaissent qu'a ce moment-la, juste avant le bouton "Importer" --
    // voir leur nouvel emplacement plus bas, dans le 2e argument de
    // htmlCollageInstantane.
    htmlCopierCv +
    // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
    // CV/Lettre/Entretien") : meme banniere partagee que la page Action/
    // Decouverte/le depot CV (htmlBanniereTransitionIA(), js/app.js) --
    // decompte/popup bloque/bouton "Je suis de retour", jamais une 2e
    // version dupliquee du texte.
    '<p class="small text-muted mb-2">Quand l’assistant aura terminé et vous aura donné le texte complet de la ' +
    'lettre à copier, revenez sur cette page et cliquez sur « Je suis de retour ».</p>' +
    htmlBanniereTransitionIA() +
    '<p class="text-muted small">Une fois votre lettre finalisée avec l’assistant, copiez sa toute dernière ' +
    'réponse (celle qui contient la lettre complète), puis revenez ici : cliquez sur le bouton ci-dessous pour la ' +
    'coller automatiquement. Si le clic ne fonctionne pas, un bouton « Coller manuellement » est disponible juste ' +
    'en dessous.</p>' +
    // TACHE (retour utilisateur 2026-09-17, point 4) : jusqu'ici, cet ecran
    // reconstruisait sa propre mise en forme (DOCX/Apercu-Imprimer/version
    // courte, 3 boutons + un panneau iframe dedie) au lieu de reprendre
    // l'interface moderne deja utilisee par "Préparer ma lettre et mon
    // entretien" (le panneau "La mise en page"/"Exporter" de "Vos documents",
    // pageResultats()/js/app.js -- bascule Feuille A4/Message par mail,
    // apercu, telechargement, deja la SOURCE UNIQUE pour toute lettre du
    // dossier). Un seul bouton "Importer" desormais : il ecrit
    // dossier.ia.lettre (voir plus bas) puis navigue direct vers "Vos
    // documents", qui prend le relais entierement -- "Terminé" n'a donc plus
    // de raison d'etre sur CET ecran (la navigation EST l'action de fin).
    // TACHE (retour utilisateur 2026-09-17) : "Vos coordonnées" deplace ICI
    // (2e argument de htmlCollageInstantane, la zone d'actions revelee
    // seulement apres un collage reussi) -- napparait donc qu'une fois la
    // personne revenue AVEC la reponse de l'assistant, juste avant le bouton
    // "Importer", pour garantir qu'elle passe par les coordonnees avant de
    // quitter cet ecran vers "Vos documents".
    htmlCollageInstantane('LettreV1',
      _coLettreBlocCoordonnees() +
      '<div class="d-flex gap-2 mb-2 mt-2 flex-wrap">' +
      '<button type="button" id="btnImporterLettreV1" class="btn btn-primary">&#128229; Importer ma lettre &#8594;</button>' +
      '<button type="button" id="btnEffacerRecollerLettreV1" class="btn btn-outline-secondary">Effacer et recoller</button>' +
      '</div>') +
    '<div id="messageRecuperationLettreV1" class="small mb-2"></div>' +
    (estImage ? htmlBlocAstuceImageRefusee() : '');

  app.innerHTML = '<div class="page-catalogue-contenu co-lettre-parcours">' +
    barreEtapesModule(CO_LETTRE_NAV_ETAPES, 2) + _coLettreBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-pen"></i> En attente de votre lettre de motivation</h1></div>' +
    '<div class="cv-section">' + contenuHTML + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_coLettreRetourChoixAssistant()' }) + '</div>';
  _coLettreBrancherBandePresentation();
  _coLettreBrancherCoordonnees();
  if (typeof trackEvenement === 'function') { trackEvenement('co_lettre_reponse_affichee'); }

  // TACHE (retour utilisateur 2026-09-17, point 4) : l'ancien bouton
  // "Terminé, merci !" (et le "Retour" qu'il fallait deja corriger, voir
  // commit precedent) disparait avec les 3 boutons DOCX/Apercu/version
  // courte -- l'import (plus bas, btnImporterLettreV1) navigue desormais
  // lui-meme directement vers "Vos documents" des qu'il reussit.
  var message = document.getElementById('messageRecuperationLettreV1');

  var btnCopierCv = document.getElementById('btnCopierCvLettreV1');
  if (btnCopierCv) {
    btnCopierCv.addEventListener('click', function () {
      // TACHE (retour utilisateur 2026-09-17) : ne se contente plus d'un
      // texte "Copié" transitoire -- pose _coLettreCvCopie durablement et
      // re-rend tout l'ecran, ce qui debloque "Je suis de retour" (voir plus
      // bas) et affiche la confirmation persistante sous ce bouton.
      function confirmerCopie() {
        _coLettreCvCopie = true;
        _coLettreRendreReponse();
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texteCV).then(confirmerCopie).catch(function () {
          var z = document.createElement('textarea');
          z.value = texteCV;
          document.body.appendChild(z);
          z.select();
          document.execCommand('copy');
          z.remove();
          confirmerCopie();
        });
      }
    });
  }

  // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a CV/
  // Lettre/Entretien") : etat desactive/actif du rond bleu + decompte/
  // bannieres -- copie adaptee du meme bloc que les 3 autres parcours
  // (page Action/Decouverte/depot CV). btnJeSuisDeRetourIA reprend le
  // MEME id que les 3 autres : installerEcouteurVisibiliteRetourIA() (deja
  // installe globalement, js/app.js) intensifie donc son pulse au retour
  // de visibilite de l'onglet, sans code supplementaire ici.
  var btnCollerAutoLettreV1 = document.getElementById('btnCollerAutoLettreV1');
  var texteBtnCollerAutoLettreV1 = document.getElementById('texteBtnCollerAutoLettreV1');
  if (_etatTransitionIA && btnCollerAutoLettreV1) {
    if (_etatTransitionIA.phase === 'revenu') {
      btnCollerAutoLettreV1.disabled = false;
      btnCollerAutoLettreV1.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
      btnCollerAutoLettreV1.classList.add('pulse-collage-retour');
      if (texteBtnCollerAutoLettreV1) { texteBtnCollerAutoLettreV1.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
    } else {
      btnCollerAutoLettreV1.disabled = true;
      btnCollerAutoLettreV1.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
      btnCollerAutoLettreV1.classList.add('rond-collage-desactive');
      if (texteBtnCollerAutoLettreV1) { texteBtnCollerAutoLettreV1.textContent = 'Ce bouton s’activera à votre retour.'; }
    }

    function ouvrirAssistantLettreV1EnAttente() {
      // TACHE (bug reel trouve en construisant ce chantier : "fermer la
      // fenetre pendant le decompte ouvre quand meme un popup 5s plus
      // tard") : fermerFenetreERIP() DETRUIT #fenetreERIP -- sans ce
      // garde-fou, le minuteur du decompte survivrait a la fermeture et
      // rouvrirait un onglet + une fenetre "en attente" surprise, meme
      // apres que la personne ait explicitement ferme. btnCollerAutoLettreV1
      // n'existe QUE si cet ecran precis de CE parcours est toujours affiche
      // (jamais confondu avec une autre fenetre ERIP ouverte entre-temps,
      // qui partagerait le meme id #fenetreERIP generique).
      if (!document.getElementById('btnCollerAutoLettreV1')) { clearInterval(_intervalleDecompteIA); return; }
      // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
      // (js/app.js) -- meme correctif, tous les parcours.
      recopierTexteAssistantPuisOuvrir(function () {
        var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
        _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
        // TACHE (retour utilisateur : "je veux bien aussi" le suivi popup
        // bloque pour ces 3 nouveaux parcours) : mesure combien de
        // navigateurs bloquent reellement l'ouverture automatique.
        if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') {
          trackEvenement('lettre_popup_bloque');
        }
        _coLettreRendreReponse();
      });
    }

    if (_etatTransitionIA.phase === 'decompte') {
      var btnContinuerMaintenantIA = document.getElementById('btnContinuerMaintenantIA');
      if (btnContinuerMaintenantIA) {
        btnContinuerMaintenantIA.addEventListener('click', function () {
          clearInterval(_intervalleDecompteIA);
          ouvrirAssistantLettreV1EnAttente();
        });
      }
      _intervalleDecompteIA = setInterval(function () {
        _etatTransitionIA.secondesRestantes -= 1;
        var compteurDecompteIA = document.getElementById('compteurDecompteIA');
        if (compteurDecompteIA) { compteurDecompteIA.textContent = _etatTransitionIA.secondesRestantes; }
        if (_etatTransitionIA.secondesRestantes <= 0) {
          clearInterval(_intervalleDecompteIA);
          ouvrirAssistantLettreV1EnAttente();
        }
      }, 1000);
    } else if (_etatTransitionIA.phase === 'bloque') {
      var btnOuvrirBloqueIA = document.getElementById('btnOuvrirBloqueIA');
      if (btnOuvrirBloqueIA) {
        btnOuvrirBloqueIA.addEventListener('click', function () { ouvrirAssistantLettreV1EnAttente(); });
      }
    } else if (_etatTransitionIA.phase === 'ouvert') {
      var btnJeSuisDeRetourIA = document.getElementById('btnJeSuisDeRetourIA');
      if (btnJeSuisDeRetourIA) {
        // TACHE (retour utilisateur 2026-09-17) : tant que le CV texte n'a
        // pas ete copie (attendCopieCv), "Je suis de retour" reste bloque --
        // dans l'ordre reel du parcours, revenir confirmer sans avoir encore
        // colle son CV chez l'assistant n'a pas de sens. Meme classe grisee
        // que le rond "Coller la reponse" desactive (.rond-collage-
        // desactive, css/style.css), source unique pour cet etat visuel.
        // Sans CV texte (image/PDF, deja transmis a l'etape precedente),
        // aucune raison d'attendre : comportement inchange.
        if (attendCopieCv) {
          btnJeSuisDeRetourIA.disabled = true;
          btnJeSuisDeRetourIA.classList.remove('bouton-incitation-action');
          btnJeSuisDeRetourIA.classList.add('rond-collage-desactive');
          btnJeSuisDeRetourIA.title = 'Copiez d’abord votre CV ci-dessus.';
        } else {
          // TACHE (decision explicite de l'utilisateur, chantier "ecran
          // tampon avant l’assistant") : retour MANUEL uniquement, jamais de
          // detection automatique -- meme regle que les 3 autres parcours.
          btnJeSuisDeRetourIA.addEventListener('click', function () {
            _etatTransitionIA.phase = 'revenu';
            _coLettreRendreReponse();
          });
        }
      }
    }
  }

  activerCollageInstantane({
    idZoneAuto: 'zoneCollageAutoLettreV1', idZoneApercu: 'zoneApercuCollageLettreV1',
    idTextarea: 'texteCollageLettreV1', idBoutonColler: 'btnCollerAutoLettreV1',
    idBoutonCollerManuel: 'btnCollerManuelLettreV1', idBoutonEffacerRecoller: 'btnEffacerRecollerLettreV1',
    idBoutonImporter: 'btnImporterLettreV1',
    onErreur: function (msg) { message.style.color = 'var(--danger)'; message.textContent = '⚠️ ' + msg; },
    onEffacer: function () { message.textContent = ''; },
    onSucces: function (texte, estAjout) { message.style.color = 'var(--success-strong)'; message.textContent = estAjout ? '✅ Morceau suivant ajouté à la suite. Copiez le prochain morceau puis recliquez, ou cliquez Importer si c’était le dernier.' : '✅ Réponse importée automatiquement depuis le presse-papiers. Si la réponse de l’assistant fait plusieurs morceaux, copiez le morceau suivant puis cliquez sur "Coller un morceau supplémentaire", juste en dessous : il s’ajoutera à la suite.'; },
    onCollerManuel: function () { message.textContent = ''; }
  });

  // TACHE (retour utilisateur 2026-09-17, point 4) : remplace les 3 anciens
  // boutons (DOCX/Apercu-Imprimer/version courte, chacun re-analysant la
  // meme reponse independamment) par un seul import, meme forme que
  // wireImportIA() (js/app.js, branche type==='lettre') -- versions[] +
  // versionActive, pour que le carrousel de "La mise en page" (pageResultats(),
  // meme mecanisme que "Préparer ma lettre et mon entretien") fonctionne
  // ensuite normalement. Reussite -> navigation directe vers "Vos
  // documents" : cet ecran n'a plus besoin de generer quoi que ce soit
  // lui-meme, ni d'un bouton "Termine" separe (la navigation EST la fin).
  document.getElementById('btnImporterLettreV1').addEventListener('click', function () {
    var texte = document.getElementById('texteCollageLettreV1').value;
    if (!texte.trim()) {
      message.style.color = 'var(--danger)';
      message.textContent = '⚠️ Collez d’abord la réponse de l’assistant dans la zone ci-dessus.';
      return;
    }
    var resultat = (typeof analyserReponseIALettre === 'function')
      ? analyserReponseIALettre(texte)
      : { succes: false, erreur: 'Fonction d’analyse indisponible pour le moment.' };
    if (!resultat.succes) {
      message.style.color = 'var(--danger)';
      message.textContent = '⚠️ ' + resultat.erreur;
      return;
    }
    // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
    // CV/Lettre/Entretien") : import reellement termine -- la transition
    // en attente n'a plus lieu d'etre (meme reinitialisation que dans les
    // 3 autres parcours).
    _etatTransitionIA = null;
    if (!dossier.ia) { dossier.ia = creerDossierIAVide(); }
    if (!dossier.ia.lettre) { dossier.ia.lettre = {}; }
    dossier.ia.lettre.accroche = resultat.valeurs.accroche;
    dossier.ia.lettre.arguments = resultat.valeurs.arguments;
    var versionsRecues = resultat.valeurs.versions || [];
    var v0 = versionsRecues[0] || { objet: '', texte: '', texteCourt: '' };
    dossier.ia.lettre.versions = versionsRecues;
    dossier.ia.lettre.versionActive = 0;
    dossier.ia.lettre.lettre = { objet: v0.objet, texte: v0.texte, texteCourt: v0.texteCourt || '' };
    dossier.dernierDocumentPrepare = 'lettre';
    // TACHE (retour utilisateur 2026-09-17, point 8 : "Vos documents" apres
    // "Co-construire ma lettre" affichait l'ancienne barre a 9 reperes --
    // afficherProgression()/js/app.js ne reconnaissait que dossier.modeCreation
    // 'pret'/'maj', jamais mis a jour par ce parcours) : meme patron que
    // dossier._origineReformuler (reformuler-cv) -- signale a pageResultats()
    // que ce document vient de co-lettre, jamais du pipeline 'pret'/'maj'/
    // 'nouveau'. Lu par afficherProgression() et pageResultats() (js/app.js).
    dossier._origineCoLettre = true;
    if (typeof trackEvenement === 'function') { trackEvenement('lettre_generee'); }
    naviguerVers('resultats');
  });
}

// TACHE (migration Design System - Phase 2, chantier "metiers.js", 3e
// migration) : devient une recette qui appelle la primitive
// ouvrirFenetreERIP(). Contrat public strictement inchange -- appelee
// depuis demarrerEnvoiIAEntretien() apres une operation asynchrone
// (copie presse-papiers), sans aucune incidence sur la primitive.
function fermerRecuperationEntretien() {
  fermerFenetreERIP();
}

// TACHE (Preparer un entretien, Etape 5) : fenetre "en attente de votre
// reponse", affichee immediatement au moment de quitter l'appli pour
// l'assistant choisi.
// TACHE (retour utilisateur : nettoyage + DOCX répare) : le carre
// "Agrandir" et le bouton "Enregistrer en PDF" sont retires (plus
// d'actualite). Le bouton DOCX ne se contentait plus que de coller le
// texte brut tel quel dans l'ancien mecanisme html-docx.js (echouait
// silencieusement si le texte etait vide -- "ne fait rien"). Il analyse
// desormais reellement la reponse collee (analyserReponseIAEntretien,
// deja existante), l'enregistre dans dossier.ia.entretien, puis genere le
// VRAI document Word natif (genererDocxNatifEntretien, deja construite --
// meme mise en forme pistes/amorce que partout ailleurs dans l'appli,
// aucune logique dupliquee).
// ---------- Ecran "Coller la reponse" (remplace la fenetre ouvrirRecuperationEntretien) ----------

// TACHE (chantier "elimination des fenetres de depot CV", module 3/3,
// 2026-09-04) : meme contenu et memes mecanismes EXACTEMENT (decompte,
// popup bloque, "je suis de retour", collage instantane, analyse,
// generation DOCX) -- seul le conteneur change (page au lieu de
// ouvrirFenetreERIP). "Terminé" navigue vers "Vos documents" au lieu de
// fermer une fenetre.
function _prepaEntretienRendreReponse() {
  // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a CV/
  // Lettre/Entretien") : coupe systematiquement tout decompte herite d'un
  // rendu precedent AVANT de reconstruire quoi que ce soit -- cette
  // fonction se rappelle elle-meme a chaque changement de phase (voir plus
  // bas), meme precaution que les 3 autres parcours.
  clearInterval(_intervalleDecompteIA);
  var contenuHTML =
    // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
    // CV/Lettre/Entretien") : meme banniere partagee que les 3 autres
    // parcours (htmlBanniereTransitionIA(), js/app.js) -- decompte/popup
    // bloque/bouton "Je suis de retour", jamais une 2e version dupliquee.
    htmlBanniereTransitionIA() +
    '<p class="text-muted small">Une fois la réponse de l’assistant affichée, copiez-la (bouton "Copier" de ' +
    'l’assistant), puis revenez ici : cliquez sur le bouton ci-dessous pour la coller automatiquement. Si le clic ' +
    'ne fonctionne pas, un bouton « Coller manuellement » est disponible juste en dessous.</p>' +
    // TACHE (retour utilisateur 2026-09-17, "je veux récupérer la même
    // interface pour visualiser que j'ai pour Co-construire ma lettre --
    // là ça manque de clarté, je ne peux voir le fichier qu'en le
    // téléchargeant") : jusqu'ici, cet écran générait lui-même le DOCX au
    // clic (genererDocxNatifEntretien(), aucun aperçu, juste un
    // téléchargement brut) et gardait son propre bouton "Terminé, merci !".
    // Remplacé par un seul bouton "Importer" (même patron que co-lettre,
    // point 4 du 2026-09-17) : il écrit dossier.ia.entretien puis navigue
    // directement vers "Vos documents", qui a DÉJÀ son propre aperçu +
    // impression + export pour l'entretien (chargerApercuEntretienInline(),
    // js/app.js -- même mécanisme que pour la lettre, vérifié avant ce
    // chantier) -- source unique pour tout document du dossier, jamais une
    // 2e généré ici sans aperçu.
    htmlCollageInstantane('Entretien',
      '<div class="d-flex gap-2 mb-2 mt-2 flex-wrap">' +
      '<button type="button" id="btnImporterEntretien" class="btn btn-primary">&#128229; Importer ma préparation &#8594;</button>' +
      '<button type="button" id="btnEffacerRecollerEntretien" class="btn btn-outline-secondary">Effacer et recoller</button>' +
      '</div>') +
    '<div id="messageRecuperationEntretien" class="small mb-2"></div>';

  app.innerHTML = '<div class="page-catalogue-contenu">' +
    barreEtapesModule(PREPA_ENTRETIEN_NAV_ETAPES, 2) + _prepaEntretienBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-mic"></i> En attente de votre préparation d’entretien</h1></div>' +
    '<div class="cv-section">' + contenuHTML + '</div>' +
    '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_prepaEntretienRetourChoixAssistant()' }) + '</div>';
  _prepaEntretienBrancherBandePresentation();
  if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_reponse_affichee'); }

  var message = document.getElementById('messageRecuperationEntretien');

  // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a CV/
  // Lettre/Entretien") : etat desactive/actif du rond bleu + decompte/
  // bannieres -- copie adaptee du meme bloc que les 3 autres parcours.
  // btnJeSuisDeRetourIA reprend le MEME id que les 3 autres :
  // installerEcouteurVisibiliteRetourIA() (deja installe globalement,
  // js/app.js) intensifie donc son pulse au retour de visibilite de
  // l'onglet, sans code supplementaire ici.
  var btnCollerAutoEntretien = document.getElementById('btnCollerAutoEntretien');
  var texteBtnCollerAutoEntretien = document.getElementById('texteBtnCollerAutoEntretien');
  if (_etatTransitionIA && btnCollerAutoEntretien) {
    if (_etatTransitionIA.phase === 'revenu') {
      btnCollerAutoEntretien.disabled = false;
      btnCollerAutoEntretien.classList.remove('rond-collage-desactive', 'bouton-incitation-action');
      btnCollerAutoEntretien.classList.add('pulse-collage-retour');
      if (texteBtnCollerAutoEntretien) { texteBtnCollerAutoEntretien.textContent = 'Cliquez ici pour coller la réponse copiée.'; }
    } else {
      btnCollerAutoEntretien.disabled = true;
      btnCollerAutoEntretien.classList.remove('bouton-incitation-action', 'pulse-collage-retour');
      btnCollerAutoEntretien.classList.add('rond-collage-desactive');
      if (texteBtnCollerAutoEntretien) { texteBtnCollerAutoEntretien.textContent = 'Ce bouton s’activera à votre retour.'; }
    }

    function ouvrirAssistantEntretienEnAttente() {
      // TACHE (bug reel trouve en construisant ce chantier, voir CV/
      // LettreV1) : fermerFenetreERIP() DETRUIT #fenetreERIP -- sans ce
      // garde-fou, le minuteur du decompte survivrait a une fermeture
      // explicite et rouvrirait un onglet + une fenetre "en attente"
      // surprise.
      if (!document.getElementById('btnCollerAutoEntretien')) { clearInterval(_intervalleDecompteIA); return; }
      // TACHE (retour Denis, 2026-09-19, point 4) : voir recopierTexteAssistantPuisOuvrir()
      // (js/app.js) -- meme correctif, tous les parcours.
      recopierTexteAssistantPuisOuvrir(function () {
        var fenetreOuverte = window.open(_etatTransitionIA.urlAssistant, '_blank');
        _etatTransitionIA.phase = fenetreOuverte ? 'ouvert' : 'bloque';
        // TACHE (retour utilisateur : "je veux bien aussi" le suivi popup
        // bloque pour ces 3 nouveaux parcours) : mesure combien de
        // navigateurs bloquent reellement l'ouverture automatique.
        if (_etatTransitionIA.phase === 'bloque' && typeof trackEvenement === 'function') {
          trackEvenement('entretien_popup_bloque');
        }
        _prepaEntretienRendreReponse();
      });
    }

    if (_etatTransitionIA.phase === 'decompte') {
      var btnContinuerMaintenantIA = document.getElementById('btnContinuerMaintenantIA');
      if (btnContinuerMaintenantIA) {
        btnContinuerMaintenantIA.addEventListener('click', function () {
          clearInterval(_intervalleDecompteIA);
          ouvrirAssistantEntretienEnAttente();
        });
      }
      _intervalleDecompteIA = setInterval(function () {
        _etatTransitionIA.secondesRestantes -= 1;
        var compteurDecompteIA = document.getElementById('compteurDecompteIA');
        if (compteurDecompteIA) { compteurDecompteIA.textContent = _etatTransitionIA.secondesRestantes; }
        if (_etatTransitionIA.secondesRestantes <= 0) {
          clearInterval(_intervalleDecompteIA);
          ouvrirAssistantEntretienEnAttente();
        }
      }, 1000);
    } else if (_etatTransitionIA.phase === 'bloque') {
      var btnOuvrirBloqueIA = document.getElementById('btnOuvrirBloqueIA');
      if (btnOuvrirBloqueIA) {
        btnOuvrirBloqueIA.addEventListener('click', function () { ouvrirAssistantEntretienEnAttente(); });
      }
    } else if (_etatTransitionIA.phase === 'ouvert') {
      var btnJeSuisDeRetourIA = document.getElementById('btnJeSuisDeRetourIA');
      if (btnJeSuisDeRetourIA) {
        // TACHE (decision explicite de l'utilisateur, chantier "ecran
        // tampon avant l’assistant") : retour MANUEL uniquement, jamais de
        // detection automatique -- meme regle que les 3 autres parcours.
        btnJeSuisDeRetourIA.addEventListener('click', function () {
          _etatTransitionIA.phase = 'revenu';
          _prepaEntretienRendreReponse();
        });
      }
    }
  }

  activerCollageInstantane({
    idZoneAuto: 'zoneCollageAutoEntretien',
    idZoneApercu: 'zoneApercuCollageEntretien',
    idTextarea: 'texteCollageEntretien',
    idBoutonColler: 'btnCollerAutoEntretien',
    idBoutonCollerManuel: 'btnCollerManuelEntretien',
    idBoutonEffacerRecoller: 'btnEffacerRecollerEntretien',
    idBoutonImporter: 'btnImporterEntretien',
    onErreur: function (msg) { message.style.color = 'var(--danger)'; message.textContent = '⚠️ ' + msg; },
    onEffacer: function () { message.textContent = ''; },
    onSucces: function (texte, estAjout) { message.style.color = 'var(--success-strong)'; message.textContent = estAjout ? '✅ Morceau suivant ajouté à la suite. Copiez le prochain morceau puis recliquez, ou cliquez Importer si c’était le dernier.' : '✅ Réponse importée automatiquement depuis le presse-papiers. Si la réponse de l’assistant fait plusieurs morceaux, copiez le morceau suivant puis cliquez sur "Coller un morceau supplémentaire", juste en dessous : il s’ajoutera à la suite.'; },
    onCollerManuel: function () { message.textContent = ''; }
  });

  // TACHE (retour utilisateur 2026-09-17, meme patron que co-lettre) : un
  // seul bouton "Importer" -- ecrit dossier.ia.entretien puis navigue direct
  // vers "Vos documents", qui prend le relais entierement (apercu +
  // impression + export, deja la source unique pour ce document). Plus de
  // generation DOCX ni de bouton "Terminé" ici : la navigation EST l'action
  // de fin.
  document.getElementById('btnImporterEntretien').addEventListener('click', function () {
    var texte = document.getElementById('texteCollageEntretien').value;
    if (!texte.trim()) {
      message.style.color = 'var(--danger)';
      message.textContent = '⚠️ Collez d’abord la réponse de l’assistant dans la zone ci-dessus.';
      return;
    }
    var resultat = analyserReponseIAEntretien(texte);
    if (!resultat.succes) {
      message.style.color = 'var(--danger)';
      message.textContent = '⚠️ ' + resultat.erreur;
      return;
    }
    // TACHE (retour utilisateur : "etendre l'ecran tampon avant l’assistant a
    // CV/Lettre/Entretien") : import reellement termine -- la transition
    // en attente n'a plus lieu d'etre (meme reinitialisation que dans les
    // 3 autres parcours).
    _etatTransitionIA = null;
    if (!dossier.ia) { dossier.ia = creerDossierIAVide(); }
    if (!dossier.ia.entretien) { dossier.ia.entretien = {}; }
    dossier.ia.entretien.presentation = resultat.valeurs.presentation;
    dossier.ia.entretien.pointsAPreparer = resultat.valeurs.pointsAPreparer;
    dossier.ia.entretien.questionsAnticipees = resultat.valeurs.questionsAnticipees;
    dossier.ia.entretien.questionsDuCandidat = resultat.valeurs.questionsDuCandidat;
    dossier.dernierDocumentPrepare = 'entretien';
    _prepaEntretienEcran = 'intro';
    if (typeof trackEvenement === 'function') { trackEvenement('entretien_genere'); }
    naviguerVers('resultats');
  });
}

// TACHE (Preparer un entretien, Etapes 4 et 5) : enchaine automatiquement --
// des le clic sur un assistant, celui-ci s'ouvre ET la fenetre de
// recuperation apparait dans le meme geste (demande explicitement).
// TACHE (chantier "fenetre de verification unifiee") : ouvre desormais
// ouvrirFenetreAssistantIA() (js/app.js, meme fonction que la page Action)
// -- meme "Avant de continuer" (etapes, aperçu du rond bleu, decompte) que
// les 3 autres parcours, au lieu de copier le presse-papiers puis
// enchainer directement. Ce raccourci transmet toujours du texte (jamais
// d'image), ETAPES_ASSISTANT_IA_TEXTE convient donc sans variante.
function demarrerEnvoiIAEntretien(assistant) {
  ouvrirFenetreAssistantIA({
    nomAssistant: assistant.nom,
    idAssistant: assistant.id,
    urlAssistant: assistant.url,
    etapes: ETAPES_ASSISTANT_IA_TEXTE,
    construireTexteACopier: function () {
      // Option A (decision v3 point 17, actee Denis 2026-09-03) : ce chemin
      // (module dedie "Preparer un entretien" de l'accueil + choix explicite
      // "entretien" depuis une fiche metier -- ouvrirParcoursEntretien) est
      // devenu celui du COACHING LONG par echanges : prompt 'entretien'
      // (accompagnement progressif). Le format court 'entretien-accueil'
      // (tout livre en une reponse) est desormais celui du pipeline de
      // candidature -- cartes "pret" / "maj" (voir wireChoixAssistantIA,
      // js/app.js). texteProfilEffectif() respecte une eventuelle correction
      // manuelle faite via "Verifier les informations".
      return promptCache('entretien', texteProfilEffectif('entretien'));
    },
    onApresValidation: function (urlAssistant, nomAssistant) {
      _etatTransitionIA = { urlAssistant: urlAssistant, nomAssistant: nomAssistant, phase: 'decompte', secondesRestantes: 5 };
      _prepaEntretienEcran = 'reponse';
      naviguerVers('prepa-entretien');
    }
  });
}

// TACHE (correction bug : page Action bloquee, comportement inchange) : ce
// raccourci ne passe jamais par le clic sur une carte (pageResultats()),
// qui est le seul autre endroit initialisant cette etape -- sans cette
// ligne, la page Action affiche "carteChoisie" vrai mais aucun accordeon
// jamais "atteint", et reste bloquee en permanence (meme pour les autres
// cartes). Meme convention deja utilisee ailleurs (app.js, boutons
// btnSuggererLettre/btnSuggererEntretien).
function _prepaEntretienEntrerChoixAssistant() {
  dossier.dernierDocumentPrepare = 'entretien';
  etatAccordeon['adaptation-metier'] = etatAccordeon['adaptation-metier'] || false;
  _prepaEntretienEcran = 'choix-assistant';
  naviguerVers('prepa-entretien');
}

// ---------- Ecran "Preparer" (remplace les 3 blocs CV/Lettre/Entreprise-poste) ----------

// TACHE (retour utilisateur 2026-09-17, "je veux que la 1ere page de ce
// module soit exactement la meme que Co-construire ma lettre") : reprend
// le MEME patron a 4 blocs deplies que _coLettreRendreDepot() (plus haut
// dans ce fichier) -- CV, relecture/masquage, candidature (memes briques
// partagees contenuCandidature()/contenuModeRecherche()/OBJECTIF_CHOIX_CANDIDATURE),
// adaptation au metier (contenuRectangleStyleCV()) -- a la place de
// l'ancien systeme propre a ce module (htmlVerificationDocument() embarque
// a ids fixes + formulaire separe "Entreprise et poste vise" qui ecrivait
// dans dossier.entretienDirect). Verifie avant ce chantier : texteProfil('entretien')
// (js/app.js) lit deja dossier.objectif/rechercheCandidature/
// preferencesIAParType.entretien/situationActuelle SANS aucune condition
// de module -- ces 4 blocs alimentent donc automatiquement le prompt
// entretien, sans modification de texteProfil().
// Seule difference demandee avec co-lettre : le bloc 1 accueille aussi, en
// option, la lettre de motivation deja ecrite (utile pour personnaliser
// l'entretien) -- il ne se referme donc qu'une fois le CV depose ET la
// question de la lettre tranchee (deposee ou "je n'en ai pas"), jamais au
// seul depot du CV.
var _prepaEntretienDocumentCv = null; // { type: 'texte' | 'image', valeur } -- comme _coLettreDocument
var _prepaEntretienCvRelu = false;
var _prepaEntretienDocumentLettre = null; // null | 'skip' | { type: 'texte', valeur }
// TACHE (retour utilisateur 2026-09-17, "ajoute la relecture et le masquage
// pour la lettre aussi") : meme principe que _prepaEntretienCvRelu.
var _prepaEntretienLettreRelue = false;

// TACHE (meme raison que ouvrirAssistantDepotCV() plus haut, ligne ~3006) :
// le wizard ecrit deja dossier.cvTexte en clair des l'etape 1 (extraction
// brute), JAMAIS remis a jour ensuite avec la version masquee -- sans
// changement ici, texteProfil('entretien') enverrait le CV brut malgre la
// relecture du bloc 2. Chaque mise a jour de _prepaEntretienDocumentCv.valeur
// (depot initial ET relecture) recopie donc aussi dans dossier.cvTexte,
// seul champ relu par texteProfil() pour ce module.
function _prepaEntretienSyncCvTexte(texte) {
  dossier.cvTexte = texte || '';
  dossier.cvAnalyse = true;
}

// Page unique "Preparer un entretien" -- CV (+ lettre), relecture,
// candidature, adaptation au metier : 4 blocs deplies, meme mecanique que
// _coLettreRendreDepot() (auto-avancement par simple re-rendu complet a
// chaque changement d'etat).
function _prepaEntretienRendrePreparer() {
  var cvPresent = !!_prepaEntretienDocumentCv;
  var estImage = cvPresent && _prepaEntretienDocumentCv.type === 'image';
  var cvRelu = cvPresent && (estImage || _prepaEntretienCvRelu);
  var lettrePresente = !!(_prepaEntretienDocumentLettre && _prepaEntretienDocumentLettre !== 'skip');
  var lettreRelue = lettrePresente && _prepaEntretienLettreRelue;
  // TACHE (retour utilisateur 2026-09-17, "ajoute la relecture et le
  // masquage pour la lettre aussi") : une lettre deposee doit desormais
  // etre relue AVANT d'etre consideree "tranchee" -- sinon le CTA final
  // pourrait s'activer avec une lettre encore brute (non masquee) en
  // attente de depart vers l'assistant.
  var lettreTranchee = _prepaEntretienDocumentLettre === 'skip' || lettreRelue;
  // TACHE (retour utilisateur : "une fois le CV insere, [le bloc 1] ne va
  // pas se fermer -- il faut laisser la place de mettre la lettre de
  // motivation aussi") : contrairement au bloc 1 de co-lettre (qui se
  // referme des le CV depose), celui-ci reste ouvert tant que la question
  // de la lettre n'a pas ete tranchee, deposee ET relue, ou explicitement
  // absente.
  var bloc1Termine = cvPresent && lettreTranchee;

  var candidatureRenseignee = !!dossier.objectif;
  var estStageAlternancePmsmp = !!dossier.objectif && ['stage', 'alternance', 'pmsmp'].indexOf(dossier.objectif) !== -1;
  // Meme signal que co-lettre (civiliteRecruteurTouchee) pour les 6
  // objectifs -- voir le commentaire equivalent de _coLettreRendreDepot()
  // pour le detail du raisonnement (bug corrige le meme jour : le bloc ne
  // doit se refermer qu'a cette vraie reponse, pas au 1er clic suivant).
  var etapeCleCandidatureFranchie = !!(dossier.rechercheCandidature && dossier.rechercheCandidature.civiliteRecruteurTouchee);
  var prefsEntretienCourantes = dossier.preferencesIAParType.entretien;
  if (typeof appliquerDefautsStyleCV === 'function') { appliquerDefautsStyleCV('entretien'); }
  // Meme calcul que co-lettre : "personnalise" ne compte que niveauPoste/
  // situationActuelle (jamais de defaut) ou un ecart reel par rapport au
  // defaut -- jamais la simple presence d'une valeur auto-remplie.
  var stylePersonnalise = !!(prefsEntretienCourantes.niveauPoste || dossier.situationActuelle ||
    (prefsEntretienCourantes.niveauLangage && prefsEntretienCourantes.niveauLangage !== STYLE_CV_DEFAUTS.niveauLangage) ||
    (prefsEntretienCourantes.adaptationMetier && prefsEntretienCourantes.adaptationMetier !== STYLE_CV_DEFAUTS.adaptationMetier) ||
    (prefsEntretienCourantes.ton && prefsEntretienCourantes.ton !== STYLE_CV_DEFAUTS.ton) ||
    (prefsEntretienCourantes.longueur && prefsEntretienCourantes.longueur !== STYLE_CV_DEFAUTS.longueur));

  var html = barreEtapesModule(PREPA_ENTRETIEN_NAV_ETAPES, 0) + _prepaEntretienBandePresentation() +
    '<div class="text-center"><h1><i class="bi bi-mic"></i> Préparer un entretien d’embauche ' +
    // TACHE (retour utilisateur 2026-09-17, "il faudra dire aussi que pour
    // ceux qui ont un compte payant avec la fonction vocale, ils peuvent
    // l'activer") : bulle d'info reprise a l'identique de l'ancien ecran
    // (perdue par erreur lors de la refonte sur le patron co-lettre) --
    // meme texte, meme mecanisme (ouvrirBulleAide()).
    '<button type="button" id="btnInfoDepotEntretien" title="Astuce" class="btn btn-sm btn-outline-secondary" ' +
    'style="border-radius:50%;width:26px;height:26px;padding:0;font-weight:700;">i</button></h1>' +
    '<p class="sousTitre">Tout se prépare ici, sur une seule page qui se déplie. On part de votre CV, puis on précise le poste et l’entreprise.</p></div>' +
    '<details class="bloc-depli' + (bloc1Termine ? ' bd-ok' : '') + '" id="prepaEntretienBlocCv"' + (!bloc1Termine ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">1</span><span class="preparer-titre">Votre CV</span>' +
    '<span class="preparer-oblig">obligatoire</span>' +
    '<span class="pilule-etat ' + (cvPresent ? 'pe-ok">Déposé &middot; vous pouvez le changer' : 'pe-attente">À déposer') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (cvPresent
      ? '<div class="carte-preparer-ok"><strong>&#9989; Déposé</strong>' +
        '<button type="button" id="btnPrepaEntretienChangerCv" class="btn btn-outline-secondary btn-sm ms-2">Changer de CV</button></div>' +
        '<p class="preparer-detail">Un seul CV à la fois. « Changer de CV » remplace celui-ci.</p>'
      : '<p>Sans CV, difficile de préparer un entretien : déposez-le, ou collez son texte. Il est lu directement ' +
        'dans votre navigateur, <strong>il n’est envoyé nulle part</strong> à ce stade.</p>' +
        '<div class="d-flex gap-2 flex-wrap">' +
        '<button type="button" id="btnPrepaEntretienDeposerCv" class="btn btn-primary btn-sm">Déposer mon fichier</button>' +
        '<button type="button" id="btnPrepaEntretienCollerCv" class="btn btn-outline-secondary btn-sm">Ou coller le texte</button>' +
        '</div>' +
        '<p class="preparer-detail"><strong>Tous les formats sont acceptés</strong> : PDF, Word, .txt, une photo ou une capture d’écran. Pour une photo ou un scan, une fenêtre s’ouvre le temps de préparer l’image, puis vous revenez ici.</p>' +
        '<div id="prepaEntretienCollerCvZone" hidden class="mt-2">' +
        '<textarea id="prepaEntretienCollerCvTexte" class="form-control form-control-sm" rows="6" placeholder="Collez ici le texte de votre CV"></textarea>' +
        '<div class="mt-2"><button type="button" id="btnPrepaEntretienCollerCvValider" class="btn btn-outline-secondary btn-sm">Annuler</button></div>' +
        '</div>') +
    // TACHE (retour utilisateur, "une ligne supplementaire au 1er point") :
    // la lettre de motivation vit ICI, dans le bloc 1, pas dans un bloc a
    // part -- seulement visible une fois le CV depose (avant, ni la place
    // ni le sens). Depot simple (fichier ou texte colle), sans la relecture/
    // masquage du bloc 2 (reservee au CV) : la personne est invitee a
    // retirer elle-meme ses coordonnees si besoin, meme logique de prudence
    // que pour un texte non repere par regex ailleurs dans l'appli.
    (cvPresent
      ? '<hr class="my-3">' +
        '<p class="mb-2"><strong>&#9993; Votre lettre de motivation</strong> <span class="text-muted small">(facultatif, mais conseillé pour personnaliser l’entretien)</span></p>' +
        (lettrePresente
          // TACHE (retour utilisateur 2026-09-17, "ajoute la relecture et le
          // masquage pour la lettre aussi") : meme brique partagee
          // bilanDemanderRelectureCv() que le CV (bloc 2), pas une 2e
          // logique -- seule difference : embarquee ici, dans la meme
          // sous-section, plutot que dans un bloc numerote a part.
          ? '<div class="carte-preparer-ok"><strong>&#9989; Déposée</strong>' +
            '<button type="button" id="btnPrepaEntretienChangerLettre" class="btn btn-outline-secondary btn-sm ms-2">Changer</button></div>' +
            (lettreRelue
              ? '<p class="preparer-detail" style="color:var(--success-strong);">&#9989; Relue et masquée.</p>' +
                '<button type="button" id="btnPrepaEntretienRelectureLettre" class="btn btn-outline-secondary btn-sm">Revoir la relecture</button>'
              : '<p class="preparer-detail">Relisez-la et masquez ce que vous ne voulez pas transmettre (nom, adresse, téléphone), comme pour le CV.</p>' +
                '<button type="button" id="btnPrepaEntretienRelectureLettre" class="btn btn-primary btn-sm">Ouvrir la relecture</button>')
          : _prepaEntretienDocumentLettre === 'skip'
            ? '<p class="preparer-detail">Vous avez indiqué ne pas en avoir. ' +
              '<button type="button" id="btnPrepaEntretienAjouterLettre" class="btn btn-link btn-sm p-0 align-baseline">Finalement, en ajouter une</button></p>'
            : '<div class="d-flex gap-2 flex-wrap align-items-center">' +
              '<input type="file" id="fichierPrepaEntretienLettre" class="form-control form-control-sm" style="max-width:280px;" accept=".pdf,.docx,.txt">' +
              '<button type="button" id="btnPrepaEntretienCollerLettre" class="btn btn-outline-secondary btn-sm">Ou coller le texte</button>' +
              '<button type="button" id="btnPrepaEntretienSansLettre" class="btn btn-outline-secondary btn-sm">Je n’en ai pas</button>' +
              '</div>' +
              '<div id="prepaEntretienCollerLettreZone" hidden class="mt-2">' +
              '<textarea id="prepaEntretienCollerLettreTexte" class="form-control form-control-sm" rows="6" placeholder="Collez ici le texte de votre lettre"></textarea>' +
              '<div class="mt-2"><button type="button" id="btnPrepaEntretienCollerLettreValider" class="btn btn-outline-secondary btn-sm">Annuler</button></div>' +
              '</div>' +
              '<div id="prepaEntretienLettreAnalyseZone" class="mt-2"></div>')
      : '') +
    '</div></details>' +
    // Bloc 2 : Relire, verifier, corriger, masquer -- OBLIGATOIRE, CV
    // uniquement (meme brique partagee bilanDemanderRelectureCv() que
    // co-lettre/_prepLE). Sans lui, le CV colle en texte partirait brut
    // dans le prompt (embarque directement, contrairement a co-lettre).
    '<details class="bloc-depli' + (cvRelu ? ' bd-ok' : '') + '" id="prepaEntretienBlocRelecture"' + (cvPresent && !cvRelu ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">2</span><span class="preparer-titre">Relire, vérifier, corriger, masquer</span>' +
    '<span class="preparer-oblig">obligatoire</span>' +
    '<span class="pilule-etat ' + (cvRelu ? 'pe-ok">Relu et validé' : 'pe-info">À faire &middot; modifiable ensuite') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    (estImage
      ? '<p>Vous avez masqué directement sur l’image à l’étape précédente. Rien d’autre à faire ici.</p>'
      : '<p>Vous <strong>corrigez le texte</strong> si besoin, et vous <strong>masquez ce que vous ne voulez pas transmettre</strong> à l’assistant (téléphone, courriel, adresse, liens). Rien n’est masqué à votre place.</p>' +
        '<p class="preparer-detail">Le <strong>téléphone, le courriel, les liens, le code postal et la ville</strong>, l’âge ou la date de naissance étiquetés sont <strong>surlignés en jaune</strong> pour que vous les repériez. Le nom, le prénom et le numéro de rue ne sont repérés que sous la forme « Nom : … » ou dans le courriel : vérifiez le reste vous-même.</p>' +
        '<div class="d-flex gap-2 flex-wrap align-items-center">' +
        '<button type="button" id="btnPrepaEntretienRelecture" class="btn btn-primary btn-sm"' + (cvPresent ? '' : ' disabled') + '>' + (cvRelu ? 'Revoir la relecture' : 'Ouvrir la relecture') + '</button>' +
        (typeof htmlDeclencheurDemoVideo === 'function' ? htmlDeclencheurDemoVideo('masquage-texte') : '') +
        '</div>' +
        (cvPresent ? '' : '<p class="preparer-detail">Déposez d’abord votre CV (partie 1) pour pouvoir le relire.</p>')) +
    '</div></details>' +
    '<details class="bloc-depli' + (candidatureRenseignee ? ' bd-ok' : '') + '" id="prepaEntretienBlocCible"' + (cvPresent && cvRelu && !etapeCleCandidatureFranchie ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">3</span><span class="preparer-titre">Votre candidature</span>' +
    '<span class="preparer-oblig">facultatif</span>' +
    '<span class="pilule-etat ' + (candidatureRenseignee ? 'pe-ok">Renseigné' : 'pe-info">Facultatif &middot; conseillé si vous l’avez') + '</span></summary>' +
    '<div class="bloc-depli-corps">' +
    '<p>Un entretien se prépare pour un poste et une entreprise précis. Plus vous en dites ici, plus la préparation sera ciblée. Tout est facultatif.</p>' +
    '<p class="mb-2">Quel type de candidature préparez-vous ?</p>' +
    '<div class="grille-objectif">' +
    OBJECTIF_CHOIX_CANDIDATURE.map(function (o) {
      return '<button type="button" class="carte-objectif' + (dossier.objectif === o.id ? ' carte-objectif--actif' : '') + '" data-action="objectif" data-value="' + o.id + '">' +
        '<i class="bi ' + o.icon + '" aria-hidden="true"></i>' +
        '<span class="carte-objectif-titre">' + o.title + '</span>' +
        '<span class="carte-objectif-desc">' + o.desc + '</span>' +
        '</button>';
    }).join('') +
    '</div>' +
    (dossier.objectif
      // Meme bascule locale que co-lettre (docActifActuel() se rabat sur
      // 'cv' tant que dossier.dernierDocumentPrepare n'a pas ete pose pour
      // ce module) : evite que "couleurs de l'entreprise" (CV uniquement)
      // n'apparaisse ici. contenuCandidature(true) : "Je ne sais pas" non
      // precoche, meme raison que co-lettre (l'etape cle du bloc 4 doit
      // correspondre a une vraie reponse).
      ? '<div class="mt-3">' + (function () {
          var docPrepareAvant = dossier.dernierDocumentPrepare;
          dossier.dernierDocumentPrepare = 'entretien';
          var htmlCandidature = estStageAlternancePmsmp ? contenuCandidature(true) : contenuModeRecherche();
          dossier.dernierDocumentPrepare = docPrepareAvant;
          return htmlCandidature;
        })() + '</div>'
      : '') +
    '</div></details>' +
    // Bloc 4 : Adaptation au metier -- meme composant que "Creer un nouveau
    // CV"/co-lettre (contenuRectangleStyleCV()), toujours present, s'ouvre
    // des que l'etape cle du bloc 3 est franchie, se referme de lui-meme
    // une fois "Votre situation en ce moment" renseignee.
    '<details class="bloc-depli' + (stylePersonnalise ? ' bd-ok' : '') + '" id="prepaEntretienBlocAdaptation"' + (etapeCleCandidatureFranchie && !dossier.situationActuelle ? ' open' : '') + '>' +
    '<summary><span class="preparer-num">4</span><span class="preparer-titre">Adaptation au métier</span>' +
    '<span class="preparer-oblig">facultatif</span>' +
    '<span class="pilule-etat ' + (stylePersonnalise ? 'pe-ok">Personnalisé' : 'pe-info">Facultatif &middot; l’assistant s’adapte seul') + '</span></summary>' +
    '<div class="bloc-depli-corps">' + contenuRectangleStyleCV('entretien', true, true) + '</div>' +
    '</details>' +
    // CTA final -- meme gate que co-lettre (CV depose + relu + situation
    // renseignee), + la lettre relue si elle a ete deposee (jamais un
    // depart vers l'assistant avec une lettre encore brute). Raison du
    // blocage toujours visible sous le bouton.
    (function () {
      var raisonsBlocageCta = [];
      if (!cvPresent) { raisonsBlocageCta.push('déposer votre CV'); }
      else if (!cvRelu) { raisonsBlocageCta.push('relire votre CV'); }
      if (lettrePresente && !lettreRelue) { raisonsBlocageCta.push('relire votre lettre de motivation'); }
      if (!dossier.situationActuelle) { raisonsBlocageCta.push('indiquer votre situation actuelle dans « Adaptation au métier »'); }
      var ctaBloque = raisonsBlocageCta.length > 0;
      return '<div class="text-center" style="margin-top:1.4rem;">' +
        '<button type="button" id="btnPrepaVersAssistant" class="btn btn-primary btn-lg"' +
        (ctaBloque ? ' disabled title="Il reste à ' + echapperAttribut(raisonsBlocageCta.join(' et à ')) + '."' : '') +
        '>Choisir mon assistant &#8594;</button>' +
        (ctaBloque
          ? '<p class="preparer-detail" style="margin-top:.5rem;color:var(--warning-strong);">&#9888;&#65039; Il reste à ' + raisonsBlocageCta.join(' et à ') + '.</p>'
          : '<p class="preparer-detail" style="margin-top:.5rem;">Vous pouvez choisir votre assistant. « Votre candidature » peut rester vide.</p>');
    })() +
    '</div>';

  app.innerHTML = '<div class="page-catalogue-contenu bilan-preparer prepa-entretien-parcours">' + html + '</div>' +
    '<div class="barre-navigation-fixe">' + barreNavigation('cv', null, null, { onclickPrecedent: '_prepaEntretienRetourIntro()' }) + '</div>';
  _prepaEntretienBrancherBandePresentation();
  _prepaEntretienBrancherPreparer();
  if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_preparer_affiche'); }
}

function _prepaEntretienBrancherPreparer() {
  var btnInfo = document.getElementById('btnInfoDepotEntretien');
  if (btnInfo) {
    btnInfo.addEventListener('click', function () {
      ouvrirBulleAide(null, 'Vous avez un compte ChatGPT ? Vous pouvez faire cette préparation d’entretien à la ' +
        'voix, en utilisant la commande vocale de ChatGPT au lieu de taper vos réponses.');
    });
  }

  var btnDeposer = document.getElementById('btnPrepaEntretienDeposerCv');
  if (btnDeposer) {
    btnDeposer.addEventListener('click', function () {
      ouvrirAssistantDepotCV('pret', {
        onDocumentPrepare: function (documentPrepare) {
          if (!documentPrepare) { return; }
          _prepaEntretienDocumentCv = documentPrepare;
          // La modale a deja fait son ecran de verification / masquage
          // (texte) ou de masquage sur l'image : ce CV est deja relu.
          _prepaEntretienCvRelu = true;
          if (documentPrepare.type === 'texte') { _prepaEntretienSyncCvTexte(documentPrepare.valeur); }
          _prepaEntretienRendrePreparer();
        },
        onRetourEtape1: function () { _prepaEntretienRendrePreparer(); }
      });
    });
  }

  var btnColler = document.getElementById('btnPrepaEntretienCollerCv');
  var zoneColler = document.getElementById('prepaEntretienCollerCvZone');
  var champColler = document.getElementById('prepaEntretienCollerCvTexte');
  var btnCollerValider = document.getElementById('btnPrepaEntretienCollerCvValider');
  if (btnColler && zoneColler) {
    btnColler.addEventListener('click', function () { zoneColler.hidden = !zoneColler.hidden; if (!zoneColler.hidden && champColler) { champColler.focus(); } });
  }
  if (champColler && btnCollerValider) {
    champColler.addEventListener('input', function () {
      btnCollerValider.textContent = champColler.value.trim() ? 'Enregistrer ce texte' : 'Annuler';
    });
    btnCollerValider.addEventListener('click', function () {
      var t = champColler.value.trim();
      if (!t) { zoneColler.hidden = true; return; }
      _prepaEntretienDocumentCv = { type: 'texte', valeur: t };
      _prepaEntretienCvRelu = false;
      _prepaEntretienSyncCvTexte(t);
      _prepaEntretienRendrePreparer();
    });
  }

  var btnChangerCv = document.getElementById('btnPrepaEntretienChangerCv');
  if (btnChangerCv) {
    btnChangerCv.addEventListener('click', function () {
      _prepaEntretienDocumentCv = null;
      _prepaEntretienCvRelu = false;
      dossier.cvTexte = '';
      _prepaEntretienRendrePreparer();
    });
  }

  // ----- Bloc 2 : Relire, verifier, corriger, masquer -----
  var btnRelecture = document.getElementById('btnPrepaEntretienRelecture');
  if (btnRelecture && typeof bilanDemanderRelectureCv === 'function') {
    btnRelecture.addEventListener('click', function () {
      if (!_prepaEntretienDocumentCv || _prepaEntretienDocumentCv.type !== 'texte') { return; }
      bilanDemanderRelectureCv(_prepaEntretienDocumentCv.valeur, undefined, _prepaEntretienCvRelu).then(function (res) {
        _prepaEntretienDocumentCv.valeur = res.contenuValide;
        _prepaEntretienCvRelu = true;
        _prepaEntretienSyncCvTexte(res.contenuValide);
        _prepaEntretienRendrePreparer();
      }).catch(function (erreur) {
        if (erreur && erreur.code === 'RelectureAnnulee') { return; }
        if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_relecture_erreur', { code: erreur && erreur.code }); }
      });
    });
  }

  // ----- Lettre de motivation (bloc 1, sous-section) -----
  var fichierLettre = document.getElementById('fichierPrepaEntretienLettre');
  var zoneAnalyseLettre = document.getElementById('prepaEntretienLettreAnalyseZone');
  if (fichierLettre) {
    fichierLettre.addEventListener('change', function () {
      if (!fichierLettre.files.length) { return; }
      var fichier = fichierLettre.files[0];
      if (zoneAnalyseLettre) { zoneAnalyseLettre.innerHTML = '<div class="alert alert-light border mb-0 py-2 small">&#8987; Analyse en cours...</div>'; }
      analyserDocumentDepose(fichier).then(function (resultatAnalyse) {
        if (!resultatAnalyse.recommandation.texteDisponible) {
          if (zoneAnalyseLettre) { zoneAnalyseLettre.innerHTML = '<div class="alert alert-warning mb-0 py-2 small">Le texte de ce fichier n’a pas pu être lu -- utilisez plutôt « Ou coller le texte ».</div>'; }
          return;
        }
        _prepaEntretienDocumentLettre = { type: 'texte', valeur: resultatAnalyse.texteExtrait || '' };
        _prepaEntretienLettreRelue = false;
        dossier.lettreMotivation = dossier.lettreMotivation || {};
        dossier.lettreMotivation.texte = resultatAnalyse.texteExtrait || '';
        _prepaEntretienRendrePreparer();
      }).catch(function (erreur) {
        if (zoneAnalyseLettre) { zoneAnalyseLettre.innerHTML = '<div class="alert alert-warning mb-0 py-2 small">Impossible de lire ce fichier (' + erreur.message + ').</div>'; }
      });
    });
  }
  var btnCollerLettre = document.getElementById('btnPrepaEntretienCollerLettre');
  var zoneCollerLettre = document.getElementById('prepaEntretienCollerLettreZone');
  var champCollerLettre = document.getElementById('prepaEntretienCollerLettreTexte');
  var btnCollerLettreValider = document.getElementById('btnPrepaEntretienCollerLettreValider');
  if (btnCollerLettre && zoneCollerLettre) {
    btnCollerLettre.addEventListener('click', function () { zoneCollerLettre.hidden = !zoneCollerLettre.hidden; if (!zoneCollerLettre.hidden && champCollerLettre) { champCollerLettre.focus(); } });
  }
  if (champCollerLettre && btnCollerLettreValider) {
    champCollerLettre.addEventListener('input', function () {
      btnCollerLettreValider.textContent = champCollerLettre.value.trim() ? 'Enregistrer ce texte' : 'Annuler';
    });
    btnCollerLettreValider.addEventListener('click', function () {
      var t = champCollerLettre.value.trim();
      if (!t) { zoneCollerLettre.hidden = true; return; }
      _prepaEntretienDocumentLettre = { type: 'texte', valeur: t };
      _prepaEntretienLettreRelue = false;
      dossier.lettreMotivation = dossier.lettreMotivation || {};
      dossier.lettreMotivation.texte = t;
      _prepaEntretienRendrePreparer();
    });
  }
  var btnSansLettre = document.getElementById('btnPrepaEntretienSansLettre');
  if (btnSansLettre) { btnSansLettre.addEventListener('click', function () { _prepaEntretienDocumentLettre = 'skip'; _prepaEntretienRendrePreparer(); }); }
  var btnAjouterLettre = document.getElementById('btnPrepaEntretienAjouterLettre');
  if (btnAjouterLettre) { btnAjouterLettre.addEventListener('click', function () { _prepaEntretienDocumentLettre = null; _prepaEntretienRendrePreparer(); }); }
  var btnChangerLettre = document.getElementById('btnPrepaEntretienChangerLettre');
  if (btnChangerLettre) {
    btnChangerLettre.addEventListener('click', function () {
      _prepaEntretienDocumentLettre = null;
      _prepaEntretienLettreRelue = false;
      if (dossier.lettreMotivation) { dossier.lettreMotivation.texte = ''; }
      _prepaEntretienRendrePreparer();
    });
  }
  // TACHE (retour utilisateur 2026-09-17, "ajoute la relecture et le
  // masquage pour la lettre aussi") : meme brique partagee que le CV
  // (bilanDemanderRelectureCv()).
  var btnRelectureLettre = document.getElementById('btnPrepaEntretienRelectureLettre');
  if (btnRelectureLettre && typeof bilanDemanderRelectureCv === 'function') {
    btnRelectureLettre.addEventListener('click', function () {
      if (!_prepaEntretienDocumentLettre || _prepaEntretienDocumentLettre.type !== 'texte') { return; }
      bilanDemanderRelectureCv(_prepaEntretienDocumentLettre.valeur, undefined, _prepaEntretienLettreRelue).then(function (res) {
        _prepaEntretienDocumentLettre.valeur = res.contenuValide;
        _prepaEntretienLettreRelue = true;
        dossier.lettreMotivation = dossier.lettreMotivation || {};
        dossier.lettreMotivation.texte = res.contenuValide;
        _prepaEntretienRendrePreparer();
      }).catch(function (erreur) {
        if (erreur && erreur.code === 'RelectureAnnulee') { return; }
        if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_relecture_lettre_erreur', { code: erreur && erreur.code }); }
      });
    });
  }

  // ----- Bloc 3 : Votre candidature (briques partagees de "Votre objectif") -----
  var blocCible = document.getElementById('prepaEntretienBlocCible');
  if (blocCible && typeof activerChampsStandardises === 'function') { activerChampsStandardises(blocCible); }
  document.querySelectorAll('#prepaEntretienBlocCible [data-action="objectif"]').forEach(function (el) {
    el.addEventListener('click', function () {
      definirObjectifCandidature(this.dataset.value);
      _prepaEntretienRendrePreparer();
    });
  });
  if (dossier.objectif) {
    if (['stage', 'alternance', 'pmsmp'].indexOf(dossier.objectif) !== -1) {
      if (typeof wireObjectifDetails === 'function') { wireObjectifDetails(_prepaEntretienRendrePreparer); }
    } else if (typeof wireModeRecherche === 'function') {
      wireModeRecherche(_prepaEntretienRendrePreparer);
      if (typeof wireEvidenceMetierCible === 'function') { wireEvidenceMetierCible(); }
    }
  }

  // ----- Bloc 4 : Adaptation au metier -----
  document.querySelectorAll('#prepaEntretienBlocAdaptation [data-style-cv-champ]').forEach(function (el) {
    el.addEventListener('click', function () {
      var champ = this.getAttribute('data-style-cv-champ');
      var valeur = this.getAttribute('data-style-cv-valeur');
      var prefs = dossier.preferencesIAParType.entretien;
      prefs[champ] = (prefs[champ] === valeur) ? null : valeur;
      _prepaEntretienRendrePreparer();
    });
  });
  document.querySelectorAll('#prepaEntretienBlocAdaptation [data-situation-actuelle]').forEach(function (el) {
    el.addEventListener('click', function () {
      var v = this.getAttribute('data-situation-actuelle');
      dossier.situationActuelle = (dossier.situationActuelle === v) ? null : v;
      _prepaEntretienRendrePreparer();
    });
  });

  var btnVersAssistant = document.getElementById('btnPrepaVersAssistant');
  if (btnVersAssistant) {
    btnVersAssistant.addEventListener('click', function () {
      if (btnVersAssistant.disabled) { return; }
      _prepaEntretienEntrerChoixAssistant();
    });
  }
}

var _prepaEntretienEcran = 'intro'; // 'intro'|'preparer'|'choix-assistant'|'reponse'
var _prepaEntretienDetour = false;
// TACHE (retour utilisateur 2026-09-17, "Continuer/Recommencer comme dans
// les autres modules corriges") : meme role que _coLettreEcranRepris --
// retient l'ecran quitte au moment ou la tuile Accueil force _prepaEntretienEcran
// a 'intro' (voir brancher('btnCarteAccueilEntretien', ...), js/app.js).
var _prepaEntretienEcranRepris = null;

var PREPA_ENTRETIEN_NAV_ETAPES = [
  { label: 'Préparer', icone: '&#128221;' },
  { label: 'Assistant', icone: '&#128172;' },
  { label: 'S’entraîner', icone: '&#127908;' },
  { label: 'Terminé', icone: '&#9989;' }
];

// Point d'entree du parcours -- appele par le CTA de l'intro, par
// "Recommencer", ET directement par _candidaterFinaliser() (js/app.js,
// parcours "Candidater depuis la recherche" quand rg.parcours === 'entretien') :
// ce raccourci saute directement au depot, quelle que soit la page
// actuelle, exactement comme avant (contrat externe inchange).
function ouvrirParcoursEntretien() {
  _prepaEntretienEcran = 'preparer';
  _prepaEntretienDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}

// TACHE (retour utilisateur 2026-09-17, "Recommencer" du bloc "travail en
// cours" de l'intro) : meme principe que _coLettreRecommencer() -- efface
// le CV et la lettre deposes, repart du bloc 1. La preparation deja
// enregistree (dossier.ia.entretien), elle, n'est PAS effacee ici -- rien
// n'est perdu tant qu'une nouvelle preparation n'est pas importee par-dessus.
function _prepaEntretienRecommencerTravail() {
  _prepaEntretienDocumentCv = null;
  _prepaEntretienCvRelu = false;
  _prepaEntretienDocumentLettre = null;
  _prepaEntretienLettreRelue = false;
  _prepaEntretienEcran = 'preparer';
  _prepaEntretienEcranRepris = null;
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}

// Dispatcher (route 'prepa-entretien') -- meme principe que pageCoLettre()
// et pageCoherenceTransversale().
function pagePrepaEntretien() {
  if (_prepaEntretienDetour) { _prepaEntretienRendreIntro(); return; }
  if (_prepaEntretienEcran === 'preparer') { _prepaEntretienRendrePreparer(); return; }
  if (_prepaEntretienEcran === 'choix-assistant') { _prepaEntretienRendreChoixAssistant(); return; }
  if (_prepaEntretienEcran === 'reponse') { _prepaEntretienRendreReponse(); return; }
  _prepaEntretienRendreIntro();
}

// "Retour"/"Revoir la presentation" d'un ecran de travail -> intro
// affichee PAR-DESSUS le travail en cours (non destructif). Meme
// mecanisme que _coLettreVoirPresentation()/ctRevenirALaPresentation().
function _prepaEntretienVoirPresentation() {
  _prepaEntretienDetour = true;
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}
function _prepaEntretienRevenirModule() {
  _prepaEntretienDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}
// TACHE (retour Denis, 2026-09-07, BUG REEL : "Retour" depuis l'ecran de
// depot bouclait avec l'intro) : _prepaEntretienVoirPresentation() (detour)
// n'est PAS le bon mecanisme ici -- l'intro EN DETOUR revient elle-meme
// sur 'preparer' via son propre "Retour"/"Revenir au module", ce qui cree
// une boucle a 2 ecrans au lieu de continuer a reculer vers l'accueil. La
// page "Preparer" est le TOUT PREMIER ecran de travail : son "Retour" doit
// afficher l'intro en mode NORMAL (pas en detour), pour que le propre
// "Retour" de l'intro continue ensuite vers l'accueil de la carte -- meme
// patron deja correct que _prepLERetourIntro() ("Preparer ma lettre et mon
// entretien", l'AUTRE module du meme nom) et ctRetourDepuisCollecte()
// (Coherence). Non destructif : _prepaEntretienDocumentCv/DocumentLettre
// ne sont jamais effaces ici.
function _prepaEntretienRetourIntro() {
  _prepaEntretienEcran = 'intro';
  _prepaEntretienDetour = false;
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}
// "Retour" depuis le choix d'assistant -> revient a la page "Preparer",
// conforme RC-03 (jamais un saut direct a l'intro ni a l'accueil).
function _prepaEntretienRetourPreparer() {
  _prepaEntretienEcran = 'preparer';
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}
function _prepaEntretienRetourChoixAssistant() {
  _prepaEntretienEcran = 'choix-assistant';
  if (typeof naviguerVers === 'function') { naviguerVers('prepa-entretien'); }
}

// Bande "Revoir la présentation" partagée par les 5 écrans de travail.
function _prepaEntretienBandePresentation() {
  var bouton = '<div><button type="button" id="btnPrepaEntretienRevoirPres" class="btn-revoir-module">' +
    '<i class="bi bi-mic"></i> Revoir la présentation</button></div>' +
    (typeof noteRevoirModuleDejaVue === 'function' && !noteRevoirModuleDejaVue()
      ? '<div class="note-revoir-module" id="noteRevoirModule" style="margin-left:0;">' +
        '<span>Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez rien.</span>' +
        '<button type="button" aria-label="J’ai compris" data-fermer-note-revoir>&#10005;</button></div>'
      : '');
  return (typeof htmlBandeRepriseModule === 'function') ? htmlBandeRepriseModule(bouton, '') : bouton;
}
function _prepaEntretienBrancherBandePresentation() {
  var btn = document.getElementById('btnPrepaEntretienRevoirPres');
  if (btn) { btn.addEventListener('click', _prepaEntretienVoirPresentation); }
}

// TACHE (retour Denis, 2026-08-31) : vraie page de presentation du module
// "Preparer un entretien d'embauche" (route 'prepa-entretien'), avec
// synthese du travail deja fait.
function _prepaEntretienRendreIntro() {
  var entretienFait = !!(dossier.ia && dossier.ia.entretien && dossier.ia.entretien.presentation);
  // TACHE (retour utilisateur 2026-09-17, "la fonction que j'ai dans tous
  // les autres modules corriges -- Continuer/Recommencer quand on revient
  // sur l'accueil en plein parcours") : meme mecanisme que co-lettre
  // (travailEnCours) -- un CV deja depose ici, sans preparation encore
  // terminee, compte comme un travail en cours.
  var travailEnCours = !entretienFait && !!_prepaEntretienDocumentCv;
  var syntheseHTML = '';
  var actionsSynthese = [];
  if (!_prepaEntretienDetour && entretienFait) {
    syntheseHTML = _introBlocReprise(
      'Vous avez déjà préparé un entretien d’embauche.',
      'btnPrepaEntretienContinuer', 'btnPrepaEntretienRecommencer', 'Voir ma préparation');
    actionsSynthese.push({
      id: 'btnPrepaEntretienContinuer',
      action: function () { dossier.dernierDocumentPrepare = 'entretien'; naviguerVers('resultats'); }
    });
    actionsSynthese.push({
      id: 'btnPrepaEntretienRecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { ouvrirParcoursEntretien(); return; }
        confirmerAction(
          'Recommencer une préparation d’entretien ?',
          'Vous allez repartir du début pour une nouvelle préparation. La préparation déjà faite reste accessible tant que vous n’en enregistrez pas une autre.',
          'Recommencer', 'btn-danger', ouvrirParcoursEntretien
        );
      }
    });
  } else if (!_prepaEntretienDetour && travailEnCours) {
    syntheseHTML = _introBlocReprise(
      'Vous avez commencé à préparer un entretien d’embauche.',
      'btnPrepaEntretienContinuer', 'btnPrepaEntretienRecommencer', 'Continuer');
    actionsSynthese.push({
      id: 'btnPrepaEntretienContinuer',
      action: function () {
        // TACHE (meme principe que _coLettreEcranRepris) : retient l'ecran
        // quitte au moment ou la tuile Accueil a force 'intro' -- repli sur
        // 'preparer' seulement si absent (1ere reprise apres un rechargement
        // de page, ou l'etat en memoire est perdu).
        _prepaEntretienEcran = _prepaEntretienEcranRepris || 'preparer';
        naviguerVers('prepa-entretien');
      }
    });
    actionsSynthese.push({
      id: 'btnPrepaEntretienRecommencer',
      action: function () {
        if (typeof confirmerAction !== 'function') { _prepaEntretienRecommencerTravail(); return; }
        confirmerAction(
          'Recommencer une préparation d’entretien ?',
          'Vous allez repartir du dépôt de votre CV pour une nouvelle préparation. Rien de ce que vous avez déjà rempli n’est perdu tant que vous ne le remplacez pas.',
          'Recommencer', 'btn-danger', _prepaEntretienRecommencerTravail
        );
      }
    });
  }
  var config = {
    carteRetour: 'preparer',
    detour: _prepaEntretienDetour,
    detourLogo: 'bi-mic',
    detourBoutonId: 'btnPrepaEntretienRevenirModuleHaut',
    detourCtaId: 'btnPrepaEntretienRevenirModuleBas',
    onRevenir: _prepaEntretienRevenirModule,
    onRevenirExpr: '_prepaEntretienRevenirModule()',
    titre: '<i class="bi bi-mic"></i> Préparer un entretien d’embauche',
    sousTitre: 'Réfléchir à l’avance à ce que vous direz, pour arriver plus tranquille.',
    etapes: PREPA_ENTRETIEN_NAV_ETAPES,
    ctaId: 'btnPrepaEntretienCommencer',
    ctaLabel: 'Préparer mon entretien d’embauche &#8594;',
    ctaMasque: (!_prepaEntretienDetour && entretienFait),
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    onCta: function () { ouvrirParcoursEntretien(); },
    blocsHTML:
        _introBlocAccroche('<strong>Vous vous entraînez en discutant avec un assistant en ligne.</strong> Il vous pose des questions d’entretien à partir de votre CV et du poste visé, et il rebondit sur vos réponses. Vous pouvez taper vos réponses ou, avec un assistant qui le permet comme ChatGPT, les dire à voix haute.') +
        _introBlocSection('&#127919; À quoi ça sert',
          '<p class="mb-0">S’entraîner aux questions d’un entretien d’embauche dans des conditions proches du réel, sans enjeu. Les questions partent de votre CV et du poste visé, puis s’ajustent à ce que vous répondez. L’assistant fait préciser, propose une façon plus claire de dire les choses, et vous aide aussi à préparer votre présentation et les questions à poser au recruteur.</p>') +
        _introBlocSection('&#128203; Ce qui va se passer',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Vous déposez votre CV. Vous pouvez y ajouter votre lettre de motivation si vous en avez une : ce n’est pas obligatoire. Vous pourrez relire ces documents et masquer ce que vous ne voulez pas transmettre.</li>' +
          '<li>Vous indiquez le poste visé et, si vous l’avez, l’entreprise ou le lien de l’offre.</li>' +
          '<li>L’application prépare un texte à copier. Vous le collez chez un assistant en ligne de votre choix.</li>' +
          '<li>Vous répondez à ses questions, au clavier ou à voix haute selon l’assistant, et il s’adapte à vos réponses.</li>' +
          '<li>Quand vous avez terminé, vous rapportez la préparation ici. Vous pouvez l’enregistrer en document pour la garder.</li>' +
          '</ul>') +
        _introBlocSection('&#128683; Ce que ce module ne fait pas',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Ce n’est pas un texte à réciter : le jour de l’entretien, vous parlez avec vos propres mots.</li>' +
          '<li>Ce n’est pas une simulation notée : personne ne joue un faux recruteur qui vous juge.</li>' +
          '<li>Il ne vous met aucune note et ne porte aucun avis sur vous.</li>' +
          '<li>Il ne corrige pas votre CV.</li>' +
          '</ul>') +
        _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
          '<ul class="mb-0" style="padding-left:1.25rem;">' +
          '<li>Enregistrer votre préparation en document, pour la relire au calme.</li>' +
          '<li>Vous entraîner à répondre à voix haute, seul ou avec quelqu’un.</li>' +
          '<li>Recommencer une préparation si le poste ou l’entreprise visés changent.</li>' +
          '</ul>') +
        _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
          '<p class="mb-0">À tout moment, vous pouvez mettre de côté une réflexion utile sur votre parcours (un doute, une idée, une chose à en dire) dans Mes Repères, pour vous ou votre conseiller.</p>') +
        _introBlocSection('&#128172; Comment ça se passe concrètement',
          '<p class="mb-2">Vous copiez le texte préparé par l’application, vous le collez sur le site d’un assistant en ligne de votre choix, et vous vous entraînez en échangeant avec lui. L’application vous guide à chaque étape.</p>' +
          _introBlocEncart('&#127908;', 'Avec un assistant qui accepte la voix, comme ChatGPT, vous pouvez répondre à l’oral au lieu de taper, au plus près des conditions d’un vrai entretien.')) +
        _introBlocSection('&#9989; Bon à savoir',
          _introBlocEncart('&#128274;', 'Avant l’envoi, vous pouvez relire vos documents et masquer une information que vous ne voulez pas transmettre. Votre nom et vos coordonnées ne partent jamais vers l’assistant en ligne.') +
          _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon votre préparation sera perdue à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('prepa_entretien_intro_affichee'); }
}

// TACHE (retour Denis, 2026-08-31) : vraie page de presentation du module
// "Decouvrir mes competences" (route 'decouverte-intro'), teinte indigo,
// d'apres docs/MAQUETTE_INTRO_DECOUVERTE.html. Le CTA lance la cascade
// existante (demarrerDecouverteCompetences, qui reprend une session en
// pause si elle existe). Synthese si un CV a deja ete produit.
function pageDecouverteIntro() {
  // "Commence" (le CTA devient "Reprendre / recommencer") : des qu'une analyse
  // a ete recue, meme si le parcours n'est pas alle au bout.
  var commence = !!(dossier.decouverteAnalyseRecue || (dossier.experiences && dossier.experiences.length));
  // "Termine" (fait persistant, pose par finaliserEtNaviguerVersResultats) :
  // le parcours est alle jusqu'au bout, il y a un vrai CV a voir.
  var termine = !!dossier.decouverteTerminee;
  var faite = commence; // conserve pour le libelle du CTA plus bas
  var syntheseHTML = '';
  var actionsSynthese = [];
  // TACHE (retour Denis, 2026-08-31, Chantier 2) : "Voir mon CV" UNIQUEMENT
  // si le parcours est termine. Avant, ce bouton apparaissait des le 1er
  // import et court-circuitait le parcours (etapes Competences / Completer
  // sautees) ET l'encart "Continuer / Recommencer" -- il envoyait aussi vers
  // l'ancienne page Action. Parcours commence mais pas fini -> pas de
  // bouton, on reprend le parcours par le CTA (qui declenche l'encart de
  // reprise + gel du module).
  if (termine) {
    syntheseHTML = _introBlocSynthese(
      '&#128161; Votre CV est prêt : vous l’avez construit à partir de votre récit.',
      [],
      '<button type="button" id="btnDecouverteVoirCv" class="btn btn-outline-primary" style="border-radius:12px;">Voir mon CV</button>'
    );
    actionsSynthese.push({
      id: 'btnDecouverteVoirCv',
      // dossier.decouverteTerminee est deja vrai -> pageResultats() affiche
      // la version adaptee ("Creer mon CV", barre du module).
      action: function () { dossier.dernierDocumentPrepare = 'cv'; naviguerVers('resultats'); }
    });
  }
  var enDetour = (typeof _decouverteDetourPresentation !== 'undefined' && _decouverteDetourPresentation);
  var config = {
    carteRetour: 'boiteaoutils',
    detour: enDetour,
    detourLogo: 'bi-stars',
    detourBoutonId: 'btnDecouverteRevenirModuleHaut',
    detourCtaId: 'btnDecouverteRevenirModuleBas',
    onRevenir: (typeof decouverteRevenirDeLaPresentation === 'function') ? decouverteRevenirDeLaPresentation : null,
    onRevenirExpr: 'decouverteRevenirDeLaPresentation()',
    titre: '<i class="bi bi-stars"></i> Découvrir mes compétences',
    sousTitre: 'Partir de ce que vous avez vécu et fait, pour en tirer un CV, même si vous n’en avez jamais eu.',
    // Étapes du parcours consolidé (voir docs/MAQUETTE_DECOUVERTE_CONSOLIDE_2026-08-31.html).
    etapes: [
      { label: 'Préparer', icone: '&#128221;' },
      { label: 'Assistant', icone: '&#128172;' },
      { label: 'Réponse', icone: '&#128229;' },
      { label: 'Compétences', icone: '&#128161;' },
      { label: 'Compléter', icone: '&#128203;' }
    ],
    ctaId: 'btnDecouverteCommencer',
    ctaLabel: faite ? 'Reprendre / recommencer &#8594;' : 'Raconter mon parcours &#8594;',
    syntheseHTML: syntheseHTML,
    actionsSynthese: actionsSynthese,
    onCta: function () {
      if (typeof demarrerDecouverteCompetences === 'function') { demarrerDecouverteCompetences(); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Vous n’avez pas besoin d’un parcours « classique » pour commencer.</strong> Le travail salarié, l’aide à des proches, le bénévolat, le bricolage, une passion suivie longtemps : tout cela contient des compétences. Ici, on les met en mots à partir de votre histoire.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-1">Construire un CV en partant de votre récit, pas d’un formulaire. Vous racontez ce que vous avez fait, avec vos mots ; un assistant en ligne en tire des expériences et des compétences concrètes ; vous choisissez, pour chacune, la formulation qui vous ressemble.</p>' +
        '<p class="mb-0">C’est l’outil pour qui repart de loin : personne longtemps sans emploi, sans diplôme reconnu, avec un parcours difficile à faire tenir dans les cases habituelles.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous racontez votre parcours dans une zone de texte, <strong>au clavier ou à la voix</strong> (<strong><span style="white-space:nowrap;">Windows + H</span></strong>). Aucune forme imposée.</li>' +
        '<li>Si vous le souhaitez, vous ajoutez vos coordonnées et le type de poste ou de secteur visé. Ce n’est pas obligatoire pour commencer.</li>' +
        '<li>Vous choisissez un assistant en ligne. L’application prépare le texte, vous le collez chez l’assistant, vous revenez coller sa réponse ici.</li>' +
        '<li>L’application vous propose, pour chaque expérience repérée, plusieurs façons de la dire et une liste de compétences. Vous gardez ce qui vous va, vous écartez le reste.</li>' +
        '<li>Quelques précisions peuvent vous être demandées (dates, niveau d’études, bénévolat…), puis vous complétez les dernières informations utiles (permis, formations).</li>' +
        '<li>Vous arrivez sur votre CV, prêt à mettre en forme et à télécharger.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas un test de personnalité ni un bilan de compétences officiel. Il ne vous met aucune note et ne porte aucun avis sur vous.</li>' +
        '<li>Il ne décide pas à votre place quel métier viser : il part de ce que vous racontez.</li>' +
        '<li>Il n’invente rien. Une compétence n’apparaît que si elle vient de votre récit ou de vos réponses.</li>' +
        '<li>Ce n’est pas une analyse d’un CV existant : ici, on en fabrique un à partir de votre récit.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Reprendre votre CV dans l’atelier de l’application pour le mettre en forme, choisir un modèle, et le télécharger au format Word ou PDF.</li>' +
        '<li>Vous servir de ce CV comme base pour votre lettre de motivation et votre préparation d’entretien.</li>' +
        '<li>Revenir compléter ou corriger une expérience : rien n’est figé.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">À tout moment, vous pouvez mettre de côté une réflexion utile sur votre parcours (un doute, une idée, une chose à en dire) dans Mes Repères, pour vous ou votre conseiller.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-2">Tout se passe dans une suite d’écrans qui se suivent, avec un bouton « Retour » et un bouton « Continuer » à chaque étape. Vous pouvez fermer et reprendre plus tard là où vous en étiez. Le seul échange avec un assistant en ligne se fait par copier-coller.</p>' +
        _introBlocEncart('&#128161;', 'Le récit est le cœur du parcours : plus vous en dites, plus les propositions seront justes. Mais vous pouvez toujours revenir en ajouter.')) +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128274;', 'Vos coordonnées (nom, téléphone, adresse) ne sont jamais envoyées à l’assistant en ligne. Seule la civilité l’est, et uniquement pour accorder le texte au féminin ou au masculin.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette pendant le parcours, sinon votre travail sera perdu à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('decouverte_intro_affichee'); }
}

// ============================================================
// TACHE (retour Denis, 2026-08-31) : pages de PRESENTATION de 3 modules
// PAS ENCORE CONSTRUITS (ATS, Regard recruteur, Se tenir informe),
// integrees a la Boite a outils pour preparer l'organisation de la page
// d'accueil. Maquettes validees : docs/MAQUETTE_INTRO_{ATS,REGARD_RECRUTEUR,
// SE_TENIR_INFORME}.html. Meme mecanisme que pageCoLettre / pageDecouverteIntro
// (htmlPageIntroModuleParcours), mais le CTA est DESACTIVE (ctaDesactive)
// avec une note "en cours de preparation" -- aucun parcours derriere.
// Le jour ou un module est construit : reprendre les EXIGENCES
// FONCTIONNELLES notees en tete de chaque fichier de maquette (detection
// des techniques de triche pour l'ATS, avis "couleurs de l'entreprise"
// pour Regard recruteur, fichier texte de base mensuel pour Se tenir
// informe). Voir docs/TACHES_VALIDEES.md, megachantier "Reorganisation de
// la page d'accueil".
// ============================================================
var _NOTE_MODULE_EN_PREPARATION =
  'Ce module est en cours de préparation. La page de présentation est prête ; l’outil arrivera dans une prochaine version.';

// TACHE (chantier "bouton presentation", 2026-09-01) : le bouton partage
// "Revenir au module" / l'encart "Continuer / Recommencer" sont CABLES
// pour ces 3 pages via htmlPageIntroModuleParcours (config.detour /
// config.ctaMasque). Ils n'apparaissent PAS tant que le module n'a pas
// d'ecran de travail routé -- un bouton "Revenir au module" sans module
// serait un bouton mort, incoherent avec les modules construits (dont la
// presentation vue a froid n'a pas ce bouton non plus). Le jour ou ATS /
// Regard recruteur / Se tenir informe sont construits sur le patron
// (famille 2, docs/LANGAGE_VISUEL_COMMUN.md 5bis), passer config.detour +
// _xxxReprisePendante comme Decouverte / Comparer : rien d'autre a faire.

function pageIntroAts() {
  var enDetour = (typeof _atsDetourPresentation !== 'undefined' && _atsDetourPresentation);
  var config = {
    carteRetour: 'analyse',
    detour: enDetour,
    detourLogo: 'bi-card-checklist',
    detourBoutonId: 'btnAtsRevenirModuleHaut',
    detourCtaId: 'btnAtsRevenirModuleBas',
    onRevenir: (typeof atsRevenirDeLaPresentation === 'function') ? atsRevenirDeLaPresentation : null,
    onRevenirExpr: 'atsRevenirDeLaPresentation()',
    titre: '<i class="bi bi-card-checklist"></i> Les mots de votre CV <span style="font-weight:400;opacity:.75;">(ATS)</span>',
    sousTitre: 'Comparer le vocabulaire de votre CV avec celui d’une offre ou d’un métier, pour mieux faire ressortir votre parcours.',
    ctaId: 'btnAtsCommencer',
    ctaLabel: 'Comparer les mots de mon CV &#8594;',
    etapes: (typeof ATS_ETAPES !== 'undefined') ? ATS_ETAPES : null,
    onCta: function () {
      // Si une comparaison existe deja : retour dans le module avec encart
      // "Continuer / Recommencer" + gel (famille 2). Sinon on demarre.
      if (typeof _atsEtat !== 'undefined' && _atsEtat) {
        if (typeof atsMarquerReprisePendante === 'function') { atsMarquerReprisePendante(); }
      } else if (typeof ouvrirAts === 'function') {
        ouvrirAts();
      }
      if (typeof naviguerVers === 'function') { naviguerVers('ats'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Ce module n’est pas un logiciel de tri</strong> et n’a pas accès à celui d’un employeur. Il en reproduit la vérification principale : il regarde, comme le ferait un logiciel de tri (un « ATS »), si les mots attendus pour le poste sont présents dans votre CV, et vous dit lesquels vous pourriez faire ressortir. On compare des <strong>mots</strong>, pas le fond de votre CV, et jamais votre valeur.') +
      _introBlocSection('&#9881;&#65039; Ce que fait un logiciel de tri',
        '<p class="mb-0">Un logiciel de tri (ou « ATS ») ne rejette pas un CV de lui-même : il le classe selon les mots-clés qu’il détecte. Une candidature peut donc être moins visible sans être écartée. Ce module vous montre, en clair, ce que ce classement verrait dans votre CV.</p>') +
      _introBlocSection('&#8505;&#65039; Le vocabulaire, pas le fond',
        '<p class="mb-0">Ici, on regarde uniquement les <strong>mots</strong> de votre CV face au poste visé : pas si votre parcours est solide, pas ce qu’un recruteur en penserait.</p>') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">Vous donner une idée de la correspondance entre votre CV et les mots-clés attendus pour un métier ou une offre : les mots déjà présents, ceux qui pourraient être formulés autrement, ceux qui ne sont pas retrouvés, avec des façons de les reformuler à partir de votre parcours réel.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous partez de votre CV, sous la forme que vous avez : un fichier, une photo, un scan, ou le texte collé.</li>' +
        '<li>Vous choisissez la référence : l’offre d’emploi si vous l’avez, sinon une fiche métier.</li>' +
        '<li>Vous relisez votre CV à l’écran et vous masquez ce que vous ne voulez pas transmettre (nom, adresse, téléphone).</li>' +
        '<li>Un assistant en ligne compare le vocabulaire de votre CV avec celui de la référence.</li>' +
        '<li>Vous recevez quatre listes de mots, de même importance, et des pistes de reformulation.</li>' +
        '<li>Si votre CV contient du texte caché, le module le repère et vous en explique les risques, au lieu de s’en servir.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas une note ni un score sur vous. Votre CV n’est pas vous.</li>' +
        '<li>Ce n’est pas un jugement sur votre parcours : on regarde des mots.</li>' +
        '<li>Ce n’est pas une garantie d’être retenu : ajouter un mot-clé rend un CV plus visible, cela ne décide pas à la place du recruteur.</li>' +
        '<li>Ce n’est pas une analyse de fond de votre CV : on regarde les mots, pas la solidité de votre parcours.</li>' +
        '<li>Il ne vous aide pas à tromper un logiciel de tri : s’il repère du texte caché, il vous le déconseille et vous explique pourquoi.</li>' +
        '<li>Il ne vous reproche jamais d’avoir masqué vos coordonnées : l’analyse se fait sur un CV anonymisé, c’est normal.</li>' +
        '</ul>' +
        '<p class="mb-0" style="margin-top:.5rem;"><button type="button" class="btn btn-outline-secondary btn-sm" onclick="if(typeof _atsOuvrirFenetreFaq===\'function\'){_atsOuvrirFenetreFaq();}">&#8505;&#65039; Comprendre les logiciels de tri (ATS)</button></p>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Repérer les mots-clés à ajouter ou à reformuler dans votre CV, en partant de ce que vous savez déjà faire.</li>' +
        '<li>Refaire la comparaison pour une autre offre ou un autre métier.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">Si un mot à travailler ou une reformulation vous semble important pour la suite, vous pourrez le garder dans Mes Repères, votre espace personnel de notes.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">L’application prépare et copie le texte de départ pour vous. Vous le collez sur le site de l’assistant que vous avez choisi, vous récupérez sa réponse, puis vous revenez la coller ici. Vous êtes guidé à chaque étape ; vous n’avez rien à taper pour démarrer.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128274;', 'Avant de transmettre votre CV, vous passez par un écran de vérification où vous masquez votre nom, votre adresse ou votre téléphone. L’analyse se fait sur ce CV anonymisé : l’absence de nom ou de coordonnées n’est jamais comptée comme un manque. L’assistant ne sait pas qui vous êtes, et rien de ce que vous faites ici n’est conservé ni transmis à un employeur.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('ats_intro_affichee'); }
}

function pageIntroRegardRecruteur() {
  var enDetour = (typeof _regardRecruteurDetourPresentation !== 'undefined' && _regardRecruteurDetourPresentation);
  var config = {
    carteRetour: 'preparer',
    detour: enDetour,
    detourLogo: 'bi-image',
    detourBoutonId: 'btnRegardRecruteurRevenirModuleHaut',
    detourCtaId: 'btnRegardRecruteurRevenirModuleBas',
    onRevenir: (typeof regardRecruteurRevenirDeLaPresentation === 'function') ? regardRecruteurRevenirDeLaPresentation : null,
    onRevenirExpr: 'regardRecruteurRevenirDeLaPresentation()',
    titre: '<i class="bi bi-image"></i> Un regard sur mon CV',
    sousTitre: 'Vous préparer au regard qu’un recruteur porte sur votre dossier : ce qui ressort, ce qui peut faire hésiter, les questions probables.',
    ctaId: 'btnRegardRecruteurCommencer',
    ctaLabel: 'Demander un regard sur ma candidature &#8594;',
    etapes: (typeof RR_ETAPES !== 'undefined') ? RR_ETAPES : null,
    onCta: function () {
      // Session deja engagee : retour dans le module avec encart
      // « Continuer / Recommencer » + gel (famille 2). Sinon on demarre.
      var enCours = (typeof _regardRecruteurRenduVue === 'function');
      if (!enCours && typeof ouvrirRegardRecruteur === 'function') { ouvrirRegardRecruteur(); }
      else if (enCours) { _regardRecruteurReprisePendante = true; }
      if (typeof naviguerVers === 'function') { naviguerVers('regard-recruteur'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>C’est une simulation, pas le verdict d’un vrai recruteur.</strong> Chaque doute est présenté comme une question à vérifier ou à préparer, jamais comme une vérité sur vous.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">Voir votre candidature comme un recruteur peut la voir : la première impression, les points forts perçus, les inquiétudes possibles, les questions qu’il pourrait se poser. Un recruteur repère d’abord les informations qui lui permettent de vérifier rapidement l’adéquation avec le poste, et un CV mal structuré peut faire perdre ces informations même quand le contenu est solide. Ce module vous aide à repérer ça avant lui.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous préparez votre CV : de préférence en <strong>image</strong> (capture d’écran ou page exportée en image, nette et lisible), ou en <strong>texte seul</strong> collé si vous préférez. L’image permet la lecture complète (six parties) ; le texte seul en couvre quatre, celles qui ne dépendent pas de la mise en page.</li>' +
        '<li>Vous masquez ce que vous ne voulez pas transmettre (nom, photo, coordonnées) : avec des rectangles sur l’image, ou directement dans le texte.</li>' +
        '<li>Vous indiquez le poste visé, l’entreprise, et si vous l’avez l’offre d’emploi.</li>' +
        '<li>Un assistant en ligne regarde votre CV comme le ferait un recruteur : la mise en page, l’aération, la longueur, la hiérarchie des informations, autant que le contenu.</li>' +
        '<li>Il repère aussi si votre CV reprend les couleurs ou les codes visuels de l’entreprise, et vous dit comment un recruteur pourrait le percevoir.</li>' +
        '<li>Vous recevez une lecture structurée : points forts perçus, doutes possibles, questions probables, chacun formulé comme un point à vérifier.</li>' +
        '</ul>') +
      _introBlocSection('&#127912; Les couleurs de l’entreprise dans votre CV',
        '<p class="mb-2">Reprendre discrètement les couleurs ou les codes visuels de l’entreprise dans son CV est une technique courante. Certains recruteurs y sont sensibles : ils y voient un signe d’intérêt réel et d’effort pour se projeter dans la structure.</p>' +
        '<p class="mb-0">À partir de l’image de votre CV et du nom de l’entreprise, le module vous dit si votre CV le fait déjà, et comment un recruteur pourrait le recevoir. Ce n’est jamais présenté comme une obligation : d’autres recruteurs y sont indifférents, et un CV doit rester lisible avant tout.</p>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas le verdict d’un vrai recruteur : c’est une simulation, pour vous préparer.</li>' +
        '<li>Ce n’est pas une note ni un classement de votre candidature.</li>' +
        '<li>Ce n’est pas un entretien en direct ni une conversation : vous recevez une lecture, pas un échange.</li>' +
        '<li>Ce ne sont pas plusieurs avis contradictoires : une seule lecture, structurée et bornée.</li>' +
        '<li>Il ne réécrit pas votre CV et n’y touche jamais : il en donne une lecture, les corrections restent les vôtres.</li>' +
        '</ul>') +
      _introBlocSection('&#9878;&#65039; Des questions, pas un jugement',
        '<p class="mb-0">Le résultat vous montre des points à vérifier et à préparer, jamais une évaluation de vous ou de votre valeur. Vous restez libre de tenir compte d’un point, de le nuancer, ou de le laisser de côté.</p>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Repérer les points de votre CV qui pourraient faire hésiter, et décider lesquels retravailler.</li>' +
        '<li>Préparer une réponse aux questions qu’un recruteur pourrait poser.</li>' +
        '<li>Refaire une lecture après avoir modifié votre CV, ou pour un autre poste.</li>' +
        '</ul>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">L’application prépare le texte de départ et vous guide pour joindre l’image de votre CV. Vous donnez le tout à l’assistant en ligne que vous avez choisi, vous récupérez sa réponse, puis vous revenez la coller ici. Vous êtes guidé à chaque étape ; vous n’avez rien à taper pour démarrer.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128274;', 'Avant d’envoyer l’image de votre CV, vous masquez vous-même, avec des rectangles, votre nom, votre photo et vos coordonnées. Votre nom et vos coordonnées ne partent jamais vers l’assistant.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('regard_recruteur_intro_affichee'); }
}

// Bascule 2026-09-05 (etape 5, module Comprendre le cadre) : le module
// existe desormais (modules/comprendre-le-cadre/index.js, etapes 1 a 4)
// -> texte repris a l'identique de la maquette validee
// (docs/MAQUETTE_SE_TENIR_INFORME_PARCOURS_2026-09-03.html, vue "intro"),
// CTA active. Le titre reprend "Comprendre le cadre" (le nom "Se tenir
// informe" reste celui de la carte d'accueil qui y mene, decision de
// Denis du 2026-09-04). Certains paragraphes decrivent la cible complete
// du module (assistant en ligne, tableau des sources, Mes Reperes) alors
// que seules les etapes 1 a 4 sont construites - meme principe deja en
// usage pour les autres pages d'introduction d'APP (ex. Comparer mes
// pistes avant que tout son parcours soit code) : le texte annonce le
// module fini, le CTA ouvre ce qui existe reellement aujourd'hui.
function pageIntroSeTenirInforme() {
  // Detour de consultation (retour Denis 2026-09-05) : quand on arrive
  // ici via "Revoir la presentation" DEPUIS le module, l'ecran affiche
  // "Revenir au module" (haut + CTA) plutot que "Ouvrir Comprendre le
  // cadre", et le clic retombe pile a l'ecran quitte - meme mecanisme
  // que pageIntroAideDecision() / Comparer mes pistes. FAMILLE 1 : pas
  // d'encart "Continuer / Recommencer", juste le detour.
  var enDetour = (typeof _comprendreLeCadreDetourPresentation !== 'undefined' && _comprendreLeCadreDetourPresentation);
  var config = {
    carteRetour: 'informe',
    detour: enDetour,
    detourLogo: 'bi-newspaper',
    detourBoutonId: 'btnComprendreLeCadreRevenirModuleHaut',
    detourCtaId: 'btnComprendreLeCadreRevenirModuleBas',
    onRevenir: (typeof comprendreLeCadreRevenirDeLaPresentation === 'function') ? comprendreLeCadreRevenirDeLaPresentation : null,
    onRevenirExpr: 'comprendreLeCadreRevenirDeLaPresentation()',
    titre: '<i class="bi bi-newspaper"></i> Comprendre le cadre',
    sousTitre: 'Savoir ce qui a changé dans l’emploi, la formation et les dispositifs, avant de décider ou d’accompagner.',
    ctaId: 'btnSeTenirInformeCommencer',
    ctaLabel: 'Ouvrir Comprendre le cadre &#8594;',
    onCta: function () {
      // Premiere entree (hors detour) : l'ecran interne du module est
      // deja 'accueil' par defaut, rien a remettre a zero.
      if (typeof naviguerVers === 'function') { naviguerVers('comprendre-le-cadre'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Ce n’est pas un fil d’actualités.</strong> Rien ne clignote, rien ne vous presse. Vous venez quand une question précise vous bloque, vous trouvez un repère fiable et le lien officiel, vous repartez.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-1"><strong>Pour vous :</strong> quand une question précise vous bloque (ai-je droit à une aide au permis ? ça recrute dans quoi près de chez moi ?), trouver le bon repère et la source officielle, au lieu d’une recherche au hasard qui tombe sur un site douteux.</p>' +
        '<p class="mb-0"><strong>Pour un professionnel de l’insertion :</strong> une base de repères vérifiés à garder sous la main, à montrer à une personne accompagnée ou à consulter avant un rendez-vous.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous choisissez un rayon : l’emploi et les contrats, la formation et la reconversion, l’accompagnement, la création d’activité, les moins de 26 ans, les plus de 50 ans et la retraite, le handicap, le séjour quand on vient de l’étranger, la sortie de détention, le budget et les dettes, la mobilité, le logement, la garde d’enfant, l’apprentissage du français, les questions juridiques. Si vous ne savez pas où chercher, « Affiner ma recherche » vous aiguille : des phrases à cocher, ou un champ où décrire votre situation.</li>' +
        '<li>Chaque fiche est courte, en langage simple, avec la date de dernière vérification et le lien vers la source officielle à jour.</li>' +
        '<li>Pour une information récente qui n’a pas encore de fiche (un montant, un financement, des métiers qui recrutent), l’application prépare un texte de recherche à copier chez un assistant en ligne ; vous rapportez sa réponse ici, encadrée d’un rappel de vérifier la source officielle.</li>' +
        '<li>Un tableau des sources officielles (Légifrance, le site du service public, l’INSEE, la DARES, France Travail…) vous dit à quoi sert chacune et où cliquer.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas un fil d’actualités : pas de « à la une », pas de nouveautés qui défilent, pas de notification.</li>' +
        '<li>Il ne cherche pas à vous faire revenir : vous venez quand vous en avez besoin.</li>' +
        '<li>Ce n’est pas une source de droit : les repères sont écrits à la main, à une date donnée. En cas de doute, c’est la page officielle qui fait foi.</li>' +
        '<li>Il n’affiche pas de montant ni de barème figé : les chiffres et les règles changent, le module renvoie vers la page officielle à jour.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Repartir vers la source officielle, avec la bonne page déjà repérée.</li>' +
        '<li>Poser une nouvelle question sur un autre sujet ou un autre territoire.</li>' +
        '</ul>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Pour vérifier une information récente, l’application prépare le texte de la recherche. Vous le collez sur le site d’un assistant en ligne qui consulte des sources récentes, puis vous rapportez la synthèse ici. Pour tout le reste (fiches, tableau des sources), vous consultez directement, sans assistant.</p>') +
      _introBlocComplementariteChiffres() +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128197;', 'Les repères sont rédigés à la main, à une date indiquée. Les règles et les chiffres peuvent évoluer : le lien officiel sous chaque repère pointe vers la version à jour.') +
        _introBlocEncart('&#128274;', 'Vos recherches ne sont pas enregistrées.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('se_tenir_informe_intro_affichee'); }
}

// Rectangle "a part" de complementarite entre "Comprendre le cadre" et
// "Comprendre les chiffres" (decision Denis 2026-09-06, D16 du chantier
// docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md). Les deux icones en tete
// (LECONS 9.9 renforcee). PAS de bouton ni de lien de renvoi : juste la
// phrase - le meme rectangle dans les deux pages d'introduction.
function _introBlocComplementariteChiffres() {
  return '<div class="cv-section" style="margin-bottom:0.9rem;background:var(--accent-bg-subtle);border-left:4px solid var(--accent);border-radius:12px;padding:1rem 1.3rem;">' +
    '<p class="mb-1"><strong><i class="bi bi-newspaper"></i> Comprendre le cadre</strong> et <strong><i class="bi bi-bar-chart"></i> Comprendre les chiffres</strong> vont ensemble.</p>' +
    '<p class="mb-0">« Comprendre le cadre » donne les repères sur vos droits, vos aides et vos démarches. « Comprendre les chiffres » donne les chiffres du territoire, qui aident à mieux comprendre ce qui se passe autour de ces règles. Les deux se complètent.</p>' +
    '</div>';
}

// Page de PRESENTATION du module "Comprendre les chiffres" (sous-carte de
// "Se tenir informe"). Meme patron que pageIntroSeTenirInforme /
// pageIntroAideDecision. Le module est routable des le bloc 1 du chantier
// (docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md) mais son contenu se remplit
// bloc par bloc : le texte ci-dessous annonce le module complet, le CTA
// ouvre ce qui existe. Consigne n1 de Denis : l'implementation doit rester
// identique a la maquette validee
// (docs/MAQUETTE_COMPRENDRE_LES_CHIFFRES_2026-09-06.html, vue "intro").
function pageIntroComprendreLesChiffres() {
  var enDetour = (typeof _comprendreLesChiffresDetourPresentation !== 'undefined' && _comprendreLesChiffresDetourPresentation);
  var config = {
    carteRetour: 'informe',
    detour: enDetour,
    detourLogo: 'bi-bar-chart',
    detourBoutonId: 'btnComprendreLesChiffresRevenirModuleHaut',
    detourCtaId: 'btnComprendreLesChiffresRevenirModuleBas',
    onRevenir: (typeof comprendreLesChiffresRevenirDeLaPresentation === 'function') ? comprendreLesChiffresRevenirDeLaPresentation : null,
    onRevenirExpr: 'comprendreLesChiffresRevenirDeLaPresentation()',
    titre: '<i class="bi bi-bar-chart"></i> Comprendre les chiffres',
    sousTitre: 'Le chômage, l’emploi, les métiers qui recrutent près de chez vous : des chiffres officiels, expliqués simplement, datés.',
    ctaId: 'btnComprendreLesChiffresCommencer',
    ctaLabel: 'Ouvrir Comprendre les chiffres &#8594;',
    onCta: function () {
      if (typeof naviguerVers === 'function') { naviguerVers('comprendre-les-chiffres'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Beaucoup de données existent déjà, gratuites et publiques.</strong> Le problème, c’est que peu de gens savent les lire. Ici, on les explique en langage simple.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-1"><strong>Pour vous :</strong> savoir où en est l’emploi près de chez vous, quels métiers recrutent, sans avoir à déchiffrer les tableaux de l’INSEE.</p>' +
        '<p class="mb-0"><strong>Pour un professionnel de l’insertion :</strong> un portrait du territoire à garder sous la main, à montrer à une personne ou à imprimer avant un rendez-vous.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous choisissez un territoire : votre département, votre région, la France entière, ou l’Union européenne.</li>' +
        '<li>Vous voyez d’abord <strong>les cinq chiffres clés du trimestre</strong> : chômage, personnes qui cherchent un emploi, durée de recherche, emplois, offres.</li>' +
        '<li>Chaque chiffre est <strong>écrit en gros, expliqué en une phrase, comparé</strong> (au trimestre précédent, à l’an dernier, à la région et à la France), avec un petit graphique.</li>' +
        '<li>En dépliant, vous accédez au <strong>portrait du territoire</strong> (entreprises, contrats, secteurs, freins à l’emploi…) et à <strong>ce que les employeurs prévoient d’embaucher</strong> cette année.</li>' +
        '<li>Pour une question chiffrée précise qui n’est pas là, l’application prépare un texte de recherche à copier chez un assistant en ligne ; vous rapportez sa réponse ici.</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas un tableau de bord en temps réel : chaque chiffre est une <strong>photo datée</strong>, le lien officiel donne la version à jour.</li>' +
        '<li>Il ne pose <strong>aucun diagnostic sur vous</strong>. Un chiffre décrit un territoire, pas une personne.</li>' +
        '<li>Il ne dit pas si vous allez trouver un emploi.</li>' +
        '</ul>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Repartir vers la source officielle, avec la bonne page déjà repérée.</li>' +
        '<li>Imprimer le portrait du territoire pour le préparer avant un rendez-vous.</li>' +
        '<li>Poser une question chiffrée précise sur un autre sujet ou un autre territoire.</li>' +
        '</ul>') +
      _introBlocComplementariteChiffres() +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128202;', 'Simplifier une statistique peut la déformer : on écrit toujours « d’après [source], en [date] », jamais une vérité.') +
        _introBlocEncart('&#128274;', 'Vos recherches ne sont pas enregistrées.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('comprendre_les_chiffres_intro_affichee'); }
}

// TACHE (retour Denis, 2026-08-31) : page de PRESENTATION de la fonction
// "Comparer mes pistes" (aide a la decision d'orientation). Module
// construit : modules/comparer-pistes/index.js (route 'comparer-pistes').
// Maquettes : docs/MAQUETTE_INTRO_AIDE_DECISION.html (presentation) +
// docs/MAQUETTE_COMPARER_PISTES_FLUX_2026-08-31.html (flux). Spec :
// docs/CHANTIER_AIDE_DECISION_ORIENTATION.md.
// Decision Denis (§2.1) : ce n'est pas un module autonome mais une
// FONCTION transversale (fiche metier / "Vous hesitez encore ?" /
// recherche) ; la tuile Boite a outils est provisoire, a re-placer lors
// de la refonte de l'accueil.
// Principe directeur : APP n'est pas un comparateur, elle aide a comprendre
// les enjeux derriere chaque piste. Jamais de score, de classement, de
// "gagnant", de "metier d'avenir/qui disparait", de "metier choisi".
function pageIntroAideDecision() {
  var cpDetour = (typeof _comparerDetourPresentation !== 'undefined' && _comparerDetourPresentation);
  var config = {
    carteRetour: 'orientation',
    detour: cpDetour,
    detourLogo: 'bi-signpost-split',
    detourBoutonId: 'btnComparerRevenirModuleHaut',
    detourCtaId: 'btnComparerRevenirModuleBas',
    onRevenir: (typeof comparerRevenirDeLaPresentation === 'function') ? comparerRevenirDeLaPresentation : null,
    onRevenirExpr: 'comparerRevenirDeLaPresentation()',
    titre: '<i class="bi bi-signpost-split"></i> Comparer mes pistes',
    sousTitre: 'Vous hésitez entre deux ou trois pistes ? Cette comparaison vous aide à mieux comprendre ce que chacune implique, pour décider vous-même.',
    ctaId: 'btnAideDecisionCommencer',
    ctaLabel: 'Comparer mes pistes &#8594;',
    etapes: (typeof COMPARER_NAV_ETAPES !== 'undefined') ? COMPARER_NAV_ETAPES : null,
    onCta: function () {
      // Reprendre une session deja engagee plutot que de la reinitialiser
      // (la remise a zero volontaire vit sur l'encart de reprise et sur
      // l'ecran final). Retour dans le module avec une comparaison en cours
      // -> encart "Continuer / Recommencer" + gel (aligne sur Coherence).
      var enCours = typeof _comparerRenduEcran === 'function';
      if (!enCours && typeof ouvrirComparerPistes === 'function') { ouvrirComparerPistes(); }
      else if (enCours) { _comparerReprisePendante = true; }
      if (typeof naviguerVers === 'function') { naviguerVers('comparer-pistes'); }
    },
    blocsHTML:
      _introBlocAccroche('<strong>Cette comparaison ne désigne pas une « meilleure » option.</strong> Il n’y a pas de note, pas de gagnant : chaque piste est présentée de la même façon, pour vous aider à voir ce qui est en jeu et les choix que chaque chemin demande.') +
      _introBlocSection('&#127919; À quoi ça sert',
        '<p class="mb-0">Mettre côte à côte deux ou trois pistes (métiers, formations, projets, parcours, domaines) et, pour chacune, mieux comprendre : ce qu’elle demande, ce qu’elle ouvre, ce qu’elle ferme, et les décisions à prendre en chemin. Les informations utiles (durée, conditions de travail, financement, évolutions, marché) servent à éclairer ces enjeux, jamais à départager les pistes à votre place.</p>') +
      _introBlocSection('&#128203; Ce qui va se passer',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Vous ajoutez 2 ou 3 pistes : en racontant ce qui vous fait hésiter, en les nommant, ou en collant un texte utile. Vous pouvez mélanger ces façons.</li>' +
        '<li>Si vous venez d’une fiche métier ou d’une recherche, les métiers que vous aviez mis de côté sont déjà là : vous les complétez, vous en ajoutez ou vous en retirez.</li>' +
        '<li>Pour chaque piste, une fiche avec la même structure : les activités, les conditions de travail, ce que cette piste implique, ce qui demande une vérification aujourd’hui, et des questions à vous poser.</li>' +
        '<li>L’application choisit seule la façon de regarder vos pistes (côte à côte, ou dans le temps si vous comparez des situations) et vous pouvez la corriger.</li>' +
        '<li>Les informations qui changent souvent (rémunération, financement de la formation, tension du marché, évolutions récentes du secteur) sont regroupées dans un encadré « À vérifier avant votre décision », toujours avec leur date et leur source.</li>' +
        '<li>Pour ces informations récentes, l’application prépare des textes que vous passez à un assistant en ligne (recherche web activée), puis vous rapportez ses réponses ici.</li>' +
        '<li>À la fin, une zone libre « Ce que vous retenez » et « Points à discuter avec mon conseiller ».</li>' +
        '</ul>') +
      _introBlocSection('&#128683; Ce que ce module ne fait pas',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Ce n’est pas un comparateur de métiers : il ne dit jamais lequel est le meilleur.</li>' +
        '<li>Pas de note, pas de score, pas de classement, aucune ligne « total ».</li>' +
        '<li>Il ne décide pas à votre place. Il n’enregistre jamais un « métier choisi », seulement, si vous le souhaitez, « une piste que je souhaite approfondir ».</li>' +
        '<li>Il ne parle jamais de « métier d’avenir » ni de « métier qui disparaît » : seulement de tendances observées récemment, datées et sourcées.</li>' +
        '</ul>') +
      _introBlocSection('&#128099; Des repères, pas une décision à votre place',
        '<p class="mb-0">Le résultat vous donne de quoi réfléchir et de quoi préparer un échange. La décision se construit avec votre conseiller, en tenant compte de votre situation, de vos contraintes et de vos priorités.</p>') +
      _introBlocSection('&#9999;&#65039; Ce que vous pourrez faire ensuite',
        '<ul class="mb-0" style="padding-left:1.25rem;">' +
        '<li>Garder une piste que vous souhaitez approfondir (jamais présentée comme un choix définitif).</li>' +
        '<li>Repartir avec vos questions et vos points de vigilance, à copier pour un rendez-vous avec un conseiller.</li>' +
        '<li>Refaire la comparaison avec d’autres pistes, ou pour un autre département.</li>' +
        '</ul>') +
      _introBlocSection('<i class="bi bi-bookmark-star"></i> Mes Repères',
        '<p class="mb-0">Si une piste ou une question vous semble importante pour la suite, vous pourrez la garder dans Mes Repères, votre espace personnel de notes.</p>') +
      _introBlocSection('&#128172; Comment ça se passe concrètement',
        '<p class="mb-0">Les informations viennent de ce qu’un assistant en ligne rapporte à partir de sources officielles : l’application prépare les textes à copier, vous les passez à l’assistant, vous rapportez ses réponses. Chaque information est affichée avec sa source et sa date. Si une réponse n’a pas l’air fiable, l’application vous le signale. Vous êtes guidé à chaque étape.</p>') +
      _introBlocSection('&#9989; Bon à savoir',
        _introBlocEncart('&#128197;', 'Les informations sur la rémunération, le financement ou le marché du travail changent régulièrement : elles sont toujours accompagnées de leur source et de leur date, jamais présentées comme des vérités permanentes.') +
        _introBlocEncart('&#128190;', 'Cette application ne demande jamais de compte : pensez à cliquer sur l’icône disquette après avoir travaillé, sinon vos informations seront perdues à la fermeture de la page.'))
  };
  app.innerHTML = htmlPageIntroModuleParcours(config);
  brancherPageIntroModuleParcours(config);
  if (typeof trackEvenement === 'function') { trackEvenement('aide_decision_intro_affichee'); }
}

/* ------------------------------------------------------------
   AIGUILLAGE AUTOMATIQUE
   "J'ai deja un CV" / "Mettre a jour" ouvre la fenetre de depot.
   ------------------------------------------------------------ */

(function () {
  if (typeof document === 'undefined') { return; }

  document.addEventListener('click', function (e) {
    var carte = e.target.closest ? e.target.closest('[data-action="mode"]') : null;
    if (carte && (carte.dataset.value === 'maj' || carte.dataset.value === 'pret')) {
      e.stopPropagation();
      e.preventDefault();
      ouvrirAssistantDepotCV(carte.dataset.value);
    }
  }, true);
})();

/* Export CommonJS protege -- tests/secteursMetiers.test.js,
   tests/reformulerCvLogique.test.js (Node). Sans effet en navigateur
   (module non defini). Les fonctions _reformulerCv* exportees ici sont la
   logique PURE (aucun DOM) du parcours "Reformuler et presenter mon CV" :
   parseur de la reponse assistant, structuration best-effort en dossier.
   _reformulerCvRenduCorpsProposition n'est pas exportee : elle appelle
   echapperAttribut(), qui vit dans js/app.js et depend du DOM. */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    baseMetiers: baseMetiers,
    SECTEURS_APP: SECTEURS_APP,
    normaliserTexte: normaliserTexte,
    motsCles: motsCles,
    correspond: correspond,
    METIERS_SAISONNIER_ALIMENTAIRE: METIERS_SAISONNIER_ALIMENTAIRE,
    METIERS_QUI_RECRUTENT_GENERALEMENT: METIERS_QUI_RECRUTENT_GENERALEMENT,
    _reformulerCvParserReponse: _reformulerCvParserReponse,
    _reformulerCvNettoyerStruct: _reformulerCvNettoyerStruct,
    _reformulerCvResumeChangements: _reformulerCvResumeChangements,
    _reformulerCvTexteFinalProposition: _reformulerCvTexteFinalProposition,
    detecterCoordonneesSensibles: detecterCoordonneesSensibles
  };
}
