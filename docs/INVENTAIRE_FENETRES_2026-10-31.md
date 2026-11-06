# Inventaire illustré des fenêtres : groupe 1, le circuit de l'assistant (31/10/2026)

> Point C des contrôles (`docs/CONTROLES_B_BBIS_C_F_ABIS_2026-10-31.md`). Les captures sont dans `docs/captures_fenetres_2026-10-31/`, une par fenêtre, prises à 1280 x 720 (ordinateur portable) avec des données de démonstration. Ce groupe est celui que je recommandais de traiter en premier : les fenêtres qui font double emploi avec un écran déjà en page, ou que la règle « minimiser les fenêtres » vise.
> Les 38 autres fenêtres (aide, saisie, confirmations, Repères et Lexique) restent à capturer, par groupes suivants.
> Ce document décrit et recommande : rien n'est modifié dans l'application, la décision de les mettre en page est celle de Denis.

## Tableau

| N° | Fenêtre (titre) | Capture | Où on la rencontre | Appels dans le code | Recommandation |
|---|---|---|---|---|---|
| 1 | Avant de continuer vers [assistant] | `assistant_01_avant-de-continuer-vers-assistant.png` | Après le choix de l'assistant, avant de partir vers lui (module Bilan et autres) | 18 | **À garder en fenêtre** : c'est un avertissement bref (ce qui va se passer, rappel de confidentialité), puis on quitte le site. |
| 2 | Choisissez votre assistant (Regard extérieur) | `assistant_02_...` | Module « Un regard sur mon parcours » | 3 | **Mettre en page** : les autres modules ont déjà un bloc « Votre assistant » dans la page, avec le même composant ; ici c'est une fenêtre à part. |
| 3 | Collez la réponse (Regard extérieur) | `assistant_03_...` | Même module, au retour de l'assistant | 2 | **Mettre en page** : c'est le composant commun de collage (celui des 19 autres modules), mais affiché ici dans une fenêtre. Nouvelle capture de la page de collage possible pour comparer. |
| 4 | Deuxième Regard (accord pour des questions) | `assistant_04_...` | Regard extérieur, avant le deuxième passage | 1 | **Mettre en page** : simple question oui / non, qui s'insère bien dans le déroulé. |
| 5 | Quelques questions (Deuxième Regard) | `assistant_05_...` | Regard extérieur | 1 | **Mettre en page** (on peut y revenir et corriger ses réponses). |
| 6 | Quelles catégories approfondir ? | `assistant_06_...` | Regard extérieur, après la première analyse | 1 | **Mettre en page** : on choisit, on voit un résumé, on valide ; c'est une étape du déroulé. |
| 7 | Quelques questions (formulaire par catégories) | `assistant_07_...` | Regard extérieur, après le choix des catégories | 2 | **Mettre en page** : même raison que 5 ; deux fenêtres portent le même titre pour deux étapes différentes. |
| 8 | Mes freins identifiés | `assistant_08_...` | Regard extérieur, lecture du résultat | 0 depuis le code courant (appel indirect ou ancien) | **À vérifier avant toute chose** : aucune ligne du code ne l'appelle directement ; peut-être du code mort. |
| 9 | Voir mon analyse / Revoir ma dernière analyse | `assistant_09_...` | Regard extérieur, résultat | 1 | **À garder en fenêtre** (lecture d'un résultat, on referme) **ou** page dédiée ; à discuter : c'est le résultat final du module. |
| 10 | Ce que l'assistant a préparé pour votre CV | `assistant_10_...` | Création d'un CV avec l'assistant, après le collage | 2 | **Mettre en page** : la phrase de la fenêtre elle-même dit « vous pourrez tout revoir sur La mise en page » ; un récapitulatif de plus à revoir plutôt qu'à fermer. |
| 11 | Vérifier les informations | `assistant_11_...` | Avant d'envoyer les informations à l'assistant | 3 | **Mettre en page** : c'est un texte long à relire et à modifier, plus confortable en pleine page. |
| 12 | Générer une proposition (Bilan) | `assistant_12_...` | Bilan, depuis une recommandation | 2 | **Mettre en page** (étape C1 déjà faite le 28/10 selon la consigne 19 : à contrôler que la fenêtre n'est pas du code mort). |
| 13 | Analyser ma candidature (Bilan, collage) | `assistant_13_...` | Bilan, au retour de l'assistant | 1 | **Mettre en page** : même composant de collage. |
| 14 | Quelques passages à préciser | `assistant_14_...` | Reformuler, version rapide, Un CV plusieurs métiers, deux écrans de js/app.js | 5 | **Mettre en page** (point 15 du plan, avis de Claude donné le 31/10). Une fois fermée, on ne peut plus y revenir. |

## À retenir

- **Onze fenêtres sur quatorze** gagneraient à être dans la page (2 à 7, 10 à 14). Trois sont à garder en fenêtre ou à examiner : l'avertissement avant de partir chez l'assistant (1), la lecture du résultat (9), et la fenêtre « Mes freins identifiés » (8), qui n'est peut-être plus appelée.
- **Le module Regard extérieur concentre huit fenêtres** (2 à 9) : c'est le module qui contredit le plus la règle « minimiser les fenêtres ». Il faudrait une maquette de son déroulé complet, comme pour les autres modules, avant de coder.
- Les captures montrent chaque fenêtre sur la page qui l'ouvre, assombrie. Les textes lus à 14 px au minimum sont déjà corrects sur ces fenêtres (relevé du point 12) ; les boutons de la barre du bas de la page restent visibles derrière.

## Limites

- Chaque fenêtre est ouverte avec des **données de démonstration** appelées directement dans le code, pas en refaisant tout le parcours d'une personne : le contenu réel d'une personne peut être plus long ou plus court.
- Les fenêtres 8 et 12 ne sont peut-être plus appelées en conditions réelles : à confirmer avant de les mettre en page.
- Les captures sont en 1280 x 720 seulement ; la version téléphone peut être ajoutée sur demande.

## Suite proposée

1. Décision de Denis : mettre en page les fenêtres du module Regard extérieur ? Si oui, une **maquette du déroulé complet** (8 fenêtres, `[effort : haut]`).
2. Décision de Denis sur le point 15 (« Quelques passages à préciser ») : mettre en page, pas de fenêtre.
3. Captures des 38 fenêtres restantes, par groupes : saisie et relecture, aide et information, confirmations, Repères / Carnet / Lexique.

---

# Groupe 2 : saisie et relecture (31/10/2026)

> 12 fenêtres de plus, captures `saisie_NN_...` dans `docs/captures_fenetres_2026-10-31/` (1280 x 720, données de démonstration). « Vérifier les informations » et « Quelques passages à préciser », qui appartiennent aussi à ce thème, sont déjà au groupe 1 (n° 11 et 14).
> **Décision de Denis du 31/10/2026** : ces deux fenêtres-là passent dans la page, par un seul composant partagé (consigne 83, point 15 du plan). Ce sont de **vraies fenêtres dans l'application actuelle** : « Vérifier les informations » s'ouvre par le bouton « Voir ou modifier le texte transmis à l'assistant » du bloc « Votre assistant ».

| N° | Fenêtre | Capture | Où on la rencontre | Références dans le code | Recommandation |
|---|---|---|---|---|---|
| 1 | Vos expériences | `saisie_01_...` | Liste des expériences à modifier | 1 | **Mettre en page** : double « Vos informations », où les expériences sont déjà. |
| 2 | Modifier cette expérience | `saisie_02_...` | Depuis la fenêtre précédente | 1 | **Mettre en page**, avec la précédente (même écran, une fiche à la fois). |
| 3 | Mes coordonnées | `saisie_03_...` | Bilan, saisie du nom et des coordonnées | 0 | **À vérifier : peut-être du code mort** (aucun autre endroit du code ne l'appelle). |
| 4 | Candidature | `saisie_04_...` | Bilan, cadrage de la candidature | 2 | **Mettre en page** : « Votre objectif » contient déjà le même bloc « Candidature » ; c'est un doublon. |
| 5 | Modifier mon CV | `saisie_05_...` | Bilan, relecture des informations du CV | 0 | **À vérifier : peut-être du code mort** ; si vivante, **mettre en page** (c'est « Vos informations » en fenêtre). |
| 6 | Cadrer ma photo | `saisie_06_...` | Modèles de CV avec photo | 4 | **À garder en fenêtre** : outil visuel court (on glisse, on valide), il n'a pas de « retour » à faire. |
| 7 | Ajouter le complément du CV | `saisie_07_...` | CV : ajouter des informations manquantes | 1 | **Mettre en page** : saisie qu'on veut pouvoir revoir. |
| 8 | Points déjà ignorés | `saisie_08_...` | Bilan, relance d'une analyse | 1 | **À garder en fenêtre** : confirmation avec choix, rien n'est écrit avant « Continuer ». |
| 9 | Modifier la préparation à l'entretien | `saisie_09_...` | Entretien, résultat | 4 (boutons) | **Mettre en page** : saisie de plusieurs rubriques, comme la lettre. |
| 10 | Modifier la version 1 (lettre) | `saisie_10_...` | Lettre, résultat | 5 (boutons) | **Mettre en page** : même raison, et la lettre a deux versions à comparer. |
| 11 | Note du Carnet | `saisie_11_...` | Carnet, ouverture d'une note | 1 | **À garder en fenêtre** : lecture d'une note courte, on referme. |
| 12 | Transformer en Repère | `saisie_12_...` | Carnet, bouton de transformation | 4 | **À garder en fenêtre** : petit sélecteur, un clic et c'est fini. |

## À retenir pour ce groupe

- **Sept fenêtres sur douze** gagneraient à passer en page (1, 2, 4, 5 si elle vit, 7, 9, 10). **Quatre sont à garder** (6, 8, 11, 12) : outils courts ou confirmations. **Deux sont à vérifier avant tout** (3 et 5) : le code ne semble plus les appeler.
- Les fenêtres **9 et 10** (modifier l'entretien, modifier la version de lettre) sont deux fois la même mécanique : un seul composant de page de relecture pourrait servir les deux, avec « Vérifier les informations » et « Quelques passages à préciser » (décision du 31/10). C'est le **composant de relecture partagé** à maquetter.
- Même limite que le groupe 1 : données de démonstration, une seule largeur.

## Reste à capturer

Groupe « Aide et information », groupe « Confirmations et alertes » (dont les 61 petites confirmations oui / non), groupe « Repères, Carnet, Lexique ».

---

# Groupe 3 : aide et information (31/10/2026)

> 15 captures `aide_NN_...` dans `docs/captures_fenetres_2026-10-31/` (1280 x 720, données de démonstration). Ce sont des fenêtres de lecture ou de petits formulaires d'envoi : la règle « minimiser les fenêtres » laisse en fenêtre les avertissements et les explications, donc **presque toutes sont à garder**.

| N° | Fenêtre | Capture | Où on la rencontre | Recommandation |
|---|---|---|---|---|
| 1 | Démonstration vidéo (ex. « Masquer des informations dans un texte ») | `aide_01_...` | Boutons « Voir la démonstration » (écran de choix de l'assistant, import) | **Garder** : une vidéo se regarde puis se ferme. |
| 2 | Confidentialité de vos données | `aide_02_...` | Pied de la page d'accueil, et rappels dans les parcours | **Garder** : information, on lit et on ferme. |
| 3 | Partager une information | `aide_03_...` | Pied de la page d'accueil | **Garder** : court formulaire d'envoi, hors de tout parcours. |
| 4 | Signaler un problème | `aide_04_...` | Pied de la page d'accueil et boutons « Signaler » | **Garder**, même raison. |
| 5 | Aucun métier ciblé (avertissement) | `aide_05_...` | Quand on entre dans un module qui demande un métier visé | **Garder** : avertissement avec choix (règle des avertissements). |
| 6 | Votre département | `aide_06_...` | Avant d'afficher des ressources locales | **Garder** : une seule question, une seule réponse. |
| 7 | Trouver une structure (s'ouvre d'abord sur « Votre département » si le département est inconnu) | `aide_07_...` | Renvoi vers l'annuaire dans plusieurs modules | **Garder**. |
| 8 | Liens utiles | `aide_08_...` | Pied de la page d'accueil et fin de parcours | **Garder** : liste de liens qui s'ouvrent dans un autre onglet. |
| 9 | À quoi sert cette page ? (accueil) | `aide_09_...` | Bouton d'ampoule en haut, sur l'accueil | **Garder** : c'est une explication. |
| 10 | À quoi sert cette page ? (autres pages) | `aide_10_...` | Même bouton, sur chaque page | **Garder** ; texte long (quatre rubriques), à surveiller sur téléphone. |
| 11 | Visite guidée | `aide_11_...` | Depuis la fenêtre précédente | **Déjà dans la page** : ce n'est pas une fenêtre mais une visite avec bulles posées sur l'écran réel (capture : étape 1 sur 3). |
| 12 | Comment faire ? (modèle générique) | `aide_12_...` | Bulle d'aide partout où elle est utilisée | **Garder**. **Non reproduit** : la vraie fenêtre « Comment faire ? » de l'écran de masquage local (`data/metiers.js`, vers la ligne 3157) demande l'écran de masquage ouvert. |
| 13 | Métiers proches | `aide_13_...` | Module de recherche de métier | **Garder** : consultation. |
| 14 | Descriptif d'un métier | `aide_14_...` | Recherche de métier, clic sur un métier | **Garder** ; si le texte réel est long, une page dédiée serait possible : à décider avec le module de recherche. |
| 15 | Métiers pour une compétence | `aide_15_...` | Module « Découvrir mes compétences » | **Garder** : consultation. |

## À retenir pour ce groupe

- **Aucune des 15 n'est à mettre en page d'urgence.** Ce sont des lectures courtes ou des questions simples, et vous aviez posé l'exception des avertissements et des explications.
- **Une fenêtre non reproduite** : la vraie « Comment faire ? » de l'écran de masquage local (à capturer en partant d'un CV avec masquage).
- **Une fenêtre qui n'en est pas une** : la visite guidée est déjà dans la page.
- Aussi à noter : le titre « Votre département » s'affiche pour deux ouvertures différentes (6 et 7). Rien à corriger, mais c'est un point de vocabulaire.
- Ne sont **pas** dans ce groupe : les fenêtres de Lexique (« Vos interlocuteurs de proximité ») et de Repères, rangées avec le groupe « Repères, Carnet, Lexique ».

## Reste à capturer

Groupe « Confirmations et alertes » (« Session importée », « Tout effacer sur cet appareil ? », et les 61 petites confirmations oui / non), groupe « Repères, Carnet, Lexique » (fiches détaillées et saisie libre), plus la fenêtre de l'analyseur ATS (`_atsOuvrirFenetre`) non classée.

---

# Groupe 4 : Repères, Carnet, Lexique, et analyseur ATS (01/11/2026)

> 7 captures `reperes_NN_...` (1280 x 720, données de démonstration). Les fenêtres « Note du Carnet » et « Transformer en Repère » sont au groupe 2 (n° 11 et 12). Repères, Carnet et Lexique sont les modules de la « boîte à outils » : leur doctrine est un geste unique, sans friction (on ouvre, on note, on referme), ce qui s'accorde bien avec de petites fenêtres.

| N° | Fenêtre | Capture | Où on la rencontre | Recommandation |
|---|---|---|---|---|
| 1 | Fiche d'un Repère (Question, Idée, À approfondir, À discuter) | `reperes_01_...` | Mes Repères, clic sur un Repère | **Garder** : fiche courte avec « Modifier / Valider / Annuler », même comportement que la note du Carnet. |
| 2 | Saisie libre d'un Repère | `reperes_02_...` | Mes Repères, « Ajouter » | **Garder** : un titre, une réflexion, « C'est noté ». |
| 3 | Vos interlocuteurs de proximité | `reperes_03_...` | Lexique, fiches qui renvoient vers des ressources locales | **Garder** : renvoi vers des contacts, on lit et on referme. |
| 4 | Renvoi local d'une fiche (ex. PLIE, département 24) | `reperes_04_...` | Lexique, fiche PLIE | **Garder**. |
| 5 | Renvoi local d'une fiche (ex. PLIE, autre département : « Trouver une structure ») | `reperes_05_...` | Lexique, même fiche, autre département | **Garder** ; le texte change selon le département, une seule fenêtre. |
| 6 | Comprendre les logiciels de tri (ATS) | `reperes_06_...` | Module « Les mots de votre CV » | **Garder** : explication courte ; à regarder de plus près si le texte réel est long sur téléphone. |
| 7 | Mise en forme et logiciels de tri | `reperes_07_...` | Même module | **Garder**, même remarque. |

## Bilan global de l'inventaire (01/11/2026)

- **Capturées : 48 fenêtres sur les 52 du code** (groupe 1 : 14, groupe 2 : 12, groupe 3 : 15, groupe 4 : 7).
- **À passer en page** (recommandé) : onze du circuit de l'assistant (groupe 1), sept de saisie (groupe 2). Dont « Vérifier les informations » et « Quelques passages à préciser », décidées par Denis le 31/10 (composant partagé, point 15).
- **À vérifier, peut-être du code mort** : « Mes coordonnées », « Modifier mon CV » (groupe 2), « Mes freins identifiés » (groupe 1), et la fenêtre « Générer une proposition » (étape C1 déjà faite le 28/10).
- **À garder en fenêtre** : toutes celles d'aide et d'information (groupe 3), les outils courts et les confirmations (groupes 2 et 4).
- **Non capturées** : 4 des 52 appels (la vraie « Comment faire ? » du masquage local, l'avertissement de découverte des modules `pulseDecouverteUneFois`, la fenêtre de saisie des dates et du contexte `zoneDatesEtContexte`, et la fenêtre « Session importée » / « Tout effacer ») ainsi que les **61 petites confirmations oui / non**, dont le gabarit est unique : une capture type de la confirmation suffirait, les 61 n'ont que le texte qui change.

## Suite proposée

1. **Maquette du composant de relecture partagé en page** (point 15) : « Vérifier les informations », « Quelques passages à préciser », modifier l'entretien, modifier la version de lettre. `[effort : haut]`.
2. **Maquette du déroulé de Regard extérieur sans fenêtres** (8 fenêtres). `[effort : haut]`.
3. **Contrôle du code mort** des quatre fenêtres douteuses, avant de les mettre en page. `[effort : bas]`.
4. Capture de la confirmation type et des 4 fenêtres restantes. `[effort : bas]`.

## Mise à jour du 01/11/2026

Les **huit fenêtres du module Regard extérieur sont supprimées** : le déroulé se fait dans la page Mes Repères (voir `docs/CHANTIER_REGARD_EXTERIEUR_EN_PAGE_2026-11-01.md`). Restent en fenêtre dans ce module : « Mes freins identifiés », la fiche d'un frein, la confirmation de suppression et l'aperçu avant impression.
