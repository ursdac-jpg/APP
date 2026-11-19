# Recensement des longues pages pour la flèche « Remonter » (17/11/2026)

Consigne 423 (Denis, 16/11/2026) : recenser les pages très longues de l'application et proposer la même flèche que celle de la page Nouveautés, en la mutualisant avant de la copier.

**Méthode.** Chaque route de `js/app.js` (table `routes`) a été ouverte dans le navigateur et sa hauteur mesurée (`scrollHeight`), puis convertie en « écrans » (1 écran = environ 800 px, un ordinateur ordinaire ; sur téléphone les pages sont plus longues). La mesure est faite à l'arrivée sur la page, sans rien déplier : une page qui s'allonge ensuite (résultats, listes, blocs ouverts) est signalée à part.

## Très longues : 20 écrans et plus (12 pages)

| Page | Route | Écrans |
|---|---|---|
| Introduction | `introduction` | 35 |
| Créer un nouveau CV | `creer-cv` | 29 |
| Lettre et entretien en version préparée | `preparer-lettre-entretien` | 25 |
| Mes Repères | `reperes` | 25 |
| Les mots de votre CV (ATS) | `ats-intro` (et `ats`) | 25 |
| Un regard sur mon CV | `regard-recruteur-intro` (et `regard-recruteur`) | 24 |
| Comparer mes pistes | `aide-decision-intro` (et `comparer-pistes`) | 24 |
| Comprendre le cadre (introduction) | `se-tenir-informe-intro` | 22 |
| Reprendre mon CV | `reprendre-cv` | 22 |
| À partir de mon récit | `decouverte-intro` (et `decouverte`) | 21 |
| Analyser ma candidature | `bilan` | 21 |
| Cohérence de mon dossier | `coherence-transversale` | 21 |

## Longues : 10 à 19 écrans (16 pages)

Un CV, plusieurs métiers (introduction) 19 · Comprendre les métiers (introduction) 18 · M'entraîner à un entretien 18 · Reformuler mon CV 18 · Écrire ma lettre 18 · Le refaire moi-même (introduction) 17 · Créer mon CV avec l'assistant 16 · Créer mon CV à la main 16 · Garder et compléter mon CV 15 · Comprendre les chiffres (introduction) 15 · Découvrir mes compétences (introduction) 14 · Comprendre le cadre 14 · La vidéo de présentation 13 · Employeurs près de chez moi (introduction) 12 · Reprendre votre CV (sans assistant) 11 · Vos informations 11.

## Moyennes : 4 à 9 écrans (11 pages)

Qui fait quoi (introduction) 10 · Le complément de votre CV 9 · Changer de secteur 8 · Vos documents 7 · Nouveautés 6 (a déjà sa flèche) · Accueil des CV 6 · Comprendre les chiffres 5 · Avant de commencer 5 · Votre parcours 5 · Votre profil 5 · Candidater 4.

## Courtes à l'arrivée (moins de 4 écrans), mais qui peuvent s'allonger

Votre objectif 2 · Vos missions et compétences 2 · Chercher un autre métier 4 · Les métiers de ce secteur 1 · Mon Carnet 3 · Lexique 3 (s'allonge avec la liste des entrées) · Comprendre les métiers 3 (s'allonge avec les résultats) · Qui fait quoi 1 (s'allonge avec les résultats d'une recherche) · diaporama d'introduction (une seule vue, aucune flèche utile).

## Ce que le code actuel permet

- Un point central existe : `naviguerVers()` écrit la route courante dans `data-route` de la page. Un composant commun peut donc vivre une seule fois, hors des pages, sans toucher aux 43 modules.
- Le coin bas droit est libre : les boutons fixes de droite (Carnet, Journal, panier) sont en haut, la barre de navigation est en bas, les messages passagers sont au centre.
- Aujourd'hui la flèche de Nouveautés (`#nvVersFiltre`, `_nvBrancherFlecheFiltre` dans `modules/nouveautes/index.js`, style `.nv-vers-filtre` dans `css/style.css`) est écrite pour cette seule page : elle ramène aux filtres, ou en haut s'il n'y en a pas.

## Proposition (en attente du choix de Denis)

Un composant commun, chargé une fois, qui affiche la flèche sur n'importe quelle page dès que la personne a défilé de plus d'un écran et demi, et la masque sinon. Nouveautés devient son premier cas particulier (il garde « Remonter aux filtres » en lui donnant sa cible), ce qui supprime sa copie. Effort moyen.
