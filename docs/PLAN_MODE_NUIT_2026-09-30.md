# Plan du mode Nuit et analyse de tous les points ouverts (écrit le 2026-09-30)

Demande de Denis : « Je suis dépassé par l'ampleur et la complexité. Refais une analyse de tous les points, donne tes recommandations, fais des plans pour les décisions importantes, et un plan pour travailler en mode nuit. »

**Ce fichier fait foi, pas la conversation.** À lire avec `docs/TACHES_RESTANTES_2026-09-30_NUIT.md` (règles de travail et procédure du banc), `docs/PASSATION_2026-09-30_FIN_DE_JOURNEE.md` et `docs/TRAVAILLER_AVEC_DENIS.md` (section Mode Nuit).

**Point de départ pour un retour arrière propre** : `master`, commit `66bec6b6` (Découverte, leçon 18), `npm test` 1174 verts, arbre propre, aucun `push`.

---

## 1. Ce qui est TERMINÉ (pour relâcher la pression)

Tout ceci est fait, commité, testé. Il n'y a rien à refaire :

- Reformuler : six cartes de situation au début, PMSMP devenu « Formation », stage en deux options, contenu adapté à la formation, lignes directrices par situation dans tous les prompts.
- « Retour » = page précédente partout (pile de navigation, deux boucles corrigées).
- Disquette : progression et validation sauvegardées ; ton fichier rejoué et corrigé.
- Étape « Choisir ce qui ira sur le CV » : plus obligatoire, les propositions s'appliquent dès l'import, la synthèse reste consultable repliée ; **Découverte corrigé** (l'import aboutit sur « Mon CV »).
- Mise en page du CV : 4 ordres d'affichage, « Mon ordre » dans le grand aperçu, mois dans les options rapides, dates alignées par défaut, gras cohérent, certifications en poids normal et regroupées sur une ligne dès 3, trou des compétences, « (niveau) » vide retiré, ordre de l'expérience personnelle.
- Prompt du CV : le titre choisi est recopié tel quel, plus de « junior ».
- Word : Nicolas tient sur 1 page, **l'en-tête libre ne recouvre plus les compétences** (corrigé ce soir, cause : Word ignore l'espace avant en haut de page).
- Corrections N1 à N6 (nom/prénom, barre du bas, reprise du parcours, ordre chronologique, certifications dans une expérience, blocs de relecture retirés).
- Branches `travaux-2026-09-29-a-verifier`, `logiciels-rubrique-cv` : déjà fusionnées dans `master` (0 commit d'avance).

---

## 2. Les DÉCISIONS qui te reviennent (6 seulement), avec ma recommandation

Réponds « OK à tout », ou donne le numéro que tu veux changer. Dès que c'est fait, le verdict passe à **APTE AU MODE NUIT** pour les lots N1 à N6.

| # | Décision | Ma recommandation | Pourquoi |
|---|---|---|---|
| D1 | Retirer le bloc « Relire et masquer » (obligatoire) du Bilan ? | **OUI**, avec relecture qui s'ouvre seule après un collage de texte, et bouton « Relire à nouveau et masquer » dans le bloc « Votre CV » | Identique à Préparer, Co-lettre et Entretien (déjà décidé). Le dépôt de fichier fait déjà la relecture. Seul le collage de texte en dépend : c'est pourquoi la relecture doit s'ouvrir seule, sinon le texte partirait sans masquage possible. |
| D2 | Lignes directrices « alternance » et « formation » : valides-tu mes textes ? | **OUI, tels quels** (voir § 6) | Écrites dans le même esprit que les tiennes. Tu les retouches quand tu veux : c'est une seule ligne par situation dans `js/app.js`. |
| D3 | Mode par défaut de l'expérience personnelle | **Garder « Citer seulement »** (ta décision du 2026-09-29) | Un CV court, moins de contenu à relire. La personne passe en « Développer » d'un clic si elle le veut. Rien à coder. |
| D4 | Vraie rubrique « Certifications » à part (T2 temps 2) | **REPORTER** au chantier de remodelage des A5 | Le regroupement sur une ligne dès 3 certifications donne déjà l'essentiel. Le gros du travail (24 modèles PDF + Word, ordre personnalisé, grand aperçu, banc avec certifications) pèse lourd pour un gain faible. Même travail de fond que ton futur chantier A5. |
| D5 | Migration des 4 écrans de « Comparer mes pistes » vers le choix d'assistant commun | **TRANCHÉ PAR DENIS (2026-09-30) : à faire la nuit, lot N2.** J'avais proposé de reporter ; il a raison : l'audit du code montre que ce n'est qu'une substitution par des composants existants, sur un schéma déjà appliqué à l'écran « Collecter ». | Les ~15 autres écrans de l'application à l'ancien collage restent hors périmètre (sur demande, écran par écran). |
| D6 | « Comparer mes pistes » : la réponse « n'a pas pu être lue » | **Tu me redonnes le texte collé** (ou tu laisses tomber) | Sans ce texte, je ne peux rien corriger : la cause est dans le format de la réponse de l'assistant. |

---

## 3. Ce que JE peux faire seul la nuit (lots N1 à N6)

Règles du mode Nuit (rappel) : relire ce fichier et `git log` avant CHAQUE lot (un compactage ne se détecte pas de façon sûre) ; un commit par lot ; `npm test` vert avant chaque commit ; vérification navigateur faite par moi ; aucun `push`, aucune commande destructive, `git add` de chemins explicites ; si une ambiguïté réelle surgit, **je ne devine pas** : je note le blocage ici, je passe au lot suivant. Effort `medium` (`high` pour N1 car il touche la confidentialité et la navigation).

### [x] N1 FAIT (2026-09-30 nuit) (effort `high`). Bilan : retirer le bloc « Relire et masquer » (D1)
**Fait** : bloc retiré ; la relecture vit dans « Votre CV » (bouton principal « Relire et masquer mon CV » si le CV n'est pas relu, « Relire à nouveau et masquer » sinon) ; un texte collé ouvre la relecture seul ; annulation = CV oublié + choix de dépôt (plus de retour silencieux du CV de l'application) ; verrou du bloc suivant et message de la barre mis à jour. Essayé dans le navigateur : sans CV, collage, validation, annulation, CV de l'application non relu. `npm test` 1174.

Fichiers : `js/app.js`, fonctions `htmlBilanPreparer` (~22334, bloc « Relire et masquer ») et `brancherEvenementsBilanPreparer` (~27650-27760), verrou `preparerBloc3` (~27652).
Plan :
1. Audit : `grep` de `preparerBloc2`, `btnPreparerRelecture`, `relectureFaite`, `bilanDemanderRelectureCv` dans TOUT le dépôt (leçon 18).
2. Retirer le bloc numéroté et la mention « obligatoire », renuméroter.
3. Après un **collage de texte** (`btnPreparerCollerValider`) : ouvrir `bilanDemanderRelectureCv` tout de suite ; annulation = le CV est oublié (comme aujourd'hui, décision 2026-09-29). Après un **dépôt de fichier** : rien de plus (`dejaRelu` fait déjà le travail).
4. Verrou des blocs suivants : il ne dépend plus d'un bloc séparé, il dépend de « CV présent et relu » (`etat.relectureFaite`), conservé en interne.
5. Bouton « Relire à nouveau et masquer » + vidéo `masquage-texte` dans le bloc « Votre CV » (même présentation que `btnCoLettreRelecture`, `data/metiers.js` ~5113).
6. Test navigateur des **deux** chemins (fichier, collage) + annulation de la relecture + « Changer de CV » + jeu de test `npm test`.
Critère de fin : aucun texte collé ne peut partir sans passage par la relecture.

### [x] N2 FAIT (2026-09-30 nuit) (effort `high`). Comparer mes pistes : les 4 écrans passent au parcours commun d'envoi à l'assistant
**Décision de Denis (2026-09-30)** : ses écrans ne sont pas cohérents avec le reste de l'application ; il faut remplacer leur ancien rendu (texte du prompt affiché dans un cadre, bouton « Copier », zone de collage) par le parcours commun, en respectant les fonctions de chaque écran. Le but : qu'il n'ait plus à s'en occuper.

**Audit fait (2026-09-30, code lu)** : `modules/comparer-pistes/index.js`. Le modèle existe déjà et est testé : l'écran 2 « Collecter » (`ecran2HTML` ~1620, `ecran2PreparerEtEnvoyer` ~1687, `ecran2BrancherChez` ~1704, `ecran2TraiterCollage` ~1736, `ecran2Brancher` ~1775), avec trois phases `choix` / `chez` / `coller` (`etat.envoiCollecte`), les composants communs `htmlChoixAssistantBilanCorps`, `ouvrirFenetreAssistantIA`, `htmlBanniereTransitionIA`, `recopierTexteAssistantPuisOuvrir`, `htmlCollageInstantane`, `_etatTransitionIA`, et la gestion de « Retour » (~2807). Ce qui est simple : tout est de la reprise. Ce qui demande de l'attention : la gestion du « Retour » par écran et le texte de confidentialité exact de chaque écran.

**Les 4 écrans, et ce qu'il faut conserver de chacun (les fonctions)**
| Écran | Fonction (`index.js`) | Prompt (`prompts/`) | À conserver |
|---|---|---|---|
| Détection des pistes (écran 0 bis, étape « detection ») | `ecran0bisHTML` ~1256 / `ecran0bisBrancher` ~1376 | `comparer-detection` (aucune recherche web) | Bouton « Nommer mes pistes moi-même » (`data-cp-sauter-detection`), message d'erreur `detectionErreur`, validation qui construit les pistes |
| Côte à côte affiné (écran 5, bloc facultatif « Affiner avec un assistant ») | `ecran5HTML` ~2098 / `ecran5Brancher` ~2154 | `comparer-meme-categorie` (aucune recherche web) | Reste FACULTATIF et replié ; `superpositionAffineeErreur` ; le rendu des réglettes ne change pas |
| Dans le temps (écran 6) | `ecran6HTML` ~2310 / `ecran6Brancher` ~2366 | `comparer-situations` (aucune recherche web) | « Je n'ai pas d'assistant en ligne » (`friseSansAssistant`), « Coller une autre réponse », `friseErreur`, `ecran6PeutContinuer` |
| Aller plus loin (écran 7) | `ecran7HTML` ~2427 / `ecran7Brancher` ~2470 | `comparer-aller-plus-loin` (aucune recherche web) | Facultatif, bouton « Passer, aller à Ce que je retiens », « Coller une autre réponse », `pistesReflexionErreur` |

**Plan (un commit par étape, `npm test` vert et essai navigateur avant la suivante)**
0. **Option « Perplexity direct » (demande de Denis)** : dans la brique, paramètre `assistantRecommande` ; s'il est renseigné, un bouton principal « Aller sur Perplexity (recommandé pour cette recherche) » s'affiche au-dessus des pastilles habituelles et déclenche `ecran2PreparerEtEnvoyer('perplexity')` (même fenêtre de confirmation, même copie, même ouverture). Seulement pour l'écran Collecter (les 4 autres ne demandent pas de recherche web). Essai navigateur : le bouton existe, ouvre la confirmation Perplexity, les pastilles restent.
1. **Brique commune dans `index.js`** (une seule source de vérité, règle du projet) : extraire de l'écran 2 une paire de fonctions génériques (rendu des trois phases + câblage) paramétrées par : identifiant de l'envoi, fonction qui construit le texte, clé d'état de la phase (`etat.envoi[id]`), suffixe des ids du collage, fonction qui traite le texte collé, message d'erreur, texte de recommandation d'assistant (pour l'écran 2 : recherche web activée ; pour les 4 autres : « aucune recherche web nécessaire »), phrase de confidentialité. Brancher d'abord l'écran 2 dessus et **prouver qu'il se comporte exactement comme avant** (mêmes phases, mêmes messages, même « Retour »). Si cette étape révèle un risque sur l'écran 2, je m'arrête et je laisse l'écran 2 tel quel pour les 4 autres (deux commits séparés).
2. **« Retour » générique** : dans `_comparerActionsBarre.retour` (~2807), remplacer le cas particulier de l'écran 2 par une règle commune : dans la phase `coller` on revient à `chez`, dans `chez` à `choix`, puis on quitte l'écran ; ne jamais boucler.
3. **Écran 6 « Dans le temps »**, puis 4. **Écran 7 « Aller plus loin »**, puis 5. **Écran 5 « côte à côte affiné »** (le bloc facultatif garde son repli), puis 6. **Détection des pistes** (la plus délicate : elle a son propre « Nommer mes pistes moi-même » et sa validation construit l'état). Pour chacun : supprimer l'affichage du texte du prompt (`cp-prompt`) et l'ancien bouton « Copier » (et l'entrée correspondante dans la délégation de suivi ~2840, en gardant le suivi `comparer_prompt_copie` par type), `grep` du dépôt pour toute référence restante (leçon 18).
7. **Confidentialité, règle à appliquer écran par écran** : lire le constructeur du texte de l'écran (`ecran0bisTextePromptDetection`, `ecran5TextePromptSuperpo`, `ecran6TextePromptFrise`, `ecran7TextePrompt`) et écrire une phrase EXACTE sur ce qui part (pas « ne contient pas votre nom » si le texte reprend ce que la personne a écrit en texte libre). Si un texte peut contenir un nom saisi par la personne, la phrase le dit et invite à relire ; je ne change pas le comportement de masquage (hors périmètre, à signaler à Denis dans le compte-rendu).
8. **Essai navigateur pour chaque écran, avec un assistant simulé** : état préparé en console, clic sur un assistant, fenêtre de confirmation, phase « chez » (décompte, `window.open` simulé, presse-papiers simulé), « Je suis de retour », collage d'une réponse valide (exemples dans `tests/fixtures` et `tests/comparerPistesLectureReponse.test.js`), puis cas d'une réponse invalide (message d'erreur affiché, pas de blocage), « Retour » à chaque phase, reprise après rechargement, mode sombre, largeur mobile. Noter le résultat de chaque écran dans ce fichier.
9. `npm test`, `node scripts/checkLexique.js`, test de navigation complet du module (écran 0 jusqu'à « Ce que je retiens »).
**Critère de fin** : plus aucun texte de prompt affiché dans le module ; les 5 envois (Collecter + 4) passent par la même brique ; aucune fonction perdue (tableau ci-dessus) ; « Retour » ne boucle jamais.
**RÉSULTAT (nuit du 2026-09-30)** : les cinq envois (Collecter, Détection, Côte à côte affiné, Dans le temps, Aller plus loin) passent par UNE brique commune (`envoiIAConfig`, `envoiIAHTML`, `envoiIAPreparerEtEnvoyer`, `envoiIABrancherChez`, `envoiIABrancher`, `envoiIARetourArriere` dans `modules/comparer-pistes/index.js`). Bouton « Aller sur Perplexity (recommandé pour cette recherche) » sur Collecter. « Retour » recule coller, puis chez, puis choix, puis quitte l'écran (vérifié). Étapes du choix d'assistant sans recherche web pour les 4 autres écrans. Phrases de confidentialité exactes par écran ; Détection : la phrase dit que le texte reprend ce que la personne a écrit et l'invite à retirer nom/adresse/téléphone avant (le masquage lui-même n'a pas été changé). Fonctions conservées : « Nommer mes pistes moi-même », « Je n'ai pas d'assistant en ligne », « Coller une autre réponse », « Passer », erreurs de lecture affichées dans le collage. Essayé dans le navigateur pour chaque écran avec un assistant simulé (confirmation, décompte, ouverture simulée, retour, réponse invalide puis valide). Fait en un seul commit (et non un par écran) parce que la brique est commune. Reste pour toi : le vrai presse-papiers et la vraie ouverture de Perplexity. `.cp-prompt` (CSS) n'est plus utilisé dans ce module : à retirer au prochain passage de nettoyage du CSS.
**Garde-fou (non déclenché)** : si l'écran « Détection des pistes » ne peut pas être migré sans changer sa logique de validation, je migre les trois autres, je note le blocage précis ici et je continue ; pas de bricolage.
**Reste hors de ma portée** : le cas « la réponse n'a pas pu être lue » (D6) ; le parcours avec un vrai assistant (copie dans le presse-papiers et ouverture réelle de Perplexity) reste à ton essai (§ 5).

### [x] N3 FAIT (2026-09-30 nuit) : la ligne directrice arrive bien dans le profil du CV, de la lettre et de l'entretien (21 cas sur 21) et dans Reformuler (7 sur 7). (effort `medium`). Valider par le navigateur les lignes directrices (D2) et le prompt du CV
1. Vérifier dans les prompts finaux que la ligne de la situation est bien injectée pour les 7 situations (lecture des textes générés par `contexteCandidaturePourAnalyse` + `ligneDirectriceSituation` dans Reformuler, CV, lettre, entretien).
2. Rapport court des écarts éventuels. Je ne peux pas faire l'essai avec un vrai assistant : le contrôle « le titre choisi est gardé, sans junior » reste à TON essai réel (voir § 5).

### [x] N7 FAIT (2026-09-30 nuit, demande de Denis en cours de nuit) : prompts « moins robot »
Demande : de plus en plus de CV sont repérés comme écrits par un assistant à leur langage ; ajouter une touche d'authenticité.
Fait : fragment commun unique `prompts/_voix-humaine.md` (ses mots d'abord, du concret, pas de formules d'assistant listées, rythme naturel, verbes simples, mots-clés de l'offre seulement s'ils correspondent au réel), repris par le repère `{{VOIX_HUMAINE}}` dans `cv`, `decouverte-redaction`, `lettre`, `lettre-co`, `entretien`, `entretien-accueil`, `reformuler-cv` (remplacé au chargement par `chargerPromptsExternes`, `js/app.js`), et par `{VOIX_HUMAINE}` dans `bilan-titre-accroche` (builder). Test `tests/voixHumainePrompts.test.js`. Vérifié dans le navigateur : les 7 prompts et le prompt du Bilan contiennent le texte, aucun repère restant.
**À TON ESSAI RÉEL** (je ne peux pas le juger sans un vrai assistant) : relire une accroche et une lettre produites, dire si le ton te convient ; les formules à éviter se règlent dans un seul fichier. Non couverts (idées pour plus tard, dans la liste à garder) : `bilan-v2`, `bilan-v2-lot` (propositions de réécriture du Bilan), `regard-*`.

### [x] N4 FAIT (2026-09-30 nuit) : 385 textes du panneau contrôlés en mode sombre, un seul défaut (les deux grandes cartes « Style rapide » et « Mise en page », contraste 3,0, ancien) corrigé dans `css/mise-en-page-maquette.css` (4,9) ; 0 défaut ensuite. (effort `medium`). Mode sombre du panneau « La mise en page » modifié
Navigateur intégré : `resize_window` avec `colorScheme: dark`, ouvrir le panneau, contrôler cartes, listes d'ordre, cases (Mes mois, certifications une par ligne, dates alignées), bouton « Ranger dans le grand aperçu ». Mesurer les contrastes (objectif : au moins 4,5). Corriger les variables manquantes `[data-theme="sombre"]`. Un commit.

### [x] N5 FAIT (2026-09-30 nuit) (effort `high`). Relecture des trois points
**Résultat** : **C8 confirmé corrigé** : `demarrerBilanCandidatureAvecDepot({cvDejaRelu})` ouvre le Bilan avec le CV repris, « Déposé et relu », bloc suivant déverrouillé, « Choisir mon assistant » actif (rejoué dans le navigateur, après le retrait du bloc de relecture du lot N1). **C6 confirmé** : le test de `orchestrationAssistance` couvre le cas, et le code lit bien `missions` dans la cible (`resolutionDestination.js`), donc une expérience AVEC missions n'est jamais détournée. **C7 non reproductible, mais plus de cas silencieux** : « Appliquer à ma lettre » ouvre la lettre (`ctVoirImprimerLettre`) et, sans lettre, affiche « Aucune lettre à modifier n'a été trouvée ». Rien à corriger. Seul changement : un commentaire périmé de `data/metiers.js` (numérotation des blocs du Bilan).
 faits sans l'effort demandé (C6, C7, C8)
Investigation et rapport, sans refonte : C6 (aiguillage vers `missions` pour une expérience sans mission), C8 (reprise du CV déjà relu depuis Cohérence, parcours complet à rejouer), C7 (cause du « rien ne se passe », non reproduite). Pour chacun : rejouer dans le navigateur avec des données de test, conclure « confirmé / corrigé / non reproductible », corriger seulement si la cause est certaine. Noter ici le résultat.
Hors périmètre : C6 points 5 et 6 (expérience personnelle sans mission, « Coiffeuse » / « Aide cuisine » absentes) : il faut la disquette de Josianne (toi).

### [x] N6 FAIT (2026-09-30 nuit) (effort `medium`). Entretien du dépôt et des outils
**Fait** : référence du banc régénérée (`scripts/word/banc_b7_reference.json`, 24 modèles, identique au banc de la veille : aucun rendu de CV n'a changé depuis) ; `npm test` 1178 verts, `node scripts/checkLexique.js` : aucune erreur ; état des chantiers et mémoire mis à jour ; compte-rendu du réveil : `docs/COMPTE_RENDU_NUIT_2026-09-30.md`. Extension de « voix humaine » aux deux prompts de réécriture du Bilan (`bilan-v2`, `bilan-v2-lot`), test mis à jour (11 repères). Branches déjà fusionnées non supprimées (à toi de décider) : `travaux-2026-09-29-a-verifier`, `logiciels-rubrique-cv`, `nettoyage-b7-ancien-moteur-word`.
(Texte d'origine du lot ci-dessous.)
1. Régénérer `scripts/word/banc_b7_reference.json` depuis `localStorage.__banc_apres_wordentete` (banc relancé sur `master` à jour).
2. Mettre à jour `docs/ETAT_DES_CHANTIERS.md` (partie 0, bloc de passation) et la mémoire `project_taches_restantes_2026-09-30` avec l'état réel de la fin de nuit.
3. Lancer `node scripts/checkLexique.js` et `npm test` : attendre 0 erreur, 0 avertissement.
Jamais de suppression de branche (destructif) : je liste seulement ce qui est fusionné (`travaux-2026-09-29-a-verifier`, `logiciels-rubrique-cv`, `nettoyage-b7-ancien-moteur-word`) pour que TU décides.

### Au réveil
Compte-rendu en tête de session : fait / bloqué / pourquoi, hash de départ `66bec6b6`, hash de chaque lot.

---

## 4. Verdict

**MISE À JOUR 2026-09-30 (soir) : Denis a validé D1 et D2. Verdict : APTE AU MODE NUIT pour N1 à N6.** Ajouts de Denis : (a) tout ce qui n'est pas fait la nuit est conservé dans `docs/A_GARDER_POUR_LE_PROCHAIN_CHANTIER_2026-09-30.md` (à ne jamais vider) ; (b) la perte de vue du texte du prompt dans Comparer mes pistes n'est pas un problème ; (c) **écran « Collecter » de Comparer mes pistes, exception pour ce module** : un bouton direct **« Aller sur Perplexity (recommandé pour cette recherche) »** bien visible au-dessus de la liste habituelle des assistants (qui reste, pour ChatGPT ou celui que la personne utilise d'habitude) ; même parcours (texte copié, onglet ouvert), mis dans la brique commune du lot N2 comme option `assistantRecommande: 'perplexity'`, affichée seulement quand le prompt demande une recherche web (Collecter).

(Verdict d'origine ci-dessous, conservé pour mémoire.)

**NON APTE AU MODE NUIT AUJOURD'HUI**, pour une seule raison : les décisions **D1 et D2** attendent ta réponse (D3 et D4 sont des « on ne fait pas », D5 est tranchée par toi, D6 attend ton texte mais ne bloque rien).
**Dès que tu réponds « OK à tout » (ou que tu modifies un numéro) : APTE AU MODE NUIT** pour N1 à N6, dans cet ordre.

Préférence de Denis respectée : pas de mode nuit partiel. Tout ce qui n'est pas tranché (D4, D5, D6) est sorti du périmètre de la nuit, pas repoussé à moitié.

---

## 5. Ce que SEUL Denis peut faire (feuille de tests courte, dans l'ordre d'importance)

Je ne peux pas remplacer ces essais : ils demandent un vrai assistant, ta vraie souris ou ton œil.
1. **Essai réel du prompt du CV** : dans « Reformuler », avec le CV de Nicolas et l'objectif stage ou offre, copier le prompt chez l'assistant, coller la réponse. Vérifier que le titre choisi (« Technicien supérieur de maintenance en informatique ») reste le premier proposé, sans « junior ». Si oui : point clos.
2. **Reformuler avec le CV de Josianne** (« Gestion du temps », SST) : cartes de situation, Formation, questions sur les années des certifications.
3. **Disquette** : importer ton fichier, « Aller directement à l'aperçu ».
4. **Grand aperçu avec la vraie souris** : poignées ⠿, « Mon ordre », position des dates.
5. **« Comparer mes pistes » avec un vrai assistant** : copie dans le presse-papiers et ouverture réelle de Perplexity (jamais testées).
6. **Word du CV de Nicolas à l'œil** (en-tête libre maintenant correct).

---

## 6. Texte à valider pour D2 (à retoucher à ta guise)

- **Alternance** : « l'engagement dans la durée et l'assiduité, la capacité à faire le lien entre la formation et l'entreprise, la motivation pour apprendre un métier en situation de travail. »
- **Formation** : « ce qui prépare à la formation visée (expériences, diplômes, prérequis) et la motivation et le projet quand le CV les montre. »

---

## 7. Hors périmètre, et pourquoi (pour ne pas s'en inquiéter)

| Sujet | Statut | Quand |
|---|---|---|
| Rubrique « Certifications » à part | Reporté (D4) | Avec le chantier de remodelage des A5 |
| Mini CV A5 (remodelage) | Ton chantier séparé, pas prioritaire | Quand tu le décides |
| Les ~15 autres écrans de l'application à l'ancien collage (Reformuler, Wizard CV, Lettre, Entretien, Cohérence, Découverte, Regard...) | Hors périmètre (les 4 écrans de Comparer mes pistes sont, eux, au lot N2) | Sur ta demande, écran par écran |
| Module « Où et sous quel nom chercher » | En pause, attend tes informations (autre PC) | À ta reprise |
| Sortie du dépôt hors d'OneDrive (erreurs git `unable to map index file`) | Décision à toi, sans urgence (réessayer suffit) | Quand tu veux |
| « Escalier » à reproduire, Frise / Rectangles / Photo | Attendent un exemple précis de ta part | Quand tu as un exemple |
| Petits reports C3 (savoirs dans Reformuler), C12 (bouton « Enregistrer en fichier » de la fiche), C9 (autres blocs explicatifs) | Seulement sur ton signal | À ta demande |
