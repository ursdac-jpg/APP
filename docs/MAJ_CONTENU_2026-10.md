# Mise à jour du contenu, octobre 2026 : fichier de suivi

Ouvert le 2026-10-05 à la demande de Denis. Seul fichier de passation de ce chantier (l'état des chantiers renvoie ici).

## Ordre voulu par Denis (2026-10-05)
1. « Comprendre le cadre » : FAIT (triage du digest de septembre et changements d'octobre : `d48b5705` ; contrôle mensuel des quatre rayons : `5caa4fe6`). Textes à valider par Denis.
2. « Comprendre les chiffres » : FAIT (2e trimestre, voir plus bas). À relire par Denis.
3. Ensuite : rendre l'outil de veille plus simple (ou passer par Claude), puis les nouveaux modèles de CV.

## Comprendre les chiffres : FAIT le 2026-10-05

Chômage localisé et emploi salarié du 2e trimestre (INSEE du 18 septembre), demandeurs de catégorie A (Dares, corrigés des variations saisonnières), longue durée, offres d'emploi (Data Emploi, lus dans le navigateur le 2026-10-05) et embauches (3e trimestre 2025, dernière période publiée). Séries du chômage 2025 corrigées (elles ne correspondaient pas à l'INSEE).

Restent au 1er trimestre, car sans source plus récente trouvée : demandeurs de catégories A, B et C des deux départements (Dares) et part des inscrits depuis un an et plus pour la France entière. Ne jamais mélanger les chiffres de catégorie A de la Dares (corrigés des variations saisonnières) et ceux de Data Emploi (autre mesure).

## Contrôle mensuel : FAIT le 2026-10-05 (commit 5caa4fe6)

Méthode retenue : pour chaque rayon : lister les points « ce qui change souvent » de chaque fiche, chercher sur les sources officielles ce qui a bougé en 2026, comparer avec le texte, corriger ce qui est faux ou périmé, noter ce qui est confirmé. Registre des décisions : `docs/NOUVEAUTES_A_STATUER.md`.

## Contrôle fiche par fiche : avancement

- **Emploi (13 fiches) : FAIT le 2026-10-05.** 12 fiches confirmées contre leurs sources (une précision sur le CDD), 1 fiche créée et vérifiée le même jour. Il ne reste rien : le contrôle fiche par fiche des quatre rayons mensuels est terminé.
- **Juridique (6 fiches) : FAIT le 2026-10-05.** 5 confirmées, 1 précisée (recours CAF).
- **Budget (9 fiches) : FAIT le 2026-10-05.** 7 confirmées, 2 précisées (expulsion en surendettement, phrase non sourcée retirée du fichage).
- **Étranger (7 fiches) : FAIT le 2026-10-05.** 5 fiches confirmées, 2 corrigées (naturalisation : dispense des réfugiés surévaluée ; contrat d'intégration : examen civique et niveaux de français ajoutés).
- Méthode : relire chaque affirmation, ouvrir la source officielle (jamais un simple résultat de recherche), corriger, puis `verifie_le`. Une source bloquée par un contrôle anti-robot n'est pas contournée : on recoupe sur une autre source officielle et on le dit.
