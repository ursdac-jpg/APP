# Audit de l'application sur téléphone portable (24/11/2026)

Demande de Denis : savoir comment tout ce qui est proposé sur ordinateur apparaît sur un écran de téléphone, et s'assurer que tous les modules, parcours et chemins sont utilisables au téléphone. Première passe : mesure automatique, lecture du code, deux écrans regardés à la main. Rien n'a été modifié dans l'application.

## 1. Réponse à la question « entrée à part ou adaptation automatique »

**Adaptation automatique, pas une entrée à part.** C'est déjà le principe de l'application : la balise d'affichage est posée (`index.html`), et `css/style.css` compte environ 100 règles par taille d’écran (seuils à 480, 576, 600, 640, 700, 768, 1024 px), plus 15 dans `css/mise-en-page-maquette.css` et une dizaine par module. Aucun code ne cherche à « deviner » un téléphone (pas de lecture du navigateur dans `js/app.js`), et ce n'est pas nécessaire : la taille de l'écran suffit.

Pourquoi pas une entrée à part : deux versions de chaque écran doubleraient 46 modules et 68 routes à maintenir, ce qui contredit la règle de la source unique. Une seule adaptation est possible en plus, utile : une règle « écran tactile » (`@media (pointer: coarse)`) qui agrandit les cibles au doigt sans toucher aux écrans.

## 2. Ce qui a été mesuré (à 375 px de large, comme un téléphone courant)

Méthode : les 68 routes de `routes` ouvertes une à une dans le navigateur intégré, en clair puis en sombre ; pour chacune, largeur de la page, éléments qui dépassent à droite ou à gauche, boutons et liens de moins de 36 px, textes de moins de 13 px.

| Mesure | Résultat |
|---|---|
| Page plus large que l'écran (défilement de côté) | **0 sur 68 routes, en clair et en sombre** |
| Erreur d'affichage | 0 |
| Éléments qui sortent de l'écran | 0 |
| Largeurs fixes dans le CSS (340 px ou plus) | 1 seule : le panneau d'aide de la mise en page, avec une limite à l'écran (`max-width`) |
| Largeurs fixes écrites dans le JS | 0 |
| Tableaux | tous dans un conteneur qui défile (comparer mes pistes, Explorer les métiers, Chiffres) ou sans débordement mesuré (Nouveautés) |
| Boutons principaux | 44 à 48 px de haut (déjà posé dans le CSS) |

**Limite honnête de cette mesure** : elle couvre les pages d'entrée de chaque route, pas tous les écrans internes d'un parcours (ceux qui n'apparaissent qu'après une saisie, un résultat de l'assistant, un choix). Ces écrans restent à parcourir à la main ou par scénario. Les 68 routes ne montrent donc pas que « tout » passe, seulement que la base est saine.

## 3. Constats (ordre de gravité)

### A. Petites cibles au doigt (sûr, mesuré)
- Les trois flèches de la ligne d'icônes du haut (réglages, présentation, etc.) : 18 par 38 px, sur toutes les pages (`#flecheBoutonsGauche`, `#flecheIntroduction`, `#flecheBoutonsDroite`). La ligne se fait aussi défiler au doigt, mais la flèche est difficile à viser.
- Pastilles d'étapes du parcours (`.pastille-etape-action`) : 36 par 28 px.
- Boutons « ↺ » (annuler, revenir au réglage de départ) de la mise en page du CV : 34 px de large.
- Sélecteur de métier de la mise en page (`#mepSelMetier`) : 31 px de haut.
- Seuil usuel conseillé : 44 px.

### B. Gestes qui ne marchent probablement pas au doigt (lu dans le code, À VÉRIFIER sur un vrai téléphone)
- **Réglages du CV, déplacer des blocs par glisser** (`modules/cv-pdf-html/cvPdfPanneauReglages.js`) : écrit avec les événements de la souris (appui, déplacement, relâchement). Un doigt qui glisse ne les produit pas : le déplacement ne se ferait pas. Je n'ai pas trouvé de boutons « monter » et « descendre » de remplacement dans ce fichier. À confirmer avant de conclure.
- Les poignées de l'en-tête et des formes du CV (`cvPdfPoigneesCv.js`, `cvPdfEnteteApercu.js`, `cvPdfFormesDeco.js`) utilisent les événements de pointeur : elles suivent le doigt.
- Deux des graphiques de « Comprendre les chiffres » (lignes 1706 et 4169 de `modules/comprendre-les-chiffres/index.js`) n'affichent leur info-bulle qu'au survol de la souris ; un simple toucher fonctionne en général, pas le glissé. Les deux autres (inflation, courbe) gèrent le toucher.

### C. Place disponible (mesuré)
- CV en plein écran (« Grand aperçu ») : l'en-tête et les outils prennent environ 440 px sur 812, soit plus de la moitié de l'écran ; la page du CV n'a plus qu'environ 370 px de haut. Utilisable, à l'étroit. Le CV de la page « Nos modèles » est d'abord une vignette (246 par 356 px) illisible, mais un bouton l'ouvre en grand.

### D. Fonctions propres au téléphone, impossibles à vérifier dans un navigateur d'ordinateur (non vérifié)
- **Coller** : « Ctrl+V » est cité dans 5 fichiers (14 endroits). Sur téléphone, le geste est l'appui long puis « Coller » : les textes doivent le dire.
- **Enregistrer en PDF et imprimer** : 11 fichiers appellent l'impression. Déjà noté « non vérifié sur téléphone et tablette » pour « Ce qui compte pour moi ». Le comportement varie beaucoup d'un téléphone à l'autre.
- **Disquette** (enregistrer un fichier, le rouvrir) : le téléchargement et le choix d'un fichier se passent autrement sur téléphone.
- **Fenêtres ouvertes automatiquement** (`window.open`, 18 appels) : les navigateurs de téléphone les bloquent encore plus souvent. Un repli existe pour l'écran tampon de l'assistant, pas partout vérifié.
- **Changer d'application pour coller dans l'assistant, puis revenir** : sur téléphone, le navigateur peut décharger la page pendant ce temps et tout ce qui n'est pas enregistré sur la disquette est perdu. Voir la décision à prendre ci-dessous.

### E. Fichiers à surveiller
Aucune règle par taille d'écran dans `astuceDictee.css`, `regardExterieur.css` et `entretien-editor/style.css` : pas de débordement mesuré, mais à parcourir en profondeur.

## 4. Plan proposé (à valider par Denis, rien n'est lancé)

| Lot | Contenu | Effort | Remarque |
|---|---|---|---|
| 1 | Règle « écran tactile » : cibles à 44 px minimum (flèches du haut, pastilles d'étapes, boutons ↺, sélecteur de métier) | `[effort : moyen]` | Une règle commune dans `css/style.css`, mode sombre inchangé. Touche une brique commune : grep sur tout le dépôt, test navigateur clair et sombre à 375 px. |
| 2 | Parcours des écrans internes, module par module, à 375 px, avec un scénario (données d'essai) et un balayage automatique à chaque étape | `[effort : moyen]` | 46 modules, par groupes (accueil et Mes documents, Candidater, Explorer les métiers, Comprendre, Bien utiliser l'IA, etc.). Corrections de défauts dans le même passage (règle du 12/09/2026). |
| 3 | Réglages du CV au doigt : déplacer sans glisser (boutons monter et descendre, ou événements de pointeur), outils du plein écran plus compacts | `[effort : haut]` | Maquette et questions avant code (décision d'interface). Dépend du constat B à confirmer. |
| 4 | Fonctions propres au téléphone : essai sur un vrai téléphone (coller, PDF, disquette, fenêtres, retour dans l'application), textes d'aide adaptés au téléphone | `[effort : moyen]` | Impossible sans un téléphone en main : à faire avec Denis. |
| 5 | Garde-fou : un test qui rejoue le balayage des 68 routes à 375 px et refuse un débordement | `[effort : bas]` | Évite qu'un futur module casse le téléphone sans que personne le voie. |

Ordre conseillé : 5 d'abord (protège tout le reste), puis 1, puis 2 en continu, 3 après maquette, 4 avec le téléphone de Denis.

## 4 bis. Avancement (24/11/2026)
- **Lot 5 FAIT** : `npm run telephone` (`scripts/rendu/balayageTelephone.js`) et `tests/telephoneGarde.test.js`. Le balayage a trouvé un défaut réel que la première mesure avait manqué : sur « Votre parcours », des colonnes de 26 rem (416 px) dans un cadre de 343 px à débordement masqué coupaient la fin des phrases et des choix. Corrigé (`js/app.js`, `_vpStyle`) ainsi qu'une colonne de 380 px dans les Repères (`reperes.css`) ; ajouté à `data/problemesCorriges.js` et à la leçon 9.220.
- **Lot 1 FAIT** : zones à toucher de 44 px (bloc « Écran tactile » de `css/style.css`, `css/mise-en-page-maquette.css` pour les boutons ↺ et le sélecteur de métier). Résultat : 0 défaut sur 68 routes, clair et sombre. Les flèches du bord de l'écran font 24 px de large (borne du bord de l'écran), c'est le seul seuil particulier.
- **Mesure de zone** : le balayage compte le cadre invisible comme zone à toucher ; la mesure réelle au doigt (toucher à 3 px autour d'un bouton) a été vérifiée dans le navigateur.

- **Lot 2 FAIT** (parcours internes) : `npm run telephone:parcours` rejoue les 22 parcours du protocole à 375 px (142 écrans) avec la mesure partagée `scripts/rendu/mesureTelephone.js`. État initial : 28 anomalies (475 cibles trop petites dans « Comprendre les chiffres », 55 dans les documents, 1 texte coupé dans « Choisissez votre assistant »). État final : 0. Défaut visible corrigé : « À compléter » dépassait du cadre des appuis de la lettre (`.appui-etat`). Tolérances écrites avec leur raison : chiffre cliquable dans une phrase, pastilles de couleur du CV. Preuve que l'ordinateur ne bouge pas : `scripts/rendu/empreinteEcran.js`, 204 pages (68 routes x 1280, 1024, 800 px), 0 écart hors hasard du Lexique.
- **Pas couvert par le lot 2** : modules sans parcours scénarisé dans le protocole (« Bien utiliser l'IA » 4 chemins, « Ce qui compte pour moi », Lexique, Carnet, Repères, Mes compétences, Nouveautés) et les parcours « reprendre le récit » et « boîte à outils » qui ne traversent aucun écran. À couvrir par de nouveaux scénarios si Denis le décide.

- **Lot 3, constat réel (24/11/2026)** : le doute du constat B est levé. Le code « souris seulement » de `cvPdfPanneauReglages.js` concerne l'ancien rendu, supprimé le 26/09/2026 (`_pdfConstruireStyleEtPage` : tous les modèles passent par la maquette) : aucun groupe glissable n'existe plus dans la page. Le plein écran « Régler le CV » (`cvPdfPleinEcranMaquette.js`) utilise les événements de pointeur et `touch-action: none` : un glissé au doigt (simulé, événements tactiles réels du navigateur) a bien déplacé une expérience à la fin de la liste. LE VRAI PROBLÈME EST LA TAILLE : la page A4 (830 px) est réduite à 347 px (échelle 0,42) pour tenir sur l'écran, donc les poignées mesurent à l'écran 8 x 9 px (déplacer une expérience ou une mission), 5 x 7 px (poignée de rubrique), 6 x 6 px (croix « retirer »), 13 px de large (poignées de l'en-tête), alors qu'un doigt couvre 44 px. Autre constat : en haut du plein écran, le texte et les 6 boutons prennent 440 px sur 812, il reste environ 360 px pour le CV. Les flèches ▲ ▼ (monter, descendre d'un cran) existent déjà, mais aussi à 0,42. Mesure faite avec un script jetable (non gardé) sur le parcours « Commencer à la main », 3 expériences.

- **Contrôles complémentaires FAITS le 25/11/2026** : (1) autres largeurs : 68 routes à 320, 360 et 414 px, clair et sombre : 0 défaut ; (2) moteur de Safari (WebKit de Playwright) : 68 routes à 375 px : 0 défaut, 0 erreur de page ; (3) NOUVEAU DÉFAUT RÉEL : des champs de saisie à 14 px (Vos informations, listes de la mise en page du CV, tableau de bord de Cohérence, réponses ciblées de Découverte) font zoomer un iPhone à l'ouverture du clavier ; règle unique à 16 px sur écran tactile ou étroit, contrôle ajouté à la mesure partagée (`champsPetits`), test dans `tests/telephoneGarde.test.js` ; résultat : routes, parcours (146 écrans) et modules (222 états) à 0 défaut ; ordinateur inchangé (204 pages à 1280, 1024 et 800 px, seul le Lexique bouge au hasard de ses exemples) ; (4) le copier a un repli (`execCommand`) quand `navigator.clipboard` est absent ; le coller depuis le presse-papiers passe par la fenêtre de collage, qui a un champ à coller à la main.
- **Note d'essai** : sur l'adresse du réseau local (`http://192.168.x.x`), le navigateur du téléphone n'offre pas l'API du presse-papiers (page non sécurisée) : le repli sert ; sur le vrai site en https, l'API est disponible.

- **Essai avec saisies FAIT le 25/11/2026 pour « Bien utiliser l'IA » et « Ce qui compte pour moi »** (les deux modules sont ouverts au public depuis le 25/11/2026) : méthode : champs remplis à chaque écran (texte court, texte long avec adresse et mot très long, listes, cases), puis clavier ouvert simulé. « Bien utiliser l'IA » : 6 routes, 89 états, clair et sombre. « Ce qui compte pour moi » : les 8 cartes de bout en bout, Ce que j'ai gardé, préparation du papier, passage chez l'assistant (choix, fenêtre d'avertissement, écran d'attente), collage d'une réponse longue, lecture du papier : 42 écrans à 375, 768 et 1280 px. DÉFAUTS RÉELS TROUVÉS ET CORRIGÉS : (1) un mot ou une adresse très longue élargissait la page de « Bien utiliser l'IA » (786 px sur 375 px), même sur ordinateur en cas de longue adresse ; (2) réponses en boutons de 40 px dans « Ce qui compte pour moi » (choix nombreux, tableau des valeurs), portées à 44 px sur téléphone. Résultat : routes (68), parcours (23, 188 écrans) et modules à 0 défaut ; ordinateur inchangé (204 pages à 1280, 1024 et 800 px, seul le Lexique bouge au hasard de ses exemples). LIMITE : l'impression, le PDF, le téléchargement et le geste réel du doigt restent à vérifier sur le vrai téléphone.

## 5. Décisions et questions pour Denis

1. Lancer quel lot en premier ? (recommandation : le lot 5, puis le lot 1.)
2. Disposer d'un vrai téléphone (quelle marque, quel navigateur : Chrome, Safari) pour le lot 4 : les émulateurs ne montrent ni l'impression, ni le téléchargement, ni le presse-papiers.
3. **Sauvegarde automatique locale** : décision du 09/09/2026, écartée parce que le poste partagé est un risque pour la vie privée. Un fait nouveau : sur téléphone (appareil personnel, mais navigateur qui décharge la page quand on change d'application), la perte du travail non enregistré devient plus probable. Je ne propose rien ici sans votre accord : seulement poser la question, sans rouvrir la décision.

## 6. Ce qui reste hors de cette passe
- Écrans internes de chaque module (lot 2).
- Mode « Texte plus grand » combiné au téléphone : à tester au lot 2.
- Mode paysage du téléphone, tablettes (768 à 1024 px) : non mesurés.
- Vidéos et diaporama de présentation sur téléphone : non vérifiés.

- **Lot 3 FAIT (25/11/2026)** : bouton « Agrandir le CV » (150 %, défilement latéral) et bouton « Outils » sur téléphone seulement, poignées, flèches et croix à plus de 44 px à l’écran, haut du plein écran compacté. Preuves : glissé au doigt de chaque mode (clair et sombre), ordinateur inchangé (0 écart). Voir `docs/ETAT_DES_CHANTIERS.md`.
- **Autres modules FAITS (25/11/2026)** : `npm run telephone:modules` (22 routes, chaque bouton touché, deux niveaux), 208 états en clair et 210 en sombre : 0 défaut après correction des cibles sous 44 px (Lexique, vidéos, Explorer les métiers, Options d’affichage, Nouveautés, liens utiles). Un plantage réel de « Bien utiliser l’IA » trouvé et corrigé (nom global écrasé, leçon 9.224). Limite : aucune saisie ni collage dans ce balayage.
