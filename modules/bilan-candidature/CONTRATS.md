# Contrats du module — Bilan de candidature

> Dernière étape avant le code. Aucune logique métier ici : uniquement les objets, leurs interfaces, les règles qui ne doivent jamais être violées, et les erreurs métier attendues. S'appuie sur [ARCHITECTURE_TECHNIQUE.md](ARCHITECTURE_TECHNIQUE.md) et affine, sur quelques points, sa terminologie — **les noms ci-dessous font foi désormais.**

> **Amendement — étape de confidentialité (révisé le 2026-08-08).** Ce contrat, initialement déclaré figé, est modifié pour intégrer une contrainte transversale non négociable : aucune donnée ne part vers une IA externe sans relecture et validation explicite de l'utilisateur. **Décision révisée** : ce mécanisme est implémenté **localement** dans `collecte/`, pas via un service partagé externe — `modules/confidentialite/` reste un contrat différé ([CONTRAT.md](../confidentialite/CONTRAT.md)), à construire seulement si un besoin réel et récurrent apparaît sur plusieurs parcours. Les changements sont marqués **🔒 Amendement** ci-dessous.


**Renommages effectués par rapport à l'architecture technique**, avec leur raison :
- `ContexteCandidature` → **`Candidature`** : simple alignement de nom sur le vocabulaire métier.
- `NiveauAnalyse` devient le cœur d'un objet plus large, **`ContexteAnalyse`**, qui regroupe niveau, données manquantes et observations factuelles en un seul objet transmis d'un composant à l'autre (auparavant trois paramètres séparés — un seul objet est plus sûr à faire circuler).
- **`Diagnostic`** est introduit comme objet distinct de `DiagnosticResultat` : `Diagnostic` porte l'identité, le statut et le cycle de vie (généré → complet/échec) ; `DiagnosticResultat` reste le contenu pur, sans identité propre, imbriqué dans `Diagnostic.resultat`. C'est ce qui donne un point d'ancrage clair à l'invariant « un diagnostic est toujours rattaché à une candidature ».
- `AmeliorationCiblee` → **`PropositionAmelioration`** : alignement de nom.

---

## 1. Objets du domaine

### Candidature

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | généré à la création |
| `cv` | string | oui | texte, jamais vide |
| `metierVise` | string \| null | non | |
| `offreEmploi` | string \| null | non | |
| `entrepriseCiblee` | string \| null | non | |
| `siteEntreprise` | string \| null | non | 🗨️ **Amendement, ajout additif.** Site internet de l'entreprise ciblée, déjà saisi séparément du lien d'offre par un chantier antérieur (`siteCibleActuel()`, `js/app.js`) — sert à consigner au prompt d'aller rechercher les valeurs/le secteur de l'entreprise (même mécanisme déjà utilisé par `prompts/entretien.md`). |
| `lettreMotivation` | string \| null | non | *(futur, niveau 4 — jamais exposé par `hostDataAdapter` aujourd'hui, voir chantier "Cohérence transversale", module séparé)* |
| `preparationEntretien` | string \| null | non | *(futur, niveau 4 — jamais exposé par `hostDataAdapter` aujourd'hui, voir chantier "Cohérence transversale", module séparé)* |
| `dateCreation` | string (ISO 8601) | oui | |
| `hashContenu` | string | oui | recalculé à chaque modification d'un des champs ci-dessus |
| `confidentialiteValidee` | boolean | oui | 🔒 **Amendement.** `false` à la création, passe à `true` uniquement après validation explicite via `ServiceConfidentialite.demanderRelecture()` |

**Validation :** `cv` non vide est la seule condition de validité. Tout le reste peut être absent (dégradation vers un niveau d'analyse plus bas, jamais un rejet de la Candidature elle-même). 🔒 `confidentialiteValidee` doit valoir `true` avant toute utilisation par `diagnosticPromptBuilder` — voir invariant 11 et erreur `RelectureNonValidee`.

**Relations :** une Candidature peut être la source de plusieurs `Diagnostic` dans le temps (régénérations) ; un `Diagnostic` n'a qu'une seule Candidature.

---

### ContexteAnalyse

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `candidatureId` | string | oui | référence vers une `Candidature` existante |
| `niveau` | 1 \| 2 \| 3 \| 4 | oui | |
| `donneesManquantes` | string[] | oui | peut être vide |
| `observations` | `Observation[]` | oui | uniquement `origine: 'factuelle'` ; peut être vide seulement si la Candidature est quasi vide |

**Validation :** `niveau` doit correspondre exactement à ce que produirait `niveauAnalyseDetector` pour la Candidature liée — jamais construit ou modifié à la main ailleurs. `niveau = 4` exige `lettreMotivation` et `preparationEntretien` non nuls sur la Candidature liée.

**Relations :** un `ContexteAnalyse` est lié à exactement une `Candidature` et sert de base à exactement un `Diagnostic`.

---

### Observation

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | unique dans tout le module |
| `origine` | `'factuelle'` \| `'argumentee'` | oui | |
| `contenu` | string | oui | non vide |
| `categorie` | string \| null | si `origine = factuelle` | ex. `'chronologie'`, `'mots-cles'`, `'structure'` |
| `axeLie` | string \| null | si `origine = argumentee` | id d'`Axe` |
| `observationsFactuellesLiees` | string[] | si `origine = argumentee` | ids d'`Observation` d'origine factuelle |

**Validation :** une observation `argumentee` référence au moins une observation `factuelle` existante, sauf si elle repose uniquement sur une règle contextuelle (cas légitime, rare).

**Génération de l'`id` :** pour `origine = factuelle`, généré par `faitsExtractor`. Pour `origine = argumentee`, **le Prompt 1 V2 ne fournit pas d'identifiant** (limite connue du prompt figé, relevée lors de l'audit) — `diagnosticResponseParser` en génère un de façon déterministe (ex. `${axeId}-obs-${index}`). Ce contrat referme ce manque sans toucher au prompt.

**Relations :** une observation `factuelle` peut être citée par plusieurs observations `argumentee` et par plusieurs `Recommandation`. Une observation `argumentee` appartient à exactement un `Axe`.

---

### Axe

Catalogue statique (`axeAnalyseRegistry`), 10 entrées fixes :

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | slug stable, unique (ex. `adequation`) |
| `nom` | string | oui | |
| `poids` | `'determinant'` \| `'differenciateur'` \| `'amplificateur'` \| `'contextuel'` | oui | |
| `niveauMinimum` | 1 \| 2 \| 3 \| 4 | oui | |
| `plafonneA` | `'a_renforcer'` \| null | non | non nul seulement si `poids` ∈ {amplificateur, contextuel} |

**Validation :** exactement 10 entrées, `id` uniques, chargé une seule fois, immuable en mémoire (invariant, section 3).

**Relations :** référencé par au plus une entrée « résultat d'axe » par `DiagnosticResultat`, et par zéro ou plusieurs `Recommandation` via `dimensionsLiees`.

**Résultat d'axe** *(sous-structure de `DiagnosticResultat`, pas un objet top-level)* :

| Propriété | Type | Obligatoire |
|---|---|---|
| `axeId` | string (réf. `Axe.id`) | oui |
| `restitutionQualitative` | `'tres_convaincant'` \| `'convaincant'` \| `'a_renforcer'` \| `'prioritaire'` | oui |
| `observationsArgumentees` | `Observation[]` | oui, peut être vide |
| `pointsForts`, `pointsFaibles`, `incoherences`, `risques` | string[] | oui, peuvent être vides |
| `attentes` 🗺️ | `Attente[]` | oui, peut être vide |

**Validation :** si `Axe.plafonneA` est défini, `restitutionQualitative` ne peut jamais valoir `'prioritaire'` — sauf la dérogation Lisibilité déjà actée dans le Prompt 1 (voir invariants).

---

### Attente 🗺️ *(sous-structure de « résultat d'axe », amendement du 2026-08-19)*

> 🗺️ **Amendement — chantier « Carte de correspondance » (2026-08-19).** Nouvelle sous-structure, jamais une modification d'un objet existant. Conception complete : `docs/DOCTRINE_CARTE_CORRESPONDANCE.md`, `docs/CHANTIER_CARTE_CORRESPONDANCE.md` (contrat de référence, section 5), `docs/CHANTIER_PROMPT1_ATTENTES.md` (évolution du Prompt 1). Code : `modules/bilan-candidature/modeles/attente.js`.

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | généré de façon déterministe par le parseur (`${axeId}-attente-${index}`), jamais par l'IA — même principe qu'`Observation` argumentée |
| `contenu` | string | oui | non vide |
| `axeLie` | string (réf. `Axe.id`) | oui | aujourd'hui toujours `adequation` en pratique, champ générique |
| `observationsLiees` | string[] (ids d'`Observation`) | oui | peut être **vide** (état « aucun élément », résultat normal) |

**Validation :** aucune vérification croisée dans `modeles/attente.js` lui-même (forme uniquement, comme `Axe`/`Observation`) — la garantie que chaque id de `observationsLiees` référence une `Observation` réellement présente dans le même axe est portée par le mécanisme de résolution du parseur (voir ci-dessous), jamais par la couche `modeles/`.

**Résolution texte → id (`diagnosticResponseParser.js`, `bilanReconstruireAttentes`/`bilanResoudreObservationParTexte`) :** l'IA ne connaît jamais l'id généré d'une `Observation` argumentée — `attentes[].observationsLiees` reçu du Prompt 1 contient donc le **texte** de l'observation, recopié à l'identique, jamais un id. Le parseur résout ce texte vers le véritable id par correspondance exacte au sein des `observationsArgumentees` déjà reconstruites du même axe. Si deux observations partagent exactement le même texte, la première occurrence (index le plus bas) est retenue — règle déterministe, sans impact visible puisque le texte affiché est alors identique quel que soit l'id choisi. Aucune correspondance trouvée → anomalie `ReferenceInconnue`, la référence est simplement omise (jamais une référence orpheline conservée).

**Relations :**
- Une `Attente` appartient à exactement un `Axe` (via `axeLie`).
- Une `Attente` référence zéro, une ou plusieurs `Observation` du même axe.
- **Aucune relation avec `Recommandation`**, choix délibéré (doctrine du module « Carte de correspondance » : jamais le « quoi faire », seulement le raisonnement).

**Non amendé :** `Observation` reste inchangée — aucune notion de compétence n'y a été ajoutée (écartée après un exercice empirique, voir `docs/CHANTIER_CARTE_CORRESPONDANCE.md` section 5 : une même preuve illustre des compétences différentes selon l'attente considérée, une compétence ne peut donc jamais être une donnée stable).

---

### Recommandation

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | unique dans le `Diagnostic` |
| `contenu` | string | oui | non vide |
| `dimensionsLiees` | string[] (ids d'`Axe`) | oui | au moins un élément |
| `priorite` | `'critique'` \| `'haute'` \| `'moyenne'` \| `'faible'` | oui | |
| `extraitConcerne` | string \| null | non | |
| `observationsLiees` | string[] (ids d'`Observation`) | oui | au moins un élément |

**Validation :** `priorite` doit être cohérente avec la matrice de priorisation du référentiel des règles (poids de la dimension la plus élevée parmi `dimensionsLiees` × sévérité de l'axe correspondant). Une incohérence est **signalée comme anomalie**, jamais corrigée silencieusement par le parseur (voir invariants et erreurs).

**Relations :** référence un ou plusieurs `Axe` (jamais zéro) et une ou plusieurs `Observation` (jamais zéro). Peut être citée dans `planAction`, et référencée par au plus une `DemandeAmelioration` active à la fois.

---

### Diagnostic

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | |
| `candidatureId` | string | oui | référence vers `Candidature` |
| `contexteAnalyse` | `ContexteAnalyse` | oui | |
| `promptTexte` | string | oui | texte réellement transmis |
| `dateGeneration` | string (ISO) | oui | |
| `statut` | `'genere'` \| `'complete'` \| `'echec_parsing'` | oui | |
| `resultat` | `DiagnosticResultat` \| null | oui | null tant que `statut ≠ 'complete'` |
| `texteBrutReponseIA` | string \| null | conditionnel | présent si `statut ∈ {complete, echec_parsing}` |

**Validation :** `statut = 'complete'` ⇒ `resultat` non null. `statut = 'echec_parsing'` ⇒ `texteBrutReponseIA` non vide et `resultat` null.

**Relations :** référence exactement une `Candidature`. Une Candidature peut avoir plusieurs `Diagnostic` dans le temps, un seul est actif dans `diagnosticStore` à un instant donné.

---

### DiagnosticResultat

Contenu pur, sans identité propre, imbriqué dans `Diagnostic.resultat` — reprend **exactement** le schéma de sortie du Prompt 1 V2.

| Propriété | Type | Obligatoire | Règle de validation |
|---|---|---|---|
| `metaDiagnostic.niveauAnalyse` | number | oui | égal à `Diagnostic.contexteAnalyse.niveau` |
| `metaDiagnostic.dimensionsNonEvaluables` | array | oui | peut être vide |
| `alertesPrioritaires` | array | oui | peut être vide |
| `syntheseGenerale.statutPreparation` | `'pret'` \| `'a_ajuster'` \| `'a_retravailler'` | oui | ne peut valoir `'pret'` si `alertesPrioritaires` non vide |
| `syntheseGenerale.resumeNarratif` | string | oui | non vide |
| `premiereImpression` / `ceQuiDonneEnvie` / `ceQuiPeutFreiner` | `{ texte: string }` | oui | |
| `axes` | résultat d'axe[] | oui | chaque `axeId` existe dans `axeAnalyseRegistry` |
| `recommandations` | `Recommandation[]` | oui | peut être vide (candidature déjà solide) |
| `planAction` | string[] (ids) | oui | chaque id existe dans `recommandations` |
| `syntheseProjectionRecruteur.texte` | string | oui | |

---

### PropositionAmelioration

| Propriété | Type | Obligatoire |
|---|---|---|
| `id` | string | oui |
| `demandeAmeliorationId` | string | oui |
| `recommandationId` | string | oui |
| `proposition` | string | oui, non vide |
| `justification` | string | oui, non vide |
| `actionsConcretes` | string[] | oui, au moins un élément |

**Relations :** référence exactement une `DemandeAmelioration` et, via elle, exactement une `Recommandation`.

### Objet de support — DemandeAmelioration *(non listé explicitement, nécessaire à la cohérence)*

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | |
| `diagnosticSourceId` | string | oui | traçabilité uniquement, jamais relu |
| `recommandationSelectionnee` | `Recommandation` | oui | **copie**, pas une référence |
| `observationsResolues` | `Observation[]` | oui | **copie** des observations citées par la recommandation |
| `objectifs` | string[] | non | texte libre de l'utilisateur |
| `dateCreation` | string (ISO) | oui | |

**Pourquoi une copie et non une référence :** une `DemandeAmelioration` doit rester valide même si le `Diagnostic` d'origine est régénéré ensuite (invariant, section 3).

---

## 2. Interfaces publiques

Pour chaque composant : ce qu'il reçoit, ce qu'il retourne, ce qu'il garantit. Aucune implémentation.

| Composant | Reçoit | Retourne | Garantit |
|---|---|---|---|
| `hostDataAdapter` | rien (accès direct, lecture seule, à l'app hôte) | `DonneesBrutesCandidat` (structure minimale, champs à `null` si absents) | ne modifie jamais les données de l'app hôte |
| `contexteCandidatureCollector` | `DonneesBrutesCandidat` + saisie libre | `Candidature` (`confidentialiteValidee: false`) | `cv` toujours renseigné ou erreur métier ; `hashContenu` toujours cohérent |
| `relectureConfidentialite` 🔒 *(local à `collecte/`, pas un service externe)* | `{ contenu: candidature.cv }` | `Promise<{ contenuValide }>` | ne se résout jamais sans action explicite de l'utilisateur ; réutilise les vidéos/messages déjà existants dans `js/app.js` (`DEMOS_VIDEO_ERIP`) sans les dupliquer |
| `niveauAnalyseDetector` | `Candidature` (validée) | `{ niveau, donneesManquantes }` | `niveau` toujours 1-4 ; jamais 4 sans lettre + entretien ; jamais appelé avant validation 🔒 |
| `axeAnalyseRegistry` | rien, ou un `id` | `Axe[]` ou `Axe` ou `undefined` | catalogue figé, toujours les 10 mêmes entrées |
| `faitsExtractor` | `Candidature` (validée) | `Observation[]` (`factuelle`) | déterministe à `hashContenu` égal ; jamais de jugement de valeur ; jamais appelé avant validation 🔒 |
| `promptTemplateLoader` | rien | `string` (template brut) | lecture disque une seule fois par session |
| `diagnosticPromptBuilder` | `Candidature` (validée) + `ContexteAnalyse` | `{ texte, dateGeneration, hashContexteUtilise }` | aucun placeholder non résolu ; 🔒 vérifie `confidentialiteValidee === true`, sinon `RelectureNonValidee` |
| `diagnosticResponseParser` | texte brut collé + `Axe[]` | `DiagnosticResultat` ou échec de parsing explicite | ne lève jamais d'exception non gérée ; génère les `id` d'observation manquants ; 🗺️ résout `attentes[].observationsLiees` (texte) vers les ids réels d'`Observation` du même axe, jamais un id inventé conservé |
| `selectionAmeliorationManager` | `DiagnosticResultat` + id(s) de `Recommandation` + objectifs | `DemandeAmelioration` | erreur métier si un id n'existe pas ; copie, jamais référence |
| `ameliorationPromptBuilder` | `DemandeAmelioration` | `PromptAmelioration` | ne contient jamais le CV complet ni le diagnostic complet |
| `ameliorationResponseParser` | texte brut collé | `AmeliorationResultat` ou échec de parsing explicite | mêmes garanties que `diagnosticResponseParser` |
| `diagnosticStore` | opérations de lecture/écriture | état demandé, ou confirmation | une seule Candidature active ; jamais deux Diagnostic actifs pour la même Candidature |
| `moduleOrchestrator` | événements de haut niveau | selon l'événement | aucune étape hors ordre (erreur métier sinon) |
| `index.js` | appels de `app.js` | API publique de `moduleOrchestrator` | aucun autre fichier du module accessible depuis l'extérieur |

---

## 3. Invariants

Règles qui ne doivent jamais être violées, quelle que soit l'implémentation :

1. Toute `Observation`, `Recommandation`, `Diagnostic`, `PropositionAmelioration` possède un identifiant unique généré à sa création — jamais laissé à la charge de l'IA pour les observations argumentées.
2. Une `Observation`, une fois créée, n'est jamais modifiée : seulement lue et référencée. Toute évolution produit une nouvelle observation.
3. Un `Diagnostic` est toujours rattaché à exactement une `Candidature`.
4. Une `Recommandation` référence toujours au moins un `Axe` et au moins une `Observation` — jamais orpheline.
5. Le catalogue `axeAnalyseRegistry` est figé à l'exécution : aucun ajout, suppression ou modification en cours de fonctionnement.
6. Un axe de poids amplificateur ou contextuel ne reçoit jamais `'prioritaire'`, sauf la dérogation Lisibilité déjà actée dans le Prompt 1 — traitée comme une exception explicite à cet invariant, jamais comme une violation silencieuse.
7. `syntheseGenerale.statutPreparation` ne vaut jamais `'pret'` si `alertesPrioritaires` contient au moins un élément.
8. `diagnosticStore` ne contient jamais deux `Diagnostic` simultanément actifs pour la même `Candidature`.
9. Une `DemandeAmelioration` fige son contenu (copie) au moment de sa création — elle reste valide même si le `Diagnostic` d'origine est régénéré ensuite.
10. Aucune écriture dans `diagnosticStore` n'a lieu en dehors d'un appel de `moduleOrchestrator`.
11. 🔒 **Amendement.** Aucun composant du module ne construit ni ne copie un texte destiné à une IA externe tant que `Candidature.confidentialiteValidee` n'est pas `true`. Cette vérification est portée par `diagnosticPromptBuilder` lui-même — pas seulement par l'ordre des appels de `moduleOrchestrator` — pour que la garantie tienne même en cas d'appel direct hors séquence.

---

## 4. Erreurs métier

Erreurs nommées et identifiables, pas des exceptions JavaScript génériques.

| Erreur | Déclenchée par | Condition | Comportement attendu de l'appelant |
|---|---|---|---|
| `CandidatureInvalide` | `contexteCandidatureCollector` | `cv` absent ou vide | interrompre le déclenchement, inviter à compléter le CV |
| `RelectureNonValidee` 🔒 | `diagnosticPromptBuilder` | appel avec `confidentialiteValidee !== true` | bloquer, rediriger vers `ServiceConfidentialite.demanderRelecture()` — jamais de contournement |
| `RelectureAnnulee` 🔒 | `ServiceConfidentialite` (propagée par `moduleOrchestrator`) | l'utilisateur annule l'écran de relecture | interrompre tout le flux, ne rien construire, ne rien stocker |
| `NiveauIncoherent` | `niveauAnalyseDetector` | configuration de données impossible (ex. niveau 4 sans lettre) | signale un bug amont, jamais une erreur utilisateur |
| `PlaceholderNonResolu` | `diagnosticPromptBuilder` | une donnée obligatoire manque à l'assemblage | vérifier `Candidature`/`ContexteAnalyse` avant l'appel |
| `ReponseIllisible` | `diagnosticResponseParser`, `ameliorationResponseParser` | aucun bloc JSON identifiable dans le texte collé | proposer à l'utilisateur de recoller ou relancer l'IA |
| `ReponseIncomplete` | `diagnosticResponseParser`, `ameliorationResponseParser` | JSON valide mais un champ obligatoire du contrat manque | conserver `texteBrutReponseIA`, statut `echec_parsing`, jamais présenter une donnée partielle comme complète |
| `ReferenceInconnue` | `diagnosticResponseParser` | un id référencé (axe, observation, recommandation) n'existe pas | anomalie consignée, le reste du `DiagnosticResultat` reste exploitable |
| `RecommandationInexistante` | `selectionAmeliorationManager` | id de recommandation sélectionné absent du `DiagnosticResultat` courant | bloquer la sélection, signaler à l'interface |
| `SequenceInvalide` | `moduleOrchestrator` | étape appelée hors ordre (ex. amélioration sans diagnostic complet) | bloquer l'appel, ne rien modifier dans le store |
| `EtatIncoherent` | `diagnosticStore` | écriture qui violerait un invariant (section 3) | rejeter l'écriture, état précédent conservé intact |

---

## 5. Validation finale

Avec cet amendement intégré, l'architecture du module Bilan de candidature — y compris la contrainte de confidentialité — est considérée comme **définitivement figée**. Le développement peut commencer, fichier par fichier, dans l'ordre de dépendance déjà établi, complété d'un préalable : **`modules/confidentialite/` se développe et se teste avant `modules/bilan-candidature/collecte/`**, puisque `contexteCandidatureCollector` en dépend dès la première étape du flux. Ordre complet : `modules/confidentialite/` → `bilan-candidature/modeles/` → `collecte/` → `analyse/` → `diagnostic/` → `amelioration/` → `core/` → `index.js`. Chaque composant reste testé individuellement avant intégration, conformément à l'objectif : réfléchir deux fois, coder une seule fois.
