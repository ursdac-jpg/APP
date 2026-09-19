# Constitution d'ERIP — Philosophie et gouvernance

**Statut** : document fondateur, stabilisé après un travail approfondi de test (générativité, contre-exemples, évolution dans le temps, lecture sans historique, critique adversariale). Il gouverne toute décision de conception dans ERIP, pour toute fonctionnalité, tout module, présent ou futur. Il ne sera rouvert que si un développement réel ou un test utilisateur révèle un problème qu'il ne permet pas de résoudre, jamais pour intégrer une conséquence logique supplémentaire déjà couverte par un niveau inférieur.

Ce document répond à une question unique : comment décide-t-on dans ERIP, et non comment construit-on un écran.

**Cette constitution fixe des limites et des principes. Elle ne dessine pas les interfaces.**

Chaque module dispose de sa propre démarche de conception : son propre diagnostic, ses propres choix d'interface, ses propres tests auprès des personnes concernées. Cette constitution ne remplace jamais ce travail. Elle le précède et le contraint : aucune fonctionnalité ne peut être conçue en contradiction avec elle, quelle que soit par ailleurs la qualité de son exécution.

Toute personne rejoignant le projet, qu'elle conçoive, qu'elle développe ou qu'elle accompagne des bénéficiaires, doit pouvoir évaluer une nouvelle idée à partir de ce seul document, sans connaître l'historique du projet.

---

## Comment utiliser ce document

Face à toute nouvelle fonctionnalité, poser les questions suivantes, dans cet ordre. Si une réponse est négative, la fonctionnalité doit être écartée ou reformulée avant d'aller plus loin.

1. Cette fonctionnalité aide-t-elle réellement la personne à comprendre sa situation, construire sa réflexion ou préparer ses décisions ?
2. Respecte-t-elle son jugement, sans l'influencer implicitement ni décider à sa place ?
3. Reste-t-elle disponible sans jamais chercher à retenir son attention ni créer une dépendance ?
4. Respecte-t-elle les garanties déjà établies : propriété des informations, partage volontaire, continuité optionnelle ?
5. Les choix techniques envisagés respectent-ils toujours ces garanties, ou les mettent-ils en danger ?
6. Cette fonctionnalité, combinée aux autres modules déjà existants, produit-elle un effet qui n'existerait pas isolément, et qui mériterait d'être analysé séparément ?

Ces six questions ne remplacent jamais un travail de conception propre à chaque fonctionnalité. Elles en sont le préalable.

---

## Les deux principes fondateurs

**Premier principe.** ERIP aide la personne à comprendre sa situation, construire sa réflexion et préparer ses décisions. Il présente les informations de manière loyale et transparente, sans orienter implicitement un choix ni décider à sa place.

**Second principe.** ERIP est disponible lorsqu'on en a besoin. Il ne cherche jamais à retenir l'utilisateur, ne crée jamais de dépendance et ne sollicite jamais artificiellement son attention.

Ces deux principes sont indépendants l'un de l'autre. Aucun ne se déduit de l'autre, et une fonctionnalité peut violer l'un sans violer l'autre. Un outil qui rappellerait chaque jour à quelqu'un de réfléchir à son projet, sans jamais choisir à sa place, respecterait le premier principe et violerait le second. Les deux doivent donc toujours être vérifiés, jamais un seul à la place de l'autre.

---

## Clarifications

Ces précisions n'ajoutent aucun principe nouveau. Elles rendent les deux principes fondateurs plus faciles à appliquer face à un cas concret.

**Sur la relation entre les deux principes.** Le second principe encadre la manière dont le premier s'exerce, il ne le contredit jamais. Le premier porte sur la qualité de l'aide apportée lorsque la personne est présente. Le second porte sur le fait qu'ERIP ne va jamais la chercher lorsqu'elle ne l'est pas. Ce sont deux réponses à deux questions différentes, jamais deux forces qui s'opposeraient sur une même décision.

**Sur l'influence et la manipulation.** Présenter une information vraie et pertinente influence naturellement une réflexion, ce n'est pas interdit. Ce que le premier principe interdit, c'est de sélectionner ou de formuler une information dans le but de pousser vers une décision précise. Une manière simple de vérifier la différence : une information reste loyale si elle serait présentée avec la même importance, quelle que soit la décision qu'elle favorise.

**Sur la structuration et la décision.** Organiser, hiérarchiser ou suggérer un point de départ parmi plusieurs options reste autorisé, tant que la personne garde la possibilité d'ignorer cette suggestion. Ce que le premier principe interdit n'est pas d'aider à s'orienter, c'est de décider à la place de la personne ou de porter un jugement sur elle.

**Sur le vocabulaire.**
- Créer une dépendance désigne un mécanisme conçu pour donner envie de revenir sans besoin réel, jamais le fait qu'une personne choisisse librement de revenir parce qu'un outil lui est utile.
- Solliciter artificiellement l'attention désigne une sollicitation initiée par l'application sans action de la personne, jamais une hiérarchie visuelle normale au sein d'un écran déjà consulté.

---

## Les garanties

Ces garanties découlent directement des deux principes. Elles ne sont pas des choix arbitraires : elles sont ce que ces principes impliquent nécessairement, une fois appliqués à la pratique.

- Les informations produites ou renseignées par une personne lui appartiennent. Personne d'autre, y compris un professionnel qui l'accompagne, n'y accède sans son geste explicite.
- Le partage d'une information, quelle qu'elle soit, est toujours une décision volontaire de la personne concernée, jamais une conséquence automatique de l'usage de l'application.
- La continuité entre deux moments d'utilisation, retrouver un travail commencé, est une possibilité offerte, jamais une condition de fonctionnement. Aucune donnée n'est conservée d'une session à l'autre sans une action volontaire de la personne.

---

## Les choix techniques actuels

Ces choix sont la manière dont les garanties ci-dessus sont assurées aujourd'hui. Ils ne sont pas des valeurs en eux-mêmes : ils peuvent évoluer, mais uniquement si l'évolution proposée continue de satisfaire intégralement les garanties dont ils découlent. Aucun choix technique ne doit être modifié pour une seule raison de préférence ou de commodité de développement.

- Aucun compte utilisateur n'est requis pour utiliser l'application.
- Il n'existe qu'un seul mécanisme de continuité dans toute l'application, jamais un mécanisme différent par fonctionnalité.
- La découverte de ce mécanisme de continuité n'est signalée qu'une seule fois à chaque personne, jamais répétée ensuite, quel que soit le nombre de fonctionnalités qui pourraient vouloir la signaler.
- Les données restent, par défaut, uniquement dans l'appareil utilisé. Leur transport vers un autre appareil se fait uniquement par un geste volontaire d'export puis d'import.

---

## Points de vigilance architecturaux

Les principes fondateurs ne dispensent pas d'analyser les effets émergents de l'application. À mesure qu'ERIP grandira, plusieurs informations anodines, réparties dans différents modules, pourront, une fois mises en relation, révéler une information que la personne n'aurait jamais accepté de partager explicitement.

Toute nouvelle fonctionnalité doit donc être évaluée non seulement isolément, mais aussi dans ses interactions avec les fonctionnalités déjà existantes.
