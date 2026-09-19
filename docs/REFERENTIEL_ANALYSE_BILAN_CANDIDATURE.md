# Référentiel métier — Module « Bilan de candidature »

> Document de référence métier, indépendant de toute implémentation technique. Aucun code, aucun prompt IA, aucune interface graphique n'est défini ici. Ce référentiel est la source unique à partir de laquelle seront ensuite dérivés les prompts, les composants techniques et l'interface (voir [ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md](ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md) pour le découpage technique).

---

## Philosophie générale

Le module ne cherche pas à produire un meilleur CV. Il cherche à aider le candidat à comprendre, avant l'envoi :

- comment sa candidature sera perçue par un recruteur ;
- quels sont ses points forts ;
- quels sont les risques ;
- quelles améliorations auront le plus d'impact.

Chaque dimension de ce référentiel doit être lue avec l'exigence de trois regards combinés : celui d'un **recruteur** (est-ce que je retiens ce dossier ?), celui d'un **CIP** (est-ce que ce parcours est valorisé à sa juste valeur ?) et celui d'un **consultant RH** (quels risques et quels leviers concrets identifier ?).

---

## Rappel des niveaux d'analyse disponibles

Chaque dimension n'est pas évaluable avec la même profondeur selon les données disponibles (cf. architecture technique) :

- **Niveau 1** — CV seul.
- **Niveau 2** — CV + métier visé.
- **Niveau 3** — CV + offre d'emploi.
- **Niveau 4** *(évolution future)* — CV + lettre de motivation + préparation à l'entretien.

Chaque dimension du référentiel précise le niveau minimum à partir duquel elle devient pertinente.

---

## Échelle de restitution qualitative commune

Toutes les dimensions restituent leur conclusion selon la même échelle qualitative, volontairement sans note chiffrée :

- 🟢 **Très convaincant** — point fort net, sans réserve notable.
- 🟢 **Convaincant** — globalement solide, au plus une réserve mineure.
- 🟡 **À renforcer** — une ou plusieurs faiblesses méritent une amélioration avant l'envoi, sans être rédhibitoires.
- 🔴 **Prioritaire** — problème susceptible, à lui seul, de faire écarter la candidature ; action fortement recommandée avant l'envoi.

Cas particulier : pour la dimension *Risques et signaux d'alerte*, « 🟢 Très convaincant » se lit comme « aucun risque identifié », et non comme une performance positive au même titre que les autres dimensions.

---

## Méthode de sélection des dimensions

L'objectif n'est pas de maximiser le nombre de dimensions mais de retenir des axes réellement indépendants, non redondants et utiles. Onze dimensions ont été retenues plutôt que douze exactement, par souci de ne pas forcer un axe artificiel là où une fusion était plus honnête.

### Dimensions fusionnées (redondance identifiée)

- **Mots-clés / compatibilité ATS** → intégré dans *Adéquation avec le poste* comme observation déterministe, et non comme axe de sens indépendant : un recouvrement de mots-clés n'a de valeur que rapporté à l'adéquation réelle qu'il mesure.
- **Orthographe / soin apporté** → intégré dans *Lisibilité et structure* : il s'agit d'une composante du soin formel du document, pas d'un axe de perception autonome.
- **Storytelling** → intégré dans *Cohérence du parcours* : le storytelling est la mise en récit cohérente du parcours ; séparer les deux aurait créé une quasi-redondance totale.
- **Potentiel d'évolution** → intégré dans *Projection recruteur* : il s'agit d'une composante de la projection dans l'avenir du candidat, pas d'un axe mesurable indépendamment du reste.
- **Séniorité perçue / décalage de niveau** → réparti entre *Adéquation avec le poste* (le niveau recherché) et *Risques et signaux d'alerte* (un décalage de niveau est traité comme un signal à part entière).

### Dimensions envisagées et écartées

- **Ambition / motivation intrinsèque** — trop subjectif à évaluer sur la seule base de documents écrits ; risque de sur-interprétation par l'IA sans échange réel avec le candidat. Non retenu tant que le module n'intègre pas d'échange direct.
- **Compatibilité salariale / attentes** — hors périmètre d'un diagnostic de candidature ; dépend de données rarement présentes dans un CV.
- **Présence en ligne / réseaux professionnels** — pertinent en théorie, mais suppose une source de données (LinkedIn, portfolio) que `ContexteCandidature` ne collecte pas aujourd'hui. Piste à réévaluer si cette collecte est ajoutée un jour, mais ne devient pas une dimension formelle tant que la donnée n'existe pas.

### Cas particulier : « Projection recruteur »

Cette dimension fonctionne différemment des dix autres : elle ne repose sur aucune observation déterministe propre et son analyse IA se nourrit des conclusions des autres axes plutôt que des données brutes. C'est une dimension de **synthèse**, volontairement conservée comme dimension à part entière (le candidat a besoin d'une conclusion globale, pas seulement d'une somme d'axes), mais dont le mode de fonctionnement diffère et doit être traité comme tel lors de la conception des prompts.

### Tableau de synthèse des dimensions retenues

| # | Dimension | Niveau minimum | Priorité |
|---|-----------|-----------------|----------|
| 1 | Adéquation avec le poste | 2 (affiné au niveau 3) | Indispensable V1 |
| 2 | Cohérence du parcours | 1 | Indispensable V1 |
| 3 | Crédibilité | 1 | Indispensable V1 |
| 4 | Impact / valeur démontrée | 1 | Indispensable V1 |
| 5 | Lisibilité et structure | 1 | Indispensable V1 |
| 6 | Risques et signaux d'alerte | 1 | Indispensable V1 |
| 7 | Projection recruteur | 1 (renforcée aux niveaux suivants) | Indispensable V1 |
| 8 | Différenciation | 1 (affiné au niveau 3) | Souhaitable |
| 9 | Posture professionnelle perçue | 1 (affiné au niveau 3) | Souhaitable |
| 10 | Personnalisation de la candidature | 3 (approfondi au niveau 4) | Évolution V2 |
| 11 | Cohérence transversale du dossier | 4 | Évolution V2 |

---

## 1. Adéquation avec le poste

### Objectif
Mesurer dans quelle mesure le profil du candidat correspond aux exigences du poste ou du métier visé, pour anticiper si un recruteur peut légitimement retenir ce dossier.

### Questions auxquelles cette dimension doit répondre
- Les compétences requises sont-elles présentes et visibles ?
- L'expérience est-elle du bon niveau (junior, confirmé, senior) ?
- Le secteur ou le domaine correspond-il à celui recherché ?
- Y a-t-il des écarts significatifs entre ce que demande le poste et ce que montre le CV ?
- Une reconversion éventuelle est-elle cohérente avec le métier visé ?

### Observations déterministes (sans IA)
- Présence des mots-clés de l'offre dans le CV (correspondances et absences).
- Nombre d'années d'expérience totales et dans le domaine visé.
- Présence d'une rubrique compétences.
- Comparaison des intitulés de poste visés avec les intitulés des expériences passées.
- Présence ou absence des compétences techniques explicitement citées dans l'offre.

### Analyse confiée à l'IA
- Apprécier si des compétences transférables comblent un écart apparent.
- Juger la pertinence réelle (pas seulement lexicale) de l'expérience par rapport au poste.
- Estimer la probabilité d'un décalage de niveau (sur- ou sous-qualification).
- Évaluer la crédibilité d'une reconversion au regard du parcours.

### Restitution attendue
Échelle qualitative commune. Niveau 🔴 Prioritaire si l'écart est majeur et non compensé par des éléments transférables.

### Impact pour le candidat
C'est souvent le premier filtre, quasi binaire, d'un recruteur. Un écart mal anticipé se traduit par un taux de réponse très faible, indépendamment de la qualité du reste du dossier.

### Recommandations possibles
- Mettre en avant une expérience ou une compétence actuellement peu visible.
- Reformuler l'intitulé ou l'accroche du CV.
- Ajouter une compétence réelle mais absente du document.
- Expliciter une reconversion.
- Ajuster le niveau de séniorité affiché.

### Priorité
Indispensable V1. Activable dès le niveau 2 (métier visé), affinée au niveau 3 (offre d'emploi).

---

## 2. Cohérence du parcours

### Objectif
Vérifier que le parcours professionnel raconte une histoire compréhensible et logique, sans zone d'ombre susceptible d'inquiéter un recruteur.

### Questions auxquelles cette dimension doit répondre
- Le fil conducteur du parcours est-il compréhensible ?
- Les transitions entre postes ou secteurs sont-elles justifiées ou explicites ?
- Y a-t-il des trous non expliqués dans la chronologie ?
- Les évolutions (promotions, changements de trajectoire) sont-elles logiques ?

### Observations déterministes (sans IA)
- Chronologie des dates (chevauchements, trous, ordre).
- Durée de chaque expérience.
- Nombre de changements de secteur ou de métier.
- Présence d'éléments explicatifs pour les ruptures (formation, rubrique dédiée).
- Durée moyenne par poste.

### Analyse confiée à l'IA
- Apprécier si des transitions non explicitées restent plausibles et cohérentes avec un fil narratif logique.
- Distinguer un trou anodin d'un trou qui interroge.
- Évaluer la cohérence globale du projet professionnel tel qu'il transparaît du parcours.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Un parcours perçu comme décousu génère de la méfiance avant même l'évaluation des compétences. Un fil conducteur clair rassure et facilite la lecture.

### Recommandations possibles
- Ajouter une phrase d'accroche expliquant une transition.
- Réorganiser l'ordre de présentation des expériences.
- Expliciter un trou (formation, parenthèse personnelle).
- Regrouper des expériences dispersées sous un fil conducteur commun.

### Priorité
Indispensable V1. Disponible dès le niveau 1 (CV seul).

---

## 3. Crédibilité

### Objectif
Évaluer si ce qui est écrit dans la candidature semble vrai, plausible et vérifiable, sans survente ni exagération susceptible de décrédibiliser le dossier.

### Questions auxquelles cette dimension doit répondre
- Les affirmations sont-elles réalistes ?
- Certaines formulations sonnent-elles « trop belles pour être vraies » ?
- Les responsabilités affichées sont-elles cohérentes avec le niveau réel du poste occupé ?
- Le vocabulaire employé est-il maîtrisé ou approximatif ?

### Observations déterministes (sans IA)
- Présence de superlatifs ou formules génériques non étayées (« expert en… », « excellent niveau de… »).
- Cohérence entre l'intitulé de poste et le niveau de détail de la description associée.
- Présence de chiffres ou de preuves associées aux affirmations fortes.
- Doublons de formulations copiées-collées d'une expérience à l'autre.

### Analyse confiée à l'IA
- Juger la plausibilité d'une affirmation compte tenu du contexte (durée du poste, secteur, taille d'entreprise).
- Repérer les formulations susceptibles d'être perçues comme de la survente.
- Évaluer l'alignement entre le ton employé et le niveau réel d'expérience.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Une candidature perçue comme exagérée déclenche une méfiance immédiate, capable d'annuler l'effet positif d'un parcours par ailleurs solide.

### Recommandations possibles
- Remplacer une formulation générique par un fait vérifiable.
- Ajuster un niveau de responsabilité déclaré.
- Étayer une compétence affirmée par un exemple concret.
- Supprimer une formulation redondante répétée d'une expérience à l'autre.

### Priorité
Indispensable V1. Disponible dès le niveau 1.

---

## 4. Impact / valeur démontrée

### Objectif
Évaluer si les réalisations sont présentées avec des résultats concrets et mesurables, plutôt que comme une simple liste de tâches.

### Questions auxquelles cette dimension doit répondre
- Les résultats obtenus sont-ils visibles, et chiffrés quand c'est possible ?
- Le CV montre-t-il ce que le candidat a produit ou changé, plutôt que ce dont il était seulement responsable ?
- Les réalisations les plus marquantes sont-elles mises en avant ou noyées dans le reste du texte ?

### Observations déterministes (sans IA)
- Présence de chiffres ou de pourcentages dans les descriptions d'expérience.
- Ratio verbes d'action / formulations passives.
- Longueur moyenne des puces de description.
- Présence de formulations type « responsable de » comparée à des verbes de résultat (« augmenté », « réduit », « développé »).

### Analyse confiée à l'IA
- Apprécier si les résultats mis en avant sont réellement significatifs pour le poste visé.
- Identifier les réalisations à fort potentiel actuellement sous-exploitées dans leur formulation.
- Juger l'équilibre global entre description des tâches et mise en avant des résultats.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Un CV orienté « tâches » se fond dans la masse des candidatures similaires ; un CV orienté « résultats » capte l'attention et démontre une valeur ajoutée réelle.

### Recommandations possibles
- Reformuler une mission en résultat mesurable.
- Hiérarchiser les réalisations par ordre d'impact.
- Ajouter un indicateur chiffré manquant mais disponible.
- Réduire les descriptions purement fonctionnelles.

### Priorité
Indispensable V1. Disponible dès le niveau 1.

---

## 5. Lisibilité et structure

### Objectif
S'assurer que le document est rapide et agréable à parcourir, sachant qu'un recruteur y consacre en moyenne quelques dizaines de secondes lors d'une première lecture.

### Questions auxquelles cette dimension doit répondre
- Le CV est-il structuré de façon claire ?
- L'information essentielle est-elle immédiatement visible ?
- La longueur est-elle adaptée au profil ?
- Le document est-il soigné (pas de fautes, mise en forme homogène) ?

### Observations déterministes (sans IA)
- Nombre total de mots ou de pages.
- Présence des rubriques attendues (expériences, formations, compétences).
- Homogénéité de la mise en forme des dates et des titres.
- Fautes détectables.
- Longueur des paragraphes.

*(Retiré le 2026-08-10 : présence de coordonnées/du bloc contact. Le CV analysé par le Bilan ne les contient jamais, voir `REFERENTIEL_REGLES_EVALUATION.md`, section 4.)*

### Analyse confiée à l'IA
- Apprécier si la hiérarchie visuelle de l'information met bien en avant l'essentiel pour ce poste précis.
- Juger si la densité d'information est adaptée au niveau d'expérience du candidat.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Un document difficile à lire peut être écarté avant même que son contenu soit évalué sur le fond.

### Recommandations possibles
- Raccourcir une section trop dense.
- Harmoniser la mise en forme.
- Réorganiser l'ordre des rubriques.
- Corriger des éléments manquants (intitulé clair).

### Priorité
Indispensable V1. Disponible dès le niveau 1.

---

## 6. Risques et signaux d'alerte

### Objectif
Repérer les éléments susceptibles de générer une inquiétude ou une objection chez un recruteur, afin que le candidat puisse les anticiper ou les corriger avant l'envoi.

### Questions auxquelles cette dimension doit répondre
- Y a-t-il des trous inexpliqués dans le parcours ?
- Le candidat change-t-il fréquemment de poste ?
- Y a-t-il un décalage de niveau apparent (sur- ou sous-qualification) ?
- Des informations se contredisent-elles entre elles ?

### Observations déterministes (sans IA)
- Durée moyenne par poste.
- Nombre de postes occupés sur une période donnée.
- Trous chronologiques détectés.
- Incohérences de dates (chevauchements impossibles).
- Écarts entre le niveau du poste visé et le niveau des expériences passées.

### Analyse confiée à l'IA
- Apprécier la gravité réelle de chaque signal détecté (un trou de deux mois n'a pas le même poids qu'un trou de deux ans).
- Distinguer un signal rédhibitoire d'un signal mineur.
- Indiquer si un signal nécessite une explication proactive dans la candidature.

### Restitution attendue
Échelle qualitative commune, avec la lecture particulière suivante : 🟢 Très convaincant signifie ici « aucun risque identifié », et non une performance positive comparable aux autres dimensions.

### Impact pour le candidat
Un signal d'alerte non anticipé peut suffire à écarter un dossier par ailleurs solide. Anticipé et expliqué, il perd une grande partie de son poids.

### Recommandations possibles
- Ajouter une explication courte pour un trou identifié.
- Reformuler pour atténuer un signal de sur-qualification.
- Regrouper des expériences courtes sous un intitulé cohérent.
- Clarifier une date ambiguë.

### Priorité
Indispensable V1. Disponible dès le niveau 1.

---

## 7. Projection recruteur

### Objectif
Restituer l'impression globale et instinctive qu'un recruteur se ferait en découvrant cette candidature — la synthèse du « est-ce que je l'imagine dans ce poste, dans cette équipe ? ».

### Questions auxquelles cette dimension doit répondre
- Un recruteur aurait-il envie de rencontrer ce candidat ?
- Se projette-t-il facilement dans le poste évoqué ?
- La candidature donne-t-elle confiance dans la capacité du candidat à réussir puis à évoluer ?

### Observations déterministes (sans IA)
Aucune observation propre. Cette dimension est par nature synthétique : elle s'appuie sur les conclusions déjà produites par les autres dimensions plutôt que sur une lecture directe du CV.

### Analyse confiée à l'IA
- Produire une synthèse globale de l'impression générale, à partir des conclusions des autres dimensions (adéquation, cohérence, crédibilité, impact, lisibilité, risques).
- Formuler cette synthèse comme le ressenti probable d'un recruteur à la première lecture.

### Restitution attendue
Échelle qualitative commune. Dimension calculée en dernier, une fois les autres dimensions établies.

### Impact pour le candidat
C'est souvent le facteur décisif final, au-delà de la somme des critères pris isolément.

### Recommandations possibles
Cette dimension ne génère pas de recommandation propre : elle renvoie vers les recommandations des dimensions qui expliquent une projection faible (par exemple, si la projection est faible à cause d'un manque de cohérence, la recommandation associée est celle de la dimension *Cohérence du parcours*).

### Priorité
Indispensable V1. Disponible dès le niveau 1, robustesse croissante avec les niveaux suivants.

---

## 8. Différenciation

### Objectif
Identifier ce qui distingue ce candidat des autres profils similaires postulant au même type de poste.

### Questions auxquelles cette dimension doit répondre
- Qu'est-ce qui rend cette candidature unique ou mémorable ?
- Y a-t-il un élément distinctif clairement mis en avant (spécialisation, résultat rare, expérience atypique) ?
- Le CV ressemble-t-il à un CV générique interchangeable ?

### Observations déterministes (sans IA)
- Présence d'éléments rares ou spécifiques (certifications, projets, langues, outils peu courants).
- Part du texte consacrée à des formulations génériques comparée à des formulations spécifiques.
- Présence d'éléments hors du tronc commun classique d'un CV du même secteur.

### Analyse confiée à l'IA
- Apprécier si les éléments distinctifs identifiés ont une réelle valeur pour le poste visé (une différenciation hors-sujet n'aide pas).
- Formuler ce qui pourrait constituer un facteur de mémorisation positive pour un recruteur qui lit de nombreuses candidatures similaires.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
À compétences égales, la différenciation est souvent ce qui fait la décision finale entre plusieurs candidats équivalents.

### Recommandations possibles
- Mettre en avant un élément différenciant actuellement noyé dans le texte.
- Ajouter un élément différenciant réel mais absent du document.
- Reformuler l'accroche pour marquer une singularité.

### Priorité
Souhaitable. Disponible dès le niveau 1, gagne en pertinence au niveau 3 (comparaison implicite avec le profil attendu par l'offre).

---

## 9. Posture professionnelle perçue

### Objectif
Évaluer l'image comportementale et relationnelle que dégage la candidature, au-delà des compétences techniques.

### Questions auxquelles cette dimension doit répondre
- Quel savoir-être transparaît des formulations utilisées (autonomie, esprit d'équipe, rigueur, leadership) ?
- Le ton employé est-il adapté au secteur ou au poste visé ?
- La candidature dégage-t-elle une posture cohérente avec la culture probable de l'entreprise ciblée ?

### Observations déterministes (sans IA)
- Présence de mots-clés comportementaux (« autonome », « esprit d'équipe », « force de proposition »…).
- Présence ou absence d'une rubrique dédiée aux qualités ou compétences comportementales.
- Registre de langue employé (formel, informel).

### Analyse confiée à l'IA
- Apprécier si la posture qui transparaît est cohérente avec le poste visé et crédible au regard du parcours décrit, plutôt que simplement déclarée.
- Identifier un éventuel décalage entre le ton du document et le secteur visé.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
La posture perçue influence fortement la décision de convoquer en entretien, indépendamment des compétences techniques affichées.

### Recommandations possibles
- Ajuster le registre de langue.
- Remplacer une liste de qualités déclaratives par un exemple qui les illustre concrètement.
- Aligner le ton du document sur la culture du secteur visé.

### Priorité
Souhaitable. Disponible dès le niveau 1, affinée au niveau 3.

---

## 10. Personnalisation de la candidature

### Objectif
Évaluer le degré d'adaptation réelle de la candidature à l'offre ou à l'entreprise ciblée, par opposition à un envoi générique identique à toutes les candidatures.

### Questions auxquelles cette dimension doit répondre
- La candidature semble-t-elle écrite pour ce poste précis, ou pourrait-elle être envoyée telle quelle à n'importe quelle offre similaire ?
- Les mots-clés et priorités de l'offre se retrouvent-ils dans la mise en avant du CV ou de la lettre ?
- Y a-t-il un élément qui montre que le candidat connaît l'entreprise ou le poste ?

### Observations déterministes (sans IA)
- Taux de recouvrement entre les mots-clés de l'offre et le contenu du CV ou de la lettre.
- Présence du nom de l'entreprise ou du poste dans la lettre.
- Présence d'une accroche personnalisée en tête de CV.

### Analyse confiée à l'IA
- Apprécier si l'adaptation observée est superficielle (mots-clés recopiés sans lien réel) ou réellement pertinente (mise en avant argumentée des éléments qui comptent pour cette offre précise).

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Une candidature perçue comme générique donne l'impression d'un envoi de masse et réduit fortement l'engagement perçu du candidat aux yeux du recruteur.

### Recommandations possibles
- Ajouter une accroche liée directement à l'offre.
- Réordonner les expériences en fonction des priorités affichées dans l'offre.
- Ajuster le vocabulaire pour reprendre les termes clés de l'offre, quand ils sont légitimes.

### Priorité
Évolution V2. Pleinement pertinente à partir du niveau 3 (offre d'emploi), approfondie au niveau 4 avec la lettre de motivation.

---

## 11. Cohérence transversale du dossier

### Objectif
Vérifier que les différentes pièces de la candidature (CV, lettre de motivation, discours envisagé pour l'entretien) racontent la même histoire et ne se contredisent pas.

### Questions auxquelles cette dimension doit répondre
- La lettre de motivation reprend-elle et complète-t-elle le CV, ou le contredit-elle ?
- Le discours envisagé pour l'entretien est-il aligné avec ce qui est écrit ?
- Le ton et les priorités affichées sont-ils constants d'un document à l'autre ?

### Observations déterministes (sans IA)
- Présence d'informations contradictoires entre le CV et la lettre (dates, intitulés, chiffres).
- Reprise ou non des éléments clés du CV dans la lettre.

### Analyse confiée à l'IA
- Apprécier la cohérence de fond, pas seulement factuelle, entre les différentes pièces.
- Identifier si un même point fort est valorisé de façon cohérente d'un document à l'autre.
- Repérer un décalage de ton entre les pièces du dossier.

### Restitution attendue
Échelle qualitative commune.

### Impact pour le candidat
Une incohérence entre les pièces d'un dossier, ou entre les documents et l'entretien, casse la confiance construite par les documents écrits.

### Recommandations possibles
- Harmoniser une information contradictoire.
- Aligner le discours d'entretien sur les points forts déjà mis en avant dans le CV ou la lettre.
- Réutiliser un argument fort du CV dans la préparation d'entretien.

### Priorité
Évolution V2. Nécessite le niveau 4 (CV + lettre + préparation entretien).

---

## Utilisation prévue de ce référentiel

Ce document devient la référence unique pour la suite du chantier :

- les **règles métier** de chaque dimension (objectif, questions, priorité) cadrent ce que le module doit chercher à établir ;
- les **observations déterministes** listées ici définissent le périmètre exact du futur `FaitsExtractor` ;
- les **analyses confiées à l'IA** définissent le contenu à couvrir par les futurs prompts, sans en fixer la formulation ;
- la **restitution attendue** fixe le format de sortie que devra produire le futur `DiagnosticResponseParser` ;
- les **recommandations possibles** cadrent le type de contenu que le futur second passage IA devra pouvoir approfondir.

Aucun prompt, aucun code et aucune interface ne doivent être construits sans revenir à ce référentiel en cas de doute sur le contenu ou l'intention d'une dimension.
