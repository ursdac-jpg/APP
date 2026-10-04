# Passation du 2026-09-30 (fin de journée) : ce qui est fait, ce qui reste

Document de reprise pour l'autre compte ou une autre session. **État du dépôt** : branche `master`, dernier commit `69c8dfc5`, arbre propre (rien en attente de commit), `npm test` **1166 verts**. La branche `travaux-2026-09-29-a-verifier` est **déjà entièrement contenue dans `master`** (0 commit d'avance) : rien à fusionner. Aucun `push` fait, jamais sans demande de Denis.

**Détail de chaque correction** (cause trouvée, fichiers, vérifications) : `docs/CHANTIER_CORRECTIONS_PARCOURS_2026-09-30.md` (C1 à C20). Plan et bilan de « Comparer mes pistes » : `docs/CHANTIER_COMPARER_PISTES_2026-09-30.md`. Registre des bugs : `docs/ERREURS_ET_BUGS.md`. Leçons : `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (règle 17).

## Règles de travail de Denis apprises aujourd'hui (à respecter)

1. **Denis donne des corrections à noter** : on les **note seulement** (fichier de suivi), sans lire le code ni ouvrir le navigateur, jusqu'à ce qu'il dise d'aller voir, puis « feu vert » pour modifier (mémoire `feedback_noter_sans_regarder_avant_feu_vert`).
2. **Prévenir avant de toucher un fichier ou le navigateur** s'il a un test en cours : un fichier modifié recharge sa page et lui fait perdre son travail (leçon règle 17).
3. **Zéro régression, règle n°1 sur le CV** : tout changement du rendu du CV se prouve avec le banc `scripts/word/banc_b7.js` (état avant / après sur les 24 modèles, Word et XML identiques, PDF identique quand aucun réglage n'est touché). Procédure : lancer le banc, `git stash`, recharger la page, relancer, comparer via `localStorage`, `git stash pop`, **recharger** la page.
4. **Un seul bouton plutôt que deux** quand deux gestes sont identiques (décision sur « Déplacer expériences, formations et missions »).
5. **Mode d'effort** : les travaux de conception ou touchant le CV en `high`, les corrections simples en `medium` ou `low`. Denis règle l'effort lui-même (`/effort`) et l'application peut ne pas le prendre en compte.
6. Ne jamais afficher un prompt à la personne : le texte est **copié automatiquement** par le composant commun de choix d'assistant.
7. Pièges techniques rencontrés : les barres obliques inverses dans les scripts passés par le shell sont mangées (écrire les scripts avec l'outil de fichier) ; ne jamais lancer une commande qui attend une saisie (`cat` sans fichier) ; ne pas laisser une fenêtre d'impression ouverte pendant un test dans le navigateur intégré.

## FAIT aujourd'hui (tout commité)

| Réf. | Sujet | Statut |
|---|---|---|
| C1 | Reformuler mon CV : fausse alerte « Gestion du temps » (faute de lecture d'image corrigée par l'assistant) | Fait |
| C2 | « Vos informations » : les cinq bandeaux ouverts à l'arrivée | Fait |
| C3 | « Vos savoirs » vide : savoirs du métier visé lus même sans questionnaire + `metierParNom` retrouve la forme féminine | Fait (limite : le prompt de Reformuler ne demande pas de savoirs) |
| C4 | Suggestions de mise en page : plus de retour forcé en chronologique | Fait |
| C5 | Menus « Type de structure » à la taille des boutons | Fait |
| C6 (1, 2) | CV du Bilan : consignes « [À compléter...] » retirées ; proposition sur une expérience sans mission plus écrite à la place du titre | Fait |
| C6 (3, 4) | SST sous « Formations » ; « Expression artistique » | **Décidé : on laisse** |
| C7, C8 | Analyse de candidature : « Appliquer à ma lettre » ouvre la lettre ; « Corriger dans l'analyse de candidature » reprend le CV déjà relu ; renommage | Fait |
| C9 | Rectangles « Garder comme repère » et « Vos documents relus » retirés (n'existaient que dans Cohérence) | Fait |
| C10, C11, C12, C13 | « Les mots de votre CV » : 3e point retiré ; écran « Coller la réponse » commun ; message de la fiche copiée ; impression de la fiche seule | Fait |
| C14 (a, b, c, d) | Comparer mes pistes : lecture tolérante des réponses ; barre du bas (Retour = écran précédent, Continuer dedans) ; **« Accueil » centré sur toutes les pages** | Fait |
| C14-e | Comparer mes pistes : écran « Collecter » passe par le choix d'assistant commun (Perplexity recommandé), texte copié sans être affiché, bloc commun pour coller | Fait pour cet écran seulement |
| C15 | Comparer mes pistes : boutons agrandis, rectangles ouverts sauf l'ampoule | Fait |
| C16 | Comparer mes pistes : rectangle des angles clarifié, option « Les deux angles, l'un après l'autre », choix des lignes à comparer | Fait |
| C17 | « Retour » depuis le premier écran de Comparer mes pistes ramène à la page d'où l'on vient | Fait pour ce module seulement |
| C18 | Comparer mes pistes, premier écran : consigne grande, trois façons repliées (bleu clair / blanc), icône changée | Fait |
| C19 → C20-a | CV : déplacement **à la souris** (poignée ⠿) des expériences, formations et missions ; flèches abandonnées | Fait (simulé, pas testé à la vraie souris) |
| C20-b | CV : ordre des formations par critère (plus récent, plus ancien, pertinence, Mon ordre) | Fait pour les formations |
| C20-c | CV : position des dates des formations et de l'expérience personnelle, alignée sur les expériences par défaut, dissociable | Fait (banc 24/24 identique) |
| C20-d | CV : un déplacement de rubrique refusé s'affiche en rouge | Fait |
| — | Chantier « enrichir les suggestions de mise en page » | **En réserve** (décision de Denis) |

## RESTE À FAIRE, par ordre de priorité

1. **Tests réels de Denis** (aucun n'a été fait à la main) : rejouer « Reformuler mon CV » avec le CV de Josianne (« Gestion du temps », SST) ; « Comparer mes pistes » (retour, barre, collecte avec un vrai assistant : copie dans le presse-papiers et ouverture réelle de Perplexity jamais testées) ; « Les mots de votre CV » (Ma fiche : imprimer) ; grand aperçu du CV avec la **vraie souris** (poignées ⠿, position des dates, rectangle rouge).
2. **Relecture à effort `high` de trois points faits sans l'effort demandé** : C6 (aiguillage vers `missions` pour une expérience sans mission), C8 (reprise du CV déjà relu depuis Cohérence : le parcours réel complet n'a pas été rejoué), C7 (cause exacte du « rien ne se passe » non reproduite).
3. **C6, points 5 et 6, non expliqués** : expérience personnelle affichée sans mission alors que l'assistant en fournit trois ; expériences « Coiffeuse » et « Aide cuisine » absentes du CV affiché. Il faut le fichier de session de Denis (icône disquette, qu'il n'a pas) ou ses étapes exactes.
4. **C14-e / dette B.17, quatre écrans de Comparer mes pistes** (détection des pistes, côte à côte affiné, dans le temps, aller plus loin) affichent encore leur texte et l'ancien collage : les migrer un par un, un commit chacun, avec le même schéma que l'écran « Collecter » (`ecran2PreparerEtEnvoyer`, `ecran2BrancherChez` dans `modules/comparer-pistes/index.js`). Environ **quinze autres écrans de l'application** sont aussi à l'ancien rendu du collage (Reformuler, Wizard CV, PrepLE, Lettre, Entretien, Cohérence x2, Découverte x2, Regard extérieur, Regard recruteur...) : à faire seulement sur demande, écran par écran.
5. **C17 général : « Retour » = page précédente partout.** L'application n'a pas d'historique de navigation commun (`barreNavigation()`, `js/app.js`). Décision de conception (Mode A) + liste des parcours où Denis voit le défaut, avant tout code ; risque de retrouver la boucle infinie de septembre.
6. **C20, ce qui manque** : ordre des **éléments** de l'expérience personnelle et son critère (plus récent, plus ancien) ; ses éléments peuvent être de simples textes, sans position d'origine attachable comme pour les formations ; à traiter comme le déplacement libre. Le défaut « déplacement de rubrique qui échoue sans message » n'a pas été reproduit (seul le manque de signal rouge l'était) : si Denis le revoit, il faut le modèle et la rubrique.
7. **Petits reports** : C3 (le prompt de Reformuler ne demande pas de savoirs : seuls ceux de la fiche métier s'affichent) ; C12 (bouton « Enregistrer en fichier » pour la fiche, proposé, pas fait) ; C9 (autres blocs explicatifs à retirer, seulement sur signalement de Denis) ; Mini CV A5 et position des dates des missions non concernés par C20-c.
8. **Reste des chantiers antérieurs** (voir `docs/ETAT_DES_CHANTIERS.md` partie 0) : test réel du Word par Denis, « escalier » à reproduire (modèle à préciser), Frise / Rectangles / Photo, sortie du dépôt hors d'OneDrive (des erreurs `unable to map index file` de git ont eu lieu aujourd'hui, réessayer suffit), banc B.7 à régénérer, branche `master-Pc-Denis` à abandonner, module « Où et sous quel nom chercher » en pause, disposition par défaut du CV (chantiers de l'autre compte).

## Où reprendre en premier

Demander à Denis de faire les tests réels du point 1 (il les a annoncés comme prochaine étape), puis traiter ce qu'il remonte. Sinon, sur son feu vert : point 4 (écrans de Comparer mes pistes, `high`) ou point 2 (relecture `high`).
