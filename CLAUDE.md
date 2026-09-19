# APP - fichier maître du projet

> Ce fichier est chargé automatiquement à chaque session dans ce dépôt. C'est le point d'entrée unique.
> Il ne contient aucun contenu dupliqué : c'est un **sommaire + une procédure**. Il pointe vers les fichiers de référence, qui restent la source de vérité.
>
> **Rechargement manuel en cours de session** : `/app` (ou `/app <ta demande>`) relit ce fichier + `TRAVAILLER_AVEC_DENIS.md` + le chantier actif, puis fait le point. Défini dans `.claude/commands/app.md`.

---

## Le projet

**APP** - « Accompagnement de Parcours Professionnel » (double lecture assumée : « Analyse de Pratiques Professionnelles »). Application web statique, pour un public en fragilité numérique et à confiance en soi fragile. Concepteur et unique porteur : Denis (conseiller en insertion professionnelle, pas programmeur ni ingénieur).

« ERIP » est le nom d'un **dispositif** (le stage de Denis), jamais le nom de l'application. Ne rien renommer sans confirmation explicite de Denis (dépendance partenaire : Inkéo C&C).

---

## AVANT TOUT NOUVEAU CHANTIER / BLOC / FONCTION - lire dans l'ordre

1. **`docs/LECONS_A_NE_PAS_REPRODUIRE.md`** - les erreurs à ne jamais refaire (mode sombre, points de connexion, copie figée trop tôt, français impeccable...). La **section 10** rassemble les Règles transverses.
2. **`docs/TACHES_VALIDEES.md`** - système `[CLOS]` / `[À FAIRE]`. Chercher toute tâche qui touche le même module / bloc / endroit : la traiter dans le même passage, ou au minimum en tenir compte.
3. **`docs/IDEES_A_RECLASSER.md`** - idées, phrases, mécanismes à piocher qui enrichiraient le chantier.
4. **`docs/BRIQUES_COMMUNES.md`** - registre des composants transverses (source unique + qui l'utilise + dette). Avant de créer un écran / un champ / un composant : vérifier ici, **réutiliser** (le paramétrer au besoin), jamais recopier.
5. S'il existe un **`docs/CHANTIER_<sujet>.md`** pour ce chantier : le lire aussi.

Puis : **`docs/TRAVAILLER_AVEC_DENIS.md`** (modes de collaboration, longueur des réponses, comment présenter des choix).

---

## Où vit quoi

| Sujet | Fichier |
|---|---|
| État des chantiers (en cours / en attente) | `docs/ETAT_DES_CHANTIERS_2026-08-24.md` - **le seul à jour**. `docs/CHANTIERS_EN_ATTENTE.md` est **périmé**, ne pas s'y fier. |
| Erreurs et pièges à ne pas reproduire | `docs/LECONS_A_NE_PAS_REPRODUIRE.md` |
| Registre des bugs rencontrés | `docs/ERREURS_ET_BUGS.md` |
| Tâches validées / à faire | `docs/TACHES_VALIDEES.md` |
| Idées en attente de classement | `docs/IDEES_A_RECLASSER.md` |
| Composants transverses (source unique + qui l'utilise + dette) | `docs/BRIQUES_COMMUNES.md` |
| Mode de travail avec Denis | `docs/TRAVAILLER_AVEC_DENIS.md` |
| Un chantier précis | `docs/CHANTIER_<sujet>.md` |

### Chantier EN COURS : stabilisation générale de l'application (démarré 2026-09-12)
Audit + correction des 6 cartes de l'accueil, une à la fois, en lecture seule d'abord puis correction. Les 6 rapports d'audit (`docs/AUDIT_STABILISATION_*.md`) couvrent l'intégralité de l'accueil - un seul point bloquant trouvé et corrigé (CV/lettre perdus dans « Préparer un entretien »), dette B.12 (couleurs de message) résorbée en passage dédié. **Reste à appliquer, module par module, au rythme du test manuel de Denis** : `docs/CHANTIER_STABILISATION_RESTES_A_APPLIQUER.md` - pense-bête organisé par carte/module, à cocher au fur et à mesure. Ne pas rouvrir un audit déjà fait sans fait nouveau ; consulter ce fichier avant de déclarer un module « fini » s'il a été audité dans ce chantier.

### Chantier clos le 2026-09-06 : adresses de « Comprendre le cadre » (paquet B + paquet C)
- Paquet B (sources documentaires) : 89 datées, 4 mortes supprimées. Clos.
- Paquet C (structures « à qui s'adresser ») : Groupe A + B2 vérifiés au navigateur par Denis, Groupe B1 (~60) vérifié par contrôle automatique. **Plus aucune ligne de structure sans date** dans `modules/comprendre-le-cadre/liens-verifies.txt`. Suivi : `docs/PAQUET_C_A_DATER.md`, `docs/PAQUET_B_BLOQUE_A_DATER.md`. Suite = entretien courant (contrôle des liens, cadence `docs/VEILLE_PROMPTS.md`).

### Chantier clos le 2026-09-06 : module « Comprendre les chiffres » (2e sous-carte de « Se tenir informé »)
- `modules/comprendre-les-chiffres/` (index.js + css + `ARCHITECTURE_TECHNIQUE.md`). Les 10 blocs codés, `npm test` 713 verts, test navigateur clair + sombre à chaque bloc.
- Maquette : `docs/MAQUETTE_COMPRENDRE_LES_CHIFFRES_2026-09-06.html`. Cahier : `docs/CHANTIER_COMPRENDRE_LES_CHIFFRES.md`. Prompts de veille : `docs/VEILLE_PROMPTS.md` § 5ter.
- **Reste hors code** : contenu **relu et validé par Denis le 2026-09-06**. Les lignes `[à vérifier]` qui subsistent dans les `contenu/*.md` sont des **données pas encore récupérées** (bloquées derrière un PDF ou une base), à compléter au fil des passages de veille - ce n'est plus un blocage de mise en production. Corrections via `outils/veille.html`. Vidéo + test terrain.

### Chantier clos le 2026-09-08 : module « Les mots de votre CV (ATS) » (3e sous-carte de « Outils d'analyse »)
- Module **indépendant** : `modules/ats/` (`index.js` page routée famille 2 + `detectionTexteCache.js` + `resultatParser.js`, logique pure testée Node), prompt dédié `prompts/ats.md` (mis au point sur 6 tests réels, passe ChatGPT + Gemini), fixtures `docs/tests-manuels-ats/`. Route `ats` + `pageIntroAts` + tuile d'accueil. `npm test` 780 verts, checkLexique propre, vérifié navigateur bout en bout (offre + métier, reprise/gel, bouton Retour sans boucle, disquette, clair + sombre, mobile).
- Jamais un score : comparaison de **vocabulaire** CV / offre ou fiche métier. « (ATS) » visible à côté du nom sur la présentation seulement ; message partout : ce module n'est pas un logiciel de tri, il en imite la vérification. Maquette (cible visuelle) : `docs/MAQUETTE_ATS_PARCOURS_2026-09-03.html`. Cahier : `docs/CHANTIER_ATS.md`. Plan : `docs/PLAN_ATS_2026-09-03.md`.
- Relecture du prompt `prompts/ats.md` faite le 2026-09-08 (3 retouches : `clarificationProjet` en questions pour le conseiller, plafond global ~12 termes, ligne anti-injection).
- **Reste hors code** (non bloquant) : aide contextuelle détaillée écran par écran (`AIDE_PAGES.ats` existe mais reste générique, 3 entrées seulement - même niveau que Regard recruteur/Comparer mes pistes, confirmé par l'audit du 2026-09-13 : optionnel), vidéo de démonstration, test terrain.

### Chantier TERMINÉ le 2026-09-08 : module « Un regard sur mon CV » (renommé le 2026-09-17, ex « Regard recruteur » ; chantier 5 de la feuille de route, le plus ambitieux)
- **Uniquement du conseil : ne modifie jamais le CV** (décision Denis, clôture option A). Une lecture d'un CV comme un recruteur peut la voir : 6 axes fixes (4 sur le texte seul), « Décoder les questions d'un recruteur » (5 questions générales fixes + questions liées au CV), aucun score, chaque doute = une question.
- `modules/regard-recruteur/` : `rapportResponseParser.js` + `promptBuilder.js` (autonomes, testés Node), `index.js` (page routée famille 2, 8 écrans), `regard-recruteur.css` (teinte sarcelle, `[data-theme="sombre"]`), `ARCHITECTURE_TECHNIQUE.md`. Prompt `prompts/regard-recruteur.md` (relu le 2026-09-08, 5 retouches croisées parser/schéma). Route `regard-recruteur` + `pageIntroRegardRecruteur` activée + trouvable dans la recherche d'accueil. Commits `13c2de1..a7107c8`, `npm test` 780 verts, vérifié navigateur clair + sombre bout en bout : 8 écrans, **masquage image = outil de rectangles dans le navigateur** (`htmlVerificationDocument({mode:'image'})`, décision 4 tranchée par Denis : canvas, dessiner/enlever, une image à la fois, « Enregistrer » télécharge la copie masquée ; règle absolue 5 du prompt renforcée), aller-retour disquette, bouton Retour un cran à la fois sans boucle présentation ⟷ module.
- Maquette (cible visuelle, figée) : `docs/MAQUETTE_REGARD_RECRUTEUR_PARCOURS_2026-09-03.html`. Schéma de sortie figé : `docs/CHANTIER_REGARD_RECRUTEUR_SCHEMA_SORTIE_2026-09-03.md`. Cahier : `docs/CHANTIER_REGARD_RECRUTEUR.md`. Protocole de test du prompt : `docs/PROTOCOLE_TEST_PROMPT_REGARD_RECRUTEUR_2026-09-03.md`.
- **Hors code, comme tout module** (non bloquant) : relecture finale du prompt par Denis + protocole de test tour 1 sur de vrais CV ; parcours cliqué par Denis ; vidéo ; test terrain ; `AIDE_PAGES` par écran (optionnel). **Évolutions possibles** (pas des manques, voir `ARCHITECTURE_TECHNIQUE.md` + `TACHES_VALIDEES.md` ch.5) : vignette des images, fusion des deux zones « Garder comme Repère », export Word natif, renvois entre modules. **Chantier séparé, plus tard** : extraction du socle commun détachable (« Niveau 2 »).

### Chantier clos le 2026-09-18 : 2e passage IA obligatoire pour « Découvrir mes compétences » (rédaction du CV)
- Le module écrivait un CV « brut » (jamais d'accroche ni de missions reformulées, `dossier.ia.cv` toujours vide). Il reçoit désormais un vrai 2e passage assistant, placé après une nouvelle étape « Vos expériences », qui réutilise tel quel le pipeline déjà écrit pour « Créer un nouveau CV » (`contenuRectangleChoixIA`/`wireRectangleChoixIA`/`contenuAccordeonImportIA`/`wireImportIA`/`ouvrirRelectureIACV`, `js/app.js`) avec un nouveau prompt dédié `prompts/decouverte-redaction.md` (repris de l'essentiel de `prompts/cv.md`, deux ajouts : correction silencieuse des fautes, récit traité comme matière factuelle principale).
- Barre de navigation du module : repère « Mon CV » renommé **« Rédiger mon CV »** (couvre les étapes 9 à 12) ; nouveau repère final **« Mon CV »** (mise en page/export, déjà générique).
- Plan détaillé : `docs/CHANTIER_DECOUVERTE_2E_PASSAGE_REDACTION.md`. Détail des sous-étapes et du bug trouvé en testant : `docs/TACHES_VALIDEES.md`. `npm test` 931 verts, vérifié navigateur clair + sombre bout en bout, non-régression confirmée sur « CV prêt »/« Mettre à jour mon CV ».
- **Reste hors code** (non bloquant) : relecture du prompt sur de vrais essais ; la page d'introduction du module mentionne encore « le seul échange » avec l'assistant (devient deux échanges, texte à corriger au prochain passage).

Chantiers clos récents : « Comprendre le cadre » + « Affiner ma recherche » (2026-09-06), « Comprendre les chiffres » (2026-09-06), « Les mots de votre CV (ATS) » (2026-09-08), « Un regard sur mon CV » (2026-09-08, ex « Regard recruteur »), « 2e passage IA de Découvrir mes compétences » (2026-09-18).

### Chantier EN COURS : mise en page du CV — interligne par rubrique, frise chronologique, mini-grille (ouvert 2026-09-18)
Cadrage fait (Mode A), aucun code écrit à l'ouverture. Origine : analyse de cvdesignr.com (catalogue de modèles + un CV réel apporté par Denis) pour enrichir la création/édition de CV. Plan détaillé, décisions figées et ordre des blocs (0 à 5, PDF d'abord puis Word, maquette de galerie en dernier) : `docs/CHANTIER_MISE_EN_PAGE_CV_2026-09-18.md` — **à lire avant tout code sur ce sujet**, y compris ce qui a été explicitement écarté (photo en colonne latérale, score visible, barres de niveau, remplacement du tirage au sort) pour ne pas le reproposer.

### Chantier EN ATTENTE : finir les stratégies de CV du Composeur (« Par compétences »/« Mixte »), puis les piloter par l'objectif de la personne (ouvert 2026-09-18)
Priorité au chantier ci-dessus, celui-ci n'a pas démarré. Découverte en comparant APP à Novoresume : `modules/cv-composeur/composeurStrategies.js` définit 3 stratégies (chronologique/mixte/parCompetences) dont les variantes de rendu (`variantesParRubrique`) sont déclarées mais **jamais lues nulle part ailleurs dans le code** (vérifié) — chantier interrompu à l'étape 2/5, doc de conception d'origine introuvable dans le dépôt. Découverte liée : l'écran « Votre objectif » propose déjà `stage`/`alternance`/`pmsmp`, jamais exploités par le moteur de choix de stratégie (`calculerScoresStrategies()` ne lit que la reconversion). Plan détaillé (constat vérifié, 2 couches à ne pas confondre, ordre des phases) : `docs/CHANTIER_COMPOSEUR_STRATEGIES_CV_2026-09-18.md` — à lire avant tout code sur ce sujet.

---

## Modes de collaboration (détail : `docs/TRAVAILLER_AVEC_DENIS.md`)

Annoncer le mode recommandé **au début de chaque tâche**.

- **Mode A** - décision d'architecture / d'UX / de philosophie produit. Réponse `[détaillé]`, un bloc à la fois, Denis valide chaque étape avant la suivante. **Si Denis est fatigué : reporter le chantier entier, ne pas le commencer à moitié**, ne pas le découper en micro-tâches pour « avancer quand même ».
- **Mode B** - exécution cadrée. Le quoi et le pourquoi sont déjà tranchés. Claude avance seul sur le comment, montre le résultat par blocs.
- **Mode C** - tâche mécanique / correction ciblée. Claude fait et rend compte en une ligne.

À chaque décision que Denis prend : répondre avec sa recommandation, ses critiques, et les zones d'ombre qui pourraient échapper à Denis. Jamais un simple « d'accord ».

---

## Non-négociables - à vérifier à CHAQUE bloc, au même titre que le mode sombre

- **Français impeccable** : accents partout, orthographe correcte, sur **tout** texte produit ou édité (pas seulement le chat : maquettes, code, templates d'export). Jamais d'anglais dans aucune communication.
- **Jamais de tiret cadratin ni de demi-cadratin**, nulle part.
- **Jamais le mot « IA » visible** dans l'application, jamais d'icône tête de robot. Dire « l'assistant en ligne ».
- **Jamais d'icône avec un visage / des traits de visage / une expression** (yeux, émoji de visage, cerveau...). Difficilement compris par le public cible : prendre un objet ou un symbole concret. Exception : une silhouette neutre sans traits (👤) reste acceptable. (`feedback_pas_d_icones_avec_tete`)
- **Mode sombre** : toute variable de couleur a sa valeur `[data-theme="sombre"]`.
- **Une seule source de vérité** : jamais de duplication d'un écran / champ / composant. Grep, réutiliser, paramétrer. Toute dette de duplication est listée dans `BRIQUES_COMMUNES.md` et résorbée avec maquette + plan, jamais à chaud.
- **Brancher la recherche au fur et à mesure** : chaque nouveau module / bloc branche sa propre recherche (barre d'accueil + Lexique) dès sa création.
- **Refonte d'une carte / d'un module qui importe un CV** : au passage, remplacer sa fenêtre d'import CV / de contexte de candidature par le **composant partagé** construit pour le Bilan le 2026-08-30 (dette B.1 de `BRIQUES_COMMUNES.md`). Résorption **chantier par chantier**, jamais en une fois. Décision Denis 2026-08-30.
- **Choix présenté à Denis** = une recommandation (option optimale en premier, « (Recommandé) », pourquoi + apport + risque) **ET** bénéfices + risques de **chaque** option.
- **Un défaut trouvé pendant une tâche A/B se corrige dans le même passage, pas juste signalé.** Si en faisant A et B un dysfonctionnement C (ou D, E...) apparaît, le traiter tout de suite - au mieux, dans la mesure du raisonnable - plutôt que de finir A/B et de laisser C en note pour plus tard. Seule exception : un point qui demande un vrai choix de Denis (ambigu, plusieurs approches possibles, risque réel) - dans ce cas, présenter les options explicitement (voir la règle du dessus) et attendre sa décision avant d'agir, mais ne jamais se contenter de mentionner le défaut sans avoir au moins tenté de le corriger ou d'identifier précisément le choix à trancher. Décision Denis 2026-09-12.
- **« Zéro régression »** : quand une **maquette validée existe** = zéro régression **fonctionnelle** uniquement (fonctions / boutons / prompts déjà actés) ; la maquette est la cible visuelle à implémenter fidèlement, jamais un repli sur l'ancien visuel. **Sans maquette et contexte ambigu** : demander à Denis de quel type de régression il parle (visuelle / conceptuelle / fonctionnelle / l'ensemble).
- **Maquette + questions avant code** dès qu'il y a un doute d'interface. Tracer le parcours réel complet (écran d'avant, écran d'après, fonctions, boutons) avant toute maquette. Corrections regroupées par bloc, jamais à chaud.
- **Public cible** : personnes peu à l'aise avec l'informatique, confiance en soi fragile. Ton simple et rassurant partout. Jamais poser de diagnostic sur la personne.

---

## Commandes

- **Tests** : `npm test` (= `node --test "tests/*.test.js"`). Référence au 2026-08-30 : 603 verts.
- **Lexique modifié** : `node scripts/checkLexique.js` en plus de `npm test` (0 erreur ET 0 avertissement attendus).
- **Serveur dev** : via l'outil de preview, configuration `.claude/launch.json`, nom `site-v2-python-server`, port 8123 (`serveur_dev.py`, `Cache-Control: no-cache`). Ne jamais lancer un serveur avec Bash. Si une correction « ne marche jamais », suspecter le cache navigateur.
- **`js/app.js` et `modules/*/ui.js` ne sont pas chargés par les tests Node** : test navigateur **obligatoire** pour tout changement qui les touche.
- Un commit par sous-étape. `npm test` + navigateur avant la suivante. Jamais un état à moitié refondu.

---

## Git (détail : `docs/TRAVAILLER_AVEC_DENIS.md`)

- Denis travaille seul et veut le travail terminé directement sur `master`.
- Une tâche **terminée ET vérifiée par un vrai test** se commit **directement sur `master`**, sans rebrancher, sans redemander l'autorisation.
- Créer une branche ou demander avant de fusionner **seulement si** : gros ou risqué, pas encore vérifié, travail en cours que Denis veut relire, ou Denis le demande.
- **Jamais `push` ni fusion vers un dépôt distant sans que Denis le demande.**
- Messages de commit en français, sans tiret cadratin.

---

## Environnement

- Windows 11, PowerShell en shell principal (Bash aussi disponible - syntaxes distinctes).
- Node.js et Python installés (chemin complet si le PATH n'est pas encore rechargé : voir la mémoire `project_environnement_node_python`).
- **Deux comptes Claude** sont utilisés sur ce projet : la mémoire d'un compte ne voit pas le travail fait sur l'autre. Toujours chercher un document d'état plus récent (dépôt) avant de se fier à la mémoire.
- L'application est déjà intégrée chez le partenaire Inkéo C&C / PCGI 87 (Haute-Vienne).
