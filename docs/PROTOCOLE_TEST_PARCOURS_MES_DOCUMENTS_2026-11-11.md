# Protocole de test des parcours : carte « Mes documents »

Écrit le 11/11/2026 (consigne 249 de Denis). Ce protocole est réutilisable : la même méthode servira ensuite pour toutes les autres cartes de l'accueil. Le rapport des constats est dans `docs/RAPPORT_TEST_MES_DOCUMENTS_2026-11-11.md`.

## 1. Ce qu'on cherche, et ce qu'on ne cherche pas

On teste le **code** : boutons, navigation, barre du bas, barre d'étapes, bouton Retour, reprise après être sorti, états grisés. On **ne juge pas** la qualité des textes écrits par l'assistant en ligne : les prompts fonctionnent, les réponses de l'assistant sont donc **simulées** (jeux de réponses fabriqués au format exact attendu). Quand une réponse simulée est réellement réaliste, on vérifie aussi que l'application l'exploite correctement (par exemple le garde-fou « cette compétence ne figure pas dans votre CV » s'est déclenché tout seul).

## 2. Outil

Dossier `scripts/parcours/protocole/` (rien n'est modifié dans l'application) :

| Fichier | Rôle |
|---|---|
| `outils.js` | Pilote le navigateur (Playwright), pose un script dans la page, regarde chaque écran, tient le journal des constats. |
| `lancer.js` | `node scripts/parcours/protocole/lancer.js <scénario> [largeur]` ; écrit `sorties/<scénario>_<largeur>.json` et affiche les écarts. Variable `DEBUG=1` : affiche chaque écran (titre, boutons, champs, texte). |
| `explorer.js` | Outil de mise au point : affiche les écrans d'un parcours étape par étape (sert à écrire un nouveau scénario). |
| `creerAssistant.js` | Créer un nouveau CV, voie 1 (avec l'assistant) + six variantes d'objectif. |
| `creerRecit.js` | Créer un nouveau CV, voie 2 (à partir du récit). `TRONQUE=1` ajoute l'essai d'une réponse coupée. |
| `creerAlaMain.js` | Créer un nouveau CV, voie 3 (à la main). `PASTILLES=1` ajoute les clics sur la barre d'étapes. |
| `reprendreVoie1.js`, `reprendreVoie2.js`, `reprendreVoie3.js` | Reprendre mon CV : dépôt commun puis les trois voies (`reprendreCv.js` : code commun). |
| `lettreRapide.js`, `ficheRapide.js` | Lettre et entretien en version rapide : parcours 1 (lettre) et parcours 2 (fiche d'entretien). |
| `tourCartes.js` | Passage rapide de toutes les tuiles des cinq autres cartes de l'accueil (`CARTES=`, `TUILES=`, `DETAIL=1`). Rapport : `docs/RAPPORT_TEST_AUTRES_CARTES_2026-11-11.md`. |
| `preparerLettre.js`, `preparerEntretien.js` | Carte « Me préparer à candidater » : écrire ma lettre, m'entraîner à un entretien (réponses simulées). |
| `analyseBilan.js`, `analyseRegard.js`, `analyseAts.js`, `analyseCoherence.js` | Carte « Outils d'analyse » (réponses simulées ; `enchainer.js` : fin commune des parcours à assistant). |
| `boiteCompetences.js`, `boiteOutils.js` | Carte « Boîte à outils » : Découvrir mes compétences (réponse simulée) ; Carnet, Repères, Lexique (`OUTILS=carnet,reperes,lexique`). |
| `informer.js` | Carte « Se tenir informé » : département, sujets, mémoire (`MODULES=`). |
| `orientationComparer.js`, `orientationUcpm.js` | Carte « Vous hésitez encore ? ». |
| `exploreDepot.js` | Outil de mise au point des écrans de dépôt. |

Prérequis : serveur de développement (`site-v2-python-server`, port 8123, hôte `app.local`), `NODE_PATH` vers `node_modules`.

## 3. Contrôles faits à CHAQUE écran (automatiques)

1. Titre de la page et route attendus.
2. Étape courante de la barre d'étapes, quand il y en a une.
3. État du bouton du bas (« Continuer ») : libellé, grisé ou non, **raison affichée** quand il est grisé.
4. Présence du bouton Retour et du bouton Accueil dans la barre du bas.
5. Boutons sans texte ni icône (accessibilité), boutons en doublon, champs sans étiquette.
6. Erreurs du navigateur (console, requêtes en échec).

## 4. Contrôles propres aux parcours (scénarisés)

Pour chaque voie :

1. **Départ direct** depuis la page commune de la carte : le bouton de la voie mène bien à la bonne première étape.
2. **Bouton du bas grisé au départ**, avec une raison lisible ; dégrisé dès que la condition est remplie.
3. **Retour puis Continuer** à chaque étape : on retrouve exactement le même écran, avec ce qui a été saisi.
4. **Chaîne de « Retour »** depuis le dernier écran jusqu'à la page commune : chaque appui doit remonter d'**un écran visible**, jamais sauter, boucler ou rester sur place.
5. **Barre d'étapes** : un clic sur une pastille déjà passée mène à son écran (`PASTILLES=1`).
6. **Sortie par Accueil en cours de voie, puis retour** : la page commune propose « Continuer » (reprise) et « Recommencer », et « Continuer » ramène à l'écran quitté.
7. **Réponse de l'assistant** : réponse coupée (signalée ?), réponse complète collée après une coupée, réponse complète d'emblée, texte avec phrases autour du bloc de code.
8. **Validation puis « Modifier »** : l'état validé est réversible.
9. **Largeur téléphone (375 px)** : mêmes scénarios, mêmes contrôles.
10. **Mode sombre** : un coup d'œil sur les écrans neufs (à faire à la main par Denis, ou par `resize_window` avec `colorScheme: dark`).

## 5. Jeux de réponses simulées

Dans les scénarios : `REPONSE_CV` (format `prompts/cv.md`), `REPONSE_1` et `REPONSE_REDAC` (récit : `prompts/decouverte-competences.md` puis `decouverte-redaction.md`), `REPONSE_EXTRACTION` (`prompts/extraction-cv.md`), `REPONSE_REFORMULER` (`prompts/reformuler-cv.md`), `REPONSE_LETTRE` (`prompts/lettre.md`), `REPONSE_ENTRETIEN` (`prompts/entretien.md`). Si un prompt change de format, mettre à jour le jeu correspondant.

## 6. Comment ajouter un parcours

1. `EXP_ROUTE=<route> EXP_CLIC=<bouton de départ> node scripts/parcours/protocole/lancer.js explorer` pour voir les écrans.
2. Copier le scénario le plus proche, adapter les clics et la réponse simulée.
3. Lancer avec `DEBUG=1`, corriger le scénario jusqu'à ce qu'il traverse toute la voie.
4. Ajouter la chaîne de « Retour » et les variantes (largeur 375).
5. Rédiger le rapport : constats (avec preuve), puis améliorations proposées avec coût.

## 7. Limites connues

- Les vraies fenêtres du navigateur (ouverture d'un onglet de l'assistant, presse-papiers, glisser-déposer d'un fichier, téléchargement) sont simulées ou contournées : elles restent à vérifier à la main.
- Le rendu visuel (alignements, couleurs, mode sombre) n'est pas jugé par ce protocole.
- Le protocole est volontairement séparé de `parcours_smoke.js` (qui vérifie qu'un parcours s'ouvre) : il est plus lent et plus profond.

## Ajouts du 12/11/2026 : la reprise d'un module
- `E.mesureReprise` mesure, sur la présentation puis sur la page de travail : forme de l'encart (A : sur la présentation, « Recommencer » seul, comme « Reprendre mon CV » ; B : sur la page de travail grisée, ancienne forme), place de « Reprendre » (bas à droite, même ligne que Retour et Accueil, Accueil au centre à partir de 700 px).
- `E.retourPuisReprendre` signale un écart tant qu'un module n'a pas la forme A (consigne 258).
- `E.testerRecommencer` : « Recommencer » demande une confirmation, « Annuler » garde le travail, la confirmation remet la présentation à froid.
- Contrôle sur CHAQUE écran contrôlé : tous les boutons de la barre du bas sont sur une seule ligne.
