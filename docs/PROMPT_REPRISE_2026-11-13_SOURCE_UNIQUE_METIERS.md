# Message de reprise du 13/11/2026 : une seule source de choix pour tous les métiers

À coller en premier message dans l'autre compte (dépôt `Site_V2`, branche `master`).

---

Bonjour. Tu reprends un chantier de l'application APP, laissé par une autre session de Claude. Commence par `/app` (ou lis `CLAUDE.md`, `docs/TRAVAILLER_AVEC_DENIS.md`, la partie 0 de `docs/ETAT_DES_CHANTIERS.md`), puis `git log -8` et `git status` : ne te fie pas à ce message seul. Les fichiers `scripts/parcours/protocole/sorties/*.json` et `scripts/rendu/sorties_rectangles/` appartiennent à une autre fenêtre : ne les touche pas et ne les ajoute jamais à un commit (jamais `git add -A`).

## Où en est le chantier (consigne 280, état au 13/11/2026)

- **Fait et commité sur `master`** (dernier commit `505f392c`, rien de poussé, `npm test` : 2 784 verts) :
  - les **1 790 fiches du ROME** portent une seconde description écrite (actions, « avec qui ou quoi », lieux), dans le fichier unique `data/descriptionsEcrites.js`, clé = identifiant de fiche (`rome_XXXX`) ;
  - `data/metiers.js` : une fiche du ROME qui a une description porte ses listes écrites et garde les listes déduites du ROME en seconde signature (`signatureRome`) ; le classement garde la meilleure des deux (`calculerScoreMetier`) ;
  - à score égal, `comparerMetiersParScore` classe par ordre alphabétique : plus aucun avantage pour les fiches à la main ;
  - échantillon de 299 fiches : une personne qui coche 3 actions, 2 « avec qui ou quoi » et 1 lieu de la description retrouve la fiche dans les 3 premières propositions dans 93,6 % des cas, dans les 10 premières dans 99,3 % ;
  - documents à jour : section 33 de `docs/CHANTIER_IMPORT_ROME_BASE_UNIQUE_2026-11-12.md`, `docs/ETAT_DES_CHANTIERS.md`, `docs/JOURNAL_DES_CHANGEMENTS.md`, leçon 9.157, consignes 280 et 281.
- **Décision de Denis, consigne 281** : le mot « IA » est autorisé dans un nom de métier (fiche de poste) ; il reste interdit dans toute aide donnée à la personne (« l'assistant en ligne »).

## Ce qu'il reste à faire, dans cet ordre de recommandation

1. **Choix par expérience** (effort haut, mode B) : demander « avec qui, avec quoi, où » pour chaque expérience au lieu d'une seule liste mélangée (c'est le plus grand levier de pertinence mesuré dans la simulation, section 32 bis du cahier). Lire `docs/CHANTIER_CHOIX_PAR_EXPERIENCE_2026-11-13.md`. Audit du code réel d'abord, puis **maquette et questions à Denis avant tout code** ; test navigateur obligatoire (`js/app.js` n'est pas chargé par les tests Node). Rappeler à Denis de passer l'effort sur « haut ».
2. **Relecture d'un échantillon des descriptions** par Denis : préparer une feuille d'environ 40 métiers tirés au hasard, de secteurs variés, en langage simple. Les 1 790 descriptions n'ont pas été relues par un humain.
3. **Statistiques par secteur sur toutes les fiches** : `competencesFrequentesDuSecteur`, `secteursDisponibles`, `exemplesMetiersDuSecteur` (js/app.js) n'utilisent encore que `baseMetiersDetaillees` (les 135 fiches à la main). Audit avant de basculer : les fiches du ROME n'ont pas toutes les compétences détaillées.
4. **Rangement final, sans urgence** : retirer `promouvoirFiche`, ranger les listes des 135 fiches à la main dans la même structure que `data/descriptionsEcrites.js`, adapter les tests (`metiersRome`, `secteursMetiers`, `promouvoirFiche`).
5. **Deux petites décisions à demander à Denis** : « Chef d'équipe » (fiche M1302, mauvais code) et le sens d'« Agent de tri ».

## Rappels de méthode (extraits du protocole, à ne pas oublier)

- Français impeccable avec accents, jamais de tiret cadratin ni demi-cadratin, ton simple et rassurant, pas de « on » superflu.
- Annoncer le mode (A / B / C / D / Nuit) et l'effort en début de tâche, étiqueter chaque tâche `[effort : bas|moyen|haut]`.
- Un choix présenté à Denis = recommandation en premier, bénéfices et risques de chaque option.
- `npm test` doit afficher `ℹ fail 0` AVANT chaque commit (lire la ligne, pas seulement la fin : leçon 9.157). Le test complet dure environ 75 s : le lancer en arrière-plan si besoin.
- Commit direct sur `master`, jamais de `push` sans demande de Denis. Une ligne au journal des changements dans le même commit pour tout changement visible. La ligne `data/nouveautes.js` seulement à l'ouverture publique.
- Vérifier la date système réelle avant d'écrire une date.
- Avant de finir : mettre à jour `docs/ETAT_DES_CHANTIERS.md` (passation) et le cahier du chantier.
