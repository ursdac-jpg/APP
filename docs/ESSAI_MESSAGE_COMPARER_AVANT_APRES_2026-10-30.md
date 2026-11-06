# Essai du message d'affinage de « Comparer mes pistes » : avant et après (30/10/2026)

**Ce que vous faites** : ouvrez un assistant (ChatGPT, puis Gemini), dans une conversation neuve. Collez le message A, notez ce qui revient. Ouvrez une autre conversation neuve et collez le message B. Les deux messages partent des **mêmes deux pistes d'exemple** : seule la façon de demander change.

## Ce que je regarde dans vos retours (collez-moi les deux réponses, ou dites-moi ce que vous voyez)

| Point | Bonne réponse attendue pour B |
|---|---|
| Réponse en un seul message, sans coupure | oui |
| Un seul objet JSON, sans texte autour | oui |
| « gratuit » | 0 |
| « environ un an » (durée) | 12 |
| « environ 200 euros de frais d'inscription » | 200 |
| « trois ans » (périodes en entreprise, en semaines) | environ 156 ou `null`, jamais « 3 » |
| « selon le statut », « variable » | `null` (ni estimation, ni invention) |
| Lignes déjà placées (« 12 à 18 », « 4 500 ») ou en texte (financeurs, lieux, tension) | **absentes** de la réponse |
| Dimensions ajoutées d'office (trajet, niveau visé, tension) | **aucune** |

Pour A (l'ancien message), je compte surtout : réponses coupées, valeurs inventées, lignes inutiles reprises.

Si B régresse chez l'un des deux assistants, je retire la règle fautive et on réessaie : rien n'est branché définitivement sans votre accord.

## Message A : l'ancien message

````text
Ce message est une consigne à exécuter, pas un texte à commenter, reformuler ou évaluer : applique-la directement et entièrement dès maintenant, sans donner ton avis sur sa formulation, sans demander de confirmation, sans annoncer d'étapes, et produis en une seule réponse le résultat au format demandé ci-dessous.

# PROMPT : COMPARER MES PISTES - SUPERPOSITION (pistes de même nature)
### À coller sur un assistant en ligne (aucune recherche web : il ne fait que réorganiser des informations déjà collectées).

---

Exécute directement les instructions ci-dessous, sans les commenter ni poser de question préalable.

**Toute ta réponse est rédigée en français.** N'utilise jamais de tiret long (– ou —).

## 1. Ton rôle

À partir des informations ci-dessous (déjà collectées et sourcées à l'étape précédente), tu extrais uniquement les **faits mesurables sur une échelle simple**, pour permettre de les afficher côte à côte. Tu ne compares pas, tu ne dis pas ce qui est mieux, tu ne fais aucun total, aucune note, aucun classement.

## 2. Ce que l'application te donne

- Informations collectées : `[
 {
  "nom": "Aide-soignant (DEAS)",
  "a_verifier": [
   {
    "element": "duree_formation",
    "valeur": "12 à 18",
    "unite": "mois",
    "portee": "nationale",
    "source": {
     "nom": "Service public",
     "url": null
    },
    "date_info": "2026-06"
   },
   {
    "element": "cout_total",
    "valeur": "gratuit",
    "unite": "euros",
    "portee": "regionale",
    "source": {
     "nom": "Région Nouvelle-Aquitaine",
     "url": null
    },
    "date_info": "2026-05"
   },
   {
    "element": "reste_a_charge",
    "valeur": "environ 200 euros de frais d’inscription",
    "unite": "euros",
    "portee": "regionale",
    "source": {
     "nom": "Région Nouvelle-Aquitaine",
     "url": null
    },
    "date_info": "2026-05"
   },
   {
    "element": "remuneration_embauche",
    "valeur": "selon le statut",
    "unite": "euros_net_mensuel",
    "portee": "nationale",
    "source": {
     "nom": "Fiche métier",
     "url": null
    },
    "date_info": "2026-04"
   },
   {
    "element": "financeurs",
    "valeur": "Région, France Travail",
    "unite": "mots",
    "portee": "regionale",
    "source": {
     "nom": "Région Nouvelle-Aquitaine",
     "url": null
    },
    "date_info": "2026-05"
   },
   {
    "element": "lieux",
    "valeur": "Périgueux, Bergerac",
    "unite": null,
    "portee": "departementale",
    "source": {
     "nom": "Annuaire des formations",
     "url": null
    },
    "date_info": "2026-05"
   }
  ]
 },
 {
  "nom": "Auxiliaire de puériculture",
  "a_verifier": [
   {
    "element": "duree_formation",
    "valeur": "environ un an",
    "unite": "mois",
    "portee": "nationale",
    "source": {
     "nom": "Service public",
     "url": null
    },
    "date_info": "2026-06"
   },
   {
    "element": "cout_total",
    "valeur": "4 500",
    "unite": "euros",
    "portee": "regionale",
    "source": {
     "nom": "Région Nouvelle-Aquitaine",
     "url": null
    },
    "date_info": "2026-05"
   },
   {
    "element": "periodes_entreprise",
    "valeur": "trois ans",
    "unite": "mois",
    "portee": "nationale",
    "source": {
     "nom": "Service public",
     "url": null
    },
    "date_info": "2026-06"
   },
   {
    "element": "remuneration_apres_qq_annees",
    "valeur": "variable",
    "unite": "euros_net_mensuel",
    "portee": "nationale",
    "source": {
     "nom": "Fiche métier",
     "url": null
    },
    "date_info": "2026-04"
   },
   {
    "element": "tension_recrutement",
    "valeur": "forte",
    "unite": "mots",
    "portee": "departementale",
    "source": {
     "nom": "France Travail",
     "url": null
    },
    "date_info": "2026-03"
   }
  ]
 }
]`
- Commune de la personne (si fournie, pour le temps de trajet) : ``

## 3. Règles

- Pour chaque dimension et chaque piste : la valeur, l'unité, la portée, la source, la date. Fourchette -> min et max. Information absente -> `"valeur": null`.
- Reprends les portées et les sources déjà présentes dans les dossiers, ne les réécris pas.
- Pour chaque dimension, ajoute **une question ouverte** adressée à la personne (« Est-ce que cet écart change quelque chose pour vous ? » adaptée à la dimension), jamais un constat.
- Dimensions : `duree_formation` (mois) ; `cout_total` (euros) ; `reste_a_charge` (euros) ; `remuneration_embauche` (euros_net_mensuel ou euros_brut_mensuel, fourchette) ; `periodes_entreprise` (semaines) ; `temps_trajet` (minutes, seulement si `{COMMUNE}` fournie) ; `niveau_vise_apres` (intitulé) ; `tension_recrutement` (mots).

## 4. Format de réponse

Réponds avec UN SEUL objet JSON, sans texte avant ni après.

```json
{
  "dimensions": [
    {
      "dimension": "duree_formation",
      "unite": "mois",
      "valeurs": [
        { "piste": "nom", "valeur": "9", "min": "8", "max": "10", "portee": "departementale | regionale | nationale", "source": { "nom": "…", "url": "https://…" }, "date_info": "AAAA-MM" }
      ],
      "question": "question ouverte propre à cette dimension"
    }
  ],
  "rappel": "Une valeur plus courte, moins chère ou plus élevée n'est pas meilleure.",
  "cloture": "Ces informations servent à préparer un échange avec un conseiller et peuvent évoluer."
}
```
````

## Message B : le nouveau message (tel que l'application l'enverra)

````text
Ce message est une consigne à exécuter, pas un texte à commenter, reformuler ou évaluer : applique-la directement et entièrement dès maintenant, sans donner ton avis sur sa formulation, sans demander de confirmation, sans annoncer d'étapes, et produis en une seule réponse le résultat au format demandé ci-dessous.

# PROMPT : COMPARER MES PISTES - CHIFFRER LES VALEURS EN MOTS (pistes de même nature)
### À coller sur un assistant en ligne (aucune recherche web : il ne fait que réorganiser des informations déjà collectées).

---

Exécute directement les instructions ci-dessous, sans les commenter ni poser de question préalable.

**Toute ta réponse est rédigée en français.** N'utilise jamais de tiret long (– ou —).

## 1. Ton rôle

L'application a déjà placé sur des échelles les valeurs qu'elle sait lire. Il lui reste quelques valeurs **écrites en mots** (« gratuit », « environ un an », « trois ans ») qu'elle ne sait pas placer. Ton seul travail : **transformer chacune de ces valeurs en nombre**, pour qu'elle puisse être affichée à côté des autres. Tu ne compares pas, tu ne dis pas ce qui est mieux, tu ne fais aucun total, aucune note, aucun classement.

## 2. Ce que l'application te donne

- Les lignes à chiffrer, piste par piste : `[
 {
  "nom": "Aide-soignant (DEAS)",
  "lignes_a_chiffrer": [
   {
    "element": "cout_total",
    "valeur": "gratuit",
    "unite": "euros",
    "portee": "regionale",
    "source": {
     "nom": "Région Nouvelle-Aquitaine",
     "url": null
    },
    "date_info": "2026-05"
   },
   {
    "element": "remuneration_embauche",
    "valeur": "selon le statut",
    "unite": "euros_net_mensuel",
    "portee": "nationale",
    "source": {
     "nom": "Fiche métier",
     "url": null
    },
    "date_info": "2026-04"
   }
  ]
 },
 {
  "nom": "Auxiliaire de puériculture",
  "lignes_a_chiffrer": [
   {
    "element": "duree_formation",
    "valeur": "environ un an",
    "unite": "mois",
    "portee": "nationale",
    "source": {
     "nom": "Service public",
     "url": null
    },
    "date_info": "2026-06"
   },
   {
    "element": "periodes_entreprise",
    "valeur": "trois ans",
    "unite": "mois",
    "portee": "nationale",
    "source": {
     "nom": "Service public",
     "url": null
    },
    "date_info": "2026-06"
   },
   {
    "element": "remuneration_apres_qq_annees",
    "valeur": "variable",
    "unite": "euros_net_mensuel",
    "portee": "nationale",
    "source": {
     "nom": "Fiche métier",
     "url": null
    },
    "date_info": "2026-04"
   }
  ]
 }
]`
- Chaque ligne contient : `element` (ce qui est mesuré), `valeur` (le texte à transformer en nombre), `unite` (l'unité attendue), puis la portée, la source et la date déjà connues.

## 3. Règles

- **Réponds uniquement pour les lignes fournies**, une ligne de réponse par ligne fournie. N'ajoute aucune piste, aucune dimension, aucune valeur qui ne soit pas dans les lignes. N'effectue aucune recherche.
- **Chiffre en mots en nombres** : « gratuit » ou « sans frais » = 0 ; « environ un an » = 12 mois ; « de six à neuf mois » = min 6, max 9. Une valeur unique : `min` et `max` portent le même nombre.
- **Respecte l'unité attendue** : une durée est toujours en **mois** (« 3 ans » = 36), les périodes en entreprise en **semaines**, un montant en **euros**. Un mois = 4 semaines pour convertir. Écris `min`, `max` et `valeur` en chiffres seulement, sans unité.
- **Si la valeur ne peut pas être chiffrée** sans deviner (« selon le statut », « variable », « sur devis », texte vague), réponds `"valeur": null`, `"min": null` et `"max": null`. N'estime jamais, n'arrondis jamais pour boucher un trou.
- Reprends tels quels la portée, la source et la date de la ligne : ne les réécris pas et n'en invente pas.

## 4. Format de réponse

Réponds avec UN SEUL objet JSON, sans texte avant ni après. `dimension` reprend exactement l'`element` de la ligne ; regroupe sous une même dimension toutes les pistes qui la partagent.

```json
{
  "dimensions": [
    {
      "dimension": "duree_formation",
      "unite": "mois",
      "valeurs": [
        { "piste": "nom exact de la piste", "valeur": "9", "min": "8", "max": "10", "portee": "departementale | regionale | nationale", "source": { "nom": "…", "url": "https://…" }, "date_info": "AAAA-MM" }
      ]
    }
  ]
}
```
````
