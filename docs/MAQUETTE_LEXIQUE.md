# Maquette « Lexique » — Architecture fonctionnelle, UX et modèle de données

**Statut** : document de conception pragmatique, orienté implémentation. Décline `docs/DOCTRINE_LEXIQUE.md` et `docs/CHANTIER_LEXIQUE.md` — ce document ne réexplique jamais le *pourquoi* déjà posé dans ces deux textes, il ne porte que le *comment concret*. Toute justification manquante ici s'y trouve. **Mise à jour (2026-08-18, audit de cohérence documentaire)** : implémenté depuis (voir `modules/lexique/ARCHITECTURE_TECHNIQUE.md`, référence à jour) — l'écran d'accueil décrit en section 5 ci-dessous, en particulier, a été simplifié par rapport à ce wireframe (voir note à cet endroit).

**Nom** : provisoire, *Lexique*. Question volontairement laissée ouverte — plusieurs candidats sérieux ont été explorés (Interprète, Boussole, Le Manuel, Aperçu, entre autres) sans qu'aucun n'emporte une conviction complète. Le coût de renommer plus tard est faible ; figer aujourd'hui un nom qui ne convainc qu'à moitié serait plus risqué. Le nom définitif pourra s'imposer une fois le module en usage réel, avec un vrai corpus. Ne pas rouvrir cette exploration sans raison neuve — elle est déjà allée au bout de ce qu'une réflexion à froid pouvait donner.

---

## 1. Rôle de chaque univers, en une phrase

- **Accompagnement et insertion** — le vocabulaire du parcours lui-même : diagnostic, projet, positionnement.
- **Emploi et recrutement** — candidature, entretien, ce qu'un recruteur regarde.
- **Ressources humaines** — la vie en poste une fois recruté, hors droit pur.
- **Organisation du travail et management** — hiérarchie, objectifs, entretien annuel.
- **Droit du travail** — ce que dit la loi sur la relation de travail, sans jamais un chiffre.
- **Contrats et statuts d'emploi** — la forme et la nature du lien avec l'employeur.
- **Formation** — VAE, alternance, certifications, bilan de compétences.
- **Bulletin de salaire** — lire sa fiche de paie ligne par ligne.
- **Protection sociale** — ce que couvrent les cotisations, la retraite, la maladie.
- **Santé au travail** — arrêt maladie, RQTH, inaptitude.
- **Structures et organismes** — qui fait quoi (France Travail, Mission Locale, CAF...).
- **Dispositifs** — définition des dispositifs d'insertion, jamais leurs conditions.
- **Mobilité et budget lié à l'emploi** — se déplacer, freins périphériques concrets.
- **Entrepreneuriat et indépendance** — hors salariat classique.
- **Démarches administratives et numériques** — FranceConnect, dématérialisation.

Rappel du chantier (section 5) : cette liste sera revue après le premier corpus, pas avant.

---

## 2. Gabarits par type de fiche

Chaque gabarit est un plan fixe à respecter à la rédaction (méthode de fabrication, chantier section 9).

**Terme**
```
Titre
Définition (2-3 phrases maximum)
Pourquoi ce mot revient (1 phrase, optionnelle)
```

**Notion — explication libre**
```
Titre (formulation naturelle, ex. "Ce qu'est une culture d'entreprise")
Développement (plusieurs paragraphes courts)
```

**Notion — comparatif**
```
Titre ("X ou Y ?")
Ce qui les rapproche (1-2 phrases)
Ce qui les distingue (le cœur de la fiche)
```
Règle de classement : un comparatif touche souvent deux univers (ex. "salarié ou indépendant ?"). Il se classe toujours selon l'univers de la question pratique qu'il résout, jamais selon l'un ou l'autre des deux termes comparés pris isolément.

**Notion — décryptage (offre ou entretien)**
```
Titre (la formulation ou la question telle qu'on l'entend)
Ce que ça signifie réellement (le pourquoi, jamais le comment répondre)
```

**Notion — grille de lecture de document**
```
Titre ("Comment lire son bulletin de salaire")
Les rubriques qu'on y trouve toujours, une à une
(jamais un montant, jamais une case remplie)
```

**Notion — déroulé de démarche**
```
Titre ("Comment se déroule une VAE")
Les étapes génériques, dans l'ordre
(jamais un délai précis)
```

**Notion — rôle (structure ou professionnel)**
```
Titre ("Qu'est-ce que fait un CIP" / "Le rôle de la Mission Locale")
Ce que fait cette structure/ce professionnel, concrètement
```

---

## 3. Modèle de données d'une fiche

| Champ | Type | Règle |
|---|---|---|
| `id` | identifiant stable | jamais réutilisé, même après suppression |
| `titre` | texte | formulation naturelle affichée |
| `titreDeTri` | texte | distinct du titre, sert à l'ordre alphabétique |
| `type` | `terme` \| `notion` | |
| `gabarit` | énumération (section 2) | rempli seulement si `type = notion` |
| `univers` | un seul, parmi la liste fixe | jamais plusieurs |
| `sousTheme` | texte, optionnel | vide par défaut, activé seulement si un univers déborde |
| `registres` | liste, zéro ou plusieurs | tags libres (langage CIP, RH, juridique...) |
| `corps` | texte structuré | forme dépend du gabarit |
| `variantesRecherche` | liste de 2-3 textes | synonymes, sigle, ancien nom, formulation erronée fréquente, une question naturelle |
| `relations` | liste de `{ ficheId, type }` | `type` = `voir-aussi` ou `a-ne-pas-confondre` |
| `dateDerniereRelecture` | date, optionnelle | jamais une obligation |

**Règle de stockage des relations** : une relation n'est enregistrée qu'une seule fois, toujours sur la fiche en train d'être écrite ou éditée, jamais sur les deux à la fois — sinon deux auteurs différents dupliqueraient chacun de leur côté. Au chargement, une passe unique construit un index inverse (quelle fiche est citée par quelle autre) pour que "voir aussi" et "à ne pas confondre" s'affichent automatiquement dans les deux sens, sans jamais dupliquer la donnée ni exiger un aller-retour manuel entre les deux fiches.

**Collections et parcours**, objet séparé, propriétaire de la relation avec les fiches (pas l'inverse — une fiche ne sait pas à quelles collections elle appartient, on le déduit en cherchant les collections qui la citent) :

| Champ | Type | Règle |
|---|---|---|
| `id` | identifiant stable | |
| `titre` | texte | ex. "Comprendre un contrat de travail" |
| `icone` | emoji | |
| `mode` | `collection` \| `parcours` | change seulement l'affichage |
| `accroche` | texte, optionnelle | à la première personne, seulement si `mode = parcours` |
| `fichesOrdonnees` | liste d'ids de fiches | l'ordre ne compte que si `mode = parcours` |

**Règle de suppression** : avant de supprimer une fiche, vérifier qu'aucune collection/parcours ni aucune relation d'une autre fiche ne la cite encore (recherche simple sur son `id`). Pas une contrainte technique bloquante — un rappel du protocole de fabrication (chantier, section 9) à ne pas sauter, pour éviter une référence orpheline silencieuse.

---

## 4. Les quatre portes d'entrée et les fonctions secondaires

**Recherche** (porte principale) — réutilise le patron déjà éprouvé de l'accueil ERIP (frappe en direct, overlay qui ferme au clic extérieur, suivi `recherche_utilisee`/`recherche_sans_resultat`), sur un jeu de données propre au module. Tolère faute légère, synonyme, sigle, question naturelle — toujours via le champ `variantesRecherche`, jamais via une IA (doctrine, principe 2).

**Parcours guidés** et **Collections** — même mécanisme technique (`mode` du même objet), affichage différent : cartes situationnelles pour les parcours, grille par sujet pour les collections. L'accueil n'en montre qu'une poignée (les plus récemment créés, en rotation — pas de hiérarchie éditoriale à maintenir) ; un lien "voir tous les parcours" / "voir toutes les collections" donne accès à la liste complète, nécessaire dès qu'il y en a plus que la place disponible sur l'accueil.

**Mode Livre** — par univers ou ordre alphabétique (sur `titreDeTri`) pour les fiches, mais aussi une liste complète des collections et des parcours. À 40 fiches, quelques cartes sur l'accueil suffisent à tout montrer ; à 500, la plupart des collections deviendraient invisibles sans cet accès complet. Discret, pensé pour CIP et formateurs.

**Favoris** (V1) — bouton dédié sur chaque fiche, séparé de l'ancrage vers Repères (doctrine, principe 9). **Historique** (V2, pas construit au lancement).

---

## 5. Écrans

### Accueil du module

> **Note (2026-08-18, audit de cohérence documentaire)** : l'écran réellement implémenté est plus minimal que ce wireframe — titre, champ de recherche, et 3 boutons texte (« Voir les collections et parcours », « Mode Livre », « Mes favoris »), sans cartes de parcours situationnelles, grille de collections, favoris ou « fiche du jour » affichés directement (voir `_lexiqueRenduEcran()`, `modules/lexique/index.js`). Pas de trace d'une décision explicite de simplifier — à vérifier avant de s'appuyer sur ce wireframe pour une évolution de cet écran.

```
┌─────────────────────────────────────────┐
│  📖 [Lexique]                            │
│  [ Rechercher un mot, une question... ]  │
├─────────────────────────────────────────┤
│  Je veux comprendre...                   │
│  🧭 Je prépare un entretien              │
│  🧭 Je commence un travail               │
│  🧭 Je viens de signer un contrat        │
│  🧭 Je reçois ma fiche de paie           │
│  Voir tous les parcours →                │
├─────────────────────────────────────────┤
│  Explorer par sujet                      │
│  📚 Comprendre un contrat de travail     │
│  📚 Les dispositifs d'insertion          │
│  📚 Comprendre France Travail            │
│  Voir toutes les collections →           │
├─────────────────────────────────────────┤
│  ⭐ Mes favoris                          │
├─────────────────────────────────────────┤
│  💡 Le saviez-vous ? [fiche du jour]     │
├─────────────────────────────────────────┤
│  Parcourir tout →  (mode Livre, discret) │
└─────────────────────────────────────────┘
```

### Résultats de recherche (superposés, comme le patron déjà existant)

```
┌─────────────────────────────────────────┐
│  [ pmsmp                              ]  │
├─────────────────────────────────────────┤
│  PMSMP                                   │
│  Une immersion en entreprise sans...     │
│  DISPOSITIFS                             │
└─────────────────────────────────────────┘
```

Zéro résultat → message existant + tracking `recherche_sans_resultat`, sans rien construire de plus.

### Fiche

```
┌─────────────────────────────────────────┐
│  ← Retour                                │
│  DROIT DU TRAVAIL · langage juridique    │
│                                           │
│  Rupture conventionnelle                 │
│                                           │
│  [corps de la fiche]                     │
│                                           │
│  ⚠️ À ne pas confondre avec              │
│     → Licenciement  → Démission          │
│                                           │
│  Voir aussi                              │
│     → Préavis  → Solde de tout compte    │
│                                           │
│  Vous retrouverez cette fiche dans       │
│     📚 Les droits du salarié             │
│     🧭 Je viens de signer un contrat     │
│                                           │
│  [⭐ Favoris]   [📌 Garder comme Repère] │
└─────────────────────────────────────────┘
```

### Collection / parcours

```
┌─────────────────────────────────────────┐
│  🧭 Je prépare un entretien d'embauche   │
│  Comprendre ce qui se joue, pas préparer │
│  des réponses toutes faites.             │
│                                           │
│  1. Comment un recruteur lit un CV       │
│  2. Pourquoi "parlez-moi de vous"        │
│  3. Ce que veut dire "force de           │
│     proposition"                         │
│  4. Comment se déroule un entretien      │
└─────────────────────────────────────────┘
```

### Mode Livre

```
┌─────────────────────────────────────────┐
│  [Fiches]   [Collections et parcours]    │
├─────────────────────────────────────────┤
│  [Par univers]   [Par ordre alphabétique]│
├─────────────────────────────────────────┤
│  DROIT DU TRAVAIL                        │
│  Cette liste s'enrichit progressivement, │
│  à mesure des besoins réels observés.    │
│  · Abandon de poste                      │
│  · Convention collective                 │
│  · ...                                   │
└─────────────────────────────────────────┘
```

---

## 6. Cycle de fabrication, stratégie de lancement, critères de réussite

Ces trois points ne sont pas redéfinis ici : ils vivent dans `docs/CHANTIER_LEXIQUE.md`, sections 9 (méthode de fabrication), 10 (MVP à 30-40 fiches) et 13 (critères de réussite), inchangés par ce document.

---

## 7. Ce qui reste à trancher avant le code

- Le nom définitif — délibérément laissé ouvert, ne bloque pas le chantier (voir en tête de document).
- Où vivent `dossier.lexiqueFavoris` et le futur corpus de fiches (fichier de données statique, sur le modèle de `data/metiers.js`, à documenter dans un `ARCHITECTURE_TECHNIQUE.md` une fois ce document validé).
- Le nom exact des fonctions et fichiers du module — hors périmètre de ce document, comme pour tous les modules précédents.
