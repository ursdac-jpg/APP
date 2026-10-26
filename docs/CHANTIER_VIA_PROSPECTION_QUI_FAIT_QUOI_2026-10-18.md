# Chantier : marque « Via prospection » et rubrique séparée dans « Qui fait quoi » (créé le 2026-10-18)

> Mode A, `[effort : haut]` pour la conception. **PRÉPARATION SEULEMENT : rien n'est codé.** Décisions D1 à D5 tranchées le 2026-10-19 ; les cases de la section 6 restent décochées : le plan attend le feu vert explicite de Denis.
> Origine : `docs/CHANTIER_OUTIL_PROSPECTION_2026-10-18.md` (Complément 4, décisions du 2026-10-18).
> Maquette (vraies feuilles de style, mode sombre compris, boutons câblés, noms d'employeurs inventés) : `docs/MAQUETTE_VIA_PROSPECTION_2026-10-18.html` (double-clic depuis le dossier `docs`, ou `http://localhost:8123/docs/MAQUETTE_VIA_PROSPECTION_2026-10-18.html`).
> Rappel : le module reste fermé au public (`MT_OUVERT = false`, `modules/mon-territoire/logique.js`) : tout ce chantier n'est visible que sur le poste de Denis tant qu'il n'ouvre pas le module.

## 1. Ce qui est demandé

Les fiches d'employeurs issues de l'outil privé de prospection, une fois validées, doivent apparaître dans l'application **sans être mélangées** aux autres : une **marque visible « Via prospection »** sur la fiche, et un **onglet ou filtre séparé** pour les retrouver, **triables par secteur** (réutiliser le filtre de secteur existant). Les lignes arrivent par le sas des employeurs de l'outil de veille (`outils/sas/employeurs.sas.txt`, bouton « C'est bon » qui date la fiche) ; la colonne « source » commence par « Via prospection ; » (déjà fait côté outil de prospection : `PROSPECTION\prospection.html`).

## 2. Audit du code réel (lu le 2026-10-18)

Lu : `modules/mon-territoire/contenu/employeurs.txt` (103 fiches, aucune ne mentionne « prospection » aujourd'hui), `modules/mon-territoire/logique.js` (colonnes, lecture, vérificateur, recherche), `modules/mon-territoire/index.js` (écran Emploi, liste d'un secteur, fiche, recherche, clics), `outils/veilleTerritoire.js` et `outils/veilleSas.js` (colonnes, modification d'une fiche, sas), `tests/monTerritoire.test.js`, `data/baseConnaissancesERIP.js` (recherche de l'accueil), `css/style.css` (cartes, portes, grilles), `docs/BRIQUES_COMMUNES.md`.

**Faits utiles**
- Le registre a **11 colonnes** : `id | nature | nom | secteur | établissements | téléphone | site | page de recrutement | modes | source | date`. La lecture exige **exactement 11 colonnes** par ligne (`mtParserRegistre`).
- La colonne **source n'est affichée nulle part** dans l'application (ni fiche, ni liste). Elle sert à l'outil de veille et à la traçabilité. Aujourd'hui l'outil de veille y **ajoute du texte à la suite** (contrôle automatique, second assistant) : un préfixe « Via prospection ; » en tête survit à ces ajouts.
- Toutes les listes de l'application lisent **une seule fonction** : `_mtEmployeurs()` (`index.js:76`) = les employeurs du département. Secteurs, compteurs des 21 tuiles, liste d'un secteur, agences d'intérim, recherche du module, recherche de l'accueil : tout part de là. **Une seule porte à fermer** pour empêcher le mélange.
- La **fiche** (`_mtRenduFiche`) cherche l'employeur dans `_mtEmployeurs()` par son identifiant : elle devra chercher aussi dans la rubrique « Via prospection ».
- Le **filtre de secteur** existant a deux formes : les 21 tuiles de l'écran Emploi (une page par secteur) et les **puces avec compteur** de l'écran « Où voir les offres d'emploi » (`data-mt-secteur-offres`, clic sans changer d'écran). **La seconde est la bonne à réutiliser** : elle donne un tri par secteur sur une seule page, avec les compteurs. Le bandeau des communes (`_mtBandeauCommunes`, brique B.32) est réutilisé tel quel.
- Les **portes d'entrée** de l'écran Emploi (`_mtPortesPrincipales`) sont trois grandes cartes ; une quatrième se range dans la même grille (même classe `mt-porte`).
- **Vérificateur** : `mtVerifierEmployeurs` (appelé par `npm test` sur le vrai fichier et par l'outil de veille avant d'écrire). Il refuse une ligne mal écrite ; il ne connaît pas encore la marque.
- **Mode sombre** : la maquette utilise seulement des classes déjà existantes (cartes, puces, `badge text-bg-primary` déjà employé pour les compteurs) : aucune couleur nouvelle, donc aucune variable à doubler. Contrôlé visuellement en mode sombre dans la maquette.
- **Recherche** : l'accueil (`data/baseConnaissancesERIP.js`, groupe « Qui fait quoi ») et la barre du module passent par `mtRechercherEmployeurs(_mtEmployeurs(), ...)`. Le **Lexique** ne recherche pas les employeurs : rien à brancher de ce côté (les fiches du Lexique ne changent pas). Le mot « prospection » n'a pas d'entrée Lexique : à ne pas créer sans décision.

## 3. Ce qui est simple, risqué, bloquant

**Simple (reprise de l'existant)** : la quatrième porte, l'écran de la rubrique (puces de secteur + bandeau des communes + cartes : trois briques déjà là), la pastille et l'encart sur la fiche, l'exclusion des listes normales (une seule fonction), le filtre de recherche.

**Risqué**
1. **Comment reconnaître une fiche « Via prospection »** (décision D2 ci-dessous). Le choix le plus simple (lire le début de la colonne « source ») ne change pas le format du registre, mais **si quelqu'un modifie la colonne source dans l'outil de veille** et enlève le préfixe, la fiche **passerait silencieusement dans les listes normales** : c'est exactement le mélange à éviter. Parades prévues : l'outil de veille refuse de modifier le début d'une source qui commence par la marque ; le vérificateur refuse les variantes (« via prospection » en minuscules, au milieu du texte, sans le point-virgule). Reste un risque faible, pas nul.
2. **Un changement de format du registre** (douze colonnes) toucherait : les 103 lignes, le sas, les fixtures de tests, l'écran d'édition de l'outil de veille, les générateurs de prompts (`scripts/genererPartieEmployeursPrompt.js`, `importerDansLeSas.js`) et le bouton de copie de l'outil de prospection. Faisable mais lourd et risqué pour un gain de robustesse limité.
3. **Noms d'entreprises qui contiennent un nom de personne** (exemple : « Garage Dupont »). Le vérificateur n'attrape que « M. », « Mme », « Monsieur »... Ce sont des raisons sociales publiques (registre Sirene), pas des personnes, et l'outil de prospection exclut déjà les entrepreneurs individuels ; mais une société nommée d'après son gérant reste une donnée sensible dans un dépôt public. **À décider** (D5), pas à corriger à chaud.

**Bloquant** : rien de technique. **Ce qui manque pour coder** : les réponses de Denis aux décisions D1 à D5, et au moins une fiche réelle validée dans le sas pour l'essai bout en bout (aujourd'hui aucune ligne « Via prospection » n'existe dans `employeurs.txt` : l'essai navigateur se fera avec des lignes inventées dans une copie de travail, jamais commitées dans le registre).

## 4. Décisions à prendre (une à la fois, recommandation d'abord)

- [x] **D1. Où placer la rubrique. TRANCHÉ par Denis : une quatrième porte « Via prospection » sur l'écran Emploi, avec sa page (puces de secteur, communes, cartes).**
  - **(Recommandé) Une quatrième porte « Via prospection » sur l'écran Emploi**, avec sa propre page (puces de secteur avec compteur + communes + cartes). Bénéfice : tout est vu d'un coup, le tri par secteur est immédiat, les listes normales et leurs compteurs ne changent pas (aucun mélange par construction). Risque : une porte de plus sur un écran déjà chargé (4 grandes cartes au lieu de 3).
  - Filtre « Via prospection » dans chaque secteur (écran 5 de la maquette). Bénéfice : pas de nouvelle porte. Risque : il faut ouvrir les 21 secteurs un par un ; « Tous » doit exclure les fiches de prospection (« Tous » ne veut plus dire tous) ; pas de tri par secteur d'un coup d'œil. Contredit la demande de tri.
  - Les deux. Bénéfice : double accès. Risque : deux mécanismes à tenir cohérents, doublon de logique (contraire à la règle de la source unique).
- [x] **D2. Comment reconnaître une fiche (voir section 3, point 1). TRANCHÉ par Denis : le début de la colonne « source » (« Via prospection ; »), avec les deux parades (outil de veille et vérificateur).**
  - **(Recommandé) Lire le début de la colonne « source » (« Via prospection ; »)**, avec les deux parades (outil de veille et vérificateur). Bénéfice : aucun changement de format, l'outil de prospection fonctionne déjà ainsi, aucune fiche existante touchée. Risque : une modification manuelle du fichier qui efface le préfixe fait passer la fiche dans les listes normales (les parades l'attrapent dans l'outil et au test, pas dans un éditeur de texte hors test).
  - Une douzième colonne « origine ». Bénéfice : explicite, robuste. Risque : chantier lourd (point 2 ci-dessus), toutes les lignes et tous les outils à reprendre.
  - Un second fichier (`employeurs-prospection.txt`). Bénéfice : séparation physique. Risque : l'outil de veille doit router les lignes vers l'un ou l'autre fichier (« C'est bon », revérification, suppression), et la recherche doit lire deux fichiers.
- [x] **D3. La recherche. TRANCHÉ par Denis : oui, dans un groupe à part.** **(Recommandé)** Les fiches « Via prospection » ressortent dans la recherche, **dans un groupe à part** (« Via prospection : nom », jamais mêlées aux « Employeurs »). Bénéfice : on les trouve en tapant un nom, sans mélange. Risque : un résultat de plus à gérer. Alternative : pas dans la recherche (plus simple, mais on ne retrouve une fiche que par la porte).
- [x] **D4. Les mots affichés au public. TRANCHÉ par Denis : marque « Via prospection » + phrase d'explication (textes de la maquette, à relire une dernière fois à la livraison).** Le mot « prospection » est celui de Denis ; pour une personne en recherche d'emploi il est peu clair. **Recommandé** : garder la marque exacte « Via prospection » (décision de Denis) et ajouter **une phrase d'explication** sous la marque (brouillon dans la maquette : « repérés lors de démarches de prospection, pas parce qu'ils ont publié une offre ; rien ne dit qu'ils recrutent ; téléphonez d'abord »). À relire et corriger par Denis. Jamais d'affirmation de recrutement.
- [x] **D5. Raisons sociales qui portent un nom de personne. TRANCHÉ par Denis (2026-10-19) : avertissement dans l'outil de prospection avant la copie, décision fiche par fiche (case D1 du plan).** **Recommandé** : ne rien faire de plus que l'existant (organismes seulement, entrepreneurs individuels déjà exclus par l'outil de prospection) et ajouter à l'outil de prospection un **avertissement avant la copie** quand le nom d'une société ressemble à un nom de personne, pour que Denis décide fiche par fiche. Alternative : refuser automatiquement au vérificateur (risque : refuser à tort des enseignes légitimes).

## 5. Inventaire de l'existant (étape 4 de la méthode maquette)

| Élément existant | Étiquette | Remarque |
|---|---|---|
| Écran Emploi : 3 portes, 21 secteurs, compteurs | GARDÉ | Compteurs ne comptent pas les fiches « Via prospection ». Une quatrième porte s'ajoute (D1). |
| Liste d'un secteur (Tous / Enseignes / Employeurs locaux, communes) | GARDÉ | Inchangée, aucune fiche de prospection dedans. |
| Écran Agences d'intérim | GARDÉ | Inchangé. |
| Fiche d'employeur (blocs, boutons, téléphone, carte) | ENRICHI | Pastille « Via prospection » sous le nom + encart d'explication ; tous les boutons gardés. |
| Puces de secteur avec compteur (écran offres) | GARDÉ | Réutilisées comme modèle ; si le code s'y prête, une seule fonction paramétrée (brique commune), sinon dette notée dans `BRIQUES_COMMUNES.md`. |
| Bandeau des communes (B.32) | GARDÉ | Réutilisé tel quel. |
| Recherche de l'accueil et du module | ENRICHI | Groupe à part (D3). |
| `mtVerifierEmployeurs` | ENRICHI | Contrôle de la marque (forme exacte, nature « local » seulement). |
| Outil de veille : modification d'une fiche | ENRICHI | Le début de la source ne peut pas être effacé. |
| Aucun élément RETIRÉ. | | |

## 6. Plan en cases (PROPOSITION, rien n'est coché, à figer après les réponses de Denis)

Ordre logique : A avant B avant C ; D et E après B. Un commit par case, `npm test` à chaque fois, essai navigateur pour tout ce qui touche `index.js`.

- [x] **A1. `[effort : moyen]`** `logique.js` : constante de la marque, fonction `mtViaProspection(employeur)`, fonction qui sépare les employeurs en deux listes, vérificateur de la marque (forme exacte, nature « local », pas de variante). Tests dans `tests/monTerritoire.test.js` (+ fixture inventée).
- [x] **A2. `[effort : moyen]`** `outils/veilleTerritoire.js` : refuser qu'une modification efface le début « Via prospection ; » d'une source (test dans `tests/veilleTerritoire.test.js`).
- [x] **B1. `[effort : haut]`** `index.js` : `_mtEmployeurs()` exclut les fiches de prospection (listes, compteurs, intérim, recherche), nouvelle fonction pour la rubrique, la fiche cherche dans les deux. Grep sur tout le dépôt avant (fonction partagée : `smoke`, tests, outil de veille).
- [x] **B2. `[effort : haut]`** `index.js` : quatrième porte, écran de la rubrique (puces de secteur avec compteur, bandeau des communes, cartes, état « vide » honnête), historique et bouton « Retour » (`_mtAller`, `historiqueInterneEmpiler`).
- [x] **B3. `[effort : moyen]`** Fiche : pastille et encart d'explication ; carte de la liste : pastille.
- [x] **C1. `[effort : moyen]`** Recherche : groupe à part dans le module et dans l'accueil (`monTerritoireResultatsRecherche`, `data/baseConnaissancesERIP.js`), ouverture directe de la fiche.
- [x] **D1. `[effort : bas]`** Outil de prospection (`PROSPECTION\`, hors dépôt) : avertissement avant la copie si le nom d'une société ressemble à un nom de personne (D5).
- [x] **E1. `[effort : moyen]`** Essai navigateur complet (mode clair et sombre, téléphone étroit, Dordogne et Haute-Vienne, retour arrière, recherche) avec des lignes inventées dans une copie de travail non commitée.
- [x] **E2. `[effort : bas]`** Documents : `BRIQUES_COMMUNES.md` (nouvelle brique « marque d'origine »), `ETAT_DES_CHANTIERS.md`, mention dans `CHANTIER_OUTIL_PROSPECTION_2026-10-18.md`, leçon éventuelle.

Vérification à faire par Denis en 10 secondes après la livraison (à ajouter à la fin du chantier) : ouvrir « Qui fait quoi », écran Emploi, cliquer la porte « Via prospection », choisir un secteur dans les puces, ouvrir une fiche et vérifier la pastille ; puis ouvrir le même secteur par une des 21 tuiles et vérifier qu'elle n'y est pas.

## 7. Verdict

**APTE AU MODE NUIT, sous une seule condition : le feu vert explicite de Denis sur la maquette et le plan en cases.** Les décisions D1 à D5 sont toutes tranchées (2026-10-19) ; il ne reste que du code selon le plan. Aucun code n'est écrit avant ce feu vert.

Seule vérification restante qui n'est pas une décision : à la livraison, Denis relit une dernière fois les textes affichés (D4) sur l'écran réel.

**Effort de la séance de codage** : `[effort : haut]` pour B1 et B2 (fonction partagée, historique, risque de régression), `moyen` pour le reste ; regroupement possible en une séance haute puis une séance moyenne, sauf dépendance.

## 8. État final (2026-10-19) : CODÉ, essais de Denis à faire

**Livré** (commits Site_V2 : `a15a1829` A1, `5858f2d4` A2, `0fbf783b` B1 à C1 ; PROSPECTION : `621d88f`) : marque lue au début de la source, vérificateur, protection dans l'outil de veille, quatrième porte, rubrique avec puces de secteur et communes, pastille sur les cartes, encart sur la fiche, recherche à part (accueil et module), avertissement dans l'outil de prospection. `npm test` vert (1705 essais) ; parcours navigateur `monTerritoireProspection` : 13 contrôles sur 13, en clair et en sombre (fiches inventées en mémoire, rien d'écrit dans le registre).

**Écarts avec la maquette, à savoir** :
1. La porte « Via prospection » **n'apparaît que s'il existe au moins une fiche marquée** pour le département (pas de porte vide ; aujourd'hui aucune fiche réelle, donc la porte est invisible tant que la première n'est pas validée). Le compteur « NOUVEAU » de la maquette n'existe pas : la porte affiche le nombre d'employeurs.
2. Comme les autres listes du module, la rubrique **demande de choisir une commune** (ou « Voir toute la liste ») avant d'afficher les cartes ; les puces de secteur et leurs compteurs sont visibles tout de suite.
3. Avertissement D5 : détecte les civilités et les prénoms courants à côté d'un autre mot ; **un nom de famille seul (« Garage Dupont ») n'est pas détecté** (pas de liste de noms de famille). Il avertit, il ne refuse jamais.

**Non vérifié** : affichage sur téléphone étroit (la maquette a été vue, pas la vraie page), Haute-Vienne avec de vraies fiches, essai bout en bout sur une vraie fiche issue du sas.

**Constaté en passant** : 4 contrôles périmés du fichier de parcours (texte de la porte « offres », filtre Sécurité, nombre fixe d'enseignes du commerce) ont été corrigés. **Restent en échec, sans rapport avec ce chantier** : « la liste du Logement dit en Dordogne » et « dans la Haute-Vienne » (parcours `territoires`, titre de la page lu différemment) ; le parcours `hauteVienne` n'a pas fini dans le délai d'essai (non conclu). À reprendre dans une séance dédiée.

**Vérification en 10 secondes pour Denis** : voir la fin de la section 6.
