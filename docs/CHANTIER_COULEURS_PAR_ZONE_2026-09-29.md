# Chantier : changer la couleur de chaque zone d'un CV créatif (plein écran) - 2026-09-29

> Cahier de suivi. **État : code livré pour les modèles « maquette » (voir « ÉTAT DU CODE » en bas), reste le 2e temps et la validation de Denis.**
> Mode A (décision de conception). Maquette manipulable : `docs/MAQUETTE_COULEURS_PAR_ZONE_2026-09-29.html`.

## La demande de Denis (2026-09-29)
1. Dans le plein écran, cliquer sur les zones colorées d'un modèle créatif (exemple « Colonne et frise » : la colonne de gauche bleue) et
   choisir leur couleur dans les réglages de droite : palette, **pipette**, code couleur.
2. Pour **tous** les modèles créatifs (colonnes, bandeaux, triangles, cadres...).
3. Un raccourci dans les **options rapides** (organisation du CV) : garder **liées** ou **dissocier** la couleur du triangle / bandeau du haut
   et celle de l'écriture des titres.

## Décisions déjà prises par Denis
- **Les deux déclenchements** : bouton « Modifier les couleurs » (surligne toutes les zones avec leur nom) ET clic direct sur un fond coloré.
  Règle anti-conflit (proposée par Claude) : le clic direct ne s'active que sur les fonds sans autre fonction ; texte, photo et blocs gardent leur rôle.
- **Périmètre** : modèles simples d'abord (moteur « maquette »), formes (vagues, diagonales, rubans) ensuite.

## Audit du code réel (ce qui est vrai aujourd'hui)
- « Colonne et frise » (`cvPdfTemplateMaquette.js`) : le triangle du haut (`.fr-coin`) et les titres suivent `var(--cv)` (palette) ; la colonne de gauche
  (`.fr-lat`, `#93aac6`) et le petit coin (`.fr-coin2`, `#5f7288`) sont des couleurs **écrites en dur** : la palette ne peut pas les changer.
- Moteur « maquette » : environ 19 fonds en couleur fixe et 25 liés à la palette (`var(--cv)`, `var(--cv2)`). Une variable `couleurSecondaire`
  (`--cv2`) existe déjà.
- Modèles « de l'application » (`cvPdfTemplateA4.js`, environ 10 : vagues, diagonales, rubans) : formes (`clip-path`, SVG) et dégradés
  (`couleurDebut` / `couleurFin`) ; environ 20 constructions de formes. Zones plus délicates : 2e temps.
- La **pipette existe** (`btnPipetteLibrePdf`, `cvPdfPanneauReglages.js` ~5516 : `EyeDropper`, repli saisie d'un code). À réutiliser.
- Le **Word** est fabriqué à partir du rendu PDF (extraction du DOM) : il hérite des couleurs sans code séparé. **À mesurer dans le vrai Word**
  modèle par modèle (outillage : `scripts/word/`, `scripts/word/banc_b7.js`).

## Verdict de faisabilité : GO AVEC RÉSERVES
Simple : moteur « maquette » (registre de zones + variables CSS avec la couleur d'origine en repli). Risqué : modèles à formes et dégradés.
Réserve à lever avant le code : liste exacte des zones de CHAQUE modèle (à faire modèle par modèle, avec Denis).

## Plan par phases (proposé, à valider)
- [ ] P0. Denis valide la maquette et répond aux questions ci-dessous.
- [ ] P1. Socle : registre de zones par modèle, variables CSS `--z-*` (couleur d'origine en repli), stockage dans `_cvPdfChoixMq.couleursZones`
      (persisté avec le CV), panneau de droite (palette, pipette réutilisée, code couleur, « Remettre la couleur d'origine »).
- [ ] P2. Bouton « Modifier les couleurs » + clic direct (règle anti-conflit) dans `cvPdfPleinEcranMaquette.js`.
- [ ] P3. Modèles du moteur « maquette » un par un (Colonne et frise d'abord), chacun vérifié en clair et sombre.
- [ ] P4. Raccourci « couleurs liées / dissociées » dans les options rapides du panneau.
- [ ] P5. Mesure dans le vrai Word de chaque modèle modifié (pages, couleurs, ouverture sans erreur) ; banc `banc_b7.js` inchangé pour les CV sans couleur de zone.
- [ ] P6. Modèles à formes et dégradés (2e temps), après retour d'expérience de P3.

## Questions ouvertes pour Denis
1. « Liées » est-il le réglage **par défaut** (comportement actuel) ? (Recommandé : oui, la dissociation est un choix.)
2. Quand on re-lie, l'écriture reprend la couleur du triangle (maquette). Est-ce bien ce qu'il veut ?
3. Les couleurs de texte secondaires (titres de la colonne, coordonnées) sont-elles des zones à part entière ou suivent-elles la zone voisine ?
4. Où précisément dans l'application le raccourci « options rapides » ? (Carte « Organisation » du panneau de « La mise en page » ?)

## ÉTAT DU CODE (2026-09-29) : socle et interface livrés pour les modèles « maquette » ; reste le 2e temps (formes) et la validation de Denis

Réponses de Denis aux 4 questions (2026-09-29) : « oui » aux 4 (liées par défaut ; en re-liant, l'écriture reprend la couleur du fond ; textes secondaires
suivent la zone voisine ; raccourci dans la carte « Organisation »). Demandes ajoutées : panneau d'apparence proche de l'existant (fait : barre flottante
DANS le plein écran, au style des barres `barre-rub`, composants de la carte « Allure ») ; option **Dégradé** en bas à droite (fait).

- [x] P1 Socle : `modules/cv-pdf-html/cvPdfCouleursZones.js` (registre `_PDF_ZONES_COULEUR`, génération du CSS, testé : `tests/cvPdfCouleursZones.test.js`),
      état dans `_cvPdfChoixMq` (`couleursZones`, `zonesLiees`), appliqué à la fin du CSS des 4 sorties de `cvPdfTemplateMaquette.js`.
- [x] P2 Plein écran (`cvPdfPleinEcranMaquette.js`) : bouton « Modifier les couleurs », zones entourées, clic direct SANS conflit (fond seulement, jamais un texte, une
      photo ou un bloc ; aucun outil actif), barre flottante (pastilles, « Personnalisée », pipette, dégradé, remettre, liées).
- [x] P3 Zones couvertes (audit du DOM des 19 modèles créatifs) : bandeau du haut, colonne colorée, bloc coloré, rectangles + barre, triangle et petit coin et colonne
      de la frise, trait sous le nom, bande verticale du nom, écriture des titres.
- [x] P4 Raccourci « Couleurs liées : fond du haut et titres » dans les options rapides de « Organisation du CV » (grisé en Mini CV A5) ; même fonction que la case de la barre.
- [x] P5 Word mesuré dans le vrai Word : 2 modèles avec couleurs de zone et dégradés : 1 page, vrais dégradés (`gradFill`), aucune erreur. Banc CV : 24/24 identiques
      (aucune couleur de zone choisie = aucun changement).
- [ ] P6 modèles à vagues et diagonales (`modele-app`) : **CORRECTION DU 2026-09-29 : ils utilisent DÉJÀ le même plein écran que les autres** (vérifié sur les 19 modèles :
      `_pdfModeleMaquetteActif()` vrai partout). Mon affirmation précédente (« ils ouvrent l'ancien plein écran ») était fausse. Reste seulement à couvrir leurs zones
      (colonne à vague : `::before` de la page ; titres et lignes en pastille suivent la couleur générale).
- [ ] Validation par Denis (essai sur ses propres CV).

Limites connues, à ne pas oublier : (1) modèles à cadre / pictos / losange / pastille : seuls le trait et les titres sont des zones (leur couleur est un contour, pas un fond) ;
(2) aucune alerte de **contraste** : choisir un fond foncé laisse les petits titres de la colonne (gris-bleu fixe `#5f7288`) peu lisibles ; à traiter avec Denis ;
(3) le petit coin de la frise n'apparaît pas dans le Word (même dans l'export d'origine : défaut existant) ;
(4) correction faite au passage : la remise à zéro des modes à la fermeture du plein écran oubliait `retirerRubrique`.

## Suite du 2026-09-29 (demandes de Denis)
- **Petit coin de la frise absent du Word : CORRIGÉ.** Cause : l'export Word empile les formes dans l'ordre du code HTML, sans tenir compte du `z-index` du PDF
  (la colonne, plus loin dans le code, recouvrait le petit coin). Les formes à `z-index` positif passent maintenant après les autres (`wordExtracteur.js`).
- **Alerte de contraste : FAITE** (`_pdfRatioContraste`, testée ; affichée dans la barre des couleurs, calculée sur les vrais textes de la zone, avec l'extrémité claire du dégradé).
- **Modèles à cadre, pictos, losange, pastille (recommandation de Claude)** : ne pas ajouter de zones « contour » maintenant. Leur couleur suit la couleur générale ; un clic
  sur un titre en mode « Modifier les couleurs » ouvre déjà la couleur générale et la change (cadre, traits et fonds liés compris). À reprendre seulement si Denis veut un contour
  d'une autre couleur que le reste.
- **Même plein écran partout** : déjà le cas (voir P6 ci-dessus).
- **Inventaire « bouton x modèle »** : voir `docs/INVENTAIRE_OPTIONS_PAR_MODELE_2026-09-29.md` (banc `scripts/word/matrice_options.js`).

## DÉCISION de Denis (2026-09-29, fin de séance) : pas de zones « contour »
Pour les modèles à cadre, pictos, losange et pastille, on n'ajoute PAS de zones contour : la couleur se change par la couleur générale (clic sur un titre ou carte « Allure »). Reco de Claude suivie. Aucun code à écrire. Zones de la vague de « Colonne à vague » : faites (commit `c3bc40c`).
