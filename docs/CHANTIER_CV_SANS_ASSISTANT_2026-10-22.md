# Chantier « Mettre mon CV en page, sans rien changer » (remplir un modèle de CV sans assistant en ligne)

Ouvert le 22 octobre 2026, Mode A, `[effort : haut]`. Origine : idée notée le 20/10/2026 dans `docs/IDEES_A_RECLASSER.md` (« Nouveau module : remplir directement un gabarit de CV, SANS passage par l'assistant en ligne »). Aucun code n'est écrit. Titre de travail, à valider par Denis.

**Règle de cohabitation (Denis, 22/10/2026)** : l'autre compte Claude travaille sur les modules du CV (modèles, formes, options). Ce chantier ne touche à rien de ce qu'il modifie. Tout le code nouveau ira dans un dossier neuf (`modules/cv-sans-assistant/`). Les seules fonctions partagées à toucher sont listées plus bas, et chacune demande une recherche sur tout le dépôt avant.

## 1. Le besoin, dit par Denis

La personne a déjà son CV (papier, photo, fichier, ou texte copié depuis un autre site). Elle ne veut ni l'améliorer, ni l'adapter, ni l'enrichir : elle veut seulement profiter de nos modèles pour la mise en page. Toutes les informations de son CV doivent donc apparaître, sans aucun choix de notre part.

Décisions de Denis, 22/10/2026 :
1. On réutilise **le système qui repère et surligne les informations** (celui qui sert à masquer les coordonnées avant l'envoi à l'assistant), mais ici on ne masque rien : on récupère.
2. Quand on ne sait pas dans quelle rubrique va une information, **la personne choisit**.
3. Si son CV tenait sur une page, le nôtre doit aussi tenir sur une page (voir réserve 2).
4. Ce qui n'a pas de rubrique chez nous va dans une zone **« Autres informations »**.
5. Les intitulés de rubriques sont déjà modifiables dans nos modèles : on peut mettre ceux de son CV d'origine.
6. En option seulement, ensuite : corriger les fautes, améliorer les phrases (renvoi vers le parcours existant « Reformuler et présenter mon CV », même fiche).

## 2. Audit du code réel (22/10/2026) : ce qui existe, ce qui est à créer

**Réutilisé tel quel**
- La fiche du CV (`dossier`) : `modules/cv-core/extraireDonneesCV.js` et `normaliserDonneesCV.js` la lisent pour tous les modèles. Un CV est dessiné à partir d'elle, quelle que soit la façon dont elle a été remplie. Les modèles, la mise en page automatique (CV rempli d'office), le PDF et le Word fonctionnent donc sans changement.
- La lecture d'un fichier PDF, Word ou texte (`lireFichierCV`, `data/metiers.js`) et la lecture d'une photo (`extraireTexteParOCR`, même fichier). Qualité d'une photo : moyenne.
- Le repérage et le surlignage des coordonnées : `detecterCoordonneesSensibles(texte)` (`data/metiers.js`) : téléphone, courriel (y compris sans arobase), code postal et ville (dans cet ordre seulement), liens, âge, nom (seulement s'il est étiqueté ou confirmé par le courriel). `extraireIdentiteCapteeDepuisTexte` pré-remplit l'identité. Le nom seul, sans étiquette, n'est pas repéré.
- La lecture des dates : `modules/cv-core/dates.js`.
- Le rangement des informations non classées : `dossier.informationsNonClassees` (zone « Autres informations »).
- Les intitulés de rubriques modifiables des modèles.

**Rien n'existe pour** : repérer les rubriques d'un texte brut (« Expérience », « Formation »...), séparer poste et entreprise d'une ligne, afficher TOUT sans choix, mesurer « tient sur une page ».

**Piège central (« tout doit apparaître »)** : aujourd'hui le CV fait des choix à la place de la personne :
- 2 ou 3 missions affichées par expérience au départ (`_cvMissionsParDefaut`) ;
- missions jugées redondantes retirées (`_cvSansMissionsRedondantes`) ;
- formation « Sans diplôme » filtrée ;
- informations complémentaires affichées seulement si cochées ;
- accroche venant de l'assistant (`dossier.ia.cv`).
Il faut un **« mode fidèle »** qui coupe tous ces choix. Il touche des fonctions partagées (`normaliserDonneesCV.js` et les panneaux de mise en page). Règles : éteint par défaut, rien ne change pour les autres parcours, recherche sur tout le dépôt avant, banc de rendu B7 identique avant et après.

**Point à prouver à l'étape 4** : arriver directement sur l'écran des modèles, sans passer par Objectif, Mon projet, Faire le point et Action (probable, non vérifié).

**Collisions de noms à éviter dans le code** : `.pastille` et `.jeton` existent déjà dans `css/style.css` avec d'autres rôles (la maquette utilise `.rpast` pour la pastille de rubrique et reprend le vrai `.jeton jeton--radio jeton--compact` pour le choix du modèle).

## 2bis. Les informations qui ne rentrent pas : classer au lieu de tout jeter dans « Autres informations » (retour de Denis, 22/10/2026)

Denis : ce qui n'a pas été trié vient certainement de rubriques ; il faut le classer dans des rubriques qu'on a, ou qu'on peut créer.

**Audit : les rubriques que le CV sait réellement afficher** (`_pdfFabricantsRubriques`, `modules/cv-pdf-html/cvPdfTemplateA4.js`) : expériences, formations, compétences professionnelles, compétences comportementales, langues, logiciels et outils, centres d'intérêt, expérience personnelle (engagements), certifications, informations complémentaires ; plus, dans l'en-tête, téléphone, courriel, adresse et permis (`dossier.permis`). **Il n'existe aucune rubrique libre** (aucune trace dans le code ni dans les docs). Les informations complémentaires sont le seul « fourre-tout » : titre modifiable, affichées seulement si cochées (le mode fidèle les coche toutes), placées en rubrique ou dans l'en-tête (3 au plus).

Ce que la maquette fait désormais (22/10/2026, même soir) :
1. **Plus de rubriques proposées** : Qualités (compétences comportementales), Logiciels et outils, Certifications, Engagements (expérience personnelle), plus le permis rangé dans l'identité. Les titres du CV d'origine correspondants sont reconnus (« Savoir-être », « Outils informatiques », « Habilitations », « Bénévolat », « Permis »...).
2. **Reconnaissance par le contenu**, ligne par ligne, par simples listes de mots (CACES, SST, Excel, bénévole, « sérieux, ponctuel »...). Le permis et la disponibilité sont reconnus même sous un titre qui ne leur correspond pas. Rien de plus fin qu'une liste de mots : c'est une proposition, jamais une certitude.
3. **Proposition d'un toucher** : un bloc encore incertain peut porter « Peut-être : Qualités ? Oui » (pointillé), jamais appliqué tout seul.
4. **Les lignes en trop d'un bloc** (ex. CACES et SST sous « École et diplômes ») ne sont plus jetées dans « Autres informations » : elles sont rangées là où elles ont l'air d'aller (ici Certifications), avec une alerte qui dit où.
5. **« Autres informations » devient la rubrique libre** : la personne peut lui donner le nom de sa rubrique d'origine (« Qui je suis », « Ce que je sais faire ») ; le CV l'affiche sous ce nom grâce aux intitulés modifiables. **Une seule rubrique de ce genre par CV** : si deux titres différents y arrivent, le 2ᵉ titre reste écrit comme première ligne de ses informations, avec une alerte.
6. **Chaque ligne restante peut être déplacée** vers la bonne rubrique depuis la fiche « Autres informations » (liste « Déplacer vers... »), à l'écran 3.

**Choix présenté à Denis (rubriques réellement libres)**
- **A. Recommandé, fait dans la maquette** : rubriques existantes élargies + une seule rubrique libre (« Autres informations » renommable). Bénéfice : réutilise les 33 modèles, le Word, la mise en page et le glisser-déposer sans y toucher ; zéro risque pour l'autre compte. Risque : un CV avec deux rubriques inconnues les voit regroupées sous un seul nom.
- **B. Vraies rubriques libres en nombre illimité.** Bénéfice : fidélité totale à tous les CV. Risque : à ajouter dans les 33 modèles, l'export Word natif, l'ordre des rubriques, le glisser-déposer et la mise en page automatique : gros chantier, dans le territoire de l'autre compte. NO GO pour ce chantier, à rouvrir seulement après des essais réels qui montrent le besoin.
- **C. Tout dans « Autres informations » sans classement** (première version de la maquette) : le plus simple, mais Denis n'en veut pas.

## 3. Le parcours proposé (maquette : `docs/MAQUETTE_CV_SANS_ASSISTANT_2026-10-22.html`)

1. **Déposer** : fichier, photo ou texte collé. Rien ne part sur internet. Aucun assistant.
2. **Classer** : le texte est découpé en blocs ; chaque bloc a une pastille de rubrique (Identité, Titre et accroche, Expérience, Formation, Compétences, Langues, Loisirs, Autres informations, À classer). Classement par titre du CV, sinon par contenu (coordonnées, langues, permis, disponibilité). Un bloc incertain est « À classer » : la personne choisit dans une liste de boutons, coupe (ciseaux) ou fusionne. Le titre d'origine de chaque rubrique est gardé de côté. Un bloc non classé finit dans « Autres informations » (rien n'est perdu).
3. **Vérifier** : une fiche par rubrique, pré-remplie et modifiable, avec la mention « à vérifier » sur ce qui est deviné par la position (poste, entreprise, lieu, nom). Une ligne datée en trop dans une formation déclenche une alerte et part dans « Autres informations ».
4. **Mon CV** : trois modèles indicatifs, indicateur « tient sur une page » mesuré (et ligne « fin de la page 1 »), compteur « X informations sur X sur la feuille », intitulés de rubriques repris du CV d'origine et modifiables, export, bloc facultatif « Pour aller plus loin ».

Essais faits sur la maquette (22/10/2026) : exemple A (CV rangé) classé presque entièrement tout seul, 45 informations sur 45 ; exemple B (CV en désordre, titres inhabituels) : 3 blocs « À classer », 6 classés ; après classement par la personne, 77 informations sur 77 avec le CV chargé ; un CV chargé déborde en Sobre (environ 22 lignes) et tient en Colonne. Clair, sombre et 375 px vérifiés, aucune erreur de console.

## 4. Réserves (verdict préliminaire : GO AVEC RÉSERVES)

1. **Mode fidèle** dans des fonctions partagées (voir plus haut).
2. **« Une page reste une page » n'est pas garanti** : police, largeur de colonne et en-tête diffèrent d'un modèle à l'autre. On le mesure et on le dit (indicateur + suggestion d'un modèle plus dense). Aucune fonction ne mesure cela aujourd'hui.
3. **Poste / entreprise / lieu** : lus par la position des mots, donc une supposition. D'où les fiches pré-remplies et la mention « à vérifier ».
4. **Photo ou scan** : lecture locale de qualité moyenne.
5. Le repérage existant ne reconnaît pas un nom seul ni une ville écrite avant son code postal : à compléter dans la fiche (la maquette le montre avec l'exemple B).

## 4bis. Étape 4 : audit complet contre le code réel (22/10/2026, après le choix de l'option A)

Module neuf : rien à comparer en « GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI ». À la place, chaque élément de la maquette reçoit un verdict de faisabilité.

| Élément de la maquette | Ce que dit le code réel | Verdict |
|---|---|---|
| **Écrire la fiche du CV** | Il existe déjà un moteur unique et générique : `SPECIFICATION_IMPORT` + `fusionnerDonnees(dossier, decisions, SPECIFICATION_IMPORT)` (`js/app.js`). On lui donne une liste de décisions construite par le module, sans passer par l'écran de validation. Il couvre toutes nos rubriques : identité, présentation (titre, accroche), expériences, formations, compétences (savoir-faire / savoir-être / savoirs), langues `{langue, niveau}`, certifications, logiciels, permis `{possede, categories, vehicule}`, loisirs, engagements, expériences personnelles, informations non classées. | **Faisable tel quel** (rien à écrire de neuf pour l'écriture). |
| Qualités, compétences, « Autres informations » | Qualités vers `competences.savoirEtre`, compétences vers `savoirFaire`, « Autres informations » vers `informationsNonClassees` (zone déjà prévue, affichée dans la rubrique « Informations complémentaires »). | Faisable tel quel. |
| Permis | `detecterPermisDansTexte` (`cv-core/identiteFormat.js`) lit déjà « Permis B et C » et renvoie catégories et véhicule. | Faisable tel quel (réutiliser, ne pas recopier le motif de la maquette). |
| **Repérer téléphone, courriel, code postal et ville** | `detecterCoordonneesSensibles(texte)` (`data/metiers.js`). La maquette recopie ses motifs pour être autonome ; le vrai code doit **appeler** la fonction, pas la recopier (une seule source de vérité). Le surlignage de la fenêtre de masquage est écrit dans `cablerVerificationDocument` et ne se réutilise pas tel quel : le module écrit son propre surlignage court. | Faisable avec un ajustement. |
| Lire les dates | `modules/cv-core/dates.js` (`separerDatesDuTitre`, `normaliserDateImport`, `dateFinImportee`) : à réutiliser pour écrire les dates comme l'import le fait (la fin vide et « en cours » ont déjà leurs règles). | Faisable tel quel. |
| **Lire un fichier ou une photo** | `lireFichierCV` (`data/metiers.js`) lit .txt, .docx (les sauts de ligne sont gardés) et .pdf. **Mais pour un PDF, il recolle tous les morceaux de texte avec une espace : toutes les lignes deviennent UNE seule ligne.** Le découpage en blocs de la maquette ne marcherait pas. La photo passe par `extraireTexteParOCR` (déjà là, qualité moyenne, avec lecture complémentaire). | **Faisable avec un ajustement** : lecteur de PDF qui garde les lignes (regrouper les morceaux par hauteur sur la page), écrit dans le module, **sans toucher à `lireFichierCV`** (partagé par d'autres parcours). C'est le point technique le plus délicat du chantier : un CV en colonnes se lit en désordre. |
| **Classer par titre et par contenu** | Rien n'existe. Simple, mais à écrire. Écrit en fonctions pures dans le module, donc **testable par `npm test`** (contrairement au code de l'écran). Les listes de mots sont des données, modifiables sans toucher au code. | Faisable ; nouveau ; risque faible. |
| Fiches « poste / entreprise / lieu » | Nouveau, par la position des mots : une supposition, d'où « à vérifier ». Fonctions pures testables. | Faisable ; risque moyen de mauvaise lecture, borné par la correction à l'écran. |
| Nom et prénom | La fiche de l'application a **deux champs** (`identite.nom`, `identite.prenom`) ; la maquette n'en a qu'un. | Ajustement : deux champs à l'écran 3, séparés par une supposition (les majuscules sont le nom), marquée « à vérifier ». |
| **Tout afficher** (le « mode fidèle ») | Bonne nouvelle : le PDF n'a **déjà plus aucun plafond de rubriques** en A4 détaillé et en A4 intégral (décision de Denis du 26/09 : `cvPdfDonnees.js`, bloc C2). Le format « A4 Intégral » existe déjà, accepte 2 pages et affiche toutes les missions. Il reste **quatre points qui retirent ou ajoutent encore du contenu** : (1) les compétences professionnelles et comportementales sont plafonnées à 10 chacune dans « A4 Intégral » ; (2) `_cvSansMissionsRedondantes` retire les missions jugées trop proches (`normaliserDonneesCV.js`) ; (3) l'import ajoute un point final à chaque mission et en retire les points (`joindreMissionsImport`) : le texte change à peine, mais il change ; (4) le CV complète les qualités par celles de la fiche du métier visé ou du secteur (`cvPdfDonnees.js`, LOT 3.4), ce qui ajouterait du contenu qui n'est pas celui de la personne. | **Faisable avec 4 réglages ciblés**, tous éteints par défaut pour les autres parcours : format « A4 Intégral » d'office ; plafond de compétences levé pour ce module ; dédoublonnage des missions coupé ; missions écrites telles quelles après la fusion ; aucune qualité « du métier visé » (le module n'enregistre aucun métier visé). |
| L'ordre de la personne | `fusionnerDonnees` remet les expériences et les formations **du plus récent au plus ancien** (décision de Denis du 30/09/2026). | À garder : l'ordre chronologique est une règle déjà décidée. À dire à la personne si son CV d'origine était dans un autre ordre. |
| Doublons exacts | Deux lignes identiques (à la casse près) dans une même liste sont fusionnées par le moteur. | Acceptable (un doublon exact n'est pas une information). À citer dans le compteur « X sur X » pour qu'il reste vrai. |
| **Arriver directement sur les modèles** | Le CV se met en page dans la page « Vos documents » (`pageResultats`), qui a déjà un précédent : les modules « Analyser ma candidature » et « Un CV, plusieurs métiers » y arrivent depuis leur propre page grâce à `_pageOrigineAvantResultats` (`js/app.js`, `naviguerVers`). Même mécanisme à reprendre ; il faut seulement indiquer le CV comme document actif (`dossier.dernierDocumentPrepare = 'cv'`) et ne pas passer par Objectif, Mon projet, Faire le point. | **Faisable avec un ajustement dans `js/app.js`**, un fichier que l'autre compte modifie en ce moment : à faire en un petit commit à part, après vérification de `git status`, et à signaler. Reste à prouver par un essai jetable avant le code définitif (les écrans peuvent attendre des champs, comme l'objectif). |
| **Intitulés repris du CV d'origine** | `_mepDefinirIntitule(origine, valeur)` (`cvPdfCartesMaquette.js`) écrit dans les réglages de mise en page (`intitulesPerso`), avec les clés de `_PDF_INTITULES`. « Autres informations » est la rubrique « Informations complémentaires » (`infos`), dont le titre est modifiable. Une seule rubrique de ce genre par CV, comme décidé. | Faisable tel quel ; à vérifier par un essai que la fonction marche avant ouverture du panneau. |
| **Indicateur « tient sur une page »** | L'application mesure déjà le nombre de pages lors de la mise en page automatique (`maxPagesAcceptable`, `essayerBonusPoliceSiPossible`, `js/app.js`) : il faut seulement en afficher le résultat. | Faisable ; à confirmer en lisant la mesure existante au moment du code. |
| Tuile dans « Mes documents » | `MES_DOCUMENTS_PARCOURS` (`data/metiers.js`) : une entrée de plus, avec infobulle, plus recherche de l'accueil et du Lexique (règle du projet). | Faisable tel quel. |
| Photo ou scan | Déjà là (OCR), sans besoin de l'outil de masquage. Le coût est faible ; seule la qualité de lecture est moyenne. **Comme la vision de Denis parle de photo et de papier, je recommande de l'inclure dès la première version**, avec la phrase « vous corrigerez à l'écran suivant ». | Faisable ; recommandation révisée (avant : l'écarter). |

**Verdict final : GO.** Aucun point bloquant. **Risqué** : la lecture du PDF en colonnes (désordre), les quatre réglages du mode fidèle, la modification de `js/app.js` pour l'arrivée directe. **Simple** : l'écriture de la fiche, le permis, les dates, les intitulés, la tuile. **Imprévu trouvé** : la lecture actuelle des PDF écrase les lignes ; sans lecteur nouveau, le module ne marcherait pas sur un PDF.

**Premier pas de code recommandé (essai jetable, sans rien livrer)** : lire un vrai PDF avec le nouveau lecteur de lignes et voir ce qu'il donne sur 3 vrais CV de Denis (en colonnes, simple, scanné). Si ce test est mauvais, on le dit avant d'aller plus loin.

## 4ter. Les deux essais jetables (22/10/2026, rien n'est livré, aucun fichier de l'application modifié)

Décisions de Denis du même jour : photo incluse dès la première version, 2 pages acceptées avec l'indicateur, tuile dans « Mes documents ».

### Essai 1 : lire un PDF en gardant les lignes (`docs/ESSAI_LECTEUR_PDF_LIGNES_2026-10-22.html`)

**Ce qui a été testé** : 8 PDF de CV fabriqués par l'application elle-même (banc de rendu, `scripts/rendu/sortie/`) : une colonne, colonne latérale, mises en page Word avec colonnes et dates à droite. Les personnes y sont inventées. **Ce ne sont pas de vrais CV de Denis** : je ne vais pas chercher ses fichiers personnels. La page d'essai lui permet de déposer les siens, lus sur son appareil, rien n'est envoyé.

**Résultats**
- **Une colonne** (modèle « équerre ») : lignes propres, une mission par ligne, date au bout de la ligne du poste (séparée par une tabulation, que le classement pourra lire).
- **Deux colonnes simples** (colonne latérale) : les deux colonnes sont lues l'une après l'autre, chaque titre reste avec son contenu.
- **Mises en page Word à colonnes et dates à droite** : lisibles et rangées par colonne, avec des défauts : quelques fragments égarés (une date « 2026 » seule), un titre coupé sur deux lignes quand il ne tient pas dans sa case.
- Un PDF d'essai anormal (texte écrit 6 fois au même endroit) : la lecture corrige l'essentiel, pas tout.
- **Il a fallu 6 corrections pour en arriver là**, toutes dans le lecteur : texte superposé, lettres espacées (« C O M P É T E N C E S »), cases d'une grille, plusieurs colonnes à la fois, éviter de couper en deux un CV d'une seule colonne, recoller les dates rangées à droite. Preuve que c'est faisable, et aussi que d'autres mises en page réelles demanderont des réglages.

**Limites connues**
- Un titre en lettres espacées perd les espaces entre mots (« CENTRESD’INTÉRÊT ») : le classement devra comparer les titres sans espaces.
- Une ligne coupée par le retour à la ligne d'une case reste en deux morceaux.
- **Photos et scans : non testés** (je n'ai pas de photo de CV ; la lecture d'image existante est de qualité moyenne).
- Sur un Word complexe en tableaux, le résultat reste parfois en désordre : c'est exactement pourquoi l'écran « Classer » (choix de la rubrique, ciseaux, fusion) existe.

**Verdict essai 1 : concluant pour les CV courants, sans promesse sur les mises en page très travaillées.** Prochaine étape utile : Denis dépose 3 de ses vrais PDF dans la page d'essai et dit ce qu'il voit.

### Essai 2 : arriver directement sur les modèles (essai fait dans la page ouverte du site, en mémoire, rien d'écrit)

1. **Écrire la fiche avec le vrai moteur** (`fusionnerDonnees` + `SPECIFICATION_IMPORT`, appelé sans écran de validation) : fonctionne du premier coup. 2 expériences, 2 formations, compétences, langues, logiciels, permis, loisirs, informations non classées bien rangés ; dates écrites « 2019-03 » ; l'ordre est chronologique ; **confirmé : l'import ajoute un point final à chaque mission** (« ... par jour. »), à neutraliser.
2. **Arriver sur « Vos documents »** : la page s'ouvre d'abord sur « Adaptation au métier » avec un message « Importez d'abord la réponse de l'assistant », et cache la mise en page, tant que `secondPasseIARequise` est vrai (`js/app.js`, ligne 23646). **Un contournement existe déjà** : le drapeau `window._decouverteVersResultats`, utilisé par le module « Découvrir mes compétences » (« le CV que Découverte produit joue déjà ce rôle »). Avec lui, la page s'ouvre **directement sur « La mise en page »**, l'aperçu du CV s'affiche, la mise en page automatique tourne (« Aucune information n'a été retirée ni ajoutée »), le bouton « Valider le CV » est là. **Ajustements à prévoir** : un drapeau propre au module dans cette condition (une ligne) ; sa propre barre d'étapes (la barre affichée était celle de Découverte).
3. **Trouvaille importante : le CV ajoute du contenu qui n'est pas celui de la personne.** Sur ce CV d'essai (loisirs : randonnée, lecture ; aucun métier visé), l'aperçu affichait en plus : en compétences comportementales « Endurance, Autonomie, Adaptabilité, Apprentissage » (**déduites des loisirs**, `deduireCompetences`), et en compétences professionnelles « Cycle des arbres fruitiers, Techniques de taille et de traitement, Botanique, Végétaux, Matériel motorisé » (**devinés à partir de deux métiers qui ressemblent au profil**, `obtenirSavoirs` avec `rechercherMetiers`). Pour une chargée de clientèle en assurance, c'est faux et contraire au principe du module. **C'est le cinquième réglage du mode fidèle** : couper ces déductions pour ce module, de façon que seules les listes écrites par la personne (`competencesCV`, `savoirEtreCV`, `savoirsCV`) soient lues. Ces deux fonctions sont dans `js/app.js` (zone modifiée par l'autre compte) : à faire en un petit commit à part, avec un essai de non-régression (les autres parcours gardent leurs déductions).
4. « Disponible immédiatement » (informations non classées) n'apparaît pas : la rubrique est facultative et cochée par la personne ; le mode fidèle doit la cocher d'office.

**Verdict essai 2 : concluant. L'arrivée directe est faisable avec un mécanisme déjà utilisé. Le mode fidèle passe de 4 à 5 réglages.**

## 5. Décisions encore ouvertes (à trancher par Denis)

- **TRANCHÉ le 22/10/2026 (Denis)** : option A, une seule rubrique libre (« Autres informations » renommable).
- Photo et scan dans la première version ? (recommandation RÉVISÉE par l'audit : oui, inclus dès le début, car la lecture de photo existe déjà et la vision de Denis parle de papier et de photo ; avec la phrase « vous corrigerez à l'écran suivant »)
- Un CV trop long pour une page avec le modèle choisi : 2 pages acceptées avec avertissement ? (recommandation : oui, avec l'indicateur et la suggestion d'un modèle plus dense)
- Nom de la tuile dans « Mes documents » (proposition : « Mettre mon CV en page, sans rien changer »).
- Emplacement : tuile dans le panneau « Mes documents » (recommandé) ou « Boîte à outils » ou 7ᵉ carte d'accueil.
- Rubrique libre : option A (une seule, « Autres informations » renommable) ou option B (illimitée, lourde) : voir la section 2bis. Recommandation : A.
- Les blocs restés « À classer » partent dans « Autres informations », et chaque ligne peut être déplacée à l'écran 3 : à valider.
- Les ciseaux (couper) et « Fusionner » : à valider pour le public cible (alternative : seulement le choix de rubrique par bloc).

## 6. Plan provisoire en cases (rien n'est codé ; ordre logique)

- [x] `[effort : haut]` Étape 1, concept grossier : parcours en 4 écrans (maquette cliquable, 22/10/2026).
- [x] `[effort : haut]` Étape 2, carte de faisabilité : GO AVEC RÉSERVES (section 4).
- [x] `[effort : haut]` Denis regarde la maquette : validée, option A choisie (22/10/2026). Reste à trancher : photo en V1, 2 pages, nom de la tuile, ciseaux (section 5).
- [x] `[effort : haut]` Étape 4 : audit complet contre le code réel, verdict final GO (section 4bis, 22/10/2026).
- [x] `[effort : haut]` Essai jetable : lecteur de PDF qui garde les lignes, testé sur 8 PDF produits par l'application (section 4ter). Reste : 3 vrais PDF de Denis dans la page d'essai.
- [x] `[effort : haut]` Essai jetable : arriver sur « Vos documents » sans passer par Objectif ni Mon projet (concluant, section 4ter).
- [x] `[effort : haut]` Décisions de Denis du 22/10/2026 intégrées : photo dès la V1, 2 pages avec indicateur, tuile dans « Mes documents » (la maquette les prévoyait déjà).
- [x] `[effort : moyen]` Code, lot 1 : logique pure et lecteur de PDF par lignes, 30 essais verts (22/10/2026, section 6bis).
- [ ] `[effort : moyen]` Code, lot 2 : fichier d'interface du module (`modules/cv-sans-assistant/index.js` : page de présentation, 4 pages, sur les composants réels de la section 6bis), `index.html`, route et tuile : attend la validation de `js/app.js` par l'autre compte.
- [ ] `[effort : haut]` Mode fidèle : les 5 réglages ciblés (sections 4bis et 4ter), banc B7 avant et après, `npm test`, recherche sur tout le dépôt, petit commit séparé pour `js/app.js`.
- [ ] `[effort : moyen]` Module neuf `modules/cv-sans-assistant/` : découpage, classement, fiches, branché sur les briques existantes (lecture de fichier, repérage, dépôt).
- [ ] `[effort : moyen]` Tuile dans « Mes documents » (`MES_DOCUMENTS_PARCOURS`, `data/metiers.js`), recherche de l'accueil et Lexique branchées dès la création (règle du projet).
- [ ] `[effort : moyen]` Indicateur « tient sur une page » sur les vrais modèles.
- [ ] `[effort : bas]` Textes, mode sombre, vérifications finales (français, tirets, mot « assistant »).

## 6ter. Sans CV du tout : remplir les rubriques à la main (demande de Denis, 22/10/2026, soir)

**Question de Denis** : une personne qui n'a pas de CV doit pouvoir remplir à la main les mêmes rubriques que celles d'un CV scanné, photographié ou déposé, et obtenir son CV.

**État avant cette demande** : l'application a déjà de la saisie à la main (parcours « Créer un nouveau CV » : choix dans des catalogues, page « Mon projet » avec ses blocs, formations ajoutées une à une), mais (1) c'est un parcours guidé pour l'assistant en ligne, pas un formulaire direct ; (2) le CV passe ensuite au moins une fois par l'assistant (« Importez d'abord la réponse de l'assistant... », `secondPasseIARequise`). Il n'existait donc PAS de chemin « je remplis des rubriques, j'ai mon CV en page ».

**Décision (recommandation, à confirmer par Denis)** : une 4ᵉ entrée sur l'écran 1, « Je n'ai pas de CV », qui mène directement à l'écran 3 (« Vérifier vos fiches ») avec **les mêmes fiches, vides**. Une seule source de vérité : le même formulaire sert au CV déposé (fiches pré-remplies) et à la saisie à la main (fiches vides), et la même écriture dans le CV (`fusionnerDonnees`). Parcours en 2 étapes (remplir, choisir le modèle) : pas d'écran « Classer », il n'y a rien à classer.

**Fait** : la maquette (entrée, fil à 2 étapes, fiches vides avec une carte d'expérience et une de formation, « Ajouter » et « Retirer cette fiche », case « Poste toujours en cours », une fiche laissée vide n'apparaît pas sur le CV) ; dans `logique.js` : `csaFicheVide()` et 2 essais (une saisie à la main donne les mêmes décisions pour la fiche du CV, des cartes vides ne produisent rien ; `npm test` : 1897 verts). Vérifié dans le navigateur : 19 informations saisies à la main, 19 sur la feuille.

**Points à décider ou à prévoir pour le vrai écran**
- **Nom du module et de la tuile** : « Mettre mon CV en page, sans rien changer » ne convient plus à quelqu'un qui n'a pas de CV. Proposition : « Remplir un modèle de CV » (la page de présentation explique les deux cas).
- **Deux champs, Nom et Prénom**, dans la fiche réelle (la maquette n'en a qu'un).
- **Aide à la saisie à la main** (le public a une confiance fragile) : à chaque rubrique, une phrase d'exemple en gris (« Exemple : Aide à domicile »), jamais un champ obligatoire. À maquetter avant le code de cet écran.
- Cette saisie ne remplace pas « Créer un nouveau CV » : celui-ci aide à trouver quoi écrire (catalogues, assistant) ; ici la personne sait déjà quoi écrire et veut seulement une belle mise en page.

## 6quater. Importer un fichier de données exporté d'une autre plateforme (CSV et autres) : question de Denis, 22/10/2026

**Verdict : faisable, mais à faire APRÈS le lot 2, et seulement avec de vrais fichiers d'exemple.** Ce n'est pas le format (CSV, JSON, XML) qui pose problème : ils se lisent sur l'appareil, sans devinette, et le fichier ZIP se lit avec JSZip, déjà dans le projet (`modules/cv-editor/jszip.min.js`). Ce qui décide, c'est que la plateforme d'origine exporte réellement des données structurées et que l'on connaisse leurs colonnes.

**Ce qui est vérifié (recherche du 22/10/2026)**
- **LinkedIn** : l'archive « Obtenir une copie de vos données » est un ZIP de fichiers CSV (dont Positions, Education, Skills, Certifications, probablement Languages et Profile). **Les noms exacts des colonnes n'ont pas pu être confirmés sur une source officielle, et ils peuvent changer d'un export à l'autre.** Écrire l'adaptateur sans un vrai export serait un pari.
- **Europass** : le CV peut s'enregistrer en XML (ou en PDF avec le XML joint) selon les sources du Cedefop ; une source plus récente dit que ce n'est plus proposé. À vérifier sur le site, avec un vrai fichier.
- **France Travail** : le CV se génère en **PDF ou en RTF**, rien de structuré. Le PDF passe déjà par le lecteur du lot 1 ; le RTF demande un petit lecteur de texte (à ajouter).
- **JSON Resume** (format ouvert utilisé par des outils de création de CV) : structure connue et stable ; adaptateur simple.
- **Le CSV que l'application produit pour Canva** est une seule ligne de texte à plat, pas un format d'échange : ne pas s'en servir pour une reprise.

**Comment ça se brancherait (rien à refaire)** : chaque source structurée devient un petit « adaptateur » qui produit les MÊMES fiches que le reste (`csaConstruireFiches` donne les fiches d'un texte, un adaptateur les donne d'un fichier). Elles arrivent à l'écran 3 « Vérifier vos fiches », sans passer par « Classer » (aucune devinette : rien n'est marqué « à vérifier »), puis la même écriture dans le CV. Un 5ᵉ choix sur l'écran 1.

**Réserves**
- **Vie privée** : une archive LinkedIn contient bien plus que le CV (contacts, messages...). Le module ne lirait que les fichiers utiles du ZIP, sur l'appareil, ne garderait rien d'autre et le dirait.
- **Portée pour notre public** : demander son archive à LinkedIn prend de quelques minutes à plusieurs heures, par courriel ; c'est peu probable pour des personnes en fragilité numérique. L'intérêt est surtout pour des personnes plus à l'aise ou un conseiller qui les aide. D'où : après le lot 2.
- **Un CSV quelconque** (colonnes inconnues) demanderait un écran « quelle colonne est le poste, l'entreprise... » : trop lourd pour ce public, non recommandé.

**Plan** (`[effort : moyen]` chacun, après réception d'un vrai fichier) : 1. lecteur RTF ; 2. adaptateur JSON Resume ; 3. adaptateur LinkedIn (ZIP de CSV) ; 4. adaptateur Europass XML si le format existe encore.

## 6bis. Code : règles de cohérence visuelle, page de présentation, lieu de travail (22/10/2026, soir)

**Règles imposées par Denis** : les boutons, leur forme et tout l'aspect doivent suivre la cohérence d'ensemble de l'application (« très très important »). La maquette HTML n'est donc PAS recopiée telle quelle dans l'application : on reprend les composants réels, et on ne crée de style neuf que pour ce qui n'existe pas (les pastilles de rubrique, sous un nom qui ne heurte pas `.pastille` ni `.jeton`, avec leur valeur en mode sombre).

| Besoin de l'écran | Composant réel de l'application à reprendre |
|---|---|
| Page de présentation | `htmlPageIntroModuleParcours(config)` + `brancherPageIntroModuleParcours(config)` + `_introBlocAccroche / _introBlocSection / _introBlocEncart` (`data/metiers.js`), exactement comme `pageIntroUnCvPlusieursMetiers` ; route `'cv-sans-assistant-intro'` ; plan de la page de `LANGAGE_VISUEL_COMMUN.md` section 5 (accroche rassurante, à quoi ça sert, ce qui va se passer, ce que ce module ne fait pas, ce que vous pourrez faire ensuite, bon à savoir) |
| Boutons Retour / Accueil / Continuer | barre fixe du bas (`.barre-navigation-fixe`, `optionsBarreIntro`, brique B.33), jamais un bouton en bas de page |
| Fil des étapes | `barreEtapesModule(etapes, indexCourant)` (visuel seulement, comme les autres modules) |
| « Revoir la présentation » | bouton standard obligatoire de tout module (`_prepLEBandeRevoirSurEcran`) |
| Blocs dépliants (fiches) | `<details class="bloc-depli">`, toujours ouverts |
| Choix du modèle | `.jeton .jeton--radio .jeton--compact` (déjà utilisé dans la maquette) |
| Bouton qui pousse | `.bouton-incitation-action`, formes des boutons `.btn` de l'application |
| Alertes et encarts | encarts avec filet gauche accent (langage visuel commun) |
| Tuile d'entrée | une entrée de plus dans `MES_DOCUMENTS_PARCOURS` (`data/metiers.js`), avec infobulle |
| Recherche | catégorie ajoutée à la recherche de l'accueil dès la création (règle du projet) ; Lexique si pertinent |
| Aide | `AIDE_PAGES['cv-sans-assistant-intro']` et `['cv-sans-assistant']` |
| Suivi | événements Umami du même type que les autres modules |
| Vérifications de chaque écran | mode sombre, 375 px, accents, aucun tiret long, aucun mot « IA » |

**Où travailler (question de Denis : le cloud ?)** : voir la réponse donnée à Denis le 22/10/2026 : le travail reste ICI. Raisons vérifiées : (1) le dépôt GitHub `ursdac-jpg/APP` est un instantané du site publié le 18/10/2026 (dernier commit « historique détaillé non envoyé »), le dépôt local est 3702 commits plus loin : une session dans le cloud partirait d'une version ancienne, sans les quatre derniers jours de travail ni ce cahier ; la mettre à jour reviendrait à publier tout le travail en cours, ce qui est une décision de Denis ; (2) tout ce qui touche l'écran demande un test dans un navigateur, que je fais ici avec le navigateur intégré ; (3) les vrais PDF de Denis restent sur son poste ; (4) le « serveur » local n'est qu'un serveur de fichiers (`serveur_dev.py`), sans rien de lourd. Le cloud ne servirait qu'à la logique pure testée par `npm test`, déjà faite ici.

**Fait le 22/10/2026 (commit : voir le journal git)** : `modules/cv-sans-assistant/lecteurPdf.js` (lecteur de PDF par lignes, fonctions pures + une fonction pdf.js), `modules/cv-sans-assistant/logique.js` (classement, fiches, décisions pour `fusionnerDonnees`, gestes de la personne), `tests/cvSansAssistantLecteur.test.js` et `tests/cvSansAssistantLogique.test.js` (30 essais ; `npm test` : 1892 verts). Vérifié dans le navigateur sur 5 PDF de l'application : mise en page classique = 0 bloc « à classer », identité, expériences, missions, formation, certification, compétences, qualités, langues, loisirs bien rangés ; colonne latérale = bien rangé, 2 blocs à classer ; Word complexe = utilisable mais plus de blocs à classer et quelques fragments (voir 4ter). Missions écrites sans aucun mot ajouté.
**Pas encore fait** : l'interface (pages, tuile, route, barre d'étapes), le mode fidèle (5 réglages dans `js/app.js`), le branchement de l'arrivée directe. **Bloqueur pratique** : ces trois points touchent `js/app.js` (et `index.html`, `data/metiers.js` pour la tuile et la page de présentation), et `js/app.js` porte des modifications non validées de l'autre compte (vu dans `git status`). À faire en petits commits séparés, une fois ces modifications validées de son côté, pour ne rien écraser.

**Verdict mode nuit : NON APTE** : l'interface reste à écrire sur les composants réels et à vérifier écran par écran dans le navigateur, et les changements de `js/app.js` doivent attendre que l'autre compte ait validé les siens.

## 6quinquies. Lot 7 : intégration dans « Reprendre mon CV », voie 3 (audit et maquette du 26/10/2026, rien codé)

**Maquette d'intégration** : `docs/MAQUETTE_REPRENDRE_VOIE3_2026-10-26.html` (la vraie page « Reprendre votre CV » avec le CV déjà déposé, la voie 3 ouverte, puis Classer, Vérifier, Vos documents, et un onglet « Inventaire et plan » avec les étiquettes GARDÉ / ENRICHI / FUSIONNÉ / DÉPLACÉ / NOUVEAU, aucun RETIRÉ). Vérifiée dans le navigateur : clair, sombre, 375 px, aucune erreur.

**Décisions de Denis (26/10/2026)** : le dépôt du point 1 est commun aux trois voies, donc **pas d'écran « Déposer »** dans la voie 3 ; le fichier déposé est **gardé en mémoire** par le dépôt partagé pour que le lecteur de PDF retrouve les lignes ; **mode fidèle** (5 réglages) fait, éteint par défaut ; **trois sous-lots**. « Je n'ai pas de CV » reste dans « Créer un nouveau CV » (à la main).

**Audit du code (26/10/2026)** : (1) `lireFichierCV` aplatit un PDF sur une seule ligne et le texte déposé ne garde pas le fichier : sans le fichier, le classement est inutilisable ; (2) le texte relu n'a plus les coordonnées : l'identité vient de `_identiteCaptee` (`memoriserIdentiteCaptee`, `data/metiers.js`) ; (3) la voie 3 est grisée à `data/metiers.js:8653` (`v.id === 'sans'`) et `_reprendreCvChoisirVoie` ne la connaît pas ; (4) `modules/cv-sans-assistant/` contient la logique et le lecteur (30 essais) mais aucune interface, et n'est pas chargé par `index.html` ; (5) « Vos documents » s'ouvre sans l'assistant avec `window._decouverteVersResultats` (`secondPasseIARequise`, `js/app.js` vers la ligne 24717) ; (6) les 5 réglages du mode fidèle sont à revérifier au moment du code (le code de `js/app.js` a beaucoup bougé depuis le 22/10).

**Verdict : GO AVEC RÉSERVES, NON APTE AU MODE NUIT.**

**Plan en cases**
- [x] `[effort : haut]` **7a** (fait le 26/10/2026) : voie 3 branchée (carte fermée par `CSA_OUVERT`, ouverte pour l'essai), bandeau de progression, fichier déposé gardé en mémoire (`obtenirOuDeposerTexteCV` rend `fichier`, `_prepLEEtat.cvFichier`), lecteur de PDF par lignes, écran « Classer » (pastilles, ciseaux, fusion, « Peut-être : ... ? », surlignage des coordonnées), `index.html`, route, styles clairs et sombres, 25 essais Node et 14 contrôles navigateur (`voie3Classer`), vérifié clair, sombre et 375 px. **Décisions appliquées** : carte « je les remets en page moi-même » ; PDF perdu au rechargement : phrase claire pour redéposer ; « Vos appuis » masqué dans « Créer un nouveau CV » sans assistant.
- [x] `[effort : haut]` **7b** (fait le 26/10/2026) : écran « Vérifier » (identité préremplie, « à vérifier », ajouter ou retirer une fiche, déplacer une ligne, y compris vers l'accroche), écriture dans le CV, arrivée sur « Vos documents » (sans assistant, sans réglage « pour l'assistant »), mode fidèle, carte de la voie 3 **ouverte** (`CSA_OUVERT = true`). Mesuré sur un CV riche (65 éléments) : tout est sur le CV, rien n'est ajouté ni déduit, alors qu'avant le mode fidèle 9 éléments manquaient et 3 étaient inventés (« Endurance », « Encaissement », « Rendu de monnaie »). Banc de rendu 39 sur 39 sans écart ; « Précédent » vérifié avec de vrais clics (documents, vérifier, classer, voies).
  **Mode fidèle, ce qui a été réellement nécessaire** (le cahier en prévoyait 5, l'essai en a montré 5 autres) : lecture des seules listes écrites par la personne ; aucune mission retirée ; aucune qualité du métier visé ; plafonds de compétences et de lignes levés ; toutes les missions (`missionsGlobal`) et toutes les informations complémentaires affichées d'emblée. Rien n'a été changé pour les autres parcours (drapeau `dossier.modeFidele === true`).
- [x] `[effort : moyen]` **7c** (fait le 26/10/2026) : titres d'origine du CV repris comme intitulés de rubriques (`csaIntitulesDOrigine`, clé = nom d'origine de la rubrique, `choixMq.intitulesPerso`) ; l'indicateur « Estimation : le CV tient sur 1 page » existait déjà dans « Vos documents » (GARDÉ, vérifié par l'essai) ; mots de recherche de l'accueil ajoutés à « Reprendre mon CV » ; aide `AIDE_PAGES['cv-sans-assistant']` ; mode sombre vérifié. **Reste : les essais réels de Denis** (vrais PDF, Word, photo) et, si besoin, une suggestion d'un modèle plus dense pour un CV qui déborde.

**Questions restantes pour Denis** : texte de la carte (« je les modifie à la main » ou « je les remets en page moi-même ») ; PDF perdu au rechargement de la page (phrase claire pour redéposer) ; 2 pages acceptées avec l'indicateur.

## 7. Pour reprendre

Lire ce fichier, puis ouvrir la maquette (`http://localhost:8123/docs/MAQUETTE_CV_SANS_ASSISTANT_2026-10-22.html`). Ne rien coder avant le feu vert de Denis sur la section 5 et l'audit de l'étape 4.
