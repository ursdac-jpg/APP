# Architecture de la compréhension du CV — document de conception (V4, réflexion)

Statut : réflexion d'architecture, indépendante du chantier en cours (prototype V3 de fusion diagnostic + extraction). Aucun code, aucun prompt. Objectif : identifier le véritable objet manipulé par ERIP quand une IA lit un CV, avant de décider comment le produire.

Le V3 reste pertinent et répond à sa propre question ("peut-on économiser un aller-retour IA sans perte de qualité ?"). Ce document répond à une question différente et plus large : si on devait redessiner ERIP aujourd'hui, quel serait l'objet central du système ?

## Constat de départ

`dossier` (expériences, formations, compétences) et le diagnostic (recommandations, axes) ne sont pas deux choses de nature différente qui se trouveraient porter sur le même CV. Ce sont **deux sélections différentes appliquées au même matériau d'observation** :

- L'extraction dit : montre-moi tout, sans trier.
- Le diagnostic dit : montre-moi les 2 à 4 observations les plus significatives, triées.

Aucun des deux n'est le modèle. Le dossier est déjà une projection (les faits seulement, aucune observation qualitative n'est conservée). Le diagnostic est déjà une projection (une sélection stylée, dont le matériau brut n'est jamais capturé). Le véritable objet — l'ensemble des observations faites en lisant le CV, avant tout filtrage — n'a jamais été matérialisé nulle part dans ERIP.

## 1. L'unité fondamentale : l'Observation

Ni une expérience (trop large — une expérience contient de nombreuses observations), ni une recommandation (trop tardif — une recommandation est déjà une sélection ET une formulation destinée à un public). L'unité atomique est l'**Observation** : un constat isolé, neutre, fait par l'IA en lisant le CV.

Une Observation porte conceptuellement :

- **Ancrage** — à quoi elle se rattache : une Section précise (une expérience, une formation…), le Document dans son ensemble (structure globale, longueur), ou une Relation entre deux éléments (voir plus bas).
- **Nature** — le type de constat : un fait neutre ("pas de date de fin"), une qualité ("mission peu quantifiée"), une absence ("aucun mot-clé du secteur visé"), une incohérence ("intitulé de poste et missions décrites ne correspondent pas"), une force, une ambiguïté.
- **Preuve** — l'extrait de texte exact qui fonde l'observation. C'est ce qui permet la traçabilité déjà utilisée aujourd'hui (le rattachement recommandation → extrait du CV) ; elle doit être préservée quelle que soit l'architecture retenue.
- **Confiance** — certaine (une date absente est un fait vérifiable) ou inférée (un niveau de séniorité déduit du vocabulaire employé).
- **Valence brute** — signal plutôt positif, négatif ou neutre, et une estimation de son poids. Ce n'est pas encore un jugement final : c'est la matière première à partir de laquelle un jugement pourra être construit, par l'IA ou par l'application.
- **Dimension concernée** — à quel axe d'évaluation elle se rattache (les axes déjà connus d'ERIP : savoir, savoir-être, savoir-faire, présentation…).

Une expérience du CV devient ainsi un petit ensemble d'Observations, pas un bloc de texte à réinterpréter à chaque restitution.

## 2. Observations communes à toutes les restitutions

En comparant ce dont a besoin chaque restitution (diagnostic, extraction, score ATS, préparation d'entretien, lettre de motivation, et les modules futurs), un socle commun se dégage clairement :

- **Les faits** — universellement nécessaires. Toute restitution, même la plus spécialisée, a besoin de savoir ce qui s'est réellement passé (dates, intitulés, missions). C'est le socle de l'extraction, mais aussi la base de tout le reste.
- **La qualité** — quasi universelle. Diagnostic, ATS et préparation d'entretien ont tous besoin de savoir si une mission est claire, quantifiée, bien formulée.
- **Les ambiguïtés / incohérences** — utiles au diagnostic et à la préparation d'entretien (anticiper "explique-moi ce trou"), moins à l'extraction ou à la lettre.

Ce socle (faits + qualité + incohérences) est ce qui devrait être produit en priorité et de façon fiable, puisqu'il alimente presque tout le reste sans coût supplémentaire.

## 3. Observations spécifiques à une seule restitution

- **Correspondance à un métier cible** (mots-clés absents, alignement du vocabulaire) — ne sert qu'à l'ATS et à la Carte de correspondance déjà existante dans ERIP. Particularité importante : ce n'est pas une observation sur le CV seul, c'est une observation sur la **relation** entre le CV et une référence externe (un métier du répertoire).
- **Ton, ce qui est exprimé comme motivation** — ne sert qu'à la lettre de motivation. Rarement présent explicitement dans un CV, donc souvent absent du matériau de départ.
- **Points sensibles à anticiper** — spécifique à la préparation d'entretien. C'est une observation de second ordre : une observation *sur* une observation ("cette faiblesse sera probablement questionnée").
- **Mise en forme du document** (colonnes, tableaux, polices) — spécifique à la compatibilité ATS au sens strict. Particularité : ce n'est même pas une observation de contenu, c'est une observation sur la forme typographique du document — un axe entièrement différent des autres.

## 4. Ce qui peut être calculé côté application, sans nouveau raisonnement IA

C'est la question qui change le plus de choses concrètement, parce qu'elle détermine ce qui coûte réellement un passage IA et ce qui n'en coûte pas.

**Calculable côté application, une fois les Observations de base fiables :**
- Détection des trous chronologiques entre expériences — pur calcul de dates.
- Cohérence de l'ordre chronologique, chevauchements de périodes — pur calcul.
- Présence ou absence de mots-clés relatifs à un métier cible — un simple appariement de texte entre les missions extraites et un référentiel de mots-clés. ERIP dispose déjà de `data/metiers.js` et du module Carte de correspondance : cette capacité existe presque déjà, à condition que le texte des missions soit fiable.
- Agrégation en un score global (de type ATS) — une fois les signaux élémentaires obtenus, la somme/pondération est un calcul, pas un jugement.
- Application de la règle de non-compensation entre dimensions (aujourd'hui une instruction que le prompt de diagnostic demande à l'IA de suivre en prose) — si chaque dimension porte un score structuré, cette règle peut être appliquée de façon déterministe côté application, **chaque fois de la même manière**, ce qui est plus robuste qu'une IA qui "raisonne" cette règle à chaque passage.

**Nécessite réellement un raisonnement IA :**
- Juger si une mission est vague ou bien formulée.
- Détecter une incohérence sémantique entre un intitulé de poste et les missions décrites.
- Inférer un niveau de séniorité ou d'autonomie à partir du vocabulaire employé.
- Repérer un potentiel implicite (une mission qui suggère une compétence jamais nommée).
- Produire le texte final de n'importe quelle restitution — la génération de texte reste, par nature, un acte IA.

**Implication directe** : une partie de ce qu'on demande aujourd'hui à l'IA dans le diagnostic (repérage de trous, absence de mots-clés, agrégation en score) n'a en réalité pas besoin d'IA du tout, si l'extraction des faits est fiable. C'est du calcul déterministe déguisé en tâche IA. Moins on demande à l'IA de faire ce que l'application peut faire elle-même, plus le passage IA restant est court, fiable, et peu exigeant pour l'assistant utilisé — et plus les futures restitutions (ATS, en particulier) sont gratuites à ajouter.

## 5. Modèle conceptuel

Quatre objets, pas plus :

- **Document** — le CV comme unité globale. Porte les observations de niveau global (structure, longueur, cohérence du fil narratif).
- **Section** — un bloc que le CV contient (une expérience, une formation, une compétence, un engagement/loisir — les types qu'ERIP distingue déjà). Ancrée dans un extrait de texte, porte ses propres Observations.
- **Observation** — l'unité atomique définie au point 1, rattachée à un Document ou une Section.
- **Relation** — objet à part entière, pas un simple attribut. Relie deux Sections entre elles ("écart chronologique entre ces deux expériences", "compétence revendiquée mais jamais illustrée dans aucune expérience"), ou une Section à une **référence externe** (le métier cible, un référentiel de mots-clés). C'est un objet important car une bonne partie des observations les plus utiles (incohérences, correspondance ATS) sont fondamentalement relationnelles, pas des propriétés isolées d'un seul élément.

Hiérarchie : le Document contient des Sections ; Document et Sections portent des Observations ; des Relations connectent des Sections entre elles ou une Section à une référence externe.

## 6. Comment chaque restitution se dérive du modèle, sans jamais relire le CV

- **Extraction** — projection directe des Observations de nature "fait", groupées par Section. Quasiment un simple réagencement.
- **Diagnostic** — sélection des Observations les plus significatives (top N par dimension et par poids, règle de non-compensation appliquée côté application si les scores par axe existent), puis mise en forme pédagogique.
- **Score ATS** — agrégation calculée côté application à partir des Observations "mots-clés absents" / "quantification" et des Relations vers le référentiel métier. Probablement **aucun nouveau passage IA** requis si les Observations de base existent déjà.
- **Préparation d'entretien** — sélection des Observations "ambiguïté" / "incohérence" / "faiblesse", puis génération de questions probables. Ceci produit un contenu réellement nouveau (des questions), donc justifie un second passage IA dédié — mais qui part du modèle structuré, pas du CV brut : prompt plus court, plus fiable.
- **Lettre de motivation** — sélection des Observations "force", puis un passage de génération narrative dédié. Même logique : un second passage justifié par une vraie transformation de style, jamais par un besoin de relire le CV.

## Synthèse — ce que cet exercice change

Le résultat le plus concret de cette réflexion n'est pas "il faut un seul passage IA" ni "il en faut deux" — c'est que **la plupart du futur fan-out de restitutions (ATS, et une partie de la préparation d'entretien) ne coûte pas de nouveau passage IA du tout**, à condition que la couche d'Observations (faits + qualité + incohérences) soit produite une bonne fois, de façon fiable. Seules les restitutions réellement génératives et stylistiques (lettre, questions d'entretien) justifient un passage IA dédié — et celui-ci devient plus court et plus fiable en partant du modèle structuré plutôt que du texte brut du CV.

Concrètement, cela repositionne le chantier en cours : le V3 (deux blocs indépendants, chacun formé comme les sorties actuelles) fusionne par commodité, mais ne construit pas encore ce modèle commun — diagnostic et extraction y restent deux sorties indépendantes plutôt que deux vues d'un même ensemble d'Observations. Un V4 viserait un objet unique — un modèle annoté par Section (faits + qualité + ambiguïtés + confiance) — dont diagnostic et extraction seraient tous deux dérivés, par l'IA ou par l'application, avec le score ATS qui s'y raccrocherait ensuite sans coût supplémentaire.

Ceci reste une direction, pas une décision : le V3 répond toujours à sa question immédiate et mérite d'être testé sur les 5 profils avant toute chose. Le V4 est la question suivante, plus large, à traiter séparément.
