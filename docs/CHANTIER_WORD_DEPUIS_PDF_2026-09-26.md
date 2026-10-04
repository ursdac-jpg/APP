# Chantier : le CV en Word repris depuis le PDF (ouvert le 2026-09-26)

> **CAHIER DE CHANTIER = contrat à figer avec Denis.** À lire en premier, avant tout code Word, y compris après une compression de conversation ou sur l'autre compte Claude.
> **Statut au 2026-09-26** : inventaire fait, plan rédigé, **aucun code de l'application écrit**. Le chantier démarre à la phase 0 après les réponses de Denis aux décisions D1, D2, D5 et D10 (§ 3).
> **Inventaire de référence** : `docs/INVENTAIRE_WORD_ET_PDF_2026-09-26.md` (Word actuel, PDF source de vérité, essais de faisabilité réalisés).
> **Mode de travail** : A pour les décisions de fond (Denis valide) ; ensuite exécution en autonomie par phases, avec **jalons d'arrêt** fixés au § 9.
> **Décision de Denis (2026-09-26)** : le PDF est la source de vérité. Rien du Word actuel n'est conservé « pour lui-même ». On reprend du PDF les conditions, la logique, le design, le style, les proportions et un maximum de fonctions. Les modèles A5 (Word compris) sont hors de ce chantier : chantier à part, plus tard.

---

## 1. Objectif et définition de « fini »

**Objectif** : la personne règle son CV **une seule fois**, dans le panneau de mise en page (le même que pour le PDF), et peut ensuite **télécharger le CV en Word** avec le **même design, le même style, les mêmes proportions** que ce qu'elle voit, en texte réellement modifiable dans Word, lisible par les logiciels de recrutement.

**« Fini » (critères mesurables, tous requis)** :

1. Pour **chacun des 25 modèles**, sur **au moins 5 dossiers d'essai** (voir § 8.2) : le fichier s'ouvre dans Word sans message de réparation ; le nombre de pages est **identique** à celui du PDF.
2. **Position du texte** : pour chaque mot, écart horizontal et vertical avec le navigateur : **médiane sous 1 mm, 95 % des mots sous 3 mm**. Aucun mot coupé, aucune ligne de texte cachée par un décor.
3. **Décors** (fonds, bandeaux, diagonales, vagues, cadres, colonnes) : écart de position et de taille **sous 1 mm** ; couleurs **identiques** (même valeur hexadécimale).
4. **Aucun texte** dans une zone de texte ou une forme ; ordre de lecture logique (test automatique : nom, coordonnées, titre, rubriques dans l'ordre attendu).
5. **Réglages** : chaque réglage du panneau qui change le PDF change aussi le Word, **ou** est grisé avec sa raison (règle « aucun bouton mort », comme pour le PDF). Matrice de contrôle automatique (§ 8.3).
6. **Denis valide visuellement** les 25 images (Word contre PDF), famille par famille.
7. `npm test` entièrement vert ; test navigateur fait ; documents à jour.

---

## 2. Règles de travail figées

1. **Le PDF ne bouge pas.** Ce chantier ne modifie pas le rendu du PDF. Il ajoute au plus des **hooks neutres** (une fonction d'export, des attributs `data-*` qui ne changent rien au rendu), jamais un changement d'apparence. Tout hook est listé et justifié dans le commit.
2. **Une seule source de vérité** : le Word est extrait du **rendu final du PDF**. On ne recode pas la logique de mise en page (colonnes, ajustements, positions libres) une seconde fois. Toute nouvelle option du PDF doit fonctionner en Word **sans code propre** dès que la construction est déjà couverte.
3. **Le texte reste du vrai texte** (paragraphes, tableaux, cadres de paragraphe). Les formes sont du décor sans texte.
4. **Vérité par la mesure** : rien n'est déclaré « fidèle » sans avoir été mesuré sur le banc d'essai (Word piloté).
5. **Zéro régression des autres documents** : la lettre et l'entretien en Word gardent leur moteur actuel jusqu'à un chantier dédié. Les fichiers partagés (§ 10.2) ne sont supprimés qu'après `grep` du dépôt entier.
6. **Pas de suppression de l'ancien Word tant que le nouveau n'est pas validé par Denis.** Le nouveau Word est construit **en parallèle** derrière un interrupteur interne ; on bascule ; on supprime ensuite (§ 10).
7. **Un commit par sous-étape**, `npm test` vert et test navigateur avant la suivante, chemins de fichiers explicites (jamais `git add -A` : deux comptes travaillent).
8. **Français impeccable**, jamais de tiret cadratin, jamais le mot « IA » visible, pas d'icône avec visage, mode sombre pour toute variable de couleur de l'interface.
9. **Jamais de mode tunnel** : si une difficulté majeure apparaît (§ 9), arrêt et remontée à Denis avant de continuer.
10. **Une défaillance trouvée en chemin se corrige dans le même passage** (règle du 2026-09-12), sauf choix de Denis à trancher.

---

## 3. Décisions à trancher avec Denis (avec recommandation)

Format demandé par Denis : une recommandation, puis bénéfices et risques de **chaque** option.

### D1 (bloquante) : où la personne règle-t-elle son CV Word ?

- **Option A (recommandée) : un seul écran de réglages, Word et PDF en sortie.** Le choix « Word ou PDF » de l'écran de départ disparaît ; la personne règle son CV, puis choisit **le format à l'export** (Word, PDF, texte, JSON).
  - Bénéfices : une seule interface à maintenir ; tout nouveau réglage du PDF profite au Word ; plus de contradiction « Word : moins de liberté / PDF : plus de liberté » ; la personne peut télécharger les deux avec le même design.
  - Risques : il faut réécrire l'écran de choix et l'export (`js/app.js`, zone très sollicitée) ; les sessions enregistrées avec « Word » choisi doivent être migrées sans perte.
- **Option B : garder les deux onglets, mais l'onglet Word affiche le même panneau que le PDF.**
  - Bénéfices : changement d'écran plus léger.
  - Risques : deux onglets qui font la même chose, confusion pour un public en fragilité numérique, double maintenance du texte.
- **Option C : garder l'onglet Word actuel avec son panneau, et lui ajouter les modèles du PDF.**
  - Bénéfices : aucun changement d'écran.
  - Risques : contraire à la décision de Denis (rien de l'existant n'est conservé) ; double logique de réglages, exactement ce qu'on veut supprimer.

### D2 (bloquante) : quel aperçu montrer pour le Word ?

- **Option A (recommandée) : l'aperçu HTML du CV (identique au PDF), avec la phrase « Le fichier Word aura le même aspect ; de très légères différences peuvent apparaître selon votre ordinateur ».**
  - Bénéfices : fidèle au design choisi, rapide, déjà construit ; aucune bibliothèque tierce.
  - Risques : ce n'est pas le fichier Word lui-même ; un écart éventuel n'est vu qu'à l'ouverture.
- **Option B : garder l'aperçu par `docx-preview` (bibliothèque tierce).**
  - Bénéfices : montre bien un rendu du .docx.
  - Risques : cette bibliothèque dessine mal les formes (diagonales, vagues, arrondis) : elle montrerait un Word **plus laid** que le vrai, ce qui décourage la personne à tort.
- **Option C : les deux (aperçu HTML par défaut, bouton « Voir le fichier Word » en plus).**
  - Bénéfices : transparence totale.
  - Risques : complexité et confusion ; à réserver à plus tard si le besoin se confirme.

### D3 (à trancher en phase 3, avec images) : pastilles arrondies de compétences

Le PDF affiche les compétences dans des pastilles arrondies (fond qui suit le texte). Word ne sait pas faire un fond arrondi qui suit une ligne de texte.

- **Option A (recommandée) : fond rectangulaire sur le texte de chaque compétence** (surlignage coloré sans arrondi), texte modifiable, très stable.
  - Bénéfices : modifiable, robuste, lisible par les ATS.
  - Risques : le « rond » de la pastille est perdu (aspect un peu plus carré) ; à annoncer.
- **Option B : une petite forme arrondie par compétence, texte par-dessus.**
  - Bénéfices : très proche du PDF.
  - Risques : fragile dès que la personne modifie une compétence (la forme ne suit pas) ; dizaines de petites formes à gérer.
- **Option C : une image de tout le bloc.**
  - Bénéfices : identique.
  - Risques : non modifiable, illisible par un ATS : **refusée d'avance** (règle du chantier n° 3).

### D4 (à trancher en phase 6) : textes positionnés librement (en-tête libre, rectangles de compétences)

- **Option A (recommandée) : cadres de paragraphe** (texte du corps, positionné à des coordonnées précises) posés sur des formes décor.
  - Bénéfices : texte lisible par les ATS et modifiable ; position fidèle.
  - Risques : Word peut recaler un cadre si la personne le déplace mal ; à documenter.
- **Option B : zones de texte.**
  - Bénéfices : déplacement facile à la souris.
  - Risques : texte souvent ignoré par les ATS (nom et coordonnées perdus) : refusée.
- **Option C : tableau à cellules dimensionnées.**
  - Bénéfices : très stable.
  - Risques : ne sait pas superposer (trois rectangles qui se chevauchent) : insuffisant seul.

### D5 (bloquante) : le Mini CV A5 en Word pendant ce chantier

- **Option A (recommandée) : le Word A5 reste sur l'ancien moteur, non touché, jusqu'au chantier A5.** Conséquence : le code de l'ancien Word ne sera pas supprimé entièrement avant ce chantier.
  - Bénéfices : aucun risque pour l'A5 ; on n'avance pas sur deux fronts ; le nouveau moteur s'appliquera à l'A5 ensuite (il extrait le rendu HTML de l'A5 comme celui de l'A4).
  - Risques : deux moteurs cohabitent quelque temps (le nettoyage est en deux temps).
- **Option B : désactiver le Word A5 (grisé avec raison) pendant le chantier.** Bénéfices : nettoyage complet du code. Risques : une fonction disparaît temporairement pour les personnes qui l'utilisent.
- **Option C : traiter aussi l'A5 maintenant.** Bénéfices : un seul moteur. Risques : contraire à la demande de Denis (chantier à part), allonge fortement ce chantier.

### D6 (information) : polices absentes hors de Windows

Accepter que Segoe UI, Garamond, Book Antiqua, Segoe Script soient remplacées sous Mac, Google Docs, téléphone. **Recommandation** : l'accepter, le dire dans un message de l'export, proposer les polices sûres (Arial, Calibri, Times New Roman, Georgia, Verdana) quand la personne prévoit d'envoyer le CV à un tiers. Intégrer les polices dans le fichier est **écarté** (droits d'usage des polices).

### D7 (organisation) : ordre de livraison des modèles

**Recommandation** : par **familles**, avec un jalon Denis (images Word contre PDF) après chaque famille : (1) Standard et Sobre à une colonne ; (2) bandeaux et diagonales ; (3) colonnes colorées et vagues ; (4) frises et photo ; (5) rectangles arrondis ; (6) formes spéciales (médaillon, losange, nom vertical, triangle, cadre).

### D8 (fin de chantier) : moment de la suppression de l'ancien Word

**Recommandation** : uniquement après validation des 25 modèles par Denis **et** une semaine d'usage sans anomalie, en deux temps (§ 10).

### D9 (fin de chantier) : repli `html-docx.js` en cas d'échec

**Recommandation** : le retirer pour le CV (il produirait un Word très différent du design choisi) ; à la place, un message clair « le Word n'a pas pu être produit, téléchargez le PDF » + trace d'erreur. Il reste utile à la lettre et à l'entretien.

### D10 (bloquante) : rythme d'autonomie

**Recommandation** : exécution autonome par phases ; **arrêt obligatoire** aux jalons listés au § 9 (fin de phase 0, après chaque famille, fin de phase 8, avant toute suppression) ; à chaque arrêt, un compte rendu court avec images.

---

## 4. Architecture retenue

### 4.1 Principe

**On ne recode pas le design : on le lit dans le rendu final du PDF et on l'écrit en Word.**

```
Panneau de réglages (état unique : dossier.pdfReglages, _cvPdfChoixMq, dossier.reglagesMiseEnPageCV)
      |
      v
[1] Rendu caché : la même page interactive du PDF, dans une iframe invisible de 794 px,
    laissée se rendre complètement (polices chargées, images décodées, ajustements faits)
      |
      v
[2] EXTRACTEUR (navigateur seulement) : parcourt le DOM final, lit positions et styles
    calculés, produit un PLAN DE PAGE (objet JSON versionné, sans DOM)
      |
      v
[3] ÉCRIVAIN (pur, testé sous Node) : PLAN -> fichier .docx (XML écrit à la main + JSZip)
      |
      v
[4] Téléchargement / envoi par mail (même interface que l'export actuel : un Blob et un nom de fichier)
```

Pourquoi ce choix, contre deux alternatives :

| Alternative | Pourquoi écartée |
|---|---|
| **Générateur Word par modèle** (25 constructeurs, comme le Word actuel) | Recopie en double la logique du PDF ; dérive garantie à chaque évolution ; contraire à « une seule source de vérité » ; effort énorme |
| **Refonte du PDF en « modèle de document » commun aux deux formats** | Touche le PDF stabilisé (risque de régression sur 25 modèles et ~100 réglages) ; réservée à un futur éventuel |

**Le choix retenu** : coût d'entrée plus élevé (un extracteur générique et un écrivain), puis **coût marginal presque nul** pour chaque nouveau modèle ou réglage du PDF.

### 4.2 Modules à créer (nouveau dossier `modules/cv-word/`)

| Fichier | Rôle | Testable sous Node |
|---|---|---|
| `wordUnites.js` | pixels <-> twips / EMU / points, arrondis en **demi-points étalonnés par police** | oui |
| `wordCouleurs.js` | lecture d'une couleur CSS (`rgb()`, `#hex`, `color(srgb ...)`), hex, luminance, contraste ; résolution des `color-mix` par le navigateur (canvas) | oui (partie pure) |
| `wordPlan.js` | définition du **plan de page** (schéma, valeurs par défaut) + `validerPlan()` | oui |
| `wordXml.js` | fabrique de XML : paragraphe, texte, tableau, cellule, cadre de paragraphe, forme (rectangle, rectangle arrondi, ellipse, polygone), image, section, en-tête | oui |
| `wordPaquet.js` | assemble le .docx (JSZip) : contenu, styles, numérotation, paramètres, polices, en-tête (décor répété), médias, propriétés | oui |
| `wordExtracteur.js` | **DOM final -> plan** | non (a besoin d'une mise en page réelle) : test navigateur |
| `wordExport.js` | orchestration : iframe cachée, attente, extraction, écriture, Blob, erreurs | non : test navigateur |

Tests Node à créer : `tests/wordUnites.test.js`, `wordCouleurs.test.js`, `wordXml.test.js`, `wordPaquet.test.js`, `wordPlan.test.js`, `wordAtsInvariants.test.js` (aucun texte en forme, ordre de lecture) ; **plans figés** (fixtures) dans `tests/fixtures/cv-word/`.

Outils de développement (non livrés, dans `scripts/word/`) :
- `convertir-word-pdf.ps1` : pilote Word (instance **séparée**, invisible, minuteur de sécurité 45 s, jamais de fermeture d'une instance existante ; convertit en PDF ; mesure pages et **positions de chaque mot** via l'objet Word) ;
- `pdf-vers-png.ps1` : image d'une page de PDF (API Windows) ;
- `comparer.js` : compare le plan (positions du navigateur) et les positions Word, produit médiane, 95e centile, mots manquants, pages ;
- `balayage-modeles.js` (navigateur) : parcourt 25 modèles x dossiers d'essai, produit plan + réglages ;
- `etalonnage-polices.js` : calibre l'arrondi en demi-points et le facteur de largeur par police.

### 4.3 Le plan de page (schéma de principe)

```
Plan {
  version, dossierEssai?,
  page:   { largeurPx, hauteurPx, margesPx:{haut,bas,gauche,droite}, fondCouleur },
  polices:[ { famille, repli } ],
  decorsPage:[ Forme ],          // répétés sur chaque page (colonne pleine hauteur, cadre, filet, bandeau vertical)
  decorsPremierePage:[ Forme ],  // en-tête décoré : uniquement page 1
  flux:[ Bloc ]                  // Paragraphe | Tableau | Saut
}
Forme    { genre:'rect'|'rectArrondi'|'ellipse'|'polygone'|'ligne'|'image',
           x,y,l,h (px, repère page), rayon?, points?,
           remplissage:{ genre:'uni'|'degrade', couleurs:[], angle }|null,
           contour:{ couleur, epaisseurPx }|null, ordreZ, ancrage:'page'|'paragraphe' }
Paragraphe { style, runs:[Run], alignement, retraits, espacements, interligneExactPt,
             bordures, ombrage, tabulations:[{pos,genre,meneur}], puce?, cadre?:{x,y,l,h},
             garderAvecSuivant, nePasSeparer }
Run      { texte, police, tailleDemiPts, gras, italique, souligne, couleur, ombrage,
           capitales, espacementCaracteres, position, image?:{...} }
Tableau  { largeursTwips, lignes:[{ hauteurTwips, regle:'exacte'|'auMoins', cellules:[
             { largeur, blocs, marges, ombrage, bordures, alignementVertical, directionTexte } ]}] }
```

Le plan est **le contrat** entre l'extracteur (navigateur) et l'écrivain (pur). On peut donc tester l'écrivain sans navigateur et l'extracteur sans Word.

### 4.4 Règles de l'extracteur (géométrie d'abord, pas de dépendance aux noms de classes)

Principe : **lire la géométrie réelle**, pas recalculer le CSS. Un nouveau modèle du PDF est ainsi couvert sans code Word tant qu'il n'introduit pas de construction nouvelle.

1. **Préparation** : iframe cachée (794 px de large), attendre `document.fonts.ready`, décodage des images, fin du rafraîchissement du PDF ; désactiver tout ce qui est outil d'édition (poignées, boutons de contrôle, contours) ; lire la page `.page-a4.cv` (210 x 297 mm).
2. **Décors** : tout élément qui a un fond non transparent, un dégradé, une bordure, un rayon d'angle, un `clip-path` ou un pseudo-élément décoratif vide devient une **forme** (rectangle, arrondi, polygone, ellipse, ligne) à la position mesurée. Couleurs lues dans les valeurs **calculées** (donc `var()` et `color-mix()` déjà résolus). Contenu de l'élément : traité à part (les enfants continuent d'être parcourus pour le texte).
3. **Texte** : chaque bloc de texte devient un **paragraphe** ; les enfants en ligne deviennent des **runs** (police, taille, gras, italique, souligné, couleur, capitales, espacement des caractères, fond). Taille : valeur calculée x facteurs `zoom` cumulés, convertie en demi-points selon l'étalonnage de la police.
4. **Structure par la géométrie** : des enfants placés côte à côte (rectangles qui se chevauchent verticalement sans se recouvrir horizontalement) forment un **tableau sans bordure** dont les largeurs sont les largeurs mesurées ; des enfants empilés forment des paragraphes successifs.
5. **Espacements mesurés** : espace avant / après d'un paragraphe = écart mesuré avec le précédent ; interligne **exact** = hauteur de ligne mesurée (Word et navigateur auront le même pas vertical).
6. **Lignes « poste ..... dates »** (flex, espace entre) : un paragraphe avec **tabulation à droite** à la largeur de la colonne.
7. **Listes** : puces (`::before`, `list-style`) en caractères, ou numérotation Word avec retrait suspendu.
8. **Colonnes CSS (`column-count`)** : tableau d'une ligne, deux cellules équilibrées d'après les positions mesurées des éléments.
9. **Éléments à position absolue** (en-tête libre, médaillon) : **cadre de paragraphe** ou forme ancrée à la page.
10. **Images** : photo recadrée / ronde / losange / anneau -> PNG produit par un canvas (masque compris) ; icônes SVG -> PNG ; texte alternatif renseigné (décors marqués « décoratif »).
11. **Texte vertical** (bandeau vertical) : cellule de tableau à direction de texte verticale.
12. **Pastilles** : selon D3.
13. **Pages** : la première page reçoit le décor d'en-tête ; les décors « pleine hauteur » sont dans l'en-tête de section (répétés) ; Word paginera lui-même le flux (A4 complet).
14. **Interdits** : aucun texte dans une forme ; aucune zone de texte ; aucun caractère décoratif lu à tort par un ATS (les puces décoratives sont des puces de liste ou des formes, pas du texte parasite).

### 4.5 L'écrivain (règles)

- XML Word **écrit à la main** (pas de bibliothèque `docx.js` pour le CV) : les essais du 2026-09-26 ont montré que ses formes produisent un XML refusé par Word.
- **Formes « directes »** (sans balise de compatibilité `mc:AlternateContent`, qui a bloqué Word lors de l'essai).
- Document : langue **fr-FR**, titre et auteur renseignés, styles nommés (Normal, Titre 1 pour les rubriques, ce qui donne un **volet de navigation** et aide les logiciels de lecture), marges de section = marges du CV.
- Polices : famille + repli déclarés (table de polices).
- Un seul fichier compressé, sans dépendance réseau.
- Nom du fichier : conserver `cv.docx` (ou `cv-prenom-nom.docx` : question mineure, à trancher en phase 8).

### 4.6 Points d'accroche dans l'application (phase 8 seulement)

- `genererBlobDocumentActif('cv')` (`js/app.js` ~28171) : le CV appelle `exporterCvWord()` ; lettre et entretien inchangés (séparés dans la même fonction).
- Écran « Finaliser mon CV » (atelier) et page Résultats : selon D1.
- Bouton « Télécharger le Word » et « Envoyer par mail » : même contrat (Blob + nom).
- Sessions enregistrées : lecture de `ongletApercu === 'word'` et de `reglagesProjetXXL` sans erreur ; migration vers l'état unique.
- Textes de l'interface à corriger : `js/app.js` 16120, 26122, 26126 (cartes Word / PDF), 17098 (« Dégradé : un effet que Word ne sait pas faire »).

---

## 5. Plan par phases

Convention : chaque phase donne **objectif, travaux, fichiers touchés, livrables, critères de sortie, jalon**. Estimation en « séances » (une séance = un travail d'une session complète) ; **incertitude annoncée** : les phases 3 à 6 dépendent de ce que le banc d'essai révélera.

### Phase 0 : décisions, banc d'essai, images de référence (1 à 2 séances)

Objectif : pouvoir **mesurer** avant de construire.

Travaux :
0.1 Obtenir les réponses de Denis à D1, D2, D5, D10.
0.2 Créer `scripts/word/` (pilotage de Word avec minuteur et instance séparée, PDF -> image, comparaison, mesure de positions de mots par l'objet Word) ; documenter l'usage.
0.3 Créer 5 **dossiers d'essai** (`tests/fixtures/cv-word/`) : (1) Camille Martin (dossier de démonstration actuel), (2) CV court sans photo, (3) CV long (8 expériences, A4 complet), (4) avec photo, (5) cas limites (mots très longs, caractères spéciaux, sans accroche).
0.4 Prendre les **images de référence** du PDF pour les 25 modèles x dossier 1 (captures de l'aperçu caché, stockées hors dépôt ou dans `docs/images_chantiers/word/`).
0.5 **Étalonnage des polices** : pour les 11 polices, table de calibrage (arrondi en demi-points, facteur de largeur) par comparaison de sauts de ligne Word contre navigateur sur un corpus de textes ; commit de la table.
0.6 **Spike vertical (jetable ou conservé)** : plan écrit à la main pour Standard (une colonne) -> écrivain minimal -> Word -> comparaison ; puis Rectangles arrondis (le plus difficile) en plan écrit à la main.

Fichiers touchés : nouveaux seulement (`scripts/word/`, `tests/fixtures/cv-word/`, docs). **Aucun fichier de l'application.**

Critères de sortie (**GO / NO GO** annoncé par Claude, décision finale Denis) :
- pilotage de Word fiable (minuteur vérifié sur un fichier volontairement invalide, aucune instance de Word oubliée en mémoire) ;
- les deux spikes s'ouvrent sans réparation, page = 1, positions dans les seuils du § 1 (ou écart expliqué et borné) ;
- table d'étalonnage produite.

**Jalon 1 (arrêt)** : compte rendu à Denis avec 2 images (Standard, Rectangles arrondis : Word contre PDF) et verdict GO / NO GO.

### Phase 1 : écrivain Word (noyau OOXML) (2 séances)

Objectif : produire un .docx correct et complet à partir d'un plan, testable sans navigateur.

Travaux : `wordUnites.js`, `wordCouleurs.js`, `wordPlan.js` (+ `validerPlan`), `wordXml.js` (paragraphe, run, tableau, cellule, cadre de paragraphe, formes uni / dégradé / arrondi / polygone / ellipse / ligne, images, section, en-tête), `wordPaquet.js` ; tests Node (au moins 60 tests) ; tests d'**invariants ATS** ; 12 plans figés qui s'ouvrent dans Word (banc d'essai).

Fichiers : nouveaux (`modules/cv-word/*`, `tests/word*.test.js`, `tests/fixtures`). `index.html` : **une ligne par fichier chargé** (à faire à la phase 2, pas avant, pour ne pas charger du code inutile).

Critères : `npm test` vert ; tous les plans figés s'ouvrent dans Word sans message ; XML bien formé ; aucun texte en forme.

### Phase 2 : extracteur de base (DOM final -> plan) (2 à 3 séances)

Objectif : produire un plan fidèle pour le modèle Standard, avec photo et icônes.

Travaux : `wordExtracteur.js` (préparation, décors, texte et runs, structure par la géométrie, tabulations, listes, images et icônes, unités calibrées), `wordExport.js` (iframe cachée, attente de stabilité, erreurs, Blob) ; **un hook neutre** dans le PDF si nécessaire pour savoir que le rendu est terminé (à consigner) ; bouton de **test interne** (non visible à la personne : appel en console ou page d'essai) ; `index.html` (deux balises).

Critères : Standard, 1 et 2 colonnes, 5 dossiers : pages identiques, seuils § 1 respectés, rendu visuel validé par Claude sur images ; extraction en moins de 2 s.

### Phase 3 : famille 1, Standard, Sobre, colonnes simples (2 séances)

Modèles : Standard, Sobre (Bandeau pâle, Fond pâle, Épuré), Titres à pictogrammes, Cadre de page.
Nouveautés : fonds pâles (formes / ombrage de cellule), traits, pastilles (**décision D3 prise ici, avec images**), icônes de rubriques et de coordonnées, colonnes du corps, listes sur 2 colonnes, dates à droite / dessous / avant, justification, majuscules.
Critères : 7 modèles x 5 dossiers dans les seuils ; matrice de réglages (§ 8.3) sur ce sous-ensemble.
**Jalon 2 (arrêt)** : images Word / PDF des 7 modèles à Denis.

### Phase 4 : famille 2, bandeaux et diagonales (2 séances)

Modèles : Bandeau entier, Bandeau diagonal, Ruban diagonal, Diagonales contrastées, Vague marine, Triangle du savoir, Duo ovale.
Nouveautés : polygones à dégradé, bord ondulé (37 points), coin, en-tête libre (**décision D4 confirmée**), hauteur d'en-tête mesurée, texte blanc sur fond (contraste).
**Jalon 3 (arrêt)**.

### Phase 5 : famille 3, colonnes colorées, vagues, cadres (2 séances)

Modèles : Colonne colorée, Colonne à vague, Cadre et barre, Pastille, Bandeau vertical.
Nouveautés : colonne pleine hauteur répétée sur chaque page (en-tête de section), colonne à bord ondulé, bordure de page, filet haut, **texte vertical**, pastilles d'expérience « pilule ».
**Jalon 4 (arrêt)**.

### Phase 6 : famille 4 et 5, frises, photo, rectangles arrondis (3 séances, la plus délicate)

Modèles : Colonne et frise, Photo et frise (Créatif et Sobre), Rectangles arrondis (Créatif et Sobre), Médaillon, Losange vert.
Nouveautés : frise (bordure + points), photo ronde / losange / médaillon à cheval sur un bord, **trois rectangles qui se chevauchent** (formes décor + textes en cadres), barres arrondies, losanges, en-tête libre et rectangles déplaçables (**D4**).
**Jalon 5 (arrêt)** : c'est le jalon le plus exposé ; si le Rectangles arrondis n'atteint pas les seuils, options à présenter (simplification du modèle en Word, ou cadre alternatif) avant de continuer.

### Phase 7 : couverture des réglages et robustesse (2 séances)

Travaux : **matrice de réglages** automatisée (chaque réglage x quelques modèles : le Word change comme le PDF, ou grisé avec raison), formats A4 complet (plusieurs pages, coupures, orphelines, décors répétés), A4 essentiel, polices (11), tailles extrêmes, textes longs, aucun contenu (rubriques vides), caractères spéciaux, photo absente ; **marge de sécurité** en bas de page et règle de repli quand Word dépasse (décision annoncée à Denis : tailles réduites d'un demi-point ou marge de sécurité, jamais de texte coupé).
Critères : matrice sans « bouton sans effet » non justifié.

### Phase 8 : intégration dans l'application (2 à 3 séances)

Travaux (selon D1 et D2) : écran de choix, export (Word, PDF, texte, JSON), aperçu, messages, textes de l'interface corrigés (dont « Dégradé »), migration des sessions enregistrées, mail, suivi d'événements, gestion d'erreur (message clair + proposition PDF), interrupteur interne ancien / nouveau Word, mode sombre, écran mobile, tests navigateur.
Fichiers touchés : **`js/app.js` (zone très sollicitée : voir § 7)**, `index.html`, `style.css` (variables de couleur avec valeur sombre).
**Jalon 6 (arrêt)** : démonstration à Denis sur son propre dossier, ouverture du fichier dans son Word.

### Phase 9 : validation finale (1 à 2 séances)

Travaux : balayage complet 25 modèles x 5 dossiers x formats ; ouverture dans **Word, LibreOffice** (et lecture de texte type ATS : extraction du texte brut du .docx) ; poids des fichiers ; performances ; accessibilité (langue, titres, textes alternatifs) ; rapport de conformité aux critères du § 1 ; images finales.
**Jalon 7 (arrêt)** : validation de Denis (25 images) et décision D8.

### Phase 10 : nettoyage de l'ancien Word (2 séances, après validation et délai d'usage)

Voir § 10 : suppression en deux temps, après `grep` du dépôt entier, avec mise à jour de `BRIQUES_COMMUNES.md`, `LECONS_A_NE_PAS_REPRODUIRE.md`, `ETAT_DES_CHANTIERS.md`. Retrait des tests devenus sans objet. **Jamais avant le jalon 7.**

**Total indicatif** : 20 à 28 séances. Les phases 3 à 6 peuvent se resserrer si l'extracteur générique fonctionne bien dès la phase 2 (les modèles s'enchaînent alors vite), ou s'allonger si des constructions inattendues apparaissent.

---

## 6. Risques et parades

| # | Risque | Effet concret | Parade |
|---|---|---|---|
| R1 | Word et navigateur n'arrondissent pas pareil (tailles en demi-points, largeurs de texte) | Un CV « sur une page » déborde de quelques millimètres dans Word | Interligne exact mesuré ; arrondi et largeur **étalonnés par police** ; marge de sécurité en bas ; mesure automatique sur le banc d'essai ; jamais de texte coupé |
| R2 | Constructions CSS nouvelles à chaque évolution du PDF | Un nouveau modèle du PDF s'exporte mal en Word | L'extracteur lit la **géométrie** ; test de non-régression par balayage des 25 modèles ; constructions listées à l'inventaire |
| R3 | Formes mal interprétées par LibreOffice, Google Docs, Word mobile | Décor absent ou dégradé chez un correspondant | Le texte reste du vrai texte en ordre logique ; message d'information ; test LibreOffice en phase 9 |
| R4 | Polices absentes hors Windows | Aspect différent chez le destinataire | Repli déclaré ; conseil de polices sûres ; polices non intégrées (droits) |
| R5 | Pastilles arrondies impossibles à l'identique | Aspect un peu plus carré | D3 |
| R6 | Le texte modifié par la personne dans Word déborde d'un décor | Texte qui dépasse d'un rectangle | Hauteurs de sécurité ; documentation dans le message d'export |
| R7 | XML invalide qui bloque ou fait réparer Word | Fichier inutilisable | Invariants testés ; **essai d'ouverture dans Word sur tous les plans figés** ; l'essai du 2026-09-26 a déjà éliminé deux formes fautives |
| R8 | Interférence avec l'autre compte (mêmes fichiers) | Régression silencieuse | § 7 |
| R9 | Le PDF évolue pendant le chantier | Le Word suit, mais les images de référence changent | Images de référence refaites à chaque jalon ; le PDF est la vérité |
| R10 | Temps d'export | Attente pour la personne | Extraction cible < 2 s ; indicateur « Préparation du Word... » |
| R11 | Session Word de Denis ouverte pendant les essais | Perte de travail si mal piloté | Instance **séparée** obligatoire ; jamais de fermeture d'une instance existante ; minuteur ; voir l'inventaire § 5 |
| R12 | Migration des sessions enregistrées | Perte de réglages | Lecture tolérante + test de restauration sur une sauvegarde ancienne |

---

## 7. Travailler en parallèle sur l'autre compte (réponse à la question de Denis)

**Oui, c'est possible**, à condition de respecter les règles ci-dessous, parce que la plupart des travaux Word créent **de nouveaux fichiers**.

### 7.1 Zones sans conflit (phases 0 à 7)

Le chantier Word n'écrit que dans : `modules/cv-word/` (nouveau), `scripts/word/` (nouveau), `tests/word*.test.js` et `tests/fixtures/cv-word/` (nouveaux), `docs/*WORD*`, `docs/images_chantiers/word/`. **L'autre compte peut donc travailler librement** sur tout le reste (Veille, Découverte, lettre, entretien, ATS, Bilan...) sans risque pour moi ni pour lui.

### 7.2 Fichiers partagés à surveiller

| Fichier | Quand je le touche | Consigne pour l'autre compte |
|---|---|---|
| `index.html` | Phase 2 (2 lignes), phase 8 | Ajouter ses propres lignes est sans souci ; ne pas réorganiser la liste des scripts |
| `js/app.js` | **Phase 8 et phase 10 seulement** (zones Word listées à l'inventaire § 2.3) | Éviter les zones de l'atelier CV, de `pageResultats` / `construireContenuApercuFinalisation`, `genererBlobDocumentActif` et du panneau `construirePaletteCouleurs` pendant ces deux phases ; **je préviens Denis** avant de les ouvrir |
| `docs/ETAT_DES_CHANTIERS.md`, `docs/BRIQUES_COMMUNES.md` | Fin de chaque phase (petit ajout) | Chacun ajoute sa ligne, sans réécrire l'existant |
| `modules/cv-pdf-html/*`, `modules/cv-composeur/*` (composeurComposition, composeurTheme) | **Lecture seule** pour moi ; quelques hooks neutres possibles en phase 2 | **Si l'autre compte modifie le rendu du PDF, le Word le suit automatiquement** (c'est le but). Prévenir simplement, pour que je refasse les images de référence |
| `style.css` | Phase 8 | Ajouts de variables avec valeur `[data-theme="sombre"]` |

### 7.3 Règles pratiques pour les deux comptes

1. **Commits par chemins explicites** (jamais `git add -A`) ; vérifier ensuite que ses fichiers n'ont pas été remis en arrière (incident déjà vu).
2. **Un seul Word piloté à la fois** : mes essais lancent des instances de Word invisibles ; l'autre compte ne doit pas utiliser Word en automatique en même temps (et Denis : enregistrer ses documents Word avant les phases de test, par précaution).
3. **Serveur de prévisualisation partagé** (port 8123, même dossier) : sans effet sur le contenu ; ne pas l'arrêter.
4. `npm test` est global : si un test de l'autre compte échoue, il le corrige ; si c'est un test Word, c'est à moi.
5. Chaque compte note dans **son** document d'état ce qu'il touche ; passation en fin de session (règle de `CLAUDE.md`).

### 7.4 Point d'attention

Pendant la phase 8, la modification de `js/app.js` (fichier de près de 40 000 lignes) est le seul vrai risque de conflit. Parade : travail par **petites fonctions ajoutées à la fin ou à côté**, commits fréquents, relecture du `git diff` avant chaque commit.

---

## 8. Protocole de vérification (le banc d'essai)

### 8.1 Outils (voir § 4.2)

Word piloté en arrière-plan (instance séparée, minuteur), conversion en PDF, positions de mots lues dans Word, images du PDF, extraction du plan dans le navigateur, comparateur.

### 8.2 Dossiers d'essai

1. **Camille Martin** (démonstration, 6 expériences, 5 langues, 7 logiciels, 3 centres d'intérêt).
2. **Court** : une expérience, pas de photo, pas d'accroche.
3. **Long** : 8 expériences, 10 formations, plusieurs pages en A4 complet.
4. **Avec photo** (portrait, paysage, carré).
5. **Cas limites** : mots très longs, apostrophes et guillemets typographiques, caractères accentués et spéciaux, nom composé long, aucune coordonnée.

### 8.3 Ce que le comparateur mesure

Pour chaque couple (modèle, dossier, jeu de réglages) :
- ouverture réussie (oui / non) ; nombre de pages Word et PDF ;
- écarts horizontal et vertical de chaque mot (médiane, 95e centile, maximum) ; mots manquants ou en trop ;
- écarts de position et de taille des formes ; couleurs ;
- présence de texte dans une forme (doit être 0) ; ordre de lecture (attendu) ;
- poids du fichier.
Résultat : tableau versionné dans `docs/` (un fichier de rapport par jalon).

**Matrice de réglages** : pour chaque réglage du panneau (liste de l'inventaire § 3.4), on le change sur 3 modèles représentatifs et on vérifie : le PDF change ; le Word change dans le même sens ; sinon le contrôle est grisé avec raison.

### 8.4 Validation par Denis

À chaque jalon : images Word et PDF côte à côte (mêmes dimensions), liste des écarts constatés et de ce qui est volontairement différent (§ 4.3 de l'inventaire). Denis valide ou demande une correction avant la famille suivante.

---

## 9. Jalons d'arrêt et règles d'autonomie

Arrêt obligatoire et compte rendu (images + écarts + prochaine étape) : fin de phase 0 (jalon 1, verdict GO / NO GO) ; après chaque famille (jalons 2 à 5) ; fin de phase 8 (jalon 6) ; fin de phase 9 (jalon 7) ; **avant toute suppression de code** (phase 10).

Arrêt immédiat, sans attendre un jalon, si : (a) Word refuse d'ouvrir un fichier produit et la cause n'est pas trouvée en une séance ; (b) un modèle n'atteint pas les seuils après deux itérations ; (c) une modification de `js/app.js` risque d'affecter la lettre, l'entretien ou l'A5 ; (d) le PDF doit être modifié autrement que par un hook neutre ; (e) un choix d'interface non prévu apparaît.

En dehors de ces cas : exécution autonome (mode « nuit » possible), avec `npm test` et test navigateur à chaque sous-étape, commits par chemins explicites, passation à jour à chaque fin de séance (`docs/PASSATION_*` du jour).

---

## 10. Suppression de l'ancien Word (phase 10, après validation)

### 10.1 Méthode

Pour chaque fonction ou fichier : `grep` du dépôt entier (jamais un seul fichier), liste des appelants, suppression seulement si zéro appelant restant, `npm test` puis test navigateur des trois usages (CV Word, lettre Word, entretien Word). Un commit par bloc supprimé.

### 10.2 À conserver (usage lettre, entretien, PDF, A5)

`chargerLibrairieDocxNatif` (à déplacer dans un fichier partagé), `PALETTES_COULEURS_CV`, `docx.umd.js`, `docx-preview.js`, `apercuDocxIntegre.js` (branches lettre et entretien), `composeurAppliquerRegroupementExperiences` (à déplacer hors de `composeurMoteur.js`), `composeurResoudreThemeGeneration`, `construireObjetCVPourExport`, `genererBlocsTexteCV`, `formatA5CV.js` et l'ancien Word A5 jusqu'au chantier A5 (**décision D5**).

### 10.3 À supprimer (deux temps)

Temps 1 (après jalon 7 + délai d'usage) : `composeurRender.js` (Word A4), `genererDocxComposeur` (A4), `exportDocxNatifCV_NouveauxModeles.js`, `exportDocxNatifCV_Chic.js`, anciens modèles de `exportDocxNatifCV.js`, recoloration CV de `coloriationDocxNatifCV.js`, branches CV de `apercuDocxIntegre.js`, zones Word de `js/app.js` (§ 2.3 de l'inventaire), `traduireVersEtatWord` et `traduireVersReglagesProjetXXL` si sans appelant, tests Word obsolètes.
Temps 2 (après le chantier A5) : reste du moteur Word A5, `formatA5CV.js`, `miniCvA5.js`, `html-docx.js` si plus utilisé.

### 10.4 Documents à mettre à jour

`docs/BRIQUES_COMMUNES.md` (nouvelle brique « export Word depuis le rendu du PDF », dettes résorbées), `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (leçons du chantier), `docs/ETAT_DES_CHANTIERS.md` (partie 0), `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md` (mention « Word repris depuis le PDF »).

---

## 11. Ce qui est déjà acquis (essais du 2026-09-26)

Voir `docs/INVENTAIRE_WORD_ET_PDF_2026-09-26.md`, § 5. Résumé : pilotage de Word en arrière-plan **fonctionne** ; rectangles arrondis (pleins et à contour), polygone en diagonale avec dégradé derrière le texte **rendus correctement dans le vrai Word** ; la bibliothèque `docx.js` ne convient pas pour les formes (fichier refusé par Word) : **XML écrit à la main** ; deux balises à proscrire (`docx.js` shapes, `mc:AlternateContent` avec `w:pict` vide) ; sauts de ligne Word et navigateur identiques sur 6 cas avec arrondi au demi-point le plus proche.

---

## 12. Questions à Denis (résumé)

**Bloquantes avant la phase 0** : D1 (un seul écran de réglages ?), D2 (aperçu HTML identique au PDF ?), D5 (Word A5 laissé sur l'ancien moteur ?), D10 (rythme d'autonomie et jalons ?).
**Plus tard, avec images** : D3 (pastilles), D4 (textes positionnés), D7 (ordre des familles), D8 (moment de la suppression), D9 (repli `html-docx`), D6 (polices hors Windows, information).

---

## 13. Avancement au 2026-09-27 (travail de nuit)

Détail heure par heure et mesures : `docs/PASSATION_WORD_NUIT_2026-09-27.md`. Résumé :

- **Phases 0, 1, 2 faites** ; familles des phases 3 à 6 **codées et mesurées en provisoire** (les 25 modèles A4 s'ouvrent dans Word sans réparation, mêmes nombres de pages que le PDF, écart de position médian moins de 1,2 mm). Validation sur images par Denis : **pas encore faite**.
- **Phase 7 en partie faite** : matrice de 15 réglages puis de 15 réglages supplémentaires sur Standard (styles de compétences, interlignes, marges, fonds de colonnes, styles de titres, justification, séparateur de colonnes, lieu, missions, listes sur 2 colonnes, espacement des paragraphes, forme des colonnes), scénarios court / sans photo / long / caractères spéciaux : tous bien rendus. Restent : réglages propres à un seul modèle (bandeau et son dégradé, anneau photo, coins arrondis...), à vérifier modèle par modèle.
- **Phase 8 non commencée** (intégration dans `js/app.js`, avec Denis). `modules/cv-word/wordExport.js` (`exporterCvWord`) est prêt et vérifié identique à l'extraction de l'aperçu.
- **Non testé** : LibreOffice (non installé), lecture ATS réelle, Word en ligne.

### Pièges Word constatés (à garder en mémoire)

1. Un tableau dont **toutes** les lignes ont « garder avec le suivant » : la ligne saute entière à la page suivante. Retiré dans les cellules et dans les styles de titre.
2. Une **image en ligne** dans un titre de colonne de tableau fait sauter le corps du tableau : remplacée par un décor ancré.
3. Un **tableau flottant** (`tblpPr`) se place de façon imprévisible près de la marge : abandonné.
4. Word **ignore l'espace avant d'un tableau** : paragraphe vide de la bonne hauteur.
5. La propriété « capitales » **retire les accents** : le texte est mis en majuscules directement.
6. Word mesure le texte 0,2 % plus étroit que le navigateur : un mot à la limite d'une ligne remonte sur la ligne du dessus ; **retrait de 0,8 px à droite** des paragraphes de plusieurs lignes pour garder les coupures du navigateur.
7. Word n'accepte que les **demi-points** pour les tailles : compensation par l'échelle de largeur (`w:w`).
