# Chantier — la page « Passons à l'action » adaptée au module Découverte (point 6)

> **CLOS le 2026-08-31.** Les 4 sous-étapes sont faites et vérifiées :
> `2aaa648` (barre du module), `fa54eb5` (CV forcé, sélecteur masqué),
> `1883673` (une seule barre, titre « Créer mon CV »). Vérifié à chaque étape :
> les 3 entrées de `pageResultats()` (Découverte / Mon projet / import de
> session) — seule l'entrée Découverte change, les 2 autres sont intactes.
> `npm test` 641 verts tout du long, aucune erreur console.

> Retour de Denis (2026-08-31, capture 7) : quand on finit « Découvrir mes compétences »,
> on tombe sur la page **« Passons à l'action »** partagée. Elle porte la barre de
> navigation du parcours **« Mon projet »** (👤 identité / Expérience / Environnement /
> Attentes / Mon projet / Faire le point / Action) et **trois onglets** : Créer un CV /
> Lettre de motivation / Préparer un entretien.
>
> Denis veut : **retirer les onglets Lettre et Entretien** (Découverte ne produit qu'un CV),
> et **remplacer la barre « Action » par la barre de navigation propre à Découverte**
> (`barreEtapesModule`), quitte à **lui ajouter des étapes**. « L'adapter ET l'apporter sur
> la page de mon module. »
>
> **À mener AVEC Denis, pas en solo** (même régime que le chantier « fenêtre de dépôt du CV »).
> Ce document est le PLAN à valider avant de coder.

---

## 1. Ce qu'est réellement cette page

`pageResultats()` (`js/app.js` ~ligne 11909), route **`resultats`**, `<h1>🚀 Passons à l'action</h1>`.

Découverte y arrive par `finaliserEtNaviguerVersResultats()` (`decouverteParcours.js` ~3801) qui
pose `window._decouverteVersResultats = true` puis `naviguerVers('resultats')`.

La page se compose de :

| Élément | Source | Rôle |
|---|---|---|
| **Grande barre du haut** | `afficherProgression('resultats')` (~3193) | la nav « Mon projet » que Denis veut retirer ici |
| **Sélecteur de document** | `selecteurDocument` (~12154) | les 3 onglets Créer un CV / Lettre / Entretien |
| **Sous-barre d'étapes** | `ligneEtapesAction([...])` (~12016 / appel ~12504) | Adaptation → Infos → Assistant → Importer → Aperçu → Exporter (progression *interne* à la création du document) |
| **Accordéons** | `accordeonAdaptation … accordeonExporter` (~12512) | le flux réel de création du CV (adapter au métier, choisir l'assistant, importer sa réponse, aperçu, export Word/PDF) |
| Barre bas | `barre-navigation-fixe` | Retour / Accueil |

**Point clé** : le flux de création du CV (les accordéons) **est nécessaire** à Découverte —
c'est là que la personne génère et exporte son CV. On ne peut donc pas « sauter » cette page
(l'option C envisagée est écartée : il n'y a pas d'écran de CV ailleurs). Ce qu'on peut faire,
c'est **y arriver avec le CV déjà choisi, sans les autres onglets, et avec la bonne barre de nav.**

**Bonne nouvelle** : la variable `depuisDecouverte` (`= !!window._decouverteVersResultats`)
est **déjà calculée** dans `pageResultats()` (~12468). Le point d'accroche existe.

---

## 2. Approche retenue : adapter par paramètre, ne pas forker

Conforme au non-négociable « une seule source de vérité ». On ajoute des branches
`if (depuisDecouverte)` dans `pageResultats()` (et ses helpers), jamais une copie de la page.

### Décisions de Denis (2026-08-31) — verrouillées

1. **Barre du haut** : `DECOUVERTE_NAV_ETAPES` + **un seul repère final `{ label: 'Mon CV', icone: '📄' }`** (6 repères).
   Le repère ajouté au tableau PARTAGÉ → visible dès le début du parcours, en gris (rassure : « ça mène à un vrai CV »).
2. Barre **indicative, non cliquable** (comme partout ailleurs où `barreEtapesModule` est utilisé).
3. **Une seule barre. Pas de sous-barre.** `ligneEtapesAction` (Adaptation → Exporter) est **retirée** quand
   `depuisDecouverte`. Le repère « Mon CV » couvre plusieurs écrans (choisir l'assistant, importer, aperçu,
   exporter) — c'est assumé, à titre informatif. (La sous-barre de la vraie page Action sera retravaillée
   par Denis dans un autre chantier ; on n'y touche pas ici.)
4. **Titre** : `<h1>📄 Créer mon CV</h1>` quand `depuisDecouverte` (ombrelle qui couvre tous les écrans du
   repère « Mon CV »). Le titre ne change pas d'un écran à l'autre — chaque accordéon porte déjà son propre
   intitulé.
5. **Sélecteur de document masqué**, carte « CV » forcée.
6. **Garde-fou renforcé (Denis) : modifier cette page ne doit RIEN changer à la vraie page Action.**
   Toute modification est gardée par `if (depuisDecouverte)`. Test des 3 entrées à CHAQUE sous-étape.

### 2.1 Barre du haut

- Aujourd'hui : `afficherProgression('resultats')`.
- Cible quand `depuisDecouverte` : `barreEtapesModule(DECOUVERTE_NAV_ETAPES, indexCourant)` où
  `indexCourant = 5` (repère « Mon CV » courant) tant que le CV n'est pas exporté, puis `6`
  (tout terminé, aucun repère courant) une fois `cvTermine` / export fait — petit signal « c'est bouclé »
  qui remplace la sous-barre supprimée.
- `DECOUVERTE_NAV_ETAPES` (`decouverteParcours.js` ~63) gagne `{ label: 'Mon CV', icone: '&#128196;' }`
  en 6e position. `_decouverteNavIndex()` (mapping étape technique → repère) est **inchangé** : il renvoie
  déjà 0..4 pour les étapes 1..8, donc « Mon CV » (index 5) reste « à venir » (gris) pendant tout le parcours.

### 2.2 Onglets de document

- `selecteurDocument` (Créer un CV / Lettre / Entretien) : **masqué** quand `depuisDecouverte`.
- Vérifier que `dossier.modeCreation` / la carte active sont bien sur « cv » en arrivant de Découverte
  (sinon les accordéons ne s'affichent pas) — poser explicitement `carteChoisie = 'cv'` si besoin dans
  la branche `depuisDecouverte`.

### 2.3 `ligneEtapesAction` (sous-barre)

- **Retirée** quand `depuisDecouverte` (décision 3). `if (!depuisDecouverte)` autour de son appel
  (~ligne 12504). Aucune autre modification de la fonction elle-même (elle sert encore « Mon projet »).

### 2.4 Titre

- `<h1>🚀 Passons à l'action</h1>` → `<h1>📄 Créer mon CV</h1>` quand `depuisDecouverte`.
- Sous-titre « Choisissez votre document… » : déjà masqué hors `modeCreation === 'nouveau'`, rien à faire.

### 2.5 « Retour »

- Déjà géré : `cibleRetourResultats = depuisDecouverte ? null : …` et le Retour route vers
  `reafficherDecouverteCompetences()` quand `depuisDecouverte`. **Rien à changer.**

---

## 3. Découpage en sous-étapes (un commit chacune, `npm test` + navigateur, test des 3 entrées)

1. **Barre du haut** : ajouter « Mon CV » à `DECOUVERTE_NAV_ETAPES` ; dans `pageResultats()`,
   `if (depuisDecouverte)` → `barreEtapesModule(DECOUVERTE_NAV_ETAPES, cvExporte ? 6 : 5)` au lieu de
   `afficherProgression('resultats')`. Vérifier : barre Découverte de bout en bout du parcours (« Mon CV »
   en gris), puis courante sur `pageResultats`, puis terminée après export. Clair + sombre.
2. **Sélecteur de document** masqué + carte « CV » forcée quand `depuisDecouverte`. Vérifier que les
   accordéons s'affichent et que le flux complet (adapter → assistant → import → aperçu → export) marche.
3. **Sous-barre retirée** (`if (!depuisDecouverte)` autour de `ligneEtapesAction`) + **titre**
   « 📄 Créer mon CV ».
4. **Passe de non-régression** : « Mon projet » classique et « import de session » arrivent aussi sur
   `pageResultats` — vérifier que TOUT est intact pour eux (grande barre « Mon projet », 3 onglets,
   sous-barre Adaptation→Exporter, titre « Passons à l'action »).
5. Docs (`TACHES_VALIDEES.md`) + mémoire.

---

## 4. Garde-fous

- **Ne jamais forker `pageResultats`** — que des branches `if (depuisDecouverte)`.
- `pageResultats` sert aussi « Mon projet » et « import de session » : toute branche non gardée
  par `depuisDecouverte` est une régression pour eux. Test des 3 entrées à chaque sous-étape.
- `js/app.js` n'est pas couvert par les tests Node → **test navigateur de bout en bout
  obligatoire** (Découverte complet → CV généré → export), clair + sombre.
- Barre du haut : réutiliser `barreEtapesModule` (déjà en place sur la page routée `decouverte`
  et sur l'intro), jamais un 2e composant.

---

## 5. Décisions — TOUTES PRISES (2026-08-31)

Voir « Décisions de Denis » en section 2. Résumé : 1 seul repère « Mon CV » ajouté au tableau partagé ;
barre indicative non cliquable ; **une seule barre, sous-barre `ligneEtapesAction` retirée** ; titre
« 📄 Créer mon CV » ; sélecteur de document masqué ; **zéro impact sur la vraie page Action** (tout gardé
par `depuisDecouverte`, test des 3 entrées à chaque sous-étape).

Prêt à exécuter. Reste à trouver le créneau avec Denis.
