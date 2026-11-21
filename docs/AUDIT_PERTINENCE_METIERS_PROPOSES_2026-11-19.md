# Audit de la pertinence des métiers proposés, « Explorer les métiers » (19/11/2026, consigne 487)

> Analyse seule : aucun code de l'application n'a été modifié. Les mesures viennent de petits essais rejoués hors de l'application (dossier de travail de la séance), sur le vrai moteur et les vraies données. Mode A (décision de fond), effort haut.

## 1. Ce que Denis a constaté

Les métiers proposés après les choix, dans les deux premiers chemins, ne correspondent pas ou peu aux choix (exemple : « travailler seul, nature, animaux, autonomie » ramène « créateur web » ou « cinéaste »). Il demande aussi de comprendre comment chaque choix a été traduit, et de donner les autres appellations d'un métier.

Numérotation retenue : chemin 1 = « Par un métier » (compétences, secteurs, conditions), chemin 2 = « Par ce que vous aimez faire » (avec qui ou quoi, ce que je fais, où, facile ou difficile), chemin 3 = « Par un questionnaire de préférences ». **À confirmer par Denis** : le chemin où « travail seul, nature, animaux, autonomie » a donné « créateur web ou cinéaste ». Je n'ai pas pu retrouver ce résultat avec ces choix (voir section 3).

## 2. Ce qui est mesuré

### Chemin 2 (par ce que vous aimez faire)

1. **Des égalités à 45 % classées par ordre alphabétique.** Avec un seul choix, un métier ne peut pas dépasser 45 % (plancher de la quantité d'information). Des dizaines à des centaines de métiers sont à égalité, et l'ordre alphabétique décide de ceux qui s'affichent en tête. Exemple : « Des clients » (788 métiers concernés) affiche d'abord « Agent animalier », « Agent d'assurance », « Agent de sécurité ». L'écran n'en montre que 6 : ce sont donc des métiers pris presque au hasard.
2. **Des étiquettes de fiche bruitées.** Un métier n'est relié à un choix que par trois courtes listes (avec qui ou quoi, ce que je fais, où). Pour les 1 790 fiches issues du ROME, ces listes sont déduites par des règles automatiques, parfois trop larges : « Oto-rhino-laryngologiste » porte « animaux d'élevage », « Accompagnant éducatif et social » porte « machines, outils ». Un choix comme « Au domicile » et « À votre domicile (télétravail) » donne exactement la même liste de 320 métiers.
3. **Les métiers que le catalogue cite lui-même pour un choix sont mal classés.** Chaque choix du catalogue a ses métiers d'exemple (275 au total, 271 retrouvés dans la base). En choisissant un seul élément, ces métiers sont dans les 10 premiers dans 16 % des cas seulement, dans les 50 premiers dans 39 %. Exemples : « Des élèves ou étudiants » ne ramène ni formateur ni animateur ; « Découper » ne ramène ni boucher ni opérateur de transformation des viandes ; « Conduire » ne ramène pas le conducteur d'engins.
4. **Les choix très généraux n'aident pas, mais l'écran les traite comme informatifs** (« Des clients », « Des collègues », « Des documents », « Bureau » : 600 à 900 métiers chacun).
5. **Les choix précis marchent bien** (animaux de compagnie, chevaux, cuisiner, soigner, nettoyer, cultiver : métiers très cohérents en tête). Le défaut est donc surtout pour les choix généraux et pour les combinaisons.

### Chemin 1 (par un métier : compétences, secteurs, conditions)

Les essais avec « autonomie », « nature », « animaux » et « travail seul » donnent des métiers cohérents (agriculture, nature, animaliers). Deux défauts à noter : beaucoup de métiers à égalité (72 %, 58 %), départagés par l'ordre alphabétique ; et « Faire preuve d'autonomie » est demandée par 511 métiers sur 1 919, donc sans valeur de tri. La condition « travail seul » ne pèse qu'un demi-point.

### Chemin 3 (questionnaire de préférences)

Le classement se fait sur deux lettres du métier. Pour le code RIA, **280 métiers sont à 100 %** (tous les métiers dont la lettre principale est R, même sans seconde lettre), classés par ordre alphabétique : la liste commence par « Affûteur d'outillage industriel », « Agent d'entretien des piscines », « Agent de déchèterie ». Pour RC : 517 métiers à égalité en tête. Un métier « RI » n'est pas mis avant un métier « R » seul. Les autres codes testés (SA, IE, SEC, AIS) donnent 16 à 58 égalités en tête.

## 3. Ce que je n'ai pas pu reproduire

« Travail seul » et « autonomie » n'existent pas comme choix dans le chemin 2 (c'est la condition « Moments de travail seul ou isolé » et le savoir-être « Faire preuve d'autonomie »). Avec toutes les façons plausibles de les saisir, « créateur web » et « cinéaste » ne sortent pas en tête. Il manque la suite exacte des clics : quelle page, quels choix. Hypothèse la plus probable : un mélange de choix très généraux (égalités à 45 %, ordre alphabétique) et de conditions, ou le chemin 1 avec « autonomie » seule.

## 4. Contraintes

- **Les listes des fiches PEUVENT être régénérées** (correction du 19/11/2026, après la question de Denis) : le paquet CSV du ROME version 62 est sur le poste, dans le dossier `Documents\ROME_v62_donnees` (30 fichiers). Un essai de régénération dans un dossier de travail (sans toucher au dépôt) prend 5 secondes et redonne les données actuelles, aux écarts près des corrections faites à la main depuis (F1610 et F1619, un accent, la date). Corriger les règles du générateur puis régénérer est donc possible, avec un contrôle avant et après.
- Un autre défaut déjà noté (ERREURS_ET_BUGS, 17/11/2026) : quatre fiches écrites à la main portent le code ROME d'un autre métier. Il alimente aussi les niveaux d'accès et les conditions.
- Une propagation à partir des métiers d'exemple du catalogue (en s'appuyant sur les compétences du ROME) fait passer les métiers d'exemple de 16 % à 22 % dans les 10 premiers et de 39 % à 57 % dans les 50 premiers : mieux, sans être suffisant seule. La mesure est limitée, car les métiers d'exemple sont peu nombreux.

## 5. Les appellations d'un métier

- **Déjà là** : la page « fiche métier » (celle qu'ouvre « Fiche du métier ») a un bloc « Ce métier s'appelle aussi » (les 8 noms les plus courants, puis un bouton pour voir tous les autres), en bas de page. Les données sont dans le ROME chargé à la demande (champ « autres noms, les plus courants d'abord »). Je ne l'ai pas revérifié au navigateur pendant cette séance (le navigateur intégré n'était plus joignable).
- **Manque** : (a) le bloc est loin dans la page, donc facile à rater ; (b) les métiers proches (niveaux un et deux) n'ont pas leurs appellations sur leurs lignes ; (c) la demande de recherche d'offres dit seulement « cherche sous tous les intitulés » : elle ne donne pas les cinq appellations les plus courantes.

## 6. Options pour le classement (à choisir par Denis)

| Option | Ce que ça fait | Bénéfice | Risque |
|---|---|---|---|
| **A. Départager les égalités (Recommandé, première étape)** | Pour les trois chemins, remplacer l'ordre alphabétique par un départage fondé sur le contenu (nombre de lettres ou de choix retrouvés, spécificité du métier, secteur dominant des choix). Pas de nouveau pourcentage affiché | Corrige le plus visible (liste de tête presque au hasard), faible risque, mesurable, testable | Ne corrige pas les étiquettes bruitées des fiches |
| **B. Ajouter une seconde preuve** | Aux choix du chemin 2, ajouter les métiers d'exemple du catalogue et leurs voisins du ROME, et les compétences que le catalogue associe au choix | Améliore les choix généraux et les combinaisons ; gain mesuré +6 à +18 points | Algorithme modifié : à tester sur beaucoup de combinaisons ; poids à régler |
| **C. Corriger les étiquettes à la source** | Corriger les règles de `scripts/importRome/tablesRome.js` (par exemple la règle « traite », qui reconnaît aussi « traitement »), puis régénérer les fiches | Corrige la cause, pour tous les chemins et toute l'application | Touche 1 790 fiches : contrôle avant et après obligatoire (liste des fiches dont les étiquettes changent) ; les fiches écrites à la main ne sont pas concernées |
| **D. Ne rien changer au calcul, mieux le dire** | Écrire à la personne que les choix très généraux donnent des listes larges | Aucun risque | Le défaut reste |

## 7. La rubrique « comment mes choix ont été traduits » (demande de Denis)

Faisable, et très utile pour mesurer la pertinence. Pour chaque métier proposé : lister les choix retrouvés dans la fiche (déjà calculés : « Vous aimez découper », « Environnement souhaité : espaces verts »), les choix **non retrouvés**, et une phrase simple par choix sur ce qu'il a servi à repérer. Pour le chemin 1 : les compétences retrouvées, la part du secteur et du niveau. Pour le chemin 3 : les lettres du métier face aux lettres de la personne. **Point d'attention** (consigne « jamais de ce qui manque », chemin 1) : la partie vide d'un pourcentage n'est jamais détaillée dans ce chemin ; il faut que Denis tranche si la rubrique montre aussi les choix non retrouvés.

## 8. Ordre de travail proposé

1. Confirmer le parcours exact où « créateur web ou cinéaste » est sorti (ou refaire un essai avec moi).
2. Option A (départage) sur les trois chemins, avec une feuille de mesure rejouable (les 108 choix du chemin 2, 10 codes du chemin 3, 12 combinaisons du chemin 1) pour comparer avant et après.
3. Rubrique « comment mes choix ont été traduits » (maquette d'abord).
4. Appellations : bloc plus haut dans la fiche, appellations sur les métiers proches, et cinq appellations dans la demande de recherche d'offres.
5. Option B seulement si la mesure après l'option A reste insuffisante.
