# Questionnaire RIASEC : règle de calcul (document de travail, à valider par Denis)

Créé le 16/11/2026, chantier « Comprendre les métiers » (voir `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md`). **Rien n'est codé.** Les exemples chiffrés ont été calculés par un petit programme de contrôle, hors du dépôt.

## En une phrase

Chaque lettre reçoit, partie par partie, **un pourcentage de son propre maximum** ; le résultat de chaque lettre est la **moyenne de ses quatre pourcentages** ; le code à trois lettres est celui des trois lettres les plus hautes.

## Étape 1 : les points de chaque réponse

| Partie | Réponses | Points | Maximum par lettre |
|---|---|---|---|
| 1. Activités (90) | Ça me plairait / Ça ne me plairait pas / Je ne sais pas | 1 / 0 / 0 | 15 |
| 2. Métiers (90 lignes) | Ça me plairait / Ça ne me plairait pas / Je ne sais pas | voir ci-dessous | selon la lettre |
| 3. Aptitudes (60) | Pas encore / En progrès / À l'aise | 0 / 1 / 2 | 20 |
| 4. Personnalité (60) | Pas vraiment / Un peu / Ça me ressemble | 0 / 1 / 2 | 20 |

- **Partie 2** : chaque ligne porte un profil de lettres (par exemple 60 % R, 30 % I, 10 % C : ce sont les lettres que France Travail a données aux fiches de la famille, ramenées à des parts). Un « Ça me plairait » ajoute ces parts aux lettres concernées. Le maximum d'une lettre est la somme de ses parts sur les 90 lignes : environ **R 27,1 ; C 23,4 ; E 13,3 ; S 10,5 ; I 10,2 ; A 5,5**.
- **« Ça ne me plairait pas » et « Je ne sais pas » valent zéro.** Un refus ne retire jamais de points : sinon, une personne qui refuse des métiers d'une lettre se verrait pénalisée sur les lettres voisines, ce que la théorie de Holland ne demande pas.

## Étape 2 : ramener chaque lettre à son propre maximum

Pour une lettre et une partie : **pourcentage = points obtenus ÷ maximum de cette lettre dans cette partie × 100.**

C'est la décision du 16/11/2026 (équilibre des lettres) : la lettre A n'a que 5,5 « lignes » dans la partie 2 contre 27,1 pour la lettre R, mais une personne qui aime tout le monde artistique obtient **100 %** en A, comme une personne qui aime tout le monde réaliste obtient **100 %** en R. Sans cette étape, la lettre A paraîtrait cinq fois plus faible, uniquement parce que le répertoire de France Travail en contient moins.

## Étape 3 : la moyenne des quatre parties

**Résultat d'une lettre = (partie 1 + partie 2 + partie 3 + partie 4) ÷ 4**, chaque pourcentage ayant le même poids. Le résultat est affiché en barre avec le pourcentage écrit dessus (décision du 16/11/2026), arrondi à l'unité.

## Étape 4 : le code à trois lettres

> **Modifié le 17/11/2026 (décision de Denis, seuil de 10 %)** : une lettre qui vaut moins de 10 % (valeur arrondie) n'entre pas dans le code, qui compte donc 1, 2 ou 3 lettres. Sans troisième lettre, pas de message « troisième lettre proche de la suivante » ni de lettres supplémentaires pour les métiers. Titre de l'écran : « Votre lettre », « Vos deux lettres » ou « Vos trois lettres ». Constante `CMQ_SEUIL_LETTRE`.


Les six résultats sont classés du plus haut au plus bas ; les trois premières lettres forment le code (par exemple **S A I**).

Cas particuliers (calculés sur les valeurs non arrondies) :

1. **Lettres ex aequo** : deux lettres à moins de **3 points** d'écart sont dites proches. Si la proximité touche la frontière du code (la 3e et la 4e lettre), le texte le dit : « La troisième lettre est très proche de la suivante : les deux univers vous parlent à peu près de la même manière. » Les deux lettres servent alors aux propositions de métiers. Ordre d'affichage d'un ex aequo : la lettre la plus haute en partie 1, puis en partie 4, puis l'ordre R, I, A, S, E, C.
2. **Préférences réparties** : si l'écart entre la lettre la plus haute et la plus basse est **inférieur à 15 points**, le texte dit : « Vos réponses se ressemblent d'une lettre à l'autre : plusieurs univers vous attirent à peu près autant. Ce n'est ni bon ni mauvais, cela signifie que vous pouvez explorer plusieurs directions. » Le code est quand même affiché, avec ce texte au-dessus.
3. **Peu de réponses positives** : si la lettre la plus haute est **inférieure à 25 %**, le texte dit : « Vos réponses ne font pas ressortir de direction nette pour le moment. Vous pouvez recommencer plus tard, ou explorer les métiers un par un. » Aucun code n'est affiché.
4. **Partie 4 passée** (« à compléter ») : si la personne ne remplit pas la partie 4, le résultat se calcule sur les **trois autres parties** (moyenne ÷ 3) et le texte le précise : « Ce résultat est calculé sans la partie sur la personnalité. » Voir le point 3 des décisions à prendre.

## Étape 5 : le texte qui adoucit

Pour chaque lettre, une phrase fixe selon le pourcentage, jamais une note :

| Résultat | Texte |
|---|---|
| 75 % et plus | Une préférence très marquée |
| 50 à 74 % | Une préférence marquée |
| 25 à 49 % | Une préférence présente |
| moins de 25 % | Une préférence peu marquée |

Sous les barres, une seule phrase générale : « Une préférence peu marquée n'est pas une note : elle dit seulement la place qu'occupe cet univers dans vos choix aujourd'hui. »

## Les deux axes (optionnel)

D'après la théorie libre de Holland prolongée par Prediger :

- **Objets ou personnes** = (S + E) ÷ 2 moins (R + I) ÷ 2. Positif : plutôt les personnes ; négatif : plutôt les objets et les choses concrètes.
- **Données ou idées** = (C + E) ÷ 2 moins (A + I) ÷ 2. Positif : plutôt les données et l'organisation ; négatif : plutôt les idées et la création.

Affichés seulement si l'écart dépasse **10 points**, sous la forme d'une phrase (« Vous vous orientez plutôt vers les personnes que vers les objets »), jamais d'un chiffre.

## Exemples chiffrés

### Exemple 1 : une personne sociale et artistique

| Lettre | Partie 1 | Partie 2 | Partie 3 | Partie 4 | Résultat |
|---|---|---|---|---|---|
| S | 93 % | 72 % | 85 % | 80 % | **83 %** |
| A | 80 % | 80 % | 75 % | 80 % | **79 %** |
| I | 40 % | 25 % | 45 % | 40 % | 38 % |
| E | 33 % | 20 % | 40 % | 35 % | 32 % |
| C | 13 % | 6 % | 25 % | 30 % | 19 % |
| R | 20 % | 8 % | 20 % | 25 % | 18 % |

Code **S A I**. Axes : « plutôt les personnes que les objets » (écart de 29,5), « plutôt les idées que les données » (écart de 32,8). Les deux premières barres sont « très marquées », les deux dernières « peu marquées ».

### Exemple 2 : la lettre rare n'est pas pénalisée

Une personne qui dit oui à tout ce qui touche à la lettre A (et à rien d'autre) obtient **100 %** en A ; une personne qui dit oui à tout ce qui touche à la lettre R obtient **100 %** en R. Les deux profils sont symétriques. Sans l'étape 2, la première obtiendrait 5,5 points en partie 2 contre 27,1 pour la seconde.

### Exemple 3 : préférences réparties

| Lettre | Résultat |
|---|---|
| S | 54 % |
| I | 54 % |
| C | 52 % |
| E | 51 % |
| R | 51 % |
| A | 47 % |

Écart entre la plus haute et la plus basse : 7 points, moins de 15 : le texte « préférences réparties » s'affiche. C et E sont à 1,2 point (ex aequo à la 3e place) : le texte l'indique.

### Exemple 4 : la moitié de tout, au hasard

Les six lettres sont exactement à 50 %. Code affiché avec le texte « préférences réparties », sans lettre mise en avant. Ce cas sert de test : un résultat au hasard ne doit jamais faire croire à une direction.

### Exemple 5 : trois parties seulement

La personne passe la partie 4. Les pourcentages des parties 1, 2 et 3 donnent E 74 %, C 73 %, R 59 %, S 32 %, I 29 %, A 19 % : code **E C R**, avec la phrase « calculé sans la partie sur la personnalité ».

## Pourquoi pas autrement

| Option écartée | Bénéfice | Risque |
|---|---|---|
| Additionner les points bruts des quatre parties | Très simple | La partie 2 pèserait cinq fois plus pour la lettre R que pour la lettre A, et la lettre A serait toujours la plus basse |
| Donner un poids différent à chaque partie | Peut corriger la précision plus faible de la partie 2 pour la lettre A | Difficile à expliquer à une personne fragile ; chaque réglage devient un choix arbitraire |
| Faire perdre des points aux refus | Distingue « non » de « je ne sais pas » | Les refus d'une lettre pénalisent les lettres voisines ; plage de 0 à 100 % réduite |

## Tests à écrire au moment du code (Node)

1. Tout « oui » : toutes les lettres à 100 %.
2. Tout « non » ou « je ne sais pas » : toutes les lettres à 0 % et le texte « peu de réponses positives ».
3. **Cas de la lettre A** : un oui sur 100 % de la lettre A en partie 2 donne 100 % en A (jamais moins).
4. **Symétrie** : deux profils identiques, mais avec deux lettres permutées, donnent deux résultats permutés.
5. La moitié des énoncés cochés : toutes les lettres à 50 % (± 1 point), texte « préférences réparties ».
6. Deux lettres à moins de 3 points : le texte d'ex aequo apparaît.
7. Partie 4 passée : moyenne sur trois parties, texte précisant.
8. Axes : le signe suit bien les lettres (S et E positifs pour les personnes).
9. Les points de la partie 2 s'additionnent bien aux profils des 90 lignes (la somme des parts d'une lettre donne les maximums indiqués ci-dessus).

## Points à valider par Denis : LES 5 VALIDÉS le 16/11/2026 (recommandations suivies)

1. **Refus sans pénalité** : « Ça ne me plairait pas » et « Je ne sais pas » valent zéro (recommandé), contre un refus qui retire des points.
2. **Poids égal des quatre parties** (recommandé) : chaque partie compte pour un quart. Risque connu : la partie 2 est moins précise pour la lettre A (environ 5 lignes), ce que les trois autres parties compensent.
3. **Partie 4 « à compléter »** : peut-elle être passée entièrement (résultat sur trois parties), ou doit-elle être complétée comme les autres parties ? Recommandé : la partie peut être passée, avec la phrase qui le précise.
4. **Seuils** (3 points pour ex aequo, 15 points pour « réparti », 25 % pour « peu de réponses ») : à confirmer ; ils pourront être ajustés après les essais réels.
5. **Les deux axes** : à garder dans le résultat final (recommandé : une phrase seulement quand l'écart dépasse 10 points), ou à retirer pour alléger l'écran.
