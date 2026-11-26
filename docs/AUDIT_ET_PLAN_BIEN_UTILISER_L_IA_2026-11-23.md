# « Bien utiliser l'IA » : audit du code réel et plan de réalisation (23/11/2026)

Fait après la validation des quatre maquettes (entrée, chemins 1, 2 et 3 ; consignes 587 à 595). Rien n'est codé. Ce document attend le feu vert de Denis.
Maquettes : `docs/maquettes/maquette-bien-utiliser-ia-entree-2026-11-23.html`, `...-comprendre-...`, `...-mes-modeles-...`, `...-ecrire-ma-demande-...`. Contenu, décisions et recherche : `docs/CHANTIER_BIEN_UTILISER_L_IA_2026-11-22.md` et `docs/RECHERCHE_COURRIERS_ET_CORPUS_BIEN_UTILISER_L_IA_2026-11-23.md`.

## 1. Ce que j'ai lu (code réel)

- Le module modèle `modules/ce-qui-compte/` (index.js, logique.js, ecrans.js, papier.js, document.js) : interrupteur `CQCPM_OUVERT` avec aperçu local `cqcpmOuvert()`, état de session, page de présentation `pageIntroCeQuiCompte`, contrat de la disquette (`cqcpmExporterEtatPourSauvegarde`, `cqcpmRestaurerEtatDepuisSauvegarde`).
- `js/app.js` : la table des routes (ligne 3943), la carte d'accueil « Boîte à outils » (ligne 5379), le registre de la disquette (`collecterEtatsModulesPourSauvegarde` ligne 41635, `restaurerEtatsModules` ligne 41679), le registre des prompts externes (ligne 34780 et suivantes), `AIDE_PAGES` (ligne 43057), `copierTexteVersPressePapier` (ligne 39299, avec le retour « Copié ! »), `barreEtapesModule` (ligne 26915).
- `data/metiers.js` : la tuile et le texte de la carte « Boîte à outils » (lignes 9452 et 9612), `data/baseConnaissancesERIP.js` (recherche de l'accueil, `motsCles` plus `cible: 'route:...'`, champ `ouvertSi`), `data/nouveautes.js` et `tests/nouveautes.test.js`, `data/lexique.js` (1047 entrées, aucune sur « prompt », « IA » ni « assistant en ligne ») et `scripts/checkLexique.js`.
- Les tests qui interdisent le mot « IA » : `tests/introduction.test.js`, `tests/videoPresentation.test.js`, `tests/nouveautes.test.js` (chacun sur ses propres fichiers, pas un balayage du dépôt).
- Les quatre maquettes de la session (code de repérage, d'alerte de date, de masquage et d'assemblage déjà écrit et vérifié en navigateur).

## 2. Ce qui est simple (reprise de l'existant)

- Interrupteur à deux niveaux (fermé au public, visible sur localhost), routes, scripts dans `index.html`, tuile dans la carte « Boîte à outils », aide contextuelle, présentation avec « Revoir la présentation » : tout se reprend du patron de « Ce qui compte pour moi », uniquement par ajouts de lignes.
- Disquette : le contrat existe (une fonction d'export, une de restauration, deux lignes dans `js/app.js`). Ici elle ne reçoit que les demandes que la personne a ajoutées elle-même (consigne 595), jamais une saisie en cours.
- Copie de la demande : `copierTexteVersPressePapier` existe déjà.
- Chemin 1 : des pages de lecture, sans calcul ; les textes sont écrits dans les maquettes.
- Les deux niveaux de lecture, les six couleurs d'éléments, les pastilles et les blocs dépliants : le langage visuel commun existe.
- Le code de la maquette du chemin 2 (dates, masquage, repérage, assemblage du modèle 4) se porte presque tel quel dans un fichier de logique pure, testé par `npm test`.

## 3. Ce qui est risqué ou délicat

1. **Le chemin 2 ne tient pas sa promesse « toutes les demandes sont déjà écrites ».** Sur les douze modèles de la première vague, trois seulement existent en brouillon : « Comprendre un courrier reçu » (version 3.1, à retester sur les courriers C, puis A et B), « Répondre à l'administration » (version 3.3) et « Préparer un rendez-vous ou un appel » (version 3.3). Les neuf autres (mail de candidature, relire mon CV, préparer un entretien, mail poli, reformuler, expliquer un mot, et les trois professionnels) sont à écrire dans la même architecture par blocs. Les prompts déjà présents dans l'application (`cv.md`, `lettre.md`, `entretien.md`...) dépendent de modules qui leur fournissent des données : ils ne sont pas réutilisables comme modèles libres. Conséquence concrète à l'ouverture : seule la famille « Administration et démarches » aura des modèles prêts, les autres familles ne s'afficheront pas (règle déjà validée : une famille sans modèle prêt n'apparaît pas).
2. **Où vivent les textes des demandes.** Denis teste et corrige les prompts seul et tout de suite. Pour qu'il puisse le faire sans passer par du code, les blocs de texte (socle, longueur, langage, droits, questions d'abord, variantes) devraient vivre dans un fichier de texte lisible, comme les autres prompts (`prompts/*.md`, registre ligne 34780), et non dans du JavaScript. Cela demande un petit lecteur de fichier à sections et un test qui vérifie que chaque bloc attendu est présent. C'est faisable, mais c'est la première fois que des blocs assemblés (et non un prompt entier) passent par ce registre : à tester avec soin.
3. **L'alerte de date et le repérage du modèle sont des algorithmes.** Dates écrites en toutes lettres ou en chiffres, « 1er », accents, date d'envoi du courrier à ne pas confondre avec une échéance, délais en durée jamais calculés. La maquette fonctionne sur les trois courriers fictifs, mais le taux de réussite du repérage n'est pas mesuré : il manque les phrases réelles de Denis (au moins une dizaine). Le code montrera toujours ce qu'il a repéré et la personne confirmera toujours (consigne 589), ce qui limite le risque d'une erreur silencieuse.
3 bis. **Masquage automatique** (téléphone, courriel, IBAN) : trois expressions régulières écrites pour des formats français. Un numéro étranger ou un format inhabituel ne sera pas masqué : le message dit que les noms, adresses et autres numéros restent à la charge de la personne.
4. **Le mot « IA » et les autres modules.** La dérogation couvre ce module et ses fiches du Lexique. À l'ouverture, ce nom apparaîtra aussi dans la page Nouveautés, la recherche de l'accueil, la tuile de la carte, l'introduction et la vidéo de présentation (l'autre session les refait), dont les tests interdisent aujourd'hui le mot « IA ». Il faudra des exceptions nominatives, ou un nom court sans « IA » à l'endroit concerné. À trancher à l'ouverture, pas avant : aucun de ces fichiers n'est touché d'ici là.
5. **Volume de contenu à sourcer.** Sept écrans de lecture, vingt-quatre techniques en trois niveaux, un Avant/Après par modèle : tout doit être sourcé et revérifié tous les six mois (les assistants et leurs guides changent). Une tâche programmée de contrôle est à prévoir à l'ouverture.
6. **Une seule source de vérité** : les six éléments d'une bonne demande servent au chemin 1 (explication), au chemin 2 (assemblage des modèles) et au chemin 3 (écrire la mienne). Une seule liste dans un fichier de données, lue par les trois ; jamais recopiée. Chaque chemin garde sa propre interface, pas de second éditeur de demandes.
7. **`js/app.js` et `modules/*/ui.js` ne sont pas chargés par les tests** : la logique est écrite en fichiers purs testés par `npm test`, l'interface se vérifie dans le navigateur (clair, sombre, téléphone), obligatoirement.

## 4. Points bloquants ou imprévus

Aucun point bloquant technique. Un imprévu de contenu (point 3.1 : neuf modèles sur douze restent à écrire), qui ne bloque pas le code mais change ce qui sera réellement ouvert au public. Aucune fonction ni signature partagée existante n'est modifiée (je n'ajoute que des lignes dans des listes) : le risque de casser des écrans hors du module est faible, et je ferai quand même un `grep` sur tout le dépôt avant chaque ajout dans `js/app.js` et `data/metiers.js`.

## 5. Plan en commits (chacun testé avant le suivant)

| # | Contenu | Effort |
|---|---|---|
| 1 | Squelette : interrupteur `BUIA_OUVERT` (fermé au public, visible en local), routes, scripts, tuile « Bien utiliser l'IA » dans « Boîte à outils » (local), page de présentation, écran d'entrée (trois boutons, « Par où commencer ? », réassurance), aide contextuelle | moyen |
| 2 | Données et logique pures : liste unique des six éléments, réglages (longueur, langage, droits, questions d'abord), socle de règles ; lecteur du fichier de blocs ; tests | moyen |
| 3 | Chemin 1 « Comprendre » : sept écrans plus « Ce qu'il faut retenir », deux niveaux de lecture, trois sujets, emplacement de la vidéo laissé vide | moyen |
| 4 | Logique du chemin 2 : repérage du modèle (mots), lecture des dates, alerte calme, masquage ; tests sur les trois courriers A, B, C, sur une liste de formulations de dates, et sur les phrases réelles de Denis dès qu'il les fournit | haut |
| 5 | Chemin 2, écrans : choisir (papier, mots, liste des familles), compléter, après la réponse ; modèle 4, puis 5 et 9 après les essais de Denis ; famille « Mes demandes » | haut |
| 6 | Chemin 3 « Écrire ma propre demande » (trois écrans) et « Ajouter à ma disquette » : export et restauration, test d'aller-retour | moyen |
| 7 | Cinq fiches du Lexique (IA, prompt, réponse inventée, anonymiser, assistant en ligne), recherche de l'accueil, exception nominative dans `tests/nouveautes.test.js`, `node scripts/checkLexique.js` à zéro erreur et zéro avertissement | bas |
| 8 | Vérification complète dans le navigateur (parcours des trois chemins, clair, sombre, 375 px), passation dans `docs/ETAT_DES_CHANTIERS.md` | moyen |
| 9 | À l'ouverture seulement : vidéo en tout dernier, présentation refaite une seule fois, `BUIA_OUVERT` à true, ligne `data/nouveautes.js` et `docs/JOURNAL_DES_CHANGEMENTS.md`, tâche de contrôle tous les six mois | bas |

Séquence : les commits 1 à 3 et 6 ne dépendent pas des essais de Denis sur les prompts. Les commits 4 et 5 avancent avec le modèle 4 en version 3.1 ; ses textes pourront encore changer après les essais, c'est pourquoi ils vivent dans un fichier de texte et non dans le code (point 3.2).

## 6. Ce que je demande à Denis

1. Le feu vert pour le commit 1 (squelette fermé au public).
2. Son accord sur le point 3.2 : textes des demandes dans un fichier lisible `prompts/bien-utiliser-*.md`, modifiable par lui sans code.
3. Ses essais : le modèle 4 en version 3.1 sur le courrier C, puis A et B ; au moins dix phrases réelles pour mesurer le repérage ; et, plus tard, les neuf modèles restants (à écrire à sa demande expresse, comme les trois premiers).
4. Son choix à l'ouverture sur le mot « IA » dans les autres pages (point 3.4), pas maintenant.
