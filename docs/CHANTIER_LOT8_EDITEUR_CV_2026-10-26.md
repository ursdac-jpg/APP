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
| En-tête avec un nom, un titre ou une accroche longs | Disposition **empilée** (validée sur captures le 26/10/2026) : photo et nom sur une ligne ; titre du CV pleine largeur sur deux lignes au plus, taille légèrement ajustée ; coordonnées sur une ligne ; accroche en bas, pleine largeur. Choix **automatique** quand l'en-tête serait trop grand ou l'accroche trop étroite (seulement tant que la personne n'a pas réglé l'en-tête) **et option du panneau** « Disposition de l'en-tête ». Le texte qui sort du bandeau ou de la colonne reprend la **couleur du bandeau ou de la colonne** (texte à deux tons : blanc sur la forme colorée, couleur de la forme sur le blanc). D'abord les modèles à en-tête « photo + nom + coordonnées / titre / accroche » (dont les modèles à colonne qui traverse l'en-tête) ; « Éditorial » et « Chrono foncé » (en-têtes d'une autre structure) ensuite, séparément. |

## 3. Fait et poussé (branche `claude/youthful-fermi-6q9gzu`)

- **Clignotement au changement de modèle : corrigé** (commit `dc2bbd4`). Cause mesurée : seul le dé « Style rapide » conservait l'aperçu ; les clics de galerie reconstruisaient le cadre (2 images avec un cadre à 794 px au lieu de 420, « photo » de l'aperçu pendant environ 270 ms). Les clics Créatif et Sobre conservent maintenant l'aperçu (`_mepConserverApercuPendant`) et la largeur de colonne repart de 35 % (`_mepRemettreLargeurColonneDefaut`). Preuve : 37 modèles comparés, empreinte du CV identique à l'ancien comportement, un seul cadre, aucun flash.
- **Garde-fou de lisibilité** (nouveau fichier `modules/cv-pdf-html/cvPdfLisibilite.js`, 9 tests dans `tests/lisibilite.test.js`). Appelé après chaque rendu, juste après le texte à deux tons. Règles de prudence : texte déjà lisible jamais touché, couche de fond non comprise = rien, composition ou croisement actifs = rien. Sur les 7 cas de la maquette, 6 sont corrigés. Un seul modèle change en rendu de base : « Colonne et frise » (titre « Compétences comportementales » gris sur bleu-gris, maintenant sombre) ; empreinte du registre et miniature mises à jour pour ce seul modèle.
- Maquette de lisibilité : `docs/MAQUETTE_LISIBILITE_TEXTE_2026-10-26.html` (7 cas avant / après).
- **Disposition d'en-tête « Empilée »** (commit `243929f`) : disposition 5 de l'en-tête libre, bouton « Empilée » à côté de « Décalée » dans le grand aperçu. Le texte reprend la couleur du CV hors de la colonne colorée (texte à deux tons) et reste blanc sur la colonne. Banc de rendu des 39 modèles identique à la référence : aucun CV actuel ne change tant que l'option n'est pas choisie. Choix automatique : pas encore fait.

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

## 5. À faire, dans l'ordre (détail et étiquettes d'effort dans `docs/MESSAGE_REPRISE_COMPLETE_2026-10-26.md`, section 4)

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

### Contrôle du 2026-10-27 : niveau bas du plan du cloud
- **L8-2 (page refaite deux fois)** : rejeu de `mesure_danse_de.js` sur 36 clics (12 en Standard, 12 en Sobre, 12 en Créatif) : un seul appel de `pageResultats()` à chaque clic, un seul cadre, aucune image sans CV. Le cas « un sur six » n'apparaît plus ; la retenue de la composition dans le tirage (commentaire L8-2 de `js/app.js`) suffit. Rien à corriger.
- **L4b (contrastes sombres)** : déjà corrigés dans le code (pastille du métier mesurée à 6,7 ; bouton Word de l'export par `--fond-pulse-doux`). **L3a (titre du Carnet et des Repères)** : déjà fait (« … » au mot entier, `_carnetExtraitPourTitre`, `_reperesExtraitPourTitre`).
- **Niveau moyen, contrôle du 2026-10-27** : (1) **L7 étape 1** : déjà branchée (le titre de « Vos documents » vient de `familleVosDocuments(...).titre`, `js/app.js`). (2) **L8-11 « Style rapide »** : le tirage par sac existe (`_pdfSacStyleRapide`) ; mesure sur 60 tirages par allure : 0 répétition voisine, 25 modèles Créatif et 11 variantes Sobre distincts, 31 tirages Sobre sur 60 avec bandeau (contre 8 sur 40 avant). (3) **L8-1 gestes qui clignotent** : rejeu de `mesure_gestes.js` : changement d'allure, galerie Sobre, « Organisation » (colonnes, réduire, agrandir) gardent tous un seul cadre, sans image sans CV. Rien à corriger. (4) **Bornes de l'en-tête et des colonnes (L8-12 à L8-16)** : à reprendre après la disposition « Empilée » (niveau haut), qui doit en résorber la plupart.

### Niveau haut, 2026-10-27 : choix automatique de la disposition « Empilée » (étape 3 de la décision du 26/10) : FAIT
- `_pdfRetirerEnteteDecaleeSiTropEtroite` (`cvPdfPanneauReglages.js`) : quand l'en-tête (posé d'office, ou d'origine du modèle) est anormal (plus de 30 % de la page, ou accroche de moins de 160 px) et **seulement tant que la personne ne l'a pas réglé**, on revient d'abord à l'en-tête d'origine du modèle (comportement d'avant) ; si cet en-tête est encore anormal, on essaie l'« Empilée » ; si elle ne suffit pas non plus, on garde l'en-tête d'origine et on n'insiste pas (`_cvPdfEmpileeRefusee`). Jamais pour « Chrono foncé » (Créatif et Sobre) ni pour les modèles qui refusent l'en-tête décalée ; « Éditorial » l'a en dernier recours, après les paliers du nom (voir plus bas).
- Mesure `mesure_empilee_auto.js` (39 modèles, contenu long et court, comme un CV neuf) : aucun résultat ne change aujourd'hui ; le mécanisme ne se déclenche que dans les cas encore anormaux (essayé sur `mqDiagonale` : l'Empilée reste à 30 %, donc refusée et en-tête d'origine gardé). Premier essai (Empilée avant le retour à l'en-tête d'origine) écarté : il remplaçait des en-têtes déjà corrects par un en-tête plus grand. `npm test` 2118 verts.
- Reste anormal à la mesure : `mqDiagonale`, `rubanDiagonal`, `diagonalesContrastees` (0,301 : tout juste au-dessus du seuil), `mqColonne` (un bloc dépasse la page), et les trois modèles « à part ».

- **Éditorial codé le 27/10/2026 (mélange par paliers, choix de Denis après la planche comparative)** : `_pdfAjusterNomEditorial` (`cvPdfPanneauReglages.js`, appelée par `_pdfInjecterResultat`, donc aussi pour l'impression et le Word). Palier 1 : le nom rapetisse jusqu'à 85 % de sa taille (46 px -> 39 px) ; palier 2 : la zone du nom s'élargit par pas de 2 points jusqu'à 58 % de la largeur ; palier 3 : le nom rapetisse jusqu'à 28 px. Le plus long mot (trait d'union compté) ne se coupe jamais. Rien n'est fait quand le nom tient déjà ni quand l'en-tête a été réglé à la main (`libre` ou `modif`). « Éditorial » n'est plus exclu de l'Empilée automatique (filet de sécurité si l'en-tête reste anormal) ; « Chrono foncé » et `sobre:mq-chrono` le restent.
- Mesure `captures_editorial/mesure_paliers.js` (vrai flux, sans réglage manuel) : Camille Martin 46 px, 21,6 % (inchangé) ; Marie-Hélène Dupont-Martin 46 px, 29,8 % (inchangé) ; Marie-Hélène Dubois-Vandenbroucke 39 px, 19,9 % (26,1 % avec photo, accroche 302 px) ; Jean-Baptiste Montgolfier 40 px, zone 46 %, 18,6 % ; Anne-Charlotte Vandenberghe-Montgolfier avec photo 39 px, 28,1 % ; cas extrêmes (Rakotomalala-Andrianampoinimerina, un mot de 20 lettres) 28 à 29 px, aucun mot coupé, 17,7 à 23,2 %. Les 39 modèles x 3 contenus (long, moyen, court), avant/après (`mesure_empilee_auto.js`, `BASE=1` = sans l'ajustement) : **seul `sobre:mq-editorial` change** (contenu long : 25,7 % au lieu de 39,7 %, nom 39 px) ; les 38 autres sont identiques. `mqColonne` (un bloc hors page, contenu long) reste le seul anormal. Word (`mesure_word_editorial.js`) : nom court 34,5 pt et grille 38/62 ; nom long 29,5 pt et grille 58/42, donc le Word suit bien la page. `npm test` 2118 verts.
- **mqColonne et textes illisibles en Empilée, 27/10/2026** : (1) `mqColonne`, contenu long : en-tête d'origine (décalée refusée, accroche de 141 px) avec l'accroche qui sortait de 80 px de la page ; nouveau critère d'« en-tête anormal » `_pdfEnteteDebordePage` (un bloc nom, titre, accroche ou coordonnées dépasse la page à droite), donc l'Empilée s'essaie : résultat 23,2 % de la page, accroche 716 px, rien hors page. (2) Textes illisibles en Empilée : balayage `scan_empilee.js` (39 modèles, long et court, contraste sur les pixels visibles) : seuls `frise` et `friseFoncee` ont du texte illisible (nom, coordonnées et titre sombres sur le triangle foncé, photo sur le début du titre) ; le bouton « Empilée » n'est plus proposé pour eux (`_PDF_MODELES_SANS_EMPILEE`, `_mqSegDisp`), déjà exclus de l'Empilée automatique. « Colonne claire » et les 36 autres : aucun texte illisible. (3) **Incident trouvé et corrigé** : le retrait de l'agrandissement d'en-tête (commit `d2dc066d`) faisait boucler `_pdfAgrandirPourRemplir` à l'arrivée réelle sur « Vos documents » (onglet planté) ; corrigé par `_cvPdfBoostInterditPour`, voir LECONS 9.69. Mesure 39 modèles x 3 contenus : plus aucun anormal (long, moyen, court), seul `mqColonne` change ; `npm test` 2118 verts ; arrivée réelle rejouée (`verif_bouton_empilee.js`).

- **Balayage des options rejoué le 01/11/2026 par Claude** (`balayage_options.js`, 40 modèles, contenus **court** puis **moyen**, 5 706 réglages chacun) : **0 anomalie, 0 erreur JavaScript** dans les deux cas (texte hors page, chevauchement, texte disparu). Le contenu long avait déjà été mesuré le 26 et 27/10. Reste seulement le banc de rendu Word final, à jouer sur le poste de Denis.
