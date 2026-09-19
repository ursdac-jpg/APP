/* ============================================================
   data/secteurs.js -- fiches de secteur de metier (APP)
   ------------------------------------------------------------
   Chantier "Candidater depuis la recherche + secteurs", sous-lot 2.
   Complete SECTEURS_APP (data/metiers.js, la liste controlee) avec, pour
   chaque secteur :
   - `explication` : 2 a 4 phrases -- qu'est-ce que ce secteur, ce qu'on y
     fait, exemples de structures qui recrutent. Ton simple, jamais un
     jugement sur la personne, jamais "recommande". Proposition de contenu
     (2026-09-04), a relire / ajuster par Denis.
   - `metiersPhares` : les identifiants des metiers du secteur, ORDONNES du
     plus "frequent / connu / porte d'entree" au plus specialise. Ce n'est
     PAS un classement de valeur ("frequent / connu", jamais "meilleur").
     L'ensemble doit correspondre exactement aux fiches dont `.secteur` vaut
     ce libelle (verifie par tests/secteursMetiers.test.js). Ordre = une
     proposition, a ajuster librement.

   Aucune logique ici : juste des donnees. Charge apres data/metiers.js.
   ============================================================ */

var SECTEURS_DETAIL = [
  {
    cle: 'btp',
    libelle: 'Bâtiment et travaux publics',
    explication: "Le bâtiment et les travaux publics regroupent les métiers qui construisent, rénovent et entretiennent les logements, les bâtiments, les routes et les réseaux. On y travaille surtout sur des chantiers, en équipe, avec ses mains et des outils. Les employeurs sont des entreprises du bâtiment, du petit artisan à la grande société de travaux publics, ainsi que des collectivités et des bailleurs. Beaucoup de postes s'apprennent sur le terrain, parfois sans diplôme au départ.",
    metiersPhares: [
      'macon', 'manoeuvre_btp', 'electricien', 'plombier', 'peintre',
      'menuisier_poseur', 'plaquiste', 'couvreur', 'carreleur', 'charpentier',
      'conducteur_engins_chantier', 'grutier', 'chef_chantier'
    ]
  },
  {
    cle: 'industrie',
    libelle: 'Industrie, production et énergie',
    explication: "L'industrie fabrique et transforme des produits : pièces, aliments, matériaux, énergie. On y conduit des machines, on surveille une ligne de production, on assemble ou on contrôle la qualité, le plus souvent en atelier ou en usine, parfois en horaires décalés. Les employeurs sont des usines de toutes tailles, des sites agroalimentaires, des entreprises de maintenance et de l'énergie. Les débuts se font souvent comme opérateur, avec une formation courte.",
    metiersPhares: [
      'agent_production', 'technicien_maintenance', 'soudeur', 'conducteur_ligne',
      'operateur_agroalimentaire', 'operateur_decoupe', 'usineur', 'regleur_cn',
      'operateur_chimie', 'agent_maintenance_batiment', 'monteur_reseaux_electriques',
      'technicien_froid_climatisation', 'technicien_qualite', 'technicien_eolien'
    ]
  },
  {
    cle: 'hotellerie-restauration',
    libelle: 'Hôtellerie, restauration et tourisme',
    explication: "Ce secteur accueille et sert le public : préparer et servir des repas, tenir un bar, s'occuper des chambres, renseigner des visiteurs. Le travail se fait au contact des clients, souvent debout, avec des horaires en coupure, le soir ou le week-end. Les employeurs sont des restaurants, des hôtels, des cafés, des cantines, des sites touristiques et des traiteurs. C'est un secteur qui recrute régulièrement, y compris pour un premier emploi.",
    metiersPhares: [
      'serveur', 'cuisinier', 'employe_polyvalent_restauration', 'plongeur',
      'barman', 'receptionniste', 'employe_etage', 'chef_cuisine',
      'accueil_touristique', 'guide_touristique', 'chef_reception',
      'concierge_hotel', 'sommelier'
    ]
  },
  {
    cle: 'agriculture-nature',
    libelle: 'Agriculture, nature et espaces verts',
    explication: "Ces métiers s'exercent dehors, au contact du vivant : cultiver, élever des animaux, entretenir des jardins et des espaces verts, travailler la vigne. Le travail suit les saisons et demande de l'endurance. Les employeurs sont des exploitations agricoles, des domaines viticoles, des entreprises de paysage, des communes et des coopératives. Certains postes sont saisonniers, d'autres à l'année.",
    metiersPhares: [
      'ouvrier_agricole', 'paysagiste', 'ouvrier_horticole', 'conducteur_engins_agricoles',
      'ouvrier_chai', 'vigneron', 'eleveur', 'arboriculteur', 'apiculteur', 'chef_de_culture'
    ]
  },
  {
    cle: 'transport-logistique',
    libelle: 'Transport et logistique',
    explication: "La logistique reçoit, range, prépare et expédie les marchandises ; le transport les conduit d'un point à un autre. On y travaille en entrepôt, par exemple à la préparation de commandes ou à la conduite de chariot, ou sur la route, pour la livraison ou le transport de voyageurs. Les employeurs sont des plateformes logistiques, des transporteurs, des enseignes de distribution et des réseaux de transport en commun. Beaucoup de postes sont accessibles avec une formation courte ou un permis dédié.",
    metiersPhares: [
      'preparateur_commandes', 'cariste', 'chauffeur_livreur', 'chauffeur_routier',
      'manutentionnaire', 'conducteur_bus', 'livreur_velo', 'agent_tri', 'logisticien'
    ]
  },
  {
    cle: 'sante',
    libelle: 'Santé et soins',
    explication: "Ce secteur prend soin des personnes malades, âgées ou hospitalisées : aide aux gestes du quotidien, soins, transport sanitaire, accueil et secrétariat médical. Le travail se fait en équipe, dans une relation d'aide, avec des horaires de jour comme de nuit. Les employeurs sont les hôpitaux, les cliniques, les maisons de retraite, les services d'aide à domicile et les cabinets médicaux. Plusieurs métiers s'ouvrent avec un diplôme préparé en formation ou en apprentissage.",
    metiersPhares: [
      'aide_soignant', 'ash', 'infirmier', 'ambulancier', 'brancardier',
      'secretaire_medicale', 'assistant_dentaire', 'preparateur_pharmacie'
    ]
  },
  {
    cle: 'social-personne',
    libelle: 'Social et services à la personne',
    explication: "Ces métiers accompagnent les personnes dans leur vie quotidienne : aide à domicile, garde d'enfants, soutien aux personnes en situation de handicap ou en difficulté. Le travail demande de l'écoute et de la patience, avec souvent des déplacements chez les particuliers. Les employeurs sont des associations, des services d'aide à domicile, des structures médico-sociales, des crèches et des collectivités. C'est un secteur qui recrute de façon continue.",
    metiersPhares: [
      'advf', 'aes', 'auxiliaire_petite_enfance', 'menage_domicile',
      'garde_enfants_domicile', 'educateur_specialise', 'assistant_social',
      'conseiller_insertion_professionnelle'
    ]
  },
  {
    cle: 'commerce-vente',
    libelle: 'Commerce et vente',
    explication: "Le commerce vend des produits et conseille les clients : accueil en magasin, mise en rayon, encaissement, vente par téléphone. Le travail se fait au contact du public, souvent debout, avec des horaires qui peuvent inclure le samedi. Les employeurs sont les magasins et grandes surfaces, les boutiques spécialisées, les centres d'appels et la distribution. De nombreux postes sont ouverts pour un premier emploi, avec une progression possible ensuite.",
    metiersPhares: [
      'conseiller_vente', 'hote_caisse', 'employe_libre_service', 'vendeur_alimentation',
      'teleconseiller', 'merchandiseur', 'responsable_magasin'
    ]
  },
  {
    cle: 'administration',
    libelle: 'Administration, gestion et bureau',
    explication: "Ces métiers font fonctionner une organisation depuis un bureau : accueil, courrier, dossiers, comptabilité, gestion du personnel. Le travail se fait surtout sur ordinateur, assis, en journée, avec de la rigueur et de l'organisation. Les employeurs sont des entreprises de tous secteurs, des administrations, des collectivités et des associations. Une formation en secrétariat, en gestion ou en comptabilité ouvre la plupart de ces postes.",
    metiersPhares: [
      'agent_accueil', 'assistant_administratif', 'comptable', 'assistant_rh',
      'gestionnaire_rh', 'chef_equipe', 'agent_polyvalent_collectivite'
    ]
  },
  {
    cle: 'communication-culture',
    libelle: 'Communication, culture et événementiel',
    explication: "Ce secteur informe, met en valeur et anime : création de visuels, animation des réseaux, photographie, organisation d'événements, accueil du public dans une bibliothèque. Le travail mêle créativité et technique, parfois en horaires irréguliers lors des événements. Les employeurs sont des agences, des collectivités, des associations culturelles, des entreprises et des lieux de spectacle. Certains postes demandent une formation spécialisée, d'autres se construisent avec l'expérience et des réalisations à montrer.",
    metiersPhares: [
      'graphiste', 'community_manager', 'photographe', 'animateur_evenementiel',
      'technicien_son_lumiere', 'bibliothecaire'
    ]
  },
  {
    cle: 'animalier',
    libelle: 'Métiers animaliers',
    explication: "Ces métiers s'occupent des animaux : soins, toilettage, garde, assistance vétérinaire, entretien d'écuries ou de refuges. Le travail est physique, se fait souvent debout et au contact direct des animaux. Les employeurs sont des cliniques vétérinaires, des salons de toilettage, des refuges, des élevages, des centres équestres et des animaleries. Plusieurs postes s'apprennent par une formation courte ou en apprentissage.",
    metiersPhares: [
      'toiletteur_animalier', 'agent_animalier', 'auxiliaire_veterinaire',
      'agent_equestre', 'veterinaire'
    ]
  },
  {
    cle: 'proprete',
    libelle: 'Propreté et gestion des déchets',
    explication: "Ce secteur nettoie et entretient les locaux et les espaces publics, et gère la collecte et le traitement des déchets et des eaux. Le travail est physique, souvent tôt le matin ou en horaires décalés, seul ou en petite équipe. Les employeurs sont des entreprises de propreté, des collectivités, des syndicats de traitement des déchets et des bailleurs. La plupart des postes sont accessibles sans diplôme, avec une formation à l'entrée.",
    metiersPhares: [
      'agent_entretien', 'agent_proprete_urbaine', 'agent_collecte_dechets', 'technicien_eaux'
    ]
  },
  {
    cle: 'sport-animation',
    libelle: 'Sport, animation et loisirs',
    explication: "Ces métiers encadrent des activités sportives et de loisirs : animation auprès d'enfants ou d'adultes, cours de sport, surveillance de baignade. Le travail se fait au contact d'un groupe, souvent le mercredi, le week-end ou pendant les vacances. Les employeurs sont des centres de loisirs, des clubs sportifs, des collectivités, des piscines et des associations. Un diplôme d'animation ou de sport, comme le BAFA ou le BPJEPS, est souvent demandé.",
    metiersPhares: ['animateur', 'educateur_sportif', 'maitre_nageur', 'moniteur_fitness']
  },
  {
    cle: 'numerique',
    libelle: 'Informatique et numérique',
    explication: "Ce secteur crée et fait fonctionner les sites, les logiciels et les réseaux informatiques. Le travail se fait surtout sur ordinateur, assis, en journée, avec de la logique et de la méthode. Les employeurs sont des entreprises du numérique, des services informatiques d'entreprises et d'administrations, et des agences web. Ces métiers demandent une formation dédiée, mais il existe des parcours courts et des reconversions.",
    metiersPhares: ['developpeur', 'technicien_reseau', 'webmaster']
  },
  {
    cle: 'banque-assurance-immobilier',
    libelle: 'Banque, assurance et immobilier',
    explication: "Ce secteur accompagne les clients dans leurs projets d'argent, de protection et de logement : ouverture de compte, contrats d'assurance, achat ou location de biens. Le travail se fait en agence, au contact du public, en journée, avec des objectifs commerciaux. Les employeurs sont des banques, des compagnies d'assurance, des agences immobilières et des cabinets de courtage. Une formation commerciale ou dans la banque et l'assurance est généralement attendue.",
    metiersPhares: ['conseiller_bancaire', 'agent_assurance', 'agent_immobilier']
  },
  {
    cle: 'artisanat',
    libelle: 'Artisanat et création',
    explication: "Ces métiers fabriquent ou arrangent des objets à la main, avec un savoir-faire précis : compositions florales, travail du bois, bijouterie. Le travail est manuel et minutieux, souvent en atelier ou en boutique, avec un contact clientèle. Les employeurs sont des artisans, des ateliers, des boutiques et des entreprises de création. L'apprentissage et le CAP sont les voies d'entrée les plus courantes.",
    metiersPhares: ['fleuriste', 'ebeniste', 'bijoutier']
  },
  {
    cle: 'artisanat-bouche',
    libelle: 'Métiers de bouche (artisanat)',
    explication: "Ces métiers préparent et vendent des produits alimentaires artisanaux : pain, viennoiserie, pâtisserie, viande. Le travail est manuel, commence souvent très tôt le matin, en laboratoire ou en boutique. Les employeurs sont des boulangeries, des pâtisseries, des boucheries, des traiteurs et les rayons frais de la distribution. Ces métiers s'apprennent surtout par un CAP en apprentissage.",
    metiersPhares: ['boulanger', 'boucher', 'patissier']
  },
  {
    cle: 'education-formation',
    libelle: 'Éducation et formation',
    explication: "Ces métiers transmettent des savoirs et accompagnent l'apprentissage : formation d'adultes, soutien à des élèves en situation de handicap, apprentissage de la conduite. Le travail se fait en relation avec un public qui apprend, avec de la pédagogie et de la patience. Les employeurs sont des organismes de formation, des écoles, des auto-écoles et des collectivités. Une expérience dans un domaine, complétée par une formation de formateur, ouvre plusieurs de ces postes.",
    metiersPhares: ['formateur', 'aesh', 'moniteur_auto_ecole']
  },
  {
    cle: 'automobile',
    libelle: 'Mécanique et automobile',
    explication: "Ce secteur entretient et répare les véhicules : mécanique, carrosserie, peinture. Le travail se fait en atelier, debout, avec des outils et du diagnostic, parfois au contact des clients. Les employeurs sont des garages, des concessions, des centres auto et des réseaux de réparation rapide. Le CAP mécanique ou carrosserie, en apprentissage, est la voie d'entrée habituelle.",
    metiersPhares: ['mecanicien', 'carrossier']
  },
  {
    cle: 'securite',
    libelle: 'Sécurité',
    explication: "Ces métiers protègent les personnes, les lieux et les biens : surveillance de magasins et d'événements, rondes, contrôle d'accès, missions de gendarmerie. Le travail demande de la vigilance et du sang-froid, souvent debout, de nuit comme de jour. Les employeurs sont des sociétés de sécurité privée, des magasins, des sites industriels, des organisateurs d'événements et les forces de l'ordre. La sécurité privée demande une carte professionnelle, obtenue après une formation.",
    metiersPhares: ['agent_securite', 'gendarme']
  },
  {
    cle: 'coiffure-esthetique',
    libelle: 'Coiffure et esthétique',
    explication: "Ces métiers prennent soin de l'apparence : coupe et coiffage, soins du visage et du corps, épilation, maquillage. Le travail est manuel, debout, au contact direct de la clientèle, avec le sens du conseil. Les employeurs sont des salons de coiffure, des instituts de beauté, des spas et des parfumeries. Le CAP coiffure ou esthétique, souvent en apprentissage, est la porte d'entrée.",
    metiersPhares: ['coiffeur', 'estheticienne']
  }
];

if (typeof window !== 'undefined') {
  window.SECTEURS_DETAIL = SECTEURS_DETAIL;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SECTEURS_DETAIL: SECTEURS_DETAIL };
}
