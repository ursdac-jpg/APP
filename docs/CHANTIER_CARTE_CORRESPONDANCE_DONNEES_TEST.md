# Carte de correspondance — Jeu de données test et comparaison de représentations

**Statut** : phase Maquettes CLOSE et validée (2026-08-19). Contient le jeu de données test, la comparaison sur papier (section 6), puis l'itération réelle en maquette HTML (section 8) qui a mené à la décision de conception V1 ci-dessous.

## 0. Décision de conception V1 — figée

Représentation retenue pour la Carte de correspondance, validée par Denis après plusieurs itérations de maquette réelle :

- **Ordre naturel des attentes du poste** (jamais un regroupement par état — voir section 8 pour pourquoi ce choix l'emporte sur le regroupement, pourtant plus scannable sur le papier).
- **Repère visuel sobre** : une marque pleine ou creuse signalant uniquement présence/absence d'au moins une preuve — jamais une gradation, jamais un compte de points.
- **Étiquette courte à 3 états** : « Plusieurs éléments », « Un élément », « Aucun élément ».
- **Aucune note, aucun score, aucun pourcentage**, conforme aux principes 4 et 5 de la doctrine.
- **Les preuves restent l'élément central de la lecture** — l'étiquette sert seulement à balayer la page, jamais à remplacer la lecture des preuves elles-mêmes (les formulations en phrase complète, testées puis écartées, faisaient justement cette erreur en répétant ce que les preuves montrent déjà).

Maquette de référence (HTML, onglet C) : demandée à Claude pendant la session du 2026-08-19, non committée dans le dépôt (outil de comparaison de travail, pas un livrable). À reconstruire fidèlement à l'implémentation.

**Origine du cas** : poste de Conseiller en insertion professionnelle (CIP), choisi par Denis pour sa richesse — attentes techniques et relationnelles mêlées, candidat aux expériences transférables plutôt qu'un parcours qui correspond déjà parfaitement.

---

## 1. Le cas

**Poste visé** : Conseiller en insertion professionnelle (CIP).

**Profil du candidat** : animation socioculturelle (3 ans), accueil du public en structure publique (2 ans), bénévolat en épicerie sociale (1 an, en parallèle), restauration (2 ans, expérience antérieure), formation au Titre Professionnel CIP en cours (alternance, dernière année).

## 2. Les 14 attentes du poste

1. Accueillir un public en difficulté avec écoute et bienveillance
2. Conduire des entretiens individuels de diagnostic
3. Identifier les freins à l'emploi (sociaux, techniques, psychologiques)
4. Construire un plan d'action avec la personne accompagnée
5. Animer des ateliers collectifs
6. Travailler en réseau avec les partenaires de l'emploi
7. Rédiger des comptes rendus et bilans
8. Utiliser des outils numériques et logiciels métier
9. Assurer un suivi administratif rigoureux
10. Respecter la confidentialité
11. Gérer plusieurs dossiers simultanément
12. Adapter sa communication à des publics variés
13. Coopérer avec des partenaires institutionnels et associatifs
14. Faire preuve d'autonomie dans l'organisation de son activité

## 3. Les observations (preuves), telles qu'un diagnostic les formulerait

*(numérotées O1 à O27, regroupées par expérience source — ce regroupement n'existe pas dans le contrat, il aide seulement la lecture ici)*

**Animation socioculturelle** — O1 animation hebdomadaire d'ateliers pour groupes de 8 à 15 personnes pendant 3 ans · O2 adaptation du contenu selon l'âge/le profil des participants · O3 gestion du planning des salles et du matériel · O4 recueil des besoins des habitants lors de permanences d'accueil · O5 rédaction de bilans d'activité trimestriels · O6 lien avec les éducateurs de rue et les services sociaux sur des situations individuelles.

**Accueil du public (structure publique)** — O7 accueil et orientation d'environ 40 usagers par jour · O8 renseignement sur les démarches administratives · O9 usage quotidien d'un logiciel métier de gestion des rendez-vous et des dossiers · O10 gestion des appels et prise de rendez-vous · O11 gestion de situations de tension avec des usagers en difficulté.

**Bénévolat, épicerie sociale** — O12 accompagnement individuel de bénéficiaires sur l'analyse de leur budget et leurs démarches · O13 participation aux réunions mensuelles de coordination avec le réseau de partenaires (CCAS, CAF, associations locales) · O14 gestion des inscriptions et du suivi de plus de 60 familles · O15 formation de deux nouveaux bénévoles à un logiciel de gestion des stocks et des inscriptions.

**Restauration** — O16 gestion simultanée de 6 à 8 tables en horaires de forte affluence · O17 gestion des réclamations clients avec solutions immédiates · O18 autonomie sur la clôture de caisse en fin de service · O19 formation des nouveaux serveurs saisonniers.

**Formation CIP en cours** — O20 formation en cours au Titre Professionnel CIP (dernière année, alternance) · O21 conduite de 5 entretiens individuels de diagnostic en stage, sous supervision · O22 co-animation d'un atelier collectif de techniques de recherche d'emploi · O23 construction de deux plans d'action individualisés en étude de cas, avec l'appui d'un formateur.

**Rubrique « Compétences » du CV, sans mission rattachée** — O24 « Maîtrise Word, Excel et les outils de visioconférence » (compétence déclarée, aucune réalisation concrète associée) · O27 certification PIX obtenue en 2024.

**Sans rapport avec les attentes du poste (réalistes, presque tout CV en contient)** — O25 usage d'un tableur pour suivre le budget mensuel de l'association (bénévolat) · O26 titulaire du permis B, véhiculé(e).

## 4. Les relations attente → observations, avec état de couverture

| # | Attente | Observations liées | État |
|---|---|---|---|
| 1 | Accueillir un public | O4, O7, O12 | **Richement étayée** |
| 2 | Conduire des entretiens de diagnostic | O21 *(en stage, sous supervision)* | **Fragile** |
| 3 | Identifier les freins à l'emploi | O12, O21 | Étayée |
| 4 | Construire un plan d'action | O23 *(étude de cas, avec appui d'un formateur)* | **Fragile** |
| 5 | Animer des ateliers collectifs | O1, O2, O22 | **Richement étayée** |
| 6 | Travailler en réseau | O6, O13 | Étayée |
| 7 | Rédiger des comptes rendus | O5 | **Fragile** |
| 8 | Utiliser des outils numériques | O9, O15, O24 *(déclarative)*, O27 | **Richement étayée** *(avec réserve, voir section 5)* |
| 9 | Assurer un suivi administratif | O10, O14 | Étayée |
| 10 | Respecter la confidentialité | — | **Non étayée** |
| 11 | Gérer plusieurs dossiers | O14, O16 *(transférable, restauration)* | Étayée |
| 12 | Adapter sa communication | O2, O8, O17 *(transférable, restauration)* | **Richement étayée** |
| 13 | Coopérer avec des partenaires | O6, O13 *(mêmes observations qu'en 6)* | Étayée |
| 14 | Faire preuve d'autonomie | O3, O18, O19 | **Richement étayée** |

**Non reliées à aucune attente** : O11, O20, O25, O26.

**Répartition** : 5 richement étayées, 5 étayées, 3 fragiles, 1 non étayée — la variété demandée est là.

## 5. Ce que la seule construction du jeu de données révèle

Avant même de comparer des représentations, construire ce jeu à la main a fait apparaître trois cas limites réels — exactement l'objectif de choisir un cas riche plutôt que facile.

**O24 (compétence déclarée sans mission rattachée).** « Maîtrise Word, Excel... » n'est pas une preuve du même niveau qu'une réalisation concrète (une mission, un chiffre) — c'est une auto-déclaration. Le contrat de données actuel ne fait pas la différence (`Observation` reste une observation, quelle que soit sa force). **Ce n'est pas un manque du contrat** : `Observation` existe déjà en deux origines (`factuelle`/`argumentee`), et la prudence sur ce type de contenu relève du prompt (bilan-v1.md demande déjà à l'IA de rester prudente et de ne rien affirmer au-delà de ce qui est écrit) — pas d'un champ de données supplémentaire à ajouter maintenant.

**O21-O23 (preuves obtenues en formation/sous supervision, pas en situation professionnelle autonome).** Le contrat ne distingue pas la provenance d'une observation au-delà de factuelle/argumentée. Contrairement à la compétence (retirée du modèle car instable selon le contexte), cette distinction serait, elle, un fait stable — une expérience est en formation ou ne l'est pas, ce n'est pas une interprétation. **Point de vigilance noté, pas une décision** : à ne considérer que si l'usage réel en révèle le besoin, même discipline que le reste de ce chantier.

**O11, O20, O25, O26 (observations orphelines, reliées à aucune attente).** Le contrat n'a besoin de rien de spécial ici — elles existent simplement dans le diagnostic sans être référencées. C'est à la représentation de décider si elle les ignore silencieusement (cohérent avec la doctrine : « jamais un inventaire de preuves isolées », ce module ne montre que ce qui répond à une attente) — recommandation : les ignorer, ne jamais les afficher comme un « reste » ou un manque à combler.

## 6. Comparaison de représentations, sur le papier uniquement

Cinq formes testées mentalement sur le jeu de données complet (14 attentes, 27 observations) — pas sur 3 exemples jouets, où presque toutes se ressembleraient.

**A — Tableau (attente / preuves).** Une ligne par attente, preuves listées à droite. Lisible attente par attente ; l'état global n'apparaît qu'en lisant chaque ligne. Gère bien les preuves partagées (répétées sans souci d'une ligne à l'autre). Reste correct à 14 lignes, commence à devenir dense sur mobile.

**B — Liste groupée par état de couverture** (trois blocs : richement étayées / fragiles / non étayées, chaque attente avec ses preuves en dessous). L'état global saute aux yeux sans lecture ligne par ligne — la personne peut aller droit au bloc « non étayées » si elle le souhaite. Gère les preuves partagées comme A. Reste lisible à l'échelle réelle : le tri fait le travail que l'œil devrait faire seul dans un tableau plat.

**C — Graphe relationnel (nœuds attentes + nœuds preuves, arêtes).** Séduisant sur le papier pour 3-4 attentes ; à 14 attentes et 27 preuves (dont plusieurs partagées), le nombre de nœuds et d'arêtes rend la lecture confuse sans un algorithme de mise en page élaboré. Aucun moyen simple d'y indiquer l'état de couverture sans un code couleur qui recrée une lecture en score. Exige une compétence de lecture de schéma non universelle — à l'opposé de la simplicité déjà recherchée ailleurs dans ERIP (Repères).

**D — Arbre hiérarchique** (poste → attentes → preuves). Problème structurel, pas seulement de densité : une preuve partagée entre deux attentes (ex. O6/O13, O2, O14/O16) n'a qu'un seul parent possible dans un arbre — elle doit soit être dupliquée sous les deux branches (visuellement trompeur, laisse croire à deux preuves distinctes), soit rompre la logique de l'arbre. Écarté pour cette raison, indépendamment du volume.

**E — Colonnes juxtaposées reliées par des traits** (attentes à gauche, preuves à droite, lignes de connexion). Même problème d'enchevêtrement que le graphe dès que plusieurs preuves sont partagées et que certaines attentes en ont 3 — les traits se croisent au point de devenir illisibles à cette échelle.

## 7. Conclusion sur papier (avant maquette réelle)

**B (liste groupée par état de couverture) ressort clairement en tête** sur le papier : c'est la seule forme qui reste lisible à l'échelle réelle (pas seulement sur un exemple jouet), qui rend l'état global visible sans calcul mental, et qui ne crée aucune tentation de code couleur assimilable à un score. A reste un second choix défendable, plus proche d'un tableau classique.

C, D et E — les formes les plus proches de ce que le nom de travail « carte » suggérait spontanément — se révèlent les moins adaptées des cinq à l'échelle d'un vrai diagnostic. C'est une confirmation a posteriori de la prudence prise dès la doctrine sur ce nom : la représentation la plus intuitive à imaginer n'était pas la plus compréhensible en pratique.

## 8. Ce que la maquette HTML réelle a corrigé

L'analyse sur papier s'est révélée incomplète sur un point : elle comparait des *structures* (regroupée vs séquentielle) mais pas ce qu'elles répondent comme question. Une fois testées en HTML sur le jeu de données complet, Denis a identifié que A et B ne répondent pas à la même question : A répond à « où ma candidature est-elle déjà solide, où sont mes angles morts ? » (question du candidat sur lui-même), B répond à « comment un recruteur examine-t-il les attentes du poste ? » (le raisonnement que la doctrine cherche à rendre visible) — et c'est B qui est fidèle à l'objectif du module, malgré sa scannabilité plus faible sur papier.

**Direction finale retenue, après plusieurs itérations de maquette** : l'ordre naturel des attentes du poste (comme B), avec un repère visuel sobre en tête de chaque carte (une marque pleine ou creuse — présence/absence de preuve, jamais un compte gradé) et une étiquette courte à côté (« Plusieurs éléments » / « Un élément » / « Aucun élément »). Écarté en cours de route : les phrases complètes façon « Plusieurs éléments de votre candidature répondent à cette attente » (alourdissent la lecture, répètent une information déjà portée par les preuves listées juste en dessous) et le repère seul sans aucune étiquette (fait perdre la scannabilité qui justifiait le repère). Les 4 états initiaux (richement étayée / étayée / fragile / non étayée) ont aussi été simplifiés à 3 (plusieurs / un / aucun) — la distinction « deux » vs « plusieurs » n'apportait rien à la lecture.

**Enseignement méthodologique** : l'exercice sur papier (section 6) a bien fait son travail en éliminant C, D et E — les formes structurellement les moins adaptées — avant tout code. Mais il n'a pas pu trancher entre A et B, parce que la vraie différence entre elles n'est pas visible sur une comparaison de structure : elle n'apparaît qu'en lisant réellement le contenu produit. La maquette HTML reste donc nécessaire même après une comparaison papier rigoureuse, pas seulement pour peaufiner visuellement une direction déjà actée.
