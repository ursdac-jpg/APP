# Chantier - Unification des couleurs de bouton

**Ouvert le 2026-09-09, demande de Denis.** « Si j'ai choisi thématique orange, tout ce qui
est bouton à choisir, à valider, à cliquer, à aller plus loin » suit la couleur du site.
« Tous les boutons retour et accueil des pages et des fenêtres » aussi.

**Statut : IMPLÉMENTÉ le 2026-09-09** (Option A retenue par Denis, commit `1482f97`).
`css/style.css` uniquement. `npm test` 780 verts. Vérifié navigateur : objectif / Carnet /
confirmation Supprimer, en clair + framboise, sombre + orange, sombre + vert. **À relire par
Denis dans l'app.**

**Précision Denis (en cours de route) : on GARDE la forme actuelle des boutons** (rayon,
taille, plein vs contour). On change **seulement la couleur**, qui suit l'accent. Donc :
- `.btn-primary` reste **plein**, couleur → `--accent-solide`.
- `.btn-outline-primary` / `.btn-outline-secondary` restent en **contour transparent**, trait
  et texte → `--accent`, se remplissent de `--accent-solide` au survol (comme avant, mais en
  accent au lieu de gris). Pas de fond teinté au repos.
- `.btn-retour-carte-accueil` : même forme (pilule bordée sur fond carte), couleur → accent.
- **Inchangés** : `.btn-danger`, `.btn-success`, `.btn-famille-*`, `.btn-nav-erip` (déjà fait
  le 2026-09-09), et tout le module Carnet (déjà fait).

**Edge case connu** : si la personne choisit l'accent **vert**, le bouton plein
`--accent-solide` vert (`#15803d`) est proche du vert `--success` en mode clair (`#198754`).
Distinguables mais pas d'un coup d'oeil. Rare (accent vert + écran avec CTA *et* bouton
« j'ai fini »). Accepté comme conséquence de « si je choisis vert, les boutons sont verts ».

---

### Ancien statut

BLOQUÉ sur décision Denis (contraste sombre). Maquette :
`docs/MAQUETTE_BOUTONS_UNIFIES_2026-09-09.html`.

---

## Le système visé (3 familles)

| Famille | Aujourd'hui | Cible | Exemples |
|---|---|---|---|
| **1. CTA principal** (`.btn-primary`, 231 usages) | bleu Bootstrap figé | **plein `--accent`** | « Continuer », « Ouvrir mon Carnet », « Valider », « Enregistrer » |
| **2. Secondaire / navigation** (`.btn-outline-secondary` 246, `.btn-outline-primary` 79, `.btn-retour-carte-accueil`) | gris / bleu Bootstrap | **contour + teinte `--accent`** (jamais plein au repos) | « Retour », « Accueil », « Annuler », « Voir tout mon Carnet », le « Retour » d'une carte de l'accueil |
| **3. Sens fixe - NE BOUGE PAS** | rouge / vert / familles | **inchangé** | « Supprimer » (`--danger`), « Merci bien, j'ai fini » (`--success`), les 4 `.btn-famille-*` |

`barreNavigation` (Retour / Accueil du bas de page) : **déjà fait** le 2026-09-09
(`.btn-nav-erip`, commit `cc86a4d`).

---

## PROBLÈME BLOQUANT : le texte blanc sur `--accent` plein est illisible en sombre

Les valeurs `--accent` du **mode sombre** sont volontairement **claires** (elles doivent se
lire comme texte / bordure sur un fond sombre). Mettre du **texte blanc dessus** donne un
contraste catastrophique.

**Contraste texte blanc sur `--accent` plein** (WCAG : 4.5 pour du texte normal, 3.0 pour un
gros bouton) :

| Couleur | Clair | Sombre |
|---|---|---|
| Bleu | 4.50 (limite) | **3.00** |
| Orange | 3.10 | **2.11** |
| Vert | 5.02 | **1.74** |
| Violet | 5.70 | **2.72** |
| Turquoise | 3.74 | **1.86** |
| Framboise | 6.04 | **2.65** |

→ En sombre, **5 couleurs sur 6 échouent gravement** (texte blanc quasi invisible sur vert et
turquoise).

**Ce n'est pas un problème nouveau** : l'app fait déjà `background: var(--accent); color: #fff`
à ~30 endroits (jetons actifs, pastilles, onglets, `.pref-affichage-groupe button.actif`…),
en sombre aussi. **On le voit tout de suite** : préférences d'affichage, thème sombre, accent
vert → le bouton « Clair » actif a du texte blanc quasi illisible sur vert vif. C'est une
dette latente. La faire suivre à 231 `.btn-primary` la rendrait massive.

---

## Options

### Option A (recommandée) : un jeton `--accent-solide` dédié aux boutons pleins

Ajouter `--accent-solide` / `--accent-solide-hover` (6 couleurs × 2 thèmes) : en **clair** =
`--accent` ; en **sombre** = une version **plus foncée** qui porte du texte blanc proprement
(ex. bleu `#2563eb`, orange `#b45309`, vert `#15803d`, violet `#6d28d9`, turquoise `#0f766e`,
framboise `#9d174d`). Le CTA plein et le survol de la famille 2 utilisent `--accent-solide`.

- *Bénéfice* : le seul fix correct ; règle **aussi** la dette latente des jetons/pastilles
  actifs en sombre si on les migre (passe séparée).
- *Risque / coût* : ~12 lignes de tokens dans `css/style.css` + les variantes
  `[data-daltonien]` à vérifier (2 de plus). Puis le câblage `.btn-primary` /
  `.btn-outline-*` / `.btn-retour-carte-accueil`. Test : chaque module × 6 couleurs × 2
  thèmes (gros mais borné - une passe navigateur méthodique).

### Option B : CTA plein = `--accent` en clair, bleu Bootstrap figé en sombre

- *Bénéfice* : zéro nouveau token.
- *Risque* : incohérence assumée (le CTA ne suit pas la couleur en sombre) - ça vide la
  demande de Denis de la moitié de son sens.

### Option C : pas de CTA plein du tout - tout en contour + teinte accent

- *Bénéfice* : jamais de blanc sur accent, donc jamais de problème de contraste.
- *Risque* : le CTA principal et les boutons secondaires se ressemblent (tous en contour) -
  on perd la hiérarchie « c'est CE bouton qu'il faut cliquer ».

### Option D : CTA plein `--accent`, couleur du texte adaptée par couleur

- *Risque* : logique par couleur, fragile, difficile à maintenir. Écartée.

---

## Recommandation

**Option A.** C'est plus de travail qu'une règle CSS, mais c'est le seul chemin qui donne à
Denis ce qu'il veut (tout suit la couleur, clair ET sombre) sans casser la lisibilité, et
qui au passage assainit une dette existante.

**Découpage proposé** (un commit chacun, test navigateur à chaque) :
1. Jetons `--accent-solide` (6×2 + daltonien) dans `css/style.css`.
2. `.btn-primary` → plein `--accent-solide` (via `--bs-btn-*`).
3. `.btn-outline-primary` + `.btn-outline-secondary` → contour + teinte `--accent`, survol
   `--accent-solide`.
4. `.btn-retour-carte-accueil` → aligné.
5. Passe de test : accueil, Mes documents, Bilan, Cohérence, Comparer, ATS, Regard
   recruteur, Lexique, Carnet, Repères - clair + sombre + 2 couleurs non-bleues.
6. **FAIT le 2026-09-09** : migré les ~34 blocs `fond --accent + texte blanc` vers
   `--accent-solide` (jetons / pastilles / onglets actifs, badges, `.pref-affichage-groupe
   button.actif`, chevrons d'étape, `.jeton.is-actif::before` ✓, `.progression .etape.active`,
   `.decouverte-parcours .carte-choix-icone` active, hovers `.btn-nav-erip` /
   `.carnet-btn-noter` / `.lien-utile-ressource` / `.lexique-urgence-num`, toggles de
   Regard extérieur / Comprendre les chiffres, `.reperes-btn-quickadd`…). `css/style.css`
   (26) + 5 fichiers de modules (8). Laissés tels quels : les barres/pistes décoratives
   (`.transition-piste`, barre de progression de Regard extérieur, `.carnet-couverture-signet`)
   qui ne portent aucun texte. En dark + accent vert, le contraste du texte blanc passe de
   1,74 à 5,0. `npm test` 780, braces équilibrées, vérifié navigateur (préférences dark +
   vert). Commit à la suite.

**À trancher par Denis avant de coder.**
