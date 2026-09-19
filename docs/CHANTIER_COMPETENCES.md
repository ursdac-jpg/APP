# Chantier compétences : pistes métiers plus pertinentes et personnalisées

> **Plan d'exécution détaillé : `docs/PLAN_COMPETENCES_2026-09-15.md`** (liste d'étapes à cocher,
> avec quoi/pourquoi/comment/complexité pour chacune). Ce fichier-ci reste le cahier : l'audit,
> l'enquête technique et le détail des échanges qui ont mené à ce plan.
>
> **Ouvert le 2026-09-15.** Origine : retour terrain de Denis après présentation de l'application
> à des professionnels. Le mécanisme « une compétence donne jusqu'à 5 pistes de métiers » a été
> très remarqué (professionnels surpris, utile pour des bénéficiaires qui manquent d'idées de
> métiers à partir de ce qu'ils savent faire). Défauts identifiés à l'audit + une évolution
> demandée par Denis + un problème de fragmentation des données découvert en cours de route.
> **CHANTIER CLOS le 2026-09-16.** Étapes 0, 1, 2, 3, 6, 7 faites (fusion des fichiers métiers,
> fichier `data/competences.js`, script `scripts/checkCompetences.js`, volet B (tri par pertinence
> du clic compétence), note de gouvernance vocabulaire, nettoyage du code mort) : `npm test`
> 924/924, test navigateur fait à chaque étape. Étape 4 (garde-fou anti-répétition) jugée non
> nécessaire, le mécanisme de l'étape 3 suffit déjà. **Étape 5 (volet A, nouveau bloc de pistes)
> annulée par Denis** : le bloc « Métiers » existant sur « Votre profil » (`CONFIG_BLOC_METIERS`)
> faisait déjà tout ce qu'il visait à construire, rien à ajouter. Détail complet dans
> `docs/PLAN_COMPETENCES_2026-09-15.md`.
>
> **Séquencement décidé par Denis (2026-09-15)** : 1) solidifier le système de reconnaissance /
> mise en correspondance des compétences (tri par pertinence + fusion des fichiers métiers,
> sections 2 et 4) ; 2) **seulement après**, envisager d'agrandir la base de métiers. Ne pas
> inverser l'ordre.

---

## 1. Où vit la fonctionnalité auditée

Parcours guidé **« Créer un nouveau CV »**, dernier écran avant la rédaction, `pageRevelation()`
(`js/app.js`, route « Votre profil »). La personne y voit ses compétences repérées en pastilles
cliquables. Un clic ouvre un descriptif puis deux choix : « Une piste à explorer » (1 métier) ou
« Quelques pistes à explorer (jusqu'à 5) ». Le même mécanisme est aussi déclenché depuis la
recherche d'accueil quand une compétence ressort dans les résultats.

**Fichiers concernés :**

| Rôle | Fichier |
|---|---|
| Référentiel des compétences reconnues (65 libellés, classées Savoir-faire / Savoir-être) | `js/app.js:723` (`categorieCompetence`) |
| Mini-glossaire affiché au clic | `js/app.js:756` (`DESCRIPTIFS_COMPETENCES`) |
| Écrans de clic sur une pastille | `js/app.js:8798-8941` (`ouvrirDescriptifCompetence`, `ouvrirPanneauMetierUniquePourCible`, `ouvrirPanneauMetiersListePourCible`, `wireCompetencesCliquablesGlobal`) |
| Sélection des métiers pour une compétence (« les pistes ») | `data/baseConnaissancesERIP.js:388` (`trouverMetiersAssocies`) |
| Tri par pertinence pondérée, **écrit mais jamais branché** | `data/metiers.js:956` (`metiersPourCompetence`) + `data/metiers.js:991` (`ouvrirFenetreCompetence`, non appelée) |
| Score utilisé pour la version « 1 piste » uniquement | `js/app.js:8798` (`meilleurMetierAssocie`) + `calculerScoreMetier()` dans `data/metiers.js` |
| Base des métiers (129 fiches, source unique depuis le 2026-09-15) | `data/metiers.js` : les 3 fichiers d'origine fusionnés, commit `006ccbd` |
| 21 secteurs contrôlés | `data/metiers.js:621` (`SECTEURS_APP`), détail dans `data/secteurs.js` |

---

## 2. Audit chiffré (2026-09-15, lecture seule, calculé sur les données réelles)

- **65 compétences** dans le référentiel pivot (`categorieCompetence`).
- **129 métiers** dans la base assemblée, répartis sur **21 secteurs** (~6 métiers/secteur en
  moyenne) : la variété par secteur est déjà correcte, **ce n'est pas là qu'est le manque**.
- **0 métier orphelin** : chaque métier ressort dans au moins 2 compétences (minimum observé :
  « Gendarme », 2 compétences).
- **Nombre réel de métiers qui correspondent à chaque compétence** (avant le plafond d'affichage
  à 5) : moyenne 10,94, minimum 0, maximum 70 (« Rigueur »).
- **18 compétences sur 65 (28 %) ne peuvent pas tenir la promesse de 5 pistes**, faute de métiers
  qui les citent dans leurs fiches :
  - **0 piste (4)** : `Entraide`, `Stabilité`, `Persévérance`, `Respect des règles`
  - **1 piste (6)** : `Coordination`, `Gestion du temps`, `Motivation`, `Apprentissage`,
    `Gestion financière`, `Management`
  - **2 à 4 pistes (8)** : `Aide à la personne` (2), `Persuasion` (2), `Expression artistique` (2),
    `Travail en équipe` (3), `Analyse de données` (3), `Respect des délais` (4), `Transmission` (4),
    `Innovation` (4)
- **Compétences les moins discriminantes** (très présentes, donc peu utiles pour orienter vers un
  métier précis) : `Rigueur` (70/129 métiers, 54 %), `Autonomie` (36/129, 28 %), `Travail manuel` /
  `Précision` / `Communication` (26/129 chacune), `Endurance` (25/129), `Technique` (24/129),
  `Sécurité` (21/129).
- **Métiers qui remontent le plus souvent dans les pistes** (toutes compétences confondues) :
  `Conseiller de vente` (10 compétences), `Assistant de vie aux familles (ADVF)` et
  `Cuisinier / Commis de cuisine` (9 chacun), `Agent d'accueil` et `Téléconseiller` (8 chacun).

### Défaut technique central : les 5 pistes ne sont pas un vrai top 5

`trouverMetiersAssocies()` (`data/baseConnaissancesERIP.js:388`) ne trie rien : elle prend les
premiers métiers qui correspondent **dans l'ordre du tableau `baseMetiers`**, lui-même
l'assemblage `metiers.js` (chargé en premier) → `referentielMetiersERIP.js` →
`metiersComplementaires.js`. Conséquence vérifiée : pour une compétence fréquente comme
« Rigueur », les 5 pistes affichées sont **systématiquement les 5 mêmes** (`Employé libre-service`,
`Préparateur de commandes / Magasinier`, `Cariste`, `Agent d'entretien`, `Infirmier`) : toujours les
5 premiers du fichier d'origine, jamais un métier parmi les 63 ajoutés ensuite même quand il serait
plus pertinent ou plus original. C'est l'inverse de l'objectif de Denis : mettre en avant des
métiers moins évidents.

**Un tri par pertinence existe déjà dans le code** : `metiersPourCompetence()`
(`data/metiers.js:956`) fait une correspondance plus fine (pondération savoir-faire/savoirs = 3,
savoir-être = 2, bonus de position, tri décroissant) mais **n'est appelée par aucun point d'entrée
actif** (son ancien déclencheur, `ouvrirFenetreCompetence()`, a été retiré : voir commentaire
`data/metiers.js:1042-1049`).

**Enquête faite le 2026-09-15 (git archéologie + lecture technique) :**
- Le dépôt Git ne remonte qu'à un commit unique du 22/07/2026 (`ebff7cb`, import d'un état déjà
  existant) : `metiersPourCompetence()` et `ouvrirFenetreCompetence()` y sont déjà présentes,
  identiques mot pour mot jusqu'à aujourd'hui : aucun historique « avant » consultable.
- **La raison du débranchement est écrite dans le code lui-même** (`data/metiers.js:1042-1050`) :
  un **bug réel** (deux fenêtres s'ouvraient en même temps sur un seul clic : l'ancien détecteur
  global de clic réagissait aussi aux badges déjà gérés par le système actuel de `js/app.js`).
  **Décision corrective sur un conflit d'affichage, pas un jugement sur la qualité du tri.** Seul
  le déclencheur (la détection globale de clic) a été retiré ; le calcul lui-même n'a jamais été
  rebranché nulle part, ni supprimé : code mort orphelin, pas un abandon assumé.
- `metiersPourCompetence()` est une **fonction pure, sans dépendance DOM**, directement
  réutilisable. `ouvrirFenetreCompetence()` (l'affichage) est couplée à une fenêtre modale maison
  distincte du composant actuel : pas réutilisable telle quelle, mais pas nécessaire non plus (voir
  plus bas).
- Elle utilise `correspond()` (`data/metiers.js:714`) : correspondance insensible casse/accents,
  tolérante aux pluriels, plus fine que l'égalité stricte de `trouverMetiersAssocies()`.
- **Meilleure nouvelle** : le mécanisme qui personnalise déjà par profil complet existe et tourne
  en production ailleurs dans l'app : `calculerScoreMetier(profil, metier)` /
  `rechercherMetiers(profil, max)` (`data/metiers.js:747` et `:815`), utilisé par le module
  Découverte et surtout par **la version « 1 piste » du clic sur une compétence**
  (`meilleurMetierAssocie()`, `js/app.js:8798`) qui, elle, score déjà les candidats sur le profil
  complet de la personne (activités, actions, savoir-faire, savoir-être, savoirs, valeurs et
  environnement : un signal plus riche encore que « nombre de compétences en commun »). Seule la
  version « jusqu'à 5 pistes » (`ouvrirPanneauMetiersListePourCible`) ne l'utilise pas encore.
- Principe déjà écrit et appliqué ailleurs dans le dépôt (`modules/decouverte-competences/decouverteStrategie.js`,
  en-tête) : ne jamais dupliquer le moteur de score, toujours déléguer à `calculerScoreMetier()` /
  `rechercherMetiers()` comme source unique de vérité.

### Fragmentation des données métiers en 3 fichiers (cause racine du défaut de tri, et source de comptages faux), RÉSOLU le 2026-09-15

**Fait.** `data/metiers.js` contient désormais les 129 fiches en dur (copie verbatim vérifiée par
diff, aucun `id` en double). `data/referentielMetiersERIP.js` et `data/metiersComplementaires.js`
sont supprimés. `index.html` (2 balises `<script>` retirées), `js/app.js:27870`/`27922`
(`REFERENTIEL_METIERS_ERIP` → `baseMetiers`) et `tests/secteursMetiers.test.js` (simplifié, plus
de concaténation manuelle, mêmes assertions) mis à jour en conséquence. `npm test` : 924 verts, 0
échec. Commit `006ccbd`. **Comportement utilisateur inchangé à ce stade** : l'ordre des 129 fiches
dans le tableau est resté identique à l'assemblage d'avant (65 puis 63 puis 1), donc le défaut de
tri (5 premiers du tableau, pas un vrai top 5) n'est pas encore corrigé : seule la source de
vérité est unifiée. La correction du tri est l'objet de la section 4.

Constat initial de Denis le 2026-09-15, en relisant l'audit : quand on regarde `data/metiers.js` seul, on
ne compte que **65 métiers**, alors que la base réelle en fait 129. Cause vérifiée
(`tests/secteursMetiers.test.js:1-17`) : `data/metiers.js` ne contient en dur que les 65 fiches
d'origine ; `data/referentielMetiersERIP.js` (63 fiches) et `data/metiersComplementaires.js`
(1 fiche) ne rejoignent le tableau `baseMetiers` que si ces fichiers sont chargés **après**, dans
le bon ordre (navigateur via `index.html`, ou script Node qui `require` les 3 dans l'ordre). Tout
outil, script ou audit qui ne lit que `data/metiers.js` isolément sous-compte donc la base : c'est
exactement ce qui a induit Denis en erreur.

**Ce n'est pas un sujet séparé du défaut de tri décrit ci-dessus : c'est sa cause.**
`trouverMetiersAssocies()` retient les 5 premiers du tableau `baseMetiers`, dont l'ordre est celui
du chargement des fichiers : donc toujours les 65 d'origine en premier, jamais les 64 ajoutés
ensuite. Fusionner les 3 fichiers (ou a minima retirer la dépendance à l'ordre de chargement)
fait partie de la solidification du système, pas un chantier à part.

**Périmètre du merge vérifié (2026-09-15)**, pour cadrer le risque avant de coder : seuls
`data/metiers.js`, `data/referentielMetiersERIP.js`, `data/metiersComplementaires.js`,
`tests/secteursMetiers.test.js` et 2 lignes de recherche directe dans `js/app.js:27870` /
`js/app.js:27922` (qui filtrent `REFERENTIEL_METIERS_ERIP` par nom) référencent ces exports
séparément : périmètre restreint et déjà identifié.

**Décision de Denis** : fusionner en un seul fichier avec les 129 fiches déclarées directement
(pas de liens entre fichiers séparés, pas de nouveau fichier qui mélangerait fusion et ajout de
contenu en même temps) : geste **technique**, sans ajouter de nouveaux métiers, à faire dans le
cadre de l'étape 1 (solidifier), avant toute extension de la base à l'étape 2.

**Inquiétude de Denis vérifiée et levée** : crainte que la fusion ait fait atterrir les fiches
métiers dans `js/app.js` (le gros fichier applicatif, ~30 900 lignes). Vérifié après coup : `var
baseMetiers` n'existe que dans `data/metiers.js` (8769 lignes, 524 Ko), aucune fiche métier dans
`js/app.js` (2,2 Mo). Les deux fichiers restent complètement séparés : data d'un côté, logique de
l'autre, comme souhaité.

### Écart entre le référentiel de compétences et le vocabulaire réel des fiches métiers

`categorieCompetence` (65 libellés) date d'avant l'ajout des 63 fiches métiers supplémentaires
(`referentielMetiersERIP.js`, `metiersComplementaires.js`). Ces fiches plus récentes ont
probablement des savoir-faire/savoir-être qui ne collent pas mot pour mot aux 65 libellés fixes :
des compétences potentiellement utiles au mécanisme restent donc invisibles (jamais proposées
comme pastille cliquable). Rejoint une idée déjà notée par Denis le 2026-09-02 dans
`docs/IDEES_A_RECLASSER.md` (l.436-444) : construire un vrai référentiel de compétences (une fiche
par compétence, alimentant à la fois ce mécanisme et une future collection « Compétences » du
Lexique). Non commencé.

### Compétences non discriminantes : à surveiller après le volet B, pas à traiter à part

`Rigueur` (70/129 métiers, 54 %), `Autonomie` (36/129, 28 %), `Travail manuel` / `Précision` /
`Communication` (26/129 chacune), `Endurance` (25/129), `Technique` (24/129), `Sécurité` (21/129) :
tellement présentes qu'elles orientent peu vers un métier précis. **Ne pas construire de traitement
spécial pour ces compétences par avance** : le tri par pertinence + profil complet du volet B
(section 5) devrait déjà limiter l'effet (le classement à l'intérieur du pool change même si le
pool reste large). À vérifier après implémentation du volet B, sur un cas réel (cliquer « Rigueur »
avec différents profils et constater si les 5 pistes varient de façon utile) : pas une nouvelle
étape de code par défaut, un point d'observation.

### Audit chiffré du vocabulaire réel : savoir-faire / savoir-être / savoirs (2026-09-15)

Calculé sur les 129 fiches métiers réelles (script Node, pas une estimation), en réponse à la
question de Denis « faut-il plus de compétences, et ça tiendra à 400 métiers ? » :

| Champ | Libellés distincts utilisés dans les 129 fiches | Absents de `categorieCompetence` (65 termes) |
|---|---|---|
| `savoirFaire` | 36 | 4 → **3 réels** (voir correction ci-dessous) |
| `savoirEtre` | 34 | 4 → **3 réels** |
| `savoirs` | **192** | **190** |
| **Union des 3 champs** | **258** | **196 réels** |

- 60 des 65 termes de `categorieCompetence` sont effectivement utilisés par au moins un métier :
  le référentiel actuel n'est pas hors-sol, juste incomplet sur une catégorie précise.
- **129 métiers sur 129 ont au moins un terme absent du référentiel** : systématique, pas un cas
  isolé.
- Cause structurelle : `categorieCompetence` n'a que **2 catégories** (Savoir-faire/Savoir-être),
  aucune ne correspond à « Savoirs » : les 192 libellés de cette catégorie sont donc invisibles par
  construction, pas par oubli ponctuel.

**Correction du 2026-09-16** (première tentative d'implémentation) : le premier script d'audit
avait un bug d'échappement d'apostrophe qui faisait apparaître `Esprit d'équipe` comme absent à
tort : vérifié en direct dans le navigateur (`categorieCompetence["Esprit d'équipe"]` existe bel
et bien, `"Savoir-etre"`, 65 clés). **Ce n'était pas un doublon à fusionner, juste une fausse
alerte de mon script.** Recalcul exact fait depuis le navigateur (objets réels, plus de regex sur
le texte source) :
- `savoirFaire` réellement absents (3) : `Intervention`, `Rédaction de procédures`, `Secourisme`.
  Un 4ᵉ cas (`Analyse de donnees`, sans accent) n'était pas un terme manquant mais **une coquille**
  dans la fiche « Technicien qualité » (`data/metiers.js`) : `Analyse de données` (avec accent)
  existe déjà dans le référentiel. Corrigée directement dans la fiche plutôt qu'ajoutée en double.
- `savoirEtre` réellement absents (3) : `Sang-froid`, `Sens du devoir`, `Discrétion`.
- Top des termes « savoirs » les plus fréquents (candidats à évaluer au cas par cas, pas une
  obligation) : `Règles de sécurité` (8x), `Encaissement` (6x), `Code de la route` (5x), `Hygiène
  alimentaire (HACCP)` (5x), `Gestes de premiers secours` (4x), `CACES` (3x), `Sécurité sur
  chantier` (3x), `Cycle de la vigne` (3x), `Hygiène alimentaire` (3x, probable doublon avec
  `Hygiène alimentaire (HACCP)` et `Règles d'hygiène` 2x : 3 formulations proches du même concept,
  non traité dans cette passe, signalé pour une passe de contenu ultérieure), `Protocoles de
  nettoyage` (2x), `Hygiène hospitalière` (2x), `Pharmacologie` (2x), `Procédures qualité` (2x),
  `Normes électriques` (2x), `Matériel agricole` (2x), `Anglais et langues étrangères` (2x),
  `Chaîne du froid` (2x), `Traçabilité` (2x).

**Conclusion retenue (réponse à la question des 400 métiers)** : savoir-faire et savoir-être sont
des catégories génériques qui se répètent naturellement d'un métier à l'autre (129 métiers très
variés ne génèrent que 70 libellés au total) : elles tiendront la route à 400 métiers **à
condition de réutiliser le vocabulaire existant plutôt que d'en inventer un nouveau à chaque
fiche** (voir étape 6 du plan, gouvernance). Les « savoirs », en revanche, sont par nature
spécifiques à chaque métier/secteur et continueront de croître avec chaque ajout : normal, pas un
manque à combler par un référentiel figé.

---

## 3. Évolution demandée par Denis (2026-09-15) : tenir compte du profil complet, pas d'une compétence isolée

**Aujourd'hui** : clic sur une compétence → 5 métiers choisis **uniquement** parce qu'ils
correspondent à cette compétence-là, indépendamment du reste du profil de la personne.

**Ce que Denis veut** : quand la personne clique sur une compétence, les métiers proposés doivent
aussi tenir compte des **autres compétences déjà repérées** chez elle pendant le parcours (toutes
les pastilles affichées sur l'écran « Votre profil », pas seulement celle cliquée). Un métier qui
recoupe plusieurs compétences réelles de la personne doit remonter plus haut dans la liste qu'un
métier qui ne partage que la compétence cliquée : l'idée est de donner des pistes vraiment
personnalisées au profil complet, pas juste à un mot-clé isolé.

**Difficulté identifiée par Denis lui-même, à résoudre dans la conception** : si le recoupement
avec le reste du profil pèse trop lourd, le même métier « généraliste » (qui recoupe beaucoup de
compétences à la fois) risque de sortir en tête **quelle que soit la compétence cliquée** : ce qui
viderait l'intérêt de cliquer sur des compétences différentes (toujours la même réponse). Il faut
donc doser entre :
- **la spécificité** (ce métier est-il vraiment représentatif de LA compétence cliquée ?)
- **la personnalisation** (ce métier recoupe-t-il aussi d'autres compétences du profil ?)
- **la diversité** (les listes de pistes doivent rester différentes d'une compétence cliquée à
  l'autre, sinon cliquer sur plusieurs compétences n'apporte rien de nouveau)

### 3bis. Confirmation et précision de Denis (2026-09-15, deuxième échange) : deux besoins distincts

**A) Nouveau : un bloc de pistes visible sans clic, sur la page « Votre profil »** : en plus du
mécanisme par compétence, Denis veut un bloc affiché directement sur l'écran où toutes les
compétences repérées sont listées, qui propose des métiers en tenant compte de **l'ensemble** des
compétences de la personne (pas liés à une compétence cliquée en particulier). Nom, emplacement
exact et forme visuelle non tranchés (« je ne sais pas comment on va les appeler, je ne sais pas où
précisément »). À rapprocher de l'ancienne « liste de 5 métiers recommandés » que Denis se souvient
avoir eue puis complètement retirée (enquête en cours pour savoir ce qui s'est passé, quelle en
était la mécanique, et pourquoi elle a disparu).

**B) Le mécanisme par compétence garde son écran et son fonctionnement actuels** : pas de refonte
visuelle. Seule la logique de sélection des 5 métiers doit changer, confirmée par Denis en 2
critères explicites :
1. **Lien réel avec la compétence regardée** : le métier proposé doit véritablement requérir cette
   compétence précise.
2. **Compatibilité avec l'ensemble du profil** : parmi les métiers qui remplissent le critère 1, on
   retient les 5 mieux classés par leur compatibilité avec **toutes** les compétences que la
   personne possède : jamais « les 5 premiers qui tombent sur la main ».

Cette confirmation de Denis correspond mot pour mot au plan technique qui se dégageait déjà de
l'enquête sur `metiersPourCompetence()`/`calculerScoreMetier()` (section suivante) : filtrer par
la compétence cliquée (critère 1), puis classer le résultat par le score de profil complet déjà
utilisé ailleurs dans l'app (critère 2).

---

## 4. Enquête sur l'algorithme abandonné et sur la fiabilité du score (2026-09-15)

### 4.1 `metiersPourCompetence()` : débranché à cause d'un bug d'affichage, pas d'un jugement qualité

Git archéologie faite (le dépôt ne remonte qu'à un commit unique du 22/07/2026, aucun historique
« avant »). **Fait établi avec certitude** : le commentaire `data/metiers.js:1042-1050` documente
explicitement la raison du retrait : un **bug réel** (deux fenêtres s'ouvraient en même temps sur
un seul clic, l'ancien détecteur global de clic entrait en conflit avec le système actuel de
`js/app.js`). Seul le déclencheur (détection globale de clic) a été retiré ; le calcul
(`metiersPourCompetence`, fonction pure sans dépendance DOM) n'a jamais été supprimé ni rebranché
: **code mort orphelin, pas un abandon assumé sur le fond**. `ouvrirFenetreCompetence()` (l'ancien
affichage, une fenêtre modale maison) n'est en revanche pas réutilisable telle quelle.

### 4.2 Meilleure option trouvée : un moteur de score par profil complet existe déjà, en production

`calculerScoreMetier(profil, metier)` / `rechercherMetiers(profil, max)` (`data/metiers.js:1623`
et `:1691`) tournent déjà en production ailleurs dans l'app : module Découverte, et surtout
`meilleurMetierAssocie()` (`js/app.js:8798`, la version « 1 piste » du clic sur une compétence)
qui score déjà les candidats sur le profil **complet** de la personne : un signal plus riche que
« nombre de compétences en commun » (il inclut aussi activités, actions, environnement, valeurs).
Seule la version « jusqu'à 5 pistes » ne l'utilise pas encore. Principe déjà écrit et appliqué
ailleurs dans le dépôt (`modules/decouverte-competences/decouverteStrategie.js`, en-tête) : ne
jamais dupliquer le moteur de score, toujours déléguer à `calculerScoreMetier()`/`rechercherMetiers()`.

**Recommandation retenue pour le critère 2 de Denis (section 3bis)** : réutiliser
`calculerScoreMetier()` comme moteur de score, PAS résusciter `metiersPourCompetence()` (dont la
pondération 3/2/3 est une variante isolée, non cohérente en échelle avec le reste de l'app) : sauf
pour sa correspondance floue `correspond()` (`data/metiers.js:714`, insensible casse/accents,
tolère les pluriels), plus fine que l'égalité stricte actuelle de `trouverMetiersAssocies()` et
réutilisable indépendamment de la pondération.

### 4.3 Fiabilité du score : deux failles concrètes trouvées, à contourner plutôt qu'à ignorer

Lecture complète de `calculerScoreMetier`/`comparerListes` (`data/metiers.js:1602-1665`). Le score
est mathématiquement bien borné 0-100, mais :
- **Faille 1** : normalisation par le poids **réellement utilisé**, pas le poids total : un profil
  qui n'a renseigné qu'une seule catégorie et matche dessus peut afficher 100 %, sans que rien ne
  pénalise un profil incomplet.
- **Faille 2** : `comparerListes()` rapporte le taux de correspondance au **plus petit** des deux
  ensembles comparés : un seul élément coché qui correspond peut saturer toute une catégorie à
  100 %, même si le métier a neuf autres exigences jamais confirmées.
- Les deux failles jouent dans le même sens : un profil pauvre peut être flatté, jamais l'inverse.
- **Précédent produit direct dans l'app** : `docs/ETAT_DES_CHANTIERS_2026-08-24.md:141` documente
  qu'un « score de compétitivité chiffré » a été explicitement écarté dans le module Bilan de
  candidature, remplacé par une échelle qualitative (`BILAN_RESTITUTION_QUALITATIVE` : très
  convaincant / convaincant / à renforcer / prioritaire) : décision déjà prise pour ce même public.
- **Bug annexe trouvé en passant** : la barre `% de cohérence` actuelle (accordéon replié
  « Pourquoi ces métiers ? », `data/metiers.js:1735-1798`, fonction `couleurBarre`) utilise des
  classes Bootstrap (`bg-success`/`bg-info`/`bg-warning`/`bg-secondary`) **sans valeur mode
  sombre** dans `css/style.css` : enfreint la règle non négociable du projet. À corriger si cette
  barre est conservée ; devient sans objet si elle est remplacée par un affichage qualitatif.

**Décision technique retenue** : dans ce chantier, `calculerScoreMetier()` sert uniquement de **clé
de tri interne** (classement), jamais affiché comme pourcentage brut à l'utilisateur : ni pour le
volet A ni pour le volet B. Ça évite d'exposer les deux failles ci-dessus (l'ordre relatif reste
utile même quand la magnitude absolue est discutable, surtout que le volet B filtre déjà par
correspondance réelle à la compétence avant de classer), et ça respecte le précédent déjà acté dans
le module Bilan. **Corriger les deux failles du moteur `calculerScoreMetier()` lui-même serait un
chantier séparé, plus lourd** (impacte aussi Découverte et le bloc « Pourquoi ces métiers ? »
existant) : non engagé ici, juste documenté.

### 4.4 Historique de l'ancienne « liste de 5 métiers » : bonne nouvelle, pas un rejet

`metiersPourSynthese()` a bien existé : même moteur (`calculerScoreMetier`), bloc « Ce qui vous
correspond » sur la page « Votre profil », **renommé « Des pistes à explorer » le 2026-09-02**
(Denis l'a jugé trop affirmatif à l'époque : la leçon sur le ton est donc déjà apprise), puis
**supprimé le 2026-09-03 comme effet de bord d'une fusion d'écrans sans rapport** (commit `27c04eb`,
« nettoyage de code mort » suite à la fusion des blocs « Métiers recommandés » et « Autres pistes »
la veille) : **pas une décision « le score n'est pas fiable, on arrête »**. Rien ne s'oppose donc à
faire revivre ce principe pour le volet A, à condition d'appliquer la même leçon de ton (jamais de
pourcentage affiché, formulation en piste/suggestion, jamais en certitude).

---

## 5. Plan retenu (2026-09-15)

### Volet B : améliorer le tri des « jusqu'à 5 pistes » par compétence (prêt à implémenter, pas de maquette nécessaire)

Aucun changement visuel : l'écran actuel affiche déjà une liste de noms de métiers, sans
pourcentage (`lignesMetiersAssociesOuRepli()`, vérifié). Seule la sélection change :
1. Élargir le filtre de candidats sur la compétence cliquée (garder le principe de
   `trouverMetiersAssocies()`, éventuellement avec la correspondance floue `correspond()` plutôt
   que l'égalité stricte actuelle, pour capter aussi les 63 métiers récemment fusionnés dont le
   vocabulaire ne colle pas mot pour mot).
2. Classer ce pool avec `calculerScoreMetier(profilComplet, metier)` (déjà utilisé ailleurs,
   aucune nouvelle formule à inventer) : **résultat interne seulement, jamais affiché en clair**.
3. Garder les 5 premiers.
4. Unifier avec `meilleurMetierAssocie()` (version « 1 piste ») qui fait déjà presque ça, pour
   n'avoir qu'une seule logique dans le code au lieu de deux proches mais distinctes.
5. Nettoyer le code mort confirmé (`metiersPourCompetence`, `ouvrirFenetreCompetence`,
   `fermerFenetreCompetence`) une fois le nouveau système validé.

### Volet A : nouveau bloc de pistes visible sans clic sur « Votre profil » (maquette légère nécessaire avant code)

Fait revivre le principe de `metiersPourSynthese()` (même moteur, jamais de pourcentage affiché,
ton « piste à explorer », jamais « ce qui vous correspond »), mais réintégré proprement dans le
bloc « Métiers » unifié actuel (pas un bloc à part comme avant 2026-09-03, pour ne pas recréer la
redondance qui a justifié sa fusion/suppression). Emplacement, intitulé exact et forme visuelle
restent à trancher avec Denis avant code : c'est un ajout d'interface visible, pas un simple
changement de logique interne comme le volet B.

---

## 6. Questions ouvertes

- Le score de profil (volet B) doit-il tenir compte de **toutes** les compétences repérées, ou
  seulement de celles du même type (savoir-faire avec savoir-faire, savoir-être avec savoir-être) ?
  → Proposition : toutes, puisqu'on réutilise `calculerScoreMetier()` tel quel (il mélange déjà
  toutes les dimensions du profil), pas de raison de restreindre artificiellement.
- Le même traitement doit-il s'appliquer à la version « 1 piste » (`meilleurMetierAssocie`) et à
  la version accessible depuis la recherche d'accueil, où le profil complet de la personne n'est
  pas forcément disponible au même endroit du code ? → Pour la recherche d'accueil, repli probable
  sur le comportement actuel (pas de profil connu à cet endroit) : à vérifier au moment du code.
- Volet A, emplacement exact, intitulé, et forme visuelle du nouveau bloc : à trancher avec Denis
  (maquette légère) avant code.
- Faut-il corriger un jour les 2 failles de `calculerScoreMetier()` elles-mêmes (section 4.3),
  au-delà de ce chantier (impact Découverte + bloc « Pourquoi ces métiers ? ») ? Non engagé ici.
- Statut de `metiersPourCompetence()`/`ouvrirFenetreCompetence()`/`fermerFenetreCompetence()` :
  code mort confirmé (section 4.1) : à supprimer une fois le volet B validé et testé.

---

## 7. État d'avancement

- [x] Audit lecture seule du mécanisme existant (2026-09-15)
- [x] Reformulation de la demande de Denis, vérifiée avec lui
- [x] Étape 1a : fusion des 3 fichiers métiers en une seule source (2026-09-15, commit `006ccbd`,
      924 tests verts)
- [x] Enquête sur `metiersPourCompetence()` : débranché pour un bug d'affichage, pas pour sa
      qualité ; réutilisation du moteur `calculerScoreMetier()` retenue à la place (2026-09-15)
- [x] Enquête sur la fiabilité du score et l'historique de la liste de 5 métiers (2026-09-15) :
      2 failles trouvées → décision de ne jamais afficher le score en clair (section 4.3/4.4)
- [x] Plan retenu pour les volets A et B (section 5)
- [x] Étape 1 : fichier `data/competences.js` (79 compétences, catégorie « Savoirs » créée),
      2026-09-16, `npm test` 924/924 + navigateur
- [x] Étape 2 : `scripts/checkCompetences.js`, 2026-09-16, 0 erreur / 12 avertissements pertinents
- [x] Étape 3 (volet B) : tri par pertinence du clic compétence, 2026-09-16, `npm test` 924/924 +
      navigateur (profil vide inchangé, profil simulé vérifié sur les 3 écrans concernés)
- [x] Étape 6 : note de gouvernance vocabulaire dans `data/metiers.js`, 2026-09-16
- [x] Étape 7 : nettoyage du code mort (`metiersPourCompetence`, `ouvrirFenetreCompetence`,
      `fermerFenetreCompetence` supprimées), 2026-09-16, `npm test` 924/924 + navigateur
- [x] Étape 4 (garde-fou anti-répétition) : jugée non nécessaire, mécanisme de l'étape 3 suffisant
- [x] Étape 5 (volet A) : **annulée par Denis le 2026-09-16**, le bloc « Métiers » existant
      (`CONFIG_BLOC_METIERS`) couvrait déjà tout le besoin, rien à construire

## 8. Chantier complémentaire : enrichissement des fiches métiers (2026-09-16)

Demande de Denis suite à une question sur la couverture du référentiel : les 63 métiers issus de
l'ancien `referentielMetiersERIP.js`/`metiersComplementaires.js` avaient 5,7 compétences en
moyenne contre 9,0 pour les 65 d'origine : un vrai désavantage dans les recommandations, indépendant
du travail sur l'algorithme (étapes 1-7 ci-dessus). Décision de Denis : aligner tous les métiers sur
le niveau des 65 d'origine, quitte à multiplier les recherches, plutôt que de se limiter aux cas les
plus extrêmes.

**Méthode** : 4 agents de recherche (navigateur réel, fiches officielles France Travail /
Métierscope consultées une par une, jamais de donnée inventée) ont couvert l'intégralité des 63
métiers restants (Gendarme, déjà à 11, exclu). Résultat appliqué en 2 commits (`0c10d48` : les 9
métiers sans aucun savoir-faire ; `63a68c3` : les 54 autres, en 3 lots de recherche parallèles) :
- **Moyenne globale : 7,40 → 8,69** compétences par métier sur les 129.
- **`categorieCompetence` : 79 → 108 entrées** (nouveaux termes génériques réellement présents sur
  les fiches officielles et réutilisables ailleurs : Manutention, Accompagnement, Réactivité,
  Animation, Coaching, Assemblage, Levage...), toujours avec parité stricte descriptifs.
- **Plusieurs vraies erreurs de code ROME trouvées et corrigées** dans la base d'origine (le code
  pointait vers un métier totalement différent) : Arboriculteur, Vigneron (même erreur, A1401
  = « Cueilleur de fruits »), Monteur de réseaux électriques, Technicien froid et climatisation,
  Fleuriste, Livreur à vélo, Guide touristique, Animateur événementiel, Responsable de magasin,
  AESH. Une quinzaine de codes ROME complétés (étaient à `null` faute de certitude jusqu'ici).
- **`npm test` 924/924 à chaque étape**, test navigateur systématique (recherche croisée confirmant
  la réutilisation correcte du vocabulaire, aucune erreur console).

**Points signalés, non tranchés** (code ROME laissé à `null` plutôt que d'imposer une
approximation trompeuse) :
- **Conducteur de ligne de production** : pas de code ROME générique, le référentiel classe par
  filière industrielle (agroalimentaire, bois, chimie, textile...).
- **Gestionnaire ressources humaines** : le code le plus proche (M1501) est déjà utilisé par
  « Assistant ressources humaines » dans cette base : distinction assistant/gestionnaire à
  clarifier côté ROME, ou accepter le doublon de code.
- **Éleveur** : pas de code générique, le référentiel découpe par espèce (bovins, ovins, porcins,
  équidés...).
- **Technicien son et lumière** : pas de fiche unique, le métier est scindé entre Éclairagiste
  (L1504) et Ingénieur du son (L1508) côté ROME.
- **Webmaster** : n'existe plus dans le référentiel ROME actuel, absorbé par « Développeur web »
  (M1855), un profil plus orienté code que le généraliste visé ici : aucun code assigné pour ne
  pas déformer le métier.
- **Agent de tri** : aucune fiche ROME sous cet intitulé hors déchets ; N1103 (déjà présent)
  correspond en réalité à « Préparateur de commandes », gardé tel quel : à confirmer si un
  renommage est souhaité.
- **Agent polyvalent de collectivité** (trouvé dans le premier lot, commit `0c10d48`) : le code
  ROME le plus proche (I1203) classe ce métier chez France Travail dans un secteur différent
  (Maintenance/entretien/nettoyage vs Administration dans cette base).

**Trouvé au passage, non corrigé (hors scope, sans impact fonctionnel)** : 17 fiches préexistantes
(d'avant ce chantier) rangent « Sens du détail »/« Précision »/« Raisonnement logique » dans le
tableau `savoirEtre` alors que leur catégorie canonique est Savoir-faire. Purement cosmétique : le
mécanisme de correspondance (`trouverMetiersAssocies`, `calculerScoreMetier`) vérifie les 3
tableaux sans distinction, aucun impact sur les pistes proposées.

**Chantier clos le 2026-09-16.**
