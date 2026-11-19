# Plan de la nuit du 18 au 19 novembre 2026 : Explorer les métiers, « Par un métier » (phases 3 à 6)

> Fichier de reprise : il fait foi, pas la conversation. Une case cochée = fait, testé (`npm test`), vérifié dans le navigateur et commité.
> Source de vérité du visuel : `docs/MAQUETTE_PAR_UN_METIER_ENRICHI_EXPLORER_LES_METIERS_2026-11-17.html` (fiche, pages compétence et secteur, bloc « Candidater pour ce métier », demande d'offres aux lignes 600 à 660 de son script).
> Décisions : consignes 448 à 454 de `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md`, plus les décisions du 18/11/2026 (secteur prioritaire, titre indicatif sur la barre, bouton « Fermer » des panneaux, « Voir les métiers » seulement avec un choix).
> Mode Nuit, effort medium minimum. Aucun `push`, aucune commande destructive. Jamais `git add -A`. Le module reste FERMÉ au public (`cmvOuvert()` : localhost seulement) : ni ligne de Nouveautés, ni ligne de journal avant l'ouverture.
> Garde-fou : une ambiguïté réelle non prévue par la maquette = on ne devine pas, on note le blocage ici et on passe à la tâche suivante.

## Déjà fait (18/11/2026)
- [x] Phase 1 : index complet des compétences (`data/rome/indexCompetences.js`), savoir-être officiels dans les fiches.
- [x] Phase 2 : écran « Par un métier » (barre unique, filtres, résultats, pourcentage) ; secteur prioritaire ; titre indicatif de la barre ; bouton « Fermer » ; boutons « Voir les métiers » / « Parcourir ».
- [x] Conditions facile ET difficile dans « Par ce que vous aimez faire » (même fonction `pmcEffetConditions`).

## À faire cette nuit
- [x] N0. Commiter la recherche de secteur par mots courants (`PMC_MOTS_SECTEURS`, déjà codée et testée).
- [x] N1. Phase 3a, fiche partagée `fiche-metier` (`js/app.js` : `pageFicheMetier`, `ficheMetierCorpsHTML`, `ficheRomeDonnees`) : conditions de travail en grande carte avec icônes en 4 familles ; savoir-être officiels (champ `e`) affichés ; compétences et secteur cliquables (vers les pages de la phase 4). Profite à tous les modules : zéro régression fonctionnelle, grep sur tout le dépôt avant de toucher une signature.
- [x] N2. Phase 3b, sur la fiche : 3 métiers proches (liste officielle du ROME d'abord, complétée par les compétences en commun), 5 métiers du même secteur, autres secteurs ; fil de voyage avec point de départ (bouton Retour).
- [x] N3. Phase 4a, page compétence : les 10 métiers où elle compte le plus, puis « Voir aussi les autres » ; la pastille de secteur des cartes devient un bouton.
- [x] N4. Phase 4b, page secteur : tous les métiers du secteur.
- [x] N5. Phase 5, bloc « Candidater pour ce métier » : demande d'offres (département, territoire des zones d'emploi de « Comprendre les chiffres », départements voisins validés par Denis), message à copier pour l'assistant en ligne (rien n'est repris en retour), bouton vers le module Candidater (audit du code réel d'abord : comment le module reprend un métier). À essayer par Denis avec un vrai assistant : la qualité du message ne peut pas être jugée sans lui.
- [x] N6. Phase 6, recherche : brancher « Par un métier » sur la barre de l'accueil et sur le Lexique (compétences et secteurs) ; `node scripts/checkLexique.js` à 0 erreur et 0 avertissement.
- [x] N7. Clôture : `docs/BRIQUES_COMMUNES.md`, `docs/LECONS_A_NE_PAS_REPRODUIRE.md` (si erreur), `docs/CONSIGNES_DE_DENIS_A_SUIVRE.md` (statut 453/454), `docs/ETAT_DES_CHANTIERS.md` (partie 0), ce fichier.

## Blocages notés pendant la nuit
- N5 : le texte d'avertissement à afficher avant l'ouverture de l'assistant en ligne (offres publiées seulement, marché caché, rien n'est repris) n'est pas rédigé ni validé : non inventé. Le bloc se limite à préparer et copier la demande (la personne la colle elle-même dans l'assistant de son choix) ; l'ouverture directe d'un assistant reste à décider avec Denis.

## Fait après la nuit (18/11/2026)
- Avertissement au-dessus de « Copier la demande » : texte proposé dans la section 8 de `docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md`, validé par Denis et CODÉ le 18/11/2026 (`PMF_AVERTISSEMENT_OFFRES`). Compétences non indexées dans la barre de l'accueil (décision de Denis) ; secteurs déjà couverts par « Domaines d'activité ».
- Essais navigateur : recherche de l'accueil, pages compétence et secteur en mobile et en sombre, voyages périmés. Un défaut trouvé et corrigé (ancien voyage qui réapparaissait par une autre porte : `pmfSurNavigation`, leçon 9.193). Effet connu : passer par Candidater puis revenir à la fiche efface le fil de voyage.

## Ce qui reste à Denis, le matin
- Essayer l'écran « Par un métier » en direct : calibrage des pourcentages (seuil de 40 %, poids du secteur à 30), familles de savoir-être proposées par Claude, noms des 83 familles de compétences venus du ROME.
- Relire `docs/TEXTES_EXPLORER_LES_METIERS_A_RELIRE_2026-11-17.md`.
- Essayer la demande d'offres avec un vrai assistant.
- Fiches à la main « Ouvrier agricole/viticole » (A1405 vers A1419) et « Ouvrier de chai » (A1413 vers A1422) ; niveau F1619 quand MétierScope sera de nouveau joignable (tâche vers le 24/11/2026).
