# Plan général après la décision du 14/11/2026 (consigne 283)

**Finalité du module de création et de reprise de CV, en une phrase** : aider la personne à obtenir un CV fidèle à son parcours et à sa personnalité professionnelle, avec ou sans assistant. Les trois questions du parcours (avec qui ou quoi, actions, lieux) ne servent qu'à proposer des métiers proches : elles ne sont pas la finalité (leçon 9.158).

Chaque chantier ci-dessous est étiqueté `[effort : …]`. Règle de méthode : audit du code réel, puis maquette et questions à Denis, puis code, jamais l'inverse.

## Chantier 0 : famille « Cuisiner et servir » `[effort : bas]` : FAIT le 14/11/2026

« Cuisiner » quitte « Fabriquer et construire » ; nouvelle famille avec « Cuisiner », « Servir à table ou au comptoir » et « Préparer des boissons » ; 15 fiches de restauration étiquetées (serveur, barman, barista, sommelier, chef de rang, maître d'hôtel, steward de train, personnel navigant…) ; compétences « Service en salle », « Préparation de boissons », « Rapidité » ajoutées au lexique. Vérifié : tests (2 785 verts), parcours dans le navigateur. Journal tenu à jour. Pas de ligne « Nouveautés » (pas une fonction nouvelle pour le public).

## Chantier 1 : étape « Vos missions et compétences » par expérience, pour créer ET pour reprendre un CV `[effort : haut]`

**Étape 1.1 : maquette cliquable (prochaine étape, à commencer tout de suite)**
- Où : entre « Votre parcours » et « Votre profil » dans la création du CV.
- Quoi : pour chaque expérience saisie, la fiche du métier trouvée (avec « choisir une autre fiche »), les missions de la fiche à cocher (modifiables, avec « ajouter la mienne »), les compétences de la fiche à cocher (savoir-faire, savoir-être, savoirs). Données réelles du ROME (`data/rome/fiche_*.js`, champs `m`, `k`, `s`).
- Questions à poser à Denis avec la maquette : combien de missions proposées d'un coup, ordre, présentation sur mobile, ce qui se passe si aucune fiche ne correspond, bouton « passer cette étape ».

**Étape 1.2 : audit de la reprise d'un CV (à faire avant de placer l'écran)**
- Trois voies existent dans « Reprendre mon CV » : « Mettre à jour mon CV » (garder et compléter, `modeCreation = 'maj'`), « Reformuler et présenter mon CV » et « Le refaire moi-même dans un modèle ». Il faut lire le code de chacune, voir où les missions et compétences sont déjà modifiables, et proposer l'endroit : très probablement « Mettre à jour mon CV » (bouton « Enrichir mes missions et compétences ») et la troisième voie ; la reformulation par l'assistant en profiterait aussi (prompt resserré).
- Même écran partout : une seule brique commune (règle « une seule source de vérité », `BRIQUES_COMMUNES.md`), jamais copiée.

**Étape 1.3 : codage en lots, un commit par lot, test navigateur à chaque lot**
1. Chargement de la fiche d'un poste (`chargerFicheRome`) et rattachement poste vers fiche (déjà en place : `ficheDeIntituleChoisi`).
2. Écran par expérience, écriture dans `dossier.experiences[i].missions`, `competencesCV`, `savoirEtreCV`, `savoirsCV`.
3. Branchement dans la création, puis dans la reprise.
4. **Prompt allégé** : mesurer d'abord sur le prompt réel (`prompts/cv.md`) ce que l'assistant devine aujourd'hui et que la personne a maintenant choisi ; resserrer sans baisser les quantités demandées ; essais comparés.
5. Recherche (accueil et Lexique), vidéos et images à refaire, journal, ligne « Nouveautés » à l'ouverture publique.

Risques : cases cochées sans avoir fait la mission (libellé prudent, tout modifiable) ; missions à la 3e personne (à vérifier sur un échantillon) ; CV qui se ressemblent (champ « ajouter la mienne » en permanence).

## Chantier 2 : refaire la maquette de la page « Votre parcours » (les trois questions) `[effort : moyen]`

- Rôle clarifié dans l'écran : « ces trois questions servent à vous proposer des métiers proches de ce que vous avez fait » ; une seule liste, sans présenter les métiers exercés.
- Disposition ergonomique, moderne, un peu ludique sans être enfantine (cartes avec pictogrammes d'objets, jamais de visages ; progression ; résumé « ce que je retiens » visible ; animations douces désactivables) ; réutiliser la maquette `docs/MAQUETTE_CHOIX_PAR_EXPERIENCE_2026-11-13.html` comme base visuelle (la partie validée : les trois questions) et en retirer le sélecteur d'expérience.
- Plafonds : à rediscuter avec la maquette (aujourd'hui 16, 16, 12 ; Denis pense qu'il faut peut-être plus pour les actions). Mesure à refaire avant de relever (le calcul de score ne doit pas gonfler les résultats).
- Zéro régression fonctionnelle : mêmes champs (`dossier.activites`, `.actions`, `.environnement`), mêmes catalogues, mêmes consignes de maximum.

## Chantier 3 : futur module « Trouver un métier » (découverte et orientation) `[effort : haut]`

- Finalité en une phrase à valider avec Denis : « aider une personne qui ne sait pas quel métier faire à en découvrir, d'après ce qu'elle aimerait faire ».
- Même système de choix, reformulé en envies (« Préférez-vous travailler avec des personnes, des matériaux, des animaux ? », actions et lieux souhaités), mêmes catalogues et mêmes composants que le chantier 2 (une brique commune, aucune duplication).
- **RIASEC** : les fiches du ROME portent déjà les lettres RIASEC de chaque métier (champ `ri`, déjà affiché sur la fiche d'un métier). À mesurer : couverture (combien de métiers), et à proposer : un court questionnaire RIASEC dans l'application, dont le résultat sert de signal supplémentaire au classement.
- Autres tests et outils : à lister avec Denis (cahier de départ à écrire avant toute maquette).
- Dépend du chantier 2 pour les composants ; indépendant du chantier 1.

## Chantier 4 : restes du chantier « une seule source de choix » (consigne 280) `[effort : moyen]`, sans urgence

- Relecture par Denis d'un échantillon de 40 descriptions (feuille à préparer).
- Statistiques par secteur sur toutes les fiches (`competencesFrequentesDuSecteur`, `secteursDisponibles`, `exemplesMetiersDuSecteur`) : audit avant.
- Retirer `promouvoirFiche`, ranger les listes des 135 fiches à la main dans la même structure.
- Deux petites décisions de Denis : « Chef d'équipe » (M1302, mauvais code) et le sens d'« Agent de tri ».
- Étiqueter « servir » sur d'autres fiches si Denis en trouve (contrôle sur un échantillon de la restauration).

## Ordre conseillé

1. Chantier 1, étape 1.1 (maquette de l'étape missions et compétences) : demandée par Denis pour la suite immédiate.
2. Chantier 1, étape 1.2 (audit de la reprise).
3. Chantier 2 (maquette de « Votre parcours »), puis chantier 3 (cahier de départ, puis maquette), qui réutilise ses composants.
4. Chantier 1, étape 1.3 (code) après validation des maquettes ; chantier 4 au fil de l'eau.

Rappel : passer l'effort sur « haut » pour les chantiers 1 et 3.
