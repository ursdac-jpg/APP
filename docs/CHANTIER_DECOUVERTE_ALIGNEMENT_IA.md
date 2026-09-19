# Chantier "aligner Découverte sur le parcours normal" — TERMINÉ (2026-08-06)

Les 2 volets (nouveau look 3 lignes + écran tampon avant l'IA) sont codés et
testés en direct dans le navigateur (décompte, popup bloqué par le
navigateur, ouverture réelle simulée, retour manuel, activation du rond bleu
de collage, message d'erreur d'import). Non-régression vérifiée côté
`js/app.js` : les 4 éléments sortis en portée globale
(`ASSISTANTS_SANS_COMPTE_IA`, `ETAPES_DETAIL_CHOIX_IA`,
`lignePastillesAssistantsIA()`, `htmlBanniereTransitionIA()`) ne laissent
aucune déclaration locale dupliquée, et sont appelés à l'identique par
`accordeonChoixIA`/`accordeonImportIA` (page Action). Détail ci-dessous
conservé tel quel comme référence du travail réalisé.

Contexte : le parcours "Découverte de compétences" (`modules/decouverte-competences/decouverteParcours.js`)
a son propre écran "Choisissez votre assistant IA" (screenshot fourni par l'utilisateur le
2026-08-06, voir capture jointe à la conversation d'origine) qui ressemble à l'ANCIENNE version
de l'écran équivalent du parcours normal (page "Passons à l'action") — celle d'AVANT les 2
chantiers récents (`docs/CHANTIER_ECRAN_TAMPON_IA.md` et
`docs/CHANTIER_MAQUETTES_POST_IMPORT.md`, tous deux terminés et commités). Découverte n'a
bénéficié d'AUCUN des deux : ni le nouveau look (3 lignes sans compte/avec compte/étapes), ni le
mécanisme "écran tampon" (décompte, "Je suis de retour", repli si le navigateur bloque
l'ouverture). L'utilisateur veut les deux, portés sur Découverte, dans une session dédiée.

**Aucun code n'a été écrit pour ce chantier.** Un bug RÉEL et SANS RAPPORT a été découvert et
corrigé en cours de route (voir tout en bas, "Bug corrigé au passage") — à connaître avant de
commencer, il explique pourquoi le collage de Découverte se comporte différemment aujourd'hui
de ce qu'il faisait avant cette session.

## 1. Écran "Choisissez votre assistant IA" de Découverte

Fonction `etapeChoixAssistant()`, `modules/decouverte-competences/decouverteParcours.js`
(~ligne 970-1056, à re-vérifier avant de coder si le fichier a bougé). Construit un objet
`{ titre, contenuHTML, masquerContinuer, onAfficher }` consommé par `afficherEtape(numero)`
(fonction interne à `ouvrirDecouverteCompetences()`, ~ligne 218 — reconstruit ENTIÈREMENT
`fenetre.innerHTML` à chaque étape, exactement comme `pageResultats()` reconstruit `app.innerHTML`
dans le parcours normal — même logique de re-rendu complet, juste un autre conteneur).

**contenuHTML actuel** (~ligne 974-992) : 2 colonnes flex — colonne gauche 200px avec la liste
numérotée 1-2-3-4 (`styleMiniAnimationDecouverte` + `.mini-anim-etape`), colonne droite bloc bleu
avec les 5 pastilles `ASSISTANTS_IA` via `data-assistant-decouverte="{id}"`.

**Cible** : reproduire EXACTEMENT la disposition de `accordeonChoixIA` dans `js/app.js`
(~ligne 10048-10070 au 2026-08-06) — 3 lignes horizontales :
1. "Sans compte" (gras) + pastilles ChatGPT/Perplexity, fond vert clair (`#DCFCE7`/`#86E0B0`/
   `#14532D`).
2. "Compte nécessaire" (gras) + pastilles Claude/Gemini/Mistral, fond bleu clair (`#EFF6FF`/
   `#BFDBFE`/`#1E3A5F`).
3. "Ce qui va se passer" + 4 pastilles numérotées (Copie/Propositions/Stratégie/Votre choix),
   avec panneau de détail PARTAGÉ en dessous (un seul texte affiché à la fois, mis à jour au
   clic — jamais un bloc par pastille).
Plus l'encart confidentialité ("Votre nom, adresse et coordonnées ne sont jamais transmis à
l'IA") et le lien vidéo `htmlDeclencheurDemoVideo('export-ia-texte')`, déjà présents ailleurs.

### Piège de réutilisabilité à régler EN PREMIER

`ASSISTANTS_SANS_COMPTE_IA`, `ETAPES_DETAIL_CHOIX_IA` et la fonction
`lignePastillesAssistantsIA()` sont déclarés **à l'intérieur de `pageResultats()`** (`js/app.js`,
juste avant `accordeonChoixIA`) — donc **invisibles depuis `decouverteParcours.js`**, un fichier
chargé séparément. Deux options :
- **Recommandé** : sortir ces 3 déclarations de `pageResultats()` vers la portée globale de
  `js/app.js` (à côté de `ASSISTANTS_IA`, ~ligne 11800+ au 2026-08-06) — une seule source de
  vérité pour les 2 parcours, jamais de divergence possible entre eux.
- Alternative (plus rapide mais moins propre) : dupliquer ces 3 déclarations dans
  `decouverteParcours.js`.

Le HTML lui-même (structure des 3 lignes) devra être dupliqué/adapté côté Découverte de toute
façon (fonctions de rendu différentes, `data-assistant-decouverte` au lieu de `data-assistant`),
mais le CONTENU (liste sans compte, textes des 4 étapes) ne doit jamais être ressaisi séparément.

### Comportement des 2 types de clic (à garder identique à l'esprit du parcours normal)

- Clic sur une **pastille IA** (`data-assistant-decouverte`) : continue de faire ce qu'il fait
  déjà aujourd'hui pour l'instant (copie + `window.open()`), MAIS voir section 2 ci-dessous —
  c'est justement ce qui doit changer avec l'écran tampon.
- Clic sur une **pastille étape (1-4)** : affiche son explication dans un panneau de détail
  partagé sous la ligne, aucune action — copier le mécanisme JS de `js/app.js`
  (`.pastille-etape-choixia`, wiring dans `brancherEvenementsResultats()`, ~ligne 11250).

## 2. Étape "Collez la réponse" de Découverte — mécanisme écran tampon manquant

Fonction `etapeCollerReponse()` (~ligne 1061-1130). Aujourd'hui, le clic sur une pastille IA
(dans `etapeChoixAssistant().onAfficher`, ~ligne 994-1053) fait, dans cet ordre : copie
presse-papiers → `window.open(assistant.url, '_blank')` **immédiatement** → `afficherEtape(5)`.

**Aucun** des éléments du chantier "écran tampon avant l'IA" n'existe ici :
- Pas de décompte avant l'ouverture.
- Pas de bouton "Je suis de retour" (manuel, jamais de détection automatique — règle du
  chantier précédent à respecter aussi ici).
- Pas de repli si le navigateur bloque l'ouverture automatique (`window.open()` non déclenché
  par un clic direct est bloqué silencieusement par les navigateurs modernes — bien confirmé
  lors du chantier précédent, voir `docs/CHANTIER_ECRAN_TAMPON_IA.md`).
- Le rond bleu de collage (`btnCollerAutoDecouverte`, dans `htmlCollageInstantane('Decouverte', ...)`,
  déjà appelé ~ligne 1067) n'a pas d'état désactivé/activé selon la phase.

### Pièces DÉJÀ globales et directement réutilisables telles quelles

- `_etatTransitionIA` / `_intervalleDecompteIA` (`js/app.js`, déclarés en portée globale,
  ~ligne 8028-8043) — accessibles tels quels depuis `decouverteParcours.js` (même `window`,
  scripts classiques). Structure : `{ urlAssistant, nomAssistant, phase, secondesRestantes }`,
  phases `'decompte' → 'ouvert' → 'bloque' → 'revenu'`.
- `installerEcouteurVisibiliteRetourIA()` (`js/app.js`, ~ligne 8028+) — écouteur GLOBAL déjà
  installé une seule fois au chargement de la page, qui intensifie le pulse de
  `#btnJeSuisDeRetourIA` si `_etatTransitionIA.phase === 'ouvert'` au retour de visibilité de
  l'onglet. **Si Découverte réutilise le MÊME id `btnJeSuisDeRetourIA`**, ce mécanisme
  fonctionne automatiquement, aucun code supplémentaire à écrire pour ça. Sinon, prévoir un id
  dédié et adapter cet écouteur pour qu'il en tienne compte aussi.
- `activerCollageInstantane()` / `htmlCollageInstantane()` (`js/app.js`, ~ligne 1393+) — déjà
  utilisées par Découverte (`htmlCollageInstantane('Decouverte', ...)`, ~ligne 1067). Le rond
  bleu compact (confirmation sans texte brut) vs le mode manuel (pastille "Coller manuellement")
  fonctionnent maintenant automatiquement pour Découverte aussi (voir bug corrigé ci-dessous) —
  reste à ajouter la logique désactivé/activé du rond bleu selon `_etatTransitionIA.phase`
  (s'inspirer du bloc dédié à `btnCollerAutoActionIA` dans `brancherEvenementsResultats()`,
  `js/app.js`, ~ligne 11416-11470).

### Ce qu'il reste à construire spécifiquement pour Découverte

- Une fonction équivalente à `htmlBanniereTransitionIA()` (`js/app.js`, ~ligne 9988-10022) —
  soit réutilisée telle quelle si l'architecture le permet, soit adaptée à l'intérieur de
  `etapeCollerReponse()` (son `contenuHTML` doit intégrer la bannière décompte/ouvert/bloqué,
  au-dessus du rond bleu).
- Repousser `window.open()` : au lieu de l'appeler immédiatement au clic sur une pastille IA
  (dans `etapeChoixAssistant()`), stocker `_etatTransitionIA = { urlAssistant, nomAssistant,
  phase: 'decompte', secondesRestantes: 5 }` puis `afficherEtape(5)` directement (pas de
  `window.open()` à ce stade) — c'est `etapeCollerReponse()` (étape 5) qui doit ensuite gérer le
  décompte et déclencher l'ouverture réelle, sur le modèle de `brancherEvenementsResultats()`
  (`js/app.js`, ~ligne 11416-11470, bloc `if (_etatTransitionIA && btnCollerAutoActionIA) {...}`).
- **Attention** : `afficherEtape(5)` reconstruit `fenetre.innerHTML` à CHAQUE appel (voir plus
  haut) — le décompte doit donc, comme côté page Action, être coupé systématiquement en début
  de rendu (`clearInterval`) puis redémarré seulement si les conditions sont toujours réunies,
  jamais laissé tourner en fond après un changement d'étape. S'inspirer de
  `brancherEvenementsResultats()` qui fait exactement ça en tout début de fonction.

### Ne JAMAIS changer (spécifique à Découverte, différent du parcours normal)

La construction du texte à copier (~ligne 999-1021) est PROPRE à Découverte
(`promptsExternesCharges.decouverte`/`promptParDefaut('decouverte')` + contexte métier visé +
`etat.recit`) — **rien à voir** avec `promptCache(type, texteProfilEffectif(type))` du parcours
normal. Ce chantier ne doit toucher qu'au TIMING de `window.open()` et à l'habillage
décompte/retour autour, jamais à la construction du texte copié.

## Bug corrigé au passage (2026-08-06, sans rapport avec ce chantier mais à connaître)

En construisant le chantier précédent (`docs/CHANTIER_MAQUETTES_POST_IMPORT.md`), une
régression a été introduite puis corrigée le même jour : `activerCollageInstantane()` exigeait
initialement des clés de config explicites (`idZoneSucces`/`idZoneActions`) pour afficher la
confirmation compacte et la zone d'actions (bouton "Importer" y compris) — Découverte, appelant
déjà existant de ce composant partagé, ne les fournissait pas, donc son bouton "Importer"
disparaissait purement et simplement après un collage réussi. Corrigé en dérivant ces ids
AUTOMATIQUEMENT du même suffixe que `btnAjouterMorceau` (déjà dérivé ainsi) plutôt qu'en les
exigeant en config — voir `activerCollageInstantane()`, `js/app.js`, ~ligne 1401-1419. Aucune
action requise pour ce chantier-ci, juste une explication si ce comportement (rond bleu compact
au lieu du texte toujours visible) surprend en reprenant Découverte.

## Règles à respecter en codant ce chantier

- Jamais de tiret long (—) dans aucun texte visible.
- Jamais de détection automatique (`visibilitychange`/`focus`) pour DÉCLENCHER une action —
  seule l'intensité du pulse peut en dépendre (décision explicite du chantier précédent, non
  renégociable sans redemander à l'utilisateur).
- Non-régression stricte sur `activerCollageInstantane()`/`htmlCollageInstantane()` — Découverte
  ET la page Action partagent ce composant, toute modification doit être vérifiée sur les DEUX
  parcours avant de considérer le chantier terminé.
- Tester en conditions réelles dans le navigateur (décompte, popup bloqué, retour manuel,
  collage) avant de considérer ce chantier terminé, comme pour tout le reste de l'application.
