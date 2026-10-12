# Chantier : « Informations complémentaires » déplaçable partout, et message Word à l'export

Ouvert le 2026-10-07 (demande de Denis, après la clôture du plan E1 à E6). **Audit du code réel fait, rien de codé.** Prochaine étape : réponses de Denis aux questions du § 5, puis maquette (règle « maquette avant code »).

## 1. Demande de Denis (résumé fidèle)
**A. Message Word à l'export.** Quand la personne arrive à l'écran où elle choisit le format (Word ou PDF) et que le modèle ou le style choisi ne peut pas être reproduit tel quel dans Word, un message le dit simplement et recommande le PDF. La phrase est à trouver par Claude.

**B. « Informations complémentaires » placée n'importe où.** Colonne de droite ou de gauche, en haut, en bas, et même dans l'en-tête avec les coordonnées (plus-value : ça attire l'œil, pour LinkedIn, portfolio, GitHub…). Elle peut s'empiler avec d'autres rubriques, y compris sur la même ligne. Dans l'aperçu plein écran, quand elle apparaît, elle a **son propre panneau** (taille, etc.), comme les autres rubriques.

## 2. Ce que le code fait déjà (vérifié le 2026-10-07)
**Pour B**
- `infos` est DÉJÀ l'un des dix blocs déplaçables (`_PDF_BLOCS_COLONNES`, `cvPdfTemplateMaquette.js` l. 108). Elle se déplace entre colonne gauche et colonne droite (`opts.ordreColonnes`, normalisée par `_pdfNormaliserDispositionColonnes`, l. 138), avec les flèches ▲ ▼ de la carte « Organisation du CV » (« Personnaliser en 2 colonnes », `_htmlPersoDeuxColonnesMq`, `cvPdfCartesMaquette.js` l. 2995) et par le mode « Rubriques » du plein écran.
- Empilement : deux rubriques sur la même ligne, **seulement dans la colonne large** (l. 147 à 149). « Expérience professionnelle » reste toujours seule, à droite.
- Les modèles à disposition propre (Colonne et frise, Photo, Rectangles arrondis, et leurs variantes Sobre) **ignorent** ce placement (`_pdfDispositionPropre`, `cvPdfPanneauReglages.js` l. 4954). Les autres modèles à gabarit propre (Chronologique, Éditorial, Technique, Cartes, Grille) : **comportement à vérifier** avant la maquette.
- Panneau actuel : la boîte « Informations complémentaires » de la carte « Autres rubriques » (`_htmlBoiteInfosCompMq`, `cvPdfCartesMaquette.js` l. 1656) : cocher des lignes, ajouter, suggestions, changer l'intitulé. **Aucun réglage de taille ni de style propre à cette rubrique.**
- Le **lien** (`identite.lien`, un seul) s'affiche déjà avec les coordonnées (l. 199 du gabarit) et se coche dans la même boîte. (Correction de l'audit E5 qui le disait absent.)
- **Absent** : placer la rubrique en bande pleine largeur en haut ou en bas, ou dans l'en-tête avec les coordonnées ; l'empiler dans la colonne étroite.

**Pour A**
- Le bloc « Exporter » est `contenuRectangleExporter` (`js/app.js` l. 13151) : deux boutons, Word (`data-format-export="docx"`) et PDF (`pdf-imprimer`). Un paragraphe `messageTelechargerWord` existe déjà (vide, caché, couleur d'avertissement).
- L'export Word renvoie déjà une liste d'`avertissements` (`wordExtracteur.js`), affichée seulement APRÈS le téléchargement, en bandeau de 12 secondes (`afficherAvertissementsExportDocxSiPresents`). Ce n'est pas ce que Denis demande : il veut le message AVANT le choix.
- Le modèle choisi est lisible dans `dossier.pdfReglages` (`regCreatifActif` + `creatifVariante`, `regSobreActif` + `sobreVariante`, `regStyleTitres`…).

## 3. Ce qui est simple, risqué, ou bloquant
**Simple (reprise de l'existant)**
- Message Word : un petit registre « modèle ou option → phrase » lu au moment d'afficher le bloc « Exporter », un seul point de code.
- Placer la rubrique en bande pleine largeur : même mécanisme que « Langues et Centres d'intérêt » (déjà en pleine largeur en bas de page).
- Panneau propre : réutiliser les réglages de style déjà existants (pastille, rectangle, texte seul ; une ou deux colonnes), pas de nouvelle mécanique.

**Risqué**
- Toucher au rendu commun `_pdfConstruireMaquette` pour 37 modèles : **réglage éteint par défaut, banc B7 avant et après**, comme pour E1 à E6. Les modèles à disposition propre demandent un traitement à part (ils ne passent pas par `ordreColonnes`).
- **L'en-tête avec les coordonnées** : c'est la partie la plus délicate. Chaque modèle construit son en-tête à sa façon, et dans Word l'en-tête est un bloc positionné, avec un avertissement existant s'il déborde. Il faut décider combien de lignes on y autorise.
- Empiler sur la même ligne dans la colonne étroite : peu de largeur, texte coupé.

**Bloquant : rien à ce stade.**

**Limite honnête pour A** : je ne connais, vérifié dans Word, que **la pointe des rubans de « Colonne foncée et rubans »**. Les autres écarts relevés lors du chantier Word sont de l'ordre de 1 à 4 mm (pas de quoi alerter). Un message n'apparaîtra donc que pour les écarts réellement constatés ; je propose un balayage des 37 modèles dans Word pour dresser la liste vraie, plutôt que d'alerter à tort.

## 4. Découpage proposé
- **Lot W (message Word)** `[effort : moyen]` : W1 registre et affichage dans le bloc « Exporter » (le PDF présenté comme recommandé quand il y a un écart) ; W2 balayage des modèles dans Word pour remplir le registre ; W3 essai de parcours + vérification dans le navigateur.
- **Lot I (rubrique déplaçable)** `[effort : haut]`, Mode A : I0 maquette (placements, panneau) ; I1 bande pleine largeur haut/bas ; I2 dans l'en-tête ; I3 panneau propre (taille, style, colonnes) ; I4 empilement ; I5 Word et message pour ce qui ne passe pas. Chaque lot : réglage éteint par défaut, banc B7 identique, Word ouvert pour de vrai.

## 5. DÉCISIONS DE DENIS (2026-10-07, « Je valide tes recommandations, vas-y ») : les cinq recommandations ci-dessous sont ACTÉES
1. Message Word : seulement pour les écarts constatés dans Word, phrase simple, PDF mis en avant. 2. En-tête : jusqu'à 3 lignes courtes, en ligne séparée par des points (présentation la plus simple et la plus sûre dans Word). 3. Sur la même ligne : n'importe quelle rubrique dans la bande pleine largeur, et dans la colonne large comme aujourd'hui. 4. Modèles Frise, Photo, Rectangles : la rubrique garde sa place actuelle, seul le panneau propre s'y ajoute. 5. Un seul lien dans l'identité.

## 6. AVANCEMENT
- [x] **W1 FAIT (2026-10-07)** : registre unique `modules/cv-word/limitesWord.js` (écarts CONSTATÉS dans Word seulement), message dans le bloc « Exporter » AVANT le choix (`_phraseLimitesWordCv` et `contenuRectangleExporter`, `js/app.js`), bouton PDF marqué « conseillé ». Test `tests/limitesWord.test.js`, essai de parcours `limitesWord` (5 contrôles). Seul écart inscrit : les rubans de « Colonne foncée et rubans ».
- [x] **W2 (liste vraie des écarts) : décision de méthode** : pas de nouveau balayage des 37 modèles (chacun a déjà été ouvert dans Word à sa création, seule la pointe des rubans diffère ; les autres écarts relevés sont de 1 à 4 mm). **Règle pour tout futur modèle ou style : ouvrir dans Word ; s'il y a un écart visible, l'inscrire dans `limitesWord.js`.**
- [x] **I0 maquette FAITE (2026-10-07)** : `docs/MAQUETTE_INFOS_COMPLEMENTAIRES_PLACEMENTS_2026-10-07.html` (six endroits, carte d'organisation, barre de la rubrique, Word, ordre de réalisation). **EN ATTENTE DE VALIDATION DE DENIS : aucun code du lot I avant son accord.**
- **Découverte de l'audit (2026-10-07, vérifiée dans le navigateur)** : le plein écran a DÉJÀ une barre propre à chaque rubrique, dont « Informations complémentaires » (clic sur le titre : taille du texte, interligne, espace au-dessus, `_mqOuvrirBarreRub`, `cvPdfPleinEcranMaquette.js` l. 125). La demande « son propre panneau, on choisit la taille » est donc déjà satisfaite ; on n'ajoute que « Présentation » (liste, sur une ligne, pastilles) et « Colonnes ». Le mode « Régler l'en-tête » a déjà des blocs libres (`_MQ_TETE_NOMS`) : l'en-tête du lot I2 s'y greffe.
- [x] **I1 FAIT (2026-10-07)** : bandeaux du haut et du bas, et « à côté de » une rubrique courte. Réglage éteint par défaut (`choixMq.infosPlace` = `haut` ou `bas`, `choixMq.infosCote` = `logi`, `langues`, `certifs`, `centres`), lu seulement dans le gabarit principal de `cvPdfTemplateMaquette.js` (après les constructions propres Frise, Photo, Rectangles, qui gardent leur place). Commande « Où placer cette rubrique ? » dans la carte « Autres rubriques » (`_htmlPlaceInfosMq`), grisée avec sa raison sur les modèles à disposition propre et le Mini CV A5. Devant une colonne pleine hauteur, le bandeau prend la couleur de la page. Vérifié : essai de parcours `infosBandeaux` (12 contrôles), Word ouvert (haut, et bas avec « Centres d'intérêt » : une page, fidèle), banc B7 : 37 modèles identiques. **Décision de réalisation à signaler à Denis : « à côté de » n'accepte que les quatre rubriques courtes (Logiciels, Langues, Certifications, Centres d'intérêt), pas les expériences ni les formations, trop longues pour un bandeau.** Limite visible : avec une colonne foncée pleine hauteur, le bandeau du bas se pose juste après le contenu et la colonne continue en dessous.
- [x] **I3 FAIT (2026-10-07)** : « Présentation » (Liste d'office, Sur une ligne, Pastilles) et « Colonnes » (1 ou 2) dans la barre de la rubrique du plein écran (visibles pour cette seule rubrique, `_mqMajReglagesInfos`, `cvPdfPleinEcranMaquette.js`). `choixMq.infosPresentation` (absent = liste d'avant, rendu identique) ; les deux colonnes réutilisent `listesDeuxColonnes`. En bandeau, « Sur une ligne » donne une seule ligne pleine largeur. Vérifié : essai `infosPresentation` (11 contrôles), Word (pastilles en bandeau, ligne en colonne : une page, fidèle), banc B7 : 37 identiques. Limite : « Sur une ligne » dans la colonne étroite coupe à la fin d'une ligne sur un point.
- [x] **I4 ÉCARTÉ APRÈS MESURE (2026-10-07), décision de réalisation à dire à Denis** : deux rubriques côte à côte dans la colonne étroite (environ 66 mm) donnent une trentaine de millimètres chacune : les informations passeraient sur 2 ou 3 lignes, illisible. L'empilement reste possible dans la colonne LARGE (déjà le cas, la rubrique est un des dix blocs) et dans les bandeaux (« à côté de »).
- [x] **I2 FAIT (2026-10-07)** : « Dans l'en-tête ». Les informations s'ajoutent comme lignes de plus au bloc des coordonnées (`coordHtml`, un seul point d'entrée lu par tous les en-têtes du gabarit principal, et que Word lit déjà), **3 lignes au plus** ; les suivantes restent dans la rubrique (rien ne se perd, indices d'édition conservés). `choixMq.infosPlace = 'entete'`, éteint par défaut, ignoré par Frise, Photo, Rectangles. « Sur une ligne » met les trois à la suite sur une seule ligne. Vérifié : essai `infosEntete` sur les 25 modèles Créatif et les 12 variantes Sobre (une page, informations dans l'en-tête, modèles à disposition propre inchangés), mode « Régler l'en-tête » sans débordement, Word ouvert pour un bandeau coloré, un en-tête centré et « Technique » (fidèles, une page), banc B7 : 37 identiques.
- [x] **I5** : aucun écart Word à inscrire dans `limitesWord.js` pour ce lot (bandeaux, présentations et en-tête vérifiés dans Word).

## 7. Questions posées avant les décisions (pour mémoire)
1. **Message Word** : recommandation = n'alerter que pour les écarts constatés dans Word (balayage des 37 modèles d'abord), phrase simple et rassurante, bouton PDF mis en avant. Autre option : un message général sur tous les modèles Créatif. À valider.
2. **En-tête** : combien de lignes au maximum sous les coordonnées (recommandation : jusqu'à 3 lignes courtes) ? Présentation en ligne séparée par des points, ou en pastilles ?
3. **Sur la même ligne** : avec quelles rubriques (recommandation : n'importe laquelle dans une bande pleine largeur, et dans la colonne large comme aujourd'hui) ?
4. **Modèles à disposition propre** (Frise, Photo, Rectangles) : la rubrique y reste à sa place actuelle, avec seulement le panneau propre (recommandation), ou on leur ajoute aussi les placements ?
5. **Plusieurs liens** : on garde un seul lien dans l'identité (recommandation, car l'en-tête permettra d'en mettre d'autres) ou on en ajoute plusieurs ?
