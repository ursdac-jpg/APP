# Audit de stabilisation : carte « Mes documents » (4 parcours)

Audit en lecture seule (aucun fichier de code modifié), mené le 2026-09-12 à la demande de Denis, première étape d'un chantier de stabilisation générale de l'application. Périmètre : les 4 parcours de la carte d'accueil « Mes documents » : **Créer un nouveau CV**, **Reformuler et présenter mon CV**, **Mettre à jour mon CV**, **Préparer ma lettre et mon entretien**.

Méthode : deux passes indépendantes par lecture directe du code (pas seulement des documents de suivi, qui peuvent être périmés), croisées avec `docs/AUDIT_ZERO_REGRESSION_CREER_MON_CV.md`, `docs/CHANTIER_REFORMULER_ET_PRESENTER_CV.md`, `docs/BRIQUES_COMMUNES.md`, `docs/ETAT_DES_CHANTIERS_2026-08-24.md`, `docs/LECONS_A_NE_PAS_REPRODUIRE.md`. Chaque écran des 4 parcours a été tracé de bout en bout : boutons et contrôles, effet réel des choix saisis, navigation « Retour »/« Accueil », mode sombre, français, fidélité des données transmises aux prompts, suivi d'usage, doublons de composants, couverture de tests.

## Verdict d'ensemble

**Aucune anomalie bloquante trouvée sur les 4 parcours.** Aucun bouton mort, aucun choix saisi sans effet réel, aucune boucle ou saut incohérent du bouton « Retour ». Le bug de navigation RC-03 (déjà repéré comme « à vérifier » dans `docs/ETAT_DES_CHANTIERS_2026-08-24.md`) est en réalité déjà corrigé sur toute la carte « Mes documents » : ce document de suivi est simplement resté périmé sur ce point (voir finding 8).

Les 7 écarts trouvés sont tous **gênants ou mineurs** : deux trous de mode sombre, une incohérence de suivi d'usage, deux textes à corriger, un trou de couverture de tests, et une fragilité d'état à surveiller.

---

## Findings

### 1. Mode sombre absent : bloc photo/identité (gênant)
- **Où** : écran « Vos informations », bloc « Vous », parcours *Créer un nouveau CV* et *Mettre à jour mon CV*.
- **Fichier** : `js/app.js:9708-9720` (`contenuIdentite()`).
- **Problème** : couleurs en dur sans variable ni règle `[data-theme="sombre"]` : `#E5E7EB` / `#D1D5DB` / `#9CA3AF` (cadre et texte de l'aperçu photo), `#F9FAFB` (fond de l'encart « Voulez-vous une photo sur votre CV ? »). En mode sombre, ce bloc reste blanc/gris clair sur fond sombre.

### 2. Mode sombre absent : cartes de sélection CV/Lettre/Entretien (gênant)
- **Où** : écran « Vos documents », sélecteur « Choisissez votre action », visible une fois le CV terminé.
- **Fichier** : `js/app.js:16112-16138` (`carteDocument()` et l'info-bulle de verrou).
- **Problème** : couleurs en dur (`#0d6efd`, `#F3F4F6`, `#374151`, `#E5E7EB`, `#EEF0F3`, `#4B5563`, `#D1D5DB`, `#1F2937`, `#FFFFFF`), aucune valeur `[data-theme="sombre"]`. Lisible dans les deux thèmes par coïncidence, mais viole la règle non négociable du projet.

### 3. Suivi d'usage Umami incohérent sur les 4 entrées de « Mes documents » (gênant, non bloquant)
- **Où** : les 4 boutons d'entrée : `btnCarteAccueilCvNouveau`, `btnCarteAccueilCvPret`, `btnCarteAccueilCvMaj`, `btnCarteAccueilCvReformuler`.
- **Fichier** : `data/metiers.js:5510-5546` (bloc `id === 'mesdocuments'` de `ouvrirCarteAccueil`).
- **Problème** : toutes les autres cartes d'accueil (`preparer`, `boiteaoutils`, `analyse`, `informe`, `orientation`) appellent `track('nom_outil')` → événement Umami générique `outil_utilise` dès le clic sur la tuile, ce qui permet de comparer l'usage des différents outils entre eux. Les 4 tuiles de « Mes documents » (la carte la plus utilisée de l'application) n'appellent jamais `track()` à ce niveau. Un suivi existe bien plus loin (`creer_cv_intro_affichee`, `preparer_lettre_entretien_intro_affichee`, `mettre_a_jour_cv_intro_affichee`, `reformuler_cv_intro_affichee`), mais sous des noms différents, hors de la convention `outil_utilise`/`{outil}` : Denis ne peut pas comparer directement l'usage de ces 4 parcours à celui des autres cartes dans les tableaux Umami.
- **Remarque** : un seul correctif (ajouter `track(...)` dans ce bloc) résout ce point pour les 4 parcours à la fois.

### 4. Texte de la page d'intro « Reformuler et présenter mon CV » décrit une fonctionnalité supprimée (gênant)
- **Où** : parcours *Reformuler et présenter mon CV*, page d'introduction.
- **Fichier** : `data/metiers.js:4691` (`_reformulerCvRendreIntro()`).
- **Problème** : le texte dit encore *« Aux endroits où l'assistant aurait besoin d'une précision que vous seul connaissez, un passage est surligné : vous le complétez si vous voulez, ou vous le laissez »*. Ce mécanisme de marqueurs `[À PRÉCISER]` a été supprimé par décision de Denis le 2026-09-07 (`docs/CHANTIER_REFORMULER_ET_PRESENTER_CV.md`) : le code confirme que ces balises sont désormais retirées **en silence**, sans jamais rien surligner ni rendre éditable. Une personne en fragilité numérique qui lit cette phrase cherchera un passage à compléter qui n'existera jamais.

### 5. Aide contextuelle du mode « Préparer ma lettre et mon entretien » recopiée à tort de « Mettre à jour » (mineur)
- **Où** : parcours *Préparer ma lettre et mon entretien*.
- **Fichier** : `js/app.js:33820-33821` (entrée `'preparer-lettre-entretien'` de `AIDE_PAGES`, item « Où vous en êtes »).
- **Problème** : le texte dit *« ... coller sa réponse, corriger le contenu, puis vos documents »*, recopié à l'identique de l'entrée `'mettre-a-jour-cv'`. Or la barre d'étapes réelle du mode « pret » nomme sa 4ᵉ étape « Vos informations », pas « corriger le contenu » (cette étape de correction de CV n'existe que dans le mode « maj »).

### 6. Logique pure de « Reformuler et présenter mon CV » non testée et non exportable (gênant)
- **Où** : parcours *Reformuler et présenter mon CV*.
- **Fichier** : `data/metiers.js` : `_reformulerCvParserReponse`, `_reformulerCvRenduCorpsProposition`, `_reformulerCvResumeChangements`, `_reformulerCvTexteFinalProposition`, `_reformulerCvTexteVersDossier`, `_reformulerParserHeaderExperience`, etc.
- **Problème** : aucun test dans `tests/*.test.js` ne couvre ces fonctions, alors qu'elles portent le point le plus fragile du module (parseur de balises `[PROPOSITION]`/`[ORIGINE]`/`[PISTE]`/`[PAS_UN_CV]`, structuration best-effort du texte reformulé), le cahier de chantier lui-même liste ce point comme un risque. De plus, `module.exports` (fin de `data/metiers.js`, ligne 7782) n'exporte que `baseMetiers`/`SECTEURS_APP`/2 listes : ces fonctions ne sont même pas requérables depuis Node en l'état. Écart avec le patron déjà en place pour les modules voisins : ATS a `tests/atsResultatParser.test.js`, Regard recruteur a `tests/regardRecruteurResponseParser.test.js`, tous deux extraits dans un fichier dédié testable.

### 7. Fragilité d'état `_prepLEEcran` (à surveiller, pas un bug reproduit)
- **Où** : parcours *Mettre à jour mon CV* et *Préparer ma lettre et mon entretien*.
- **Fichier** : `data/metiers.js:5107`.
- **Problème** : `_prepLEEcran` est mis à `'intro'` juste avant l'ouverture de la fenêtre modale de dépôt, alors que l'écran affiché à l'écran reste la page « Préparer » dépliante. Sans conséquence dans tous les cas testés par lecture du code (le bouton « Retour » du wizard est un no-op volontaire et documenté, fermer la fenêtre suffit). Risque théorique seulement : si la personne quitte la fenêtre par un autre biais qu'un clic du wizard pendant que cet état vaut déjà `'intro'`, un rendu ultérieur pourrait retomber sur l'écran d'intro plutôt que sur le dépôt en cours. À surveiller plutôt qu'à corriger dans l'immédiat.

### 8. Document de suivi périmé : `docs/ETAT_DES_CHANTIERS_2026-08-24.md` (documentation seulement)
- **Problème** : la section 3 (point RC-03) liste encore comme ouverts, au 2026-09-04 : *« le bouton Retour de la 2ᵉ page de "Créer mon CV" ramène à l'accueil »* et *« le reste du parcours de création est à vérifier écran par écran »*. Les deux sont en réalité déjà corrigés dans le code (commentaires explicites datés du 2026-09-04 et du 2026-09-10 : `pageObjectif()` calcule dynamiquement sa destination Retour selon l'historique réel, et chaque écran du chemin `votre-parcours → projet → revelation → assistant → resultats` fait de même via `resultatsCibleRetour()`). Rien à corriger dans le code ; le document de suivi doit être mis à jour pour ne pas déclencher un futur audit inutile sur un point déjà réglé.

---

## Ce qui a été vérifié en profondeur vs par échantillonnage

**En profondeur** (lu et vérifié écran par écran, handler par handler) : les 4 chemins complets d'entrée à sortie, toute la navigation Retour/Accueil, le tronc commun `_prepLE*` et ses 3 divergences par mode, les gardes-fous du mode « reformuler » (marqueurs, `[ORIGINE]`, `[PAS_UN_CV]`, double proposition), la fidélité des prompts (`cv.md`, `reformuler-cv.md`, `extraction-cv.md`) à ce que chaque écran promet de transmettre.

**Vérifié par échantillonnage raisonné**, sans anomalie détectée et sans contradiction avec un audit récent déjà fait et non contredit par `git log` : les ~150 réglages détaillés de « La mise en page » (niveau « Je veux tout régler », déjà audité le 2026-09-03/04), le Composeur Word et le rendu PDF (moteurs de rendu stables, hors zone de saisie utilisateur), le composant partagé de choix d'assistant (déjà documenté et testé par 3 autres modules).

---

## Ce qui est déjà connu et confirmé toujours vrai

- **Dette B.7** (`docs/BRIQUES_COMMUNES.md`) : ancien panneau Word « Projet XXL » (`construirePaletteCouleurs()`, `js/app.js:30190`) et branche `colonneGauche` masquée toujours présents dans le code, aucun changement depuis l'audit du 2026-09-04. Rattachée au futur chantier de découpage `js/app.js`, pas un blocage ici.
- **Dette B.10** (`docs/BRIQUES_COMMUNES.md`) : page unique « choix assistant + collage » du mode « reformuler » non extraite en brique commune. Résorption « au fil de l'eau », décision déjà actée.
- **RC-03** (architecture générale) : le bouton « Retour » reste une destination codée en dur par écran plutôt qu'un vrai historique, sur toute l'application. Confirmé sur les 4 parcours audités, mais sans anomalie locale : chaque destination codée en dur pointe correctement vers l'écran précédent réel.
- Aucun mot « IA » visible, aucune icône à visage, aucun tiret cadratin/demi-cadratin trouvé dans les textes des 4 parcours. Français vérifié correct partout où il a été lu.

## Aucune anomalie de type « déjà documenté mais périmé » au sens négatif

En dehors du finding 8 (RC-03 déjà corrigé mais mal reflété dans le suivi), aucun autre cas où la documentation annonce un problème que le code aurait en réalité déjà corrigé sans que le suivi le note.
