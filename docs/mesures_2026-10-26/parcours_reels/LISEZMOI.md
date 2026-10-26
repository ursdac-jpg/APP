# Parcours rejoués avec de vrais clics (Playwright), 26/10/2026

Lancer le serveur de développement (`serveur_dev.py`, port 8123), puis : `node docs/mesures_2026-10-26/parcours_reels/p1_main.js` (etc.). Variables : `URL_APP` (défaut `http://localhost:8123`), `CAPTURES` (dossier des captures d'écran).
`lib.js` : ouverture du navigateur (onglet de l'assistant simulé, presse-papiers autorisé), relevé de l'écran après chaque clic (route, titre, barre d'étapes, boutons du bas).
`saisies*.js` : saisies communes (objectif, identité, expérience, 4 questions, réponse de l'assistant collée par le vrai bouton « Coller la réponse »).
p1 = Créer à la main, p2 = Créer avec l'assistant, p3 = À partir de mon récit.
Ce sont des outils de développement, jamais chargés par l'application. Ils modifient le dossier du navigateur de test (jamais une vraie session).
