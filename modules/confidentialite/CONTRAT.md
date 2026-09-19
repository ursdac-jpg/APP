> **Statut : différé (V2).** Décision du 2026-08-08 : pour la V1, la logique de confidentialité du module Bilan de candidature est implémentée localement (`modules/bilan-candidature/collecte/`), sans dépendance à ce service transversal — objectif : livrer une V1 avec un minimum d'impact sur l'existant, sans ouvrir de chantier de refactorisation. Ce document reste la référence si/quand l'extraction devient pertinente, une fois un retour d'expérience réel disponible sur plusieurs parcours. Ne pas construire tant que ce statut n'a pas changé.

# Contrat — ServiceConfidentialite

> Service partagé, transversal à toute l'application (pas propre au module Bilan de candidature). Formalise ici pour la première fois un patron déjà existant dans l'application (vidéos pédagogiques, rappel textuel « aucune anonymisation automatique »), qu'il centralise plutôt que dupliquer. Aucune logique d'anonymisation automatique n'est développée : ce service organise la relecture humaine, il ne remplace jamais le jugement de l'utilisateur.

## Principe fondamental

Le service ne masque jamais rien automatiquement. Son rôle est de garantir qu'**aucun contenu ne quitte l'application vers une IA externe sans qu'un humain l'ait explicitement relu et validé** — la responsabilité de la décision finale reste entièrement celle de l'utilisateur, conformément à la philosophie déjà en place.

## Ce qui est réutilisé tel quel

- Les vidéos pédagogiques existantes (`masquage-texte`, `masquage-image` dans `DEMOS_VIDEO_ERIP`, `js/app.js`) et leur déclencheur `htmlDeclencheurDemoVideo()` — non dupliquées, référencées.
- La formulation déjà validée du rappel de transparence (celle du message existant : *« aucune anonymisation automatique n'est effectuée... »*).

## Ce qui est réellement nouveau

Aucun écran de relecture n'existe aujourd'hui dans l'application (vérifié : `ouvrirFenetreAssistantIA()` copie directement sans jamais afficher le texte). Ce service construit ce premier écran de relecture — texte pour la V1, avec le contrat de l'écran image/PDF défini mais son implémentation différée (voir périmètre).

## Périmètre retenu pour cette V1

Le CV analysé par Bilan de candidature provient des données déjà structurées de l'application (via `hostDataAdapter`), jamais d'un import direct de PDF/image pour ce module précis. **Le cas texte est donc seul implémenté maintenant** ; le cas image/PDF est spécifié ci-dessous (interface, invariant) mais son écran de dessin de rectangle n'est pas construit tant qu'aucun parcours n'en a l'usage réel — à confirmer avant de le coder pour de bon, plutôt que d'anticiper un besoin non exprimé.

---

## Arborescence

```
modules/
  confidentialite/
    CONTRAT.md
    index.js               → façade publique (ServiceConfidentialite)
    demandeRelecture.js     → orchestration commune aux deux cas (texte / image)
    relectureTexte.js       → écran de relecture texte (V1, implémenté)
    relectureImage.js       → contrat de l'écran image/PDF (interface définie, non implémenté)
    demosReferences.js      → seul point de couplage avec js/app.js (DEMOS_VIDEO_ERIP, htmlDeclencheurDemoVideo)
    messages.js             → texte du rappel de transparence, une seule fois
```

## Objet du domaine — DemandeRelecture

| Propriété | Type | Obligatoire | Détail |
|---|---|---|---|
| `id` | string | oui | |
| `type` | `'texte'` \| `'image'` | oui | |
| `contenuOriginal` | string | oui | jamais transmis à une IA tel quel |
| `contenuValide` | string \| null | non | rempli uniquement après validation explicite |
| `statut` | `'en_attente'` \| `'validee'` \| `'annulee'` | oui | |
| `dateCreation` | string (ISO) | oui | |
| `dateValidation` | string (ISO) \| null | non | |

## Interface publique

| Composant | Reçoit | Retourne | Garantit |
|---|---|---|---|
| `index.js` (`ServiceConfidentialite.demanderRelecture`) | `{ type, contenu }` | `Promise<{ contenuValide }>` | ne se résout **jamais** sans action explicite de l'utilisateur (validation ou annulation) ; le contenu original n'est communiqué à aucun autre composant tant que la promesse n'est pas résolue |
| `relectureTexte.js` | contenu texte | contenu validé (potentiellement modifié par l'utilisateur) | affiche systématiquement le rappel de transparence et le lien vers la vidéo `masquage-texte` |
| `relectureImage.js` *(interface seule)* | contenu image/PDF | contenu validé | mêmes garanties que `relectureTexte.js` une fois implémenté |

## Invariant

**Aucun appelant ne peut construire ou copier un texte destiné à une IA externe avant la résolution de `demanderRelecture()`.** Ce n'est pas seulement une convention d'enchaînement des écrans : chaque module consommateur doit vérifier explicitement un indicateur de validation avant toute construction de prompt (voir l'amendement apporté au contrat de Bilan de candidature).

## Erreur métier

| Erreur | Condition | Comportement attendu de l'appelant |
|---|---|---|
| `RelectureAnnulee` | l'utilisateur annule l'écran de relecture | interrompre tout le flux en cours, ne construire aucun prompt |
