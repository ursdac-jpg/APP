# Prompt de vérification pour un autre assistant (Qui fait quoi, le sas)

> **Fichier généré le 2026-10-13 par `node scripts/genererPromptVerificationSas.js`. Ne pas le modifier à la main : il est entièrement régénéré à partir du sas.**
> Le sas contient **473 fiches** ; **402** ont un manque ou un doute et figurent ci-dessous, en **40 lots** (un lot = un message à envoyer).
> Après chaque nouvel import de rayon dans le sas, demander à Claude de régénérer ce fichier.

## Comment s'en servir

1. Ouvrir une conversation neuve chez l'autre assistant (avec recherche web, par exemple Perplexity) et lui envoyer d'abord **le bloc « Consigne de départ »** ci-dessous, une seule fois.
2. Envoyer ensuite les lots **un par un**, dans l'ordre, en attendant la réponse avant le suivant.
3. Coller chaque réponse à Claude, qui la range dans le sas (rien ne devient public : tu vérifies ensuite chaque fiche avec « C'est bon »).
4. Si l'assistant n'a pas trouvé, c'est normal : il écrit « introuvable », ce qui vaut mieux qu'une invention.

## Consigne de départ (à envoyer une seule fois)

```
Tu vas m'aider à VÉRIFIER des coordonnées de structures de Dordogne (24) et de Haute-Vienne (87), pour un annuaire destiné à des personnes en difficulté. L'exactitude compte plus que la quantité.

RÈGLES STRICTES
1. N'invente RIEN. Si tu ne trouves pas une information sur une page officielle ou sur le site de la structure elle-même, écris « introuvable ». Une case « introuvable » est une bonne réponse.
2. Sources acceptées : site de la structure, sites officiels de l'État et des collectivités (gouv.fr, service-public.fr et son annuaire, sites des départements, de la région, de l'Éducation nationale, de France Travail, de la CAF, de l'Assurance maladie, etc.). Pas de forums, pas d'annuaires commerciaux, pas de réseaux sociaux.
3. Pour chaque fiche, donne l'adresse EXACTE de la page où tu as lu le téléphone et le site (colonne « page »). Sans page, pas de réponse.
4. Un téléphone doit être au format « 05 53 00 00 00 » (dix chiffres, par groupes de deux). Les numéros courts (3949...) restent tels quels.
5. Quand plusieurs structures partagent un même numéro ou une même adresse de site dans ma liste, vérifie si chacune a bien SON PROPRE numéro ou SA PROPRE page. Si le numéro est réellement commun (standard unique), réponds « commun » et la page qui le prouve.
6. Si la structure n'existe plus, a fermé, a changé de nom ou de commune, dis-le dans la colonne « remarque ».
7. Écris en français correct, avec les accents. Pas de tiret long ni demi-cadratin (utilise un tiret simple), pas de mise en forme décorative, pas de lien en format Markdown, pas de balises de type « entity[...] » ni « utm_source ».
8. Ne reformule pas les noms, ne change pas les identifiants.

FORMAT DE RÉPONSE (obligatoire, un seul bloc de code, une ligne par fiche, colonnes séparées par « | », aucune autre ligne dans le bloc) :
id | téléphone | site | page | état | remarque

Pour chaque fiche :
- « téléphone » : le numéro vérifié, ou « introuvable », ou « commun » ;
- « site » : l'adresse de la page la plus précise de la structure (pas la page d'accueil d'un réseau national quand une page locale existe), ou « introuvable » ;
- « page » : l'adresse où tu as lu l'information ;
- « état » : « confirmé » (ce que j'ai donné est juste), « corrigé » (j'avais faux ou incomplet), « ajouté » (la case était vide et tu l'as trouvée), « introuvable » ou « fermé » ;
- « remarque » : une phrase courte, ou vide.

Après le bloc de code, ajoute une courte liste « Ce que je n'ai pas pu vérifier » si besoin. Réponds seulement « Prêt » à ce message : je t'enverrai ensuite les lots un par un.
```

## Lot 1 : Accès au droit (1 sur 3), 15 fiches

```
Lot 1. Vérifie ces 15 fiches (rayon : Accès au droit). Réponds au format demandé, dans un seul bloc de code.

point-justice-perigueux-24 | Point-Justice de Périgueux (CDAD de la Dordogne) | Périgueux (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 4 autre(s) fiche(s)
point-justice-bergerac-24 | Point-Justice de Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 74 40 00 | site donné : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | à vérifier : même adresse de site que 4 autre(s) fiche(s)
point-justice-sarlat-la-caneda-24 | Point-Justice de Sarlat-la-Canéda | Sarlat-la-Canéda (Dordogne) | téléphone donné : aucun | site donné : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
point-justice-vergt-24 | Point-Justice de Vergt | Vergt (Dordogne) | téléphone donné : 05 33 09 58 98 | site donné : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | à vérifier : même adresse de site que 4 autre(s) fiche(s)
point-justice-saint-medard-dexcideuil-24 | Point-Justice de Saint-Médard-d'Excideuil | Saint-Médard-d'Excideuil (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 4 autre(s) fiche(s)
point-justice-nontron-24 | Point-Justice de Nontron | Nontron (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-terrasson-lavilledieu-24 | Point-Justice de Terrasson-Lavilledieu | Terrasson-Lavilledieu (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-riberac-24 | Point-Justice de Ribérac | Ribérac (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-mussidan-24 | Point-Justice de Mussidan | Mussidan (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-thenon-24 | Point-Justice de Thenon | Thenon (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-hautefort-24 | Point-Justice de Hautefort | Hautefort (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-villefranche-du-perigord-24 | Point-Justice de Villefranche-du-Périgord | Villefranche-du-Périgord (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-monpazier-24 | Point-Justice de Monpazier | Monpazier (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-thiviers-24 | Point-Justice de Thiviers | Thiviers (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-brantome-en-perigord-24 | Point-Justice de Brantôme en Périgord | Brantôme en Périgord (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
```

## Lot 2 : Accès au droit (2 sur 3), 15 fiches

```
Lot 2. Vérifie ces 15 fiches (rayon : Accès au droit). Réponds au format demandé, dans un seul bloc de code.

point-justice-saint-astier-24 | Point-Justice de Saint-Astier | Saint-Astier (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-belves-24 | Point-Justice de Belvès | Pays de Belvès (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-saint-aulaye-24 | Point-Justice de Saint-Aulaye | Saint-Aulaye-Puymangou (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://cdad-dordogne.fr/nouvelles-permanences.html | à vérifier : même téléphone que 15 autre(s) fiche(s), même adresse de site que 12 autre(s) fiche(s)
point-justice-cite-judiciaire-limoges-87 | Point-Justice de la Cité judiciaire de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/lespermanences/permanence-daccueil-et-decoute/ | à vérifier : téléphone absent
point-justice-chambres-consulaires-limoges-87 | Point-Justice des Chambres consulaires de Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 87 19 34 00 | site donné : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/f610dd40-9745-43d7-aee9-5ce1ae9b93ca | à vérifier : même téléphone que 2 autre(s) fiche(s)
point-justice-france-services-haute-vienne-87 | Point-Justice itinérant en France Services de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/lespermanences/point-justice-itinerant/ | à vérifier : téléphone absent
conseil-departemental-acces-droit-haute-vienne-87 | Conseil départemental de l'accès au droit de la Haute-Vienne (CDAD 87) | Limoges (Haute-Vienne) | téléphone donné : 05 87 19 34 00 | site donné : https://cdad-hautevienne.justice.fr | à vérifier : même téléphone que 2 autre(s) fiche(s), même adresse de site que 2 autre(s) fiche(s)
point-justice-le-dorat-87 | Point-Justice du Dorat | Le Dorat (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/permanences/ | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
point-justice-bessines-sur-gartempe-87 | Point-Justice de Bessines-sur-Gartempe | Bessines-sur-Gartempe (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/permanences/ | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
point-justice-saint-junien-87 | Point-Justice de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/permanences/ | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
point-justice-saint-yrieix-la-perche-87 | Point-Justice de Saint-Yrieix-la-Perche | Saint-Yrieix-la-Perche (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/permanences/ | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
point-justice-panazol-87 | Point-Justice de Panazol | Panazol (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr/permanences/ | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
defenseur-des-droits-delegues-national | Réseau des délégués du Défenseur des droits |  (national) | téléphone donné : aucun | site donné : https://www.defenseurdesdroits.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
casier-judiciaire-national-service-public-national | Casier judiciaire national |  (national) | téléphone donné : aucun | site donné : https://www.service-public.fr/particuliers/vosdroits/N517 | à vérifier : téléphone absent
cdad-dordogne-24 | Conseil départemental de l'accès au droit de la Dordogne | Périgueux (Dordogne) | téléphone donné : 05 53 06 39 33 | site donné : https://www.cdad24.fr | à vérifier : même téléphone que 15 autre(s) fiche(s)
```

## Lot 3 : Accès au droit (3 sur 3), 4 fiches

```
Lot 3. Vérifie ces 4 fiches (rayon : Accès au droit). Réponds au format demandé, dans un seul bloc de code.

cdad-haute-vienne-87 | Conseil départemental de l'accès au droit de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cdad-hautevienne.fr | à vérifier : téléphone absent
conseil-prudhommes-limoges-87 | Conseil de prud'hommes de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
defenseur-droits-haute-vienne-87 | Délégués du Défenseur des droits en Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.defenseurdesdroits.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
points-justice-haute-vienne-87 | Points-justice de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
```

## Lot 4 : Accueil des personnes étrangères, 7 fiches

```
Lot 4. Vérifie ces 7 fiches (rayon : Accueil des personnes étrangères). Réponds au format demandé, dans un seul bloc de code.

association-soutien-dordogne-asile-24 | Association de Soutien de la Dordogne (ASD) | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.asd24.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
cada-association-soutien-dordogne-24 | Centre d'accueil pour demandeurs d'asile de l'Association de Soutien de la Dordogne | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.asd24.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
apare-cada-perigueux-24 | Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) - Centre d'accueil pour demandeurs d'asile | Périgueux (Dordogne) | téléphone donné : 05 53 02 65 00 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent, aucune source donnée
arsl-cada-limoges-87 | ARSL - Centre d'accueil pour demandeurs d'asile | Limoges (Haute-Vienne) | téléphone donné : 05 55 34 70 44 | site donné : aucun | à vérifier : site absent, aucune source donnée
hestia-cada-limoges-87 | Association HESTIA - Centre d'accueil pour demandeurs d'asile | Limoges (Haute-Vienne) | téléphone donné : 05 55 38 98 00 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent, aucune source donnée
adoma-cada-eymoutiers-87 | Adoma - Centre d'accueil pour demandeurs d'asile d'Eymoutiers | Eymoutiers (Haute-Vienne) | téléphone donné : 05 19 76 11 01 | site donné : aucun | à vérifier : site absent, aucune source donnée
asti-perigueux-24 | ASTI de Périgueux | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://asti24.fr | à vérifier : téléphone absent
```

## Lot 5 : Appui aux employeurs (1 sur 2), 15 fiches

```
Lot 5. Vérifie ces 15 fiches (rayon : Appui aux employeurs). Réponds au format demandé, dans un seul bloc de code.

cci-france-national | CCI France |  (national) | téléphone donné : aucun | site donné : https://www.cci.fr | à vérifier : téléphone absent
chambres-agriculture-france-national | Chambres d'agriculture France |  (national) | téléphone donné : aucun | site donné : https://chambres-agriculture.fr | à vérifier : téléphone absent
cma-france-national | CMA France |  (national) | téléphone donné : aucun | site donné : https://www.artisanat.fr | à vérifier : téléphone absent
maison-emploi-grand-perigueux-24 | Maison de l'Emploi du Grand Périgueux | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.mde-grandperigueux.fr | à vérifier : téléphone absent
association-interconsulaire-haute-vienne-87 | Association Interconsulaire de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Entreprises-economie-emploi-et-finances-publiques/Appui-au-developpement-de-l-emploi-et-des-entreprises-en-Haute-Vienne | à vérifier : téléphone absent
anact-aract-nouvelle-aquitaine-region | ARACT Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://nouvelle-aquitaine.aract.fr | à vérifier : téléphone absent
les-entreprises-sengagent-national | Les Entreprises s'engagent |  (national) | téléphone donné : aucun | site donné : https://www.lesentreprises-sengagent.gouv.fr | à vérifier : téléphone absent
anefa-dordogne-24 | ANEFA Dordogne | Coulounieix-Chamiers (Dordogne) | téléphone donné : aucun | site donné : https://www.anefa.org/dordogne/page-daccueil/nos-missions/ | à vérifier : téléphone absent
geiq-haute-vienne-87 | GEIQ Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.lesgeiq.fr | à vérifier : téléphone absent
adefa-dordogne-24 | ADEFA Dordogne | Coulounieix-Chamiers (Dordogne) | téléphone donné : aucun | site donné : https://www.anefa.org | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
anefa-limousin-87 | ANEFA du Limousin | Limoges (Haute-Vienne) | téléphone donné : 07 88 44 22 75 | site donné : https://www.anefa.org | à vérifier : même adresse de site que 2 autre(s) fiche(s)
anefa-national | ANEFA |  (national) | téléphone donné : aucun | site donné : https://www.anefa.org | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
groupement-employeurs-metiers-24-24 | Groupement Employeurs Métiers 24 | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
groupement-employeurs-rural-sarladais-24 | Groupement d'Employeurs Rural Sarladais | Montignac-Lascaux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
geiq-87-construction-87 | GEIQ 87 Construction | Limoges (Haute-Vienne) | téléphone donné : 05 55 35 10 42 | site donné : aucun | à vérifier : site absent, aucune source donnée
```

## Lot 6 : Appui aux employeurs (2 sur 2), 11 fiches

```
Lot 6. Vérifie ces 11 fiches (rayon : Appui aux employeurs). Réponds au format demandé, dans un seul bloc de code.

ge-alise-haute-vienne-87 | GE Alisé Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 01 18 73 | site donné : aucun | à vérifier : site absent, aucune source donnée
geiq-sage-haute-vienne-87 | GEIQ SAGE | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
geiq-sante-social-medico-social-nouvelle-aquitaine-region | GEIQ Santé Social Médico-Social Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://plateforme.inclusion.gouv.fr/company/7379/card | à vérifier : téléphone absent
geiq-sport-animation-nouvelle-aquitaine-region | GEIQ Sport et Animation Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.lesgeiq-nouvelleaquitaine.fr/trouver-un-geiq-en-nouvelle-aquitaine/geiq-sport-et-animation-nouvelle-aquitaine/ | à vérifier : téléphone absent
federation-francaise-des-geiq-national | Fédération Française des GEIQ |  (national) | téléphone donné : aucun | site donné : https://www.lesgeiq.fr/ | à vérifier : téléphone absent
service-remplacement-dordogne-24 | Service de Remplacement Dordogne | Coulounieix-Chamiers (Dordogne) | téléphone donné : 05 53 35 88 48 | site donné : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | à vérifier : même adresse de site que 2 autre(s) fiche(s)
service-remplacement-haute-vienne-87 | Service de Remplacement Haute-Vienne | Panazol (Haute-Vienne) | téléphone donné : 05 87 50 41 10 | site donné : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | à vérifier : même adresse de site que 2 autre(s) fiche(s)
msa-limousin-sante-travail-87 | MSA du Limousin - Santé Sécurité au Travail | Limoges (Haute-Vienne) | téléphone donné : 05 55 49 85 00 | site donné : https://limousin.msa.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
service-remplacement-nouvelle-aquitaine-region | Fédération Service de Remplacement Nouvelle-Aquitaine |  (régional) | téléphone donné : 05 56 01 33 60 | site donné : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 | à vérifier : même téléphone que 1 autre(s) fiche(s), même adresse de site que 2 autre(s) fiche(s)
farago-nouvelle-aquitaine-region | FARAGO Nouvelle-Aquitaine |  (régional) | téléphone donné : 05 56 01 33 60 | site donné : https://www.farago.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
medecine-travail-agricole-msa-national | MSA - Santé Sécurité au Travail |  (national) | téléphone donné : aucun | site donné : https://ssa.msa.fr | à vérifier : téléphone absent
```

## Lot 7 : Budget et endettement, 6 fiches

```
Lot 7. Vérifie ces 6 fiches (rayon : Budget et endettement). Réponds au format demandé, dans un seul bloc de code.

atelier-budgetaire-perigueux-24 | L'Atelier budgétaire | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/pcb | à vérifier : téléphone absent
udaf-connect-ebus-perigueux-24 | Connect' e-bus UDAF Dordogne | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://dora.inclusion.gouv.fr/services/un-dep-ass-familial--mediation-numerique-qfec | à vérifier : téléphone absent
point-conseil-budget-ccas-limoges-87 | Point Conseil Budget du CCAS de Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 55 45 97 50 | site donné : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget | à vérifier : même adresse de site que 1 autre(s) fiche(s)
confederation-syndicale-des-familles-limoges-87 | Confédération Syndicale des Familles | Limoges (Haute-Vienne) | téléphone donné : 05 55 37 52 26 | site donné : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget | à vérifier : même adresse de site que 1 autre(s) fiche(s)
uraf-nouvelle-aquitaine-microcredit-region | URAF Nouvelle-Aquitaine - Microcrédit personnel |  (régional) | téléphone donné : aucun | site donné : https://www.uraf-nouvelleaquitaine.fr/les-services-aux-familles/microcredit/ | à vérifier : téléphone absent
adie-saint-astier-24 | Adie Dordogne | Saint-Astier (Dordogne) | téléphone donné : 09 69 32 81 10 | site donné : https://www.adie.org | à vérifier : même adresse de site que 1 autre(s) fiche(s)
```

## Lot 8 : CAF, 3 fiches

```
Lot 8. Vérifie ces 3 fiches (rayon : CAF). Réponds au format demandé, dans un seul bloc de code.

caf-dordogne-24 | Caisse d'Allocations Familiales de la Dordogne | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.caf.fr/allocataires/caf-de-la-dordogne/offre-de-service/vie-personnelle/je-cherche-un-mode-de-garde-pour-mon-enfant | à vérifier : téléphone absent
caf-haute-vienne-87 | Caisse d'Allocations Familiales de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 43 40 50 | site donné : https://www.caf.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
caf-france-national | Caisse d'Allocations Familiales |  (national) | téléphone donné : aucun | site donné : https://www.caf.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
```

## Lot 9 : Retraite et assurance maladie, 7 fiches

```
Lot 9. Vérifie ces 7 fiches (rayon : Retraite et assurance maladie). Réponds au format demandé, dans un seul bloc de code.

cicas-perigueux-24 | Centre d'information de conseil et d'accueil des salariés (Cicas) - Dordogne | Périgueux (Dordogne) | téléphone donné : 09 70 66 06 60 | site donné : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/d0c52cfb-701f-40e9-a9ca-0d1b82fb467a | à vérifier : même téléphone que 4 autre(s) fiche(s)
agence-conseil-retraite-agirc-arrco-perigueux-24 | Agence conseil retraite Agirc-Arrco de Périgueux | Périgueux (Dordogne) | téléphone donné : 09 70 66 06 60 | site donné : https://www.agirc-arrco.fr/departement/24/ | à vérifier : même téléphone que 4 autre(s) fiche(s)
cicas-limoges-87 | Centre d'information de conseil et d'accueil des salariés (Cicas) - Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 09 70 66 06 60 | site donné : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/1f442393-418a-43cc-a8dd-dd709fc06f92 | à vérifier : même téléphone que 4 autre(s) fiche(s)
agence-conseil-retraite-agirc-arrco-limoges-87 | Agence conseil retraite Agirc-Arrco de Limoges | Limoges (Haute-Vienne) | téléphone donné : 09 70 66 06 60 | site donné : https://www.agirc-arrco.fr/agences-retraite/agence-de-la-haute-vienne/ | à vérifier : même téléphone que 4 autre(s) fiche(s)
agirc-arrco-national | Agirc-Arrco |  (national) | téléphone donné : aucun | site donné : https://www.agirc-arrco.fr | à vérifier : téléphone absent
cicas-national | Centres d'information de conseil et d'accueil des salariés (Cicas) |  (national) | téléphone donné : 09 70 66 06 60 | site donné : https://www.cicas.agirc-arrco.fr | à vérifier : même téléphone que 4 autre(s) fiche(s)
msa-limousin-haute-vienne-87 | MSA du Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://limousin.msa.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
```

## Lot 10 : Cap emploi, 1 fiche

```
Lot 10. Vérifie ces 1 fiches (rayon : Cap emploi). Réponds au format demandé, dans un seul bloc de code.

cap-emploi-france-national | Cheops - Réseau Cap emploi |  (national) | téléphone donné : aucun | site donné : https://www.cheops-ops.org | à vérifier : téléphone absent
```

## Lot 11 : ccas, 7 fiches

```
Lot 11. Vérifie ces 7 fiches (rayon : ccas). Réponds au format demandé, dans un seul bloc de code.

ccas-saint-junien-87 | Centre communal d'action sociale de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.saint-junien.fr | à vérifier : téléphone absent
ccas-panazol-87 | Centre communal d'action sociale de Panazol | Panazol (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.panazol.fr | à vérifier : téléphone absent
ccas-isle-87 | Centre communal d'action sociale d'Isle | Isle (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.isle.fr | à vérifier : téléphone absent
ccas-couzeix-87 | Centre communal d'action sociale de Couzeix | Couzeix (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.ville-couzeix.fr | à vérifier : téléphone absent
ccas-aixe-sur-vienne-87 | Centre communal d'action sociale d'Aixe-sur-Vienne | Aixe-sur-Vienne (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.aixesurvienne.fr | à vérifier : téléphone absent
ccas-saint-yrieix-la-perche-87 | Centre communal d'action sociale de Saint-Yrieix-la-Perche | Saint-Yrieix-la-Perche (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.saint-yrieix.fr | à vérifier : téléphone absent
ccas-bellac-87 | Centre communal d'action sociale de Bellac | Bellac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.bellac.fr | à vérifier : téléphone absent
```

## Lot 12 : Collectivités et État (1 sur 2), 15 fiches

```
Lot 12. Vérifie ces 15 fiches (rayon : Collectivités et État). Réponds au format demandé, dans un seul bloc de code.

cite-emploi-limoges-87 | Cité de l'Emploi Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 87 14 10 10 | site donné : https://www.limoges-metropole.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
ministere-education-vae-national | Validation des acquis de l'expérience de l'Éducation nationale |  (national) | téléphone donné : aucun | site donné : https://vae.education.gouv.fr/ | à vérifier : téléphone absent
demission-reconversion-projet-professionnel-national | Démission-Reconversion |  (national) | téléphone donné : aucun | site donné : https://www.demission-reconversion.gouv.fr/etape3_valider_son_projet | à vérifier : téléphone absent
france-vae-national | France VAE |  (national) | téléphone donné : aucun | site donné : https://vae.gouv.fr/ | à vérifier : téléphone absent
cnfpt-conseil-evolution-professionnelle-national | Centre national de la fonction publique territoriale (CNFPT) |  (national) | téléphone donné : aucun | site donné : https://www.cnfpt.fr | à vérifier : téléphone absent
conseillers-mobilite-carriere-etat-national | Conseillers mobilité-carrière de la fonction publique de l'État |  (national) | téléphone donné : aucun | site donné : https://www.fonction-publique.gouv.fr | à vérifier : téléphone absent
asp-plateforme-vae-hopital-national | Agence de services et de paiement - Plateforme VAE des agents hospitaliers | Limoges (national) | téléphone donné : aucun | site donné : https://vaedem.asp-public.fr | à vérifier : téléphone absent
defenseur-des-droits-nouvelle-aquitaine-region | Défenseur des droits |  (régional) | téléphone donné : aucun | site donné : https://www.defenseurdesdroits.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
service-public-france-national | Service Public |  (national) | téléphone donné : aucun | site donné : https://www.service-public.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
ministre-travail-national | Ministère du Travail |  (national) | téléphone donné : aucun | site donné : https://travail-emploi.gouv.fr | à vérifier : téléphone absent
justice-fr-national | Ministère de la Justice |  (national) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
agefiph-region-nouvelle-aquitaine-region | AGEFIPH Nouvelle-Aquitaine |  (national) | téléphone donné : aucun | site donné : https://www.agefiph.fr | à vérifier : téléphone absent
ddetspp-dordogne-24 | Direction départementale de l'emploi, du travail, des solidarités et de la protection des populations de la Dordogne (DDETSPP) | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.dordogne.gouv.fr/Services-de-l-Etat/Les-directions-interministerielles/Direction-de-l-Emploi-du-Travail-des-Solidarites-et-de-la-Protection-des-Populations-DDETSPP | à vérifier : téléphone absent
service-public-aides-embauche-national | Service Public - Aides à l'embauche |  (national) | téléphone donné : aucun | site donné : https://entreprendre.service-public.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
conseil-departemental-haute-vienne-employeurs-87 | Conseil départemental de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr/nos-actions/insertion/vous-etes-un-employeur-du-public-ou-du-prive | à vérifier : téléphone absent
```

## Lot 13 : Collectivités et État (2 sur 2), 12 fiches

```
Lot 13. Vérifie ces 12 fiches (rayon : Collectivités et État). Réponds au format demandé, dans un seul bloc de code.

dreets-nouvelle-aquitaine-economie-region | DREETS Nouvelle-Aquitaine - Pôle entreprises, emploi et économie |  (régional) | téléphone donné : aucun | site donné : https://dreets.gouv.fr/nouvelle-aquitaine | à vérifier : téléphone absent
entreprendre-service-public-national | Entreprendre.Service-Public.fr |  (national) | téléphone donné : aucun | site donné : https://entreprendre.service-public.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
prefecture-haute-vienne-etrangers-87 | Préfecture de la Haute-Vienne - Bureau de l'immigration et de l'intégration | Limoges (Haute-Vienne) | téléphone donné : 05 55 44 18 00 | site donné : https://www.haute-vienne.gouv.fr/Demarches/Accueil-des-etrangers-vos-demarches-en-Haute-Vienne | à vérifier : même téléphone que 1 autre(s) fiche(s)
ofpra-national | Office français de protection des réfugiés et apatrides (OFPRA) |  (national) | téléphone donné : aucun | site donné : https://www.ofpra.gouv.fr | à vérifier : téléphone absent
administration-numerique-etrangers-france-national | Administration numérique pour les étrangers en France (ANEF) |  (national) | téléphone donné : aucun | site donné : https://administration-etrangers-en-france.interieur.gouv.fr | à vérifier : téléphone absent
inspection-travail-haute-vienne-87 | DDETSPP de la Haute-Vienne - Inspection du travail | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://haute-vienne.gouv.fr | à vérifier : téléphone absent
prefecture-haute-vienne-87 | Préfecture de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 44 18 00 | site donné : https://www.haute-vienne.gouv.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
dsden-haute-vienne-87 | Direction des services départementaux de l'Éducation nationale de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 11 40 40 | site donné : https://www.ac-limoges.fr/dsden-de-la-haute-vienne-121530 | à vérifier : même téléphone que 1 autre(s) fiche(s)
rectorat-academie-limoges-87 | Rectorat de l'académie de Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 55 11 40 40 | site donné : https://www.ac-limoges.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
choisir-le-service-public-national | Choisir le service public |  (national) | téléphone donné : aucun | site donné : https://choisirleservicepublic.gouv.fr | à vérifier : téléphone absent
score-concours-national | SCORE - Concours et recrutements de l'État |  (national) | téléphone donné : aucun | site donné : https://www.fonction-publique.gouv.fr/score | à vérifier : téléphone absent
place-emploi-public-national | Place de l'emploi public |  (national) | téléphone donné : aucun | site donné : https://www.place-emploi-public.gouv.fr | à vérifier : téléphone absent
```

## Lot 14 : Création d'activité (1 sur 3), 15 fiches

```
Lot 14. Vérifie ces 15 fiches (rayon : Création d'activité). Réponds au format demandé, dans un seul bloc de code.

chambre-agriculture-dordogne-24 | Chambre d'agriculture de la Dordogne | Périgueux (Dordogne) | téléphone donné : 05 53 35 88 88 | site donné : https://dordogne.chambre-agriculture.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
initiative-sarlat-24 | Initiative Sarlat | Sarlat-la-Canéda (Dordogne) | téléphone donné : aucun | site donné : https://initiative-perigord.fr | à vérifier : téléphone absent
perigord-developpement-24 | Périgord Développement | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://perigord-developpement.fr | à vérifier : téléphone absent
cci-haute-vienne-87 | Chambre de commerce et d'industrie Limoges et Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 45 15 15 | site donné : https://www.limoges.cci.fr | à vérifier : même téléphone que 2 autre(s) fiche(s)
initiative-haute-vienne-87 | Initiative Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.initiative-hautevienne.fr | à vérifier : téléphone absent
altipole-87 | ALTIPÔLE | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.altipole.coop | à vérifier : téléphone absent
beaubfm-tiers-lieu-limoges-87 | Bfm Centre - Tiers-lieu numérique | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://bfm.limoges.fr | à vérifier : téléphone absent
reseau-entreprendre-nouvelle-aquitaine-region | Réseau Entreprendre Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.reseau-entreprendre.org/nouvelle-aquitaine | à vérifier : téléphone absent
les-premieres-nouvelle-aquitaine-region | Les Premières Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://lespremieres.fr | à vérifier : téléphone absent
bpifrance-creation-national | Bpifrance Création |  (national) | téléphone donné : aucun | site donné : https://bpifrance-creation.fr | à vérifier : téléphone absent
chambre-agriculture-perigord-noir-24 | Chambre d'agriculture de la Dordogne - Antenne du Périgord Noir | Sarlat-la-Canéda (Dordogne) | téléphone donné : aucun | site donné : https://dordogne.chambre-agriculture.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
france-services-belves-creation-24 | France Services Vallée Dordogne Forêt Bessède - Belvès | Pays-de-Belvès (Dordogne) | téléphone donné : 05 53 31 44 81 | site donné : https://ccdordogne-bessede.fr/aides-creation-entreprise/ | à vérifier : même adresse de site que 1 autre(s) fiche(s)
france-services-saint-cyprien-creation-24 | France Services Vallée Dordogne Forêt Bessède - Saint-Cyprien | Saint-Cyprien (Dordogne) | téléphone donné : 05 53 28 63 90 | site donné : https://ccdordogne-bessede.fr/aides-creation-entreprise/ | à vérifier : même adresse de site que 1 autre(s) fiche(s)
reseau-entreprendre-limousin-87 | Réseau Entreprendre Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.limoges.fr/ville-creative/accompagnement-la-creation | à vérifier : téléphone absent
incubatest-bge-limousin-87 | Incubatest BGE Limousin | Limoges (Haute-Vienne) | téléphone donné : 05 55 33 14 79 | site donné : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne | à vérifier : même téléphone que 1 autre(s) fiche(s), même adresse de site que 1 autre(s) fiche(s)
```

## Lot 15 : Création d'activité (2 sur 3), 15 fiches

```
Lot 15. Vérifie ces 15 fiches (rayon : Création d'activité). Réponds au format demandé, dans un seul bloc de code.

fabrique-a-initiatives-limousin-region | La Fabrique à Initiatives Limousin | Limoges (régional) | téléphone donné : aucun | site donné : https://www.franceactive.org/solutions/la-fabrique-a-initiatives/ | à vérifier : téléphone absent
cooperative-tiers-lieux-region | Coopérative Tiers-Lieux Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://coop.tierslieux.net/tiers-lieux/creer-un-tiers-lieu/etre-accompagne/ | à vérifier : téléphone absent
bge-nouvelle-aquitaine-region | BGE Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.bge-nouvelle-aquitaine.fr | à vérifier : téléphone absent
initiative-france-national | Initiative France |  (national) | téléphone donné : aucun | site donné : https://www.initiative-france.fr | à vérifier : téléphone absent
reseau-entreprendre-national | Réseau Entreprendre |  (national) | téléphone donné : aucun | site donné : https://www.reseau-entreprendre.org | à vérifier : téléphone absent
adie-national | Adie |  (national) | téléphone donné : aucun | site donné : https://www.adie.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
cooperation-activite-emploi-national | Coopérer pour Entreprendre |  (national) | téléphone donné : aucun | site donné : https://www.cooperer.coop | à vérifier : téléphone absent
tiers-lieux-nouvelle-aquitaine-annuaire-region | Coopérative Tiers-Lieux - Annuaire régional |  (régional) | téléphone donné : aucun | site donné : https://coop.tierslieux.net/carte | à vérifier : téléphone absent
initiative-nouvelle-aquitaine-region | Initiative Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.initiative-nouvelleaquitaine.org | à vérifier : téléphone absent
reseau-entreprendre-aquitaine-region | Réseau Entreprendre Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.reseau-entreprendre.org/aquitaine | à vérifier : téléphone absent
chambres-agriculture-nouvelle-aquitaine-region | Chambres d'agriculture Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://nouvelle-aquitaine.chambres-agriculture.fr | à vérifier : téléphone absent
cma-haute-vienne-87 | Chambre de métiers et de l'artisanat de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cma-nouvelleaquitaine.fr | à vérifier : téléphone absent
coopalpha-limousin-87 | Coop'Alpha Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.coopalpha.coop | à vérifier : téléphone absent, aucune source donnée
iriscop-limousin-87 | IRISCOP Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.iriscop.org | à vérifier : téléphone absent
egee-dordogne-24 | EGEE Dordogne | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.egee.asso.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
```

## Lot 16 : Création d'activité (3 sur 3), 8 fiches

```
Lot 16. Vérifie ces 8 fiches (rayon : Création d'activité). Réponds au format demandé, dans un seul bloc de code.

60-000-rebonds-nouvelle-aquitaine-dordogne-24 | 60 000 Rebonds Nouvelle-Aquitaine | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://60000rebonds.com | à vérifier : téléphone absent
jeune-chambre-economique-bergerac-24 | Jeune Chambre Économique de Bergerac | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://www.jcef.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
coactions-24 | CoActions | Périgueux (Dordogne) | téléphone donné : 05 53 35 80 30 | site donné : https://www.coactions.coop | à vérifier : même adresse de site que 1 autre(s) fiche(s)
coactions-limousin-87 | CoActions | Limoges (Haute-Vienne) | téléphone donné : 05 55 79 11 14 | site donné : https://www.coactions.coop | à vérifier : même adresse de site que 1 autre(s) fiche(s)
couveuse-aster-87 | ASTER Couveuse d'entreprises | Limoges (Haute-Vienne) | téléphone donné : 05 55 33 14 79 | site donné : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne | à vérifier : même téléphone que 1 autre(s) fiche(s), même adresse de site que 1 autre(s) fiche(s)
egee-haute-vienne-87 | EGEE Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 45 18 38 | site donné : https://www.egee.asso.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
jeune-chambre-economique-limoges-87 | Jeune Chambre Économique de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.jcef.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
reseau-egee-nouvelle-aquitaine-region | EGEE Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.egee.asso.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
```

## Lot 17 : Jeunes et formation, 5 fiches

```
Lot 17. Vérifie ces 5 fiches (rayon : Jeunes et formation). Réponds au format demandé, dans un seul bloc de code.

formation-jeunes-centre-info-jeunes-perigueux-24 | Centre Info Jeunes de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 53 52 81 | site donné : https://www.infojeunes-na.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
formation-jeunes-info-jeunes-sarlat-24 | Info Jeunes Sarlat | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 31 19 11 | site donné : https://www.infojeunes-na.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
formation-jeunes-info-jeunes-limoges-87 | Info Jeunes Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 55 10 08 00 | site donné : https://www.infojeunes-na.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
formation-jeunes-info-jeunes-france-national | Info Jeunes France |  (national) | téléphone donné : aucun | site donné : https://www.infojeunesfrance.org | à vérifier : téléphone absent
formation-jeunes-1jeune1solution-national | 1 jeune 1 solution |  (national) | téléphone donné : aucun | site donné : https://www.1jeune1solution.gouv.fr | à vérifier : téléphone absent
```

## Lot 18 : Formation et orientation (1 sur 2), 15 fiches

```
Lot 18. Vérifie ces 15 fiches (rayon : Formation et orientation). Réponds au format demandé, dans un seul bloc de code.

association-formation-avenir-conseil-24 | Association Formation Avenir Conseil 24 | Coulounieix-Chamiers (Dordogne) | téléphone donné : 05 53 09 03 15 | site donné : https://www.fac24.fr | à vérifier : même téléphone que 3 autre(s) fiche(s), même adresse de site que 3 autre(s) fiche(s)
association-service-formation-emploi-limousin-87 | Association Service Formation Emploi Limousin | Saint-Junien (Haute-Vienne) | téléphone donné : 05 19 29 00 50 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent
fac-bergerac-24 | Formation Avenir Conseil - Antenne Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 09 03 15 | site donné : https://www.fac24.fr | à vérifier : même téléphone que 3 autre(s) fiche(s), même adresse de site que 3 autre(s) fiche(s)
fac-sarlat-24 | Formation Avenir Conseil - Antenne Sarlat | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 09 03 15 | site donné : https://www.fac24.fr | à vérifier : même téléphone que 3 autre(s) fiche(s), même adresse de site que 3 autre(s) fiche(s)
fac-thiviers-24 | Formation Avenir Conseil - Antenne Thiviers | Thiviers (Dordogne) | téléphone donné : 05 53 09 03 15 | site donné : https://www.fac24.fr | à vérifier : même téléphone que 3 autre(s) fiche(s), même adresse de site que 3 autre(s) fiche(s)
dava-academie-limoges-perigueux-24 | Dispositif académique de validation des acquis (DAVA) de l'Académie de Limoges | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://vae.education.gouv.fr/academie/22 | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
academie-limoges-dava-region | Académie de Limoges - Dispositif académique de validation des acquis | Limoges (régional) | téléphone donné : 06 20 68 49 99 | site donné : https://vae.education.gouv.fr/academie/22 | à vérifier : même adresse de site que 1 autre(s) fiche(s)
cibc-solutions-rh-prc-vae-region | CIBC Solutions RH | Périgueux (régional) | téléphone donné : 05 53 45 46 90 | site donné : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ | à vérifier : même adresse de site que 1 autre(s) fiche(s)
cibc-haute-vienne-prc-vae-region | CIBC Haute-Vienne | Limoges (régional) | téléphone donné : 05 55 45 15 15 | site donné : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ | à vérifier : même téléphone que 2 autre(s) fiche(s), même adresse de site que 1 autre(s) fiche(s)
anfh-conseil-evolution-professionnelle-national | Association nationale pour la formation permanente du personnel hospitalier (ANFH) |  (national) | téléphone donné : aucun | site donné : https://www.anfh.fr | à vérifier : téléphone absent
afpa-nouvelle-aquitaine-region | AFPA Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.afpa.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
afpa-haute-vienne-87 | AFPA Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.afpa.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
greta-limousin-haute-vienne-87 | GRETA Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://greta.ac-limoges.fr | à vérifier : téléphone absent
cnam-nouvelle-aquitaine-limoges-87 | Cnam Nouvelle-Aquitaine - centre de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cnam-nouvelle-aquitaine.fr | à vérifier : téléphone absent
point-regional-conseil-vae-haute-vienne-87 | Point régional conseil VAE Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.vae.gouv.fr | à vérifier : téléphone absent
```

## Lot 19 : Formation et orientation (2 sur 2), 14 fiches

```
Lot 19. Vérifie ces 14 fiches (rayon : Formation et orientation). Réponds au format demandé, dans un seul bloc de code.

cio-bergerac-24 | Centre d'information et d'orientation de Bergerac | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
cio-nontron-24 | Centre d'information et d'orientation de Nontron | Nontron (Dordogne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
cio-perigueux-24 | Centre d'information et d'orientation de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 35 65 00 | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | à vérifier : même adresse de site que 4 autre(s) fiche(s)
cio-riberac-24 | Centre d'information et d'orientation de Ribérac | Ribérac (Dordogne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
cio-sarlat-la-caneda-24 | Centre d'information et d'orientation de Sarlat-la-Canéda | Sarlat-la-Canéda (Dordogne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio | à vérifier : téléphone absent, même adresse de site que 4 autre(s) fiche(s)
maison-emploi-perigord-noir-24 | Maison de l'Emploi du Périgord Noir | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 31 56 00 | site donné : aucun | à vérifier : site absent
espace-economie-emploi-riberacois-24 | Espace Économie Emploi du Ribéracois | Ribérac (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
cio-bellac-87 | Centre d'information et d'orientation de Bellac | Bellac (Haute-Vienne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
cio-saint-junien-87 | Centre d'information et d'orientation de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
cio-saint-yrieix-la-perche-87 | Centre d'information et d'orientation de Saint-Yrieix-la-Perche | Saint-Yrieix-la-Perche (Haute-Vienne) | téléphone donné : aucun | site donné : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
point-orientation-apprentissage-cci-limoges-87 | Point Orientation-Apprentissage de la CCI Limoges Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 45 15 15 | site donné : https://www.limoges.cci.fr/le-point-orientation-apprentissage | à vérifier : même téléphone que 2 autre(s) fiche(s)
cap-metiers-nouvelle-aquitaine-region | Cap Métiers Nouvelle-Aquitaine |  (régional) | téléphone donné : 05 57 81 45 65 | site donné : https://www.cap-metiers.fr/ | à vérifier : même adresse de site que 1 autre(s) fiche(s)
allocmoninfo-cap-metiers-region | AlloCMonInfo - Cap Métiers Nouvelle-Aquitaine | Limoges (régional) | téléphone donné : 08 00 94 01 66 | site donné : https://www.cap-metiers.fr/ | à vérifier : même adresse de site que 1 autre(s) fiche(s)
erip-nouvelle-aquitaine-region | Espaces Régionaux d'Information de Proximité (ERIP) |  (régional) | téléphone donné : aucun | site donné : https://www.nouvelle-aquitaine.fr/les-actions/economie-et-emploi/formation-professionnelle-et-emploi/erip-points-informations-et-conseils | à vérifier : téléphone absent
```

## Lot 20 : Français et langue, 14 fiches

```
Lot 20. Vérifie ces 14 fiches (rayon : Français et langue). Réponds au format demandé, dans un seul bloc de code.

af2p-bergerac-24 | AF2P Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 63 14 93 | site donné : https://www.af2p24.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
cria-nouvelle-aquitaine-region | Centre Ressources Illettrisme Analphabétisme Nouvelle-Aquitaine (CRIA Nouvelle-Aquitaine) |  (régional) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation | à vérifier : téléphone absent
culture-alpha-limoges-87 | Culture Alpha | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
aec-bergerac-24 | A.E.C. | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation/alphabenn/ | à vérifier : téléphone absent
accj-limoges-87 | ACCJ - Chantiers Jacquaire | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
aformac-bellac-87 | AFORMAC | Bellac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
afp87-limoges-87 | AFP 87 | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
afpa-limoges-87 | AFPA Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
association-familiale-protestante-partage-limoges-87 | Association Familiale Protestante Partage | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
familles-rurales-bellac-87 | Association Familles Rurales Bellac et ses environs | Bellac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 | à vérifier : téléphone absent, même adresse de site que 5 autre(s) fiche(s)
af2p-ligue-24-bergerac-24 | AF2P - Ligue 24 | Bergerac (Dordogne) | téléphone donné : 05 53 63 14 93 | site donné : https://www.cri-aquitaine.org/lieux-de-formation/app-bergerac/ | à vérifier : même téléphone que 1 autre(s) fiche(s)
bibliotheque-francophone-multimedia-pages-et-partage-limoges-87 | Bibliothèque francophone multimédia de Limoges - Pages et partage | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://bfm.limoges.fr/services/illettrisme-et-fle/pages-et-partage | à vérifier : téléphone absent, aucune source donnée
groupe-fel-limoges-87 | Groupe FEL | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.cri-aquitaine.org/lieux-de-formation/fiche-repertoire/fel-gueret/ | à vérifier : téléphone absent
association-perigord-linguistique-et-culturel-24 | Association Périgord Linguistique et Culturel | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
```

## Lot 21 : France Services (1 sur 2), 15 fiches

```
Lot 21. Vérifie ces 15 fiches (rayon : France Services). Réponds au format demandé, dans un seul bloc de code.

france-services-national | France Services |  (national) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-mussidan-24 | France Services Mussidan | Mussidan (Dordogne) | téléphone donné : 05 53 81 05 06 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-la-force-24 | France Services La Force | La Force (Dordogne) | téléphone donné : 05 53 24 00 24 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-carlux-24 | France Services Carlux | Carlux (Dordogne) | téléphone donné : 05 53 59 19 87 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-mouleydier-24 | France Services Mouleydier | Mouleydier (Dordogne) | téléphone donné : 05 53 23 06 10 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-chateau-leveque-24 | France Services Château-l'Évêque | Château-l'Évêque (Dordogne) | téléphone donné : 05 53 46 28 74 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-boulazac-24 | France Services Boulazac Isle Manoire | Boulazac Isle Manoire (Dordogne) | téléphone donné : 05 53 35 59 53 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-limoges-nord-beaubreuil-87 | France Services Limoges Nord Beaubreuil | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-aixe-sur-vienne-87 | France Services Aixe-sur-Vienne | Aixe-sur-Vienne (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-ambazac-87 | France Services Ambazac | Ambazac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-bellac-87 | France Services Bellac | Bellac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-bergerac-24 | France Services Bergerac | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-brantome-en-perigord-24 | France Services Brantôme en Périgord | Brantôme en Périgord (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-coulounieix-chamiers-24 | France Services Coulounieix-Chamiers | Coulounieix-Chamiers (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-eymet-24 | France Services Eymet | Eymet (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
```

## Lot 22 : France Services (2 sur 2), 13 fiches

```
Lot 22. Vérifie ces 13 fiches (rayon : France Services). Réponds au format demandé, dans un seul bloc de code.

france-services-lalinde-24 | France Services Lalinde | Lalinde (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-le-bugue-24 | France Services Le Bugue | Le Bugue (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-monpazier-24 | France Services Monpazier | Monpazier (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-montignac-24 | France Services Montignac | Montignac-Lascaux (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-perigueux-24 | France Services Périgueux | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-chalus-87 | France Services Châlus | Châlus (Haute-Vienne) | téléphone donné : 05 55 78 43 93 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-chateauponsac-87 | France Services Châteauponsac | Châteauponsac (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.france-services.gouv.fr | à vérifier : téléphone absent, même adresse de site que 26 autre(s) fiche(s)
france-services-eymoutiers-87 | France Services Eymoutiers | Eymoutiers (Haute-Vienne) | téléphone donné : 05 44 22 53 36 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-javerdat-87 | France Services Javerdat | Javerdat (Haute-Vienne) | téléphone donné : 05 55 03 21 69 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-le-dorat-87 | France Services Le Dorat | Le Dorat (Haute-Vienne) | téléphone donné : 05 55 60 90 53 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-nexon-87 | France Services Nexon | Nexon (Haute-Vienne) | téléphone donné : 05 55 58 11 05 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-rochechouart-87 | France Services Rochechouart | Rochechouart (Haute-Vienne) | téléphone donné : 05 87 03 11 50 | site donné : https://www.france-services.gouv.fr | à vérifier : même adresse de site que 26 autre(s) fiche(s)
france-services-haute-vienne-87 | Réseau France Services de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.gouv.fr/Demarches/France-services/France-services | à vérifier : téléphone absent
```

## Lot 23 : france-travail, 2 fiches

```
Lot 23. Vérifie ces 2 fiches (rayon : france-travail). Réponds au format demandé, dans un seul bloc de code.

france-travail-haute-vienne-87 | France Travail Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 09 72 72 39 49 | site donné : https://www.francetravail.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
france-travail-conseillers-justice-haute-vienne-87 | France Travail Haute-Vienne - accompagnement justice | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.francetravail.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
```

## Lot 24 : Handicap, 13 fiches

```
Lot 24. Vérifie ces 13 fiches (rayon : Handicap). Réponds au format demandé, dans un seul bloc de code.

association-valentin-hauy-limoges-national | Association Valentin Haüy - Comité de Limoges | Limoges (national) | téléphone donné : aucun | site donné : https://www.avh.asso.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
unapei-limousin-region | Unapei Limousin | Limoges (régional) | téléphone donné : aucun | site donné : https://www.unapei.org | à vérifier : téléphone absent
afm-telethon-nouvelle-aquitaine-region | AFM-Téléthon Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.afm-telethon.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
france-parkinson-nouvelle-aquitaine-region | France Parkinson - Comité Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.franceparkinson.fr | à vérifier : téléphone absent
apajh-nouvelle-aquitaine-region | Fédération APAJH Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.apajh.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
apei-perigueux-24 | APEI Périgueux | Boulazac Isle Manoire (Dordogne) | téléphone donné : 05 53 08 20 87 | site donné : aucun | à vérifier : site absent
fnath-perigueux-24 | FNATH Groupement Sud-Ouest - Permanence de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 45 44 50 | site donné : https://www.fnath.org | à vérifier : même adresse de site que 1 autre(s) fiche(s)
fnath-national | FNATH |  (national) | téléphone donné : aucun | site donné : https://www.fnath.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
unafam-national | Unafam |  (national) | téléphone donné : aucun | site donné : https://www.unafam.org | à vérifier : téléphone absent
association-valentin-hauy-national | Association Valentin Haüy |  (national) | téléphone donné : aucun | site donné : https://www.avh.asso.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
afm-telethon-national | AFM-Téléthon |  (national) | téléphone donné : aucun | site donné : https://www.afm-telethon.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
apajh-national | Fédération APAJH |  (national) | téléphone donné : aucun | site donné : https://www.apajh.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
entreprises-adaptees-esat-haute-vienne-87 | Entreprises adaptées et ESAT de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://annuaire.action-sociale.org | à vérifier : téléphone absent, aucune source donnée
```

## Lot 25 : inclusion-numerique, 1 fiche

```
Lot 25. Vérifie ces 1 fiches (rayon : inclusion-numerique). Réponds au format demandé, dans un seul bloc de code.

inclusion-numerique-haute-vienne-87 | Réseau des conseillers numériques France Services de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.conseiller-numerique.gouv.fr | à vérifier : téléphone absent
```

## Lot 26 : Justice et insertion (1 sur 2), 15 fiches

```
Lot 26. Vérifie ces 15 fiches (rayon : Justice et insertion). Réponds au format demandé, dans un seul bloc de code.

maison-justice-droit-limoges-87 | Maison de la Justice et du Droit de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
maison-droit-saint-junien-87 | Maison du Droit de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : aucun | site donné : https://cdad-hautevienne.justice.fr | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
service-accueil-unique-justiciable-limoges-87 | Service d'accueil unique du justiciable (SAUJ) du tribunal judiciaire de Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 87 19 34 00 | site donné : https://cdad-hautevienne.justice.fr/acteurs-du-droit/ | à vérifier : même téléphone que 2 autre(s) fiche(s)
ordre-avocats-barreau-limoges-87 | Ordre des avocats du Barreau de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.avocats-limoges.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
barreau-limoges-87 | Barreau de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.avocats-limoges.org | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
conseil-national-barreaux-national | Conseil national des barreaux |  (national) | téléphone donné : aucun | site donné : https://www.cnb.avocat.fr | à vérifier : téléphone absent
federation-nationale-cidff-national | Fédération nationale des CIDFF |  (national) | téléphone donné : aucun | site donné : https://fncidff.info | à vérifier : téléphone absent
maison-justice-droit-perigueux-24 | Maison de la Justice et du Droit de Périgueux | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
service-accueil-unique-justiciable-perigueux-24 | Service d'accueil unique du justiciable du tribunal judiciaire de Périgueux | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
service-accueil-unique-justiciable-bergerac-24 | Service d'accueil unique du justiciable du tribunal judiciaire de Bergerac | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
association-aide-victimes-haute-vienne-87 | Association d'aide aux victimes AVIMED France Victimes 87 | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://france-victimes.fr | à vérifier : téléphone absent
bureau-aide-juridictionnelle-limoges-87 | Bureau d'aide juridictionnelle du tribunal judiciaire de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
service-accueil-unique-justiciable-sarlat-24 | Service d'accueil unique du justiciable du tribunal de proximité de Sarlat-la-Canéda | Sarlat-la-Canéda (Dordogne) | téléphone donné : aucun | site donné : https://www.justice.fr | à vérifier : téléphone absent, même adresse de site que 7 autre(s) fiche(s)
france-victimes-national | France Victimes |  (national) | téléphone donné : aucun | site donné : https://www.france-victimes.fr | à vérifier : téléphone absent
service-penitentiaire-insertion-probation-haute-vienne-87 | Service pénitentiaire d'insertion et de probation de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 49 11 00 | site donné : aucun | à vérifier : site absent
```

## Lot 27 : Justice et insertion (2 sur 2), 1 fiche

```
Lot 27. Vérifie ces 1 fiches (rayon : Justice et insertion). Réponds au format demandé, dans un seul bloc de code.

services-penitentiaires-insertion-probation-national | Services pénitentiaires d'insertion et de probation (SPIP) |  (national) | téléphone donné : aucun | site donné : https://www.justice.gouv.fr/annuaire/structures-reinsertion-demploi/services-penitentiaires-dinsertion-probation-spip | à vérifier : téléphone absent
```

## Lot 28 : Logement et hébergement (1 sur 2), 15 fiches

```
Lot 28. Vérifie ces 15 fiches (rayon : Logement et hébergement). Réponds au format demandé, dans un seul bloc de code.

apare-perigueux-24 | APARE (Association Périgourdine d'Action et de Recherche sur l'Exclusion) | Périgueux (Dordogne) | téléphone donné : 05 53 02 65 00 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent
chrs-apare-perigueux-24 | Centre d'Hébergement et de Réinsertion Sociale APARE | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
association-de-soutien-de-la-dordogne-24 | Association de Soutien de la Dordogne | Périgueux (Dordogne) | téléphone donné : 05 53 06 82 10 | site donné : aucun | à vérifier : site absent
association-des-cites-du-secours-catholique-caritas-24 | Association des Cités du Secours Catholique - Caritas France | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
habitat-et-humanisme-dordogne-24 | Habitat et Humanisme Dordogne | Périgueux (Dordogne) | téléphone donné : 09 70 37 36 52 | site donné : aucun | à vérifier : site absent, aucune source donnée
association-le-bercail-24 | Association Le Bercail | Sainte-Foy-de-Belvès (Dordogne) | téléphone donné : 05 53 29 00 53 | site donné : aucun | à vérifier : site absent, aucune source donnée
arsl-hebergement-logement-limoges-87 | ARSL - Hébergement & Logement | Panazol (Haute-Vienne) | téléphone donné : 05 55 77 57 77 | site donné : https://arsl.eu/hebergement-et-logement/ | à vérifier : même adresse de site que 2 autre(s) fiche(s)
arsl-chrs-augustin-gartempe-87 | CHRS Augustin Gartempe | Limoges (Haute-Vienne) | téléphone donné : 05 55 10 32 95 | site donné : https://arsl.eu/hebergement-et-logement/ | à vérifier : même adresse de site que 2 autre(s) fiche(s)
arsl-logement-limoges-87 | ARSL Logement | Limoges (Haute-Vienne) | téléphone donné : 05 55 79 09 58 | site donné : https://arsl.eu/hebergement-et-logement/ | à vérifier : même adresse de site que 2 autre(s) fiche(s)
hestia-limoges-87 | Association HESTIA | Limoges (Haute-Vienne) | téléphone donné : 05 55 38 98 00 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent
association-marianes-limoges-87 | Association Marianes | Limoges (Haute-Vienne) | téléphone donné : 05 55 77 30 97 | site donné : aucun | à vérifier : site absent, aucune source donnée
habitat-et-humanisme-limousin-limoges-87 | Habitat et Humanisme Limousin | Limoges (Haute-Vienne) | téléphone donné : 05 55 32 21 98 | site donné : aucun | à vérifier : site absent, aucune source donnée
visale-france-national | Visale |  (national) | téléphone donné : aucun | site donné : https://www.visale.fr | à vérifier : téléphone absent
fonds-solidarite-logement-haute-vienne-region | Fonds de solidarité pour le logement de la Haute-Vienne | Limoges (régional) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
cite-bethanie-bergerac-24 | Cité Béthanie - CHRS | Bergerac (Dordogne) | téléphone donné : 05 53 23 74 98 | site donné : aucun | à vérifier : site absent
```

## Lot 29 : Logement et hébergement (2 sur 2), 12 fiches

```
Lot 29. Vérifie ces 12 fiches (rayon : Logement et hébergement). Réponds au format demandé, dans un seul bloc de code.

atelier-bergerac-24 | L'Atelier | Bergerac (Dordogne) | téléphone donné : 05 53 57 78 26 | site donné : aucun | à vérifier : site absent
la-halte-24-perigueux-24 | La Halte 24 | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
france-terre-d-asile-bergerac-24 | France Terre d'Asile | Bergerac (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
safed-perigueux-24 | Service d'Accompagnement des Familles en Difficulté (SAFED) | Périgueux (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent
fondation-abbe-pierre-nouvelle-aquitaine-region | Fondation pour le Logement des Défavorisés |  (régional) | téléphone donné : aucun | site donné : https://www.fondationpourlelogement.fr | à vérifier : téléphone absent
croix-rouge-francaise-nouvelle-aquitaine-region | Croix-Rouge française |  (régional) | téléphone donné : aucun | site donné : https://www.croix-rouge.fr | à vérifier : téléphone absent
secours-catholique-nouvelle-aquitaine-region | Secours Catholique - Caritas France |  (régional) | téléphone donné : aucun | site donné : https://www.secours-catholique.org | à vérifier : téléphone absent
association-de-soutien-de-la-dordogne-perigueux-24 | Association de Soutien de la Dordogne (ASD) - Pôle Logement | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.asd24.org/service/les-logements-de-transition-et-l-accompagnement-en-matiere-de-logement | à vérifier : téléphone absent
association-perigourdine-action-recherche-exclusion-perigueux-24 | Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) | Périgueux (Dordogne) | téléphone donné : aucun | site donné : https://www.apare24.fr | à vérifier : téléphone absent
accueils-de-jour-haute-vienne-87 | Accueils de jour de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.service-public.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
habitat-jeunes-haute-vienne-87 | Habitat Jeunes Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.unhaj.org | à vérifier : téléphone absent, aucune source donnée
siao-haute-vienne-87 | SIAO Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.siao87.fr | à vérifier : téléphone absent
```

## Lot 30 : Missions locales, 8 fiches

```
Lot 30. Vérifie ces 8 fiches (rayon : Missions locales). Réponds au format demandé, dans un seul bloc de code.

mission-locale-france-national | Union nationale des Missions Locales |  (national) | téléphone donné : aucun | site donné : https://www.unml.info | à vérifier : téléphone absent
mission-locale-limoges-metropole-87 | Mission Locale Limoges Métropole | Limoges (Haute-Vienne) | téléphone donné : 05 55 10 01 00 | site donné : https://www.ml-limoges.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
mission-locale-riberacois-vallee-isle-24 | Mission Locale Ribéracois Vallée de l'Isle | Ribérac (Dordogne) | téléphone donné : 05 53 92 40 75 | site donné : https://www.missionlocale-riberacois.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
mission-locale-saint-astier-24 | Mission Locale de Saint-Astier | Saint-Astier (Dordogne) | téléphone donné : 05 53 02 42 96 | site donné : https://www.missionlocale-riberacois.fr | à vérifier : même adresse de site que 1 autre(s) fiche(s)
mission-locale-limoges-paul-gauguin-87 | Mission Locale de l'Agglomération de Limoges Métropole - Antenne Paul Gauguin | Limoges (Haute-Vienne) | téléphone donné : 05 55 37 06 65 | site donné : https://mission-locale-limoges.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
mission-locale-limoges-marcel-vardelle-87 | Mission Locale de l'Agglomération de Limoges Métropole - Antenne Marcel Vardelle | Limoges (Haute-Vienne) | téléphone donné : 05 55 49 14 00 | site donné : https://mission-locale-limoges.fr | à vérifier : même adresse de site que 2 autre(s) fiche(s)
mission-locale-limoges-fabre-deglantine-87 | Mission Locale de l'Agglomération de Limoges Métropole - Antenne Fabre-d'Églantine | Limoges (Haute-Vienne) | téléphone donné : 05 55 10 01 00 | site donné : https://mission-locale-limoges.fr | à vérifier : même téléphone que 1 autre(s) fiche(s), même adresse de site que 2 autre(s) fiche(s)
mission-locale-nouvelle-aquitaine-jeunes-emploi-region | Association Régionale des Missions Locales Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.arml-na.fr | à vérifier : téléphone absent
```

## Lot 31 : Mobilité solidaire, 5 fiches

```
Lot 31. Vérifie ces 5 fiches (rayon : Mobilité solidaire). Réponds au format demandé, dans un seul bloc de code.

garage-solidaire-mon-garage-solidaire-24 | Mon Garage Solidaire | Coly-Saint-Amand (Dordogne) | téléphone donné : 06 76 78 05 60 | site donné : aucun | à vérifier : site absent
msor-bellac-87 | MSoR - Mobilité Solidaire Rurale | Bellac (Haute-Vienne) | téléphone donné : 06 33 65 17 47 | site donné : aucun | à vérifier : site absent
wimoov-nouvelle-aquitaine-region | Wimoov Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.wimoov.org | à vérifier : téléphone absent
mobin-nouvelle-aquitaine-region | Mob'In Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://mobin-solutions.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
mobin-france-national | Mob'In France |  (national) | téléphone donné : aucun | site donné : https://mobin-solutions.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
```

## Lot 32 : Petite enfance et garde (1 sur 2), 15 fiches

```
Lot 32. Vérifie ces 15 fiches (rayon : Petite enfance et garde). Réponds au format demandé, dans un seul bloc de code.

micro-creche-fee-risette-compreignac-87 | Micro-crèche La Fée Risette | Compreignac (Haute-Vienne) | téléphone donné : 05 55 12 88 02 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-napoleon-magne-24 | Crèche Napoléon Magne | Périgueux (Dordogne) | téléphone donné : 05 53 53 47 49 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-des-arenes-24 | Crèche des Arènes | Périgueux (Dordogne) | téléphone donné : 05 53 08 04 29 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-calins-calines-24 | Crèche Halte Garderie Câlins Câlines | Périgueux (Dordogne) | téléphone donné : 05 53 53 55 79 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-clos-chassaing-24 | Crèche Clos Chassaing | Périgueux (Dordogne) | téléphone donné : 05 53 35 86 38 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-maison-des-doudous-24 | Crèche La Maison des Doudous | Bassillac et Auberoche (Dordogne) | téléphone donné : 05 53 03 45 33 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-maison-petit-prince-24 | Crèche La Maison du Petit Prince | Coulounieix-Chamiers (Dordogne) | téléphone donné : 05 53 35 74 10 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-valentine-bussiere-24 | Crèche Valentine Bussière | Boulazac Isle Manoire (Dordogne) | téléphone donné : 05 53 03 53 16 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-le-xylophone-24 | Le Xylophone | Boulazac Isle Manoire (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
creche-souris-vertes-24 | Crèche Les Souris Vertes | Marsac-sur-l'Isle (Dordogne) | téléphone donné : 05 53 04 12 12 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-maison-petite-enfance-sarlat-24 | Maison de la Petite Enfance | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 31 45 64 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-gambada-caneda-24 | Gambada Crèche La Canéda | Sarlat-la-Canéda (Dordogne) | téléphone donné : 06 65 65 62 05 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-maison-enfance-montignac-24 | Maison de l'Enfance | Montignac-Lascaux (Dordogne) | téléphone donné : 05 53 51 87 06 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-souris-jaune-24 | Multi Accueil La Souris Jaune | Le Bugue (Dordogne) | téléphone donné : 05 53 07 82 14 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-pous-24 | Crèche Pous | Bergerac (Dordogne) | téléphone donné : 05 53 57 22 95 | site donné : aucun | à vérifier : site absent, aucune source donnée
```

## Lot 33 : Petite enfance et garde (2 sur 2), 7 fiches

```
Lot 33. Vérifie ces 7 fiches (rayon : Petite enfance et garde). Réponds au format demandé, dans un seul bloc de code.

creche-isle-aux-bambins-24 | Crèche L'Isle aux Bambins | Mussidan (Dordogne) | téléphone donné : 05 53 81 23 68 | site donné : aucun | à vérifier : site absent, aucune source donnée
creche-maison-petite-enfance-saint-astier-24 | Maison Petite Enfance | Saint-Astier (Dordogne) | téléphone donné : 05 53 54 06 58 | site donné : aucun | à vérifier : site absent, aucune source donnée
micro-creche-coccinelles-24 | Micro-Crèche Les Coccinelles | Brantôme en Périgord (Dordogne) | téléphone donné : 05 53 05 27 83 | site donné : aucun | à vérifier : site absent, aucune source donnée
micro-creche-petitous-24 | Micro Crèche Les Petitous | Château-l'Évêque (Dordogne) | téléphone donné : 05 53 03 47 88 | site donné : aucun | à vérifier : site absent, aucune source donnée
micro-creche-ptits-loups-nontron-24 | Micro-Crèche Les Ptits Loups | Nontron (Dordogne) | téléphone donné : 05 53 56 67 13 | site donné : aucun | à vérifier : site absent, aucune source donnée
micro-creche-lutins-edith-24 | Micro Crèche Les Lutins d'Edith | Sanilhac (Dordogne) | téléphone donné : 05 53 04 31 89 | site donné : aucun | à vérifier : site absent, aucune source donnée
pmi-haute-vienne-87 | Protection maternelle et infantile de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
```

## Lot 34 : plie, 1 fiche

```
Lot 34. Vérifie ces 1 fiches (rayon : plie). Réponds au format demandé, dans un seul bloc de code.

plie-limoges-metropole-87 | PLIE Limoges Métropole | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.limoges-metropole.fr | à vérifier : téléphone absent, même adresse de site que 1 autre(s) fiche(s)
```

## Lot 35 : Santé, soins et addictions (1 sur 3), 15 fiches

```
Lot 35. Vérifie ces 15 fiches (rayon : Santé, soins et addictions). Réponds au format demandé, dans un seul bloc de code.

ars-nouvelle-aquitaine-delegation-dordogne-24 | Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Dordogne | Périgueux (Dordogne) | téléphone donné : 09 69 37 00 22 | site donné : https://www.nouvelle-aquitaine.ars.sante.fr/ | à vérifier : même adresse de site que 2 autre(s) fiche(s)
centre-hospitalier-specialise-vauclaire-24 | Centre hospitalier spécialisé Vauclaire | Montpon-Ménestérol (Dordogne) | téléphone donné : 05 53 82 82 82 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-hopital-perigueux-24 | Centre Médico-Psychologique de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 45 29 05 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-medico-psychologique-nontron-24 | Centre Médico-Psychologique de Nontron | Nontron (Dordogne) | téléphone donné : 05 53 05 66 89 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-sarlat-24 | Centre Médico-Psychologique de Sarlat | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 31 76 56 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-brantome-24 | CMP / CATTP et Hôpital de jour du Centre hospitalier Vauclaire | Brantôme en Périgord (Dordogne) | téléphone donné : 05 53 82 89 90 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-terrasson-24 | Centre Médico-Psychologique de Terrasson | Terrasson-Lavilledieu (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
cmp-montpon-menesterol-24 | Centre Médico-Psychologique de Montpon-Ménestérol | Montpon-Ménestérol (Dordogne) | téléphone donné : 05 53 82 00 55 | site donné : aucun | à vérifier : site absent, aucune source donnée
csapa-addictions-france-perigueux-24 | Association Addictions France - CSAPA de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 07 66 82 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-addictologie-sarladais-24 | Centre d'Addictologie du Sarladais | Sarlat-la-Canéda (Dordogne) | téléphone donné : 05 53 28 92 34 | site donné : aucun | à vérifier : site absent, aucune source donnée
ceid-perigueux-24 | CEID Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 46 63 83 | site donné : aucun | à vérifier : site absent, aucune source donnée
maison-des-adolescents-dordogne-24 | Maison des Adolescents de la Dordogne | Bergerac (Dordogne) | téléphone donné : 05 53 61 55 93 | site donné : aucun | à vérifier : site absent, aucune source donnée
pole-hospitalisation-psychiatrique-bergeracois-24 | Pôle d'Hospitalisation Psychiatrique Bergeracois | Bergerac (Dordogne) | téléphone donné : aucun | site donné : aucun | à vérifier : téléphone absent, site absent, aucune source donnée
cmpp-perigueux-24 | Centre Médico-Psycho-Pédagogique de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 53 38 85 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmpp-bergerac-24 | Centre Médico-Psycho-Pédagogique de Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 57 18 65 | site donné : aucun | à vérifier : site absent, aucune source donnée
```

## Lot 36 : Santé, soins et addictions (2 sur 3), 15 fiches

```
Lot 36. Vérifie ces 15 fiches (rayon : Santé, soins et addictions). Réponds au format demandé, dans un seul bloc de code.

cmp-enfants-perigueux-24 | Centre Médico-Psychologique pour enfants et adolescents de Périgueux | Périgueux (Dordogne) | téléphone donné : 05 53 82 82 56 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-enfants-montpon-24 | Centre Médico-Psychologique Enfants et Adolescents de Montpon-Ménestérol | Montpon-Ménestérol (Dordogne) | téléphone donné : 05 53 80 39 43 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-enfants-beaumont-24 | Centre Médico-Psychologique Enfants et Adolescents de Beaumontois-en-Périgord | Beaumontois-en-Périgord (Dordogne) | téléphone donné : 05 53 22 85 76 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-enfants-riberac-24 | Centre Médico-Psychologique Enfants et Adolescents de Ribérac | Ribérac (Dordogne) | téléphone donné : 05 53 61 55 94 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-enfants-nontron-24 | Consultation Médico-Psychologique pour Enfants et Adolescents de Nontron | Nontron (Dordogne) | téléphone donné : 05 53 56 23 25 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-departemental-de-sante-excideuil-24 | Centre départemental de santé - site d'Excideuil | Excideuil (Dordogne) | téléphone donné : 05 53 02 06 00 | site donné : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | à vérifier : même adresse de site que 2 autre(s) fiche(s)
centre-departemental-de-sante-riberac-24 | Centre départemental de santé - site de Ribérac | Ribérac (Dordogne) | téléphone donné : 05 53 02 07 20 | site donné : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | à vérifier : même adresse de site que 2 autre(s) fiche(s)
centre-departemental-de-sante-saint-medard-de-mussidan-24 | Centre départemental de santé - site de Saint-Médard-de-Mussidan | Saint-Médard-de-Mussidan (Dordogne) | téléphone donné : 05 53 02 06 20 | site donné : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante | à vérifier : même adresse de site que 2 autre(s) fiche(s)
ceid-antenne-bergerac-24 | CEID Addictions Dordogne - antenne de Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 74 20 49 | site donné : aucun | à vérifier : site absent, aucune source donnée
vauclaire-addictologie-escales-24 | Centre hospitalier Vauclaire - Unité d'addictologie Escales | Périgueux (Dordogne) | téléphone donné : 05 53 05 66 80 | site donné : aucun | à vérifier : site absent, aucune source donnée
hopital-de-jour-addictologie-envol-24 | Hôpital de jour Addictologie L'Envol | Périgueux (Dordogne) | téléphone donné : 05 53 61 55 99 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmp-adultes-bergerac-24 | Centre Médico-Psychologique pour Adultes de Bergerac | Bergerac (Dordogne) | téléphone donné : 05 53 27 42 46 | site donné : aucun | à vérifier : site absent, aucune source donnée
ars-nouvelle-aquitaine-delegation-haute-vienne-87 | Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.nouvelle-aquitaine.ars.sante.fr/ | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
cmp-van-gogh-limoges-87 | Centre Médico Psychologique Van Gogh | Limoges (Haute-Vienne) | téléphone donné : 05 55 43 13 33 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent, aucune source donnée
cmp-sainte-claire-limoges-87 | Centre Médico Psychologique Sainte Claire | Limoges (Haute-Vienne) | téléphone donné : 05 55 43 13 33 | site donné : aucun | à vérifier : même téléphone que 1 autre(s) fiche(s), site absent, aucune source donnée
```

## Lot 37 : Santé, soins et addictions (3 sur 3), 13 fiches

```
Lot 37. Vérifie ces 13 fiches (rayon : Santé, soins et addictions). Réponds au format demandé, dans un seul bloc de code.

cmp-saint-junien-87 | Centre Médico Psychologique du Val de Vienne | Saint-Junien (Haute-Vienne) | téléphone donné : 05 55 43 11 20 | site donné : aucun | à vérifier : même téléphone que 2 autre(s) fiche(s), site absent, aucune source donnée
cmp-saint-yrieix-la-perche-87 | Centre Médico Psychologique du Bassin Arédien | Saint-Yrieix-la-Perche (Haute-Vienne) | téléphone donné : 05 55 43 11 20 | site donné : aucun | à vérifier : même téléphone que 2 autre(s) fiche(s), site absent, aucune source donnée
cmp-magnac-laval-87 | Centre de Proximité en Santé Mentale du Haut Limousin | Magnac-Laval (Haute-Vienne) | téléphone donné : 05 55 43 11 20 | site donné : aucun | à vérifier : même téléphone que 2 autre(s) fiche(s), site absent, aucune source donnée
cmp-saint-leonard-de-noblat-87 | Centre Médico Psychologique Monts et Barrages | Saint-Léonard-de-Noblat (Haute-Vienne) | téléphone donné : 05 87 50 90 94 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmpp-limoges-87 | Centre Médico Psycho Pédagogique de Limoges | Limoges (Haute-Vienne) | téléphone donné : 05 55 77 32 39 | site donné : aucun | à vérifier : site absent, aucune source donnée
cmpp-saint-junien-87 | Centre Médico Psycho Pédagogique de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : 05 55 02 27 40 | site donné : aucun | à vérifier : site absent, aucune source donnée
equipe-mobile-psychiatrie-precarite-limoges-87 | Équipe Mobile Psychiatrie Précarité | Limoges (Haute-Vienne) | téléphone donné : 05 55 43 12 07 | site donné : aucun | à vérifier : site absent, aucune source donnée
association-addictions-france-haute-vienne-87 | Association Addictions France Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 34 46 00 | site donné : aucun | à vérifier : site absent, aucune source donnée
csapa-bobillot-limoges-87 | CSAPA Bobillot | Limoges (Haute-Vienne) | téléphone donné : 05 55 34 43 77 | site donné : aucun | à vérifier : site absent, aucune source donnée
maison-des-adolescents-haute-vienne-87 | Maison des Adolescents de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : 05 55 12 76 00 | site donné : aucun | à vérifier : site absent, aucune source donnée
agence-regionale-de-sante-nouvelle-aquitaine-region | Agence régionale de santé Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://www.nouvelle-aquitaine.ars.sante.fr/ | à vérifier : téléphone absent, même adresse de site que 2 autre(s) fiche(s)
association-addictions-france-national | Association Addictions France |  (national) | téléphone donné : aucun | site donné : https://addictions-france.org | à vérifier : téléphone absent
psycom-national | Psycom |  (national) | téléphone donné : aucun | site donné : https://www.psycom.org | à vérifier : téléphone absent
```

## Lot 38 : service-social-secteur, 15 fiches

```
Lot 38. Vérifie ces 15 fiches (rayon : service-social-secteur). Réponds au format demandé, dans un seul bloc de code.

service-social-departemental-haute-vienne-87 | Service social départemental de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
service-insertion-haute-vienne-87 | Service insertion du Conseil départemental de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
clap-sud-ouest-region | CLAP Sud-Ouest |  (régional) | téléphone donné : aucun | site donné : https://clap-so.org/les-secteurs/cri-aquitaine/ | à vérifier : téléphone absent
federation-centres-sociaux-perigord-24 | Fédération Départementale des Centres Sociaux du Périgord | Marsac-sur-l'Isle (Dordogne) | téléphone donné : 07 89 34 00 03 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-jean-moulin-bergerac-24 | Centre Social Jean Moulin | Bergerac (Dordogne) | téléphone donné : 05 53 22 23 40 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-germaine-tillion-bergerac-24 | Centre Social Germaine Tillion | Bergerac (Dordogne) | téléphone donné : 05 53 57 92 78 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-la-brunetiere-bergerac-24 | Centre Social La Brunetière | Bergerac (Dordogne) | téléphone donné : 05 53 63 15 57 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-saint-exupery-coulounieix-chamiers-24 | Centre Social Saint-Exupéry | Coulounieix-Chamiers (Dordogne) | téléphone donné : 05 53 45 60 30 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-culturel-larche-perigueux-24 | Centre Social et Culturel L'Arche | Périgueux (Dordogne) | téléphone donné : 05 53 09 50 43 | site donné : aucun | à vérifier : site absent, aucune source donnée
federation-centres-sociaux-haute-vienne-87 | Fédération des Centres Sociaux de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.centres-sociaux.fr | à vérifier : téléphone absent
centre-social-aristide-briand-alis-87 | Centre Social Aristide Briand - ALIS | Limoges (Haute-Vienne) | téléphone donné : 05 55 10 95 36 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-entre-deux-alis-87 | Centre Social Entre Deux - ALIS | Limoges (Haute-Vienne) | téléphone donné : 05 87 75 80 64 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-alchimis-87 | Centre Social Alchimis | Limoges (Haute-Vienne) | téléphone donné : 05 55 57 38 24 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-beaubreuil-87 | Centre Social Municipal de Beaubreuil | Limoges (Haute-Vienne) | téléphone donné : 05 55 45 64 84 | site donné : aucun | à vérifier : site absent, aucune source donnée
centre-social-parenthese-glane-87 | Centre Social Municipal La Parenthèse de la Glane | Saint-Junien (Haute-Vienne) | téléphone donné : 07 61 64 42 75 | site donné : aucun | à vérifier : site absent, aucune source donnée
```

## Lot 39 : Insertion par l'activité économique, 6 fiches

```
Lot 39. Vérifie ces 6 fiches (rayon : Insertion par l'activité économique). Réponds au format demandé, dans un seul bloc de code.

asppi-vergt-24 | ASPPI 24 | Vergt (Dordogne) | téléphone donné : 05 53 54 19 19 | site donné : aucun | à vérifier : site absent
relais-insertion-solidaire-bujaleuf-87 | Relais Insertion Solidaire | Bujaleuf (Haute-Vienne) | téléphone donné : 05 55 56 38 23 | site donné : aucun | à vérifier : site absent
siae-haute-vienne-87 | Structures de l'insertion par l'activité économique de la Haute-Vienne | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://emploi-insertion.org | à vérifier : téléphone absent
emmaus-limoges-87 | Emmaüs Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://emmaus-france.org | à vérifier : téléphone absent
envie-limousin-87 | ENVIE Limousin | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.envie.org | à vérifier : téléphone absent
jardin-cocagne-limoges-87 | Jardin de Cocagne de Limoges | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.reseaucocagne.org | à vérifier : téléphone absent
```

## Lot 40 : Soutien aux familles, 11 fiches

```
Lot 40. Vérifie ces 11 fiches (rayon : Soutien aux familles). Réponds au format demandé, dans un seul bloc de code.

asfel-limoges-87 | ASFEL | Limoges (Haute-Vienne) | téléphone donné : 05 19 29 00 50 | site donné : https://www.asfel.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
maison-des-aidants-bergerac-24 | La Maison des Aidants | Bergerac (Dordogne) | téléphone donné : 05 53 24 97 27 | site donné : aucun | à vérifier : site absent, aucune source donnée
udaf-dordogne-24 | Union Départementale des Associations Familiales de la Dordogne | Périgueux (Dordogne) | téléphone donné : 05 53 06 41 00 | site donné : aucun | à vérifier : site absent, aucune source donnée
maison-des-aidants-evaasion-87 | Plateforme de soutien aux aidants Evaasion | Limoges (Haute-Vienne) | téléphone donné : 05 19 99 99 99 | site donné : aucun | à vérifier : site absent
plateforme-aidants-castel-87 | Plateforme d'accompagnement et de répit des aidants Le Castel | Limoges (Haute-Vienne) | téléphone donné : 05 55 33 99 00 | site donné : aucun | à vérifier : site absent
planning-familial-nouvelle-aquitaine-region | Planning Familial Nouvelle-Aquitaine |  (régional) | téléphone donné : aucun | site donné : https://planning-familial-na.org | à vérifier : téléphone absent
planning-familial-24-bergerac-24 | Le Planning Familial 24 - Dordogne / Bergerac | Bergerac (Dordogne) | téléphone donné : aucun | site donné : https://planning-familial-na.org/antenne-departementale/dordogne-24-bergerac/ | à vérifier : téléphone absent
centre-planification-carmes-87 | Consultation de planification des Carmes | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
centre-planification-saint-junien-87 | Centre de planification familiale de Saint-Junien | Saint-Junien (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
centre-planification-saint-yrieix-87 | Centre de planification de Saint-Yrieix | Saint-Yrieix-la-Perche (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
espace-choisir-limoges-87 | Espace CHOISIR | Limoges (Haute-Vienne) | téléphone donné : aucun | site donné : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification | à vérifier : téléphone absent, même adresse de site que 3 autre(s) fiche(s)
```


---

# Partie 2 : les employeurs du sas (955 fiches, 754 à vérifier)

Même méthode que pour les structures : ouvrir une conversation neuve, envoyer **la consigne ci-dessous une seule fois**, puis les lots un par un. La réponse a un autre format (une colonne de plus : la page de recrutement).

## Consigne de départ pour les employeurs (à envoyer une seule fois)

```
Tu vas m'aider à VÉRIFIER des coordonnées d'employeurs (magasins, hôtels, restaurants, campings) de Dordogne (24) et de Haute-Vienne (87), pour un annuaire destiné à des personnes qui cherchent un emploi. L'exactitude compte plus que la quantité.

RÈGLES STRICTES
1. N'invente RIEN. Si tu ne trouves pas l'information sur une page officielle de l'enseigne ou de l'établissement, écris « introuvable ». C'est une bonne réponse.
2. Sources acceptées : site de l'enseigne ou de l'établissement, sa page « recrutement », « carrières » ou « nous rejoindre ». Pas de plateformes de réservation, pas d'annuaires commerciaux, pas de réseaux sociaux.
3. Pour chaque fiche, donne l'adresse EXACTE de la page où tu as lu chaque information (colonne « page »). Sans page, pas de réponse.
4. « page de recrutement » : la page où une personne peut candidater (page carrières de l'enseigne, ou candidature spontanée de cet établissement). Pas une offre d'emploi précise, qui disparaîtra. Si l'enseigne n'a qu'un portail national, donne-le et écris « portail national » en remarque. Si rien : « introuvable ».
5. Un téléphone doit être au format « 05 53 00 00 00 ». Donne le numéro du MAGASIN ou de l'ÉTABLISSEMENT, jamais celui du siège ni un numéro surtaxé. Sinon « introuvable ».
6. Vérifie que l'établissement est bien dans le département indiqué et qu'il existe encore. Sinon dis-le dans « remarque ».
7. Écris en français correct, avec les accents. Pas de tiret long ni demi-cadratin (utilise un tiret simple), pas de lien en format Markdown, pas de balises de type « entity[...] » ni « utm_source ».
8. Ne change pas les noms ni les identifiants.

FORMAT DE RÉPONSE (obligatoire, un seul bloc de code, une ligne par fiche, colonnes séparées par « | », aucune autre ligne dans le bloc) :
id | téléphone | site de l'établissement | page de recrutement | page | état | remarque

« état » : « confirmé », « corrigé », « ajouté » (la case était vide et tu l'as trouvée), « introuvable » ou « fermé ».
Après le bloc, ajoute une courte liste « Ce que je n'ai pas pu vérifier » si besoin. Réponds seulement « Prêt » à ce message : je t'enverrai ensuite les lots un par un.
```

## Lot 41 : employeurs, Administration, collectivités et protection sociale (1 sur 2), 15 fiches

```
Lot 41. Vérifie ces 15 employeurs (secteur : Administration, collectivités et protection sociale). Réponds au format demandé, dans un seul bloc de code.

grand-perigueux | Grand Périgueux | Périgueux:255 Rue Martha Desrumaux, 24000 Périgueux | téléphone donné : 05 53 35 86 00 | site donné : https://www.grandperigueux.fr | page de recrutement donnée : https://www.grandperigueux.fr/votre-agglo/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
cc-sarlat-perigord-noir | Communauté de communes Sarlat-Périgord Noir | Sarlat-la-Canéda:Place Marc Busson, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 31 90 10 | site donné : https://www.cc-sarlatperigordnoir.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
fiducial-dordogne | FIDUCIAL Expertise | Périgueux:24000 Périgueux ; Bergerac:24100 Bergerac ; Sarlat-la-Canéda:24200 Sarlat-la-Canéda | téléphone donné : aucun | site donné : https://www.fiducial.fr | page de recrutement donnée : https://recrutement.fiducial.fr | à vérifier : téléphone absent
in-extenso-dordogne | In Extenso | Boulazac Isle Manoire:24750 Boulazac Isle Manoire ; Bergerac:24100 Bergerac | téléphone donné : aucun | site donné : https://www.inextenso.fr | page de recrutement donnée : https://recrute.inextenso.fr | à vérifier : téléphone absent
agc-dordogne | AGC Dordogne | Coulounieix-Chamiers:24750 Coulounieix-Chamiers | téléphone donné : 05 53 03 70 70 | site donné : https://www.agc24.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
harmonie-mutuelle-dordogne | Harmonie Mutuelle | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.harmonie-mutuelle.fr | page de recrutement donnée : https://recrutement.harmonie-mutuelle.fr | à vérifier : adresse précise absente, téléphone absent
saint-junien-mairie | Ville de Saint-Junien | Saint-Junien:2 Place Auguste Roche, 87200 Saint-Junien | téléphone donné : 05 55 43 06 80 | site donné : https://www.saint-junien.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
panazol-mairie | Ville de Panazol | Panazol:Place de la République, 87350 Panazol | téléphone donné : 05 55 06 47 70 | site donné : https://www.panazol.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
saint-yrieix-mairie | Ville de Saint-Yrieix-la-Perche | Saint-Yrieix-la-Perche:45 Boulevard de l'Hôtel de Ville, 87500 Saint-Yrieix-la-Perche | téléphone donné : 05 55 08 88 88 | site donné : https://www.saint-yrieix.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cc-elan-limousin-avenir-nature | Communauté de communes ELAN Limousin Avenir Nature | Ambazac:13 Rue Gay-Lussac, 87240 Ambazac | téléphone donné : 05 55 56 66 60 | site donné : https://www.elanlimousin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cc-haut-limousin-en-marche | Communauté de communes Haut Limousin en Marche | Bellac:12 Avenue Jean Jaurès, 87300 Bellac ; Le Dorat:Maison de l'Intercommunalité | téléphone donné : 05 55 60 09 99 | site donné : https://www.hautlimousinenmarche.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cc-porte-oceane-limousin | Communauté de communes Porte Océane du Limousin | Saint-Junien:1 Avenue Voltaire, 87200 Saint-Junien | téléphone donné : 05 55 02 14 60 | site donné : https://www.porteoceane-dulimousin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cerfrance-centre-limousin | Cerfrance Centre Limousin | Limoges: ; Saint-Junien: ; Bellac: ; Saint-Yrieix-la-Perche: ; Eymoutiers: | téléphone donné : 05 55 10 37 00 | site donné : https://www.cerfrance.fr | page de recrutement donnée : https://recrutement.cerfrance.fr | à vérifier : adresse précise absente
fiducial-haute-vienne | FIDUCIAL Expertise | Limoges: ; Saint-Junien: ; Saint-Yrieix-la-Perche: | téléphone donné : aucun | site donné : https://www.fiducial.fr | page de recrutement donnée : https://recrutement.fiducial.fr | à vérifier : adresse précise absente, téléphone absent
in-extenso-haute-vienne | In Extenso Limoges | Limoges:Rue Amédée Gordini, 87280 Limoges | téléphone donné : aucun | site donné : https://www.inextenso.fr | page de recrutement donnée : https://recrute.inextenso.fr | à vérifier : téléphone absent
```

## Lot 42 : employeurs, Administration, collectivités et protection sociale (2 sur 2), 15 fiches

```
Lot 42. Vérifie ces 15 employeurs (secteur : Administration, collectivités et protection sociale). Réponds au format demandé, dans un seul bloc de code.

kpmg-limoges | KPMG | Limoges:31 Avenue Baudin, 87000 Limoges | téléphone donné : aucun | site donné : https://kpmg.com/fr | page de recrutement donnée : https://kpmg.com/fr/fr/home/carrieres.html | à vérifier : téléphone absent
exco-haute-vienne | EXCO Valliance | Limoges:Parc Ester Technopole, 87069 Limoges | téléphone donné : 05 55 04 34 34 | site donné : https://www.exco.fr | page de recrutement donnée : https://www.exco.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
harmonie-mutuelle-haute-vienne | Harmonie Mutuelle | Limoges: ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.harmonie-mutuelle.fr | page de recrutement donnée : https://recrutement.harmonie-mutuelle.fr | à vérifier : adresse précise absente, téléphone absent
caf-haute-vienne | CAF de la Haute-Vienne | Limoges:22 Rue Marcel Brunet, 87000 Limoges | téléphone donné : aucun | site donné : https://www.caf.fr | page de recrutement donnée : https://www.lasecurecrute.fr | à vérifier : téléphone absent
cpam-haute-vienne | CPAM de la Haute-Vienne | Limoges:22 Avenue Jean Gagnant, 87000 Limoges | téléphone donné : aucun | site donné : https://www.ameli.fr | page de recrutement donnée : https://www.lasecurecrute.fr | à vérifier : téléphone absent
urssaf-limousin | URSSAF Limousin | Limoges:25 Rue Camille Pelletan, 87000 Limoges | téléphone donné : aucun | site donné : https://www.urssaf.fr | page de recrutement donnée : https://www.urssaf.org/recrutement | à vérifier : téléphone absent
cci-haute-vienne | CCI Limoges et Haute-Vienne | Limoges:16 Place Jourdan, 87000 Limoges | téléphone donné : 05 55 45 15 15 | site donné : https://www.limoges.cci.fr | page de recrutement donnée : https://www.limoges.cci.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
chambre-metiers-haute-vienne | CMA Nouvelle-Aquitaine - Haute-Vienne | Limoges:12 Avenue Garibaldi, 87000 Limoges | téléphone donné : aucun | site donné : https://www.artisanat-nouvelle-aquitaine.fr | page de recrutement donnée : https://www.artisanat-nouvelle-aquitaine.fr/recrutement | à vérifier : téléphone absent
malakoff-humanis-limoges | Malakoff Humanis | Limoges:6 Rue Bernard Lathière, 87000 Limoges | téléphone donné : aucun | site donné : https://www.malakoffhumanis.com | page de recrutement donnée : https://carrieres.malakoffhumanis.com | à vérifier : téléphone absent
mgen-haute-vienne | MGEN Haute-Vienne | Limoges:18 Rue Fitz-James, 87000 Limoges | téléphone donné : aucun | site donné : https://www.mgen.fr | page de recrutement donnée : https://recrutement.mgen.fr | à vérifier : téléphone absent
hebert-et-associes | Hébert et Associés | Limoges:25 Place Jourdan, 87000 Limoges | téléphone donné : 05 55 32 01 85 | site donné : https://www.hebert-associes.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cabinet-bauriaud-associes | CBA Cabinet Bauriaud Associés | Limoges:26 Rue Atlantis, 87280 Limoges | téléphone donné : 05 55 10 22 00 | site donné : https://www.cbacabinet.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
acec-bsr-audit | ACEC BSR Audit | Limoges:4 Allée Duke Ellington, 87100 Limoges | téléphone donné : 05 87 41 84 07 | site donné : https://www.acec.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
secaut | Secaut SA | Limoges:27 Boulevard Victor Hugo, 87000 Limoges | téléphone donné : 05 55 34 51 99 | site donné : https://www.secaut.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cabinet-muriel-bellegarde | Cabinet Muriel Bellegarde | Limoges:309 Avenue Baudin, 87000 Limoges | téléphone donné : 05 55 05 00 78 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 43 : employeurs, Agriculture, paysage et nature (1 sur 3), 15 fiches

```
Lot 43. Vérifie ces 15 employeurs (secteur : Agriculture, paysage et nature). Réponds au format demandé, dans un seul bloc de code.

gamm-vert-perigourdine | Gamm Vert (La Périgourdine) | Bergerac: ; Boulazac Isle Manoire: ; Ribérac: ; Sarlat-la-Canéda: ; Thiviers: ; Montpon-Ménestérol: ; Lalinde: ; Le Bugue: | téléphone donné : aucun | site donné : https://laperigourdine.com | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
perigord-bois-energie | Périgord Bois Énergie | Saint-Laurent-des-Hommes:ZA Les Mauries | téléphone donné : 05 53 81 61 70 | site donné : https://laperigourdine.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
sarl-pepinieres-laplace | Pépinières Laplace | Le Buisson-de-Cadouin:Route de Siorac | téléphone donné : 05 53 22 31 82 | site donné : https://www.pepinieres-laplace.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pepinieres-du-perigord | Pépinières du Périgord | Douville:Le Bourg | téléphone donné : 05 53 81 50 18 | site donné : https://www.pepinieresduperigord.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
rousseau-paysage | Rousseau Paysage | Coulounieix-Chamiers:ZA | téléphone donné : 05 53 08 14 40 | site donné : https://www.rousseau-paysage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
daniel-moquet-dordogne | Daniel Moquet Signe Vos Jardins | Marsac-sur-l'Isle: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.daniel-moquet.com | page de recrutement donnée : https://www.daniel-moquet.com/recrutement | à vérifier : adresse précise absente, téléphone absent
idverde-dordogne | idverde | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.idverde.fr | page de recrutement donnée : https://www.idverde.fr/recrutement | à vérifier : téléphone absent
serpe-dordogne | Serpe | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.serpe.fr | page de recrutement donnée : https://www.serpe.fr/recrutement | à vérifier : téléphone absent
unisylva-dordogne | Unisylva | Boulazac Isle Manoire:Antenne Dordogne | téléphone donné : aucun | site donné : https://www.unisylva.fr | page de recrutement donnée : https://www.unisylva.fr/recrutement | à vérifier : téléphone absent
ocealia-haute-vienne | Océalia | Limoges:41 Rue Auguste Comte, 87280 Limoges | téléphone donné : aucun | site donné : https://www.ocealia-groupe.com | page de recrutement donnée : https://www.ocealia-groupe.com/recrutement | à vérifier : téléphone absent
farago-haute-vienne | Farago Haute-Vienne | Limoges:13-15 Rue Auguste Comte, 87280 Limoges | téléphone donné : 05 55 04 64 00 | site donné : https://www.farago.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ecoovi | ECOOVI | Peyrat-de-Bellac:Zone Artisanale Saint-Ouen, 87300 Peyrat-de-Bellac | téléphone donné : 05 55 68 62 84 | site donné : https://www.ecoovi.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-service-du-paysage | Au Service du Paysage | Boisseuil:4 Allée des Champs, 87220 Boisseuil | téléphone donné : 05 55 72 11 88 | site donné : https://www.auservicedupaysage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
avenir-paysage-87 | Avenir Paysage 87 | Verneuil-sur-Vienne:2 Route de Mallevialle, 87430 Verneuil-sur-Vienne | téléphone donné : 05 32 74 96 47 | site donné : https://www.avenirpaysage87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
limousin-paysage | Limousin Paysage | Couzeix:1 Rue d'Anglard, 87270 Couzeix | téléphone donné : 05 55 36 74 59 | site donné : https://www.limousin-paysage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 44 : employeurs, Agriculture, paysage et nature (2 sur 3), 15 fiches

```
Lot 44. Vérifie ces 15 employeurs (secteur : Agriculture, paysage et nature). Réponds au format demandé, dans un seul bloc de code.

gauquie-paysage | E. Gauquié Paysage | Saint-Just-le-Martel:ZA de Bonnefont, 87590 Saint-Just-le-Martel | téléphone donné : 05 55 30 48 32 | site donné : https://www.gauquie-paysage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jardin-plaisance | Le Jardin de Plaisance | Le Vigen:Plaisance, 87110 Le Vigen | téléphone donné : 05 55 00 46 47 | site donné : https://www.lejardindeplaisance.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
horticulture-delage | Horticulture Delage | Panazol:23 Avenue Léon Blum, 87350 Panazol | téléphone donné : 05 55 30 67 49 | site donné : https://www.horticulture-delage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pepiniere-chapelle | Pépinière de la Chapelle | Isle:1 Avenue des Courrières, 87170 Isle | téléphone donné : 05 55 50 70 72 | site donné : https://www.pepinieredelachapelle.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pepiplant | Pépiplant Olivier Giraud | Chaptelat:45 Rue des Forges, 87270 Chaptelat | téléphone donné : 06 66 53 55 72 | site donné : https://www.pepiplant.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pepiniere-pres-du-chiron | Pépinière Les Prés du Chiron | Saint-Sornin-la-Marche:Le Chiron, 87210 Saint-Sornin-la-Marche | téléphone donné : 06 10 48 74 39 | site donné : https://www.lespresduchiron.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
geiq-agri-limousin-perigord | GEIQ Agri Limousin Périgord | Limoges:1 Impasse Sainte-Claire, 87000 Limoges | téléphone donné : 05 55 49 85 76 | site donné : https://www.geiqagri.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
thibaut-paysage | Thibaut Paysage SARL | Limoges:8 Rue Colonel Rol-Tanguy, 87000 Limoges | téléphone donné : 06 01 81 23 75 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jardin-vanteaux | Le Jardin de Vanteaux | Limoges:90 Rue Victorien Sardou, 87000 Limoges | téléphone donné : 05 55 01 42 95 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chlorophylle-condat | Chlorophylle Horticulture Germain Joncheray | Condat-sur-Vienne:Le Grand Pré, 87920 Condat-sur-Vienne | téléphone donné : 05 55 31 08 52 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
puygrenier-centre-vert | Puygrenier Agriculture Centre Vert | Glandon:Le Bourg, 87500 Glandon | téléphone donné : 05 55 75 99 06 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
serra-paysage | Serra Paysage | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.serra-paysage.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
ets-jaladi | Établissements Jaladi | Salignac-Eyvigues:Avenue de Sarlat, 24590 Salignac-Eyvigues ; Boulazac Isle Manoire:Saint-Laurent-sur-Manoire | téléphone donné : 05 53 28 81 00 | site donné : https://www.etsjaladi.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
herbelys | Herbelys | Cheissoux:1 Chemin des Suais, 87460 Cheissoux | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
les-serres-du-ponteix | Les Serres du Ponteix | Feytiat:Le Ponteix, 87220 Feytiat | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
```

## Lot 45 : employeurs, Agriculture, paysage et nature (3 sur 3), 2 fiches

```
Lot 45. Vérifie ces 2 employeurs (secteur : Agriculture, paysage et nature). Réponds au format demandé, dans un seul bloc de code.

les-serres-de-ventadour | Les Serres de Ventadour | Solignac:87110 Solignac | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
dupuy-sarl-pepinieres | Dupuy SARL | Saint-Yrieix-la-Perche:Zone Industrielle Bourdelas, 87500 Saint-Yrieix-la-Perche | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
```

## Lot 46 : employeurs, Métiers animaliers (1 sur 2), 15 fiches

```
Lot 46. Vérifie ces 15 employeurs (secteur : Métiers animaliers). Réponds au format demandé, dans un seul bloc de code.

cvga-gour-arche | Clinique vétérinaire du Gour de l'Arche | Périgueux:247 Route d'Angoulême, 24000 | téléphone donné : 05 53 08 69 01 | site donné : https://www.capveto.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
animalis-montpon | Clinique Vétérinaire Animalis | Montpon-Ménestérol:Route de Bordeaux, 24700 | téléphone donné : 05 53 80 28 78 | site donné : https://www.capveto.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
spa-dordogne | Société Protectrice des Animaux Dordogne | Marsac-sur-l'Isle:1 Route de Bordeaux, 24430 | téléphone donné : 05 53 04 16 54 | site donné : https://spa24bergerac.org | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
spa24-bergerac | SPA24 Bergerac | Bergerac:51 Boulevard Albert Claveille, 24100 | téléphone donné : 05 53 73 40 95 | site donné : https://spa24bergerac.org | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
royaume-espoir-calin | Au Royaume de l'Espoir CA-LIN | Bassillac et Auberoche:2525 Route de Born, 24330 | téléphone donné : 06 28 47 57 22 | site donné : https://www.association-calin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
parc-sauvage | Le Parc Sauvage | La Tour-Blanche-Cercles:194 Chemin du Moulin à Vent, 24320 | téléphone donné : 07 66 79 42 84 | site donné : https://www.parcsauvage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
parc-du-thot | Parc du Thot | Thonac:24290 Thonac | téléphone donné : 05 53 50 70 44 | site donné : https://www.lascaux.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
zoo-refuge-mescoules | Zoo Refuge de Mescoules | Mescoules:227 Allée Paul de Chadois, 24240 | téléphone donné : 06 80 77 38 74 | site donné : https://www.zoorefugedemescoules.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
spa-haute-vienne | SPA de la Haute-Vienne | Couzeix:156 Avenue du Général René Chambe, 87270 | téléphone donné : 05 55 48 06 75 | site donné : https://spa-limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-sablard | Clinique Vétérinaire du Sablard | Limoges:158 Avenue du Sablard, 87000 | téléphone donné : 05 55 30 70 10 | site donné : https://www.veterinaire-sablard.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-beaublanc | Clinique Vétérinaire Beaublanc | Limoges:79 Rue de Bellac, 87100 | téléphone donné : 05 55 79 07 76 | site donné : https://www.veterinaire-beaublanc.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-sirius | Clinique Sirius | Couzeix:2 Rue de Bourdelas, 87270 | téléphone donné : 05 55 10 70 20 | site donné : https://www.cliniquesirius.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-palais | Clinique Vétérinaire du Palais | Le Palais-sur-Vienne:3 Rue Gustave Eiffel, 87410 | téléphone donné : 05 55 35 43 99 | site donné : https://www.veterinairedupalais.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
zoo-reynou | Parc Zoo du Reynou | Le Vigen:1 Domaine du Reynou, 87110 | téléphone donné : 05 55 00 40 00 | site donné : https://www.reynou.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
elephant-haven | Elephant Haven European Elephant Sanctuary | Bussière-Galant:5 Retabout, 87230 | téléphone donné : 07 82 62 55 01 | site donné : https://www.elephanthaven.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 47 : employeurs, Métiers animaliers (2 sur 2), 11 fiches

```
Lot 47. Vérifie ces 11 employeurs (secteur : Métiers animaliers). Réponds au format demandé, dans un seul bloc de code.

refuge-filemon | Refuge de Filémon | Val-d'Issoire:Moulin du Clair, 87330 | téléphone donné : aucun | site donné : https://www.refugedefilemon.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
clinique-louyat | Clinique Vétérinaire de Louyat | Limoges:153 Avenue de Louyat, 87000 | téléphone donné : 05 55 37 49 07 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cabinet-armand-dutreix | Cabinet Vétérinaire Armand Dutreix | Limoges:123 Rue Armand Dutreix, 87000 | téléphone donné : 05 55 50 27 87 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cabinet-les-moustaches | Cabinet vétérinaire Les Moustaches | Chaptelat:37 Rue Saint-Eloi, 87270 | téléphone donné : 05 55 32 08 53 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
panaveto-panazol | Clinique Vétérinaire Panaveto | Panazol:9 Rue des Vignes, 87350 | téléphone donné : 05 55 31 64 89 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-veterinaire-ambazac | Clinique vétérinaire d'Ambazac | Ambazac:1 Avenue des Roses, 87240 | téléphone donné : 05 55 56 60 18 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinique-arsonval | Clinique d'Arsonval | Saint-Yrieix-la-Perche:6-8 Avenue du Général Charles de Gaulle, 87500 | téléphone donné : 05 55 75 07 95 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
groupement-veterinaire-saint-leonard | Groupement Vétérinaire | Saint-Léonard-de-Noblat:27 Rue Jean Moulin, 87400 | téléphone donné : 05 55 56 02 15 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
erina | Association ERINA - Centre de soins pour les mammifères sauvages | Razès:9 Rue de la Libération, 87640 | téléphone donné : 07 44 95 08 99 | site donné : https://www.associationerina.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
sos-faune-sauvage | SOS Faune Sauvage | Verneuil-sur-Vienne:L'Écho, 87430 | téléphone donné : 07 78 07 11 23 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
galop-pour-la-vie | Galop Pour La Vie | Bellac:Grange des Selles, 87300 | téléphone donné : 06 80 02 99 94 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 48 : employeurs, Artisanat (menuiserie, porcelaine, métiers d’art) (1 sur 3), 15 fiches

```
Lot 48. Vérifie ces 15 employeurs (secteur : Artisanat (menuiserie, porcelaine, métiers d’art)). Réponds au format demandé, dans un seul bloc de code.

menuiseries-seguy | Menuiseries Seguy | Montignac-Lascaux:496 Route de Condat, 24290 | téléphone donné : 05 53 51 71 71 | site donné : https://www.menuiseries-seguy.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ouvertures-perigourdines | Ouvertures Périgourdines | Périgueux:1 Allée du Port, 24000 | téléphone donné : 05 53 13 58 62 | site donné : https://www.ouvertures-perigourdines.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
scomebat | SCO.ME.BAT Coopérative des Menuisiers du Bâtiment | Ribérac:1 Route de Périgueux, 24600 | téléphone donné : 05 53 90 18 50 | site donné : https://www.scomebat.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
marty-menuiseries-miroiteries | Marty Menuiseries Miroiteries | Champagnac-de-Belair:ZA Les Granges, 24530 | téléphone donné : 05 53 56 44 28 | site donné : https://www.marty-menuiseries.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
foissac-fermetures | Foissac Fermetures | Sarlat-la-Canéda:1604 Avenue du Périgord, 24200 ; Bergerac: ; Trélissac: | téléphone donné : 05 53 59 06 66 | site donné : https://www.foissac-fermetures.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
passion-dautrefois | Passion d'Autrefois | Saint-Laurent-des-Vignes:50 Route de Bordeaux, 24100 | téléphone donné : 05 53 24 07 33 | site donné : https://www.passion-dautrefois.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
latelier-du-perigord | L'Atelier du Périgord | Ménesplet:67 Rue du Stade, 24700 | téléphone donné : 06 75 47 05 12 | site donné : https://www.latelierduperigord.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
peny-ebenisterie | PENY Ébénisterie Menuiserie Agencement | Gardonne:414 Chemin des Grands Champs, 24680 | téléphone donné : 06 79 58 20 05 | site donné : https://www.peny-ebenisterie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
rebinguet-freres | Rebinguet Frères | Ginestet: | téléphone donné : aucun | site donné : https://www.rebinguet.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
lp-menuiserie | LP Menuiserie | Castelnaud-la-Chapelle: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
atelier-ferignac | Ateliers Férignac | Hautefort:La Gare, 24390 | téléphone donné : 05 53 51 72 72 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-saint-agnan | Atelier Saint-Agnan | Hautefort:1491 Avenue de l'Europe, 24390 | téléphone donné : 09 71 50 12 87 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
menuiserie-raynal | Menuiserie Raynal | Coulounieix-Chamiers:42 Boulevard Jean Moulin, 24660 | téléphone donné : 05 53 04 20 75 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maurice-faure-menuiseries | Maurice Faure Menuiseries | Limoges:24 Rue Léonard Samie, ZI Romanet, 87000 | téléphone donné : 05 55 37 11 44 | site donné : https://www.maurice-faure.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
naudon-mathe-freres | Naudon Mathé Frères | Limoges:2 Rue Guy Môquet, 87280 | téléphone donné : 05 55 77 11 89 | site donné : https://www.naudon-mathe.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 49 : employeurs, Artisanat (menuiserie, porcelaine, métiers d’art) (2 sur 3), 15 fiches

```
Lot 49. Vérifie ces 15 employeurs (secteur : Artisanat (menuiserie, porcelaine, métiers d’art)). Réponds au format demandé, dans un seul bloc de code.

isol-eco | Isol-Eco | Feytiat:Allée de la Porcelaine, 87220 | téléphone donné : 05 55 31 88 76 | site donné : https://www.isol-eco.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
leclerc-menuiseries | Leclerc Menuiseries | Isle:24 Avenue de Mérignac, 87170 | téléphone donné : 05 55 39 49 59 | site donné : https://www.leclerc-menuiseries.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
slmc | Société Limousine de Menuiserie Charpente (SLMC) | Limoges:Beauvais, 87000 | téléphone donné : 05 55 35 33 63 | site donné : https://www.slmc87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mandonnaud-menuiserie | SARL Mandonnaud Menuiserie | Limoges:31 Rue Pierre Loti, 87100 | téléphone donné : 05 55 77 23 11 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
inertia-menuiseries | Inertia Menuiseries | Limoges: | téléphone donné : aucun | site donné : https://www.inertia-menuiseries.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
menuiserie-de-la-maulde | Menuiserie de la Maulde | Bujaleuf: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
atelier-parot | Lo'Talhier - Atelier Parot SARL | Saint-Jean-Ligoure:195 Chabreloutre, 87260 | téléphone donné : 05 55 00 45 90 | site donné : https://www.lotalhier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
inno-menuiserie | Inno'Menuiserie | Limoges:23 Rue Charles Michels, 87000 | téléphone donné : 05 35 55 59 15 | site donné : https://www.inno-menuiserie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carres-de-lumiere | Carrés de Lumière | Limoges:2 Rue Guy Môquet, 87280 | téléphone donné : 05 55 79 46 91 | site donné : https://www.carresdelumiere.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-barbabois | L'Atelier Barbabois | Saint-Yrieix-sous-Aixe:150 Impasse des Combeaux, 87700 | téléphone donné : 06 03 69 08 10 | site donné : https://www.atelierbarbabois.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pascal-couture | CIDJI Fam Atelier de Stylisme Modélisme | Limoges:32 Rue Maryse Bastié, 87100 | téléphone donné : 06 17 12 30 18 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-isa | Atelier d'ISA | Limoges:15 Rue Éric Tabarly, 87100 | téléphone donné : 05 55 05 98 97 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
coud-fil | Coud'Fil | Limoges:23 Avenue du Maréchal de Lattre-de-Tassigny, 87000 | téléphone donné : 07 83 52 20 51 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
haviland | Haviland | Limoges:40 Rue Donzelot, 87000 | téléphone donné : 05 55 33 27 27 | site donné : https://haviland.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jl-coquet | JL Coquet | Saint-Léonard-de-Noblat:Le Ponteix, 87400 | téléphone donné : 05 55 56 50 55 | site donné : https://jlcoquet.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 50 : employeurs, Artisanat (menuiserie, porcelaine, métiers d’art) (3 sur 3), 6 fiches

```
Lot 50. Vérifie ces 6 employeurs (secteur : Artisanat (menuiserie, porcelaine, métiers d’art)). Réponds au format demandé, dans un seul bloc de code.

raynaud | Raynaud | Limoges:14 Avenue du Président Vincent Auriol, 87100 | téléphone donné : 05 55 10 18 18 | site donné : https://www.raynaud.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
deshoulieres | Deshoulières | Limoges:bureau commercial | téléphone donné : aucun | site donné : https://www.deshoulieres.com | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
atelier-arquie | Ateliers Arquié | Limoges:230 Avenue Baudin, 87000 | téléphone donné : 05 55 34 40 52 | site donné : https://www.ateliersarquie.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
emaux-cheron | Émaux Chéron | Limoges:9 Rue de la Courtine, 87000 | téléphone donné : 05 55 33 18 91 | site donné : https://www.emauxcheron.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-desmetiers | Atelier des Métiers d'Art Hazard | Limoges: | téléphone donné : aucun | site donné : https://www.ateliershazard.com | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
porcelaine-carpenet | Carpenet Porcelaine | Limoges: | téléphone donné : 05 55 77 61 61 | site donné : https://www.carpenet.com | page de recrutement donnée : aucune | à vérifier : adresse précise absente, page de recrutement absente
```

## Lot 51 : employeurs, Artisanat des métiers de bouche (1 sur 3), 15 fiches

```
Lot 51. Vérifie ces 15 employeurs (secteur : Artisanat des métiers de bouche). Réponds au format demandé, dans un seul bloc de code.

sps-salaisons | Société Périgourdine de Salaisons (SPS) | Boulazac Isle Manoire:Allée Jacques Duclos, 24750 | téléphone donné : 05 53 02 66 66 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maison-lissajoux | Maison Lissajoux | Sarlat-la-Canéda:8 Avenue du Général Leclerc, 24200 | téléphone donné : 05 53 29 14 40 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-fournil-de-la-cite | SARL Au Fournil de la Cité | Périgueux:11 Place de la Cité, 24000 | téléphone donné : 05 53 53 41 03 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
antoine-girard | Antoine Girard Pâtisserie Boulangerie | Périgueux:41 Bis Boulevard de Stalingrad, 24000 | téléphone donné : 05 53 53 41 04 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-fournil-de-benjamin | Au Fournil de Benjamin | Périgueux:70 Rue Clos Chassaing, 24000 | téléphone donné : 05 53 53 38 83 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-tour-des-traditions | Au Tour des Traditions | Sanilhac:Espace Couture, 24660 | téléphone donné : 05 53 08 63 35 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maison-carre | Maison Carré | Castelnaud-la-Chapelle:Place de Tournepique, 24250 | téléphone donné : 05 53 59 33 90 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-fellner | Boulangerie-Pâtisserie Fellner | La Douze:Bourg, 24330 | téléphone donné : 05 53 06 71 40 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-eytier | Boulangerie Eytier | Mareuil en Périgord:Route de la Sandonie, 24340 | téléphone donné : 05 53 56 94 52 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ami-du-pain-eric-perrier | L'Ami du Pain Éric Perrier | Saint-Vincent-de-Connezac:24190 | téléphone donné : 05 53 90 57 30 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
charcuterie-vaux | Charcuterie de Campagne Vaux | Sarlat-la-Canéda:Avenue de Madrazes, 24200 | téléphone donné : 05 53 59 23 57 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
gbs-boucherie-charcuterie | GBS Boucherie Charcuterie | Sarlat-la-Canéda:36 Avenue Gambetta, 24200 | téléphone donné : 05 53 59 13 39 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
charcuterie-christophe-orteil | Charcuterie Traiteur Christophe Orteil | Périgueux:67 Rue Roger Barnalier, 24000 | téléphone donné : 05 53 53 18 61 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maison-simoens | Maison Simoens FMG | Coursac:6 Route de Maraval, 24430 | téléphone donné : 05 53 54 60 40 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
charcuterie-anthony-filet | Charcuterie Traiteur Anthony Filet | Bergerac:6 Rue Sainte-Catherine, 24100 | téléphone donné : 05 53 74 47 24 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 52 : employeurs, Artisanat des métiers de bouche (2 sur 3), 15 fiches

```
Lot 52. Vérifie ces 15 employeurs (secteur : Artisanat des métiers de bouche). Réponds au format demandé, dans un seul bloc de code.

etablissements-coudeyrat | Établissements Coudeyrat | Le Bugue:ZI La Plaine, 24260 | téléphone donné : 05 53 04 44 44 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
lard-du-gout | Lard du Goût SARL | Saint-Pardoux-la-Rivière:5 Grand Rue de la Barre, 24470 | téléphone donné : 05 53 56 47 10 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
servolle-charcuterie | Servolle Jean-Jacques | Saint-Chamassy:Falgueyrat, 24260 | téléphone donné : 05 53 24 20 03 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chez-arnaud | Chez Arnaud | Périgueux:39 Boulevard de Stalingrad, 24000 | téléphone donné : 05 53 53 06 01 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
les-gourmandises-de-lucco | Les Gourmandises de Lucco | Castels et Bézenac:3364 Route de Beynac, 24220 | téléphone donné : 05 53 29 25 33 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-desem | Boulangerie Desem | Limoges:5 Place Wilson, 87000 | téléphone donné : 09 83 66 41 24 | site donné : https://www.boulangeriedesem.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-vareille | Maison Vareille | Solignac:84 Avenue Saint-Éloi, 87110 | téléphone donné : 05 55 35 13 08 | site donné : https://www.boulangerie-vareille.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
charcuterie-duprat | Charcuterie Duprat | Limoges:15 Rue Ferrerie, 87000 ; Châteauponsac: | téléphone donné : 05 55 34 38 33 | site donné : https://www.charcuterie-duprat-limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
le-caramelia | Le Caramélia | Limoges:Avenue Georges Dumas, 87000 | téléphone donné : 05 55 34 30 66 | site donné : https://www.le-caramelia.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maison-faurie | Maison Faurie | Bessines-sur-Gartempe:6 Rue du Onze Novembre 1918, 87250 | téléphone donné : 05 55 76 00 69 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
deperry | Artisan Boulanger Deperry | Saint-Junien:55 Avenue Henri Barbusse, 87200 | téléphone donné : 05 55 78 83 48 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chez-sylvain-bellac | Chez Sylvain | Limoges:104 Rue de Bellac, 87100 | téléphone donné : 05 55 10 16 93 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chez-sylvain-panazol | Chez Sylvain | Panazol:48 Avenue du Président Sadi Carnot, 87350 | téléphone donné : 05 55 58 74 51 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
patisserie-sainte-therese | Pâtisserie Sainte-Thérèse | Limoges:125 Avenue des Ruchoux, 87100 | téléphone donné : 05 55 77 44 48 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
delices-des-gourmets | Délices des Gourmets | Limoges:37 Bis Place des Carmes, 87000 | téléphone donné : 05 55 34 18 82 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 53 : employeurs, Artisanat des métiers de bouche (3 sur 3), 15 fiches

```
Lot 53. Vérifie ces 15 employeurs (secteur : Artisanat des métiers de bouche). Réponds au format demandé, dans un seul bloc de code.

boulangerie-gavroche | Boulangerie Gavroche | Limoges:13 Place des Bancs, 87000 | téléphone donné : 05 55 34 62 86 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
diablotin | Le Diablotin | Limoges:229 Rue François Perrin, 87000 | téléphone donné : 05 55 32 94 69 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
tournepains | Tournepains | Bosmie-l'Aiguille:9 Avenue de la Vienne, 87110 | téléphone donné : 05 55 39 04 34 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
coignac | Coignac SAS | Saint-Léonard-de-Noblat:22 Avenue du Maréchal Foch, 87400 | téléphone donné : 05 55 56 03 76 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chez-many | Chez Many | Veyrac:58 Route de Saint-Junien la Barre, 87520 | téléphone donné : 09 83 88 58 67 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
la-cerise-sur-le-gateau | La Cerise sur le Gâteau | Limoges:139 Avenue de Louyat, 87100 | téléphone donné : 05 55 37 30 99 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chez-renard | Chez Renard | Limoges:21 Rue Lansecot, 87000 | téléphone donné : 06 58 61 53 99 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-sylvain-chatenet | Boulangerie Sylvain Chatenet | Limoges:15 Avenue Dominique Larrey, 87000 ; Feytiat:2 Allée d'Italie, 87220 | téléphone donné : 05 55 30 96 94 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pain-et-tradition-france | Pain et Tradition de France | Limoges:34 Boulevard du Mas Bouyol, 87000 | téléphone donné : 09 80 58 80 13 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-fin-palais | Au Fin Palais | Limoges:1 Avenue du Général Leclerc, 87100 | téléphone donné : 05 55 77 28 67 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pascalain | Pascalain SARL | Feytiat:6 Rue Clément Ader, 87220 | téléphone donné : 05 55 30 83 99 | site donné : https://www.pascalain.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
les-beigneurs | Les Beigneurs | Limoges:2 Rue Dalesme, 87000 | téléphone donné : 05 55 32 52 64 | site donné : https://www.lesbeigneurs.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
maison-mg | Maison MG | Isle:24 Rue du Général de Gaulle, 87170 | téléphone donné : 05 55 08 10 28 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
a-la-foret-noire | A La Forêt Noire | Limoges:241 Rue de Toulouse, 87000 | téléphone donné : 05 55 30 49 04 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
boulangerie-sainte-claire | Boulangerie Pâtisserie Sainte Claire | Limoges:15 Rue de Bellac, 87100 | téléphone donné : 05 55 78 26 46 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 54 : employeurs, Automobile et contrôle technique (1 sur 3), 15 fiches

```
Lot 54. Vérifie ces 15 employeurs (secteur : Automobile et contrôle technique). Réponds au format demandé, dans un seul bloc de code.

parot | Groupe PAROT | Trélissac:11 Avenue de l'Automobile ; Trélissac:29 Avenue de l'Automobile ; Bergerac:Route d'Agen ; Bergerac:Zone de la Cavaille | téléphone donné : 05 53 02 35 50 | site donné : https://www.groupe-parot.com | page de recrutement donnée : https://carrieres.groupe-parot.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
jean-lagarde | Groupe Jean Lagarde | Trélissac:11 Avenue de l'Automobile ; Bergerac:Route de Bordeaux | téléphone donné : 05 53 02 35 50 | site donné : https://www.jeanlagarde.fr | page de recrutement donnée : https://www.jeanlagarde.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
peugeot-clara-dordogne | Clara Automobiles Peugeot | Trélissac:24750 Trélissac ; Bergerac:24100 Bergerac | téléphone donné : aucun | site donné : https://www.clara-automobiles.com | page de recrutement donnée : https://www.clara-automobiles.com/recrutement | à vérifier : téléphone absent
toyota-clara-dordogne | Toyota Clara Automobiles | Trélissac:24750 Trélissac | téléphone donné : aucun | site donné : https://www.clara-automobiles.com | page de recrutement donnée : https://www.clara-automobiles.com/recrutement | à vérifier : téléphone absent
jeammet-automobiles | Jeammet Automobiles | Coulounieix-Chamiers:106 Avenue du Général de Gaulle, 24660 Coulounieix-Chamiers | téléphone donné : aucun | site donné : https://www.jeammetautomobiles.com | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
de-guglielmi-ad | Garage de Guglielmi AD | Trélissac:54 Avenue Michel Grandou, 24750 Trélissac | téléphone donné : 05 53 53 40 12 | site donné : https://www.garagedeguglielmi.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centrale-auto-marche | Centrale Auto Marché | Saint-Médard-de-Mussidan:2 Rue des Potiers, Rond-Point des Manieux, 24400 Saint-Médard-de-Mussidan | téléphone donné : 05 53 81 81 99 | site donné : https://www.centraleautomarche.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
garage-lacombe | Garage Lacombe | Sarlat-la-Canéda:101 Avenue de Selves, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 59 00 93 | site donné : https://www.garage-lacombe.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
garage-antoine | Garage Antoine | Sarlat-la-Canéda:Les Vignasses ZAE du Périgord Noir, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 29 27 68 | site donné : https://www.garage-antoine.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
clinic-auto | Clinic Auto | Sarlat-la-Canéda:1813 Route de Souillac, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 30 55 72 | site donné : https://www.clinic-auto.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carrosserie-bardot | Carrosserie Bardot | Chancelade:ZA Sol de Dime, 24650 Chancelade | téléphone donné : 05 53 04 58 08 | site donné : https://www.carrosserie-bardot.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
an-carrosserie | A.N Carrosserie Bergerac | Creysse:ZAE Portes de la Dordogne, 24100 Creysse | téléphone donné : 06 75 90 33 88 | site donné : https://www.ancarrosserie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carrosserie-gare-grenier | Carrosserie de la Gare Grenier & Fils | Bergerac:26 Rue Alfred de Musset, 24100 Bergerac | téléphone donné : 05 53 57 00 93 | site donné : https://www.carrosserie-grenier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carrossrie-gregory | Carross'rie Gregory | Bergerac:11 Route de la Force, 24100 Bergerac | téléphone donné : 09 81 84 18 51 | site donné : https://www.carrossriegregory.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
autovision-bergerac | Autovision Bergerac | Bergerac:67 Avenue Paul Doumer, 24100 Bergerac | téléphone donné : 05 53 63 08 70 | site donné : https://www.autovision.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 55 : employeurs, Automobile et contrôle technique (2 sur 3), 15 fiches

```
Lot 55. Vérifie ces 15 employeurs (secteur : Automobile et contrôle technique). Réponds au format demandé, dans un seul bloc de code.

autobilan-perigord | Autobilan du Périgord | Coulounieix-Chamiers:970 Route de la Rampinsolle, 24660 Coulounieix-Chamiers | téléphone donné : 05 53 04 29 00 | site donné : https://www.autobilan.org | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
rapidcontrole-perigueux | RapidContrôle Périgueux | Périgueux:8 Boulevard de Stalingrad, 24000 Périgueux | téléphone donné : 05 53 06 48 87 | site donné : https://www.rapidcontrole.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
securitest-neuvic | Sécuritest Neuvic | Neuvic:Théorat Nord, 24190 Neuvic | téléphone donné : 05 53 80 51 62 | site donné : https://www.securitest.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
securitest-saint-front-pradoux | Sécuritest Saint-Front-de-Pradoux | Saint-Front-de-Pradoux:1 Rue de Ribonnat, 24400 Saint-Front-de-Pradoux | téléphone donné : 05 53 82 01 30 | site donné : https://www.securitest.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
faurie-renault-haute-vienne | Groupe Faurie Renault | Limoges:Avenue Louis Armand, 87280 Limoges ; Saint-Junien:Avenue d'Oradour, 87200 Saint-Junien ; Bellac:Route de Poitiers, 87300 Bellac | téléphone donné : 05 55 38 88 88 | site donné : https://www.faurie.fr | page de recrutement donnée : https://recrutement.faurie.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
faurie-opel-limoges | Faurie Motor Centre Limousin Opel | Limoges:Avenue Louis Armand, 87280 Limoges | téléphone donné : 05 55 38 88 88 | site donné : https://www.faurie.fr | page de recrutement donnée : https://recrutement.faurie.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
gros-automobiles | Gros Automobiles | Feytiat:6 Rue Jean Mermoz, 87220 Feytiat | téléphone donné : 05 55 06 25 14 | site donné : https://www.grosautomobiles.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aventi-automobiles | Aventi Automobiles | Limoges:31 Rue Henri Giffard, 87280 Limoges | téléphone donné : 06 66 04 81 22 | site donné : https://www.aventi-automobiles.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-auto-palais | Centre Auto du Palais | Le Palais-sur-Vienne:1 Allée de Maison Rouge, 87410 Le Palais-sur-Vienne | téléphone donné : 05 55 06 92 96 | site donné : https://www.centreautodupalais.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carrosserie-langlade | Carrosserie Langlade | Verneuil-sur-Vienne:69 Rue de Limoges, 87430 Verneuil-sur-Vienne | téléphone donné : 05 55 01 40 49 | site donné : https://www.carrosserie-langlade.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-carrossier-lm | L'Atelier du Carrossier LM | La Geneytouse:36 La Chassagne, 87400 La Geneytouse | téléphone donné : 06 88 26 41 22 | site donné : https://www.atelierducarrossierlm.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
garage-gauthier | Garage Mécanique Carrosserie Gauthier | Vicq-sur-Breuilh:Le Bourg, 87260 Vicq-sur-Breuilh | téléphone donné : 05 55 00 62 78 | site donné : https://www.garage-gauthier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
garage-charbonnier | Garage Carrosserie Charbonnier | Saint-Martin-le-Vieux:Bel Air, 87700 Saint-Martin-le-Vieux | téléphone donné : 05 55 36 02 79 | site donné : https://www.carrosserie-charbonnier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
autosecurite-limoges-dutreix | Autosécurité Limoges Dutreix | Limoges:129 Rue Armand Dutreix, 87000 Limoges | téléphone donné : 05 55 50 66 06 | site donné : https://www.autosecurite.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
autosecurite-limoges-nord | Autosécurité Limoges Nord | Limoges:8 Rue Pierre de Fermat, 87280 Limoges | téléphone donné : 05 55 38 96 86 | site donné : https://www.autosecurite.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 56 : employeurs, Automobile et contrôle technique (3 sur 3), 12 fiches

```
Lot 56. Vérifie ces 12 employeurs (secteur : Automobile et contrôle technique). Réponds au format demandé, dans un seul bloc de code.

autocontrol-limoges | Autocontrol | Limoges:7 Rue Jacques Goddet, 87280 Limoges | téléphone donné : 05 55 50 33 37 | site donné : https://www.autocontrol.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
securitest-limoges-sud | Sécuritest Limoges Sud | Limoges:20 Rue Maurice Rollinat, 87000 Limoges | téléphone donné : 05 55 05 30 30 | site donné : https://www.securitest.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
securitest-le-vigen | Sécuritest Le Vigen | Le Vigen:Le Bas Fauré, 87110 Le Vigen | téléphone donné : 05 55 30 58 58 | site donné : https://www.securitest.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
autosur-aixe | Autosur | Aixe-sur-Vienne:ZAC du Grand Rieux, 87700 Aixe-sur-Vienne | téléphone donné : 05 55 58 81 05 | site donné : https://www.autosur.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
dekra-palais-sur-vienne | DEKRA Contrôle Technique | Le Palais-sur-Vienne:Avenue Jean Giraudoux, 87410 Le Palais-sur-Vienne | téléphone donné : 05 55 04 06 08 | site donné : https://www.dekra-norisko.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ctauto87 | CT Auto 87 | Limoges:4 Rue Amédée Bollée ; Limoges:209 Rue de Toulouse ; Bellac: ; Saint-Junien: ; Panazol: ; Couzeix: ; Eymoutiers: ; Saint-Léonard-de-Noblat: ; Le Dorat: ; Magnac-Laval: ; Oradour-sur-Glane: ; Rochechouart: ; Châlus: ; Nexon: ; Ambazac: ; Bessines-sur-Gartempe: ; Aixe-sur-Vienne: | téléphone donné : 07 81 80 82 58 | site donné : https://ctauto87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cta87-autovision | CTA87 Autovision | Limoges:4 Rue Amédée Bollée ; Limoges:209 Rue de Toulouse | téléphone donné : 05 55 31 32 32 | site donné : https://www.cta87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ad-garages-haute-vienne | Réseau AD Garage | Boisseuil: ; Ambazac: ; Couzeix: ; Eymoutiers: ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.ad.fr | page de recrutement donnée : https://www.ad.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
duval-services-auto | Duval Services Auto Motrio | Bonnac-la-Côte:22 Impasse de Maison Rouge, 87270 Bonnac-la-Côte | téléphone donné : 05 55 36 76 74 | site donné : https://www.motrio.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ld-auto-87 | LD Auto 87 Staff Auto | Couzeix:7 Allée de Frégefond, 87270 Couzeix | téléphone donné : 05 55 69 30 22 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
speedauto-limoges | SpeedAuto | Limoges:3 Boulevard de la Corderie, 87000 Limoges | téléphone donné : 05 55 32 42 79 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
help-auto-limoges | Help Auto | Limoges:18 Rue du Petit Theil, 87280 Limoges | téléphone donné : 05 55 38 13 13 | site donné : https://www.helpauto.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 57 : employeurs, Banque, assurance et immobilier (1 sur 3), 15 fiches

```
Lot 57. Vérifie ces 15 employeurs (secteur : Banque, assurance et immobilier). Réponds au format demandé, dans un seul bloc de code.

credit-agricole-immobilier | Crédit Agricole Services Immobiliers | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.ca-immobilier.fr | page de recrutement donnée : https://groupecreditagricole.jobs | à vérifier : adresse précise absente, téléphone absent
lcl-dordogne | LCL Banque et assurance | Périgueux:1 Place du Général de Gaulle ; Bergerac:8 Place Doublet ; Sarlat-la-Canéda:15 Rue de la République | téléphone donné : aucun | site donné : https://www.lcl.fr | page de recrutement donnée : https://recrutement.lcl.fr | à vérifier : téléphone absent
sg-dordogne | SG | Périgueux:17 Rue du Président Wilson ; Trélissac:235 Avenue Michel Grandou ; Bergerac:64 Rue Neuve d'Argenson ; Sarlat-la-Canéda:39 Rue de la République ; Marsac-sur-l'Isle:35 Rue de Nautours ; Thiviers:36 Rue du Général Lamy | téléphone donné : aucun | site donné : https://particuliers.sg.fr | page de recrutement donnée : https://careers.societegenerale.com | à vérifier : téléphone absent
banque-populaire-aquitaine-centre-atlantique | Banque Populaire Aquitaine Centre Atlantique | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Boulazac Isle Manoire: ; Terrasson-Lavilledieu: ; Ribérac: ; Nontron: | téléphone donné : 05 49 55 67 89 | site donné : https://www.banquepopulaire.fr/aquitaine-centre-atlantique | page de recrutement donnée : https://recrutement.banquepopulaire.fr | à vérifier : adresse précise absente
caisse-epargne-aquitaine-poitou-charentes | Caisse d'Épargne Aquitaine Poitou-Charentes | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Terrasson-Lavilledieu: ; Nontron: ; Ribérac: ; Thiviers: | téléphone donné : aucun | site donné : https://www.caisse-epargne.fr/aquitaine-poitou-charentes | page de recrutement donnée : https://recrutement.caisse-epargne.com | à vérifier : adresse précise absente, téléphone absent
credit-mutuel-sud-ouest | Crédit Mutuel | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Boulazac Isle Manoire: | téléphone donné : aucun | site donné : https://www.creditmutuel.fr | page de recrutement donnée : https://recrutement.creditmutuel.fr | à vérifier : adresse précise absente, téléphone absent
axa-dordogne | AXA Assurance et Banque | Périgueux:Rue du 5e Régiment de Chasseurs ; Bergerac:Rue du Pont Saint-Jean ; Trélissac:Avenue Michel Grandou ; Sarlat-la-Canéda:Impasse du Pontet ; Ribérac:Rue du 26 Mars ; Lalinde:Avenue Jean Moulin ; Saint-Pardoux-la-Rivière:Rue Alfredo Raynaud | téléphone donné : aucun | site donné : https://agence.axa.fr | page de recrutement donnée : https://recrutement.axa.fr | à vérifier : téléphone absent
orpi-dordogne | Orpi | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Terrasson-Lavilledieu: ; Le Bugue: ; Montignac-Lascaux: | téléphone donné : aucun | site donné : https://www.orpi.com | page de recrutement donnée : https://www.orpi.com/recrutement | à vérifier : adresse précise absente, téléphone absent
laforet-dordogne | Laforêt | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.laforet.com | page de recrutement donnée : https://www.laforet.com/recrutement | à vérifier : adresse précise absente, téléphone absent
century21-dordogne | Century 21 | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Terrasson-Lavilledieu: | téléphone donné : aucun | site donné : https://www.century21.fr | page de recrutement donnée : https://www.century21.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
guy-hoquet-dordogne | Guy Hoquet | Bergerac: ; Périgueux: | téléphone donné : aucun | site donné : https://www.guy-hoquet.com | page de recrutement donnée : https://www.guy-hoquet.com/recrutement | à vérifier : adresse précise absente, téléphone absent
human-immobilier-dordogne | Human Immobilier | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Trélissac: ; Terrasson-Lavilledieu: ; Montignac-Lascaux: ; Le Bugue: ; Lalinde: ; Ribérac: ; Nontron: | téléphone donné : aucun | site donné : https://www.human-immobilier.fr | page de recrutement donnée : https://www.human-immobilier.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
foncia-dordogne | Foncia | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://fr.foncia.com | page de recrutement donnée : https://recrutement.foncia.com | à vérifier : adresse précise absente, téléphone absent
bnp-paribas-haute-vienne | BNP Paribas | Limoges:Jourdan ; Limoges:Romanet ; Saint-Junien: ; Bellac: | téléphone donné : aucun | site donné : https://mabanque.bnpparibas | page de recrutement donnée : https://group.bnpparibas/emploi-carriere | à vérifier : téléphone absent
lcl-haute-vienne | LCL Banque et assurance | Limoges:11 Place des Carmes ; Limoges:8 Rue Jean Jaurès ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.lcl.fr | page de recrutement donnée : https://recrutement.lcl.fr | à vérifier : téléphone absent
```

## Lot 58 : employeurs, Banque, assurance et immobilier (2 sur 3), 15 fiches

```
Lot 58. Vérifie ces 15 employeurs (secteur : Banque, assurance et immobilier). Réponds au format demandé, dans un seul bloc de code.

sg-haute-vienne | SG | Limoges:2 Place des Bancs ; Limoges:6 Rue Turgot ; Limoges:3 Place du Commerce ; Limoges:8 Rue Victor Schoelcher ; Panazol:33 Avenue du Président Sadi Carnot ; Aixe-sur-Vienne:52 Avenue du Président Wilson ; Saint-Junien: ; Bellac: | téléphone donné : aucun | site donné : https://particuliers.sg.fr | page de recrutement donnée : https://careers.societegenerale.com | à vérifier : téléphone absent
banque-populaire-aquitaine-centre-atlantique-87 | Banque Populaire Aquitaine Centre Atlantique | Limoges: ; Saint-Junien: ; Bellac: ; Saint-Léonard-de-Noblat: | téléphone donné : aucun | site donné : https://www.banquepopulaire.fr/aquitaine-centre-atlantique | page de recrutement donnée : https://recrutement.banquepopulaire.fr | à vérifier : adresse précise absente, téléphone absent
caisse-epargne-aquitaine-poitou-charentes-87 | Caisse d'Épargne Aquitaine Poitou-Charentes | Limoges: ; Saint-Junien: ; Bellac: ; Eymoutiers: ; Rochechouart: | téléphone donné : aucun | site donné : https://www.caisse-epargne.fr/aquitaine-poitou-charentes | page de recrutement donnée : https://recrutement.caisse-epargne.com | à vérifier : adresse précise absente, téléphone absent
credit-mutuel-haute-vienne | Crédit Mutuel | Limoges: ; Saint-Junien: ; Panazol: | téléphone donné : aucun | site donné : https://www.creditmutuel.fr | page de recrutement donnée : https://recrutement.creditmutuel.fr | à vérifier : adresse précise absente, téléphone absent
axa-haute-vienne | AXA Assurance et Banque | Limoges:29 Rue Haute-Vienne ; Limoges:56 Avenue du Roussillon ; Limoges:3 Avenue du Maréchal de Lattre de Tassigny ; Boisseuil:3 Rue du Limousin ; Saint-Junien: ; Bellac: | téléphone donné : aucun | site donné : https://agence.axa.fr | page de recrutement donnée : https://recrutement.axa.fr | à vérifier : téléphone absent
gan-assurances-haute-vienne | Gan Assurances | Limoges:144 Avenue du Maréchal de Lattre de Tassigny ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.agence.gan.fr | page de recrutement donnée : https://ganjobs.softgarden.io | à vérifier : téléphone absent
groupama-centre-atlantique-87 | Groupama Centre-Atlantique | Limoges: ; Saint-Junien: ; Bellac: ; Rochechouart: ; Eymoutiers: | téléphone donné : aucun | site donné : https://www.groupama.fr | page de recrutement donnée : https://recrute.groupama.com | à vérifier : adresse précise absente, téléphone absent
laforet-haute-vienne | Laforêt | Limoges: ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.laforet.com | page de recrutement donnée : https://www.laforet.com/recrutement | à vérifier : adresse précise absente, téléphone absent
century21-haute-vienne | Century 21 | Limoges: ; Saint-Junien: ; Panazol: | téléphone donné : aucun | site donné : https://www.century21.fr | page de recrutement donnée : https://www.century21.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
human-immobilier-haute-vienne | Human Immobilier | Limoges: ; Couzeix: ; Panazol: ; Saint-Junien: ; Bellac: ; Aixe-sur-Vienne: ; Isle: ; Feytiat: | téléphone donné : aucun | site donné : https://www.human-immobilier.fr | page de recrutement donnée : https://www.human-immobilier.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
foncia-haute-vienne | Foncia | Limoges: | téléphone donné : aucun | site donné : https://fr.foncia.com | page de recrutement donnée : https://recrutement.foncia.com | à vérifier : adresse précise absente, téléphone absent
allianz-dordogne | Allianz | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Terrasson-Lavilledieu: ; Ribérac: ; Nontron: ; Thiviers: ; Montpon-Ménestérol: | téléphone donné : aucun | site donné : https://www.allianz.fr | page de recrutement donnée : https://www.allianz.fr/recrutement.html | à vérifier : adresse précise absente, téléphone absent
mma-dordogne | MMA | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: ; Mussidan: ; Nontron: ; Terrasson-Lavilledieu: | téléphone donné : aucun | site donné : https://www.mma.fr | page de recrutement donnée : https://www.mmarecrute.fr | à vérifier : adresse précise absente, téléphone absent
maaf-dordogne | MAAF | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.maaf.fr | page de recrutement donnée : https://www.maaf-recrute.fr | à vérifier : adresse précise absente, téléphone absent
abeille-assurances-dordogne | Abeille Assurances | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.abeille-assurances.fr | page de recrutement donnée : https://www.abeille-assurances.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
```

## Lot 59 : employeurs, Banque, assurance et immobilier (3 sur 3), 8 fiches

```
Lot 59. Vérifie ces 8 employeurs (secteur : Banque, assurance et immobilier). Réponds au format demandé, dans un seul bloc de code.

allianz-haute-vienne | Allianz | Limoges: ; Saint-Junien: ; Bellac: ; Rochechouart: ; Saint-Léonard-de-Noblat: | téléphone donné : aucun | site donné : https://www.allianz.fr | page de recrutement donnée : https://www.allianz.fr/recrutement.html | à vérifier : adresse précise absente, téléphone absent
mma-haute-vienne | MMA | Limoges: ; Saint-Junien: ; Bellac: ; Panazol: | téléphone donné : aucun | site donné : https://www.mma.fr | page de recrutement donnée : https://www.mmarecrute.fr | à vérifier : adresse précise absente, téléphone absent
maaf-haute-vienne | MAAF | Limoges: ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.maaf.fr | page de recrutement donnée : https://www.maaf-recrute.fr | à vérifier : adresse précise absente, téléphone absent
abeille-assurances-haute-vienne | Abeille Assurances | Limoges: ; Saint-Junien: | téléphone donné : aucun | site donné : https://www.abeille-assurances.fr | page de recrutement donnée : https://www.abeille-assurances.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
cafpi-haute-vienne | CAFPI Limoges | Limoges: | téléphone donné : aucun | site donné : https://www.cafpi.fr | page de recrutement donnée : https://cafpi-career.talent-soft.com | à vérifier : adresse précise absente, téléphone absent
meilleurtaux-haute-vienne | Meilleurtaux Limoges | Limoges: | téléphone donné : aucun | site donné : https://www.meilleurtaux.com | page de recrutement donnée : https://recrutement.meilleurtaux.com | à vérifier : adresse précise absente, téléphone absent
cafpi-dordogne | CAFPI Périgueux | Périgueux: | téléphone donné : aucun | site donné : https://www.cafpi.fr | page de recrutement donnée : https://cafpi-career.talent-soft.com | à vérifier : adresse précise absente, téléphone absent
meilleurtaux-dordogne | Meilleurtaux Périgueux | Périgueux: | téléphone donné : aucun | site donné : https://www.meilleurtaux.com | page de recrutement donnée : https://recrutement.meilleurtaux.com | à vérifier : adresse précise absente, téléphone absent
```

## Lot 60 : employeurs, Bâtiment et travaux publics (1 sur 3), 15 fiches

```
Lot 60. Vérifie ces 15 employeurs (secteur : Bâtiment et travaux publics). Réponds au format demandé, dans un seul bloc de code.

lhomme-et-fils-tp | Lhomme et Fils TP | Bergerac:22 Boulevard Charles Garaud, 24100 Bergerac | téléphone donné : 05 53 27 19 78 | site donné : https://www.lhommeetfils.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bouijaud-tp | Bouijaud TP | Vélines:Lieu-dit, 24230 Vélines | téléphone donné : 05 53 22 49 59 | site donné : https://www.bouijaud-tp.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
alemps-et-fils | Alemps & Fils | Savignac-les-Églises:Route Saint-Privat, 24420 Savignac-les-Églises | téléphone donné : 05 53 05 02 26 | site donné : https://www.alemps.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
entreprise-guy | Entreprise Guy | Le Buisson-de-Cadouin:La Séguinie, 24480 Le Buisson-de-Cadouin | téléphone donné : 05 53 22 02 77 | site donné : https://www.entrepriseguy.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
entreprise-generale-batiment-creysse | Entreprise Générale de Bâtiment | Creysse:ZA de la Nauve, Route de la Nauve, 24100 Creysse | téléphone donné : 05 53 23 78 76 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ets-ribeiro | ETS Ribeiro | Coulounieix-Chamiers: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
geiq24 | GEIQ 24 Bâtiment | Périgueux: | téléphone donné : aucun | site donné : https://geiq24.com | page de recrutement donnée : https://geiq24.com | à vérifier : adresse précise absente, téléphone absent
coren-perigord | Coren Périgord | Saint-Astier:6 Impasse des Glaneurs, 24110 Saint-Astier | téléphone donné : 05 53 35 73 80 | site donné : https://www.coren-perigord.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bergeron-goudronnage | Bergeron Goudronnage EURL | Chancelade:315 Route d'Angoulême, 24650 Chancelade | téléphone donné : 05 53 04 78 92 | site donné : https://www.bergeron-goudronnage.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bergerac-tp | Bergerac TP | Saint-Agne:260 Route de la Plaine, 24520 Saint-Agne | téléphone donné : 05 53 61 81 22 | site donné : https://www.bergeractp.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
erctp | ERCTP | Boulazac Isle Manoire:30 Avenue Benoît Frachon, 24750 Boulazac Isle Manoire | téléphone donné : 05 53 06 47 80 | site donné : https://www.erctp.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
garrigou-tp | Garrigou TP Carrières | Groléjac:La Forêt, 24250 Groléjac | téléphone donné : 05 53 28 11 17 | site donné : https://www.garrigou.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
tallet-et-fils | Tallet et Fils | Sarlande:354 Sarlandelle, 24270 Sarlande | téléphone donné : 05 53 52 61 92 | site donné : https://www.tallet-et-fils.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cap-elec-energies | Cap'Élec Énergies | Trélissac:19 Rue de la Rivière Chancel, 24750 Trélissac | téléphone donné : 05 53 05 04 67 | site donné : https://www.capelec-energies.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
services-perigourdins | Services Périgourdins | Montagnac-la-Crempse:430 Allée de la Taillerie, 24140 Montagnac-la-Crempse | téléphone donné : 06 37 12 24 01 | site donné : https://www.services-perigourdins.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 61 : employeurs, Bâtiment et travaux publics (2 sur 3), 15 fiches

```
Lot 61. Vérifie ces 15 employeurs (secteur : Bâtiment et travaux publics). Réponds au format demandé, dans un seul bloc de code.

batifrere-electricite | Batifrère Électricité | Siorac-en-Périgord:14 Avenue de la Dordogne, 24170 Siorac-en-Périgord | téléphone donné : 07 50 15 94 96 | site donné : https://www.batifrere-electricite.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ecoludom | Écoludom | Marsac-sur-l'Isle:1180 Route de Razac, 24430 Marsac-sur-l'Isle | téléphone donné : 06 65 51 97 83 | site donné : https://www.ecoludom.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
dp-services-dordogne | DP Services Dordogne | Montpon-Ménestérol:16 Le Bretoux, 24700 Montpon-Ménestérol | téléphone donné : 04 12 24 01 20 | site donné : https://www.dpservicesdordogne.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
dordogne-sanitaire-chauffage-lamblin | Dordogne Sanitaire Chauffage Lamblin | Périgueux:44 Cours Saint-Georges, 24000 Périgueux | téléphone donné : 06 65 09 03 93 | site donné : https://www.lamblin24.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jbs-plomberie | JBS Plomberie | Boulazac Isle Manoire:13 Rue de Landry, 24750 Boulazac Isle Manoire | téléphone donné : 06 03 35 63 08 | site donné : https://www.jbs-plomberie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
coren-limousin | Coren Limousin | Limoges:10 Rue Panhard Levassor, 87280 Limoges | téléphone donné : 05 55 04 20 65 | site donné : https://www.coren.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
hebras-travaux-publics | Hebras Travaux Publics | Limoges:27 Allée des Gravelles, 87280 Limoges | téléphone donné : 05 55 37 49 85 | site donné : https://www.hebras.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chaumeil-tp | Chaumeil TP | Peyrat-de-Bellac:2 Rue de Noussat, 87300 Peyrat-de-Bellac | téléphone donné : aucun | site donné : https://www.chaumeil-tp.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
pasquier-et-fils | Pasquier & Fils | Pierre-Buffière:103 Rue de Puy Violet, 87260 Pierre-Buffière | téléphone donné : 05 55 00 67 23 | site donné : https://www.pasquier-et-fils.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
blanchon | Entreprise Blanchon | Limoges:7 Rue Fernand Malinvaud, 87000 Limoges | téléphone donné : 05 55 30 16 70 | site donné : https://www.blanchon-batiment.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
flacassier-batiment | Flacassier Bâtiment | Feytiat:Lieu-dit Pressac, 87220 Feytiat | téléphone donné : 05 55 48 33 68 | site donné : https://www.flacassier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
tlb-sarl | TLB SARL | Limoges:90 Rue Meissonier, 87000 Limoges | téléphone donné : 05 55 11 97 63 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
gebo-tp | GEBO TP | Limoges:2 Rue Pasteur, 87000 Limoges | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
coulon-tp | COULON TP | Saint-Victurnien:Les Remejoux, 87420 Saint-Victurnien | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
dltp | DLTP | Saint-Martin-le-Vieux:1 Bel Air, 87700 Saint-Martin-le-Vieux | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
```

## Lot 62 : employeurs, Bâtiment et travaux publics (3 sur 3), 1 fiche

```
Lot 62. Vérifie ces 1 employeurs (secteur : Bâtiment et travaux publics). Réponds au format demandé, dans un seul bloc de code.

ouvrage-btp | Ouvrage BTP | Saint-Junien:Rue Evariste Galois, 87200 Saint-Junien | téléphone donné : 05 55 50 30 00 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 63 : employeurs, Coiffure et esthétique (1 sur 3), 15 fiches

```
Lot 63. Vérifie ces 15 employeurs (secteur : Coiffure et esthétique). Réponds au format demandé, dans un seul bloc de code.

franck-provost-dordogne | Franck Provost | Périgueux:9 Rue André Saigne, Passage Sainte-Cécile, 24000 ; Sarlat-la-Canéda:25 Rue de Cahors Galerie Labronie, 24200 | téléphone donné : 05 53 53 00 10 | site donné : https://www.franckprovost.com | page de recrutement donnée : https://recrutement.franckprovost.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
jean-louis-david-perigueux | Jean Louis David | Périgueux:9 Rue André Saigne, Passage Sainte-Cécile, 24000 | téléphone donné : 05 53 53 00 10 | site donné : https://www.jeanlouisdavid.com | page de recrutement donnée : https://careers.provalliance.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
artistyk | Artistyk | Périgueux:38 Rue du Président Wilson, 24000 | téléphone donné : 05 53 53 60 20 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mathys-by-kristel | Mathy's by Kristel | Bergerac:3 Rue Mounet Sully, 24100 | téléphone donné : 05 53 27 03 07 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
anne-marie-styl | Anne Marie Styl | Bergerac:24 Rue Junien Rabier, 24100 | téléphone donné : 05 53 58 90 59 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
style-et-tendances | Style & Tendances | Chancelade:4 Allée des Catalpas, 24650 | téléphone donné : 05 53 03 42 61 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
linstant-coiffure-beaute | L'Instant Coiffure Beauté | Sarlat-la-Canéda:319 Avenue Aristide Briand, 24200 | téléphone donné : 05 53 30 51 05 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cb-coiffure-beaute | C&B Coiffure et Beauté | Bergerac: | téléphone donné : 06 95 66 25 07 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, page de recrutement absente
a-limage-de-soie | À l'Image de Soie | Périgueux:11 Rue Saint-Front, 24000 | téléphone donné : 05 53 13 37 42 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
revstyle | Rêv'Style | Périgueux:7 Rue Combe des Dames, 24000 | téléphone donné : 05 53 53 39 13 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-ptit-salon | Au P'tit Salon | Périgueux:10 Rue de la Selle, 24000 | téléphone donné : 05 53 35 36 55 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
stylcoiffure-laetis | Styl'Coiffure Laetis | Cénac-et-Saint-Julien:Place du Marché, 24250 | téléphone donné : 05 53 28 30 29 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
secrets-de-fee | Secrets de Fée | Périgueux:6 Rue Condé, 24000 | téléphone donné : 05 53 13 25 85 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
linstitut-vk | L'Institut VK | Périgueux:14 Place André Maurois, 24000 | téléphone donné : 05 53 35 35 93 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aura-et-beaute | Aura & Beauté | Trélissac:Espace Ma Bonne Étoile, 43 Avenue Michel Grandou, 24750 | téléphone donné : 07 83 72 91 51 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 64 : employeurs, Coiffure et esthétique (2 sur 3), 15 fiches

```
Lot 64. Vérifie ces 15 employeurs (secteur : Coiffure et esthétique). Réponds au format demandé, dans un seul bloc de code.

perles-de-spa | Perles de Spa | Marsac-sur-l'Isle:105 Allée Guillenaud, 24430 | téléphone donné : 07 72 26 38 13 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
carole-beaute | Carole Beauté | Mussidan:10 Rue Émile Bazillou, 24400 | téléphone donné : 05 53 80 28 29 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
les-fees-de-la-beaute | Les Fées de la Beauté | Thiviers:7 Rue Jules Sarlandie, 24800 | téléphone donné : 05 53 52 26 47 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
le-grain-de-beaute | Le Grain de Beauté | Le Bugue:6 Place de l'Hôtel de Ville, 24260 | téléphone donné : 05 53 07 23 16 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
saint-algue-limoges | Saint Algue | Limoges:Centre Commercial Carrefour Boisseuil, Le Vigen, 87110 | téléphone donné : 05 55 31 11 53 | site donné : https://www.saint-algue.com | page de recrutement donnée : https://careers.provalliance.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
esthete-salon | Esthète Salon | Limoges:4 Rue Montmailler, 87000 | téléphone donné : 05 55 77 69 05 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
au-salon-danais | Au Salon d'Anaïs Coiffure Esthétique et Ongles | Boisseuil:10 Route de Toulouse, 87220 | téléphone donné : 06 60 27 03 84 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
emy-avet | Emy Avet Coiffure & Esthétique | Limoges:23 Rue de Bellac, 87100 | téléphone donné : 09 82 64 28 08 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
me-and-my-salon | Me and My Salon | Rilhac-Rancon:8 Bis Avenue de la Libération, 87570 | téléphone donné : 05 55 69 31 54 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
univhairspa | Univ'HairSpa | Panazol:9 Passage des Hêtres, 87350 | téléphone donné : 06 30 10 28 67 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mon-salon-saint-victurnien | Mon Salon Coiffure Institut | Saint-Victurnien:11 Rue Alluaud, 87420 | téléphone donné : 05 55 03 82 69 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
addict-limoges-boisseuil | Addict Paris | Le Vigen:Centre Commercial Carrefour Boisseuil, 87110 | téléphone donné : 05 55 31 11 53 | site donné : https://addictparis.fr | page de recrutement donnée : https://recrutement.addictparis.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
isatis-le-spa | Isatis Le Spa | Limoges:78 Rue François Chénieux, 87000 | téléphone donné : 05 55 77 76 30 | site donné : https://www.isatis-spa.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
naia-spa | Naïa Spa | Limoges:4 Rue Marcel Sembat, 87000 | téléphone donné : 05 55 34 58 44 | site donné : https://www.naiaspa.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mon-spa-limoges | Mon Spa | Limoges:71 Rue Pierre et Marie Curie, 87000 | téléphone donné : 05 55 79 11 79 | site donné : https://www.monspa87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 65 : employeurs, Coiffure et esthétique (3 sur 3), 5 fiches

```
Lot 65. Vérifie ces 5 employeurs (secteur : Coiffure et esthétique). Réponds au format demandé, dans un seul bloc de code.

lor-institut-panazol | L'Or Institut | Limoges:157 Avenue de Landouge, 87100 ; Panazol:27 Rue Charles Baudelaire, 87350 | téléphone donné : 05 44 21 10 35 | site donné : https://www.lorinstitut.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
institut-sepia | Institut Sépia | Limoges:30 Place de la République, 87000 | téléphone donné : 09 70 72 20 70 | site donné : https://institutsepia.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pensee-cocoon | Pensée Cocoon | Limoges:202 Rue de Toulouse, 87000 | téléphone donné : 09 77 65 44 80 | site donné : https://www.penseecocoon.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
atelier-du-bien-etre | Atelier du Bien Être | Limoges:7 Rue des Écoles, 87000 | téléphone donné : 05 55 37 61 31 | site donné : https://atelierdubienetre87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ambre-institut | Ambre Institut | Aixe-sur-Vienne:1 Avenue Raymond Poincaré, 87700 | téléphone donné : 05 55 70 07 83 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 66 : employeurs, Commerce et vente (1 sur 5), 15 fiches

```
Lot 66. Vérifie ces 15 employeurs (secteur : Commerce et vente). Réponds au format demandé, dans un seul bloc de code.

leroy-merlin-dordogne | Leroy Merlin | Chancelade:ZAE Péri Ouest, 34 Chemin du Prêtre, 24650 Chancelade | téléphone donné : 05 53 02 29 20 | site donné : https://www.leroymerlin.fr | page de recrutement donnée : https://recrute.leroymerlin.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
mr-bricolage-dordogne | Mr.Bricolage | Boulazac Isle Manoire:12 Avenue Marcel Paul ; Montignac-Lascaux:64 ZA des Séchoirs | téléphone donné : aucun | site donné : https://www.mr-bricolage.fr | page de recrutement donnée : https://recrutement.mr-bricolage.fr | à vérifier : téléphone absent
jardiland-dordogne | Jardiland | Trélissac:Avenue Michel Grandou ; Bergerac:Route d'Agen | téléphone donné : aucun | site donné : https://www.jardiland.com | page de recrutement donnée : https://www.jardiland-recrute.fr | à vérifier : téléphone absent
les-briconautes-dordogne | Les Briconautes | Saint-Médard-de-Mussidan:Rue Marcel Janet, ZAC ; Vergt:Rue du Moulin de Ripaille | téléphone donné : aucun | site donné : https://www.briconautes.fr | page de recrutement donnée : https://www.briconautes.fr/recrutement | à vérifier : téléphone absent
super-u-dordogne | Super U | Boulazac Isle Manoire:Avenue de l'Automobile ; Mussidan: ; Terrasson-Lavilledieu: ; Lalinde: ; Excideuil: | téléphone donné : aucun | site donné : https://www.magasins-u.com | page de recrutement donnée : https://www.magasins-u.com/recrutement | à vérifier : téléphone absent
u-express-dordogne | U Express | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.magasins-u.com | page de recrutement donnée : https://www.magasins-u.com/recrutement | à vérifier : adresse précise absente, téléphone absent
hyper-u-dordogne | Hyper U | Boulazac Isle Manoire:Avenue de l'Automobile | téléphone donné : aucun | site donné : https://www.magasins-u.com | page de recrutement donnée : https://www.magasins-u.com/recrutement | à vérifier : téléphone absent
bi1-dordogne | bi1 | Eymet: | téléphone donné : aucun | site donné : https://www.bi1.fr | page de recrutement donnée : https://carrieres.schiever.com | à vérifier : adresse précise absente, téléphone absent
action-dordogne | Action | Trélissac: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.action.com | page de recrutement donnée : https://careers.action.com | à vérifier : adresse précise absente, téléphone absent
gifi-dordogne | GiFi | Bergerac: ; Trélissac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.gifi.fr | page de recrutement donnée : https://recrutement.gifi.fr | à vérifier : adresse précise absente, téléphone absent
centrakor-dordogne | Centrakor | Bergerac: ; Trélissac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.centrakor.com | page de recrutement donnée : https://www.centrakor.com/recrutement | à vérifier : adresse précise absente, téléphone absent
intersport-dordogne | Intersport | Bergerac: ; Trélissac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.intersport.fr | page de recrutement donnée : https://recrutement.intersport.fr | à vérifier : adresse précise absente, téléphone absent
decathlon-dordogne | Decathlon | Boulazac Isle Manoire: | téléphone donné : aucun | site donné : https://www.decathlon.fr | page de recrutement donnée : https://joinus.decathlon.fr | à vérifier : adresse précise absente, téléphone absent
kiabi-dordogne | Kiabi | Trélissac: | téléphone donné : aucun | site donné : https://www.kiabi.com | page de recrutement donnée : https://www.kiabi.com/fr/recrutement | à vérifier : adresse précise absente, téléphone absent
but-dordogne | BUT | Bergerac: ; Boulazac Isle Manoire: | téléphone donné : aucun | site donné : https://www.but.fr | page de recrutement donnée : https://carrieres.but.fr | à vérifier : adresse précise absente, téléphone absent
```

## Lot 67 : employeurs, Commerce et vente (2 sur 5), 15 fiches

```
Lot 67. Vérifie ces 15 employeurs (secteur : Commerce et vente). Réponds au format demandé, dans un seul bloc de code.

conforama-dordogne | Conforama | Boulazac Isle Manoire: | téléphone donné : aucun | site donné : https://www.conforama.fr | page de recrutement donnée : https://emploi.conforama.fr | à vérifier : adresse précise absente, téléphone absent
boulanger-dordogne | Boulanger | Boulazac Isle Manoire: | téléphone donné : aucun | site donné : https://www.boulanger.com | page de recrutement donnée : https://www.boulanger.com/evenement/recrutement | à vérifier : adresse précise absente, téléphone absent
mr-bricolage-haute-vienne | Mr.Bricolage | Saint-Junien:Avenue d'Oradour-sur-Glane ; Aixe-sur-Vienne:Zone du Moulin Cheyroux | téléphone donné : aucun | site donné : https://www.mr-bricolage.fr | page de recrutement donnée : https://recrutement.mr-bricolage.fr | à vérifier : téléphone absent
bricomarche-haute-vienne | Bricomarché | Bellac:Route de Poitiers ; Saint-Yrieix-la-Perche:Route de Brive ; Ambazac:ZA du Moulin | téléphone donné : aucun | site donné : https://www.bricomarche.com | page de recrutement donnée : https://recrutement.groupement-mousquetaires.com | à vérifier : téléphone absent
jardiland-haute-vienne | Jardiland | Limoges:Family Village, Le Vigen | téléphone donné : aucun | site donné : https://www.jardiland.com | page de recrutement donnée : https://www.jardiland-recrute.fr | à vérifier : téléphone absent
truffaut-haute-vienne | Truffaut | Boisseuil:Route de Toulouse | téléphone donné : aucun | site donné : https://www.truffaut.com | page de recrutement donnée : https://emploi.truffaut.com | à vérifier : téléphone absent
action-haute-vienne | Action | Limoges ; Boisseuil ; Saint-Junien ; Bellac ; Saint-Yrieix-la-Perche | téléphone donné : aucun | site donné : https://www.action.com | page de recrutement donnée : https://careers.action.com | à vérifier : adresse précise absente, téléphone absent
gifi-haute-vienne | GiFi | Limoges ; Boisseuil ; Saint-Junien | téléphone donné : aucun | site donné : https://www.gifi.fr | page de recrutement donnée : https://recrutement.gifi.fr | à vérifier : adresse précise absente, téléphone absent
centrakor-haute-vienne | Centrakor | Limoges ; Saint-Junien | téléphone donné : aucun | site donné : https://www.centrakor.com | page de recrutement donnée : https://www.centrakor.com/recrutement | à vérifier : adresse précise absente, téléphone absent
super-u-haute-vienne | Super U | Limoges ; Oradour-sur-Glane ; Nantiat ; Saint-Léonard-de-Noblat ; Châlus | téléphone donné : aucun | site donné : https://www.magasins-u.com | page de recrutement donnée : https://www.magasins-u.com/recrutement | à vérifier : adresse précise absente, téléphone absent
u-express-haute-vienne | U Express | Oradour-sur-Glane ; Limoges | téléphone donné : aucun | site donné : https://www.magasins-u.com | page de recrutement donnée : https://www.magasins-u.com/recrutement | à vérifier : adresse précise absente, téléphone absent
decathlon-haute-vienne | Decathlon | Limoges:Family Village, Le Vigen | téléphone donné : aucun | site donné : https://www.decathlon.fr | page de recrutement donnée : https://joinus.decathlon.fr | à vérifier : téléphone absent
intersport-haute-vienne | Intersport | Limoges ; Boisseuil ; Saint-Junien | téléphone donné : aucun | site donné : https://www.intersport.fr | page de recrutement donnée : https://recrutement.intersport.fr | à vérifier : adresse précise absente, téléphone absent
kiabi-haute-vienne | Kiabi | Limoges ; Boisseuil | téléphone donné : aucun | site donné : https://www.kiabi.com | page de recrutement donnée : https://www.kiabi.com/fr/recrutement | à vérifier : adresse précise absente, téléphone absent
chaussea-haute-vienne | Chaussea | Boisseuil ; Limoges | téléphone donné : aucun | site donné : https://www.chaussea.com | page de recrutement donnée : https://recrutement.chaussea.com | à vérifier : adresse précise absente, téléphone absent
```

## Lot 68 : employeurs, Commerce et vente (3 sur 5), 15 fiches

```
Lot 68. Vérifie ces 15 employeurs (secteur : Commerce et vente). Réponds au format demandé, dans un seul bloc de code.

besson-chaussures-haute-vienne | Besson Chaussures | Boisseuil | téléphone donné : aucun | site donné : https://www.besson-chaussures.com | page de recrutement donnée : https://carrieres.besson-chaussures.com | à vérifier : adresse précise absente, téléphone absent
but-haute-vienne | BUT | Limoges ; Saint-Junien | téléphone donné : aucun | site donné : https://www.but.fr | page de recrutement donnée : https://carrieres.but.fr | à vérifier : adresse précise absente, téléphone absent
conforama-haute-vienne | Conforama | Limoges | téléphone donné : aucun | site donné : https://www.conforama.fr | page de recrutement donnée : https://emploi.conforama.fr | à vérifier : adresse précise absente, téléphone absent
boulanger-haute-vienne | Boulanger | Boisseuil | téléphone donné : aucun | site donné : https://www.boulanger.com | page de recrutement donnée : https://www.boulanger.com/evenement/recrutement | à vérifier : adresse précise absente, téléphone absent
fnac-haute-vienne | Fnac | Limoges ; Boisseuil | téléphone donné : aucun | site donné : https://www.fnac.com | page de recrutement donnée : https://www.fnac-recrute.fr | à vérifier : adresse précise absente, téléphone absent
cultura-haute-vienne | Cultura | Boisseuil | téléphone donné : aucun | site donné : https://www.cultura.com | page de recrutement donnée : https://recrutement.cultura.com | à vérifier : adresse précise absente, téléphone absent
bm-haute-vienne | B&M | Limoges | téléphone donné : aucun | site donné : https://www.bmstores.fr | page de recrutement donnée : https://emploi.bmstores.fr | à vérifier : adresse précise absente, téléphone absent
noz-dordogne | NOZ | Chancelade:derrière Auchan Drive, Chemin des Gabares, 24650 Chancelade ; Bergerac:Route de Bordeaux, 24100 Bergerac | téléphone donné : aucun | site donné : https://www.noz.fr | page de recrutement donnée : https://www.nozrecrute.fr | à vérifier : téléphone absent
fnac-dordogne | Fnac | Bergerac:9 Rue de la Résistance, 24100 Bergerac ; Montpon-Ménestérol:21 Route de Bordeaux, Centre Commercial Brion Sud, 24700 Montpon-Ménestérol | téléphone donné : aucun | site donné : https://www.fnac.com | page de recrutement donnée : https://www.fnac-recrute.fr | à vérifier : téléphone absent
hm-haute-vienne | H&M | Limoges:Centre Saint-Martial, 22 Avenue Garibaldi, 87000 Limoges | téléphone donné : aucun | site donné : https://www.hm.com | page de recrutement donnée : https://career.hm.com | à vérifier : téléphone absent
zara-haute-vienne | Zara | Limoges:Centre Saint-Martial, 22 Avenue Garibaldi, 87000 Limoges | téléphone donné : aucun | site donné : https://www.zara.com | page de recrutement donnée : https://www.inditexcareers.com | à vérifier : téléphone absent
c-and-a-haute-vienne | C&A | Boisseuil:Family Village, 87220 Boisseuil | téléphone donné : aucun | site donné : https://www.c-and-a.com | page de recrutement donnée : https://career.c-and-a.com | à vérifier : téléphone absent
geant-des-beaux-arts-haute-vienne | Géant des Beaux-Arts | Limoges: | téléphone donné : aucun | site donné : https://www.geant-beaux-arts.fr | page de recrutement donnée : https://www.gerstaecker.jobs | à vérifier : adresse précise absente, téléphone absent
lapeyre-haute-vienne | Lapeyre | Limoges: | téléphone donné : aucun | site donné : https://www.lapeyre.fr | page de recrutement donnée : https://recrutement.lapeyre.fr | à vérifier : adresse précise absente, téléphone absent
mobilier-de-france-haute-vienne | Mobilier de France | Feytiat: | téléphone donné : aucun | site donné : https://www.mobilierdefrance.com | page de recrutement donnée : https://recrutement.mobilierdefrance.com | à vérifier : adresse précise absente, téléphone absent
```

## Lot 69 : employeurs, Commerce et vente (4 sur 5), 15 fiches

```
Lot 69. Vérifie ces 15 employeurs (secteur : Commerce et vente). Réponds au format demandé, dans un seul bloc de code.

e-leclerc-bergerac-24 | E.Leclerc | Bergerac:101 avenue Pasteur ; Bergerac:route de Bordeaux | téléphone donné : aucun | site donné : https://www.e-leclerc.com/ | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
grand-frais-bergerac-24 | Grand Frais Bergerac | Bergerac:ZA la Cavaille, route de Bordeaux | téléphone donné : 05 53 73 83 30 | site donné : https://www.grandfrais.com/magasins/bergerac | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bricomarche-bergerac-24 | Bricomarché Bergerac | Bergerac:route d'Agen, RN 21, Lespinassat | téléphone donné : aucun | site donné : https://www.bricomarche.com/magasin/bergerac/02283 | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
jardiland-bergerac-24 | Jardiland Bergerac | Bergerac:route d'Agen | téléphone donné : aucun | site donné : https://www.jardiland.com/magasins/magasin-bergerac | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
decathlon-bergerac-24 | Decathlon Bergerac | Bergerac:ZA Les Sardines | téléphone donné : 05 53 74 03 40 | site donné : https://www.decathlon.fr/store-view/magasin-de-sports-bergerac-0070055400554 | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
darty-bergerac-24 | Darty Bergerac | Bergerac:97 avenue Paul Doumer, route de Marmande | téléphone donné : 05 53 57 01 42 | site donné : https://magasin.darty.com/208-darty-bergerac | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
kiabi-bergerac-24 | Kiabi Bergerac | Bergerac:avenue du Général de Gaulle | téléphone donné : 05 53 23 51 00 | site donné : https://www.kiabi.com/magasins.html | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
e-leclerc-perigueux-24 | E.Leclerc | Périgueux:16 rue du Clos Chassaing ; Trélissac:centre commercial La Feuilleraie, RN 21 ; Saint-Astier:boulevard de Lattre de Tassigny | téléphone donné : aucun | site donné : https://www.e-leclerc.com/ | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
leroy-merlin-chancelade-24 | Leroy Merlin Chancelade - Périgueux | Chancelade:34 chemin du Prêtre, ZAE Péri Ouest | téléphone donné : 05 53 02 29 20 | site donné : https://www.leroymerlin.fr/magasins/chancelade-perigueux.html | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
kiabi-boulazac-24 | Kiabi Périgueux | Boulazac Isle Manoire:avenue Robert Desnos | téléphone donné : 05 53 02 19 30 | site donné : https://www.kiabi.com/magasin/kiabi-PERIGUEUX_FMPERIG | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
e-leclerc-sarlat-24 | E.Leclerc | Sarlat-la-Canéda:avenue de Madrazes ; Sarlat-la-Canéda:chemin des Sables | téléphone donné : aucun | site donné : https://www.e-leclerc.com/ | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
bricomarche-sarlat-24 | Bricomarché Sarlat-la-Canéda | Sarlat-la-Canéda:rue de l'Abbé Breuil, route de Montignac | téléphone donné : 05 53 29 17 93 | site donné : https://www.bricomarche.com/magasin/sarlat-la-caneda/20325 | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bricomarche-le-bugue-24 | Bricomarché Le Bugue | Le Bugue:route du Buisson, avenue de la Libération | téléphone donné : aucun | site donné : https://www.bricomarche.com/magasin/le-bugue/20348 | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
bricomarche-terrasson-24 | Bricomarché Terrasson-Lavilledieu | Terrasson-Lavilledieu:105 avenue Victor Hugo | téléphone donné : aucun | site donné : https://www.bricomarche.com/magasin/terrasson-lavilledieu/07638 | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
weldom-sarlat-24 | Weldom Sarlat-la-Canéda | Sarlat-la-Canéda:avenue Simone Veil, route de Souillac, rue Jean-Baptiste Delpeyrat | téléphone donné : aucun | site donné : https://www.weldom.fr/m/weldom-sarlat-la-caneda | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
```

## Lot 70 : employeurs, Commerce et vente (5 sur 5), 12 fiches

```
Lot 70. Vérifie ces 12 employeurs (secteur : Commerce et vente). Réponds au format demandé, dans un seul bloc de code.

darty-sarlat-24 | Darty Sarlat | Sarlat-la-Canéda:route de l'Abbé Breuil, centre commercial Carrefour | téléphone donné : aucun | site donné : https://magasin.darty.com/232-darty-sarlat | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
intersport-sarlat-24 | Intersport Sarlat-la-Canéda | Sarlat-la-Canéda:36-38 avenue de Madrazès, zone commerciale Leclerc | téléphone donné : 05 53 28 60 46 | site donné : https://www.intersport.fr/Dordogne-24/SARLATLACANEDA-24200/INTERSPORT-SARLATLACANEDA/00844_000 | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
e-leclerc-limoges-87 | E.Leclerc | Limoges:avenue Louis Armand, ZI Nord ; Limoges:26 rue Wagner | téléphone donné : 05 55 38 14 28 | site donné : https://www.e-leclerc.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
grand-frais-limoges-centre-87 | Grand Frais Limoges Centre | Limoges:223 avenue des Casseaux | téléphone donné : 05 55 10 13 61 | site donné : https://www.grandfrais.com/magasins/limoges-centre | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
grand-frais-limoges-nord-87 | Grand Frais Limoges Nord | Limoges:zone commerciale Family Village | téléphone donné : 05 55 35 42 71 | site donné : https://www.grandfrais.com/magasins/limoges-nord | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
grand-frais-limoges-sud-87 | Grand Frais Limoges Sud | Limoges:156B rue de Nexon, parking Jardiland | téléphone donné : aucun | site donné : https://www.grandfrais.com/magasins/limoges-sud | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
leroy-merlin-limoges-87 | Leroy Merlin Limoges | Limoges:18 rue Amédée Gordini, centre commercial Family Village, zone Nord | téléphone donné : 05 55 37 59 21 | site donné : https://www.leroymerlin.fr/magasins/limoges.html | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jardiland-limoges-sud-87 | Jardiland Limoges Sud | Limoges:160 route de Nexon | téléphone donné : 05 55 75 45 00 | site donné : https://www.jardiland.com/magasins/magasin-limoges-sud | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
decathlon-limoges-87 | Decathlon Limoges | Limoges:3 rue Amédée Gordini | téléphone donné : 05 55 35 10 36 | site donné : https://www.decathlon.fr/store-view/magasin-de-sports-limoges-0070003500035 | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
darty-limoges-87 | Darty Limoges | Limoges:30 rue Amédée Gordini, Family Village, zone Nord 3 | téléphone donné : aucun | site donné : https://magasin.darty.com/101-darty-limoges | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
kiabi-limoges-nord-87 | Kiabi Limoges Nord | Limoges:rue Frédéric Bastiat | téléphone donné : 05 55 57 57 75 | site donné : https://www.kiabi.com/magasin/kiabi-LIMOGES-NORD_FMLIMO2 | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
kiabi-le-vigen-87 | Kiabi Limoges Sud | Le Vigen:centre commercial Boisseuil | téléphone donné : 05 55 75 39 50 | site donné : https://www.kiabi.com/magasins.html | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 71 : employeurs, Communication et culture (1 sur 3), 15 fiches

```
Lot 71. Vérifie ces 15 employeurs (secteur : Communication et culture). Réponds au format demandé, dans un seul bloc de code.

pxinfos-perigueux | PXINFOS | Périgueux:Rue Salinière, 24000 | téléphone donné : 06 27 53 40 07 | site donné : https://www.pxinfos.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
reussir-le-perigord | Réussir Le Périgord | Périgueux:7 Rue du Jardin Public, 24000 | téléphone donné : 05 53 08 81 83 | site donné : https://www.reussir.fr/perigord | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
democrate-independant | Le Démocrate Indépendant | Bergerac:37 Rue Anatole France, 24100 | téléphone donné : 05 53 57 22 88 | site donné : https://www.ledemocrate.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
lodyssee | L'Odyssée Scène Conventionnée | Périgueux:Esplanade Robert Badinter, 11 Rue Denfert Rochereau, 24000 | téléphone donné : 05 53 53 18 71 | site donné : https://www.odyssee-perigueux.fr | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
le-palace-perigueux | Le Palace | Périgueux:15 Rue Bodin, 24000 | téléphone donné : 05 53 53 18 71 | site donné : https://www.odyssee-perigueux.fr | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
agora-boulazac | Agora Pôle National Cirque | Boulazac Isle Manoire:Avenue de l'Agora, 24750 | téléphone donné : 05 53 35 59 65 | site donné : https://www.agora-boulazac.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
vesunna | Musée Vesunna | Périgueux:20 Rue du 26e Régiment d'Infanterie, 24000 | téléphone donné : 05 53 53 00 92 | site donné : https://vesunna.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
musee-tabac | Musée du Tabac | Bergerac:Place du Feu, 24100 | téléphone donné : 05 53 63 04 13 | site donné : https://www.bergerac.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ecomusee-truffe | Écomusée de la Truffe | Sorges et Ligueux en Périgord:2 Route des Truffières, 24420 | téléphone donné : 05 53 05 90 11 | site donné : https://ecomuseedelatruffe.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cyl-com | CYL&COM | Périgueux:36 Place Francheville, 24000 | téléphone donné : 05 53 05 74 93 | site donné : https://www.cylcom.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
jaeco | JAÉCO | Périgueux:225 Route d'Angoulême, Zone du Privilège, 24000 | téléphone donné : 06 61 46 61 41 | site donné : https://www.jaeco.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ilo-creatif | ILÔ Créatif | Périgueux:13 Boulevard Stalingrad, 24000 | téléphone donné : 05 53 54 74 69 | site donné : https://www.ilo-creatif.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
distinguez-vous | Distinguez-Vous | Périgueux:73 Rue Combe des Dames, 24000 | téléphone donné : 05 53 07 89 40 | site donné : https://www.distinguezvous.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
medias-conseils | Médias-Conseils | Cours-de-Pile:390 Route des Rivachauds, 24520 | téléphone donné : 06 76 29 20 13 | site donné : https://www.medias-conseils.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-culturel-jean-gagnant | Centre Culturel Jean Gagnant | Limoges:7 Avenue Jean Gagnant, 87000 | téléphone donné : 05 55 45 94 00 | site donné : https://www.ville-limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 72 : employeurs, Communication et culture (2 sur 3), 15 fiches

```
Lot 72. Vérifie ces 15 employeurs (secteur : Communication et culture). Réponds au format demandé, dans un seul bloc de code.

francophonies-limoges | Les Francophonies - Des écritures à la scène | Limoges:11 Avenue du Général de Gaulle, 87000 | téléphone donné : 05 55 10 90 10 | site donné : https://www.lesfrancophonies.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
musee-beaux-arts-limoges | Musée des Beaux-Arts de Limoges | Limoges:1 Place de l'Évêché, 87000 | téléphone donné : 05 55 45 98 10 | site donné : https://www.museebal.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
l-agence-limoges | L'Agence | Limoges:66 Avenue de la Libération, 87000 | téléphone donné : 05 55 12 13 13 | site donné : https://www.lagencecom.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
terre-lune | Terre-Lune | Limoges:38 Rue Victor Thuillat, 87100 | téléphone donné : 05 55 34 42 20 | site donné : https://www.terre-lune.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pixine | Pixine | Limoges:30 Rue de Soyouz, 87280 | téléphone donné : 05 55 04 14 90 | site donné : https://www.pixine.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
stratege | Stratege Communication | Limoges:4 Rue des Feuillants, 87000 | téléphone donné : 05 55 34 36 36 | site donné : https://www.stratege-communication.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
iti-communication | ITI Communication | Limoges:16 Rue de Soyouz, 87280 | téléphone donné : 05 55 04 22 22 | site donné : https://www.iti-communication.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
graphiteine | Graphitéine | Limoges:5 Rue de Tourcoing, 87000 | téléphone donné : 05 55 90 41 34 | site donné : https://www.graphiteine.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
agence-bad-monkey | Agence Bad Monkey | Limoges:50 Boulevard Gambetta, 87000 | téléphone donné : 09 81 46 96 96 | site donné : https://www.agencebadmonkey.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
monstera | Agence Monstera | Limoges:7 Rue Martial Pradet, 87000 | téléphone donné : 06 07 64 51 34 | site donné : https://www.monstera.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
studio-emia | Studio Emia | Limoges: | téléphone donné : 07 85 09 50 96 | site donné : https://studioemia.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, page de recrutement absente
zenith-limoges | Zénith Limoges Métropole | Limoges:16 Avenue Jean Monnet, 87100 | téléphone donné : 05 55 69 55 55 | site donné : https://www.zenithlimoges.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
theatre-expression7 | Théâtre Expression 7 | Limoges:7 Avenue Jean Gagnant, 87000 | téléphone donné : 05 55 77 37 50 | site donné : https://www.expression7.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
musee-resistance | Musée de la Résistance | Limoges:7 Rue Neuve Saint-Étienne, 87000 | téléphone donné : 05 55 45 84 44 | site donné : https://www.ville-limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-caricature | Centre International de la Caricature, du Dessin de Presse et d'Humour | Saint-Just-le-Martel:7 Route du Château d'Eau, 87590 | téléphone donné : 05 55 09 26 70 | site donné : https://www.caricature.eu | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 73 : employeurs, Communication et culture (3 sur 3), 1 fiche

```
Lot 73. Vérifie ces 1 employeurs (secteur : Communication et culture). Réponds au format demandé, dans un seul bloc de code.

maison-or-limousin | Maison de l'Or en Limousin | Le Chalard:1 Route du Paladas, 87500 | téléphone donné : 07 82 29 08 50 | site donné : https://www.maisondelor.org | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 74 : employeurs, Éducation et formation (1 sur 2), 15 fiches

```
Lot 74. Vérifie ces 15 employeurs (secteur : Éducation et formation). Réponds au format demandé, dans un seul bloc de code.

afpa-dordogne | AFPA Centre de Périgueux | Boulazac Isle Manoire:ZI de, Avenue Ambroise Croizat, 24750 | téléphone donné : 09 72 72 39 36 | site donné : https://www.afpa.fr | page de recrutement donnée : https://www.afpa.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
institution-sainte-marthe-saint-front | Institution Sainte-Marthe Saint-Front | Bergerac:74 Avenue Pasteur, 24100 | téléphone donné : 05 53 61 58 00 | site donné : https://www.saintemarthe-saintfront.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
institution-sainte-marthe-perigueux | Institution Sainte-Marthe | Périgueux:2 Rue des Gladiateurs ; Périgueux:33 Rue Chanzy | téléphone donné : 05 53 45 41 80 | site donné : https://www.institution-saintemarthe.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
institution-saint-joseph-sarlat | Institution Saint-Joseph | Sarlat-la-Canéda:1 Côte du Roc Mol, 24200 | téléphone donné : 05 53 31 33 00 | site donné : https://www.saint-joseph-sarlat.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
notre-dame-riberac | Collège Notre-Dame | Ribérac:8 Rue Couleau, 24600 | téléphone donné : 05 53 90 02 86 | site donné : https://www.notredame-riberac.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ecole-sacre-coeur-perigueux | École Sacré-Cœur | Périgueux:82 Rue Biron, 24000 | téléphone donné : 05 53 09 34 09 | site donné : https://www.sacrecoeur-perigueux.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
afpa-haute-vienne | AFPA Limoges Romanet | Limoges:27 Rue Léonard Samie, 87000 | téléphone donné : 09 72 72 39 36 | site donné : https://www.afpa.fr | page de recrutement donnée : https://www.afpa.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
cfa-academique-limousin | CFA Académique du Limousin | Limoges:13 Rue François Chénieux, 87031 | téléphone donné : 05 55 11 43 76 | site donné : https://www.cfa-academique-limousin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cfim-tp | CFIM TP | Le Palais-sur-Vienne:Ventenat Nord, 87410 | téléphone donné : 05 55 35 31 71 | site donné : https://www.cfim-tp.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cfppa-les-vaseix | CFPPA Les Vaseix | Verneuil-sur-Vienne:Les Vaseix, 87430 ; Bellac:7 Rue des Rochettes, 87300 | téléphone donné : 05 55 48 44 30 | site donné : https://www.epl-limoges-nord87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cci-haute-vienne-ecoles | CCI Limoges Haute-Vienne Formation | Limoges:16 Place Jourdan, 87000 | téléphone donné : 05 55 45 15 15 | site donné : https://www.limoges.cci.fr | page de recrutement donnée : https://www.limoges.cci.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
alfred-fournier | Institution Alfred Fournier | Limoges:83 Rue de Feytiat, 87000 | téléphone donné : 05 55 31 79 29 | site donné : https://www.alfred-fournier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
les-vaseix-mfr | MFR Les Vaseix | Verneuil-sur-Vienne:Les Vaseix, 87430 | téléphone donné : 05 55 48 44 00 | site donné : https://www.mfr.fr | page de recrutement donnée : https://www.mfr.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
ligue-enseignement-87 | Ligue de l'Enseignement de la Haute-Vienne | Limoges:22 Rue du Lieutenant Ménieux, 87000 | téléphone donné : 05 55 03 36 00 | site donné : https://www.fol87.org | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
polaris-formation | Polaris Formation | Limoges:5 Rue de la Cité, 87000 | téléphone donné : 05 55 34 34 34 | site donné : https://www.polaris-formation.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 75 : employeurs, Éducation et formation (2 sur 2), 7 fiches

```
Lot 75. Vérifie ces 7 employeurs (secteur : Éducation et formation). Réponds au format demandé, dans un seul bloc de code.

cnam-limoges | Cnam Nouvelle-Aquitaine Limoges | Limoges:19 Rue François Perrin, 87000 | téléphone donné : 05 57 59 23 00 | site donné : https://www.cnam-nouvelle-aquitaine.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
e2c-limousin | École de la Deuxième Chance Limousin | Verneuil-sur-Vienne:Les Vaseix, 87430 | téléphone donné : 06 42 58 66 22 | site donné : https://www.e2climousin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
isfogep | ISFOGEP | Limoges:43 Rue Sainte-Anne, 87000 | téléphone donné : 05 55 31 67 24 | site donné : https://www.isfogep.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ecole-production-limoges | Les Pros d'Avenir - École de Production | Limoges:9 Rue Jean Baptiste Say, 87000 | téléphone donné : 05 44 23 19 85 | site donné : https://lesprosdavenir.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
hvformations | HV Formations | Oradour-sur-Glane:45 D101, 87520 | téléphone donné : 06 37 76 54 98 | site donné : https://hvformations.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
epcp-pms | EPCP Centre de Formation PMS | Boisseuil:Zone Artisanale, 87220 | téléphone donné : 06 33 50 58 86 | site donné : https://epcp.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
academie-limoges | Académie de Limoges | Limoges:13 Rue François Chénieux, 87031 | téléphone donné : aucun | site donné : https://www.ac-limoges.fr | page de recrutement donnée : https://www.ac-limoges.fr/recrutement-des-personnels-enseignants-123283 | à vérifier : téléphone absent
```

## Lot 76 : employeurs, Hôtellerie et restauration (1 sur 4), 15 fiches

```
Lot 76. Vérifie ces 15 employeurs (secteur : Hôtellerie et restauration). Réponds au format demandé, dans un seul bloc de code.

sandaya-perigord | Sandaya Le Grand Dague | Boulazac Isle Manoire:Route du Grand Dague (ancienne commune d'Atur) | téléphone donné : aucun | site donné : https://www.sandaya.fr | page de recrutement donnée : https://recrutement.sandaya.jobs/fr/offres | à vérifier : téléphone absent
clos-du-moulin | Le Clos du Moulin | Terrasson-Lavilledieu:Route du Moulin de Bouch | téléphone donné : 05 53 51 68 95 | site donné : https://www.leclosdumoulin.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
sodexo-dordogne | Sodexo | Périgueux:restauration collective ; Bergerac:restauration collective ; Sarlat-la-Canéda:restauration collective | téléphone donné : aucun | site donné : https://www.sodexo.fr | page de recrutement donnée : https://jobs.sodexo.com | à vérifier : téléphone absent
elior-dordogne | Elior | Périgueux:restauration collective ; Bergerac:restauration collective | téléphone donné : aucun | site donné : https://www.elior.fr | page de recrutement donnée : https://carrieres.eliorgroup.com | à vérifier : téléphone absent
restalliance-dordogne | Restalliance | Périgueux:restauration collective ; Bergerac:restauration collective | téléphone donné : aucun | site donné : https://www.restalliance.fr | page de recrutement donnée : https://jobs.restalliance.fr | à vérifier : téléphone absent
api-restauration-dordogne | API Restauration | Périgueux:restauration collective ; Bergerac:restauration collective | téléphone donné : aucun | site donné : https://www.api-restauration.com | page de recrutement donnée : https://www.api-restauration.com/recrutement | à vérifier : téléphone absent
newrest-dordogne | Newrest | Périgueux:restauration collective | téléphone donné : aucun | site donné : https://www.newrest.eu | page de recrutement donnée : https://jobs.newrest.eu | à vérifier : téléphone absent
compass-dordogne | Compass Group France | Périgueux:restauration collective ; Bergerac:restauration collective | téléphone donné : aucun | site donné : https://www.compass-group.fr | page de recrutement donnée : https://carrieres.compass-group.fr | à vérifier : téléphone absent
ibis-dordogne | ibis | Sarlat-la-Canéda:8 Rue Gabriel Tarde, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 30 33 33 | site donné : https://all.accor.com | page de recrutement donnée : https://careers.accor.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
ibis-budget-dordogne | ibis budget Périgueux Boulazac | Boulazac Isle Manoire:ZA Grand Font, 24330 Boulazac Isle Manoire | téléphone donné : 05 53 35 86 00 | site donné : https://all.accor.com | page de recrutement donnée : https://careers.accor.com | à vérifier : même téléphone que 1 autre(s) fiche(s)
b-and-b-hotels-dordogne | B&B HOTELS | Boulazac Isle Manoire:Parc Hôtelier Agora ; Périgueux:Marsac-sur-l'Isle | téléphone donné : aucun | site donné : https://www.hotel-bb.com | page de recrutement donnée : https://jobs.hotel-bb.com | à vérifier : téléphone absent
premiere-classe-dordogne | Première Classe Périgueux Boulazac | Boulazac Isle Manoire:Espace Agora | téléphone donné : aucun | site donné : https://www.premiereclasse.com | page de recrutement donnée : https://careers.louvrehotels.com | à vérifier : téléphone absent
logis-hotels-dordogne | Logis Hôtels | Brantôme en Périgord ; Thonac ; Castels et Bézenac ; Coly-Saint-Amand ; Les Eyzies ; Montignac-Lascaux | téléphone donné : aucun | site donné : https://www.logishotels.com | page de recrutement donnée : https://www.logishotels.com/fr/recrutement | à vérifier : adresse précise absente, téléphone absent
vacanceole-dordogne | Vacancéole Le Clos du Rocher | Les Eyzies:Avenue du Cinglé, 24620 Les Eyzies | téléphone donné : aucun | site donné : https://www.vacanceole.com | page de recrutement donnée : https://www.vacanceole.com/fr/recrutement | à vérifier : téléphone absent
homair-dordogne | Homair Vacances | Saint-Avit-de-Vialard:Camping Le Val d'Ussel ; Vitrac:Camping Le Soleil de la Dordogne | téléphone donné : aucun | site donné : https://www.homair.com | page de recrutement donnée : https://jobs.homair.com | à vérifier : téléphone absent
```

## Lot 77 : employeurs, Hôtellerie et restauration (2 sur 4), 15 fiches

```
Lot 77. Vérifie ces 15 employeurs (secteur : Hôtellerie et restauration). Réponds au format demandé, dans un seul bloc de code.

yelloh-village-dordogne | Yelloh! Village | Saint-Antoine-de-Breuilh:Camping Pomport Beach | téléphone donné : aucun | site donné : https://www.yellohvillage.fr | page de recrutement donnée : https://www.yellohvillage.fr/recrutement | à vérifier : téléphone absent
huttopia-dordogne | Huttopia Sarlat | Sarlat-la-Canéda:Rue Jean Gabin | téléphone donné : aucun | site donné : https://europe.huttopia.com | page de recrutement donnée : https://jobs.huttopia.com | à vérifier : téléphone absent
b-and-b-hotels-haute-vienne | B&B HOTELS | Limoges:26 Rue Frédéric Bastiat, 87280 Limoges ; Limoges:ZI Nord, 87100 Limoges | téléphone donné : aucun | site donné : https://www.hotel-bb.com | page de recrutement donnée : https://jobs.hotel-bb.com | à vérifier : téléphone absent
sodexo-haute-vienne | Sodexo | Limoges:restauration collective ; Saint-Junien:restauration collective | téléphone donné : aucun | site donné : https://www.sodexo.fr | page de recrutement donnée : https://jobs.sodexo.com | à vérifier : téléphone absent
elior-haute-vienne | Elior | Limoges:restauration collective ; Bellac:restauration collective | téléphone donné : aucun | site donné : https://www.elior.fr | page de recrutement donnée : https://carrieres.eliorgroup.com | à vérifier : téléphone absent
restalliance-haute-vienne | Restalliance | Limoges:restauration collective | téléphone donné : aucun | site donné : https://www.restalliance.fr | page de recrutement donnée : https://jobs.restalliance.fr | à vérifier : téléphone absent
api-restauration-haute-vienne | API Restauration | Limoges:restauration collective | téléphone donné : aucun | site donné : https://www.api-restauration.com | page de recrutement donnée : https://www.api-restauration.com/recrutement | à vérifier : téléphone absent
compass-group-haute-vienne | Compass Group France | Limoges:restauration collective | téléphone donné : aucun | site donné : https://www.compass-group.fr | page de recrutement donnée : https://carrieres.compass-group.fr | à vérifier : téléphone absent
newrest-haute-vienne | Newrest | Limoges:restauration collective | téléphone donné : aucun | site donné : https://www.newrest.eu | page de recrutement donnée : https://jobs.newrest.eu | à vérifier : téléphone absent
camping-lac-saint-pardoux | Camping du Lac de Saint-Pardoux | Saint-Pardoux-le-Lac:Granges Lavaud, 87250 Saint-Pardoux-le-Lac | téléphone donné : 05 55 76 57 22 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-pont-du-dognon | Camping Au Pont du Dognon | Saint-Laurent-les-Églises:Le Pont du Dognon | téléphone donné : 06 75 73 25 30 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-chateau-leychoisier | Camping du Château de Leychoisier | Bonnac-la-Côte:1 Route de Leychoisier | téléphone donné : 05 55 39 93 43 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-montreal | Camping de Montréal | Saint-Germain-les-Belles:Rue du Petit Moulin | téléphone donné : 05 55 71 86 20 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
chapelle-saint-martin | La Chapelle Saint Martin | Nieul:33 Route Saint-Martin du Fault | téléphone donné : 05 55 75 80 17 | site donné : https://www.chapellesaintmartin.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-lac-arfeuille | Camping du Lac d'Arfeuille | Saint-Yrieix-la-Perche:4 Allée du Lac d'Arfeuille | téléphone donné : 05 55 75 08 75 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 78 : employeurs, Hôtellerie et restauration (3 sur 4), 15 fiches

```
Lot 78. Vérifie ces 15 employeurs (secteur : Hôtellerie et restauration). Réponds au format demandé, dans un seul bloc de code.

camping-cheyenne-limousin | Camping Le Cheyenne Limousin | Châteauneuf-la-Forêt:Avenue Michel Sinibaldi | téléphone donné : 05 55 69 39 29 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
brit-hotel-europ-bergerac-24 | Le Brit Europ'Hôtel Bergerac | Bergerac:20-22 rue du Petit Sol | téléphone donné : 05 53 57 06 54 | site donné : https://www.europ-hotel-bergerac.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ludik-bergerac-24 | Logis Hôtel & Restaurant Ludik | Bergerac:route de Bordeaux | téléphone donné : 05 53 24 89 76 | site donné : https://ludikresort.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-la-pelouse-bergerac-24 | Camping La Pelouse | Bergerac:8 bis rue Jean-Jacques Rousseau, La Madeleine | téléphone donné : 05 53 57 06 67 | site donné : https://www.bergerac.fr/decouvrir-bergerac/tourisme/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
domaine-etang-bazange-24 | Domaine de l'Étang de Bazange | Monfaucon:1202 route de la Cabane | téléphone donné : 05 53 24 64 79 | site donné : https://www.camping-bazange-dordogne.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ibis-perigueux-centre-24 | ibis Périgueux Centre | Périgueux:8 boulevard Georges Saumande | téléphone donné : 05 53 53 64 58 | site donné : https://all.accor.com/hotel/0636/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ibis-budget-perigueux-centre-24 | ibis budget Périgueux Centre | Périgueux:33 rue du Président Wilson | téléphone donné : 08 92 68 32 37 | site donné : https://all.accor.com/hotel/2714/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
hercule-poireau-perigueux-24 | Restaurant Hercule Poireau | Périgueux:2 rue de la Nation | téléphone donné : 05 53 08 90 76 | site donné : https://www.tourisme-grandperigueux.fr/fiche/hercule-poireau/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
capelo-perigueux-24 | Restaurant Capelo | Périgueux:2 rue Montaigne | téléphone donné : 05 47 45 80 96 | site donné : https://www.restaurant-capelo-perigueux.fr/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
eden-perigueux-24 | Restaurant Eden | Périgueux:3 rue Aubergerie | téléphone donné : 05 53 06 31 08 | site donné : https://restaurant-eden-perigueux-24.fr/fr/page/contact | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-auberoche-24 | Camping d'Auberoche | Bassillac et Auberoche:100 route du Roc (Le Change) | téléphone donné : 05 53 06 04 19 | site donné : https://campingdauberoche.fr/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
domaine-bois-coquet-24 | Camping Le Domaine du Bois Coquet | La Douze:505 chemin des Vacances, lieu-dit Laulurie | téléphone donné : 06 28 01 04 16 | site donné : https://www.tourisme-grandperigueux.fr/fiche/camping-le-domaine-du-bois-coquet/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ibis-sarlat-24 | ibis Sarlat | Sarlat-la-Canéda:8 rue Gabriel Tarde | téléphone donné : 05 53 30 33 33 | site donné : https://all.accor.com/hotel/6868/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
domaine-le-montant-24 | Domaine de Loisirs Le Montant | Sarlat-la-Canéda:route de la Croix d'Espit | téléphone donné : 05 53 59 18 50 | site donné : https://www.camping-sarlat.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-la-sagne-24 | Flower Camping La Sagne | Vitrac:1084 route de Caudon | téléphone donné : 05 53 28 18 36 | site donné : https://www.camping-la-sagne.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 79 : employeurs, Hôtellerie et restauration (4 sur 4), 15 fiches

```
Lot 79. Vérifie ces 15 employeurs (secteur : Hôtellerie et restauration). Réponds au format demandé, dans un seul bloc de code.

chalets-perigord-24 | Les Chalets du Périgord | Sarlat-la-Canéda:150 allée de la Chênaie | téléphone donné : 05 53 59 30 36 | site donné : https://www.location-vacance-sarlat.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-la-chataigneraie-24 | Camping La Châtaigneraie | Prats-de-Carlux:La Garrigue Basse | téléphone donné : 05 53 59 03 61 | site donné : https://www.camping-vagues-oceanes.com/camping-dordogne-et-lot/la-chataigneraie | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bistro-octroi-24 | Le Bistro de l'Octroi | Sarlat-la-Canéda:111 avenue de Selves | téléphone donné : 05 53 30 83 40 | site donné : https://lebistrodeloctroi.fr/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
esprit-sarlat-24 | Restaurant L'Esprit Sarlat | Sarlat-la-Canéda:rue Gabriel Tarde | téléphone donné : 05 53 28 92 50 | site donné : https://www.lesprit-sarlat.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
assiette-sarladaise-24 | L'Assiette Sarladaise | Sarlat-la-Canéda: | téléphone donné : 05 53 31 80 76 | site donné : https://www.lassiettesarladaise-sarlat.fr/ | page de recrutement donnée : aucune | à vérifier : adresse précise absente, page de recrutement absente
mairie-sarlat-restauration-scolaire-24 | Mairie de Sarlat-la-Canéda - restauration scolaire | Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://sarlat.fr/mon-quotidien/scolarite-enfance-et-jeunesse/les-ecoles-de-sarlat/la-restauration-scolaire/ | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
ibis-limoges-centre-87 | ibis Limoges Centre | Limoges:6 boulevard Victor Hugo | téléphone donné : 05 55 79 03 30 | site donné : https://all.accor.com/hotel/0881/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ibis-budget-limoges-nord-87 | ibis budget Limoges Nord | Limoges:110 avenue de Brachaud | téléphone donné : 08 92 70 06 28 | site donné : https://all.accor.com/hotel/A475/index.en.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mercure-limoges-centre-87 | Mercure Limoges Centre | Limoges:7 boulevard Carnot | téléphone donné : 05 55 34 65 30 | site donné : https://all.accor.com/hotel/5955/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ibis-styles-limoges-centre-87 | ibis Styles Limoges Centre | Limoges:43 avenue de la Révolution | téléphone donné : 05 86 58 00 80 | site donné : https://all.accor.com/hotel/B5Y1/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
greet-hotel-limoges-nord-87 | greet hotel Limoges Nord | Limoges:42 rue Frédéric Bastiat | téléphone donné : 05 55 35 54 55 | site donné : https://all.accor.com/hotel/C343/index.fr.shtml | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
hotel-des-deux-moulins-87 | Hôtel des Deux Moulins | Limoges:48 bis avenue Garibaldi | téléphone donné : 05 55 77 39 82 | site donné : https://www.hotel-limoges.com/contact | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
table-adrien-87 | La Table d'Adrien | Limoges:3 avenue Garibaldi | téléphone donné : 05 55 70 25 61 | site donné : https://www.latabledadrien.fr/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
le-versailles-87 | Brasserie Le Versailles | Limoges:20 place d'Aine | téléphone donné : 05 55 34 13 39 | site donné : https://www.brasserie-le-versailles-limoges.com/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
camping-les-deux-iles-87 | Camping Paradis Les Deux Îles | Peyrat-le-Château:lieu-dit Auphelle | téléphone donné : 05 55 35 60 81 | site donné : https://campingles2iles.fr/ | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 80 : employeurs, Industrie (1 sur 2), 15 fiches

```
Lot 80. Vérifie ces 15 employeurs (secteur : Industrie). Réponds au format demandé, dans un seul bloc de code.

st-michel-champagnac | St Michel | Champagnac-de-Belair:24530 Champagnac-de-Belair | téléphone donné : aucun | site donné : https://www.stmichel.fr | page de recrutement donnée : https://www.stmichel.fr/recrutement | à vérifier : téléphone absent
fromarsac | Fromarsac | Marsac-sur-l'Isle:86 Rue du 8 Mai, 24430 Marsac-sur-l'Isle | téléphone donné : 05 53 03 64 00 | site donné : https://www.fromarsac.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
guyenne-papier | Guyenne Papier | Nanthiat:24 Les Castilloux, 24800 Nanthiat | téléphone donné : 05 53 62 20 00 | site donné : https://www.guyennepapier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bouchillou-alkya | Bouchillou Alkya | Bergerac:3 Boulevard des Poudriers, 24100 Bergerac | téléphone donné : 05 53 57 15 95 | site donné : https://www.bouchillou-alkya.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
grasasa | Grasasa | Beaumontois en Périgord:606 Route de Saint-Léon d'Issigeac, 24440 Beaumontois en Périgord | téléphone donné : 05 53 22 32 89 | site donné : https://www.grasasa.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cetec-industrie | CETEC Industrie | Chancelade:8 Chemin des Gabares, 24650 Chancelade | téléphone donné : 05 53 02 85 00 | site donné : https://www.cetec-industrie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
serm24 | SERM 24 | Creysse:35 Route de la Nauve, 24100 Creysse | téléphone donné : 05 53 23 97 00 | site donné : https://www.serm24.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
tpl-systemes | TPL Systèmes | Sarlat-la-Canéda:64 Route du Cambord, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 31 55 00 | site donné : https://www.tpl-systemes.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
industrie-bois-rousseau | Industrie Bois Rousseau | Dussac:Les Nouhauds, 24270 Dussac | téléphone donné : 05 53 52 61 50 | site donné : https://www.ibr24.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
europe-industrie-87 | Europe Industrie 87 | Saint-Junien:17 Rue Évariste Galois, 87200 Saint-Junien | téléphone donné : 05 55 69 19 35 | site donné : https://www.europe-industrie87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
steva-limousin | Steva Limousin | Bessines-sur-Gartempe:Croix du Breuil, 87250 Bessines-sur-Gartempe | téléphone donné : 05 55 60 90 70 | site donné : https://www.steva.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
lacotte-industrie | Lacotte Industrie | Le Palais-sur-Vienne:101 Avenue Jean Giraudoux, 87410 Le Palais-sur-Vienne | téléphone donné : 05 55 35 57 31 | site donné : https://www.lacotte-industrie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
idmc-manufacture | IDMC Manufacture | Limoges:29 Rue Bernard Lathière, 87000 Limoges | téléphone donné : 05 55 53 20 92 | site donné : https://www.idmc-manufacture.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
dvi | DVI | Limoges:30 Rue de Tourcoing, 87000 Limoges | téléphone donné : 05 55 77 53 91 | site donné : https://www.dvi-sa.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
edf-hydraulique-limousin | EDF Hydro Centre | Peyrat-le-Château:Usine hydroélectrique ; Ambazac:Centre de maintenance ; Limoges:Agence territoriale | téléphone donné : aucun | site donné : https://www.edf.fr | page de recrutement donnée : https://www.edf.fr/edf-recrute | à vérifier : téléphone absent
```

## Lot 81 : employeurs, Industrie (2 sur 2), 6 fiches

```
Lot 81. Vérifie ces 6 employeurs (secteur : Industrie). Réponds au format demandé, dans un seul bloc de code.

engie-solutions-haute-vienne | ENGIE Solutions | Limoges:Agence Limoges | téléphone donné : aucun | site donné : https://www.engie-solutions.com | page de recrutement donnée : https://jobs.engie.com | à vérifier : téléphone absent
enedis-haute-vienne | Enedis | Limoges:Agence ; Bellac:Agence | téléphone donné : aucun | site donné : https://www.enedis.fr | page de recrutement donnée : https://www.enedis.fr/recrute | à vérifier : téléphone absent
valeo-limoges | Valeo Matériaux de Friction | Limoges:Zone Industrielle Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://www.valeo.com | page de recrutement donnée : https://careers.valeo.com | à vérifier : téléphone absent
hermes-ganterie | Hermès Ganterie | Saint-Junien:Avenue Nelson Mandela, 87200 Saint-Junien | téléphone donné : aucun | site donné : https://www.hermes.com | page de recrutement donnée : https://talents.hermes.com | à vérifier : téléphone absent
plast-avenir-87 | Plast Avenir 87 | Limoges:Rue Nicolas Appert, 87280 Limoges | téléphone donné : 05 55 37 63 00 | site donné : https://www.plastavenir87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
media6-production | MEDIA6 Production PLV | Verneuil-sur-Vienne:Zone Industrielle du Bos Plan, 87430 Verneuil-sur-Vienne | téléphone donné : 05 55 48 44 00 | site donné : https://www.media6.com | page de recrutement donnée : https://www.media6.com/fr/carrieres | à vérifier : même téléphone que 1 autre(s) fiche(s)
```

## Lot 82 : employeurs, Numérique et télécommunications (1 sur 2), 15 fiches

```
Lot 82. Vérifie ces 15 employeurs (secteur : Numérique et télécommunications). Réponds au format demandé, dans un seul bloc de code.

octopus-business | Octopus Business | Boulazac Isle Manoire:Cré@Vallée Nord, 24750 | téléphone donné : 05 53 03 73 73 | site donné : https://www.octopusbusiness.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
beacom | Agence Beacom | Bergerac:24100 Bergerac | téléphone donné : 05 53 22 99 66 | site donné : https://beacom.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
apsodia | Apsodia | Périgueux:24000 Périgueux | téléphone donné : 05 53 08 26 61 | site donné : https://apsodia.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aplose | APLOSE - Ma Gestion Cloud | Beleymas:24140 | téléphone donné : 05 53 82 66 91 | site donné : https://aplose.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
adekoi | Adekoi | Sanilhac:24660 | téléphone donné : 05 53 35 88 80 | site donné : https://adekoi.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cste | CSTE | Trélissac:24750 | téléphone donné : 05 54 54 35 41 | site donné : https://www.cste.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
orange-dordogne | Orange Business | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://business.orange.fr | page de recrutement donnée : https://orange.jobs | à vérifier : adresse précise absente, téléphone absent
sfr-business-dordogne | SFR Business | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.sfrbusiness.fr | page de recrutement donnée : https://www.sfr.com/recrutement | à vérifier : adresse précise absente, téléphone absent
bouygues-telecom-business-dordogne | Bouygues Telecom Entreprises | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.bouyguestelecomentreprises.fr | page de recrutement donnée : https://carrieres.bouygues.com | à vérifier : adresse précise absente, téléphone absent
limousin-informatique | Limousin Informatique | Limoges: | téléphone donné : aucun | site donné : https://www.limousin-informatique.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
ecomsoft | Ecomsoft | Limoges:2 Rue des Frères Perret, 87280 | téléphone donné : 09 72 17 03 10 | site donné : https://www.ecomsoft.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
solune | Solune | Limoges:2 Avenue de la Mazelle, 87280 | téléphone donné : 05 55 04 34 34 | site donné : https://www.solune.fr | page de recrutement donnée : https://www.solune.fr/recrutement | à vérifier : même téléphone que 1 autre(s) fiche(s)
internatel | Internatél | Le Palais-sur-Vienne:7 Allée de Maison Rouge, 87410 | téléphone donné : 05 55 10 07 02 | site donné : https://www.internatel.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
neowise | Neowise | Limoges:37 Rue Barthélémy Thimonnier, 87280 | téléphone donné : 09 78 31 78 78 | site donné : https://www.neowise.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
orbial | Orbial | Limoges:23 Rue Jean Jaurès, 87000 | téléphone donné : 05 55 79 37 70 | site donné : https://orbial.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 83 : employeurs, Numérique et télécommunications (2 sur 2), 12 fiches

```
Lot 83. Vérifie ces 12 employeurs (secteur : Numérique et télécommunications). Réponds au format demandé, dans un seul bloc de code.

odb | OD&B | Limoges:16 Rue du Crucifix, 87100 | téléphone donné : 05 44 21 39 27 | site donné : https://www.od-b.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
conecti-lds | Conecti by LDS | Limoges:6 Rue Léonard Trompillon, 87100 | téléphone donné : 05 87 31 87 87 | site donné : https://conecti.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
orange-business-haute-vienne | Orange Business | Limoges: ; Saint-Junien: | téléphone donné : aucun | site donné : https://business.orange.fr | page de recrutement donnée : https://orange.jobs | à vérifier : adresse précise absente, téléphone absent
sfr-business-haute-vienne | SFR Business | Limoges: | téléphone donné : aucun | site donné : https://www.sfrbusiness.fr | page de recrutement donnée : https://www.sfr.com/recrutement | à vérifier : adresse précise absente, téléphone absent
bouygues-telecom-business-haute-vienne | Bouygues Telecom Entreprises | Limoges: | téléphone donné : aucun | site donné : https://www.bouyguestelecomentreprises.fr | page de recrutement donnée : https://carrieres.bouygues.com | à vérifier : adresse précise absente, téléphone absent
ecomdata | Ecomdata | Limoges:2 Rue des Frères Perret, 87280 | téléphone donné : 05 55 12 62 62 | site donné : https://www.ecomdata.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
code-to-solve | Code to Solve | Limoges:37 Rue Barthélémy Thimonnier, 87280 | téléphone donné : 05 87 07 04 10 | site donné : https://www.codetosolve.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
fluffy-agency | Fluffy Agency | Limoges:22 Impasse Verthamont, 87000 | téléphone donné : aucun | site donné : https://www.fluffy-agency.com | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
youlead-limoges | Youlead Limoges | Limoges:Agence Limoges, 87000 | téléphone donné : aucun | site donné : https://www.youlead-limoges.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
proximit | Proximit | Aixe-sur-Vienne:Zone Artisanale Moulin Cheyroux, 87700 | téléphone donné : aucun | site donné : https://www.proximit.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
buildeo | Buildéo SARL | Saint-Junien:13 Rue Edison, 87200 | téléphone donné : aucun | site donné : https://www.buildeo.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
atenos | ATENOS | Limoges: | téléphone donné : aucun | site donné : https://atenos.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
```

## Lot 84 : employeurs, Propreté et déchets (1 sur 2), 15 fiches

```
Lot 84. Vérifie ces 15 employeurs (secteur : Propreté et déchets). Réponds au format demandé, dans un seul bloc de code.

veolia-dordogne | Veolia Recyclage et Valorisation des Déchets | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.veolia.fr | page de recrutement donnée : https://www.veolia.com/fr/carrieres | à vérifier : téléphone absent
derichebourg-proprete-dordogne | Derichebourg Propreté | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.derichebourg-proprete.com | page de recrutement donnée : https://www.derichebourg.com/fr/talents | à vérifier : téléphone absent
gsf-aquitaine-dordogne | GSF | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.gsf.fr | page de recrutement donnée : https://www.gsf.fr/recrutement | à vérifier : téléphone absent
atalian-dordogne | Atalian Propreté | Boulazac Isle Manoire:Agence Dordogne | téléphone donné : aucun | site donné : https://www.atalian.com | page de recrutement donnée : https://jobs.atalian.com | à vérifier : téléphone absent
onet-dordogne | Onet Propreté | Périgueux:Agence | téléphone donné : aucun | site donné : https://www.onet.fr | page de recrutement donnée : https://www.groupeonet.com/nous-rejoindre | à vérifier : téléphone absent
samsic-proprete-dordogne | Samsic Propreté | Périgueux:Agence | téléphone donné : aucun | site donné : https://www.samsic.fr | page de recrutement donnée : https://jobs.samsic.com | à vérifier : téléphone absent
aber-proprete-dordogne | Aber Propreté | Bergerac:Agence | téléphone donné : aucun | site donné : https://www.aberproprete.fr | page de recrutement donnée : https://www.aberproprete.fr/recrutement | à vérifier : téléphone absent
nicollin-dordogne | Groupe Nicollin | Périgueux:Agence | téléphone donné : aucun | site donné : https://www.groupenicollin.com | page de recrutement donnée : https://www.groupenicollin.com/recrutement | à vérifier : téléphone absent
derichebourg-proprete-limousin | Derichebourg Propreté | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.derichebourg-proprete.com | page de recrutement donnée : https://www.derichebourg.com/fr/talents | à vérifier : téléphone absent
atalian-limousin | Atalian Propreté | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.atalian.com | page de recrutement donnée : https://jobs.atalian.com | à vérifier : téléphone absent
gsf-limousin | GSF | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.gsf.fr | page de recrutement donnée : https://www.gsf.fr/recrutement | à vérifier : téléphone absent
henault-recyclage | Henault Recyclage | Limoges:13 Rue Fulton, 87280 Limoges | téléphone donné : 05 55 03 18 40 | site donné : https://www.henault.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cdr-environnement | CDR Environnement | Limoges:26 Rue de Tourcoing, 87000 Limoges | téléphone donné : 05 18 05 04 90 | site donné : https://www.cdr-environnement.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
sanicentre-limoges | Sanicentre Limoges | Limoges:21 Rue Nicolas Appert, 87280 Limoges | téléphone donné : 05 55 37 27 40 | site donné : https://www.sanicentre-limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
pns | P.N.S | Verneuil-sur-Vienne:1 Rue de Tranchepie, 87430 Verneuil-sur-Vienne | téléphone donné : 05 55 00 19 01 | site donné : https://www.pns-proprete.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 85 : employeurs, Propreté et déchets (2 sur 2), 13 fiches

```
Lot 85. Vérifie ces 13 employeurs (secteur : Propreté et déchets). Réponds au format demandé, dans un seul bloc de code.

multi-propr-services | Multi-Propr'Services | Couzeix:4 Avenue Maryse Bastié, Parc d'Activité Ocealim, 87270 Couzeix | téléphone donné : aucun | site donné : https://www.multi-propr-services.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
sictom-sud-haute-vienne | SICTOM Sud Haute-Vienne | Saint-Yrieix-la-Perche:Lieu-dit Les Granges, 87500 Saint-Yrieix-la-Perche | téléphone donné : 05 55 08 82 30 | site donné : https://www.sictom-sud87.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
matei-environnement | Matei Environnement | Limoges:Rue de Solignac, 87000 Limoges | téléphone donné : aucun | site donné : https://www.matei-environnement.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
abeille-compost-87 | Abeille Compost 87 | Saint-Junien:87200 Saint-Junien | téléphone donné : aucun | site donné : https://www.abeille-compost.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
net-plus-limoges | Net Plus | Limoges:50 Rue Rhin et Danube, 87280 Limoges | téléphone donné : aucun | site donné : https://www.netplus.fr | page de recrutement donnée : https://www.netplus.fr/recrutement | à vérifier : téléphone absent
limousin-entretien | Limousin Entretien | Limoges:162 Rue Armand Dutreix, 87000 Limoges | téléphone donné : 05 55 05 24 83 | site donné : https://www.limousin-entretien.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
concept-nettoyage | Concept Nettoyage | Saint-Gence:7 Impasse de la Croix des Charriers, 87510 Saint-Gence | téléphone donné : aucun | site donné : https://www.concept-nettoyage87.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
clean-service-87 | Clean Service 87 | Limoges:87000 Limoges | téléphone donné : aucun | site donné : https://www.cleanservice87.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
atalian-facility-limoges | Atalian Facility | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.atalian.com | page de recrutement donnée : https://jobs.atalian.com | à vérifier : téléphone absent
gsf-athena | GSF Athéna | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.gsf.fr | page de recrutement donnée : https://www.gsf.fr/recrutement | à vérifier : téléphone absent
isor-limoges | ISOR | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.isor.fr | page de recrutement donnée : https://www.isor.fr/recrutement | à vérifier : téléphone absent
aber-proprete-limousin | Aber Propreté | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.aberproprete.fr | page de recrutement donnée : https://www.aberproprete.fr/recrutement | à vérifier : téléphone absent
challancin-limoges | Challancin | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.challancin.fr | page de recrutement donnée : https://www.challancin.fr/recrutement | à vérifier : téléphone absent
```

## Lot 86 : employeurs, Santé et médico-social (1 sur 3), 15 fiches

```
Lot 86. Vérifie ces 15 employeurs (secteur : Santé et médico-social). Réponds au format demandé, dans un seul bloc de code.

inovie-novabio-dordogne | Inovie Novabio | Bergerac:17 Rue Mounet Sully ; Chancelade:58 Avenue des Reynats ; Saint-Astier:17 Rue Maréchal Foch ; Sarlat-la-Canéda:17 Avenue du Général de Gaulle ; Le Bugue:2 Impasse des Chaumes ; Thiviers:2 Impasse du Laboratoire | téléphone donné : aucun | site donné : https://inovie.fr | page de recrutement donnée : https://inovie.fr/recrutement | à vérifier : téléphone absent
biogroup-dordogne | Biogroup | Bergerac ; Périgueux ; Sarlat-la-Canéda | téléphone donné : aucun | site donné : https://www.biogroup.fr | page de recrutement donnée : https://carrieres.biogroup.fr | à vérifier : adresse précise absente, téléphone absent
cerballiance-dordogne | Cerballiance | Bergerac ; Périgueux | téléphone donné : aucun | site donné : https://www.cerballiance.fr | page de recrutement donnée : https://jobs.cerbahealthcare.com | à vérifier : adresse précise absente, téléphone absent
korian-dordogne | Korian | Trélissac:1 Rue de l'Isle ; Sanilhac:1 Rue de la Mairie ; Vergt:3 Rue Jean Moulin ; Issigeac:42 Rue du Tour de Ville | téléphone donné : aucun | site donné : https://www.korian.fr | page de recrutement donnée : https://jobs.clariane.com | à vérifier : téléphone absent
colisee-dordogne | Colisée | Val de Louyre et Caudeau:5 Rue de Lostanges, Les Jardins des Hauts de Sainte-Alvère | téléphone donné : aucun | site donné : https://www.colisee.fr | page de recrutement donnée : https://jobs.colisee.fr | à vérifier : téléphone absent
emeis-dordogne | emeis | Périgueux ; Bergerac | téléphone donné : aucun | site donné : https://www.emeis.fr | page de recrutement donnée : https://recrutement-emeis.com | à vérifier : adresse précise absente, téléphone absent
ambulances-reunies | Ambulances Réunies | Creysse:6 Rue Carpe Diem ; Champcevinel:Allée de Jarijoux ; Montignac-Lascaux | téléphone donné : aucun | site donné : https://www.ambulances-reunies.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
dordogne-ambulances | Dordogne Ambulances | Terrasson-Lavilledieu:89 Avenue Victor Hugo | téléphone donné : 05 53 50 36 36 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ambulances-paoli | Ambulances Paoli | Pays de Belvès:Rue de l'Aérodrome | téléphone donné : 05 53 31 47 47 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
secours-ambulances-services-24 | Secours Ambulances Services 24 | Périgueux:Chemin des Feutres du Toulon | téléphone donné : 05 53 03 28 28 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
laboratoire-departemental-dordogne | Laboratoire Départemental d'Analyse et de Recherche de la Dordogne | Coulounieix-Chamiers:161 Avenue Winston Churchill | téléphone donné : 05 53 06 80 00 | site donné : https://www.labo24.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
domusvi-dordogne | DomusVi | Saint-Pierre-de-Chignac:93 Route d'Eyliac (EHPAD Villa du Manoire) | téléphone donné : aucun | site donné : https://www.domusvi.com | page de recrutement donnée : https://recrutement.domusvi.com | à vérifier : téléphone absent
vyv3-dordogne | VYV3 Cœur d'Aquitaine | Périgueux:établissements mutualistes ; Bergerac:établissements mutualistes ; Sarlat-la-Canéda:établissements mutualistes | téléphone donné : aucun | site donné : https://www.vyv3.fr | page de recrutement donnée : https://recrutement.vyv3.fr | à vérifier : téléphone absent
perigord-ambulances | Périgord Ambulances | Trélissac:176 Avenue Michel Grandou, 24750 Trélissac | téléphone donné : 05 53 04 37 47 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
fredange-ambulances-rouffignacoises | SAS Fredange Ambulances Rouffignacoises | Rouffignac-Saint-Cernin-de-Reilhac:Zone industrielle, Allée des Farges | téléphone donné : 05 53 05 41 52 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 87 : employeurs, Santé et médico-social (2 sur 3), 15 fiches

```
Lot 87. Vérifie ces 15 employeurs (secteur : Santé et médico-social). Réponds au format demandé, dans un seul bloc de code.

ambulances-taxis-lalinde | Ambulances et Taxis de Lalinde | Lalinde:168 Avenue Paul Langevin, ZAE Les Galandoux | téléphone donné : 05 53 61 05 58 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ehpad-mussidan | EHPAD de Mussidan | Mussidan:Route de Sainte-Foy, 24400 Mussidan | téléphone donné : 05 53 81 83 85 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
vyv3-haute-vienne | VYV3 Cœur d'Aquitaine | Limoges ; Boisseuil ; Saint-Yrieix-la-Perche | téléphone donné : aucun | site donné : https://www.vyv3.fr | page de recrutement donnée : https://recrutement.vyv3.fr | à vérifier : adresse précise absente, téléphone absent
biogroup-haute-vienne | BIOGROUP Atlantique Centre | Limoges:7-11 Avenue du Maréchal de Lattre-de-Tassigny ; Limoges:1 Place d'Aine ; Limoges:1 Place de la Poste (Beaubreuil) ; Saint-Junien:5 Square Dupuytren ; Aixe-sur-Vienne:35B Avenue du Président Wilson | téléphone donné : aucun | site donné : https://www.biogroup.fr | page de recrutement donnée : https://carrieres.biogroup.fr | à vérifier : téléphone absent
inovie-biolyss-haute-vienne | INOVIE Biolyss | Limoges:40 Rue de Fougeras ; Limoges:autres laboratoires du réseau | téléphone donné : aucun | site donné : https://inovie.fr | page de recrutement donnée : https://inovie.fr/recrutement | à vérifier : téléphone absent
emeis-haute-vienne | emeis | Limoges:Résidence Saint Martial, Allée Rameau | téléphone donné : aucun | site donné : https://www.emeis.fr | page de recrutement donnée : https://www.emeis.fr/recrutement | à vérifier : téléphone absent
domusvi-haute-vienne | DomusVi | Limoges ; Panazol ; Saint-Junien | téléphone donné : aucun | site donné : https://www.domusvi.com | page de recrutement donnée : https://emploi.domusvi.com | à vérifier : adresse précise absente, téléphone absent
colisee-haute-vienne | Colisée | Limoges ; Isle ; Saint-Yrieix-la-Perche | téléphone donné : aucun | site donné : https://www.colisee.fr | page de recrutement donnée : https://jobs.colisee.fr | à vérifier : adresse précise absente, téléphone absent
korian-haute-vienne | Korian (Clariane) | Limoges ; Isle | téléphone donné : aucun | site donné : https://www.korian.fr | page de recrutement donnée : https://jobs.clariane.com | à vérifier : adresse précise absente, téléphone absent
express-ambulances-haute-vienne | Express'Ambulances | Limoges:5 Rue de Toulouse, 87000 Limoges | téléphone donné : 05 55 79 01 51 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
malika-associes-ambulances | Malika et Associés Ambulances | Limoges:108 Rue Eugène Varlin, 87000 Limoges | téléphone donné : 05 55 78 78 78 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
lcb-ambulances | LCB Ambulances | Feytiat:23 Avenue Winston Churchill, 87220 Feytiat | téléphone donné : 05 55 30 33 30 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ambulances-pascal-87 | Ambulances Pascal 87 | Limoges:6 Rue Léonard Trompillon, 87100 Limoges | téléphone donné : 05 55 32 29 29 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ehpad-les-5-sens | EHPAD Les 5 Sens | Limoges:51 Rue Jean de Vienne, 87100 Limoges | téléphone donné : 05 51 99 92 44 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ehpad-jean-mahaut | EHPAD Jean Mahaut | Nieul:1 Rue Jean Mahaut, 87510 Nieul | téléphone donné : 05 55 75 60 32 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 88 : employeurs, Santé et médico-social (3 sur 3), 4 fiches

```
Lot 88. Vérifie ces 4 employeurs (secteur : Santé et médico-social). Réponds au format demandé, dans un seul bloc de code.

ehpad-le-puy-martin | EHPAD Le Puy Martin | Le Palais-sur-Vienne:Le Mas, 87410 Le Palais-sur-Vienne | téléphone donné : 05 55 04 43 00 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ehpad-residence-du-parc | EHPAD Résidence du Parc | Panazol:2 Rue Raoul Vergez, 87350 Panazol | téléphone donné : 05 55 75 41 10 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ehpad-pelaudine | EHPAD La Pélaudine | Eymoutiers:4 Place du Champ de Foire, 87120 Eymoutiers | téléphone donné : 05 55 69 10 28 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
unite-vie-victor-thuillat | Unité de Vie Victor Thuillat | Limoges:4 Cité Victor Thuillat, 87100 Limoges | téléphone donné : 05 55 12 15 36 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 89 : employeurs, Sécurité et gardiennage (1 sur 3), 15 fiches

```
Lot 89. Vérifie ces 15 employeurs (secteur : Sécurité et gardiennage). Réponds au format demandé, dans un seul bloc de code.

gsp-security | GSP Security | Périgueux:20 Rue du 4 Septembre, 24000 Périgueux | téléphone donné : 07 88 04 27 97 | site donné : https://gsp-security.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
spp-securite | SPP Sécurité | Coulounieix-Chamiers:295 Boulevard des Saveurs, 24660 Coulounieix-Chamiers | téléphone donné : 05 25 23 04 32 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
asi-perigueux | ASI | Périgueux:60 Rue Gambetta, 24000 Périgueux | téléphone donné : 05 53 53 20 73 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
competence-securite | Compétence Sécurité | Périgueux:7 Rue du Lys, 24000 Périgueux | téléphone donné : 06 17 16 71 56 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
gs3-securite | GS3 Sécurité | Périgueux:54 Rue du Président Wilson, 24000 Périgueux | téléphone donné : 07 61 58 52 12 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
xantor-vigilance | Xantor Vigilance et Sécurité | Saint-Astier:24 Rue des Gendarmes Joffre et Chollon, 24110 Saint-Astier | téléphone donné : 06 09 39 90 70 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
detexial-securite | Detexial Sécurité | Saint-Martial-d'Artenset:628 Route des 5 Coupoles, 24700 Saint-Martial-d'Artenset | téléphone donné : 05 53 29 58 78 | site donné : https://www.detexial.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
seris-security | Seris Security | Périgueux:Agence Dordogne ; Bergerac: | téléphone donné : aucun | site donné : https://www.seris.fr | page de recrutement donnée : https://www.seris.fr/recrutement | à vérifier : téléphone absent
weesure-protection | Weesure Protection | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.weesure.fr | page de recrutement donnée : https://www.weesure.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
france-gardiennage | France Gardiennage | Sarlat-la-Canéda: ; Périgueux: | téléphone donné : aucun | site donné : https://www.francegardiennage.fr | page de recrutement donnée : https://www.francegardiennage.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
provencale-securite | Provençale Sécurité | Périgueux: | téléphone donné : aucun | site donné : https://www.provencalesecurite.fr | page de recrutement donnée : https://www.provencalesecurite.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
limousin-securite | Limousin Sécurité | Limoges:9 Rue Léon Serpollet, 87280 Limoges | téléphone donné : 05 55 37 65 14 | site donné : https://www.limousin-securite.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aps-87 | APS 87 | Limoges:13 Rue Atlantis, 87280 Limoges | téléphone donné : 05 55 35 26 44 | site donné : https://www.aps87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
groupe-sgp-limoges | Groupe SGP | Limoges:Agence Haute-Vienne, 87280 Limoges | téléphone donné : aucun | site donné : https://www.groupe-sgp.fr | page de recrutement donnée : https://www.groupe-sgp.fr/recrutement | à vérifier : téléphone absent
seris-security-limoges | Seris Security | Limoges:Agence Haute-Vienne, 87000 Limoges | téléphone donné : aucun | site donné : https://www.seris.fr | page de recrutement donnée : https://www.seris.fr/recrutement | à vérifier : téléphone absent
```

## Lot 90 : employeurs, Sécurité et gardiennage (2 sur 3), 15 fiches

```
Lot 90. Vérifie ces 15 employeurs (secteur : Sécurité et gardiennage). Réponds au format demandé, dans un seul bloc de code.

securitas-france-limoges | Securitas France | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.securitas.fr | page de recrutement donnée : https://www.securitas.fr/carrieres | à vérifier : téléphone absent
fiducial-securite-limoges | Fiducial Sécurité | Limoges:Agence Haute-Vienne | téléphone donné : aucun | site donné : https://www.fiducial-securite.fr | page de recrutement donnée : https://www.fiducial-securite.fr/recrutement | à vérifier : téléphone absent
protectim-security-limoges | Protectim Security Group | Limoges: | téléphone donné : aucun | site donné : https://www.protectim.fr | page de recrutement donnée : https://www.protectim.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
weesure-limoges | Weesure Protection | Limoges: | téléphone donné : aucun | site donné : https://www.weesure.fr | page de recrutement donnée : https://www.weesure.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
torann-france-limoges | Torann-France | Limoges: | téléphone donné : aucun | site donné : https://www.torann-france.fr | page de recrutement donnée : https://www.torann-france.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
goron-limoges | Goron | Limoges: | téléphone donné : aucun | site donné : https://www.goron.fr | page de recrutement donnée : https://www.goron.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
atlas-securite | Atlas Sécurité Privée | Limoges:87000 Limoges | téléphone donné : aucun | site donné : https://www.atlassecurite.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
psl-securite | PSL Sécurité | Limoges:87280 Limoges | téléphone donné : aucun | site donné : https://www.psl-securite.fr | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
samsic-securite-limoges | Samsic Sécurité | Limoges: | téléphone donné : aucun | site donné : https://www.samsic-securite.fr | page de recrutement donnée : https://jobs.samsic.com | à vérifier : adresse précise absente, téléphone absent
team-securite | Team Sécurité | Panazol:16 Rue de la Liberté, 87350 Panazol | téléphone donné : 06 69 35 24 62 | site donné : https://www.teamsecurite.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
osyris-securite | Osyris Sécurité Privée | Limoges:17 Rue Françoise Sagan, 87100 Limoges | téléphone donné : 06 34 41 59 52 | site donné : https://www.osyris-securite.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
laya-securite | LAYA Sécurité Privée 87 | Limoges:23 Rue Jean Jaurès, 87000 Limoges | téléphone donné : 07 49 35 01 41 | site donné : https://www.laya-securite.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
wise-securite | Wise Sécurité | Limoges:25 Rue des Horticulteurs, 87000 Limoges | téléphone donné : 05 55 75 94 41 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
mp-sp | MP SP | Verneuil-sur-Vienne:15 Allée de Prasmounier, 87430 Verneuil-sur-Vienne | téléphone donné : 06 49 01 26 36 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
alk-securite | ALK Sécurité | Nedde:100 Rue des Écoliers, 87120 Nedde | téléphone donné : 07 57 47 32 61 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 91 : employeurs, Sécurité et gardiennage (3 sur 3), 5 fiches

```
Lot 91. Vérifie ces 5 employeurs (secteur : Sécurité et gardiennage). Réponds au format demandé, dans un seul bloc de code.

gpsi-securite | GPSI Sécurité | Limoges:60 Rue Watteau, 87000 Limoges | téléphone donné : 07 82 81 08 80 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
segao-securite | SEGAO Sécurité | Feytiat:9 Allée d'Aquitaine, 87220 Feytiat | téléphone donné : 07 49 23 76 16 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
apm-securite-87 | APM Sécurité 87 | Limoges:25 Allée Alfred Leclerc, 87100 Limoges | téléphone donné : 06 06 63 67 88 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
protection-securite-privee | Protection Sécurité Privée | Limoges:38 Rue François Chénieux, 87000 Limoges | téléphone donné : 06 50 02 28 83 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
lynx-securite-europe | Lynx Sécurité Europe | Limoges:4 Rue Claude Henri Gorceix, 87280 Limoges | téléphone donné : 05 55 42 71 32 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 92 : employeurs, Aide à la personne et action sociale (1 sur 3), 15 fiches

```
Lot 92. Vérifie ces 15 employeurs (secteur : Aide à la personne et action sociale). Réponds au format demandé, dans un seul bloc de code.

admr-dordogne | ADMR Dordogne | Sanilhac:8 Allée de Borie Marty, 24660 Sanilhac ; Saint-Aulaye-Puymangou:34 Rue du Docteur H. Lacroix, 24410 Saint-Aulaye-Puymangou | téléphone donné : aucun | site donné : https://www.fede24.admr.org | page de recrutement donnée : https://recrute.admr.org | à vérifier : téléphone absent
admr-la-voie-verte | ADMR La Voie Verte | Sanilhac:8 Allée de Borie Marty, 24660 Sanilhac | téléphone donné : 05 53 04 09 86 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
amad-sud-bergeracois | Association Maintien à Domicile Sud Bergeracois (AMAD) | Eymet: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
aide-familiale-domicile-bergerac | Aide Familiale à Domicile | Bergerac:37 Rue Blaise Pascal, 24100 Bergerac | téléphone donné : 05 53 57 58 98 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aard-av24 | AARD AV 24 | Bergerac:151 Rue Valette, 24100 Bergerac | téléphone donné : 05 53 57 79 83 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
assad-dordogne | ASSAD Dordogne | Périgueux: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
asadhp | ASADHP | Thiviers:1 Espace Pierre Beylot, 24800 Thiviers | téléphone donné : 05 53 62 39 82 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
association-cc-aide-domicile-mussidan | Association Communauté de Communes d'Aide à Domicile | Mussidan:Place Woodbridge, 24400 Mussidan | téléphone donné : 05 53 81 27 60 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
service-aide-personne-sarladais | Service d'Aide à la Personne du Sarladais | Sarlat-la-Canéda:13 Avenue Gambetta, 24200 Sarlat-la-Canéda | téléphone donné : 05 53 59 23 26 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
vitadom | Vitadom | Bergerac: ; Sarlat-la-Canéda:2 Boulevard Nessmann, 24200 Sarlat-la-Canéda | téléphone donné : aucun | site donné : https://www.vitadom.fr | page de recrutement donnée : https://www.vitadom.fr/recrutement | à vérifier : adresse précise absente, téléphone absent
adapei24 | Adapei de la Dordogne | Boulazac Isle Manoire: ; Bergerac: ; Sarlat-la-Canéda: ; Terrasson-Lavilledieu: ; Montpon-Ménestérol: ; Ribérac: | téléphone donné : 05 53 02 15 15 | site donné : https://www.adapei24.fr | page de recrutement donnée : https://www.adapei24.fr/recrutement | à vérifier : adresse précise absente
croix-rouge-dordogne | Croix-Rouge française Dordogne | Périgueux: ; Bergerac: ; Sarlat-la-Canéda: | téléphone donné : aucun | site donné : https://www.croix-rouge.fr | page de recrutement donnée : https://recrutement.croix-rouge.fr | à vérifier : adresse précise absente, téléphone absent
admr-haute-vienne | ADMR Haute-Vienne | Limoges: ; Bellac: ; Saint-Junien: ; Eymoutiers: ; Saint-Léonard-de-Noblat: | téléphone donné : aucun | site donné : https://www.fede87.admr.org | page de recrutement donnée : https://recrute.admr.org | à vérifier : adresse précise absente, téléphone absent
adom-limousin | A DOM' Limousin | Limoges:12 Rue de la Réforme, 87000 Limoges | téléphone donné : 05 55 32 64 66 | site donné : https://www.adomlimousin.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
actimad | ACTIMAD | Panazol:20 Avenue du Président Vincent Auriol, 87350 Panazol | téléphone donné : 05 55 06 15 58 | site donné : https://www.actimad.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 93 : employeurs, Aide à la personne et action sociale (2 sur 3), 15 fiches

```
Lot 93. Vérifie ces 15 employeurs (secteur : Aide à la personne et action sociale). Réponds au format demandé, dans un seul bloc de code.

aapmb | Association Aide à la Personne Monts et Barrages | Eymoutiers:8 Rue de la Collégiale ; Châteauneuf-la-Forêt:3 Rue de la Combe aux Bœufs ; Saint-Léonard-de-Noblat:15 Rue de Beaufort | téléphone donné : 05 55 69 79 01 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
una-ouest-87 | UNA OUEST 87 | Saint-Junien:10 Boulevard de la République, 87200 Saint-Junien | téléphone donné : 05 55 02 46 01 | site donné : https://www.una.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
vie-paisible-limoges-87 | Vie Paisible | Limoges:10 Rue d'Isly, 87000 Limoges | téléphone donné : 05 55 32 26 60 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
limousin-aide-a-domicile-87 | Limousin Aide à Domicile | Limoges:18 Rue Aigueperse, 87000 Limoges | téléphone donné : 05 55 33 34 08 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
people-and-baby-dordogne | People & Baby | Périgueux: ; Bergerac: | téléphone donné : aucun | site donné : https://www.people-and-baby.com | page de recrutement donnée : https://recrutement.people-and-baby.com | à vérifier : adresse précise absente, téléphone absent
babilou-dordogne | Babilou | Boulazac Isle Manoire: ; Bergerac: | téléphone donné : aucun | site donné : https://www.babilou.fr | page de recrutement donnée : https://www.babilou.fr/carrieres | à vérifier : adresse précise absente, téléphone absent
lea-et-leo-dordogne | Léa & Léo | Périgueux: ; Coulounieix-Chamiers: | téléphone donné : aucun | site donné : https://www.leaetleo.com | page de recrutement donnée : https://www.leaetleo.com/recrutement | à vérifier : adresse précise absente, téléphone absent
foyer-vie-lysander | Foyer de Vie Lysander | Bassillac et Auberoche:Fon d'Uzerche, 24330 Bassillac et Auberoche | téléphone donné : 05 53 02 60 80 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
foyer-lou-prat-dou-solelh | Foyer de Vie Lou Prat Dòu Solelh | Ribérac:Rue André Cheminade, ZA Les Chaumes | téléphone donné : 05 53 91 94 65 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
foyer-jacques-delprat | Foyer Jacques Delprat | Monpazier:8 Rue Galmot | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
croix-rouge-haute-vienne | Croix-Rouge française | Limoges: ; Saint-Junien: ; Bellac: | téléphone donné : aucun | site donné : https://www.croix-rouge.fr | page de recrutement donnée : https://recrutement.croix-rouge.fr | à vérifier : adresse précise absente, téléphone absent
confiez-nous-haute-vienne | Confiez-Nous | Ambazac:13 Avenue de la Libération ; Saint-Yrieix-la-Perche:1 Avenue Jean Timbaud ; Isle:12 Rue Joseph Cazautets ; Saint-Léonard-de-Noblat:1 Place Wilson | téléphone donné : aucun | site donné : https://www.confiez-nous.fr | page de recrutement donnée : https://www.confiez-nous.fr/recrutement | à vérifier : téléphone absent
azae-haute-vienne | Azaé | Saint-Junien:4 Avenue Victor Roche | téléphone donné : aucun | site donné : https://www.azae.com | page de recrutement donnée : https://www.azae.com/recrutement | à vérifier : téléphone absent
eveil-aides-services | Éveil Aides et Services à Domicile | Ambazac:2 Avenue Pasteur ; Compreignac:Bachellerie | téléphone donné : 06 15 53 69 67 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aides-et-services-87 | Aides et Services 87 | Limoges:74 Bis Avenue Garibaldi | téléphone donné : 05 55 49 04 62 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 94 : employeurs, Aide à la personne et action sociale (3 sur 3), 3 fiches

```
Lot 94. Vérifie ces 3 employeurs (secteur : Aide à la personne et action sociale). Réponds au format demandé, dans un seul bloc de code.

afrpa-bessines-lauriere | AFRPA Bessines-Laurière | Bessines-sur-Gartempe:Mairie | téléphone donné : 05 55 76 96 92 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
bmpah | BMPAH | Val d'Issoire:8 Rue du Marché Ovin (Mézières-sur-Issoire) | téléphone donné : 05 55 60 40 38 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cias-pays-nexon-monts-de-chalus | CIAS Pays de Nexon-Monts de Châlus | Nexon:6 Place de l'Église | téléphone donné : 05 55 36 07 98 | site donné : https://www.paysdenexon-montsdechalus.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 95 : employeurs, Sport, animation et centres sociaux (1 sur 3), 15 fiches

```
Lot 95. Vérifie ces 15 employeurs (secteur : Sport, animation et centres sociaux). Réponds au format demandé, dans un seul bloc de code.

profession-sport-loisirs-dordogne | Profession Sport & Loisirs Dordogne | Périgueux:Halle 3, 2 Rue Alphée Mazieras, 24000 Périgueux | téléphone donné : 05 53 35 34 41 | site donné : https://dordogne.profession-sport-loisirs.fr | page de recrutement donnée : https://www.lesportrecrute.fr/pages-entreprises/emploi-Psl-24-e-459 | à vérifier : même téléphone que 2 autre(s) fiche(s)
geiq-sport-animation-dordogne | GEIQ Sport Animation Nouvelle-Aquitaine - Antenne Dordogne | Périgueux:Halle 3, 2 Rue Alphée Mazieras, 24000 Périgueux | téléphone donné : 05 53 35 34 41 | site donné : https://dordogne.profession-sport-loisirs.fr/geiq-sport-animation-na-dordogne | page de recrutement donnée : aucune | à vérifier : même téléphone que 2 autre(s) fiche(s), page de recrutement absente
federation-centres-sociaux-perigord | Fédération Départementale des Centres Sociaux du Périgord | Marsac-sur-l'Isle:95 Route de Bordeaux, 24430 | téléphone donné : 07 89 34 00 03 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-jean-moulin | Centre Social Jean Moulin | Bergerac:Rue des Frères Prêcheurs, 24100 | téléphone donné : 05 53 22 23 40 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-germaine-tillion | Centre Social Germaine Tillion | Bergerac:1 Rue Alphonse Daudet, 24100 | téléphone donné : 05 53 57 92 78 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-brunetiere | Centre Social La Brunetière | Bergerac:Rue Sergent Rey, 24100 | téléphone donné : 05 53 63 15 57 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-arche | Centre Social et Culturel L'Arche | Périgueux:68 Rue Pierre Brantôme, 24000 | téléphone donné : 05 53 09 50 43 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-saint-exupery | Centre Social Saint-Exupéry | Coulounieix-Chamiers:2 Avenue du Maréchal de Lattre de Tassigny, 24660 | téléphone donné : 05 53 45 60 30 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-passerelle | Centre Social et Culturel Passerelle Vézère Haut Périgord Noir | Thenon:5 Place Michel Montaigne, 24210 | téléphone donné : 05 53 35 09 96 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
loft-fitness-perigueux | Le Loft Fitness Club | Périgueux:8 Rue Thiers, 24000 | téléphone donné : 05 53 03 45 60 | site donné : https://www.leloftfitnessclub.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
club-sport-conscience | Le Club Sport en Conscience | Bergerac:112 Avenue du Général de Gaulle, 24100 | téléphone donné : 05 53 27 16 18 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
liberty-gym-sarlat | Liberty Gym | Sarlat-la-Canéda:42 Avenue de la Dordogne, 24200 | téléphone donné : 07 55 59 33 50 | site donné : https://libertygym.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
duck-gym | Duck Gym | Le Bugue:49 Rue du Cingle, 24260 | téléphone donné : 05 53 45 96 56 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
profession-sport-loisirs-haute-vienne | Profession Sport & Loisirs Haute-Vienne | Limoges:13 Rue Pierre Bernardaud, 87100 | téléphone donné : 06 50 40 36 85 | site donné : https://lesportrecrute.fr | page de recrutement donnée : https://lesportrecrute.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
geiq-sana-87 | GEIQ Sport Animation Nouvelle-Aquitaine - Haute-Vienne | Limoges:13 Rue Pierre Bernardaud, 87100 | téléphone donné : 06 50 40 36 85 | site donné : https://lesportrecrute.fr | page de recrutement donnée : https://lesportrecrute.fr | à vérifier : même téléphone que 1 autre(s) fiche(s)
```

## Lot 96 : employeurs, Sport, animation et centres sociaux (2 sur 3), 15 fiches

```
Lot 96. Vérifie ces 15 employeurs (secteur : Sport, animation et centres sociaux). Réponds au format demandé, dans un seul bloc de code.

cdos-haute-vienne | Comité Départemental Olympique et Sportif de la Haute-Vienne | Limoges:55 Rue de l'Ancienne École Normale d'Instituteurs, 87000 | téléphone donné : 05 55 79 20 87 | site donné : https://cdos87.fr | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
asptt-limoges | ASPTT Limoges | Limoges:45 Rue de Chantelauve, 87000 | téléphone donné : 05 87 41 56 25 | site donné : https://limoges.asptt.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
cheops-87 | CHÉOPS 87 | Limoges:55 Rue de l'Ancienne École Normale d'Instituteurs, 87000 | téléphone donné : 05 55 79 20 87 | site donné : https://www.cheops87.com | page de recrutement donnée : aucune | à vérifier : même téléphone que 1 autre(s) fiche(s), page de recrutement absente
magic-fitness-couzeix | Magic Fitness | Couzeix:6 Rue des Fourneries, 87270 | téléphone donné : 05 55 69 75 13 | site donné : https://www.magicfitness.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
iron-gym-limoges | Iron Gym | Limoges:31 Rue François Chénieux, 87000 | téléphone donné : 05 55 79 74 23 | site donné : https://www.irongym87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
planete-forme-feytiat | Planète Forme | Feytiat:3 Rue Clément Ader, 87220 | téléphone donné : 05 55 09 82 72 | site donné : https://www.planeteforme.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
espace-forme-limoges | Espace Forme | Limoges:89 Rue du Chinchauvaud, 87000 | téléphone donné : 05 55 37 43 14 | site donné : https://www.espaceforme87.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ma-salle-limoges | Ma Salle | Limoges:69 Rue Pierre et Marie Curie, 87000 | téléphone donné : 05 55 36 11 23 | site donné : https://www.masalle.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-alis | Centre Social Aristide Briand ALIS | Limoges:209 Rue Aristide Briand, 87100 | téléphone donné : 05 55 10 95 36 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-entre-deux | Centre Social Entre Deux ALIS | Limoges:53 Avenue des Coutures, 87000 | téléphone donné : 05 87 75 80 64 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-beaubreuil | Centre Social Municipal de Beaubreuil | Limoges:32 Allée Marcel Proust, 87280 | téléphone donné : 05 55 45 64 84 | site donné : https://www.limoges.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-parenthese-glane | Centre Social Municipal La Parenthèse de la Glane | Saint-Junien:12 Avenue de Precoin, 87200 | téléphone donné : 07 61 64 42 75 | site donné : https://www.saint-junien.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
club-des-sports-saint-junien | Le Club des Sports | Saint-Junien:13 Rue Augustin Fresnel, 87200 | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
terrajob | Terra'Job | Périgueux:44 Rue du Sergent Bonnelie, 24000 | téléphone donné : 05 53 35 34 41 | site donné : https://terra-job.fr | page de recrutement donnée : https://terra-job.fr | à vérifier : même téléphone que 2 autre(s) fiche(s)
temps-jeunes-terrasson | Association Temps Jeunes | Terrasson-Lavilledieu:Rue Pasteur, 24120 | téléphone donné : 05 53 50 66 61 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 97 : employeurs, Sport, animation et centres sociaux (3 sur 3), 8 fiches

```
Lot 97. Vérifie ces 8 employeurs (secteur : Sport, animation et centres sociaux). Réponds au format demandé, dans un seul bloc de code.

soutien-partage-evasion | Association Soutien Partage Évasion | Villamblard:15 Rue Édouard Dupuy, 24140 | téléphone donné : 05 53 81 60 77 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
ajmr-lalinde | AJMR Lalinde | Lalinde:L'Écluse Rue du Docteur James, 24150 | téléphone donné : 05 53 63 28 27 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-loisirs-jeunes-limoges | Centre Loisirs Jeunes de Limoges | Limoges: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
cral87 | Centre de Ressources des Accueils de Loisirs de la Haute-Vienne | Limoges: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
mjc-limoges | MJC Limoges | Limoges: | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
familles-rurales-na | Familles Rurales Fédération Régionale Nouvelle-Aquitaine | Limoges: | téléphone donné : aucun | site donné : https://www.famillesrurales.org | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
alsc-bellevue-sainte-claire | ASC Bellevue Sainte-Claire | Limoges:32 Rue Pierre et Marie Curie, 87000 | téléphone donné : 05 55 33 12 59 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-social-alchimis | Centre social Alchimis | Limoges:1 Allée Émile Kahn, 87100 | téléphone donné : 05 55 57 38 24 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 98 : employeurs, Transport et logistique (1 sur 3), 15 fiches

```
Lot 98. Vérifie ces 15 employeurs (secteur : Transport et logistique). Réponds au format demandé, dans un seul bloc de code.

transports-gil | Transports Gil | Creysse:Zone Artisanale, 24100 Creysse | téléphone donné : 05 24 10 85 57 | site donné : https://www.transports-gil.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
quertour-transports | Quertour Transports | Creysse:34 Route de la Nauve, 24100 Creysse | téléphone donné : 05 53 27 96 90 | site donné : https://www.quertour.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-peyrou | Transports Peyrou | Bertric-Burée:ZA, 3007 Route Aliénor d'Aquitaine, 24320 Bertric-Burée | téléphone donné : 05 53 90 23 27 | site donné : https://www.transportspeyrou.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-gauthier | Transports Gauthier | Saint-Pardoux-la-Rivière:465 Route des Moulins, 24470 Saint-Pardoux-la-Rivière | téléphone donné : 05 53 56 70 08 | site donné : https://www.transportsgauthier.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-jr-maury | Transports J.R. Maury | Négrondes:Fongou, 24460 Négrondes | téléphone donné : 05 53 55 07 10 | site donné : https://www.transports-maury.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-pijassou | SAS Transports Pijassou | Thiviers:Zone Industrielle, 24800 Thiviers | téléphone donné : 05 53 62 81 60 | site donné : https://www.transportspijassou.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-malaurie | Transports Malaurie | Le Buisson-de-Cadouin:Route Le Grand Chemin, 24480 Le Buisson-de-Cadouin | téléphone donné : 05 53 22 01 57 | site donné : https://www.transports-malaurie.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
voyages-duverneuil | Voyages Duverneuil | Brantôme en Périgord:2710 Route Antoine de Saint-Exupéry, 24310 Brantôme en Périgord | téléphone donné : 05 53 46 36 94 | site donné : https://www.voyages-duverneuil.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
perigord-voyages | Périgord Voyages | Carsac-Aillac:24200 Carsac-Aillac | téléphone donné : 05 53 59 01 48 | site donné : https://www.perigord-voyages.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
voyages-rey | Voyages Rey | Le Bugue:27 Route de Campagne, 24260 Le Bugue | téléphone donné : 05 53 07 27 22 | site donné : https://www.voyages-rey.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
aquitaine-cars | Aquitaine Cars | Montpon-Ménestérol:Avenue Jean Jaurès, 24700 Montpon-Ménestérol | téléphone donné : 05 53 80 33 18 | site donné : https://www.aquitaine-cars.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-bellanger | Transports Bellanger | Grignols:518 Rue du Vern, 24110 Grignols | téléphone donné : 05 53 54 24 19 | site donné : https://www.transports-bellanger.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transport-big-big | Transport Big Big | Saint-Astier:ZA Astier Val, 3 Rue des Lys, 24110 Saint-Astier | téléphone donné : 05 53 35 37 90 | site donné : https://www.bigbig.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-briche | Transports Briche | Limoges:87 Avenue du Président John Kennedy, 87000 Limoges | téléphone donné : 05 55 30 10 74 | site donné : https://www.transports-briche.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-leroux | Transports Leroux | Boisseuil:Rue de la Plaine, ZA, 87220 Boisseuil | téléphone donné : 05 55 30 67 23 | site donné : https://www.transports-leroux.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 99 : employeurs, Transport et logistique (2 sur 3), 15 fiches

```
Lot 99. Vérifie ces 15 employeurs (secteur : Transport et logistique). Réponds au format demandé, dans un seul bloc de code.

roulaud-transports | Roulaud Transports | Condat-sur-Vienne:68 Rue Montaigne, 87920 Condat-sur-Vienne ; Saint-Laurent-sur-Gorre:3 Rue de la Promenade, 87310 Saint-Laurent-sur-Gorre | téléphone donné : aucun | site donné : https://www.roulaud-transports.fr | page de recrutement donnée : https://www.roulaud-transports.fr/recrutement | à vérifier : téléphone absent
transports-gardon-limoges | Transports Gardon Limoges (TGL) | Le Palais-sur-Vienne:Avenue de Limoges, 87410 Le Palais-sur-Vienne | téléphone donné : 05 55 39 94 42 | site donné : https://www.tgl.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-nascimento | Transports Nascimento et Fils | Oradour-sur-Glane:Puy Gaillard, 87520 Oradour-sur-Glane | téléphone donné : 05 55 48 02 61 | site donné : https://www.transports-nascimento.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-rebeyrolle | Transports Rebeyrolle | Saint-Victurnien:Le Petit Loubier, 87420 Saint-Victurnien | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
massy-voyages | Massy Voyages | Limoges: | téléphone donné : aucun | site donné : https://www.massy-voyages.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
bus-lavalade | Bus Lavalade Daniel | Bellac:2 Rue Maryse Bastié, ZA, 87300 Bellac | téléphone donné : 05 55 68 71 52 | site donné : https://www.autocars-lavalade.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
europ-voyages-87 | Europ Voyages 87 | Limoges: | téléphone donné : aucun | site donné : https://www.europvoyages87.fr | page de recrutement donnée : aucune | à vérifier : adresse précise absente, téléphone absent, page de recrutement absente
royer-logistique | Royer Logistique | Limoges:35 Rue Santos Dumont, 87000 Limoges | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
crc-logistique | CRC Logistique | Limoges:2 Rue Jacques Goddet, 87280 Limoges | téléphone donné : aucun | site donné : aucun | page de recrutement donnée : aucune | à vérifier : téléphone absent, page de recrutement absente
viandes-logistique-distribution | Viandes Logistique Distribution | Limoges:125 Rue de Nexon, 87000 Limoges | téléphone donné : 05 55 31 78 61 | site donné : aucun | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
geodis-road-limoges | GEODIS Road Transport | Limoges:92 Rue de Solignac, 87000 Limoges | téléphone donné : aucun | site donné : https://www.geodis.com | page de recrutement donnée : https://careers.geodis.com | à vérifier : téléphone absent
transports-royer-sazerat | Transports Royer-Sazerat | Limoges:1 Avenue de l'Abattoir, ZI Sud, 87000 Limoges | téléphone donné : 05 55 48 58 08 | site donné : https://www.royer.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
centre-express-limousin | Centre Express Limousin 87 | Bonnac-la-Côte:23 Impasse de Maison Rouge, 87270 Bonnac-la-Côte | téléphone donné : 05 55 36 63 30 | site donné : https://www.centrexpress.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
transports-realle | Transports Realle | Limoges:15 Rue Barthélémy Thimonnier, 87280 Limoges | téléphone donné : 05 55 38 82 60 | site donné : https://www.transportsrealle.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
societe-transports-haute-vienne | Société des Transports de la Haute-Vienne | Bonnac-la-Côte:2 Impasse de Maison Rouge, 87270 Bonnac-la-Côte | téléphone donné : 05 55 57 07 00 | site donné : https://www.sthv.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
```

## Lot 100 : employeurs, Transport et logistique (3 sur 3), 8 fiches

```
Lot 100. Vérifie ces 8 employeurs (secteur : Transport et logistique). Réponds au format demandé, dans un seul bloc de code.

transports-primasfirst | Transports Primasfirst | Saint-Junien:Chemin des Abattoirs, ZA La Croix Blanche, 87200 Saint-Junien | téléphone donné : 05 55 70 19 24 | site donné : https://www.primasfirst.com | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
limousin-loctrans | Limousin Loctrans | Limoges:70 Avenue de la Grande Pièce, 87280 Limoges | téléphone donné : 05 55 71 30 21 | site donné : https://www.loctrans.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
eurocourses-limoges | Eurocourses | Limoges:11 Rue Barthélémy Thimonnier, 87280 Limoges | téléphone donné : 05 55 38 11 73 | site donné : https://www.eurocourses.fr | page de recrutement donnée : aucune | à vérifier : page de recrutement absente
xpo-logistics-limoges | XPO Logistics France | Limoges:ZI Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://europe.xpo.com | page de recrutement donnée : https://europe.xpo.com/fr/carrieres | à vérifier : téléphone absent
dpd-france-limoges | DPD France | Limoges:ZI Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://www.dpd.fr | page de recrutement donnée : https://www.dpdfrance-recrute.fr | à vérifier : téléphone absent
chronopost-limoges | Chronopost | Limoges:ZI Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://www.chronopost.fr | page de recrutement donnée : https://carrieres.chronopost.fr | à vérifier : téléphone absent
dhl-freight-limoges | DHL Freight | Limoges:ZI Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://www.dhl.com | page de recrutement donnée : https://careers.dhl.com | à vérifier : téléphone absent
db-schenker-limoges | DB Schenker | Limoges:ZI Nord, 87280 Limoges | téléphone donné : aucun | site donné : https://www.dbschenker.com | page de recrutement donnée : https://www.dbschenker.com/global/careers | à vérifier : téléphone absent
```

