# Chantier « Candidater depuis la recherche + secteurs de métier » (APP)

> **Statut : TERMINÉ le 2026-09-04.** Découpé en 5 sous-lots (data d'abord, visuel ensuite,
> prompts en dernier), tous livrés :
> - **Sous-lot 1** (`9fc2630`) : champ `secteur` normalisé — 52 libellés libres → 21 valeurs
>   contrôlées (`SECTEURS_APP`, `data/metiers.js`). Les 2 filtres par libellé de `js/app.js`
>   remplacés par des listes d'ids (`METIERS_SAISONNIER_ALIMENTAIRE` 26 / `METIERS_QUI_RECRUTENT_GENERALEMENT` 39).
> - **Sous-lot 2** (`630f041` + `8bbf85d`) : `data/secteurs.js` = `SECTEURS_DETAIL` (21 objets
>   `{cle, libelle, explication, metiersPhares}`), explications rédigées et validées Denis.
> - **Sous-lot 3** (`0dbc357`) : un secteur tapé dans la recherche de l'accueil → groupe
>   « Secteurs de métier » en tête, `carteSecteurHTML` (libellé + explication + dépli des métiers).
> - **Sous-lot 4a** (`c431ca5`) : rattrapage « métier non répertorié » — bouton dans l'état
>   « Aucun résultat » → parcours candidature en texte libre.
> - **Sous-lot 4b** (`8d14a5a`) : la cascade de 4-5 fenêtres empilées (`ouvrirPanneauChoixParcours`
>   → `ouvrirPanneauEntreprise` → `ouvrirPanneauCvExistant` / `ouvrirPanneauMajCv`) est remplacée
>   par UNE page dépliante `pageCandidaterDepuisRecherche()` (route `'candidater'`) : barre
>   d'étapes + 3 blocs (Ce que vous préparez / Votre cible / Votre CV) + barre de navigation fixe.
>   Conforme à `docs/MAQUETTE_CANDIDATER_DEPUIS_RECHERCHE_2026-09-04.html`. Réconciliation
>   « structure précise / recherche générale » portée par le bloc 2 (jetons `offre` / `simple`).
>   Seule fenêtre restante : `ouvrirFormulaireCoordonneesEntreprise` (partagée avec Mon projet).
> - **Sous-lot 5** (`0312c37`) : bouton « Candidater pour ce secteur » → parcours partant de
>   `dossier.secteurCible` (`modeRecherche 'domaine'`). Passe de prompt (5b) : rien à changer,
>   `texteProfil` transmet déjà « Secteur d'activité visé… », `cv.md` dit « métier OU secteur ».
>
> Plan data : `docs/PLAN_SECTEURS_2026-09-04.md`. Tests : `tests/secteursMetiers.test.js`.

---

## 1. Le besoin, en clair (mots de Denis, 2026-09-01)

1. **Revoir tout le parcours « je connais mon métier, je candidate depuis l'accueil »** :
   la partie **visuelle**, les **écrans**, et l'**accessibilité**. Aujourd'hui : la barre de
   recherche de l'accueil remonte des métiers de notre base ; on clique, et on peut préparer un
   CV, une lettre, un entretien pour ce métier. Ce parcours n'a jamais été aligné sur le
   standard visuel/accessibilité des modules récents.
2. **On ne peut candidater qu'à un métier qui a une fiche.** Denis veut ajouter des
   **secteurs de métier** comme point d'entrée.
3. Quand la recherche de l'accueil remonte un **secteur**, la personne doit voir :
   - les **métiers les plus importants / fréquents / connus** de ce secteur ;
   - une **explication** : qu'est-ce que ce secteur, ce qu'on y fait ;
   - la possibilité de **candidater directement en partant du secteur** : préparer un CV, une
     lettre de motivation, un entretien sans passer par un métier précis.
4. **Trouver où poser la question** : la personne vise-t-elle une **structure précise** (une
   entreprise, une agence d'intérim identifiée) ou fait-elle une **recherche générale** ?
   Denis : « ça verra par la suite » -> à cadrer dans le chantier, pas tranché maintenant.

---

## 2. État du code aujourd'hui (vérifié 2026-09-01)

### 2.1 La recherche de l'accueil

- Champ `#rechercheERIPInput` dans `pageChoixCV()` (`js/app.js` ~L3990), rendu par
  `rendreResultatsRechercheERIP()` (~L886). Suivi Umami : `recherche_utilisee` /
  `recherche_sans_resultat` (débounce 600 ms).
- Un clic sur un résultat **métier** (`[data-metier-nom]`, handler ~L4230) :
  `effacerSauvegarde()` puis `ouvrirPanneauChoixParcours(metierNom)`. Trace `metier_consulte`.
- Autres types de résultats déjà gérés : compétence, champ associé, domaine d'activité, module
  de l'app, entrée de Lexique, frein, renvoi annuaire. **Aucun résultat de type « secteur ».**

### 2.2 Le parcours de candidature depuis un métier

`ouvrirPanneauChoixParcours(metierNom)` (`js/app.js` ~L1111) :
1. réinitialise `rechercheGuidee = { metier, parcours: null }`, `dossier.typeRecherche = null`,
   `dossier.rechercheCandidature = { entreprise, site, lienOffre, ... }` ;
2. panneau « Choisissez le parcours » -> 3 pastilles radio : Préparer mon CV / ma lettre /
   mon entretien ; + bouton « Comparer mes pistes » si la personne hésite ;
3. -> `ouvrirPanneauEntreprise()` (~L1152) : « Connaissez-vous déjà l'entreprise ? » Oui/Non
   -> `ouvrirFormulaireCoordonneesEntreprise()` (le même formulaire Nom / Site / Lien-offre que
   le bloc Candidature de « Mon projet ») ;
4. -> rejoint le parcours CV / lettre / entretien normal.

Ces panneaux utilisent `ouvrirPanneauGuide()` (fenêtre sur fenêtre) — **pas** le langage
visuel des pages dépliantes récentes. C'est ce que Denis veut revoir (point 1).

### 2.3 Les données métier

- `data/metiers.js` (`baseMetiers`, ~L25) : **65 fiches**. Chaque fiche a déjà un champ
  **`secteur`** (chaîne libre), plus `id`, `nom`, `rome`, et le vocabulaire de rapprochement.
- **~34 valeurs de `secteur` distinctes, non normalisées** : doublons et chevauchements
  (`Restauration` vs `Hôtellerie-restauration` ; `Services` vs `Services à la personne` ;
  `Commerce` vs `Commerce alimentaire` vs `Grande distribution` ; `Santé` vs `Médico-social` ;
  beaucoup de secteurs à 1 seule fiche). **Aucune fiche de secteur**, aucune explication,
  aucun classement « métiers phares » par secteur, aucun secteur cliquable.

### 2.4 Ce qui existe DÉJÀ pour « structure précise / recherche générale »

- `dossier.metierCible` **et** `dossier.secteurCible` existent dans le modèle (`js/app.js`
  ~L248-264), **mutuellement exclusifs** (jamais renseignés en même temps). `secteurCible`
  accepte un secteur, « Intérim », ou du texte libre.
- Une question **« Avez-vous une structure précise en tête ? »** existe déjà (~L4951-4989,
  `data-type-recherche`, `dossier.typeRecherche = 'offre' | ...`), mais **dans le contexte de
  la page Révélation** (pastille bleue métier visé), **pas** dans le parcours « candidater
  depuis la recherche de l'accueil » (qui, lui, demande seulement « entreprise connue Oui/Non »).
- **Conséquence** : le concept est là, le vocabulaire aussi (« structure précise » plutôt que
  « offre précise »), mais il n'est pas branché sur le flux visé par ce chantier. Une partie du
  travail est de **réconcilier** ces deux endroits, pas d'inventer un 3e mécanisme.

---

## 3. Périmètre du chantier (à affiner avec Denis à l'ouverture)

### 3.1 Revue visuelle + écrans + accessibilité du parcours « candidater depuis la recherche »

- Remplacer les panneaux `ouvrirPanneauGuide` empilés (choix parcours -> entreprise ->
  formulaire) par le **langage visuel commun** (`docs/LANGAGE_VISUEL_COMMUN.md`) : page(s)
  dépliante(s), boutons rectangulaires, encarts à filet, ton rassurant, jetons clair + sombre.
- **Accessibilité** : câbler ce parcours dans le futur socle du chantier Accessibilité
  (navigation clavier, `aria-live` sur les changements de panneau, focus géré). Si le chantier
  Accessibilité n'est pas encore fait, au minimum ne pas aggraver la dette.
- **Coordination B1** (refonte des 3 cartes « Créer un CV ») : le parcours « je pars d'un
  métier connu » et le parcours « je pars d'une des 3 cartes » doivent **converger** vers le
  même squelette d'écrans (préparer / cibler / lancer). Ne pas concevoir ce chantier isolément.

### 3.2 Secteurs de métier

- **Normaliser la liste des secteurs** : passer des ~34 chaînes libres à une liste raisonnée
  (probablement 10 à 15), regrouper les doublons, décider du rattachement de chaque fiche.
  Champ `secteur` de `baseMetiers` à fiabiliser (valeur contrôlée, pas texte libre).
- **Fiche de secteur** : pour chaque secteur, une courte **explication** (« qu'est-ce que
  c'est, ce qu'on y fait, exemples de structures »), au conditionnel, jamais un jugement sur
  la personne. Où la stocker : à côté de `baseMetiers` (`data/metiers.js`) ou dans un fichier
  dédié — à trancher.
- **Métiers phares par secteur** : une liste ordonnée des métiers « les plus importants /
  fréquents / connus » du secteur (Denis). Source : à définir (ordre manuel tenu par Denis ?
  indicateur sur la fiche métier ?). **Ne jamais laisser entendre qu'un métier est « meilleur »**
  qu'un autre — « fréquent / connu », pas « recommandé ».
- **Le secteur comme résultat de recherche** : ajouter un type `[data-secteur-nom]` (ou
  équivalent) dans `rendreResultatsRechercheERIP()`, avec son propre rendu (nom + courte
  explication + « voir les métiers » / « candidater pour ce secteur »).
- **Candidater depuis un secteur** : un parcours CV / lettre / entretien qui part de
  `dossier.secteurCible` au lieu de `dossier.metierCible`. Vérifier que les prompts
  (`cv.md`, `lettre-v1.md`, `entretien.md`) se comportent correctement avec un **secteur**
  et non un intitulé de poste précis (le profil transmis doit dire « secteur visé : X, pas de
  métier précis » — `cv.md` a déjà une logique « mode général / spécifique »). Sans doute une
  passe de prompt à prévoir.

### 3.3 Question « structure précise / recherche générale »

- **Où la poser** : dans le parcours revu (3.1), à la place ou en complément de « entreprise
  connue Oui/Non ». Réconcilier avec la question existante de la page Révélation
  (`data-type-recherche`) — **une seule formulation, un seul champ** (`dossier.typeRecherche`),
  jamais deux.
- Cas « structure précise » -> formulaire entreprise (déjà existant,
  `ouvrirFormulaireCoordonneesEntreprise`). Cas « recherche générale » -> pas de formulaire,
  le CV/lettre restent génériques pour le métier ou le secteur.
- Denis : le détail « verra par la suite ». Ne pas figer maintenant.

---

## 4. Points de vigilance

- **Ne jamais hiérarchiser les métiers ni les secteurs** (même règle que les modules) :
  « fréquent / connu », factuel, jamais « recommandé pour vous ».
- **Zéro régression fonctionnelle** sur le parcours actuel (clic métier -> CV/lettre/entretien
  fonctionne aujourd'hui) : inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ avant de toucher au code.
- **Une seule source de vérité** : `dossier.metierCible` / `dossier.secteurCible` /
  `dossier.typeRecherche` existent déjà — les réutiliser, ne pas ajouter de champ parallèle.
- **Prompts** : toute adaptation de `cv.md` / `lettre-v1.md` / `entretien.md` pour le cas
  « secteur » ou « recherche générale » = passe de prompt dédiée, minimale, revalidée par
  Denis sur de vrais cas (voir mémoire `project_chantier_revue_prompts_a_la_main`).
- **Recherche universelle depuis l'accueil** (`docs/TACHES_VALIDEES.md`, `[À FAIRE]`) : ce
  chantier ajoute un type de résultat (« secteur ») à la même barre — à traiter dans la même
  logique, pas deux moteurs.
- **Coordination B1** : réévaluer l'ordre — ce chantier peut avoir besoin que le squelette des
  3 cartes « Créer un CV » soit posé d'abord (ou l'inverse). À trancher avec Denis à
  l'ouverture.

---

## 5. Ordre / dépendances

- **Indépendant**, mais **après** ou **conjointement** avec la refonte des 3 cartes « Créer un
  CV » (B1). Pas avant.
- Bénéficie du chantier **Accessibilité** (socle) et du chantier **barre d'étapes /
  langage visuel commun** s'ils sont faits d'abord.
- Pas urgent. Marqué pour ne pas être oublié.
