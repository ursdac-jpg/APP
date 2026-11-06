# Chantier : Regard extérieur sans fenêtres (maquette faite le 01/11/2026)

**État : CODÉ ET VÉRIFIÉ le 01/11/2026 (les 5 décisions de Denis sont prises : recommandations retenues, choix de l'assistant avec la brique commune actuelle).** Reste à Denis : ses essais réels (ChatGPT) et la relecture visuelle. Détail du codage en fin de fiche.
Mode A, `[effort : haut]` pour le codage.

Maquette cliquable : `docs/MAQUETTE_REGARD_EXTERIEUR_EN_PAGE_2026-11-01.html` (ordinateur, téléphone, clair, sombre, trois déroulés jouables). Elle reprend les vraies feuilles de style et les vraies classes de l'application.

**Correction de la maquette le 01/11/2026 (remarque de Denis)** : la première version montrait le parcours comme une page à part. Dans la vraie application, l'en-tête « Mes Repères » (titre, « Revoir la présentation », « Garder une réflexion ») reste en haut et seule la zone dessous change, comme « Mes rapports » ; la barre du bas est celle de Mes Repères. La maquette montre maintenant cet emboîtement.

## Audit du code réel (fait le 01/11/2026)

Fichiers lus : `modules/regard-exterieur/index.js` (les trois déroulés et les fenêtres), `modules/reperes/index.js` (page « Mes rapports », boutons de départ), `modules/regard-recruteur/index.js` (modèle en page : barre d'étapes, choix de l'assistant, collage), `js/app.js` (brique `htmlCollageUniquePage` / `brancherCollageUniquePage`).

### Les 8 fenêtres qui font encore un parcours

| N° | Fenêtre | Où | Devient |
|---|---|---|---|
| 1 | Quels Repères envoyer ? | 1ère analyse | étape « Préparer », page de sélection (mêmes cases, « Modifier », garde-fou Repère vide) |
| 2 | Choisissez votre assistant | les 3 déroulés | étape « Assistant », écran de choix **avec la brique commune actuelle** `htmlChoixAssistantBilanCorps` (le conseil « Le plus simple : ChatGPT », les autres assistants, « En savoir plus » et « Ce qui va se passer » repliés), comme le Bilan et Regard recruteur : l'ancien écran propre au module (pastilles « Sans compte / Compte nécessaire » et pastilles d'étapes) disparaît (remarque de Denis, 01/11/2026) |
| 3 | Collez la réponse (+ confirmation) | les 3 déroulés | étape « Assistant », écran de collage (brique commune déjà en page ailleurs), puis étape « Terminé » |
| 4 | Deuxième Regard : Oui / Non | Deuxième Regard | écran « Affiner ? » dans « Préparer » |
| 5 | Quelques questions (5) | Deuxième Regard | écran de questions, une à la fois |
| 6 | Quelles catégories approfondir ? | Aller plus loin | écran de catégories dans « Préparer » |
| 7 | Quelques questions | Aller plus loin | même écran de questions que le n° 5 |
| 8 | Voir mon analyse | après import | supprimée : « Voir le rapport » ouvre « Mes rapports » avec ce rapport ouvert |

### Ce qui est simple (reprise de l'existant)
- Le collage : brique commune, déjà utilisée par Regard recruteur, Bilan, etc. Les phrases « Ce qui se passe » et « Pourquoi c'est utile » existent déjà dans le module.
- La page « Mes rapports » existe déjà en mode de la page Repères (`_reperesModeAffichage`), avec ses cartes, « Aller plus loin », « Point sur ma situation », suppression.
- Les contenus (questions, catégories, sélection) : on garde les mêmes fonctions de rendu, on change seulement où elles s'affichent.

### Ce qui est risqué
- Les deux suites de questions (Deuxième Regard et Aller plus loin) sont presque en double dans le code : les réunir en un seul composant touche l'état des réponses (`_regardExterieurReponsesEnCours`, `_regardExterieurDR`). À essayer sur les deux déroulés, avec parcours Playwright.
- Le texte envoyé à l'assistant (prompts) ne change pas : aucune modification des fichiers `prompts/`.
- Tout ce qui lit `document.getElementById('regardExterieurResultat')` (zone de résultat dans la fenêtre) doit être rebranché sur la zone en page : trois fonctions de traitement de réponse (1ère analyse, Deuxième Regard, Aller plus loin).
- La page Repères est longue : il faut masquer proprement le reste pendant le déroulé (même technique que « Mes rapports »).

### Aucun point bloquant, mais un défaut trouvé et corrigé
- « Aller plus loin » depuis un ancien rapport ne faisait plus rien à la fin des questions après un rechargement (assistant non sauvegardé). **Corrigé le 01/11/2026**, noté dans `ERREURS_ET_BUGS.md`. Dans le nouveau déroulé, l'étape « Assistant » est toujours là.
- Dans « Quelles catégories approfondir ? », le nom de chaque catégorie était collé à droite, loin de sa case. **Corrigé le 01/11/2026** (`regardExterieur.css`).

## Les 5 décisions attendues de Denis (détail avec avantages et risques dans la maquette)

1. Où se passe le déroulé : **dans la page Mes Repères (recommandé)** ou page à part.
2. Choix de l'assistant et collage : **deux écrans dans l'étape « Assistant » (recommandé)** ou un seul.
3. « Voir mon analyse » : **ouvre Mes rapports avec le rapport ouvert (recommandé)** ou garde la fenêtre.
4. Les deux suites de questions : **un seul composant (recommandé)** ou deux écrans.
5. Restent en fenêtre : **« Mes freins identifiés », fiche d'un frein, confirmation de suppression, aperçu avant impression « Point sur ma situation » (recommandé)**, ou tout en page.

## Plan de codage une fois validé (un commit par phase, `npm test` + navigateur entre chaque)

1. **Phase 1, cadre** : mode « regard » de la page Repères, barre de trois étapes, barre du bas, retour à Mes Repères, reprise après rechargement.
2. **Phase 2, 1ère analyse** : sélection, assistant, collage, confirmation. Parcours Playwright dédié.
3. **Phase 3, questions** : composant unique, branché sur Deuxième Regard (avec « Affiner ? ») puis sur Aller plus loin (avec catégories).
4. **Phase 4, lecture** : « Voir le rapport » vers Mes rapports avec le rapport ouvert ; suppression de la fenêtre « Voir mon analyse ».
5. **Phase 5, nettoyage** : entrées d'aide `regard-exterieur-*` devenues sans objet, `BRIQUES_COMMUNES.md`, `LANGAGE_VISUEL_COMMUN.md`, journal, page Nouveautés (ligne dans `data/nouveautes.js` à la fin), inventaire des fenêtres, recherche de l'accueil.

## À ne pas oublier (non-négociables)
Mode sombre vérifié, accents, aucun tiret long, aucun mot « IA » visible, aucune icône à visage, recherche accueil et Lexique à jour, `npm test` vert, test navigateur (le fichier `index.js` du module n'est pas chargé par les tests Node).

## Réalisation (01/11/2026)

- **Cadre** : `modules/reperes/index.js` : troisième mode de la page (`_reperesModeAffichage = 'regard'`), façades `reperesRegardOuvrir/Rafraichir/Fermer` et `reperesOuvrirRapportsSurRapport(id)` ; l'en-tête de Mes Repères reste, seule la zone dessous change ; historique du navigateur par écran (`_reperesSynchroniserHistorique`, clé `regard-<écran>`).
- **Déroulé** : `modules/regard-exterieur/index.js`, section « DÉROULÉ EN PAGE » : un seul état `_regardExterieurParcours` pour les trois déroulés (1ère analyse, Deuxième Regard, Aller plus loin), barre de trois étapes (Préparer, Assistant, Terminé), un seul écran de questions une à la fois, choix de l'assistant avec `htmlChoixAssistantBilanCorps`, collage avec `htmlCollageUniquePage`, « Continuer » dans la barre du bas de Mes Repères.
- **Supprimé** : les 8 fenêtres, l'ancienne fenêtre d'assistant propre au module (et ses classes CSS), le doublon des deux suites de questions, six entrées d'aide devenues sans objet (`js/app.js`). Les prompts (`prompts/`) n'ont pas changé.
- **Gardé en fenêtre** (décision 5) : « Mes freins identifiés », fiche d'un frein, confirmation de suppression, aperçu avant impression « Point sur ma situation ».
- **Vérifié dans le navigateur** : 1ère analyse, Aller plus loin (avec et sans catégorie à approfondir), Deuxième Regard (avec les 5 questions), « Voir le rapport » (Mes rapports avec le rapport ouvert), retour à chaque écran, flèche Précédent du navigateur, « Modifier » dans la sélection (cases conservées), téléphone, mode sombre, aucun défilement horizontal. `npm test` : 2305 verts.
- **Deux points à savoir** : le clic sur l'assistant mène directement à l'écran de collage (plus de fenêtre « Avant de continuer vers… », comme dans la maquette) ; après un rechargement de la page, un déroulé en cours n'est pas repris (l'état n'est pas sauvegardé, comme avant).
