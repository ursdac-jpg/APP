# Chantier de stabilisation : ce qui reste, module par module

Pense-bête pour le test manuel de Denis, module après module. Chaque ligne vient d'un des 6 rapports d'audit (`docs/AUDIT_STABILISATION_*.md`, 2026-09-12/13). Trois statuts possibles :

- **À corriger** : point réel non traité, à appliquer quand tu arrives sur ce module.
- **Dette actée, au fil de l'eau** : déjà décidé de ne pas traiter maintenant (double implémentation, etc.), déjà consignée dans `docs/BRIQUES_COMMUNES.md`. Rappelée ici pour mémoire seulement, rien à faire sauf si tu changes d'avis.
- **Vestige sans action** : code mort documenté comme volontairement gardé par son propre commentaire. Zéro impact, à ignorer sauf nettoyage général futur.

Coche `[x]` au fur et à mesure que tu traites un point pendant ton test du module correspondant.

---

## Décision du 2026-09-13 : rendre la barre d'étapes cliquable partout (point 8)

`barreEtapesModule()` (`js/app.js`) est la barre d'étapes partagée par la quasi-totalité des parcours guidés. Elle retient désormais correctement le point le plus loin jamais atteint (correctif du 2026-09-13, commit `d82ffda`), mais la cliquabilité réelle (sauter directement à une étape déjà passée) dépend d'un réglage à part, `options.routeParIndex`, que chaque parcours doit fournir lui-même. État vérifié le 2026-09-13 :

- **Entièrement cliquable** : Créer un nouveau CV.
- **Partiellement cliquable** (1 seule étape sur toutes) : Mettre à jour mon CV, J'ai déjà un CV (le retour direct vers « Projet » seulement).
- **Purement visuel, aucune étape cliquable** : J'ai déjà un CV (sa propre barre `REFORMULER_CV_NAV_ETAPES`), Préparer ma lettre et mon entretien, Analyser ma candidature (Bilan), Cohérence de mon dossier, Un regard sur mon CV (ex Regard recruteur), ATS, Comparer mes pistes, Comprendre le cadre, Comprendre les chiffres, Découvrir mes compétences.

**Décision de Denis** : viser la cliquabilité complète partout, pour la cohérence (« si c'est cliquable sur un module, ça doit l'être partout »). Contrairement au correctif du point le plus loin atteint (une seule modification, profite à tous les modules d'un coup), rendre un module réellement cliquable demande un `options.routeParIndex` PROPRE à ce module (il faut savoir comment cette page fait correspondre un index d'étape à un écran réel) - donc un travail module par module, pas une seule modification.

**Quand un module ci-dessous arrive dans ton test manuel** : ajoute `options.routeParIndex` à son (ses) appel(s) de `barreEtapesModule()`, sur le même principe que `CREER_CV_NAV_ETAPES` (voir `js/app.js`, fonction `afficherProgression()`) - une fonction qui reçoit l'index de l'étape et renvoie le nom de route/l'action pour y revenir directement. Repère ci-dessous par carte, coché au fur et à mesure.

- [ ] Mettre à jour mon CV (carte 1) : étendre au-delà de la seule étape « Projet ».
- [ ] J'ai déjà un CV / Reformuler et présenter mon CV (carte 1) : sa propre barre `REFORMULER_CV_NAV_ETAPES`.
- [ ] Co-construire ma lettre (carte 2) : `CO_LETTRE_NAV_ETAPES`.
- [ ] Préparer un entretien (carte 2) : `PREPA_ENTRETIEN_NAV_ETAPES`.
- [ ] Un regard sur mon CV (carte 2) : `RR_ETAPES`.
- [ ] Découvrir mes compétences (carte 3) : `DECOUVERTE_NAV_ETAPES`.
- [ ] Analyser ma candidature / Bilan (carte 4) : `BILAN_ETAPES_BARRE`.
- [ ] Cohérence de mon dossier (carte 4) : `CT_ETAPES`.
- [ ] Les mots de votre CV / ATS (carte 4) : `ATS_ETAPES`.
- [ ] Comparer mes pistes (carte 6) : `COMPARER_NAV_ETAPES`.
- [ ] Comprendre le cadre (carte 5) : `COMPRENDRE_LE_CADRE_ETAPES` - à vérifier d'abord si ce module suit un vrai parcours séquentiel (comme les autres) ou plutôt un contenu à parcourir librement (auquel cas la cliquabilité a peut-être moins de sens tel quel, à confirmer avec Denis avant de coder).
- [ ] Comprendre les chiffres (carte 5) : `COMPRENDRE_LES_CHIFFRES_ETAPES` - même vérification préalable que Comprendre le cadre.

---

## Carte 1 : Mes documents

Rien en attente. Les 4 parcours (Créer un nouveau CV, Reformuler et présenter mon CV, Mettre à jour mon CV, Préparer ma lettre et mon entretien) sont passés en revue et corrigés intégralement le 2026-09-12.

- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste au-dessus des cartes) : la barre d'étapes de « Mettre à jour mon CV » n'est cliquable que sur 1 étape, celle de « J'ai déjà un CV / Reformuler et présenter mon CV » ne l'est pas du tout - à étendre au même niveau que « Créer un nouveau CV » (entièrement cliquable).

*Dette actée, au fil de l'eau* : `data/metiers.js` (Reformuler CV), page unique « choix assistant + collage » non extraite en brique commune (`BRIQUES_COMMUNES.md`, dette B.10, résorption seulement si un 3ᵉ module en a besoin).

---

## Carte 2 : Me préparer à candidater

### Co-construire ma lettre
- [ ] **À corriger** : aide contextuelle plus mince que son module jumeau « Préparer ma lettre et mon entretien » (3 sélecteurs génériques contre une entrée par bloc de dépôt). Probablement volontaire à l'origine, mais jamais confirmé comme tel - source : `js/app.js:33853-33860` (entrée `AIDE_PAGES['co-lettre']`).
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`CO_LETTRE_NAV_ETAPES`).

### Préparer un entretien / Regard recruteur / ATS (au sens large de cette carte)
Rien d'autre en attente - tous les autres points du rapport ont été corrigés le 2026-09-12 (transmission du CV/lettre déposés à l'assistant, bouton « Terminé » de Co-lettre, texte d'écran, tirets cadratins de Regard recruteur, mode sombre, tests lettre/entretien).
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barres d'étapes purement visuelles, à rendre cliquables (`PREPA_ENTRETIEN_NAV_ETAPES`, `RR_ETAPES` pour « Un regard sur mon CV »). ATS (`ATS_ETAPES`) suit le même sort, voir Carte 4 ci-dessous.

---

## Carte 3 : Boîte à outils

### Découvrir mes compétences
- [ ] **À corriger** : 5 handlers `onContinuer` devenus morts depuis la fusion des écrans du 2026-08-31 (`etapeAccueil`, `etapeIdentite`, `etapeRecit`, `etapeDecouverte`, `etapeQuestionsCiblees`, dans `modules/decouverte-competences/decouverteParcours.js`). Laissés en l'état volontairement le 2026-09-12 : nettoyage à faible valeur dans un fichier de 5813 lignes, à ne toucher qu'une fois de meilleurs tests en place pour ce module (voir le point tests ci-dessous, en cours de traitement).
- [ ] **À corriger, en cours** : logique pure non testée. 4 des 6 fichiers purs ont maintenant des tests (`decouverteAnalyse.js`, `decouverteClassification.js`, `decouverteStrategie.js`, `decouverteRaffinement.js` - ciblés sur leurs fonctions les plus critiques, pas exhaustif). Restent `decouverteMapping.js` et `decouverteMoteur.js` : lancés dans ce même passage (voir plus bas, statut à mettre à jour une fois fait).
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`DECOUVERTE_NAV_ETAPES`).

### Mes Repères / Mon Carnet
Rien en attente - aide contextuelle corrigée, filet d'annulation harmonisé (demande explicite de Denis), tests ajoutés le 2026-09-12/13.

*Dette actée, au fil de l'eau* : filet d'annulation après suppression dupliqué entre Carnet et Repères (`BRIQUES_COMMUNES.md`, dette B.13, résorption si un 3ᵉ module en a besoin).

### Lexique
Rien en attente - défilement corrigé, tiret cadratin retiré, aide contextuelle à jour, tests ajoutés.

*Dette actée, au fil de l'eau* : `.carte-verrou-tooltip` (écran « Vos documents » de Mes documents, pas le Lexique lui-même) reste une 2ᵉ implémentation de bulle d'info au lieu de la brique partagée `.bulle-info-hover-flottante` (`BRIQUES_COMMUNES.md`, dette B.11).

---

## Carte 4 : Outils d'analyse

### Analyser ma candidature (Bilan)
- [ ] **À corriger** : aide contextuelle ne couvre qu'un tiers du parcours réel (présentation, diagnostic, choix d'assistant seulement - rien sur l'écran « Preparer », le rapport, ni les écrans de correction/assistance/clôture). Déjà documenté comme optionnel pour ce module dans `TACHES_VALIDEES.md`, donc pas un manque caché, mais un vrai écart si un jour tu veux l'étoffer.
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`BILAN_ETAPES_BARRE`).

*Vestige sans action* : `wireChoixAssistantBilanEtapes()` (`js/app.js:17279-17288`), fonction devenue no-op depuis une refonte visuelle, commentaire explicite en tête, gardée volontairement.

### Cohérence de mon dossier
Rien en attente - aide contextuelle de l'écran de collecte réparée le 2026-09-13 (était totalement injoignable).
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`CT_ETAPES`).

*Vestige sans action* : `ctRevenirALaPresentation()` (`modules/coherence-transversale/ui.js:1433`), jamais appelée depuis le correctif du 2026-09-09, commentaire explicite, gardée comme référence du mécanisme.

### Les mots de votre CV (ATS)
Rien en attente - bloc « La référence » qui se refermait, tirets cadratins, pastille `.ats-num` manquante : tous corrigés le 2026-09-13.
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`ATS_ETAPES`).

---

## Carte 5 : Se tenir informé

### Comprendre le cadre
- [ ] **À corriger, en cours** : zéro test automatisé, y compris pour le parseur qui décide si une adresse est vérifiée donc cliquable (mécanisme de sécurité central, LECONS 9.16, 127 fiches en dépendent). Lancé dans ce même passage (voir plus bas, statut à mettre à jour une fois fait).
- [ ] **À corriger** : `AIDE_PAGES['comprendre-les-chiffres']` n'existe pas (voir sous-section suivante) - à traiter ensemble si tu décides un jour d'harmoniser l'aide contextuelle des 2 sous-cartes jumelles de cette carte.
- [ ] **À vérifier puis corriger si pertinent** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle (`COMPRENDRE_LE_CADRE_ETAPES`). Avant de la rendre cliquable comme les autres modules, confirmer que ce module suit un vrai parcours séquentiel (comme Bilan/CV) et pas un contenu à parcourir librement, auquel cas la cliquabilité aurait moins de sens telle quelle.

*Décidé le 2026-09-13* : la promesse « Garder comme Repère » a été retirée du texte de présentation plutôt que développée (aucun bouton de ce type n'existait sur les fiches). Si tu changes d'avis, c'est un vrai développement à refaire sur 127 fiches, pas une simple réactivation.

### Comprendre les chiffres
- [ ] **À corriger, en cours** : zéro test automatisé (parseur « zones/écarts » générique réutilisé 4 fois, calcul de base de graphe LECONS 9.36, calcul de tendance). Lancé dans ce même passage.
- [ ] **À corriger** : `AIDE_PAGES['comprendre-les-chiffres']` n'existe pas, alors que son module jumeau Comprendre le cadre en a une par écran. Pas documenté comme choix assumé (contrairement à ATS/Regard recruteur) - à trancher : ajouter une aide minimale, ou documenter explicitement l'absence comme un choix.
- [ ] **À vérifier puis corriger si pertinent** (ajouté le 2026-09-13) : même vérification préalable que Comprendre le cadre ci-dessus avant de rendre `COMPRENDRE_LES_CHIFFRES_ETAPES` cliquable.

*Dette actée, au fil de l'eau* : la courbe pluriannuelle du chômage est une 4ᵉ implémentation de graphe SVG avec sa propre infobulle (`BRIQUES_COMMUNES.md`, dette B.9, comptage corrigé le 2026-09-13).

---

## Carte 6 : Vous hésitez encore ?

### Comparer mes pistes
- [ ] **À corriger** (ajouté le 2026-09-13, voir la section dédiée juste après l'intro) : barre d'étapes purement visuelle, à rendre cliquable (`COMPARER_NAV_ETAPES`).
- [ ] **À corriger, si tu confirmes que c'est un oubli** : la série de questions « B7 - Statut, droits, aides » prévue au cahier de chantier (`docs/CHANTIER_AIDE_DECISION_ORIENTATION.md` §5, si le fichier existe encore) n'a jamais été implémentée (`COMPARER_BLOC_B` / `comparerRouterBlocB`, `modules/comparer-pistes/index.js`). Rien ne casse (repli propre), mais la série n'est jamais posée à personne. Pas assez d'information pour savoir si c'est un oubli ou une simplification volontaire postérieure au cahier - à trancher avec toi avant de coder quoi que ce soit.

*Décidé le 2026-09-13* : l'écran « Collecter » garde son propre choix d'assistant plutôt que la brique commune B.2 (besoin réellement différent : recherche web obligatoire). Consigné comme dette assumée dans `BRIQUES_COMMUNES.md` (B.14), pas un oubli.

---

## Suivi des tests lancés le 2026-09-13 (en cours)

- [x] `modules/comprendre-le-cadre/index.js` : ajouter `module.exports` + `tests/comprendreLeCadreLogique.test.js`, au minimum les parseurs de sécurité (`_comprendreLeCadreParserFiche`, `_comprendreLeCadreParserLiensVerifies`, `_comprendreLeCadreParserLigneStructure`, `_comprendreLeCadreDateFr`). Fait le 2026-09-13, 16 tests.
- [x] `modules/comprendre-les-chiffres/index.js` : ajouter `module.exports` + `tests/comprendreLesChiffresLogique.test.js`, au minimum le parseur générique « zones/écarts » (réutilisé 4 fois) et le calcul de base de graphe (LECONS 9.36). Fait le 2026-09-13, 19 tests (parseur zones d'emploi, rendu écarts générique, graphe, tendance).
- [x] `modules/decouverte-competences/decouverteMapping.js` : ajouter `module.exports` + tests, mapping des fragments validés vers le dossier. Fait le 2026-09-13, 18 tests.
- [x] `modules/decouverte-competences/decouverteMoteur.js` : orchestrateur try/catch autour des autres fichiers - couverture plus légère attendue (peu de logique propre), à confirmer une fois les 2 fichiers ci-dessus faits. Fait le 2026-09-13, 17 tests (comportement d'orchestration : traçage, catch centralisé, copie du journal), fonctions encapsulées remplacées par des doublures de test plutôt que les vrais modules déjà testés ailleurs.

Les 4 lignes ci-dessus sont cochées : `npm test` passe de 854 à 924 tests verts. Le nettoyage du code mort de Découverte (carte 3 ci-dessus, les 5 handlers `onContinuer`) redevient raisonnable à faire - toujours pas fait, en attente que Denis en decide au moment de tester ce module.
