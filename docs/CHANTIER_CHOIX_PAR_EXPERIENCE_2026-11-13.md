# Chantier : demander les choix expérience par expérience (13/11/2026)

**Origine** : simulation du 13/11/2026 (section 32 bis de `CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md`). Une personne qui coche, dans une seule liste, les choix de 2 métiers retrouve chacun dans 78 % des cas (10 premiers), 3 métiers 66 %, 5 métiers 43 %. Relever les plafonds n'y change rien. C'est le principal facteur d'imprécision des propositions.

**MISE DE CÔTÉ le 14/11/2026 : Denis recentre sur le CV (consigne 283) ; voir `docs/CHANTIER_CV_A_PARTIR_DES_FICHES_ROME_2026-11-14.md`. Cette maquette ne sert qu'aux propositions de métiers.** **État (13/11/2026, soir) : audit fait, maquette cliquable faite (`docs/MAQUETTE_CHOIX_PAR_EXPERIENCE_2026-11-13.html`, vrais catalogues de l'application, contrôles câblés, mode sombre, trois scénarios : 3 expériences, 1 expérience, aucune expérience). Option A montrée : un sélecteur d'expérience au-dessus des trois questions habituelles. Rien codé. Questions à Denis : (1) disposition A validée ? (2) « Continuer » demande-t-il une seule expérience complète (recommandé) ou toutes ? (3) maximum de choix par expérience 8 / 8 / 6 (recommandé) ? (4) bouton « Reprendre les choix d'une autre expérience » ?**

## Situation actuelle (code réel)

- Trois questions sur la page « Votre parcours » (`_vpQuestions()`, `js/app.js` vers la ligne 6397) : « avec qui, avec quoi » (`dossier.activites`, 16 au plus), « ce que vous faisiez souvent » (`dossier.actions`, 16), « où vous travailliez » (`dossier.environnement`, 12). Les consignes disent déjà « repensez à vos expériences passées » : toutes les expériences sont mélangées dans la même liste.
- Ces trois listes sont globales. Elles servent : au profil des métiers (`construireProfil()`, lignes 3403 à 3420), aux savoirs et compétences du CV (lignes 3332, 3360 à 3378, 3473 à 3483), et à une migration d'anciens identifiants (ligne 7797).
- Les expériences (`dossier.experiences[]`) portent seulement : poste, entreprise, lieu, années, missions (texte). Aucun lien avec les choix.
- « Reprendre » et « Modifier » ne passent jamais par cet écran (vérifié le 12/11/2026).

## Ce qu'il faudrait décider (pas encore proposé en maquette)

1. **Où demander** : (A) un seul écran qui garde les 3 questions mais avec un sélecteur « pour quelle expérience ? » ; (B) un écran par expérience (les 3 questions à chaque fois) ; (C) rien ne change à l'écran, mais le classement apprend à séparer les groupes de choix (moins fiable : le calcul ne sait pas quels choix vont ensemble).
2. **Donnée** : `dossier.experiences[i].choix = { actions, activites, environnement }`, les listes globales deviennent la réunion calculée (aucune autre fonction ne change). Sauvegarde et disquette : à vérifier (un ancien dossier sans `choix` doit continuer à fonctionner).
3. **Calcul** : un classement par expérience, puis fusion (le meilleur rang de chaque métier) ; l'expérience en cours ou la plus longue en tête.
4. **Personnes sans expérience** : écran inchangé (liste unique).

## Risques à dire clairement

- Écran à refaire en partie, avec maquette cliquable et questions avant le code. Moyen à élevé.
- Rien d'autre ne doit casser : grep sur tout le dépôt avant de toucher aux listes globales (leçon du 20/09/2026).
- Les vidéos de présentation et l'image du parcours devront être refaites si l'écran change.

`[effort : haut]`

## Mesure du 13/11/2026 : une seule liste ou une liste par expérience

- **Méthode** : personnes simulées qui ont exercé 3 (40 personnes) ou 5 métiers (30 personnes) tirés au hasard dans la base ; pour chaque métier, 3 actions, 2 « avec qui ou quoi » et 1 lieu au hasard parmi ceux de sa fiche. Deux façons de classer : une seule liste qui réunit tout, ou un classement par expérience puis fusion (tourniquet, 10 propositions). Mesure : part des métiers exercés retrouvés dans les 10 propositions. Réserve (leçon 9.156) : les personnes sont fabriquées à partir des fiches ; la comparaison entre les deux méthodes reste équitable, mais les chiffres absolus sont optimistes.
- **Résultat** : 3 expériences : une seule liste **40 %**, par expérience **83 %**. 5 expériences : une seule liste **23 %**, par expérience **69 %**.
- **Couverture** : chaque fiche (1 925) offre au moins un choix dans chacune des trois questions (une exception corrigée : Employé de ménage à domicile n'avait aucun « avec qui ou quoi » ; test garde-fou ajouté).
- **Constat sur les compétences du CV** : `deduireCompetences()` (js/app.js) déduit aujourd'hui les compétences des seules fiches de choix (catalogues), pas des fiches du ROME, et sans lien avec une expérience précise. Piste à auditer : proposer, par expérience, les compétences de la fiche proche du poste, que la personne coche pour son CV.
