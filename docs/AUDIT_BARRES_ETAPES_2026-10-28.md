# Audit du code : le vocabulaire des barres d'étapes (G3), 28/10/2026

Audit fait avant toute proposition, comme l'impose le protocole. Aucun code modifié. Origine : constat G3 de `docs/SYNTHESE_AUDIT_TOUTES_CARTES_ET_PLAN_2026-10-26.md` (lot L9), reprise par Denis le 28/10/2026 : une barre à la fois, en commençant par l'audit.

## 1. Ce que dit le code

Toutes les barres sont dessinées par **une seule fonction**, `barreEtapesModule(etapes, indexCourant, options)` (`js/app.js`). Elle ne lit que le **libellé** (`label`) et l'**icône** de chaque repère, jamais son nom interne. Changer un libellé est donc un changement de texte, sans effet sur le fonctionnement.

**Ce qui dépend d'un libellé** (à mettre à jour en même temps, sinon l'aide dit autre chose que la barre) :
- les **textes d'aide** du bouton d'aide (`js/app.js`, lignes 42560 à 42905 environ), qui citent les noms de repères en toutes lettres (ATS, Regard, Comparer, Mes compétences, Un CV plusieurs métiers, lettre, entretien...) ;
- un test : `tests/regardRecruteurIndex.test.js` ligne 28 (liste exacte des libellés du Regard) ;
- une phrase de page : `modules/un-cv-plusieurs-metiers/page5MesCv.js` ligne 47, « choisie à la page 3 » (le repère s'appelle « Référence », D48).

**Ce qui ne dépend pas du libellé** : le nombre de repères, l'ordre, l'icône, l'index courant calculé par chaque module, la mémoire du repère le plus loin atteint, la navigation par clic (seules les barres des parcours « Mes documents » sont cliquables, via `routeParIndex`).

**Une seule barre est partagée par plusieurs écrans qui ne sont pas des étapes distinctes** (Préparer, Assistant, Réponse du CV : une page à mémoire interne). Fusionner ou séparer des repères est donc une opération à part, risquée ; **renommer ne l'est pas**.

## 2. Les barres, par famille (21 définitions, regroupées en 5 familles)

| Famille | Barre | Repères actuels |
|---|---|---|
| **Analyses avec l'assistant** | Analyser ma candidature (Bilan) | Préparer, Envoyer, Rapport, Corriger, Terminé |
| | Les mots de votre CV (ATS) | Préparer, Envoyer, Résultat, Ma fiche |
| | Un regard sur mon CV (Regard) | Préparer, Envoyer, Le regard, Ma fiche |
| | Cohérence de mon dossier | Vos documents, Choix de l'assistant, Chez l'assistant, Rapport, Entretien avancé |
| | Mes compétences (« Découvrir ») | Documents, Assistant, Relecture, Mon document |
| **Écrire avec l'assistant** | Lettre avec l'assistant | Préparer, Assistant, Rédiger, Terminé |
| | M'entraîner à un entretien | Préparer, Assistant, S'entraîner, Terminé |
| **CV** | Créer un nouveau CV | Votre objectif, Vos informations, Votre parcours, Votre profil, Assistant, Vos documents |
| | Mettre à jour mon CV | Préparer, Assistant, Réponse, Corriger mon CV, Vos documents |
| | Préparer lettre et entretien | Préparer, Assistant, Réponse, Vos informations, Vos documents |
| | Reformuler mon CV | Préparer, Assistant, Réponse, Vérifier, Vos documents (une seule barre jusqu'au bout, fait le 28/10/2026) |
| | Reprendre mon CV | Déposer, Ma voie |
| | Écrire mon CV à la main | Déposer, Ma voie, Classer, Vérifier, Vos documents |
| | Découvrir mes compétences | Préparer, Assistant, Réponse, Compétences, Compléter, Rédiger mon CV, Vos documents (fait le 28/10/2026) |
| **Modules longs** | Comparer mes pistes | Mes pistes, Collecter, Fiches, Comparer, Aller plus loin, Ce que je retiens |
| | Un CV, plusieurs métiers | Mon CV, Métiers, Référence, Accroches, Mes CV, Lettres, Fin, Entretiens |
| **Navigation (pas des étapes)** | Comprendre le cadre | Accueil, Un rayon, Affiner ma recherche, Outils |
| | Comprendre les chiffres | Les chiffres, Une autre question |
| | Qui fait quoi | Accueil, Un domaine, Une fiche |

## 3. Les défauts de vocabulaire constatés

1. **Le repère d'envoi a quatre noms** pour la même action « aller chez l'assistant » : « Envoyer » (Bilan, ATS, Regard), « Assistant » (lettre, entretien, CV, Mes compétences), « Choix de l'assistant » puis « Chez l'assistant » (Cohérence), « Collecter » (Comparer).
2. **Le repère de résultat a six noms** : « Rapport » (Bilan, Cohérence), « Résultat » (ATS), « Le regard » (Regard), « Réponse » (CV), « Relecture » (Mes compétences), « Rédiger » (lettre, entretien « S'entraîner »).
3. **Le dernier repère a six noms** : « Terminé » (Bilan, lettre, entretien), « Ma fiche » (ATS, Regard), « Vos documents » (CV), « Mon document » (Mes compétences), « Mon CV » (Découvrir), « Fin » (UCPM), « Entretien avancé » (Cohérence), « Ce que je retiens » (Comparer), « Mise en forme » (Reformuler).
4. **Une phrase de page cite un numéro** (« à la page 3 ») alors que la barre cite un nom (D48).
5. **Trois barres de navigation** (cadre, chiffres, Qui fait quoi) sont dessinées exactement comme des barres d'étapes (même pastilles, même chevrons). Une personne peut croire qu'il y a des étapes à suivre dans l'ordre.
6. **Reformuler** : le dernier repère s'appelle « Mise en forme » alors que la page affichée s'appelle « Vos documents » (C1, déjà identifié comme défaut). Depuis le 28/10, la version 2 passe en plus par la page « Envie d'un CV plus développé ? », sans repère propre (elle est sous « Vos documents »).

## 4. La règle de vocabulaire proposée (celle de la synthèse, précisée par ce que le code permet)

| Moment | Libellé unique |
|---|---|
| préparer ce qu'on envoie | **Préparer** |
| aller chez l'assistant et coller sa réponse | **Assistant** |
| ce que l'assistant a rendu | **Résultat** |
| la fin d'une analyse, de la lettre ou de l'entretien | **Terminé** |
| la fin d'un CV | **Vos documents** (c'est le titre réel de la page) |

Les repères qui portent un **contenu propre** au module (Corriger, Classer, Fiches, Comparer, Accroches, Lettres, Métiers...) restent : la règle ne vise que les quatre moments communs.

## 5. Ordre de travail proposé (une barre à la fois, chaque barre validée avant la suivante)

Pour chaque barre : je montre la barre **avant / après** (capture du vrai rendu, ordinateur et téléphone), je mets à jour **en même temps** le texte d'aide, le test et toute phrase de page qui cite l'ancien nom, je lance `npm test`, je vérifie à l'écran, j'inscris une ligne au journal, un commit.

1. **FAIT le 28/10/2026, validé par Denis. Regard recruteur** : Préparer, Envoyer, Le regard, Ma fiche → Préparer, **Assistant**, **Résultat**, **Terminé**. Le plus simple et le plus net (aucun écran partagé, le test se met à jour en une ligne).
2. **FAIT le 28/10/2026, validé par Denis. ATS** : même changement (Envoyer → Assistant, Ma fiche → Terminé ; « Résultat » est déjà bon).
3. **FAIT le 28/10/2026, validé par Denis. Bilan** : Envoyer → Assistant, Rapport → Résultat (le reste ne change pas).
4. **FAIT le 28/10/2026, validé par Denis (maquette `MAQUETTE_BARRE_COHERENCE_2026-10-28.html`). Cohérence** : fusion des deux repères d'assistant, Préparer, Assistant, Résultat, Entretien avancé ; cinq états vérifiés. Avant : cinq repères dont deux pour l'assistant ; fusionner demande de toucher l'index de chaque écran : à étudier **après** les trois premiers.
5. **Lettre : FAIT le 28/10/2026, validé par Denis** (« Rédiger » devient « Réponse » : le repère s'allume sur l'écran où l'on colle la réponse de l'assistant, maquette `MAQUETTE_BARRE_LETTRE_2026-10-28.html`). **Entretien : FAIT le 28/10/2026, validé par Denis** (« S'entraîner » devient « Réponse », même raison, maquette `MAQUETTE_BARRE_ENTRETIEN_2026-10-28.html`). **Mes compétences : FAIT le 28/10/2026, validé par Denis** (Préparer, Assistant, Relecture, Terminé ; loupe pour « Relecture », maquette `MAQUETTE_BARRE_MES_COMPETENCES_2026-10-28.html`).
6. **CV** : « Réponse » → « Résultat » ? et « Mise en forme » (Reformuler) → « Vos documents » ; à trancher avec Denis, car la barre est cliquable et partagée par plusieurs parcours.
7. **UCPM : FAIT le 28/10/2026, validé par Denis** (« Fin » devient « Mes documents », « Entretiens » reste, phrase « choisie dans « Référence » » corrigée). **Comparer : FAIT le 30/10/2026, décision de Denis : aucun mot renommé** (noms propres au module, chacun égal au titre de sa page).
8. **Navigation : FAIT le 30/10/2026, variante A choisie par Denis** (maquette `MAQUETTE_BARRES_NAVIGATION_2026-10-30.html`) : fil « Vous êtes ici », brique `barreRepereNavigation`.

## 6. Ce qui est simple, risqué, bloquant

- **Simple** : renommer un libellé (une chaîne), mettre à jour son texte d'aide et son test ; corriger la phrase « page 3 ».
- **Risqué** : fusionner ou ajouter un repère (index à recalculer écran par écran, mémoire du repère atteint) ; changer l'allure des barres de navigation (CSS partagé).
- **Bloquant** : aucun. **À trancher par Denis** : le choix des mots pour chaque barre (voir le message de séance), en commençant par le Regard recruteur.
