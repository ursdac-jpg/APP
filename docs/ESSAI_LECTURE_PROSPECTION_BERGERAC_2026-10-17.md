# Essai de lecture pour l'outil de prospection : Bergerac (2026-10-17)

> Écrit le 2026-10-17. Source : API publique « Recherche d'entreprises » (recherche-entreprises.api.gouv.fr, gratuite, sans clé, données mises à jour le jour même). Script : `scripts/essaiLectureProspection.js <sortie.json> [code commune]` (2 minutes pour Bergerac). **Ce document ne contient aucun nom de personne** ; le fichier de sortie contient des noms de dirigeants et reste HORS du dépôt.

## Ce qu'on obtient pour Bergerac (code commune 24037, entreprises actives)

| Mesure | Résultat |
|---|---|
| Entreprises actives avec un établissement à Bergerac | **7 726** |
| dont siège à Bergerac / siège ailleurs mais établissement à Bergerac | 5 610 / 2 116 |
| Avec au moins un dirigeant renseigné | 6 271 (6 031 personnes physiques, 760 sociétés) |
| Téléphone, mail, site internet | **aucun** (jamais dans cette source) |

**Par section d'activité (lettre NAF, nombre d'entreprises)** : G commerce 1 167 ; L immobilier 1 502 (surtout des sociétés civiles immobilières) ; M activités spécialisées 559 ; Q santé et action sociale 563 ; S autres services 601 ; F construction 513 ; I hébergement et restauration 464 ; R arts et loisirs 388 ; N services administratifs 381 ; H transports 316 ; C industrie 282 ; K finance et assurance 281 ; A agriculture 224 ; P enseignement 185 ; J information et communication 150 ; D énergie 98 ; O administration publique 31 ; E eau et déchets 19 ; B mines 2.

## Ancienneté (date de création légale), toutes entreprises

| Ancienneté | Entreprises |
|---|---|
| moins de 1 an | 239 |
| moins de 2 ans | 505 |
| 2 à 3 ans | 285 |
| 3 à 5 ans | 606 |
| 5 ans et plus | 6 330 |

Le filtre d'ancienneté par clic (plus de 5 ans, 5, 3, 2, 1 an) est donc **réalisable tel quel**, calculé par l'outil à partir de la date de création.

## Pièges à connaître (ce que l'essai a montré)

1. **L'effectif est presque toujours vide pour les entreprises récentes.** Seules 1 538 entreprises sur 7 726 ont une tranche d'effectif (les autres sont « non employeuses » ou non renseignées), et parmi elles **3 seulement ont moins de 2 ans** : l'effectif est déclaré avec un an ou deux de retard. Pour repérer les entreprises récentes il faut donc filtrer sur la **date de création**, pas sur le nombre de salariés.
2. **L'effectif est celui de l'ENTREPRISE entière** (tous ses sites), pas celui de l'établissement de Bergerac : 351 entreprises « 50 salariés et plus » comprennent des groupes nationaux qui n'ont qu'une agence sur place. Un filtre « nombre de salariés » doit le dire clairement.
3. **Beaucoup de « bruit »** : 2 939 entrepreneurs individuels (dont des micro-entrepreneurs), plus de 1 000 sociétés civiles (immobilier). Un filtre « forme juridique » (exclure les sociétés civiles et les auto-entrepreneurs, ou les garder) sera utile.
4. **Le lieu ne filtre que combiné à un secteur** (ou un mot) : la lecture se fait secteur par secteur, 25 résultats par page, 10 000 au plus par requête (largement suffisant pour une commune).
5. **Bassin d'emploi** : l'API renvoie la commune et l'intercommunalité de chaque établissement ; la zone d'emploi se déduit de la commune avec la table qui existe déjà dans l'application (module « Comprendre les chiffres »).
6. **Le secteur de l'API est un code d'activité (NAF)** : il faudra une table de correspondance vers les 21 secteurs de l'application (`data/secteurs.js`).

## Ce qu'il faut ajouter à la main ou par recherche (absent de la source)

Téléphone, mail, site internet, page de recrutement, adresse postale vérifiée du lieu d'accueil, **favorable aux immersions et aux stages**, notes de prospection. Demande de Denis (2026-10-17) : un prompt par entreprise, ou un prompt groupé pour toutes les entreprises repérées, pour que les assistants retrouvent ces informations (y compris l'adresse postale, pour se rendre sur place quand il n'y a ni téléphone, ni mail, ni site) ; et, à étudier, une API payante la moins chère possible pour l'usage personnel de Denis, avec les prompts conservés pour l'usage externe. Pistes à chiffrer au moment de la conception (rien n'est vérifié) : prompts groupés par lot de 10 à 20 entreprises, avec la liste des entreprises et leur adresse, réponse collée dans l'outil et contrôlée (comme `scripts/verifierRecruteursSas.js`) ; ou une API de lieux locaux qui renvoie téléphone et site (à comparer sur le coût réel et sur la qualité) ; ou une API d'assistant avec recherche web. **Les prix sont à vérifier avant tout engagement.**
