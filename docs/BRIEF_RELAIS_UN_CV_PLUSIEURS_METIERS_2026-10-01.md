# Brief à coller chez deux assistants : chantier « Un CV, plusieurs métiers » (2026-10-01)

Mode d'emploi pour Denis : coller le **brief 1** dans Perplexity (il cherche sur le web, il peut donc vérifier les sources). Coller le **brief 2** dans ChatGPT. Rapporter les deux réponses à Claude, sans les corriger : il les trie en quatre catégories (à garder, à tester, à écarter, à décider par Denis). Ne rien changer dans l'application avant ce tri.

---

## BRIEF 1 : à coller dans Perplexity (les chiffres)

```
Je conçois une application web gratuite d'aide à la recherche d'emploi, pour un public français en grande fragilité numérique (demandeurs d'emploi, personnes en reconversion). Un module repère, à partir d'un CV, les autres métiers qu'une personne pourrait exercer, puis l'aide à chercher des offres. Je voudrais savoir quels CHIFFRES PUBLICS FIABLES existent par métier et par département, pour décider lesquels on invite la personne à consulter. Exemple de départ : le métier de cariste (manutention), département de la Haute-Vienne (87). Réponds aussi pour un second exemple : aide-soignant, département de la Dordogne (24).

Ce que je veux, sous forme de TABLEAU : une ligne par source ou par indicateur, avec les colonnes suivantes.
1. Nom de l'indicateur et organisme producteur.
2. Ce qu'il mesure exactement, en une phrase simple, et ce qu'il ne mesure PAS (par exemple : une offre publiée n'est pas une embauche, une même offre peut être publiée plusieurs fois).
3. Plus petit niveau géographique disponible (France, région, département, bassin d'emploi) et niveau d'identification du métier (code ROME, intitulé, famille de métiers).
4. Fréquence de mise à jour et date de la dernière mise à jour.
5. Adresse web exacte de la page où trouver le chiffre. Tu dois avoir ouvert la page. Si tu n'as pas pu la vérifier, écris « non vérifié » ; n'invente jamais un lien.
6. Accès : lecture seule à l'écran, ou données ouvertes téléchargeables, ou interface de programmation publique.
7. Limite principale d'interprétation, pour une personne non spécialiste.

Questions précises auxquelles tu réponds en plus, par OUI ou NON suivi de la source :
- Existe-t-il un « taux d'embauche » ou un « taux de retour à l'emploi » publié PAR MÉTIER ? À quel niveau géographique ?
- Existe-t-il un indicateur public de « difficulté de recrutement » ou de « tension » par métier ? Lequel, et à quel niveau géographique ?
- Existe-t-il un nombre de « projets de recrutement » par métier et par département (enquête Besoins en main-d'œuvre) ? Quelle est sa fiabilité pour un petit département ?
- Peut-on obtenir le nombre d'offres d'emploi publiées récemment pour un métier dans un département, et par quel moyen ?

Règles strictes :
- Pas de chiffre de mémoire : chaque chiffre cité doit venir d'une page consultée, avec son adresse et sa date. Si tu ne trouves pas, écris « non trouvé ».
- Ne me donne ni score, ni classement de métiers, ni conseil sur le métier à choisir. Je veux seulement l'inventaire des chiffres existants et leurs limites.
- Termine par une synthèse de 5 lignes maximum : les trois indicateurs les plus utiles et honnêtes à montrer à une personne, et les deux à éviter parce qu'ils trompent facilement.
```

---

## BRIEF 2 : à coller dans ChatGPT (critique du parcours)

```
Tu es relecteur critique d'un parcours d'application pour un public français en insertion professionnelle : personnes peu à l'aise avec l'informatique, à la confiance en soi fragile. Je ne te demande pas de tout approuver : je veux que tu trouves ce qui peut mal tourner.

LE MODULE « Un CV, plusieurs métiers »
But : une personne dépose son CV. L'application le lit et le rend anonyme. Un assistant en ligne (toi, par exemple, via un texte que la personne copie et colle) en tire une synthèse : métier, compétences clés, expériences. Puis l'écran montre deux colonnes. Colonne de gauche : les autres intitulés du MÊME métier (le métier du CV y figure avec la mention « titre utilisé actuellement », sans être coché). Colonne de droite : jusqu'à 10 AUTRES métiers qui utilisent les mêmes compétences. Sous chaque colonne, un bouton ouvre une recherche externe qui donne les offres du moment et des repères sur ce métier. La personne coche au maximum 10 propositions en tout, sans minimum. Dès 2 cases cochées, un bouton crée autant de CV que de choix : le corps du CV ne change pas, seuls le titre et une phrase d'accroche COURTE (une seule phrase) changent. L'accroche s'adapte au type de structure visée, au secteur, au métier et au genre de la personne. Si la structure est inconnue, la phrase est générique. Tous les CV sortent dans un seul PDF de plusieurs pages, chaque CV identifiable dans l'application et par son nom de fichier. À la demande, l'application produit ensuite des lettres de motivation de candidature spontanée, sans nom d'entreprise, éventuellement regroupées pour les intitulés d'un même métier. En fin de parcours, une recherche d'offres sur l'ensemble des métiers retenus.

PRINCIPES NON NÉGOCIABLES (si une de tes idées les contredit, dis-le toi-même en tête de l'idée) :
- La personne choisit seule. Jamais de score, de pourcentage de compatibilité, de classement ni de conseil de métier. Jamais de diagnostic sur la personne.
- Rien d'inventé dans le CV. Le titre affiché est un POSTE VISÉ, jamais une expérience acquise, et jamais un titre qui exige un diplôme ou une habilitation que la personne n'a pas.
- Aucune offre d'emploi n'est stockée ni importée dans l'application. Le nombre d'offres est présenté comme une photo du moment, sans garantie.
- Ton simple et rassurant, jamais de jargon, jamais le mot « intelligence artificielle » dans les écrans.

Réponds à ces cinq questions, dans cet ordre, 12 remarques au maximum au total :
1. Où cette personne risque-t-elle de se perdre, de s'épuiser ou de se décourager dans ce parcours ? Propose des remèdes simples.
2. Comment éviter qu'un assistant propose un intitulé de métier qui n'existe pas, ou qui n'est pas utilisé dans les annonces ? Propose une méthode de vérification que la personne peut faire en un clic.
3. Qu'est-ce qui manque dans le parcours, SANS ajouter de score ni de classement ? Une idée par remarque, avec le bénéfice et le risque.
4. Rédige le TEXTE de la demande que la personne envoie à un moteur de recherche externe pour obtenir, pour une liste de métiers et un département, le nombre approximatif d'offres du moment, un récapitulatif par métier et les appellations voisines. Exige des sources et des dates, interdis les estimations non sourcées, et fais préciser que les nombres sont approximatifs.
5. Propose un banc d'essai : comment tester, sur 5 ou 6 CV réels très différents (cariste, aide à domicile, vendeuse, comptable, personne en reconversion, premier emploi), que les listes de métiers proposés sont sérieuses, sans invention et sans biais de genre ni d'âge.

Pour chaque remarque, indique ton niveau de certitude (sûr, probable, intuition). Ne reformule pas mon texte, ne fais pas de compliments : va directement aux risques et aux propositions.
```

---

## Ce que Claude fera des réponses

1. Vérifier chaque source citée par Perplexity (adresse ouverte, date, chiffre réel).
2. Trier chaque remarque de ChatGPT : à garder, à tester, à écarter (avec la raison, notamment si elle contredit un principe), à décider par Denis.
3. Reporter le résultat dans `docs/CHANTIER_UN_CV_PLUSIEURS_METIERS_2026-09-30.md`, section 12.
