# Résultats des essais de « Bien utiliser l'IA » (25/11/2026)

Essais faits par Claude à la demande de Denis (« tu peux aller vérifier et faire le test toi-même »), avec ChatGPT sans compte dans le navigateur intégré. Les demandes ont été assemblées par le code du module (mêmes fichiers `prompts/bien-utiliser-modele-N.md` et mêmes définitions que l'application) avec les textes fictifs de `docs/FICHE_ESSAIS_BIEN_UTILISER_L_IA_2026-11-25.md`. Une seule réponse par demande : une autre réponse pourrait différer. Aucun prompt n'a été modifié : les corrections ci-dessous sont des propositions, à valider par Denis (consigne 532).

Limites : un seul assistant (ChatGPT), un seul passage, première question seulement pour l'entraînement (3a), l'écran de l'application n'a pas été parcouru champ par champ (l'assemblage est le même code). Pour le courrier B, la date du jour de la demande était le 23/11 (cas voulu), mais ChatGPT a utilisé la vraie date du 25/11 : artefact d'essai, sans effet en usage réel.

Verdicts : OK, À CORRIGER (une phrase à changer), À REVOIR (le modèle ne fait pas ce qu'on attend).

| Essai | Verdict | Résumé |
|---|---|---|
| 1. Mail d'immersion (modèle 1) | À CORRIGER léger | Bon mail, rien promis. Une phrase ajoutée qui n'est pas dans le texte (« cette expérience m'a permis de découvrir le travail autour du pain »), et un peu de répétition. Signature sur une seule ligne dans la copie de texte (à vérifier à l'écran). |
| 2. CV face à une offre (modèle 2) | OK | Aucune note, aucun verdict, rien inventé. Deux détails : une déduction non signalée comme telle (la formation « liée à l'entretien »), trois questions pour cinq points à améliorer (deux regroupées). |
| 3a. Entraînement (modèle 3) | OK | Une question à la fois, ton rassurant. L'assistant explique le déroulé avant la première question et ajoute un émoji (visage). |
| 3b. Trou dans le parcours (modèle 3) | À CORRIGER léger | Trois formulations honnêtes. Qualités ajoutées qui ne figurent pas dans le texte (« mon sérieux », « mon goût du travail en équipe », « l'hygiène est importante »), et un conseil ajouté après la fin demandée. |
| 4a. Courrier A (modèle 4) | OK | Tous les points visés : délai de 15 jours non transformé en date, adresse absente signalée, suspension annoncée, phrase douce en dernière phrase. |
| 4b. Courrier B (modèle 4) | OK | Adresse, téléphone, documents flous et conséquences floues signalés ; date passée relevée en tête. |
| 6a. Refuser un poste (modèle 6) | OK | Poli, factuel, 7 phrases. Une expression ajoutée (« ma candidature »). |
| 6b. S'excuser d'un retard (modèle 6) | À CORRIGER | « désolé(e) » : le modèle 6 ne demande pas d'éviter les accords de genre (le modèle 1 le demande). |
| 7. Texte plus simple (modèle 7) | À CORRIGER | La référence « article 4 du règlement » a disparu alors que le prompt dit de ne rien retirer, et la phrase finale affirme que toutes les informations sont gardées. |
| 8. Formulaire case par case (modèle 8) | OK | Chaque intitulé cité, rien rempli, aucune information demandée. Des sources citées (France Travail, CAF, retraite) qui ne sont pas dans le formulaire. |
| 10a. Synthèse sans noms (modèle 10) | À CORRIGER léger | Structure et prudence bonnes. « Le conseiller doit envoyer » : les notes ne disent pas qui. « Difficultés avec l'informatique » : interprétation de « pas très douée ». |
| 10b. Synthèse fidèle au texte (modèle 10) | À CORRIGER léger | Citations présentes et exactes. Mêmes deux défauts que 10a, plus « modalités de préparation aux entretiens » qui n'est pas dans les notes. |
| 11. Compte rendu avec gabarit (modèle 11) | OK | Les trois rubriques exactes, dans l'ordre. L'attribution au professionnel est signalée dans la liste à vérifier. Détails : lignes « Date » et « Durée » ajoutées, citation mal construite (« a dit que « je ne suis pas... » »). |
| 12. Langage simple (modèle 12) | OK | Phrases courtes, « À retenir » en trois lignes. Détails : une phrase de 11 mots, « article 7 » retiré, « vous risquez de perdre votre hébergement » plus fort que le texte, acteur « le gestionnaire » ajouté. |
| 13a. Atelier, déroulé (modèle 13) | À CORRIGER | Les durées additionnées font 130 minutes alors que l'assistant écrit « total : 120 ». Le reste est bon (binômes, exemples fictifs, liste de préparation). |
| 13b. Atelier, exercices (modèle 13) | À REVOIR | Durées justes (120). Mais la réponse refait tout le déroulé en six temps avec des « exercices » dans chaque temps (plus de 2 500 mots, une « pause » traitée comme un exercice) : la consigne « six temps » reste dans la variante « exercices ». |

## Corrections proposées (aucune appliquée)

1. **Modèle 6** : ajouter la phrase déjà présente dans le modèle 1 (« Tourne les phrases pour éviter les accords qui dépendent de mon genre »). Seul le modèle 1 a cette phrase (vérifié par recherche dans les fichiers) : les modèles 3 (réponses à dire en entretien), 5 (réponse à l'administration) et 9 (rendez-vous), qui font parler la personne à la première personne, ne l'ont pas. Les modèles 5 et 9 ont déjà été essayés par Denis le 23/11 : à lui de dire s'il veut la phrase aussi là.
2. **Modèle 13** : (a) variante « déroulé » : ajouter « Additionne les durées de tous les temps, pause et marge comprises : le total doit être exactement la durée de l'atelier. Écris l'addition à la fin. » ; (b) variante « exercices » : ne pas imposer les six temps (garder seulement la durée, la pause et la marge) ou ne les garder que comme repères de durée. Décision de Denis : c'est un choix de conception.
3. **Modèle 7** : ajouter « Garde les références (article, numéro, nom du texte) telles quelles » et « Dans ta phrase finale, dis ce que tu as retiré ou regroupé, s'il y a lieu ».
4. **Modèles 10 et 11** : ajouter « Pour ce qui reste à faire, n'écris pas qui le fait si les notes ne le disent pas » (la liste de vérification du modèle 11 le rattrape déjà, pas le 10), et « Ne reformule pas une citation de la personne en difficulté ».
5. **Modèle 3, variante « trou »** : ajouter « N'ajoute aucune qualité ni aucun trait de caractère qui ne soit pas dans ce que j'ai écrit » et « Termine par les deux questions : n'ajoute rien après ».
6. **Modèle 1** : « Ne dis rien sur ce que l'expérience m'a appris si je ne l'ai pas dit ».
7. **Remarques sans prompt** : (a) le modèle 6, « Monsieur Martin, formateur pour un retard » : la phrase d'introduction manque une virgule quand le champ « destinataire » contient une fonction, à regarder dans le champ (aide ou exemple) ; (b) modèle 13 : le champ « objectif » est précédé de « seront capables de : », donc saisir « se présenter... » et non « savoir se présenter... » (à préciser dans l'aide du champ).

Les modèles 8, 11 et 12 n'ont pas de défaut grave : leurs détails sont en note.

## Corrections appliquées et nouvel essai (26/11/2026)

Denis a validé les corrections (« Oui, les appliquer »). Appliquées dans les fichiers `prompts/bien-utiliser-modele-1, 3, 6, 7, 10, 11, 13.md` (version 1.1), l'ordre du modèle 13 dans `data/buiaModeles.js` et l'aide du champ « objectif » du modèle 13. Tests : `tests/bienUtiliserIaCorrections2611.test.js`.

Nouvel essai avec ChatGPT des cas les plus nets :

| Essai | Résultat |
|---|---|
| 6b. S'excuser d'un retard | Corrigé : plus de « désolé(e) », « je vous présente mes excuses », « je regrette cette situation ». |
| 7. Texte plus simple | Premier essai encore raté (article retiré, phrase finale fausse). Consigne renforcée dans le bloc de la transformation elle-même (« références recopiées mot pour mot ») et dans la relecture finale : second essai corrigé, « article 4 du règlement » gardé, regroupement signalé. |
| 13a. Atelier, déroulé | Premier essai de la phrase « le total doit être égal » non concluant sur la variante exercices (125 minutes annoncées 120). Consigne renforcée (addition écrite en chiffres, à vérifier et corriger, durée donnée en minutes) : déroulé juste, 10 + 5 + 20 + 50 + 10 + 15 + 5 + 5 = 120. |
| 13b. Atelier, exercices | Corrigé : quatre exercices, environ 870 mots au lieu de plus de 2 500, addition juste (120). |

Modèles 1, 3, 10 et 11 réessayés le 26/11/2026 à la demande de Denis (voir ci-dessous). Remarque abandonnée : la virgule du modèle 6 (« Monsieur Martin, formateur pour un retard ») venait de mon texte d'essai, qui ne suivait pas l'aide du champ (« le type de personne, sans nom »).

### Nouvel essai des modèles 1, 3, 10 et 11 (26/11/2026)

| Essai | Résultat |
|---|---|
| 1. Mail d'immersion | Corrigé : plus de phrase sur ce que l'expérience a appris. Reste un défaut ancien, présent aux deux essais : la signature « [mon nom] [mon téléphone] » tient sur une seule ligne alors que la demande dit « sur deux lignes ». Correction possible, non appliquée (à valider par Denis). |
| 3b. Trou dans le parcours | Corrigé : aucune qualité ajoutée, rien après les deux questions. « Je me suis occupé » au masculin alors que le texte disait « occupée » : vient de mon texte d'essai, qui mélangeait « employé, ponctuel » et « occupée ». |
| 10a. Synthèse sans noms | Corrigé : les tâches sont écrites sans les attribuer au conseiller, et « ne pas être très à l'aise avec l'ordinateur » remplace « difficultés avec l'informatique ». |
| 11. Compte rendu | Premier essai : citation corrigée (« La personne a dit : « ... » »), mais les tâches encore attribuées au professionnel malgré la règle de fin. Consigne déplacée dans le bloc `ton` avec une forme vérifiable (« à l'infinitif, sans l'attribuer à personne », avec un exemple) : second essai corrigé (« Envoyer la liste des offres... », « Vérifier l'inscription... »). |

### Signature du modèle 1 (26/11/2026)

Denis a validé la correction. Consigne précisée : « [mon nom] seul sur une ligne, puis [mon téléphone] seul sur la ligne suivante ». Au nouvel essai, l'écran de ChatGPT montrait encore la signature sur une ligne ; une question de contrôle (« recopie la signature dans un bloc de code ») a montré que l'assistant écrit bien deux lignes : c'est l'affichage de ChatGPT qui colle deux lignes séparées par un seul retour. Le défaut signalé était donc un effet d'affichage, pas une erreur de l'assistant ; la consigne précisée est gardée car elle est plus claire et sans risque. À regarder par Denis : la signature collée dans un vrai mail après le bouton de copie de ChatGPT.
