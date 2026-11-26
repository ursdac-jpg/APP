# État des lieux de l'introduction, du diaporama et de la vidéo (23/11/2026, consigne 583)

> Audit en lecture seule, plus trois captures refaites. La vidéo d'introduction date du 12/11/2026 (3 min 11), la page et le diaporama ont été corrigés le même jour. Depuis, environ 670 changements ont eu lieu ; seuls ceux que le public voit comptent ici.

## 1. Méthode retenue pour les captures : la « vue publique »

Sur le poste de Denis, `localhost` et `127.0.0.1` ouvrent tous les modules fermés (« Ce qui compte pour moi », etc.). Une capture faite avec ces adresses montre donc des tuiles que le public ne voit pas. **Pour une capture ou une vidéo de ce que voit le public, utiliser l'adresse du poste par son nom** (`http://Pc-Denis:8123`, serveur de développement lancé comme d'habitude) : le site la traite comme une adresse publique, et seuls les modules réellement ouverts apparaissent. Vérifié le 23/11/2026 : la carte « Boîte à outils » ne montre pas « Ce qui compte pour moi » en vue publique, et montre « Explorer les métiers » (ouvert au public depuis le 19/11/2026).

## 2. Ce qui est périmé, vérifié image par image

| Support | Constat | Statut |
|---|---|---|
| `accueil.png` (page et diaporama) | Ancienne présentation de la carte « Boîte à outils », bouton « Introduction » absent de l'image | **Refaite** en vue publique |
| `accueil_bas.png` (page) | Carte « Vous hésitez encore ? » sans « Explorer les métiers » ni sa nouvelle description | **Refaite** en vue publique |
| `i_cv_1_choix.png` (page et diaporama) | La page « Créer un nouveau CV » a changé de mise en page (trois « voies » détaillées) | **Refaite** (on voit « Trois façons de faire » et les voies 1 et 2) |
| `i_cv_2_objectif.png` | La page « Votre objectif » a peu changé | Laissée telle quelle |
| `i_cv_3_parcours.png`, `i_cv_4_profil.png` | Le parcours a changé le 16/11/2026 (nouvelle première question : choisir soi-même ses missions et ses compétences, métiers présentés en cartes) et le panneau d'ajout d'une expérience a une autre forme | **À refaire** : les aides de saisie des captures (`docs/mesures_2026-10-26/parcours_reels/saisies.js`, champ `#xPoste`) ne trouvent plus ce champ |
| Les autres images (lettre, entretien, bilan, chiffres, employeurs, outils privés, modèles de CV) | Pas encore comparées à l'application actuelle | **À vérifier** |

## 3. Ce que la page, le diaporama et la vidéo ne disent pas

- **« Explorer les métiers » est absent partout** (page `modules/introduction/index.js`, diaporama `diaporama.js`, vidéo). Ce module est ouvert au public depuis le 19/11/2026 avec ses quatre chemins, c'est l'écart le plus visible.
- La description de la carte « Vous hésitez encore ? » et les trois noms de chemins (« Chercher un métier », « Partir de vos envies », « Répondre à un questionnaire ») sont nouveaux.
- La page « Nouveautés » a changé (rubrique « Chiffres : ce qui bouge », filtre, pastille « Lire »), de même que « Droits et règles » (fiches ouvertes sur place).
- Le bouton « Introduction » est maintenant visible en haut à droite de toutes les pages (nouveauté pour les images).

## 4. Ce que la vidéo d'introduction montre de périmé

À confirmer en regardant les images de la vidéo (non fait) : l'accueil du début, le passage « Créer un nouveau CV » (première question et métiers en cartes) et l'absence d'« Explorer les métiers ». Une seule vidéo à refaire, une fois, à l'ouverture des modules (option A).

## 5. Ce qu'il reste avant la refonte unique

1. Ouvrir les modules à présenter (« Ce qui compte pour moi » et « Bien utiliser l'IA » sont encore fermés).
2. Mettre à jour les aides de saisie des captures pour le nouveau parcours « Créer un CV », puis refaire `i_cv_3_parcours` et `i_cv_4_profil`.
3. Comparer les autres images à l'application.
4. Réécrire le texte de la page et du diaporama (module par module), puis le scénario de la vidéo, le valider avec Denis.
5. Refaire la vidéo avec la chaîne de `docs/video_presentation` (voix, enregistrement, assemblage), en vue publique.

## 6. Liste des autres vidéos à examiner (23/11/2026, demande de Denis)

**Méthode** : j'ai rapproché la date de fabrication de chaque vidéo des changements visibles notés depuis dans `docs/JOURNAL_DES_CHANGEMENTS.md`. **Je n'ai pas encore regardé les images des vidéos** : « probable » veut dire « un changement visible a eu lieu après la date de la vidéo », pas « vérifié ». Pour passer de probable à certain, il faut une planche d'images par vidéo (comme l'audit du 12/11/2026), ce qui ne modifie rien.

### 6.1 Probablement périmées (le contenu montré a changé)

| Vidéo (date) | Ce qui a changé depuis |
|---|---|
| `video/presentation.mp4`, introduction (12/11) | Explorer les métiers absent ; « Créer un nouveau CV » (nouvelle première question, étape « Vos missions et compétences », métiers en cartes) ; accueil et boutons du haut ; questions du CV sous la carte « Mon CV » (16/11) |
| `cadre.mp4`, Comprendre le cadre (12/11) | « Droits et règles » : fiche ouverte sur place, filtres, recherche (16 et 17/11) |
| `chiffres.mp4` (12/11) | Les montants ne sortent plus de leur cadre (14/11) : la vidéo montre peut-être un débordement |
| `lettre.mp4`, `entretien.mp4`, `pret-lettre.mp4`, `pret-entretien.mp4` (08/11) | Boutons « Reprendre » et barre du bas (11/11), questions du CV sous « Mon CV » (16/11), champ « Métier ou domaine visé » pour un stage ou une alternance (22/11) |
| `reprendre-reformuler.mp4`, `reprendre-sans.mp4` (11/11) | Écran « Votre objectif » raccourci (11/11), « Vos informations » : photo, diplômes à détailler (15/11) |
| `creer-assistant.mp4`, `creer-main.mp4`, `creer-recit.mp4`, `reprendre-garder.mp4` (16/11) | À lire : deux changements de « Créer » notés le 21/11 après la date des vidéos |

### 6.2 À vérifier (changement plus petit)

| Vidéo (date) | Ce qui a changé depuis |
|---|---|
| `bilan.mp4`, `ats.mp4`, `coherence.mp4`, `regard.mp4` (08/11) | Dépôt d'un document : message si le lecteur ne se charge pas, avertissement texte très court, rappel de relire pour retirer les noms (22/11) ; champ « Métier ou domaine visé » (22/11) |
| `competences.mp4` (12/11) | Champ « Métier ou domaine visé » pour un stage (22/11) |
| `carnet.mp4`, `reperes.mp4` (12/11) | Message du « + Noter » vide, titres longs qui passent à la ligne (22/11) |
| `employeurs.mp4` (14/11) | Cartes de secteurs sur toute la largeur (14/11, même jour) |
| `pistes.mp4`, `ucpm.mp4` (08/11) | Aucun changement noté propre à ces modules, seulement l'aspect général |
| Gestes `affichage.mp4`, `projet.mp4`, `importer-cv.mp4`, `masquer-texte.mp4` (08/11) | Options d'affichage (nouveau réglage « Cartes de... »), « Vos informations » (15/11), dépôt de document (22/11) |

### 6.3 Pas touchées, à garder

`chemin-metier`, `chemin-actions`, `chemin-questionnaire`, `chemin-recrute`, `metiers`, `synthese` (Explorer les métiers, 21/11) ; `quifaitquoi` (12/11) ; `lexique` (12/11) ; les autres gestes (`aide`, `chatgpt-demande`, `chatgpt-recherche-web`, `coller-reponse`, `cv-pdf`, `cv-word`, `deuxieme-regard`, `modele`, `mise-en-page`, `perplexity-demande`, `rubriques`) ; les trois pilotes (`carnet`, `disquette`, `masquer-image`).

### 6.4 Écart commun à toutes les vidéos d'avant le 15/11 (cosmétique)

Les pages utilisent maintenant toute la largeur de l'écran, la barre des étapes se resserre, trois flèches rangent les boutons du haut. Cela change l'aspect de presque toutes les vidéos (le bouton « Introduction » y figure déjà, vérifié au 6.6), sans rendre faux ce qu'elles disent. Recommandation : ne rien refaire pour cela seul, corriger au prochain rejeu de chaque vidéo.

### 6.5 Recommandation de regroupement (à décider avec Denis)

- **Lot 1, introduction** : une seule fois, à l'ouverture des modules (voir le paragraphe 5).
- **Lot 2, créer et préparer** : `creer-*`, `reprendre-*`, `pret-*`, `lettre`, `entretien` : ce sont les parcours que le plus de monde suit, et ils ont reçu le plus de changements.
- **Lot 3, se tenir informé** : `cadre`, `chiffres`, `employeurs`.
- **Lot 4, analyse et gestes** : `bilan`, `ats`, `coherence`, `regard`, gestes de dépôt et d'affichage. Priorité plus basse : changements petits.
- **Pour chaque lot** : audit par planche d'images d'abord (lecture seule, effort moyen), puis rejeu des seules vidéos confirmées périmées (effort moyen par vidéo, la chaîne est automatique), validation de Denis avant de remplacer chaque fichier.

### 6.6 Résultat de l'audit des lots 2 et 3 par planches d'images (23/11/2026)

Méthode : neuf images réparties sur chaque vidéo, comparées aux mêmes écrans de l'application d'aujourd'hui en vue publique (`http://Pc-Denis:8123`, 1280 x 720). Treize vidéos regardées : `creer-assistant`, `creer-main`, `creer-recit`, `reprendre-garder`, `reprendre-reformuler`, `reprendre-sans`, `lettre`, `entretien`, `pret-lettre`, `pret-entretien`, `cadre`, `chiffres`, `employeurs`.

**Correction de ma liste du 6.1 : elle était trop large.** Le classement par dates annonçait des vidéos périmées ; les images montrent le contraire pour ces lots.

- Le bouton « Introduction » est déjà visible sur toutes ces vidéos (le 6.4 se trompait sur ce point).
- Les pages d'accueil des modules (Créer, Reprendre, lettre, employeurs, chiffres, cadre) sont identiques à l'application actuelle, jusqu'au titre, au bandeau, à la vidéo intégrée et aux boutons.
- Les vidéos `creer-*` et `reprendre-garder` (16/11) montrent déjà la nouvelle première question « Qui choisit les missions et les compétences de vos expériences ? ».
- `cadre` : seul écart repéré, le compteur (« 11 changements » dans la vidéo, 12 aujourd'hui). `chiffres` : aucun écart repéré.

| Vidéo | Verdict |
|---|---|
| `creer-assistant`, `creer-main`, `creer-recit`, `reprendre-garder` | **À garder** |
| `reprendre-reformuler`, `reprendre-sans` | **À garder** (les changements du 15/11 touchent la photo et les diplômes, non montrés) |
| `cadre`, `chiffres`, `employeurs` | **À garder** |
| `lettre`, `entretien`, `pret-lettre`, `pret-entretien` | **À garder à l'œil** : deux petits changements du 22/11 (message à l'écran de dépôt d'un document, champ « Métier visé » pour un stage) peuvent toucher un passage de détail ; le parcours est identique |

**Limite honnête** : je n'ai pas rejoué les parcours en entier. Les écrans de détail (milieu des parcours) sont jugés sur les images de la vidéo et sur le journal des changements, pas sur une comparaison écran par écran. Les corrections de présentation (largeur, taille des textes) ne changent pas le sens de ce que dit la voix.

**Conclusion** : aucune vidéo des lots 2 et 3 n'est à refaire maintenant. Reste à examiner le lot 4 (analyse et gestes), puis la vidéo d'introduction qui, elle, est bien périmée (Explorer les métiers absent).

### 6.7 Résultat de l'audit du lot 4 par planches d'images (23/11/2026)

Méthode identique au 6.6 : treize vidéos regardées (`bilan`, `ats`, `coherence`, `regard`, `competences`, `carnet`, `reperes`, `pistes`, `ucpm`, gestes `affichage`, `projet`, `importer-cv`, `masquer-texte`), comparées à l'application d'aujourd'hui en vue publique.

| Vidéo | Verdict | Pourquoi |
|---|---|---|
| `affichage` (gestes, 25 s) | **À REFAIRE** | Le panneau d'affichage a changé : la ligne « Grands boutons » a disparu (13/11), « Cartes de l'accueil » est apparue, une entrée vidéo « Voir comment régler l'affichage » a été ajoutée. La vidéo dit encore « agrandir les boutons » alors que le scénario, déjà corrigé, ne le dit plus : il suffit de le rejouer |
| `masquer-texte` (gestes, 27 s) | **À REFAIRE** | La vidéo montre, après le retrait des informations, des lignes avec un tiret seul (« - ») ; ce défaut est corrigé depuis le 22/11, et un rappel de relire les noms de personnes a été ajouté |
| `projet` (gestes, 28 s) | À garder, à surveiller | La page « Vos informations » est un peu différente (colonne centrée, question de la photo plus haut, panneau d'expérience), mais ce que dit la voix reste vrai |
| `bilan`, `ats`, `coherence`, `regard`, `competences`, `pistes`, `ucpm`, `importer-cv` | À garder | Écrans identiques ; les ajouts du 22/11 (champ « Métier visé » pour un stage, avertissement sur un texte très court, rappel de relire les noms) touchent des écrans non montrés ou une ligne de détail |
| `carnet`, `reperes` | À garder | Seuls changements : message du Carnet quand « Noter » est cliqué sans texte, titres longs des Repères qui passent à la ligne (la vidéo les montre coupés) ; cosmétique |

**Limite** : comme au 6.6, les écrans de détail sont jugés sur les images et le journal, pas rejoués un par un.

### 6.8 Bilan des trois audits

- **À refaire maintenant** (courtes, la chaîne est automatique) : `affichage` et `masquer-texte`.
- **Une seule vidéo vraiment périmée en profondeur** : `video/presentation.mp4` (Introduction), à refaire une fois à l'ouverture des modules.
- **Toutes les autres : à garder.** Le premier classement par dates exagérait ; seules les comparaisons d'images comptent.

**Fait le 23/11/2026** : `affichage` (22 s) et `masquer-texte` (27 s) rejouées en vue publique, validées par Denis, copiées dans `videos/gestes/` ; durée d'`affichage` corrigée dans `modules/video-presentation/videoPresentation.js` (25 s devenu 22 s).

## 7. Audit de cohérence des vidéos de module et des introductions de modules (23/11/2026, consigne 586, lecture seule)

**Constat sur la barre du bas de la vidéo d'introduction** (`modules/introduction/video.js`) : le bouton « Accueil » est retiré volontairement (`sansAccueil: true`) et le texte de la vidéo est dans un bloc fixe sous le lecteur, non pliable. Les deux demandes de Denis sont faisables sans risque (composant `barreNavigation` existant).

**Où est la vidéo, module par module** (composant unique `htmlVideoPresentation`, `modules/video-presentation/videoPresentation.js`) :

| Famille | Modules | Vidéo d'ensemble sous le titre | Vidéo par chemin |
|---|---|---|---|
| Un seul chemin | Mon Carnet, Lexique, Mes Repères, Découvrir mes compétences, Regard sur mon CV, Mots de votre CV, Analyser ma candidature, Cohérence, Écrire ma lettre, M'entraîner à un entretien, Employeurs, Comprendre le cadre, Comprendre les chiffres, Qui fait quoi, Comparer mes pistes, Un CV plusieurs métiers | OUI, toujours au même endroit (sous le titre) | sans objet |
| Plusieurs chemins, vidéo d'ensemble présente | Explorer les métiers (4 chemins + Ma synthèse) | OUI (`metiers`) | OUI, sur la page « Présentation de ce chemin » (second clic) |
| Plusieurs chemins, vidéo d'ensemble ABSENTE | Créer un nouveau CV (3 façons), Reprendre mon CV (3 voies), Lettre et entretien en version rapide (2 parcours) | NON | OUI, directement dans la carte de chaque chemin, puis répétée sur la page du chemin |
| Pas encore de vidéo | Ce qui compte pour moi (fermé au public), Bien utiliser l'IA (en conception) | non | non |

**Écarts de cohérence relevés** : (a) trois modules à plusieurs chemins n'ont pas de vidéo d'ensemble : à créer (`creer`, `reprendre`, `pret`) ; (b) la vidéo du chemin n'est pas au même endroit selon le module (page de présentation du chemin pour Explorer les métiers, carte du chemin sur la page du module pour les autres) ; (c) le mot change : « chemins » (Explorer les métiers), « voies » (Reprendre), « façons de faire » et « parcours » (Créer), « parcours » (version rapide) ; (d) libellés de bouton : « Voir la présentation en vidéo » (module), « Voir ce parcours en vidéo », « Voir cette voie en vidéo », « Voir ce chemin en vidéo ».

**Structure des introductions** (lue dans le code) : le patron usuel est accroche, « À quoi ça sert », « Ce qui va se passer », « Ce que ce module ne fait pas », « Ce que vous pourrez faire ensuite » (plus « Mes Repères » et « Comment ça se passe concrètement » quand le module passe par un assistant). Conformes : Écrire ma lettre, Entretien, Mots de votre CV, Regard, Cadre, Chiffres, Qui fait quoi, Employeurs, Comparer mes pistes, Découverte à partir du récit, Compétences, Un CV plusieurs métiers. Écarts : **Reprendre mon CV** (pas de « ne fait pas » ni de « Ce que vous pourrez faire ensuite » au niveau du module), **Explorer les métiers** (structure propre : pas de « À quoi ça sert », « Ce qui va se passer » ni « Ce que vous pourrez faire ensuite »), **Créer un nouveau CV** (« À quoi ça sert » en haut, « ne fait pas » en bas, pas de « Ce que vous pourrez faire ensuite »). Carnet, Lexique, Repères et Cohérence ont leur propre construction : à comparer dans la séance 1. « Ce qui compte pour moi » : introduction propre, module fermé.

**Reste à faire (rien codé)** : [effort : moyen] barre du bas de la vidéo ; [effort : moyen] audit détaillé des introductions de chaque module contre le module réel ; [effort : haut] décider le mot commun et l'emplacement commun des vidéos, puis produire les trois vidéos d'ensemble manquantes ; [effort : haut] réécriture de la page, du diaporama et du scénario de la vidéo d'introduction, une seule fois, à l'ouverture des modules.

## 8. Séance 1 faite le 23/11/2026 (consigne 586)

- **Barre du bas de la page de la vidéo** : Retour, Accueil, et un bouton « Masquer le texte » / « Afficher le texte » qui plie le texte de la vidéo (déplié au départ). Fichiers : `modules/introduction/video.js`, `css/style.css`, `tests/introduction.test.js`. Vérifié au navigateur (ordinateur et téléphone), `npm test` vert (3452). Commit `53b91ede`.
- **Structure des introductions, vérification complète** : Carnet, Lexique, Repères, Cohérence et Analyser ma candidature suivent le patron (À quoi ça sert, Ce qui va se passer, ce que le module ne fait pas, Ce que vous pourrez faire ensuite). Écarts confirmés, à corriger : **Reprendre mon CV**, **Créer un nouveau CV**, **Explorer les métiers** ; Repères écrit « Ce que ce n'est pas » au lieu de « Ce que ce module ne fait pas » (à harmoniser).
- **Non vérifié** : que le contenu de chaque introduction décrive exactement les fonctions actuelles du module (lecture écran par écran, à faire avec la réécriture).

## 9. Séance 2, étape 3 faite (2026-11-23)

Maquette détaillée envoyée à Denis : `docs/MAQUETTE_DETAIL_VIDEOS_ET_CHEMINS_2026-11-23.html` (pages, rubriques, mot « chemin », vidéos, inventaire GARDÉ/DÉPLACÉ/FUSIONNÉ/ENRICHI, ordre de réalisation). Disposition générale validée par Denis (« Oui, passe au détail »). En attente de son feu vert sur les textes (rubriques de Reprendre, voix des trois vues d'ensemble, vidéo dans les cartes d'Explorer) avant tout code. Aucun code modifié à ce stade.

## 10. Séance 2, code livré (2026-11-23)

Faits et vérifiés (npm test 3452 verts, navigateur ordinateur et téléphone, sans débordement) : mot « chemin » sur les textes visibles (Reprendre, Créer, version rapide, aides, libellés vidéo) ; rubriques ajoutées (Reprendre : ne fait pas + ensuite, « À quoi ça sert » remontée ; Créer : ce qui va se passer ; Explorer : à quoi ça sert, ce qui va se passer, ensuite) ; vidéo de chaque chemin dans la rubrique « Quatre chemins » et dans les cartes d'accueil d'Explorer.
Reste : fabriquer les vidéos d'ensemble `reprendre`, `creer`, `pret` (puis ajouter leurs clés dans `VIDEOS_PRESENTATION`, les pages les appellent déjà et n'affichent rien tant que la clé est absente), rejouer les 3 vidéos de Reprendre (voix « voie »), écouter les autres ; puis diaporama, vidéo d'introduction et page Introduction. Ligne Journal/Nouveautés à écrire à la fin, une fois les vidéos faites.

## 11. Vidéos faites (2026-11-23)

Fabriquées et installées dans `videos/modules/` : trois vidéos d'ensemble (`reprendre` 40 s, `creer` 37 s, `pret` 30 s, clés ajoutées dans `VIDEOS_PRESENTATION`, scénarios `module-reprendre.js`, `module-creer.js`, `module-pret.js`) et les huit vidéos de chemin rejouées (Reprendre x3, Créer x3, version rapide x2) avec le mot « chemin » à l'image et à la voix. Tests 3452 verts, lecture contrôlée au navigateur. Journal : ligne notée. Ligne « Nouveautés » à écrire à la fin du chantier (après diaporama, vidéo et page Introduction).
Reste : diaporama, vidéo `video/presentation.mp4` (+ vtt) et page Introduction à refaire une fois.

## 12. Introduction refaite (2026-11-23)

- **Page et diaporama** : nouvelle rubrique « Pour vos documents : trois points de départ » (lue dans `MES_DOCUMENTS_PARCOURS`), nouvelle rubrique et diapositive « Découvrir des métiers » (chemins lus dans `CMV_PRESENTATIONS`, visibles seulement si Explorer les métiers est ouvert), « Trois façons de faire » devenu « chemins », « À quoi ça sert » et diapositive 3 parlent aussi de découvrir des métiers. Nouvelle image `images/introduction/i_metiers_1_chemins.png` (prise en vue publique), `INTRO_IMAGES` passe à 20.
- **Vidéo** `video/presentation.mp4` (3 min 59, 43 phrases sous-titrées) refaite en vue publique : plan 3 dit « trois chemins pour créer un CV », deux plans ajoutés (11 : Reprendre mon CV et version rapide ; 12 : Explorer les métiers), flux de saisie de l'expérience adapté au panneau actuel. Scénario : `docs/SCENARIO_VIDEO_PRESENTATION_2026-11-02.md` ; enregistrement : `docs/video_presentation/enregistrer.js` (lancer avec `URL_APP=http://Pc-Denis:8123`).
- **Non vérifié** : la voix n'a pas été écoutée (texte de synthèse relu à l'écrit) ; les captures `i_cv_3_parcours` et `i_cv_4_profil` n'ont pas été comparées aux écrans actuels (le panneau d'expérience a changé) ; « Ce qui compte pour moi » et « Bien utiliser l'IA » volontairement absents (fermé et en conception).
- Journal et Nouveautés : deux lignes écrites (Introduction ; Reprendre/Créer et leurs vidéos d'ensemble).

## 13. Captures et étape « missions » (2026-11-23)

- Captures `i_cv_3_parcours` et `i_cv_4_profil` refaites ; barre à six étapes (page et diaporama), car l'étape « Vos missions et compétences » existe désormais avant « Votre profil ».
- Vidéo refaite (3 min 59,6 s) : l'écran « Vos missions et compétences » est montré, la voix dit « Elle vérifie ses missions, puis elle découvre son profil » (scénario, plan 4). Pauses raccourcies pour rester sous 4 minutes.
- Reste non vérifié : la voix de synthèse n'a pas été écoutée.

## 14. Les neuf modules manquants (2026-11-24)

- Maquette validée : `docs/MAQUETTE_INTRODUCTION_TOUS_LES_MODULES_2026-11-24.html` (images de travail dans `docs/maquette_introduction_modules/`).
- Page : trois rubriques (La boîte à outils ; D'autres regards sur votre candidature ; Quand vous avez des pistes), lues sur l'accueil (`itemsInfoCarteAccueil`) et filtrées par ouverture ; table `INTRO_GROUPES_MODULES` dans `logique.js`. Retirés : la phrase « D'autres outils regardent votre CV… » et la rubrique « Et aussi ».
- Diaporama : trois diapositives en mosaïque (une image par module), la diapositive « Et aussi » retirée : 25 diapositives. Neuf captures `images/introduction/i_mod_*.png` (29 images au total).
- La vidéo d'Introduction ne parle pas de ces modules (elle est à la limite des 4 minutes).
