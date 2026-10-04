# Brief à coller chez deux assistants : chantier « Les employeurs de mon territoire » (2026-10-01)

Mode d'emploi pour Denis : **brief 1 dans Perplexity** (volontairement court : un long texte ne passe pas dans la fenêtre sans compte). **Brief 2 dans ChatGPT.** Rapporter les deux réponses telles quelles à Claude, qui vérifie les sources et trie (à garder, à tester, à écarter, à décider par Denis). Rien n'est modifié dans l'application avant ce tri.

---

## BRIEF 1 : Perplexity (les sources de données)

```
Je construis un annuaire gratuit d'employeurs d'un département français (exemple : Haute-Vienne, 87), classés par bassin d'emploi et par secteur, pour que des demandeurs d'emploi puissent déposer des candidatures spontanées. Quelles sources publiques et gratuites permettent de repérer des employeurs installés depuis longtemps et qui recrutent régulièrement (registre Sirene, enquête BMO, La Bonne Boite de France Travail, CCI, autres) ? Pour chaque source : ce qu'elle donne, plus petit niveau géographique, coordonnées réutilisables ou non (licence), adresse vérifiée et date. Dis si La Bonne Boite existe encore sous ce nom, sinon ce qui l'a remplacée. Aucun lien ni chiffre de mémoire : écris « non trouvé ». Termine par 5 lignes de synthèse.
```

---

## BRIEF 2 : ChatGPT (critique de la philosophie et du réalisme)

```
Tu es relecteur critique d'un projet d'application web gratuite pour un public français en insertion professionnelle : personnes peu à l'aise avec l'informatique, à la confiance en soi fragile. Ne me flatte pas : cherche où le projet est bancal, irréaliste ou risqué.

LE PROJET : un module « Les employeurs de mon territoire ».
Philosophie : l'application ne publie AUCUNE offre d'emploi et ne relaie aucune plateforme (beaucoup relaient des offres périmées ou fausses pour faire du trafic). Elle montre des « portes à pousser » : des employeurs installés depuis des années dans le département, classés par bassin d'emploi et par secteur (industrie, commerce, agriculture, associatif, médico-social et administratif), avec leurs coordonnées d'entreprise (nom, adresse, téléphone du standard, site, page de recrutement si elle existe, mode de candidature : spontanée, portail officiel ou concours) et une date de vérification. La personne peut aller s'y présenter ou envoyer une candidature spontanée. Un second outil, séparé, l'aide à rédiger une requête pour chercher elle-même les offres du moment chez un assistant en ligne. L'auteur est un conseiller en insertion, seul, qui a repris le carnet papier d'une collègue (partenaires du département, tenu 15 ans, dernier carnet vieux de 4 à 5 ans). Il veut environ 20 employeurs par secteur, à terme. Aucune équipe de maintenance : une personne et un assistant.

PRINCIPES NON NÉGOCIABLES : jamais de personne nommée (coordonnées d'entreprise seulement), jamais de score ni de classement d'employeurs, aucune offre importée, transparence totale sur les critères, ton simple et rassurant, jamais de diagnostic sur la personne.

Réponds à ces six questions, 14 remarques au maximum, avec ton niveau de certitude (sûr, probable, intuition) pour chacune :
1. Où cette philosophie est-elle fragile ou contradictoire ? Quelles objections sérieuses un spécialiste de l'emploi ferait-il ?
2. Est-ce tenable par une seule personne ? Propose un volume de départ réaliste et un rythme de mise à jour, et dis ce qu'il faut supprimer pour que ça reste stable.
3. Comment choisir les employeurs de façon équitable et défendable (critères écrits, vérifiables avec des données publiques) ? Qu'est-ce qui n'est pas vérifiable (par exemple « recrute régulièrement ») et comment le dire honnêtement ?
4. Risques juridiques et éthiques en France : données personnelles, responsabilité si une coordonnée est périmée, impression de recommander ou de favoriser des entreprises, droit de retrait. Quelles mentions et quels garde-fous sont indispensables ?
5. Comment aider une personne fragile à franchir le pas d'une candidature spontanée (téléphoner, se présenter, écrire) ? Propose des repères très simples qui évitent l'effet « porte fermée », en tenant compte des secteurs qui passent par des concours ou des portails.
6. Qu'est-ce qui ferait échouer ce module dans six mois ? Et quelles idées complémentaires simples (SANS offres importées, SANS score) augmenteraient son utilité, avec bénéfice et risque pour chacune ?

Va directement aux risques et aux propositions, sans reformuler mon texte.
```

---

## Ce que Claude fera des réponses
1. Vérifier chaque source citée par Perplexity (adresse ouverte, date, licence de réutilisation).
2. Trier chaque remarque de ChatGPT et signaler toute idée qui contredit un principe.
3. Reporter le résultat dans `docs/CHANTIER_REPERTOIRE_EMPLOYEURS_TERRITOIRE_2026-10-01.md`, section 8.
