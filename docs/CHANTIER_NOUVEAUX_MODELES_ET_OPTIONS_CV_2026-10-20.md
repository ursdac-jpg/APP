# Chantier : variété des modèles et options de CV, d'après 8 exemples (2026-10-20)

Mode A, `[effort : haut]`. Préparation faite, RIEN CODÉ. Maquette à faire avant tout code.

## Décisions de Denis à respecter (2026-10-20)
1. **Le PDF est la référence visuelle.** Aucune option n'est sacrifiée ou édulcorée à cause du Word. Le Word garde son message d'attention existant ; il doit couvrir les nouvelles options (à vérifier). Mémoire : `feedback_pdf_reference_word_secondaire`.
2. **Variété et richesse maximales** des designs, jamais toute la feuille colorée (règle antérieure), jamais de barres de niveau (score sur la personne), jamais de visage ni d'émoji.
3. **Enrichir les modèles existants** plutôt que d'en créer (règle du 2026-10-11), sauf vrai manque.
4. Formes décoratives transparentes sous le texte (cercle, triangle, lame effilée) : voulues, en option, sur les modèles existants.
5. Les options doivent se voir sur la **vignette** (comme le bord vallonné et les 3 boutons du bandeau). Idée de Denis : une case « formes » à cocher, puis le choix des formes par CV. À concevoir en maquette.

## Audit du code réel (2026-10-20)
- Mécanisme existant : `js/app.js` lignes ~17665 à 17810 : interrupteur « Vallonné » (5 modèles, `data/miniatures/<famille>_<id>.bord.json`) et 3 boutons de bord de bandeau (3 modèles, `...bandeau-<bord>.json`). Deux mécanismes jumeaux : DETTE DE DUPLICATION à résorber avant d'en ajouter (à inscrire dans `BRIQUES_COMMUNES.md` B.21 / B.22).
- Précédent de forme décorative : « coin coloré » (`cvPdfTemplateMaquette.js` ligne ~1179 et 2258) : un seul triangle, haut gauche, `mix-blend-mode: multiply`, `z-index` positif, `pointer-events: none`. À généraliser, jamais à dupliquer.
- Existe déjà : puces carré / triangle / losange / tiret ; styles de titres (sans décor, souligné, bandeau, filet prolongé, souligné court, pastille avec icônes) ; compétences pastille / rectangle / texte seul ; icônes titres et coordonnées ; coordonnées « en ligne sous l'en-tête » ou « en colonne » ; accroche italique ou normal, avec ou sans ; forme de colonne rectangle ou diagonale ; fond de colonnes ; dégradés ; anneau de photo ; coins arrondis ; dates alignées ; ordre date / poste.
- Photo : la forme est fixée par la recette du modèle (losange, médaillon) : AUCUN choix de forme par la personne.
- Position de l'accroche : seulement avec / sans et italique : pas de choix d'emplacement.

## Inventaire complet (statut : À FAIRE / À VÉRIFIER / ÉCARTÉ)

### A. Mécanisme commun (à faire en premier)
- [ ] `[effort : haut]` A1. Regrouper bord de colonne et bord de bandeau en UN mécanisme « option sous la vignette » paramétré (type d'option, valeurs, miniatures par variante). Grep sur tout le dépôt, banc de rendu à 0 écart.
- [ ] `[effort : haut]` A2. Calque commun de formes décoratives (voir D), qui absorbe le coin coloré actuel.
- [ ] `[effort : moyen]` A3. Disposition des vignettes : rangée d'options dessinées + une case / un bouton « Formes » ouvrant le choix dans la page (jamais une fenêtre), lisible à 375 px.

### B. Formes sous la vignette
- [ ] B1 `[moyen]` Haut de colonne : droit / arche (exemple 2).
- [ ] B2 `[moyen]` Bord de bandeau : ajouter « en pointe » (chevron) à droit / arrondi / vallonné. Pas de « en biais » : les modèles Diagonale l'ont.
- [ ] B3 `[moyen]` Forme de la colonne : ajouter pointe, vague, arche à rectangle / diagonale.
- [ ] B4 `[moyen]` Forme de la photo choisie par la personne : ronde, carrée, arrondie, ovale, losange (exemples 2, 3, 5, 6, 7). Écarté : forme « tache ».
- [ ] B5 `[bas]` Forme des icônes de contact : rond, carré foncé (exemple 7), sans fond.
- [ ] B6 `[bas]` Puces : ajouter rond plein et rond creux (les autres existent) ; sert la frise (M1).
- [ ] B7 `[moyen]` En-tête : nom sur bloc sombre pleine largeur (exemple 7), nom « en pile », sans fond.

### D. Formes décoratives transparentes (idée de Denis)
- [ ] D1 `[haut]` Formes : rond, anneau, demi-rond, triangle, lame effilée sous l'en-tête (exemple 8), bande oblique.
- [ ] D2 `[haut]` Zones (pas de glisser libre) : coin haut gauche, haut droite, derrière le nom, sous l'en-tête, milieu, bas de page ; grisées là où elles tombent sur la photo ou un bloc.
- [ ] D3 Taille S / M / L ; transparence légère / moyenne (plafond pour garder le texte lisible) ; couleur du CV ou deuxième couleur ; une ou deux formes par CV.
- [ ] D4 Lisibilité garantie : teintes claires mélangées au fond comme le coin actuel, test en niveaux de gris.

### M. Modèles neufs
- [ ] M1 `[moyen]` Frise sobre (exemples 5 et 7) : fond blanc, une couleur, puces rondes (B6), rôle en gras, dates en italique à droite, colonne grise claire, nom en bandeau sombre (B7).
- [ ] M2 DÉCISION DE DENIS : « bandeaux noirs alternés » (exemple 9 du 1er octobre), écarté alors en partie pour le Word. Le motif Word tombe ; reste : un seul exemple, usage de niche.

### T. Typographie (tous modèles)
- [ ] T1 `[bas]` Lettres espacées sur les titres et sur le poste (exemples 3, 4, 7, 8).
- [ ] T2 `[bas]` Casse des titres : MAJUSCULES / Capitales initiales / minuscules.
- [ ] T3 `[bas]` Graisse et taille du nom : fin / normal / très gras.
- [ ] T4 `[moyen]` Associations de polices (titres à empattement + texte sans empattement, exemple 2). À vérifier : liste actuelle de `regPolice`.

### P. Mise en page
- [ ] P1 `[moyen]` Accroche en bande colorée pleine largeur (exemple 4).
- [ ] P2 `[moyen]` Position du profil : colonne étroite, bande pleine largeur, sous le nom (exemple 8).
- [ ] P3 `[moyen]` Contacts en tête de la colonne de droite sur deux colonnes, icônes en carrés foncés (exemple 7). « En ligne sous l'en-tête » existe déjà ; manque la grille à deux colonnes.
- [ ] P4 `[bas]` Séparateurs entre expériences : rien / filet fin / point / espace large.
- [ ] P5 `[moyen]` Rythme des expériences : rôle coloré, durée en italique, dates dans une étiquette (exemples 2, 5).
- [ ] P6 `[bas]` Compétences sur deux colonnes (exemple 4).
- [ ] P7 `[bas]` Dates en italique à droite sur la ligne du poste (à vérifier : l'alignement existe, l'italique non confirmé).
- [ ] P8 `[moyen]` Titres en « étiquette » (rectangle à fond pâle, exemples 2 et 8). N'existe pas : le style « pastille » n'est offert qu'avec les icônes.
- [ ] P9 `[bas]` Filet fin autour de la feuille (jamais de fond coloré).

### F. Fonds
- [ ] F1 `[moyen]` Motifs très discrets sur la colonne (lignes, points, bandes fines). Seulement légers. Jamais la page entière.

### W. Word
- [ ] W1 `[bas]` Localiser le message d'attention Word existant ; vérifier qu'il couvre les nouvelles options sans réécriture à chaque ajout (idéal : chaque option déclare si le Word la rend, le message s'adapte au CV).

### Écartés (inchangé)
Fond de page entier teinté ; barres de niveau des compétences ; logos d'entreprises ; photo en forme de tache ; émoji et visages ; titres en anglais ; dégradé gris peu lisible ; pictogramme de toque ; « bord en biais » (doublon des modèles Diagonale).

## Ordre proposé
A1, A3 (maquette d'abord), D (A2), B1 à B3, M1 avec B6 et B7, B4 et B5, T, P, F, W1 en continu.

## Verdict
GO AVEC RÉSERVES : lisibilité des formes, collision avec le contenu, nombre de rangées sous une vignette (surtout à 375 px), miniatures à fabriquer par variante (banc de rendu). NON APTE AU MODE NUIT : maquette et décisions de Denis d'abord.

## Maquette à faire (une seule, cliquable)
Écran de la galerie avec : une vignette portant sa rangée d'options dessinées ; la case « Formes » ; le choix de formes dans la page (forme, zone, taille, transparence, couleur) ; rendu immédiat sur un CV d'exemple ; version 375 px.

## Maquette faite (2026-10-20)
`docs/MAQUETTE_OPTIONS_ET_FORMES_CV_2026-10-20.html` (à ouvrir via le serveur de dev : `http://localhost:8123/docs/MAQUETTE_OPTIONS_ET_FORMES_CV_2026-10-20.html`). Vraies miniatures de l'application, rangées d'options sous les vignettes (existantes en trait plein, nouvelles en orange pointillé), case « Formes » sous chaque vignette, panneau de formes dans la page (refermable), 4 réglages de style globaux, deux modèles neufs dessinés (Frise sobre, Bandeaux noirs). Décisions de Denis du 2026-10-20 : bandeaux noirs OUI (M2 acté), case Formes SOUS LA VIGNETTE. À valider par Denis : formes proposées, zones, 2 formes au plus, 2 niveaux de transparence.

## Décisions de Denis, suite de la maquette (2026-10-20)
- Validés : les 6 formes, 2 formes au plus par CV, 2 niveaux de transparence, les deux modèles neufs (Frise sobre, Bandeaux noirs).
- **Placement libre** (nouveau) : en plus des 6 zones, la personne place la forme où elle veut, directement sur l'aperçu (glisser au doigt ou à la souris, flèches du clavier), puis « Terminé ». Position enregistrée en fractions de la page (fx, fy, fw), donc identique à l'écran et en PDF. Limite connue : la forme appartient à la page 1.
- **Taille** : 5 tailles prêtes (très petite, petite, moyenne, grande, très grande) + « Régler moi-même » : même réglage à la main sur l'aperçu (déplacer ET agrandir par le coin, plus et moins au clavier). Convertir une zone en placement libre ne fait pas sauter la forme.
- **Bouton « Retourner la forme »** (triangle, lame) ajouté.
- **Couleur claire** : la personne choisit LAQUELLE (8 teintes + sélecteur « Autre couleur »). Couleur du CV et gris inchangés.
- **UNIFORMISATION** : toutes les options sous la vignette deviennent des rangées de petites images (intitulé au survol, nom choisi écrit sous la rangée pour le téléphone). L'interrupteur « Vallonné » disparaît : « Forme de la colonne » = droite / vallonnée / arche. C'est la tâche A1 (un seul mécanisme, deux mécanismes jumeaux fusionnés).
- Ajouter dans le code : réglage à la main = brique commune (un seul composant « glisser et agrandir »), à inscrire dans `BRIQUES_COMMUNES.md`.

## Décisions de Denis, suite 2 (2026-10-20)
- **Plusieurs formes** : jusqu'à 4 par CV (compteur affiché), au lieu de 2.
- **Options impossibles = jamais proposées** (masquées, pas grisées). Chaque modèle déclare ce qu'il sait faire ; source unique à construire à partir du banc de mesure existant (`scripts/word/matrice_options.js`) et de `cvPdfOptionsParModele.js`.
- **Trois boutons sous la vignette : Bandeau, Colonne, Formes**, seulement ceux que le modèle permet. Le choix s'ouvre à côté de l'aperçu (en dessous sur téléphone), en grandes images avec leur nom. Bandeau ET colonne réglables en même temps sur un même CV. Réserve d'audit : aujourd'hui aucun modèle n'offre les deux choix ; à vérifier au banc quels modèles ont les deux éléments (au moins « Colonne et bandeau ») et si le gabarit accepte les deux réglages ensemble.
- **TIRAGE AU SORT (Style rapide, allure Standard)** : toutes ces variétés doivent entrer dans le tirage, en plus du réglage à la main. Point d'appui existant : `window._mepTirageStandardRiche` (`js/app.js`, tâche FAITE le 2026-10-08, essai `tirageStandard`). `[effort : haut]`. Garde-fous : seulement les options compatibles avec le modèle tiré ; formes décoratives tirées en teinte claire, transparence légère, 1 ou 2 formes, jamais sur la photo ; le texte n'est jamais modifié ; annulation en une étape conservée ; essai de 100 tirages (texte intact, une page, lisibilité). À fusionner avec les tâches A1 à A3 (une seule source des options par modèle).

## Décision de Denis, suite 3 (2026-10-20) : le Sobre aussi
- Les modèles **Sobre** reçoivent les formes décoratives, comme les Créatifs, et, quand le modèle le permet, les mêmes options **Bandeau** et **Colonne**, présentées de la même façon. La différence avec le Créatif ne se joue que dans les COULEURS (teintes diluées, pâles). Principe : ne pas restreindre la personne, lui donner la possibilité d'ajouter un peu de visuel à un CV sobre.
- Conséquence pour la table : une capacité a trois états, « natif » (présent d'office), « ajoutable » (un réglage le fait apparaître), « non ». Mesuré le 2026-10-20 : la case « Bandeau en en-tête » (`regBandeauEnTete`) fait apparaître un bandeau sur certains modèles qui n'en ont pas (essayé : Colonne foncée, Épuré : oui ; Cartes, Chronologique, Éditorial : non). L'ancienne liste « sans effet » (`cvPdfOptionsParModele.js`) ne suffit donc pas : seule la mesure par modèle fait foi.
- Réserve à dire à Denis : une colonne colorée n'existe pas dans le gabarit de la plupart des modèles Sobre ; en ajouter une est un vrai travail de gabarit, à décider modèle par modèle (audit au banc). Les formes décoratives et le bandeau pâle, eux, sont à portée.

## Avancement du code (2026-10-20)
- [x] `[effort : haut]` A0. Table des capacités par modèle FAITE : mesure au banc (38 modèles), module généré `modules/cv-pdf-html/cvPdfCapacitesModeles.js`, lecteurs, test `tests/capacitesModeles.test.js`, brique B.39. Aucun changement d'affichage. `npm test` 1790 verts. Résultat mesuré : bandeau natif sur 10 Créatif et 1 Sobre (Bandeau pâle), ajoutable sur 11 Créatif et 2 Sobre (Épuré, Fond pâle), ajoutable sur le Standard ; colonne colorée native sur 6 Créatif et 1 Sobre (Chronologique), ajoutable sur 10 Créatif, jamais ajoutable sur les Sobre ni le Standard ; formes de bord proposées aujourd'hui : bandeau sur 3 modèles, colonne sur 5.
- [x] `[effort : haut]` A1 (partie Bandeau et Colonne) FAITE le 2026-10-20 : un seul mécanisme sous la vignette (`js/app.js`, `_MEP_FORMES`), bouton « Bandeau » et/ou « Colonne » seulement pour les modèles qui les permettent (table B.39), tiroir des formes DANS la page, sous la rangée de vignettes (adaptation de la maquette : l'écran réel n'a pas de place à côté de l'aperçu), anciens interrupteur et trois boutons supprimés, essais `bordColonne` et `bordBandeau` réécrits et verts, `npm test` 1790 verts. Aucune forme nouvelle (pointe, arche) : elles demandent le moteur de rendu.
- [x] `[effort : haut]` A1b moteur, partie Créatif FAITE le 2026-10-20 : forme de bandeau « en pointe » (même mécanisme que le vallonné, découpe `polyHaut`) ; « arche » pour les colonnes pleine hauteur (`colonneArche`, classe `col-arche`, découpe de la zone de la colonne ; jamais avec un bandeau coloré, jamais à la carte) ; choix de bord de bandeau ouvert aux modèles à colonne (recette `bordBandeauChoix`, valeur de départ = leur rendu d'avant) ; bouton « Bandeau » ET bouton « Colonne » sur un même modèle, réglages cumulables (« Colonne et bandeau » : pointe + vallonnée) ; « Aucun » pour les modèles dont le bandeau s'ajoute ; l'arche n'est pas proposée avec un bandeau, un bandeau choisi remplace l'arche (avec une phrase qui le dit). Miniatures de TOUS les états voulus (un fichier par combinaison : `.b-pointe`, `.c-arche`, `.b-pointe.c-vallonne`) fabriquées par le banc, table des capacités mesurée au passage. Banc : registre et miniatures remis à jour d'abord (dérive du 11 octobre, commit `822016ac`) pour que seuls les écarts voulus apparaissent.
- [ ] A1c Sobre : bandeau (Épuré, Fond pâle : ajoutable ; Bandeau pâle : natif) et formes de bord pour les modèles Sobre, couleurs diluées. Les gabarits Sobre sont propres : à auditer avant.
- [x] `[effort : haut]` A2 FAIT le 2026-10-20 : calque de formes décoratives pour TOUS les modèles (brique B.40) ; bouton « Formes » sous chaque vignette Créatif et Sobre, bloc en Standard ; 13 formes dont ovale, pilule, rectangle arrondi, losange, hexagone, points, hachures (demande de Denis du soir) ; zone « Autour du métier » (une ovale entoure le titre) ; 7 formes au plus, disposées sans s'empiler ; placement libre et taille à la main sur l'aperçu (déplacer, tirer le coin, étirer les ovales) ; couleur claire au choix ; annulable ; ignoré du Word avec message.
- [ ] A1c (bandeau pour les 8 modèles à bandeau standard, arrondis des cartes, épaisseur du bandeau et largeur de la colonne à la main), modèles à bandeau propre un par un, modèles neufs, style aléatoire (voir plus haut).

## Décisions de Denis, suite 4 (2026-10-20, fin de séance)
- **Règle obligatoire** : dès qu'un CV a un bandeau ou une colonne identifiés par une couleur, on peut CHOISIR la forme du bandeau et la forme de la colonne (même pour les modèles « figés » dont on a repris le dessin : coins arrondis possibles ? à étudier modèle par modèle).
- **Réglage manuel, à la main seulement** : largeur de la colonne (le curseur « Largeur de la colonne » 30 à 70 % existe déjà dans la carte « Organisation du CV », à rendre visible avec le tiroir « Colonne ») et « largeur » du bandeau (lecture à confirmer : épaisseur / hauteur du bandeau ; un réglage « En-tête agrandi » existe peut-être déjà). Valeurs standard au départ, jamais modifiées d'office.
- **Formes décoratives pour TOUS les modèles**, y compris ceux sans bandeau ni colonne (Frise, Rectangles, Photo et frise, tous les Sobre sauf bandeau...), 1 à 4 formes. Le calque s'ajoute à la page du CV, indépendamment du gabarit.
- **Style aléatoire du Standard, À LA FIN** (après les modèles) : formes de bandeau, formes de colonne, nombre et choix des figures ; les figures sont DISPOSÉES sur le CV sans se chevaucher (zones, distance minimale, jamais sur la photo ni le nom) ; si la personne aime le tirage, elle règle ensuite taille, couleur, place de chaque figure, et le bandeau et la colonne, à la main. À concevoir ensemble avant de coder.
- **Audit de départ (table des capacités du 2026-10-20)** : bandeau natif sans choix de forme : bandeauVertical, diagonalesContrastees, medaillon, mqDiagonale, rubanDiagonal, triangleSavoir, Sobre « Bandeau pâle » ; bandeau ajoutable sans choix : cadreBarre, losangeVert, mqCadre, mqPicto, pastille, Sobre Épuré et Fond pâle, Standard ; colonne native sans choix : colonneClaire (carte), mqColonne, Sobre Chronologique ; colonne ajoutable sans choix : 10 modèles Créatif ; ni bandeau ni colonne : frise, friseFoncee, photoFrise, rectangles et 8 Sobre.

## Décisions et constats, suite de la séance A2 (2026-10-20)
- **Boutons du panneau des formes** : mêmes aspects que les autres boutons du panneau (rectangle aux coins arrondis, bordure d'accent), y compris en mode « boutons plus grands » (aucun texte sous 14 px). **« Ajouter une forme » en haut à droite**, sur la rangée des onglets « Forme 1, Forme 2... » ; « Retourner la forme » et « Retirer cette forme » restent en bas.
- **Aucune phrase d'explication d'incompatibilité** (demande de Denis) : l'arche choisie fait sauter le bandeau, un bandeau choisi fait sauter l'arche, avec un bandeau l'arche n'est pas proposée. Jamais de message sur le CV ni de contenu qui disparaît. À demander à Denis : la phrase qu'il a vue sur le CV (texte exact) si elle revient ; rien de tel dans le moteur de rendu (recherché).
- **Constat de mesure** : « Colonne et frise », « Colonne foncée et frise », « Photo et frise » (`.fr-lat`, `.ph-lat`) et « Rectangles arrondis » (`.rc-col`) ont bien une colonne, que la table des capacités ne voyait pas (« non » à tort). Détection corrigée dans `scripts/rendu/banc.js` ; la table sera régénérée à la prochaine passe du banc. Ces modèles à structure propre (avec les bandeaux propres) relèvent de l'évaluation modèle par modèle avec maquette à part.
- **Question de Denis** : formes supplémentaires. Ovale, pilule, rectangle arrondi, losange, hexagone, points, hachures ajoutés (13 formes) et zone « Autour du métier ». Pistes encore : vague, arc, croissant, cadre fin, cercles concentriques, filet épais.
- **IDÉE DE DENIS À CADRER AVANT TOUT CODE (A3)** : sortir les réglages des vignettes et les poser sur l'aperçu du CV : le bandeau en haut, la colonne sur le côté, les formes en bas, pour le modèle en cours seulement. Avis de Claude donné dans le chat : favorable (un seul endroit pour tous les modèles, Standard compris ; supprime les souhaits par modèle et les miniatures de variantes ; accueille naturellement les poignées de largeur de colonne et d'épaisseur de bandeau) ; point d'attention : la place à côté de l'aperçu, d'où une maquette à 1200, 738 et 375 px avant de coder. `[effort : haut]`.
- **Jusqu'à SEPT formes** (demande de Denis, 2026-10-20) : une forme par rubrique ou par passage si la personne le veut. Le style aléatoire n'en tirera jamais autant (1 à 3, à décider ensemble). Sept formes ajoutées successivement tombent dans sept zones différentes, avec sept formes différentes.
- **Petite croix** en haut à droite de chaque onglet « Forme n » : retire la forme d'un clic (même geste que « Retirer cette forme »).
