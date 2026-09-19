# Retour d'expérience — chantier Repères V1

**Statut** : chantier clos. Ce document ne décrit pas Repères (voir `modules/reperes/ARCHITECTURE_TECHNIQUE.md`, `docs/CHANTIER_MODULE_REFLEXION_PARCOURS.md`, `docs/MAQUETTE_REPERES_WIREFRAMES.md`) — il documente ce que ce chantier a appris sur la façon de développer un module ERIP, pour servir de référence méthodologique aux suivants (Formation, Mobilité, Entretien...).

Même discipline que partout ailleurs dans ce chantier : un fait observé une seule fois reste une observation, il ne devient un principe confirmé qu'après un second cas indépendant. Ce document le rappelle explicitement là où il s'applique.

---

## 1. Ce qui a bien fonctionné

**Conception complète avant tout code.** Le concept de Repères (boucle, taxonomie, visibilité/historique, exclusions) a été entièrement fixé, challengé et figé avant la moindre ligne de code réel. Conséquence mesurable : l'implémentation n'a quasiment jamais eu à revenir sur *quoi* construire, seulement sur *comment*. Les seuls ajustements pendant le code ont porté sur des détails d'intégration (emplacement réel de la Boîte à outils, moment du pulse), jamais sur la logique métier elle-même.

**Prototype indépendant du code réel.** Construire la maquette interactive en dehors du dépôt (Artifact, jamais dans `modules/`) a permis d'itérer vite sur l'UX — plusieurs revues qualité, un vrai bug logique trouvé et corrigé (le bouton « Retirer discuté » mal désactivé) — sans aucun risque pour l'application réelle. Ce prototype a ensuite servi de référence directe pendant l'implémentation : le modèle de données, la taxonomie, la mécanique du sélecteur de type ont été repris tels quels depuis son code, pas redessinés.

**Étapes testées une à une, jamais en bloc.** Les 7 étapes du plan de migration ont chacune été vérifiées en navigateur avant la suivante. Ça a permis de détecter tôt, à moindre coût, des erreurs qui auraient été plus coûteuses à corriger plus tard : la Boîte à outils ne vivait pas où la cartographie initiale le supposait, le signal de découverte devait se déclencher à un autre moment que prévu.

**Le contrat d'ancrage écrit et figé avant le code du geste concerné.** Rédiger `CONTRAT_ANCRAGE_ERIP.md` avant d'implémenter le geste ancré a fait apparaître, sur le papier, un besoin non anticipé par la cartographie initiale (la paire rendu/branchement, nécessaire parce que le bouton d'ancrage vit dans le DOM d'un *autre* module) et une exigence de validation défensive. Ces deux découvertes ont coûté une relecture de document, pas une réécriture de code.

**Carnet technique tenu en continu.** Alimenté à chaque étape plutôt que reconstitué a posteriori, il a permis de retrouver instantanément l'état exact d'une question déjà tranchée (statut de `echapperAttribut()`, patrons déjà confirmés) au lieu de la rouvrir à chaque nouvelle décision.

**Audits successifs, pas un seul contrôle final.** Une revue qualité après la conception, une revue de couplage avant le geste ancré, un audit d'architecture complet en fin de chantier : chacun a trouvé des choses que les précédents n'avaient pas vues. Le dernier en particulier (voir section 2) a révélé une faiblesse que sept étapes d'implémentation disciplinée n'avaient pas fait remonter.

**Recherche du code réel avant de cartographier.** L'exploration factuelle de `bilan-candidature` et `decouverte-competences` avant d'écrire la première cartographie a permis d'identifier le bon précédent à suivre (`decouverte-competences`, rendu gardé dans le module) et celui à ne pas reproduire (`bilan-candidature`, rendu resté dans `app.js`) — une décision fondée sur des faits vérifiés, pas sur une intuition.

**Réutilisation systématique, vérifiée avant d'être appliquée.** `barreNavigation()`, `echapperAttribut()`, `confirmerAction()`, `trackEvenement()`, le patron de tuile Boîte à outils : chacun a été confirmé générique par lecture directe du code avant d'être réutilisé, jamais supposé. Résultat : zéro logique dupliquée, une cohérence visuelle et comportementale avec le reste d'ERIP obtenue sans travail de design supplémentaire.

## 2. Ce qui a été difficile

**Le quasi-oubli le plus important du chantier : confondre conception terminée et module existant.** Après la clôture de la phase de conception, Repères a été un temps considéré comme une « V1 terminée » alors qu'il n'existait nulle part dans le code réel — seulement dans la documentation et dans le prototype. Ce n'est qu'en ouvrant VS Code directement que l'écart a été remarqué. Une fonctionnalité peut être intégralement pensée, maquettée, review-ée, et rester malgré tout inexistante — la sensation d'achèvement documentaire ne garantit rien sur l'état du code.

**La première cartographie contenait des suppositions fausses, corrigées seulement à l'implémentation.** L'emplacement réel du rendu de la Boîte à outils (supposé dans `app.js`, en réalité dans `data/metiers.js`) et le moment réel où devait se déclencher le signal de découverte (documenté comme « après la création », en réalité « à la première ouverture de la Boîte à outils », par cohérence avec le seul précédent réel du projet) n'ont été détectés qu'en écrivant le code, malgré un travail de cartographie soigné en amont.

**Le contrat entre modules a demandé plusieurs passes avant de se stabiliser.** D'abord « `app.js` construit la chaîne transmise à Repères », puis « chaque module source fournit un objet standardisé », puis la découverte tardive (au moment du geste ancré) que ce contrat devait aussi couvrir *comment* le rendu et le branchement d'événements traversent deux modules — un besoin que la première version du contrat n'avait pas anticipé.

**Des dérives documentaires ont survécu à une discipline de mise à jour continue.** Malgré une règle appliquée à chaque étape (mettre à jour `ARCHITECTURE_TECHNIQUE.md` immédiatement après chaque décision), l'audit final a trouvé cinq incohérences entre le code et la documentation : une référence vers une section renommée, deux statuts non rafraîchis après confirmation, une garde de code incohérente, un chiffre obsolète dans le carnet. La discipline continue réduit la dérive, elle ne l'élimine pas — seul un audit dédié, avec une question précise (« est-ce que ça correspond exactement au code réel ? »), l'a révélée.

**Une vraie dette d'architecture est restée invisible pendant tout le chantier, malgré une métrique dédiée pour la détecter.** Le « test de suppression » (le module peut-il être retiré sans rien casser d'autre que ses points d'entrée ?) a été déclaré vrai à plusieurs étapes sans avoir été vérifié au niveau de précision qui aurait révélé que la table `routes` d'`app.js` n'est pas gardée. Il a fallu une question explicite et ciblée, posée en toute fin de chantier, pour le faire apparaître.

## 3. Ce que nous referions exactement de la même manière

- Concevoir intégralement avant de coder, avec des étapes de mise à l'épreuve explicites (tests de générativité, contre-exemples, revues volontairement critiques).
- Construire un prototype indépendant du code réel pour itérer sur l'UX sans risque, puis le réutiliser comme référence directe pendant l'implémentation plutôt que de redessiner.
- Étudier le code réel existant avant de cartographier un nouveau module, jamais supposer sa structure.
- Rédiger le contrat d'échange entre modules avant d'écrire le code qui l'utilise.
- Tester chaque étape en navigateur avant de passer à la suivante, jamais en bloc.
- Tenir le carnet technique en continu, pas le reconstituer après coup.
- Vérifier par lecture directe du code qu'un utilitaire est réellement générique avant de le réutiliser.

## 4. Ce que nous changerions dès le prochain module

**Écrire le contrat transverse (type Contrat d'ancrage) au moment de la cartographie initiale, pas après plusieurs étapes d'implémentation.** Ça aurait évité les allers-retours sur `contratSource` et anticipé le besoin de la paire rendu/branchement dès le départ, plutôt que de le découvrir au moment d'implémenter le geste qui en avait besoin.

**Vérifier l'emplacement réel de chaque système transversal auquel le module va se raccorder, avant d'écrire la cartographie — pas seulement la structure du module dont on s'inspire.** L'exploration avait bien cartographié `bilan-candidature` en détail, mais pas systématiquement chaque mécanisme transversal (Boîte à outils, système de pulse) sur lequel Repères allait devoir s'appuyer.

**Intégrer une vérification explicite « le code correspond-il exactement à la documentation ? » à intervalles réguliers pendant l'implémentation, pas seulement en fin de chantier.** Les cinq dérives trouvées à l'audit final auraient été corrigées à moindre coût si cette question avait été posée à mi-parcours plutôt qu'une seule fois, tout à la fin.

**Vérifier explicitement, dès la cartographie, comment le point d'entrée central de l'application (table `routes` ou équivalent) traite l'absence du module — pas seulement les points de contact que le module expose lui-même.** Le test de suppression doit porter sur *chaque* référence entrante, pas sur une affirmation générale non vérifiée précisément.

**Documenter les responsabilités (« a le droit de / ne fera jamais ») dès la cartographie plutôt qu'après plusieurs étapes d'implémentation déjà écrites.** Repères l'a fait relativement tôt, mais un module encore plus jeune y gagnerait dès le premier document.

## 5. Principes désormais acquis pour ERIP

### Confirmés (retrouvés à l'identique dans au moins 2 modules indépendants) — à appliquer sans hésiter

- Une route dédiée dans `routes` pour tout outil atteint hors du parcours guidé, la fonction de page vivant entièrement dans son module.
- La tuile Boîte à outils : `tuile(id, icone, label)` + `trackEvenement('outil_utilise', ...)` + `fermerFenetreERIP()` + appel gardé vers un point d'entrée dédié, jamais un `naviguerVers()` écrit en dur.
- Un bloc `<script>` par module, commenté, chargé avant `js/app.js`.
- La façade publique d'un module ne grandit que sur appel réel — jamais de fonction exposée « au cas où ».
- Toute dépendance externe d'un module est une exception assumée et documentée, jamais implicite.

### Confirmée par ce chantier comme faiblesse transversale, pas propre à Repères

- La table `routes` d'`app.js`, construite comme un objet littéral à évaluation immédiate, casse le chargement de toute l'application si l'un de ses modules référencés (`bilan-candidature` ou `reperes`, les deux constatés) est absent — contrairement à tout autre point de contact, gardé par construction. Consignée dans le carnet technique comme dette d'architecture, à traiter lors d'une future refonte du routeur, pas ouverte dans ce chantier.

### Observés une seule fois (Repères) — candidats, pas encore des règles

- L'accesseur privé unique avec initialisation paresseuse pour la portion de `dossier` propre à un module.
- Une feuille de style propre à un module, chargée après `css/style.css`, sans redéfinir ses classes.
- La paire rendu/branchement (deux fonctions de façade, l'une retourne du HTML, l'autre branche ses événements) pour tout contenu qu'un module insère dans l'écran d'un *autre* module.
- La validation défensive à la frontière : un module destinataire ne fait jamais confiance à l'objet reçu d'un autre module, dégrade proprement plutôt que d'échouer.

Ces quatre points ne deviennent des règles ERIP que si un second module, conçu indépendamment, les redécouvre de lui-même. Ne pas les imposer par anticipation à Formation, Mobilité ou Entretien.

### Spécifique à Repères — à ne surtout pas généraliser

- La forme exacte du `contratSource` (`{ libelle: string }`) : c'est ce que *Repères* affiche, pas une forme universelle d'échange entre modules.
- Le fait que Repères soit *la* destination d'ancrage : un fait d'aujourd'hui, pas une règle selon laquelle ERIP n'aurait jamais qu'un seul point de convergence de ce type.
- Sa section « Responsabilité du module » (jamais juger, jamais relancer, jamais devenir un tableau de bord) : des choix propres à ce que Repères a décidé d'être, pas un modèle imposé d'office à un futur module destinataire différent.
- Le contrat d'ancrage lui-même reste scopé « vers Repères ». Si ERIP développe un jour un second mécanisme de convergence comparable, il mérite son propre document, pas une extension forcée de celui-ci sur la base d'un seul cas réel.
