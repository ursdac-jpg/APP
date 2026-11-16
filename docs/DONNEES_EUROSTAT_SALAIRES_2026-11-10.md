# Salaires en Europe : données Eurostat trouvées (relevé du 10/11/2026)

Fichier de travail, rien n'est codé. **Décision de Denis le 10/11/2026 : abandonné, la comparaison européenne des salaires ne sera pas faite.** Données gardées pour mémoire. Réponse à la consigne 239 (situer la France face aux autres pays de l'Union européenne et de la zone euro, en salaire moyen et en salaire médian). Toutes les valeurs ci-dessous ont été lues directement dans l'API publique d'Eurostat, jamais écrites de mémoire.

## La source

- **Jeu de données** : `earn_ses_monthly`, « Structure of earnings survey: monthly earnings » (enquête européenne sur la structure des salaires, Eurostat). Page : https://ec.europa.eu/eurostat/databrowser/view/earn_ses_monthly/default/table
- **Indicateurs lus** : `MEAN_E_EUR` (salaire moyen en euros), `MED_E_EUR` (salaire médian en euros), et leurs versions en standards de pouvoir d'achat `MEAN_E_PPS`, `MED_E_PPS`.
- **Filtres** : tous les secteurs de l'enquête (`B-S_X_O`), toutes professions, tous âges, hommes et femmes ensemble, `worktime=TOT_FTE` (en équivalent temps plein), année **2022**.
- **Dernière mise à jour du jeu** : 9 février 2026.
- **Pays couverts** : les 27 pays de l'Union européenne, plus l'Union européenne (27 pays) et la zone euro (20 pays) en totaux.

## Ce qu'il faut savoir avant de s'en servir (points à dire clairement aux personnes)

1. **Ce sont des salaires BRUTS** (avant impôt et cotisations). L'application affiche pour la France des salaires NETS (Insee). Les deux ne se mélangent pas : la comparaison européenne devra s'afficher à part, avec le mot « brut ».
2. **Année 2022**, pas 2024 : l'enquête n'est faite que tous les quatre ans (2018, 2022, ensuite probablement 2026, résultats vers 2028). La carte devra écrire l'année.
3. **Champ** : entreprises de 10 salariés ou plus, tous secteurs sauf l'administration publique. Ni les très petites entreprises ni la fonction publique ne sont comptées : ce n'est pas « tous les salariés du pays ».
4. **Équivalent temps plein** : les temps partiels sont ramenés à un temps plein, comme dans la rubrique française.
5. **Euros et pouvoir d'achat** : en euros, le même montant ne vaut pas la même chose partout (la vie est moins chère en Bulgarie qu'au Danemark). Les colonnes « pouvoir d'achat » corrigent cela (SPA : standard de pouvoir d'achat, une unité artificielle qui égalise les prix). Pour être honnête, la carte devra proposer les deux ou expliquer laquelle elle montre.

## Les valeurs (par mois, brut, équivalent temps plein, 2022), classées par salaire médian en euros

| Pays | Moyen en euros | Médian en euros | Moyen en pouvoir d'achat | Médian en pouvoir d'achat |
|---|---|---|---|---|
| Union européenne (27 pays) | 2 868 | 2 385 | 2 868 | 2 385 |
| Zone euro (20 pays) | 3 075 | 2 564 | 2 930 | 2 443 |
| Danemark | 4 942 | 4 465 | 3 708 | 3 351 |
| Luxembourg | 5 282 | 4 172 | 4 045 | 3 195 |
| Belgique | 4 039 | 3 758 | 3 609 | 3 358 |
| Suède | 3 723 | 3 335 | 2 937 | 2 631 |
| Irlande | 4 299 | 3 323 | 3 616 | 2 795 |
| Finlande | 3 676 | 3 254 | 2 965 | 2 624 |
| Allemagne | 3 652 | 3 143 | 3 264 | 2 809 |
| Pays-Bas | 3 503 | 3 097 | 2 993 | 2 646 |
| Autriche | 3 415 | 2 948 | 3 041 | 2 626 |
| **France** | 3 072 | 2 503 | 2 829 | 2 305 |
| Italie | 2 583 | 2 149 | 2 692 | 2 239 |
| Espagne | 2 247 | 1 871 | 2 409 | 2 006 |
| Malte | 2 063 | 1 772 | 2 313 | 1 987 |
| Slovénie | 2 077 | 1 743 | 2 447 | 2 054 |
| Chypre | 2 179 | 1 648 | 2 332 | 1 764 |
| Estonie | 1 798 | 1 548 | 2 004 | 1 725 |
| Lituanie | 1 825 | 1 494 | 2 425 | 1 986 |
| Tchéquie | 1 638 | 1 415 | 2 030 | 1 754 |
| Slovaquie | 1 486 | 1 264 | 1 874 | 1 594 |
| Grèce | 1 499 | 1 221 | 1 828 | 1 489 |
| Lettonie | 1 529 | 1 190 | 1 910 | 1 487 |
| Croatie | 1 397 | 1 170 | 1 926 | 1 612 |
| Pologne | 1 404 | 1 135 | 2 286 | 1 847 |
| Portugal | 1 479 | 1 092 | 1 754 | 1 295 |
| Hongrie | 1 220 | 972 | 1 888 | 1 504 |
| Roumanie | 1 259 | 948 | 2 252 | 1 694 |
| Bulgarie | 933 | 684 | 1 548 | 1 134 |

Pour la France : 10e rang sur 27 en salaire moyen comme en salaire médian (en euros) ; environ 7 % au-dessus de la moyenne de l'Union européenne pour le salaire moyen (3 072 € contre 2 868 €) et environ 5 % au-dessus pour le salaire médian (2 503 € contre 2 385 €). Les cinq premiers en médiane : Danemark, Luxembourg, Belgique, Suède, Irlande ; les trois derniers : Hongrie, Roumanie, Bulgarie. Ces comparaisons seraient CALCULÉES par le code au moment d'afficher, jamais écrites ici.

## Autres jeux trouvés (non retenus pour ce besoin)

- `earn_ses_pub2s` : salaire horaire médian brut (2006 à 2022), entreprises de 10 salariés ou plus. Même enquête, même limite d'année.
- `earn_nt_net` : rémunération nette annuelle d'une personne seule sans enfant qui gagne le salaire moyen, 2024 et 2025, en euros pour les 27 pays. **Plus récent (2025) et NET**, mais ce n'est PAS un salaire médian ni un salaire moyen de pays : c'est un cas type (une personne seule au salaire moyen). Valeur 2025 en euros par an : France 32 346, Union européenne 29 954, zone euro 32 194. Déjà utilisé par le relevé Eurostat existant, uniquement pour son évolution. À proposer comme complément « net, plus récent » si Denis le souhaite.
- Aucune médiane récente (2024 ou 2025) du salaire par pays n'existe chez Eurostat : seule l'enquête quadriennale la donne.

## Comment l'intégrer, si Denis valide (rien n'est fait)

Même mécanique que les autres fichiers « Union européenne » : le script `scripts/releveEuropeEconomieEurostat.py` (ou un script voisin) écrirait un fichier `contenu/` avec une fiche par pays, la source et l'année en tête ; une carte ou un bouton « Et dans les autres pays européens ? » au niveau France entière et Union européenne montrerait la France, la moyenne de l'Union, la zone euro et quelques repères, avec le mot « brut » et l'année 2022 écrits. Maquette avant tout code.
