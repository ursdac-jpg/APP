# Chantier « Bouton Revoir la présentation / Reprendre mon parcours »

> **CLOS le 2026-09-01.** Full pattern (bouton flip + note adaptée + encart
> Continuer/Recommencer saumon + gel + pulse) sur Cohérence (référence), Bilan,
> Découvrir mes compétences, Comparer mes pistes. Bouton + note seul sur Carnet,
> Lexique, Mes Repères. `_introBlocReprise` sur Co-construire ma lettre et
> Préparer un entretien. Câblé mais invisible (pas d'écran de travail) sur ATS,
> Regard recruteur, Se tenir informé. Jamais touché : parcours « Mes documents ».
> Voir le tableau d'état dans `LANGAGE_VISUEL_COMMUN.md`.

> Créé le 2026-09-01, détaché du chantier « Réorganisation de la page d'accueil »
> (c'était son point 12). **Décisions figées le 2026-09-01** (maquette validée :
> `docs/MAQUETTE_BOUTON_PRESENTATION_ET_SESSION_2026-09-01.html`, v3).
> Denis a validé l'implémentation. **Coordination à vérifier** : un second
> compte Claude travaille en parallèle sur le code (refonte « Mes documents »,
> module « Comparer mes pistes ») ; ce chantier touche beaucoup de fichiers
> partagés (`js/app.js`, `data/metiers.js`, `css/style.css`, plusieurs
> `modules/`). Ne pas démarrer les gros blocs sans savoir ce que l'autre
> fenêtre édite.

---

## Le besoin (mots de Denis, 2026-09-01)

Dans **chaque module** : un bouton **au même endroit, même libellé, même
design, même nom**. Seule l'**icône à l'intérieur change** : c'est le logo du
module (accent, cohérent avec le sweep LECONS 9.9).

1. **Depuis un écran de travail** : « Revoir la présentation » ramène à la page
   de présentation du module (détour **non destructif**).
2. **Sur la présentation** : le même bouton dit « Revenir à mon travail » et
   ramène exactement là où on en était.

Référence à copier, jamais réinventer : module **Bilan**, commits `D5a`..`D5d`
(`bilanBoutonRevoirPresentation()`, drapeau `_etatBilan.voirIntro`). Repères a
une variante (`bouton-revoir-explication`).

---

## Décisions figées (2026-09-01, maquette v3)

### A. Placement du bouton du module

- **En haut à gauche**, mais dans une **ligne d'en-tête du module à lui**,
  calquée sur ce que Mes Repères fait déjà (`.reperes-entete-ecran` +
  `.bouton-revoir-explication`, `modules/reperes/reperes.css` : `display:flex;
  justify-content:space-between`, le bouton en 1er enfant avec `margin-left:150px`
  pour dégager les 3 icônes fixes du coin).
- **À droite de cette ligne** : l'action propre au module quand elle existe
  (ex. « + Garder une réflexion » de Repères, qui occupe déjà ce coin).
- Le bouton du module = **pilule à fond + contour d'accent, logo du module
  dedans** → visuellement distinct des carrés gris des réglages.
- **Petite note la première fois** (une par personne, refermable) :
  « Ce bouton vous ramène à la page qui explique ce module. Vous ne perdez
  rien. »
- **Mobile** : plus de décalage (écran étroit), texte du bouton raccourci
  (« Présentation » / « Mon travail »), action du module raccourcie aussi.

### B. La bande du haut : 3 outils d'appli sur UNE ligne

- Les 3 boutons persistants (réglages, aide, sauvegarde) : **une seule ligne**,
  en haut à gauche, un seul groupe visuel. La raison des 2 lignes (éviter la
  barre de navigation) n'existe plus : elle passe **en bas** et **dans les
  modules seulement**.
- **Le mot « Sauvegarder » de la disquette : retiré partout.** Icône seule,
  toujours, sur toutes les pages et sur mobile. **Annule le point 13 du relais**
  (« le mot Sauvegarder s'affiche sur l'accueil »). Ce qui reste : le pulse de
  la disquette (travail non sauvegardé / après le 2e passage assistant) et le
  message du panneau ; seul le mot à côté de l'icône part. Le `title` /
  `aria-label` « Sauvegarder ma session » reste.
- Code : retirer la bascule `btnSessionTransfert.classList.toggle('avec-mot',
  route === 'cv')` (`js/app.js`, `naviguerVers`), la classe `.btn-session-mot`
  et son media query (`css/style.css`), le `<span class="btn-session-mot">`
  (`index.html`).

### C. Le haut à droite : une règle, pas un espace réservé

> **Haut à droite = les actions propres au module** (0, 1, ou 2 maximum).

- Le « panier de notes » général a été **tranché contre** par Denis le
  2026-08-28 (`IDEES_A_RECLASSER.md`, idée BB) : pas de troisième espace, le
  **Carnet** est le point de capture unique.
- Le seul panier qui existe est celui de **« Comparer mes pistes »**
  (`_comparerPanier`, max 3, transitoire) ; aujourd'hui une **barre fixe**
  « N pistes à comparer », pas un bouton de coin.
- Si un jour un module a besoin d'un vrai « regarder ce que j'ai mis de côté »
  (panier persistant, réviseable, façon panier e-commerce), il devient **un
  bouton en haut à droite avec un compteur/badge**. À décider **module par
  module**, jamais figé d'avance.

### D. « Continuer / Recommencer » (bandeau de la page de présentation)

- Rectangle **pleine largeur**, en tête de la page, **sous le titre**, visible
  seulement quand un travail existe. **Jamais une modale.** Modèle : `D5a`/`D5b`
  du Bilan.
- « Continuer » (plein accent) = reprendre où on en était (= même action que
  « Revenir à mon travail » du bouton en haut).
- « Recommencer » (petit, discret) → efface **ce module seulement**, avec
  fenêtre de confirmation qui nomme ce qui part et rappelle que Mes Repères /
  Mon Carnet ne sont pas touchés. **Pas d'annulation** (asymétrie volontaire
  avec le « Tout effacer » global).
- Déclencheur exact du bandeau : au chargement de la page de présentation dès
  qu'un travail engagé existe (document déposé, fichier ou texte collé, et/ou
  aller-retour assistant déjà fait). Modèle `D5b`.
- Périmètre : tout module qui reçoit un CV / lettre / préparation d'entretien.
  À faire : **Cohérence de mon dossier**, **Découvrir mes compétences** (en
  refonte par ailleurs, coordonner), vérifier Lettre / Entretien.

### E. Refonte de « Réinitialiser / Restaurer »

**Constat** : `htmlActionsSession()` (`js/app.js` ~3215) date des 3 cartes CV.
« Réinitialiser » → `recommencer()` **efface tout** : CV, lettre, entretien,
préférences, **Mes Repères, Mon Carnet**, analyses Bilan / Cohérence / Regard
extérieur, département mémorisé, Découverte. « Restaurer » n'annule qu'une fois.
Bouton rouge toujours visible = danger pour un public à confiance fragile.

**Décision** :

1. **Retirer `Réinitialiser` ET `Restaurer` de l'accueil et des barres de
   parcours** (`htmlActionsSession()` disparaît). Plus rien en haut à droite
   sur l'accueil.
2. **« Recommencer » par module** = le bandeau du point D. Ne touche que ce
   module. Pas d'annulation.
3. **« Tout effacer sur cet appareil »** : une seule action, dans le **panneau
   de la disquette** (`#panneauSessionTransfert`, `index.html`), **zone à part
   en bas** (un filet, un retrait), séparée d'Exporter / Importer.
   - Bouton **pilule à contour, texte + bordure de la même couleur**, en
     **rouge brique** (`--alert`, jamais rouge vif). **Même forme que le bouton
     « Restaurer »** (bleu accent) : les deux occupent le même emplacement, seule
     la couleur change.
   - **Au clic** : fenêtre d'avertissement forte, qui nomme ce qui part (CV,
     lettre, entretien, **Mes Repères, Mon Carnet**, analyses), 3 choix :
     Annuler / **Exporter d'abord** / Tout effacer.
   - **Restauration gardée** (un niveau, snapshot complet écrit avant
     l'effacement). Le bouton « Restaurer » remplace « Tout effacer » à la même
     place tant qu'une sauvegarde de secours existe. Il **disparaît** au premier
     vrai redémarrage (nouveau document importé, ou avancement dans n'importe
     quel module) — même logique qu'aujourd'hui (`effacerSauvegarde` au premier
     engagement).

Fonctions concernées : `reinitialiserSession` / `restaurerSession` /
`recommencer` / `sauvegarderSession` / `sauvegardeExiste` (`js/app.js` ~28773,
~28981) ; `htmlActionsSession` (~3215) ; `initBoutonSessionTransfert` (~30328).

---

## Ordre d'implémentation (du plus contenu au plus large)

1. **[FAIT — `aa999b9`, 2026-09-01] Bande du haut** (point B) : 3 boutons sur
   une ligne (disquette de la 2e ligne à la 1re, `left:128`), mot
   « Sauvegarder » retiré partout (bascule `.avec-mot` supprimée, spans retirés
   d'`index.html`), `--hauteur-progression` plancher 76px, `.progression`
   padding gauche 184px, ordre mobile aligné. 640 tests verts.
2. **[FAIT — `c3ff9fc`, 2026-09-01] Retrait Réinitialiser / Restaurer**
   (point E.1) : `htmlActionsSession()` supprimée, `afficherProgression()` ne
   rend plus que les étapes, CSS mort retiré (`.actions-session`,
   `.btn-session`). Les primitives `reinitialiserSession` / `restaurerSession` /
   `recommencer` / `sauvegarderSession` restent (réutilisées par E.2 et
   `terminerParcours()`).
3. **[FAIT — `9d61980`, `c7337c6`, `558a61d`, `bea25e8`, 2026-09-01] Composant
   partagé + module de référence = Cohérence de mon dossier.**
   - `htmlBoutonRevoirModule(id, logoModule, libelle, surPresentation)`
     (`js/app.js` ~12665) : pilule partagée + note 1re fois (une par personne,
     `aps_note_revoir_module_vue`, refermable), **texte de la note adapté** au
     sens du bouton (`surPresentation` → « vous ramène à l'endroit où vous en
     étiez »).
   - Placement : **calé au niveau des 3 icônes fixes** (`left:20px`), marge
     négative `-28px` (`-8px` dès que `#app` se resserre), **jamais dans le
     flux** — retour Denis : ne doit jamais paraître rattaché à la barre.
   - Cohérence : `_ctVoirIntro` (détour consultation, pas d'encart) vs
     `_ctReprisePendante` (retour dans le module via accueil / autre module).
     Encart **« Continuer / Recommencer » à droite** du bouton, sur la même
     bande (`.bande-reprise-module` / `.encart-reprise-module`), texte
     au-dessus des deux boutons, **« Recommencer » fond saumon**
     (`.btn-recommencer-module`), **pulse ~10 s**, **module gelé**
     (`.ct-gel-actif`) tant que le choix n'est pas fait.
4. **[FAIT — `907edef` (Carnet/Lexique/Repères), `44c660d` (Bilan), 2026-09-01]
   Généralisation.**
   - Carnet / Lexique / Repères : bouton partagé + note adaptée sur la
     présentation vue en détour (« Revenir au module »), CTA du bas et
     « Retour » reviennent à l'écran. Flags `_carnetIntroDetour`,
     `_lexiqueIntroDetour`, `_reperesForcerAccueil` (déjà présent). Pas
     d'encart : ces modules n'ont pas d'analyse.
   - Bilan : bouton partagé + note adaptée sur la présentation en détour, en
     plus du bandeau D5 existant ; bandeau « analyse en cours **sur ce
     module** », « Recommencer » en fond saumon.
   - **En suspens (décision Denis)** : le Bilan garde son flux de reprise
     D5a/D5b — on atterrit sur la **présentation** avec le bandeau, pas sur le
     **dernier écran** avec un encart latéral + gel comme Cohérence. À trancher :
     aligner le Bilan sur le flux Cohérence, ou garder D5a/D5b.
   - **Hors périmètre, jamais touché** : les parcours de « Mes documents »
     (cartes en cours de refonte par ailleurs).
5. **[FAIT — `initBoutonSessionTransfert`, 2026-09-01] « Tout effacer » +
   « Restaurer » dans le panneau disquette** (point E.2) : zone à part, bouton
   rouge brique / bleu même forme, fenêtre d'avertissement 3 choix, restauration
   un niveau.

### Standard pour TOUT module futur (remodelé, retravaillé ou nouveau)

Décision Denis 2026-09-01 : **tout module créé ou refondu à partir de
maintenant reprend ce comportement, ces boutons et ces options à l'identique**,
en réutilisant les briques ci-dessus (jamais recopier). Détail :
`docs/LANGAGE_VISUEL_COMMUN.md` section 5bis. Seule exception connue : les
parcours de « Mes documents ».

Lien obligatoire à l'ouverture : `docs/PAGES_INTRODUCTION_MODULES_RECUEIL.md`,
`docs/IDEES_A_RECLASSER.md`, `docs/BRIQUES_COMMUNES.md`.
