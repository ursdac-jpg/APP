# Chantier — supprimer la fenêtre de dépôt du CV, l'intégrer dans la page du module (2026-08-31)

> Demande de Denis : ce qu'il aime dans « Analyser ma candidature », c'est que le dépôt du CV, la
> relecture, le ciblage soient **tout sur une seule page qui se déplie**, jamais fenêtre sur
> fenêtre. Pour **Co-construire ma lettre de motivation**, **Préparer un entretien d'embauche** et
> **Cohérence de mon dossier**, il y a encore une fenêtre modale qui « pop » pour déposer le CV.
> Il veut que cette partie soit **intégrée dans la page de chaque module**.
>
> Ce document est un PLAN à valider **avant de coder**. À traiter comme la consolidation du
> Bilan : **un bloc à la fois, `npm test` + navigateur à chaque fois, un commit par sous-étape,
> jamais un état à moitié refondu.**

---

## 1. État au 2026-08-31

| Module | Présentation | Parcours |
|---|---|---|
| Analyser ma candidature | page routée | **page dépliante « Préparer »** (`htmlBilanPreparer`) — la référence |
| **Découvrir mes compétences** | page routée (`decouverte-intro`) | **PAGE** (route `decouverte`) — converti de fenêtre à page ce jour. Reste : fusionner les écrans 1+2+3 en une dépliante et 6+7 (voir `CONSOLIDATION_DECOUVERTE_PROPOSITION_2026-08-31.md`). Pas de dépôt de CV ici. |
| Co-construire ma lettre | page routée (`co-lettre`) | cascade de fenêtres — **1re fenêtre = `ouvrirAssistantDepotCV('pret')`** (à remplacer) |
| Préparer un entretien | page routée (`prepa-entretien`) | cascade de fenêtres — **`ouvrirDepotEntretien` + `ouvrirVerificationEntretien`** (à remplacer) |
| Cohérence de mon dossier | page routée (`ctHtmlExplication`) | `ctDemarrer` → collecte via **`ouvrirAssistantDepotCV`** (3 documents) (à remplacer) |

Toutes les pages routées ont déjà la **barre d'étapes** du module (`barreEtapesModule`, langage du
Bilan : pastille courante jaune + halo, chevrons bleus).

---

## 2. Le problème précis : `ouvrirAssistantDepotCV` (data/metiers.js, ~700 lignes)

C'est la fenêtre modale qui « pop ». Elle fait, en plusieurs sous-écrans internes :
1. **Choisir un fichier** (PDF / Word / .txt / **photo / scan**) **ou coller le texte**.
2. Pour une image/scan : **éditeur d'image** (rognage, masquage de zones).
3. **Écran de vérification / masquage** du texte avant transmission.
4. Renvoie `onDocumentPrepare({ type: 'texte', valeur })` ou `{ type: 'image' }`.

**Partagée** avec la création de CV normale du parcours guidé (`js/app.js`). **Ne jamais la
modifier.**

---

## 3. Le modèle : `htmlBilanPreparer()` — comment il gère déjà ça

`js/app.js`. Une `page-catalogue-contenu` avec des `<details class="bloc-depli">` (`.preparer-num`,
`.preparer-titre`, `.pilule-etat`). Bloc 1 « Votre CV » :
- bouton **« Déposer mon CV »** → `obtenirOuDeposerTexteCV(cb)` (dépôt léger fichier / texte).
  - `cb({texte, dejaRelu})` → texte exploitable, on continue sur la page.
  - `cb({texte: null})` → **scan / photo → repli sur `ouvrirAssistantDepotCV` en fenêtre**
    (`ouvrirAssistantDepotCV(dossier.modeCreation || 'maj', { onTerminer: rerender })`).
- bouton **« Ou coller le texte »** → zone de texte inline (`#preparerCollerZone`).

**Donc le chemin image/scan n'est jamais perdu** : il ouvre la même fenêtre qu'aujourd'hui, mais
seulement dans ce cas précis. Le cas courant (fichier texte / copier-coller) se fait sur la page.

Briques réutilisables (génériques malgré le préfixe `bilan`) :
- `obtenirOuDeposerTexteCV(cb)` — dépôt léger + repli.
- `bilanDemanderRelectureCv(texte, undefined, false)` → `Promise<{contenuValide}>` — écran de
  relecture / masquage (le même que le Bilan). Rejet `RelectureAnnulee` si fermé.
- `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre(racine, onChange)` /
  `bilanLireCiblageOffre(racine)` — bloc entreprise / site / offre / type de structure.

---

## 4. Plan par module

### 4.1 Co-construire ma lettre — `pageCoLettrePreparer()`  *(à faire en premier, le plus simple)*

Remplace `ouvrirDepotLettreV1` → `ouvrirAssistantDepotCV('pret', { onDocumentPrepare })`.

| Bloc dépliant | Contenu | Brique |
|---|---|---|
| 1 · Votre CV *(obligatoire)* | « Déposer mon CV » / « Ou coller le texte » ; repli scan → `ouvrirAssistantDepotCV` | `obtenirOuDeposerTexteCV` |
| 2 · Relire et masquer *(obligatoire)* | ouvre la relecture ; masque tel / mail / liens | `bilanDemanderRelectureCv` |
| 3 · Le poste et l'entreprise *(facultatif)* | poste visé + entreprise / site / lien d'offre | `bilanCorpsCiblageOffreHTML` (ou sous-ensemble) |

- Barre d'étapes : `barreEtapesModule(ETAPES_LETTRE, 0)` (« Préparer » courante).
- CTA « Choisir mon assistant → » → `ouvrirChoixAssistantLettreV1({ type: 'texte', valeur: <texte relu> })`
  (ou `{ type: 'image' }` si repli scan).
- **À vérifier avant de coder** : `ouvrirChoixAssistantLettreV1(documentPrepare)` appelée
  directement (hors wizard) — elle crée son propre écran, a priori oui, mais lire la fonction
  en entier.
- Route `co-lettre` : `pageCoLettre()` affiche l'intro ; son CTA appelle `pageCoLettrePreparer()`
  (rendu dans `app.innerHTML`). « Retour » de « Préparer » → l'intro du module.

### 4.2 Préparer un entretien — `pagePrepaEntretienPreparer()`

Remplace `ouvrirDepotEntretien` + `ouvrirVerificationEntretien` + `verifierOuDemanderEntrepriseEtPoste`.

| Bloc dépliant | Contenu | Brique |
|---|---|---|
| 1 · Votre CV *(obligatoire)* | idem lettre | `obtenirOuDeposerTexteCV` |
| 2 · Votre lettre de motivation *(facultatif)* | même dépôt, optionnel | idem, 2e instance |
| 3 · Relire et masquer *(obligatoire)* | relecture de chaque document déposé | `bilanDemanderRelectureCv` (1 appel / document) |
| 4 · L'entreprise et le poste *(facultatif)* | entreprise + poste + lien d'offre | `bilanCorpsCiblageOffreHTML`, ou les champs de `verifierOuDemanderEntrepriseEtPoste` en bloc |

- CTA → `ouvrirChoixIAEntretien(cb)` avec l'état documents attendu par `etapeEntrepriseEtPoste`.
- **Point délicat** : reconstruire exactement la forme `etatDocuments` (`{cv:{analyse…}, lettre:{…}}`)
  que `ouvrirVerificationEntretien` produit aujourd'hui — sinon `finaliserEtNaviguerVersResultats`
  reçoit des données incomplètes. **Lire `ouvrirDepotEntretien` / `ouvrirVerificationEntretien` en
  entier** et noter la forme avant de coder.

### 4.3 Cohérence de mon dossier — `ctHtmlPreparer()`

`ctDemarrer` → `ctHtmlExplication` (déjà une page) → collecte via `ouvrirAssistantDepotCV` (CV,
lettre, entretien) puis « Infos complémentaires ».

| Bloc dépliant | Contenu |
|---|---|
| 1 · Votre CV *(obligatoire)* | `obtenirOuDeposerTexteCV` |
| 2 · Votre lettre de motivation *(facultatif)* | idem |
| 3 · Votre préparation d'entretien *(facultatif)* | idem |
| 4 · Relire et masquer *(obligatoire)* | `bilanDemanderRelectureCv` par document |
| 5 · Infos complémentaires | `typeStructure` (`BILAN_TYPES_STRUCTURE`) + questions libres — déjà dans `ctHtmlInfosComplementaires`, à intégrer comme bloc |

- `ctDeposerDossier` en aval attend un `DossierTransversal` — **cartographier sa forme** avant de coder.
- La page `coherence-transversale` évolue déjà selon l'état (`!diagnostic` → explication / choix IA
  / rapport). Ajouter un état « préparer » entre l'explication et le choix IA.

---

## 5. Garde-fous (obligatoires)

- **Ne jamais modifier `ouvrirAssistantDepotCV`** — appelée seulement en repli scan/photo, à
  l'identique du bloc 1 du Bilan.
- Les pipelines aval (`ouvrirChoixAssistantLettreV1`, `ouvrirChoixIAEntretien`,
  `finaliserEtNaviguerVersResultats`, `ctDeposerDossier`) attendent des **formes de données
  précises** : lire la fonction d'entrée en entier, noter la forme exacte, reconstruire cette
  forme depuis les blocs — jamais « à peu près ».
- `js/app.js` et `data/metiers.js` **ne sont pas couverts par les tests Node** → test navigateur
  **de bout en bout obligatoire** par module (dépôt → relecture → ciblage → choix assistant →
  coller → livrable), avant de passer au suivant.
- Chemin **image / scan** conservé partout (repli `ouvrirAssistantDepotCV`).
- La relecture / masquage reste un écran (modal `bilanDemanderRelectureCv`) — c'est le cas dans
  le Bilan aussi, Denis l'a validé. Le reste (dépôt, ciblage) est sur la page.

## 6. Ordre proposé

1. **Lettre** (1 document). Valider avec Denis.
2. **Entretien** (2 documents, forme `etatDocuments` à reconstruire).
3. **Cohérence** (3 documents + infos complémentaires).
4. **Découverte** : fusion des écrans 1+2+3 (récit + coordonnées + visée) en une dépliante, et
   6+7 — le parcours est déjà une page, il reste à réduire le nombre d'écrans.

Chaque étape : commit par bloc, `npm test` + navigateur, jamais à moitié.
