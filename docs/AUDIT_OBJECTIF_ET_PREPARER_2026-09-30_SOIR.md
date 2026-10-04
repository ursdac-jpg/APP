# Audit du code (2026-09-30, soir) : points N1, N6, N7, N8

Lecture du code seulement, rien modifié, rien testé dans le navigateur. Fichiers lus : `data/metiers.js` (page « Préparer », `_reformulerCvVersModele`, identité captée), `js/app.js` (`pageObjectif`, `OBJECTIF_CHOIX_CANDIDATURE`, `definirObjectifCandidature`, `etatAccesRevelation`).

## N1. Nom et prénom inversés : cause trouvée
`_nomPrenomCertainsDepuisEmail` (`data/metiers.js:2599`) : quand les deux mots du courriel se retrouvent côte à côte dans le CV, le **premier mot rencontré dans l'ordre du courriel est pris pour le prénom** (ligne 2607), et le mot rencontré à l'envers l'est aussi selon l'ordre du courriel (ligne 2609). Le courriel ne dit rien de l'ordre : la règle « prénom d'abord » est une supposition. Correctif proposé : trancher par la casse (le mot tout en majuscules est le nom, l'autre est le prénom) ; si les deux mots ont la même casse (« Dupont Marie », « MARIE DUPONT »), ne rien pré-remplir et garder une suggestion cliquable. Les fonctions `majuscule` / `propre` existent déjà dans la même fonction. Petit correctif, un test à ajouter. Effort `medium`.

## N6. Le « deuxième point » de la page « Préparer » (Relire, vérifier, corriger, masquer)
Constat : c'est bien le bloc 2 de `htmlPreparerLettreEntretienDepliante` (`data/metiers.js:7647`). Après le dépôt ou le collage, la relecture s'ouvre **toute seule** (`ouvrirRelecturePrepLE`, ligne 7866 et 7889). Le bloc ne reste donc qu'un état (« Relu et validé ») et un bouton « Ouvrir la relecture ». Denis a raison.
- Attention, pas de suppression sèche : (1) la page est **partagée par trois parcours** (Reformuler, Mettre à jour, Lettre et entretien à partir d'un CV prêt) ; (2) le bloc 3 est verrouillé tant que `relectureFaite` est faux (ligne 7818), ce verrou doit rester ; (3) il porte la vidéo de démonstration « masquage-texte » et le seul moyen de **relire à nouveau le même CV** sans le redéposer ; (4) des textes y renvoient (« parties 1 et 2 ci-dessus », ligne 7754, messages de verrou).
- Proposition : retirer le bloc numéroté, garder un petit bouton « Relire à nouveau et masquer » dans le bloc 1 une fois le CV déposé, déplacer la vidéo à côté. Les blocs se renumérotent seuls.
- **Point à vérifier au navigateur** : la photo ou le scan appellent `ouvrirAssistantDepotCV('pret')` (ligne 7859) quel que soit le parcours (Reformuler, Mettre à jour). À tester : cela ne doit pas faire changer de parcours.

## N7 et N8. Objectif de candidature déplacé au début, avec stage, alternance, immersion, formation
Ce qui existe déjà :
- Le choix de situation existe en **6 cartes** (`OBJECTIF_CHOIX_CANDIDATURE`, `js/app.js:5149` : offre, spontanée, changer de métier, stage, alternance, immersion). **Pas de « formation ».**
- Il est déjà posé **au début** dans le Bilan (bloc « Votre situation »), Cohérence, Co-construire ma lettre et Préparer l'entretien : le principe « situation d'abord » existe déjà quatre fois. Reformuler est l'exception : la matrice du 2026-09-29 avait retiré la situation, parce que le prompt ne la lisait pas.
- Dans Reformuler, le bloc 3 de « Préparer » demande déjà métier ou domaine + offre (panneau partagé). `_reformulerCvVersModele` (ligne 7083) les reporte dans le dossier, puis fait `naviguerVers('objectif')`.
- « Votre objectif » n'est donc **pas** une ressaisie du métier (il arrive pré-rempli). Ce qui est neuf et arrive trop tard : les 6 cartes de situation, puis l'ensemble du panneau (entreprise, site, structure, civilité, couleur) et « Le poste que vous recherchez » (contrat, temps de travail). C'est ce que Denis ressent comme « on redemande ».

Ce qui est vrai dans le sens de Denis :
- Le prompt de Reformuler (`_reformulerCvContexteTexte`, ligne 6080) ne reçoit **ni la situation ni rien sur une formation** : une personne qui vise une formation obtient un vocabulaire calibré emploi.
- Défaut probable (à confirmer au navigateur) : choisir Stage, Alternance ou Immersion sur « Votre objectif » **vide** `modeRecherche`, `typeRecherche` et toute `rechercheCandidature`, y compris l'offre saisie à « Préparer » (`definirObjectifCandidature`, lignes 5170 à 5184). Il détruit donc ce qui a été donné juste avant.
- `etatAccesRevelation` (ligne 8250) bloque « Continuer » tant que le mode de recherche n'est pas choisi, sauf pour stage, alternance et immersion : une personne en formation ne rentre dans aucune case.

Faisabilité, en clair :
- **Facile** : ajouter les 6 cartes de situation au début de Reformuler (brique existante, comme le Bilan), écrire la situation dans `dossier.objectif`, la transmettre dans le prompt, ne plus redemander la situation ensuite.
- **Moyen** : retirer l'écran « Votre objectif » de la fin de Reformuler. Il faut que le reste du parcours (Vos informations, mise en page) ne dépende plus de lui : `dossier.objectif` est lu à **78 endroits** et plusieurs listes en dur `['stage','alternance','pmsmp']`. Il faut inventorier ce que l'écran alimente encore (entreprise, site, civilité, couleur, contrat) avant de le retirer.
- **Risqué** : ajouter « Formation » comme 7e objectif partout. Il n'a ni branche « offre » ni branche « immersion » (structure d'accueil, calendrier) ; le nom `dossier.formation` frôle `dossier.formations` (le tableau des diplômes) ; les 6 endroits qui dessinent les cartes (`pageObjectif`, Bilan, Cohérence, lettre, entretien, Découverte) sont des copies à faire évoluer ensemble. À découper : d'abord Reformuler seul, la formation ensuite avec sa propre maquette.

Décisions attendues de Denis avant maquette : voir la réponse dans le chat (résumé de ce document).

## Non audité
N2 (barre au milieu qui écrase « Accueil »), N3 (« Continuer » mène à la fin), N4 (ordre chronologique), N5 (certifications dans une expérience) : pas encore ouverts. À faire au prochain passage.
