# Audit des frontières : « Découvrir mes compétences » face aux autres modules

Créé le 26/10/2026. Mode A, `[effort : haut]`. Cahier du chantier : `docs/CHANTIER_DECOUVRIR_MES_COMPETENCES_2026-10-26.md`. Audit fait sur le code réel (routes de `js/app.js`, prompts de `prompts/`, `data/competences.js`, `docs/BRIQUES_COMMUNES.md`, `docs/SCHEMA_CV.md`, modules `reperes`, `lettre-core`, `cv-sans-assistant`). Demande de Denis : ne rien appauvrir, ne rien dupliquer.

## 1. Carte de l'application (ce qui existe)

- **Mes documents** : Créer un nouveau CV (à la main, avec l'assistant, « À partir de mon récit »), Reprendre mon CV (trois voies), Mettre à jour, Reformuler et présenter.
- **Me préparer à candidater** : Écrire ma lettre avec l'assistant, M'entraîner à un entretien, Employeurs.
- **Boîte à outils** : Mes Repères, Mon Carnet, Lexique. Texte actuel : « Des outils pour mieux vous connaître et comprendre le monde professionnel, utilisables à tout moment ». **C'est la place naturelle du nouvel outil.**
- **Outils d'analyse** (demandent un CV déjà créé) : Analyser ma candidature (Bilan), Un regard sur mon CV, Les mots de votre CV (ATS), Cohérence de mon dossier.
- **Se tenir informé** : Comprendre le cadre, Comprendre les chiffres, Qui fait quoi.
- **Vous hésitez encore ?** : Comparer mes pistes, Un CV plusieurs métiers.

## 2. Frontières, module par module

Pour chacun : ce qu'il fait, le recoupement réel, **ce que nous faisons / ce que nous ne faisons pas**, ce que nous réutilisons.

| Module | Ce qu'il fait | Recoupement | Frontière (nous faisons / nous ne faisons pas) | Réutilisation |
|---|---|---|---|---|
| **À partir de mon récit** | Pour quelqu'un qui n'a jamais fait de CV : récit, fragments, 5 formulations, questions ciblées, rédaction d'un CV. | Matière voisine, **but différent** (décision de Denis). | Nous partons de documents existants et ne rédigeons **aucun CV**. Aucune fusion, aucun dédoublonnage. | Seulement des règles de prompt : retrait du contexte de vie personnel, questions ciblées, « tolérance aux fautes ». |
| **Créer un nouveau CV** (questionnaire « Votre parcours ») | Les choix de la personne (activités, actions, environnement, valeurs) donnent des compétences **déduites** par une table (`mappingCompetences`, `deduireCompetences`). | Les deux produisent des compétences, mais l'une les déduit d'une table, l'autre les relève **avec preuve**. | Nous ne touchons pas à cette déduction. | Rien à modifier. Plus tard, une compétence validée pourrait passer avant une compétence déduite (décision ultérieure). |
| **Votre profil** (`pageRevelation`, bloc « Vos compétences ») | Affiche les compétences en 3 familles colorées, avec légende, descriptif au clic, croix de retrait réversible. | **Recoupement d'affichage le plus fort.** | Nous ne créons pas une 2e page « profil ». Cette page reste dans le parcours guidé. | **Réutiliser** : les 3 familles et leurs couleurs, la légende, `DESCRIPTIFS_COMPETENCES`, le geste de retrait réversible. |
| **Reformuler et présenter mon CV** (`reformuler-cv.md`, point 6 « Vocabulaire des compétences ») | Sur un CV complet et un poste visé, rapproche le vocabulaire des compétences du poste, en deux versions. | Adaptation du vocabulaire. | Nous ne réécrivons pas le CV et ne le calons pas sur un poste précis : nous expliquons, donnons des synonymes et un niveau de langage. | Plus tard (si les essais le justifient) : section optionnelle dans ce prompt. |
| **Écrire ma lettre** (`lettre-co.md`, panneau « Vos appuis », B.48) | Écrit la lettre ; accepte jusqu'à trois lettres de recommandation, dont une envoyée. | Lecture de lettres de recommandation. | Nous n'écrivons aucune lettre. | **Réutiliser le dépôt des lettres de recommandation** (`appuisLettreCo.js`, B.48) et la fonction de message `construireMessageLettreCo` (B.45) comme modèle. |
| **Entretien** (fiche `entretien-accueil.md`, entraînement `entretien.md`) | Fiche de préparation : forces avec preuve, questions, cas pratique, jour J. Entraînement : simulation du recruteur. | **Frontière la plus délicate : « défendre à l'oral ».** | Nous donnons, pour chaque compétence, **2 à 3 phrases pour la dire** et les 4 questions du récit court. Nous ne simulons pas le recruteur, ne posons aucune question de recruteur, ne faisons aucun cas pratique, ne parlons pas du jour J. | Plus tard : la fiche pourrait lire notre document (le prompt gère déjà « fiche déjà établie / pas de fiche »). |
| **Analyser ma candidature (Bilan)** | Diagnostic d'un CV face à une offre, recommandations. | Aucun si nous restons sur la valorisation. | **Jamais de note, jamais de comparaison à une offre, jamais de « point à corriger ».** | Brique de dépôt de CV et de lettre. |
| **Un regard sur mon CV** (`regard-recruteur.md`) | Ce qu'un recruteur remarquera ; pose des questions sur « une compétence citée sans exemple ». | Même matière que notre « à préciser avec vous », ton opposé. | Notre « à préciser » est une invitation à compléter, jamais un défaut. Pas de vocabulaire de faiblesse. | Aucune. |
| **ATS** (`ats.md`) | Vocabulaire du CV face à un tri automatique. | Faible. | Nous ne parlons pas de mots-clés ni de tri. | Aucune. |
| **Cohérence de mon dossier** | Vérifie que CV, lettre et entretien racontent la même histoire ; « absence transversale » d'une compétence. | Moyen, plus tard. | Nous ne vérifions rien. | Plus tard : notre document pourrait servir de référence à Cohérence. Pas maintenant. |
| **Un CV, plusieurs métiers** / **Comparer mes pistes** | Orientation : métiers proches, comparaisons. | Faible : « compétences transférables ». | **Nous ne proposons jamais de métier.** | Aucune. |
| **Mon projet / Votre objectif** (et la rubrique « projet professionnel » du CV) | Métier visé, mode de recherche, projet. | **Recoupement si nous demandons une vision à 2 et 5 ans.** | Voir question Q7 : ne pas redemander ici ce qui existe là. | Lire, ne pas dupliquer. |
| **Mes Repères / Mon Carnet** | Réflexions gardées / notes libres, **jamais lues ni analysées** (doctrine du Carnet). | Aucun. | **Le Carnet n'est jamais lu par notre outil.** | Option : « Garder comme repère » une compétence via le contrat d'ancrage (`CONTRAT_ANCRAGE_ERIP.md`). Basse priorité. |
| **Lexique / Comprendre le cadre** | Définitions et dispositifs (bilan de compétences, VAE, compétences de base). | Aucun si nous ne les expliquons pas. | Nous n'expliquons ni bilan, ni VAE, ni passeport : un renvoi « voir aussi ». Aucune fiche par compétence (décision de septembre maintenue). | 2 ou 3 fiches seulement (Q4). |

## 3. Ce qu'aucun module ne fait aujourd'hui (l'espace libre)

1. **Lire ensemble plusieurs documents** (CV, lettres de motivation, lettres de recommandation) et **croiser** les sources.
2. Pour chaque compétence : **la preuve** (l'extrait), **un niveau de confirmation**, **une explication en mots simples**, des **synonymes**, une **phrase pour la dire** (CV et oral).
3. **Faire comprendre ce qu'est une compétence** (pédagogie d'introduction).
4. Un **document « Mes compétences »** gardé par la personne, qui sert ensuite d'**appui** (option, après essais).
5. Le tout **sans note, sans comparaison, sans métier proposé**.

## 4. Carte de faisabilité (étape 2 de la méthode)

| Fonction envisagée | Existe ? | Risque |
|---|---|---|
| Dépôt d'un CV | Oui : `ouvrirAssistantDepotCV`, `obtenirOuDeposerTexteCV`. « Plusieurs CV » : **à vérifier**. | Moyen |
| Dépôt d'une lettre de motivation | Oui, dans l'entretien : `_prepaEntretienDeposerLettre`. | Faible |
| Dépôt des lettres de recommandation | Oui : B.48 (`appuisLettreCo`, `_coLettreDeposerReco`). | Faible |
| Choix de l'assistant + collage de la réponse | Oui : B.10, B.2, `htmlCollageInstantane`. | Faible |
| Construction du message copié | Modèle : `construireMessageLettreCo` (fonction pure testée). **Nouveau message à écrire.** | Moyen |
| Nouveau prompt « relever les compétences avec preuve » | **À créer** et à essayer sur de vrais documents. | **Élevé** (qualité, inventions, taille de la réponse) |
| Lecture de la réponse (JSON) et réparation | Oui : `extraireBlocJSONDepuisTexte`, réparation B.20. **Nouveau format.** | Moyen |
| Écran de validation ligne par ligne (3 gestes) | Gestes voisins existent (retrait réversible de « Votre profil »). **Écran nouveau.** | Moyen |
| Document « Mes compétences » (PDF, Word, texte) | Machinerie d'export de la fiche d'entretien à réutiliser. **Mise en page nouvelle.** | Moyen |
| Champ `dossier.mesCompetences` + sauvegarde (disquette) + remise à zéro | **À créer dans `js/app.js`** (forme du dossier partagée : grep sur tout le dépôt, test navigateur). | **Élevé** (fonction partagée) |
| Page d'introduction, entrée Boîte à outils, recherche de l'accueil et du Lexique | Patrons existants : `htmlPageIntroModule` (B.5). | Faible |
| Nom, route, identifiants | **Piège** : `decouverte`, `decouverte-intro`, `decouverte-competences.md` désignent déjà l'ancien parcours (« À partir de mon récit »). Le nouvel outil doit avoir ses propres identifiants (`mesCompetences`, `mes-competences.md`). Renommer les libellés : grep complet (leçon 9.33). | Moyen |
| Branchement dans les prompts du CV, de la lettre, de l'entretien | **Pas dans la version 1** : seulement après essais avec et sans le document. | Décidé par les essais |

**Verdict préliminaire : GO AVEC RÉSERVES.** Réserves : (1) taille d'un message qui contient plusieurs documents ; (2) qualité du prompt, à valider sur de vrais documents avant d'investir dans l'écran ; (3) toucher la forme du dossier, fonction partagée ; (4) vision à 2 et 5 ans qui recoupe Mon projet (Q7) ; (5) collision de noms avec l'ancien parcours.
**Mode nuit : NON APTE** (maquette absente, prompt non essayé, Q7 et Q8 ouvertes).

## 5. Ordre de travail proposé

1. `[effort : haut]` Trancher Q1 à Q8.
2. `[effort : haut]` **Prompt d'abord** : écrire `prompts/mes-competences.md`, l'essayer à la main sur 4 ou 5 vrais profils (sans code), mesurer. Si le relevé n'est pas fiable, on s'arrête avant d'avoir construit un écran.
3. `[effort : haut]` Maquette détaillée (écrans : dépôt, validation, document, introduction).
4. `[effort : haut]` Audit complet avant code et inventaire des briques (étape 4 de la méthode).
5. `[effort : moyen]` Code : module, dossier, écrans, export, recherche, introduction.
6. `[effort : haut]` Essais « avec ou sans le document » dans les prompts du CV, de la lettre et de l'entretien, un par un.

## 6. Questions nouvelles pour Denis

- **Q7** La vision à 2 et 5 ans : la laisser à « Mon projet » (recommandé : en version 1, « Ce qui me donne envie » seulement, avec un renvoi vers Mon projet), ou la poser aussi dans le nouvel outil ?
- **Q8** Entrée et public : dans la Boîte à outils (recommandé), avec **au moins un document déposé** ; sans aucun document, renvoi vers « Créer un nouveau CV » (et « À partir de mon récit »). Cela trace la frontière nettement.
