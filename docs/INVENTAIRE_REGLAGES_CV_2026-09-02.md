# Inventaire complet des réglages de mise en page du CV

> Relevé du code existant, pour la maquette « La mise en page ».
> Principe Denis (2026-09-02) : **tout apporter d'abord, écarter ensemble ensuite**.
> Rien de cette liste n'est perdu tant qu'on n'a pas décidé de le retirer.
>
> Sources :
> - **PDF** : `modules/cv-pdf-html/cvPdfPanneauReglages.js` (~3700 lignes, iframe)
>   + `cvPdfTemplateA4.js` / `cvPdfTemplateA5.js` (le rendu qui lit ces réglages).
> - **Word « Projet XXL »** : `js/app.js` (rangée de boutons + sections
>   Structure / Style visuel / Contenu) + `modules/cv-editor/apercuDocxIntegre.js`
>   + `modules/cv-composeur/composeurTheme.js` (`composeurAppliquerReglagesProjetXXL`).

---

## A. Les entrées « zéro effort »

### A.1 🎲 Style aléatoire (PDF) — `_pdfGenererStyleAleatoire`
Un seul clic remplit **~40 réglages** d'un coup, à partir d'une logique
soigneusement construite (jamais un pur hasard) :
- **Palette curée** : 16 paires foncée/claire choisies à la main
  (`_PDF_PALETTE_ALEATOIRE`). La couleur du texte sur fond coloré
  (noir / blanc) est **calculée** par la luminance perceptuelle (formule W3C),
  jamais devinée. Titres de rubrique : garde-fou contraste ≥ 5:1 sur blanc.
- **Anti-répétition** : les champs les plus visibles (colonnes, bandeau en-tête,
  forme colonnes, style titres, dégradé) sont re-tirés en boucle bornée tant que
  le tirage reste trop proche du précédent. Compteur qui force l'alternance si la
  même valeur (colonnes 1/2) sortirait 3 fois de suite.
- **Coordination d'effet** : « fond de colonne pleine hauteur » (35 % des
  tirages) aligne colonnes / bandeau / dégradé / fond pour un effet réellement
  visible (sinon ~94 % de chances de ne rien voir).
- **Repart d'une ardoise vierge** : chaque tirage réinitialise les
  personnalisations manuelles (échelle, ordre, polices/puces par rubrique,
  positions libres d'en-tête, styles de texte d'en-tête...).
- **Exclu du tirage** (choix de contenu, jamais par surprise) : lettre jointe,
  regroupement, format de page, police « artistique » (manuscrite).
- **↩ Annuler 🎲** : restaure l'état complet d'avant le tirage
  (`_cvPdfEtatAvantAleatoire` / `_pdfAnnulerAleatoire`).

### A.2 🎲 « Propose-moi un modèle » (Word) — `btnProposerModeleXXL`
Même esprit, plus resserré : randomise **Structure** + **Style visuel**
(colonnes, colonnes inversées, en-tête inversée, bloc mis en avant, coloration,
nuance, police, icônes, style des missions, ordre dates/poste). Ne touche
**jamais** le **Contenu** (stratégie, lettre jointe, regroupement).

### A.3 🎨 Couleur entreprise (les deux formats)
Si une couleur d'entreprise a été identifiée (assistant ou saisie), un bouton
l'active : le dé ne mélange alors plus que la mise en page, la couleur reste
celle de l'entreprise. `EyeDropper` (pipette navigateur) pour extraire une
couleur d'un autre onglet si aucune n'est connue.

### A.4 Rangée de boutons du haut (PDF) — `carte-outil-pdf`
Ordre réel dans le code :
1. **🎲 Style aléatoire** (voir A.1).
2. **✏️ Personnaliser** (`btnPersonnaliserPdf`) — ouvre le grand aperçu (=
   « Aperçu à taille réelle »). **Denis 2026-09-02 : on ne garde pas ce
   bouton.** L'accès au grand aperçu se fait par « Aperçu à taille réelle »,
   qui doit garder visibles les boutons importants (🎲 / Sobre-Créatif /
   Complet-Optimisé / 🪄 Mise en page).
3. **💧 Pipette couleur** (`btnPipetteLibrePdf`) — `EyeDropper`, prélève une
   couleur n'importe où à l'écran.
4. **🎓 CV Complet / CV Optimisé** (`btnCvOptimisePdf`, booléen partagé
   `dossier.cvOptimiseActif`, identique au bouton Word `btnCvOptimiseXXL`).
   Porte sur **les formations et certifications** :
   - **Optimisé** : ne garde que le diplôme le plus élevé et les
     formations / certifications les plus utiles pour le poste visé.
   - **Complet** : affiche tout le parcours (CAP, brevet, bac, bac+2…).
   *(À garder ? renommer ? Si gardé : ajouter des lignes d'explication —
   décision Denis.)*
5. **🎩 CV Sobre / 🎨 CV Créatif** (`regSobreActif` / `regCreatifActif`).
   « Sobre » = retire pastilles, dégradés, icônes, couleurs flashy (peu de
   couleur mais pas zéro). « Créatif » = recettes prêtes
   (`_PDF_CREATIF_RECETTES`) ; le dé propose alors des CV créatifs entiers,
   jamais des morceaux mélangés.
6. **🪄 Mise en page (1 page)** (`btnMiseEnPage` → `_pdfAjusterMiseEnPage`).
   **Fonction importante.** Remet le CV en page **en fonction du contenu** :
   - trop de contenu → réduit la taille du texte (9→14 px), condense les
     missions, rééquilibre les colonnes ;
   - trop peu de contenu → agrandit texte + en-tête, puis **ajoute du vrai
     contenu** dans l'ordre du Word (missions supplémentaires révélées,
     bonus de capacités par rubrique, regroupement d'expériences) ;
   - déjà bon → le dit.
   Affiche un **message concret** de ce qu'il a fait :
   « Réduit le texte à 10 px pour tenir sur 1 page », « Élargi pour mieux
   remplir la page (2 missions ajoutées, regroupement) », « La mise en page
   actuelle tient déjà bien sur 1 page ». Libellé « Mise en page (jusqu'à
   2 pages) » en format A4 Intégral.
7. **🪄 Mise en page (A5)** (`btnMiseEnPageA5` → `_pdfAjusterMiseEnPageA5`) —
   version dédiée au Mini CV A5 : ajuste la taille du texte pour bien
   remplir sans déborder.
8. **Modifier le texte sur place** (main + stylo) — mode `contenteditable`
   du PDF, dans la barre sombre du haut.

---

## B. Panneau PDF « Personnaliser » — 9 sections, ~67 réglages

### B.1 Format du CV
- `regFormatCV` : A4 Détaillé / A4 Essentiel / A4 Intégral / Mini CV A5 Portrait /
  Mini CV A5 Paysage.

### B.2 Contenu
- `regSansAccroche` : sans phrase d'accroche.
- `regLettreJointe` : une lettre accompagne ce CV.
- `regRegroupementActif` : mettre en avant l'expérience la plus pertinente et
  regrouper les autres (visible seulement si l'assistant a proposé un regroupement).
- `regOrdreExperiences` : pertinence / date décroissante / date croissante /
  poste A→Z / (pertinence x2 dans le tirage).
- `regFormatExperiences` : standard / amélioré.

### B.3 Mise en page
- `regColonnes` : 1 ou 2 colonnes.
- `regFormationsMisesEnAvant` : toutes les formations + la plus pertinente développée.
- `regColonnesInversees` : colonnes inversées.
- `regLargeurColonneGauche` : curseur 30 → 70 % (pas de 5).
- `regFormeColonnes` : rectangle / diagonale.
- `regSeparateurColonnes` : trait entre les colonnes.

### B.4 Couleurs — **le « système plus évolué » de Denis**
- `regCouleurDebut` : **Accent** (sélecteur de couleur natif).
- `regCouleurFin` : **Accent (clair)** — la 2e couleur du dégradé (A4 seulement).
- `regFondColonnes` : droite / gauche / les deux / aucun.
- `regFondColonnesEffet` : fond plein / titres seulement.
- `regDegradeColonnes` : foncé → clair / clair → foncé / couleur unie.
- `regFondColonnePleineHauteur` : fond de colonne du haut de page (sans bandeau).
- `regTexteFondColonnes` : texte blanc / noir sur le fond coloré.
- `regCouleurFondCompetences` : couleur des pastilles de compétences.
- `regCouleurTextePuces` : couleur du texte des pastilles.
- Pipette (`EyeDropper`) pour prélever une couleur ailleurs.
- **Nuances rapides** (côté Word / composeur, `obtenirNuancesCouleurCV`) :
  un clic sur un rond de couleur déplie **10 nuances** de cette teinte.

### B.5 Mini CV A5 (visible seulement en A5)
- `regFondColonnesA5` : aucun / gauche / droite / les deux / milieu.
- `regEnteteInverseeA5` : en-tête inversée (Portrait).
- `regRemplirPageA5` : 2 CV identiques par feuille A4, à découper.
- `regEchelleA5` : taille du texte, curseur 9 → 14.

### B.6 En-tête
- `regBandeauEnTete` : bandeau en-tête coloré.
- `regFormeEnTete` : rectangle / diagonale.
- `regDegradeBandeau` : foncé → clair / clair → foncé / couleur unie.
- `regBandeauDisponibilite` : bandeau coordonnées à part.
- `regDispositionEntete` : 3 colonnes (nom / métier / accroche côte à côte) /
  2 colonnes.
- `regPositionLibreEntete` : glisser les blocs nom / métier / accroche librement.
- `regLargeurAccrocheLibre` : curseur 30 → 90 %.
- `regLargeurMetierLibre` : curseur 20 → 60 %.
- `regAnneauPhoto` : anneau décalé derrière la photo.

### B.7 Style
- `regStyleTitres` : titres de rubrique soulignés / aucun / bandeau coloré /
  pastille (icône dans un rond).
- `regLectureGuidee` : « lecture guidée » = nom assorti à la couleur du métier visé.
- `regStyleProfessionnel` : missions (Expériences) épuré / condensé.
- `regStylePersonnel` : missions (Expérience personnelle) épuré / condensé.
- `regSoulignerPoste` / `regItaliquePoste` (cases indépendantes).
- `regSoulignerDates` / `regItaliqueDates`.
- `regSoulignerEntreprise` / `regItaliqueEntreprise`.
- `regStyleBordures` : fines / épaisses.
- `regStyleCompetences` : pastille / rectangle / texte seul.
- `regIcones` : icônes de rubrique.
- `regIconesCoordonnees` : icônes de coordonnées.
- `regPolice` : 11 polices (segoe, georgia, verdana, garamond, arial, calibri,
  tahoma, trebuchet, times, palatino, + « artistique » manuscrite hors tirage).
- `regTexteFondColonnes` : blanc / noir (voir aussi B.4).
- `regBandeauCompetencesCles` : bandeau « Compétences clés » (remplace la rubrique).
- `regCoinsArrondis` : coins arrondis (colonnes + bandeaux).

### B.8 Ajustement automatique
- `regEchelle` : taille du texte, curseur 9 → 14 (pas de 0,5).

### B.9 Actions
- Réinitialiser (tout remettre à zéro).
- Annuler le dernier tirage aléatoire (↩ 🎲).

### B.10 Réglages PAR RUBRIQUE (mini-barre flottante sur chaque rubrique)
- `regEchelleRubrique` : agrandir / réduire cette rubrique (75 → 140 %).
- `regPoliceRubriqueActive` + `regPoliceRubrique` : police différente pour
  cette rubrique.
- `regStylePuceRubriqueActive` + `regStylePuceRubrique` + `regCouleurFondPuceRubrique`
  + `regCouleurTextePuceRubrique` : style de puce propre à cette rubrique.
- `regStyleMissionsRubrique` : missions épuré / condensé pour cette rubrique.
- Ordre des rubriques par glisser-déposer.
- Forcer une rubrique dans une colonne précise (`_cvPdfRubriquesForceesColonne`).

### B.11 Réglages de TEXTE D'EN-TÊTE (par bloc nom / métier / accroche)
- `regStyleTexteEnteteActive` + `regCouleurTexteEntete` + `regTexteEnteteGras`
  + `regTexteEnteteItalique` : couleur / gras / italique par bloc.
- Position et hauteur libres (`_cvPdfPositionsEntete`, `_cvPdfHauteurEntete`).

---

## C. Panneau Word « Projet XXL » — ~30 réglages, 3 sections

> Beaucoup plus qu'un « petit sous-ensemble » : proche du PDF en nombre. Ce
> qui manque vraiment côté Word : position libre de l'en-tête, formes en
> diagonale, réglages par rubrique, 11 polices, modification du texte sur place.
> Attributs `data-projetxxl-*`. Bouton **✏️ Personnaliser** (`btnPersonnaliserXXL`)
> = ouvre le grand aperçu (comme côté PDF — **à ne pas garder**, cf. A.4).

### C.0 Rangée de boutons du haut (Word)
- **🎲 Propose-moi un modèle** (`btnProposerModeleXXL`).
- **🎨 Couleur entreprise** (`btnCouleurEntrepriseXXL`).
- **💧 Pipette couleur** (`btnPipetteLibreXXL`).
- **🎓 CV Complet / CV Optimisé** (`btnCvOptimiseXXL`, même booléen que le PDF).
- **🎩 CV Sobre** (`btnSobreXXL`) / **🎨 CV Créatif** (`btnCreatifXXL`).
- **🪄 Mise en forme ultime** (`btnMiseEnFormeUltimeXXL`) + `messageOptimisationXXL`
  = équivalent Word du bouton « Mise en page » du PDF (remise en page selon le
  contenu, avec message concret).
- **Format Intégral** (`boutonFormatIntegralXXL`).
- **Ajouter une photo** (`inputPhotoXXL`).

### C.1 Structure
- **Mise en page** : 1 / 2 colonnes (`data-projetxxl-colonnes`, via `zoneColonnes`).
- **Bloc mis en avant** : `BLOCS_MISE_EN_AVANT` (1 sélecteur en 1 colonne) ;
  en 2 colonnes → **Mise en avant colonne de gauche** (`BLOCS_MISE_EN_AVANT_GAUCHE`)
  et **colonne de droite** (`BLOCS_MISE_EN_AVANT_DROITE`), 2 sélecteurs
  indépendants côte à côte.
- **Permuter les colonnes** (gauche ↔ droite) — `colonnesinversees`.
- **Permuter l'en-tête** (photo / identité ↔ objectif visé) — `entete`.
- **Séparateur** (ligne entre les colonnes) + **couleur du séparateur** —
  `separateur` / `separateur-couleur`.

### C.2 Style visuel
- **Coloration** — `coloration` : aucune / fond de colonne / texte coloré / ...
- **Portée du texte coloré** — `textecolore-portee` (quand coloration = texte).
- **Variante** de lecture guidée — `lectureguidee-variante`.
- **Texte du rectangle** — `textebandeau`.
- **En-tête** (fond de la tête) — `fondtete` / `entete`.
- **Fond des colonnes / Corps du CV** — `fondcolonnes`.
- **Effet du fond** — `fondcolonneseffet` (fond plein / titres).
- **Texte (fond des colonnes)** — `textefondcolonnes` (blanc / noir).
- **Étendre ce fond à l'en-tête** (bande continue de haut en bas) —
  `fondcolonneetendueentete`.
- **Police** — `police`.
- **🔖 Icônes rubriques** — `iconesrubriques`.
- **✉️ Icônes coordonnées** — `iconescoordonnees`.
- **Couleur** : points de base + **10 nuances rapides** (`obtenirNuancesCouleurCV`).
- **Lecture guidée** — `lectureguidee` (nom assorti au métier visé).

### C.3 Contenu
- **Stratégie du contenu** — `strategie` : CV spécifique au métier / CV général.
- **Une lettre de motivation accompagne ce CV ?** — `lettre`.
- **Phrase d'accroche dans l'en-tête** — `sansaccroche`.
- **Style de la phrase d'accroche** — `accrocheitalique`.
- **Mettre en avant les expériences les plus pertinentes et regrouper les
  autres** — `regroupement`.
- **Ajouter une photo** — `photo`.
- **Bandeau coordonnées** — `bandeaudispo`.
- **Missions — Expérience professionnelle** — `stylepro` (épuré / condensé).
- **Missions — Expérience personnelle** — `stylepersonnel`.
- **Ordre dans la ligne d'expérience** — `ordredatesposte` (dates / poste).

### C.4 Constat de débordement (mécanisme A/B/C) — hors des 3 sections
- **« Si le contenu dépasse une page »** — `debordement` : toujours visible,
  A et B = deux vrais choix (forcer 1 page / autoriser 2 pages), C = un simple
  constat du nombre de pages estimé.

> Garantie Word : « ce que vous voyez EST le fichier .docx » — pas de
> modification de texte sur place (repasser par l'éditeur structuré).

---

## D. Fonctions standard ABSENTES (audit `AUDIT_PANNEAUX_PERSONNALISATION_CV_2026-09-01.html`)

À ajouter lors de la refonte (pas dans le code aujourd'hui) :
interligne / espacement des paragraphes · marges de page · réordonner les
**rubriques** (pas seulement les expériences) · afficher / masquer chaque
rubrique en un endroit (cases) · **Annuler / Refaire** multi-pas · alignement
du texte (gauche / justifié) · autoriser 2 pages vs forcer 1 page · style des
puces (rond / tiret / chevron / carré) · photo : recadrer / forme / taille /
bordure · veuves et orphelines (jamais un titre de rubrique seul en bas de
page) · styles enregistrés par la personne (« mon style ») · avertissement
d'impression (accent trop clair en noir et blanc) · aperçu à taille réelle /
zoom / repères de coupe.

---

## E. Structure cible de la maquette (décision Denis 2026-09-02)

**Trois niveaux**, un seul modèle de base (plus de grille de modèles) :

1. **Réglages par défaut / ordinaires + 🎲** — l'entrée zéro effort.
   Le CV part avec des réglages sûrs ; le bouton « Style au hasard » (A.1 / A.2)
   propose des mises en page complètes, avec « ↩ Annuler ». 90 % des personnes
   restent là.
2. **Je débute** — quelques réglages clés (couleur, police, format, densité,
   1 ou 2 colonnes...).
3. **Je veux tous les réglages** — l'inventaire B (PDF) ou C (Word) complet,
   regroupé par intention (La page / Les couleurs / Le haut de la page /
   Le texte / Ce qui s'affiche / Reprendre la main), niveau « Détails » replié
   dans chaque section pour les micro-réglages (B.10, B.11).

Le **système de couleurs** = accent + accent clair + pipette + nuances rapides
+ fond des colonnes + dégradé (B.4), pas une simple pastille. **UI exacte à
trancher avec Denis.**

Réglages indisponibles en Word : **montrés + expliqués**, jamais masqués en
silence.

---

## F. Comptage (pour se rendre compte de l'ampleur)

- PDF : **66** contrôles `id="reg*"` + **8** boutons de la rangée du haut
  (dé, Personnaliser, pipette, Complet/Optimisé, Sobre, Créatif, Mise en page,
  Mise en page A5) + Réinitialiser + mode « modifier le texte ».
- Word « Projet XXL » : **~30** réglages `data-projetxxl-*` + **8** boutons du
  haut (dé, couleur entreprise, pipette, Complet/Optimisé, Sobre, Créatif,
  Mise en forme ultime, Format Intégral) + photo.
- **Total ≈ 120 actions/options.** Des semaines de travail, testées et
  évaluées une par une. On les regroupe par intention (G), on n'en écarte
  aucune sans décision explicite.

---

## G. Tous les réglages regroupés par intention

> Chaque réglage de A / B / C + les fonctions manquantes de D trouve ici sa
> place. Colonnes : **Libellé simple** · **Niveau** (Simple / Je débute /
> Tout régler / Détails) · **PDF** (`id="reg*"`) · **Word** (`data-projetxxl-*`
> ou bouton). « — » = pas d'équivalent dans ce format (montré + expliqué,
> jamais masqué en silence).

### G.0 Le plus simple (zéro effort)

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Style au hasard (remplit ~40 réglages, palette sûre) | Simple | `btnStyleAleatoire` | `btnProposerModeleXXL` |
| Annuler le dernier tirage | Simple | `btnAnnulerAleatoire` | (repris dans la mise en forme ultime) |
| Mise en page (remet en page selon le contenu, message concret) | Simple | `btnMiseEnPage` / `btnMiseEnPageA5` | `btnMiseEnFormeUltimeXXL` + `messageOptimisationXXL` |
| Genre : CV Sobre / CV Créatif | Simple | `regSobreActif` / `regCreatifActif` | `btnSobreXXL` / `btnCreatifXXL` |
| Contenu : CV Complet / CV Optimisé (diplômes + certifications) | Simple | `btnCvOptimisePdf` (`dossier.cvOptimiseActif`) | `btnCvOptimiseXXL` (même booléen) |
| Couleur de l'entreprise | Simple | (via pipette) | `btnCouleurEntrepriseXXL` |
| Revenir au modèle de départ | Simple | `regReinitialiser` (`_PDF_ETAT_DEFAUT`) | (idem) |
| Enregistrer / réappliquer « mon style » | Simple | *à ajouter (D)* | *à ajouter (D)* |
| Aperçu à taille réelle (grand aperçu + boutons clés gardés) | global | `btnPersonnaliserPdf` **remplacé** | `btnPersonnaliserXXL` **remplacé** |

### G.1 « La page » (format, colonnes, marges, longueur)

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Format (A4 Détaillé / Essentiel / Intégral · Mini CV A5 Portrait / Paysage) | Je débute | `regFormatCV` | `boutonFormatIntegralXXL` + bascule A4/A5 |
| Colonnes : 1 ou 2 | Je débute | `regColonnes` | `data-projetxxl-colonnes` (zone « Mise en page ») |
| Colonnes inversées / permuter gauche ↔ droite | Tout régler | `regColonnesInversees` | `data-projetxxl-colonnesinversees` |
| Largeur de la colonne de gauche (30 → 70 %) | Tout régler | `regLargeurColonneGauche` | — |
| Forme des colonnes (rectangle / diagonale) | Tout régler | `regFormeColonnes` | — (Word : rectangle uniquement) |
| Séparateur entre les colonnes (+ sa couleur) | Tout régler | `regSeparateurColonnes` | `data-projetxxl-separateur` (+ `separateur-couleur`) |
| Taille du texte (9 → 14) | Je débute | `regEchelle` / `regEchelleA5` | (via mise en forme ultime) |
| Densité (aéré / normal / compact) — *regroupe interligne + espacement* | Je débute | *à ajouter (D)* | *à ajouter (D)* |
| Interligne | Détails | *à ajouter (D)* | *à ajouter (D)* |
| Marges de page | Détails | *à ajouter (D)* | *à ajouter (D)* |
| Alignement des paragraphes (gauche / justifié) | Détails | *à ajouter (D)* | *à ajouter (D)* |
| Longueur : forcer 1 page / autoriser 2 pages | Tout régler | `libelleMiseEnPage` (A4 Intégral = « jusqu'à 2 pages ») | `data-projetxxl-debordement` (constat A/B/C) |
| Mini CV A5 : remplir la page (2 CV par feuille A4, à découper) | Tout régler (A5) | `regRemplirPageA5` | — |
| Mini CV A5 : taille du texte | Tout régler (A5) | `regEchelleA5` | — |

### G.2 « Les couleurs »

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Accent (couleur principale) | Je débute | `regCouleurDebut` | `data-projetxxl-coloration` (points de base) |
| Accent clair (2e couleur du dégradé, A4) | Je débute | `regCouleurFin` | — |
| 15 couleurs de base + nuances rapides (10 niveaux) | Je débute | palette + `_PDF_PALETTE_ALEATOIRE` | points de base + `obtenirNuancesCouleurCV` |
| Pipette (prélever une couleur à l'écran) | Je débute | `btnPipetteLibrePdf` (EyeDropper) | `btnPipetteLibreXXL` |
| Fond des colonnes (aucun / gauche / droite / les deux) | Je débute | `regFondColonnes` | `data-projetxxl-fondcolonnes` |
| Effet du fond (fond plein / titres seulement) | Détails | `regFondColonnesEffet` | `data-projetxxl-fondcolonneseffet` |
| Dégradé du fond (foncé→clair / clair→foncé / uni) | Je débute | `regDegradeColonnes` | (via coloration) |
| Fond de colonne pleine hauteur (haut de page, sans bandeau) | Détails | `regFondColonnePleineHauteur` | `data-projetxxl-fondcolonneetendueentete` |
| Texte sur le fond coloré (blanc / noir) | Je débute | `regTexteFondColonnes` | `data-projetxxl-textefondcolonnes` |
| Fond des colonnes A5 (aucun / gauche / droite / les deux / milieu) | Tout régler (A5) | `regFondColonnesA5` | — |
| Portée du texte coloré | Détails | (via style) | `data-projetxxl-textecolore-portee` |
| Avertissement impression noir et blanc (accent trop clair) | auto | *à ajouter (D)* | *à ajouter (D)* |

### G.3 « Le haut de la page » (nom, métier visé, accroche, photo)

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Bandeau en-tête coloré | Tout régler | `regBandeauEnTete` | `data-projetxxl-fondtete` / `entete` |
| Forme de l'en-tête (rectangle / diagonale) | Tout régler | `regFormeEnTete` | — |
| Dégradé du bandeau (foncé→clair / clair→foncé / uni) | Tout régler | `regDegradeBandeau` | `data-projetxxl-textebandeau` |
| Coordonnées à part (bandeau séparé) | Tout régler | `regBandeauDisponibilite` | `data-projetxxl-bandeaudispo` |
| Disposition (nom / métier / accroche côte à côte ou empilés) | Tout régler | `regDispositionEntete` | — |
| Permuter l'en-tête (photo/identité ↔ objectif visé) | Tout régler | (via disposition) | `data-projetxxl-entete` |
| Position libre du bandeau (glisser les blocs) | Tout régler | `regPositionLibreEntete` | — (indisponible en Word) |
| Largeur du rectangle d'accroche (30 → 90 %) | Détails | `regLargeurAccrocheLibre` | — |
| Largeur du rectangle « métier visé » (20 → 60 %) | Détails | `regLargeurMetierLibre` | — |
| Photo : ajouter / forme / anneau décalé (+ recadrer / taille) | Détails | `regAnneauPhoto` (+ *à ajouter D*) | `data-projetxxl-photo` / `inputPhotoXXL` |
| Style par bloc d'en-tête (couleur / gras / italique : nom, métier, accroche) | Détails | `regStyleTexteEnteteActive` + `regCouleurTexteEntete` + `regTexteEnteteGras` + `regTexteEnteteItalique` | `data-projetxxl-accrocheitalique` |
| Mini CV A5 : en-tête inversée (Portrait) | Tout régler (A5) | `regEnteteInverseeA5` | — |

### G.4 « Le texte » (police, titres, puces, mise en évidence)

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Police (11 en PDF, moins en Word) | Je débute | `regPolice` | `data-projetxxl-police` |
| Style des titres de rubrique (simple / soulignés / bandeau / pastille) | Tout régler | `regStyleTitres` | (via style) |
| Nom à la couleur du métier visé (« lecture guidée ») | Tout régler | `regLectureGuidee` | `data-projetxxl-lectureguidee` (+ `-variante`) |
| Style des compétences (pastille / rectangle / texte seul) | Tout régler | `regStyleCompetences` | (via style) |
| Couleur des pastilles de compétences | Détails | `regCouleurFondCompetences` | (via coloration) |
| Couleur du texte des pastilles | Détails | `regCouleurTextePuces` | — |
| Style des puces (rond / tiret / chevron / carré) | Détails | *à ajouter (D)* + `regStylePuceRubrique` (par rubrique) | — |
| Icônes de rubrique | Tout régler | `regIcones` | `data-projetxxl-iconesrubriques` |
| Icônes de coordonnées | Tout régler | `regIconesCoordonnees` | `data-projetxxl-iconescoordonnees` |
| Bordures (fines / épaisses) | Détails | `regStyleBordures` | — |
| Coins arrondis (colonnes + bandeaux) | Détails | `regCoinsArrondis` | — |
| Missions — Expériences (épuré / condensé) | Détails | `regStyleProfessionnel` | `data-projetxxl-stylepro` |
| Missions — Expérience personnelle (épuré / condensé) | Détails | `regStylePersonnel` | `data-projetxxl-stylepersonnel` |
| Mettre en évidence : poste / dates / entreprise en gras · souligné · italique (6 cases) | Détails | `regSoulignerPoste` `regItaliquePoste` `regSoulignerDates` `regItaliqueDates` `regSoulignerEntreprise` `regItaliqueEntreprise` | `data-projetxxl-ordredatesposte` (partiel) |
| Réglages par rubrique (agrandir · police différente · style de puce · missions) — mini-barre sur l'aperçu | Détails | `regEchelleRubrique` `regPoliceRubriqueActive` `regPoliceRubrique` `regStylePuceRubriqueActive` `regStylePuceRubrique` `regCouleurFondPuceRubrique` `regCouleurTextePuceRubrique` `regStyleMissionsRubrique` | — |
| Modifier le texte sur place (main + stylo) | barre du haut | `btnEditionTextePdf` | — (Word : « l'aperçu EST le fichier ») |

### G.5 « Ce qui s'affiche » (rubriques, ordre, contenu)

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Rubriques à afficher / masquer (langues, loisirs, certifications, permis, centres d'intérêt...) — une liste de cases | Tout régler | *éparpillé aujourd'hui ; à regrouper (D)* | *idem* |
| Ordre des rubriques (monter « Formations » au-dessus de « Expériences ») | Tout régler | *à ajouter (D)* | *à ajouter (D)* |
| Bloc mis en avant (1 colonne) / colonne gauche + colonne droite (2 colonnes) | Tout régler | `regBandeauCompetencesCles` (partiel) | `data-projetxxl-bloc` / `bloc-gauche` / `bloc-droite` (`BLOCS_MISE_EN_AVANT*`) |
| Ordre des expériences (pertinence / date décroissante / croissante / poste A→Z) | Tout régler | `regOrdreExperiences` | (via `ordredatesposte`) |
| Mise en forme des expériences (standard / amélioré) | Détails | `regFormatExperiences` | — |
| Phrase d'accroche : afficher / masquer (+ style) | Détails | `regSansAccroche` | `data-projetxxl-sansaccroche` (+ `accrocheitalique`) |
| Une lettre de motivation accompagne ce CV | Détails | `regLettreJointe` | `data-projetxxl-lettre` |
| Regrouper les expériences proches | Détails | `regRegroupementActif` | `data-projetxxl-regroupement` |
| Toutes les formations + la plus pertinente développée | Détails | `regFormationsMisesEnAvant` | (via Complet / Optimisé) |
| Stratégie du contenu (CV spécifique au métier / CV général) | Simple / Détails | (via Complet / Optimisé) | `data-projetxxl-strategie` |
| Bandeau « Compétences clés » (remplace la rubrique) | Détails | `regBandeauCompetencesCles` | — |
| Ne jamais laisser un titre de rubrique seul en bas de page (veuves / orphelines) | Détails | *à ajouter (D)* | *à ajouter (D)* |

### G.6 « Reprendre la main »

| Libellé simple | Niveau | PDF | Word |
|---|---|---|---|
| Annuler / Refaire (plusieurs pas) | Tout régler | *à ajouter (D)* (aujourd'hui : « Réinitialiser » + « Annuler 🎲 ») | *à ajouter (D)* |
| Annuler le dernier tirage au hasard | Simple | `btnAnnulerAleatoire` | (dans la mise en forme ultime) |
| Revenir au modèle de départ (tout remettre à zéro) | Simple / Tout régler | `regReinitialiser` | (idem) |
| Style au hasard (raccourci, aussi ici) | Tout régler | `btnStyleAleatoire` | `btnProposerModeleXXL` |
| Mise en page / mise en forme ultime (raccourci, aussi ici) | Tout régler | `btnMiseEnPage` | `btnMiseEnFormeUltimeXXL` |

---

## H. Récapitulatif par niveau (ce que voit la personne)

- **Simple** : Style au hasard · Mise en page · Sobre / Créatif · Complet /
  Optimisé · Annuler le dernier tirage · Revenir au modèle de départ ·
  « mon style ». (90 % des personnes.)
- **Je débute** : couleur (accent + accent clair + pipette + bases + nuances +
  fond des colonnes + dégradé + texte sur fond) · police · format · densité ·
  colonnes.
- **Je veux tout régler** : les 6 sections G.1 → G.6, niveau « Détails » replié
  dans chacune.
- **Aperçu à taille réelle** : grand aperçu + barre qui garde Style au hasard,
  Sobre / Créatif, Complet / Optimisé, Mise en page.

---

## I. Manipulation directe — LE point fort du PDF (rien de tout ça en Word)

> Ces fonctions ne sont pas des `id="reg*"` : elles vivent dans l'état JS du
> module et se manipulent **à la souris sur l'aperçu lui-même**. C'est ce qui
> rend le PDF « un peu plus complexe » et beaucoup plus libre que le Word.
> Denis (2026-09-02) : **tout récupérer, chaque fonction transposée dans la
> maquette**, en sous-catégories si besoin.

### I.1 Déplacer les blocs de l'en-tête (nom, métier visé, accroche)
- `_pdfActiverGlisserLibreEntete` / `_pdfActiverGlisserEnTete` /
  `_cvPdfPositionsEntete` — on **glisse** chaque bloc (bloc identité,
  rectangle « métier visé », rectangle « accroche ») où on veut sur la page.
- `regPositionLibreEntete` (case) active ce mode.
- `_pdfReinitialiserPositionsEnteteSiStructureChange` — remet les positions
  automatiques si on change la structure.
- `_pdfRectanglesSeChevauchent` / `_pdfVerifierDebordementBlocLibre` —
  garde-fous anti-chevauchement.

### I.2 Redimensionner les rectangles et l'en-tête (poignées)
- `_pdfActiverRedimensionnementBlocLibre` — poignées pour élargir / rétrécir
  le **rectangle d'accroche** (`regLargeurAccrocheLibre`, 30 → 90 %) et le
  **rectangle « métier visé »** (`regLargeurMetierLibre`, 20 → 60 %).
- `_pdfActiverRedimensionnementHauteurEntete` / `_cvPdfHauteurEntete` —
  poignée pour régler la **hauteur de l'en-tête**.
- `_pdfAjusterEchelleEnteteEnsemble` — met à l'échelle **tout l'en-tête**
  d'un coup.
- `_pdfAutoAjusterBandeauSiDebordement` — ajuste seul si ça déborde.

### I.3 Barre de format de texte sur chaque bloc d'en-tête
- `_pdfAfficherBarreFormatTexte` / `_pdfFermerBarreFormatTexte` /
  `_pdfMettreAJourStyleTexteEntete` / `_cvPdfStylesTexteEntete` /
  `_pdfSpanStylePartie` — au clic sur le **nom**, le **métier visé** ou
  l'**accroche** : une petite barre pour changer **couleur / gras / italique**
  de ce texte-là (`regStyleTexteEnteteActive`, `regCouleurTexteEntete`,
  `regTexteEnteteGras`, `regTexteEnteteItalique`).

### I.4 Mini-barre d'outils flottante sur chaque rubrique
- `_pdfAfficherBarreOutilsRubrique` / `_pdfFermerBarreOutilsRubrique` /
  `_cvPdfRubriqueSelectionnee` / `_pdfRepositionnerBarreOutilsRubriqueApresRendu`
  — au clic sur une rubrique du CV, une barre apparaît avec :
  - **agrandir / réduire cette rubrique** (`regEchelleRubrique`,
    `_cvPdfEchellesRubriques`, 75 → 140 %) ;
  - **police différente pour cette rubrique** (`regPoliceRubriqueActive` +
    `regPoliceRubrique`, `_cvPdfPolicesRubriques`) ;
  - **style de puce propre à cette rubrique** (`regStylePuceRubriqueActive` +
    `regStylePuceRubrique` + `regCouleurFondPuceRubrique` +
    `regCouleurTextePuceRubrique`, `_cvPdfStylesPuceRubriques`) ;
  - **forcer cette rubrique dans une colonne** (`_cvPdfRubriquesForceesColonne`) ;
  - **style des missions de cette rubrique** (`regStyleMissionsRubrique`) ;
  - **remettre cette rubrique par défaut** (`btnResetRubrique`) ;
  - **fermer la barre** (`btnFermerBarreRubrique`).

### I.5 Réordonner les rubriques par glisser-déposer
- `_pdfActiverGlisserDeposer` / `_cvPdfElementGlisse` /
  `_pdfEnvelopperRubriqueDrag` / `_cvPdfOrdrePersonnalise` — on **glisse**
  une rubrique entière pour la remonter ou la descendre. L'ordre est mémorisé.

### I.6 Modifier le texte sur place
- `_cvPdfModeEditionTexte` / `_pdfActiverEditionTexte` / `_cvPdfTextesEdites` /
  `_pdfReappliquerTextesEdites` / `_pdfAssignerIdentifiantsEdition` — bouton
  main + stylo : le CV devient éditable directement, les retouches sont
  gardées à chaque rafraîchissement. **Word ne l'a pas** (« l'aperçu EST le
  fichier .docx »).

### I.7 Échelle globale + grand aperçu
- `_cvPdfEchelle` — échelle globale du texte (couplée au curseur
  `regEchelle` et au bouton « Mise en page »).
- `_cvPdfModeGrandApercu` — le grand aperçu (« Aperçu à taille réelle »).
  **Il garde la rangée de boutons du haut** (Style aléatoire, pipette,
  Complet / Optimisé, Sobre / Créatif, Mise en page, modifier le texte) +
  un **encart explicatif PDF** : ce que ce format permet, comment le faire,
  sur quel bouton / quel geste. **PDF uniquement** (côté Word : simple
  rappel « l'aperçu EST le fichier »).
- **Invariant non négociable (bug déjà rencontré)** : le CV du **mini
  aperçu** (colonne de droite du panneau) et celui du **grand aperçu** sont
  **le même document** — même modèle de réglages, un seul rendu. Toute
  modification faite dans l'un (panneau OU grand aperçu : dé, mise en page,
  glisser un bloc, écrire dans le texte...) apparaît immédiatement dans
  l'autre. Cause historique de divergence : panneau et aperçu sur deux
  chemins de code / deux états séparés (`etatApercuInline.cv` vs l'iframe
  PDF vs le thème Composeur). La refonte doit unifier en **un seul modèle
  de réglages** lu par les deux.

### I.7bis Imprimer directement
- `btnImprimerSousApercuPdf` — bouton **Imprimer** sous l'aperçu : lance
  l'impression du CV depuis le grand aperçu, sans passer par un
  téléchargement. À placer dans la barre du grand aperçu (PDF).

### I.8 Sécurités « Sobre » / « Créatif » (mémoire avant / après)
- `_cvPdfReglagesAvantSobre` / `_pdfAnnulerSobrePdf` et
  `_cvPdfReglagesAvantCreatif` / `_pdfAnnulerCreatifPdf` — activer Sobre ou
  Créatif garde un instantané pour pouvoir revenir en arrière.
- `_pdfProposerAutreModeleCreatif` — pendant que Créatif est actif, le dé
  propose une autre recette créative entière.

> **Où ça va dans la maquette / le code (décision Denis 2026-09-02) :** toute
> la section I (déplacer, redimensionner, styliser un bloc, régler une rubrique
> seule, réordonner au glisser-déposer, écrire dans le CV, pipette, imprimer)
> vit **UNIQUEMENT dans l'Aperçu à taille réelle**, et **UNIQUEMENT en PDF**.
> Ce ne sont **pas** des options du menu de réglages : on ne demande pas à la
> personne d'aller les chercher. Dans le panneau, les sections « Le haut de la
> page » et « Le texte » n'ont qu'un **renvoi** (« ces réglages se font dans
> l'Aperçu à taille réelle » + bouton pour l'ouvrir). Côté Word : un simple
> texte « indisponible, mise en page fixe / texte modifiable après
> téléchargement ». Le grand aperçu garde en haut sa barre de boutons (Style au
> hasard, Sobre/Créatif, Complet/Optimisé, Mise en page, Modifier le texte,
> Pipette, Imprimer) + un encart qui explique **sur quoi appuyer** pour chaque
> geste + les outils eux-mêmes.

---

## J. Recommandations : ce qu'un traitement de texte fait et qui manque encore

> Fonctions **absentes des deux formats aujourd'hui**, courantes dans Word /
> un logiciel de mise en page, qui amélioreraient vraiment le rendu d'un CV.
> Pour chaque : ce que c'est, **à quoi ça sert concrètement**, priorité, et
> où ça se rangerait dans la maquette.

### Priorité haute

1. **Interligne / espacement des paragraphes** — *La page*.
   Régler l'espace entre les lignes et entre les paragraphes.
   *À quoi ça sert :* c'est **le** levier qui fait qu'un CV « respire » ou
   paraît tassé. Aujourd'hui aucun contrôle : le CV est figé à un interligne
   unique. Un CV court a besoin d'aérer, un CV dense de resserrer.

2. **Marges de page** — *La page*.
   Étroites / normales / larges (ou un curseur).
   *À quoi ça sert :* la 1re chose qu'on fait pour gagner de la place ou
   au contraire aérer. Réglées automatiquement, non modifiables aujourd'hui.

3. **Afficher / masquer chaque rubrique en un seul endroit** — *Ce qui s'affiche*.
   Une liste de cases : Langues, Loisirs, Certifications, Permis, Centres
   d'intérêt, Bénévolat…
   *À quoi ça sert :* aujourd'hui c'est éparpillé (bandeau compétences,
   « rubriques masquables » de l'assistant, mise en avant formations…). Une
   seule liste claire règle 80 % des besoins de contenu, sans chercher.

4. **Réordonner les rubriques (Word)** — *Ce qui s'affiche*.
   Monter « Formations » au-dessus de « Expériences », etc.
   *À quoi ça sert :* un profil en reconversion ou un jeune diplômé veut la
   formation en premier. Le PDF le permet (glisser-déposer) ; **le Word n'a
   aucun ordre de rubriques**.

5. **Annuler / Refaire (plusieurs pas)** — *Reprendre la main*.
   Un vrai historique, pas seulement « Réinitialiser » (tout) + « Annuler le
   dernier tirage ».
   *À quoi ça sert :* enlève la peur d'essayer. On teste un réglage, on
   n'aime pas, on revient d'un pas. Aujourd'hui on ne peut qu'annuler le
   dernier tirage ou tout remettre à zéro.

### Priorité moyenne

6. **Alignement du texte (gauche / justifié)** — *La page*.
   Pour l'accroche et les blocs de missions.
   *À quoi ça sert :* le justifié donne un aspect « propre », aligné des
   deux côtés, à un pavé de texte. Change nettement l'impression de soin.

7. **« 1 page » ou « 2 pages » en choix explicite** — *La page*.
   Aujourd'hui l'ajustement automatique rétrécit le texte pour tenir sur 1
   page.
   *À quoi ça sert :* un senior avec 20 ans de parcours a besoin de **2
   pages assumées**, pas d'un texte réduit à 8 px illisible. Le laisser
   choisir.

8. **Veuves et orphelines** — *Ce qui s'affiche* (à garantir, pas un réglage).
   Ne jamais laisser un **titre de rubrique seul en bas de page**, ou une
   seule ligne d'un paragraphe isolée.
   *À quoi ça sert :* un titre « Formations » tout seul en bas de la page 1
   fait **amateur**. Word gère ça nativement ; à reproduire dans le rendu.

9. **Photo : recadrer / forme / taille / bordure** — *Le haut de la page*.
   Recadrer (zoom + déplacement dans un cadre), forme (carré, coins
   arrondis, cercle), taille, fine bordure.
   *À quoi ça sert :* recadrer une photo mal cadrée est un besoin très
   fréquent. Aujourd'hui seul « anneau décalé » existe.

10. **Avertissement d'impression noir et blanc** — *Les couleurs* (alerte auto).
    Signaler quand l'accent est trop clair (invisible imprimé en N&B) ou
    quand le contraste texte / fond est insuffisant.
    *À quoi ça sert :* beaucoup de CV sont imprimés en N&B chez l'employeur.
    Un accent pastel disparaît. Coût faible, gain réel. *(déjà esquissé dans
    la maquette.)*

11. **Filet de séparation entre les rubriques** — *Le texte*.
    Une fine ligne horizontale pleine largeur sous chaque titre de rubrique
    (en plus des styles « soulignés » / « bandeau » qui existent déjà).
    *À quoi ça sert :* structure la lecture, guide l'œil d'une section à
    l'autre. Très courant sur les CV « propres ».

### Priorité basse (finitions)

12. **Style des puces au niveau global** (rond / tiret / chevron / carré) —
    *Le texte*. Le PDF l'a **par rubrique** ; pas de choix global simple.
    *À quoi ça sert :* détail très visible, différencie un CV sans effort.

13. **Styles enregistrés (« mon style »)** — *Reprendre la main*.
    Mémoriser ses réglages et les réappliquer à un autre CV.
    *À quoi ça sert :* pour quelqu'un qui fait plusieurs CV (plusieurs
    métiers visés), repartir de sa mise en forme préférée en un clic.

14. **Fond de page très légèrement teinté** (crème, gris très pâle) —
    *Les couleurs*. *À quoi ça sert :* rendu discrètement « premium »,
    moins clinique qu'un blanc pur. À manier avec prudence (impression).

15. **Numéro de page si 2 pages** (« 1 / 2 ») — *La page*.
    *À quoi ça sert :* si l'employeur imprime et mélange les feuilles, il
    retrouve l'ordre. Petit détail de sérieux.

> **Recommandation d'ensemble :** intégrer d'abord **1 → 5** (interligne,
> marges, liste de rubriques, ordre des rubriques, Annuler/Refaire) : ce
> sont les leviers que tout le monde cherche et qui manquent vraiment. Le
> reste vient en finition. Ne pas tout ajouter d'un coup sans la
> réorganisation par intention (sinon on passe de « l'écran de la mort » à
> pire).

### J.1 À intégrer au « Style au hasard » (le dé) — décision Denis 2026-09-02

- **OUI** : interligne · espacement des paragraphes · marges. Ce sont des
  leviers **visuels**, sûrs à varier dans des bornes raisonnables. À ajouter
  à `_pdfGenererStyleAleatoire` (et au dé Word) comme les autres champs de
  style.
- **NON** : rubriques à afficher / masquer · ordre des rubriques. C'est du
  **contenu**, jamais randomisé par surprise — même règle que « lettre
  jointe » et « regroupement », déjà exclus du vrai dé.

### J.2 À intégrer au bouton « Mise en page » — décision Denis 2026-09-02

Le bouton « Mise en page » (`_pdfAjusterMiseEnPage` / « Mise en forme ultime »
Word) doit pouvoir jouer sur **interligne · espacement des paragraphes ·
marges** en plus de la taille du texte et du rééquilibrage des colonnes :
- CV **trop court / trop de blanc** → aérer l'interligne, augmenter
  l'espacement entre blocs, élargir les marges (avant même d'ajouter du
  contenu).
- CV **trop long** → resserrer l'interligne et l'espacement, réduire les
  marges (avant de descendre la taille du texte).
- Le **message concret** dit ce qui a été fait (« interligne aéré, marges
  élargies… »).

### J.3 Rubrique « Logiciels » — à afficher sur le CV

`dossier.logiciels` (`js/app.js` ~301, `[]`) existe déjà : liste de logiciels /
outils saisie ou importée du CV. Un chantier a été fait pour qu'elle **ne
disparaisse plus en silence** et ait **sa propre ligne, avec son propre titre**
(« Logiciels ») sur le CV — bloc `id: 'logiciels'` dans « Compétences et
logiciels » (`js/app.js` ~8076 : `contenuListeTexteLibre('logicielsCV', …)`,
`ajouterLogicielCV` / `retirerLogicielCV`). Utile pour comptable, assistant
administratif, métiers du numérique… **À faire figurer dans la liste des
rubriques à afficher / masquer** du panneau de mise en page (fait dans la
maquette).

### J.4 Valeurs par défaut vérifiées contre le code (`_PDF_ETAT_DEFAUT`)

Corrections appliquées à la maquette pour coller au code :
- **Police par défaut = Segoe** (`regPolice: "segoe"`), pas Calibri.
- **Largeur du rectangle « métier visé » = 32 %** (`regLargeurMetierLibre: "32"`).
- **« Mettre en évidence »** (poste/dates/entreprise gras/souligné/italique) :
  **toutes les cases décochées** par défaut (les 6 valent `false` dans le code).
- Tout le reste de `_PDF_ETAT_DEFAUT` correspond déjà (colonnes 2, accent
  `#2f6690` / clair `#d9e8f2`, fond des colonnes « droite », dégradé
  « foncé → clair », bandeau en-tête activé, titres « soulignés », style des
  compétences « pastille », coins non arrondis, position libre activée,
  disposition 3 colonnes, ordre des expériences « pertinence », taille 11,
  échelle par rubrique 100 %, Sobre inactif, etc.).
- **Word** (`etatApercuInline.cv.reglagesProjetXXL`) : `coloration: 'aucune'`,
  icônes off, `strategieForcee: 'chronologique'`, `blocMisEnAvant: null`,
  `regroupementActif: false`, `formatPage: 'A4'`, `taillePct: 100`. La police
  par défaut de Word dépend du **modèle** (souvent `Arial` sur le modèle de
  base). Dans la maquette (état partagé), la liste des polices Word est
  Calibri / Georgia / Arial / Times ; à l'implémentation, prendre la police du
  modèle.

### J.5 Formats de CV : les 5 existent aussi en Word

`etatApercuInline.cv.formatPage` gère **A4** (= A4 Détaillé) · **A4-essentiel**
(A4 Essentiel) · **A4-integral** (CV Intégral, 2 pages) · **A5** avec
`modeleA5` = `'portrait'` ou `'paysage'` (Mini CV A5 Portrait / Paysage). Ce
sont **les mêmes 5 que le PDF**. Mais dans le panneau Word actuel, le bouton
« CV Intégral (2 pages) » est **`style="display:none;"`** : il n'apparaît
qu'après un clic sur « A4 Essentiel » ou « A4 Détaillé » (`js/app.js` ~11529,
~16358). **La refonte le montre directement**, comme les autres.
- **Décision Denis 2026-09-02** : dans « Je débute », Word doit proposer
  **les 5 formats**, comme le PDF (avant, la maquette n'offrait que « A4 / A5 »
  en Word). Corrigé.
- Les réglages fins **`regFondColonnesA5` / `regEnteteInverseeA5` /
  `regRemplirPageA5`** restent **PDF uniquement** (`sectionA5Seulement` dans
  `cvPdfPanneauReglages.js`). En Word, le Mini CV suit les réglages généraux
  Projet XXL. Montré + expliqué dans la maquette.

### J.6 Défauts du Mini CV A5 vérifiés contre le code

- **Fond des colonnes (A5)** = **Droite** (`regFondColonnesA5`, 1re option
  `"droite"`). Options : Droite / Gauche / Les deux / Milieu (Paysage
  uniquement) / Aucun.
- **En-tête inversée** = **désactivée** (`regEnteteInverseeA5` non coché).
  Libellé : « (Portrait uniquement) ».
- **Remplir la page** (2 CV par feuille A4 à découper) = **désactivé**
  (`regRemplirPageA5` non coché).
- **Taille du texte (A5)** = **11** (`regEchelleA5` `value="11"`, bornes 9 → 14
  pas de 0,5, mêmes que le curseur A4).
