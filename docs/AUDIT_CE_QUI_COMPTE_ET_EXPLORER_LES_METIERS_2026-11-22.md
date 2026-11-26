# Audit de « Ce qui compte pour moi », de « Ma synthèse » et d'« Explorer les métiers » (2026-11-22, soir)

Mode B, effort moyen, demande de Denis : confirmer que les deux derniers modules écrits sont cohérents et complets, avec des profils inventés, avant de les déclarer clos. Lecture et jeu seulement : une autre fenêtre travaillait en parallèle (consigne de Denis, 22/11/2026), donc **aucun fichier des modules n'a été modifié**. `npm test` : 3 427 essais, tous verts.

Les réponses de l'assistant sont simulées (jamais de vraie réponse). Les deux interrupteurs de l'espace « Ce qui compte pour moi » (`CQCPM_OUVERT`) et de l'interprétation (`INT_OUVERT`) sont ouverts dans la page d'essai seulement ; ils restent fermés au public.

## Ce qui a été joué

**Ce qui compte pour moi** (huit cartes, profil « Camille » rempli, puis profil vide, à 1280 et 375 px, clair et sombre)
- Tuile dans la Boîte à outils, présentation, « Ouvrir l'espace », les huit cartes de bout en bout (invitation, saisie, résultat), « Garder mon résultat », « Ce que j'ai gardé », Relire, Modifier mes réponses, Effacer, Tout effacer, Revoir la présentation.
- Profil vide : chaque carte se traverse, le résultat dit « Vous n'avez pas répondu à cette partie » et « Rien à garder pour l'instant : répondez à au moins une question » ; rien n'est gardé.
- Disquette : l'espace est collecté sous la clé `ceQuiCompte` seulement avec les cartes gardées ; une restauration redonne les mêmes cartes.
- Concept : aucun score, aucun type de personne, aucun classement de métiers ; le résultat est fait des mots de la personne. Aucun mot « IA » visible, aucun tiret cadratin dans les textes affichés.

**Explorer les métiers** (quatre chemins) et **Ma synthèse**
- Chercher un métier : recherche, ajout de trois choix, liste classée, « Retenir pour ma synthèse » (à 375 px la liste passe par « Voir les métiers », conforme au patron mobile).
- Partir de vos envies : cinq pages, liste, retenir, garder mes choix.
- Questionnaire : 300 réponses jouées, résultat à trois lettres, niveau « précis ».
- Les emplois en demande : choix du département, chiffres, filtres, fiches.
- Ma synthèse : page vide (aucun bouton d'envoi), page remplie, bloc « Ce qui compte pour moi », lien vers l'espace.
- Ma lecture : la demande part avec les cartes **cochées** seulement (la carte « Ce qui m'a aidé quand c'était difficile » n'est jamais cochée d'avance et n'est pas dans la demande) ; 17 555 signes, sous le plafond de 22 000. Réponse en deux messages : première partie appliquée, bandeau « suite attendue », deuxième partie ajoutée, lecture complète.
- Interprétation des chemins 1, 2 et 3 (demande, collage, page « Mon interprétation », questions regroupées, « Répondre aux questions »).
- Retours : chaîne de Retour de l'espace correcte (carte, présentation, accueil). Aucun débordement horizontal à 375 px, clair et sombre, sur la synthèse, le passage assistant et Ma lecture.

## Résultat

Aucun blocage, aucune erreur du navigateur, aucun cul-de-sac, tous les boutons essayés répondent. Les informations saisies arrivent dans la demande (cartes cochées, métier retenu, choix des chemins, pourcentages de lettres, sans nom ni adresse).

## Quatre points mineurs : CORRIGÉS le 22/11/2026 à la demande de Denis

1. **« Effacer » une carte gardée n'a ni confirmation ni annulation**, alors que « Tout effacer » en demande une. Une erreur de clic efface la carte (elle se refait). **Corrigé** : « Effacer » demande maintenant « Effacer cette carte ? » avec « Effacer » et « Garder cette carte ».
2. **Retour depuis l'espace ouvert par le bouton « Retourner dans Ce qui compte pour moi » de Ma synthèse** : il ramène à la carte « Boîte à outils » de l'accueil, pas à Ma synthèse. Les réponses d'Explorer restent en mémoire, mais la personne doit rouvrir Explorer les métiers. **Corrigé** : « Retour » ramène à « Ma synthèse » ; la tuile de l'accueil ramène toujours à la carte « Boîte à outils ».
3. **Collage de la deuxième partie de Ma lecture avant d'avoir cliqué « Voir ma lecture »** : message « Collez d'abord la première partie », alors que la première a été reçue (elle n'est appliquée qu'au clic). De plus, la première partie est annoncée « La réponse est complète » : la phrase parle du message, pas de toute la lecture. **Corrigé** : le message dit qu'il faut d'abord la première partie, collée ici avant « Voir ma lecture » ; la première partie est annoncée « La réponse est bien reçue : elle se termine comme prévu », la page « Ma lecture » dit si une deuxième partie est attendue.
4. **« dites-nous » (un « nous »)** dans « Les emplois en demande » (`modules/comprendre-les-metiers/recrute.js`) et dans Mon territoire (`modules/mon-territoire/index.js`). **Corrigé** : « indiquez où vous cherchez » / « indiquez dans quel département vous cherchez ».

## Contrôle des corrections

`node --check` sur les fichiers touchés, `npm test` vert (3 434), navigateur : confirmation d'effacement (annuler garde la carte), retour depuis Ma synthèse, retour depuis la tuile de l'accueil, messages du collage.

## Non vérifié

Vraies réponses d'assistants (à Denis). Lecture réelle d'un PDF, Word ou photo (sans objet ici). Ma lecture avec le parcours professionnel ajouté et le texte libre (non rejoué cette fois). Écrans de 376 à 1279 px.
