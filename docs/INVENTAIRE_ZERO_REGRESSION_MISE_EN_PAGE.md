# Inventaire zéro-régression : « La mise en page » du CV

> Sous-étape 0 du chantier (`docs/CADRAGE_MISE_EN_PAGE_2026-09-03.md`). **0 code.**
> But : chaque réglage / bouton / action de l'existant reçoit une étiquette
> **GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI** et une case cible dans la maquette
> v6 (`docs/MAQUETTE_MISE_EN_PAGE_2026-09-02.html`). Aucun « RETIRÉ » sans une
> ligne dédiée (§8). Relevé fait par lecture directe du code le 2026-09-03.
>
> Codes cible : **S** = niveau Simple · **D** = niveau Je débute · **T** = Tout
> régler (section) · **T/d** = sous-repli « Détails » d'une section · **GA** =
> Aperçu à taille réelle (grand aperçu, PDF). Sections de « Tout régler » :
> `secPage` (La page) · `secCouleurs` (Les couleurs) · `secHaut` (Le haut de la
> page) · `secTexte` (Le texte) · `secAffiche` (Ce qui s'affiche) · `secReprendre`
> (Reprendre la main).

---

## 1. Chemin réel du parcours (Règle 2bis)

- **Écran d'avant** : « Vos documents » (`pageResultats`, route `resultats`,
  mode `nouveau`). Trois rectangles `rectDoc` : **Le format** · **La mise en
  page** · **Exporter** + encart « Et maintenant ? ». Un seul ouvert à la fois
  (`_rectDocOuvert`).
- **Le rectangle « La mise en page »** : rendu par
  `construireContenuApercuFinalisation(docActif)` (`js/app.js:13617`), appelé
  depuis `rectDoc('mise-en-page', …)` (`js/app.js:14643`). Pour le CV, il
  contient : (grille de modèles **vide en A4**, visible en A5 Portrait/Paysage),
  palette de couleurs, boutons de format, bloc photo, jeton « sans accroche »,
  mini aperçu + bouton « Ouvrir le grand aperçu », **et** le panneau Word
  « Projet XXL » (`construirePaletteCouleurs` + suite, `js/app.js` ~28303-30530)
  OU l'iframe PDF (`ouvrirApercuPdfHtml` → `cvPdfExport.js` →
  `cvPdfPanneauReglages.js`).
- **Grand aperçu** : `ouvrirGrandApercuPdf()` (`js/app.js:27770`, PDF, réutilise
  l'iframe) / `apercuDocxIntegre.js` (Word, partagé lettre/entretien).
- **Écran d'après** : rectangle « Exporter » (`_rectDocOuvert = 'exporter'`),
  puis fin de parcours.
- **Données** : lecture `dossier` (+ `dossier.logiciels`, `dossier.photo`,
  `dossier.rechercheCandidature.couleurEntreprise`). Écriture aujourd'hui :
  `etatApercuInline.cv.reglagesProjetXXL` (Word) + inputs `reg*` de l'iframe
  (PDF). Cible : `dossier.reglagesMiseEnPageCV` (canonique) → 2 traducteurs.
- **Ce qui n'est PAS touché** : `construireDonneesPdfCV`, `cvPdfTemplateA4/A5`,
  `composeurComposition` / `composeurRender` / `composeurStrategies`,
  `composeurAppliquerReglagesProjetXXL` (reçoit toujours un objet
  `reglagesProjetXXL`, produit par le traducteur), l'export
  (`genererDocxComposeur`, `genererBlobDocumentActif`), la manipulation directe
  (on la rhabille, §6). Lettre / entretien restent sur
  `construireContenuApercuFinalisation`.

---

## 2. Réglages PDF `reg*` (67 identifiants, `cvPdfPanneauReglages.js`)

Tous ont une case dans la maquette. Fate par défaut : **DÉPLACÉ** (même réglage,
nouvelle UI) sauf mention.

### 2.1 Niveau Simple / Je débute
| `reg*` | Cible | Fate |
|---|---|---|
| `regSobreActif`, `regCreatifActif` | S — « Allure générale » (Sobre / Créatif) | DÉPLACÉ |
| `regReinitialiser` | S + `secReprendre` — « Revenir au modèle de départ » | DÉPLACÉ |
| `regCouleurDebut` | D + `secCouleurs` — Accent | DÉPLACÉ |
| `regCouleurFin` | `secCouleurs` (hors version courte) — Accent clair (A4) | DÉPLACÉ |
| `regFondColonnes` | D + `secCouleurs` — Fond des colonnes | DÉPLACÉ |
| `regDegradeColonnes` | `secCouleurs` — Dégradé | DÉPLACÉ |
| `regTexteFondColonnes` | `secCouleurs` — Texte sur le fond coloré | DÉPLACÉ |
| `regPolice` | D + `secTexte` — Police | DÉPLACÉ |
| `regFormatCV` | D + `secPage` — Format (5 valeurs) | DÉPLACÉ |
| `regColonnes` | D + `secPage` — Colonnes 1/2 | DÉPLACÉ |
| `regEchelle` | D (Densité) + `secPage` — Taille du texte | DÉPLACÉ |

### 2.2 `secPage` (La page)
`regColonnesInversees` (T/d) · `regLargeurColonneGauche` (T/d) · `regFormeColonnes`
(T/d) · `regSeparateurColonnes` (T/d) · `regEchelleA5` (T/d A5) ·
`regFondColonnesA5` (T/d A5) · `regEnteteInverseeA5` (T/d A5) · `regRemplirPageA5`
(T/d A5). Tous **DÉPLACÉ**.

### 2.3 `secCouleurs` (Les couleurs)
`regFondColonnesEffet` (T/d) · `regFondColonnePleineHauteur` (T/d) ·
`regCouleurFondCompetences` (T/d — swatch #e9e9e9) · `regCouleurTextePuces`
(T/d — swatch #1b1b1b). Tous **DÉPLACÉ**.

### 2.4 `secHaut` (Le haut de la page)
`regBandeauEnTete` · `regFormeEnTete` · `regDegradeBandeau` ·
`regBandeauDisponibilite` (Coordonnées à part) · `regDispositionEntete` ·
`regAnneauPhoto`. Tous **DÉPLACÉ**. `regPositionLibreEntete` → **DÉPLACÉ vers GA**
(renvoi depuis `secHaut`).

### 2.5 `secTexte` (Le texte)
`regStyleTitres` · `regLectureGuidee` · `regStyleCompetences` · `regIcones` ·
`regIconesCoordonnees` · `regStyleBordures`. **DÉPLACÉ.**
T/d : `regStyleProfessionnel` · `regStylePersonnel` · `regBandeauCompetencesCles`
· `regCoinsArrondis`. **DÉPLACÉ.**
« Mettre en évidence » (6 cases) : `regSoulignerPoste` `regItaliquePoste`
`regSoulignerDates` `regItaliqueDates` `regSoulignerEntreprise`
`regItaliqueEntreprise` → T/d. **DÉPLACÉ** (voir §8-5 : libellés maquette à aligner).

### 2.6 `secAffiche` (Ce qui s'affiche)
`regOrdreExperiences` · `regSansAccroche` (T/d) · `regLettreJointe` (T/d) ·
`regRegroupementActif` (T/d) · `regFormatExperiences` (T/d) ·
`regFormationsMisesEnAvant` (T/d). **DÉPLACÉ.**

### 2.7 Aperçu à taille réelle (GA) — réglages « par bloc » / « par rubrique »
`regLargeurAccrocheLibre` · `regLargeurMetierLibre` · `regStyleTexteEnteteActive`
· `regCouleurTexteEntete` · `regTexteEnteteGras` · `regTexteEnteteItalique`
(groupe « Un bloc de l'en-tête »).
`regEchelleRubrique` · `regPoliceRubrique` · `regPoliceRubriqueActive` ·
`regStylePuceRubrique` · `regStylePuceRubriqueActive` · `regCouleurFondPuceRubrique`
· `regCouleurTextePuceRubrique` · `regStyleMissionsRubrique` (groupe « Une
rubrique seule »).
Tous **DÉPLACÉ vers GA** (7a/7b), câblés sur les fonctions existantes, jamais
réécrits.

---

## 3. Réglages Word `data-projetxxl-*` (29) + clés d'objet `reglagesProjetXXL`

| Attribut / clé | Cible | Fate |
|---|---|---|
| `coloration`, `lectureguidee-variante`, `textecolore-portee`, `textebandeau` | `secCouleurs` / `secTexte` (Lecture guidée + texte coloré) | DÉPLACÉ |
| `fondcolonnes`, `fondcolonneseffet`, `textefondcolonnes`, `fondcolonneetendueentete`, `fondtete` | `secCouleurs` | DÉPLACÉ |
| `separateur`, `separateur-couleur` | `secPage` T/d — Séparateur (+ couleur) | DÉPLACÉ |
| `colonnesinversees` | `secPage` T/d | DÉPLACÉ |
| `police` | D + `secTexte` | DÉPLACÉ |
| `iconesrubriques`, `iconescoordonnees` | `secTexte` | DÉPLACÉ |
| `accrocheitalique` | `secAffiche` T/d — Style de l'accroche | DÉPLACÉ |
| `sansaccroche` | `secAffiche` T/d | DÉPLACÉ |
| `lettre` (`lettreJointe`) | `secAffiche` T/d | DÉPLACÉ |
| `regroupement` (`regroupementActif`) | `secAffiche` T/d | DÉPLACÉ |
| `stylepro`, `stylepersonnel` | `secTexte` T/d | DÉPLACÉ |
| `ordredatesposte` | `secAffiche` T/d — « Ordre dans la ligne d'expérience » | DÉPLACÉ (voir §8-3) |
| `strategie` (`strategieForcee`) | S — via Complet / Optimisé | FUSIONNÉ |
| `bandeaudispo` (`bandeauDisponibilite`) | `secHaut` — Coordonnées à part | FUSIONNÉ avec `regBandeauDisponibilite` |
| `photo` | `secHaut` — photo | FUSIONNÉ |
| `bloc`, `bloc-gauche`, `bloc-droite` (`blocMisEnAvant*`) | `secAffiche` — « Bloc mis en avant » (Word uniquement) | GARDÉ (asymétrie assumée, revue 1.2) |
| `debordement` (`optionDebordement`) | `secPage` — Longueur (constat A/B/C) | DÉPLACÉ |
| `entete-inversee` | — | **À TRANCHER (§8-1)** |
| `formatPage` | `secPage` — Format | FUSIONNÉ avec `regFormatCV` |
| clés de bookkeeping composeur (`formations`, `certifications`, `langues`, `loisirs`, `engagements`, `bonusCapacites`, `capaciteExperiencesBonus`, `missionsBonus`, `tailleBonus`, `detailForceParCompetences`, `choisiManuellement`, `modele`, `hex`, `couleur`, `taillePct`) | — | **INCHANGÉ** : ce ne sont pas des réglages d'UI, le traducteur les laisse tels quels dans `reglagesProjetXXL`. |

---

## 4. Boutons de la rangée du haut (PDF + Word)

| Bouton(s) | Cible | Fate |
|---|---|---|
| `btnStyleAleatoire` (PDF) + `btnProposerModeleXXL` (Word) | S + `secReprendre` — « Style au hasard » | **FUSIONNÉ** (1 libellé, revue 1.5) |
| `btnAnnulerAleatoire` | S — « Annuler le dernier tirage » | DÉPLACÉ |
| `btnMiseEnPage` + `btnMiseEnPageA` (A5) + `btnMiseEnFormeUltimeXXL` | S + `secReprendre` — « Mise en page » | **FUSIONNÉ** (libellé déjà aligné) — **ENRICHI** : joue aussi sur interligne / espacement / marges (revue §J.2) |
| `btnSobrePdf`/`btnSobreXXL` + `btnCreatifPdf`/`btnCreatifXXL` | S — « Allure générale » | FUSIONNÉ |
| `btnCvOptimisePdf` + `btnCvOptimiseXXL` (`dossier.cvOptimiseActif`) | S — « Quelles formations montrer » | FUSIONNÉ |
| `btnCouleurEntrepriseXXL` (+ chemin pipette PDF) | D + `secCouleurs` — « Accent = couleur de l'entreprise » | **ENRICHI** — reçoit aussi `dossier.rechercheCandidature.couleurEntreprise` (option C partie 3) |
| `btnPipetteLibrePdf` + `btnPipetteLibreXXL` | `secCouleurs` + barre GA — « Pipette » | FUSIONNÉ |
| `btnImprimerSousApercuPdf` | Barre GA — « Imprimer » | DÉPLACÉ |
| `btnEditionTextePdf` | Barre GA — « Modifier le texte » | DÉPLACÉ |
| `boutonFormatIntegralXXL` | D + `secPage` — Format | **ENRICHI** — visible d'emblée en Word (revue 1.1) |
| `btnFermerGrandApercuPdf` / `btnFermerPdf` | Barre GA — « Revenir aux réglages » | DÉPLACÉ |
| `btnAgrandirPdf` / `btnAtelierCVAgrandirPdf` / `btnOuvrirGrandApercu` | Bouton « Aperçu à taille réelle » | FUSIONNÉ |
| `btnPersonnaliserPdf` / `btnPersonnaliserXXL` | — | **SUPPRIMÉ, ligne dédiée §8-2** (décision Denis 2026-09-02, revue §A.4) |
| `btnAidePdf` / `btnFermerAidePdf` (aide interne de l'iframe) | Remplacé par l'encart « ce que le PDF permet » de la maquette | **SUPPRIMÉ, ligne dédiée §8-4** |

---

## 5. Contrôles propres au rectangle actuel (`construireContenuApercuFinalisation`, CV)

| Contrôle | Cible | Fate |
|---|---|---|
| Grille de modèles A4 (`grilleModelesCV`) — **vide pour le CV** (Composeur seul modèle A4) | — | Rien à porter (déjà vide). Le « modèle unique » de la maquette. |
| Grille A5 Portrait / Paysage (`grilleModelesA5CV`) | D + `secPage` — Format (Mini CV A5 Portrait / Paysage) | **FUSIONNÉ** dans le sélecteur de format |
| Palette de couleurs + nuances (`paletteCouleursCV` / `pastillesCouleursCV` / `.pastille-nuance-cv`) | D + `secCouleurs` — bases + nuances rapides | DÉPLACÉ |
| Boutons de format (`data-format-page` : A4 / A4-essentiel / A5 / A4-integral) | D + `secPage` — Format | DÉPLACÉ |
| Bloc photo : `checkInclurePhotoApercu`, `btnRetirerPhotoApercu`, `btnAllerPhotoIdentite`, `inputPhotoXXL` | `secHaut` (Détails) — ajouter / inclure / retirer / changer la photo | **GARDÉ** (placement exact §8-6) |
| `pastilleSansAccrocheApercu` | `secAffiche` T/d — Phrase d'accroche | FUSIONNÉ avec `regSansAccroche` |
| `btnOuvrirGrandApercu` | Bouton « Aperçu à taille réelle » | DÉPLACÉ |
| Rappel format (bandeau) | Bandeau « rappel-format » de la maquette (fermable, symétrique) | **ENRICHI** |
| Mini aperçu (`zoneApercuInlineCV`) | Colonne aperçu de la maquette | GARDÉ |

---

## 6. Manipulation directe (`INVENTAIRE_REGLAGES_CV` §I) — GA, PDF uniquement

Tout **GARDÉ, rhabillé** dans la nouvelle coquille du grand aperçu (sous-étapes
7a / 7b), jamais réécrit :
- I.1 déplacer les blocs d'en-tête (`_pdfActiverGlisserLibreEntete`,
  `_cvPdfPositionsEntete`)
- I.2 poignées de redimensionnement (`_pdfActiverRedimensionnementBlocLibre`,
  `_cvPdfHauteurEntete`, `_pdfAjusterEchelleEnteteEnsemble`)
- I.3 barre de format de texte par bloc d'en-tête (`_pdfAfficherBarreFormatTexte`,
  `_cvPdfStylesTexteEntete`)
- I.4 mini-barre flottante par rubrique (`_pdfAfficherBarreOutilsRubrique`,
  `_cvPdfEchellesRubriques`, `_cvPdfPolicesRubriques`, `_cvPdfStylesPuceRubriques`,
  `_cvPdfRubriquesForceesColonne`, `btnResetRubrique`)
- I.5 réordonner les rubriques au glisser-déposer (`_pdfActiverGlisserDeposer`,
  `_cvPdfOrdrePersonnalise`)
- I.6 écrire dans le CV (`_cvPdfModeEditionTexte`, `_cvPdfTextesEdites`)
- I.7 échelle globale + grand aperçu (`_cvPdfEchelle`, `_cvPdfModeGrandApercu`) —
  **invariant** mini aperçu = grand aperçu à préserver (revue 4.2 ; garanti
  partiellement en « B allégé », totalement à la fusion des moteurs).
- I.7bis `btnImprimerSousApercuPdf` (Imprimer)
- I.8 sécurités Sobre / Créatif (`_cvPdfReglagesAvantSobre`,
  `_cvPdfReglagesAvantCreatif`, `_pdfProposerAutreModeleCreatif`)

---

## 7. NOUVEAU (ajouts de la maquette — `INVENTAIRE_REGLAGES_CV` §D / §J)

À créer dans le modèle canonique + les 2 traducteurs (ou « montré + expliqué »
si le moteur ne sait pas encore le faire) :
- **Interligne**, **espacement des paragraphes**, **marges de page**,
  **alignement (gauche / justifié)** → `secPage` (+ « Densité » en D regroupe
  interligne + espacement). Intégrés au dé et au bouton « Mise en page » (§J.1
  / §J.2).
- **Liste unique « rubriques à afficher / masquer »** (cases : Langues, Loisirs,
  Certifications, Permis, Engagements, Expériences personnelles, **Logiciels**…)
  → `secAffiche`.
- **Ordre des rubriques** (Word : n'existe pas aujourd'hui) → `secAffiche`.
- **Annuler / Refaire multi-pas** → `secReprendre` (aujourd'hui : seulement
  « Réinitialiser » + « Annuler 🎲 »).
- **Éviter un titre seul en bas de page (veuves / orphelines)** → `secAffiche`
  (garantie de rendu, pas un simple réglage).
- **Avertissement impression noir et blanc** (accent trop clair) → `secCouleurs`,
  alerte auto.
- **Rubrique « Logiciels »** sur le CV (`dossier.logiciels`, déjà rendue) → dans
  la liste des rubriques.
- **« mon style »** (enregistrer / réappliquer un jeu de réglages) → `secReprendre`,
  **bouton désactivé « à implémenter »** (comme la maquette v6 ; vraie
  implémentation = tâche séparée).

---

## 8. Points tranchés (Denis, 2026-09-03) — aucun « RETIRÉ » silencieux

1. **Word « Permuter l'en-tête » (`data-projetxxl-entete-inversee`)** :
   **SUPPRIMÉ côté Word** aussi, pour s'aligner sur le PDF (fonction déjà
   retirée du PDF comme bug de conception, revue 2.1 « ne pas réintroduire »).
   Le traducteur → Word n'émettra plus cet attribut ; le contrôle disparaît de
   l'UI. La disposition de l'en-tête reste réglable par ailleurs (`secHaut`).
2. **Bouton « Personnaliser » (`btnPersonnaliserPdf` / `btnPersonnaliserXXL`)** :
   **SUPPRIMÉ**. L'accès au grand aperçu se fait uniquement par « Aperçu à
   taille réelle » (décision Denis 2026-09-02, revue §A.4).
3. **Word « Ordre dans la ligne d'expérience » (`ordredatesposte`, dates / poste)** :
   **GARDÉ**, logé dans « Ce qui s'affiche » › Détails (`secAffiche` T/d).
4. **Aide interne de l'iframe PDF (`btnAidePdf` / `btnFermerAidePdf`)** :
   **SUPPRIMÉE**, remplacée par l'encart « ce que le PDF permet » de la maquette
   dans le grand aperçu.
5. **« Mettre en évidence »** : on garde les **6 cases réelles** du code
   (souligné + italique × poste / dates / entreprise). Le libellé « Poste en
   gras » de la maquette est une erreur de maquette : à corriger en « Poste
   souligné » à l'implémentation. Pas de nouveau code de rendu (pas de « gras »).
6. **Bloc photo** (inclure / retirer / changer / ajouter) : les 4 contrôles sont
   **GARDÉS**, logés dans « Le haut de la page » › Détails (`secHaut` T/d), tels
   quels. « Recadrer / forme / taille / bordure » (`INVENTAIRE_REGLAGES_CV`
   §J.9) reste une tâche ultérieure, hors de ce chantier.

7. **Tirage de modèle aléatoire AUTOMATIQUE à la 1re visite (Word,
   `js/app.js` ~30483, `tirerModeleAleatoireXXL`)** : **RETIRÉ** — décision
   Denis « a1 » du 2026-09-03 (sous-étape 4a). La première impression du CV
   devient le **défaut harmonisé** (défauts du PDF, établi une fois par
   `_appliquerReglagesMiseEnPageCV`), prévisible, conforme à la phrase de la
   maquette v6 (« Sans rien régler, le CV part avec une mise en page
   propre »). Le tirage au hasard **reste disponible en bouton** (« Style au
   hasard » / « Propose-moi un modèle »), jamais imposé à l'arrivée. La
   désactivation est conditionnée à l'existence de `dossier.reglagesMiseEnPageCV`
   (le nouveau système), donc réversible.

---

## 9. Défauts à reprendre À L'IDENTIQUE

- **PDF** `_PDF_ETAT_DEFAUT` (`cvPdfPanneauReglages.js` ~3255) : ~66 clés.
  Points vérifiés (`INVENTAIRE_REGLAGES_CV` §J.4) : police = **Segoe**, largeur
  « métier visé » = **32 %**, les 6 « mettre en évidence » = **false**, colonnes
  = **2**, accent `#2f6690` / clair `#d9e8f2`, fond colonnes = **droite**,
  dégradé = **foncé → clair**, bandeau en-tête = **activé**, titres =
  **soulignés**, style compétences = **pastille**, coins = **non arrondis**,
  position libre = **activée**, disposition = **3 colonnes**, ordre expériences =
  **pertinence**, taille = **11**, échelle par rubrique = **100 %**, Sobre =
  **inactif**.
- **Word** `etatApercuInline.cv.reglagesProjetXXL` (défaut, `js/app.js` ~25772) :
  `coloration: 'aucune'`, icônes off, `strategieForcee: 'chronologique'`,
  `blocMisEnAvant: null`, `regroupementActif: false`, `formatPage: 'A4'`,
  `taillePct: 100`. Police par défaut Word = celle du **modèle** (souvent Arial).
- **A5** (`INVENTAIRE_REGLAGES_CV` §J.6) : fond colonnes A5 = **droite**,
  en-tête inversée A5 = **off**, remplir la page = **off**, échelle A5 = **11**.
- Les curseurs (`regEchelle`, `regLargeurAccrocheLibre`, `regLargeurMetierLibre`,
  `regEchelleA5`) restent **continus** (pas de 0,5) dans le modèle canonique,
  même si la maquette les montre en jetons (revue 3.1).

---

## 10. Bilan

- **67 `reg*` PDF** : tous ont une case dans la maquette. 0 orphelin.
- **29 `data-projetxxl-*` Word** : tous logés, sauf `entete-inversee` (§8-1).
- **Rangée de boutons** : 2 fusions majeures (dé, mise en page), 3 suppressions
  tranchées (`Personnaliser` PDF+Word, aide iframe, « Permuter l'en-tête » Word).
- **Manipulation directe** : intégralement gardée, rhabillée dans le grand
  aperçu.
- **Ajouts maquette** : 8 familles (interligne / marges / alignement / liste
  rubriques / ordre rubriques / annuler-refaire / veuves / avert N&B) +
  placeholder « mon style ».
- **6 points tranchés** par Denis le 2026-09-03 (§8). Inventaire figé.
