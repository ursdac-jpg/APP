# Couverture des listes de « Votre parcours » sur tous les métiers de France Travail (consigne 262)

Mesure faite le 12/11/2026. **Aucun ajout n'est codé : tout ce qui suit est une proposition à valider par Denis.**

## Ce qui a été mesuré

- **Base** : ROME 4.0 version 62 (19/10/2026), conservé dans `C:\Users\Denis\Documents\ROME_v62_donnees`. **1 923 codes ROME** (fiches métier), qui regroupent les 13 853 appellations du répertoire de l'application.
- **Outils** : `scripts/mesureCouvertureRome.js` (extrait les compétences, savoirs et contextes de travail de chaque code) puis `scripts/couvertureListesParcours.js` (compare aux listes de l'application, lues dans `data/*.js`). Relançable à tout moment.
- **Limite honnête** : les tables de correspondance (« tel terme du ROME = tel choix de l'application ») sont de notre fait, donc à relire. Les pourcentages sont des ordres de grandeur, pas des vérités exactes. Pour « Ce que vous faisiez », la part « couvert / partiel / non » est un jugement, détaillé dans le script.

## Résultat en un coup d'œil

| Question | Choix actuels | Couverture actuelle des 1 923 codes | Avec les ajouts proposés | Ajouts proposés |
|---|---|---|---|---|
| Avec qui (publics) | 6 | 72 % des codes qui citent un public | 100 % | 8 |
| Avec quoi (matières, outils, produits) | 13 matériels et 5 animaux | 97 % | 100 % | 5 à 9 |
| Ce que vous faisiez | 37 | 34 % des liens compétences pleinement couverts, 30 % en partie, 28 % pas du tout | 0 % des codes en dessous de la moitié (contre 80 % aujourd'hui) | 17 à 22 |
| Où vous travailliez | 20 | 98 % | 100 % | 6 |

Lecture : **les lieux et les matières sont déjà bien couverts**. Les vrais manques sont dans **« Ce que vous faisiez »** (les actions) et, un peu, dans **« Avec qui »**.

## 1. Avec qui : 8 ajouts proposés

Publics du ROME qui n'ont aucun choix aujourd'hui (nombre de codes ROME concernés entre parenthèses).

| Ajout proposé | Ce qu'il couvre | Codes |
|---|---|---|
| Partenaires et fournisseurs | partenaires publics et privés, organisations internationales | 110 |
| Salariés, professionnels, bénévoles | salariés, professionnels de santé, créateurs d'entreprise, bénévoles | 96 |
| Public varié (usagers, voyageurs) | tous types de public, usagers, adultes | 76 |
| Personnes en situation de handicap | handicap, mal entendants, mal voyants, mobilité réduite | 61 |
| Personnes en difficulté | personnes vulnérables, sous main de justice, jeunes en insertion, demandeurs d'emploi, illettrisme | 49 |
| Familles | familles | 22 |
| Adolescents | adolescents | 20 |
| Sportifs | sportifs | 14 |

Deux choix actuels (« Des collègues » et les matériels) ne figurent pas dans les publics du ROME : ils restent, ils servent aux métiers détaillés.

## 2. Où vous travailliez : 6 ajouts proposés

| Ajout proposé | Ce qu'il couvre | Codes |
|---|---|---|
| Association | associations, économie sociale et solidaire | 144 |
| Cabinet ou pharmacie | cabinet libéral, officine | 93 |
| Médias, studio, édition | entreprises de médias, studio, production audiovisuelle, édition | 93 |
| Établissement social, médico-social, crèche | EHPAD, résidence, crèche, halte-garderie, MAM | 71 |
| Sécurité, établissement pénitentiaire | établissement pénitentiaire, sécurité privée | 56 |
| Centre d'appels | centres d'appels | 10 |

Point d'attention : « Espaces verts » n'a presque aucun appui dans le ROME (« génie écologique » seulement) : il reste utile aux métiers détaillés, mais il est faiblement relié au ROME. « Déplacements professionnels » (890 codes) est rattaché à « Sur la route ».

## 3. Avec quoi : 5 ajouts proposés (et 4 options)

| Ajout proposé | Ce qu'il couvre | Codes |
|---|---|---|
| Matières et matériaux | bois, métaux, plastiques, béton, verre... | 340 |
| Tissus et vêtements | mode, textile, accessoires | 82 |
| Aliments et denrées | aliments, spécialités culinaires | 69 |
| Instruments et objets d'art | instruments de musique, objets d'art | 49 |
| Plantes et végétaux | semis, arbres, fleurs, gazon | 39 |

Options à étudier séparément (non chiffrées dans la mesure, signalées par l'audit précédent) : argent et caisse, produits chimiques ou dangereux, matériel médical, installations électriques.

## 4. Ce que vous faisiez : 22 ajouts possibles, 18 recommandés

Les 37 actions actuelles ne couvrent pleinement que 34 % des liens « code ROME / objectif de compétence ». Les objectifs manquants, du plus fréquent au moins fréquent (nombre de liens servis) :

| Ajout proposé | Objectifs du ROME servis | Liens |
|---|---|---|
| Appliquer les consignes de sécurité | prévenir les risques, respecter les règles, cadre réglementaire | 2 453 |
| Encadrer ou animer une équipe | animer un collectif, manager, diriger | 1 344 |
| Gérer des stocks, acheter | maîtriser les coûts, stocks et approvisionnements | 1 057 |
| Utiliser des machines, des outils | procédés et modes opératoires, machines | 970 |
| Entretenir, maintenir | entretenir, corriger, gérer un site | 865 |
| Réagir à un imprévu, une urgence | agir face à l'imprévu | 685 |
| Piloter un projet ou un chantier | piloter un projet, gérer un chantier | 665 |
| Protéger l'environnement, trier | protéger l'environnement | 619 |
| Rechercher, tester | expérimenter, innover | 526 |
| Organiser un événement, communiquer | actions de communication et d'événements | 437 |
| Expliquer, présenter à l'oral | communiquer à l'oral | 423 |
| Concevoir | concevoir, spécifier | 420 |
| Manipuler, préparer des produits | produits, matières premières | 361 |
| Livrer | logistique | 293 |
| Aménager un espace | aménager | 232 |
| Surveiller, sécuriser | protéger les personnes et les biens | 214 |
| Manutentionner, emballer | conditionner des produits | 187 |
| Recruter | gérer les emplois et compétences | 158 |
| Animer des activités | animer des activités | 132 |
| Prendre soin d'animaux | prendre soin d'un animal | 63 |
| Cultiver, entretenir des plantes | cultiver, produire | 60 |
| Se produire (scène, spectacle) | performance artistique | 52 |

**Recommandation** : fusionner « Animer des activités » avec « Encadrer ou animer une équipe », et ne pas retenir « Recruter » (fonction support, pas une activité du quotidien d'une personne en recherche). Cela donne 20 ajouts. Les deux plus faibles (« Se produire » : 52 liens, « Prendre soin d'animaux » : 63 liens) peuvent attendre : cela ramène à 18.

Huit pour cent des liens (directeur, stratégie, cadre juridique d'entreprise...) concernent des fonctions de direction : laissés de côté volontairement, la personne ne les coche pas.

## 5. Conséquences à décider avant tout code

1. **Le plafond de choix (12 / 12 / 9)** : avec jusqu'à 55 actions au lieu de 37, un plafond de 12 devient serré. Mais relever le plafond sans changer la formule de score **gonfle** les résultats (la formule divise par la plus courte des deux listes). Il faut donc revoir la formule dans la même séance, avec tests.
2. **Les métiers détaillés (129)** : chaque ajout doit porter ses savoir-faire, savoir-être, savoirs et ses métiers liés. Sans cela, le choix s'affiche mais ne sert à rien : c'est exactement le défaut de la question retirée.
3. **80 étiquettes de métiers sans choix correspondant** (« seul », « exterieur », « deplacement », « bureau », « magasin », « famille ») et des choix que aucun métier n'utilise : à reprendre dans le même passage.
4. **Longueur de l'écran** : 6 + 19 + 37 + 20 = 82 cartes aujourd'hui, environ 120 avec tous les ajouts. À regarder sur maquette (catégories repliables, recherche dans la liste).

## 6. Options pour avancer

| Option | Bénéfices | Risques |
|---|---|---|
| **A (recommandée) : tout ajouter en deux fois** : d'abord les actions et les publics (les plus gros manques), puis lieux et matières | couvre l'essentiel dès la première fois ; chaque étape testée seule | deux séances, travail sur l'écran à surveiller |
| B : seulement les actions | le plus gros manque comblé vite (34 % → couvert) | publics et lieux restent à 72 % et 98 % |
| C : attendre d'avoir les compétences de tous les métiers pour décider | décision sur des données complètes | les ajouts sont déjà justifiés par le ROME ; attendre ne change pas la liste, et retarde les métiers concernés |

Étiquettes d'effort : maquette de l'écran allongé `[effort : moyen]` ; ajouts avec leurs savoir-faire et leurs métiers `[effort : haut]` ; nouvelle formule de score et plafonds `[effort : haut]`.

## Suite du 12/11/2026 : le trou « Des tissus, des vêtements » comblé

Le choix « Des tissus, des vêtements » ne menait à aucun des 129 métiers détaillés. Dix fiches textile et mode ont été ajoutées (couturier, styliste, modéliste, retoucheur, cordonnier, employé de pressing, lingère, couturier industriel, coupeur industriel, employé de blanchisserie industrielle), construites à partir des données locales du ROME v62 (compétences, savoirs, contextes) et du vocabulaire contrôlé de l'application. La base passe à 139 fiches. Ce lot sert aussi de pilote pour l'import des 1 923 fiches ROME.
