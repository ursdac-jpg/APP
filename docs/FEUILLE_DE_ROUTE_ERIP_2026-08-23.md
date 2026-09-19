# Feuille de route produit ERIP — 2026-08-23

Audit global de tous les chantiers identifiés (ouverts, en attente, à l'état d'idée), priorisation par ROI produit, et mesure de l'intérêt réel d'investir dans l'architecture V4 dès maintenant. Remplace la vision d'ensemble en le complétant — ne réécrit pas les décisions déjà prises sur chaque chantier, qui restent dans leurs fiches respectives.

**Signal à vérifier avant toute chose** : la mémoire du 2026-08-22 note "démonstration du logiciel dans 2 jours". Si cette démonstration n'a pas encore eu lieu, elle domine tout le reste de cette feuille de route à très court terme — voir Arbitrage.

## 1. Inventaire

### A. Chantier en cours — stabilisation Bilan V1

| Chantier | Objectif | Apport utilisateur | Apport CIP | État |
|---|---|---|---|---|
| Plan de correction V1 (RC-01 à RC-12) | Corriger 12 causes racines d'un audit externe (50 anomalies) | Parcours de correction du CV cohérent, sans détour ni écran cassé | Outil fiable à recommander sans réserve | RC-02/07/08/09 clos et vérifiés. RC-10/01/05 introuvables, à clarifier. |
| Rapport terrain 14 points (2026-08-22) | Corriger les bugs/frictions trouvés par Denis en usage réel | Navigation "Retour" fiable, cohérence axes/recommandations | — | 5 points corrigés. 2 points 🔴 restants (navigation interne aux fenêtres, cohérence nombre d'axes/recommandations) + audit UX designer senior en attente. |
| Retours terrain Atelier CV + Rapport Bilan, 10 points (captures 2026-08-22) | Accordéons du rapport, bugs Atelier CV, éditeur identité | Rapport plus lisible, Atelier CV plus fiable | — | En file d'attente, explicitement mis de côté "après le chantier en cours" — ce chantier (unification éditeur expériences) est désormais terminé, donc débloqué. |

### B. Chantiers de compréhension du CV (issus de cette session)

| Chantier | Objectif | Apport utilisateur | Apport CIP | État |
|---|---|---|---|---|
| Prompt fusion V3 | Un seul passage IA au lieu de deux (diagnostic+extraction) | Un aller-retour de moins vers l'assistant IA | Moins de manipulation à expliquer | Prototype + protocole de test (5 profils) prêts. En attente que Denis lance les 15 conversations de test. |
| Enrichissements V3 (A/B/C/D) | Cohérence interne renforcée dans le prompt fusionné | Diagnostic/extraction plus fiables entre eux | — | Proposés, validés en audit, pas encore intégrés au prototype. |
| Conservation confiance/alertes | Arrêter de jeter une donnée déjà produite par le prompt actuel | Signal "à vérifier" sur une info incertaine | — | Proposition d'audit. Coût quasi nul, indépendant du verdict V3 (déjà produit par `extraction-cv.md` aujourd'hui). |
| Persistance du diagnostic (`dossier.ia.bilan`) | Arrêter de perdre le diagnostic à chaque réinitialisation | Reprise de session sans perdre son analyse | Analyse disponible en Atelier CV sans redemander un passage IA | Proposition d'audit, coût faible (réutilise le pattern `dossier.ia` déjà existant). |
| Qualité structurée par expérience | Signal clarté/quantification par expérience, réutilisable | Priorisation des expériences à retravailler | — | Proposition d'audit, nécessite un peu de prompt en plus. |
| Architecture V4 (compréhension du CV, couches, Relations) | Modèle de connaissance commun à toutes les restitutions IA futures | Aucun bénéfice direct isolé | Aucun bénéfice direct isolé | **Gelée** — direction stratégique, pas un chantier à mener maintenant. |
| ATS (score de correspondance) | Évaluer la compatibilité CV/mots-clés métier | Anticiper un filtrage automatisé | Argument concret en entretien CIP | Idée seulement, aucune conception commencée. |
| Aide à la décision avant réécriture | "Est-ce que ça vaut le coup d'appliquer ces recommandations ?" | Réduit l'abandon après diagnostic | Objectif partagé avant l'effort de réécriture | **Marqué prioritaire par Denis** (2026-08-19). Prototype + cas de test écrits, en attente du vrai cycle de test par Denis. |

### C. Feuille de route stratégique 2026 (audit du 2026-08-13)

| Chantier | Objectif | Apport utilisateur | Apport CIP | État |
|---|---|---|---|---|
| Lexique | Glossaire de définitions emploi/insertion/droit | Comprendre le vocabulaire rencontré | Support pédagogique prêt à montrer | ✅ Clos, 121 fiches, corpus 100%. |
| Cohérence documentaire ERIP | Vocabulaire/définitions harmonisés dans tout le projet | Indirect (moins d'incohérences visibles) | — | ✅ Clos. |
| Carte de correspondance | Visualiser poste/compétences/expériences/preuves | Comprendre comment sa candidature est évaluée | Support d'explication en entretien | ✅ Clos, implémenté et committé. |
| Module Repères | Garder/retrouver une réflexion pendant le parcours, seul ou avec le CIP | Rien n'est perdu entre deux rendez-vous | Reprise de rendez-vous facilitée | ✅ V1 fonctionnelle complète. En attente de retour terrain réel (CIP). |
| Cohérence transversale CV/lettre/entretien | Vérifier qu'une candidature raconte la même histoire partout | Repère les contradictions entre documents | Argument de qualité globale du dossier | Partiel — l'axe existe dans le schéma, mais `hostDataAdapter.js` ne reçoit jamais lettre/entretien. Fonctionnalité réelle entièrement à faire. |
| Regard recruteur | Simulation + inquiétudes recruteur + regard virtuel fusionnés | Se préparer au regard extérieur porté sur son dossier | Angle de préparation supplémentaire | Pas commencé, le plus ambitieux et risqué des 5. |
| Accessibilité (au-delà du Confort de lecture) | Navigation clavier, lecteurs d'écran, contrastes | Rend ERIP réellement utilisable par tous | Conformité pour un usage en structure | Pas commencée (0 aria-live, 0 skip-link vérifié). |
| Intégration progressive dans les modules | Diffuser les capacités IA existantes plus largement | Variable selon le module | — | Vague, jamais précisée concrètement. |

### D. Chantiers techniques/transversaux

| Chantier | Objectif | État |
|---|---|---|
| Éditeur dédié bloc Candidature | Rester dans le Bilan pour corriger métier visé/mode de recherche | ✅ Fait via la "fenêtre Agir" (2026-08-22) — la mémoire dédiée est obsolète sur ce point. |
| Découpage de `js/app.js` (24 700+ lignes) | Fichier monolithique, à répartir | Condition de démarrage remplie depuis le 2026-07-30, jamais relancé. |
| Refonte panneau Découverte "Informations complémentaires" | Fusionner 2 mécanismes parallèles de formation | Pas commencée. |
| Socle typographique commun | Variables CSS partagées, éviter de réinventer l'échelle à chaque module | Corrigé au coup par coup, socle jamais posé (décision explicite de reporter). |
| Renommage de l'application | Collision de nom avec un dispositif réel (ERIP) | Non tranché. |

### E. Explicitement écartés — ne pas reproposer sans fait nouveau

Compagnon IA conversationnel transversal · Diagnostic d'accompagnement CIP global façon i-Milo · Comparaison avant/après entre deux diagnostics réels · Adaptation contextuelle (CV orienté métier+contexte) · Assistance finalisation lettre/entretien étendue à l'architecture complète du CV · Score de compétitivité chiffré · Comité de recrutement virtuel · Bibliothèques Formation/Insertion/Droits comme données vivantes tenues à jour.

## 2. Priorisation par ROI produit

Classement par retour sur investissement réel, pas par facilité de développement. Échelle : bénéfice (faible/moyen/fort), coût (faible/moyen/élevé), risque de régression (faible/moyen/élevé).

| Rang | Chantier | Bénéfice utilisateur | Bénéfice CIP | Fréquence d'usage | Dépendances | Coût dev | Risque régression |
|---|---|---|---|---|---|---|---|
| 1 | Finir la stabilisation V1 (2 points 🔴 restants + RC-10/01/05) | Fort — bloque une utilisation fiable | Fort — condition pour recommander l'outil | Très haute (tout le monde passe par le Bilan) | Aucune | Faible-moyen (déjà scopé) | Faible |
| 2 | Lancer le test V3 fusion (5 profils) | Moyen à terme (un aller-retour IA en moins) | Faible | Haute | Aucun dev — c'est un test à exécuter | Nul (aucun code changé) | Nul |
| 3 | Lancer le pilote "Aide à la décision" | Fort — cible directement l'abandon après diagnostic | Moyen | Haute | Aucune | Nul — c'est un test à exécuter | Nul |
| 4 | Confiance/alertes conservées + diagnostic persisté | Moyen (Atelier CV, reprise de session) | Faible direct | Haute (touche tous les Bilans) | Aucune | Faible | Faible (additif, rétrocompatible) |
| 5 | Rapport terrain Atelier CV/Bilan (10 points restants) | Moyen à fort (lisibilité, bugs réels) | Faible-moyen | Haute | Débloqué par la fin du chantier expériences | Moyen | Faible-moyen |
| 6 | Découpage de `js/app.js` | Nul direct | Nul direct | — | Aucune | Élevé | Moyen (fichier central) |
| 7 | Cohérence transversale CV/lettre/entretien | Moyen | Moyen | Moyenne (candidatures avec les 3 documents) | Bénéficierait de V4 (couche Relations) | Élevé | Faible |
| 8 | Qualité structurée par expérience | Moyen, différé (sert des modules futurs) | Faible direct | — | Aucune | Faible-moyen | Faible |
| 9 | Accessibilité | Fort pour une partie du public, invisible pour le reste | Moyen (conformité structure) | — | Aucune | Moyen-élevé | Faible |
| 10 | Regard recruteur | Fort si réussi | Fort si réussi | — | Bénéficierait de V4 (couche Analyse) | Très élevé | Moyen (le plus risqué des 5) |
| 11 | ATS | Moyen (anticipation) | Faible | — | A besoin de V4 pour être vraiment bon marché | Élevé sans V4, moyen avec | Faible |
| 12 | Socle typographique commun | Faible direct (déjà corrigé au cas par cas) | Nul | — | Aucune | Faible | Faible |
| 13 | Refonte panneau Découverte | Faible-moyen | Nul | — | Aucune | Moyen | Faible |
| 14 | Renommage de l'application | Nul fonctionnel, risque juridique évité | Nul | — | Aucune | Faible (mais irréversible une fois fait) | Nul technique |
| — | Architecture V4 en elle-même | Nul isolé | Nul isolé | — | Valorisée seulement par 7/10/11 | Élevé | Élevé si construite sans besoin réel |

## 3. Où l'architecture V4 changerait la donne

V4 n'est pas une amélioration générique — elle n'a de valeur que pour les chantiers qui ont réellement besoin d'une représentation partagée du CV. Sur l'ensemble recensé :

- **Cohérence transversale CV/lettre/entretien** — le candidat le plus net. Le blocage actuel n'est pas seulement technique (hostDataAdapter ne reçoit pas lettre/entretien), c'est conceptuel : détecter une contradiction ENTRE documents est exactement ce que la couche Relations de V4 est faite pour représenter. Sans V4, ce chantier redemanderait une lecture complète des 3 documents à chaque vérification.
- **Regard recruteur** — bénéficierait fortement de la couche Analyse (clarté/quantification déjà calculées par expérience) : évite de refaire cette lecture depuis zéro pour juger "ce que verrait un recruteur".
- **ATS** — le cas d'usage qui validerait le mieux la couche Relations (correspondance mots-clés/métier). Sans V4, chaque score demanderait un nouveau passage IA complet sur le CV brut.
- **Carte de correspondance (déjà fait)** — preuve rétroactive que la couche Relations a de la valeur : ce module a déjà dû inventer sa propre version ad hoc (l'entité `Attente`) du même besoin, avant même que V4 soit formulée.
- **Aide à la décision avant réécriture** — bénéficierait modestement de la couche Diagnostic persistée (hypothèse construite sur un diagnostic déjà structuré plutôt que redemandé), mais fonctionne déjà sans.
- **Tout le reste** (Lexique, Repères, Accessibilité, découpage `app.js`, socle typographique, renommage) — **aucun rapport avec V4**. Important de le dire explicitement : V4 n'est pas une réponse universelle, seulement à 3-4 chantiers précis, dont un seul (Cohérence transversale) est déjà dans la feuille de route actuelle.

**Conclusion de cette section** : investir dans V4 maintenant n'aurait de sens que si Cohérence transversale, Regard recruteur ou ATS étaient engagés dans l'immédiat. Aucun ne l'est. V4 reste donc à juste titre une direction, activée par le premier de ces trois chantiers qui sera réellement lancé — jamais construite pour elle-même avant.

## 4. Arbitrage — les 5 prochaines décisions

1. **Finir la stabilisation V1** — RC-10/RC-01/RC-05 (clarifier leur contenu ou les classer hors périmètre), et les 2 points 🔴 restants du rapport terrain (navigation interne aux fenêtres/assistants, cohérence axes/recommandations). C'est la seule décision qui bloque tout le reste : un outil recommandable passe avant toute nouvelle valeur. Si la démonstration signalée pour "dans 2 jours" (2026-08-22) n'a pas encore eu lieu, ce point n'est pas discutable, il est urgent.
2. **Lancer les deux protocoles de test déjà prêts** (V3 fusion et Aide à la décision) — aucun coût de développement supplémentaire, ce sont des décisions de Denis à exécuter, pas du code à écrire. Les résultats conditionnent directement la suite de deux chantiers déjà engagés.
3. **Intégrer confiance/alertes conservées + persistance du diagnostic** — les deux enrichissements à ROI quasi gratuit identifiés dans l'audit précédent, indépendants du verdict V3 (déjà produits aujourd'hui), rétrocompatibles, risque nul. Le meilleur rapport valeur/effort de toute cette feuille de route.
4. **Reprendre le rapport terrain Atelier CV/Bilan (10 points)** — désormais débloqué (le chantier qui le retardait est terminé), bénéfice direct et concret, coût modeste comparé aux gros chantiers.
5. **Choisir consciemment entre Cohérence transversale et Regard recruteur comme prochain grand chantier** — pas les deux en parallèle. Cohérence transversale a un schéma déjà à moitié prêt et une meilleure synergie avec V4 ; Regard recruteur a plus de valeur si réussi mais le risque le plus élevé de toute la feuille de route. Une décision consciente maintenant évite d'improviser cet arbitrage plus tard sous pression.

## Feuille de route à court/moyen/long terme

- **Court terme (jours)** : décisions 1 et 2 ci-dessus. Rien d'autre ne devrait avancer avant que V1 soit réellement fermé et que les deux tests en attente aient produit un résultat.
- **Moyen terme (V1.1, semaines)** : décisions 3 et 4 — les enrichissements quasi gratuits, le reste du rapport terrain, puis l'intégration du prompt V3 si le test le confirme.
- **Long terme (V2)** : le chantier choisi à la décision 5, avec V4 activée à ce moment précis si c'est Cohérence transversale ou (plus tard) Regard recruteur/ATS qui est retenu — jamais avant. Accessibilité et découpage de `js/app.js` restent valides mais n'ont pas de fenêtre naturelle avant ce palier.

## Plan validé par Denis (2026-08-23) — 4 étapes, ordre strict

1. **✅ Terminé** — Stabilisation V1 close (audit final : 358/358 tests, aucune erreur console, commit dédié `b162029`). Deux points UX mineurs et l'éditeur CV général (items 4/5) reclassés en backlog, pas des blocages.
2. **🔄 Étape active** — Lancer les 2 protocoles de test déjà préparés (prompt fusion V3 5 profils, Aide à la décision avant réécriture) — résultats mesurés exigés avant toute nouvelle évolution importante.
3. Choisir les enrichissements à très fort ROI — confiance/alertes conservées + persistance du diagnostic (`dossier.ia.bilan`), nommés explicitement par Denis.
4. Décider du prochain grand chantier — V4 rouverte uniquement comme **guide de décision**, jamais comme chantier autonome : à chaque nouveau chantier, se demander explicitement si une idée V4 apporte un très fort ROI, reste rétrocompatible, ne remet pas en cause la V1, et est intégrable immédiatement.

## Séquencement final des grands chantiers à venir (au-delà de l'étape 4)

4 critères demandés par Denis : valeur utilisateur, valeur CIP, réutilisabilité dans les futurs modules, capacité à enrichir durablement l'architecture — pas le coût/risque, déjà couvert plus haut.

| Ordre | Chantier | Valeur utilisateur | Valeur CIP | Réutilisabilité future | Enrichit l'architecture |
|---|---|---|---|---|---|
| 1 | Cohérence transversale CV/lettre/entretien | Moyenne | Moyenne-forte | Forte (1er module multi-documents) | Très forte — c'est le chantier où la question V4 répond déjà OUI (couche Relations) |
| 2 | Accessibilité (+ socle typographique, même geste) | Forte pour une partie du public | Moyenne (conformité) | Forte, transversale — la dette s'accumule à chaque écran non traité | Moyenne-forte |
| 3 | Découpage de `js/app.js` | Nulle directe | Nulle directe | Très forte pour tout développement futur | Forte — positionné ici pour préparer le chantier le plus complexe (5), pas en hygiène générale |
| 4 | ATS | Moyenne | Faible-moyenne | Forte si 1 et 3 déjà posés | Consomme V4 plutôt qu'il ne la construit — moment idéal pour revisiter la qualité structurée par expérience |
| 5 | Regard recruteur | Forte si réussi | Forte si réussi | Moyenne | Moyenne — le plus ambitieux et le plus risqué, volontairement en dernier, sur un socle déjà consolidé |
| — | Refonte panneau Découverte / Renommage de l'application | Faible, localisée | Nulle | Faible | Faible — opportunistes, hors séquence principale |

**Logique de la séquence** : chaque étape prépare la suivante plutôt que de l'ignorer — la Cohérence transversale pose le premier vrai besoin de représentation partagée (valide V4 sans la construire pour elle-même), l'Accessibilité et le découpage de `js/app.js` renforcent le socle avant d'aborder les deux chantiers les plus coûteux, et l'ATS profite du terrain déjà préparé avant que Regard recruteur — le plus risqué — ne soit tenté en dernier, sur des fondations déjà solides.
