# Bilan de clôture — Cohérence documentaire d'ERIP (2026-08-18/19)

Chantier 2 de la feuille de route ERIP. Document de référence pour une future revue documentaire — à lire avant de relancer un audit similaire.

## Périmètre audité

- **Phase A — vocabulaire user-facing** : textes, boutons, messages d'aide, guides et les 11 prompts IA visibles, à travers tous les modules (Lexique, Repères, Regard extérieur, Carnet, Bilan de candidature, Composeur CV, Découverte, éditeurs CV/lettre/entretien, Confidentialité).
- **Phase B — cohérence fonctionnelle** : doublons entre modules, mécanismes de renvoi (ancrage vers Repères), architecture des échanges avec l'IA externe.
- **Phase C — documentation interne** : les 37 fichiers `docs/*.md` (6400+ lignes), chacun vérifié par lecture directe du code réel, pas sur la seule foi de son texte.

## Principaux types d'incohérences corrigées

- **Vocabulaire divergent pour un même concept** : "CIP" vs "conseiller" entre deux modules jumeaux (Regard extérieur/Repères) ; une définition de sigle (ATS) formulée différemment à deux endroits.
- **Statuts figés au premier commit** : au moins 7 documents affirmant encore "aucun code écrit" pour des modules entièrement implémentés depuis (Lexique, Repères, deux documents du Bilan de candidature) — la même classe d'erreur qu'un cas déjà connu avant ce chantier.
- **Document de référence activement périmé** : `CHANTIER_REGARD_EXTERIEUR_IA.md`, pointé par le code lui-même comme source du prompt réel, décrivait une architecture (balises texte) entièrement remplacée par un JSON à 2 passages — le cas le plus critique de l'audit.
- **Erreurs de contrat technique** : nom de champ erroné (`dimensionLiee`/`dimensionsLiees`) dans un schéma de données du Bilan de candidature ; `SCHEMA_CV.md` repris en profondeur (champs fantômes, section entière décrivant un modèle de données remplacé, renvoi vers un document jamais existant).
- **Protocoles de test obsolètes** : deux batteries de test décrivant un comportement retiré du moteur (non-compensation sur les coordonnées absentes).
- **Affirmations structurantes contredites par le code** : "aucune navigation persistante dans ERIP", "aucun point de contact avec `app.js`" — devenues fausses après des évolutions ultérieures non répercutées dans les documents concernés.

## Principes méthodologiques

1. **Impact réel avant tout** : seules les incohérences pouvant réellement induire en erreur un futur développeur, une future session IA, ou perturber la compréhension d'un utilisateur ont été retenues.
2. **Rapport coût/bénéfice explicite** : plusieurs candidats identifiés (numéros de ligne obsolètes, fichiers non référencés, écarts mineurs déjà mitigés ailleurs) ont été sciemment écartés — leur correction coûtait plus qu'elle n'apportait.
3. **Respect des choix d'architecture volontaires** : une différence n'est un défaut que si elle n'est pas justifiée par le contexte. Plusieurs candidats identifiés en cours d'audit se sont révélés être des décisions délibérées et documentées (ex. "Poste visé"/"Métier visé" selon le type de candidature, l'absence volontaire de fusion de `competencesPersonnellesDecouverte`) — non corrigés, activement confirmés comme corrects.
4. **Conservation de l'historique documentaire** : un document devenu obsolète n'est pas réécrit par défaut. Une note claire, datée, pointant vers la référence à jour, est préférée à une réécriture — sauf pour les documents de référence technique dont c'est la fonction même (ex. `SCHEMA_CV.md`), repris en profondeur plutôt que rustinés.
5. **Vérification systématique contre le code réel**, jamais contre le seul texte d'un document, aussi récent ou détaillé paraisse-t-il.

## Conclusion

Le corpus documentaire d'ERIP est désormais aligné avec l'état réel du projet : vocabulaire harmonisé sur les points qui le justifiaient, documents de référence à jour ou clairement annotés quand ils ne le sont plus, contrats techniques exacts. Les différences volontaires entre modules ont été délibérément préservées.

Ce chantier est clos. Les évolutions futures d'ERIP feront naturellement dériver la documentation à nouveau — ce n'est pas une raison de rouvrir cet audit, seulement de refaire cette même démarche si un signe concret de dérive apparaît (comme celui qui a motivé ce chantier).
