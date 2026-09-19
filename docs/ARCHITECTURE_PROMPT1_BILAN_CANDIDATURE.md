# Architecture du Prompt 1 (Diagnostic IA) — Module « Bilan de candidature »

> Document de conception uniquement. Aucun prompt complet, aucun texte destiné à être envoyé à une IA, aucun code. Il décrit la structure logique du futur Prompt 1, afin que sa rédaction se limite ensuite à remplir des blocs déjà définis. S'appuie sur [ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md](ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md), [REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md](REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md) et [PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md](PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md), sans s'y substituer.

## Rôle du Prompt 1

Produire, en un seul passage IA, un bilan de candidature complet : analyser, expliquer, prioriser. Ne jamais proposer directement de corrections rédigées — cela reste le rôle exclusif du Prompt 2, déclenché séparément et à la demande du candidat.

---

## 1. Données d'entrée

### Obligatoire
- **CV** — seule donnée strictement nécessaire pour déclencher un diagnostic (niveau 1).

### Facultatives, par ordre d'utilisation croissante
1. **Métier visé** (texte libre ou sélection) — active le niveau 2, permet une évaluation générique de l'adéquation.
2. **Offre d'emploi** (texte collé) — active le niveau 3, affine l'adéquation, active la dimension *Personnalisation*.
3. **Entreprise ciblée** (nom, secteur) — donnée complémentaire optionnelle qui affine *Adéquation*, *Personnalisation* et *Projection recruteur*, sans constituer un niveau à part entière ; elle enrichit le niveau atteint plutôt que de le faire progresser.
4. **Lettre de motivation** et **préparation d'entretien** *(évolution future)* — activent le niveau 4 et la dimension *Cohérence transversale du dossier*.

Cette hiérarchie reprend telle quelle celle définie dans l'architecture du module ; ce document n'y ajoute que la place de l'« entreprise ciblée » comme enrichissement transversal plutôt que comme palier supplémentaire.

### Comportement en cas d'absence

Principe unique, valable pour toute donnée manquante : **le modèle ne comble jamais un vide par une supposition**. Une dimension non évaluable au niveau atteint doit être explicitement marquée comme telle dans la sortie plutôt que traitée par approximation. Le détail des cas concrets est développé en section 9.

### Ordre d'utilisation par le modèle

Le CV reste la donnée de référence tout au long du raisonnement. Les données facultatives interviennent comme des filtres successifs qui *affinent* la lecture du CV, jamais comme des données traitées indépendamment de lui : le métier visé et l'offre ne sont jamais analysés seuls, uniquement en regard du CV.

---

## 2. Observations déterministes injectées

### Principe

Toute information calculable sans raisonnement (comptage, présence/absence, comparaison lexicale, calcul de dates) est produite une seule fois par l'application, avant l'appel IA, et fournie en entrée du Prompt 1 avec un identifiant stable. **Aucune de ces observations n'est recalculée par le modèle** — le prompt doit l'énoncer comme une contrainte explicite, pour éviter qu'un modèle « refasse le travail » et produise un résultat divergent de celui déjà calculé par l'application.

### Inventaire injecté, par catégorie

- **Structure du document** — rubriques présentes/absentes, longueur totale, homogénéité de mise en forme des dates et titres, fautes détectables. *(Présence des coordonnées retirée le 2026-08-10 : le CV analysé par le Bilan ne les contient jamais, voir hostDataAdapter.js.)*
- **Chronologie** — dates de chaque expérience, durée de chaque poste, trous détectés, chevauchements ou incohérences de dates, durée moyenne par poste, nombre de postes sur une période donnée.
- **Correspondance avec la cible** *(si métier visé et/ou offre disponibles)* — recouvrement de mots-clés entre CV et offre, présence des compétences explicitement citées dans l'offre, comparaison des intitulés de poste.
- **Contenu et formulation** — présence de chiffres/pourcentages dans les descriptions, ratio verbes d'action / formulations passives, présence de formulations génériques non étayées, doublons de formulations d'une expérience à l'autre, présence de mots-clés comportementaux.
- **Personnalisation** *(si offre disponible)* — taux de recouvrement lexical CV/lettre ↔ offre, présence du nom de l'entreprise ou du poste dans la lettre.
- **Cohérence transversale** *(niveau 4 uniquement)* — contradictions factuelles détectées entre CV et lettre (dates, intitulés, chiffres).

Cet inventaire correspond exactement aux observations déterministes déjà listées dimension par dimension dans le référentiel métier ; il est régroupé ici par catégorie plutôt que par dimension, car une même observation (ex. le recouvrement de mots-clés) alimente plusieurs dimensions à la fois (voir section 4).

### Règle de non-duplication à l'injection

Une observation factuelle n'est injectée **qu'une seule fois**, même si plusieurs dimensions s'en servent. C'est la mise en relation entre une observation et une dimension qui se fait côté raisonnement IA (via l'identifiant de l'observation), jamais une réinjection de la même donnée sous des libellés différents.

---

## 3. Ordre de raisonnement du modèle

L'ordre suit directement la lecture d'un recruteur telle que décrite dans la philosophie d'évaluation, plutôt qu'un simple parcours technique des dimensions :

1. **Cadrage du contexte** — quel niveau de données est disponible, donc quelles dimensions sont réellement évaluables à ce passage.
2. **Prise en compte des observations déterministes fournies** — lecture, jamais recalcul.
3. **Détection des éléments non-compensables** — traitée en priorité absolue, avant toute analyse fine, car elle conditionne le statut global du bilan (cf. philosophie, règles de non-compensation).
4. **Première impression** — restitution de l'effet produit par le document dans les premières secondes (mobilise principalement *Lisibilité* et l'adéquation apparente).
5. **Analyse progressive des dimensions**, dans l'ordre de leur poids plutôt que dans l'ordre du référentiel :
   - dimensions déterminantes (Adéquation, Crédibilité, Risques) ;
   - dimensions différenciatrices de qualité (Impact, Cohérence du parcours) ;
   - dimensions amplificatrices restantes (Différenciation, Posture professionnelle perçue) ;
   - dimensions contextuelles si le niveau le permet (Personnalisation, Cohérence transversale).
6. **Synthèse de projection recruteur** — calculée en dernier parmi les dimensions, car elle se nourrit des conclusions déjà produites plutôt que d'une nouvelle lecture du CV.
7. **Priorisation des recommandations** — croisement du poids de chaque dimension et de la sévérité observée (matrice définie en section 5).
8. **Rédaction de la synthèse générale et du statut de préparation** — dernière étape, car elle résume l'ensemble du raisonnement précédent plutôt que de l'anticiper.

Cet ordre garantit qu'aucune étape ne nécessite de revenir en arrière relire le CV : chaque étape s'appuie sur les conclusions déjà posées par les étapes précédentes.

---

## 4. Exploitation des 11 dimensions

### Ordre de traitement

Identique à l'ordre défini en section 3 (poids décroissant : déterminantes → différenciatrices → amplificatrices → contextuelles), *Projection recruteur* toujours en dernier car dimension de synthèse.

### Dépendances entre dimensions

| Dimension | Dépend de |
|---|---|
| Adéquation avec le poste | Observations déterministes uniquement |
| Crédibilité | Observations déterministes uniquement |
| Risques et signaux d'alerte | Observations déterministes + conclusion d'Adéquation (pour qualifier un décalage de niveau) |
| Impact / valeur démontrée | Observations déterministes uniquement |
| Cohérence du parcours | Observations déterministes uniquement |
| Lisibilité et structure | Observations déterministes uniquement — analysée une seule fois, dès l'étape « première impression » |
| Différenciation | Observations déterministes + conclusion d'Adéquation (pour juger la pertinence d'un élément distinctif par rapport à la cible) |
| Posture professionnelle perçue | Observations déterministes + métier visé/offre si disponibles |
| Personnalisation de la candidature | Observations déterministes + conclusion d'Adéquation |
| Cohérence transversale du dossier | Conclusion de Cohérence du parcours, étendue aux données de niveau 4 |
| Projection recruteur | Conclusions de **toutes** les dimensions précédentes — aucune observation déterministe propre |

### Règle anti-redondance

Chaque dimension n'est analysée qu'une seule fois. Deux cas particuliers à cadrer explicitement dans le prompt :

- **Lisibilité** est évaluée une seule fois, dès l'étape « première impression » (section 3, étape 4) ; sa conclusion est ensuite simplement **réutilisée**, jamais réanalysée, lorsque le rapport final la présente à nouveau parmi le détail des dimensions.
- **Projection recruteur** ne relit jamais le CV : elle **synthétise** les conclusions déjà écrites des autres dimensions. Le prompt doit l'interdire explicitement de reformuler une nouvelle observation brute à ce stade.

### Synthèses intermédiaires

Chaque dimension produit une conclusion autonome et citable (observations argumentées, points forts/faibles, niveau de restitution) *avant* que la dimension suivante ne soit traitée. Ces conclusions intermédiaires sont ce que consomment ensuite les étapes 6 et 7 (Projection recruteur, priorisation) — jamais les données brutes d'origine une seconde fois.

---

## 5. Format de sortie

Structure JSON complète attendue, décrite ici par ses champs et leur rôle — sans exemple de valeurs ni prompt associé.

- **`metaDiagnostic`** (objet)
  - `niveauAnalyse` — niveau atteint (1 à 4).
  - `dimensionsEvaluees` — identifiants des dimensions effectivement analysées.
  - `dimensionsNonEvaluables` — identifiants des dimensions non évaluables à ce niveau, chacune avec la donnée manquante qui la débloquerait.

- **`alertesPrioritaires`** (tableau, éléments non-compensables — peut être vide)
  - `id`, `type` (incohérence chronologique / contradiction / crédibilité — "coordonnées" retiré le 2026-08-10, le CV transmis au diagnostic ne les contient jamais, voir `docs/PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md`), `description`, `dimensionLiee`.

- **`syntheseGenerale`** (objet)
  - `statutPreparation` — valeur qualitative (prêt / à ajuster / à retravailler, cf. philosophie section 6, jamais un score).
  - `resumeNarratif` — synthèse en langage clair.

- **`premiereImpression`** (objet)
  - `texte`.
  - `dimensionsMobilisees` — références aux dimensions utilisées pour la produire (typiquement Lisibilité, Adéquation apparente).

- **`ceQuiDonneEnvie`** / **`ceQuiPeutFreiner`** (objets narratifs)
  - `texte`.
  - `dimensionsReferencees` — identifiants, pas de contenu dupliqué depuis `axes`.

- **`axes`** (tableau, un élément par dimension évaluée)
  - `id` (identifiant stable de la dimension).
  - `niveauImportance` (déterminant / différenciateur / amplificateur / contextuel).
  - `restitutionQualitative` (valeur normalisée correspondant à l'échelle 🟢🟢🟡🔴).
  - `observationsArgumentees` — tableau de constats, chacun référencant les `id` des observations factuelles utilisées (jamais leur contenu recopié).
  - `pointsForts`, `pointsFaibles`, `incoherences`, `risques` — tableaux, présents seulement si pertinents pour la dimension.
  - `recommandationsLiees` — tableau d'`id` pointant vers l'objet `recommandations` racine (pas de duplication du contenu).

- **`recommandations`** (tableau global, dédupliqué — une recommandation n'existe qu'à un seul endroit)
  - `id`, `contenu`, `dimensionsLiees`, `priorite` (issue de la matrice de la section suivante), `extraitConcerne` (court extrait du CV, copié mot pour mot, à remplir dès qu'un passage précis est concerné ; `null` seulement quand aucun ne l'est ; décision du 2026-08-10, ce champ n'existait auparavant que pour le Prompt 2, section 6, il sert désormais aussi à retrouver automatiquement où corriger le CV), `observationsLiees` (`id` des observations factuelles et/ou argumentées qui la justifient).

- **`planAction`** (tableau ordonné de références aux `id` de `recommandations` déjà prioritaires — aucun nouveau contenu).

- **`syntheseProjectionRecruteur`** (objet)
  - `texte`.
  - `axesMobilises` — tous les `id` d'axes, car dimension transversale par construction.

### Matrice de priorisation des recommandations

| Poids de la dimension | 🔴 Prioritaire | 🟡 À renforcer |
|---|---|---|
| Déterminant | Critique *(ou déjà couvert par `alertesPrioritaires` si non-compensable)* | Haute |
| Différenciateur | Haute | Moyenne |
| Amplificateur | Moyenne | Faible |
| Contextuel | Faible à Moyenne | Faible |

Cette matrice applique directement la hiérarchie à quatre niveaux définie dans la philosophie d'évaluation ; elle remplace un simple tri par ordre du référentiel.

---

## 6. Éléments utilisés par le Prompt 2

Le Prompt 2 ne reçoit **jamais** l'intégralité de `DiagnosticResultat`. Il reçoit uniquement, pour la ou les recommandations sélectionnées par l'utilisateur :

- l'objet **`recommandation`** sélectionné dans son intégralité (`id`, `contenu`, `dimensionsLiees`, `priorite`, `extraitConcerne`) ;
- les **observations liées** référencées par `observationsLiees` (déterministes et/ou argumentées), résolues à partir de leurs `id` — jamais l'ensemble des observations du diagnostic ;
- l'**extrait concerné** du CV/de l'offre s'il existe, jamais le document complet ;
- les **objectifs d'amélioration** exprimés par l'utilisateur au moment de la sélection (portés par `DemandeAmelioration`, définie dans l'architecture du module).

Le champ `extraitConcerne` prévu dans le schéma de sortie (section 5) existe spécifiquement pour permettre cette transmission ciblée sans devoir rouvrir le CV complet lors du second passage.

---

## 7. Informations visibles par l'utilisateur

- **Visible** — `syntheseGenerale`, `alertesPrioritaires` (reformulées de façon constructive, cf. philosophie section 7), `premiereImpression`, `ceQuiDonneEnvie`, `ceQuiPeutFreiner`, le détail des `axes` (restitution qualitative, observations argumentées, points forts/faibles, recommandations en clair), `planAction`, `syntheseProjectionRecruteur`.
- **Interne, jamais affiché tel quel** — les `id` techniques (dimensions, observations, recommandations), `metaDiagnostic.dimensionsNonEvaluables` sous sa forme brute (reformulé pour l'utilisateur en invitation à compléter une donnée, jamais montré comme un champ technique).
- **Réservé au moteur, jamais affiché** — le texte brut intégral de la réponse IA (conservé côté `DiagnosticStore` pour traçabilité/débogage, cf. architecture du module), les identifiants de hash de contexte, la structure de dépendances entre dimensions.

---

## 8. Optimisation des performances

- **Réduction des tokens en entrée** — n'injecter que les observations déterministes pertinentes pour le niveau d'analyse effectivement atteint, jamais l'inventaire complet de toutes les catégories quel que soit le niveau.
- **Réduction des tokens en sortie** — le système de références par `id` (recommandations, observations, dimensions) décrit en section 5 évite toute duplication de texte entre `axes`, `recommandations` et `planAction`.
- **Suppression des redondances de calcul** — une observation qui alimente plusieurs dimensions (ex. le recouvrement de mots-clés utile à la fois à *Adéquation* et à *Risques*) n'est injectée qu'une fois (section 2) et seulement référencée à chaque usage.
- **Mutualisation des analyses** — *Lisibilité* n'est analysée qu'une fois et réutilisée pour la première impression et le détail par dimension ; *Projection recruteur* ne relit jamais le CV, elle synthétise des conclusions déjà écrites.
- **Compatibilité multi-plateformes IA** — le format de sortie attendu doit être décrit en langage naturel dans le prompt, sans dépendre d'un mode « JSON strict » propriétaire à une seule plateforme, afin de rester utilisable tel quel avec ChatGPT, Claude ou une autre IA générative.
- **Un seul passage garanti** — aucune étape du raisonnement (section 3) ne requiert d'information supplémentaire à demander en cours de route : toutes les données nécessaires sont fournies dès l'entrée, ou explicitement marquées absentes (section 9).

---

## 9. Gestion des cas particuliers

Principe transversal : **dégrader proprement plutôt qu'halluciner**. Le prompt doit explicitement autoriser, voire obliger, le modèle à répondre qu'une dimension est non évaluable plutôt que de combler un vide par une supposition.

- **Aucun métier renseigné** — *Adéquation avec le poste* passe en `dimensionsNonEvaluables` avec pour donnée manquante le métier visé ; les dimensions qui en dépendent (*Différenciation*, *Posture professionnelle perçue*, *Personnalisation*) restent limitées à ce qui est observable indépendamment d'une cible.
- **Aucune offre fournie** — *Adéquation* reste évaluable au niveau générique du métier visé si disponible (niveau 2) ; *Personnalisation* passe systématiquement en `dimensionsNonEvaluables`.
- **CV très incomplet** (peu de détails par expérience, rubriques manquantes) — les observations déterministes signalent explicitement le manque (ex. rubrique compétences absente) ; le modèle limite ses conclusions à ce qui est réellement présent et ne doit jamais inventer une compétence ou un résultat non mentionné pour « compléter » une dimension.
- **Données contradictoires** (ex. durée totale annoncée incohérente avec les dates détaillées) — remontées automatiquement en `alertesPrioritaires` (non-compensable, cf. philosophie section 3), jamais lissées silencieusement par une interprétation du modèle qui choisirait une version plutôt qu'une autre.

---

## 10. Blocs logiques du futur Prompt 1

Identification des blocs, de leur ordre et de leur rôle, sans rédaction de contenu.

1. **Bloc de cadrage du rôle** — positionne le modèle dans la posture attendue (lecture combinée recruteur / CIP / consultant RH, cf. philosophie section 1), avant toute donnée.
2. **Bloc de mission et de limites** — rappelle que le modèle analyse, explique et priorise, qu'il ne rédige jamais de correction directe, et qu'il ne doit jamais halluciner une information absente.
3. **Bloc de données d'entrée structurées** — CV, et selon disponibilité : métier visé, offre, entreprise ciblée (section 1).
4. **Bloc des observations déterministes** — les faits pré-calculés avec leurs identifiants, accompagnés de l'instruction explicite de ne jamais les recalculer (section 2).
5. **Bloc de périmètre d'analyse** — liste des dimensions applicables au niveau atteint, et de celles à marquer non évaluables (section 1 et 9).
6. **Bloc de méthode de raisonnement** — la séquence en huit étapes définie en section 3, incluant les règles de dépendance et anti-redondance de la section 4.
7. **Bloc de règles de priorisation** — poids des dimensions, règles de non-compensation, matrice de priorisation des recommandations (section 5).
8. **Bloc de spécification du format de sortie** — le schéma complet défini en section 5, formulé de façon compatible avec plusieurs plateformes IA (section 8).
9. **Bloc de gestion des cas particuliers** — les comportements de repli attendus face à des données absentes ou contradictoires (section 9).

Ces neuf blocs, dans cet ordre, constitueront le squelette du Prompt 1 : la rédaction future consistera à remplir chaque bloc, sans en changer ni l'ordre ni le rôle.

---

## Utilisation prévue de ce document

Ce document devient la référence à suivre lors de la rédaction effective du Prompt 1 :

- il fixe la **liste exacte des données à transmettre** et leur ordre (section 1) ;
- il fixe la **liste exacte des observations déterministes** que `FaitsExtractor` devra produire (section 2) ;
- il fixe la **méthode de raisonnement** à imposer au modèle (section 3 et 4) ;
- il fixe le **schéma de sortie** que `DiagnosticResponseParser` devra savoir interpréter (section 5) ;
- il fixe le **sous-ensemble de données** que `SelectionAmeliorationManager` et le futur Prompt 2 devront exploiter (section 6) ;
- il fixe les **comportements de repli** à formuler explicitement dans le prompt (section 9) ;
- il fournit le **plan de rédaction** du prompt lui-même (section 10).

Toute rédaction du Prompt 1 doit remplir ces neuf blocs sans s'en écarter ; en cas de doute sur le contenu exact d'un bloc, revenir au référentiel métier (le quoi) et à la philosophie d'évaluation (le pourquoi) avant de trancher.
