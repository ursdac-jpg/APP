# Doctrine du module « Lexique »

**Nom** : provisoire. « Lexique » désigne ce module dans tous les documents de conception, en attendant un nom définitif — le mot n'apparaît dans aucun principe ci-dessous, pour que ce choix reste libre de changer sans jamais rouvrir cette doctrine.

**Statut** : document fondateur, stabilisé après un travail approfondi de conception (identité du module, portes d'entrée, types de contenu, robustesse à l'échelle de plusieurs années, méthode de fabrication des fiches), puis un dernier passage critique dédié à la recherche d'angles morts. Il ne sera rouvert que si un développement réel ou un retour terrain révèle un cas qu'aucun des principes ci-dessous ne permet de trancher, jamais pour une question qui se résout dans l'architecture des écrans, le modèle de données ou la méthode de rédaction des fiches.

**Rattachement** : ce document est subordonné à `docs/CONSTITUTION_ERIP.md`. Il ne peut contredire ses deux principes fondateurs, il les décline pour un module précis : celui qui aide une personne à comprendre le vocabulaire, les notions et les rouages du monde professionnel. En cas de tension entre les deux, la Constitution d'ERIP l'emporte toujours.

Face à un choix entre une information plus riche mais susceptible de devenir rapidement obsolète, et une information plus modeste mais stable dans le temps, ce module choisit toujours la seconde. Cette doctrine s'applique quel que soit le nombre de personnes qui rédigeront des fiches au fil du temps : elle ne dépend jamais de l'organisation actuelle du projet.

**Ce que ce document n'est pas** : aucun écran, aucun modèle de données, aucune liste d'univers, de formats ou de fonctionnalités. Chaque phrase a été testée contre la question suivante : resterait-elle vraie si, dans cinq ans, les écrans, le moteur de recherche, le nombre de fiches ou même le nom du module changeaient complètement ? Une phrase qui deviendrait fausse pour une seule de ces raisons n'a pas sa place ici, elle appartient à un futur document de conception.

---

## Question fondatrice

Que peut-on expliquer honnêtement à une personne pour qu'elle comprenne un mot, une notion ou un rouage du monde professionnel qu'elle ne maîtrise pas encore — sans jamais lui dire quoi penser, quoi faire, ni prétendre remplacer l'échange avec un professionnel ?

Les principes qui suivent forment sa réponse. Chacun couvre une dimension qu'aucun autre ne couvre.

---

## Les principes

1. **Le module explique des concepts, jamais des règles susceptibles de devenir fausses.** Le test qui tranche, sur chaque contenu : cette phrase peut-elle devenir fausse avec le temps sans que le mot change de sens ? Si oui, elle n'a pas sa place ici, ou doit être reformulée sans chiffre, sans durée, sans condition ni procédure susceptible d'évoluer.

2. **L'intelligence de ce module est une intelligence de conception, jamais une intelligence artificielle en temps réel.** Elle tient à plusieurs façons d'y entrer, une recherche tolérante, un réseau de liens entre les contenus — jamais à un raisonnement produit à la volée. Aucun contenu n'est généré ou reformulé en direct par une IA : tout ce que le module donne à lire a été écrit à l'avance, borné, et reste stable jusqu'à ce qu'une personne le révise explicitement.

3. **Une personne peut entrer dans ce module par une situation qu'elle vit, une question qu'elle formule avec ses propres mots, ou un mot précis qu'elle a déjà en tête.** Le module l'accueille par n'importe laquelle des trois, mais leur point d'arrivée reste toujours le même : une fiche déjà écrite, jamais une réponse composée pour l'occasion.

4. **Le module explique toujours un pourquoi, jamais un comment se conformer.** Comprendre pourquoi une attente, une question ou une pratique existe est son objectif ; suggérer comment y répondre, s'y adapter ou la satisfaire ne l'est jamais — y compris, et surtout, pour les attentes des employeurs et les questions d'entretien, là où cette tentation est la plus grande.

5. **Une seule définition sert tous les publics, parce qu'une explication réellement claire n'a jamais besoin d'être dédoublée pour cela.** La clarté elle-même est ce qui la rend juste aussi bien pour un bénéficiaire que pour un professionnel. Bénéficiaire, salarié, étudiant, CIP ou professionnel RH lisent donc le même contenu ; le module ne construit jamais deux niveaux de lecture ni deux publics séparés.

6. **Une fiche naît d'un besoin réel, jamais d'un effort de couverture systématique** — que ce besoin vienne d'un usage direct de ce module ou d'un manque révélé par un autre module d'ERIP. Ce module n'a pas vocation à devenir exhaustif, seulement à devenir progressivement plus utile. Il grandit fiche après fiche, à mesure que des besoins réels apparaissent, jamais par anticipation de ce qui pourrait un jour servir.

7. **Aucun contenu ne se referme sur lui-même.** Chaque fiche propose toujours au moins un prolongement vers autre chose, pour que consulter ce module reste une exploration, jamais la simple lecture d'un dictionnaire qui répond et s'arrête.

8. **Chaque fiche reste volontairement simple, jamais exhaustive en elle-même.** La compréhension se construit progressivement, fiche après fiche, jamais par une explication complète enfermée dans un seul contenu. C'est l'accumulation de petites briques claires, jamais la profondeur d'une seule d'entre elles, qui doit donner le sentiment que le sujet devient moins compliqué.

9. **La simple envie de retrouver un contenu et l'intention de le faire vivre dans sa réflexion personnelle sont deux gestes distincts, jamais fusionnés.** L'un sert à revenir facilement à quelque chose qu'on connaît déjà ; l'autre nourrit une réflexion appelée à être reprise, y compris avec un professionnel. Même si leur forme technique évolue, ces deux intentions ne doivent jamais être confondues dans un seul mécanisme.

---

## Clarifications

Ces précisions n'ajoutent aucun principe nouveau. Elles ferment des lectures littérales qui respecteraient la lettre d'un principe tout en trahissant son intention.

- Une recherche qui suggère des formulations déjà écrites à l'avance reste conforme au principe 2. Une recherche qui interroge un modèle de langage pour composer une réponse ne l'est jamais, même présentée comme une simple « aide à la reformulation ».
- Une liste de conseils précédée d'une formule de prudence (« il est conseillé de... », « pensez à... ») reste un conseil : la prudence du vocabulaire ne suffit pas à respecter le principe 4, elle doit porter sur le fond.
- Une campagne de rédaction qui viserait à couvrir systématiquement un domaine entier avant qu'un besoin réel ne soit observé contredit le principe 6, même si chaque fiche prise isolément respecte par ailleurs le test de stabilité.
- Un lien qui renvoie vers la fiche elle-même, ou vers une liste générique sans rapport réel avec son contenu, ne compte pas comme le prolongement exigé par le principe 7.
- Une question formulée naturellement par une personne sert uniquement de porte d'entrée vers une fiche déjà existante (principe 3) : elle ne devient jamais elle-même un contenu à part entière, au risque de transformer le module en une foire aux questions qui s'accumule indéfiniment.
- **Le « besoin réel » du principe 6 n'est pas limité à ce qu'un bénéficiaire croise directement dans un écran d'ERIP (précisé 2026-08-17).** Comprendre une notion, une méthode ou un repère du monde de l'insertion professionnelle pour mieux comprendre cet écosystème est, en soi, un besoin réel — y compris pour un CIP débutant, un stagiaire CIP, un partenaire qui découvre le secteur, ou toute personne curieuse de le comprendre. Le module reste une culture commune de l'accompagnement vers l'emploi, pas un dictionnaire limité à ce qu'un bénéficiaire rencontre par hasard. Ceci n'élargit ni ne contredit le principe 6 lui-même (une fiche naît toujours d'un besoin réel, jamais d'un effort de couverture systématique) ni le principe 5 (une seule définition sert tous ces publics, jamais deux niveaux de lecture selon qui consulte) : ça ne fait qu'élargir qui peut légitimement éprouver ce besoin.

---

## Ce que ces principes ne garantissent pas

Ils empêchent les pires dérives : un module qui deviendrait une bibliothèque juridique à surveiller indéfiniment, un module qui dicterait une conduite plutôt que d'expliquer un monde, un module qui dépendrait d'une IA en temps réel pour fonctionner. Ils ne garantissent pas à eux seuls qu'une fiche soit bien écrite, utile, ou facile à trouver — la qualité de rédaction, les choix d'écran et le modèle de données restent un travail de conception séparé, mené au moment du chantier concret.

## Où va la suite

Face à un nouveau cas, la première question n'est plus « faut-il modifier la doctrine ? » mais « ce cas se résout-il dans la conception des écrans, le modèle de données, ou la méthode de rédaction des fiches ? ». Un futur document de chantier portera tout ce qui reste appelé à évoluer : le nom définitif du module, les univers, les formats de fiches, les écrans, les portes d'entrée concrètes, la méthode de fabrication. Ce document-ci ne bouge pas au même rythme.
