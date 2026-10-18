# Plan de la rubrique « Employeurs qui publient leurs offres » (option 2)

> Écrit le 2026-10-17, après audit du code réel (`modules/mon-territoire/index.js`, `logique.js`, `contenu/employeurs.txt`, `tests/monTerritoire.test.js`, sas de recrutement). **Mode B, `[effort : moyen]`.** Textes validés : `docs/TEXTES_RUBRIQUE_OFFRES_PUBLIEES_A_VALIDER_2026-10-17.md` (3 décisions validées par Denis). Suite prévue : `docs/PONT_RUBRIQUE_VEILLE_PROSPECTION_2026-10-17.md`.

## Ce que l'audit a montré
**Simple (reprise de l'existant)**
- Chargement des fichiers texte à la demande (`_mtCharger`, `fetch` + `mtParserRegistre`) : on ajoute un fichier.
- Tuiles `sous-carte-accueil`, encarts, blocs dépliants, pastilles, boutons de lien externe (`_mtBoutonLienExterne`) : tout existe.
- Fraîcheur d'une date (`mtFraicheur`, 12 mois) : réutilisable, la rubrique prend 6 mois.
- 26 lignes déjà vérifiées à la main dans les sas (15 Dordogne, 11 Haute-Vienne) : la rubrique démarre avec elles. Les clés de secteur des sas sont déjà celles de `data/secteurs.js`.

**Risqué (à surveiller)**
1. **Historique du navigateur (brique B.24)** : le nouvel écran doit entrer dans l'instantané/restauration (`_mtInstantane`, `_mtRestaurer`, `_mtAller`), sinon la flèche « Précédent » ressort du module. Essai obligatoire après un vrai clic.
2. **Doublon à éviter** : `employeurs.txt` a déjà une colonne « page de recrutement » (utilisée par Lidl) et un bouton « Page de recrutement » sur la fiche. Règle (une seule source) : **le nouveau fichier est la seule source** ; la ligne de Lidl y est déplacée, le bouton de fiche devient « Ses offres publiées » et lit le nouveau fichier. La colonne de `employeurs.txt` reste dans le format (pour ne pas casser tests et fixtures) mais n'est plus affichée ; sa suppression est notée comme dette dans `BRIQUES_COMMUNES.md`.
3. **Territoire** : les sas contiennent « Dordogne », « Haute-Vienne », « Nouvelle-Aquitaine » et « national ». Règle d'affichage en QUATRE groupes (décision de Denis, 2026-10-17), classés d'après la famille notée dans le fichier : 1 « Près de chez vous » = `employeur` dont le territoire est le département choisi ; 2 « Grands employeurs » = `employeur` « national » ou « Nouvelle-Aquitaine » (visible dans les deux départements) ; 3 « Fonction publique » = `portail-officiel`, locaux ou nationaux, une seule fois (la commune est indiquée sous le nom) ; 4 « Groupements d'employeurs et chambres » = `groupement` et `federation` du département. Aucune page ne dit jamais « recrute chez vous ».
4. **Intitulé des groupes** : question tranchée par Denis (fonction publique et grands employeurs séparés, grands employeurs avant fonction publique).

**Aucun point bloquant.** Aucune duplication d'écran : la rubrique s'ajoute au module existant, pas de nouveau module.

## Cases à cocher (un commit par sous-étape, `npm test` vert avant la suivante)

### Étape 1 : les données
- [x] 1.1 Créer `modules/mon-territoire/contenu/offres.txt` : colonnes `id | famille | nom | secteur | territoire | page | employeur | source | date | controle | stages` (`employeur` = id d'une fiche, vide si aucune ; `controle` = date du dernier contrôle automatique ; `stages` vide, réservé à la suite).
- [x] 1.2 Y mettre les 26 lignes vérifiées à la main (sas Dordogne et Haute-Vienne), avec leur date ; ne jamais y mettre une ligne sans date.
- [x] 1.3 La page de Lidl est dans ce fichier (lien `employeur` = `lidl`) ; son retrait de l'affichage de la fiche se fait à l'étape 3.2 (un test vérifie déjà qu'il n'y a pas deux adresses différentes).
- [x] 1.4 Écrire dans `logique.js` : `MT_COLONNES_OFFRES`, `mtParserOffres`, `mtOffresDuDepartement` (les trois groupes, tri alphabétique, filtre secteur), `mtOffresPourEmployeur`, contrôle de fraîcheur à 6 mois.
- [x] 1.5 Tests (`tests/monTerritoire.test.js`) : fichier sans erreur, https seulement, id unique, secteur connu, aucune ligne sans date, aucun tiret long, aucune adresse d'intermédiaire connue (liste de domaines interdits), quatre groupes bien répartis (un employeur n'apparaît que dans un seul groupe), aucun doublon avec la colonne `recrutement` de `employeurs.txt`.

### Étape 2 : l'écran
- [x] 2.1 Charger le fichier dans `_mtCharger` (même mécanisme d'erreur et « Réessayer »).
- [x] 2.2 Écran `_mtRenduOffres` : titre, encart, puces de secteur avec nombres, quatre groupes, lignes avec pastille « Vérifié le », bouton et phrase « Vous quittez l'application », bas de page, cas vides, bouton La Bonne Boîte (textes de la validation).
- [x] 2.3 Brancher l'écran dans `_mtBrancherPage`, l'instantané/restauration de l'historique et le bouton « Revenir à la page principale ».
- [x] 2.4 Mode sombre : toute couleur nouvelle a sa valeur `[data-theme="sombre"]` (réutiliser les classes existantes d'abord).

### Étape 3 : les accès
- [x] 3.1 Tuile « Employeurs qui publient leurs offres » en tête de `_mtRenduEmploi`, avec le nombre réel.
- [x] 3.2 Bouton « Ses offres publiées » sur `_mtRenduFiche` quand l'employeur est dans le fichier.
- [x] 3.3 Réécrire `_mtRenduCriteres` pour cette rubrique ; retoucher la présentation `pageIntroEmployeursTerritoire` et l'aide `AIDE_PAGES` (textes validés).
- [x] 3.4 Recherche de l'accueil (`monTerritoireResultatsRecherche`) : « offres », « recrutement », noms des employeurs de la liste ; `node scripts/checkLexique.js` sans erreur. Le Lexique n'a aucune fiche sur « Qui fait quoi » : rien à y ajouter.

### Étape 4 : vérifications
- [x] 4.1 `npm test` entièrement vert.
- [x] 4.2 Essai navigateur (après un vrai clic) : tuile, écran en Dordogne puis en Haute-Vienne, filtre secteur, ouverture d'une page, flèche « Précédent » à chaque écran, bouton « Revenir à la page principale », mode sombre, téléphone (largeur étroite). Ajouter un parcours dans `scripts/parcours/parcours_smoke.js`.
- [x] 4.3 Mettre à jour dans le même commit : `BRIQUES_COMMUNES.md` (nouvelle source, dette de la colonne `recrutement`), `ETAT_DES_CHANTIERS.md`, section REPRISE du chantier, mémoire.
- [ ] 4.4 Rappel (toujours à faire avant une mise en ligne) : `MT_OUVERT = true` reste pour le travail local ; avant toute mise en ligne publique, le repasser à `false`.

## Hors de ce plan (étapes suivantes déjà notées)
- Liste « à revérifier » dans l'outil de veille ; outil de prospection ; mention « stages » avec accord de l'employeur : voir le document « pont ».

## Résultat (2026-10-17)
`npm test` : 1586 verts. Essais navigateur : `monTerritoireOffres` (12 contrôles) et les essais existants `monTerritoire`, `monTerritoireAide`, `employeurs`, `territoires`, `hauteVienne` (46 contrôles) verts, flèche « Précédent » et « Revenir à la page principale » vérifiées, mode sombre et largeur de téléphone vus.
