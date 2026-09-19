# Protocole de test — Prompt 1 (Bilan de candidature)

> Document opérationnel, pas un document de conception. Il ne redéfinit rien de ce qui existe déjà dans [STRATEGIE_VALIDATION_MOTEUR_BILAN_CANDIDATURE.md](STRATEGIE_VALIDATION_MOTEUR_BILAN_CANDIDATURE.md) (grille, indicateurs, cycle d'amélioration) : il les rend directement exécutables sur des candidatures réelles, à partir de maintenant, pour chaque version du prompt. Le prompt lui-même ([prompts/bilan-v1.md](../prompts/bilan-v1.md), V2) reste figé pendant toute cette phase.

---

## 1. Sélection des CV de test

**Règle non négociable — anonymisation avant tout envoi.** Le prompt est copié-collé vers une IA externe (ChatGPT, Claude, Gemini, Mistral) sans API ni compte maîtrisé par l'application : toute donnée collée y quitte définitivement notre périmètre. Avant chaque test, retirer ou remplacer nom, coordonnées, employeurs identifiables si le CV appartient à une personne réelle identifiable — ou utiliser un CV déjà anonymisé/fictif mais réaliste. Ne jamais tester avec le CV d'une personne n'ayant pas donné son accord explicite pour cet usage.

**Corpus de référence fixe.** Une fois les CV de test choisis, ils ne changent plus d'une version de prompt à l'autre (section 7). Changer le prompt et le corpus en même temps rend toute comparaison inexploitable.

**Origine des CV.** Par ordre de préférence : CV réels anonymisés de bénéficiaires ayant donné leur accord ; à défaut, CV construits à la main mais réalistes (pas de profil caricatural conçu pour « faire réussir » ou « faire échouer » artificiellement le test).

---

## 2. Composition du premier tour de test

**6 cas pour le tour 1**, choisis pour croiser les cas les plus fréquents en usage réel avec les points de vigilance remontés par l'audit du prompt :

1. **Cas nominal** — candidat confirmé, réponse à une offre complète (niveau 3). Vérifie le fonctionnement de référence.
2. **CV très pauvre** — peu de contenu exploitable. Vérifie l'absence d'invention sur les champs `observationsArgumentees`/`pointsForts`/`pointsFaibles` (point d'audit à sévérité élevée).
3. **Candidature déjà très solide** — cas de référence positif. Vérifie que le moteur sait conclure « prêt » sans fabriquer un défaut.
4. **Élément non-compensable réellement présent** (contradiction factuelle construite volontairement — *la variante "coordonnées absentes" initialement prévue ici n'a plus lieu d'être : cette règle a été retirée le 2026-08-10, le CV transmis au diagnostic ne contient de toute façon jamais les coordonnées*). Vérifie le déclenchement correct de `alertesPrioritaires`, et sa cohérence avec les champs internes des axes concernés (point d'audit sur la frontière alertes/axes).
5. **Reconversion non expliquée** — écart de parcours sans justification dans le CV. Vérifie que c'est bien l'absence d'explication qui est pénalisée, pas la reconversion elle-même.
6. **Cumul de plusieurs dimensions déterminantes en difficulté** (ex. Crédibilité et Risques toutes deux dégradées sur le même CV). Vérifie directement le point d'audit à sévérité élevée sur le calcul de Projection recruteur : le statut ne doit pas rester artificiellement plafonné à 🟡 quand plusieurs déterminantes échouent.

**Extension.** Si le tour 1 ne révèle aucune erreur réelle (section 5) : élargir avec les cas restants de la batterie déjà définie dans la stratégie de validation (profils et cas limites non encore couverts). Si le tour 1 révèle une ou plusieurs erreurs réelles : traiter d'abord la décision de modification (section 6) avant d'élargir le corpus.

---

## 3. Grille d'évaluation par test

Six critères, notés `Conforme` / `Partiel` / `Non conforme`. Ils condensent, sous une forme directement utilisable en test manuel, les six blocs déjà détaillés dans la stratégie de validation — le contenu de ce qui rend une observation « pertinente » ou une recommandation « utile » n'est pas redéfini ici, seulement appliqué.

| Critère | Ce qui est vérifié |
|---|---|
| **Pertinence globale** | Le diagnostic parle-t-il réellement de ce CV précis, pas de généralités interchangeables ? |
| **Qualité des observations** | Chaque observation argumentée est-elle reliée à un fait vérifiable (donnée injectée ou contenu explicite du CV) ? |
| **Qualité des recommandations** | Chaque recommandation est-elle concrète, justifiée, et répond-elle à une vraie question du candidat ? |
| **Cohérence des priorités** | Les priorités `critique`/`haute` correspondent-elles à des dimensions déterminantes en difficulté ou à une alerte non-compensable réelle ? |
| **Stabilité du JSON** | Le bloc parse-t-il sans erreur ? Clés attendues respectées ? Valeurs d'énumération uniques (jamais `"a|b"`) ? Références croisées valides ? |
| **Utilité réelle pour un candidat** | Une personne qui lit ce rapport sait-elle concrètement quoi faire en premier ? |

### Fiche de test type (à dupliquer pour chaque test)

```
CV : [identifiant anonymisé]        Date : [date]        Plateforme IA : [ChatGPT / Claude / Gemini / Mistral]
Contexte fourni : niveau [1-4] · métier visé [oui/non] · offre [oui/non] · entreprise [oui/non]
Cas testé : [numéro/nom du cas, section 2]

| Critère                          | Conforme / Partiel / Non conforme | Écart constaté |
|-----------------------------------|------------------------------------|-----------------|
| Pertinence globale                |                                    |                 |
| Qualité des observations          |                                    |                 |
| Qualité des recommandations       |                                    |                 |
| Cohérence des priorités           |                                    |                 |
| Stabilité du JSON                 |                                    |                 |
| Utilité réelle pour un candidat   |                                    |                 |

Vérifications ciblées (issues de l'audit du prompt) :
[ ] Cumul de déterminantes en difficulté → Projection recruteur reflète une gravité au moins égale (jamais plafonnée à 🟡 par défaut)
[ ] Élément non-compensable présent → cohérent entre `alertesPrioritaires` et les axes concernés, sans doublon ni contradiction
[ ] CV pauvre → listes vides acceptées sans contenu inventé pour « remplir »
[ ] Champs d'énumération → une seule valeur, jamais littéralement "a|b"

Verdict global : Réussite / Réussite avec réserve / Échec
Erreur réelle détectée : Oui / Non — si oui, quelle règle explicite du prompt est violée : [citation de la règle]
```

---

## 4. Distinguer une erreur réelle d'une différence d'interprétation

Un seul test à appliquer face à un résultat qui semble décevant :

**Le prompt formule-t-il, pour ce point précis, une règle explicite, un test binaire ou une structure obligatoire ?**

- **Oui, et la sortie la contredit** → erreur réelle. Exemples : une recommandation dupliquée malgré la règle d'unicité, une observation sans lien vérifiable malgré la règle de prudence, un élément non-compensable présent dans le CV mais absent d'`alertesPrioritaires`, un JSON qui ne parse pas.
- **Non, le prompt laisse volontairement la place au jugement** → différence d'interprétation légitime, à ne pas corriger. Exemples : la sévérité exacte choisie entre 🟢 et 🟡 sur un cas limite, la formulation précise d'une recommandation, le choix des 2 à 4 observations jugées « les plus significatives ».

**Cas particulier — l'instabilité inter-exécutions.** Rejouer deux fois le même CV inchangé peut légitimement produire des formulations différentes. Ce n'est un problème à consigner que si la divergence change le **statut global** (`pret`/`a_ajuster`/`a_retravailler`) ou fait basculer une recommandation **dans ou hors de la priorité `critique`** — une variation de formulation ou de sévérité intermédiaire ne l'est pas.

---

## 5. Critère de décision — quand modifier le prompt

Une modification du Prompt 1 n'est engagée que si l'une de ces conditions est remplie :

- **Récurrence** : la même erreur réelle (section 4) apparaît sur au moins **2 CV différents** du tour de test.
- **Gravité disproportionnée** : une seule occurrence suffit si elle touche une règle de non-compensation ou produit un JSON invalide — le coût d'un tel échec ne justifie pas d'attendre une récurrence.
- **Bascule de statut** : une instabilité inter-exécutions qui change le statut global ou une priorité `critique` (section 4), même sur un seul CV.

Dans tous les autres cas : consigner l'écart dans la fiche de test, ne pas modifier le prompt. Toute modification retenue reste ciblée sur la règle précise concernée — jamais une réécriture large — conformément au cycle d'amélioration déjà défini dans la stratégie de validation.

---

## 6. Comparaison entre deux versions du prompt

1. Utiliser exactement le **même corpus** de CV que la version précédente (section 1) — jamais un corpus renouvelé en même temps qu'une version.
2. Exécuter la grille complète (section 3) sur chaque CV, pour la nouvelle version.
3. Calculer les indicateurs déjà définis dans la stratégie de validation (taux de traçabilité, faux positifs/négatifs sur les alertes non-compensables, violations de cohérence interne, stabilité inter-exécutions) pour les deux versions.
4. Comparer côte à côte, critère par critère et indicateur par indicateur.
5. **Une nouvelle version n'est adoptée que si elle égale ou améliore chaque indicateur, sans en dégrader aucun de façon significative** — toute régression constatée doit être explicitement assumée et justifiée, jamais silencieuse.

---

## 7. Déroulé pratique

1. Anonymiser le CV (section 1).
2. Remplacer les placeholders du prompt (`{CV}`, `{NIVEAU_ANALYSE}`, `{METIER_VISE_OU_NON_FOURNI}`, `{OFFRE_EMPLOI_OU_NON_FOURNIE}`, `{ENTREPRISE_CIBLEE_OU_NON_FOURNIE}`, `{OBSERVATIONS_DETERMINISTES}`) par les données du cas testé.
3. Coller l'ensemble dans la plateforme IA choisie.
4. Remplir la fiche de test (section 3) à partir de la réponse obtenue.
5. Appliquer le test de la section 4 sur tout écart constaté.
6. Une fois le tour terminé, appliquer la section 5 pour décider s'il faut modifier le prompt.

À partir de maintenant, toute évolution du Prompt 1 suit ce protocole — aucune modification sans passage par une fiche de test et une décision motivée par la section 5.
