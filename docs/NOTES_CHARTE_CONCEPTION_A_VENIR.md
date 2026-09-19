# Notes pour la future Charte de conception ERIP

**Statut** : carnet vivant, alimenté au fil des chantiers. N'entrent ici que des règles qui semblent dépasser le seul module en cours de conception, jamais des détails propres à un seul écran. Ce carnet ne devient une Charte que lorsque plusieurs modules auront confirmé qu'une règle se répète réellement, pas sur simple intuition.

---

## Candidates identifiées pendant le chantier Repères

**Réutiliser avant d'inventer.** Avant tout nouveau composant ou mécanisme, vérifier s'il existe déjà un équivalent dans l'application (composants visuels, panneau d'aide, mécanisme de continuité, système de découverte). N'en créer un nouveau que si aucun équivalent ne peut raisonnablement être adapté, et le justifier explicitement.

**Une action secondaire ajoutée à un écran existant reste visuellement secondaire.** Quand une nouvelle fonctionnalité ajoute une action à côté d'une action déjà présente sur un écran, elle prend un style discret, jamais un style de même poids que l'action principale déjà là, pour éviter toute confusion sur ce qui est prioritaire.

**Aucun tiret cadratin dans un texte visible par l'utilisateur.** Déjà une convention réelle et déjà respectée dans le code actuel d'ERIP, vérifiée avant la première maquette de Repères. À maintenir explicitement pour tout futur module.

**Un champ de saisie vide ne doit jamais être visible par défaut si son remplissage est facultatif.** Sa seule présence crée une pression à écrire, quelle que soit la mention « facultatif ». Toujours le proposer par une invitation à activer, jamais par un champ ouvert en permanence.

## Candidate identifiée pendant le chantier Carte de correspondance

**Toute fonctionnalité qui dépend d'un enrichissement futur du contrat de données doit prévoir un état de compatibilité explicite pour les données produites avant cet enrichissement.** Ne jamais se contenter d'un écran vide silencieux quand la structure attendue est absente — une absence de donnée doit toujours être distinguée, à l'écran, d'un bug. Repéré en validant la Carte de correspondance (diagnostics générés avant l'ajout de la structure `attentes` à l'axe adéquation), mais la règle dépasse ce seul cas : elle s'applique à toute évolution de schéma dans une application sans backend, où d'anciennes données restent en usage indéfiniment (ex. une session déjà exportée par une personne, importée plus tard).
