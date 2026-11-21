# Audit de « M'entraîner à un entretien » (carte « Me préparer à candidater », 2e module) (2026-11-21)

Mode B, effort moyen. Profil inventé « Camille Martin ». Réponses de l'assistant SIMULÉES (JSON collé, y compris une réponse coupée puis complète).

## Joué
- Dépôt du CV, question « Avez-vous une lettre de motivation ? » (Oui avec dépôt, relecture, masquage, enregistrement ; Non), type de candidature (les sept objectifs), métier précis, entreprise précise ou non, situation actuelle, choix de l'assistant, collage (coupé puis complet), mise en page, export. « Retour », « Revoir la présentation ».

## Résultat
Aucun blocage. Les sept parcours vont jusqu'à « Votre préparation d'entretien ». Message : environ 22 500 caractères (avec la lettre déposée : 22 800). Objectif, entreprise, site, offre, civilité et nom du recruteur, structure, durée, dates, heures, CV et lettre déposés arrivent dans le message. La lettre déposée part bien dans une section « Lettre de motivation déjà rédigée par la personne ». Le prompt demande une séance par échanges et une fiche JSON finale : l'écran de fin est cohérent.

## Défaut corrigé
Aucun propre à ce module. Les savoirs devinés (transport, hôtellerie) corrigés pour la version rapide valent aussi ici (même fonction).

## Choix tranché par Denis, corrigé le 2026-11-22
Stage, alternance, immersion : le champ « Métier ou domaine visé » est affiché sur cette page et sur « Écrire ma lettre avec l'assistant » quand le métier n'est connu nulle part ailleurs, et « Continuer » reste grisé tant qu'il est vide (option A). Joué au navigateur sur les deux pages (stage, immersion, alternance : bloqué vide, débloqué rempli, rebloqué si on vide). Entrée ajoutée dans les bugs.

## Notés, non corrigés
- Le masquage de la lettre ne retire un nom que s'il est recoupé avec l'e-mail du texte (voulu : « rien n'est masqué à votre place »).
- La ligne « Pour une lettre de motivation, utilisez... » apparaît aussi dans le message de l'entretien (sans conséquence).

## Non vérifié
375 px, mode sombre, dépôt par fichier, vraies réponses de l'assistant, séance par échanges réelle.
