# Prompt : trouver le niveau d’accès des 666 métiers dont le ROME ne le précise pas (17/11/2026)

> **Pour qui** : Denis, à coller chez un autre assistant (ChatGPT, Perplexity, Gemini…) **avec la recherche sur le web activée**. Chaque lot ci-dessous est un message séparé : 17 lots de 40 métiers au plus.
> **Pourquoi** : sur 1920 métiers du ROME, 666 n’ont pas de niveau d’accès dans l’application, parce que la fiche officielle ne dit pas de diplôme (elle cite seulement des certificats comme le CACES ou le permis, un concours, ou de l’expérience). Un niveau vérifié sur une source officielle remplacerait l’absence, pour le filtre « niveau d’études » du chemin « Par un métier ».
> **Après** : coller les réponses à Claude, qui les relit, écarte tout ce qui n’est pas sourcé, et les range dans la table de niveaux (jamais un niveau inventé : un métier non vérifiable reste « non précisé »).
> Complément de rédaction repris de `docs/PROMPT_VERIFICATION_COMPLEMENT_QUI_MARCHE_2026-10-17.md` (règle de décision par cas, sources interdites, suite en PARTIE 2, aucun commentaire).

## Consigne à coller EN TÊTE de chaque lot

```
@Recherche sur le Web

Je vais te donner une liste de métiers, chacun avec son code ROME (France Travail).

Pour chaque métier, tu dois trouver le NIVEAU D’ACCÈS le plus bas qui permet d’exercer ce métier, UNIQUEMENT sur des sources OFFICIELLES :
- la fiche ROME du métier sur francetravail.fr (rubrique « Accès à l’emploi ») ;
- France Compétences (répertoire RNCP) ou Certif Info (niveau de qualification) ;
- l’Onisep, ou le site officiel de l’organisme qui délivre le diplôme ou organise le concours.

N’utilise aucun forum, annuaire, comparateur, site d’offres d’emploi, blog ou site de formation privée. N’invente jamais une information.

Échelle à utiliser (niveaux de qualification) :
2 = accessible sans diplôme (même si un certificat, un permis ou une habilitation est demandé) ; 3 = CAP, BEP ; 4 = Bac, Bac pro, brevet professionnel ; 5 = Bac+2 (BTS, DUT) ; 6 = Bac+3 (licence, BUT) ; 7 = Bac+5 (master, ingénieur) ; 8 = doctorat ou études très longues.

Règles de décision, métier par métier :
1. Si plusieurs voies existent (diplôme, concours, expérience, formation interne), retiens le niveau le PLUS BAS qui permet d’y entrer, et cite les autres voies dans la colonne prévue.
2. Si la source officielle dit clairement qu’aucun diplôme n’est exigé, indique 2.
3. Si l’accès se fait uniquement par concours ou par un diplôme d’État, indique le niveau du diplôme ou du niveau demandé pour se présenter au concours, tel qu’écrit dans la source.
4. Si la source officielle ne permet pas de trancher (le niveau dépend entièrement du poste), indique « variable ».
5. Si tu ne peux ouvrir aucune source officielle, indique « non vérifiable ». Ne devine pas.

Réponds uniquement sous cette forme, une ligne par métier, dans l’ordre de la liste :

code ROME | nom du métier | niveau (2 à 8, ou variable, ou non vérifiable) | autres voies d’accès | URL exacte de la source officielle | phrase lue sur la source (courte, recopiée) | statut (confirmé par source officielle / à vérifier)

Ne fais aucun commentaire.

Si tous les métiers ne tiennent pas dans une réponse, continue automatiquement avec PARTIE 2, PARTIE 3, etc., jusqu’à avoir traité toute la liste. Ne t’arrête jamais après quelques lignes.

Termine par une section « À OUVRIR PAR MOI » : pour chaque site qui t’a répondu 403, « Access Denied », « Just a moment » ou équivalent, donne un lien cliquable (format Markdown) vers la page que je dois ouvrir moi-même.
```

## Lot 1 sur 17 (40 métiers : A1201 à A1507)

```
A1201 | Bûcheron
A1202 | Ouvrier d'entretien des espaces naturels
A1203 | Ouvrier paysagiste / Jardinier
A1207 | Chef d'équipe de travaux de milieux naturels
A1208 | Jardinier paysagiste
A1209 | Elagueur
A1215 | Agent d'aires marines protégées
A1220 | Jardinier paysagiste en terrain de sport
A1308 | Technicien de l'insémination animale
A1311 | Technicien forestier
A1315 | Technicien naturaliste
A1317 | Gestionnaire d'aires marines protégées
A1321 | Chargé de mission thématique durable
A1402 | Aide agricole en production végétale
A1404 | Aquaculteur
A1405 | Ouvrier agricole / viticole
A1406 | Capitaine de pêche
A1407 | Eleveur de bovins
A1408 | Eleveur d'animaux sauvages
A1412 | Fromager-affineur
A1414 | Ouvrier horticole / Maraîcher
A1416 | Exploitant agricole
A1424 | Pisciculteur
A1425 | Ramendeur
A1426 | Educateur canin
A1427 | Goémonier
A1430 | Ouvrier aquacole
A1431 | Ouvrier piscicole
A1433 | Maraîcher
A1435 | Eleveur d'animaux de compagnie
A1440 | Cultivateur urbain
A1441 | Pépiniériste
A1443 | Cidrier
A1444 | Aide agricole en production fruitière
A1445 | Pêcheur sous-marin
A1447 | Herboriste
A1502 | Maréchal-ferrant
A1503 | Toiletteur animalier
A1506 | Agent animalier
A1507 | Ostéopathe animalier
```

## Lot 2 sur 17 (40 métiers : A1508 à C1205)

```
A1508 | Dresseur animalier
A1509 | Comportementaliste animalier
A1510 | Préparateur d'équidés
A1511 | Gardien d'animaux
B1101 | Artiste Plasticien
B1102 | Mosaïste d'art
B1103 | Sculpteur
B1104 | Artiste peintre
B1302 | Décorateur d'objets d'art
B1603 | Opérateur en bijouterie
B1611 | Trieur de pierres et perles
B1612 | Concepteur numérique en bijouterie joaillerie
B1613 | Orfèvre
B1617 | Coutelier d'art
B1702 | Technicien en ostéologie-moulage
B1814 | Directeur de collection
B1815 | Technicien voilier
C1102 | Agent d'assurance
C1103 | Courtier en assurance
C1104 | Responsable d'agence en assurances
C1106 | Expert risques en assurances
C1107 | Chargé d'indemnisations en assurances
C1108 | Responsable de département en assurances
C1109 | Gestionnaire en assurances
C1110 | Souscripteur en assurances
C1111 | Mandataire en assurance
C1112 | Agent général d'assurance
C1113 | Expert en assurances dommages automobile
C1117 | Courtier automobile
C1118 | Responsable de secteur en assurances
C1119 | Chargé d'affaires en assurances
C1121 | Inspecteur des assurances
C1124 | Technicien sécurité sociale
C1125 | Responsable gestion des sinistres
C1126 | Contrôleur cotisations sociales
C1128 | Rédacteur règlement assurances
C1201 | Chargé d'accueil et de services clientèle bancaire
C1203 | Chargé d'affaires bancaires
C1204 | Gestionnaire de produits bancaires
C1205 | Conseiller en gestion de patrimoine
```

## Lot 3 sur 17 (40 métiers : C1206 à D1305)

```
C1206 | Conseiller bancaire
C1207 | Directeur d'agence bancaire
C1208 | Courtier en banque
C1209 | Spécialiste de la vérification client
C1211 | Guichetier vendeur
C1212 | Conseiller à distance de banque
C1217 | Conseiller commercial de banque
C1301 | Trader
C1302 | Gestionnaire des opérations sur les marchés financiers
C1303 | Responsable de portefeuille financier
C1304 | Gestionnaire d'organisme de placement collectif en valeurs mobilières -OPCVM-
C1306 | Gestionnaire financier
C1401 | Agent administratif banque ou assurance
C1402 | Agent technique des régimes de retraite complémentaire et de prévoyance
C1403 | Cadre technique de la banque
C1501 | Gestionnaire de copropriété
C1503 | Chargé d'affaires immobilières
C1504 | Agent immobilier
C1507 | Chargé de recouvrement immobilier
D1117 | Chef pâtissier
D1119 | Mareyeur
D1204 | Agent technico-commercial en location de véhicules
D1210 | Vendeur en animalerie
D1221 | Vendeur de produits culturels et ludiques
D1222 | Masseur bien-être
D1223 | Conseiller de vente en pièces de rechange et accessoires de véhicules
D1227 | Acheteur vendeur d'or, de métaux précieux
D1231 | Responsable espace bien-être
D1232 | Formateur en esthétisme
D1235 | Plagiste
D1236 | Repasseur
D1239 | Perceur corporel
D1242 | Lingère
D1245 | Vendeur en parfumerie
D1247 | Vendeur en articles de puériculture
D1249 | Vendeur de cuisines
D1251 | Vendeur de tabac-presse
D1252 | Chef d'équipe de vente en pièces de rechange et d'accessoires de véhicules
D1253 | Disquaire
D1305 | Responsable de magasin cycles
```

## Lot 4 sur 17 (40 métiers : D1402 à F1133)

```
D1402 | Commercial grands comptes et entreprises
D1403 | Conseiller commercial auprès des particuliers
D1404 | Vendeur automobile
D1409 | Assistant administration des ventes
D1417 | Chef des ventes
D1423 | Conseiller produits en véhicules
D1426 | Vendeur en véhicules de collection
D1427 | Conseiller vendeur d'autocars
D1428 | Superviseur technique et logistique en assistance de régulation médicale
D1433 | Commercial export
D1434 | Conseiller commercial motocycles
D1436 | Assistant de régulation médicale (ARM)
D1440 | Conseiller en livraison de véhicules
D1441 | Technico-commercial de l'industrie et des services nautiques
D1442 | Courtier en bateau
D1443 | Chargé d'assistance
D1501 | Animateur de vente
D1507 | Employé libre-service
D1511 | Opérateur de station service
E1105 | Editeur
E1107 | Chef de projet événementiel
E1132 | Directeur éditorial
E1203 | Technicien de laboratoire photographique
E1206 | UX - UI Designer
E1207 | Motion designer
E1208 | Chef de studio de photographie
E1211 | Dessinateur-illustrateur
E1312 | Lecteur-correcteur
E1316 | Conducteur de machines à sérigraphier
E1403 | Consultant média
E1405 | Référenceur web
E1407 | Traffic manager
E1408 | Responsable trafic création
E1410 | Responsable programmatique
E1412 | Directeur média
F1103 | Diagnostiqueur immobilier
F1104 | Dessinateur-projeteur de la construction
F1110 | Dessinateur enveloppe du bâtiment
F1114 | Conseiller en rénovation énergétique
F1133 | Chargé d'affaires foncières
```

## Lot 5 sur 17 (40 métiers : F1203 à F1710)

```
F1203 | Chef de carrière
F1206 | Chef d'équipe bâtiment
F1207 | Chef d'équipe travaux publics
F1301 | Grutier
F1302 | Conducteur d'engins de chantier
F1303 | Conducteur d'engin de damage
F1402 | Boutefeu
F1403 | Foreur pétrole et gaz
F1501 | Monteur de structures bois
F1503 | Charpentier
F1506 | Ouvrier de la construction modulaire hors-site
F1601 | Plâtrier
F1602 | Électricien
F1604 | Plaquiste
F1605 | Monteur de réseaux électriques
F1607 | Menuisier poseur
F1608 | Carreleur
F1610 | Couvreur
F1611 | Façadier itéiste
F1612 | Tailleur de pierre
F1614 | Poseur en fermetures de bâtiment
F1615 | Poseur de cloisons démontables et mobiles
F1616 | Poseur de menuiseries extérieures
F1617 | Poseur de véranda
F1618 | Poseur de façade vitrée
F1620 | Installateur chauffage et climatisation
F1621 | Ramoneur
F1622 | Monteur en éclairage public
F1623 | Monteur installation réseaux mobiles
F1625 | Monteur en agencement
F1626 | Calorifugeur
F1628 | Installateur de bornes de recharges électriques
F1629 | Electricien de signalisation ferroviaire
F1701 | Coffreur
F1702 | Ouvrier en voieries urbaines
F1703 | Maçon
F1704 | Manœuvre / Aide de chantier
F1705 | Poseur de canalisations
F1706 | Agent de préfabrication de l'industrie du béton
F1710 | Magasinier en négoce des matériaux de construction
```

## Lot 6 sur 17 (40 métiers : F1711 à H1235)

```
F1711 | Poseur de voies ferrées
F1713 | Maçon-fumiste
G1205 | Opérateur d'attraction
G1206 | Croupier
G1208 | Entraîneur de sport professionnel et de haut niveau
G1209 | Animateur de loisirs sportifs
G1211 | Analyste de la performance sportive
G1212 | Animateur socio-sportif
G1215 | Educateur sportif Santé
G1216 | Moniteur de sport nature
G1217 | Moniteur de fitness
G1218 | Préparateur physique
G1219 | Recruteur sportif
G1220 | Educateur sportif spécialisé(e) en activités physiques et sportives adaptées
G1224 | Maître-nageur sauveteur
G1226 | Chef de bassin
G1228 | Guide de haute montagne
G1229 | Guide-accompagnateur de pêche
G1230 | Guide de tourisme équestre
G1232 | Opérateur de parcours acrobatique dans les arbres
G1234 | Musher guide de randonnée en traîneau
G1244 | Directeur des jeux
G1245 | Accompagnateur en moyenne montagne
G1246 | Animateur mobilité à vélo
G1247 | Surveillant d'espaces aquatiques
G1248 | Agent d'accueil en cinéma
G1249 | Responsable de hall de cinéma
G1302 | Yield manager
G1404 | Responsable d'établissement de restauration collective
G1405 | Directeur de structure sportive
G1414 | Directeur d'exploitation de site de divertissement
G1417 | Exploitant de casino de jeux
G1606 | Cuisinier de collectivité
G1708 | Voiturier
G1709 | Agent d'accueil et de prévention en camping
H1201 | Coloriste en industrie
H1205 | Modéliste industriel
H1211 | Attaché de recherche clinique (ARC)
H1216 | Responsable des études épidémiologiques
H1235 | Technicien en conception industrielle en mécanique
```

## Lot 7 sur 17 (40 métiers : H1244 à H2603)

```
H1244 | Formulateur de produits alimentaires
H1304 | Responsable Hygiène Sécurité Environnement (HSE) en industrie
H1309 | Technicien en radioprotection
H1401 | Responsable ordonnancement-lancement-planification en industrie
H1403 | Gestionnaire de flux de production
H1404 | Technicien méthodes
H1408 | Programmeur en Conception de Fabrication Assistée par Ordinateur (CFAO)
H1502 | Responsable qualité en industrie
H1504 | Contrôleur technique en électricité-électronique
H1505 | Nez
H1506 | Contrôleur technique en métallurgie
H1522 | Technicien en contrôles et essais non destructifs (CND END)
H1523 | Responsable Qualité Sécurité Environnement -QSE- en industrie
H1535 | Technicien qualité produit et métrologie en mécanique et travail des métaux
H2101 | Opérateur en transformation des viandes / conserverie
H2102 | Opérateur de production agroalimentaire
H2107 | Opérateur de préparation de poissons et produits de la mer
H2202 | Conducteur de ligne de production en industrie du bois
H2203 | Conducteur de machines de fabrication de panneaux à base de bois
H2205 | Opérateur de production en industrie du bois
H2211 | Opérateur de sciage bois
H2212 | Technicien de fabrication en industrie du bois
H2218 | Responsable de production en industrie du bois
H2405 | Conducteur de ligne de production de textiles non-tissés
H2406 | Conducteur de machines de traitement textile
H2408 | Imprimeur textile
H2409 | Coupeur industriel
H2410 | Opérateur de finition en industrie du textile
H2414 | Opérateur de préparation ou de finition sur articles de cuirs, peaux ou matériaux associés
H2417 | Conducteur de rame textile
H2427 | Coloriste du cuir
H2501 | Chef d'atelier production électricité-électronique
H2504 | Chef d'équipe en industrie
H2511 | Responsable d'atelier de blanchisserie industrielle
H2512 | Responsable d'atelier de fabrication de produits non-tissés
H2515 | Chef d'atelier en industrie de transformation
H2516 | Technicien de production du travail des métaux
H2601 | Bobinier en électricité
H2602 | Câbleur d'armoires
H2603 | Opérateur sur machines automatisées en production électrique
```

## Lot 8 sur 17 (40 métiers : H2604 à H3302)

```
H2604 | Assembleur en produits électriques et électroniques
H2605 | Monteur-câbleur
H2608 | Bobinier en matériels électroniques
H2703 | Technicien de maintenance de batteries de véhicules électriques
H2704 | Technicien démonteur de batteries de véhicules électriques
H2709 | Conducteur d'installation d'incinération
H2710 | Technicien responsable d'installation hydrogène
H2801 | Agent de fabrication du verre
H2802 | Opérateur de fabrication en matériaux de construction
H2804 | Pilote de centrale de béton
H2805 | Technicien de l'industrie du verre
H2806 | Technicien fusion en industrie verrière
H2807 | Bobineur de fils et fibres de verre
H2808 | Conducteur de presses en production transformation du verre
H2809 | Opérateur de poste centralisé en cimenterie
H2810 | Agent technique de centrale à enrobés
H2811 | Plieur de verre plat
H2902 | Chaudronnier
H2903 | Opérateur d'usinage (commande numérique)
H2904 | Forgeron industriel
H2905 | Cisailleur en métallurgie
H2906 | Opérateur en fabrication mécanique
H2907 | Fondeur en métallurgie
H2908 | Modeleur
H2909 | Agent de production
H2910 | Mouleur noyauteur machine
H2911 | Métallier
H2913 | Soudeur
H2914 | Tuyauteur
H2918 | Affûteur d'outillage industriel
H2919 | Charpentier métallique en construction navale
H2923 | Ajusteur-régleur de fabrication en instruments d'optique
H3101 | Conducteur de machines à papier ou carton
H3105 | Technicien de production en industrie papetière
H3106 | Conducteur de ligne en industrie papetière
H3201 | Plasturgiste
H3202 | Monteur régleur en plasturgie
H3204 | Opérateur de production des matières plastiques et du caoutchouc
H3205 | Technicien de production en matériaux composites
H3302 | Agent de conditionnement
```

## Lot 9 sur 17 (40 métiers : H3303 à I1316)

```
H3303 | Cuisinier en industrie chimique
H3306 | Responsable de silo
H3307 | Agent de silo
H3308 | Emballeur industriel
H3401 | Opérateur de traitement d'abrasion de surface
H3402 | Opérateur de traitement de surface
H3403 | Opérateur de traitement thermique
H3404 | Peintre industriel
H3406 | Opérateur en polissage de bijouterie ou d'orfèvrerie
H3410 | Galvanoplaste industriel
I1105 | Responsable de maintenance et d'exploitation
I1111 | Responsable technique après-vente des véhicules
I1115 | Responsable de site(s) de vente et de réparation cycles
I1116 | Responsable d'exploitation de stationnement
I1117 | Chef d'atelier après-vente cycles
I1118 | Responsable de site SMAVA (service multimarques de l'après-vente automobile)
I1119 | Responsable de centre de démontage recyclage des Véhicules Hors d'Usage - VHU
I1120 | Responsable technique en camping
I1201 | Agent technique d'affichage
I1202 | Agent d'exploitation de la voirie
I1203 | Agent de maintenance des bâtiments
I1206 | Chef d'équipe en mobilier urbain et publicitaire
I1207 | Agent de maintenance de mobilier urbain et publicitaire
I1209 | Technicien d'installation de panneau digital
I1210 | Agent de maintenance qualifié en camping
I1211 | Agent d'exploitation de stationnement
I1301 | Ascensoriste
I1302 | Technicien de maintenance d'installations automatisées
I1304 | Technicien de maintenance
I1305 | Technicien installation et maintenance électronique
I1306 | Technicien froid et climatisation
I1307 | Antenniste
I1308 | Chauffagiste
I1309 | Electricien de maintenance
I1310 | Mécanicien de maintenance industrielle
I1311 | Technicien installation réseaux câblés fibre optique
I1312 | Technicien réseaux mobiles
I1314 | Monteur installateur d'équipements connectés
I1315 | Monteur raccordeur fibre optique
I1316 | Technicien de maintenance Chauffage, Ventilation et Climatisation (CVC)
```

## Lot 10 sur 17 (40 métiers : I1317 à I1619)

```
I1317 | Technicien de maintenance fibre optique
I1319 | Technicien de maintenance réseaux mobiles
I1320 | Technicien de maintenance d'équipements connectés
I1321 | Technicien de maintenance éolienne
I1322 | Technicien de maintenance des automates bancaires
I1323 | Technicien de maintenance ferroviaire
I1324 | Technicien d'installation d'équipements industriels
I1325 | Technicien-cuisiniste en cuisines professionnelles
I1326 | Responsable d'équipe maintenance
I1329 | Technicien d'exploitation et de maintenance des équipements audiovisuels
I1330 | Technicien d'installation de centrales téléphoniques
I1333 | Chef d'équipe d'installation industrielle
I1335 | Electromécanicien d'équipements industriels
I1336 | Technicien froid embarqué routier
I1403 | Technicien Datacenter
I1407 | Réparateur en produits de télécommunication et multimédia
I1408 | Technicien-réparateur d'appareils photographiques
I1409 | Agent de maintenance en bureautique
I1502 | Plongeur scaphandrier
I1503 | Technicien en risques technologiques
I1506 | Superviseur cordiste
I1507 | Opérateur démantèlement nucléaire
I1508 | Désamianteur
I1509 | Scaphandrier inspecteur
I1510 | Plongeur scientifique et technique
I1511 | Technicien cordiste
I1512 | Programmateur des travaux sur cordes
I1513 | Chef d'équipe scaphandrier
I1514 | Technicien en dépollution
I1605 | Mécanicien en mécanique marine ou navale
I1606 | Carrossier-peintre automobile
I1607 | Mécanicien motocycles
I1608 | Démonteur de véhicules hors d'usage
I1611 | Préparateur de véhicules automobiles
I1612 | Technicien expert après-vente automobile
I1613 | Mécanicien des véhicules des transports routiers
I1614 | Préparateur en peinture automobile
I1615 | Dépanneur-remorqueur de véhicules
I1617 | Contrôleur technique de véhicules
I1619 | Mécanicien cycles
```

## Lot 11 sur 17 (40 métiers : I1625 à K1423)

```
I1625 | Débosseleur sans peinture
I1628 | Conseiller technique cycles
I1629 | Technicien de réparation et pose de vitrage des véhicules
I1632 | Opérateur de vérification des dispositifs embarqués Véhicules Légers VL
I1633 | Agent de maintenance nautique
I1635 | Mécanicien structure avion
I1636 | Mécanicien cabine
J1303 | Assistant médico-technique
J1306 | Manipulateur d'électroradiologie médicale
J1309 | Agent de stérilisation de service hospitalier
J1311 | Transporteur de produits de santé
J1312 | Assistant dentaire
J1409 | Pédicure-podologue
J1412 | Psychomotricien
K1103 | Conseiller en développement personnel
K1105 | Art thérapeute
K1108 | Intervenant en pratique de soins non conventionnelle
K1109 | Graphothérapeute
K1201 | Assistant de service social
K1207 | Éducateur spécialisé
K1208 | Moniteur éducateur
K1212 | Ministre du culte
K1214 | Conseiller en génétique
K1220 | Médiateur en santé
K1223 | Technicien de l'administration pénitentiaire
K1227 | Directeur technique de l'administration pénitentiaire
K1228 | Ecrivain public
K1303 | Auxiliaire petite enfance
K1305 | Technicien d'Intervention Sociale et Familiale (TISF)
K1309 | Assistant familial
K1310 | Assistant maternel
K1312 | Accueillant familial thérapeutique auprès d'adultes
K1401 | Directeur d'administration centrale
K1404 | Chargé de mission développement territorial
K1406 | Secrétaire de mairie
K1407 | Directeur d'établissement médicosocial
K1409 | Chef de service socioéducatif
K1416 | Directeur des services pénitentiaires d'insertion et de probation (DSPIP)
K1420 | Directeur d'établissement pénitentiaire
K1423 | Directeur de cabinet
```

## Lot 12 sur 17 (40 métiers : K1425 à K1745)

```
K1425 | Délégué de l'Assurance Maladie (DAM)
K1428 | Conseiller de cabinet ministériel
K1429 | Administrateur de l'Etat
K1502 | Inspecteur du travail
K1504 | Percepteur des impôts et du Trésor Public
K1510 | Contrôleur du Trésor public
K1514 | Inspecteur de l'action sanitaire et sociale
K1515 | Inspecteur du permis de conduire et de la sécurité routière
K1601 | Documentaliste
K1611 | Iconographe
K1701 | Combattant en milieu terrestre
K1702 | Responsable de sécurité civile et de secours
K1703 | Responsable de l'emploi des forces armées
K1705 | Secouriste
K1706 | Gendarme
K1707 | Policier municipal
K1708 | Gardien de la paix
K1710 | Pilote de drones aériens militaires
K1711 | Surveillant pénitentiaire
K1713 | Pilote de chasse
K1715 | Pilote d'hélicoptère des forces armées
K1717 | Opérateur de surveillance aérienne militaire
K1718 | Chargé de navigation maritime sur navire militaire
K1719 | Chef de police municipale
K1722 | Plongeur démineur militaire dans les fonds marins
K1723 | Opérateur d'exploitation et de maintenance pétrolières de l'Armée
K1725 | Responsable des opérations militaires en milieu maritime
K1726 | Pisteur secouriste
K1727 | Chargé du guidage d'aéronef militaire
K1730 | Spécialiste de la protection des forces, installations ou matériels sensibles de l'Etat
K1731 | Responsable des opérations militaires en milieu aéroterrestre
K1732 | Spécialiste des systèmes de communication opérationnels
K1733 | Combattant des forces spéciales militaires
K1736 | Spécialiste de l'aide au déploiement des forces combattantes
K1737 | Combattant en milieu maritime
K1739 | Opérateur en navigation maritime sur navire militaire
K1741 | Maître de pont sur navire militaire
K1742 | Contrôleur des espaces maritimes
K1744 | Chef de centre d'incendie et de secours
K1745 | Pompier
```

## Lot 13 sur 17 (40 métiers : K1746 à K2514)

```
K1746 | Receveur placier
K1747 | Equipier sécurité civile
K1748 | Garde républicain
K1801 | Conseiller en insertion professionnelle
K1803 | Animateur de développement régional
K1810 | Agent de développement d'habitat social
K1816 | Manager de commerce et territoire
K1817 | Coordinateur de projet de solidarité
K1901 | Notaire
K1909 | Greffier
K1912 | Formaliste
K2110 | Moniteur auto-école
K2112 | Conseiller d'orientation
K2116 | Responsable d'unité d'enseignement de la conduite de véhicule
K2118 | Directeur d'école primaire
K2124 | Formateur conduite d'engins motorisés et de levage
K2128 | Formateur aux métiers de l'éducation et de la sécurité routière
K2138 | Animateur de stages permis à points
K2141 | Formateur conduite d'engins de travaux publics
K2202 | Laveur de vitres
K2204 | Agent d'entretien
K2301 | Agent d'exploitation des réseaux d'assainissement
K2304 | Agent de tri des déchets
K2310 | Ambassadeur du tri
K2319 | Technicien hygiéniste
K2322 | Technicien de traitement des eaux
K2325 | Technicien d'exploitation méthanisation
K2326 | Agent de mise en fourrière animale
K2501 | Gardien d'immeuble
K2502 | Responsable sécurité de site
K2504 | Agent de sécurité événementielle
K2505 | Enquêteur privé
K2506 | Convoyeur de fonds
K2507 | Agent d'exploitation et de sûreté aéroportuaire
K2508 | Agent de protection rapprochée
K2509 | Opérateur en télésurveillance
K2510 | Agent cynophile de sécurité
K2511 | Agent de sûreté ferroviaire
K2512 | Agent de sûreté portuaire
K2514 | Responsable de sûreté et de sécurité portuaire
```

## Lot 14 sur 17 (40 métiers : K2515 à M1435)

```
K2515 | Agent cynotechnique en détection des explosifs
K2602 | Conseiller funéraire
K2603 | Thanatopracteur
K2604 | Agent de crématorium
K2605 | Maître de cérémonie funéraire
K2606 | Directeur d'entreprise funéraire
L1201 | Danseur
L1203 | Comédien
L1204 | Artiste de cirque
L1208 | Mascotte-personnage
L1213 | Auteur-compositeur-interprète
L1214 | Chef d'orchestre
L1301 | Metteur en scène
L1303 | Agent de talent
L1304 | Assistant réalisateur
L1308 | Directeur de production audiovisuelle et cinéma
L1309 | Coordinateur d'intimité
L1310 | Directeur de salle de spectacles
L1313 | Programmateur salle de cinéma
L1315 | Documentariste
L1316 | Conducteur d'antenne
L1317 | Directeur de casting
L1318 | Scripte de fiction
L1401 | Sportif professionnel
L1402 | Arbitre professionnel discipline sportive
L1504 | Eclairagiste
L1507 | Monteur vidéo
L1509 | Régisseur de production
L1510 | Animateur 2D 3D - films d'animation
L1519 | Technicien vidéo
L1523 | Artificier spectacle
M1102 | Directeur des achats
M1210 | Commissaire aux comptes
M1304 | Directeur d'unité de services au public
M1402 | Responsable en organisation en entreprise
M1404 | Responsable d'enquêtes terrain
M1417 | Intervenant en Prévention des Risques Professionnels - IPRP
M1423 | Chief Data Officer
M1433 | Géographe
M1435 | Chargé de tracking vérificateur
```

## Lot 15 sur 17 (40 métiers : M1502 à N1111)

```
M1502 | Chargé de recrutement
M1508 | Conseiller en gestion de carrière
M1602 | Secrétaire administratif de collectivité territoriale
M1604 | Assistant de direction
M1606 | Opérateur de saisie
M1607 | Assistant administratif
M1608 | Secrétaire comptable
M1610 | Intendant du sport
M1613 | Télésecrétaire
M1616 | Auxiliaire de gestion des écoles de conduite
M1701 | Responsable de l'administration des ventes
M1703 | Chef de produit
M1704 | Responsable service clients
M1705 | Responsable marketing
M1707 | Responsable du développement commercial
M1722 | Chargé de cession de droits, synchro
M1803 | Directeur des systèmes d'information (DSI)
M1807 | Spécialiste outils, systèmes d'exploitation, réseaux et télécoms
M1812 | Responsable de la Sécurité des Systèmes d'Information (RSSI)
M1819 | Technicien en cybersécurité
M1820 | Expert méthodes et qualité informatique
M1822 | Spécialiste Jumeau Numérique
M1840 | Directeur de projets des territoires connectés
M1854 | Chef de projet réseau fixe et mobile
M1856 | Expert en cybersécurité
M1857 | Urbaniste Datacenter
M1866 | Pentesteur
M1867 | Responsable des systèmes d'information (SI)
M1870 | Directeur de projet en informatique
M1872 | Consultant décisionnel - Business Intelligence
M1875 | Coordinateur Maitrise d'Ouvrage Système d'Information (MOA SI)
M1876 | Technicien Cloud
M1878 | Responsable de la production informatique
N1101 | Cariste
N1102 | Déménageur
N1103 | Préparateur de commandes / Magasinier
N1105 | Manutentionnaire / Agent de quai
N1107 | Chef d'équipe en déménagement
N1108 | Conducteur de grue mobile
N1111 | Conducteur de pont roulant
```

## Lot 16 sur 17 (40 métiers : N1112 à N4105)

```
N1112 | Chef d'équipe logistique
N1114 | Conducteur d'engins lourds de manutention
N1201 | Affréteur
N1202 | Agent de transit
N1203 | Déclarant en douane
N1205 | Responsable de service transit
N1207 | Chef de groupe affrètement
N1208 | Opérateur de traitement de valeurs
N1209 | Technicien logistique
N1302 | Responsable entrepôt logistique
N1303 | Approvisionneur logistique
N2101 | Personnel Navigant Commercial (PNC)
N2203 | Agent d'opérations sur piste
N2206 | Pilote de drone
N2208 | Contrôleur de la circulation et de la défense aérienne
N2211 | Planificateur régulateur vol
N2215 | Coordonnateur zone avion
N3101 | Officier de port
N3102 | Matelot machine de la marine marchande
N3103 | Matelot de la navigation fluviale
N3106 | Officier de la marine marchande
N3107 | Pilote fluvial
N3108 | Skipper professionnel
N3109 | Matelot pont de la marine marchande
N3110 | Capitaine d'armement
N3112 | Commissaire de bord
N3113 | Steward yachting polyvalent
N3114 | Lamaneur
N3115 | Capitaine de yacht
N3117 | Marin de la plaisance professionnelle
N3118 | Bosco de la navigation maritime
N3204 | Chef d'équipe de manutention portuaire
N3207 | Agent de port de plaisance
N3208 | Grutier Pontier portuaire
N3209 | Responsable de structure de manutention portuaire
N3211 | Directeur de port
N4101 | Chauffeur routier
N4102 | Conducteur de transport de particuliers
N4104 | Livreur à vélo
N4105 | Chauffeur-livreur
```

## Lot 17 sur 17 (26 métiers : N4106 à N4406)

```
N4106 | Responsable de douane
N4108 | Conducteur accompagnateur de personnes à mobilité réduite
N4109 | Conducteur d'autocar ligne régulière
N4112 | Conducteur VTC
N4114 | Conducteur livreur avitailleur en carburant
N4115 | Conducteur de véhicules Super Lourds
N4116 | Conducteur de transport routier de marchandises dangereuses
N4117 | Conducteur d'attelage
N4124 | Conducteur de taxi moto
N4125 | Conducteur de transport routier d'animaux vivants
N4126 | Conducteur de transport routier en convoi exceptionnel
N4127 | Conducteur de car tourisme
N4128 | Conducteur de navettes moins de 10 places
N4129 | Conducteur de corbillard
N4130 | Conducteur de voiture radar à conduite externalisée
N4131 | Conducteur de taxi
N4134 | Conducteur de véhicule de protection de convoi exceptionnel
N4135 | Conducteur de véhicule de guidage
N4201 | Responsable d'agence transport routier de marchandises
N4204 | Agent d'exploitation transport routier de personnes
N4301 | Conducteur de train
N4302 | Agent de contrôle du réseau ferré
N4306 | Agent d'accompagnement des trains
N4401 | Aiguilleur du rail
N4403 | Opérateur ferroviaire
N4406 | Caténairiste
```

## Ensuite (Claude)
- Relire chaque ligne : seules les lignes « confirmé par source officielle » avec une URL officielle sont retenues.
- Les ranger dans une table de niveaux relue par Denis (`scripts/importRome/niveauxAcces.js`, comme la table des titres déjà relevée sur France Compétences le 13/11/2026), puis régénérer les données.
- Un métier « variable » ou « non vérifiable » reste « non précisé ».
