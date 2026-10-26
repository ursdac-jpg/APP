# Compatibilité des sept compositions avec nos modèles de CV (2026-10-22)

Demande de Denis : regarder et vérifier quels modèles sont compatibles avec les compositions (plaque de titre, diagonale partagée, équerre, L d'un seul tenant, teintes superposées, onglet de classeur, carte qui chevauche). Règle voulue : ces options existent pour tout CV à bandeau ; si la personne passe le CV sur deux colonnes, elles apparaissent. Décisions déjà prises : une seule taille de coin, angle « droit » ou « arrondi » seulement (pas de biseau), textes toujours lisibles, option impossible = masquée (jamais grisée).

Méthode : outil de contrôle de développement (non livré) qui applique chaque composition sur le rendu réel de 33 modèles et mesure : texte clair sur fond clair, texte sombre sur fond foncé, texte à cheval sur deux zones, blocs de l'en-tête qui sortent du bandeau ou se chevauchent ; plus lecture visuelle d'échantillons (colonne claire, grille, médaillon, cartes colorées).

## Résultat par famille

| Famille | Modèles | Verdict |
|---|---|---|
| Bandeau + colonne à gauche, formes droites | Colonne et bandeau, Colonne foncée, Colonne claire, Colonne foncée et rubans, Bandeau pâle, Fond pâle, Épuré, Éditorial, Technique, Grille, Cartes, Cartes colorées, Standard, Bandeau entier | **Compatibles**, aucun défaut mesuré |
| Forme d'origine ondulée ou oblique | Vague marine, Colonne à vague, Bandeau diagonal, Ruban diagonal, Diagonales contrastées, Bandeaux noirs, Triangle du savoir | **Compatibles** : la composition remplace la forme, donc pas de trou blanc |
| Une seule colonne (8 modèles) | Chronologique, etc. | **Compatibles après passage à deux colonnes** (bouton proposé), sauf « Frise » (voir exclus) |
| Avec réserve | Cartes et Cartes colorées, Médaillon, Cadre et barre | voir ci-dessous |
| Colonne à droite (4 modèles) | Colonne foncée chronologique, Colonne, Chrono, Éditorial large | recettes à inverser en miroir : **masquées au début** |
| Exclus | Bandeau vertical, Frise, Frise foncée, Photo et frise, Rectangles, Sobre Photo, Sobre Rectangles | **masquées** : pas de bandeau horizontal, ou structure en grille propre |

## Réserves à traiter au code

1. **Cartes et Cartes colorées** : le texte posé dans une carte (fond propre clair) doit garder sa couleur sombre. La règle « zone sombre = texte blanc » ne doit pas s'appliquer à un texte dont le fond propre est clair (constaté : pastilles blanches illisibles sur carte pâle). Règle à coder : la couleur du texte se décide d'après le fond réellement derrière lui.
2. **Médaillon** : la plaque claire n'apparaît pas à l'essai ; à reprendre au banc (photo en médaillon qui déborde sur le bord bas).
3. **Cadre et barre** : l'onglet de classeur fait passer un texte à cheval sur le bord ; à vérifier, ou composition « onglet » masquée pour ce modèle.
4. **Bandeau vertical** : les blocs de l'en-tête débordent, exclu.
5. **Frise** : même après passage à deux colonnes, des textes débordent, exclu.

## Ce que cela implique pour le code (non commencé)

* Une table de capacités (comme `cvPdfCapacitesModeles.js`, B.39) donne, par modèle : bandeau oui/non, colonne à gauche oui/non/ajoutable, compositions autorisées.
* La couleur du texte se décide zone par zone, d'après le fond réel.
* Une composition remplace la forme du bandeau et de la colonne (onglets de forme masqués pendant qu'elle est active).
* Vérifications avant livraison : banc de rendu (aucun écart sur les modèles sans composition), impression PDF réelle, Word réel (arrondi intérieur du L, angles de la diagonale), un essai de parcours qui vérifie qu'aucun texte n'est illisible.
* Mode de travail : Mode A, effort haut. Mode nuit : non apte avant validation des décisions ci-dessous.
