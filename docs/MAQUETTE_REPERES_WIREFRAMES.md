# Maquette UX de Repères — wireframes figés

**Statut** : chantier Maquette UX clôturé (voir « Statut du chantier » en fin de document). Trois parcours conçus et figés (croquis textuels, jamais de code, jamais de HTML/CSS). Ce document trace les décisions déjà prises pour ne pas les rediscuter à chaque session.
**Rattaché à** : `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md` (référence fonctionnelle du module) et `docs/PRINCIPES_UX_REPERES.md` (grille d'évaluation des futures maquettes).

---

## Parcours 1 — Créer un Repère ancré — FIGÉ

**Champ d'application** : tout Repère dont la source est un contenu déjà affiché dans ERIP (mot du lexique, recommandation du bilan, axe de diagnostic, fiche métier/document, résultat de recherche).

**Patron retenu** : consultation d'abord (en place, sans changement d'écran) → bouton discret « Garder comme Repère » → révélation des 4 types en place → confirmation légère → retour exact au point de départ. Deux temps distincts et volontaires, jamais fusionnés en un seul geste — pour garder la frontière visible entre consulter une définition (Comprendre) et créer un Repère (Conserver).

**Ce qui varie selon le conteneur, pas la logique** :
- Mot du lexique → bulle flottante ancrée au mot.
- Recommandation / axe déjà affichés → bouton déjà visible à côté du bloc, révélation en dessous (pas de bulle, le contenu est déjà là).
- Fiche métier / document → bouton fixe sur l'écran dédié.
- Résultat de recherche → selon le niveau (liste ou détail ouvert), transposition directe des deux cas précédents.

**Point non tranché, à décider en construisant l'écran concerné** : un axe de diagnostic contient plusieurs sous-éléments (points forts, points faibles, incohérences). Le Repère se rattache-t-il toujours à l'axe entier, ou peut-il viser un fragment précis ? Retenu par défaut : le bloc entier, jamais un fragment — éviter de réintroduire une logique de sélection de texte, écartée pour raisons d'accessibilité.

---

## Parcours 2 — Créer un Repère libre — FIGÉ

**Champ d'application** : tout Repère dont l'origine est réelle mais extérieure à ce qu'ERIP peut observer (rendez-vous CIP, entretien, échange, offre, réflexion personnelle — peu importe laquelle, elle n'est jamais demandée).

**Patron retenu** : une entrée visible ajoutée sur l'écran d'accueil existant d'ERIP (page `cv`, déjà structurée en 3 cartes + « Boîte à outils »), dans le même langage visuel que les cartes existantes. Tap → révélation directe des 4 types (pas d'étape de consultation, il n'y a rien à montrer) → confirmation → retour à l'accueil.

**Décision explicitement écartée** : un élément persistant (bouton flottant ou icône fixe) affiché sur tous les écrans d'ERIP. Rejeté après vérification factuelle qu'ERIP n'a aujourd'hui aucune navigation persistante (`index.html` ne contient qu'un unique `<div id="app">`, chaque écran remplace entièrement son contenu) — introduire un tel élément aurait changé la philosophie de navigation de toute l'application, pas seulement du module Repères. Écarté aussi : un déclencheur contextuel à la sortie de chaque écran de contenu (risque de raboter jamais autorisé, se rapprocherait d'une relance interdite par la charte).

> **Note (2026-08-18, audit de cohérence documentaire)** : cette prémisse factuelle ne tient plus. ERIP a depuis introduit deux icônes persistantes (`#btnJournalParcours`/panneau Journal de parcours, `#btnCarnet`/panneau Carnet, voir `modules/reperes/index.js` et `modules/carnet/index.js`), chacune ouvrant un panneau permettant justement de créer un Repère depuis n'importe quel écran. Le raisonnement ci-dessus a donc été revu ailleurs (voir `docs/CHANTIER_CARNET.md` partie 5) plutôt qu'ici — ce paragraphe reste comme trace du raisonnement initial, à ne plus citer comme un fait actuel d'ERIP.

**Raisonnement clé retenu** : une réflexion « libre » survient dans deux situations différentes — (1) pendant l'usage d'un autre écran d'ERIP, sans lien avec son contenu (rare, en partie absorbable par le parcours ancré en rattachant au bloc/écran affiché) ; (2) hors de toute session ERIP, la personne ouvrant l'app spécifiquement pour déposer une pensée (le cas dominant) — et arrive alors nécessairement par l'écran d'accueil. Une entrée sur cet écran suffit à couvrir le cas dominant sans toucher au reste de l'application.

**Limite assumée, pas un oubli** : si une réflexion libre survient en plein milieu d'un autre écran, la personne doit retourner à l'accueil pour la créer — perte de contexte mineure acceptée pour la première version. À réévaluer seulement si l'usage réel montre que ce trou pose problème (cohérent avec la discipline MVP de la fiche fonctionnelle, section 8).

**Terminologie** : « Repère libre » remplace « Repère sans source », jugé trompeur — une origine existe toujours, elle est seulement hors de portée d'ERIP. Voir `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`, section 3.

---

## Parcours 3 — Consulter et reprendre ses Repères — FIGÉ

**Rôle exact de l'écran**, figé le 2026-08-14 :
- Afficher l'ensemble des Repères de la personne (ancrés et libres), dans tous leurs états.
- Permettre de se resituer rapidement, sans effort de mémoire.
- Offrir, sans jamais l'imposer, la possibilité d'enrichir un Repère resté minimal.
- Permettre de faire évoluer un Repère (privé → partagé, marquer/démarquer « discuté », supprimer) — toujours à l'initiative du bénéficiaire seul.
- Rester le même objet, qu'il soit consulté seul ou à deux.

**Ce qu'il ne doit jamais devenir** : une liste de tâches (pas de case « fait/pas fait », pas de statut « en retard ») ; un tableau de bord CIP (aucune métadonnée ou vue supplémentaire réservée au CIP) ; un système de priorisation algorithmique (aucun tri par « importance ») ; un second glossaire ; un écran qui sollicite activement l'enrichissement à chaque ouverture.

**Décision d'architecture verrouillée avant les wireframes** : filtre d'affichage à deux positions (*Tous mes Repères* / *Repères partagés uniquement*), entièrement contrôlé par le bénéficiaire, qui ne modifie jamais les données — voir `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`, section 4, pour le raisonnement complet. Tous les wireframes de ce parcours partent de cette même hypothèse de fonctionnement.

**Ambiguïté détectée et corrigée avant de figer un wireframe** : la fiche fonctionnelle décrivait initialement les états comme une séquence unique « Privé → Partagé → Discuté ». Un premier wireframe (3 sections exclusives : Partagés / Discutés / Privés) s'est révélé incohérent avec cette hypothèse dès qu'on considère un Repère à la fois partagé et discuté — cas que le modèle n'excluait pas. Tranché : le modèle repose sur **deux dimensions clairement distinctes**, pas une séquence — voir `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`, section 4, pour le modèle corrigé :
- **La visibilité**, qui relève exclusivement du bénéficiaire et comporte deux états mutuellement exclusifs : Privé ou Partagé.
- **L'historique**, matérialisé par l'attribut « Discuté », qui indique simplement qu'un Repère partagé a déjà été abordé en entretien. Cet attribut ne modifie jamais la visibilité et ne crée pas un nouvel état.

**Wireframe retenu (corrigé)** : deux sections exclusives seulement — **Partagés** et **Privés** — reflétant le seul vrai choix binaire (la visibilité). « Discuté » redevient un badge sur l'item lui-même à l'intérieur de la section Partagés, jamais une section à part.

```
[Filtre : Tous mes Repères ▾]

── Partagés (3) ──────────────
💬 (libre)          10/08   ✓ discuté
🔍 adéquation        08/08
📌 (libre)           07/08   ✓ discuté

── Privés (7) ─────────────────
📌 cohérence         12/08
...
```

Aucune section vide n'est affichée. Composition avec le filtre déjà verrouillé : en position « Repères partagés uniquement », seule la section Partagés s'affiche.

**Statut** : figé pour la V1. Cette clarification ne constitue pas une modification de l'expérience utilisateur mais une clarification du modèle métier, révélée par le travail de maquettage lui-même — exactement l'un des objectifs d'une phase de wireframing.

---

## Hypothèses de conception à valider par les tests (2026-08-14)

Une revue délibérément adversariale de la conception figée (parcours 1 et 2 + boucle fonctionnelle) a été menée avant de poursuivre la maquette. Les quatre points ci-dessous ne sont pas des défauts identifiés, mais des hypothèses volontairement acceptées dans la conception, qui devront être confirmées ou infirmées par les tests utilisateurs — pas par de nouvelles discussions théoriques. Le reste de la conception (fiche fonctionnelle + les deux parcours déjà figés) reste inchangé tant que les tests ne montrent pas la nécessité de le revoir.

Quatre hypothèses retenues comme prioritaires, à vérifier explicitement lors des tests :

1. **Coexistence avec les actions du Bilan CV.** Sur une recommandation ou un axe, « Garder comme Repère » cohabite avec des boutons déjà existants (« Améliorer cette recommandation », modes de correction). Risque de confusion fonctionnelle entre « je corrige mon CV » et « je garde ça pour y réfléchir » — à observer en priorité sur les écrans du Bilan CV.
2. **Pertinence réelle des quatre catégories** (Question / Idée / À approfondir / À discuter). Elles mélangent un axe « nature de la pensée » et un axe « traitement prévu » — une même réflexion peut légitimement relever de deux catégories à la fois. Risque que l'usage réel converge vers un ou deux types dominants utilisés par défaut, vidant la taxonomie de sa fonction.
3. **Capacité de l'écran Reprendre à rester utile dans le temps.** Aucune hiérarchie, aucun filtre, aucune mise en avant des items partagés en attente de discussion. Risque qu'une liste plate devienne difficile à parcourir après plusieurs semaines d'accumulation, et qu'un item partagé important passe inaperçu au moment du rendez-vous.
4. **L'hypothèse centrale du module** : les bénéficiaires reviennent-ils réellement consulter leurs Repères entre deux rendez-vous ou juste avant, de leur propre initiative — sans qu'aucune relance ni notification ne les y incite (exclu par la charte, principe C11) ? C'est l'hypothèse la plus incertaine depuis la phase d'exploration (voir `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`, section 8) ; cette revue confirme qu'elle reste le risque le plus déterminant pour l'existence même du module.

Ces quatre points doivent être observés spécifiquement lors des tests avec un CIP en exercice et, si possible, des bénéficiaires réels — avant d'envisager toute évolution de la conception.

---

## Décision de conception

Les trois parcours conçus à ce jour — Repère ancré, Repère libre, et l'écran Reprendre (deux sections Partagés/Privés, « Discuté » en badge d'historique) — sont considérés comme **figés pour la V1**. Les évolutions futures ne seront motivées ni par de nouvelles idées ni par des discussions théoriques, mais uniquement par les observations issues des maquettes et des tests utilisateurs.

Le geste d'enrichissement d'un Repère ne faisait pas partie du chantier initial de maquettage. Il a été conçu séparément, une fois les trois parcours fondamentaux validés, conformément à ce qui était prévu ci-dessus.

---

## Parcours 4 — Enrichir un Repère à la reprise — FIGÉ

**Rôle** : permettre d'ajouter un texte court à un Repère existant, uniquement au moment de la reprise, jamais à la création.

**Patron retenu** : le champ de texte n'est jamais visible par défaut. Un Repère sans texte affiche un lien discret, « + Ajouter quelques mots », qui se transforme en champ de saisie au clic, avec le focus posé directement dedans. Un Repère déjà enrichi affiche directement son champ, avec le texte déjà présent.

**Justification retenue, précisée après discussion.** La première justification envisagée reposait sur la pression d'écriture qu'un champ vide impose, la même raison qui a fait retirer le champ texte à la création. Cette raison a été écartée pour ce cas précis : au moment de la reprise, la personne a déjà engagé une démarche volontaire de consultation, le contexte n'est pas comparable à celui de la création. La justification retenue est différente : la cohérence du langage d'interaction dans tout le module. Le module raconte la même histoire du début à la fin, observer d'abord, agir ensuite, et le geste d'enrichissement doit suivre exactement le même patron que le geste de création pour que l'expérience reste continue.

**Alternative écartée** : un signal visuel apparaissant une seule fois pour suggérer cette possibilité, avant de disparaître définitivement. Écartée pour ne pas dupliquer, même à petite échelle, le système de découverte que la Constitution d'ERIP réserve à la continuité seule.

**Implémenté et vérifié** dans le prototype interactif (voir lien dans `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md` ou la conversation de conception), sans erreur constatée.

---

## Revue qualité avant finalisation V1 (2026-08-15)

Une revue en deux temps a été menée sur le prototype interactif, posture d'auditeur qualité, aucune nouvelle conception recherchée.

**Première passe** : deux boutons « Garder comme Repère » (recommandation, axe) ne portaient pas les mêmes attributs d'état accessible que les deux autres déclencheurs équivalents (le mot du lexique, le bouton d'en-tête de Mes Repères), alors que le geste est documenté comme identique partout. Corrigé, les quatre déclencheurs se comportent désormais de façon strictement identique. Le texte du panneau destiné aux testeurs, devenu incomplet après l'ajout du geste d'enrichissement, a également été mis à jour.

**Seconde passe, audit de finalisation** : un bug réel a été trouvé et corrigé — le bouton permettant de retirer la marque « discuté » restait désactivé dès qu'un Repère redevenait privé, y compris lorsqu'il portait déjà cette marque comme historique. Ceci contredisait la règle déjà documentée (réversibilité du marqueur indépendante de l'état de partage, section « Correction de modèle » de `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`). Corrigé et vérifié. Une incohérence de texte a aussi été corrigée : le bandeau du prototype annonçait encore trois parcours après l'ajout du quatrième.

---

## Statut du chantier

Ce chantier de conception (fonctionnelle et UX) est **clôturé**.

La prochaine étape est la réalisation des maquettes interactives, puis leur confrontation à des utilisateurs réels. Toute évolution de ces trois parcours devra désormais être motivée par une observation issue des maquettes ou des tests, et non par une nouvelle discussion théorique.

Trois documents complémentaires, non redondants, constituent désormais la référence de conception du module Repères :
- `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md` — référence fonctionnelle du module (ce qu'il fait et ce qu'il ne fait pas).
- `docs/PRINCIPES_UX_REPERES.md` — principes de conception servant de grille d'évaluation des futures maquettes.
- `docs/MAQUETTE_REPERES_WIREFRAMES.md` — décisions de maquette retenues pour la V1 et hypothèses à valider pendant les tests.

Le chantier de conception est considéré comme clos pour la V1. Les trois documents ci-dessus constituent désormais la référence de conception du module Repères jusqu'à l'obtention de nouvelles données issues des maquettes ou des tests utilisateurs.
