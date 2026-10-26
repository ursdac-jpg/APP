# Chantier : « petites structures » (associations de quartier, collectifs, permanences, épiceries solidaires, cours de français...) dans « Qui fait quoi » et dans l'outil de veille (créé le 2026-10-19)

> **RETIRÉ le 20/10/2026** : le bloc « Petites structures » (recherche ouverte) a été supprimé de l'outil de veille (décision de Denis : pas de recherche ouverte à l'extérieur). Le repérage des structures se fait désormais dans l'onglet « Structures d'aide » de l'outil de prospection (saisie à la main, texte lu sur une photo, page d'un partenaire), puis le pont vers le sas. Voir `docs/CHANTIER_PROSPECTION_PONT_REPERAGE_PETITES_STRUCTURES_2026-10-20.md`. Ce qui suit est conservé pour mémoire, ne plus l'utiliser.


> Mode A, `[effort : haut]` pour la conception. **PRÉPARATION SEULEMENT : rien n'est codé.** Origine : demande de Denis du 2026-10-19, après la lecture du site de l'association l'Atelier (11 fiches rangées dans le sas des structures, commit `2d2966fa`).

## 1. Ce qui est demandé

Des structures qui n'ont parfois **qu'un numéro de téléphone ou qu'un mail** (pas de site) : associations de quartier, collectifs, permanences, épiceries solidaires, cours de français, tout ce qui peut dépanner. Elles doivent être :
- **répertoriées à part** et **validées une à une** par Denis ;
- **trouvées par l'outil de veille** (balayages, recherches, prompt pour l'assistant), **pas par l'outil de prospection** : la prospection ne s'occupe que des entreprises, la veille de tout le reste ;
- visibles dans « Qui fait quoi ».

## 2. Décisions déjà tranchées

- [x] **D1 (2026-10-19, Denis : « je valide A ») : la « date vérifié le » d'une petite structure veut dire « j'ai appelé ou écrit, ou j'ai vu la page officielle ».** Jamais une date posée par Claude ou par un contrôle automatique.
- [x] **D2 (2026-10-19, Denis) : tout passe par l'outil de veille**, jamais par l'outil de prospection (réservé aux entreprises). Pas de réutilisation de la marque « Via prospection ».

## 3. Audit du code réel (lu le 2026-10-19)

- Le registre des structures `lieux.txt` a **12 colonnes** : `id | type | nom | description | commune | zone | téléphone | site | portée | rayons | source | date` (`MT_COLONNES_LIEUX`, `modules/mon-territoire/logique.js:98`). **Aucune colonne « mail ».**
- Le vérificateur `mtVerifierLieux` (`logique.js:588`) exige : au moins un rayon, un type de la liste fermée, une source, et refuse « téléphone ou site sans date de vérification ». **Il n'exige aucun contact** : une fiche sans téléphone ni site est acceptée (c'est le cas de plusieurs fiches de l'Atelier).
- Le registre est lu à quatre endroits : l'application (`logique.js`, `index.js`), les contrôles et l'édition de l'outil (`outils/veilleTerritoire.js`, `FICHIERS.lieux`, `coordonnees: ['telephone', 'site']`), le sas (`outils/veilleSas.js`, `COLONNES.lieux`) et les scripts (`importerDansLeSas.js`, `migrerRayonTerritoire.js`, `genererPromptVerificationSas.js`).
- Le patron « marque au début de la colonne source » existe déjà pour les employeurs (« Via prospection ; », `mtViaProspection`, `mtSeparerProspection`) : aucune colonne en plus, une seule fonction de séparation, parades dans l'outil et le vérificateur. **On peut le copier** avec une AUTRE marque (« Petite structure ; ») pour les structures.
- Une structure s'affiche aujourd'hui dans les **rayons** de « Comprendre le cadre » (colonne `rayons`, ex. « francais », « logement ») : les cours de français, par exemple, ont déjà leur rayon.

## 3bis. DÉCOUVERTE IMPORTANTE (2026-10-19, en préparant la maquette) : AUCUN téléphone de structure n'est affiché au public aujourd'hui

La carte d'une structure existe en DEUX exemplaires presque identiques : `_comprendreLeCadreRenduCarteStructure` (`modules/comprendre-le-cadre/index.js:1908`) et `_mtCarteLieu` (`modules/mon-territoire/index.js:901`). Les deux montrent le nom, la description, le type, la commune (seulement `_mtCarteLieu`) et **un lien vers le site si l'adresse est vérifiée** ; sinon la mention « Adresse pas encore vérifiée ». **Aucune des deux n'affiche le téléphone** (seules les fiches d'employeurs le font), et `mtLieuEnStructure` ne transmet même pas le téléphone. Conséquence : une petite structure sans site afficherait « adresse pas encore vérifiée » et aucun moyen de la joindre, ce qui rend la fonction inutile. **Il faut donc, pour toutes les structures : afficher le téléphone et le mail (cliquables, datés), dans les deux cartes** (dette de duplication à résorber en une seule carte partagée, à lister dans `BRIQUES_COMMUNES.md`). Effet de bord bénéfique : les 33 structures du registre qui ont un téléphone l'affichent enfin. Risque : changer une carte vue par 17 rayons, donc test navigateur de chaque rayon.

## 4. Décisions (toutes tranchées le 2026-10-19) (une à la fois, recommandation d'abord)

- [x] **D3. TRANCHÉ par Denis (2026-10-19) : marque « Petite structure ; ».** Comment reconnaître une petite structure.**
  - **(Recommandé) La marque « Petite structure ; » au début de la colonne source** (même patron que les employeurs). Bénéfice : aucun changement de format, aucune fiche existante touchée, filtre immédiat dans l'outil de veille. Risque : si la source est modifiée à la main et la marque effacée, la fiche redevient une structure ordinaire (parade : l'outil la conserve et le vérificateur refuse un texte « petite structure » mal écrit).
  - Une 13e colonne « taille ». Bénéfice : explicite. Risque : format partagé à reprendre partout (quatre lieux de lecture, les scripts, toutes les lignes).
- [x] **D4. TRANCHÉ par Denis (2026-10-19, après explication) : dans les rayons, avec pastille, SEULEMENT pour l'instant. Une rubrique « Petites structures » (simple vue filtrée sur la marque, avec les puces par rayon, sans seconde liste) reste possible plus tard si les personnes ne les trouvent pas.** Où elles apparaissent au public.**
  - **(Recommandé) Dans les rayons habituels, avec une pastille « Petite structure locale » et la mention du contact.** Bénéfice : la personne qui cherche du français ou de l'aide alimentaire les trouve là où elle cherche déjà, sans nouvelle porte. Risque : mélange visuel avec les grosses structures (la pastille le compense).
  - Une rubrique à part « Petites structures près de chez vous ». Bénéfice : séparation nette, comme « Via prospection ». Risque : une personne qui cherche du français ne pense pas à ouvrir une rubrique « petites structures » ; elles risquent d'être peu vues.
- [x] **D5. TRANCHÉ par Denis (2026-10-19) : oui, colonne « mail ».** Le mail.** Une colonne « mail » dans le registre des structures (cliquable, `mailto:`), avec un contrôle « au moins un téléphone ou un mail pour une petite structure » ; **un mail n'est affiché au public qu'avec une date**, comme le téléphone (jamais le mail d'une personne : adresses de service seulement). Recommandé : oui. Risque : format partagé à reprendre partout (grep sur tout le dépôt, comme pour tout changement de colonne). Alternative : rester sans mail et ne publier que les fiches avec téléphone (perd les fiches mail seul).

## 5. Plan en cases (à confirmer après D3 à D5 ; aucune case cochée)

Niveau haut :
- [x] `[effort : haut]` Maquette FAITE le 2026-10-19 : `docs/MAQUETTE_PETITES_STRUCTURES_2026-10-19.html` (rayon, trois cas d'une carte, avant / après, sas avec filtre et boutons « J'ai appelé / écrit / ouvert la page »). EN ATTENTE DE LA VALIDATION DE DENIS.
- [x] `[effort : bas]` Prompt et sources FAITS le 2026-10-19 : `docs/PROMPT_PETITES_STRUCTURES_2026-10-19.md` (utilisable tout de suite dans ChatGPT / Perplexity, sortie en champs `[PETITES-STRUCTURES]`).
- [x] FAIT `[effort : moyen]` Bloc du prompt DANS l'outil de veille (remplace l'ancien « Annuaire associatif », format périmé) : bouton de copie + lecture de la réponse + rangement dans le sas avec la marque « Petite structure ; ».

Niveau moyen :
- [x] FAIT `[effort : moyen]` Colonne « mail » (si D5 oui) : colonnes, lecteur, vérificateur, outil de veille, sas, scripts, fixtures de tests. Grep sur tout le dépôt avant.
- [x] FAIT `[effort : moyen]` Marque et contrôles : vérificateur (« au moins un contact », marque exacte), parades de l'outil de veille.
- [x] FAIT le 2026-10-20 `[effort : haut]` Une SEULE carte de structure partagée (Comprendre le cadre + Qui fait quoi) qui affiche commune, téléphone et mail cliquables et datés, plus la pastille « Petite structure locale » (voir 3bis) : fonction partagée, grep sur tout le dépôt, test de chaque rayon.
- [x] FAIT `[effort : moyen]` Public : la carte (mode sombre : classes Bootstrap déjà doublées) ; la recherche de l'accueil et du module lit déjà TOUTES les structures du registre (`mtRechercherLieux`), donc les petites structures y sont trouvées sans rien câbler.
- [x] FAIT (filtre du sas, filtre de la liste publiée, trois boutons, mail) `[effort : moyen]` Outil de veille, **EXIGENCE DE DENIS (2026-10-19) : un filtre « Petites structures » dans le SAS des structures ET dans la liste publiée, pour les retrouver facilement et les valider** (à côté des filtres existants, comptage affiché) ; validation une à une, bouton « C'est bon » avec la signification de D1.
- [x] FAIT (1707 essais verts ; B.35 écrite ; essai bout en bout sur le vrai code : publication d'une fiche avec mail et téléphone, lecture, carte). RESTE à Denis : essayer sur son poste.

Niveau bas :
- [ ] `[effort : bas]` Ranger les 3 fiches de l'Atelier sans contact et la fiche générique `atelier-bergerac-24` (à décider à la validation).

## 6. Verdict

**GO AVEC RÉSERVES.** D1 à D5 tranchées ; reste la maquette (avec la carte partagée), à valider par Denis. NON APTE AU MODE NUIT tant que la maquette n'est pas validée.
