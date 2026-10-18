# Mon territoire : seconde passe critique (effort élevé) - 2026-10-12

> Relecture volontairement à charge du plan, de l'audit, de la maquette et des données, en cherchant les failles. Chaque constat s'appuie sur une vérification dans le code, les données ou le navigateur. Rien n'est codé dans l'application. **Note de la solution : 8/10 telle qu'elle était avant cette passe, 9/10 une fois les constats E1 à E5 intégrés.**

## 1. Constats graves (à intégrer avant tout code)

**E1. La « source unique » n'était pas unique : quatre autres endroits disent déjà « où s'adresser ».**
- les `structures:` des 17 rayons de « Comprendre le cadre » (180 lignes, déjà traitées) ;
- **le Lexique** : `_LEXIQUE_RENVOI_LOCAL_PAR_FICHE` (`modules/lexique/index.js`) contient des renvois codés en dur vers la Mission locale du Bergeracois et le PLIE pour le 24, et `_LEXIQUE_FICHES_TYPE_STRUCTURE` liste 7 types (france-travail, mission-locale, cap-emploi, plie, caf, siae, iae) ;
- **les freins** : `data/freins.js` (17 entrées) porte `quiVoir` et `ressources` ;
- **la recherche de l'accueil** : le groupe « Trouver une structure » (`data/baseConnaissancesERIP.js`) renvoie vers l'annuaire DORA ou PCGI 87.
**Conséquence** : sans traitement, on crée un cinquième endroit à vérifier, donc exactement la double vérification que Denis veut éviter. **Correction** : (a) les identifiants de type reprennent ceux du Lexique quand ils existent (`france-travail`, `mission-locale`, `cap-emploi`, `plie`, `caf`, `siae`), pour que « Mission locale » dans le Lexique et dans le répertoire soient la même chose ; (b) le Lexique, les freins et le groupe de recherche deviennent des **lecteurs** du répertoire, migrés un par un après le pilote ; (c) le groupe « Trouver une structure » est fusionné dans le groupe « Mon territoire » au lieu de coexister.

**E2. Visibilité pour la Haute-Vienne.** L'application est déjà chez le partenaire de la Haute-Vienne. Un module visible pour tous mais rempli seulement pour la Dordogne présente à ces personnes un écran « pas encore de liste » dès l'entrée. **Recommandation (décision D11)** : un drapeau d'ouverture comme `UCPM_OUVERT` (module « Un CV, plusieurs métiers »), fermé sur le site public tant que le pilote n'est pas validé par Denis ; à l'ouverture, la Haute-Vienne retrouve au moins ses 17 structures migrées depuis « Comprendre le cadre » (elles existent déjà), plus le national et le régional.

**E3. « Installé depuis » est trompeur.** Les données Sirene de mon propre test le montrent : une société à la date `1977-01-01` (date de convention, pas d'ouverture), et **deux sociétés différentes à la même adresse** (11 boulevard Auguste Comte : 2014 puis 2020), donc la date est celle de l'exploitant, pas celle du magasin. Une enseigne peut aussi changer d'exploitant. Écrire « installé depuis 1994 » comme un fait serait faux dans certains cas. **Correction** : retiré de la fiche en V1. La maquette l'indique (« inscrit au registre des entreprises », à retirer). Aucune ancienneté n'est affichée comme garantie.

**E4. « Communes desservies » en liste sur chaque structure est impraticable.** Les données existantes parlent en zones : « 145 communes du Sud Dordogne », « 43 communes du Grand Périgueux », « Sarlat et Terrasson ». **Correction** : un fichier **zones** (identifiant de zone, liste de communes) écrit une seule fois et partagé : une structure déclare une zone, pas 145 communes. Pour un CCAS la zone est sa propre commune. Il faut une table commune vers zone : liste des communes de Dordogne (INSEE : licence non vérifiée, à contrôler avant usage). Sans commune connue, l'option C affiche toutes les structures du type.

**E5. Rattacher les structures aux freins coûte beaucoup moins cher que prévu.** `FREINS_REPERTOIRE` n'a que **17 entrées**, chacune avec des `synonymes` (« pas de voiture » vers mobilité) et un `quiVoir`. **Correction** : ajouter à chaque frein un champ `types` (les types de structure du répertoire). La recherche « pas de voiture » trouve alors le frein, puis les structures locales de type mobilité-solidaire. Pas besoin de modifier 127 fiches : un **type par défaut par rayon**, avec exception fiche par fiche seulement quand il faut. Cela répond directement à la demande de Denis (structures attachées aux freins et aux problématiques, et ressortant de la recherche de l'accueil).

## 2. Constats moyens

- **M1** Tuiles « Pas encore de liste » sans action dans la maquette (31 tuiles, certaines mortes). **Corrigé** : elles ouvrent l'écran « Pas encore de liste ici » (écran 11 de la maquette), avec un renvoi vers une recherche par soi-même.
- **M2** **Placement sur l'accueil non décidé** (décision D10). **Recommandation** : troisième entrée de la carte « Se tenir informé », dont le texte dit déjà « près de chez vous » (aujourd'hui : Comprendre le cadre, Comprendre les chiffres). Alternative : une carte propre. Le texte de la carte serait à ajuster.
- **M3** La page de présentation manquait dans la maquette, or la règle commune dit que « Retour » ne saute jamais l'intro. **Corrigé** : écran 0 de la maquette.
- **M4** **Doublons Sirene à la même adresse** (par exemple Carrefour City et deux sociétés de même adresse). Une fiche enseigne se déduplique par adresse. Sirene donne la raison sociale, pas toujours l'enseigne : le rattachement se fait à la main.
- **M5** Les 25 candidats Sirene mêlent de petites épiceries. **Règle proposée pour le pilote** : seulement des **enseignes nationales reconnues** (Aldi, Lidl, Carrefour, Intermarché, Netto...), vérifiables sur leur site. L'absence d'une enseigne dans mes résultats (par exemple Leclerc) n'est pas une preuve qu'elle n'existe pas : à contrôler à la main.
- **M6** Source de données à examiner : **DORA** (ANCT), déjà cité par l'application, publie des structures par commune et besoin. Licence et réutilisation **non vérifiées** : à examiner avant de le proposer comme source de préparation.
- **M7** « Appui aux employeurs » s'adresse à un autre public que la personne en recherche : toujours à situer, sans urgence.

## 3. Ce que j'ai vérifié et trouvé correct

- Aucun débordement horizontal sur les onze écrans à 375 px de large (téléphone), mode clair.
- Les 31 tuiles ont toutes une action ; le mode sombre et les six accents du site s'appliquent.
- La logique de retour entre modules accepte une fonction (retour exact réalisable).
- Le vérificateur et « Publier » peuvent accueillir une destination fermée de plus.

## 4. Limites de cette passe (non vérifié)
Licence des listes de communes INSEE et de DORA ; comportement réel de `tel:` sur les téléphones des personnes ; usage réel de l'application en Haute-Vienne ; rendu de la maquette dans un vrai navigateur de téléphone (seule l'émulation de largeur a été testée).

## 5. Effet sur le plan
Ajouts au plan : P0.7 (aligner les types sur le Lexique, fichier des zones), P1 (champ `types` des freins, fichier des zones, drapeau d'ouverture), phase de migration des lecteurs (Lexique, freins, groupe de recherche). Décisions nouvelles pour Denis : **D10** (place sur l'accueil), **D11** (drapeau d'ouverture, recommandé).
