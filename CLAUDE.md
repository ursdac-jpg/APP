# APP - protocole de travail (fichier maître du projet)

> Ce fichier est chargé automatiquement à chaque session dans ce dépôt. C'est le point d'entrée unique.
> Il est **stable et protocolaire** : règles de travail, structure du projet, pointeurs vers les documents de référence. Rien d'autre.
> **Interdiction stricte** d'y inscrire un compte-rendu de chantier (en cours, clos, historique) ou un état d'avancement - cet état vit exclusivement dans `docs/ETAT_DES_CHANTIERS.md`. Ce fichier n'est modifié qu'à la demande explicite de Denis, jamais au fil d'un chantier.
>
> **Rechargement manuel en cours de session** : `/app` (ou `/app <ta demande>`) relit ce fichier + `TRAVAILLER_AVEC_DENIS.md` + `docs/ETAT_DES_CHANTIERS.md`, puis fait le point. Défini dans `.claude/commands/app.md`.

---

## Le projet

**APP** - « Accompagnement de Parcours Professionnel » (double lecture assumée : « Analyse de Pratiques Professionnelles »). Application web statique, pour un public en fragilité numérique et à confiance en soi fragile. Concepteur et unique porteur : Denis (conseiller en insertion professionnelle, pas programmeur ni ingénieur).

« ERIP » est le nom d'un **dispositif** (le stage de Denis), jamais le nom de l'application. Ne rien renommer sans confirmation explicite de Denis (dépendance partenaire : Inkéo C&C).

---

## Où vit quoi

| Sujet | Fichier |
|---|---|
| **État des chantiers** (en cours / en attente / clos) - la seule photo à jour | `docs/ETAT_DES_CHANTIERS.md` |
| Erreurs et pièges à ne pas reproduire | `docs/LECONS_A_NE_PAS_REPRODUIRE.md` |
| Registre des bugs rencontrés | `docs/ERREURS_ET_BUGS.md` |
| Tâches validées / à faire | `docs/TACHES_VALIDEES.md` |
| Idées en attente de classement | `docs/IDEES_A_RECLASSER.md` |
| Composants transverses (source unique + qui l'utilise + dette) | `docs/BRIQUES_COMMUNES.md` |
| Mode de travail avec Denis | `docs/TRAVAILLER_AVEC_DENIS.md` |
| Langage visuel commun (boutons, blocs, icônes) | `docs/LANGAGE_VISUEL_COMMUN.md` |
| Un chantier précis | `docs/CHANTIER_<sujet>.md` |

`docs/CHANTIERS_EN_ATTENTE.md` est périmé, ne pas s'y fier.

---

## AVANT TOUT NOUVEAU CHANTIER / BLOC / FONCTION - lire et faire dans l'ordre

1 à 4. **Les 4 fichiers de base, en lecture ciblée** (jamais en entier : environ 190 000 tokens à eux quatre), méthode dans `docs/TRAVAILLER_AVEC_DENIS.md` (à lire aussi pour la longueur des réponses et comment présenter des choix) : `LECONS_A_NE_PAS_REPRODUIRE.md`, `TACHES_VALIDEES.md`, `IDEES_A_RECLASSER.md`, `BRIQUES_COMMUNES.md`.
5. **`docs/ETAT_DES_CHANTIERS.md`** - vérifier l'état réel du chantier concerné avant de proposer quoi que ce soit.
6. S'il existe un **`docs/CHANTIER_<sujet>.md`** pour ce chantier : le lire aussi.
7. **Audit du code réel** (voir Non-négociables) : jamais de plan tant que le code concerné n'a pas été ouvert et lu.

---

## Modes de collaboration

Annoncer le mode recommandé (A / B / C / D / Nuit) **et le niveau d'effort recommandé** **au début de chaque tâche** - définitions, critères de choix, niveaux d'effort et comment réagir à chaque décision de Denis : `docs/TRAVAILLER_AVEC_DENIS.md`.

**Chaque tâche engagée porte une étiquette d'effort** `[effort : bas]`, `[effort : moyen]` ou `[effort : haut]`, et les tâches ouvertes sont présentées et regroupées par niveau (une séance = un niveau) tant que ça n'entre pas en conflit avec une dépendance ou un même endroit du code. Règles et critères : `docs/TRAVAILLER_AVEC_DENIS.md`, section « Effort étiqueté sur chaque tâche ». Décision Denis 2026-10-01.

**Répartition des rôles** : Denis gère la vision, l'usage, la philosophie et les arbitrages. Claude gère la faisabilité technique, la rigueur d'audit et la stabilité du code.

---

## Non-négociables - à vérifier à CHAQUE bloc, au même titre que le mode sombre

- **Français impeccable** : accents partout, orthographe correcte, sur **tout** texte produit ou édité (pas seulement le chat : maquettes, code, templates d'export). Jamais d'anglais dans aucune communication.
- **Jamais de tiret cadratin ni de demi-cadratin**, nulle part.
- **Jamais le mot « IA » visible** dans l'application, jamais d'icône tête de robot. Dire « l'assistant en ligne ».
- **Jamais d'icône avec un visage / des traits de visage / une expression** (yeux, émoji de visage, cerveau...). Difficilement compris par le public cible : prendre un objet ou un symbole concret. Exception : une silhouette neutre sans traits (👤) reste acceptable. (`feedback_pas_d_icones_avec_tete`)
- **Mode sombre** : toute variable de couleur a sa valeur `[data-theme="sombre"]`.
- **Une seule source de vérité** : jamais de duplication d'un écran / champ / composant. Grep, réutiliser, paramétrer. Toute dette de duplication est listée dans `BRIQUES_COMMUNES.md` et résorbée avec maquette + plan, jamais à chaud. Avant de toucher une fonction ou une signature partagée : **grep sur tout le dépôt**, jamais un seul fichier ou un seul module - un incident passé a cassé une quinzaine d'écrans hors du module concerné faute de ça.
- **Vérifier la date système réelle** avant d'écrire une date (commit, doc, mémoire) - jamais la déduire du contexte de la conversation.
- **Brancher la recherche au fur et à mesure** : chaque nouveau module / bloc branche sa propre recherche (barre d'accueil + Lexique) dès sa création.
- **Refonte d'une carte / d'un module qui importe un CV** : au passage, remplacer sa fenêtre d'import CV / de contexte de candidature par le **composant partagé** construit pour le Bilan le 2026-08-30 (dette B.1 de `BRIQUES_COMMUNES.md`). Résorption **chantier par chantier**, jamais en une fois. Décision Denis 2026-08-30.
- **Audit du code réel avant tout plan** : avant un plan, un chiffrage ou un découpage en phases, ouvrir et lire le code réellement concerné - jamais de supposition. Dire explicitement, avant de demander le feu vert : ce qui est simple (reprise de l'existant), ce qui est risqué (algorithme modifié, restructuration lourde), et tout point bloquant ou imprévu.
- **Jamais de mode tunnel** : si une difficulté technique majeure ou un imprévu d'architecture apparaît en cours de route, s'arrêter immédiatement et remonter à Denis avant de continuer.
- **Alimenter les leçons** : dès qu'une erreur de Claude, un malentendu entre Denis et Claude ou un dysfonctionnement réel est constaté (par Claude, par un test ou signalé par Denis), **et chaque fois que Denis le demande** (« note ça »), l'inscrire dans le même passage dans `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (ou `docs/ERREURS_ET_BUGS.md` pour un bug de l'application), puis annoncer en une ligne ce qui a été ajouté. `grep` d'abord pour fusionner avec une leçon existante, entrée courte (symptôme, cause, règle). Un rapport d'écart (règle suivante) déclenche toujours cette inscription.
- **Rapport d'écart et marche arrière** : dès que Denis signale une insatisfaction sur un travail livré, réflexe immédiat avant de continuer à corriger quoi que ce soit - écart constaté vs prévu, coût de correction (haut / moyen / faible), coût de marche arrière (haut / moyen / faible), recommandation motivée. Détail : `docs/TRAVAILLER_AVEC_DENIS.md`.
- **Franchise obligatoire sur la faisabilité** : Denis n'est pas programmeur, il ne peut pas juger seul si quelque chose est faisable. Si un concept, une maquette ou une demande dépasse ce qui peut être réellement codé ou maintenu, le dire tout de suite et clairement - jamais laisser croire que « on verra en codant ». Tout risque technique se traduit en conséquence concrète et observable, jamais en jargon pur. Un renoncement dit clairement vaut mieux qu'un faux espoir. Méthode complète (entonnoir en 4 étapes, verdicts GO/NO GO) : `docs/TRAVAILLER_AVEC_DENIS.md`.
- **Choix présenté à Denis** = une recommandation (option optimale en premier, « (Recommandé) », pourquoi + apport + risque) **ET** bénéfices + risques de **chaque** option.
- **Un défaut trouvé pendant une tâche A/B se corrige dans le même passage, pas juste signalé.** Si en faisant A et B un dysfonctionnement C (ou D, E...) apparaît, le traiter tout de suite - au mieux, dans la mesure du raisonnable - plutôt que de finir A/B et de laisser C en note pour plus tard. Seule exception : un point qui demande un vrai choix de Denis (ambigu, plusieurs approches possibles, risque réel) - dans ce cas, présenter les options explicitement (voir la règle du dessus) et attendre sa décision avant d'agir, mais ne jamais se contenter de mentionner le défaut sans avoir au moins tenté de le corriger ou d'identifier précisément le choix à trancher. Décision Denis 2026-09-12.
- **« Zéro régression »** : quand une **maquette validée existe** = zéro régression **fonctionnelle** uniquement (fonctions / boutons / prompts déjà actés) ; la maquette est la cible visuelle à implémenter fidèlement, jamais un repli sur l'ancien visuel. **Sans maquette et contexte ambigu** : demander à Denis de quel type de régression il parle (visuelle / conceptuelle / fonctionnelle / l'ensemble).
- **Maquette + questions avant code** dès qu'il y a un doute d'interface. Tracer le parcours réel complet (écran d'avant, écran d'après, fonctions, boutons) avant toute maquette. Corrections regroupées par bloc, jamais à chaud.
- **Public cible** : personnes peu à l'aise avec l'informatique, confiance en soi fragile. Ton simple et rassurant partout. Jamais poser de diagnostic sur la personne.

---

## Commandes

- **Tests** : `npm test` (= `node --test "tests/*.test.js"`), doit être entièrement vert avant tout commit.
- **Lexique modifié** : `node scripts/checkLexique.js` en plus de `npm test` (0 erreur ET 0 avertissement attendus).
- **Serveur dev** : via l'outil de preview, configuration `.claude/launch.json`, nom `site-v2-python-server`, port 8123 (`serveur_dev.py`, `Cache-Control: no-cache`). Ne jamais lancer un serveur avec Bash. Si une correction « ne marche jamais », suspecter le cache navigateur.
- **`js/app.js` et `modules/*/ui.js` ne sont pas chargés par les tests Node** : test navigateur **obligatoire** pour tout changement qui les touche.
- Un commit par sous-étape. `npm test` + navigateur avant la suivante. Jamais un état à moitié refondu.

---

## Git

Travail terminé et vérifié par un vrai test -> commit direct sur `master`, sans redemander l'autorisation. **Jamais de `push` ni de fusion vers un dépôt distant sans que Denis le demande.** Détail (quand créer une branche, format des messages) : `docs/TRAVAILLER_AVEC_DENIS.md`.

---

## Environnement

- Windows 11, PowerShell en shell principal (Bash aussi disponible - syntaxes distinctes).
- Node.js et Python installés (chemin complet si le PATH n'est pas encore rechargé : voir la mémoire `project_environnement_node_python`).
- **Deux comptes Claude** sont utilisés sur ce projet : la mémoire d'un compte ne voit pas le travail fait sur l'autre. Le protocole de ce fichier et de `docs/TRAVAILLER_AVEC_DENIS.md` doit donc suffire à lui seul, sans mémoire, pour que les deux comptes travaillent de la même façon. Toujours chercher un document d'état plus récent (dépôt) avant de se fier à la mémoire. **Passation** : à la fin d'une session sur un chantier non terminé, mettre à jour son état (`CHANTIER_<sujet>.md` ou `ETAT_DES_CHANTIERS.md` Partie 0) avant de clore, pour que l'autre compte reprenne sans avoir à deviner.
- L'application est déjà intégrée chez le partenaire Inkéo C&C / PCGI 87 (Haute-Vienne).
