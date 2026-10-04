# Chantier : le Mini CV A5 en Word repris depuis le PDF (ouvert le 2026-09-27)

> Suite du chantier « le CV en Word repris depuis le PDF »
> (`docs/CHANTIER_WORD_DEPUIS_PDF_2026-09-26.md`, A4 exclu l'A5 par décision D5). Denis, le matin
> du 2026-09-27, après avoir vu le résultat A4 : « on va commencer par ce chantier » (la migration
> A5). Mode A (travail en direct, question par question).

## 1. Ce qui existe aujourd'hui (audit du code réel)

- **Contenu** (quelles expériences/formations/compétences retenir) : **déjà partagé** entre PDF et
  Word A5 via `composeurComposerA5Portrait()` (`modules/cv-composeur/composeurComposition.js`) —
  `modules/cv-pdf-html/cvPdfTemplateA5.js` le dit explicitement (« AUCUNE re-decision de contenu
  ici »), et `docs/TACHES_VALIDEES.md` confirme que le rendu Word A5 (`composeurRender.js`, ligne
  ~803) consomme la même composition. **Aucun risque de divergence de contenu à corriger.**
- **Rendu PDF A5** : `modules/cv-pdf-html/cvPdfTemplateA5.js`, page `.page-a5` (148×210 mm portrait,
  210×148 mm paysage), déjà affichée dans le même panneau unique et le même aperçu interactif
  `#zonePdfInlineCV` que l'A4 (confirmé : `cvPdfPanneauReglages.js` propose "Mini CV (A5) Portrait/
  Paysage" comme raccourcis de format au même niveau que les 3 formats A4). Hauteur réelle d'une
  page : `210 * 96/25.4 ≈ 793,7 px` (portrait) ou `148 * 96/25.4 ≈ 559,4 px` (paysage) — voir
  `_pdfHauteurCibleA5Px()`.
- **Rendu Word A5 actuel** : `modules/cv-composeur/composeurRender.js` (branche
  `formatPage === 'A5-portrait'/'A5-paysage'`, ~ligne 803), construit à la main avec la
  bibliothèque `docx.js` (comme les 16 anciens modèles classiques avant ce chantier) — tailles de
  police et mise en page entièrement câblées à part, aucun dégradé/forme/pastille de couleur
  (mêmes limites que l'ancien Word A4).
- **Point d'entrée de génération** : `js/app.js`, `genererBlobDocumentActif` → branche `cv` :
  aujourd'hui, en A5, tombe sur `_dnConstruireDocumentAvecOptions` → `composeurRender.js`. C'est le
  **seul endroit** de `js/app.js` à changer, et seulement à la toute fin (phase 4 ci-dessous).

### Ce qu'il faut généraliser dans `modules/cv-word/`

`wordExtracteur.js`/`wordExport.js` ciblent et supposent l'A4 à des endroits précis :
- `wordExtracteur.js:23` : `doc.querySelector('#conteneurPage .cv') || doc.querySelector('.page-a4')`
  — repli déjà présent pour `.page-a4`, **jamais complété pour `.page-a5`** (la page A5 n'a pas la
  classe `.cv`).
- `wordExport.js:55` (attente de stabilité de la page) : cible **uniquement** `#conteneurPage .cv`,
  aucun repli — attendrait indéfiniment sur une page A5 (timeout).
- `wordExtracteur.js` (5 endroits) : la constante `1122.52` (hauteur d'une page A4 en px) est
  écrite en dur pour : le repli de hauteur de ligne unique, la détection des décors « pleine
  hauteur » à répéter sur les pages suivantes, le calcul de la marge basse, la valeur écrite dans
  `plan.page.hauteurPx`, et `HAUTEUR_A4` (répartition des décors entre pages). **Doit devenir un
  paramètre** (hauteur réelle de la page en cours, mesurée ou passée en option), pas une constante.
- `wordExport.js:37` : iframe cachée fixée à `794×1123 px` — à vérifier si une taille fixe plus
  grande suffit (l'extraction mesure le contenu réel, pas la taille de l'iframe) ou si une largeur
  dédiée à l'A5 paysage (plus large que haut) est nécessaire pour que le CSS de la page se
  comporte normalement.

`wordPaquet.js`/`wordXml.js` sont **déjà paramétrés** (`plan.page.largeurPx`/`hauteurPx` lus tels
quels) : rien à changer là, une fois que `wordExtracteur.js` leur passe les bonnes valeurs.

## 2. Ce que ce chantier N'A PAS besoin de refaire

- Pas de galerie de 25 modèles à revérifier un par un : l'A5 n'a **qu'une seule mise en page** (2
  variantes : Portrait et Paysage), pas de choix Sobre/Standard/Créatif.
- Pas de fusion de panneau de réglages à refaire : déjà fait ce matin (le panneau unique couvre
  déjà l'A5, y compris ses réglages propres : fond de colonnes, en-tête inversée, remplir la page).
- Pas d'audit des ~30 tests `dossier.formatCV === 'pdf'` : ce chantier ne touche pas à l'écran de
  réglages, seulement au moteur d'extraction/écriture `.docx` et à un seul point de branchement.

## 3. Plan par phases

1. **Généraliser `modules/cv-word/`** (aucun test navigateur possible sans étape 2, mais le code
   peut s'écrire dès maintenant) : sélecteur de racine incluant `.page-a5`, hauteur de page en
   paramètre partout où `1122.52` est en dur, iframe adaptée si besoin. `npm test` (Node) pour non
   régression du noyau A4.
2. **Banc d'essai réel** (mêmes outils que la nuit dernière, `scripts/word/`) : export A5 Portrait
   et Paysage depuis le panneau unique, mesure dans le vrai Word (mots, pages, écarts), comparaison
   à l'A4 (attendu : bien plus simple, une seule page, pas de décors complexes selon les captures
   déjà vues). Corriger les écarts trouvés, comme cette nuit.
3. **Scénarios de robustesse** : CV très court (le Mini CV A5 est déjà très plafonné en contenu :
   2 expériences, 1 formation...), avec/sans photo, les 2 orientations, l'option « 2 CV identiques
   par feuille A4 » (`feuille-a4-remplie` — à vérifier si elle a un sens en sortie Word ou si elle
   reste PDF uniquement, à trancher avec Denis).
4. **Branchement dans `js/app.js`** (seule étape qui touche ce fichier partagé — coordination avec
   l'autre compte avant de committer) : dans `genererBlobDocumentActif`, étendre la condition qui
   utilise déjà `exporterCvWord` pour l'A4 afin qu'elle couvre aussi l'A5 (repli automatique sur
   l'ancien moteur en cas d'échec, comme pour l'A4).
5. **Validation par Denis** sur les 2 images/`.docx` (Portrait, Paysage), avant toute suppression
   de l'ancien code A5 (jamais avant validation, même règle que pour l'A4).

## 4. Première question ouverte pour Denis

L'option « Remplir la page (2 CV identiques par feuille A4, à découper) » — a-t-elle un sens pour
une sortie **Word** (un fichier .docx avec 2 mini-CV identiques par page, à découper), ou reste-t-
elle une fonction PDF uniquement (impression) ? Pas bloquant pour commencer la phase 1, mais à
trancher avant la phase 2 (scénarios de robustesse).

## 5. Fait le 2026-09-27 (matin, phase 1 + banc d'essai)

- **Généralisation faite** : `wordExtracteur.js` reconnaît désormais `.page-a5` (en plus de `.page-a4`/`.cv`), et la hauteur d'une page
  (`HAUTEUR_PAGE_PX`) est lue directement sur le `min-height` CSS de la page réelle au lieu d'être écrite en dur à 1122,52 px (A4) — s'adapte
  seule à n'importe quel format, y compris futur. `wordExport.js` attend aussi `.page-a5` avant de considérer la page stable.
- **Bug réel trouvé et corrigé** (pas propre à l'A5, juste jamais rencontré avant faute de colonne assez étroite) : quand une seule pastille
  tient par rangée, son fond coloré touchait celui de la rangée suivante dans Word (aucun des 25 modèles d'hier soir n'avait ce cas). Cause :
  ces pastilles étaient glissées dans un seul paragraphe avec des sauts de ligne internes, sans le vrai espace vertical mesuré entre elles.
  Corrigé en réutilisant, pour ce cas aussi, le mécanisme déjà existant qui transforme chaque rangée de pastilles en son **propre
  paragraphe** (fonction extraite `paragraphesRangeesPastilles`, appelée maintenant aussi depuis le regroupement générique des enfants en
  ligne, pas seulement quand le conteneur est *entièrement* en ligne). Revérifié sur le modèle Standard (A4, plusieurs pastilles par
  rangée) : aucun changement, toujours 1 page, écart vertical médian -0,7 mm.
- **Mesuré dans le vrai Word** (dossier Camille Martin, capacités du Mini CV A5 = 2 expériences/1 formation/2 langues) :
  - **Portrait** : 1 page, 152/152 mots appariés, écart vertical médian -0,3 mm (95e centile 1,0 mm), horizontal médian 0,03 mm. Un seul mot
    isolé décalé de 54 mm (« Allianz » sur la ligne poste/entreprise/dates) : coupure de ligne différente de celle du navigateur, même
    limite connue et déjà documentée que pour l'A4 (écart de mesure du texte d'environ 0,2 % entre Word et le navigateur).
  - **Paysage** : 1 page, 152/152 mots appariés, écart vertical médian 0,3 mm (95e centile 1,4 mm).
  - Images et `.docx` : `docs/images_chantiers/word_a5/`.
- **Reste avant le branchement (phase 4)** : trancher la question du §1 (« Remplir la page » en sortie Word), puis coordonner avec Denis
  avant de toucher `js/app.js` (fichier partagé avec l'autre compte).

## 6. Fait le 2026-09-27 (phase 4 : branchement)

`genererBlobDocumentActif` (cv.generer, `js/app.js`) utilise désormais `exporterCvWord` pour **tous** les formats (A4 et Mini CV A5,
Portrait/Paysage) — plus de garde-fou A5 : l'ancien moteur (`composeurRender.js`) reste uniquement le repli automatique en cas d'échec de
l'extraction, comme pour l'A4. Vérifié dans le navigateur : export réel via le circuit du bouton (`genererBlobDocumentActif('cv')`) en A5
Portrait, A5 Paysage et A4 Détaillé (aucune régression) — 3 vrais fichiers `.docx` produits. `npm test` 1018 verts.

Reste : la question du §1 (« Remplir la page » en sortie Word) n'a pas encore de réponse de Denis — laissé de côté pour l'instant (pas
bloquant, l'option reste PDF uniquement en pratique tant qu'elle n'est pas explicitement demandée côté Word). Validation finale par Denis
sur les images/`.docx` de Mini CV A5 avant suppression de l'ancien moteur (jamais avant validation, même règle que pour l'A4).

## 7. « Remplir la page » en Word (2 CV par feuille A4) : fait le 2026-09-27 (après-midi)

**Généralisation** : `wordExtracteur.js`/`wordExport.js` reconnaissent désormais `.feuille-a4-remplie`
(le conteneur qui empile ou juxtapose les 2 exemplaires du Mini CV A5, `cvPdfTemplateA5.js`) comme
racine de page, cherché avant `.page-a5` seul (sinon un seul exemplaire serait extrait). Hauteur de
page : repli sur la hauteur réellement mesurée (`base.height`) quand l'élément n'a pas de
`min-height` CSS propre (cas de `.feuille-a4-remplie`, dont la hauteur vient de ses 2 pages A5).

**Bug réel trouvé et corrigé (bloquant, le fichier ne s'ouvrait pas dans Word)** : les décors de
page (colonnes colorées, ligne de découpe) sont dupliqués dans **deux en-têtes Word distincts**
(première page / pages suivantes, `header1.xml`/`header2.xml`) — mécanisme déjà utilisé pour l'A4.
Mais leur position dans l'ordre d'empilement (`relativeHeight`, XML) était calculée à partir d'une
valeur **propre à chaque décor, pas au fichier entier** : quand le même décor apparaît dans les deux
en-têtes (toujours le cas pour une page « remplie », puisqu'elle ne fait jamais qu'une seule page),
les deux en-têtes se retrouvaient avec des `relativeHeight` identiques — Word refusait alors
d'ouvrir le fichier (« Word a rencontré une erreur lors de l'ouverture du fichier »). Corrigé dans
`wordXml.js` : cette valeur se base désormais sur l'identifiant unique du dessin (déjà garanti
unique sur tout le document, en-têtes compris), plus jamais sur une valeur propre au décor.
**Ce bug pouvait en théorie affecter n'importe quel CV A4 tenant sur une seule page avec un décor
pleine hauteur** (colonne colorée, cadre de page) — non détecté cette nuit par pure coïncidence
(aucun des 25 modèles testés n'avait cette combinaison exacte) : à garder en tête, corrigé pour
tous les formats désormais, pas seulement l'A5.

**Vérifié dans le vrai Word** (dossier Camille Martin) :
- **Portrait, côte à côte** (2 A5 sur une feuille A4 paysage) : 1 page, 304/304 mots appariés,
  écart vertical médian 0,08 mm. Image/`.docx` : `docs/images_chantiers/word_a5/a5_remplie_portrait_rangee.*`.
- **Paysage, empilés** (2 A5 sur une feuille A4 portrait) : tout le contenu tient bien sur la
  première page (304/304 mots dessus), mais Word répartit sur **2 pages** au lieu d'une seule
  (léger dépassement de quelques pixels, marge basse mal calibrée pour ce cas précis) — **défaut
  mineur, pas bloquant, pas corrigé** faute de temps ce jour. Image/`.docx` :
  `docs/images_chantiers/word_a5/a5_remplie_paysage_pile.*` (montre la 1re page, complète).

**Corrigé le 2026-09-29 (deux défauts, mesurés dans le vrai Word 16)** :
1. **Page vide en Paysage / empilés** : les 2 tableaux remplissaient toute la page, la marge de sécurité du bas tombait à 0 et le
   paragraphe séparateur imposé par Word passait sur une 2e page VIDE (gaspillage de papier à l'impression, remarque de Denis).
   Correctif dans `wordExtracteur.js` (calcul de `margeBas`), réservé à la feuille `.feuille-a4-remplie` : la dernière ligne du dernier
   tableau (hauteur « au moins ») est raccourcie de quelques pixels. Résultat : **1 page** pour les 4 variantes A5.
2. **Défaut plus grave trouvé en route : le Portrait « côte à côte » ne s'ouvrait PAS dans Word** (« erreur lors de l'ouverture »).
   Cause : `<wp:posOffset>NaN</wp:posOffset>` ; le paragraphe de remplissage créé par `espacer()` avant un tableau n'avait pas de
   `_colGauche`, donc la position d'un décor accroché devenait `NaN`. Corrigé à la source (`_colGauche: ctx.gauche`) **et** garde-fou
   dans `wordUnites.js` (`pxVersEmu` / `pxVersTwips` renvoient 0 pour toute valeur non numérique : un décor mal placé est préférable
   à un fichier illisible). 2 tests ajoutés dans `tests/wordNoyau.test.js`. Ce défaut existait AVANT les corrections du jour (vérifié
   en les mettant de côté) ; l'affirmation du 2026-09-27 « Portrait côte à côte : 1 page » ne valait donc que pour un autre jeu de données.
Vérifié : `npm test` 1025/1025 ; banc `scripts/word/banc_b7.js` (désormais aussi l'empreinte du XML réellement écrit) : 24/24 identiques
en PDF et en XML ; 4 variantes A5 ouvertes dans Word, 1 page chacune, aucun `NaN` dans le fichier.

**Reste** : corriger le débordement de la variante Paysage/empilée ; brancher (aucun branchement
nécessaire en fait : `exporterCvWord` lit déjà les réglages du panneau, donc « Remplir la page »
fonctionnera automatiquement dès que la case est cochée — **à vérifier** que le clic
`data-mep-remplira5` suffit bien depuis le vrai bouton d'export, pas seulement testé via `__envoyer`).
