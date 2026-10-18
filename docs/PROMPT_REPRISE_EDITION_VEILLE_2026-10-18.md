# Message de reprise : chantier « tout modifier depuis l'outil de veille » (2026-10-18)

À coller tel quel au début d'une session neuve (autre compte Claude), dans le dossier `Site_V2`.

---

/app

Je reprends le chantier « édition depuis l'outil de veille » commencé sur mon autre compte (limite d'usage atteinte). Tout est commité sur `master` ; rien n'est poussé. Avant toute chose :

1. Lis `docs/ETAT_DES_CHANTIERS.md` (PASSATION du 2026-10-18, en tête de la partie 0) puis **`docs/CHANTIER_EDITION_DEPUIS_LA_VEILLE_2026-10-18.md` en entier** : c'est le fichier de suivi (décisions, mesures, plan en cases, ce qui est fait). Contrôle `git log -8` : le dernier travail est « téléphone par magasin, partie 1 ».
2. Respecte le protocole habituel (`CLAUDE.md`, `docs/TRAVAILLER_AVEC_DENIS.md`) : mode annoncé, étiquettes `[effort : bas|moyen|haut]`, maquette avant code au moindre doute d'interface, choix présentés avec recommandation + bénéfices/risques, français impeccable, jamais de tiret long, `npm test` vert avant chaque commit, jamais `git add -A`, jamais de `push`.

## Ce qui est FAIT (commité, `npm test` 1659 verts), mais jamais essayé par moi sur mon poste
- **Fiches du cadre** (Dépôt, section 7) : liste filtrable (date, heure, rayon), formulaire champ par champ, contrôles en direct, couleurs avant/après, enregistrement, annulation, historique (`outils/veilleFiche.js`, type `fiche-champs`).
- **Lot 2 « choisir plutôt que taper »** : sources du rayon, « voir aussi », mots expliqués, mots de recherche, phrase « ce que j'ai changé » automatique (`outils/veilleChoix.js`).
- **Chiffres** (Dépôt, section 8) : digest trimestriel, fiches de territoire, portrait, Europe, fiches méthode, synthèses (`outils/veilleChiffres.js`, type `chiffres-champs`, route `/api/chiffres/verifier`). Case « j'ai ouvert la source » obligatoire dès qu'un chiffre change.
- **Boutons « chercher sur le web »** : nom + adresse + commune + téléphone (site, page de recrutement, numéro, carte) ; plusieurs adresses dans une case = un bouton « Ouvrir la source N » et « Copier l'adresse N » par adresse ; magasins affichés un par ligne avec leur département (`boutonsWeb`, `boutonsLiensChamp`, `htmlMagasins` dans `outils/veille.html`).

## Ce qui RESTE (dans cet ordre)
1. **Téléphone par magasin, partie 2 (MISE À JOUR : le sas des employeurs, la date à zéro et la recherche web sont FAITS et essayés sur copie ; il reste le formulaire des fiches déjà publiées, l'essai de la fiche publique dans le navigateur, le contrôle de `genererPartieEmployeursPrompt.js` et la documentation : voir « TÉLÉPHONE PAR MAGASIN, PARTIE 2 : AVANCEMENT » dans le fichier de chantier)**. Texte d'origine :  (`[effort : haut]`, option A validée par moi, maquette `docs/MAQUETTE_TELEPHONE_PAR_MAGASIN_2026-10-18.html` validée avec ses 4 recommandations). La partie 1 est faite : format `Commune:adresse:05 53 00 00 00` (numéro facultatif, fiches actuelles inchangées), contrôle, essais, affichage public (`modules/mon-territoire/logique.js` et `index.js`). **Il faut d'abord essayer l'affichage public dans le navigateur** (fiche d'un employeur à plusieurs magasins, clair, sombre, 375 px), puis faire dans l'outil : une ligne par magasin avec son champ de numéro dans les cartes du sas et dans la liste publiée, reconstruction de la colonne `etablissements`, remise à zéro de la date si un numéro de magasin change (`outils/veilleTerritoire.js`, `coordonneeChangee`), boutons de recherche web par magasin (`etablissementsRecherche` doit lire le numéro à part). Détail en 6 points dans la section « Reste à faire pour le téléphone par magasin » du fichier de chantier.
2. **Je dois essayer l'outil sur mon poste** (lanceur `outils/Lancer l'outil de veille.bat`) et te transmettre mes retours : rien de ce qui précède n'a été vu par moi hors copie de dépôt. Demande-moi mes retours avant d'ajouter des fonctions.
3. Petits points ouverts : introductions de section du portrait (paragraphes à retours à la ligne fixes) non modifiables ; champs `frein`, `voir_aussi_chiffres`, `structures` des fiches du cadre ; filtre « Mes modifications en attente » ; la dette `construireMd` (BRIQUES_COMMUNES B.27) ; valider à la main les 7 pages d'offres publiques du sas ; **repasser `MT_OUVERT` à `false` avant toute mise en ligne publique** (`modules/mon-territoire/logique.js`, test associé) ; signalement du faux site `francevictimesdordogne.fr` à envoyer par moi.
4. Ensuite seulement : l'outil de prospection (`docs/PONT_RUBRIQUE_VEILLE_PROSPECTION_2026-10-17.md`).

## Pièges déjà rencontrés (à ne pas refaire)
- `outils/veille.html` est une page unique très longue : préfixer chaque nouvel `id` par son écran (LECONS 9.48) ; une apostrophe droite dans une chaîne JavaScript casse TOUTE la page (LECONS 9.46) : vérifier la lecture des scripts après chaque modification (le test `npm test` le fait).
- Un essai qui lit un VRAI fichier que l'outil modifie lui-même échoue à la publication : utiliser des jeux d'essai fixes (LECONS 9.47) ; rejouer toute nouvelle publication sur un clone (`git clone -c core.autocrlf=false`).
- Plusieurs fichiers de `modules/mon-territoire/` sont en fins de ligne Windows (CRLF) : un remplacement de texte sur plusieurs lignes doit en tenir compte.
- Dans un script shell, un « heredoc » mange les barres obliques inverses des expressions régulières : écrire les scripts de modification avec l'outil d'écriture de fichiers, pas en ligne de commande.
- Navigateur intégré : limite d'onglets, fermer les anciens ; un serveur d'essai se lance par `.claude/launch.json` (ajouter une entrée temporaire, la retirer ensuite : elle ne doit jamais être commitée) sur une COPIE du dépôt, jamais sur le vrai.
- Les scripts jetables de la séance (copie de dépôt, scripts de modification) étaient dans le dossier temporaire de la session : ils n'existent plus, tout ce qui compte est dans le dépôt.

Commence par me dire en 8 lignes où tu en es (chantier actif, mode et effort recommandés, ce dont tu as besoin de moi).
