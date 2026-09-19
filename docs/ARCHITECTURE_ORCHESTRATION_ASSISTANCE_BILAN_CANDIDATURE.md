# Architecture de l'orchestrateur (brique 5) : modalité « Assistance à la finalisation du CV »

> Document de conception uniquement, volontairement court. S'appuie sur [EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md](EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md) (section 3, "Distinction... deux familles") et [ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md](ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md), sans redériver ce qu'ils établissent déjà. Écrit avant tout code de cette brique.

---

## 1. Rôle, et ce que ce rôle exclut

L'orchestrateur ne contient **aucune logique métier nouvelle**. Il enchaîne des interfaces déjà validées et testées (briques 1, 3, 4, 4bis) et la navigation déjà existante du parcours "Diagnostic → Correction". Il ne résout jamais une destination, ne génère jamais de texte, ne décide jamais où écrire : ce travail appartient déjà à d'autres modules.

Il reste **stateless au niveau de la logique métier** : aucune donnée de `dossier`, aucune `PropositionAmelioration`, aucun `ElementRelecture` n'est stocké dans l'orchestrateur lui-même au-delà du temps d'un appel. Le seul état qui persiste entre deux interactions (par exemple "où en est le candidat dans la séquence") est un état d'écran, de la même nature que `_etatCorrectionBilan` existant pour le parcours "Diagnostic → Correction" -- pas une nouvelle catégorie de donnée métier, un simple curseur de progression dans l'interface.

---

## 2. Entrée

- Les recommandations **validées** par le candidat (même source que le parcours "Diagnostic → Correction" : `bilanRecommandationsTriees(diagnostic.resultat)`, filtrées aux recommandations retenues).
- `dossier` (lecture pour la résolution et l'affichage avant/après, écriture uniquement via la brique 4).
- Les données structurées déjà lues par `hostDataAdapter.js` (`experiencesTexte`, `modeCreation`) pour `resolutionDestination.js`.

## 3. Sortie

Un état final unique une fois toutes les recommandations traitées, indiquant pour chacune son mécanisme réel (génération relue et appliquée, ou saisie guidée effectuée) -- jamais une distinction visible entre "Niveau 1" et "Niveau 2" à ce stade, cohérent avec le principe déjà établi que ces catégories sont des détails d'implémentation, jamais un vocabulaire exposé au candidat.

---

## 4. Flux d'appel

### 4.1 Classification (silencieuse, aucune écriture)

Pour chaque recommandation validée, un seul appel déjà existant :

```
resolution = bilanResoudreDestinationCorrection(recommandation, donnees, BILAN_CATALOGUE_AXES)
```

| `resolution` | Branche |
|---|---|
| `type: 'extrait'` | **Famille 1, remplacement** -- destination déjà connue : `resolution.cible` (`{ index, champ }`). |
| `type: 'axe'`, `cible: 'experiences'` | **Famille 1, rédactionnel** -- destination à résoudre : `bilanResoudreChampExperience(dossier.experiences)`. |
| `type: 'axe'`, `cible: 'candidature'` | **Famille 2, complétude** -- pas de destination d'écriture, navigation directe. |
| `type: 'texte-libre'` | **Hors modalité** -- reste exclusivement manuel, comme aujourd'hui. Ni Famille 1 ni Famille 2. |

### 4.2 Branche Famille 1 (rédactionnelle)

Pour chaque recommandation classée Famille 1 dont la destination est résolue (`type: 'unique'`, ou directement connue pour un `extrait`) :
1. Cycle Prompt 2 existant, déjà confirmé réutilisable sans modification (brique 2) : `bilanDemanderAmelioration` → copier/coller → `bilanSoumettreReponseAmelioration` → `PropositionAmelioration`.
2. Construction de l'élément de relecture (brique 3) : `bilanCreerElementRelecture({ id, dimension, texteActuel, texteApres: proposition.proposition, destination })`.
3. Accumulation dans l'état de relecture (brique 3) : `bilanCreerEtatRelecture(elements)`.

Cas non traité automatiquement pour cette V1, assumé plutôt que contourné : `bilanResoudreChampExperience()` retourne `type: 'selection'` (plusieurs expériences existantes, aucun sélecteur construit -- voir `ARCHITECTURE_NIVEAU2`, section 5.3). Ces recommandations ne rejoignent pas l'écran de relecture ; elles restent hors automatisation, au même titre que `texte-libre`, en attendant ce sélecteur.

### 4.3 Branche Famille 2 (complétude)

Pour chaque recommandation classée Famille 2 : aucun appel à Prompt 2, aucun élément de relecture. Message affiché : *"Cette recommandation nécessite une information que seul vous pouvez renseigner. Nous allons vous guider vers l'écran correspondant."*, puis navigation vers le bloc Candidature -- même mécanisme que celui déjà construit pour le parcours "Diagnostic → Correction" (`bilanDeclencherActionCorrection`, branche `candidature`).

Point volontairement laissé ouvert par ce document, pas un oubli : `bilanDeclencherActionCorrection()` manipule aujourd'hui `_etatCorrectionBilan`, l'état propre au parcours "Diagnostic → Correction". L'intégration exacte (réutiliser cette fonction telle quelle, ou seulement les primitives de navigation qu'elle appelle -- `naviguerVers`, `bilanSurlignerBloc`) est un détail de câblage `app.js`, à trancher au moment d'écrire ce code, pas une question d'architecture.

### 4.4 Validation et écriture (Famille 1 uniquement)

Une fois le candidat arrivé à l'écran de relecture et sa sélection faite :

```
selectionnes = bilanElementsSelectionnesRelecture(etat)
bilanAppliquerElementsRelecture(dossier, selectionnes)
```

Écriture atomique déjà garantie par la brique 4 (section 6 de ce document reprend cette règle sans la redéfinir).

### 4.5 Écran final

Une fois la Famille 1 validée (ou vide) et la Famille 2 traversée (ou vide), un état de clôture unique -- son contenu exact (texte, actions proposées) reste à concevoir par maquette, comme le reste de cette modalité, pas dans ce document.

---

## 5. Ce que ce document ne tranche pas

- Le déclenchement exact de l'écran de relecture après plusieurs générations Famille 1 en séquence (orchestration point par point, comparable au mode "guide" du parcours existant) : détail d'implémentation `app.js`, pas une question d'architecture.
- Le contenu de l'écran de clôture.
- Le sélecteur multi-expériences (`type: 'selection'`) : hors périmètre de cette V1, voir 4.2.

---

## Statut

Document de conception validé avant code (2026-08-11). Section 4.1 (classification) implémentée : `assistance/orchestrationAssistance.js` (`bilanClasserRecommandationAssistance`, `bilanRepartirRecommandationsAssistance`), logique pure, testée indépendamment pour chacun des 4 groupes (remplacement, rédactionnel, complétude, hors automatisation/hors modalité). Ne délègue jamais une décision aux résolveurs : lit uniquement leurs résultats.

**Mise à jour (2026-08-18, audit de cohérence documentaire)** : le câblage décrit ci-dessous comme restant à faire (sections 4.2 à 4.5) a lui aussi été réalisé, dans le même commit que ce document (2026-08-11) — voir `js/app.js` (`_etatAssistanceBilan`, écran de relecture, écriture, écran final) et `docs/ARCHITECTURE_NIVEAU2_BILAN_CANDIDATURE.md` point 5, qui confirme ce câblage comme fait et vérifié en navigateur. Section conservée ci-dessous comme trace du plan initial.

Reste à câbler dans `app.js` (sections 4.2 à 4.5, hors périmètre de la logique pure) : le cycle Prompt 2 pour la Famille 1, la navigation pour la Famille 2, l'écran de relecture, l'écriture, et l'écran final -- tous des appels aux interfaces déjà citées, aucune nouvelle logique métier attendue à ce stade.
