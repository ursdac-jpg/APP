# PLAN PRIORITAIRE À LA REPRISE (Comprendre les chiffres, Lexique, boutons)

> **PLAN PÉRIMÉ, VÉRIFIÉ LE 08/11/2026 contre `git log` et le registre des consignes : tout ce qui dépendait de Claude est FAIT depuis le 07/11/2026.** A13 terminé (consigne 143, commit `7ca39e23`), nom « Ma fiche de chiffres » (146), A4b (146), boutons Appeler et Écrire, dépliants retirés et sélecteur de Mes Repères (146), outil de veille et ses sept fichiers du portrait (146), Lexique B1 et B2 (149), boutons C1 à C8 (147). Les sections 1, 2 et 4 ci-dessous sont gardées pour mémoire : ne pas les lire comme une liste de travail. Restent seulement : les essais de Denis (section 3), le relevé Eurostat de mai 2027, puis accessibilité et découpage de `js/app.js`, en dernier.


**Consigne de Denis (06/11/2026) : ce plan est LA PRIORITÉ. À la reprise du travail (quand Denis aura de nouveau du crédit d'usage), Claude le montre en premier et le fait finir avant tout autre chantier.** Tout le reste (autres chantiers de l'ordre du 28/10, accessibilité, découpage de `js/app.js`) vient après.

Établi le 06/11/2026 à partir de `docs/CHANTIER_CHIFFRES_LEXIQUE_BOUTONS_2026-11-06.md`, de `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` et des commits (dernier au moment de la rédaction : `0c6d28c8`). Ce plan ne remplace pas le cahier du chantier : il en est la photo lisible, détaillée et classée, pour reprendre sans rien relire d'autre. À la reprise, vérifier d'abord `git log` et `git status` (deux comptes Claude, jamais en même temps).

Légende : **[Denis]** = a besoin d'un essai, d'un choix ou d'une relecture de Denis. **[Claude]** = peut avancer sans lui. Effort : `[effort : bas / moyen / haut]`.

---

## 0. Où l'on en est, en trois lignes

- Tous les chiffres prévus sont intégrés et vérifiés (A1 à A8, A12) ; `npm test` vert (2447) ; dernier correctif de mise en page commité (`0d9426e2`).
- Il reste : une décision de fond (A13, voir section 1), quelques réponses de Denis, ses essais, puis les fiches du Lexique (B) et la fin des textes cliquables (C).
- Rien n'est à moitié codé : tout est commité, le dépôt est propre.

---

## 1. PRIORITÉ 1 : A13, quand les chiffres changent, l'interprétation doit changer (consigne 134)

**Statut : audit FAIT, mécanisme NON choisi. Denis garde les trois options ouvertes (06/11/2026) et les a vues sur un exemple. Rien n'est codé.** Garde-fou déjà en place : un test casse si l'année écrite dans un texte n'est plus celle de sa source.

### 1.1 Ce que l'audit a trouvé

| Nature du texte | Quantité | Se met à jour seul ? |
|---|---|---|
| Phrases calculées par le code (écarts, « sous la médiane », flèches) | la majorité des cartes | Oui |
| Phrases en dur dans le code avec une année, une période ou un montant | 42 phrases, 11 endroits de `modules/comprendre-les-chiffres/index.js` (« recensement 2023 », « 2019-2025 », « 11,88 € brut », « loi pour le plein emploi (2025) »...) | Non |
| Paragraphes écrits à la main dans les fichiers de contenu | `2026-06.md` 16 sur 17, portrait 4 sur 10, Union européenne 3 sur 6, méthode 3 sur 17 | Non, et l'outil de veille ne les voit pas |

### 1.2 Les trois options, sur l'exemple réel de la Dordogne (chiffres de l'exemple inventés, pour illustrer)

Texte pris dans la « Synthèse courte » de `2026-06.md` : « En Dordogne, le chômage est un peu en dessous de la moyenne française et un peu au-dessus de la Nouvelle-Aquitaine ; il a augmenté depuis un an. » Imaginons qu'au prochain relevé le chômage de la Dordogne passe de 7,4 % à 8,3 % et dépasse la moyenne française : la phrase devient fausse.

**Option 1 : un test de garde élargi.**
- Un test compare les années et les montants écrits dans les textes à ceux des fichiers de données.
- Vu par Denis : rien dans l'application ; le test refuse un commit (« le texte dit 2025, la source dit 2026 »).
- Sur l'exemple : ne voit PAS que « un peu en dessous de la moyenne » est devenu faux.
- Bénéfice : très peu de travail, aucun changement pour les personnes. Risque : laisse passer les phrases de sens, qui sont les plus importantes.
- `[effort : bas]`

**Option 2 : le code lit l'année et la période dans la fiche.**
- Au lieu d'écrire « en 2025 » dans le code, la carte prend l'année dans le fichier de données.
- Vu par Denis : « recensement 2022 » devient « recensement 2023 » tout seul quand le fichier change.
- Sur l'exemple : ne règle pas la phrase de la Dordogne (c'est un jugement, pas une année).
- Bénéfice : plus aucun oubli d'année dans les 42 phrases du code. Risque : reprise phrase par phrase, et elle ne couvre pas les textes écrits à la main.
- `[effort : moyen]`

**Option 3 : chaque texte écrit à la main déclare les chiffres dont il dépend.**
- Sous la phrase, une ligne note : « s'appuie sur : chômage Dordogne 7,4 %, chômage France 7,5 %, chômage un an avant 6,9 % ». À chaque relevé, l'outil de veille compare et signale : « ce paragraphe s'appuie sur un chiffre qui a changé, à relire ».
- Vu par Denis : une alerte du type « Dordogne : le chômage passe de 7,4 % à 8,3 %, la phrase "un peu en dessous de la moyenne française" est peut-être fausse ». Denis réécrit la phrase, seul ou avec Claude. Le code ne réécrit JAMAIS l'interprétation.
- Sur l'exemple : seule option qui attrape ce cas.
- Bénéfice : protège le sens, et c'est Denis qui interprète. Risque : un peu de travail par paragraphe, et des alertes parfois inutiles (le chiffre bouge sans que la phrase devienne fausse).
- `[effort : haut]` en tout ; version légère possible en commençant par `2026-06.md`.

**Recommandation de Claude** : 3 en priorité (elle seule répond à la consigne 134), avec 1 en complément ; 2 plus tard. Les options 1 et 2 se complètent (surveiller, supprimer les années écrites à la main) ; la 3 est d'une autre nature (elle voit le sens).

### 1.3 Étapes détaillées, dans l'ordre, à la reprise

1. **[Denis]** Choisir une option, ou une combinaison (une réponse suffit : « 3 puis 1 », « les trois », « 1 seulement »...).
2. **[Claude]** Si l'option 1 est retenue : étendre le test de `tests/comprendreLesChiffresLogique.test.js` (années et montants des 42 phrases comparés aux fichiers ; les textes de `2026-06.md`, du portrait et de l'Union européenne ; test en échec = message clair en français). `[effort : bas]`
3. **[Claude]** Si l'option 2 est retenue : reprendre les 11 endroits un par un (liste dans `audit_textes.py`, ré-exécutable), la période lue dans la fiche par les accesseurs `_comprendreLesChiffresFiche*`. `[effort : moyen]`
4. **[Claude]** Si l'option 3 est retenue : (a) définir le format de la ligne « s'appuie sur » dans les fichiers de contenu (jamais visible par les personnes) ; (b) l'outil `outils/veilleChiffres.js` compare au relevé et produit la liste « à relire » ; (c) la documenter dans `docs/FAIRE_LA_VEILLE.md` ; (d) commencer par `2026-06.md` (Synthèse courte et Lecture du territoire), puis le portrait et l'Union européenne. `[effort : haut]`
5. **[Denis + Claude]** Réécrire ensemble les phrases signalées, la première fois sur un vrai relevé.
6. **[Claude]** Cocher A13 au cahier, ligne au journal, test vert, commit.

**DÉCISION DE DENIS le 07/11/2026 : les trois options, dans l'ordre 1, 3, 2 (consigne 143).** Option 3 faite le 07/11 (moteur, appuis de `2026-06.md`, du portrait et de l'Union européenne, écran « Textes écrits à la main » dans l'outil de veille ; reste l'option 2). Option 1, première moitié faite : garde des paragraphes « Lecture du territoire » de `2026-06.md` (`outils/veilleGardeTextes.js`). Constat de l'audit : dans `2026-06.md`, tous les chiffres des paragraphes retrouvent leur ligne de donnée ; dans `portrait-2026.md` (28 nombres sur 107) et `ue-2026.md` (22 sur 41), certains chiffres ne sont dans aucun autre fichier : ces fichiers contiennent leurs propres données, donc une garde « texte contre données » ne s'y applique pas, c'est le travail de l'option 3. Après A13 : consigne 144 (une seule façon d'afficher la taille du texte dans toute l'application ?).

---

## 2. PRIORITÉ 2 : réponses courtes de Denis (rien à coder avant)

1. **A10 (4) : le nom de « Ma fiche chiffres »** (« Ma fiche chiffres », « Ma fiche chiffrée », autre). Si le nom change : grep sur tout le dépôt (boutons, recherche, Lexique, Nouveautés, journal). `[effort : bas]`
2. **A4b : les blocs d'écarts et le portrait ont-ils un bouton « Ma fiche chiffres » ?** `[effort : moyen]`
3. **Partie D** : boutons « Écrire » et « Appeler » pour le mail et le téléphone ; retirer les dépliants « niveau de vie » et « médiane » quand les fiches du Lexique existent ; convertir les « Annuler » du sélecteur de Mes Repères en boutons.
4. **Portrait : déclarer ses six fichiers dans l'outil de veille ?** (âge, formation, secteurs, temps partiel, généralistes, demandeurs). Aujourd'hui non déclarés, donc non relevés automatiquement. Lié à A13. `[effort : moyen]`

---

## 3. PRIORITÉ 3 : essais et jugements qui n'appartiennent qu'à Denis

- **A9** : juger les deux passes sur les espaces libres (consigne 128).
- **A10 (1)** : essai réel d'impression de la fiche (aperçu avant impression : une page propre, chiffres, sources, date, sans boutons).
- **A11** : essai sur sa fenêtre de la mise en page et de la disposition B ; **mode sombre** jamais regardé en image ; cartes en lecture Barres et Camembert non revues une à une.
- **Téléphone** : disposition de l'Union européenne et des cartes hautes non regardée sur petit écran.
- **Union européenne** : lire les points de franchise annoncés (faillites par pays = évolution seulement, énergie = 2022 seulement, Bulgarie sans revenu des ménages, Irlande sans faillites, petits pays très variables).

---

## 4. PRIORITÉ 4 : ce que Claude peut faire seul (par effort)

**`[effort : bas]`**
- A10 (3) : relire le texte d'aide « Comment m'en servir ? » de Ma fiche chiffres (validation **[Denis]**).
- Vide restant à droite de la carte « Hommes et femmes » (colonne de droite plus courte) : remonter la source en pleine largeur pour les cartes à courtes comparaisons. Seulement si Denis le juge nécessaire.
- Ajouter la ligne « Nouveautés » (`data/nouveautes.js`) quand tout le chantier Chiffres est terminé et vérifié.

**`[effort : moyen]`**
- **B1 FAIT le 07/11/2026** (boutons ajoutés dans les dépliants d'aide ; les dépliants eux-mêmes restent, leur retrait attend la réponse de Denis, partie D) : trois fiches du Lexique (« Niveau de vie », « Médiane », « Pouvoir d'achat ») sur le modèle de la fiche `inflation` ; `node scripts/checkLexique.js` à 0 erreur et 0 avertissement ; brancher les boutons « Lire dans le Lexique » des cartes (`data-comprendre-les-chiffres-fiche-lexique`).
- A9, suite possible : doublons « chiffres d'origine + lignes » dans les cartes du chômage ; dépliants « Comment lire ce chiffre ? » remplacés par un bouton à côté de la source.
- A12, suites possibles : cartes courtes de l'Union européenne en deux colonnes, marges entre cartes.
- Relancer `scripts/releveEuropeEconomieEurostat.py` tous les six mois (prochain : mai 2027).

**`[effort : haut]`**
- **B2** : second niveau « En savoir plus » pour 12 mots (estime de soi, confiance en soi, affirmation de soi, estime / confiance / affirmation, croyance limitante, message en « je », méthode DESC, critique ou reproche, styles de communication, groupe de pairs, aide matérielle, clause d'exécution ou critère d'attribution). Les 18 fiches `freins-*` et les 2 fiches `urgence-*` restent sans second niveau.
- **C : plus aucune ligne de texte cliquable (consignes 125 et 126)**. Ordre obligatoire : C1 maquette validée par Denis avant tout code ; C2 composants communs (bouton externe, adresse + carte) enregistrés dans `docs/BRIQUES_COMMUNES.md` ; C3 « On vous conseille d'aller sur le site » ; C4 Comprendre le cadre ; C5 boutons sans cadre du pied de fiche ; C6 « Signaler une erreur ou un changement » plus visible ; C8 chapitres du Lexique en boutons de couleurs différentes (maquette d'abord) ; C7 balayage final.
- RSA et RQTH par département : aucune source ouverte trouvée, rien à faire sauf si une source apparaît.

---

## 5. TERMINÉ (rien à refaire)

- A1 à A8 : inflation par pays, bénéficiaires du Smic, taux de pauvreté, métiers qui recrutent, portrait en six cartes, comparaison avec le département le plus haut et le plus bas (A5b, six sujets), pouvoir d'achat, entreprises en Chiffres / Barres, Union européenne (27 pays, 12 chiffres Eurostat).
- A12 : moins de vide dans les cartes, et correction du 06/11/2026 (carte « Hommes et femmes », leçon 9.117).
- Consignes 130, 131, 132, 133 : mise en page qui suit l'écran, jamais deux départements nommés, camembert sans trou, optimisation en dernier.

---

## 5 bis. Autres chantiers hors de ce plan : VÉRIFIÉS ligne par ligne contre le code et `git log` (06/11/2026, à la demande de Denis)

Correction : la première version de cette section reprenait des mentions périmées du guide (`ETAT_DES_CHANTIERS.md`, dont les titres de chantiers n'ont pas été mis à jour). Chaque ligne ci-dessous a été recontrôlée dans le code (modules, interrupteurs d'ouverture, tests) ou dans l'historique. **Le titre d'un chantier dans `ETAT_DES_CHANTIERS.md` n'est pas fiable : se fier à cette section, puis au code.**

### 5 bis.1 CODÉS ET OUVERTS (ne rien refaire ; seulement les essais de Denis)

| Chantier | Preuve dans le code ou l'historique | Ce qui reste |
|---|---|---|
| « Découvrir mes compétences » (Lot 9) | `modules/decouverte-competences/` et `modules/mes-competences/`, `MESCOMP_OUVERT = true`, séance C et module ouvert le 27/10 (`254cced7`), export Word, PDF | Essais de Denis |
| « Mettre mon CV en page, sans rien changer » (Créer un nouveau CV, trois parcours, Voie 3 de Reprendre mon CV) | `modules/cv-sans-assistant/`, `CSA_OUVERT = true`, 39 commits dont la maquette v2 du 04/11 (choix du métier en trois niveaux, question du domaine) | Essais de Denis |
| « Écrire ma lettre avec l'assistant » | `modules/lettre-core/` et `modules/lettre-editor/`, lots A à E et F10 faits, « Choisir l'autre version » (31/10), relecture en page étape 7 (01/11), « Vos appuis » (28/10) | Essai réel avec un assistant ; restes de la liste du 24/10 non revérifiés un par un |
| Un CV, plusieurs métiers | `modules/un-cv-plusieurs-metiers/`, `UCPM_OUVERT = true`, choix du domaine pour un métier saisi librement (04/11) | Essais de Denis (prompts de lettres, conseils de savoir-être) |
| Refonte « La mise en page » du CV en PDF, puis Word depuis le PDF | `modules/cv-pdf-html/` (carte « Organisation du CV » présente dans le code), `modules/cv-word/` (25 modèles A4 plus Mini CV A5), 145 commits PDF, banc de rendu des 39 modèles rejoué le 01/11 (2 écarts voulus) | Essais de Denis (vrai Word, vrai PDF) ; ne pas relancer la « phase 1 » : elle est close depuis le 22/09 |
| Nouveaux modèles et options de CV (formes de bandeau et de colonne, frise, 39 modèles) | `modules/cv-modeles-gardes/`, balayage des options le 01/11 : 0 anomalie | Quelques réglages au goût de Denis |
| Outil de prospection privé (carnet, Repérage, Structures d'aide, vérification par un assistant) | Dossier voisin `PROSPECTION/` avec son propre dépôt Git ; B1 à B3, C3, contrôle des adresses par lots ; lancement pour les essais le 31/10 | Essais de Denis ; mise à jour de l'Introduction faite le 02/11 |
| « Petites structures », marque « Via prospection », repères d'entreprises | Codés (commits d'octobre), blocs de recherche ouverte de l'outil de veille retirés le 20/10 | Essais et décisions de Denis |
| Reformuler R6 (boutons dans la barre du bas) | Fait le 29/09 (`d795f400`), cahier `CHANTIER_RETOURS_TEST_REFORMULER_2026-09-29.md` section R6 | Essais réels (Word, versions courtes sur ChatGPT) |
| Dette B.7 (ancien panneau Word Projet XXL) | Nettoyage fait les 29/09 et 01/11 (`d45c72fb`, `c57d619e`, `607252d3`, `f19ed887` : « traitées pour l'essentiel ») | Rien, sauf si Denis veut revoir un détail |
| Vocabulaire sans le mot « IA » | Aucun texte visible de l'application ne contient « IA » (les seules occurrences restantes sont des commentaires dans le code) | Rien |
| Barres d'étapes, lisibilité, inventaire des fenêtres | Faits les 30/10 et 31/10 (voir plus haut) | Rien |
| Vidéo de présentation | Versée dans `video/` le 02/11, page avec sous-titres | Rien |
| Mise à jour du fichier `entreprises-departements.md` | Relevé le 20/10/2026 (période du 01/11/2025 au 18/10/2026) | Prochaine mise à jour trimestrielle : janvier 2027 |

### 5 bis.2 CORRECTION DU 07/11/2026 (à la demande de Denis : « tout ça a été fait en grande partie ou abandonné »)

Cette liste était en grande partie fausse. Chaque ligne a été recontrôlée le 07/11/2026 dans le code et l'historique :

| Ligne d'origine | Réalité vérifiée | Statut |
|---|---|---|
| Modernisation visuelle de la fenêtre ERIP partagée | Les appels à `ouvrirFenetreERIP(` sont passés d'environ 108 à 63 (migration en pages, consigne « minimiser les fenêtres ») ; le cahier du 21/09 n'a jamais été repris | **Presque sans objet ; à classer abandonné sauf décision contraire de Denis** |
| Questionnaire « Retour sur votre expérience » | Remplacé par le bouton « Partager une information » (commit `5f3297cb`), avec fenêtre et aides | **Fait (par remplacement)** |
| Vidéo « activer la recherche web sur l'assistant » | Jamais tournée (aucune entrée dans `DEMOS_VIDEO_ERIP`) ; l'emplacement dans Comparer reste invisible tant qu'il n'y a pas de fichier | **Vraiment non fait, optionnel ; à abandonner ou à décider** |
| Refonte « Mes documents » : Composeur, allègement de « Mon projet », panneaux perso CV | Composeur retravaillé en octobre (stratégies, plafond de 11 laissé tel quel), « Mon projet » refondu (points 5 et 6), panneaux perso et formations (chantier du 02/10, phases F1 à F5), audit de stabilisation du 12/09 | **Fait par d'autres chantiers** |
| Paquet B de « Comprendre le cadre » (13 adresses à dater) | `docs/PAQUET_B_BLOQUE_A_DATER.md` : « Paquet B : TERMINÉ (2026-09-06) », 89 sources datées, 4 mortes supprimées | **Clos le 06/09 ; la mention « 13 adresses » était périmée** |
| Mots du K.3 du Lexique sans second niveau | B2 : 12 seconds niveaux écrits le 07/11/2026 | **Fait** |
| Relance régulière du contrôle des adresses | Outil codé ; action récurrente, pas un chantier | **Récurrent, rien à faire maintenant** |

Reste réellement ouvert hors plan : les essais de Denis (section 5 bis.3), la vidéo optionnelle ci-dessus, et le chantier « courriers » (analyse dans `docs/ANALYSE_COURRIERS_POUR_CONTRE_2026-11-07.md`).

### 5 bis.2 (ancienne version, FAUSSE, gardée pour mémoire) VRAIMENT PAS FAITS (aucune trace dans le code ni dans l'historique)

- **Modernisation visuelle de la fenêtre ERIP partagée** : préparation seulement (`docs/CHANTIER_MODERNISATION_FENETRE_ERIP_2026-09-21.md`, environ 108 points d'appel). Maquette d'abord.
- **Questionnaire « Retour sur votre expérience »** à retravailler avec Denis (signalé le 27/08) : aucun commit.
- **Vidéo « activer la recherche web sur l'assistant »** : aucun commit (ne pas confondre avec la vidéo de présentation, faite).
- **Refonte de « Mes documents »** : phases 1, 2, 3a, 3b faites (09/2026) ; à revérifier avec Denis ce qui reste réellement (Composeur, allègement de « Mon projet », panneaux perso CV) avant d'y toucher.
- **Paquet B de « Comprendre le cadre »** : le fichier `docs/PAQUET_B_BLOQUE_A_DATER.md` liste encore des adresses à dater ; non revérifié ligne par ligne.
- **Mots du K.3 du Lexique sans second niveau** : seulement si Denis valide une source (voir aussi B2 de ce plan).
- **Relance régulière du contrôle des adresses** (outil de veille, rythme de 30 jours) : l'outil est codé, c'est une action de Denis ou de Claude à chaque échéance.

### 5 bis.3 En attente d'une décision ou d'un essai de Denis (rien à coder avant)

- « Vos appuis » et Reformuler version 2 : essai avec un vrai assistant des quatre consignes (CV, lettre, entretien, lettres UCPM) ; marquage « proposé, à vérifier » à contrôler à l'écran ; choix du « Retour » à trancher. Ne rien annoncer dans `data/nouveautes.js` avant.
- Essais réels : Word, PDF, Comparer sur ChatGPT et Gemini, Regard recruteur, écran « Vérifiez les informations importées », rubrique « Mise à jour » de l'outil de veille.
- Sas : 129 structures et 261 employeurs « Jamais vérifiées », 59 groupes de doublons et 168 lignes à contrôler, quelques points précis (Papillons Blancs, ESAT de Creysse, CDG24).
- Tri de ses documents et photos : décisions en attente.

### 5 bis.4 Déjà faits et vérifiés (ne pas refaire)

Barres d'étapes (30/10) ; contrôle de lisibilité (31/10) ; inventaire illustré des fenêtres (31/10) ; lignes « Nouveautés » de l'Introduction et du Lexique ; pastilles cliquables « Vous êtes ici » de Qui fait quoi ; répartition des salaires en France ; Smic et inflation côte à côte ; message final du dossier Cloud (abandonné) ; écran « Vérifiez les informations importées » ; fenêtre commune « Collez la réponse » ; ouverture de Qui fait quoi et des employeurs.

### 5 bis.5 Réserve honnête

Cette fois, chaque « fait » s'appuie sur une preuve (interrupteur d'ouverture, dossier de module, commit). Ce qui reste incertain : le détail des petits restes à l'intérieur des chantiers codés (par exemple les points F1, E6 ou E5 bis de la liste lettre du 24/10) n'a pas été revérifié un par un ; avant de les reprendre, contrôler le point précis dans le code.

---

## 6. Plus tard (ne pas oublier, APRÈS ce plan)

- Les chantiers de l'ordre du 28/10 (lisibilité sur tout écran, clarté des boutons, voir le texte du dépôt), à redemander à Denis avant de les commencer.
- Accessibilité, puis découpage de `js/app.js` (environ 30 900 lignes), en dernier.

---

## 7. Ordre conseillé à la reprise

1. Montrer ce plan à Denis (section 1 d'abord).
2. Sa réponse sur A13, puis le nom de « Ma fiche chiffres ».
3. B1, trois fiches du Lexique (court, sans risque).
4. Ses essais : impression, mode sombre, téléphone.
5. A13 codé selon son choix.
6. C1, maquette des boutons, puis le reste de C.
7. B2, en dernier (long, peu risqué).
