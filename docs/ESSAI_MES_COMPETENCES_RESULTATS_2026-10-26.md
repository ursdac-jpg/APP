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


---

# Deuxième essai : prompt version 2, profils 01, 02 et 03 (12 réponses)

Quatre assistants, notés 1 à 4 dans l'ordre de collage de Denis (les noms ne sont pas connus). Contrôle automatique avec les règles de la version 2 (puis durci pour la version 3).

## Progrès par rapport à la version 1

- **Les détails ajoutés dans les phrases pour l'oral ont presque disparu.** Les phrases se limitent aux faits : où, quoi, depuis quand (et les dates et lieux du CV sont bien repris : « à Limoges de 2021 à 2024 », « depuis 2023 »). C'est le défaut le plus grave de la version 1 et il est résolu.
- **Le cas « à préciser » a fonctionné** pour deux assistants sur quatre (1 et 3) sur « Responsable de l'équipe du samedi », avec une bonne question.
- **Une seule envie** classée en compétence sur trois profils (assistant 4, « Reprendre un travail de menuisier »), contre deux fois au premier essai.
- **Aucun extrait inventé** (toujours), aucune détention reprise, aucune coordonnée, aucun « vous êtes ».
- Toutes les réponses sont complètes et valides.

## Ce qui reste à corriger (traité dans la version 3)

1. **« Confirmée » mal comprise** : trois assistants sur quatre marquent « confirmée » une compétence qui ne repose que sur la lettre de recommandation (« respecter les délais », « rassurer »). Une recommandation seule est **une** source.
2. **Un intitulé seul établi comme compétence** (assistants 2 et 4 : « Coordonner une équipe », « Responsabiliser une équipe », ce dernier verbe étant en plus faux).
3. **« Un parent malade » repris** (assistants 2 et 4, profil 03) : la santé d'un proche est du contexte de vie.
4. **Accents supprimés dans « pour le CV »** (assistant 2, partout : « Preparation », « Controle », « equipe ») : faute de français.
5. **Fonction et sexe du signataire** (assistant 4 : « la directrice de l'association indique... », alors que le document dit « directeur ») : le prompt interdit de citer la fonction.
6. **Question sur un diplôme** (assistant 2 : « À quelle date avez-vous passé ce certificat ? ») : interdit.
7. **Un loisir devenu compétence** (assistant 2 : « Jouer au football en club »).
8. **Un même emploi présenté comme deux** (assistant 1, profil 02 : « J'ai aussi assuré l'accueil téléphonique pendant six mois dans une association »).
9. Fautes de conjugaison (assistant 4 : « je filmait »), mauvaise famille (« contrôler les références » classé en savoirs, assistants 3 et 4).

## Prompt version 3 et contrôle durci

- Intitulé de poste ou de fonction seul : **toujours « à préciser »**, même avec le mot « responsable ».
- « Confirmée » : au moins deux sources dont une tierce ; **une recommandation seule = « relevée »**.
- Santé d'un proche ignorée ; ni nom, ni fonction, ni sexe du signataire (« ma lettre de recommandation indique que... »).
- Accents partout, y compris « pour le CV » ; orthographe et conjugaison relues.
- Aucune question sur un diplôme ou un certificat, y compris dans « pour préparer ».
- Loisir sans détail non relevé ; un même emploi jamais présenté deux fois ; verbe du libellé exact.
- Contrôle : **erreur** pour un accent manquant (comparé au vocabulaire des documents), pour un intitulé seul établi, pour la fonction du signataire ; **avertissement** pour une question sur un diplôme.
- Tests : 14 verts.

## Lecture des assistants (indicative, 3 profils chacun)

- **Assistant 3** : le plus propre (aucune erreur sur les profils 01 et 03 ; seule la règle « confirmée » est mal comprise sur le 02) et le plus fidèle (phrases courtes).
- **Assistant 1** : très bon, un défaut (« j'ai aussi... pendant six mois »).
- **Assistant 4** : bon sur le fond, mais fonction du signataire, « parent malade », envie classée, intitulé seul.
- **Assistant 2** : le plus faible sur la forme (accents, football, question sur le CACES, « parent malade »).

## Suite

Relancer la **version 3** (profils 01, 02, 03) chez deux assistants au moins ; viser zéro erreur sur les trois. Puis profils 04 et 05, puis décision sur la maquette.


---

# Troisième essai : prompt version 3, un assistant, profils 01, 02, 03

Réponses relues à la main (pas de transcription dans le contrôle automatique). **Les phrases d'introduction étaient présentes pour les profils 03 et 01** (tout premier retour sur ce point) et sont bonnes : 3 à 4 phrases, ton simple et encourageant, aucun mot technique, aucun point d'exclamation, aucune allusion à la détention ni à la santé.

## Ce qui s'est amélioré
- **Profil 02 : quasiment parfait.** « Respecter les délais » et « Rassurer » sont enfin « relevées » (une recommandation seule), aucune fonction ni sexe du signataire (« Ma lettre de recommandation indique que... »), accents corrects, pas de détail ajouté, dates et lieux repris du CV.
- **Profil 01 : très bon.** « Responsable de l'équipe du samedi » est bien « à préciser » avec une bonne question ; ni football, ni CACES, ni diplôme en compétence ; « Contrôler » classé en savoir-faire ; phrases neutres sans accord de genre.

## Ce qui n'allait pas
1. **Contexte de vie dans un extrait** (profil 03) : l'extrait « Pendant ma détention, j'ai travaillé à l'atelier et appris à entretenir les machines. » recopie la phrase entière. La consigne demandait de couper.
2. **Une compétence « à préciser » recopiée de la consigne** (profil 03) : « Encadrer l'équipe du samedi », avec un extrait sans rapport (« Aide-menuisier... »). C'était l'exemple écrit dans mon prompt.
3. **Une même ligne éclatée en trois** (profil 03) : « Courses, repas, rendez-vous médicaux, gestion des papiers » donne trois compétences avec le même extrait.
4. **Accord au masculin sans indice de genre** (profil 03 : « je me suis occupé de papiers »).
5. Deux compétences sur un même extrait (profil 02 : rendez-vous / agenda ; profil 01 : camions / palettes).

## Défaut de méthode reconnu (leçon 9.65)

**Les exemples de ma consigne étaient ceux de mes cas d'essai** (football en club, six mois dans une association, menuisier agenceur, accompagnement social, parent malade, l'équipe du samedi). L'assistant avait donc, en partie, la réponse sous les yeux, et les résultats des versions 2 et 3 sont **optimistes**. Corrigé en version 4 : exemples sans rapport avec les profils, et un test automatique qui échoue si un exemple de la consigne réapparaît dans un profil d'essai. Les essais sont à refaire avec la version 4.

## Version 4 et contrôle
- Exemples remplacés (cuisinier, enfants, rayon frais, chef de rang, randonnée, tonte et arrosage...).
- Contexte de vie : si la seule phrase qui prouve une compétence en contient, copier **seulement la partie professionnelle**.
- Une compétence « à préciser » doit reposer sur un extrait qui parle du même sujet.
- Un extrait partagé par plusieurs compétences : une seule entrée, ou le morceau précis de la ligne pour chacune.
- Contrôle : avertissements pour libellé sans mot commun avec ses extraits, extrait partagé, accord de genre sans indice (profils 01 et 03), « à préciser » sans explication ; test anti-contamination des exemples. 16 tests verts.
