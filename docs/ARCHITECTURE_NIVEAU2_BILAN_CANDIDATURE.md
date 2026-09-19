# Architecture du Niveau 2 (assistance ciblée) : module « Bilan de candidature »

> Document de conception uniquement. Aucun prompt complet, aucun code. S'appuie sur [ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md](ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md) et sur [EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md](EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md) (section 3, architecture à trois niveaux validée par maquette le 2026-08-10), sans redériver ce qu'ils établissent déjà. Fait partie du chantier "Assistance à la finalisation du CV", chantier parallèle au parcours "Diagnostic → Correction", mené en exception assumée au principe "ne pas construire sur une intuition" (voir le document ci-dessus pour la justification de cette exception).

---

## 1. Ce que le Niveau 2 n'est pas

Le Niveau 2 n'est pas un troisième prompt. C'est le Prompt 2 existant, réutilisé tel quel, pour un nouveau consommateur (l'écran de relecture unique) plutôt que pour un nouveau rôle. Aucune modification de `prompts/bilan-v2.md`, aucune modification du schéma `PropositionAmelioration`, aucun nouveau protocole de validation à construire : tout ce qui a déjà été conçu et éprouvé pour le Prompt 2 (`ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md`) reste valable sans changement.

Ce qui est nouveau se situe entièrement du côté de l'**application**, jamais du prompt : quelles recommandations orienter vers cette génération, comment présenter son résultat dans l'écran de relecture, et où l'écrire dans `dossier` une fois validé. C'est ce que ce document précise.

**Rappel du principe directeur (non négociable, hérité de la section 3 d'`EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md`)** : jamais de CV complet en sortie. Une sortie bornée à un fragment, comme aujourd'hui, garantit qu'il n'y a rien d'autre à faire dériver qu'une phrase courte. Un Niveau 2 qui produirait un document entier ne serait plus un Niveau 2, ce serait le "Prompt 3" explicitement écarté.

---

## 2. Périmètre exact : quelles recommandations relèvent du Niveau 2

Le critère existe déjà, calculé par `correction/resolutionDestination.js` (brique 1 du chantier "Diagnostic → Correction"), jamais recalculé ici :

| Résultat de `bilanResoudreDestinationCorrection()` | Catégorie | Traitement |
|---|---|---|
| `type: 'extrait'` | **Niveau 1** | Remplacement mécanique, aucune IA. Hors périmètre de ce document. |
| `type: 'axe'`, `cible: 'experiences'` | **Niveau 2, Famille rédactionnelle** | Une destination est connue, mais aucun texte précis à remplacer : ajout de contenu, reformulation locale sans ancrage exact. **C'est le seul périmètre réel de ce document** (voir précision ci-dessous). |
| `type: 'axe'`, `cible: 'candidature'` | **Famille complétude, hors Niveau 2** | Ambiguïté trouvée et corrigée le 2026-08-11 (brique 4, docs/EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md, "Distinction... deux familles") : `adequation` et `personnalisation` ne concernent jamais un fragment à rédiger, toujours une donnée métier que seul le candidat connaît (métier visé, entreprise, recruteur...). **Ne passe jamais par Prompt 2** -- navigation guidée vers le bloc Candidature existant, hors périmètre de ce document. |
| `type: 'texte-libre'` | **Hors Niveau 1 et Niveau 2** | Aucune destination précise (axe lisibilité/cohérence transversale, ou candidat en CV importé) : relecture globale, reste exclusivement manuel. Jamais un candidat à l'assistance automatique, quelle qu'elle soit. |

Cette classification n'est jamais à refaire : `resolutionDestination.js` est appelé une fois par recommandation validée, son `type` (et, pour `type: 'axe'`, son `cible`) détermine directement le traitement, sans nouvelle règle à écrire.

**Précision (2026-08-11) : ce document ne couvre plus que la Famille rédactionnelle.** Une première version de ce document traitait tout `type: 'axe'` comme un candidat uniforme au Niveau 2 (donc à Prompt 2), `cible` compris. Ce n'est plus le cas : `cible: 'candidature'` (`adequation`, `personnalisation`) est sorti de ce document -- Prompt 2 n'a jamais eu qu'une seule responsabilité, produire un fragment rédactionnel, jamais une donnée métier, ce qui explique d'ailleurs pourquoi il n'a jamais reçu en entrée la valeur d'aucun champ de `dossier` (section 3). Tout ce qui suit dans ce document (sections 3 à 6) ne concerne donc que `cible: 'experiences'`. Le mécanisme de navigation pour la Famille complétude ne réutilise aucun élément propre à Prompt 2 (pas de `DemandeAmelioration`, pas de `PropositionAmelioration`) : il n'a pas sa place dans ce document, voir `EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md` pour son traitement.

---

## 3. Données d'entrée : identiques au Prompt 2, sans ajout

Reprend exactement `DemandeAmelioration` telle que définie dans `modeles/demandeAmelioration.js` et `CONTRATS.md` :
- `recommandationSelectionnee` (`id`, `contenu`, `dimensionsLiees`, `priorite`, `extraitConcerne`, `observationsLiees`). Pour un Niveau 2, `extraitConcerne` vaut `null` par construction (c'est précisément ce qui distingue le Niveau 2 du Niveau 1) : rien de spécifique à traiter ici, le Prompt 2 gère déjà ce cas (`ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md`, section 2, "`extraitConcerne` absent... la proposition reste une suggestion générale bornée par `recommandation.contenu` seul").
- `observationsResolues`, `objectifs` : inchangés.

Aucun champ à ajouter à `DemandeAmelioration` pour cette évolution. Le Niveau 2 ne fait qu'utiliser un chemin que `DemandeAmelioration` et le Prompt 2 savent déjà emprunter.

---

## 4. Sortie : `PropositionAmelioration` + un champ, uniquement pour le Niveau 2

Correction par rapport à une première version de ce document : une analyse plus poussée montre qu'un ajout minimal est justifié, et qu'il passe le test qui avait fait rejeter `emplacementSuggere`.

### Ce qui a été écarté, et pourquoi

Un champ `emplacementSuggere` (ou une variante `typeOperation` à 5 valeurs incluant "remplacer" et le détail du type d'élément créé) a été envisagé puis écarté :
- **"Remplacer" est incohérent avec le contexte d'appel.** Le Niveau 2 n'est invoqué que lorsque `extraitConcerne` est déjà absent (voir section 2) : il n'y a par construction rien à remplacer. Redemander cette information reviendrait à demander à l'IA de contredire une donnée déjà connue avec certitude.
- **Le détail du type d'élément créé (nouvelle expérience / nouvelle compétence / nouvelle section) duplique `resolutionDestination.js`.** La catégorie (`cible: 'experiences' | 'projet-professionnel' | 'candidature'`) est déjà connue côté application. La demander à l'IA reviendrait à lui confier une décision qu'elle n'a pas besoin de prendre, avec un risque de désaccord entre les deux sources.

### Ce qui est retenu

Un champ **`action`**, à deux valeurs seulement : `'completer' | 'creer'`.
- `'completer'` : la proposition enrichit un élément déjà présent dans le CV (ex. ajouter une précision à une expérience existante).
- `'creer'` : la proposition correspond à un élément qui n'existe pas encore dans le CV (ex. une rubrique Compétences absente).

Ce champ passe le test ("cette information existe-t-elle déjà côté application ?") parce que la réponse est non : seule l'IA, en lisant `recommandation.contenu` et les observations qui la justifient, sait si le manque identifié porte sur un élément existant à enrichir ou sur un élément absent à créer. Combiné à `cible` (déjà connu), il suffit à reconstruire tout ce dont l'application a besoin, sans jamais demander à l'IA de répéter une information qu'elle n'a pas produite elle-même.

```json
{
  "proposition": "...",
  "justification": "...",
  "actionsConcretes": ["...", "..."],
  "action": "completer|creer"
}
```

Le champ `action` n'a de sens que pour un appel de Niveau 2 (`extraitConcerne` absent) : pour un appel classique du Prompt 2 avec extrait (Niveau 1, hors périmètre de ce document), il resterait sans objet, cohérent avec le fait que le Niveau 1 ne passe jamais par un appel IA.

---

## 5. Ce qui est nouveau : la consommation par l'écran de relecture, jamais la génération

### 5.1 Construction de l'avant/après pour un élément de Niveau 2

Contrairement au Niveau 1 (un texte existant remplacé par un autre), le Niveau 2 n'a pas de "avant" au sens strict : c'est un ajout, pas une substitution. L'écran de relecture doit rester honnête sur cette différence plutôt que de simuler un avant/après qui n'existe pas :
- **Avant** : un texte informatif, jamais un extrait du CV puisqu'il n'y en a pas ("Cette information n'apparaît pas actuellement dans votre CV" ou équivalent), accompagné du `libelle` de la section concernée (`resolutionDestination.js`).
- **Après** : `proposition` (`PropositionAmelioration`) telle quelle, jamais reformulée par l'application.

### 5.2 Où écrire dans `dossier` : uniquement `cible: 'experiences'`, seul cas restant dans ce document

Audit mené le 2026-08-11, initialement sur les 10 axes, puis resserré le même jour (brique 4) après avoir établi que `cible: 'candidature'` ne relève jamais de Prompt 2 (section 2, précision) -- ce document ne traite donc plus que `cible: 'experiences'` (`credibilite`, `risques`, `impact`, `coherence`, `differenciation`, `posture`). Le champ (`poste` ou `missions`) est déterminé sans ambiguïté quand `extraitConcerne` matche (Niveau 1). En repli sur l'axe seul (Niveau 2, `action` renseigné), l'élément de la liste reste indéterminé dès que `dossier.experiences` en compte plusieurs : voir 5.3, sélecteur humain.

Interface manquante trouvée le 2026-08-11 en concevant la brique 5 (orchestrateur) : cette résolution n'existait dans aucun fichier -- la brique 1 l'avait jugée "triviale" et renvoyée à la brique 4, qui s'est avérée volontairement aveugle à toute résolution. Comblée par `assistance/resolutionChampExperience.js` (brique 4bis) : `{ type: 'unique', destination }` si une seule expérience existe, `{ type: 'selection', destinations }` sinon. Le champ retenu (`'missions'`) y est documenté explicitement comme une **règle de la V1**, pas un postulat définitif sur les 6 axes concernés -- si un axe devait un jour cibler `poste`, seul ce fichier changerait.

**`lisibilite`/`coherence_transversale` (`cible: 'texte-libre'`)** : pas de champ à résoudre, la correction porte sur le CV entier, sans objet pour cette section.

**`adequation`/`personnalisation` (`cible: 'candidature'`) : hors de ce document depuis la précision de la section 2.** La cartographie détaillée de ces deux axes (quel champ de `rechercheCandidature`, `metierCible`, `secteurCible`... est concerné selon `dossier.objectif`/`modeRecherche`/`typeRecherche`) a bien été construite le 2026-08-11, dans un résolveur dédié (`assistance/resolutionChampNiveau2.js`) -- puis retirée le même jour une fois la brique 5 conçue : la navigation Famille 2 cible le bloc Candidature dans son ensemble (`BILAN_BLOC_PROJET_PAR_CIBLE`, `js/app.js`), jamais un champ précis, ce qui a rendu ce résolveur sans consommateur réel. Voir `EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md` ("Distinction... deux familles") pour le traitement réel de cette famille.

Le champ `action` (section 4) reste la clé pour distinguer, une fois l'expérience identifiée, une création (nouveau contenu dans `missions`, actuellement vide) d'un complément (le champ existe déjà, enrichi).

**Le seul point résiduel, assumé plutôt que résolu artificiellement** : le sélecteur humain, nécessaire quand `dossier.experiences` compte plusieurs entrées. Ni l'IA ni l'application ne doivent deviner laquelle est concernée : demander un identifiant à l'IA réintroduirait le même risque de fiabilité déjà écarté pour `extraitConcerne` (un identifiant mal formé ou halluciné serait pire que l'absence d'automatisation). La solution retenue reste dans la cascade déjà validée : dans ce cas précis et seulement dans ce cas, l'écran de relecture demande explicitement au candidat de désigner l'élément concerné (un sélecteur simple), pour cette recommandation uniquement, jamais une nouvelle génération IA. Le détail de ce sélecteur reste à concevoir avec la maquette de cet écran, pas ici.

### 5.3 Le sélecteur comme point d'évolution, pas comme correctif d'interface

Vérifié explicitement (2026-08-11) : rien dans le contrat ci-dessus ne ferme la porte à une réduction future de cette intervention humaine, et aucune préparation n'est nécessaire aujourd'hui pour la garder possible.

- Le sélecteur reste, par nature, un simple choix parmi les éléments existants de la catégorie visée (ex. une liste d'expériences). Le pré-remplir avec une valeur par défaut plutôt que de le laisser vide est une propriété ordinaire de ce type de composant, pas une décision d'architecture à prendre à part : n'importe quelle implémentation raisonnable de ce sélecteur pourra accepter une présélection le jour où une source fiable existera pour la fournir.
- Cette source fiable n'existe pas aujourd'hui, et ce document ne l'invente pas par anticipation : ajouter maintenant un champ spéculatif (ex. `experienceSuggeree`) sans source de vérité réelle reviendrait exactement à l'erreur déjà écartée pour `emplacementSuggere`, un champ qui ne passerait pas le test de la section 4 puisque rien ne le remplirait de façon fiable.
- Piste plausible pour le jour où ce besoin deviendra réel, non retenue maintenant : étendre le même principe déjà appliqué à `extraitConcerne` (une citation verbatim, jamais reconstruite) à une recherche du contenu de la recommandation contre les intitulés de poste (`dossier.experiences[].poste`), sur le même modèle que `bilanTrouverExperienceParExtrait()`. Resterait un mécanisme déterministe côté application, pas un nouveau champ demandé à l'IA.

Conclusion : aucune décision à prendre aujourd'hui pour préserver cette évolution, la porte est déjà ouverte par la nature même du sélecteur.

---

## 6. Règles héritées, non renégociables ici

Reprises telles quelles de la section 3 d'`EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md`, validées avant ce document et non rouvertes par lui :
- **Traitement indépendant** : chaque recommandation de Niveau 2 est traitée seule, sans orchestration qui regrouperait plusieurs corrections en un seul passage. Le Prompt 2 ne lit jamais les autres recommandations ; le Niveau 2 hérite de cette règle sans exception. À reconsidérer uniquement si l'usage réel montre des collisions fréquentes entre fragments.
- **Aucune écriture avant la relecture unique** : comme pour le Niveau 1, aucune proposition de Niveau 2 ne s'écrit dans `dossier` avant l'écran de relecture et la validation explicite du candidat, quelle que soit la confiance qu'on pourrait avoir dans le résultat.
- **`dossier` reste l'unique source de vérité** : aucun nouveau format de CV, aucun second point de génération de document. L'export réutilise `genererBlobDocumentActif()` sans adaptation.

---

## Statut

**Contrat validé (2026-08-11), périmètre resserré le même jour (brique 4).** Entrées, sortie (`PropositionAmelioration` + `action`), et évolutivité du sélecteur (section 5.3) sont fixés, **pour `cible: 'experiences'` uniquement** -- `adequation`/`personnalisation` (`cible: 'candidature'`) sont sortis de ce document (section 2, précision) : ce sont des données métier, jamais des fragments rédactionnels, Prompt 2 ne les concerne pas. Voir `EVOLUTIONS_DIFFEREES_BILAN_CANDIDATURE.md` ("Distinction... deux familles") pour leur traitement (navigation guidée, hors Prompt 2).
1. ~~Mettre à jour `prompts/bilan-v2.md` pour demander `action` lorsque `extraitConcerne` est absent~~ -- fait.
2. ~~Auditer la structure exacte de `dossier` pour chaque axe routé vers `experiences` / `candidature`~~ -- fait (section 5.2), puis corrigé : seul `experiences` reste un cas d'écriture Prompt 2 ; `candidature` a été requalifié en navigation (Famille complétude), pas en écriture.
3. Code de production : `assistance/etatRelecture.js` (brique 3, structure de l'écran de relecture, `cible: 'experiences'` uniquement), `assistance/ecritureRelecture.js` (brique 4, écriture atomique, aveugle à toute notion de famille), `assistance/resolutionChampExperience.js` (brique 4bis, résout `{index, champ}` pour `experiences`), `assistance/orchestrationAssistance.js` (brique 5, classification pure).
4. ~~Brique 4 : écriture réelle dans `dossier` pour la Famille rédactionnelle~~ -- fait.
5. ~~Brique 5 : l'orchestrateur~~ -- fait (`orchestrationAssistance.js` + câblage `js/app.js`), vérifié en navigateur de bout en bout.
6. **Retrait (2026-08-11, audit final avant commit)** : `assistance/resolutionChampNiveau2.js` (brique 1) et son test ont été supprimés. Construit pour résoudre un champ précis de `candidature`, jamais branché : la brique 5 a tranché pour une navigation au niveau du bloc entier, rendant ce résolveur sans consommateur réel -- même principe déjà appliqué à `emplacementSuggere` (section 4), pas de code sans besoin démontré. À reconstruire si un vrai besoin de précision au niveau du champ apparaît un jour.
