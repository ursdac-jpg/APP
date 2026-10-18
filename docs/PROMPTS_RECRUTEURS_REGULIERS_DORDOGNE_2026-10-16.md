# Qui fait quoi : prompts pour trouver les employeurs qui publient régulièrement leurs offres (Dordogne)

> Écrit le 2026-10-16, à la demande de Denis. **Objectif** : lister des espaces de recrutement **propres aux employeurs** (leur page « carrières » ou « nous rejoindre » avec des offres qui se renouvellent), par secteur, pour que la personne les consulte elle-même. **Rien ne sera publié sur le site** : ni les offres, ni leur contenu, seulement l'adresse de la page.
>
> **Ce que Denis ne veut pas** : les sites intermédiaires (agrégateurs, sites qui recopient des offres déjà publiées ailleurs, sites qui servent surtout à faire du repérage de candidats). Aucune agence d'intérim dans cette première passe.
>
> **Premier territoire** : la Dordogne (24). La Haute-Vienne viendra ensuite avec les mêmes prompts.

## Mode d'emploi (même méthode que les prompts précédents)

1. Une conversation par encadré (R1, R2, R3), dans ChatGPT **et** dans Perplexity si possible. Perplexity cite ses sources, ce qui aide à vérifier ; ChatGPT donne souvent plus de lignes. Comparez les deux.
2. Si la réponse est coupée, répondre « oui » pour avoir la suite.
3. Copiez la réponse **entière** dans la conversation avec Claude. Claude la range dans un sas (jamais public), ouvre chaque page pour vérifier qu'elle existe et qu'elle publie bien des offres, puis vous montre les fiches à valider une par une.
4. Rien ne devient public sans votre « C'est bon ». **L'emplacement dans l'application (rubrique séparée ou dans les onglets existants) est décidé après la recherche, pas avant.**

## Règles communes (déjà dans chaque encadré)

- Une page est retenue seulement si elle appartient à l'employeur lui-même (ou à un portail officiel du secteur) **et** si des offres s'y renouvellent.
- La preuve de régularité demandée : la date de la plus récente offre vue sur la page, et le nombre d'offres visibles ce jour-là.
- Interdits : Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, JobTeaser, LinkedIn, Glassdoor, et tout site qui reprend des offres d'autres sites. France Travail est connu et déjà traité ailleurs : ne pas le redonner.
- Jamais le nom d'une personne. Jamais de page qui demande de créer un compte pour voir les offres.

---

### R1 : Grands employeurs de Dordogne qui recrutent en continu

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en DORDOGNE (24). Je ne publie AUCUNE offre : je donne seulement l'adresse de la page de recrutement de l'employeur, que la personne consultera elle-même.

Ce que je cherche : les employeurs établis en Dordogne qui ont leur PROPRE espace de recrutement (page « carrières », « recrutement », « nous rejoindre », « offres d'emploi » sur leur propre site) où de nouvelles offres sont publiées régulièrement. Secteurs à couvrir, un par un : santé (hôpitaux, cliniques, EHPAD et groupes associatifs ou privés), aide à la personne et action sociale (associations d'aide à domicile, structures d'accueil), grande distribution et commerce, transport et logistique, industrie, BTP (grandes entreprises et groupes), hôtellerie-restauration (groupes et chaînes), agriculture et agroalimentaire, banque et assurance, propreté, sécurité.

À EXCLURE : tout site intermédiaire (Indeed, Jooble, Optioncarrière, Cadremploi, Hellowork, Welcome to the Jungle, Meteojob, LinkedIn, Glassdoor, sites d'agrégation, sites qui recopient des offres venues d'ailleurs), les agences d'intérim, France Travail. Ne retiens que des pages qui appartiennent à l'employeur lui-même.

Règle de preuve : n'inscris une ligne QUE si tu as réellement ouvert la page de recrutement et vu des offres actuelles. Donne la date de l'offre la plus récente que tu y as vue et le nombre d'offres visibles. Si tu n'as pas pu ouvrir la page, ne donne pas la ligne. N'invente aucune adresse : une adresse que tu n'as pas ouverte reste vide, et alors la ligne n'est pas donnée.

Zéro bavardage, aucune limite de longueur, aucune ligne résumée. Si c'est trop long, découpe en parties et attends mon « oui ». Classe par secteur, puis par ordre alphabétique.

Une ligne par employeur, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique, terminé par -24 (exemple : centre-hospitalier-perigueux-24).
- famille : toujours « employeur » pour ce prompt.
- nom : nom officiel de l'employeur (jamais le nom d'une personne).
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique.
- territoire : « Dordogne » si l'employeur recrute surtout sur place ; sinon la liste des départements ou « national ».
- page de recrutement : adresse https de la page que tu as réellement ouverte, sur le domaine de l'employeur.
- offres vues : le nombre d'offres visibles sur la page ce jour-là (un nombre, ou « plusieurs » si la page n'affiche pas de total).
- date de la plus récente : AAAA-MM-JJ de l'offre la plus récente vue sur la page ; vide si la page n'affiche pas de date.
- compte demandé : oui ou non (la page demande-t-elle de créer un compte pour VOIR les offres ?).
- source : l'adresse https de la page d'où vient une autre information (par exemple le site de l'employeur) ; sinon vide.
- date : vide.
```

---

### R2 : Portails officiels de recrutement par secteur

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en DORDOGNE (24). Je ne publie AUCUNE offre : je donne seulement l'adresse des portails de recrutement OFFICIELS que la personne consultera elle-même.

Ce que je cherche : les portails officiels de recrutement des grands employeurs publics et parapublics, avec la partie qui concerne la Dordogne quand elle existe : fonction publique territoriale (centre de gestion de la Dordogne et sa bourse de l'emploi territorial, Conseil départemental de la Dordogne, grandes communes et intercommunalités : Périgueux, Bergerac, Sarlat, Boulazac), fonction publique hospitalière (centres hospitaliers de la Dordogne et le portail hospitalier), fonction publique d'État (Éducation nationale et académie de Bordeaux, justice et administration pénitentiaire, police nationale, gendarmerie nationale, ministères), armées (armée de Terre, Marine nationale, armée de l'Air et de l'Espace, centre d'information et de recrutement le plus proche), SNCF, La Poste, et tout autre grand employeur public présent en Dordogne qui a un portail de recrutement officiel.

À EXCLURE : tout site intermédiaire ou d'agrégation d'offres, les agences d'intérim, les sites privés qui recopient des offres publiques. Ne retiens que le site officiel de l'employeur ou de l'institution. Les portails nationaux sont acceptés seulement s'ils couvrent des postes en Dordogne.

Règle de preuve : n'inscris une ligne QUE si tu as réellement ouvert la page et vu que des offres ou des concours y sont publiés. Donne la date de l'offre ou de l'avis le plus récent vu et le nombre visible. Si tu n'as pas pu ouvrir la page, ne donne pas la ligne. N'invente aucune adresse.

Zéro bavardage, aucune limite de longueur, aucune ligne résumée. Si c'est trop long, découpe en parties et attends mon « oui ». Classe par type d'employeur, puis par ordre alphabétique.

Une ligne par portail, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique (exemple : cdg24-emploi-territorial).
- famille : toujours « portail-officiel » pour ce prompt.
- nom : nom officiel du portail ou de l'institution.
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique. (Fonction publique et armées : administration ; hôpitaux : sante ; SNCF : transport-logistique ; sécurité, police, gendarmerie : securite.)
- territoire : « Dordogne » si la page cible la Dordogne ; « Nouvelle-Aquitaine » ou « national » sinon.
- page de recrutement : adresse https de la page que tu as réellement ouverte.
- offres vues : nombre d'offres ou d'avis visibles ce jour-là (un nombre, ou « plusieurs »).
- date de la plus récente : AAAA-MM-JJ ; vide si la page n'affiche pas de date.
- compte demandé : oui ou non (faut-il créer un compte pour VOIR les offres ?).
- source : adresse https d'une autre page consultée ; sinon vide.
- date : vide.
```

---

### R3 : Groupements d'employeurs et fédérations de secteur qui publient des offres

```
Je prépare une page d'information pour des personnes qui cherchent un emploi en DORDOGNE (24). Je ne publie AUCUNE offre : je donne seulement l'adresse de la page d'offres des groupements que la personne consultera elle-même.

Ce que je cherche : les groupements d'employeurs de la Dordogne (groupements d'employeurs agricoles, industriels, du bâtiment, de services), les GEIQ (groupements d'employeurs pour l'insertion et la qualification) de la Dordogne, les fédérations et syndicats professionnels de secteur qui publient eux-mêmes des offres de leurs entreprises adhérentes sur leur propre site (bâtiment, hôtellerie-restauration, métiers de bouche, transport, industrie, aide à domicile, agriculture), et les chambres consulaires de la Dordogne si elles ont une bourse de l'emploi ou une page d'offres.

À EXCLURE : les agences d'intérim, tout site d'agrégation d'offres, tout site qui recopie des offres venues d'ailleurs. Ne retiens que des pages publiées par le groupement ou la fédération elle-même, avec de vraies offres qui se renouvellent.

Règle de preuve : n'inscris une ligne QUE si tu as réellement ouvert la page et vu des offres actuelles. Donne la date de l'offre la plus récente vue et le nombre d'offres visibles. Si tu n'as pas pu ouvrir la page, ne donne pas la ligne. N'invente aucune adresse.

Zéro bavardage, aucune limite de longueur, aucune ligne résumée. Si c'est trop long, découpe en parties et attends mon « oui ». Classe par secteur, puis par ordre alphabétique.

Une ligne par groupement, au format exact :
id | famille | nom | secteur | territoire | page de recrutement | offres vues | date de la plus récente | compte demandé | source | date

- id : minuscules, chiffres et tirets, unique, terminé par -24.
- famille : « groupement » (groupement d'employeurs, GEIQ) ou « federation » (fédération, syndicat professionnel, chambre consulaire).
- nom : nom officiel (jamais le nom d'une personne).
- secteur : UNE clé parmi : btp, industrie, hotellerie-restauration, agriculture-nature, transport-logistique, sante, social-personne, commerce-vente, administration, communication-culture, animalier, proprete, sport-animation, numerique, banque-assurance-immobilier, artisanat, artisanat-bouche, education-formation, automobile, securite, coiffure-esthetique.
- territoire : « Dordogne », « Nouvelle-Aquitaine » ou « national ».
- page de recrutement : adresse https de la page d'offres que tu as réellement ouverte.
- offres vues : nombre d'offres visibles ce jour-là (un nombre, ou « plusieurs »).
- date de la plus récente : AAAA-MM-JJ ; vide si la page n'affiche pas de date.
- compte demandé : oui ou non.
- source : adresse https d'une autre page consultée ; sinon vide.
- date : vide.
```

---

## Ce que Claude fera des réponses

1. Ranger les lignes dans un sas dédié (`outils/sas/`, jamais lu par l'application), avec contrôle du format et détection des doublons avec les 820 pages de recrutement déjà présentes dans le sas des employeurs.
2. Ouvrir chaque page pour vérifier : l'adresse répond, elle appartient bien à l'employeur ou au portail officiel, des offres s'y trouvent, la date de la plus récente est récente.
3. Générer un prompt de vérification pour un autre assistant (comme pour le sas des structures), à lancer avant toute validation.
4. Vous présenter les fiches une à une dans l'outil de veille (« C'est bon », « Modifier », « Écarter »). Aucune fiche n'est publique avant votre « C'est bon ».
