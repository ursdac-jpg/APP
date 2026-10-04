# Chantier : rubrique "Expérience personnelle" (mode de présentation + fusion savoir-faire perso/engagements)

Cahier de reprise. À lire en entier avant de continuer ce chantier, quel que soit le compte Claude qui reprend.

---

## État au 2026-09-27 (nuit), en 3 lignes

Phase 1 (mode de présentation Chronologique/Mixte/Par compétences) : **faite, testée, commitée** (`8c014ff`).
Phase 2 (missions IA pour les engagements, même comportement que le savoir-faire personnel) : **faite, testée, commitée** (`4b39a06`).
Maquette du panneau corrigée pour supprimer la distinction de source : **faite, commitée** (`ef3f059`).
Carte de réglages "Expérience personnelle" dans le panneau : **faite, testée en direct (clair + sombre), commitée** (`0d5050b`).

**Le chantier "Expérience personnelle" est terminé.** Seule limite mineure connue, non bloquante : le bouton "Modifier dans Vos informations" navigue vers la bonne page mais n'ouvre pas encore automatiquement le bon bloc (`etatBlocsERIPOuverts` semble réinitialisé par `naviguerVers('projet')` après coup - à reprendre si Denis le juge gênant à l'usage réel, pas avant).

Prochain chantier, déjà cadré par Denis : le même traitement pour la rubrique "Formations" (voir `docs/CHANTIER_CORRECTIONS_MISE_EN_PAGE_P1_P12_2026-09-27.md`, section "Prochaine étape").

---

## Origine de ce chantier

Grosse discussion avec Denis le 2026-09-27 sur deux sujets imbriqués :

1. **"Mode de présentation" du CV** (Chronologique / Mixte / Par compétences) : le moteur existait déjà partiellement (`composeurStrategies.js`) mais son effet réel sur le rendu était quasi nul. Denis a fixé une règle non négociable : **les noms de rubriques ne changent jamais selon le mode**, sauf "Compétences en action" qui est une rubrique à part entière, qui n'existe QUE en mode Mixte.
2. **Nouvelle rubrique CV "Expérience personnelle"** (déjà existante dans le rendu sous le nom `blocEngagements()`, mais sans panneau de réglages) : combine `dossier.experiencesPerso` (savoir-faire personnel) et `dossier.engagements` (bénévolat/associatif). Denis a demandé, en cours de discussion, que les deux sources aient **rigoureusement le même comportement** - y compris des missions rédigées par l'assistant pour CHAQUE engagement (pas seulement le savoir-faire personnel).

Message clé de Denis (2026-09-27, retranscrit) : *"je veux aussi des missions pour engagement... les deux vont devoir avoir le même comportement... on ne puisse pas faire la différence entre quelle est la source de cette expérience, quel est engagement ou quel est savoir-faire personnel, parce que les deux en fait vont nourrir le même bloc."*

Puis : *"Je vais te lancer en mode nuit... avec toutes ces informations, sachant que tu as tout ce qu'il faut."*

---

## Ce qui existait DÉJÀ avant cette nuit (découvert par audit, pas supposé)

Avant de coder quoi que ce soit, un audit du code réel a montré que l'infrastructure était **beaucoup plus avancée que prévu** (probablement construite par l'autre compte Claude lors d'un chantier antérieur "exp perso", phases 1 à 6, jamais documenté dans un `CHANTIER_*.md` dédié) :

- **Rendu PDF** (`modules/cv-pdf-html/cvPdfTemplateMaquette.js`, fonction `blocEngagements()`) : rubrique "Expérience personnelle" (`_PDF_INTITULES.experiencePerso`) DÉJÀ codée, combine `experiencesPersonnelles` + `engagements`, affiche les missions de façon générique (`missionsHtml(item.missions, ...)`) pour n'importe quel type d'item.
- **Rendu Word** (`modules/cv-composeur/composeurRender.js`, ~ligne 1607-1756) : même fusion, avec gestion des dates alignées à droite, réduction de police, mode Condensé - commentaires explicites "chantier exp perso, Phase 4/5".
- **Schéma de données** (`docs/SCHEMA_CV.md`, `prompts/extraction-cv.md`) : `engagements[].missions` déjà documenté et déjà lu à l'import d'un CV existant.
- **Décision automatique** (`modules/cv-core/moteurDecisionCV.js`) : un mécanisme de repli existait déjà - si `experiencePersonnelleAMettreEnAvant` (UNE SEULE expérience personnelle choisie par l'assistant, cv.md point 13) correspond à un engagement plutôt qu'à un `experiencesPerso`, ses missions étaient déjà attachées à cet engagement.

**Ce qui manquait réellement** : le prompt (`cv.md`) ne générait des missions QUE pour cette seule expérience prioritaire (point 13) - jamais pour tous les engagements. Et surtout, **aucune carte de réglages** n'existait dans `cvPdfPanneauReglages.js` pour piloter cette rubrique (visibilité, nombre de missions par item, etc.).

Leçon pour la suite : **toujours grep avant de supposer qu'une fonctionnalité est absente** - un audit rapide a évité de reconstruire un mécanisme déjà robuste.

---

## Phase 1 - Mode de présentation (FAITE, commit `8c014ff`)

- `modules/cv-composeur/composeurComposition.js` : le mode dégradé de `competencesGroupees` part désormais des MISSIONS (phrases d'action), pas des mots-compétences bruts. Déduplication insensible aux accents, classement par pertinence au métier ciblé (réutilise `metierParNom()`/`correspond()`), plafonné à `capacites.competences`.
- `modules/cv-pdf-html/cvPdfTemplateMaquette.js` :
  - `_PDF_INTITULES.competencesEnAction = 'Compétences en action'` : rubrique supplémentaire, UNIQUEMENT en mode Mixte (`opts.modePresentation === 'B'`), à côté de "Compétences professionnelles" qui reste inchangée dans ce mode.
  - "Parcours professionnel" renommé en "Expérience professionnelle" partout, y compris en mode Par compétences (avant, ce mode changeait le nom de la rubrique - interdit par la règle de Denis du point 17 du 2026-09-26).
- Testé en direct sur les 3 modes (Chronologique/Par compétences/Mixte), résultats conformes à la spécification finale de Denis.
- **Point laissé ouvert et validé par Denis (option A recommandée dans les deux cas)** :
  1. Pas de déduplication entre "Compétences en action" (missions) et "Compétences professionnelles" (pastilles) en mode Mixte - chevauchement de sens possible mais aucun texte dupliqué mot pour mot. Denis a validé de laisser tel quel.
  2. "Expérience professionnelle" reste détaillée (avec missions) en mode Mixte, comme en Chronologique - jamais compactée. Denis a validé.

## Phase 2 - Missions IA pour les engagements (FAITE, commit `4b39a06`)

- `prompts/cv.md` : nouveau point 17 - l'assistant rédige 2 à 3 missions pour **chaque** engagement du profil (contrairement au point 13, qui ne choisit qu'UNE SEULE expérience personnelle prioritaire parmi toutes les sources). Nouveau champ JSON `engagementsAvecMissions: [{texte, missions, justification}]`. Ajouté comme 7e exception à la section "Consignes de fiabilité".
- `js/app.js` :
  - `normaliserEngagementsAvecMissionsIA()` (miroir exact de `normaliserSavoirFaireParExperienceIA()`).
  - État par défaut : `dossier.ia.cv.recommandations.engagementsAvecMissions` / `...Proposees`.
  - Écran de revue ("Choisissez ce que l'assistant propose" → onglet "Formation, expérience perso & loisir") : nouvelle carte "Missions de vos engagements", une entrée par engagement, réutilise `_rendreBlocRecoAvecMissions()` **sans aucun code de câblage supplémentaire** (le câblage générique de `wireEcranChoixReponseIACV()` s'applique automatiquement dès que la clé est ajoutée à `LISTES_BROUILLON`).
  - `creerBrouillonChoixIACV()` / `appliquerBrouillonChoixIACV()` : conversion aller-retour avec pool complet (jamais perdre un décochage), même principe que `savoirFaireParExperience`.
- `modules/cv-core/moteurDecisionCV.js` : nouvelle application non destructive - pour chaque entrée de `reco.engagementsAvecMissions`, rapprochement flou (`correspond()`) avec `objetDecide.engagements[i].texte`, missions attachées. Appliquée APRÈS le repli existant (point 13), donc prioritaire si les deux visent le même engagement.
- **Aucun changement nécessaire côté rendu** (PDF et Word géraient déjà `engagements[].missions` de façon générique, voir section précédente).
- Testé en direct de bout en bout : import d'une fausse réponse JSON (via "Coller manuellement" dans le vrai écran d'import, pas juste en console) → carte "Missions de vos engagements" affichée avec cases à cocher → "Je valide ces choix" → `dossier.ia.cv.recommandations.engagementsAvecMissions` correctement enregistré → `appliquerMoteurDecisionCV()` attache bien les missions à l'engagement (vérifié par appel direct en console).
- `npm test` : 1018/1018 vert après chaque commit.

---

## Phase 3 - Carte de réglages "Expérience personnelle" (FAITE, commit `0d5050b`)

Historique de conception ci-dessous (contexte, point bloquant résolu, fichiers identifiés) - la carte est terminée, testée et commitée. Détail technique complet dans le message du commit `0d5050b`.

### Contexte

Une maquette existe déjà et a été montrée à Denis le 2026-09-27 : `docs/MAQUETTE_EXPERIENCE_PERSONNELLE_2026-09-27.html` (committée, envoyée par `SendUserFile`). Elle montre une carte de réglages positionnée juste après "Formations" dans le panneau "La mise en page", avec :
- Un rappel des sources ("2 savoir-faire personnels", "1 engagement") avec bouton vers "Vos informations" (jamais de saisie dans ce panneau).
- Un choix "Toutes les expériences" / "Les plus pertinentes".
- Une liste à cocher par item, avec un badge `tag-source` (bleu "Savoir-faire perso" / orange "Engagement") et un compteur de missions (`-`/`+`) **uniquement pour les savoir-faire personnels** - un engagement y était affiché comme "Texte simple, pas de missions".

### Point bloquant : la maquette est maintenant PÉRIMÉE sur un point précis

Denis a tranché APRÈS cette maquette (même journée, message "je veux aussi des missions pour engagement") que les engagements doivent avoir EXACTEMENT le même comportement que le savoir-faire personnel - donc :
- Le badge `tag-source` qui distingue visuellement les deux sources devient contraire à la consigne ("on ne puisse pas faire la différence entre quelle est la source").
- Le compteur de missions doit s'appliquer aux DEUX types d'item, pas seulement au savoir-faire personnel.
- La ligne "Texte simple, pas de missions" pour un engagement n'a plus lieu d'être.

**Avant de coder cette carte, la maquette doit être mise à jour pour refléter cette unification**, puis, si le doute persiste sur un point précis de présentation (ex. faut-il fusionner visuellement les 2 encarts de rappel de sources en un seul ?), redemander confirmation à Denis - conformément à la règle du projet "maquette + questions avant code dès qu'il y a un doute d'interface". Le principe de fond (même comportement, pas de distinction) est lui déjà tranché sans ambiguïté, donc pas la peine de rouvrir cette question.

### Mise à jour importante (2026-09-27, nuit) : la maquette est déjà à jour, et le bon fichier est identifié

La maquette a été corrigée dans la même nuit (commit `ef3f059`) : badge `tag-source` retiré, compteur de missions unifié sur les 3 items, encart "à trancher" remplacé par la règle actée. **Étape 1 ci-dessous, déjà faite.**

**Le panneau réel de "La mise en page" n'est PAS dans `modules/cv-pdf-html/cvPdfPanneauReglages.js`** (fichier plus ancien, sert à autre chose - la galerie de style/couleurs/Créatif). Les 7 cartes de l'écran unique ("Organisation du CV", "Expériences professionnelles", "Formations", "Éléments supplémentaires", "Mise en page et texte", "Réglages avancés", "Format") sont dans **`modules/cv-pdf-html/cvPdfCartesMaquette.js`** (1477 lignes), chantier "tranche 3" du 2026-09-25 (voir `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md`). C'est ce fichier qu'il faut modifier.

Repères précis dans ce fichier (lu et audité cette nuit, pas juste supposé) :
- `_htmlSecFormationsMiseEnPage()` (~ligne 330-367) : carte "Formations", le gabarit le plus proche de ce qu'il faut construire (structure `<details class="mep-carte">` + `_mepEnteteCarteMq(...)` + `carte-corps`).
- `_htmlSecExperiencesMiseEnPage()` (~ligne 230-325, nom de fonction à re-vérifier au-dessus de la ligne 262) : carte "Expériences professionnelles" - contient déjà le patron "Toutes"/"Les plus pertinentes", la liste à cocher avec compteur de missions par item (`lignesExp`), le mode de présentation. **C'est le gabarit à copier pour la liste à cocher de la nouvelle carte.**
- `_mepEnteteCarteMq(cleIcone, titre, sous, sousSousLeTitre, ouverte)` (~ligne 34) : en-tête standard de toute carte, réutiliser tel quel.
- `_mepCkMq(attr, libelle, coche, classe)` (~ligne 144) : case à cocher standard, réutiliser tel quel.
- `_mepEtatFormations()` / un futur `_mepEtatExperiencePerso()` à créer : fonction qui lit l'état courant (dossier + choix déjà faits) pour construire les valeurs affichées dans la carte - suivre le même patron que `_mepEtatFormations()`.
- `_mepAppelerIframePdf(nomFonction, ...args)` : pont vers l'iframe PDF (`cvPdfPanneauReglages.js`/`cvPdfTemplateMaquette.js`) pour transmettre un changement de réglage.
- `_mepPousserHistorique(cle)` : accroche Annuler/Refaire - à appeler avant tout changement d'état, comme le fait `_mepBasculerCompetenceChoisie()`.
- `_mepCablerCartesMaquette()` (~ligne 670) : câblage des événements (clic, changement) après chaque rendu - c'est ici qu'il faudra ajouter les écouteurs `data-mep-...` de la nouvelle carte, suivant le même principe que les cartes existantes.

### Ce qui a été construit (toutes les étapes prévues, faites)

1. ~~Mettre à jour la maquette~~ - **fait** (commit `ef3f059`).
2. ~~Décider comment stocker un réglage par item~~ - **fait** : clé texte normalisée (intitulé/texte), voir `_pdfCleExpPerso`/`_mepCleExpPerso`, pas un index (2 tableaux sources distincts).
3. ~~Écrire `_htmlSecExperiencePersoMiseEnPage()`~~ - **fait**, insérée dans `construireMiseEnPageCV()` (js/app.js) juste après `_htmlSecFormationsMiseEnPage()`.
4. ~~Câbler~~ - **fait** dans `_wireCarteSimpleMiseEnPage()` (js/app.js, pas `_mepCablerCartesMaquette()` - c'est là que vivent déjà les câblages `data-mep-exp-*` équivalents pour les expériences pro).
5. ~~Tester en direct~~ - **fait** (clair + sombre, case à cocher, compteur jusqu'à 0, navigation "Vos informations").
6. Un commit par sous-étape - **fait**, commit unique `0d5050b` pour cette carte (le câblage et le HTML sont trop imbriqués pour être séparés sans casser un état intermédiaire testable).

### Chantier suivant, déjà cadré par Denis (voir `docs/CHANTIER_CORRECTIONS_MISE_EN_PAGE_P1_P12_2026-09-27.md`)

Le même principe (missions IA + carte de réglages) pour la rubrique "Formations" : toutes les formations visibles par défaut, la personne décide lesquelles garder, missions par formation réglables jusqu'à 0 (curseur, pas de bouton séparé - décision de Denis 2026-09-28, même mécanique que cette carte). Vérifier d'abord si `formationRetenue` (cv.md point 11) couvre déjà toutes les formations ou une seule - si une seule, l'étendre comme le point 17 l'a fait pour les engagements.

---

## Fichiers clés de ce chantier

| Sujet | Fichier |
|---|---|
| Rendu PDF de la rubrique | `modules/cv-pdf-html/cvPdfTemplateMaquette.js` (`blocEngagements()`, `_PDF_INTITULES`) |
| Rendu Word de la rubrique | `modules/cv-composeur/composeurRender.js` (~ligne 1607-1756) |
| Fusion des données (Composeur) | `modules/cv-composeur/composeurComposition.js` (`experiencesPersonnelles`/`engagements`, ~ligne 384-1220) |
| Prompt IA (missions) | `prompts/cv.md` (points 13, 14, 17) |
| Parsing + écran de revue + application | `js/app.js` (`normaliserEngagementsAvecMissionsIA`, `creerBrouillonChoixIACV`, `_rendreBlocRecoAvecMissions`, `contenuOngletFormationEtPersoIA`) |
| Décision finale (missions attachées) | `modules/cv-core/moteurDecisionCV.js` (~ligne 540-625) |
| Schéma de données documenté | `docs/SCHEMA_CV.md` (sections `experiencesPersonnelles`, `engagements`) |
| Maquette du panneau (à jour, commit `ef3f059`) | `docs/MAQUETTE_EXPERIENCE_PERSONNELLE_2026-09-27.html` |
| Panneau de réglages, les 7 cartes de l'écran unique (à construire ici) | `modules/cv-pdf-html/cvPdfCartesMaquette.js` |
