# Chantier : un seul écran d'objectif, partout (Lot 4a, retours 2, 3 et 4 de Denis du 25/10/2026)

Statut : **maquette ABANDONNÉE le 25/10/2026** (retour de Denis : elle redessinait l'écran au lieu de reprendre celui de « Écrire ma lettre », et ajoutait « Le poste que vous recherchez » à tort pour une offre ; voir LECONS 9.63). L'inventaire reste valable. **Nouvelle méthode** : brancher le vrai composant « Votre candidature » de la lettre à la place de l'ancien dans « Votre objectif » du CV, sans nouvelle maquette ; Denis juge dans l'application, un écran à la fois.

Maquette cliquable : `docs/MAQUETTE_OBJECTIF_ECRAN_UNIQUE_2026-10-25.html` (menu « Dans quel parcours êtes-vous ? » pour voir ce qui change d'un parcours à l'autre).

Décisions déjà prises par Denis : le parcours référent est « Écrire ma lettre avec l'assistant » ; les cartes d'objectif viennent **avant** le premier passage chez l'assistant, partout ; le même effet d'invitation (les cartes se mettent en avant une à une, en boucle, jusqu'au premier clic) partout.

## 1. Ce que mesure l'inventaire (navigateur, 25/10/2026)

**Les six cartes sont déjà identiques partout** : une seule liste `OBJECTIF_CHOIX_CANDIDATURE` (`js/app.js`), mêmes icônes, mêmes noms, mêmes phrases, même grille de trois colonnes. Ce qui diffère d'un parcours à l'autre, c'est **ce qui s'affiche après le clic** et **l'emballage**.

Le contenu de fond (offre, spontanée, changer de métier, stage...) vient déjà de la même fonction (`contenuModeRecherche`, mode `modeUnifie`). Il en existe pourtant **deux emballages** :

| Emballage | Où | Aspect |
|---|---|---|
| **A. Partie numérotée « 2 Votre candidature »** (référent) | Écrire ma lettre, M'entraîner à un entretien, « Votre objectif » du CV (offre, spontanée, changer de métier seulement) | Phrase d'accueil, question « Quel type de candidature préparez-vous ? », partie toujours ouverte |
| **B. Bloc repliable « 📝 Candidature, recommandé, à compléter »** (ancienne rubrique) | Reformuler, Bilan, Cohérence, Découverte, et « Votre objectif » du CV pour stage, alternance, formation | Bloc qui se replie, titre « Comment souhaitez-vous rechercher un emploi ? » (ou « Informations sur votre candidature ») avant le contenu |
| **C. Panneau propre au module** | « Un CV, plusieurs métiers » (page 2) | Même logique prêtée par copie du dossier, jetons de stage en plus |

### Tableau écran par écran

| Écran | Cartes | Emballage | Effet d'invitation | Ajouts après le clic |
|---|---|---|---|---|
| **Écrire ma lettre** (référent) | 6, identiques | A | non | lettre de recommandation (« Vos appuis »), civilité du recruteur, adaptation au métier (situation, style) |
| **M'entraîner à un entretien** | 6 | A | non | appuis (ajouté aujourd'hui), civilité, adaptation au métier |
| **Votre objectif** (Créer un CV, `pageObjectif`) | 6 | A pour offre, spontanée, changer de métier ; **B** pour stage, alternance, formation | **oui**, 2 tours seulement (`pulseObjectifUneFois`) | « Le poste que vous recherchez » (contrat, temps, disponibilité, horaires), couleur d'entreprise, **pas d'appuis** |
| **Reformuler mon CV** (bloc 2 « Votre objectif ») | 6 | B | non | « Métier ou domaine visé » ; **pas d'appuis** ; arrive **avant** le premier passage (bien) |
| **Reprendre mon CV, voie 1** (`maj`) | **aucune** : va chez l'assistant d'abord, les cartes viennent après (`_prepLETerminerStructuration` envoie vers `pageObjectif`) | A/B (celui de « Votre objectif ») | oui, à l'arrivée sur « Votre objectif » | **c'est le point 2 de Denis** |
| **Version rapide** (`pret`) | deux cartes de **parcours** (lettre, fiche) puis les cartes d'objectif **après** le premier passage | idem | idem | **c'est le point 6 (Lot 4b)** |
| **Analyser ma candidature** (Bilan) | 6 | B | non | bloc « Votre situation et l'offre visée », phrases propres à l'analyse |
| **Cohérence de mon dossier** | 6 | B | non | situation, photo de l'offre, « Une question ou une demande précise ? » |
| **Découvrir mes compétences** | **3 seulement** (offre, spontanée, stage ; décision de Denis du 19/09/2026 : les autres supposent un CV existant) | B | non | sans disponibilités |
| **Un CV, plusieurs métiers** (page 2) | 6 | C | non | intitulé du poste, ancien métier, « Autre chose à dire dans la lettre » |
| **Les mots de votre CV**, **Regard recruteur** | aucune carte (référence : une offre ou un métier) | panneau sans situation | sans objet | hors sujet |

Trois écarts de **vocabulaire** relevés au passage : les phrases des cartes parlent toutes du **CV** (« Adapter votre CV à une offre », « Créer un CV pour une entreprise », « CV adapté à une alternance ») **même dans la lettre et dans l'entretien** ; l'emballage B garde l'ancienne question « Comment souhaitez-vous rechercher un emploi ? » ; l'effet d'invitation s'arrête après 2 tours au lieu de continuer jusqu'au clic.

## 2. Ce qui manque au parcours référent (à ajouter pour qu'il serve partout)

Ce que l'ancienne rubrique a et que la lettre n'a pas (ou pas sous cette forme) :

1. **Le poste recherché** : contrat, temps de travail, disponibilité, horaires (« Le poste que vous recherchez » du CV). La lettre l'a déjà pour la spontanée et « Changer de métier » ; à rendre disponible aux autres cartes quand le parcours en a besoin.
2. **Le « Métier ou domaine visé » pour stage, alternance, formation** (Reformuler, pour adapter le vocabulaire).
3. **Les disponibilités des stages** (« Vos disponibilités ») : présentes sur « Votre objectif », absentes de la page de la lettre pour stage et formation.
4. **La couleur de l'entreprise** (CV seulement) : option du panneau, pas de la lettre.
5. **Le bloc « Votre situation » et les phrases propres à l'analyse** (Bilan, Cohérence) : à garder comme **option de module**, jamais dans la lettre.
6. **L'aide « photo de l'offre »** (Cohérence) et **« Une question ou une demande précise ? »** : options de module.

Ce que l'ancienne rubrique a en moins (donc rien à reprendre, seulement à **ajouter** là où il manque) : les **appuis** (lettre de recommandation) et la **civilité du recruteur** sur « Votre objectif », Reformuler, Bilan, Cohérence.

## 3. Ce qui est simple, risqué, bloquant

**Simple (reprise de l'existant)**
- Les cartes (une seule liste), le contenu de fond (une seule fonction), l'effet d'invitation (`pulseObjectifUneFois` existe, à généraliser et à boucler jusqu'au premier clic).
- Brancher les appuis et la civilité sur les écrans qui n'en ont pas : le panneau existe (`_coLettreHtmlAppuis`, `_coLettreBrancherAppuis`).

**Risqué (à traiter avec un plan, jamais à chaud)**
- **Remplacer l'emballage B par l'emballage A** : le bloc repliable `blocERIP(CONFIG_BLOC_CANDIDATURE)` est partagé par plus d'un écran et par `wireBlocERIP`, `verifierAvantPasserAction`, le verrou `etatAccesRevelation()` (« Continuer » grisé) et les tests ; grep sur tout le dépôt avant chaque pas.
- **Déplacer les cartes avant le premier passage** pour « Reprendre mon CV, voie 1 » et la version rapide : l'ordre des écrans change, donc la barre d'étapes, les « Retour », l'historique (flèche « Précédent ») et la reprise d'un parcours commencé. Aujourd'hui `_prepLETerminerStructuration` envoie vers `objectif` ; il faudra que le premier passage **reçoive déjà** l'objectif (le prompt d'extraction ne le lisait pas).
- **Découverte** n'affiche que 3 cartes : garder cette exception ou passer à 6 ? (voir questions).

**Bloquant : aucun.** Aucun point ne dépasse ce qui peut être codé et maintenu.

## 4. Plan proposé (un écran à la fois, un commit par écran, `npm test` + navigateur entre chaque)

| Pas | Contenu | Effort |
|---|---|---|
| **O1** | Brique unique « écran d'objectif » (cartes + effet d'invitation en boucle jusqu'au clic + panneau de candidature unique), paramétrée par parcours (options : appuis, civilité, poste recherché, situation, module) | haut |
| **O2** | « Votre objectif » du CV passe sur la brique (stage, alternance, formation inclus), ajout des appuis | haut |
| **O3** | Reformuler et Reprendre mon CV (voie 1) : cartes **avant** le premier passage, brique unique | haut |
| **O4** | Bilan, Cohérence : emballage unique, options de module | moyen |
| **O5** | Découverte, UCPM : alignement sur la brique | moyen |
| **O6** | Lot 4b : version rapide (cartes avant le premier passage) | haut |
| **O7** | Mots des cartes neutres (plus « CV » seulement) et nettoyage de l'ancien emballage | bas |

Fichiers qui seront touchés : `js/app.js`, `data/metiers.js`, `modules/coherence-transversale/ui.js`, `modules/decouverte-competences/decouverteParcours.js`, `modules/un-cv-plusieurs-metiers/page2Metiers.js`, `css/style.css`, `docs/BRIQUES_COMMUNES.md` (nouvelle brique), tests de parcours.

## 5. Questions pour Denis (à trancher sur la maquette)

1. **L'emballage unique** : la partie numérotée « Votre candidature » de la lettre (emballage A), toujours ouverte, partout. Les blocs repliables disparaissent. (Recommandé.)
2. **Les phrases des cartes** : les rendre neutres (« Adapter vos documents à une offre ») ou les garder centrées sur le CV ?
3. **Découverte** : garder trois cartes ou passer à six comme partout ?
4. **L'effet d'invitation** : boucle sans fin jusqu'au premier clic (comme demandé), mais s'arrête-t-il aussi si la personne revient plus tard sur l'écran sans objectif ? (Recommandé : oui, il reprend à chaque arrivée sans objectif choisi.)
5. **Les appuis (lettre de recommandation) sur « Votre objectif » du CV** : oui comme dans la lettre, ou seulement dans les parcours approfondis ? (Pour la version rapide, c'est déjà non.)
6. **L'ordre des pas** : O1 puis O2 (le CV, ce qui te gêne le plus) puis O3 (Reformuler et Reprendre mon CV). Les pas O4 à O7 ensuite.

## 6. Avancement

- **Fait le 25/10/2026 : « Votre objectif » du CV** (`pageObjectif`, `js/app.js`) reprend tel quel le composant « Votre candidature » de la lettre pour les six cartes (`contenuModeRecherche` en mode unifié pour offre, spontanée, changer de métier ; `contenuCandidature` pour stage, alternance, immersion, formation, avec durée, dates et heures comme dans la lettre). Plus de bloc repliable « Candidature » ni de « Le poste que vous recherchez ». « Vos appuis » (lettre de recommandation) ajouté, sauf en version rapide (`dossier.modeCreation === 'pret'`). Drapeau `_candidatureCalendrierIci` (levé le temps du rendu).
- **Règle de Denis sur les appuis** : proposés pour créer ou reprendre un CV, pour la lettre complète et pour l'entretien complet ; jamais pour la lettre rapide ni la fiche rapide.
- **Fait le 25/10/2026 (suite)** : le composant est une brique unique, `htmlCandidatureComposant()` et `wireCandidatureComposant()` (`js/app.js`), lue par « Votre objectif », « Reformuler mon CV » (sans civilité ni couleur, avec « Métier ou domaine visé », sans appuis car son prompt ne les lit pas) et « Reprendre mon CV, voie 1 » (les cartes viennent maintenant AVANT le premier passage chez l'assistant ; après le premier passage on ne repasse plus par « Votre objectif »). Titre de la partie : 📝 « Votre candidature », sans numéro seul. Essai `objectifComposant`.
- **Fait le 25/10/2026 (suite)** : Bilan (« Analyser ma candidature ») et Cohérence prennent le même composant (sans civilité ni couleur) ; leurs cartes restent, car l'analyse lit l'objectif (décision de Denis). Cohérence : le bouton « Lancer l'analyse » devient « Continuer » (règle de la barre du bas).
- **Fait le 25/10/2026 (suite)** : Découverte (trois cartes conservées, décision de Denis du 19/09 ; composant de la lettre avec civilité et couleur, sans « Le poste que vous recherchez ») ; **effet d'invitation en boucle** (`invitationCartesObjectif`, `js/app.js`) : les cartes se mettent en avant une à une, sans fin, jusqu'au premier clic, à chaque arrivée sans carte choisie ; sur « Votre objectif », la lettre, l'entretien, Reformuler, Reprendre voie 1, Bilan, Cohérence, Découverte.
- **Reste** : « Un CV, plusieurs métiers » (cartes à lui, brouillon prêté), la version rapide (Lot 4b),  UCPM, version rapide (Lot 4b), effet d'invitation en boucle, phrases des cartes.
- **Fait le 25/10/2026** : phrases des cartes neutres (« Adapter vos documents à une offre », « Documents adaptés à une alternance »...), une seule liste `OBJECTIF_CHOIX_CANDIDATURE`.
- **Lot 4b fait le 25/10/2026 : version rapide** (lettre et fiche, un seul parcours paramétré par le document) : « Votre CV », « Que voulez-vous préparer en premier ? » (le clic choisit, ne part plus chez l'assistant), « Votre objectif » (les six cartes et le composant de la lettre, verrouillé tant que le parcours n'est pas choisi, sans « Vos appuis »), puis « Continuer » (grisé jusqu'à ce que tout soit renseigné) vers le premier passage. Après le premier passage : « Vos informations », style d'écriture, second passage ; plus d'écran « Votre objectif » après coup. Le premier passage (lecture du CV, prompt `extraction-cv`) ne lit pas l'objectif : l'objectif sert au second passage (une mission par prompt). Page de présentation mise dans le nouvel ordre. Essai `versionRapide` complété.
