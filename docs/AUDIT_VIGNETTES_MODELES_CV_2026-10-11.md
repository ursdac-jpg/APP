# Audit : les vignettes de modèles de CV collent-elles au vrai CV ? (2026-10-11)

Demande de Denis (Mode A, effort haut) : audit seul, aucun code modifié. Méthode : chaque modèle appliqué par le vrai clic (`_pdfChoisirModeleCreatif`, `_pdfChoisirVarianteSobre`), capturé à l'écran et comparé à sa silhouette (`_mepVignetteMini`, `js/app.js`). Constat de fond : **les vignettes sont des silhouettes dessinées à la main** (cases CSS positionnées), jamais un rendu réel. Elles ne peuvent donc dériver que du vrai CV.

## 1. Fidélité vignette / vrai CV (24 modèles Créatif, 12 Sobre)

**Collent bien** : Bandeau entier, Colonne et frise, Colonne foncée et frise, Colonne foncée, Colonne claire, Colonne foncée et rubans, Colonne foncée chronologique, Rectangles arrondis, Bandeau vertical, Colonne colorée, Vague marine (forme juste). Sobre : Bandeau pâle, Fond pâle, Épuré, Rectangles, Chronologique, Éditorial, Éditorial large, Cartes, Grille, Technique.

**Proportion exagérée** (le bandeau de la vignette fait 40 à 54 % de la hauteur, le vrai environ 9 %) : Bandeau diagonal, Ruban diagonal, Duo ovale. La vignette de Duo ovale ne montre pas non plus les cadres arrondis du vrai CV.

**Ne collent pas** :
- **Colonne à vague** (cas de la capture de Denis) : vignette = fond clair avec un carré violet à droite ; vrai = colonne dégradée à gauche, bord en vague, titres en bandeaux arrondis. La vignette réutilise la silhouette de « Colonne colorée ».
- **Cadre de page** et **Cadre et barre** : vignette = gros cadre coloré et barre pleine ; vrai = filet fin, titres en pastilles foncées.
- **Titres à pictogrammes**, **Pastille**, **Losange vert** : vignette = grande bande ou grand rond ou losange ; vrai = page blanche, un filet, un point devant chaque titre. Les trois rendus sont presque identiques entre eux.
- **Colonne et bandeau** : vignette = bandeau pleine largeur plus colonne ; vrai = colonne seule (pas de bandeau).
- **Triangle du savoir** : vignette = grand triangle en haut à gauche ; vrai = bandeau vert plein.
- **Diagonales contrastées** : vignette = bande grise ; vrai = noir et doré.
- **Médaillon** : vignette = cercle de photo ; sans photo, le vrai CV n'a pas de cercle.
- Sobre **Cartes colorées** : vignette = cartes de teintes différentes ; vrai = cartes pâles de la même teinte (identique à « Cartes »).
- Non testé : **Photo et frise** (exige une photo).

## 2. Variété (retour de Denis : « s'il y en a plusieurs pareilles, il y a un problème »)

Familles de rendus quasi identiques constatées :
- **Bandeau d'en-tête + deux colonnes de rubriques** : Bandeau entier, Bandeau diagonal, Duo ovale, Ruban diagonal, Triangle du savoir, Vague marine, Diagonales contrastées, Médaillon (seule change la forme ou la couleur du bandeau).
- **Colonne foncée à gauche** : Colonne foncée, Colonne et bandeau, Colonne foncée et rubans.
- **Point devant chaque titre, page blanche** : Titres à pictogrammes, Pastille, Losange vert.
- Sobre : Bandeau pâle, Fond pâle, Cartes, Cartes colorées, Grille se ressemblent beaucoup (deux colonnes, filets fins).

## 3. Options d'avant et choix d'un modèle

Test : ambiance Moderne plus dégradé avant le clic sur le modèle, comparé à une ambiance Discret sans dégradé.
- **22 modèles sur 24 s'appliquent identiques** quelles que soient les options d'avant (la recette du modèle réécrit tout).
- **2 modèles dépendent des options d'avant : Colonne et frise, Colonne foncée et frise** (recette incomplète). Défaut à corriger.
- Bandeau entier, Cadre de page, Titres à pictogrammes donnent un rendu différent selon le modèle choisi juste avant (probablement le nombre de colonnes mémorisé, voulu au départ : à confirmer avant de toucher).

## 4. « Annuler l'ambiance »

- Après UNE ambiance : l'annulation remet exactement l'état d'avant (rendu et réglages identiques, vérifié sur 4 cas).
- Après DEUX ambiances d'affilée : un clic revient à l'état après la première, le bouton se désactive, et **on ne peut plus revenir à l'état d'avant la première ambiance**. Demande de Denis non tenue dans ce cas.

## 5. Espace entre la colonne et le texte

Reproduit sur « Colonne claire » : la colonne beige s'arrête à 355 px et le texte (puces des missions, titres) commence à 356 px, sans aucun air. Cause : l'espace de 16 px entre les deux est rempli par la couleur de la colonne (`.col-fond`). Aggravé quand la colonne est large (curseur 30 à 70 %). À corriger sur tous les modèles à colonne pleine hauteur.

## 6. Autres constats

- Carte « Choisir une ambiance » fermée : sur un écran étroit (738 px), mon agrandissement de la palette écrase le texte en une colonne très étroite. À corriger.
- Pas encore audité : accès, depuis la carte d'ambiance, aux autres couleurs du CV (couleur de fond, deuxième couleur du dégradé, teinte de page), demande de Denis.

## 7. Efforts proposés

| Chantier | Effort | Remarque |
|---|---|---|
| Annulation jusqu'à l'état d'avant la première ambiance ; recettes de Colonne et frise ; espace colonne / texte ; carte fermée étroite | `[effort : moyen]` | Le quoi est tranché. |
| Vignettes fidèles pour toujours | `[effort : haut]` | Recommandé : les produire à partir du vrai rendu (génération automatique d'une image par modèle avec un CV d'exemple), plutôt que redessiner 15 silhouettes à la main qui dériveraient à nouveau. |
| Variété : différencier les familles de modèles trop proches | `[effort : haut]` | Décision de conception avec Denis, maquette avant code, banc B7 à garder identique pour les modèles non touchés. |
| Accès aux autres couleurs depuis la carte d'ambiance | `[effort : moyen]` à `[effort : haut]` | Audit des options existantes d'abord. |

## 8. Avancement (2026-10-11)

**Lot 1 `[effort : moyen]` FAIT et commité** : (1) plusieurs ambiances d'affilée = une seule étape d'annulation, qui revient à l'état d'avant la première (`58996283`) ; (2) Colonne et frise et Colonne foncée et frise : recette complétée avec les valeurs par défaut réelles (icônes comprises), rendu « propre » vérifié inchangé, rendu après ambiance et dégradé identique (`58996283`) ; (3) espace entre la colonne pleine hauteur et le texte : le fond rentre de 1,9 mm (`colFondRentre`, `cvPdfTemplateMaquette.js`), air mesuré de 1 px à 8 px de chaque côté sur les six modèles concernés, une page toujours ; (4) carte d'ambiance fermée sur écran étroit (palette 1,8 rem sous 900 px).

**Notes de Denis pour la suite (variété, lots 2 et 3)** : 
- chaque modèle doit avoir sa particularité, perçue dès la vignette ; pas de modèles en double ;
- la vignette doit être fidèle au CV obtenu après le clic ;
- **lignes droites ou vallonnées** : certains modèles proposent des vagues alors que leur vignette montre une ligne droite. Idée : une option « bord droit / bord vallonné » proposée pour ces modèles, et, quand deux modèles ne diffèrent que par ce bord (droit contre vallonné), leur donner chacun son bord et le montrer dans leur vignette.

**Règle de séance** : avant de commencer le lot 2 (vignettes fidèles, `[effort : haut]`), attendre la confirmation de Denis qu'il a changé le niveau d'effort.

## 9. Diagnostic du banc de non-régression (2026-10-11) et notes de Denis

**Cause des écarts du banc sur ce poste (mesurée)** : (1) l'empreinte PDF diffère de +32 caractères pour les 35 modèles et l'empreinte Word diffère partout : la photo du jeu d'essai est fabriquée par le navigateur (`canvas.toDataURL`), son encodage JPEG change d'une version de navigateur à l'autre. Ce n'est pas une régression. (2) L'empreinte du XML Word est IDENTIQUE à la référence pour 28 modèles sur 36 ; elle diffère pour les 7 modèles à colonne pleine hauteur (le changement voulu du fond de 1,9 mm, que Word lit aussi) et pour Colonne foncée et frise. Ce dernier cas est une référence polluée par l'ordre : elle a été prise juste après Colonne foncée chronologique ; mesuré en état propre, l'ancienne et la nouvelle recette donnent exactement le même XML (a33d6e68:48595).

**Solutions** : (a) photo fixe écrite en dur dans le banc + référence refaite au dernier commit d'avant les changements du jour + remise à zéro de l'état entre deux modèles (recommandé) ; (b) comparer seulement le XML Word (écarte la photo mais perd le contrôle du HTML) ; (c) exiger le même navigateur que la référence (impossible). Le futur générateur de miniatures (lot 2) peut doubler ce banc par une comparaison d'images.

**Suite complète des essais (96)** : elle ne se termine pas d'un bloc. Solution : lancer par lots courts avec rechargement et stockage vidé entre deux lots, résultats cumulés, et repérer par dichotomie l'essai qui bloque.

**Note de Denis (à traiter après les tâches en cours)** : sur les modèles, pouvoir changer les couleurs et choisir le dégradé, avec le choix de ce qui est dégradé : la colonne ou le bandeau, la couleur principale ou la couleur secondaire. À regarder une fois les tâches finies (maquette avant code).

## 10. Contrôle dans un vrai Word des 7 modèles dont le fond de colonne a changé (2026-10-11)
Les 7 fichiers `.docx` (Colonne à vague, Colonne foncée, Colonne claire, Colonne et bandeau, Colonne foncée et rubans, Colonne foncée chronologique, Sobre Chronologique) ont été produits par le banc (`rendre(modele, true)` expose maintenant le fichier : `res.blob`), ouverts par le vrai Word (`scripts/word/word-mesurer.ps1`) et convertis en images (`pdf-vers-png.ps1`). **Résultat : les 7 s'ouvrent sans erreur, chacun tient sur une page, le fond de la colonne s'arrête avant le texte (environ 2 mm d'air visibles), les formes sont justes (vague, bord droit, colonne à droite pour les deux chronologiques, bandeau complet pour Colonne et bandeau, comme dans le HTML).** Les fichiers de contrôle sont dans `scripts/rendu/sortie/` (ignoré par git).

## 11. Ressemblance de structure entre les modèles (2026-10-11, `node scripts/rendu/ressemblance.js [seuil]`)
Outil d'aide à la décision pour la variété, calculé à partir des 37 rendus enregistrés (indice de recouvrement des traits de structure : classes, formes de style, nombre de colonnes ; il ne voit NI la couleur NI le texte). **Il confirme et chiffre l'observation de Denis : plusieurs modèles ne se distinguent que par la couleur ou par un détail.**

Paires les plus proches (100 % = mêmes traits) :
- **Colonne claire / Colonne foncée : 100 %** (structure identique : seule la couleur de la colonne change, beige ou marine). Colonne foncée et rubans : 91 % de chacune ; Colonne et bandeau : 89 % ; Colonne à vague : 88 % ; Colonne colorée : 83 %.
- **Épuré / Fond pâle (Sobre) : 97 %** ; Épuré / Technique 89 % ; Bandeau pâle / Épuré 87 %.
- **Diagonales contrastées / Ruban diagonal : 96 %** ; Diagonales contrastées / Triangle du savoir 80 %.
- **Colonne et frise / Colonne foncée et frise : 96 %** (la couleur de la colonne change).
- **Cartes colorées / Cartes (Sobre) : 94 %** (CORRECTION du 2026-10-11 : j'avais écrit « identiques dans Word » à tort, d'après deux captures du navigateur ; les empreintes Word des deux modèles DIFFÈRENT, seules des couleurs changent ; à regarder dans un vrai Word avant d'enrichir).
- **Cadre de page / Titres à pictogrammes : 92 %** ; Bandeau entier / Cadre de page 86 % ; Bandeau entier / Titres à pictogrammes 86 %.
- Bandeau entier / Bandeau diagonal : 88 % ; Éditorial / Grille 87 % ; Éditorial large / Éditorial 85 % ; Duo ovale / Triangle du savoir 81 %.
- Même modèle présent en Créatif et en Sobre (Photo et frise 92 %, Rectangles arrondis 92 %) : voulu, l'allure change.
- Colonne foncée chronologique / Chronologique (Sobre) : 84 % (voulu, mêmes mécaniques).

**À lire avec prudence** : 100 % de structure ne veut pas dire « le même CV aux yeux de la personne » (une colonne beige et une colonne marine se voient très bien). La question de Denis est : cette différence de couleur suffit-elle à justifier deux modèles, ou faut-il donner à l'un une vraie particularité (forme, bord vallonné, titres, disposition) ?
