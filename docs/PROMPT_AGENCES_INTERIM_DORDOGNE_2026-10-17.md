# Prompt : les agences d'intérim de la Dordogne (à coller dans ChatGPT)

> Écrit le 2026-10-17. Même circuit que pour les pages de recrutement : ChatGPT propose, un second assistant vérifie en un seul message groupé, Denis ouvre les pages à la main. **Rien n'est publié tant que Denis n'a pas vérifié.** On cherche UNE FICHE PAR AGENCE (pas par réseau) : le numéro de téléphone est celui de l'agence précise. Haute-Vienne : même prompt, en remplaçant « Dordogne » par « Haute-Vienne » et « 24 » par « 87 ».

## Le prompt

```
Tu m'aides à constituer la liste des AGENCES D'INTÉRIM de la Dordogne (code postal commençant par 24) pour une application d'aide à la recherche d'emploi. Je ne veux QUE des informations lues sur les pages officielles des agences : n'invente rien.

MÉTHODE (à suivre dans l'ordre) :
1. Pour chacun de ces réseaux, ouvre le localisateur d'agences de SON site officiel et note toutes les agences dont le code postal commence par 24 : Adecco, Randstad, Manpower, Synergie, Crit, Proman, Start People, Actual, Samsic Emploi, Supplay, Partnaire, Interaction, Kelly Services, Gi Group, Daily Interim, Temporis, Appel Médical (intérim), Axxis Intérim, Aquila RH, Domino RH, Triangle Intérim, Brain Interim. Ajoute tout autre réseau que tu trouves sur ces pages.
2. Cherche aussi les agences d'intérim INDÉPENDANTES de Bergerac, Périgueux, Sarlat-la-Canéda, Trélissac, Boulazac, Terrasson-Lavilledieu, Ribérac, Nontron, Montpon-Ménestérol, Mussidan, Thiviers, Lalinde, Excideuil, Belvès, Saint-Astier, Coulounieix-Chamiers, en lisant leur propre site.

RÈGLES STRICTES :
- Une ligne par AGENCE (une adresse précise). Un même réseau présent dans plusieurs villes = plusieurs lignes. Jamais deux lignes pour la même agence.
- Le numéro de téléphone doit être celui de CETTE agence, lu sur sa page. Si tu ne le trouves pas : écris « introuvable ». N'écris jamais un numéro de standard national à la place.
- L'adresse (https) doit être la page de CETTE agence sur le site officiel du réseau, ou le site de l'agence indépendante. Jamais un annuaire, un comparateur, un site d'offres d'emploi (Indeed, Hellowork, Jooble, etc.) ni Pages Jaunes.
- Ne mets PAS les entreprises de travail temporaire d'insertion (ETTI) ni les structures d'insertion : on les a déjà. Ne mets pas les cabinets de recrutement ou de chasseurs de têtes.
- Si une agence est fermée ou si tu n'es pas sûr qu'elle existe encore, écris « à vérifier » dans la dernière colonne. Ne la supprime pas.
- Si tu ne peux pas ouvrir un site, dis-le pour ce réseau au lieu de deviner.

FORMAT DE RÉPONSE : un seul bloc de texte, une ligne par agence, colonnes séparées par « | », sans titre, sans numéro devant les lignes, sans puces :
réseau | nom de l'agence | commune | code postal | adresse (numéro et rue) | téléphone | page de l'agence (https) | date où tu as lu la page (AAAA-MM-JJ) | remarque (« à vérifier » ou vide)

Termine par une ligne « RÉSEAUX NON LUS : » suivie de la liste des réseaux dont tu n'as pas pu ouvrir le localisateur.
```

## Et ensuite
1. Colle-moi la réponse telle quelle (comme pour les pages de recrutement).
2. Je la contrôle (doublons, adresses interdites, numéros) et je prépare le message groupé de vérification pour le second assistant.
3. Tu ouvres les pages à la main, puis les agences vérifiées entrent dans l'application.

## Point de conception à trancher avec les résultats en main
Où ranger ces agences : une fiche par agence dans le registre des employeurs, avec une nature « intérim » (hors des 21 secteurs), affichée sur l'écran « Agences d'intérim ». Proposé, pas encore décidé.
