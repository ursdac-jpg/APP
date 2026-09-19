# Chantier « Carte de correspondance » *(nom provisoire)* — Conception fonctionnelle

**Statut** : **conception close et figée (2026-08-19)**, sur les plans fonctionnel et architectural — doctrine, conception fonctionnelle, contrat de données, jeu de données test, comparaison de représentations, maquettes validées, validation fonctionnelle, évolution du Prompt 1 (`docs/CHANTIER_PROMPT1_ATTENTES.md`) et audit d'architecture avec corrections intégrées. Ne plus rouvrir cette conception pour une modification opportuniste pendant l'implémentation — toute évolution d'architecture réellement nécessaire fait l'objet d'un nouveau chantier. Reste à faire : l'implémentation (parseur, modèles, interface, tests), hors périmètre de ce document.

**Rattachement** : décline `docs/DOCTRINE_CARTE_CORRESPONDANCE.md` en décisions concrètes de contenu. Ne contient aucun écran, aucune forme de représentation visuelle — ce sera l'objet d'un document de maquettes séparé, une fois ce modèle stabilisé.

---

## 1. Le modèle de lecture idéal

Posé indépendamment de ce que produit aujourd'hui le diagnostic Bilan de candidature — la comparaison vient en section 3.

### Entités

- **Attente** : une exigence ou un critère que le poste vise, formulée le plus concrètement possible (ex. « expérience en accueil client », « autonomie sur la gestion d'un planning », « maîtrise d'un logiciel précis »). Peut venir du texte d'une offre précise, ou être plus générique quand seul un métier/secteur est visé sans offre.
- **Preuve** : un fait concret déjà écrit par la personne dans sa candidature — une mission, un chiffre, une réalisation, une expérience datée. C'est ce qui ancre le raisonnement dans du réel (doctrine, principe 1), et ce qui ne change jamais, quel que soit le contexte dans lequel elle est lue.
- **État de couverture d'une attente** : « Plusieurs éléments » / « Un élément » / « Aucun élément » — jamais un score ni un pourcentage (doctrine, principe 4). *(Vocabulaire final, aligné sur la décision de maquette — voir `CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md` section 0.)*

**Pas une entité du modèle : la compétence.** Une même preuve peut illustrer des compétences différentes selon l'attente à laquelle on la confronte (« coordonné une équipe de 5 personnes » peut lire aussi bien du management, de la communication, de l'organisation ou de l'autonomie). La compétence n'est donc pas un fait stable mais une interprétation, dépendante du contexte — elle n'a pas sa place dans le modèle de données, seulement, le cas échéant, dans une couche de présentation ultérieure (doctrine, principe 2 révisé).

### Relations à rendre visibles

1. **Attente → Preuve(s)** — la seule relation structurante. Une attente peut être reliée à zéro, une, ou plusieurs preuves.
2. **Attente → État de couverture** — dérivé mécaniquement du nombre de preuves reliées (jamais un jugement séparé porté sur l'attente elle-même).

### Informations indispensables / utiles / facultatives

**Indispensable** :
- La liste des attentes du poste effectivement considérées par le diagnostic (sans elle, aucune structure n'est possible).
- Pour chaque attente, les preuves qui y répondent — ou l'absence explicite de preuve.
- L'état de couverture par attente, purement descriptif.

**Utile, mais pas indispensable** :
- Un pointeur vers l'extrait exact du CV où la preuve est écrite (sur le même principe que `extraitConcerne`, déjà utilisé ailleurs dans le Bilan de candidature) — utile pour que la personne retrouve où c'est écrit, mais l'absence de ce pointeur n'empêche pas de comprendre le raisonnement.

**Ne relève jamais du modèle de données, seulement, si besoin, de l'affichage** :
- Toute compétence nommée à partir d'une preuve — une interprétation à déduire au moment de la présentation, jamais à stocker (voir section 5).

**Facultatif / hors périmètre de ce module, doit rester dans le rapport texte** :
- Les autres axes du diagnostic (crédibilité, risques, lisibilité, etc.) — ce module se limite à l'adéquation avec le poste, il ne devient pas une deuxième version complète du rapport.
- Les recommandations correctives elles-mêmes (le « quoi faire »). Le module montre le raisonnement, jamais la correction — c'est la doctrine du module (« l'idée n'est pas de lui dire quoi modifier »).
- La synthèse narrative globale et la projection recruteur : restent des contenus du rapport texte, jamais dupliqués ici.

---

## 2. Jusqu'où sans créer de nouvelle analyse

Application concrète du principe 3 de la doctrine à ce modèle :

**Reste de la présentation, jamais une nouvelle analyse** :
- Nommer une attente que l'IA a déjà nécessairement identifiée pour produire son évaluation actuelle de l'axe « Adéquation avec le poste » — elle raisonne déjà dessus en interne, lui demander de l'expliciter n'ajoute aucune capacité, seulement une trace de ce qu'elle fait déjà.
- Relier une attente aux preuves déjà présentes dans les observations/points forts/points faibles qu'elle produit déjà pour cet axe.
- Regrouper ou réorganiser des éléments déjà produits par le diagnostic autour de l'attente qu'ils éclairent.

**Deviendrait une nouvelle analyse, à ne jamais faire** :
- Demander à l'IA de comparer la candidature à des profils fictifs ou à un référentiel externe non fourni.
- Produire un score ou une note par attente, même déguisé (une note interne convertie ensuite en icône reste une note).
- Ajouter un second passage IA indépendant qui réévaluerait la candidature sous un angle différent de celui déjà produit par le Prompt 1.
- Étendre le niveau de détail au-delà de ce que le prompt actuel évalue déjà (ex. inventer des attentes non déductibles du poste/de l'offre réellement fournie).

---

## 3. Comparaison avec ce que le diagnostic produit réellement aujourd'hui

Vérifié directement dans le code (`prompts/bilan-v1.md`, `modules/bilan-candidature/modeles/{axe,observation,recommandation}.js`, `modules/bilan-candidature/analyse/{faitsExtractor,axeAnalyseRegistry}.js`), pas supposé.

| Entité/relation du modèle idéal | Existe aujourd'hui ? |
|---|---|
| **Attente** (individuelle, nommée) | **Non.** L'axe `adequation` est évalué comme un tout (une restitution qualitative globale 🟢🟡🔴 + des tableaux de texte libre `pointsForts`/`pointsFaibles`/`incoherences`/`risques`) — aucune entité « attente » individuelle n'existe dans le schéma. |
| **Preuve** (pointeur structuré vers un fragment du CV) | **Partiellement.** `recommandations[].extraitConcerne` est un extrait du CV copié mot pour mot — mais il n'existe que pour les recommandations correctives (donc surtout les points faibles), jamais pour illustrer ce qui va déjà bien. Les seules « observations factuelles » calculées de façon déterministe aujourd'hui (`faitsExtractor.js`) se limitent à un seul détecteur (cohérence des dates de chronologie) — rien qui extraie une réalisation ou un chiffre comme preuve exploitable. |
| **Compétence reliée à une preuve** | **Non, pas dans le diagnostic.** Le profil (`dossier.competences`) contient des compétences, mais rien ne les relie individuellement aux preuves du diagnostic. |
| **État de couverture par attente** | **Non.** Seule la restitution qualitative de l'axe entier existe, jamais par attente. |

**Conclusion de la comparaison** : les données actuelles ne suffisent pas pour la relation centrale du modèle (attente → preuve), parce que l'attente elle-même n'existe pas comme entité aujourd'hui — pas seulement la relation qui la relie à une preuve. Ce n'est pas un enrichissement léger qui comblerait ce manque : sans une liste d'attentes identifiées individuellement, il n'y a rien à représenter attente par attente, quelle que soit la forme retenue ensuite.

**Ce qui reste vrai malgré ce constat** : rien n'oblige à changer le *jugement* du diagnostic. Ce qui manque est une *restitution plus fine* de ce que l'IA détermine déjà en évaluant l'axe adéquation — cohérent avec le principe 3 de la doctrine et sa clarification, pas une exception à celui-ci.

---

## 4. Ce que ça implique pour la suite

**Le modèle fonctionnel met en évidence qu'il manque aujourd'hui une entité structurante : l'attente du poste.** Tant que cette entité n'existe pas dans le diagnostic, il est impossible de représenter fidèlement le raisonnement attendu par la doctrine — quelle que soit la forme visuelle retenue ensuite. La question n'est donc pas de choisir une représentation, mais de rendre explicite, dans le diagnostic lui-même, une information que l'IA détermine déjà implicitement pour produire son évaluation actuelle de l'axe adéquation.

Cette nuance est importante : elle n'ajoute aucune nouvelle capacité d'analyse. Elle demande seulement au diagnostic de restituer de manière structurée un raisonnement qu'il produit déjà pour arriver à son verdict sur l'adéquation — cohérent avec le principe 3 de la doctrine, pas une exception à celui-ci. Ce n'était pas l'objectif de départ de cette conception ; c'est la conséquence de ce que la comparaison de la section 3 révèle.

**Portée minimale envisageable**, à cadrer précisément avant toute écriture de prompt (hors périmètre de ce document, qui reste fonctionnel) :
- Concerne uniquement l'axe `adequation` — aucun autre axe n'est concerné par ce module.
- Demande à l'IA d'expliciter les attentes qu'elle a déjà identifiées pour évaluer cet axe, et de relier chacune aux observations qu'elle produit déjà — jamais une nouvelle capacité d'évaluation.
- Implique une conséquence à traiter explicitement : les diagnostics déjà générés avant ce changement n'auront pas cette structure. Le module devra soit rester indisponible proprement sur un ancien diagnostic (message clair, jamais un échec silencieux), soit accepter un mode dégradé qui n'affiche que ce que l'ancien format permet.

**Recommandation avant toute écriture de prompt** : ne pas commencer par le prompt lui-même. Concevoir d'abord le contrat de données précis de l'entité « attente » — noms des champs, relations avec les objets déjà existants (`Axe`, `Observation`, `Recommandation`), structure exacte, compatibilité avec les anciens diagnostics — sur le même modèle que la forme des objets `Observation`/`Recommandation` déjà stabilisée séparément de leur contenu réel (`modules/bilan-candidature/modeles/`). Une fois ce contrat stabilisé, l'écriture du prompt et du parseur devient une étape d'implémentation quasi mécanique, pas une nouvelle zone de décision.

**Ce que ce document ne tranche pas** : le contrat de données précis de l'entité « attente », la formulation exacte du prompt, la représentation visuelle, et le comportement précis face à un ancien diagnostic. Ce sera l'objet des étapes suivantes (validation de cette conception, contrat de données, puis maquettes).

---

## 5. Contrat de données de l'entité « Attente »

Même discipline que `modules/bilan-candidature/CONTRATS.md` (section 1, « Objets du domaine ») : uniquement l'objet, ses relations, les règles qui ne doivent jamais être violées — aucune ligne de prompt, aucun code. Pensé comme une brique du diagnostic, pas comme un objet propre à ce module de lecture : tout futur module d'ERIP qui aurait besoin de raisonner à partir des attentes d'un poste pourra s'appuyer sur le même contrat, sans qu'aucune ligne ici ne mentionne une représentation visuelle.

### Attente *(nouvelle sous-structure de « résultat d'axe »)*

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | généré de façon déterministe par le parseur, jamais par l'IA — même principe que `Observation` argumentée (`${axeId}-attente-${index}`) |
| `contenu` | string | oui | non vide — l'attente elle-même, formulée par le diagnostic (ex. « Expérience en gestion d'une équipe de plus de 5 personnes ») |
| `axeLie` | string (réf. `Axe.id`) | oui | aujourd'hui toujours `adequation` en pratique — le champ reste générique, aucune règle ci-dessous ne fige ce module sur cet unique axe |
| `observationsLiees` | string[] (ids d'`Observation`) | oui | peut être **vide** — c'est précisément le cas « non étayée » ; jamais un signe d'objet mal formé |

**Validation :** `observationsLiees` ne référence jamais un id d'`Observation` inexistant dans le même `DiagnosticResultat` (même règle que pour `Recommandation`).

**Relations :**
- Une `Attente` appartient à exactement un `Axe` (via `axeLie`).
- Une `Attente` référence zéro, une ou plusieurs `Observation` — c'est cette relation qui porte la ou les preuves au sens du modèle fonctionnel (section 1) : la preuve n'est pas un nouveau champ de texte sur `Attente`, elle vit déjà dans le `contenu` de l'`Observation` référencée.
- **Aucune relation directe avec `Recommandation`, choix délibéré et non un oubli** : la doctrine du module interdit d'afficher le « quoi faire », seulement le raisonnement — ce module n'a donc jamais besoin de naviguer d'une `Attente` vers une `Recommandation`. Si un lien s'avère un jour nécessaire, il passera par les `Observation` déjà partagées entre les deux, jamais par un nouveau champ croisé.

**État de couverture — dérivé, jamais stocké.** Une fonction pure (ex. `bilanAttenteEtatCouverture(attente)`) calcule « Plusieurs éléments » (2+ `observationsLiees`) / « Un élément » (1) / « Aucun élément » (0) — jamais un champ écrit par l'IA ou stocké séparément, pour ne jamais risquer une désynchronisation entre l'état affiché et les observations réellement présentes. Cohérent avec le principe 4 de la doctrine. *(Vocabulaire aligné le 2026-08-19 sur la décision de maquette — corrige une dérive où ce document avait gardé l'ancien vocabulaire à 4 catégories du premier jet, périmé depuis la simplification à 3 états.)*

### Aucun amendement à `Observation` — décision explicite, pas un oubli

Une hypothèse initiale envisageait un champ `competenceIllustree` optionnel sur `Observation`. Écartée après un exercice empirique (plusieurs observations réalistes confrontées à différentes attentes) : une même preuve illustre systématiquement des compétences différentes selon l'attente à laquelle on la confronte — la compétence n'est donc pas une propriété stable d'une `Observation`, ni même d'une relation figée entre une `Observation` et une `Attente`, mais une interprétation dépendante du contexte d'affichage. La stocker aurait figé une lecture parmi d'autres. `Observation` reste donc inchangée ; toute compétence affichée un jour sera déduite au moment de la présentation, jamais lue depuis une donnée stockée.

**Non retenu pour le noyau minimal** (utile, pas indispensable, cf. conception fonctionnelle section 1) : un pointeur vers l'extrait exact du CV sur `Observation` (sur le principe d'`extraitConcerne`, déjà présent sur `Recommandation`). À ajouter seulement si l'usage réel du module en révèle le besoin — cohérent avec la discipline déjà appliquée ailleurs dans ce module (« un détecteur n'a de raison d'exister que si un besoin réel l'exploite »).

### Compatibilité avec les anciens diagnostics

`attentes` est un tableau, potentiellement **vide**, jamais un champ absent ni un indicateur de version séparé — même convention que le reste du module (« liste vide = résultat normal »). Un diagnostic généré avant ce changement aura simplement `attentes: []` sur son axe `adequation`. Tout module consommateur (dont la future Carte de correspondance) doit traiter un tableau vide comme « structure non disponible pour ce diagnostic » et se dégrader proprement — jamais recalculer ou deviner des attentes a posteriori à partir du texte libre déjà produit, ce qui reviendrait à la nouvelle analyse interdite par le principe 3 de la doctrine.

---

## 6. Validation — CLOSE (2026-08-19)

La représentation retenue (section 0 de `docs/CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md`) a été vérifiée contre chaque principe de la doctrine et contre 4 cas d'usage concrets (preuves partagées entre attentes, aucune preuve, compétence déclarée sans réalisation, diagnostics anciens sans structure `attentes`). Trois cas confirmés conformes sans réserve. Un cas réel identifié, consigné ci-dessous comme exigence d'implémentation plutôt que comme un défaut de représentation.

**Exigence d'implémentation — état vide dédié pour les diagnostics sans structure `attentes`.** Quand `axes[].attentes` est absent ou vide (tout diagnostic généré avant l'introduction de cette structure — voir section 5, « Compatibilité avec les anciens diagnostics »), le module ne doit **jamais** afficher une page vide silencieuse : l'absence de données serait alors indiscernable d'un bug. Il doit afficher un état vide dédié, neutre et explicatif, du type :

> *Cette vue n'est pas disponible pour ce diagnostic. Relancez une analyse pour en profiter.*

Aucun ton d'erreur, aucune excuse — un simple constat suivi de l'action qui débloque la situation, cohérent avec le reste des messages d'état vide déjà présents dans ERIP.

**Principe général qui en découle**, noté dans `docs/NOTES_CHARTE_CONCEPTION_A_VENIR.md` : toute fonctionnalité dépendant d'un enrichissement futur du contrat de données doit prévoir un état de compatibilité explicite pour les données produites avant cet enrichissement — pas seulement pour ce module.

**Mise à jour (2026-08-19, plus tard le même jour)** : la conception fonctionnelle de la représentation est terminée, mais il manquait encore la conception de ce qui produit la donnée elle-même — l'évolution du Prompt 1. Voir `docs/CHANTIER_PROMPT1_ATTENTES.md`, document dédié, même discipline (modèle idéal puis comparaison au prompt réel). Ce n'est qu'une fois ce document lui aussi validé que la conception complète du chantier sera terminée et l'implémentation pourra commencer.

## 7. Idée différée, pas pour la V1

Pendant la comparaison des maquettes (2026-08-19) : permettre de cliquer sur une preuve pour voir toutes les attentes qu'elle illustre — pédagogique, car ça montre concrètement qu'une seule expérience peut répondre à plusieurs attentes différentes du poste. Cohérent avec la philosophie d'ERIP (apprendre à raisonner plutôt que recevoir un diagnostic tout fait), mais pas indispensable pour une V1 — à reprendre si le besoin se confirme après un usage réel, jamais anticipé.

## 8. Notes pour l'implémentation, identifiées en audit d'architecture (2026-08-19)

Trois points qui ne remettent pas en cause la conception, à garder en tête au moment d'écrire le code plutôt qu'à redécouvrir :

- **L'état de couverture ne doit jamais être stocké**, y compris par réflexe de codage rapide — la maquette de comparaison (non committée) le stockait en dur dans ses données de démonstration pour simplifier le prototype ; le contrat réel (section 5) l'exige dérivé à chaque lecture, jamais mis en cache sur l'objet `Attente`.
- **Le style visuel distinguant une observation « déclarative » sans réalisation associée** (ex. O24, « Maîtrise Word, Excel... ») n'a jamais été acté comme une décision de conception — seulement improvisé dans la maquette (italique). À trancher explicitement à l'implémentation : le garder, l'adapter, ou ne rien distinguer visuellement et laisser le texte de l'observation porter seul la nuance.
- **L'état vide dédié aux diagnostics anciens** (`attentes: []`, section 6) a été spécifié en prose mais jamais construit ni vérifié dans une maquette réelle, contrairement au reste de la représentation. À vérifier visuellement dès que l'écran existe, pas seulement à coder d'après la phrase de la section 6.

**Note d'implémentation (2026-08-19) — écran construit, les 3 points ci-dessus tranchés :**
- État de couverture : jamais stocké, comme prévu — `bilanRenduVueAttentes()` (`js/app.js`) appelle `bilanAttenteEtatCouverture()` à chaque rendu, aucun champ ajouté à `Attente`.
- Style « déclarative sans réalisation » (ex. O24) : **non retenu**. Aucune distinction visuelle par observation individuelle en V1 — seule la carte de l'attente change (bordure pointillée) selon son état de couverture global. Une preuve reste affichée telle quelle, sans jugement porté sur sa nature. Peut être rouvert si un besoin réel apparaît après usage.
- État vide dédié : construit et vérifié dans le navigateur (diagnostic sans `attentes`) — affiche bien « Cette vue n'est pas disponible pour ce diagnostic. Relancez une analyse pour en profiter. » plutôt qu'une liste silencieusement vide.

Écran : bascule « Vue standard » / « Voir le raisonnement par attente » intégrée à la carte de l'axe Adéquation dans `htmlBilanRapport()` (`js/app.js`), sur le principe déjà utilisé par Regard extérieur (bascule interne au rapport, jamais une page séparée) — cohérent avec la doctrine (accessible uniquement depuis le rapport du Bilan de candidature).
