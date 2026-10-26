# Audit réel de toutes les cartes de l'accueil (26/10/2026, Mode A, `[effort : haut]`, rien codé)

Demande de Denis : mener, sur chaque carte de l'accueil, le même contrôle que sur « Mes documents » (parcours rejoués avec de vrais clics, relevé des dysfonctionnements), puis regrouper les corrections pour qu'elles profitent à toute l'application. Les corrections se feront en local, avec les tests en direct ; ce fichier sert de base. Le cahier détaillé de « Mes documents » est `docs/CHANTIER_VOS_DOCUMENTS_COHERENCE_2026-10-26.md` ; la conception du lot 5 est `docs/CONCEPTION_REGISTRE_FAMILLES_VOS_DOCUMENTS_2026-10-26.md`.

## Méthode (la même partout)
1. Serveur `serveur_dev.py` (port 8123), navigateur sans fenêtre (Playwright), vrais clics, vraie frappe, vrai presse-papiers pour « Coller la réponse », vrai choix de fichier pour le dépôt du CV. Les réponses de l'assistant sont des réponses de test valides ; l'assistant n'est jamais appelé.
2. À chaque écran : route, titre, barre d'étapes, boutons du bas, et des **contrôles automatiques** (`docs/mesures_2026-10-26/parcours_reels/controles.js`) : tiret cadratin ou demi-cadratin visible, mot « IA » ou tête de robot visible, emoji de visage, débordement horizontal, contraste du texte (mode clair et mode sombre).
3. Les constats portent des identifiants (C1 à C24 pour « Mes documents », D1... pour cette suite) et sont repris dans la synthèse transversale (section finale).

Les huit parcours de « Mes documents » ont aussi été rejoués en mode clair et en mode sombre avec ces contrôles (résultats : section « Contrôles automatiques »).

## Carte 1 : Mes documents
Voir le cahier dédié (8 parcours, constats C1 à C23, défaut C18).

## Carte 2 : Me préparer à candidater (3 entrées : lettre, entretien, employeurs)
### Écrire ma lettre avec l'assistant (`co-lettre`)
Écrans : présentation > **Préparer** (un seul écran qui se déplie : 1 Votre CV [dépôt], 2 Votre candidature [6 cartes d'objectif, métier, présentation générale ou entreprise précise, type de structure, disponibilité, Vos appuis], Adaptation au métier [situation actuelle]) > **Assistant** (choix de l'assistant, fenêtre « Avant de continuer », « En attente de votre lettre de motivation », « Je suis de retour », « Coller la réponse ») > **Vos documents** (barre « Terminé ») > Valider la lettre > export > « Merci bien, j'ai fini » : **retour direct à l'accueil**.
- **D1** : « Continuer » reste grisé tant que la situation n'est pas indiquée dans « Adaptation au métier » ; le message (au survol) le dit, mais la section se trouve plus bas sur la page : la personne ne sait pas où regarder. Même schéma dans « M'entraîner à un entretien ».
- **D2 (précise C11 et C13)** : sur « Vos documents » (lettre), tant que les coordonnées ne sont pas enregistrées, la barre du bas n'a **aucun bouton principal** (seulement Retour et Accueil) ; le seul indice est le cadre orange « Vos coordonnées ont été repérées dans votre CV : vérifiez-les ». Une fois enregistrées : « Valider la lettre ». Le titre reste « Vos documents », alors que la personne a écrit une lettre.
- **D3** : après la lettre avec l'assistant, la suggestion proposée est « Ma fiche de préparation à l'entretien » (la **version rapide**, du parcours « Lettre et entretien en version rapide »), alors que la personne vient de faire le parcours approfondi et que « M'entraîner à un entretien » existe. Le chemin approfondi n'est pas proposé.
- **D4 (rappel de C16)** : « Continuer » est dans la barre du bas partout sur ce module (conforme à la règle).
### M'entraîner à un entretien (`prepa-entretien`)
Écrans : présentation > Préparer (CV, objectif, situation) > Assistant (choix, fenêtre « Avant de continuer », « En attente de votre préparation d'entretien », « Coller la réponse ») > Vos documents (« Votre préparation d'entretien », barre « Terminé ») > « Continuer » (qui valide) > export > « Merci bien, j'ai fini » : **fenêtre « Merci, tout est en ordre ... toutes les informations de cette session vont être effacées »** (Annuler / Terminer).
- **D5 (précise C11)** : le bouton principal de « Vos documents » s'appelle « Continuer » pour l'entretien, « Valider la lettre » pour la lettre, « Valider le CV » pour le CV : trois libellés pour la même action. Après validation, « ← Modifier l'entretien », « ← Modifier la lettre », « ← Modifier le CV ».
- **D6** : la suggestion proposée après l'entretien est « Écrire ma lettre avec l'assistant » (approfondie), alors que la lettre propose la fiche d'entretien **rapide** (D3) : les deux sens ne sont pas symétriques.
- **D7 (précise C17)** : l'entretien est le seul parcours dont la fin parle d'**effacer** les informations de la session. Le texte rassure (« vous pourrez les restaurer depuis la page d'accueil »), mais le mot « effacées » dans une fenêtre de fin est inquiétant pour le public cible.
### Employeurs près de chez moi (module « Qui fait quoi », fermé au public, visible en local)
- **D8** : la tuile s'appelle « Employeurs près de chez moi » ; après « Voir les employeurs », le titre de la page est « **Qui fait quoi** » : deux noms pour la même chose. Le module est fermé au public (`MT_OUVERT = false`) : à traiter avec la carte « Se tenir informé ».
