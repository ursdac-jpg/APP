# Aide à la décision avant réécriture — cas de test pour le prototype

Réutilise le cas CIP déjà connu (`docs/CHANTIER_CARTE_CORRESPONDANCE_DONNEES_TEST.md`) — mêmes attentes, mêmes observations, pour limiter les variables. Le diagnostic et les recommandations ci-dessous sont construits à la main à partir de ce cas (aucune recommandation n'existait encore pour lui), au format réel du contrat de données du module (`DiagnosticResultat`/`Recommandation`).

## Comment l'utiliser

1. Copier `prompts/aide-decision-avant-reecriture.md` dans une conversation neuve avec l'assistant habituel (pas dans cette conversation-ci — c'est justement le point : un vrai passage indépendant, pas un rejeu par Claude qui connaît déjà la réponse attendue).
2. Coller le diagnostic (section 1 ci-dessous) à la place de la section 3 du prompt.
3. Choisir une des 4 sélections de recommandations (section 3 ci-dessous) et la coller à la place de la section 4 du prompt.
4. Récupérer la réponse brute et la rapporter telle quelle, sans la retravailler.

## 1. Le diagnostic déjà obtenu

```json
{
  "axes": [
    {
      "axeId": "adequation",
      "restitutionQualitative": "convaincant",
      "pointsForts": [
        "Expérience variée et transférable de l'accueil de publics en difficulté (structure publique, épicerie sociale, animation socioculturelle)",
        "Bonne maîtrise des outils numériques et logiciels métier (logiciel de gestion des rendez-vous, certification PIX)",
        "Autonomie démontrée dans plusieurs contextes professionnels (clôture de caisse, gestion de planning, formation de nouveaux collègues)"
      ],
      "pointsFaibles": [
        "Conduite d'entretiens de diagnostic démontrée uniquement en stage, sous supervision",
        "Construction de plans d'action démontrée uniquement en étude de cas, avec l'appui d'un formateur",
        "Un seul exemple de rédaction de compte rendu (bilan trimestriel)",
        "Aucune mention explicite du respect de la confidentialité"
      ],
      "incoherences": [],
      "risques": [],
      "observationsArgumentees": [
        { "id": "adequation-obs-0", "origine": "argumentee", "contenu": "A accueilli et orienté environ 40 usagers par jour en structure publique." },
        { "id": "adequation-obs-1", "origine": "argumentee", "contenu": "A animé des ateliers hebdomadaires pour des groupes de 8 à 15 personnes pendant 3 ans." },
        { "id": "adequation-obs-2", "origine": "argumentee", "contenu": "A conduit 5 entretiens individuels de diagnostic en stage, sous supervision." },
        { "id": "adequation-obs-3", "origine": "argumentee", "contenu": "A construit deux plans d'action individualisés en étude de cas, avec l'appui d'un formateur." },
        { "id": "adequation-obs-4", "origine": "argumentee", "contenu": "A rédigé des bilans d'activité trimestriels." },
        { "id": "adequation-obs-5", "origine": "argumentee", "contenu": "Utilise quotidiennement un logiciel métier de gestion des rendez-vous et des dossiers." }
      ]
    },
    {
      "axeId": "lisibilite",
      "restitutionQualitative": "convaincant",
      "pointsForts": ["Structure claire, rubriques attendues"],
      "pointsFaibles": ["Présentation des dates d'expérience non uniforme d'une rubrique à l'autre"],
      "incoherences": [],
      "risques": [],
      "observationsArgumentees": []
    }
  ]
}
```

## 2. Les 6 recommandations disponibles

```json
[
  { "id": "reco-1", "contenu": "Détailler davantage la conduite des entretiens individuels de diagnostic réalisés en stage : contexte, méthode utilisée, ce qui a été appris.", "dimensionsLiees": ["adequation"], "priorite": "haute", "extraitConcerne": "A conduit 5 entretiens individuels de diagnostic en stage, sous supervision.", "observationsLiees": ["adequation-obs-2"] },
  { "id": "reco-2", "contenu": "Détailler la méthode utilisée pour construire les plans d'action réalisés en étude de cas.", "dimensionsLiees": ["adequation"], "priorite": "haute", "extraitConcerne": "A construit deux plans d'action individualisés en étude de cas, avec l'appui d'un formateur.", "observationsLiees": ["adequation-obs-3"] },
  { "id": "reco-3", "contenu": "Ajouter un second exemple concret de rédaction de compte rendu ou de bilan, au-delà du bilan trimestriel déjà mentionné.", "dimensionsLiees": ["adequation"], "priorite": "moyenne", "extraitConcerne": "A rédigé des bilans d'activité trimestriels.", "observationsLiees": ["adequation-obs-4"] },
  { "id": "reco-4", "contenu": "Mentionner explicitement une expérience ou un engagement en lien avec le respect de la confidentialité.", "dimensionsLiees": ["adequation"], "priorite": "haute", "extraitConcerne": null, "observationsLiees": [] },
  { "id": "reco-5", "contenu": "Harmoniser la présentation des dates d'expérience (même format partout).", "dimensionsLiees": ["lisibilite"], "priorite": "faible", "extraitConcerne": null, "observationsLiees": [] },
  { "id": "reco-6", "contenu": "Mettre en avant une pleine autonomie dans la conduite des entretiens de diagnostic, sans mention d'un encadrement.", "dimensionsLiees": ["adequation"], "priorite": "moyenne", "extraitConcerne": "A conduit 5 entretiens individuels de diagnostic en stage, sous supervision.", "observationsLiees": ["adequation-obs-2"] }
]
```

## 3. Les 4 sélections à tester (une conversation neuve par sélection)

- **Cas A — triviale** : `reco-5` seule. Attendu : aucun changement sur l'axe `adequation`, tout au plus un ajustement modeste sur `lisibilite`.
- **Cas B — substantielle** : `reco-1`, `reco-2`, `reco-3`, `reco-4`. Attendu : des points faibles allégés sur `adequation`, sans faire disparaître la limite structurelle réelle (expériences encore en formation).
- **Cas C — reproductibilité** : exactement la même sélection que le cas B, dans une 2e conversation neuve et indépendante. Comparer les deux réponses.
- **Cas D — incohérente** : `reco-1` et `reco-6` ensemble (l'une suppose un encadrement à préciser, l'autre une autonomie totale sans encadrement). Attendu : la contradiction doit apparaître explicitement dans `hypothesesRetenues`, pas être résolue silencieusement.

Rapporter les réponses brutes pour qu'on les regarde ensemble.
