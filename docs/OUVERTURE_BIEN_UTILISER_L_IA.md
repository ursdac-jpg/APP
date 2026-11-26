# Ouverture au public de « Bien utiliser l'IA » : OUVERT le 25/11/2026

> **État au 25/11/2026 : le module est ouvert** (interrupteur à true, ligne dans les Nouveautés, journal, tâche de relecture à six mois : commit 9e24b117). **Le point 6 (introduction générale) est FAIT le 25/11/2026** : la page et le diaporama présentent « Ce qui compte pour moi » et « Bien utiliser l'IA » dans un second groupe « Pour mettre des mots et mieux demander », et la vidéo d'introduction est refaite (voir `docs/JOURNAL_DES_CHANGEMENTS.md`). Le texte ci-dessous est conservé comme historique de la préparation.

Décision de Denis, 24/11/2026 (option 1) : tout est préparé, l'interrupteur reste **fermé** (`BUIA_OUVERT = false`) tant que Denis n'a pas fini ses vérifications. Le jour de la mise en ligne, appliquer la liste ci-dessous (cinq changements, quelques minutes). Rien de ce qui suit ne doit être fait avant.

Pourquoi fermé : un envoi sur GitHub, même fait par une autre séance, ouvrirait le module d'un coup. Et la ligne « Nouveautés » affiche « Nouveau » pendant 7 jours à partir de sa date : posée trop tôt, elle serait déjà vieille.

## Avant d'ouvrir (à la charge de Denis, ou à décider avec Claude)

1. Essais sur le modèle 4 « Comprendre un courrier reçu » avec les courriers C, A, B, puis au moins dix phrases réelles.
2. FAIT le 24/11/2026 : les deux affirmations du chemin 1 (exemples dans la demande, conservation des conversations) sont sourcées (voir « Sources relues » dans `docs/CHANTIER_BIEN_UTILISER_L_IA_ENRICHISSEMENT.md`).
3. L'enrichissement est en cours (consignes 596, 598, 599) : le chemin 4 « Je veux savoir comment il fonctionne » est codé le 24/11/2026, fermé comme le reste. Les ajouts de la consigne 598 aux chemins 1 et 3 sont codés le 24/11/2026 (questions d'aide « pour qui ? pourquoi ? » et trois techniques ; le « rôle réaliste » reste exclu tant qu'aucune source solide ne l'appuie). Les fiches Copilot, Gemini, Le Chat et DeepSeek ont été relues sur les pages officielles le 24/11/2026 (`BUIA_C4_DATE_MAJ` reste « 24/11/2026 », champ `source` de chaque fiche) ; à revoir tous les six mois. Nom affiché de « Le Chat (Mistral) », devenu « Vibe » : Denis garde « Le Chat » (décidé le 24/11/2026). Trancher si l'ouverture attend le reste de l'enrichissement.
4. `BUIA_C2_PROPOSER_NON_REDIGES` n’a plus d’objet depuis le 24/11/2026 (les treize modèles sont rédigés) : l’interrupteur peut être laissé tel quel.
5. Vidéos : FAIT le 25/11/2026, cinq vidéos (présentation du module et un film par chemin, clés `bien-utiliser-ia`, `bien-utiliser-ia-comprendre`, `-fonctionne`, `-modeles`, `-ecrire`, scénarios dans `docs/video_presentation/court/scenarios/`). Les films montrent les écrans à cette date : si un écran change, rejouer le scénario concerné (`node fabriquer.js <scénario>`). Reste à Denis de les regarder.
6. Valider l'écart avec la maquette : dans l'écran Améliorer du chemin 3, les corrections « but » et « situation » demandent une courte précision écrite.

## Le jour de l'ouverture : les cinq changements

1. **Interrupteur** : `modules/bien-utiliser-ia/index.js`, `var BUIA_OUVERT = false;` devient `true`.
2. **Test de fermeture** : `tests/bienUtiliserIaLogique.test.js`, le test « le module est fermé au public » (vers la ligne 101) doit être remplacé par un test qui exige `BUIA_OUVERT = true` et la présence de la ligne dans `data/nouveautes.js`.
3. **Nouveautés** : ajouter cette ligne tout en haut de `var NOUVEAUTES = [` dans `data/nouveautes.js`, en mettant la date du jour de l'ouverture à la place de la date ci-dessous (contrôlée par un essai à blanc le 24/11/2026 : `tests/nouveautes.test.js` passe, l'exception du nom du module est déjà en place) :

```
  { date: '2026-11-24', titre: 'Bien utiliser l’IA : apprendre à demander clairement à un assistant en ligne', texte: 'Un nouveau module de la Boîte à outils vous aide à écrire une demande claire à un assistant en ligne, pour une démarche, un courrier, une recherche d’emploi ou n’importe quel sujet, et à vérifier sa réponse. Trois chemins : comprendre, partir d’un papier ou d’une situation, ou écrire la vôtre. Rien n’est enregistré sur l’appareil, sauf les demandes que vous ajoutez vous-même à votre disquette.', route: 'bien-utiliser-ia', icone: 'bi-chat-left-text', module: 'Bien utiliser l’IA', carte: 'Boîte à outils' },
```

4. **Journal** : dans `docs/JOURNAL_DES_CHANGEMENTS.md`, passer la ligne « Bien utiliser l'IA » de « fermé » à « fait le AAAA-MM-JJ » (date de l'ouverture).
5. **Relecture tous les six mois** : ajouter dans `outils/taches_programmees.json` une tâche (date = six mois après l'ouverture, `estimee: false`) : « Bien utiliser l'IA : relire le contenu qui vieillit vite » ; quoi : relire les affirmations sur les assistants (conservation des conversations, recherche sur le web, réglages de confidentialité), les fiches du Lexique « Numérique et assistants en ligne » et, si l'enrichissement a eu lieu, les spécificités datées de chaque assistant ; fichiers : `data/buiaComprendre.js`, `prompts/bien-utiliser-*.md`, les 17 fiches de `data/lexique.js` (univers `numerique-assistants`).
6. **Introduction générale de l'application** (oubli trouvé le 25/11/2026) : `modules/introduction/logique.js`, bloc « La boîte à outils » (titre, « Quatre outils », liste des modules, notes) et le diaporama : passer à cinq outils et ajouter « Bien utiliser l'IA » avec sa vidéo (`modules/introduction/video.js`). Vérifier aussi les tests qui comptent les outils de la boîte.

Ensuite : `npm test` entièrement vert, `node scripts/checkLexique.js` à 0 erreur, vérification au navigateur depuis la carte « Boîte à outils » de l'accueil, puis un commit. L'envoi sur GitHub se fait seulement à la demande de Denis.
