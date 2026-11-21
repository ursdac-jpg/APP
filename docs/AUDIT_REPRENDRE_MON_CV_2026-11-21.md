# Audit de « Reprendre mon CV » : dépôt et trois voies (2026-11-21)

Mode B, effort moyen. Profil inventé « Camille Martin » (CV d'une expérience, une formation, une langue). Réponses de l'assistant SIMULÉES (JSON collé), jamais une vraie réponse.

## Ce qui a été joué
- Dépôt par texte collé, relecture et masquage, « Déposé et relu ». « Revoir la présentation », « Revenir au module ».
- **Voie 1 « Le garder et le compléter »** : question « Qui choisit les missions » (les deux réponses, avec confirmation), sept objectifs (offre, spontanée, reconversion, stage, immersion, alternance, formation), lecture du CV par l'assistant, « Vos informations », « Votre profil », page de rédaction. Deux messages relevés : lecture du CV (CV masqué seul, c'est voulu) et rédaction.
- **Voie 2 « Le reformuler »** : sept objectifs, message de reformulation, réponse à deux versions, garde-fou « compétence absente du CV » (déclenché et « Retirer » essayé), choix de la version, « C'est bon, passer à la mise en forme ».
- **Voie 3 « Le refaire moi-même »** : classement, vérification, « Vos documents », export. L'aperçu reçoit identité, expérience, formation, langue.
- Largeur 375 px (voies 1 et 2) : aucune anomalie relevée par le contrôle. « Retour » en chaîne : rejoint la page commune. Sortie par « Accueil » puis tuile « Reprendre mon CV » puis « Reprendre » (trois voies).

## Résultat
Aucun blocage. Les informations de chaque objectif arrivent dans le message : entreprise, site, offre, civilité et nom du recruteur, type de structure, durée, dates, poste ou formation visé(e). Avec « je les choisis moi-même », le panneau riche s'ouvre en cliquant l'expérience lue dans le CV. La différence de message entre « moi » et « assistant » (complément sur les expériences sans lien avec le métier) est voulue.

## Défaut corrigé (important)
**Voie 1 : « Reprendre » sautait à la dernière étape.** Depuis le lot 4a l'objectif est choisi avant le premier passage chez l'assistant. Une personne qui choisissait son objectif puis quittait par « Accueil » retrouvait, avec « Reprendre », la page « L'assistant en ligne » (étape finale), sans lecture du CV ni « Corriger mon CV ». Corrigé dans `data/metiers.js` (`_reprendreCvRendreIntro`) : le saut à l'étape finale n'a lieu que si l'assistant a déjà répondu ; sinon retour à la page « Préparer » de la voie. Vérifié dans le navigateur (avant et après la lecture du CV). Ligne ajoutée à « Problèmes corrigés ».

## Notés, non corrigés
- Même condition (`objectif` posé + voie « maj ») dans `_majCvRendreIntro` (introduction de l'ancienne route `mettre-a-jour-cv`, vers la ligne 6506) : peu atteinte depuis la tuile unique. À reprendre avec le reste du nettoyage de l'ancien parcours.
- Le script de test existant `reprendreVoie1/2` (protocole du 11/11) est périmé : il ignore la question « Avant de commencer » et les nouveaux sélecteurs d'objectif. À mettre à jour (écarts du script, pas de l'application).
- Le test de reprise du protocole passe par l'adresse `#reprendre-cv` et non par la tuile : il signale à tort « aucun bouton Reprendre ».

## Non vérifié
Dépôt par fichier (PDF, Word, photo), mode sombre, voie 3 avec un CV riche (plusieurs expériences, certifications, loisirs), vraies réponses de l'assistant.
