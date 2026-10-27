# Parcours rejoués avec de vrais clics (Playwright), 26/10/2026

Lancer le serveur de développement (`serveur_dev.py`, port 8123), puis : `node docs/mesures_2026-10-26/parcours_reels/p1_main.js` (etc.). Variables : ``CAPTURES` (dossier des captures d'écran).
`lib.js` : ouverture du navigateur (onglet de l'assistant simulé, presse-papiers autorisé), relevé de l'écran après chaque clic (route, titre, barre d'étapes, boutons du bas).
`saisies*.js` : saisies communes (objectif, identité, expérience, 4 questions, réponse de l'assistant collée par le vrai bouton « Coller la réponse »).
p1 = Créer à la main, p2 = Créer avec l'assistant, p3 = À partir de mon récit.
Ce sont des outils de développement, jamais chargés par l'application. Ils modifient le dossier du navigateur de test (jamais une vraie session).
p4_docs = Reprendre voie 1 (garder et compléter), p4_debug/p4_fichier = dépôt par texte ou par fichier (variable `DEPOT=texte` ou `fichier`), p5_voie2 = Reprendre voie 2 (reformuler), p6_voie3 = voie 3, p7_rapide = lettre rapide (`p7_rapide_t.js` avec dépôt par texte), p8_entretien_rapide = entretien rapide.
