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
- **Économie du budget d'utilisation de Denis** (ajouté 2026-09-23) : il a un temps de session limité, pas illimité. Grouper les vérifications au lieu de faire un aller-retour par question évitable, ne pas relire un fichier déjà lu dans la session, annoncer un choix raisonnable déjà tranché plutôt que de redemander une confirmation inutile.
- **Comment vérifier toi-même en 10 secondes** (ajouté 2026-09-23) : à la fin d'une tâche Mode B/C, ajouter une ligne concrète de vérification que Denis peut faire sans lire de code (quoi cliquer, quoi regarder) - jamais se contenter de « c'est fait, testé ».

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
- **Mode C - Tâche mécanique / correction ciblée.** Bug identifié, texte à corriger, petit ajout localisé, sans enjeu de cohérence globale. Claude fait et rend compte en une ligne. Zéro charge de décision pour Denis. **Démarre par défaut en `/effort low`** (ajouté 2026-09-23) - économise le budget de Denis sur ce qui ne demande pas de délibération poussée. Les vérifications obligatoires (tests, grep tout le dépôt, navigateur) restent dues quel que soit l'effort. Si la tâche se révèle en cours de route plus subtile que prévu (pas vraiment mécanique) : remonter l'effort et le signaler, jamais continuer en bas effort par automatisme.

**Règle liée** : si Claude juge qu'une tâche est en Mode A et que Denis est fatigué, Claude le dit et recommande de reporter - il ne découpe PAS le chantier en micro-tâches pour "avancer quand même".

## Niveau d'effort recommandé (ajouté 2026-09-29)

Avec le mode, Claude annonce le niveau d'effort recommandé pour la tâche (`/effort`, que seul Denis peut régler). Le budget d'utilisation de Denis prime : toujours l'effort le plus bas qui suffit.

- **Mode A** : `high`.
- **Mode B** : `medium`.
- **Mode C** : `low` (voir plus haut).
- **Mode Nuit** : `medium`, jamais `low` (personne pour rattraper une tâche mal classée).
- **Mode D** : `xhigh`. Réservé aux audits (étapes 2 et 4 de la méthode maquette) et aux sujets très délicats, quand le Mode A à `high` ne suffit pas. Coût élevé : uniquement avec l'accord explicite de Denis. Les audits démarrent donc en Mode A et montent en Mode D si besoin. Si un doute subsiste après un audit à effort réduit, le signaler.

**Planifier, puis exécuter** : regrouper plusieurs tâches, en faire le plan détaillé dans un fichier (une case par tâche), puis les exécuter à effort plus bas puisque les décisions sont prises. Si une tâche se révèle plus subtile que prévu, remonter l'effort et le signaler. Les vérifications obligatoires (tests, grep, navigateur) restent dues à tous les niveaux. Ces niveaux sont un point de départ, à ajuster après les premiers vrais chantiers.

## Effort étiqueté sur chaque tâche, et tâches regroupées par niveau (demande de Denis, 2026-10-01)

**Pourquoi** : Denis règle `/effort` une fois par séance. S'il sait quelles tâches sont de bas, de moyen ou de haut niveau, il peut ouvrir une séance « bas niveau » (économe) puis une séance « haut niveau » (attentive), au lieu de payer un effort élevé pour des tâches mécaniques.

**1. Étiquette obligatoire.** Toute tâche qu'on s'engage à faire (liste de tâches, plan, case à cocher, `[À FAIRE]` de `TACHES_VALIDEES.md`, fichier de passation) porte une étiquette en tête de ligne : **`[effort : bas]`**, **`[effort : moyen]`** ou **`[effort : haut]`**. Une tâche sans étiquette est une tâche mal posée.

**2. Sens des trois niveaux** (le niveau décrit l'effort de réflexion demandé, pas la durée) :

| Étiquette | Correspond à | Critères (un seul critère « haut » suffit pour être « haut ») |
|---|---|---|
| **bas** | Mode C, `/effort low` | Texte, bug ou petit ajout localisé ; aucune décision à prendre ; ne touche aucune fonction ni brique partagée. |
| **moyen** | Mode B, `/effort medium` | Le quoi est tranché ; plusieurs fichiers ou une brique commune à réutiliser ; test navigateur nécessaire ; pas de choix de conception. |
| **haut** | Mode A, `/effort high` (Mode D `xhigh` seulement sur accord de Denis) | Décision d'architecture ou d'interface, maquette, algorithme modifié, fonction partagée à changer (grep sur tout le dépôt), plusieurs modules touchés, risque de régression réel. |

**3. Qui étiquette.** Claude, au moment où la tâche est posée, **après un audit minimal du code concerné** (jamais au jugé sur le titre). Il le dit en une ligne. L'étiquette est **révisable** : si l'audit ou l'exécution révèle une tâche plus subtile, Claude la remonte d'un niveau, le signale à Denis et ne continue pas en bas effort par automatisme (règle déjà posée pour le Mode C). Une tâche abaissée doit être justifiée de la même façon.

**4. Regroupement par niveau (second axe, jamais le premier).** Quand Claude propose quoi coder ensuite, il présente les tâches ouvertes **regroupées par niveau** (tout le bas, puis tout le moyen, puis tout le haut) pour que Denis choisisse une séance à un seul effort. Ce regroupement se fait **dans les fichiers de tâches existants** (sections « Bas niveau », « Moyen niveau », « Haut niveau »), jamais dans un deuxième fichier qui dupliquerait la liste (une seule source de vérité).

**Exceptions où le regroupement par niveau cède le pas** (à dire clairement quand elles s'appliquent) :
- **Dépendance** : une tâche haute doit précéder la tâche basse qui s'appuie dessus. L'ordre logique l'emporte.
- **Même endroit du code** : deux tâches qui touchent le même module ou le même écran se traitent dans le même passage (règle de `TACHES_VALIDEES.md`), même si leurs niveaux diffèrent. On les fait alors au niveau le plus haut des deux, et on le signale.
- **Mode Nuit** : jamais `low` (voir plus haut), même si toutes les tâches sont étiquetées « bas ».

**5. Une séance = un niveau.** En début de séance, Claude annonce le niveau d'effort de la séance et la liste des tâches qu'elle couvre. Il ne mélange pas : si une tâche d'un autre niveau surgit, il la note à sa place dans la liste au lieu de la traiter à chaud (sauf défaut bloquant ou règle « défaut trouvé pendant une tâche »).



Pour déléguer du pur codage sur une fenêtre où Denis n'est pas disponible (nuit, absence), sans consommer sa vigilance de journée sur des tâches qui ne demandent plus de décision.

**Verdict obligatoire à la fin de tout plan Mode A** : une fois un chantier entièrement planifié, Claude annonce **systématiquement**, sans que Denis ait à le demander, un verdict en toutes lettres :

- **APTE AU MODE NUIT** - toutes les décisions produit / UX / architecture sont tranchées, plus aucune ambiguïté, il ne reste que du code à écrire selon le plan validé.
- **NON APTE AU MODE NUIT** - suivi de la liste précise des décisions encore ouvertes qui bloquent, pour que Denis puisse les trancher et obtenir un nouveau verdict.

Denis préfère nettement tout trancher en amont plutôt qu'un mode nuit partiel (une partie codée la nuit, une partie repoussée à une décision ultérieure) - ne proposer cette troisième option qu'à sa demande explicite, jamais par défaut.

**Prérequis avant de démarrer (protection contre le compactage de la conversation)** : le plan validé doit être écrit dans un fichier (`docs/CHANTIER_<sujet>.md` ou une liste dédiée), avec une case à cocher par tâche - jamais seulement porté par la conversation. Un compactage ne touche que la mémoire de la conversation, jamais un fichier sur le disque - c'est pour ça que le fichier doit faire foi, pas ma mémoire du fil de discussion.

**Déroulement une fois le feu vert donné** : Claude avance seul sur la liste de tâches actée, coche chaque tâche dans le fichier de plan et commite à chaque case cochée, `npm test` à chaque fois, vérification navigateur faite par Claude lui-même (navigateur intégré) quand elle ne demande pas de jugement subjectif de Denis. Aucun `push`, aucune commande destructive - le reste du protocole s'applique à l'identique.

**Garde-fou (réconcilie avec la règle « jamais de mode tunnel » de `CLAUDE.md`)** : si une ambiguïté réelle surgit quand même en cours de route (cas non prévu par le plan), ne jamais deviner - s'arrêter sur cette tâche précise, noter clairement le blocage, continuer sur les autres tâches de la liste qui restent claires.

**Vérification systématique, pas seulement si un compactage est détecté** : Claude ne peut pas garantir à 100 % qu'il détecte un compactage au moment où il survient - il dépend de ce que le système lui indique, sans moyen de le vérifier de façon autonome et certaine. Donc, plutôt que de compter sur cette détection : **avant chaque sous-tâche du mode nuit**, relire l'état réel des cases cochées dans le fichier de plan et vérifier avec `git log`, qu'un compactage soit soupçonné ou non. Cette vérification ne dépend jamais de la mémoire de la conversation.

**Au réveil** : un compte-rendu en tête de session - fait / bloqué / pourquoi -, avec le hash du commit de départ (pour un retour arrière propre si besoin), pour que Denis n'ait qu'à lire, pas à chercher.

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

**Méthode, en 4 étapes à coût croissant (précisée 2026-09-23, après le temps perdu sur la maquette CV PDF - 3 jours investis avant de découvrir des trous de faisabilité)** :

1. **Concept grossier** : un visuel simple - croquis, moodboard, ou image produite ailleurs (Denis peut la faire générer par un autre outil, ex. ChatGPT/DALL-E, et l'apporter). Pas de détail, pas de contrôle cliquable réel. Juste poser l'idée générale.
2. **Carte de faisabilité rapide** : avant tout détail, lister chaque bouton / interaction envisagé dans le concept grossier et faire un balayage **ciblé** (grep + lecture des points clés concernés, pas un audit exhaustif) du code réel : la fonction existe-t-elle déjà, faut-il la créer, quel niveau de risque. **Verdict préliminaire explicite, avant d'aller plus loin** : GO (on détaille) / GO AVEC RÉSERVES (on détaille, réserves nommées) / NO GO (on n'investit pas plus de temps, avec la raison). But : repérer un problème structurel avant d'y passer des heures de détail, pas après.
3. **Maquette détaillée** : seulement si l'étape 2 dit GO ou GO AVEC RÉSERVES assumées par Denis. Placement précis des écrans / boutons / textes.
4. **Audit complet et verdict final avant code** : comparer la maquette détaillée au code réel existant, produire l'**inventaire des fonctions / boutons / prompts de l'existant** étiqueté `GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI` - aucun « RETIRÉ » sans ligne dédiée validée (la Partie A du plan de consolidation du Bilan en est le modèle) - et donner, élément par élément de la maquette, un **verdict de faisabilité final** : faisable tel quel / faisable avec un ajustement (lequel, pourquoi) / non faisable (pourquoi, alternative réaliste). Après la refonte : cocher que chacun est retrouvé **et fonctionnel**.

**Cas d'un module neuf (rien à comparer)** : l'étape 4 devient une vérification de cohérence contre `docs/LANGAGE_VISUEL_COMMUN.md` (visuel) et `docs/BRIQUES_COMMUNES.md` (logique / composants), pour que le nouveau module s'intègre au tout plutôt que d'être un objet isolé.

**Qui attribue les étiquettes GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI** : Claude les propose (comparaison factuelle entre la maquette et le code existant), Denis valide la liste complète - en particulier tout **RETIRÉ**, qui reste bloqué tant que Denis n'a pas dit oui explicitement.

**Ne s'applique pas** aux ajustements mineurs à faible risque (petite retouche visuelle, réglage isolé, pas de refonte) - pour ceux-là, itérer directement dans le code sert de maquette, sans passer par les 4 étapes (pratique validée sur le chantier icône Pistes de côté, 2026-09-20).

## Rapport d'écart et de marche arrière (ajouté 2026-09-23)

**Déclencheur** : dès que Denis signale une insatisfaction explicite (« ça ne va pas », « je ne suis pas content », ou équivalent) sur un travail en cours ou tout juste livré - **réflexe immédiat, sans attendre qu'il le demande** : produire ce rapport avant de continuer à corriger quoi que ce soit. Jamais une réaction à chaud (« on répare », ou à l'inverse « on efface tout ») sans être passé par cette analyse.

**Contenu du rapport, toujours dans cet ordre** :
1. **L'écart constaté** : ce qui était prévu (plan / maquette validée) face à ce qui a été réellement livré - concret, avec les points précis qui divergent.
2. **Coût de correction** (réparer l'existant) : estimation **haut / moyen / faible**, avec le pourquoi en quelques lignes (combien de fichiers/fonctions touchés, quel risque de casser autre chose au passage).
3. **Coût de marche arrière** (revenir à l'état d'avant via git, puis refaire) : estimation **haut / moyen / faible**, avec le commit de retour identifié.
4. **Recommandation claire** : réparer / repartir de zéro - avec le pourquoi en quelques lignes, en comparant objectivement les deux coûts.

**Si marche arrière recommandée et actée par Denis** : avant de recommencer, lister explicitement les erreurs commises la première fois (ce qui a fait dériver le résultat), pour que la nouvelle tentative les évite - jamais reproduire le même chemin en espérant un résultat différent.

Ce rapport s'appuie sur une discipline déjà en place : « un commit par sous-étape, jamais un état à moitié refondu » garantit qu'un point de retour propre existe presque toujours - la marche arrière reste une option réaliste, pas un pari. C'est aussi une application directe de la franchise obligatoire sur la faisabilité (voir plus haut) : dire clairement quand continuer coûte plus cher que reprendre, plutôt que de s'entêter par habitude.

**Franchise obligatoire à chaque étape** : Denis n'est pas programmeur, il ne peut pas juger seul de la faisabilité. Si un concept, une maquette ou une demande dépasse ce qui peut être réellement codé ou maintenu, le dire tout de suite et clairement - jamais laisser croire que « on verra en codant ». Tout risque technique se traduit en conséquence concrète et observable (quel bouton, quel écran, quelle donnée), jamais en jargon pur. Un renoncement dit clairement vaut mieux qu'un faux espoir.

Voir aussi `LECONS_A_NE_PAS_REPRODUIRE.md` section 10, Règle 11.

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

Systématiquement, avant de proposer un plan ou d'écrire du code, **en lecture ciblée** (mise à jour 2026-09-29 : ces 4 fichiers pèsent ensemble environ 190 000 tokens, les lire en entier avant chaque chantier n'est ni réaliste ni utile) :

**Méthode de lecture ciblée** : `LECONS_A_NE_PAS_REPRODUIRE.md` : lire en entier les sections 0bis et 10 (les règles), puis `grep` du nom du module et des mots-clés du sujet dans le reste. `TACHES_VALIDEES.md`, `IDEES_A_RECLASSER.md`, `BRIQUES_COMMUNES.md` : `grep` du nom du module, du champ (`dossier.xxx`) et des mots-clés, puis lire seulement les entrées trouvées. Dire en une ligne ce qui a été consulté. Si le `grep` ne ramène rien, essayer plusieurs mots-clés proches avant de conclure qu'il n'existe rien.

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

- Après une compression de la conversation, le signaler à la reprise **et relire `CLAUDE.md` + `docs/TRAVAILLER_AVEC_DENIS.md` + le fichier de plan actif** avant de continuer - jamais se fier au seul résumé de compactage (règle 4).
- Jamais de refus silencieux : dire quand une consigne semble entrer en conflit avec l'existant (règle 9).
