# « Bien utiliser l’IA » : modèle 13, « Préparer un atelier » (version 1)

Ce fichier est LA source des phrases envoyées à l’assistant pour ce modèle : le module les lit ici, rien n’est recopié dans le code. Vous pouvez corriger un texte vous-même, sans passer par Claude.

Comment le modifier :
- Chaque bloc commence par une ligne `## nom-du-bloc`. Ne changez pas le nom : le module le cherche par ce nom.
- Le texte du bloc est tout ce qui suit, jusqu’au bloc suivant.
- Tout ce qui est avant le premier `##` (ce commentaire) n’est jamais envoyé à l’assistant.
- Une ligne qui commence par `<!--` et finit par `-->` est un commentaire pour vous : elle n’est jamais envoyée.
- Seuls quatre repères sont remplacés par le module : `{{theme}}` (le thème de l’atelier), `{{public}}` (le public), `{{objectif}}` (ce que les participants sauront faire) et `{{materiel}}` (la salle et le matériel, s’ils sont remplis). N’écrivez aucune autre accolade ni aucun crochet.
- Les blocs `type-...`, `duree-...` et `questions-...` sont les choix de la personne : un seul de chaque groupe est envoyé.
- Le bloc `materiel` n’est envoyé que s’il est rempli.

Statut : VERSION 1, écrite le 25/11/2026 à la demande de Denis (sélection validée le même jour), jamais essayée. Elle reprend la construction des autres modèles pour les professionnels et les règles de socle du corpus. Besoin réel : une phrase de Denis dans le corpus (« préparer un atelier de 2 h sur la lettre de motivation »). Règles de fond : aucun nom de personne, aucun résultat promis aux participants, rien d’inventé. À essayer par Denis seul, avec le thème de la lettre de motivation, dans les deux types et les trois durées. Les corrections demandées après l’essai se font ici.
Correction du 26/11/2026 (version 1.1) : essai fait par Claude avec ChatGPT le 25/11/2026, textes fictifs, corrections validées par Denis (détail : `docs/RESULTATS_ESSAIS_BIEN_UTILISER_L_IA_2026-11-25.md`). Ajouts : addition des durées (bloc `plan`), nouveau bloc `plan-exercices` qui remplace les six temps dans la variante « exercices ».

<!-- Le but, toujours en premier. Un seul bloc choisi. -->

## type-deroule
Je suis professionnel de l’accompagnement et je prépare un atelier collectif. Écris le déroulé de l’atelier. Exécute directement cette demande.

## type-exercices
Je suis professionnel de l’accompagnement et je prépare un atelier collectif. Propose des exercices à faire en groupe. Pour chaque exercice, donne la consigne à lire aux participants, sa durée et ce qu’il faut préparer. Exécute directement cette demande.

<!-- Ce que dit la personne de son atelier. -->

## theme
Thème de l’atelier : {{theme}}.

## public
Public : {{public}}.

## objectif
À la fin de l’atelier, les participants seront capables de : {{objectif}}.

<!-- La salle et le matériel. Envoyé seulement s’il est rempli. -->

## materiel
Salle et matériel disponibles : {{materiel}}. N’utilise rien d’autre.

<!-- La durée (un seul bloc choisi). -->

## duree-1h
L’atelier dure une heure, soit 60 minutes : donne une durée à chaque temps et garde cinq minutes de marge à la fin.

## duree-2h
L’atelier dure deux heures, soit 120 minutes : donne une durée à chaque temps, prévois une pause de dix minutes et garde cinq minutes de marge à la fin.

## duree-demi
La séance dure une demi-journée, soit environ trois heures (180 minutes) : donne une durée à chaque temps, prévois deux pauses de dix minutes et alterne les temps où j’apporte une information avec les temps où les participants pratiquent.

<!-- Toujours envoyés. -->

## plan
Organise l’atelier en six temps : accueil, annonce de l’objectif, apport court, pratique en petits groupes, retour collectif, conclusion. Si un temps ne convient pas à cette durée, regroupe-le avec un autre et dis-le-moi en une phrase. Termine le déroulé par l’addition écrite en chiffres de toutes les durées, pause et marge comprises (par exemple 10 + 5 + 20 = 35) ; vérifie-la, et si le total n’est pas égal à la durée de l’atelier, corrige les durées avant d’envoyer ta réponse.

<!-- Variante « exercices » seulement : le module envoie ce bloc à la place du bloc `plan`. -->

## plan-exercices
Propose trois à cinq exercices qui tiennent dans cette durée, dans l’ordre où l’animateur les fera, sans réécrire tout le déroulé de l’atelier : pour l’accueil, la pause et la conclusion, une ligne chacun suffit. Termine par l’addition écrite en chiffres de toutes les durées, pause et marge comprises (par exemple 10 + 5 + 20 = 35) ; vérifie-la, et si le total n’est pas égal à la durée de l’atelier, corrige les durées avant d’envoyer ta réponse.

## ton
Écris pour un animateur : des consignes claires, des phrases courtes, aucun jargon. Ne juge pas les participants et ne suppose rien sur leurs capacités ni sur leur situation. Si tu donnes un exemple, utilise des personnages inventés.

## texte-simple
Écris en texte simple, prêt à copier : aucun gras, aucun dièse, aucun tiret en début de ligne.

<!-- Questions d’abord (un seul bloc choisi). -->

## questions-non
Pose-moi une question seulement si une information indispensable manque pour répondre, trois questions courtes au maximum, sinon réponds directement.

## questions-oui
Si quelque chose t’empêche de bien préparer cet atelier, pose-moi tes questions avant de répondre : trois questions courtes au maximum.

<!-- Les règles de socle, toujours envoyées en dernier. -->

## regles
Règles pour ta réponse :
• Écris en français impeccable : orthographe, accents, grammaire et ponctuation sans erreur.
• N’utilise jamais de tiret long ni demi-long, et pas de tiret en début de ligne : numérote ou utilise des puces.
• N’emploie pas le mot « on » : donne à chaque phrase un sujet précis (l’animateur, les participants, vous).
• Adresse-toi à moi avec « vous » dans tes remarques.
• N’écris aucun nom, aucune adresse, aucun numéro ni aucun courriel, même s’il reste dans ce que je t’ai donné : remplace-le par un repère et signale-le-moi en une phrase.
• N’invente rien : aucune règle, aucun chiffre, aucun dispositif, aucune loi qui ne soit pas dans ce que je t’ai dit. Ne donne aucun avis juridique.
• Ne promets aucun résultat aux participants : ni emploi, ni diplôme, ni admission.
• Si le thème, le public et la durée semblent ne pas aller ensemble, signale-le-moi en une phrase calme et propose la solution la plus simple, sans choisir à ma place.
• Termine par la liste de ce que je dois préparer avant l’atelier : supports, copies, matériel.
• Donne toute ta réponse en un seul message, puis relis-la avant de l’envoyer : français, durées, rien d’inventé.
