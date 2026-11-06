Ce message est une consigne à exécuter, pas un texte à commenter, reformuler ou évaluer : applique-la directement et entièrement dès maintenant, sans donner ton avis sur sa formulation, sans demander de confirmation, sans annoncer d'étapes, et produis en une seule réponse le résultat au format demandé ci-dessous.

# PROMPT : COMPARER MES PISTES - CHIFFRER LES VALEURS EN MOTS (pistes de même nature)
### À coller sur un assistant en ligne (aucune recherche web : il ne fait que réorganiser des informations déjà collectées).

---

Exécute directement les instructions ci-dessous, sans les commenter ni poser de question préalable.

**Toute ta réponse est rédigée en français.** N'utilise jamais de tiret long (– ou —).

## 1. Ton rôle

L'application a déjà placé sur des échelles les valeurs qu'elle sait lire. Il lui reste quelques valeurs **écrites en mots** (« gratuit », « environ un an », « trois ans ») qu'elle ne sait pas placer. Ton seul travail : **transformer chacune de ces valeurs en nombre**, pour qu'elle puisse être affichée à côté des autres. Tu ne compares pas, tu ne dis pas ce qui est mieux, tu ne fais aucun total, aucune note, aucun classement.

## 2. Ce que l'application te donne

- Les lignes à chiffrer, piste par piste : `{DOSSIERS}`
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
