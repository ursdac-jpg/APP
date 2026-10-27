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
| 3 | Créer un nouveau CV, « À partir de mon récit » | CV | `DECOUVERTE_NAV_ETAPES` (7 repères) | Mon CV | **Lu (26/10)** : voir 3 bis |
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

## 3 bis. Famille 3 « À partir de mon récit » (lue le 26/10/2026, `decouverteParcours.js`)
- **Barre** : 7 repères (Préparer, Assistant, Réponse, Compétences, Compléter, Rédiger mon CV, Mon CV). Les écrans du module utilisent `_decouverteNavIndex` (repères 0 à 5) ; « Mon CV » (repère 6) n'est atteint que sur « Vos documents », puis tout passe au vert (index 7) quand `cvTermine`.
- **Sortie** : `terminerParcoursDecouverte()` pose `window._decouverteVersResultats` (transitoire) ET `dossier.decouverteTerminee` (persistant), puis `naviguerVers('resultats')`. Sur « Vos documents », ce drapeau force le document actif sur le CV et cache le sélecteur CV / Lettre / Entretien.
- **« Retour »** : rouvre le module sans reconstruire son état (`reafficherDecouverteCompetences`) ; si la session du module est perdue (rechargement de la page), `_decouverteRenduEtape` est vide et le bouton ne fait rien (à confirmer dans le navigateur).
- **Cohérence** : cette famille a le seul dernier repère nommé « Mon CV » et la seule barre à 7 repères ; la lettre et l'entretien n'y sont pas proposés (volontaire : on revient par « Reprendre mon CV », F9). C'est un cas d'exception du registre de la piste B, pas une anomalie.
- **Vérifié, pas d'anomalie** : le drapeau persistant `decouverteTerminee` est remis à faux au départ de « Reprendre mon CV » (`data/metiers.js` ligne 6235, `onCta`), qui précède les trois voies, donc aussi la voie 3.

## 3 ter. Mesure dans un vrai navigateur (26/10/2026, états SIMULÉS : `docs/mesures_2026-10-26/matrice_vos_documents.js`, planche `planche_vos_documents.png`)
Méthode : navigateur sans fenêtre (Playwright) sur `serveur_dev.py`, on pose les drapeaux de chaque famille dans `dossier`, on ouvre `resultats` et on relève la barre, le titre H1, les boutons du bas et l'action du « Retour ». Aucune erreur de page sur les 12 essais. **Limite** : états posés à la main, pas des parcours rejoués de bout en bout (cette étape reste à faire).

| Famille | Barre sur « Vos documents » | Titre | Boutons du bas | « Retour » |
|---|---|---|---|---|
| 01 Nouveau, à la main | Objectif > Informations > Parcours > Profil > Documents (5) | Vos documents | Retour / Accueil / **Valider le CV** | `retourPagePrecedente()` |
| 02 Nouveau, avec assistant | idem + Assistant (6) | Vos documents | idem | `retourPagePrecedente()` |
| 03 Récit | Préparer > Assistant > Réponse > Compétences > Compléter > Rédiger mon CV > Mon CV (7) | Vos documents | Retour / Accueil / Valider le CV | `reafficherDecouverteCompetences()` |
| 04 Mettre à jour (maj) | Préparer > Assistant > Réponse > Corriger mon CV > Vos documents | Vos documents | Retour / Accueil / **Continuer** | `retourPagePrecedente()` |
| 05 Reformuler | **identique à 04** (pas la barre de Reformuler) | Vos documents | Continuer | `retourPagePrecedente()` |
| 06 Voie 3 (à la main, reprise) | Déposer > Ma voie > Classer > Vérifier > Vos documents | Vos documents | Valider le CV | `naviguerVers('cv-sans-assistant')` |
| 07 J'ai déjà un CV (lettre) | Préparer > Assistant > Réponse > Vos informations > Vos documents | Ma lettre de motivation rapide | Continuer | `retourPagePrecedente()` |
| 08 Écrire ma lettre | Préparer > Assistant > Rédiger > **Terminé** | Vos documents | **aucun bouton principal** (Retour / Accueil) | `retourPagePrecedente()` |
| 09 M'entraîner à l'entretien | Préparer > Assistant > S'entraîner > **Terminé** | Votre préparation d'entretien | Continuer | `naviguerVers('prepa-entretien')` |
| 10 Un CV, plusieurs métiers | 8 repères (Mon CV, Métiers, Référence, Accroches, Mes CV, Lettres, Fin, Entretiens) | Vos documents | Continuer | `ucpmRetourDepuisEditeur()` |
| 11 Bilan | **ancienne barre à 9 repères** (défilante) | Vos documents | Continuer | `naviguerVers('bilan')` |
| 12 Arrivée directe (import de session, ATS) | **ancienne barre à 9 repères** | Vos documents | Continuer | `retourPagePrecedente()` |

**Constats confirmés par la mesure**
- **C1 confirmé** : Reformuler montre la barre de « Mettre à jour » (famille 05 = 04). Le module Reformuler affiche pourtant « Vérifier » et « Mise en forme » avant.
- **C10 (nouveau)** : le Bilan et l'arrivée directe tombent sur l'ancienne barre à 9 repères (cartes cliquables vers des pages qui n'ont rien à voir avec le parcours), alors que tous les autres parcours ont une barre de module. Ce sont les deux seuls à ne pas avoir de barre cohérente.
- **C11 (nouveau)** : le bouton principal du bas s'appelle « **Valider le CV** » dans les parcours de création et « **Continuer** » dans les autres ; en famille 08 il n'y a **aucun** bouton principal.
- **C12 (nouveau)** : cinq façons différentes de revenir (`retourPagePrecedente`, un `naviguerVers` par module, `reafficherDecouverteCompetences`, `ucpmRetourDepuisEditeur`).
- **C13 (nouveau)** : seul le parcours rapide de la lettre a un titre propre ; la famille 08 (lettre approfondie) s'intitule « Vos documents ».
- Dernier repère : Vos documents (01, 02, 04, 05, 06, 07), Mon CV (03), Terminé (08, 09), Fin / Entretiens (10), aucun (11, 12).

## 3 quater. Parcours rejoués avec de vrais clics (26/10/2026, `docs/mesures_2026-10-26/parcours_retours_et_barres.js`)
- **C7 confirmé** (création à la main ET avec l'assistant) : depuis « Votre profil », un clic réel sur « Retour » mène à **Vos informations** (`projet`) et non à « Votre parcours » (`votre-parcours`).
- **C8 confirmé** : l'intertitre « Ce que l'assistant a repéré chez vous » s'affiche aussi dans le parcours à la main.
- **C14 confirmé (famille 03)** : sans session du module (page rechargée), le « Retour » de « Vos documents » ne fait rien : la page reste « Vos documents ». La personne est bloquée sans message.
- **C1 précisé (famille 05)** : sur les écrans « Votre objectif », « Vos informations », « Votre profil » ET « Vos documents », Reformuler montre la barre de « Mettre à jour » (Préparer, Assistant, Réponse, **Corriger mon CV**, Vos documents) ; le repère « Vérifier » et le repère « Mise en forme » de sa propre barre ne reparaissent jamais après le premier passage dans ces écrans.

**Références anti-régression** : `docs/mesures_2026-10-26/*.REFERENCE.json` (sorties actuelles des deux scripts, reproductibles à l'identique : deux lancements successifs donnent zéro différence). Après chaque changement de code, relancer les deux scripts et comparer avec `diff` : seules les lignes que le changement prévoit doivent bouger.

## 3 quinquies. Les 8 parcours de la carte « Mes documents » rejoués de bout en bout avec de vrais clics (26/10/2026)
Scripts : `docs/mesures_2026-10-26/parcours_reels/` (voir `LISEZMOI.md`). Vrais clics sur les boutons, vraie frappe, vrai presse-papiers pour « Coller la réponse », vrai choix de fichier pour le dépôt ; seules les réponses de l'assistant sont des réponses de test valides (l'assistant lui-même n'est pas appelé). Aucune erreur de page sur aucun parcours. Planche : `docs/mesures_2026-10-26/planche_parcours_reels.png`.

| # | Parcours | Écrans traversés (dans l'ordre) | Où est « Continuer » | Sortie |
|---|---|---|---|---|
| P1 | Créer, à la main | présentation > Objectif > Informations > Parcours (4 questions) > Profil > Documents | barre du bas | « Merci bien, j'ai fini » : retour direct à l'accueil |
| P2 | Créer, avec l'assistant | idem + « L'assistant en ligne » (choix de l'assistant, fenêtre « Avant de continuer », « Je suis de retour », « Coller la réponse », puis **3 clics sur Continuer** dans la même page) > Documents | barre du bas ; en haut de la page, un 2e « Continuer » (`btnContinuerCollage`) | retour direct à l'accueil |
| P3 | Créer, à partir de mon récit | présentation > Préparer (récit, civilité, objectif à **3 cartes**) > Assistant > Réponse > Découverte des compétences > Vos informations > Vos expériences > Style > Assistant (**2e fois**) > Réponse (**2e fois**) > Documents | **dans la page** (sur « Découverte de vos compétences » la barre du bas n'a que Retour et Accueil) | fenêtre « Et maintenant ? » |
| P4 | Reprendre, voie 1 (garder et compléter) | dépôt (fenêtre : coller ou fichier, vérification, masquer les coordonnées, enregistrer) > Préparer (objectif) > Assistant > Réponse > Informations > Profil > **Documents qui rouvre un 2e passage de l'assistant** (Adaptation au métier, choix, collage) > Valider | barre du bas | fenêtre « Et maintenant ? » |
| P5 | Reprendre, voie 2 (reformuler) | dépôt > Préparer > Assistant > Réponse > Vérifier (choix de 1 version sur 2, bouton « Choisir celle-ci ») > Mise en forme (« Récupérer votre CV ») > **Informations > Profil > Documents qui rouvre un 2e passage de l'assistant** | barre du bas ; « C'est bon, passer à la mise en forme » ; « Continuer » dans la page | retour direct à l'accueil, aucune suggestion de lettre |
| P6 | Reprendre, voie 3 (refaire moi-même) | dépôt > Classer > Vérifier > Documents | barre du bas | fenêtre « Et maintenant ? » |
| P7 | Lettre rapide | dépôt > Préparer (objectif) > Assistant > Réponse > Informations > Profil > Documents (« Ma lettre de motivation rapide », 2e passage de l'assistant) > Valider la lettre | barre du bas | retour direct à l'accueil |
| P8 | Entretien rapide | idem P7, « Ma fiche de préparation à l'entretien », sans étape de validation | barre du bas | fenêtre « Merci, tout est en ordre ... toutes les informations de cette session vont être effacées » (Annuler / Terminer) |

**Constats nouveaux, confirmés par les parcours réels**
- **C18 (DÉFAUT, cause identifiée)** : dans « Reprendre mon CV », voie 1, si la personne **colle le texte** de son CV (au lieu de choisir un fichier), `dossier.cvAnalyse` reste faux (`data/metiers.js` : seul le chemin « fichier » le pose, ligne 3458). Après l'import de l'assistant, la personne arrive sur **« Votre parcours »** (4 questions, `route=votre-parcours`) **avec l'ancienne barre à 9 repères** et un « Continuer » grisé, au lieu de « Vos informations » avec la barre du parcours. Avec un fichier : « Vos informations » comme prévu. **Mesuré sur 3 parcours** : voie 1 de « Reprendre mon CV », lettre rapide et entretien rapide (même code `_prepLE`) atterrissent sur « Votre parcours » après un dépôt par texte collé. La voie 2 n'est pas touchée (elle pose `cvAnalyse` elle-même, ligne 7859, vérifié avec un dépôt par texte) ni la voie 3.
- **C1 confirmé en parcours réel (P5)** : après « Mise en forme », la barre passe de « Préparer, Assistant, Réponse, Vérifier, Mise en forme » à « Préparer, Assistant, Réponse, Corriger mon CV, Vos documents ». En plus, la personne traverse **Vos informations, Votre profil, Vos documents**, puis un **2e passage de l'assistant** (« Choisissez votre assistant », « Vos appuis », collage) alors que son CV est déjà reformulé. **À trancher par Denis : ce 2e passage est-il voulu pour la voie 2 ?**
- **C7 et C8 confirmés avec de vrais clics (P1, P2)** : « Retour » de « Votre profil » mène à « Vos informations » (puis un 2e « Retour » à « Votre objectif »), l'intertitre « Ce que l'assistant a repéré chez vous » reste dans le parcours à la main.
- **C14 confirmé (P3)** : « Retour » de « Vos documents » sans session du module ne fait rien.
- **C17 (4 fins différentes)** : (a) retour direct à l'accueil, sans message (P1, P2, P5, P7) ; (b) fenêtre « Et maintenant ? » avec « Voulez-vous préparer votre lettre de motivation ? » (P3, P4, P6) ; (c) fenêtre « Votre parcours est terminé, toutes les informations de cette session vont être effacées » (P8) ; la même action « Merci bien, j'ai fini » ne fait donc pas la même chose selon le parcours. Les suggestions de lettre et d'entretien existent en P1, P2, P3, P4, P6, pas en P5.
- **C19** : « Vos documents » désigne deux choses : l'écran de **préparation de l'assistant** (« Adaptation au métier », choix de l'assistant, collage ; P4, P5, P7, P8) et l'écran **final** (mise en page, export). En création avec l'assistant (P2) la préparation a sa propre page, « L'assistant en ligne ». Même fonction, deux pages différentes, un même titre « Vos documents ».
- **C15** : dans le parcours récit, la carte d'objectif propose 3 choix (offre, spontanée, stage) au lieu de 6 partout ailleurs (dette déjà notée dans `BRIQUES_COMMUNES.md`, Lot 4a).
- **C16** : « Continuer » est parfois dans la barre du bas (P1, P2, P4, P7), parfois dans la page (P3 « Découverte de vos compétences » ; P5 « Choisir celle-ci » et « Continuer » de « Récupérer votre CV »), alors que la règle du 19/10/2026 le place dans la barre.
- **C20** : l'objectif est demandé sur **6 cartes** (création, reprise, rapide), 3 cartes (récit), puis encore une fois (Préparer) dans chaque parcours : la personne qui enchaîne deux parcours le ressaisit à chaque fois.
- **C21** : sur les parcours « Reprendre » (voies 1 et 2) et « rapide », « Vos informations » et « Votre profil » sont deux écrans sous un seul repère de barre (« Corriger mon CV » ou « Vos informations »).
- **C22** : libellés d'export différents : « Télécharger le fichier Word » / « Enregistrer mon CV en PDF » / « Copier le texte » (CV) ; « Télécharger le Word » / « Enregistrer ma lettre en PDF » (lettre) ; « Texte à copier » (entretien).
- **C23** : l'écran du deuxième choix d'assistant redemande à chaque passage « Vos appuis » (lettre de recommandation) et le choix de l'assistant, même quand la personne vient de les renseigner (P3, P4, P5, P7, P8).

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

## 6. État de départ des tests (26/10/2026, cloud, avant toute modification de code)
`npm test` : **2021 essais, 2020 verts, 1 échec** : « Pont : le dossier est le voisin PROSPECTION/donnees/pont du dépôt, à chemin fixe » (le dossier `PROSPECTION` n'existe pas dans ce dépôt cloné). Sans lien avec « Vos documents ». À comparer avec le résultat local de Denis avant toute correction : tout autre échec après un changement serait une régression.
