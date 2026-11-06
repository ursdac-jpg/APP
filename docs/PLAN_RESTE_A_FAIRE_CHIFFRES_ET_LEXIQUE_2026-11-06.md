# PLAN PRIORITAIRE À LA REPRISE (Comprendre les chiffres, Lexique, boutons)

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

Tant que Denis n'a pas répondu à l'étape 1, rien n'est codé.

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
- **B1** : trois fiches du Lexique (« Niveau de vie », « Médiane », « Pouvoir d'achat ») sur le modèle de la fiche `inflation` ; `node scripts/checkLexique.js` à 0 erreur et 0 avertissement ; brancher les boutons « Lire dans le Lexique » des cartes (`data-comprendre-les-chiffres-fiche-lexique`).
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

## 5 bis. Autres chantiers ouverts HORS de ce plan (vérifié le 06/11/2026 dans `docs/ETAT_DES_CHANTIERS.md`, `docs/TACHES_VALIDEES.md`, `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md`, `git log` et le code)

**Déjà FAITS, vérifiés, à ne pas refaire** : barres d'étapes G3 (30/10) ; contrôle de lisibilité portable, tablette, téléphone (31/10) ; inventaire illustré des fenêtres (31/10) ; ligne « Nouveautés » de l'Introduction (`85b646f1`) et du Lexique ; pastilles cliquables « Vous êtes ici » de Qui fait quoi (`673eeb3c`) ; répartition des salaires en France (consigne 118 c, `3da0f4f2`) ; Smic et inflation côte à côte ; message final du dossier Cloud (consigne 89, abandonné) ; écran « Vérifiez les informations importées » ; fenêtre commune « Collez la réponse » ; ouverture de Qui fait quoi et des employeurs.

**Attendent un essai ou une relecture de Denis (rien à coder avant)** :
- « Vos appuis » et Reformuler version 2 : essai avec un vrai assistant des quatre consignes (CV, lettre, entretien, lettres UCPM), marquage « proposé, à vérifier » à contrôler à l'écran, choix du « Retour » à trancher. Ne rien annoncer dans `data/nouveautes.js` avant.
- Essais réels : Word, PDF, Comparer sur ChatGPT et Gemini, Regard recruteur, parcours « Un CV, plusieurs métiers » (prompts de lettres, conseils de savoir-être), écran « Vérifiez les informations importées », rubrique « Mise à jour » de l'outil de veille.
- Sas : 129 structures et 261 employeurs « Jamais vérifiées », 59 groupes de doublons et 168 lignes à contrôler, quelques points précis (Papillons Blancs, ESAT de Creysse, CDG24).
- « Petites structures », marque « Via prospection », chiffres à jour du Lexique (relecture), repères d'entreprises : en attente de ses essais ou décisions. Tri de ses documents et photos : en attente de ses décisions.

**Conception faite ou commencée, RIEN codé (reprendre avec Denis)** : « Découvrir mes compétences », « Écrire ma lettre avec l'assistant », « Mettre mon CV en page, sans rien changer » (relecture de Denis), refonte totale de la mise en page des CV en PDF (phase 1), outil de prospection (trois points), nouveaux modèles et options de CV, refonte de « Mes documents » (reste Composeur, allègement de « Mon projet », panneaux perso CV), Reformuler R6, dette B.7 (panneau Word Projet XXL), modernisation de la fenêtre ERIP, vocabulaire sans le mot « IA ».

**Claude peut le faire seul quand Denis le décide** : mise à jour trimestrielle de `entreprises-departements.md` ; relance du contrôle des adresses ; 13 adresses à dater (paquet B de Comprendre le cadre) ; mots du K.3 sans second niveau, seulement si Denis valide une source ; questionnaire « Retour sur votre expérience » à retravailler avec lui ; vidéo « activer la recherche web ».

**Réserve honnête** : les points « faits » ci-dessus sont recoupés avec le code ou `git log`. Les chantiers d'essais et de conception sont repris du guide (`ETAT_DES_CHANTIERS.md`) sans avoir été rouverts un par un dans le code ; avant d'en commencer un, refaire le contrôle de son propre périmètre.

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
