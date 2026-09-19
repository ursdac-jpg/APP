# Contrats du module — Cohérence transversale CV / lettre / entretien

> Dernière étape avant le code, sur le même principe que `modules/bilan-candidature/CONTRATS.md` : objets, interfaces, invariants, avant toute implémentation. Module volontairement **séparé** du Bilan (voir `docs/CHANTIER_COHERENCE_TRANSVERSALE_SYNTHESE.md`, section "Revirement d'architecture 2026-08-25") — prompt dédié, architecture propre, aucune dépendance vers `modules/bilan-candidature/` (objectif de portabilité : ce module doit pouvoir être extrait vers un autre site un jour).

## 0. Ce que ce module analyse

Une **candidature** (au sens large : CV + lettre + offre + entretien + entreprise, facettes d'un même objet — voir la synthèse) plutôt qu'un CV isolé. Objectif : détecter les incohérences, absences et forces à travers l'ensemble des documents fournis, et permettre à la personne d'appliquer les corrections utiles à chacun.

## 1. Objets du domaine

### DossierTransversal

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | généré à la création |
| `cv` | string | oui | texte, jamais vide |
| `lettre` | string | oui | texte, jamais vide — **seul document réellement obligatoire avec le CV** (voir invariant 1) |
| `offreEmploi` | string \| null | non | lien ou texte, les deux acceptés (même principe que le Bilan) |
| `entrepriseCiblee` | string \| null | non | |
| `siteEntreprise` | string \| null | non | |
| `preparationEntretien` | string \| null | non | texte recomposé (présentation, points à préparer, questions/pistes) |
| `questionsPersonne` | string \| null | non | 🗨️ **Amendement, ajout additif (2026-08-25, décision de Denis).** Questions concrètes de la personne sur sa candidature ("est-ce que j'ai assez insisté sur..."), texte libre. Si absent, l'analyse se déroule exactement comme sans cet ajout. Si présent, chaque question reçoit une réponse explicite (constat + recommandation), voir `prompts/coherence-transversale.md`. |
| `dateCreation` | string (ISO 8601) | oui | |
| `hashContenu` | string | oui | recalculé à chaque modification d'un des champs ci-dessus |
| `confidentialiteValidee` | boolean | oui | `false` à la création, passe à `true` uniquement après relecture explicite (mêmes garanties que le Bilan, implémentation locale à ce module — voir composant partagé `htmlVerificationDocument()`, `data/metiers.js`) |

**Validation :** `cv` et `lettre` non vides sont les deux seules conditions de validité (invariant 1). Tout le reste peut être absent.

### Constat

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | généré de façon déterministe par le parseur (jamais fourni par l'IA), même principe que `Observation` argumentée du Bilan |
| `ancrage` | string[] | oui | pointeurs vers les documents concernés (ex. `cv.experience[0]`, `lettre.paragraphe[2]`, `offre.prerequis[1]`) — adressage normalisé, jamais une position dans le texte brut |
| `nature` | `'incoherence'` \| `'absence'` \| `'duplication'` \| `'contradiction'` \| `'alignement'` \| `'force'` | oui | `force` obligatoire au même titre que les autres — un Constat n'est pas réservé aux problèmes (décision explicite, voir synthèse) |
| `dimension` | string | oui | la qualité/compétence concernée (ex. `autonomie`, `rigueur`) — texte libre en V1, pas un catalogue fermé |
| `preuve` | string[] | oui | extrait(s) de texte exact(s) qui fondent le constat |
| `message` | string | oui | formulation lisible pour la personne |
| `confiance` | `'certaine'` \| `'deduite'` \| null | non | ajouté seulement quand un écran en a réellement besoin (garde-fou, voir invariant 4) |

**Validation :** `ancrage` et `preuve` non vides (jamais un Constat sans trace vérifiable). Un Constat, une fois créé, n'est jamais modifié (invariant 2, même principe que `Observation` du Bilan).

**Relation avec les Repères** : un Constat reflète l'état courant du dossier — une fois le point corrigé, il disparaît ou se met à jour, il ne reste jamais comme un historique figé (contrairement à un Repère, que la personne choisit volontairement de garder comme souvenir permanent, voir `modules/reperes/`).

### Recommandation

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | |
| `constatsLies` | string[] | oui | au moins un id de `Constat` |
| `contenu` | string | oui | le conseil, lisible |
| `documentCible` | `'cv'` \| `'lettre'` \| `'entretien'` \| `'plusieurs'` | oui | où appliquer la correction — capacité que `destinationRegistry.js` du Bilan n'a pas aujourd'hui (limité au CV) |
| `modeApplication` | `'remplacement'` \| `'ajout'` \| `'conseil'` | oui | `conseil` = non applicable directement dans un texte (ex. conseil pour l'entretien), affiché comme point à retenir |
| `texteAncre` | string \| null | non | passage exact à remplacer, si `modeApplication = 'remplacement'` |
| `textePropose` | string \| null | non | |

**Validation :** `documentCible = 'plusieurs'` autorisé uniquement si `constatsLies` couvre effectivement plus d'un document (cohérent avec l'idée du 2e avis externe : une suggestion peut toucher CV + lettre + entretien à la fois).

### Diagnostic

Même anatomie que `Diagnostic`/`DiagnosticResultat` du Bilan (id, dossierTransversalId, promptTexte, statut, resultat, dateGeneration, texteBrutReponseIA) — non détaillé ici, contrat identique par souci de cohérence de style, pas par dépendance de code.

## 2. Interfaces publiques

| Composant | Reçoit | Retourne | Garantit |
|---|---|---|---|
| `collecte/hostDataAdapter` | rien (lecture directe, app hôte) | `DonneesBrutesTransversal` (champs à `null` si absents) | ne modifie jamais les données de l'app hôte ; **fonctions propres à ce module**, jamais un import de `modules/bilan-candidature/collecte/hostDataAdapter.js` |
| `collecte/dossierTransversalCollector` | `DonneesBrutesTransversal` + saisie libre | `DossierTransversal` (`confidentialiteValidee: false`) | `cv`/`lettre` toujours renseignés ou erreur métier |
| `collecte/relectureConfidentialite` | `{ contenu }` (par document) | `Promise<{ contenuValide }>` | ne se résout jamais sans action explicite ; réutilise `htmlVerificationDocument()`/`ouvrirFenetreERIP()` déjà existants, jamais une nouvelle primitive d'affichage |
| `analyse/verificationsDeterministes` | `DossierTransversal` (validé) | `Constat[]` (sous-ensemble déterministe : duplication exacte CV/lettre, dates incohérentes, coordonnées manquantes) | aucun jugement de valeur, aucun appel IA — l'application tranche seule ce qu'elle peut trancher |
| `diagnostic/promptBuilder` | `DossierTransversal` (validé) + `Constat[]` déterministes | `{ texte, dateGeneration, hashContexteUtilise }` | prompt dédié (`prompts/coherence-transversale.md`), jamais fusionné à `bilan-v1.md` (voir leçon "un prompt par module") |
| `diagnostic/responseParser` | texte brut collé | `{ constats: Constat[], recommandations: Recommandation[] }` ou échec de parsing explicite | génère les ids manquants ; ne lève jamais d'exception non gérée |

## 3. Invariants

1. `DossierTransversal` valide ⇔ `cv` ET `lettre` non vides. L'offre, l'entreprise/site, l'entretien restent optionnels — jamais des conditions d'accès (décision explicite, mode "candidature spontanée").
2. Un `Constat`, une fois créé, n'est jamais modifié — seulement lu et référencé.
3. Un `Constat` a toujours `nature = 'force'` disponible comme option réelle, jamais un type réservé aux seuls problèmes.
4. Aucune propriété supplémentaire n'est ajoutée à `Constat` sans un besoin fonctionnel réel déjà présent dans une fonctionnalité existante — garde-fou explicite contre la reconstruction involontaire de l'architecture V4 (gelée, voir `docs/ARCHITECTURE_COMPREHENSION_CV.md`).
5. Une `Recommandation` référence toujours au moins un `Constat` — jamais orpheline.
6. Aucun texte ne part vers une IA externe sans relecture et validation explicite de la personne, document par document (même contrainte non négociable que le Bilan).
7. Jamais de score chiffré, à aucun niveau de restitution (cohérent avec toute l'application).

## 4. Erreurs métier

| Erreur | Déclenchée par | Condition |
|---|---|---|
| `DossierTransversalInvalide` | `dossierTransversalCollector` | `cv` ou `lettre` absent/vide |
| `RelectureNonValidee` | `diagnostic/promptBuilder` | appel avec `confidentialiteValidee !== true` |
| `RelectureAnnulee` | `relectureConfidentialite` | l'utilisateur annule l'écran de relecture |
| `ReponseIllisible` | `responseParser` | aucun bloc JSON identifiable |
| `ReponseIncomplete` | `responseParser` | JSON valide mais champ obligatoire manquant |

## 5. Ordre de construction

`modeles/` → `collecte/` → `analyse/` (vérifications déterministes) → `diagnostic/` (prompt + parseur) → `prompts/coherence-transversale.md` (rédaction) → écran/rapport (UI, avec vérification navigateur systématique). Chaque composant testé individuellement avant intégration.
