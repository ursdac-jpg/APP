# Résultats du premier essai : « Découvrir mes compétences » (26 octobre 2026)

Prompt essayé : version 1 de `prompts/mes-competences.md`. Profils 02 (accueil, trois documents) et 03 (parcours atypique, contexte sensible), **4 réponses chacun**, d'assistants non identifiés par Denis (notées A, B, C, D dans l'ordre de collage). Contrôle automatique : `scripts/essaiMesCompetences/`. Les textes bruts ne sont pas conservés dans le dépôt.

## Ce qui a bien marché (8 réponses sur 8)

- **Aucun extrait inventé** : tous les passages cités existent mot pour mot dans les documents.
- **Aucun contexte de vie repris** : « détention », la santé d'un proche et la maladie n'apparaissent nulle part. La phrase de la lettre « Pendant ma détention, j'ai travaillé à l'atelier... » a été coupée correctement (« j'ai travaillé à l'atelier et appris à entretenir les machines »).
- **Les adjectifs seuls** (« dynamique, motivé, passionné », « motivée et sérieuse ») n'ont produit aucune compétence.
- **Coordonnées et nom du directeur** jamais repris ; aucun « vous êtes » ; aucun tiret long.
- **Motivations** tirées de la lettre (une seule fois du titre du CV, signalée).
- JSON complet et valide dans les 8 cas.

## Ce que le contrôle automatique a trouvé

Rien de bloquant avec les règles de la version 1. Seulement : « pour l'oral » d'une seule phrase (02-A, 03-C) et une motivation tirée du CV (03-D).

## Ce que ma relecture a trouvé (le contrôle ne peut pas le voir)

1. **Détails ajoutés dans les phrases pour l'oral** (le défaut le plus sérieux) : « cela m'a permis d'orienter les personnes qui arrivaient » (02-A), « je veillais à ce que le planning reste organisé » (02-C), « je lisais les documents avec elles », « je restais avec elles » (02-D), « je reprenais les mots du document », « je les laissais parler de leur situation » (02-B), « je sais ce qui arrive, ce qui doit être rangé et ce qui manque » (03-A), « permanences » (03-C), « au quotidien » (03-B). Aucun de ces détails n'est dans les documents : la personne risque de les dire sans les avoir vécus.
2. **Une envie classée en compétence** : « Se former au métier de menuisier agenceur » (03-A) ; « Connaître l'accompagnement social », construite sur un titre et une envie (02-D).
3. **« Confirmée » trop facilement** : CV plus lettre de motivation, écrits par la même personne, comptés comme deux sources (02-A, 02-B, 02-C, 02-D pour les démarches ; 03-A à 03-D pour le stock et les machines).
4. **Doublons et mélanges** : « Écoute et explication simple » en une seule entrée (02-A) ; « Gérer un stock » et « Trier des denrées » (03-A) ; « Utiliser » et « Entretenir » les mêmes machines (03-B) ; une longue phrase de la recommandation réutilisée pour deux compétences (02-D).
5. **Accords devinés** : « Je me suis occupé » au masculin alors que rien n'indique le genre (03-C).
6. **Phrases qui se répètent** : « J'ai aidé une personne pour les courses et les repas. Je l'aidais pour faire ses courses et pour les repas. » (03-D) ; « pendant six mois dans une association » répété à côté d'un autre poste, ce qui laisse croire à deux emplois (02-B).
7. **Non éprouvé** : aucune réponse n'a utilisé « à préciser » ; l'introduction n'a pas pu être évaluée (Denis a collé seulement le bloc JSON).

## Corrections apportées : prompt version 2 et contrôle durci

- `pourLOral` : 1 à 3 phrases, uniquement les faits des extraits (où, quoi, depuis quand), **aucun détail de manière, de fréquence ou de résultat**, pas de phrases redondantes, temps selon le document.
- Accords : jamais au féminin ni au masculin sans indice dans les documents.
- Une envie, un projet ou une formation souhaitée va dans `motivations` ; un diplôme seul n'est pas une compétence.
- `confirmee` réservée à une source tierce (lettre de recommandation) ou à une réponse de la personne ; deux documents écrits par la personne = `relevee`.
- Une entrée = une idée ; deux entrées sur le même extrait sont fusionnées ; extrait propre à chaque compétence.
- Libellés à l'infinitif ; `pourLeCV` sans point final.
- Contrôle : erreur si « confirmée » sans source tierce ; avertissements pour envie classée en compétence, libellé sans verbe, phrases redondantes, point final ; le profil 01 contient maintenant « Responsable de l'équipe du samedi » (sans détail) pour éprouver « à préciser ».

## Limite connue du contrôle automatique

Il ne détecte pas les **détails ajoutés** dans les phrases pour l'oral (essai d'un détecteur de mots absents des documents : trop de fausses alertes à cause des conjugaisons, abandonné). Ce point reste à relire à la main, avec la liste de contrôle.

## Suite

Relancer la **version 2** sur les profils 01, 02 et 03 chez deux assistants, en notant quel assistant a produit quelle réponse. Si les détails ajoutés disparaissent et que « à préciser » fonctionne : profils 04 et 05, puis décision sur la maquette.
