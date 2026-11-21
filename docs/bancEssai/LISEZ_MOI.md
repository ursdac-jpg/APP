# Banc d'essai et jury du moteur de « Explorer les métiers » (consigne 491, 19/11/2026)

## À quoi ça sert

Juger chaque changement du moteur (étiquettes des fiches, poids, seuils) par des chiffres et par l'avis de professionnels, au lieu de régler à l'aveugle.

## Les deux outils

| Outil | Commande | Ce qu'il fait |
|---|---|---|
| Banc d'essai | `node scripts/bancEssaiMoteur.js` (environ 17 secondes) | Mesure les trois chemins et affiche des chiffres clés ; `--ecrire <nom>` range la mesure, `--comparer <nom>` affiche les écarts avec une mesure rangée |
| Feuille du jury | `node scripts/genererFeuilleJury.js` puis ouvrir `docs/bancEssai/feuille_jury.html` (via le serveur de développement : `http://localhost:8123/docs/bancEssai/feuille_jury.html`) | Page à cocher « Pertinent / Acceptable / Absurde » sur 27 profils et 135 métiers ; bouton « Copier mes notes » |

Le test `tests/bancEssaiMoteur.test.js` ne rejoue que les mesures rapides (environ 8 secondes) et protège trois choses : cohérence de secteur des profils types, stabilité, lettres du chemin 3.

## Mesures rangées dans ce dossier

- `mesure_avant488.json` : le moteur avant la correction des pourcentages (commit `065d0129`).
- `mesure_depart.json` : le moteur après la consigne 488 (commit `f7da2fd3`), point de départ des prochaines corrections.

| Chiffre clé | Avant 488 | Départ (après 488) | Lecture |
|---|---|---|---|
| Meilleur pourcentage avec un seul choix | 45 | 25 | Voulu (consigne 488) |
| Part des métiers d'exemple du catalogue dans les 10 premiers (un choix) | 0,159 | 0,159 | Inchangé : le défaut vient des étiquettes |
| Idem dans les 50 premiers | 0,395 | 0,402 | Quasi inchangé |
| Cohérence de secteur des 5 premiers (profils types) | 0,871 | 0,843 | Léger recul du repère ; voir la note |
| Cohérence de secteur des 10 premiers | 0,864 | 0,793 | Recul du repère ; voir la note |
| Les 10 premiers restent les mêmes si l'on ajoute un choix général | 0,75 | 0,836 | Mieux |
| Retrouver un métier à partir de trois choix tirés de sa fiche (10 premiers) | 0,883 | 0,9 | Mieux |
| Égalités de pourcentage en tête, un seul choix (médiane) | 10 | 159 | Voulu : le pourcentage ne ment plus, mais beaucoup de métiers se valent. C'est le départage (contenu de la fiche) qui les ordonne |
| Égalités en tête, chemin 3 (médiane) | 52,5 | 35 | Mieux |
| Nombre de métiers proposés (profils types) | 108 à 1 368 | 34 à 1 002 | Listes plus courtes : voulu |

**Note sur la cohérence de secteur.** C'est un repère grossier : il compte « dans un secteur attendu » avec une liste courte de secteurs que j'ai écrite. Les dix premiers du profil « Bureau et gestion » sont par exemple « Assistant commercial » (Commerce) et « Agent administratif banque ou assurance » (Banque), jugés cohérents à l'œil mais non comptés. Le repère baisse sans que la liste soit moins bonne ; c'est précisément pour trancher que le jury existe. Ne pas retoucher les secteurs attendus pour « faire remonter » le chiffre.

## Comment s'en servir à chaque correction

1. Avant de toucher au moteur ou aux fiches : `node scripts/bancEssaiMoteur.js --ecrire avant_<sujet>`.
2. Faire la correction.
3. `node scripts/bancEssaiMoteur.js --comparer avant_<sujet>` : lire les écarts, chaque ligne dit « mieux » ou « moins bien ».
4. Régénérer la feuille du jury (`node scripts/genererFeuilleJury.js`) : les notes déjà données se retrouvent par le nom du métier, seuls les métiers nouveaux sont à noter.
5. Un recul du banc ou une série de « Absurde » du jury bloque la correction ; on regarde pourquoi avant de continuer.

## Limites à garder en tête

- Les métiers d'exemple du catalogue sont écrits avec les mêmes étiquettes que le moteur : le banc mesure la cohérence interne, pas la vérité. D'où le jury.
- Les secteurs attendus des profils types sont un jugement de départ, à corriger par Denis.
- Aucune mesure de l'effet sur les parcours réels des personnes.

## Constats faits pendant le jury (19/11/2026)

- **P27 (soins, niveau CAP)** : le profil de la feuille était mal construit. « Réaliser des soins paramédicaux » est, dans le ROME, une compétence de médecins et de biologistes (aucun aide-soignant ne la porte) ; « Prothésiste ongulaire » ressortait en tête parce que sa fiche ROME la contient et que son niveau (CAP) convient. Le profil a été remplacé par « Donner des soins médicaux » (celle de l'aide-soignant). Constat durable : un niveau « satisfait » donne un avantage au classement, même sans rapport avec la compétence ; et « Aide-soignant » est au niveau 4 dans le ROME, donc absent d'une liste pour un CAP (à dire clairement à l'écran).
- **P26 (conduire sur la route + esprit d'équipe + transport)** : les cinq premiers métiers sont tous à 36 %, alors que les trois choix sont retrouvés (le chemin 2 afficherait 55 % pour trois choix sur trois). Cause : la quantité est pénalisée deux fois dans « Par un métier », une fois par le plafond selon le nombre de choix et une fois par le « rappel » (part de ce que le métier demande qui est retrouvée : avec une compétence sur vingt, le rappel est faible). Correction mesurée, qui change le calcul validé sur maquette (consignes 448 à 454) : ne garder que la part des choix retrouvés pour le pourcentage et classer à égalité selon le rappel puis le cœur de métier. Effet mesuré : P26 passe à 55 % pour 92 métiers, aucune perte sur le test de retrouvaille (10 premiers : 1 contre 1), « Autonomie » seule passe de 14 à 25 %. **Appliquée le 19/11/2026 sur décision de Denis (consigne 492).**

## Résultats du jury de Denis (19/11/2026, `jury_2026-11-19_denis.json`)

133 métiers notés sur 27 profils : **57 pertinents (43 %), 67 acceptables (50 %), 9 absurdes (7 %)**.

| Série | Pertinent | Acceptable | Absurde | Pertinent + acceptable |
|---|---|---|---|---|
| Chemin 2, 14 profils types | 37 | 30 | 3 | 96 % |
| Chemin 2, 3 profils difficiles | 0 | 11 | 4 | 73 % |
| Chemin 3, 6 codes | 12 | 18 | 0 | 100 % |
| Chemin 1, 4 combinaisons | 8 | 8 | 2 | 89 % |

Les neuf « Absurde » : Matelot machine de la marine marchande (mécanique), Nettoyeur en cuir et peausserie (nettoyage), Spécialiste en radioprotection (sécurité), Maçon du paysage et Ornithologue (profil contradictoire bureau et extérieur), Technicien en ostéologie-moulage et Taxidermiste (animaux, bureau, usine), Prothésiste ongulaire et Intervenant en soins non conventionnelle (ancien profil P27, remplacé). Métier évident manquant signalé : « Éleveur » pour le profil animaux et nature.

Lectures : (1) sur les profils cohérents, le moteur tient : 96 % de pertinent ou acceptable, aucun métier à « Absurde » dans le chemin 3 ; (2) les absurdes viennent soit de profils contradictoires, soit d'étiquettes trop générales (« Matelot machine » retrouve 5 choix sur 5 : machines, véhicules, outils, réparer, utiliser des machines, sans que rien ne dise « garage »), donc de la correction des étiquettes et de la fiabilité affichée ; (3) « Éleveur » manque parce que la règle des 40 % des choix retrouvés écarte un métier qui ne retrouve qu'un choix sur trois (animaux, sans plantes ni espaces verts) ; c'est le prix du seuil, à discuter ; (4) les profils difficiles n'ont aucun « Pertinent » : normal, mais 4 absurdes sur 15 justifient le message de fiabilité et, après validation de Denis, la détection des choix qui vont dans plusieurs directions.

## Correction des étiquettes à la source (consigne 494, 19/11/2026)

**Ce qui a été fait** : resserrement des règles de `scripts/importRome/tablesRome.js` et `genererMetiersRome.js`, essai à blanc dans une copie hors dépôt, puis régénération de `data/metiersRome.js` seul (les autres fichiers générés n'ont pas été touchés). Les fiches écrites à la main sont intactes ; leur « deuxième signature » (déduite du ROME) est, elle, régénérée. Mesures : `mesure_avant_etiquettes.json` (avant) et `mesure_apres_etiquettes.json` (après) ; liste complète des 1 631 fiches modifiées : `fiches_modifiees_etiquettes_2026-11-19.json` (avant et après, par liste).

**Les quatre règles**

1. **Mots entiers seulement** pour reconnaître animaux et végétaux : « traite » ne s'entend plus dans « traitement » (un viticulteur n'est plus classé en élevage), ni « chat » dans « achats », « lait » dans « laiton », « plante » dans « implantation », « arbre » dans « arbre à cames ».
2. **Objectifs trop généraux** : un objectif du ROME présent dans plus de 20 % des codes (« Protéger l'environnement » 619 codes, « Analyser, prévenir les risques » 984, « Agir face à l'imprévu » 685...) ne donne plus qu'un demi-point à une action déjà précisée par ailleurs (jamais une action à lui seul, sauf s'il n'y a rien d'autre).
3. **Matières très générales** (machines, outils, documents, produits, matériaux, véhicules, ordinateur) : au moins deux savoirs du ROME au lieu d'un.
4. **Animaux sans soins** : taxidermiste, ostéologie, ornithologue et naturaliste ne reçoivent plus l'action « Soigner ».

Les seuils 20 % et deux savoirs ont été choisis en balayant plusieurs valeurs et en mesurant l'accord avec les 134 fiches écrites à la main (le meilleur des douze essais pour les actions, le meilleur des quatre pour les matières). Essais sans effet, non retenus : appliquer la même règle aux macro-compétences ; retirer « Port d'arme » des lieux (cela retire « Sécurité » à l'officier de police et au policier municipal).

**Accord avec les 134 fiches écrites à la main** (précision, rappel, F1) :

| Liste | Avant | Après |
|---|---|---|
| Actions | 0,317 / 0,474 / 0,380 | 0,383 / 0,444 / 0,411 |
| Avec qui, avec quoi | 0,354 / 0,476 / 0,406 | 0,394 / 0,485 / 0,435 |
| Lieux | 0,609 / 0,699 / 0,651 | inchangé |

Taille moyenne des listes des 1 790 fiches générées : actions 4,08 devient 2,79 (fiches à la main : 2,91) ; avec qui, avec quoi 2,93 devient 2,59. 29 fiches n'ont plus de matière (elles gardent leurs publics ou lieux).

**Banc d'essai** : mieux sur les égalités en tête avec un seul choix (159 devient 139), la cohérence de secteur (5 premiers 0,843 devient 0,857 ; 10 premiers 0,793 devient 0,807), la stabilité quand on ajoute un choix général (0,836 devient 0,879). **Moins bien** sur deux repères circulaires (métiers d'exemple du catalogue dans les 10 premiers avec un seul choix : 0,159 devient 0,122 ; retrouver un métier à partir de trois choix de sa fiche : 0,9 devient 0,85, soit un cas sur vingt).

**Jury de Denis rejoué sur les 27 profils** (130 métiers, hors P27) : avant 57 pertinents, 66 acceptables, 7 absurdes ; après, sur les 115 déjà notés, 52 pertinents, 59 acceptables, 4 absurdes, et **15 métiers nouveaux restent à noter** (feuille régénérée : les anciennes notes se retrouvent par le nom). Trois absurdes disparaissent (radioprotection des Armées, Maçon du paysage, Ornithologue). **Restent** : Matelot machine, Nettoyeur en cuir, Taxidermiste et Technicien en ostéologie-moulage (profil contradictoire animaux, bureau, usine : ils retrouvent bien deux des trois choix). **Pertes** : cinq métiers jugés pertinents sortent des cinq premiers (AESH rang 27, Agent de service hospitalier rang 19, Agent d'entretien rang 30, Plaquiste et Mécanicien automobile rang 6). Cause pour l'AESH : la deuxième signature déduite du ROME a perdu l'action « Former » (objectif général « Transmettre des bonnes pratiques », 556 codes), donc la fiche à la main ne retrouve plus que 3 des 5 choix. C'est le prix du resserrement ; à rejuger quand Denis aura noté les 15 nouveaux.

**Effet de bord utile** : la régénération a fait revenir la fiche « Installateur mainteneur en systèmes solaires, thermiques et photovoltaïques » (F1610), absente depuis que le code de la fiche « Couvreur » avait été corrigé de F1610 à F1619 sans régénérer. La base compte 1 920 métiers (tests mis à jour).

**Non régénérés exprès** : `data/rome/fiche_*.js`, `conditionsRome.js`, `competencesRome.js` (leur régénération de contrôle diffère légèrement du dépôt pour l'ordre des compétences d'une centaine de fiches : sans lien avec cette consigne, à ne pas mélanger).

### Verdict du jury après la correction des étiquettes (notes de Denis, 19/11/2026, `jury_2026-11-19_denis_apres_etiquettes.json`)

Les 15 métiers nouveaux : **6 pertinents, 9 acceptables, 0 absurde**. Sur les 130 métiers des profils P01 à P26 : avant 57 pertinents, 66 acceptables, 7 absurdes ; après 58 pertinents, 68 acceptables, **4 absurdes** (pertinent ou acceptable : 94,6 % devient 96,9 %). Les cinq métiers sortis des cinq premiers sont compensés. **Décision : les règles sont gardées telles quelles** (seuil 20 % des objectifs généraux, deux savoirs pour les matières générales). Les quatre absurdes restants : Matelot machine, Nettoyeur en cuir, Taxidermiste, Technicien en ostéologie-moulage. Sur le profil P27 reconstruit (soins, niveau CAP) : 1 pertinent, 3 acceptables, 1 absurde (Accueillant familial thérapeutique). Le métier manquant « Éleveur » (profil P01) est toujours signalé : il vient de la règle des 40 % des choix retrouvés, pas des étiquettes.

### Le cas « Éleveur » mesuré (consigne 495, 19/11/2026)

Question : faut-il abaisser la règle des 40 % des choix retrouvés (`CML_PART_MINI_CHOIX_RETROUVES`, logique.js) pour que « Éleveur » apparaisse dans le profil « Animaux et nature » ? Essai à 33 % (un choix sur trois suffit), tous les profils du banc rejoués, rien de commité :

- la liste du profil « Animaux et nature » passe de 37 à 108 métiers ; « Sport et animation » de 30 à 469 ; « Nettoyage et entretien » de 76 à 647 ; le profil contradictoire animaux, bureau, usine de 87 à 1 123 ;
- les cinq premiers ne changent que pour un profil sur 19 (« Quinze choix variés ») ;
- les éleveurs qui entrent le font à 13 à 35 % et envahissent des profils sans rapport (Éleveur de lapins dans « Nettoyage », éleveurs de bovins dans « Sécurité ») ;
- pour « Animaux et nature », seuls « Éleveur d'animaux de compagnie » (20 %) et « Éleveur d'ovins » (16 %) entreraient.

**Lecture : le seuil n'est pas la cause.** Les fiches « Éleveur de bovins, porcins, lapins... » portent « Élevage de ferme » et non « Animaux de compagnie » : la personne qui choisit « animaux de compagnie, plantes, espaces verts » ne dit rien d'élevage. Le manque vient de la finesse des choix proposés, pas de la règle.

**Décision de Denis (19/11/2026) : garder les 40 %.** Piste si Denis veut que « Éleveur » remonte : faire compter un choix « animaux » voisin (élevage, chevaux, soins vétérinaires) pour une demi-part quand la personne a choisi un autre choix « animaux » (à mesurer avant tout code).

## Rareté des compétences dans « Par un métier » (consigne 497, 21/11/2026)

**Ce qui a été fait.** Dans `parMetierCalcul.js` (`pmcPoidsRarete`, `pmcScorer`), chaque compétence choisie reçoit le même poids que dans « Par ce que vous aimez faire » : logarithme de (nombre de métiers + 1) sur (métiers qui la portent + 1). « Autonomie » (511 métiers sur 1 920) pèse 1,32 ; « Soigner des animaux » (40 métiers) pèse 3,9 ; une compétence portée par dix métiers, 5,2. La part des choix retrouvés devient une part pesée, calculée sur tous les types de compétences ensemble (avant : moyenne des trois types, chaque type pour un tiers). Niveau, secteur et conditions de travail sont inchangés. Le seuil de 40 % s'applique à la part pesée.

**Mesures** : `mesure_avant_rarete.json` et `mesure_apres_rarete.json`. Tous les chiffres clés du banc sont identiques (les chemins 2 et 3 ne sont pas touchés ; la « retrouvaille » du chemin 1 reste à 1). Seul le chemin 1 bouge, sur les trois cas ajoutés au banc :

| Choix | Métiers proposés avant | Après | Cinq premiers |
|---|---|---|---|
| Autonomie + Soigner des animaux | 535 | 40 | inchangés |
| Autonomie + esprit d'équipe + Conduire sur la route | 222 | 55 | inchangés |
| Rigueur + Accueillir le public + Soigner des animaux | 1 244 | 40 | auxiliaire vétérinaire et agent animalier remplacent agent d'accueil et agent de billetterie en 4e et 5e place |

**Ce que ça change vraiment : la LONGUEUR des listes.** Un métier qui ne retrouve que les compétences très répandues (autonomie, rigueur, esprit d'équipe) tombe sous le seuil de 40 % et sort de la liste, même s'il retrouve deux choix sur trois. Exemple : « Agent d'accueil » retrouvait « Rigueur » et « Accueillir le public » (deux choix sur trois), il n'est plus proposé pour la combinaison avec « Soigner des animaux ». C'est voulu (la compétence rare dit plus), mais c'est une lecture différente de « au moins 40 % des choix » : désormais, 40 % du POIDS des choix. **Décision de Denis (21/11/2026) : on garde le seuil sur le poids.** Variante écartée, gardée pour mémoire : retenir sur la part non pesée (40 % des choix comptés un à un) et pesée seulement pour le classement ; le libellé « à X % ou plus » ne serait alors plus exact pour ces métiers.

**Jury.** Les profils P01 à P27 ont les mêmes cinq premiers métiers qu'avant (aucun nouveau métier à noter). Trois profils ajoutés pour la rareté : P28 (autonomie et soigner des animaux), P29 (autonomie, esprit d'équipe et conduire sur la route), P30 (rigueur, accueillir le public et soigner des animaux). À noter par Denis dans `feuille_jury.html`.

## Jury de Denis du 21/11/2026 : P01 à P52 (`jury_2026-11-21_denis.json`, notes brutes dans `jury_2026-11-21_denis_brut.txt`)

260 métiers notés sur 52 profils (feuille générée avec l'échelle de pistes) : **85 pertinents (33 %), 171 acceptables (66 %), 4 absurdes (1,5 %)**.

| Série | Pertinent | Acceptable | Absurde | Pertinent + acceptable |
|---|---|---|---|---|
| P01 à P27 (profils déjà notés le 19/11, revus) | 69 | 66 | 0 | 100 % |
| P28 à P30 (rareté, chemin 1) | 4 | 10 | 1 | 93 % |
| P31 à P52 (22 cas surprenants du chemin 2, trois choix chacun) | 16 | 91 | 3 | 97 % |

**Les quatre absurdes**
- P29 « Mécanicien cycles » (autonomie, esprit d'équipe, conduire sur la route) : sa fiche porte le savoir-faire « Conduite » (essais de vélos), qui rejoint le choix « Conduire un véhicule sur la route ». Cas isolé, étiquette large : pas de correction.
- P35 « Lingère » (clients, réparer, produits à vendre ou à stocker) : trois choix sur trois retrouvés, mais des choix très généraux.
- P39 « Prothésiste dentaire » et « Chef de promotion des ventes » (produits à vendre ou à stocker, concevoir, extérieur ou chantier) : deux choix sur trois seulement, profil tiré d'un ingénieur de démantèlement, donc contradictoire.

**Lectures.** (1) Les cas surprenants sont presque tous jugés acceptables (83 %) et peu pertinents (15 %) : c'est ce que dit l'échelle, car trois choix tirés d'une fiche atypique donnent des « pistes éloignées » (30 % au plus). Elle ne promet donc pas plus que ce que la liste tient. (2) Les neuf profils où des métiers sont pertinents sont ceux dont les trois choix sont précis (soins, social, qualité, recherche). (3) Les trois absurdes du chemin 2 viennent de choix très généraux ou contradictoires, jamais d'un métier sans rapport avec aucun choix. (4) Sur P01 à P27, plus aucun absurde (4 après la correction des étiquettes du 19/11, 9 avant). Décision : aucun code modifié, rien ne bloque.
