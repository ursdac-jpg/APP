# Audit du code : où brancher « Vos missions et compétences » (création et trois voies de « Reprendre mon CV »), 14/11/2026

Lecture du code réel, aucune modification. Rien n'a été essayé dans le navigateur. Ce qui n'est pas vérifié est dit à chaque fois.

## En une phrase

La partie **missions** est simple : le champ existe déjà (`dossier.experiences[i].missions`, une mission par ligne, lu par le moteur de CV) et l'étape peut y écrire sans inventer de format. Les deux vrais points de risque sont **les compétences** (aucun endroit évident où les ranger par expérience) et **deux sources de missions** qui coexistent quand l'assistant a répondu.

## Ce que le code montre, voie par voie

### Création (« Créer un nouveau CV », avec ou sans assistant)
- Barre à 6 repères (5 sans assistant) : Votre objectif, Vos informations, Votre parcours, Votre profil, Assistant, Vos documents. Définie dans `data/metiers.js` (`CREER_CV_NAV_ETAPES`, `_creerCvNavIndex`, `_creerCvRouteParIndex`).
- « Vos informations » (`pageProjet`) saisit les expériences : `dossier.experiences[]` avec `poste`, `entreprise`, dates, `missions` (texte, une par ligne). Le moteur de CV (`modules/cv-composeur/composeurRender.js`, lignes 996 et 1241 à 1265) lit déjà ce champ.
- « Votre parcours » (`pageVotreParcours`) ne range **rien par expérience** : il enregistre trois listes globales d'identifiants (`dossier.activites`, `dossier.actions`, `dossier.environnement`), qui alimentent « Compétences déjà identifiées » et les consignes de l'assistant.
- Ajouter une étape entre « Votre parcours » et « Votre profil » touche : les deux listes d'étapes, les deux fonctions d'index et de route, la table `routes`, la liste d'identifiants de `afficherProgression`, « Continuer » de « Votre parcours », « Retour » de « Votre profil », les gardes anti-boucle (app.js vers 3902 à 3912) et le libellé de suite (vers 9085). Les pages de présentation et les vidéos qui parlent de « six étapes » sont à relire.

### Voie 1, « Le garder et le compléter » (mode `maj`, avec l'assistant)
- Barre : Préparer, Assistant, Réponse, **Corriger mon CV**, Vos documents. **Pas d'étape « Votre parcours »**. « Corriger mon CV » est la page « Vos informations » (`pageProjet`), avec le bloc des expériences.
- Donc, ici, il n'y a pas de nouvelle étape : le bouton « Compléter avec la fiche du métier » se place **sur chaque carte d'expérience de ce bloc**, comme la maquette le prévoit.
- Point à vérifier : quand l'assistant a répondu, ses choix vivent ailleurs (`dossier.ia.cv.recommandations.savoirFaireParExperience`, avec le « pool complet » `savoirFaireParExperienceProposees`, écran de choix dans `creerBrouillonChoixIACV` / `appliquerBrouillonChoixIACV`). Je n'ai pas tracé, mode par mode, laquelle des deux sources le moteur lit pour le CV final. **À trancher avant de coder** : sinon une mission cochée dans l'étape pourrait ne pas apparaître, ou être écrasée par la réponse de l'assistant.

### Voie 2, « Le reformuler et le présenter »
- Barre : Préparer, Assistant, Réponse, Vérifier, Vos documents. Aucune page d'édition des expériences.
- La phrase de la voie dit « sans rien y ajouter » : y brancher des missions de la fiche la contredirait. **Recommandation : ne rien brancher ici.**

### Voie 3, « Le refaire moi-même dans un modèle » (sans assistant, `modules/cv-sans-assistant`)
- Elle lit le CV déposé, classe les blocs, puis une page de vérification. Ses expériences ont **leur propre forme** (`csaParserExperience`) : `missions` est une **liste de textes**, alors que `dossier.experiences[].missions` est un **texte à lignes**. Deux formats pour la même chose.
- Le bouton irait sur la page de vérification, une carte d'expérience à la fois. Il faut une seule fonction de conversion entre les deux formes, jamais deux copies de la logique.

## Ce qui est simple, risqué, bloquant

**Simple (reprise de l'existant)**
- Écrire les missions cochées dans `dossier.experiences[i].missions` (ou dans l'équivalent de la voie 3).
- Retrouver la fiche d'un poste : la recherche par intitulé du ROME existe depuis la consigne 280 (app.js vers 3426 et 9400, `chargerFicheRome` ligne 10340).
- Les phrases : prêtes (`mi`, testées).

**Risqué**
- Deux sources de missions quand l'assistant a répondu (voie 1 et création avec assistant), voir plus haut.
- Chargement de la fiche : c'est un fichier par lettre, à la demande (jusqu'à 1,44 Mo pour la lettre K). Sans réseau ou si le chargement échoue, l'étape doit rester utilisable (saisie libre), avec un message simple.
- Le comportement « tout afficher d'un coup » (consigne 285) peut donner des listes longues sur certaines fiches : à mesurer sur le téléphone.
- `js/app.js` et les `ui.js` ne sont pas chargés par les tests Node : test navigateur obligatoire pour chaque lot.

**À décider (point bloquant pour les compétences)**
- Où ranger les compétences cochées ? Trois possibilités, à chiffrer avec Denis avant tout code : (a) une liste globale du CV (le plus simple, mais on perd le lien avec l'expérience que la maquette montre) ; (b) un champ nouveau par expérience (fidèle à la maquette, mais le moteur de CV et les consignes de l'assistant ne le lisent pas encore) ; (c) fusion dans les listes de « Votre parcours » (aucun nouveau champ, mais ces listes sont des identifiants de catalogue, pas des phrases libres).

## Ordre de codage proposé (par lots, un commit par lot, `npm test` et navigateur à chaque fois)
1. **Brique partagée « missions et compétences d'une expérience »** : une fonction qui, pour un poste, renvoie la fiche, les missions à cocher (`mi`), les compétences (`k`), sans toucher à l'écran. Testable en Node.
2. **Voie 1 (la plus petite surface)** : bouton sur chaque carte de « Corriger mon CV », après avoir tranché la double source.
3. **Création** : nouvelle étape (liste d'étapes, routes, barre, Continuer et Retour).
4. **Voie 3** : bouton sur la page de vérification, avec la conversion de format.
5. Voie 2 : rien.

## Décisions demandées à Denis
1. Où ranger les compétences (a, b ou c ci-dessus).
2. Confirmer que la voie 2 reste sans fiche (« sans rien y ajouter »).
3. Faut-il commencer par la voie 1 (petite surface, preuve rapide) ou par la création (cœur du parcours) ?
