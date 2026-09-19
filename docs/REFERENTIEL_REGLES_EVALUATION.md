# Référentiel des règles d'évaluation — Module « Bilan de candidature »

> Document de conception uniquement. Aucun code, aucun prompt IA, aucune interface utilisateur. Ce document formalise la logique métier qui permettra au modèle de prendre des décisions cohérentes, argumentées et reproductibles. Le Prompt 1 ne devra jamais contenir de logique métier propre : il applique les règles définies ici. S'appuie sur [ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md](ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md), [REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md](REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md), [PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md](PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md) et [ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md](ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md), sans répéter ce qui y est déjà établi.

## Principe de classification (lecture transversale)

Chaque règle de ce document appartient à l'une de ces deux catégories :

- **[Déterministe]** — calculable directement par l'application, sans raisonnement, à partir des observations factuelles déjà définies dans le référentiel métier et l'architecture du Prompt 1.
- **[Interprétatif]** — nécessite un raisonnement du modèle : synthèse de plusieurs faits, application d'un seuil non binaire, prise en compte du contexte.

Cette étiquette est indiquée à la fin de chaque bloc de règles plutôt qu'à chaque critère isolé, car c'est à ce niveau de granularité que la distinction a une utilité opérationnelle réelle (elle détermine ce qui vit dans `FaitsExtractor` plutôt que dans le prompt).

---

## 1. Règles de décision par dimension

### Remarque préalable — pas d'échelle parallèle

Les quatre niveaux demandés ici (point fort / point satisfaisant / axe d'amélioration / risque important) ne constituent pas une nouvelle échelle : ils correspondent terme à terme à l'échelle qualitative déjà définie dans le référentiel métier (🟢 Très convaincant / 🟢 Convaincant / 🟡 À renforcer / 🔴 Prioritaire). Ce que ce document ajoute, ce sont les **critères de bascule** entre ces niveaux — c'est-à-dire ce qui fait passer une dimension d'un niveau à l'autre, dimension par dimension.

### Règle de plafonnement par poids de dimension

Le niveau « risque important » n'est atteignable sans restriction que par les dimensions **déterminantes** (Adéquation, Crédibilité, Risques). Pour les dimensions **amplificatrices** ou **contextuelles**, le niveau le plus sévère est plafonné à « axe d'amélioration », sauf si l'observation concernée recoupe par ailleurs une dimension déterminante (auquel cas c'est cette dernière qui porte le niveau « risque important », pas la dimension amplificatrice). Sans ce plafond, le moteur pourrait accorder à une différenciation absente la même gravité qu'un problème de crédibilité — ce que ne ferait jamais un recruteur réel. Cette règle prolonge directement la matrice de priorisation déjà posée dans l'architecture du Prompt 1. **[Interprétatif]**

### Critères par dimension

**Adéquation avec le poste**
- Point fort : la majorité des compétences/exigences explicites de l'offre ou du métier visé se retrouvent dans le CV, sans écart de séniorité détecté.
- Point satisfaisant : les compétences essentielles sont présentes ; des compétences secondaires manquent sans remettre en cause la pertinence globale.
- Axe d'amélioration : une compétence importante et plausible au vu du parcours n'apparaît pas dans le CV (probablement non valorisée plutôt qu'absente).
- Risque important : écart de séniorité marqué, ou absence de plusieurs compétences déterminantes sans élément transférable démontré.
- *Composante déterministe* : recouvrement de mots-clés, comparaison des intitulés, années d'expérience. *Bascule* : interprétative (pertinence réelle, pas seulement lexicale). **[Mixte]**

**Cohérence du parcours**
- Point fort : chronologie continue, ou trous systématiquement expliqués, transitions logiques.
- Point satisfaisant : chronologie claire, une transition mineure non explicitée mais plausible.
- Axe d'amélioration : un trou ou une transition notable non explicité, sans incohérence structurelle.
- Risque important : trous multiples ou prolongés non expliqués, absence de fil conducteur perceptible.
- *Composante déterministe* : dates, durées, trous détectés. *Bascule* : interprétative (plausibilité du silence). **[Mixte]**

**Crédibilité**
- Point fort : affirmations systématiquement étayées, aucune formulation générique non démontrée.
- Point satisfaisant : l'essentiel est étayé, une ou deux formulations génériques isolées.
- Axe d'amélioration : plusieurs formulations non étayées, ou légèrement disproportionnées par rapport au poste occupé.
- Risque important : survente répétée, ou décalage manifeste entre responsabilités affichées et niveau réel (cf. test de non-compensation, section 4).
- *Composante déterministe* : détection de superlatifs, présence/absence de preuves associées. *Bascule* : interprétative (plausibilité contextuelle). **[Mixte]**

**Impact / valeur démontrée**
- Point fort : la majorité des expériences pertinentes sont décrites par des résultats mesurables.
- Point satisfaisant : certaines expériences montrent des résultats, d'autres restent descriptives.
- Axe d'amélioration : la majorité des descriptions restent des listes de tâches.
- Risque important : aucune réalisation concrète identifiable sur l'ensemble du document.
- *Composante déterministe* : présence de chiffres, ratio verbes d'action/passifs. *Bascule* : interprétative (significativité du résultat pour le poste visé). **[Mixte]**

**Lisibilité et structure**
- Point fort : structure claire, rubriques attendues présentes, aucune faute détectée, longueur adaptée.
- Point satisfaisant : structure globalement claire, irrégularité mineure sans gêner la lecture.
- Axe d'amélioration : structure difficile à suivre par endroits, longueur inadaptée, ou fautes ponctuelles.
- Risque important : structure confuse au point de gêner la compréhension dès la première lecture. *(Ne concerne plus les coordonnées depuis le 2026-08-10 : le CV analysé par le Bilan ne les contient jamais, voir section 4.)*
- *Composante déterministe* : quasi intégralement déterministe (rubriques, longueur, fautes, homogénéité). *Bascule* : essentiellement déterministe, sauf l'appréciation de la hiérarchie visuelle. **[Mixte, à dominante déterministe]**

**Risques et signaux d'alerte**
- Point fort : aucun signal détecté *(rappel : ici, « point fort » signifie « absence de risque », pas une qualité positive)*.
- Point satisfaisant : un signal mineur, de faible portée.
- Axe d'amélioration : un signal identifié mais non structurel, potentiellement atténuable par une explication.
- Risque important : signal répété ou de forte amplitude, non expliqué.
- *Composante déterministe* : durée par poste, fréquence de changement, écarts de dates. *Bascule* : interprétative (gravité réelle du signal). **[Mixte]**

**Projection recruteur**
- Ne possède pas de critères de bascule propres : ses quatre niveaux sont **dérivés par calcul** des dimensions déjà évaluées, jamais par une nouvelle appréciation libre.
- Règle de calcul : si au moins une dimension déterminante est en « risque important » → Projection au mieux « axe d'amélioration ». Si toutes les dimensions déterminantes sont « point fort/satisfaisant » et qu'une dimension différenciatrice est en difficulté → « axe d'amélioration ». Si déterminantes et différenciatrices sont toutes « point fort/satisfaisant » → Projection « point fort » ou « satisfaisant » selon les amplificateurs.
- *Composante déterministe* : aucune. *Bascule* : entièrement interprétative, mais **guidée par une règle de calcul explicite** plutôt que libre — c'est ce qui évite d'en faire une source de subjectivité. **[Interprétatif guidé]**

**Différenciation**
- Point fort : un élément rare/pertinent pour le poste est mis en avant de façon visible.
- Point satisfaisant : un élément différenciant existe mais reste peu valorisé dans la structure actuelle.
- Axe d'amélioration : aucun élément différenciant visible alors que le parcours en contient probablement.
- Risque important : plafonné (règle de plafonnement ci-dessus) — n'existe pas au sens fort pour cette dimension.
- *Composante déterministe* : présence d'éléments rares/spécifiques. *Bascule* : interprétative (pertinence pour le poste visé). **[Mixte]**

**Posture professionnelle perçue**
- Point fort : plusieurs qualités comportementales illustrées par des exemples concrets, pas seulement citées.
- Point satisfaisant : qualités mentionnées de façon cohérente avec le poste, sans illustration systématique.
- Axe d'amélioration : qualités listées de façon générique, sans lien apparent avec les expériences.
- Risque important : plafonné — un décalage de ton reste signalé mais jamais classé comme blocage.
- *Composante déterministe* : présence de mots-clés comportementaux, registre de langue. *Bascule* : interprétative (cohérence avec le poste/secteur). **[Mixte]**

**Personnalisation de la candidature**
- Point fort : adaptation claire à l'offre/l'entreprise, au-delà d'une reprise de mots-clés.
- Point satisfaisant : reprise pertinente de plusieurs éléments de l'offre, sans accroche dédiée.
- Axe d'amélioration : peu ou pas d'adaptation visible.
- Risque important : plafonné, **sauf** si l'absence de personnalisation s'accompagne d'une erreur factuelle (ex. nom d'une autre entreprise resté dans le texte) — ce cas particulier bascule alors en élément non-compensable (contradiction, section 4), pas en risque de cette dimension.
- *Composante déterministe* : taux de recouvrement lexical, présence du nom de l'entreprise. *Bascule* : interprétative (profondeur réelle de l'adaptation). **[Mixte]**

**Cohérence transversale du dossier**
- Point fort : CV, lettre et discours d'entretien se complètent sans contradiction, mêmes points forts valorisés partout.
- Point satisfaisant : cohérence globale, différence d'emphase mineure entre documents.
- Axe d'amélioration : un point fort valorisé dans un document est absent des autres, sans contradiction factuelle.
- Risque important : non applicable comme risque propre à cette dimension — toute contradiction factuelle détectée entre pièces relève directement de la non-compensation générale (section 4).
- *Composante déterministe* : détection de contradictions factuelles entre pièces. *Bascule* : interprétative (cohérence de fond). **[Mixte]**

---

## 2. Règles de priorisation

### Critères de hiérarchisation

1. **Statut non-compensable** — toujours en tête, indépendamment de tout le reste (section 4).
2. **Poids de la dimension** — déterminant > différenciateur > amplificateur > contextuel (matrice déjà posée dans l'architecture du Prompt 1).
3. **Sévérité observée** — risque important > axe d'amélioration, à poids de dimension égal.
4. **Portée de la recommandation** — une recommandation qui répond à un défaut affectant plusieurs dimensions à la fois est priorisée devant une recommandation à portée unique, à tier de priorité égal.

### Construction du plan d'action

Le plan d'action n'est pas une liste exhaustive de toutes les recommandations produites : il se limite aux priorités « critique » et « haute », complétées si besoin jusqu'à un nombre restreint de recommandations réellement actionnables avant un envoi — le chiffre exact reste un paramètre de calibrage à fixer lors de la rédaction du prompt, pas une règle métier figée ici.

L'ordre des étapes du plan suit une logique de dépendance plutôt qu'un simple tri par priorité brute : les éléments qui affectent la **confiance** (non-compensables, Crédibilité, Risques) précèdent toujours les éléments qui affectent la **valeur perçue** (Impact, Adéquation), qui précèdent eux-mêmes les éléments de **forme** (Lisibilité, Différenciation). Corriger une contradiction factuelle avant de retravailler la mise en valeur du même passage n'a pas le même effet dans l'ordre inverse.

*Classification* : le tri par poids et sévérité est **[Déterministe]** une fois les niveaux de chaque dimension connus (simple application d'une table) ; l'évaluation de la portée d'une recommandation (combien de dimensions elle touche réellement sur le fond) reste **[Interprétatif]**.

---

## 3. Règles de compensation

### Règle générale

Une faiblesse n'est valablement compensée que par un élément qui répond **directement à l'inquiétude qu'elle soulève** chez le lecteur — jamais par une qualité générale sans rapport, aussi forte soit-elle ailleurs dans le dossier. Une compensation ne peut par ailleurs jamais franchir les niveaux de poids définis en section 1 : un amplificateur (ex. Différenciation) ne compense jamais un déterminant défaillant (ex. Adéquation), quelle que soit sa force.

### Exemples de compensations valides

- Un trou chronologique → compensé par une explication du trou (formation, rubrique dédiée), **pas** par un impact fort dans une autre expérience.
- Un écart de compétence technique → compensé par une compétence transférable démontrée et **pertinente pour ce poste précis**, pas par une compétence sans lien.
- Une différenciation faible → n'a pas besoin d'être compensée : elle ne pèse que comme facteur de départage (section 1) et son absence n'entame pas une candidature par ailleurs solide sur les dimensions déterminantes.
- Une lisibilité moyenne → largement compensée par un contenu de haute qualité, **une fois que le lecteur a dépassé le premier regard** ; en revanche, si le défaut de forme empêche structurellement d'entrer dans la lecture (voir philosophie, rôle de porte d'entrée de la Lisibilité), aucune compensation n'est possible tant que ce seuil n'est pas franchi.

*Classification* : identifier qu'une observation existe potentiellement compensatoire est **[Déterministe]** (présence d'une explication, d'une compétence alternative) ; juger qu'elle répond **effectivement** à l'inquiétude soulevée est **[Interprétatif]**.

---

## 4. Règles de non-compensation

### Le même test, formulé pour son cas négatif

Les règles de non-compensation ne forment pas un corps de règles indépendant des règles de compensation : elles en sont l'envers. Une faiblesse est non-compensable lorsque, laissée en l'état, **elle compromet la fiabilité de l'évaluation des autres dimensions elles-mêmes** — et non plus seulement la qualité d'une dimension isolée.

### Application du test

- **Incohérences chronologiques manifestes** — la lecture de toutes les dimensions qui dépendent de dates fiables (Cohérence, Risques, ancienneté pour l'Adéquation) devient elle-même invalide.
- **Contradictions factuelles internes** — atteignent la Crédibilité de l'ensemble du document, ce qui invalide la confiance accordée à toute autre affirmation du CV, y compris les points par ailleurs solides.
- **Manque de crédibilité manifeste et généralisé** — même conséquence : la lecture de tout le reste devient suspecte, pas seulement le passage concerné.

### Retiré (2026-08-10) : coordonnées absentes ou non fonctionnelles

La règle « même une candidature excellente devient sans objet pratique si le contact est impossible » reste vraie pour un CV final, mais ne s'applique pas au texte analysé par le Bilan : celui-ci ne contient jamais les coordonnées, par construction (voir `hostDataAdapter.js`). Le test se déclenchait donc systématiquement, sans rapport avec la qualité réelle du CV. Voir `PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md`, section 3, pour le détail.

### Nuance à préserver

Un écart n'est jamais non-compensable en lui-même : c'est l'**absence d'explication** de cet écart qui l'est. Une reconversion assumée et expliquée n'appartient pas à cette catégorie ; une reconversion silencieuse et non contextualisée y appartient, non pas parce que la reconversion est un problème, mais parce que le silence empêche de vérifier la cohérence du dossier.

*Classification* : la détection des faits déclencheurs (dates incohérentes, contradictions textuelles) est **[Déterministe]** ; la qualification de « manque de crédibilité manifeste et généralisé » — par opposition à une maladresse isolée — reste **[Interprétatif]**.

---

## 5. Règles contextuelles

### Principe

Le contexte ne crée jamais de nouvelle observation : il **module l'interprétation** d'une observation déjà produite par `FaitsExtractor`. Le contexte est donc toujours appliqué côté raisonnement IA, jamais recalculé côté observations déterministes.

### Modulations retenues

- **Secteur d'activité / métier visé** — le registre de formulation attendu (Posture professionnelle perçue) est relatif au secteur : un ton formel valorisé en droit ou en finance peut se lire comme distant dans un secteur créatif, et inversement.
- **Type d'entreprise** (grand groupe / PME / startup) — une startup valorise davantage la polyvalence (Différenciation, Posture) ; un grand groupe valorise davantage la structuration et le respect strict des prérequis (Lisibilité, Adéquation).
- **Niveau d'expérience** — le poids d'Impact/valeur démontrée croît avec la séniorité : un profil confirmé sans résultat chiffré pèse plus lourd qu'un profil junior dans la même situation.
- **Reconversion professionnelle** — neutralise l'observation déterministe « changement de secteur » pour la dimension Cohérence, à condition que le contexte de reconversion soit explicite (cf. nuance section 4).
- **Premier emploi** — Adéquation s'évalue sur la formation, les stages et projets plutôt que sur l'expérience professionnelle ; Impact s'évalue sur des réalisations académiques ou associatives. Le plafond de sévérité de ces deux dimensions est abaissé pour ne pas pénaliser l'absence d'une expérience que le candidat ne peut pas avoir.
- **Candidature spontanée** (sans offre) — Adéquation s'évalue uniquement par rapport au métier visé/à l'entreprise ciblée, avec un niveau de confiance de la conclusion explicitement plus faible affiché ; Personnalisation devient proportionnellement plus déterminante, car souvent le principal signal disponible du sérieux de la démarche.
- **Réponse à une offre précise** — situation de référence sur laquelle repose la majorité des règles déjà décrites dans les autres sections de ce document.

*Classification* : entièrement **[Interprétatif]** — c'est la nature même d'une règle contextuelle que de moduler une lecture, jamais de produire un fait.

---

## 6. Règles d'explication

### Règle de traçabilité obligatoire

Toute recommandation doit citer au moins une observation (déterministe ou argumentée) qui la justifie. Toute observation argumentée doit elle-même s'appuyer sur au moins une observation déterministe ou sur une règle contextuelle explicite (section 5) — jamais sur une impression non reliée à un fait vérifiable.

### Structure d'argumentation imposée

Chaque conclusion doit répondre implicitement, dans cet ordre, à trois questions :
1. **Quel est le fait observé ?** (l'observation, déterministe ou déjà établie)
2. **Que signifie-t-il pour un lecteur du dossier ?** (l'interprétation)
3. **Pourquoi cela compte-t-il pour cette candidature précise ?** (la conséquence, reliée au poste/métier visé)

Une conclusion qui saute directement à une appréciation générale sans passer par ces trois étapes (ex. « ce CV manque de dynamisme ») est à proscrire : elle doit être reformulée à partir d'une observation concrète (ex. « peu de résultats chiffrés dans les descriptions de poste »).

*Classification* : **[Interprétatif]** dans son ensemble — cette section encadre la façon dont l'IA doit construire son raisonnement, elle ne calcule rien elle-même.

---

## 7. Règles de prudence

- **Règle de la preuve** — toute affirmation sur le candidat doit être reliée à une observation déterministe ou à un contenu explicitement présent dans le CV/l'offre, jamais à une supposition.
- **Règle du silence légitime** — l'absence d'information est signalée comme une absence, jamais transformée en compétence supposée, ni automatiquement traitée comme un défaut sans tenir compte du contexte (cf. section 5, premier emploi).
- **Règle de non-invention de contenu** — le modèle ne complète jamais un CV peu détaillé en imaginant un contenu plausible, même pour illustrer une recommandation. Une reformulation concrète appartient au Prompt 2, jamais au Prompt 1, et se construit toujours à partir d'éléments réels fournis par le candidat.
- **Règle de la retenue interprétative** — en cas de doute entre deux lectures possibles d'une même observation, le modèle retient l'interprétation la plus prudente, ni la plus sévère ni la plus favorable.

*Classification* : **[Interprétatif]** — mais formulé comme des **contraintes de comportement** du modèle plutôt que des règles de calcul ; elles doivent être rappelées explicitement dans le prompt (cf. bloc 2 de l'architecture du Prompt 1), pas seulement documentées ici.

---

## 8. Règles de restitution

Les principes de fond (ne jamais décourager, toujours prioriser, jamais culpabiliser) sont déjà formalisés dans la philosophie d'évaluation (section 7 de ce document de référence) et ne sont pas reformulés ici. Ce référentiel y ajoute un principe opérationnel et vérifiable, absent du document de philosophie :

### Test du sujet grammatical

Une recommandation ou une observation pointant une faiblesse ne doit **jamais avoir pour sujet grammatical la personne du candidat**. Le sujet reste toujours le document ou la candidature, jamais « vous ». Exemple : « ce CV ne met pas en évidence… » plutôt que « vous ne montrez pas… ». C'est un test simple et vérifiable qui matérialise concrètement la règle « jamais culpabilisant » posée dans la philosophie, au lieu de la laisser à une appréciation subjective de ton.

*Classification* : **[Interprétatif]** pour la formulation elle-même, mais **[Déterministe]** pour sa vérification a posteriori (un contrôle syntaxique simple peut détecter la présence du pronom « vous » associé à une tournure négative).

---

## 9. Règles de cohérence

- **Règle d'unicité de la recommandation** — une même action ne peut être recommandée qu'une seule fois dans la sortie. Si un même défaut affecte plusieurs dimensions (ex. un trou chronologique concerne à la fois Cohérence et Risques), une seule recommandation est produite, reliée à toutes les dimensions concernées.
- **Règle de non-contradiction** — deux recommandations ne peuvent jamais pointer dans des directions opposées sur un même passage (ex. « raccourcir » et « détailler davantage » la même expérience).
- **Règle de non-répétition** — une observation déjà utilisée pour justifier une recommandation ne doit pas générer une seconde recommandation quasi identique dans une autre dimension : elle doit enrichir la recommandation existante (cf. règle d'unicité), pas la dupliquer.
- **Règle de compatibilité du plan d'action** — aucune étape postérieure du plan d'action ne doit défaire une étape antérieure.

### Incohérence détectée dans le schéma existant

La règle d'unicité de la recommandation entre en tension avec le schéma de sortie défini dans l'architecture du Prompt 1, où `recommandation.dimensionLiee` est un champ **singulier**. Si une recommandation concerne réellement deux dimensions à la fois, le schéma actuel oblige soit à dupliquer la recommandation (ce que cette section interdit), soit à n'en rattacher qu'une seule arbitrairement (ce qui appauvrit la traçabilité, section 6). **Ajustement à retenir lors de la rédaction du Prompt 1** : transformer ce champ en tableau (`dimensionsLiees`), sans quoi la règle d'unicité posée ici ne peut pas être respectée dans tous les cas.

*Classification* : **[Déterministe]** pour la détection technique des doublons et contradictions (comparaison de champs, de passages ciblés) ; **[Interprétatif]** pour juger qu'une nouvelle recommandation « enrichit » réellement une recommandation existante plutôt que d'en constituer une distincte.

---

## 10. Règles d'évolutivité

- **Rattachement systématique** — chaque règle de ce document est reliée soit à une dimension précise (parmi les 11), soit marquée **transversale** (prudence, restitution, cohérence). Une future dimension supplémentaire hérite directement des règles transversales existantes sans qu'il soit nécessaire de les réécrire.
- **Séparation stricte des registres** — les règles déterministes vivent dans le périmètre de `FaitsExtractor` (architecture du module) ; les règles interprétatives vivent dans le prompt. Ajouter ou modifier une règle déterministe ne touche jamais un prompt ; ajouter ou modifier une règle interprétative ne touche jamais le code applicatif. C'est cette séparation, déjà actée dans l'architecture du module, qui garantit l'évolutivité recherchée ici.
- **Test de non-régression pour toute nouvelle règle** — avant d'ajouter une règle, la confronter au test de non-compensation (section 4) et à la règle de plafonnement par poids (section 1), pour vérifier qu'elle ne contredit pas silencieusement une règle déjà en place.
- **Traçabilité de version** — toute modification de ce référentiel qui affecte le comportement attendu du modèle doit s'accompagner d'une mise à jour correspondante du Prompt 1 ; une pratique de date de dernière révision en tête de document suffit à maintenir cette correspondance dans le temps, sans nécessiter de mécanisme technique dédié.

---

## Analyse critique et simplifications retenues

- **Fusion de deux formulations en une seule échelle** — les niveaux « point fort / satisfaisant / axe d'amélioration / risque important » (section 1) ne sont pas une échelle nouvelle : ce sont les critères de bascule de l'échelle qualitative déjà définie dans le référentiel métier. Introduire un second vocabulaire aurait créé une redondance sans valeur ajoutée.
- **Compensation et non-compensation reposent sur un seul test** — plutôt que deux corps de règles indépendants, les sections 3 et 4 appliquent un même test binaire (« ce défaut compromet-il la fiabilité de l'évaluation des autres dimensions ? »), ce qui évite deux logiques parallèles à maintenir en cohérence dans le temps.
- **Plafonnement introduit pour éviter une dérive de sévérité** — sans règle explicite, une dimension amplificatrice (ex. Différenciation) pourrait être classée aussi gravement qu'une dimension déterminante (ex. Crédibilité). Le plafonnement (section 1) empêche cette dérive et reste cohérent avec la matrice de priorisation déjà posée dans l'architecture du Prompt 1.
- **Incohérence de schéma identifiée** — le champ `dimensionLiee` (singulier) du schéma de sortie du Prompt 1 doit devenir un tableau pour respecter la règle d'unicité des recommandations posée en section 9. C'est un ajustement mineur mais nécessaire à traiter lors de la rédaction du prompt, pas un nouveau document.
- **Projection recruteur confirmée comme cas particulier** — elle ne reçoit pas de critères de bascule propres, uniquement une règle de calcul dérivée des autres dimensions, ce qui évite d'introduire une source de subjectivité supplémentaire à un niveau déjà transversal.

Aucune redondance structurelle supplémentaire n'a été identifiée entre les dix catégories de règles demandées : chacune couvre un aspect distinct (quoi décider, dans quel ordre, ce qui est négociable, ce qui ne l'est pas, comment le contexte module la lecture, comment justifier, comment rester prudent, comment restituer, comment rester cohérent, comment faire évoluer le tout) sans chevauchement de fond entre elles.

---

## Point important — fin de la phase de conception

Ce document, avec les quatre précédents, constitue la base complète sur laquelle s'appuiera la rédaction du Prompt 1 puis du Prompt 2. Toute question de logique métier qui se poserait pendant cette rédaction doit trouver sa réponse ici plutôt que déclencher un nouveau document conceptuel — c'est précisément ce que ce référentiel a été conçu pour permettre.

## Utilisation prévue de ce document

- Les **sections 1 à 5** alimentent directement le bloc de méthode de raisonnement et le bloc de règles de priorisation du futur Prompt 1 (blocs 6 et 7, architecture du Prompt 1).
- Les **sections 6 et 7** alimentent le bloc de mission et de limites (bloc 2).
- La **section 8** enrichit la philosophie de restitution déjà posée, avec un test vérifiable réutilisable côté relecture qualité du prompt.
- La **section 9** doit être vérifiée lors de la conception du `DiagnosticResponseParser` (architecture du module), qui pourra détecter mécaniquement certaines violations (doublons, contradictions de champs).
- La **section 10** cadre la façon dont ce document — et le prompt qui en découle — pourront évoluer sans remise en cause d'ensemble.
