# Audit de « Écrire ma lettre de motivation avec l'assistant » (2026-11-21)

Deuxième module audité, après « Créer un nouveau CV » (`docs/AUDIT_CREER_CV_TOUS_PARCOURS_2026-11-21.md`). Profil inventé « Camille Martin » (CV déposé en texte collé, relu et masqué), réponses de l'assistant simulées.

## Ce qui a été joué

- Les six types de candidature : réponse à une offre, candidature spontanée, changer de métier, stage de formation, stage d'immersion (PMSMP), alternance, formation.
- Pour offre, spontanée et changer de métier : métier précis, plusieurs métiers d'un domaine (avec choix de l'intitulé), de façon générale ou entreprise précise.
- Les six situations actuelles proposées (en poste, en recherche, en études, en reconversion, reprise après une pause, ne pas préciser), plusieurs niveaux de blocage du bouton « Continuer ».
- Cas riche : civilité et nom de la personne qui recrute, type de structure, contrat, temps de travail, disponibilités, horaires, structure, durée, dates et heures de stage.
- Les trois appuis : lettre de recommandation, document « Mes compétences », « Dites-le avec vos mots » (dépôt, relecture, masquage).
- Réponse de l'assistant collée, page « Vos documents » : identité, aperçu, formats (A4, message par mail), mise en page, « Modifier le texte », « Valider la lettre », PDF, Word, copie du texte.

## Résultat : aucun blocage

Tous les parcours vont jusqu'à l'export. Les données saisies arrivent au message : type de candidature, métier ou domaine et intitulé, entreprise, site, offre, structure, civilité (le nom est placé ensuite par l'application dans « À l'attention de Madame Durand »), type de structure, contrat, temps de travail, disponibilités, horaires, situation actuelle, durée, dates, heures, les trois appuis chacun dans sa section. Le Word se télécharge, la copie du texte se rabat sur un fichier texte quand le presse-papiers est refusé (voulu). Les boutons « sans effet » vus étaient des faux positifs (format déjà actif, panneau de mise en page qui se replie en « message par mail »).

## Incohérences corrigées dans le même passage

1. **Stage ou immersion sans le type choisi** : le bouton « Continuer » restait grisé avec « Il reste à indiquer votre situation actuelle », alors que « Adaptation au métier » est verrouillé tant qu'on n'a pas dit de quel type de stage il s'agit. Le message dit maintenant « Il reste à dire de quel type de stage il s'agit et à indiquer votre situation actuelle ». Test ajouté.
2. **« Métier visé (à cibler en priorité pour le CV) » dans une lettre ou un entretien** : le texte disait toujours « le CV ». Il dit maintenant « la lettre » ou « l'entretien ».
3. **Doublon « Métier visé » en changement de métier** : la ligne était écrite deux fois avec le même métier. Une seule désormais (la seconde reste quand l'intitulé diffère, cas du domaine).
4. **« Utile quand le recrutement est commun à plusieurs magasins »** affiché pour une mairie : remplacé par « Utile quand l'entreprise a plusieurs sites ».

## À savoir, non corrigé

- Le CV masqué laisse une ligne « - » vide en tête de la section « CV DE LA PERSONNE » du message (les lignes d'identité retirées laissent un tiret). Sans effet sur la réponse de l'assistant, mais disgracieux.
- Dans une lettre de recommandation, le masquage retire la signature, le téléphone et l'adresse électronique, mais pas un nom écrit dans le corps du texte (« Madame Dupont, directrice… »). L'application avertit la personne de les retirer elle-même avant de continuer.
- Le message fait environ 60 000 caractères (le prompt en pèse la plus grande part).

## Non vérifié

Réponses de l'assistant simulées, jamais réelles. « Modifier le texte » et les couleurs de gabarit n'ont pas été éprouvés bouton par bouton. Largeur 375 px et mode sombre non rejoués pour ce module.
