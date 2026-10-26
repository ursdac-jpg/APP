# Prompt et sources : trouver des « petites structures » (Dordogne et Limoges)

> **RETIRÉ le 20/10/2026** : le bloc de recherche ouverte correspondant a été supprimé de l'outil de veille (décision de Denis : pas de recherche ouverte à l'extérieur). Le repérage des structures se fait désormais dans l'onglet « Structures d'aide » de l'outil de prospection (saisie à la main, texte lu sur une photo, page d'un partenaire), puis le pont vers le sas. Voir `docs/CHANTIER_PROSPECTION_PONT_REPERAGE_PETITES_STRUCTURES_2026-10-20.md`. Ce qui suit est conservé pour mémoire, ne plus l'utiliser.


> Préparé le 2026-10-19 pour Denis (chantier `docs/CHANTIER_PETITES_STRUCTURES_2026-10-19.md`). À utiliser dans ChatGPT (recherche web activée) ou Perplexity, **une conversation par problématique et par département**.
> **Règle d'or** : la réponse d'un assistant est une **liste de candidats**, jamais une vérité. Rien n'est publié sans que VOUS ayez appelé, écrit ou ouvert la page officielle (c'est le sens de la date « vérifié le » pour une petite structure). Les assistants se trompent de numéro et citent des associations fermées.
> L'ancien bloc « Annuaire associatif » de l'outil de veille produit l'ancien format (collectes des rayons) : **ne pas l'utiliser pour ces structures**. Son remplaçant dans l'outil est prévu au plan du chantier (case « prompt »).

## 1. Où trouver ces structures (sources utiles, du plus au moins fiable)

| Source | Ce qu'on y trouve | Remarque |
|---|---|---|
| **DORA** (dora.inclusion.gouv.fr) | Services d'insertion et de solidarité avec **téléphone et mail**, recherche par commune | Service public, la plus utile pour le mail et le téléphone |
| **Soliguide** (soliguide.fr) | Aide alimentaire, accueil de jour, vestiaires, cours de français, permanences, avec horaires et contacts | Annuaire solidaire gratuit ; couverture variable selon la ville, à recouper |
| **Annuaire des associations des villes** (sites de Limoges, Périgueux, Bergerac, Sarlat, Brive...) | Associations de quartier, collectifs, avec contact | Chercher « annuaire des associations » + nom de la ville |
| **Sites des CCAS et des centres sociaux** | Permanences, ateliers, épiceries solidaires locales | La CAF de chaque département liste ses centres sociaux |
| **CRIA Nouvelle-Aquitaine** (cri-aquitaine.org) | Lieux de cours de français et d'ateliers sociolinguistiques | Déjà utilisé pour le rayon français |
| **Fédérations avec antennes locales** | Secours populaire, Restos du cœur, Croix-Rouge, Banque alimentaire, Secours catholique, Cimade, ASTI, Emmaüs, réseau des épiceries solidaires, garages solidaires, régies de quartier | Chaque fédération a sa page « trouver une antenne » |
| **HelloAsso** (annuaire des associations) | Associations locales avec un point de contact | Souvent un formulaire plutôt qu'un numéro : à recouper |
| **Répertoire national des associations** (annuaire-entreprises.data.gouv.fr) | Nom et adresse officiels d'une association | Pas de contact : sert seulement à **confirmer qu'elle existe** |
| **Le site de la structure elle-même** (comme atelier-asso.fr) | La page « Contacts » | La meilleure preuve : c'est la page que vous ouvrez pour dater |
| **Vos partenaires** (entretien, tutrice) | Les petites structures que les professionnels du terrain connaissent vraiment | Avec leur accord. **Aucun nom de personne** n'entre dans l'outil |

**À vous seul (aucun assistant ne peut le faire)** : un coup de téléphone ou un mail pour confirmer, puis noter la date. C'est ce qui rend la fiche fiable.

## 2. Le prompt (à copier tel quel, en changeant seulement les deux lignes entre crochets)

```
Tu es un extracteur de données, pas un assistant. Je constitue un annuaire public et gratuit de PETITES STRUCTURES locales d'entraide pour des personnes en difficulté ou en recherche d'emploi : associations de quartier, collectifs, permanences, épiceries solidaires, cours de français, aide alimentaire, vestiaires, accueils de jour, aide aux démarches, garages solidaires, aide aux victimes.

Département : [Dordogne (24) / Haute-Vienne (87)]
Problématique : [par exemple : cours de français et ateliers sociolinguistiques / aide alimentaire et épiceries solidaires / aide aux démarches administratives / logement et hébergement / mobilité et garages solidaires / permanences juridiques et aide aux victimes / accueil de jour et domiciliation]

RÈGLES
1. Réponds UNIQUEMENT par le bloc ci-dessous, puis deux listes courtes : « À vérifier » et « Sources consultées ». Aucune introduction, conclusion, question ni excuse.
2. Donne TOUTES les structures que tu peux sourcer pour ce département et cette problématique, sans résumer, sans « etc. ». Une structure = un bloc complet. Si c'est trop long, découpe en « PARTIE 1/3 », termine chaque partie par « PARTIE 1/3 TERMINÉE. Répondez OUI pour la suite. » et arrête-toi.
3. N'INVENTE JAMAIS. Une information non trouvée sur une page ouverte reste VIDE. Un vide vaut mieux qu'une erreur. Ne donne pas une structure dont tu n'as pas ouvert une page qui prouve qu'elle existe encore.
4. Je cherche en priorité les petites structures qui ont un TÉLÉPHONE et/ou un MAIL publics : une structure sans aucun des deux n'est pas utile, signale-la dans « À vérifier ».
5. Téléphone : le numéro de la structure ou de son accueil (jamais un mobile personnel, jamais un numéro de personne). Mail : une adresse de service ou de structure (contact@, accueil@, nom-de-l-association@), jamais une adresse nominative (prenom.nom@) ni une adresse personnelle.
6. AUCUNE personne nommée : ni président, ni directeur, ni bénévole, ni salarié. Organismes seulement. Exclus les entrepreneurs individuels.
7. Pour chaque téléphone et chaque mail, la page où tu les as lus va dans « source ». Sans page, pas de numéro ni de mail.
8. Pas d'offres d'emploi, pas de classement, pas de note, pas de « recrute régulièrement ».
9. Français correct avec accents. Jamais de tiret long : seulement le tiret simple ou la virgule.
10. Si l'association est une antenne locale d'une fédération nationale (Secours populaire, Restos du cœur...), donne l'antenne locale avec SES coordonnées, pas celles du siège national.

FORMAT (un seul bloc de code, un bloc par structure, séparés par une ligne vide, champs dans cet ordre, champ vide laissé vide) :
[PETITES-STRUCTURES]
nom: nom de la structure
type: aide-alimentaire-materielle | francais-langue | logement-hebergement | accueil-etrangers | acces-au-droit | soutien-aux-familles | sante-soins-addictions | mobilite-solidaire | budget-endettement | inclusion-numerique (choisis le type le plus proche, jamais un autre mot)
quoi: ce qu'elle fait concrètement, en une phrase simple
commune: la commune où elle est installée
telephone: 05 00 00 00 00
mail: adresse de service
site: adresse https de sa page ou de son site (vide s'il n'y en a pas)
permanences: jours et horaires s'ils sont publiés (vide sinon)
source: l'adresse EXACTE de la page où tu as lu les coordonnées
[/PETITES-STRUCTURES]
```

## 3. Que faire de la réponse

1. **Collez-la-moi telle quelle** (ou, quand l'outil de veille aura son bloc, dans l'outil). Je la range dans le **sas des structures** avec la marque « Petite structure ; » : jamais publiée, jamais datée.
2. Dans l'outil, filtre **« Petites structures »** (prévu au plan) : vous les retrouvez toutes, et vous les validez **une à une**.
3. Pour chaque fiche : ouvrez la page de la source, ou appelez, ou écrivez ; si c'est bon, « C'est bon » (la date du jour s'écrit à ce moment seulement).
4. Une fiche dont vous n'arrivez pas à confirmer l'existence : ne la validez pas.

## 4. Conversations à lancer en priorité (suggestion)

Limoges (87) d'abord, puis la Dordogne (24), une conversation par problématique : cours de français ; aide alimentaire et épiceries solidaires ; aide aux démarches administratives ; accueil de jour et domiciliation ; mobilité et garages solidaires ; permanences juridiques. Six problématiques par département, soit environ douze conversations.
