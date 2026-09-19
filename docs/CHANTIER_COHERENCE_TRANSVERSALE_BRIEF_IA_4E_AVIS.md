# Brief pour un 4e avis externe — Cohérence transversale ERIP, question de l'"Observation réutilisable"

Contexte rapide : ERIP est une application web d'accompagnement à la candidature (CV, lettre, entretien), 100% statique, sans backend, sans API IA payante - toute génération IA passe par un copier-coller manuel vers un assistant externe. Philosophie non négociable : l'IA propose, la personne valide/modifie/rejette, jamais de décision automatique, jamais de score chiffré (diagnostic toujours qualitatif).

Un chantier en cours vise à analyser la cohérence d'une candidature à travers plusieurs documents (CV, lettre de motivation, préparation d'entretien, offre d'emploi visée) - vérifier que ces documents racontent la même histoire, se complètent, ne se contredisent pas, et que les qualités mises en avant (autonomie, rigueur...) sont réellement démontrées, pas juste affirmées. Après plusieurs tours d'avis (dont le vôtre déjà reçu), la conception de fond est arrêtée. Une seule vraie question d'architecture reste ouverte, et c'est celle-ci qu'on vous soumet.

## Le contexte de la question

Une réflexion antérieure, jamais implémentée (nom de code interne "V4", volontairement mise en réserve) avait exploré l'idée suivante : au lieu que l'IA relise l'intégralité d'un CV à chaque nouvelle restitution demandée (diagnostic, extraction de données, futur score de correspondance à un métier...), elle produirait une seule fois un ensemble de constats atomiques appelés "Observations", chacun avec :

- **Ancrage** : à quoi il se rattache (une section du CV, le document entier, ou une relation entre deux éléments).
- **Nature** : le type de constat (un fait neutre, une qualité, une absence, une incohérence, une force, une ambiguïté).
- **Preuve** : l'extrait de texte exact qui fonde l'observation.
- **Confiance** : certaine (un fait vérifiable) ou déduite (une inférence).
- **Valence** : signal plutôt positif, négatif ou neutre.
- **Dimension concernée** : à quel grand axe d'évaluation ça se rattache.

Cette architecture avait été mise en réserve, avec la règle explicite : ne l'activer que le jour où un chantier concret (Cohérence transversale, Regard recruteur, ou score de correspondance métier/ATS) en aurait vraiment besoin. C'est le cas maintenant.

## La question précise posée

Faut-il, pour ce chantier de cohérence transversale, emprunter **uniquement le principe de l'Observation réutilisable ci-dessus** (une petite fiche structurée par constat transversal détecté, avec ces mêmes 5-6 propriétés), sans reconstruire toute l'architecture V4 derrière (qui toucherait aussi l'extraction du CV, un futur score ATS, etc.) ?

L'idée serait : chaque fois que l'analyse transversale détecte quelque chose ("l'autonomie n'est démontrée nulle part alors que l'offre l'exige", "la phrase d'accroche du CV est reprise mot pour mot dans la lettre"), ce constat est stocké sous cette forme structurée (ancrage/nature/preuve/confiance/dimension) plutôt que comme une simple ligne de texte dans un rapport. Objectif recherché : que ce même constat puisse plus tard être réaffiché ailleurs (dans l'écran de correction de la lettre, dans une future préparation d'entretien) sans redemander à l'IA de tout reformuler depuis zéro - sans pour autant s'engager dans la reconstruction complète de la V4 pour le reste de l'application (extraction, score ATS, etc., qui restent hors périmètre de ce chantier).

## Ce qu'on vous demande

1. Est-ce une bonne idée d'emprunter cette structure d'"Observation" à petite échelle (juste pour ce chantier), ou est-ce que ça crée un risque de faire les deux à moitié (ni la simplicité d'une solution ad hoc, ni les bénéfices complets de la vraie architecture) ?
2. Si oui, quelle serait la façon la plus simple de commencer petit sans s'enfermer, si l'idée est un jour étendue au reste de l'application ?
3. Si non, quelle alternative plus simple recommanderiez-vous pour que ces constats transversaux restent réutilisables (par exemple dans l'écran de correction de la lettre) sans emprunter ce vocabulaire d'Observation ?
4. Toute autre perspective sur ce point précis.
