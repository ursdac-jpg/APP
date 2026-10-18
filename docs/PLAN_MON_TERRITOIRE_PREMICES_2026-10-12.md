# Plan (prémices) du module « Mon territoire » - 2026-10-12, Mode A

> **Statut : prémices, rien n'est codé, rien n'est engagé.** Conception : `docs/CHANTIER_REPERTOIRE_EMPLOYEURS_TERRITOIRE_2026-10-01.md` (sections 1 à 12). Ce plan sera figé quand Denis aura répondu aux décisions de la section 2.

## 0. REPRISE (à mettre à jour à chaque étape)
**Dernier état (2026-10-12, nuit)** : **LES 17 RAYONS SONT MIGRÉS : 16 validés par Denis, Employeurs (à valider)**. Module FERMÉ au public. **Employeurs migré** : 3 structures déplacées, CCI, chambre de métiers et SPST fusionnés avec les fiches du répertoire, SPSTI 23/87 (87) gardé, domaine « Appui aux employeurs » ouvert. **Reste de la phase 4** : relecture finale de Denis, entretien du 2026-10-15, vérification à la main de france-travail-dordogne et france-travail-createur-dordogne (aucune adresse au registre), ouverture au public (MT_OUVERT), retrait du bloc « Annuaire associatif » de outils/veille.html. **REPRISE SANS PERTE (conversation longue)** : méthode rodée pour chaque rayon restant = (1) inventaire par script du rayon (structures, portée, partagées, déjà dans le répertoire) ; (2) classer : déplacées / services en ligne gardés (D8) / Haute-Vienne gardée / déjà migrées à texte propre gardées / générique fusionné ; (3) outil `scripts/migrerRayonTerritoire.js` (déjà dans le dépôt) (usage : `node scripts/migrerRayonTerritoire.js '<json>'`, config JSON : rayon, libelle, collecte, date, types par structure, fusionnes, ajouterRayon ; il ajoute les lignes à `lieux.txt`, retire les anciennes lignes de la collecte et du registre) ; (4) ajouter `'<rayon>'` à `MT_RAYONS_MIGRES` et sa sous-branche à `MT_SOUS_BRANCHES` (`modules/mon-territoire/logique.js`) ; (5) tests Node `HISTORIQUE_<RAYON>` + collecte exacte dans `tests/monTerritoire.test.js` ; (6) essai navigateur du rayon dans `scripts/parcours/parcours_smoke.js` (modèle : `parcoursGarde`) ; (7) `npm test`, essais navigateur, docs, commit, validation de Denis. **Rayons restants** : aucun. Autres restes : entretien du 2026-10-15 (zones des Missions locales de la Dordogne et leur liste complète), essai de Denis en aperçu, enseignes sans date, ouverture au public, retrait du bloc « Annuaire associatif » à la fin. Pas de push.

## 1. Décisions déjà prises par Denis
- Nom du module : **« Mon territoire »**. La branche des employeurs s'appelle **« Emploi »** (les 21 secteurs de `data/secteurs.js`).
- Un seul répertoire local pour plusieurs domaines (option B), champ « type » dès le départ.
- Candidature spontanée **et** concours (fonction publique), avec les informations à connaître et les conditions.
- Une barre de recherche dans le module, reliée à celle de l'accueil ; les structures doivent ressortir de la recherche de l'accueil et être rattachées aux freins et aux problématiques.
- Une seule source de vérité, aucune double vérification ; zéro régression ; bouton de retour jusqu'à la fiche d'origine.
- **Dordogne d'abord (2026-10-12)**, Haute-Vienne ensuite avec le même modèle : un rayon migré affiche le nouveau bloc pour la Dordogne et garde l'ancien pour la Haute-Vienne jusqu'à sa propre migration.
- Mise à jour par l'outil de veille (`outils/veille.html`, « Publier »), sans clé ni frais.

## 2. Décisions encore ouvertes (bloquantes pour figer le plan)
- [x] **D1** (OUI, Denis 2026-10-12) Principe du répertoire unique : les rayons de « Comprendre le cadre » gardent l'indication et un bouton vers le répertoire (les coordonnées vivent seulement dans le répertoire).
- [x] **D2** (OPTION C, Denis 2026-10-12) Communes : option C (si la commune est connue, la structure compétente passe en premier ; sinon on montre les structures du type, avec « selon votre commune de résidence »).
- [x] **D3** (Logement et grande distribution à Bergerac, Denis 2026-10-12) Pilote : rayon à migrer (recommandé : Logement) et secteur d'employeurs de départ à Bergerac (recommandé : grande distribution, enseignes d'abord).
- [x] **D4** (OUI, Denis 2026-10-12) Branches ajoutées : Créer son activité, insertion par l'activité économique et intérim (dans Emploi), Accueil et langue, Droits et justice.
- [x] **D5** (OUI, liste de 24 types dans l'audit, Denis 2026-10-12) Liste fermée des types de structure (sera proposée après l'extraction à blanc P0.1).
- [x] **D6** (OUI : bouton retiré tant qu'il n'y a pas de boîte de réception, Denis 2026-10-12) Boîte de réception réelle pour « Une information est incorrecte ? » (sinon le bouton est retiré).
- [x] **D7** (OUI, Denis 2026-10-12) Fonction publique et Armées : branches séparées pour la personne, fiche employeur réutilisée (à confirmer à la maquette).

- [x] **D8** (OUI, Denis 2026-10-12) Les services en ligne et annuaires nationaux (19 entrées) restent hors du répertoire de lieux, dans « Comprendre le cadre » comme sources datées.
- [x] **D9** (OUI, Denis 2026-10-12) Commune de la personne : champ sur la page d'accueil du module, sans fenêtre (recommandé, ne touche pas la fonction partagée du département), ou élargissement de la fenêtre commune du département (risque haut).

- [x] **D10** (OUI, Denis 2026-10-12) Place sur l'accueil de l'application : troisième entrée de la carte « Se tenir informé » (recommandé) ou carte propre.
- [x] **D11** (OUI, Denis 2026-10-12) Drapeau d'ouverture du module, fermé sur le site public tant que le pilote n'est pas validé par Denis ; la Haute-Vienne retrouve au moins ses 17 structures migrées à l'ouverture (recommandé).

## 3. Garde-fous de régression (valables pour toutes les phases)
- **Haute-Vienne (87) intact** : l'application est déjà intégrée chez le partenaire (PCGI 87). Un rayon se migre pour les deux départements dans le même commit, ou garde son ancien bloc pour le département non migré. Jamais un territoire qui perd ses indications.
- Inventaire ligne par ligne des 415 structures actuelles (GARDÉ / DÉPLACÉ / FUSIONNÉ), aucun RETIRÉ sans accord écrit de Denis ; test automatique : chaque ancienne structure existe dans le répertoire ou sur la liste des retraits validés.
- Un rayon à la fois, un commit par rayon, anciennes lignes conservées jusqu'à validation du rayon.
- Règle conservée : un lien ou une coordonnée n'est affiché que s'il est daté ; au-delà de 12 mois, « à revérifier » (jamais bloquant).
- Un commit par sous-étape ; `npm test` vert ; test navigateur (`app.js` et `ui.js` non couverts par Node) ; jamais de `push` ; mode sombre ; accents ; aucun tiret long.

## 4. Phases

### P0 - Conception avant tout code `[effort : haut]`
- [x] P0.1 `[effort : bas]` (FAIT 2026-10-12, `docs/EXTRACTION_A_BLANC_STRUCTURES_2026-10-12.md` : 180 lignes, 155 structures uniques, 80 en Dordogne) Extraction à blanc des 415 lignes de `structures:` : structures uniques, doublons, liste proposée des types (lecture seule, rien n'est modifié)
- [~] P0.2 (projet rédigé dans `docs/MON_TERRITOIRE_FAISABILITE_ET_FORMAT_2026-10-12.md`, à valider par Denis) Format du registre (une ligne = une structure ou un employeur, colonnes communes plus colonnes propres aux employeurs, colonne « communes desservies ») et vocabulaire des types, validés par Denis
- [x] P0.3 (brouillon FAIT 2026-10-12, à relire par Denis) Concept grossier : accueil de « Mon territoire », branche Emploi, fiche employeur, résultat de recherche
- [x] P0.4 (FAIT 2026-10-12, même fichier, verdict global GO AVEC RÉSERVES) Carte de faisabilité (GO / GO AVEC RÉSERVES / NO GO) : retour jusqu'à la fiche exacte, recherche de l'accueil, choix de la commune, liste des communes (licence et fraîcheur à vérifier)
- [~] P0.5 (brouillon FAIT 2026-10-12 : `docs/MAQUETTE_MON_TERRITOIRE_DETAILLEE_2026-10-12.html`, 10 écrans, feuilles de style réelles du site, accents et mode sombre vérifiés, à valider par Denis) Maquette détaillée, utilisable comme démonstration pour l'entretien du 2026-10-15 (maquette cliquable avec de vraies fiches, pas le module réel)
- [x] P0.6 (brouillon FAIT 2026-10-12 : `docs/AUDIT_MON_TERRITOIRE_AVANT_CODE_2026-10-12.md`, verdict GO, aucun point bloquant, à valider par Denis) Audit complet contre le code réel et verdict final avant code (étape 4)

### Corrections issues de la seconde passe critique (`docs/SECONDE_PASSE_CRITIQUE_MON_TERRITOIRE_2026-10-12.md`)
- [x] P0.7 `[effort : haut]` (FAIT 2026-10-12 : `docs/MON_TERRITOIRE_ZONES_TYPES_FREINS_2026-10-12.md` et `docs/donnees_preparees/communes-24_api-geo_2026-10-12.txt`, 503 communes ; licence du Code Officiel Géographique : Licence Ouverte 2.0, conditions de l'API Géo non vérifiées) Aligner les identifiants de type sur ceux du Lexique (`france-travail`, `mission-locale`, `cap-emploi`, `plie`, `caf`, `siae`) ; concevoir le fichier des **zones** (zone vers communes) ; vérifier la licence de la liste des communes INSEE et de DORA
- [x] P0.8 `[effort : moyen]` (FAIT en projet, même document, sections 3 et 4) Ajouter à chaque frein de `data/freins.js` un champ `types` (17 entrées) ; définir le type par défaut de chaque rayon
- [ ] **Retiré de la fiche employeur en V1** : « installé depuis » (date Sirene non fiable, voir constat E3)
- [ ] Pilote employeurs : enseignes nationales reconnues seulement, dédupliquées par adresse

### P1 - Socle sans migration `[effort : moyen]`
- [x] P1.1 (FAIT 2026-10-12) Registre et lecteur (chargement à la demande par branche et territoire, aucun appel en ligne à l'usage)
- [x] P1.2 (FAIT 2026-10-12) Vérificateur dans `npm test` (type inconnu, doublon, date manquante, téléphone mal écrit, tiret long, personne nommée probable, commune non couverte ou couverte deux fois)
- [x] P1.3 (FAIT 2026-10-12) Module : route, accueil, branche Emploi, liste alphabétique, fiche employeur, états « pas encore de liste » et « territoire non couvert »
- [x] P1.4 (FAIT 2026-10-12) Recherche du module et groupe « Mon territoire » dans la barre de l'accueil (index généré par script, test de fraîcheur de l'index)
- [x] P1.5 (FAIT 2026-10-12) Commune de la personne (stockée sur son appareil), « Changer », bouton de retour jusqu'à la fiche d'origine
- [x] P1.6 (FAIT en partie 2026-10-12) Premières données : enseignes d'un secteur à Bergerac (préparées par Claude depuis Sirene hors site, validées par Denis)

### P2 - Migration pilote d'un rayon `[effort : haut]`
- [x] P2.1 (FAIT 2026-10-12, inventaire dans `docs/AUDIT_MON_TERRITOIRE_AVANT_CODE_2026-10-12.md` section 3 ; Denis a demandé de mettre en valeur Action Logement : Visale et Loca-Pass sont maintenant cités) Inventaire du rayon pilote (24 et 87), validation de Denis
- [x] P2.2 (FAIT 2026-10-12 : `modules/mon-territoire/contenu/lieux.txt`, 11 structures ; les anciennes lignes RESTENT dans la collecte jusqu'à validation de Denis) Migration dans le répertoire, bloc « Où m'adresser » alimenté par le type de structure, retrait de l'ancien bloc seulement après validation
- [x] P2.3 (FAIT 2026-10-12 : test Node de parité, essai navigateur `monTerritoireLogement` 14 contrôles, ancien et nouveau comparés dans le navigateur) Test comparatif avant / après, test navigateur des deux départements, retour exact

### P3 - Outil de veille `[effort : moyen]`
- [x] P3.1 (FAIT 2026-10-12 : section 5 du panneau Dépôt, `outils/veille.html`) Section « Mon territoire » dans `outils/veille.html` (prompt de collecte, collage, lecture, relecture)
- [x] P3.2 (FAIT 2026-10-12 : `outils/veilleTerritoire.js`, type `territoire`, `tests/veilleTerritoire.test.js`, vérifié sur une copie jetable du dépôt) Nouvelle destination fermée du registre dans « Publier » (`veilleDepot.js`), vérificateur et tests lancés, retour en arrière si échec
- [x] P3.3 (FAIT : le filtre « À vérifier » de la fenêtre ; les panneaux « Ce mois-ci » ont été retirés de la page le 2026-09-26) Liste mensuelle « à revérifier »
- [~] P3.4 (avertissement posé le 2026-10-12 : le bloc reste valable pour les rayons pas encore migrés ; il sera retiré quand tous les rayons le seront, règle « jamais de retrait avant que le remplacement couvre tout ») Retrait du bloc « Annuaire associatif Dordogne et Haute-Vienne » (remplacé, pas ajouté)

### P3bis - Migration des lecteurs `[effort : haut]`
- [x] FAIT 2026-10-12 pour ce que les données permettent aujourd'hui : `data/freins.js` porte `types` et `rayons` (17 freins), la fenêtre « Trouver une structure » d'un frein, les fiches « type de structure » du Lexique, la recherche de l'accueil et celle du module lisent le répertoire (jamais pour un frein sensible, jamais hors Dordogne, jamais module fermé) ; essai navigateur `monTerritoireFreins` (15 contrôles) ; détail : `modules/mon-territoire/ARCHITECTURE_TECHNIQUE.md`.
- [ ] **Reste de 3bis, à faire avec la migration du rayon « accompagnement » (phase 4)** : remplacer dans `_LEXIQUE_RENVOI_LOCAL_PAR_FICHE` les renvois codés en dur de `plie` et `mission-locale` (24) par le répertoire ; fusionner le groupe « Trouver une structure » de l'accueil quand tous les rayons seront migrés ; remplacer le texte de `quiVoir` des freins par un lien vers les types quand le répertoire sera assez complet (aujourd'hui seul le logement l'est)

### P4 - Migration des autres rayons `[effort : moyen, par rayon]`
- [x] **Rayon « accompagnement » : MIGRÉ 2026-10-12 (décisions D12 à D15 de Denis : OUI aux recommandations)** : 18 structures dans `lieux.txt`, adresse et date uniques pour tous les rayons (D14), zones prévues mais non relevées (D12), Lexique Mission locale et PLIE lu dans le répertoire (D15) ; essai `accompagnement` 17 contrôles ; **anciennes lignes de la collecte conservées jusqu'à validation de Denis** (17 lignes : les 16 déplacées et le générique fusionné). Audit : (`docs/AUDIT_MIGRATION_ACCOMPAGNEMENT_2026-10-12.md`, effort élevé) : 25 lignes, 16 à déplacer, 1 fusionnée, 8 gardées ; **point bloquant : les zones des Missions locales ne sont pas connaissables par les sources publiques** (leur site n'en donne aucune) ; décisions D12 à D15 à trancher par Denis avant tout code. **Questions à poser aux partenaires (entretien vers le 2026-10-15)** : la zone exacte (liste de communes ou intercommunalités) de chaque Mission locale de la Dordogne, et la liste complète des Missions locales du département (la Dordogne en a-t-elle d'autres que Bergerac, Périgueux et Sarlat-Terrasson ?).
- [ ] Les 15 autres rayons, un par un, mêmes garde-fous que P2 (budget, creer, emploi, employeurs, etranger, former, francais, garde, handicap, jeunes, juridique, justice, mobilite, sante, seniors)

### P5 - Autres branches et secteurs `[effort : moyen puis bas]`
- [ ] Au rythme des données vérifiables : autres secteurs, Formation, Vie pratique, Fonction publique, Armées, Social, Appui aux employeurs, autres bassins

## 5. Verdict mode nuit
**NON APTE AU MODE NUIT** tant que Denis n'a pas validé explicitement la maquette détaillée et les textes publics : ce sont les deux seules décisions encore ouvertes. Toutes les décisions de conception (D1 à D11), le format du registre, les types, les zones et le pilote sont tranchés ou proposés. Dès la validation, la phase 1 devient **APTE AU MODE NUIT**, avec les portes suivantes : le moindre doute sur la Haute-Vienne ou sur une fonction partagée arrête la tâche concernée.
