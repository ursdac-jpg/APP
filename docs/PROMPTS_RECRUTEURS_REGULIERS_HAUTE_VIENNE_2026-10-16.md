# Qui fait quoi : prompts pour trouver les pages de recrutement des employeurs de la Haute-Vienne (87)

> Écrit le 2026-10-16, à la demande de Denis, sur le modèle des prompts de la Dordogne (`docs/PROMPTS_RECRUTEURS_REGULIERS_DORDOGNE_2026-10-16.md`). Même objectif : lister les espaces de recrutement **propres aux employeurs** (page « carrières », « recrutement », « nous rejoindre »), par secteur, pour que la personne les consulte elle-même. **Rien n'est publié sur le site** : seulement l'adresse de la page.
>
> **Ce que Denis ne veut pas** : les sites intermédiaires (agrégateurs, sites qui recopient des offres, sites de repérage de candidats), aucune agence d'intérim.

## Leçons de la Dordogne, déjà intégrées dans les encadrés ci-dessous

- Sur 101 adresses données par l'assistant, **13 domaines n'existaient pas** et **17 pages étaient introuvables** alors que l'assistant disait les avoir ouvertes. Les encadrés disent donc : adresse seulement si la page a été ouverte, partir du site officiel, écrire « introuvable » plutôt que deviner.
- **Une ligne par employeur**, jamais une ligne par commune ou par agence (25 lignes presque identiques pour un seul employeur en Dordogne).
- **Pas de réponse en 70 parties** : 15 lignes au plus par partie, et l'assistant s'arrête quand il n'a plus rien de vérifié.
- Les dates et nombres d'offres ne sont à donner que s'ils sont lus sur la page (« Aujourd'hui » n'est pas une date).

## Le circuit en deux temps (décision de Denis, 2026-10-17, pour économiser les messages de Perplexity)

Denis a peu de messages sur Perplexity et plus de crédit variable sur ChatGPT. La Dordogne est terminée ; la Haute-Vienne suit ce circuit :

1. **ChatGPT cherche le gros** : Denis lance R1, R2 et R3 (ci-dessous, trois conversations) et colle les réponses à Claude.
2. **Claude range et contrôle** : sas, contrôle automatique des adresses (`node scripts/verifierRecruteursSas.js`), retrait des domaines inventés. Il garde de côté tout ce qui reste douteux : adresses qui ne répondent pas aux robots, pages introuvables sur un site qui existe, présence en Haute-Vienne non prouvée, employeurs sans page.
3. **UN SEUL message groupé pour Perplexity** : Claude écrit un message unique qui contient TOUS les doutes, avec pour chaque ligne le maximum d'informations (adresse proposée, ce qui est à vérifier, ce qui est demandé en retour), et demande une réponse en un seul bloc au format du sas. Si le message est vraiment trop long, Claude le coupe en deux messages au plus et le dit.
4. **Denis colle la réponse de Perplexity**, Claude met à jour le sas et le rapport ; Denis ouvre les pages à la main et valide.

Rien n'est public avant le « C'est bon » de Denis, ligne par ligne.

## Mode d'emploi

1. Une conversation par encadré (R1, R2, R3), dans ChatGPT avec la recherche web activée (Perplexity si vous avez à nouveau du crédit).
2. Si la réponse est coupée, répondre « oui » pour la suite.
3. Copiez la réponse **entière** dans la conversation avec Claude. Il range les lignes dans `outils/sas/recruteurs.sas.txt` (identifiants terminés par `-87`), lance le contrôle automatique des adresses (`node scripts/verifierRecruteursSas.js`), puis vous ouvrez les pages à la main.
4. Rien ne devient public sans votre « C'est bon ».

---

### R1 : Grands employeurs de la Haute-Vienne qui recrutent en continu

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en HAUTE-VIENNE (87). Je ne publie AUCUNE offre : je donne seulement l'adresse de la page de recrutement de l'employeur, que la personne consultera elle-même.

Ce que je cherche : les employeurs établis en Haute-Vienne (Limoges et le reste du département) qui ont leur PROPRE espace de recrutement (page « carrières », « recrutement », « nous rejoindre », « offres d'emploi » sur leur propre site, ou sur le logiciel de recrutement officiel vers lequel leur site renvoie) où de nouvelles offres sont publiées régulièrement. Secteurs à couvrir, un par un : santé (hôpitaux, cliniques, EHPAD, groupes associatifs ou privés), aide à la personne et action sociale, grande distribution et commerce, transport et logistique, industrie (porcelaine, maroquinerie, électricité, gant, mécanique, agroalimentaire, etc.), BTP, hôtellerie-restauration, agriculture et agroalimentaire, banque et assurance, propreté, sécurité.

À EXCLURE : tout site intermédiaire (Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, LinkedIn, Glassdoor, Jobijoba, sites d'agrégation, sites qui recopient des offres venues d'ailleurs), les agences d'intérim, France Travail. Ne retiens que des pages qui appartiennent à l'employeur lui-même.

Règles de preuve, à suivre à la lettre :
1. Pars du site officiel de l'employeur et trouve, en le parcourant, le lien vers sa page de recrutement. Donne l'adresse EXACTE de la page où les offres sont listées.
2. N'écris une ligne QUE si tu as réellement ouvert cette page ce jour et que tu y as vu des offres actuelles. Si tu n'as pas pu l'ouvrir, ne donne pas la ligne. N'invente jamais une adresse, ne la devine pas, ne la déduis pas d'un autre site.
3. Date de la plus récente : la date de publication (AAAA-MM-JJ) lue sur la page ; vide si la page n'affiche pas de date. « Aujourd'hui » ou une date limite de candidature ne sont pas une date de publication. Offres vues : le nombre lu sur la page, ou « plusieurs ».
4. UNE ligne par employeur, jamais une ligne par commune, par agence ou par magasin. Si l'employeur recrute dans plusieurs villes de la Haute-Vienne, une seule ligne avec la page de recrutement générale.
5. 15 lignes au plus par partie ; classe par secteur puis par ordre alphabétique ; attends mon « oui » pour la suite. Quand tu n'as plus rien de vérifié, écris « FIN » : ne remplis pas pour faire du volume.
6. Zéro bavardage.

Une ligne par employeur, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique, terminé par -87 (exemple : chu-limoges-87).
- famille : toujours « employeur » pour ce prompt.
- nom : nom officiel de l'employeur (jamais le nom d'une personne).
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique.
- territoire : « Haute-Vienne » si l'employeur recrute surtout sur place ; sinon « national ».
- page de recrutement : adresse https de la page que tu as réellement ouverte.
- offres vues, date de la plus récente : voir règle 3.
- compte demandé : oui ou non (faut-il créer un compte pour VOIR les offres ?).
- source : l'adresse du site officiel où tu as trouvé le lien vers la page de recrutement.
- date : vide.
```

---

### R2 : Portails officiels de recrutement par secteur (Haute-Vienne)

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en HAUTE-VIENNE (87). Je ne publie AUCUNE offre : je donne seulement l'adresse des portails de recrutement OFFICIELS que la personne consultera elle-même.

Ce que je cherche : les portails officiels de recrutement des grands employeurs publics et parapublics, avec la partie qui concerne la Haute-Vienne quand elle existe : fonction publique territoriale (centre de gestion de la Haute-Vienne et sa bourse de l'emploi territorial, Conseil départemental de la Haute-Vienne, ville de Limoges, Limoges Métropole, autres grandes communes et intercommunalités), fonction publique hospitalière (CHU de Limoges, centre hospitalier Esquirol, centres hospitaliers de Saint-Junien, Bellac, Saint-Yrieix et autres, et le portail hospitalier), fonction publique d'État (Éducation nationale et académie de Limoges, université de Limoges, CROUS, justice et administration pénitentiaire, police nationale, gendarmerie nationale, préfecture et services de l'État), armées (armée de Terre, Marine nationale, armée de l'Air et de l'Espace, centre d'information et de recrutement de Limoges), SNCF, La Poste, SDIS 87, Région Nouvelle-Aquitaine, organismes de sécurité sociale (CPAM, CAF, MSA, Carsat, Urssaf), Enedis et autres grands employeurs publics ou parapublics présents en Haute-Vienne (Agence de services et de paiement, dont le siège est à Limoges).

À EXCLURE : tout site intermédiaire ou d'agrégation d'offres, les agences d'intérim, les sites privés qui recopient des offres publiques. Ne retiens que le site officiel de l'employeur ou de l'institution. Les portails nationaux sont acceptés seulement s'ils couvrent des postes en Haute-Vienne.

Règles de preuve, à suivre à la lettre :
1. Pars du site officiel de l'institution et trouve, en le parcourant, le lien vers sa page de recrutement. Donne l'adresse EXACTE de la page où les offres ou les concours sont listés.
2. N'écris une ligne QUE si tu as réellement ouvert cette page ce jour et que tu y as vu des offres ou des avis. Sinon ne donne pas la ligne. N'invente jamais une adresse, ne la devine pas.
3. Date de la plus récente : la date de publication (AAAA-MM-JJ) lue sur la page ; vide si la page n'en affiche pas. « Aujourd'hui » et les dates limites de candidature ne comptent pas. Offres vues : le nombre lu sur la page, ou « plusieurs ».
4. UNE ligne par portail. Plusieurs organismes qui partagent le même portail (CPAM, CAF, Carsat, Urssaf) = UNE seule ligne qui les nomme tous. Les services de l'État qui publient sur « Choisir le service public » : UNE seule ligne, et seulement si la page employeur de ce portail les concerne.
5. 15 lignes au plus par partie ; classe par type d'employeur puis par ordre alphabétique ; attends mon « oui » pour la suite. Quand tu n'as plus rien de vérifié, écris « FIN ».
6. Zéro bavardage.

Une ligne par portail, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique (exemple : cdg87-emploi-territorial).
- famille : toujours « portail-officiel » pour ce prompt.
- nom : nom officiel du portail ou de l'institution.
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique. (Fonction publique et armées : administration ; hôpitaux : sante ; SNCF : transport-logistique ; police, gendarmerie, pompiers : securite.)
- territoire : « Haute-Vienne » si la page cible la Haute-Vienne ; « Nouvelle-Aquitaine » ou « national » sinon.
- page de recrutement : adresse https de la page que tu as réellement ouverte.
- offres vues, date de la plus récente : voir règle 3.
- compte demandé : oui ou non (faut-il créer un compte pour VOIR les offres ?).
- source : adresse https d'une autre page consultée ; sinon vide.
- date : vide.
```

---

### R3 : Groupements d'employeurs et fédérations de secteur qui publient des offres (Haute-Vienne)

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en HAUTE-VIENNE (87). Je ne publie AUCUNE offre : je donne seulement l'adresse de la page d'offres des groupements que la personne consultera elle-même.

Ce que je cherche : les groupements d'employeurs de la Haute-Vienne (agricoles, industriels, du bâtiment, de services), les GEIQ (groupements d'employeurs pour l'insertion et la qualification) de la Haute-Vienne, les fédérations et syndicats professionnels de secteur qui publient eux-mêmes sur leur propre site des offres de leurs entreprises adhérentes (bâtiment, hôtellerie-restauration, métiers de bouche, transport, industrie, aide à domicile, agriculture), et les chambres consulaires de la Haute-Vienne si elles ont une bourse de l'emploi ou une page d'offres.

À EXCLURE : les agences d'intérim, tout site d'agrégation d'offres, tout site qui recopie des offres venues d'ailleurs, tout organisme dont les offres ne sont visibles que sur France Travail ou sur un autre site que le sien. Ne retiens que des pages publiées par le groupement ou la fédération elle-même, avec de vraies offres qui se renouvellent.

Règles de preuve, à suivre à la lettre :
1. Pars du site officiel du groupement et trouve, en le parcourant, sa page d'offres. Donne l'adresse EXACTE de la page où les offres sont listées.
2. N'écris une ligne QUE si tu as réellement ouvert cette page ce jour et que tu y as vu des offres actuelles. Sinon ne donne pas la ligne. N'invente jamais une adresse, ne la devine pas.
3. Date de la plus récente : la date de publication (AAAA-MM-JJ) lue sur la page ; vide si la page n'en affiche pas. Offres vues : le nombre lu sur la page, ou « plusieurs ».
4. UNE ligne par structure. Si tu ne trouves aucune structure qui respecte ces règles, écris « AUCUNE » : une réponse vide vaut mieux qu'une réponse inventée.
5. 15 lignes au plus par partie ; classe par secteur puis par ordre alphabétique ; attends mon « oui » pour la suite. Quand tu n'as plus rien de vérifié, écris « FIN ».
6. Zéro bavardage.

Une ligne par groupement, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique, terminé par -87.
- famille : « groupement » (groupement d'employeurs, GEIQ) ou « federation » (fédération, syndicat professionnel, chambre consulaire).
- nom : nom officiel (jamais le nom d'une personne).
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique.
- territoire : « Haute-Vienne », « Nouvelle-Aquitaine » ou « national ».
- page de recrutement : adresse https de la page d'offres que tu as réellement ouverte.
- offres vues, date de la plus récente : voir règle 3.
- compte demandé : oui ou non.
- source : adresse https d'une autre page consultée ; sinon vide.
- date : vide.
```

---

## Ce que Claude fera des réponses

1. Ranger les lignes dans `outils/sas/recruteurs.sas.txt` (un bloc `-87`), dédoublonnées et sans les adresses interdites.
2. Lancer `node scripts/verifierRecruteursSas.js` : adresse existante ou non, domaine, la page parle d'emploi. Les pages à domaine inexistant sont écartées d'office, les « introuvables » repartent dans un prompt de correction.
3. Vous remettre la liste à ouvrir à la main (secteur par secteur). Aucune fiche n'est publique avant votre « C'est bon ».
