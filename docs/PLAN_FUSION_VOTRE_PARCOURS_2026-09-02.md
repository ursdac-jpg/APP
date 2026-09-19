# Plan de code - Fusion des 4 écrans en une page « Votre parcours »

> Parcours « Créer un nouveau CV » (`dossier.modeCreation === 'nouveau'`).
> Maquette validée : `docs/MAQUETTE_VOTRE_PARCOURS_FUSION_2026-09-02.html` (v3).
> Méthode : un commit par sous-étape, `npm test` + test navigateur à chaque fois,
> jamais un état à moitié refondu.
>
> **ÉTAT : TERMINÉ (2026-09-02).**
> - Étape 1 `b868832` : redistribution Question 2 (6 catégories -> 4).
> - Étape 2 `dd90757` : `pageVotreParcours()` + route `votre-parcours`.
> - Étape 3 `644afc5` : branchement navigation « nouveau » (Objectif -> Votre parcours -> Mon projet).
> - Étape 4 `9a56874` : retrait des 4 anciennes fonctions/routes + `pageSelectionCatalogue`
>   (`trouverItemParId` re-ajoutée hors zone supprimée -- elle y vivait).
> Reste : sweep des docs de pilotage (`BRIQUES_COMMUNES.md`, `ETAT_DES_CHANTIERS`,
> `TACHES_VALIDEES.md`).

---

## Objectif

Remplacer les 4 écrans qui s'enchaînent (`activites` / `actions` / `environnement`
/ `valeurs`) par **une seule page** à 4 questions repliables. Zéro changement
fonctionnel : mêmes catalogues, mêmes champs du dossier, même minimum de 1 choix
par question.

---

## État vérifié dans le code (2026-09-02)

- Les 4 écrans sont 4 fonctions fines (`pageActivites` :4439, `pageActions` :4686,
  `pageEnvironnement` :4697, `pageValeurs` :4816) qui appellent toutes
  **`pageSelectionCatalogue(config)`** (:4492). Elles ne diffèrent que par :
  `catalogue`, `limite` (12 / 12 / 9 / 6), libellés, `precedent` / `suivant`.
- **`pageSelectionCatalogue` n'est appelée QUE par ces 4 fonctions.** Ni
  « Découverte », ni « Mettre à jour », ni « J'ai déjà un CV » ne l'utilisent.
- Les 4 catalogues (`data/*.js`) sont aussi lus ailleurs **par identifiant**
  (`trouverItemParId(CATALOGUE_X, id)` : moteur de compétences lignes 2927-3021,
  `ajouterCatalogue` 8349-8352, `texteProfil` 19723). Ces lectures **ne
  regardent jamais l'étiquette `categorie`**, seulement `id` + les champs
  `savoirFaire` / `savoirEtre` / `savoirs` / `metiers` de chaque carte.
- Routes enregistrées : `js/app.js` :3253-3254
  (`activites` / `actions` / `environnement` / `valeurs`).
- Entrée dans le tunnel : `js/app.js` :4364
  `naviguerVers(dossier.cvAnalyse ? 'projet' : 'activites')`.
  `cvAnalyse` est faux pour `nouveau` -> va sur `activites`. Ce seul endroit
  décide l'entrée pour `nouveau`.
- Sortie du tunnel : config de `pageValeurs`, `suivant: 'projet'`.
- Le champ du dossier reste `dossier.activites` / `.actions` / `.environnement`
  / `.valeurs` = tableau d'identifiants. Inchangé.
- `afficherCompetencesDetectees(etape)` : bandeau affiché sur chacun des 4 écrans.
- `afficherProgression` a déjà une branche `nouveau` qui affiche la barre du
  module ; `_creerCvNavIndex` mappe `activites/actions/environnement/valeurs`
  vers l'index 1 (« Votre parcours »).
- État transitoire à nettoyer plus tard : `etatSelectionCatalogue`,
  `_intervalIntroOnglets` (le cycle d'onglets clignotants, décision C = retiré).

---

## Garde-fous

- Ne changer **aucun `id`** de carte, **aucun** champ `savoirFaire` /
  `savoirEtre` / `savoirs` / `metiers`. Seule l'étiquette `categorie` bouge
  (Question 2 uniquement).
- Garder les 4 anciennes routes/fonctions **enregistrées et fonctionnelles**
  jusqu'à validation navigateur de la nouvelle page (nettoyage en dernier commit).
- `js/app.js` et `data/*.js` ne sont pas couverts par les tests Node pour le
  rendu -> **test navigateur obligatoire** aux étapes 2 et 3.
- Vérifier après chaque étape : `maj`, `pret`, « Découverte », import de session
  ne sont pas affectés.

---

## Étapes (un commit chacune)

### Étape 1 - `data/actionsProfessionnelles.js` : redistribution Question 2

6 catégories -> 4, **sans fourre-tout, sans perdre une carte** :

| Devient | Contenu |
|---|---|
| **Organisation, gestion, administration** (11) | Organiser, Planifier, Gérer, Contrôler, Analyser, Négocier + Calculer, Classer, Saisir, Communiquer par écrit, Archiver |
| **Relationnel** (8) | inchangé |
| **Technique et fabrication** (13) | les 12 « Technique » + Cuisiner |
| **Création et conception** (5) | Créer, Rédiger, Imaginer, Photographier, Dessiner |

- Regrouper les objets de groupe du tableau `CATALOGUE_ACTIONS_PRO`.
- Mettre à jour le champ `categorie` **du groupe ET de chaque carte déplacée**
  (Calculer, Classer, Saisir, Communiquer par écrit, Archiver -> « Organisation,
  gestion, administration » ; Cuisiner -> « Technique et fabrication »).
- Icônes de groupe : 📋 / 🤝 / 🔧 / 🎨.
- `npm test`. Si un test affirme « 6 catégories dans CATALOGUE_ACTIONS_PRO »,
  le corriger (attendu : 4). `node scripts/checkLexique.js` si le fichier est
  concerné (a priori non).

### Étape 2 - `pageVotreParcours()` + route `votre-parcours`

Nouvelle fonction dans `js/app.js`, à côté des 4 anciennes.

- **Config interne** : un tableau des 4 questions
  `{ champ, limite, titre, consigne, familles: [{ ico, nom, ids: [...] }] }`.
  Pour les questions 1 / 3 / 4, `familles` = les groupes existants des catalogues.
  Pour la question 2, les 4 familles redistribuées (déjà faites en étape 1 ->
  on relit simplement `CATALOGUE_ACTIONS_PRO`).
- **Rendu** (fidèle à la maquette v3) :
  - `afficherProgression('votre-parcours')` en tête, puis
    `afficherCompetencesDetectees('votre-parcours')` (une seule fois),
    puis titre + sous-titre + encart d'explication.
  - 4 blocs `<details class="...">` = les questions. Question 1 ouverte, 2-4
    fermées. Pastille de question = « X choisis sur [limite] » (vert) ou
    « à compléter » (rouge doux, tokens `--warning-*`).
  - Dans chaque question : les familles en `<details>` **toutes fermées**.
    Ligne de famille = icône + nom + pastille « N choix » (nombre d'items
    disponibles) + soit l'aperçu gris (3 premiers items + « (+N) ») si rien de
    coché dans la famille, soit **les choix faits en pastilles pleines** si ≥ 1.
  - Cartes = pastilles rondes à cocher (`data-role` + `data-value` + `data-champ`),
    style « pilule » distinct de la ligne de famille.
  - **Pas d'encadré récapitulatif en bas** de question.
  - Barre de navigation fixe en bas : `Retour` -> `objectif` ;
    `Continuer` -> `projet`, **désactivé tant qu'une des 4 questions a 0 choix**
    (message : « Chaque question a besoin d'au moins une case cochée »).
- **Câblage** : clic sur une carte -> toggle dans `dossier[champ]` (respect de
  `limite`), re-render en conservant l'état ouvert/fermé des `<details>`.
  Réutiliser la logique de sélection/désélection de `pageSelectionCatalogue`
  (même écriture dans `dossier[champ]`), pas de nouvelle structure de données.
- Enregistrer la route : `js/app.js` :3253 -> ajouter
  `'votre-parcours': pageVotreParcours`.
- `tests/_domStub.js` : ajouter `'pageVotreParcours'` à la liste de stubs.
- `npm test` (structure) + **test navigateur** : ouvrir/fermer les familles,
  cocher/décocher, compteur, choix qui remontent sur la ligne fermée, bouton
  Continuer qui s'active quand les 4 questions ont ≥ 1, mode sombre.

### Étape 3 - Brancher la navigation du parcours « nouveau »

- `js/app.js` :4364 : `naviguerVers(dossier.cvAnalyse ? 'projet' : 'votre-parcours')`.
- `afficherProgression` (branche `nouveau`) et `_creerCvNavIndex` : ajouter
  `'votre-parcours'` -> index 1. Laisser aussi `activites/actions/environnement/
  valeurs` -> index 1 (inoffensif tant que les routes existent).
- `pageProjet` : vérifier que « Retour » depuis `projet` revient bien sur
  `votre-parcours` (via `_pageOrigineAvantProjet`, capturé par `naviguerVers`).
  Sinon, ajuster le repli.
- **Test navigateur bout-en-bout** : accueil -> « Créer un nouveau CV » -> intro
  -> Objectif -> **Votre parcours** (4 questions) -> Mon projet -> Faire le point
  -> Créer mon CV. Vérifier la barre d'étapes à chaque écran. Vérifier que
  `maj` / `pret` / « Découverte » passent toujours sans toucher à cette page.

### Étape 4 - Nettoyage (seulement après validation navigateur des étapes 2-3)

- Retirer du flux `nouveau` les 4 fonctions `pageActivites` / `pageActions` /
  `pageEnvironnement` / `pageValeurs` et leurs routes, **si un grep confirme
  qu'aucun autre point d'entrée ne les appelle** (déjà vérifié : seul :4364
  et les liens `precedent`/`suivant` entre elles).
- Si `pageSelectionCatalogue` n'est plus appelée nulle part : la retirer, avec
  `etatSelectionCatalogue`, `_intervalIntroOnglets`, `etatCatalogue`.
  Sinon (par prudence) : la laisser, marquer « code mort candidat » dans
  `docs/TACHES_VALIDEES.md`.
- `docs/BRIQUES_COMMUNES.md`, `docs/ETAT_DES_CHANTIERS_2026-08-24.md`,
  `docs/CHANTIER_*` : mettre à jour.

---

## Ce qui NE change pas (à re-cocher après)

- `dossier.activites` / `.actions` / `.environnement` / `.valeurs` : mêmes
  tableaux d'identifiants.
- Le moteur de compétences (`deduireCompetences`, `ajouterCatalogue`,
  `obtenirSavoirs`) et `texteProfil` : lisent par `id`, non affectés.
- `afficherCompetencesDetectees` : appelée une fois au lieu de quatre, même
  fonction.
- « Mettre à jour mon CV », « J'ai déjà un CV », « Découvrir mes compétences »,
  import de session : n'utilisent pas ces écrans.
