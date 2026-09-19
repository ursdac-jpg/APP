# Chantier « Carnet » — de la doctrine à l'implémentation

**Statut** : implémentation complète et stabilisée (7/7 étapes prévues par ce document, dont une révision de la double porte d'entrée après un premier essai réel — partie 5 bis — et une validation centralisée contre les notes vides, trouvée lors de la revue critique finale), chaque étape vérifiée en navigateur — voir `modules/carnet/ARCHITECTURE_TECHNIQUE.md` pour le détail technique. **Mise à jour (2026-08-18, audit de cohérence documentaire)** : 3 étapes supplémentaires ont depuis été ajoutées côté implémentation (aide guidée, suivi Umami, astuce dictée vocale — voir `ARCHITECTURE_TECHNIQUE.md`, désormais 10/10 étapes), sans être redécrites ici. La philosophie ne s'écrit plus ici : elle vit dans `docs/DOCTRINE_CARNET.md`, elle-même subordonnée à `docs/CONSTITUTION_ERIP.md`. Ce document traduit cette doctrine en décisions concrètes, à l'exacte discipline qui a produit `docs/CHANTIER_REGARD_EXTERIEUR_IA.md`.

**Nom du module** : pas encore choisi, par décision explicite de Denis (le concept prime sur l'intitulé). « Carnet » est utilisé partout ci-dessous comme nom de travail, jamais un choix figé.

---

## Partie 1 — De la doctrine aux contraintes de conception

**Principe 1 (mission, sans délai ni décision immédiate).** La capture doit être la plus courte possible : un champ de texte, un bouton pour garder, rien d'autre. Aucun picker de type à la création — c'est la différence structurelle avec Repères, pas un oubli.

**Principe 2 (propriété exclusive).** Le module ne charge et ne référence jamais `promptCache()`, `ASSISTANTS_IA`, ni aucun mécanisme lié à un assistant IA. Aucune dépendance vers Regard extérieur, dans aucun sens.

**Principe 3 (toujours strictement privé).** Le modèle de données n'a pas de champ d'état (contrairement à `r.etat` dans Repères). Aucun filtre « partagé/privé » à l'écran, aucun bouton « Partager ».

**Principe 4 (transformer, c'est copier).** « Transformer en Repère » crée un nouveau Repère et laisse la note du Carnet strictement intacte. Un indicateur (booléen simple, pas une liste extensible : `dejaTransformeeEnRepere`, rien de plus tant qu'aucune autre transformation n'existe réellement) le signale sans jamais bloquer une nouvelle transformation.

**Principe 5 (identité distincte).** Fichier et dossier séparés (`modules/carnet/`), modèle de données séparé (`dossier.carnet`, jamais un champ ajouté à `dossier.reperes`), écran séparé, aucun type imposé.

**Principe 6 (jamais solliciter).** Aucun badge de comptage sur l'icône persistante. Aucune relance, aucun message du type « vous avez des notes non traitées ».

---

## Partie 2 — Modèle de données

```js
{
  id: 'c' + Date.now() + suffixe,   // même patron que Repères
  horodatage: Date.now(),           // ENREGISTRÉ DIRECTEMENT, voir décision ci-dessous
  texte: '...',
  dejaTransformeeEnRepere: false
}
```

**Décision, en écart volontaire avec Repères** : la date complète (`horodatage`) est stockée directement en clair, jamais recalculée depuis l'identifiant. Le regard critique final de Regard extérieur a montré que `r.date` (jj/mm seul, sans année) devient ambigu au-delà de douze mois et qu'il faut ensuite ruser pour retrouver l'horodatage exact depuis `r.id`. Rien n'oblige à répéter ce détail dans un module qui n'existe pas encore : le Carnet stocke la date complète dès le premier jour, sans avoir besoin d'aucune extraction ultérieure. L'affichage (jj/mm, ou jj/mm/aaaa au-delà d'un an) reste un choix d'écran, jamais une contrainte du modèle.

`dossier.carnet` initialisé paresseusement, même patron que `_reperesListe()` : `if (!dossier.carnet) { dossier.carnet = []; }`.

**Pas de limite de longueur sur le texte.** Contrairement à un Repère envoyé un jour dans un prompt (où une longueur excessive a un coût réel), une note de Carnet n'est jamais consommée par une IA de tout le cycle de vie que couvre ce chantier. Aucune raison technique de la borner.

---

## Partie 3 — Écran et interactions

**Capture.** En haut de l'écran : une zone de texte, un bouton « Garder ». Pas de sélecteur de type, pas de champ optionnel supplémentaire. Le texte peut être vide de sens pour quiconque d'autre que la personne — aucune validation de PERTINENCE. *(Précision ajoutée lors de la revue critique finale : une seule règle technique existe malgré tout, l'absence totale de contenu, appliquée de façon centralisée à la création, l'édition et la transformation — voir `modules/carnet/ARCHITECTURE_TECHNIQUE.md`, étape 7. Ce n'est jamais un jugement sur ce qui est écrit, seulement sur le fait qu'il y ait quelque chose à garder.)*

**Liste.** Notes les plus récentes en tête (même convention que Repères, insertion en tête de tableau). Chaque note affiche son texte, sa date, un bouton « Modifier » (édition inline, même patron que l'enrichissement d'un Repère), un bouton « Supprimer » (avec confirmation, `confirmerAction()`), et un bouton « Transformer en Repère ».

**Une note déjà transformée** : le bouton reste cliquable (principe 4, jamais un verrou), mais une étiquette discrète apparaît à côté (« Déjà transformée en Repère »), pour que la personne sache qu'elle recrée un deuxième Repère si elle clique à nouveau, en connaissance de cause.

**Aucun filtre, aucun tri, aucune recherche en V1.** Le périmètre validé est capturer/consulter/modifier/supprimer/transformer — une liste chronologique simple suffit à ça. À reconsidérer seulement si un usage réel avec beaucoup de notes le justifie.

---

## Partie 4 — Le mécanisme « Transformer en Repère »

Le contrat d'ancrage existant (`reperesBoutonAncre({libelle})`, `docs/CONTRAT_ANCRAGE_ERIP.md`, figé) ne convient pas tel quel : il porte une **référence** vers un moment de l'application (« Axe : Autonomie »), jamais un **contenu déjà rédigé**. L'utiliser détournerait son contrat plutôt que de le respecter.

**Décision** : un contrat frère, pas une extension du contrat existant — ne jamais rouvrir un document déjà figé pour un besoin qu'il n'a pas été conçu pour couvrir. Nouvelle façade, ajoutée à `modules/reperes/index.js` en vertu de sa propre RÈGLE DE FAÇADE (un appelant réel existera) :

```js
function reperesCreerAvecTexte(texte, onCree) {
  // ouvre le picker de type déjà existant (_reperesRenduPicker(), réutilisé
  // tel quel -- même mécanisme que le geste ancré) ; au choix du type,
  // construit le Repère avec ce texte déjà rempli (source: null, un geste
  // libre), jamais un texte à retaper. Rappelle onCree(repereCree) une
  // fois fait, pour que l'appelant (le Carnet) puisse marquer sa note
  // d'origine comme transformée.
}
```

Le Carnet reste dans l'ignorance de la structure interne d'un Repère (même règle que pour tout le reste d'ERIP) : il fournit un texte et un callback, jamais plus.

---

## Partie 5 — L'icône persistante

**Visible dès le début, jamais masquée jusqu'à un premier usage.** Écart volontaire avec le Journal de parcours, qui reste caché jusqu'au premier Repère. Cette différence a une raison précise : Repères dispose déjà d'un chemin de découverte principal (la tuile de la Boîte à outils), l'icône persistante n'y est qu'un raccourci révélé une fois pertinent. Le Carnet n'a pas d'autre porte d'entrée prévue — le masquer reviendrait à cacher son unique moyen d'être découvert. C'est d'ailleurs plus cohérent avec les trois icônes historiques (préférences, session, aide), toutes visibles dès le chargement : le Journal de parcours est l'exception dans le lot, pas la référence à reproduire par défaut.

**Positionnement dynamique, mutualisé.** Le regard critique final de Regard extérieur a produit `_reperesPositionnerBoutonJournal()` (mesure réelle du bas de `#btnAide` et du `<h1>` de la page courante, jamais une valeur devinée). Cette logique n'a plus de raison de rester spécifique à Repères dès qu'un deuxième bouton persistant en a besoin. **Décision d'architecture** : au moment de l'implémentation, extraire un utilitaire générique dans `js/app.js` (aux côtés de `trackEvenement()`, `copierTexteVersPressePapier()` — même statut d'utilitaire transversal) :

```js
function positionnerIconePersistante(idBouton, idBoutonReference) {
  // mesure le bas réel de idBoutonReference et du <h1> courant,
  // positionne idBouton juste en dessous du plus bas des deux.
}
```

*(Mise à jour après la finition mobile de l'implémentation : la première version ne posait rien sur mobile (<=768px), laissant une règle CSS statique agir seule — correct tant qu'un seul bouton persistant existait. Dès que `#btnCarnet` a coexisté avec `#btnJournalParcours`, cette règle statique superposait les deux exactement au même endroit sur mobile. Corrigé en appliquant ce calcul dynamique sur toutes les largeurs d'écran, sans exception — voir `modules/carnet/ARCHITECTURE_TECHNIQUE.md`, étape 5, pour le détail.)*

`reperesApresNavigation()` l'appellerait avec `('btnJournalParcours', 'btnAide')`, l'équivalent du Carnet avec `('btnCarnet', 'btnJournalParcours')` — les deux boutons empilés à droite, chacun sachant seulement quel est son voisin immédiat, jamais la liste complète des icônes existantes.

**Pas de pulse au clic, mais une confirmation à la création.** Même mécanisme que `_reperesDeclencherPulseJournal()` : une réaction brève à un geste que la personne vient de faire, jamais une sollicitation initiée par le module — cohérent avec le principe 6 de la doctrine, qui interdit la sollicitation, pas la confirmation.

---

## Partie 5 bis — Double porte d'entrée, révisée après un premier essai réel

**Version initialement décidée (implémentée, puis abandonnée après usage réel).** Les deux points d'entrée (icône persistante, tuile Boîte à outils) appelaient la même façade `carnetDemarrer()`, qui naviguait directement vers l'écran complet, sans aucune différence de comportement — lecture stricte du principe 7 de la doctrine à ce moment-là. Une fois testée en conditions réelles, cette version s'est révélée mauvaise sur deux points concrets, pas seulement inélégante :
- Cliquer sur l'icône **quittait toujours la page en cours** pour aller au Carnet, même pour noter une seule phrase rapide — alors que les trois icônes historiques (préférences, session, aide) et le Journal de parcours restent tous sur place, dans un panneau compact.
- Un **vrai bug** en découlait : cliquer une seconde fois sur l'icône alors qu'on se trouvait déjà sur l'écran complet du Carnet rappelait `carnetDemarrer()`, qui écrasait `_carnetPageOrigine` avec `'carnet'` lui-même — rendant le bouton « Retour » inopérant (il ramenait sur le Carnet, pas sur la page de départ réelle).

**Version retenue, mêmes principes que le Journal de parcours (`#btnJournalParcours`/`#panneauJournalParcours`, `modules/reperes/index.js`).** Les deux points d'entrée ne mènent plus au même geste :
- **L'icône persistante** (`#btnCarnet`) ouvre désormais un **panneau compact sur place** (`#panneauCarnet`) : une zone de capture (identifiants distincts de ceux de l'écran complet, pour éviter toute collision puisque les deux peuvent coexister dans le DOM), un aperçu des 3 dernières notes, et un lien « Voir tout mon Carnet ». La personne reste sur sa page ; rien ne navigue.
- **La tuile Boîte à outils**, et ce même lien « Voir tout mon Carnet » du panneau, appellent `carnetDemarrer()` — qui reste l'unique point d'entrée nommé vers l'écran complet, même patron que `reperesDemarrer()`.
- `carnetDemarrer()` porte désormais une garde défensive : elle ne capture `_carnetPageOrigine` que si la page courante n'est pas déjà `'carnet'` — élimine la classe entière du bug ci-dessus, y compris pour l'usage résiduel où le panneau serait ouvert depuis l'écran complet lui-même.

**Ce que le principe 7 de la doctrine protège encore, et ce qu'il ne protège plus.** Les deux chemins donnent accès au **même contenu** (une seule `dossier.carnet`, jamais deux listes) et permettent tous les deux de **capturer** une note. Ce qui diffère désormais, délibérément, c'est la **vue** : un aperçu rapide dans le panneau, l'espace complet avec modifier/supprimer/transformer sur l'écran dédié — exactement la même distinction qui existe déjà entre le panneau du Journal de parcours et l'écran Repères, jamais présentée comme une incohérence pour ce module-là. Le principe 7 a été reformulé en conséquence (`docs/DOCTRINE_CARNET.md`) : « un seul espace, plusieurs vues possibles pour y accéder », plutôt que « zéro divergence ».

---

## Partie 6 — Hors périmètre, explicitement

**Document et Action** : aucune conception commencée. Le mécanisme qui permettrait d'insérer un texte dans un document en cours d'édition n'existe nulle part dans ERIP aujourd'hui — il mériterait son propre chantier, avec ses propres questions (quel document, quel champ, que faire si aucun n'est en cours), pas un ajout hâtif à celui-ci.

**Recherche, tri, filtre** : reportés, le périmètre V1 ne les justifie pas.

**Nom du module** : reporté, comme validé.

**La tuile Boîte à outils n'est plus un point ouvert** : décidée en partie 5 bis, en plus de l'icône persistante.

---

## Suite

Chantier clos : les 7 étapes prévues par ce document (détaillées dans `modules/carnet/ARCHITECTURE_TECHNIQUE.md`) sont implémentées et vérifiées en navigateur, y compris la révision de la double porte d'entrée (partie 5 bis) et la validation centralisée contre les notes vides, trouvées toutes deux lors des revues critiques finales. Les prochaines évolutions de ce module devront être motivées par un usage réel observé, jamais par une amélioration théorique — décision explicite de Denis à la clôture de ce chantier. Voir `ARCHITECTURE_TECHNIQUE.md` pour les 3 étapes ajoutées depuis (10/10 au total).
