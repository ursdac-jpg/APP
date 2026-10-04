# Chantier : l'objectif de candidature posé au début, carte « Formation », stage en deux options (ouvert le 2026-09-30)

Mode A (conception), effort `high`. Décisions de Denis du 2026-09-30, pas de maquette demandée. Audit du code : `docs/AUDIT_OBJECTIF_ET_PREPARER_2026-09-30_SOIR.md`.

## Décisions de Denis (2026-09-30)
1. Dans « Reformuler mon CV », le choix de situation (les six cartes) est posé **au début**, dans « Préparer », à la place du bloc « Le poste, le domaine ou l'offre visée » : il alimente l'assistant au seul passage qu'il y a (vocabulaire des compétences adapté). **Avis de Claude : avant le passage, pas après.** *(Denis a laissé la question ouverte, il attend l'avis ; à confirmer en lançant le code.)*
2. La carte **PMSMP (immersion)** devient la carte **Formation**, **partout** dans l'application.
3. Dans la carte **Stage**, deux options : **stage de formation** (stage fait dans le cadre d'une formation) ou **stage d'immersion** (c'est une PMSMP).
4. À l'intérieur de « Formation », le contenu s'adapte à une personne qui postule à une formation.

## Conséquences techniques (audit)
- Les identifiants internes restent `stage`, `alternance`, `pmsmp` : le choix « stage d'immersion » continue d'utiliser la branche `pmsmp` (structure d'accueil, calendrier), donc rien ne change pour l'existant. Seuls les libellés et l'accès changent.
- « Formation » est un **nouvel** identifiant (`formation`, à ne pas confondre avec `dossier.formations`, le tableau des diplômes) : il doit être ajouté aux listes en dur `['stage','alternance','pmsmp']` (une quinzaine d'endroits, `js/app.js` et `data/metiers.js`), à `CLE_DETAILS`, aux 6 endroits qui dessinent les cartes (`pageObjectif`, Bilan, Cohérence, Co-lettre, Entretien, Découverte) et au nettoyage de `definirObjectifCandidature`.
- Défaut à corriger au passage : choisir Stage, Alternance ou PMSMP **vide** `modeRecherche`, `typeRecherche` et toute `rechercheCandidature` (offre comprise), donc efface ce qui a été saisi juste avant.
- Retirer l'écran « Votre objectif » de la fin de Reformuler demande l'inventaire de ce qu'il alimente (entreprise, site, structure, civilité, couleur, contrat) et que `dossier.objectif` soit posé dès le début.

## Contenu proposé pour la carte « Formation » (BROUILLON, à corriger par Denis, CIP)
Champs : formation visée (intitulé), organisme ou centre (s'il est connu), dates de début souhaitées ou disponibilités, financement envisagé (facultatif : CPF, France Travail, Région, employeur, je ne sais pas), ce que la personne compte en faire (son projet, en une phrase). Consigne pour l'assistant : mettre en avant le parcours qui mène à la formation, les prérequis, la motivation ; pas de « poste visé ».

## Plan (une case par tâche, un commit par case, `npm test` et navigateur à chaque fois)
- [x] 1. Reformuler : les six cartes au début de « Préparer », métier ou domaine et offre dessous, `dossier.objectif` posé dès le début, transmis dans le prompt (`reformuler-cv.md`).
- [x] 2. Reformuler : retrait de l'écran « Votre objectif » de la fin, après inventaire.
- [x] 3. Carte PMSMP devenue Formation + stage en deux options, partout (libellés, listes, nettoyage).
- [x] 4. Contenu de « Formation » (champs, texte des prompts, Lexique si besoin, `node scripts/checkLexique.js`).
- [x] 5. Défaut « choisir Stage efface l'offre » corrigé.

## Verdict
**NON APTE AU MODE NUIT** : restent à trancher (1) le « avant le passage » (avis donné, pas encore validé), (2) le contenu exact de la carte Formation.

## Fait le 2026-09-30 (soir)
- **1, 2, 5** (`aa021bce`) : les six cartes au début de « Préparer » de Reformuler, transmises au prompt (`SITUATION DE LA CANDIDATURE`) ; l'écran « Votre objectif » de la fin n'est montré que s'il manque quelque chose ; choisir Stage / Alternance / Immersion ne vide plus le métier ni l'offre dans Reformuler. **Le défaut existe toujours sur l'écran « Votre objectif » des autres parcours** (`definirObjectifCandidature` vide le mode de recherche et l'offre) : non corrigé, par prudence.
- **3 et 4** : carte PMSMP remplacée par **Formation** partout ; dans la carte Stage, deux boutons « Un stage de formation » / « Un stage d'immersion (PMSMP) » (l'immersion garde l'identifiant interne `pmsmp`, donc rien ne change pour l'existant) ; `formation` traitée comme stage et alternance dans ~35 endroits ; champs de la carte Formation : formation visée, adresse internet, organisme de formation (brouillon à valider par Denis) ; prompts (`reformuler-cv`, `cv`, `lettre`, `entretien`, `entretien-accueil`, `coherence-transversale`, `decouverte-redaction`) mis à jour ; dans Reformuler, la carte Formation remplace « métier ou domaine » et offre par « Quelle formation visez-vous ? ».
- **Non fait / à tester par Denis** : test à la vraie main de tous les parcours avec la carte Formation (lettre, entretien, Bilan, Cohérence) ; aucune vérification en mode sombre ; les textes d'aide (visites guidées) qui parlent d'immersion ne sont pas relus ; vérifier que le Lexique n'a pas besoin d'une fiche « formation » pour la recherche de l'accueil.

## À FAIRE PLUS TARD (demande de Denis, 2026-09-30) : une ligne directrice par situation dans TOUS les prompts
Constat de Denis : les prompts ne tiennent pas assez compte de la **valeur propre de chaque carte**. Audit rapide (grep des prompts) : aujourd'hui ils ne font que **citer** la liste des situations (« offre, spontanée, reconversion, stage, alternance, immersion »), sans dire ce qu'il faut mettre en avant pour chacune. Ce que Denis veut voir dans chaque prompt (ses mots, à reprendre tels quels comme source) :
- **Répondre à une offre** : la motivation et l'intérêt pour ce poste.
- **Candidature spontanée** : le courage, la curiosité, l'affirmation de soi (oser aller vers l'entreprise).
- **Changer de métier** : les **compétences transversales**, ce que la personne peut apporter au nouveau métier avec ses acquis des autres métiers.
- **Stage** : l'engagement, l'assiduité, l'investissement, parfois au-delà des heures de formation (sur le temps libre).
- **Stage d'immersion (PMSMP)** : le fait de découvrir le métier.
- **Stage de formation** : la personne affine, et surtout concrétise, les théories vues en formation : elle bâtit son expérience sur le terrain.
- **Alternance** et **Formation** : pas encore dits par Denis (à demander ; pour Formation, proposition en attente : parcours qui mène à la formation, motivation, projet).
Pistes de conception (avis de Claude, à valider) : (1) une SEULE table des lignes directrices, écrite avec les mots de Denis, injectée dans le contexte de chaque prompt (pas de copie dans chaque fichier, règle « une seule source de vérité ») ; (2) toujours formulée « met en avant SI c'est présent dans le CV », jamais d'invention de motivation ni de diagnostic sur la personne ; (3) séparer « stage de formation » et « stage d'immersion » dans la table (aujourd'hui `stage` et `pmsmp`) ; (4) prompts concernés : `reformuler-cv`, `cv`, `lettre`, `lettre-co`, `entretien`, `entretien-accueil`, `decouverte-redaction`, `coherence-transversale`, `regard-recruteur` ; attention au prompt du Bilan, déjà saturé ; (5) Mode A (décision de contenu) puis exécution en Mode B.
Statut : NOTÉ, rien commencé. À traiter quand les tâches en cours seront bien avancées ou finies.

## FAIT le 2026-09-30 (nuit) : lignes directrices par situation
Table unique `LIGNES_DIRECTRICES_SITUATION` + `ligneDirectriceSituation()` (`js/app.js`), avec les mots de Denis pour offre, spontanée, reconversion, stage (de formation) et immersion ; **alternance et formation = BROUILLONS à valider par Denis**. Lue par `texteProfil()` (ligne « Ce que cette situation demande de mettre en avant » dans le profil du CV, de la lettre et de l'entretien) et par le contexte de « Reformuler mon CV ». Règle commune ajoutée dans `cv`, `decouverte-redaction`, `lettre`, `lettre-co`, `entretien`, `entretien-accueil`, `reformuler-cv` : on ne met en avant que ce que le CV montre déjà, jamais d'invention. **Volontairement NON appliquée** aux outils d'analyse (Cohérence, Regard recruteur, Les mots de votre CV) : y mettre « mets en avant le courage » fausserait un jugement. Bilan : pas touché (prompt saturé).
