# Doctrine du module « Carte de correspondance » *(nom provisoire)*

**Nom** : provisoire et volontairement neutre. « Carte de correspondance » est un nom de travail, pratique entre nous — il ne présuppose aucune forme de représentation finale (ni carte, ni graphe, ni tableau) et n'apparaît dans aucun des principes ci-dessous, pour que le choix de forme reste entièrement libre en conception.

**Statut** : document fondateur, stabilisé après deux recadrages explicites. Le premier : la version initiale organisait le module autour de la preuve (« attente → preuve »), recentrée autour du raisonnement qui relie une attente à ce qui, dans la candidature, y répond — la preuve n'est qu'un des éléments de ce raisonnement, jamais son objectif ; un principe d'absence de nouvelle analyse a été ajouté à cette occasion. Le second, pendant la conception du contrat de données : la compétence, d'abord envisagée comme pouvant apparaître dans le raisonnement si reliée à une preuve, s'est révélée par un exercice empirique être une interprétation dépendante du contexte (une même preuve illustre des compétences différentes selon l'attente considérée) — retirée du modèle structurant, elle ne peut plus jamais apparaître que comme un élément de présentation. Il ne sera rouvert que si un développement réel révèle un cas qu'aucun des principes ci-dessous ne permet de trancher, jamais pour une question qui se résout dans la représentation visuelle ou le modèle de données.

**Rattachement** : ce document est subordonné à `docs/CONSTITUTION_ERIP.md`. Il ne peut contredire ses deux principes fondateurs, il les décline pour un module précis : celui qui aide une personne à voir où sa candidature répond déjà à ce qu'un poste demande, et où elle peut la renforcer.

**Ce qu'il ajoute au rapport du Bilan de candidature, qu'aucune autre partie de l'application ne donne** : le rapport existant répond à *qu'est-ce que le diagnostic dit ?* — un constat, axe par axe. Ce module répond à une question différente : *pourquoi le diagnostic aboutit-il à cette conclusion ?* — le raisonnement qui relie une attente du poste aux éléments concrets déjà présents dans la candidature. Ce n'est donc pas une présentation alternative des mêmes informations, c'est un mode de lecture complémentaire, centré sur le raisonnement plutôt que sur le constat.

**Ce que ce document n'est pas** : aucun écran, aucune forme de représentation visuelle, aucun modèle de données. Chaque phrase a été testée contre la question : resterait-elle vraie si, dans cinq ans, l'écran, la forme choisie (texte, liste, schéma...) ou le moteur de diagnostic sous-jacent changeaient complètement ? Une phrase qui deviendrait fausse pour une seule de ces raisons appartient à un futur document de conception, pas à celui-ci.

---

## Question fondatrice

Comment rendre visible le raisonnement qui relie les attentes d'un poste aux éléments déjà présents dans une candidature, afin que la personne comprenne elle-même où sa candidature est solide et où elle peut être renforcée, sans jamais recevoir un jugement ou une note ?

Les principes qui suivent forment sa réponse. Chacun couvre une dimension qu'aucun autre ne couvre.

---

## Les principes

1. **Le module rend visible un raisonnement, jamais une simple liste d'éléments.** Ce qu'il montre relie toujours une attente du poste à ce qui, dans la candidature, y répond concrètement — jamais une attente isolée, jamais un élément de candidature isolé de l'attente qu'il éclaire.

2. **Le module n'a pas pour objectif de représenter des compétences.** Son objectif est de rendre visible le lien entre une attente et les éléments de la candidature qui permettent de l'étayer. Si, dans certains contextes, nommer une compétence aide à comprendre cette relation, elle reste un élément de présentation, jamais une donnée structurante du modèle — une même preuve peut légitimement illustrer des compétences différentes selon l'attente à laquelle on la confronte, ce qui interdit de la fixer comme un fait stable.

3. **Ce module ne crée jamais de nouvelle analyse.** Il révèle uniquement des relations déjà présentes dans les données qu'ERIP produit ailleurs (diagnostic, candidature, informations de la personne) — il ne devient jamais un second moteur d'évaluation, même partiel, même occasionnel.

4. **Pour chaque attente, le module montre où en est la solidité du raisonnement qui la relie à la candidature — jamais réduite à un chiffre ou un pourcentage.** Une attente peut être richement étayée, étayée par un seul élément (donc plus fragile), ou non étayée du tout : des états à décrire, jamais à noter.

5. **Le module n'affirme jamais qu'une attente est « satisfaite » ou « insuffisamment satisfaite ».** Il montre seulement ce qui est observable — un raisonnement étayé ou non. Juger si c'est suffisant reste toujours à la personne, et si elle le souhaite, à son conseiller.

6. **La forme de représentation n'est jamais fixée par ce document.** Elle se choisit uniquement en conception, jamais en partant d'une solution déjà choisie. Le critère qui doit guider ce choix n'est jamais l'esthétique, mais la clarté du raisonnement qu'elle rend visible — la représentation qui aide le mieux à comprendre *pourquoi* le diagnostic conclut ce qu'il conclut, pas celle qui semble la plus aboutie visuellement.

7. **Le module reste un outil de compréhension d'un raisonnement, jamais un inventaire de compétences ou de preuves isolées.** Ce qu'il expose est toujours la relation entre une attente et ce qui, dans la candidature, y répond — jamais un élément affiché détaché de cette relation.

---

## Clarifications

Ces précisions n'ajoutent aucun principe nouveau. Elles ferment des lectures littérales qui respecteraient la lettre d'un principe tout en trahissant son intention.

- Stocker une compétence, même reliée à une preuve précise, viole le principe 2 : ce n'est pas la présence d'un lien vers une preuve qui rend une compétence légitime dans le modèle, c'est son absence totale du modèle de données qui l'est. Une compétence ne peut apparaître qu'au moment de l'affichage, jamais comme une donnée conservée.
- Un indicateur visuel qui traduit implicitement un chiffre caché (ex. des barres, des étoiles) viole le principe 4 au même titre qu'un pourcentage affiché en clair.
- Reformuler « non étayé » en « insuffisant » ou « faible » glisse vers un jugement que le principe 5 interdit — le vocabulaire doit rester descriptif (élément présent ou absent), jamais évaluatif.
- Un module qui recalculerait sa propre version de l'adéquation, même légèrement différente de celle du diagnostic existant, violerait le principe 3 — pas seulement une duplication à l'identique, toute divergence non voulue entre deux jugements sur la même chose.
- Organiser ou relier des éléments déjà produits par le diagnostic (par exemple regrouper des observations éparses autour de l'attente qu'elles éclairent) reste de la présentation, pas une nouvelle analyse au sens du principe 3 — tant qu'aucun jugement nouveau n'est introduit, absent du diagnostic source.

---

## Ce que ces principes ne garantissent pas

Ils empêchent les pires dérives : un score caché, un second moteur de jugement, une liste de compétences déconnectées des faits qui les fondent. Ils ne garantissent pas à eux seuls que la représentation choisie sera claire ou agréable à utiliser — c'est le travail de la conception et des maquettes, pas de ce document.

## Où va la suite

Un futur document de conception portera : le nom définitif, quelles données du diagnostic existant réutiliser exactement, comment organiser automatiquement les éléments déjà produits autour de l'attente qu'ils éclairent, et l'exploration de la forme de représentation la plus compréhensible pour le public d'ERIP — sans présupposer qu'il s'agira d'une carte.

**Positionnement retenu, à respecter dès la conception** : ce module n'est pas un outil autonome. Il n'aura ni tuile dans la Boîte à outils, ni écran indépendant accessible sans diagnostic préalable — même logique que Regard extérieur, qui n'est accessible que depuis l'écran Repères dont il dépend entièrement. Ce module vit comme un mode de lecture complémentaire, accessible depuis le rapport du Bilan de candidature dont il dépend entièrement.
