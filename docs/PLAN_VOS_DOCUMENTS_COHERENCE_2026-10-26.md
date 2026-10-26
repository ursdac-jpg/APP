# Plan détaillé : cohérence de « Vos documents » (26/10/2026)

Cahier d'audit : `docs/CHANTIER_VOS_DOCUMENTS_COHERENCE_2026-10-26.md` (constats C1 à C14, mesures). Ce plan en tire des lots à exécuter dans l'ordre, chacun avec son effort, son périmètre, sa preuve de non-régression et **où il se fait** (cloud ou local).

**Règle de non-régression commune à tous les lots** (exigence de Denis : aucune régression)
1. Avant le lot : `npm test` (état de départ : 2021 essais, 2020 verts, 1 échec connu sur `PROSPECTION`), puis les deux scripts de `docs/mesures_2026-10-26/` sont relancés et comparés aux fichiers `*.REFERENCE.json` (`diff`).
2. Grep sur tout le dépôt (`js/`, `data/`, `modules/`, `tests/`, `scripts/`) de chaque fonction partagée touchée, avant de la modifier : `pageResultats`, `afficherProgression`, `resultatsCibleRetour`, `barreEtapesModule`, `barreNavigation`, `pageRevelation`, `_creerCvNavIndex`.
3. Un commit par sous-étape. Après chacune : `npm test` (même résultat que le départ), les deux scripts de mesure, `diff` : **seules les lignes prévues par la sous-étape ont changé**, sinon retour arrière du commit.
4. Changement le plus étroit possible : ajouter une condition propre à la famille concernée plutôt que modifier une branche partagée.
5. Une ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` dans le même commit pour tout changement visible.
6. Essai réel de Denis (liste donnée à la fin de chaque lot) avant de fusionner dans `master`.

## Lot 1 : trois corrections ciblées de « Créer un nouveau CV » (effort bas)
Défauts trouvés pendant l'audit, corrigés dans le même passage (règle du 2026-09-12). Aucun choix d'interface à trancher.
- **1a. « Retour » de « Votre profil »** (C7). Fichier : `js/app.js`, `pageRevelation` (la barre du bas passe `'projet'` en dur). Cible : `'votre-parcours'` quand `dossier.modeCreation === 'nouveau'` et `!dossier.cvAnalyse` (même condition que la navigation vers l'avant de `pageProjet`), `'projet'` pour tous les autres modes (maj, pret, reformuler, voie 3, un CV plusieurs métiers). Réserve : la garde anti-boucle de `naviguerVers` (`js/app.js` autour de la ligne 4176, `_pageOrigineAvantProjet`) exclut déjà `votre-parcours` ; vérifier à la main qu'il n'y a pas de boucle « Retour, Retour ». Preuve : `parcours_retours_et_barres.js` (la ligne `retourVa` de A-main et A-assistant passe de `projet` à `votre-parcours`, rien d'autre ne bouge) + un essai « Retour » deux fois de suite.
- **1b. Intertitre trompeur** (C8). `js/app.js`, `pageRevelation` : « Ce que l'assistant a repéré chez vous » reste tel quel avec l'assistant ; sans assistant (`_creerCvSansAssistant()`), texte neutre proposé : « Ce qui ressort de ce que vous avez saisi ». Texte à faire valider par Denis (public fragile, jamais le mot IA). Preuve : le script (liste `intertitres`).
- **1c. « Retour » du récit sans session** (C14). `data/metiers.js` / `modules/decouverte-competences/decouverteParcours.js`, `reafficherDecouverteCompetences` : quand la session du module n'existe plus (`_decouverteRenduEtape` vide), au lieu de ne rien faire, ouvrir la présentation du parcours (`decouverte-intro`) ou la page `creer-cv`. Preuve : ligne B-recit-retour du script (la route change de `resultats` à la route prévue).
- **Où** : cloud possible (code + `npm test` + scripts), puis essai de Denis en local sur la branche.
- **Essai de Denis** : créer un CV à la main jusqu'à « Votre profil », cliquer deux fois « Retour » (on doit revoir « Votre parcours » puis « Vos informations ») ; relire le nouvel intertitre.

## Lot 2 : la barre de Reformuler (effort moyen, une décision à trancher)
- **Constat** (C1) : Reformuler a sa barre à 5 repères (Préparer, Assistant, Réponse, Vérifier, Mise en forme) mais, après « Vérifier », les écrans objectif, informations, profil et « Vos documents » affichent la barre de « Mettre à jour » à cause de `dossier.modeCreation = 'maj'` posé par `data/metiers.js` ligne 7858.
- **Décision de Denis à prendre (avec maquette)** : quels repères de la barre de Reformuler pour ces écrans ? Reco : garder la barre de Reformuler partout, avec « Vérifier » sur les écrans de correction (objectif, informations, profil) et « Mise en forme » sur « Vos documents ».
- **Mise en œuvre** : dans `afficherProgression` (`js/app.js` ligne 3920 environ), une branche **avant** celle de `pret/maj`, conditionnée par `dossier._origineReformuler`, qui réutilise `REFORMULER_CV_NAV_ETAPES` et sa table d'index. Aucune autre famille touchée. Préserver le clic sur les repères (`routeParIndex`).
- **Preuve** : ligne 05 de `matrice_vos_documents.js` et ligne C de `parcours_retours_et_barres.js` changent, les 11 autres lignes restent identiques.
- **Où** : décision + maquette en local avec Denis ; code possible dans le cloud ensuite.

## Lot 3 : le Bilan et l'arrivée directe sans barre de parcours (effort moyen, décision à trancher)
- **Constat** (C10) : Bilan et arrivée directe (import de session, « Les mots de votre CV ») affichent l'ancienne barre à 9 repères, avec des repères cliquables vers des pages étrangères au parcours.
- **Décision de Denis (maquette)** : (a) barre neutre à un seul repère « Vos documents » ; (b) pas de barre, seulement un titre ; (c) barre propre au Bilan. Reco : (b), le plus simple et sans promesse de parcours.
- **Avant de coder** : auditer tous les chemins qui y arrivent (grep `_importVersResultats`, `_pageOrigineAvantResultats === 'bilan'`, `modules/ats/index.js` ligne 945) et le cas où `modeCreation` est vide.
- **Preuve** : lignes 11 et 12 de la matrice changent seules.

## Lot 4 : vocabulaire commun de la page (effort moyen, décisions à trancher)
- **4a. Dernier repère** (C : cinq noms). Décider un vocabulaire : « Vos documents » partout sauf lettre et entretien (« Terminé », voulu par B.36) ? À trancher avec la maquette.
- **4b. Bouton principal** (C11) : « Valider le CV » en création, « Continuer » ailleurs ; le règlement du 25/10/2026 garde « Valider » pour ce qui valide. À confirmer que c'est voulu pour la voie 3 et le récit ; **la famille 08 n'a aucun bouton principal : à auditer** (dans `pageResultats`, chercher pourquoi `venantDeCoLettre` le retire) avant de décider.
- **4c. Titre de page** (C13) : un titre par document (CV, lettre, entretien) comme le parcours rapide de la lettre. À valider.
- **Où** : audit et maquette en local avec Denis ; code ensuite.

## Lot 5 : le « Retour » unifié et le registre des familles (effort haut, après les lots 1 à 4)
- **Constat** (C12) : cinq mécanismes de « Retour » et dix branches dans `pageResultats` / `afficherProgression`.
- **Piste** : un registre `famille -> { signal, barre, titre, retour, boutons }` lu par `pageResultats`, `afficherProgression` et `resultatsCibleRetour`. **Non apte au mode Nuit.** Maquette, plan en cases, migration famille par famille (une famille par commit), la matrice de référence prouvant que rien d'autre ne bouge.
- **Verdict provisoire** : GO AVEC RÉSERVES. Ne démarrer qu'après les lots 1 à 4, qui réduisent déjà le nombre de cas.
- **Où** : conception en local avec Denis ; la migration famille par famille peut se faire dans le cloud avec la matrice comme filet.

## Lot 6 : rejouer les parcours complets de bout en bout (effort moyen, avant le lot 5)
Les mesures actuelles posent l'état à la main. Rejouer, avec de vraies saisies et `scripts/parcours/parcours_smoke.js`, les trois parcours de création, « Reprendre mon CV » (trois voies), « J'ai déjà un CV », la lettre, l'entretien, « Un CV, plusieurs métiers », le Bilan. Objectif : ajouter à la matrice les écrans intermédiaires et les sorties réelles. **Où** : local (outil d'aperçu), parce que ce sont les essais déjà conçus pour lui.

## Répartition cloud / local
| Lot | Cloud | Local |
|---|---|---|
| 1 corrections ciblées | code, tests, scripts de mesure | essai de Denis, fusion |
| 2 barre de Reformuler | code après décision | décision, maquette, essai |
| 3 Bilan et arrivée directe | audit des chemins, code après décision | décision, maquette, essai |
| 4 vocabulaire | audit de la famille 08 | décisions, maquette |
| 5 registre | migration par famille avec la matrice | conception, maquette, essais |
| 6 parcours de bout en bout | non (pas d'outil d'aperçu) | tout |

## Ce que je ne peux pas vérifier dans le cloud
Le ressenti visuel, la lisibilité pour le public cible, le vrai presse-papiers et la vraie ouverture de l'assistant, les parcours réels avec des données de Denis. Tout cela reste à son essai.
