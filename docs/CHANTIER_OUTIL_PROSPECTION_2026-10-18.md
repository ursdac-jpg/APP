# Chantier : outil de prospection (conception validée le 2026-10-18, aucun code)

Mode A, `[effort : haut]`. Maquette et questions avant code, un choix à la fois, audit du code réel avant tout plan.

## Décisions de Denis (2026-10-18)

1. **Outil PRIVÉ, à usage personnel, SÉPARÉ de tous les autres.** Pas de partie publique pour l'instant. Plus tard, selon la fiabilité et l'utilité constatées, une version publique destinée surtout aux professionnels (décision séparée, non prise).
2. **Même principe que l'outil de veille** : un fichier `.bat` à double-cliquer démarre un petit serveur local (127.0.0.1 seulement) et ouvre l'outil dans le navigateur. Nom : « Lancer l'outil de prospection.bat ».
3. **Option A : dossier séparé, à côté du dossier de l'application, HORS du dépôt APP.** Raison : l'outil contiendra des noms de dirigeants et des notes sur des personnes, qui ne doivent jamais pouvoir partir sur GitHub. Nom de dossier proposé : `PROSPECTION` (à confirmer). Ses données dans un sous-dossier propre, jamais suivi par Git.
4. **Travail en session LOCALE sur le poste de Denis** (la session cloud n'accède ni à ses disques, ni aux sources externes : le réseau y refuse `recherche-entreprises.api.gouv.fr`, erreur 403, et un dossier hors dépôt n'existe pas dans le conteneur).

## But de l'outil (paroles de Denis)

Choisir des filtres : micro-entreprise oui ou non, sociétés civiles immobilières oui ou non, secteur, ancienneté, taille. Voir les entreprises créées récemment dans un secteur et leur évolution. Repérer celles de 2 à 3 ans qui commencent à avoir un intérêt public et peuvent recruter (au début, elles recrutent par connaissances). Obtenir leurs contacts, les trier, automatiser ce qui peut l'être. Les entreprises retenues pourront être proposées au registre public des employeurs (sas existant), validées à la main par Denis.

## Audit du 2026-10-18 (code réel)

- **Réutilisable** : `scripts/essaiLectureProspection.js` (lecture de l'API), `modules/mon-territoire/contenu/communes-24.txt` et `communes-87.txt` (code INSEE, intercommunalité), `data/secteurs.js` (21 secteurs), le principe du serveur local à jeton (`outils/serveur_veille.js`, `Lancer l'outil de veille.bat`), les boutons de recherche web (`boutonsWeb`, `urlRechercheWeb` dans `outils/veille.html`), le contrôle d'adresses (`outils/veilleControle.js`, `scripts/verifierRecruteursSas.js`), le format du sas des employeurs.
- **À construire** : table des codes d'activité (NAF) vers les 21 secteurs ; table commune vers zone d'emploi (**n'existe pas**, voir LECONS 9.52 : fichier public de l'INSEE, ou filtrer par commune et intercommunalité en attendant) ; libellés simples des formes juridiques ; lectures datées et comparaison ; prompt « retrouver les coordonnées ».
- **Lecture de la source** : l'API ne filtre pas par date de création, ne donne jamais téléphone, mail ni site ; l'effectif est celui de l'entreprise entière et arrive avec un ou deux ans de retard ; entrepreneurs individuels = noms de personnes.
- **Verdict** : GO. Rien de bloquant. Risques : vie privée (données de personnes), coordonnées toujours semi-automatiques.

## Sources possibles (d'après la connaissance de Claude, À VÉRIFIER à l'essai)

Base Sirene de l'INSEE en téléchargement complet (tout un département, historique mensuel, sans limite de débit) ; BODACC (annonces légales) ; API « Offres d'emploi » de France Travail (inscription gratuite) ; La Bonne Boîte (déjà en lien dans l'application) ; Registre national des entreprises (INPI) ; OpenStreetMap (environ la moitié des numéros, secours) ; annuaires des chambres de commerce et des métiers, presse locale. **À éviter** : Pages Jaunes, Google Maps, LinkedIn (leurs conditions interdisent l'aspiration automatique).

## Idée de fond à retenir

L'ancienneté est un indice faible de recrutement. Signaux plus parlants : passage de « sans salarié » à « 1 à 2 salariés » entre deux lectures, offres publiées, annonces légales. L'évolution se construit en gardant des lectures datées (la source ne donne que l'état du jour).

## Vie privée (rappel, à confirmer par la structure de Denis, Claude n'est pas juriste)

Même en usage privé, contacter des personnes dans le cadre d'une mission impose : informer à la première prise de contact, ne garder que le nécessaire, accepter une demande de retrait. Demander à la structure si elle a un référent sur la protection des données. Aucune donnée de personne dans le dépôt public. Ne jamais contourner une non-diffusibilité.

## Plan en cases (une case = un commit dans le dépôt du nouvel outil, tests verts avant la suivante)

- [ ] `[effort : moyen]` Dossier `PROSPECTION` à côté d'APP, `.bat`, serveur local à jeton, page vide « Outil de prospection », test du double-clic par Denis.
- [ ] `[effort : haut]` Lecture d'une commune (Bergerac) depuis le poste de Denis ; tableau filtrable (secteur, forme juridique, ancienneté, taille, commune) ; exclusion par défaut du bruit, au choix de Denis.
- [ ] `[effort : moyen]` Table NAF vers les 21 secteurs ; libellés de formes juridiques.
- [ ] `[effort : haut]` Lectures datées et comparaison (nouvelles, disparues, changement de taille) ; maquette d'abord.
- [ ] `[effort : haut]` Signaux d'embauche (France Travail, BODACC) ; essai de lecture d'abord.
- [ ] `[effort : haut]` Coordonnées en semi-automatique : prompt par entreprise ou groupé, circuit habituel (assistant propose, second assistant vérifie, script contrôle, Denis ouvre à la main).
- [ ] `[effort : moyen]` Notes de contact privées ; mention « a indiqué être ouvert aux stages d'observation » (accord écrit ou oral : question ouverte, Claude penche pour écrit).
- [ ] `[effort : moyen]` Pont vers le sas des employeurs (ligne préparée au format existant, validation à la main).
- [ ] Version publique pour les professionnels : décision plus tard.

Verdict mode nuit : **NON APTE** (maquettes et choix à venir).

## Pour reprendre en session locale

Ouvrir Claude Code **dans le dossier APP** (pour que `CLAUDE.md` et les règles se chargent), taper `/app`, puis demander d'ajouter le dossier voisin `PROSPECTION` à la session. Message de départ : « Reprends `docs/CHANTIER_OUTIL_PROSPECTION_2026-10-18.md`, première case : dossier PROSPECTION, `.bat`, serveur local, page vide. »
