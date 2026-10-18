# Mon territoire : carte de faisabilité (P0.4) et projet de format du registre (P0.2) - 2026-10-12

> Brouillon de Claude, établi en autonomie à partir du code réel, **pour validation par Denis**. Rien n'est codé. Étape 2 de la méthode (carte de faisabilité rapide), pas encore l'audit final avant code (étape 4).

## 1. Ce que le code fait déjà (relevé)
- L'écran **« Près de chez moi »** existe pour chaque rayon (`modules/comprendre-le-cadre/index.js`, `_comprendreLeCadreRenduStructures`). Il groupe les structures par portée lue dans `liens-verifies.txt` : national, région, Dordogne (24), Haute-Vienne (87), et une section « À vérifier selon votre territoire » pour les structures non étiquetées. Départemental filtré sur le département mémorisé.
- Le **département** est mémorisé sur l'appareil (`erip_departement_ressources`, `demanderDepartementSiInconnu`). **Il n'existe aucune notion de commune** aujourd'hui.
- Le **retour** vers un module d'origine passe par `definirRetourModuleExterne(label, retour, moduleRoute, cibleRoute)` (`js/app.js`) : `retour` est une fonction, donc un retour exact (même rayon, même fiche) est réalisable. Précédents : Lexique et « Comprendre les chiffres ».
- La **recherche de l'accueil** ne ramène que les 17 rayons (titre et « quoi »). Une catégorie = une fonction courte (`data/baseConnaissancesERIP.js`).
- Les fiches ont un booléen `frein: true/false` et des `tags`, mais **aucun champ ne dit à quel type de structure s'adresser**.
- **« Publier »** n'écrit que dans une liste fermée de destinations (`outils/veilleDepot.js`), avec vérification, tests et retour en arrière.

## 2. Verdicts par fonction

| Fonction | Verdict | Réserve concrète |
|---|---|---|
| Registre de lieux en fichier texte, lu à la demande | **GO** | Même principe que `liens-verifies.txt`. Aucun serveur. |
| Vérificateur dans `npm test` | **GO** | Modèle : `checkLexique.js` et `veilleLiens.js`. |
| Retour exact jusqu'à la fiche d'origine | **GO** | Le retour est une fonction. À tester contre les boucles de « Retour » (précédent corrigé le 2026-09-16). |
| Remplacer l'écran « Près de chez moi » par le répertoire | **GO AVEC RÉSERVES** | L'écran actuel doit rester pour la Haute-Vienne tant qu'elle n'est pas migrée : un aiguillage par département. Risque moyen, test navigateur obligatoire sur les deux départements. |
| Relier une fiche à ses structures | **GO AVEC RÉSERVES** | Écrire un champ « types » sur environ 127 fiches serait long. Moins coûteux : un **type par défaut par rayon**, avec exception fiche par fiche quand il faut. |
| Recherche dans le module et sur l'accueil | **GO** | Index généré par script, test de fraîcheur. La recherche actuelle ne couvre pas les fiches : ce serait une amélioration en plus. |
| Commune de la personne | **GO AVEC RÉSERVES** | Notion nouvelle. Nécessite une liste des communes de Dordogne (données publiques de l'INSEE : licence et fraîcheur **non vérifiées**). Stockage local seulement, rien envoyé. |
| « Communes desservies » par structure | **GO AVEC RÉSERVES** | Vrai travail de données : relever la zone de chaque Mission locale, etc. Trois Missions locales existent déjà en Dordogne. |
| Fiche employeur et branche Emploi | **GO** | Module neuf. Sirene répond à distance sans clé (testé), à utiliser hors site pour préparer les candidats. Les erreurs de Sirene constatées imposent la vérification à la main. |
| Section « Mon territoire » dans l'outil de veille et « Publier » | **GO** | Ajout d'une destination fermée et de tests. Le bloc « Annuaire associatif » sera retiré en même temps. |
| Branches Formation, Vie pratique, Fonction publique, Armées, Social, Appui aux employeurs | **GO sur le code, réserve sur les données** | Le code est le même que pour Emploi. Ce qui limite est le temps de vérification. |

**Verdict global : GO AVEC RÉSERVES.** Aucun NO GO. Les réserves sont des données à relever et un aiguillage à tester, pas des obstacles techniques.

## 3. Projet de format du registre (P0.2), à valider
Deux fichiers texte, colonnes séparées par ` | `, commentaires `#` en tête comme dans `liens-verifies.txt` : une ligne égale une fiche. Emplacement envisagé : `modules/mon-territoire/contenu/`.

**`lieux.txt` (structures)** : `id | type | nom | commune | communes desservies | téléphone | site | portée | source | date de vérification`
- `communes desservies` : une liste de noms de communes séparés par des virgules, ou `tout le département`, ou `la commune` (cas d'un CCAS).
- `portée` : `24`, `87`, `region` ou `national` (comme aujourd'hui).
- `type` : un élément de la liste fermée (voir `docs/EXTRACTION_A_BLANC_STRUCTURES_2026-10-12.md`, section 4).
- Un lien ou un téléphone n'est affiché que si la date est présente et de moins de 12 mois ; au-delà, « à revérifier » (jamais bloquant).

**`employeurs.txt`** : `id | nature | nom | secteur | commune | téléphone du standard | site | page de recrutement | modes de candidature | installé depuis | source | date de vérification`
- `nature` : `enseigne` ou `local`. `modes de candidature` : un ou plusieurs de `spontanée`, `concours`, `portail`, `intérim`, `prescripteur`.
- `secteur` : l'un des 21 secteurs de `data/secteurs.js`.

**Règles communes vérifiées par le vérificateur** : identifiant unique, type connu, secteur connu, date au format AAAA-MM-JJ, téléphone au format français, site en https, aucun tiret long, aucun nom de personne probable, une commune non couverte ou couverte deux fois par le même type est signalée.

## 4. Points à décider (voir `docs/PLAN_MON_TERRITOIRE_PREMICES_2026-10-12.md`, section 2)
D1 principe, D2 option C pour les communes, D3 pilote, D4 branches ajoutées, D5 liste des types, D6 boîte de réception, D7 Fonction publique et Armées. **Nouveau, D8** : les services en ligne et annuaires nationaux (19 entrées) restent hors du répertoire de lieux, dans « Comprendre le cadre » comme sources datées.
