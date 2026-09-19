# Enquête : page « Vos documents » (`pageResultats`, ex-« Créer mon CV » / « Mes documents »)

> Chantier « Refonte de la carte Mes documents », dernier écran du parcours guidé.
> État des lieux **avant maquette**. Aucun code écrit.
> Point d'entrée du chantier : `docs/PLAN_CONSOLIDE_REFONTE_PARCOURS_GUIDE_2026-09-02.md`.

---

## 1. Résumé pour Denis (à lire en premier)

La page `pageResultats()` (`js/app.js` ~11891, **~870 lignes**) fait aujourd'hui
**quatre métiers à la fois** :

1. **Choisir le document** (CV / lettre / entretien) — masqué dans le parcours
   `nouveau` tant que le CV n'est pas fini.
2. **Préparer l'envoi à l'assistant** : réglages de style, récap de la
   candidature, coordonnées, **ajout des expériences professionnelles**, choix
   de l'assistant, collage de la réponse.
3. **Mettre en forme le CV** : modèles, couleurs, aperçu A4/A5 (« Aperçu et
   finalisation » = le Composeur).
4. **Exporter** : PDF / Word / JSON / copier + « Et après ? ».

C'est trois écrans logiques empilés en accordéons sur une seule route. **Le
constat de Denis est juste :**

- **Deux titres qui ne concordent pas** : barre d'étapes « Mes documents »,
  `<h1>` « Créer mon CV » (ou « Passons à l'action » hors parcours guidé).
- **Une étape fantôme dans la barre** : « Assistant » (index 4 de
  `CREER_CV_NAV_ETAPES`) ne correspond à **aucune page**. `_creerCvNavIndex`
  ne renvoie jamais 4 : `resultats` saute directement à l'index 5. La personne
  voit un jalon « Assistant » qu'elle n'atteint jamais explicitement.
- **L'aperçu du CV est écrasé** : le Composeur vit dans un accordéon, lui-même
  sous une barre d'étapes, elle-même sous la barre du module. À l'écran il
  reste ~300 px de large pour visualiser un CV. Inutilisable.
- **Des saisies mal placées** : les **coordonnées** (doublon de « Vos
  informations ») et surtout **les expériences professionnelles**, qui n'ont
  aujourd'hui **aucun autre endroit où être saisies** dans le parcours guidé.

---

## 2. Où vit la page

- `pageResultats()` — route `resultats`. `_creerCvNavIndex('resultats') = 5`
  (dernier repère de `CREER_CV_NAV_ETAPES`).
- Barre du haut : `afficherProgression('resultats')` → barre compacte du module
  (`CREER_CV_NAV_ETAPES` pour `nouveau`, `MAJ_CV_NAV_ETAPES` / `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES`
  pour `maj` / `pret`). **Sauf Découverte** : `barreEtapesModule(DECOUVERTE_NAV_ETAPES, …)`.
- Barre du bas : `barreNavigation(cibleRetourResultats, null, null, { terminerParcours, onclickPrecedent })`.
  Pas de bouton « Continuer » global : chaque accordéon a le sien.
- Se re-rend elle-même à chaque interaction (choix de document, ouverture
  d'accordéon…), toujours sur la même route.

---

## 3. Structure réelle : ce qui est empilé

### 3.1 En-tête

| Élément | Détail | Sort dans le parcours `nouveau` ? |
|---|---|---|
| `<h1>` | « Créer mon CV » si `depuisDecouverte \|\| masquerFauxChoixCv`, sinon « Passons à l'action » | oui, « Créer mon CV » |
| Sous-titre | « Choisissez votre document, personnalisez-le… » | affiché seulement si `modeCreation === 'nouveau' && !masquerFauxChoixCv` (donc **pas** tant que le CV n'est pas fini) |
| `selecteurDocument` (`.cv-section` « Choisissez votre action » : 3 cartes CV / Lettre / Entretien avec verrous) | `masquerFauxChoixCv = creationCvGuidee && !dossier.cvTermine` → **masqué** tant que le CV n'est pas terminé ; réapparaît ensuite | masqué au début, réapparaît quand `cvTermine` |

### 3.2 Sous-barre d'étapes interne (`ligneEtapesAction`)

6 pastilles : `adaptation-metier` › `infos-ia` › `choix-ia` (« Assistant ») ›
`import-ia` (« Importer ») › `apercu-document` (« Aperçu ») › `exporter-document`
(« Exporter »). **Masquée** pour `nouveau` (`creationCvGuidee`) et pour
Découverte (décision Denis 2026-08-31 : « une seule barre »). Donc dans le
parcours guidé, ces 6 étapes n'ont **aucun repère visible**.

### 3.3 Les 6 accordéons (`panneauEtapeAction`, un seul ouvert à la fois)

| id | Titre affiché | Contenu | Fonctions clés |
|---|---|---|---|
| `adaptation-metier` | « Adaptation au métier » / (nouveau) `<details>` **« Régler le style du texte du CV »** `facultatif` | 5 groupes de jetons : niveau de poste, niveau de langage, adaptation vocabulaire, ton, longueur. Écrit `dossier.preferencesIAParType[docActif]`. Bouton « Reprendre les choix » (`boutonReprendrePreferencesHTML`). | `groupePreference`, `pastillesSelection`, `construireConsignesPreferences` (plus bas) |
| `infos-ia` | **« Informations transmises à l'assistant »** | `boiteCoordonnees` (si `identiteEntierementVide()`) + `contenuIdentite()` / `wireIdentite` ; **« Résumé de votre candidature »** (Civilité / Type de CV / Objectif / Métier ou secteur visé) ; **`sectionExperiences`** (« Expérience professionnelle » + `construireCarteExperience` + bouton **« Ajoutez vos expériences »** → `ouvrirFenetreExperiences()`) ; bandeau « version personnalisée » si `dossier.profilTexteManuel` ; bouton **« Vérifier les informations »** (`btnVerifierInfosIA`) ; bouton **« Continuer »** (`btnContinuerInfosIA`). | `texteProfil()`, `texteProfilEffectif()`, `identiteEntierementVide()`, `ouvrirFenetreExperiences()`, `construireCarteExperience()` |
| `choix-ia` | **« Choisissez votre assistant »** | 2 groupes de pastilles (`lignePastillesAssistantsIA` : sans compte / avec connexion) + « Ce qui va se passer » (`ETAPES_DETAIL_CHOIX_IA`) + phrase confidentialité + déclencheur vidéo. Clic → `ouvrirFenetreAssistantIA()` (fenêtre externe + décompte). | `ASSISTANTS_IA`, `ASSISTANTS_SANS_COMPTE_IA`, `ouvrirFenetreAssistantIA`, `htmlBanniereTransitionIA` |
| `import-ia` | **« Importer les informations »** | Bandeau « vous revenez de [assistant] » + `htmlBanniereTransitionIA()` + `htmlCollageInstantane('ActionIA', …)` + bouton « Importer dans le CV/la lettre/la préparation » + « Effacer et recoller ». Parse via `analyserReponseIACV/Lettre/Entretien`. | `htmlCollageInstantane`, `analyserReponseIA*`, `genererResumeImportCV` |
| `apercu-document` | **« Aperçu et finalisation »** | `construireContenuApercuFinalisation(docActif)` : sélecteur de modèles (miniatures SVG), palette de couleurs + nuances, aperçu inline A4/A5 (`etatApercuInline`), bascule format. **= le Composeur.** ~lignes 11413-11890. | `genererCartesSelecteurModeles`, `genererMiniatureSVG`, `etatApercuInline`, `construireCarrouselModeles` |
| `exporter-document` | **« Exporter »** | `construireContenuExportDocument(docActif)` (PDF / DOCX / JSON / copier) dans un conteneur `max-width:520px` + `suggestionSuivante` (nouveau : section **« Et maintenant ? »** boutons « Préparer ma lettre » / « Préparer mon entretien » ; sinon encart « Lettre de motivation »). | `construireContenuExportDocument`, `marquerDocumentEnregistre`, `btnSuggererLettre` / `btnSuggererEntretien` |

Après « Exporter » atteint : `boutonRessourcesFin` (« Et après ? » →
`ouvrirFenetreRessourcesExplorer()`).

### 3.4 Machine d'état des accordéons

- `etatAccordeon` / `etatAccordeonValide` (variables **globales**, posées par
  `accordeonPourType(docActif)` / `accordeonValidePourType(docActif)`).
- `ordreEtapesAction = ['adaptation-metier','infos-ia','choix-ia','import-ia','apercu-document','exporter-document']`.
- `etapeAtteinte(id)` = `etatAccordeon[id] !== undefined`. Une étape n'apparaît
  qu'une fois atteinte. Un seul accordéon `true` à la fois (normalisé au rendu).
- Garde-fou `nouveau` : au 1er affichage, `adaptation-metier` est marquée
  faite + validée et `infos-ia` ouverte (les réglages de style restent `null`,
  l'assistant s'adapte seul).
- `avancerEtape()` (plus bas) fait progresser linéairement.

---

## 4. Le nœud du problème : le modèle de navigation

### 4.1 « Assistant » est un jalon sans page

`CREER_CV_NAV_ETAPES` (`data/metiers.js` ~3383) :

| index | label | route correspondante |
|---|---|---|
| 0 | Objectif | `objectif` |
| 1 | Votre parcours | `votre-parcours` |
| 2 | Mon projet | `projet` |
| 3 | Faire le point | `revelation` |
| **4** | **Assistant** | **aucune** (`_creerCvNavIndex` ne renvoie jamais 4) |
| 5 | Mes documents | `resultats` |

L'« Assistant » de la barre essaie de représenter, comme une étape de premier
niveau, ce qui est en réalité **deux accordéons internes de `resultats`**
(`choix-ia` + `import-ia`) et une **cascade de fenêtres** (`ouvrirFenetreAssistantIA`).
D'où la sensation de décalage : le jalon existe, la page n'existe pas.

### 4.2 Trois façons de recoller ça

| Option | En quoi ça consiste | Bénéfice | Risque |
|---|---|---|---|
| **A. « Assistant » disparaît de la barre** | 5 repères : Votre objectif · Votre parcours · Vos informations · Votre profil · **Vos documents**. Tout ce qui touche à l'assistant redevient une **phase interne** de « Vos documents ». | Le plus simple ; la barre ne ment plus ; aucun découpage de `pageResultats`. | « Vos documents » reste une page qui fait tout (préparer l'envoi + mettre en forme + exporter) ; l'aperçu reste à l'étroit. Ne règle pas le problème visuel de fond soulevé par Denis. |
| **B. « Assistant » devient une vraie page** *(proposition de Denis)* | On coupe `pageResultats` en **deux routes** : `assistant` (réglages de style + récap candidature + choix de l'assistant + collage de la réponse) et `resultats` = **« Vos documents »** (uniquement aperçu / Composeur / export). Chaque page pleine largeur. | La barre devient honnête (6 repères, 6 pages). L'aperçu du CV récupère toute la largeur. Chaque page a **un seul métier**, lisible. Aligné sur la logique des autres écrans refondus. | Découpage d'une fonction de ~870 lignes ; `etatAccordeon` / `avancerEtape` / `_pageOrigineAvantResultats` / `depuisDecouverte` / les 3 variantes à re-câbler sur 2 routes. Chantier plus lourd. |
| **C. Statu quo** | On garde tout sur une route, jalon fantôme compris. | Rien à faire. | C'est exactement ce que Denis veut corriger. Écarté. |

**Recommandation : option B**, mais **par étapes** et sans réécrire la
machinerie :

- Nouvelle route `assistant` → nouvelle fonction `pageAssistant()` qui **appelle
  les mêmes briques** (`accordeonAdaptation` allégé en « Régler le style »,
  `accordeonInfosIA` sans les blocs déplacés, `accordeonChoixIA`,
  `accordeonImportIA`). `pageResultats` ne garde que `apercu-document` +
  `exporter-document` + le sélecteur CV/Lettre/Entretien.
- `etatAccordeon` reste la source de vérité commune ; `avancerEtape` fait
  simplement `naviguerVers('resultats')` quand on passe de `import-ia` à
  `apercu-document`.
- `_creerCvNavIndex` : `assistant` → 4, `resultats` → 5.
- Découverte : garde son unique barre `DECOUVERTE_NAV_ETAPES` ; les deux pages
  restent paramétrées par `depuisDecouverte`, jamais forkées.
- **À trancher avec Denis** : « Régler le style du CV » va sur la page
  `assistant` (recommandé : c'est un réglage *de l'assistant*, pas du document
  fini) ou reste avec l'aperçu sur « Vos documents » ?

### 4.3 Barre secondaire ?

Denis demande si on peut ajouter **une sous-barre** dédiée à l'édition du CV.
Avec l'option B, « Vos documents » n'a plus que 2 phases (Aperçu, Exporter) :
une sous-barre à 2 items est superflue. Un simple titre + un bouton « Exporter »
en bas suffit. Si le Composeur est un jour refondu en profondeur (chantier
séparé), il pourra avoir sa propre navigation interne à ce moment-là.

---

## 5. Redistribution des contenus mal placés

### 5.1 Coordonnées (`boiteCoordonnees` + `contenuIdentite()`)

- Aujourd'hui : encart jaune **uniquement si `identiteEntierementVide()`**, avec
  le formulaire d'identité complet + message « renseignez-les ici ».
- Après la refonte : **« Vos informations » est la source unique** (étape
  obligatoire des 3 parcours, bloc « Vous » → Identité).
- **Cible** : plus de formulaire ici. Si l'identité est vide à l'arrivée →
  bandeau court « Il manque vos coordonnées. Retournez à l'étape *Vos
  informations* pour les ajouter » + bouton qui y renvoie. Sinon : rien, ou un
  micro-rappel en lecture seule (« Coordonnées : Marie Durand · Limoges »).
- **Denis penche pour retirer complètement** (« la personne peut déjà
  anonymiser ; si elle ne l'a pas fait, c'est qu'elle est en confiance »).
  → Recommandation : garder **seulement** le bandeau de renvoi quand c'est
  vide (filet de sécurité, pas un formulaire), rien sinon.

### 5.2 Expériences professionnelles (`sectionExperiences` + `ouvrirFenetreExperiences`)

- **Constat majeur : `dossier.experiences` (le parcours professionnel qui va
  sur le CV) n'a aujourd'hui AUCUN écran de saisie dédié dans le parcours
  guidé.** Les 2 seules voies : ce bouton « Ajoutez vos expériences » sur la
  toute dernière page, ou la fusion d'un CV importé.
- C'est de la donnée **factuelle**, exactement comme les formations. Sa place
  logique = **« Vos informations »**, à côté du bloc « Vos formations et
  diplômes ».
- **Cible** : un bloc **« Vos expériences professionnelles »** sur « Vos
  informations » (réutilise `ouvrirFenetreExperiences` / `construireCarteExperience`
  / `dossier.experiences` **tels quels**). Une fois là-bas, `sectionExperiences`
  **disparaît** de « Vos documents » / « Assistant ».
- **Conséquence en cascade** (Denis) : si les expériences quittent cet accordéon,
  « Informations transmises à l'assistant » se vide beaucoup. Voir §5.3.
- **Impact maquettes déjà validées** : cela **ajoute un bloc** à « Vos
  informations » (maquette v9). Ce n'est pas une régression (fonction
  déplacée, pas perdue) mais il faut **mettre à jour la maquette « Vos
  informations »** avec ce bloc avant de coder. À acter avec Denis.

### 5.3 « Informations transmises à l'assistant » : garde-t-on l'accordéon ?

Une fois coordonnées + expériences partis, il ne reste que :
- le **« Résumé de votre candidature »** (Civilité / Type de CV / Objectif /
  Métier), qui **recoupe « Votre profil en bref »** de l'écran précédent ;
- le bouton **« Vérifier les informations »** (ouvre le texte exact envoyé à
  l'assistant, `texteProfil()`, modifiable → `dossier.profilTexteManuel`) ;
- le bandeau « version personnalisée ».

**Ce qui compte vraiment ici = « Vérifier les informations »** : c'est le seul
endroit où la personne voit et peut corriger le **texte exact** qui partira à
l'assistant. À **garder** (fonction de contrôle réelle, pas une re-saisie).

**Cible** : sur la page `assistant`, un bloc court **« Ce qui sera transmis »** =
1 phrase de rappel (métier visé + objectif, repris de « Votre profil en bref »,
en lecture seule) + le bouton **« Relire le texte exact avant l'envoi »**. On
retire le pavé « Résumé de votre candidature » à 4 lignes qui ressemble à un
formulaire.

### 5.4 « Régler le style du texte du CV » (`adaptation-metier`)

- Aujourd'hui dans `nouveau` : `<details>` replié « facultatif », marqué fait
  d'office, valeurs `null` → l'assistant s'adapte seul.
- **Cible recommandée** : le garder **replié et facultatif sur la page
  `assistant`**, juste avant le choix de l'assistant (c'est un réglage *de la
  demande faite à l'assistant*). Ne pas le mettre sur « Vos documents » (qui
  devient la mise en forme du document déjà rédigé).

---

## 6. Les 3 variantes + Découverte (à conserver à l'identique)

| Contexte | Différences actuelles sur `pageResultats` |
|---|---|
| `nouveau` (`creationCvGuidee`) | `<h1>` « Créer mon CV » ; sélecteur CV/Lettre/Entretien masqué tant que `!cvTermine` ; sous-barre interne masquée ; « Régler le style » en `<details>` facultatif marqué fait ; section « Et maintenant ? » (lettre + entretien) à l'export ; entretien débloqué dès `cvTermine` (pas besoin de la lettre). |
| `maj` (`modeCreation === 'maj'`) | `cvComplet = true` ; barre `MAJ_CV_NAV_ETAPES` (« Corriger mon CV » à l'index 3) ; sous-barre interne **visible** ; « Adaptation au métier » = accordéon plein (pas `<details>`). |
| `pret` (`modeCreation === 'pret'`) | `cvComplet = false` → **`sectionExperiences` non affichée** ; carte CV du sélecteur **désactivée** (`desactiveCV`) ; lettre disponible d'emblée ; barre `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES`. |
| Découverte (`depuisDecouverte` = `window._decouverteVersResultats \|\| dossier.decouverteTerminee`) | `docActif` forcé à `'cv'` ; barre `DECOUVERTE_NAV_ETAPES` (repère « Mon CV » puis tout vert) ; sélecteur masqué ; sous-barre masquée ; `<h1>` « Créer mon CV » ; « Retour » → `reafficherDecouverteCompetences()` (jamais `revelation`). |

**Règle** : quelle que soit la refonte, ces 4 comportements restent vrais.
Le découpage en 2 pages (option B) doit reproduire chacun sur les 2 routes.

---

## 7. Fonctions / comportements à préserver (liste de contrôle avant code)

- `etatAccordeon` / `etatAccordeonValide` / `accordeonPourType` /
  `accordeonValidePourType` / `avancerEtape` : moteur d'étapes. Rester dessus.
- `docActifActuel()` / `accordeonPourType(docActif)` : le document actif pilote
  toute la page (CV / lettre / entretien).
- `texteProfil()` / `texteProfilEffectif()` / `dossier.profilTexteManuel` /
  `btnRevenirTexteAutoIA` : instantané figé du texte transmis + retour au texte
  auto. Bandeau d'alerte associé.
- `ouvrirFenetreAssistantIA()` + `_etatTransitionIA` + `htmlBanniereTransitionIA()` :
  cascade écran tampon / décompte / fenêtre bloquée / « ouvrir maintenant ».
  **`ouvrirAssistantDepotCV` jamais modifié.**
- `htmlCollageInstantane('ActionIA', …)` + `analyserReponseIACV/Lettre/Entretien`
  + `genererResumeImportCV` / `genererResumeGeneriqueImportIA` : import de la
  réponse. Gérer le cas `echec_parsing` sans cul-de-sac (bug déjà corrigé
  ailleurs, mémoire `project_bug_import_reponse_echec_parsing`).
- `construireContenuApercuFinalisation(docActif)` (le Composeur) +
  `etatApercuInline` + `genererCartesSelecteurModeles` + `genererMiniatureSVG` +
  `construireCarrouselModeles` : **réemployés tels quels**, jamais réécrits
  dans ce chantier. Refonte de fond du Composeur = chantier séparé (avec
  vérification exports PDF + Word).
- `construireContenuExportDocument(docActif)` + `marquerDocumentEnregistre` +
  `dossier.documentsEnregistres` : export PDF / DOCX / JSON / copier + passage
  des cartes à l'état « Prêt ».
- `selecteurDocument` / `carteDocument` : verrous CV↔lettre↔entretien
  (`desactiveCV` / `desactiveLettre` / `desactiveEntretien`), badge
  « Sélectionné », badge « Prêt », bulle de message au survol d'une carte
  verrouillée.
- `suggestionSuivante` / section « Et maintenant ? » / `btnSuggererLettre` /
  `btnSuggererEntretien` : navigation croisée entre documents.
- `boutonRessourcesFin` → `ouvrirFenetreRessourcesExplorer()` : « Et après ? »,
  affiché seulement une fois « Exporter » atteint.
- `cibleRetourResultats` : repli du « Retour » = `_pageOrigineAvantResultats`
  ou `revelation` ; `window._pageAvantImportSession` pour l'import de session ;
  `null` + `reafficherDecouverteCompetences()` pour Découverte.
- `barreNavigation(..., { terminerParcours, onclickPrecedent })` :
  « Merci bien, j'ai fini » quand `documentsEnregistres[docActif]` **et**
  `etatAccordeon['exporter-document'] === true`.
- `dossier.experiences` : structure `[{poste/intitule, entreprise, lieu,
  dateDebut, dateFin, missions, ...}]` — inchangée, seulement déplacée d'écran.
  `construireCarteExperience(e, i, contexte)` a un 3e paramètre (`'page'`).
- `dossier.preferencesIAParType[docActif]` + `construireConsignesPreferences` +
  `boutonReprendrePreferencesHTML` : réglages de style par document, valeurs
  `null` = aucune consigne envoyée.
- `brancherEvenementsResultats()` : câblage de **tous** les boutons de la page,
  rappelé à chaque re-rendu. À scinder proprement si on fait 2 pages.
- Umami : événements liés à `pageResultats` (à repérer et conserver).
- `js/app.js` non couvert par les tests Node → **test navigateur obligatoire**
  sur `nouveau` / `maj` / `pret` **et** Découverte, bout en bout.

---

## 8. Ce que la maquette devra montrer

1. **La nouvelle barre d'étapes** du parcours `nouveau`, en entier, avec ses
   libellés définitifs, pour lever le décalage que Denis n'arrive pas à situer.
   Deux hypothèses à trancher dans la maquette :
   - **5 repères** (option A) : Votre objectif · Votre parcours · Vos
     informations · Votre profil · Vos documents.
   - **6 repères** (option B, recommandée) : … · Votre profil · **Assistant** ·
     Vos documents, « Assistant » devenant une vraie page.
2. **Page `assistant`** (si option B) : « Régler le style » (replié,
   facultatif) → « Ce qui sera transmis » (1 phrase + « Relire le texte
   exact ») → « Choisissez votre assistant » → « Coller la réponse ». Pleine
   largeur.
3. **Page « Vos documents »** : titre unique, sélecteur CV / Lettre / Entretien
   (quand pertinent), **Aperçu pleine largeur**, Exporter, « Et après ? ».
   Plus de coordonnées, plus d'expériences, plus de pavé « Résumé de votre
   candidature ».
4. **Bloc « Vos expériences professionnelles »** ajouté à la maquette **« Vos
   informations »** (v10), à côté des formations.
5. Variantes `maj` / `pret` / Découverte esquissées.

---

## 9. Décisions Denis nécessaires avant la maquette

1. **Modèle de navigation** : option A (5 repères, « Assistant » = phase
   interne) ou **option B** (6 repères, « Assistant » = page dédiée pleine
   largeur) ? *(Recommandation : B — c'est ce que Denis décrit, et ça règle le
   problème d'aperçu écrasé.)*
2. **« Régler le style du CV »** : sur la page `assistant` (recommandé) ou avec
   l'aperçu sur « Vos documents » ?
3. **Coordonnées** : bandeau de renvoi seulement quand l'identité est vide
   (recommandé), ou retrait total ?
4. **Expériences professionnelles** : on confirme le déplacement vers « Vos
   informations » (nouveau bloc, maquette v10) ?
5. **« Résumé de votre candidature »** : on le remplace par 1 phrase de rappel +
   « Relire le texte exact » (recommandé), ou on garde le récap à 4 lignes ?
6. **Profondeur** : Composeur / Aperçu / export **réemployés tels quels** dans
   la nouvelle structure, refonte de fond = chantier séparé — on confirme ?

---

## 10. Décisions Denis (2026-09-02) — tranché

1. **Navigation** : option B. « Assistant » = page dédiée pleine largeur, 6 repères.
2. **Réglez le style** : sur la page « Assistant » (1er rectangle dépliable),
   jamais « facultatif », 5 réglages avec valeur par défaut (ouvrier qualifié /
   professionnel / adapté au métier / équilibré / équilibrée), bouton
   « Ces réglages me conviennent » qui referme et ouvre le suivant.
3. **Coordonnées** sur « Vos documents » : bandeau de renvoi seulement si
   l'identité est vide, sinon rien.
4. **Expériences professionnelles** : déplacées vers « Vos informations »
   (maquette v10, bloc « Vos expériences professionnelles »).
5. **« Ce qui sera transmis »** : plus un bloc — devenu un **bouton discret**
   « Voir ou modifier le texte transmis à l'assistant » sous le choix de
   l'assistant.
6. **Composeur / panneaux PDF-Word / moteur de rendu** : réemployés tels quels ;
   leur refonte en 3 niveaux (rapide / ajuster / détails) reste le chantier
   séparé déjà audité (`docs/AUDIT_PANNEAUX_PERSONNALISATION_CV_2026-09-01.html`).
7. **Écran de relecture des propositions de l'assistant** (l'« écran à onglets » :
   intitulé, accroche ×5, expériences à mettre en avant, compétences à valoriser,
   savoir-faire par expérience, rubriques à masquer, certifications, formation
   retenue, regroupement, loisir) → **sur la page « Assistant »**, en 4e
   rectangle dépliable **« Vérifier ce que l'assistant propose »**, ouvert
   automatiquement après l'import, « Je valide » puis « Continuer vers Vos
   documents ». Réouvrable. Code : `dossier.ia.cv` / `dossier.ia.cv.recommandations`,
   `analyserReponseIACV`, l'écran à onglets existant (`ouvrirEcranChoixReponseIACV`
   et sa famille `contenuListeRecommandationsIA` / `ligneRecommandationReordonnable`
   / `_rendreBlocRecoAvecMissions`), le « pool complet » persistant pour que
   décocher reste réversible. **Réemployé tel quel**, juste re-logé dans un
   rectangle de la page « Assistant » au lieu d'un écran séparé.
7bis. **Écran de relecture = les 9 onglets réels, DANS la page** (jamais une
   fenêtre à part). `GROUPES_ONGLETS_CHOIX_IA_CV` : Profil (points forts, mots
   clés) · Intitulé (radio + texte éditable) · Accroche (radio + texte) ·
   Expériences (5 max, cases + missions cochables + flèches d'ordre) ·
   Compétences à valoriser (cases) · Compétences personnelles (cases, 5 max) ·
   Stratégie de candidature (type de CV spécifique/général + intitulés de poste
   à rechercher) · Rubriques à masquer (cases) · Formation, expérience perso &
   loisir (chacune avec ses missions). Titre du rectangle : **« Choisir ce qui
   ira sur le CV »**. Icône : onglets (📑), jamais de visage.

8. **« Vos documents » = le format d'abord** (option B). **Toute la page est
   accessible dès l'arrivée** : plus aucun verrou « valider chaque rectangle » /
   « télécharger un CV avant de continuer » (l'ancienne condition n'a plus de
   sens — arriver ici = le CV est prêt). Parcours naturel seulement : on arrive
   sur *Le format*, le choix ouvre *La mise en page*, puis *Exporter*. Ordre :
   1. **Le format** : « Votre CV sera un fichier Word ou un PDF ? » + 1 phrase
      honnête sur la différence (Word se retouche ; PDF plus travaillé mais figé).
      Une fois choisi : rectangle replié « Format : PDF — Changer ».
   2. **La mise en page** : les réglages **propres au format choisi** (le panneau
      existant — PDF `cvPdfPanneauReglages.js` OU Word « Projet XXL ») + l'aperçu
      pleine largeur. Aucune option grisée « disponible en PDF » : on ne montre
      que ce que le format sait faire. **Cette partie fera l'objet d'une maquette
      dédiée** (67 réglages, gros travail — réorganisation en 3 niveaux rapide /
      ajuster / détails, cf. audit).
   3. **Exporter** : le **format déjà choisi** (un seul bouton de téléchargement,
      pas de double Word/PDF) + « Copier le texte » + **Canva** + **ODT**. Plus
      un bouton « Faire aussi une version [l'autre format] » qui rouvre les
      réglages de l'autre format (report de ce qui est transposable, cf. le
      mécanisme `boutonReprendrePreferencesHTML`).
   4. **« Et après ? » : GARDÉ**, en bas de page, toujours visible (arriver ici =
      le CV est prêt). On conserve **« Préparer ma lettre de motivation »** et
      **« Préparer mon entretien »** (`btnSuggererLettre` / `btnSuggererEntretien`).
      On retire uniquement **`boutonRessourcesFin` → `ouvrirFenetreRessourcesExplorer`**
      (« ateliers / formations / immersions / autres métiers ») : déjà couvert
      ailleurs. À porter à l'inventaire comme retrait ciblé d'un seul bouton.
   Le code peut converger vers **un seul modèle de réglages** rendu
   conditionnellement selon le format (pas un export vers deux cibles à partir de
   réglages identiques).
9. **Formats d'export cible** : PDF, Word, Copier le texte, **Canva**, **ODT**.
10. **Maquette de « La mise en page »** : **une seule** maquette pour les deux
    formats (option A, validée 2026-09-02) — `docs/MAQUETTE_MISE_EN_PAGE_2026-09-02.html`.
    Structure identique PDF / Word, seule la liste des réglages change (variante
    dans le panneau de démo). 3 niveaux : **Réglages rapides** toujours visibles
    (modèle, couleur, police, format, densité + « mon style ») ; **Ajuster** =
    6 sections par intention (La page / Les couleurs / Le haut de la page /
    Le texte / Ce qui s'affiche / Reprendre la main), dépliables ; **Détails** =
    micro-réglages repliés dans chaque section. Interrupteur « Je débute / Je
    veux tout régler ». Corrections de l'audit intégrées : français simple,
    une ligne « à quoi ça sert » par section, réglages indisponibles en Word
    montrés + expliqués (jamais masqués en silence), Annuler / Refaire réels,
    avertissement impression noir et blanc, sortie de la colonne sombre.
    Ajouts standard : interligne, marges, alignement, « 1 ou 2 pages »,
    ordre des rubriques, rubriques à afficher (cases), style des puces,
    photo (forme), veuves/orphelines. Réglages représentatifs, pas les 67.
