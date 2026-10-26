# Audit : formes de bandeau et de colonne sur TOUS les modèles (2026-10-21)

État mesuré par le banc de rendu (`scripts/rendu/capacites.json`, 38 modèles). Sert de base à la décision de Denis (point 4 de la passation, demande de l'étape 11).

## Résumé

- **Complets (bandeau et colonne)** : 5 (chronoFonce, colonneBandeau, colonneFoncee, colonneRuban, sidebarVague)
- **Bandeau fait, colonne à voir** : 5 (colonneClaire, duoOvale, mqBandeau, mqColonne, vagueMarine)
- **Bandeau à ouvrir (en-tête ordinaire : facile)** : 8 (cadreBarre, losangeVert, mqCadre, mqPicto, pastille, S:mq-epure, S:mq-fond, standard)
- **En-tête particulier (diagonale, vertical, médaillon, bandeau pâle)** : 7 (bandeauVertical, diagonalesContrastees, medaillon, mqDiagonale, rubanDiagonal, triangleSavoir, S:mq-bandeau)
- **Structure propre (frise, rectangles, photo, chrono)** : 7 (frise, friseFoncee, photoFrise, rectangles, S:mq-chrono, S:mq-photo, S:mq-rectangles)
- **Sans bandeau du tout** : 6 (S:mq-cartes, S:mq-cartes-couleurs, S:mq-editorial, S:mq-editorial-large, S:mq-grille, S:mq-technique)

## Tableau

| Modèle | Bandeau | Colonne | Formes de bandeau | Formes de colonne | Catégorie |
|---|---|---|---|---|---|
| creatif:bandeauVertical | natif | ajoutable | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:cadreBarre | ajoutable | ajoutable | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| creatif:chronoFonce | ajoutable | natif | oui | oui | Complets (bandeau et colonne) |
| creatif:colonneBandeau | natif | natif | oui | oui | Complets (bandeau et colonne) |
| creatif:colonneClaire | ajoutable | natif | oui | non | Bandeau fait, colonne à voir |
| creatif:colonneFoncee | ajoutable | natif | oui | oui | Complets (bandeau et colonne) |
| creatif:colonneRuban | ajoutable | natif | oui | oui | Complets (bandeau et colonne) |
| creatif:diagonalesContrastees | natif | ajoutable | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:duoOvale | natif | ajoutable | oui | non | Bandeau fait, colonne à voir |
| creatif:frise | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| creatif:friseFoncee | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| creatif:losangeVert | ajoutable | ajoutable | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| creatif:medaillon | natif | ajoutable | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:mqBandeau | natif | non | oui | non | Bandeau fait, colonne à voir |
| creatif:mqCadre | ajoutable | non | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| creatif:mqColonne | ajoutable | natif | oui | non | Bandeau fait, colonne à voir |
| creatif:mqDiagonale | natif | non | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:mqPicto | ajoutable | non | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| creatif:pastille | ajoutable | ajoutable | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| creatif:photoFrise | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| creatif:rectangles | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| creatif:rubanDiagonal | natif | ajoutable | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:sidebarVague | ajoutable | natif | oui | oui | Complets (bandeau et colonne) |
| creatif:triangleSavoir | natif | ajoutable | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| creatif:vagueMarine | natif | ajoutable | oui | non | Bandeau fait, colonne à voir |
| sobre:mq-bandeau | natif | non | non | non | En-tête particulier (diagonale, vertical, médaillon, bandeau pâle) |
| sobre:mq-cartes | non | non | non | non | Sans bandeau du tout |
| sobre:mq-cartes-couleurs | non | non | non | non | Sans bandeau du tout |
| sobre:mq-chrono | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| sobre:mq-editorial | non | non | non | non | Sans bandeau du tout |
| sobre:mq-editorial-large | non | non | non | non | Sans bandeau du tout |
| sobre:mq-epure | ajoutable | non | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| sobre:mq-fond | ajoutable | non | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |
| sobre:mq-grille | non | non | non | non | Sans bandeau du tout |
| sobre:mq-photo | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| sobre:mq-rectangles | non | natif | non | non | Structure propre (frise, rectangles, photo, chrono) |
| sobre:mq-technique | non | non | non | non | Sans bandeau du tout |
| standard | ajoutable | non | non | non | Bandeau à ouvrir (en-tête ordinaire : facile) |

## Pourquoi certains modèles n'ont pas les formes

- **Bandeau** : les formes ne s'ouvrent que si l'en-tête est un bandeau coloré ordinaire ET que la recette du modèle déclare `bordBandeauChoix` ET que le modèle est de la famille Créatif (`opts.creatifActif`). Standard et Sobre sont donc exclus d'office, même quand on peut leur ajouter un bandeau (14 modèles « ajoutable »). Cette limite se lève dans `cvPdfTemplateMaquette.js` (une condition) et dans les recettes.
- **Colonne** : les formes de colonne se dessinent sur le fond plein hauteur de la colonne (`col-vague-g` / `col-vague-d`, recette `colonneVague`). Les modèles dont la colonne est un simple bloc coloré (Standard avec fond de colonne, Sobre, `mqColonne`, `colonneClaire` qui est une carte) ou une structure propre (`.fr-lat`, `.ph-lat`, `.rc-col`) n'ont pas ce fond : il faudrait le leur donner.
- **En-têtes particuliers** : diagonale (3 modèles, polygone propre), nom vertical, photo en médaillon à cheval sur le bord bas, bandeau pâle du Sobre : les formes du bord bas se battent avec ce que le modèle dessine déjà.
- **Sans bandeau** (13 modèles, dont 6 Sobre sans aucun bandeau) : l'en-tête est un texte sur fond blanc, très proche de « Deux filets » ou « Contour » (idée de Denis).

## Recommandation (ordre proposé, un commit par étape)

1. **4.1 Bandeau pour les 8 modèles ordinaires** (cadreBarre, losangeVert, mqCadre, mqPicto, pastille, Sobre épuré, Sobre fond, Standard) : lever la limite Créatif, déclarer le choix du bord dans leurs recettes, mesurer que le texte reste dans la forme (essais et banc). Gain : 8 modèles, dont le Standard. Effort moyen à haut, risque faible.
2. **4.2 Colonne pour les modèles qui ont déjà une colonne colorée** (`mqColonne`, `colonneClaire`) et pour ceux où on ajoute un fond de colonne (10 modèles « ajoutables » dont le Standard) : donner à ce fond le mode plein hauteur dessiné (le même que `colonneFoncee`). Risque réel de régression visuelle : maquette avant code.
3. **4.3 En-têtes particuliers** (6 Créatif + Sobre bandeau pâle) : une maquette par famille (diagonale, vertical, médaillon, pâle) pour décider quoi autoriser.
4. **4.4 Structures propres et sans bandeau** (13 + 7) : décision de Denis par famille (offrir seulement les formes vides contour et filets, ou permettre d'ajouter un vrai bandeau), à traiter avec les étapes 6 et 7 de la passation.

## Décisions à prendre avec Denis

- Lancer 4.1 tout de suite (recommandé : simple et visible tout de suite sur le Standard) ?
- Pour 4.2 : accepter que « ajouter un fond de colonne » donne la colonne pleine hauteur dessinée (changement de look du fond) ?
- Pour 4.4 : sur les modèles sans bandeau, offrir « Deux filets » et « Contour » comme porte d'entrée, ou proposer d'ajouter un bandeau coloré ?

## Étape 4.1 FAITE (2026-10-21)

Les formes de bandeau s'ouvrent maintenant sur tout bandeau coloré ordinaire, Standard et Sobre compris : 19 modèles au lieu de 10 (nouveaux : Standard, cadreBarre, losangeVert, mqCadre, mqPicto, pastille, Sobre épuré, Sobre fond, triangleSavoir). Restent exclus : les diagonales, le nom vertical, le médaillon, le ruban diagonal et le bandeau pâle du Sobre (étape 4.3). Un modèle sans choix de la personne garde son bord d'origine (valeur vide de `regBordBandeau`, arrondi quand les coins le sont) ; changer de modèle remet le bord d'origine. Essai `formesTousModeles` (19 modèles). Prochain : 4.2 (colonne).

## Étape 4.3 FAITE (2026-10-21) : 32 modèles sur 38 ont les formes de bandeau

Ajouts : Bandeau vertical, Mq diagonale, Ruban diagonal, Diagonales contrastées, Médaillon (la photo suit le bord bas de la forme), Triangle du savoir, Sobre bandeau pâle (forme dessinée en teinte pâle, texte sombre, pas de texte à deux tons), et les modèles Sobre éditorial, éditorial large, technique, cartes, grille, cartes colorées et chrono (le bandeau s'ajoute, couleur pleine pour l'instant). Le modèle d'origine reste le départ (valeur vide de `regBordBandeau`). SANS formes de bandeau : Frise, Frise foncée, Photo et frise (décision de Denis : on ne fait rien), Rectangles, Sobre photo, Sobre rectangles (à confirmer avec Denis). Reste à faire : bandeau Sobre « doux » par défaut (teinte claire, couleur pleine au choix).

## Étape 4.2 FAITE (2026-10-21) : la colonne au choix sur tous les CV à deux colonnes

La colonne dessinée pleine hauteur (mécanisme de Colonne foncée) s'applique maintenant à tout CV à DEUX colonnes dont une colonne est colorée, Standard et Sobre compris (`colonneAuto`, `cvPdfTemplateMaquette.js`). Table des capacités régénérée : 26 modèles ont des formes de colonne (19 de plus : le Standard, 13 Créatif, Sobre bandeau, fond, épuré, plus Colonne claire dont la carte est devenue la forme « Carte flottante » de départ). Restent sans formes de colonne : Frise, Frise foncée, Photo et frise, Rectangles, Sobre photo, Sobre rectangles (structures propres, étape 4.4) et Sobre éditorial, éditorial large, technique, cartes, cartes colorées, grille (colonne jamais colorée, étape 4.4). L'onglet « Colonne » suit le nombre réel de colonnes (classe `deux-col`) ; sans fond de colonne, « Aucune » est cochée et choisir une forme colore la colonne. Maquette : `docs/MAQUETTE_COLONNES_TOUS_MODELES_2026-10-21.html`.
