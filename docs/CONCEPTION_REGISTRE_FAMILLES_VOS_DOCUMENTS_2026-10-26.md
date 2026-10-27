# Conception du lot 5 : un registre des familles pour « Vos documents » (26/10/2026, Mode A, `[effort : haut]`, rien codé)

Reprise approfondie du lot 5 du plan (`docs/PLAN_VOS_DOCUMENTS_COHERENCE_2026-10-26.md`), au niveau d'effort élevé, à partir du code lu et des mesures réelles (`docs/mesures_2026-10-26/`). Objectif : que les corrections de cohérence s'appliquent **une seule fois** et profitent à tous les parcours, sans qu'aucun parcours existant ne change tant qu'une décision de Denis ne l'a pas voulu.

## 1. Constat d'architecture (ce que le code fait aujourd'hui)
Une même page, `pageResultats()` (`js/app.js` ligne 23908, 1 055 lignes), est habillée différemment selon des **signaux dispersés**. Cinq fonctions prennent chacune leur propre décision par famille, avec **leur propre ordre de tests** :

| Décision | Où | Signaux lus |
|---|---|---|
| Barre d'étapes du haut | `afficherProgression()` (ligne 3905) **et** `barreHaut` dans `pageResultats()` (ligne 24700) | `_pageOrigineAvantResultats`, `modeCreation`, `_origineCoLettre`, `_modeVoie3Csa`, `depuisDecouverte`, `_modeModuleUcpm`, essai de modèles |
| Titre de la page | `pageResultats()` ligne 24801 | essai, `venantDeEntretien`, `titreParcoursRapideSiBesoin` |
| Sélecteur CV / Lettre / Entretien visible ou non | `pageResultats()` (`depuisDecouverte`, `masquerFauxChoixCv`) | `depuisDecouverte`, `modeCreation === 'nouveau'`, `cvTermine` |
| Suggestions « Et maintenant ? » | `pageResultats()` (`suggererLettreEntretien`, ligne ~24237) | `_origineReformuler`, document actif |
| Barre du bas (Retour, bouton principal, « Merci bien, j'ai fini ») | `pageResultats()` **et** `marquerDocumentEnregistre()` (ligne 41418, qui **reconstruit la barre à part** avec `resultatsCibleRetour`) | `resultatsCibleRetour()`, `_optionsRetourModifierLettre`, `documentsEnregistres` |
| Destination de « Retour » | `resultatsCibleRetour()` (ligne 23900), `_assistantRetourDocPrecedent()` (ligne 11505), `onclickPrecedent` passés à la main | `depuisDecouverte`, `_importVersResultats`, `_pageOrigineAvantResultats`, `_docAvantAssistant` |
| Fin du parcours | `terminerParcours()` (ligne 41739) | document actif, `modeCreation`, `_origineReformuler` |

**Deux sources de la même barre du bas** (`pageResultats` et `marquerDocumentEnregistre`) : c'est déjà une cause documentée de bug (RC-03, 2026-09-04). **Signaux sans mémoire** (`_pageOrigineAvantResultats`, `_docAvantAssistant`, `window._decouverteVersResultats`) mêlés à des **signaux persistants** (`dossier._origineCoLettre`, jamais remis à zéro ; `dossier.decouverteTerminee`) : une famille peut en « hériter » d'une autre.

## 2. Ce que la mesure change à l'analyse précédente
- **C17 (fins différentes) n'est pas quatre choix voulus, c'est une règle appliquée à moitié.** `terminerParcours()` documente la décision de Denis (15, 16 et 17/09/2026) : quand la page « Vos documents » propose déjà « Et maintenant ? » (boutons Lettre et Entretien), la fenêtre de confirmation fait **doublon** et on retourne directement à l'accueil. Le code applique cette règle à `modeCreation === 'nouveau'`, à `_origineReformuler` et au document lettre. Il **oublie** les autres CV (`maj`, voie 3, récit), où la page propose pourtant les mêmes suggestions (mesuré : boutons `btnSuggererLettre` et `btnSuggererEntretien` présents en P3, P4, P6) **et** la fenêtre s'ouvre : doublon. Seul l'entretien garde sa fenêtre finale, avec raison (dernier maillon). **Correction cohérente avec la décision de Denis : appliquer la règle à tous les CV qui affichent les suggestions.**
- Le 2e passage de l'assistant de Reformuler (C1) n'est pas dans `terminerParcours` mais dans `pageResultats` : `modeCreation = 'maj'` posé par Reformuler (`data/metiers.js` ligne 7858) fait entrer la famille dans le circuit de « Mettre à jour ».

## 3. Options étudiées (bénéfices et risques de chacune)
| Option | Bénéfice | Risque |
|---|---|---|
| **A. Registre pur dans un nouveau module testé, migration en parité d'abord (RECOMMANDÉE)** | Une décision par famille, écrite une fois ; testable en Node sans navigateur ; chaque migration est invisible (la matrice de mesure ne change pas) ; les décisions de cohérence deviennent des changements d'une ligne du registre | Demande 8 à 10 petits commits ; la première étape (décrire sans rien changer) ne rapporte rien de visible |
| B. Aligner à la main, famille par famille, sans registre | Immédiat, peu de code | Dix branches restent ; la prochaine famille ajoute encore un cas ; rien n'empêche la divergence entre `pageResultats` et `marquerDocumentEnregistre` |
| C. Scinder `pageResultats` en une page par famille | Lisibilité maximale | **Risque élevé** : 1 055 lignes partagées (rectangles de mise en page, export, accordéons, état par document) à dupliquer ou à extraire ; contraire à « une seule source de vérité » |
| D. Poser explicitement la famille à chaque entrée (variable `dossier.familleDocuments`) au lieu de la déduire | Plus lisible à long terme, supprime les signaux transitoires | Touche une vingtaine de points d'entrée, change ce qui est enregistré dans la disquette (risque de sessions anciennes) ; à reporter après A |

Recommandation : **A**, puis D plus tard si l'envie vient. A n'ajoute aucun état enregistré : la famille est **calculée** à chaque rendu à partir des signaux existants, donc une session enregistrée avant le changement se comporte comme avant.

## 4. Conception détaillée de l'option A
### 4.1 Le module
Nouveau fichier `modules/vos-documents/familles.js`, chargé comme les autres modules purs (`module.exports` pour Node, variable globale pour le navigateur, voir `modules/lettre-core/situationCandidatureLettreCo.js` pour le patron). **Aucune lecture du DOM ni de `window`** : la fonction reçoit les signaux en paramètre.

```
familleVosDocuments(signaux) -> {
  famille,            // identifiant stable : 'creer-main', 'creer-assistant', 'recit', 'maj', 'reformuler', 'voie3', 'pret-lettre', 'pret-entretien', 'co-lettre', 'prepa-entretien', 'ucpm', 'essai-modeles', 'bilan', 'direct'
  barre,              // identifiant de la barre ('CREER_CV', 'CREER_CV_SANS', 'DECOUVERTE', 'MAJ_CV', 'REFORMULER', 'CSA', 'PREPARER_LE', 'CO_LETTRE', 'PREPA_ENTRETIEN', 'UCPM', 'ANCIENNE', 'ESSAI')
  indexBarre,         // repère courant
  titre,              // texte du H1
  selecteurDocument,  // true / false
  suggestions,        // { lettre: bool, entretien: bool }
  boutonPrincipal,    // 'Valider le CV', 'Continuer', 'Valider la lettre', 'Valider la fiche', null
  retour,             // { type: 'historique' | 'route' | 'fonction', cible }
  fin                 // 'accueil' | 'fenetre-et-maintenant' | 'fenetre-effacement'
}
```
`signaux` = `{ modeCreation, creationSansAssistant, origineReformuler, origineCoLettre, decouverteTerminee, decouverteVersResultats, modeFidele, origine, importDirect, essaiModeles, docActif, parcoursRapide, cvTermine, ... }`. L'appelant (`pageResultats`, `afficherProgression`, `terminerParcours`, `marquerDocumentEnregistre`) les rassemble **par une seule fonction** `signauxVosDocuments()` dans `js/app.js`.

### 4.2 La précédence
L'ordre des tests de `pageResultats` et `afficherProgression` **est** le comportement. Le registre l'encode dans cet ordre : (1) essai de modèles ; (2) voie 3 ; (3) récit ; (4) un CV plusieurs métiers ; (5) lettre avec l'assistant ; (6) préparation d'entretien ; (7) création `nouveau` (à la main ou avec l'assistant) ; (8) `pret`/`maj` (dont Reformuler tant que la décision 7b n'est pas prise) ; (9) repli ancienne barre. Chaque rang est vérifié par un cas de test (section 5).

### 4.3 Migration en étapes (un commit par étape)
Chaque étape garde la **matrice de mesure identique** (`diff` des deux fichiers `*.REFERENCE.json` à zéro), sauf les étapes marquées DÉCISION.
1. **Pas 0, décrire. FAIT le 26/10/2026 dans le cloud** : `modules/vos-documents/familles.js` (fonction pure `familleVosDocuments`, non chargée par `index.html`, non appelée par `js/app.js`) et `tests/vosDocumentsFamilles.test.js` (26 essais : les 12 familles mesurées, la précédence, le repère courant du récit et d'un aspect, le « Retour », la fin, et un filet croisé qui compare les titres du registre au fichier `matrice_vos_documents.REFERENCE.json`). `npm test` : 2 047 essais, 2 046 verts, 1 échec attendu (`PROSPECTION`) ; aucun fichier de l'application modifié. Reste à vérifier en local que les signaux réels de `js/app.js` (lus par `signauxVosDocuments()`, pas 1) donnent les mêmes résultats que ceux de la sonde. Effort bas.
2. **Pas 1, brancher la barre** : `afficherProgression('resultats')` et `barreHaut` lisent `famille.barre` / `indexBarre`. Matrice inchangée. Effort moyen.
3. **Pas 2, brancher le titre et le sélecteur** (`h1`, `selecteurDocument`, `masquerFauxChoixCv`). Matrice inchangée. Effort bas.
4. **Pas 3, une seule construction de la barre du bas** : une fonction `barreBasVosDocuments(famille, etat)` appelée par `pageResultats()` **et** `marquerDocumentEnregistre()` (supprime la deuxième source). Matrice inchangée. Effort moyen, **risque le plus élevé de l'ensemble** (RC-03).
5. **Pas 4, « Retour » unifié** : `resultatsCibleRetour` et `_assistantRetourDocPrecedent` lisent `famille.retour`. Matrice inchangée. Effort moyen.
6. **Pas 5, la fin** : `terminerParcours` lit `famille.fin`. Matrice inchangée tant que le registre reproduit l'état actuel. Effort bas.
7. **Pas 6, DÉCISIONS** (chacune est une ligne du registre, avec la matrice qui change exactement de cette ligne) : 7a fin unique (C17), 7b barre de Reformuler (C1), 7c titre de la préparation (C19), 7d nom du dernier repère, 7e libellés d'export. Effort bas chacune une fois le registre posé.
8. **Pas 7, nettoyage** : retirer les signaux devenus inutiles (`_origineCoLettre` jamais remis à zéro, etc.) après grep de tout le dépôt. Effort moyen.

### 4.4 Filets de sécurité
- **Test pur Node** (`tests/vosDocumentsFamilles.test.js`) : les 12 familles x leurs signaux, résultat attendu = ligne de la matrice. C'est le filet **avant** navigateur.
- **Deux scripts de mesure** rejoués à chaque commit (`docs/mesures_2026-10-26/matrice_vos_documents.js`, `parcours_retours_et_barres.js`) : `diff` avec les `REFERENCE.json`.
- **Huit parcours réels** (`docs/mesures_2026-10-26/parcours_reels/`) rejoués après les pas 3 et 5, qui touchent le comportement visible (barre du bas, fin).
- `npm test` identique à l'état de départ (2020 verts, 1 échec connu sur `PROSPECTION`) ; essai de Denis sur 2 ou 3 parcours avant fusion.
- Grep préalable sur tout le dépôt (`js/`, `data/`, `modules/`, `tests/`, `scripts/`) de `afficherProgression`, `resultatsCibleRetour`, `terminerParcours`, `marquerDocumentEnregistre`, `_assistantRetourDocPrecedent`, `docActifActuel`.

### 4.5 Ce que le registre ne fait PAS (pour garder le risque bas)
Il ne touche ni au contenu des rectangles (mise en page, export, adaptation au métier), ni à l'état par document (`etatAccordeonParType`), ni aux données enregistrées dans la disquette. Il ne décide pas à la place de Denis : tant qu'une décision n'est pas prise, la ligne du registre reproduit le comportement actuel.

## 5. Questions de conception à trancher (avec recommandation)
1. **Où vit `familleVosDocuments` ?** Reco : `modules/vos-documents/familles.js` (pur, testable en Node) ; `js/app.js` ne fait que rassembler les signaux.
2. **Famille calculée ou posée ?** Reco : calculée (option A), posée plus tard (option D) seulement si la précédence devient pénible à maintenir.
3. **Vocabulaire du dernier repère** (décision 4a du plan) : reco « Vos documents » pour tout CV, « Terminé » pour la lettre et l'entretien (déjà voulu par B.36), « Mon CV » du récit aligné sur « Vos documents ».
4. **Fin du parcours** (7a) : reco appliquer la règle de Denis (pas de fenêtre quand la page propose déjà la suite) à tous les CV ; garder la fenêtre finale de l'entretien, mais avec un texte qui ne parle plus d'« informations effacées » sans dire comment les retrouver (« vous pourrez les restaurer depuis la page d'accueil » y est déjà ; à relire avec le public cible).
5. **2e passage de l'assistant de Reformuler** (7b) : reco le retirer pour cette voie ; à confirmer par Denis, car c'est un changement de comportement visible.

## 6. Ce que je ne peux pas garantir depuis le cloud
Le ressenti d'un enchaînement (fenêtre ou non, bon titre) et la lecture par le public cible. Le registre garantit la cohérence **mécanique** ; sa justesse **humaine** reste à l'essai de Denis.
