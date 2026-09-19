# Langage visuel commun des modules

> Référence à citer en tête de **toute nouvelle maquette de module** et à respecter dans le code généré.
> Maquette de référence : **`docs/MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html`** (module « Analyser ma candidature », consolidé le 2026-08-30). C'est l'exemple vivant : ouvrir cette maquette avant de dessiner une autre.

## RÈGLE DE PROCESS (Denis, 2026-09-01) : toute maquette de placement est ÉDITABLE

Dès qu'une maquette sert à décider **où** va un élément ou **comment** il est dimensionné,
elle doit permettre à Denis de **déplacer ET redimensionner** les boutons / encarts /
rectangles lui-même (plus long, plus large, autre emplacement), puis afficher la **config
résultante en clair** (zone + alignement + dimensions + marges) que Claude recopie tel quel
dans le vrai code. Emplacements par **zones définies** (pas du drag pixel libre : l'appli est
en flux + flexbox + mobile). Position absolue libre seulement pour un vrai élément flottant,
avec avertissement « règle responsive à ajouter ». Un toolkit réutilisable est à construire
(mémoire `feedback_maquettes_placement_glisser_deposer`).

**But** : chaque module garde une **spécificité graphique** (au minimum sa teinte d'accent), mais les **formes**, les **mécanismes** et le **ton** sont les mêmes partout, pour qu'aucun module ne paraisse plus important ou mieux fini qu'un autre.

---

## 1. Le vocabulaire de formes (non négociable)

| Élément | Règle |
|---|---|
| **Boutons** | Rectangle à **coins arrondis** (`border-radius: 12px` pour les gros, `var(--radius)` pour les petits). **Jamais de bouton rond.** Le bouton d'action principal du moment « pousse » (`.bouton-incitation-action`, pulsation bornée, respecte `prefers-reduced-motion`). |
| **Accordéon** | `<details class="bloc-depli">` : filet gauche coloré selon la valence (`bd-ok` / `bd-warn` / `bd-alert`), fond du `summary` teinté de la même couleur, chevron `::before`. Le corps : `.bloc-depli-corps`. |
| **Encart d'information / de rappel** | Fond teinté (`var(--…-bg-subtle)`) **+ filet gauche accent de 3 px** + une icône objet. Jamais un pavé de gris plat, jamais du `text-muted small` isolé pour une consigne importante. |
| **Verdict / statut** | Pastille **dessinée** (`.pastille-verdict` : `v-ok` / `v-warn` / `v-alert`). **Jamais un émoji rond** 🟢🟡🔴. Les pilules d'état (« Déposé », « À valider »…) : `border-radius: 999px`, petite, à droite du `summary`. |
| **Numéro d'étape** | Rond plein accent, chiffre blanc (`.preparer-num` / `.num-sec` / `.rond`). |
| **Décompte** | « hero » : gros chiffre dans un rond accent + une **piste qui se vide** sous le texte (animation linéaire, `prefers-reduced-motion`). |
| **Jetons de choix** | `border-radius: 999px`, bord + texte teinte de groupe, l'actif est plein. |

## 2. Icônes

- **Un objet ou un symbole concret**, jamais un visage / des yeux / des traits / un cerveau / un émoji d'expression. Silhouette neutre `👤` tolérée.
- **Icône = un sujet à lire.** **Numéro = une étape à faire.** Ne pas mélanger les deux rôles.
- Jamais le mot « IA » visible, jamais d'icône « tête de robot ». Dire « l'assistant en ligne ».

## 3. Couleur et thème

- **Toujours des jetons `var(--…)`**, jamais de hex en dur. Toute couleur a sa valeur claire **et** sombre (`[data-theme="sombre"]`).
- **Spécificité du module = sa teinte `--accent`** (le mécanisme existe déjà dans `css/style.css`, plusieurs `--accent` par contexte). Tout le reste (success / warning / alert / bordures / surfaces) est partagé.
- Rouge dramatique proscrit pour un simple « à revoir » : utiliser `--alert` / `--alert-bg` (rouge brique doux) ou l'ambre `--warning-*`.

## 4. Ton (public en fragilité numérique, confiance en soi fragile)

- Français impeccable, accents partout, **jamais de tiret cadratin ni de demi-cadratin**.
- Phrases courtes et rassurantes. Jamais poser de diagnostic sur la personne.
- « Zéro régression » = **fonctionnel** : aucune fonction / bouton / info de prompt perdu quand on refait le visuel.
- Nommer ce qui se passe **avant** que ça se passe (« Au clic : … », « cette page reste ouverte »).

## 5. Patron « page d'introduction de module »

Ordre des sections (patron `ctHtmlExplication()` / `htmlBilanIntro()`) :
accroche rassurante → « À quoi ça sert » → « Ce qui va se passer » → « Ce que ce module ne fait pas » → « Ce que vous pourrez faire ensuite » → **Mes Repères** → « quelle que soit la forme du CV » (si import) → « Comment ça se passe » → « Bon à savoir » (disquette / rien n'est conservé).

Chaque page d'intro de module devrait couvrir **à peu près la même quantité d'information** que celle d'« Analyser ma candidature » (voir chantier « Équilibrer les pages d'introduction des modules », `TACHES_VALIDEES.md`).

### 5bis. Comportements de navigation et d'état (OBLIGATOIRES, Denis 2026-08-30)

**Implémentation de référence depuis le 2026-09-01 : « Cohérence de mon dossier »** (`modules/coherence-transversale/ui.js`, `ctHtmlBandeReprise()`, `_ctVoirIntro` / `_ctReprisePendante`). Le Bilan (`D5a`..`D5d`) a la version antérieure. **Tout module remodelé, retravaillé ou créé à partir de maintenant reprend ce comportement, ces boutons et ces options à l'identique** (décision Denis 2026-09-01). Seule exception connue : les parcours de « Mes documents ».

**Deux familles de modules (Denis 2026-09-01), à trancher pour chaque module futur :**
- **Famille 1 — espace perso / consultation** (Mes Repères, Mon Carnet, Lexique, Se tenir informé) : **bouton « Revoir la présentation » + note, rien de plus.** Aucun encart « Continuer / Recommencer », aucun gel — rien n'est « une analyse en cours » qu'on pourrait perdre.
- **Famille 2 — analyse / dépôt de documents** (Analyser ma candidature, Cohérence, Découvrir mes compétences, Comparer mes pistes, Co-construire ma lettre, Préparer un entretien, ATS, Regard recruteur) : bouton + note **+ encart « Continuer / Recommencer » + gel + pulse** sur la reprise.

Le gel laisse **toujours** l'encart cliquable et **ne gèle jamais « Retour » / « Accueil »** (la personne peut fuir sans choisir ; elle retrouvera la question au passage suivant).

**Briques à réutiliser, jamais recopier :** `htmlBoutonRevoirModule(id, logoModule, libelle, surPresentation)` (`js/app.js`) = pilule partagée + note 1re fois (une par personne, `aps_note_revoir_module_vue`, refermable, croix au coin haut droit d'un rectangle compact ; `surPresentation` inverse le texte). CSS partagé (`css/style.css`) : `.btn-revoir-module`, `.bloc-revoir-module` (marge `-28px` / `-8px` : calé au niveau des 3 icônes fixes, jamais dans le flux), `.note-revoir-module`, `.encart-reprise-module` + `.encart-reprise-module-boutons`, `.btn-recommencer-module` (fond saumon, jamais rouge), `.encart-reprise-module-pulse` (≈10 s), gel `.ct-gel-actif > *:not(...)`.

1. **« Retour » ne saute jamais l'intro.** Écran de travail → « Retour » ramène à la **page d'introduction du module**, jamais droit à l'accueil. Seule l'intro elle-même renvoie « Retour » vers la vraie page précédente.
2. **Bouton permanent, même place / forme / libellé partout** (seule l'icône = logo du module change). Écran de travail : « Revoir la présentation » (ouvre l'intro en **détour non destructif**). Intro en détour : « Revenir au module » (retour exact à l'écran quitté ; **jamais le mot « travail »** = rémunération). Triple retour : ce bouton **+** le CTA du bas **+** le « Retour » de la barre. Le texte de la note d'aide s'adapte au sens du bouton.
3. **Distinguer deux détours.** *Consultation* (`_xxxVoirIntro` : clic « Revoir la présentation » depuis un écran de travail) → intro affichée par-dessus, **pas d'encart**. *Reprise* (`_xxxReprisePendante` : retour dans le module depuis l'accueil / un autre module, analyse engagée) → on atterrit **au dernier endroit**, **encart « Continuer / Recommencer » à droite** du bouton (même bande, jamais empilé), texte au-dessus des deux boutons, « Recommencer » **fond saumon** (confirmation qui nomme ce qui part, rappelle que Mes Repères / Mon Carnet ne bougent pas, pas d'annulation), encart qui **pulse ≈10 s**, module **gelé** jusqu'au choix ; sans encart le titre remonte. Encart réservé aux modules qui reçoivent un CV / une lettre / une préparation d'entretien ; les espaces perso (Carnet, Lexique, Repères) n'ont que le bouton + la note.

---

## État du bouton partagé + reprise (chantier "bouton présentation", 2026-09-01)

| Module | Bouton « Revoir la présentation » + note adaptée | Encart « Continuer / Recommencer » + gel + pulse |
|---|---|---|
| Cohérence de mon dossier | ✅ `ctHtmlBandeReprise` (référence) | ✅ `_ctReprisePendante` |
| Analyser ma candidature (Bilan) | ✅ `bilanBoutonRevoirPresentation` | ✅ `_etatBilan.reprisePendante` (aligné sur Cohérence 2026-09-01) |
| Découvrir mes compétences | ✅ | ✅ `_decouverteReprisePendante` |
| Comparer mes pistes | ✅ | ✅ `_comparerReprisePendante` |
| Mon Carnet / Lexique / Mes Repères / Se tenir informé (Comprendre le cadre) | ✅ (famille 1) | ❌ pas d'analyse — normal |
| Co-construire ma lettre / Préparer un entretien | 🟡 bandeau de reprise `_introBlocReprise` sur la présentation (cascade de fenêtres : pas d'écran de travail routé pour le bouton flip). Bouton flip complet = à la conversion en écrans routés (chantier séparé). | 🟡 « Continuer / Recommencer » sur la présentation |
| ATS / Regard recruteur | ⏳ câblé dans `htmlPageIntroModuleParcours` (`config.detour` / `config.ctaMasque`), invisible tant que le module n'a pas d'écran de travail | ⏳ idem |

Briques : `htmlBoutonRevoirModule`, `htmlEncartRepriseModule`, `htmlBandeRepriseModule`, `armerFinPulseEncartReprise`, `appliquerGelModule` (`js/app.js`) ; `htmlPageIntroModuleParcours` + `config.detour` (`data/metiers.js`) ; `_introBlocReprise` (`data/metiers.js`).

---

## État des maquettes de référence

| Module | Maquette HTML | Page d'intro implémentée dans le code ? |
|---|---|---|
| **Analyser ma candidature** | ✅ `MAQUETTE_BILAN_PARCOURS_CONSOLIDE_2026-08-29.html` | ✅ (`htmlBilanIntro`, patron de référence) |
| **Cohérence de mon dossier** | ❌ briefs texte seulement | ✅ (`ctHtmlExplication`, équilibrée le 2026-08-30) |
| **Repères** | ❌ wireframes texte (`MAQUETTE_REPERES_WIREFRAMES.md`) | ✅ (équilibrée le 2026-08-30) |
| **Mon Carnet** | ✅ `MAQUETTE_INTRO_CARNET.html` | ✅ `_carnetRenduIntro` (2026-08-31) |
| **Lexique** | ✅ `MAQUETTE_INTRO_LEXIQUE.html` | ✅ `_lexiqueRenduIntro` (2026-08-31) |
| **Co-construire ma lettre** | ✅ `MAQUETTE_INTRO_LETTRE.html` | ✅ fenêtre ERIP défilante (`ouvrirIntroModuleParcours`, 2026-08-31) |
| **Préparer un entretien** | ✅ `MAQUETTE_INTRO_ENTRETIEN.html` | ✅ fenêtre ERIP défilante (2026-08-31) |
| **Découvrir mes compétences** | ✅ `MAQUETTE_INTRO_DECOUVERTE.html` + proposition de parcours consolidé (`CONSOLIDATION_DECOUVERTE_PROPOSITION_2026-08-31.md`) | ❌ pas encore (proposition à valider) |
| **ATS** (module non construit) | ✅ `MAQUETTE_INTRO_ATS.html` (validée 2026-08-31, bouton d'entrée désactivé) | ❌ module pas construit |
| **Regard recruteur** (module non construit) | ✅ `MAQUETTE_INTRO_REGARD_RECRUTEUR.html` (validée 2026-08-31, bouton d'entrée désactivé) | ❌ module pas construit |
| **Se tenir informé** (module non construit) | ✅ `MAQUETTE_INTRO_SE_TENIR_INFORME.html` (validée 2026-08-31, bouton d'entrée désactivé) | ❌ module pas construit |
| **Comparer mes pistes** (aide à la décision d'orientation) | ✅ intro `MAQUETTE_INTRO_AIDE_DECISION.html` + flux `MAQUETTE_COMPARER_PISTES_FLUX_2026-08-31.html` (v8) | ✅ implémenté 2026-09-01 (`pageIntroAideDecision` + `modules/comparer-pistes/index.js`, route `comparer-pistes`, CTA actif) |

Les 3 dernières lignes : maquettes de page de présentation faites **avant** le module, pour préparer
l'organisation de la page d'accueil. Chacune porte, en tête de fichier, ses exigences fonctionnelles
à reprendre le jour où le module sera construit (détection de triche pour l'ATS, avis sur les couleurs
de l'entreprise pour Regard recruteur, fichier texte de base maintenu mensuellement pour Se tenir informé).

Deux formes d'implémentation, selon la nature du module :
- **module = page routée** (Carnet, Lexique, Bilan, Cohérence, Repères) : la présentation est un
  écran rendu par la fonction de page, affiché à l'entrée par la tuile Boîte à outils, sauté sur
  les liens profonds / la reprise en cours.
- **module = cascade de fenêtres** (Lettre, Entretien) : la présentation est rendue dans une
  fenêtre ERIP défilante via `ouvrirIntroModuleParcours()` + `_introBloc*()` (`data/metiers.js`),
  affichée seulement quand l'appelant passe `{ avecIntro: true }` (tuile Boîte à outils).

Reste à faire : les maquettes HTML de référence pour Cohérence et Repères (retrofit, pas urgent) ;
l'implémentation du parcours Découverte consolidé (proposition écrite, à valider par Denis).
