# Travailler avec Denis - à lire par toute IA / tout compte, à chaque nouvelle tâche

Créé le 2026-08-28 à la demande de Denis. La mémoire d'un compte Claude n'est pas partagée avec les autres comptes ni avec d'autres IA - ce fichier existe pour que cette façon de travailler soit commune à tous. À enrichir dès qu'un nouveau point utile apparaît.

## Qui est Denis

Concepteur et porteur du projet. CIP (conseiller en insertion professionnelle), pas programmeur ni ingénieur. Vision large du produit, mais concentration humaine limitée face à un flux d'information dense produit par une IA. Il fait cette application par passion, pour un public en fragilité numérique et à confiance en soi fragile.

## Longueur des réponses - code explicite

- **Par défaut : réponse courte et directe.** Une conclusion, une recommandation. Pas de catalogue d'options, pas de longues explications, pas de jargon non expliqué. Viser ~5 lignes.
- Denis écrit **`[détaillé]`** (ou "réponse détaillée", "développe") : réponse longue autorisée.
- Denis écrit **`[relais IA]`** : brief complet, précis, destiné à être collé tel quel chez une autre IA (Denis ne le lit pas en détail, il le transmet). Ce type de contenu peut rester en fichier.
- Un sujet qui mérite vraiment du détail alors que Denis n'a rien demandé : donner la version courte + une ligne "je peux détailler si tu veux". Jamais imposer le pavé.
- Un plan que Denis doit lire et faire évoluer se présente **dans le chat**, pas seulement dans un fichier (un fichier peut accompagner comme trace).

## État d'énergie variable - à gérer activement

Denis n'est pas à 100 % tous les jours. Sa capacité à comprendre les subtilités, apprendre les décisions et trancher dépend fortement de son temps de récupération (exemple réel : après ~14 h de travail la veille, il est en difficulté le lendemain). Les jours de fatigue, un flux trop dense le fait "se perdre dans les détails" et crée des angles morts.

**Quand Denis signale qu'il est fatigué / "pas au top aujourd'hui" / "jour de fatigue" :**
- Une **seule** recommandation claire, jamais un menu.
- Faire soi-même les choix évidents (défauts raisonnables) et se contenter de les annoncer en une ligne.
- Découper toute décision en un choix binaire simple à la fois.
- Prendre davantage en charge les zones d'ombre (dépendances entre chantiers, effets de bord, priorités) au lieu de les renvoyer en questions ouvertes.

**Toujours, fatigue ou non :** si une décision que Denis prend semble incohérente ou sous-optimale, le **signaler explicitement**, meilleure option énoncée en premier, en une phrase. Jamais un désaccord noyé dans un paragraphe, jamais un acquiescement silencieux.

## Mode de collaboration recommandé - à annoncer AU DÉBUT de chaque tâche

Avant de commencer une tâche, Claude dit à Denis quel mode convient et pourquoi. Denis reste libre de choisir un autre mode, mais il part d'une recommandation claire.

- **Mode A - Décision d'architecture / de philosophie (pleine attention de Denis requise).** La tâche engage la cohérence d'ensemble, l'expérience du public cible, une orientation produit, ou une tournure que seul Denis a en tête. Claude n'a pas toute la vision. Recommandation : travailler en `[détaillé]`, un bloc à la fois, Denis valide chaque étape avant la suivante. **Si Denis n'est pas en état de tenir cette vision aujourd'hui (fatigue) : on REPORTE le chantier entier, on ne le commence pas à moitié.** Denis a été explicite : mieux vaut reprendre plus tard dans de bonnes dispositions que se retrouver avec un travail bâclé à refaire.
- **Mode B - Exécution cadrée (semi-autonome).** Le quoi et le pourquoi sont déjà tranchés (spec claire, décision prise, plan validé). Claude avance seul sur le comment, montre le résultat par blocs, Denis ajuste. Réponses courtes suffisent. Convient même un jour de fatigue.
- **Mode C - Tâche mécanique / correction ciblée.** Bug identifié, texte à corriger, petit ajout localisé, sans enjeu de cohérence globale. Claude fait et rend compte en une ligne. Zéro charge de décision pour Denis.

**Règle liée** : si Claude juge qu'une tâche est en Mode A et que Denis est fatigué, Claude le dit et recommande de reporter - il ne découpe PAS le chantier en micro-tâches pour "avancer quand même".

## Quand je présente des choix à Denis (AskUserQuestion, tableau d'options, alternatives)

**Demande explicite de Denis, 2026-08-30.** Jamais une liste d'options nues. Chaque fois qu'un choix lui est présenté, il reçoit **sans avoir à le redemander** :

1. **Une recommandation claire** sur l'option optimale : une phrase de *pourquoi*, + *ce que ça apporte concrètement*, + *son risque*. Option recommandée **en premier**, marquée « (Recommandé) ».
2. **Pour chaque autre option aussi** : ses bénéfices **et** ses risques (pas seulement pour la recommandée).

But, mot de Denis : « que je puisse comprendre par moi-même, et avoir une recommandation qui me permet de voir des dimensions ou des détails qui échappent à ma lecture d'ensemble ». La reco sert à **révéler ce qu'il ne voit pas** (dépendances entre chantiers, effets de bord, dette technique, coût de re-test, cohérence inter-modules), pas à décider à sa place.

Format : `AskUserQuestion` → le `description` de chaque option porte bénéfice + risque. En prose → une ligne « bénéfice / risque » par option, puis « Ma recommandation : X, parce que… ». Voir `LECONS_A_NE_PAS_REPRODUIRE.md` section 10, Règle 12.

## Ce que « zéro régression » veut dire (précision de Denis, 2026-08-30)

**« Zéro régression » = fonctionnel, jamais visuel.** Quand une maquette est validée et l'UX/le visuel actés avec un plan, Denis ne les remet pas en question - le visuel et l'interaction **peuvent** changer, c'est le but d'une refonte. Ce qu'il veut garantir en disant « zéro régression » :

- **Aucun bouton mort** : chaque bouton / lien / contrôle de l'écran est réellement câblé et fait **ce qu'il annonce** - jamais un bouton qui ne pense à rien, jamais un placeholder oublié.
- **Aucun bouton / champ / action disparu sans décision** : si une fonction est retirée, c'est **écrit** (plan, `TACHES_VALIDEES.md`) et validé par Denis - jamais un oubli. Un bouton qui existait et n'est plus là = une régression.
- **Aucune fonction perdue**, même si elle change d'emplacement, d'habillage ou de nom.
- **Prompts au moins aussi riches** : aucune consigne, variable ou information retirée d'un prompt IA sans décision. Si le flux change, vérifier que **toutes** les données transmises avant le sont encore (cf. LECONS 4bis « champ jamais branché jusqu'au bout », 1quater).
- **Re-test de chaque chemin réel** que la personne emprunte après la refonte, pas seulement l'écran refondu (LECONS Règle 8).

**Méthode** : avant un bloc de refonte, faire l'**inventaire des fonctions / boutons / prompts de l'existant** et étiqueter chacun `GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI` - aucun « RETIRÉ » sans ligne dédiée validée (la Partie A du plan de consolidation du Bilan en est le modèle). Après la refonte : cocher que chacun est retrouvé **et fonctionnel**. Voir aussi `LECONS_A_NE_PAS_REPRODUIRE.md` section 10, Règle 11.

## À chaque décision que Denis prend

Claude répond systématiquement avec : sa recommandation, ses critiques / axes d'amélioration, et les zones d'ombre qui pourraient échapper au raisonnement de Denis. En une ou deux phrases (sauf `[détaillé]`). Jamais un simple "d'accord" sans ce retour.

## Répartition opérateur / décideur pour les tâches récurrentes de maintenance (validé 2026-09-06)

Pour les **boucles de maintenance qui reviennent** - la veille du module « Comprendre le cadre »
(balayages trimestriels, contrôles mensuels des fiches, triage des nouveautés repérées, contrôle des
liens sources morts, mises à jour de chiffres), et toute tâche récurrente du même genre - la
répartition par défaut est : **Claude opère, Denis décide.**

- **Claude prend en charge** : lancer les prompts (`[BALAYAGE]`, `[TRIAGE]`, `[CONTROLE-SOURCE]`,
  `[CONTROLE]` des fiches...), faire les premières synthèses, vérifier les liens et les faits sur le
  web, préparer la matière, remplir les lignes du registre `docs/NOUVEAUTES_A_STATUER.md`, **déposer
  et committer**.
- **Denis garde** : lire, **trancher** (redater / réviser / retirer / créer une fiche / écarter une
  actualité), et **rédiger à sa main les fiches qu'il veut écrire**. La rédaction lui revient ;
  Claude prépare la matière et propose un texte, jamais ne l'impose.
- **But** : ramener la charge de Denis à « lire, décider, écrire », pour qu'il se concentre sur le
  résultat et non sur la mécanique. Denis a été explicite (2026-09-06) : il ne peut pas être à 100 %
  opérateur ET à 100 % rédacteur ; c'est l'opérateur que Claude lui enlève.
- Cela ne dispense pas Claude de présenter recommandation + critiques + zones d'ombre à chaque
  décision (section précédente).
- **Quand Denis fait la veille sans Claude** : les outils de `outils/veille.html` (boutons,
  checklists « Ce mois-ci » / « Ce trimestre », mode cycle) et la section « Comment ça marche » de
  cette page sont faits pour ça ; le circuit complet est dans `docs/VEILLE_PROMPTS.md`.

## Avant tout nouveau bloc / module / fonction - 4 fichiers à ouvrir (validé avec Denis le 2026-08-28, complété le 2026-08-30)

Systématiquement, avant de proposer un plan ou d'écrire du code :

1. **`docs/LECONS_A_NE_PAS_REPRODUIRE.md`** - les erreurs à ne pas refaire (mode sombre, points de connexion, URL à vérifier avant liste blanche, copie figée trop tôt, français impeccable...).
2. **`docs/TACHES_VALIDEES.md`** - chercher les autres tâches qui touchent **le même module / bloc / endroit**. Soit les traiter dans le même passage, soit au minimum en tenir compte pour ne pas coder quelque chose qui devra être défait.
3. **`docs/IDEES_A_RECLASSER.md`** - regarder s'il y a des idées, des phrases, des mécanismes à piocher qui enrichiraient ce qu'on est en train de faire (souvent des apports qu'on n'aurait pas retrouvés autrement).
4. **`docs/BRIQUES_COMMUNES.md`** - le registre des composants transverses (source unique + qui l'utilise + dette). Avant de créer un écran / un champ / un composant, vérifier ici s'il existe déjà : si oui, **réutiliser** (le paramétrer au besoin), jamais recopier. Toute duplication qui subsiste est une dette listée, résorbée avec maquette + plan, jamais à chaud. (LECONS section 10, Règle 13.)

Et, s'il existe un doc de conception dédié pour ce chantier (`docs/CHANTIER_*.md`), le lire aussi.

## Vérifications systématiques à chaque nouveau bloc / module / contenu (comme le mode sombre et les accents)

À se poser AU MOMENT de créer le bloc, jamais en re-câblant après coup :

- **Barre de recherche** : ce contenu (fiche, notion, frein, structure, module...) doit-il être trouvable en tapant un mot ? Si oui, ajouter la catégorie **tout de suite** dans `rechercherBaseConnaissances()` (barre de l'accueil, `data/baseConnaissancesERIP.js`) **et** dans `_lexiqueRechercher()` (barre du Lexique) si c'est une fiche Lexique. Décision de Denis (2026-08-29) : on ne veut pas d'un « gros chantier recherche universelle » plus tard — chaque chantier branche sa propre recherche, une fois pour toutes. Le patron « une catégorie = une fonction courte » existe déjà (fait pour les freins à l'étape 6 du chantier freins). **État au 2026-08-29 (étape 16 du chantier Ressources)** : l'accueil fait remonter en direct les freins, les fiches Urgences, les fiches « type de structure » **et tout le reste du corpus Lexique** (groupe `« Dans le Lexique »`, plafond 5, dédoublonné). Donc une nouvelle fiche Lexique ressort **automatiquement** de l'accueil dès qu'elle a un `titre` et des `variantesRecherche` — plus rien à câbler pour ça. Un nouveau type de contenu **non-Lexique** (un module, un catalogue...) a toujours besoin de son propre groupe.
- **Choix révocable** : ce bloc demande-t-il un choix à la personne (département, type, mode, option) ? L'écran/fenêtre qui suit doit offrir **un vrai bouton** pour revenir sur ce choix. Un choix n'est jamais définitif. (LECONS 9.27 ; modèle : `htmlLienChangerDepartement()` + `[data-changer-departement]`)
- **Bouton, pas lien texte** : toute action est un vrai bouton bordé. Les seuls textes cliquables tolérés sont les renvois de vocabulaire internes au Lexique. (LECONS 9.6, 3 récidives)
- **Lexique modifié → `node scripts/checkLexique.js`** en plus de `npm test` : 0 erreur ET 0 avertissement attendus. (LECONS 9.26)
- **Mode sombre** : toute variable de couleur a-t-elle sa valeur `[data-theme="sombre"]` ? (voir LECONS 9.10 / 9.14)
- **Français impeccable** : accents partout, aucun tiret long. (LECONS 0bis)
- **`tel:` / liens externes** : un numéro affiché est-il cliquable sur mobile ? un lien externe prévient-il « vous quittez l'application » ?
- **Territoire** : l'explication dépend-elle du département ? Si oui, filtrer via `demanderDepartementSiInconnu(cb)` (`js/app.js`), jamais un contenu 87 montré à quelqu'un du 24.
- **Node vs navigateur** : `js/app.js` et les `modules/*/index.js` (DOM) ne passent pas les tests Node → test navigateur obligatoire. (LECONS 9.23)

## Git - workflow de ce dépôt (validé avec Denis le 2026-08-28)

Denis travaille seul sur ce dépôt et veut le travail terminé directement sur `master`.

- Une tâche **terminée ET vérifiée par un vrai test** (pas « ça devrait marcher ») se commit **directement sur `master`**, sans branche, **sans redemander l'autorisation à chaque fois**.
- Créer une branche, ou demander avant de fusionner, **uniquement** si : le changement est gros ou risqué, il n'est pas encore vérifié, c'est un travail en cours que Denis veut relire avant qu'il n'atterrisse, ou Denis le demande explicitement.
- **Ne jamais `push` ni fusionner vers un dépôt distant sans que Denis le demande.**
- Ne pas transformer la question du branchement en friction récurrente : la règle ci-dessus tranche par défaut.

## Autres repères déjà établis (voir `docs/LECONS_A_NE_PAS_REPRODUIRE.md`, section 10)

- Français impeccable, tous les accents, sur tout écrit (section 0bis).
- Maquette / questions avant de coder dès qu'il y a un doute d'interface ; corrections regroupées par bloc, jamais à chaud.
- Tracer le parcours réel complet (écran d'avant, écran d'après, fonctions, boutons) avant toute maquette ou proposition (règle 2bis).
- Après une compression de la conversation, le signaler à la reprise (règle 4).
- Jamais de refus silencieux : dire quand une consigne semble entrer en conflit avec l'existant (règle 9).
