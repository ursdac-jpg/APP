# Plan d'exécution — Refonte de la carte « Mes documents » (APP)

> **Priorité absolue** (Denis, 2026-09-01) : c'est le parcours le plus utilisé, les fonctions
> de base de l'application. Prochain chantier à implémenter.
>
> Ce document = le **plan d'exécution**. Le « pourquoi / quoi » complet est dans
> `docs/CARTOGRAPHIE_PARCOURS_MES_DOCUMENTS.md` (Phase 0). La cible visuelle est
> `docs/MAQUETTE_MES_DOCUMENTS_JAI_DEJA_UN_CV_2026-09-01.html` (Phase 1). Les briques de la
> page « Préparer » dépliante sont partagées avec `docs/CHANTIER_PAGES_PREPARER_MODULES.md`.
>
> **Méthode** : un bloc à la fois, `npm test` + test navigateur **de bout en bout** à chaque
> bloc, **un commit par sous-étape**, jamais un état à moitié refondu.

---

## 1. Décisions actées (Denis, 2026-09-01)

| Sujet | Décision |
|---|---|
| Les 3 cartes | On garde 3 cartes distinctes. Pas de fusion `pret` / `maj`. |
| Ordre d'affichage (Denis 2026-09-01) | **Créer un nouveau CV → Mettre à jour mon CV → Préparer ma lettre et mon entretien.** Les deux parcours qui agissent sur le CV d'abord, puis « la suite ». |
| Titre carte 3 | **Court** : « Préparer ma lettre et mon entretien » (pas de majuscules à Lettre/Entretien). C'est la **description** qui explicite : « … pour votre lettre de motivation et pour vous entraîner à l'entretien d'embauche… ». |
| Nom carte « Créer un nouveau CV » | Inchangé. |
| Nom carte « Mettre à jour mon CV » | Conservée. *(À valider : garder « Mettre à jour mon CV » ou aligner sur « Modifier mon CV » — Denis dit « modifier ».)* |
| Nom carte « J'ai déjà un CV » | Devient **« Préparer ma lettre et mon entretien »**. La description de carte porte le prérequis (« Vous avez déjà un CV, on s'en sert comme base »). |
| Architecture | **1 page par étape, zéro cascade.** La modale `ouvrirAssistantDepotCV` à 4 sous-écrans devient **UNE page « Préparer » dépliante**. Le reste du parcours garde ses pages actuelles (déjà des pages simples). Aucune fenêtre sur fenêtre. |
| Barre d'étapes | **Restylée au vocabulaire commun** (Préparer / Assistant / Réponse…, pastille courante + halo, chevrons) **ET compacte** : plus fine et moins voyante que dans les autres modules (c'est un parcours parmi d'autres). |
| Retour libre | **Barre d'étapes cliquable** sur les 3 cartes : on peut revenir sur une étape **déjà validée** ; les étapes non atteintes restent verrouillées. Comportement volontaire (beaucoup de va-et-vient attendus, public qui découvre l'app + la méthode). |
| Réduire les écrans | Tout ce qui peut tenir sur une page y reste. Réutiliser au maximum les écrans déjà travaillés (maquette + briques du Bilan). |
| Panneaux de perso CV (PDF/Word) | **Hors de cette vague.** Chantier distinct, lié au découpage `js/app.js`. Reste sur `docs/AUDIT_PANNEAUX_PERSONNALISATION_CV_2026-09-01.html`. |

---

## 2. État de départ (code, vérifié 2026-09-01)

- 3 cartes = 3 valeurs de `dossier.modeCreation` (`nouveau` / `pret` / `maj`), **pas 3 modules**.
- Câblage : `data/metiers.js`
  - liste des cartes **en double** : CONFIG `ouvrirCarteAccueil` (`:3378`) **et** `tuile(...)` du panneau ERIP (`:3566`). À unifier (une seule source).
  - handlers (`:3642`) : `btnCarteAccueilCvNouveau` → `effacerSauvegarde()` + `modeCreation='nouveau'` + `naviguerVers('objectif')` ; `btnCarteAccueilCvPret` → `ouvrirAssistantDepotCV('pret')` ; `btnCarteAccueilCvMaj` → `ouvrirAssistantDepotCV('maj')`.
- `ouvrirAssistantDepotCV` (`data/metiers.js:1689`, ~700 lignes) : **partagée avec la création de CV normale. NE JAMAIS LA MODIFIER.** On remplace seulement son *appel*, et on la garde en **repli pour photo / scan** (édition d'image impossible en ligne dans la page).
- Pages en aval (partagées, à ne pas dupliquer) : `pageObjectif` `:4331`, `pageProjet` `:6371`, `pageRevelation` `:8492`, `pageResultats` `:11926`.
- Briques réutilisables (génériques malgré le préfixe `bilan`) : `obtenirOuDeposerTexteCV(cb)` (`data/metiers.js:2501`), `bilanDemanderRelectureCv(...)`, `bilanCorpsCiblageOffreHTML()` / `bilanCablerCiblageOffre` / `bilanLireCiblageOffre`, `htmlBilanPreparer()` (modèle de la page dépliante).
- `js/app.js` + `data/metiers.js` **non couverts par les tests Node** → test navigateur **obligatoire** à chaque bloc.

---

## 3. Cible par carte (barre d'étapes)

Icônes (pas de numéros), chevron `»` entre les étapes, chevron courante→suivante qui clignote,
barre **compacte**, étapes faites **cliquables**.

**Carte « Préparer ma lettre et mon entretien » (`pret`)** — 5 étapes :
`📝 Préparer` › `💬 Assistant` › `📥 Réponse` › `📋 Mon projet` › `📄 Mes documents`
(l'écran « Objectif » n'est plus une étape : il est dans le bloc « Votre candidature » de « Préparer ».)

**Carte « Mettre à jour mon CV » (`maj`)** — 5 étapes, identiques sauf l'étape 4 :
`📝 Préparer` › `💬 Assistant` › `📥 Réponse` › `✏️ Corriger mon CV` › `📄 Mes documents`

**Carte « Créer un nouveau CV » (`nouveau`)** — 6 étapes :
`🎯 Objectif` › `🧭 Votre parcours` › `💼 Mon projet` › `🔎 Faire le point` › `💬 Assistant` › `📄 Mes documents`
(le regroupement des 4 étapes actuelles Expérience / Ce que vous faisiez / Environnement / Attentes
sous « Votre parcours » à sous-étapes = **sous-phase à part, la plus risquée**, voir Phase 3b.
Icônes de « Créer » à affiner à ce moment-là.)

---

## 4. La page « Préparer » dépliante (cœur de la refonte, brique partagée)

Une `page-catalogue-contenu` avec des `<details class="bloc-depli">`, sur le modèle exact de
`htmlBilanPreparer()`. Trois blocs pour `pret` / `maj` :

| Bloc | Contenu | Brique | Obligatoire ? |
|---|---|---|---|
| 1 · Votre CV | « Déposer mon fichier » (PDF/Word/txt) / « Ou coller le texte ». Photo ou scan → repli `ouvrirAssistantDepotCV(modeCreation, { onTerminer: rerender })` pour la seule édition d'image, puis retour sur la page. Icône sobre (pas de trombone). | `obtenirOuDeposerTexteCV(cb)` | oui |
| 2 · **Relire, vérifier, corriger, masquer** | Le titre couvre les deux cas : **corriger** = le texte ; **vérifier / masquer** = texte ET image. Détection auto (tél, e-mail, LinkedIn/GitHub, URL, âge/date de naissance, nom étiqueté), **surlignage jaune** `<mark>` dans le texte + badges. Zones libres masquables. Reste un modal `bilanDemanderRelectureCv` / `htmlVerificationDocument`. **Icône : surligneur 🖍️, jamais l'œil.** | `bilanDemanderRelectureCv(...)` | oui |
| 3 · Votre candidature | **« Pourquoi ce CV ? »** = les **6 choix distincts** de `OBJECTIF_CHOIX_CANDIDATURE` (Répondre à une offre / Candidature spontanée / Changer de métier / Stage / Alternance / PMSMP immersion), **un bouton chacun**, **obligatoire** → `definirObjectifCandidature`. **+ 4 champs facultatifs séparés** : Nom de l'entreprise · **Site internet de l'entreprise** (sert aussi à retrouver les couleurs de marque ailleurs) · **Offre d'emploi** (lien ou texte), présentée comme un sous-bloc à part · **Type de structure** = **liste déroulante `<select>` réutilisant `BILAN_TYPES_STRUCTURE`** (10 entrées, déjà utilisée par Cohérence et le Bilan). | choix `OBJECTIF_CHOIX_CANDIDATURE` + `bilanCorpsCiblageOffreHTML()` + `BILAN_TYPES_STRUCTURE` | « pourquoi ce CV » oui, le reste non |

Puis, **sur la même page, en bas** : le composant existant **`htmlChoixAssistantBilanCorps`** (fait le
2026-08-30, utilisé par le Bilan et Découverte) — groupe **« Sans compte à créer »** (vert, en
premier) / groupe **« Avec une connexion »** (bleu, en dessous) + accordéon replié « Ce qui va se
passer, et vos données ». Puis bouton « Préparer le texte et ouvrir l'assistant → ».

CTA → pipeline existant (`ouvrirChoixAssistantLettreV1` / équivalent) avec
`{ type: 'texte', valeur: <texte relu> }` ou `{ type: 'image' }` si repli scan.

**Ce qui disparaît** : les 4 sous-écrans imbriqués de la modale + la fenêtre de confirmation
intermédiaire. On passe d'environ 8 changements de contexte avant « Mon projet » à 2 (cette page,
puis l'onglet de l'assistant).

**Mutualisation** : cette page dépliante est la **même brique** que celle prévue par
`docs/CHANTIER_PAGES_PREPARER_MODULES.md` pour Co-construire ma lettre / Préparer un entretien /
Cohérence. **Recommandation : la construire générique ici** (carte 3 est prioritaire), puis
`CHANTIER_PAGES_PREPARER_MODULES` la réutilise. *(À valider.)*

---

## 5. Barre d'étapes — composant partagé, compact, cliquable

- **Extraire un composant** réutilisant les classes `.pastille-etape-action*` / `.chevron-etape-action`
  déjà en place (jamais une nouvelle palette). Variante **compacte** (hauteur et police réduites)
  propre à « Mes documents ».
- **Cliquable** : `data-etape-index`, clic sur une étape `faite` → y retourne. Étape non atteinte =
  non cliquable, curseur normal, `aria-disabled`. Garde-fou : le retour ne doit jamais mettre le
  `dossier` dans un état incohérent — on ne réinitialise rien, on ré-affiche l'écran avec les
  valeurs déjà saisies.
- **Vocabulaire commun** : `Préparer` / `Assistant` / `Réponse` / … (comme Découverte, Cohérence,
  Comparer). Pastille courante jaune + halo bleu, chevron suivant bleu, `prefers-reduced-motion`
  respecté, **jamais de temps estimé**.
- Lien avec le chantier transverse `[À FAIRE] Harmoniser et généraliser la barre d'étapes` : ce
  composant peut devenir la base commune. À signaler dans `docs/BRIQUES_COMMUNES.md`.

---

## 6. Phasage

### Phase 1 — Carte « Préparer ma lettre et mon entretien » (`pret`), la référence

| Bloc | Contenu | Commit |
|---|---|---|
| ~~1.0~~ **FAIT** | Source unique `MES_DOCUMENTS_PARCOURS` (`data/metiers.js`) lue par les 3 endroits (puces `htmlCarteAccueil` dans `js/app.js`, `INFOS_CARTE_ACCUEIL.mesdocuments`, `CONFIGS.mesdocuments` tuiles). Carte 3 renommée « Préparer ma lettre et mon entretien » + nouvelle description + nouvelle infobulle. **Handler `btnCarteAccueilCvPret` inchangé** (`ouvrirAssistantDepotCV('pret')`) : la route `preparer-lettre-entretien` est posée en 1.1 avec la page d'intro (jamais une route sans page réelle). 646 tests verts, vérifié navigateur (puces + tuiles + infobulle renommées, comportement identique, 0 erreur console). | ✅ |
| ~~1.1~~ **FAIT** | **Page d'intro routée** `preparer-lettre-entretien` → `pagePreparerLettreEntretien()` (`data/metiers.js`), via la brique partagée `htmlPageIntroModuleParcours` (comme `pageCoLettre`). Sections : accroche + À quoi ça sert (+ encart « ≠ Co-construire ma lettre / Préparer un entretien ») + Ce qui va se passer + Ce que ce mode ne fait pas + Ce que vous pourrez faire ensuite + Mes Repères + Comment ça se passe + Bon à savoir. Barre d'étapes en sourdine (📝 Préparer › 💬 Assistant › 📥 Réponse › 📋 Mon projet › 📄 Mes documents), encart multilingue auto, barre de navigation fixe → `retourVersCarteAccueil('mesdocuments')`. `btnCarteAccueilCvPret` → `fermerFenetreERIP()` + `naviguerVers('preparer-lettre-entretien')`. CTA « Déposer mon CV » → `ouvrirAssistantDepotCV('pret')` (bloc 1.2 le remplacera par la page « Préparer » dépliante). Route enregistrée dans `routes` (js/app.js) + stub `tests/_domStub.js`. Umami `preparer_lettre_entretien_intro_affichee`. 646 tests verts, vérifié navigateur (flux accueil → panneau → intro ; Retour → panneau ; CTA → modale ; mode sombre ; 0 erreur console). **Reste** : aides contextuelles `cv-existant` / `maj-cv` (js/app.js ~30215) à revoir plus tard (panneau guidé) — pas bloquant. | ✅ |
| ~~1.2~~ **FAIT** | **Page « Préparer » dépliante** (`data/metiers.js` : `_prepLERendreDepot` / `htmlPreparerLettreEntretienDepliante` / `brancherPreparerLettreEntretienDepliante`), même route `preparer-lettre-entretien` avec un drapeau `_prepLEEcran` (`'intro'` / `'depot'`). Structure et classes de `htmlBilanPreparer`. **3 blocs** : Votre CV (`obtenirOuDeposerTexteCV`, repli photo/scan → `ouvrirAssistantDepotCV('pret')`) / Relire-vérifier-corriger-masquer (`bilanDemanderRelectureCv`) / Pourquoi ce CV ? (6 jetons `OBJECTIF_CHOIX_CANDIDATURE` → `definirObjectifCandidature`). CTA « Choisir mon assistant → » (actif quand CV déposé + relu) → `structurerTexteExistant(texte, { mode: 'pret' })` → wizard **étape 3-4 seulement** (choix assistant + import `extraction-cv.md`) → `dossier.modeCreation='pret'` + `naviguerVers('objectif')`. Barre de navigation fixe → `_prepLERetourIntro()`. Umami `preparer_lettre_entretien_depot_affiche` / `_vers_assistant`. 646 tests verts, vérifié navigateur (intro→dépôt, coller CV, relecture spy + modale réelle, jeton objectif, CTA → wizard étape 3, Retour → intro, 0 erreur console). **Follow-ups** : (1.2b) bloc « L'offre visée » (`bilanCorpsCiblageOffreHTML`, 4 champs séparés) — reste à tracer l'écriture vers `dossier.rechercheCandidature` pour le cas non-Bilan ; (1.2c) sauter l'écran `pageObjectif` en aval pour `pret` (aujourd'hui il tourne encore, choix pré-sélectionné). | ✅ |
| ~~1.2b~~ **FAIT** (`01a3f1b`) | 4e bloc « L'offre visée » sur la page dépliante via `bilanCorpsCiblageOffreHTML` / `bilanCablerCiblageOffre`. Au CTA, `bilanLireCiblageOffre` mappé sur `dossier.rechercheCandidature` (entreprise / site / lienOffre / typeStructure). | ✅ |
| ~~1.2c~~ **FAIT** (`13cd86f`) | Au CTA, `structurerTexteExistant` reçoit un `onTerminer` : si « Pourquoi ce CV ? » déjà renseigné → `naviguerVers('projet')` (saute l'écran Objectif) ; sinon → `naviguerVers('objectif')`. `dossier.modeCreation='pret'` dans `onTerminer`. | ✅ |
| ~~1.4~~ **FAIT** (`b7e12ef`) | Page dépliante : bouton « Revoir la présentation » → intro **en détour** (`_prepLEDetour`), « Revenir au module », état conservé. Intro : encart « Continuer / Recommencer » (`_introBlocReprise`) si un CV a été déposé sans finir (`_prepLEEtat.cvTexte`), gros CTA masqué. Intro : synthèse « Voir mon CV » si `cvDisponible() && modeCreation==='pret'`. | ✅ |
| ~~1.5~~ **FAIT** | Mode sombre vérifié : les ajouts n'utilisent que les classes maison (`.bloc-depli`, `.preparer-*`, `.cv-section`), jetons OK clair + sombre. Seuls fonds blancs restants = les `.form-control` de `bilanCorpsCiblageOffreHTML` = **problème app-wide pré-existant** (identique dans le Bilan), pas une régression — voir chantier « thème des formulaires » à part. | ✅ |
| ~~1.3~~ **FAIT** (`ece87ed`) | `barreEtapesModule` : 3e param `options.routeParIndex(i)` → étape faite cliquable (rétro-compatible). `afficherProgression` : si `dossier.modeCreation === 'pret'` et écran ∈ {objectif, projet, revelation, resultats} → barre compacte du module (`PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES`, « Mon projet » cliquable), sinon vieille barre (nouveau/maj inchangés, vérifié). `PREPARER_LETTRE_ENTRETIEN_NAV_ETAPES` = source unique (intro + écrans de travail). **+ correctif Denis** : le bouton « Revoir la présentation » de la page dépliante était mal placé (via `htmlBoutonRevoirModule`, marge négative, avant le titre) → remplacé par le **même placement que Bilan / Cohérence / Comparer** : barre d'étapes puis `bande-reprise-module` en tête du contenu du module. 646 tests verts, vérifié navigateur. |
| **1.3 bis — ABANDONNÉ (décision Denis)** | Choix assistant + import sur pages routées : abandonné (impossible sans toucher `ouvrirAssistantDepotCV` / dupliquer le round-trip `extraction-cv.md` ; le « zéro cascade » est déjà atteint). |
| **RESTE (optionnel, code partagé)** | Bouton « Revoir la présentation » sur les écrans de travail `pret` **partagés** (`pageObjectif` / `pageProjet` / `pageResultats`) — comme le Bilan l'a sur tous ses écrans. Pas demandé explicitement ; ces pages ont déjà leur `barreNavigation`. À voir avec Denis. |

### Phase 2 — Carte « Mettre à jour mon CV » (`maj`) — **FAIT** (`141f74b`)

Route `mettre-a-jour-cv` → `pageMettreAJourCv()` + `_majCvRendreIntro()` (contenu adapté :
« la mise en page n'est pas conservée », encart « vous n'êtes jamais bloqué »). **La page
« Préparer » dépliante est la MÊME que `pret`** (`htmlPreparerLettreEntretienDepliante` /
`_prepLERendreDepot` / `brancherPreparerLettreEntretienDepliante`), paramétrée par `_prepLEMode`
(`'pret'` | `'maj'`) : titre, barre d'étapes (`MAJ_CV_NAV_ETAPES` avec « Corriger mon CV »),
logo (`bi-pencil-square`), CTA (`structurerTexteExistant({ mode: 'maj' })`), `dossier.modeCreation`.
État partagé `_prepLEEcran` / `_prepLEEtat` / `_prepLEDetour`. `afficherProgression` affiche la
barre du module pour `pret` ET `maj`. `btnCarteAccueilCvMaj` → `naviguerVers('mettre-a-jour-cv')`.
646 tests verts, vérifié navigateur (intro + dépliante + barre travail + CTA + regression `pret`
+ `nouveau` intact).

### Phase 3 — Carte « Créer un nouveau CV » (`nouveau`)

- **3a — FAIT** (`ddd3027`) : `pageCreerCv()` (route `creer-cv`), page d'intro routée (patron
  partagé, pas de page dépliante — rien à déposer). Resets (`effacerSauvegarde`, `cvAnalyse`,
  `competencesCV`, `modeCreation='nouveau'`, `decouverteTerminee`) déplacés du handler de tuile
  vers le CTA. `CREER_CV_NAV_ETAPES` (6 repères) + `_creerCvNavIndex`. `afficherProgression`
  affiche la barre du module pour `nouveau` aussi (les 4 écrans activites/actions/environnement/
  valeurs → index 1 « Votre parcours » en attendant 3b). `btnCarteAccueilCvNouveau` →
  `naviguerVers('creer-cv')`. 646 tests verts, vérifié navigateur (+ regression pret/maj/autres
  intros).
- **3b — FAIT** (2026-09-02, plan dédié `docs/PLAN_FUSION_VOTRE_PARCOURS_2026-09-02.md`,
  maquette v3 validée `docs/MAQUETTE_VOTRE_PARCOURS_FUSION_2026-09-02.html`). Les 4 écrans
  Activités / Actions / Environnement / Attentes fusionnés en **une page `pageVotreParcours()`**
  (route `votre-parcours`) à 4 questions repliables, familles de choix = tiroirs distincts des
  cartes-pastilles. Commits : `b868832` (Question 2 : 6 catégories → 4 par redistribution dans
  `data/actionsProfessionnelles.js`), `dd90757` (`pageVotreParcours()` + route), `644afc5`
  (navigation `nouveau` : Objectif → Votre parcours → Mon projet), `9a56874` (retrait des 4
  anciennes fonctions + `pageSelectionCatalogue`, ~280 lignes ; `trouverItemParId()` re-ajoutée
  hors zone supprimée — elle y vivait). 646 tests verts, vérifié navigateur bout-en-bout,
  non-régression pret/maj. `dossier.activites / .actions / .environnement / .valeurs` inchangés.

### Phase 4 (hors vague) — Panneaux de personnalisation CV

Chantier distinct, lié au découpage `js/app.js`. Reste sur l'audit.

### Dernière tâche du chantier (Denis 2026-09-01) — mettre à jour l'aide contextuelle (l'ampoule) — **FAIT 2026-09-03** (`68884e3`)

`AIDE_PAGES['preparer-lettre-entretien']` et `['mettre-a-jour-cv']` créées : 7 entrées chacune,
couvrant l'écran d'intro (barre d'étapes, CTA « Déposer mon CV ») **et** la page « Préparer »
dépliante (les 4 blocs `#prepLEBloc1..4` + CTA « Choisir mon assistant »). Les 2 écrans partagent
la route (drapeau `_prepLEEcran`) ; `demarrerVisiteGuideePage()` ne garde que les sélecteurs
présents dans le DOM courant → les entrées des 2 écrans cohabitent sans conflit. Texte de la barre
d'étapes rendu **neutre** sur les 3 écrans partagés par les 3 modes (`projet` / `revelation` /
`resultats`) : « les six étapes du parcours : objectif, parcours, informations, profil, assistant,
documents » (spécifique à `nouveau`) → « les étapes de votre parcours ». `objectif` /
`votre-parcours` / `assistant` gardent le texte détaillé (routes du seul parcours `nouveau`). Les
entrées `AIDE_FENETRES` `cv-existant` / `maj-cv` / `choix-document-metier` restent inchangées :
elles appartiennent au flux **recherche guidée métier → fiche**, pas à cette refonte. Vérifié
navigateur (intro + dépliante `pret`/`maj`, visite guidée sans erreur), `npm test` 699.

---

## 7. Garde-fous (obligatoires)

- **Ne jamais modifier `ouvrirAssistantDepotCV`.** Appelée seulement en repli scan/photo, à
  l'identique du bloc 1 du Bilan.
- **Formes de données en aval** (`etapeSuivanteWizard`, `pageResultats` / `depuisDecouverte`,
  `ouvrirChoixAssistantLettreV1`, pipeline entretien, prompts `lettre.md` / `entretien.md`) : lire
  la fonction d'entrée **en entier**, noter la forme exacte, la reconstruire depuis les blocs de la
  page — jamais « à peu près ».
- **Zéro régression fonctionnelle** : inventaire GARDÉ / DÉPLACÉ / FUSIONNÉ / ENRICHI avant de
  toucher au code de chaque carte ; coché ET testé après.
- **Une seule source de vérité** : la liste des cartes, la page « Préparer », la barre d'étapes =
  chacune une brique unique. `docs/BRIQUES_COMMUNES.md` mis à jour dans le même commit.
- `js/app.js` / `data/metiers.js` non testés par Node → **test navigateur de bout en bout par
  bloc** (dépôt → relecture → ciblage → choix assistant → coller → livrable), avant le bloc suivant.
- Chemin **image / scan** conservé partout (repli modale).
- `dossier.decouverteTerminee` : les handlers des 3 cartes le remettent déjà à `false` — vérifier
  que ça reste le cas après refonte.

---

## 8. Points tranchés avec Denis (2026-09-01, après la maquette v1 puis v2)

1. Label de la carte 2 : **« Mettre à jour mon CV »** (conservé).
2. Bloc « candidature visée » remonté dans « Préparer » : **oui**, fusionné avec l'ancien écran
   « Objectif » en un seul bloc **« Votre candidature »** (obligatoire : *pourquoi ce CV* — offre
   précise / spontanée / reconversion / stage-alternance-immersion ; facultatif : entreprise /
   offre / type de structure). **L'écran `pageObjectif` disparaît** du parcours pour `pret` et
   `maj`. `dossier.objectif` posé avant le CTA « Préparer le texte et ouvrir l'assistant ».
3. Page « Préparer » construite **générique** (partagée avec `CHANTIER_PAGES_PREPARER_MODULES`) :
   **oui**.
4. Route de la carte 3 : **`preparer-lettre-entretien`**.
5. Phase 3b (regroupement 9 → 6 de « Créer ») : **chantier à part**, après la Phase 1.
6. Nom de la carte 3 : **« Préparer ma lettre et mon entretien »** (le prérequis CV passe dans la
   description de carte).
7. « Porte de sortie » (lien « Ce n'est pas ce que vous cherchiez ?… ») : **retirée**. Le
   « Retour » de la `barre-navigation-fixe` du bas (commun à tous les modules, ramène au panneau
   « Mes documents ») suffit.
8. Encart « Mes Repères » sur les 3 intros : **conservé** (module transversal), sans réserve.
   Re-posé pour la carte 3 le 2026-09-01 → Denis confirme **on garde** : la personne n'est pas
   obligée de créer un repère (elle n'en aura probablement pas sur ces pages), mais elle peut en
   créer à tout moment — l'encart reste utile juste pour le lui rappeler.
9. Phrase qui distingue de « Co-construire ma lettre » : **conservée** (demande Denis).
10. Comportements communs : **briques partagées telles quelles**, mot pour mot.
    - Bouton : `htmlBoutonRevoirModule` → « **Revoir la présentation** » (écran de travail) /
      « **Revenir au module** » (intro en détour). **Jamais** « travail ».
    - Reprise : `htmlEncartRepriseModule` → texte `« Vous avez une préparation en cours sur ce
      module. »` (paramètre `texte`, au lieu du défaut « analyse »), boutons « **Continuer** » /
      « **Recommencer** » (saumon, jamais rouge). `htmlBandeRepriseModule` (bouton gauche + encart
      droite, sous la barre d'étapes). Pulse ~10 s puis stop.
    - Gel : `appliquerGelModule` → classe `module-gel-actif` sur `.page-catalogue-contenu` (tout
      inerte sauf la bande de reprise et la barre du bas).
11. Barre d'étapes : **icônes, pas de numéros** (comme `barreEtapesModule`). Chevron `»`
    (`bi-chevron-double-right`) entre les étapes, celui entre l'étape courante et la suivante
    **clignote** (opacité seule, `prefers-reduced-motion` respecté). **Compacte** (plus fine que
    dans les autres modules). **Étapes faites cliquables** pour y revenir ; à venir verrouillées.
    Icônes : 📝 Préparer / 💬 Assistant / 📥 Réponse / 📋 Mon projet / ✏️ Corriger mon CV /
    📄 Mes documents (toutes déjà en usage ailleurs).
    - « Préparer ma lettre et mon entretien » : 📝 › 💬 › 📥 › 📋 Mon projet › 📄
    - « Mettre à jour mon CV » : 📝 › 💬 › 📥 › ✏️ Corriger mon CV › 📄
    - « Créer un nouveau CV » : 🎯 › 🧭 › 💼 › 🔎 › 💬 › 📄 (icônes à affiner en Phase 3b)

### Décisions v3 (2026-09-01, après la maquette v2)

12. Bande comparative des 3 modes (idée « +2 ») : **retirée** — redondante avec le renommage + les
    descriptions de carte + l'infobulle + une page d'intro complète par mode.
13. Bloc de relecture : titre **« Relire, vérifier, corriger, masquer »** ; icône **surligneur 🖍️**
    (jamais l'œil — viole aussi la règle « pas d'yeux »). Confirmé dans le code : `detecterCoordonneesSensibles`
    + `construireHTMLSurbrillanceDetection` surlignent en jaune tél / e-mail / LinkedIn-GitHub / URL /
    âge / nom étiqueté, directement dans le texte + badges.
14. Bloc « Votre candidature » : « Pourquoi ce CV ? » = **6 boutons distincts** (`OBJECTIF_CHOIX_CANDIDATURE`) ;
    **4 champs facultatifs séparés** (Entreprise / Site internet / Offre d'emploi en sous-bloc à part /
    Type de structure) ; Type de structure = **`<select>` réutilisant `BILAN_TYPES_STRUCTURE`**.
15. Choix de l'assistant : **`htmlChoixAssistantBilanCorps` repris tel quel** (2 groupes labellisés +
    accordéon « Ce qui va se passer, et vos données »).
16. Note sous « Revoir la présentation » : **juste le texte + une petite croix**. Pas d'ampoule, pas de
    bouton « J'ai compris » visible (la brique réelle ne met que la croix).
17. Prompt entretien de la carte 3 : **option B (échange)**. Carte 3 → `entretien-accueil.md` (rapide,
    colle à son positionnement) ; le module dédié « Préparer un entretien » récupère `entretien.md`
    (coaching approfondi). **Implémentation Phase 2** : la carte 3 passe par la page « Action » commune →
    il faut un test de contexte (`modePret` / origine carte 3) pour prendre `entretien-accueil` au lieu
    de `entretien` ; côté module dédié, changer la clé dans `demarrerEnvoiIAEntretien` (`promptCache('entretien-accueil'…)` → `promptCache('entretien'…)`) + test navigateur. Encart de la carte 3 réunit lettre ET entretien.
    **— FAIT 2026-09-03 (`3beb780`, option A actée après reco).** `wireChoixAssistantIA` (js/app.js) :
    `type === 'entretien' && dossier.modeCreation ∈ {pret, maj}` → `promptCache('entretien-accueil', …)`.
    `demarrerEnvoiIAEntretien` (data/metiers.js) repassé à `promptCache('entretien', …)`. `nouveau` non
    concerné. Vérifié navigateur (porte pret/maj → court, nouveau → long, lettre inchangée ; les 2
    prompts distincts). `maj` (carte 2) inclus par cohérence (même public, même pipeline).
18. Icône du bloc « Votre CV » : **sobre**, pas de trombone.
19. Intros **« Créer un nouveau CV »** et **« Mettre à jour mon CV »** uniquement (pas la carte 3,
    qui ne produit pas de CV) : encart « vous n'êtes jamais bloqué ».
    - « Créer » : les modèles de mise en page sont les nôtres (PDF/Word) ; s'ils ne conviennent pas,
      copier le texte du CV et le mettre en forme ailleurs.
    - « Mettre à jour » : **plus explicite** — dire clairement que **la mise en page du CV d'origine
      n'est pas conservée** ; l'application récupère les *informations*, les met à jour / complète,
      puis les propose dans l'un de nos modèles au choix ; sinon, copier le texte et le mettre en
      forme sur une autre plateforme.

**Plus aucun point ouvert.** Maquette v3 : `docs/MAQUETTE_REFONTE_MES_DOCUMENTS_2026-09-01.html`
(changements v2 → v3 listés en tête du fichier).
