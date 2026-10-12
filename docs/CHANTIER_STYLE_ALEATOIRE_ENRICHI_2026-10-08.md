# Chantier « Style aléatoire plus riche » (demande de Denis, 2026-10-07), Mode A, `[effort : haut]`

> Statut : AUDIT DE L'EXISTANT FAIT, PROPOSITION À VALIDER PAR DENIS, rien codé.

## 1. La demande (mots de Denis)
Le bouton « Style aléatoire » est pauvre en variété visuelle comparé à tout ce que savent faire les modèles de CV. Il veut plus de richesse, **cohérente, visuelle et uniquement visuelle** (jamais le contenu), pour une colonne comme pour deux colonnes, avec plus de choix et de styles derrière le bouton. Il remarque qu'un clic fait passer d'une colonne à deux colonnes.

## 2. Ce que fait le bouton aujourd'hui (lu dans `cvPdfPanneauReglages.js`, bouton `btnStyleAleatoire`)
Trois comportements selon l'allure active :
- **Standard** (`_pdfGenererStyleAleatoire`) : tire une palette (`_PDF_PALETTE_ALEATOIRE`), la largeur de colonne, le séparateur, le fond des colonnes (aucun, gauche, droite, pleine hauteur), la forme de l'en-tête (rectangle ou diagonale), le dégradé, les coordonnées en ligne (nouveau, 30 %), la disposition de l'en-tête, l'anneau de la photo, la lecture guidée, le style des rubriques, le soulignement du poste. Garde-fou : jamais deux tirages quasi identiques de suite.
- **Créatif** (`_pdfProposerAutreModeleCreatif`) : **n'est pas un tirage** : passe au modèle suivant DANS L'ORDRE de la galerie.
- **Sobre** (`_pdfProposerVarianteSobreSuivante`) : idem, variante suivante dans l'ordre.
Le nombre de colonnes change parce que certains modèles imposent 1 ou 2 colonnes (rectangles : 1 ; colonne, photo et frise : 2 ; Sobre : variantes à 1 ou 2 colonnes).
Ce qui existe mais n'est PAS tiré : les 6 ambiances (couleur, titres, compétences, coins, traits, icônes), les 15 couleurs de base et leurs nuances, les titres « filet prolongé » et « souligné court », le coin coloré en haut à gauche, la teinte de page crème, les 37 modèles en tirage libre, la disposition d'en-tête décalée.

## 3. Proposition : tirer une « recette » cohérente (au lieu d'options indépendantes)
Une recette = un modèle + une ambiance + une couleur + quelques variantes visuelles compatibles avec ce modèle :
1. **Modèle** : tiré au hasard parmi les modèles compatibles avec le nombre de colonnes **que la personne a choisi** (le bouton ne change plus le nombre de colonnes ; pour le changer, « Voir tous les modèles » ou le réglage de colonnes). Plus de passage « dans l'ordre ».
2. **Ambiance** (une des 6) puis **couleur** : la couleur de l'ambiance, ou une des 15 couleurs de base.
3. **Variantes visuelles autorisées** (chacune seulement quand le modèle la supporte) : style des titres de rubrique (souligné, filet prolongé, souligné court, pastille), style des compétences (pastille, rectangle, texte), coins arrondis ou non, icônes ou non, dégradé ou aplat, coin coloré en haut à gauche, teinte de page crème (rare), coordonnées en ligne (modèles à ligne droite), photo avec ou sans anneau.
4. **Jamais** : le texte, l'ordre des rubriques et des expériences choisis par la personne, les intitulés, les tailles réglées à la main, la photo elle-même, l'accroche, la disposition d'en-tête réglée à la main.
5. **Variété** : ne jamais refaire la même recette deux fois de suite ; mémoire des 6 derniers modèles tirés.
6. **Annulation** : « Annuler le dernier tirage » existe déjà et reste (état d'avant restauré).
7. **Cohérence** : une recette est un ensemble connu et testé, pas un mélange hasardeux : la grille des combinaisons autorisées par famille de modèles est établie par mesure sur les 37 modèles avant tout code (comme pour l'en-tête).

## 4. Questions à trancher par Denis (une recommandation à chaque fois)
1. **Le bouton garde-t-il le nombre de colonnes de la personne ?** Recommandé : oui (sinon un clic change la structure du CV, ce qui surprend). Risque : moins de modèles dans le tirage quand elle a choisi 1 colonne.
2. **Tirage libre parmi tous les modèles compatibles, ou dans la famille de l'allure active (Standard, Créatif, Sobre) ?** Recommandé : tous (c'est la richesse demandée). Risque : passer de Sobre à un modèle coloré d'un clic ; mitigé par « Annuler le dernier tirage ». Variante : garder l'allure Sobre si elle est active (recommandé aussi).
3. **Les variantes de la liste 3 te conviennent-elles ?** À valider ou retirer ligne par ligne.
4. **Fréquence des coordonnées en ligne** : 30 % sur les modèles à ligne droite (déjà en place).

## 5. Faisabilité et risques
**GO AVEC RÉSERVES.** Simple : toutes les briques existent (galerie, ambiances, palettes, variantes de titres et de compétences, annulation). Risqué : la grille de compatibilité modèle × variante (un tirage ne doit jamais produire un CV illisible : texte clair sur fond clair, titre qui déborde) et la reprise du tirage dans trois chemins différents du code (Standard, Créatif, Sobre) en un seul. Plan : (1) mesure de la grille sur les 37 modèles, (2) une fonction de tirage unique, (3) essai de non-régression sur 300 tirages (contraste, débordement, une page), (4) l'ancien comportement par allure retiré. **NON APTE AU MODE NUIT** tant que les 4 questions ci-dessus ne sont pas tranchées.
