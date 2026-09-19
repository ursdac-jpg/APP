# Module Repères — Architecture technique

**Statut** : V1 fonctionnelle complète (étapes 1 à 7 implémentées et vérifiées en navigateur). Ce document a précédé le code puis l'a suivi à chaque étape. Toute décision d'architecture prise pendant l'implémentation y a été ajoutée, jamais laissée seulement dans une conversation.

**Vocabulaire** : les libellés affichés ont été renommés après un retour critique sur le mot « Partagé », qui impliquait à tort une transmission réelle (aucune n'existe : pas de backend, rien n'est envoyé automatiquement). Interface désormais : « Prêt à en parler » / « Pour moi ». Le champ interne (`r.etat`, valeurs `'partage'`/`'prive'`) n'a volontairement pas changé, pour ne courir aucun risque de migration sur des sessions déjà sauvegardées — ce document et le code continuent donc d'employer ce nom de champ et ces valeurs en interne, seul l'habillage textuel a changé.

Ce document suit la même discipline que `modules/bilan-candidature/ARCHITECTURE_TECHNIQUE.md`, avec une correction volontaire : ce dernier autorisait tout le rendu et l'orchestration d'écran à rester dans `app.js`. Ce n'est pas reconduit ici, c'est justement l'erreur que ce chantier doit éviter de reproduire.

---

## Principe directeur

`app.js` est l'orchestrateur, jamais le lieu d'exécution de la logique du module. Toute la logique métier, le rendu, les événements et l'état du module Repères restent dans `modules/reperes/`.

Le flux de dépendance est strictement à sens unique : `app.js` appelle le module par sa façade publique. Le module n'appelle jamais `app.js`, à une exception près, explicite (réutilisation d'un utilitaire générique déjà existant, voir plus bas), documentée précisément plutôt que laissée implicite.

**Précision apportée à l'étape 2** : « réutiliser un utilitaire générique déjà existant » ne se limite pas à `echapperAttribut()` (confirmée générique, voir « Discipline des dépendances externes » ci-dessous). `pageReperes()` appelle aussi `barreNavigation()` (`js/app.js`), la primitive déjà partagée par toutes les pages de l'application pour leur pied de page (Retour/Accueil/Suivant). Ce n'est pas une dépendance vers un autre module métier, mais vers un composant d'interface transversal, au même titre qu'`echapperAttribut()` — la distinction qui compte n'est pas « app.js » vs « module », mais « logique propre à un module métier » vs « brique générique partagée par toute l'application ».

**Règle de façade posée après l'étape 2** : aucune fonction publique n'est ajoutée « au cas où ». Une fonction n'est exposée par `modules/reperes/index.js` que lorsqu'un appel réel, provenant de l'extérieur du module, existe déjà à cet instant précis. La liste de façade ci-dessous décrit le contrat *cible* validé par la cartographie ; elle n'implique pas que chaque fonction soit déjà écrite — chacune n'apparaît dans le code qu'au moment où son appelant réel est lui-même écrit. Préférer agrandir la façade plus tard plutôt que publier une API trop large dès le départ.

**Test de suppression, résultat exact vérifié à l'audit final (V1)** : supprimer `modules/reperes/` casserait davantage que ses seuls points d'entrée — précision qui corrige une affirmation trop optimiste tenue jusqu'ici dans ce document.

- `js/app.js`, table `routes` (`'reperes': pageReperes`) : **référence directe, non gardée** — contrairement aux 3 autres points de contact d'`app.js` (initialisation, bouton d'ancrage, branchement du bouton d'ancrage, tous derrière `if (typeof ... === 'function')`), celle-ci provoquerait une `ReferenceError` à l'exécution de `var routes = {...}`, qui **casserait le chargement de tout `js/app.js`**, pas seulement Repères. Ce n'est pas une régression propre à Repères : `'bilan': pageBilanCandidature`, juste au-dessus dans la même table, a exactement la même faiblesse — un défaut hérité de la convention `routes`, jamais corrigé nulle part dans le projet, pas introduit par ce chantier.
- `data/metiers.js`, la tuile (`tuile('btnChoixReperesAccueil', ...)`) et le déclenchement du pulse de découverte : **non conditionnés à l'existence du module** — une tuile « Mes Repères » resterait visible et cliquable, son clic ne ferait simplement plus rien (`reperesDemarrer` gardé côté handler). Dégradation silencieuse, pas un crash, mais un élément d'interface mort resterait affiché.
- `index.html` (balises `<script>` et `<link>`) et `css/style.css` (règle `.aide-pulse-repere`) : sans effet réel, 404 silencieux ou règle orpheline.

**Conclusion honnête** : le module lui-même (son code, sa donnée, sa logique) est bien autonome et supprimable. Mais aujourd'hui, `js/app.js` et `data/metiers.js` devraient être modifiés (2 fichiers, pas 0) pour que le reste d'ERIP continue de fonctionner proprement après une suppression — la table `routes` en particulier romprait l'application entière, pas seulement Repères. Non corrigé ici : c'est une observation de cet audit, pas une évolution demandée.

## Titre et texte à la création (geste libre uniquement)

Ajouté après un test utilisateur réel de Denis : passé quelques dizaines de Repères, plusieurs affichaient simplement « Réflexion personnelle » dans la liste (aucun texte ajouté à la reprise), rendus impossibles à distinguer entre eux. Deux évolutions, strictement limitées au **geste libre** (créé directement depuis l'écran Repères ou le panneau Journal) — le geste **ancré** (déclenché depuis un autre module, ex. Lexique) reste inchangé, toujours un geste unique et silencieux, pour ne jamais interrompre la lecture en cours ailleurs dans ERIP :

1. **Écran de saisie ouvert automatiquement** (`_reperesOuvrirSaisieLibre()`), juste après le choix du type, à la place de la simple confirmation discrète. Contient un champ Titre et un champ Texte, tous deux facultatifs, sauvegardés en direct (`input` → écriture immédiate dans `dossier.reperes`, aucun bouton "Enregistrer"). Curseur posé automatiquement dans le champ Texte à l'ouverture (autofocus) pour que la dictée vocale (Win+H) fonctionne sans clic supplémentaire. Le bouton de fermeture (« C'est noté ») ne déclenche aucun enregistrement — un simple repère de fin de geste, jamais un bouton qui laisserait croire que rien n'est sauvegardé avant d'y cliquer (décision explicite, discutée avec Denis : nommer ce bouton "Valider" aurait réintroduit la confusion qu'on cherchait justement à éviter).
2. **Titre auto-suggéré, jamais imposé** (`_reperesExtraitPourTitre()`) : tant que la personne n'a pas elle-même écrit dans le champ Titre, celui-ci se met à jour en direct avec les premiers mots du texte tapé (tronqués à une frontière de mot, `_REPERES_TITRE_LONGUEUR = 40`). Dès qu'elle y écrit directement, l'auto-suggestion s'arrête définitivement pour ce Repère. **Explicitement pas une IA** : ERIP n'a aucune IA embarquée automatique (aucun appel API, tout passe par copier-coller manuel vers une plateforme externe ailleurs dans l'app) — un vrai résumé généré nécessiterait de rouvrir cette question hors de portée de cette évolution. `reperesCreerAvecTexte()` (façade utilisée par le Carnet, texte déjà connu à la création) applique la même auto-suggestion, sans écran de saisie supplémentaire puisque le texte existe déjà.

**Affichage** (`_reperesRenduItem()`) : le titre prime sur la source ancrée, elle-même prime sur le texte générique « Réflexion personnelle » — `r.titre || r.source || 'Réflexion personnelle'`.

**Une réserve explicitement écartée** : une étape de confirmation séparée avant la fermeture (« voici le titre proposé, modifiez si besoin, puis Enregistrer ») a été envisagée puis explicitement rejetée — le titre est déjà visible et modifiable en permanence pendant toute la saisie, une étape supplémentaire ne montrerait rien de nouveau et réintroduirait le problème du bouton "Enregistrer".

## Discipline des dépendances externes

Posée par Denis à l'étape 3, valable pour tout futur module : toute dépendance de Repères vers un élément extérieur au dossier (fonction globale, variable globale, structure d'un autre module) n'est jamais la norme — c'est une exception, qui doit être assumée et documentée ici, jamais laissée implicite. Une dépendance non listée ici ne devrait pas exister dans le code.

**Dépendances actuellement acceptées, toutes justifiées individuellement :**

| Dépendance | Nature | Justification |
|---|---|---|
| `dossier` (variable globale) | État partagé | Seule façon d'exister dans ERIP sans compte ; `dossier.reperes` est la portion que le module possède, décision déjà actée. |
| `app` (variable globale, ancre DOM) | Structure transversale | Point d'insertion unique et déjà partagé par toutes les pages routées ; pas une logique d'un autre module. |
| `#btnJournalParcours` / `#panneauJournalParcours` (ancres DOM, `index.html`) | Structure transversale | Chantier « Journal de parcours » (`docs/CHANTIER_JOURNAL_DE_PARCOURS.md`) — même statut que `app`, coquille vide possédée et gérée intégralement par ce module. |
| `pageActuelle` (variable globale) | État transversal | Lue par `reperesDemarrer()` pour permettre un retour dynamique vers la page d'origine, jamais modifiée. |
| `barreNavigation()` (`js/app.js`) | Utilitaire transversal | Composant de pied de page déjà partagé par toutes les pages de l'application, pas une dépendance vers un module métier. |
| `naviguerVers()` (`js/app.js`) | Utilitaire transversal | Dispatcher central déjà partagé par toute navigation entre routes. |
| `trackEvenement()` (`js/app.js`) | Utilitaire transversal | Télémétrie déjà systématique pour tout événement métier significatif dans le reste de l'application (voir `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`) ; ajoutée à l'étape 3 pour `repere_cree`. |
| `echapperAttribut()` (`js/app.js`) | Utilitaire transversal | Confirmée générique à l'étape 3 (lue directement : simple échappement de chaîne, aucune structure de Bilan CV) — utilisée par `_reperesRenduBoutonAncre()` pour porter le `libelle` du geste ancré dans un attribut HTML. |
| `confirmerAction()` (`js/app.js`) | Utilitaire transversal | Modale de confirmation déjà systématique pour toute action destructrice dans ERIP (`reinitialiserSession()`, imports...) ; ajoutée à l'étape 6 pour la suppression d'un Repère — jamais une confirmation maison réinventée. |
| `ouvrirFenetreERIP()` / `fermerFenetreERIP()` (`js/app.js`) | Utilitaire transversal | Primitive de fenêtre modale déjà partagée par tout ERIP (déjà utilisée par `reperesCreerAvecTexte()` avant cette étape) ; réutilisée par `_reperesOuvrirSaisieLibre()` (voir « Titre et texte à la création (geste libre) » ci-dessous). |

## Ce que le module lit

- `dossier.reperes` — sa propre donnée, la seule qu'il connaît dans `dossier`.
- Pour le geste ancré, jamais les objets internes d'un autre module (jamais une `Recommandation` ni un `Axe` du Bilan CV directement, et jamais aucune structure future d'un autre module). Repères reçoit un `contratSource`, dont la forme, les responsabilités de chaque partie et les garanties sont désormais définies dans un document transverse, indépendant de Repères et de tout module source : **`docs/CONTRAT_ANCRAGE_ERIP.md`**. Ne pas redéfinir ce protocole ici — ce document-ci ne décrit que la façon dont Repères, spécifiquement, l'implémente.

**Limite à assumer honnêtement, pas à masquer** : pour le Bilan CV aujourd'hui, le code qui construira ce `contratSource` vit physiquement dans `app.js`, puisque le rendu du Bilan CV n'a jamais été extrait vers `modules/bilan-candidature/` (voir `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`). Le contrat d'ancrage reste correct, cette limite hérite d'une dette antérieure à ce chantier, que ce chantier ne corrige pas. Pour tout module construit proprement (Repères lui-même, `decouverte-competences`), la construction du `contratSource` se ferait entièrement à l'intérieur du module, sans aucune exception.

## Copie ou lecture en direct du contexte d'origine

Décision tranchée, définitive pour cette V1 : **Repères conserve une copie, jamais une relecture en direct.** Cette règle est désormais aussi une clause du protocole transverse (`docs/CONTRAT_ANCRAGE_ERIP.md`, « Moment de la copie »). Ce qui suit ici est le raisonnement propre à Repères qui a mené à cette décision, pas une redéfinition du contrat.

Le `contratSource` est lu une seule fois, au moment précis où la personne clique sur « Garder comme Repère ». À cet instant, `libelle` est recopié dans `dossier.reperes`, sous forme de chaîne figée. Passé ce moment, Repères ne connaît plus rien du module d'origine, il n'en dépend plus, il ne peut plus être affecté par ce qui s'y passe ensuite.

Deux raisons indépendantes, pas une seule :

- **Raison technique, qui rend l'alternative impossible et pas seulement mauvaise** : l'état du Bilan CV n'est jamais écrit dans le stockage local (à vérifier explicitement, voir `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`, mais déjà établi comme très probable). Une relecture en direct, une fois la session terminée ou l'appareil changé, tomberait sur une donnée qui n'existe simplement plus.
- **Raison de fond, valable même si la première disparaissait un jour** : un Repère est la trace de ce que la personne pensait à un instant donné. S'il changeait silencieusement parce que le contenu d'origine a été modifié ou supprimé, ce ne serait plus la même chose qu'elle retrouverait à la reprise. Ça contredirait la garantie déjà posée dans la Constitution, les informations appartiennent à la personne, pas au module qui les a vues naître la première fois.

Conséquence directe sur le modèle de données : `dossier.reperes[n].source` est une chaîne de texte simple, jamais un identifiant ni une référence vers un autre module.

## Ce que le module écrit

- `dossier.reperes` uniquement. Aucune écriture ailleurs dans `dossier`, à aucun moment, par aucune fonction du module.

## Modules que Repères appelle

Aucun module métier (ni `bilan-candidature`, ni aucun autre module de `modules/`).

`echapperAttribut()` (`js/app.js`) réutilisée, pas réécrite (voir « Discipline des dépendances externes » ci-dessus) — confirmée générique à l'étape 3.

## Modules qui peuvent appeler Repères

`app.js` uniquement, via `modules/reperes/index.js`. Aucun autre module ne doit appeler Repères directement, y compris le Bilan CV — même le bouton affiché sur une recommandation est inséré par `app.js`, jamais par un appel direct d'un module à l'autre.

## Points de contact avec `app.js` — liste fermée

1. Une entrée dans la table `routes` déjà existante (`js/app.js`) : `'reperes': pageReperes`.
2. Un appel d'initialisation unique au chargement (`js/app.js`, bloc `DOMContentLoaded`), sur le même principe que `initPreferencesAffichage()` déjà présent à cet endroit.
3. Un point d'insertion dans le rendu déjà existant de la Boîte à outils, pour la nouvelle tuile « Mes Repères ». **Correction factuelle apportée à l'étape 2** : ce rendu ne vit pas dans `js/app.js` mais dans `data/metiers.js` (`ouvrirChoixPreparationAccueil()`) — la cartographie initiale le supposait à tort dans `app.js`. Le principe reste identique (point de contact unique, fonction dédiée `reperesDemarrer()`), seul l'emplacement réel change.
4. Un point d'insertion dans le rendu déjà existant du Bilan CV. **Implémenté et vérifié à l'étape 3** : dans `htmlBilanRapport()`, chaque recommandation construit son propre `contratSource` (`{ libelle: 'Recommandation : ' + reco.contenu }`) et appelle `reperesBoutonAncre(contratSource)`, dont le HTML est inséré tel quel. Dans `brancherEvenementsBilanCandidature()`, branche « Rapport », `reperesBrancherBoutonAncre()` est appelée juste après le reste du branchement de cette page — paire rendu/branchement, exactement comme toute page de l'application applique déjà à son propre contenu. **Étendu au chantier 2** (`docs/CHANTIER_JOURNAL_DE_PARCOURS.md`) : chaque axe analysé construit désormais aussi son propre `contratSource` (`{ libelle: 'Axe : ' + nomAxe + ' (' + label + ')' }`), sur le même modèle — aucun nouveau branchement à écrire, `reperesBrancherBoutonAncre()` déjà appelée une seule fois pour toute la page couvre aussi ces boutons. Vérifié en navigateur. Restent hors scope, volontairement : les mots du lexique, et un point distinct, non encore construit, pour le texte enrichi de définitions.
5. Une entrée fournie au système d'aide déjà existant (`AIDE_PAGES`) : le contenu vient du module via la façade, la structure d'accueil reste dans `app.js`.
6. Le signal de découverte déjà existant (mécanisme de pulse unique, transversal). **Implémenté et vérifié à l'étape 7, précision corrigée par rapport à la formulation initiale** : ce n'est pas après un appel à la façade de création que le signal se déclenche, mais à la première ouverture de la Boîte à outils (`data/metiers.js`, `ouvrirChoixPreparationAccueil()`) — même mécanisme *exact* que `declencherPulseDecouverteDisquette()` (`js/app.js`) : un flag `localStorage` dédié (`aps_reperes_decouverte_vue`), jamais redéclenché une fois vu. Ce qui reste vrai de la formulation initiale : c'est `app.js`/`data/metiers.js` qui décide de déclencher ce signal, jamais Repères qui le réclame lui-même (cohérent avec « Responsabilité du module », « ne sollicitera jamais l'attention au-delà du signal unique »). Zéro ligne dans `modules/reperes/` pour ce point de contact.
7. Le bouton/panneau permanent du Journal de parcours (`#btnJournalParcours`/`#panneauJournalParcours`, `index.html`) — voir « Discipline des dépendances externes » ci-dessus et `docs/CHANTIER_JOURNAL_DE_PARCOURS.md` pour le détail complet. Zéro ligne dans `js/app.js`/`data/metiers.js` pour ce point de contact : entièrement piloté par `reperesInitialiser()`, déjà un point de contact existant (point 2).
8. Un point d'insertion dans le rendu déjà existant de « Faisons le point » (`pageRevelation()`, `js/app.js`, et `genererHTMLMetiers()`, `data/metiers.js`) — **ajouté au chantier 2**, chaque métier suggéré (sous-section « Pourquoi ces métiers ? ») construit son propre `contratSource` (`{ libelle: 'Métier suggéré : ' + metier.nom }`). Contrairement au Bilan CV, `pageRevelation()` n'appelait encore aucune fonction Repères : `reperesBrancherBoutonAncre()` y est appelée pour la première fois, en fin de fonction. **Bug réel trouvé et corrigé à cette occasion** (voir `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`) : `pageRevelation()` se re-rend à elle-même à chaque interaction, ce qui rappelait ce branchement de nombreuses fois de suite — le bouton permanent du Journal (point 7), jamais détruit entre deux rendus, accumulait des écouteurs en double. Corrigé par une garde d'idempotence dans `_reperesBrancherEvenementsPickers()`, vérifié en navigateur sous plusieurs angles.

Aucun autre point de contact n'est autorisé sans mise à jour de ce document.

## Façade publique (`modules/reperes/index.js`)

**Déjà écrites, avec un appelant réel :**

- `pageReperes()` — appelée par `routes['reperes']` (js/app.js).
- `reperesDemarrer()` — appelée par la tuile Boîte à outils (`data/metiers.js`), ajoutée à l'étape 2. Repères n'a aucune précondition (contrairement au Bilan CV, qui exige un CV existant) : cette fonction se contente d'appeler `naviguerVers('reperes')`, mais existe pour respecter la convention déjà établie par les 4 autres tuiles.
- `reperesInitialiser()` — appelée depuis `DOMContentLoaded` (js/app.js), ajoutée à l'étape 2.
- `reperesBoutonAncre(contratSource)` — appelée par `htmlBilanRapport()` (js/app.js), ajoutée à l'étape 3. Rendu seul, retourne le HTML du bouton + son picker ; ignore silencieusement un `contratSource` invalide (voir `docs/CONTRAT_ANCRAGE_ERIP.md`).
- `reperesBrancherBoutonAncre()` — appelée par `brancherEvenementsBilanCandidature()` (js/app.js), ajoutée à l'étape 3. Réutilise en interne la même fonction privée de branchement que l'écran Repères lui-même (`_reperesBrancherEvenementsPickers()`) — aucune duplication entre geste libre et geste ancré.
- `reperesLibellesTypes()` — appelée par `_regardExterieurFormaterRepere()` (`modules/regard-exterieur/index.js`), ajoutée lors du regard critique final de ce module (avant, il dupliquait la taxonomie à la main, un risque de divergence). Retourne une copie `{cle: libellé}` de `_REPERES_TYPES`, jamais la variable elle-même.
- `reperesApresNavigation()` — appelée par `naviguerVers()` (js/app.js), même patron que `regardExterieurApresNavigation()`. Repositionne dynamiquement `#btnJournalParcours` en délégant à `positionnerIconePersistante()` (js/app.js, utilitaire transversal généralisé lors de l'implémentation du module Carnet, qui en avait besoin pour son propre bouton) — plus jamais une valeur fixe en pixels (voir `docs/TESTS_REGARD_EXTERIEUR.md`, cycle 9, pour l'historique de cette correction).
- `reperesCreerAvecTexte(texte, onCree)` — appelée par le bouton « Transformer en Repère » (`modules/carnet/index.js`), ajoutée pour l'étape 3/5 du chantier Carnet (`docs/CHANTIER_CARNET.md`, partie 4). Contrat frère du geste ancré, pas une extension de `reperesBoutonAncre()`/`docs/CONTRAT_ANCRAGE_ERIP.md` : porte un texte déjà rédigé, jamais une référence à un moment de l'application. Ouvre `_reperesRenduPicker()` réutilisé tel quel dans une fenêtre `ouvrirFenetreERIP()` générique (l'appelant peut être n'importe quelle page, pas seulement l'écran Repères) ; au choix du type, construit le Repère avec ce texte déjà rempli (`source: null`, un geste libre), puis rappelle `onCree(repereCree)` — jamais avant, pour que le Carnet ne marque sa note d'origine comme transformée qu'après un succès réel.

**Pas encore écrites, en attente d'un appelant réel (contrat cible, pas du code actuel) :**

- `reperesEnrichirTexteLexique(texteBrut)` — le lexique de mots définis (ancrage depuis un mot du Bilan CV, pas seulement une recommandation) n'a pas été construit pendant l'étape 3. **Scope explicitement réduit pour la V1** : le geste ancré ne couvre que les recommandations (voir point de contact 4). Mots du lexique et axes analysés restent des extensions possibles, pas une V1 incomplète — la boucle complète (créer/consulter/enrichir/partager/reprendre) fonctionne déjà sans eux.
- `reperesContenuAide()` — au moment où l'entrée `AIDE_PAGES` (point 5 ci-dessus) sera écrite.

Rien d'autre n'est, ou ne sera, exposé sans un appelant réel déjà identifié.

## Fonctions strictement privées

Rangées par catégorie (discipline posée à l'étape 3, appliquée à chaque nouvelle fonction) :

- **Modèle** : `_REPERES_TYPES` (taxonomie figée), `_reperesGenererId()`, `_reperesDateAujourdhui()`, `_reperesConstruire(type, contratSource)` (validation défensive du `contratSource` incluse).
- **Stockage** : `_reperesListe()`, `_reperesEnregistrer(repere)`, `_reperesTrouver(id)`, `_reperesSupprimer(id)` (étape 6).
- **Rendu** : `_reperesRenduEcran()`, `_reperesRenduPicker(idPicker, libelleEchappe)`, `_reperesRenduBoutonAncre(contratSource)`, `_reperesRenduFiltre()`, `_reperesRenduGroupe(titre, liste)`, `_reperesRenduItem(r)`, `_reperesRenduListe()` (étape 4), `_reperesRenduAstuceDictee()` (retour utilisateur : encart « Win + H », même texte/style que Découverte des compétences et le Carnet, jamais mutualisé entre modules — copie assumée dans chacun).
- **Événements** : `_reperesBrancherEvenementsPickers()`, `_reperesToggleTousLesPickers()`, `_reperesFermerTousLesPickers()`, `_reperesMontrerConfirmation()`, `_reperesRafraichirListe()`, `_reperesBrancherEvenementsListe()` (étapes 4-6 : filtre, ouverture d'item, enrichissement, partage, discuté, suppression).
- **État d'affichage, jamais persisté** : `_reperesFiltreActuel` (« tous » / « partages ») — ne modifie jamais une donnée d'un Repère, seulement ce qui est affiché à l'instant T, décision déjà actée dans la fiche fonctionnelle.
- **Hésitation assumée, notée plutôt que masquée** : `_reperesCreer(type, contratSource)` assemble modèle + stockage + télémétrie, ne rentre proprement dans aucune des 4 catégories ci-dessus. Rangée sous Stockage (son effet dominant), détail dans `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`.

Rien à venir : toutes les fonctions prévues par la boucle V1 (créer, consulter, enrichir, partager, marquer discuté, supprimer) sont écrites. Le lexique de mots définis reste hors scope V1 (voir façade ci-dessus).

**Décision prise à l'étape 2, généralisable aux futurs modules** : la lecture/écriture de `dossier.reperes` passe par un accesseur privé unique (`_reperesListe()`) qui initialise le tableau s'il est absent, à chaque appel. Contrairement au précédent `dossier.ia` (`js/app.js`), dont le garde-fou `if (!dossier.ia) {...}` est répété à la main à 6 endroits différents (chaque point de restauration de session), ce module centralise sa propre défense une seule fois, en interne — `app.js` n'a jamais besoin de connaître, ni de répéter, comment `dossier.reperes` doit être initialisé. Noté dans `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md` comme pattern à proposer aux futurs modules.

## Persistance et continuité

`dossier.reperes` fait partie de `dossier`, qui est sérialisé dans son ensemble par le mécanisme de sauvegarde de session déjà existant. **Confirmé à l'étape 2** (lecture directe de `sauvegarderSession()`, `js/app.js`) : cette fonction fait `JSON.parse(JSON.stringify(dossier))` sans liste blanche de champs — `dossier.reperes` y sera donc automatiquement inclus, sans code supplémentaire. **Confirmé à l'étape 7** (aller-retour réel en navigateur pour la sauvegarde locale ; lecture directe du code pour le chemin multi-appareil) : `exporterSessionFichier()`/`importerSessionFichierSelectionne()` empruntent exactement le même chemin (`sauvegarderSession()` en export, `dossier = donnees.dossier` en import) — un seul mécanisme de fond, deux points d'entrée, `dossier.reperes` couvert sur les deux sans code spécifique à Repères.

## Feuille de style

`modules/reperes/reperes.css`, créé à l'étape 3 au moment précis où le sélecteur de type en a eu besoin (pas avant). Chargé par un `<link>` dédié dans `index.html`, après `css/style.css` pour pouvoir réutiliser ses variables (`--accent`, `--bg-subtle`, `--border`, `--text-muted`, `--success-strong`...). Ne redéfinit aucune classe déjà présente dans `css/style.css` — les classes qu'il définit (`.reperes-type-picker`, `.reperes-type-grid`, `.reperes-type-btn`...) sont toutes préfixées `reperes-`, propres au module. Les boutons eux-mêmes réutilisent les classes Bootstrap déjà employées partout ailleurs dans ERIP (`.btn.btn-primary.btn-sm`), jamais une classe de bouton réinventée.

## Responsabilité du module

Les dépendances définissent ce que Repères touche. Cette section définit ce qu'il a le droit de faire, et ce qu'il ne fera jamais, quelle que soit la pression d'une évolution future. Chaque ligne reprend une décision déjà prise ailleurs dans ce chantier (Constitution, fiche fonctionnelle, revues qualité), rien n'est inventé ici.

**Repères a le droit de :**

- Capturer une réflexion liée à un contenu déjà affiché ailleurs dans ERIP, ou sans aucun contenu source (geste libre).
- Conserver cette réflexion de façon totalement indépendante de l'état ou de l'existence future du contenu d'origine (conséquence directe de la décision « copie, jamais relecture » ci-dessus).
- Permettre à la personne de rendre un Repère partagé avec son CIP, et de revenir sur ce choix.
- Permettre un enrichissement du texte, toujours optionnel, jamais requis pour qu'un Repère existe.
- Signaler sa propre existence, une seule fois dans toute l'application, via le mécanisme de découverte déjà transversal à ERIP.

**Repères ne fera jamais :**

- Lire ou modifier l'état interne d'un autre module. Le seul point de contact autorisé est la réception ponctuelle d'un `contratSource`, jamais un appel dans l'autre sens.
- Juger, noter, classer ou prioriser automatiquement un Repère ou la personne qui l'a écrit.
- Rendre quoi que ce soit visible, à qui que ce soit, sans un geste explicite et volontaire de la personne.
- Solliciter l'attention au-delà du signal de découverte unique déjà décidé, ni relancer, ni rappeler, ni notifier.
- Devenir un tableau de bord, un système de suivi d'activité, ou un substitut au dialogue humain avec un CIP.
- Collecter des données sensibles (santé, logement, situation familiale) au prétexte d'enrichir une réflexion.
- Dépendre, pour fonctionner ou s'afficher correctement, de la disponibilité continue d'un autre module ou de l'exactitude d'une donnée extérieure à `dossier.reperes`.
- Exiger un compte ou une identification pour exister, conformément au choix déjà posé pour l'ensemble d'ERIP.

## Étapes du plan de migration, rappel

1. Cette cartographie — validée.
2. Point d'entrée : dossier créé, route enregistrée, tuile Boîte à outils, écran vide fonctionnel. **Implémenté et vérifié en navigateur** (tuile visible en 5e position, écran affiché sans erreur console, `dossier.reperes` initialisé à `[]`, retour à l'accueil fonctionnel).
3. Création, ancrée puis libre. **Ordre inversé, justifié explicitement** : le geste libre a été implémenté en premier parce qu'il n'ajoutait aucune dépendance externe nouvelle, cohérent avec la discipline des dépendances externes ci-dessus. **Geste libre implémenté et vérifié en navigateur** (4 types affichés avec icônes, création écrit le bon modèle dans `dossier.reperes`, confirmation inline affichée puis disparaît, Annuler ferme sans créer, navigation répétée vers/depuis la page sans duplication d'écouteurs). **Geste ancré implémenté et vérifié en navigateur** (recommandations du Bilan CV, voir point de contact 4) : bouton visible sous chaque recommandation, distinct du bouton « Améliorer cette recommandation » déjà existant, picker porte le bon libellé dans `data-repere-source`, création écrit `source: "Recommandation : ..."` dans `dossier.reperes`, navigation répétée vers/depuis la page du Bilan sans duplication d'écouteurs, zéro erreur console. Étape 3 complète (libre + ancré).
4. Consultation. **Implémenté et vérifié en navigateur** : filtre « Tous / Partagés uniquement », sections Partagés/Privés (masquées si vides), item replié par défaut, ouverture/fermeture sans re-rendu de l'écran entier. `_reperesRafraichirListe()` cible uniquement `#reperesListeConteneur`, jamais l'écran complet — préserve l'état du picker « + Garder une réflexion » pendant qu'un item est modifié plus bas.
5. Enrichissement. **Implémenté et vérifié en navigateur** : lien « + Ajouter quelques mots » révélé au clic (jamais un champ ouvert par défaut, décision déjà actée), texte sauvegardé sur `input` sans re-rendu (le focus n'est jamais perdu pendant la saisie).
6. Partage et marqueur discuté. **Implémenté et vérifié en navigateur** : bascule Partagé/Privé, marqueur Discuté réversible indépendamment de la visibilité (`peutModifierDiscute = etat === 'partage' || discute`, même règle que la maquette). Suppression ajoutée (déjà présente dans la maquette validée, pas une évolution fonctionnelle nouvelle) avec confirmation (`confirmerAction()`).
7. Continuité. **Vérifié** : sérialisation confirmée par un aller-retour réel navigateur (créer un Repère, sauvegarder, vider `dossier.reperes`, restaurer, comparer — identique) ; le mécanisme d'export/import multi-appareil (`exporterSessionFichier()`/`importerSessionFichierSelectionne()`) confirmé par lecture directe du code comme empruntant exactement le même chemin (`sauvegarderSession()` / `dossier = donnees.dossier`), donc couvert sans code supplémentaire. Signal de découverte unique implémenté et vérifié (voir point de contact 6) : pulse au premier passage seulement, jamais au second.

**Hors scope, noté explicitement, pas un oubli** : ancrage depuis un mot du lexique (les recommandations et les axes analysés sont désormais couverts, voir point de contact 4) ; `reperesEnrichirTexteLexique()`/`reperesContenuAide()` (façade cible sans appelant réel pour l'instant).

Chaque étape a été testée avant la suivante. Toutes vérifiées en navigateur, zéro erreur console sur l'ensemble du parcours.
