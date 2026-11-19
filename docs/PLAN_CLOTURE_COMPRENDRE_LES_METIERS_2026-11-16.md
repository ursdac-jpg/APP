# Module « Comprendre les métiers » : plan complet jusqu'à la clôture (à valider par Denis)

Créé le 16/11/2026. Complète `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md` (qui garde l'historique et les décisions). **Rien n'est codé à ce jour.** Ce plan repose sur un audit du code réel fait le 16/11/2026 (section 2).

## 1. Où en est le module

| Étape | État |
|---|---|
| Décisions de fond, maquette V2 (15 écrans) | Faites. La maquette V2 n'a pas encore été relue en entier par Denis. |
| 300 énoncés (4 parties) | Rédigés et validés |
| Règle de calcul, textes d'ouverture, calibration du pourcentage | Rédigées et validées |
| **Code du module** | **Aucun** : ni fichier de module, ni données, ni pages |
| Présentation, vidéo, ponts, recherche, disquette, mode sombre | Non commencés |

**Le module n'est donc pas codé, il ne peut pas encore apparaître dans la carte « Vous hésitez encore ? ».** La préparation (documents) est terminée ; le code est la prochaine grande étape.

## 2. Ce que l'audit du code réel a trouvé

- **Aucun module n'existe** sous `modules/` pour « Comprendre les métiers ». Il n'y a que l'interrupteur `MODULE_COMPRENDRE_METIERS_OUVERT = false` (`js/app.js:11103`) et ses trois boutons cachés.
- **Les ponts déjà préparés** (trois ponts, quatre lignes de code, tous cachés par l'interrupteur) :
  1. `js/app.js:11169` : « Voir les métiers » (type `metiers`), dans le deuxième niveau de lecture d'une carte « Proche de votre profil ».
  2. `js/app.js:11331` et `11332` : phrase « Les chiffres de votre territoire... sont dans le module » et bouton « Comprendre pourquoi ils recrutent » (type `bmo`).
  3. `js/app.js:12308` : « Comprendre ces métiers » (type `saisonniers`).
  4. **Aucun gestionnaire de clic ne les écoute encore** : l'écouteur (`js/app.js:11277`) ne traite que les rubriques `a`, `b`, `comp`, `autres`, `plus`. Il faudra l'écrire.
- **Un test verrouille l'état fermé** : `tests/listeMetiersCartes.test.js:46-48`. Il devra être mis à jour à l'ouverture.
- **Module modèle** : « Un CV, plusieurs métiers » (17 fichiers, 5 285 lignes, `modules/un-cv-plusieurs-metiers/`). Son branchement montre tout ce qu'un module doit toucher : routes `-intro` et module (`js/app.js:3951-3954`), tuile de la carte (`data/metiers.js:9581`), recherche de l'accueil (`data/metiers.js:9399`), connaissances de l'assistant (`data/baseConnaissancesERIP.js`), sauvegarde de la disquette (`js/app.js:4323`, `41518`), texte de la carte (`js/app.js:5369`), visite guidée (`js/app.js:42386`), interrupteur (`UCPM_OUVERT`).
- **Vidéos** : registre `VIDEOS_PRESENTATION` (`modules/video-presentation/videoPresentation.js`), 24 vidéos dans `videos/modules/`, chaîne de fabrication automatique dans `docs/video_presentation/court/` (un scénario par module dans `court/scenarios/`, voix de synthèse, navigateur de test). Modèle : `module-ucpm.js` et `ucpm.mp4`.
- **Patron de présentation et bouton « Revoir la présentation »** : `docs/LANGAGE_VISUEL_COMMUN.md` (section 5bis), brique `htmlBoutonRevoirModule` (`js/app.js`). Deux familles de modules : la famille 1 (espace de consultation) n'a que le bouton et sa note ; la famille 2 ajoute un bloc « Reprendre / Recommencer » réservé aux modules qui reçoivent un CV, une lettre ou une préparation.
- **Moteur du pourcentage** : `calculerScoreMetier` (`data/metiers.js:2296`), utilisé aussi par d'autres écrans (`js/app.js:10582`, `11550`, `11626`, `modules/decouverte-competences/decouverteStrategie.js`, `data/moteurPertinenceRechercheERIP.js`).

## 3. Ce qui est simple, risqué ou bloquant

**Simple (reprise de l'existant)**
- Les 300 énoncés et les 90 lignes : recopie des documents validés dans des fichiers de données, avec un test de structure.
- La règle de calcul : une fonction pure, avec ses neuf tests déjà écrits sur papier.
- La recherche par nom, par sigle, par secteur, la fiche d'un métier, le niveau d'accès : fonctions existantes (`rechercherDansRepertoireElargi`, `variantesRechercheMetier`, `secteursDisponibles`).
- Le patron de page de présentation, la tuile, la recherche de l'accueil, la disquette : même chemin que « Un CV, plusieurs métiers ».

**Risqué**
- **Changer le plein à 16 et réduire les fiches courtes** dans `calculerScoreMetier` : ce moteur sert à d'autres écrans. Règle de prudence : ajouter des paramètres réservés à l'entrée 2 sans toucher au comportement des autres écrans, avec un grep sur tout le dépôt avant et un test des 23 profils après. Un changement mal isolé a déjà cassé une quinzaine d'écrans (leçon du 20/09/2026).
- **Le grand fichier `js/app.js`** : tout le code du module va dans `modules/comprendre-les-metiers/`, jamais dans `js/app.js` hors des quelques lignes de branchement.
- **Les pages ne sont pas chargées par les tests Node** : essai navigateur obligatoire à chaque étape.

**À auditer avant de planifier en détail (je ne l'ai pas encore ouvert)**
- **Le contenu « BMO » du pont « Comprendre pourquoi ils recrutent »** : quelles données existent dans le module « Comprendre les chiffres » et peuvent être réutilisées. Tant que ce n'est pas audité, cette partie n'est pas chiffrée.

**Bloquant : rien de technique.** Plusieurs décisions de Denis sont à prendre avant le code (section 4).

## 4. Décisions de Denis avant de coder : D1 à D5 VALIDÉES le 17/11/2026 (recommandations suivies)

**Précision sur D3** : la relecture de la maquette V2 en entier est faite par Denis ; elle doit être finie avant la phase 3 (pages). Les phases 0 (partie Claude), 1 et 2 n'en dépendent pas.

| N° | Décision | Recommandation | Bénéfice | Risque |
|---|---|---|---|---|
| D1 | Famille du module pour « Revoir la présentation » | **Famille 1** (bouton et note seulement, pas de bloc « Reprendre ») | Le questionnaire est tout ou rien, sans sauvegarde de l'avancement : un bloc « Reprendre » ne pourrait rien reprendre | Aucun |
| D2 | Comment ouvrir le module « en interne » | **Ouverture seulement sur `localhost`** (le module se voit dans VS Code, il reste caché sur Internet même si le dépôt est poussé) | Zéro risque de publication par erreur ; une ligne de code à retirer le jour de la mise en ligne | Un petit code à enlever plus tard |
| D3 | Relecture de la maquette V2 en entier, y compris les explications des six lettres | **Avant tout code des pages** | Évite des corrections en cascade (règle du projet) | Retarde le début des pages de quelques jours |
| D4 | Catalogue de sigles (AS, ASH, AES...) et explications des sous-catégories de choix | Je les écris, vous relisez (tâches déjà notées) | Recherche par sigle utile à un public qui ne connaît que les sigles | Relecture à prévoir |
| D5 | Texte de la ligne « Nouveautés » | **À écrire le jour de la mise en ligne**, pas avant | Jamais d'annonce d'un module encore fermé au public (règle du projet) | Aucun |

## 5. Le plan, phase par phase

Chaque phase se termine par `npm test` vert, un essai navigateur (clair, sombre, téléphone) et un commit nommé. Un commit par sous-étape.

### Phase 0 : décisions et relectures `[effort : bas]`
Denis : D1 à D5, relecture de la maquette V2 (écrans, explications des six lettres). Claude : catalogue de sigles, explications des sous-catégories, mise à jour de la maquette V2 (bouton « Grouper par niveau d'accès » et phrase des choix nombreux), vérification de la phrase de confidentialité dans le code.

### Phase 1 : données `[effort : bas]` : FAITE le 17/11/2026
Fichiers : `data/questionnaireRiasec.js` (300 énoncés + profils des 90 lignes), `data/comprendreMetiersTextes.js` (six lettres, 14 sigles, 15 explications), `tests/questionnaireRiasecDonnees.test.js` (13 contrôles). Pas encore chargés par `index.html` (branchement en phase 4). Relevé : les sommes réelles des parts par lettre sont R 27,2 ; C 23,3 ; E 13,3 ; S 10,4 ; I 10,3 ; A 5,5 (la règle disait « environ 27,1 ; 23,4 ; 13,3 ; 10,5 ; 10,2 ; 5,5 » : écart d'au plus 0,15 dû au rangement des métiers de l'hôpital fait après coup). La logique calculera les maximums à partir des données, jamais depuis ces valeurs.
- `data/` : énoncés des parties 1, 3 et 4, 90 lignes de la partie 2 avec leurs profils de lettres, six textes de lettres, sigles, explications.
- Tests de structure : 90, 90, 60, 60 énoncés ; 15, 10, 10 par lettre ; somme des parts par lettre (27,1 / 23,4 / 13,3 / 10,5 / 10,2 / 5,5) ; aucun tiret long, aucun mot « IA », aucun anglicisme.

### Phase 2 : logique pure et tests `[effort : moyen]` : FAITE le 17/11/2026
Fichiers : `modules/comprendre-les-metiers/logique.js` (calcul du questionnaire, textes qui adoucissent, ordre mélangé, résultat gardé, métiers qui partagent les lettres, groupes de niveau d'accès, profil de l'entrée 2), `data/lettresRiasecRome.js` (lettres RIASEC des 1 923 métiers, 30 Ko, extraites des fiches de 9 Mo par `scripts/importRome/extraireLettresRiasec.js`, gardées à jour par `tests/lettresRiasecRome.test.js`), `tests/comprendreLesMetiersLogique.test.js` (23 contrôles dont les neuf tests de la règle). `data/metiers.js` : un seul ajout, le réglage facultatif `reglages.pleinMax` (aucun autre appel ne le passe, contrôlé par test). Le plein à 16 est retenu ; la réduction des fiches courtes est essayée puis abandonnée (mesure dans `docs/CALIBRATION_POURCENTAGE_ENTREE_2_2026-11-16.md`). Quatrième groupe « Niveau d'accès non précisé » ajouté (670 fiches sur 1 925 sans niveau dans le ROME). La logique n'est pas encore chargée par `index.html` (phase 4).
Audit de `calculerScoreMetier` avant modification : appelé par `rechercherMetiers` (seul point d'entrée), `js/app.js` (10582, 11550, 11626), `decouverteStrategie.js`, `moteurPertinenceRechercheERIP.js`. Aucun n'est modifié : ils n'envoient pas `reglages`.
- Calcul du questionnaire (règle validée) : les neuf tests, dont le cas de la lettre A, la symétrie et le résultat au hasard.
- Appariement lettres et métiers (lettres `ri` du ROME, niveau d'accès), jamais « adapté » ou « meilleur ».
- Entrée 2 : plein à 16 et réduction douce des fiches courtes **en paramètres de l'entrée 2 seulement**, mesurés sur les 23 profils avant de fixer la réduction.
- Mélange de l'ordre des 90 lignes.
- Grep de tout le dépôt sur `calculerScoreMetier` avant la première modification.

### Phase 3 : les pages `[effort : haut]`
Dans l'ordre (le questionnaire d'abord, parce qu'il est entièrement spécifié) :
1. **Page de présentation** (route `comprendre-les-metiers-intro`) : titre, ce que fait le module, les trois portes, « Le RIASEC, c'est quoi ? », durée, ce qui est gardé et ce qui ne l'est pas. Même quantité d'information que les autres présentations.
2. **Accueil du module** (les trois entrées).
3. **Entrée 3, le questionnaire** : accueil, quatre parties (ordre mélangé pour la partie 2), fins de partie sans résultat, partie 4 passable, avertissement de départ, résultat (barres avec pourcentage, hexagone SVG, trois lettres expliquées, axes en une phrase, textes d'adoucissement, cas « peu de réponses » et « préférences réparties »).
4. **Entrée 2** : quatre pages de choix (16 / 16 / 12, compteur, « Tout désélectionner »), page « Ce qui serait difficile pour vous » (affichage seulement), métiers proposés (pourcentage, « x de vos N choix retrouvés », niveau d'accès sur chaque carte, bouton « Grouper par niveau d'accès », phrase au-delà de 20 choix).
5. **Entrée 1** : recherche (nom, autres noms, sigles, mot), secteurs, fiche d'un métier avec ses trois boutons sur une ligne.

### Phase 4 : branchements `[effort : moyen]`
- **Tuile** dans « Vous hésitez encore ? » (`data/metiers.js`), texte de la carte (`js/app.js:5369`), visite guidée.
- **Ponts** : gestionnaire de clic pour `data-mc-act="module"`, les trois boutons et la phrase de `js/app.js:11331` ; destinations : `metiers` (entrée 1 filtrée par compétence), `saisonniers` (liste des métiers saisonniers), `bmo` (voir phase 5).
- **Recherche de l'accueil et Lexique** : mots du module (lettres, RIASEC, sigles, titres des entrées).
- **Disquette** : « Garder mon résultat » (questionnaire et entrée 2), structure extensible pour d'autres tests, test de sauvegarde et de reprise.
- **Mode sombre** : les six couleurs de lettres dans `css/style.css`, avec leur valeur `[data-theme="sombre"]`.
- **Aides contextuelles**, suivi d'usage (même méthode que les autres modules), connaissances de l'assistant, texte de la carte d'accueil.
- **Interrupteur** : ouverture sur `localhost` seulement (D2), test mis à jour (`tests/listeMetiersCartes.test.js`).

### Phase 5 : statistiques « Comprendre pourquoi ils recrutent » `[effort : moyen]`
Audit des données du module « Comprendre les chiffres » d'abord, puis page ou bloc, puis ponts. Chiffrage après audit.

### Phase 6 : bouton « Revoir la présentation » `[effort : bas]`
Même bouton, même place, même note que les autres modules (famille 1) ; « Retour » ne saute jamais la présentation ; triple retour (bouton, bouton du bas, « Retour »).

### Phase 7 : vérifications d'ensemble `[effort : moyen]`
`npm test`, `node scripts/checkLexique.js` (0 erreur, 0 avertissement), parcours de bout en bout dans le navigateur à 1280 et à 375 px, en clair et en sombre ; un essai du questionnaire entier (durée chronométrée) ; essai de la disquette ; essai d'un résultat très artistique (lettre rare) ; un parcours de contrôle ajouté au dispositif existant (`scripts/parcours/`).

### Phase 8 : vidéo de présentation `[effort : moyen]`
Scénario `docs/video_presentation/court/scenarios/module-comprendre-metiers.js` (texte à valider par Denis avant tournage), voix et images générées automatiquement, vérification des images, fichier `videos/modules/metiers.mp4` plus vignette, entrée dans `VIDEOS_PRESENTATION`, ligne dans `docs/INVENTAIRE_VIDEOS`. Les écrans qui ne seront plus à jour devront être filmés à nouveau si l'interface change après.

### Phase 9 : clôture `[effort : bas]`
Mise à jour de `docs/BRIQUES_COMMUNES.md` (nouveaux composants et leurs utilisateurs), `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (leçons du chantier), `docs/JOURNAL_DES_CHANGEMENTS.md`, `docs/ETAT_DES_CHANTIERS.md`, passation. **La ligne `data/nouveautes.js` n'est écrite que le jour de la mise en ligne** (D5).

## 6. Définition de « module clos »

Le module est déclaré clos quand **toutes** ces cases sont cochées :
- [ ] Les trois entrées fonctionnent de bout en bout dans le navigateur, en clair, en sombre, à 1280 et à 375 px.
- [ ] `npm test` entièrement vert, y compris les tests du calcul et de la structure des données.
- [ ] `node scripts/checkLexique.js` : 0 erreur, 0 avertissement.
- [ ] Les ponts sont actifs et mènent au bon endroit (les trois boutons de `js/app.js`).
- [ ] Recherche de l'accueil et Lexique branchées.
- [ ] Disquette : le résultat se garde et se retrouve.
- [ ] Page de présentation et bouton « Revoir la présentation » identiques aux autres modules.
- [ ] Vidéo de présentation validée par Denis, branchée et inscrite à l'inventaire.
- [ ] Tuile visible dans la carte « Vous hésitez encore ? » **en local seulement** (D2).
- [ ] Essais réels de Denis faits (durée du questionnaire, résultat, entrée 2, entrée 1) et corrections regroupées par bloc faites.
- [ ] Documents de clôture à jour (briques, leçons, journal, état des chantiers).

## 7. Hors module (à ne pas mélanger)

L'espace « Mieux me connaître » (questionnaire de fonctionnement inspiré du Big Five, bloc « Où puisez-vous votre énergie ? ») puis la « Synthèse de tous les résultats » viennent après la clôture de ce module, dans cet ordre : modules et disquette, maquette, prompt en dernier.

## 8. Mode et effort recommandés

**Mode B, effort `medium`** pour les phases 1, 2, 4, 6, 7, 9 (le quoi et le pourquoi sont tranchés). **Mode A, effort `high`** pour la phase 3 (pages) et la validation du scénario de la phase 8, parce que l'expérience du public cible y est engagée. Une séance par niveau, comme le demande le protocole.
