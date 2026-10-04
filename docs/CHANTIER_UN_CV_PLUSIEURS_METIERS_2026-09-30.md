# Chantier « Un CV, plusieurs métiers » (titre de travail) - conception ouverte le 2026-09-30, Mode A

> **Statut : philosophie et parcours posés avec Denis en conversation. Aucun code. Aucune maquette valable pour l'instant.**
> Ce fichier est la mémoire commune des deux comptes. **Toute maquette de ce module doit partir d'ici**, pas de `MAQUETTE_OU_CHERCHER_CONCEPT_2026-09-29.html` (autre concept, voir section 7).
> Nom : titre de travail, à valider par Denis.

## 1. Le but (validé par Denis le 2026-09-30, reformulé en une phrase)

Une personne dépose son CV. Avec les compétences qu'il montre, l'assistant en ligne repère **les autres métiers qu'elle pourrait exercer**. Elle en choisit **5 au maximum** et obtient **5 CV** : même corps, seuls **l'intitulé (titre) et l'accroche** changent. Elle peut ainsi candidater dans **5 entreprises différentes**, sur 5 métiers qui partagent ses compétences, et accroître ses chances.

Origine : observation de terrain de Denis (exemple : un cariste peut aussi viser magasinier, préparateur de commandes, employé libre-service) et demande d'autres CIP. Objectif de fond : alléger les CIP dans la rédaction des documents de techniques de recherche d'emploi (TRE), pour dégager du temps de conseil et de mise en relation.

## 2. Philosophie et garde-fous (décidés)

- **La personne choisit, seule.** Aucun indicateur, aucun classement, aucun conseil, aucune recommandation de métier. Le module montre, elle décide. Les territoires et les périodes changent la réalité : c'est à elle d'arbitrer.
- **Jamais un score, jamais un diagnostic sur la personne.** Formulation « pistes à regarder ».
- **Rien d'inventé** dans le CV : le corps ne bouge pas. Le titre est un **poste visé**, pas une expérience acquise.
- **On n'est pas un répertoire d'offres.** Aucune offre n'est importée dans l'application. Pas de scraping, pas de base d'offres à maintenir.
- **Le nombre d'offres en ligne** (via un moteur de recherche externe) est présenté comme une **photo du moment**, sans certitude ni garantie ni conseil. Une phrase de prudence sur notre écran avant le clic, et la même demande dans le prompt.
- Un même employeur ne reçoit pas plusieurs CV : non-sujet, le but est d'aller vers des employeurs **différents** (précision de Denis).
- Vocabulaire : « l'assistant en ligne », jamais « IA » visible. Français impeccable, aucun tiret cadratin, mode sombre, icônes objets.

## 3. Parcours cible (à maquetter, dans cet ordre)

1. **Dépôt du CV** : composant partagé (dépôt, relecture, masquage). Si extraction douteuse ou incohérente : premières questions à la personne.
2. **Premier passage** vers l'assistant en ligne : corriger et enrichir le CV comme le fait déjà l'application, **et** proposer **jusqu'à 10 intitulés de métiers réellement différents** (pas le même poste dit deux façons), cohérents avec les compétences repérées. Denis a testé : 7 à 9 propositions utiles, donc « jusqu'à 10 » sans forcer le chiffre.
3. **Écran de sélection des propositions** avec un bouton « voir les offres en ce moment » : une recherche groupée sur tous les métiers encore en lice, avec le **département** de la personne, qui demande un **récapitulatif par métier** (métier 1 : environ tant d'offres, etc.). Ouverture d'un onglet du moteur de recherche externe (voir section 5).
4. **La personne choisit jusqu'à 5 métiers.**
5. **Édition des 5 CV** : boutons visibles **1 à 5** pour passer d'un CV à l'autre. Chaque CV a son titre de métier et **2 accroches proposées** (au choix, modifiable à la main). Corps identique et **même mise en page** pour les 5 : un réglage de mise en page vaut pour tous.
6. **Fin de parcours** : même bouton de recherche d'offres, cette fois limité aux 5 métiers retenus (même fonction, liste différente).
7. **Export** : les 5 CV **dans un seul PDF** (et téléchargement individuel), plus **5 lettres de motivation en candidature spontanée** axées sur les 5 CV (recherche large, pas de nom d'entreprise ; le cas d'une entreprise précise passe par un autre module).

## 4. Décisions techniques de principe (à vérifier dans le code avant la maquette détaillée)

- **Un dossier de base + une liste de variantes légères** (titre + accroche choisie), jamais 5 dossiers complets : une seule source de vérité, une correction se répercute sur les 5. À vérifier : le rendu PDF/Word sait-il lire un titre et une accroche « surchargés » sans copier tout le dossier ?
- **Réutiliser, ne rien réinventer** : composant partagé d'import CV, moteur de rendu PDF/Word existant, moteur de lettre existant (mode candidature spontanée à confirmer), mécanisme d'accroche et de versions d'accroche déjà présent (`titreAccrocheResponseParser.js` et chantier R9 : à vérifier), mécanisme d'écran tampon et de sortie vers un site externe, `demanderDepartementSiInconnu()` pour le territoire.
- **Une seule fonction** « construire la recherche d'offres à partir d'une liste de métiers », appelée deux fois (les propositions, puis les 5 retenus).
- **Points risqués à examiner** : export PDF fusionné de 5 CV (précédent : « Remplir la page » en A5, mais pas de fusion multi-CV A4 connue) ; 2 accroches par variante x 5 ; passage 2e prompt pour les 5 lettres.

## 5. Recherche d'offres en ligne : ce qui est vérifié et ce qui ne l'est pas

- **Vérifié le 2026-09-30 (navigateur intégré)** : l'adresse `perplexity.ai/search?q=<recherche>` lance la recherche toute seule et affiche de vrais résultats, sans connexion.
- **Contradiction à lever** : `project_assistants_sans_compte_etat_2026-09-29` (mémoire) note « Perplexity exige la connexion ». À retester avec le vrai prompt (plusieurs métiers, département, tableau récapitulatif) sur un poste ordinaire avant de bâtir dessus.
- **Un seul moteur** proposé (choix de Denis, recommandation validée : moins de décisions pour le public). Risque assumé : dépendance à un service tiers, surveillance à prévoir.
- Le prompt de recherche demande explicitement un récapitulatif par métier et précise que les nombres sont approximatifs.

## 6. Questions encore ouvertes

- [ ] **Nom du module** (titre de travail : « Un CV, plusieurs métiers »).
- [ ] **Place sur l'accueil** : carte « Vous hésitez encore ? » ou « Mes documents » (le module produit des CV).
- [ ] **Un module ou deux** : recommandation = un seul module ; la partie « autres noms du même métier » de l'ancien concept n'en fait pas partie (Denis veut des métiers différents).
- [ ] Le module part-il aussi d'un CV **déjà construit dans l'application**, ou seulement d'un dépôt ?
- [ ] Wording de la phrase de prudence sur les offres.
- [ ] Retest Perplexity (section 5).

## 7. Rapport avec `MAQUETTE_OU_CHERCHER_CONCEPT_2026-09-29.html` et `CHANTIER_OU_CHERCHER_2026-09-29.md`

Réalisés par un autre compte à partir de notes anciennes (21 et 25 septembre), sans ce qui est décidé ici. Couverture : environ un tiers. Contradictions : « rien n'est appliqué au CV » (ici, le module produit les CV), et « CV par piste » classé chantier séparé à risque élevé (ici c'est le cœur). **À reprendre** : garde-fous, « Retrouvé dans votre CV » (citer uniquement ce qui est dans le CV), « À vérifier », bouton de vérification sur France Travail, audit de l'existant (`data/metiers.js` 129 fiches, `carteMetierResumeHTML()`, briques de la famille 2).

## 8. Prochaines étapes

- [ ] Denis valide le nom.
- [ ] Nouvelle **maquette concept** (étape 1) à partir de ce fichier.
- [ ] Carte de faisabilité (étape 2) : export PDF fusionné, variantes titre/accroche, lettres, retest Perplexity.
- [ ] Maquette détaillée (étape 3), audit contre `LANGAGE_VISUEL_COMMUN.md` et `BRIQUES_COMMUNES.md` (étape 4), verdict Mode Nuit.
- [ ] Prompts dédiés dans `prompts/`, testés sur de vrais CV.

## 9. Audit du code réel (2026-10-01, Mode A, effort haut) - avant tout plan détaillé

**Simple (reprise de l'existant)** : dépôt, relecture, masquage, choix de l'assistant et collage de la réponse (briques de la famille 2 : `ouvrirAssistantDepotCV`, `htmlVerificationDocument`, etc.) ; cartes métiers `carteMetierResumeHTML()` ; genre du candidat (`modules/cv-core/genreCandidat.js`) ; panneau « Candidature » partagé ; versions d'accroche longue et courte (`modules/cv-core/normaliserDonneesCV.js`, rang `accrocheIdx`) ; département (`demanderDepartementSiInconnu`). Le rendu PDF reçoit déjà le dossier en paramètre (`ouvrirApercuPdfHtml(type, dossierSource)` dans `modules/cv-pdf-html/cvPdfExport.js`) : une variante = copie légère du dossier où seuls `titreCV` et l'accroche (`ia.cv.profil`) sont remplacés, rendue cinq fois. Aucun dossier complet dupliqué.

**Risqué, à prouver par un petit prototype avant la maquette** :
1. **PDF fusionné** : l'export PDF passe par l'impression du navigateur (iframe puis `print()`), pas par un fichier fabriqué. Mettre cinq feuilles A4 dans un seul document imprimable avec saut de page est faisable en principe, jamais fait. **Word fusionné : non garanti, ne rien promettre** (un fichier Word par CV est le repli).
2. **Surcharge du titre et de l'accroche** : `titreCV` est lu à plusieurs endroits (extraction, normalisation, Word, Mini CV A5, lettre). Il faut un grep complet pour vérifier que la variante passe partout, sinon un CV sortirait avec le titre de base (défaut invisible à l'écran).
3. **Cinq lettres spontanées sans entreprise** : l'objectif « spontanée » existe (`js/app.js` ~5208) mais il est pensé pour une entreprise précise. À vérifier dans `prompts/lettre.md` ; deuxième passage assistant à prévoir.
4. **Premier passage** : jusqu'à 10 métiers réellement différents. Recommandation : prompt dédié léger (`prompts/`), sans alourdir `reformuler-cv.md`.
5. **Titre = poste visé, jamais une expérience acquise** : réutiliser la règle du titre réglementé déjà posée (chantier R13 de `CHANTIER_RETOURS_TEST_REFORMULER_2026-09-29.md`) pour ne jamais afficher un titre qui exige un diplôme ou une habilitation que la personne n'a pas.
6. **Perplexity** : dans le code, seule une entrée de liste d'assistants existe (`js/app.js` ~29559). L'adresse `?q=` fonctionne (vérifié le 2026-09-30) mais une contradiction avec la mémoire reste à lever par un retest.

## 10. Chantier suivant, noté pour ne pas le perdre (demande de Denis, 2026-10-01) : répertoire des entreprises par bassin d'emploi

But : montrer, **par bassin d'emploi du département et par secteur d'activité**, des entreprises installées depuis des années, qui recrutent de façon occasionnelle ou régulière, publient leurs offres sur leur site ou chez des partenaires, et où l'on peut déposer une candidature spontanée, avec un maximum de coordonnées. **On ne répertorie pas les offres** : on aide la personne à construire un prompt pour aller chercher elle-même les offres du moment (ChatGPT ou Perplexity). Ce prompt est la **même fonction** que la recherche d'offres du chantier ci-dessus (une seule source), ici avec le métier et le bassin.

Points francs à trancher avant tout plan (rien n'est décidé) : critères de sélection vérifiables (ancienneté vérifiable par le registre Sirene, page « recrutement » présente sur le site ; « recrute régulièrement » n'est pas vérifiable proprement) ; coordonnées **d'entreprise uniquement, jamais de personne nommée** ; date de vérification sur chaque ligne et circuit de mise à jour (modèle : `modules/comprendre-le-cadre/liens-verifies.txt`) ; volume réaliste par bassin et par secteur ; Haute-Vienne d'abord, structure prévue pour la Dordogne ; formulation neutre (pas de classement, ni de recommandation, ni d'apparence de partenariat). Ce chantier démarre seulement après le plan détaillé du chantier « Un CV, plusieurs métiers ».

## 11. Décisions de Denis du 2026-10-01 (elles priment sur les sections 3 et 6 en cas de différence)

- **Nom validé** : « Un CV, plusieurs métiers ». **Un seul module.** **Point de départ : dépôt de CV seul** (pas de CV déjà construit dans l'application pour la première version).
- **Parcours** : dépôt, lecture, anonymisation, premier passage. Retour : **synthèse du CV** (métier, compétences clés, expériences) puis **deux colonnes**. Gauche : autres intitulés du **même** métier. Droite : jusqu'à 10 **autres métiers** qui utilisent les mêmes compétences. Le métier du CV apparaît dans la liste avec la mention « titre utilisé actuellement », **sans être coché d'office**.
- **Chaque colonne a, en bas, son propre prompt de recherche** (offres du moment, structures qui recrutent, difficulté et projets de recrutement). Il ne reçoit que des noms de métiers et le département, **jamais le CV**. Le résultat reste dans l'onglet du moteur externe (ChatGPT ou Perplexity, un seul proposé) : **aucune statistique affichée dans notre écran**. Pas de « pourcentage d'embauche » (aucune source publique fiable métier par métier) : remplacé par « difficulté de recrutement » et « projets de recrutement », avec sources et dates exigées, « non trouvé » plutôt qu'une estimation.
- **Cases à cocher : 10 au maximum pour les deux colonnes ensemble, pas de minimum.** Le bouton « Créer mes CV » apparaît dès 2 cases cochées. (Remplace le plafond de 5 de la section 1.)
- **Accroche : phrase courte uniquement** (jamais une lettre de motivation déguisée). Des versions longues ne seront envisagées que si les essais de prompt en montrent l'intérêt. Le langage s'adapte au **type de structure, à l'entreprise, au secteur, au métier et au genre** de la personne (réutiliser `modules/cv-core/genreCandidat.js`). **Question sur la structure** : si on l'a, on adapte ; sinon une phrase générique.
- **Export** : un seul PDF de plusieurs pages (un CV par page), chaque CV identifiable, téléchargement individuel possible.
- **Lettres de motivation : gardées, à la demande**, générées **après** les CV. Idée à étudier : regrouper en un seul passage les lettres des intitulés d'un même métier (colonne de gauche), pour ne pas faire un passage par lettre.
- **Recherche d'offres en fin de module** : même fonction que les colonnes, sur les métiers retenus regroupés ; les offres restent consultables en ligne, **jamais importées** dans l'application. Le prompt demande aussi les appellations voisines de chaque métier.

## 12. Tri des réponses de Perplexity et de ChatGPT (2026-10-01, effort moyen)

**Vérifié par Claude le 2026-10-01** : la page BMO de France Travail existe (recherche par zone jusqu'au bassin d'emploi, par métier, nomenclature FAP 2021, documents téléchargeables) ; la page Data Emploi confirme l'indicateur de difficulté de recrutement Dares et France Travail et **l'absence d'un taux d'embauche par métier** ; l'API Offres d'emploi existe mais **exige une inscription** et n'est pas appelable proprement depuis un site statique. **Non vérifié** : l'adresse du PDF Dares (collée coupée dans la réponse), les chiffres exacts cariste en 87 et aide-soignant en 24 (Perplexity n'a pas ouvert les pages et le dit), la date « mars 2025 ».

**Constat de conception majeur** : le long brief ne passe pas dans Perplexity **sans compte** (confirmé par Denis ; l'adresse `?q=` a de toute façon une longueur limitée). Conséquence : les prompts de recherche du module doivent être **courts** (métiers + département + « nombre approximatif d'offres, sources et dates, "non trouvé" plutôt qu'une estimation » + appellations voisines réellement utilisées). Prévoir aussi un bouton « Copier » pour qui préfère coller. Le texte long de ChatGPT sert de modèle de fond, pas de texte final.

**À garder (Perplexity)** : pas de taux d'embauche (décision confirmée) ; trois repères honnêtes seulement : offres du moment (photo, pas des embauches), projets de recrutement BMO avec **nombre absolu** et part jugée difficile, tension Dares et France Travail ; BMO et tension sont par **famille de métiers**, pas par intitulé exact : le dire. **À écarter** : appel direct de l'API France Travail (clé et inscription, contraire à « aucune offre importée ») ; salaires, emploi salarié, accès à l'emploi (hors sujet). **En réserve (idée, pas la première version)** : « métiers retrouvés » de Data Emploi (transitions observées) pour nourrir la colonne de droite par des données réelles.

**À garder (ChatGPT)** : récapitulatif avant génération (« Vous avez choisi 3 métiers, nous créons 3 CV, vous pourrez revenir ») ; phrase « Vous n'avez pas besoin de tout choisir » ; bouton « Vérifier cet intitulé » (recherche préremplie, la personne garde la main) ; « Retirer » avec « Annuler » ; mention « À vérifier : ce métier peut nécessiter... » seulement quand c'est vrai (réutilise la règle du titre réglementé) ; banc d'essai : grille de contrôle identique pour les 6 CV, extraction et propositions testées séparément, test de biais de genre et d'âge, résultats bruts conservés. **À écarter** : la règle bloquante « intitulé attesté par plusieurs annonces » (l'application ne stocke aucune offre, donc elle ne peut pas la contrôler : la vérification passe par le bouton et par le prompt). **À tester** : bouton « Modifier » sur la synthèse du CV (la synthèse existe déjà dans le parcours).

**À décider par Denis** : afficher d'abord 5 propositions par colonne avec « Voir d'autres » (ChatGPT, recommandé par Claude) ou tout afficher d'emblée.

## 13. Concept grossier de l'écran 1 (image de ChatGPT, 2026-10-01) : revue et corrections à porter à la maquette détaillée

Image de référence : `docs/images_chantiers/un_cv_plusieurs_metiers_concept_ecran1_2026-10-01.webp` (disposition seulement : les textes de l'image sont ceux de l'outil, pas les nôtres). **Rien n'est codé ni maquetté en détail.** Verdict préliminaire de faisabilité de l'écran 1 : **GO AVEC RÉSERVES** (synthèse, colonnes, cases, plafond de 10, barre du bas : simples ; boutons d'offres : brique commune Perplexity déjà existante ; réserves : qualité des listes de l'assistant à tester sur 6 CV, affichage téléphone).

**À corriger par rapport à l'image** :
1. Sous-titre « métiers qui correspondent à votre profil » : suggère un diagnostic. Dire « qui utilisent vos compétences ».
2. Textes de colonne « Cochez ... pour voir les offres » : faux, cocher sert à choisir les CV, les offres ont leur propre bouton.
3. Trois boutons bleus pleins de même poids : « Créer mes CV » doit dominer, les deux boutons d'offres passent en bouton bordé.
4. Sous chaque métier de gauche, la même phrase répétée : à retirer. À droite, « Retrouvé dans votre CV » doit citer 1 ou 2 éléments **propres à ce métier et réellement présents dans le CV** (jamais la même ligne partout).
5. Absent : mention « À vérifier : ce métier peut nécessiter... » (habilitation, permis) quand c'est vrai ; phrase fixe « Ces propositions servent uniquement à adapter votre candidature. Elles ne rajoutent aucune expérience à votre CV. » ; bouton « Vérifier » et boutons d'offres = sortie de l'application, avec la mention « vous quittez l'application ».
6. **Téléphone** : deux colonnes impossibles sur petit écran, elles s'empileront ; barre du bas fixe à prévoir. Le public utilise beaucoup le téléphone : la maquette détaillée doit montrer les deux formats.

**Tri de la seconde réponse de ChatGPT** : redondante avec la première. Nouveau et retenu : la phrase « Le contenu de votre CV reste identique. Seuls le poste visé et la phrase d'accroche changent. » avant la création ; un récapitulatif avant création (fusionné avec l'idée « Relire avant créer », une seule étape) ; au banc d'essai, le même CV avec prénom masculin, féminin et date de naissance absente doit donner les **mêmes métiers** (seuls les accords changent) ; contre-exemples à tester (jamais pharmacien, conducteur SPL, grutier, infirmier sans les qualifications). Réécarté : la règle « intitulé attesté par plusieurs annonces » (non contrôlable, voir section 12). Le texte de recherche proposé (avec tableau récapitulatif) est plus court que le premier : à raccourcir encore et à tester dans la fenêtre de Perplexity sans compte.

## 14. Seconde image de ChatGPT (2026-10-01) : c'est l'écran de FIN, pas l'écran d'édition

Image : `docs/images_chantiers/un_cv_plusieurs_metiers_concept_ecran_fin_2026-10-01.webp` (« Vos CV sont prêts » : une carte par CV avec Voir et Télécharger, un seul PDF, lettres de motivation, recherche d'offres, bouton Continuer). **Même niveau visuel et même univers que l'écran 1, retenu comme écran 3 (fin de parcours).** Mais elle ne remplace pas l'écran d'édition demandé (aperçu du CV, titre modifiable, 2 accroches courtes au choix, question sur la structure, boutons 1 à 3) : **l'écran d'édition reste à faire**. Points à corriger : les phrases « Disponible rapidement » et « Motivé pour... » **inventent** une disponibilité et une motivation absentes du CV (interdit : afficher à la place la vraie phrase d'accroche, modifiable) ; nom de fichier « CV - Plusieurs métiers.pdf » à remplacer par le format NOM_poste ; « Continuer » sans destination claire (prévoir « Modifier mes choix » pour revenir en arrière, et une vraie fin de parcours) ; la phrase « lettres... ajouter le nom d'une entreprise » est cohérente avec la règle « générique si la structure est inconnue ». Faisabilité de cet écran : Voir et Télécharger par CV = chaque CV rendu seul puis imprimé (faisable), un seul PDF = les pages assemblées dans un document imprimable (à prouver par prototype).

## 15. ALERTE du 2026-10-01 (soir) : Perplexity exige maintenant un compte, même par adresse `?q=`

Retest fait par Claude dans le navigateur intégré : `perplexity.ai/search?q=...` lance bien la recherche, puis affiche « Inscrivez-vous et répétez votre demande » (aucune réponse sans compte). Denis constate la même chose dans la fenêtre de dialogue, même avec un texte court. Le test du 2026-09-30 (qui fonctionnait) est **périmé** : le risque « dépendance à un service tiers » de la section 5 s'est réalisé en un jour. **La décision « un seul moteur : Perplexity » est à rouvrir.** Piste recommandée : bouton « Copier ma demande » + ouverture de l'assistant au choix de la personne (brique de choix d'assistant déjà présente dans l'application ; un essai ChatGPT sans compte avait réussi le 2026-09-29), sans dépendre d'une adresse qui peut changer de politique. À trancher avec Denis.
