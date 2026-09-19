# Contrat d'ancrage ERIP v1

**Statut** : figé. Document d'architecture transverse, indépendant de tout module précis. Le Bilan CV est le premier module qui l'utilise, pas le sujet de ce document — Formation, Mobilité, Entretien ou tout autre module futur doivent pouvoir l'utiliser sans qu'une ligne ici ne change. À ne pas rouvrir sans besoin réel nouveau (voir « Niveau de couplage retenu » en fin de document).

**Objet** : le protocole unique par lequel un module source transmet un contenu à Repères, pour que la personne puisse le garder.

---

## Responsabilité du module source

- Décide seul quoi proposer comme point d'ancrage (quel bouton, sur quel contenu, à quel endroit de son propre écran).
- Construit lui-même l'objet `contratSource`, à partir de ses propres données internes — lui seul connaît sa structure, ce n'est le rôle d'aucun autre module de la connaître à sa place.
- Insère le HTML retourné par `reperesBoutonAncre(contratSource)` dans son propre rendu, puis appelle `reperesBrancherBoutonAncre()` juste après avoir inséré ce HTML dans le DOM — la même paire rendu/branchement que toute page d'ERIP applique déjà à son propre contenu (`html = ...; app.innerHTML = html; brancherEvenementsXxx();`), rien d'inventé pour ce contrat.
- Ne connaît de Repères que ces deux fonctions de façade — rien de son état interne, de son stockage, ni de son affichage.
- Reste seul propriétaire de son contenu d'origine : transmettre un `contratSource` ne transfère aucune responsabilité de maintien ou d'exactitude vers Repères.

## Responsabilité de Repères

- Reçoit `contratSource`, ne lit jamais rien d'autre du module source.
- Ne lui fait pas confiance aveuglément : ne retient que le champ `libelle` (chaîne), ignore tout autre champ présent, traite toute valeur absente ou mal formée comme un geste libre plutôt que d'échouer. Cette validation défensive à la frontière est ce qui permet à un futur module de se tromper légèrement sans jamais casser Repères.
- Copie immédiatement les champs reçus dans son propre stockage — ne conserve aucune référence ni identifiant permettant de retrouver le module source plus tard.
- Ne renvoie jamais d'information vers le module source (flux strictement à sens unique).
- Traite un Repère ancré exactement comme un Repère libre une fois la copie faite : même modèle, mêmes règles, aucune branche de code spécifique à la provenance.

## Structure exacte de l'objet transmis (`contratSource`)

```
{ libelle: string }
```

Un seul champ, volontairement. Un objet plutôt qu'une chaîne brute, pour pouvoir l'étendre un jour sans casser les appels déjà écrits.

**Obligatoire** : `libelle`, chaîne non vide, texte déjà lisible par une personne — jamais un identifiant technique ni une structure à interpréter.

**Interdit** :
- Tout identifiant, référence ou pointeur vers une structure interne du module source (pas d'ID de recommandation, d'axe, de diagnostic, ni d'aucun équivalent futur).
- Toute donnée sensible (santé, logement, situation familiale), même règle que partout ailleurs dans ERIP.
- Tout champ dont le sens dépendrait de connaître le module source : Repères doit pouvoir afficher `libelle` seul, sans rien savoir d'autre.

## Moment de la copie

Une seule fois, au clic sur le bouton d'ancrage, avant tout affichage du sélecteur de type. Passé cet instant, `contratSource` cesse d'exister dans l'échange — seule la copie dans `dossier.reperes` subsiste.

**Si le module source évolue après la création du Repère** (contenu modifié, corrigé ou supprimé) : aucun effet sur le Repère déjà créé. Il garde le libellé tel qu'il était au moment de la copie. Ce n'est pas une particularité de Repères mais une garantie du contrat lui-même.

## Garanties d'indépendance entre modules

- Repères n'importe, ne référence, ni n'appelle aucune fonction d'un module source.
- Un module source n'importe, ne référence, ni n'appelle aucune fonction interne de Repères — seule sa façade documentée est visible depuis l'extérieur.
- Ce contrat ne mentionne le Bilan CV nulle part par nécessité : tout futur module peut l'utiliser sans modifier Repères, ni ce document.
- Supprimer un module source ne casse jamais Repères (les Repères déjà créés restent intacts). Supprimer Repères ne casse jamais un module source (au pire, un bouton devient inactif — même garde `if (typeof reperesBoutonAncre === 'function')` déjà utilisée pour tous les points d'entrée d'ERIP).

## Portée de ce contrat (v1)

Ce document décrit, aujourd'hui, le protocole pour transmettre un contenu **à Repères** — pas un bus d'événements générique entre modules quelconques d'ERIP, et pas encore une garantie qu'un futur mécanisme de convergence différent (s'il existe un jour) suivrait exactement cette même forme.

C'est un choix délibéré, pas un oubli : construire maintenant un protocole abstrait « valable pour n'importe quel échange entre n'importe quels modules » sur la base d'un seul cas réel (Repères) reviendrait à généraliser à partir d'un échantillon d'un — exactement ce que ce chantier évite déjà ailleurs (voir `docs/CARNET_TECHNIQUE_ARCHITECTURE_ERIP.md`, « patron confirmé seulement après un 2e module indépendant »). Si ERIP a un jour un second mécanisme de convergence comparable, ce document sera le point de départ d'une réflexion, pas une garantie qu'aucune ligne n'y changera.

Ce qui, en revanche, généralise déjà sans attendre un 2e cas, parce que ce sont des principes déjà transverses à toute l'application, pas des inventions propres à ce contrat : aucune donnée sensible, aucun identifiant technique interne, une copie plutôt qu'une référence vivante, une façade minimale et documentée comme seul point de passage.

## Niveau de couplage retenu

**Question posée avant de figer ce contrat** : l'appel direct et gardé (`if (typeof reperesBoutonAncre === 'function') { ... }`) est-il le couplage le plus faible possible, ou une architecture plus indirecte (bus d'événements, registre de modules) ferait-elle mieux, à complexité égale ?

**Analyse** : un module source ne dépend aujourd'hui que de deux noms de fonctions (`reperesBoutonAncre`, `reperesBrancherBoutonAncre`) et d'une forme d'objet documentée (`{ libelle }`) — jamais d'une structure interne, jamais d'une donnée stockée par Repères. C'est déjà un couplage à un contrat public, pas aux internes d'un module. Un bus d'événements ne réduirait pas ce couplage : le rendu du bouton devrait de toute façon être obtenu par un appel direct (l'événement ne peut remplacer que la moitié « création », pas la moitié « affichage »), pour un coût réel — une pièce d'infrastructure inédite dans un projet sans framework ni bundler, à la charge d'un développeur seul, qui rend la trace d'exécution moins lisible qu'un appel direct. Un registre de modules n'apporterait rien de plus que la garde `typeof` déjà utilisée partout dans ERIP : les deux tolèrent également l'absence de Repères, la garde le fait avec zéro pièce supplémentaire à maintenir.

**Limite assumée, pas cachée** : ce faible couplage repose sur la discipline (suivre ce document) plutôt que sur un mécanisme qui l'imposerait automatiquement — JavaScript sans build ni système de types ne offre pas d'autre option raisonnable ici. La validation défensive côté Repères (section « Responsabilité de Repères » ci-dessus) est ce qui tient lieu de garde-fou : elle rend une erreur d'un futur module sans conséquence, plutôt que d'empêcher l'erreur d'exister.

**Verdict** : l'appel direct et gardé est déjà le meilleur compromis pour ERIP — simplicité, autonomie des modules, maintenabilité et évolutivité tenues ensemble, sans ajouter de mécanisme que ce projet n'a nulle part ailleurs. **Architecture figée à ce niveau.** Ne pas rouvrir ce débat sans un besoin réel nouveau (concrètement : sans qu'un problème observé, pas anticipé, ne le justifie).
