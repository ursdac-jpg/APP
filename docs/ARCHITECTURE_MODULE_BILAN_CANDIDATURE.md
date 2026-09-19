# Architecture — Module "Bilan de candidature"

> Document d'architecture fonctionnelle uniquement. Aucun code, aucune interface graphique, aucun prompt IA n'est défini à ce stade. Ce document sert de base au développement futur du module.

---

## 1. Objectifs du module

Le module **Bilan de candidature** a pour mission d'évaluer la qualité, la pertinence et la perception d'une candidature, afin d'aider le candidat à comprendre comment celle-ci sera interprétée par un recruteur **avant son envoi**.

Il ne se limite à aucun document unique (CV, lettre, offre) ni à un seul angle d'analyse (stratégie de recherche, retour d'entretien). Il produit un diagnostic structuré, argumenté, organisé selon plusieurs axes complémentaires (forces, faiblesses, incohérences, risques, priorités d'amélioration).

Objectifs fonctionnels :

- Fournir un diagnostic structuré et argumenté d'une candidature, jamais un nouveau document (le module ne génère ni CV ni lettre).
- S'adapter aux données réellement disponibles, en fonctionnant à plusieurs niveaux de complétude (CV seul → CV + métier visé → CV + offre → à terme CV + lettre + préparation entretien).
- Permettre un diagnostic complet en **un seul passage IA externe** (pas d'API IA intégrée : l'utilisateur copie un prompt généré par le module vers une IA de son choix, puis colle la réponse dans le module).
- Permettre, à la demande explicite du candidat, un **second passage IA optionnel**, strictement ciblé sur une ou plusieurs recommandations choisies, sans jamais relancer un diagnostic complet.
- Rester totalement indépendant de la logique de l'application actuelle, afin de pouvoir être extrait tel quel vers une future application.
- Éviter tout doublon de traitement : une donnée observée une fois doit être conservée et réutilisée, jamais recalculée ni redemandée à l'IA inutilement.

Contraintes structurantes héritées des échanges :

- Aucune donnée n'est indispensable : le module doit fonctionner en mode dégradé si des informations manquent.
- Le second passage IA est toujours déclenché manuellement par l'utilisateur, après lecture du diagnostic, jamais automatiquement.
- Le second passage doit être construit uniquement à partir des éléments liés aux recommandations sélectionnées (éléments concernés, observations liées, objectifs d'amélioration) — jamais à partir du diagnostic complet ni des documents bruts en entier.

---

## 2. Découpage en composants

Le module est découpé en 12 composants, regroupés en 4 familles fonctionnelles :

**A. Accès et collecte des données**
1. `HostDataAdapter` — Adaptateur d'accès à l'application hôte
2. `ContexteCandidatureCollector` — Collecteur de contexte de candidature

**B. Analyse préparatoire (déterministe, sans IA)**
3. `NiveauAnalyseDetector` — Détecteur de niveau d'analyse disponible
4. `AxeAnalyseRegistry` — Référentiel des axes d'analyse
5. `FaitsExtractor` — Extracteur de faits factuels

**C. Passage IA n°1 — Diagnostic**
6. `DiagnosticPromptBuilder` — Générateur de prompt de diagnostic
7. `DiagnosticResponseParser` — Interpréteur de réponse de diagnostic

**D. Passage IA n°2 — Amélioration ciblée (optionnel)**
8. `SelectionAmeliorationManager` — Gestionnaire de sélection des recommandations
9. `AmeliorationPromptBuilder` — Générateur de prompt d'amélioration ciblée
10. `AmeliorationResponseParser` — Interpréteur de réponse d'amélioration

**E. Coordination et état**
11. `DiagnosticStore` — État central du module (source unique de vérité)
12. `ModuleOrchestrator` — Orchestrateur / façade publique du module

---

## 3. Responsabilités de chaque composant

### 3.1 `HostDataAdapter`
Seul composant autorisé à lire des données dans l'application actuelle (dossier candidat, CV en cours, etc.). Expose une interface étroite et en lecture seule, indépendante des structures internes de `app.js`. C'est l'unique point de couplage avec l'application hôte : à terme, extraire le module vers une autre application ne nécessite de réécrire que ce composant.

### 3.2 `ContexteCandidatureCollector`
Assemble un objet `ContexteCandidature` à partir de trois origines possibles : données lues via `HostDataAdapter`, saisie libre de l'utilisateur (ex. texte d'une offre collée), réponses à un questionnaire interne au module. Ne fait aucune interprétation : il collecte et normalise, sans juger de la qualité ou de la complétude des données.

### 3.3 `NiveauAnalyseDetector`
Détermine, à partir du `ContexteCandidature`, quel niveau d'analyse est atteignable (1 à 4) et liste explicitement les données manquantes pour atteindre le niveau supérieur. C'est le seul composant qui centralise la logique « que puis-je analyser avec ce qui est disponible ? » — aucun autre composant ne doit réimplémenter cette logique.

### 3.4 `AxeAnalyseRegistry`
Référentiel déclaratif des axes d'analyse possibles (ex. adéquation au poste, clarté et lisibilité, cohérence du parcours, perception recruteur, risques identifiés). Pour chaque axe, définit les conditions d'applicabilité selon le niveau d'analyse disponible. Sert de référence commune au générateur de prompt (ce qu'on demande à l'IA) et à l'interpréteur de réponse (ce qu'on s'attend à recevoir), afin que les deux ne divergent jamais.

### 3.5 `FaitsExtractor`
Calcule, sans aucun appel IA, des observations factuelles déterministes à partir du `ContexteCandidature` (ex. présence/absence d'un champ, recoupement de mots-clés entre CV et offre, structure du parcours). Chaque observation factuelle est calculée une seule fois et mémoïsée selon un hash du contexte source : si le contexte n'a pas changé, aucune recomputation n'a lieu.

### 3.6 `DiagnosticPromptBuilder`
Assemble le prompt du premier passage IA à partir du `ContexteCandidature`, des observations factuelles, du niveau d'analyse et des axes applicables. Produit un texte prêt à être copié par l'utilisateur. Le contenu précis du prompt est hors périmètre de ce document ; seule la responsabilité du composant est définie ici.

### 3.7 `DiagnosticResponseParser`
Interprète le texte collé par l'utilisateur (réponse de l'IA externe) et le structure en un `DiagnosticResultat` organisé par axes (observations argumentées, points forts, points faibles, incohérences, risques, recommandations priorisées). Conserve la traçabilité entre chaque recommandation et les observations qui la justifient — cette traçabilité conditionne la légèreté du second passage.

### 3.8 `SelectionAmeliorationManager`
Permet à l'utilisateur de choisir, après lecture du `DiagnosticResultat`, une ou plusieurs recommandations à approfondir. Construit une `DemandeAmelioration` en récupérant automatiquement les observations liées à chaque recommandation choisie (via la traçabilité posée en 3.7), sans jamais exposer l'ensemble du diagnostic.

### 3.9 `AmeliorationPromptBuilder`
Construit le second prompt strictement à partir de la `DemandeAmelioration` (recommandations sélectionnées, observations liées, objectifs d'amélioration). N'inclut jamais le diagnostic complet ni les documents bruts en intégralité — cette restriction est appliquée au niveau de la construction de la `DemandeAmelioration` (3.8), pas laissée à l'appréciation du prompt.

### 3.10 `AmeliorationResponseParser`
Interprète la réponse du second passage IA et la structure en un ou plusieurs `AmeliorationCiblee` (proposition, justification, actions concrètes), rattachés à la recommandation d'origine.

### 3.11 `DiagnosticStore`
Source unique de vérité du module : conserve le `ContexteCandidature`, le niveau d'analyse, les observations factuelles mémoïsées, le `DiagnosticResultat`, les `DemandeAmelioration` et leurs `AmeliorationResultat`. Aucun autre composant ne conserve de copie locale de ces données. Porte également la logique d'invalidation : si le contexte change (ex. CV modifié après un diagnostic), le store détermine ce qui devient obsolète.

### 3.12 `ModuleOrchestrator`
Point d'entrée public du module, seul composant appelé depuis l'extérieur (boîte à outils de l'application actuelle). Séquence les étapes (collecte → détection de niveau → extraction des faits → génération du prompt 1 → attente de réponse externe → interprétation → [sélection utilisateur] → génération du prompt 2 → attente de réponse externe → interprétation), sans contenir lui-même de logique métier. Garantit qu'une étape ne peut être déclenchée que si les étapes préalables sont satisfaites (ex. impossible de demander un second passage sans `DiagnosticResultat` existant).

---

## 4. Échanges de données entre les composants

Flux du premier passage (diagnostic) :

1. `ModuleOrchestrator` demande à `ContexteCandidatureCollector` de produire un `ContexteCandidature`, en s'appuyant sur `HostDataAdapter` (lecture app hôte) et, le cas échéant, sur la saisie libre / le questionnaire.
2. `ContexteCandidature` → `NiveauAnalyseDetector` → produit un `NiveauAnalyse` (niveau atteint + données manquantes).
3. `ContexteCandidature` + `NiveauAnalyse` → `AxeAnalyseRegistry` → détermine la liste des axes applicables.
4. `ContexteCandidature` → `FaitsExtractor` → produit ou réutilise (si déjà en cache dans `DiagnosticStore`) un ensemble d'`ObservationFactuelle`.
5. `ContexteCandidature` + `NiveauAnalyse` + axes applicables + `ObservationFactuelle[]` → `DiagnosticPromptBuilder` → produit un `PromptDiagnostic` (texte à copier).
6. L'utilisateur copie le `PromptDiagnostic` vers une IA externe, puis colle la réponse dans le module (donnée brute, hors du module jusqu'à ce point).
7. Texte brut de réponse + axes attendus (`AxeAnalyseRegistry`) → `DiagnosticResponseParser` → produit un `DiagnosticResultat` structuré, avec liens explicites recommandation → observations.
8. `DiagnosticResultat` → `DiagnosticStore` (persistance de l'état, aucune autre copie ailleurs).

Flux du second passage (amélioration ciblée, optionnel) :

9. L'utilisateur sélectionne une ou plusieurs recommandations issues du `DiagnosticResultat` (lu depuis `DiagnosticStore`) → `SelectionAmeliorationManager` → produit une `DemandeAmelioration` (recommandations + observations liées + objectifs, sans le reste du diagnostic).
10. `DemandeAmelioration` → `AmeliorationPromptBuilder` → produit un `PromptAmelioration` (texte à copier), indépendant du prompt de diagnostic.
11. L'utilisateur copie le `PromptAmelioration` vers une IA externe, puis colle la réponse dans le module.
12. Texte brut de réponse + `DemandeAmelioration` d'origine → `AmeliorationResponseParser` → produit un ou plusieurs `AmeliorationCiblee`.
13. `AmeliorationCiblee[]` → `DiagnosticStore`, rattachés à la `DemandeAmelioration` correspondante.

Principe transversal : chaque flèche ci-dessus ne transporte que l'objet strictement nécessaire à l'étape suivante — jamais l'intégralité du contexte ou du diagnostic par défaut. Le `DiagnosticStore` est systématiquement le point de lecture/écriture ; aucun composant ne transmet directement des données à un autre composant en le contournant.

---

## 5. Objets JavaScript principaux

Description conceptuelle des structures de données (pas d'implémentation) :

- **`ContexteCandidature`** — `cv`, `metierVise`, `offreEmploi`, `lettreMotivation` *(futur)*, `preparationEntretien` *(futur)*, `dateDerniereMaj`, `hashContenu` (empreinte utilisée pour la mémoïsation et l'invalidation du cache).

- **`NiveauAnalyse`** — `niveau` (1 à 4), `donneesDisponibles[]`, `donneesManquantes[]`.

- **`AxeDefinition`** *(porté par `AxeAnalyseRegistry`)* — `nom`, `description`, `niveauxApplicables[]`.

- **`ObservationFactuelle`** — `id`, `axe`, `contenu`, `sourcesDonnees[]`, `hashContexteSource` (permet de savoir si elle reste valide ou doit être recalculée).

- **`PromptDiagnostic`** — `id`, `texte`, `niveau`, `axesInclus[]`, `dateGeneration`, `hashContexteUtilise`.

- **`ObservationArgumentee`** *(issue de l'IA, distincte des `ObservationFactuelle`)* — `id`, `axe`, `contenu`, `observationsFactuellesLiees[]`.

- **`PointFort` / `PointFaible` / `Incoherence` / `Risque`** — structure commune : `id`, `axe`, `contenu`, `observationsLiees[]`.

- **`Recommandation`** — `id`, `contenu`, `priorite`, `axe`, `observationsLiees[]`, `statut` (`nouvelle` / `selectionnee` / `traitee`).

- **`DiagnosticResultat`** — `id`, `niveau`, `dateReception`, `axes[]` (chacun regroupant ses observations argumentées, points forts, points faibles, incohérences, risques), `recommandations[]`, `texteBrutReponseIA` (conservé pour traçabilité/relecture).

- **`DemandeAmelioration`** — `id`, `recommandationsSelectionnees[]`, `observationsLiees[]`, `objectifs[]`, `dateCreation`.

- **`PromptAmelioration`** — `id`, `texte`, `demandeAmeliorationId`, `dateGeneration`.

- **`AmeliorationCiblee`** — `id`, `recommandationId`, `proposition`, `justification`, `actionsConcretes[]`.

- **`AmeliorationResultat`** — `id`, `demandeAmeliorationId`, `ameliorationsCiblees[]`, `texteBrutReponseIA`.

- **`EtatModule`** *(porté par `DiagnosticStore`)* — `contexteCandidature`, `niveauAnalyse`, `observationsFactuelles[]`, `diagnosticResultat`, `demandesAmelioration[]`, `ameliorationResultats[]`.

---

## 6. Organisation idéale des fichiers

Le module vit dans un dossier dédié, isolé de la logique actuelle, avec un seul point d'entrée exposé au reste de l'application :

```
modules/
  bilan-candidature/
    index.js                        → façade publique (expose ModuleOrchestrator uniquement)

    core/
      moduleOrchestrator.js
      diagnosticStore.js

    collecte/
      hostDataAdapter.js             → seul fichier autorisé à toucher aux données de l'app actuelle
      contexteCandidatureCollector.js

    analyse/
      niveauAnalyseDetector.js
      axeAnalyseRegistry.js
      faitsExtractor.js

    diagnostic/
      diagnosticPromptBuilder.js
      diagnosticResponseParser.js

    amelioration/
      selectionAmeliorationManager.js
      ameliorationPromptBuilder.js
      ameliorationResponseParser.js

    modeles/
      contexteCandidature.js
      diagnosticResultat.js
      demandeAmelioration.js
      ...                            → définitions/structures des objets de la section 5
```

Principes d'organisation :

- `app.js` ne référence que `modules/bilan-candidature/index.js` (façade), jamais les fichiers internes.
- `collecte/hostDataAdapter.js` est le seul fichier du module qui peut connaître des détails de l'application actuelle ; tous les autres fichiers ne manipulent que les objets définis dans `modeles/`.
- Un dossier = une famille de responsabilités (cf. section 2), ce qui permet d'extraire le dossier `bilan-candidature/` entier vers une autre application en ne réécrivant que `hostDataAdapter.js`.

---

## 7. Points de vigilance pour garantir une architecture maintenable

- **Un seul point de couplage avec l'app actuelle.** Toute tentation de lire une donnée de l'application ailleurs que dans `HostDataAdapter` casse l'indépendance recherchée. À surveiller particulièrement au moment de l'intégration dans la boîte à outils.

- **Robustesse du parsing des réponses IA.** Le texte collé par l'utilisateur est une donnée externe non garantie. `DiagnosticResponseParser` et `AmeliorationResponseParser` doivent tolérer des variations de formulation et prévoir un repli (conserver le texte brut exploitable) si la structure attendue n'est pas reconnue, plutôt que d'échouer silencieusement.

- **Contrat de format partagé, unique.** Ce que le prompt demande (`DiagnosticPromptBuilder`, via `AxeAnalyseRegistry`) et ce que le parseur attend (`DiagnosticResponseParser`) doivent provenir de la même source de référence. Toute évolution du format de réponse attendu ne doit se faire qu'à un seul endroit, sous peine de désynchronisation silencieuse entre génération et interprétation.

- **Mémoïsation fiable des faits factuels.** Le hash de contexte utilisé par `FaitsExtractor` doit refléter fidèlement tout changement pertinent (CV modifié, offre changée) — un hash trop grossier fait manquer une mise à jour nécessaire, un hash trop fin annule le bénéfice de la mémoïsation.

- **Invalidation explicite, jamais implicite.** Quand le `ContexteCandidature` change après qu'un `DiagnosticResultat` existe déjà, `DiagnosticStore` doit décider explicitement si ce diagnostic devient obsolète (et le signaler) plutôt que de laisser cohabiter silencieusement un diagnostic périmé avec un contexte à jour.

- **Traçabilité recommandation → observations, non négociable.** C'est elle qui permet au second passage de rester minimal (section 1). Si cette traçabilité se perd lors du parsing, le second prompt n'aura d'autre choix que de réintégrer du contexte superflu, ce qui va à l'encontre de l'objectif de sobriété des appels IA.

- **Aucune logique de niveau dupliquée.** La question « qu'est-ce qui est analysable avec ce qui est disponible ? » doit rester dans `NiveauAnalyseDetector` uniquement. Si un autre composant se met à tester lui-même la présence d'une donnée pour adapter son comportement, la logique se fragmente et devient incohérente à mesure que le niveau 4 (lettre, entretien) sera ajouté.

- **États d'attente explicites.** Le module n'appelant aucune IA directement, il existe des états où le module attend une action externe de l'utilisateur (coller une réponse). Ces états doivent être représentés explicitement par `ModuleOrchestrator` plutôt que déduits implicitement de l'absence de données.

- **Second passage strictement borné.** La restriction « pas de diagnostic complet, pas de documents bruts entiers » doit être appliquée au moment de construire la `DemandeAmelioration` (donnée elle-même volontairement restreinte), et non laissée à la discrétion de la rédaction du prompt — ce qui la rendrait fragile à toute évolution future du prompt.

- **Préparer l'extraction dès la conception.** Aucun fichier hors `hostDataAdapter.js` ne doit importer quoi que ce soit issu de `app.js` ou du DOM de l'application actuelle. Un test simple de maintenabilité : le dossier `modules/bilan-candidature/` doit pouvoir être copié tel quel dans un projet vide, avec uniquement `hostDataAdapter.js` à réécrire.
