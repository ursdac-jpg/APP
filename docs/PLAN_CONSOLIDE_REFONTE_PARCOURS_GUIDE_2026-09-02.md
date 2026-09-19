# Plan consolidé : refonte du parcours guidé « Créer un nouveau CV »

> Chantier « Refonte de la carte Mes documents ».
> Ce document est le **point d'entrée unique** de la phase de code. Il rassemble
> les maquettes validées, les enquêtes faites, la carte des implications
> inter-modules, l'ordre des commits et le protocole de test.
> **Toutes les maquettes sont validées ; aucune ligne de code écrite à ce jour.**
> Point de reprise vivant : `docs/ETAT_REFONTE_PARCOURS_GUIDE_2026-09-02_SOIR.md`.

## Maquettes validées par Denis (2026-09-02)

| Écran | Maquette | Plan de détail |
|---|---|---|
| 🎯 Votre objectif (restructurée) | `docs/MAQUETTE_OBJECTIF_RESTRUCTURE_2026-09-02.html` (v5) | §3 de ce document |
| 📋 Vos informations (ex-« Mon projet » allégé) | `docs/MAQUETTE_MES_INFORMATIONS_2026-09-02.html` (v10) | `docs/PLAN_MES_INFORMATIONS_2026-09-02.md` |
| 👤 Votre profil (ex-« Faire le point ») | `docs/MAQUETTE_VOTRE_PROFIL_2026-09-02.html` (v9) | `docs/ENQUETE_FAIRE_LE_POINT_2026-09-02.md` §8 |
| 💬 Assistant (page dédiée) | `docs/MAQUETTE_ASSISTANT_2026-09-02.html` (v5) | §4 + `docs/ENQUETE_VOS_DOCUMENTS_2026-09-02.md` §10 |
| 📄 Vos documents | `docs/MAQUETTE_VOS_DOCUMENTS_2026-09-02.html` (v3) | §5 + `docs/ENQUETE_VOS_DOCUMENTS_2026-09-02.md` |
| 📐 La mise en page (sous-écran de Vos documents) | `docs/MAQUETTE_MISE_EN_PAGE_2026-09-02.html` (v6) | `docs/INVENTAIRE_REGLAGES_CV_2026-09-02.md` + `docs/REVUE_CRITIQUE_REGLAGES_CV_2026-09-02.md` |
| 👤 Carte « Vos coordonnées » | `docs/MAQUETTE_COORDONNEES_2026-09-02.html` (v1) | §5 (remplace `boiteCoordonnees`) |

---

## 1. Les deux consignes non négociables de Denis

1. **Zéro régression fonctionnelle.** Aucune fonction, aucun bouton, aucun champ
   perdu. Tous les endroits où ces informations sont lues ou écrites continuent
   de fonctionner à l'identique, **y compris dans les autres modules** (CV,
   lettre, entretien, prompts, Bilan, Cohérence transversale, Découverte,
   Comparer mes pistes, Repères). Inventaire **GARDÉ / DÉPLACÉ / FUSIONNÉ /
   ENRICHI** écrit **avant** de toucher au code, chaque lecteur vérifié un par un
   (§5 et §6).
2. **Le code est fidèle aux maquettes, à l'identique.** Chaque détail a été
   décidé (structure, libellés, ordre des champs, majuscule / chiffres par
   champ, replis en résumé, contexte par élément, couleurs de famille, retrait
   réversible, etc.). Pas de réinterprétation. Tout écart nécessaire = on
   revient vers Denis **avant** de coder autrement.

> Denis fait confiance sur les implications inter-modules qu'il ne peut pas
> vérifier lui-même. Au test final, si un manque apparaît, on le traite
> ensemble. D'où l'importance de la liste de contrôle §6.

---

## 2. Décision de nommage (validée : 2e personne « votre / vos »)

Aujourd'hui la barre d'étapes mélange les deux personnes : « Votre parcours »
mais « Mon projet », « Mes documents ». Toute l'application s'adresse déjà à la
personne à la 2e personne (« Vous pouvez », « Choisissez », « l'assistant en
ligne vous prépare tout »). On uniformise sur **« votre / vos »** : posture
d'accompagnement, la personne est adressée et guidée (plus rassurant pour un
public à confiance fragile que de la faire s'auto-étiqueter).

### Barre d'étapes cible du parcours `nouveau` (`CREER_CV_NAV_ETAPES`)

| Actuel | Cible |
|---|---|
| Objectif | **Votre objectif** |
| Votre parcours | Votre parcours *(inchangé)* |
| Mon projet | **Vos informations** |
| Faire le point | **Votre profil** |
| Assistant | Assistant *(inchangé, voir §4)* |
| Mes documents | **Vos documents** |

### Barres `pret` / `maj` (`PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES`, `MAJ_CV_NAV_ETAPES`)

| Actuel | Cible |
|---|---|
| Préparer | Préparer *(inchangé)* |
| Assistant | Assistant *(inchangé)* |
| Réponse | Réponse *(inchangé)* |
| Mon projet *(pret)* / Corriger mon CV *(maj)* | **Vos informations** *(pret)* / Corriger mon CV *(maj, à confirmer)* |
| Mes documents | **Vos documents** |

### Périmètre du renommage MAINTENANT

- Les **3 constantes de barre d'étapes** ci-dessus (`data/metiers.js` ~3356-3390).
- Le **titre `<h1>`** de chaque écran concerné (`pageObjectif`, `pageProjet`,
  `pageRevelation`, `pageResultats`) + sous-titres.
- Les **libellés des boutons de navigation** (`barreNavigation(...)`) qui citent
  « Faire le point », « Mon projet », « Mes documents ».
- Les **renvois textuels** entre écrans (« revenez à l'étape Mon projet »,
  « proposées plus loin à Faire le point », etc.).

### Hors périmètre (sweep séparé, à documenter dans `TACHES_VALIDEES.md`)

Le reste de l'application garde pour l'instant « Mon / Mes » : carte d'accueil
« Mes documents », « Découvrir mes compétences », « Mes freins », « Mon projet »
dans d'autres contextes, aides contextuelles, gabarits d'export. Un **sweep
global « Mon/Mes → Votre/Vos »** sera fait en une passe dédiée, après ce
chantier, pour éviter de le mélanger au code de refonte. À noter : « Créer mon
CV » (titre de `pageResultats`) devient « Vos documents » - cohérence entre le
titre de la page et le libellé de l'étape.

---

## 3. Écran « Votre objectif » (pas de plan séparé : détail ici)

`pageObjectif()` - `js/app.js` ~4345. Cible = `MAQUETTE_OBJECTIF_RESTRUCTURE_2026-09-02.html`.

### 3.1 Ce que l'écran gagne (DÉPLACÉ depuis « Mon projet »)

Les 2 blocs `blocERIP` retirés de `pageProjet` arrivent ici :

| Bloc source (`pageProjet`) | Devient sur « Votre objectif » |
|---|---|
| `CONFIG_BLOC_CANDIDATURE` (`js/app.js` ~10657, `sousSections()` branché sur l'objectif) | Bloc **« Votre candidature »** : métier précis / domaine, quel métier (saisie assistée depuis `baseMetiers` + bouton fiche France Travail au comportement double), quel domaine (menu déroulant « Autre » en premier), nom entreprise, lien site, lien ou texte de l'offre, intitulé du poste |
| `CONFIG_BLOC_PROJET` (`js/app.js` ~10526 : contrat / tempsTravail / accepte / disponibilite) | Bloc **« Le poste que vous recherchez »** (offre / spontanée / reconversion) **et** bloc **« Vos disponibilités »** (stage / alternance / pmsmp : période, dates, durée, heures hebdo) |

### 3.2 Adaptation par type d'objectif (`dossier.objectif`)

`OBJECTIF_CHOIX_CANDIDATURE` (`js/app.js` ~4316) = 6 items. `definirObjectifCandidature(valeur)`
(~4329) fait déjà le nettoyage `modeRecherche` / `typeRecherche` / `rechercheCandidature`
pour stage / alternance / pmsmp - **à conserver et étendre** :

| Objectif | Blocs affichés |
|---|---|
| offre | Votre candidature (avec entreprise + offre) + Le poste que vous recherchez |
| spontanée | Votre candidature (entreprise, sans offre) + Le poste que vous recherchez |
| reconversion | Votre candidature (métier/domaine cible) + Le poste que vous recherchez |
| stage / alternance / pmsmp | Votre candidature (allégée) + Vos disponibilités (dates, durée, heures) ; **pas** de « Le poste que vous recherchez » |

### 3.3 Fonctions / champs à préserver (liste de contrôle)

- Saisie assistée métier : autocomplétion sur `baseMetiers` (`rome:` présent
  sur les 65 entrées) ; pastille valeur unique avec croix ; Entrée **et** clic
  souris valident ; saisie libre acceptée sans message « reconnu / pas
  reconnu ».
- Bouton fiche France Travail : métier de la base → fiche directe
  (`lienFicheROME`) ; hors base → page de recherche du répertoire. Caveat
  « les intitulés de métiers et leurs fiches évoluent ».
- Menu domaine : `secteurCible`, « Autre » en premier, alphabétique.
- `dossier.rechercheCandidature.{entreprise, lienSite, offre, intitulePoste}` :
  formes inchangées.
- `dossier.typeRecherche` (`offre` vs recherche générale) : réconcilier avec le
  couple « structure précise / recherche générale » déjà porté par
  `typeRecherche` (voir mémoire `project_chantier_candidature_recherche_secteurs`).
- `dossier.contrat` / `dossier.tempsTravail` / `dossier.accepte` /
  `dossier.disponibilite` : formes inchangées, juste déplacées d'écran.
- Jetons « case à cocher » / « radio » modernisés = **brique commune** (§7),
  pas un CSS jetable sur cet écran.
- `pageObjectif` ligne ~4373 : `naviguerVers(dossier.cvAnalyse ? 'projet' : 'votre-parcours')`
  - à adapter (`'projet'` → route inchangée, mais l'écran est renommé) et à
  re-tester pour les 3 parcours.

### 3.4 Recherche à brancher (non négociable)

Barre d'accueil + Lexique : vérifier que « Votre objectif » et ses nouveaux
blocs sont indexés (le bloc Candidature avait déjà sa recherche sur « Mon
projet » - la suivre dans le déplacement).

---

## 4. Écran « Assistant » : rien à maquetter

L'étape « Assistant » de la barre **n'est pas une page routée**. `_creerCvNavIndex`
ne renvoie jamais l'index 4 : c'est la **cascade de fenêtres** qui se déclenche
entre « Votre profil » et « Vos documents » :

écran tampon → `ouvrirAssistantDepotCV` (dépôt / vérification / masquage du CV) →
pastilles de choix d'assistant (`lignePastillesAssistantsIA`) →
`ouvrirConfirmationAssistantWizard` → `ouvrirFenetreAssistantIA` → décompte →
retour sur « Vos documents » avec la réponse.

- **`ouvrirAssistantDepotCV` (~700 lignes, `data/metiers.js` ~1689) : NE JAMAIS
  MODIFIER.** Partagée par `pret`, `maj`, et les modules Lettre / Entretien /
  Cohérence transversale.
- Seul changement possible ici : le **libellé de l'étape** (« Assistant »,
  inchangé) et, si un texte de ces fenêtres cite « Mon projet » / « Mes
  documents », l'aligner sur le nouveau vocabulaire (à repérer au grep, à
  corriger sans toucher à la logique).

---

## 5. Écran « Vos documents » (`pageResultats`) : REFONTE COMPLÈTE

`pageResultats()` - route `resultats`, `_creerCvNavIndex` = 5.

**Décision Denis (2026-09-02) : cette page mérite une refonte totale, comme les
3 écrans précédents.** Constat déclencheur : elle a **deux titres qui ne
concordent pas** - « Mes documents » dans la barre d'étapes, « Créer mon CV »
en `<h1>` de la page. La structure a vieilli (empilement « Régler le style » +
« Informations transmises à l'assistant » + « Coordonnées » + « Résumé de votre
candidature » + « Expérience professionnelle » + boutons « Vérifier » /
« Continuer »).

### 5.1 Méthode (identique aux 3 autres écrans)

1. **Enquête** `docs/ENQUETE_VOS_DOCUMENTS_2026-09-XX.md` : tracer le parcours
   réel complet (écran d'avant = « Votre profil » ; ce qui se passe au clic
   « Continuer » = cascade Assistant ; écran d'après = retour ici avec la
   réponse), inventaire de **toutes** les fonctions / boutons / blocs, les 3
   variantes (`nouveau` / `maj` / `pret`) + Découverte (`depuisDecouverte`), et
   la frontière avec le Composeur / l'Aperçu / les panneaux perso.
2. **Maquette** éditable par Denis, thèmes clair + sombre, comme les autres.
3. **Validation Denis**, puis code.

### 5.2 Frontière à cadrer avec Denis AVANT la maquette

La page contient de la **machinerie lourde et séparée** :

- le **Composeur** de CV (édition bloc par bloc du CV structuré),
- l'**Aperçu** en direct (rendu CV PDF / A4-A5),
- les **panneaux perso CV PDF et Word** (couleurs, modèles Sobre / Créatif,
  icônes…), déjà l'objet de nombreux chantiers clos.

**Recommandation :** la refonte porte sur la **structure de la page, l'en-tête,
le vocabulaire, l'enchaînement des blocs, la carte Coordonnées et la lisibilité
générale** (le « squelette » de l'écran, exactement ce qu'on a fait ailleurs).
Le Composeur / l'Aperçu / les panneaux perso restent une **machinerie interne
réemployée telle quelle**, réintégrée dans la nouvelle structure - pas rasés,
pas réécrits dans ce chantier. À confirmer par Denis (§9.1).

### 5.3 Points déjà identifiés, à intégrer à l'enquête / la maquette

1. **Titre unique** : la barre d'étapes dit « Vos documents », la page doit dire
   la même chose (fin du « Créer mon CV » en `<h1>`).
2. **Doublon des coordonnées.** `construireContenuApercuFinalisation` affiche une
   carte **« Coordonnées »** avec exactement les champs de l'identité (civilité,
   nom, prénom, courriel, téléphone, adresse, code postal, ville, photo) + le
   message « Nous n'avons actuellement aucune coordonnée enregistrée…
   renseignez-les ici ». « Vos informations » devient la **source unique**
   (étape obligatoire des 3 parcours). Cible : carte en **lecture seule**
   (« Voici les coordonnées saisies à l'étape Vos informations » + « Modifier »
   → `projet`), formulaire de saisie retiré. Si l'identité est incomplète à
   l'arrivée : renvoyer vers « Vos informations », ne pas ressaisir ici.
3. **« Résumé de votre candidature »** (Civilité / Type de CV / Objectif /
   Métier) : redondant avec « Votre profil en bref » de l'écran précédent -
   décider quoi garder (probablement un rappel minimal, cohérent avec « en
   bref »).
4. **Bloc « Régler le style du texte du CV »** (facultatif, déplié) : garder,
   déplacer, ou renvoyer plus loin (juste avant l'Aperçu) ?
5. **`_pageOrigineAvantResultats` / `cibleRetourResultats`** (~12679) : repli du
   « Retour » = `revelation` par défaut. À conserver.
6. **`verifierAvantPasserAction()`** (sortie de `pageRevelation`) : gate +
   demande de coordonnées entreprise si « offre » sans entreprise. Reste en
   place comme filet.
7. **`ouvrirAssistantDepotCV` : jamais modifié** (§4). La sortie de
   `pageResultats` vers la cascade Assistant (voir commentaire `js/app.js`
   ~9401) reste inchangée.
8. **`depuisDecouverte`** : `pageResultats` est paramétrée (jamais forkée) pour
   le parcours Découverte - la refonte doit préserver ce paramétrage.

---

## 6. Carte des implications inter-modules (le cœur du travail)

À vérifier **un par un** avant et pendant le code. Chaque ligne = un lecteur ou
un partage qui ne doit pas casser.

### 6.1 Génération CV / lettre / entretien

| Donnée | Lecteurs connus | Risque |
|---|---|---|
| `dossier.identite.*` | modèles CV PDF + Word, prompts lettre, prompt entretien, `construireContenuApercuFinalisation`, résumés | Ordre prénom/nom **d'affichage** change ; la **structure** `{civilite, nom, prenom, adresse, codePostal, telephone, email, ville}` ne change pas. Civilité « Ne pas préciser » doit prendre la logique « Monsieur » à la génération (à câbler). |
| `dossier.permis` `{possede, categories:[], vehicule}` | modèles CV | Repli en résumé = affichage seul, structure inchangée. |
| `dossier.langues` `[{langue, niveau}]` + `languesFrancaisUniquement` | modèles CV | « Autre » ne doit jamais être stocké comme langue. Règle niveau langue = texte A1-C2, jamais de pastilles (mémoire `project_regle_niveau_langue_texte`). |
| `dossier.formations` `[{niveau, intitule, annee, typeCredential, niveauRNCP, ...}]` | modèles CV, `resumeParcours`, ~15 endroits | Mécanisme `contenuFormations` **partagé avec Découverte** (§6.4). Intitulé + année désormais obligatoires : vérifier qu'aucun lecteur ne suppose un intitulé vide possible. |
| `dossier.certifications` = **simples chaînes** (~15 lecteurs) | modèles CV, prompts | **Ne pas transformer en objets.** Dates / contexte vont dans `dossier.detailsCatalogue.certifications` (`avecDatesSeparees`, `avecContexte`). |
| `dossier.experiencesPerso`, `dossier.loisirs`, `dossier.engagements` | modèles CV | Chaîne **ou** `{texte, dateDebut, dateFin}` : garder la tolérance des deux formes. Contexte par élément = mécanisme `avecContexte` existant, pas une 2e nomenclature. |
| `dossier.rechercheCandidature.{entreprise, lienSite, offre, intitulePoste}` | prompts lettre / entretien, `verifierAvantPasserAction`, bannière « je postule » | Déplacé de « Mon projet » vers « Votre objectif » : vérifier tous les lecteurs. |
| `dossier.contrat / tempsTravail / accepte / disponibilite` | modèles CV, prompts | Idem, déplacé d'écran. |

### 6.2 Verrous et navigation

| Élément | Aujourd'hui | Après |
|---|---|---|
| `etatAccesRevelation()` (`js/app.js` ~6370, `blocCibleId: 'blocERIP-candidature'`) | Bloque « Faire le point » tant que `CONFIG_BLOC_CANDIDATURE` incomplet | Le bloc part sur « Votre objectif » → le **verrou part avec lui**. « Vos informations » ne bloque rien (« Continuer » toujours actif). Un verrou équivalent peut réapparaître sur « Votre objectif » si Denis le souhaite (candidature = pré-requis pour avancer). |
| `_pageOrigineAvantProjet` | Capturé par `naviguerVers()`, sert au repli du « Retour » de `pageProjet` | Conserver tel quel. |
| `_pageOrigineAvantResultats` / `cibleRetourResultats` | Repli « Retour » de `pageResultats` = `revelation` | Conserver. |
| `_creerCvNavIndex` / `_prepLENavIndex` | Mapping écran → index de barre | Mettre à jour si des routes changent (elles ne changent pas, seuls les libellés changent). |
| `verifierAvantPasserAction()` | Gate métier + demande entreprise | Conserver comme filet. |

### 6.3 Métier cible (sous-système partagé)

`banniereMetierCible()` / `banniereDomaineCible()` / `wireBanniereMetierCible` /
`wireRechercheMetierCible` / `wireMetierCibleGlobal` / `wireEvidenceMetierCible` /
`modeRechercheEffectif()` (`js/app.js` ~6459).

- Utilisés par `pageRevelation` **et** par le guide « recherche d'accueil »
  (`ouvrirPanneauEntreprise`) **et** par `banniereJePostuleContenu`.
- Sur « Votre profil », ce bloc devient un **récap replié** ; « Changer » le
  déplie tel quel. **Aucune fonction retirée**, juste repliée par défaut.
- `dossier.modeRecherche` vient désormais de « Votre objectif » : vérifier que
  `modeRechercheEffectif()` reste cohérent partout où il est lu.
- Caches : `invaliderCacheMetiersRecommandes()` / `invaliderCachePistes()` - ne
  pas casser (perf + stabilité du tirage). `construireProfil()` /
  `rechercherMetiers()` alimentent aussi la piste « candidater depuis la
  recherche de l'accueil » (chantier séparé) - ne rien y toucher.

### 6.4 Parcours Découverte (`modules/decouverte-competences/decouverteParcours.js`)

- **Partage `contenuFormations`** et tout son mécanisme de missions par secteur :
  `contenuMissionsFormationBrouillon`, `CATALOGUE_MISSIONS_FORMATIONS_PAR_SECTEUR`,
  `NIVEAUX_AVEC_CATALOGUE_SECTEURS`, `NIVEAUX_DIPLOME_SIMPLES`,
  `NIVEAUX_RNCP_TITRE_CQP`, `formationBrouillonPeutAjouter`,
  `libelleValiderFormation`, `niveauFormationAffiche`, `brouillonFormationEnCours`,
  `construireBrouillonDepuisFormation`, `_editionFormationExistanteIndex`.
  Découverte utilise `TYPES_CREDENTIAL_FORMATION`, « Mon projet »
  `TYPES_FORMATION_MON_PROJET`. **Réutiliser, jamais réécrire.** La v1 de la
  maquette « Mes informations » avait fait disparaître les missions par
  secteur : ne pas refaire l'erreur.
- `pageRevelation` est atteinte depuis Découverte : `depuisDecouverte` adapte
  `pageResultats` (via `pageResultats` paramétrée, jamais forkée) - vérifier si
  `pageRevelation` a aussi un chemin Découverte. Les blocs questionnaire
  (« Ce qui fait votre valeur », « Ce qui pourrait vous correspondre ») sont
  pertinents pour Découverte : les masquages `nouveau`-seulement ne doivent pas
  casser le rendu Découverte.

### 6.5 Bilan de candidature + Cohérence transversale

- Le **transfert Cohérence transversale → Bilan** (mémoire
  `project_transfert_ct_vers_bilan`, terminé 2026-08-25) transmet
  entreprise / offre / type de structure + recommandations CV. Si ces champs
  changent d'écran de saisie (« Votre objectif » au lieu de « Mon projet »),
  **vérifier que le transfert lit toujours les bons champs `dossier.*`** (les
  clés ne changent pas, seul l'écran de saisie change - donc a priori OK, à
  confirmer).
- Le composant partagé d'import CV / contexte de candidature construit pour le
  Bilan le 2026-08-30 (dette B.1 de `BRIQUES_COMMUNES.md`) : la refonte des
  écrans qui importent un CV doit, au passage, adopter ce composant. Vérifier si
  « Votre objectif » / « Vos informations » ont une fenêtre d'import à aligner.

### 6.6 Modules Repères et Comparer mes pistes (branchés dans « Votre profil »)

- Repère : `reperesBoutonAncre({libelle})` / `_reperesRenduBoutonAncre`
  (`modules/reperes/index.js` ~2451) rend
  `<button class="btn btn-outline-secondary btn-sm aide-repere-ancre">`
  `<i class="bi bi-bookmark-star"></i> Garder comme Repère</button>` + picker.
  `reperesBrancherBoutonAncre()` le câble, appelé en fin de `pageRevelation`
  (~8487). **Réutiliser tel quel** - la maquette « Votre profil » reprend
  l'icône (`bi-bookmark-star`) et le libellé exacts.
- Comparer : `comparerBoutonPanier(nom)` (`modules/comparer-pistes/index.js` ~223)
  rend `<button class="btn btn-sm btn-outline-primary cp-btn-panier">`
  `<i class="bi bi-signpost-split"></i> Comparer cette piste</button>`.
  Le module affiche « aucun score, aucun classement » - la maquette « Votre
  profil » a **abandonné la barre de compatibilité** pour rester cohérente avec
  ce principe. Ne pas réintroduire de score.

### 6.7 Suivi Umami

Événements liés à `pageProjet` / `pageObjectif` / `pageRevelation` /
`pageResultats` (`bilan_preparer_affichee` et autres). Vérifier qu'ils suivent
le renommage (nom d'événement inchangé, mais s'assurer qu'ils se déclenchent
toujours au bon endroit après refonte).

### 6.8 Recherche (barre d'accueil + Lexique)

Non négociable : chaque écran refondu re-branche sa propre recherche. Les 3
écrans existent déjà et sont probablement indexés - **vérifier** après refonte
que les nouveaux blocs (« Votre candidature », « Vos disponibilités », « Votre
profil en bref ») sont trouvables.

---

## 7. Brique commune : jetons + champs modernisés

La passe visuelle des jetons (« case à cocher » / « radio ») et des champs
(halo au focus, badges, chevrons) présente sur les 3 maquettes doit devenir
un **composant partagé** (entrée dans `BRIQUES_COMMUNES.md`, mise à jour dans le
même commit), appliqué partout où contrat / disponibilité / langue / objectif /
etc. apparaissent - **jamais un CSS jetable écran par écran**.

---

## 8. Ordre de code proposé

> Un commit par sous-étape. `npm test` (référence 603+ verts) + test navigateur
> sur `nouveau` / `maj` / `pret` **et** Découverte à chaque sous-étape. Jamais un
> état à moitié refondu. Commits directement sur `master` une fois vérifiés.

### Étape 0 - Préparation (pas de code fonctionnel)

- Écrire l'**inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI** complet (les 3
  écrans + « Vos documents »), en cochant chaque lecteur de §6.
- Grep de tous les libellés « Mon projet » / « Faire le point » / « Mes
  documents » / « Créer mon CV » dans `js/`, `data/`, `modules/`, gabarits
  d'export.

### Étape 1 - Renommage (isolé, à bas risque)

- Les 3 constantes de barre d'étapes + titres + libellés de navigation +
  renvois textuels (§2). Aucune logique touchée.
- Test navigateur : les 3 barres s'affichent avec le nouveau vocabulaire, la
  navigation fonctionne.

### Étape 2 - « Votre objectif » + descente des 2 blocs

- Faire **arriver** `CONFIG_BLOC_CANDIDATURE` et `CONFIG_BLOC_PROJET` sur
  `pageObjectif` (adaptation par `dossier.objectif`, §3) **avant** de les
  retirer de `pageProjet` - zéro trou à aucun instant.
- Déplacer `etatAccesRevelation` / le verrou avec le bloc Candidature (ou le
  neutraliser si Denis ne veut pas de verrou sur « Votre objectif »).
- Habillage = brique commune §7.
- Test : les 6 types d'objectif affichent les bons blocs ; entreprise / offre /
  contrat / dispo bien enregistrés ; `naviguerVers` post-objectif OK sur les 3
  parcours ; transfert Cohérence transversale → Bilan encore bon (§6.5).

### Étape 3 - « Vos informations » (ex-« Mon projet »)

Suivre `docs/PLAN_MES_INFORMATIONS_2026-09-02.md` §5 :
1. Retrait des 2 blocs partis + renommage interne.
2. Bloc « Vous » : prénom/nom, majuscule/chiffres par champ, Entrée-au-suivant,
   « Enregistrer mon identité » + résumé replié, adresse facultative, question
   photo, retrait du bandeau coordonnées.
3. Mobilité : repli sur résumé après réponse véhicule.
4. Langues : barre alignée, invitation visible, « Autre » + Entrée.
5. Formations : **réutiliser `contenuFormations`** (étapes 1/2/3, intitulé +
   année obligatoires, missions par secteur, pastilles éditables). Tester
   Découverte à chaque sous-étape.
6. Certifications + Loisirs + Engagements + Expériences perso : contexte par
   élément (`avecContexte`), astuce verte en gras, retrait « Voir des
   exemples ».

### Étape 4 - « Votre profil » (ex-« Faire le point »)

Suivre `docs/ENQUETE_FAIRE_LE_POINT_2026-09-02.md` §8.4 :
- Intro 1 phrase.
- Encart « Métier visé » = récap ; message « Pour choisir un autre métier,
  revenez à l'étape Votre objectif, en haut de la page » ; bouton fiche France
  Travail au comportement double (reconnu → fiche directe ; hors base → page de
  recherche du répertoire). **Pas de bouton « Modifier le métier visé ».**
- « Votre profil en bref » : rubrique ouverte, non dépliable (comme le métier
  visé). Lignes = infos clés des étapes précédentes, en lecture seule, note
  « pour corriger, retournez à l'étape concernée ».
- Regroupement visuel **5 → 2 sections SANS fusionner les `CONFIG_BLOC_*`** :
  - « Des métiers à regarder » = `CONFIG_BLOC_METIERS` + `CONFIG_BLOC_PISTES`,
    une seule liste. Métiers suggérés = « proche de votre profil » ; « Autres
    pistes » = métiers du même domaine que le métier visé. **Pas de « Choisir
    ce métier »** (public peu autonome, clics accidentels, base trop petite) ;
    par métier : « Garder comme Repère » (`bi-bookmark-star`), « Comparer cette
    piste » (`bi-signpost-split`), « Fiche du métier (France Travail) ».
    Infobulle « compétences en commun » au survol de l'étiquette du métier
    (une seule à la fois : survol → apparaît, souris s'éloigne → disparaît ;
    clic → épinglée ; clic ailleurs → ferme), avec les compétences colorées
    par famille.
  - « Vos compétences » = `CONFIG_BLOC_PROFIL` + (nouveau seulement)
    `CONFIG_BLOC_CORRESPONDANCE` + « Ce qui fait votre valeur ». Compétences
    classées **Savoir-faire / Savoir-être / Savoirs** (`categorieCompetence`
    ne connaît que 2 familles → les Savoirs se reconstruisent depuis les
    champs `savoirs` des fiches métier), une couleur par famille + légende.
    Compétences **retirables mais pas ajoutables** ; retrait **réversible sans
    déplacement** (la pastille reste en place, devient grise / barrée, la
    croix devient « Remettre »). Clic sur une compétence → court descriptif +
    « Garder comme Repère ». **Décision Denis en attente** (§8.4 de l'enquête) :
    garde-t-on « Ce qui fait votre valeur » ET « Ce qui pourrait vous
    correspondre » (ils se recoupent) ou un seul ?
- Repère d'ancrage visible en bas.
- Variantes : `maj` / `pret` (pas de blocs questionnaire) ; `domaine` (pas de
  « Des métiers à regarder »).
- L'état gardé / retiré des compétences doit vivre dans le `dossier` pour
  survivre à la navigation.

### Étape 5 - « Vos documents » : refonte complète (§5)

- **D'abord enquête + maquette + validation Denis** (méthode §5.1), après avoir
  cadré la frontière avec le Composeur / l'Aperçu / les panneaux perso (§5.2).
- Puis code : titre unique, nouvelle structure, carte Coordonnées en lecture
  seule, résumé candidature minimal, réintégration de la machinerie existante
  sans la réécrire.
- Cette étape peut se faire **en parallèle** des étapes 2-4 côté conception
  (enquête + maquette), mais son code vient après, car elle dépend des libellés
  et des données figées par les écrans amont.

### Étape 6 - Brique commune jetons / champs (§7)

Généralisation + `BRIQUES_COMMUNES.md`.

### Étape 7 - Passe finale

- Test navigateur exhaustif : `nouveau` / `maj` / `pret` / `domaine` /
  Découverte, bout en bout.
- `npm test` vert. `node scripts/checkLexique.js` si le Lexique a bougé.
- Vérifier la recherche (barre d'accueil + Lexique) sur les nouveaux blocs.

### Étape 8 - Aide contextuelle (l'ampoule) - FAIT 2026-09-03

`AIDE_PAGES` / `AIDE_FENETRES` (`js/app.js` ~31685) revues pour les 6 écrans
du parcours `nouveau` :

- `objectif` : `.objectifs` -> `.grille-objectif` (texte : plus de « passe
  directement à l'étape suivante ») ; ajout `#blocERIP-candidature` et
  `#blocERIP-projet` (les deux bandeaux en jetons).
- `votre-parcours` : nouvelle entrée (route unique qui remplace les 4 ex-routes
  activites/actions/environnement/valeurs) ; cible `.vp-question`.
- `projet` : `.grille-mon-projet` (texte : 5 bandeaux, indépendants) ; ancienne
  entrée `.resume-bloc-erip .pastille-mini-conteneur` (morte) remplacée par
  `[data-blocs-tout]` (Tout déplier / replier + édition au clic sur le jeton) ;
  `.barre-navigation-fixe` : texte « Votre profil » (plus de bandeau
  Candidature ici).
- `revelation` : `.accordeon` -> `.bloc-erip` ; `#blocERIP-metiers, #blocERIP-pistes`
  -> `#blocERIP-metiers` seul (pistes fusionné dans métiers).
- `assistant` : nouvelle entrée (route `assistant`, parcours `nouveau`) ;
  `.assistant-rect` (les 4 encadrés) + `.barre-navigation`.
- `resultats` : `.cv-section` / `.ligne-etapes-action` (mortes) -> `[data-rect-doc]`
  (les 3 encadrés Le format / La mise en page / Exporter) + `.et-apres`.
- Entrée commune « Où vous en êtes » (`.barre-etapes-bilan`, le stepper 6
  étapes) ajoutée en tête des 6 écrans.
- Ménage : `var _AIDE_ETAPES_QUESTION_MULTI` supprimé (n'avait plus que les 4
  ex-routes comme consommateurs) ; entrée `AIDE_FENETRES['candidature-rapide']`
  supprimée (`ouvrirFenetreCandidatureRapide()` retiré, 0 appelant).

Vérifié au navigateur : sur les 6 écrans, en état `modeCreation:'nouveau'`,
toutes les entrées `AIDE_PAGES` correspondent à un élément réel (0 étape
écartée par le filtre de la visite guidée). `npm test` : 646 verts.

---

## 9. Décisions Denis (toutes tranchées le 2026-09-02)

1. **« Vos documents » : profondeur de la refonte : TRANCHÉ.** Squelette refondu
   (en-tête, titre unique, structure des rectangles, vocabulaire 2e personne,
   carte Coordonnées lecture seule). Le Composeur, l'Aperçu inline et les
   panneaux perso PDF / Word restent de la machinerie interne réemployée telle
   quelle. Confirmé par les maquettes validées (`MAQUETTE_VOS_DOCUMENTS` v3,
   `MAQUETTE_MISE_EN_PAGE` v6, `MAQUETTE_COORDONNEES` v1).
2. **« Votre profil » : les deux blocs du questionnaire : TRANCHÉ, on garde les
   deux, renommés.** « Ce qui fait votre valeur » devient « **Ce que vous
   aimez** » (reprise factuelle des réponses). « Ce qui pourrait vous
   correspondre » devient « **Des pistes à explorer** » (synthèse points forts +
   métiers cliquables). Les deux restent affichés en parcours `nouveau`
   seulement (inchangé). Zéro perte de contenu.
3. **Barre `maj` : TRANCHÉ, on garde « Corriger mon CV ».** Le parcours `maj`
   corrige un CV importé, il n'y a pas de formulaire d'infos à cette étape :
   « Vos informations » serait trompeur. `MAJ_CV_NAV_ETAPES` (`data/metiers.js`
   ~3367) inchangé sur ce libellé.
4. **Verrou d'accès « Votre objectif » vers « Votre profil » : TRANCHÉ, on garde
   le filtre léger `etatAccesRevelation()` tel quel.** Il demande seulement de
   choisir comment on cherche (domaine, ou métier précis + simple / offre) ;
   stage / alternance / immersion passent sans rien. Ce choix conditionne tout
   l'aval (métier cible, type de CV). Pas de « candidature remplie » en plus, ne
   pas le retirer non plus.
5. **Sweep global « Mon/Mes vers Votre/Vos » : TRANCHÉ, chantier séparé après
   celui-ci**, tracé dans `TACHES_VALIDEES.md`. Ne pas le mêler à la refonte du
   parcours guidé.
6. **Ordre de travail : TRANCHÉ, toutes les maquettes figées AVANT le code.**
   Fait : 6 maquettes du parcours + carte Coordonnées validées par Denis le
   2026-09-02. On passe à la phase de code selon l'ordre §8.
7. **Question « statut / situation » : TRANCHÉ (2026-09-02).** Champ **facultatif
   « Votre situation en ce moment »** dans le rectangle « Réglez le style » de la
   page Assistant (PAS sur « Votre objectif »). Sans défaut, jamais bloquant,
   jamais un diagnostic. Options neutres : En poste / En recherche d'emploi / En
   études ou en formation / En reconversion / Reprise après une pause / Je
   préfère ne pas préciser (jamais « chômeur », « sans emploi », « inactif »).
   `dossier.situationActuelle` (null par défaut), transmis à l'assistant
   seulement si renseigné (même patron que les réglages de style), **n'adapte
   aucun écran en aval**. Vu dans `MAQUETTE_ASSISTANT` v5.
