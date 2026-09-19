# Module Carnet — Architecture technique

**Statut** : implémentation complète et stabilisée (10/10 étapes : capture, liste, modifier/supprimer, transformation en Repère, finitions mobile, double porte d'entrée révisée — panneau compact + écran complet, validation centralisée contre les notes vides, aide guidée + suivi Umami, finitions du panneau compact, astuce dictée vocale), chaque étape vérifiée en navigateur. La conception (pourquoi, quoi) vit dans `docs/CHANTIER_CARNET.md` et `docs/DOCTRINE_CARNET.md` — ce document ne couvre que le comment.

---

## Principe directeur

Module entièrement autonome, au même titre que Repères : son propre modèle, son propre stockage (`dossier.carnet`), son propre écran. Aucune connaissance de Regard extérieur, dans aucun sens — le principe 2 de la doctrine l'interdit explicitement. Une seule vraie dépendance vers un autre module métier : une façade nouvelle exposée par Repères pour la transformation en Repère (voir plus bas), jamais l'inverse.

## Dépendances externes

| Dépendance | Nature | Justification |
|---|---|---|
| `dossier.carnet` (lecture/écriture) | Donnée | Le sujet même du module, entièrement possédé par lui. |
| `echapperAttribut()`, `trackEvenement()`, `confirmerAction()` (`js/app.js`) | Utilitaires transversaux | Même statut que pour Repères et Regard extérieur, déjà justifiés ailleurs dans le projet. |
| `reperesCreerAvecTexte(texte, onCree)` (`modules/reperes/index.js`) | Façade publique d'un autre module | Seule vraie dépendance métier. Contrat frère du geste ancré (`docs/CONTRAT_ANCRAGE_ERIP.md`), pas une extension de celui-ci — un texte déjà rédigé n'est pas une référence à un moment de l'application. Documentée symétriquement dans `modules/reperes/ARCHITECTURE_TECHNIQUE.md`. |
| `positionnerIconePersistante(idBouton, idBoutonReference)` (`js/app.js`) | Utilitaire transversal | Généralisation de `_reperesPositionnerBoutonJournal()` (né du regard critique final de Regard extérieur), extraite dès l'implémentation du Carnet, dès qu'un deuxième bouton persistant en a eu besoin. Ni proprement à Repères ni au Carnet : un utilitaire d'application, comme `trackEvenement()`. S'applique sur toutes les largeurs d'écran (desktop et mobile) depuis la finition mobile du Carnet — voir étapes plus bas. |
| `naviguerVers()` (appel entrant, pas sortant) | Orchestration | `app.js` appelle `carnetApresNavigation()`, jamais l'inverse — même patron que `regardExterieurApresNavigation()`. |

**Ce que ce module ne dépend jamais de** : `promptCache()`, `ASSISTANTS_IA`, `ouvrirFenetreAssistantIA()`, `activerCollageInstantane()`, ou tout autre mécanisme lié à un assistant IA — absence volontaire, conforme au principe 2 de la doctrine, pas un oubli.

## Façade publique

- `carnetDemarrer()` — point d'entrée vers l'écran complet, même patron que `reperesDemarrer()`. Pas de précondition. Appelée par la tuile Boîte à outils et par le lien « Voir tout mon Carnet » du panneau compact — jamais par le clic direct sur `#btnCarnet` (voir plus bas). Garde défensive : ne capture `_carnetPageOrigine` que si la page courante n'est pas déjà `'carnet'`, pour qu'un aller-retour panneau → écran complet lancé depuis l'écran complet lui-même ne corrompe jamais la page de retour (bug réel trouvé et corrigé, voir `docs/CHANTIER_CARNET.md`, partie 5 bis).
- `carnetApresNavigation()` — appelée par `naviguerVers()` après chaque navigation : repositionne `#btnCarnet` via `positionnerIconePersistante('btnCarnet', 'btnJournalParcours')`, et referme `#panneauCarnet` s'il était resté ouvert (sa position, mesurée pour l'ancienne page, n'aurait plus de sens sur la nouvelle).
- `carnetInitialiser()` — appelée une fois au chargement (`DOMContentLoaded`), garantit `dossier.carnet`, révèle `#btnCarnet` (jamais masqué, contrairement au Journal de parcours — voir chantier, partie 5), branche son clic pour **ouvrir/fermer `#panneauCarnet` sur place** — jamais `carnetDemarrer()` directement (voir partie 5 bis, révision après un premier essai qui naviguait systématiquement).

Aucune autre fonction publique tant qu'aucun appelant réel n'existe — même règle que Repères et Regard extérieur.

## Points de contact avec le reste d'ERIP

1. `index.html` : `#btnCarnet` (bouton persistant) + `#panneauCarnet` (panneau compact, coquille vide comme `#panneauJournalParcours`) — écran complet (`pageCarnet()`) atteint séparément (points 3-4). Aucune troncature du texte affiché, dans le panneau comme sur l'écran complet (`white-space: pre-wrap`, `carnet.css`).
2. `js/app.js`, `naviguerVers()` : un appel de plus, guardé, même ligne que `regardExterieurApresNavigation()` et `reperesApresNavigation()`.
3. `modules/reperes/index.js` : une façade nouvelle, `reperesCreerAvecTexte()`.
4. Un point d'entrée dans la Boîte à outils (`data/metiers.js`, `ouvrirChoixPreparationAccueil()`), même convention que les tuiles existantes (Repères y a la sienne) — appelle `carnetDemarrer()` (écran complet). **Double porte d'entrée révisée** : `#btnCarnet` ouvre un panneau compact sur place (capture + aperçu des 3 dernières notes + lien « Voir tout mon Carnet »), la tuile (et ce lien) mènent à l'écran complet — deux vues du même contenu, jamais deux contenus différents (principe 7 de la doctrine, reformulé ; partie 5 bis du chantier pour l'historique de cette révision).

## Aide guidée

`AIDE_PAGES` (`js/app.js`) : deux points de couverture, l'écran complet et l'icône persistante.

- `AIDE_PAGES.carnet` (2 étapes) : la zone de capture (`.carnet-capture`), puis la liste et ses actions (`#carnetListeConteneur`) — même patron que `AIDE_PAGES.reperes`, absente jusqu'ici (seule route de l'application sans aucune fiche, comme Repères avant son propre regard critique final).
- `AIDE_PAGES.cv`, entrée `#btnCarnet` : ajoutée aux côtés des trois icônes persistantes historiques (préférences, session, aide) — contrairement à `#btnJournalParcours` (jamais couvert ici, masqué tant qu'aucun Repère n'existe), `#btnCarnet` est visible dès le premier chargement, sa présence dans la visite guidée de la toute première page a donc du sens dès le départ. Décrit le panneau compact et le lien vers l'écran complet, jamais dupliqué avec la fiche `carnet` ci-dessus.

L'entrée `#btnPreparationAccueil` (« Boîte à outils ») a été corrigée à cette occasion, pas seulement complétée pour Carnet : elle décrivait encore « Trois parcours autonomes » alors que la fenêtre compte 6 tuiles depuis l'ajout du Bilan de candidature puis de Repères, jamais mise à jour entre-temps. Réécrite pour lister les 6 tuiles réelles.

## Suivi Umami

`trackEvenement()`, même garde `if (typeof trackEvenement === 'function')` que partout ailleurs dans ERIP, jamais capable d'interrompre l'usage réel si absente. Aucun contenu de note n'est jamais envoyé — seules des métadonnées.

| Événement | Données | Pourquoi |
|---|---|---|
| `carnet_panneau_ouvert` | — | Clic sur `#btnCarnet` qui OUVRE le panneau (pas la fermeture) — mesure l'usage du point d'entrée rapide. |
| `carnet_ecran_ouvert` | — | Chaque appel de `pageCarnet()`, quel que soit le point d'entrée (tuile ou lien du panneau). |
| `carnet_note_creee` | — | Déjà présente avant ce chantier, inchangée. |
| `carnet_note_modifiee` | — | Au blur du champ d'édition, uniquement si le texte a réellement changé depuis l'ouverture de « Modifier » — jamais à chaque frappe (même discipline que le collage en plusieurs morceaux de Regard extérieur, `docs/TESTS_REGARD_EXTERIEUR.md`). |
| `carnet_note_supprimee` | — | Après confirmation (`confirmerAction()`). |
| `carnet_suppression_annulee` | — | Clic sur « Annuler » du filet transitoire (voir « Filet d'annulation » plus bas). Mesure si des personnes se ravisent juste après un « Supprimer ». |
| `carnet_note_transformee` | `{ premiereTransformation, longueur, delaiSecondes? }` | Voir détail ci-dessous. |

**`carnet_note_transformee`, détail.** `premiereTransformation` (booléen) distingue une note transformée pour la première fois d'une note déjà transformée qu'on retransforme (la doctrine, principe 4, autorise explicitement cette répétition) — lu depuis `dejaTransformeeEnRepere` AVANT que cette transformation ne le mette à `true`. `longueur` : `Math.round(texte.length / 50) * 50`, même convention que `regard_exterieur_reponse_recue` (`modules/regard-exterieur/index.js`) — une mesure statistique, jamais une empreinte du texte. `delaiSecondes` : uniquement pour une première transformation (temps écoulé depuis la création de la note) — absent au-delà, un délai depuis la création ne mesure plus la même chose pour une retransformation, potentiellement des mois plus tard. Objectif explicite de Denis : comprendre si le Carnet sert réellement de passerelle vers Repères, sans jamais accéder au contenu des notes elles-mêmes.

## Filet d'annulation de la dernière suppression (ajout Denis 2026-09-09)

Après un « Supprimer » confirmé, la note et sa **position d'origine** sont gardées **en mémoire** (`_carnetSuppressionRecente`, jamais dans `dossier.carnet`) pendant `_CARNET_ANNULATION_DELAI` (10 s). Un bandeau discret « Note supprimée. Annuler » (`_carnetRenduFiletAnnulation()`, `.carnet-annuler-suppression`) se rend **en tête de la liste de l'écran complet** — la suppression n'existe que là. « Annuler » (`_carnetAnnulerDerniereSuppression()`) réinsère la note à son index d'origine (`splice`, clampé), sinon le minuteur l'oublie tout seul. Toute nouvelle suppression écrase le filet précédent (qui devient définitif) ; créer une note l'oublie aussi (`_carnetOublierAnnulation()` dans `_carnetCreer()`). **Ce n'est jamais une corbeille** : rien n'est conservé au-delà de ces secondes, rien n'est persisté. Le texte de la confirmation le dit (« Vous aurez quelques secondes pour annuler »).

## Étapes d'implémentation envisagées, petites et testées une à une

1. ✅ Point d'entrée minimal : icône toujours visible, écran vide, capture simple (texte + « Garder »), liste sans aucune action de transformation encore. Inclut la double porte d'entrée (icône + tuile Boîte à outils) et l'icône positionnée dynamiquement (`positionnerIconePersistante()`, extraite dès cette étape plutôt qu'à l'étape 5 — un seul utilitaire partagé avec Repères dès le départ, jamais deux implémentations en parallèle à fusionner après coup).
2. ✅ Modifier / supprimer une note. Édition inline (remplace le texte affiché par un textarea, sauvegarde à chaque frappe), même patron que l'enrichissement d'un Repère. Suppression avec `confirmerAction()`.
3. ✅ `reperesCreerAvecTexte()` côté Repères, testée seule (appelée depuis la console avant d'être câblée où que ce soit) avant intégration.
4. ✅ Bouton « Transformer en Repère » côté Carnet, câblé sur la façade précédente, indicateur discret de transformation (jamais un verrou — vérifié : un deuxième clic recrée bien un deuxième Repère).
5. ✅ Finitions : vérification mobile. A révélé une vraie régression (pas une simple hypothèse) — `#btnCarnet` et `#btnJournalParcours` occupaient exactement la même position CSS statique dès que les deux icônes étaient visibles en même temps (la règle `top: var(--hauteur-progression, 5rem)` suffisait tant qu'une seule icône persistante existait). Corrigé en généralisant `positionnerIconePersistante()` (`js/app.js`) au mobile aussi, au lieu de la laisser s'effacer au profit de la règle CSS statique — plus aucune valeur figée nulle part, ni sur desktop ni sur mobile. Revérifié sur 6 pages (cv, repères, carnet, bilan, activités, révélation), desktop et mobile, icônes vides et peuplées : aucun chevauchement.
6. ✅ Double porte d'entrée révisée, après retour d'usage réel. `#btnCarnet` ouvre désormais `#panneauCarnet` (capture + aperçu des 3 dernières notes + lien « Voir tout mon Carnet ») sur place, jamais une navigation directe — corrige au passage un vrai bug (un deuxième clic sur l'icône depuis l'écran complet corrompait `_carnetPageOrigine`, rendant « Retour » inopérant). Voir `docs/CHANTIER_CARNET.md`, partie 5 bis, et `docs/DOCTRINE_CARNET.md`, principe 7 (reformulé), pour l'historique complet de cette révision.
7. ✅ Validation centralisée : une note ne peut jamais devenir vide. Trouvé lors de la revue critique finale : la création refusait déjà un texte vide, mais rien n'empêchait de vider une note existante via « Modifier », ni de transformer cette note vidée en Repère vide. Corrigé par une seule fonction, `_carnetTexteValide(texte)`, réutilisée aux 3 points où une note pourrait devenir vide (création, sauvegarde en direct de l'édition, transformation) — jamais 3 gardes indépendantes risquant de diverger. L'édition refuse silencieusement d'enregistrer un vidage (le texte stocké reste inchangé tant qu'un contenu valide n'est pas retapé) ; supprimer une note reste le seul geste explicite pour la faire disparaître.
8. ✅ Aide guidée et suivi Umami. Fiche dédiée (`AIDE_PAGES.carnet`), entrée pour l'icône persistante (`AIDE_PAGES.cv`, `#btnCarnet`), correction au passage du texte de la Boîte à outils (resté à « Trois parcours » depuis l'ajout de deux tuiles). 6 événements Umami (ouverture panneau/écran, création/modification/suppression, transformation) — voir sections « Aide guidée » et « Suivi Umami » ci-dessus pour le détail.
9. ✅ Finitions du panneau compact, retour d'usage réel. Croix de fermeture (`data-carnet-fermer-panneau`) : jusqu'ici, seul un second clic sur `#btnCarnet` refermait le panneau — geste peu évident une fois le regard sur le panneau plutôt que sur l'icône. « Voir tout mon Carnet » : bouton visuellement cliquable (`btn btn-outline-primary`), plus un simple lien texte peu engageant. Texte de la carte d'accueil « Boîte à outils » (`js/app.js`, rendu de `pageChoixCV()`) rendu volontairement générique, plutôt que d'énumérer les outils un par un — la version précédente s'était déjà périmée deux fois de suite à chaque nouvelle tuile ; le détail de chacun reste dans l'aide guidée (`AIDE_PAGES.cv`), jamais dupliqué ici.
10. ✅ Astuce dictée vocale (Win + H). Encart toujours visible, sous le titre, avant la zone de capture — écran complet ET panneau compact. Même texte et même style que celui déjà utilisé par Découverte des compétences (`modules/decouverte-competences/decouverteParcours.js`), repris à l'identique plutôt que réinventé, pour rester cohérent visuellement. Fonction privée dédiée (`_carnetRenduAstuceDictee()`), jamais mutualisée avec Repères (qui porte sa propre copie, `_reperesRenduAstuceDictee()`) — même principe d'indépendance que le reste du module. Vérifié sans débordement, desktop et mobile, écran comme panneau (300px de large).

Chaque étape vérifiée en navigateur avant la suivante, même discipline que les deux modules précédents.
