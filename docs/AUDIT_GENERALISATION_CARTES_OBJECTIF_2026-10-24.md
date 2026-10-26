# Audit : généraliser la logique des cartes d'objectif de la lettre aux autres modules (lot E1, 24/10/2026)

Demande de Denis : le chemin de la lettre (cartes d'objectif, offre sans offre = spontanée, spontanée explicite, domaine avec intitulé, changer de métier, formule d'appel) est cohérent et comble les trous ; il doit être repris partout où les cartes d'objectif existent, **le CV d'abord**, qui a encore l'ancienne architecture (amalgame offre / spontanée). Audit du code réel, rien de codé.

## 1. Où les cartes d'objectif existent aujourd'hui

| Écran | Fonctions utilisées | État |
|---|---|---|
| **Écrire ma lettre avec l'assistant** (page « Préparer ») | `contenuModeRecherche(false, { modeUnifie: true, formeCandidature })`, `contenuCandidature(true)` pour stage, alternance, immersion, formation | **Logique unifiée** (étapes c1 à c5, décisions 54 à 59 du cahier) |
| **« Votre objectif »** (module « Mon projet », chemin du CV) `pageObjectif()` | `OBJECTIF_CHOIX_CANDIDATURE` + deux blocs repliables `blocERIP(CONFIG_BLOC_CANDIDATURE)` et `blocERIP(CONFIG_BLOC_PROJET)` ; `wireBlocERIP` | **Ancien chemin** : le CV passe ici |
| **Fenêtre « Candidature » du Bilan** `bilanOuvrirFenetreCandidature()` | `contenuModeRecherche(true)` ou `contenuCandidature()` | Ancien chemin, partagé avec Cohérence transversale (`bilanCorpsCiblageOffreHTML`) |
| **« Préparer l'entretien »** (page `_prepaEntretien…`, `data/metiers.js`) | `contenuModeRecherche()` / `contenuCandidature(true)` | Ancien chemin, **même squelette que la page de la lettre** |
| **Découvrir mes compétences** | sous-ensemble de cartes (`CARTES_OBJECTIF_DECOUVERTE`) | Parcours à part, 8 lectures de `dossier.objectif` |
| Reformuler, « Un CV, plusieurs métiers » | champs à eux (`reformulerPoste`, `reformulerSecteur`, page de référence) | Pas de cartes d'objectif : **hors sujet pour l'instant** |

Les données sont déjà partagées : `dossier.objectif`, `modeRecherche`, `typeRecherche`, `rechercheCandidature`, `secteurCible`, `intituleDomaine`. **82 lectures de `dossier.objectif` dans `js/app.js` et 38 dans `data/metiers.js`** : le sens d'un objectif ne doit donc pas changer, seul l'écran qui le recueille.

## 2. Ce que la lettre a de plus (à reprendre)

1. **Offre sans offre = candidature spontanée** (`aUneOffreLettreCo`, `situationReelleLettreCo`, message visible).
2. **Spontanée à deux choix** (de façon générale / entreprise précise) et **« Changer de métier » à trois choix** (`formeCandidatureLettreCo`).
3. **Domaine avec intitulé** choisi dans une liste (`data/secteurs.js`), ou écrit (jeton « Écrire mon intitulé »), avec l'intitulé retenu affiché.
4. **Remise à zéro quand on change de carte** (`changementCarteEffaceLettreCo`), pour éviter les contradictions.
5. **Champs de l'entreprise démarqués**, titres plus grands et icônes (lot B).
6. **Règles de blocage lisibles** (`raisonsBlocageLettreCo`), phrase visible sous le bouton.
7. **Disponibilités** (contrat, temps de travail, début, horaires) pour la spontanée et « Changer de métier ».

## 3. Ce qui est simple, risqué, bloquant

**Simple (reprise de l'existant)**
- Presque toute la logique est déjà **derrière un paramètre** (`modeUnifie`) et dans des **fonctions pures testées** (`modules/lettre-core/*`) : l'activer sur un autre écran ne copie rien.
- **Préparer l'entretien** : même squelette que la lettre (blocs numérotés, `contenuModeRecherche`, `wireModeRecherche`). Bascule quasi directe.

**Risqué (à traiter avec un plan)**
- **Où vit « la forme » choisie** : `_coLettreFormeChoisie` et `_coLettreFormeCandidature()` sont des **variables de la page de la lettre** (`data/metiers.js`), pas des données du dossier. Pour les partager, la forme doit devenir **une donnée du dossier** (ou être déduite sans ambiguïté) : à faire d'abord, avec ses tests.
- **Le CV a deux blocs repliables** (« Candidature » et « Le poste que vous visez », `blocERIP`) et un contrat « Passer à l'action » (`verifierAvantPasserAction`, blocage de la suite). La lettre a un seul bloc. Fondre les deux demande **une maquette** (Mode A, doute d'interface).
- **Le Bilan et Cohérence partagent** `bilanCorpsCiblageOffreHTML` : toute bascule doit rester derrière un paramètre, comme `_ciblageDemarque` aujourd'hui (grep sur tout le dépôt avant chaque pas).
- **Le CV n'a pas besoin de tout** : pas de destinataire ni de service ; l'intitulé du domaine sert au titre du CV ; les disponibilités existent déjà dans « Mon projet ». Ce sont **les particularités CV / lettre à regarder ensemble** (Denis).

**Bloquant : aucun.** Aucun point ne dépasse ce qui peut être codé et maintenu.

## 4. Plan proposé (un écran à la fois, jamais en une fois)

| Pas | Contenu | Effort | Maquette ? |
|---|---|---|---|
| **E1.0 (FAIT 24/10/2026)** | « La forme de candidature » devient une donnée du dossier (déduite ou enregistrée), lue par la lettre ; tests | moyen | non |
| **E1.1 (FAIT 24/10/2026)** | **Préparer l'entretien** passe en mode unifié (même page que la lettre) ; essai navigateur | moyen | non (même écran) |
| **E1.2 (CODÉ 24/10/2026)** | **Fenêtre Candidature du Bilan** et Cohérence : mode unifié derrière paramètre, un écran à la fois | moyen | légère |
| **E1.3 (CODÉ 24/10/2026)** | **« Votre objectif » du CV** : fusion des deux blocs, mêmes cartes, mêmes questions ; garder « Passer à l'action » | **haut** | **oui, obligatoire** |
| **E1.4 (CODÉ 24/10/2026)** | Découverte : vérifier la cohérence des cartes retenues | bas | non |
| **E1.5 (CODÉ 24/10/2026)** | Brancher le profil des prompts et le type de CV sur `situationReelleLettreCo` (offre sans offre = spontanée) | moyen | non |

## 5. Questions pour Denis

1. **Ordre** : E1.0 puis E1.1 (entretien, le plus proche de la lettre), puis E1.3 (le CV, avec maquette). Le Bilan (E1.2) après le CV ? **Recommandé : oui**, parce que le CV est ce qui te gêne le plus.
2. **Le CV garde-t-il deux blocs** (« Candidature » puis « Le poste que vous visez »), ou **un seul écran comme la lettre** ? À trancher sur la maquette E1.3 ; **recommandé** : un seul écran, comme la lettre, puisque c'est ce qui a comblé les trous.

## 6. Réalisé le 24/10/2026

- **E1.0** : `dossier.formeChoisie` (donnée du dossier, remise à zéro avec le dossier) et `formeCandidatureActuelle()` (`js/app.js`) remplacent la variable de la page de la lettre.
- **E1.1** : « Préparer l'entretien » utilise `contenuModeRecherche(false, { modeUnifie: true, sansDisponibilites: true, formeCandidature })` (nouvelle option `sansDisponibilites`), la remise à zéro au changement de carte et la mémorisation de la forme. Vérifié au navigateur (champs démarqués, message « sans offre », deux choix de la spontanée, pas de disponibilités, remise à zéro). Les règles de blocage propres à l'entretien n'ont pas changé.

- **E1.3, maquette faite le 24/10/2026** : `docs/MAQUETTE_OBJECTIF_CV_UNIFIE_2026-10-24.html` : « Votre objectif » du CV en un seul écran en trois parties (1 type de candidature, 2 votre candidature avec la logique de la lettre, 3 le poste recherché : contrat, temps de travail, horaires), résumé en bas, « Continuer » dans la barre du bas grisé avec la raison. Audit : les deux blocs actuels sont `CONFIG_BLOC_CANDIDATURE` (recommandé) et `CONFIG_BLOC_PROJET` (facultatif), tous deux ouverts d'emblée, avec « En résumé » (`resumeObjectifLigne`). Stage, alternance, immersion, formation gardent leur écran. Trois questions posées à Denis. Rien n'est codé.

- **E1.3 codé le 24/10/2026** : `pageObjectif()` (`js/app.js`) : pour offre, spontanée et changer de métier, un seul écran (partie 2 « Votre candidature » en logique unifiée, partie 3 = `CONFIG_BLOC_PROJET` conservé), `raisonsBlocageObjectifCV()` (mêmes règles que la lettre sans le CV ni la situation), « Continuer » grisé avec la raison visible, remise à zéro au changement de carte, mémorisation de la forme. Stage, alternance, immersion et formation inchangés. **Écart avec la maquette** : l'entreprise n'est pas exigée pour « Répondre à une offre » (règle de la lettre, inchangée). Vérifié au navigateur (cartes, champs démarqués, raisons, deux choix de la spontanée, stage inchangé).
- **Demande de Denis (24/10/2026) à étudier : s'appuyer sur des lettres de recommandation pour le CV** (compétences, vocabulaire du métier et du poste), comme pour la lettre : voir `docs/LISTE_RETOURS_DENIS_LETTRE_2026-10-24.md`, lot E.
- **E1.2 codé le 24/10/2026** : fenêtre « Candidature » du Bilan (`bilanOuvrirFenetreCandidature`) et panneau partagé `htmlPanneauCandidaturePartage` (option `modeUnifie`, drapeau `_panneauModeUnifie`, `contenuModeRecherchePanneau`) pour la page « Préparer » du Bilan et la collecte de Cohérence ; ATS, Regard recruteur et Reformuler gardent leur rendu (paramètre absent). Pour offre, spontanée et changer de métier seulement ; sans disponibilités (déjà dans « Mon projet »). La forme (offre / entreprise précise) est mémorisée par `memoriserFormeCandidatureAuClic`. Vérifié : rendu comparé ancien/nouveau au navigateur, 1983 tests ; **pas testé de bout en bout avec un vrai parcours Bilan ni Cohérence** (essai de Denis à prévoir), et les règles de blocage de la lettre ne sont pas reprises (le Bilan n'a pas de bouton bloqué ici).
- **E1.4 codé le 24/10/2026** : Découverte (cartes offre, spontanée, stage) utilise le panneau partagé en mode unifié (`htmlPanneauCandidaturePartage({ modeUnifie: true })` et `wirePanneauCandidaturePartage`) : offre sans offre = spontanée, mêmes champs que la lettre ; stage inchangé. Le CV de Découverte étant fait de zéro, aucune autre lecture de `dossier.objectif` n'est touchée.
- **E1.5 codé le 24/10/2026** : `objectifPourPrompts()` (`js/app.js`, appuyée sur `situationReelleLettreCo`) : la ligne « Objectif », la ligne directrice et le contexte de situation des prompts disent « spontanée » quand la carte « offre » n'a ni texte ni lien d'offre. Le type de CV (général ou spécifique) dépend du type de recherche (métier ou domaine), pas de l'offre : inchangé volontairement. Vérifié au navigateur (offre sans offre, avec offre, spontanée, stage) ; essai réel de Découverte à faire par Denis.
