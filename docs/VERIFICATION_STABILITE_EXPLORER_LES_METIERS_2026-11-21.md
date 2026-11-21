# Vérification de stabilité d'« Explorer les métiers » avant les vidéos (21/11/2026, consigne 516)

Demande de Denis : une dernière vérification de l'exigence, des pourcentages et de la cohérence entre les choix, leur nombre et les métiers proposés ; dire s'il y a d'autres choses à améliorer ; dire ce qui n'est pas couvert ; confirmer que le module est stable avant de refaire les vidéos.

Méthode : code relu (`parMetierCalcul.js`, `logique.js`, `parMetierEcran.js`, `parActions.js`), mesures relancées sur le code actuel avec les scripts de `scripts/auditAtteignabilite/` et trois contrôles nouveaux (cohérence, choix ajoutés un à un, profils du banc d'essai). Une personne simulée n'est pas une vraie personne : ce sont des ordres de grandeur, comme dans l'audit du 21/11/2026.

## 1. Ce qui est solide (mesuré)

- **Le pourcentage ne dépasse jamais le plafond du nombre de choix** : 4 500 calculs du chemin 1 (250 profils, 6 tailles, 3 variantes avec niveau, secteur et conditions) et environ 420 du chemin 2 (70 métiers, 6 tailles) : aucun dépassement. Jamais de liste vide quand les choix viennent d'un même métier.
- **Le métier visé ressort** (courbes relancées sur 1 920 métiers pour le chemin 1 et 641 pour le chemin 2, identiques à l'audit du 21/11/2026 pour le chemin 1) :

| Choix | Chemin 1 : métier visé dans les 10 premiers | premier | Chemin 2 : dans les 10 premiers | premier |
|---|---|---|---|---|
| 3 | 98 % | 75 % | 41 % | 12 % |
| 5 | 100 % | 96 % | 69 % | 28 % |
| 7 | 100 % | 99 % | 83 % | 46 % |
| 9 | 100 % | 99 % | 89 % | 55 % |

- **L'échelle ne promet pas plus que la mesure** : les plafonds (30, 50, 70, 90) restent sous la réalité du chemin 2 à chaque borne (41, 69, 83, 89 %). Le pourcentage réellement atteint par le métier visé reste en dessous du plafond (chemin 2, médiane : 71 % à 10 choix pour un plafond de 95 %) : l'application est prudente, jamais optimiste.
- **Les noms de niveau, les bornes et les textes viennent d'une source unique** (`CML_NIVEAUX_PISTES`, `CML_BORNES_NIVEAUX`), lue par les trois chemins.

## 2. Écarts trouvés

### 2.1 Corrigés dans ce passage (aucune liste ne change)

1. **Chemin 1 : « Mes choix (8) » contre « 5 choix » dans le niveau.** Le niveau et le plafond comptent les secteurs pour un seul choix et les conditions de travail pour un seul choix, mais l'écran affichait le total brut. Mesuré : 96 % des profils avec une condition facile et une difficile montraient deux nombres différents sans explication. Maintenant, sous « Mes choix », une phrase dit : « vos 2 secteurs comptent pour un seul choix et vos 3 conditions de travail comptent pour un seul choix : cela fait 5 choix comptés sur 8 ».
2. **Chemin 2 : « 795 métiers retrouvent vos choix » alors que deux choix sur cinq suffisent.** La phrase dit maintenant « retrouvent au moins 2 de vos 5 choix » (le minimum vient d'une source unique, `cmlChoixMinimum`, lue aussi par le classement).

### 2.2 À trancher par Denis (change les listes)

3. **Chemin 2 : la liste grossit au lieu de se resserrer, par dents de scie.** Un métier est proposé s'il retrouve au moins 40 % de vos choix, arrondi au-dessus. Cela donne 2 sur 3, 2 sur 4, 2 sur 5, 3 sur 6, 3 sur 7, 4 sur 8, 4 sur 9, 4 sur 10, soit de 67 % à 40 % selon le nombre de choix. Quand le minimum ne monte pas (de 3 à 4, de 4 à 5, de 7 à 8, de 9 à 10), la liste grossit forcément. Médiane de la liste (641 métiers de départ) : 3 choix 197, 4 : 367, 5 : 547, 6 : 210, 7 : 318, 8 : 141, 9 : 209, 10 : 288. La liste grossit dans 71 % des ajouts d'un choix. Le classement, lui, se précise bien (tableau du 1) : seule la taille de la liste ment sur « plus vous choisissez, plus la liste se précise ». Profils du banc d'essai : 144 à 709 métiers pour 4 à 6 choix.
4. **Exigence différente entre les chemins 1 et 2.** Chemin 1 : seuil de 40 % du plafond, sans minimum de choix retrouvés : 29 % des métiers proposés ne retrouvent qu'un choix sur trois avec 3 compétences, 11 % avec 6. Chemin 2 : minimum de choix retrouvés (point 3). Le pourcentage affiché reste honnête dans les deux cas.

## 3. Options pour les points 3 et 4

| Option | Effet mesuré | Risque |
|---|---|---|
| **A. Ne rien changer** (la phrase est déjà corrigée) | Listes longues du chemin 2, inchangées | Aucun changement ; la longueur de liste reste |
| **B. Chemin 2 : « au moins la moitié des choix » (arrondie au-dessus)** | Identique pour 3, 4, 6, 8 et 10 choix ; pour 5, 7 et 9 choix la liste se resserre (à 5 choix : de 539 à 117 métiers, médiane, choix ajoutés un à un) ; banc d'essai : Cuisine 79 à 42, Petite enfance 149 à 44, Vente 504 à 213, Mécanique 709 à 229 | Profils très variés : 2 listes vides sur 20 au lieu de 1 (le cas « quinze choix variés » passe de 1 métier à aucun), le message « vos choix vont dans plusieurs directions » prend alors le relais |
| **C. B + le même minimum au chemin 1** | Chemin 1 : liste à 3 choix de 17 à 13, à 6 choix de 6 à 5 ; rien d'autre ne bouge | Très faible ; une règle commune, dite par la même phrase aux deux chemins |

## 4. Ce qui n'est pas couvert (état réel)

Aucun défaut de code connu en dehors des points 3 et 4. Ce qui reste est de l'ordre de l'usage ou de la décision, pas de la robustesse :

1. **Essais réels de Denis** (échelle de pistes, cartes enrichies, étapes A et B, disquette, recherche d'offres) : seuls capables de dire si la liste « parle » aux personnes. Aucune mesure simulée ne les remplace.
2. **Validation du prompt `prompts/ma-synthese.md`** avec de vraies réponses de l'assistant en ligne (point 3 du plan).
3. **Textes à relire** et **nom du quatrième chemin** (« Les emplois en demande ») à confirmer avant les vidéos.
4. **Deux fiches à faire à la main** vers le 24/11/2026 (Ouvrier agricole/viticole, Ouvrier de chai, niveau F1619).
5. **Écart entre le générateur de la base ROME et les fiches publiées** (leçon 9.207) : à éclaircir avant que quiconque relance le générateur.
6. **Hors module, plus tard** : accessibilité, puis découpage de `js/app.js`.
7. **Laissés tels quels par décision** : métiers jumeaux (moins de 1 %), liste courte du chemin 1 (l'échelle le dit), compétences de cartes imparfaites (pas de correction métier par métier), « Essentiels » en réserve.

## 5. Verdict

Le module est **stable et fiable dans ses calculs** : aucun dépassement, aucune incohérence entre pourcentage, plafond et niveau, résultats qui suivent la mesure. Les deux défauts d'affichage sont corrigés. Il reste **un seul point de réglage** (la taille de liste du chemin 2, point 3) ; il ne casse rien et peut se trancher avant ou après les vidéos, mais **avant** vaut mieux : la phrase « N métiers retrouvent au moins X de vos choix » apparaît dans l'écran filmé.

## 6. Décision de Denis (21/11/2026, consigne 517)

**Option B retenue** : au chemin 2, un métier est proposé s'il retrouve au moins la moitié des choix, arrondie au-dessus. Appliquée, vérifiée (tests, banc d'essai, choix ajoutés un à un, écran) : les listes à 5, 7 et 9 choix se resserrent comme prévu, rien ne change aux autres nombres. La liste grossit encore dans 57 % des ajouts d'un choix (contre 71 %), car le minimum reste le même d'un nombre pair au nombre impair suivant : c'est inhérent à toute règle en proportion, la tendance est nettement à la baisse (médiane de la liste de 3 à 10 choix : 199, 390, 117, 201, 72, 117, 47, 70). Le chemin 1 ne change pas.

**Complément (consigne 519).** Le minimum de la moitié montait avec le nombre de choix (8 pour 15, 10 pour 20) alors qu'une fiche ne porte qu'une dizaine de choix du catalogue de 113 (médiane 10, 90 % des fiches à 12 ou moins, maximum 17) : au-delà de 10 choix, une liste vide devenait possible par construction. Le minimum est plafonné à 5 : sans effet jusqu'à 10 choix, 30 métiers au lieu de zéro pour le profil de 15 choix très variés (meilleur : 6 choix sur 15, 37 %). Piste non retenue : réunir les deux descriptions d'une fiche (la sienne et celle du ROME) au lieu de garder la meilleure des deux, qui ferait passer la médiane de 10 à 13 choix mais changerait le classement de tous les métiers.
