# SCHEMA_CV.md — Objet CV standardisé (ERIP)

Ce document décrit la structure renvoyée par `normaliserDonneesCV(dossier)`
(`modules/cv-core/normaliserDonneesCV.js`). Cette structure est le **contrat**
partagé par tous les modules liés au CV : éditeur, templates, export PDF,
export DOCX. Toute évolution de cette structure doit être répercutée dans ce
document.

`dossier` (état global de l'application, `js/app.js`) reste l'unique source
de vérité. `normaliserDonneesCV()` ne fait que le lire (via
`extraireDonneesCV()`) pour en dériver cette structure : elle ne modifie
jamais `dossier`.

**Important** : cette structure ne contient aucune logique de présentation
(pas de mise en majuscules, pas de troncature, pas de texte concaténé pour
l'affichage...). La mise en forme est entièrement du ressort des templates.

**Cette structure n'est pas l'objet final du rendu** : le Composeur (seul
moteur de rendu CV actif aujourd'hui) applique une seconde étape après
`normaliserDonneesCV()` — voir la section « Seconde étape » en fin de
document.

---

## `meta`

Informations techniques sur l'objet CV lui-même (pas sur le candidat).

| Propriété | Type | Rôle |
|---|---|---|
| `version` | `number` | Version du schéma. Permet de gérer une migration si la structure évolue un jour. |
| `dateGeneration` | `string` (ISO 8601) | Date/heure de génération de cet objet CV. |
| `modele` | `string \| null` | Identifiant du modèle graphique choisi. En pratique toujours `null` aujourd'hui : `normaliserDonneesCV()` ne l'affecte jamais autrement, et rien en aval ne l'écrit — un seul modèle (`"composeur"`) existe, sélectionné ailleurs (`modules/cv-editor/modelesDisponibles.js`), sans passer par ce champ. |

```json
"meta": { "version": 1, "dateGeneration": "2026-07-07T18:49:56.078Z", "modele": null }
```

---

## `identite`

Coordonnées du candidat, telles que saisies dans "Mon projet" / page Action
(`dossier.identite`).

| Propriété | Type | Rôle |
|---|---|---|
| `civilite` | `"Madame" \| "Monsieur" \| null` | Civilité, jamais devinée. |
| `nom` | `string` | Nom de famille. |
| `prenom` | `string` | Prénom. |
| `telephone` | `string` | Numéro de téléphone. |
| `email` | `string` | Adresse e-mail. |
| `adresse` | `string` | Adresse postale. |
| `codePostal` | `string` | Code postal. |
| `ville` | `string` | Ville. |

```json
"identite": { "civilite": "Madame", "nom": "Dupont", "prenom": "Julie", "telephone": "0600000000", "email": "julie@test.fr", "adresse": "1 rue Test", "codePostal": "33000", "ville": "Bordeaux" }
```

---

## `photo`

Photo de CV, entièrement optionnelle et jamais incluse automatiquement.
`dossier.photo` porte deux informations distinctes : la photo téléversée
elle-même (`url`) et une case à cocher séparée et explicite, `inclure` —
avoir téléversé une photo ne suffit jamais à la faire apparaître sur le CV,
la personne doit explicitement demander à l'inclure (choix motivé par la
sensibilité d'une partie du public aux CV avec photo).

| Propriété | Type | Rôle |
|---|---|---|
| `url` | `string \| null` | URL/donnée de la photo, uniquement si `dossier.photo.inclure` est vrai **et** qu'une photo a été téléversée. `null` dans tous les autres cas (pas de photo, ou photo téléversée mais non incluse). |

Affichage conditionnel géré par le moteur de rendu générique (bloc
`{{#if photo.url}}...{{/if}}`) : si `url` est vide ou `null`, aucun élément
ni espace n'est présent dans le rendu — pas de logique spécifique à la photo
ni à un modèle en particulier.

```json
"photo": { "url": null }
```

---

## `objectifProfessionnel`

| Type | Rôle |
|---|---|
| `string` | Titre du CV : `dossier.titreCV` (choisi/verrouillé via l'écran "Choisissez ce que l'IA propose", voir `dossier.titreCVVerrouille`) en priorité, sinon repli sur `dossier.metierCible`/`dossier.secteurCible` (page Potentiel) si aucun titre explicite n'a encore été choisi. Chaîne vide si aucun choix n'a encore été fait. |

```json
"objectifProfessionnel": "Assistant administratif"
```

---

## `profil`

Accroche professionnelle (paragraphe d'introduction du CV). Deux champs
distincts, pour ne jamais perdre l'un au profit de l'autre.

| Propriété | Type | Rôle |
|---|---|---|
| `profilIA` | `string` | Accroche proposée par l'IA, lue depuis `dossier.ia.cv.profil`. Vide si `dossier.ia` est absent ou non renseigné (lecture toujours défensive). Ne provient volontairement pas de `dossier.texteAmelioreCanva`, qui contient un CV entier retapé par l'IA (pas une simple accroche) — le réutiliser créerait une confusion sémantique durable. |
| `profilUtilisateur` | `string` | Accroche modifiée ou écrite librement par la personne, si elle personnalise la proposition de l'IA. |

**Règle d'affichage prévue** (à appliquer côté template, pas ici) :
`profilUtilisateur` si rempli, sinon `profilIA`, sinon rien.

```json
"profil": { "profilIA": "", "profilUtilisateur": "" }
```

---

## `pointsForts` / `motsCles`

Contenus courts proposés par l'IA, lus depuis `dossier.ia.cv.pointsForts` /
`dossier.ia.cv.motsCles`. Toujours des tableaux (vides si non renseignés).

| Propriété | Type | Rôle |
|---|---|---|
| `pointsForts` | `string[]` | Phrases courtes mettant en avant des points forts du profil, proposées par l'IA. |
| `motsCles` | `string[]` | Mots-clés identifiés par l'IA comme pertinents pour le métier/secteur visé. |

**Non affichés par le Composeur aujourd'hui** — ces champs sont exposés dans
l'objet CV standardisé (lien `dossier.ia` → objet CV opérationnel de bout en
bout), mais leur intégration visuelle dans le rendu n'a pas été faite.

```json
"pointsForts": [], "motsCles": []
```

---

## `competences`

Compétences déduites automatiquement du parcours, via les fonctions
canoniques `savoirFaireActuels()` / `savoirEtreActuels()` / `obtenirSavoirs()`
(`js/app.js`) — les deux premières s'appuient en interne sur
`deduireCompetences()` et fusionnent avec ce que la personne a saisi
directement (`dossier.competences`).

| Propriété | Type | Rôle |
|---|---|---|
| `savoirFaire` | `string[]` | Savoir-faire (compétences techniques). |
| `savoirEtre` | `string[]` | Savoir-être (qualités comportementales). |
| `savoirs` | `string[]` | Savoirs / connaissances théoriques. |

```json
"competences": { "savoirFaire": ["Bureautique"], "savoirEtre": ["Relation client", "Rigueur"], "savoirs": ["Bases de comptabilite"] }
```

**Distinct de `competencesPersonnelles`** : les compétences personnelles
(comportementales, issues notamment du parcours Découverte) ne font pas
partie de cet objet — voir la section « Seconde étape » en fin de document.

---

## `experiences`

Expériences professionnelles classiques (`dossier.experiences`).

| Propriété | Type | Rôle |
|---|---|---|
| `poste` | `string` | Intitulé du poste occupé. |
| `entreprise` | `string` | Nom de l'entreprise (ou proche, dans le cas d'une expérience d'entraide). |
| `lieu` | `string` | Lieu d'exercice. |
| `dateDebut` | `string` | Date de début (format `AAAA-MM`). |
| `dateFin` | `string` | Date de fin. Chaîne vide si le poste est toujours en cours. |
| `missions` | `string` | Description des missions/tâches principales (facultatif). |
| `contrat` | `string` | Intitulé du contrat de CETTE expérience (ex. `"CDI"`, `"Stage"`, `"Alternance"`). Facultatif, chaîne vide si non renseigné. À ne pas confondre avec `dossier.contrat` (types de contrat recherchés, global, hors de ce schéma). |

```json
"experiences": [ { "poste": "Assistante", "entreprise": "ACME", "lieu": "Bordeaux", "dateDebut": "2020-01", "dateFin": "2022-06", "missions": "Accueil", "contrat": "CDI" } ]
```

---

## `experiencesPersonnelles`

Expériences personnelles valorisables (bénévolat, entraide familiale,
gestion du foyer...) — `dossier.experiencesPerso`.

| Propriété | Type | Rôle |
|---|---|---|
| `intitule` | `string` | Intitulé de l'expérience. |
| `detail` | `string` | Détail complémentaire (facultatif). |
| `dateDebut` | `string` | Date de début (facultatif, chaîne vide si non renseignée). |
| `dateFin` | `string` | Date de fin (facultatif, chaîne vide si non renseignée ou si l'expérience est toujours en cours). |
| `missions` | `string` | Description des missions/tâches principales (facultatif). |

```json
"experiencesPersonnelles": [ { "intitule": "Gestion d'un foyer", "detail": "Budget familial", "dateDebut": "", "dateFin": "", "missions": "" } ]
```

---

## `formations`

Diplômes/formations (`dossier.formations`), un véritable tableau à N
éléments.

| Propriété | Type | Rôle |
|---|---|---|
| `niveau` | `string` | Niveau du diplôme (ex. `"Bac +2"`). |
| `intitule` | `string` | Intitulé précis (ex. `"BTS Gestion"`). |
| `annee` | `string` | Année d'obtention. |
| `etablissement` | `string` | École ou centre de formation (facultatif, chaîne vide si non renseigné). |
| `missions` | `string` | Détail complémentaire sur la formation, saisi via le palier "niveau d'études" du parcours Découverte (facultatif, chaîne vide si non renseigné). |

**Filtre appliqué par `normaliserDonneesCV()`** : toute formation dont le
`niveau` vaut `"Sans diplôme"` est retirée de ce tableau — une mention "sans
diplôme" n'est jamais valorisante à afficher sur un CV. Ce filtre ne touche
que l'objet CV : `dossier.formations` garde la donnée intacte, toujours
utilisée telle quelle ailleurs (Mon Projet, texte de profil pour l'IA).

```json
"formations": [ { "niveau": "Bac +2", "intitule": "BTS Gestion", "annee": "2019", "etablissement": "IUT de Bordeaux", "missions": "" } ]
```

---

## `certifications`

| Type | Rôle |
|---|---|
| `string[]` | Certifications obtenues (ex. `"PIX"`, `"SST"`, `"CACES R489"`). |

```json
"certifications": ["PIX"]
```

---

## `langues`

| Propriété | Type | Rôle |
|---|---|
| `langue` | `string` | Nom de la langue. |
| `niveau` | `string` | Niveau CECRL (`A1` à `C2`). |

```json
"langues": [ { "langue": "Anglais", "niveau": "B2" } ]
```

---

## `permis`

| Propriété | Type | Rôle |
|---|---|
| `possede` | `boolean \| null` | Permis obtenu ou non. `null` si non renseigné. |
| `categories` | `string[]` | Catégories de permis obtenues (ex. `["B"]`). |
| `vehicule` | `boolean \| null` | Dispose ou non d'un véhicule personnel. `null` si non renseigné. |

```json
"permis": { "possede": true, "categories": ["B"], "vehicule": true }
```

---

## `loisirs`

| Type | Rôle |
|---|---|
| `string[]` | Loisirs renseignés par la personne. |

```json
"loisirs": ["Lecture"]
```

---

## `engagements`

| Type | Rôle |
|---|---|
| `{texte, dateDebut, dateFin}[]` | Engagements associatifs/citoyens renseignés par la personne. `dateDebut`/`dateFin` vides si non renseignées (chaîne vide, jamais `null`) ; `dateFin` vide = engagement toujours en cours. |

```json
"engagements": [
  { "texte": "Bénévolat association d'aide alimentaire", "dateDebut": "2018", "dateFin": "2022" }
]
```

Format étendu depuis `string[]` (ancien format). Le code de rendu
(`composeurRender.js`, `js/app.js`) continue de gérer les deux formats de
façon défensive (`typeof e === 'string'` vs objet) pour ne jamais planter
sur une donnée déjà existante au format ancien, même si un seul modèle de
CV (Composeur) est aujourd'hui en usage.

---

## Champ exposé mais non utilisé : `competencesPersonnellesDecouverte`

`normaliserDonneesCV()` expose un champ `competencesPersonnellesDecouverte`,
censé refléter `dossier.competencesPersonnellesDecouverte` (propositions
brutes du module Découverte). En pratique, il est **toujours vide** :
`extraireDonneesCV()` ne le lit jamais. Ce n'est pas un oubli à corriger —
c'est cohérent avec une décision explicite prise ailleurs dans le pipeline
(`appliquerMoteurDecisionCV()`, `js/app.js`) : fusionner à nouveau les
propositions brutes de Découverte à ce stade réintroduirait des compétences
que la personne aurait explicitement décochées à l'écran de sélection. La
fusion n'a lieu qu'une fois, en amont (voir section suivante). Ce champ peut
être ignoré sans risque par tout futur consommateur de ce schéma.

---

## Seconde étape : sélection et filtrage final (`appliquerMoteurDecisionCV`)

**L'objet décrit ci-dessus n'est pas ce que le Composeur affiche.** Avant
rendu, `appliquerMoteurDecisionCV(objetCV, recommandationsIA, capacitesModele)`
(`js/app.js`) prend le résultat de `normaliserDonneesCV()` et produit
l'objet réellement utilisé pour composer le CV :

- **Ajoute** `competencesPersonnelles` : les compétences comportementales
  choisies par la personne à l'écran de sélection (fusion déjà faite des
  propositions IA et Découverte, décisions déjà cochées/décochées) — champ
  absent de `normaliserDonneesCV()`, disponible seulement à partir d'ici.
- **Refiltre** plusieurs rubriques (`experiences`, `formations`, `langues`,
  `certifications`, `loisirs`, `engagements`) selon les recommandations de
  l'IA et la capacité du modèle choisi (nombre d'éléments affichables,
  rubriques masquées).

Cette étape a sa propre logique (fusion, priorisation, plafonds par
capacité de modèle) qui n'est pas détaillée ici : ce document reste le
contrat du schéma de données de base, pas la documentation du moteur de
décision. Si cette seconde étape justifie un jour sa propre référence
technique détaillée, elle mérite un document dédié plutôt que d'étendre
celui-ci.

---

## Fonctions liées

- **`extraireDonneesCV(dossier)`** (`modules/cv-core/extraireDonneesCV.js`) :
  lecture brute et partagée de `dossier`, sans mise en forme. Utilisée à la
  fois par `normaliserDonneesCV()` et par `genererCSVCanva()` (`js/app.js`),
  qui reste responsable de sa propre mise en forme texte (jointures,
  formatage CSV). Retourne quelques champs supplémentaires non repris par
  `normaliserDonneesCV()` (`contrat`, `tempsTravail`, `texteAmelioreCanva`) :
  ils servent uniquement à `genererCSVCanva()`, jamais à l'objet CV décrit
  dans ce document.
- **`normaliserDonneesCV(dossier)`** (`modules/cv-core/normaliserDonneesCV.js`) :
  produit l'objet CV décrit dans ce document.
- **`appliquerMoteurDecisionCV(objetCV, recommandationsIA, capacitesModele)`** (`js/app.js`) :
  seconde étape, voir section précédente — produit l'objet réellement rendu.
