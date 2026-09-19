# Architecture du Prompt 2 (Amélioration ciblée) — Module « Bilan de candidature »

> Document de conception uniquement. Aucun prompt complet, aucun code. S'appuie sur [PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md](PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md), [REFERENTIEL_REGLES_EVALUATION.md](REFERENTIEL_REGLES_EVALUATION.md) et [ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md](ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md), sans redériver ce qu'ils établissent déjà — le Prompt 2 les **applique** à un périmètre volontairement restreint, il ne redéfinit rien.

---

## 1. Philosophie

Le Prompt 2 partage intégralement la philosophie générale déjà posée pour le Prompt 1 : jamais décourager, toujours constructif, jamais halluciner, sujet grammatical toujours le document, jamais la personne. Rien de cela n'est redéfini ici.

**Ce qui change** : la mission elle-même. Le Prompt 1 s'interdit strictement de proposer une correction — le Prompt 2 existe exclusivement pour ça, mais seulement pour un extrait et une recommandation déjà validés par le diagnostic, jamais en rouvrant une analyse.

**Principe fondateur, non négociable** : le Prompt 2 ne relit jamais le diagnostic complet, ne relit jamais le CV complet, ne recalcule jamais une information déjà produite. Tout ce dont il a besoin lui est transmis explicitement.

---

## 2. Rôle et limites précises

**Rôle** : à partir d'une recommandation déjà sélectionnée et des observations qui la justifient, produire une proposition d'amélioration concrète et argumentée, accompagnée d'actions pratiques.

**Ce qu'il ne fait jamais :**
- Ne relit jamais le CV complet ni le diagnostic complet — seuls l'extrait concerné, la recommandation et les observations résolues lui sont fournis.
- Ne réanalyse jamais une dimension, ne recalcule jamais une sévérité ou une priorité — ce travail appartient exclusivement au Prompt 1. **Ne produit jamais un nouveau diagnostic, sous quelque forme que ce soit.**
- N'invente jamais un fait absent des observations ou de l'extrait fournis — même règle de prudence que le Prompt 1 (référentiel des règles, section 7).
- **Ne traite jamais plusieurs recommandations à la fois** : une `DemandeAmelioration` = une recommandation = une `PropositionAmelioration`. Cette relation 1:1 garantit *structurellement* qu'un échec sur une recommandation ne peut jamais affecter une autre — pas seulement par tolérance de parsing comme au Prompt 1, mais parce que chaque cycle est indépendant par construction.
- Ne modifie jamais le CV lui-même et ne prétend jamais le faire — sa proposition reste une suggestion, le candidat garde la main.

### Règle de périmètre strict (ajoutée après vérification du 2026-08-08)

**Test opérationnel** : la proposition ne doit jamais porter sur autre chose que `extraitConcerne` — ou, en son absence, sur autre chose que ce que décrit littéralement `recommandation.contenu`. Rien d'autre, même si une amélioration semble évidente ailleurs dans l'extrait fourni ou dans les observations.

- **`extraitConcerne` présent** — la proposition est un remplacement direct de cet extrait précis, rien de plus large.
- **`extraitConcerne` absent** (champ optionnel sur `Recommandation`, ex. « ajouter une rubrique manquante », qui n'a rien à citer en remplacement) — la proposition reste une suggestion générale bornée par `recommandation.contenu` seul, jamais étendue à un passage particulier du CV que le modèle choisirait lui-même.
- **`objectifs` module le COMMENT, jamais le QUOI** — un objectif libre du candidat (ex. « un ton plus direct ») ajuste le style de la proposition sur le même périmètre, il ne l'autorise jamais à s'étendre à autre chose. Même si `objectifs` semble inviter une amélioration plus large (« je veux que tout soit plus percutant »), le périmètre reste strictement celui de la recommandation sélectionnée.

Cette règle répond directement à l'exigence : « le Prompt 2 ne doit jamais produire quelque chose que l'utilisateur n'a pas explicitement demandé ». Elle est ce qui garde l'amélioration parfaitement traçable jusqu'à sa recommandation d'origine.

---

## 3. Données d'entrée exactes

Reprend exactement, et rien de plus, le contenu de `DemandeAmelioration` (déjà défini dans `CONTRATS.md` / `modeles/demandeAmelioration.js`) :

- `recommandationSelectionnee` — `id`, `contenu`, `dimensionsLiees`, `priorite`, `extraitConcerne`, `observationsLiees` : la recommandation telle que produite par le diagnostic, copiée, jamais relue depuis le diagnostic d'origine.
- `observationsResolues` — les `Observation` complètes (contenu, origine), pas seulement leurs id : le Prompt 2 n'a besoin d'aucun autre accès pour comprendre pourquoi la recommandation existe.
- `objectifs` — texte libre optionnel du candidat (ex. « je veux un ton plus direct »).

Rien d'autre : ni le CV complet, ni les autres axes du diagnostic, ni les autres recommandations, ni les alertes prioritaires, ni la synthèse générale.

---

## 4. Schéma JSON de sortie

```
{
  "proposition": "...",
  "justification": "...",
  "actionsConcretes": ["...", "..."]
}
```

Volontairement minimal. `recommandationId`/`demandeAmeliorationId` ne sont **jamais** demandés à l'IA : l'application les connaît déjà avec certitude — même principe que `niveauAnalyse` au Prompt 1 (jamais faire confiance à un écho de l'IA pour une donnée déjà connue). `ameliorationResponseParser.js` les renseignera directement depuis la `DemandeAmelioration` d'origine, jamais depuis la réponse.

### Vérification champ par champ — « ce champ apporte-t-il une valeur que l'application ne possède pas déjà ? »

- **`proposition`** — oui, sans ambiguïté : c'est un texte reformulé que seul un modèle de langage peut produire. Rien d'équivalent n'existe côté application. **Conservé.**
- **`justification`** — vérifié explicitement, car le risque de redondance est réel : `recommandation.contenu` (déjà connu, produit par le Prompt 1) porte déjà une justification, mais **générale** (« ajouter un résultat chiffré »). `justification` ici est différente : elle explique pourquoi **cette formulation précise** de `proposition` répond aux `observationsResolues` fournies — une information que l'application ne peut pas déduire elle-même, parce qu'elle dépend du texte réellement généré. **Conservé, mais borné explicitement** : ne justifie que le choix fait dans `proposition`, ne redevient jamais un commentaire général sur la candidature.
- **`actionsConcretes`** — le champ le plus à risque : sans garde-fou, il invite naturellement le modèle à suggérer des actions **au-delà** de l'extrait (« appliquez la même logique aux autres expériences ») — ce qui violerait directement la règle de périmètre strict ci-dessus. Retenu, mais **redéfini precisément** : uniquement des actions pour **utiliser** cette proposition précise (ex. « remplacez le paragraphe actuel par cette version », « vérifiez ce chiffre avant de l'utiliser »), jamais des suggestions sur d'autres parties du document. Sans cette précision, ce champ aurait dû être supprimé plutôt que risquer la dérive.

**Conclusion de la vérification** : le schéma reste à 3 champs, aucun ajout, aucune suppression — mais deux des trois (`justification`, `actionsConcretes`) sont désormais bornés par une définition plus stricte qu'avant cette vérification.

---

## 5. Architecture interne — blocs logiques

1. **Bloc de cadrage du rôle** — reprend la posture du Prompt 1 (recruteur/CIP/consultant RH), orientée action plutôt qu'analyse.
2. **Bloc de mission et limites** — les interdits de la section 2, formulés explicitement, y compris l'interdiction explicite de produire un nouveau diagnostic.
3. **Bloc de périmètre strict** — le test opérationnel de la section 2 (extrait présent/absent, rôle des objectifs) : bloc à part entière plutôt que noyé dans les limites générales, tant ce point est central à la demande.
4. **Bloc de données d'entrée** — la recommandation, les observations résolues, l'extrait concerné, les objectifs.
5. **Bloc de règles de prudence** — reprend telles quelles les règles de prudence du référentiel des règles d'évaluation (section 7), sans les redéfinir.
6. **Bloc de règles de restitution** — reprend telles quelles les règles de restitution (test du sujet grammatical, jamais culpabilisant), sans les redéfinir.
7. **Bloc de format de sortie** — le schéma minimal de la section 4, avec la définition bornée de chaque champ.

**7 blocs contre 9 pour le Prompt 1** — cohérent avec un périmètre volontairement plus étroit : pas de dimensions à cadrer, pas de méthode de raisonnement en plusieurs étapes, pas de matrice de priorisation à appliquer.

---

## Utilisation prévue

Une fois ce document validé, nous rédigerons `prompts/bilan-v2.md` en remplissant ces 7 blocs — même discipline que pour le Prompt 1 : conception d'abord, texte ensuite, jamais l'inverse.
