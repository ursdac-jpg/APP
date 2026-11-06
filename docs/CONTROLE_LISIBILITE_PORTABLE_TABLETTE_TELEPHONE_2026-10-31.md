# Contrôle de lisibilité : portable, tablette, téléphone (point 12, consigne 83 a)

Date : 31/10/2026. Mode A (audit), **aucun code modifié**. Captures et mesures dans `docs/captures_lisibilite_2026-10-31/` (le script de mesure est conservé en `script_mesure.js.txt`).

## Ce qui a été mesuré
Cinq tailles d'écran (en pixels d'écran de l'application, donc après la mise à l'échelle de Windows) : bureau 1920 x 1080 ; **portable à 125 % = 1536 x 864** ; **portable à 150 % = 1280 x 720** ; tablette 768 x 1024 ; téléphone 375 x 812. Cinq écrans : accueil, dépôt du CV (version rapide), choix de l'assistant, **collage de la réponse de l'assistant**, « Vos documents » de la lettre. Pour chacun : taille réelle du texte (au caractère près), hauteur de chaque bouton, débordement horizontal.

## Constats
1. **L'application ne s'adapte pas aux écrans de portable.** Le texte courant fait 16 px du bureau 1920 jusqu'au téléphone (16,25 px à 375), et toutes les mesures sont strictement identiques à 1920, 1536 et 1280. Ce qu'on voit sur un grand écran, on le voit à l'identique sur un portable : seule la place disponible change (1280 x 720 laisse environ 500 px utiles une fois la barre du haut et la barre du bas retirées).
2. **Beaucoup de texte est petit.** Selon l'écran, **15 % à 47 % des caractères sont sous 14 px** (étiquettes « À choisir », « CONNEXION » à 11,5 px, phrases d'aide à 12,8 et 13,1 px, « Le texte à copier a été préparé pour… »). C'est ce petit texte qui porte les explications : c'est lui qui fatigue sur portable.
3. **Boutons plus petits que le seuil de confort (44 px).** Sur l'écran de collage : 6 boutons sur 9 font moins de 44 px (« Choisir un autre assistant » 32 px, « Coller à la main » environ 38 px, les « i » 32 px). Sur « Vos documents » de la lettre : 15 sur 36, dont « Feuille A4 » et « Message par mail » (33 px), les pastilles de couleur (30 px) et « Revoir la présentation » (34 px). La croix « ✕ » du message d'aide fait **15 x 17 px**, trop petite pour un doigt comme pour une souris.
4. **Téléphone 375 px, écran de collage** (`telephone-375__rapide-collage-reponse_pleine.png`) : le bouton principal de la barre du bas (« Vérifier mes informations → ») **est coupé à droite** ; l'infobulle « Complétez cette page pour continuer » **recouvre le titre de l'étape 2** et sa pastille « À faire » ; la barre des étapes est **coupée à gauche** et recouverte à droite par le bouton du carnet ; le titre « Collez la réponse de l'assistant » passe sur trois lignes.
5. **Portable 1280 x 720, écran de collage** : le premier écran est occupé par le titre et son sous-titre (environ 280 px) puis deux cartes ; **le bouton « Coller la réponse » est sous la ligne de flottaison**, il faut défiler pour le voir. Le titre « Collez la réponse de l'assistant » est écrit **deux fois de suite** (titre de l'étape, puis titre du contenu). La barre du bas prend 80 px de 720.
6. Aucun défilement horizontal sur aucune des 25 combinaisons mesurées.

## Pistes (à arbitrer, rien n'est décidé)
- **Seuils proposés** : texte courant et consignes 16 px minimum ; texte d'aide 14 px minimum (plus rien sous 14 px) ; boutons 44 px de haut minimum (comme sur téléphone), même pour les boutons secondaires ; zone cliquable d'au moins 32 x 32 px pour une croix ou un « i ».
- **Échelle courte (point A bis)** : sur les seuls écrans mesurés, plus de vingt tailles différentes coexistent (de 11,5 à 44,8 px). Proposition : petit 14, moyen 16, grand 19, très grand 24, titre de page 32 ; tout le reste s'y aligne.
- **Portable** : un réglage de taille générale plus généreux appliqué automatiquement sur les écrans de largeur entre 1000 et 1600 px (par exemple texte 17 px, boutons 46 px), ou rien automatique et rappeler le réglage « Texte plus grand » existant (`data-taille`). La première option est la réponse directe à la demande de Denis.
- **Écran de collage** (le plus soigné) : un seul titre, le bouton « Coller la réponse » visible sans défiler dès 720 px de haut (sous-titre et carte « Votre assistant » repliés une fois l'assistant choisi), explication courte et plus grande, boutons secondaires à 44 px.
- **Téléphone** : barre du bas en deux lignes ou boutons raccourcis (« Vérifier → »), infobulle placée au-dessus de la barre et non sur le contenu, barre des étapes qui défile jusqu'à l'étape courante.

## Questions pour Denis (avant la maquette)
1. Taille sur portable : adaptation automatique (recommandée) ou réglage laissé à la personne ?
2. Seuils : texte d'aide 14 px minimum et boutons 44 px minimum, d'accord ?
3. Écran de collage : on commence par lui (maquette) puis on étend à tous les écrans d'import ?
4. Les points B, B bis, C et F (clarté des boutons, inventaire des fenêtres, explication de chaque étape) restent à relever : même méthode, un écran à la fois, ou tout de suite sur ces cinq écrans ?
