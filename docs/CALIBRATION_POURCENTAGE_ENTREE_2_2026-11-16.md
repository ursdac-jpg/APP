# Entrée 2 : calibration du pourcentage « Compatibilité avec vos choix » (document de travail, à valider par Denis)

Créé le 16/11/2026, chantier « Comprendre les métiers » (voir `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md`, point 4 des retours sur la maquette V2). **Aucun code modifié** : les mesures ont été faites en lecture seule, avec le moteur `calculerScoreMetier` (`data/metiers.js`, consigne 410) tel quel, sur **23 profils types** construits avec les trois catalogues de choix (53 actions, 34 activités, 26 environnements).

## Ce qui a été mesuré

Le pourcentage rapporte les choix de la personne à ce que la fiche demande (« 100 % atteignable »), multiplié par un **facteur de quantité** (de 0,45 avec un seul choix à 1 quand la personne a donné autant d'éléments que la fiche en demande, 30 au plus), moins un point par choix que la fiche ne cite pas (12 au plus).

Résultats sur 19 profils « cohérents » (un domaine, 7 à 11 choix), moteur actuel :

| Mesure | Résultat |
|---|---|
| Pourcentage du premier métier | de 68 % à 91 %, **médiane 75 %** |
| Métiers à 70 % et plus | de 0 à 21 selon le domaine |
| Métiers à 50 % et plus | de 13 à 196, médiane 30 |
| Un seul choix (« Cuisiner ») | 45 % au mieux |
| Deux choix (« Cuisiner », « des clients ») | 51 % au mieux |
| 44 choix variés (le maximum de l'écran) | 851 métiers sur 1 923 à 50 % et plus, 26 à 70 % et plus |
| Mélange incohérent (soin, programmation, construction, vente) | premiers : apiculteur 78 %, vétérinaire 76 %, médecins 76 % |

Tableau complet (1er et 5e métier, nombre de métiers à 70 % et à 50 %, premier métier si le plein était abaissé) :

| Profil | Choix | 1er | 5e | À 70 % + | À 50 % + | 1er si plein 20 | 1er si plein 16 |
|---|---|---|---|---|---|---|---|
| Soin et accompagnement | 11 | 77 | 73 | 11 | 73 | 82 | 86 |
| Cuisine et service | 9 | 68 | 60 | 0 | 14 | 68 | 71 |
| Bureau et administration | 11 | 85 | 77 | 16 | 121 | 85 | 91 |
| Bâtiment | 10 | 91 | 84 | 20 | 132 | 91 | 91 |
| Logistique et conduite | 10 | 80 | 73 | 6 | 42 | 83 | 89 |
| Vente et caisse | 7 | 77 | 64 | 2 | 19 | 77 | 77 |
| Numérique | 8 | 79 | 72 | 9 | 108 | 79 | 84 |
| Création | 8 | 75 | 68 | 4 | 30 | 77 | 83 |
| Nature et agriculture | 10 | 70 | 63 | 1 | 22 | 74 | 80 |
| Petite enfance | 7 | 72 | 57 | 1 | 13 | 72 | 72 |
| Animation et formation | 10 | 73 | 68 | 3 | 35 | 80 | 86 |
| Sécurité | 8 | 68 | 62 | 0 | 24 | 72 | 78 |
| Mécanique et maintenance | 9 | 78 | 75 | 12 | 146 | 81 | 87 |
| Industrie et production | 10 | 81 | 79 | 21 | 196 | 83 | 89 |
| Propreté et entretien | 8 | 68 | 56 | 0 | 13 | 68 | 70 |
| Accompagnement social | 11 | 69 | 60 | 0 | 20 | 71 | 76 |
| Sport | 8 | 74 | 58 | 2 | 21 | 74 | 74 |
| Accueil et tourisme | 9 | 76 | 68 | 3 | 47 | 76 | 77 |
| Secrétariat médical | 9 | 70 | 57 | 1 | 20 | 70 | 70 |

## Ce qui va bien

- **La quantité fonctionne** : un seul choix plafonne à 45 %, deux à 51 %. La personne comprend qu'il faut en ajouter pour affiner.
- **Aucun profil n'atteint 100 %** : le plus haut est 91 %. Le pourcentage reste prudent.
- **Les premiers métiers ont du sens** pour la plupart des domaines (carreleur, charpentier et maçon en bâtiment ; aide de cuisine, pâtissier et cuisinier en cuisine ; assistant ressources humaines et assistant comptable au bureau).

## Quatre défauts constatés

### 1. Le « plein » est trop haut pour l'écran de l'entrée 2

Le facteur de quantité attend jusqu'à 30 éléments, parce qu'il compte aussi les compétences et les savoirs d'une fiche. L'entrée 2 ne demande que des actions, des activités et des environnements : une fiche en porte **9 en médiane, 12 au plus**. Avec 8 à 11 choix, une personne ne peut donc jamais atteindre le plein, et tous les pourcentages sont tirés vers le bas sans raison liée à elle.

| Plein | Premier métier, médiane des 19 profils | Premier métier, valeurs extrêmes |
|---|---|---|
| 30 (actuel) | 75 % | 68 à 91 % |
| 20 | 77 % | 68 à 91 % |
| 16 (maximum d'une page de choix) | 80 % | 70 à 91 % |

### 2. Les fiches courtes montent trop haut

2 % des fiches ont 5 éléments ou moins (activités, actions, environnements), mais elles occupent **17 % des dix premières places** des profils testés. Exemple : **Apiculteur à 89 %** pour un profil bâtiment, parce que sa fiche ne porte qu'une action (« construire »), un outil et deux environnements, et que trois de ces quatre éléments correspondent. Un essai de réduction (jusqu'à 40 % pour les fiches les plus courtes) fait passer ces fiches de 17 à 1 sur 100, mais écarte aussi des résultats justes (le carreleur à 91 % devient poseur de façade vitrée à 79 %, la garde d'enfants à domicile laisse la place à un professeur des écoles pour un profil petite enfance). **Réduire trop fort fait donc autant de mal que de bien.**

### 3. Des niveaux très différents sont mêlés

Pour un profil soin, le premier est un médecin coordonnateur (niveau 8) et le cinquième un médecin généraliste (niveau 8), mêlés à l'accompagnant éducatif et social et à l'assistant de vie aux familles (niveau 3). Pour un profil petite enfance, un professeur des écoles (niveau 7) apparaît à côté d'une garde d'enfants à domicile. Ce n'est pas faux (les choix collent), mais une personne sans diplôme peut y lire un faux espoir.

### 4. Beaucoup de choix variés font tout ressortir

Avec 44 choix, 851 métiers sur 1 923 sont à 50 % ou plus : le plafond de 12 points de retrait ne suffit plus. Le pourcentage perd son pouvoir de tri.

## Mes recommandations

| Point | Recommandation | Bénéfice | Risque |
|---|---|---|---|
| Plein de l'entrée 2 | **Abaisser à 16** (le maximum d'une page de choix) | Le pourcentage reflète enfin ce qu'une personne peut donner ; médiane des premiers de 75 % à 80 % | Les pourcentages montent de 0 à 14 points ; un choix prudent à 20 donne un peu moins (médiane 77 %) |
| Fiches courtes | **Réduction douce** (jusqu'à 20 % au maximum pour les fiches de 3 éléments), à tester au moment du code sur ces 23 profils | Évite les faux premiers comme l'apiculteur | Une réduction forte écarte des résultats justes (carreleur, garde d'enfants) : mesurer avant de fixer |
| Niveaux mêlés | **Afficher le niveau sur chaque carte** (déjà dans la maquette) et proposer un bouton visible « Grouper par niveau d'accès » (jamais un filtre caché, consigne 279) | La personne voit tout, avec le contexte | Un bouton de plus à expliquer |
| Choix très nombreux | **Phrase au-dessus de la liste** quand la personne dépasse environ 20 choix : « Vos choix sont très variés : beaucoup de métiers ressortent. Gardez ceux qui comptent le plus pour affiner. » | Évite l'illusion que 80 % de la liste est bonne | Aucun (texte seul) |

## Points à décider par Denis : LES 4 VALIDÉS le 16/11/2026 (recommandations suivies)

1. **Plein à 16** (recommandé), à 20 (plus prudent) ou à 30 (inchangé).
2. **Réduction douce pour les fiches courtes** : OK pour la tester au moment du code, sans la fixer d'avance.
3. **Bouton « Grouper par niveau d'accès »** : à ajouter (recommandé) ou à laisser seulement le niveau écrit sur chaque carte.
4. **Phrase pour les choix très nombreux** : OK.

## Remarque

Les scripts de mesure sont dans le dossier de travail de la session, hors du dépôt (aucun fichier du projet n'a été modifié). Les chiffres de ce document font foi ; au moment du code, la même mesure sera refaite par un test Node pour fixer les valeurs retenues.

## Mesure du 17/11/2026 (phase 2 du plan de clôture) : plein à 16 retenu, réduction des fiches courtes abandonnée

Mesure faite avec le vrai moteur (`rechercherMetiers`, réglage `reglages.pleinMax`) sur les 23 profils, après le rangement des fiches du 13/11. Le réglage n'existe que pour l'entrée 2 : tous les autres appels du moteur restent identiques (contrôlé par `npm test`).

| Réglage | Médiane du pourcentage du premier métier | Fiches de 5 éléments ou moins dans les dix premiers (sur 230 places) |
|---|---|---|
| Actuel (plein 30) | 75 % | 28 |
| **Plein 16 (retenu)** | **78 %** | **18** |
| Plein 16 + réduction des fiches courtes de 5 % | 78 % | 16 |
| Plein 16 + réduction de 10 % | 78 % | 12 |
| Plein 16 + réduction de 20 % | 78 % | 9 |
| Plein 16 + réduction de 40 % | 78 % | 4 |

**Pourquoi la réduction est abandonnée.** L'apiculteur (le faux premier du profil Bâtiment), le carreleur et la garde d'enfants à domicile (deux bons résultats) ont **tous les trois 4 éléments** dans leur fiche. Aucune réduction fondée sur la taille ne peut écarter l'un sans écarter les autres : dès 10 %, le carreleur sort des six premiers du profil Bâtiment, et à 20 % il disparaît ainsi que la garde d'enfants du profil Petite enfance. Le plein à 16 fait déjà passer les fiches courtes de 28 à 18 places sur 230, et fait monter le premier métier de 75 à 78 %. Le mécanisme a été retiré du moteur pour ne pas laisser de code inutilisé ; le niveau d'accès sur chaque carte et le bouton « Grouper par niveau d'accès » restent les garde-fous.

**Niveau d'accès inconnu.** 670 fiches sur 1 925 n'ont pas de niveau d'accès écrit dans le ROME. Le bouton « Grouper par niveau d'accès » aura donc un quatrième groupe, « Niveau d'accès non précisé », placé en dernier (la maquette V2 n'en montre que trois : à ajouter).
