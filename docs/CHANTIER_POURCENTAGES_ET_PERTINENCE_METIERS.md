# Chantier : pourcentages et pertinence des métiers proposés (consignes 487 et 488)

Mode A (décision de fond), effort haut. Début : 19/11/2026. Denis a délégué les choix techniques.

## Règles décidées (à tenir dans les trois chemins)

1. Le pourcentage plafonne selon le nombre de choix faits : 1 choix, 25 % au plus ; 2, 40 % ; 3, 55 % ; 4, 65 % ; 5, 75 % ; 6, 82 % ; 7, 88 % ; 8, 94 % ; 9 et plus, 100 %.
2. Sous ce plafond, le pourcentage est la part des choix réellement retrouvés dans le métier, en comptant davantage un choix rare (précis) qu'un choix très répandu.
3. Un métier qui ne retrouve presque aucun choix n'est pas proposé (au moins 40 % des choix retrouvés, un au minimum).
4. À score égal, le classement se fait par le contenu (choix retrouvés, précision), jamais par ordre alphabétique.
5. Si rien ne correspond : message honnête « Avec ces choix, notre base ne reconnaît aucun métier. Cela ne veut pas dire qu'il n'existe pas. »

## Étapes

- [x] Chemin 2 : concordance et plafond dans `cmlEntree2Metiers` (logique.js), export additif de la rareté depuis data/metiers.js.
- [x] Chemin 1 : plafond selon le nombre de choix dans `pmcScorer`, seuil et textes de l'écran.
- [x] Chemin 3 : départage des égalités par l'ordre des lettres.
- [x] Messages « aucun métier reconnu » dans les trois chemins.
- [x] Mesure avant et après, tests, essai navigateur, journal des changements.
- [ ] Ensuite (consigne 487) : rubrique « comment mes choix ont été traduits » (maquette d'abord), appellations, correction des étiquettes à la source.
