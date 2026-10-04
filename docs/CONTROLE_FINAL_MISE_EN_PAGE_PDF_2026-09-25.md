# Contrôle final de « La mise en page » (PDF) : maquette contre application (2026-09-25, tranche 6)

Maquette de référence : `docs/MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.html` (source de vérité). Application : commits `43bd6c8` à la suite de ce fichier.

## Méthode
1. **Inventaire automatique des contrôles** : la maquette et l'application sont ouvertes côte à côte ; chaque bouton, case, curseur et liste est relevé avec sa carte et son libellé, puis les deux listes sont comparées.
2. **Effet de chaque contrôle** : pour les 84 contrôles des cartes, l'application est remise au modèle de départ, le contrôle est actionné, la feuille du CV est comparée avant / après.
3. **Feuille** : mêmes données dans le rendu de la page de la maquette (`_pdfConstruireMaquette`) et dans la maquette : hauteur et position des titres identiques (contrôle repris depuis la tranche 2 : 1 467 px, en-tête 191 px, titres à 212, 212, 442, 1 257, 1 359, 1 359 : aucun écart depuis).
4. **Clair et sombre** : panneau, plein écran, fenêtre Exporter.
5. **Petits écrans** : recherche de texte qui sort ou est coupé dans un bouton.
6. **Impression réelle** : document d'export imprimé en PDF par Edge sans écran (tranche 5).

## Résultat 1 : inventaire (143 contrôles maquette / 134 application)
Tous les contrôles statiques sont identiques (carte, type, libellé). Les seuls écarts :
- lignes d'expériences et de missions : ce sont les données (maquette : exemples ; application : CV de test) ;
- « Langues (exemple) » / « Certifications (exemple) » : « (exemple) » retiré, décision de Denis ;
- listes « Titre du CV » / « Phrase d'accroche » : propositions de l'assistant (données) ;
- case « Indiquer l'expérience… » : présente dans la maquette en permanence (masquée), dans l'application seulement en « Par compétences » / « Mixte » (même effet visible).

## Résultat 2 : effet des 84 contrôles
51 contrôles changent visiblement la feuille. Les 33 autres, tous expliqués :
- déjà actifs au départ (Standard, Côte à côte, Épurées, Italique, 10 mm, Pastilles, Aucun, Texte, Chronologique, À droite du poste, Automatique) ou ⏮ au modèle de départ : rien à changer ;
- **Niveau de détail (Automatique / Complet / Résumé) et « Missions par expérience − / + » : sans effet dans l'état de départ** (voir « Point non résolu » ci-dessous : le moteur applique déjà son propre budget de missions) ;
- ouvrent seulement une liste ou changent de cible (Choisir ▾, Voir la liste, Titres) ;
- curseurs et liste « Ordre » (le test clique ou passe à l'option suivante) : contrôlés à la main (espace entre les formations, taille des titres, tri) ;
- dépendent des données du CV de test : « Afficher les missions de la formation » (aucune mission de formation), « Optimisé » (2 formations seulement) ;
- ne se voient qu'en 2 colonnes, comme dans la maquette : « Fond de la colonne » Gauche / Droite et « Trait entre les deux colonnes » (vérifiés en 2 colonnes : effet constaté) ;
- G / I du titre des formations : effet constaté à la main (le relevé automatique regardait trop peu d'éléments).

## Défauts trouvés par ce contrôle et corrigés
1. **« Revenir au modèle de départ » ne remettait pas les choix des cartes** : mode de présentation, position des dates, lieu, Personnaliser, formations avant expériences, titres agrandis, compteurs restaient d'un réglage à l'autre. Corrigé (même remise à zéro que « Style rapide »).
2. **« Revenir au modèle de départ » laissait, côté moteur, la densité (compact), l'alignement (justifié), l'interligne (aéré) et les rubriques masquées à leurs valeurs d'avant, alors que les cartes affichaient « normal »** : le traducteur du modèle canonique ne les transmet pas (`reglagesTraducteurs.js`, « NON emis »). Corrigé : remis à la valeur du modèle de départ. Vérifié : CV « sale » (compact, justifié, aéré, mode Par compétences, dates sous) revient bien à la feuille propre.
3. **Petits écrans** : « Style rapide (aléatoire) » et « Mise en page » étaient coupés (« Style r… »), le message de la barre du bas écrasait ses boutons. Les deux actions s'empilent et la barre passe à la ligne sous 560 px (la maquette ne définit rien sous 1 050 px).

## Point trouvé puis résolu (option A choisie par Denis, 2026-09-25) : « Niveau de détail : Automatique »
Constat : la carte annonçait « Toutes les expériences » et « Automatique », mais le moteur appliquait sa propre limite cachée (1 mission par expérience sur le CV de 9 expériences), « Complet » et « Missions par expérience − / + » ne changeaient rien, et « Toutes » choisi à la main donnait 2 pages sans aucun raccourcissement.
**Corrigé, comme la maquette (C36 / C45)** : par défaut « Toutes les expériences » (missions : 4 au plus par expérience, ou le nombre choisi avec − / +) ; si le CV dépasse une page (A4 sur une page, présentation chronologique, ni « Complet » ni « Résumé »), le moteur raccourcit les missions **une à une, en commençant par l'expérience la moins pertinente** (la dernière de la liste du moteur), jamais en dessous d'une mission, jamais en retirant une expérience, jamais sur une expérience dont la personne a fixé le nombre ou le choix de missions. Le message sous « Niveau de détail » dit ce qui s'est passé (missions raccourcies / une page ne suffit pas même avec une mission par expérience / expériences fixées par la personne / résumé / CV complet). Le nombre de missions affiché à côté de chaque expérience est le nombre réellement montré. Le plein écran et l'impression utilisent le même résultat.
Vérifié : 5 expériences sur une page → 4, 2, 1, 1, 1 missions, message exact ; « Complet » → toutes les missions (1 285 px) ; « Résumé » → 1 chacune ; une expérience fixée à 5 missions reste à 5 et les autres s'adaptent ; « Mise en page » continue de fonctionner ; plein écran identique à l'aperçu. Coût : environ 0,3 s par rafraîchissement quand tout est raccourci.
Effets de bord à connaître : un CV enregistré avant ce jour dont le réglage « expériences à afficher » n'avait jamais été touché passe à « Toutes » (ce que la carte annonçait déjà) ; les modèles de l'application (ancien rendu) profitent aussi du raccourcissement automatique en A4 sur une page.

## Limites de ce contrôle
- Les tests utilisent un dossier injecté (Doumbouya), sans relecture de l'assistant réelle (sauf un test avec recommandations simulées). Un vrai dossier de Denis reste à essayer.
- Impression vérifiée avec Edge sans écran (mêmes règles d'impression), pas avec la boîte d'impression d'un navigateur ouvert.
- Mode sombre du plein écran vérifié en tranche 4, de la fenêtre Exporter et du panneau ici ; pas de comparaison pixel à pixel avec la maquette sombre.
- Modèles de l'application non portés (frise, anciens Créatif) : ancien plein écran conservé (dette notée).

## Second contrôle (2026-09-25, soir) : modèles ajoutés après le contrôle ci-dessus
Méthode : mêmes contrôles, sur « Photo et frise » (Créatif et Sobre) et « Rectangles arrondis », avec une comparaison plus fiable (page + feuille de style complète ; l'ancienne ne voyait pas les changements de style et annonçait à tort « sans effet » sur G / I des formations).
Défauts trouvés et corrigés :
1. **« Photo et frise » et « Rectangles arrondis » ignoraient** : Formations avant expériences, Agrandir les titres, Icônes sur les rubriques, Texte justifié, Petits carrés (photo), style du lieu (rectangles). Corrigé.
2. **Les cases « Icônes sur les rubriques / coordonnées » affichaient l'inverse du moteur après le choix d'un modèle** qui allume les icônes (Photo et frise, Pastille, Médaillon) : le premier clic ne changeait rien. Corrigé (les cases suivent le moteur après chaque choix de modèle).
3. « Style rapide » Sobre depuis « Photo et frise » ne rétablissait pas le nombre de colonnes. Corrigé.
Restent sans effet PAR CONCEPTION sur ces modèles : Compétences en haut, Compétences en pastilles, Sous / Avant le poste (dates dans une colonne ou en ligne), Personnaliser (ordre des groupes), Missions de la formation (aucune dans les données de test). « Les plus pertinentes » : dépend des recommandations de l'assistant (comme en Standard).
Non rejoué en entier avec la nouvelle comparaison : Standard, Vague marine et les autres modèles de l'application (premier passage automatique : aucune anomalie inattendue sur les 46 premiers contrôles du Standard).

## Troisième contrôle (2026-09-25, nuit) : 24 contextes (Standard, 6 Sobre, 17 Créatif), 20 boutons ciblés, comparaison fiable
Incohérences restantes, à traiter (propositions de solution, décision de Denis) :
1. **Cases qui ne suivent pas le moteur après le choix d'un modèle** (même défaut que celui corrigé pour les icônes) : « Compétences en pastilles » sur Duo ovale (recette « texte »), probablement aussi coins arrondis, style des titres, etc. Solution : synchroniser tous les réglages posés par un modèle, pas seulement les icônes. Coût faible.
2. **« Icônes sur les rubriques » sans effet sur les 5 modèles Créatif de la maquette** (petits carrés toujours présents). Solution : lier les carrés à la case (allumée au départ). Coût faible.
3. **« Position des dates » (Sous / Avant le poste) sans effet sur 10 modèles de l'application + Colonne et frise** (dates dans la barre ou la frise). Solution : griser la commande avec une phrase quand le modèle place les dates lui-même. Coût faible.
4. **Sobre « Bandeau fin », « Colonne pâle », « Sans couleur » (ancien rendu)** : G / I des formations, icônes des coordonnées, petits carrés, pastilles et formations avant expériences sans effet. Solution : les porter sur le rendu de la maquette (lot 5), ce qui supprime l'ancien rendu. Coût moyen.
5. **« Colonne et frise » ignore** Agrandir les titres, Texte justifié, Formations avant expériences, alors que « Photo et frise » les applique. Solution : même traitement. Coût faible.
6. **« Petits carrés » sans effet quand les icônes des coordonnées sont allumées** (Pastille, Médaillon). Solution : griser avec une phrase. Coût faible.
Sans effet et expliqués : Missions de la formation (aucune dans les données de test), Toutes / Les plus pertinentes (dépendent des recommandations de l'assistant, non testé avec de vraies recommandations), Personnaliser (ouvre une liste).

## Correctifs des incohérences 1, 2, 3, 5 et 6 (2026-09-26)
Faits et vérifiés (contrôle rejoué sur Standard, Bandeau entier, Colonne et frise, Duo ovale, Pastille, Colonne à vague, Photo et frise : plus aucun bouton sans effet inattendu) :
1. Les cases de « La mise en page » suivent tous les réglages posés par un modèle (icônes, pastilles, coins, titres, fonds, bandeau…).
2. « Icônes sur les rubriques » retire bien les petits carrés des modèles Créatif de la maquette.
3. « Position des dates » est grisée avec une phrase quand le modèle place lui-même les dates.
5. « Colonne et frise » applique Formations avant expériences, Agrandir les titres, Texte justifié et les icônes des titres.
6. « Petits carrés » est grisée quand les icônes des coordonnées sont allumées.
Reste le point 4 (3 modèles Sobre de l'application sur l'ancien rendu) : étude en cours.

## Point 4 (2026-09-26) : les 3 modèles Sobre de l'ancien rendu sont retirés
Décision de Denis (2026-09-26) : Bandeau fin, Colonne pâle et Sans couleur sont retirés (doublons moins bien organisés de Bandeau pâle, Fond pâle et Épuré, comparés à l'image). Un dossier enregistré avec l'un d'eux bascule sur son équivalent (`_pdfMigrerVarianteSobre`, cvPdfPanneauReglages.js). Vérifié : galeries Sobre (3 modèles en 1 colonne, 4 avec Photo et frise en 2 colonnes), migration, rendu. **Reste** : supprimer l'ancien code de rendu (corps de `_pdfConstruireStyleEtPage` après le dispatch, cvPdfTemplateA4.js, environ 1 800 lignes) dans un commit à part, après contrôle : plus aucun modèle ne l'utilise.

## Suppression de l'ancien code de rendu (2026-09-26)
Fait : le corps de `_pdfConstruireStyleEtPage` après le dispatch (cvPdfTemplateA4.js, 1 794 lignes, fichier de 2 863 à 1 071 lignes) est supprimé ; un repli de sécurité rend « comme Standard » tout cas imprévu. Copie de l'ancien fichier hors dépôt : la version d'avant est dans git (commit précédent). Vérifié : `npm test` 959 verts ; rendu de Standard, des 4 Sobre et des 19 Créatif sans erreur ; document d'export engendré ; console sans erreur. Le code d'aide devenu inutilisé (blocs et fabricants de rubriques de l'ancien rendu) reste en place, à nettoyer plus tard (voir BRIQUES_COMMUNES).
