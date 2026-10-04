# Plan : amener « La mise en page » du Word au niveau du PDF (2026-09-23)

> Document de PLAN, pas de code. Rédigé après la phase 5 PDF (5.1 complet, 5.2 bien avancé, voir `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md`), à la demande de Denis (« tu fais le plan pour me faire la même évolution de panneau pour le modèle Word »), une fois le PDF vérifié sans régression. Rien n'est codé ici : ce plan sert à décider, avec Denis, l'ordre et l'étendue du travail avant de l'entamer.

---

## 1. Ce qui existe déjà côté Word (bonne surprise, vérifié en lisant le code)

Le Word n'est pas un chantier vierge : une bonne partie de l'infrastructure du PDF a déjà son miroir côté Word, construite lors des chantiers précédents.

- **Un vrai modèle canonique déjà partagé** : `modules/cv-mise-en-page/reglagesMiseEnPage.js` déclare chaque réglage avec un champ `word` (`true` = le Word sait le faire, `false` = PDF seulement, `'note: ...'` = le Word le fait autrement). `modules/cv-mise-en-page/reglagesTraducteurs.js` traduit ce modèle vers le Word (`traduireVersEtatWord`) **et** vers le PDF (`traduireVersRegPdf`) : une bonne partie du travail de mise en cohérence est donc déjà faite à ce niveau-là, pas à refaire.
- **Une vraie galerie de modèles Créatif côté Word existe déjà** : `CREATIF_MODELES_XXL` (`js/app.js` ~32928), **9 recettes complètes** (`sidebarViolette`, `bandeauTeal`, `rectangles`, `cadreBarre`, `bandeauVertical`, `sidebarSombreEncadres`, `infoDense`, `pastille`, `bandeauSerif`), chacune avec ses propres réglages Word **et** un sous-objet `pdf: {...}` qui la relie à la recette PDF correspondante (`_PDF_CREATIF_RECETTES`). `_appliquerModeleCreatifXXL(nomModele)` sait déjà appliquer un modèle **précis** par son nom (pas seulement au hasard) : la fonction bas niveau nécessaire à une galerie cliquable existe donc déjà.
- **Le dé Word fonctionne déjà « par modèle complet »** en Créatif (`tirerModeleAleatoireXXL()`, js/app.js ~37473) : il propose un **autre modèle entier** de `CREATIF_MODELES_XXL`, jamais un mélange (même philosophie que C2/C20 côté PDF), en excluant le modèle courant. C'est exactement l'ancien comportement du dé PDF (avant ce soir), pas encore le cycle séquentiel de la maquette.
- **Sobre existe aussi côté Word** (`btnSobreXXL`, comportement équivalent au PDF).
- **« CV Complet » / « CV Optimisé »** : déjà un booléen strictement partagé (`dossier.cvOptimiseActif`) entre Word et PDF, aucun travail nécessaire ici, déjà fait par construction.

**Ce que ça change pour ce plan** : construire une galerie de vignettes cliquables et un dé « cycle sans répétition » pour le Word est **plus proche, en effort, de ce qui vient d'être fait ce soir côté PDF (habiller une donnée déjà réelle) que d'un vrai chantier de zéro**. Le gros du travail restant est **l'écran des réglages lui-même** (le nouvel écran unique, sans les 3 niveaux) et **l'habillage visuel** (vignettes), pas le moteur.

## 2. Ce qui n'existe pas et devra être construit

- **Le nouvel écran unique (5.1)** : `construireMiseEnPageCV()` garde aujourd'hui, **pour le Word uniquement**, l'ancien interrupteur « Simple / Je débute / Je veux tout régler » (volontairement non touché ce soir, pour ne prendre aucun risque sur un format hors périmètre de ce chantier). Le retirer pour le Word et le remplacer par le même écran à cartes repliables est un travail direct, du même ordre que celui fait ce soir pour le PDF, sauf qu'il faudra aussi ajouter, dans les 6 sections « Je veux tout régler », les 2 champs qui n'existaient que dans les niveaux réduits (même bug que celui trouvé et corrigé ce soir côté PDF : `mep-allure` et `mep-formations`), cette fois-ci en vérifiant avant de retirer l'interrupteur, pas après.
- **La galerie de vignettes cliquables** : aucune UI n'expose aujourd'hui `CREATIF_MODELES_XXL` comme des vignettes cliquables (seul le dé y accède, au hasard). Même travail que ce soir côté PDF : une fonction de silhouette (`mini(id)`), une carte « Allure générale » dans l'écran Word, un câblage vers `_appliquerModeleCreatifXXL(nomModele)` (déjà prêt à le recevoir).
- **Le dé « cycle sans répétition »** : remplacer le tirage aléatoire-en-excluant-le-courant par un vrai cycle dans l'ordre de la galerie (même changement que ce soir, `_pdfProposerAutreModeleCreatif` vers son équivalent Word).
- **Le modèle « Colonne et frise »** : n'existe ni côté PDF (avant ce soir) ni côté Word. Voir § 3, risque le plus élevé de tout ce plan.

## 3. Ce que le format Word ne pourra probablement jamais faire à l'identique

Le PDF est un document HTML/CSS (libertés quasi totales : dégradés, formes en diagonale, positionnement libre). Le Word est généré par la bibliothèque `docx` (`composeurRender.js`), qui a de vraies limites techniques, vérifié en cherchant dans le code, pas supposé :

| Élément de la maquette / du PDF | Faisable en Word (`docx`) ? | Constat |
|---|---|---|
| Dégradé (case « Dégradé », C46) | **Non** | Aucune trace de dégradé dans `composeurRender.js` (recherché, 0 résultat) : la bibliothèque `docx` ne sait pas peindre un dégradé de couleur sur un fond. Une couleur unie est la seule option réaliste. |
| Coin/bandeau en diagonale (`clip-path`) | **Non, pas nativement** | Pas d'équivalent CSS `clip-path` dans `docx` ; un triangle colonne ou un bandeau diagonal demanderait de vraies formes vectorielles (`docx` sait insérer des formes basiques, jamais essayé ici), risque réel, à valider par un petit essai isolé avant de promettre quoi que ce soit. |
| Frise chronologique à puces rondes + trait vertical | **Partiellement** | Un trait vertical + puces peuvent s'approcher avec des bordures de paragraphe et des puces personnalisées, mais le rendu « colonne large avec puce qui déborde à gauche du texte » (comme la maquette) est une mise en page fine, pas un simple bloc de texte : à prototyper avant de s'engager sur un rendu précis. |
| Colonne latérale pleine hauteur colorée | **Oui, avec réserve** | Existe déjà (`fondColonnePleineHauteur` a un équivalent Word, voir `reglagesTraducteurs.js`), c'est la base du modèle `sidebarViolette` existant. |
| Icônes SVG (coordonnées, rubriques) | **Oui, déjà fait** | `iconesRubriques`/`iconesCoordonnees` sont déjà des champs `word: true` du modèle canonique, déjà appliqués par `composeurRender.js`. |
| Positionnement libre de l'en-tête (glisser les blocs) | **Non, jamais envisagé** | Le Word n'a jamais eu ce concept (mise en page fixe, tableau/paragraphes), c'est un vrai avantage du PDF, assumé comme tel dans les textes déjà écrits pour l'utilisateur (« Word : mise en page fixe, mais modifiable après téléchargement »). **Aucune raison de vouloir le porter.** |

**Conclusion de ce constat** : viser une fidélité à 100 % entre Word et PDF n'a pas de sens technique pour certains réglages (dégradé, diagonale, en-tête libre). Le Word restera, par nature, une version **plus sobre visuellement**, déjà annoncée comme telle à la personne (« Moins de liberté sur les couleurs et la mise en page »). Le bon objectif n'est donc pas « Word = PDF », mais **« le Word a le même écran de réglages, les mêmes fonctions qui ont un sens pour lui (word: true dans le modèle canonique), présentées de la même façon », jamais une fonction qui n'existe pas techniquement en Word simulée à moitié**.

## 4. Modèle « Colonne et frise » côté Word : risque à part, à trancher avant de s'engager

Sur les 3 limites ci-dessus (dégradé, diagonale, frise), les 2 premières sont gérables (couleur unie à la place du dégradé, une forme simple à la place de la vraie diagonale). La **frise chronologique** est la vraie inconnue : c'est un des éléments qui a le plus fait la différence visuelle du modèle, et le reproduire fidèlement en `docx` n'est pas garanti sans un essai concret.

**Recommandation** : avant de promettre une date, faire un **prototype isolé** (une fonction de test, jamais branchée à l'écran réel) qui génère un `.docx` avec une frise minimaliste (2 ou 3 fausses expériences), l'ouvrir dans Word/LibreOffice, et juger si le rendu est acceptable. Si le rendu est décevant, deux options de repli, à proposer à Denis le moment venu plutôt que d'improviser seul :
1. Un modèle Word « Colonne et frise » visuellement proche mais pas identique (colonne latérale + liste à puces, sans le vrai trait vertical continu).
2. Ne pas porter ce modèle précis côté Word (rester sur les 9 modèles déjà réels), et le dire clairement dans l'écran de choix du format (« ce modèle est proposé uniquement en PDF »).

## 5. Plan par tranches (même esprit que les phases 5.x du PDF)

Chaque tranche = un commit, `npm test` + test navigateur avant la suivante, comme pour le PDF.

- **W1. Squelette de l'écran unique Word** (équivalent 5.1) : retirer l'interrupteur 3 niveaux **pour le Word uniquement** dans `construireMiseEnPageCV()`, ajouter d'abord `mep-allure`/`mep-formations` aux 6 sections (vérifier avant de retirer, contrairement à ce soir côté PDF où le manque a été trouvé après coup), réutiliser telles quelles les 6 fonctions `_htmlSecXxxMiseEnPage()` déjà écrites (elles gèrent déjà le cas `dossier.formatCV !== 'pdf'` pour la plupart des champs, voir les `estPdf ? ... : ...` déjà présents). Risque faible : même mécanique que ce soir, déjà éprouvée.
- **W2. Galerie de modèles Word** (équivalent 5.2, partie galerie) : silhouettes de vignettes pour les 9 modèles de `CREATIF_MODELES_XXL` (mêmes couleurs `couleurHex` déjà présentes dans chaque recette, à réutiliser directement), câblées sur `_appliquerModeleCreatifXXL(id)`. Risque faible : la fonction d'application existe déjà, seule l'UI manque.
- **W3. Dé Word fidèle à la maquette** (cycle séquentiel au lieu d'exclusion aléatoire) : modifier `tirerModeleAleatoireXXL()` pour cycler dans l'ordre de la galerie, même logique que `_pdfProposerAutreModeleCreatif()` ce soir. Risque faible.
- **W4. Roue de couleur** : à construire une fois côté PDF (reste ouvert dans le cahier PDF), puis réutiliser le même composant pour le Word si le PDF valide l'approche, pas la peine de le faire deux fois en parallèle.
- **W5. Prototype « Colonne et frise » Word** (§ 4) : isolé, avant tout engagement d'écran réel.
- **W6 et suite** : aligner Word sur les phases 5.3 à 5.7 du PDF (organisation, expériences, formations, styles) au fur et à mesure qu'elles se stabilisent côté PDF, **toujours après**, jamais en parallèle, pour ne construire qu'une fois ce qui est déjà validé sur le format le plus riche.

## 6. Recommandation d'ordre

1. **Finir d'abord le PDF** (5.2 à 5.7) avant de démarrer W1 : construire côté Word une fonctionnalité pas encore stabilisée côté PDF reviendrait à la reconstruire deux fois.
2. **W1 à W3** peuvent être faits en une session dédiée, risque faible, forte valeur (le Word retrouve enfin le même confort d'écran que le PDF).
3. **W5 (prototype frise)** à faire tôt, même avant W1, si Denis veut lever le doute rapidement sur la faisabilité : c'est la seule vraie inconnue technique de tout ce plan.
4. **Jamais les deux en même temps sans Denis** : comme pour le PDF, chaque tranche se montre au navigateur, clair et sombre, avant la suivante.

---

**Statut** : plan proposé, aucune ligne de code écrite pour le Word ce soir. Cahier PDF (`docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md`) reste la référence pour la suite du PDF ; ce document devient la référence le jour où le chantier Word démarre réellement.
