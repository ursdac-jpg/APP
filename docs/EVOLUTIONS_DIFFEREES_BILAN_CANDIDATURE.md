# Évolutions différées : module « Bilan de candidature »

> Ce document n'est pas une roadmap. Il ne planifie rien, n'engage aucune date, et rien de ce qu'il décrit ne doit être interprété comme un développement prévu ou engagé. Son seul objectif : conserver le raisonnement derrière des décisions de conception importantes qui ont été volontairement écartées ou reportées pendant le chantier "continuité Diagnostic → Correction" (2026-08-10), pour qu'une reprise du module dans plusieurs mois retrouve immédiatement le pourquoi, pas seulement le quoi.
>
> Une phrase résume la philosophie qui traverse l'ensemble de ce document : **l'IA doit toujours réduire la charge cognitive du candidat, jamais lui retirer le contrôle de son CV.**

---

## 1. Distinguer le jugement de l'IA et la trace de ce que la personne a réellement fait

### Constat

Le module distingue déjà, dans sa philosophie, deux types de données : ce qui est **déterministe** (calculé par l'application, jamais sujet à interprétation) et ce qui est **interprétatif** (produit par un modèle de langage, jamais garanti stable d'un passage à l'autre). Cette distinction structure tout le module : `analyse/faitsExtractor.js` reste séparé des règles interprétatives du prompt, `extraitConcerne` doit être une citation verbatim jamais reconstruite, la cascade de résolution des destinations (`correction/resolutionDestination.js`) privilégie le déterministe (un extrait retrouvé mot pour mot) avant de retomber sur l'interprétatif (un axe).

Cette même distinction n'a pas été appliquée à un endroit où elle aurait dû l'être : `_bilanStatutsCorrection` (js/app.js), qui retient quelles recommandations la personne a marquées corrigées, passées ou copiées, est une donnée **entièrement déterministe**, générée par un clic de la personne, jamais par une IA. Elle ne porte aucun des risques (reformulation, non-déterminisme, faux positifs) qui ont motivé l'abandon de la comparaison avant/après entre deux diagnostics (voir section 2). Elle est pourtant traitée exactement comme le reste de l'état de correction : entièrement effacée dès que "Analyser à nouveau mon CV" est cliqué (`btnClotureCta`, `js/app.js`).

### Ce qui a été confondu

Une seule question ("faut-il comparer deux bilans ?") a en réalité recouvert deux questions indépendantes :
1. Comparer le **jugement de l'IA** entre deux passages, écarté à raison (section 2).
2. Conserver la **trace de ce que la personne dit avoir fait** : jamais un problème de fiabilité, jetée par défaut avec le reste.

### Piste, non spécifiée

Un journal léger et purement local (jamais envoyé à une IA, jamais utilisé pour reformuler quoi que ce soit) qui survivrait à "Analyser à nouveau mon CV" : quelles recommandations ont été marquées corrigées/passées/copiées, à quelle date. Usages possibles, aucun n'a été conçu en détail :
- Un futur écran "vous aviez déjà traité 3 points le [date]".
- Nourrir la section 3 ci-dessous : savoir ce qui a déjà été tenté évite à une automatisation de reproposer ce qui l'a déjà été.

### Ce qui ne change pas aujourd'hui

Aucune décision de code n'a été prise sur ce point. Rien dans l'architecture actuelle n'empêche de le faire plus tard (`_bilanStatutsCorrection` est déjà une structure indépendante des autres états, jamais entremêlée).

---

## 2. Comparaison avant/après entre deux diagnostics : décision explicitement rejetée, pas seulement reportée

Discutée et écartée en profondeur (voir l'historique du chantier). Résumé : comparer deux sorties d'un modèle de langage non déterministe sur un même sujet reformulé différemment à chaque passage est un problème mal posé, avec un risque réel de fausses alertes ("ce point n'est pas résolu" alors qu'il l'est, ou l'inverse) plus dommageable pour la confiance dans l'outil que l'absence de la fonctionnalité. Contrairement aux autres points de ce document, celui-ci n'est pas "à reprendre si un besoin réel apparaît" mais "à revisiter uniquement si une méthode de comparaison fiable est trouvée", un seuil volontairement plus haut.

---

## 3. Seconde modalité d'accompagnement : une architecture à trois niveaux, pas un "Prompt 3"

> **Statut (2026-08-10) : chantier lancé, en exception assumée au principe "ne pas construire sur une intuition".** L'architecture ci-dessous a d'abord été validée comme piste conceptuelle, sans engagement de développement, en attendant des retours d'usage réels sur le parcours "Diagnostic → Correction". Décision explicite : ne pas attendre ces retours, sur la base d'une connaissance directe et déjà établie du public d'ERIP (difficultés d'autonomie numérique, rédactionnelle et méthodologique) et d'une contrainte de calendrier (rentrée). Ce chantier est donc mené en parallèle du parcours "Diagnostic → Correction", jamais en remplacement, avec la même discipline de conception que Prompt 1 et Prompt 2 (conception avant code, maquette avant écran, validation humaine systématique). Si les usages futurs montrent un besoin moindre que prévu, le périmètre pourra être réduit ; l'inverse aurait coûté plusieurs mois d'attente.

### Besoin exprimé

Le parcours de correction actuel (guide/libre/copier/texte) suppose que la personne est en capacité de transformer elle-même une recommandation en modification de son CV. Une partie du public d'ERIP ne l'est pas, en particulier lorsque le nombre de recommandations validées est élevé (dix, quinze). Besoin identifié : une option discrète, jamais le parcours par défaut, qui permette à ces personnes de repartir avec un CV déjà consolidé, sans avoir à reporter elles-mêmes chaque modification.

### Le principe directeur : une architecture d'accompagnement, pas seulement technique

Ce n'est pas uniquement un choix d'ingénierie. L'objectif qui gouverne les trois niveaux ci-dessous est la réduction progressive de la charge cognitive de la personne :
- **L'application agit en premier**, partout où une décision peut être prise de façon fiable et déterministe : aucune IA, aucun risque, aucune supervision nécessaire sur ce qui est fait.
- **L'IA n'intervient que là où l'automatisation atteint sa limite**, jamais par défaut, jamais pour un travail que l'application peut déjà faire seule.
- **La décision finale reste systématiquement humaine**, à chaque niveau, y compris lorsque l'application ou l'IA a réussi. C'est une distinction essentielle à ne jamais perdre en cours de route : le **travail** suit une cascade (application → IA → personne, chacun sollicité seulement si le précédent ne suffit pas) ; la **validation**, elle, ne suit aucune cascade, elle est humaine à chaque niveau, sans exception. Réduire la charge cognitive ne doit jamais se traduire par une réduction du contrôle.

Chaque acteur n'intervient que lorsqu'il apporte une valeur que le niveau précédent ne peut pas apporter, c'est ce qui donne son sens à l'ensemble, pas seulement le fait que ça fonctionne techniquement.

### Précision (2026-08-11) : ce qui est "sans IA", et ce qui ne l'est jamais

Ambiguïté trouvée et corrigée en construisant la brique 3 (écran de relecture) : la formulation initiale de cette section ("Niveau 1... sans IA") prêtait à confusion. Une `Recommandation` (Prompt 1) ne contient que `contenu` (le conseil : quoi améliorer) et `extraitConcerne` (le passage actuel du CV, cité verbatim) -- jamais un texte de remplacement prêt à écrire (`modeles/recommandation.js`, `prompts/bilan-v1.md`). ERIP n'ayant aucun moteur de reformulation local, la seule source de texte réécrit dans toute l'application est le cycle Prompt 2 (`PropositionAmelioration.proposition`).

Ce qui est réellement "sans IA", et propre à chaque niveau, c'est uniquement la résolution de la **destination d'écriture** (où insérer le texte) :
- **Niveau 1** : déterministe grâce à `extraitConcerne`, `correction/resolutionDestination.js` retourne déjà `{ index, champ }` sans ambiguïté.
- **Niveau 2** : résolue différemment selon la famille -- voir "Distinction... deux familles" plus bas pour le détail complet. En bref : rédactionnelle (`experiences`) via `assistance/resolutionChampExperience.js`, avec un choix humain non automatisé pour cette V1 quand plusieurs expériences existent ; complétude (`candidature`) ne nécessite aucune résolution de champ, une navigation vers le bloc concerné dans son ensemble suffit.

La **génération du texte lui-même**, quand une reformulation est nécessaire, est commune aux deux niveaux et réutilise systématiquement le cycle Prompt 2 existant (`bilanOuvrirModaleAmelioration`) -- jamais un second mécanisme de génération.

### Niveau 1 : destination déterministe

Pour toute recommandation validée dont la résolution (`correction/resolutionDestination.js`) est de `type: 'extrait'` : la destination d'écriture (`dossier.experiences[index][champ]`) est connue avec certitude, sans IA ni ambiguïté. Le routage nécessaire existe déjà, construit pour un autre usage (rediriger la personne vers le bon endroit à corriger) mais directement réutilisable ici tel quel : c'est la même question ("cette recommandation a-t-elle un point d'ancrage précis ?") qui répond aux deux besoins. Le texte à écrire à cette destination, lui, provient du cycle Prompt 2 comme au Niveau 2 (voir précision ci-dessus).

### Niveau 2 : destination résolue par assistance, uniquement quand le Niveau 1 ne suffit pas

Pour les recommandations validées résolues en `axe` ou `texte-libre` (pas de point d'ancrage précis : création d'une rubrique, ajout de contenu, réorganisation) : la destination d'écriture elle-même devient incertaine, avec la même discipline que le Prompt 2 actuel, jamais davantage.
- **Jamais de CV complet en sortie.** Le risque ne vient pas de l'intention du prompt mais de la forme de sa sortie : si le modèle régénère le document entier, chaque ligne redevient un site possible de dérive, même sous des consignes strictes. Seule une sortie bornée à un fragment (même forme que `PropositionAmelioration` aujourd'hui : `proposition`/`justification`/`actionsConcretes`) garantit qu'il n'y a rien d'autre à faire dériver. L'assemblage dans le document reste un acte mécanique de l'application, jamais un acte de l'IA.
- **Ce n'est peut-être pas un nouvel instrument.** Une extension du contrat du Prompt 2 existant pour le cas où `extraitConcerne` est absent (déjà partiellement traité aujourd'hui, voir `ARCHITECTURE_PROMPT2_BILAN_CANDIDATURE.md`) est probablement suffisante, pas besoin d'un "Prompt 3" séparé avec sa propre discipline de conception à construire de zéro.
- **Traitement indépendant, décision explicite.** Chaque recommandation de Niveau 2 est traitée seule, comme le Prompt 2 aujourd'hui, sans orchestration qui regrouperait plusieurs corrections en un seul passage. Une orchestration groupée résoudrait un risque (redondance ou contradiction entre deux fragments générés séparément) qui a déjà une réponse ailleurs (voir Vérification ci-dessous), au prix d'un vrai coût : donner plus de contexte du CV à l'IA en une seule fois réintroduit une partie de la surface de dérive qu'on vient justement d'exclure. Cohérent avec la méthode suivie tout au long de ce chantier (le corpus de test du Prompt 1, l'abandon de la comparaison avant/après) : ne pas complexifier par anticipation d'un problème non observé. À reconsidérer uniquement si l'usage réel montre que les collisions entre fragments de Niveau 2 sont fréquentes.

### Distinction (2026-08-11) : deux familles de recommandations à l'intérieur du Niveau 2, pas un bloc homogène

Ambiguïté trouvée et corrigée en construisant la brique 4 (écriture réelle dans `dossier`) : toutes les recommandations de Niveau 2 (`type: 'axe'`) ne se ressemblent pas. En vérifiant, pour chaque axe routé vers `cible: 'candidature'` (`adequation`, `personnalisation`), la nature réelle du champ concerné (`metierCible`, `secteurCible`, `objectif.poste/structure/lien`, `rechercheCandidature.*`) : ce sont systématiquement des **données métier**, des faits que seul le candidat connaît (quel métier il vise, quelle entreprise, qui recrute) -- jamais du texte à rédiger. Cohérent avec un fait déjà établi et jamais remis en cause jusqu'ici : Prompt 2 ne reçoit ni la valeur actuelle de ces champs ni aucune donnée de `rechercheCandidature` en entrée (`amelioration/ameliorationPromptBuilder.js`) -- non pas un oubli, mais la conséquence directe du fait que Prompt 2 n'a jamais eu qu'une seule responsabilité : produire un fragment rédactionnel, jamais une donnée métier.

Deux familles, donc, à l'intérieur du Niveau 2 :
- **Famille 1, rédactionnelle** : un texte manque réellement et doit être rédigé (ex. ajouter une phrase chiffrée à une expérience). C'est le seul cas où Prompt 2 est légitime -- concrètement, les 6 axes d'expérience (`credibilite`, `risques`, `impact`, `coherence`, `differenciation`, `posture`, `cible: 'experiences'`) sans `extraitConcerne`.
- **Famille 2, complétude** : l'information manquante est un fait que le candidat seul peut fournir, jamais l'IA (elle ne l'a d'ailleurs jamais reçu en entrée). Concrètement, `adequation` et `personnalisation` (`cible: 'candidature'`), sans exception -- vérifié champ par champ, aucun des deux ne contient de zone de texte libre où une IA aurait sa place. Ici, l'application sait déjà exactement quel champ est concerné ; il n'y a rien à générer, seulement à orienter le candidat vers l'écran existant qui le collecte.

Cette distinction ne fait pas sortir la Famille 2 du périmètre de la modalité "Assistance à la finalisation du CV" -- elle change seulement son mécanisme : pas de génération, pas d'avant/après, pas de validation d'un texte, mais une navigation guidée vers le bloc Candidature existant (`bilanDeclencherActionCorrection`, déjà construit pour le parcours "Diagnostic → Correction", réutilisé tel quel, aucun nouveau code de navigation à écrire). Le candidat reste dans un parcours unique : certaines recommandations se résolvent par génération de texte relue et validée, d'autres par une saisie guidée dans un écran déjà existant, mais les deux restent traitées dans la même logique d'accompagnement, jamais deux fonctionnalités séparées.

Conséquence directe sur l'esquisse d'implémentation ci-dessous : l'étape de génération (moment 2) ne concerne que la Famille 1. La Famille 2 n'entre jamais dans l'écran de relecture avec case à cocher (brique 3, `assistance/etatRelecture.js`) -- ce module reste inchangé, il ne construit jamais d'élément pour une recommandation qui n'a pas de `texteApres` à proposer, et une recommandation de Famille 2 n'en a jamais.

Message candidat suggéré pour la branche Famille 2, avant de déclencher la navigation : *"Cette recommandation nécessite une information que seul vous pouvez renseigner. Nous allons vous guider vers l'écran correspondant."* -- transparent sur l'absence d'IA à cette étape, sans présenter la navigation comme un échec ou une étape dégradée du parcours.

Formule de synthèse des trois rôles, utile pour toute communication future sur cette modalité : **l'IA rédige** (Famille 1, un fragment de texte) ; **l'application collecte** (elle sait déjà quel champ structuré est concerné, sans avoir besoin de deviner) ; **le candidat fournit** (les faits que lui seul connaît -- quelle entreprise, qui recrute, quel métier précis). Chacun des trois n'intervient que là où il est seul à pouvoir apporter la réponse.

### Niveau 3 : vérification, pas comparaison

"Analyser à nouveau mon CV" (écran de clôture, brique 5) relance déjà Prompt 1 sur le CV mis à jour, quelle que soit l'origine de la mise à jour (manuelle, Niveau 1, ou Niveau 2), Prompt 1 n'a besoin de connaître ni l'historique ni la provenance des changements. C'est le seul moment de toute la chaîne où quelque chose examine le document dans son ensemble, ce qui en fait le filet de sécurité naturel contre une éventuelle incohérence introduite par plusieurs fragments de Niveau 2 indépendants. Ce n'est ni un nouveau mécanisme, ni la comparaison avant/après écartée en section 2 : aucune logique de diff automatique entre deux diagnostics, seulement un regard neuf que la personne lit et interprète elle-même. L'absence d'API dans ERIP (copier-coller manuel partout, y compris ici) est elle-même un garde-fou contre toute boucle automatique.

### Compatibilité avec l'architecture actuelle

Compatible, sans refactoring, parce que le terrain a déjà été préparé sans que ce soit son objectif initial :
- `resolutionDestination.js` (brique 1) : pour une recommandation résolue en `type: 'extrait'`, le résultat porte déjà `{ index, champ }`, assez pour écrire `dossier.experiences[index][champ]` sans ambiguïté. Cette précision existe *spécifiquement* parce qu'elle avait été anticipée pour cette évolution (voir le commentaire correspondant dans `resolutionDestination.js`).
- `PropositionAmelioration.recommandationId` relie déjà chaque proposition à sa recommandation d'origine, elle-même reliée à sa résolution de destination : la chaîne complète (quoi changer, où, par quoi) est déjà joignable avec les données existantes.
- La génération Word/PDF (`genererBlobDocumentActif()`) travaille déjà sur `dossier` comme seule source de vérité : une fois `dossier` mis à jour (Niveau 1 ou Niveau 2), la régénération est gratuite, aucune adaptation nécessaire.

### Une contrainte à ne pas perdre de vue : ERIP n'a pas d'API IA

Contrainte fondatrice de l'application entière, pas seulement de ce module. Le Niveau 2 ne peut rendre automatique que l'étape qui suit une proposition déjà obtenue (l'écrire dans le CV), jamais son obtention : générer une proposition restera un cycle copier/coller, comme aujourd'hui. À clarifier explicitement dans toute communication future sur cette fonctionnalité, pour ne pas laisser croire à une automatisation intégrale qu'ERIP ne peut pas offrir sans changer son architecture générale.

### Trois moments de reprise de main, jamais confondus

Question centrale posée avant la maquette, et qui a guidé sa conception : à quel moment le candidat reprend-il la main ? Trois moments distincts, pas un seul :
1. **L'entrée dans la modalité** : un geste explicite, jamais un chemin par défaut.
2. **La génération de chaque fragment de texte, pour la Famille 1 uniquement (rédactionnelle -- Niveau 1 et Niveau 2/`experiences` confondus, voir précision ci-dessus)** : contrainte structurelle plutôt que choix de design, ERIP n'ayant pas d'API IA, générer un fragment exige toujours un aller-retour manuel vers une IA externe. La Famille 2 (complétude) ne passe jamais par ce moment : rien à générer, une navigation directe suffit (voir "Distinction... deux familles" ci-dessus).
3. **La validation finale** : pour la Famille 1, un seul écran de relecture où les changements de Niveau 1 et de Niveau 2 rédactionnel apparaissent ensemble, rien ne s'écrivant dans `dossier` avant ce moment, y compris les changements de Niveau 1 -- le caractère déterministe du Niveau 1 décrit la façon dont le changement est calculé, jamais un droit de contourner la relecture. Pour la Famille 2, la validation est celle, déjà existante, de l'écran ERIP vers lequel le candidat est guidé : il saisit et valide l'information lui-même, aucune nouvelle mécanique de validation à construire.

### Écran de relecture : parcours validé par maquette interactive (2026-08-10)

Concerne exclusivement la Famille 1 (rédactionnelle) -- la Famille 2 (complétude) ne passe jamais par cet écran, voir "Distinction... deux familles" ci-dessus.

Cases pré-cochées par défaut, décision assumée et non un raccourci de charge cognitive au détriment du contrôle : chaque élément proposé découle d'une recommandation déjà consultée, comprise et volontairement retenue par le candidat plus tôt dans le parcours. L'écran ne demande donc pas "voulez-vous ce changement ?" (déjà répondu), mais "voulez-vous que cette proposition prête soit appliquée maintenant ?", une case à décocher restant possible individuellement, jamais tout ou rien.

Condition non négociable qui justifie ce pré-cochage : chaque proposition doit afficher clairement un **avant/après**, texte actuel et texte proposé côte à côte, pour que le candidat comprenne précisément ce qui va changer avant de laisser la case cochée. Sans cet avant/après visible, le pré-cochage ne serait plus défendable.

### Après application : enrichir le dossier, jamais créer un second générateur de CV

Une fois la validation faite, les changements cochés s'écrivent dans `dossier`, qui reste l'unique source de vérité de l'application. Le candidat retrouve ensuite son CV directement dans ERIP, exactement comme après toute autre modification : il peut continuer à l'éditer normalement (mêmes écrans qu'aujourd'hui), l'exporter avec les modèles Word/PDF existants (`genererBlobDocumentActif()`, aucune adaptation), ou relancer un bilan (Niveau 3). Cette évolution n'introduit donc aucun nouveau format de CV ni aucun second point de génération de document.

### Esquisse d'implémentation

Aucune de ces étapes n'est spécifiée en détail, c'est un enchaînement plausible, pas un plan :
1. Entrée : un point d'entrée depuis l'écran des 3 cartes (`htmlBilanAgirChoix()`, `js/app.js`). NOTE 2026-08-27 : ce document mentionnait `bilanDeterminerParcoursCorrection()` / `parcoursCorrection.js` et le mécanisme du mode "guide" — tout cela a été supprimé (code mort, voir `docs/LECONS_A_NE_PAS_REPRODUIRE.md` § 9.23). Cette esquisse est à repenser à partir de l'état actuel (`libre` / `copier` / Assistance à la finalisation) si ce chantier est un jour repris.
2. Classification automatique Niveau 1 / Famille 1 / Famille 2 par recommandation validée (réutilise `resolutionDestination.js`, puis `cible` pour distinguer `experiences` de `candidature`, voir "Distinction... deux familles" ci-dessus) : un calcul silencieux, jamais une écriture à ce stade.
3. Famille 1 (Niveau 1 et Niveau 2/`experiences`) : génération des fragments manquants en réutilisant le cycle Prompt 2 existant (`bilanOuvrirModaleAmelioration`), orchestré en séquence guidée : le mécanisme du mode "guide" (brique 3 du chantier précédent) fait déjà ce type d'enchaînement point par point, il s'agirait de lui faire déclencher une génération de fragment plutôt qu'une navigation. Seule la résolution de la destination distingue Niveau 1 et Niveau 2 (voir précision ci-dessus). Famille 2 : aucune génération, passe directement à l'étape 4bis.
4. Écran de relecture unique, Famille 1 uniquement (Niveau 1 et Niveau 2/`experiences` confondus), cases pré-cochées, avant/après obligatoire par élément (voir ci-dessus).
4bis. Famille 2 : navigation guidée vers le bloc Candidature existant (`bilanDeclencherActionCorrection`, déjà construit pour le parcours "Diagnostic → Correction"), le candidat saisit et valide l'information dans l'écran existant, aucun nouvel écran ni aucune nouvelle mécanique de validation.
5. Validation explicite (Famille 1) : un seul geste qui applique uniquement les changements cochés à `dossier`, jamais une écriture silencieuse, jamais avant cette étape (y compris pour le Niveau 1).
6. Retour au dossier enrichi : édition normale, export existant, ou Niveau 3 (voir ci-dessus).

### Statut

Parcours validé par une maquette interactive (2026-08-10), suivant la même discipline que le chantier "Diagnostic → Correction" : conception avant code, maquette avant écran.

**Mise à jour (2026-08-18, audit de cohérence documentaire)** : la ligne ci-dessus ("Aucun code de production écrit pour cette modalité") est restée figée après la rédaction de ce document alors que la modalité a en réalité été entièrement implémentée et committée le lendemain (2026-08-11, "Ajoute la modalité Assistance à la finalisation du CV (chantier complet)") — voir `modules/bilan-candidature/assistance/` (`etatRelecture.js`, `resolutionChampExperience.js`, `orchestrationAssistance.js`, `ecritureRelecture.js`), le câblage dans `js/app.js` (`_etatAssistanceBilan` et fonctions associées), et `docs/ARCHITECTURE_ORCHESTRATION_ASSISTANCE_BILAN_CANDIDATURE.md`. Cette section reste comme trace du raisonnement qui a précédé l'implémentation, pas comme un travail restant à faire.
