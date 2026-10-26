# Chantier : cohérence de « Vos documents » entre tous les parcours qui y mènent (audit du 26/10/2026, Mode A, `[effort : moyen]`, rien codé)

Demande de Denis (26/10/2026) : analyser TOUS les parcours qui arrivent sur la page partagée « Vos documents » (`pageResultats`, `js/app.js` ligne 23908, 1 055 lignes), puis chercher les améliorations qui profitent à tous les parcours et qui les rendent cohérents, avec la même exigence pour chacun.

Ce cahier est un point de départ : la cartographie des familles et les premiers constats. Les constats marqués « à confirmer » viennent de la lecture du code, pas d'un essai dans le navigateur.

## 1. Méthode (en 4 temps, un parcours à la fois)
1. **Cartographier** : pour chaque famille, écran d'avant, barre d'étapes, titre, « Retour », sections affichées, sortie.
2. **Comparer** : tableau famille par famille (section 3).
3. **Dégager** les améliorations communes, regroupées par effort, avec verdict GO / GO AVEC RÉSERVES.
4. **Maquette + validation de Denis**, puis code par sous-étape (grep sur tout le dépôt avant de toucher `pageResultats`, `afficherProgression`, `resultatsCibleRetour`).

## 2. Les familles qui arrivent sur « Vos documents » (liste tirée du code)
La page distingue ses variantes par des signaux : `dossier.modeCreation` (`nouveau`, `maj`, `pret`), `dossier._origineReformuler`, `dossier._origineCoLettre`, `dossier.decouverteTerminee`, `window._decouverteVersResultats`, `window._modeModuleUcpm`, `window._modeVoie3Csa`, `_pageOrigineAvantResultats` (`bilan`, `prepa-entretien`, `un-cv-plusieurs-metiers`, `cv-sans-assistant`), l'essai de modèles (`mgEssaiActif`) et l'import direct de session (`window._importVersResultats`).

| # | Famille | Document | Barre d'étapes affichée sur « Vos documents » | Dernier repère | État de la lecture |
|---|---|---|---|---|---|
| 1 | Créer un nouveau CV, à la main | CV | `CREER_CV_NAV_ETAPES_SANS` (5 étapes) | Vos documents | Lu (écrans 1 à 4) |
| 2 | Créer un nouveau CV, avec l'assistant | CV | `CREER_CV_NAV_ETAPES` (6 étapes) | Vos documents | Lu (écrans 1 à 5) |
| 3 | Créer un nouveau CV, « À partir de mon récit » | CV | `DECOUVERTE_NAV_ETAPES` (7 repères) | Mon CV | Barre lue, parcours à lire |
| 4 | Reprendre mon CV, voie 1 (garder et compléter) | CV, lettre, entretien | `MAJ_CV_NAV_ETAPES` | Vos documents | À lire |
| 5 | Reprendre mon CV, voie 2 (reformuler) | CV | **`MAJ_CV_NAV_ETAPES`** (voir constat 1) | Vos documents | À lire |
| 6 | Reprendre mon CV, voie 3 (à la main, `cv-sans-assistant`) | CV | `CSA_NAV_ETAPES` (5 étapes) | Vos documents | Barre lue |
| 7 | J'ai déjà un CV (`pret`), Préparer lettre et entretien | Lettre, entretien | `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES` | Vos documents | À lire |
| 8 | Écrire ma lettre avec l'assistant | Lettre | `CO_LETTRE_NAV_ETAPES` (4 étapes) | **Terminé** | Barre lue |
| 9 | M'entraîner à un entretien | Entretien | `PREPA_ENTRETIEN_NAV_ETAPES` (4 étapes) | **Terminé** | Barre lue |
| 10 | Un CV, plusieurs métiers | CV | `UCPM_NAV_ETAPES` | Référence ou aspect | À lire |
| 11 | Voir nos modèles (essai) | CV d'exemple | Bandeau d'essai, pas de barre | sans objet | À lire |
| 12 | Bilan, Les mots de votre CV (`ats`), import direct de session | CV | Variable (`afficherProgression` en repli : ancienne barre à 9 repères) | à vérifier | À lire |

Trois documents (CV, lettre, entretien) et au moins **dix barres d'étapes différentes** pour une même page.

## 3. Premiers constats (lecture du code)

**Incohérences déjà visibles, à confirmer dans le navigateur**
1. **Reformuler change de barre à la dernière marche.** Le parcours « Reformuler mon CV » affiche `REFORMULER_CV_NAV_ETAPES` (Préparer, Assistant, Réponse, Vérifier, Mise en forme) pendant tout le module, mais `data/metiers.js` ligne 7858 pose `modeCreation = 'maj'`. Sur « Vos documents », `afficherProgression` prend donc la branche `maj` et montre `MAJ_CV_NAV_ETAPES` (Corriger mon CV, Vos documents). La personne voit deux barres différentes pour un même parcours.
2. **Le dernier repère n'a pas le même nom partout** : « Vos documents » (création, reprise, `pret`, voie 3), « Terminé » (lettre, entretien), « Mon CV » (récit), « Mise en forme » (Reformuler), « Référence » (un CV plusieurs métiers). Même écran, cinq noms.
3. **Le titre de la page** ne change que pour l'entretien et l'essai de modèles : « Vos documents » pour tous les autres, y compris pour la lettre seule.
4. **« Retour »** a quatre mécanismes différents (`resultatsCibleRetour`, `_assistantRetourDocPrecedent`, `reafficherDecouverteCompetences`, retours propres aux modules). La dette est déjà notée dans `BRIQUES_COMMUNES.md` B.36 (« la page n'a jamais été refondue pour elle-même »).
5. **Un seul signal sans mémoire** (`prepa-entretien`) ; les autres s'appuient sur des drapeaux du dossier qui ne sont jamais remis à zéro (`_origineCoLettre`, B.36). Risque : une barre périmée d'un parcours précédent.
6. `pageResultats` fait 1 055 lignes et décide de tout par des `if` imbriqués sur ces signaux : chaque nouveau parcours ajoute un cas.

**Constats hors « Vos documents », trouvés en chemin (parcours « Créer un nouveau CV »)**
7. « Retour » de « Votre profil » est codé en dur vers `projet` (`pageRevelation`) : il saute « Votre parcours » (à confirmer).
8. L'intertitre « Ce que l'assistant a repéré chez vous » reste affiché dans le parcours à la main (calcul local, sans assistant).

## 4. Pistes communes (à chiffrer après la lecture des familles 3 à 12)
- **A. Une seule définition « du dernier repère »** : décider un nom unique (ou deux au plus, selon le document) et une fonction qui choisit la barre à partir de la famille, au lieu de dix branches. `[effort : haut]`
- **B. Un registre des familles** : une table `{ famille, signal, barre, titre, retour, documents proposés }` lue par `pageResultats`, `afficherProgression` et `resultatsCibleRetour`. Les signaux sans mémoire remplacent les drapeaux qui restent. `[effort : haut]`, risque moyen à élevé.
- **C. Corrections ponctuelles** (constats 1, 7, 8) : faibles, à faire dans le même passage une fois confirmées. `[effort : bas]`
- **D. Titre de la page selon le document** (lettre, entretien, CV). `[effort : bas]`

Verdict provisoire : **GO AVEC RÉSERVES, NON APTE AU MODE NUIT** (restructuration d'une page partagée par au moins 12 parcours : la piste B demande une maquette et un plan par étapes, jamais à chaud).

## 5. Reste à faire (dans l'ordre)
- [ ] Lire les familles 3 à 12 (trajectoire complète : écran d'avant, d'après, boutons, sortie), une à la fois, et compléter le tableau.
- [ ] Rejouer les constats 1, 7, 8 dans le navigateur (script `scripts/parcours/parcours_smoke.js`, Playwright installé).
- [ ] Décider avec Denis du vocabulaire du dernier repère et de la forme de la barre (maquette).
- [ ] Plan en cases par effort, puis code, `npm test`, essais navigateur, ligne au journal des changements.
