# Inventaire complet : le CV en Word (existant) et le CV en PDF (source de vérité), 2026-09-26

> **But** : préparer le chantier « CV en Word repris depuis le PDF » (cahier de chantier : `docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md`).
> **Mode A** : lecture et essais hors dépôt uniquement. **Aucun fichier de code de l'application n'a été modifié** pour produire ce document.
> **Règle de Denis (2026-09-26)** : le PDF est la source de vérité. Tout ce qui existe aujourd'hui dans le Word (code, écrans, réglages) **n'est pas conservé** ; on reprend du PDF les conditions, la logique, le design, le style et les proportions, avec un maximum de fonctions. Les modèles A5 seront traités dans un chantier à part.
> **Méthode** : lecture directe du code (jamais de supposition), essais réels avec Word installé sur cette machine (voir § 5).

---

## 1. Résumé en dix lignes

1. Le CV en PDF est rendu par **une seule fonction** (`_pdfConstruireMaquette`, `modules/cv-pdf-html/cvPdfTemplateMaquette.js`) qui produit du HTML + CSS. Ce HTML est ensuite ajusté par des scripts dans l'aperçu (mise à l'échelle, « Mise en page », positions libres). **Le résultat final n'existe que dans le DOM de l'aperçu.**
2. Les **25 modèles** (1 Standard, 5 Sobre, 19 Créatif) sont 16 gabarits + des combinaisons de réglages. Tous les réglages agissent sur ce même HTML.
3. Les **données du CV** (quelles rubriques, quels textes, quels plafonds) viennent du même pipeline que le Word actuel (`normaliserDonneesCV`, `composeurComposer`). Le contenu est donc déjà identique par construction ; seule la présentation change.
4. Le Word actuel est un **autre moteur** (`composeurRender.js`, bibliothèque `docx.js`), avec son propre panneau de réglages (« Projet XXL »), ses propres thèmes et ses propres limites (pas de diagonale, pas de dégradé, pas de forme arrondie). Il est **entièrement remplaçable** : le code CV-Word représente environ 4 500 lignes dans `js/app.js` et environ 6 000 lignes de fichiers dédiés (hors bibliothèques).
5. Une partie du code Word est **partagée** avec la lettre de motivation et la préparation d'entretien (même bibliothèque, mêmes palettes de couleurs, même aperçu). **Elle ne doit pas être supprimée** (voir § 2.5).
6. **Faisabilité vérifiée par essai réel dans Word** (§ 5) : rectangles arrondis avec texte, contour, dégradé de couleur, polygone en diagonale placé derrière le texte, tableau sans bordure aux largeurs exactes, interligne exact, sauts de ligne identiques à ceux du navigateur. **Verdict provisoire : GO** pour reproduire le design du PDF dans Word (réserves au § 4.3).
7. Le point dur n'est pas le dessin, c'est **l'alignement du texte** entre deux moteurs de mise en page (navigateur et Word) et **le maintien sur une page** : d'où un banc d'essai automatique (Word piloté, PDF de Word comparé au navigateur) à construire en premier.
8. Pour rester **lisible par les logiciels de recrutement** (ATS) et modifiable par la personne, **tout le texte doit rester du vrai texte Word** (paragraphes, tableaux, cadres de paragraphe), jamais dans des zones de texte flottantes. Seuls les décors (fonds, formes, diagonales, vagues) sont des formes.
9. Les **pastilles arrondies** de compétences (texte dans un fond arrondi qui suit le texte) ne peuvent pas être reproduites à l'identique en Word : approximation à choisir avec Denis (§ 4.3, décision D3).
10. Word de Denis (« Fiche démarche à la reprise d'emploi.docx ») est **ouvert** sur cette machine : mes essais ont utilisé des instances de Word séparées et invisibles ; le document de Denis n'a pas été touché.

---

## 2. Le Word actuel (à remplacer)

### 2.1 Ce que voit la personne aujourd'hui

Trois entrées, un seul générateur (`genererBlobDocumentActif('cv')`, `js/app.js` ~28171) :

| Entrée | Où | Ce qui s'affiche |
|---|---|---|
| « Finaliser mon CV » (fin du Bilan) | `ouvrirAtelierCV` / `htmlAtelierCV`, `js/app.js` ~26000 | Écran de choix **Word ou PDF** (2 cartes : « Word : moins de liberté sur les couleurs et la mise en page... »), puis onglet Word : aperçu intégré (`docx-preview`), panneau de réglages Word, format (A4 Détaillé / Essentiel / Intégral), photo, « sans phrase d'accroche », section « Exporter mon CV » |
| Page « Résultats » (accordéon « Aperçu et finalisation ») | `pageResultats`, `construireContenuApercuFinalisation` ~15668 | Même écran de choix, mêmes onglets |
| Grand aperçu Word (plein écran) | `ouvrirApercuDocxIntegre('cv', ...)`, `modules/cv-editor/apercuDocxIntegre.js` | Rendu du vrai .docx par `docx-preview`, panneau Projet XXL épinglé par-dessus |

Sorties : « Télécharger le Word » (`cv.docx`), « Envoyer par mail », texte à copier, JSON, CSV. En cas d'échec, repli sur `html-docx.js` (`exporterDocumentEnDocx`).

### 2.2 Ce que produit le Word actuel

- Un seul « modèle » interne, `composeur`, décliné en thèmes `sobre`, `institutionnel`, `moderne` et `projetxxl` (le seul réellement réglable), 11 couleurs x 10 nuances (`coloriationDocxNatifCV.js`), 3 formats A4 (Détaillé, Essentiel, Intégral 2 pages) + Mini CV A5.
- Mise en page par **tableaux à 1 ou 2 colonnes** ; en-tête « à 2 zones » ; pas de forme (le code le dit : « docx.js ne sait pas faire de diagonale », `js/app.js` ~33707).
- Un **moteur de rééquilibrage propre au Word** : mesure de hauteurs de colonnes sur l'aperçu `docx-preview`, « Optimisation ultime » (`activerMiseEnFormeUltimeXXL`), déplacement de blocs entre colonnes, bonus de capacités. Le PDF a son propre équivalent (« Mise en page », `_pdfAjusterMiseEnPage`) : c'est celui-là qui reste.

### 2.3 Fichiers de code Word (lignes mesurées le 2026-09-26)

| Fichier | Lignes | Rôle | Sort prévu |
|---|---|---|---|
| `modules/cv-composeur/composeurRender.js` | 2 228 | Construit le document Word du Composeur (tableaux, en-têtes, blocs) | **Supprimé** à la phase finale |
| `modules/cv-composeur/composeurMoteur.js` | 178 | `genererDocxComposeur` (orchestration) + `composeurAppliquerRegroupementExperiences` | `genererDocxComposeur` supprimé ; **`composeurAppliquerRegroupementExperiences` est utilisé par le PDF** (`cvPdfDonnees.js`) : à déplacer avant toute suppression |
| `modules/cv-editor/exportDocxNatifCV.js` | 604 | 16 anciens modèles Word + **`chargerLibrairieDocxNatif`** (chargeur de la bibliothèque, utilisé aussi par lettre et entretien) | Anciens modèles supprimés ; le chargeur est **conservé** (déplacé dans un petit fichier partagé) |
| `modules/cv-editor/exportDocxNatifCV_NouveauxModeles.js` | 427 | Modèles Impact, Dispo, Créatif (anciens) | Supprimé (inatteignable : seul `composeur` est proposé pour le CV) |
| `modules/cv-editor/exportDocxNatifCV_Chic.js` | 212 | Modèle Chic (ancien) | Supprimé (idem) |
| `modules/cv-editor/coloriationDocxNatifCV.js` | 225 | Palettes de couleurs `PALETTES_COULEURS_CV`, recoloration | **Palettes conservées** (lettre et entretien les utilisent) ; recoloration CV supprimée |
| `modules/cv-editor/formatA5CV.js` | 435 | Formats A4 Essentiel et A5 (contenu recadré) + aiguillage `genererDocxNatifCVFormat` | **Conservé jusqu'au chantier A5** ; nettoyé ensuite |
| `modules/cv-editor/miniCvA5.js` | 39 | Utilitaires photo (`_dnDataUrlVersOctets`, `_dnTypeImagePhoto`) | Conservé tant que lettre / A5 les utilisent |
| `modules/cv-editor/apercuDocxIntegre.js` | 871 | Aperçu Word intégré (CV, **lettre, entretien**) | Branches CV supprimées ; branches lettre et entretien **conservées** |
| `modules/cv-editor/docx-preview.js` | 4 008 | Bibliothèque d'aperçu .docx | Conservée tant que lettre / entretien l'utilisent |
| `modules/cv-editor/html-docx.js` | 13 215 | Bibliothèque de repli (HTML vers Word) | À décider : utilisée en repli pour tous les documents |
| `modules/cv-editor/docx.umd.js` | 23 076 | Bibliothèque `docx` (lettre, entretien, ancien CV) | Conservée (lettre, entretien) |
| `modules/cv-editor/jszip.min.js` | 12 | Compression (utile au futur écrivain .docx) | **Réutilisée** |
| `modules/cv-mise-en-page/reglagesTraducteurs.js` | 578 | Modèle canonique vers Word (`traduireVersEtatWord`, `traduireVersReglagesProjetXXL`) et vers PDF (`traduireVersRegPdf`) | Partie Word supprimée ; partie PDF conservée |
| `js/app.js` (zones Word) | environ 4 500 | Voir ci-dessous | Supprimé ou réécrit, jamais sans `grep` du dépôt entier |

Zones de `js/app.js` propres au CV en Word (numéros de ligne au 2026-09-26, à revérifier par `grep` avant toute suppression) :

- `construireContenuApercuFinalisation` (~15668 à ~16188) : accordéon Word/PDF.
- `genererBlobDocumentActif` (~28171 à ~28290) : génération du .docx (et lettre, entretien : **à séparer**).
- `composeurResoudreThemeGeneration` et aides Projet XXL (~33987 à ~34600) : **utilisées aussi par le PDF** (`cvPdfDonnees.js` appelle `composeurResoudreThemeGeneration`) : **conserver** ; les fonctions de rééquilibrage Word (`mesurerHauteursColonnesXXL`, `essayerRequilibrage*`, `miseAJourConstatDebordementProjetXXL`) sont propres au Word.
- `activerMiseEnFormeUltimeXXL` (~34896, environ 730 lignes) : « Optimisation ultime » Word.
- `_synchroniserPanneauReglagesXXLGrandApercu` (~36010), `initialiserApercuInlineSiOuvert` (~36085).
- `construirePaletteCouleurs` (~36326 à ~38728, environ 2 400 lignes) : le panneau Projet XXL.
- `construireBoutonsFormatPage` (~38728).

### 2.4 Fonctions du Word actuel et sort dans le nouveau Word

Règle de Denis : on ne conserve rien « pour lui-même » ; on garde ce que le PDF fait déjà.

| Fonction du Word actuel | Déjà dans le PDF ? | Sort |
|---|---|---|
| Couleur, nuance, couleur de l'entreprise | Oui (5 teintes, roue, couleur d'entreprise avec correction du contraste, 3 couleurs) | Repris du PDF |
| Thèmes Sobre / Institutionnel / Moderne / Projet XXL | Remplacés par Standard / Sobre (5) / Créatif (19) | Repris du PDF |
| 1 ou 2 colonnes, colonnes inversées, largeur | Oui (colonnes inversées et largeur retirées du PDF par décision C14/C25) | Repris du PDF |
| Formats A4 Détaillé / Essentiel / Intégral | Oui (A4, A4 complet, A4 essentiel) | Repris du PDF |
| Photo (inclure, retirer, changer), sans accroche | Oui | Repris du PDF |
| Lettre jointe (accroche retirée), regroupement « mettre en avant » | Oui (portés dans le PDF) | Repris du PDF |
| Bandeau de disponibilité, bandeau de compétences clés | Oui | Repris du PDF |
| Optimisation ultime, bonus de capacités, rééquilibrage de colonnes | Remplacés par « Mise en page » (auto-ajustement) | Abandonné (le PDF fait mieux) |
| Aperçu intégré du vrai .docx (`docx-preview`) | Non (le PDF a son aperçu HTML) | Décision D2 (§ Cahier) |
| Envoi par mail, texte à copier, JSON, CSV | Sans objet pour le rendu | Conservés (hors CV en Word) |
| Aide (popovers de `apercuDocxIntegre.js`) | Le PDF a la sienne | À reprendre si utile |

### 2.5 Dépendances à ne pas casser (grep du dépôt entier, 2026-09-26)

- `chargerLibrairieDocxNatif` : `js/app.js`, `composeurMoteur.js`, `coloriationDocxNatifCV.js`, `exportDocxNatifCV.js`, `formatA5CV.js`, `formatsLettreEntretien.js`, `exportDocxNatifEntretien.js`, `exportDocxNatifLettre.js`.
- `PALETTES_COULEURS_CV` : `js/app.js`, `composeurTheme.js`, `coloriationDocxNatifCV.js`, `formatA5CV.js`, `formatsLettreEntretien.js`.
- `_dnDataUrlVersOctets` / `_dnTypeImagePhoto` : `composeurRender.js` et les anciens modèles (bientôt supprimés), `miniCvA5.js`.
- `construireObjetCVPourExport` : `js/app.js`, `composeurComposition.js`, `apercuDocxIntegre.js`, `formatA5CV.js`.
- `composeurAppliquerRegroupementExperiences` : **PDF** (`cvPdfDonnees.js`).
- `composeurResoudreThemeGeneration` : **PDF** (`cvPdfDonnees.js`).
- `ouvrirApercuDocxIntegre` : aussi pour la lettre et l'entretien.
- `genererBlocsTexteCV` : `js/app.js`, `exportBlocsTexteCV.js`, `modules/regard-recruteur/index.js`.
- Tests qui touchent du code Word : `tests/composeurAppliquerReglagesProjetXXL.test.js`, `tests/conservationInformations.test.js`, `tests/decouperMissions.test.js`, `tests/reglagesTraducteurInverse.test.js`, `tests/reglagesTraducteurPdf.test.js`, `tests/reglagesTraducteurWord.test.js` (à adapter ou retirer avec le code qu'ils couvrent, jamais avant).

### 2.6 Limites constatées du Word actuel (raisons du remplacement)

Pas de formes (diagonales, vagues, cadres arrondis, médaillon), pas de dégradé, pas de style « Créatif » comparable au PDF, panneau de réglages à part (double maintenance), moteur de rééquilibrage à part, aperçu approximatif par bibliothèque tierce, textes de l'interface qui opposent Word et PDF (« Moins de liberté sur les couleurs... », `js/app.js` 16120 et 26122 ; « Dégradé : un effet que Word ne sait pas faire », `js/app.js` 17098).

---

## 3. Le PDF, source de vérité

### 3.1 Chaîne de rendu (à connaître pour extraire le design)

```
dossier + réglages (dossier.pdfReglages, _cvPdfChoixMq, dossier.reglagesMiseEnPageCV)
   -> construireDonneesPdfCV()            (contenu : même pipeline que le Word actuel)
   -> _pdfLireOptions()                   (réglages -> options `opts`)
   -> _pdfConstruireResultatCourant()     (format A4 / A4 complet / A4 essentiel / A5)
   -> _pdfConstruireMaquette(objetCV, composition, opts, gabarit)   -> { css, pageHtml }
   -> _pdfRaccourcirAutomatiquement()     (raccourcit les missions si le CV déborde)
   -> _pdfInjecterResultat()              (place le HTML dans l'iframe #conteneurPage)
   -> _pdfMqApresRendu()                  (positions libres, hauteurs d'en-tête et de rectangles)
   -> scripts de l'iframe                 (échelle, zoom par rubrique, corrections de texte, croix des compétences, ordre)
   =>  DOM FINAL = ce que la personne voit et imprime
```

Conséquence décisive pour le Word : **il faut extraire le design du DOM final** (positions, tailles, couleurs réellement calculées), sous peine de refaire, en double, toute la logique d'ajustement du PDF.

Trois « fenêtres » montrent le même état : petit aperçu (`#zonePdfInlineCV`), plein écran (`#iframeGrandApercuPdf`), impression (`ouvrirGrandApercuPdf`). Pour le Word, une **quatrième instance cachée** de la même page sera créée à l'export.

### 3.2 Les 25 modèles

**Gabarits** (`opts.gabaritMaquette`) : `''` (Standard), `bandeau`, `diagonale`, `colonne`, `cadre`, `picto`, `lateral`, `neutre`, `rectangles`, `photo`, `frise` (rendu par le même moteur), et les variantes Sobre `sobre-bandeau`, `sobre-fond`, `sobre-epure`, `sobre-rectangles`, `sobre-photo`.

| # | Allure | Modèle (nom affiché) | Gabarit | Particularités de décor à reproduire en Word |
|---|---|---|---|---|
| 1 | Standard | Standard | `''` | Trait de couleur sous l'en-tête, titres en capitales soulignés, pastilles de compétences |
| 2 | Sobre | Bandeau pâle | `sobre-bandeau` | En-tête sur fond pâle avec filet, titres soulignés |
| 3 | Sobre | Fond pâle | `sobre-fond` | Blocs ou colonne sur fond pâle |
| 4 | Sobre | Épuré | `sobre-epure` | Sans fond, trait fin |
| 5 | Sobre | Photo et frise | `sobre-photo` | Colonne photo, frise (trait vertical, points), teinte assombrie |
| 6 | Sobre | Rectangles arrondis | `sobre-rectangles` | Rectangles à contour, barres en trait |
| 7 | Créatif | Bandeau entier | `bandeau` | Fond plein ou dégradé derrière l'en-tête |
| 8 | Créatif | Bandeau diagonal | `diagonale` | Polygone (bas incliné), dégradé |
| 9 | Créatif | Colonne colorée | `colonne` | Colonne de droite sur fond coloré, coins arrondis |
| 10 | Créatif | Cadre de page | `cadre` | Cadre intérieur de 3 mm, en-tête centré, trait entre colonnes |
| 11 | Créatif | Titres à pictogrammes | `picto` | Filet de 5 px en haut, titres avec pictogramme rond |
| 12 | Créatif | Colonne et frise | `frise` | Coin diagonal en haut à droite, colonne bleutée, photo ronde, frise (trait + points) |
| 13 | Créatif | Photo et frise | `photo` | Colonne photo, nom sous la photo, frise avec dates à gauche |
| 14 | Créatif | Rectangles arrondis | `rectangles` | Rectangles pleins (nom, titre), rectangles à contour, trois rectangles de compétences **qui se chevauchent**, barres arrondies, losanges |
| 15 | Créatif | Colonne à vague | `lateral` + `colonneVague` | Colonne pleine hauteur au bord ondulé, pastilles d'expérience en « pilule » |
| 16 | Créatif | Ruban diagonal | `diagonale` + `bandeauEnTete` | Bandeau diagonal dégradé |
| 17 | Créatif | Duo ovale | `bandeau` | Blocs de compétences encadrés arrondis |
| 18 | Créatif | Cadre et barre | `cadre` + `cadrePage` | Bordure de page de 5 px, en-tête centré, titres en barre |
| 19 | Créatif | Pastille | `picto` + `filetHaut` | Titres en pastille (pictogramme dans un rond), filet haut |
| 20 | Créatif | Bandeau vertical | `bandeau` + `nomVertical` | Bande verticale de 12 mm avec le nom en **texte vertical** |
| 21 | Créatif | Triangle du savoir | `bandeau` + forme « coin » | En-tête en triangle |
| 22 | Créatif | Vague marine | `bandeau` + `enteteVague` | Bord d'en-tête ondulé (37 points) |
| 23 | Créatif | Diagonales contrastées | `diagonale` + `bandeauEnTete` | Deux teintes contrastées en diagonale |
| 24 | Créatif | Losange vert | `neutre` + `photoForme: losange` | Photo en losange, compétences « en barre » |
| 25 | Créatif | Médaillon | `bandeau` + `photoMedaillon` | Photo ronde à cheval sur le bord du bandeau |

Chaque modèle **peut recevoir n'importe quel réglage** (police, couleur, marges, 1 ou 2 colonnes, icônes...). Le Word doit donc être vérifié sur des **combinaisons**, pas seulement sur 25 images (voir protocole de vérification du cahier).

### 3.3 Le contenu : déjà commun

`construireDonneesPdfCV()` (`cvPdfDonnees.js`) réutilise `normaliserDonneesCV`, `appliquerMoteurDecisionCV`, `composeurAnalyserProfil`, `composeurAppliquerRegles`, `composeurComposer`. Le Word actuel les utilise aussi. Les règles de contenu (plafonds levés en A4 détaillé et complet, rubriques masquées annoncées, certifications structurées, dates avec mois, lieu) sont donc **déjà partagées** : le nouveau Word ne les recodera pas.

### 3.4 Réglages du PDF (95 familles d'attributs `data-mep-*`) et statut attendu en Word

**Légende** : **A** = automatique (le réglage change le DOM, l'extracteur le suit, aucun code Word propre) ; **B** = demande un traitement explicite dans le Word ; **C** = outil d'édition du PDF, sans objet dans Word ; **D** = approximation ou limite (à annoncer).

| Carte / zone | Contrôles | Statut | Remarque pour le Word |
|---|---|---|---|
| Barre du haut | Revoir les choix (assistant), Aperçu en plein écran | C | Interface |
| | Revenir au modèle de départ, Un autre modèle, Style au hasard | A | Changent l'état, donc le DOM |
| | Mise en page (auto-ajustement) | A / B | Le résultat est mesuré dans le navigateur ; le Word doit reproduire les **mêmes tailles** avec marge de sécurité (§ Cahier, risque R1) |
| | Annuler / Refaire | C | |
| Couleurs | 5 pastilles, couleur de l'entreprise (max 3), couleur personnalisée, pipette | A | Les couleurs sont lues dans les valeurs calculées |
| | **Dégradé** | A (était D) | Faisable en Word (remplissage dégradé) ; **le texte « un effet que Word ne sait pas faire » sera à retirer** |
| Allure générale | Sobre / Standard / Créatif + galerie (5 + 19) | A | |
| Organisation | Standard / Personnaliser (ordre des blocs), blocs courts côte à côte ou l'un sous l'autre, compétences en haut, formations avant expériences, afficher les centres d'intérêt, deux colonnes, réduire les espaces, agrandir les titres | A | Les côte à côte deviennent des tableaux |
| | Icônes sur les rubriques, icônes sur les coordonnées | B | Pictogrammes SVG transformés en images |
| | Compétences en pastilles / rectangles / texte | B / D | Voir décision D3 |
| Expériences | Mode chronologique / par compétences / mixte, expériences à afficher, niveau de détail, mois, ordre, missions par expérience, éditer les expériences, style des missions, souligné / italique par partie, lieu et style du lieu | A | Contenu et styles de texte |
| | Position des dates (droite / sous / avant) | A / B | « À droite » = tabulation à droite |
| | « Modifier mes expériences et leurs missions » (zone dépliante) | C | Interface |
| Formations | Choix, missions, style G / I / S, affichage, espacement, une ligne ou dessous | A | |
| Éléments supplémentaires | Compteurs de compétences, « Choisir », logiciels, langues, certifications, centres d'intérêt, listes sur 2 colonnes, informations complémentaires | A / B | Listes sur 2 colonnes = tableau à 2 cellules |
| | Titre du CV, phrase d'accroche, sans accroche | A | |
| Mise en page et texte | Police (11 polices), taille du texte et des titres, en-tête à taille fixe, interligne, marges 8 / 10 / 14 mm | B | Polices : voir risque R4 ; marges = marges de section |
| | Fond de colonne, texte justifié, trait entre colonnes, petits carrés devant les coordonnées | A / B | Fonds = formes derrière le texte |
| Format | A4, A4 complet, A4 essentiel | A | A4 complet = plusieurs pages, la pagination est faite par Word |
| | Mini CV A5 portrait / paysage et leurs réglages | **Hors périmètre** | Chantier A5 ultérieur (décision de Denis) |
| Réglages supplémentaires | Densité, espacement des paragraphes, texte noir ou blanc sur fond, effet du fond, colonne pleine hauteur, couleurs des puces, bandeau d'en-tête et son dégradé, coordonnées à part, anneau de la photo, style des titres, lecture guidée, bordures, coins arrondis, bandeau de compétences clés, veuves et orphelines, lettre jointe, regroupement, format des expériences | A / B | Coins arrondis = formes ; anneau de photo = contour de l'image |

### 3.5 Outils du plein écran

| Outil | Statut Word | Remarque |
|---|---|---|
| Modifier le texte (corrections propres au CV) | A | Les corrections sont déjà dans le DOM : le Word les reprend telles quelles |
| Croix « retirer » d'une compétence, flèches monter / descendre une expérience | A | Effet visible dans le DOM |
| Glisser-déposer l'ordre des rubriques | A | Idem |
| Mini-barre par rubrique (taille, interligne, couleur des pastilles, gras / italique / couleur du nom, du titre, de l'accroche) | A | Valeurs calculées lues telles quelles |
| **En-tête libre** (déplacer, élargir, hauteur) et **rectangles de compétences** (déplacer, hauteur) | B | Blocs à position absolue : voir « cadres de paragraphe » au cahier (décision D4) |
| Cadre rouge, poignées, repère de fin de page, flèches de réglage fin | C | Jamais exportés (déjà exclus de l'impression) |

### 3.6 Constructions CSS du rendu et équivalent Word

| Construction dans le PDF | Où | Équivalent Word | Difficulté |
|---|---|---|---|
| `display:flex; justify-content:space-between` (poste à gauche, dates à droite) | expériences | Tabulation à droite | Facile |
| `display:grid` en colonnes (36 % / 1fr, en-tête à 3 colonnes, « paires ») | corps, en-tête | Tableau sans bordure aux largeurs mesurées | Moyenne |
| Grille superposée avec `z-index` et marges négatives | trois rectangles de compétences | Formes décor + textes en cadres de paragraphe | **Difficile** |
| `column-count: 2` | listes courtes | Tableau 1 ligne x 2 cellules équilibrées | Moyenne |
| Fond uni, fond dégradé (`linear-gradient`), `color-mix()`, `var()` | colonnes, bandeaux, blocs | Formes à remplissage uni ou dégradé ; ombrage de cellule ; **valeurs déjà résolues par le navigateur** | Facile à moyenne |
| `border-radius` sur un bloc | rectangles, colonnes, blocs encadrés | Rectangle arrondi (forme) derrière le texte | Moyenne |
| `border-radius` sur du texte en ligne (pastilles) | compétences | **Non reproductible à l'identique** : fond rectangulaire sur le texte, ou autre solution | **Limite (D)** |
| `clip-path: polygon(...)` | diagonales, vagues, coin, colonne en biais, photo losange | Forme à contour libre (polygone) | Moyenne |
| Pseudo-éléments `::before` (carrés des coordonnées, puces ✦ ❖ ➢ •, points de la frise, traits) | nombreux | Caractères colorés dans le texte, ou petites formes | Facile à moyenne |
| Frise : `border-left` + point | frises | Bordure gauche de paragraphe + point (forme ou caractère) | Moyenne |
| `text-transform: uppercase`, `letter-spacing`, `text-align: justify` | titres, nom | Capitales, espacement des caractères, justification (le texte reste tel que saisi) | Facile |
| `writing-mode: vertical-rl` | bandeau vertical | Cellule de tableau à texte vertical | Moyenne |
| `position:absolute` | en-tête libre, médaillon, décors | Cadres de paragraphe / formes ancrées à la page | Moyenne |
| SVG en ligne (icônes) | rubriques, coordonnées | Images (PNG produits dans le navigateur) | Moyenne |
| `<img>` photo (recadrée, ronde, losange, anneau) | en-tête, colonne | Image PNG pré-découpée (masque) + contour | Moyenne |
| `box-shadow` (cadre intérieur, anneau) | cadre, photo | Contour de forme | Facile |
| `zoom` par rubrique, échelle globale | mini-barre, « Mise en page » | Facteurs cumulés appliqués aux tailles | Moyenne |
| `line-height` | tout | Interligne **exact** en points | Facile |
| `break-inside: avoid`, `break-after: avoid` | items, titres | « Ne pas séparer », « Garder avec le suivant » | Facile |
| Règles `@media print` (poignées cachées) | plein écran | Sans objet | - |

### 3.7 Polices du PDF (`_PDF_POLICES`)

Segoe UI, Georgia, Verdana, Garamond, Arial, Calibri, Times New Roman, Tahoma, Trebuchet MS, Book Antiqua / Palatino Linotype, Segoe Script. Toutes présentes avec Word sous Windows. Sous Mac, LibreOffice ou Google Docs, certaines seront remplacées (Segoe UI, Garamond, Book Antiqua, Segoe Script surtout) : **risque R4**, à annoncer, pas à masquer.

---

## 4. Points de vigilance issus de l'inventaire

### 4.1 Lisibilité par les logiciels de recrutement (ATS)

L'application propose un module « Les mots de votre CV (ATS) ». Un CV Word dont le nom et les coordonnées seraient dans des **zones de texte** est mal lu par beaucoup d'ATS. Règle du chantier : **aucun texte dans une zone de texte ou une forme** ; textes = paragraphes, cellules de tableau ou **cadres de paragraphe** (positionnés mais toujours du corps du document). Les formes sont réservées au décor et n'ont pas de texte. Un test automatique le vérifiera (aucune balise de zone de texte dans le document).

### 4.2 Deux moteurs de mise en page différents

Le navigateur et Word n'arrondissent pas de la même façon : **Word n'accepte les tailles de police que par demi-points** (9, 9,5, 10...), alors que le PDF varie en continu (12,5 px = 9,375 pt ; l'échelle automatique produit d'autres valeurs). Sans précaution, un CV « tenu sur une page » dans le PDF pourrait déborder de quelques millimètres dans Word. Parades prévues : interligne exact mesuré, arrondi calibré par police, marge de sécurité en bas de page, vérification automatique sur banc d'essai (§ 5).

### 4.3 Ce qui ne sera pas identique (à annoncer honnêtement à Denis)

| Élément | Pourquoi | Solution proposée |
|---|---|---|
| Pastilles arrondies inline (compétences) | Un fond arrondi qui suit le texte en ligne n'existe pas en Word | D3 : (a) fond rectangulaire sur le texte, modifiable (recommandé) ; (b) une petite forme arrondie par pastille avec le texte en cadre, plus fidèle mais fragile à la modification ; (c) image, non modifiable (refusé) |
| Rectangles de compétences qui se chevauchent | Le texte reste modifiable, la forme ne suit pas si on ajoute du texte | Décor + texte en cadres ; hauteur suffisante prévue |
| Position libre à la souris (en-tête libre) | Dans Word, le texte positionné doit rester du texte du corps | Cadres de paragraphe (D4) |
| Rendu identique au pixel près | Deux moteurs, polices calibrées seulement | Objectif mesuré : lignes à moins de 2 mm en largeur et 3 mm en hauteur (médiane sous 1 mm), même nombre de pages |
| Word sur téléphone, Google Docs | Formes souvent ignorées ou dégradées | Le texte reste lisible et en ordre (vrai texte) ; à annoncer |
| Aperçu dans l'application | Une bibliothèque tierce dessine mal les formes | D2 : montrer l'aperçu HTML du PDF (identique au design) plutôt qu'un aperçu Word approximatif |

---

## 5. Essais de faisabilité réalisés (2026-09-26, hors dépôt)

Outillage : Word 16 piloté en arrière-plan (instance séparée, invisible, minuteur de sécurité), export PDF de Word, rendu du PDF en image via l'API Windows, comptage des lignes par `pdftotext -layout`. Fichiers d'essai dans le dossier temporaire de session (non versionnés).

| Essai | Résultat |
|---|---|
| Pilotage de Word (ouvrir un .docx, le convertir en PDF, compter les pages) | **Fonctionne** |
| Rectangle **arrondi**, rempli, avec texte blanc centré | **Rendu correct** dans Word |
| Rectangle arrondi blanc à **contour** de couleur avec texte | **Rendu correct** |
| **Polygone en diagonale** avec **dégradé** de deux couleurs, placé **derrière le texte** et pleine largeur de page | **Rendu correct** ; le texte du corps s'affiche par-dessus |
| Forme produite par la bibliothèque `docx.js` telle quelle | **Word refuse d'ouvrir le fichier** (XML de la forme invalide). **Conséquence : les formes seront écrites directement en XML** par un écrivain maison |
| Variante avec balise de compatibilité `mc:AlternateContent` + `w:pict` vide | **Word se bloque** à l'ouverture. **Conséquence : formes « directes » sans cette balise** |
| Sauts de ligne Word contre navigateur : 3 paragraphes de 200 à 230 caractères, cellules de 300 et 420 px, police à 9,5 pt (12,5 px = 9,375 pt), interligne exact 12,94 pt, marges de cellule à zéro, polices Arial, Georgia, Calibri | **Mêmes nombres de lignes dans les 6 cas comparés** avec 9,5 pt ; avec 9 pt (arrondi vers le bas), 3 cas sur 6 divergent. **Enseignement : l'arrondi doit être étalonné par police**, pas fixé une fois pour toutes |

**Verdict provisoire : GO** sur la faisabilité du décor et de l'alignement du texte. Restent à mesurer, en phase 0 du cahier : un vrai CV complet sur plusieurs modèles, la constance de la pagination, le comportement d'une modification par la personne (ajout de texte), et l'ouverture dans LibreOffice.

Risque annexe noté : une session de Word appartenant à Denis est ouverte pendant les essais. Les essais automatiques lancent leur **propre** instance et ne ferment jamais celle de Denis ; néanmoins, pendant les phases de test, il est préférable que ses documents Word soient enregistrés.

---

## 6. Ce que cet inventaire ne couvre pas encore (à faire en phase 0)

- Le rendu réel des 25 modèles sur les dossiers d'essai (images de référence du PDF, prises dans le navigateur, à conserver pour comparer).
- La liste exhaustive des **valeurs CSS calculées** réellement rencontrées (à obtenir en balayant les 25 modèles avec l'extracteur de la phase 2).
- Le comportement de `zoom` (par rubrique) dans les valeurs calculées du navigateur.
- Les CV multi-pages (A4 complet) : où Word coupe par rapport au navigateur.
