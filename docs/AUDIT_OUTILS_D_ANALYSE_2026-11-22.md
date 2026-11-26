# Audit de la carte « Outils d'analyse » (2026-11-22)

Mode B, effort moyen. Quatre modules : Analyser ma candidature, Un regard sur mon CV, Les mots de votre CV (ATS), Cohérence de mon dossier. Joués avec les protocoles existants (réponses de l'assistant simulées : réponse coupée puis complète, résultat, Retour, Recommencer) et à la main pour les points douteux.

## Résultat
Aucun blocage, aucun écart de reprise, « Continuer » toujours grisé avec une raison lisible, « Recommencer » demande une confirmation et « Annuler » garde le travail.

## Corrigé (mineur, pas dans « Problèmes corrigés »)
- **ATS** : sous « Continuer » grisé, la raison disait toujours « Déposez et relisez votre CV, puis choisissez la référence » même quand le CV était déjà déposé. Elle ne cite plus que ce qui reste (« Il reste à choisir la référence (une offre ou un métier). »).
- **Analyser ma candidature, Cohérence, Découvrir mes compétences** : pour un stage, une alternance ou une immersion, le champ « Métier ou domaine visé » manquait dans la partie candidature (il existait pour « Répondre à une offre »). Il est maintenant proposé quand le métier n'est connu nulle part ailleurs, sans blocage (la candidature reste facultative dans ces modules). Joué dans l'analyse : le métier saisi part bien chez l'assistant.
- **Script de test ATS** (`analyseAts.js`) : sélecteurs périmés réparés (le métier se choisit désormais dans les propositions) ; il passe à 0 écart.

## Non vérifié
Vraies réponses de l'assistant, dépôt par fichier ou photo, 375 px, mode sombre, parcours « Plusieurs métiers d'un même domaine », Corriger du Bilan en détail (déjà audité lors de la consolidation du 30/08).
