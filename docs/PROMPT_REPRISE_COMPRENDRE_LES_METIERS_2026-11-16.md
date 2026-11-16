# Message de reprise : module « Comprendre les métiers » (16/11/2026)

À coller dans une nouvelle session. Le fichier du chantier (`docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md`) fait foi sur le détail ; ce message en est le résumé de reprise.

## 0. Avant de commencer

Lance `/app`, puis lis `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md` en entier et les consignes 411 et 415 de `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` (415 contient des ajouts numérotés (6) à (12) qui racontent les décisions dans l'ordre).

**Règles de cette séance, toujours valables tant que Denis ne dit pas autrement :**
- Une AUTRE FENÊTRE travaille en même temps sur le dépôt. Pour ce module on ne fait QUE la maquette et les documents du chantier : aucun changement dans `js/`, `data/`, `css/`, `tests/`, `scripts/`. Aucun commit, aucun push, sauf demande de Denis ; si un commit est demandé, `git add` sur des fichiers nommés, jamais `git add -A`.
- Les fichiers modifiés vus dans `git status` (`js/app.js`, `docs/ERREURS_ET_BUGS.md`, `docs/LECONS_A_NE_PAS_REPRODUIRE.md`, `outils/passages.json`, `scripts/parcours/...`) ne sont PAS de ce chantier. `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` et `docs/IDEES_A_RECLASSER.md` portent à la fois des ajouts de ce chantier et des ajouts de l'autre fenêtre.
- Module FERMÉ au public (`MODULE_COMPRENDRE_METIERS_OUVERT = false`, aucune ligne « Nouveautés »).
- Français impeccable, jamais de tiret cadratin ni demi-cadratin, jamais le mot « IA » visible dans l'application, pas de « on » à répétition, « à compléter » plutôt que « facultatif » pour un champ (j'ai écrit « Rien n'est obligatoire » pour le questionnaire).
- Ne jamais mettre de backticks ni de guillemets mal échappés dans une commande Bash en `node -e "..."` : écrire un petit fichier de script avec l'outil Write, puis l'exécuter (une commande a déjà dérapé ainsi).
- Maquette ET questions avant code. Corrections regroupées par bloc. Choix présentés = recommandation en premier, bénéfices et risques de chaque option. Mode A, effort haut.

## 1. Le module en deux phrases

« Comprendre les métiers » aide une personne qui hésite à découvrir des métiers par trois portes : (1) par un métier (recherche par nom, autres noms, sigles, secteurs, puis fiche), (2) par ce qu'elle aime faire (quatre pages de choix, puis des métiers proposés avec un pourcentage de compatibilité), (3) par un questionnaire RIASEC en quatre parties, facultatif. Il va dans la carte de l'accueil **« Vous hésitez encore ? »** (choix de Denis), à côté de « Comparer mes pistes ».

## 2. Décisions VALIDÉES par Denis (16/11/2026)

1. Carte « Vous hésitez encore ? ». Trois entrées (consigne 411).
2. **Questionnaire RIASEC : la méthode en usage depuis une quarantaine d'années est respectée EXACTEMENT** : 4 parties (90 énoncés d'activités, 90 de métiers, 60 d'aptitudes, 60 de personnalité = 300 énoncés), code à trois lettres issu de la somme des quatre parties. Nos mots à nous : AUCUNE copie du polycopié de Denis (`H:\Old\Download\le-test-riasec-1.pdf`, formateur J.-L. Boisserin 2015, sans licence) ni de son image. Réponses par clics. Interprétations du polycopié jugées bonnes par Denis, reprises reformulées et adoucies. Le chiffre « 48 questions » est abandonné (sans source).
3. Hexagone redessiné en SVG (couleurs de l'application, mode sombre), types OPPOSÉS face à face : réaliste/social, investigateur/entreprenant, artistique/conventionnel. Dire que les lettres sont celles que **France Travail donne à chaque métier du ROME** (vérifié : 1 923 fiches ont le champ `ri`, une ou deux lettres).
4. Questionnaire : **AUCUN résultat, ni provisoire ni partiel, avant la fin des quatre parties** (pour ne pas influencer les réponses). Fin de partie = seulement « partie terminée, il en reste X ». Règle à garder pour le code.
5. **Tout ou rien** : pas de sauvegarde de l'avancement. En revanche, **le résultat final avec toutes les propositions se garde dans la disquette** (questionnaire ET entrée 2).
6. Les explications de chaque lettre du polycopié sont reprises (en mots à nous, adoucies, en tendances de groupe). Le volet « comment les diriger, déléguer » est écarté.
7. **Pourcentage de l'entrée 2** : on ne crée pas un nouveau calcul, on réutilise celui qui existe (voir section 5).
8. **L'ancienne question « Ce qui compte pour vous aujourd'hui » (valeurs : équilibre de vie, salaire, sécurité...) n'est PAS remise** (elle avait été supprimée le 12/11/2026, consigne 261, commit `0bc2d96b`).
9. Jamais « bilan de compétences » dans l'application. L'inspiration vient du bilan de compétences que Denis connaît, mais l'application ne l'appelle jamais ainsi.
10. Denis veut faire un test de type **Big Five** ET garder un test d'inspiration **Jung** pour la dimension de recharge d'énergie (se ressourcer seul ou avec les autres), « un avis parmi les autres », jamais présenté comme scientifique. Les résultats de tous les tests alimenteront une INTERPRÉTATION (jamais « bilan », jamais « conclusion »).
11. Idée de fond de Denis (chantier futur) : réunir tous les résultats (RIASEC, choix de l'entrée 2, autres tests, centres d'intérêt de la personne) dans une synthèse interprétée par un prompt pour l'assistant en ligne, comme matière pour l'échange avec un professionnel de l'accompagnement.

## 3. Points NON validés (propositions de Claude, à confirmer)

- **Page 4 « Ce qui serait difficile pour vous »** (conditions de travail) : gardée dans la maquette parce que Denis a dit de la garder « en plus » et voulait voir comment elle fonctionne. Les conditions NE CHANGENT PAS le pourcentage ; chaque métier affiche « À vérifier : ce métier peut demander... » avec un bouton de masquage. Elle contredit la décision du 12/11/2026 (« conditions seulement affichées, jamais demandées »), à confirmer en la regardant.
- **Limite de ce module et porte d'entrée des tests de personnalité** (dernière question de Denis, réponse donnée, pas encore validée) : ce module s'arrête au RIASEC et aux entrées 1 et 2. Les tests de personnalité vont dans un espace séparé « Mieux me connaître », à ouvrir plus tard (option recommandée ; les autres : élargir l'entrée 3, ou reporter). Pas plus de deux questionnaires au total, RIASEC compris. Big Five à QUATRE axes (ne pas montrer « stabilité émotionnelle » : stigmatisant pour le public, frôle le diagnostic). Fusionner Jung et Big Five en un seul questionnaire « Votre façon de fonctionner » avec un bloc « Où puisez-vous votre énergie ? » (position sur une ligne « seul / avec les autres », jamais un type ; jamais la marque MBTI, les seize types ou leurs noms). Questions IPIP (domaine public) écrites dans nos mots ; honnêteté : « questionnaire d'exploration, un repère parmi d'autres », pas un test validé. Durée affichée avant de commencer, exemple de résultat montré avant, jamais de parcours imposé.
- Questions encore ouvertes sur le questionnaire : partie 3 (« pas encore / en progrès / à l'aise » plutôt que « faible / moyen / fort »), partie 4 (phrases adoucies plutôt que proches de l'original), score par barres sans note sur 100, partie 2 avec de vrais métiers du ROME plutôt que la liste datée du polycopié. Les deux premiers sont réglables dans le panneau de la maquette.

## 4. La maquette

- Fichiers (nouveaux, non commités) : `docs/MAQUETTE_COMPRENDRE_LES_METIERS_V2_2026-11-16.html` (la bonne, 15 écrans), `docs/MAQUETTE_COMPRENDRE_LES_METIERS_2026-11-16.html` (V1, gardée pour mémoire).
- Pour la voir : outil de preview, configuration `site-v2-python-server` (port 8124 ici, car 8123 était pris par l'autre session) puis `/docs/MAQUETTE_COMPRENDRE_LES_METIERS_V2_2026-11-16.html`. Un panneau « Réglages » (refermable par la croix) propose : aller à un écran, ordinateur ou téléphone, mode sombre, remise à zéro, deux réglages de questionnaire.
- Les 15 écrans : accueil (carte), présentation (avec « Le RIASEC, c'est quoi ? » et les six types en détail), entrée 1 (recherche par nom, autre nom, sigle, mot, catalogue de sigles, 20 secteurs cliquables avec leurs nombres réels), fiche d'un métier (trois boutons sur une ligne, « Pourquoi ce métier » depuis l'entrée 2, autres noms et sigles, conditions du ROME, RIASEC du métier, métiers proches), entrée 2 pages 1 à 4 (avec qui ou quoi, ce que vous aimeriez faire, où, conditions difficiles ; sous-catégories expliquées, maximum 16/16/12, compteur, « Tout désélectionner », avertissement au maximum), métiers proposés (première proposition avec pourcentage, « x de vos N choix retrouvés », interprétation, ce que le métier demande en plus, niveau d'accès, « À vérifier » des conditions, métiers proches ; puis les autres ; « Garder mon résultat »), présentation du questionnaire, quatre parties, fin de partie SANS résultat, résultat final (trois lettres, hexagone, barres, types face à face, explication des trois lettres, métiers qui partagent les lettres, « Garder mon résultat » et « Refaire le questionnaire » dans la page).
- Contraintes respectées : la VRAIE barre du bas de l'application (`barreNavigation`, classes `barre-navigation-fixe`, `btn-nav-erip`, `btn-accueil`), la vraie classe `.jeton` / `.is-actif` / `.jetons-ligne` pour les choix, `.bloc-depli` en esprit, variables de couleur avec mode sombre (couleurs des six lettres définies localement dans la maquette : à reporter dans `css/style.css` au moment du code, valeur claire ET sombre).
- Vérifiée en clair, en sombre et sur téléphone (375 px) : aucune erreur de console, aucun débordement horizontal.
- Contenu d'exemple (pas les vraies fiches) : les métiers, leurs choix associés, leurs conditions et leurs niveaux d'accès sont des exemples de maquette. Les listes de choix (34 + 53 + 26) et les secteurs sont les vraies.
- Si Denis veut une page « Ce qui compte pour vous » en version « 3 priorités sans effet » : il a décidé de NE PAS la remettre ; ne pas la reproposer sans fait nouveau.

## 5. Ce que l'audit a trouvé (faits, pour ne pas le refaire)

- **Pourcentage** : `calculerScoreMetier` (`data/metiers.js`, consigne 410) : choix rares plus pesants, couverture 60 % et précision 40 %, un point en moins par choix absent de la fiche (12 au plus), facteur de quantité (de 0,45 pour un élément à 1 au plein, 12 à 30), rapporté à la fiche face à elle-même (100 % atteignable). Le profil de l'entrée 2 est celui qu'il attend : page 1 = `activites`, page 2 = `actions`, page 3 = `environnement` (catalogues `CATALOGUE_PERSONNES_MATERIELS_LIEUX`, `CATALOGUE_ACTIONS_PRO`, `CATALOGUE_ENVIRONNEMENTS_TRAVAIL`). Mesure du 16/11/2026 : 10 choix soin et accompagnement donnent Infirmier 73 %, Aide-soignant 68 %, ASH 68 %, Éducateur spécialisé 68 % ; 6 choix cuisine donnent Boulanger 55 %, Barista 51 %, Pâtissier 51 % ; 1 seul choix « Cuisiner » donne 45 % au mieux. Avec une dizaine de choix, on plafonne vers 70 à 75 %. Défauts : métiers de niveaux très différents mêlés (Gériatre 59 % à côté d'Aide-soignant) ; « Ambassadeur du tri » à 62 % pour du soin (à examiner). Proposé : afficher le niveau d'accès sur chaque carte (jamais un filtre caché, consigne 279), nommer le chiffre « Compatibilité avec vos choix », calibrer le plein du facteur de quantité pour l'entrée 2 sur une vingtaine de profils types AVANT de coder.
- **Lettres RIASEC des fiches** (lettre principale, 1 923 fiches) : R 661, C 364, I 305, E 297, S 193, A 103 ; lettre secondaire : C 645, R 235, S 199, E 177, I 153, A 85. Une personne très Artistique verra peu de métiers : règle d'appariement à définir et tester sur les cas rares, et message qui explique pourquoi la liste est courte.
- **Conditions de travail** : `data/conditionsRome.js` (`CONDITIONS_ROME`, 22 libellés : nuit, week-end, horaires variables, saisonnier, déplacements, charges, debout, assis, répétitif, précision, tenue, sécurité, bruit, extérieur, public, domicile, isolé, télétravail, statuts) : affichées dans la fiche seulement, jamais comptées dans un score. La page 4 de la maquette en reprend 11 (les lieux sont déjà demandés à la page 3).
- **Sigles** : le ROME n'en contient que 2 sur près de 13 850 autres noms. Il faut écrire un catalogue (AS, ASH, AES, AMP, ADVF, ATSEM, CIP, VRP, EJE...) à faire relire par Denis.
- **Secteurs** : 20 secteurs réels (`secteur` dans `data/metiersRome.js`, 1 790 fiches) ; aujourd'hui l'application n'en montre que 3 en exemple, la maquette montre tout le secteur.
- **Barre du bas et recherche** : `barreNavigation()` (`js/app.js:4781`), recherche `rechercherDansRepertoireElargi`, `variantesRechercheMetier`, `secteursDisponibles()`.
- **Licences** : la théorie de Holland est libre ; le libellé d'un questionnaire peut être protégé, d'où nos énoncés. IPIP (Big Five) est du domaine public. MBTI et ses types sont des marques : ne pas les reprendre.
- **Disquette** : mécanisme existant ; chaque module doit y être couvert (chantier de couverture des modules en suspens pour Regard extérieur).

## 6. À faire TOUT DE SUITE (dans l'ordre, maquette et documents seulement)

1. Attendre ou demander les retours de Denis sur la maquette V2 en entier (il l'a regardée en partie : boutons de la fiche et résultat provisoire déjà corrigés). Corriger par bloc.
2. Faire valider (ou refuser) la limite du module et la porte d'entrée « Mieux me connaître » (section 3), puis le noter dans le registre (consigne 415) et le chantier.
3. Faire valider la page 4 « Ce qui serait difficile pour vous » en la regardant.
4. Trancher les questions ouvertes sur le questionnaire (parties 2, 3, 4, affichage du score).
5. Rédiger les **300 énoncés** par lots (partie 1 d'abord : 90 énoncés d'activités, 15 par lettre, en tableau « thème d'origine, énoncé reformulé » à faire valider par Denis, puis parties 2, 3, 4). Aucune copie mot pour mot du polycopié.
6. Écrire le catalogue de sigles (à faire relire) et relire avec Denis les explications des lettres et des sous-catégories (textes de la maquette).

## 7. À faire PLUS TARD (code, quand Denis le dit et que l'autre fenêtre n'y touche plus)

1. Règles de calcul du questionnaire (chaque partie ramenée en pourcentage de son maximum, somme des quatre, code à trois lettres, axes objets/personnes/données/idées) avec un test Node.
2. Rapprochement des lettres et des métiers (lettres `ri` majeure et mineure, niveau d'accès), jamais « adapté » ou « meilleur ».
3. Calibrage du pourcentage de l'entrée 2 (20 profils types, mesuré avant de coder).
4. Entrées 1 et 2 dans l'application (réutiliser la fiche interne, les listes de choix du CV, le comparateur, les boutons de carte existants `metier-carte-actions3`).
5. Brancher « Garder mon résultat » à la disquette avec une structure extensible.
6. Branchements habituels : recherche de l'accueil et du Lexique, mode sombre, aides contextuelles, interrupteur fermé, texte de la carte, statistiques BMO et bouton « Comprendre pourquoi ils recrutent ».
7. Fin de chantier : présentations et vidéos (rien tant que fermé), `BRIQUES_COMMUNES.md`, leçons, journal des changements, ligne « Nouveautés » seulement à l'ouverture.
8. Hors de ce module : espace « Mieux me connaître » (questionnaire de fonctionnement avec le bloc énergie), puis chantier « Synthèse de tous les résultats » (un prompt, une seule mission, jamais de diagnostic ni de verdict, convergences ET divergences dites honnêtement, formulations d'hypothèse, questions à poser au professionnel). Ordre : modules et disquette, puis maquette, prompt en dernier.
9. Scheduled tasks restées en attente sans rapport avec ce chantier, à ne lancer qu'avec l'accord de Denis : « Reprendre à la deuxième étape » (écarts de l'étape 2) et « Inflation d'octobre ». Note : `ETAT_DES_CHANTIERS.md` partie 0 ne mentionne pas encore les consignes 413 et 414 ni ce chantier.

## 8. Fichiers de cette séance

- Créés (non commités) : `docs/CHANTIER_COMPRENDRE_LES_METIERS_2026-11-16.md`, `docs/MAQUETTE_COMPRENDRE_LES_METIERS_2026-11-16.html`, `docs/MAQUETTE_COMPRENDRE_LES_METIERS_V2_2026-11-16.html`, ce message.
- Modifiés (parties de ce chantier) : `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` (consigne 415, ajouts (6) à (12)), `docs/IDEES_A_RECLASSER.md` (« Mise à jour 16/11/2026 » : pistes de licence, correction ROME-RIASEC, autres tests, analyse du polycopié).
- Rien dans le code de l'application. Aucun commit.
