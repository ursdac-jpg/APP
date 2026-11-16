# Rapport de test : les cinq autres cartes de l'accueil

Écrit le 11/11/2026 (suite de la consigne 249 : « même rigueur ensuite pour tous les autres parcours »). Méthode : `docs/PROTOCOLE_TEST_PARCOURS_MES_DOCUMENTS_2026-11-11.md`. Outils : `scripts/parcours/protocole/tourCartes.js` (passage rapide de toutes les tuiles), puis un scénario détaillé par parcours à étapes.

## Passage rapide de toutes les tuiles (`tourCartes`, largeur 1280)

Pour chaque tuile : ouverture de la carte, clic sur la tuile, contrôle de l'arrivée, avance avec « Continuer » tant qu'il est actif, chaîne des « Retour » jusqu'à l'accueil.

| Carte | Tuile | Arrivée | Chaîne des « Retour » |
|---|---|---|---|
| Me préparer à candidater | Écrire ma lettre avec l'assistant | présentation, puis page « Préparer » | présentation, puis carte rouverte : correct |
| | M'entraîner à un entretien | présentation, puis page « Préparer » | idem : correct |
| | Employeurs près de chez moi | présentation, puis « Qui fait quoi » | idem : correct |
| Boîte à outils | Mes Repères, Mon Carnet, Lexique | présentation, puis l'outil | idem : correct |
| | Découvrir mes compétences | présentation, puis page de dépôt (grisée avec la raison) | idem : correct |
| Outils d'analyse | Analyser ma candidature, Un regard sur mon CV, Les mots de votre CV (ATS), Cohérence de mon dossier | présentation, puis page de dépôt (grisée avec la raison) | idem : correct |
| Se tenir informé | Comprendre le cadre, Comprendre les chiffres, Qui fait quoi | présentation, puis le module | idem : correct |
| Vous hésitez encore ? | Comparer mes pistes | présentation, puis page de départ (grisée avec la raison) | identique aux autres (corrigé le 12/11/2026, C1) |
| | Un CV, plusieurs métiers | présentation, puis page de dépôt (grisée avec la raison) | idem : correct |

## Constats et corrections

### Carte « Me préparer à candidater »

Scénarios : `preparerLettre.js`, `preparerEntretien.js` (réponses de l'assistant simulées, réponse coupée puis complète, « Retour » puis « Continuer », chaîne des « Retour »).

- **P1 (corrigé)** : sur l'écran « Collez la réponse » de tous les parcours qui l'utilisent, « Continuer » grisé affichait une raison générale (« Complétez cette page pour continuer »). Elle dit maintenant ce qu'il reste à faire : coller la réponse, coller la suite si elle est coupée, recommencer le collage si elle n'a pas pu être lue. Source unique : `modules/collage-reponse/logique.js` et `fenetre.js`.
- **P2 (corrigé)** : dans « M'entraîner à un entretien », la raison sous « Continuer » demandait d'indiquer la situation actuelle dans « Adaptation au métier » alors que ce bloc est verrouillé tant que « Votre candidature » n'est pas complète (métier visé, entreprise précise ou présentation générale). La personne était envoyée vers une case qu'elle ne pouvait pas remplir. La raison nomme maintenant d'abord ce qui manque dans « Votre candidature » (même règle que le verrou, une seule fonction `_prepaEntretienRaisonsCta`), et elle se met à jour à chaque saisie.
- **P3 (corrigé)** : le même écran disait « rien n'est bloquant » et affichait « conseillé si vous l'avez » alors que des points bloquent. Textes remis d'accord avec le comportement.
- Sans écart : lettre de bout en bout (dépôt, préparation, réponse coupée signalée, réponse complète, résultat, chaîne des « Retour »), entretien idem.

### Carte « Outils d'analyse »

Scénarios : `analyseBilan.js`, `analyseRegard.js`, `analyseAts.js`, `analyseCoherence.js` (dépôt du CV, « Retour » puis bouton de la présentation, « Reprendre », assistant simulé, réponse coupée puis complète, résultat, chaîne des « Retour »).

- **B1 (corrigé)** : « Analyser ma candidature » : la personne déposait et relisait son CV, faisait « Retour » jusqu'à la présentation, puis le bouton de la présentation (« Analyser mon CV ») : tout le travail de relecture était perdu et elle repartait de zéro. Corrigé en deux temps (voir A1) : la présentation garde son bouton « Analyser mon CV » et, si une préparation est commencée, ramène à la page « Préparer » avec l'encart « Reprendre / Recommencer », comme les autres modules. Le CV relu est gardé.
- **B2 (corrigé)** : l'apostrophe du bouton final « Merci bien, j'ai fini » était droite ; elle est maintenant typographique, comme partout ailleurs.
- Sans écart : « Un regard sur mon CV », « Les mots de votre CV (ATS) » et « Cohérence de mon dossier » de bout en bout (bouton grisé avec la raison tant que rien n'est déposé, dégrisé après le dépôt, travail gardé après « Retour », réponse coupée signalée, réponse complète, résultat, chaîne des « Retour » jusqu'à l'accueil).
- **Faux positif du protocole (corrigé dans l'outil)** : le contrôle « bouton sans texte » signalait des boutons dont le texte est dans un bloc replié ; il lit maintenant aussi le texte caché.
- **A1 (corrigé le 11/11/2026, après accord de Denis)** : ma première correction de B1 faisait dire « Revenir au module » à la présentation du Bilan dès qu'une préparation était commencée, alors que Cohérence et les autres modules gardent leur bouton de départ puis affichent l'encart « Reprendre / Recommencer » (« Revenir au module » n'existe que pour un détour ou une analyse déjà envoyée, dans le Bilan comme dans Cohérence). Le Bilan est remis d'accord : bouton « Analyser mon CV », puis `bilanTravailEnCours()` (source unique, `data/metiers.js`, aussi utilisée par la tuile) décide de reprendre avec l'encart au lieu de repartir de zéro.

### Carte « Boîte à outils »

Scénarios : `boiteCompetences.js` (réponse de l'assistant simulée), `boiteOutils.js` (Carnet, Repères, Lexique avec de vrais gestes).

- **O1 (corrigé, bug réel)** : dans « Mon Carnet », le bouton « Transformer en Repère » ouvrait une fenêtre vide : seul le titre et la croix s'affichaient, les quatre types de Repère (Question, Idée, À approfondir, À discuter) restaient masqués par le style de base. Impossible de transformer une note en Repère. Le choix du type est maintenant ouvert d'emblée dans cette fenêtre (`reperesCreerAvecTexte`, `modules/reperes/index.js`). Vérifié : la note est marquée « Déjà transformée en Repère » et le Repère apparaît dans « Mes Repères ».
- Sans écart : « Découvrir mes compétences » (dépôt, « Continuer » grisé avec la raison, travail gardé après « Retour », assistant simulé, relecture ligne par ligne, « Terminé », chaîne des « Retour »). Carnet : noter sans texte ne crée rien, le champ se vide, la note est gardée après « Retour », la suppression demande confirmation puis offre « Annuler ». Repères : choix du type, saisie, titre proposé, liste, Repères gardés après « Retour ». Lexique : recherche sans résultat claire, résultats, fiche, favori, « Mes favoris », « Retour ».
- **À trancher (L1, amélioration)** : dans le Lexique, « Retour » depuis une fiche ramène à la recherche vide : le mot tapé et les résultats ne sont pas gardés. Garder la recherche demande de décider si c'est voulu (écran qui repart propre) ou non.

### Carte « Se tenir informé »

Scénario : `informer.js` (choix du département, sujet ouvert, chaîne des « Retour », mémoire du département à la réouverture).

- Sans écart : « Comprendre le cadre », « Comprendre les chiffres » et « Qui fait quoi » demandent le département à la première arrivée, le gardent d'un module à l'autre (jamais redemandé), ouvrent leurs sujets, et la chaîne des « Retour » ramène à l'accueil.

### Carte « Vous hésitez encore ? »

Scénarios : `orientationComparer.js`, `orientationUcpm.js`.

- Sans écart : « Un CV, plusieurs métiers » (dépôt, reprise, assistant simulé, métiers proposés). « Comparer mes pistes » : « Continuer » grisé avec la raison tant que les pistes, la situation et l'âge ne sont pas donnés, pistes gardées après « Retour ».
- **C1 (résolu le 12/11/2026, décision de Denis « Comme les autres »)** : dans « Comparer mes pistes », « Retour » depuis la première page ramenait directement à l'accueil (règle posée par Denis le 30/09/2026, appliquée à ce seul module), alors que les autres modules repassent par la présentation. Denis a tranché pour le comportement commun : « Retour » revient maintenant à la présentation, comme partout (consigne 256).

## Ce qui n'a pas été joué en profondeur

- « Un CV, plusieurs métiers » à partir de l'étape 3 et « Comparer mes pistes » après la première page : couverts par `scripts/parcours/parcours_smoke.js`.
- « Analyser ma candidature » : correction et page « Terminé » non rejouées ici.
- Repères : Regard extérieur et Deuxième regard (assistant) ; Lexique : thèmes, domaines, mode Livre.
- Mode sombre : non rejoué par ces scénarios.

## Vérifications finales

- Tous les scénarios (ceux des cartes ci-dessus et ceux de « Mes documents ») rejoués à la largeur 1280 : 0 écart. Les scénarios des cinq autres cartes rejoués aussi à 375 px (téléphone) : 0 écart. Sur téléphone, les boutons de départ sont raccourcis (« Commencer », « Reprendre »), c'est voulu.
- `npm test` : 2700 tests, tous verts.

## Suite du 12/11/2026 (retours de Denis après lecture du rapport)
- **Bouton « Reprendre → » de la barre du bas sur une seconde ligne** (module ATS, vu par Denis sur capture) : corrigé (consigne 257). Il touchait tous les modules dont la barre n'a pas de bouton à droite avant la reprise ; le protocole le mesure désormais partout.
- **Deux formes d'encart de reprise** (consigne 258) : « Reprendre mon CV », Créer un CV et une dizaine de présentations (`_introBlocReprise`) affichent l'encart sur la page de présentation, à gauche, avec « Recommencer » seul puis « Reprendre » dans la barre du bas ; Bilan, Cohérence, Regard, ATS, Comparer, Découverte, Compétences et Un CV plusieurs métiers (`htmlEncartRepriseModule`) l'affichent sur la page de travail grisée, en haut à droite, avec « Reprendre » et « Recommencer ». En attente du choix de Denis.
- **Tuiles qui pulsaient** à la première ouverture d'une carte : supprimé (consigne 259).
