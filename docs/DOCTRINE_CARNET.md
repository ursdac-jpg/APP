# Doctrine du module Carnet

**Statut** : document fondateur, stabilisé après une réflexion d'architecture menée avec la même exigence que celle qui a produit `docs/DOCTRINE_REGARD_EXTERIEUR.md`. Il ne sera rouvert que si un développement réel ou un usage terrain révèle un cas qu'aucun des principes ci-dessous ne permet de trancher, jamais pour un cas qui se résout dans le chantier ou l'implémentation.

**Rattachement** : ce document est subordonné à `docs/CONSTITUTION_ERIP.md`. Il ne peut contredire ses deux principes fondateurs, il les décline pour un module précis, celui qui permet à une personne de capturer librement ce qu'elle juge utile pendant son parcours. En cas de tension entre les deux, la Constitution d'ERIP l'emporte toujours.

**Ce que ce document n'est pas** : aucun écran, aucune interaction, aucun choix technique. Chaque phrase a été pensée pour rester vraie indépendamment de la façon dont le Carnet sera un jour codé ou présenté à l'écran. Le nom du module, sa charte graphique, l'ordre des boutons : tout cela vit dans `docs/CHANTIER_CARNET.md`, jamais ici.

---

## Question fondatrice

Qu'est-ce qui appartient si entièrement à la personne que rien, pas même une IA ou un autre module d'ERIP, ne peut en décider à sa place ?

Les sept principes qui suivent forment sa réponse complète.

---

## Les sept principes

1. **Mission.** Le Carnet permet à la personne de garder, sans délai ni décision immédiate, tout élément qu'elle juge utile pendant son parcours, pour ne jamais perdre ce qu'elle a repéré, sans avoir à savoir tout de suite ce qu'elle en fera.
2. **Propriété exclusive.** Le Carnet appartient entièrement à la personne. Aucun module d'ERIP, y compris une intelligence artificielle, ne peut lire, analyser ou exploiter son contenu de lui-même. Toute sortie du Carnet vers un autre module part d'un geste explicite et volontaire, note par note.
3. **Toujours strictement privé.** Le Carnet ne connaît aucun statut partagé. Il reste personnel dans son intégralité, en toutes circonstances. Seules ses transformations peuvent, elles, devenir partageables : jamais une note du Carnet elle-même.
4. **Transformer, c'est copier, jamais déplacer.** Une note transformée continue d'exister dans le Carnet, inchangée. Le résultat de la transformation devient une entité distincte, avec sa propre finalité. Un indicateur discret peut signaler qu'une note a déjà été transformée, pour éviter une répétition involontaire, jamais pour empêcher une nouvelle transformation si la personne la décide délibérément.
5. **Une identité distincte de Repères.** Le Carnet et Repères répondent à deux besoins différents et ne sont jamais interchangeables ni fusionnés : Repères conserve des réflexions déjà reconnues comme significatives, sous une forme choisie, en vue d'un usage précis ; le Carnet conserve tout le reste, sans forme imposée et sans destination présumée. Aucune catégorie, aucun type, aucune structure n'est jamais exigée à la capture.
6. **Disponible sans jamais solliciter.** Le Carnet reste accessible en permanence, mais n'incite jamais activement la personne à s'en servir, à le trier ou à le vider. Une note peut y rester indéfiniment sans que cela ne soit jamais présenté comme un problème à corriger.
7. **Un seul espace, plusieurs vues possibles pour y accéder.** *(Reformulé après un premier essai d'implémentation révélant qu'une porte d'entrée unique en tout point identique nuisait à l'usage réel — voir docs/CHANTIER_CARNET.md, partie 5 bis, pour l'historique complet de cette révision.)* Le Carnet peut être atteint par plusieurs portes (une icône persistante, une tuile dans un menu, ou tout autre point d'entrée ajouté plus tard). Chacune peut proposer une vue adaptée à son contexte — un aperçu rapide qui laisse la personne sur la page où elle se trouve, ou l'espace complet avec toutes les notes — mais toutes donnent accès au même contenu, jamais à des notes différentes selon le chemin emprunté, et aucune n'est jamais empêchée de capturer une nouvelle note. Ce qui doit rester un — les notes elles-mêmes — le reste ; ce qui peut légitimement varier — la façon de les consulter — varie.

---

## Clause d'usage

Face à toute décision de conception concernant le Carnet, une question suffit à trancher un doute : *cette décision laisse-t-elle la personne seule maîtresse de ce que devient chaque note, ou fait-elle apparaître un jugement, une automatisation, ou une pression, même discrète ?* Si la seconde réponse s'applique, la décision doit être écartée ou reformulée.

## Ce qui n'a pas sa place ici, explicitement

- Une note lue ou résumée par une IA sans que la personne ait elle-même déclenché ce geste pour cette note précise.
- Un compteur, un badge, ou tout autre signal qui donnerait à voir le Carnet comme un espace à vider ou à traiter.
- Une catégorie, un type ou un champ obligatoire imposé à la capture.
- Une note rendue visible à un tiers autrement que par la transformation volontaire de la personne vers un module qui, lui, prévoit un partage.
- Une fusion, même partielle, avec l'écran ou le modèle de données de Repères.

## Ce que ce document ne garantit pas

Ces sept principes bornent ce que le Carnet ne doit jamais devenir. Ils ne garantissent pas, à eux seuls, que la capture soit rapide, que l'écran soit clair, ou que la transformation en Repère soit agréable à utiliser. Cette qualité-là reste le travail du chantier, jamais celui de ce document.
