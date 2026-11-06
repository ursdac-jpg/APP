# Audit du code : « Vos appuis » et la version 2 de Reformuler (28/10/2026)

Audit fait avant toute maquette, comme l'impose le protocole. Aucun code modifié. Décision de départ : `CHANTIER_VOS_DOCUMENTS_COHERENCE_2026-10-26.md`, section « Décision de Denis du 2026-10-27 ».

## 1. Où « Vos appuis » apparaît aujourd'hui (une seule fonction : `_coLettreHtmlAppuis`, `data/metiers.js` ligne 5498)

| # | Endroit | Fichier, ligne | Moment par rapport à l'assistant |
|---|---|---|---|
| 1 | « Votre objectif » du CV créé **avec l'assistant** (et reprise) | `js/app.js` 6023 | avant tout passage |
| 2 | « Votre objectif » de Reformuler et de « Mettre à jour » (voie 1) | `data/metiers.js` 8590 | **avant le premier passage** |
| 3 | « Vos documents », rectangle « Choisissez votre assistant » (CV) | `js/app.js` 13287 | avant le **second** passage (rédaction, `cv.md`) |
| 4 | « Un CV, plusieurs métiers », page 3 | `modules/un-cv-plusieurs-metiers/page3Reference.js` 221 | avant le passage de la page (masqué une fois la réponse importée) |
| 5 | Lettre, « Préparer » | `data/metiers.js` 5296 | avant l'unique passage |
| 6 | Entretien, « Préparer » et synthèse | `data/metiers.js` 11092 et 10154 | avant l'unique passage |

**Ce que ça produit** : pour un même CV de « Mettre à jour » ou de Reformuler, le panneau est proposé au point 2 (avant le premier passage) **puis encore** au point 3 (avant le second) : c'est le constat C23 (appuis redemandés à chaque passage). Pour le CV créé avec l'assistant, points 1 et 3 se répètent.

## 2. Ce que les prompts lisent
- `sectionRecommandationPourMessage()` (`js/app.js` 13272) ajoute la section « LETTRE DE RECOMMANDATION » à trois messages : le premier passage de Reformuler (`_reformulerCvContexteTexte`, `data/metiers.js` 6776, « lue par l'assistant pour la version 2 seulement », `prompts/reformuler-cv.md`), le CV de « Vos documents » (`js/app.js` 13256, `prompts/cv.md` ligne 83), l'entretien (`data/metiers.js` 10891), plus la page 6 de UCPM.
- **Seule la lettre de recommandation existe comme appui.** Une lettre de motivation déposée, le document « Mes compétences » et un « texte libre » n'existent pas encore comme appuis (la maquette du 27/10 les prévoit).
- Les lettres déposées vivent dans des variables du module (`_coLettreRecos`), **pas dans le dossier** : elles ne sont pas gardées avec la session (le panneau le dit déjà) et sont remises à zéro par la réinitialisation (`js/app.js` 41291).

## 3. Reformuler : où est le « second passage »
- Premier passage (`prompts/reformuler-cv.md`) : l'assistant rend **deux versions d'un coup** (« La plus proche de votre CV », « Notre version recommandée »). La personne choisit (`data/metiers.js` 7476).
- **Version 1** : donnée telle quelle, sans second passage (fait le 27/10, `reformulerSansSecondePasse()`). Elle n'a aucun usage d'un appui.
- **Version 2** : passe encore par « Vos documents » et le second passage (`prompts/cv.md`, `secondPasseIARequise`, `js/app.js` 24813). C'est là que l'invitation « Un CV plus développé ? » de la maquette 4 doit s'insérer.

## 4. Ce qui est simple, risqué, bloquant
- **Simple** : retirer le panneau des points 1 et 2 (il n'a pas d'usage avant le second passage), le garder au point 3 ; le composant, son câblage et sa protection des noms existent et sont partagés. Résout C23 sans écrire de nouveau panneau.
- **Moyen** : retirer la lettre de recommandation du premier passage de Reformuler (`_reformulerCvContexteTexte` et `prompts/reformuler-cv.md`) change un prompt déjà testé : à rejouer sur un vrai assistant.
- **Risqué** : ajouter de **nouveaux types d'appuis** (lettre de motivation, « Mes compétences », texte libre) touche le prompt `cv.md` (un paragraphe par type, à tester au banc d'essai avant ouverture, condition posée le 27/10) et le dossier (aujourd'hui les appuis n'y sont pas).
- **Bloquant** : aucun. **À trancher par Denis** : voir les questions du message de séance.
