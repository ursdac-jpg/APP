# Stratégie de validation du moteur — Module « Bilan de candidature »

> Document de méthode uniquement. Aucun code, aucun prompt IA, aucune interface. Il définit comment vérifier objectivement que le moteur fonctionne, et non plus comment il doit fonctionner. S'appuie sur l'ensemble des documents de conception déjà établis : [ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md](ARCHITECTURE_MODULE_BILAN_CANDIDATURE.md), [REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md](REFERENTIEL_ANALYSE_BILAN_CANDIDATURE.md), [PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md](PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md), [ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md](ARCHITECTURE_PROMPT1_BILAN_CANDIDATURE.md) et [REFERENTIEL_REGLES_EVALUATION.md](REFERENTIEL_REGLES_EVALUATION.md).

Question centrale à laquelle ce document répond : **comment saurons-nous que le moteur est réellement performant, fiable et utile, sur des critères objectifs plutôt que sur un ressenti ?**

---

## 1. Critères de réussite — grille d'évaluation

Cette grille est **unique** : elle sert à la fois de définition de la réussite (section 1) et de grille appliquée à chaque test (section 4) — les deux ne sont pas dédoublées dans ce document, une seule et même grille est utilisée partout.

Chaque critère est directement dérivé d'une règle déjà posée dans le référentiel des règles d'évaluation, pas inventé pour l'occasion — ce qui garantit que valider le moteur revient à vérifier qu'il applique réellement ses propres règles.

### A. Fidélité aux données
- Toute observation argumentée cite au moins une observation factuelle ou un extrait réel du CV/de l'offre *(règle de traçabilité)*.
- Aucune information, expérience ou compétence n'est inventée ou supposée *(règle de prudence)*.

### B. Pertinence de l'analyse
- Les dimensions non évaluables au niveau de données disponible sont explicitement signalées comme telles, jamais devinées.
- Les observations mises en avant sont significatives pour le poste/métier visé, pas des généralités interchangeables.
- Le niveau attribué à chaque dimension correspond aux critères de bascule définis *(référentiel des règles, section 1)*.

### C. Cohérence interne
- Absence de recommandations en double *(règle d'unicité)*.
- Absence de recommandations contradictoires *(règle de non-contradiction)*.
- Les éléments non-compensables sont isolés en tête de rapport, jamais noyés dans le reste.
- La synthèse de projection recruteur ne contredit pas les conclusions des dimensions dont elle dérive.

### D. Qualité de la priorisation
- Les recommandations de priorité « critique »/« haute » correspondent effectivement à une dimension déterminante en difficulté ou à un élément non-compensable.
- Le plan d'action reste court et actionnable, pas une liste exhaustive.
- L'ordre du plan respecte la logique de dépendance (confiance avant valeur avant forme).

### E. Qualité de la restitution
- Aucune formulation culpabilisante *(test du sujet grammatical)*.
- Chaque faiblesse signalée s'accompagne d'au moins une piste d'amélioration concrète.
- Le rapport suit la structure narrative définie dans la philosophie d'évaluation.

### F. Exploitabilité par le candidat
- Le rapport est compréhensible sans connaissance du référentiel interne.
- Le candidat peut identifier, sans effort de reformulation, ce qu'il doit faire en premier.

---

## 2. Batterie de tests — profils

### Principe de sélection

Un profil n'est retenu que s'il permet de vérifier un **comportement du moteur** qui ne serait pas déjà couvert par un autre profil. Plusieurs profils proposés initialement se recoupent ; ils sont fusionnés ci-dessous plutôt que dupliqués (détail en fin de section).

### Profils retenus (8)

1. **Premier emploi / jeune diplômé** — formation et projets plutôt qu'expérience professionnelle. Vérifie les règles contextuelles « premier emploi » (plafond de sévérité sur Adéquation et Impact).
2. **Candidat confirmé** — expérience moyenne, cas nominal de référence. Vérifie le poids croissant d'Impact/valeur démontrée avec la séniorité.
3. **Reconversion professionnelle**, en deux variantes : *expliquée* (doit être valorisée, pas pénalisée) et *non expliquée* (doit remonter comme axe d'amélioration). Vérifie la nuance centrale du référentiel des règles : l'écart n'est jamais le problème, seule l'absence d'explication l'est. Inclut la variante « changement complet de métier » comme cas extrême de cette même règle, plutôt que comme profil séparé.
4. **Période d'inactivité dans le parcours**, en deux variantes : *courte et expliquée* et *longue et non expliquée*. Vérifie la même nuance que le profil 3, appliquée à un trou plutôt qu'à un changement de secteur.
5. **Candidature spontanée** (sans offre) — vérifie le niveau 2 d'analyse et la règle contextuelle associée (Personnalisation proportionnellement plus déterminante).
6. **Réponse à une offre précise** (offre complète fournie) — vérifie le niveau 3, l'affinement d'Adéquation, et l'activation de Personnalisation.
7. **Décalage de niveau par sur-qualification** — candidat au profil plus expérimenté que ce que demande le poste visé. Vérifie l'interaction entre Adéquation et Risques.
8. **Candidature déjà très solide** *(cas de référence positif, ajouté)* — dossier sans défaut majeur identifiable. Sert à vérifier que le moteur sait conclure « prêt à être envoyé » sans fabriquer artificiellement un point faible — un test tout aussi nécessaire que les tests orientés défauts, sans quoi rien ne prouve que le moteur ne « cherche pas des problèmes » par construction.

### Profils écartés ou fusionnés, et pourquoi

- **Alternance** — déplacé en cas limite (section 3) : le comportement à vérifier n'est pas celui d'un profil de candidat, mais un risque de faux positif (chevauchement légitime de dates entre formation et expérience, pouvant être confondu avec une incohérence chronologique).
- **Candidat très qualifié** — reformulé en « décalage de niveau par sur-qualification » (profil 7), plus précis sur le comportement réellement testé.
- **Candidat avec peu d'expérience** — fusionné avec le profil 1 : aucun comportement distinct du moteur ne justifie de le séparer de « premier emploi ».
- **Profils atypiques** *(mentionné dans la demande initiale sous une forme générique)* — non retenu tel quel : une catégorie « atypique » n'est pas testable de façon reproductible sans être déclinée en cas concrets, ce que fait la section 3.

---

## 3. Cas limites

### Principe de sélection

Un cas limite teste la **robustesse face à une situation peu fréquente**, pas un comportement métier courant (déjà couvert en section 2). Il ne duplique jamais un profil déjà testé.

1. **CV quasi vide** (nom et un seul poste, sans détail) — vérifie la dégradation propre plutôt que l'hallucination : le moteur doit signaler l'insuffisance de données, jamais combler les vides.
2. **CV très chargé** (longueur excessive, nombreuses rubriques) — vérifie que la priorisation reste opérante malgré le volume, sans noyer les éléments réellement importants.
3. **Accumulation d'expériences très courtes** (missions d'intérim, contrats courts répétés) — vérifie que le moteur distingue une instabilité réelle d'un format d'emploi légitime pour certains secteurs (intérim, conseil, freelance). *Nuance identifiée pendant la rédaction de ce document, à ajouter au référentiel des règles contextuelles si elle n'y figure pas déjà explicitement.*
4. **Chevauchement légitime formation/expérience** (alternance, VIE, doctorat en entreprise) — vérifie la résistance de la règle de non-compensation « incohérence chronologique » aux faux positifs.
5. **Expériences ou diplômes à l'étranger** — vérifie que le moteur ne pénalise pas une information par méconnaissance d'un système étranger (un diplôme non reconnu par un référentiel français ne doit jamais être traité comme une absence de diplôme).
6. **Contradictions factuelles volontairement introduites** — vérifie la détection réelle d'une alerte non-compensable quand elle existe effectivement (complète le profil 8, qui vérifie l'absence de fausses alertes).
7. ~~**Coordonnées totalement absentes**~~ — *retiré (2026-08-19, audit de cohérence documentaire) : cette règle de non-compensation a été supprimée le 2026-08-10, le CV transmis au diagnostic ne contient de toute façon jamais les coordonnées (voir `docs/PHILOSOPHIE_EVALUATION_BILAN_CANDIDATURE.md`). Cas devenu sans objet, plus rien à tester ici.*

*Le cas « longues périodes d'inactivité », mentionné initialement, n'est pas répété ici : il est déjà couvert par le profil 4 (section 2), dans sa variante longue et non expliquée.*

---

## 4. Critères d'évaluation par test

Chaque test — profil ou cas limite — est consigné selon une fiche identique, construite directement sur la grille de la section 1 : contexte fourni (niveau de données), résultat pour chacun des six blocs de critères (conforme / partiel / non conforme), écarts constatés avec leur description, verdict global du test.

Utiliser une grille strictement identique pour tous les tests est ce qui rend les résultats comparables entre eux et dans le temps — c'est cette contrainte qui a motivé la fusion en section 1 plutôt qu'une seconde liste de critères propre à cette section.

---

## 5. Indicateurs de qualité

Les indicateurs se mesurent en **taux** (proportion sur l'ensemble de la batterie), pas en compte brut, pour rester comparables d'une version du moteur à l'autre indépendamment du nombre de tests exécutés.

- **Taux de traçabilité** — proportion d'observations argumentées reliées à un fait vérifiable. Cible : 100 %.
- **Taux de faux positifs (alertes non-compensables)** — proportion de tests où une alerte est déclenchée à tort ; mesuré notamment via le profil 8. Cible : 0 %.
- **Taux de faux négatifs (alertes non-compensables)** — proportion de tests où une alerte réelle n'a pas été détectée ; mesuré via le cas limite 6 (le cas limite 7 est retiré, voir ci-dessus). *Indicateur symétrique du précédent, ajouté ici car un moteur prudent uniquement du côté des faux positifs pourrait, à l'inverse, devenir trop silencieux sur de vrais problèmes.*
- **Taux de violations de cohérence interne** — proportion de tests présentant un doublon ou une contradiction dans la sortie elle-même. Cible : 0 %.
- **Taux de recommandations jugées utiles** — mesuré lors de la validation humaine (section 6).
- **Taux d'accord global avec un professionnel** — proportion de tests où le statut global du moteur correspond à celui d'un CIP/recruteur consulté (section 6).
- **Stabilité inter-exécutions** — sur un même dossier soumis plusieurs fois, taux de variation du statut global et des alertes prioritaires. *Indicateur spécifique au caractère non déterministe d'un moteur reposant sur une IA générative : un diagnostic qui change fortement d'une exécution à l'autre sur les mêmes données nuit à la confiance, indépendamment de la justesse de chaque réponse prise isolément.*

Chaque indicateur se mesure sur la **même batterie complète** (sections 2 et 3), avant et après une modification du prompt ou d'une règle, ce qui permet une comparaison directe entre deux versions du moteur.

---

## 6. Méthode de validation humaine

Objectif : répondre à « un CIP ou un recruteur expérimenté serait-il globalement d'accord avec cette analyse ? ».

1. **Sélection** — un sous-ensemble représentatif de dossiers déjà testés (quelques profils nominaux plutôt que l'intégralité de la batterie, pour rester praticable avec un temps professionnel limité).
2. **Évaluation en aveugle** — un professionnel produit sa propre analyse du dossier, selon une grille simplifiée dérivée du même référentiel (statut global, quelques points forts, quelques points de vigilance), **sans avoir vu le rapport du moteur au préalable**, pour éviter un biais d'ancrage.
3. **Comparaison** — sur le statut global (accord/désaccord), le recouvrement des points forts identifiés, le recouvrement des points de vigilance identifiés, la présence des mêmes alertes non-compensables le cas échéant.
4. **Niveau d'accord attendu** — un accord total n'est pas la cible : deux professionnels humains ne seraient pas non plus d'accord à 100 % entre eux. La cible réaliste est un accord sur le statut global et sur la majorité des points cités ; le seuil précis se calibre avec les premiers résultats réels plutôt que d'être figé arbitrairement dans ce document.
5. **Boucle de retour** — un désaccord significatif et récurrent doit être analysé comme un signal possible de règle manquante ou mal calibrée dans le référentiel des règles d'évaluation, et pas seulement comme un écart isolé à corriger dans le prompt (voir section 7).

---

## 7. Méthode d'amélioration continue

Cycle à suivre à chaque évolution du moteur, sans exception :

1. **Tester** — exécuter la batterie complète (sections 2 et 3) sur la version courante.
2. **Observer** — consigner les résultats selon la grille (section 4) et les indicateurs (section 5).
3. **Identifier les erreurs réelles** — un écart n'est traité comme un problème à corriger que s'il viole un critère de la grille ou dégrade un indicateur mesuré, jamais sur la base d'une préférence de formulation isolée. *Ce garde-fou répond directement à la volonté exprimée d'éviter les corrections fondées sur une intuition.*
4. **Prioriser** — un écart touchant une dimension déterminante ou une règle de non-compensation est corrigé avant un écart touchant une dimension amplificatrice, en cohérence avec la hiérarchie déjà posée dans le référentiel des règles.
5. **Corriger uniquement ce qui pose problème** — modification ciblée du bloc de prompt ou de la règle concernée, jamais une réécriture large « au cas où ».
6. **Retester l'intégralité de la batterie** — pas seulement le cas ayant révélé le problème, pour détecter une éventuelle régression sur des profils déjà validés.
7. **Documenter** — la correction et son effet mesuré (avant/après sur les indicateurs), en cohérence avec la pratique de traçabilité de version déjà posée dans le référentiel des règles.

---

## 8. Critères de mise en production (V1)

Objectif : un niveau de qualité réaliste, pas une recherche de perfection.

- **Taux de faux positifs sur les alertes non-compensables : 0 % sur la batterie complète.** Seuil strict et non négociable, car une fausse alerte de ce type a un coût de confiance disproportionné au regard de la philosophie du module.
- **Taux de traçabilité proche de 100 %** sur l'ensemble de la batterie — tolérance minime, pas nulle, mais une affirmation non prouvée suffit à fragiliser la crédibilité perçue de tout le rapport.
- **Aucune violation de cohérence interne** (doublon, contradiction) ne doit subsister sur la batterie complète.
- **Accord substantiel avec la validation humaine** sur les profils nominaux (section 2) — pas nécessairement sur l'ensemble des cas limites, qui peuvent rester perfectibles en V1.

### Le critère différenciant pour la V1

La V1 n'est pas prête quand elle réussit parfaitement tous les cas limites, mais quand elle **échoue prudemment** sur ceux qu'elle ne maîtrise pas encore : reconnaître honnêtement une limite ou une incertitude, plutôt que produire une conclusion assurée et fausse. C'est cette distinction — jamais l'exhaustivité — qui doit trancher la question « sommes-nous prêts pour la production ? ». Une V1 qui dit parfois « je ne peux pas conclure avec certitude sur ce point » reste conforme à sa mission ; une V1 qui se trompe avec assurance ne l'est jamais, quelle que soit par ailleurs la qualité du reste.

---

## Analyse critique de la stratégie

- **Grille unique plutôt que deux listes de critères** — les sections 1 et 4, demandées séparément, désignaient en réalité le même objet vu sous deux angles (la définition de la réussite, et son application systématique). Les dédoubler aurait introduit un risque de divergence progressive entre les deux listes au fil des évolutions du document.
- **Batterie compactée de 10 à 8 profils**, sans perte de couverture fonctionnelle : alternance déplacée vers les cas limites (ce qu'elle teste réellement est un risque de faux positif, pas un profil de candidat), « très qualifié » reformulé en test précis de sur-qualification, « peu d'expérience » fusionné avec « premier emploi », « profils atypiques » écarté faute d'être reproductible tel quel.
- **Profil manquant identifié et ajouté** — aucun profil initial ne permettait de vérifier qu'un dossier déjà solide obtient une conclusion positive sans fabrication artificielle de points faibles ; le profil 8 comble ce manque et rend mesurable le taux de faux positifs (section 5).
- **Indicateur manquant identifié et ajouté** — le taux de faux négatifs sur les alertes non-compensables, symétrique du taux de faux positifs déjà demandé, sans lequel un moteur pourrait paraître fiable en étant seulement silencieux sur les vrais problèmes.
- **Indicateur spécifique à la nature générative du moteur ajouté** — la stabilité inter-exécutions n'a pas d'équivalent dans un logiciel déterministe classique ; elle mérite un suivi dédié compte tenu du mode de fonctionnement du moteur (IA générative externe, pas de calcul reproductible à l'identique).
- **Nuance contextuelle potentiellement manquante repérée** — le cas limite des expériences courtes répétées (mission, intérim, conseil) soulève une règle contextuelle qui n'apparaissait pas explicitement dans le référentiel des règles d'évaluation ; à vérifier et compléter si nécessaire lors d'un futur passage sur ce document, sans que cela justifie un nouveau document à ce stade.

---

## Utilisation prévue de ce document

- Les **sections 2 et 3** constituent la batterie de référence à exécuter à chaque évolution du moteur (section 7).
- La **section 1/4** est la grille appliquée systématiquement à chaque test, sans exception ni variation.
- La **section 5** fournit les indicateurs à comparer entre deux versions du moteur, avant toute décision d'évolution.
- La **section 6** cadre les sessions de confrontation avec un professionnel, à organiser périodiquement plutôt qu'une seule fois.
- La **section 7** est le cycle de travail à appliquer à chaque correction, sans exception.
- La **section 8** est le seul document à consulter pour trancher la question « sommes-nous prêts pour la production ? ».

Ce document devient la référence de toutes les évolutions futures du Bilan de candidature : toute modification du moteur devra être justifiée par un résultat de cette stratégie de validation, jamais par une impression.
