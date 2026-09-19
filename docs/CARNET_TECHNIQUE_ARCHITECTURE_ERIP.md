# Carnet technique — Architecture générale d'ERIP

**Statut** : carnet vivant, alimenté pendant l'implémentation du module Repères et des suivants. Il ne concerne pas un seul module, il concerne l'architecture générale d'ERIP.

**Règle d'usage** : une faiblesse notée ici n'est pas corrigée immédiatement, sauf si elle bloque réellement le module en cours de construction. Ce carnet existe pour éviter que chaque chantier devienne une refonte du précédent, tout en gardant une mémoire précise de ce qui mériterait d'être revu un jour.

**Document associé** : `docs/CONTRAT_ANCRAGE_ERIP.md` (créé avant l'implémentation du geste ancré, étape 3 du module Repères) fixe le protocole transverse par lequel n'importe quel module source transmet un contenu à Repères — indépendant du Bilan CV, qui n'en est que le premier utilisateur. Ce carnet-ci reste le lieu des observations et faiblesses générales ; le contrat d'ancrage lui-même vit dans son propre document, pas ici.

---

## Bug réel trouvé et corrigé — élément persistant + rebranchement document-large

**Trouvé pendant le chantier 2 (`docs/CHANTIER_JOURNAL_DE_PARCOURS.md`), en testant l'ancrage depuis `pageRevelation()`.** Généralisable à tout futur module ayant à la fois un élément d'interface persistant (hors de `#app`, jamais détruit par une navigation) et une fonction de branchement d'événements appelée en mode « document entier ».

**Mécanisme du bug** : `#btnJournalParcours`/`#panneauJournalParcours` (le bouton permanent de Repères, voir chantier 1) vivent hors de `#app`, donc ne sont jamais recréés par un changement de page — contrairement à tout le reste du contenu routé. `_reperesBrancherEvenementsPickers()`, appelée sans argument (portée `document` entière) depuis n'importe quelle page utilisant le geste ancré, rebranchait un nouvel écouteur sur les éléments du panneau du Journal à chaque appel, sans jamais nettoyer les précédents — puisqu'ils ne sont jamais recréés, rien ne les supprimait non plus. `pageRevelation()`, qui se re-rend à chaque interaction (contrairement à la plupart des pages d'ERIP), a suffi à faire apparaître le problème : plusieurs Repères créés pour un seul clic après quelques interactions.

**Correction** : garde d'idempotence directement sur les éléments (`if (btn.dataset.reperesLie) { return; }`, posée avant tout `addEventListener`) plutôt qu'un contrôle au cas par cas de qui appelle la fonction et quand. Un élément n'est jamais branché deux fois, quel que soit le nombre de rappels de la fonction sur lui.

**Leçon générale, à vérifier explicitement pour tout futur élément d'interface persistant (hors `#app`)** : si une fonction de branchement peut être rappelée en portée « document entière » alors qu'un élément persistant qu'elle couvre a déjà été branché une première fois, elle doit être idempotente par construction (garde sur l'élément), pas seulement « appelée une fois quelque part » — la portée document-large, commode pour couvrir un contenu ancré dans un module tiers imprévisible, devient un piège dès qu'un élément permanent existe quelque part dans le document.

---

## Contrat d'ancrage vers Repères — vérification demandée par Denis

**Reformulation retenue par Denis, plus juste que le titre initial de cette section** : il s'agit d'un contrat d'ancrage vers Repères, pas d'une architecture générale des interactions entre modules — ERIP n'a qu'un seul destinataire de ce type aujourd'hui, en inventer un nom plus large aurait suggéré une généralité qui n'existe pas.

**Question posée** : le schéma « plusieurs modules sources → Repères, chacun via le Contrat d'ancrage v1 » est-il le bon niveau d'abstraction, ou risque-t-il d'être trop spécifique à Repères ?

**Verdict** : la forme (N sources vers 1 destination) est correcte et n'a pas besoin de changer. Le risque réel n'était pas dans la forme mais dans le nom : présenter ce protocole comme une architecture générale « inter-modules » plutôt que comme, précisément, « le chemin vers Repères » aurait fait croire à une généralité qui n'existe pas encore. Corrigé en ajoutant une section « Portée de ce contrat (v1) » à `docs/CONTRAT_ANCRAGE_ERIP.md`, qui l'assume explicitement.

**Spécifique à Repères, à ne pas confondre avec une règle générale :**
- La forme exacte de `{ libelle: string }` — c'est ce que *Repères* affiche, un futur mécanisme de convergence différent aurait probablement besoin d'une autre forme.
- Le fait que Repères soit la destination de ce contrat précis — pas une règle « tout module peut recevoir un contrat d'ancrage », juste un fait : Repères, aujourd'hui, en reçoit.
- Les règles de la section « Responsabilité du module » de Repères (jamais juger, jamais relancer...) — propres à ce que Repères a décidé d'être, pas un modèle imposé à un futur module destinataire différent.

**Déjà général, sans qu'il y ait besoin de généraliser quoi que ce soit (ce sont des garanties de la Constitution, appliquées ici, pas des inventions de ce contrat)** :
- Aucune donnée sensible, aucun identifiant technique interne dans un objet échangé entre modules.
- Une façade minimale et documentée comme seul point de passage entre deux modules.

**Patron technique généralisable, découvert par cette réflexion, à documenter maintenant parce qu'il sert dès aujourd'hui (pas une anticipation)** :
- La paire rendu/branchement (`reperesBoutonAncre()` + `reperesBrancherBoutonAncre()`) pour tout contenu qu'un module insère dans l'écran d'un AUTRE module — reprend exactement le patron déjà universel dans ERIP (`html = ...; app.innerHTML = html; brancherEvenementsXxx();`), simplement appliqué au cas où le rendu et le branchement ne sont pas faits par le même module. Généralisable tel quel à toute future façade d'un module qui insère du contenu interactif ailleurs que sur son propre écran.
- Validation défensive à la frontière : un module destinataire ne fait jamais confiance aveuglément à l'objet reçu (ignore les champs inattendus, dégrade proprement une valeur absente ou mal formée plutôt que d'échouer). Généralisable à toute future façade recevant un objet construit par un autre module.

**À ne surtout pas généraliser maintenant :**
- Ne pas construire un « bus d'événements » ou un « registre de contrats » générique ERIP avant d'avoir un 2e cas réel, différent de Repères — un seul exemple ne permet pas de savoir quelle partie du patron est stable et laquelle est un accident de cette première implémentation (même discipline que « patron confirmé seulement après un 2e module indépendant », déjà appliquée plus haut dans ce carnet).
- Ne pas enrichir `contratSource` de champs anticipant des besoins futurs (`type`, `metadata`, `icone`...) — violerait directement la règle déjà posée (aucune donnée « au cas où »). Repères n'a besoin que de `libelle` aujourd'hui.
- Si un second mécanisme de convergence apparaît un jour dans ERIP, lui donner son propre document (`Contrat d'ancrage ERIP v2`, ou un nom différent selon sa nature) plutôt que d'étendre celui-ci pour couvrir les deux — plus honnête que de forcer une généralité prématurée dans un document qui n'a encore vu qu'un seul cas réel.

---

## Patrons d'intégration — convention générale ou particularité de Repères ?

**Règle posée par Denis (implémentation Repères, étape 2)** : à chaque modification de `js/app.js`, `index.html` ou `data/metiers.js`, se demander si ce branchement serait exactement le même pour un futur module (Formation, Mobilité, Compétences...). Si oui, le consigner ici comme patron d'intégration, pas seulement comme un détail de Repères.

**Même discipline que le triage des retours terrain** ([[feedback-methode-analyse-retours-terrain]]) : un patron vu dans un seul module reste une *observation*, pas une règle. Il ne devient un *patron confirmé* qu'après avoir été retrouvé à l'identique dans un second module, indépendamment conçu. Ne jamais déclarer une convention "établie" sur la seule base de Repères.

### Confirmés (retrouvés à l'identique dans au moins 2 modules) — à réutiliser sans hésiter

- **Route dédiée** (`js/app.js`, table `routes`) pour tout module atteint comme outil indépendant, hors du parcours guidé (`ETAPES`) : une seule entrée `'cle': pageDuModule`, la fonction elle-même vit entièrement dans le module. Vu dans `bilan-candidature` et `reperes`.
- **Tuile Boîte à outils** (`data/metiers.js`, `ouvrirChoixPreparationAccueil()`) : `tuile(id, icone, label)` + écouteur dédié qui fait exactement 3 choses dans cet ordre — `trackEvenement('outil_utilise', { outil: '...' })`, `fermerFenetreERIP()`, puis un appel gardé (`if (typeof pointEntreeModule === 'function') { pointEntreeModule(); }`) vers un point d'entrée public du module. Jamais un `naviguerVers()` écrit en dur à cet endroit. Vu dans les 4 tuiles précédentes (Découverte, Lettre, Entretien, Bilan) et repris à l'identique pour Repères.
- **Chargement du script** (`index.html`) : un bloc `<script>` par module, commenté (nom du module, renvoi vers son `ARCHITECTURE_TECHNIQUE.md`, principe d'isolation), placé avant `js/app.js` pour que ses fonctions existent au moment du premier appel. Ordre interne du plus stable (données/modèles) au plus mouvant (interface). Vu dans `decouverte-competences`, `bilan-candidature`, `reperes`.

### Observés une seule fois (Repères) — candidats, pas encore des règles

- **Accesseur privé unique avec initialisation paresseuse** pour la portion de `dossier` propre au module (`_reperesListe()`), plutôt que des gardes `if (!dossier.x) {...}` répétés côté `app.js` à chaque point de restauration. À confirmer sur un 2e module avant de le présenter comme LA convention.
- **Appel d'initialisation unique au démarrage** (`DOMContentLoaded`, `js/app.js`) : point de contact réel seulement pour les modules qui en ont besoin — `decouverte-competences` n'en a aucun, `reperes` en a un (`reperesInitialiser()`). Pas un point de contact systématique, à documenter module par module plutôt que supposé universel.
- **Feuille de style propre au module** (`modules/reperes/reperes.css`, étape 3), chargée par un `<link>` dédié dans `index.html` après `css/style.css`, réutilisant ses variables sans en redéfinir aucune, classes toutes préfixées par le nom du module. Premier module à en avoir une — à confirmer si un futur module a réellement besoin de styles propres avant d'en faire une règle (`decouverte-competences` et `bilan-candidature` n'en ont aucune, ils réutilisent entièrement `css/style.css`).
- **Paire rendu/branchement traversant deux modules** (`reperesBoutonAncre()` retourne du HTML inséré par le Bilan CV, `reperesBrancherBoutonAncre()` branche les événements correspondants depuis le point de branchement du Bilan CV lui-même) : généralise la paire rendu/branchement déjà universelle dans ERIP (`html = ...; app.innerHTML = html; brancherEvenementsXxx();`) au cas où rendu et branchement ne sont pas faits par le même module. Vérifié fonctionnel en navigateur (étape 3, geste ancré). Un seul cas réel pour l'instant (Repères recevant du Bilan CV) — à confirmer comme patron général si un futur module l'utilise à son tour, dans un sens ou dans l'autre.

## Règle de façade — grandir seulement sur appel réel

**Posée par Denis (étape 2, généralisée à tout futur module)** : aucune fonction n'est ajoutée à la façade publique d'un module « au cas où ». Une fonction n'est exposée que lorsqu'un appelant réel, extérieur au module, existe déjà. Un document de cartographie peut légitimement anticiper une façade cible (contrat), mais le code, lui, n'implémente chaque fonction qu'au moment où son appelant réel est écrit — jamais avant. Vu appliqué sur Repères : `reperesEnrichirTexteLexique()` et `reperesContenuAide()` restent documentées comme cible dans `ARCHITECTURE_TECHNIQUE.md` sans exister dans le code, faute d'appelant réel — `reperesBoutonAncre()` et `reperesBrancherBoutonAncre()` ont suivi le même chemin jusqu'à l'étape 3, où leur appelant réel (le rendu du Bilan CV) a été écrit en même temps qu'elles.

**Métrique de suivi, posée par Denis** : à tout moment de l'implémentation, le dossier `modules/reperes/` doit rester supprimable dans son intégralité sans rien casser d'autre que ses propres points d'entrée. **Résultat exact à l'audit final V1** (voir `modules/reperes/ARCHITECTURE_TECHNIQUE.md`, « Test de suppression ») : partiellement vraie. Les 3 points de contact `app.js` orientés vers Repères (initialisation, bouton d'ancrage, branchement du bouton) sont bien gardés (`typeof`) et dégradent proprement. Mais l'entrée `routes['reperes']` (référence directe, non gardée) romprait le chargement de tout `js/app.js`, et la tuile de `data/metiers.js` resterait affichée sans fonctionner. **Généralisable** : la convention `routes` (référence directe, jamais gardée) est un point faible partagé par tout module ayant sa propre route — pas une régression propre à Repères, déjà présente pour `bilan-candidature`. À corriger ou assumer explicitement pour tout futur module avant de reproclamer ce test « vrai » sans nuance.

## Discipline des dépendances externes

**Posée par Denis (étape 3), valable pour tout futur module** : toute dépendance d'un module vers un élément extérieur à son propre dossier (fonction globale, variable globale, structure d'un autre module) n'est jamais la norme, c'est une exception qui doit être assumée et documentée explicitement — jamais laissée implicite dans le code. L'inventaire précis, module par module, vit dans le `ARCHITECTURE_TECHNIQUE.md` de chaque module (voir celui de Repères, section « Discipline des dépendances externes »). **Volontairement pas de liste recopiée ici** : un nombre ou une liste dupliqués dans ce carnet dériveraient à chaque dépendance ajoutée côté module (déjà arrivé une fois avant correction à l'audit final V1) — ce carnet garde uniquement la règle transversale.

## Hésitations de classement de fonctions, notées plutôt que masquées

**Posée par Denis (étape 3)** : à chaque nouvelle fonction, se demander si elle relève du modèle, du stockage, du rendu, des événements, ou de la façade publique — et noter ici toute hésitation plutôt que trancher silencieusement.

- **`_reperesCreer(type, contratSource)` (module Repères, étape 3)** : assemble la construction du modèle (`_reperesConstruire`), l'écriture en stockage (`_reperesEnregistrer`) et un appel de télémétrie (`trackEvenement`) en une seule fonction. Ne correspond proprement à aucune des 5 catégories prises isolément — rangée sous Stockage par défaut (son effet dominant est l'apparition d'un nouvel enregistrement), mais la frontière est discutable. À surveiller : si Repères ou un futur module accumule plusieurs fonctions de ce type (modèle + stockage + effet de bord mêlés), ça indiquerait le besoin d'une 6e catégorie explicite plutôt que de continuer à forcer un rangement approximatif.
- **Position de `trackEvenement()` dans `_reperesCreer()` plutôt que dans la couche Événements** : le choix a été de tracer la création à l'endroit où elle a réellement lieu (une fois, garantie, quel que soit le geste UI déclencheur — libre aujourd'hui, ancré demain), plutôt que dans chaque gestionnaire de clic (qui devrait alors dupliquer cet appel pour chaque futur point d'entrée). Compromis assumé : une fonction classée Stockage qui appelle malgré tout un utilitaire transversal externe.

---

## Duplication déjà existante, trouvée en cartographiant Regard extérieur — pas créée par ce chantier

L'étape « choisir un assistant IA » (pastilles avant `ouvrirFenetreAssistantIA()`) n'est pas une fonction générique partagée, contrairement à ce que sa forme identique partout laisse penser. `ouvrirChoixIAEntretien()` (`data/metiers.js`) en est une version propre à l'entretien ; le Bilan CV et la lettre ont vraisemblablement chacun la leur. Seules les couches plus basses (`ouvrirFenetreAssistantIA()`, `activerCollageInstantane()`, les données `ASSISTANTS_IA`) sont réellement partagées.

**Généralisable** : avant de supposer qu'un mécanisme visuellement identique est déjà factorisé quelque part dans ERIP, vérifier par lecture directe du code, pas par apparence. `modules/regard-exterieur/` écrit sa propre version de cette étape plutôt que de refactoriser les quatre existantes — hors périmètre de son chantier, pas un renoncement. Une factorisation à cinq consommateurs identiques deviendrait un candidat naturel le jour où quelqu'un touche à nouveau l'un des quatre déjà en place.

---

## Nouveau patron d'intégration inversé — Repères expose une ancre, ne connaît pas ce qui s'y attache

**Trouvé en cartographiant Regard extérieur.** Le Contrat d'ancrage (`docs/CONTRAT_ANCRAGE_ERIP.md`) couvre le sens « un module source insère un bouton vers Repères ». La situation inverse — un module extérieur doit s'insérer *dans* l'écran de Repères — n'était pas couverte. Résolu sans faire connaître Repères et le module extérieur l'un à l'autre : Repères déclare une ancre DOM vide et nommée dans son propre rendu (`#reperesZoneRegardExterieur`), sans savoir qui l'utilise ni si quelqu'un l'utilise un jour — même principe que `#app` lui-même. Le module extérieur s'y attache après coup, via un point de contact générique déjà existant dans `naviguerVers()` (même famille que `declencherPulseAide()`), jamais via un appel que Repères ferait lui-même.

**Généralisable, à confirmer sur un 2e cas avant de le déclarer patron établi** : tout futur module ayant besoin de s'insérer dans l'écran d'un module déjà autonome peut suivre ce même principe — une ancre nommée et documentée côté hôte, un déclenchement générique côté orchestrateur, jamais une connaissance directe entre les deux modules.

---

## Faiblesses déjà connues, héritées de l'exploration du chantier Bilan CV

- `js/app.js` fait plus de 24 000 lignes, sans découpage interne stable, sans namespace ni IIFE global — seule protection contre les collisions de noms, une convention de préfixe par module (`bilan...`, `decouverte...`). Non bloquant pour Repères tant que la convention de préfixe (`reperes...`) est respectée.
- `data/metiers.js`, malgré son nom, contient une quantité importante de logique applicative sans rapport avec des données pures (assistant de dépôt de CV, éditeur de floutage). Aucun impact direct sur Repères, mais un exemple à ne pas suivre si le module a un jour besoin d'un fichier de données séparé.
- Le Bilan CV rappelle sa propre fonction de page directement, une trentaine de fois, plutôt que de passer par le routeur central pour ses re-rendus internes. **Repères a évité ce pattern (étapes 4-6)** : `_reperesRafraichirListe()` cible uniquement le sous-conteneur `#reperesListeConteneur`, jamais un rappel de `pageReperes()` en entier — plus proche, structurellement, que le Bilan CV lui-même.

## Dette d'architecture identifiée à l'audit final V1 (module Repères) — à traiter lors d'une future refonte du routeur, pas maintenant

**Trouvée en vérifiant précisément si `modules/reperes/` était réellement supprimable sans rien casser d'autre.** Décision de Denis : reste en l'état pour cette V1, aucun chantier de refonte du routeur ouvert à ce stade — consignée ici pour que la prochaine refonte de navigation la traite explicitement, plutôt que de la redécouvrir.

- `js/app.js`, table `routes` (`var routes = { 'cv': pageChoixCV, ..., 'bilan': pageBilanCandidature, 'reperes': pageReperes };`) : objet littéral évalué immédiatement à l'exécution du script, en dehors de toute fonction — si `pageReperes` (ou `pageBilanCandidature`) n'existe pas, `ReferenceError` à cette ligne précise, qui interrompt le chargement de la totalité de `js/app.js` (tout ce qui est défini plus bas, y compris le bootstrap `DOMContentLoaded`, ne s'exécute jamais). Contrairement aux autres points de contact d'un module optionnel (init, façades diverses), tous protégés par `if (typeof X === 'function')` parce qu'ils vivent à l'intérieur de fonctions exécutées plus tard, cette entrée n'a structurellement pas cette possibilité : une valeur d'objet littéral s'évalue tout de suite, pas au moment de l'appel.
- **Partagée par tout module ayant sa propre route** (`bilan-candidature` en plus de `reperes`), pas une régression propre à Repères — un défaut de la convention `routes` elle-même, jamais corrigé nulle part dans le projet jusqu'ici.
- `data/metiers.js` : la tuile Boîte à outils d'un module optionnel n'est pas non plus conditionnée à son existence — dégradation silencieuse (bouton visible, inactif), pas un crash, mais un point à couvrir dans la même refonte.
- **Piste pour la future refonte, à évaluer alors, pas maintenant** : soit garder les entrées de `routes` sous forme de chaînes de noms de fonctions résolues paresseusement (`routes['reperes']()` cherchant `window['pageReperes']` au moment de l'appel plutôt qu'à la déclaration), soit construire `routes` par ajouts conditionnels (`if (typeof pageReperes === 'function') { routes.reperes = pageReperes; }`) plutôt que par un littéral figé.

## Confirmé pendant l'implémentation

- `sauvegarderSession()` (`js/app.js`) fait `JSON.parse(JSON.stringify(dossier))`, sans liste blanche de champs — tout ajout à `dossier` (comme `dossier.reperes`) y est automatiquement inclus, aucun code de sérialisation à écrire par module.
- `echapperAttribut()` (`js/app.js`, ligne ~1420) confirmée générique à l'étape 3 : simple échappement de chaîne pour attribut HTML, aucune structure de Bilan CV. Réutilisée par Repères pour porter le libellé d'un geste ancré dans `data-repere-source`.
- Mécanisme d'export/import de session multi-appareil (`exporterSessionFichier()`/`importerSessionFichierSelectionne()`, `js/app.js`) confirmé, par lecture directe du code à l'étape 7, comme empruntant exactement le même chemin que la sauvegarde locale (`sauvegarderSession()` en export, `dossier = donnees.dossier` en import) — `dossier.reperes` y est donc couvert sans code supplémentaire, sur les deux chemins de continuité qu'ERIP propose.

## Observations à ajouter au fil de l'implémentation

- **Erreur de cartographie corrigée (étape 2, module Repères)** : le rendu de la Boîte à outils, supposé vivre dans `js/app.js`, vit en réalité dans `data/metiers.js` (`ouvrirChoixPreparationAccueil()`). Généralisable : tout futur module ayant besoin d'un point d'entrée depuis la Boîte à outils doit vérifier cet emplacement réel avant de documenter sa cartographie, ne pas supposer qu'il s'agit d'`app.js` par défaut.
- **Pattern à proposer aux futurs modules (étape 2, module Repères)** : plutôt que de répéter un garde-fou d'initialisation à chaque point de restauration de session (comme `if (!dossier.ia) { dossier.ia = ... }`, dupliqué à 6 endroits dans `js/app.js`), Repères centralise cette défense dans un accesseur privé unique (`_reperesListe()`), appelé à chaque lecture/écriture. `app.js` n'a alors plus jamais besoin de connaître la façon dont la donnée d'un module doit être initialisée. À proposer explicitement comme convention pour tout futur module possédant sa propre portion de `dossier`.
- **Précision sur la notion de « générique partagé »** : `barreNavigation()` (`js/app.js`) est un utilitaire transversal (comme `echapperAttribut()`), pas une dépendance vers un module métier — Repères l'appelle directement pour son pied de page, sans dupliquer sa logique. Distinction à garder pour les futurs modules : ce qui compte n'est pas la localisation du fichier (`app.js` ou non), mais si la fonction porte une logique propre à un module métier ou une brique d'interface générique déjà partagée par toute l'application.
