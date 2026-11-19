# Quatrième chemin d'« Explorer les métiers » : « là où ça recrute » (plan à valider, rien n'est codé)

Date : 18/11/2026. Origine : consigne 456 (Denis). Décision du 18/11/2026 : on commence par les **deux départements que nous couvrons** (Dordogne 24 et Haute-Vienne 87) ; les autres départements viendront un par un, quand leurs données existeront.

## 1. Ce que ce chemin n'est pas

Les trois autres chemins servent à **explorer** (choisir, répondre, comprendre un métier). Celui-ci sert à **trouver au plus vite** : la personne ne répond à aucune question, elle voit du concret pour son département, puis elle passe à l'action (fiche, offres, candidature).

## 2. Parcours complet (écran d'avant, écran d'après)

| Étape | Écran | Ce que la personne voit et peut faire |
|---|---|---|
| 0 | Accueil du module | Quatrième carte (nom provisoire : « Métiers qui recrutent près de chez vous »), avec deux boutons comme les autres : **entrée directe** et **Présentation de ce chemin**. |
| 0 bis | Présentation du chemin | Page routée, composant commun, « Commencer » en bas. Vidéo : en tout dernier. |
| 1 | Choix du département | Deux boutons : Dordogne (24), Haute-Vienne (87). Un troisième, « Un autre département », affiche un message honnête : les chiffres de ce département ne sont pas encore là, et propose le chemin « Par un métier ». Rien n'est inventé. |
| 2 | Page du département | Cinq blocs, toujours ouverts (pas de fenêtre), dans cet ordre : A, B, C, D, E ci-dessous. |
| 3 | Fiche d'un métier | Fiche enrichie existante, avec le bloc « Candidater pour ce métier » (déjà codé). Le fil de voyage et « Retour » ramènent à la page du département. |
| 4 | Candidater | Passage au module Candidater, comme depuis l'accueil (déjà codé dans la fiche). |

### Les cinq blocs de la page du département

- **A. Ce qui recrute le plus** : les 10 métiers de l'enquête Besoins en main-d'œuvre de France Travail pour le département (données déjà dans l'application : `bmo-metiers.json`), avec le nombre minimum de projets et la part de saisonniers. Chaque ligne a un bouton **Voir la fiche métier**.
- **B. Les métiers saisonniers** : parmi ces 10 métiers, ceux dont la majorité des projets est saisonnière, avec un renvoi vers le calendrier de saisonnalité de « Comprendre les chiffres ».
- **C. Les métiers difficiles à pourvoir** : la part de projets jugés difficiles pour le département (déjà dans le portrait de « Comprendre les chiffres »), avec la phrase du Lexique « un métier en tension ne veut pas dire facile d'y entrer ».
- **D. Qui embauche près de chez vous** : renvoi vers les employeurs du module « Mon territoire » (enseignes de commerce comprises, où le renouvellement du personnel est fréquent). Lexique : « turnover ».
- **E. Chercher les offres du moment** : la demande à copier, **par département puis par départements voisins** (même règle des zones d'emploi que dans la fiche), avec l'avertissement validé (offres publiées seulement, marché caché, rien n'est repris) et les boutons Copier la demande, Copier et ouvrir ChatGPT, Copier et ouvrir Perplexity. Le message est lisible seulement si la personne clique « Préparer ma demande », comme dans la fiche.

## 3. Audit du code réel

**Simple (reprise de l'existant)** : la carte et sa présentation (composant commun) ; les données de l'enquête (bloc `_cmbBlocDepartements`) ; le bloc Candidater de la fiche ; l'avertissement et les boutons de copie ; les départements voisins (`PMC_TERRITOIRES`, déjà pour 24 et 87).

**À faire proprement (une seule source de vérité)** :
- Le message d'offres actuel (`pmcMessageOffres`) parle d'**un métier**. Il faut une variante « tous les métiers qui recrutent dans ce territoire », sans dupliquer : on généralise la fonction.
- Les boutons de copie sont aujourd'hui câblés dans la fiche (`parMetierFiche.js`) : on les met en commun avant de les réutiliser (grep sur tout le dépôt d'abord).

**Risqué / point bloquant** :
1. **Les métiers de l'enquête ne sont pas des fiches métiers.** « Viticulteurs, arboriculteurs » est un regroupement statistique, pas une fiche. Pour que « Voir la fiche métier » fonctionne, il faut une **petite table de correspondance** (environ 20 lignes : 10 métiers pour 24, 10 pour 87) vers les fiches. Je la propose, Denis la relit (comme les deux fiches à la main déjà notées). Sans cette table, le bouton ne peut pas exister.
2. **Pas de chiffres hors 24 et 87** : traité par le message honnête de l'étape 1.
3. **Le département de la personne n'est pas mémorisé** dans l'application : elle le choisit à l'entrée (une fois par visite). Le mémoriser serait un autre chantier (vie privée sur poste partagé).
4. **« Turnover du commerce »** : nous n'avons pas de chiffre par département pour cela. On renvoie vers les employeurs de « Mon territoire » et la fiche du Lexique, sans inventer de statistique.

## 4. Ce qu'il faut valider avant de coder

1. Le parcours ci-dessus (ordre des cinq blocs, bloc D en simple renvoi).
2. Le nom du bouton (proposition : « Métiers qui recrutent près de chez vous »).
3. La table de correspondance (je la propose, vous relisez).
4. Les textes (présentation du chemin, introduction de chaque bloc) : je les rédige dans `docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md`, section 10, avant de les mettre dans l'application.

## 5. Suite des travaux (rappel)

Ce chemin, puis la phase 4 du chantier (carte « Vous hésitez encore ? », aide, visite guidée, ponts, disquette, suivi d'usage), puis les retours après la phase 9, puis les **vidéos en tout dernier** (générale, trois chemins existants, quatrième chemin).

## 6. Mise à jour du 18/11/2026 : maquette vivante codée, corrections de ce plan

- **Corrigé : le département EST mémorisé** (`departementRessourcesMemorise`, le même choix que « Comprendre les chiffres » et « Qui fait quoi »). Le chemin le reprend, il ne le redemande pas ; un bouton permet d'en changer. Le point 3 de la section 3 était faux.
- **Corrigé : toutes les lignes de l'enquête ont des fiches.** Les 130 fiches écrites à la main (serveur, aide-soignant, employé de libre-service, vigneron...) sont dans la même base que les fiches du ROME, avec conditions de travail, compétences et bouton de candidature. Chaque métier de l'enquête renvoie à une ou deux fiches (tableau `CMR_FICHES_ENQUETE`, à relire par Denis). Un test vérifie que les 14 métiers des deux départements sont couverts.
- **Famille des saisonniers** : tourisme et hôtellerie, cuisine et restauration, agriculture et vigne, transformation alimentaire (tableau `CMR_FAMILLES_SAISONNIERS`, bâti sur la liste commune `METIERS_SAISONNIER_ALIMENTAIRE`). **Famille du commerce et de la logistique** : libre-service, caisse, merchandiseur, vendeur, préparateur de commandes, manutentionnaire, cariste, logisticien, agent de tri (`CMR_FAMILLE_COMMERCE`).
- **Commerce** : explication du turnover, bouton vers la fiche du Lexique, bouton direct vers la liste des enseignes du commerce du département (module « Employeurs près de chez moi », avec « Revenir à Explorer les métiers ») et bouton vers tous les secteurs ; limite dite clairement (seulement le département de la personne, pas les voisins) et repérage en cours.
- **Demande d'offres** : une seule fonction, partagée avec la fiche d'un métier (`_pmfFormulaireOffres`), qui prend ici la liste des métiers de l'enquête du département.
- **Points ouverts** : la fiche « Arboriculteur » n'a pas de conditions de travail ni de bouton de candidature (elle n'est pas dans la base du module) : elle est laissée de côté en attendant ; le nom du chemin ; les textes (section 10 du document de relecture) ; la vidéo (tout dernier).
