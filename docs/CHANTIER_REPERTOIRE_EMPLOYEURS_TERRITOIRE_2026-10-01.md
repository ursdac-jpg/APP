# Chantier « Les employeurs de mon territoire » (titre de travail) - conception ouverte le 2026-10-01, Mode A

> **Statut : contexte et philosophie posés avec Denis en conversation. Aucun code, aucune maquette.** Deuxième candidat à développer, à comparer au chantier `CHANTIER_UN_CV_PLUSIEURS_METIERS_2026-09-30.md` avant de décider lequel coder d'abord. Ce fichier est la mémoire commune des comptes et des fenêtres : le lire en premier.

## 1. Origine (Denis, 2026-10-01)
Forte suggestion de sa tutrice, CIP, qui a tenu pendant une quinzaine d'années un **carnet papier des partenaires du département** (freins, accompagnement, emploi, insertion). Denis a récupéré son dernier carnet (environ 4 à 5 ans) : certains acteurs sont toujours sur le terrain. Une partie de cette matière nourrit déjà « Comprendre le cadre ». La tutrice a aussi demandé un module d'offres d'emploi.

## 2. Philosophie (décidée par Denis)
- **Pas de répertoire d'offres, pas d'offres venant de notre plateforme.** Raison : beaucoup de plateformes relaient des offres périmées, irréalistes ou fausses, parce que leur intérêt est le trafic. Denis ne cautionne pas ce modèle et ne fait pas référencer ces sites.
- **Aucune responsabilité sur un nombre d'offres** : ce n'est pas l'application qui le publie.
- **Transparence maximale.**
- **On montre des portes, pas des annonces** : des employeurs installés depuis des années, par secteur et par bassin d'emploi, où l'on peut se présenter et déposer une **candidature spontanée** (nom, lieu, téléphone, courriel si public, page de recrutement du site si elle existe). Y compris les secteurs en demande ou en tension, et peut-être des structures ou secteurs émergents.
- **La recherche d'offres du moment** reste une fonction **d'aide à la recherche** (un prompt court que la personne lance chez un assistant), pas une base : voir section 3.

## 3. Deux parties, et leur place
- **A. Prompt de recherche d'offres en direct**, à partir du CV de la personne (autres métiers aux compétences transversales) **ou** d'un métier tapé (le même métier sous d'autres noms). **C'est la même fonction que celle du chantier « Un CV, plusieurs métiers » : un seul propriétaire, ce chantier-là.** Ici, seulement une entrée de plus : un métier tapé sans CV.
- **B. Répertoire d'employeurs du territoire** : c'est le cœur propre de ce chantier. Une base à constituer et à tenir à jour.
- **Frontière avec « Comprendre le cadre »** : les structures d'accompagnement et de levée des freins (Mission locale, PLIE, etc.) **restent** dans « Comprendre le cadre ». Ce chantier ne contient que des **employeurs**.

## 4. Points francs relevés par Claude (avant tout plan)
1. **Le coût est dans les données, pas dans le code.** 20 employeurs par secteur, plusieurs secteurs, plusieurs bassins : des centaines de lignes à vérifier et à tenir à jour par une seule personne. Démarrer petit (un bassin, une dizaine par secteur) puis étendre.
2. **« Recrute régulièrement » n'est pas vérifiable sur le web.** Critères vérifiables : ancienneté (registre Sirene), présence d'une page de recrutement. Le savoir de terrain (carnet de la tutrice) est précieux mais **vieux de 4 à 5 ans : chaque ligne doit être revérifiée** (l'employeur existe, coordonnées, site).
3. **Choisir les secteurs sur des données, pas sur l'impression** : l'enquête BMO de France Travail donne les projets de recrutement et la difficulté par bassin (vérifié le 2026-10-01, voir section 12 du chantier « Un CV, plusieurs métiers »).
4. **Tous les employeurs ne se prennent pas en candidature spontanée** : le médico-social public, les collectivités et l'hôpital passent par des portails officiels ou des concours. Chaque ligne doit dire **comment candidater**.
5. **Agriculture** : éviter les coordonnées de personnes (exploitants) ; viser coopératives, groupements d'employeurs, organismes professionnels.
6. **Coordonnées d'entreprise uniquement, jamais de personne nommée** (données personnelles). Courriel seulement s'il est générique et public.
7. **Neutralité** : nommer 20 employeurs avantage ceux-là. Écrire publiquement les critères de choix, dire « liste non exhaustive, aucun partenariat, aucune rémunération », prévoir une adresse pour demander un retrait.
8. **Fraîcheur** : date de vérification sur chaque ligne, même mécanisme que `modules/comprendre-le-cadre/liens-verifies.txt` (un lien ou une coordonnée n'est affiché que s'il est daté), avec une durée de validité à fixer (par exemple 12 mois), au-delà « à revérifier ».
9. **Se présenter chez un employeur est un acte délicat pour un public fragile** : prévoir des conseils très simples (téléphoner d'abord, quoi dire), à relier aux modules de candidature spontanée existants.

## 5. Fiche employeur envisagée (à valider en maquette)
Nom, secteur, bassin, commune, adresse, téléphone du standard, site, page de recrutement (oui ou non, lien), **mode de candidature** (spontanée possible, portail officiel, concours), pourquoi il figure dans la liste (ancienneté, secteur qui recrute), source, **date de vérification**.

## 6. Lien avec « Un CV, plusieurs métiers »
Les lettres de candidature spontanée de ce chantier-là sont **génériques** (pas de nom d'entreprise). Ce répertoire fournit les **destinataires**. Lien à garder simple dans la première version : aucun module n'en dépend pour fonctionner.

## 7. Verdict préliminaire : GO AVEC RÉSERVES
Code simple (liste filtrable, registre daté), **charge de données lourde** et maintenance continue. Décisions encore ouvertes : nom, volume de départ, bassin de départ, qui vérifie sur le terrain (Claude prépare, Denis et sa tutrice valident), état numérique du carnet de la tutrice, place sur l'accueil.

## 8. Tri des réponses de Perplexity et de ChatGPT (2026-10-01, soir)

**Vérifié par Claude** : la page France Travail de **La Bonne Boîte** existe (« potentiel d'embauche » calculé par une étude de millions de données, seules les entreprises à fort potentiel apparaissent, méthode non détaillée) ; ses **conditions d'utilisation** interdisent la reproduction de la marque et du contenu sans autorisation, précisent que le potentiel est calculé chaque mois, et que **chaque entreprise peut s'opposer à tout moment** (CGU du 2023-10-18). La Bonne Boîte n'est donc **pas** l'enquête BMO (qui interroge les employeurs, sans nommer ceux qui répondent) : c'est un calcul prédictif par entreprise. **Non vérifié** : licences exactes des jeux Urssaf, adresse de l'Annuaire des Entreprises, usage de La Bonne Boîte sans compte France Travail.

**Conséquences retenues** : (1) **ne jamais copier** les résultats de La Bonne Boîte dans notre base : seulement un **bouton qui y renvoie** (sortie de l'application, avec mention) ; (2) identité, ancienneté, activité et effectif d'un établissement viennent de **Sirene** (Licence Ouverte) ; le contact réutilisable est celui que l'employeur publie lui-même sur **son site** ; (3) BMO, Data Emploi et Urssaf servent à **choisir les secteurs**, pas à nommer des employeurs ; (4) **exclure les entreprises individuelles** (l'adresse d'un entrepreneur individuel peut être personnelle) ; (5) aucun indicateur « recrute régulièrement » n'existe en source publique : ne jamais l'écrire.

**À garder (ChatGPT)** : volume de départ **5 secteurs x 8 à 10 employeurs, environ 40 à 50** ; vérification légère tous les 6 mois et complète tous les 12 mois, date très visible ; page publique « Comment les employeurs sont choisis » avec critères vérifiables (établissement dans le département, existence légale Sirene, site officiel, coordonnées publiques) ; **décrire le fonctionnement, pas la fréquence** (« dispose d'une page recrutement », « candidatures spontanées mentionnées sur le site », « recrutement par concours » au lieu de « recrute régulièrement ») ; mention « ni recommandation ni garantie de recrutement » et « liste non exhaustive » ; lien « Une information est incorrecte ? » avec correction ou retrait ; données limitées (adresse professionnelle, standard, site, adresse générique publique, jamais de personne nommée) ; « repères avant d'agir » ; rubrique **« Comment candidater ici ? »** (spontanée, portail officiel, concours, intérim, dépôt sur place) ; bouton « Autres employeurs du même secteur » vers une recherche externe. **À nuancer** : ChatGPT écarte l'ancienneté ; on garde « installé depuis [année] » **comme fait** (date de création de l'établissement dans Sirene), jamais comme garantie ou recommandation. **À écarter** : tout adjectif de jugement (« bonne entreprise », « réponse rapide »).

**Question de valeur à trancher par Denis** : La Bonne Boîte existe, est officielle et gratuite. L'apport propre de notre répertoire serait : choix local par un CIP, mode de candidature (concours, portails, public et médico-social), absence d'algorithme. Recommandation : **liste courte et soignée (40 à 50) + un bouton La Bonne Boîte par métier**, plutôt que de refaire cet outil.

## 9. Décisions de Denis (2026-10-01, soir)
- **Nom validé : « Les employeurs de mon territoire ».**
- **Assistants** : on garde l'existant (ChatGPT utilisable gratuitement sans compte, les autres demandent un compte). Pas de refonte du choix d'assistant ; les demandes restent courtes, avec bouton « Copier ».
- **Volume : Denis refuse de se limiter à une liste courte** (exemple : une quinzaine d'enseignes de supermarché dans le seul commerce). Reformulation retenue : le plafond ne se fixe pas par secteur mais par **ce qu'on sait vérifier et revérifier**. Deux types de fiches : **enseignes** (une fiche par enseigne : page de recrutement, mode de candidature, établissements du territoire repérés par Sirene ; entretien léger) et **employeurs locaux** (une fiche par établissement ; entretien plus coûteux). Démarrage sur un bassin, tout ce qui ne peut pas être vérifié n'entre pas.
- **La Bonne Boîte** : n'est pas une source de notre liste ni un filtre. Seulement un bouton complémentaire (métier + ville) pour la personne. Un employeur absent de La Bonne Boîte peut figurer chez nous, et inversement.

## 10. Cadre fixé par Denis (2026-10-01, soir)
- **Premier bassin : Bergerac (Dordogne, 24).** Le carnet de la tutrice est **en papier** : Denis le photographiera, Claude lira les photos pour transcrire et vérifier. **Avant toute transcription : accord de la tutrice pour la reprise, et retrait de tout nom de personne** (le carnet contient sans doute des contacts nominatifs, interdits dans l'application).
- **Échéance : entretien dans environ deux semaines (vers le 2026-10-15) avec des responsables départementaux** (OPCO, département, France Travail, mission locale). Denis souhaite présenter l'application avec ces deux modules, ou un seul s'il n'y a pas le temps. Objectif de fond : l'emploi, pas seulement le CV.
- **Ambition : à terme, les 21 secteurs de l'application** (`data/secteurs.js`).
- Idée : ces partenaires connaissent le terrain ; leur demander à l'entretien de relire ou compléter les listes, sans contrepartie ni partenariat commercial (neutralité).

## 11. Les six images de concept (ChatGPT, 2026-10-01) : revue et corrections à porter à la maquette détaillée

Images : `docs/images_chantiers/employeurs_ecran1` à `employeurs_ecran6_*_2026-10-01.webp` (disposition seulement, textes à reprendre). Même univers visuel que « Un CV, plusieurs métiers ». **Verdict de faisabilité préliminaire : GO.** Aucun écran ne demande de serveur : fichier de données daté + écrans de liste, de fiche et de recherche, `tel:`, recherche branchée (accueil et Lexique), mode sombre. Le coût est dans les données.

**À corriger / décider** :
1. **Écran 1** : « 12 employeurs » partout est faux (et un grand nombre peut passer pour un classement). Les 21 secteurs ne seront pas tous remplis : prévoir l'état « Pas encore de liste pour ce secteur » avec renvoi vers « Chercher par moi-même ». **Territoire non couvert** (toute personne hors Bergerac au lancement) : état dédié, jamais un écran vide. Le « Changer » doit gérer des bassins, pas seulement des départements. La recherche secteur ou métier s'appuie sur les secteurs de `data/metiers.js`.
2. **Écran 2** : tri **alphabétique** annoncé (jamais de classement implicite) ; ajouter le bouton « Autres employeurs du même secteur » (vers l'écran 4 prérempli) ; prévoir plus de lignes (pagination ou « Voir plus »).
3. **Écran 3** : les cases de « Comment candidater ici ? » ressemblent à des cases cliquables alors qu'elles informent seulement (risque de faux bouton) : les remplacer par des pastilles d'information, et dire « Non indiqué par l'entreprise » au lieu de laisser une case vide. « Installé depuis » est une date **par établissement** (Sirene) : à porter sur chaque magasin, pas sur l'enseigne. « Voir sur une carte » est une dépendance nouvelle : proposer un lien OpenStreetMap ou la simple copie de l'adresse, avec « vous quittez l'application ».
4. **Écran 4** : la brique de demande doit accepter **un à dix métiers** (le premier module en envoie plusieurs). Vérifier avant de promettre : La Bonne Boîte est-elle utilisable sans compte, et peut-on lui passer métier et ville dans l'adresse ?
5. **Écran 5** : « revérifiées au moins une fois par an » est un **engagement** de Denis (à tenir ou à reformuler). « Nous écrire » exige une **boîte de réception réelle et quelqu'un qui répond** : à décider avant la démonstration (adresse dédiée ou formulaire), sinon retirer le bouton. « Aucune rémunération des employeurs » doit rester vrai.
6. **Écran 6** : conforme, gros boutons « Appeler » (`tel:`) et « Voir le site ». Reste à dessiner : la liste sur téléphone.
