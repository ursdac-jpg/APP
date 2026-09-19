# Cartographie des 3 parcours « Mes documents » (Phase 0)

> **But** : tracer le parcours réel complet des 3 modes de création de CV avant toute maquette, comme l'exige la non-négociable « tracer le parcours réel (écran d'avant, écran d'après, fonctions, boutons) avant toute maquette ».
> **Statut** : document de travail, **non commité**. Produit en lecture seule le 2026-09-01 pendant que `js/app.js` était pris par un autre compte (module « Comparer mes pistes »). Aucun code modifié.
> **Suite** : Phase 1 = une maquette de référence sur le mode « J'ai déjà un CV », puis refontes bloc par bloc (Phases 2 à 4).

---

## 1. Le point de cadrage : 3 modes, pas 3 modules

Les trois entrées de la carte « Mes documents » ne sont **pas trois modules**. Ce sont trois valeurs d'un même champ, `dossier.modeCreation` :

| Tuile | `modeCreation` | Idée |
|---|---|---|
| Créer un nouveau CV | `'nouveau'` | Construction depuis zéro, parcours guidé complet |
| J'ai déjà un CV | `'pret'` | Import d'un CV complet, repris tel quel, cap sur la lettre |
| Mettre à jour mon CV | `'maj'` | Import + entrée à une étape avancée pour **corriger le contenu** |

Ils partagent : `texteProfil()` / `texteProfilEffectif()`, la fenêtre de dépôt `ouvrirAssistantDepotCV()`, la barre d'étapes `ETAPES` + `afficherProgression()`, la page « Mon projet » (`pageProjet()`), la page « Action » (`pageResultats()`), tout le circuit de génération de documents et de finalisation.

**Conséquence pour la refonte** : le squelette commun (page d'intro + page « Préparer » dépliante) se conçoit **une seule fois**. Traiter les 3 « comme des modules séparés » recréerait de la duplication, contre la règle « une seule source de vérité ».

---

## 2. Point d'entrée commun

`pageChoixCV()` (`js/app.js:3986`) — l'accueil « Par où voulez-vous commencer ? ».
→ carte « Mes documents » → `ouvrirCarteAccueil('mesdocuments')` (`data/metiers.js:3446`)
→ fenêtre ERIP (panneau `large`) avec 3 sous-cartes + bouton « ← Retour ».

Câblage des 3 sous-cartes (`data/metiers.js:3568`) :
- `btnCarteAccueilCvNouveau` → `effacerSauvegarde()`, `dossier.modeCreation = 'nouveau'`, `dossier.cvAnalyse = false`, `fermerFenetreERIP()`, `naviguerVers('objectif')`.
- `btnCarteAccueilCvPret` → `ouvrirAssistantDepotCV('pret')`.
- `btnCarteAccueilCvMaj` → `ouvrirAssistantDepotCV('maj')`.

**Écart standard** : les modules récents font `naviguerVers('X-intro')` (une vraie page de présentation). Ici, aucun des 3 n'a de page d'intro. « Créer » saute droit au parcours ; « J'ai déjà » / « Mettre à jour » sautent droit dans la fenêtre modale de dépôt.

---

## 3. Mode « Créer un nouveau CV » (`nouveau`) — écran par écran

Barre d'étapes visible en haut (`afficherProgression`), 9 repères : `👤` / `🎯` / `🤝 Expérience` / `⭐ Ce que vous faisiez` / `🌍 Environnement` / `⚖️ Attentes` / `📋 Mon projet` / `🧭 Faire le point` / `✨ Action`.

| # | Écran | Fonction | Notes |
|---|---|---|---|
| 1 | **Objectif** | `pageObjectif()` `:4331` | Cartes : offre / spontanée / reconversion / stage / alternance / immersion. `definirObjectifCandidature()`. → `naviguerVers('activites')` (car `cvAnalyse` faux). |
| 2 | **Expérience** (activités) | `pageActivites()` `:4429` → `pageSelectionCatalogue` | Sélection dans un catalogue d'activités professionnelles. |
| 3 | **Ce que vous faisiez** (actions) | `pageActions()` `:4676` → `pageCartes` | Multi-sélection. |
| 4 | **Environnement** | `pageEnvironnement()` `:4687` → `pageCartes` | Personnes / matériels / lieux. |
| 5 | **Attentes** (valeurs) | `pageValeurs()` `:4806` → `pageCartes` | Valeurs professionnelles, `max` limité. |
| 6 | **Mon projet** | `pageProjet()` `:6371` | `modeAllege` = **faux** → 6 blocs dépliants (`blocERIP`) : Vous / Parcours / Expériences et savoir-faire personnels / Projet professionnel / Compléments / Candidature. Encart vidéo. |
| 7 | **Faire le point** | `pageRevelation()` `:8492` | Blocs de synthèse (`afficherBlocsQuestionnaire = (modeCreation === 'nouveau')` → visibles ici seulement pour ce mode). Bouton « Révéler mon potentiel ». |
| 8 | **Action** | `pageResultats()` `:11926` | Sélecteur « Choisissez votre action » : cartes CV / Lettre / Entretien. `desactiveCV` = faux, `desactiveLettre = !dossier.cvTermine`, `desactiveEntretien = !dossier.lettreTerminee` → **verrouillage progressif**. |

Puis, par document choisi (voir §6) : écran tampon assistant → fenêtre assistant (onglet externe) → import de la réponse JSON → écran de relecture (décocher / réordonner) → « Finaliser mon CV » / aperçu / export.

---

## 4. Mode « J'ai déjà un CV » (`pret`) — écran par écran

### 4a. Fenêtre modale de dépôt `ouvrirAssistantDepotCV('pret')` (`data/metiers.js:1689`)

Modale plein écran (`position:fixed;inset:0;background:rgba(11,26,51,0.55)`), boîte blanche `max-width:680px`, **styles en dur** (`background:white`, `#E5E7EB`) — pas de jetons de thème, **mode sombre à vérifier**. Pied de fenêtre fixe (Retour / Continuer). Croix = seule fermeture explicite.

| Sous-étape | `obtenirDefinitionEtape` | Contenu |
|---|---|---|
| 1 · Déposer votre document | `numero === 1` `:2289` | `<input type="file">` (PDF, .docx, .txt, .jpg/.png…) **ou** bouton « Coller le texte directement » → `<textarea>`. Lecture locale, `cablerEtape1()`. |
| 2 · Vérification | `numero === 2` `:2333` | Composant partagé `htmlVerificationDocument()` / `cablerVerificationDocument()` (le même que le Bilan et l'Entretien) : masquage des coordonnées sensibles, bouton « Enregistrer » dans le corps. |
| 3 · Analyse assistée | `numero === 3` `:2402` | `cablerEtape3()` → pastilles de choix d'assistant. Choisir une pastille → `ouvrirFenetreAssistantIA()` (confirmation + ouverture d'un **onglet externe** vers ChatGPT/Claude, prompt `extraction-cv.md` copié dans le presse-papiers). Bouton pied : « J'ai déjà ma réponse → ». |
| 4 · Importer la réponse | `else` `:2429` | Bannière de transition (`htmlBanniereTransitionIA` : décompte, popup bloquée, « Je suis de retour »), `htmlCollageInstantane('Wizard')`, bouton « Importer », bloc astuce si image. `cablerEtape4()` parse le JSON (`extraction-cv.md`) et alimente `dossier`. |

Fin du wizard → `etapeSuivanteWizard()` → `dossier.modeCreation = 'pret'` → `naviguerVers('objectif')`.

### 4b. Suite en pages

| Écran | Fonction | Différence `pret` |
|---|---|---|
| **Objectif** | `pageObjectif()` | Après `definirObjectifCandidature`, `naviguerVers('projet')` directement (`dossier.cvAnalyse === true` → **saute Expérience / Ce que vous faisiez / Environnement / Attentes**). |
| **Mon projet** | `pageProjet()` | `modeAllege = (modeCreation === 'pret')` → **vrai** → seulement 3 blocs : Vous / Projet professionnel / Candidature. Parcours, Expériences perso, Compléments masqués (déjà fournis par l'import). |
| **Faire le point** | `pageRevelation()` | `afficherBlocsQuestionnaire` faux → blocs de questionnaire masqués. |
| **Action** | `pageResultats()` | `modePret` vrai → `desactiveCV = true` (**carte CV grisée**, tooltip « vous possédez déjà un CV »), **Lettre disponible d'emblée** (`desactiveLettre = !modePret && …`). Document par défaut = `'lettre'` (`js/app.js:19210`). |

Le vrai but de ce mode : produire la **lettre de motivation intégrée** (`lettre.md`, alimentée par `texteProfilEffectif('lettre')` + la stratégie), **différente** de « Co-construire ma lettre » de l'accueil (`lettre-v1.md`, conversationnel, ~35 questions). Rien dans l'interface ne le dit à la personne.

---

## 5. Mode « Mettre à jour mon CV » (`maj`) — écran par écran

Même fenêtre modale de dépôt que §4a (`ouvrirAssistantDepotCV('maj')`), même 4 sous-étapes, même round-trip `extraction-cv.md`.

Fin du wizard → `dossier.modeCreation = 'maj'` → `naviguerVers('objectif')`.

Différences en aval :

| Écran | Différence `maj` |
|---|---|
| **Objectif → projet** | Comme `pret`, `cvAnalyse === true` → saute Expérience / Ce que vous faisiez / Environnement / Attentes. |
| **Mon projet** | `modeAllege` = **faux** (seul `'pret'` l'active) → **les 6 blocs**, dont Parcours et Expériences perso, avec **éditeur structuré par champ** disponible (`js/app.js:5430` : `modeCreation !== 'pret'`). C'est là que se fait la mise à jour du contenu. |
| **Action** | `modePret` faux → `desactiveCV` faux (**carte CV active**), `desactiveLettre = !dossier.cvTermine` (Lettre attend que le CV soit terminé). Document par défaut = `'cv'`. |

**En résumé** : `maj` = `pret` pour l'entrée (import + saut d'étapes) mais `nouveau` pour la sortie (6 blocs, éditeur par champ, CV comme document principal). C'est le plus mince en intention (récupérer + corriger, jamais écrire de zéro) mais pas le plus court en écrans.

---

## 6. Circuit commun de génération d'un document (depuis « Action »)

Pour CV, puis Lettre, puis Entretien (dans cet ordre, verrouillage progressif) :

1. Carte du document → écran tampon / bannière de transition assistant (`htmlBanniereTransitionIA`, `ETAPES_ASSISTANT_IA_TEXTE`).
2. Choix de l'assistant (pastilles) → `ouvrirFenetreAssistantIA()` → **onglet externe**, prompt copié (`cv.md` / `lettre.md` / `entretien.md` + `texteProfilEffectif(type)`).
3. Retour → collage de la réponse JSON → parsing.
4. **Écran de relecture** : décocher / modifier / réordonner les propositions (`ETAPES_DETAIL_CHOIX_IA` : « Rien n'est appliqué avant que vous validiez »).
5. Application au dossier → « Finaliser mon CV » (fenêtre `tresLarge`) / aperçu (Composeur, PDF, Word) / export.

Chaque document = **au minimum un aller-retour vers une IA externe**.

---

## 7. Inventaire des fenêtres (le problème « réduire le nombre de fenêtres »)

Parcours « J'ai déjà un CV » jusqu'à une lettre finie, en comptant chaque changement de contexte :

1. Accueil `pageChoixCV`
2. Panneau « Mes documents » (fenêtre ERIP)
3. Modale de dépôt — sous-écran 1 (déposer)
4. Modale de dépôt — sous-écran 2 (vérification)
5. Modale de dépôt — sous-écran 3 (choix assistant)
6. Fenêtre de confirmation assistant
7. **Onglet externe** (ChatGPT/Claude) — extraction
8. Modale de dépôt — sous-écran 4 (import réponse)
9. Page « Objectif »
10. Page « Mon projet » (3 blocs dépliants)
11. Page « Faire le point »
12. Page « Action »
13. Écran tampon assistant (lettre)
14. Fenêtre de confirmation assistant
15. **Onglet externe** — génération lettre
16. Écran de collage / import
17. Écran de relecture (décocher / réordonner)
18. « Finaliser » / aperçu / export

**~18 changements de contexte, 2 allers-retours IA externes, 1 fenêtre modale à 4 sous-écrans imbriquée dans une fenêtre ERIP.** C'est la cible de la réduction.

Le modèle de sortie existe déjà : `htmlBilanPreparer()` (module « Analyser ma candidature ») = **une seule page qui se déplie** (`<details class="bloc-depli">`), avec les briques génériques `obtenirOuDeposerTexteCV(cb)` (dépôt léger + repli modale seulement pour scan/photo), `bilanDemanderRelectureCv()` (relecture/masquage), `bilanCorpsCiblageOffreHTML()` (bloc entreprise/offre/type de structure). Voir `docs/CHANTIER_PAGES_PREPARER_MODULES.md`.

---

## 8. Ce qui est partagé vs ce qui diverge

| Élément | `nouveau` | `pret` | `maj` |
|---|---|---|---|
| Page d'intro | aucune | aucune | aucune |
| Fenêtre modale de dépôt | non | oui (4 sous-écrans) | oui (4 sous-écrans) |
| Round-trip `extraction-cv.md` | non | oui | oui |
| `dossier.cvAnalyse` | `false` | `true` | `true` |
| Étapes Expérience / Actions / Environnement / Attentes | oui | sautées | sautées |
| « Mon projet » | 6 blocs | 3 blocs (`modeAllege`) | 6 blocs |
| Éditeur structuré par champ | oui | non | oui |
| Blocs de questionnaire « Faire le point » | oui | non | non (`afficherBlocsQuestionnaire` = `nouveau` seulement) |
| Carte CV sur « Action » | active | grisée | active |
| Lettre sur « Action » | après CV terminé | d'emblée | après CV terminé |
| Document par défaut | `cv` | `lettre` | `cv` |
| Prompt lettre utilisé | `lettre.md` | `lettre.md` | `lettre.md` |

---

## 9. Fichiers et fonctions concernés par la refonte

| Fichier | Éléments |
|---|---|
| `js/app.js` | `pageChoixCV` `:3986`, `ETAPES` `:3168`, `afficherProgression` `:3181`, `routes` `:3249`, `naviguerVers` `:3308`, `barreNavigation` `:3585`, `pageObjectif` `:4331`, `pageCartes` `:4360`, `pageActivites/Actions/Environnement/Valeurs`, `pageProjet` `:6371`, `pageRevelation` `:8492`, `pageResultats` `:11926`, `texteProfil` `:19222`, `texteProfilEffectif` `:19673`, `ouvrirFenetreAssistantIA` `:19037`, `htmlBilanPreparer` (référence à réutiliser). |
| `data/metiers.js` | `ouvrirCarteAccueil` `:3446` (CONFIG `mesdocuments`), `ouvrirAssistantDepotCV` `:1689` (**ne jamais modifier**), `obtenirDefinitionEtape` `:2288`, `obtenirOuDeposerTexteCV` `:2501`, `structurerTexteExistant` `:2519`, `assurerCVStructure` `:2547`, `pageCoLettre` `:3177` / `ouvrirDepotLettreV1` `:3164` (pour le lien vers l'autre lettre). |
| `css/style.css` | classes `.progression-etapes` / `.etape`, styles de `pageProjet`, styles en dur inline à sortir en jetons. |
| `docs/` (neuf) | maquette(s) de référence. |

---

## 10. Écarts par rapport au standard des modules récents

D'après `docs/LANGAGE_VISUEL_COMMUN.md` :

1. **Pas de page d'introduction** (patron `htmlBilanIntro` : accroche → à quoi ça sert → ce qui va se passer → ce que ça ne fait pas → et ensuite → Mes Repères → « quelle que soit la forme du CV » → bon à savoir / disquette).
2. **Pas de bouton permanent « Revoir la présentation » ⇆ « Revenir à mon travail »** (D5b).
3. **Pas de bandeau « Continuer / Recommencer »** sur une page d'accueil de module (D5d) — pourtant la règle dit « vaut pour tout module qui reçoit un CV ».
4. **Barre d'étapes à l'ancienne** : 9 repères, labels emoji bruts et incohérents, métaphores mêlées. Standard : 5-6 étapes, paires `{label, icône}`, vocabulaire partagé (Préparer / Assistant / Réponse / …), pastille courante + halo, chevrons.
5. **Fenêtre modale imbriquée** au lieu d'une page dépliante (`htmlBilanPreparer`).
6. **Styles en dur** (`background:white`, `#E5E7EB`, `#1F2937`, `#fff8e6`…) au lieu de jetons `var(--…)` clair + sombre.
7. **Vit dans `js/app.js`** (~30 500 lignes) + `data/metiers.js`, pas dans un dossier `modules/`, non couvert par les tests Node.

---

## 11. Cahier des charges des pages d'intro (clarification Denis, 2026-09-01)

À faire figurer sur les pages d'introduction :

- **Créer un nouveau CV** : construction depuis zéro, on part d'une page blanche, parcours guidé complet ; débouche ensuite sur lettre + entretien.
- **J'ai déjà un CV** : le CV est **repris tel quel, aucune retouche** ; ce chemin sert surtout à produire la **lettre de motivation intégrée** — dire en une phrase simple qu'elle est différente de « Co-construire ma lettre » de l'accueil, et pourquoi (ici : à partir du contenu du CV et de la stratégie ; là-bas : phrase par phrase, en dialogue).
- **Mettre à jour mon CV** : « on repart de ce que vous avez déjà, pas d'une page blanche » ; deux fonctions, **récupérer** les données existantes **et les corriger** ; on entre à une étape avancée du parcours (préparer la personne à ne pas retrouver le tout début).
- **Sur la carte elle-même** (avant l'intro) : les 3 libellés + descriptions doivent déjà trancher, ou chaque intro doit offrir une porte de sortie (« ce n'est pas ce que vous cherchiez ? → l'autre parcours »).

---

## 12. Questions ouvertes avant la maquette (Phase 1)

1. **Sur quel mode bâtir la maquette de référence ?** Proposition : « J'ai déjà un CV » (le plus simple structurellement, et celui où la réduction de fenêtres mord le plus). « Mettre à jour » en devient un delta, « Créer » hérite du patron d'intro + nettoyage de la barre d'étapes.
2. **Fusionner avec le chantier `CHANTIER_PAGES_PREPARER_MODULES.md`** (qui prévoit déjà la page dépliante pour Lettre / Entretien / Cohérence) ou chantier distinct qui en réutilise les briques ?
3. **La barre d'étapes** : on la refait au vocabulaire commun dans le même passage, ou plus tard (risque : intro neuve + barre datée = demi-mesure) ?
4. **`ouvrirAssistantDepotCV` reste intouchée** : on remplace seulement son *appel* par la page dépliante pour le cas texte/copier-coller, modale conservée en repli scan/photo. À confirmer.
5. **Le mode `maj` reste-t-il une tuile distincte**, ou fusion « J'ai déjà un CV » + une case « je veux aussi corriger le contenu » sur l'intro ?
