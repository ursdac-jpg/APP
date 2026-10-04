# Enrichir les suggestions de « La mise en page » (ouvert 2026-09-30, Mode A)

> **EN RÉSERVE depuis le 2026-09-30, décision de Denis.** Raison : chantier lourd, risque de régression sur un CV aujourd'hui très stable, bénéfice faible (les missions et les compétences se règlent déjà à la main) et le concept de la mise en page doit encore évoluer. Aucun code n'a été écrit pour ce chantier. À rouvrir seulement sur demande explicite de Denis, après l'évolution du concept. Les trois pistes (gagner de la place sans changer de mode, loger plus d'informations, agencements propres à chaque mode) et leur audit restent valables ci-dessous. Seule modification de code faite : le retrait de la suggestion « Passer en présentation chronologique » (commit `de82d7ac`, correction C4).

Origine : retour de Denis du 2026-09-30. Les suggestions doivent rester cohérentes avec les choix déjà faits (mode de présentation, expériences affichées) et pouvoir proposer davantage d'agencements, y compris pour loger plus d'informations quand la personne le souhaite. Denis a validé le principe des trois pistes ci-dessous et veut les construire.

## 0. Règle n°1 : ZÉRO RÉGRESSION (demande de Denis, 2026-09-30)

Tout ce qui touche au CV est aujourd'hui très stable et Denis veut le préserver. Cette règle passe avant tout le reste de ce chantier. Garde-fous retenus :

1. **Ajout seulement.** Le code des suggestions actuelles n'est ni réécrit ni réordonné. Les nouvelles suggestions vivent dans une fonction à part, appelée après les anciennes.
2. **Jamais appliquée d'office.** Une suggestion reste une proposition : rien ne change tant que la personne n'a pas cliqué sur « Appliquer ». Aucun réglage existant n'est modifié en silence.
3. **Aucune suggestion existante ne disparaît ni ne perd sa place.** La liste est limitée à 9 : si les nouvelles suggestions entrent dans ces 9 places, elles pourraient **faire sortir** des anciennes (régression par déplacement). Les nouvelles suggestions ne passent donc jamais devant les anciennes, ou la limite est relevée (décision D4).
4. **L'essai ne laisse aucune trace.** Le moteur applique une suggestion, mesure, puis annule. Chaque réglage que touche une nouvelle suggestion (nombre de missions, compétences affichées, missions des formations) doit être ajouté à la sauvegarde et à la restauration de cet essai (`_pdfAppliquerChangementsSuggestion` / `_pdfRestaurerChangementsSuggestion`). Un oubli laisserait un réglage modifié après le simple calcul des suggestions : c'est le risque technique principal. Test obligatoire : l'état complet des réglages est identique avant et après le calcul des suggestions.
5. **Rendu identique prouvé.** Banc de comparaison 24/24 identique avant et après, `npm test` entièrement vert, test navigateur clair et sombre dans les trois modes (Chronologique, Mixte, Par compétences), formats A4 et A5, puis export PDF et Word réels.
6. **Réglages de choix jamais touchés** : le mode de présentation et le choix « toutes les expériences / les plus pertinentes » ne sont jamais modifiés par une suggestion.
7. **Point à signaler honnêtement** : le retrait de « Passer en présentation chronologique » (commit `de82d7ac`, demandé par Denis) est la seule suggestion supprimée. Il n'y en aura pas d'autre sans décision écrite.

## 1. Ce que fait le moteur aujourd'hui (audit du code réel, `modules/cv-pdf-html/cvPdfPanneauReglages.js`)

- Le moteur fabrique une liste de **candidats** (`_pdfCandidatsSuggestions`, ~ligne 3566), puis **essaie chacun** (il l'applique, mesure la hauteur de la page, l'annule : `_pdfCalculerSuggestions`, ~ligne 3785). Il ne garde que ceux qui gagnent au moins 2 lignes (1 ligne pour les listes courtes), classés par gain, **9 au plus**.
- Deux sens, choisis automatiquement : **« gagner »** (la page dépasse) et **« remplir »** (la page est occupée à moins de 82 %).
- Aujourd'hui **toutes les suggestions ne touchent que la disposition** (colonnes, pastilles ou texte, blocs côte à côte, place des compétences, formations sur une ou deux lignes) et chacune affiche « Le contenu ne change pas ». Il y a en plus des suggestions d'**équilibre** entre compétences professionnelles et comportementales.
- Aucune suggestion ne dépend du mode de présentation (la seule qui en dépendait a été retirée le 2026-09-30, commit `de82d7ac`).

## 2. Leviers déjà présents dans le code, réutilisables sans rien inventer

| Levier | Variable | Ce qu'il permet de proposer |
|---|---|---|
| Nombre de missions par expérience | `_cvPdfMissionsGlobal`, `_cvPdfMissionsParExperience`, `_cvPdfMissionsChoisies` | « Une mission de moins / de plus par expérience » |
| Missions des formations | `_cvPdfAfficherMissionsFormation` | « Montrer / cacher les missions de vos formations » |
| Compétences affichées | `_cvPdfCompetencesProMax`, `_cvPdfCompetencesComportementalesMax` | « Montrer N compétences de plus » (existe déjà pour l'équilibre) |
| Expériences personnelles et engagements | mêmes variables, par élément | mêmes propositions |
| Rubriques masquées | « Rubriques à afficher ou masquer » (à vérifier) | « Ajouter la rubrique Savoirs (2 éléments) » quand elle a du contenu et de la place |

## 3. Les trois pistes

1. **Gagner de la place sans changer de mode** : moins de missions par expérience, missions de formations masquées, moins de compétences affichées. Rien n'est supprimé : tout reste dans le dossier.
2. **Loger plus d'informations quand la page a de la place** (sens « remplir ») : une mission de plus, les missions des formations, plus de compétences, une rubrique masquée qui a du contenu. Le moteur essaie et mesure : jamais une suggestion qui fait déborder la page.
3. **Agencements propres à chaque mode** : aucun levier de ce type n'est visible dans le panneau ; les modes Mixte et Par compétences sont gérés par le moteur de composition (`composeurComposition.js`). **Non audité à ce stade.**

## 4. Carte de faisabilité (étape 2 de la méthode)

- **Simple** (reprise de l'existant) : les pistes 1 et 2. Même mécanisme essai / mesure / annulation, leviers déjà câblés.
- **Risqué** : (a) les suggestions ajoutent ou retirent du **contenu affiché**, ce que la phrase « Le contenu ne change pas » interdit aujourd'hui ; (b) chaque suggestion doit rester valable dans les trois modes et pour A4 comme pour A5 ; (c) la piste 3 suppose de comprendre le moteur de composition.
- **Bloquant / imprévu** : aucun sur les pistes 1 et 2. Une contrainte à respecter : ne jamais toucher au choix « toutes les expériences / les plus pertinentes » (règle de Denis du 2026-09-30) ; comme rien ne distingue un choix explicite de la valeur par défaut, aucune suggestion ne modifie ce réglage.
- **Verdict préliminaire** : pistes 1 et 2 : **GO**. Piste 3 : **GO AVEC RÉSERVES** (audit du moteur de composition à faire avant toute maquette).

## 5. Décisions à prendre par Denis avant la maquette

- [ ] D1. Périmètre du premier lot (pistes 1 et 2 d'abord, piste 3 après son audit ?).
- [ ] D2. Accepter des suggestions qui **changent le contenu affiché** (nombre de missions, compétences, rubrique ajoutée), avec un repère visible « Ajoute du contenu » / « Retire du contenu affiché » et la mention « rien n'est supprimé de votre dossier » ?
- [ ] D3. Confirmer que le choix « toutes / les plus pertinentes » n'est jamais modifié par une suggestion.
- [ ] D4. Nombre maximum de suggestions affichées (9 aujourd'hui) : garder 9, ou regrouper par famille (Disposition / Contenu) ?

## 6. Plan par phases (à valider après les décisions ci-dessus)

- [ ] Phase 0. Audit du moteur de composition pour la piste 3 + vérification des rubriques masquées (lecture seule).
- [ ] Phase 1. Maquette cliquable du panneau de suggestions enrichi, pour les trois modes (étape 3 de la méthode).
- [ ] Phase 2. Audit complet et verdict final avant code (étape 4), inventaire GARDÉ / ENRICHI de toutes les suggestions actuelles.
- [ ] Phase 3. Code : suggestions « gagner » avec missions et compétences (piste 1).
- [ ] Phase 4. Code : suggestions « remplir » avec contenu (piste 2).
- [ ] Phase 5. Piste 3 selon l'audit.
- [ ] Phase 6. Tests : `npm test`, navigateur clair et sombre, modes A, B, C, formats A4 et A5, Word et PDF.

## 7. Verdict Mode Nuit

**NON APTE AU MODE NUIT** : les décisions D1 à D4 sont ouvertes, la piste 3 n'est pas auditée, aucune maquette n'existe.
