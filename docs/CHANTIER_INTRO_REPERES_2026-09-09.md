# Chantier - Page de présentation de « Mes Repères » au gabarit commun

**Ouvert le 2026-09-09, demande de Denis.** « Beaucoup de contenu, mais la disposition ne le
met pas en avant. C'est la seule intro de module qui fait exception : la remettre au même
gabarit que les autres. »

**Statut : IMPLÉMENTÉ le 2026-09-09** (commit `3696da1`). `npm test` 780 verts. Vérifié
navigateur : 1re visite / détour, clair + sombre + orange, « En savoir plus », dispatch du
bouton. Maquette de référence : `docs/MAQUETTE_INTRO_REPERES_2026-09-09.html`.

**Décisions Denis** : 4 types en grille de cartes (pas accordéons) ; Journal + Regard
Extérieur + Aller plus loin regroupés en un seul bloc.

**Code** : `_reperesRenduAccueil()` (`modules/reperes/index.js`) réécrit sur `.cv-section` +
`<h4>`. `modules/reperes/reperes.css` : ~90 lignes de classes bespoke `.reperes-accueil-*`
retirées (rubrique, grille, carte, carte-large, cartes-larges, carte-sauvegarde, ligne-titre,
ic). Restent : `-entete`, `-accroche`, `-types`, `-type`, `-type-nom`, `-savoir-plus`,
`-detail`, `-zone-cta`. Contenu inchangé, tirets cadratin convertis (règle Denis). Aucune
fonction touchée.

---

## Constat

`_reperesRenduAccueil()` (`modules/reperes/index.js`, ~200 lignes de HTML) a **déjà tout le
contenu** du patron (ordre `LANGAGE_VISUEL_COMMUN` section 5 : accroche → à quoi ça sert → ce
qui va se passer → ce que ce n'est pas → ce que vous pourrez faire ensuite → aller plus loin →
bon à savoir → CTA). Le problème est **purement visuel** : la page utilise un système de
classes bespoke (`.reperes-accueil-*`) qui la fait ressembler à un écran de réglages :

- titres de section en **petit gris majuscule** (`.reperes-accueil-rubrique h2`) — lus comme
  des étiquettes, pas comme des titres ;
- sections sans cadre visible pour certaines (paragraphes nus) ;
- peu de rythme.

Les autres intros (Mon Carnet `_carnetRenduIntro`, Lexique `_lexiqueRenduIntro`, Bilan
`htmlBilanIntro`) utilisent : blocs `.cv-section`, titres `<h4>` + emoji en casse normale,
encarts à fond `--accent-bg-subtle`, rappels à filet gauche accent.

## Proposition (maquette)

**Même habillage que l'intro de Mon Carnet**, contenu inchangé, juste re-rangé :

| Section | Forme |
|---|---|
| En-tête | `<h1>` centré + accroche |
| « On a souvent une pensée… » | `.cv-section` accent, centré |
| 🎯 À quoi ça sert | `.cv-section` + `<h4>` + `<p>` |
| 📋 Ce qui va se passer | `.cv-section` + `<h4>` + `<ul>` (les 3 points) |
| 🏷️ Les quatre types de Repère | `.cv-section` + petite grille 2×2 de cartes (filet accent, nom + icône, « En savoir plus » `<details>`) |
| 🚫 Ce que ce n'est pas | `.cv-section` + `<ul>` |
| ✏️ Ce que vous pourrez faire ensuite | `.cv-section` + `<ul>` |
| 📖 Le Journal de parcours, et pour aller plus loin | `.cv-section` **accent** — regroupe Journal + Regard Extérieur + Aller plus loin (aujourd'hui 3 sections séparées) |
| 💬 Vous en verrez ailleurs aussi | `.cv-section` + `<p>` |
| ✅ Bon à savoir | `.cv-section` + rappel disquette (filet accent) + rappel « rien n'est envoyé » (filet vert) |
| encart multilingue | inchangé (`htmlEncartMultilingue`) |
| CTA | centré, `.btn-primary btn-lg` — « Je commence » / « Je reprends » (inchangé) |
| barre Retour / Accueil | inchangée (`barreNavigation`) |

**Rien de fonctionnel ne bouge** : `data-repere-accueil-continuer`, `data-repere-revenir-module`,
`btnReperesRevenirModule`, `dossier.reperesIntroVue`, le détour (`_reperesForcerAccueil`),
`htmlEncartMultilingue`, la barre du bas. Le chantier = ré-écrire le HTML de
`_reperesRenduAccueil()` sur le gabarit `.cv-section` + nettoyer les `.reperes-accueil-*`
devenus inutiles dans `reperes.css`.

## Points à trancher (Denis)

1. **Les 4 types** : grille de cartes (comme la maquette) ou accordéons `.bloc-depli` (le
   vocabulaire du langage visuel commun) ? La grille est plus compacte ; l'accordéon plie
   les « En savoir plus » entièrement.
2. **Regrouper Journal + Regard Extérieur + Aller plus loin** en un seul bloc (maquette) ou
   les garder en sections distinctes ?
3. Le reste : conforme au gabarit, rien d'autre à décider.

## Suite

Denis valide la maquette (+ les 2 points ci-dessus) → réécriture de `_reperesRenduAccueil()` +
ménage `reperes.css`, `npm test` + navigateur clair/sombre + 1re visite / retour / détour.
