# Faisabilité chiffrée : « Découvrir mes compétences » (audit du code réel)

Mode A, `[effort : haut]`. Date : 26/10/2026. Étape 2 de la méthode (après le concept grossier validé). Tout ce qui suit vient d'une lecture du code réel (`js/app.js`, `data/metiers.js`, `data/baseConnaissancesERIP.js`, `modules/*`, `index.html`, `docs/BRIQUES_COMMUNES.md`), pas d'une supposition.

## Verdict : GO. Aucun point bloquant, un point d'architecture à trancher à l'audit final

Le risque jugé « élevé » à l'audit des frontières (toucher la forme du dossier) **tombe à moyen** : il existe un patron éprouvé qui évite de toucher à `dossier` (voir 2). Le risque principal est maintenant l'écran de relecture (le plus gros morceau d'interface) et le passage avec l'assistant (voir 4).

## Ce qui est simple (reprise de l'existant)

| Besoin | Brique réelle | Remarque |
|---|---|---|
| Déposer un CV, une lettre de motivation, une lettre de recommandation (PDF, Word, photo, texte, masquage) | `ouvrirAssistantDepotCV(mode, { titre, intro, titreDocument, onDocumentPrepare, onRetourEtape1, nomsInitiaux })` (`data/metiers.js`), déjà utilisée pour la lettre de recommandation (`_coLettreDeposerReco`) et la lettre de motivation (`_prepaEntretienDeposerLettre`) | **Piège connu à reproduire** : sauvegarder puis remettre `dossier.cvTexte` et `dossier.cvAnalyse` autour de l'appel, sinon un dépôt écrase le CV de la personne (les deux appelants le font). `nomsSignatureLettreCo` sert pour masquer le nom du signataire. |
| CV déjà dans l'application | `obtenirOuDeposerTexteCV` : une carte « Utiliser mon CV déjà enregistré » évite un dépôt | à proposer en premier |
| Prompt chargé avec `{{VOIX_HUMAINE}}` | `FICHIERS_PROMPTS_EXTERNES` (`js/app.js`) : le remplacement se fait tout seul au chargement | une ligne : `mesCompetences: 'prompts/mes-competences.md'` |
| Lire la réponse | `extraireBlocJSONDepuisTexte(texte, accepterTableau)` (`js/app.js`) + réparation du JSON (B.20) | le filet de sécurité vient ensuite |
| Message à copier | patron `construireMessageLettreCo` (fonction pure, testée) | à écrire : sections `DOCUMENT n` dans le format que le prompt cite |
| Page d'introduction | `htmlPageIntroModule` (B.5) | |
| Retour du navigateur | brique B.24 | à brancher |
| Mode sombre, aide | `AIDE_PAGES` (`js/app.js`) | |

Taille du message : prompt 19 932 caractères + documents (3 CV, 2 lettres de motivation, 3 recommandations au plus, environ 25 000 caractères) : environ 45 000, sous le précédent de `lettre-co.md` (56 636). Prévoir un plafond de sécurité avec message clair.

## Ce qui est moyen (code nouveau mais sur un patron connu)

1. **Écran de relecture** (cartes, trois gestes, familles, « Ce qui me donne envie »). Gestes voisins existants (retrait réversible de « Votre profil »). Le plus gros morceau d'interface : `[effort : haut]`.
2. **Sauvegarde dans la disquette sans toucher à `dossier`** : patron des modules récents (`mgExporterEtatPourSauvegarde`, `ucpmExporterEtatPourSauvegarde`...). Trois points de branchement dans `js/app.js` : `collecterEtatsModulesPourSauvegarde()`, `restaurerEtatsModules()` et `recommencer()`. **Conséquence sur la décision Q2** : l'objet est bien gardé et relu plus tard par d'autres modules, mais par une fonction de lecture (`mesCompetencesObtenir()`) et non par le champ `dossier.mesCompetences`. Même effet pour la personne, beaucoup moins de risque pour les autres écrans.
3. **Filet de sécurité** : le vérificateur du banc d'essai (`scripts/essaiMesCompetences/verifier.js`, 270 lignes, **JavaScript pur sans dépendance**, déjà couvert par 19 tests) devient la source unique, déplacée dans le module et utilisée aussi par le banc d'essai. À adapter : mode sans profil d'essai (les « attendus » n'existent pas dans l'application), messages en français pour la personne.
4. **Second passage « lignes seules »** : message plus court, l'application remet les lignes à leur place grâce à un `id` par ligne à préciser (ajout au prompt à essayer).
5. **Document « Mes compétences »** : PDF par `imprimerLettrePdf(constructeurHtml, titre)` (patron de la fiche d'entretien), Word par `chargerLibrairieDocxNatif` (patron `exportDocxNatifEntretien.js`, environ 150 lignes), texte à copier. Proposition : PDF et texte d'abord, Word dans un second temps si Denis le veut tout de suite.
6. **Recherche et Lexique** : voir 7.

## Ce qui est risqué ou à trancher

1. **Passage avec l'assistant** (choix, « chez l'assistant », collage) : la logique en trois vues (`modules/un-cv-plusieurs-metiers/passageAssistant.js`) est **propre à ce module** (B.10 / B.17, dette connue). Deux voies : (a) la généraliser pour qu'elle serve aussi ici (état passé en paramètre) : une seule source, mais on touche à quatre passages existants, à couvrir par les essais navigateur actuels ; (b) en écrire une version propre avec les mêmes composants communs (`htmlChoixAssistantBilanCorps`, `ouvrirFenetreAssistantIA`, `htmlBanniereTransitionIA`, `htmlCollageInstantane`) comme l'ont fait d'autres modules, ce qui ajoute une copie à la dette. **Recommandation : (a)**, décision finale à l'audit final avec le code ouvert.
2. **Collision de noms** : la recherche de l'accueil (`data/baseConnaissancesERIP.js`, entrée de « À partir de mon récit ») porte déjà les mots `decouvrir mes competences`, `mes competences`, `competences`. À **déplacer vers la nouvelle entrée**, sinon la recherche enverrait les gens vers le mauvais parcours. Identifiants à ne pas réutiliser : `decouverte`, `decouverte-intro`. Nouveaux : `mes-competences-intro`, `mes-competences`, préfixe de fonctions `mesComp`. Des commentaires du code appellent encore l'ancien module « Decouvrir mes competences » (`data/metiers.js` 4636 et 11616, `js/app.js` 4049...) : à corriger au passage pour éviter une confusion future (leçon 9.33).
3. **Fatigue de relecture** (jusqu'à 14 lignes) : se règle à la maquette (présentation des mieux prouvées d'abord).
4. **Test navigateur obligatoire** : `modules/*/ui.js` et `js/app.js` ne sont pas chargés par les tests Node. Les fonctions pures (message, lecture, filet, rapprochement du second passage, document) le sont et se testent à fond ; l'interface passe par `scripts/parcours/parcours_smoke.js` (un essai dédié) et la preuve en navigateur.

## Plan par étapes (un commit par sous-étape, `npm test` vert avant chaque suivante)

| # | Étape | Effort |
|---|---|---|
| 1 | Module `modules/mes-competences/` : logique pure (documents, message, lecture, filet déplacé du banc d'essai, second passage, document) + tests | haut |
| 2 | Page d'introduction, entrée Boîte à outils, routes, aide, `index.html`, `FICHIERS_PROMPTS_EXTERNES` | moyen |
| 3 | Dépôt des documents et niveau du poste | moyen |
| 4 | Passage avec l'assistant (voie (a) ou (b)) | haut |
| 5 | Écran de relecture et second passage | haut |
| 6 | Document « Mes compétences » et exports | moyen |
| 7 | Sauvegarde disquette + `recommencer` (3 lignes dans `js/app.js`, grep sur tout le dépôt) | moyen |
| 8 | Recherche accueil, Lexique (2 à 3 fiches), Nouveautés, journal des changements | bas |
| 9 | Essais navigateur (clair et sombre, 0 erreur console), essai `parcours_smoke` | haut |

**Mode nuit : NON APTE** tant que la maquette n'est pas validée (et l'étape 4 demande un choix d'architecture à voir code ouvert).

## Prochaine étape
Maquette détaillée en HTML, écran par écran, avec les questions de Denis avant tout code.
