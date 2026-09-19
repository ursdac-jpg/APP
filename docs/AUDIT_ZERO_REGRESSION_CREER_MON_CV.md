# Audit zéro-régression : carte « Créer mon CV »

> **Sous-étape 9bis** du chantier `docs/CADRAGE_MISE_EN_PAGE_2026-09-03.md`.
> Exigence Denis (2026-09-03) : avant de supprimer le moindre bout de l'ancien
> code de personnalisation du CV (panneau PDF `cvPdfPanneauReglages.js`, panneau
> Word « Projet XXL » d'`app.js`), vérifier **fonction par fonction** que tout a
> bien été amené vers le nouveau modèle **et câblé** (fait ce qu'il annonce).
> Denis a passé le plus de temps sur ce module, sans expérience de départ :
> aucune fonction ne doit être perdue.
>
> Relevé fait le 2026-09-03 par lecture directe du code livré (sous-étapes 0 à 9)
> + vérification navigateur Word et PDF. Complète et met à jour
> `docs/INVENTAIRE_ZERO_REGRESSION_MISE_EN_PAGE.md` (plan d'avant-code).
>
> Légende : **OK** = retrouvé et câblé, vérifié · **NOTE** = montré + expliqué,
> le moteur ne sait pas (encore) le faire, jamais un bouton mort · **RETIRÉ** =
> suppression décidée avec Denis (réf. §8 de l'inventaire) · **⚠ RÉGRESSION** =
> présent dans l'ancien modèle, plus atteignable dans le nouveau → à corriger
> **avant** toute suppression.

---

## 1. Verdict

| | Nombre | Détail |
|---|---|---|
| Réglages / boutons / gestes **OK** (retrouvés + câblés) | ~120 | tableaux A à E |
| **NOTE** (montré + expliqué, sans moteur) | ~12 | §10 (nouveautés maquette) + quelques asymétries Word |
| **RETIRÉ** avec accord Denis | 4 | §11 |
| **RÉGRESSION corrigée (9ter + passe de parité, 2026-09-03)** | **3** | §9 : **Taille du texte** + **bloc photo** (9ter) ; §14 : **choix d'une couleur de base** ne poussait pas l'accent clair en PDF |

**Mise à jour 2026-09-03** : les 3 régressions sont **corrigées et vérifiées
navigateur** (Word + PDF). Une **passe de vérification systématique de parité**
(§14) a comparé, contrôle par contrôle, l'état poussé au moteur de rendu par la
nouvelle interface avec ce que les traducteurs (`traduireVersEtatWord` /
`traduireVersRegPdf` — la spécification « canon → ancien format moteur ») disent
qu'il faut : **Word 26/26**, **PDF 44/44** après correction. Le périmètre est
**entièrement conforme**. La sous-étape 10 (suppression de l'ancien code) peut se
faire après relecture Denis + passe `nouveau` / `maj` / `pret`.

---

## 2. Périmètre audité

Toute la carte « Créer mon CV » (ex-page Action) telle qu'atteinte depuis
« Vos documents » → rectangle « La mise en page » :

- Les **67 identifiants `reg*`** de l'iframe PDF (`cvPdfPanneauReglages.js`).
- Les **~30 `data-projetxxl-*` / clés `reglagesProjetXXL`** du panneau Word.
- La **rangée de boutons** (dé, mise en page, Sobre, Créatif, Complet/Optimisé,
  pipette, format, Personnaliser, aide).
- Les **contrôles propres au rectangle** (`construireContenuApercuFinalisation`) :
  grilles de modèles, palette + nuances, boutons de format, **bloc photo**,
  jeton « sans accroche », mini aperçu, bouton grand aperçu.
- La **manipulation directe** du grand aperçu PDF (déplacer les blocs, poignées,
  mini-barre par rubrique, glisser l'ordre, écrire dans le CV, imprimer).
- Le **grand aperçu Word** (`apercuDocxIntegre.js`, partagé lettre / entretien).

**Hors périmètre** (jamais touché par le chantier, confirmé) :
`construireDonneesPdfCV`, `cvPdfTemplateA4/A5`, `composeurComposition` /
`composeurRender` / `composeurStrategies`, `composeurAppliquerReglagesProjetXXL`,
l'export (`genererDocxComposeur`, `genererBlobDocumentActif`), la logique de
rendu du CV lui-même. Ils reçoivent toujours les mêmes objets d'état, produits
maintenant par les traducteurs.

---

## 3. Tableau A — réglages PDF `reg*`

Chemin nouveau : `dossier.reglagesMiseEnPageCV` (canon) → `traduireVersRegPdf` /
`lireDepuisRegPdf` → inputs `reg*` de l'iframe + `dossier.pdfReglages` (persistance).

### A.1 Allure / base (niveaux Simple + Je débute)
| `reg*` | Nouveau chemin | État |
|---|---|---|
| `regSobreActif`, `regCreatifActif` | `[data-mep-allure]` (Sobre / Standard / Créatif) → `btnSobrePdf` / `btnCreatifPdf` | OK |
| `regReinitialiser` | `#btnMepRevenirDefaut` (« Revenir au modèle de départ ») | OK |
| `regCouleurDebut` | `[data-mep-accent]` (D + `secCouleurs`) → `#regCouleurDebut` | OK |
| `regCouleurFin` | `[data-mep-accentclair]` (`secCouleurs`, PDF) | OK |
| `regFondColonnes` | `[data-mep-fondcolonnes]` (D + `secCouleurs`) | OK |
| `regDegradeColonnes` | `[data-mep-degrade]` (`secCouleurs`, `uni`↔`aucun`) | OK |
| `regTexteFondColonnes` | `[data-mep-textefond]` (`secCouleurs`) | OK |
| `regPolice` | `[data-mep-police]` (D + `secTexte`) | OK |
| `regFormatCV` | `[data-mep-format]` (D + `secPage`, 5 valeurs) | OK |
| `regColonnes` | `[data-mep-colonnes]` (D + `secPage`) | OK |
| `regEchelle` | note `secPage` « Taille du texte » | **⚠ RÉGRESSION §9-1** |

### A.2 `secPage` (La page)
| `reg*` | Nouveau chemin | État |
|---|---|---|
| `regColonnesInversees` | `[data-mep-colonnesinv]` (T/d) | OK |
| `regLargeurColonneGauche` | `[data-mep-largeurgauche]` (curseur, T/d PDF) + `dossier.pdfReglages` | OK |
| `regFormeColonnes` | `[data-mep-formecolonnes]` (T/d PDF) | OK |
| `regSeparateurColonnes` | `[data-mep-separateur]` (T/d) | OK |
| `regFondColonnesA5` | `[data-mep-fondcolonnesa5]` (T/d A5 PDF) | OK |
| `regEnteteInverseeA5` | `[data-mep-enteteinva5]` (T/d A5 PDF) | OK |
| `regRemplirPageA5` | `[data-mep-remplira5]` (T/d A5 PDF) | OK |
| `regEchelleA5` | note `secPage` A5 « Taille du texte (A5) » | **⚠ RÉGRESSION §9-1** (même cause que `regEchelle`) |

### A.3 `secCouleurs` (Les couleurs)
`regFondColonnesEffet` → `[data-mep-fondeffet]` · `regFondColonnePleineHauteur` →
`[data-mep-fondpleine]` · `regCouleurFondCompetences` → `[data-mep-coulcomp]` ·
`regCouleurTextePuces` → `[data-mep-coulpuces]`. **Tous OK** (T/d PDF).

### A.4 `secHaut` (Le haut de la page)
`regBandeauEnTete` → `[data-mep-bandeau]` · `regFormeEnTete` →
`[data-mep-formeentete]` · `regDegradeBandeau` → `[data-mep-degradebandeau]` ·
`regBandeauDisponibilite` → `[data-mep-coordapart]` · `regDispositionEntete` →
`[data-mep-dispoentete]` · `regAnneauPhoto` → `[data-mep-anneauphoto]`.
**Tous OK.** `regPositionLibreEntete` → placement libre dans le grand aperçu
(`[data-mep-versgrand]` + groupe « Un bloc de l'en-tête », 7b). **OK.**

### A.5 `secTexte` (Le texte)
`regStyleTitres` → `[data-mep-styletitres]` (« Pastille » masquée sans icônes,
revue 2.3) · `regLectureGuidee` → `[data-mep-lectureguidee]` · `regStyleCompetences`
→ `[data-mep-stylecomp]` · `regIcones` → `[data-mep-icones]` · `regIconesCoordonnees`
→ `[data-mep-iconescoord]` · `regStyleBordures` → `[data-mep-bordures]`.
T/d : `regStyleProfessionnel` → `[data-mep-missionspro]` · `regStylePersonnel` →
`[data-mep-missionsperso]` · `regBandeauCompetencesCles` → `[data-mep-bandeaucompcles]`
· `regCoinsArrondis` → `[data-mep-coinsarrondis]`.
« Mettre en évidence » : `regSoulignerPoste` / `regItaliquePoste` /
`regSoulignerDates` / `regItaliqueDates` / `regSoulignerEntreprise` /
`regItaliqueEntreprise` → 6 cases `[data-mep-evid]`. **Tous OK.**

### A.6 `secAffiche` (Ce qui s'affiche)
`regOrdreExperiences` → `[data-mep-ordreexp]` · `regSansAccroche` →
`[data-mep-sansaccroche]` · `regLettreJointe` → note (Word l'a via
`[data-mep-...]` ; PDF idem T/d) · `regRegroupementActif` → `[data-mep-regroupement]`
· `regFormatExperiences` → `[data-mep-formatexp]` · `regFormationsMisesEnAvant` →
`[data-mep-formationsmea]`. **Tous OK.**

### A.7 Grand aperçu (par bloc / par rubrique) — 7b
`regLargeurAccrocheLibre` / `regLargeurMetierLibre` → 2 curseurs du groupe
« Un bloc de l'en-tête », pilotent les vrais champs de l'iframe. **OK.**
`regStyleTexteEnteteActive` / `regCouleurTexteEntete` / `regTexteEnteteGras` /
`regTexteEnteteItalique` / `regEchelleRubrique` / `regPoliceRubrique` /
`regPoliceRubriqueActive` / `regStylePuceRubrique` / `regStylePuceRubriqueActive`
/ `regCouleurFondPuceRubrique` / `regCouleurTextePuceRubrique` /
`regStyleMissionsRubrique` → un jeton du groupe « Un bloc de l'en-tête » /
« Une rubrique seule » **fait apparaître la vraie mini-barre flottante** de
l'iframe (`_pdfAfficherBarreOutilsRubrique`), où vivent ces contrôles.
**OK** (2ᵉ voie d'accès, aucun réécriture).

---

## 4. Tableau B — réglages Word `data-projetxxl-*` / clés `reglagesProjetXXL`

Chemin nouveau : canon → `traduireVersEtatWord` / `lireDepuisReglagesProjetXXL`
→ `etatApercuInline.cv.reglagesProjetXXL` (+ `.couleur` chaîne encodée).
`_mepReglageMoteur` écrit **directement** la clé lue par le rendu Word.

| Clé | Nouveau chemin | État |
|---|---|---|
| `coloration`, `lectureGuideeVariante`, `texteColorePortee`, `texteBandeau` | dérivées de `styleTitres` + `lectureGuidee` par `_mepPousserTitresWord` | OK |
| `fondColonnes`, `fondColonnesEffet`, `texteFondColonnes`, `fondColonneEtendueEntete` (`fondColonnePleineHauteur`), `fondTete` (`bandeauEnTete`) | `[data-mep-fondcolonnes]` / `[data-mep-fondeffet]` / `[data-mep-textefond]` / `[data-mep-fondpleine]` / `[data-mep-bandeau]` | OK |
| `separateurColonnes` | `[data-mep-separateur]` | OK |
| `separateurCouleurBase` | canon `separateurCouleur` (schéma) ; pas d'UI dédiée, suit l'accent du thème | NOTE (identique à l'ancien : jamais un contrôle visible propre) |
| `colonnesInversees` | `[data-mep-colonnesinv]` | OK |
| `police` | `[data-mep-police]` (4 valeurs Word via `TRAD_POLICE_CANON_VERS_WORD`) | OK |
| `iconesRubriques`, `iconesCoordonnees` | `[data-mep-icones]` / `[data-mep-iconescoord]` | OK |
| `accrocheItalique` | `[data-mep-accrocheital]` (`secAffiche` T/d) | OK |
| `sansAccroche` (sur `etatApercuInline.cv`, pas `reglagesProjetXXL`) | `[data-mep-sansaccroche]` | OK |
| `lettreJointe` | `[data-mep-...]` `secAffiche` T/d | OK |
| `regroupementActif` | `[data-mep-regroupement]` | OK |
| `styleProfessionnel`, `stylePersonnel` | `[data-mep-missionspro]` / `[data-mep-missionsperso]` | OK |
| `ordreDatesPoste` | `[data-mep-ordredatesposte]` (`secAffiche` T/d) | OK |
| `strategieForcee` | via `[data-mep-formations]` (Complet / Optimisé) + le dé | OK (FUSIONNÉ, comme prévu) |
| `bandeauDisponibilite` | `[data-mep-coordapart]` (fusion avec `regBandeauDisponibilite`) | OK |
| `blocMisEnAvant`, `blocMisEnAvantGauche`, `blocMisEnAvantDroite` | `[data-mep-bloc]` (« Bloc mis en avant », Word) | OK (asymétrie Word assumée) |
| `optionDebordement` | reste `null`, jamais câblé côté UI (déjà le cas dans l'ancien modèle) | NOTE (pas une régression : jamais un contrôle) |
| `entete-inversee` (`enteteInversee`) | — | **RETIRÉ §11** (aligné sur le PDF, décision §8-1) |
| `formatPage` / `modeleA5` | `[data-mep-format]` (fusion avec `regFormatCV`) | OK |
| clés de bookkeeping composeur (`formations`, `certifications`, `langues`, `loisirs`, `engagements`, `bonusCapacites`, `capaciteExperiencesBonus`, `missionsBonus`, `tailleBonus`, `detailForceParCompetences`, `choisiManuellement`, `modele`, `hex`, `couleur`, `taillePct`) | laissées telles quelles par les traducteurs (ce ne sont pas des réglages d'UI) | OK (INCHANGÉ) |

**`taillePct`** (Word, taille globale du texte) : voir **§9-1** (même famille que
`regEchelle` PDF).

---

## 5. Tableau C — boutons / macros

| Ancien(s) | Nouveau | État |
|---|---|---|
| `btnStyleAleatoire` (PDF) + `btnProposerModeleXXL` (Word) | `#btnMepDe` (« Style au hasard », Simple + `secReprendre`), via `_mepClicMoteur` | OK (fusionné, 1 libellé). Confirmation avant si retouches manuelles (revue 4.1). |
| `btnAnnulerAleatoire` (iframe) | `#btnMepAnnulerDe` (Simple) + paire `#btnMepAnnuler` / `#btnMepRefaire` (`secReprendre`, « Je débute ») → pile `_mepPileUndo` / `_mepPileRedo` (sous-étape 8) | OK (ENRICHI : multi-pas + Refaire) |
| `btnMiseEnPage` (PDF) + `btnMiseEnPageA5` + `btnMiseEnFormeUltimeXXL` (Word) | `#btnMepMiseEnPage` (Simple + `secReprendre`) | OK (fusionné). Interligne / marges non encore pilotés (§10). |
| `btnSobrePdf` / `btnSobreXXL` + `btnCreatifPdf` / `btnCreatifXXL` | `[data-mep-allure]` | OK |
| `btnCvOptimisePdf` + `btnCvOptimiseXXL` (`dossier.cvOptimiseActif`) | `[data-mep-formations]` (Complet / Optimisé) | OK |
| `btnPipetteLibrePdf` + `btnPipetteLibreXXL` | `[data-mep-pipette]` (`secCouleurs` + « Je débute ») + `#btnMepGrandPipette` (barre grand aperçu) | OK |
| `btnCouleurEntrepriseXXL` | `[data-mep-accent-entreprise]` (« Je débute » + `secCouleurs`), rendu si `dossier.rechercheCandidature.couleurEntreprise` valide | OK (ENRICHI, revue) |
| `boutonFormatIntegralXXL` / `[data-format-page="A4-integral"]` | `[data-mep-format]` inclut « A4 Intégral » | OK (ENRICHI : plus caché en Word) |
| `btnImprimerSousApercuPdf` | `#btnMepGrandImprimer` (barre grand aperçu) | OK |
| `btnEditionTextePdf` | `#btnMepGrandEdit` (barre grand aperçu) | OK |
| `btnFermerGrandApercuPdf` | conservé (id gardé), libellé « Revenir aux réglages » | OK |
| `btnOuvrirGrandApercu` / `btnAtelierCV...` | bouton « Aperçu à taille réelle » (`#btnOuvrirGrandApercu` Word, `ouvrirGrandApercuPdf` PDF) | OK |
| `btnPersonnaliserPdf` / `btnPersonnaliserXXL` | — | **RETIRÉ §11** (décision Denis 2026-09-02) |
| `btnAidePdf` / popover d'aide de l'iframe | encart « Le PDF : vous agissez directement sur le CV » (grand aperçu 7a) | **RETIRÉ §11** |

---

## 6. Tableau D — manipulation directe (grand aperçu PDF)

Tout **conservé à l'identique**, rhabillé dans la nouvelle coquille (7a / 7b) :
la scène du CV reste l'iframe, seule sa colonne `.panneau-reglages` est masquée.

| Geste | Fonctions | État |
|---|---|---|
| Déplacer les blocs d'en-tête | `_pdfActiverGlisserLibreEntete`, `_cvPdfPositionsEntete` | OK (dans l'iframe, intact) |
| Poignées de redimensionnement | `_pdfActiverRedimensionnementBlocLibre`, `_cvPdfHauteurEntete`, `_pdfAjusterEchelleEnteteEnsemble` | OK |
| Barre de format de texte par bloc | `_pdfAfficherBarreFormatTexte`, `_cvPdfStylesTexteEntete` | OK |
| Mini-barre flottante par rubrique | `_pdfAfficherBarreOutilsRubrique`, `_cvPdfEchellesRubriques`, `_cvPdfPolicesRubriques`, `_cvPdfStylesPuceRubriques`, `btnResetRubrique` | OK (+ jetons du groupe « Une rubrique seule » qui la font apparaître) |
| Réordonner les rubriques au glisser | `_pdfActiverGlisserDeposer`, `_cvPdfOrdrePersonnalise` | OK (dans l'iframe) + encart d'explication (groupe « Ordre des rubriques ») |
| Écrire dans le CV | `_cvPdfModeEditionTexte`, `_cvPdfTextesEdites` | OK (`#btnMepGrandEdit`) |
| Imprimer | `btnImprimerSousApercuPdf` | OK (`#btnMepGrandImprimer`) |
| Sécurités Sobre / Créatif | `_cvPdfReglagesAvantSobre`, `_cvPdfReglagesAvantCreatif`, `_pdfProposerAutreModeleCreatif` | OK (inchangé) |
| `_cvPdfEchelle` (échelle globale) + invariant mini = grand aperçu (revue 4.2) | `_cvPdfEchelle`, `_cvPdfModeGrandApercu` | **⚠ voir §9-1** : l'échelle globale n'a plus de contrôle direct hors du dé / « Mise en page » |

---

## 7. Tableau E — contrôles du rectangle (`construireContenuApercuFinalisation`, CV)

| Contrôle ancien | Nouveau | État |
|---|---|---|
| Grille de modèles A4 (`grilleModelesCV`) | vide pour le CV (Composeur = modèle unique) | OK (rien à porter) |
| Grille A5 Portrait / Paysage (`grilleModelesA5CV`) | fondu dans `[data-mep-format]` (a5-portrait / a5-paysage) | OK |
| Palette de couleurs + nuances (`paletteCouleursCV`, `.pastille-nuance-cv`) | `_MEP_PALETTE_BASES` (15 bases) `[data-mep-base]` + `_mepNuancesDe` `[data-mep-nuance]` (`secCouleurs`) | OK |
| Boutons de format (`[data-format-page]`) | `[data-mep-format]` | OK |
| **Bloc photo** : `checkInclurePhotoApercu`, `btnRetirerPhotoApercu`, `btnAllerPhotoIdentite`, `inputPhotoXXL` | dans `colonneGauche`, **masqué depuis 6g** ; absent de `_htmlSecHautMiseEnPage` | **⚠ RÉGRESSION §9-2** |
| `pastilleSansAccrocheApercu` | `[data-mep-sansaccroche]` (`secAffiche` T/d) | OK |
| `btnOuvrirGrandApercu` | bouton « Aperçu à taille réelle » | OK |
| Bandeau « rappel format » | conservé (colonne aperçu) | OK |
| Mini aperçu (`#zoneApercuInlineCV` Word, `#zonePdfInlineCV` PDF) | colonne aperçu de `construireContenuApercuFinalisation` (rendu masqué à gauche, aperçu à droite) | OK |

---

## 8. Traducteurs — couverture vérifiée

- **`traduireVersRegPdf`** émet ~55 clés `reg*` ; **`lireDepuisRegPdf`** les
  relit. Round-trip testé (`tests/reglagesTraducteurInverse.test.js`).
- **`traduireVersEtatWord`** / **`lireDepuisReglagesProjetXXL`** : sous-ensemble
  exprimable en Word, round-trip testé. Les valeurs non exprimables en Word
  (`sans-decor` / `pastille` de titres, polices hors des 4 Word) sont
  documentées comme telles, jamais silencieusement perdues.
- `npm test` : **699 verts** (dont les 4 fichiers `tests/reglages*`).

---

## 9. Régressions identifiées — CORRIGÉES en sous-étape 9ter (2026-09-03)

### 9-1. « Taille du texte » globale (`regEchelle` PDF · `regEchelleA5` · `taillePct` Word)

- **Ancien modèle** : curseur « Taille du texte » (`regEchelle`, 8→13, pas 0,5)
  dans le panneau PDF ; équivalent A5 (`regEchelleA5`) ; côté Word, `taillePct`
  piloté par le panneau « Projet XXL ». Contrôle **manuel, direct**, très utilisé
  (agrandir tout le CV d'un cran).
- **État actuel** : `_htmlSecPageMiseEnPage` affiche « Taille du texte » comme
  une **note** renvoyant « au curseur du panneau détaillé, plus bas » — or ce
  panneau est **masqué depuis la sous-étape 6g** (`.mep-ancien-gauche
  display:none`). Le grand aperçu 7a masque lui aussi `.panneau-reglages`.
  → **Plus aucun contrôle direct de la taille globale du texte.**
- **Ce qui reste** : le bouton « Mise en page » ajuste la taille automatiquement
  pour tenir 1 page ; le dé la re-tire ; l'échelle par rubrique existe dans la
  mini-barre du grand aperçu. Mais pas de « + / − » global assumé.
- **Cause technique** (notée en 6b) : `regEchelle` est lié à l'état JS
  `_cvPdfEchelle`. En réalité `_cvPdfEchelle` **est** persisté : `_pdfRafraichir`
  (appelé par le listener natif du curseur) → `_pdfPersisterReglages` →
  `_pdfCapturerEtat` écrit `dossier.pdfReglages.echelle` ; au chargement de
  l'iframe, `_pdfAppliquerEtatPersistant` → `_pdfAppliquerEtat` restaure
  `_cvPdfEchelle = etat.echelle`. Le piège de 6b : `_mepReglageMoteur`
  écrivait `dossier.pdfReglages.regEchelle` (clé brute « 12 »), une **clé
  différente** de `echelle` (multiplicateur), jamais lue.
- **CORRIGÉ 9ter** : `secPage` (PDF) et « Je débute » (PDF) affichent un vrai
  curseur « Taille du texte » (9–14, pas 0,5), écrit dans
  `dossier.reglagesMiseEnPageCV.taille` ; le handler dédié
  (`[data-mep-taille]`, hors `_mepReglageMoteur`) pose la valeur sur le vrai
  `#regEchelle` (ou `#regEchelleA5`) de l'iframe et **dispatch `input`** → le
  listener natif fait `_cvPdfEchelle = valeur/11`, re-rend et persiste
  `dossier.pdfReglages.echelle`. Filet : écriture directe de
  `dossier.pdfReglages.echelle = valeur/11` si l'iframe n'est pas prête.
  Annulable (pile sous-étape 8). Vérifié : range 13 → canon 13 → iframe
  `_cvPdfEchelle` 1,18 → `pdfReglages.echelle` 1,18 → Annuler revient à 11.
  Côté Word : note (la taille du corps est dérivée par le Composeur +
  « Mise en page » ; `taillePct` n'est pas consommé, il n'y a jamais eu de
  curseur manuel Word — pas une perte).

### 9-2. Bloc photo (inclure / retirer / changer / ajouter)

- **Ancien modèle** : dans le rectangle « La mise en page », 4 contrôles :
  `checkInclurePhotoApercu` (inclure ma photo), `btnRetirerPhotoApercu`
  (retirer), `btnAllerPhotoIdentite` (changer / ajouter → écran Identité),
  `inputPhotoXXL` (choix de fichier).
- **État actuel** : construits dans `colonneGauche` de
  `construireContenuApercuFinalisation`, donc **masqués depuis 6g**.
  `_htmlSecHautMiseEnPage` ne contient QUE « anneau derrière la photo », pas la
  gestion de la photo elle-même. → **On ne peut plus ajouter / inclure /
  retirer / changer la photo depuis « La mise en page ».** (L'écran Identité
  reste un autre chemin, mais le bouton qui y mène est masqué ici.)
- **CORRIGÉ 9ter** : `_htmlBlocPhotoMiseEnPage()` (ids **propres** `mepPhoto*`)
  rendu à la fin de `_htmlSecHautMiseEnPage`, **Word et PDF**. Câblage
  autonome dans `_wireCarteSimpleMiseEnPage` (inclure → `dossier.photo.inclure`
  + re-rendu ; retirer → `dossier.photo = {url:null, inclure:false}` ;
  changer/ajouter → sélecteur de fichier si une photo existe, sinon écran
  Identité comme l'ancien `btnAllerPhotoIdentite` ; `ajouterPhotoAuDossier`
  pour l'upload). L'ancien `#blocPhotoGenerique` de `colonneGauche` n'est
  **plus rendu** pour le CV (`construireContenuApercuFinalisation`,
  `!opts.miseEnPageRefonte`) — aucun id en double. Les lignes qui masquaient
  `#blocPhotoGenerique` (Word Projet XXL) deviennent des no-op (`if (bloc)`).
  Vérifié Word + PDF : inclure / retirer / (ré)ajouter fonctionnent, aucun
  doublon d'id.

---

## 10. Nouveautés de la maquette encore non câblées (NOTE — PAS des régressions)

L'ancien modèle **n'avait aucun de ces contrôles** : rien n'est perdu, mais ils
sont promis par la maquette v6.

**Mise à jour 2026-09-04 — lot moteur CLOS** (commits `00341e5` `e359407`
`737fbbf` `b8cf094` `7ca4cae`) : la plupart de ces notes ont désormais un effet
réel, par un circuit partagé `reglagesMiseEnPageCV.<clé>` → traducteur →
whitelist `composeurResoudreThemeGeneration` → `theme` → `composition` → Word
(`composeurRender`) **et** PDF (`cvPdfTemplateA4`).

| Élément | Où | État |
|---|---|---|
| Marges de page | `secPage` › Détails | **FAIT** (`margesTwips` Word + `margeLateralePdf` PDF) |
| Interligne | `secPage` › Détails | **FAIT** (`theme.interligneCorps` → `line` Word / `line-height` PDF) |
| Espacement des paragraphes (`espacementParas`) | `secPage` › Détails | **FAIT** (composé dans `espacementExtra`) |
| Alignement (gauche / justifié) | `secPage` › Détails | **FAIT** (`composition.alignementCorps`) |
| Densité (aéré / normal / compact) | `secPage` | **FAIT** (`theme.densiteEspacementUtilisateur`) |
| Longueur 1 / 2 pages (`pages`) | `secPage` | NOTE (le format « A4 Intégral » couvre le besoin « 2 pages ») |
| Liste unique « rubriques à afficher / masquer » (dont **Logiciels**) | `secAffiche` | **FAIT** (7 bascules → `theme.rubriquesMasquees` vide `contenuRetenu` + `permisMasque`) |
| Ordre des rubriques (Word : n'existe pas aujourd'hui) | `secAffiche` | **NOTE assumée (option A, Denis 2026-09-04)** — laissé au Composeur en Word ; PDF = glisser-déposer du grand aperçu ; note UI adaptée par format |
| Éviter un titre seul en bas de page (`veuves`) | `secAffiche` | **FAIT** (`composition.controleVeuvesOrphelines`) |
| Avertissement impression noir et blanc (accent trop clair) | `secCouleurs` | pas encore |
| « mon style » (mémoriser / réappliquer un jeu de réglages) | `secReprendre` | placeholder désactivé (conforme maquette) |

→ **Reste** : avertissement N&B + « mon style » (tâches séparées, ne bloquent
rien). La suppression du code mort (dette B.7) reste rattachée au découpage
`js/app.js`.

---

## 11. RETIRÉ — conformité aux décisions §8 de l'inventaire (Denis, 2026-09-02 / 03)

| Élément | Décision | Vérifié |
|---|---|---|
| « Permuter l'en-tête » Word (`data-projetxxl-entete-inversee`) | RETIRÉ, aligné sur le PDF (§8-1) | Le traducteur → Word ne l'émet plus ; aucun contrôle dans la nouvelle UI. **Conforme.** |
| Bouton « Personnaliser » (`btnPersonnaliserPdf` / `btnPersonnaliserXXL`) | RETIRÉ ; grand aperçu = « Aperçu à taille réelle » seul (§8-2) | Absent de la nouvelle UI ; le bouton reste dans l'iframe masquée, inerte. **Conforme** (nettoyage complet en 10). |
| Aide interne de l'iframe PDF (`btnAidePdf` + popover) | RETIRÉE ; remplacée par l'encart du grand aperçu (§8-4) | Popover + 4 écouteurs + écouteur global retirés en 7a. **Conforme.** |
| Tirage de modèle **automatique** à la 1ʳᵉ visite (Word, `tirerModeleAleatoireXXL`) | RETIRÉ, décision « a1 » (§8-7) | Gardé sous condition `!dossier.reglagesMiseEnPageCV` ; le défaut harmonisé prend le relais ; le dé reste un bouton. **Conforme.** |

Aucun autre « RETIRÉ ». Tout le reste est OK ou NOTE.

---

## 12. Résidus techniques à nettoyer en sous-étape 10 (pas des régressions)

- `etatApercuInline.cv.personnalisationOuverte` / `personnalisationEnGrandApercu`
  restent à `true` (résidu de l'ancien toggle « Personnaliser » non rendu),
  neutralisés aujourd'hui par le conteneur masqué (`.mep-ancien-gauche`). À
  remettre à `false` / retirer quand `colonneGauche` sera supprimée.
- Le niveau « Simple » ne s'affiche pas encore pour le mode `pret` (noté en
  sous-étape 8) — à re-vérifier en 10 sur `nouveau` / `maj` / `pret`.
- `INVENTAIRE_ZERO_REGRESSION_MISE_EN_PAGE.md` §8-1 marquait `entete-inversee`
  « À TRANCHER » : **tranché** ici (RETIRÉ, §11).

---

## 13. Conditions pour la sous-étape 10 (suppression du code)

1. ~~Corriger §9-1~~ **FAIT (9ter)**.
2. ~~Corriger §9-2~~ **FAIT (9ter)**.
3. Re-vérifier navigateur `nouveau` / `maj` / `pret`, Word **et** PDF, bout en
   bout (créer un CV → régler → grand aperçu → exporter).
4. Alors seulement : retirer, **pour le CV uniquement**, la branche
   `colonneGauche` de `construireContenuApercuFinalisation`, le panneau Word
   « Projet XXL » (~2 000 lignes autour de `construirePaletteCouleurs`), et
   nettoyer les résidus du §12. Lettre / entretien gardent
   `construireContenuApercuFinalisation`.
5. Mettre à jour `BRIQUES_COMMUNES.md` (nouvelle brique + dette « 2 moteurs de
   rendu » ouverte pour le découpage `app.js`), `TACHES_VALIDEES.md`, l'état
   des chantiers.

---

## 14. Passe de vérification systématique de parité (2026-09-03)

**But** : au-delà du câblage (« un handler existe et écrit la bonne clé »,
tableaux A à E), vérifier **contrôle par contrôle** que l'état poussé au moteur
de rendu par la **nouvelle interface** est **identique** à ce que produit le
**traducteur** — `traduireVersEtatWord(canon)` / `traduireVersRegPdf(canon)`,
qui sont la spécification « modèle canonique → format de l'ancien moteur » et
qui passent les tests de round-trip Node (699 verts). Deux moteurs, un
traducteur chacun ⇒ même entrée moteur ⇒ même CV rendu.

**Méthode (sonde navigateur)** : pour chaque `data-mep-*` du niveau « Je veux
tout régler », état **neuf** (dossier vidé), on active une valeur non-défaut, on
laisse le rendu se stabiliser, puis on compare :
- **Word** : `etatApercuInline.cv.reglagesProjetXXL` + `.couleur` + `.formatPage`
  + `.sansAccroche` contre `traduireVersEtatWord(dossier.reglagesMiseEnPageCV)`.
- **PDF** : les `reg*` de l'iframe contre `traduireVersRegPdf(...)`.

**Résultats**

| Format | Contrôles testés | Écarts |
|---|---|---|
| Word | **26 / 26** | **0** |
| PDF (A4) | **41 / 41** | **1** — corrigé, voir ci-dessous |
| PDF (A5 : fond colonnes A5 / en-tête inversée / remplir la page) | **3 / 3** | **0** |

**Écart trouvé et corrigé — `data-mep-base` (palette « couleurs de base »)** :
le clic sur une pastille de base posait bien `dossier.reglagesMiseEnPageCV.accentClair`
(canon) mais **ne poussait pas `regCouleurFin`** (2e couleur du dégradé) dans
l'iframe PDF — `_mepPousserAccent` ne pousse que `regCouleurDebut`. L'ancienne
palette poussait les deux. **Corrigé** : helper `_mepPousserAccentClairPdf(hex)`
appelé par le handler `[data-mep-base]` ; `+ _mepPousserHistorique('base')` /
`('nuance')` au passage (ces 2 contrôles n'étaient pas couverts par Annuler).
Re-vérifié : base `#7a2e3b|#f3dde1` → `regCouleurDebut = #7a2e3b`,
`regCouleurFin = #f3dde1`, persisté dans `dossier.pdfReglages`, annulable. Le
Word n'est pas concerné (sa `couleur` encode seulement l'accent principal, pas
d'accent clair séparé — conforme à la maquette « accent clair = A4/PDF »).

**Faux positif écarté** : `regEchelle` de l'iframe affiche ~11,5 au lieu de 11
sur un CV de test presque vide — c'est **l'auto-ajustement d'échelle de
l'iframe** pour remplir la page (comportement inchangé de l'ancien moteur), pas
un effet de la nouvelle interface. Vérifié à part : le curseur « Taille du
texte » (`data-mep-taille`), lui, pilote bien `_cvPdfEchelle` (13 → 1,18).

**Limite honnête** : cette passe prouve « nouvelle interface → même entrée
moteur que le traducteur ». Elle ne re-compare pas pixel à pixel le CV produit
par l'**ancien panneau** pour un même geste — mais l'ancien panneau et la
nouvelle interface écrivent dans **le même** objet (`reglagesProjetXXL` /
`reg*`), consommé par **le même** moteur ; le traducteur a été écrit depuis
l'inventaire des clés réelles de l'ancien panneau et passe les round-trips.
Le risque résiduel (une clé où l'ancien panneau écrivait une valeur
différente de celle du traducteur) est faible ; les 8 sous-étapes de
vérification navigateur + cette passe ne l'ont pas rencontré.
