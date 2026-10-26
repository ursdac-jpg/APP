# Chantier Lot 8 : éditeur de CV (clignotement, texte illisible, « Style rapide », en-tête, options)

> Cahier de chantier, 26 octobre 2026. Mode A (mesure) puis B (code) selon les points. Effort : haut.
> Tout ce qui est écrit ici a été **mesuré** dans le navigateur de la session cloud, avec de vrais clics ou des rendus réels. Les outils de mesure sont dans `docs/mesures_2026-10-26/lot8/` (lecture seule, ils ne modifient pas l'application). Ce cahier est la passation pour la session locale de Denis.

## 1. Ce que Denis a demandé

1. Un clignotement léger au changement de modèle.
2. F27 : texte blanc hors de la colonne (pas de capture : cherché par hypothèse).
3. F28 : variété réelle du bouton « Style rapide ».
4. (Demande du 26/10) Chercher les incohérences et les trous quand on combine bandeau et colonne, les formes qui se posent sur d'autres formes ou sur le texte, l'en-tête trop étiré, la lisibilité de tous les textes sur tous les fonds (texte qui dépasse d'un bandeau à moitié, formes pleines, contours), et ne plus voir l'image « danser » au clic sur le mode aléatoire.
5. (Demande du 26/10) Regarder si les options offertes sur les modèles existants créent des bugs ou des incohérences, et si l'en-tête d'un premier CV reste raisonnable (il peut prendre un peu plus de place si son texte est un peu agrandi, mais pas un tiers ou deux tiers du CV).

## 2. Décisions de Denis (26/10/2026)

| Sujet | Décision |
|---|---|
| Largeur de colonne au changement de modèle | Garder le comportement actuel (curseur à 35 %, soit 36 % à l'écran), supprimer seulement le clignotement. La largeur propre à chaque modèle sera tranchée à part. |
| Texte illisible | Garde-fou « seulement si illisible » (un texte lisible n'est jamais touché). |
| Dates de certifications coupées par une colonne étroite | La date passe sous l'intitulé. |
| Bandeau « Contour rectangle » (cadre vide) | Le nom devient sombre. |
| « Style rapide » Créatif et Sobre | Tirage sans répétition : chaque modèle une fois par tour, ordre mélangé, jamais deux modèles de la même famille de suite, plus de bandeaux en Sobre. |
| Balayage des options | Complet (contenu court, moyen et long). |

## 3. Fait et poussé (branche `claude/youthful-fermi-6q9gzu`)

- **Clignotement au changement de modèle : corrigé** (commit `dc2bbd4`). Cause mesurée : seul le dé « Style rapide » conservait l'aperçu ; les clics de galerie reconstruisaient le cadre (2 images avec un cadre à 794 px au lieu de 420, « photo » de l'aperçu pendant environ 270 ms). Les clics Créatif et Sobre conservent maintenant l'aperçu (`_mepConserverApercuPendant`) et la largeur de colonne repart de 35 % (`_mepRemettreLargeurColonneDefaut`). Preuve : 37 modèles comparés, empreinte du CV identique à l'ancien comportement, un seul cadre, aucun flash.
- **Garde-fou de lisibilité** (nouveau fichier `modules/cv-pdf-html/cvPdfLisibilite.js`, 9 tests dans `tests/lisibilite.test.js`). Appelé après chaque rendu, juste après le texte à deux tons. Règles de prudence : texte déjà lisible jamais touché, couche de fond non comprise = rien, composition ou croisement actifs = rien. Sur les 7 cas de la maquette, 6 sont corrigés. Un seul modèle change en rendu de base : « Colonne et frise » (titre « Compétences comportementales » gris sur bleu-gris, maintenant sombre) ; empreinte du registre et miniature mises à jour pour ce seul modèle.
- Maquette de lisibilité : `docs/MAQUETTE_LISIBILITE_TEXTE_2026-10-26.html` (7 cas avant / après).

## 4. Constats mesurés (numérotés, à ne pas perdre)

### Clignotement et « danse » du dé
- **L8-1** Gestes qui remplacent encore le cadre de l'aperçu (donc clignotent) : changement d'allure (Standard, Sobre, Créatif), « Organisation » (colonnes, réduire, agrandir). À traiter avec la même méthode et la même preuve par empreintes.
- **L8-2** Dé « Style rapide » : un seul appel de `pageResultats()` par clic, un seul cadre, aucune image sans CV, position et taille du cadre stables. Reste un cas sur six en Créatif où la page est refaite deux fois (appel double, cadre déplacé une fois). Chemin : `_mepTirageFormesEnAttente`, puis `_mepMajOngletsApercu` relance `rerendre`. Les pauses (freeze) mesurées sont faussées par la charge de la machine, à remesurer machine libre ou en local.
- **L8-3** (hypothèse non vérifiée) Pendant un clic sur le dé, la hauteur de la page change 2 à 4 fois (barre d'onglets sous l'aperçu qui se reconstruit) : peut faire « danser » ce qui est autour de l'aperçu.

### Largeur de colonne
- **L8-4** À chaque changement de modèle par la galerie, le curseur « Largeur colonne gauche » retombe à 35 % (36 % rendus), alors que 7 modèles Créatif ont leur propre largeur dans leur recette (`mqColonne` 40, `bandeauVertical` 40, `duoOvale` 50, `rubanDiagonal` 50, `vagueMarine` 50, `diagonalesContrastees` 50, `medaillon` 30). La largeur réglée à la main est aussi perdue. Les vignettes de la galerie montrent la largeur propre au modèle. Incohérence vignette / résultat, à trancher plus tard (décision ci-dessus : comportement actuel conservé). La largeur annoncée est toujours celle de la colonne de gauche de la grille (`X% 1fr`), quelle que soit la couleur de chaque côté. Cas où la colonne étroite est à droite : à vérifier.

### Texte illisible (F27 trouvé par hypothèse)
Balayage : 1 074 scénarios (39 modèles x formes de bandeau et de colonne), puis 2 019 combinaisons bandeau + colonne. Méthode : captures avec texte transparent (le vrai fond), texte recoloré par groupe, contraste calculé sur les pixels réellement visibles.
- **L8-5** Certifications blanches sur la colonne vide (formes « Contour rectangle », « Contour arrondi », « Double filet ») : `sidebarVague`, `rubanDiagonal`, `cadreBarre`, `vagueMarine`. **Corrigé** par le garde-fou. C'est la bonne piste pour F27 (« texte blanc hors de la colonne »).
- **L8-6** Nom et coordonnées blancs sur un bandeau pâle : `colonneBandeau` (formes de bandeau vides), Sobre `mq-bandeau`, `mq-epure`, `mq-fond` quand on leur ajoute colonne et bandeau. **Corrigé**.
- **L8-7** Nom sombre sur un bandeau foncé : `colonneClaire` et `chronoFonce` quand on ajoute un bandeau (vérifié par vrais clics dans l'éditeur). **Corrigé**.
- **L8-8** Titres de rubrique gris moyen sur la colonne bleue : Sobre `mq-epure` ; et « Colonne et frise » en rendu de base. **Corrigé**.
- **L8-9** `bandeauVertical` + colonne : les dates des certifications dépassent le bord de la colonne (texte blanc sur le papier). **Non corrigé** : problème de place. Décision : la date passe sous l'intitulé quand la colonne est étroite. Hypothèse à vérifier : la colonne colorée est plus étroite que la colonne de texte (largeur de recette 40 % contre dessin de colonne), donc le défaut peut dépendre du chemin d'arrivée (galerie, donc 36 %, ou balayage, donc 40 %). À contrôler par vrais clics avant de coder.
- Reste non couvert par le garde-fou : formes dessinées par un pseudo-élément de l'en-tête (le garde-fou ne touche à rien quand il ne comprend pas le fond). Mesure complète après garde-fou : voir section 6.
- Combinaisons bandeau + colonne : aucun trou entre le bandeau et la colonne (seule cette mesure a été faite) ; en-tête jamais au-delà de 24 % de la page dans ces combinaisons.

### « Style rapide » (F28)
- **L8-10** Standard : 100 tirages, un seul identique au précédent, 14 couleurs de nom, 8 compositions, 4 formes de bandeau, 4 de colonne. Rien à corriger.
- **L8-11** Créatif : 40 tirages, ordre **fixe** (25 modèles, toujours la même suite, puis elle recommence). Sobre : ordre fixe sur 12 modèles ; 32 tirages sur 40 sans bandeau, 3 couleurs de nom seulement. Cause : `_pdfProposerAutreModeleCreatif` et `_pdfProposerVarianteSobreSuivante` prennent « le suivant » dans la liste (décision de Denis du 25/09/2026). Décision du 26/10 : tirage sans répétition, ordre mélangé, jamais deux familles voisines, plus de bandeaux en Sobre.

### Options du panneau avec un contenu long (40 modèles, 5 906 mesures)
Contenu long : accroche de 5 phrases, titre long, nom composé, 6 expériences. Mesure : géométrie seule (pages, hauteur de l'en-tête, texte hors page, chevauchements, textes manquants, garde-fous de l'application).
- **L8-12** Rendu de base : `mqColonne` fait déborder l'accroche hors de la page à droite ; Sobre `mq-editorial` : **l'en-tête prend 40 % de la page** (défaut déjà décrit par Denis, l'accroche en colonne étroite).
- **L8-13** Ratio d'en-tête en rendu de base : de 13 % à 28 % sur les autres modèles (acceptable).
- **L8-14** `regFondColonnes = droite` : 14 modèles (texte hors page, en-tête au-delà de 30 %).
- **L8-15** `regLargeurColonneGauche = 70` : 7 modèles (en-tête au-delà de 30 %, accroche trop étroite) ; `regColonneArche` : 8 modèles (en-tête +8 points ou plus) ; `regColonnesInversees` : 2 modèles.
- **L8-16** Échelle de texte au maximum (`regEchelle = 14`) : 9 modèles dépassent 30 % pour l'en-tête. Réglage extrême choisi par la personne : priorité plus basse.
- Les garde-fous existants (`_pdfEnteteTropHaut` à 30 %, `_pdfAccrocheTropEtroite` sous 160 px) détectent ces cas mais ne les réparent qu'au tirage du dé : rien ne répare quand la personne règle elle-même l'option.
- Contenus court et moyen : balayage complet demandé, non fait à ce stade.

## 5. À faire, dans l'ordre

1. Dates des certifications sous l'intitulé dans une colonne étroite (L8-9) : vérifier par vrais clics, puis coder.
2. En-tête et colonnes (L8-12 à L8-15) : bornes de sécurité seulement dans les cas anormaux (accroche jamais plus étroite que 160 px, en-tête jamais au-delà de 30 %, texte qui ne sort pas de la page), après enquête sur la cause de `mq-editorial` et de `regFondColonnes = droite`.
3. « Style rapide » : tirage sans répétition (L8-11), et la page refaite deux fois (L8-2).
4. Autres gestes qui font clignoter (L8-1) avec la preuve par empreintes.
5. Balayage complet court et moyen ; mesure après correctifs.
6. Largeur propre à chaque modèle (L8-4) avec captures côte à côte.

## 6. À faire en local par Denis

- Regarder à l'œil : lisibilité des 7 cas de la maquette, absence de clignotement et de « danse » sur son poste, pauses (freeze) du dé.
- Vrai PDF et vrai Word des modèles touchés (le garde-fou ne concerne que l'aperçu et le PDF imprimé depuis l'aperçu : le Word n'est pas touché).
- Banc de rendu officiel (`window.__rendu.lancer('verifier')`) sur son poste. Dans la session cloud, les empreintes Word (`xml`) de tous les modèles diffèrent déjà avant tout changement (environnement), seules les empreintes HTML sont fiables ici ; `mqColonne` avait déjà un écart HTML avant le garde-fou.
- Décisions restantes : largeur propre à chaque modèle (L8-4), option « Contour rectangle » conservée avec nom sombre (fait), échelle maximale (L8-16).

## 7. Outils (tous dans `docs/mesures_2026-10-26/lot8/`)

`vers_editeur.js` (de vrais clics jusqu'à l'éditeur), `scan_f27.js` (texte illisible, trous, hauteur d'en-tête ; options `RAPIDE`, `COTES`, `COMBOS`, `SEULS`, `APRES`), `balayage_options.js` (toutes les options par modèle et par longueur de contenu), `mesure_clignotement.js`, `mesure_gestes.js`, `essai_conservation.js`, `mesure_danse_de.js`, `mesure_style_rapide.js`, `sonde_largeur.js`, `sonde_structures.js`, `verifier_banc.js`, `verif_reelle_f27.js`.
