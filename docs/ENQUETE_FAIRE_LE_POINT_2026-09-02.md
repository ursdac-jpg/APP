# Enquête : page « Faire le point » (`revelation`)

> Chantier « Refonte de la carte Mes documents ». Écran 4 du parcours guidé, après « Mes informations », avant « Créer mon CV ».
> État des lieux avant maquette. Aucun code écrit.

---

## 1. Où vit la page

- `pageRevelation(conserverTirage)` — `js/app.js` ~8409. Route `revelation`.
- Titre écran : **« Faisons le point »**, sous-titre « Au-delà de votre expérience, voici ce qui fait votre valeur. »
- Barre du bas : `barreNavigation('projet', 'resultats', '🚀 Passer à l'action', { onclickSuivant: 'verifierAvantPasserAction()' })`.
  - Retour → `projet` (deviendra « Mes informations »).
  - Suivant → `verifierAvantPasserAction()` : **bloque si aucun métier / secteur choisi** (`dossier.metierCible || dossier.secteurCible`), sinon va à `resultats`. Si « réponse à une offre » sans entreprise connue, ouvre d'abord la demande de coordonnées entreprise.
- Se re-rend elle-même à chaque interaction (`pageRevelation(true)` passé à tous les `wireXxx`). `conserverTirage` évite de re-tirer les métiers recommandés à chaque re-rendu.

---

## 2. Structure actuelle : 6 zones

Dans l'ordre d'affichage (mode « métier précis », parcours `nouveau`) :

| # | Zone | Nature | Contenu / source |
|---|---|---|---|
| 1 | 💠 **Ce qui fait votre valeur** `[N]` | accordéon replié (`blocAccordeon`) | `construireMessageAime()` : phrases déduites du questionnaire (activités / actions / valeurs). Ex. « Vous aimez : aider, organiser, travailler en équipe ». |
| 2 | 🎯 **Métier cible** | **bloc proéminent, non replié** (`banniereMetierCible()`) | Barre de recherche métier (répertoire + saisie libre), chips du métier choisi, bouton « Changer de mode », et si un métier est choisi : bandeau « Votre candidature est prête » (`banniereJePostuleContenu`). **C'est le cœur actionnable de la page.** |
| 3 | ⭐ **Métiers qui pourraient vous intéresser** `[N métiers]` | accordéon (`CONFIG_BLOC_METIERS`) | `metiersRecommandes()`. Suggestions cliquables → deviennent le métier cible. Sous-section « Pourquoi ces métiers ? » avec boutons « Garder comme Repère ». |
| 4 | 📊 **Analyse de votre profil** `[N compétences]` | accordéon (`CONFIG_BLOC_PROFIL`) | `resumeProfil()` : liste des compétences détectées, cliquables. Toujours affiché (aussi pour CV importé). |
| 5 | 💡 **Ce qui pourrait vous correspondre** `[N points forts]` | accordéon (`CONFIG_BLOC_CORRESPONDANCE`) | `pointsFortsSynthese()` : synthèse dérivée du questionnaire. |
| 6 | 🧭 **Autres pistes** `[N métiers]` | accordéon (`CONFIG_BLOC_PISTES`) | `pistesRecommandees()`. Autres métiers suggérés, cliquables. Sous-section métiers saisonniers / alimentaires si pertinent. |

À la fin : appel à `reperesBrancherBoutonAncre()` (boutons « Garder comme Repère » de la sous-section « Pourquoi ces métiers ? »).

### Les 3 variantes (masquages conditionnels)

| Condition | Effet |
|---|---|
| `dossier.modeCreation !== 'nouveau'` (parcours `maj` / `pret`) | **Masque zones 1 et 5** (dérivées du questionnaire, vides pour un CV importé). Restent : Métier cible + Métiers suggérés + Analyse profil + Autres pistes. |
| `modeRechercheEffectif() === 'domaine'` | **Masque zones 3, 5 et 6** (Métiers recommandés / Correspondance / Pistes) — un clic ne doit jamais remplacer silencieusement un domaine déjà choisi. Zone 2 devient `banniereDomaineCible()` (choix de domaine). Restent : Domaine cible + Analyse profil. |
| `etatAfficherChoixModeRecherche` (bouton « Changer » utilisé) | Zone 2 affiche « Comment souhaitez-vous rechercher un emploi ? » (`contenuModeRecherche()`) au lieu du choix métier/domaine. |

---

## 3. Ce qui alimente / ce qui est alimenté

**Entrées** (lu par la page) :
- `dossier.activites / .actions / .environnement / .valeurs` (questionnaire → zones 1, 5) — désormais renseignés sur « Votre parcours ».
- `dossier.metierCible / .secteurCible / .metiersCandidats / .metiersHorsRepertoire` — le métier / domaine visé.
- `dossier.modeRecherche / .typeRecherche` (métier vs domaine, simple vs offre) — **renseignés sur « Votre objectif » après la refonte**.
- `dossier.objectif` (offre / spontanée / reconversion / stage / alternance / pmsmp).
- `dossier.modeCreation` (nouveau / maj / pret).
- Compétences : `deduireCompetences()`, `resumeProfil()`.
- Métiers : `metiersRecommandes()`, `pistesRecommandees()` (avec cache `invaliderCacheMetiersRecommandes` / `invaliderCachePistes`).

**Sorties** (écrit par la page) :
- `dossier.metierCible` / `dossier.secteurCible` (choix ou confirmation du métier / domaine).
- `dossier.metiersCandidats`, `dossier.metiersHorsRepertoire`.
- `dossier.rechercheCandidature.entreprise` (via la demande de coordonnées au moment de « Passer à l'action »).
- Repères (via `reperesBoutonAncre`).

---

## 4. Le grand changement : le métier cible remonte sur « Votre objectif »

Décision prise avec la maquette « Votre objectif » : **le choix « un métier précis / un domaine » et « quel métier / quel domaine » se fait désormais sur « Votre objectif »**, dans le bloc « Votre candidature » (avec saisie assistée depuis la base + bouton fiche France Travail).

Conséquence directe : **quand la personne arrive sur « Faire le point », le métier cible est déjà choisi.** La zone 2 (le gros bloc « MÉTIER CIBLE » avec sa barre de recherche) n'a plus à être le cœur de la page. Elle devient :
- un **récapitulatif** du métier / domaine visé,
- avec la possibilité de le **changer** (rare, mais nécessaire),
- et le déblocage de « Passer à l'action » est déjà acquis à l'arrivée (plus de blocage `verifierAvantPasserAction` en pratique).

La page « Faire le point » devient donc surtout un écran de **restitution / confirmation** : « voici ce qu'on a compris de vous, voici des pistes, on continue ». Son cœur utile réel = les métiers suggérés + l'analyse de profil + la confirmation du métier visé.

---

## 5. Problèmes identifiés

### Audit (note 11 / 20, cible 15)
- **Gros bloc de texte d'intro** pour une page dont le cœur utile est ailleurs. → Couper à 1-2 phrases.
- **Mettre en avant l'action réelle** : choisir / confirmer le métier cible. (Après la refonte : surtout *confirmer*.)
- **Condenser les accordéons** : 5 accordéons + 1 gros bloc, c'est trop. Beaucoup se recoupent (Métiers recommandés / Autres pistes / Correspondance / Ce qui fait votre valeur = 4 blocs qui parlent tous de « ce qui pourrait vous convenir »).

### Retours Denis déjà connus
- Les compteurs ne doivent **jamais pulser** (déjà appliqué : `compteurStatique`).
- Ton nuancé : « des pistes, pas des certitudes » — les titres ont déjà été adoucis (« Métiers qui **pourraient** vous intéresser », « Ce qui **pourrait** vous correspondre »).
- Audit §3.9 : possibilité d'**ancrer un repère** sur un métier suggéré ou un doute (« est-ce que ce métier me correspond vraiment ? »). Le mécanisme `reperesBoutonAncre` existe déjà, partiellement branché (sous-section « Pourquoi ces métiers ? »).

---

## 6. Code partagé / risques de régression

1. **`blocERIP` / `wireBlocERIP` / `blocAccordeon` / `wireAccordeon`** : système d'accordéons partagé avec « Mon projet », le Bilan, etc. Les `CONFIG_BLOC_*` de cette page (`METIERS`, `PROFIL`, `CORRESPONDANCE`, `PISTES`) lui sont propres, mais le moteur est commun.
2. **`banniereMetierCible()` / `banniereDomaineCible()` / `wireBanniereMetierCible` / `wireRechercheMetierCible` / `wireMetierCibleGlobal` / `wireEvidenceMetierCible`** : tout le sous-système « métier cible ». Il est **aussi utilisé ailleurs** (`banniereJePostuleContenu`, le guide « recherche d'accueil » `ouvrirPanneauEntreprise`). Si on déplace / réduit ce bloc ici, vérifier ces autres appelants.
3. **`verifierAvantPasserAction()`** : gate + demande coordonnées entreprise. Reste nécessaire (le cas « offre sans entreprise » peut toujours arriver).
4. **`modeRechercheEffectif()`** : source de vérité métier vs domaine, lue à plusieurs endroits. Après la refonte, `dossier.modeRecherche` vient de « Votre objectif » — vérifier que `modeRechercheEffectif()` reste cohérent.
5. **`_pageOrigineAvantResultats` / `cibleRetourResultats`** (`pageResultats` ~12679) : le repli du « Retour » depuis « Créer mon CV » vaut `revelation` par défaut. À conserver.
6. **`invaliderCacheMetiersRecommandes` / `invaliderCachePistes`** : caches à ne pas casser (perf + stabilité du tirage).
7. **Parcours Découverte** : `pageRevelation` est aussi atteinte depuis Découverte (`depuisDecouverte` adapte `pageResultats`, pas forcément `pageRevelation` — à vérifier). Les blocs questionnaire (1, 5) sont pertinents pour Découverte.
8. **`js/app.js` non couvert par les tests Node** → test navigateur obligatoire, sur `nouveau` / `maj` / `pret` / `domaine` / Découverte.
9. **Aide contextuelle (`AIDES_CONTEXTUELLES.revelation`)** : 3 entrées (`.accordeon` « Votre profil », `#blocERIP-metiers, #blocERIP-pistes` « Des pistes, pas des certitudes », `.barre-navigation` « Passer à l'action »). À réviser si les sélecteurs / blocs changent — mais **en dernier**, quand la structure ne bouge plus (règle du chantier).

---

## 7. Pistes pour la maquette (à discuter avec Denis)

1. **Intro** : réduire à 1 phrase. Ex. « Voici ce que l'assistant a compris de votre parcours, et des pistes de métiers à regarder. »
2. **Métier cible** : passer du gros bloc de recherche à un **encart récap** : « Métier visé : Vendeur en boulangerie [Modifier] ». Le « Modifier » rouvre le choix (barre de recherche / domaine). Plus de blocage à l'arrivée.
3. **Fusionner les blocs qui se recoupent**. Proposition : 2 accordéons au lieu de 5.
   - **« Des métiers à regarder »** = Métiers recommandés + Autres pistes réunis (une seule liste, cliquable, « Garder comme Repère » par métier).
   - **« Ce que l'assistant a compris de vous »** = Analyse de votre profil + Ce qui fait votre valeur + Ce qui pourrait vous correspondre réunis (compétences + phrases de synthèse).
4. **Repère d'ancrage** visible : « Un doute sur un métier ? Gardez-le comme repère » (helper `reperesBoutonAncre`).
5. Habillage aligné sur « Votre objectif » / « Mes informations » (jetons, accordéons, badges statiques).
6. Variantes à tenir : `maj` / `pret` (pas de blocs questionnaire), `domaine` (pas de métiers suggérés).

À valider : le regroupement 5 → 2 blocs, le passage du métier cible en simple récap, et le contenu exact de l'intro.

---

## 8. Analyse « rien ne se répète » (demande Denis, 2026-09-02)

### 8.1 Ce que « Votre objectif » possède désormais (à NE PAS redemander ici)

| Donnée | Où c'est saisi maintenant |
|---|---|
| Type d'objectif (`dossier.objectif`) | carte d'entrée + cartes « Votre objectif » |
| Métier précis / domaine (`dossier.modeRecherche`) | bloc « Votre candidature » de « Votre objectif » |
| Quel métier (`dossier.metierCible`) / quel domaine (`dossier.secteurCible`) | idem, avec saisie assistée base + bouton fiche France Travail |
| Simple / réponse à une offre (`dossier.typeRecherche`) | idem |
| Lien site entreprise, l'offre (lien ou texte), nom entreprise, intitulé du poste (`dossier.rechercheCandidature.*`) | idem |
| Contrat / temps / « j'accepte » / disponibilité (`dossier.contrat` etc.) | bloc « Le poste que vous recherchez » de « Votre objectif » |
| Disponibilité / dates / durée / heures (stage-alternance-pmsmp) | bloc « Vos disponibilités » de « Votre objectif » |

**Conséquence :** la barre de recherche métier, le toggle métier/domaine, le bloc « Comment souhaitez-vous rechercher un emploi ? », la demande de coordonnées entreprise **ne sont plus des saisies neuves** sur « Faire le point ». Elles y deviennent au mieux un **récapitulatif modifiable**.

### 8.2 Ce qui reste RÉELLEMENT propre à « Faire le point » (et son utilité)

| Élément | Produit par | Utilité réelle | Se répète ailleurs ? |
|---|---|---|---|
| **Récap du métier / domaine visé** | `dossier.metierCible` / `.secteurCible` (déjà choisis) | Rappeler le choix + permettre de le **changer** maintenant qu'on voit les suggestions | Non (c'est un rappel, pas une saisie) |
| **Métiers qui pourraient vous intéresser** | `metiersRecommandes()` (moteur, à partir du questionnaire) | **Sortie du moteur** : faire découvrir des métiers non envisagés, ou conforter le choix. Cliquable → devient le métier visé. Sous-section « Pourquoi ces métiers ? » + « Garder comme Repère ». | Non |
| **Autres pistes** | `pistesRecommandees()` (moteur, exclusion partagée avec le bloc ci-dessus) | Même rôle, 2e liste. Sous-section « Jobs saisonniers et alimentaires » si pertinent. | Non |
| **Analyse de votre profil** | `resumeProfil()` / `deduireCompetences()` | Montrer les **compétences détectées** qui alimenteront le CV. Cliquables (on peut en retirer / réactiver). Rassure, donne prise. | Non (les catalogues Activités/Actions… sont sur « Votre parcours », mais la *synthèse en compétences* n'est calculée qu'ici) |
| **Ce qui fait votre valeur** | `construireMessageAime()` (phrases déduites du questionnaire) | Phrase de restitution valorisante (« Vous aimez : aider, organiser… »). `nouveau` seulement. | Partiellement redondant avec « Ce qui pourrait vous correspondre » |
| **Ce qui pourrait vous correspondre** | `pointsFortsSynthese()` (activités/actions/environnement/valeurs) | Synthèse « dans quel type de travail vous semblez vous épanouir ». `nouveau` seulement. | Partiellement redondant avec « Ce qui fait votre valeur » et « Analyse de profil » |

**Verdict :** aucune de ces 6 choses n'est une re-saisie. 4 sont des **sorties du moteur** (métiers + compétences), 2 sont des **phrases de restitution** qui se recoupent entre elles.

### 8.3 Le vrai rôle de la page après la refonte

Un écran de **pause et de restitution** avant de générer le CV :
1. « Voici ce que l'assistant a compris de vous » (compétences + valeurs).
2. « Voici des métiers à regarder » (suggestions, cliquables).
3. « Votre métier visé, confirmé ou à ajuster ».
Puis : « Passer à l'action ».

### 8.4 Mise en page proposée (toutes les fonctions conservées, comportement identique)

- **Intro : 1 phrase.** Ex. « Voici ce que l'assistant retient de votre parcours, et des métiers à regarder de plus près. »
- **Encart « Métier visé »** (en haut, non replié) : « 🎯 Vendeur en boulangerie » (ou « Domaine visé : Commerce ») + bouton **[ Changer ]**.
  - Par défaut : simple récap.
  - « Changer » → déplie **`banniereMetierCible()` / `banniereDomaineCible()` tels quels** (barre de recherche, chips, saisie libre, « changer de mode »). Aucune fonction perdue, juste repliée par défaut.
  - Le déblocage de « Passer à l'action » est déjà acquis à l'arrivée (métier choisi sur « Votre objectif »). `verifierAvantPasserAction()` **reste en place** comme filet (cas « offre sans entreprise » encore possible).
- **Regroupement visuel en 2 sections, SANS fusionner les `CONFIG_BLOC_*`** (chaque `blocERIP` garde son id, son wiring, son resume, ses sous-sections) :
  - **« Des métiers à regarder »** : `CONFIG_BLOC_METIERS` puis `CONFIG_BLOC_PISTES`, l'un sous l'autre, sous un même intertitre, espacement resserré.
  - **« Ce que l'assistant a compris de vous »** : `CONFIG_BLOC_PROFIL` (Analyse de profil), puis — `nouveau` seulement — `CONFIG_BLOC_CORRESPONDANCE` et l'accordéon « Ce qui fait votre valeur », l'un sous l'autre.
  - À trancher avec Denis : garde-t-on « Ce qui fait votre valeur » ET « Ce qui pourrait vous correspondre » (ils se recoupent), ou n'en garde-t-on qu'un ? Aucune donnée perdue si on en retire un (ce sont des phrases dérivées, recalculables) — mais c'est une **régression de contenu affiché**, donc **décision de Denis**.
- **Repère d'ancrage visible** : une ligne « Un doute sur un métier ? Gardez-le comme repère » (`reperesBoutonAncre` / `reperesBrancherBoutonAncre`, déjà appelé en fin de `pageRevelation`).
- **Habillage** aligné sur « Votre objectif » / « Mes informations » : accordéons, badges statiques (jamais de pulse), jetons.
- **Variantes conservées à l'identique** :
  - `maj` / `pret` : pas de « Ce qui fait votre valeur » ni « Ce qui pourrait vous correspondre » → la 2e section = juste « Analyse de votre profil ».
  - `domaine` : pas de « Des métiers à regarder » ni « Ce qui pourrait vous correspondre » → Récap domaine + « Analyse de votre profil » seulement.
  - `etatAfficherChoixModeRecherche` : géré par l'encart « Métier visé » déplié.

### 8.5 Fonctions à préserver telles quelles (liste de contrôle avant code)

- Clic sur un métier suggéré (recommandé ou piste) → devient `dossier.metierCible`, re-rendu.
- Clic sur une compétence de « Analyse de profil » → toggle (affecte `resumeProfil` → le CV).
- Boutons « Garder comme Repère » (sous-section « Pourquoi ces métiers ? »).
- Barre de recherche métier : répertoire + Entrée = saisie libre ; chips avec croix.
- « Changer de mode » (métier ↔ domaine) — hors stage/alternance/pmsmp.
- `verifierAvantPasserAction()` : gate + demande coordonnées entreprise si « offre » sans entreprise.
- `invaliderCacheMetiersRecommandes()` / `invaliderCachePistes()` au (re-)rendu sauf `conserverTirage`.
- Sous-section « Jobs saisonniers et alimentaires » (dynamique).
- Retour → `projet` (« Mes informations ») ; Suivant → `resultats`.
- Tous les `wireXxx` de fin de `pageRevelation` rappelés à chaque re-rendu.
