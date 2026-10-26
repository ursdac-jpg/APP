# Chantier F9 : « Reprendre mon CV », une entrée et trois voies (25/10/2026)

Maquette validée par Denis : `docs/MAQUETTE_REPRENDRE_MON_CV_TROIS_VOIES_2026-10-25.html`. Réponses de Denis : (1) une seule tuile ; (2) nom « Reprendre mon CV » ; (3) troisième voie « bientôt » ; (4) demander avant d'effacer ; (5) ordre ci-dessous. `[effort : haut]` pour la case 1.

## Choix de réalisation (audit du code, avant de coder)
- Pas de nouvelle valeur de `_prepLEMode` (une vingtaine de lecteurs) : l'entrée unique garde `_prepLEMode = 'maj'` et un drapeau `_reprendreCvActif` qui change seulement le titre, la barre d'étapes et le bas de la page de dépôt (les trois cartes de voie remplacent « Choisir mon assistant »).
- Le dépôt reste la page « Préparer » existante (`_prepLERendreDepot`, bloc « Votre CV »). Le CV déposé vit dans `_prepLEEtat`, commun aux deux parcours : choisir une voie ne redépose rien.
- Voie « garder et compléter » : même geste que le bouton actuel de « Mettre à jour » (page `echange`). Voie « reformuler » : page « Préparer » de Reformuler (CV déjà là, objectif à renseigner).
- La tuile unique remplace les deux entrées de `MES_DOCUMENTS_PARCOURS` (source unique de l'accueil, de l'infobulle et des puces). Les routes `mettre-a-jour-cv` et `reformuler-cv` restent (reprises, disquettes, favoris).

## Plan en cases
- [x] **1.** Tuile unique, page d'introduction et de dépôt, deux voies actives, troisième voie « bientôt », « Retour » cohérent `[effort : haut]`
- [x] **2.** Demander avant d'effacer (question « Garder ce que vous avez déjà fait ? ») à l'entrée de la tuile `[effort : moyen]`
- [ ] **3.** Parcours rejoués, aide contextuelle, recherche d'accueil, essai réel de Denis

Un commit par case, `npm test` et navigateur avant la suivante.

## État au 25/10/2026 (soir)
Cases 1 et 2 faites : tuile unique « Reprendre mon CV » (remplace « Mettre à jour mon CV » et « Reformuler et présenter mon CV », routes anciennes conservées), page d'introduction, dépôt commun (barre d'étapes à deux étapes), trois cartes de voie (la troisième « bientôt », grisée), « Retour » qui ramène aux voies, question « Garder ce que vous avez déjà fait ? » quand on arrive d'un autre parcours avec un CV ou une lettre en cours, aide contextuelle et recherche d'accueil ajoutées. 1992 tests verts. Contrôles de parcours hors de ce chantier qui échouent déjà (employeurs : historique du navigateur, Créer Dordogne, aide de la route `complement-cv`).
**Décision de Denis (25/10/2026, soir)** : l'arborescence est corrigée (option A) : « Reprendre mon CV » reste réservée à la personne qui a déjà un CV ; la troisième voie « refaire avec mes modèles, sans assistant » en part (E4). La personne SANS CV qui veut le faire à la main, sans assistant, passe par « Créer un nouveau CV », qui gagne un premier choix « avec l'assistant » ou « à la main, sans assistant » : audit et maquette dans `docs/CHANTIER_CREER_CV_SANS_ASSISTANT_2026-10-25.md`.
