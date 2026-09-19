# Cadrage : chantier « La mise en page » du CV

> Rédigé le 2026-09-03, AVANT code. Mode A (cadrage) puis B (exécution).
> Trace de la discussion en chat ; la version qui fait foi est celle du chat
> tant que Denis n'a pas validé.
>
> Références lues : `LECONS_A_NE_PAS_REPRODUIRE.md` §10, `BRIQUES_COMMUNES.md`,
> `TRAVAILLER_AVEC_DENIS.md` (section « zéro régression »), `TACHES_VALIDEES.md`,
> `CADRAGE_ETAPE_5_VOS_DOCUMENTS_2026-09-03.md` (Q3), `INVENTAIRE_REGLAGES_CV_2026-09-02.md`,
> `REVUE_CRITIQUE_REGLAGES_CV_2026-09-02.md`, `MAQUETTE_MISE_EN_PAGE_2026-09-02.html` (v6),
> `AUDIT_PANNEAUX_PERSONNALISATION_CV_2026-09-01.html`.

---

## 1. Cadre validé par Denis (2026-09-03)

- **Approche « B allégé »** : construire **un seul modèle de réglages canonique**
  + **un traducteur vers chaque moteur de rendu EXISTANT** (PDF iframe, Word
  Composeur). **On ne fusionne PAS les deux moteurs de rendu.** Cette fusion
  (« grand saut ») reste liée au découpage de `js/app.js` et se fera avec lui.
- **« La mise en page » reste un rectangle / espace DANS « Vos documents »** :
  pas de route nouvelle, pas de barre de navigation propre. Le stepper à 6
  étapes est inchangé (il finit à « Vos documents »).
- **Zéro régression FONCTIONNELLE** (mot de Denis, 2026-09-03) : aucun réglage,
  bouton ou action perdu. Le visuel, lui, suit la maquette v6.

## 2. Ce qui existe aujourd'hui (état des lieux du code)

| | PDF | Word (« Projet XXL ») |
|---|---|---|
| Fichiers | `modules/cv-pdf-html/cvPdfPanneauReglages.js` (3 693 l.) + `cvPdfTemplateA4.js` (2 319) + `cvPdfTemplateA5.js` (504), **dans une iframe** (`cvPdfExport.js`) | panneau ~2 000 l. dans `js/app.js` (autour de `construirePaletteCouleurs`, ~28303-30530) + `modules/cv-composeur/composeurTheme.js` (813) + `composeurRender.js` (2 185) |
| Réglages | **66** `id="reg*"` | **30** `data-projetxxl-*` |
| Modèle d'état | inputs DOM de l'iframe + `_cvPdf*` sur `iframe.contentWindow` ; défauts `_PDF_ETAT_DEFAUT` | objet `etatApercuInline.cv.reglagesProjetXXL` → `composeurAppliquerReglagesProjetXXL(themeBase, reglages)` |
| Grand aperçu | `ouvrirGrandApercuPdf()` (`js/app.js` ~27770), réutilise le même HTML iframe | `apercuDocxIntegre.js` (859 l., partagé lettre/entretien) |
| Point d'entrée commun | `construireContenuApercuFinalisation(docActif)` (`js/app.js:13617`), rendu par `rectDoc('mise-en-page', …)` dans `pageResultats` |

Les deux mondes ne partagent **aucun** modèle de réglages. `composeurTheme.js`
fait déjà, côté Word, la moitié du travail « réglages → rendu » (avec les
garde-fous d'exclusion mutuelle).

## 3. Méthode « zéro régression » (obligatoire, Règle 11 + TRAVAILLER_AVEC_DENIS)

Avant tout code : **inventaire** des 66 `reg*` + 30 `data-projetxxl-*` + tous
les boutons du rectangle actuel. Chacun étiqueté **GARDÉ / DÉPLACÉ / FUSIONNÉ /
ENRICHI**, avec sa case cible dans la maquette (niveau Simple / Je débute /
Tout régler / Détails + section). **Aucun « RETIRÉ » sans une ligne dédiée
validée par Denis.** Après chaque sous-étape : cocher que chacun est retrouvé
**et câblé** (fait ce qu'il annonce). C'est la sous-étape 0.

## 3bis. Le code neuf va dans son PROPRE module (décision Denis 2026-09-03)

Nouveau dossier **`modules/cv-mise-en-page/`**, même patron que `modules/cv-composeur/`
(fichiers `<script src>` dans `index.html`, chargés au démarrage — le projet n'a
pas de chargement paresseux, mais le bénéfice visé est l'**isolation du code**,
pas le moment du chargement).

- **Ce qui va dans le module** : le modèle canonique + les 2 traducteurs +
  l'UI 3 niveaux + la coquille du grand aperçu. Tout ce qu'on écrit et qu'on
  itère.
- **Ce qui reste dans `js/app.js`** : seulement le point d'appel
  (`rectDoc('mise-en-page', …)` → `construireMiseEnPageCV(docActif)` +
  `wireMiseEnPageCV()`), et les globales existantes que le module lit / appelle
  (`dossier`, `etatApercuInline`, `composeurAppliquerReglagesProjetXXL`, les
  aides iframe PDF `ouvrirGrandApercuPdf` / `cvPdfExport.js`…). Le module s'y
  branche, il ne les recopie pas.
- **Limite honnête** : la mécanique de rendu du CV est répartie sur
  `app.js` + `cv-pdf-html/` + `cv-composeur/` ; le module a donc une interface
  large avec elles. Il n'est pas « totalement autonome » — mais la partie qu'on
  code est à 100 % dans le nouveau dossier.
- **`app.js` rétrécit à la sous-étape 10** : l'ancien panneau Word « Projet XXL »
  (~2 000 l. autour de `construirePaletteCouleurs`) reste un chemin mort pour le
  CV pendant le chantier, puis est supprimé → bilan net négatif pour `app.js`
  sur le chemin CV. Pendant le chantier, `app.js` ne grossit quasiment pas.
- **Bonus tests** : `reglagesMiseEnPage.js` (modèle + défauts) et
  `reglagesTraducteurs.js` sont de la logique pure → **tests Node possibles**
  (comme `composeur*`), contrairement à l'UI qui reste en test navigateur.
- Cohérent avec le séquencement (« modules d'abord, découpage `app.js` en
  dernier ») : créer une fonctionnalité neuve dans son module, ce n'est pas
  « faire le découpage », c'est **ne pas aggraver** le monolithe.

Fichiers prévus (démarrer à 1, scinder au-delà de ~800 l. — taille de fait des
modules du projet) :
`reglagesMiseEnPage.js` · `reglagesTraducteurs.js` · `miseEnPageUI.js` ·
`miseEnPageGrandApercu.js`.

## 4. Découpage proposé (~10 sous-étapes, 1 commit chacune)

Chaque sous-étape : `npm test` + navigateur **PDF ET Word**, sur `nouveau` /
`maj` / `pret` (Découverte n'a pas d'étape mise en page). Un commit par
sous-étape, jamais un état à moitié.

| # | Sous-étape | Contenu | Risque |
|---|---|---|---|
| **0** | Inventaire zéro-régression | Doc `docs/INVENTAIRE_ZERO_REGRESSION_MISE_EN_PAGE.md` : les 96 réglages + boutons → GARDÉ/DÉPLACÉ/FUSIONNÉ/ENRICHI + case cible. Tracer les chemins réels (Règle 2bis). **0 code.** Validé par Denis avant la 1. | faible |
| **1** | Module + modèle canonique | Créer `modules/cv-mise-en-page/reglagesMiseEnPage.js`, poser le `<script>` dans `index.html` (après `cv-composeur` + `cv-pdf-html`). `dossier.reglagesMiseEnPageCV` : schéma unique PDF ∪ Word, vocabulaire normalisé, défauts repris **à l'identique** de `_PDF_ETAT_DEFAUT` + défauts Word (`INVENTAIRE` §J.4). **Test Node** sur la forme + les défauts. Pas encore branché à l'UI. | faible |
| **2** | Traducteur → Word | `reglagesMiseEnPageCV → reglagesProjetXXL` (fonction pure). `composeurAppliquerReglagesProjetXXL` **inchangé**. Navigateur : Word identique avant/après sur un échantillon. | moyen |
| **3** | Traducteur → PDF | `reglagesMiseEnPageCV → reg*` : pose les valeurs sur l'iframe (via `__cvPdfReglagesInitiaux` avant `document.write`, ou les inputs). PDF identique avant/après. **Point le plus délicat (frontière iframe), isolé ici.** | élevé |
| **4a** | Coquille + socle canonique | **FAIT 2026-09-03.** `construireMiseEnPageCV(docActif)` : CV = carte « L'essentiel » (cadrage + « Revenir au modèle de départ ») **au-dessus** du panneau existant ; lettre/entretien = panneau existant byte-identique. `dossier.reglagesMiseEnPageCV` introduit (persisté), `_appliquerReglagesMiseEnPageCV()` établit **une fois** (`_baseApplique`) le défaut harmonisé (option a). **Décision Denis « a1 »** : le tirage de modèle aléatoire automatique à la 1re visite (Word) est **retiré** quand le nouveau système est en place (le dé reste en bouton) — tracé `INVENTAIRE_ZERO_REGRESSION` §8-7. `ongletApercu` suit `dossier.formatCV` (fin de l'écran « Word ou PDF ? » dans « La mise en page »). Vérifié navigateur : CV nouveau Word + PDF, maj, lettre/entretien inchangés, accueil OK. `npm test` 689. | moyen |
| **4b** | Niveau « Simple » : les cartes actives | **FAIT 2026-09-03.** Carte « L'essentiel » complète : « Style au hasard » + « Mise en page » (macros) + « Annuler le dernier tirage » + Allure (Sobre / Standard / Créatif) + Quelles formations montrer (Complet / Optimisé) + « Revenir au modèle de départ ». Chaque contrôle **déclenche le bouton moteur existant** (`btnSobreXXL`/`btnSobrePdf`, `btnProposerModeleXXL`/`btnStyleAleatoire`, `btnMiseEnFormeUltimeXXL`/`btnMiseEnPage`, `btnCvOptimiseXXL`/`btnCvOptimisePdf`) via `_mepClicMoteur` (panneau parent OU iframe PDF), puis met à jour le **miroir canonique** (allure / formations — traducteur inverse partiel ; le complet vient en 6). « Annuler » = instantané maison `_mepSnapshotAvantDe` (Word + PDF : le « Annuler » natif de l'iframe ne survit pas au re-rendu). Allure lue format-consciente (`_mepAllureActuelle` : Word sur `etatApercuInline.cv`, PDF sur `regSobreActif`/`regCreatifActif` de l'iframe) ; l'affichage de la carte suit le miroir. Vérifié navigateur : Word + PDF, dé → Annuler revient exactement, Revenir remet le défaut harmonisé, `npm test` 689, seul le 404 umami en console. | moyen |
| **5** | Interrupteur 3 niveaux + « Je débute » (1re passe) | **FAIT 2026-09-03.** Interrupteur `Simple / Je débute / Je veux tout régler` (`_niveauMiseEnPageCV`). « Je débute » = carte « L'essentiel » : Allure + **Colonnes** + Quelles formations montrer (chacun déclenche le contrôle moteur existant — Word `[data-colonnes-composeur]`, PDF `#regColonnes` — + miroir canonique). « Je veux tout régler » = panneau existant tel quel (remplacé en 6). **Reportés** : Couleur (accent + bases + fond des colonnes) et Police → sous-étape 5b ; Densité / interligne / marges / alignement → avec le support moteur (sous-étape 6 §J) — jamais un bouton mort. Vérifié navigateur Word + PDF (colonnes → `_1col` / `regColonnes`), switch, retours. `npm test` 689. | moyen |
| **5b** | « Je débute » : Couleur + Police | **FAIT 2026-09-03.** Ajouts au niveau « Je débute » : **Couleur d'accent** (`<input type=color>` → chaîne codée Word / `#regCouleurDebut` iframe PDF) + bouton **Pipette** (délègue à `btnPipetteLibreXXL` / `btnPipetteLibrePdf`) + **Fond des colonnes** (Aucun/Gauche/Droite/Les deux → `[data-projetxxl-fondcolonnes]` / `#regFondColonnes`) + **Police** (liste selon le format : 4 en Word via `TRAD_POLICE_CANON_VERS_WORD` → `[data-projetxxl-police]`, 10 en PDF → `#regPolice`). Chacun met à jour le miroir canonique. La palette 15 bases + nuances reste dans « Je veux tout régler ». Vérifié Word + PDF. `npm test` 689. | moyen |
| **6** | Niveau « Tout régler » : 6 sections | La page / Les couleurs / Le haut de la page / Le texte / Ce qui s'affiche / Reprendre la main, chacune + « Détails » replié. **Tous** les `reg*`/`data-projetxxl-*` de l'inventaire y trouvent leur case. Indispo en Word = montré + expliqué, jamais masqué. Sous-découpe 6a…6f (1 commit/section). | élevé |
| **6a** | Traducteurs inverses (moteur → canonique) | **FAIT 2026-09-03.** `lireDepuisRegPdf(regObj)` + `lireDepuisReglagesProjetXXL(couleur, reglagesProjetXXL, extra)` dans `reglagesTraducteurs.js` — inverses de `traduireVersRegPdf` / `traduireVersReglagesProjetXXL`, fonctions pures renvoyant un patch canonique. Tests Node **round-trip** : `canon → traduire → lire → canon` exact sur le sous-ensemble que chaque moteur sait exprimer (PDF : quasi tout ; Word : sous-ensemble documenté — `sans-decor`/`pastille` de titres et les polices hors des 4 Word ne reviennent pas, attendu). `npm test` 699. Pas encore câblé à l'UI. | moyen |
| **6b** | Section « La page » | **FAIT 2026-09-03.** `_htmlSecPageMiseEnPage()` rendue pour le niveau « Je veux tout régler », au-dessus du panneau existant. **Format** (5 jetons → traducteurs : A4/A5 + portrait/paysage) · **Colonnes** · **Taille du texte** = note (curseur du panneau détaillé / bouton « Mise en page ») · **Détails** : Colonnes inversées, Séparateur (+ PDF : Largeur colonne gauche, Forme des colonnes) · **A5** (PDF, si format A5) : Fond des colonnes A5, En-tête inversée, Remplir la page. Helper générique `_mepReglageMoteur()` (Word `[data-projetxxl-*]` OU iframe `#reg*` + écrit `dossier.pdfReglages` — les curseurs PDF ne sont pas persistés par l'iframe). **Reportés** (aucun support moteur — jamais un bouton mort) : Marges · Interligne · Espacement · Alignement · Longueur (1/2 pages) → sous-étape dédiée « interligne/marges/densité ». Vérifié Word + PDF. `npm test` 699. | élevé |
| **6c** | Section « Les couleurs » | **FAIT 2026-09-03.** `_htmlSecCouleursMiseEnPage()` : Accent (`<input type=color>` + pipette) + **15 bases** (`_MEP_PALETTE_BASES`) + **nuances rapides** (`_mepNuancesDe`, 4→10) + Accent clair (PDF) + Fond des colonnes + Dégradé (PDF ; `uni`→`aucun`) + Texte sur le fond coloré + Détails (Effet du fond, Fond pleine hauteur, Couleur pastilles compétences + texte pastilles — PDF). Indispo en Word = note « disponible en PDF », jamais masqué. **`_mepReglageMoteur` refactorisé** : écrit désormais **directement** `etatApercuInline.cv.reglagesProjetXXL[clé]` côté Word (param `wordRegl` pour les clés différentes, ex. `fondColonnePleineHauteur`→`fondColonneEtendueEntete`) — les boutons du panneau Projet XXL sont parfois rendus conditionnellement et introuvables. Vérifié Word + PDF. `npm test` 699. | élevé |
| **6d** | Section « Le haut de la page » | **FAIT 2026-09-03.** `_htmlSecHautMiseEnPage()` : Bandeau coloré (Word `fondtete` / PDF `#regBandeauEnTete`) · Coordonnées à part (Word `bandeaudispo` / PDF `#regBandeauDisponibilite`) · (PDF) Forme de l'en-tête · Dégradé du bandeau (`uni`→`aucun`) · Disposition (3/2 colonnes) · Anneau photo · **renvoi vers l'Aperçu à taille réelle** pour le placement libre des blocs (bouton `[data-mep-versgrand]` → `btnOuvrirGrandApercu` / `ouvrirGrandApercuPdf`). Indispo en Word = notes. Vérifié Word + PDF. `npm test` 699. | élevé |
| **6e** | Section « Le texte » | **FAIT 2026-09-03.** `_htmlSecTexteMiseEnPage()` : Police · Titres de rubrique (Word : dérivation `coloration`/`lectureGuideeVariante`/`titresPastille` via `_mepPousserTitresWord` ; PDF `#regStyleTitres`, `sans-decor`→`aucun`) · Lecture guidée · (PDF) Style des compétences (`texte-seul`→`texte`) · Icônes de rubrique / de coordonnées · (PDF) Bordures · Détails : Missions pro/perso · **Mettre en évidence** (6 cases souligner/italique × poste/dates/entreprise → `reglagesProjetXXL.soulignerPoste`… / `#regSoulignerPoste`…) · (PDF) Bandeau « Compétences clés », Coins arrondis, renvoi grand aperçu (réglages par rubrique + écrire dans le CV). Indispo en Word = notes. Vérifié Word + PDF. `npm test` 699. | élevé |
| **6f** | Sections « Ce qui s'affiche » + « Reprendre la main » | **FAIT 2026-09-03.** `_htmlSecAfficheMiseEnPage()` : Ordre des expériences (PDF) · Bloc mis en avant (Word) · Détails : Phrase d'accroche (Word → `etatApercuInline.cv.sansAccroche`, pas `reglagesProjetXXL`) · Style de l'accroche (Word) · Regrouper les expériences · Mise en forme des expériences (PDF) · Toutes les formations développées (PDF) · Ordre dans la ligne d'expérience (Word `ordredatesposte`). **Notes** : rubriques à afficher/masquer, ordre des rubriques, veuves-orphelines → « avec leur prise en charge par le moteur ». `_htmlSecReprendreMiseEnPage()` : Style au hasard · Mise en page · Annuler le dernier tirage · Revenir au modèle (mêmes handlers/IDs que le niveau Simple) · placeholder désactivé « mon style » (comme la maquette) · note « Annuler/Refaire multi-pas : sous-étape à venir » (= 8). Vérifié Word + PDF. `npm test` 699. | élevé |
| **6g** | Masquage du panneau existant | **FAIT 2026-09-03.** `construireContenuApercuFinalisation(docActif, opts)` : nouveau `opts.miseEnPageRefonte` — pour le CV, ne rend plus que l'**aperçu** (`colonneDroite` Word / `#zonePdfInlineCV` PDF). Le panneau de gauche (grille modèles / palette / Projet XXL / boutons de format) reste dans le DOM **masqué** (`.mep-ancien-gauche` `display:none`) pour garder le câblage vivant (`construirePaletteCouleurs` / `construireBoutonsFormatPage` construisent dedans, certains réglages y sont lus/écrits). `construireMiseEnPageCV` passe `{ miseEnPageRefonte: true }`. Bascule Word/PDF retirée (l'onglet suit `dossier.formatCV`). **Suppression complète du code : sous-étape 10.** Vérifié : aperçu rendu sur les 3 niveaux × 2 formats, réglages toujours poussés, lettre/entretien inchangés. `npm test` 699. | moyen |
| **7a** | Grand aperçu PDF : nouvelle coquille (maquette) | **FAIT 2026-09-03.** `ouvrirGrandApercuPdf()` (js/app.js) : l'overlay `#pdfGrandApercuPanneau` (id conservé, callers inchangés) est reconstruit dans le langage de la maquette : barre CLAIRE dans le thème de l'app (variables CSS, mode sombre OK) avec 6 boutons libellés (`btnFermerGrandApercuPdf` = « Revenir aux réglages », `btnMepGrandDe`, `btnMepGrandMep`, `btnMepGrandEdit`, `btnMepGrandPipette`, `btnMepGrandImprimer`), encart accent « Le PDF : vous agissez directement sur le CV » (6 puces + « Voir la démonstration »), scène CV. Les 6 boutons pilotent à distance les boutons déjà présents dans l'iframe (`_mepGrandClicIframe` → `btnStyleAleatoire` / `btnMiseEnPage` / `btnPipetteLibrePdf` / `btnImprimerSousApercuPdf` ; `btnMepGrandEdit` → `btnEditionTextePdf` + bascule visuelle + message). La colonne `.panneau-reglages` de l'iframe est **masquée** (`style.display='none'` après `contentDocument.write` ; jamais reconstruite par `_pdfRafraichir`) : les réglages détaillés vivent dans les 6 sections. Ancien `💡` popover + `messageBarrePdfGrandApercu` + `btnEditionPdfGrandApercu` retirés (aucun caller externe). Tous les gestes de manipulation directe **inchangés** (dans l'iframe). Vérifié navigateur : barre + encart + scène rendus, `.panneau-reglages` `display:none`, dé/mise en page/édition/revenir fonctionnels, mode sombre OK, Word inchangé. `npm test` 699. | élevé |
| **7b** | Grand aperçu PDF : les 3 groupes d'outils | **FAIT 2026-09-03 (option A, validée Denis).** Les 3 groupes rendus dans la coquille 7a, au-dessus de la scène : **Un bloc de l'en-tête** (jetons Nom / Métier visé / Accroche / Coordonnées → `_mepGrandSurfacerRubrique` appelle la vraie `_pdfAfficherBarreOutilsRubrique(cle, bloc)` de l'iframe, la mini barre flottante apparaît sur le CV ; + 2 curseurs de largeur câblés sur `regLargeurAccrocheLibre` / `regLargeurMetierLibre` de l'iframe via délégation `input` ; note pour la hauteur = geste) · **Une rubrique seule** (7 jetons experiences/formations/competences/competencesComportementales/langues/loisirs/engagements → même mécanisme ; taille, police, puce, colonne, missions vivent dans la vraie barre) · **Ordre des rubriques** (encart d'explication du glisser-déposer sur le CV — pas de point d'entrée parent stable, la maquette le cadre elle-même comme un geste). `#barreOutilsRubrique` est un frère de `<body>` dans l'iframe (pas dans `.panneau-reglages` masquée) : surfacer la barre fonctionne. Curseurs resynchronisés sur l'état réel de l'iframe à chaque ouverture. Aucune 2ᵉ UI, aucun bouton mort. Vérifié navigateur : jeton en-tête → barre affichée (titre « Nom »), jeton rubrique absente → message, curseur → `regLargeurAccrocheLibre` = 70, mode sombre OK. `npm test` 699. | élevé |
| **7c** | Grand aperçu Word | **FAIT 2026-09-03 (sans code).** Constat : (1) les renvois des sections « Le haut de la page » (`_htmlSecHautMiseEnPage`) et « Le texte » (`_htmlSecTexteMiseEnPage`) sont **déjà** branchés format par format depuis 6d/6e : le bouton `data-mep-versgrand` (« Ouvrir l'Aperçu à taille réelle → ») n'est rendu **qu'en PDF** ; en Word, une note claire « placement libre des blocs / réglages par rubrique / écriture directe : disponibles en PDF, la mise en page Word reste fixe ». Rien à ajouter. (2) `modules/cv-editor/apercuDocxIntegre.js` est **partagé lettre / entretien / CV Word** et affiche déjà un thème clair cohérent (barre `#F8F9FA`, fond `#F3F4F6`) : **pas de restylage** (périmètre = CV, aucune maquette pour lettre/entretien, risque de régression sur 2 types non testés > gain visuel marginal). Le grand aperçu Word (`btnOuvrirGrandApercu` → `ouvrirApercuDocxIntegre`) a été vérifié : s'ouvre, affiche le CV, **aucun ancien panneau « Projet XXL » visible** par-dessus (`zonePanneauReglagesXXL` vit dans `.mep-ancien-gauche` `display:none`, rect 0×0). **À traiter en 10** : `etatApercuInline.cv.personnalisationOuverte` / `personnalisationEnGrandApercu` restent à `true` (résidu de l'ancien toggle « Personnaliser » non rendu) ; neutralisé aujourd'hui par le conteneur masqué, à nettoyer quand `colonneGauche` sera supprimée. | moyen |
| **8** | Annuler / Refaire + mémoire | **FAIT 2026-09-03.** Pile de session `_mepPileUndo` / `_mepPileRedo` d'instantanés de l'état COMPLET (modèle canonique + `etatApercuInline.cv.couleur` / `.reglagesProjetXXL` / `.sobreActif` / `.creatifActif` / `.sansAccroche` + `dossier.pdfReglages` + `dossier.cvOptimiseActif`). `_mepPousserHistorique(cle)` empilé AVANT chaque action (helper `_mepReglageMoteur`, colonnes, accent, fond des colonnes, allure, formations, police, dé, mise en page, « Revenir au modèle ») ; coalescence même clé < 700 ms. `_mepAppliquerInstantaneMiseEnPage` restaure puis `naviguerVers('resultats')`. **Le FORMAT ne bouge jamais** : à la restauration on garde `canon.format` courant et `dossier.pdfReglages.regFormatCV` courant ; `[data-mep-format]` n'empile pas d'entrée. Ancien `_mepSnapshotAvantDe` / `_mepDeUtilise` supprimés : « Annuler le dernier tirage » (carte Simple) = `_mepAnnulerMiseEnPage`. Paire **Annuler / Refaire** ajoutée aux niveaux « Je débute » et « Reprendre la main » (`_htmlAnnulerRefaireMiseEnPage`), désactivées quand la pile est vide. **`localStorage` `mep_niveau_cv`** : le niveau affiché (Simple / Je débute / Tout régler) est écrit à chaque bascule et relu une fois (`_mepNiveauLuStorage`). Vérifié navigateur Word + PDF : réglage → Annuler → Refaire exacts (canon + stores moteurs), dé → Annuler revient exactement, bascule format A5 puis Annuler d'un réglage = format reste A5, niveau persiste après rechargement. `npm test` 699, aucune erreur console. | moyen |
| **9** | Corrections de la revue + couleur d'entreprise | **FAIT 2026-09-03.** **2.3** (« Pastille » de titre sans icône) : `_mepOptionsStyleTitres(c)` ne propose « Pastille » que si `c.icones` ; note d'explication sinon ; couper les icônes alors que « Pastille » est actif fait retomber `styleTitres` sur « souligné » (Word + PDF). **4.1** (dé efface le travail manuel) : `_mepRetouchesManuellesExistent()` (retouches par rubrique / bloc de l'iframe PDF : `_cvPdfEchellesRubriques` / `_cvPdfPolicesRubriques` / `_cvPdfStylesPuceRubriques` / `_cvPdfPositionsEntete`) ; si non vide, `window.confirm` rassurant avant le tirage (« vous pourrez revenir en arrière avec Annuler »). **Couleur d'entreprise** : `_htmlBoutonAccentEntreprise()` rendu dans « Je débute » et « Tout régler > Les couleurs » quand `dossier.rechercheCandidature.couleurEntreprise` est un hex valide ; le clic réutilise entièrement le circuit du champ « Accent » (historique inclus). **Bonus** : `_mepPousserHistorique` ajouté aux handlers `styletitres` / `lectureguidee` / `stylecomp` (bypassaient `_mepReglageMoteur`, donc l'annulation ne les couvrait pas). **Déjà fait ailleurs, rien à coder** : 2.2 (aucun émoji singe/visage dans le dépôt ; l'onglet « Rubriques à masquer » est 🚫, un symbole-objet), 4.3 (mémoire du niveau = sous-étape 8), 1.5 (« Style au hasard » des deux côtés). **1.3** (reset du dé Word) : le reset que le dé PDF fait (`_pdfGenererStyleAleatoire` vide 4 maps de retouches par rubrique / bloc) est **exclusif au PDF** (le Composeur Word n'a pas de retouche par rubrique) ; les deux dés re-tirent leurs bascules globales ; avec l'historique (sous-étape 8) un dé surprise est réversible des deux côtés. **Documenté, pas de code.** **4.4** (renommer « Projet XXL ») : plus aucun libellé « Projet XXL » visible (panneau masqué en 6g) ; le renommage des identifiants internes (`reglagesProjetXXL`, l'id encodé `projetxxl-hex:` persisté...) est un gros refactor à risque, **renvoyé au chantier « vocabulaire neutre »** comme le recommande la revue. Vérifié navigateur Word + PDF. `npm test` 699, aucune erreur console. | moyen |
| **9bis** | **Audit approfondi zéro-régression — carte « Créer mon CV » entière** (exigence Denis 2026-09-03) | **FAIT 2026-09-03** — doc `docs/AUDIT_ZERO_REGRESSION_CREER_MON_CV.md` (relevé par lecture du code livré 0→9 + vérif navigateur Word/PDF). Bilan : ~120 réglages / boutons / gestes **retrouvés et câblés** ; ~12 **notes** (nouveautés maquette sans moteur : interligne, marges, alignement, liste des rubriques, ordre des rubriques, veuves) ; **4 RETIRÉ** conformes aux décisions §8 (Permuter l'en-tête Word, Personnaliser, aide iframe, auto-tirage Word). **2 RÉGRESSIONS à corriger AVANT la 10** : (9-1) plus de contrôle direct de la **taille du texte globale** (`regEchelle` / `regEchelleA5` / `taillePct`) — la note renvoie au panneau masqué en 6g ; (9-2) le **bloc photo** (inclure / retirer / changer / ajouter) est masqué en 6g et absent de `secHaut`. La sous-étape 10 est conditionnée à leur correction. | élevé |
| **9ter** | Correction des 2 régressions de l'audit 9bis | **FAIT 2026-09-03.** **9-1 Taille du texte globale (PDF)** : `secPage` + « Je débute » ont un vrai curseur `[data-mep-taille]` (9-14, pas 0,5) → `dossier.reglagesMiseEnPageCV.taille` ; handler dédié qui pose la valeur sur le vrai `#regEchelle` / `#regEchelleA5` de l'iframe + `dispatch('input')` (le listener natif fait `_cvPdfEchelle = v/11`, re-rend, persiste `dossier.pdfReglages.echelle`, restauré à la reconstruction) ; filet direct sur `pdfReglages.echelle`. Annulable (pile 8). Word = note (taille dérivée par le Composeur, jamais de curseur manuel Word). **9-2 Bloc photo** : `_htmlBlocPhotoMiseEnPage()` (ids propres `mepPhoto*`) rendu en fin de `_htmlSecHautMiseEnPage`, Word + PDF ; câblage autonome dans `_wireCarteSimpleMiseEnPage` (inclure / retirer / changer-ajouter / upload) ; l'ancien `#blocPhotoGenerique` de `colonneGauche` n'est plus rendu pour le CV (`!opts.miseEnPageRefonte`), zéro id en double. Vérifié navigateur Word + PDF (range 13 → canon 13 → `_cvPdfEchelle` 1,18 → Annuler → 11 ; inclure/retirer/réajouter photo). `npm test` 699, aucune erreur console. | moyen |
| **10** | Passe finale | **FAIT 2026-09-03 (volet documentaire + vérification).** `nouveau` / `maj` / `pret` re-vérifiés navigateur, Word **et** PDF : `nouveau` et `maj` rendent l'UI 3 niveaux + 6 sections + aperçu ; `pret` la rend dès que le CV est le document actif (`dernierDocumentPrepare = 'cv'`) — sinon `pret` reste sur la lettre, comportement voulu. `enteteInversee` (« Permuter l'en-tête ») confirmé **non émis** par le traducteur Word (RETIRÉ conforme §8-1). `npm test` 699, aucune erreur console. `BRIQUES_COMMUNES.md` : nouvelle brique **Réglages de mise en page du CV** (table A) + **dette B.7** (2 moteurs + ancien panneau Word non supprimé) + Historique. `TACHES_VALIDEES.md` + `ETAT_DES_CHANTIERS` à jour. **NON FAIT, rattaché à la dette B.7 / au chantier découpage `js/app.js`** : la suppression effective de `construirePaletteCouleurs` (~2 345 l.) + de la branche `colonneGauche` du CV, parce que 5 macros Word (Sobre / Créatif / dé / Optimisé / Pipette / Mise en page) sont **encloses dans la fermeture** de `construirePaletteCouleurs` et **déclenchées à distance** par `_mepClicMoteur` (option « i ») ; les retirer avant d'avoir extrait ces macros = casser Allure / dé / Mise en page en Word = faire la fusion des moteurs, explicitement reportée (§1). Le panneau reste donc rendu **masqué** (`.mep-ancien-gauche display:none`), chemin mort inerte pour le CV. | élevé |
| **Lot moteur** (6 sous-lots, 1 commit chacun) | Donner un vrai effet moteur aux réglages « montrés + expliqués » de l'audit 9bis | **CLOS 2026-09-04.** Circuit partagé : `reglagesMiseEnPageCV.<clé>` → traducteur → **whitelist** `composeurResoudreThemeGeneration` → `theme` → `composition` → les 2 moteurs (Word `composeurRender`, PDF `cvPdfTemplateA4`). **1 — Densité** (`00341e5`) : `theme.densiteEspacementUtilisateur` (0,82 / 1 / 1,22) × `espacementExtra`. **3 — Alignement** (`e359407`) : `composition.alignementCorps` → `AlignmentType.JUSTIFIED` (Word, 4 fabriques) + `text-align: justify` (PDF). **6 — Veuves/orphelines** (`737fbbf`) : `composition.controleVeuvesOrphelines` → `keepNext` des 3 retours `titreSection` (Word) + `break-after: avoid` / `orphans-widows` (PDF). **2 — Interligne / espacement des paragraphes / marges de page** (`b8cf094`) : `theme.interligneCorps` (`line`+lineRule auto Word / `line-height` PDF) · `espacementParasMult` (composé dans `espacementExtra`) · `margesTwips` (marges de section Word) + `margeLateralePdf` (padding latéral conteneurs PDF). **4 — Liste unique « rubriques à afficher ou masquer »** (`7ca4cae`) : `theme.rubriquesMasquees` → vide la liste dans `contenuRetenu` (chokepoint unique, « vide = jamais affichée ») pour les 2 moteurs ; `permisMasque` dédié (en-tête). 7 bascules dans « Ce qui s'affiche ». **5 — Ordre des rubriques (Word) : option A tranchée Denis 2026-09-04** — pas de réordonnancement Word (ordre piloté par `strategieCV.ordreRubriques` + post-traitements XXL codés en dur ; asymétrie assumée comme « bloc mis en avant » = Word seul). Le PDF garde le glisser-déposer du grand aperçu (7c). Note UI adaptée par format (PDF → glisser sur l'aperçu ; Word → automatique + « Bloc mis en avant »). Round-trip traducteurs couvert, `npm test` 703. |
| **Reste (hors chantier)** | Suppression du code mort | Voir dette **B.7** de `BRIQUES_COMMUNES.md` (suppression ancien panneau Word, extraction macros = fusion). Ne bloque pas l'usage actuel (chemin mort masqué). |

## 5. Points à trancher avec Denis (reco + options)

1. **Où vit le modèle canonique ?**
   - **`dossier.reglagesMiseEnPageCV` (Recommandé)** — persiste avec la session
     et la disquette. Bénéfice : la personne retrouve sa mise en page en
     rechargeant. Risque : un champ de plus dans le schéma `dossier` (sauvegarde/
     restauration à couvrir).
   - `etatApercuInline.cv.*` — état d'écran seulement. Bénéfice : pas de touche
     au schéma `dossier`. Risque : mise en page perdue au rechargement de session
     (régression de confort réelle).

2. **Périmètre = CV seulement ?**
   - **Oui (Recommandé)** — la maquette v6 et l'inventaire sont 100 % CV.
     Lettre/entretien gardent `construireContenuApercuFinalisation`. Bénéfice :
     périmètre net, moins de risque. Risque : deux mécaniques de « mise en page »
     coexistent un temps (CV = neuf, lettre/entretien = ancien) — à aligner plus
     tard, noté en dette.
   - Étendre à lettre/entretien maintenant — Bénéfice : cohérence immédiate.
     Risque : double le périmètre sans maquette validée pour ces deux types.

3. **Manipulation directe (déplacer/redimensionner/écrire dans le CV, PDF) ?**
   **TRANCHÉ Denis 2026-09-03 : fidélité totale à la maquette.** Le grand aperçu
   est reconstruit dans le langage de la maquette (sous-étapes 7a/7b/7c), pas un
   renvoi vers l'ancienne interface (une bascule visuelle entre écran neuf et
   écran ancien = confusion inacceptable). Les gestes de manipulation directe
   sont **conservés à l'identique** mais dans la nouvelle coquille : mêmes
   fonctions, nouvelle fenêtre. Ce qui n'est PAS fait dans ce chantier : sortir
   le rendu PDF de son iframe (ça reste lié au découpage `app.js`). L'iframe
   garde son rôle d'isolation CSS / impression du CV lui-même, stylée pour être
   invisible ; toute la coquille autour est dans le DOM de l'app.
   - Note : « mon style » (enregistrer / réappliquer un jeu de réglages) reste,
     comme dans la maquette v6, un **bouton désactivé « à implémenter »** —
     n'existe pas dans le code, vraie implémentation = tâche séparée.

4. **Sous-étape 6 : 1 commit par section (6a…6f) ou 1 commit global ?**
   - **1 par section (Recommandé)** — testable, réversible. Risque : plus de
     commits (sans conséquence).
   - 1 global — plus rapide à annoncer. Risque : gros diff difficile à re-tester
     et à annuler proprement.

## 6. Non-négociables rappelés

- Français impeccable, accents partout ; **jamais de tiret cadratin ni demi-cadratin**.
- **Jamais le mot « IA » visible, jamais d'icône visage** — l'onglet « Rubriques
  à masquer » (🙈) passe à une icône-objet (revue 2.2).
- Mode sombre sur **tout** nouveau composant (jeton `[data-theme="sombre"]`).
- `js/app.js` + `modules/cv-*` **non couverts par les tests Node** → test
  navigateur obligatoire, PDF **et** Word, sur `nouveau` / `maj` / `pret`.
- 1 commit par sous-étape ; `npm test` + navigateur avant la suivante ; jamais
  un état à moitié refondu.
- Zéro régression **fonctionnelle** cochée : chaque `reg*` / `data-projetxxl-*`
  retrouvé **et** câblé.
- Commits directement sur `master` une fois vérifiés ; messages FR sans cadratin ;
  `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Jamais `git add -A`.
