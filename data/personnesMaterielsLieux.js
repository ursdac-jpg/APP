/* ============================================================
   data/personnesMaterielsLieux.js
   ------------------------------------------------------------
   TACHE 22A puis 22B : referentiel dedie a l'ecran "Avec qui ou
   avec quoi travailliez-vous principalement ?" (personnes,
   materiels, animaux -- ex "lieux", retiree TACHE (retour utilisateur) :
   faisait doublon avec la page "Environnement", remplacee par "Animaux",
   qui comble un vrai manque plutot que de simplement retirer une
   categorie).

   Meme structure et meme esprit que data/actionsProfessionnelles.js
   (TACHE 21C), pour un fonctionnement identique dans toute
   l'application :

   {
     id, label, icon, categorie,
     savoirFaire: [...],  // termes DEJA presents dans categorieCompetence (app.js)
     savoirEtre: [...],   // termes DEJA presents dans categorieCompetence (app.js)
     savoirs: [...],      // connaissances/notions, libres
     metiers: [...]       // noms EXACTS de metiers (baseMetiers[].nom, data/metiers.js)
   }

   Evolutivite : ajouter une personne/un materiel/un lieu = ajouter une
   entree dans le tableau "items" de la categorie concernee (ou une
   nouvelle categorie directement dans CATALOGUE_PERSONNES_MATERIELS_LIEUX).
   Aucune modification du code des composants n'est necessaire.

   IMPORTANT (migration progressive, TACHE 22A/22B) :
   - L'ancienne constante "dataActivites" et l'ancien dictionnaire
     "mappingCompetences" (js/app.js) restent INCHANGES et continuent
     de fonctionner. Ils seront supprimes uniquement apres validation
     complete (pas avant que l'utilisateur ne le demande explicitement).
   - Les identifiants communs aux deux systemes (clients, collegues,
     enfants, personnes_agees, machines, ordinateur, documents,
     marchandises, vehicules, outils, magasin, bureau, exterieur,
     deplacement, famille, seul) remontent donc les memes competences
     via les deux systemes en parallele (sans doublon a l'affichage,
     la fonction ajouter() du moteur etant deduplicatrice).
   ============================================================ */

var CATALOGUE_PERSONNES_MATERIELS_LIEUX = [
  {
    categorie: 'Personnes',
    icone: '👥',
    items: [
      { id: 'clients', label: 'Des clients', icon: '👥', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Relation client', 'Communication', 'Écoute'],
        savoirs: [], metiers: ['Conseiller de vente', 'Agent d\'accueil'] },
      { id: 'collegues', label: 'Des collègues', icon: '🤝', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Travail en équipe', 'Coordination', 'Entraide'],
        savoirs: [], metiers: ['Chef d\'équipe'] },
      { id: 'enfants', label: 'Des enfants', icon: '👶', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Pédagogie', 'Patience', 'Bienveillance'],
        savoirs: [], metiers: ['Auxiliaire petite enfance', 'Animateur'] },
      { id: 'personnes_agees', label: 'Des personnes âgées', icon: '👵', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Empathie', 'Aide à la personne', 'Écoute'],
        savoirs: [], metiers: ['Aide-soignant', 'Assistant de vie aux familles (ADVF)'] },
      { id: 'patients', label: 'Des patients', icon: '🧑‍⚕️', categorie: 'Personnes',
        savoirFaire: ['Soins'], savoirEtre: ['Empathie'],
        savoirs: ['Notions médicales de base'], metiers: ['Aide-soignant', 'Infirmier'] },
      { id: 'eleves_etudiants', label: 'Des élèves / étudiants', icon: '👨‍🏫', categorie: 'Personnes',
        savoirFaire: ['Formation', 'Transmission'], savoirEtre: ['Pédagogie', 'Patience'],
        savoirs: [], metiers: ['Formateur / Éducateur', 'Animateur'] },
      { id: 'adolescents', label: 'Des adolescents', icon: '🛹', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Pédagogie', 'Patience', 'Écoute'],
        savoirs: [], metiers: ['Éducateur spécialisé', 'Animateur', 'Formateur / Éducateur', 'Moniteur auto-école'] },
      { id: 'personnes_handicap', label: 'Des personnes en situation de handicap', icon: '♿', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Empathie', 'Aide à la personne', 'Patience'],
        savoirs: [], metiers: ['Accompagnant d\'eleves en situation de handicap (AESH)', 'Accompagnant éducatif et social (AES)', 'Éducateur spécialisé'] },
      { id: 'personnes_en_difficulte', label: 'Des personnes en difficulté', icon: '🧩', categorie: 'Personnes',
        savoirFaire: ['Accompagnement'], savoirEtre: ['Écoute', 'Empathie', 'Discrétion', 'Bienveillance'],
        savoirs: [], metiers: ['Conseiller en insertion professionnelle', 'Assistant de service social', 'Éducateur spécialisé'] },
      { id: 'familles', label: 'Des familles', icon: '🏠', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Écoute', 'Discrétion', 'Bienveillance'],
        savoirs: [], metiers: ['Garde d\'enfants à domicile', 'Assistant de vie aux familles (ADVF)', 'Assistant de service social'] },
      { id: 'salaries_professionnels', label: 'Des salariés ou professionnels à accompagner', icon: '💼', categorie: 'Personnes',
        savoirFaire: [], savoirEtre: ['Communication', 'Esprit d\'équipe', 'Discrétion'],
        savoirs: [], metiers: ['Gestionnaire ressources humaines', 'Assistant ressources humaines', 'Formateur / Éducateur'] },
      { id: 'partenaires_fournisseurs', label: 'Des partenaires, des fournisseurs', icon: '📇', categorie: 'Personnes',
        savoirFaire: ['Négociation'], savoirEtre: ['Communication', 'Fiabilité'],
        savoirs: [], metiers: ['Logisticien', 'Responsable de magasin', 'Chef de chantier'] },
      { id: 'sportifs', label: 'Des sportifs', icon: '🏅', categorie: 'Personnes',
        savoirFaire: ['Coaching'], savoirEtre: ['Motivation', 'Endurance'],
        savoirs: [], metiers: ['Éducateur sportif', 'Moniteur de fitness', 'Maître-nageur sauveteur'] },
      { id: 'usagers_public', label: 'Un public varié (usagers, voyageurs)', icon: '🎟️', categorie: 'Personnes',
        savoirFaire: ['Assistance'], savoirEtre: ['Accueil', 'Sens du service', 'Communication'],
        savoirs: [], metiers: ['Agent d\'accueil touristique', 'Bibliothécaire', 'Conducteur de transport en commun', 'Agent d\'accueil'] }
    ]
  },
  {
    categorie: 'Matériels',
    icone: '📦',
    items: [
      { id: 'machines', label: 'Des machines', icon: '⚙️', categorie: 'Matériels',
        savoirFaire: ['Technique', 'Maintenance', 'Précision'], savoirEtre: [],
        savoirs: [], metiers: ['Technicien de maintenance', 'Agent de production'] },
      { id: 'ordinateur', label: 'Un ordinateur', icon: '💻', categorie: 'Matériels',
        savoirFaire: ['Bureautique', 'Analyse de données'], savoirEtre: ['Organisation'],
        savoirs: [], metiers: ['Assistant administratif', 'Développeur informatique'] },
      { id: 'documents', label: 'Des documents', icon: '📄', categorie: 'Matériels',
        savoirFaire: ['Gestion administrative', 'Bureautique'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Assistant administratif', 'Secrétaire médicale'] },
      { id: 'marchandises', label: 'Des marchandises', icon: '📦', categorie: 'Matériels',
        savoirFaire: ['Gestion des stocks', 'Logistique'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Préparateur de commandes / Magasinier', 'Cariste'] },
      { id: 'vehicules', label: 'Des véhicules', icon: '🚗', categorie: 'Matériels',
        savoirFaire: ['Conduite', 'Logistique'], savoirEtre: ['Sécurité'],
        savoirs: ['Code de la route'], metiers: ['Chauffeur routier', 'Chauffeur-livreur'] },
      { id: 'outils', label: 'Des outils', icon: '🛠️', categorie: 'Matériels',
        savoirFaire: ['Travail manuel', 'Technique', 'Précision'], savoirEtre: [],
        savoirs: [], metiers: ['Maçon', 'Électricien'] },
      { id: 'appareils_numeriques', label: 'Des appareils numériques', icon: '📱', categorie: 'Matériels',
        savoirFaire: ['Bureautique', 'Technique'], savoirEtre: [],
        savoirs: [], metiers: ['Téléconseiller', 'Assistant administratif'] },
      { id: 'produits', label: 'Des produits à vendre ou à stocker', icon: '💊', categorie: 'Matériels',
        savoirFaire: ['Gestion des stocks'], savoirEtre: ['Rigueur'],
        savoirs: ['Règles d\'hygiène et de conservation'], metiers: ['Vendeur en alimentation', 'Préparateur de commandes / Magasinier'] },
      { id: 'materiaux', label: 'Des matériaux (bois, métal, béton...)', icon: '🧱', categorie: 'Matériels',
        savoirFaire: ['Travail manuel', 'Technique'], savoirEtre: ['Rigueur'],
        savoirs: [], metiers: ['Menuisier poseur', 'Maçon', 'Soudeur', 'Ébéniste', 'Charpentier'] },
      { id: 'tissus_vetements', label: 'Des tissus, des vêtements', icon: '🧵', categorie: 'Matériels',
        savoirFaire: ['Travail manuel', 'Finition', 'Précision'], savoirEtre: ['Rigueur', 'Sens du détail'],
        savoirs: ['Caractéristiques des tissus et matières textiles'], metiers: ['Couturier', 'Styliste', 'Modéliste', 'Retoucheur', 'Cordonnier', 'Employé de pressing', 'Lingère', 'Couturier industriel', 'Coupeur industriel', 'Employé de blanchisserie industrielle', 'Conseiller de vente'] },
      { id: 'aliments', label: 'Des aliments, des denrées', icon: '🥖', categorie: 'Matériels',
        savoirFaire: ['Cuisine'], savoirEtre: ['Respect des normes', 'Rigueur'],
        savoirs: ['Règles d\'hygiène'], metiers: ['Cuisinier / Commis de cuisine', 'Boulanger', 'Boucher', 'Pâtissier', 'Vendeur en alimentation', 'Opérateur de production agroalimentaire'] },
      { id: 'instruments_objets_art', label: 'Des instruments, des objets d\'art', icon: '🎻', categorie: 'Matériels',
        savoirFaire: ['Expression artistique'], savoirEtre: ['Créativité'],
        savoirs: [], metiers: ['Bijoutier', 'Ébéniste'] },
      { id: 'vegetaux', label: 'Des plantes, des végétaux', icon: '🌿', categorie: 'Matériels',
        savoirFaire: ['Travail manuel', 'Entretien'], savoirEtre: ['Patience'],
        savoirs: [], metiers: ['Fleuriste', 'Ouvrier horticole / Maraîcher', 'Ouvrier paysagiste / Jardinier', 'Arboriculteur', 'Vigneron'] },
      { id: 'produits_dangereux', label: 'Des produits chimiques ou dangereux', icon: '☣️', categorie: 'Matériels',
        savoirFaire: ['Technique'], savoirEtre: ['Sécurité', 'Respect des normes', 'Rigueur'],
        savoirs: ['Règles de sécurité'], metiers: ['Opérateur de production chimique', 'Peintre en bâtiment', 'Agent d\'entretien', 'Agent de propreté urbaine / Ripeur', 'Technicien de traitement des eaux', 'Carrossier-peintre automobile'] },
      { id: 'installations_electriques', label: 'Des installations électriques', icon: '⚡', categorie: 'Matériels',
        savoirFaire: ['Installation', 'Câblage'], savoirEtre: ['Sécurité', 'Rigueur'],
        savoirs: ['Règles de sécurité'], metiers: ['Électricien', 'Monteur de réseaux électriques', 'Technicien de maintenance', 'Technicien de maintenance éolienne', 'Agent de maintenance des bâtiments'] }
    ]
  },
  {
    // TACHE (retour utilisateur : "Lieux" fait doublon avec la page
    // "Environnement", remplacé par "Animaux" -- comble un vrai manque
    // (aucune des 2 autres categories, Personnes/Materiels, ne couvre le
    // travail avec des animaux) plutot que de simplement retirer une
    // categorie redondante. 5 nouveaux metiers crees pour l'occasion
    // (Vétérinaire, Auxiliaire vétérinaire, Agent équestre/Palefrenier,
    // Éleveur, Agent animalier -- voir referentielMetiersERIP.js),
    // combines aux 2 deja existants (Apiculteur, Toiletteur animalier).
    categorie: 'Animaux',
    icone: '🐾',
    items: [
      { id: 'animaux_compagnie', label: 'Des animaux de compagnie', icon: '🐕', categorie: 'Animaux',
        savoirFaire: ['Soins'], savoirEtre: ['Patience', 'Empathie', 'Sens du détail'],
        savoirs: ['Techniques de toilettage animalier'], metiers: ['Toiletteur animalier', 'Agent animalier'] },
      { id: 'chevaux', label: 'Des chevaux', icon: '🐴', categorie: 'Animaux',
        savoirFaire: ['Soins', 'Entretien'], savoirEtre: ['Rigueur', 'Endurance', 'Autonomie'],
        savoirs: ['Alimentation et santé du cheval'], metiers: ['Agent équestre / Palefrenier'] },
      { id: 'elevage_ferme', label: 'Des animaux d\'élevage / de ferme', icon: '🐄', categorie: 'Animaux',
        savoirFaire: ['Soins', 'Gestion administrative'], savoirEtre: ['Autonomie', 'Rigueur', 'Endurance'],
        savoirs: ['Alimentation et reproduction animale'], metiers: ['Éleveur'] },
      { id: 'abeilles', label: 'Des abeilles', icon: '🐝', categorie: 'Animaux',
        savoirFaire: ['Travail manuel'], savoirEtre: ['Patience', 'Autonomie', 'Rigueur'],
        savoirs: ['Cycle des abeilles', 'Techniques d\'apiculture de base'], metiers: ['Apiculteur'] },
      { id: 'soins_veterinaires', label: 'Des soins vétérinaires', icon: '🩺', categorie: 'Animaux',
        savoirFaire: ['Diagnostic', 'Soins'], savoirEtre: ['Empathie', 'Rigueur', 'Responsabilité'],
        savoirs: ['Notions médicales de base'], metiers: ['Vétérinaire', 'Auxiliaire vétérinaire'] }
    ]
  }
];
