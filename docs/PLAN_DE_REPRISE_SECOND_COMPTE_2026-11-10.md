# Plan de reprise pour le second compte (10/11/2026)

> Rédigé le 10/11/2026 à la demande de Denis (consigne 231), pour préserver le crédit du premier compte. Ce document se suffit à lui-même : il dit ce qui est fait, ce qui reste, comment reprendre, et répond aux questions posées. Rien n'est à deviner : tout ce qui est écrit ici a été lu dans le dépôt ou relevé à la source ce jour.

## 0. Message à coller dans l'autre conversation

```
/app reprise du plan du 10/11/2026 : lis docs/PLAN_DE_REPRISE_SECOND_COMPTE_2026-11-10.md en entier, puis git log -5 et git status
avant de toucher quoi que ce soit. Commence par le chantier que je te désigne (A, B ou C du plan). Une consigne notée
avant d'être traitée (docs/CONSIGNES_DE_DENIS_A_SUIVRE.md), maquette avant code dès qu'il y a un doute d'interface,
jamais git add -A, jamais de push sans ma demande.
```

**Règles qui ne changent pas** (détail dans `CLAUDE.md` et `docs/TRAVAILLER_AVEC_DENIS.md`) : français impeccable avec accents, jamais de tiret cadratin ni demi-cadratin, jamais le mot « IA » dans l'application, mode sombre pour toute couleur (variables CSS), une seule source de vérité (grep sur tout le dépôt avant de toucher une fonction partagée), `npm test` vert avant tout commit, un commit par sous-étape, jamais de `git add -A`, jamais de `push` sans demande de Denis, jamais deux comptes en même temps (relire `git log` et `git status` à la reprise).

**État du dépôt à la rédaction de ce plan** : branche `master`, dernier commit de travail `e3e05f51` (chômage du 3e trimestre) puis `287936af` (note de registre) puis le commit de ce plan. GitHub (`ursdac-jpg/APP`, branche `main`) est à jour jusqu'à `031611b3` (envoi du 10/11/2026, consigne 230) ; ce plan et la note de registre y sont donc en avance de deux commits locaux. Procédure d'envoi : mémoire « Mise sur GitHub : deux voies » (un enregistrement unique au-dessus de `origin/main`, jamais de force, jamais de jeton dans le projet).

---

> **Mise à jour du 12/11/2026** : les statuts des tâches A.4 à A.9 ont été recoupés avec git et le code ; le plan à jour de ce qui reste, avec les risques de régression, est dans `docs/PLAN_RESTE_A_FAIRE_VERIFIE_2026-11-12.md`. Ce document-ci reste l'historique du 10/11/2026.

## 1. Ce qui est FAIT aujourd'hui (10/11/2026), à ne pas refaire

### 1.1 Chômage du 3e trimestre 2026 (consignes 227, 228, 229) : commits `b14efa4e` et `e3e05f51`
- **Taux de chômage national du 3e trimestre 2026** : 8,2 % (Insee, Informations rapides n° 270, publié le 10/11/2026) ; trimestre précédent 8,3 %, un an plus tôt 7,8 %. Dans `modules/comprendre-les-chiffres/contenu/2026-06.md` : ligne « France entière (hors Mayotte) » du 3e trimestre, série, repère.
- **Demandeurs d'emploi inscrits (Dares, France Travail) du 3e trimestre 2026**, pour la Dordogne, la Haute-Vienne, la Nouvelle-Aquitaine et la France, catégorie A et A, B, C, plus la part des inscrits depuis un an ou plus :

| Territoire | Catégorie A | Évol. sur un an | A, B, C | Depuis un an ou plus |
|---|---|---|---|---|
| Dordogne | 17 040 | +0,2 % | 32 220 | 48,1 % |
| Haute-Vienne | 14 720 | +1,5 % | 27 340 | 46,4 % |
| Nouvelle-Aquitaine | 263 360 | +3,7 % | 507 460 | 46,5 % |
| France | 3 353 400 | +2,1 % | 5 847 500 | 46,8 % |

- **Commentaires réécrits** (synthèse courte, lecture du territoire, repères) pour la Dordogne, la Haute-Vienne, la Nouvelle-Aquitaine et la France entière. Les commentaires relus sans changement : ceux qui comparent le 2e trimestre au 2e trimestre.
- **Code** (`modules/comprendre-les-chiffres/index.js`) : encadré « Le plus récent, pour la France entière » sur la carte du chômage (`_comprendreLesChiffresBlocNationalRecent`) ; au niveau « France entière », la carte lit le trimestre le plus récent (`choisirTerr`, paramètre `plusRecent`) ; phrase sous la comparaison des niveaux (`_comprendreLesChiffresNoteNiveaux`) qui dit que les trois taux sont du 2e trimestre. Vérifié dans le navigateur aux trois niveaux, clair et sombre.
- **Garde-fous mis à jour** : `outils/appuis/2026-06.appuis.txt` (valeurs de la longue durée), `tests/veilleGardeTextes.test.js` (valeur 46,8 codée en dur). Ligne Nouveautés (`data/nouveautes.js`), journal, registre, état des chantiers.
- **Ce qui reste volontairement au 2e trimestre, faute de publication** : taux de chômage localisés (région, départements : publication Insee attendue en décembre 2026), offres d'emploi (Data Emploi), emploi salarié.

### 1.2 Nouveautés en trois entrées (consigne 201, retours 7 à 15) : commits `361b90c4`, `7303a64d`, `073ad3f7`, `1986e7b9`, `b17b3620`
Page d'arrivée avec l'explication des trois parties (application en bleu, « Droits et règles » en jaune, « Problèmes corrigés » en vert), boutons teintés qui pulsent à tour de rôle jusqu'au premier clic, remerciement seulement dans « Problèmes corrigés », mention « Signalé par un utilisateur » seulement quand c'est le cas, pastille = somme des trois, recherche de l'accueil branchée. Données : `data/nouveautes.js`, `data/problemesCorriges.js` (7 lignes, champ `origine`), « Droits et règles » lu dans « Comprendre le cadre » par la façade de `modules/comprendre-le-cadre/index.js`.

### 1.3 Parcours « À partir de mon récit » et signalements (consignes 191, 194, 197 à 199, 204 à 209, 211 à 226)
Corrigé et vérifié le 10/11/2026 (voir `docs/ETAT_DES_CHANTIERS.md`, « Suite » et « Deuxième suite du 10/11/2026 ») : blocage de l'étape « Vos informations », étape 12 sans doublon de « Continuer », complément de CV toujours proposé, écran « Étape 2 sur 2 : le complément » explicite, bouton « Ajouter le complément du CV » en bas du CV (jaunâtre, seulement si non collé), « Changer d'assistant » qui ramène au choix, « Continuer » dans la barre du bas, années jamais incohérentes, micro-mouvement de l'écran, titres d'expériences en grand avec défilement, texte sur toute la largeur de la rubrique, « Mots de cette page expliqués » en bas de page, « Quelques précisions » avec numéros et réponses suggérées en boutons ovales (toutes les questions toujours posées), « Vos appuis » en trois parties numérotées.

### 1.4 Autres faits du jour ou de la veille
Vidéo de la disquette branchée dans son panneau (193) ; tailles de texte 16, 17, 18 px et lignes limitées (187, codé le 09/11/2026) ; message « Envie de lire plus confortablement ? » sur petit écran ; envoi GitHub (230).

---

## 2. CHANTIER A : ce qui reste à traiter (hors vidéos et hors chiffres)

> Source de vérité : `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md`. **Attention** : quelques statuts du registre sont en retard sur le code (voir A.9) ; vérifier dans `docs/ETAT_DES_CHANTIERS.md` avant de re-coder quoi que ce soit.

| # | Tâche | Consigne | Effort | État |
|---|---|---|---|---|
| A.1 | **Pages de présentation des modules (`-intro`)** : revenir à la disposition d'avant (une colonne, celle des vidéos), garder seulement les nouvelles tailles de caractères. Retirer la grille `.intro-colonnes`, la fonction `equilibrerGrilleIntro` (`js/app.js`), les deux enveloppes dans `htmlPageIntroModuleParcours` (`data/metiers.js`) et `htmlPageIntroModule` (`js/app.js`) et le test `tailleTexteStandard` correspondant. Vérifier que les pages ressemblent aux images des vidéos. Le vide à droite d'une carte se regarde avec Denis : maquette d'abord. | 190 (décision du 10/11/2026) | moyen | FAIT le 10/11/2026 (grille retirée, une colonne, test remplacé) ; la colonne centrée à 1440 px est conservée |
| A.2 | **« Créer un nouveau CV »** : une seule page de présentation commune aux trois voies (à la main, avec l'assistant, à partir de mon récit), chacune avec sa propre vidéo ; un clic sur une voie mène directement dans le parcours ; « Revoir la présentation » dans une voie ouvre la page propre à la voie (pages existantes, par exemple `#decouverte-intro`). Les trois vidéos existent : `videos/modules/creer-main.mp4`, `creer-assistant.mp4`, `creer-recit.mp4`. | 192 (1)(2)(3) | haut | **FAIT le 10/11/2026 (page commune, départ direct, essais, vidéos creer-\* rejouées, Nouveautés).** Maquette faite le 10/11/2026 (`docs/MAQUETTE_CREER_UN_NOUVEAU_CV_PAGE_COMMUNE_2026-11-10.html`), 5 questions à trancher par Denis avant tout code |
| A.3 | **« Reprendre mon CV »** : créer la page propre de la voie 3 (« Le refaire moi-même dans un modèle ») avec sa vidéo (`videos/modules/reprendre-sans.mp4` existe, à vérifier) ; **les titres des pages propres doivent porter exactement le nom du module** (« Le garder et le compléter », « Le reformuler et le présenter », « Le refaire moi-même dans un modèle » ; aujourd'hui « Mettre à jour mon CV » et « Reformuler et présenter mon CV ») ; vérifier que chaque page propre est à jour. | 192 (4)(5)(6) | haut | **FAIT le 11/11/2026** (page propre de la voie 3 `#cv-sans-assistant-intro` avec `reprendre-sans`, titres alignés sur le nom du module partout, listes des voies 1 et 2 corrigées, vidéos `reprendre-sans` et `reprendre-reformuler` rejouées). Reste dans A.4 : pastilles et titres des écrans de travail |
| A.4 | **Cohérence des trois entrées de « Mes documents »** (Créer un nouveau CV, Reprendre mon CV, Lettre et entretien en version rapide) : un contenu propre à chaque module mais une présentation et une mise en forme communes. Ordre décidé : maquette de « Créer » (A.2), puis de « Reprendre » (A.3), puis regarder « Lettre et entretien en version rapide » et lui faire une maquette s'il est très différent. Pour la dette de composant : fenêtre d'import de CV partagée (dette B.1 de `BRIQUES_COMMUNES.md`). | 196, 203 | haut | **PRESQUE FAIT (vérifié le 12/11/2026)** : « Créer », « Reprendre » et « Lettre et entretien en version rapide » lisent le même constructeur de bloc (`_htmlVoiePresentation`, `data/metiers.js`, brique B.68). Reste à regarder les pastilles et les titres des écrans de travail de « Créer » : voir `docs/PLAN_RESTE_A_FAIRE_VERIFIE_2026-11-12.md` |
| A.5 | **Vérifier les autres modules** : pas affectés par les corrections du récit, ni par le même dysfonctionnement (parcours smoke : `scripts/parcours/parcours_smoke.js`). | 203 (2) | moyen | **FAIT** le 10/11/2026 (consigne 206) et rejoué le 12/11/2026 : test de fumée sans échec, huit scénarios de reprise à deux largeurs sans écart |
| A.6 | **Points à confirmer avec Denis** : (a) consigne 200, reprise du parcours récit, « une autre page avec Coller s'affiche au-dessus du CV » : non reproduite, chemin exact à lui demander ; (b) consigne 202, « énormément de fenêtres » vues dans les essais : quel écran exactement ; (c) consigne 194, l'écran qui bouge : corrigé sous réserve, confirmation attendue. | 194, 200, 202 | bas | **À CONFIRMER (c : consigne 202 est CLOSE, rien à changer)** : restent (a) consigne 200 et (b) consigne 194 |
| A.7 | **Smic du 1er décembre 2026** : quand le décret sera publié (hausse annoncée de 1,6 %, Smic net annoncé 1 502 euros), mettre à jour le bloc « Le Smic et l'inflation » (`modules/comprendre-les-chiffres/donnees/smic-inflation.json`, `contenu/smic-dares.md`), puis grep sur les fiches, mots du Lexique et chiffres qui citent le Smic ou le pouvoir d'achat. Ne rien changer avant le texte officiel. | 188 | moyen | À FAIRE AU MOMENT DU DÉCRET |
| A.8 | **À faire par Denis lui-même** : essayer le récit de bout en bout avec un vrai assistant (les suggestions arrivent-elles et restent-elles fidèles au récit ?) ; relire les sept lignes de `data/problemesCorriges.js` (champ `origine` : « personne » ou « nous ») ; relire les textes des Nouveautés ; regarder la vidéo de la disquette. | 201, 217, 193 | Denis | EN ATTENTE |
| A.9 | **Marquer les consignes dont le statut est en retard sur le code** (après vérification) : 195 (« Tout » + un bouton par expérience : fait dans la « Suite » de l'état des chantiers), 210 (suggestions en boutons : faites sous 217), 204 à 206 et 212 à 214 (« EN COURS » alors que l'état des chantiers les dit faits). Règle : une consigne marquée traitée seulement après vérification dans le code. | 195, 204 à 206, 210, 212 à 214 | bas | **FAIT le 12/11/2026** (statuts des consignes 192, 195, 196, 199, 203 à 206, 210, 212 à 214, 246 et 249 corrigés dans le registre) |

---

## 3. CHANTIER B : pages de présentation et vidéos de présentation des modules

### 3.1 Où on en est (important, il y a eu un revirement)
1. Le 09/11/2026 (consigne 187), Denis a choisi une grille 2 sur 2 pour les pages `-intro` (commit `bb85b6d8`). Le 10/11/2026 à 00h27, le commit `f9697f25` a noté « refaire les vidéos de présentation après stabilisation de l'affichage ».
2. Le 10/11/2026 (consigne 190), Denis a **décidé de revenir à la disposition d'avant** (une colonne, celle des vidéos). Conséquence actée : **les vidéos ne sont PAS à refaire** ; la tâche du commit `f9697f25` est annulée.
3. **Mais** deux choses restent à traiter pour que vidéos et pages concordent : (a) la page « Créer un nouveau CV » devient commune aux trois voies avec une vidéo par voie (A.2) ; (b) « Reprendre mon CV » voie 3 n'a pas de page propre (A.3). Et chaque fois qu'un écran change, **on rejoue le scénario** au lieu de refaire la vidéo à la main.

### 3.2 Ce qui existe
- `video/presentation.mp4` : introduction de l'application (3 min 17, voix Tom, sous-titres), à jour. Page `introduction` + diaporama de 21 diapositives (`docs/MAQUETTE_DIAPORAMA_INTRODUCTION_2026-11-02.html`).
- `videos/modules/*.mp4` (24 vidéos, environ 1 minute chacune, une par entrée, jamais partagée entre deux modules) : `ats`, `bilan`, `cadre`, `carnet`, `chiffres`, `coherence`, `competences`, `creer-assistant`, `creer-main`, `creer-recit`, `employeurs`, `entretien`, `lettre`, `lexique`, `pistes`, `pret-entretien`, `pret-lettre`, `quifaitquoi`, `regard`, `reperes`, `reprendre-garder`, `reprendre-reformuler`, `reprendre-sans`, `ucpm` (+ dossier `vignettes`).
- `videos/gestes/` (gestes courts de 20 à 30 s), `videos/pilotes/` (carnet, disquette, masquer-image).
- Plan et règles : `docs/PLAN_VIDEOS_2026-11-08.md` (partie vidéo CLÔTURÉE par Denis le 08/11/2026 ; D3 et D4, assistants avec compte, non faits), inventaire `docs/INVENTAIRE_VIDEOS_2026-11-07.md`, scénario de l'introduction `docs/SCENARIO_VIDEO_PRESENTATION_2026-11-02.md`.
- **Chaîne de fabrication** : un scénario par vidéo dans `docs/video_presentation/court/scenarios/` (navigateur piloté, curseur dessiné, vrais clics, données fictives de « Camille Martin »), voix synthétique `fr_FR-tom-medium`, sous-titres `.vtt`, image réelle de l'application en haut, bande noire en dessous avec sous-titres blancs, outil `docs/video_presentation/court/fabriquer_images.js` pour les images fixes. Quand l'interface change : rejouer le scénario concerné.
- Règles de ton (consigne 172) : jamais de mot sur la difficulté, le niveau informatique ou l'autonomie ; jamais le mot « IA » (« l'assistant en ligne ») ; pas de félicitations ; passage délicat 30 s au plus ; présentation de module environ 1 minute, dans la page `-intro`, jamais dans le module.

### 3.3 À faire, dans l'ordre
| # | Tâche | Effort | Remarque |
|---|---|---|---|
| B.1 | **FAIT le 10/11/2026 : A.1 faite ; comparaison dans `docs/COMPARAISON_PAGES_INTRO_ET_VIDEOS_2026-11-10.md` (à refaire : `chiffres`, `creer-recit` ; écart commun : bouton « Mots de cette page » déplacé en bas).** Faire A.1 (retour à la page une colonne) et **comparer chaque page `-intro` à sa vidéo** (captures de la page, puis image de la vidéo) : liste des écarts, module par module. | moyen | Les routes `-intro` sont listées dans `docs/INVENTAIRE_VIDEOS_2026-11-07.md` (tableau P1 à P11 et suivants) et `docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md` ; audit antérieur : `docs/AUDIT_PAGES_INTRO_2026-09-10.md`. |
| B.2 | **FAIT le 10/11/2026 pour `chiffres` et `creer-recit` (vidéos refaites et remplacées ; les autres n'ont pas d'écran modifié).** Pour chaque écart réel entre une vidéo et la page actuelle : rejouer le scénario correspondant (jamais remonter la vidéo à la main). Ne refaire QUE les vidéos qui montrent un écran modifié. | moyen | Les écrans du parcours récit ont changé aujourd'hui (étape 12, complément, compétences, questions numérotées avec boutons ovales, « Vos appuis ») : **`creer-recit.mp4` est la première à vérifier.** |
| B.3 | A.2 : page commune de « Créer un nouveau CV » avec une vidéo par voie (les trois existent). A.3 : page propre de la voie 3 de « Reprendre mon CV » avec `reprendre-sans.mp4` si elle correspond. | haut | Maquette d'abord, validée par Denis. |
| B.4 | Titres des pages propres = nom exact du module (A.3). | bas | |
| B.5 | Tenir à jour la liste « quelle vidéo montre quel écran » (`docs/BRIQUES_COMMUNES.md`, prévue par le plan vidéo quand le composant est branché). | bas | |
| B.6 | « Voir la présentation en vidéo » : bouton qui déplie la vidéo dans la page `-intro` (Nouveautés du 08/11/2026) ; vérifier qu'il reste en place après le retour à la disposition d'avant. | bas | |

**Rappel de coût** : les vidéos « application seule » sont 100 % automatiques et peu coûteuses à rejouer ; celles qui montrent le site d'un assistant (ChatGPT, Perplexity) dépendent des sites, jamais de compte ni de test anti-robot, jamais de fausse copie d'écran.

---

## 4. CHANTIER C : les chiffres, la comparaison et la « réalité du terrain » dans « Comprendre les chiffres »

### 4.1 Ce que le module contient et de quand datent ses données

| Fichier (`modules/comprendre-les-chiffres/contenu/`) | Contenu | Période actuelle | État |
|---|---|---|---|
| `2026-06.md` | Chiffres clés : chômage, où se situer, demandeurs, longue durée, emploi salarié, offres, embauches ; synthèse courte et lecture du territoire (Dordogne, Haute-Vienne, Nouvelle-Aquitaine, France) | Chômage France : **3e trimestre 2026** ; chômage dép. et région : 2e trimestre ; demandeurs et longue durée : **3e trimestre** ; emploi salarié, offres : 2e trimestre ; embauches : 3e trimestre 2025 | Mis à jour aujourd'hui |
| `departements-region.md` | Les départements de la Nouvelle-Aquitaine : taux de chômage, part des 65 ans et plus, sans diplôme, diplôme supérieur, texte par département | **1er trimestre 2026** | **EN RETARD** : à passer au 2e trimestre 2026 (C.1) |
| `regions-france.md` | Les régions de France : même principe | **1er trimestre 2026** | **EN RETARD** (C.1) |
| `zones-emploi.md` | Zones d'emploi (Insee) | 2e trimestre 2026 | À jour au 3 novembre |
| `medecins-*`, `generalistes-insee`, `specialistes-*`, `dentistes-*`, `pharmaciens-*` | Santé : départements de la région et régions de France | 2025 | Annuel, rien à faire |
| `salaires-insee`, `niveau-de-vie-insee`, `pouvoir-achat-insee`, `temps-partiel-insee`, `age-insee`, `formation-insee`, `secteurs-insee`, `entreprises-departements` | Portrait et salaires | Vérifiés les 6 novembre et 20 octobre 2026 | Annuels |
| `europe-eurostat.md`, `europe-economie-eurostat.md`, `ue-2026.md` | Union européenne | Vérifiés le 3 et le 6 novembre 2026 | À jour |
| `smic-dares.md` + `donnees/smic-inflation.json` | Smic et inflation (source unique) | Inflation d'octobre 2026 (provisoire, Insee, 30/10/2026) | Voir C.4 |
| `demandeurs-dares.md` | Texte sur les demandeurs (6 novembre) | à relire après la mise à jour du 3e trimestre | Voir C.2 |
| `portrait-2026.md`, `portrait-chiffres.md` | Portrait du territoire | 2026 ; prochaine mise à jour été 2027 | Annuel |

### 4.2 À faire

| # | Tâche | Effort | Détail |
|---|---|---|---|
| C.1 | **[FAIT le 10/11/2026 : taux relevés deux fois ; les blocs désignent eux-mêmes les extrêmes (12 départements, 13 régions) ; voir ETAT_DES_CHANTIERS]** Passer `departements-region.md` et `regions-france.md` du 1er au 2e trimestre 2026** (taux de chômage par département de la Nouvelle-Aquitaine, par région) et RELIRE leurs textes, qui font des classements (« le taux le plus bas de Nouvelle-Aquitaine ») : un classement peut avoir changé. | haut | Source : fichier Insee « Taux de chômage localisé par région et département » (publication du 18/09/2026), page https://www.insee.fr/fr/statistiques/2012804, déjà lu le 05/10/2026 pour le digest. Les autres chiffres de ces fichiers (65 ans et plus, sans diplôme, diplômés) viennent du dossier complet Insee et ne bougent pas. Garde-fous à suivre : `node --test "tests/*.test.js"`, `outils/veilleGardeTextes.js`, `outils/veilleAppuis.js`. |
| C.2 | **[FAIT le 10/11/2026 : fichiers départements et régions réécrits sans classement ni comparaison entre territoires nommés (test), digest relu, demandeurs-dares sans phrase de comparaison]** Relire tous les commentaires comparatifs** (synthèse courte, lecture du territoire, repères, « Où se situer », écarts entre départements et régions) pour qu'ils décrivent la réalité actuelle : chaque phrase qui compare doit comparer des chiffres de la MÊME période, et l'écrire. Règle de Denis (2026-09-12) : jamais un texte qui compare un département nommé à un autre département nommé ; seules comparaisons autorisées : la moyenne nationale ou les trimestres et années précédents du MÊME territoire. | haut | Relire aussi `demandeurs-dares.md` après la mise à jour du 3e trimestre. |
| C.3 | **[FAIT le 10/11/2026 : ligne « il y a un an » calculée dans le code à partir de `serie`, cartes demandeurs et longue durée, test `comprendreLesChiffresAnDepuisSerie`]** **Même période l'an dernier, affichée clairement sur les cartes qui ne l'ont pas** (voir 5.1) : demandeurs d'emploi et longue durée n'affichent pas de ligne « il y a un an » alors que la série du digest la contient. | moyen | Calcul à partir de `serie` (quatre trimestres plus tôt). |
| C.4 | **[FAIT le 10/11/2026 : maquette validée puis codée, voir ETAT_DES_CHANTIERS]** **Inflation : flèches colorées, même période l'an dernier, suivi sur 12 mois puis 5 ou 10 ans** (voir 5.2). | haut | Maquette d'abord (règle du projet). |
| C.5 | **Décembre 2026 : taux de chômage localisés du 3e trimestre** (Insee). Alors : passer les lignes Dordogne, Haute-Vienne, Nouvelle-Aquitaine, France métropolitaine au 3e trimestre, retirer la phrase « Ces trois chiffres sont ceux du 2e trimestre » (`_comprendreLesChiffresNoteNiveaux`), relire les textes. Comparer chaque département à son 3e trimestre 2025 : Dordogne 7,4 %, Haute-Vienne 7,2 %, Nouvelle-Aquitaine 7,0 %, France métropolitaine 7,5 % (valeurs déjà dans les séries du digest). | moyen | Le plan de mise à jour est écrit dans l'en-tête de `2026-06.md` (« Mise à jour du 2026-11-10 »). |
| C.6 | **Offres d'emploi (Data Emploi) et emploi salarié (Insee) du 3e trimestre** : à relever dès qu'ils paraissent (dates exactes à vérifier sur les sites : je ne les ai pas confirmées). | moyen | https://dataemploi.francetravail.fr/emploi/panorama/DEP/24 (et `/DEP/87`, `/REG/75`, `/NAT/FR`) ; Insee : https://www.insee.fr/fr/statistiques/2134435 |
| C.7 | **Prochains passages de veille** : France Travail et Dares du 4e trimestre 2026 le 28/01/2027 (indiqué par la DREETS) ; inflation Insee définitive d'octobre le 13/11/2026 et prochaine publication le 27/11/2026 (indiquées dans `smic-inflation.json`). | bas | Passer par l'outil de veille (`outils/veille.html`). |

### 4.3 Comment relire les chiffres de la Dares SANS bloquer (méthode qui a marché le 10/11/2026)
- **La page de publication de la Dares est protégée par un contrôle anti-robot** (captcha). On ne le contourne jamais : c'est interdit et inutile.
- **L'interface de données de la Dares, elle, est lisible** (JSON, petites requêtes) dans Chrome (outil du navigateur de Denis) : jeu `dares_defm_stock_region_cvs_trim`, par exemple
  `https://data.dares.travail-emploi.gouv.fr/api/explore/v2.1/catalog/datasets/dares_defm_stock_region_cvs_trim/records?select=region,departement,categorie,date,anciennete,nombre_de_demandeurs_d_emploi&where=date in ("2026-T3","2026-T2","2025-T3") and sexe="Total" and tranche_d_age="Total" and categorie in ("A","ABC") and (region="France" or (region="Nouvelle-Aquitaine" and departement in ("Total","Dordogne","Haute-Vienne")))&order_by=region,departement,categorie,anciennete,date&limit=100`
  (champs : `date` au format `2026-T3`, `region`, `departement`, `categorie` A, B, C, ABC, ABCDE, `anciennete` « Total » ou « Un an ou plus », `sexe`, `tranche_d_age`, `nombre_de_demandeurs_d_emploi`). Limite de 100 lignes par requête. La ligne « France » = métropole + DROM hors Mayotte ; « France métropolitaine » = les 96 départements.
- Les PDF de la DREETS Nouvelle-Aquitaine donnent les mêmes valeurs (relevé du 08/11/2026 : `docs/DONNEES_DEMANDEURS_T3_2026_DREETS.md`). Les valeurs relevées ce jour concordent exactement avec elles.
- L'outil de lecture simple du navigateur de la session plafonne à 10 Mo : le fichier CSV complet (22 Mo) ne se lit pas ainsi, d'où les requêtes filtrées.
- **Piège des garde-fous** : quand un chiffre du digest change, mettre aussi à jour `outils/appuis/2026-06.appuis.txt` (lignes `valeur:` des textes) et `tests/veilleGardeTextes.test.js` (valeurs codées en dur), sinon `npm test` échoue ; c'est voulu (c'est ce qui empêche un texte de citer un ancien chiffre).
- **Piège des fins de ligne** : `js/app.js` et `data/baseConnaissancesERIP.js` sont en CRLF, les autres en LF ; éditer avec un script Python qui respecte les fins de ligne (exemples de scripts dans le scratchpad de la session, à reécrire), jamais un remplacement aveugle.

---

## 5. Réponses aux questions de Denis

### 5.1 « Puis-je voir l'année dernière à la même période, pour le chômage, les départements, la région, la France ? »
**Oui, pour la plus grande partie, et c'est déjà dans les données.**
- **Taux de chômage, 3e trimestre 2025** (même trimestre que le 3e trimestre 2026) : France entière **7,8 %** (déjà affiché : « il y a un an : 7,8 % » sur l'encadré du 3e trimestre 2026) ; France métropolitaine 7,5 % ; Nouvelle-Aquitaine 7,0 % ; Dordogne 7,4 % ; Haute-Vienne 7,2 %. Les départements et la région passeront au 3e trimestre 2026 en décembre : la comparaison avec ces valeurs de 2025 sera alors automatique (la carte affiche déjà « Il y a un an »).
- **Aujourd'hui, les cartes des départements et de la région comparent le 2e trimestre 2026 au 2e trimestre 2025** : Dordogne 7,9 % contre 7,1 % ; Haute-Vienne 7,6 % contre 7,0 % ; Nouvelle-Aquitaine 7,5 % contre 6,8 % ; France métropolitaine 8,1 % contre 7,3 %.
- **Demandeurs d'emploi, 3e trimestre 2025** : catégorie A Dordogne 17 000, Haute-Vienne 14 500, Nouvelle-Aquitaine 253 940, France 3 284 000 ; A, B, C : 31 870, 26 750, 490 890, 5 710 200 ; part des inscrits depuis un an ou plus : 44,7 %, 44,0 %, 43,9 %, 44,2 %. **Ces valeurs sont déjà dans les séries du digest, mais les cartes « demandeurs » et « longue durée » n'affichent pas de ligne « il y a un an » : c'est la tâche C.3** (simple, effort moyen).
- Autres cartes (emploi salarié, offres) : l'évolution sur un an est donnée par la source pour certaines, pas toutes ; à regarder carte par carte dans C.2.

### 5.2 « Pour l'inflation : flèches, rouge quand ça monte, vert quand ça baisse, même période l'an dernier, 12 mois puis 5 ou 10 ans : l'a-t-on ? »
**Ce que nous avons** (`modules/comprendre-les-chiffres/donnees/smic-inflation.json`, source unique, Insee, Informations rapides n° 266 du 30/10/2026, estimation provisoire d'octobre 2026) :

| Poste | Sur un an, octobre 2026 |
|---|---|
| Ensemble des prix | +3,4 % (septembre : +3,1 %) |
| Énergie | +24,1 % |
| Alimentation | +1,2 % |
| Services | +2,7 % |
| Produits manufacturés | -0,2 % |
| Tabac | +3,3 % |
| Sur un mois | +0,4 % en octobre (septembre : -0,3 %) |
| Prix harmonisés (comparaison européenne) | +3,8 % sur un an |

Résultats définitifs d'octobre prévus le 13/11/2026 ; prochaine publication le 27/11/2026.

**Ce que nous n'avons pas encore** : la valeur de la MÊME période l'an dernier (octobre 2025), la série des 12 derniers mois et les séries sur 5 et 10 ans, par poste. Ce sont des séries mensuelles publiées par l'Insee (indice des prix à la consommation) : elles existent à la source, mais je n'ai pas encore vérifié le chemin exact de lecture (tableaux des Informations rapides ou base de données macroéconomiques de l'Insee) : **c'est la première étape de C.4, à relever à la source, jamais de valeur devinée.** Si une série n'est pas lisible proprement, la carte ne s'affiche pas (jamais vide, jamais approximée).

**Conception proposée pour C.4 (à valider par maquette avec Denis)** :
1. **Flèches** : flèche vers le haut si le chiffre monte, vers le bas s'il baisse, immobile s'il ne bouge pas, pour chaque poste (énergie, alimentation, services, produits manufacturés, tabac), pour le mois d'avant et pour l'an dernier.
2. **Couleur selon le sens favorable** : pour l'inflation, hausse en rouge, baisse en vert. **Attention à ne pas généraliser** : pour l'emploi salarié ou le Smic, une hausse est plutôt une bonne nouvelle ; pour le chômage ou les demandeurs, une hausse est plutôt une mauvaise nouvelle. Il faut donc un réglage par carte (« la hausse est défavorable » ou « favorable ») et jamais « rouge = haut » partout. Les flèches du chômage existent déjà (« ↗ en légère hausse ») : garder une seule logique.
3. **Accessibilité** : la couleur ne suffit pas (personnes qui distinguent mal le rouge et le vert) : la forme de la flèche et un mot (« en hausse », « en baisse ») doivent toujours l'accompagner ; couleurs en variables CSS avec valeur en mode sombre.
4. **Même période l'an dernier** : une ligne « il y a un an » sous chaque poste, comme sur les cartes du chômage.
5. **Suivi dans le temps** : un bouton ou une rubrique « Sur les 12 derniers mois » puis « Sur 5 ans » et « Sur 10 ans ». Le composant de courbe pluriannuelle existe déjà pour le chômage (`_comprendreLesChiffresRenduCourbeAnnuelle`) et les vues « Chiffres / Barres » sont un composant commun (brique B.58) : les réutiliser, ne rien recopier.
6. **Données** : étendre `smic-inflation.json` (source unique, mise à jour par l'outil de veille) avec les séries mensuelles par poste, au lieu de créer un nouveau fichier.

---

## 6. Ordre recommandé et coût

| Ordre | Chantier | Pourquoi | Effort | Modèle conseillé pour économiser le crédit |
|---|---|---|---|---|
| 1 | **C.1 + C.2** : comparaisons des départements et des régions au 2e trimestre, relecture des commentaires | Incohérence visible aujourd'hui (comparaisons au 1er trimestre à côté de chiffres du 3e) | haut | Relevé et relecture : modèle économique possible ; textes : garder un modèle fort |
| 2 | **C.3** : « il y a un an » sur demandeurs et longue durée | Demandé par Denis, données déjà là | moyen | économique |
| 3 | **A.1 + B.1 + B.2** : une colonne, comparaison page et vidéo, rejouer ce qui diffère | Décision du 10/11/2026 | moyen | économique pour la comparaison, fort pour la maquette |
| 4 | **C.4** : inflation avec flèches, an dernier, 12 mois, 5 et 10 ans | Demandé aujourd'hui | haut | fort (maquette puis code) |
| 5 | **A.2 + A.3 + A.4 (+ B.3)** : introductions cohérentes de « Mes documents » | Chantier à récupérer impérativement (Denis) | haut | fort |
| 6 | **A.5 + A.6 + A.9** : autres modules, confirmations, statuts du registre | Hygiène | bas à moyen | économique |
| Au signal | **C.5** (décembre), **A.7** (décret Smic), **C.6**, **C.7** | Dépendent des publications | moyen | économique |

**Chaque tâche engagée porte une étiquette d'effort** (`[effort : bas]`, `[effort : moyen]`, `[effort : haut]`) et le mode recommandé (A en général : Claude exécute, Denis valide ; maquette d'abord dès qu'il y a un doute d'interface). Regrouper par niveau d'effort quand rien ne l'empêche.

## 7. Dates à surveiller
- **13/11/2026** : résultats définitifs de l'inflation d'octobre (Insee) ; **27/11/2026** : publication suivante.
- **1er décembre 2026** : hausse du Smic annoncée (décret non publié au 09/11/2026).
- **Décembre 2026** : taux de chômage localisés du 3e trimestre (Insee) ; en-tête de `2026-06.md`, `prochaine_maj: décembre 2026`.
- **28/01/2027** : France Travail et Dares, 4e trimestre 2026 (indiqué par la DREETS).
- **Été 2027** : portrait du territoire.
