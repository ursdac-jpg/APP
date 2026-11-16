# Chantier : aider à écrire le CV avec les fiches du ROME, avec ou sans assistant (14/11/2026)

**Origine** : remarque de Denis le 14/11/2026 en regardant la maquette du choix par expérience. La finalité du module de création de CV est le CV lui-même, fidèle à l'expérience et à la personne ; les trois questions du parcours ne servent aujourd'hui qu'à proposer des métiers. Denis demande comment aider la personne à écrire son CV, sans assistant, avec les compétences et missions des fiches du ROME, et comment alléger le prompt quand la personne choisit elle-même ses compétences.

**État : audit fait (lecture seule), proposition à valider par Denis, rien codé.** `[effort : haut]`

## Audit du code réel (14/11/2026)

- **Ce que les trois questions du parcours produisent aujourd'hui** : (1) les propositions de métiers ; (2) quelques compétences génériques (`deduireCompetences()`, js/app.js vers la ligne 3328) tirées des catalogues de choix (chaque carte cochée porte 2 à 4 compétences), qui alimentent « Votre profil, Vos compétences » et le bloc « Compétences et logiciels » du CV. **Aucune mission, aucun lien avec une expérience, aucune compétence tirée d'une fiche du ROME.** Denis a raison : ces choix n'améliorent presque pas le texte du CV.
- **Ce que la fiche du ROME contient et que l'application n'utilise pas pour le CV** (`data/rome/fiche_*.js`, chargé à la demande par `chargerFicheRome`) : `d` présentation, `m` **missions en langage courant**, `k` **compétences détaillées**, `s` savoirs, `p` métiers proches, `n` autres noms du métier, `ri` **lettres RIASEC** (majeure puis mineure). Aujourd'hui lues seulement pour afficher la fiche d'un métier (descriptions, RIASEC à l'écran). Les fiches de la base (`baseMetiers`) portent en plus `savoirFaire` (5,3 en moyenne), `savoirEtre` (3,9) et `savoirs` (6,0) pour les 1 790 fiches du ROME.
- **Parcours « sans assistant » existant** (cahier `CHANTIER_CREER_CV_SANS_ASSISTANT_2026-10-25.md`) : il fonctionne, mais le CV a une accroche vide, des missions « telles que saisies » et des compétences issues du calcul local ci-dessus. C'est le trou que Denis décrit : la personne doit écrire seule ses missions.
- **Rattachement poste vers fiche** : déjà en place (`preparerRepertoirePourExperience`, `ficheDeIntituleChoisi`, répertoire de 13 800 intitulés).

## Proposition (non codée)

Nouvelle étape, **par expérience saisie dans « Vos informations »** (là où les métiers apparaissent, pas dans les trois questions) :

1. L'application retrouve la fiche proche du poste (nom, autres noms, métiers proches). Si plusieurs fiches conviennent, la personne choisit ; sinon elle passe.
2. Elle voit les **missions** de la fiche, en cases à cocher, modifiables : celles cochées deviennent les missions de cette expérience sur le CV (`dossier.experiences[i].missions`, déjà lu partout).
3. Elle voit les **compétences** de la fiche (savoir-faire, savoir-être, savoirs), à cocher : elles vont dans `competencesCV`, `savoirEtreCV` et `savoirsCV` (déjà lus par le CV et par le prompt).
4. Libellé honnête : « proposé d'après la fiche officielle du métier : ne cochez que ce que vous avez vraiment fait ».
5. **Sans assistant** : le CV est complet (missions, compétences) sans écrire de phrase. **Avec assistant** : le prompt reçoit des missions et compétences **déjà choisies par la personne** : il n'a plus à les deviner, il peut être resserré (à mesurer sur le prompt réel avant de le réduire, consigne « ne pas baisser les quantités demandées »).

**Les trois questions du parcours** : une seule liste, sans présenter les métiers exercés (décision de Denis), plafonds éventuellement relevés ; elles restent au service des recommandations de métiers. Un module séparé « découvrir un métier ou s'orienter » (questions reformulées en préférences, RIASEC déjà présent dans les fiches, autres tests) est à prévoir plus tard.

## Risques à dire clairement

- La personne peut cocher ce qu'elle n'a pas fait : formulation prudente, tout reste modifiable, rien n'est ajouté sans clic.
- Les missions de la fiche sont écrites à la troisième personne du singulier (« Manœuvre et manipule… ») : lisible sur un CV, à vérifier sur quelques fiches ; certaines sont longues.
- Un poste très atypique ne trouve pas de fiche : l'étape est alors sautée, saisie libre inchangée.
- Fidélité : un CV bâti sur des missions standard peut ressembler à celui d'une autre personne : prévoir un champ « ajouter votre mission » à chaque expérience.
- Chantier moyen à gros : écran nouveau, maquette avant code, test navigateur obligatoire, vidéos à refaire.

## Question annexe de Denis (« cuisiner » rangé dans « Fabriquer et construire »)

Constat : aucune action « servir » n'existe ; le serveur est décrit par vendre, conseiller, encaisser. Proposition : une famille « Cuisiner et servir » (cuisiner déplacé, nouvelle action « servir à table ou au comptoir », éventuellement « préparer des boissons »), puis étiquetage des fiches de restauration (35 fiches portent « cuisiner »). Décision de Denis attendue.

## Maquette de l'étape « Vos missions et compétences » (14/11/2026) : faite, en attente des réponses de Denis

Fichier : `docs/MAQUETTE_MISSIONS_COMPETENCES_PAR_EXPERIENCE_2026-11-14.html` (cliquable, données réelles des fiches : missions du ROME, compétences de la fiche, activités détaillées ; thème sombre, version téléphone, panneau de réglages refermable).

Ce qu'elle montre :
- **Création** : l'étape entre « Votre parcours » et « Votre profil ». Une expérience à la fois (onglets), fiche trouvée avec « choisir une autre fiche » (fiches proches, ou « j'écris moi-même »), missions à cocher / modifier / ajouter, compétences (savoir-faire, savoir-être, savoirs, activités précises) à cocher / ajouter, aperçu du CV qui se construit, « Passer cette étape ».
- **Reprise** : bouton « Compléter avec la fiche du métier » sur chaque expérience de « Mettre à jour mon CV » ; les missions déjà dans le CV de la personne restent cochées en haut, celles de la fiche s'ajoutent seulement si elle les coche. Aucune fiche : pas de bouton.
- **Onglet « Où dans la reprise ? »** : tableau des trois voies avec la proposition (même brique pour « Mettre à jour » et « Le refaire moi-même » ; option avant l'assistant pour « Reformuler »).
- Cas sans fiche (4e expérience) : saisie libre, fiches approchantes proposées.

Constats faits en construisant la maquette (à dire à Denis) :
- Les missions du ROME sont écrites à la 3e personne (« Favorise l'autonomie des personnes… ») : lisibles, à revoir sur un échantillon.
- Les listes de compétences courtes viennent des fiches à la main quand elles existent (ex. Serveur : « Négociation, Conseil, Vente », pauvre pour du service en salle : « Service en salle » existe maintenant au lexique mais n'est pas rattaché à cette fiche).
- Deux fiches proches ont presque le même nom (AES) : à dédoublonner dans l'application.

Questions à poser à Denis : nombre de missions montrées d'un coup (6 ?), ordre, compétences visibles d'un coup, écran téléphone, bouton « passer », bouton de la reprise (toujours ou seulement si une fiche est trouvée), reformulation des missions à la 1re personne ou en verbes à l'infinitif.

**Décision du 14/11/2026 (consigne 284)** : dans la reprise, le bouton n'apparaît que si une fiche proche est trouvée.
**Décisions du 14/11/2026 (consigne 285)** : tout afficher d'un coup (missions et compétences), missions à l'infinitif, écran téléphone validé. Maquette mise à jour. Le convertisseur (`scripts/importRome/phrasesCV.js`) traite le premier verbe et les verbes coordonnés (« et », « , », « puis ») ; limites connues : verbes précédés d'un pronom (« les installe »), phrases commençant par « Il », « En », « Selon » (62 sur 10 138), homographes nom/verbe (« contrôle »). Échantillon de relecture à préparer pour Denis.


## Phrases prêtes à cocher : état au 14/11/2026 (soir)

**Fait, testé, pas encore branché sur un écran.** Les fiches du ROME portent maintenant des phrases utilisables telles quelles sur un CV.

- **Champ `mi`** (missions à l'infinitif) ajouté à chaque fiche de `data/rome/fiche_*.js` (1 917 fiches, 10 197 phrases cochables, sans doublon). Le champ `m` (3e personne) reste intact : la page « fiche d'un métier » l'affiche toujours.
- **Champ `k`** (activités détaillées, 47 480) : remis en forme, un pour un (le nombre de « cœur de métier » ne change pas).
- **Source unique** : `scripts/importRome/phrasesCV.js` (conversion, orthographe, détecteur). Appelé par le générateur (`genererMetiersRome.js`) et par `ajouterPhrasesCV.js`, qui l'applique aux fichiers déjà produits. Corrections écrites à la main : `scripts/importRome/phrasesCorrigees.json` (clé = phrase d'origine du ROME, valeur = phrase finale, ou liste quand une phrase est coupée en deux, ou liste vide quand ce n'est pas une mission). Le prototype `scripts/conversionMissionsInfinitif.js` est supprimé.
- **Relancer après toute modification** : `node scripts/importRome/ajouterPhrasesCV.js`. Pour repartir des activités d'origine (quand une règle change) : `K_ORIGINE_DIR=<dossier de fiches non retouchées> node scripts/importRome/ajouterPhrasesCV.js` (les fiches d'origine, sans `mi`, sont dans git au commit `e2344468` : `git show e2344468:data/rome/fiche_X.js`).
- **Test** : `tests/phrasesCV.test.js` (10 tests) impose la forme : infinitif, pas de « il » ou « elle » sujet, pas de verbe conjugué après « et » ou une virgule, pas de point de suspension, parenthèses fermées, ponctuation, orthographe moderne, aucun verbe inventé (« inscrirer »). Une phrase passe le détecteur OU figure dans le fichier de corrections. `tests/fichesRome.test.js` : limite de taille d'un fichier de lettre relevée de 1,3 à 1,6 Mo (la lettre K passe de 1,28 à 1,44 Mo non compressé ; se charge seulement à l'ouverture d'une fiche de cette lettre).

**Ce que la mesure « mots absents du texte d'origine du ROME » a révélé (à refaire si on change le convertisseur)** : le convertisseur ajoutait un « r » aux infinitifs en « -re » du ROME (« Convaincrer » 12 fois, « Reproduirer » 14, « Extrairer » 6, « Décrirer », « Relirer », « Inscrirer », « Transcrirer », « Enduirer »), l'orthographe sans accent circonflexe du ROME restait (« oeuvre » 241 fois, « maitriser », « entrainer », « chaine »), 16 phrases gardaient un verbe conjugué au milieu (« …, et peut former des apprentis », « et a le souci de… »), et il restait des « ... » et des parenthèses tronquées. Tout est corrigé et tenu par un test. Les noms de métier ne sont pas touchés.

**Feuille de relecture pour Denis** : `docs/ECHANTILLON_PHRASES_CV_2026-11-14.md` (100 phrases, tirage fixe, régénérable par `node scripts/importRome/echantillonPhrasesCV.js`). À relire par Denis avant de brancher les phrases sur l'écran. **Décision de Denis (14/11/2026, option 1 pour les deux) sur les n° 37 et 38 de l'échantillon, appliquée aussi aux phrases voisines** : (a) « Peut se spécialiser dans… », « Est spécialisé dans… » (une possibilité d'évolution, pas une mission) deviennent des activités réelles, par exemple K2111 : « Animer des formations dans des domaines particuliers, comme les langues, le secourisme ou l'informatique » ; 40 phrases réécrites à la main, plus aucune mission ne commence par « Se spécialiser » ou « Être spécialisé » (le test le tient). (b) « leur / leurs » sans de quoi on parle dans la phrase (cause : le découpage d'une phrase longue en deux) : 14 cas repris, par exemple L1311 en deux phrases dont la seconde redit « des artistes et des techniciens ». Le détecteur refuse désormais ces deux cas (`leurSansAntecedent`, `INTENTION_OU_STATUT` dans `phrasesCV.js`). Dans la feuille d'échantillon, les n° 37 et 38 gardent leur ancien texte (tirage fixe) ; leur version corrigée est celle des fiches.

**Reste, dans l'ordre** : (1) Denis relit l'échantillon, puis la relecture complète secteur par secteur (10 197 missions, la lecture du détecteur ne remplace pas l'œil) ; (2) audit des trois voies de « Reprendre mon CV » ; (3) coder l'étape « Vos missions et compétences » par lots (navigateur obligatoire pour `js/app.js` et `modules/*/ui.js`) ; (4) maquette de « Votre parcours » ; (5) cahier du module « Trouver un métier ».
