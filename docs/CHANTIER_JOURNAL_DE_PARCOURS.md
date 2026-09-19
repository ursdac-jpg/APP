# Chantier « Journal de parcours » — rendre Repères accessible partout

**Statut** : implémenté et vérifié en navigateur. Bouton masqué tant qu'aucun Repère n'existe, révélé et pulsé à la première création (quel que soit le chemin : Boîte à outils, mini-panneau, geste ancré), retour dynamique confirmé depuis une page autre que l'accueil (testé depuis le Bilan CV), non-régression du chemin existant (Boîte à outils) confirmée, masquage à nouveau du bouton après suppression du dernier Repère confirmé.

**Correction ultérieure (chantier 2)** : un bug réel de duplication d'écouteurs sur le picker du panneau a été trouvé en testant un 2e point d'ancrage (`pageRevelation()`, qui se re-rend à elle-même à chaque interaction) — le bouton/panneau, jamais détruit entre deux pages, accumulait des écouteurs à chaque appel document-large de `reperesBrancherBoutonAncre()`. Corrigé par une garde d'idempotence dans `_reperesBrancherEvenementsPickers()`. Détail complet : `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`. Revérifié depuis : aucune duplication, même après re-rendus répétés d'une page ou navigation croisée entre plusieurs pages avec geste ancré.

**Nature du chantier** : une correction d'expérience, pas une évolution fonctionnelle. Repères ne change pas de comportement ; seule la distance entre l'intention de la personne et le geste de création change. Voir la section « Pourquoi » ci-dessous pour l'argumentaire complet.

**Ce que ce document ne couvre pas** : deux autres chantiers ont été identifiés dans la même discussion, volontairement mis de côté pour plus tard.

**Chantier 2 — étendre le geste ancré à d'autres moments. Statut : clos pour sa part réalisable, un reliquat ouvert à part.**
- Axes analysés du Bilan CV : fait, vérifié.
- Métiers suggérés (Découverte des compétences, en réalité affichés dans `pageRevelation()` / « Faisons le point », pas dans le module Découverte lui-même) : fait, vérifié. A aussi révélé et corrigé un vrai bug de duplication d'écouteurs sur le bouton permanent (voir carnet technique).
- Préparation d'entretien : **reportée en chantier 3**, pas abandonnée. Les questions anticipées passent par `rendreTemplate()` (`modules/cv-editor/rendreTemplate.js`), un moteur de gabarit générique partagé avec le CV et la lettre de motivation, potentiellement utilisé aussi bien pour l'aperçu à l'écran que pour l'export téléchargé (`exportDocxNatifEntretien.js`). Un bouton d'ancrage inséré directement dans ce gabarit risquerait de se retrouver dans le document exporté. Nécessite sa propre cartographie (où l'aperçu et l'export divergent, s'ils divergent) avant tout code — pas une extension à cinq minutes comme les deux précédentes.
- Écrans du parcours guidé (Créer un CV / J'ai déjà un CV / Mettre à jour, puis Objectif → Mon projet) : **examiné et écarté, pas un oubli**. Ce sont des écrans de saisie, pas des moments où le système propose un contenu généré — rien d'analogue aux recommandations, métiers suggérés ou questions anticipées à y ancrer. Le besoin réflexif sur ces écrans est déjà couvert par le geste libre, accessible partout depuis le chantier 1.

**Chantier 3 (numérotation d'origine) — le passage IA avec contexte** : une brique séparée, sa propre conception, sa propre vérification de cohérence avec la Constitution. Pas commencé.

Ne pas anticiper ces chantiers dans l'implémentation de celui-ci.

---

## Pourquoi (le diagnostic UX)

Repères a deux modes de création : ancré (depuis le Bilan CV, un clic suffit, fonctionne déjà bien) et libre (une pensée sans lien avec un écran précis). Aujourd'hui, le geste libre exige quatre étapes sans rapport avec la pensée elle-même : retour à l'accueil, ouverture de la Boîte à outils, clic sur Mes Repères, clic sur « + Garder une réflexion ». Une pensée fugace ne survit presque jamais à ce trajet.

Or les deux scénarios qui ont le plus justifié de construire Repères dès le départ sont précisément de ce type : une réflexion entre deux rendez-vous CIP, une pensée qui ne concerne aucun module précis. Le trajet actuel décourage exactement ce que Repères devait permettre. Ce n'est donc pas une nouvelle fonctionnalité qu'on ajoute : c'est un chemin qu'on raccourcit pour que le comportement déjà voulu se produise enfin.

## La solution validée

### Le bouton « Journal de parcours »

**Révélation progressive, pas visible dès le premier jour.** Le bouton reste masqué tant que la personne n'a créé aucun Repère. La découverte initiale continue de se faire via la tuile « Mes Repères » de la Boîte à outils, exactement comme aujourd'hui (le signal de pulse unique déjà existant sur cette tuile n'est pas modifié). Dès qu'un premier Repère est créé, peu importe comment (tuile Boîte à outils ou geste ancré sur une recommandation), le bouton apparaît et reste ensuite définitivement visible sur toutes les pages.

**Identité visuelle volontairement différente des trois icônes existantes** (préférences, sauvegarde de session, aide). Ces trois-là forment une famille cohérente d'icônes techniques ; Repères n'est pas un réglage système, c'est un espace personnel. Une forme différente (carnet, feuille) plutôt qu'un pictogramme rond dans le même style. Visible et clairement identifiable comme différent, sans pour autant être plus imposant qu'un vrai bouton d'action principal (type « Continuer » du parcours guidé) — distinct par la forme, pas par une taille qui le ferait rivaliser avec les actions premières de l'application, en particulier pendant le parcours guidé, moment où l'attention de la personne est déjà sollicitée.

**Nom retenu : « Journal de parcours ».** Décision explicite à consigner : ce nom est une étiquette d'accueil chaleureuse, pas un changement de nature du contenu. Ce que ce « journal » contient reste exactement ce que Repères a toujours été : des entrées structurées (un type choisi dans une taxonomie fixe, une source éventuelle, une date), jamais un champ de texte libre à la création. La distinction déjà actée depuis la conception initiale — *« un Repère n'est pas une note »* — reste pleinement valable. Le nom ne doit jamais servir de justification, plus tard, pour introduire une saisie libre à la création.

### Le mini-panneau (popover)

Ouvert au clic sur le bouton, sans quitter la page en cours — même patron que les panneaux préférences et aide déjà existants dans ERIP. Volontairement pauvre en fonctionnalités :
- Un accès rapide à la création (le sélecteur de type déjà existant, inchangé).
- Un aperçu des tout derniers Repères (pas de filtre, pas d'édition, pas de partage ici — ces actions restent réservées à l'écran complet).
- Un lien clair vers l'écran complet « Mes Repères ».

### Confirmation de sauvegarde

**À chaque création d'un Repère, peu importe d'où elle a lieu** (mini-panneau, écran complet, geste ancré sur une recommandation du Bilan CV) : un bref pulse sur le bouton « Journal de parcours » (quelques secondes), pour confirmer visuellement que l'élément est bien arrivé dans son espace permanent.

Ce pulse est distinct du signal de découverte unique déjà existant sur la tuile de la Boîte à outils : il ne s'agit pas d'inviter à découvrir une fonctionnalité, mais de confirmer un geste que la personne vient de faire elle-même. Ce n'est donc pas une sollicitation au sens de la règle « Repères ne sollicite jamais l'attention au-delà du signal unique » — c'est une réponse immédiate à une action initiée par la personne, pas une initiative du module.

**Rappel du contenu du dernier Repère.** Le mini-panneau affiche, en évidence, ce qui vient d'être enregistré : le texte source s'il s'agit d'un geste ancré (« Recommandation : reformuler l'accroche »), ou le type choisi s'il s'agit d'un geste libre (« Idée du 15/08 »). Précision technique : un Repère n'a pas de champ « titre » à proprement parler — cet affichage réutilise les champs déjà existants (`source`, `type`, `date`), rien de nouveau à stocker.

### L'écran complet, accessible depuis n'importe quelle page

Le lien « Voir tous mes Repères » du mini-panneau ouvre l'écran complet déjà existant (`pageReperes()`), inchangé dans son contenu. Un point de comportement à traiter explicitement à l'implémentation : le bouton « Retour » de cet écran doit désormais ramener la personne sur la page où elle se trouvait avant d'ouvrir Repères, pas systématiquement sur l'accueil comme c'est le cas aujourd'hui (seul chemin d'accès prévu jusqu'ici). ERIP garde déjà en mémoire la page courante et l'historique de navigation ; ce comportement s'appuiera sur cette information existante.

## Prochaines étapes

1. ~~Cartographie technique précise de ce chantier~~ — voir ci-dessous, validée avant toute ligne de code.
2. Implémentation, testée en navigateur avant d'être considérée terminée.
3. Une fois ce chantier clos et testé, ouverture du chantier 2 (nouveaux points d'ancrage), pas avant.

---

## Cartographie technique

**Résultat notable, à souligner** : ce chantier n'ajoute quasiment aucun nouveau point de contact dans `js/app.js` ou `data/metiers.js`. Tout ce qui est dynamique (visibilité, contenu, événements) reste entièrement piloté par `modules/reperes/index.js`, exactement comme le principe directeur du module l'exige. C'est la conséquence directe d'avoir traité le bouton permanent comme un nouvel ancrage DOM que Repères possède, au même titre que `app`, plutôt que comme un élément géré par l'orchestrateur.

### Point de contact avec `index.html` — le seul nouveau, minimal

Une coquille statique et vide, sur le même principe que `#app` : un simple point d'ancrage, jamais de contenu ni de comportement écrit à cet endroit.

```html
<button type="button" id="btnJournalParcours" hidden aria-label="Journal de parcours" title="Journal de parcours"></button>
<div id="panneauJournalParcours" hidden></div>
```

`hidden` par défaut sur les deux : c'est `modules/reperes/index.js` qui décide, au chargement, s'il faut les révéler — jamais `index.html` lui-même. Si `modules/reperes/` disparaissait, ce bouton resterait un fantôme invisible et inerte, sans erreur, exactement le même comportement que les autres points de contact déjà gardés.

### Aucun nouveau point de contact avec `js/app.js`

Le bouton et son panneau sont entièrement pris en charge par l'extension de `reperesInitialiser()`, déjà un point de contact existant, déjà appelé une seule fois au chargement (`DOMContentLoaded`). Aucune ligne supplémentaire à ajouter dans `app.js` pour ce chantier.

> **Note (2026-08-19, audit de cohérence documentaire)** : ce n'est plus vrai depuis une session ultérieure à ce chantier — `naviguerVers()` (`js/app.js`, appelée à chaque navigation) appelle désormais `reperesApresNavigation()` pour repositionner `#btnJournalParcours` selon l'écran atteint. Ce point de contact est réel et nécessaire : ne pas le retirer en le jugeant superflu sur la foi de ce paragraphe.

### Dépendances nouvelles

| Dépendance | Nature | Justification |
|---|---|---|
| `#btnJournalParcours` / `#panneauJournalParcours` (ancres DOM, `index.html`) | Structure transversale | Même statut que `app` : un point d'insertion que Repères possède et gère intégralement, pas une logique d'un autre module. |
| `pageActuelle` (variable globale, `js/app.js`) | État transversal | Lue (jamais modifiée) par `reperesDemarrer()` pour capturer la page d'origine avant de naviguer vers l'écran complet -- même famille que `dossier`/`app`, un état partagé par toute l'application, pas une logique d'un module métier. |

Aucune autre dépendance nouvelle. Pas de champ supplémentaire dans `dossier` : la visibilité du bouton se déduit directement de `dossier.reperes.length > 0`, rien à stocker en plus.

**Décision assumée, plus simple qu'envisagé initialement** : le bouton se masque à nouveau si la personne supprime tous ses Repères, plutôt que de rester révélé pour toujours via un indicateur séparé. Plus simple, aucune modification du modèle de données, cohérent avec « pas de donnée ajoutée sans besoin réel prouvé ». Si l'usage réel montre que ça surprend les gens (bouton qui disparaît après suppression du dernier Repère), on ajoutera l'indicateur séparé à ce moment-là, pas avant.

### Modèle de données

Inchangé. `dossier.reperes` reste exactement ce qu'il est. Le mini-panneau et la confirmation lisent des champs déjà existants (`type`, `source`, `date`) ; rien de nouveau à calculer ou stocker.

### Façade publique

**Aucune fonction publique nouvelle.** Tout reste privé : ni `app.js` ni `data/metiers.js` n'ont besoin d'appeler quoi que ce soit de neuf. `reperesInitialiser()`, déjà publique et déjà appelée, voit seulement son contenu interne s'étoffer.

### Fonctions privées nouvelles, rangées par catégorie

- **Stockage** : rien de nouveau — `_reperesListe()` suffit à connaître le nombre de Repères existants.
- **Rendu** :
  - `_reperesRenduPanneauJournal()` — contenu du mini-panneau : déclencheur de création rapide (réutilise `_reperesRenduPicker()`, aucune duplication), aperçu des derniers Repères, lien vers l'écran complet.
  - `_reperesRenduApercuDerniers(n)` — rendu allégé des `n` Repères les plus récents, volontairement distinct de `_reperesRenduItem()` : pas d'accordéon, pas d'actions (partager/discuté/supprimer), juste de quoi confirmer visuellement ce qui a été gardé. Une fonction séparée plutôt qu'un paramètre ajouté à `_reperesRenduItem()`, pour ne pas faire porter deux responsabilités différentes à la même fonction.
- **Événements** :
  - `_reperesMettreAJourJournal()` — fonction pivot, appelée à l'initialisation et après chaque création : ajuste la visibilité du bouton (`hidden` selon `_reperesListe().length`), rafraîchit le contenu du panneau s'il est ouvert.
  - `_reperesDeclencherPulseJournal()` — anime brièvement le bouton (quelques secondes), sur le même principe que `_reperesMontrerConfirmation()` déjà existante (ajout d'une classe, retrait différé par `setTimeout`). Déclenchée depuis `_reperesCreer()`, donc systématiquement, quel que soit l'endroit où la création a eu lieu (mini-panneau, écran complet, geste ancré) — conforme à ta réponse « partout, à chaque création ».
- **Façade interne (toujours privée)** :
  - `reperesInitialiser()` (existante, étendue) : appelle désormais aussi `_reperesMettreAJourJournal()` et branche le clic sur `#btnJournalParcours` (bascule l'ouverture du panneau, sur le même patron que les panneaux préférences/aide déjà existants dans `app.js`).

### Comportement précis des règles déjà validées

- **Visibilité** : `#btnJournalParcours.hidden = _reperesListe().length === 0`, réévalué à chaque appel de `_reperesMettreAJourJournal()`.
- **Identité visuelle** : icône propre à Repères (un carnet), injectée par `reperesInitialiser()` dans le bouton — jamais codée en dur dans `index.html`, pour que ce fichier reste une coquille générique. Classes CSS dédiées dans `reperes.css`, distinctes de la famille visuelle des trois icônes existantes, sans dépasser leur gabarit.
- **Confirmation « dernier Repère »** : le premier élément de `_reperesListe()` (déjà trié du plus récent au plus ancien, `unshift()` à la création) sert de source à l'affichage — aucune nouvelle logique de tri à écrire.
- **Retour dynamique de l'écran complet** : `reperesDemarrer()` (existante) capture `pageActuelle` dans une variable privée (`_reperesPageOrigine`) avant d'appeler `naviguerVers('reperes')`. `_reperesRenduEcran()` utilise cette valeur (repli sur `'cv'` si absente) au lieu du `'cv'` actuellement figé en dur dans son appel à `barreNavigation()`. Le lien « Voir tous mes Repères » du mini-panneau appelle cette même fonction, sans en créer une nouvelle.

### Étapes de test avant de considérer le chantier terminé

1. Session neuve (aucun Repère) : bouton absent, aucune trace dans le DOM visible à l'utilisateur autrement que masquée.
2. Premier Repère créé, peu importe le chemin (Boîte à outils, geste ancré) : bouton apparaît, pulse se déclenche.
3. Panneau ouvert depuis n'importe quelle page (au minimum : accueil, Bilan CV, l'écran Repères lui-même) : contenu correct, création rapide fonctionnelle.
4. Clic sur « Voir tous mes Repères » depuis une page qui n'est pas l'accueil, puis clic sur « Retour » : la personne revient bien sur la page de départ, pas sur l'accueil.
5. Suppression de tous les Repères : bouton se masque à nouveau (comportement assumé, voir plus haut).
6. Navigation répétée, créations répétées : aucune duplication d'écouteurs, aucune erreur console — même vigilance que pour toutes les étapes précédentes du module.
