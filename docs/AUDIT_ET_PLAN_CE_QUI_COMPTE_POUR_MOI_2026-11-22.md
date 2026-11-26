# « Ce qui compte pour moi » : audit du code réel et plan de réalisation (22/11/2026)

Fait après la validation des trois maquettes (consignes 556 à 558). Rien n'est codé. Ce document attend le feu vert de Denis.
Maquettes : `docs/MAQUETTE_CE_QUI_COMPTE_POUR_MOI_ACCUEIL_2026-11-22.html`, `..._CARTE_CONDITIONS_2026-11-22.html`, `..._SEPT_AUTRES_CARTES_2026-11-22.html`. Contenu et décisions : `docs/CHANTIER_MIEUX_SE_COMPRENDRE_2026-11-22.md`.

## 1. Ce que j'ai lu (code réel)

- Le module modèle `modules/mes-competences/` (7 fichiers, environ 1 700 lignes) : interrupteur `MESCOMP_OUVERT`, page de présentation `pageIntroMesCompetences` (composant partagé `htmlPageIntroModuleParcours`), état de session, navigation, branchement dans `js/app.js` (routes ligne 3941), `index.html` (scripts 631 à 638).
- Le module `modules/comprendre-les-metiers/` : son interrupteur à deux niveaux `cmvOuvert()` (fermé = visible seulement sur localhost), et `garder.js` (« Garder mon résultat » et disquette : jamais une réponse d'office, structure extensible, tout ce qui vient d'un fichier est relu avec méfiance).
- Le registre de la disquette dans `js/app.js` (`collecterEtatsModulesPourSauvegarde` ligne 41635, `restaurerEtatsModules` ligne 41672, `_modulesOntUnTravail` ligne 4334).
- La carte d'accueil « Boîte à outils » : `htmlCarteAccueil('boiteaoutils', ...)` (`js/app.js` ligne 5379), la liste des outils de la carte `itemsInfoCarteAccueil` (`data/metiers.js` ligne 9427), la tuile du panneau (`data/metiers.js` ligne 9593) et son clic (`data/metiers.js` ligne 9806).
- La recherche de l'accueil (`data/baseConnaissancesERIP.js`, une entrée avec `motsCles` et `cible: 'route:...'`), le Lexique (`data/lexique.js` plus `scripts/checkLexique.js`), l'aide contextuelle (`AIDE_PAGES`, `js/app.js` ligne 42919).
- Les conditions du ROME (`data/conditionsRome.js`, généré, 22 identifiants) et les groupes de « Explorer les métiers » (`CMA_CONDITIONS_GROUPES`).

## 2. Ce qui est simple (reprise de l'existant)

- Interrupteur `CQCPM_OUVERT` avec aperçu sur localhost seulement tant que le module est fermé : le patron `cmvOuvert()` se reprend tel quel.
- Page de présentation et « Revoir la présentation » : le composant partagé existe, rien à inventer.
- Routes, scripts dans `index.html`, tuile dans la carte « Boîte à outils » (trois endroits dans `data/metiers.js`, un dans `js/app.js`), aide contextuelle : ajouts, aucune ligne existante modifiée sauf des listes.
- Disquette : le contrat existe (une fonction d'export, une de restauration, deux lignes dans `js/app.js`), et le patron de `garder.js` (identifiants connus, tailles limitées) se reprend tel quel.
- Recherche de l'accueil et Lexique : une entrée par carte, dans les fichiers prévus.
- Les dix-neuf valeurs, les sept thèmes de conditions, les questions et les textes des huit cartes : tout est déjà écrit et validé dans les maquettes, il suffit de les ranger dans des fichiers de données.

## 3. Ce qui est plus délicat

1. **Un petit moteur d'écran à écrire.** Le composant de questionnaire existant est propre au questionnaire de préférences (lettres RIASEC) : pas réutilisable. Pour ne pas écrire huit interfaces séparées (risque de duplication, règle « une seule source de vérité »), je propose **un seul moteur d'écran, piloté par des fiches de données** : chaque carte est décrite par ses écrans, et chaque écran par des types de champs en nombre limité (zone de texte, choix à cocher avec maximum, ligne à trois réponses, piles, entrées de une à trois). Les huit cartes de la maquette n'utilisent que ces champs. Le moteur est la partie qui demande le plus de soin, mais il fait ensuite des sept autres cartes de la donnée, pas du code.
2. **Textes personnels sur la disquette.** Les envies, les expériences et les textes libres sont des écrits personnels. Ils n'entrent dans la disquette que si la personne a cliqué « Garder mon résultat » pour cette carte, comme décidé. À la relecture du fichier, tout est contrôlé (identifiants connus, longueur maximale de chaque texte, nombre d'entrées). Ces textes ne sont envoyés nulle part : il n'y a pas d'assistant dans l'espace tant que le prompt n'existe pas.
3. **`_modulesOntUnTravail`** : dès qu'une carte est gardée, l'application considère qu'il y a un travail à sauvegarder (même effet que pour les autres modules). C'est voulu, mais à vérifier au test navigateur (message d'avertissement à la fermeture).
4. **Conditions et ROME** : les 19 conditions de la carte qui correspondent à un identifiant du ROME (nuit, week-end, horaires, saisonnier, déplacements, charges, debout, assis, répétitif, précision, tenue, sécurité, bruit, extérieur, public, domicile, isolé, télétravail, secteur public) gardent leur identifiant ROME dans la fiche de données (champ `rome`). Leur libellé reste à la première personne (« Travailler de nuit »), car les libellés du ROME décrivent le métier (« Travail de nuit possible ») : ce n'est donc pas une duplication de libellé, et la liste de correspondance est à consigner dans `docs/BRIQUES_COMMUNES.md`. Les réponses n'ont aucun effet sur les métiers proposés (déjà décidé).
5. **Le bloc « Dans les fiches métiers »** de la carte des conditions renvoie vers Explorer les métiers : je ne l'affiche que si ce module est ouvert (`cmvOuvert()`), jamais un bouton vers une page absente.
6. **Tests** : `js/app.js` et `modules/*/ui.js` ne sont pas chargés par les tests. La logique (état, résultats, disquette, validation du fichier) sera écrite en fichiers purs, testés par `npm test`. L'interface se vérifie obligatoirement au navigateur, carte par carte, en clair, sombre et téléphone.

## 4. Points bloquants ou imprévus

Aucun point bloquant. Aucune donnée manquante : tout le contenu est validé. Aucune fonction ni signature partagée existante n'est modifiée (je n'ajoute que des lignes dans les listes), donc le risque de casser des écrans hors du module est faible. Je ferai tout de même un grep sur tout le dépôt avant de toucher une liste partagée.

## 5. Plan en cinq commits (chacun testé avant le suivant)

| # | Contenu | Effort |
|---|---|---|
| 1 | Socle : fichiers de données (valeurs, conditions, définition des huit cartes), logique pure (état, réponses, résultat, export et relecture disquette) avec tests, interrupteur fermé, routes, scripts | [effort : haut] |
| 2 | Moteur d'écran générique, page d'accueil de l'espace (huit cartes, quatre thèmes, pastille « Terminé »), page de présentation, tuile dans la Boîte à outils visible seulement en aperçu | [effort : haut] |
| 3 | Carte type « Comment je veux travailler » de bout en bout (sept thèmes, énergie, résultat, « Garder mon résultat ») et test navigateur | [effort : moyen] |
| 4 | Les sept autres cartes (données seulement si le moteur est bien fait) et page « Ce que j'ai gardé » avec « Tout effacer » | [effort : moyen] |
| 5 | Recherche de l'accueil, Lexique (`node scripts/checkLexique.js`), aide contextuelle, journal des changements, `BRIQUES_COMMUNES.md`, disquette vérifiée de bout en bout (garder, exporter, importer) | [effort : moyen] |

Ensuite, séparément et sur votre décision : l'ouverture au public (interrupteur `CQCPM_OUVERT` à true et ligne dans `data/nouveautes.js`), puis le lien avec Ma synthèse (chantier à part) et le prompt (que vous testez vous-même, consigne 532).

Estimation de la taille : 1 500 à 2 000 lignes en 6 à 8 fichiers (comparable au module « Découvrir mes compétences »), plus les tests.

## 6. Ce que j'ai besoin de votre part

Le feu vert pour commencer par le commit 1, en mode A. Une seule vraie question de fond : voulez-vous que l'espace reste **fermé au public** (visible seulement sur votre poste, comme Explorer les métiers l'a été) jusqu'à vos essais ? Je recommande oui.
