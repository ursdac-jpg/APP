# Analyse : quelles formes et quels modèles peuvent recevoir le choix « angle au croisement » (2026-10-22)

Demande de Denis (2026-10-22) : regarder forme par forme et modèle par modèle, parce que « pour la vague, ça ne marche pas, il y a un trou blanc ». Cette analyse porte sur le choix d'angle au croisement (droit, arrondi, biseau), le liseré blanc et la taille réglable du coin. Elle ne code rien. Méthode : (1) **mesure** dans le navigateur de la forme réelle de chaque bord (bas du bandeau près de la colonne, bord droit de la colonne sous le bandeau) avec les chemins que le moteur construit déjà (`--clip-bandeau`, `clip-path` de la colonne) ; (2) **lecture de la structure** des 39 modèles rendus par le banc.

## Principe
Le croisement est le coin rentrant entre le **bas du bandeau** et le **bord droit de la colonne**, au point (largeur de la colonne, hauteur du bandeau). Un angle propre n'existe que si, autour de ce point, le **bas du bandeau est une horizontale** et le **bord de la colonne une verticale**. Sinon on voit un trou blanc ou un raccord faux (cas du bord vallonné).

## 1. Formes de BANDEAU (mesure du bas du bandeau, à 300 à 380 px du bord gauche)
| Forme | Mesure | Verdict |
|---|---|---|
| droit | horizontale exacte | OUI |
| arrondi | horizontale (les arrondis sont aux extrémités de la page) | OUI |
| coin (coin coupé à gauche) | horizontale à partir de 14 % de la largeur | OUI |
| ruban, ruban court | bas horizontal (c'est le côté droit qui est oblique) | OUI, avec réserve (côté droit oblique) |
| carte, pilule | bas horizontal mais DÉTACHÉ (décalé de 6 à 8 px, extrémités arrondies) | OUI, avec réserve (le bas du bandeau est à H moins 6 px : à mesurer) |
| demi-ovale | légère courbe (3 px) | NON (courbe) |
| diagonale | oblique (environ 7°) | NON |
| vallonné, vague 2, créneaux, pointe | ondulé, dentelé ou en V | NON (trou blanc) |
| contour, contour rond, filets | pas de fond plein, seulement des traits | NON |

## 2. Formes de COLONNE (mesure du bord droit, juste sous le bandeau)
| Forme | Mesure | Verdict |
|---|---|---|
| droit | verticale exacte | OUI |
| arche | bord droit vertical (c'est le haut qui s'arque) | OUI, avec réserve (haut arqué visible seulement si la colonne est devant) |
| pointe en bas, coin | bord droit vertical (seul le bas change) | OUI |
| demi-ovale, créneaux | vertical sur la zone du croisement (la forme est plus bas) | OUI, avec réserve (à vérifier au banc) |
| diagonale | presque vertical (3° d'écart) | NON (l'angle n'est plus de 90°) |
| carte, pilule | bord droit vertical mais colonne DÉTACHÉE de la page (marge, coins arrondis) | OUI, avec réserve (colonne flottante : le croisement est différent) |
| vallonné, vague 2 | ondulé (6 à 12 px d'écart) | NON (trou blanc) |
| contour, contour rond, filets | traits, sans fond plein | NON |

## 3. Modèles (structure lue sur le rendu des 39 modèles)
Règle : l'option apparaît si le modèle a un bandeau ET une colonne (natifs ou ajoutables) ET que les formes choisies sont « OUI » ci-dessus. Sinon elle est masquée (jamais grisée).

**A. Proposée d'office (formes droites par défaut)**
- Créatif : *Colonne et bandeau* (les deux natifs, le cas idéal), *Bandeau entier* (colonne ajoutable), *Colonne foncée*, *Colonne claire* (colonne en carte : réserve), *Colonne foncée et rubans*, *Colonne*, *Colonne foncée chronologique*, *Duo ovale* (bandeau arrondi : OUI).
- Sobre : *Bandeau pâle*, *Chronologique*, *Fond pâle*, *Épuré*, *Éditorial*, *Éditorial large*, *Technique*, *Grille*, *Cartes*, *Cartes colorées* (bandeau et colonne ajoutables, formes droites par défaut).
- *Standard* (bandeau et colonne ajoutables).

**B. Proposée seulement après le choix d'une forme droite (la forme d'origine ne convient pas)**
- *Bandeau diagonal*, *Ruban diagonal*, *Diagonales contrastées* (bandeau diagonal d'origine), *Vague marine* (vallonné), *Bandeaux noirs* (vague et diagonale), *Triangle du savoir* (triangle), *Colonne à vague* (colonne vallonnée d'origine). Le choix s'ouvre dès que la personne passe le bandeau ou la colonne en forme droite.
- *Médaillon* : bandeau arrondi, mais la photo en médaillon déborde sur le bord bas : réserve, à vérifier au banc.

**C. Jamais proposée (structure différente ou pas de colonne ou pas de bandeau)**
- *Bandeau vertical* (le « bandeau » est une bande verticale à gauche), *Frise*, *Frise foncée*, *Photo et frise*, *Rectangles*, *Sobre Photo*, *Sobre Rectangles*, *Sobre Frise* (grilles ou structures propres).
- Les modèles à cadre (*Cadre de page*, *Cadre et barre*, *Pastille*, *Titres à pictogrammes*, *Losange vert*) : bandeau et colonne ajoutables, mais le cadre de la page touche les bords : **à vérifier modèle par modèle au banc avant de les ouvrir** (provisoirement masqué).

## 4. Taille du coin et lisibilité (exigences de Denis, CORRIGÉES le 2026-10-22 : le coin est un DÉCOR)
**Précision de Denis (2026-10-22), qui remplace le plafond d'abord proposé** : le coin est purement esthétique. On l'étire à la main, il peut recouvrir une partie du texte pour le mettre en relief, et il ne déplace JAMAIS le texte ; sa couleur se choisit (celle du bandeau, une teinte claire, une autre couleur). Le texte reste devant ; sur un coin foncé, le texte recouvert passe en blanc, sur un coin clair il reste sombre. Taille maximale 240 px. Réserve Word : si le Word ne reproduit pas le coin, le texte recouvert ne doit PAS y passer en blanc (il resterait lisible, le message d'export le dit) ; à vérifier dans un vrai Word. Le texte ci-dessous sur le plafond et la question Q4 d'origine sont remplacés par cette règle.

### (ancienne version, remplacée)
- **Taille réglable à la main** : une poignée ronde au coin, comme celles de l'épaisseur du bandeau et de la largeur de la colonne (`cvPdfPoigneesCv.js`), réutilisée. Réglage enregistré avec les autres, annulable.
- **Le texte reste toujours lisible** : le coin ne peut jamais recouvrir une ligne de texte. Le plafond est calculé sur le rendu réel (le carré du coin ne doit toucher aucun texte du corps de la page) ; sur le modèle « Colonne foncée » il vaut 19 px. Le texte de l'en-tête posé sur la colonne prend la couleur qui contraste avec elle (sombre sur colonne pâle, blanc sur colonne foncée), et la couleur du texte de la colonne est recalculée quand la colonne change de couleur. Garde-fou de test : un essai vérifie qu'aucun texte n'est recouvert.
- **Question ouverte (Q4 de la maquette)** : coin plus grand que l'espace libre : limité (recommandé) ou texte décalé vers le bas (risque de passer à deux pages).

## 5. Ce qui reste à faire avant de coder
Validation par Denis de la maquette (4 questions) ; au moment du code, vérification visuelle modèle par modèle au banc pour les « OUI avec réserve » (carte, pilule, médaillon, cadres) ; vrai Word (l'arrondi intérieur sera probablement un coin droit) et vrai PDF.
