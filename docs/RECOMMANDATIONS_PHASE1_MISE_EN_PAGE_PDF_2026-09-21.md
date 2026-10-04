# Recommandations de la phase 1 : refonte de « La mise en page » du CV en PDF (2026-09-21, nuit)

> Document de travail préparé pour Denis, **à lire au réveil**. Rien n'est décidé ici : chaque point est une **recommandation** avec ses bénéfices et ses risques. Denis tranche, puis on gèle la maquette et on code. Cahier de référence : `docs/CHANTIER_REFONTE_MISE_EN_PAGE_PDF_2026-09-21.md`. Inventaire : `docs/INVENTAIRE_REGLAGES_MISE_EN_PAGE_PDF_2026-09-21.md`.
> Mode A : aucun code de l'application avant validation de la maquette.

## 0. Ce qui a été fait cette nuit (maquette, commits `685938e` et `76f509e`)

- En-tête libre dans le plein écran (4 blocs, glisser, poignées de largeur et de hauteur, cadre rouge, barre de réglages, flèches de position, remise à zéro, disposition 2 ou 3 colonnes).
- Tri des doublons entre les deux écrans (plein écran : plus de « Style au hasard », « Mise en page », « Pipette »).
- Ligne de fin de page visible sur les deux écrans, masquée à l'impression (dans la maquette).
- Flèches de déplacement des expériences : à gauche, en colonne, elles ne cachent plus les années ; elles apparaissent maintenant aussi sur le modèle « Colonne et frise » (elles n'y apparaissaient jamais).
- Le curseur « Texte » agit aussi sur les pastilles de compétences (elles avaient une taille figée) ; les titres de la frise suivent le curseur « Titres ».
- **Exportation réelle depuis la maquette** : « Enregistrer mon CV en PDF » ouvre maintenant la vraie impression du navigateur (CV seul, A4, sans marge, blocs insécables). Choisir « Enregistrer au format PDF », marges « Aucune », échelle 100 %, sans en-têtes ni pieds de page : c'est le vrai test du nombre de pages. À rejouer sur plusieurs CV avant de croire la ligne pointillée.
- Mesures (CV de M. Doumbouya, 9 expériences) : Automatique = 1 page (1123 px) ; Complet avec 4 missions = 1,29 page ; Complet, texte à 10 px = 1,11 page ; Complet, texte 10 px et marges 8 mm = 1,09 page ; Résumé = 1 page. Le CV d'origine tient sur une page parce qu'il affiche 1 à 2 missions par expérience, pas 4.
- Script de vérification : **75 contrôles, 0 écart** (`docs/VERIFICATION_MAQUETTE_MISE_EN_PAGE_PDF_2026-09-21.js`).

## 1. Les trois niveaux « Simple / Je débute / Je veux tout régler »

**État de la maquette** : ces trois boutons existent en haut du panneau, mais ils ne font qu'ouvrir ou fermer des cartes. Ce sont des contrôles quasi décoratifs, contraires à la règle « chaque contrôle est réellement câblé ».

**Recommandation : option A, un seul écran (la maquette) plus une carte repliée « Réglages avancés ».**

| Option | Bénéfices | Risques |
|---|---|---|
| **A. Un seul écran + carte repliée « Réglages avancés » (Recommandé)** | Une seule interface à écrire, tester et maintenir, identique à la maquette. Rien n'est imposé à la personne : elle ne voit que l'essentiel, et la carte reste fermée. Aucun libellé qui étiquette la personne. Tout réglage existant reste accessible (zéro régression fonctionnelle). | La carte « avancés » peut devenir un fourre-tout : il faut la ranger en 4 groupes (Colonnes et fonds, Couleurs fines, Styles du texte, Rubriques). Un utilisateur habitué aux trois niveaux perd un repère. |
| B. Deux niveaux : « Essentiel » et « Tous les réglages » | Répond au besoin de simplicité et laisse un bouton bien visible pour les experts. | Deux variantes du même écran à maintenir. Le passage d'un niveau à l'autre doit garder les réglages : source de bugs. |
| C. Garder les trois niveaux | Familier pour les personnes qui les connaissent déjà. | Trois écrans à écrire et à tester. « Je débute » étiquette la personne, en contradiction avec la règle « jamais de diagnostic sur la personne ». Les niveaux « débute » et « simple » se ressemblent presque : la différence n'est pas claire. |

**Ce que cela change dans la maquette** : retirer les trois boutons, ajouter la carte « Réglages avancés » (fermée) qui reçoit les fonctions listées au § 3.

## 2. Décisions bloquantes du cahier (§ 5), une par une

### 2.1 Modes de présentation des expériences (Q123, Q90)
La maquette propose trois modes (A chronologique, B compétences puis parcours, C = B avec un bandeau de compétences clés).

| Option | Bénéfices | Risques |
|---|---|---|
| **Deux modes (A et B) + case indépendante « Bandeau de compétences clés » (Recommandé)** | Moins de choix pour le public. Le bandeau devient utilisable avec A comme avec B. Correspond mieux au code, où « Mixte » est en réalité un bandeau. | Il faut modifier la maquette et rejouer la vérification. |
| Trois modes comme la maquette | Rien à changer. | Le mode C est « B plus une décoration » : deux notions mélangées. Un choix de plus pour une personne peu autonome. |

### 2.2 Ordre des rubriques : la maquette ou l'ordre dicté par Denis (C25, C26, Q111)
**Recommandation : garder le style de la maquette et appliquer l'ordre de Denis** (2 colonnes : compétences puis formations à gauche, expériences à droite ; 1 colonne : ordre modifiable par « Personnaliser »).
- Bénéfice : cohérence avec ta règle, ordre jamais tiré au hasard.
- Risque : aucun, l'ordre de la maquette est déjà celui-là par défaut.

### 2.3 Rubriques oubliées (Q92, Q140) : langues, certifications, permis, engagements, photo
**Recommandation :**
- **Permis** (B, CACES, habilitations) : à ajouter, avec les langues et les certifications, dans « Rubriques à afficher ». Pour les métiers de la logistique, du bâtiment et du transport, c'est souvent la première chose regardée.
- **Langues, certifications** : déjà présentes dans la maquette (cases), à garder ; s'affichent seulement s'il y a une donnée.
- **Engagements** : à garder comme rubrique facultative (bénévolat, associations), sans mot « expérience personnelle ».
- **Photo** : ne pas l'encourager (usage français : le CV sans photo est la norme, et la photo peut exposer à une discrimination). L'option existante est **conservée mais décochée par défaut**, rangée dans « Réglages avancés ».
- Risque : oublier une rubrique existante dans l'application. À faire avant le code : vérifier `rubriques` dans `reglagesMiseEnPage.js` (ligne 130) champ par champ.

### 2.4 Couleur : la personne ou le modèle ? (Q143)
**Recommandation : la couleur choisie par la personne l'emporte toujours** (déjà appliqué dans la maquette). Un modèle propose sa couleur de départ seulement si la personne n'a rien choisi.
- Ne pas ajouter l'orange à la palette : la roue « Personnalisée » couvre tout, et le modèle « Colonne et frise » garde son orange de départ.
- Risque : la personne qui choisit du rouge sur un modèle pensé pour l'orange peut obtenir un contraste moins bon. À contrôler par un test de contraste automatique du texte sur le fond (déjà présent : `texteFondColonnes` dérivé de la luminance).

### 2.5 Modèle « Colonne et frise » (Q138, Q139)
**Recommandation : exception assumée à l'ordre de C25, réservée au Créatif, jamais une option générale.**
- Bénéfice : le modèle d'origine de M. Doumbouya est reproduit fidèlement, sans compliquer les autres modèles.
- Risque : c'est le seul modèle où l'en-tête n'est pas libre (il est dans la colonne et le coin coloré). Le message de la maquette l'explique. À dire dans l'aide.

### 2.6 Formations : « Complet » ou « Optimisé » (Q108)
**Recommandation : « Complet » par défaut, « Optimisé » disponible.** « Optimisé » garde les formations les plus utiles pour le poste et masque les autres.
- Risque : masquer une formation à l'insu de la personne. Le compteur « x sur N affichées » doit rester visible (déjà le cas).

### 2.6 bis Compétences comportementales : un vrai équilibre avec les compétences professionnelles (Denis, 2026-09-22, nuit)

Denis a soulevé un point de fond, pas seulement visuel : dans un monde du travail instable, le savoir-être devient un vrai critère d'embauche, au même titre qu'un savoir-faire technique. Sa demande a deux volets bien distincts.

**Volet 1 (hors périmètre maquette, à traiter en phase 3 avec Denis)** : déduire les compétences comportementales de **toute** la vie de la personne (expériences pro, expérience personnelle/bénévolat, centres d'intérêt, engagements, pas seulement les loisirs), et toujours **en fonction du métier visé** (son exemple : le sport fait ressortir la discipline pour un poste à la gendarmerie, mais une autre qualité pour un autre métier). Ça touche `prompts/cv.md`, `deduireCompetences()` et `mappingLoisirsCompetences` dans `js/app.js` : du vrai code d'application et des prompts, à tester comme tous les prompts du projet. **Je ne l'ai pas construit cette nuit** : c'est un choix de méthode qui mérite ta relecture, pas une correction que je peux trancher seul. Noté en détail au cahier, § 3.2 bis.

**Volet 2 (dans le périmètre de cette maquette)** : l'équilibre **visuel** entre les deux rubriques. Constat chiffré : aujourd'hui, « Compétences professionnelles » va de 3 à 11 (défaut 8) et « Compétences comportementales » de 3 à 7 (défaut 5), une vraie asymétrie, qui peut donner un bloc comportemental visiblement plus court à l'écran, contraire à ce que tu demandes.

| Option | Bénéfices | Risques |
|---|---|---|
| **Rapprocher les deux plafonds (ex. comportementales 3 à 9, défaut 6) (Recommandé)** | Corrige l'asymétrie la plus visible (11 vs 7) sans forcer un nombre strictement identique : les compétences pro gardent une petite marge, cohérent avec le fait qu'il y a souvent plus de savoir-faire techniques nommables que de traits de personnalité sincères. | Il faut avoir, dans les vrais dossiers, assez de compétences comportementales crédibles à proposer (dépend du volet 1 ci-dessus) : sans lui, remonter le plafond ne sert à rien si la liste réelle reste courte. |
| Rendre les deux plafonds strictement identiques (3 à 8, ou 3 à 9, les deux) | Message clair : les deux rubriques comptent pareil. | Une compétence comportementale sincère et distincte est plus dure à trouver qu'une compétence technique : forcer le même nombre peut pousser vers des traits génériques ou redondants, contraire à l'exigence de qualité que tu poses. |
| Ne rien changer aux plafonds, agir seulement sur la présentation (même largeur de colonne, même style) | Aucun risque de compétence artificielle. | Ne répond pas vraiment à la demande : si la liste réelle reste courte, le bloc reste visuellement plus petit quoi qu'on fasse à la mise en page. |

**Décidé par Denis le 2026-09-22 : les deux recommandations validées.** Fait : plafond des compétences comportementales relevé de 3-7 (défaut 5) à **3-9 (défaut 6)**, contre 3-11 (défaut 8) pour les professionnelles, un écart bien plus resserré. La liste d'exemple (`COMP`) est passée de 5 à 9 traits (ajout : Rigueur, Ponctualité, Sens de l'organisation, Capacité d'adaptation) pour que le plafond relevé corresponde à un vrai choix, pas une limite jamais atteignable. Vérifié visuellement : les deux colonnes de compétences ont maintenant des hauteurs comparables. Pas de réglage séparé par rubrique (option A confirmée). Script de vérification : 144 contrôles, 0 écart.

### 2.7 Sobre : « aucune couleur » en 2 colonnes (Q144)
**Recommandation : le Sobre reste noir et gris, avec un fond pâle gris neutre sur une colonne** (modèle « Fond pâle », déjà dans la maquette). Aucune couleur d'accent, même si la personne en a choisi une, tant qu'elle est en Sobre.
- Risque : la couleur choisie « ne fait rien » en Sobre. Il faut l'écrire dans l'aide de la carte Couleurs (« En Sobre, le CV reste noir et gris »).

### 2.8 D1 à D8
- D1 (toutes les expériences par défaut, compactage automatique) et D4 (mode A par défaut avec une phrase de conseil) : validées par la maquette.
- D2 (compétences hors sujet : non proposées mais présentes) : validé.
- **À confirmer par toi :** D3 (écran unique « il manque quelques informations », champ « en cours »), D6 (libellé du dé : « Un autre modèle » en Sobre et Créatif, « Style rapide » en Standard), D7 (étiquette neutre du type « Bénévolat associatif », jamais d'employeur inventé), D8 (retour vers l'assistant : correctif rapide sur le parcours CV, puis composant commun). Mes recommandations : **oui aux quatre**.

## 3. Inventaire des 67 réglages : proposition de statut pour les lignes « à statuer »

Le principe : **aucune fonction retirée sans ligne validée**. Trois destinations : « Réglages avancés » (nouvelle carte repliée), « plein écran » (geste direct sur le CV), « dérivé » (calculé, pas de contrôle).

| Réglage | Recommandation | Raison |
|---|---|---|
| `alignement` (gauche / justifié) | Réglages avancés | Utile, mais peu demandé. |
| `espacementParas` + `densite` + « Réduire les espaces » | **Fusionner en une notion « Espacement »** (Serré / Normal / Aéré) | Trois réglages qui disent la même chose. |
| `pages` | Remplacé par le niveau de détail « Automatique » et le bouton « Mise en page » | Déjà dans la maquette. |
| `colonnesInversees`, `largeurColonneGauche` | Retirés du panneau (colonnes figées). **À confirmer** : la poignée de largeur des colonnes existe dans l'application (`.poignee-redim-largeur-colonnes`), on peut la garder dans le plein écran | Décision C14 / C25 et Q95. |
| `formeColonnes`, `degradeColonnes`, `degradeBandeau`, `coinsArrondis` | Portés par les modèles, pas de contrôle | Le style vient du modèle, jamais du hasard. |
| `separateurColonnes`, `separateurCouleur` | Réglages avancés | Rarement utile. |
| `fondColonnes`, `fondColonnesEffet`, `fondColonnePleineHauteur` | Réglages avancés, **pleine hauteur activée par défaut** (colonne jusqu'en bas de page) | Ta demande C30. |
| `couleurFondCompetences`, `couleurTextePuces` | Réglages avancés | Fin du réglage des pastilles. |
| `nuance` | Retiré : la roue de couleurs le remplace | Doublon. |
| `couleurEntrepriseActive` | **À ajouter dans la maquette** : première pastille des couleurs, « Couleur de l'entreprise » quand elle est détectée | Fonction existante, ne pas la perdre. |
| `bandeauDisponibilite` | Réglages avancés | Fonction existante. |
| `dispositionEntete`, `positionLibreEntete`, `largeurAccrocheLibre`, `largeurMetierLibre` | **Fait** : plein écran | Voir § 0. |
| `anneauPhoto` | Réglages avancés, décoché par défaut | Voir § 2.3. |
| `styleTitres` (souligné / bandeau / pastille / sans décor) | Porté par les allures | Le style vient de l'allure. |
| `lectureGuidee` | **À vérifier avant de statuer** (fonction que je n'ai pas relue en détail) | Ne pas décider à l'aveugle. |
| `iconesCoordonnees` | Réglages avancés (à ajouter dans la maquette) | Fonction existante. |
| `styleBordures` | Réglages avancés | Peu utile. |
| `styleProfessionnel` (missions épurées ou condensées) | **À ajouter dans la maquette**, dans la carte des expériences | Fonction existante. |
| `stylePersonnel` | Disparaît avec la fin de « Expérience personnelle » (C7) | Une seule rubrique d'expériences. |
| `bandeauCompetencesCles` | Devient la case « Bandeau de compétences clés » (§ 2.1) | |
| `souligner`, `italique` (par partie) | **À ajouter dans la maquette** : « Style des lignes d'expérience » (souligné, italique, jamais de gras) | Fonction existante (Q136). |
| `accrocheItalique`, `sansAccroche` | Réglages avancés, ou barre du bloc de l'en-tête (italique déjà là) | |
| `lettreJointe` | Hors « mise en page » : à traiter avec l'exportation | |
| `regroupement` | Disparaît avec « Compétences en action » (§ 2.1) | |
| `formatExperiences` (standard / amélioré) | Fusionné avec « Position des dates » et les modes de présentation | Doublon. |
| `blocMisEnAvant`, `blocMisEnAvantGauche`, `blocMisEnAvantDroite` | Remplacés par « Compétences en haut » et « Formations avant expériences » | **À confirmer** : vérifier qu'aucun cas n'est perdu. |

## 4. Fonctions actuelles utiles pour la nouvelle philosophie

À reprendre, dans l'ordre d'utilité pour ton public :

1. **Annuler / Refaire** (`_htmlAnnulerRefaireMiseEnPage`) : absent de la maquette, très important pour une personne qui a peur de « casser » son CV. À ajouter en haut du panneau ET dans le plein écran.
2. **Couleur de l'entreprise** : pastille dédiée quand l'offre en donne une.
3. **Cadre rouge** : repris dans le plein écran (fait).
4. **Sauvegarde des réglages** (`dossier.pdfReglages`) : retrouver sa mise en page à la reprise. À conserver telle quelle.
5. **« Revenir au modèle de départ »** : déjà dans la maquette.
6. **Petite barre par rubrique** (taille, interligne) : reprise. Restent à décider : police par rubrique, couleur des pastilles par rubrique, couleur, gras, italique du nom. Recommandation : garder taille et interligne seulement, le reste va dans « Réglages avancés » ou disparaît.
7. **Glisser les rubriques** : voir la question ouverte du cahier (doublon de « Personnaliser »).
8. **Rétrécissement automatique du texte de l'en-tête** : déjà retiré par décision de Denis (« si ça rétrécit, c'est moi qui décide »). Ne pas le remettre.
9. **Style au hasard** : reste sur l'écran des réglages, limité au style (jamais le contenu ni l'ordre).

## 5. À ajouter dans la maquette avant de la geler

**Avancement (Denis a validé le plan le 2026-09-21, le travail s'est poursuivi en autonomie)** :
- Fait : (1) les trois niveaux sont retirés, la carte « Réglages avancés » (fermée) existe avec trois réglages réellement câblés (texte justifié, trait entre les colonnes, petits carrés des coordonnées) ; (3) pastille « Couleur de l'entreprise » (valeur d'exemple, simulée dans la maquette). Script de vérification : **80 contrôles, 0 écart**.
- Reste : Annuler / Refaire (demande de resynchroniser tout le panneau à chaque retour en arrière : à faire avec soin, pas à la hâte), missions épurées / condensées, style souligné / italique des lignes d'expérience, case « Bandeau de compétences clés », rubriques Permis et Engagements, fond des colonnes dans les avancés, planche des modèles réels.

1. Retirer les boutons Simple / Je débute / Je veux tout régler ; ajouter la carte « Réglages avancés » (fermée).
2. Annuler / Refaire.
3. Couleur de l'entreprise.
4. Missions épurées / condensées ; style souligné / italique des lignes d'expérience.
5. Case « Bandeau de compétences clés » (si tu choisis 2 modes).
6. Rubriques : ajouter Permis et Engagements dans « Rubriques à afficher ».
7. Rejouer le script de vérification (75 contrôles), puis l'étendre à chaque ajout.

## Décisions de Denis (2026-09-22)

Répondu par Denis via question à choix, sauf mention contraire.

1. **Galerie de modèles** : la sélection de 6 + « Un autre modèle » proposée au § 5 bis est validée.
2. **Police unique** : tous les modèles utilisent la police choisie par la personne (Arial par défaut), plus aucune police imposée par un modèle. **Rien à changer dans la maquette** (elle n'a jamais imposé de police par modèle) ; à appliquer au code réel en phase 5 (retirer le champ `police` des 11 recettes `_PDF_CREATIF_RECETTES`).
3. **Les trois niveaux Simple / Je débute / Je veux tout régler** : confirmé retirés, remplacés par un seul écran + la carte « Réglages avancés » (déjà fait, commit `33699f4`).
4. **Modes de présentation** : confirmé 2 modes (A, B) + case indépendante « Bandeau de compétences clés » utilisable avec les deux. **À faire dans la maquette** : remplacer le 3e bouton radio (mode C) par une case à cocher séparée, utilisable avec A ou B.
5. **Rubriques oubliées** : confirmé Permis + Engagements ajoutés, photo décochée par défaut en réglages avancés. **À faire dans la maquette** : ajouter les deux cases dans « Rubriques à afficher ».
6. **Sobre en 2 colonnes** : Denis choisit **un liseré de couleur même en Sobre** (pas mon option recommandée qui l'excluait) : les titres restent soulignés dans la couleur choisie, le trait sous l'en-tête reste coloré, mais jamais de texte ni de fond coloré. **Fait dans la maquette** (`h2` bordure et `.trait` en `var(--cv)`, texte toujours `#20262e`), vérifié navigateur (couleur `#b23a3a` visible sur le soulignement et le trait), 80 contrôles toujours à 0 écart.
7. **D3, D6, D7, D8** : les quatre validés.

**Restent à faire dans la maquette** (points 4 et 5 ci-dessus) avant de la considérer figée pour la phase 1.

## Demandes de Denis pendant l'exécution (2026-09-22, en autonomie)

1. **Bouton « Dégradé »** : au lieu d'un dégradé auto-appliqué sans contrôle, Denis a demandé un bouton dédié, coché par défaut, à côté des couleurs (« ce mode fait vraiment la différence avec le format Word, autant le mettre en avant »). Fait : case « Dégradé » dans la carte Couleurs, activée par défaut, dégradé calculé automatiquement à partir de la couleur choisie (`color-mix`), appliqué au bandeau, à la colonne colorée et au coin de la frise ; masquée en Sobre (jamais de fond coloré, décision du même jour). Texte raccourci à sa demande (« moins de texte explicatif »). Vérifié.
2. **Titre du CV et accroche depuis « Mise en page et texte »** : Denis voulait choisir l'intitulé du CV et la phrase d'accroche (ou aucune) sans retourner à l'écran d'import, à partir des propositions déjà faites par l'assistant. Fait dans la maquette : deux listes déroulantes en haut de la carte « Mise en page et texte » (propositions simulées ; dans l'application réelle, elles viendront de la relecture avec l'assistant, jamais inventées côté mise en page) + case « Sans accroche » qui masque le bloc partout (écran des réglages, plein écran, modèle « Colonne et frise »). **Point à ne pas perdre pour la phase 3** : pour que ce contrôle ait un vrai contenu dans l'application, l'assistant doit fournir **plusieurs** propositions de titre et d'accroche, pas une seule, à ajouter à l'exigence déjà notée en phase 3.8 (« être exigeant avec l'assistant »).
3. **Formations : gras et italique du titre** : Denis a demandé de pouvoir désactiver le gras du diplôme, voire le mettre en italique, **ni l'un ni l'autre par défaut** (revu une 2e fois : le premier jet gardait le gras par défaut, corrigé). Fait : deux boutons (G / I) dans la carte Formations, état actif très visible (fond plein de la couleur d'accent, pas seulement une bordure, sur demande de Denis), s'applique sur les deux écrans et sur la frise, **sans jamais toucher au poste des expériences** (même classe CSS partagée sur la frise, réglé par un style en ligne pour ne cibler que les formations). Vérifié qu'une expérience reste en gras quand ce réglage change.

**Bug corrigé en cours de route** : le séparateur du style « Compétences en texte » affichait un carré vide suivi de « 2 » au lieu d'une puce, à cause d'un octet corrompu introduit par un script Python d'édition (`\2022` interprété comme une séquence octale faute de chaîne brute). Corrigé par remplacement au niveau des octets. Piège noté dans le cahier (§ 7) pour ne pas le reproduire.

4. **Permis B** : Denis a d'abord validé ma recommandation initiale (une rubrique « Permis » comme Langues/Certifications), puis, en répondant à sa propre question, j'ai proposé un autre emplacement plus adapté à un fait unique (avec les coordonnées, comme sur la plupart des CV) : **Denis a choisi cet emplacement**. Fait : le permis rejoint le téléphone, le mail et la ville, aux trois endroits où les coordonnées s'affichent (écran des réglages, frise, plein écran). Les habilitations professionnelles (CACES...) restent dans Certifications, inchangé.

Script de vérification : **101 contrôles, 0 écart** après ces cinq changements.

5. **Fond des colonnes, missions condensées, style des lignes d'expérience** (les 3 ajouts annoncés dans « Réglages avancés », faits dans cet ordre) :
   - **Fond de la colonne** : bouton « Gauche » ajouté à côté d'« Aucun » et « Droite ».
   - **Style des missions** : « Épurées » (une par ligne, comportement d'aujourd'hui) ou « Condensées » (à la suite, séparées par des points-virgules), sur les deux écrans.
   - **Style des lignes d'expérience** : souligné et italique, réglables séparément sur les dates et sur l'entreprise, **jamais sur le poste** (qui reste en gras seul).
   - **Bug réel trouvé par le script de vérification, corrigé** : décocher « Deux colonnes » à la main pendant que le modèle « Colonne et frise » est actif ne mettait pas à jour la valeur mémorisée pour la restaurer en quittant la frise ; en quittant la frise bien plus tard (même après être passé par d'autres modèles), l'ancienne valeur écrasait silencieusement le choix de la personne. Corrigé : le choix manuel devient la nouvelle valeur à restaurer.

Script de vérification : **111 contrôles, 0 écart** après ce lot, stable sur deux passages.

6. **Onglet Format** (Denis, 2026-09-22) : carte « Format », juste après « Réglages avancés », avec deux choix : **A4** (sur une page, le but recherché : « l'idéal c'est faire tenir le CV sur une page », raison d'être du bouton « Mise en page »), et **A4 complet** (sur plusieurs pages, pour la personne qui veut un CV vraiment complet, par exemple à apporter à un 2e entretien). Format A5 (portrait/paysage) **reporté à une 2e vague**, décision de Denis, pour ne pas rouvrir tout le périmètre A5 qu'on avait volontairement mis de côté. Comportement vérifié : en A4 (1 page), rien ne change (comportement d'aujourd'hui) ; en A4 complet, le niveau de détail « Automatique » n'efface plus le contenu en douce pour forcer 1 page (correction faite dans `rendre()`) ; le message change de ton (constat calme, jamais une incitation à réduire). Script de vérification : **114 contrôles, 0 écart**.

7. **Les 2 modèles Créatif manquants** (Denis, 2026-09-22) : « Cadre de page » (bordure fine autour de la feuille, en-tête centré, trait entre les 2 colonnes) et « Titres à pictogrammes » (filet coloré en haut de page, icônes rondes sur les titres de rubrique), inspirés des vrais modèles `cadreBarre` et `pastille` du code. La galerie Créatif compte maintenant ses 6 modèles définitifs, le dé les fait défiler sans répétition. Script de vérification : **119 contrôles, 0 écart**.

## Suite en autonomie pendant la nuit (Denis parti se coucher, 2026-09-22)

8. **« Colonne et frise » a maintenant un en-tête libre, comme tous les autres modèles** (Denis : « je veux donner la possibilité de tout bouger même pour ce modèle »). Fait : les 4 blocs (nom, coordonnées, titre, accroche) deviennent déplaçables/redimensionnables exactement comme ailleurs ; les coordonnées, jusque-là fixes dans la colonne latérale, en sortent pour rejoindre le bloc libre dès que la personne touche l'en-tête (jamais en double), et y reviennent tant qu'elle n'y touche pas. Le reste de la colonne latérale (Atouts, Informatique, Langues, Certifications, Centres d'intérêt) est inchangé.

9. **Cohérence colonnes / modèles, bug réel trouvé par Denis en regardant la maquette** : « Colonne colorée » et « Colonne et frise » n'existent que PAR leur colonne colorée ; en 1 colonne, ils la perdaient silencieusement, sans rien pour la remplacer (contrairement à « Fond pâle » du Sobre, qui a un vrai repli en 1 colonne). Corrigé à la source, pas juste caché : ces deux modèles ne sont plus jamais proposés dans la galerie quand la personne est en 1 colonne (la galerie affiche 4 modèles en 1 colonne, 6 en 2 colonnes, avec une phrase qui l'explique) ; les choisir bascule automatiquement en 2 colonnes (mécanisme déjà écrit pour la frise, généralisé aux deux) ; et si la personne décoche « Deux colonnes » alors que l'un des deux est actif, la maquette bascule proprement vers « Bandeau entier » avec un message qui explique pourquoi, plutôt que de laisser le CV perdre sa couleur sans un mot.

Script de vérification : **126 contrôles, 0 écart**, stable sur deux passages.

10. **Bug réel trouvé par Denis en testant l'en-tête libre de la frise, corrigé** : le bloc libre n'avait pas la classe `tete` (seulement `libre`), donc tout le mécanisme qui en dépend (glisser à la souris, recalcul automatique de la hauteur) était silencieusement inactif ; les 4 blocs (nom, coordonnées, titre, accroche) gardaient une hauteur de zone trop petite et se chevauchaient, exactement comme sur la capture d'écran envoyée. Corrigé : classe ajoutée, positions de départ recalculées pour la largeur réelle de `fr-main` (mesurée en direct, pas la formule du modèle standard). Vérifié : plus aucun chevauchement au départ, glisser réellement testé à la souris.

11. **« Colonne et frise » : nom, coordonnées et titre du métier peuvent maintenant rejoindre la colonne de gauche** (Denis : « comme ça je peux équilibrer les colonnes »). La zone libre, qui ne couvrait que la colonne de droite (`fr-main`), s'étire maintenant visuellement sur les 2 colonnes (technique CSS : largeur et décalage calculés sur le rapport 31 % / 69 % des 2 colonnes de la frise), sans toucher à la structure de la grille ni à la hauteur réservée. Les positions de départ restent identiques à avant (dans la colonne de droite) ; c'est la **portée du glisser** qui s'étend, jusqu'au bord gauche de la colonne colorée. Testé à la souris : le nom glisse bien jusque dans la colonne de gauche. **Limite connue, notée pour plus tard** : le cadre rouge ne détecte le chevauchement qu'entre les 4 blocs de l'en-tête entre eux, pas encore avec le contenu de la colonne de gauche (Atouts, Informatique...) : si la personne pousse un bloc très bas dans la colonne de gauche, rien ne l'avertit s'il recouvre ce texte-là. Pas bloquant pour une maquette, à surveiller si ça devient gênant en usage réel.

Script de vérification : **141 contrôles, 0 écart**.

12. **Mise en page : 2 leviers de plus, en dernier recours** (Denis, 2026-09-22) : après taille/espacement/marges (purement typographiques), si le CV dépasse encore une page, le bouton bascule aussi les compétences en texte (au lieu de pastilles) puis les missions en condensé, toujours dans cet ordre du moins visible au plus visible, toujours réversible d'un clic. Question de Denis en suspens, voir ma réponse dans le fil de discussion : faut-il un réglage « condensé » séparé pour les compétences professionnelles et comportementales ? Recommandation : non, garder un seul réglage partagé pour les deux (répondu en détail dans la conversation).

Script de vérification : **144 contrôles, 0 écart**.

## Réponse à la question de Denis : tous les modèles réels ont-ils été importés ?

Les **6 modèles retenus pour la galerie** (validés plus haut) sont maintenant **tous** dans la maquette : colonne colorée en vague, bandeau diagonal, bandeau entier, cadre de page centré, titres à pictogrammes, et Colonne et frise. Rien ne manque à cette liste.

Il reste **5 modèles réels du code de l'application**, volontairement **non repris dans cette maquette** : nom écrit à la verticale, triangle en coin, vague marine, diagonales contrastées (jaune sur noir), losange, médaillon. Décision du 2026-09-22 (§ 5 bis) : trop décoratifs ou peu lisibles pour ce public, ils resteront accessibles par le bouton « Un autre modèle » dans l'application réelle, mais n'ont pas besoin de leur propre vignette dans cette maquette de démonstration. **Si Denis change d'avis et veut les voir aussi ici, il suffit de le dire** : le mécanisme (fiche du modèle + vignette + entrée dans la galerie) est maintenant posé, les ajouter est rapide.

## 5 bis. Fiche des modèles Créatif réels (lue dans le code, `_PDF_CREATIF_RECETTES`, `cvPdfPanneauReglages.js` ligne 949)

**Constat** : le code contient **11 modèles Créatif** (Denis en avait compté 9). À vérifier : lesquels apparaissent réellement dans la galerie actuelle et lesquels existent seulement dans le code. Cette fiche vient de la lecture du code, **pas d'un rendu** : la planche visuelle (rendu réel avec le CV de M. Doumbouya) reste à faire.

| Modèle (nom du code) | En-tête | Colonnes (largeur gauche) | Titres | Compétences | Icônes | Police | Couleurs (début, fin) | Particularité |
|---|---|---|---|---|---|---|---|---|
| `sidebarVague` | sans bandeau | 2 colonnes, 35 %, **colonne gauche colorée pleine hauteur en vague** | bandeau | pastilles | non | Verdana | violet `#3B2E5C` à `#8172B0` | photo avec anneau |
| `rubanDiagonal` | bandeau **diagonal** dégradé | 2 colonnes, 50 % | bandeau | pastilles | non | Segoe | vert `#0F6E56` à `#5DCAA5` | |
| `duoOvale` | bandeau rectangle | 2 colonnes, 50 % | bandeau | texte, blocs encadrés | non | Segoe | bleu `#2f6690` à `#6fa3c7` | photo ronde |
| `cadreBarre` | sans bandeau, **centré**, cadre de page | 2 colonnes, 36 %, trait entre colonnes | bandeau | pastilles | non | Segoe | marine `#1c3d52` à `#3d6a8a` | cadre autour de la page |
| `bandeauVertical` | bandeau, **nom écrit à la verticale** | 2 colonnes, 40 % | bandeau | pastilles | non | Segoe | noir `#1c1c1c` à `#333333` | nom vertical (lisibilité faible) |
| `triangleSavoir` | bandeau en **coin** | 2 colonnes, 36 % | souligné | rectangles | non | Segoe | vert foncé `#0b5c47` à `#3f9478` | |
| `vagueMarine` | bandeau en **vague** | 2 colonnes, 50 % | bandeau | pastilles | non | Segoe | marine `#1c3d52` à `#3d6a8a` | |
| `diagonalesContrastees` | bandeau diagonal dégradé | 2 colonnes, 50 % | bandeau | pastilles | non | Segoe | noir `#111111` à jaune `#F2B705` | fort contraste |
| `losangeVert` | sans bandeau | 2 colonnes, 36 % | souligné | barres | non | Segoe | vert `#3d6b2c` à `#7fae3f` | photo en losange |
| `pastille` | sans bandeau, filet en haut | 2 colonnes, 33 % | **pastille** (icône dans un rond) | pastilles | **oui** | Trebuchet | bordeaux `#7d2e43` à `#c98a9a` | titres avec icônes |
| `medaillon` | bandeau | 2 colonnes, 32 % | souligné | pastilles | **oui** | Georgia | ardoise `#33475b` à `#6f88a3` | photo en médaillon sur le bord du bandeau |

Constats utiles pour la maquette :
- **Aucun n'a de police unique** : 6 polices différentes (Verdana, Segoe, Trebuchet, Georgia…). Or la règle « une seule police fixe » (C4) s'applique. Recommandation : **tous les modèles utilisent la police choisie** (Arial par défaut), la police d'un modèle n'est plus imposée.
- **Cinq modèles dépendent de la photo** (`sidebarVague`, `duoOvale`, `losangeVert`, `medaillon`, `cadreBarre` : photo ronde) ; comme la photo n'est pas encouragée (§ 2.3), leur rendu sans photo doit être vérifié un par un.
- Les **couleurs sont des dégradés début à fin** ; la maquette parle d'**une** couleur choisie par la personne : décider ce que devient la couleur de fin (dérivée automatiquement de la couleur choisie, recommandé).

**Proposition de galerie** (6 visibles + « Un autre modèle » qui fait défiler tous les autres sans répétition), **à confirmer sur la planche visuelle** :
1. `sidebarVague` (colonne colorée pleine hauteur : c'est ta demande « colonnes jusqu'en bas de page ») ;
2. `rubanDiagonal` (bandeau diagonal) ;
3. `duoOvale` (bandeau entier, sans fioriture) ;
4. `cadreBarre` (classique et sobre, cadre de page) ;
5. `pastille` (titres avec icônes, très lisible) ;
6. **« Colonne et frise »** (nouveau, inspiré du CV de M. Doumbouya).
Écartés de la vitrine, mais atteignables par « Un autre modèle » : `bandeauVertical` (nom vertical peu lisible pour ton public), `diagonalesContrastees` (jaune sur noir fatigant), `triangleSavoir`, `vagueMarine`, `losangeVert`, `medaillon` (dépendent de la photo ou très décoratifs).

**Risque de cette proposition** : je juge sur les paramètres, pas sur le rendu. Un modèle qui semble bon sur le papier peut mal rendre avec 9 expériences. D'où la planche visuelle avant de figer.

## 6. Reste à faire de la phase 1

- **Planche des modèles réels** (la fiche du § 5 bis est faite, pas le rendu) : rendre les 11 modèles créatifs existants et les 3 variantes sobres avec le CV de M. Doumbouya dans l'application, les comparer aux vignettes de la maquette, décider quels modèles figurent dans la galerie (environ 6 visibles + « Un autre modèle »). **Pas encore fait** : elle demande d'exécuter l'application réelle dans le navigateur.
- Réponses de Denis aux § 1, § 2 et § 3.
- Ensuite : gel de la maquette, puis phase 2.
