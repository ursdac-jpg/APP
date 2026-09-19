# Chantier - Refonte visuelle du module Mon Carnet

**Ouvert le 2026-09-09, demande de Denis.** « Le Carnet est un peu vide, visuellement et en information.
Lui apporter un peu plus de richesse, voir s'il y a une répartition à faire. » Concerne **les deux vues** :
la page de présentation du module **et** l'écran de travail + le petit panneau de l'icône persistante.

**Statut** : **IMPLÉMENTÉ le 2026-09-09** (5 blocs, commits `12560dc`..`1005fca`), vérifié au
navigateur **desktop ET mobile (375 px)**, clair + sombre, accents bleu/orange/vert/violet ;
flux complet : intro → ouvrir → créer / modifier / transformer (bouton → neutre + pastille) /
supprimer (confirmation) / panneau (dernière note, aperçus datés, détail) / états vides.
`npm test` 780 verts. Mobile : les 3 boutons d'action s'empilent (flex-wrap), chacun ≥ 44 px,
libellé + icône complets ; aucun débordement horizontal ; panneau à 300 px de large tient.
**À relire par Denis dans l'app.**

**Code touché** : `modules/carnet/carnet.css` (gros du travail) + `modules/carnet/index.js`
(fonctions de rendu + `_carnetDateAffichee` + nouveau `_carnetDateRelative` + nouveau
`_carnetRenduCouverture`). **Rien dans `js/app.js`, rien ailleurs. Aucune logique modifiée.**

**Blocs (un commit chacun)** : 1 `12560dc` carte de note + boutons + date + pastille · 2 `1bd4364`
bouton « + Noter » · 3 `d8317f2` astuce resserrée · 4 `78139f8` couverture + ligne calme ·
5 `1005fca` panneau compact.

**Limite connue, ACCEPTÉE par Denis (2026-09-09)** : couleur de site **violet** ou
**framboise** → le bouton « Transformer en Repère » (violet `--repere-ref`) se distingue peu
de l'accent violet du site. OK fonctionnellement (icône + libellé). Denis : « le violet ne me
gêne pas, laisse comme ça. »

### PÉRIMÈTRE FINAL (Denis, 2026-09-09) : « garde tout ce qui est PROPOSÉ sauf le regroupement par période »

**On implémente** (tout du restyle + les ajouts retenus) :
- Carte de note rhabillée : filet gauche `--accent` + fond papier très léger (`color-mix` accent 5 %)
  + petite icône `bi-journal-text` dans le titre + focus accent sur le champ titre.
- Astuce dictée (`_carnetRenduAstuceDictee`) resserrée sur une ligne, **même texte**, même fond
  `--accent-bg-subtle` + filet `--accent` qu'aujourd'hui. Écran ET panneau (les deux copies :
  `_carnetRenduAstuceDictee()` ici, pas celle de Repères).
- Bouton de capture : **petit, aligné à droite** (patron « champ de message »), plus pleine largeur.
  `min-height: 44px`. Écran (`btnCarnetGarder`) + panneau (`btnCarnetGarderPanneau`).
- **Libellé « + Noter »** au lieu de « + Garder » (`_carnetRenduCapture()`).
- **Date en clair** : « Gardée le 9 septembre 2026 » avec picto calendrier, au lieu de « 09/09 »
  (`_carnetDateAffichee()` → nouveau format ; garder jj/mm/aaaa au-delà d'un an si utile).
- **« Déjà transformée en Repère » en pastille dessinée** (`border-radius: 999px`, teinte
  `--repere-ref`) au lieu du texte gris italique (`.carnet-chip-transformee`), **avec l'icône
  de Repère `bi-bookmark-star`** devant.
- **Les 3 boutons d'action de la carte** (`_carnetRenduItem()`, `carnet.css`) : icône +
  **« plein doux » au repos** (fond teinté léger, plus de contour transparent qui semble
  inactif - retour Denis 2026-09-09), hiérarchie par le sens :
  - « **Modifier** » → `<i class="bi bi-pencil"></i>`, **neutre doux** (`--bg-subtle` +
    `--border`, texte `--text-soft`). Action courante, sans enjeu, on ne lui donne pas de
    poids visuel.
  - « **Transformer en Repère** » : **violet Repère SEULEMENT si la note n'est pas encore
    transformée** (`!n.dejaTransformeeEnRepere`). Une fois transformée (la pastille « Déjà
    transformée en Repère » s'affiche), le bouton **repasse en neutre doux**, comme
    « Modifier » : c'est fait, inutile de le mettre en avant. (Décision Denis 2026-09-09.)
  - Quand elle n'est pas encore transformée → `<i class="bi bi-bookmark-star"></i>`
    (l'icône de Repère, partout dans l'app), **teinte violet Repère douce** :
    `background: color-mix(in srgb, var(--repere-ref) 12%, var(--bg-card))`, texte + icône
    `var(--repere-ref)`, bord `color-mix(--repere-ref 35%, transparent)`. **Décision Denis
    2026-09-09** : la couleur dit ce que le bouton produit et s'accorde à la pastille sur la
    même carte. `--repere-ref` est **déjà un token global** (`css/style.css` : `#7c3aed`
    clair / `#b794f6` sombre) - rien à hisser.
  - « **Supprimer** » → `<i class="bi bi-trash3"></i>`, **teinte danger douce**
    (`color-mix(--danger 10%, --bg-card)`, texte `--danger`). Reste sémantiquement distinct.
  - Survol : fond un peu plus marqué (même teinte). Le hover n'est plus le seul moment où le
    bouton « existe ».
- **Emphase de l'astuce dictée réduite** (retour Denis 2026-09-09) : seul **« Astuce :
  utilisez `Windows + H` »** reste en gras ; « pour dicter votre texte à la voix plutôt que
  de tout taper au clavier » (et « pour dicter plutôt que taper » côté panneau) passent en
  graisse normale, comme le reste de la phrase. `_carnetRenduAstuceDictee()`.
- **Motif de « couverture » décoratif** en tête de l'écran de travail ET de l'en-tête de l'intro :
  lignes de page + marge + marque-page, `aria-hidden`, teinté `--accent`.
- **Ligne calme** sous le titre : « Vos notes sont gardées ici aussi longtemps que vous voulez.
  Rien à trier, rien à finir. » (fond `--accent-bg-subtle`).
- Panneau compact : liseret `--accent` en haut, filet entre les aperçus, et **« Dernière note : »
  suivi du titre complet + une date relative** (« il y a 5 j ») au lieu du titre coupé à 4 mots.
- **Le Carnet suit `--accent`** (couleur du site) - aucune teinte propre. Rien à coder de spécial :
  le module utilise déjà `var(--accent)` ; il suffit de ne PAS introduire de teinte fixe.
- État vide du panneau : ligne calme « Rien encore. Notez ce qui vous vient, ci-dessus. »

**On n'implémente PAS** :
- ❌ Regroupement de la liste par période (« Cette semaine » / « Plus tôt »). La liste reste
  **strictement chronologique**, `_carnetRenduListe()` inchangé sauf l'habillage.
- ❌ Épingler une note, étiquettes de thème, recherche / filtre (écartés depuis la v1).

**CE QUI NE BOUGE PAS - confirmé à Denis le 2026-09-09 :**
- **L'icône `#btnCarnet`** : position (`position: fixed; top: 90px; right: 20px` desktop /
  `top: var(--hauteur-progression); right: 8px` mobile, `carnet.css`), forme (carré arrondi
  16px, différente des 3 icônes rondes du haut à gauche), glyphe (`bi-journal-text`), pulse
  de confirmation, `carnetApresNavigation()` / `positionnerIconePersistante()`. **Rien de
  tout ça n'est touché.** Elle reste en haut à droite, séparée de la disquette (qui est en
  haut à gauche). Les maquettes v3-v4 la dessinaient à tort collée aux 3 icônes de gauche -
  erreur de maquette, jamais une proposition.
- **Les règles `#btnCarnet` / `#panneauCarnet` de `carnet.css`** (positionnement, taille,
  ombre, media query mobile, `@keyframes carnetPulseConfirmation`) : on n'y touche pas. Le
  restyle ne concerne QUE le contenu rendu dans `#app` (l'écran de travail) et le contenu
  rendu dans `#panneauCarnet` (pas son cadre ni sa position).
- **Tous les autres écrans / parcours / modules de l'application** : aucun changement. Cette
  refonte est cloisonnée au module Carnet (`modules/carnet/carnet.css` + trois retouches
  minimes dans `modules/carnet/index.js` : libellé du bouton, format de date, icônes des
  boutons + pastille). Rien dans `js/app.js`, rien ailleurs.
- **Les fonctions, événements, validations, la navigation du Carnet** : inchangés (capturer /
  modifier / supprimer / transformer / titre auto / gel-néant / Retour / panneau).

**=> Cette refonte ne touche AUCUNE logique** : CSS (`modules/carnet/carnet.css`) + le libellé du
bouton + le format de `_carnetDateAffichee()`. Rien dans les événements, la validation, la
transformation, la navigation. Test navigateur obligatoire quand même (clair + sombre + une 2e
couleur de site), `js/app.js` et `modules/*/index.js` (DOM) hors tests Node.

**Améliorations gardées pour plus tard** (hors cette refonte) : « annuler la dernière suppression »
(`IDEES_A_RECLASSER` section E), placeholder du champ plus court.

**CADRAGE DENIS (2026-09-09) : c'est une REFONTE VISUELLE, rien d'autre.**
- On **ne déplace pas** l'icône du Carnet ni aucune icône persistante.
- On **ne déplace pas** ce qui est déjà en place, on ne change pas les icônes.
- On reprend **le maximum de l'existant** ; Denis lit ensuite précisément ce qu'on garde / pas.
- Le seul point qui n'est pas purement cosmétique (regroupement de la liste par période) est
  isolé et réglable dans la maquette (« Ajouts proposés : avec / sans »).

---

## Inventaire de l'existant (ce que le module rend AUJOURD'HUI) et statut proposé

Étiquettes : **IDENTIQUE** (rien ne bouge) · **RESTYLÉ** (même élément, même place, même
comportement, seul l'habillage change) · **PROPOSÉ** (ajout ou changement à trancher).

### Écran de travail (`_carnetRenduEcran`, `modules/carnet/index.js`)

| Élément existant | Statut | Détail |
|---|---|---|
| Bouton « Revoir la présentation » (`htmlBoutonRevoirModule`, pilule, calée au niveau des 3 icônes) | IDENTIQUE | brique partagée, on n'y touche pas |
| Note d'aide 1re fois sous ce bouton | IDENTIQUE | brique partagée |
| Titre `<h1><i class="bi bi-journal-text"></i> Mon Carnet</h1>` centré | RESTYLÉ | l'icône prend `--accent` (déjà le cas), pas de changement de glyphe |
| Sous-titre « Un espace entièrement à vous, jamais lu ni analysé automatiquement. » | IDENTIQUE | |
| Encart astuce dictée (`_carnetRenduAstuceDictee`, 💡 Astuce Windows + H, fond accent, filet accent) | RESTYLÉ | resserré sur une ligne, même texte, même fond, même filet |
| Zone de capture : `<textarea>` + bouton (`_carnetRenduCapture`) | RESTYLÉ | le bouton passe de pleine largeur à **petit, aligné à droite** (patron « champ de message ») |
| Libellé du bouton : « + Garder » | PROPOSÉ | → « + Noter » (verbe du carnet, aligné sur le placeholder « Notez… »). À confirmer. |
| Liste chronologique (`_carnetRenduListe`) | RESTYLÉ | + regroupement par période, voir PROPOSÉ ci-dessous |
| État vide (`.carnet-etat-vide`, icône `bi-journal-text` + phrase) | RESTYLÉ | même contenu, habillage accordé |
| Barre de navigation fixe (Retour → `carnetRetour()`) | IDENTIQUE | Retour / Accueil = teinte accent (déjà fait, commit `cc86a4d`) |

### Une note dans la liste (`_carnetRenduItem`)

| Élément existant | Statut | Détail |
|---|---|---|
| `.carnet-item` (cadre blanc, filet gris fin) | RESTYLÉ | filet gauche `--accent` + fond papier très léger + petite icône `bi-journal-text` |
| Champ titre **éditable toujours visible** (`<input class="carnet-item-titre">`) | IDENTIQUE (RESTYLÉ) | reste un champ éditable in situ, style discret → focus accent (déjà le cas) |
| Texte de la note (`.carnet-item-texte`, `white-space: pre-wrap`) | IDENTIQUE | |
| Date « 09/09 » (jj/mm, `_carnetDateAffichee`) | PROPOSÉ | → « Gardée le 9 septembre 2026 » avec un picto calendrier (lisibilité) |
| Étiquette « Déjà transformée en Repère » (texte gris italique) | RESTYLÉ | → vraie pastille dessinée (`border-radius: 999px`, teinte `--repere-ref`) |
| 3 boutons : Modifier / Transformer en Repère / Supprimer | IDENTIQUE | mêmes libellés, mêmes actions, même ordre |

### Panneau compact de l'icône (`_carnetRenduPanneau`, `#panneauCarnet`)

| Élément existant | Statut | Détail |
|---|---|---|
| `#btnCarnet` (icône persistante, position, `carnetApresNavigation()`) | **IDENTIQUE - NE PAS TOUCHER** | position, glyphe `bi-journal-text`, pulse de confirmation : rien ne bouge |
| En-tête `<h6><i class="bi bi-journal-text"></i> Carnet</h6>` + croix de fermeture | RESTYLÉ | liseret accent en haut du panneau ; croix identique |
| Encart astuce dictée | RESTYLÉ | une ligne, comme l'écran |
| Zone de capture (identifiants distincts `carnetTexteNouveauPanneau` / `btnCarnetGarderPanneau`) | RESTYLÉ | bouton petit aligné à droite ; libellé suit la décision « + Noter » |
| « Dernière note : [titre tronqué 4 mots] » | PROPOSÉ | → le titre complet + une date relative (« il y a 5 j ») ; supprime l'effet « phrase coupée » |
| Aperçus (`.carnet-apercu-item`, boutons = titre, ouvrent `_carnetOuvrirDetail`) | IDENTIQUE (RESTYLÉ) | restent des boutons cliquables qui ouvrent le détail ; + un filet entre eux |
| Bouton « Afficher plus / Afficher moins » (3 ↔ 10) | IDENTIQUE | mécanisme inchangé |
| Bouton « Voir tout mon Carnet → » (`data-carnet-voir-tout`) | IDENTIQUE (RESTYLÉ) | même action (`carnetDemarrer({sauterIntro:true})`) |
| Fenêtre de détail d'une note (`_carnetOuvrirDetail`, titre + contenu + bouton Modifier) | IDENTIQUE | hors périmètre visuel de cette maquette |

### Ajouts PROPOSÉS (réglables dans la maquette : « Ajouts proposés : avec / sans »)

| Ajout | Nature | Risque |
|---|---|---|
| Motif de « couverture » décoratif en tête (lignes de carnet + marque-page) | Purement décoratif, `aria-hidden` | Aucun (ne remplace rien, ne pousse pas trop le contenu). |
| Ligne calme « Vos notes sont gardées ici aussi longtemps que vous voulez. Rien à trier, rien à finir. » | Texte, sous le titre | Léger scope creep ; à garder ou non. |
| Regroupement de la liste par période (« Cette semaine », « Plus tôt ») | **Seul changement non cosmétique** : touche `_carnetRenduListe()` | Faible ; reste chronologique, aucune catégorie de contenu (conforme doctrine). À n'afficher qu'au-delà d'un seuil de notes. |
| Date en clair (« Gardée le 9 septembre 2026 ») | Change `_carnetDateAffichee()` | Faible ; vraie amélioration de lisibilité. |
| « + Noter » au lieu de « + Garder » | Libellé | Casse le parallèle avec « + Garder une réflexion » de Repères. |
| Carte de note : fond papier + filet + icône + pastille « transformée » | Restyle (déjà classé RESTYLÉ ci-dessus) | Aucun. |

### Améliorations que je suggère (au-delà du strict visuel, faible risque)

1. **« Annuler la dernière suppression »** : un petit « Annuler » qui apparaît ~8 s après un
   « Supprimer ». Filet, pas une contrainte. (Déjà noté `IDEES_A_RECLASSER.md` section E.)
   → **pas dans cette refonte visuelle**, mais le vrai « petit plus » utile du module.
2. **Placeholder du champ plus court** : « Notez tout ce qui vous semble utile, sans avoir à
   choisir quoi en faire tout de suite. » est long sous un petit bouton. Piste : garder la
   1re moitié seulement. À voir avec toi.
3. **État vide du panneau** (aujourd'hui : aucun texte quand 0 note) : une ligne calme
   « Rien encore. Notez ce qui vous vient, ci-dessus. ».

---

## Rappel des garde-fous (docs/DOCTRINE_CARNET.md - non négociables)

- **Principe 6 - jamais solliciter.** Aucun compteur de notes, aucun badge, aucun signal qui ferait
  voir le Carnet comme un espace « à vider » ou « à traiter ». Une note peut rester là indéfiniment
  sans que ce soit un problème.
- **Principe 5 - aucune catégorie imposée.** Aucun type, aucune structure exigée à la capture. Un tri
  ou une étiquette *facultative, posée après coup* n'est pas interdit par la lettre du principe, mais
  reste une zone sensible : à trancher explicitement, pas à glisser dans une maquette.
- **Principe 1 - capture sans friction.** La zone de capture reste : un champ, un bouton. Rien de plus.
- **Pas de gel, pas d'encart « Continuer / Recommencer »** (famille 1, décision Denis 2026-08-31) :
  le Carnet n'a que le bouton « Revoir la présentation » + la note.
- **Zéro régression fonctionnelle** : capturer / consulter / modifier / supprimer / transformer en
  Repère, sur l'écran complet comme dans le panneau - aucune de ces actions ne disparaît ni ne change
  de contrat.

---

## État actuel (constat au navigateur, 2026-09-09)

**Écran de travail**
- En-tête : « Mon Carnet » + une ligne de sous-titre. Le module prend le **bleu d'accent par défaut**,
  il n'a pas de teinte propre (tous les autres modules en ont une).
- Bouton « + Garder » : pleine largeur, bleu saturé, très présent - un peu injonctif pour un espace
  qui se veut « sans pression ».
- Encart astuce dictée : toujours ouvert, occupe beaucoup de hauteur au-dessus de la ligne de
  flottaison. Répété à l'identique dans le panneau.
- Carte d'une note : rectangle blanc, filet gris fin, **aucune teinte, aucune icône**. Date affichée
  « 09/09 » brute (pas d'année, pas de libellé). « Déjà transformée en Repère » = texte gris italique,
  pas une pastille.
- Liste : purement chronologique, aucune séparation visuelle même si elle s'allonge.

**Panneau compact (icône persistante)**
- « Dernière note : Penser à demander une » - le titre tronqué à 4 mots se lit comme une **phrase
  coupée**, effet « cassé ».
- Aperçus = lignes de texte nues, sans date, sans séparateur net.

**Page de présentation**
- Déjà équilibrée (patron d'intro, 2026-08-31). Riche en texte. Manque surtout sa **teinte propre** et
  un en-tête un peu plus incarné.

---

## Propositions

### Axe 1 - Identité visuelle propre (cosmétique, risque faible)

| # | Proposition | Apport | Risque / réserve |
|---|---|---|---|
| 1.1 | **Teinte d'accent dédiée au Carnet** (aujourd'hui bleu par défaut). Piste : une teinte « encre » chaude, ou un vert-gris « papier » calme. Déclinée sur l'icône du module, le filet des cartes, les encarts de l'intro. | Le Carnet cesse de se confondre avec le reste ; cohérent avec la règle « chaque module a au moins sa teinte » (LANGAGE_VISUEL_COMMUN). | Une teinte de plus à tenir en clair **et** sombre. Aucun autre. |
| 1.2 | **Carte de note refaite** : filet gauche teinté (comme les encarts du langage commun), léger fond « papier », petite icône carnet, **date en clair** (« Gardée le 9 septembre 2026 », picto discret), « Déjà transformée en Repère » en **vraie pastille dessinée** (`border-radius: 999px`, teinte) au lieu de l'italique gris. | Chaque note devient un objet lisible, pas une ligne de tableau. Rend la date utile (aujourd'hui ambiguë). | Plus de hauteur par note. À vérifier sur mobile et sur une note longue. |
| 1.3 | **« + Garder » adouci** : même gabarit, teinte plus posée, moins « bloc plein bleu ». | Cohérent avec le ton « rien à réussir ici ». | Purement visuel, aucun. |
| 1.4 | **En-tête incarné** : un motif décoratif sobre (lignes d'une page de carnet, un marque-page) - objet concret, jamais de visage. Sur l'intro et/ou l'écran. | Donne une « couverture » au module, réchauffe une page aujourd'hui très textuelle. | Ne doit pas pousser le contenu trop bas. Décoratif, `aria-hidden`. |

### Axe 2 - Structure de la liste (« la répartition » - UX, à trancher)

| # | Proposition | Apport | Risque / réserve |
|---|---|---|---|
| 2.1 | **Regrouper la liste par période** : intertitres non cliquables « Aujourd'hui / Cette semaine / Plus tôt ». Reste strictement chronologique, aucune catégorie de contenu. | Donne du relief à une liste qui s'allonge, sans rien imposer. Compatible doctrine (c'est de la date, pas du type). | Sur 2-3 notes, un intertitre « Aujourd'hui » seul peut faire vide - n'afficher les groupes qu'au-delà d'un seuil. |
| 2.2 | **Épingler une note en haut** (une « pastille » de note en tête, ré-ordonnable). Utile pour un contact, une échéance. | Répond à un besoin réel (les contacts n'ont que le Carnet - idée Q des idées à reclasser). | Introduit une **hiérarchie** dans un espace pensé « tout à plat ». À peser avec la doctrine. Recommandation : **pas dans la v1**. |
| 2.3 | **Étiquette de thème facultative** (idée / question / doute / piste / contact), posée après coup, jamais à la capture. | Aide à s'y retrouver dans beaucoup de notes. | Zone sensible (principe 5). Beaucoup de travail (filtre, rendu, sombre). Recommandation : **pas dans la v1**, à rouvrir seulement si un usage réel le réclame. |
| 2.4 | **Recherche / filtre par date** : explicitement **reporté** par le chantier d'origine (« à reconsidérer si usage réel avec beaucoup de notes »). Recommandation : **on ne le fait pas maintenant.** | - | - |

### Axe 3 - Contenu informatif (léger, risque faible)

| # | Proposition | Apport | Risque / réserve |
|---|---|---|---|
| 3.1 | **Ligne calme sur l'écran de travail** rappelant ce qu'est l'espace, **sans compteur** (« Vos notes, gardées ici aussi longtemps que vous voulez »). | Comble le vide en haut sans rien réclamer. | Ne jamais y mettre de nombre de notes (principe 6). |
| 3.2 | **Astuce dictée repliable** (une ligne + « i » qui déplie), écran ET panneau. | Récupère de la hauteur, garde l'info. | Vérifier que le module frère (Découverte) n'a pas besoin d'être aligné en même temps - à noter, pas à traiter ici. |
| 3.3 | **Panneau compact refait** : titre de la dernière note en gras (plus « Dernière note : » + phrase coupée), date relative (« il y a 2 jours »), un vrai séparateur entre aperçus, une ligne d'état quand il n'y a aucune note. | Enlève l'effet « cassé » actuel, rend le panneau lisible. | Aucun, cadré. |
| 3.4 | **Mini-bloc légitimité sur l'intro** (idée L) : « Personne ne relit vos notes. Les fautes, l'orthographe, la forme n'ont aucune importance ici. » | Parle aux personnes qui n'osent pas écrire (coeur du public). | Peut alourdir l'intro déjà dense - à placer, pas à empiler. |

---

## Recommandation pour la maquette v1

**Retenir** : Axe 1 en entier (1.1 à 1.4), Axe 2 **uniquement 2.1** (regroupement par période), Axe 3
en entier (3.1 à 3.4).

**Écarter de la v1** (notés pour plus tard) : épingler (2.2), étiquettes de thème (2.3), recherche /
filtre (2.4).

**Pourquoi** : la v1 réchauffe le module et le structure sans toucher au coeur de la doctrine
(« tout à plat, sans catégorie, sans pression »). Les propositions écartées demandent chacune une
vraie décision doctrinale **et** beaucoup de code - à ne pas mélanger avec une refonte visuelle.

---

## Décisions Denis (2026-09-09)

- **La proposition est validée dans son principe** (maquette
  `docs/MAQUETTE_REFONTE_CARNET_2026-09-09.html`) : en-tête « couverture »
  décoratif, ligne calme sans compteur, astuce dictée sur une ligne, carte de
  note refaite (filet + fond papier léger + icône + date en clair + pastille
  « transformée »), liste regroupée par période, panneau compact refait.
- **PAS de couleur propre au Carnet.** Denis revient sur l'idée du vert-gris :
  « le Carnet est un outil parmi les autres, il est intégré comme tous les
  autres ». Il reprend `--accent` (la couleur du site choisie par la personne).
  Son identité vient de la **forme** (couverture, texture papier, style de
  carte, ton), jamais de la couleur. → **Option A** (voir plus bas).
- **Maquette : proposition seule, sans comparaison avant/après.** La comparaison
  a créé de la confusion (Denis a d'abord cru corriger l'existant). Règle pour
  les prochaines maquettes.
- **Panneau de réglages d'une maquette : toujours une croix pour le fermer.**
  Il prenait trop de place et masquait le contenu. (`feedback_maquette_panneau_reglages_refermable`)
- **Bouton d'unification des couleurs de bouton : validé** (voir point ci-dessous),
  chantier séparé après le Carnet.
- **Point ouvert : « + Garder » ou « + Noter » ?** Recommandation Claude :
  **« + Noter »** — c'est le verbe de la métaphore du carnet, et il s'aligne
  sur le placeholder (« Notez… ») et l'état vide (« Notez-y ce que vous
  voulez ») ; « garder » sous-entend « est-ce que ça vaut la peine ? », à
  rebours du « rien à réussir ici ». Contre : casse le parallèle verbal avec
  « + Garder une réflexion » de Repères — mais la doctrine veut ces deux
  espaces distincts. Montré en « + Noter » dans la maquette, à confirmer.

## Point ouvert soulevé par Denis (2026-09-09) : couleur des boutons dans les modules

Denis constate que **la plupart des boutons / icônes suivent la couleur de site
choisie par la personne** (`--accent` : bleu par défaut, orange, vert, violet,
turquoise, framboise - préférence d'affichage, `css/style.css` `[data-accent="…"]`),
**mais pas les boutons d'action principaux à l'intérieur des modules** (`.btn-primary`
de Bootstrap = bleu `#0d6efd` figé). Résultat : sur un thème orange, un écran a ses
textes et son bouton « Revenir au module » en orange, mais son « Continuer » /
« Retour » en bleu. Il demande si on unifie.

**Recommandation : oui, unifier - le bouton d'action neutre suit `--accent`.**
- *Pourquoi* : la personne a fait un choix ; un bouton bleu isolé au milieu d'un
  écran orange se lit comme un oubli, pas comme une intention. C'est déjà à moitié
  fait (`htmlBoutonRevoirModule`, jetons, liens, et depuis aujourd'hui Retour /
  Accueil suivent `--accent`) - `.btn-primary` est le dernier à ne pas suivre.
- *Apport* : cohérence visuelle immédiate sur les 6 couleurs, sans nouveau concept.
- *Risque* : gros balayage (`.btn-primary` est partout) - **une seule règle CSS**
  (`.btn-primary { background: var(--accent); border-color: var(--accent); }` +
  survol + `:disabled`) plutôt que retoucher chaque appel ; puis une passe de test
  (chaque module, clair + sombre, les 6 accents au moins en survol).
- **Ne bougent PAS** (portent un sens, restent figés) : `--danger` (Supprimer),
  `--success` (validation positive), et les 4 familles de la grammaire de boutons
  (`comprendre` / `explorer` / `personnel` / `accompagnement`, `css/style.css`
  section « grammaire visuelle »). Seul le CTA **neutre** (« Continuer », « Valider »,
  « Ouvrir », « Suivant ») passe à `--accent`.
- **Chantier séparé**, après la refonte Carnet. Noté ici pour ne pas le perdre.
- **Denis a validé (2026-09-09)** : « on va unifier ». À faire après le Carnet.

### Conséquence sur la teinte du Carnet (à trancher avec le point ci-dessus)

Si « tout suit la couleur choisie » devient la règle, une teinte **fixe** vert-gris
pour le Carnet en ferait **le seul module qui ignore le choix de la personne**.
Deux lectures :
- **Option A (cohérente avec la demande d'unification)** : le Carnet garde
  `var(--accent)` comme tout le monde. Son identité vient alors du **motif de
  couverture + la texture papier + le style de carte + le ton**, jamais de la
  couleur. Dans la maquette, les formes ne changent pas ; seul le vert devient la
  couleur choisie par la personne.
- **Option B (identité colorée forte, `DOCTRINE`/`LANGAGE_VISUEL_COMMUN` « chaque
  module sa teinte »)** : le Carnet impose son vert-gris localement. Assumé comme
  l'exception.
**→ TRANCHÉ le 2026-09-09 : Option A.** Le Carnet reprend `--accent`. La maquette
a été refaite en conséquence (réglage « couleur du site » : bleu / orange / vert /
violet, le Carnet suit).

## Suite

1. Denis relit la maquette (proposition seule) : valide le périmètre v1, tranche
   « + Noter » vs « + Garder ».
2. Implémentation bloc par bloc, `npm test` + navigateur clair/sombre + mobile +
   au moins 2 couleurs de site (bleu + une autre) à chaque bloc.
3. Puis, chantiers séparés : (a) unification `.btn-primary` sur `--accent` ;
   (b) page de présentation de Mes Repères au gabarit commun (`TACHES_VALIDEES.md`).

## Fait en marge de ce chantier (2026-09-09)

- **Bouton « Accueil »** : l'emoji maison (multicolore, hors charte) remplacé par l'icône au trait
  `bi bi-house-door`, cohérente avec les icônes persistantes / la flèche Retour / les logos de
  modules. 3 emplacements dans `js/app.js` (`barreNavigation` + 2 écrans de clôture du Bilan).
  Commit `1fb65cf`. **Reste** : l'emoji `✅` du bouton « Merci bien, j'ai fini » est dans le même cas
  (non signalé par Denis, à voir).
