# Audit de « Créer un nouveau CV » : tous les parcours, de l'objectif à « Vos documents » (2026-11-21)

Demande de Denis : jouer tous les choix possibles (à la main, avec l'assistant, « à partir de mon récit », compétences choisies par la personne ou par l'assistant, tous les objectifs), vérifier boutons, cohérence, blocages, arrivée des informations dans le message envoyé à l'assistant, réception selon le modèle.

## Ce qui a été joué (profil inventé « Camille Roux », 3 expériences, formations, certifications, langues, permis, loisirs, engagements)

- 21 parcours complets : à la main × 7 objectifs, avec l'assistant (compétences choisies par la personne) × 7, avec l'assistant (compétences choisies par l'assistant) × 7. Objectifs : offre, candidature spontanée, reconversion, stage, stage PMSMP, alternance, formation.
- « À partir de mon récit », compétences choisies par la personne puis par l'assistant : 17 écrans chacun.
- Les 40 modèles de mise en page (26 Créatif, 13 Sobre, Standard) rendus avec le profil complet, avec et sans photo.
- Largeur 375 px (2 parcours) : aucun débordement.
- Un clic sur chacun des 280 boutons de « Vos documents », puis des autres pages (recherche des boutons sans effet).

## Résultat : aucun blocage

Les 21 parcours vont de l'objectif à « Vos documents » sans impasse. « Recommencer » ouvre bien sa confirmation. Les 40 modèles reçoivent toutes les données du profil (identité, coordonnées, expériences, formations, certifications, langues, permis, loisirs, engagements, compétences) sur une page chacun. Les boutons vus « sans effet » sont des faux positifs (bouton déjà actif, boutons de choix Oui/Non, pastilles « Sans effet : ce modèle a sa propre présentation » volontairement grisées).

Informations qui arrivent bien au message de l'assistant : objectif et ses détails (entreprise, site, offre, structure, civilité et nom du recruteur, durée, dates, heures), expériences et leurs missions, expériences personnelles, formations, certifications, engagements, loisirs, langues, permis et véhicule, genre. Section « CHOIX DE LA PERSONNE » présente quand la personne a choisi ses compétences, absente quand l'assistant les choisit (voulu). Coordonnées jamais transmises (voulu).

## Incohérences corrigées dans le même passage

1. **Lien LinkedIn cassé** : « https://www.linkedin.com/in/… » devenait « Https://… » (majuscule automatique sur le premier caractère, appliquée à tous les champs texte). Corrigé : plus de majuscule automatique sur les champs d'adresse internet (identifiants contenant lien, site, url). Concerne tous les parcours.
2. **« Vous candidatez pour le métier de Assistant administratif »** : faute d'élision. Reformulé : « Vous candidatez pour ce métier : Assistant administratif ».
3. **Page « Votre profil », stage / alternance / PMSMP / formation** : elle affichait « Vous n'avez pas ciblé de métier » alors que la personne venait de saisir le poste ou la formation visé(e). Elle affiche maintenant « Poste visé : … » ou « Formation visée : … ».
4. **Même page, sans assistant** : le texte disait « L'assistant s'appuiera sur l'ensemble de votre parcours » dans la voie sans assistant. Il dit maintenant « Votre CV s'appuiera… » dans cette voie.
5. **Mot anglais « DIY (Do It Yourself) »** dans la liste des loisirs : remplacé par « Objets faits main » (l'ancien libellé reste reconnu pour les dossiers déjà enregistrés).

## Les trois choix, tranchés le 2026-11-21

A. **Ligne « Métier visé » pour stage, alternance et PMSMP** : ajoutée au message envoyé à l'assistant (même libellé que pour un métier choisi), seulement quand aucun métier ni secteur n'est ciblé. La formation garde sa ligne « formation visée » (ce n'est pas un métier). Vérifié sur les quatre objectifs.
B. **Expérience non retenue par l'assistant** : rien à ajouter. La carte « Expériences professionnelles » de la mise en page prévient déjà (« 1 expérience de votre dossier n'est pas sur le CV ») avec le bouton « Ajouter au CV » ; l'alerte est présente dans la page. Mon audit ne l'avait pas vue parce qu'elle est dans une carte repliée.
C. **Intitulé du poste** : décision de Denis, on garde le texte de la personne. Cliquer une suggestion de métier ne remplace plus le poste ; le métier sert seulement aux missions et compétences proposées. Vérifié dans le navigateur.

## Mineurs non traités

- La barre d'étapes montre « Vos missions et compétences » avant la confirmation du choix, puis la retire.
- Le message à l'assistant fait 48 000 à 55 000 caractères pour un profil riche : à surveiller.
- Les modèles comptés « 25 » et « 12 » à l'écran sont 26 et 13 dans le code : écart expliqué (deux modèles construits autour d'une photo ne comptent que si la personne a une photo), pas une erreur.

## Non vérifié

Réponses de l'assistant simulées (JSON collé), jamais une vraie réponse. Variantes non jouées : « Plusieurs métiers d'un même domaine », mode sombre sur tous les écrans, profil minimal sans formation ni photo.
