# Chantier : disposition par défaut du CV (le même principe pour tous les modèles) - 2026-09-29

> Cahier de suivi. **État (2026-09-29, fin de séance) : FAIT et vérifié dans le navigateur** (voir les sections « FAIT » en bas). Reste : Frise / Rectangles / Photo (construction propre, non traités) et le test dans le vrai Word.
> Mode A (décision de conception). Avant tout code : audit du moteur de disposition actuel, maquette, questions (protocole de `CLAUDE.md`).

## La demande de Denis (message du 2026-09-29, avec capture d'écran d'un CV « Standard »)
Un principe à appliquer **partout** : quand un CV sort, il est présenté d'office dans cet ordre.

1. **Compétences professionnelles** et **compétences comportementales**, côte à côte sur 2 colonnes, en haut.
2. **Expérience professionnelle.**
3. **Formations.**
4. **Expérience personnelle, juste après les formations, SI ses missions sont développées.**
   Si elles ne sont PAS développées (pas de missions), on les **cite** : une simple liste d'intitulés (« Bricolage », « Bénévolat »...), qui reste **avant** « Langues » et « Centres d'intérêt ».
5. **Logiciels et outils, Langues, Centres d'intérêt** : plus bas, car ce sont de petites rubriques.
   - S'ils tiennent, on **regroupe les trois sur une même ligne**.
   - Sinon, s'il reste de la place à côté d'une rubrique qui ne remplit pas la largeur (exemple : « Formations », sans missions), on met « Logiciels et outils » **sur la même ligne que Formations**.

## Ce que montre la capture (état actuel, pour comparer)
- Compétences pro et comportementales côte à côte, puis Expérience pro, Formations : **conforme**.
- « Logiciels et outils » est seul sur une ligne, « Langues » et « Centres d'intérêt » côte à côte : le regroupement des trois n'est **pas** fait.
- « Expérience personnelle » (missions développées) est tout en bas, **après** Langues et Centres d'intérêt : ne suit **pas** la règle (elle devrait suivre les Formations).

## Complément de Denis (même jour) : le bouton « Mise en page » doit CALCULER et PROPOSER ces regroupements
Quand la personne clique sur **« Mise en page »** (l'optimisation automatique, avec sa zone de suggestions), l'application doit **recalculer, selon le contenu réel de chaque rubrique,
quelles rubriques peuvent partager une ligne** (exemple : Logiciels + Langues + Centres d'intérêt, ou Logiciels à côté de Formations quand celles-ci ne remplissent pas la largeur),
et **le proposer comme solution** à la personne. C'est **impératif** (mot de Denis) : ce n'est pas seulement une disposition de départ, c'est l'un des calculs et des
propositions du bouton. Points d'appui : `_htmlZoneSuggestionsMep` / `_htmlPanneauSuggestionsMep` (`js/app.js`), leviers d'optimisation `_pdfEssayerTasserEspaces` (`cvPdfPanneauReglages.js`).

## À décider / vérifier avec Denis avant de coder
1. Cette règle remplace-t-elle l'ordre actuel de TOUS les modèles, ou seulement celui du modèle Standard et des modèles à une colonne ? (« le principe qu'on va appliquer partout »)
2. Comment mesure-t-on « ça tient sur une ligne » ? (la largeur réelle mesurée dans le rendu, comme pour l'équilibrage des colonnes déjà en place)
3. Que devient le choix « Organisation du CV > Personnaliser » et l'ordre choisi à la main par la personne ? (la règle ne doit s'appliquer qu'au point de départ, jamais écraser un choix)
4. « Expérience personnelle citée » : en mode « Citer seulement » de la carte (déjà existant), ou dès qu'aucune mission n'est affichée ?
5. Word : il hérite de la disposition du PDF (extraction du rendu), donc aucun code Word séparé, à mesurer dans le vrai Word.

## Points d'appui déjà repérés dans le code (à confirmer par audit)
- Ordre des rubriques et colonnes : `modules/cv-pdf-html/cvPdfTemplateMaquette.js` (`_pdfDispositionDepartColonnes`, `_pdfNormaliserDispositionColonnes`, rubriques qui débordent : Proposition B du 2026-09-28).
- Équilibrage automatique des colonnes : `_pdfEssayerRequilibrageColonnes` (`cvPdfPanneauReglages.js`).
- Mode « Citer seulement » de l'expérience personnelle : carte `cExpPerso` (`cvPdfCartesMaquette.js`).

## ÉTAT au 2026-09-29 (soir) : FAIT et vérifié dans le navigateur (commits `34e59af`, `b899328`, `8ad49c4`, `d079a0b`, `09732a8`, `f9f7cba`)
Règles de Denis codées, gabarit commun (Standard, Sobre, 16 créatifs) ; « Colonne et frise », « Rectangles » et « Photo » ont leur propre construction, non modifiés :
- **Une colonne** : Logiciels + Langues + Centres d'intérêt sur UNE ligne quand chacun tient dans un tiers (≤ 30 caractères) ; expérience personnelle développée juste après les formations, citée avant ces petites rubriques.
- **Bouton « Mise en page »** : propose, après mesure du rendu, « sur une ligne » et « Logiciels à côté des Formations » (avec le gain en lignes).
- **Deux colonnes** : Logiciels, Langues, Centres d'intérêt dans la colonne de GAUCHE ; formations puis expérience personnelle dans la colonne de DROITE ; plus de ligne pleine largeur en bas. Compétences PROFESSIONNELLES en tête de la colonne de droite quand la page tient (mesure, `_pdfEssayerCompProDroite`), sinon en tête de la gauche. Langues et Centres redeviennent des blocs déplaçables dans « Personnaliser », qui démarre sur la disposition affichée (rien ne bouge au clic).
- Un ordre choisi à la main (Personnaliser) n'est jamais écrasé.
## À FAIRE ENSUITE (demande de Denis, 2026-09-29) : déplacer les rubriques à la SOURIS dans le grand aperçu
Bouton « déplacer les rubriques » dans le plein écran (comme « Déplacer une expérience ») : prendre une rubrique à la souris et la déposer sur un EMPLACEMENT PRÉDÉFINI (jamais placement libre). Le bouton « Personnaliser » garde son fonctionnement propre. Base technique : la même disposition `ordreColonnes` ({ gauche: [[...]], droite: [[...]] }). Mode A : maquette et questions avant code.
## Cas non traités (à décider plus tard)
Modèles Colonne/Frise/Rectangles/Photo (construction propre) ; escalier signalé par Denis sur deux rubriques d'une même ligne (non reproduit : 0 px d'écart mesuré sur les 19 modèles, exemple demandé).

## FAIT (2026-09-29, soir) : déplacer les rubriques à la souris, première version
Bouton « Déplacer les rubriques » dans le grand aperçu (modèles à gabarit commun ; masqué sur Frise, Rectangles, Photo) : poignée ⠿ sur chaque rubrique, emplacements prédéfinis bleus, verrou sur l'expérience professionnelle (reste à droite), passage en ordre personnalisé, « Annuler le dernier déplacement » et « Disposition automatique ». Deux colonnes : rubriques empilées dans chaque colonne ; une colonne : les 4 grands groupes (compétences, expériences, formations, petites rubriques). Maquette : `docs/MAQUETTE_DEPLACER_RUBRIQUES_2026-09-29.html`.
## À FAIRE ENSUITE (demandes de Denis) : rubriques CÔTE À CÔTE
- Deux petites rubriques côte à côte dans une colonne (ex. dans la colonne de droite).
- Une colonne : changer la place des rubriques ET mettre 2 ou 3 petites rubriques (Logiciels et outils, Langues, Centres d'intérêt) sur la même ligne, la place le permettant. Demande un modèle de disposition à une colonne plus fin que les 4 groupes actuels (une ligne = 1 à 3 rubriques). Mode A : maquette d'abord.
- **Quelles rubriques peuvent partager une ligne (précision de Denis)** : toute rubrique « courte », c'est-à-dire SANS missions développées : Logiciels et outils, Langues, Centres d'intérêt, Informations complémentaires, **Formations quand elles sont seulement en descriptif** (missions non affichées), **Expérience personnelle quand elle est seulement citée** (liste d'intitulés). Formations peut se regrouper avec Logiciels ou avec une autre rubrique courte. Une rubrique avec missions développées (expériences, formations avec missions, expérience personnelle développée) reste seule sur sa ligne.
## FAIT (2026-09-29, soir) : deuxième version, rubriques côte à côte
Grand aperçu : cases « à côté » qui montrent la part que prendrait la rubrique (moitié de la ligne si la ligne n'en partage qu'une, un tiers si elle en partage deux). Une colonne : lignes de 1 à 3 rubriques (`lignesUneColonne`, rendu dans `cvPdfTemplateMaquette.js`) ; deux colonnes : 2 rubriques par ligne dans la grande colonne, 1 dans l'étroite ; « Expérience professionnelle » reste à droite, toute autre rubrique peut se placer au-dessus d'elle. Rubriques avec missions : seules sur leur ligne (règle actuelle, en discussion pour Formations + Expérience personnelle développées à une colonne).
