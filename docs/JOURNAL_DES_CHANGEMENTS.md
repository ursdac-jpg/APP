# Journal des changements visibles (trace brute, à condenser ensuite en « Nouveautés »)

**Pourquoi ce fichier** : dès qu'un module reçoit une amélioration, un ajout ou une nouvelle fonction que les personnes verront, on note UNE ligne ici, tout de suite, dans le même commit. On n'écrit pas le détail : on garde une trace. Plus tard, les lignes d'un même module se condensent en une ligne de `data/nouveautes.js` (la page « Nouveautés » de l'application), en quelques mots.

**Lien avec les Nouveautés** : ce journal est la matière brute ; `data/nouveautes.js` est la version propre, lue par les personnes. Rien n'est affiché au public tant que ce n'est pas passé dans `data/nouveautes.js`.

## Format d'une ligne (une ligne par changement, la plus récente en haut)
`AAAA-MM-JJ | module | ce qui change, en une phrase simple | à condenser` (remplacer « à condenser » par « fait le AAAA-MM-JJ » une fois passé dans les Nouveautés ; « interne » si les personnes ne le verront pas ; « fermé » si le module n'est pas ouvert au public)

## À faire au moment de condenser (une fois par mois, avant le courriel aux partenaires, ou quand Denis le demande)
1. Regrouper les lignes « à condenser » par module.
2. Pour chaque module : une ligne dans `data/nouveautes.js` (titre court, une ou deux phrases, route), en français simple, sans jargon ni correctif, jamais une fonction fermée au public.
3. Marquer les lignes du journal « fait le ... ».
4. `npm test` (le test des nouveautés contrôle les routes et les tirets longs), puis envoi sur GitHub à la demande de Denis.

## Journal
2026-10-26 | Mise en page du CV | nouvelle disposition d'en-tête « Empilée » (grand aperçu, à côté de « Décalée ») : photo et nom sur une ligne, titre du CV pleine largeur sur deux lignes au plus, coordonnées sur une ligne, accroche en bas ; sur une colonne colorée, le texte est blanc sur la colonne et de la couleur du CV sur le blanc | à condenser
2026-10-26 | Mes Repères | le bouton « + Garder une réflexion » n'est plus caché par le bouton rond du Carnet, le champ de recherche est assez large pour son texte d'aide, et l'écran ne déborde plus sur téléphone | à condenser
2026-10-26 | Créer un nouveau CV | le bouton « Retour » de « Votre profil » ramène à « Votre parcours » (l'étape d'avant) au lieu de « Vos informations » | à condenser
2026-10-26 | Reprendre mon CV, lettre et entretien rapides | quand on colle le texte de son CV (au lieu d'un fichier), la suite est la même qu'avec un fichier : « Vos informations » avec la barre du parcours | à condenser
2026-10-26 | Mise en page du CV | les dates des certifications ne sont plus coupées par le bord d'une colonne étroite : la ligne reste dans la colonne et la date passe sous l'intitulé | à condenser
2026-10-26 | Mise en page du CV | un texte qui ne se lisait pas (nom blanc sur un bandeau pâle, nom sombre sur un bandeau foncé, certifications blanches sur une colonne vide, titres gris sur une colonne bleue) change tout seul de couleur ; les CV déjà lisibles ne changent pas | à condenser
2026-10-26 | Mise en page du CV | changer de modèle dans la galerie ne fait plus clignoter l'aperçu (le CV reste affiché pendant le changement) | à condenser
2026-10-26 | Toute l'application | bouton « Signaler un problème » (accueil, page Nouveautés, panneau de la roue) : un formulaire Google, page courante préremplie, courriel à Denis | à condenser
2026-10-26 | Nouveautés | chaque bouton « Essayer » porte l'icône du module qu'il ouvre | fait le 2026-10-26
2026-10-26 | Nouveautés | bouton toujours visible (4e icône), pastille, page d'historique par mois, étiquette « Nouveau » | fait le 2026-10-26
2026-10-26 | Reprendre mon CV | voie 3 « le refaire moi-même dans un modèle », sans assistant, mode fidèle, titres d'origine repris | fait le 2026-10-26
2026-10-26 | Entretien | fiche rapide enrichie, entraînement complet qui joue le recruteur et complète la fiche | fait le 2026-10-26
2026-10-26 | Créer un nouveau CV | « Vos appuis » (lettres de recommandation) n'est plus proposé en création à la main, sans assistant | à condenser
