# Chantier : le panneau « Candidature » partagé, adapté à chaque module (ouvert le 2026-09-29)

Décisions de Denis (2026-09-29) : tout ce qui suit est **validé**. Mode A pour la conception (faite), Mode B pour le code. Effort `medium`.

## Principe

Le panneau de « Votre objectif » (situation, métier ou domaine visé, offre, entreprise, site, type de structure, puis « Le poste que vous recherchez ») est la référence : complet et cohérent. On le réutilise, mais **on n'affiche dans chaque module que ce qui change réellement le résultat de son prompt**. Une rubrique sans effet sur l'analyse n'est pas affichée (elle fait perdre du temps à un public fragile).

## Matrice validée : qui reçoit quoi

| Rubrique | Cohérence | Un regard sur mon CV | Les mots de votre CV | Reformuler | Bilan | Parcours qui fabriquent un document |
|---|---|---|---|---|---|---|
| Situation (offre, spontanée, reconversion, stage...) | OUI (nouveau dans le prompt) | non | non | non | OUI (déjà) | OUI |
| Métier ou domaine visé | OUI (nouveau dans le prompt) | OUI | OUI (fiche métier) | OUI, obligatoire | OUI | OUI |
| Offre | OUI | OUI | OUI | OUI (texte seulement) | OUI | OUI |
| Entreprise, site, type de structure | OUI | OUI | type de structure et offre seulement | non | OUI | OUI |
| Civilité du recruteur, couleur d'entreprise | non | non (voir note) | non | non | non | OUI |
| Le poste que vous recherchez (contrat, temps, disponibilités) | non | non | non | non | **non (retiré du Bilan, décision Denis 2026-09-29)** | OUI |

Note couleur d'entreprise, Un regard sur mon CV : elle vient de l'adresse du site de la structure. L'assistant la trouve si possible (le prompt le prévoit déjà), sinon la personne la renseigne à la main. Aucun changement à faire ici.

## Règles ajoutées le 2026-09-29

1. **Le métier devient facultatif quand une offre est collée** (Cohérence, Un regard sur mon CV, Les mots de votre CV) : les prompts déduisent le secteur de l'offre.
2. **Une aide de deux lignes sous chaque rubrique** : « pourquoi on vous le demande ».
3. **Suggestion à valider en un clic** : « Votre CV parle de : Magasinier. Viser ce métier ? » Sources : le titre du CV (`dossier.titreCV`), à défaut le poste de la dernière expérience. Jamais rempli automatiquement. Uniquement là où le CV est déjà analysé (pas sur un CV déposé en texte brut).
4. **Tout ce que la personne saisit doit arriver dans le prompt** : nouveau champ de prompt « contexte de la candidature » (fonction partagée extraite de `texteProfil()`), avec la consigne de s'en servir. Prompts mis à jour, tests mis à jour.
5. **Écarté pour l'instant** : capter en retour les réponses de l'assistant (aucun besoin réel identifié). À rouvrir seulement si un besoin apparaît.
6. **Blocs numérotés toujours ouverts** (demande de Denis, tous les parcours) : plus aucun bloc ne s'ouvre ou ne se ferme selon l'avancement. Ouverts à l'arrivée, ils ne se referment que si la personne clique sur le titre du bloc. Règle centrale : `ouvertBlocDepliManuel()` (`data/metiers.js`).

7. **Plus de fond vert sur les points déjà renseignés** (demande de Denis, 2026-09-29) : `bd-ok` et les cartes « Déposé » n'ont plus de fond ni de filet vert, partout. Restent les petites pastilles d'état (« Déposé », « Renseigné »). Le vert du statut « prêt » de la synthèse du rapport est conservé (classe `bd-pret`).

8. **« Choisir un fichier » mis en évidence** (demande de Denis, 2026-09-29) : gros bouton principal à la place du champ natif peu lisible, dans la fenêtre de dépôt partagée (CV, lettre, entretien) et pour la lettre de la préparation d'entretien. Brique `htmlChoixFichierEvident` (`data/metiers.js`). Fait.

## Plan, une case par tâche (un commit par case, `npm test` et vérification navigateur à chaque fois)

- [x] 0. Ligne « pas encore de CV » retirée dans « Les mots de votre CV ».
- [x] 1. Blocs numérotés toujours ouverts (règle 6), dans tous les parcours. Fait le 2026-09-29 (commit 6751109).
- [x] 2. Briques partagées du panneau (cartes de situation, panneau, ouverture, câblage) avec réglage par module (`htmlPanneauCandidaturePartage({ projet, sansCiviliteCouleur })`, `js/app.js`). Fait.
- [x] 3. Contexte de la candidature pour les outils d'analyse : **fonction nouvelle** `contexteCandidaturePourAnalyse()` (situation + cible visée), et non une extraction de `texteProfil()` (la section existante est écrite pour fabriquer un document : consignes de rédaction, couleurs JSON... elle serait fausse dans une analyse). CV, lettre et entretien restent strictement inchangés. Fait.
- [x] 4. Cohérence de mon dossier : panneau (situation, métier, offre et structure) + prompts (`coherence-transversale.md`, `coherence-transversale-entretien.md`) + tests.
- [x] 5. Un regard sur mon CV : panneau réduit (variante `CONFIG_BLOC_CANDIDATURE_ANALYSE`, sans cartes de situation ni projet ni civilité/couleur) + prompt (`regard-recruteur.md`) + blocs toujours ouverts. Vérifié navigateur.
- [x] 6. Reformuler le CV : panneau partagé réduit à métier ou domaine + offre seule (option `offreSeule`), remplace les champs propres `reformulerPoste` / `reformulerSecteur` (repli conservé pour les anciennes sessions sauvegardées). Prompt inchangé (il lisait déjà ces informations). Vérifié navigateur.
- [x] 7. Les mots de votre CV : panneau réduit (métier ou domaine, offre, entreprise, site, structure). Le mode « offre » ou « métier » se déduit des champs (`_atsSynchroniserReference`), fiche métier et code ROME retrouvés pour un métier du répertoire. Prompt inchangé. **Défaut corrigé au passage** : dans l'ancien écran, le mode « J'ai une offre » ne pouvait jamais activer le bouton (l'état lu n'avait pas la forme attendue) ; et chaque ré-affichage de l'écran remontait la page en haut, corrigé (ne remonte que lors d'un vrai changement d'écran). Tests ajoutés. Vérifié navigateur.
- [x] 8. Bilan : « Le poste que vous recherchez » et civilité/couleur retirés, briques partagées utilisées. Vérifié navigateur.
- [x] 9. Suggestion du métier : **sans fenêtre** (décision Denis, option A ramenée à l'existant). Le panneau partagé pré-remplissait déjà la barre de recherche avec le titre du CV (2026-09-28) ; source élargie au poste de l'expérience en cours (`metierSuggereDepuisCV()`), avec la phrase « Proposé d'après votre CV : corrigez-le si besoin, puis cliquez sur le métier qui vous convient ». Rien n'est choisi tant que la personne ne clique pas. Uniquement quand le CV est analysé. Les aides de deux lignes sont portées par le paragraphe d'introduction de chaque module (déjà écrits, un par rubrique).
- [x] 10. Métier facultatif quand une offre est collée : aucun blocage dans Cohérence, Un regard sur mon CV, Les mots de votre CV ; phrase ajoutée dans Cohérence (les deux autres l'avaient déjà).
- [x] 11. Passe finale : chaque champ retrouvé dans son prompt (Cohérence : situation, cible, offre, entreprise, site, structure ; Un regard sur mon CV : poste, offre, entreprise, site, structure ; Les mots de votre CV : mode, métier, ROME, offre, entreprise, site, structure ; Reformuler : poste ou domaine, offre ; Bilan : objectif, métier, offre, entreprise, site, structure), `npm test` 1046 verts. Aucun texte du Lexique modifié. **Reste à faire par Denis** : test sur son propre CV et en mode sombre (les briques réutilisent des classes existantes, non contrôlées une par une en sombre).

## Défauts trouvés et corrigés en cours de route (2026-09-29)

Le panneau partagé écrivait l'offre dans `rechercheCandidature.lienOffre`, alors que le Bilan et la Cohérence lisaient `rechercheCandidature.texteOffre`, et que le champ se pré-remplissait depuis `texteOffre`. Conséquences réelles : **l'offre saisie dans le panneau du Bilan n'arrivait jamais dans le prompt du Bilan**, et le champ se vidait à l'écran au re-rendu. Corrigé : le panneau écrit aussi `texteOffre`, et les trois lecteurs (pré-remplissage, Bilan, Cohérence) retombent sur `lienOffre`. Tests ajoutés.

## Contrôles complémentaires (2026-09-29, fin de journée)

- Lettre de motivation et préparation d'entretien : leur bloc « Votre candidature » utilise déjà les mêmes briques (cartes de situation + `contenuModeRecherche`), ce sont des parcours qui fabriquent un document : le panneau complet est voulu. Blocs ouverts par la règle centrale. Rien à changer.
- Regard extérieur : aucune zone de ciblage, rien à brancher.
- Remontée de page : mesurée sans problème dans le Bilan, Cohérence, Reformuler, Un regard sur mon CV, « Votre objectif » ; corrigée dans Les mots de votre CV.
- Mode sombre : page Cohérence contrôlée (panneau, blocs, cartes), correcte.
- **Arrivée en haut de page (retour de test de Denis, 2026-09-29)** : depuis que les blocs sont ouverts dès l'arrivée, Cohérence s'ouvrait en bas de page (la position du bouton « Je commence » était conservée). Corrigé dans Cohérence, et de façon générale dans le bouton de départ des pages de présentation (`data/metiers.js`, `_arriveeDepuisPresentation`), utilisé par Les mots de votre CV et Comparer mes pistes. Mesuré sur 12 modules : tous arrivent en haut, sans saut quand on remplit.
- **Règle « un CV n'existe que s'il est validé » (Denis, 2026-09-29, valable pour TOUTE l'application)** : un document est validé uniquement quand il est passé par la fenêtre de vérification ET a été enregistré. (1) Fermer la fenêtre de dépôt avant l'enregistrement restaure le dossier (`_depotCVRestaurer`, `fermerAssistantDepotCV`, `data/metiers.js`) : plus de CV fantôme proposé au dépôt suivant. (2) Fermer la relecture d'un texte jamais validé le fait oublier (Bilan, Reformuler / Mettre à jour, lettre de motivation, préparation d'entretien : CV et lettre). (3) **Tant que le CV n'est pas déposé puis validé, les autres points sont désactivés** (visibles, grisés, inertes, avec la phrase « Déposez d'abord votre CV… » ou « Validez d'abord votre CV… ») : brique `appliquerVerrouBlocs` (`data/metiers.js`), branchée dans Bilan, Cohérence, Un regard sur mon CV, Les mots de votre CV, Reformuler / Mettre à jour, lettre de motivation, préparation d'entretien. Vérifié navigateur sur 7 parcours (sans CV, CV déposé non relu, CV validé).
- **Contrôles complémentaires (2026-09-29, soir)** : mode sombre contrôlé (points grisés, fenêtre de dépôt) ; **défaut préexistant corrigé** : la fenêtre de dépôt partagée et une seconde fenêtre avaient un fond blanc écrit en dur (`background:white`), illisible en mode sombre, désormais `var(--bg-card)` (`data/metiers.js`). Tests automatiques ajoutés (`tests/panneauCandidaturePartage.test.js`, 7 tests : situation et cible, métier proposé, récapitulatif, points désactivés, dépôt annulé). Préparation d'entretien : un CV ou une lettre collé(e) ouvre tout de suite la relecture (comme les autres parcours). Un regard sur mon CV en mode texte : audité, rien à changer (le texte n'est retenu qu'après enregistrement).
- **Décision de Denis (2026-09-29) : capter les réponses de l'assistant / lui faire poser des questions = ABANDONNÉ** (public fragile, prompts à consigne unique, prompt du Bilan saturé). Remplacé par : **A** un récapitulatif « Ce que l'assistant saura de votre candidature » en tête de l'écran « Choisir l'assistant » (Bilan, Cohérence, Un regard sur mon CV, Les mots de votre CV, Reformuler ; brique `htmlRecapContexteEnvoi` dans `htmlChoixAssistantBilanCorps`, option `recapContexte`), avec renvoi vers « Retour » pour compléter ; **B** vérification que chacun des 5 prompts interdit de deviner une information absente (faite, les 5 le disent). À rouvrir seulement si des rapports génériques prouvent un manque que la personne n'aurait pas pu compléter avant l'envoi.

## Vérification zéro régression (à cocher à la fin)

- [x] Le CV, la lettre et l'entretien produisent exactement le même texte de contexte qu'avant (`texteProfil()` non modifié).
- [x] Aucun champ saisi dans un panneau ne reste sans effet sur le prompt du module concerné (voir la case 11).
- [x] Les données du panneau écrivent toujours dans les champs globaux partagés (jamais de copie locale). Exception assumée : `etat.ciblage` de Un regard sur mon CV et des Mots de votre CV est recalculé depuis les champs globaux à chaque envoi.

## Verdict

**APTE AU MODE NUIT** pour le code (toutes les décisions sont tranchées).
