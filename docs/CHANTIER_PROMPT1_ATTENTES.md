# Chantier « Évolution du Prompt 1 — entité Attente » — Conception

**Statut** : conception uniquement, aucun fichier réel modifié (`prompts/bilan-v1.md`, son schéma JSON, `diagnosticResponseParser.js`, aucun code). Objectif : un document assez précis pour qu'une implémentation ultérieure n'ait plus à trancher de question de fond, seulement à écrire.

**Rattachement** : décline `docs/CHANTIER_CARTE_CORRESPONDANCE.md` section 5 (le contrat de données de l'entité `Attente`, déjà figé) et `docs/DOCTRINE_CARTE_CORRESPONDANCE.md`. Ce document ne redéfinit pas la forme d'`Attente` — il conçoit comment le Prompt 1 doit la produire sans rien altérer de ce qui existe déjà.

**Méthode** : modèle idéal d'abord (indépendant du texte actuel du prompt), comparaison avec le Prompt 1 réel ensuite — même discipline que pour la représentation.

---

## 1. Le modèle idéal

### 1.1 À quel moment du raisonnement les `Attente` doivent être produites

Le Prompt 1 suit aujourd'hui 7 étapes fixes (section 3 de `prompts/bilan-v1.md`) : Cadrage → Non-compensables → Première impression → Analyse progressive (déterminantes → différenciatrices → amplificatrices → contextuelles) → Projection recruteur → Priorisation → Synthèse générale. L'axe `adequation` est une dimension **déterminante**, analysée à l'étape 4.

**Les attentes ne peuvent exister ni avant, ni après cette étape.** Pas avant : le Cadrage (étape 1) ne fait que fixer le niveau d'analyse atteignable, il ne contient aucune lecture du poste. Pas après : la Projection recruteur et la Priorisation (étapes 5-6) sont des synthèses de conclusions déjà posées, jamais une nouvelle lecture du CV ou du poste — y ajouter les attentes reviendrait à une seconde passe d'analyse, interdite par le principe 3 de la doctrine.

**Conséquence directe** : produire les attentes n'est pas une nouvelle étape du raisonnement. C'est une explicitation de ce qui se passe déjà à l'intérieur de l'étape 4, au moment précis où l'axe `adequation` est traité — l'IA compare déjà silencieusement le profil aux exigences du poste pour produire sa restitution qualitative actuelle ; il s'agit de lui demander de nommer ce à quoi elle compare, pas de comparer une chose de plus.

### 1.2 Périmètre exact

Uniquement l'axe `adequation`. Aucun autre axe n'a besoin d'attentes au sens de ce module (déjà acté dans la doctrine et le contrat de données — `axeLie` reste générique dans le contrat, mais rien ne l'exploite ailleurs aujourd'hui).

**Condition d'existence.** L'axe `adequation` a un `niveauMinimum` de 2 (`axeAnalyseRegistry.js`) — en dessous, il est classé dans `dimensionsNonEvaluables`, jamais analysé. Les attentes suivent exactement la même règle : **aucune attente produite si `adequation` n'est pas évaluable**, jamais une liste d'attentes génériques produite par défaut pour combler l'absence de données. Cohérent avec le principe déjà appliqué à tout le prompt (« une absence d'information se signale, elle ne se devine jamais »).

### 1.3 Lier les `Attente` aux `Observation` sans créer de nouvelle analyse

Ici se trouve le point technique le plus fin de tout ce document — identifié en confrontant le contrat `Attente` (section 2) à la structure réelle du `DiagnosticResultat` (section 3.3).

`Attente.observationsLiees` référence des ids d'`Observation`. Or, dans le contrat actuel du « résultat d'axe » (`CONTRATS.md`), un seul champ est composé d'objets `Observation` porteurs d'un id : `observationsArgumentees[]`. Les autres (`pointsForts`, `pointsFaibles`, `incoherences`, `risques`) sont de simples tableaux de chaînes — **sans identifiant, donc non référençables par une `Attente`**.

Trois options, comparées :

- **Donner un id à `pointsForts`/`pointsFaibles`/etc.** — rejeté. Ça change la forme d'un contrat déjà stable et déjà consommé ailleurs (le rapport texte), pour un bénéfice qui ne concerne que ce module. Contredit directement l'exigence de ne rien altérer de la restitution déjà validée.
- **Laisser `Attente.observationsLiees` pointer aussi vers des index dans `pointsForts`/`pointsFaibles`** (une référence à deux formes selon la source) — rejeté. Complexifie inutilement le contrat pour un gain marginal, et introduit une hétérogénéité que le contrat de données a justement cherché à éviter.
- **`Attente.observationsLiees` ne référence jamais que `observationsArgumentees`** — retenu. Aucun champ existant n'est touché. La seule exigence posée au Prompt 1 : que les éléments concrets qui justifient une attente soient rédigés comme des `observationsArgumentees` de l'axe `adequation` (ce que l'IA fait déjà aujourd'hui, en partie — voir section 2), jamais uniquement comme un `pointFort` non structuré.

**Ce que ça implique concrètement pour le prompt** : aucune nouvelle capacité demandée à l'IA — seulement une consigne de forme, lui demander d'exprimer sous forme d'observations argumentées (déjà un mécanisme existant) les éléments qui, une fois lus ensemble, justifient chaque attente qu'elle identifie. C'est un changement de discipline rédactionnelle, pas un changement de raisonnement.

**Second point technique, découvert en écrivant le prompt réel (pas anticipé au moment de la rédaction ci-dessus) : par quoi une `Attente` référence-t-elle une `Observation`, sachant que l'IA ne connaît jamais l'id d'une observation argumentée ?** Vérifié dans `diagnosticResponseParser.js` : les ids des observations argumentées sont générés par le parseur (`${axeId}-obs-${index}`), jamais fournis par l'IA — limite déjà documentée et déjà acceptée pour `recommandations[].observationsLiees`, qui fonctionne aujourd'hui sur le même principe sans qu'aucune vérification de correspondance réelle ne soit faite par le parseur actuel (il accepte toute chaîne non vide). Plutôt que de reproduire cette même zone floue pour les attentes, la consigne retenue dans le prompt est explicite : `attentes[].observationsLiees` contient le **texte** de l'observation, recopié à l'identique, jamais un identifiant inventé. Charge au futur parseur de résoudre ce texte vers le véritable id généré, par correspondance exacte au sein du même axe — un mécanisme de résolution à écrire en implémentation, mais dont le principe (résoudre par le texte, jamais demander un id à l'IA) est acté ici.

**Troisième point technique, identifié en audit d'architecture (2026-08-19) : que fait le parseur si deux `observationsArgumentees` du même axe partagent exactement le même texte ?** La correspondance « exacte » devient alors ambiguë — plusieurs ids possibles pour un seul texte. **Règle de résolution actée** : le parseur retient la première occurrence rencontrée, par ordre d'apparition dans `observationsArgumentees` (comportement déterministe, pas aléatoire — le même texte produit toujours le même choix d'un parsing à l'autre). Conséquence acceptée : si les deux observations dupliquées diffèrent par ailleurs sur un champ non affiché par ce module (`observationsFactuellesLiees`), le mauvais lien interne pourrait être retenu — sans impact visible pour la personne, puisque ce module n'affiche jamais ce champ. Le texte rendu à l'écran reste, dans tous les cas, celui recopié par l'IA, donc correct qu'importe l'id choisi.

---

## 2. Comparaison avec le Prompt 1 réel — ce qui doit changer, et seulement ça

Vérifié directement dans `prompts/bilan-v1.md` et `ARCHITECTURE_TECHNIQUE.md` du module.

| Élément | Aujourd'hui | Changement requis |
|---|---|---|
| Étapes du raisonnement (section 3 du prompt) | 7 étapes fixes | **Aucune.** Les attentes s'insèrent dans l'étape 4 existante, jamais une 8e étape. |
| Schéma JSON, résultat d'axe | `axeId`, `restitutionQualitative`, `observationsArgumentees[]`, `pointsForts[]`, `pointsFaibles[]`, `incoherences[]`, `risques[]` | **Ajout d'un seul champ**, uniquement sur l'entrée `axeId: 'adequation'` : `attentes[]` (forme déjà figée, section 5 de `CHANTIER_CARTE_CORRESPONDANCE.md`). Aucun champ existant renommé, retiré ou retypé. |
| `observationsArgumentees` de l'axe `adequation` | Déjà produites, mais sans consigne explicite de les rendre exploitables individuellement comme preuves d'une attente précise | **Renforcement de consigne**, pas un nouveau mécanisme : demander explicitement que chaque attente identifiée s'appuie sur au moins une observation argumentée précise et citable, plutôt que sur une appréciation généraliste diffuse dans `pointsForts`. |
| Matrice de priorisation, `restitutionQualitative`, `statutPreparation`, `alertesPrioritaires` | Calculés à partir de l'analyse existante | **Aucun changement.** Les attentes sont un sous-produit **en lecture seule** de l'analyse de l'axe `adequation` — elles n'entrent dans aucun calcul de priorité, de statut ou d'alerte. |
| `axeAnalyseRegistry.js` (catalogue des 10 axes) | Poids, niveau minimum par axe | **Aucun changement.** Les attentes ne sont pas un 11e axe, seulement une sous-structure du résultat existant de l'axe `adequation`. |
| `diagnosticResponseParser.js` | Parse chaque axe, chaque recommandation indépendamment (tolérant, jamais tout-ou-rien) | **Extension symétrique** : parser `attentes[]` avec la même tolérance déjà appliquée ailleurs (une attente mal formée consignée en anomalie, jamais un échec de tout le diagnostic). **Un vrai ajout, pas seulement le patron existant** : résoudre `attentes[].observationsLiees` (des textes recopiés par l'IA, voir ci-dessus) vers les ids réels générés pour `observationsArgumentees` du même axe, par correspondance exacte de texte — première occurrence retenue si plusieurs observations partagent le même texte (règle déterministe, section 1.3) ; aucune correspondance trouvée consignée en anomalie, jamais une référence orpheline conservée telle quelle. |

**Constat global** : le changement touche un seul champ ajouté à une seule entrée du schéma, et une consigne de rédaction plus précise sur un mécanisme déjà existant. Rien dans le raisonnement, les autres axes, la priorisation ou la synthèse ne bouge.

---

## 3. Limites de cette évolution

- Ne couvre que l'axe `adequation` — jamais les 9 autres.
- Ne garantit aucune exhaustivité : l'IA identifie les attentes qu'elle juge les plus significatives, pas une liste exhaustive de chaque ligne d'une offre. Cohérent avec le fonctionnement déjà accepté de `pointsForts`/`pointsFaibles` (jamais garantis complets non plus).
- Ne fonctionne qu'à partir du niveau d'analyse où `adequation` devient évaluable (niveau 2) — en dessous, aucune attente, jamais une liste générique de repli.
- Ne change rien à la qualité de l'analyse elle-même : une candidature déjà mal évaluée aujourd'hui le restera, avec en plus une explication structurée de pourquoi — pas une nouvelle façon d'évaluer.

## 4. Cas limites à anticiper

- **Aucune offre précise, seulement un métier visé** (niveau 2, pas niveau 3) : attentes plus génériques, dérivées du métier plutôt que d'une offre — toujours valide, juste moins précis. Pas un cas d'échec.
- **Attente pertinente sans aucune observation qui l'illustre** : déjà couvert par le contrat (`observationsLiees` peut être vide — état « non étayée »), aucune consigne supplémentaire nécessaire.
- **Attentes redondantes ou qui se recouvrent** (l'IA produit deux attentes proches, ex. « accueillir un public » et « recevoir des usagers ») : risque réel à cadrer explicitement dans le prompt, sur le même principe déjà appliqué ailleurs dans le Prompt 1 (« jamais un contenu qui appartiendrait en réalité à une autre catégorie », déjà utilisé pour d'autres champs).
- **Nombre d'attentes non borné** : risque d'une liste trop longue (dilue la lecture) ou trop courte (perd en valeur pédagogique). Résolu en écrivant le prompt : borné à 3-6, par cohérence avec les bornes déjà en place pour les observations argumentées (2-4) et points forts/faibles (2-3) du même axe — pas un chiffre arbitraire nouveau, le même principe déjà accepté ailleurs dans ce prompt appliqué à ce nouveau champ.
- **Observation argumentée déjà écrite pour justifier un `pointFort`/`pointFaible`, réutilisable pour une attente** : pas un problème — rien n'empêche une même observation argumentée d'être à la fois listée dans `observationsArgumentees` et référencée par une `Attente` ; c'est même le comportement attendu et déjà validé pour les preuves partagées entre attentes (`docs/CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md`, section 5/8).
- **Diagnostic régénéré** (utilisateur relance une analyse) : les attentes d'un diagnostic remplacé disparaissent avec lui, comme le reste du `DiagnosticResultat` — aucune règle de persistance particulière à inventer.
- **Deux observations argumentées du même axe au texte strictement identique** : voir la règle de résolution déterministe (section 1.3, 3e point technique) — première occurrence retenue, sans impact visible pour la personne.
- **Ordre des attentes non garanti** : identifié en audit d'architecture (2026-08-19) — le choix de représentation (ordre naturel du poste, `CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md` section 0) suppose un ordre cohérent, qu'aucune consigne du prompt ne garantissait jusqu'ici. Corrigé directement dans `prompts/bilan-v1.md` (section 2, fin de la sous-section Attentes) : ordre de l'offre si elle est fournie, sinon un ordre logique (missions centrales avant compétences transverses) — jamais l'ordre interne, non significatif, dans lequel le modèle les aurait trouvées.

## 5. Garanties de non-altération du raisonnement existant

1. **Aucune étape ajoutée, aucune réordonnée** — les attentes naissent à l'intérieur de l'étape 4, jamais une étape 8.
2. **Aucun champ existant modifié** — `attentes[]` est strictement additif, sur une seule entrée du tableau `axes[]`.
3. **Aucune influence sur le calcul déjà établi, visée mais pas garantie par le seul texte du prompt.** `restitutionQualitative`, `statutPreparation`, `alertesPrioritaires`, la matrice de priorisation : rien ne les lit, rien ne les modifie dans la formulation retenue — c'est l'intention de conception. Mais un texte de prompt ne peut pas, à lui seul, garantir qu'expliciter un raisonnement structuré (les attentes) n'infléchit jamais légèrement la conclusion qualitative que le modèle produit par ailleurs pour ce même axe — effet déjà documenté pour les prompts à raisonnement structuré, pas spécifique à ce cas. **Vérification requise avant de considérer ce point acquis** : test comparatif, mêmes CV/offres, avec et sans la section « Attentes du poste » du prompt, `restitutionQualitative` et `statutPreparation` de l'axe `adequation` comparés sur chaque paire. Pas un test unitaire de code — un test de comportement du prompt, à mener une fois l'implémentation prête à être vérifiée en conditions réelles.
4. **`tests/bilanCoherencePrompt1CatalogueAxes.test.js`** (déjà existant, vérifie l'alignement catalogue/prompt) ne devrait pas être affecté tant que le catalogue des 10 axes n'est pas touché — à confirmer en implémentation, pas à supposer.
5. **Compatibilité ascendante déjà actée** : `attentes: []` pour tout diagnostic antérieur à ce changement (section 5 du chantier principal), avec état vide dédié côté représentation (section 6, Validation).

---

## 6. Où va la suite

**Mise à jour (2026-08-19) : `prompts/bilan-v1.md` porte désormais sa version définitive.** La formulation a été écrite directement dans le fichier réel (section 1 : ajout à « Tu dois uniquement » ; section 2 : nouvelle sous-section « Attentes du poste — axe Adéquation uniquement » ; section 3, étape 4 : moment de production précisé ; section 5 : champ `attentes` dans le schéma JSON, borne 3-6, et précision sur la résolution par texte plutôt que par id) — strictement additive, conforme aux garanties de la section 5 ci-dessus. Un second point technique a été résolu en l'écrivant (voir section 1.3, paragraphe final) : l'IA ne pouvant jamais connaître l'id généré d'une observation argumentée, `attentes[].observationsLiees` contient le texte de l'observation recopié à l'identique — la résolution texte → id revient au futur parseur.

Ce document ferme désormais entièrement la conception. Reste, en implémentation : l'extension de `diagnosticResponseParser.js` (reconstruction d'`attentes[]`, résolution texte → id des observations liées, anomalie si aucune correspondance) ; la vérification que `tests/bilanCoherencePrompt1CatalogueAxes.test.js` reste vert ; le modèle `modeles/attente.js` (forme + validation, sur le patron d'`axe.js`/`observation.js`) ; puis, seulement à ce moment, le branchement réel de la représentation déjà conçue et validée (`docs/CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md`).
