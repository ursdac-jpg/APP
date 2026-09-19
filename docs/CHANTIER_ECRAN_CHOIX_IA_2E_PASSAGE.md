# Chantier — Écran de choix IA après le 2e passage IA (contexte complet pour reprise)

Document rédigé le 2026-08-06, juste après ce chantier (commit `05873bc`). Objectif : donner à quiconque reprend ce sujet (humain ou IA, dans une autre fenêtre/un autre compte) tout le contexte nécessaire sans avoir à retracer l'historique de la conversation d'origine.

**Application** : assistant de parcours professionnel / CV (candidat), fichier principal `js/app.js` (~22 000 lignes, tout en JS global chargé via balises `<script>` classiques dans `index.html`, aucun bundler/module ES). Serveur de dev : `serveur_dev.py` (voir `.claude/launch.json`), Cache-Control no-cache — mais **le navigateur, lui, peut quand même mettre en cache** : toujours vérifier en navigation normale (pas privée) après une modif, et faire un Ctrl+F5 en cas de doute avant de conclure à un bug.

---

## De quel écran parle-t-on ?

C'est l'écran **"Choisissez ce que l'IA propose pour votre CV"** — une fenêtre `ouvrirFenetreERIP()` en plusieurs onglets (Profil, Intitulé, Accroche, Expériences, Compétences à valoriser, Compétences personnelles, Stratégie de candidature, Rubriques à masquer, Formation/expérience perso & loisir), qui s'ouvre juste après que la personne colle la réponse de l'IA suite au **2e passage IA** (celui qui produit `dossier.ia.cv.recommandations` — adaptation métier, expériences à mettre en avant, compétences, etc., par opposition au 1er passage qui sert juste à extraire un CV existant).

**Écran commun à tous les parcours** (offre, candidature spontanée, reconversion, stage, alternance, immersion) — un seul et même code, jamais dupliqué par parcours.

Deux points d'entrée dans `js/app.js` :
- `ouvrirRevoirPropositionsIA()` (~L11189) — bouton "Revoir les choix de l'IA" / option "Revoir les choix" après import d'une session JSON.
- Directement dans le handler du bouton "Importer" (~L11700, juste après `analyserReponseIACV(texte)`) — 1er passage, juste après avoir collé la réponse.

Les deux appellent `ouvrirEcranChoixReponseIACV(brouillon, onValider, onRetour)` (~L13791), qui affiche `genererEcranChoixReponseIACV(brouillon)` (~L13773) dans `#corpsEcranChoixIACV`.

Le "brouillon" éditable est construit par `creerBrouillonChoixIACV(valeursIA)` (~L13217) à partir soit de la réponse IA brute (1er passage), soit de `dossier.ia.cv` (réouverture). Au clic sur "Je valide", `appliquerBrouillonChoixIACV(brouillon)` (~L13979) transforme ce brouillon en valeurs finales, réécrites dans `dossier.ia.cv`.

---

## Le bug corrigé (le cœur du chantier)

**Signalé par l'utilisateur** : en rouvrant cet écran (que ce soit dans la même session, ou après avoir réexporté/réimporté le fichier JSON de session), l'onglet **Intitulé** ne proposait plus qu'**un seul** choix de titre au lieu des 5 générés par l'IA. En creusant avec l'utilisateur, il a précisé que le même problème touchait potentiellement **toutes les autres rubriques** : décocher un élément (points forts, compétences, rubriques à masquer, etc.) puis valider le faisait **disparaître pour de bon**, même en rouvrant l'écran plus tard — alors que le but explicite de cet écran est de permettre à la personne de revenir sur ses choix et remodeler son CV à tout moment (changement d'entreprise, de poste, de stratégie...).

### Cause

`appliquerBrouillonChoixIACV()` ne renvoyait que le **sous-ensemble coché** ("garder": true) pour la plupart des champs — les éléments décochés étaient purement et simplement perdus, jamais réécrits nulle part dans `dossier.ia.cv`. Au prochain `creerBrouillonChoixIACV()`, il n'y avait donc plus que ce sous-ensemble à afficher : impossible de recocher un élément qu'on avait décoché par erreur, ou de changer d'avis plus tard.

Seuls **Intitulé** et **Accroche** avaient déjà (avant ce chantier) un mécanisme de "pool complet" séparé (`titresProposes`/`accrochesProposees`) — mais `titresProposes` avait un oubli similaire (jamais réécrit dans `dossier.ia.cv` après "Je valide"), corrigé en tout premier dans ce même chantier.

### Champs concernés et corrigés

Points forts, Mots-clés, Postes recommandés, Compétences à valoriser, Compétences personnelles (fusion avec le module Découverte), Rubriques à masquer, Certifications à mettre en avant, Formation retenue (le bloc entier + ses missions), Loisir retenu (missions), Expérience personnelle à mettre en avant (missions), et les missions par expérience professionnelle (`savoirFaireParExperience`).

### Principe de la correction

Pour chaque champ, un **nouveau champ parallèle** porte le pool complet, jamais filtré (ex. `pointsForts` reste le sous-ensemble coché, utilisé partout ailleurs dans l'app sans changement ; `pointsFortsProposes` porte TOUS les éléments, cochés ou non). Au prochain `creerBrouillonChoixIACV()`, l'état coché/décoché est reconstruit par correspondance de texte entre le pool complet et le sous-ensemble coché courant.

- Nouvelle fonction générique `versListeAvecPoolComplet(pool, listeGardeeActuelle, mapper, cleItem)` (~L13236 dans `creerBrouillonChoixIACV`), réutilisée pour les listes simples (points forts, mots-clés, postes recommandés, compétences à valoriser, rubriques à masquer, certifications).
- Traitement dédié pour Compétences personnelles (fusion avec Découverte) et pour les 3 blocs "un seul élément + missions" (Formation retenue, Loisir retenu, Expérience perso à mettre en avant) — ces derniers avaient un piège supplémentaire : décocher la case du **bloc entier** le faisait disparaître intégralement, pas seulement ses missions.
- Traitement dédié pour les missions **par expérience professionnelle** (`savoirFaireParExperience`) — nouveau champ `savoirFaireParExperienceProposees`.
- Nouveaux champs par défaut ajoutés dans `creerDossierIAVide()` (~L65-160) : `pointsFortsProposes`, `motsClesProposes`, `postesRecommandesProposes`, `competencesAValoriserProposees`, `competencesPersonnellesProposees`, `rubriquesMasquablesProposees`, `certificationsAMettreEnAvantProposees`, `formationRetenueProposee`, `loisirRetenuProposee`, `experiencePersonnelleAMettreEnAvantProposee`, `savoirFaireParExperienceProposees`.
- Les 2 points d'écriture (`ouvrirRevoirPropositionsIA()` et le handler "Importer") réécrivent maintenant ces nouveaux champs — pour `pointsFortsProposes`/`motsClesProposes` explicitement (au même niveau que `pointsForts`/`motsCles`, pas sous `recommandations`), les autres passent automatiquement puisque `dossier.ia.cv.recommandations = valeursFinales.recommandations` est une réécriture complète de l'objet.

### Testé en direct dans le navigateur (2026-08-06)

Scénario riche : dossier fabriqué avec points forts, mots-clés, compétences (IA + Découverte fusionnées), rubriques à masquer, formation retenue avec missions, loisir retenu avec missions — décochage réparti sur 6 onglets différents, y compris **décocher le bloc Formation retenue entier**. Validation → réouverture de l'écran → tout réapparaît avec le bon état coché/décoché, y compris le bloc entièrement décoché (toujours visible, prêt à être recoché). Aucune erreur console à aucune étape.

### Limite connue (non rétroactif)

Les sessions déjà sauvegardées **avant** ce correctif (fichiers JSON exportés, ou dossier déjà en mémoire dans une session en cours) ont déjà perdu ce qui n'était pas coché à l'époque — non récupérable. Seuls les futurs passages IA (ou une nouvelle réouverture de l'écran après ce correctif) en bénéficient pleinement.

---

## Autre changement dans le même chantier : `cv.md`

À la demande de l'utilisateur, la consigne au point 2 du prompt (`prompts/cv.md`) est passée de **"Sélectionne 3 à 5 points forts"** à **"Sélectionne 5 à 10 points forts"**.

**Point important à connaître si on retouche ce sujet** : les "points forts" ne s'affichent **nulle part sur le CV final** (vérifié dans tous les templates Word/PDF/A5/Composeur — confirmé aussi par un commentaire explicite dans `modules/cv-core/normaliserDonneesCV.js` : "rien ne les affiche encore dans les templates existants"). Leur seul usage réel aujourd'hui : transmis en contexte à la Lettre de motivation et à l'Entretien (section "Stratégie déjà définie pour le CV", `js/app.js` ~L12672), pour rester cohérent sans répéter le CV mot pour mot.

Conséquence : augmenter la fourchette à 5-10 n'a **aucun risque de débordement de page** (contrairement à Compétences personnelles / missions de Formation, qui elles s'affichent réellement sur le CV et sont plafonnées à 5 cochées maximum côté code — `PLAFOND_COMPETENCES_PERSONNELLES`/`PLAFOND_MISSIONS_FORMATION`, `js/app.js` ~L13902/13921). Les points forts, eux, **n'ont aucun plafond de sélection** côté code — l'utilisateur a été informé de cette différence et a choisi de laisser les choses ainsi (pas de plafond ajouté).

---

## Vidéo d'accompagnement ajoutée sur cet écran

Une démonstration vidéo (`videos/choix_cv.mp4`, entrée `'choix-cv'` dans `DEMOS_VIDEO_ERIP`, `js/app.js` ~L1720) a été ajoutée, avec un bouton "Voir comment faire ses choix (vidéo)".

**Emplacement important, précisé 2 fois par l'utilisateur** : le bouton doit être **juste après la rangée d'onglets**, avant le contenu de l'onglet actif — pas tout en bas de la page après tout le contenu (1re tentative, jugée invisible car il fallait scroller). Implémenté dans `genererEcranChoixReponseIACV()` (~L13773), entre `.onglets-validation-import` (les onglets) et `.onglets-validation-import-corps` (le contenu) — regénéré à chaque changement d'onglet en même temps que le reste, donc toujours visible quel que soit l'onglet ouvert.

Texte retenu (après une 1re version jugée "un peu péjorative") : *"🎬 Une vidéo vous explique comment faire vos choix."*

**Fichier vidéo pas encore fourni au moment de la rédaction de ce document** — le code est prêt, il suffira de déposer `videos/choix_cv.mp4` (même dossier que les autres vidéos) pour que le bouton fonctionne.

---

## Travaux connexes du même jour, dans les mêmes fichiers (pour mémoire, pas le sujet principal)

- 2 bugs corrigés sur les popovers "Astuce" (CV Word `modules/cv-editor/apercuDocxIntegre.js`, CV PDF grand aperçu `js/app.js`) : un `evt.stopPropagation()` trop large bloquait le clic sur leur propre bouton vidéo (`cv-word-personnaliser`/`cv-pdf-personnaliser`) — corrigé avec une exception ciblée sur `[data-demo-video]`.
- Encart gris (fond + bordure pointillée) retiré autour de la vidéo de la page "Mon projet" (`css/style.css`, `.encart-video-mon-projet`) — ne reste que le bouton + une phrase d'invitation, jugé "gris sur gris, pas beau" par l'utilisateur.
- Vidéo "Mon projet" (`page-projet`) et vidéos Personnaliser Word/PDF (`cv-word-personnaliser`/`cv-pdf-personnaliser`) branchées le même jour, avant le sujet principal de ce document.

---

## État final

**Terminé et commité** — commit `05873bc` ("Conserve le pool complet des propositions IA (~10 rubriques) et branche la video de l'ecran de choix"), sur la branche `master`. Fichiers touchés : `js/app.js`, `css/style.css`, `modules/cv-editor/apercuDocxIntegre.js`, `prompts/cv.md`.

**How to apply si repris par une autre IA/session** : ce chantier est clos, ne pas le refaire. S'il y a un nouveau signalement sur cet écran (ex. un onglet qui perd encore des données, un autre écran de l'app avec le même défaut de conception "coché seulement = perdu si décoché"), c'est un nouveau chantier — mais le motif `versListeAvecPoolComplet()` + champs `*Proposees` est le patron à réutiliser, déjà éprouvé sur 10 rubriques différentes.
