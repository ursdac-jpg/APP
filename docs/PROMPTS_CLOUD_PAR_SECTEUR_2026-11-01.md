# Messages du cloud rangés par secteur (2026-11-01)

Un message = un lot à coller dans une session cloud ; le résultat revient ensuite au Claude local, qui teste chaque adresse avant de l'inscrire. Fabriqué par `scripts/veille_sas/fabriquer_prompts_secteur.js` (lots de 25 au plus). Les fiches déjà pré-validées ne sont pas reprises.

## Lots à part (à lancer en premier)

- Lot A : les cas douteux qui restent à trancher.
- Lot B : les fiches à moitié confirmées.

## Sommaire

| Lot | Type | Secteur ou catégorie | Fiches |
|---|---|---|---|
| 1 | Employeurs | administration (1/2) | 18 |
| 2 | Employeurs | administration (2/2) | 17 |
| 3 | Employeurs | agriculture-nature (1/2) | 16 |
| 4 | Employeurs | agriculture-nature (2/2) | 15 |
| 5 | Employeurs | animalier (1/2) | 16 |
| 6 | Employeurs | animalier (2/2) | 15 |
| 7 | Employeurs | artisanat (1/2) | 18 |
| 8 | Employeurs | artisanat (2/2) | 17 |
| 9 | Employeurs | artisanat-bouche (1/2) | 23 |
| 10 | Employeurs | artisanat-bouche (2/2) | 22 |
| 11 | Employeurs | automobile (1/2) | 22 |
| 12 | Employeurs | automobile (2/2) | 22 |
| 13 | Employeurs | banque-assurance-immobilier | 22 |
| 14 | Employeurs | btp (1/2) | 19 |
| 15 | Employeurs | btp (2/2) | 19 |
| 16 | Employeurs | coiffure-esthetique (1/2) | 19 |
| 17 | Employeurs | coiffure-esthetique (2/2) | 19 |
| 18 | Employeurs | commerce-vente | 18 |
| 19 | Employeurs | communication-culture (1/2) | 18 |
| 20 | Employeurs | communication-culture (2/2) | 18 |
| 21 | Employeurs | education-formation (1/2) | 15 |
| 22 | Employeurs | education-formation (2/2) | 15 |
| 23 | Employeurs | hotellerie-restauration (1/3) | 17 |
| 24 | Employeurs | hotellerie-restauration (2/3) | 17 |
| 25 | Employeurs | hotellerie-restauration (3/3) | 17 |
| 26 | Employeurs | industrie (1/2) | 19 |
| 27 | Employeurs | industrie (2/2) | 19 |
| 28 | Employeurs | numerique | 24 |
| 29 | Employeurs | proprete (1/2) | 14 |
| 30 | Employeurs | proprete (2/2) | 13 |
| 31 | Employeurs | sante (1/2) | 19 |
| 32 | Employeurs | sante (2/2) | 19 |
| 33 | Employeurs | securite (1/2) | 17 |
| 34 | Employeurs | securite (2/2) | 16 |
| 35 | Employeurs | social-personne (1/2) | 18 |
| 36 | Employeurs | social-personne (2/2) | 17 |
| 37 | Employeurs | sport-animation (1/2) | 23 |
| 38 | Employeurs | sport-animation (2/2) | 23 |
| 39 | Employeurs | transport-logistique (1/2) | 21 |
| 40 | Employeurs | transport-logistique (2/2) | 21 |
| 41 | Structures | acces-au-droit (1/2) | 19 |
| 42 | Structures | acces-au-droit (2/2) | 19 |
| 43 | Structures | accueil-etrangers | 13 |
| 44 | Structures | appui-aux-employeurs (1/2) | 17 |
| 45 | Structures | appui-aux-employeurs (2/2) | 16 |
| 46 | Structures | budget-endettement | 9 |
| 47 | Structures | caf | 3 |
| 48 | Structures | caisse-assurance-maladie-retraite | 9 |
| 49 | Structures | cap-emploi | 2 |
| 50 | Structures | ccas | 8 |
| 51 | Structures | collectivite-etat (1/2) | 17 |
| 52 | Structures | collectivite-etat (2/2) | 16 |
| 53 | Structures | creation-activite (1/2) | 22 |
| 54 | Structures | creation-activite (2/2) | 22 |
| 55 | Structures | formation-jeunes | 5 |
| 56 | Structures | formation-orientation (1/2) | 19 |
| 57 | Structures | formation-orientation (2/2) | 18 |
| 58 | Structures | francais-langue | 17 |
| 59 | Structures | france-services (1/2) | 15 |
| 60 | Structures | france-services (2/2) | 14 |
| 61 | Structures | france-travail | 2 |
| 62 | Structures | handicap | 19 |
| 63 | Structures | inclusion-numerique | 3 |
| 64 | Structures | justice-insertion | 16 |
| 65 | Structures | logement-hebergement (1/2) | 14 |
| 66 | Structures | logement-hebergement (2/2) | 14 |
| 67 | Structures | mission-locale | 10 |
| 68 | Structures | mobilite-solidaire | 9 |
| 69 | Structures | petite-enfance | 23 |
| 70 | Structures | plie | 1 |
| 71 | Structures | sante-soins-addictions (1/3) | 19 |
| 72 | Structures | sante-soins-addictions (2/3) | 19 |
| 73 | Structures | sante-soins-addictions (3/3) | 18 |
| 74 | Structures | service-social-secteur | 16 |
| 75 | Structures | siae | 1 |
| 76 | Structures | soutien-aux-familles | 18 |

---

# Lot A : les cas douteux à trancher

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des CAS DOUTEUX d'un registre d'employeurs et de structures. Pour chaque ligne, réponds à la question précise posée, puis établis la présence en Dordogne 24 et en Haute-Vienne 87. Si l'organisme existe mais n'a ni agence ni point dans ces deux départements, écris clairement « pas de présence sur le territoire » : la fiche sera alors retirée, c'est une bonne réponse. Donne aussi, quand tu les trouves, le site officiel et la page de recrutement de l'organisme lui-même (jamais un site d'offres tiers ni un agrégateur).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Cas | Réponse à la question posée | Site officiel | Page de recrutement officielle | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. CDR Environnement (fiche : Limoges, 26 rue de Tourcoing) : le site que j'ai reçu est cdr-environnement-correze.com, une société de Corrèze. Est-ce la même entreprise que celle de Limoges ? A-t-elle une agence ou un site en Haute-Vienne ou en Dordogne ?
2. AGC Dordogne (fiche : Coulounieix-Chamiers) : quelle est cette structure exactement (association de gestion et de comptabilité, autre chose) ? Quel est son site officiel ? Ne la confonds pas avec « AGC Contractant » (agc-contractant.fr, téléphone en 05 56, Gironde) : dis si c'est la même société ou non.
3. Savencia (groupe laitier) : possède-t-il un site, une usine, une laiterie ou un bureau en Dordogne ou en Haute-Vienne ? Si oui, lesquels, avec la phrase de la page ; sinon « pas de présence sur le territoire ».
4. Groupe Nicollin (propreté, déchets) : a-t-il une agence en Dordogne (la fiche dit Périgueux) ou en Haute-Vienne ? Page des implantations ou des agences.
5. Protectim Security Group (fiche : Limoges) : a-t-il une agence en Haute-Vienne ou en Dordogne ? Page des agences.
6. Esthetic Center (instituts de beauté) : quels instituts existent en Haute-Vienne et en Dordogne ? La fiche dit « Le Vigen, centre commercial Carrefour Boisseuil » ; j'ai noté « Limoges uniquement ». Donne les communes citées par la page officielle des instituts, sans adresse complète.
7. Arquus (fiche : Limoges, 72 route du Palais) : quelle est la page de recrutement officielle sur le site de l'entreprise elle-même (pas Welcome to the Jungle) ? L'entreprise a-t-elle changé de nom ou de propriétaire, et le site de Limoges existe-t-il toujours ?
8. Centre hospitalier de Périgueux : son site était en maintenance. Quelle est sa page de recrutement officielle (offres d'emploi, concours) ? Le site répond-il maintenant ?
9. GRETA-CFA Limousin (greta-du-limousin.fr) : quelle est la page de recrutement officielle (offres de postes, formateurs) ? Même question pour GRETA-CFA Aquitaine, agence Dordogne.
10. Banque Populaire Aquitaine Centre Atlantique et Caisse d'Épargne Aquitaine Poitou-Charentes : page de recrutement de la BONNE région (pas Bourgogne Franche-Comté ni Provence-Alpes-Corse), et présence d'agences en Dordogne et en Haute-Vienne.
11. ASSAD Dordogne, Éveil Aides et Services, Weesure, Provençale, Boulangerie Sylvain Chatenet, Clara Automobiles, Yelloh Pomport Beach (un cas par organisme) : site officiel, page de recrutement, présence en Dordogne ou en Haute-Vienne. Leurs sites ont refusé les robots lors de mes essais : si c'est ton cas, dis-le et donne les liens dans « À OUVRIR PAR MOI ».

---

# Lot B : les fiches à moitié confirmées

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des FICHES À MOITIÉ CONFIRMÉES d'un registre d'employeurs et de structures. Pour chaque ligne, réponds à la question précise posée, puis établis la présence en Dordogne 24 et en Haute-Vienne 87. Si l'organisme existe mais n'a ni agence ni point dans ces deux départements, écris clairement « pas de présence sur le territoire » : la fiche sera alors retirée, c'est une bonne réponse. Donne aussi, quand tu les trouves, le site officiel et la page de recrutement de l'organisme lui-même (jamais un site d'offres tiers ni un agrégateur).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Cas | Réponse à la question posée | Site officiel | Page de recrutement officielle | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Senior Compagnie (agences Saint-Astier en Dordogne et Limoges) : la page https://recrutement.groupe-zephyr.fr/fr/annonces?brands=2689 est celle du Groupe Zephyr. Le filtre brands=2689 correspond-il bien à Senior Compagnie ? Quelles agences Senior Compagnie existent en Dordogne et en Haute-Vienne (page des agences) ?
2. Petits-fils (aide à domicile) : agences en Dordogne (Périgueux) et en Haute-Vienne (Limoges) : quelles agences la page officielle liste-t-elle exactement, dans chaque département ?
3. Hermès, ganterie de Saint-Junien : le site de Saint-Junien est-il cité sur le site officiel d'Hermès ? La page https://talents.hermes.com/fr/sites/CX est-elle bien la page de recrutement des sites de production en France ?
4. Centrale Auto Marché (fiche : Saint-Médard-de-Mussidan, Dordogne) : le site centraleautomarche.fr cite-t-il ce point de vente et sa commune ?
5. Solune (éditeur de logiciels, fiche : Limoges) : le site solune.com cite-t-il Limoges ? Existe-t-il une page de recrutement sur solune.com ?
6. Veolia (trois fiches : Boulazac-Isle-Manoire en Dordogne ; Limoges, rue de Solignac ; unité de valorisation énergétique de Limoges) : quelles implantations Veolia les pages officielles (veolia.com ou veolia.fr) citent-elles en Dordogne et en Haute-Vienne ? La page d'offres jobs.veolia.com (filtre France) est-elle la bonne page de recrutement ?
7. Celio, Maisons du Monde, Besson Chaussures, Weldom, Chronopost, Monoprix, Cultura, H&M : ces sites refusent souvent les robots. Si tu ne peux pas ouvrir leur page « nos magasins », dis-le et donne les liens dans « À OUVRIR PAR MOI » ; sinon, liste les magasins ou points de dépôt en Dordogne et en Haute-Vienne (communes seulement).

---

# Lot 1 : employeurs, administration (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Conseil départemental de la Dordogne (Périgueux) | site proposé : https://www.dordogne.fr [répond] | recrutement proposé : https://www.dordogne.fr/recrutement
2. Ville de Périgueux (Périgueux) | site proposé : https://www.perigueux.fr [répond] | recrutement proposé : https://www.perigueux.fr/ma-mairie-pratique/offres-demploi/offres-demploi.html
3. Ville de Bergerac (Bergerac) | site proposé : https://www.bergerac.fr [répond]
4. Grand Périgueux (Périgueux) | site proposé : https://www.grandperigueux.fr [répond] | recrutement proposé : https://www.grandperigueux.fr/votre-agglo/recrutement
5. Communauté d'Agglomération Bergeracoise (Bergerac) | site proposé : https://www.la-cab.fr [nom absent]
6. Communauté de communes Sarlat-Périgord Noir (Sarlat-la-Canéda) | site proposé : https://www.cc-sarlatperigordnoir.fr [répond]
7. AGC Dordogne (Coulounieix-Chamiers) | site proposé : https://www.agc24.fr [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
8. MSA Dordogne Lot (Coulounieix-Chamiers) | pas de site proposé | recrutement proposé : https://recrutement.msa.fr
9. Mutualité Française Dordogne (Périgueux) | site proposé : https://www.mutualite.fr [répond]
10. Conseil départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr [répond] | recrutement proposé : https://www.haute-vienne.fr/votre-conseil-departemental/recrutement
11. Ville de Limoges (Limoges) | site proposé : https://www.limoges.fr [répond]
12. Limoges Métropole (Limoges) | site proposé : https://www.limoges-metropole.fr [répond]
13. Ville de Saint-Junien (Saint-Junien) | site proposé : https://www.saint-junien.fr [répond]
14. Ville de Panazol (Panazol) | site proposé : https://www.panazol.fr [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
15. Ville de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://www.saint-yrieix.fr [répond]
16. Communauté de communes ELAN Limousin Avenir Nature (Ambazac) | pas de site proposé
17. Communauté de communes Haut Limousin en Marche (Bellac, Le Dorat) | site proposé : https://www.hautlimousinenmarche.fr [répond]
18. Communauté de communes Porte Océane du Limousin (Saint-Junien) | site proposé : https://www.porteoceane-dulimousin.fr [répond]

---

# Lot 2 : employeurs, administration (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. KPMG (Limoges) | site proposé : https://kpmg.com/fr [répond] | recrutement proposé : https://kpmg.com/fr/fr/home/carrieres.html
2. EXCO Valliance (Limoges) | site proposé : https://www.exco.fr [répond] | recrutement proposé : https://www.exco.fr/recrutement
3. VIASANTÉ Mutuelle (Limoges) | site proposé : https://www.viasante.fr [répond]
4. MSA du Limousin (Limoges) | site proposé : https://limousin.msa.fr [répond] | recrutement proposé : https://recrutement.msa.fr
5. CAF de la Haute-Vienne (Limoges) | site proposé : https://www.caf.fr [répond] | recrutement proposé : https://www.lasecurecrute.fr
6. CPAM de la Haute-Vienne (Limoges) | site proposé : https://www.ameli.fr [nom absent] | recrutement proposé : https://www.lasecurecrute.fr
7. URSSAF Limousin (Limoges) | site proposé : https://www.urssaf.fr/accueil.html [ne répond pas (ECONNRESET)] | recrutement proposé : https://www.urssaf.org/accueil/carrieres/nous-rejoindre/nos-offres-d-emploi.html
8. CCI Limoges et Haute-Vienne (Limoges) | site proposé : https://www.limoges.cci.fr [bloque les robots] | recrutement proposé : https://www.limoges.cci.fr/recrutement
9. CMA Nouvelle-Aquitaine - Haute-Vienne (Limoges) | site proposé : https://www.artisanat-nouvelle-aquitaine.fr [répond] | recrutement proposé : https://www.artisanat-nouvelle-aquitaine.fr/recrutement
10. AG2R La Mondiale (Limoges) | site proposé : https://www.ag2rlamondiale.fr [répond] | recrutement proposé : https://www.ag2rlamondiale.fr/recrutement
11. Malakoff Humanis (Limoges) | site proposé : https://www.malakoffhumanis.com [répond] | recrutement proposé : https://carrieres.malakoffhumanis.com
12. MGEN Haute-Vienne (Limoges) | site proposé : https://www.mgen.fr/ [répond] | recrutement proposé : https://recrutement.mgen.fr/accueil.aspx?LCID=1036
13. CBA Cabinet Bauriaud Associés (Limoges) | pas de site proposé
14. ACEC BSR Audit (Limoges) | site proposé : https://www.acec.fr [répond]
15. Secaut SA (Limoges) | site proposé : https://www.secaut.fr [répond]
16. Sageco Bellac (Bellac) | pas de site proposé
17. Cabinet Muriel Bellegarde (Limoges) | pas de site proposé

---

# Lot 3 : employeurs, agriculture-nature (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Coopérative Agricole La Périgourdine (Boulazac Isle Manoire, Saint-Yrieix-la-Perche, Sorges et Ligueux en Périgord) | site proposé : https://laperigourdine.com/ [répond] | recrutement proposé : https://laperigourdine.com/emploi/
2. Gamm Vert (La Périgourdine) (Bergerac, Boulazac Isle Manoire, Ribérac) | site proposé : https://laperigourdine.com [répond]
3. Périgord Bois Énergie (Saint-Laurent-des-Hommes) | site proposé : https://laperigourdine.com [répond]
4. Pépinières Laplace (Le Buisson-de-Cadouin) | pas de site proposé
5. Pépinières du Périgord (Douville) | pas de site proposé
6. Rousseau Paysage (Coulounieix-Chamiers) | site proposé : https://www.rousseau-paysage.fr [répond]
7. idverde (Boulazac Isle Manoire) | site proposé : https://www.idverde.fr [répond]
8. Serpe (Boulazac Isle Manoire) | site proposé : https://www.serpe.fr [répond]
9. Océalia (Limoges) | site proposé : https://www.ocealia-groupe.com [ne répond pas (UND_ERR_CONNECT_TIMEOUT)] | recrutement proposé : https://www.ocealia-groupe.com/recrutement
10. Farago Haute-Vienne (Limoges) | pas de site proposé
11. Union Coopérative Agricole Altitude (Verneuil-sur-Vienne) | site proposé : https://www.groupe-altitude.com [répond] | recrutement proposé : https://www.groupe-altitude.com/recrutement
12. ECOOVI (Peyrat-de-Bellac) | site proposé : https://www.ecoovi.fr [répond]
13. Au Service du Paysage (Boisseuil) | site proposé : https://www.auservicedupaysage.fr [répond]
14. Rebeyrol Créateur et Soins de Jardins (Le Vigen) | site proposé : https://www.rebeyrol.com [répond] | recrutement proposé : https://www.rebeyrol.com/recrutement
15. Limousin Paysage (Couzeix) | pas de site proposé
16. E. Gauquié Paysage (Saint-Just-le-Martel) | pas de site proposé

---

# Lot 4 : employeurs, agriculture-nature (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Le Jardin de Plaisance (Le Vigen) | pas de site proposé
2. Horticulture Delage (Panazol) | pas de site proposé
3. Pépinière de la Chapelle (Isle) | pas de site proposé
4. Pépiplant Olivier Giraud (Chaptelat) | site proposé : https://www.pepiplant.fr [répond]
5. Pépinière Les Prés du Chiron (Saint-Sornin-la-Marche) | pas de site proposé
6. GEIQ Agri Limousin Périgord (Limoges) | site proposé : https://www.geiqagri.com [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
7. Thibaut Paysage SARL (Limoges) | pas de site proposé
8. Le Jardin de Vanteaux (Limoges) | pas de site proposé
9. Chlorophylle Horticulture Germain Joncheray (Condat-sur-Vienne) | pas de site proposé
10. Puygrenier Agriculture Centre Vert (Glandon) | pas de site proposé
11. Serra Paysage (Boulazac Isle Manoire) | site proposé : https://www.serra-paysage.fr [répond]
12. Herbelys (Cheissoux) | pas de site proposé
13. Les Serres du Ponteix (Feytiat) | pas de site proposé
14. Les Serres de Ventadour (Solignac) | pas de site proposé
15. Dupuy SARL (Saint-Yrieix-la-Perche) | pas de site proposé

---

# Lot 5 : employeurs, animalier (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Clinique vétérinaire du Gour de l'Arche (Périgueux) | site proposé : https://www.capveto.fr [répond]
2. Clinique Vétérinaire Animalis (Montpon-Ménestérol) | site proposé : https://www.capveto.fr [répond]
3. Société Protectrice des Animaux Dordogne (Marsac-sur-l'Isle) | site proposé : https://spa24bergerac.org [répond]
4. SPA24 Bergerac (Bergerac) | site proposé : https://spa24bergerac.org [répond]
5. Au Royaume de l'Espoir CA-LIN (Bassillac et Auberoche) | pas de site proposé
6. Réserve Zoologique de Calviac (Calviac-en-Périgord) | site proposé : https://www.reserve-calviac.org [répond]
7. Le Parc Sauvage (La Tour-Blanche-Cercles) | pas de site proposé
8. Parc du Thot (Thonac) | site proposé : https://www.lascaux.fr [nom absent]
9. Zoo Refuge de Mescoules (Mescoules) | pas de site proposé
10. SPA de la Haute-Vienne (Couzeix) | pas de site proposé
11. Clinique Vétérinaire Vanteaux (Limoges) | pas de site proposé | recrutement proposé : https://emploi.ivcevidensia.fr
12. Clinique Vétérinaire Argos Val de l'Aurence (Limoges) | site proposé : https://www.argos-veterinaire.com [répond]
13. Clinique Vétérinaire du Sablard (Limoges) | pas de site proposé
14. Clinique Vétérinaire Beaublanc (Limoges) | pas de site proposé
15. Clinique Sirius (Couzeix) | pas de site proposé
16. Clinique Vétérinaire du Palais (Le Palais-sur-Vienne) | pas de site proposé

---

# Lot 6 : employeurs, animalier (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Groupement Vétérinaire Univet Val de Vienne (Aixe-sur-Vienne) | site proposé : https://www.univet.fr [répond] | recrutement proposé : https://www.univet.fr/recrutement
2. Parc Zoo du Reynou (Le Vigen) | pas de site proposé
3. Elephant Haven European Elephant Sanctuary (Bussière-Galant) | site proposé : https://www.elephanthaven.com [répond]
4. Refuge de Filémon (Val-d'Issoire) | pas de site proposé
5. Clinique Vétérinaire de Louyat (Limoges) | pas de site proposé
6. Cabinet Vétérinaire Armand Dutreix (Limoges) | pas de site proposé
7. Cabinet vétérinaire Les Moustaches (Chaptelat) | pas de site proposé
8. Clinique Vétérinaire Panaveto (Panazol) | pas de site proposé
9. Clinique vétérinaire d'Ambazac (Ambazac) | pas de site proposé
10. Clinique d'Arsonval (Saint-Yrieix-la-Perche) | pas de site proposé
11. Groupement Vétérinaire (Saint-Léonard-de-Noblat) | pas de site proposé
12. Cabinet Vétérinaire Univet Val de Gorre (Verneuil-sur-Vienne) | site proposé : https://www.univet.fr [répond] | recrutement proposé : https://www.univet.fr/recrutement
13. Association ERINA - Centre de soins pour les mammifères sauvages (Razès) | site proposé : https://www.associationerina.com [répond]
14. SOS Faune Sauvage (Verneuil-sur-Vienne) | pas de site proposé
15. Galop Pour La Vie (Bellac) | pas de site proposé

---

# Lot 7 : employeurs, artisanat (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Menuiseries Seguy (Montignac-Lascaux) | site proposé : https://www.menuiseries-seguy.fr [répond]
2. Ouvertures Périgourdines (Périgueux) | pas de site proposé
3. SCO.ME.BAT Coopérative des Menuisiers du Bâtiment (Ribérac) | site proposé : https://www.scomebat.fr [nom absent]
4. Marty Menuiseries Miroiteries (Champagnac-de-Belair) | pas de site proposé
5. Passion d'Autrefois (Saint-Laurent-des-Vignes) | pas de site proposé
6. L'Atelier du Périgord (Ménesplet) | pas de site proposé
7. PENY Ébénisterie Menuiserie Agencement (Gardonne) | site proposé : https://www.peny-ebenisterie.fr [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
8. LP Menuiserie (Castelnaud-la-Chapelle) | pas de site proposé
9. Ateliers Férignac (Hautefort) | pas de site proposé
10. Atelier Saint-Agnan (Hautefort) | pas de site proposé
11. Menuiserie Raynal (Coulounieix-Chamiers) | pas de site proposé
12. Maurice Faure Menuiseries (Limoges) | pas de site proposé
13. Naudon Mathé Frères (Limoges) | site proposé : https://www.naudon-mathe.fr [répond]
14. Isol-Eco (Feytiat) | pas de site proposé
15. Leclerc Menuiseries (Isle) | site proposé : https://www.leclerc-menuiseries.fr [erreur 500]
16. Société Limousine de Menuiserie Charpente (SLMC) (Limoges) | pas de site proposé
17. SARL Mandonnaud Menuiserie (Limoges) | pas de site proposé
18. Inertia Menuiseries (Limoges) | pas de site proposé

---

# Lot 8 : employeurs, artisanat (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Menuiserie de la Maulde (Bujaleuf) | pas de site proposé
2. Lo'Talhier - Atelier Parot SARL (Saint-Jean-Ligoure) | site proposé : https://www.lotalhier.fr [répond]
3. Inno'Menuiserie (Limoges) | pas de site proposé
4. Carrés de Lumière (Limoges) | site proposé : https://www.carresdelumiere.fr [répond]
5. L'Atelier Barbabois (Saint-Yrieix-sous-Aixe) | pas de site proposé
6. CIDJI Fam Atelier de Stylisme Modélisme (Limoges) | pas de site proposé
7. Atelier d'ISA (Limoges) | pas de site proposé
8. Coud'Fil (Limoges) | pas de site proposé
9. DELAGE Menuiseries (Saint-Junien) | site proposé : https://menuiseries-delage.fr [répond] | recrutement proposé : https://menuiseries-delage.fr/recrutement-menuisiers/
10. Haviland (Limoges) | site proposé : https://haviland.fr [répond]
11. JL Coquet (Saint-Léonard-de-Noblat) | site proposé : https://jlcoquet.com [répond]
12. Raynaud (Limoges) | site proposé : https://www.raynaud.fr [répond]
13. Deshoulières (Limoges) | site proposé : https://www.deshoulieres.com [répond]
14. Ateliers Arquié (Limoges) | site proposé : https://www.ateliersarquie.com [répond]
15. Émaux Chéron (Limoges) | site proposé : https://www.emauxcheron.com [répond]
16. Atelier des Métiers d'Art Hazard (Limoges) | pas de site proposé
17. Carpenet Porcelaine (Limoges) | site proposé : https://www.carpenet.com [ne répond pas (ECONNREFUSED)]

---

# Lot 9 : employeurs, artisanat-bouche (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Société Périgourdine de Salaisons (SPS) (Boulazac Isle Manoire) | pas de site proposé
2. Maison Lissajoux (Sarlat-la-Canéda) | pas de site proposé
3. SARL Au Fournil de la Cité (Périgueux) | pas de site proposé
4. Antoine Girard Pâtisserie Boulangerie (Périgueux) | pas de site proposé
5. Au Fournil de Benjamin (Périgueux) | pas de site proposé
6. Au Tour des Traditions (Sanilhac) | pas de site proposé
7. Maison Carré (Castelnaud-la-Chapelle) | pas de site proposé
8. Boulangerie-Pâtisserie Fellner (La Douze) | pas de site proposé
9. Boulangerie Eytier (Mareuil en Périgord) | pas de site proposé
10. L'Ami du Pain Éric Perrier (Saint-Vincent-de-Connezac) | pas de site proposé
11. Charcuterie de Campagne Vaux (Sarlat-la-Canéda) | pas de site proposé
12. GBS Boucherie Charcuterie (Sarlat-la-Canéda) | pas de site proposé
13. Charcuterie Traiteur Christophe Orteil (Périgueux) | pas de site proposé
14. Maison Simoens FMG (Coursac) | pas de site proposé
15. Charcuterie Traiteur Anthony Filet (Bergerac) | pas de site proposé
16. Établissements Coudeyrat (Le Bugue) | pas de site proposé
17. Lard du Goût SARL (Saint-Pardoux-la-Rivière) | pas de site proposé
18. Servolle Jean-Jacques (Saint-Chamassy) | pas de site proposé
19. Chez Arnaud (Périgueux) | pas de site proposé
20. Les Gourmandises de Lucco (Castels et Bézenac) | pas de site proposé
21. Boulangerie Desem (Limoges) | site proposé : https://www.boulangeriedesem.com [répond]
22. Maison Vareille (Solignac) | site proposé : https://www.boulangerie-vareille.fr [répond]
23. Le Caramélia (Limoges) | site proposé : https://www.le-caramelia.fr [répond]

---

# Lot 10 : employeurs, artisanat-bouche (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Maison Faurie (Bessines-sur-Gartempe) | pas de site proposé
2. Artisan Boulanger Deperry (Saint-Junien) | pas de site proposé
3. Chez Sylvain (Limoges) | pas de site proposé
4. Chez Sylvain (Panazol) | pas de site proposé
5. Pâtisserie Sainte-Thérèse (Limoges) | pas de site proposé
6. Délices des Gourmets (Limoges) | pas de site proposé
7. Boulangerie Feuillette (Limoges) | site proposé : https://feuillette.fr [répond]
8. Boulangerie Gavroche (Limoges) | pas de site proposé
9. Le Diablotin (Limoges) | pas de site proposé
10. Tournepains (Bosmie-l'Aiguille) | pas de site proposé
11. Coignac SAS (Saint-Léonard-de-Noblat) | pas de site proposé
12. Chez Many (Veyrac) | pas de site proposé
13. La Cerise sur le Gâteau (Limoges) | pas de site proposé
14. Chez Renard (Limoges) | pas de site proposé
15. Boulangerie Sylvain Chatenet (Limoges, Feytiat) | pas de site proposé
16. Pain et Tradition de France (Limoges) | pas de site proposé
17. Au Fin Palais (Limoges) | pas de site proposé
18. Pascalain SARL (Feytiat) | site proposé : https://www.pascalain.fr [répond]
19. Les Beigneurs (Limoges) | pas de site proposé
20. Maison MG (Isle) | pas de site proposé
21. A La Forêt Noire (Limoges) | pas de site proposé
22. Boulangerie Pâtisserie Sainte Claire (Limoges) | pas de site proposé

---

# Lot 11 : employeurs, automobile (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Mercedes-Benz LG Périgueux Automobiles (Trélissac) | site proposé : https://www.lg-automobiles.com [ne répond pas (ECONNREFUSED)] | recrutement proposé : https://www.lg-automobiles.com/recrutement
2. Clara Automobiles Peugeot (Trélissac, Bergerac) | site proposé : https://www.clara-automobiles.com [ne répond pas (ECONNREFUSED)] | recrutement proposé : https://www.clara-automobiles.com/recrutement
3. Toyota Clara Automobiles (Trélissac) | site proposé : https://www.clara-automobiles.com [ne répond pas (ECONNREFUSED)] | recrutement proposé : https://www.clara-automobiles.com/recrutement
4. Jeammet Automobiles (Coulounieix-Chamiers) | pas de site proposé
5. Garage de Guglielmi AD (Trélissac) | pas de site proposé
6. Centrale Auto Marché (Saint-Médard-de-Mussidan) | site proposé : https://www.centraleautomarche.fr/ [répond]
7. Garage Lacombe (Sarlat-la-Canéda) | pas de site proposé
8. Garage Antoine (Sarlat-la-Canéda) | pas de site proposé
9. Clinic Auto (Sarlat-la-Canéda) | pas de site proposé
10. Carrosserie Bardot (Chancelade) | pas de site proposé
11. A.N Carrosserie Bergerac (Creysse) | site proposé : https://www.ancarrosserie.fr [répond]
12. Carrosserie de la Gare Grenier & Fils (Bergerac) | site proposé : https://www.carrosserie-grenier.fr [répond]
13. Carross'rie Gregory (Bergerac) | pas de site proposé
14. Autovision Bergerac (Bergerac) | site proposé : https://www.autovision.fr [répond]
15. Autobilan du Périgord (Coulounieix-Chamiers) | pas de site proposé
16. RapidContrôle Périgueux (Périgueux) | site proposé : https://www.rapidcontrole.fr [répond]
17. Sécuritest Neuvic (Neuvic) | site proposé : https://www.securitest.fr [répond]
18. Sécuritest Saint-Front-de-Pradoux (Saint-Front-de-Pradoux) | site proposé : https://www.securitest.fr [répond]
19. Faurie Motor Centre Limousin Opel (Limoges) | site proposé : https://www.faurie.fr [répond]
20. Mercedes-Benz LG Limoges Automobiles (Limoges) | site proposé : https://www.lg-automobiles.com [ne répond pas (ECONNREFUSED)] | recrutement proposé : https://www.lg-automobiles.com/recrutement
21. Toyota Carnot Automobile (Limoges) | site proposé : https://www.groupe-carnot.fr [répond]
22. Kia Limoges - Jean Rouyer Automobiles (Limoges) | site proposé : https://www.jeanrouyerautomobiles.fr [répond]

---

# Lot 12 : employeurs, automobile (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Fiat Ital Auto 87 (Limoges) | site proposé : https://www.italauto.fr [ne répond pas (ECONNREFUSED)] | recrutement proposé : https://www.italauto.fr/recrutement
2. SDAL Peugeot (Limoges) | pas de site proposé
3. Gros Automobiles (Feytiat) | pas de site proposé
4. Aventi Automobiles (Limoges) | site proposé : https://www.aventi-automobiles.fr [répond]
5. Centre Auto du Palais (Le Palais-sur-Vienne) | pas de site proposé
6. Carrosserie Langlade (Verneuil-sur-Vienne) | pas de site proposé
7. L'Atelier du Carrossier LM (La Geneytouse) | pas de site proposé
8. Garage Mécanique Carrosserie Gauthier (Vicq-sur-Breuilh) | site proposé : https://www.garage-gauthier.fr [répond]
9. Garage Carrosserie Charbonnier (Saint-Martin-le-Vieux) | pas de site proposé
10. Autosécurité Limoges Dutreix (Limoges) | site proposé : https://www.autosecurite.com [répond]
11. Autosécurité Limoges Nord (Limoges) | site proposé : https://www.autosecurite.com [répond]
12. Autocontrol (Limoges) | site proposé : https://www.autocontrol.fr [répond]
13. Sécuritest Limoges Sud (Limoges) | site proposé : https://www.securitest.fr [répond]
14. Sécuritest Le Vigen (Le Vigen) | site proposé : https://www.securitest.fr [répond]
15. Autosur (Aixe-sur-Vienne) | site proposé : https://www.autosur.fr [répond]
16. Groupe Péricaud Limoges Sud (Volkswagen, Audi, Škoda, SEAT, CUPRA) (Limoges) | site proposé : https://www.pericaud.com [répond]
17. Citroën Limoges Sud - Midi Auto 87 (Limoges) | pas de site proposé
18. DEKRA Contrôle Technique (Le Palais-sur-Vienne) | site proposé : https://www.dekra-norisko.fr [répond]
19. Duval Services Auto Motrio (Bonnac-la-Côte) | site proposé : https://www.motrio.fr [répond]
20. LD Auto 87 Staff Auto (Couzeix) | pas de site proposé
21. SpeedAuto (Limoges) | pas de site proposé
22. Help Auto (Limoges) | site proposé : https://www.helpauto.fr [bloque les robots]

---

# Lot 13 : employeurs, banque-assurance-immobilier

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Crédit Agricole Charente-Périgord (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.credit-agricole.fr/ca-charente-perigord/particulier.html [répond] | recrutement proposé : https://groupecreditagricole.jobs/fr/
2. Crédit Agricole Services Immobiliers (Périgueux, Bergerac, Limoges) | site proposé : https://www.ca-immobilier.fr [répond] | recrutement proposé : https://groupecreditagricole.jobs
3. LCL Banque et assurance (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.lcl.fr [répond] | recrutement proposé : https://www.lcl.fr/decouvrir-lcl/recrutement
4. SG (Périgueux, Trélissac, Bergerac) | site proposé : https://particuliers.sg.fr [répond] | recrutement proposé : https://careers.societegenerale.com
5. Banque Populaire Aquitaine Centre Atlantique (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.banquepopulaire.fr/ [répond]
6. Caisse d'Épargne Aquitaine Poitou-Charentes (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.caisse-epargne.fr/ [répond] | recrutement proposé : https://recrutement.caisse-epargne.com
7. Crédit Mutuel (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.creditmutuel.fr [répond] | recrutement proposé : https://recrutement.creditmutuel.fr
8. AXA Assurance et Banque (Périgueux, Bergerac, Trélissac) | site proposé : https://www.axa.fr [répond] | recrutement proposé : https://recrutement.axa.fr
9. Generali (Creysse, Limoges) | site proposé : https://www.generali.fr [répond] | recrutement proposé : https://carrieres.generali.fr/
10. Orpi (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.orpi.com [répond] | recrutement proposé : https://www.orpi.com/recrutement
11. Laforêt (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.laforet.com [répond] | recrutement proposé : https://www.laforet.com/recrutement
12. Guy Hoquet (Bergerac, Périgueux) | site proposé : https://www.guy-hoquet.com [répond] | recrutement proposé : https://recrutement.guy-hoquet.com/fr
13. Crédit Agricole Centre Ouest (Limoges, Saint-Junien, Bellac) | site proposé : https://www.ca-centreouest.fr [répond] | recrutement proposé : https://groupecreditagricole.jobs
14. Gan Assurances (Limoges, Saint-Junien) | site proposé : https://www.gan.fr [répond] | recrutement proposé : https://www.gan.fr/rh-nous-rejoindre/
15. Groupama Centre-Atlantique (Limoges, Saint-Junien, Bellac) | site proposé : https://www.groupama.fr [répond] | recrutement proposé : https://www.groupama-gan-recrute.com/
16. MMA (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.mma.fr/ [bloque les robots] | recrutement proposé : https://www.mma.fr/a-propos/recrutement-mma.html
17. CAFPI Limoges (Limoges) | site proposé : https://www.cafpi.fr [répond] | recrutement proposé : https://cafpi-career.talent-soft.com
18. Meilleurtaux Limoges (Limoges) | site proposé : https://www.meilleurtaux.com [répond]
19. Empruntis Limoges (Limoges) | site proposé : https://www.empruntis.com [répond]
20. Ymanci Limoges (Limoges) | site proposé : https://www.ymanci.fr [répond]
21. CAFPI Périgueux (Périgueux) | site proposé : https://www.cafpi.fr [répond] | recrutement proposé : https://cafpi-career.talent-soft.com
22. Meilleurtaux Périgueux (Périgueux) | site proposé : https://www.meilleurtaux.com [répond]

---

# Lot 14 : employeurs, btp (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. NGE - ABTP BIARD (Bergerac) | site proposé : https://www.groupe-nge.fr [nom absent]
2. Lhomme et Fils TP (Bergerac) | pas de site proposé
3. Bouijaud TP (Vélines) | pas de site proposé
4. Alemps & Fils (Savignac-les-Églises) | pas de site proposé
5. Entreprise Générale de Bâtiment (Creysse) | pas de site proposé
6. Vigier Construction Métallique (Gardonne) | site proposé : https://www.vigier.fr [répond]
7. Novamiante (Gardonne) | site proposé : https://www.novamiante.fr [répond] | recrutement proposé : https://www.novamiante.fr/recrutement
8. ETS Ribeiro (Coulounieix-Chamiers) | pas de site proposé
9. GEIQ 24 Bâtiment (Périgueux) | site proposé : https://geiq24.com [répond] | recrutement proposé : https://geiq24.com
10. Coren Périgord (Saint-Astier) | pas de site proposé
11. Bergeron Goudronnage EURL (Chancelade) | pas de site proposé
12. Bergerac TP (Saint-Agne) | site proposé : https://www.bergeractp.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
13. ERCTP (Boulazac Isle Manoire) | site proposé : https://www.erctp.fr [bloque les robots]
14. Garrigou TP Carrières (Groléjac) | site proposé : https://www.garrigou.fr [répond]
15. Tallet et Fils (Sarlande) | pas de site proposé
16. Cap'Élec Énergies (Trélissac) | pas de site proposé
17. Services Périgourdins (Montagnac-la-Crempse) | pas de site proposé
18. Batifrère Électricité (Siorac-en-Périgord) | pas de site proposé
19. Écoludom (Marsac-sur-l'Isle) | site proposé : https://www.ecoludom.fr [répond]

---

# Lot 15 : employeurs, btp (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. DP Services Dordogne (Montpon-Ménestérol) | site proposé : https://www.dpservicesdordogne.fr [répond]
2. Dordogne Sanitaire Chauffage Lamblin (Périgueux) | pas de site proposé
3. JBS Plomberie (Boulazac Isle Manoire) | site proposé : https://www.jbs-plomberie.fr [répond]
4. Eiffage Construction Limousin (Limoges) | site proposé : https://www.eiffageconstruction.com [répond] | recrutement proposé : https://www.eiffage.com/carrieres
5. Eurovia Poitou Charentes Limousin (Limoges) | site proposé : https://www.eurovia.fr [répond] | recrutement proposé : https://jobs.vinci.com
6. Coren Limousin (Limoges) | site proposé : https://www.coren.fr [répond]
7. NGE Routes (Limoges) | site proposé : https://www.groupe-nge.fr [nom absent]
8. Aixe Bâtiments (Aixe-sur-Vienne) | site proposé : https://www.aixebatiments.fr [répond] | recrutement proposé : https://www.aixebatiments.fr/nous-recrutons.html
9. Hebras Travaux Publics (Limoges) | site proposé : https://www.hebras.fr [nom absent]
10. Chaumeil TP (Peyrat-de-Bellac) | pas de site proposé
11. Pasquier & Fils (Pierre-Buffière) | site proposé : https://www.pasquier-et-fils.fr [erreur 525]
12. SOTEC Groupe Massy (Limoges) | pas de site proposé
13. Entreprise Blanchon (Limoges) | pas de site proposé
14. TLB SARL (Limoges) | pas de site proposé
15. GEBO TP (Limoges) | pas de site proposé
16. COULON TP (Saint-Victurnien) | pas de site proposé
17. DLTP (Saint-Martin-le-Vieux) | pas de site proposé
18. Ouvrage BTP (Saint-Junien) | pas de site proposé
19. GEIQ 87 Construction (Limoges) | site proposé : https://www.geiq87construction.fr [répond] | recrutement proposé : https://www.geiq87construction.fr

---

# Lot 16 : employeurs, coiffure-esthetique (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Franck Provost (Périgueux, Sarlat-la-Canéda, Limoges) | site proposé : https://www.franckprovost.com [répond] | recrutement proposé : https://www.franckprovost.com/nous-rejoindre
2. Artistyk (Périgueux) | pas de site proposé
3. Mathy's by Kristel (Bergerac) | pas de site proposé
4. Anne Marie Styl (Bergerac) | pas de site proposé
5. Style & Tendances (Chancelade) | pas de site proposé
6. L'Instant Coiffure Beauté (Sarlat-la-Canéda) | pas de site proposé
7. C&B Coiffure et Beauté (Bergerac) | pas de site proposé
8. À l'Image de Soie (Périgueux) | pas de site proposé
9. Rêv'Style (Périgueux) | pas de site proposé
10. Au P'tit Salon (Périgueux) | pas de site proposé
11. Styl'Coiffure Laetis (Cénac-et-Saint-Julien) | pas de site proposé
12. Secrets de Fée (Périgueux) | pas de site proposé
13. L'Institut VK (Périgueux) | pas de site proposé
14. Aura & Beauté (Trélissac) | pas de site proposé
15. Perles de Spa (Marsac-sur-l'Isle) | pas de site proposé
16. Carole Beauté (Mussidan) | pas de site proposé
17. Les Fées de la Beauté (Thiviers) | pas de site proposé
18. Le Grain de Beauté (Le Bugue) | pas de site proposé
19. Saint Algue (Limoges) | site proposé : https://www.saint-algue.com [répond]

---

# Lot 17 : employeurs, coiffure-esthetique (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Camille Albane (Limoges) | site proposé : https://www.camillealbane.com [répond]
2. Fabio Salsa (Limoges) | site proposé : https://www.fabiosalsa.com [répond]
3. DESSANGE (Limoges) | site proposé : https://www.dessange.com [répond] | recrutement proposé : https://www.dessange.com/recrutement
4. Intermède (Limoges) | site proposé : https://www.intermede.fr [répond]
5. Esthète Salon (Limoges) | pas de site proposé
6. Au Salon d'Anaïs Coiffure Esthétique et Ongles (Boisseuil) | pas de site proposé
7. Emy Avet Coiffure & Esthétique (Limoges) | pas de site proposé
8. Me and My Salon (Rilhac-Rancon) | pas de site proposé
9. Univ'HairSpa (Panazol) | pas de site proposé
10. Mon Salon Coiffure Institut (Saint-Victurnien) | pas de site proposé
11. Addict Paris (Le Vigen) | site proposé : https://addictparis.fr [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
12. Isatis Le Spa (Limoges) | pas de site proposé
13. Naïa Spa (Limoges) | site proposé : https://www.naiaspa.fr [répond]
14. Esthetic Center (Le Vigen) | site proposé : https://www.esthetic-center.com [bloque les robots]
15. Mon Spa (Limoges) | pas de site proposé
16. Institut Sépia (Limoges) | pas de site proposé
17. Pensée Cocoon (Limoges) | pas de site proposé
18. Atelier du Bien Être (Limoges) | pas de site proposé
19. Ambre Institut (Aixe-sur-Vienne) | pas de site proposé

---

# Lot 18 : employeurs, commerce-vente

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Besson Chaussures (Boisseuil) | site proposé : https://www.besson-shoes.com/fr/ [bloque les robots] | recrutement proposé : https://careers.werecruit.io/fr/besson-chaussures
2. Cultura (Boisseuil) | site proposé : https://www.cultura.com/ [bloque les robots] | recrutement proposé : https://www.cultura.com/recrutement.html
3. B&M (Limoges) | site proposé : https://www.bmstores.fr [répond]
4. Monoprix (Périgueux, Limoges) | site proposé : https://www.monoprix.fr/ [bloque les robots] | recrutement proposé : https://recrutement.monoprix.fr/fr/annonces
5. Maisons du Monde (Boulazac Isle Manoire) | site proposé : https://www.maisonsdumonde.com/ [bloque les robots] | recrutement proposé : https://recrutement.maisonsdumonde.com/
6. celio (Boulazac Isle Manoire) | site proposé : https://www.celio.com/fr-fr [bloque les robots] | recrutement proposé : https://talents.celio.com/
7. H&M (Limoges) | site proposé : https://www2.hm.com/fr_fr/index.html [bloque les robots] | recrutement proposé : https://career.hm.com/fr-fr/
8. Zara (Limoges) | site proposé : https://www.zara.com [nom absent] | recrutement proposé : https://www.inditexcareers.com
9. C&A (Boisseuil) | site proposé : https://www.c-and-a.com [répond]
10. Géant des Beaux-Arts (Limoges) | site proposé : https://www.geant-beaux-arts.fr [répond]
11. Lapeyre (Limoges) | site proposé : https://www.lapeyre.fr [répond]
12. Mobilier de France (Feytiat) | site proposé : https://www.mobilierdefrance.com [répond] | recrutement proposé : https://recrutement.mobilierdefrance.com
13. Grand Frais Bergerac (Bergerac) | site proposé : https://www.grandfrais.com/magasins/bergerac [répond]
14. Weldom (Sarlat-la-Canéda, Limoges, Aixe-sur-Vienne) | site proposé : https://www.weldom.fr [bloque les robots] | recrutement proposé : https://rejoins.weldom.fr/
15. Grand Frais Limoges Centre (Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-centre [répond]
16. Grand Frais Limoges Nord (Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-nord [répond]
17. Grand Frais Limoges Sud (Limoges) | site proposé : https://www.grandfrais.com/magasins/limoges-sud [répond]
18. Carrefour (Cénac-et-Saint-Julien, Eymet, La Coquille) | site proposé : https://www.carrefour.fr [bloque les robots] | recrutement proposé : https://recrute.carrefour.fr/

---

# Lot 19 : employeurs, communication-culture (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. PXINFOS (Périgueux) | site proposé : https://www.pxinfos.fr [répond]
2. Réussir Le Périgord (Périgueux) | site proposé : https://www.reussir.fr/perigord [erreur 404]
3. Le Démocrate Indépendant (Bergerac) | pas de site proposé
4. L'Odyssée Scène Conventionnée (Périgueux) | site proposé : https://www.odyssee-perigueux.fr [répond]
5. Le Palace (Périgueux) | site proposé : https://www.odyssee-perigueux.fr [répond]
6. Agora Pôle National Cirque (Boulazac Isle Manoire) | site proposé : https://www.agora-boulazac.fr [répond]
7. Musée du Tabac (Bergerac) | site proposé : https://www.bergerac.fr [nom absent]
8. Musée National de Préhistoire (Les Eyzies) | site proposé : https://musee-prehistoire-eyzies.fr [répond] | recrutement proposé : https://choisirleservicepublic.gouv.fr
9. Écomusée de la Truffe (Sorges et Ligueux en Périgord) | site proposé : https://ecomuseedelatruffe.com [répond]
10. CYL&COM (Périgueux) | pas de site proposé
11. JAÉCO (Périgueux) | site proposé : https://www.jaeco.fr [répond]
12. ILÔ Créatif (Périgueux) | site proposé : https://www.ilo-creatif.com [répond]
13. Distinguez-Vous (Périgueux) | pas de site proposé
14. Médias-Conseils (Cours-de-Pile) | site proposé : https://www.medias-conseils.com [répond]
15. Le Populaire du Centre (Limoges) | site proposé : https://www.lepopulaire.fr [répond]
16. Centre France Publicité (Limoges) | site proposé : https://centrefrancepub.fr [répond]
17. France 3 Limousin (Limoges) | site proposé : https://france3-regions.francetvinfo.fr/nouvelle-aquitaine [répond]
18. Opéra de Limoges (Limoges) | site proposé : https://www.operalimoges.fr [répond]

---

# Lot 20 : employeurs, communication-culture (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Culturel Jean Gagnant (Limoges) | pas de site proposé
2. Les Francophonies - Des écritures à la scène (Limoges) | site proposé : https://www.lesfrancophonies.fr [répond]
3. Musée des Beaux-Arts de Limoges (Limoges) | pas de site proposé
4. Musée d'Art Contemporain de Rochechouart (Rochechouart) | site proposé : https://www.musee-rochechouart.com [répond] | recrutement proposé : https://choisirleservicepublic.gouv.fr
5. Terre-Lune (Limoges) | site proposé : https://www.terre-lune.com [ne répond pas (connexion)]
6. Pixine (Limoges) | site proposé : https://www.pixine.fr [répond]
7. Stratege Communication (Limoges) | pas de site proposé
8. ITI Communication (Limoges) | site proposé : https://www.iti-communication.com [répond]
9. Graphitéine (Limoges) | site proposé : https://www.graphiteine.fr [répond]
10. Agence Bad Monkey (Limoges) | site proposé : https://www.agencebadmonkey.com [bloque les robots]
11. Studio Emia (Limoges) | pas de site proposé
12. Théâtre de l'Union - CDN du Limousin (Limoges) | site proposé : https://www.theatre-union.fr [répond] | recrutement proposé : https://www.theatre-union.fr/recrutement
13. Zénith Limoges Métropole (Limoges) | site proposé : https://www.zenithlimoges.com [répond]
14. Théâtre Expression 7 (Limoges) | pas de site proposé
15. Musée national Adrien Dubouché (Limoges) | site proposé : https://www.musee-adriendubouche.fr [répond] | recrutement proposé : https://choisirleservicepublic.gouv.fr
16. Musée de la Résistance (Limoges) | pas de site proposé
17. Centre International de la Caricature, du Dessin de Presse et d'Humour (Saint-Just-le-Martel) | site proposé : https://www.caricature.eu [répond]
18. Maison de l'Or en Limousin (Le Chalard) | pas de site proposé

---

# Lot 21 : employeurs, education-formation (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. AFPA Centre de Périgueux (Boulazac Isle Manoire) | site proposé : https://www.afpa.fr [répond]
2. GRETA-CFA Aquitaine Agence Dordogne (Périgueux, Sarlat-la-Canéda, Montpon-Ménestérol) | site proposé : https://greta-cfa-aquitaine.fr/ [répond] | recrutement proposé : https://greta-cfa-aquitaine.fr/recrutement
3. Écoles de la CCI Dordogne (Boulazac Isle Manoire) | site proposé : https://www.dordogne.cci.fr [nom absent] | recrutement proposé : https://www.dordogne.cci.fr/recrutement
4. Institution Sainte-Marthe Saint-Front (Bergerac) | pas de site proposé
5. Institution Sainte-Marthe (Périgueux) | pas de site proposé
6. Institution Saint-Joseph (Sarlat-la-Canéda) | pas de site proposé
7. Collège Notre-Dame (Ribérac) | site proposé : https://www.notredame-riberac.fr [répond]
8. École Sacré-Cœur (Périgueux) | pas de site proposé
9. AFPA Limoges Romanet (Limoges) | site proposé : https://www.afpa.fr [répond]
10. Greta-CFA Limousin (Limoges) | site proposé : https://www.greta-du-limousin.fr/ [répond] | recrutement proposé : https://www.ac-limoges.fr/conseilleres-en-formation-professionnelle-hf-125332
11. CFA Académique du Limousin (Limoges) | pas de site proposé
12. CMA Formation Le Moulin Rabaud (Limoges) | site proposé : https://www.cma-nouvelleaquitaine.fr [répond]
13. BTP CFA 87 Limoges (Limoges) | site proposé : https://www.btpcfa-na.fr [répond]
14. CFIM TP (Le Palais-sur-Vienne) | pas de site proposé
15. CFPPA Les Vaseix (Verneuil-sur-Vienne, Bellac) | site proposé : https://www.epl-limoges-nord87.fr [ne répond pas (ECONNREFUSED)]

---

# Lot 22 : employeurs, education-formation (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. CCI Limoges Haute-Vienne Formation (Limoges) | site proposé : https://www.limoges.cci.fr [bloque les robots] | recrutement proposé : https://www.limoges.cci.fr/recrutement
2. 3iL Formation (Limoges) | pas de site proposé
3. INSUP Formation (Limoges) | site proposé : https://www.insup.org [répond] | recrutement proposé : https://www.insup.org/recrutement
4. Institution Alfred Fournier (Limoges) | pas de site proposé
5. MFR Les Vaseix (Verneuil-sur-Vienne) | site proposé : https://www.mfr.fr [nom absent]
6. Ligue de l'Enseignement de la Haute-Vienne (Limoges) | pas de site proposé
7. Osengo Limoges (Limoges) | site proposé : https://www.osengo.fr [répond] | recrutement proposé : https://www.osengo.fr/recrutement
8. Polaris Formation (Limoges) | site proposé : https://www.polaris-formation.fr [ne répond pas (connexion)]
9. Cnam Nouvelle-Aquitaine Limoges (Limoges) | site proposé : https://www.cnam-nouvelle-aquitaine.fr [répond]
10. École de la Deuxième Chance Limousin (Verneuil-sur-Vienne) | pas de site proposé
11. ISFOGEP (Limoges) | pas de site proposé
12. HV Formations (Oradour-sur-Glane) | pas de site proposé
13. EPCP Centre de Formation PMS (Boisseuil) | site proposé : https://epcp.fr [répond]
14. Académie de Limoges (Limoges) | site proposé : https://www.ac-limoges.fr/ [bloque les robots] | recrutement proposé : https://www.ac-limoges.fr/autres-recrutements-121869
15. Région académique Nouvelle-Aquitaine - Conseillers en formation professionnelle (Limoges) | site proposé : https://www.ac-limoges.fr [bloque les robots] | recrutement proposé : https://www.ac-limoges.fr/conseilleres-en-formation-professionnelle-hf-125332

---

# Lot 23 : employeurs, hotellerie-restauration (1/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Le Moulin du Roc (Brantôme en Périgord) | site proposé : https://www.moulinduroc.com [répond] | recrutement proposé : https://www.moulinduroc.com/recrutement
2. Château des Vigiers (Monestier) | site proposé : https://vigiers.com [répond] | recrutement proposé : https://vigiers.com/fr/hotel-dordogne/recrutement-dordogne.php
3. Sandaya Le Grand Dague (Boulazac Isle Manoire) | site proposé : https://www.sandaya.fr [nom absent] | recrutement proposé : https://recrutement.sandaya.jobs/fr/offres
4. Slow Village Séveilles (Coux et Bigaroque-Mouzens) | site proposé : https://www.slow-village.com [répond] | recrutement proposé : https://www.slow-village.com
5. VTF Le Domaine du Peyrichoux (Singleyrac) | site proposé : https://www.vtf-vacances.com [nom absent] | recrutement proposé : https://www.vtf-vacances.com
6. Le Clos du Moulin (Terrasson-Lavilledieu) | site proposé : https://www.leclosdumoulin.com [répond]
7. Mercure Périgueux Centre (Périgueux) | site proposé : https://all.accor.com [nom absent] | recrutement proposé : https://careers.accor.com
8. The Originals City Hôtel Albizia (Sarlat-la-Canéda) | site proposé : https://www.theoriginalshotels.com [répond]
9. Kyriad Périgueux Boulazac (Boulazac Isle Manoire) | site proposé : https://www.kyriad.com [répond]
10. Campanile Périgueux Boulazac (Boulazac Isle Manoire) | site proposé : https://www.campanile.com [répond]
11. Première Classe Périgueux Boulazac (Boulazac Isle Manoire) | site proposé : https://www.premiereclasse.com [répond]
12. Vacancéole Le Clos du Rocher (Les Eyzies) | site proposé : https://www.vacanceole.com [répond]
13. Yelloh! Village (Saint-Antoine-de-Breuilh, Coly-Saint-Amand) | site proposé : https://www.yellohvillage.fr [bloque les robots] | recrutement proposé : https://www.yellohvillage.fr/recrutement
14. Huttopia Sarlat (Sarlat-la-Canéda) | site proposé : https://europe.huttopia.com [répond]
15. Domaine d'Essendiéras (Saint-Médard-d'Excideuil) | site proposé : https://www.essendieras.fr [répond] | recrutement proposé : https://www.essendieras.fr/recrutement
16. Mercure Limoges Royal Limousin (Limoges) | site proposé : https://all.accor.com [nom absent] | recrutement proposé : https://careers.accor.com
17. Campanile Limoges Nord (Limoges) | site proposé : https://www.campanile.com [répond]

---

# Lot 24 : employeurs, hotellerie-restauration (2/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Kyriad Limoges Centre Gare Atrium (Limoges) | site proposé : https://www.kyriad.com [répond]
2. The Originals City Hôtel Saint-Martial (Limoges) | site proposé : https://www.theoriginalshotels.com [répond]
3. Camping du Lac de Saint-Pardoux (Saint-Pardoux-le-Lac) | pas de site proposé
4. Camping Au Pont du Dognon (Saint-Laurent-les-Églises) | pas de site proposé
5. Camping du Château de Leychoisier (Bonnac-la-Côte) | pas de site proposé
6. Camping de Montréal (Saint-Germain-les-Belles) | pas de site proposé
7. Logis Hôtel Auberge Dupuytren (Pierre-Buffière) | site proposé : https://www.logishotels.com [répond]
8. La Chapelle Saint Martin (Nieul) | site proposé : https://www.chapellesaintmartin.com [répond]
9. Camping du Lac d'Arfeuille (Saint-Yrieix-la-Perche) | pas de site proposé
10. Camping Le Cheyenne Limousin (Châteauneuf-la-Forêt) | pas de site proposé
11. Le Brit Europ'Hôtel Bergerac (Bergerac) | site proposé : https://www.europ-hotel-bergerac.com/ [répond]
12. Logis Hôtel & Restaurant Ludik (Bergerac) | site proposé : https://ludikresort.com/ [répond]
13. Camping La Pelouse (Bergerac) | site proposé : https://www.bergerac.fr/decouvrir-bergerac/tourisme/ [répond]
14. Domaine de l'Étang de Bazange (Monfaucon) | site proposé : https://www.camping-bazange-dordogne.com/ [répond]
15. Restaurant Hercule Poireau (Périgueux) | site proposé : https://www.tourisme-grandperigueux.fr/fiche/hercule-poireau/ [répond]
16. Restaurant Capelo (Périgueux) | site proposé : https://www.restaurant-capelo-perigueux.fr/ [répond]
17. Restaurant Eden (Périgueux) | site proposé : https://restaurant-eden-perigueux-24.fr/fr/page/contact [répond]

---

# Lot 25 : employeurs, hotellerie-restauration (3/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Camping d'Auberoche (Bassillac et Auberoche) | site proposé : https://campingdauberoche.fr/ [répond]
2. Camping Le Domaine du Bois Coquet (La Douze) | site proposé : https://www.tourisme-grandperigueux.fr/fiche/camping-le-domaine-du-bois-coquet/ [répond]
3. Domaine de Loisirs Le Montant (Sarlat-la-Canéda) | site proposé : https://www.camping-sarlat.com/ [répond]
4. Flower Camping La Sagne (Vitrac) | site proposé : https://www.camping-la-sagne.com/ [répond]
5. Les Chalets du Périgord (Sarlat-la-Canéda) | site proposé : https://www.location-vacance-sarlat.com/ [répond]
6. Camping La Châtaigneraie (Prats-de-Carlux) | site proposé : https://www.camping-vagues-oceanes.com/camping-dordogne-et-lot/la-chataigneraie [répond]
7. Le Bistro de l'Octroi (Sarlat-la-Canéda) | site proposé : https://lebistrodeloctroi.fr/ [répond]
8. Restaurant L'Esprit Sarlat (Sarlat-la-Canéda) | site proposé : https://www.lesprit-sarlat.com/ [répond]
9. L'Assiette Sarladaise (Sarlat-la-Canéda) | site proposé : https://www.lassiettesarladaise-sarlat.fr/ [répond]
10. Mairie de Sarlat-la-Canéda - restauration scolaire (Sarlat-la-Canéda) | site proposé : https://sarlat.fr/mon-quotidien/scolarite-enfance-et-jeunesse/les-ecoles-de-sarlat/la-restauration-scolaire/ [répond]
11. ibis budget Limoges Nord (Limoges) | site proposé : https://all.accor.com/hotel/A475/index.en.shtml [répond]
12. Mercure Limoges Centre (Limoges) | site proposé : https://all.accor.com/hotel/5955/index.fr.shtml [répond]
13. greet hotel Limoges Nord (Limoges) | site proposé : https://all.accor.com/hotel/C343/index.fr.shtml [répond]
14. Hôtel des Deux Moulins (Limoges) | site proposé : https://www.hotel-limoges.com/contact [répond]
15. La Table d'Adrien (Limoges) | site proposé : https://www.latabledadrien.fr/ [répond]
16. Brasserie Le Versailles (Limoges) | site proposé : https://www.brasserie-le-versailles-limoges.com/ [répond]
17. Camping Paradis Les Deux Îles (Peyrat-le-Château) | site proposé : https://campingles2iles.fr/ [répond]

---

# Lot 26 : employeurs, industrie (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Eurenco Bergerac (Bergerac) | site proposé : https://eurenco.com/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | recrutement proposé : https://eurenco.com/fr/nous-rejoindre/
2. Interspray (Groupe Fareva) (Neuvic) | site proposé : https://www.fareva.com [erreur 500]
3. St Michel (Champagnac-de-Belair) | site proposé : https://www.stmichel.fr [répond]
4. Sonoco Metal Packaging France (Périgueux) | site proposé : https://sonoco.com [répond] | recrutement proposé : https://careers.sonoco.com
5. ArcelorMittal Périgueux (Périgueux) | site proposé : https://france.arcelormittal.com [répond]
6. Fromarsac (Marsac-sur-l'Isle) | site proposé : https://www.fromarsac.fr [ne répond pas (ECONNREFUSED)]
7. Biscotterie La Chanteracoise (Saint-Germain-du-Salembre) | pas de site proposé
8. Bouchillou Alkya (Bergerac) | pas de site proposé
9. Emmi Desserts Valade (Condat-sur-Trincou) | site proposé : https://www.emmi.com [bloque les robots] | recrutement proposé : https://group.emmi.com/careers
10. CETEC Industrie (Chancelade) | site proposé : https://www.cetec-industrie.fr [répond]
11. SERM 24 (Creysse) | site proposé : https://www.serm24.fr [répond]
12. TPL Systèmes (Sarlat-la-Canéda) | pas de site proposé
13. Industrie Bois Rousseau (Dussac) | pas de site proposé
14. Arquus (Limoges) | site proposé : https://www.arquus-defense.com/fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | recrutement proposé : https://www.welcometothejungle.com/fr/companies-v1/arquus/jobs
15. Catalent France Limoges SAS (Limoges) | site proposé : https://www.catalent.com [répond] | recrutement proposé : https://www.catalent.com/careers
16. Europe Industrie 87 (Saint-Junien) | pas de site proposé
17. Sylvamo (Saillat-sur-Vienne) | site proposé : https://www.sylvamo.com [répond]
18. Specialty Minerals France (Saillat-sur-Vienne) | site proposé : https://www.mineralstech.com [répond] | recrutement proposé : https://www.mineralstech.com/careers
19. Madeleines Bijou (Saint-Yrieix-la-Perche) | site proposé : https://www.bijou.com [répond]

---

# Lot 27 : employeurs, industrie (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Broussaud Textiles (Les Cars) | site proposé : https://www.broussaud.com [répond]
2. ElringKlinger Meillor SAS (Nantiat) | site proposé : https://www.elringklinger.com [répond]
3. Steva Limousin (Bessines-sur-Gartempe) | site proposé : https://www.steva.fr [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
4. Lacotte Industrie (Le Palais-sur-Vienne) | site proposé : https://www.lacotte-industrie.fr [répond]
5. IDMC Manufacture (Limoges) | pas de site proposé
6. DVI (Limoges) | pas de site proposé
7. EPC France (Saint-Sylvestre) | site proposé : https://www.epc-groupe.com [nom absent] | recrutement proposé : https://www.epc-groupe.com/carrieres
8. Saica Pack (Saint-Junien) | site proposé : https://www.saica.com [répond]
9. Orano Mining (Bessines-sur-Gartempe) | site proposé : https://www.orano.group [répond] | recrutement proposé : https://www.orano.group/jobs
10. ENGIE Solutions (Limoges) | site proposé : https://www.engie-solutions.com [bloque les robots] | recrutement proposé : https://jobs.engie.com
11. Valeo Matériaux de Friction (Limoges) | site proposé : https://www.valeo.com [répond]
12. J.M. Weston Manufacture (Limoges) | site proposé : https://www.jmweston.com [répond]
13. Hermès Ganterie (Saint-Junien) | site proposé : https://www.hermes.com/fr/fr/ [nom absent] | recrutement proposé : https://talents.hermes.com/fr/sites/CX
14. Pusterla 1880 France (Oradour-sur-Glane) | site proposé : https://www.pusterla1880.com [répond] | recrutement proposé : https://www.pusterla1880.com/careers
15. Plast Avenir 87 (Limoges) | pas de site proposé
16. France Paratonnerres SAS (Limoges) | site proposé : https://www.france-paratonnerres.com [répond]
17. Delouis Fils (Champsac) | site proposé : https://www.delouis.com [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
18. Bernardaud (Limoges) | site proposé : https://www.bernardaud.com [répond] | recrutement proposé : https://www.bernardaud.com/fr/recrutement
19. MEDIA6 Production PLV (Verneuil-sur-Vienne) | site proposé : https://www.media6.com [répond]

---

# Lot 28 : employeurs, numerique

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. AT Internet (Piano Analytics) (Périgueux) | site proposé : https://www.piano.io [répond] | recrutement proposé : https://www.piano.io/company/careers
2. Octopus Business (Boulazac Isle Manoire) | site proposé : https://www.octopusbusiness.fr [répond]
3. SFERE24 (Boulazac Isle Manoire) | site proposé : https://telecoms.groupe-sequences.fr [nom absent]
4. Agence Beacom (Bergerac) | site proposé : https://beacom.fr [ne répond pas (EAI_AGAIN)]
5. Apsodia (Périgueux) | site proposé : https://apsodia.com [répond]
6. APLOSE - Ma Gestion Cloud (Beleymas) | site proposé : https://aplose.fr [répond]
7. Adekoi (Sanilhac) | site proposé : https://adekoi.com [répond]
8. CSTE (Trélissac) | site proposé : https://www.cste.fr [répond]
9. Heliaq (Limoges) | site proposé : https://heliaq.fr [répond]
10. Koesio Aquitaine (Limoges) | site proposé : https://koesio.com [répond]
11. Limousin Informatique (Limoges) | site proposé : https://www.limousin-informatique.fr [répond]
12. Ecomsoft (Limoges) | site proposé : https://www.ecomsoft.fr [répond]
13. Solune (Limoges) | site proposé : https://solune.com/ [répond]
14. Internatél (Le Palais-sur-Vienne) | site proposé : https://www.internatel.fr [répond]
15. Neowise (Limoges) | site proposé : https://www.neowise.fr [répond]
16. Orbial (Limoges) | site proposé : https://orbial.fr [répond]
17. OD&B (Limoges) | pas de site proposé
18. Conecti by LDS (Limoges) | site proposé : https://conecti.fr [répond]
19. Néosoft (Limoges) | site proposé : https://www.neosoft.fr [répond]
20. Fluffy Agency (Limoges) | site proposé : https://www.fluffy-agency.com [répond]
21. Youlead Limoges (Limoges) | site proposé : https://www.youlead-limoges.fr [répond]
22. Proximit (Aixe-sur-Vienne) | site proposé : https://www.proximit.fr [répond]
23. Buildéo SARL (Saint-Junien) | site proposé : https://www.buildeo.fr [répond]
24. ATENOS (Limoges) | site proposé : https://atenos.fr [répond]

---

# Lot 29 : employeurs, proprete (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Syndicat Mixte Départemental des Déchets de la Dordogne (SMD3) (Coulounieix-Chamiers) | site proposé : https://smd3.fr [répond] | recrutement proposé : https://smd3.fr/recrutement
2. Paprec Trivalo Dordogne (Coulounieix-Chamiers) | site proposé : https://www.paprec.com [répond]
3. Paprec CRV 24 (Mouleydier) | site proposé : https://www.paprec.com [répond]
4. SUEZ RV Sud Ouest (Bergerac) | site proposé : https://www.suez.com [répond] | recrutement proposé : https://www.suez.com/fr/carrieres
5. Veolia Recyclage et Valorisation des Déchets (Boulazac Isle Manoire) | site proposé : https://www.veolia.fr/ [bloque les robots] | recrutement proposé : https://jobs.veolia.com/fr/recherche-d%27offres/France/2702/2/3017382/46/2/50/2
6. Derichebourg Propreté (Boulazac Isle Manoire, Limoges) | site proposé : https://www.derichebourg-multiservices.com/fr [répond] | recrutement proposé : https://www.derichebourg-multiservices.com/fr/carriere/offres-d-emploi
7. Samsic Propreté (Périgueux) | site proposé : https://www.samsic.fr [répond] | recrutement proposé : https://jobs.samsic.com
8. Groupe Nicollin (Périgueux) | site proposé : https://www.groupenicollin.com/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | recrutement proposé : https://recrutement.groupenicollin.com/fr/annonces
9. SYDED Haute-Vienne (Panazol) | site proposé : https://www.syded87.org [répond] | recrutement proposé : https://www.syded87.org/recrutement
10. Veolia Propreté Limousin (Limoges) | site proposé : https://www.veolia.fr/ [bloque les robots] | recrutement proposé : https://jobs.veolia.com/fr/recherche-d%27offres/France/2702/2/3017382/46/2/50/2
11. Veolia - Unité de valorisation énergétique des déchets (Limoges) | site proposé : https://www.veolia.fr/ [bloque les robots] | recrutement proposé : https://jobs.veolia.com/fr/recherche-d%27offres/France/2702/2/3017382/46/2/50/2
12. SUEZ Recyclage et Valorisation (Limoges) | site proposé : https://www.suez.com [répond] | recrutement proposé : https://www.suez.com/fr/carrieres
13. Samsic Facility (Limoges) | site proposé : https://www.samsic.fr [répond] | recrutement proposé : https://jobs.samsic.com
14. CDR Environnement (Limoges) | site proposé : https://www.cdr-environnement.fr [ne répond pas (ECONNREFUSED)]

---

# Lot 30 : employeurs, proprete (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Sanicentre Limoges (Limoges) | site proposé : https://www.sanicentre-limoges.fr [erreur 404]
2. P.N.S (Verneuil-sur-Vienne) | pas de site proposé
3. Multi-Propr'Services (Couzeix) | pas de site proposé
4. SICTOM Sud Haute-Vienne (Saint-Yrieix-la-Perche) | pas de site proposé
5. Matei Environnement (Limoges) | pas de site proposé
6. Net Plus (Limoges) | pas de site proposé
7. Limousin Entretien (Limoges) | site proposé : https://www.limousin-entretien.fr [répond]
8. Concept Nettoyage (Saint-Gence) | pas de site proposé
9. Clean Service 87 (Limoges) | pas de site proposé
10. Atalian Facility (Limoges) | site proposé : https://www.atalian.com [répond] | recrutement proposé : https://jobs.atalian.com
11. GSF Athéna (Limoges) | site proposé : https://www.gsf.fr [nom absent]
12. ISOR (Limoges) | site proposé : https://www.isor.fr [ne répond pas (ETIMEDOUT)]
13. Challancin (Limoges) | site proposé : https://www.challancin.fr [répond]

---

# Lot 31 : employeurs, sante (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Hospitalier de Périgueux (Périgueux) | site proposé : https://www.ch-perigueux.fr [bloque les robots] | recrutement proposé : https://www.ch-perigueux.fr/offres-d-emploi-79.html
2. Centre Hospitalier de Bergerac (Bergerac) | site proposé : https://www.ch-bergerac.fr [répond]
3. Centre Hospitalier de Sarlat (Sarlat-la-Canéda) | site proposé : https://www.ch-sarlat.fr [répond]
4. Centre Hospitalier de Lanmary (Antonne-et-Trigonant) | site proposé : https://www.ch-lanmary.fr [répond]
5. Centre Hospitalier de Belvès (Pays de Belvès) | pas de site proposé
6. Centre Hospitalier Vauclaire (Montpon-Ménestérol) | site proposé : https://www.ch-vauclaire.fr/ [bloque les robots] | recrutement proposé : https://www.ch-vauclaire.fr/personnel-hospitalier/offres-demploi/offre-demploi/
7. Clinique Francheville (ELSAN) (Périgueux) | site proposé : https://www.elsan.care [répond]
8. Clinique Pasteur (ELSAN) (Bergerac) | site proposé : https://www.elsan.care [répond]
9. Dordogne Ambulances (Terrasson-Lavilledieu) | pas de site proposé
10. Ambulances Paoli (Pays de Belvès) | pas de site proposé
11. Secours Ambulances Services 24 (Périgueux) | pas de site proposé
12. Laboratoire Départemental d'Analyse et de Recherche de la Dordogne (Coulounieix-Chamiers) | site proposé : https://www.labo24.fr [nom absent]
13. DomusVi (Saint-Pierre-de-Chignac, Limoges, Panazol) | site proposé : https://www.domusvi.com [répond] | recrutement proposé : https://emploi.domusvi.com/
14. VYV3 Cœur d'Aquitaine (Périgueux, Bergerac, Sarlat-la-Canéda) | site proposé : https://www.vyv3.fr [répond] | recrutement proposé : https://recrutement.vyv3.fr
15. SYNLAB (Bergerac) | site proposé : https://www.synlab.fr [répond] | recrutement proposé : https://synlab-recrute.fr/
16. Périgord Ambulances (Trélissac) | pas de site proposé
17. SAS Fredange Ambulances Rouffignacoises (Rouffignac-Saint-Cernin-de-Reilhac) | pas de site proposé
18. Ambulances et Taxis de Lalinde (Lalinde) | pas de site proposé
19. EHPAD de Mussidan (Mussidan) | pas de site proposé

---

# Lot 32 : employeurs, sante (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Hospitalier Universitaire de Limoges (Limoges) | site proposé : https://www.chu-limoges.fr [nom absent]
2. Centre Hospitalier Esquirol (Limoges) | site proposé : https://www.ch-esquirol-limoges.fr [répond] | recrutement proposé : https://www.ch-esquirol-limoges.fr/recrutement
3. Centre Hospitalier de Saint-Junien (Saint-Junien) | site proposé : https://www.ch-stjunien.fr [répond]
4. Centre Hospitalier du Haut Limousin (Bellac, Magnac-Laval, Le Dorat) | pas de site proposé
5. Centre Hospitalier Jacques Boutard (Saint-Yrieix-la-Perche) | pas de site proposé
6. Centre Hospitalier Michel Barriet (Eymoutiers) | pas de site proposé
7. Clinique Chénieux (ELSAN) (Limoges) | site proposé : https://www.elsan.care [répond]
8. Clinique des Emailleurs - Colombier (ELSAN) (Limoges) | site proposé : https://www.elsan.care [répond]
9. VYV Ambulance (Isle) | site proposé : https://www.vyv3.fr [nom absent] | recrutement proposé : https://recrutement.vyv3.fr
10. Express'Ambulances (Limoges) | pas de site proposé
11. Malika et Associés Ambulances (Limoges) | pas de site proposé
12. LCB Ambulances (Feytiat) | pas de site proposé
13. Ambulances Pascal 87 (Limoges) | pas de site proposé
14. EHPAD Les 5 Sens (Limoges) | pas de site proposé
15. EHPAD Jean Mahaut (Nieul) | pas de site proposé
16. EHPAD Le Puy Martin (Le Palais-sur-Vienne) | pas de site proposé
17. EHPAD Résidence du Parc (Panazol) | pas de site proposé
18. EHPAD La Pélaudine (Eymoutiers) | pas de site proposé
19. Unité de Vie Victor Thuillat (Limoges) | pas de site proposé

---

# Lot 33 : employeurs, securite (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. GSP Security (Périgueux) | site proposé : https://gsp-security.fr [répond]
2. Opti Sécurité (Bergerac, Limoges) | site proposé : https://www.optisecurite.fr [répond] | recrutement proposé : https://optisecurite-2.flatchr.io
3. SPP Sécurité (Coulounieix-Chamiers) | pas de site proposé
4. ASI (Périgueux) | pas de site proposé
5. Compétence Sécurité (Périgueux) | pas de site proposé
6. GS3 Sécurité (Périgueux) | pas de site proposé
7. Xantor Vigilance et Sécurité (Saint-Astier) | pas de site proposé
8. Detexial Sécurité (Saint-Martial-d'Artenset) | site proposé : https://www.detexial.fr [répond]
9. Weesure Protection (Périgueux, Bergerac, Limoges) | pas de site proposé
10. Provençale Sécurité (Périgueux) | pas de site proposé
11. Limousin Sécurité (Limoges) | pas de site proposé
12. APS 87 (Limoges) | pas de site proposé
13. Groupe SGP (Limoges) | site proposé : https://www.groupe-sgp.fr [répond] | recrutement proposé : https://www.groupe-sgp.fr/recrutement
14. Securitas France (Limoges) | site proposé : https://www.securitas.fr [répond]
15. Fiducial Sécurité (Limoges) | site proposé : https://www.fiducial-securite.fr [répond] | recrutement proposé : https://www.fiducial-securite.fr/recrutement
16. Protectim Security Group (Limoges) | site proposé : https://protectim.fr/ [bloque les robots] | recrutement proposé : https://protectim.fr/postuler
17. Torann-France (Limoges) | site proposé : https://www.torann-france.fr [répond] | recrutement proposé : https://www.torann-france.fr/recrutement

---

# Lot 34 : employeurs, securite (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Goron (Limoges) | site proposé : https://www.goron.fr [répond]
2. Atlas Sécurité Privée (Limoges) | site proposé : https://www.atlassecurite.fr [répond]
3. PSL Sécurité (Limoges) | pas de site proposé
4. Samsic Sécurité (Limoges) | site proposé : https://www.samsic-securite.fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | recrutement proposé : https://jobs.samsic.com
5. Groupe OPS (Limoges) | site proposé : https://groupeops.fr [répond]
6. Team Sécurité (Panazol) | site proposé : https://www.teamsecurite.fr [répond]
7. Osyris Sécurité Privée (Limoges) | site proposé : https://www.osyris-securite.fr [répond]
8. LAYA Sécurité Privée 87 (Limoges) | site proposé : https://www.laya-securite.fr [répond]
9. Wise Sécurité (Limoges) | pas de site proposé
10. MP SP (Verneuil-sur-Vienne) | pas de site proposé
11. ALK Sécurité (Nedde) | pas de site proposé
12. GPSI Sécurité (Limoges) | pas de site proposé
13. SEGAO Sécurité (Feytiat) | pas de site proposé
14. APM Sécurité 87 (Limoges) | pas de site proposé
15. Protection Sécurité Privée (Limoges) | pas de site proposé
16. Lynx Sécurité Europe (Limoges) | pas de site proposé

---

# Lot 35 : employeurs, social-personne (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. ADMR La Voie Verte (Sanilhac) | pas de site proposé
2. Association Maintien à Domicile Sud Bergeracois (AMAD) (Eymet) | pas de site proposé
3. Aide Familiale à Domicile (Bergerac) | pas de site proposé
4. AARD AV 24 (Bergerac) | pas de site proposé
5. ASSAD Dordogne (Périgueux) | pas de site proposé
6. ASADHP (Thiviers) | pas de site proposé
7. Association Communauté de Communes d'Aide à Domicile (Mussidan) | pas de site proposé
8. Service d'Aide à la Personne du Sarladais (Sarlat-la-Canéda) | pas de site proposé
9. ADHAP Périgueux (Périgueux) | site proposé : https://www.adhap.fr [répond]
10. Petits-fils Périgueux (Périgueux) | site proposé : https://www.petits-fils.com/ [bloque les robots] | recrutement proposé : https://rejoindre.petits-fils.com/
11. Senior Compagnie Saint-Astier (Saint-Astier) | site proposé : https://senior-compagnie.fr/agence/dordogne/aide-a-domicile-a-saint-astier/?code-postale=24000 [répond] | recrutement proposé : https://recrutement.groupe-zephyr.fr/fr/annonces?brands=2689
12. O2 Périgueux Ouest (Périgueux) | site proposé : https://www.o2.fr [nom absent] | recrutement proposé : https://www.o2recrute.fr
13. A DOM' Limousin (Limoges) | site proposé : https://www.adomlimousin.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
14. ACTIMAD (Panazol) | site proposé : https://www.actimad.fr [répond]
15. UNA OUEST 87 (Saint-Junien) | site proposé : https://www.una.fr [nom absent]
16. Vie Paisible (Limoges) | pas de site proposé
17. Limousin Aide à Domicile (Limoges) | pas de site proposé
18. ADHAP Limoges (Limoges) | site proposé : https://www.adhap.fr [répond]

---

# Lot 36 : employeurs, social-personne (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Senior Compagnie Limoges (Limoges) | site proposé : https://senior-compagnie.fr [répond] | recrutement proposé : https://recrutement.groupe-zephyr.fr/fr/annonces?brands=2689
2. Vitalliance Limoges (Limoges) | site proposé : https://www.vitalliance.fr [répond]
3. ONELA Limoges (Limoges) | site proposé : https://www.onela.com [répond]
4. APEF Limoges (Limoges) | site proposé : https://www.apef.fr [répond] | recrutement proposé : https://www.apefrecrute.fr
5. Foyer de Vie Lysander (Bassillac et Auberoche) | pas de site proposé
6. Foyer de Vie Lou Prat Dòu Solelh (Ribérac) | pas de site proposé
7. Foyer Jacques Delprat (Monpazier) | pas de site proposé
8. Foyer Sourds Aveugles La Peyrouse (Saint-Félix-de-Villadeix) | site proposé : https://www.apajh.org [nom absent] | recrutement proposé : https://www.apajh.org/recrutement
9. ADPAD 87 (Limoges) | site proposé : https://adpad87.fr [répond] | recrutement proposé : https://adpad87.fr/recrutement
10. Générale des Services Limoges (Limoges) | site proposé : https://www.generaledesservices.com [répond] | recrutement proposé : https://www.generaledesservices.com/recrutement
11. FamiDom Limoges (Limoges) | site proposé : https://www.famidom.fr [nom absent] | recrutement proposé : https://www.famidom.fr/recrutement
12. Free Dom Limoges (Limoges, Saint-Junien) | site proposé : https://www.free-dom.fr [répond] | recrutement proposé : https://www.free-dom.fr/recrutement
13. Éveil Aides et Services à Domicile (Ambazac, Compreignac) | pas de site proposé
14. Aides et Services 87 (Limoges) | pas de site proposé
15. AFRPA Bessines-Laurière (Bessines-sur-Gartempe) | pas de site proposé
16. BMPAH (Val d'Issoire) | pas de site proposé
17. CIAS Pays de Nexon-Monts de Châlus (Nexon) | site proposé : https://www.paysdenexon-montsdechalus.fr [répond]

---

# Lot 37 : employeurs, sport-animation (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Profession Sport & Loisirs Dordogne (Périgueux) | site proposé : https://dordogne.profession-sport-loisirs.fr [répond] | recrutement proposé : https://www.lesportrecrute.fr/pages-entreprises/emploi-Psl-24-e-459
2. GEIQ Sport Animation Nouvelle-Aquitaine - Antenne Dordogne (Périgueux) | site proposé : https://dordogne.profession-sport-loisirs.fr/geiq-sport-animation-na-dordogne [répond]
3. Fédération Départementale des Centres Sociaux du Périgord (Marsac-sur-l'Isle) | pas de site proposé
4. Centre Social Jean Moulin (Bergerac) | pas de site proposé
5. Centre Social Germaine Tillion (Bergerac) | pas de site proposé
6. Centre Social La Brunetière (Bergerac) | pas de site proposé
7. Centre Social et Culturel L'Arche (Périgueux) | pas de site proposé
8. Centre Social Saint-Exupéry (Coulounieix-Chamiers) | pas de site proposé
9. Centre Social et Culturel Passerelle Vézère Haut Périgord Noir (Thenon) | pas de site proposé
10. GIGAFIT Périgueux Marsac (Marsac-sur-l'Isle) | site proposé : https://gigafit.fr [répond] | recrutement proposé : https://gigafit.fr/recrutement
11. Keepcool Périgueux (Sanilhac) | site proposé : https://www.keepcool.fr [répond]
12. L'Orange Bleue Sarlat (Sarlat-la-Canéda) | site proposé : https://www.lorangebleue.fr [répond] | recrutement proposé : https://www.lorangebleue.fr/recrutement
13. Le Loft Fitness Club (Périgueux) | pas de site proposé
14. Le Club Sport en Conscience (Bergerac) | pas de site proposé
15. Liberty Gym (Sarlat-la-Canéda) | site proposé : https://libertygym.fr [répond]
16. Duck Gym (Le Bugue) | pas de site proposé
17. Profession Sport & Loisirs Haute-Vienne (Limoges) | site proposé : https://lesportrecrute.fr [répond] | recrutement proposé : https://lesportrecrute.fr
18. GEIQ Sport Animation Nouvelle-Aquitaine - Haute-Vienne (Limoges) | site proposé : https://lesportrecrute.fr [répond] | recrutement proposé : https://lesportrecrute.fr
19. Comité Départemental Olympique et Sportif de la Haute-Vienne (Limoges) | site proposé : https://cdos87.fr [répond]
20. ASPTT Limoges (Limoges) | site proposé : https://limoges.asptt.com/ [bloque les robots]
21. CHÉOPS 87 (Limoges) | site proposé : https://www.cheops87.com [répond]
22. Fitness Park Limoges (Limoges) | site proposé : https://www.fitnesspark.fr [répond]
23. Elancia Limoges La Borie (Limoges) | site proposé : https://www.elancia.fr [répond] | recrutement proposé : https://www.elancia.fr/recrutement

---

# Lot 38 : employeurs, sport-animation (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Magic Fitness (Couzeix) | site proposé : https://www.magicfitness.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
2. Iron Gym (Limoges) | pas de site proposé
3. Planète Forme (Feytiat) | site proposé : https://www.planeteforme.fr [répond]
4. Espace Forme (Limoges) | pas de site proposé
5. Ma Salle (Limoges) | site proposé : https://www.masalle.fr [répond]
6. Centre Social Aristide Briand ALIS (Limoges) | pas de site proposé
7. Centre Social Entre Deux ALIS (Limoges) | pas de site proposé
8. Centre Social Municipal de Beaubreuil (Limoges) | site proposé : https://www.limoges.fr [nom absent]
9. Centre Social Municipal La Parenthèse de la Glane (Saint-Junien) | site proposé : https://www.saint-junien.fr [nom absent]
10. Le Club des Sports (Saint-Junien) | pas de site proposé
11. Terra'Job (Périgueux) | site proposé : https://terra-job.fr [répond] | recrutement proposé : https://terra-job.fr
12. Association Temps Jeunes (Terrasson-Lavilledieu) | pas de site proposé
13. Association Soutien Partage Évasion (Villamblard) | pas de site proposé
14. AJMR Lalinde (Lalinde) | pas de site proposé
15. Centre Loisirs Jeunes de Limoges (Limoges) | pas de site proposé
16. Centre de Ressources des Accueils de Loisirs de la Haute-Vienne (Limoges) | pas de site proposé
17. MJC Limoges (Limoges) | pas de site proposé
18. Familles Rurales Fédération Régionale Nouvelle-Aquitaine (Limoges) | site proposé : https://www.famillesrurales.org [répond]
19. On Air Fitness Limoges Centre (Limoges) | site proposé : https://www.onair-fitness.fr [répond]
20. Elancia Limoges Nord (Limoges) | site proposé : https://www.elancia.fr [répond] | recrutement proposé : https://www.elancia.fr/recrutement
21. Elancia Limoges Sud (Limoges) | site proposé : https://www.elancia.fr [répond] | recrutement proposé : https://www.elancia.fr/recrutement
22. ASC Bellevue Sainte-Claire (Limoges) | pas de site proposé
23. Centre social Alchimis (Limoges) | pas de site proposé

---

# Lot 39 : employeurs, transport-logistique (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Transports Mauffrey Dordogne Périgord (Creysse) | site proposé : https://www.mauffrey.com [répond]
2. Transports Gil (Creysse) | pas de site proposé
3. Quertour Transports (Creysse) | pas de site proposé
4. Transports Peyrou (Bertric-Burée) | pas de site proposé
5. Transports Gauthier (Saint-Pardoux-la-Rivière) | pas de site proposé
6. Transports J.R. Maury (Négrondes) | pas de site proposé
7. SAS Transports Pijassou (Thiviers) | site proposé : https://www.transportspijassou.fr [répond]
8. Transports Malaurie (Le Buisson-de-Cadouin) | pas de site proposé
9. Voyages Duverneuil (Brantôme en Périgord) | pas de site proposé
10. Périgord Voyages (Carsac-Aillac) | pas de site proposé
11. Voyages Rey (Le Bugue) | site proposé : https://www.voyages-rey.fr [ne répond pas (ENOTFOUND)]
12. Aquitaine Cars (Montpon-Ménestérol) | pas de site proposé
13. Transports Bellanger (Grignols) | pas de site proposé
14. GEODIS Distribution & Express (Limoges) | site proposé : https://www.geodis.com [répond]
15. STEF Transport Limoges (Limoges) | site proposé : https://www.stef.com [répond] | recrutement proposé : https://www.stef.jobs
16. Transports Briche (Limoges) | site proposé : https://www.transports-briche.fr [répond]
17. Transports Leroux (Boisseuil) | site proposé : https://www.transports-leroux.fr [répond]
18. Transports Gardon Limoges (TGL) (Le Palais-sur-Vienne) | pas de site proposé
19. Transports Nascimento et Fils (Oradour-sur-Glane) | site proposé : https://www.transports-nascimento.fr [répond]
20. Transports Rebeyrolle (Saint-Victurnien) | pas de site proposé
21. Limocars (Limoges) | site proposé : https://www.limocars.fr [répond]

---

# Lot 40 : employeurs, transport-logistique (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque employeur de la liste, (1) confirme ou remplace son SITE OFFICIEL (l'état du site proposé est indiqué : « répond », « nom absent », « ne répond pas », « bloque les robots »), (2) trouve sa PAGE DE RECRUTEMENT (offres, « nous rejoindre », candidature spontanée) ou confirme celle qui est proposée, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87. Beaucoup sont de petites entreprises locales sans site : écris « pas de site trouvé », ce n'est pas un échec.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).
- Ne donne jamais d'adresse de magasin ni de téléphone : ils viennent seulement de ce que je copie moi-même.

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Site officiel (confirmé / autre adresse / pas de site trouvé) | Page de recrutement | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Massy Voyages (Limoges) | pas de site proposé
2. Régie Régionale des Transports de la Haute-Vienne (Limoges) | site proposé : https://www.rrthv.fr [nom absent] | recrutement proposé : https://www.rrthv.fr/recrutement
3. Bus Lavalade Daniel (Bellac) | pas de site proposé
4. Europ Voyages 87 (Limoges) | pas de site proposé
5. CRC Logistique (Limoges) | pas de site proposé
6. Viandes Logistique Distribution (Limoges) | pas de site proposé
7. GEODIS Road Transport (Limoges) | site proposé : https://www.geodis.com [répond]
8. CEVA Logistics Limoges (Limoges) | site proposé : https://www.cevalogistics.com/fr [bloque les robots] | recrutement proposé : https://jobs.cmacgm-group.com/CEVALogistics/?locale=fr_FR
9. Groupe MTA Limoges (Limoges) | pas de site proposé
10. Centre Express Limousin 87 (Bonnac-la-Côte) | pas de site proposé
11. Transports Realle (Limoges) | pas de site proposé
12. Société des Transports de la Haute-Vienne (Bonnac-la-Côte) | pas de site proposé
13. Transports Primasfirst (Saint-Junien) | site proposé : https://www.primasfirst.com [répond]
14. Limousin Loctrans (Limoges) | pas de site proposé
15. Eurocourses (Limoges) | site proposé : https://www.eurocourses.fr [répond]
16. Transports Izaret Limousin (Saint-Junien) | site proposé : https://www.izaret.fr [répond]
17. XPO Logistics France (Limoges) | site proposé : https://europe.xpo.com [répond] | recrutement proposé : https://europe.xpo.com/fr/carrieres
18. DPD France (Limoges) | site proposé : https://www.dpd.fr [répond]
19. Chronopost (Limoges) | site proposé : https://www.chronopost.fr/fr [bloque les robots] | recrutement proposé : https://recrutement.chronopost.fr/front-jobs.html
20. DHL Freight (Limoges) | site proposé : https://www.dhl.com [nom absent] | recrutement proposé : https://careers.dhl.com
21. DB Schenker (Limoges) | site proposé : https://www.dbschenker.com [répond] | recrutement proposé : https://www.dbschenker.com/global/careers

---

# Lot 41 : structures, acces-au-droit (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Maison de Justice et du Droit de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/maisons-de-la-justice-et-du-droit/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | numéro de la fiche : 05 55 04 04 05
2. Point-Justice de Périgueux (CDAD de la Dordogne) (Périgueux) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html [répond] | numéro de la fiche : 05 53 06 39 33
3. Point-Justice de Bergerac (Bergerac) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html [répond] | numéro de la fiche : 05 53 74 40 00
4. Point-Justice de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html [répond]
5. Point-Justice de Vergt (Vergt) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html [répond] | numéro de la fiche : 05 33 09 58 98
6. Point-Justice de Saint-Médard-d'Excideuil (Saint-Médard-d'Excideuil) | site proposé : https://cdad-dordogne.fr/le-c-d-a-d/lieux-d-acces-au-droit.html [répond] | numéro de la fiche : 05 53 06 39 33
7. Point-Justice de Nontron (Nontron) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
8. Point-Justice de Terrasson-Lavilledieu (Terrasson-Lavilledieu) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
9. Point-Justice de Ribérac (Ribérac) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
10. Point-Justice de Mussidan (Mussidan) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
11. Point-Justice de Thenon (Thenon) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
12. Point-Justice de Hautefort (Hautefort) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
13. Point-Justice de Villefranche-du-Périgord (Villefranche-du-Périgord) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
14. Point-Justice de Monpazier (Monpazier) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
15. Point-Justice de Thiviers (Thiviers) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
16. Point-Justice de Brantôme en Périgord (Brantôme en Périgord) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
17. Point-Justice de Saint-Astier (Saint-Astier) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
18. Point-Justice de Belvès (Pays de Belvès) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33
19. Point-Justice de Saint-Aulaye (Saint-Aulaye-Puymangou) | site proposé : https://cdad-dordogne.fr/nouvelles-permanences.html [répond] | numéro de la fiche : 05 53 06 39 33

---

# Lot 42 : structures, acces-au-droit (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Point-Justice de la Cité judiciaire de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/lespermanences/permanence-daccueil-et-decoute/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
2. Point-Justice du Commissaire de justice de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/4a428d7d-213c-4548-a207-194dcba4a2a1 [répond] | numéro de la fiche : 05 87 19 35 94
3. Point-Justice des Chambres consulaires de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/f610dd40-9745-43d7-aee9-5ce1ae9b93ca [répond] | numéro de la fiche : 05 87 19 34 00
4. Point-Justice des associations caritatives de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/a7bacfc6-4eaf-40b1-acfc-289159152879 [répond] | numéro de la fiche : 05 55 77 42 76
5. Point-Justice itinérant en France Services de la Haute-Vienne (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/lespermanences/point-justice-itinerant/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
6. Conseil départemental de l'accès au droit de la Haute-Vienne (CDAD 87) (Limoges) | site proposé : https://cdad-hautevienne.justice.fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | numéro de la fiche : 05 87 19 34 00
7. Point-Justice du Dorat (Le Dorat) | site proposé : https://cdad-hautevienne.justice.fr/permanences/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
8. Point-Justice de Bessines-sur-Gartempe (Bessines-sur-Gartempe) | site proposé : https://cdad-hautevienne.justice.fr/permanences/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
9. Point-Justice de Saint-Junien (Saint-Junien) | site proposé : https://cdad-hautevienne.justice.fr/permanences/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
10. Point-Justice de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://cdad-hautevienne.justice.fr/permanences/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
11. Point-Justice de Panazol (Panazol) | site proposé : https://cdad-hautevienne.justice.fr/permanences/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
12. Réseau des délégués du Défenseur des droits (, portée national) | site proposé : https://www.defenseurdesdroits.fr [répond]
13. Casier judiciaire national (, portée national) | site proposé : https://www.service-public.fr/particuliers/vosdroits/N517 [nom absent]
14. Conseil départemental de l'accès au droit de la Dordogne (Périgueux) | site proposé : https://www.cdad24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 06 39 33
15. Conseil départemental de l'accès au droit de la Haute-Vienne (Limoges) | site proposé : https://www.cdad-hautevienne.fr [ne répond pas (ENOTFOUND)]
16. Conseil de prud'hommes de Limoges (Limoges) | site proposé : https://www.justice.fr [nom absent]
17. Délégués du Défenseur des droits en Haute-Vienne (Limoges) | site proposé : https://www.defenseurdesdroits.fr [répond]
18. Points-justice de la Haute-Vienne (Limoges) | site proposé : https://www.justice.fr [répond]
19. La Traverse, accès aux droits et aide au numérique (Bergerac) | pas de site proposé | numéro de la fiche : 07 69 63 67 85

---

# Lot 43 : structures, accueil-etrangers

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. ENTRE DEUX (Limoges, portée region) | site proposé : https://annuairesolidaire.fr/services/caa4dc93ba-action-socio-linguistique-complementaire-du-cir-limoges/ [répond] | numéro de la fiche : 05 87 19 69 95
2. Association de Soutien de la Dordogne (ASD) (Périgueux) | site proposé : https://www.asd24.fr [répond]
3. Centre d'accueil pour demandeurs d'asile de l'Association de Soutien de la Dordogne (Périgueux) | site proposé : https://www.asd24.fr [répond]
4. Structure de premier accueil des demandeurs d'asile de Limoges (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/Accueil-des-etrangers-vos-demarches-en-Haute-Vienne/Demander-l-asile/Informations-generales [répond] | numéro de la fiche : 05 19 99 10 60
5. Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) - Centre d'accueil pour demandeurs d'asile (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 02 65 00
6. ARSL - Centre d'accueil pour demandeurs d'asile (Limoges) | pas de site proposé | numéro de la fiche : 05 55 34 70 44
7. Association HESTIA - Centre d'accueil pour demandeurs d'asile (Limoges) | pas de site proposé | numéro de la fiche : 05 55 38 98 00
8. Adoma - Centre d'accueil pour demandeurs d'asile d'Eymoutiers (Eymoutiers) | pas de site proposé | numéro de la fiche : 05 19 76 11 01
9. ASTI de Périgueux (Périgueux) | site proposé : https://asti24.fr [ne répond pas (ENOTFOUND)]
10. Association Échange Culturel (Bergerac) | site proposé : https://www.helloasso.com/associations/association-echange-culturel [bloque les robots] | numéro de la fiche : 05 53 73 85 34
11. L'Atelier, Centre provisoire d'hébergement (CPH) de Bergerac (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 53 57 78 93
12. L'Atelier, Centre provisoire d'hébergement (CPH) de Sarlat (Sarlat-la-Canéda) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 33 09 71 54
13. L'Atelier, Plateforme départementale pour les bénéficiaires de la protection internationale (BPI) (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 06 46 34 09 89

---

# Lot 44 : structures, appui-aux-employeurs (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. CCI France (, portée national) | site proposé : https://www.cci.fr [bloque les robots]
2. Chambres d'agriculture France (, portée national) | site proposé : https://chambres-agriculture.fr [répond]
3. CMA France (, portée national) | site proposé : https://www.artisanat.fr [répond]
4. Maison de l'Emploi du Grand Périgueux (Périgueux) | site proposé : https://www.mde-grandperigueux.fr [répond]
5. Association Interconsulaire de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Entreprises-economie-emploi-et-finances-publiques/Appui-au-developpement-de-l-emploi-et-des-entreprises-en-Haute-Vienne [nom absent]
6. ARACT Nouvelle-Aquitaine (, portée region) | site proposé : https://nouvelle-aquitaine.aract.fr [nom absent]
7. Les Entreprises s'engagent (, portée national) | site proposé : https://www.lesentreprises-sengagent.gouv.fr [répond]
8. ANEFA Dordogne (Coulounieix-Chamiers) | site proposé : https://www.anefa.org/dordogne/page-daccueil/nos-missions/ [répond]
9. GEIQ Limousin (Limoges) | site proposé : https://www.lesgeiq.fr [répond]
10. ADEFA Dordogne (Coulounieix-Chamiers) | site proposé : https://www.anefa.org [nom absent]
11. ANEFA du Limousin (Limoges) | site proposé : https://www.anefa.org [répond] | numéro de la fiche : 07 88 44 22 75
12. ANEFA (, portée national) | site proposé : https://www.anefa.org [répond]
13. GEIQ Agri Limousin Périgord - Antenne Dordogne (Coulounieix-Chamiers) | site proposé : https://geiqagri-limousin-perigord.fr/contact/ [répond] | numéro de la fiche : 05 53 02 61 32
14. Groupement Employeurs Métiers 24 (Périgueux) | pas de site proposé
15. Groupement d'Employeurs Rural Sarladais (Montignac-Lascaux) | pas de site proposé
16. GEIQ 87 Construction (Limoges) | pas de site proposé | numéro de la fiche : 05 55 35 10 42
17. GEIQ Agri Limousin Périgord (Limoges) | site proposé : https://www.geiqagriqualif-limousin.fr/ [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 49 85 76

---

# Lot 45 : structures, appui-aux-employeurs (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. GEIQ Transport Nouvelle-Aquitaine (Saint-Germain-les-Belles) | site proposé : https://www.geiqtransport-na.fr/ [ne répond pas (ECONNREFUSED)] | numéro de la fiche : 05 55 77 54 50
2. GE Alisé Haute-Vienne (Limoges) | pas de site proposé | numéro de la fiche : 05 55 01 18 73
3. GEIQ SAGE (Limoges) | pas de site proposé
4. Comité Régional des GEIQ de Nouvelle-Aquitaine (, portée region) | site proposé : https://www.lesgeiq-nouvelleaquitaine.fr/ [répond] | numéro de la fiche : 05 56 46 35 28
5. GEIQ Santé Social Médico-Social Nouvelle-Aquitaine (, portée region) | site proposé : https://plateforme.inclusion.gouv.fr/company/7379/card [répond]
6. GEIQ Sport et Animation Nouvelle-Aquitaine (, portée region) | site proposé : https://www.lesgeiq-nouvelleaquitaine.fr/trouver-un-geiq-en-nouvelle-aquitaine/geiq-sport-et-animation-nouvelle-aquitaine/ [répond]
7. Fédération Française des GEIQ (, portée national) | site proposé : https://www.lesgeiq.fr/ [répond]
8. Service de Remplacement Dordogne (Coulounieix-Chamiers) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 [répond] | numéro de la fiche : 05 53 35 88 48
9. FDSEA Dordogne - Service Employeurs (Coulounieix-Chamiers) | site proposé : https://fdsea24.fr/services-employeurs/ [répond] | numéro de la fiche : 05 53 35 88 38
10. MSA Dordogne Lot-et-Garonne - Santé au travail (Périgueux) | site proposé : https://dlg.msa.fr/lfp/sst/st [répond] | numéro de la fiche : 05 53 67 77 23
11. Service de Remplacement Haute-Vienne (Panazol) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 [répond] | numéro de la fiche : 05 87 50 41 10
12. FDSEA de la Haute-Vienne - Service Employeurs (Panazol) | site proposé : https://www.fdsea87.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 87 50 41 00
13. MSA du Limousin - Santé Sécurité au Travail (Limoges) | site proposé : https://limousin.msa.fr [répond] | numéro de la fiche : 05 55 49 85 00
14. Fédération Service de Remplacement Nouvelle-Aquitaine (, portée region) | site proposé : https://servicederemplacement.fr/les-structures-locales/nouvelle-aquitaine-10 [répond] | numéro de la fiche : 05 56 01 33 60
15. FARAGO Nouvelle-Aquitaine (, portée region) | site proposé : https://www.farago.fr [nom absent] | numéro de la fiche : 05 56 01 33 60
16. MSA - Santé Sécurité au Travail (, portée national) | site proposé : https://ssa.msa.fr [répond]

---

# Lot 46 : structures, budget-endettement

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. L'Atelier budgétaire (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/pcb [répond]
2. Connect' e-bus UDAF Dordogne (Périgueux) | site proposé : https://dora.inclusion.gouv.fr/services/un-dep-ass-familial--mediation-numerique-qfec [répond]
3. Point Conseil Budget du CCAS de Limoges (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget [répond] | numéro de la fiche : 05 55 45 97 50
4. Confédération Syndicale des Familles (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Actions-de-l-Etat/Solidarite-et-cohesion-sociale/Points-Conseil-Budget [nom absent] | numéro de la fiche : 05 55 37 52 26
5. Conseil départemental de la Haute-Vienne - Accompagnement éducatif et budgétaire (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/action-sociale-a-votre-ecoute/gerer-votre-budget [erreur 404] | numéro de la fiche : 05 55 45 10 10
6. URAF Nouvelle-Aquitaine - Microcrédit personnel (, portée region) | site proposé : https://www.uraf-nouvelleaquitaine.fr/les-services-aux-familles/microcredit/ [répond]
7. Adie Dordogne (Saint-Astier) | site proposé : https://www.adie.org [répond] | numéro de la fiche : 09 69 32 81 10
8. Parcours Confiance (Institut de microcrédit) (, portée national) | site proposé : https://parcours-confiance.fr [répond]
9. La Banque Postale, service L'Appui (, portée national) | pas de site proposé | numéro de la fiche : 09 69 36 39 20

---

# Lot 47 : structures, caf

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Caisse d'Allocations Familiales de la Dordogne (Périgueux) | site proposé : https://www.caf.fr/allocataires/caf-de-la-dordogne/offre-de-service/vie-personnelle/je-cherche-un-mode-de-garde-pour-mon-enfant [nom absent]
2. Caisse d'Allocations Familiales de la Haute-Vienne (Limoges) | site proposé : https://www.caf.fr [nom absent] | numéro de la fiche : 05 55 43 40 50
3. Caisse d'Allocations Familiales (, portée national) | site proposé : https://www.caf.fr [nom absent]

---

# Lot 48 : structures, caisse-assurance-maladie-retraite

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. SPSTI 23-87 Prévention Santé Travail (Limoges) | site proposé : https://www.spsti23-87.fr [ne répond pas (ECONNREFUSED)] | numéro de la fiche : 05 55 77 65 63
2. Centre d'information de conseil et d'accueil des salariés (Cicas) - Dordogne (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/d0c52cfb-701f-40e9-a9ca-0d1b82fb467a [répond] | numéro de la fiche : 09 70 66 06 60
3. Agence conseil retraite Agirc-Arrco de Périgueux (Périgueux) | site proposé : https://www.agirc-arrco.fr/departement/24/ [nom absent] | numéro de la fiche : 09 70 66 06 60
4. Centre d'information de conseil et d'accueil des salariés (Cicas) - Haute-Vienne (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/1f442393-418a-43cc-a8dd-dd709fc06f92 [répond] | numéro de la fiche : 09 70 66 06 60
5. Agence conseil retraite Agirc-Arrco de Limoges (Limoges) | site proposé : https://www.agirc-arrco.fr/agences-retraite/agence-de-la-haute-vienne/ [nom absent] | numéro de la fiche : 09 70 66 06 60
6. Agirc-Arrco (, portée national) | site proposé : https://www.agirc-arrco.fr [nom absent]
7. Accueil conseil retraite Agirc-Arrco de Limoges - Agence PRO BTP (Limoges) | site proposé : https://www.agirc-arrco.fr/agences-retraite/accueil-conseil-retraite-agirc-arrco-de-limoges-agence-probtp/ [nom absent] | numéro de la fiche : 09 73 88 88 88
8. Centres d'information de conseil et d'accueil des salariés (Cicas) (, portée national) | site proposé : https://www.cicas.agirc-arrco.fr [nom absent] | numéro de la fiche : 09 70 66 06 60
9. MSA du Limousin (Limoges) | site proposé : https://limousin.msa.fr [répond]

---

# Lot 49 : structures, cap-emploi

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Cheops - Réseau Cap emploi (, portée national) | site proposé : https://www.cheops-ops.org [répond]
2. Cap emploi Haute-Vienne (Limoges) | site proposé : https://www.capemploi-87.com [répond] | numéro de la fiche : 05 55 38 89 70

---

# Lot 50 : structures, ccas

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre communal d'action sociale de Limoges (Limoges) | site proposé : https://www.limoges.fr [nom absent] | numéro de la fiche : 05 55 45 97 00
2. Centre communal d'action sociale de Saint-Junien (Saint-Junien) | site proposé : https://www.saint-junien.fr [répond]
3. Centre communal d'action sociale de Panazol (Panazol) | site proposé : https://www.panazol.fr [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
4. Centre communal d'action sociale d'Isle (Isle) | site proposé : https://www.isle.fr [ne répond pas (ECONNREFUSED)]
5. Centre communal d'action sociale de Couzeix (Couzeix) | site proposé : https://www.ville-couzeix.fr [ne répond pas (ENOTFOUND)]
6. Centre communal d'action sociale d'Aixe-sur-Vienne (Aixe-sur-Vienne) | site proposé : https://www.aixesurvienne.fr [répond]
7. Centre communal d'action sociale de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://www.saint-yrieix.fr [répond]
8. Centre communal d'action sociale de Bellac (Bellac) | site proposé : https://www.bellac.fr [répond]

---

# Lot 51 : structures, collectivite-etat (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Cité de l'Emploi Limoges (Limoges) | site proposé : https://www.limoges-metropole.fr [répond] | numéro de la fiche : 05 87 14 10 10
2. Validation des acquis de l'expérience de l'Éducation nationale (, portée national) | site proposé : https://vae.education.gouv.fr/ [répond]
3. Démission-Reconversion (, portée national) | site proposé : https://www.demission-reconversion.gouv.fr/etape3_valider_son_projet [répond]
4. France VAE (, portée national) | site proposé : https://vae.gouv.fr/ [répond]
5. Centre national de la fonction publique territoriale (CNFPT) (, portée national) | site proposé : https://www.cnfpt.fr [répond]
6. Conseillers mobilité-carrière de la fonction publique de l'État (, portée national) | site proposé : https://www.fonction-publique.gouv.fr [répond]
7. Agence de services et de paiement - Plateforme VAE des agents hospitaliers (Limoges, portée national) | site proposé : https://vaedem.asp-public.fr [répond]
8. Défenseur des droits (, portée region) | site proposé : https://www.defenseurdesdroits.fr [répond]
9. Service Public (, portée national) | site proposé : https://www.service-public.fr [répond]
10. Ministère du Travail (, portée national) | site proposé : https://travail-emploi.gouv.fr [nom absent]
11. Ministère de la Justice (, portée national) | site proposé : https://www.justice.fr [répond]
12. AGEFIPH Nouvelle-Aquitaine (, portée national) | site proposé : https://www.agefiph.fr [répond]
13. Direction départementale de l'emploi, du travail, des solidarités et de la protection des populations de la Dordogne (DDETSPP) (Périgueux) | site proposé : https://www.dordogne.gouv.fr/Services-de-l-Etat/Les-directions-interministerielles/Direction-de-l-Emploi-du-Travail-des-Solidarites-et-de-la-Protection-des-Populations-DDETSPP [répond]
14. Service Public - Aides à l'embauche (, portée national) | site proposé : https://entreprendre.service-public.fr [répond]
15. Conseil départemental de la Dordogne - Direction de l'économie et de l'emploi (Périgueux) | site proposé : https://demarches.dordogne.fr/guides-des-aides/dgatd/dde/eco-aides-aux-entreprises/ [erreur 404] | numéro de la fiche : 05 53 02 01 10
16. Conseil départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/insertion/vous-etes-un-employeur-du-public-ou-du-prive [répond]
17. DREETS Nouvelle-Aquitaine - Pôle entreprises, emploi et économie (, portée region) | site proposé : https://dreets.gouv.fr/nouvelle-aquitaine [nom absent]

---

# Lot 52 : structures, collectivite-etat (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Entreprendre.Service-Public.fr (, portée national) | site proposé : https://entreprendre.service-public.fr [répond]
2. Préfecture de la Haute-Vienne - Bureau de l'immigration et de l'intégration (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/Accueil-des-etrangers-vos-demarches-en-Haute-Vienne [répond] | numéro de la fiche : 05 55 44 18 00
3. Office français de protection des réfugiés et apatrides (OFPRA) (, portée national) | site proposé : https://www.ofpra.gouv.fr [répond]
4. Administration numérique pour les étrangers en France (ANEF) (, portée national) | site proposé : https://administration-etrangers-en-france.interieur.gouv.fr [répond]
5. DDETSPP de la Haute-Vienne - Inspection du travail (Limoges) | site proposé : https://haute-vienne.gouv.fr [nom absent]
6. Préfecture de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr [répond] | numéro de la fiche : 05 55 44 18 00
7. Centre de gestion de la fonction publique territoriale de la Dordogne (Marsac-sur-l'Isle) | site proposé : https://www.cdg24.fr/ [répond] | numéro de la fiche : 05 53 02 87 00
8. Direction des services départementaux de l'Éducation nationale de la Dordogne (Périgueux) | site proposé : https://www.ac-bordeaux.fr/dsden24 [bloque les robots] | numéro de la fiche : 05 53 02 84 84
9. Centre d'information et de recrutement des forces armées de Périgueux (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/dordogne/ed48ebed-2cc3-4f79-8db9-066b42b97be8 [répond] | numéro de la fiche : 05 53 02 82 75
10. Centre de gestion de la fonction publique territoriale de la Haute-Vienne (Limoges) | site proposé : https://www.cdg87.fr/ [répond] | numéro de la fiche : 05 55 30 08 40
11. Direction des services départementaux de l'Éducation nationale de la Haute-Vienne (Limoges) | site proposé : https://www.ac-limoges.fr/dsden-de-la-haute-vienne-121530 [bloque les robots] | numéro de la fiche : 05 55 11 40 40
12. Rectorat de l'académie de Limoges (Limoges) | site proposé : https://www.ac-limoges.fr [bloque les robots] | numéro de la fiche : 05 55 11 40 40
13. Centre d'information et de recrutement des forces armées de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/ae90453d-0f29-4ed2-8c3b-daea5462d950 [répond] | numéro de la fiche : 05 55 34 84 00
14. Choisir le service public (, portée national) | site proposé : https://choisirleservicepublic.gouv.fr [répond]
15. SCORE - Concours et recrutements de l'État (, portée national) | site proposé : https://www.fonction-publique.gouv.fr/score [répond]
16. Place de l'emploi public (, portée national) | site proposé : https://www.place-emploi-public.gouv.fr [ne répond pas (ENOTFOUND)]

---

# Lot 53 : structures, creation-activite (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Chambre d'agriculture de la Dordogne (Périgueux) | site proposé : https://dordogne.chambre-agriculture.fr [répond] | numéro de la fiche : 05 53 35 88 88
2. Initiative Sarlat (Sarlat-la-Canéda) | site proposé : https://initiative-perigord.fr [ne répond pas (ETIMEDOUT)]
3. Périgord Développement (Périgueux) | site proposé : https://perigord-developpement.fr [ne répond pas (ENOTFOUND)]
4. BGE Limousin (Limoges) | site proposé : https://bge-limousin.fr [ne répond pas (ECONNREFUSED)] | numéro de la fiche : 05 55 33 08 30
5. Chambre de commerce et d'industrie Limoges et Haute-Vienne (Limoges) | site proposé : https://www.limoges.cci.fr [bloque les robots] | numéro de la fiche : 05 55 45 15 15
6. Chambre d'agriculture de la Haute-Vienne (Limoges) | site proposé : https://haute-vienne.chambre-agriculture.fr [répond] | numéro de la fiche : 05 55 10 37 00
7. Initiative Haute-Vienne (Limoges) | site proposé : https://www.initiative-hautevienne.fr [ne répond pas (ETIMEDOUT)]
8. ALTIPÔLE (Limoges) | site proposé : https://www.altipole.coop [ne répond pas (ENOTFOUND)]
9. Bfm Centre - Tiers-lieu numérique (Limoges) | site proposé : https://bfm.limoges.fr [bloque les robots]
10. Réseau Entreprendre Nouvelle-Aquitaine (, portée region) | site proposé : https://www.reseau-entreprendre.org/nouvelle-aquitaine [répond]
11. Les Premières Nouvelle-Aquitaine (, portée region) | site proposé : https://lespremieres.fr [ne répond pas (ECONNREFUSED)]
12. Bpifrance Création (, portée national) | site proposé : https://bpifrance-creation.fr [répond]
13. Chambre d'agriculture de la Dordogne - Antenne du Périgord Noir (Sarlat-la-Canéda) | site proposé : https://dordogne.chambre-agriculture.fr [répond]
14. France Services Vallée Dordogne Forêt Bessède - Belvès (Pays-de-Belvès) | site proposé : https://ccdordogne-bessede.fr/aides-creation-entreprise/ [répond] | numéro de la fiche : 05 53 31 44 81
15. France Services Vallée Dordogne Forêt Bessède - Saint-Cyprien (Saint-Cyprien) | site proposé : https://ccdordogne-bessede.fr/aides-creation-entreprise/ [répond] | numéro de la fiche : 05 53 28 63 90
16. Réseau Entreprendre Limousin (Limoges) | site proposé : https://www.limoges.fr/ville-creative/accompagnement-la-creation [répond]
17. Incubatest BGE Limousin (Limoges) | site proposé : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne [nom absent] | numéro de la fiche : 05 55 33 14 79
18. La Fabrique à Initiatives Limousin (Limoges, portée region) | site proposé : https://www.franceactive.org/solutions/la-fabrique-a-initiatives/ [répond]
19. Coopérative Tiers-Lieux Nouvelle-Aquitaine (, portée region) | site proposé : https://coop.tierslieux.net/tiers-lieux/creer-un-tiers-lieu/etre-accompagne/ [répond]
20. BGE Nouvelle-Aquitaine (, portée region) | site proposé : https://www.bge-nouvelle-aquitaine.fr [répond]
21. Initiative France (, portée national) | site proposé : https://www.initiative-france.fr [répond]
22. Réseau Entreprendre (, portée national) | site proposé : https://www.reseau-entreprendre.org [répond]

---

# Lot 54 : structures, creation-activite (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Adie (, portée national) | site proposé : https://www.adie.org [répond]
2. Coopérer pour Entreprendre (, portée national) | site proposé : https://www.cooperer.coop [répond]
3. Coopérative Tiers-Lieux - Annuaire régional (, portée region) | site proposé : https://coop.tierslieux.net/carte [répond]
4. Initiative Nouvelle-Aquitaine (, portée region) | site proposé : https://www.initiative-nouvelleaquitaine.org [ne répond pas (ENOTFOUND)]
5. Réseau Entreprendre Aquitaine (, portée region) | site proposé : https://www.reseau-entreprendre.org/aquitaine [répond]
6. Chambres d'agriculture Nouvelle-Aquitaine (, portée region) | site proposé : https://nouvelle-aquitaine.chambres-agriculture.fr [répond]
7. Chambre de métiers et de l'artisanat de la Haute-Vienne (Limoges) | site proposé : https://www.cma-nouvelleaquitaine.fr [répond]
8. Coop'Alpha Limousin (Limoges) | site proposé : https://www.coopalpha.coop [répond]
9. IRISCOP Limousin (Limoges) | site proposé : https://www.iriscop.org [ne répond pas (ENOTFOUND)]
10. Club Dordogne Entrepreneurs (Bergerac) | site proposé : https://www.club-dordogne-entrepreneurs.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)] | numéro de la fiche : 06 63 12 53 61
11. EGEE Dordogne (Périgueux) | site proposé : https://www.egee.asso.fr [répond]
12. 60 000 Rebonds Nouvelle-Aquitaine (Périgueux) | site proposé : https://60000rebonds.com [répond]
13. Jeune Chambre Économique de Bergerac (Bergerac) | site proposé : https://www.jcef.fr [répond]
14. CoActions (Périgueux) | site proposé : https://www.coactions.coop [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 35 80 30
15. CoActions (Limoges) | site proposé : https://www.coactions.coop [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 79 11 14
16. ASTER Couveuse d'entreprises (Limoges) | site proposé : https://www.bge-nouvelle-aquitaine.fr/presence-sur-le-territoire/haute-vienne [nom absent] | numéro de la fiche : 05 55 33 14 79
17. EGEE Haute-Vienne (Limoges) | site proposé : https://www.egee.asso.fr [répond] | numéro de la fiche : 05 55 45 18 38
18. Jeune Chambre Économique de Limoges (Limoges) | site proposé : https://www.jcef.fr [répond]
19. EGEE Nouvelle-Aquitaine (, portée region) | site proposé : https://www.egee.asso.fr [répond]
20. Jeune Chambre Économique Française (, portée national) | site proposé : https://jcef.asso.fr [répond] | numéro de la fiche : 01 47 66 24 47
21. Entreprendre au Féminin Aquitaine (, portée region) | site proposé : https://entreprendreaufeminin-aquitaine.org [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 56 01 35 70
22. Centre des Jeunes Dirigeants d'entreprise (, portée national) | site proposé : https://www.cjd.net [nom absent] | numéro de la fiche : 01 53 35 03 00

---

# Lot 55 : structures, formation-jeunes

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre Info Jeunes de Périgueux (Périgueux) | site proposé : https://www.infojeunes-na.fr [répond] | numéro de la fiche : 05 53 53 52 81
2. Info Jeunes Sarlat (Sarlat-la-Canéda) | site proposé : https://www.infojeunes-na.fr [répond] | numéro de la fiche : 05 53 31 19 11
3. Info Jeunes Limoges (Limoges) | site proposé : https://www.infojeunes-na.fr [répond] | numéro de la fiche : 05 55 10 08 00
4. Info Jeunes France (, portée national) | site proposé : https://www.infojeunesfrance.org [répond]
5. 1 jeune 1 solution (, portée national) | site proposé : https://www.1jeune1solution.gouv.fr [répond]

---

# Lot 56 : structures, formation-orientation (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Association Formation Avenir Conseil 24 (Coulounieix-Chamiers) | site proposé : https://www.fac24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 09 03 15
2. GRETA du Limousin (Limoges) | site proposé : https://greta-limousin.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 12 31 31
3. Association Service Formation Emploi Limousin (Saint-Junien) | pas de site proposé | numéro de la fiche : 05 19 29 00 50
4. Envergure Limoges (Limoges) | site proposé : https://www.groupe-envergure.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 79 06 06
5. Osengo Limoges (Limoges) | site proposé : https://www.osengo.fr [répond] | numéro de la fiche : 05 55 77 75 89
6. IGL Formation (Limoges) | site proposé : https://igl-formation.fr [répond] | numéro de la fiche : 05 55 32 32 59
7. Formation Avenir Conseil - Antenne Bergerac (Bergerac) | site proposé : https://www.fac24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 09 03 15
8. Formation Avenir Conseil - Antenne Sarlat (Sarlat-la-Canéda) | site proposé : https://www.fac24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 09 03 15
9. Formation Avenir Conseil - Antenne Thiviers (Thiviers) | site proposé : https://www.fac24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 09 03 15
10. Dispositif académique de validation des acquis (DAVA) de l'Académie de Limoges (Périgueux) | site proposé : https://vae.education.gouv.fr/academie/22 [répond]
11. CFPPA de la Dordogne (Coulounieix-Chamiers) | site proposé : https://perigord.educagri.fr/fileadmin/user_upload/PLAQUETTES_PDF_FORMATIONS/CFPPA/VAE_2025_.pdf [nom absent] | numéro de la fiche : 05 53 02 61 30
12. Écoles de la CCI Dordogne (Bergerac) | site proposé : https://www.ecoles.dordogne.cci.fr/vae-validation-des-acquis-par-lexperience/ [répond] | numéro de la fiche : 05 53 35 72 72
13. Académie de Limoges - Dispositif académique de validation des acquis (Limoges, portée region) | site proposé : https://vae.education.gouv.fr/academie/22 [répond] | numéro de la fiche : 06 20 68 49 99
14. CIBC Solutions RH (Périgueux, portée region) | site proposé : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ [répond] | numéro de la fiche : 05 53 45 46 90
15. CIBC Haute-Vienne (Limoges, portée region) | site proposé : https://vae.gouv.fr/regions/nouvelle-aquitaine/conseillers/ [répond] | numéro de la fiche : 05 55 45 15 15
16. Association nationale pour la formation permanente du personnel hospitalier (ANFH) (, portée national) | site proposé : https://www.anfh.fr [répond]
17. AFPA Nouvelle-Aquitaine (, portée region) | site proposé : https://www.afpa.fr [répond]
18. AFPA Haute-Vienne (Limoges) | site proposé : https://www.afpa.fr [répond]
19. GRETA Limousin (Limoges) | site proposé : https://greta.ac-limoges.fr [ne répond pas (ENOTFOUND)]

---

# Lot 57 : structures, formation-orientation (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Cnam Nouvelle-Aquitaine - centre de Limoges (Limoges) | site proposé : https://www.cnam-nouvelle-aquitaine.fr [répond]
2. Point régional conseil VAE Haute-Vienne (Limoges) | site proposé : https://www.vae.gouv.fr [répond]
3. Centre d'information et d'orientation de Bergerac (Bergerac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio [répond]
4. Centre d'information et d'orientation de Nontron (Nontron) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio [répond]
5. Centre d'information et d'orientation de Périgueux (Périgueux) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio [répond] | numéro de la fiche : 05 53 35 65 00
6. Centre d'information et d'orientation de Ribérac (Ribérac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio [répond]
7. Centre d'information et d'orientation de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/dordogne/cio [répond]
8. Maison de l'Emploi du Périgord Noir (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 05 53 31 56 00
9. Espace Économie Emploi du Ribéracois (Ribérac) | pas de site proposé
10. Centre d'information et d'orientation de Bellac (Bellac) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio [répond]
11. Centre d'information et d'orientation de Limoges (Limoges) | site proposé : https://lannuaire.service-public.gouv.fr/nouvelle-aquitaine/haute-vienne/b6509d4d-2135-4571-b4a4-5c5f4357d1bf [répond] | numéro de la fiche : 05 87 50 46 00
12. Centre d'information et d'orientation de Saint-Junien (Saint-Junien) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio [répond]
13. Centre d'information et d'orientation de Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://lannuaire.service-public.gouv.fr/navigation/nouvelle-aquitaine/haute-vienne/cio [répond]
14. Point Orientation-Apprentissage de la CCI Limoges Haute-Vienne (Limoges) | site proposé : https://www.limoges.cci.fr/le-point-orientation-apprentissage [bloque les robots] | numéro de la fiche : 05 55 45 15 15
15. Cap Métiers Nouvelle-Aquitaine (, portée region) | site proposé : https://www.cap-metiers.fr/ [répond] | numéro de la fiche : 05 57 81 45 65
16. AlloCMonInfo - Cap Métiers Nouvelle-Aquitaine (Limoges, portée region) | site proposé : https://www.cap-metiers.fr/ [répond] | numéro de la fiche : 08 00 94 01 66
17. Espaces Régionaux d'Information de Proximité (ERIP) (, portée region) | site proposé : https://www.nouvelle-aquitaine.fr/les-actions/economie-et-emploi/formation-professionnelle-et-emploi/erip-points-informations-et-conseils [répond]
18. Retravailler Sud-Ouest (, portée region) | site proposé : https://www.retravailler-sudouest.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 56 08 29 58

---

# Lot 58 : structures, francais-langue

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. AF2P Bergerac (Bergerac) | site proposé : https://www.af2p24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 63 14 93
2. Centre Ressources Illettrisme Analphabétisme Nouvelle-Aquitaine (CRIA Nouvelle-Aquitaine) (, portée region) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation [répond]
3. Culture Alpha (Limoges) | pas de site proposé
4. POLARIS Formation (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/polaris-formation/ [répond] | numéro de la fiche : 05 55 34 34 34
5. Centre Social VITAL (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/centre-social-vital/ [répond] | numéro de la fiche : 05 55 37 73 04
6. A.E.C. (Bergerac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/alphabenn/ [erreur 404]
7. ACCJ - Chantiers Jacquaire (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [nom absent]
8. AFORMAC (Bellac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [nom absent]
9. AFP 87 (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [répond]
10. AFPA Limoges (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [nom absent]
11. Association Familiale Protestante Partage (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [nom absent]
12. Association Familles Rurales Bellac et ses environs (Bellac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation?locations=66 [nom absent]
13. AF2P - Ligue 24 (Bergerac) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/app-bergerac/ [répond] | numéro de la fiche : 05 53 63 14 93
14. Bibliothèque francophone multimédia de Limoges - Pages et partage (Limoges) | site proposé : https://bfm.limoges.fr/services/illettrisme-et-fle/pages-et-partage [bloque les robots]
15. Groupe FEL (Limoges) | site proposé : https://www.cri-aquitaine.org/lieux-de-formation/fiche-repertoire/fel-gueret/ [répond]
16. Association Périgord Linguistique et Culturel (Périgueux) | pas de site proposé
17. Croix-Rouge française - Délégation territoriale de la Haute-Vienne (Limoges) | site proposé : https://www.croix-rouge.fr/delegation-territoriale-de-la-haute-vienne [répond] | numéro de la fiche : 05 55 32 08 87

---

# Lot 59 : structures, france-services (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. France Services (, portée national) | site proposé : https://www.france-services.gouv.fr [répond]
2. France Services Mussidan (Mussidan) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 81 05 06
3. France Services La Force (La Force) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 24 00 24
4. France Services Carlux (Carlux) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 59 19 87
5. France Services Mouleydier (Mouleydier) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 23 06 10
6. France Services Château-l'Évêque (Château-l'Évêque) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 46 28 74
7. France Services Boulazac Isle Manoire (Boulazac Isle Manoire) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 53 35 59 53
8. France Services Limoges Val de l'Aurence (Limoges) | site proposé : https://www.france-services.gouv.fr/le-reseau/france-services-de-limoges-val-de-laurence [répond] | numéro de la fiche : 05 55 45 86 38
9. France Services Limoges Nord Beaubreuil (Limoges) | site proposé : https://www.france-services.gouv.fr [répond]
10. France Services Aixe-sur-Vienne (Aixe-sur-Vienne) | site proposé : https://www.france-services.gouv.fr [répond]
11. France Services Ambazac (Ambazac) | site proposé : https://www.france-services.gouv.fr [répond]
12. France Services Bellac (Bellac) | site proposé : https://www.france-services.gouv.fr [répond]
13. France Services Bergerac (Bergerac) | site proposé : https://www.france-services.gouv.fr [répond]
14. France Services Brantôme en Périgord (Brantôme en Périgord) | site proposé : https://www.france-services.gouv.fr [répond]
15. France Services Coulounieix-Chamiers (Coulounieix-Chamiers) | site proposé : https://www.france-services.gouv.fr [répond]

---

# Lot 60 : structures, france-services (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. France Services Eymet (Eymet) | site proposé : https://www.france-services.gouv.fr [répond]
2. France Services Lalinde (Lalinde) | site proposé : https://www.france-services.gouv.fr [répond]
3. France Services Le Bugue (Le Bugue) | site proposé : https://www.france-services.gouv.fr [répond]
4. France Services Monpazier (Monpazier) | site proposé : https://www.france-services.gouv.fr [répond]
5. France Services Montignac (Montignac-Lascaux) | site proposé : https://www.france-services.gouv.fr [répond]
6. France Services Périgueux (Périgueux) | site proposé : https://www.france-services.gouv.fr [répond]
7. France Services Châlus (Châlus) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 55 78 43 93
8. France Services Châteauponsac (Châteauponsac) | site proposé : https://www.france-services.gouv.fr [répond]
9. France Services Eymoutiers (Eymoutiers) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 44 22 53 36
10. France Services Javerdat (Javerdat) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 55 03 21 69
11. France Services Le Dorat (Le Dorat) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 55 60 90 53
12. France Services Nexon (Nexon) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 55 58 11 05
13. France Services Rochechouart (Rochechouart) | site proposé : https://www.france-services.gouv.fr [répond] | numéro de la fiche : 05 87 03 11 50
14. Réseau France Services de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.gouv.fr/Demarches/France-services/France-services [répond]

---

# Lot 61 : structures, france-travail

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. France Travail Haute-Vienne (Limoges) | site proposé : https://www.francetravail.fr [répond] | numéro de la fiche : 09 72 72 39 49
2. France Travail Haute-Vienne - accompagnement justice (Limoges) | site proposé : https://www.francetravail.fr [répond]

---

# Lot 62 : structures, handicap

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Maison départementale des personnes handicapées de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr/nos-actions/personnes-en-situation-de-handicap/la-mdph [répond] | numéro de la fiche : 05 55 14 14 50
2. Association Valentin Haüy - Comité de Limoges (Limoges, portée national) | site proposé : https://www.avh.asso.fr [répond]
3. Unapei Limousin (Limoges, portée region) | site proposé : https://www.unapei.org [répond]
4. AFM-Téléthon Nouvelle-Aquitaine (, portée region) | site proposé : https://www.afm-telethon.fr [répond]
5. France Parkinson - Comité Nouvelle-Aquitaine (, portée region) | site proposé : https://www.franceparkinson.fr [répond]
6. Fédération APAJH Nouvelle-Aquitaine (, portée region) | site proposé : https://www.apajh.org [répond]
7. APEI Périgueux (Boulazac Isle Manoire) | pas de site proposé | numéro de la fiche : 05 53 08 20 87
8. Les Papillons Blancs de Bergerac (Bergerac) | site proposé : https://www.papillonsblancsbergerac.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 74 49 49
9. FNATH Groupement Sud-Ouest - Permanence de Périgueux (Périgueux) | site proposé : https://www.fnath.org [répond] | numéro de la fiche : 05 53 45 44 50
10. Autisme 87 (Limoges) | site proposé : https://www.autisme87.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 05 07 68
11. APSAH (Aixe-sur-Vienne) | site proposé : https://www.apsah.asso.fr [répond] | numéro de la fiche : 05 55 70 23 84
12. ARES Limousin (Limoges) | site proposé : https://www.ares-limousin.com [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 01 42 56
13. Maison des Sourds de la Haute-Vienne (Limoges) | site proposé : https://www.mshv.fr [ne répond pas (ECONNRESET)] | numéro de la fiche : 05 55 32 59 80
14. FNATH (, portée national) | site proposé : https://www.fnath.org [répond]
15. Unafam (, portée national) | site proposé : https://www.unafam.org [répond]
16. Association Valentin Haüy (, portée national) | site proposé : https://www.avh.asso.fr [répond]
17. AFM-Téléthon (, portée national) | site proposé : https://www.afm-telethon.fr [répond]
18. Fédération APAJH (, portée national) | site proposé : https://www.apajh.org [répond]
19. Entreprises adaptées et ESAT de la Haute-Vienne (Limoges) | site proposé : https://annuaire.action-sociale.org [répond]

---

# Lot 63 : structures, inclusion-numerique

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Réseau des conseillers numériques France Services de la Haute-Vienne (Limoges) | site proposé : https://www.conseiller-numerique.gouv.fr [répond]
2. Part'ÂGE, espace de vie sociale (quartier Campréal) (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 57 28 57
3. CIDFF de la Dordogne, accompagnements numériques () | pas de site proposé | numéro de la fiche : 05 53 35 90 90

---

# Lot 64 : structures, justice-insertion

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Maison de la Justice et du Droit de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
2. Maison du Droit de Saint-Junien (Saint-Junien) | site proposé : https://cdad-hautevienne.justice.fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
3. Service d'accueil unique du justiciable (SAUJ) du tribunal judiciaire de Limoges (Limoges) | site proposé : https://cdad-hautevienne.justice.fr/acteurs-du-droit/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | numéro de la fiche : 05 87 19 34 00
4. Ordre des avocats du Barreau de Limoges (Limoges) | site proposé : https://www.avocats-limoges.org [répond]
5. Barreau de Limoges (Limoges) | site proposé : https://www.avocats-limoges.org [répond]
6. Conseil national des barreaux (, portée national) | site proposé : https://www.cnb.avocat.fr [répond]
7. Fédération nationale des CIDFF (, portée national) | site proposé : https://fncidff.info [répond]
8. Maison de la Justice et du Droit de Périgueux (Périgueux) | site proposé : https://www.justice.fr [répond]
9. Service d'accueil unique du justiciable du tribunal judiciaire de Périgueux (Périgueux) | site proposé : https://www.justice.fr [nom absent]
10. Service d'accueil unique du justiciable du tribunal judiciaire de Bergerac (Bergerac) | site proposé : https://www.justice.fr [nom absent]
11. Association d'aide aux victimes AVIMED France Victimes 87 (Limoges) | site proposé : https://france-victimes.fr [répond]
12. Bureau d'aide juridictionnelle du tribunal judiciaire de Limoges (Limoges) | site proposé : https://www.justice.fr [nom absent]
13. Service d'accueil unique du justiciable du tribunal de proximité de Sarlat-la-Canéda (Sarlat-la-Canéda) | site proposé : https://www.justice.fr [nom absent]
14. France Victimes (, portée national) | site proposé : https://www.france-victimes.fr [répond]
15. Service pénitentiaire d'insertion et de probation de la Haute-Vienne (Limoges) | pas de site proposé | numéro de la fiche : 05 55 49 11 00
16. Services pénitentiaires d'insertion et de probation (SPIP) (, portée national) | site proposé : https://www.justice.gouv.fr/annuaire/structures-reinsertion-demploi/services-penitentiaires-dinsertion-probation-spip [répond]

---

# Lot 65 : structures, logement-hebergement (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Habitat et Humanisme Limousin (Limoges) | pas de site proposé | numéro de la fiche : 05 55 32 21 98
2. Visale (, portée national) | site proposé : https://www.visale.fr [bloque les robots]
3. Fonds de solidarité pour le logement de la Haute-Vienne (Limoges, portée region) | site proposé : https://www.haute-vienne.fr [répond]
4. Cité Béthanie - CHRS (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 23 74 98
5. La Halte 24 (Périgueux) | pas de site proposé
6. France Terre d'Asile (Bergerac) | pas de site proposé
7. Service d'Accompagnement des Familles en Difficulté (SAFED) (Périgueux) | pas de site proposé
8. Fondation pour le Logement des Défavorisés (, portée region) | site proposé : https://www.fondationpourlelogement.fr [répond]
9. Croix-Rouge française (, portée region) | site proposé : https://www.croix-rouge.fr [répond]
10. Secours Catholique - Caritas France (, portée region) | site proposé : https://www.secours-catholique.org [répond]
11. Association de Soutien de la Dordogne (ASD) - Pôle Logement (Périgueux) | site proposé : https://www.asd24.org/service/les-logements-de-transition-et-l-accompagnement-en-matiere-de-logement [répond]
12. Hestia 87 - ASLL / AVDL (Limoges) | site proposé : https://hestia87.fr/actions/assl-avdl/ [répond] | numéro de la fiche : 05 55 77 93 43
13. Hestia 87 - ALBA (Limoges) | site proposé : https://hestia87.fr/actions/alba/ [répond] | numéro de la fiche : 05 55 79 30 25
14. Association Périgourdine d'Action et de Recherche sur l'Exclusion (APARE) (Périgueux) | site proposé : https://www.apare24.fr [ne répond pas (ENOTFOUND)]

---

# Lot 66 : structures, logement-hebergement (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Halte Vincent (Limoges) | site proposé : https://www.justice.gouv.fr/annuaire/fiche/maison-d-arret-de-limoges [nom absent] | numéro de la fiche : 05 55 57 83 79
2. Accueils de jour de la Haute-Vienne (Limoges) | site proposé : https://www.service-public.fr [nom absent]
3. Habitat Jeunes Limoges (Limoges) | site proposé : https://www.unhaj.org [répond]
4. SIAO Haute-Vienne (Limoges) | site proposé : https://www.siao87.fr [ne répond pas (ENOTFOUND)]
5. Périgord Habitat (Périgueux) | site proposé : https://www.perigordhabitat.fr [répond] | numéro de la fiche : 05 53 02 55 00
6. Limoges Habitat (Limoges) | site proposé : https://www.limoges-habitat.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)] | numéro de la fiche : 05 55 43 45 00
7. ODHAC 87 (Le Palais-sur-Vienne) | site proposé : https://www.odhac87.fr [répond] | numéro de la fiche : 05 55 05 42 00
8. L'Atelier, Service d'accueil et d'orientation (SAO) (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 53 22 79 00
9. L'Atelier, Domiciliation (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 06 46 34 09 89
10. L'Atelier, Service hébergement de Bergerac (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 35 56 99 65
11. L'Atelier, Service hébergement de Sarlat (Sarlat-la-Canéda) | site proposé : https://atelier-asso.fr/ [répond]
12. Action Logement, service d'accompagnement social (, portée national) | site proposé : https://www.actionlogement.fr/le-cil-pass-assistance [répond] | numéro de la fiche : 09 70 800 800
13. Action Logement, prêts pour les salariés (travaux et accession) (, portée national) | site proposé : https://actionlogement.fr/le-pret-travaux-amelioration [répond]
14. France Rénov' (, portée national) | site proposé : https://france-renov.gouv.fr [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)] | numéro de la fiche : 0 808 800 700

---

# Lot 67 : structures, mission-locale

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Mission Locale du Haut Périgord (Thiviers) | site proposé : https://missionlocalehautperigord.fr [répond] | numéro de la fiche : 05 53 52 59 91
2. Union nationale des Missions Locales (, portée national) | site proposé : https://www.unml.info [répond]
3. Mission Locale Limoges Métropole (Limoges) | site proposé : https://www.ml-limoges.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 10 01 00
4. Mission Locale Rurale Haute-Vienne (Aixe-sur-Vienne) | site proposé : https://www.missionlocalerurale87.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 70 45 74
5. Mission Locale Ribéracois Vallée de l'Isle (Ribérac) | site proposé : https://www.missionlocale-riberacois.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 92 40 75
6. Mission Locale de Saint-Astier (Saint-Astier) | site proposé : https://www.missionlocale-riberacois.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 02 42 96
7. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Paul Gauguin (Limoges) | site proposé : https://mission-locale-limoges.fr [répond] | numéro de la fiche : 05 55 37 06 65
8. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Marcel Vardelle (Limoges) | site proposé : https://mission-locale-limoges.fr [répond] | numéro de la fiche : 05 55 49 14 00
9. Mission Locale de l'Agglomération de Limoges Métropole - Antenne Fabre-d'Églantine (Limoges) | site proposé : https://mission-locale-limoges.fr [répond] | numéro de la fiche : 05 55 10 01 00
10. Association Régionale des Missions Locales Nouvelle-Aquitaine (, portée region) | site proposé : https://www.arml-na.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]

---

# Lot 68 : structures, mobilite-solidaire

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Mon Garage Solidaire (Coly-Saint-Amand) | pas de site proposé | numéro de la fiche : 06 76 78 05 60
2. ASPAT (Bergerac) | site proposé : https://www.aspat24.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 53 57 43 22
3. MSoR - Mobilité Solidaire Rurale (Bellac) | pas de site proposé | numéro de la fiche : 06 33 65 17 47
4. Wimoov Nouvelle-Aquitaine (, portée region) | site proposé : https://www.wimoov.org [répond]
5. Mob'In Nouvelle-Aquitaine (, portée region) | site proposé : https://mobin-solutions.fr [répond]
6. Fédération Châtaigneraie Limousine (Saint-Junien) | site proposé : https://www.federation-chataigneraie.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 02 20 79
7. Rempart (Limoges) | site proposé : https://www.association-rempart.com [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 33 46 53
8. ALEAS (Limoges) | site proposé : https://www.aleas87.fr [ne répond pas (ENOTFOUND)] | numéro de la fiche : 05 55 10 01 20
9. Mob'In France (, portée national) | site proposé : https://mobin-solutions.fr [répond]

---

# Lot 69 : structures, petite-enfance

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Crèches municipales de Limoges (Limoges) | site proposé : https://www.limoges.fr/pratique/petite-enfance [nom absent] | numéro de la fiche : 05 55 45 60 00
2. Micro-crèche La Fée Risette (Compreignac) | pas de site proposé | numéro de la fiche : 05 55 12 88 02
3. Crèche Napoléon Magne (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 53 47 49
4. Crèche des Arènes (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 08 04 29
5. Crèche Halte Garderie Câlins Câlines (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 53 55 79
6. Crèche Clos Chassaing (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 35 86 38
7. Crèche La Maison des Doudous (Bassillac et Auberoche) | pas de site proposé | numéro de la fiche : 05 53 03 45 33
8. Crèche La Maison du Petit Prince (Coulounieix-Chamiers) | pas de site proposé | numéro de la fiche : 05 53 35 74 10
9. Crèche Valentine Bussière (Boulazac Isle Manoire) | pas de site proposé | numéro de la fiche : 05 53 03 53 16
10. Le Xylophone (Boulazac Isle Manoire) | pas de site proposé
11. Crèche Les Souris Vertes (Marsac-sur-l'Isle) | pas de site proposé | numéro de la fiche : 05 53 04 12 12
12. Maison de la Petite Enfance (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 05 53 31 45 64
13. Gambada Crèche La Canéda (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 06 65 65 62 05
14. Maison de l'Enfance (Montignac-Lascaux) | pas de site proposé | numéro de la fiche : 05 53 51 87 06
15. Multi Accueil La Souris Jaune (Le Bugue) | pas de site proposé | numéro de la fiche : 05 53 07 82 14
16. Crèche Pous (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 57 22 95
17. Crèche L'Isle aux Bambins (Mussidan) | pas de site proposé | numéro de la fiche : 05 53 81 23 68
18. Maison Petite Enfance (Saint-Astier) | pas de site proposé | numéro de la fiche : 05 53 54 06 58
19. Micro-Crèche Les Coccinelles (Brantôme en Périgord) | pas de site proposé | numéro de la fiche : 05 53 05 27 83
20. Micro Crèche Les Petitous (Château-l'Évêque) | pas de site proposé | numéro de la fiche : 05 53 03 47 88
21. Micro-Crèche Les Ptits Loups (Nontron) | pas de site proposé | numéro de la fiche : 05 53 56 67 13
22. Micro Crèche Les Lutins d'Edith (Sanilhac) | pas de site proposé | numéro de la fiche : 05 53 04 31 89
23. Protection maternelle et infantile de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr [répond]

---

# Lot 70 : structures, plie

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. PLIE Limoges Métropole (Limoges) | site proposé : https://www.limoges-metropole.fr [répond]

---

# Lot 71 : structures, sante-soins-addictions (1/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Dordogne (Périgueux) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/ [répond] | numéro de la fiche : 09 69 37 00 22
2. Centre hospitalier spécialisé Vauclaire (Montpon-Ménestérol) | pas de site proposé | numéro de la fiche : 05 53 82 82 82
3. Centre Médico-Psychologique de Périgueux (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 45 29 05
4. Centre Médico-Psychologique de Nontron (Nontron) | pas de site proposé | numéro de la fiche : 05 53 05 66 89
5. Centre Médico-Psychologique de Sarlat (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 05 53 31 76 56
6. CMP / CATTP et Hôpital de jour du Centre hospitalier Vauclaire (Brantôme en Périgord) | pas de site proposé | numéro de la fiche : 05 53 82 89 90
7. Centre Médico-Psychologique de Terrasson (Terrasson-Lavilledieu) | pas de site proposé
8. Centre Médico-Psychologique de Montpon-Ménestérol (Montpon-Ménestérol) | pas de site proposé | numéro de la fiche : 05 53 82 00 55
9. Association Addictions France - CSAPA de Périgueux (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 07 66 82
10. Centre d'Addictologie du Sarladais (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 05 53 28 92 34
11. CEID Périgueux (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 46 63 83
12. Maison des Adolescents de la Dordogne (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 61 55 93
13. Pôle d'Hospitalisation Psychiatrique Bergeracois (Bergerac) | pas de site proposé
14. Centre Médico-Psycho-Pédagogique de Périgueux (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 53 38 85
15. Centre Médico-Psycho-Pédagogique de Bergerac (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 57 18 65
16. Centre Médico-Psychologique pour enfants et adolescents de Périgueux (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 82 82 56
17. Centre Médico-Psychologique Enfants et Adolescents de Montpon-Ménestérol (Montpon-Ménestérol) | pas de site proposé | numéro de la fiche : 05 53 80 39 43
18. Centre Médico-Psychologique Enfants et Adolescents de Beaumontois-en-Périgord (Beaumontois-en-Périgord) | pas de site proposé | numéro de la fiche : 05 53 22 85 76
19. Centre Médico-Psychologique Enfants et Adolescents de Ribérac (Ribérac) | pas de site proposé | numéro de la fiche : 05 53 61 55 94

---

# Lot 72 : structures, sante-soins-addictions (2/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Consultation Médico-Psychologique pour Enfants et Adolescents de Nontron (Nontron) | pas de site proposé | numéro de la fiche : 05 53 56 23 25
2. Centre départemental de santé - site d'Excideuil (Excideuil) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante [répond] | numéro de la fiche : 05 53 02 06 00
3. Centre départemental de santé - site de Ribérac (Ribérac) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante [répond] | numéro de la fiche : 05 53 02 07 20
4. Centre départemental de santé - site de Saint-Médard-de-Mussidan (Saint-Médard-de-Mussidan) | site proposé : https://www.dordogne.fr/relever-les-defis-du-21e-siecle/lavenir-en-grand/centre-departemental-de-sante [répond] | numéro de la fiche : 05 53 02 06 20
5. CEID Addictions Dordogne - antenne de Bergerac (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 74 20 49
6. Centre hospitalier Vauclaire - Unité d'addictologie Escales (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 05 66 80
7. Hôpital de jour Addictologie L'Envol (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 61 55 99
8. Centre Médico-Psychologique pour Adultes de Bergerac (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 27 42 46
9. Agence régionale de santé Nouvelle-Aquitaine - Délégation départementale de la Haute-Vienne (Limoges) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/ [répond]
10. Centre Hospitalier Esquirol (Limoges) | site proposé : https://www.ch-esquirol-limoges.fr/notre-etablissement/presentation-generale/presentation/ [répond] | numéro de la fiche : 05 55 43 10 10
11. Centre Médico Psychologique Van Gogh (Limoges) | pas de site proposé | numéro de la fiche : 05 55 43 13 33
12. Centre Médico Psychologique Sainte Claire (Limoges) | pas de site proposé | numéro de la fiche : 05 55 43 13 33
13. Centre Médico Psychologique du Val de Vienne (Saint-Junien) | pas de site proposé | numéro de la fiche : 05 55 43 11 20
14. Centre Médico Psychologique du Bassin Arédien (Saint-Yrieix-la-Perche) | pas de site proposé | numéro de la fiche : 05 55 43 11 20
15. Centre de Proximité en Santé Mentale du Haut Limousin (Magnac-Laval) | pas de site proposé | numéro de la fiche : 05 55 43 11 20
16. Centre Médico Psychologique Monts et Barrages (Saint-Léonard-de-Noblat) | pas de site proposé | numéro de la fiche : 05 87 50 90 94
17. Centre Médico Psycho Pédagogique de Limoges (Limoges) | pas de site proposé | numéro de la fiche : 05 55 77 32 39
18. Centre Médico Psycho Pédagogique de Saint-Junien (Saint-Junien) | pas de site proposé | numéro de la fiche : 05 55 02 27 40
19. Équipe Mobile Psychiatrie Précarité (Limoges) | pas de site proposé | numéro de la fiche : 05 55 43 12 07

---

# Lot 73 : structures, sante-soins-addictions (3/3)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Association Addictions France Haute-Vienne (Limoges) | pas de site proposé | numéro de la fiche : 05 55 34 46 00
2. CSAPA Bobillot (Limoges) | pas de site proposé | numéro de la fiche : 05 55 34 43 77
3. Maison des Adolescents de la Haute-Vienne (Limoges) | pas de site proposé | numéro de la fiche : 05 55 12 76 00
4. Agence régionale de santé Nouvelle-Aquitaine (, portée region) | site proposé : https://www.nouvelle-aquitaine.ars.sante.fr/ [répond]
5. Association Addictions France (, portée national) | site proposé : https://addictions-france.org [répond]
6. Psycom (, portée national) | site proposé : https://www.psycom.org [répond]
7. Alcooliques Anonymes France (, portée national) | site proposé : https://alcooliques-anonymes.fr [répond] | numéro de la fiche : 09 69 39 40 20
8. L'Atelier, Bar sans alcool et médiation santé (Bergerac) | site proposé : https://atelier-asso.fr/ [répond]
9. Équipe mobile psychiatrie précarité du Bergeracois (centre hospitalier de Vauclaire) (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 27 71 41
10. Groupe d'entraide mutuelle (GEM) de Bergerac, association Croix Marine (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 22 55 24
11. Groupe d'entraide mutuelle (GEM) d'Excideuil, association Croix Marine (Excideuil) | pas de site proposé | numéro de la fiche : 09 52 86 72 23
12. Groupe d'entraide mutuelle (GEM) de Montpon-Ménestérol, association Croix Marine (Montpon-Ménestérol) | pas de site proposé | numéro de la fiche : 09 53 19 43 99
13. Groupe d'entraide mutuelle (GEM) de Neuvic, association Croix Marine (Neuvic) | pas de site proposé | numéro de la fiche : 09 50 47 79 63
14. Groupe d'entraide mutuelle (GEM) de Nontron, association Croix Marine (Nontron) | pas de site proposé | numéro de la fiche : 09 84 07 29 25
15. Groupe d'entraide mutuelle (GEM) de Périgueux, association Croix Marine (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 08 56 29
16. Groupe d'entraide mutuelle (GEM) de Sarlat-la-Canéda, association Croix Marine (Sarlat-la-Canéda) | pas de site proposé | numéro de la fiche : 09 50 25 30 99
17. Groupe d'entraide mutuelle (GEM) de Terrasson-Lavilledieu, association Croix Marine (Terrasson-Lavilledieu) | pas de site proposé | numéro de la fiche : 09 53 99 82 61
18. Association d'aide à la santé mentale Croix Marine Dordogne () | site proposé : https://www.croixmarine24.fr/ [répond] | numéro de la fiche : 05 53 35 64 20

---

# Lot 74 : structures, service-social-secteur

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Service social départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr [répond]
2. Service insertion du Conseil départemental de la Haute-Vienne (Limoges) | site proposé : https://www.haute-vienne.fr [répond]
3. CLAP Sud-Ouest (, portée region) | site proposé : https://clap-so.org/les-secteurs/cri-aquitaine/ [répond]
4. Fédération Départementale des Centres Sociaux du Périgord (Marsac-sur-l'Isle) | pas de site proposé | numéro de la fiche : 07 89 34 00 03
5. Centre Social Jean Moulin (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 22 23 40
6. Centre Social Germaine Tillion (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 57 92 78
7. Centre Social La Brunetière (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 63 15 57
8. Centre Social Saint-Exupéry (Coulounieix-Chamiers) | pas de site proposé | numéro de la fiche : 05 53 45 60 30
9. Centre Social et Culturel L'Arche (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 09 50 43
10. Fédération des Centres Sociaux de la Haute-Vienne (Limoges) | site proposé : https://www.centres-sociaux.fr [répond]
11. Centre Social Aristide Briand - ALIS (Limoges) | pas de site proposé | numéro de la fiche : 05 55 10 95 36
12. Centre Social Entre Deux - ALIS (Limoges) | pas de site proposé | numéro de la fiche : 05 87 75 80 64
13. Centre Social Alchimis (Limoges) | pas de site proposé | numéro de la fiche : 05 55 57 38 24
14. Centre Social Municipal de Beaubreuil (Limoges) | pas de site proposé | numéro de la fiche : 05 55 45 64 84
15. Centre Social Municipal La Parenthèse de la Glane (Saint-Junien) | pas de site proposé | numéro de la fiche : 07 61 64 42 75
16. Centre médico-social de Sigoulès (canton sud bergeracois) (Sigoulès-et-Flaugeac) | pas de site proposé | numéro de la fiche : 05 53 02 06 13

---

# Lot 75 : structures, siae

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. BASE (Bergerac Actions Solidarité Emploi) () | site proposé : https://associationbase.fr/ [répond] | numéro de la fiche : 05 53 58 88 69

---

# Lot 76 : structures, soutien-aux-familles

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Pour chaque structure de la liste (service public, association, organisme), (1) confirme ou remplace son SITE OFFICIEL ou la page officielle qui la présente (l'état du site proposé est indiqué), (2) relève le NUMÉRO DE TÉLÉPHONE PUBLIC tel qu'il est AFFICHÉ sur cette page officielle, copié exactement, avec l'adresse de la page où il figure et la phrase qui l'entoure, (3) établis sa présence en Dordogne 24 et en Haute-Vienne 87 (la fiche indique le territoire attendu). Si le numéro ne figure sur aucune page officielle, écris « pas de numéro vu » : ne le cherche jamais ailleurs, ne le devine jamais.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Structure | Site ou page officielle | Numéro affiché (copié exactement) | Page où figure le numéro | Phrase lue autour du numéro | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. ASFEL (Limoges) | site proposé : https://www.asfel.fr [répond] | numéro de la fiche : 05 19 29 00 50
2. La Maison des Aidants (Bergerac) | pas de site proposé | numéro de la fiche : 05 53 24 97 27
3. Union Départementale des Associations Familiales de la Dordogne (Périgueux) | pas de site proposé | numéro de la fiche : 05 53 06 41 00
4. Plateforme de soutien aux aidants Evaasion (Limoges) | pas de site proposé | numéro de la fiche : 05 19 99 99 99
5. Plateforme d'accompagnement et de répit des aidants Le Castel (Limoges) | pas de site proposé | numéro de la fiche : 05 55 33 99 00
6. Union Départementale des Associations Familiales de la Haute-Vienne (Limoges) | site proposé : https://www.udaf87.fr [répond] | numéro de la fiche : 05 55 10 31 00
7. Planning Familial Nouvelle-Aquitaine (, portée region) | site proposé : https://planning-familial-na.org [répond]
8. Le Planning Familial 24 - Dordogne / Périgueux (Périgueux) | site proposé : https://planning-familial-na.org/antenne-departementale/dordogne-24-perigueux/ [erreur 404] | numéro de la fiche : 06 71 77 37 02
9. Le Planning Familial 24 - Dordogne / Bergerac (Bergerac) | site proposé : https://planning-familial-na.org/antenne-departementale/dordogne-24-bergerac/ [erreur 404]
10. Le Planning Familial 87 - Haute-Vienne / Limoges (Limoges) | site proposé : https://planning-familial-na.org/antenne-departementale/haute-vienne-87-limoges/ [répond] | numéro de la fiche : 06 44 96 43 86
11. Le Planning Familial 87 - Haute-Vienne / Saint-Yrieix-la-Perche (Saint-Yrieix-la-Perche) | site proposé : https://planning-familial-na.org/antenne-departementale/haute-vienne-87-saint-yrieix-la-perche/ [répond] | numéro de la fiche : 06 41 95 02 60
12. Consultation de planification des Carmes (Limoges) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification [répond]
13. Centre de planification familiale de Saint-Junien (Saint-Junien) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification [répond]
14. Centre de planification de Saint-Yrieix (Saint-Yrieix-la-Perche) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification [répond]
15. Espace CHOISIR (Limoges) | site proposé : https://www.haute-vienne.fr/tous-les-annuaires/tous-les-centres-de-planification [nom absent]
16. L'Atelier, Club de prévention spécialisée (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 53 22 78 50
17. L'Atelier, Espace rencontre parents-enfants (Bergerac) | site proposé : https://atelier-asso.fr/ [répond] | numéro de la fiche : 05 53 57 78 26
18. Maison des adolescents de la Dordogne (MDA 24, gérée par l'Atelier) (Bergerac) | site proposé : https://atelier-asso.fr/ [répond]

# PARTIE 2 : « Se tenir informé » (Comprendre le cadre, Comprendre les chiffres, Lexique)

Ces messages sont **exactement ceux de l'onglet « Travailler avec Claude »** de l'outil de veille (état du 01/11/2026), préparés pour une session cloud : une ouverture (méthode curl, aucun blocage contourné) avant le message, deux sections après (« CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » puis « À OUVRIR PAR MOI »). Les blocs demandés (`[CONTROLE]`, `[CHIFFRES]`, `[LEXIQUE-BRUT]`, `[SITES-NON-OUVERTS]`…) sont conservés tels quels : ils sont lus par l'outil et par moi.

**Ce qui change par rapport à l'outil :**
- Les **17 rayons** sont tous là, pas seulement ceux que l'outil juge « dus » ce mois-ci (5). Si vous voulez ménager votre crédit, commencez par les cinq mensuels : Venir de l'étranger, Budget, Questions juridiques, Moins de 26 ans, Emploi et contrats.
- Le territoire : un seul message pour les **deux départements** quand tout le reste du texte est identique (rayons, réseau, message 7 des changements). Les chiffres clés et le portrait ont **un message par département**, car leurs chiffres diffèrent.
- Pour les fiches du cadre et du Lexique, la question « présence sur le territoire » ne se pose pas (ce sont des règles et des mots nationaux). Pour les chiffres, chaque message nomme son département.

**Ordre conseillé :** les chiffres clés (2 lots), puis les rayons mensuels, puis le reste. Les réponses reviennent dans un document ; je les lis avec la même méthode que l'outil (aucune fiche ne change sans preuve, rien n'est public avant votre « C'est bon »).

## Sommaire de la partie 2

| Lot | Rubrique | Message | Taille |
|---|---|---|---|
| S1 | Comprendre le cadre | La veille de la semaine (fiches de tous les rayons) | 5 Ko |
| S2 | Comprendre le cadre | Ce qui a changé, message 1 sur 7 | 8 Ko |
| S3 | Comprendre le cadre | Ce qui a changé, message 2 sur 7 | 8 Ko |
| S4 | Comprendre le cadre | Ce qui a changé, message 3 sur 7 | 8 Ko |
| S5 | Comprendre le cadre | Ce qui a changé, message 4 sur 7 | 8 Ko |
| S6 | Comprendre le cadre | Ce qui a changé, message 5 sur 7 | 8 Ko |
| S7 | Comprendre le cadre | Ce qui a changé, message 6 sur 7 | 8 Ko |
| S8 | Comprendre le cadre | Ce qui a changé, message 7 sur 7 (région et départements 24 et 87) | 8 Ko |
| S9 | Comprendre le cadre | Contrôler le rayon « Venir de l'étranger » (fiche par fiche) | 19 Ko |
| S10 | Comprendre le cadre | Contrôler le rayon « Budget, dettes, droits sociaux » (fiche par fiche) | 21 Ko |
| S11 | Comprendre le cadre | Contrôler le rayon « Questions juridiques » (fiche par fiche) | 15 Ko |
| S12 | Comprendre le cadre | Contrôler le rayon « Mobilité » (fiche par fiche) | 16 Ko |
| S13 | Comprendre le cadre | Contrôler le rayon « Moins de 26 ans » (fiche par fiche) | 16 Ko |
| S14 | Comprendre le cadre | Contrôler le rayon « Handicap et emploi » (fiche par fiche) | 20 Ko |
| S15 | Comprendre le cadre | Contrôler le rayon « Se former et se reconvertir » (fiche par fiche) | 19 Ko |
| S16 | Comprendre le cadre | Contrôler le rayon « Créer son activité » (fiche par fiche) | 18 Ko |
| S17 | Comprendre le cadre | Contrôler le rayon « Employeurs et entrepreneurs » (fiche par fiche) | 24 Ko |
| S18 | Comprendre le cadre | Contrôler le rayon « Accompagnement et structures de l'insertion » (fiche par fiche) | 17 Ko |
| S19 | Comprendre le cadre | Contrôler le rayon « Justice : sortie de détention » (fiche par fiche) | 15 Ko |
| S20 | Comprendre le cadre | Contrôler le rayon « Garde d'enfant » (fiche par fiche) | 14 Ko |
| S21 | Comprendre le cadre | Contrôler le rayon « Apprendre le français » (fiche par fiche) | 15 Ko |
| S22 | Comprendre le cadre | Contrôler le rayon « Travailler après 50 ans et retraite » (fiche par fiche) | 13 Ko |
| S23 | Comprendre le cadre | Contrôler le rayon « Accès aux soins » (fiche par fiche) | 7 Ko |
| S24 | Comprendre le cadre | Contrôler le rayon « Emploi et contrats » (fiche par fiche) | 31 Ko |
| S25 | Comprendre le cadre | Contrôler le rayon « Logement » (fiche par fiche) | 19 Ko |
| S26 | Comprendre le cadre | Ce qui circule dans le réseau (à confronter) | 6 Ko |
| S27 | Comprendre les chiffres | Les 5 chiffres clés et la lecture du territoire : Dordogne (24) | 13 Ko |
| S28 | Comprendre les chiffres | Les 5 chiffres clés et la lecture du territoire : Haute-Vienne (87) | 13 Ko |
| S29 | Comprendre les chiffres | Le portrait annuel du territoire : Dordogne (24) | 10 Ko |
| S30 | Comprendre les chiffres | Le portrait annuel du territoire : Haute-Vienne (87) | 10 Ko |
| S31 | Comprendre les chiffres | La France dans l'Union européenne | 6 Ko |
| S32 | Comprendre les chiffres | Le profil des découpes (âge, diplôme, départements, régions) | 3 Ko |
| S33 | Comprendre les chiffres | L'accès aux médecins, dentistes et pharmaciens | 6 Ko |
| S34 | Lexique | Les mots du lexique : termes nouveaux ou changés de sens | 25 Ko |
| S35 | Lexique | Les chiffres à jour des 6 fiches qui ont un bloc de chiffres | 6 Ko |

---

# Lot S1 : Comprendre le cadre, la veille de la semaine (fiches de tous les rayons)

*Chaque semaine dans l'outil. À lancer une fois.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Vous constituez une veille rapide, hebdomadaire, pour un conseiller en insertion professionnelle. Cherchez UNIQUEMENT ce qui a été publié ou annoncé au cours des 7 DERNIERS JOURS, soit du 26/10/2026 au 01/11/2026 inclus, sur Légifrance (JORF, décrets et arrêtés récents) et service-public.fr (actualités récentes) ; si besoin, le site du ministère du Travail ou de la Sécurité sociale.

Deux pages à ouvrir en premier (adresses à recopier telles quelles) : la liste des numéros récents du Journal officiel, https://www.legifrance.gouv.fr/jorf/jo (ouvre les numéros du 26/10/2026 au 01/11/2026 inclus), et les actualités du service public, https://www.service-public.gouv.fr/particuliers/actualites. N'invente aucune autre adresse de Légifrance.

Concentrez-vous sur les dispositifs qui bougent vite en ce moment : minima sociaux (RSA, AAH, prime d'activité et leurs cumuls), aides à l'emploi et à la formation (CPF, aides à l'embauche, France Travail), indemnisation chômage, et plus largement tout dispositif d'insertion professionnelle. Exemple du genre de changement qui compte ici : un dispositif devenu incompatible avec un autre, un montant révisé, une condition d'accès modifiée par un décret récent.

Ne faites PAS de recherche large ni de revérification des fiches existantes une par une : ce n'est pas l'objet ici, c'est le rôle du contrôle mensuel séparé. Seulement ce qui est nouveau ou modifié cette semaine précise.

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

Pour chaque changement trouvé, donnez : le sujet en une phrase, ce qui change précisément, la date d'effet si connue (sinon « à vérifier »), le rayon concerné (un de ces mots : etranger, mobilite, jeunes, handicap, emploi, former, creer, employeurs, accompagnement, justice, budget, logement, garde, francais, juridique, seniors, sante), et la source (nom du site + adresse).
Si rien de notable n'a été publié cette semaine, écrivez une seule ligne « signal: Rien à signaler cette semaine » : seulement si vous avez réellement ouvert les pages d'actualités de Légifrance ET de service-public.fr. Sinon écrivez « signal: Non vérifié » et dites dans le bloc des sites non ouverts ce que vous n'avez pas pu lire.

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Si tu n'as ouvert aucune page qui décrit le changement, ne l'écris pas. L'outil ouvrira les pages citées pour y retrouver ces passages.

Termine par un bloc entre [VEILLE-HEBDO] et [/VEILLE-HEBDO], une entrée par changement, séparées par une ligne vide, six lignes « champ: valeur » dans cet ordre :
signal: le sujet, en une phrase
rayon: le mot du rayon concerné
ce_qui_change: ce qui change précisément
date_effet: la date d'effet, ou « à vérifier »
source: le nom du site et son adresse
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot

[VEILLE-HEBDO]
signal: ...
rayon: ...
ce_qui_change: ...
date_effet: ...
source: ...
preuve: ...

(une entrée par changement)
[/VEILLE-HEBDO]

Ensuite, les sites que vous n'avez pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S2 : Comprendre le cadre, ce qui a changé, message 1 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (1 sur 7, Emploi, contrats de travail, retraite) couvre SEULEMENT ces domaines :
- Emploi et contrats de travail
- Retraite et fin de carrière (retraite progressive, cumul emploi-retraite, départ et mise à la retraite, mesures des lois de financement de la Sécurité sociale)
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- travail-emploi.gouv.fr : chaque numéro de la lettre hebdomadaire de la période, les actualités et la rubrique des textes réglementaires du ministère du Travail
- service-public.gouv.fr : les actualités, et l'article « Ce qui change » de chaque mois de la période (par exemple « Ce qui change en juillet »)
- legifrance.gouv.fr : les lois, décrets et arrêtés du Journal officiel publiés pendant la période (travail, sécurité sociale, retraites)
- vie-publique.fr : le suivi des réformes et des textes de loi
- lassuranceretraite.fr, info-retraite.fr, securite-sociale.fr et urssaf.fr : les actualités sur les retraites, le cumul emploi-retraite, la retraite progressive, et les mesures des lois de financement de la Sécurité sociale
- la presse spécialisée emploi et protection sociale, pour repérer ce que les pages officielles n'affichent pas encore

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S3 : Comprendre le cadre, ce qui a changé, message 2 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (2 sur 7, Assurance chômage et France Travail) couvre SEULEMENT ces domaines :
- Assurance chômage et France Travail
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- unedic.org : les actualités, les circulaires et les textes d'application de la période
- francetravail.org : l'espace presse, les actualités et la rubrique des textes et instructions ; francetravail.fr pour les nouveautés côté demandeurs d'emploi
- travail-emploi.gouv.fr : la lettre hebdomadaire et les actualités sur l'assurance chômage, l'indemnisation et la loi pour le plein emploi
- service-public.gouv.fr : les actualités et l'article « Ce qui change » de chaque mois de la période
- legifrance.gouv.fr : les décrets et arrêtés du Journal officiel sur l'assurance chômage et le service public de l'emploi
- vie-publique.fr : le suivi des réformes

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S4 : Comprendre le cadre, ce qui a changé, message 3 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (3 sur 7, Formation, CPF, apprentissage, VAE, France compétences) couvre SEULEMENT ces domaines :
- Formation, CPF, apprentissage, VAE, France compétences
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- francecompetences.fr : les actualités, les décisions et délibérations de la période, les niveaux de prise en charge des contrats d'apprentissage, le répertoire national des certifications
- moncompteformation.gouv.fr : les actualités du CPF (éligibilité, participation financière, plafonds)
- travail-emploi.gouv.fr : la formation professionnelle, l'apprentissage, la lettre hebdomadaire
- vae.gouv.fr et alternance.emploi.gouv.fr : les nouveautés sur la validation des acquis de l'expérience et l'alternance
- centre-inffo.fr et intercariforef.org : la veille de la formation professionnelle et les actualités des CARIF-OREF
- legifrance.gouv.fr : les décrets et arrêtés du Journal officiel sur la formation, l'apprentissage et la qualité des organismes de formation
- vie-publique.fr : le suivi des réformes

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S5 : Comprendre le cadre, ce qui a changé, message 4 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (4 sur 7, Insertion par l'activité économique, contrats aidés et handicap) couvre SEULEMENT ces domaines :
- Insertion par l'activité économique et contrats aidés
- Handicap et emploi (RQTH, AGEFIPH, Cap emploi)
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- la plateforme de l'inclusion et le site du Conseil national de l'inclusion dans l'emploi : actualités sur les structures d'insertion par l'activité économique, les contrats aidés et les parcours d'insertion
- travail-emploi.gouv.fr : les actualités et textes sur l'insertion par l'activité économique, les parcours emploi compétences et les contrats aidés
- agefiph.fr, fiphfp.fr et handicap.gouv.fr : les actualités sur l'emploi des personnes en situation de handicap, l'obligation d'emploi et les aides
- cheops.org (Cap emploi) et les sites des MDPH : les nouveautés de fonctionnement
- service-public.gouv.fr : les actualités et l'article « Ce qui change » de chaque mois de la période
- legifrance.gouv.fr : les décrets et arrêtés du Journal officiel sur l'insertion, les contrats aidés et le handicap

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S6 : Comprendre le cadre, ce qui a changé, message 5 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (5 sur 7, RSA, prime d'activité, AAH, jeunes et mobilité) couvre SEULEMENT ces domaines :
- RSA, prime d'activité, AAH et leurs cumuls
- Accompagnement des jeunes (contrat d'engagement, Mission Locale)
- Mobilité et aides associées
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- caf.fr, msa.fr et mesdroitssociaux.gouv.fr : les actualités et les montants en vigueur (RSA, prime d'activité, AAH, aides au logement)
- travail-emploi.gouv.fr et solidarites.gouv.fr : les actualités sur le RSA, l'accompagnement renforcé et la loi pour le plein emploi
- service-public.gouv.fr : les actualités et l'article « Ce qui change » de chaque mois de la période
- 1jeune1solution.gouv.fr et unml.info : le contrat d'engagement jeune, les missions locales, les aides aux jeunes
- francetravail.org et wimoov.org : les aides à la mobilité (permis, transport, aides au retour à l'emploi)
- legifrance.gouv.fr : les décrets et arrêtés du Journal officiel sur les prestations sociales, les jeunes et la mobilité

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S7 : Comprendre le cadre, ce qui a changé, message 6 sur 7

*Changements officiels de la période (octobre 2026).*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (6 sur 7, Séjour et droit au travail des personnes étrangères) couvre SEULEMENT ces domaines :
- Séjour et droit au travail des personnes étrangères
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- immigration.interieur.gouv.fr et administration-etrangers-en-france.interieur.gouv.fr : les actualités, les circulaires et les nouveautés de démarches
- service-public.gouv.fr : les actualités et l'article « Ce qui change » de chaque mois de la période
- ofii.fr : les nouveautés sur le contrat d'intégration républicaine et l'accueil
- travail-emploi.gouv.fr : l'autorisation de travail des étrangers
- legifrance.gouv.fr : les lois, décrets et arrêtés du Journal officiel sur le séjour et le droit au travail des étrangers
- vie-publique.fr : le suivi des réformes

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S8 : Comprendre le cadre, ce qui a changé, message 7 sur 7 (région et départements 24 et 87)

*Les deux départements dans le même message.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue la veille réglementaire d'un outil pédagogique utilisé par des professionnels de l'insertion (conseillers en insertion professionnelle). Ce que tu écris sera relu puis vérifié page par page par une personne avant toute publication : l'exactitude et les sources comptent plus que le nombre de lignes. Ton rôle : repérer et résumer les changements officiels de la période « octobre 2026 » (du 01/10/2026 au 31/10/2026 inclus) : publications ET entrées en vigueur entre ces deux dates, pas refaire l'histoire d'un dispositif. Les dates de cette période sont exactes : travaille avec elles, ne demande pas de précision sur la période.

Ce message (7 sur 7, Région et département) couvre SEULEMENT ces domaines :
- Propre à la région Nouvelle-Aquitaine ou aux départements de la Dordogne (24) et de la Haute-Vienne (87)
- Annoncé, pas encore en vigueur (seulement ce qui concerne les domaines ci-dessus)

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Si la période n'est pas encore terminée à la date d'aujourd'hui, ne couvre que les jours déjà écoulés et dis-le en une ligne au début.

COMMENT TRAVAILLER
1. Fais un balayage complet et approfondi, domaine par domaine. Pour chaque domaine, ouvre CHAQUE source de la liste « Où chercher » ci-dessous (sa page d'actualités ou de textes, aux dates de la période), puis fais des recherches ciblées (par exemple « décret » ou « arrêté » + le sujet + le mois) pour retrouver ce que les pages d'actualités n'affichent pas. Une période de cette durée contient presque toujours plusieurs changements par domaine : si tu n'en trouves aucun, c'est le signe qu'il faut chercher plus loin, pas qu'il faut conclure.
2. Ne retiens un changement que si tu as ouvert une page qui le décrit. Rien de rappelé de mémoire, rien de déduit. Une déclaration, un discours ou un communiqué n'est pas un changement : ne le retiens que s'il annonce une mesure datée, et place-le alors dans « Annoncé, pas encore en vigueur ».
3. Sois exhaustif sur ce qui touche les personnes en recherche d'emploi, les salariés, les employeurs et les professionnels de l'accompagnement (montants, plafonds, conditions, dates, démarches, textes). Une entrée par texte ou par mesure : ne regroupe jamais plusieurs changements distincts dans une seule ligne.
4. Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un domaine, termine par les trois blocs de ce que tu as traité, puis par la ligne « SUITE DISPONIBLE : il reste [domaines restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras au domaine suivant, sans répéter ce qui est déjà donné. Ne saute jamais un domaine en silence et ne raccourcis jamais la liste pour la faire tenir.
5. Dates : une mesure entre dans la période si elle est publiée OU si elle entre en vigueur pendant la période. Une mesure publiée pendant la période mais qui n'entre en vigueur qu'après, un projet de loi, une concertation en cours : UNIQUEMENT dans « Annoncé, pas encore en vigueur ». Chaque changement apparaît dans UN SEUL domaine.
6. Territoire : d'abord le niveau national ; ce qui est propre à la région ou au département va dans le domaine « Propre à la région ... » (conseil régional, conseil départemental, préfecture, DREETS ou DDETS). Ne mélange pas les départements.
7. Ne donne ni avis, ni recommandation, ni classement. Tu listes ce qui a changé.

OÙ CHERCHER (ouvre chacune de ces sources ; si l'une est bloquée ou introuvable, note-la dans le bloc des sites non ouverts et appuie-toi sur un relais)
- Cap Métiers Nouvelle-Aquitaine (pro.cap-metiers.fr) : les actualités, la veille et les appels à projets de la période
- le site du conseil régional (Nouvelle-Aquitaine) : actualités, délibérations et appels à projets sur l'emploi, la formation et l'insertion
- les sites des conseils départementaux (Dordogne (24) et Haute-Vienne (87)) : aides, RSA, insertion, mobilité
- les sites de la préfecture et de la DREETS ou de la DDETS compétentes : actualités, arrêtés et appels à projets
- les sites régionaux de France Travail, des missions locales et des Cap emploi du territoire
- service-public.gouv.fr : les actualités locales et l'article « Ce qui change » de chaque mois de la période

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un changement pour lequel tu n'as ouvert aucune page ne doit pas être écrit. L'outil ouvrira les pages citées pour y retrouver ces passages.

SOURCES : une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses, sans paramètre de langue (pas de « ?lang=en »). Une source différente pour chaque changement quand c'est possible ; jamais un discours comme source d'un texte. Si tu n'as pu lire que le relais d'un texte officiel, écris « source primaire non ouverte » à la fin de ce_qui_change.

FORMAT DE LA RÉPONSE : aucun commentaire en dehors des trois blocs ci-dessous (sauf la ligne « SUITE DISPONIBLE » si elle est nécessaire). Sans puce, sans gras, sans note de bas de page.

Bloc 1, les changements :
[BALAYAGE periode: octobre 2026]
domaine: un des domaines ci-dessus, recopié exactement (ou : Annoncé, pas encore en vigueur)
intitule: intitulé court
type: une seule de ces valeurs : loi, décret, arrêté, circulaire ou note, déploiement de dispositif
publie_le: AAAA-MM-JJ (ou : à vérifier)
en_vigueur: AAAA-MM-JJ (ou : à venir AAAA-MM-JJ, ou : à vérifier)
concerne: qui est concerné
ce_qui_change: une à trois phrases, sans jargon non expliqué
source: nom-court | titre | https://adresse | AAAA-MM-JJ (date de consultation)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
(un changement est séparé du suivant par une ligne vide ; n'écris pas « Aucun changement retenu » ici : l'absence de changement se déclare dans le bloc 2)
[/BALAYAGE]

Bloc 2, la couverture, pour CHAQUE domaine de ce message :
[COUVERTURE]
domaine: nom recopié exactement
statut: changements trouvés | rien trouvé | non couvert
pages_ouvertes: adresse ; adresse ; adresse (les pages réellement ouvertes pour ce domaine)
raison: (seulement si non couvert : pourquoi)
[/COUVERTURE]
Le statut « rien trouvé » exige au moins trois pages différentes réellement ouvertes et listées ; sinon le statut est « non couvert ». Dire « non couvert » est toujours préférable à un « rien trouvé » non vérifié.

Bloc 3, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S9 : Comprendre le cadre, contrôler le rayon « Venir de l'étranger » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « etranger », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: etranger-comparabilite-diplome
titre: Faire reconnaître un diplôme obtenu à l'étranger : à quoi sert l'attestation de comparabilité ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le coût et le délai de l'attestation de comparabilité
- Les usages acceptés de l'attestation (par exemple pour la naturalisation)
- Les procédures propres aux professions réglementées
texte:
En France, il n'existe pas d'équivalence automatique d'un diplôme étranger. Ce qui existe, c'est un document qui aide à le situer : l'attestation de comparabilité, délivrée par le centre ENIC-NARIC France.

Cette attestation compare votre diplôme aux niveaux d'études français. Elle sert surtout à rassurer un employeur qui ne connaît pas votre système scolaire, ou à appuyer une candidature en formation. Elle facilite l'insertion professionnelle.

Elle a des limites qu'il faut connaître. Elle n'a pas de valeur juridique : la décision revient toujours à l'employeur ou à l'établissement. Elle ne remplace pas un diplôme français. Elle n'est pas délivrée pour les diplômes de langue seuls, ni pour les professions réglementées, qui ont chacune leur propre procédure.

La demande se fait en ligne. Le coût est de l'ordre de cent vingt euros, et l'attestation est gratuite pour les demandeurs d'asile et les personnes protégées. Le délai est de quelques mois.

Pour une profession réglementée, ou si vous ne savez pas si la vôtre en est une, contactez directement le centre ENIC-NARIC France : c'est aussi son rôle de renseigner.
---
[fiche] id: etranger-contrat-integration-republicaine
titre: Le contrat d'intégration républicaine et l'OFII : à quoi ça sert ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le niveau de français à atteindre en fin de contrat
- Le volume d'heures des formations en français
- Les règles de l'examen civique en fin de formation civique
- Le lien entre le contrat et la délivrance de la carte pluriannuelle
texte:
Si vous obtenez un premier titre de séjour et que vous voulez rester en France, vous signez avec l'État un contrat d'intégration républicaine, préparé par l'OFII. Il dure un an, renouvelable une fois. Il concerne aussi les personnes réfugiées et bénéficiaires de la protection subsidiaire.

Tout commence par un entretien personnalisé à l'OFII, avec une évaluation de votre niveau de français.

Vous suivez ensuite une formation civique de quatre journées, sur les valeurs de la République, les institutions, vos droits et vos devoirs, l'histoire et la culture. Elle est gratuite et se termine par l'examen civique : un questionnaire de quarante questions, à réussir à quatre-vingts pour cent. Depuis le 1er janvier 2026, cette réussite est nécessaire pour obtenir une carte de séjour pluriannuelle.

Si votre niveau de français est en dessous du niveau A2, une formation en français gratuite vous est proposée pour atteindre ce niveau. Sa durée dépend de votre niveau de départ ; la fiche « Les cours de français de l'OFII » du rayon « Apprendre le français » en détaille le déroulement. Depuis 2026, le niveau de français demandé est A2 pour une carte pluriannuelle et B1 pour une carte de résident.

L'OFII vous oriente aussi vers un conseiller emploi, pour que la recherche de travail commence en même temps que l'apprentissage du français.

De votre côté, vous vous engagez à suivre les formations avec assiduité, à répondre aux convocations de l'OFII et à signaler vos changements de situation. Le respect de ce contrat compte pour obtenir ensuite une carte de séjour de plusieurs années.

Pour toute question sur votre parcours, votre interlocuteur est l'OFII.
---
[fiche] id: etranger-demandeur-asile-et-emploi
titre: Demandeur d'asile ou protection internationale : ce que je peux faire pour l'emploi
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le délai à partir duquel un demandeur d'asile peut demander une autorisation de travail
- Les effets du Pacte européen sur la migration et l'asile (en vigueur depuis juin 2026)
- Les durées des titres de séjour pour les personnes protégées
- Les conditions d'accès au RSA pour les personnes protégées
texte:
Ce que vous pouvez faire pour l'emploi dépend de l'étape où vous en êtes.

Pendant les six premiers mois qui suivent l'enregistrement de votre demande d'asile, vous ne pouvez pas travailler. Vous pouvez percevoir l'allocation pour demandeur d'asile.

Au-delà de six mois, si l'OFPRA n'a pas encore décidé, un employeur peut demander une autorisation de travail pour vous, avec un contrat ou une promesse d'embauche. La demande est examinée comme pour tout travailleur étranger. Si l'autorisation est accordée, elle vaut le temps de votre attestation de demande d'asile, et elle se renouvelle jusqu'à la décision, y compris pendant un recours devant la Cour nationale du droit d'asile.

Une fois une protection accordée, le droit de travailler devient automatique, sans autorisation.

Si vous êtes reconnu réfugié, vous recevez une carte de résident de dix ans. Si vous avez la protection subsidiaire, vous recevez une carte de séjour de plusieurs années, renouvelable, puis une carte de résident après quelques années.

Dans les deux cas, vous êtes inscrit à France Travail si vous cherchez un emploi, vous pouvez avoir accès au revenu de solidarité active sous conditions, et vous signez le contrat d'intégration républicaine. Des dispositifs d'accompagnement vers l'emploi existent pour les personnes protégées.

Les règles de l'asile évoluent en ce moment avec le Pacte européen sur la migration et l'asile, entré en vigueur le 12 juin 2026 : il raccourcit surtout les délais d'examen des demandes et de recours. Le délai de six mois pour accéder au travail, lui, n'a pas changé. Une exception est nouvelle : si vous faites l'objet d'une décision de transfert vers un autre pays européen (procédure dite « Dublin »), vous n'avez plus le droit de travailler depuis le 12 juin 2026. Pour votre situation précise, appuyez-vous sur l'OFII, sur une association d'aide aux demandeurs d'asile, ou sur une permanence d'accès au droit.
---
[fiche] id: etranger-naturalisation-grandes-etapes
titre: Demande de naturalisation : les grandes étapes
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le niveau de français exigé et les tests acceptés
- Le contenu et les règles de l'examen civique
- Le montant du timbre fiscal et les délais de décision
- Les justificatifs acceptés pour le niveau d'études
texte:
La naturalisation par décret est la voie principale pour devenir français quand on ne l'est pas de naissance. C'est une demande, pas un droit : l'État décide.

Les conditions générales sont les suivantes. Il faut en principe résider en France de façon régulière depuis cinq ans. Ce délai est réduit à deux ans si vous avez réussi deux années d'études supérieures en France, et il n'y a pas de durée minimale pour une personne réfugiée. Il faut aussi vivre effectivement en France avec le centre de ses attaches, avoir des ressources stables, un casier judiciaire compatible, et montrer son assimilation à la communauté française.

Deux points ont changé au 1er janvier 2026. Le niveau de français demandé est passé au niveau B2, à l'oral et à l'écrit, à prouver par un diplôme français ou un test récent (le TCF ou le TEF, valables deux ans). Et un examen civique est devenu obligatoire : un questionnaire de quarante questions en français, qu'il faut réussir à quatre-vingts pour cent, soit trente-deux bonnes réponses. Les dispenses sont limitées : les personnes réfugiées ou apatrides de plus de soixante-dix ans qui vivent en France depuis au moins quinze ans n'ont pas à prouver leur niveau de français, et une personne dont le handicap ou l'état de santé rend l'évaluation impossible peut être dispensée, sur certificat médical.

Le déroulement : vous constituez le dossier, vous le déposez en ligne avec un timbre fiscal, vous passez un entretien d'assimilation en préfecture, une enquête a lieu, puis le ministère décide. La réponse peut prendre jusqu'à dix-huit mois. En cas d'accord, votre nom paraît dans un décret au Journal officiel.

Pour préparer votre dossier et connaître les pièces exactes, appuyez-vous sur le site du service public et, si besoin, sur une permanence d'accès au droit.
---
[fiche] id: etranger-permis-de-conduire-etranger
titre: J'ai un permis de conduire étranger : puis-je le garder, ou faut-il l'échanger ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La liste des pays ayant un accord de réciprocité avec la France
- Le délai pour demander l'échange après l'installation en France
- Le coût de la démarche
texte:
Que faire de votre permis étranger dépend du pays qui l'a délivré.

S'il vient d'un pays de l'Union européenne ou de l'Espace économique européen, il reste valable en France. Vous n'êtes pas obligé de l'échanger, sauf en cas de perte, de vol, de fin de validité ou d'infraction.

S'il vient d'un pays hors Union européenne qui a un accord de réciprocité avec la France, vous pouvez l'échanger contre un permis français, sans repasser l'examen. La demande se fait sur le site de l'ANTS. Depuis le 12 mai 2026, elle est payante : un droit de timbre électronique se règle en ligne au moment de la demande (le montant est indiqué sur le site). Le permis doit être en cours de validité, avoir été obtenu dans le pays où vous viviez alors, et être accompagné d'une traduction officielle. Il y a un délai à respecter à partir de la délivrance de votre titre de séjour : passé ce délai, l'échange n'est plus possible.

S'il vient d'un pays sans accord de réciprocité, l'échange n'est pas possible. Il faut passer le permis français, le code et la conduite.

Pendant l'instruction de l'échange, vous continuez à conduire avec votre permis d'origine. Quand l'administration vous demande de l'envoyer, elle vous remet une attestation qui vous autorise à conduire en attendant le permis français.

Si vous avez un titre « étudiant », le délai ne commence qu'à la fin de validité de ce titre. Pour connaître la règle exacte de votre pays et votre délai, vérifiez sur le site du service public ou auprès de la préfecture.
---
[fiche] id: etranger-regularisation-par-le-travail
titre: Se faire régulariser par le travail : ce qui est possible, ce qui ne l'est pas
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La liste des métiers et des zones en tension
- L'existence même de la voie « métiers en tension », prévue jusqu'à fin 2026
- Les pratiques des préfectures pour l'admission exceptionnelle
- Le coût du droit de visa de régularisation
texte:
Il existe des démarches pour régulariser une situation par le travail, mais aucune n'est automatique : dans tous les cas, c'est la préfecture qui décide, au cas par cas.

Deux voies principales.

La première concerne les métiers en tension. Depuis 2024, et jusqu'au 31 décembre 2026, une personne qui travaille en France peut demander elle-même, sans passer par son employeur, une carte de séjour d'un an. Il faut vivre en France sans interruption depuis au moins trois ans, avoir travaillé au moins douze mois sur les vingt-quatre derniers, dans un métier et une région qui figurent sur la liste officielle, et occuper encore un emploi de ce type. Après 2026, cette voie disparaîtra, sauf si la loi la prolonge.

La seconde voie, l'admission exceptionnelle au séjour, existe en dehors des métiers en tension. Elle repose entièrement sur l'appréciation du préfet, qui regarde l'ancienneté de votre présence en France, la durée et la stabilité de votre travail, votre vie familiale, votre insertion. La circulaire qui servait de grille a été remplacée en janvier 2025 par un texte d'orientations générales, qui laisse la décision au préfet : les pratiques varient d'un département à l'autre.

Ces démarches sont complexes, et un refus a des conséquences. Ne les engagez pas seul : faites-vous accompagner par une permanence d'accès au droit des étrangers ou une association spécialisée, qui montera le dossier avec vous.
---
[fiche] id: etranger-titre-de-sejour-et-travail
titre: Mon titre de séjour me permet-il de travailler ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les listes de métiers en tension qui dispensent d'examen de la situation de l'emploi
- Le nombre d'heures autorisées pour un titre étudiant
- Le coût des titres de séjour pour motif professionnel
- Les règles d'inscription à France Travail selon le titre
texte:
Le droit de travailler dépend du titre de séjour que vous détenez. Trois situations existent.

Certains titres ouvrent le droit de travailler sans aucune démarche supplémentaire, comme salarié ou à votre compte : la carte de résident, la carte « vie privée et familiale », le « passeport talent », ainsi que le statut de réfugié et la protection subsidiaire. La mention « autorise son titulaire à travailler » figure alors sur le titre.

D'autres titres demandent une autorisation de travail liée à un emploi et à un employeur précis : c'est le cas des cartes « salarié », « travailleur temporaire » et « travailleur saisonnier ». C'est l'employeur qui fait la demande, en principe avant votre arrivée en France. Pour certains métiers qui manquent de main-d'œuvre, l'administration accorde l'autorisation plus facilement.

Un titre « étudiant » permet de travailler comme salarié sans autorisation, mais dans une limite d'heures fixée sur l'année. Au-delà de cette limite, l'employeur doit demander une autorisation.

Un récépissé demande à être lu attentivement. S'il prolonge un titre qui autorisait déjà le travail, ce droit continue. S'il accompagne une première demande, il ne permet pas toujours de travailler : la mention est portée sur le document.

Pour vous inscrire comme demandeur d'emploi à France Travail, il faut un document de séjour (ou un document provisoire) qui vous autorise à travailler comme salarié, depuis un décret d'avril 2026.

Votre situation exacte se lit sur votre titre et se vérifie auprès de la préfecture. En cas de doute, une permanence d'accès au droit des étrangers peut vous aider gratuitement.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: etranger] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S10 : Comprendre le cadre, contrôler le rayon « Budget, dettes, droits sociaux » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « budget », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: budget-aide-alimentaire-et-aides-urgence
titre: Aide alimentaire et aides d'urgence : à qui s'adresser
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les conditions d'accès aux paniers-repas des associations
- Les aides financières d'urgence du département et de la commune
- Les campagnes saisonnières (hiver, rentrée)
texte:
Quand il n'y a plus rien pour manger ou pour payer une dépense qu'on ne peut pas reporter, il existe des solutions immédiates. Elles ne règlent pas le fond, mais elles laissent le temps de souffler.

Pour l'aide alimentaire, quatre grands réseaux sont présents partout : les Restos du Cœur, la Banque alimentaire, le Secours populaire, la Croix-Rouge. À côté, des épiceries solidaires et des associations locales.

Pour les paniers de produits à cuisiner, il faut en général s'inscrire une fois par an et montrer que vos ressources sont insuffisantes. L'inscription se fait auprès de l'association, ou avec l'aide d'un travailleur social.

Pour l'aide d'urgence, les repas chauds servis sur place ou dans la rue, et les colis d'urgence, il n'y a ni inscription ni justificatif à fournir.

Dans une épicerie sociale et solidaire, vous achetez les produits à une fraction de leur prix, sur orientation d'un travailleur social, pour quelques mois.

Pour une aide financière d'urgence, prenez rendez-vous avec un travailleur social : du CCAS de votre commune, du département, ou de la CAF. Si vous êtes inscrit à France Travail, votre conseiller peut aussi étudier une aide ponctuelle. Selon votre situation, un secours ponctuel, des bons alimentaires, la prise en charge d'une facture ou, pour les moins de 26 ans, le fonds d'aide aux jeunes peuvent être mobilisés.

Les structures de votre secteur sont dans « Près de chez moi ». Si vous êtes suivi, votre référent est le point d'entrée le plus rapide.
---
[fiche] id: budget-droit-au-compte
titre: Une banque refuse de m'ouvrir un compte : le droit au compte
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La liste des services bancaires de base gratuits
- Les délais de la procédure
texte:
Toute personne qui réside en France a le droit d'avoir un compte bancaire. Une banque peut refuser de vous en ouvrir un, mais ce refus déclenche une procédure qui vous garantit un compte.

D'abord, demandez à la banque une attestation de refus. Si elle ne répond pas à votre demande d'ouverture dans les quinze jours, c'est aussi considéré comme un refus.

Ensuite, avec cette attestation, vous saisissez la Banque de France, en ligne, sur place ou par courrier. En un jour ouvré, elle désigne une banque proche de chez vous. Cette banque doit ouvrir le compte dans les trois jours ouvrés après avoir reçu vos pièces.

Ce compte donne accès aux services bancaires de base, gratuits : une carte de paiement à autorisation systématique (elle vérifie le solde à chaque achat, le compte ne peut pas passer en négatif), l'encaissement de chèques et de virements, des prélèvements et virements, la consultation du compte à distance avec un relevé mensuel, des retraits et dépôts d'espèces, et deux chèques de banque par mois.

Un centre communal d'action sociale ou un travailleur social peut vous accompagner dans cette démarche. Pour la procédure exacte, adressez-vous à la Banque de France.
---
[fiche] id: budget-fichage-banque-de-france
titre: Je suis fiché à la Banque de France : ce que ça change, comment en sortir
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les durées d'inscription selon le type d'incident
- Les conditions de radiation anticipée
texte:
« Être fiché à la Banque de France » veut dire, le plus souvent, être inscrit au FICP : le fichier des incidents de remboursement des crédits aux particuliers. On y est inscrit après des impayés répétés sur un crédit, ou dès le dépôt d'un dossier de surendettement.

Ce que ça change : l'inscription n'interdit pas légalement de demander un crédit. Mais les banques consultent ce fichier avant d'accorder un prêt, donc en pratique, elle bloque souvent l'accès au crédit.

Combien de temps : jusqu'à cinq ans pour un incident de paiement sur un crédit. Après un dossier de surendettement, l'inscription dure le temps du plan ou des mesures, sans dépasser sept ans, mais elle est retirée au bout de cinq ans s'il n'y a pas eu de nouvel incident de paiement. En cas de rétablissement personnel, quand les dettes sont effacées, elle est de cinq ans.

Comment en sortir plus tôt : dès que vous réglez la somme en retard, ou dès que les dettes prévues à un plan de surendettement sont soldées, votre radiation est demandée. L'inscription disparaît alors avant la fin du délai.

Pour savoir si vous êtes inscrit, et pour quoi, vous avez un droit d'accès gratuit à vos informations, sur le site de la Banque de France, sur place dans une succursale, ou par courrier.

Un point conseil budget peut vous aider à faire le point et à négocier avec vos créanciers.
---
[fiche] id: budget-microcredit-personnel
titre: Le microcrédit personnel accompagné : pour qui, pour quoi ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le montant maximum et la durée de remboursement
- La liste des réseaux accompagnants habilités
texte:
Le microcrédit personnel accompagné est un petit prêt pour financer un projet qui vous aide à travailler, quand une banque classique vous a refusé un crédit.

Il sert par exemple à acheter ou réparer une voiture, financer le permis, payer une formation, s'équiper pour un métier, ou couvrir des frais de santé non remboursés.

Le montant va en général de quelques centaines d'euros à huit mille euros, remboursables sur une durée de six mois à sept ans. Le taux d'intérêt est modéré, fixé par la banque. Une garantie publique couvre une partie du risque pour la banque.

Point important : vous ne pouvez pas faire la demande directement auprès d'une banque. Vous devez passer par un accompagnant : une association habilitée, un centre communal d'action sociale, une mission locale, ou un travailleur social. Cette personne étudie votre projet avec vous, monte le dossier, le présente à une banque partenaire, puis vous suit pendant le remboursement.

Être inscrit au fichier des incidents de crédit de la Banque de France ne bloque pas forcément un microcrédit : l'accompagnant en tient compte au cas par cas.

Pour trouver un accompagnant près de chez vous, voyez « Près de chez moi » ou demandez à la personne qui vous accompagne.

Quatre acteurs peuvent vous aider. Parcours Confiance, une marque de l'Institut de microcrédit : on ne le contacte pas directement, c'est une association ou un service qui vous accompagne qui fait la demande. L'Appui, service de La Banque Postale : réservé à ses clients et joignable seulement par téléphone. L'Adie et l'Atelier budgétaire de Périgueux : ils aident aussi à monter le dossier.
---
[fiche] id: budget-point-conseil-budget
titre: Le point conseil budget : à quoi ça sert ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le nombre et la liste des points conseil budget par territoire
- Les structures qui les portent
texte:
Un point conseil budget est un lieu où une personne vous aide, gratuitement, à faire le point sur votre budget. C'est confidentiel et ouvert à tout le monde.

Ce que vous pouvez y faire : établir un budget clair, repérer des dépenses à ajuster, comprendre un courrier de relance, anticiper une baisse de revenus, préparer une reprise d'emploi ou une séparation. Le conseiller peut aussi vous aider à monter un dossier de surendettement, et parfois contacter un créancier avec vous.

Ce qu'un point conseil budget ne fait pas : il ne prête pas d'argent et ne verse aucune aide. Ce sont des conseillers, pas un guichet financier.

Ces lieux sont portés par des associations, des centres communaux d'action sociale, des unions départementales des associations familiales. On les trouve dans l'annuaire du site du service public et sur le site « Mes questions d'argent » de la Banque de France.

Pour trouver le point conseil budget le plus proche, voyez « Près de chez moi » ou demandez à la personne qui vous accompagne.
---
[fiche] id: budget-rsa-prime-activite-reprise-emploi
titre: Je suis au RSA et je reprends un emploi : que se passe-t-il pour mes droits ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le montant forfaitaire du RSA et de la prime d'activité
- Les règles de cumul lors d'une reprise d'activité
- Le volume d'heures d'accompagnement prévu au contrat d'engagement
texte:
Reprendre un emploi ne fait pas perdre vos droits d'un coup. Le système est fait pour que travailler rapporte toujours plus que ne pas travailler.

Vous continuez à déclarer vos ressources tous les trois mois à la CAF, ou à la MSA si vous relevez du régime agricole. Pendant chaque trimestre, le montant est figé, puis il est recalculé.

Les premiers mois après la reprise, votre salaire et votre RSA se cumulent. Ensuite, la prime d'activité prend le relais du RSA : c'est un complément versé aux personnes qui travaillent et gagnent peu.

Vous n'avez aucune démarche particulière à faire pour ce passage : la CAF ou la MSA bascule automatiquement, à condition que vous continuiez vos déclarations trimestrielles.

Depuis 2025, être au RSA veut dire être inscrit à France Travail et avoir signé un contrat d'engagement, avec un accompagnement et des heures d'activité prévues chaque semaine. Reprendre un emploi s'inscrit dans ce parcours.

Pour savoir ce que vous toucherez précisément, faites une simulation sur votre compte CAF, ou demandez à votre référent. Votre situation exacte se vérifie auprès de la CAF ou de la MSA.
---
[fiche] id: budget-saisie-sur-salaire
titre: Un créancier saisit une partie de mon salaire : ce qui peut être prélevé, ce qui est protégé
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le barème des tranches saisissables, revu chaque année
- Le montant du RSA qui sert de plancher insaisissable
texte:
Quand une dette n'est pas remboursée, un créancier peut demander une saisie sur votre salaire : chaque mois, votre employeur retient une partie de votre paie et la verse pour rembourser la dette.

Une partie de votre salaire est toujours protégée. Vous gardez au minimum l'équivalent du RSA pour une personne seule, quelle que soit votre situation familiale. Au-dessus de ce montant, la part prélevée augmente par tranches, selon ce que vous gagnez : elle est faible sur les premiers euros, plus forte ensuite. Chaque personne à votre charge relève encore le seuil protégé.

Depuis juillet 2025, la saisie passe par un commissaire de justice, et non plus par le tribunal. Vous recevez un document qui explique la dette et le montant prélevé.

Sur votre compte en banque, une somme équivalente au RSA reste toujours disponible, même quand une saisie est en cours.

Cas particulier : pour une pension alimentaire impayée, la récupération est prioritaire et peut passer directement par votre employeur.

Si le montant prélevé vous semble une erreur, vous pouvez le contester devant le juge de l'exécution. Un point conseil budget ou un travailleur social peut vous aider à faire le point et à discuter avec vos créanciers.
---
[fiche] id: budget-surendettement-dossier-recevable
titre: Surendettement : ce qui change une fois le dossier recevable
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La durée maximale d'un plan et la durée d'inscription au FICP
- La liste des dettes qui ne peuvent jamais être effacées
texte:
Quand la commission déclare votre dossier recevable, les saisies et les poursuites de vos créanciers s'arrêtent et aucun créancier ne peut en engager de nouvelle. Cette suspension dure jusqu'à la mise en place de la solution, et au maximum deux ans. Elle ne joue pas pour les pensions alimentaires ni pour les amendes pénales : ces sommes peuvent continuer à être réclamées.

D'autres protections s'ouvrent. Si une expulsion de votre logement est engagée, la commission peut, à votre demande, saisir le juge pour la suspendre : c'est le juge qui décide. Votre banque ne peut pas fermer votre compte pour ce seul motif : vous gardez le compte et des moyens de paiement adaptés, sans frais de rejet, avec des frais d'incident plafonnés.

La commission choisit ensuite une solution, selon ce que vous pouvez rembourser :

- un plan conventionnel de redressement, négocié avec vos créanciers : étalement des dettes, baisse des mensualités ou du taux, report, parfois vente d'un bien ;
- des mesures imposées par la commission si aucun accord n'est trouvé, que vous pouvez contester devant le juge ;
- un rétablissement personnel, c'est-à-dire l'effacement des dettes, quand il n'y a ni bien à vendre ni capacité de remboursement, directement ou après la vente de vos biens décidée par un juge.

Vous restez inscrit au FICP le temps du plan ou des mesures, sans dépasser sept ans ; l'inscription est retirée au bout de cinq ans s'il n'y a pas eu de nouvel incident de paiement. En cas de rétablissement personnel, elle est de cinq ans.

Pendant toute la procédure, vous ne devez pas aggraver votre endettement, ni rembourser les crédits en cours, ni vendre ou donner vos biens, mais vous devez continuer à payer vos charges courantes. Certaines dettes ne s'effacent jamais : les pensions alimentaires, les amendes pénales, les sommes dues à une victime après une condamnation pénale, les dettes contractées par fraude à un organisme social, et certaines dettes fiscales. Un point conseil budget ou un travailleur social peut vous aider à suivre le dossier. Votre situation exacte se vérifie auprès de la commission de surendettement, à la Banque de France.
---
[fiche] id: budget-surendettement
titre: La procédure de surendettement : comment ça marche ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les délais de traitement des commissions
- Les critères d'appréciation de la recevabilité et de la bonne foi
texte:
Quand les dettes deviennent impossibles à rembourser malgré vos efforts, vous pouvez déposer un dossier de surendettement. Il se dépose auprès de la commission de surendettement de votre département, qui dépend de la Banque de France. C'est gratuit, en ligne ou par courrier.

La commission réunit plusieurs membres, sous la présidence du préfet, avec la Banque de France comme secrétariat. Elle n'efface pas elle-même les dettes et ne prête pas d'argent : son rôle est d'examiner votre situation et d'orienter le dossier. Vous recevez une attestation de dépôt sous quarante-huit heures. Dès le dépôt, une inscription est faite au fichier des incidents de remboursement des crédits, le FICP.

Pendant l'examen du dossier, vous devez continuer à payer vos charges courantes : loyer, énergie, eau, assurances, pensions alimentaires. En revanche, vous ne devez plus rembourser les crédits en cours, ni vendre ou donner vos biens, ni prendre de nouvelle dette.

La commission décide d'abord si votre dossier est recevable. Elle regarde votre situation personnelle et familiale, le montant et la nature de vos dettes, ce que vous possédez, ce que vous pouvez rembourser, et votre bonne foi. Elle a trois mois pour se prononcer ; en pratique, la première réponse arrive souvent plus vite, en quelques semaines. Si le dossier est jugé irrecevable, vous pouvez faire un recours dans les quinze jours, par courrier à la Banque de France.

Une fois le dossier recevable, des protections s'appliquent et la commission choisit une solution : c'est l'objet de la fiche « Surendettement : ce qui change une fois le dossier recevable ». Un point conseil budget ou un travailleur social peut vous aider à monter le dossier et à comprendre les décisions. Votre situation exacte se vérifie auprès de la commission de surendettement, à la Banque de France.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: budget] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S11 : Comprendre le cadre, contrôler le rayon « Questions juridiques » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « juridique », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: juridique-aide-juridictionnelle
titre: L'aide juridictionnelle : faire payer l'avocat et la procédure par l'État
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les plafonds de ressources et de patrimoine, révisés chaque année
- La part prise en charge en aide partielle
- Le formulaire et les pièces à fournir
texte:
Si vous avez besoin d'un avocat ou d'engager une procédure et que vos revenus sont modestes, l'État peut payer tout ou partie des frais. C'est l'aide juridictionnelle.

Trois conditions sont examinées ensemble : vos ressources et votre patrimoine, qui doivent rester sous des plafonds fixés chaque année ; votre nationalité ou votre résidence régulière en France ; et le sérieux de votre action en justice. Il ne faut pas non plus avoir une assurance qui couvre déjà ces frais.

Selon vos revenus, l'aide est totale ou partielle.

La demande se dépose au bureau d'aide juridictionnelle du tribunal de votre domicile, avec un formulaire et des justificatifs de ressources. Vous pouvez aussi la faire en ligne, sur le site de l'aide juridictionnelle. Un simulateur en ligne, sur aidejuridictionnelle.justice.fr, vous dit rapidement si vous y avez droit.

Un point à connaître : depuis le 1er mars 2026, saisir un tribunal civil ou le conseil de prud'hommes suppose d'acheter un timbre fiscal de 50 euros. Les personnes qui ont l'aide juridictionnelle en sont dispensées.

Un point-justice ou un travailleur social peut vous aider à monter le dossier.
---
[fiche] id: juridique-contester-une-decision
titre: Contester une décision de France Travail, de la CAF ou d'une autre administration
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les décisions pour lesquelles le médiateur doit être saisi avant le juge
- Les délais de recours propres à chaque organisme
texte:
Une décision d'un organisme peut se contester, mais il faut respecter la marche à suivre et les délais indiqués sur le courrier.

Pour France Travail : commencez par une réclamation, depuis votre espace personnel, par courriel ou par courrier. Un simple réexamen règle souvent le problème. Pour certaines décisions, comme une sanction ou une fin d'inscription, il faut saisir le médiateur régional avant le juge administratif. Pour le RSA, la contestation se fait auprès du président du conseil départemental.

Pour la CAF : saisissez la commission de recours amiable dans les 2 mois qui suivent la décision, par courrier ou depuis votre espace. Elle a 2 mois pour répondre ; sans réponse, c'est un refus. Si elle refuse, vous avez ensuite deux mois pour saisir le tribunal judiciaire (pôle social). Le médiateur de la CAF est une autre voie, après une première réclamation.

Pour la MDPH, la préfecture et d'autres administrations, chaque organisme a son propre recours préalable et ses délais, souvent courts. Les rayons Handicap et Étranger le détaillent.

Dans tous les cas : gardez une copie de tout, envoyez en recommandé, respectez le délai. Un point-justice ou un travailleur social peut vous aider à rédiger.
---
[fiche] id: juridique-discrimination-a-l-embauche
titre: La discrimination à l'embauche ou au travail : le Défenseur des droits
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La liste des critères de discrimination reconnus par la loi
- Les modalités de saisine du Défenseur des droits
texte:
La loi interdit de refuser d'embaucher, de sanctionner ou de licencier quelqu'un à cause de son origine, son âge, son sexe, sa grossesse, son état de santé, son handicap, ses convictions, son orientation sexuelle, son lieu de résidence, sa situation de famille, et d'autres critères encore.

Si vous pensez en être victime, le Défenseur des droits peut vous aider. C'est une autorité indépendante. La saisine est gratuite et confidentielle, en ligne, par courrier ou par téléphone. Il enquête, peut proposer une médiation, présenter ses observations devant le juge, ou recommander des poursuites. Des délégués sont présents dans chaque département.

Attention aux délais : saisir le Défenseur des droits n'arrête pas le compte à rebours pour agir en justice. Si une échéance approche, il faut engager une action en parallèle.

Sur la preuve, la règle est plus favorable qu'ailleurs : vous apportez des éléments qui laissent penser à une discrimination, et c'est ensuite à l'employeur de démontrer que sa décision repose sur des raisons objectives.

Vous pouvez aussi saisir le conseil de prud'hommes, où le barème d'indemnités ne s'applique pas, ou déposer plainte.
---
[fiche] id: juridique-faire-respecter-ses-droits-au-travail
titre: Faire respecter ses droits au travail : salaire, heures, harcèlement
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les coordonnées et l'organisation de l'inspection du travail
- Les obligations de l'employeur en matière de prévention du harcèlement
texte:
Quand un employeur ne respecte pas vos droits, plusieurs recours existent, du plus simple au plus formel.

Pour un salaire ou des heures non payés, des congés refusés : envoyez d'abord un courrier daté à l'employeur qui décrit le problème. Gardez une copie.

Si cela ne suffit pas, saisissez l'inspection du travail. Elle contrôle l'application du droit du travail, peut intervenir dans l'entreprise, et renseigne les salariés. On la saisit par courrier, par courriel ou sur place, et on peut demander que son nom reste confidentiel.

En cas de harcèlement moral ou sexuel, l'employeur a l'obligation de vous protéger. Vous pouvez alerter le référent harcèlement s'il existe, le comité social et économique, la médecine du travail, l'inspection du travail. Vous pouvez aussi déposer plainte et saisir le conseil de prud'hommes. Si le harcèlement est lié à un motif discriminatoire (origine, sexe, état de santé, entre autres), vous pouvez en plus saisir le Défenseur des droits.

Les représentants du personnel et les syndicats peuvent vous accompagner, même si vous n'êtes pas syndiqué, et être présents lors des entretiens.

Si le désaccord ne se règle pas, la fiche sur le conseil de prud'hommes explique la suite.
---
[fiche] id: juridique-litige-avec-l-employeur
titre: Un litige avec l'employeur : le conseil de prud'hommes
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les délais pour agir selon le type de litige
- Le barème des indemnités de licenciement sans cause réelle et sérieuse
- Les frais de saisine
- Les pièces à joindre à la saisine
texte:
Le conseil de prud'hommes règle les désaccords entre un salarié et son employeur : salaire ou heures non payés, licenciement que vous jugez injustifié, contrat mal appliqué, documents non remis.

Avant d'aller au tribunal, un courrier recommandé à l'employeur, l'appui de l'inspection du travail, d'un représentant du personnel ou d'un syndicat, permet parfois de trouver une solution.

Les délais pour agir comptent. Il faut saisir le conseil dans les 12 mois après un licenciement, dans les 2 ans pour un problème lié à l'exécution du contrat, et dans les 3 ans pour des salaires non payés.

La procédure passe d'abord par une tentative de conciliation, puis par un jugement. La saisine se fait avec un formulaire. Depuis le 1er mars 2026, il faut un timbre fiscal de 50 euros, sauf si vous avez l'aide juridictionnelle. L'avocat n'est pas obligatoire, mais il est utile.

Depuis le 1er octobre 2026, il n'est plus nécessaire de joindre toutes vos pièces dès le départ. Vous joignez à la demande la liste de vos pièces et votre dernier bulletin de salaire en lien avec le litige. Le greffe vous demandera ensuite d'envoyer vos pièces à l'employeur avant la séance de conciliation ou l'audience : gardez-les donc toutes sous la main, bien classées.

Si le licenciement est jugé sans motif valable, un barème fixe l'indemnité selon votre ancienneté. Ce barème ne s'applique pas quand le licenciement est nul, par exemple pour discrimination ou harcèlement.

Les jugements demandent souvent plus d'un an. Faites-vous accompagner tôt.
---
[fiche] id: juridique-trouver-un-conseil-gratuit
titre: Trouver un conseil juridique gratuit
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les lieux, jours et horaires des permanences
- Les thèmes couverts par chaque permanence
texte:
Quand une question de droit vous pèse, plusieurs services vous informent gratuitement, avant même d'envisager un avocat payant.

Les points-justice sont des lieux gratuits et confidentiels. On y explique vos droits, on vous aide à comprendre un courrier ou à remplir un dossier, et on vous oriente. Ils existent dans chaque département et sont coordonnés par le conseil départemental de l'accès au droit.

Des consultations gratuites d'avocats sont organisées dans les points-justice, les mairies et les tribunaux. En général, seule la première consultation est gratuite.

Selon votre sujet, il existe aussi des permanences spécialisées : le logement avec l'ADIL, le droit des étrangers avec des associations, l'aide aux victimes avec le réseau France Victimes, le budget avec le point conseil budget.

En ligne, le site justice.fr propose des annuaires, des fiches claires et des simulateurs. Pour le droit du travail, le site « code du travail numérique » répond aux questions courantes.

Pour trouver la permanence la plus proche, demandez à la mairie, au point-justice, ou regardez sur justice.fr.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: juridique] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S12 : Comprendre le cadre, contrôler le rayon « Mobilité » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « mobilite », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: mobilite-acheter-ou-reparer-un-vehicule
titre: Acheter ou réparer une voiture avec peu de moyens
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les aides à l'achat d'un véhicule électrique (prime coup de pouce, leasing social) et leurs conditions
- Les dates et conditions du leasing social
- Les aides à la mobilité du département et de la région
texte:
Pour financer une voiture d'occasion quand une banque vous refuse un prêt, la solution la plus courante est le microcrédit personnel accompagné, présenté dans le rayon budget : jusqu'à huit mille euros, à demander par l'intermédiaire d'un accompagnant.

Pour l'achat d'une voiture électrique neuve, le bonus écologique a été remplacé, en juillet 2025, par une prime coup de pouce versée par les fournisseurs d'énergie, ouverte à tous les ménages mais plus élevée quand les revenus sont modestes (de l'ordre de 3 500 à 5 700 euros, selon les revenus et l'offre du fournisseur). Pour une voiture électrique d'occasion, une aide distincte existe depuis le 1er septembre 2026, sans condition de revenus : le véhicule doit être 100 % électrique, avoir été immatriculé pour la première fois en France entre 2017 et 2023, coûter au plus 25 000 euros, et être acheté ou loué à un professionnel agréé ; il faut le garder au moins trois ans. Le montant dépend du fournisseur d'énergie choisi. La prime à la conversion, liée à la mise au rebut d'un vieux véhicule, a été supprimée.

Le leasing social permet de louer une voiture électrique à prix réduit sur plusieurs années. Il est réservé aux personnes modestes qui travaillent et qui font un trajet de plus de dix kilomètres jusqu'à leur lieu de travail (revenu fiscal de référence par part d'au plus 16 880 euros). Il rouvre par périodes : l'édition 2026 est ouverte depuis le 16 juillet 2026, mais les places sont limitées, renseignez-vous sur la date en cours.

Le département et la région ont parfois leurs propres aides : aide individuelle à la mobilité pour les allocataires du RSA, prêt à taux zéro, aide à la réparation. Elles changent d'un territoire à l'autre.

Pour l'entretien et les petites réparations, les garages solidaires travaillent à tarif réduit, sur orientation d'un conseiller ou d'un travailleur social.

Les aides qui s'appliquent chez vous se vérifient dans « Près de chez moi » ou auprès de votre conseiller.
---
[fiche] id: mobilite-aide-mobilite-france-travail
titre: L'aide à la mobilité de France Travail : frais de déplacement, repas, hébergement
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les barèmes (kilomètre, repas, hébergement) et le plafond annuel
- Le seuil d'allocation journalière en dessous duquel on y a droit
- Les délais pour déposer la demande
texte:
France Travail peut prendre en charge une partie des frais quand un déplacement est nécessaire pour votre retour à l'emploi.

Cette aide s'adresse aux demandeurs d'emploi non indemnisés, à ceux qui touchent une faible allocation, et aux bénéficiaires du RSA, quand ils n'ont pas de solution de transport adaptée.

Elle couvre plusieurs situations : un entretien d'embauche, un concours public, une prestation d'accompagnement, une formation financée par France Travail, ou la reprise d'un emploi ou d'un contrat d'apprentissage d'au moins trois mois.

Le lieu doit être assez éloigné : plus de soixante kilomètres aller-retour, ou plus de deux heures de trajet aller-retour.

Ce qui est pris en charge : les frais de route au kilomètre ou le billet de train, les repas, et l'hébergement pour les nuits passées loin de chez vous, dans la limite d'un plafond annuel. Les montants exacts sont indiqués sur votre espace France Travail.

Il faut l'accord de votre conseiller, et la demande se fait avant le déplacement ou dans un délai court après. Parlez-en à votre conseiller dès que le déplacement se profile.
---
[fiche] id: mobilite-financer-le-permis
titre: Comment financer le permis de conduire ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'aide au permis B de France Travail (supprimée au 1er avril 2026)
- Le plafond du compte personnel de formation pour le permis
- Les aides de la région, du département et des communes
texte:
Passer le permis coûte cher, mais plusieurs aides existent selon votre âge et votre situation. Attention : l'aide au permis B de France Travail a été supprimée en avril 2026.

Si vous avez entre 15 et 25 ans et que c'est votre première inscription, le permis à 1 euro par jour est un prêt sans intérêt : l'État paie les intérêts, vous remboursez de petites mensualités. Il faut passer par une auto-école qui a signé la convention avec l'État.

Depuis la fin de l'aide de France Travail, le compte personnel de formation est devenu la voie principale : il peut financer le permis si celui-ci sert votre projet professionnel. Pour un demandeur d'emploi, il n'y a pas d'argent à ajouter ; pour les autres, une petite participation est demandée. Le permis poids lourd et le permis transport en commun peuvent aussi être financés ainsi.

Si vous avez moins de 26 ans, le fonds d'aide aux jeunes, géré par le département et accessible via la Mission locale, peut prendre en charge une partie du coût.

Le microcrédit personnel accompagné, présenté dans le rayon budget, permet aussi de financer le permis quand une banque vous refuse un prêt.

La région, le département et certaines communes ont parfois leurs propres aides. Pour connaître celles qui s'appliquent chez vous, voyez « Près de chez moi » ou demandez à votre conseiller.
---
[fiche] id: mobilite-garages-et-locations-solidaires
titre: Les garages solidaires et la location solidaire : comment ça marche ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- La liste des garages solidaires et des plateformes mobilité par territoire
- Les tarifs et les durées maximales de location
texte:
Quand un véhicule vous manque pour aller travailler, il existe des services réservés aux personnes en difficulté, à petit prix. Ils fonctionnent presque toujours sur orientation d'un conseiller France Travail ou d'un travailleur social.

Les garages solidaires entretiennent et réparent les voitures à tarif réduit. Certains vendent ou louent aussi des véhicules. Beaucoup sont des ateliers d'insertion, qui emploient des personnes en parcours.

Les plateformes mobilité vont plus loin : elles font un point complet sur vos besoins de déplacement, puis proposent une solution adaptée. Elles peuvent vous louer une voiture, un scooter, une voiture sans permis, un vélo ou un vélo électrique, en général pour quelques semaines à trois mois, le temps de trouver une solution durable.

Il existe aussi des auto-écoles associatives, qui préparent au permis à un rythme et à un tarif adaptés.

Ces solutions ne s'obtiennent pas en s'y présentant directement : parlez-en d'abord à votre conseiller ou à la personne qui vous accompagne. Pour trouver la structure la plus proche, voyez « Près de chez moi » ou l'annuaire « Mes aides France Travail ».
---
[fiche] id: mobilite-permis-suspendu-annule-points
titre: Permis suspendu, annulé, ou plus de points : que faire ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les délais de reconstitution automatique des points
- Le prix moyen d'un stage de récupération de points
- Les délais avant de pouvoir repasser le permis
texte:
Le permis compte 12 points, ou 6 pendant la période probatoire. Ces points reviennent tout seuls avec le temps, si vous ne commettez pas de nouvelle infraction : quelques mois pour une petite perte, deux à trois ans pour les plus graves.

Vous pouvez aussi récupérer jusqu'à 4 points en suivant un stage de sensibilisation à la sécurité routière, une fois par an. Il dure deux jours et coûte environ deux cents euros.

Il faut distinguer trois situations.

La suspension est temporaire. À la fin, vous récupérez votre permis, parfois après une visite médicale.

L'annulation est décidée par un tribunal, avec une durée pendant laquelle vous ne pouvez pas repasser le permis. Ensuite, il faut tout repasser, le code et la conduite, après une visite médicale et un test psychotechnique.

L'invalidation arrive quand le solde de points tombe à zéro. Vous recevez la lettre 48SI et vous ne pouvez plus conduire. Après un délai de six mois en général, vous pouvez repasser le permis, avec une visite médicale et un test psychotechnique.

Pour votre cas précis, les délais et les démarches se vérifient auprès de la préfecture. Une permanence d'accès au droit peut aussi vous aider.
---
[fiche] id: mobilite-se-deplacer-sans-voiture
titre: Se déplacer sans voiture pour chercher ou garder un emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les conditions et le tarif des cartes de réduction régionales pour les transports
- Les offres de transport à la demande par territoire
- Les tarifs réduits des réseaux de bus des agglomérations
texte:
Ne pas avoir de voiture ne veut pas dire ne pas pouvoir travailler. Plusieurs solutions existent, même si elles varient beaucoup d'un territoire à l'autre.

Certaines régions proposent une carte de réduction sur les trains et les cars régionaux, réservée aux personnes à faibles ressources. Le nom, le tarif et les conditions changent d'une région à l'autre, mais le principe est souvent le même. Renseignez-vous sur celle de votre région.

Là où il n'y a pas de ligne de bus régulière, un transport à la demande existe dans de nombreux territoires : un service collectif sur réservation, pour les trajets de proximité. Certains sont ouverts en priorité aux personnes en recherche d'emploi, avec une prise en charge plus près de leur domicile.

Dans les villes, plusieurs réseaux de bus proposent un tarif réduit ou gratuit selon les ressources ou le statut de demandeur d'emploi. Renseignez-vous auprès du réseau de votre agglomération.

Pour les trajets réguliers vers le travail, des applications de covoiturage, parfois publiques et gratuites, existent dans certaines régions et mettent en relation conducteurs et passagers sans commission.

Il existe aussi, selon les territoires, des aides à l'achat d'un vélo, des vélos en location longue durée proposés par certaines collectivités, et des ateliers pour apprendre à réparer son vélo soi-même.

Les offres exactes de votre territoire sont à chercher dans « Près de chez moi » ou auprès de votre conseiller.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: mobilite] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S13 : Comprendre le cadre, contrôler le rayon « Moins de 26 ans » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « jeunes », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: jeunes-aides-financieres
titre: Les aides financières quand on a moins de 26 ans
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants et conditions du fonds d'aide aux jeunes (fixés par le département)
- Le montant de l'allocation du contrat d'engagement jeune
- Les aides propres à chaque Mission locale et collectivité
texte:
Il n'y a pas de RSA avant vingt-cinq ans, sauf cas particulier. Mais plusieurs aides existent pour les jeunes.

L'allocation du contrat d'engagement jeune, versée pendant ce parcours par la Mission locale ou France Travail, peut atteindre 566 euros par mois depuis avril 2026, selon vos ressources.

Le fonds d'aide aux jeunes est une aide ponctuelle du conseil départemental, demandée par la Mission locale, pour un besoin urgent : transport, hébergement, alimentation, permis, frais de formation. Son montant et ses conditions dépendent du département.

L'aide à la mobilité de France Travail couvre les frais liés à un entretien, une formation ou une reprise d'emploi éloignée du domicile.

Pour se loger, les aides de la CAF et la garantie Visale sont accessibles dès dix-huit ans. Les foyers de jeunes travailleurs proposent un logement à petit prix.

Chaque Mission locale et certaines collectivités ont aussi leurs propres coups de pouce : frais de route pour un entretien, tenue vestimentaire, hébergement d'une nuit.

Le bon réflexe : signaler tout besoin d'argent à votre conseiller de la Mission locale. C'est lui qui connaît les aides mobilisables et qui monte les demandes.
---
[fiche] id: jeunes-contrat-apprentissage
titre: Le contrat d'apprentissage : apprendre un métier en étant payé
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les pourcentages du SMIC versés selon l'âge et l'année du contrat
- L'âge maximum et les cas de dérogation
- Les aides versées à l'employeur
texte:
L'apprentissage permet de préparer un diplôme, du CAP au master, tout en travaillant dans une entreprise. Vous partagez votre temps entre l'entreprise et un centre de formation d'apprentis.

C'est un vrai contrat de travail. Vous êtes salarié : vous avez cinq semaines de congés payés, la protection sociale, une visite médicale, et les mêmes protections que les autres salariés. Vous êtes payé chaque mois, en pourcentage du SMIC qui augmente avec votre âge et avec l'année du contrat, jusqu'à cent pour cent du SMIC à partir de vingt-six ans.

L'apprentissage s'adresse aux personnes de seize à vingt-neuf ans révolus. Il n'y a pas de limite d'âge si vous avez une reconnaissance de travailleur handicapé, si vous créez ou reprenez une entreprise, ou pour un sportif de haut niveau.

Le contrat dure de six mois à trois ans, quatre ans avec une reconnaissance de travailleur handicapé.

Pendant les quarante-cinq premiers jours passés en entreprise, chacun peut rompre le contrat librement. Ensuite, la rupture se fait d'un commun accord ou passe par le conseil de prud'hommes.

Pour trouver un employeur et un CFA, voyez « 1 jeune 1 solution », votre Mission locale, ou le CFA du métier qui vous intéresse.
---
[fiche] id: jeunes-e2c-epide
titre: L'école de la deuxième chance et l'EPIDE : reprendre un parcours quand on est sorti sans diplôme
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants de la rémunération et de l'allocation
- Les durées de parcours
- Les villes où ces structures sont implantées
texte:
Quitter l'école sans diplôme n'est pas une porte fermée. Deux dispositifs existent, avec des ambiances très différentes.

L'école de la deuxième chance s'adresse aux seize-vingt-cinq ans sans diplôme, sortis de l'école depuis au moins un an et sans emploi, à condition d'être motivé. Le parcours dure de quatre à dix-huit mois, en alternance entre l'école et des stages en entreprise. On y remet à niveau les savoirs de base, on découvre des métiers, et on prépare une sortie vers un emploi, un contrat en alternance ou une formation. C'est gratuit, et vous êtes rémunéré comme stagiaire de la formation professionnelle : environ cinq cents euros par mois après dix-huit ans, environ deux cents avant.

L'EPIDE est un internat, pour les dix-sept-vingt-cinq ans peu ou pas diplômés (au plus un CAP ou un BEP), avec un cadre proche du monde militaire : uniforme, discipline, vie collective. Il dure environ huit mois. Vous recevez une allocation d'environ quatre cent soixante euros par mois, non imposable, avec l'hébergement et les repas gratuits. Une prime est versée à la sortie si vous trouvez un emploi durable ou une formation dans les trois mois.

Pour savoir lequel vous conviendrait, parlez-en à votre conseiller de la Mission locale, qui connaît les places disponibles près de chez vous.
---
[fiche] id: jeunes-mission-locale-cej
titre: La Mission locale et le contrat d'engagement jeune
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant de l'allocation du contrat d'engagement jeune
- Le nombre d'heures d'activités et sa modulation
- Les règles de cumul avec d'autres aides
texte:
Si vous avez entre seize et vingt-cinq ans et que vous n'êtes plus à l'école, votre premier interlocuteur est la Mission locale. L'accompagnement est gratuit. Un conseiller vous suit sur l'emploi et la formation, mais aussi sur le logement, la santé, la mobilité ou le budget, car tout est lié.

Si vous n'êtes ni en emploi durable, ni en études, ni en formation, vous pouvez entrer dans un contrat d'engagement jeune, jusqu'à vingt-neuf ans si vous avez une reconnaissance de travailleur handicapé. C'est un parcours intensif : quinze à vingt heures d'activités par semaine, pendant un an, parfois prolongé de six mois. Au programme : ateliers, immersions en entreprise, formations, stages.

Pendant ce contrat, une allocation peut vous être versée, jusqu'à 566 euros par mois depuis avril 2026, selon vos ressources et le respect de vos engagements. Elle ne se cumule pas librement avec le RSA ou la prime d'activité.

Le contrat d'engagement jeune peut aussi être porté par France Travail, dans le cadre de l'accompagnement intensif jeunes.

Pour commencer, prenez rendez-vous avec la Mission locale de votre secteur. Les coordonnées sont dans « Près de chez moi ».
---
[fiche] id: jeunes-obligation-de-formation-16-18
titre: L'obligation de formation des 16-18 ans : un droit à être accompagné
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les acteurs chargés du suivi
- Les solutions proposées et les dispositifs partenaires
texte:
Depuis 2020, un jeune de seize à dix-huit ans doit toujours être quelque part : à l'école, en apprentissage, en emploi, en service civique, ou dans un dispositif d'accompagnement comme la Mission locale, une école de la deuxième chance ou une prépa-apprentissage.

Ce n'est pas une contrainte punitive. C'est surtout un droit : celui d'être recontacté et aidé quand on se retrouve sans solution.

Concrètement, quand un jeune quitte l'école sans projet, une plateforme rassemblant l'Éducation nationale, la Mission locale et d'autres acteurs est prévenue. La Mission locale prend alors contact pour proposer un rendez-vous et construire une solution : retour en formation, alternance, service civique, accompagnement.

Si le jeune ne répond pas malgré plusieurs tentatives, son dossier peut être transmis au conseil départemental, qui peut proposer un accompagnement social.

Si vous êtes dans cette situation, ou un proche, le mieux est de contacter directement la Mission locale sans attendre d'être recontacté.
---
[fiche] id: jeunes-prepa-apprentissage-ecoles-de-production
titre: La prépa-apprentissage et les écoles de production : se préparer à un métier
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les modalités et la durée de la prépa-apprentissage
- Les métiers et diplômes proposés en école de production
texte:
Se lancer directement en apprentissage n'est pas toujours facile quand on n'a pas de diplôme ou qu'on hésite encore sur le métier. Deux voies aident à s'y préparer.

La prépa-apprentissage est un accompagnement court, de quelques jours à quelques mois, pour les jeunes de seize à vingt-neuf ans sans qualification ou de faible niveau (dès quinze ans si vous terminez votre troisième). Elle permet de découvrir plusieurs métiers, de consolider la lecture, l'écriture et le calcul, de travailler les savoir-être attendus en entreprise, et de trouver un employeur. Vous avez le statut de stagiaire de la formation professionnelle et pouvez être rémunéré. C'est gratuit. Les jeunes en décrochage, sans diplôme ou en situation de handicap sont prioritaires.

L'école de production forme à un métier, comme la métallerie, la menuiserie, la restauration ou l'horticulture, en faisant travailler les élèves sur de vraies commandes de clients. Les deux tiers du temps sont consacrés à la production, le reste à l'enseignement général. Le jeune a le statut d'élève, sans contrat de travail, et prépare un diplôme comme le CAP ou le bac professionnel. L'entrée est possible dès quinze ans, et la formation est gratuite pour la famille.

Pour identifier une prépa-apprentissage ou une école de production près de chez vous, voyez la Mission locale ou « Près de chez moi ».
---
[fiche] id: jeunes-service-civique
titre: Le service civique : s'engager sur une mission d'intérêt général
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant de l'indemnité et de la prestation de subsistance
- Les compléments pour les boursiers et allocataires du RSA
texte:
Le service civique est un engagement de six à douze mois sur une mission utile à la société : aider des personnes âgées, accompagner des élèves, protéger l'environnement, animer des activités, participer à des actions de solidarité.

Il est ouvert aux jeunes de seize à vingt-cinq ans, jusqu'à trente ans en cas de handicap. Il ne demande ni diplôme, ni expérience. La mission représente au moins vingt-quatre heures par semaine.

Ce n'est ni un emploi, ni un stage : un statut à part. L'État verse une indemnité d'un peu plus de cinq cents euros par mois, et l'organisme qui vous accueille ajoute une somme pour vos repas et vos transports. Les boursiers et les personnes au RSA touchent un complément. Votre protection sociale est prise en charge.

Le service civique se combine avec des études ou un petit emploi. Il compte comme une expérience valorisable pour la suite.

Les missions sont sur le site de l'Agence du service civique. Un conseiller de la Mission locale peut aussi vous aider à en trouver une.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: jeunes] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S14 : Comprendre le cadre, contrôler le rayon « Handicap et emploi » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « handicap », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: handicap-aah-et-travail
titre: L'allocation aux adultes handicapés (AAH) et le travail
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant maximum de l'AAH, revalorisé régulièrement
- Les règles de calcul avec un salaire et pour les travailleurs en ESAT
texte:
L'allocation aux adultes handicapés, l'AAH, est un revenu minimum versé par la CAF aux personnes en situation de handicap qui ont de faibles ressources.

Pour y avoir droit, il faut un taux d'incapacité d'au moins quatre-vingts pour cent, ou de cinquante à soixante-dix-neuf pour cent avec une difficulté importante et durable pour accéder à un emploi. C'est la commission de la maison départementale des personnes handicapées qui décide, après une demande à la MDPH. Elle a quatre mois pour répondre.

Le montant maximum est d'environ mille quarante euros par mois. Vous touchez la différence entre vos ressources et ce montant. Depuis octobre 2023, les revenus de votre conjoint ne sont plus pris en compte dans ce calcul.

L'AAH n'empêche pas de travailler, au contraire. Si vous reprenez un emploi, en milieu ordinaire ou en établissement et service d'aide par le travail, une partie de votre salaire n'est pas comptée grâce à un abattement. Votre AAH baisse moins vite que votre salaire n'augmente : reprendre un travail reste avantageux.

Si vous travaillez en ESAT, la façon de déclarer vos revenus change à partir d'octobre 2026 : vous les déclarez à la CAF tous les trois mois, dans votre espace sur caf.fr ou dans l'application, au lieu d'une fois par an. Le passage se fait petit à petit, en octobre, novembre ou décembre 2026 : la CAF vous prévient par courrier ou par courriel du mois où commencer, puis quand la déclaration est ouverte.

Pour faire le point, adressez-vous à la MDPH, à un travailleur social, ou à Cap emploi si vous cherchez un emploi.
---
[fiche] id: handicap-agefiph
titre: L'AGEFIPH : les aides pour l'emploi quand on a une reconnaissance de travailleur handicapé
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants et les conditions des aides (offre révisée en octobre 2025)
- La liste des aides et des appuis spécifiques
texte:
L'AGEFIPH aide les personnes handicapées du secteur privé à chaque étape de leur parcours professionnel : se former, être recrutée, s'intégrer dans l'entreprise, créer son activité, ou garder son emploi.

Ses aides financières couvrent, par exemple, l'aménagement du poste et des situations de travail, l'aide aux déplacements, l'aide au parcours vers l'emploi, l'adaptation des situations de formation, l'aide à la création d'entreprise. Elle propose aussi des appuis spécifiques, assurés par des experts d'un type de handicap.

Ces aides ne remplacent pas les dispositifs ouverts à tous : elles viennent en complément, pour compenser les conséquences du handicap sur le travail.

Important : l'offre de l'AGEFIPH a été revue le 1er octobre 2025, puis son guide des aides a été mis à jour en janvier 2026. Les montants et les conditions ont changé. Vérifiez toujours l'aide en cours sur le site de l'AGEFIPH, ou demandez à Cap emploi, qui connaît les aides mobilisables dans votre cas.

Ce n'est pas vous qui gérez ces aides seul : elles se montent avec votre conseiller Cap emploi, votre employeur, ou l'organisme de formation, selon la situation.
---
[fiche] id: handicap-cap-emploi-emploi-accompagne
titre: Cap emploi et l'emploi accompagné : être suivi vers l'emploi et dans l'emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'articulation entre Cap emploi et France Travail
- Les conditions d'entrée dans l'emploi accompagné
texte:
Deux formes d'accompagnement existent quand on a une reconnaissance de travailleur handicapé.

Cap emploi est un réseau spécialisé, présent dans chaque département. Il accompagne à la fois vers l'emploi (bilan, projet, mise en relation avec des employeurs, aides mobilisables) et pour se maintenir en poste quand la santé se dégrade. Cap emploi travaille main dans la main avec France Travail : selon votre situation, vous êtes suivi par l'un, par l'autre, ou par les deux.

L'emploi accompagné va plus loin dans la durée. Un même référent vous suit tout au long de votre parcours, y compris une fois en poste, et intervient aussi auprès de votre employeur pour faire tenir la situation dans le temps. Il s'adresse aux personnes qui cherchent un emploi comme à celles qui en ont un mais rencontrent des difficultés.

On entre dans l'emploi accompagné sur décision de la maison départementale des personnes handicapées, ou sur orientation de Cap emploi ou de France Travail.

Pour être orienté vers la bonne formule, parlez-en à votre conseiller ou à la maison départementale des personnes handicapées.
---
[fiche] id: handicap-entreprise-adaptee-esat
titre: Travailler en entreprise adaptée ou en ESAT : quelles différences ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les passerelles entre ESAT, entreprise adaptée et milieu ordinaire
- Les droits des travailleurs d'ESAT (qui se rapprochent de ceux des salariés)
texte:
Il y a deux cadres différents, souvent confondus.

L'entreprise adaptée est une vraie entreprise, du secteur marchand. Vous y avez un contrat de travail classique, un CDI ou un CDD, un salaire au moins égal au SMIC, et les mêmes droits que dans n'importe quelle entreprise. Ce qui change, c'est que l'effectif est majoritairement composé de personnes handicapées et que les conditions de travail sont adaptées. L'entreprise adaptée aide aussi à rebondir vers un autre employeur. On y entre sur candidature, souvent avec l'appui de Cap emploi. Il existe aussi des entreprises adaptées de travail temporaire, pour des missions ponctuelles.

L'ESAT relève du secteur médico-social. Il s'adresse aux personnes dont le handicap ne permet pas de travailler en entreprise, même adaptée, même à temps partiel. Vous n'y avez pas un contrat de travail mais un contrat de soutien et d'aide par le travail, signé pour un an, avec un accompagnement médico-social en plus de l'activité. L'entrée en ESAT est décidée par la commission de la maison départementale des personnes handicapées.

Le choix entre les deux dépend de votre situation et de l'évaluation faite par la maison départementale des personnes handicapées. Des passages de l'un à l'autre, et vers une entreprise classique, sont possibles.
---
[fiche] id: handicap-inaptitude-medecine-du-travail
titre: La médecine du travail et l'inaptitude : garder son emploi, ou ce qui se passe si on ne peut plus
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les règles de la visite de reprise et de la procédure d'inaptitude
- Les indemnités en cas de licenciement pour inaptitude
texte:
Le médecin du travail suit votre santé au fil de votre carrière, à travers des visites : à l'embauche, régulières, et une visite de reprise après un arrêt long (au moins soixante jours pour une maladie ordinaire, trente jours après un accident du travail) ou après une maladie professionnelle ou un congé maternité. Depuis le 15 juin 2026, cette visite de reprise n'est plus obligatoire si une visite de pré-reprise a eu lieu dans les trente jours avant votre retour et que le médecin a conclu qu'aucun aménagement n'était nécessaire ; vous pouvez malgré tout la demander.

Son premier rôle est de vous aider à garder votre emploi. Il peut demander un aménagement de votre poste, de vos horaires, ou du matériel adapté. L'employeur doit en tenir compte.

Si votre santé ne permet plus le poste, le médecin peut vous déclarer inapte. L'employeur doit alors chercher à vous reclasser sur un autre poste adapté, en France, en suivant les préconisations du médecin. Il en est dispensé si l'avis précise que tout maintien dans un emploi nuirait gravement à votre santé, ou que vous êtes inapte à toute activité.

Vous pouvez refuser un poste de reclassement sans avoir à vous justifier : ce n'est pas une faute.

S'il n'y a pas de reclassement possible, ou si vous le refusez, l'employeur peut vous licencier pour inaptitude. Vous percevez alors l'indemnité légale de licenciement. Si l'inaptitude vient d'un accident du travail ou d'une maladie professionnelle, cette indemnité est doublée et une indemnité de préavis vous est due.

En cas de désaccord sur la procédure ou les sommes, c'est le conseil de prud'hommes qui tranche. Un point-justice peut vous renseigner avant.
---
[fiche] id: handicap-obligation-emploi-lourdeur
titre: L'obligation d'emploi et la reconnaissance de la lourdeur du handicap
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant de l'aide liée à la lourdeur du handicap
- Les règles de calcul de la contribution des employeurs
texte:
Deux mécanismes agissent en arrière-plan de l'emploi des personnes handicapées.

L'obligation d'emploi des travailleurs handicapés impose à toute entreprise d'au moins vingt salariés d'employer des personnes handicapées à hauteur de six pour cent de ses effectifs. Si elle ne le fait pas, elle verse une contribution financière, déclarée à l'Urssaf, qui sert à financer les aides de l'AGEFIPH. Pour vous, cela veut dire qu'un employeur a un intérêt concret à vous recruter : votre RQTH compte dans ce calcul.

La reconnaissance de la lourdeur du handicap concerne les situations où le handicap continue de peser fortement sur le travail, même après l'aménagement du poste : rythme plus lent, aide d'un collègue, absences répétées. Une aide financière peut alors être versée, chaque année, pour compenser. En 2026, elle est de l'ordre de six mille sept cents euros par an à temps plein, et environ le double au taux majoré. Elle est versée à l'employeur, ou au travailleur indépendant handicapé.

La demande de reconnaissance de la lourdeur du handicap se fait auprès de l'AGEFIPH, en général à l'initiative de l'employeur, avec l'appui du médecin du travail et de Cap emploi.

Vous n'avez pas à porter ces démarches seul : elles se traitent avec votre employeur et votre conseiller.
---
[fiche] id: handicap-pension-invalidite
titre: La pension d'invalidité : qui la demande, comment, selon quels critères
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants de la pension par catégorie (revalorisés chaque année)
texte:
La pension d'invalidité est un revenu de remplacement versé par la CPAM, ou la MSA pour le régime agricole, à une personne dont la capacité de travail est fortement réduite par une maladie ou un accident **d'origine non professionnelle**. Un accident du travail ou une maladie professionnelle suivent d'autres règles, plus protectrices (voir la fiche sur l'inaptitude et la médecine du travail).

Ce n'est pas la MDPH qui l'attribue : c'est le médecin-conseil de la caisse qui détermine la catégorie, selon que la personne reste capable d'exercer une activité (catégorie 1), en est incapable (catégorie 2), ou en est incapable et a en plus besoin d'une tierce personne au quotidien (catégorie 3). Elle reste compatible avec une reprise ou une poursuite d'activité, en particulier en catégorie 1.

Il faut avoir moins de soixante-deux ans, être affilié à l'Assurance maladie depuis au moins douze mois et avoir suffisamment cotisé ou travaillé sur la période récente : ce n'est pas ouvert à n'importe quel moment d'un parcours.

**Deux façons d'y arriver.** Si vous n'êtes pas en arrêt de travail, vous faites vous-même la demande (formulaire ou compte ameli/MSA). Si vous êtes en arrêt de travail, c'est souvent le service médical de la caisse qui prend l'initiative de vous contacter en fin d'arrêt, quand il constate que la capacité de travail restera durablement réduite. La réponse arrive sous deux mois à compter d'un dossier complet.

En cas de désaccord sur la catégorie retenue ou de refus, un recours amiable est possible auprès de la caisse, puis un recours devant le tribunal.
---
[fiche] id: handicap-proche-aidant
titre: Accompagner un proche en travaillant : le congé de proche aidant et l'AJPA
verifie_le: 2026-10-13
ce_qui_change_souvent:
- (non précisé)
texte:
Le congé de proche aidant permet de suspendre ou de réduire votre activité pour accompagner un proche en perte d'autonomie ou en situation de handicap : conjoint, partenaire de PACS, concubin, ascendant, descendant, ou une personne avec qui vous avez des liens étroits et stables.

Le contrat de travail est **suspendu, jamais rompu** : vous retrouvez votre poste à la fin du congé, avec votre ancienneté et vos avantages acquis.

Pendant ce congé, l'allocation journalière du proche aidant (AJPA), versée par la CAF ou la MSA, compense en partie la perte de revenu. Elle est plafonnée à 66 jours pour un même proche aidé sur l'ensemble d'une carrière, mais vous retrouvez 66 jours pour chaque nouveau proche aidé, jusqu'à quatre proches différents, soit 264 jours au maximum.

La demande se fait en deux temps : le congé auprès de votre employeur (avec un délai de prévenance, sauf urgence), et l'allocation auprès de la CAF ou de la MSA, avec un dossier médical de la personne aidée qui atteste de sa perte d'autonomie ou de son handicap.

Ce congé peut se combiner, selon la situation, avec un aménagement du temps de travail ou un passage à temps partiel : à voir avec votre employeur et, si besoin, avec un travailleur social ou la MDPH du proche aidé.
---
[fiche] id: handicap-rqth-mdph
titre: La reconnaissance de la qualité de travailleur handicapé (RQTH) : à quoi ça sert, comment la demander
verifie_le: 2026-10-13
ce_qui_change_souvent:
- La durée d'attribution et les cas d'attribution à vie
- La reconnaissance automatique pour certains jeunes
- La liste des droits ouverts
texte:
La reconnaissance de la qualité de travailleur handicapé, ou RQTH, s'adresse aux personnes dont un problème de santé réduit les possibilités de trouver ou de garder un emploi. Il n'est pas nécessaire d'avoir un handicap visible.

La demande se fait à la maison départementale des personnes handicapées de votre lieu de résidence, en ligne ou par formulaire, avec un certificat médical. C'est une commission qui décide. La reconnaissance est accordée pour une durée de un à dix ans, parfois à vie quand la situation ne peut pas s'améliorer. Entre quinze et vingt ans, si vous bénéficiez de l'allocation d'éducation de l'enfant handicapé, de la prestation de compensation du handicap ou d'un projet personnalisé de scolarisation, la RQTH est reconnue automatiquement, sans nouvelle démarche.

Ce qu'elle apporte : l'accompagnement par Cap emploi, les aides de l'AGEFIPH, la possibilité de demander un aménagement de votre poste, un accès à la fonction publique par contrat, un délai de préavis doublé en cas de licenciement (dans la limite de trois mois), et l'accès à l'emploi accompagné.

Deux points souvent mal connus. D'abord, la RQTH est confidentielle : vous n'êtes pas obligé d'en parler à votre employeur. Ensuite, elle ne change ni votre salaire, ni votre contrat. En parler à l'employeur permet toutefois de demander un aménagement et d'obtenir des aides.

Pour être conseillé sur l'opportunité de la demande et sur le dossier, adressez-vous à la maison départementale des personnes handicapées, à Cap emploi, ou à un travailleur social.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: handicap] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S15 : Comprendre le cadre, contrôler le rayon « Se former et se reconvertir » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « former », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: former-aides-moins-connues-financer-formation
titre: Des aides moins connues pour financer une formation ou une reconversion
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants et les plafonds de ressources des bourses régionales
- Les dates de dépôt des dossiers
- Le périmètre des formations concernées
texte:
La fiche « Financer une formation quand on cherche un emploi » couvre les financements de France Travail et de la Région. Quand ils ne suffisent pas et qu'il reste une partie du coût à votre charge, d'autres aides existent, moins connues. Elles se demandent presque toujours avec l'appui d'un conseiller, et la plupart passent par un dossier examiné au cas par cas.

Si vous vous formez à un métier du soin ou du social (aide-soignant, infirmier, accompagnant éducatif et social, éducateur, ambulancier), la Région Nouvelle-Aquitaine verse une bourse d'études sur critères sociaux, alignée sur les bourses de l'enseignement supérieur. Le dossier se dépose en ligne sur le site boursesanitairesociale.fr (pour une formation qui démarre au second semestre 2026, jusqu'au 26 novembre 2026). Cette bourse ne concerne pas les salariés ni les demandeurs d'emploi dont la formation est financée par France Travail ou un employeur.

Si vous vous êtes engagé dans une mission d'intérêt général (service civique, bénévolat, volontariat) et que vous avez un projet d'études, d'emploi ou de création, vous pouvez candidater à l'Institut de l'Engagement. Les personnes retenues bénéficient d'un an d'accompagnement, d'un parrain ou d'une marraine et d'un réseau. Les admissions ont lieu deux fois par an ; renseignez-vous auprès de l'Institut sur un éventuel soutien financier.

Si vous avez une reconnaissance de travailleur handicapé, l'AGEFIPH peut financer une formation courte en complément des autres dispositifs : voyez le rayon « Handicap et emploi ».

Enfin, la Fondation de la 2ème Chance aide, après une épreuve de vie, à financer une formation qualifiante ou une création d'activité : une fiche lui est consacrée dans ce rayon.
---
[fiche] id: former-compte-personnel-de-formation
titre: Le compte personnel de formation (CPF) : comment ça marche ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant crédité chaque année et le plafond
- La participation forfaitaire laissée à la charge du titulaire (150 euros en 2026)
- La liste des formations éligibles
texte:
Le compte personnel de formation, ou CPF, est un compte en euros que vous alimentez en travaillant. Il vous suit tout au long de votre vie active, même si vous changez d'employeur ou si vous êtes au chômage.

Pour un salarié à temps plein, il se remplit de 500 euros par an, jusqu'à un plafond de 5 000 euros. Ce montant est de 800 euros par an, avec un plafond de 8 000 euros, pour une personne peu qualifiée ou en situation de handicap.

Il permet de financer une formation qui débouche sur un diplôme ou un titre reconnu, un bilan de compétences, une validation des acquis de l'expérience, et le permis de conduire dans certains cas.

Depuis 2026, une participation de 150 euros reste à votre charge pour chaque formation. Vous en êtes dispensé si vous êtes demandeur d'emploi, ou si l'employeur, France Travail ou la région la prennent en charge.

Quand le compte ne suffit pas, un abondement peut le compléter. Votre conseiller ou un conseil en évolution professionnelle peut vous aider à monter ce financement.

Tout se passe sur l'application ou le site Mon compte formation, avec l'identité numérique. Vous y trouvez votre montant, vous cherchez une formation et vous vous y inscrivez directement.
---
[fiche] id: former-conseil-en-evolution-professionnelle
titre: Le conseil en évolution professionnelle : un accompagnement gratuit pour faire le point
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les opérateurs retenus dans chaque région
- Les modalités de rendez-vous (sur place, par téléphone, en visioconférence)
texte:
Le conseil en évolution professionnelle est un accompagnement gratuit, ouvert à tout le monde : salarié, demandeur d'emploi, travailleur indépendant. On y fait le point sur sa situation, on explore des pistes, on construit un plan d'action, et on identifie qui peut financer quoi.

L'interlocuteur dépend de votre situation :

- si vous êtes salarié ou indépendant du privé, c'est l'opérateur régional, dont les coordonnées sont sur le site mon-cep.org ;
- si vous êtes cadre ou jeune diplômé du supérieur, c'est l'APEC ;
- si vous avez entre 16 et 25 ans, c'est la Mission locale ;
- si vous êtes demandeur d'emploi, c'est France Travail, ou Cap emploi si vous avez une reconnaissance de travailleur handicapé.

Le conseiller est neutre : il ne vend rien et ne travaille pour aucun organisme de formation.

C'est souvent la bonne première étape avant un projet de reconversion, un projet de transition professionnelle ou une démission-reconversion, pour laquelle il est même obligatoire.

Pour prendre rendez-vous, voyez « Près de chez moi » ou le site mon-cep.org.
---
[fiche] id: former-demission-reconversion
titre: Démissionner pour se reconvertir et garder le chômage : le dispositif démission-reconversion
verifie_le: 2026-10-13
ce_qui_change_souvent:
- La durée d'activité exigée avant la démission
- Les délais entre validation, démission et inscription
- Le contrôle du projet après six mois
texte:
Normalement, démissionner ne donne pas droit au chômage. Il existe une exception : le dispositif démission-reconversion, pour un salarié en CDI qui a un projet réel et sérieux de reconversion, ou de création ou reprise d'entreprise.

Il faut justifier d'environ 1 300 jours travaillés, chez un ou plusieurs employeurs, au cours des cinq dernières années qui précèdent la démission.

L'ordre des étapes est important, et il ne faut pas démissionner avant :

1. demander un conseil en évolution professionnelle, gratuit ;
2. faire valider le caractère réel et sérieux du projet par la commission de votre région, portée par Transitions Pro ;
3. démissionner dans les six mois qui suivent cette validation ;
4. s'inscrire à France Travail.

L'allocation chômage est ensuite versée comme pour tout demandeur d'emploi, pendant et après la formation ou la création d'entreprise.

Attention : au bout de six mois, France Travail vérifie que le projet a bien avancé. S'il n'a pas été mis en œuvre sans motif valable, vous risquez de perdre quatre mois d'allocation et d'être radié de la liste des demandeurs d'emploi pendant quatre mois.

Commencez par le conseil en évolution professionnelle : c'est lui qui vous dira si le dispositif est adapté à votre situation.
---
[fiche] id: former-financer-sa-formation-demandeur-emploi
titre: Financer une formation quand on cherche un emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants de la rémunération de formation et le plafond de la rémunération de fin de formation
- Le plafond et les conditions de l'aide individuelle à la formation
- L'offre du programme régional de formation
texte:
Quand on cherche un emploi, une formation peut être financée sans qu'on ait à en avancer le coût. Plusieurs voies existent, souvent combinées, et votre conseiller France Travail en est le point de passage.

Selon votre projet :

- les actions de formation conventionnées sont des formations achetées par France Travail sur des métiers qui recrutent : vous n'avez rien à payer ;
- le conseil régional finance aussi tout un programme de formations, souvent gratuites, notamment pour les savoirs de base et les métiers en tension ;
- l'aide individuelle à la formation complète le financement quand aucune autre solution ne couvre la formation choisie, après validation de votre conseiller.

Votre compte personnel de formation reste mobilisable : inscrit à France Travail, vous ne payez pas la participation de 150 euros, et un abondement peut compléter le montant.

Pendant la formation, vous continuez à être payé. Si vous touchez l'allocation chômage, elle est maintenue le temps de la formation. Si vous n'êtes pas, ou plus, indemnisé, la rémunération de formation de France Travail prend le relais : un montant forfaitaire mensuel, plus élevé à partir de vingt-six ans.

Parlez de votre projet à votre conseiller le plus tôt possible : le montage du financement prend du temps.
---
[fiche] id: former-fondation-deuxieme-chance
titre: La Fondation de la 2ème Chance : un coup de pouce après une épreuve de vie
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant maximum de l'aide
- Les bornes d'âge
- La liste des structures qui peuvent accompagner le montage du dossier
texte:
La Fondation de la 2ème Chance aide des personnes qui ont traversé de lourdes épreuves (accident, maladie, rupture, précarité) et qui se retrouvent aujourd'hui en difficulté, mais avec un projet concret pour rebondir.

L'aide peut financer une formation qualifiante, jusqu'à 5 000 euros, ou la création ou la reprise d'une entreprise, jusqu'à 8 000 euros. Dans les deux cas, elle s'accompagne d'un parrainage par un bénévole. En pratique, l'aide moyenne se situe autour de 2 500 à 3 500 euros.

Trois conditions comptent. Avoir entre 18 et 62 ans. Être en situation de précarité au moment de la demande. Et ne pas être seul : le dossier se prépare avec une structure qui vous accompagne, une mission locale, France Travail, un centre communal d'action sociale, une chambre de métiers, une association spécialisée.

C'est une aide de dernier recours : il faut avoir cherché les autres financements d'abord. Elle vient en complément, quand il manque une somme pour boucler le projet.

Le parcours : vous envoyez votre dossier, la Fondation l'étudie, puis une équipe locale vous rencontre pour que vous présentiez votre projet, et un comité décide de l'accompagnement. Comptez plusieurs semaines. La Fondation intervient en France métropolitaine.
---
[fiche] id: former-projet-de-transition-professionnelle
titre: Le projet de transition professionnelle : se former pour changer de métier en gardant son salaire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les conditions d'ancienneté
- Les pourcentages de maintien de la rémunération et les plafonds
- Les délais de demande d'autorisation d'absence
texte:
Le projet de transition professionnelle, ancien congé individuel de formation, permet à un salarié de s'absenter pour suivre une formation qui débouche sur un diplôme ou un titre, dans le but de changer de métier. Pendant ce temps, le contrat de travail continue et une rémunération est versée.

Pour un salarié en CDI, il faut avoir 24 mois d'activité salariée, dont 12 mois dans l'entreprise actuelle. Des règles particulières existent pour les CDD.

Le projet est présenté à l'association Transitions Pro de votre région, qui l'examine en commission et décide de le financer ou non. Il faut donc un projet préparé : formation cohérente, débouché réaliste.

La rémunération pendant la formation dépend de votre salaire : elle est maintenue à 100 % si votre salaire moyen est modeste, et réduite au-delà, avec un plancher.

Côté employeur, vous demandez une autorisation d'absence plusieurs mois avant le début (au moins cent vingt jours pour une formation longue). L'employeur peut la reporter, mais pas la refuser si les conditions sont réunies.

Un conseil en évolution professionnelle vous aide à construire le dossier. Pour votre situation exacte, l'interlocuteur est Transitions Pro.
---
[fiche] id: former-se-former-avant-l-embauche
titre: Se former avant d'être embauché : la POEI et la POEC
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant de la rémunération de formation de France Travail
- La durée maximale de la POEC
- Les métiers et branches couverts par les POEC
texte:
Il est possible de se former juste avant de prendre un poste, quand il vous manque quelques compétences.

La préparation opérationnelle à l'emploi individuelle fonctionne quand un employeur a déposé une offre à France Travail et qu'il est prêt à vous embaucher si vous êtes formé. France Travail finance alors la formation qui vous manque, dans l'entreprise, dans un organisme, ou les deux. Depuis 2024, l'ancienne aide appelée AFPR est intégrée à ce dispositif.

La préparation opérationnelle à l'emploi collective est organisée par une branche professionnelle pour former plusieurs personnes à la fois, sur des métiers qui recrutent. Elle dure jusqu'à 400 heures.

Pendant la formation, si vous n'êtes pas indemnisé par l'assurance chômage, vous percevez la rémunération de formation de France Travail.

Ces formations passent toujours par un conseiller France Travail : c'est avec lui qu'on repère l'offre, qu'on monte le dossier et qu'on choisit l'organisme. Parlez-en dès qu'un poste vous intéresse.
---
[fiche] id: former-validation-des-acquis-vae
titre: La validation des acquis de l'expérience (VAE) : faire reconnaître ce qu'on sait déjà faire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les conditions d'expérience exigées
- Les modalités d'accompagnement et de financement
- La liste des certifications accessibles par la VAE
texte:
La validation des acquis de l'expérience permet d'obtenir un diplôme, un titre ou un certificat reconnu grâce à ce que vous avez appris en travaillant, sans repasser toute la formation.

Elle est ouverte à tout le monde, quel que soit votre statut, votre âge ou votre niveau d'études. Depuis la réforme de 2023-2024, il n'y a plus de durée d'expérience minimale : il faut seulement que votre expérience ait un lien direct avec la certification visée.

La démarche se fait sur le portail France VAE, en plusieurs étapes : vous déposez votre candidature, vous pouvez être accompagné, on vérifie que votre dossier est recevable, vous écrivez un dossier qui décrit votre expérience, puis vous passez devant un jury.

Le financement peut venir du compte personnel de formation, de l'employeur, ou d'un forfait de l'association Transitions Pro. Si vous êtes salarié, vous avez droit à 48 heures de congé payé par session, à demander à l'employeur 30 jours avant.

Un point relais conseil ou un conseil en évolution professionnelle peut vous aider à choisir la bonne certification et à démarrer. C'est souvent la première chose à faire.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: former] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S16 : Comprendre le cadre, contrôler le rayon « Créer son activité » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « creer », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: creer-aides-a-la-creation
titre: Créer son activité en gardant un filet : ACRE, ARE, ARCE, RSA
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les modalités de demande de l'ACRE (plus automatique depuis 2026)
- Le plafonnement du cumul ARE et revenus d'entreprise
- Le pourcentage des droits versé au titre de l'ARCE
texte:
Créer une activité quand on a peu de revenus fait peur, à juste titre. Plusieurs dispositifs limitent le risque.

L'ACRE réduit vos cotisations sociales la première année. Pour les micro-entreprises créées à partir du 1er juillet 2026, elle les abaisse d'un quart, au lieu de la moitié auparavant. Elle n'est pas automatique : il faut la demander à l'URSSAF dans les soixante jours qui suivent le début de l'activité. Elle est réservée à certaines situations : par exemple les personnes au RSA, les demandeurs d'emploi inscrits depuis plus de six mois, les jeunes de moins de trente ans qui ne touchent pas le chômage, ou les créateurs installés en quartier prioritaire. La liste complète est sur le site de l'URSSAF.

Ensuite, deux options s'excluent l'une l'autre, si vous avez des droits au chômage.

Le maintien de l'ARE : vous continuez à toucher une partie de votre allocation chaque mois, en fonction de ce que vous gagnez avec l'entreprise. Ce cumul est plafonné à 60 pour cent de vos droits restants au moment de la création.

L'ARCE : au lieu de l'allocation mensuelle, vous recevez une partie de vos droits restants en une somme, versée en deux fois, au démarrage puis six mois après. C'est un vrai coup de pouce à la trésorerie, mais elle est imposable.

Si vous êtes au RSA, vous pouvez créer une activité et continuer à le percevoir : il est recalculé chaque trimestre selon vos revenus déclarés, puis la prime d'activité prend le relais.

Le bon réflexe : voir un conseiller France Travail AVANT de créer. C'est lui qui calcule ce qui est le plus avantageux dans votre cas.
---
[fiche] id: creer-cooperative-activite-emploi
titre: La coopérative d'activité et d'emploi : tester son activité en gardant un statut de salarié
verifie_le: 2026-10-13
ce_qui_change_souvent:
- La durée du contrat d'appui au projet d'entreprise
- Le taux de la contribution versée à la coopérative
texte:
La coopérative d'activité et d'emploi est une autre façon de se mettre à son compte : au lieu de créer une entreprise seul, vous devenez entrepreneur au sein d'une coopérative, avec un contrat de travail.

Cela se fait en deux temps.

D'abord une phase de test, avec un contrat d'appui au projet d'entreprise. Vous n'avez pas d'entreprise à créer : vous facturez vos clients avec le numéro de la coopérative, et vous êtes accompagné. Cette phase peut durer jusqu'à trois ans. Pendant ce temps, vous pouvez garder vos allocations, chômage ou RSA.

Ensuite, quand votre activité est suffisante, vous signez un contrat à durée indéterminée avec la coopérative. Vous vous versez un salaire à partir de votre chiffre d'affaires, et vous avez tous les droits d'un salarié : congés payés, assurance chômage, retraite, maladie. Vous devenez ensuite associé de la coopérative.

Le coût : les cotisations sur votre salaire, et une contribution à la coopérative, en général de huit à quinze pour cent de votre chiffre d'affaires, qui paie la comptabilité, l'assurance et l'accompagnement mutualisés.

Cette formule convient à qui veut se lancer sans tout risquer d'un coup. On y entre après une réunion d'information et un entretien. Les coopératives de votre territoire sont dans « Près de chez moi ».
---
[fiche] id: creer-micro-entreprise-ou-societe
titre: Micro-entreprise ou société : comment choisir ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les plafonds de chiffre d'affaires de la micro-entreprise
- Les taux de cotisations et le régime social des dirigeants
- Les seuils de franchise de TVA
texte:
Avant de créer, il faut choisir une forme. Les deux grandes options pour une personne seule sont la micro-entreprise et la société.

La micro-entreprise est la plus simple. C'est une entreprise individuelle avec un calcul allégé : vos cotisations et votre impôt sont un pourcentage de votre chiffre d'affaires, que vous déclarez chaque mois ou chaque trimestre. Pas de capital, pas de comptabilité lourde. En échange, votre chiffre d'affaires ne doit pas dépasser un plafond. Depuis la loi de 2022, votre patrimoine personnel est protégé, séparé de votre patrimoine professionnel.

Une société, comme l'EURL ou la SASU, crée une entité juridique séparée de vous. Votre responsabilité est limitée à ce que vous avez apporté, vous pouvez vous associer plus tard, et vous déduisez vos charges réelles. Mais il faut un capital, des statuts, une comptabilité complète, et cela coûte à créer et à gérer chaque année. Selon la société, votre protection sociale et vos cotisations changent.

Le bon choix dépend du niveau d'activité prévu, de la nature du projet, de votre besoin de vous associer, et du régime social que vous préférez.

Ne décidez pas seul : un conseiller de la chambre de métiers, de la chambre de commerce, ou d'un réseau d'accompagnement peut comparer les options avec vos chiffres.
---
[fiche] id: creer-premieres-demarches
titre: Les premières démarches : le guichet unique, l'immatriculation, le SIRET
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le fonctionnement du guichet unique et des registres
- Les pièces demandées selon l'activité
- Les obligations de compte bancaire dédié et de déclaration de TVA
texte:
Créer officiellement une entreprise passe aujourd'hui par un seul site : le guichet unique des formalités des entreprises, géré par l'Institut national de la propriété industrielle. C'est obligatoire, quelle que soit la forme de l'entreprise.

Vous y déclarez votre activité, votre adresse, le régime choisi, et vous joignez les pièces demandées : pièce d'identité, justificatif de domicile, et selon le métier, une qualification ou une autorisation.

Vous n'avez rien à demander pour vos numéros. Le SIREN, qui identifie l'entreprise, et le SIRET, qui identifie l'établissement, vous sont attribués automatiquement dès que la création est acceptée. Votre entreprise est alors inscrite au registre national des entreprises.

Ensuite viennent les premières obligations : ouvrir un compte bancaire réservé à l'activité (obligatoire pour un micro-entrepreneur au-delà d'un certain chiffre d'affaires), déclarer et payer ses cotisations aux échéances, tenir un suivi de ses recettes, et selon le régime, déclarer la TVA.

Ces démarches paraissent techniques, mais un conseiller de la chambre de métiers, de la chambre de commerce, ou d'un réseau d'accompagnement peut les faire avec vous, gratuitement.
---
[fiche] id: creer-regime-micro-au-quotidien
titre: Le régime micro-entrepreneur au quotidien : chiffre d'affaires, cotisations, plafonds
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les plafonds de chiffre d'affaires et les seuils de TVA
- Les taux de cotisations sociales et l'exonération ACRE de la première année (réduite depuis juillet 2026)
- Le plafond de revenu fiscal pour le versement libératoire
texte:
Le régime micro-entrepreneur est simple, mais il a ses règles.

Le chiffre d'affaires se déclare chaque mois ou chaque trimestre, même quand il est nul. Deux ans sans aucun chiffre d'affaires entraînent la fermeture automatique de l'activité.

Les cotisations sociales sont un pourcentage de ce que vous encaissez, qui dépend de votre activité. Depuis le 1er juillet 2026, l'exonération de cotisations de la première année (l'ACRE) est plus faible : elle abaisse les cotisations d'un quart, au lieu de la moitié auparavant. Vérifiez le taux en cours sur le site de l'URSSAF.

La franchise de TVA vous dispense de facturer la TVA tant que vous restez sous des seuils de chiffre d'affaires. Au-delà, vous devez la facturer à vos clients et la reverser. Les seuils changent régulièrement : à vérifier avant de fixer vos prix.

Le versement libératoire est une option : vous payez l'impôt sur le revenu en même temps que vos cotisations, à un taux fixe. Il faut avoir un revenu fiscal sous un plafond.

Si votre chiffre d'affaires dépasse le plafond du régime micro deux années de suite, vous basculez au régime réel, avec une comptabilité complète. Mieux vaut l'anticiper avec un comptable.

Pour toute question, l'URSSAF, la chambre de métiers ou la chambre de commerce répondent gratuitement.
---
[fiche] id: creer-s-installer-en-agriculture
titre: S'installer en agriculture : créer ou reprendre une exploitation
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants de la DNJA et ses modulations (zone, installation hors cadre familial, agriculture biologique)
- La condition d'âge de la DNJA
- L'organisation du BPREA (durée, présentiel ou distance, centres)
texte:
Devenir agriculteur, ce n'est pas seulement une envie de métier : c'est créer ou reprendre une entreprise, avec ses règles propres. En Dordogne, où l'agriculture pèse lourd, tout un réseau existe pour accompagner ce projet. Cette fiche décrit le parcours en Nouvelle-Aquitaine ; les grandes étapes sont les mêmes partout, mais l'aide financière à l'installation dépend de la région.

Le premier réflexe : le Point Accueil Installation Transmission, souvent abrégé en PAIT, à la chambre d'agriculture de votre département. Le rendez-vous est gratuit, sans engagement, et ne juge pas le projet : on vous explique les étapes, les contacts, les aides, et on vous oriente. Si vous cherchez une ferme à reprendre, ce point d'accueil tient aussi le répertoire des exploitations disponibles.

Pour s'installer avec les aides publiques, il faut la capacité professionnelle agricole. Elle s'obtient avec un diplôme agricole de niveau bac au minimum. Pour une reconversion, le diplôme le plus courant est le BPREA : une formation continue, souvent d'un an, en centre de formation agricole ou à distance, organisée en blocs que l'on peut valider un par un. Elle prépare directement à l'installation.

Vient ensuite un parcours personnalisé, le plan de professionnalisation, mis au point avec un conseiller. Il peut prévoir des stages, des compléments de formation, une immersion chez un exploitant.

Côté argent, la Dotation Nouveaux et Jeunes Agriculteurs est une aide versée en capital au moment de l'installation, pour les personnes de 18 à 54 ans, financée par la Région Nouvelle-Aquitaine et l'Europe. Son montant dépend de la zone, de la taille du projet, et de plusieurs situations qui l'augmentent, comme une installation hors du cadre familial ou en agriculture biologique. La demande se fait après le passage par le Point Accueil et le plan de professionnalisation.

Enfin, l'agriculture a ses formes juridiques : exploitation individuelle, GAEC, EARL. Et son régime social propre, la MSA, à la place de l'URSSAF. Pour le choix du statut, voyez aussi la fiche « Micro-entreprise ou société : comment choisir ? », les principes sont proches.
---
[fiche] id: creer-se-faire-accompagner
titre: Se faire accompagner et financer son projet de création
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants et conditions des prêts d'honneur et du microcrédit professionnel
- Les réseaux présents sur chaque territoire
texte:
On ne crée pas seul dans son coin. Un projet accompagné réussit beaucoup plus souvent.

Pour l'accompagnement, deux portes d'entrée selon l'activité : la chambre de métiers et de l'artisanat pour un métier artisanal, la chambre de commerce et d'industrie pour le commerce et les services. Elles informent, forment, et aident à monter le dossier.

Des réseaux associatifs, souvent gratuits, sont particulièrement adaptés aux personnes éloignées de l'emploi. BGE accompagne de l'idée au démarrage et au-delà. L'ADIE prête jusqu'à quinze mille euros aux personnes que les banques refusent, avec un suivi. Initiative France accorde un prêt d'honneur à taux zéro, sans garantie, qui renforce votre apport et rassure la banque, avec un parrainage par un chef d'entreprise. France Active garantit une partie d'un prêt bancaire et propose du financement solidaire.

Le site Bpifrance Création rassemble l'information et un annuaire de ces structures.

Le microcrédit personnel accompagné, présenté au rayon budget, peut aussi financer un petit équipement de départ.

Pour trouver l'interlocuteur le plus proche, voyez « Près de chez moi » ou parlez-en à votre conseiller France Travail, qui peut vous orienter vers un accompagnement à la création.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: creer] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S17 : Comprendre le cadre, contrôler le rayon « Employeurs et entrepreneurs » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « employeurs », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: employeurs-aides-a-embauche
titre: Les aides financières pour recruter
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le montant de l'aide à l'embauche d'un apprenti, ses conditions et sa durée : renouvelés chaque année par décret
texte:
À l'inverse des seules obligations et contraintes, des aides financières existent pour certains employeurs qui embauchent - un pan souvent moins connu que les démarches à accomplir.

L'aide à l'embauche d'un apprenti en est un exemple : une somme versée à l'employeur, modulée selon la taille de l'entreprise et le niveau de qualification visé par le contrat. Pour un contrat signé depuis le 8 mars 2026, elle va jusqu'à 5 000 € dans une entreprise de moins de 250 salariés (6 000 € pour un apprenti en situation de handicap), et nettement moins dans une grande entreprise. Elle est renouvelée chaque année par décret : son montant et ses conditions exactes changent, à vérifier au moment de la demande plutôt que de se fier à un chiffre déjà ancien.

D'autres aides existent pour l'embauche d'un travailleur reconnu handicapé (détaillées côté Agefiph, dans le rayon Handicap et emploi), ou pour l'embauche dans certaines zones du territoire, comme les quartiers prioritaires de la politique de la ville ou les zones France Ruralités Revitalisation (détaillées côté bénéficiaire dans le Lexique et le rayon Emploi).

Point commun à toutes ces aides : ce sont des dispositifs qui évoluent souvent, dans leur montant comme dans leurs conditions. Se renseigner directement auprès de France Travail, employeur, ou de l'Urssaf avant de s'engager reste le seul moyen d'avoir un chiffre à jour.
---
[fiche] id: employeurs-clause-sociale-marche-public
titre: Gagner un marché public avec une clause sociale : ce que l'entreprise doit faire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le seuil de marché à partir duquel la clause sociale est obligatoire (relevé par la loi Climat et résilience à compter du 22 août 2026)
- Le montant des pénalités en cas de non-respect, fixé au cas par cas par les documents du marché
texte:
Quand une entreprise remporte un marché public (un chantier, un contrat d'entretien, une prestation de services) qui comporte une clause sociale, elle s'engage contractuellement à réserver une partie des heures de travail générées par ce marché à des personnes éloignées de l'emploi : demandeurs d'emploi de longue durée, personnes en situation de handicap, jeunes de moins de 26 ans, bénéficiaires de minima sociaux, entre autres.

C'est le maître d'ouvrage - la collectivité ou l'organisme qui commande le marché - qui fixe cette clause dans le contrat, souvent avec l'appui d'un facilitateur de la clause sociale, qui aide aussi l'entreprise à trouver les bonnes personnes et les bonnes structures d'insertion pour honorer son engagement.

L'exécution de la clause fait l'objet d'un suivi : des réunions périodiques avec le facilitateur, qui vérifie le volume d'heures réellement réalisé. Ne pas s'y présenter sans justification, après mise en demeure restée sans réponse, peut entraîner une pénalité financière - son montant est fixé au cas par cas par les documents du marché, jamais par une règle nationale unique.

Depuis le 22 août 2026, la clause sociale est devenue obligatoire pour les marchés publics les plus importants (procédure formalisée), sauf exemption justifiée : le nombre de marchés concernés par cette obligation augmente.

Pour une entreprise, remplir une clause sociale n'est donc pas seulement une contrainte administrative : c'est un vrai canal de recrutement, avec un accompagnement dédié pour trouver les bonnes personnes.
---
[fiche] id: employeurs-cout-du-travail
titre: Le coût réel d'un salarié pour l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le seuil de salaire jusqu'auquel la réduction s'applique (relevé à trois Smic au 1er janvier 2026)
- Le mode de calcul exact de la réduction
texte:
Le coût réel d'un salarié pour l'employeur dépasse toujours le salaire brut visible sur le bulletin : il faut y ajouter les cotisations sociales que l'employeur paie en plus, jamais visibles pour la personne salariée.

Ce coût est dû dès le premier jour et pour toute la durée du contrat, que la personne recrutée soit tout de suite pleinement opérationnelle ou qu'elle ait besoin d'un temps d'adaptation : c'est un engagement financier qui commence avant que le travail produit en retour soit certain. Dans une petite structure, ce poids se répartit sur moins de monde - une embauche qui ne fonctionne pas comme prévu a mécaniquement plus de conséquences visibles que dans une grande entreprise, où elle se dilue davantage.

Un mécanisme d'allègement existe : la réduction générale dégressive des cotisations patronales : elle est la plus forte au niveau du Smic et diminue à mesure que le salaire augmente. Depuis le 1er janvier 2026, elle s'applique jusqu'à trois fois le Smic, contre 1,6 fois auparavant. Son seuil est un paramètre qui bouge, à ne jamais considérer comme figé.

C'est aussi ce qui explique, structurellement, pourquoi le temps passé à recruter - trier les candidatures, recevoir, se décider - est vécu par un employeur comme un investissement à ne pas rater, plutôt qu'une simple formalité.
---
[fiche] id: employeurs-devenir-employeur
titre: Devenir employeur pour la première fois : simplifier les démarches
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le périmètre exact des employeurs éligibles au Tese
- Les contrats couverts par le Tesa+ et le Tesa simplifié (agricole)
texte:
Embaucher pour la première fois représente une charge administrative réelle : déclaration préalable, bulletin de paie, calcul des cotisations, déclarations mensuelles. Des outils existent pour l'alléger, sans supprimer les obligations elles-mêmes.

Le titre emploi-service entreprise (Tese), géré par l'Urssaf, est gratuit. Il prend en charge l'ensemble des démarches déclaratives, établit les bulletins de paie, calcule les cotisations et taxes dues, et gère le prélèvement à la source. Il accepte tous les types de contrat (CDI, CDD, apprentissage). Depuis le 1er janvier 2026, l'employeur peut y déclarer seulement une partie de ses salariés et confier les autres à un tiers déclarant ; auparavant, c'était tous ou aucun.

Pour les associations, le chèque emploi associatif fonctionne sur le même principe.

Dans l'agriculture, la MSA propose deux services en ligne : le Tesa simplifié, pour les contrats à durée déterminée de trois mois au plus (saisonniers, remplacements, vendanges), et le Tesa+, pensé pour les petites exploitations sans logiciel de paie, qui couvre aussi les CDI. Ils remplacent l'ancien titre emploi simplifié agricole. Les conditions précises se lisent sur le site de la MSA.

Ces outils sont utiles en particulier pour une structure qui embauche pour la première fois, ou qui n'a pas les moyens d'un service de paie interne. Ils réduisent le temps passé sur les formalités, pas le coût du salarié lui-même.
---
[fiche] id: employeurs-egalite-professionnelle
titre: L'index de l'égalité professionnelle entre femmes et hommes
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le détail du calcul de chaque indicateur
texte:
Toute entreprise d'au moins 50 salariés doit calculer chaque année un index de l'égalité professionnelle entre les femmes et les hommes, une note sur 100 points, et la publier avant le 1er mars.

Cet index s'appuie sur plusieurs indicateurs : l'écart de rémunération entre femmes et hommes (celui qui pèse le plus dans la note), l'écart dans les augmentations, les augmentations au retour de congé maternité, la part de femmes parmi les dix salaires les plus élevés, et l'écart dans les promotions.

Une entreprise qui obtient une note inférieure à 75 points sur 100 doit mettre en place des mesures correctives, avec un délai de trois ans pour progresser. Le résultat et le détail des indicateurs sont aussi communiqués au comité social et économique et à l'inspection du travail.

Une refonte de l'index est en préparation pour appliquer une directive européenne sur la transparence des salaires : le projet de loi, présenté en septembre 2026, n'est pas encore voté.

Pour un employeur, cet index rend visible, chiffre à l'appui, une situation qui reste sinon difficile à objectiver : ce n'est pas une contrainte isolée, mais un outil de pilotage que la loi impose de rendre public.
---
[fiche] id: employeurs-licenciement-procedure
titre: Se séparer d'un salarié : une décision encadrée pour l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le barème des indemnités en cas de litige
texte:
Une fois la période d'essai terminée, un employeur ne peut pas mettre fin à un CDI librement. Il doit avoir un motif réel et sérieux - un fait précis et vérifiable, pas une impression - et suivre une procédure obligatoire : convocation à un entretien préalable, entretien, puis notification écrite du licenciement avec son motif.

Si la personne saisit le conseil de prud'hommes et que le motif est jugé insuffisant ou la procédure irrégulière, le licenciement peut être requalifié « sans cause réelle et sérieuse ». L'employeur doit alors verser des indemnités supplémentaires, en plus de celles déjà dues à la fin de tout contrat (indemnité de licenciement, congés payés non pris). C'est un vrai risque juridique et financier pour l'employeur, pas une formalité symbolique.

Cette difficulté réelle à se séparer d'un salarié, une fois l'essai passé, est une des raisons structurelles pour lesquelles une embauche est un choix pesé avec soin - ce n'est pas la même chose que dire qu'une personne doit se sentir jugée ou insuffisante si elle n'est pas retenue à l'embauche. La prudence à l'embauche existe même quand tout se passe bien dans un poste ; elle ne mesure rien sur la valeur d'une personne.
---
[fiche] id: employeurs-mutuelle-obligatoire
titre: La complémentaire santé (mutuelle) : une obligation pour l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le contenu exact du panier de soins minimal
- Les cas de dispense d'adhésion pour le salarié
texte:
Depuis 2016, tout employeur du secteur privé a l'obligation de proposer à ses salariés une complémentaire santé collective (une « mutuelle d'entreprise »), avec un panier de soins minimal fixé par la loi. Ce n'est pas une option ni un avantage que l'employeur choisit librement d'accorder : c'est une obligation légale.

L'employeur doit financer au moins la moitié de la cotisation. Le salarié peut, dans certains cas précis, être dispensé d'y adhérer - par exemple s'il bénéficie déjà d'une couverture par ailleurs.

La prévoyance complémentaire (qui couvre l'incapacité, l'invalidité ou le décès) suit une logique différente : elle est obligatoire pour les cadres, avec une cotisation spécifique à la charge de l'employeur, mais pas systématiquement pour les autres salariés - c'est alors la convention collective de la branche qui décide si elle s'impose ou reste facultative.

Pour un employeur, ces deux obligations s'ajoutent au coût déjà présenté dans la fiche « Le coût réel d'un salarié » : elles font partie du coût total d'une embauche, au-delà du seul salaire chargé.
---
[fiche] id: employeurs-obligations-embauche
titre: Les obligations de l'employeur à l'embauche
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le contenu exact de la DPAE et les formalités qu'elle regroupe
- Les modalités de la visite médicale selon le secteur et le poste
texte:
Avant même qu'une personne commence à travailler, l'employeur doit accomplir plusieurs démarches obligatoires, quelle que soit la taille de l'entreprise.

La déclaration préalable à l'embauche (DPAE) est la principale. L'employeur l'adresse à l'Urssaf avant le premier jour de travail du salarié. En une seule déclaration, elle déclenche plusieurs formalités : l'immatriculation à la Sécurité sociale et l'affiliation à un service de santé au travail, qui organisera la visite médicale.

L'employeur doit aussi inscrire la personne au registre unique du personnel (identité, poste, date d'entrée), l'informer des éléments essentiels de son contrat dès le début de la relation de travail, et, si elle est étrangère, vérifier au préalable qu'elle dispose d'une autorisation de travail valide.

Ne pas respecter ces obligations, en particulier l'absence de DPAE, expose l'employeur à des sanctions pénales pour travail illégal : ce n'est pas une formalité facultative. Des dispositifs existent pour l'alléger dans les petites structures - voir la fiche « Devenir employeur pour la première fois ».
---
[fiche] id: employeurs-obligations-sante-securite
titre: Les obligations de sécurité et de formation de l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les modalités de conservation et de transmission du DUERP
texte:
Dès l'embauche du premier salarié, l'employeur doit établir un document unique d'évaluation des risques professionnels (DUERP). Il recense les risques identifiés dans l'entreprise pour la santé et la sécurité des salariés, et doit être mis à jour régulièrement - à chaque changement important dans l'organisation du travail, ou au minimum chaque année dans les entreprises d'une certaine taille.

Son absence, ou le fait de ne pas le tenir à jour, expose l'employeur à une sanction pénale (contravention de 5e classe), en plus du risque réel que représente un accident du travail non anticipé.

Au-delà du DUERP, l'employeur a une obligation générale d'adapter le poste à la personne et de veiller au maintien de sa capacité à occuper un emploi, notamment par la formation. C'est une obligation qui dure tout au long du contrat, pas seulement au moment de l'embauche.

Un service de prévention et de santé au travail interentreprises accompagne l'employeur sur ces sujets : visites médicales, conseils d'adaptation du poste, évaluation des risques.
---
[fiche] id: employeurs-periode-essai
titre: La période d'essai, du point de vue de l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les durées maximales selon les conventions collectives
texte:
Pour l'employeur, la période d'essai est le seul moment où il peut mettre fin au contrat sans suivre la procédure de licenciement : pas d'entretien préalable obligatoire, pas d'indemnité de licenciement.

Sa durée maximale dépend de la catégorie du poste : deux mois pour un employé ou un ouvrier, trois mois pour un agent de maîtrise ou un technicien, quatre mois pour un cadre. Elle peut être renouvelée une fois si un accord de branche le prévoit, avec l'accord écrit du salarié, jusqu'à quatre, six ou huit mois au total.

C'est souvent ce qui rend un employeur plus enclin à tenter une embauche dans le doute : la période d'essai sert de filet de sécurité pour les deux parties, pas seulement pour la personne recrutée.

Cette liberté n'est pas totale. Une rupture de période d'essai peut être jugée abusive par le conseil de prud'hommes si son motif n'a aucun lien avec les compétences ou la manière de travailler de la personne - un motif discriminatoire, par exemple. Un délai de prévenance (un préavis court) s'applique aussi dès que la personne a un peu d'ancienneté dans l'entreprise, même pendant l'essai.
---
[fiche] id: employeurs-seuils-representation-personnel
titre: Les obligations qui grandissent avec la taille de l'entreprise : CSE et délégué syndical
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le nombre exact de représentants élus selon la taille de l'entreprise
- Les conditions de la dérogation pour désigner un délégué syndical entre 11 et 50 salariés
texte:
Les obligations d'un employeur en matière de représentation du personnel ne sont pas figées : elles augmentent avec la taille de l'entreprise.

Le comité social et économique (CSE) devient obligatoire dès que l'entreprise atteint 11 salariés, à condition que ce seuil soit maintenu pendant 12 mois consécutifs. Le nombre de représentants élus dépend ensuite de l'effectif : par exemple, un titulaire et un suppléant entre 11 et 24 salariés, deux de chaque entre 25 et 49.

La désignation d'un délégué syndical, chargé de négocier au nom d'un syndicat avec l'employeur, n'est en principe possible qu'à partir de 50 salariés. Une dérogation existe pour les entreprises plus petites (11 à 49 salariés) : un syndicat peut, sous certaines conditions, désigner un élu du CSE comme délégué syndical.

Pour un employeur qui recrute et voit son entreprise grandir, ces seuils ne sont pas de simples chiffres administratifs : ils changent concrètement le fonctionnement du dialogue social dans l'entreprise, et leur dépassement déclenche des obligations nouvelles qu'il faut anticiper.
---
[fiche] id: employeurs-suivi-medical
titre: Le suivi médical du salarié, au-delà de l'embauche
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La périodicité exacte de renouvellement selon le poste et les risques identifiés
texte:
L'obligation de l'employeur en matière de santé au travail ne s'arrête pas à la visite médicale d'embauche : c'est un suivi qui dure tout le contrat.

La visite d'information et de prévention (VIP) doit avoir lieu dans les trois mois qui suivent la prise de poste. Elle est ensuite renouvelée périodiquement - en général tous les quatre ans, avec une visite intermédiaire à deux ans - organisée par le service de prévention et de santé au travail dont dépend l'employeur.

Après un arrêt de travail long, un accident du travail ou un congé maternité, une visite de reprise est obligatoire : elle doit avoir lieu dans les jours qui suivent le retour du salarié. Elle vérifie que le poste reste compatible avec son état de santé, et peut déboucher sur des aménagements. Avant même la reprise, une visite de pré-reprise peut être organisée à l'initiative du salarié, du médecin traitant ou du médecin-conseil, pour préparer ce retour.

Depuis le 15 juin 2026, pour les arrêts de travail délivrés à partir de cette date, la visite de reprise n'est plus obligatoire dans un cas précis : le salarié a passé une visite de pré-reprise dans les trente jours avant son retour, et le médecin du travail a conclu qu'aucun aménagement du poste ni du temps de travail n'était nécessaire. L'employeur, le médecin du travail ou le salarié peuvent malgré tout la demander. Le service de prévention et de santé au travail informe désormais l'employeur de la visite de pré-reprise, sauf si le salarié s'y oppose.

Pour l'employeur, ce suivi n'est pas une simple formalité administrative : il fait partie de son obligation générale de sécurité envers ses salariés, au même titre que le document unique d'évaluation des risques.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: employeurs] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S18 : Comprendre le cadre, contrôler le rayon « Accompagnement et structures de l'insertion » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « accompagnement », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: accompagnement-a-qui-m-adresser
titre: Qui accompagne vers l'emploi : le bon interlocuteur selon ma situation
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les règles d'orientation depuis la loi pour le plein emploi
- Le partage des publics entre France Travail et le département
texte:
Depuis la loi pour le plein emploi, toute personne sans emploi qui cherche du travail est inscrite à France Travail : cela vaut aussi pour les bénéficiaires du RSA et les jeunes suivis par la Mission locale.

Être inscrit ne veut pas dire être suivi par un conseiller France Travail. Après un premier point sur votre situation, vous êtes orienté, dans les six semaines, vers la structure la plus adaptée.

France Travail accompagne la plupart des demandeurs d'emploi : diagnostic, plan d'action, offres, formations, aides.

La Mission locale accompagne les jeunes de seize à vingt-cinq ans sortis de l'école, sur l'emploi et la formation, mais aussi le logement, la santé, la mobilité, le budget.

Cap emploi accompagne les personnes qui ont une reconnaissance de travailleur handicapé, vers l'emploi et pour se maintenir dans un emploi.

Le conseil départemental accompagne certains allocataires du RSA, quand des difficultés sociales passent avant la recherche d'emploi, avec un travailleur social.

L'APEC accompagne les cadres et les jeunes diplômés de l'enseignement supérieur.

Si vous ne savez pas où vous en êtes, commencez par vous inscrire à France Travail : le diagnostic déterminera votre interlocuteur.
---
[fiche] id: accompagnement-clause-sociale-plie
titre: La clause sociale des marchés publics et le plan local pour l'insertion et l'emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les marchés concernés par des clauses sur un territoire
- Le périmètre et les moyens des PLIE
- Le seuil à partir duquel la clause sociale est obligatoire
texte:
Quand une collectivité passe un marché public (un chantier, l'entretien d'espaces verts, la propreté), elle peut y ajouter une clause sociale : l'entreprise qui gagne le marché doit réserver un certain nombre d'heures de travail à des personnes éloignées de l'emploi.

Concrètement, cela crée des postes, souvent en lien avec une structure d'insertion ou une agence d'intérim d'insertion, sur la durée du chantier.

Une personne du service public de l'emploi local, le facilitateur de la clause sociale, aide la collectivité à écrire la clause et met en relation les entreprises avec les candidats.

Ce facilitateur travaille en général au sein d'un plan local pour l'insertion et l'emploi, ou d'une maison de l'emploi : une structure qui coordonne, sur un territoire, l'accompagnement des personnes les plus éloignées de l'emploi et l'animation de ces clauses.

Depuis le 22 août 2026, la loi rend cette clause obligatoire sur les marchés publics les plus importants : le nombre d'heures d'insertion disponibles devrait augmenter.

Pour vous, cela veut dire qu'il existe, près de chez vous, des postes accessibles via ces marchés. On y accède sur orientation de votre conseiller ou d'un travailleur social, qui connaît les chantiers en cours. N'hésitez pas à leur demander si des clauses sociales sont ouvertes dans votre secteur.
---
[fiche] id: accompagnement-contrat-d-engagement
titre: Le contrat d'engagement : ce que je signe, mes droits, mes devoirs
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le barème des sanctions
- Le nombre d'heures d'activité prévues au contrat
- Les motifs de dispense d'activité
texte:
Depuis 2025, dès votre inscription à France Travail, vous signez un contrat d'engagement avec la structure qui vous accompagne, dans les trente jours. Il remplace les anciens documents.

Il contient un point sur votre situation, l'emploi que vous cherchez, un plan d'action, et des actions concrètes : ateliers, formations, immersions, démarches. Pour les personnes les plus éloignées de l'emploi, ces activités peuvent occuper plusieurs heures par semaine ; le nombre est fixé avec vous dans le contrat, selon votre situation. Des dispenses sont possibles : problème de santé, handicap, âge, ou parent isolé d'un enfant de moins de douze ans sans solution de garde.

De votre côté, vous vous engagez à faire ce qui est prévu, à venir aux rendez-vous, à actualiser votre situation chaque mois, et à accepter une offre raisonnable d'emploi.

Si vous ne respectez pas ces engagements sans motif valable, votre allocation peut être suspendue. Si vous reprenez vos démarches, une partie vous est versée après coup ; sinon, elle peut être supprimée et vous pouvez être retiré de la liste.

Le contrat se construit avec votre conseiller : c'est le moment de dire ce qui vous freine, pour que le plan d'action soit réaliste. Vous pouvez demander à le revoir si votre situation change.
---
[fiche] id: accompagnement-geiq
titre: Le GEIQ : être embauché par un groupement d'entreprises, en alternance
verifie_le: 2026-10-13
ce_qui_change_souvent:
- (non précisé)
texte:
Un GEIQ regroupe plusieurs entreprises d'un même secteur qui embauchent ensemble, sous ce groupement, une personne éloignée de l'emploi en contrat d'alternance (apprentissage ou professionnalisation). Le GEIQ est votre employeur ; vous êtes mis à disposition d'une ou plusieurs entreprises du groupement à tour de rôle, le temps de vous qualifier sur un métier qu'elles ont du mal à pourvoir.

Ce n'est pas une structure de l'insertion par l'activité économique au sens strict, mais un dispositif proche dans l'esprit : recruter sans condition de diplôme, sur le potentiel, plutôt que sur le parcours déjà accompli.

L'objectif est un emploi durable à l'issue de l'alternance, en général chez l'une des entreprises du groupement qui vous a accueilli.

**En Dordogne** : un GEIQ du bâtiment est présent à Bergerac (électricité, couverture, plomberie, charpente, maçonnerie), avec un accompagnement socio-professionnel en plus de la formation. D'autres GEIQ existent dans d'autres secteurs et d'autres territoires : renseignez-vous auprès de France Travail ou de la Mission locale.
---
[fiche] id: accompagnement-global-et-intensif
titre: L'accompagnement global, l'accompagnement intensif, et la sous-traitance
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les modalités et la durée des accompagnements
- La part de l'accompagnement confiée à des opérateurs privés
texte:
France Travail n'accompagne pas tout le monde de la même façon. Selon votre situation, le suivi est plus ou moins rapproché.

L'accompagnement global associe un conseiller France Travail et un travailleur social du conseil départemental. Il s'adresse aux personnes qui ont un projet d'emploi mais aussi des difficultés à régler : logement, argent, santé. Les deux professionnels travaillent ensemble sur votre situation.

L'accompagnement intensif est un suivi resserré, avec un conseiller référent, sur quelques mois, et un rythme d'activités soutenu. Il vise les personnes éloignées de l'emploi qui ont besoin d'un vrai coup de pouce.

La sous-traitance : France Travail confie parfois l'accompagnement à un organisme extérieur, public ou privé. Vous êtes alors reçu par cet organisme, mais c'est bien France Travail qui pilote et qui verse l'allocation.

Si l'accompagnement qu'on vous propose ne vous semble pas adapté, dites-le à votre conseiller : le type de suivi peut être revu.
---
[fiche] id: accompagnement-insertion-par-activite-economique
titre: L'insertion par l'activité économique : travailler tout en étant accompagné
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les critères d'éligibilité
- La durée du parcours et les cas de CDI
- Les modalités d'entrée (auto-candidature, prescripteurs habilités)
texte:
L'insertion par l'activité économique permet de reprendre un travail dans une structure spéciale, avec un vrai contrat et un salaire, quand on est très éloigné de l'emploi. En parallèle, un accompagnateur aide à lever les difficultés et à préparer la suite.

Elle s'adresse notamment aux personnes au chômage depuis très longtemps, aux bénéficiaires du RSA, de l'allocation de solidarité spécifique ou de l'AAH, aux jeunes en difficulté, aux personnes de plus de cinquante ans, aux personnes handicapées, aux sortants de détention, aux parents isolés, aux personnes réfugiées.

Il existe quatre types de structures : l'entreprise d'insertion, qui produit et vend ; l'entreprise de travail temporaire d'insertion, qui met à disposition en intérim ; l'atelier et chantier d'insertion, qui mène des activités d'utilité sociale ; l'association intermédiaire, qui propose des missions ponctuelles chez des particuliers ou des entreprises.

Le contrat est un contrat à durée déterminée d'insertion, d'au moins quatre mois, renouvelable jusqu'à deux ans. À partir de cinquante-sept ans, un CDI est possible.

Pour entrer, vous pouvez candidater vous-même sur le site « Les emplois de l'inclusion », ou être orienté par France Travail, la Mission locale, Cap emploi, le département ou un travailleur social.
---
[fiche] id: accompagnement-o2r-remobilisation
titre: L'offre de repérage et de remobilisation (O2R) : pour repartir quand on est très loin de l'emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le déploiement de l'O2R par territoire et les structures qui le portent
- La durée et le contenu de l'accompagnement
texte:
Quand on est sans emploi depuis longtemps, sans accompagnement, et qu'on n'est parfois même pas inscrit à France Travail, il est difficile de savoir par où reprendre. L'offre de repérage et de remobilisation, l'O2R, est faite pour ces situations.

Créée par la loi pour le plein emploi, elle a deux missions. D'abord aller chercher les personnes que personne ne suit, y compris celles qui ne sont inscrites nulle part, souvent appelées les personnes invisibles. Ensuite leur proposer un accompagnement renforcé pour se remettre en mouvement.

Concrètement, l'O2R commence par un point complet sur la situation et sur ce qui bloque : santé, logement, mobilité, confiance en soi, papiers. Puis un accompagnement personnalisé par un conseiller expérimenté, des ateliers en petit groupe pour reprendre confiance et remettre en avant ses compétences, et des rencontres avec des entreprises et des acteurs locaux.

La durée de l'accompagnement dépend de l'offre de votre territoire. Il est gratuit et sans engagement de résultat immédiat : l'objectif est d'abord de repartir.

L'O2R est portée par des associations et des structures locales, sur orientation d'un travailleur social, d'un centre communal d'action sociale, d'une mission locale, de France Travail, ou par une prise de contact directe. Pour savoir si un dispositif existe près de chez vous, voyez « Près de chez moi » ou demandez à un travailleur social.
---
[fiche] id: accompagnement-rsa
titre: Quand on touche le RSA : l'orientation et l'accompagnement
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le nombre d'heures d'activité attendues et les dispenses
- Le partage des allocataires entre France Travail et le département
texte:
Depuis 2025, percevoir le RSA veut dire être inscrit à France Travail et signer un contrat d'engagement, qui fixe des objectifs d'insertion sociale et professionnelle.

Après un point sur votre situation, vous êtes orienté vers l'un de ces trois accompagnements :

- un accompagnement tourné vers l'emploi, suivi par France Travail, si vous êtes prêt à chercher du travail ;
- un accompagnement tourné vers le social, suivi par le département avec un travailleur social, si des difficultés (logement, santé, garde d'enfant) passent d'abord ;
- un accompagnement entre les deux, quand il faut travailler les deux en même temps.

Un référent unique suit votre parcours et fait le lien avec les autres intervenants.

Le contrat prévoit des activités chaque semaine ; leur nombre d'heures est fixé selon votre situation. Des dispenses existent : problème de santé, handicap, âge, parent isolé d'un enfant de moins de douze ans sans solution de garde.

Si des freins vous empêchent d'avancer, dites-le à votre référent : c'est pour ça que l'orientation existe. Vous pouvez demander à revoir votre contrat quand votre situation change.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: accompagnement] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S19 : Comprendre le cadre, contrôler le rayon « Justice : sortie de détention » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « justice », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: justice-amenagement-de-peine
titre: L'aménagement de peine et la libération sous contrainte
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les seuils de peine ou de reliquat pour chaque mesure
- Les règles de la libération sous contrainte
texte:
Une peine de prison ferme peut être exécutée autrement qu'en cellule à temps plein, quand un projet sérieux existe : un emploi, une formation, des soins, une vie de famille à préserver. C'est le juge de l'application des peines qui décide, et qui fixe les conditions.

Plusieurs mesures existent. La détention à domicile sous surveillance électronique : vous portez un bracelet et vous restez chez vous en dehors des heures autorisées. La semi-liberté : vous dormez dans un établissement dédié et vous sortez la journée pour travailler ou vous former. Le placement à l'extérieur : vous êtes hébergé et encadré par une structure partenaire, hors de la prison. La libération conditionnelle : une sortie anticipée avec des obligations, souvent possible à la moitié de la peine.

Il existe aussi la libération sous contrainte. Pour une peine de deux ans ou moins, quand il vous reste trois mois de prison ou moins à faire, vous en bénéficiez en principe automatiquement, sous la forme d'un des aménagements ci-dessus, sauf cas particuliers : impossibilité matérielle (par exemple l'absence d'hébergement) ou sanction disciplinaire grave en détention. Pour une peine de deux à cinq ans, elle est possible aux deux tiers de la peine, mais elle est alors examinée par le juge, pas automatique. C'est le SPIP qui prépare le dossier avec vous.

Le point commun de toutes ces mesures : elles se préparent, avec un projet concret. Plus vous en parlez tôt à votre conseiller pénitentiaire d'insertion et de probation, plus le dossier a de chances d'aboutir.
---
[fiche] id: justice-casier-judiciaire
titre: Le casier judiciaire : ce qu'un employeur peut voir, et comment l'effacer
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les délais d'effacement automatique
- Les métiers pour lesquels le bulletin n° 2 ou n° 3 est demandé
texte:
Le casier judiciaire a trois relevés, appelés bulletins, avec des contenus différents.

Le bulletin n° 1 contient tout. Seuls les juges et l'administration pénitentiaire y ont accès. Vous ne pouvez pas l'obtenir, mais vous pouvez le consulter en le demandant au procureur.

Le bulletin n° 2 contient les condamnations importantes, sans les petites infractions ni la plupart des sursis. Il est communiqué à certaines administrations et à des employeurs qui recrutent pour travailler avec des enfants.

Le bulletin n° 3 est le plus réduit : surtout les peines de prison ferme de plus de deux ans (une peine plus courte peut y figurer si le tribunal l'a décidé), et certaines interdictions. C'est le seul que vous pouvez demander vous-même, gratuitement, en ligne ou par courrier. C'est celui qu'un employeur peut vous demander pour certains postes.

Pour la grande majorité des emplois, aucun bulletin n'est demandé.

Les condamnations s'effacent du casier après des délais, plus ou moins longs selon la peine. Vous pouvez aussi demander au tribunal de ne pas inscrire une condamnation au bulletin n° 2, ou de l'effacer plus tôt. La réhabilitation, automatique après un temps sans nouvelle condamnation ou accordée sur demande, efface la mention.

Un point-justice peut vous aider à savoir ce qui figure sur votre casier et à faire une demande d'effacement.
---
[fiche] id: justice-sortie-acces-aux-droits
titre: À la sortie de détention : retrouver ses droits
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les démarches de couverture santé à la sortie
- Les conditions d'accès au RSA pour les sortants de détention
- L'organisation de l'hébergement d'urgence des sortants
texte:
La sortie de détention s'accompagne d'une série de démarches. Le mieux est de les préparer avant, avec votre conseiller pénitentiaire d'insertion et de probation.

Les papiers d'identité : si votre carte est périmée, commencez le renouvellement pendant la détention.

La santé : pendant la détention, vous êtes couvert automatiquement. À la sortie, il faut faire le lien avec la caisse d'assurance maladie pour garder une couverture, et demander la complémentaire santé solidaire si vos ressources sont faibles.

La domiciliation : celle de l'établissement pénitentiaire s'arrête à la levée d'écrou. Demandez-en une nouvelle au centre communal d'action sociale ou à une association agréée, sinon vous ne pourrez pas recevoir votre courrier ni faire valoir vos droits.

Le RSA, la prime d'activité, l'aide au logement : vous pouvez les demander à la sortie, avec l'aide de la caisse d'allocations familiales et du SPIP. Si vous perceviez le RSA avant la détention, il peut reprendre dès votre libération : faites la démarche tout de suite.

L'hébergement : si vous n'avez pas de solution, la demande passe par le service d'accueil et d'orientation du département, en lien avec le SPIP. Voir aussi la fiche « Sans hébergement » du rayon logement.

Rien de tout cela ne se règle seul le jour de la sortie : c'est un travail à mener en amont avec le SPIP et les partenaires.
---
[fiche] id: justice-spip
titre: Le service pénitentiaire d'insertion et de probation : votre interlocuteur pendant et après la peine
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'organisation des SPIP et de leurs partenariats
- Les programmes d'accompagnement proposés
texte:
Le service pénitentiaire d'insertion et de probation, le SPIP, est votre interlocuteur principal quand vous êtes suivi par la justice, que vous soyez en détention ou à l'extérieur, par exemple sous sursis probatoire ou avec un travail d'intérêt général.

Son rôle est double. D'un côté, il contrôle que vous respectez bien les obligations fixées par le juge et rend compte aux magistrats. De l'autre, et c'est le plus important pour la suite, il prépare l'insertion : le logement, les soins, la formation, le travail, l'accès aux droits.

Au sein du SPIP, votre interlocuteur est un conseiller pénitentiaire d'insertion et de probation. C'est lui qui fait le point sur votre situation, vous oriente vers France Travail, la mission locale ou des associations, et instruit les demandes d'aménagement de peine.

Si vous êtes en détention, demandez à rencontrer votre conseiller pour parler de la sortie : plus tôt le projet se construit, mieux c'est. Si vous êtes en milieu ouvert, votre conseiller est le premier point de contact pour toute difficulté.

Les coordonnées du SPIP de votre département sont dans « Près de chez moi », ou auprès du greffe du tribunal.
---
[fiche] id: justice-travail-formation-en-detention
titre: Travailler et se former en détention : le contrat d'emploi pénitentiaire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le niveau de la rémunération minimale
- Le calendrier d'ouverture des droits sociaux
- L'offre de formation professionnelle par région
texte:
Travailler ou se former pendant la détention n'est pas une perte de temps : cela construit une expérience, des droits, et cela pèse dans une demande d'aménagement de peine.

Depuis mai 2022, une personne détenue qui travaille signe un contrat d'emploi pénitentiaire. Ce contrat remplace l'ancien acte d'engagement et pose des règles claires : une rémunération minimale, une durée de travail par semaine, un emploi du temps stable.

Depuis fin 2022, de nouveaux droits sociaux s'ouvrent progressivement pour ces travailleurs : la retraite, l'assurance chômage, l'indemnisation des accidents du travail et des maladies professionnelles, le congé maternité.

La formation professionnelle en détention est organisée avec les régions. Elle permet de préparer un diplôme ou une qualification qui compteront à la sortie.

Pour accéder au travail ou à une formation en détention, adressez-vous à votre conseiller pénitentiaire d'insertion et de probation. Les places sont limitées, mais c'est une demande à formuler tôt et à renouveler.
---
[fiche] id: justice-vers-l-emploi
titre: Reprendre un parcours vers l'emploi après la détention
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'organisation de l'accompagnement France Travail en détention et à la sortie
- Les structures d'insertion implantées en milieu pénitentiaire
texte:
Après une détention, on est accompagné vers l'emploi comme n'importe quelle personne en recherche, avec en plus des points d'entrée dédiés.

France Travail justice : des conseillers spécialisés peuvent vous recevoir directement sur votre lieu de détention, pour vous inscrire et commencer à travailler votre projet. La demande se fait auprès de votre conseiller pénitentiaire d'insertion et de probation. À la sortie, l'accompagnement continue avec un conseiller de droit commun ou un conseiller justice.

Des structures d'insertion par l'activité économique sont implantées dans certains établissements pénitentiaires : elles proposent un emploi accompagné pendant la détention. À la sortie, toutes les structures d'insertion classiques vous sont ouvertes (voir le rayon accompagnement).

Le travail d'intérêt général, quand il est prononcé, peut aussi être l'occasion d'une expérience et d'un lien avec une structure.

Un point important : le casier judiciaire ne bloque l'accès qu'à certains métiers réglementés. Pour la grande majorité des emplois, il n'est pas demandé, et vous n'avez pas à parler de votre passé judiciaire.

Le SPIP et France Travail sont vos deux interlocuteurs pour construire ce parcours. Parlez-en dès la détention.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: justice] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S20 : Comprendre le cadre, contrôler le rayon « Garde d'enfant » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « garde », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: garde-aide-france-travail
titre: L'aide à la garde d'enfants de France Travail (AGE) pour reprendre un emploi ou une formation
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le seuil d'allocation journalière en dessous duquel on y a droit
- Les montants forfaitaires selon le nombre d'enfants et la durée d'activité
- Le délai pour déposer la demande
texte:
Quand vous reprenez un emploi ou entrez en formation, France Travail peut vous verser une aide pour vos frais de garde d'enfant. Elle s'appelle l'AGE. Avant 2024, elle s'appelait l'AGEPI et était réservée aux parents isolés ; elle est maintenant ouverte à toutes les familles.

Pour y avoir droit, il faut être inscrit à France Travail, avoir la charge d'un ou plusieurs enfants de moins de 12 ans, et ne pas toucher d'allocation chômage ou en toucher une faible. Il ne faut pas avoir déjà reçu cette aide dans les douze derniers mois.

Le montant est forfaitaire et versé en une seule fois. Il varie selon le nombre d'enfants et selon le nombre d'heures que vous allez travailler ou passer en formation. Il peut dépasser 500 euros.

La demande se fait au plus tard dans les trois mois qui suivent la reprise d'emploi ou l'entrée en formation, et il faut l'accord de votre conseiller. Parlez-en dès que votre projet se précise.

Cette aide se cumule avec le CMG de la CAF.
---
[fiche] id: garde-complement-mode-de-garde-cmg
titre: Le complément de libre choix du mode de garde (CMG) : l'aide de la CAF pour payer la garde
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le mode de calcul du CMG emploi direct et les tarifs de référence horaires
- L'âge de l'enfant jusqu'auquel le CMG est versé selon la situation familiale
- Les montants, qui dépendent des ressources et sont réévalués
texte:
Le CMG est une aide de la CAF (ou de la MSA si vous relevez du régime agricole) qui prend en charge une partie du coût de la garde. Il concerne les enfants de moins de 6 ans gardés par une assistante maternelle agréée, une garde à domicile, ou une micro-crèche.

Pour y avoir droit, il faut en général exercer une activité professionnelle. Les personnes qui touchent le RSA ou l'allocation aux adultes handicapés y ont droit sans cette condition. Les demandeurs d'emploi indemnisés et les personnes en formation peuvent aussi en bénéficier.

Depuis septembre 2025, le calcul a changé pour l'emploi direct d'une assistante maternelle ou d'une garde à domicile : l'aide suit les heures réellement déclarées, et vous n'êtes plus obligé de garder au moins 15 pour cent du coût à votre charge.

Deux points utiles si vous élevez seul votre enfant : le CMG est majoré, et il est versé jusqu'aux 12 ans de l'enfant, au lieu de 6 ans, à condition d'employer directement une assistante maternelle ou une garde à domicile (en micro-crèche, il s'arrête à 6 ans).

Si l'enfant est en résidence alternée, chaque parent peut demander le CMG pour la garde qu'il organise, depuis le 1er décembre 2025.

Le montant dépend de vos ressources, du nombre d'enfants et de leur âge. Un simulateur existe sur mesdroitssociaux.gouv.fr. La demande se fait auprès de la CAF, puis chaque mois par Pajemploi.
---
[fiche] id: garde-creche-insertion-avip
titre: Les crèches à vocation d'insertion professionnelle (AVIP) : une place liée à un accompagnement vers l'emploi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- La liste des crèches labellisées AVIP sur chaque territoire
- Les modalités d'orientation par le conseiller France Travail
texte:
Une crèche AVIP est une crèche ordinaire, avec un engagement en plus : elle garde au moins une place sur cinq pour des enfants de moins de 3 ans dont les parents cherchent un emploi et sont inscrits à France Travail.

En même temps que la place de crèche, un accompagnement vers l'emploi ou la formation est proposé au parent, en lien avec un conseiller France Travail. Les deux vont ensemble.

Les familles où un seul parent élève les enfants, et les personnes qui touchent le RSA, sont prioritaires.

La place peut servir pour passer des entretiens, commencer une période d'essai, suivre une formation, mais aussi pour lever d'autres obstacles, comme suivre des cours de français ou passer le permis.

Pour en bénéficier, parlez-en à votre conseiller France Travail ou à la CAF. La liste des crèches AVIP de votre secteur est sur monenfant.fr et dans « Près de chez moi ».
---
[fiche] id: garde-elever-seul-son-enfant
titre: Quand on élève seul son ou ses enfants : priorités d'accès et aides
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les montants de l'ASF et du RSA majoré
- Les règles de priorité d'accès aux places de crèche
texte:
Quand un seul parent élève les enfants, la question de la garde pèse plus lourd. Plusieurs mesures en tiennent compte.

Pour les places d'accueil, les familles où un parent élève seul les enfants sont prioritaires : pour une place en crèche, pour une place en crèche à vocation d'insertion professionnelle, et pour l'accompagnement vers l'emploi de France Travail.

Le CMG de la CAF est majoré dans cette situation, et il est versé jusqu'aux 12 ans de l'enfant au lieu de 6 ans, si vous employez directement une assistante maternelle ou une garde à domicile.

L'allocation de soutien familial est versée par la CAF au parent qui élève seul un enfant quand l'autre parent ne verse pas de pension alimentaire ou en verse une faible. Le service public des pensions alimentaires, l'Aripa, peut aider à fixer la pension et à la récupérer.

Le RSA peut être majoré pendant la grossesse et jusqu'aux 3 ans du plus jeune enfant.

Vos interlocuteurs : la CAF, le relais petite enfance, le centre communal d'action sociale, votre conseiller France Travail et le travailleur social du département.
---
[fiche] id: garde-horaires-decales-urgence
titre: Garde en horaires décalés, garde ponctuelle ou d'urgence
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'offre de crèches à horaires élargis, très variable selon les villes
- Les majorations du CMG pour horaires atypiques, nuit et dimanche
texte:
Certaines situations demandent une garde ponctuelle ou en dehors des horaires habituels : un entretien d'embauche, les premiers jours d'un contrat, une formation de quelques jours, ou un travail tôt le matin, le soir, la nuit ou le week-end.

Plusieurs solutions existent. La halte-garderie et l'accueil occasionnel en crèche permettent de faire garder l'enfant à l'heure ou à la demi-journée, sans contrat régulier. Des crèches et des assistantes maternelles acceptent des horaires atypiques. Quelques villes ont des crèches à horaires élargis.

Le CMG de la CAF peut aider à payer une assistante maternelle ou une garde à domicile à ces horaires, et certaines CAF ajoutent une aide locale pour les horaires décalés : demandez à la vôtre.

Le relais petite enfance et la CAF savent quelles structures de votre secteur acceptent l'accueil d'urgence ou en horaires décalés.

Pour un entretien précis ou une période d'essai qui démarre vite, votre conseiller France Travail et les crèches à vocation d'insertion professionnelle peuvent aider à trouver une solution rapidement. Signalez le besoin dès que possible.
---
[fiche] id: garde-trouver-un-mode-de-garde
titre: Trouver un mode de garde : par où commencer
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le déploiement des relais petite enfance et leurs horaires
- Les délais et les commissions d'attribution des places en crèche
texte:
Ne pas avoir de solution de garde peut empêcher d'accepter un poste ou de suivre une formation. Plusieurs services existent pour vous aider à trouver.

Il y a deux grandes familles de solutions. L'accueil individuel : une assistante maternelle agréée, chez elle ou dans une maison d'assistantes maternelles, ou une personne qui garde l'enfant à votre domicile. L'accueil collectif : la crèche, la micro-crèche, la halte-garderie.

Le relais petite enfance, ou RPE, est votre premier interlocuteur. C'est un service public de proximité, gratuit. Il vous informe sur toutes les solutions près de chez vous, sur les aides financières, et sur les démarches à faire si vous employez une assistante maternelle. Il ne garde pas les enfants, il oriente.

Le site monenfant.fr recense les assistantes maternelles, les crèches et les relais, avec leurs disponibilités et des simulateurs de coût.

La protection maternelle et infantile, la PMI, du conseil départemental peut aussi vous conseiller.

Pour un enfant déjà scolarisé, ce sont l'accueil périscolaire, le matin et le soir à l'école, et l'accueil de loisirs, le mercredi et pendant les vacances, qui prennent le relais. Ils sont organisés par la commune, avec un tarif calculé selon vos revenus. Renseignez-vous à la mairie ou au centre communal d'action sociale ; la CAF verse, dans certains départements, une aide aux temps libres qui réduit encore le coût.

Un conseil : les places en crèche se demandent tôt. N'attendez pas pour vous renseigner.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: garde] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S21 : Comprendre le cadre, contrôler le rayon « Apprendre le français » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « francais », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: francais-a-quoi-servent-les-niveaux
titre: À quoi servent les niveaux de langue (A1, A2, B1, B2)
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les niveaux de français exigés pour le séjour et la nationalité
- Les niveaux demandés à l'entrée de certaines formations
texte:
Quand on vous demande un niveau de français, il s'agit presque toujours de l'échelle européenne : A1 et A2 pour un niveau débutant, B1 et B2 pour un niveau intermédiaire, C1 et C2 pour un niveau avancé.

Ce niveau sert dans plusieurs situations.

Pour le titre de séjour : depuis le 1er janvier 2026, il faut justifier du niveau A2 pour une carte de séjour pluriannuelle, et du niveau B1 pour une carte de résident. Ces règles viennent de la loi du 26 janvier 2024.

Pour devenir français : le niveau demandé a été relevé. Le rayon consacré aux personnes venues d'un autre pays détaille le séjour et la nationalité.

Pour l'emploi : certains employeurs demandent un niveau minimal, surtout pour les postes en contact avec le public ou avec des consignes de sécurité écrites.

Pour la formation : l'entrée dans certaines formations qualifiantes suppose le niveau B1.

Votre niveau se mesure avec un test ou un diplôme, comme le DILF, le DELF ou le TCF. Une fiche de ce rayon explique comment le faire reconnaître.
---
[fiche] id: francais-apprendre-pres-de-chez-soi
titre: Apprendre le français près de chez soi
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les lieux et les horaires des ateliers, qui changent chaque année scolaire
- Les établissements qui proposent le dispositif OEPRE
texte:
On peut apprendre ou améliorer son français sans que cela soit lié à un titre de séjour, et souvent gratuitement.

Les ateliers sociolinguistiques ont lieu dans les centres sociaux et les associations. On y apprend le français à partir de situations concrètes : aller à la poste, prendre le bus, parler avec l'école, comprendre un courrier de la mairie. Le rythme est adapté, l'ambiance est bienveillante.

Le dispositif OEPRE, « Ouvrir l'école aux parents pour la réussite des enfants », propose des ateliers gratuits dans les écoles, collèges et lycées, pour les parents venus d'un autre pays. De soixante à cent vingt heures par an, selon l'atelier, pour apprendre le français, comprendre l'école et connaître les valeurs de la République.

Des associations comme La Cimade ou le Secours catholique, et beaucoup d'associations locales, donnent aussi des cours pour adultes.

Il existe enfin des cours à distance et des ressources gratuites en ligne.

Pour savoir ce qui existe près de chez vous, demandez à la mairie, au centre communal d'action sociale, au centre social, ou à un travailleur social.
---
[fiche] id: francais-cours-de-l-ofii-cir
titre: Les cours de français de l'OFII, avec le contrat d'intégration républicaine
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le nombre d'heures de formation selon le niveau de départ
- La part de formation proposée à distance
- Le niveau visé en fin de parcours
- Le niveau de français exigé pour obtenir un titre de séjour
texte:
Quand vous obtenez un premier titre de séjour, vous signez un contrat d'intégration républicaine avec l'OFII. Ce contrat comprend une formation civique et, si votre niveau de français en a besoin, une formation de langue. Le rayon « Venir de l'étranger » explique le contrat et ses engagements ; cette fiche se concentre sur les cours de français.

Cette formation de français est gratuite. Sa durée dépend de votre niveau au départ et peut aller jusqu'à 600 heures. Elle a lieu en présentiel, ou à distance sur une plateforme d'apprentissage en ligne. Elle vise à vous faire atteindre le niveau A2 sur l'échelle européenne des langues (A1, A2, B1...).

L'OFII vous convoque, vous oriente vers l'organisme qui assure les cours, et prend en charge le coût.

Depuis le 1er janvier 2026, le niveau de français est aussi une condition pour obtenir certains titres de séjour : le niveau A2 pour une première carte de séjour pluriannuelle, le niveau B1 pour une première carte de résident. Suivre la formation de l'OFII et passer les tests aide à justifier de ce niveau. Si vous craignez de ne pas l'atteindre, parlez-en tôt à votre conseiller ou à l'OFII : le parcours peut être prolongé, et des cours près de chez vous existent en complément.

Une fois le contrat terminé, si vous voulez progresser encore, des parcours de perfectionnement peuvent être proposés au-delà du contrat pour viser le niveau B1. Ils sont également gratuits.

Si vous n'êtes pas concerné par le contrat d'intégration républicaine, ou si vous voulez des cours en plus, d'autres solutions près de chez vous existent : voir la fiche « Apprendre le français près de chez soi ».
---
[fiche] id: francais-faire-reconnaitre-son-niveau
titre: Faire reconnaître son niveau de français : DILF, DELF, TCF
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les tarifs d'inscription, fixés par chaque centre d'examen
- Les sessions et les délais d'inscription
texte:
Pour prouver votre niveau de français, il faut un diplôme ou un test officiel. Plusieurs existent, selon votre situation.

Le DILF, diplôme initial de langue française, correspond au tout premier niveau. Il s'adresse aux adultes grands débutants et ne se passe qu'en France.

Le DELF se passe niveau par niveau, de A1 à B2. C'est un diplôme, gardé à vie. Le DALF concerne les niveaux avancés C1 et C2.

Le TCF, test de connaissance du français, mesure votre niveau à un instant donné. Le résultat est valable deux ans. Il est souvent demandé pour le séjour, la nationalité ou les études.

Le DCL, diplôme de compétence en langue, est tourné vers le monde du travail.

Où passer l'examen : dans un centre agréé par France Éducation international. Un annuaire en ligne permet de trouver le centre le plus proche ; c'est lui qui donne les dates, le lieu et le tarif.

Le coût peut être pris en charge par le compte personnel de formation, par France Travail, ou par l'organisme qui assure votre formation. Renseignez-vous avant de vous inscrire.
---
[fiche] id: francais-lecture-ecriture-competences-de-base
titre: Lecture, écriture, calcul : les formations aux compétences de base
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les programmes régionaux de formation aux savoirs de base
- Le contenu et les modalités du certificat CléA
texte:
Beaucoup de personnes qui ont été à l'école en France se retrouvent, des années plus tard, en difficulté avec la lecture, l'écriture ou le calcul. D'après une enquête de l'Insee de 2022, environ une personne de 18 à 64 ans sur dix rencontre des difficultés à l'écrit. Ce n'est ni rare, ni définitif : cela se retravaille.

L'Agence nationale de lutte contre l'illettrisme coordonne l'action dans ce domaine et oriente vers les ressources de chaque région.

Des formations aux savoirs de base, aussi appelées compétences clés, sont financées par la région ou par France Travail. Elles se déroulent sur des créneaux souples, souvent en petits groupes, à un rythme adapté.

Le certificat CléA reconnaît un socle de compétences utiles au travail : français, calcul, numérique, travail en équipe. Il est utile pour sécuriser un parcours avant d'entrer en qualification.

Un point important : aucune de ces démarches n'apparaît sur votre CV et n'est communiquée à un employeur sans votre accord.

Pour commencer, parlez-en à votre conseiller France Travail, à un travailleur social, ou à un centre de formation près de chez vous.
---
[fiche] id: francais-se-former-pour-le-travail
titre: Se former en français pour le travail, et faire financer la formation
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les règles et la participation financière du CPF
- Les conditions d'accès à l'aide individuelle à la formation
texte:
Quand le français est un frein pour l'emploi, il existe des formations centrées sur le monde du travail, et plusieurs façons de les financer.

Le français à visée professionnelle porte sur le vocabulaire et les situations du métier que vous visez : consignes, comptes rendus, échanges avec les collègues ou les clients.

Pour le financement :

Le compte personnel de formation, le CPF, finance les formations de français qui débouchent sur un diplôme ou une certification reconnue, comme le DELF ou le TCF. Depuis 2026, une participation de 150 euros est demandée pour chaque formation, sauf si vous êtes inscrit comme demandeur d'emploi à France Travail, ou si un employeur, un OPCO ou la région complète le financement.

L'aide individuelle à la formation de France Travail peut prendre le relais, après validation de votre projet par le conseiller. France Travail ou la région peuvent aussi financer directement une formation dans le cadre d'une action de formation conventionnée, sans avance de frais de votre part.

Pour les salariés, l'employeur et son OPCO peuvent financer la formation dans le cadre du plan de développement des compétences.

Il existe aussi la formation en situation de travail : on apprend le français directement sur le poste, avec un accompagnement, dans le cadre d'un contrat aidé ou d'un parcours d'insertion.

Le rayon « Se former et se reconvertir » a une fiche qui détaille l'ensemble de ces financements pour les demandeurs d'emploi, au-delà du seul français.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: francais] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S22 : Comprendre le cadre, contrôler le rayon « Travailler après 50 ans et retraite » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « seniors », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: seniors-cumul-emploi-retraite
titre: Le cumul emploi-retraite : travailler après avoir liquidé sa pension
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les conditions du cumul intégral
- Les règles de la seconde pension ouverte par l'activité reprise
texte:
Le cumul emploi-retraite permet de continuer à travailler, ou de reprendre une activité, après avoir demandé sa retraite. Rien n'oblige à s'arrêter le jour de la liquidation.

Deux situations. Si vous avez liquidé toutes vos pensions (de base et complémentaires) et que vous avez soit l'âge du taux plein, soit l'âge légal avec le nombre de trimestres requis, le cumul est intégral : vous touchez votre pension en entier et votre nouveau revenu, sans plafond.

Si ces conditions ne sont pas réunies, le cumul est plafonné : le total de votre pension et de votre salaire ne doit pas dépasser un certain montant. Au-delà, votre pension est réduite d'autant. En pratique, il faut alors souvent attendre un délai avant de reprendre chez le même employeur.

Depuis la réforme de 2023, l'activité reprise en cumul intégral peut ouvrir une seconde pension, calculée sur les nouvelles cotisations. Elle est plafonnée et ne peut être demandée qu'une seule fois.

À savoir : ces règles vont changer pour les retraites qui démarrent à partir du 1er janvier 2027. L'âge deviendra le critère principal. Avant l'âge légal, votre revenu d'activité sera déduit de votre pension. Entre l'âge légal et 67 ans, le cumul sera possible jusqu'à un plafond de revenus, au-delà duquel la pension est réduite. À partir de 67 ans, le cumul sera libre. Si votre retraite a démarré avant 2027, rien ne change pour vous. Vérifiez votre cas sur le site de l'Assurance retraite avant de décider de votre date de départ.

Dans tous les cas, prévenez votre caisse de retraite de votre reprise d'activité. Pour vérifier votre situation exacte, voyez la fiche « Où m'informer sur ma retraite, à qui m'adresser ».
---
[fiche] id: seniors-depart-volontaire-retraite
titre: Partir à la retraite : le départ volontaire du salarié
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le barème de l'indemnité légale de départ à la retraite
texte:
Le départ volontaire à la retraite, c'est quitter son CDI de sa propre décision pour faire valoir ses droits à la retraite. Il faut donc être en âge de partir et réunir les trimestres nécessaires.

Ce n'est pas une démission. Le motif « retraite » change deux choses. D'abord, il ouvre droit à une indemnité de départ volontaire à la retraite, prévue par la loi à partir de dix ans d'ancienneté, ou par votre convention collective si elle est plus avantageuse. Ensuite, comme vous partez en retraite, la question du chômage ne se pose pas.

Prévenez votre employeur par écrit, en indiquant clairement que vous partez pour la retraite. Vous effectuez ensuite un préavis, dont la durée est celle prévue en cas de licenciement : un mois entre six mois et deux ans d'ancienneté, deux mois au-delà, sauf disposition plus favorable.

Avant de vous décider, demandez à votre caisse de retraite une estimation de votre pension, et regardez si la retraite progressive ou le cumul emploi-retraite ne correspondent pas mieux à ce que vous voulez. Voyez la fiche « Où m'informer sur ma retraite, à qui m'adresser ».
---
[fiche] id: seniors-mise-a-la-retraite
titre: La mise à la retraite par l'employeur
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les âges (67 ans, 70 ans) et la procédure d'interrogation annuelle
texte:
La mise à la retraite, c'est quand c'est l'employeur qui met fin au contrat parce que vous avez atteint un certain âge. Ce n'est ni un licenciement, ni une démission : c'est une rupture à part, encadrée.

Avant 67 ans, l'employeur ne peut pas vous mettre à la retraite d'office. Il peut vous le proposer, mais vous êtes libre de refuser, et votre refus ne peut pas être une cause de licenciement.

Entre 67 et 70 ans, l'employeur doit vous interroger par écrit chaque année, trois mois avant votre anniversaire. Vous avez un mois pour répondre. Si vous dites non, il ne peut pas vous mettre à la retraite cette année-là, et il devra reposer la question l'année suivante.

À partir de 70 ans, l'employeur peut vous mettre à la retraite sans votre accord.

Quand la mise à la retraite est possible et décidée, vous avez droit à une indemnité au moins égale à l'indemnité légale de licenciement, et à un préavis. Si votre convention collective prévoit mieux, c'est elle qui s'applique.
---
[fiche] id: seniors-ou-s-informer-retraite
titre: Où m'informer sur ma retraite, à qui m'adresser
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les services en ligne du compte retraite
texte:
La retraite ne dépend pas de France Travail. Elle est gérée par l'Assurance retraite pour le régime général des salariés du privé, par les régimes complémentaires, et par d'autres caisses pour les indépendants, les agents publics ou les professions particulières. La plupart des gens ont cotisé à plusieurs régimes au cours de leur vie.

Le point d'entrée unique, c'est le compte retraite sur info-retraite.fr. Il rassemble tous vos régimes au même endroit : votre relevé de carrière, une estimation du montant de votre future pension, une simulation de votre âge de départ, et la possibilité de faire votre demande de retraite en ligne. On s'y connecte avec FranceConnect.

Pour le régime général, votre interlocuteur est la CARSAT de votre région, la CARSAT Nouvelle-Aquitaine pour la Dordogne et la Haute-Vienne. Son site est lassuranceretraite.fr.

Vérifiez votre relevé de carrière sans attendre la fin de votre activité : c'est le meilleur moment pour retrouver un justificatif et faire corriger un trimestre oublié. À partir de 45 ans, vous pouvez demander un entretien information retraite, gratuit.

Si les démarches en ligne vous mettent en difficulté, un point France services près de chez vous peut vous aider. Voyez « Près de chez moi ».
---
[fiche] id: seniors-retraite-progressive
titre: La retraite progressive : réduire son activité en fin de carrière
verifie_le: 2026-10-13
ce_qui_change_souvent:
- L'âge d'ouverture et le nombre de trimestres exigés
- Les bornes de temps partiel autorisées
texte:
La retraite progressive permet de réduire son temps de travail en fin de carrière tout en touchant déjà une partie de sa pension de retraite. C'est une transition en douceur : on travaille moins, on gagne un peu moins, mais la caisse de retraite comble une partie de la différence.

Trois conditions, pour les pensions qui prennent effet à partir du 1er septembre 2025 : avoir au moins 60 ans, réunir au moins 150 trimestres tous régimes de retraite confondus, et passer à un temps partiel compris entre 40 % et 80 % d'un temps plein. Si vous êtes à votre compte, c'est votre revenu d'activité que vous devez réduire, de 20 % à 60 %.

La démarche se fait en deux temps. D'abord, vous demandez à votre employeur l'autorisation de passer à temps partiel, par lettre recommandée avec avis de réception, au moins deux mois avant la date voulue. Sans réponse écrite et motivée de sa part dans les deux mois, son accord est considéré comme acquis. Ensuite, vous transmettez à votre caisse de retraite le formulaire de demande de retraite progressive, au moins quatre mois avant le début souhaité.

Pendant toute cette période, vous continuez à cotiser, donc à acquérir des droits pour votre retraite définitive. Avec l'accord écrit de votre employeur, vous pouvez même cotiser comme si vous étiez encore à temps plein.

Attention : si vous reprenez ensuite une activité à temps complet, vous perdez définitivement le bénéfice de la retraite progressive, sans possibilité de redemander. Sinon, le dispositif s'arrête le jour où vous demandez votre retraite complète, et les trimestres cotisés entre-temps sont pris en compte dans le calcul final.

La retraite est gérée par l'Assurance retraite, pas par France Travail : pour connaître vos trimestres et estimer votre situation, voyez la fiche « Où m'informer sur ma retraite, à qui m'adresser ».
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: seniors] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S23 : Comprendre le cadre, contrôler le rayon « Accès aux soins » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « sante », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: sante-desert-medical
titre: Pas de médecin près de chez vous ? Comprendre le désert médical
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les organisations coordonnées territoriales actives sur le secteur
- Le classement ARS des zones sous-dotées (zones d'intervention prioritaire, zones d'action complémentaire)
texte:
Un désert médical n'est pas qu'une question de campagne isolée : certains quartiers de grandes villes sont aussi concernés. Il ne s'agit pas d'un jugement sur un territoire, mais d'un simple constat chiffré : moins de professionnels de santé qu'ailleurs pour le même nombre d'habitants, et donc des délais plus longs pour obtenir un rendez-vous.

Ne pas avoir de médecin traitant a une conséquence concrète : le remboursement de vos consultations est réduit si vous consultez un médecin « hors parcours de soins », sauf pour certains professionnels accessibles directement, sans pénalité : l'ophtalmologue, le gynécologue, le chirurgien-dentiste, et le psychiatre pour les 16-25 ans.

Que faire concrètement si vous n'avez pas de médecin traitant :

- **L'Annuaire santé** (service gratuit de l'Assurance maladie, aucun compte à créer) permet de chercher un médecin, un dentiste ou un autre professionnel près de chez vous, et de voir s'il accepte de nouveaux patients.
- Si aucun médecin n'a de place, une **organisation coordonnée territoriale** peut exister sur votre secteur : un regroupement de professionnels qui s'organise pour répondre plus vite, parfois par téléconsultation en attendant un premier rendez-vous en cabinet.
- Pour toute question sur vos droits ou votre carte Vitale, la CPAM reste votre interlocuteur (par téléphone au <a href="tel:3646">3646</a>, ou sur ameli.fr).
- Si les démarches en ligne sont difficiles, une **maison France Services** peut vous aider gratuitement, sans rendez-vous.

Ce n'est pas à vous de résoudre le manque de médecins sur un territoire : ces démarches servent seulement à trouver la meilleure solution disponible aujourd'hui, en attendant que l'offre de soins s'améliore.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: sante] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S24 : Comprendre le cadre, contrôler le rayon « Emploi et contrats » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « emploi », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: emploi-abandon-de-poste
titre: L'abandon de poste : ce que ça change vraiment depuis 2023
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les motifs légitimes reconnus par la jurisprudence pour écarter la présomption
texte:
Un abandon de poste, c'est ne plus se présenter au travail sans justification ni accord de l'employeur.

Depuis un décret d'avril 2023, l'employeur qui constate un abandon de poste peut vous mettre en demeure, par lettre recommandée, de reprendre votre poste ou de justifier votre absence, dans un délai qu'il fixe lui-même et qui ne peut pas être inférieur à 15 jours.

Sans réponse de votre part dans ce délai, vous êtes présumé démissionnaire. Concrètement, cela ferme en principe le droit à l'allocation chômage, comme pour une démission classique qui n'est pas reconnue « légitime ».

Cette présomption peut être écartée si l'abandon est justifié par un motif reconnu : raison médicale, exercice du droit de retrait face à un danger, exercice du droit de grève, ou une modification du contrat imposée par l'employeur sans votre accord, notamment. La contestation se fait devant le conseil de prud'hommes, qui doit statuer dans un délai accéléré d'un mois.

**Ce n'est jamais une façon sûre de quitter rapidement un emploi.** Contrairement à une rupture conventionnelle ou à une démission reconnue légitime, l'issue dépend de la réaction de l'employeur et, en cas de désaccord, d'une décision de justice qui prend du temps. Si vous voulez partir, une rupture conventionnelle ou une démission légitime (si votre situation correspond à l'un des motifs reconnus) protègent mieux vos droits.
---
[fiche] id: emploi-armees
titre: S'engager dans l'armée : comment ça se passe
verifie_le: 2026-10-14
ce_qui_change_souvent:
- Les limites d'âge et les diplômes demandés selon le corps visé
- Le service national volontaire (nouveau dispositif, dates et conditions à reconfirmer)
texte:
Les armées recrutent de nombreux métiers, pas seulement des métiers de combat. Le point de départ est toujours le même : un rendez-vous au centre d'information et de recrutement des forces armées (CIRFA) le plus proche. Il est gratuit et ne vous engage pas.

Les conditions générales, à confirmer auprès du CIRFA pour le corps qui vous intéresse : avoir la nationalité française (la Légion étrangère accueille aussi des personnes d'autres nationalités), avoir fait sa journée défense et citoyenneté, jouir de ses droits civiques, et être reconnu apte par un médecin militaire. L'âge minimum est de 17 ans et demi (avec l'accord des parents avant 18 ans). Une limite d'âge existe aussi, autour de 30 ans pour un militaire du rang et de 32 ans pour un sous-officier, mais elle dépend du statut et de la spécialité : le CIRFA vous donnera le chiffre exact. Pour être militaire du rang, aucun diplôme précis n'est demandé ; les postes de sous-officier et d'officier demandent un niveau d'études plus élevé.

Concrètement, vous prenez rendez-vous, vous déposez votre candidature avec un conseiller, vous passez des évaluations (médicales, physiques et tests), puis vous ajustez votre projet avec lui avant de signer un contrat. Les frais de déplacement pour les tests sont pris en charge par l'armée.

Un service national volontaire de dix mois, pour les 18 à 25 ans, est un parcours distinct de l'engagement : renseignez-vous sur sa mise en place et ses conditions avant de le citer à quelqu'un.

Pour trouver le CIRFA le plus proche, regardez dans « Qui fait quoi » (domaine emploi), ou sur le site de recrutement des armées.
---
[fiche] id: emploi-arret-maladie
titre: L'arrêt maladie : combien de temps, quelles indemnités, et comment préparer la reprise
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La durée maximale d'un arrêt et de ses prolongations
- La durée pendant laquelle les indemnités peuvent être versées, surtout pour les affections de longue durée
- Les conditions de la visite de reprise
texte:
Un arrêt de travail est une prescription de votre médecin (ou d'une sage-femme, ou d'un chirurgien-dentiste) qui vous dispense de travailler pour des raisons de santé. Vous avez quarante-huit heures pour l'envoyer à votre employeur et à votre caisse d'assurance maladie.

Depuis le 1er septembre 2026, la durée d'un arrêt est limitée : 31 jours pour un premier arrêt, 62 jours pour chaque prolongation. Le médecin peut aller plus loin s'il le justifie par votre état de santé.

Pendant l'arrêt, l'Assurance maladie vous verse des indemnités journalières. Les trois premiers jours ne sont pas indemnisés, sauf dans quelques cas comme une affection de longue durée, un accident du travail ou une maladie professionnelle. Ces indemnités ne remplacent qu'une partie de votre salaire. Selon votre convention collective, votre employeur peut compléter. Pour y avoir droit, il faut avoir assez travaillé avant l'arrêt, avec des conditions plus strictes si l'arrêt dépasse six mois : votre caisse vous dit où vous en êtes.

Les indemnités ne durent pas sans limite. En règle générale, elles peuvent être versées pendant 360 jours sur une période de trois ans. Pour les arrêts prescrits à partir du 15 octobre 2026, la limite passe à un an, au lieu de trois, quand l'arrêt vient d'une affection de longue durée dont les soins ne sont pas remboursés à 100 %. Les affections remboursées à 100 %, comme un cancer, gardent la limite de trois ans. Si votre arrêt est déjà long, demandez à votre caisse ce qui s'applique dans votre cas.

Pour préparer le retour, une visite de pré-reprise avec le médecin du travail permet d'avoir un aménagement du poste ou du temps de travail avant même de reprendre. Après un arrêt long, une visite de reprise a lieu à votre retour. Pour les arrêts délivrés à partir du 15 juin 2026, elle n'est plus obligatoire si une visite de pré-reprise a eu lieu dans les trente jours avant votre retour et si le médecin du travail a conclu qu'aucun aménagement n'était nécessaire. Vous, votre employeur ou le médecin du travail pouvez quand même la demander.

Si votre état de santé ne permet pas encore une reprise complète, parlez-en à votre médecin traitant et au médecin du travail : un aménagement du poste est parfois possible. Si l'arrêt se prolonge ou si vous ne pouvez plus tenir votre poste, d'autres solutions existent : la pension d'invalidité, ou l'avis d'inaptitude du médecin du travail. Voyez les fiches « La pension d'invalidité » et « La médecine du travail et l'inaptitude ».

En cas de doute sur vos droits pendant un arrêt, votre caisse d'assurance maladie peut vous renseigner, tout comme un point-justice pour une information juridique gratuite.
---
[fiche] id: emploi-cdd-cdi-saisonnier
titre: CDD, CDI, contrat saisonnier : quelles différences concrètes ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les durées maximales et le nombre de renouvellements (parfois fixés par la convention de branche)
- Le taux et les cas d'exclusion de la prime de précarité
- Les règles du délai de carence
texte:
Le CDI est la forme normale du contrat de travail : il n'a pas de date de fin.

Le CDD ne peut servir qu'à une tâche précise et temporaire : remplacer un salarié absent, faire face à un surcroît d'activité, un emploi saisonnier, un contrat d'usage dans certains métiers. Il ne peut pas remplacer un emploi permanent. Le motif doit figurer dans le contrat, qu'on doit vous remettre dans les deux jours ouvrables.

Sa durée est en général de dix-huit mois au maximum, et il ne peut être renouvelé que deux fois. À la fin, vous touchez une prime de précarité d'au moins dix pour cent de ce que vous avez gagné, sauf dans plusieurs cas : contrat saisonnier, contrat pendant vos vacances scolaires, refus de votre part d'un CDI sur le même poste, contrat aidé, rupture du contrat à votre initiative, faute grave.

Entre deux CDD sur le même poste, l'employeur doit respecter un délai d'attente, calculé sur la durée du contrat précédent.

Le contrat saisonnier est un CDD attaché à un travail qui revient chaque année. Il n'ouvre pas la prime de précarité, mais il donne souvent le droit d'être repris la saison suivante.

Si un CDD vous semble utilisé pour un poste qui devrait être un CDI, l'inspection du travail peut le vérifier.
---
[fiche] id: emploi-cesu
titre: Travailler chez un particulier avec le CESU
verifie_le: 2026-10-05
ce_qui_change_souvent:
- (non précisé)
texte:
Le CESU permet à un particulier de vous employer directement à son domicile : ménage, garde d'enfant, soutien scolaire, aide à une personne âgée ou dépendante, entre autres. C'est une façon simplifiée de déclarer un emploi, pas un type de contrat à part : vous avez les mêmes droits qu'un salarié classique (congés payés, protection sociale, cotisations retraite).

Concrètement, l'employeur particulier déclare vos heures et votre salaire sur une plateforme dédiée (Urssaf), qui calcule et prélève les cotisations automatiquement. Vous n'avez pas de bulletin de paie à réclamer séparément : l'attestation d'emploi vaut bulletin de salaire.

C'est un mode d'embauche très répandu dans les services à la personne, un secteur qui recrute beaucoup localement, notamment dans l'aide à domicile. Plusieurs employeurs particuliers peuvent vous employer en même temps, chacun déclarant ses propres heures.

Si un désaccord survient (heures non payées, rupture du contrat), les mêmes règles générales du droit du travail s'appliquent : voir les fiches de ce rayon sur la fin d'un contrat, et le rayon Questions juridiques en cas de litige.
---
[fiche] id: emploi-contrats-de-l-insertion
titre: Les contrats de l'insertion : CDD d'insertion, parcours emploi compétences, CDD Tremplin
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les durées et conditions des contrats aidés
- Le montant de l'aide versée à l'employeur
- Les objectifs de sorties vers l'emploi durable
texte:
Certains contrats sont pensés pour les personnes qui ont des difficultés à entrer dans l'emploi. Ils combinent un travail, un accompagnement et souvent une formation.

Le CDD d'insertion est signé avec une entreprise d'insertion, une association intermédiaire ou un atelier et chantier d'insertion. Il est réservé aux personnes sans emploi qui rencontrent des difficultés particulières. Il dure au minimum quatre mois, et peut se prolonger jusqu'à deux ans. On y entre sur orientation d'un conseiller ou d'un travailleur social.

Le parcours emploi compétences est un contrat aidé dans le secteur non marchand : une association, une collectivité, un établissement public. Il dure au moins neuf mois, pour au moins vingt heures par semaine. L'employeur reçoit une aide de l'État et s'engage à vous accompagner et à vous former. Vous avez les mêmes droits que les autres salariés.

Le CDD Tremplin est proposé par une entreprise adaptée aux personnes ayant une reconnaissance de travailleur handicapé, pour se former et prendre de l'expérience avant un emploi classique.

Ces contrats ne se demandent pas directement : c'est votre conseiller France Travail, votre référent RSA, la Mission locale ou Cap emploi qui vous y oriente, selon votre situation.
---
[fiche] id: emploi-csp
titre: Le contrat de sécurisation professionnelle (CSP), comment ça marche ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le montant et la durée exacts de l'ASP selon l'ancienneté
- La durée du délai de réflexion et les modalités de la mise en demeure
texte:
Le CSP (contrat de sécurisation professionnelle) est proposé par l'employeur à un salarié en CDI dont le licenciement économique est envisagé, dans les entreprises de moins de 1 000 salariés (ou en redressement ou liquidation judiciaire, quelle que soit leur taille).

Vous avez un délai de réflexion de 21 jours pour accepter ou refuser. Sans réponse dans ce délai, vous êtes considéré comme ayant refusé, et le licenciement économique suit sa procédure normale (préavis, indemnités, allocation chômage classique).

Si vous acceptez : le contrat de travail prend fin à l'issue du délai de réflexion, sans préavis à effectuer. En échange, vous bénéficiez d'un accompagnement renforcé par France Travail pendant 12 mois maximum, et d'une allocation de sécurisation professionnelle (ASP) qui remplace l'allocation de retour à l'emploi classique. Pour les salariés ayant au moins un an d'ancienneté, l'ASP est en général plus favorable que l'ARE sur les premiers mois.

Refuser le CSP ne vous prive de rien d'autre : vous conservez tous vos droits liés au licenciement économique (préavis, indemnité de licenciement, allocation chômage classique).

Le CSP est prolongé, dans les mêmes conditions, jusqu'au 31 décembre 2026. Au-delà, vérifiez qu'il existe toujours auprès de France Travail ou de votre employeur.

Avant de vous décider, un conseil en évolution professionnelle (CEP) peut vous aider à comparer les deux options selon votre situation.
---
[fiche] id: emploi-demission
titre: Démissionner d'un CDI : le préavis, et ce qui se passe pour le chômage
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La liste des cas de démission légitime
- Les règles du réexamen par l'instance paritaire régionale
texte:
La démission est la façon de quitter un CDI de sa propre décision. Aucune formule n'est imposée, mais une lettre est vivement conseillée : elle doit dire clairement que vous mettez fin au contrat, sans ambiguïté.

Vous effectuez un préavis avant de partir. Sa durée est fixée par votre convention collective ou votre contrat : souvent un mois pour un employé, deux pour un agent de maîtrise, trois pour un cadre. L'employeur peut vous en dispenser.

Le point le plus important : une démission n'ouvre pas droit à l'allocation chômage, sauf si elle entre dans l'un des cas reconnus comme légitimes (suivre son conjoint qui change de lieu de travail, salaires non payés, violences subies au travail, et d'autres).

Si votre démission n'est pas légitime, une seconde voie existe : après quatre mois sans allocation, vous pouvez demander à une commission de revoir votre dossier, en montrant que vous avez vraiment cherché du travail.

Enfin, si vous démissionnez pour vous former ou créer une activité, le dispositif démission-reconversion permet de garder le chômage, à condition de le préparer avant de partir : voyez la fiche du rayon « Se former et se reconvertir ».

Avant de démissionner, faites le point avec un conseil en évolution professionnelle : c'est gratuit.
---
[fiche] id: emploi-fonction-publique
titre: Travailler dans la fonction publique : concours, sans concours, contrat
verifie_le: 2026-10-14
ce_qui_change_souvent:
- Les conditions d'âge et de diplôme de chaque concours et du PACTE
- Les corps de catégorie C ouverts sans concours
texte:
La fonction publique recrute de plusieurs façons, et le concours n'est pas la seule porte d'entrée.

Le concours est la voie la plus courante. Les emplois sont classés en trois catégories : la catégorie A demande en général un diplôme de niveau licence, la catégorie B le baccalauréat, et la catégorie C n'exige en principe aucun diplôme, sauf pour certains métiers. Il existe un concours externe (ouvert à tous ceux qui ont le niveau demandé), un concours interne (réservé aux personnes déjà agents publics) et un troisième concours (pour celles et ceux qui ont une expérience professionnelle, associative ou d'élu). Les conditions exactes se lisent dans l'avis de chaque concours.

Certains emplois de catégorie C, comme adjoint administratif ou adjoint technique, peuvent être obtenus sans concours : l'administration examine alors votre dossier et vous reçoit en entretien. Le PACTE est un contrat en alternance, sans concours, qui peut mener à un poste de fonctionnaire de catégorie C. Il s'adresse à des personnes peu ou pas diplômées de 28 ans au plus, ou à des personnes de 45 ans et plus sans emploi depuis longtemps et qui perçoivent certaines aides (RSA, ASS ou AAH). La formation en alternance est prise en charge par l'administration. Les conditions exactes se vérifient sur l'avis de recrutement.

Enfin, une administration peut aussi recruter des agents contractuels pour des besoins temporaires ou certains emplois permanents. Les offres se trouvent sur « Choisir le service public » et sur le site de l'employeur concerné (mairie, hôpital, département).

Pour savoir où vous renseigner près de chez vous, regardez dans « Qui fait quoi » les centres de gestion de la fonction publique territoriale, qui informent sur les concours.
---
[fiche] id: emploi-interim
titre: L'intérim : comment ça marche, et qu'est-ce que l'intérim qui accompagne vers l'emploi durable ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les durées maximales de mission et les règles de renouvellement
- Le taux de l'indemnité de fin de mission et ses cas d'exclusion
- Les conditions du CDI intérimaire
texte:
L'intérim fait intervenir trois acteurs : vous, l'agence d'intérim qui est votre employeur, et l'entreprise où vous allez travailler pour une mission. Vous signez un contrat de mission avec l'agence ; l'agence et l'entreprise signent un contrat entre elles.

Comme le CDD, l'intérim ne peut servir qu'à des besoins temporaires, pour une durée en général de dix-huit mois au maximum, renouvelable deux fois.

Pendant la mission, vous avez les mêmes droits que les salariés de l'entreprise : même salaire pour le même poste, tickets restaurant, prise en charge des transports, suivi médical.

À la fin, vous recevez une indemnité de fin de mission d'au moins dix pour cent de ce que vous avez gagné, plus une indemnité pour vos congés payés. L'indemnité de fin de mission n'est pas due si l'entreprise vous embauche en CDI juste après.

Il existe aussi le CDI intérimaire, signé avec l'agence, qui garantit un revenu minimum entre les missions.

L'entreprise de travail temporaire d'insertion est une agence d'intérim particulière : elle emploie des personnes qui rencontrent des difficultés et les accompagne pendant leurs missions. On y accède sur orientation d'un conseiller France Travail ou d'un travailleur social.

Pour vous inscrire dans une agence d'intérim, apportez en général : votre CV, une pièce d'identité en cours de validité, votre carte Vitale ou une attestation de droits, un relevé d'identité bancaire, une attestation d'hébergement si vous êtes hébergé, et votre permis de conduire si vous en avez un. Chaque agence peut demander d'autres justificatifs : demandez la liste en prenant rendez-vous.
---
[fiche] id: emploi-licenciement
titre: Le licenciement : la procédure, l'indemnité, le droit au chômage
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le mode de calcul de l'indemnité légale et le salaire de référence
- Les délais de la procédure et de contestation
- Les mesures d'accompagnement du licenciement économique
texte:
Un licenciement met fin à un CDI à l'initiative de l'employeur. Il doit toujours reposer sur un motif réel et sérieux : soit personnel, lié à vous ou à votre travail, soit économique, lié à la situation de l'entreprise.

La procédure est encadrée. L'employeur vous convoque à un entretien préalable, par lettre reçue au moins cinq jours ouvrables avant. Pendant cet entretien, vous pouvez être assisté par un collègue ou un conseiller. Le licenciement ne peut vous être notifié que deux jours ouvrables après, par lettre recommandée qui indique les motifs.

Vous effectuez ensuite un préavis, dont la durée dépend de votre ancienneté et de votre convention, sauf en cas de faute grave.

À partir de huit mois d'ancienneté, vous avez droit à l'indemnité légale de licenciement, calculée sur votre meilleur salaire moyen. Elle n'est pas due en cas de faute grave ou lourde.

Un licenciement ouvre le droit à l'allocation chômage, quel que soit le motif. Pour un licenciement économique, un accompagnement renforcé vous est en général proposé.

Si vous contestez le motif ou la procédure, vous pouvez saisir le conseil de prud'hommes dans un délai de douze mois après la notification. Un point-justice ou l'inspection du travail peut vous renseigner avant.
---
[fiche] id: emploi-periode-d-essai
titre: La période d'essai : combien de temps, qui peut y mettre fin, avec quel délai ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Les durées maximales par catégorie et les règles de renouvellement
- Les durées prévues par les conventions collectives
texte:
La période d'essai sert à vérifier, des deux côtés, que le poste convient. Elle n'est pas obligatoire : si elle existe, elle est écrite dans le contrat.

Pour un CDI, la durée maximale dépend de votre catégorie : deux mois pour un ouvrier ou un employé, trois mois pour un agent de maîtrise ou un technicien, quatre mois pour un cadre. Elle peut être renouvelée une fois si la convention de branche le prévoit et si le contrat le mentionne, avec votre accord écrit.

Pour un CDD, elle est plus courte : un jour par semaine de contrat, sans dépasser deux semaines pour un contrat de six mois ou moins, un mois au-delà.

Pendant cette période, l'employeur comme vous pouvez arrêter le contrat sans avoir à vous justifier. Mais il faut prévenir à l'avance. Quand c'est l'employeur qui met fin, le délai augmente avec votre ancienneté : vingt-quatre heures la première semaine, quarante-huit heures jusqu'à un mois, deux semaines ensuite, un mois après trois mois de présence. Quand c'est vous, le délai est de quarante-huit heures, ramené à vingt-quatre heures si vous êtes là depuis moins de huit jours.

Une rupture pendant l'essai n'ouvre pas les mêmes droits qu'un licenciement. Pour un cas précis, l'inspection du travail ou un point-justice peut vous renseigner.
---
[fiche] id: emploi-qpv-frr
titre: QPV et zones rurales fragiles (FRR) : des aides liées au territoire
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le classement exact des communes en FRR / FRR+ (révisé périodiquement)
texte:
Deux zonages du territoire peuvent ouvrir des aides, sans lien avec votre parcours personnel : ils dépendent seulement de l'adresse.

**QPV** (quartier prioritaire de la politique de la ville) : un quartier urbain classé fragile par l'État selon le revenu de ses habitants. Le classement se vérifie à l'adresse exacte, pas à la ville entière.

**FRR** (zone France Ruralités Revitalisation) : une commune rurale classée fragile, avec un niveau renforcé (FRR+) pour les communes les plus isolées. Ce zonage a remplacé, en juillet 2024, les zones de revitalisation rurale (ZRR), un nom que vous pouvez encore croiser dans d'anciens documents. Un simulateur officiel permet de vérifier si une commune est classée.

**Point important, daté** : l'emploi franc, l'aide à l'embauche autrefois liée aux QPV, **a pris fin le 31 décembre 2024** et n'a pas été reconduite. Si un site ou un document en parle encore comme d'une aide disponible, la date de publication est probablement ancienne : aucune embauche à partir de 2025 n'y ouvre plus droit.

Pour savoir ce qui reste actif pour une adresse précise (aides à la création d'entreprise en zone FRR, par exemple), le mieux est de vérifier directement sur le simulateur officiel ou de demander à un conseiller.
---
[fiche] id: emploi-quand-un-contrat-se-termine
titre: Quand un contrat se termine : les documents, le solde de tout compte, la mutuelle
verifie_le: 2026-10-05
ce_qui_change_souvent:
- Le délai pour contester le reçu pour solde de tout compte
- La durée de la portabilité de la mutuelle
texte:
Quel que soit le motif, quand un contrat se termine, l'employeur doit vous remettre trois documents le dernier jour.

Le certificat de travail indique vos dates d'emploi et le poste occupé. L'attestation destinée à France Travail sert à ouvrir vos droits au chômage : l'employeur la transmet directement à France Travail, le plus souvent par la déclaration sociale, et vous en remet un exemplaire signé. Gardez-le : il peut vous être demandé. Le reçu pour solde de tout compte liste les sommes qui vous sont versées : dernier salaire, indemnités, congés payés non pris.

Le reçu pour solde de tout compte ne vous fait pas renoncer à vos droits. Si vous l'avez signé, vous avez six mois pour le contester ; si vous ne l'avez pas signé, le délai est plus long.

Vous pouvez garder la mutuelle de l'entreprise gratuitement, jusqu'à douze mois après la fin du contrat, à condition d'être indemnisé par l'assurance chômage. L'employeur doit vous informer de ce droit.

En cas de désaccord sur les sommes versées, ou sur le motif de la fin du contrat, c'est le conseil de prud'hommes qui tranche. Avant d'y aller, un point-justice ou l'inspection du travail peut vous renseigner gratuitement.
---
[fiche] id: emploi-rupture-conventionnelle
titre: La rupture conventionnelle, comment ça marche ?
verifie_le: 2026-10-05
ce_qui_change_souvent:
- La durée maximale d'indemnisation chômage après une rupture conventionnelle
- Le montant de l'indemnité minimale (indexé sur l'indemnité légale de licenciement)
- Les délais de rétractation et d'homologation
texte:
La rupture conventionnelle met fin à un CDI d'un commun accord. Elle n'est ni un licenciement, ni une démission, et elle ne peut être imposée par personne.

Elle passe par un ou plusieurs entretiens, pendant lesquels vous pouvez être assisté. Vous signez ensuite une convention qui fixe la date de fin et le montant de l'indemnité.

Après la signature, chacun a quinze jours calendaires pour changer d'avis. Passé ce délai, la convention est envoyée à l'administration pour homologation : elle a quinze jours ouvrables pour vérifier, et son silence vaut accord.

L'indemnité versée ne peut pas être inférieure à l'indemnité légale de licenciement à laquelle vous auriez eu droit.

Après une rupture conventionnelle, vous avez droit à l'allocation chômage. Attention : pour les ruptures conventionnelles individuelles dont le contrat se termine à partir du 1er septembre 2026, la durée maximale d'indemnisation est raccourcie : quinze mois avant cinquante-cinq ans, au lieu de dix-huit, et vingt mois et demi à partir de cinquante-cinq ans. C'est la date de fin de contrat inscrite dans la convention qui compte. Ces règles changent régulièrement : vérifiez-les sur le site officiel.

Avant de signer, prenez le temps de comparer avec les autres options (démission-reconversion, projet de transition professionnelle). Un conseil en évolution professionnelle peut vous y aider.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: emploi] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S25 : Comprendre le cadre, contrôler le rayon « Logement » (fiche par fiche)

*Les fiches du rayon sont dans le message, avec leur date de dernière vérification.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens une base de fiches d'information pour un module d'accompagnement en insertion professionnelle. Voici toutes les fiches actuelles du rayon « logement », avec leur date de dernière vérification.

Ton rôle : pour CHAQUE fiche, vérifie sur le web si l'information est toujours exacte AUJOURD'HUI. Tu NE RÉÉCRIS RIEN. Tu rends seulement un rapport court, fiche par fiche.

Cas particulier à ne pas rater : si le dispositif décrit par une fiche a été supprimé, fermé, ou entièrement remplacé (la fiche ne décrit plus rien qui existe encore), ne le classe pas en simple « changement ». Classe-le PRINCIPE OBSOLETE et dis dans le résumé ce qui l'a remplacé, s'il y a quelque chose.

Pour chaque fiche, indique les pages que tu as ouvertes pour vérifier (avec leur adresse). Une vérification faite « de mémoire », sans page consultée, n'en est pas une : dans ce cas, l'état est INCERTAIN, jamais A JOUR. A JOUR veut dire : tu as retrouvé l'information sur une source officielle à jour.

PREUVE, obligatoire pour chaque fiche : ajoute une ligne « preuve: » juste après la ligne « etat: » (ou « depuis: »), avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information vérifiée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas du texte de la fiche ci-dessus. Si tu n'as ouvert aucune page pour une fiche, écris « preuve: aucune » et mets l'état INCERTAIN. Une fiche A JOUR sans preuve utilisable sera comptée comme INCERTAIN par l'outil.

Réponse en plusieurs fois : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une fiche, ferme le bloc par [/CONTROLE], puis écris la ligne « SUITE DISPONIBLE : il reste [identifiants des fiches restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la fiche suivante dans un nouveau bloc [CONTROLE rayon: ...], sans répéter ce qui est déjà donné. Ne saute jamais une fiche en silence et ne raccourcis jamais la liste pour la faire tenir. Le bloc [NOUVEAUX-SUJETS] ne va que dans la toute dernière réponse.

Territoires concernés : les départements de la Dordogne (24) et de la Haute-Vienne (87), région Nouvelle-Aquitaine. Les fiches valent pour les deux : si un point diffère de l'un à l'autre (aide départementale, structure locale), dis-le dans le résumé de la fiche.
Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

=== FICHES DU RAYON ===
[fiche] id: logement-action-logement
titre: Entrer dans un logement : la garantie Visale et l'avance Loca-Pass
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les conditions d'âge et de ressources de Visale et de Loca-Pass
- Les plafonds de loyer garantis
- Le montant maximum de l'avance Loca-Pass
texte:
Deux obstacles reviennent souvent à l'entrée d'un logement : ne pas avoir de garant, et ne pas pouvoir avancer le dépôt de garantie. Action Logement propose une réponse pour chacun.

La garantie Visale remplace le garant. Si vous ne payez pas le loyer, Action Logement paie le propriétaire à votre place, puis vous demande de rembourser. C'est gratuit. Depuis le début de 2026, la garantie couvre les trois premières années du bail ; au-delà, elle peut être reconduite si vous restez éligible et que vous en faites la demande. Elle est ouverte sans condition de revenus aux jeunes de trente ans ou moins et aux personnes qui changent de région pour le travail ; les autres salariés du privé y ont droit sous un plafond de salaire. Il y a aussi un plafond de loyer, plus élevé dans les grandes villes.

Le propriétaire doit accepter Visale : présentez-lui l'attestation, que vous obtenez sur le site avant de signer le bail.

L'avance Loca-Pass est un prêt sans intérêt pour verser le dépôt de garantie, jusqu'à mille deux cents euros, que vous remboursez ensuite en petites mensualités.

Les deux se demandent sur le site d'Action Logement : Visale avant de signer le bail, l'avance Loca-Pass au plus tard deux mois après être entré dans le logement. Un travailleur social ou un point d'information sur le logement peut vous aider à monter le dossier.
---
[fiche] id: logement-aides-au-logement-caf
titre: Les aides au logement de la CAF (APL, ALF, ALS) : qui y a droit ?
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les plafonds de loyer et de ressources
- Le mode de calcul et sa périodicité
- Les conditions pour les étudiants étrangers
texte:
La CAF verse une aide au logement à beaucoup de locataires aux revenus modestes. Il en existe trois : l'APL, l'ALS et l'ALF. On ne peut en toucher qu'une seule, et c'est la CAF, ou la MSA pour le régime agricole, qui détermine laquelle vous concerne selon votre logement et votre situation.

Pour y avoir droit, le logement doit être votre résidence principale, décent, situé en France, et le loyer ne doit pas dépasser un certain plafond. Le montant dépend de vos ressources, de la composition de votre foyer et de l'endroit où vous habitez.

Vos ressources sont recalculées tous les trois mois, sur la base des douze derniers mois : si vos revenus baissent, l'aide augmente sans que vous ayez de démarche à faire, à condition de bien déclarer vos changements.

La demande se fait en ligne, sur le site de la CAF ou de la MSA. L'aide est le plus souvent versée directement au propriétaire, qui la déduit de votre loyer. Elle commence le mois qui suit votre demande : pensez à faire la démarche dès l'entrée dans le logement.

Depuis le 1er juillet 2026, un étudiant étranger hors Europe n'y a droit que s'il touche une bourse sur critères sociaux, s'il travaille ou s'il est en alternance.

Elle n'est pas versée si votre propriétaire est un de vos parents ou grands-parents. Pour une simulation, utilisez l'outil sur le site de la CAF.
---
[fiche] id: logement-demande-de-logement-social
titre: Demander un logement social : le numéro unique, les pièces, le renouvellement
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les plafonds de ressources, revus chaque année
- Les pièces demandées et les modalités de dépôt
texte:
Le logement social, ou HLM, est un logement à loyer modéré, attribué sous conditions de ressources. Y prétendre demande une démarche à ne pas remettre à plus tard.

Vous déposez une seule demande (une par département, sauf en Île-de-France où un seul dossier couvre toute la région), en ligne sur le site officiel ou à un guichet : mairie, bailleur social, ou Action Logement. Un numéro unique d'enregistrement vous est attribué. Notez-le : il sert à suivre votre demande et à la renouveler.

Il faut joindre une pièce d'identité et votre avis d'imposition des revenus d'il y a deux ans. Vos ressources ne doivent pas dépasser un plafond, qui dépend de la taille de votre foyer et de la région.

Point important : la demande doit être renouvelée chaque année. Si vous oubliez, elle est annulée et vous perdez toute votre ancienneté.

Le délai d'attente varie beaucoup selon les territoires. Les personnes sans logement, menacées d'expulsion, victimes de violences ou en situation de handicap sont prioritaires. C'est une commission qui décide de chaque attribution.

Si vous attendez depuis un délai anormalement long, vous pouvez faire un recours au titre du droit au logement opposable : voyez la fiche du rayon.

Une agence d'information sur le logement ou un travailleur social peut vous aider à remplir le dossier et à cibler les bons secteurs.
---
[fiche] id: logement-droit-au-logement-opposable
titre: Le droit au logement opposable (DALO) : faire reconnaître un besoin prioritaire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les critères pour être reconnu prioritaire
- Les délais de la commission et de la proposition de logement
- Les départements où le recours est dématérialisé
texte:
Le droit au logement opposable est un recours de dernier ressort, quand une personne est sans logement ou très mal logée et que rien n'avance.

Vous saisissez la commission de médiation de votre département, avec un formulaire, souvent en ligne. Vous pouvez être reconnu prioritaire si vous êtes, par exemple, sans logement, menacé d'expulsion sans relogement, hébergé en structure ou à l'hôtel social depuis plus de six mois, logé dans un local impropre à l'habitation, ou dans un logement insalubre ou trop petit avec un enfant ou une personne handicapée, ou encore en attente d'un logement social depuis un délai anormalement long.

La commission a trois mois pour répondre, parfois six selon le département. Si elle vous reconnaît prioritaire, le préfet doit vous faire une proposition de logement dans un délai de trois à six mois.

Si la commission refuse, vous avez deux mois pour contester. Si vous êtes reconnu prioritaire mais qu'aucune proposition n'arrive, vous pouvez saisir le tribunal administratif dans un délai de quatre mois.

Ce recours ne dispense pas de faire une demande de logement social classique en parallèle. Une agence d'information sur le logement ou un travailleur social peut vous aider à remplir le dossier.
---
[fiche] id: logement-expulsion
titre: Menacé d'expulsion : les étapes de la procédure, ce qu'on peut faire
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les délais de la procédure et les possibilités de délais accordés par le juge
- Les aides mobilisables pour rembourser une dette de loyer
texte:
Un propriétaire ne peut jamais vous forcer à quitter votre logement sans une décision de justice, même en cas de loyers impayés. La procédure suit des étapes, avec un délai à chacune.

Elle commence par un commandement de payer, remis par un commissaire de justice : vous avez alors six semaines pour régler la dette ou trouver un accord. Sans solution, le propriétaire saisit le juge. À l'audience, vous pouvez expliquer votre situation. Le juge peut accorder des délais de paiement, jusqu'à trois ans, si vous reprenez le paiement du loyer courant : la procédure d'expulsion est alors suspendue.

Si l'expulsion est prononcée, un commandement de quitter les lieux vous laisse deux mois. Ensuite seulement, le propriétaire peut demander le concours de la force publique. Et du 1er novembre au 31 mars, la trêve hivernale suspend toute expulsion.

Ce qu'il faut faire, le plus tôt possible : ne quittez pas le logement de vous-même, contactez une agence d'information sur le logement, un travailleur social ou le centre communal d'action sociale. Le fonds de solidarité pour le logement peut aider à rembourser la dette. Vous pouvez aussi appeler SOS loyers impayés, un service gratuit.

Si vous êtes menacé d'expulsion sans solution de relogement, voyez aussi la fiche sur le droit au logement opposable.
---
[fiche] id: logement-fonds-de-solidarite-logement
titre: Le fonds de solidarité pour le logement : aide à l'entrée et aux impayés
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les conditions de ressources, fixées par chaque département
- La liste des dépenses prises en charge
- Le partage entre prêt et subvention
texte:
Le fonds de solidarité pour le logement est une aide du conseil départemental. Chaque département fixe ses propres conditions de ressources.

Il aide à deux moments.

À l'entrée dans un logement, il peut financer le dépôt de garantie, le premier loyer, les frais d'agence, l'assurance habitation, l'ouverture des compteurs, le déménagement, ou l'achat de meubles de première nécessité. Il peut aussi servir de garant.

Pour se maintenir dans un logement, il peut aider à rembourser une dette de loyer ou de charges, ou des factures d'énergie, d'eau ou de téléphone, et couvrir des frais de procédure.

L'aide peut être un prêt ou une somme donnée, selon votre situation. Elle n'est accordée que si le loyer, une fois les aides au logement déduites, reste tenable pour votre budget.

La demande ne se fait pas seul : elle passe par un travailleur social, qui monte le dossier avec vous. Adressez-vous au centre communal d'action sociale, au conseil départemental, ou à la personne qui vous accompagne. Une agence d'information sur le logement peut aussi vous orienter.
---
[fiche] id: logement-proprietaire-sans-moyens-travaux
titre: J'ai hérité d'un logement sans pouvoir l'entretenir : à qui m'adresser
verifie_le: 2026-10-27
ce_qui_change_souvent:
- Les aides de l'Anah et leurs conditions
- Les prêts d'Action Logement pour les salariés
- L'accueil de France Rénov' dans chaque département
texte:
Quand on est propriétaire d'un logement et qu'il faut y faire des travaux, plusieurs acteurs existent, chacun pour un besoin différent.

France Rénov' est le service public gratuit qui informe les propriétaires sur les travaux de rénovation et d'adaptation du logement. C'est la porte d'entrée vers les aides de l'Anah.

L'Anah, l'Agence nationale de l'habitat, accorde des aides aux propriétaires qui occupent leur logement, selon leurs ressources : MaPrimeRénov' pour les travaux d'économie d'énergie, MaPrimeAdapt' pour adapter le logement, MaPrimeLogement Décent pour le mettre en sécurité. Ces aides se demandent en passant par France Rénov'.

Action Logement propose, aux salariés de certaines entreprises du secteur privé, des prêts à conditions avantageuses pour des travaux ou pour acheter, et un service d'accompagnement social gratuit et confidentiel quand le logement est en difficulté.

L'ADIL de votre département donne un conseil gratuit et neutre sur le logement, y compris sur les aides aux travaux. SOLIHA est une association qui accompagne la rénovation et l'adaptation des logements.

Les conditions, les montants et les plafonds de chaque aide sont dans les fiches du Lexique indiquées en bas de cette page.
---
[fiche] id: logement-residences-sociales-fjt
titre: Se loger en résidence sociale, en foyer de jeunes travailleurs, ou par une association
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Les places disponibles et les délais d'attente
- Les conditions d'âge et de ressources
texte:
Entre l'hébergement d'urgence et un logement classique, il existe des solutions à loyer modéré, souvent meublées, et parfois avec un accompagnement.

Le foyer de jeunes travailleurs, aussi appelé Habitat Jeunes, accueille les jeunes actifs de seize à vingt-cinq ans, parfois jusqu'à trente ans : un logement meublé à petit prix, plus une équipe qui aide à devenir autonome. Il ouvre droit à l'aide au logement de la CAF.

La résidence sociale, la pension de famille ou la maison relais offrent un logement durable à petit loyer, avec une présence sociale sur place, pour des personnes isolées en difficulté.

L'intermédiation locative permet à une association de louer un logement du parc privé et de vous le sous-louer, ou de se porter garante à votre place, à un loyer adapté à vos ressources, avec un suivi.

Ces solutions ne se trouvent pas seul sur les sites d'annonces. L'orientation passe le plus souvent par le SIAO du département, un travailleur social, ou une agence d'information sur le logement. C'est à eux qu'il faut s'adresser en premier.
---
[fiche] id: logement-sans-hebergement-urgence
titre: Sans hébergement, à la rue : à qui s'adresser
verifie_le: 2026-10-13
ce_qui_change_souvent:
- Le nombre de places d'hébergement d'urgence disponibles
- Les horaires et adresses des accueils de jour
- Les dispositifs renforcés en période de grand froid
texte:
Chercher un emploi est presque impossible quand on ne sait pas où dormir. Il existe un réseau pour ces situations, et il faut le connaître.

Le premier réflexe, c'est le 115. Ce numéro est gratuit et répond jour et nuit. Une personne écoute, fait le point sur la situation, et oriente vers une place d'hébergement d'urgence quand il y en a une. Le 115 est géré par le SIAO, la plateforme du département qui coordonne toutes les places.

En principe, l'hébergement d'urgence accueille sans condition de papiers ni de ressources, et on ne remet personne à la rue sans solution. Dans les faits, les places manquent souvent, mais il faut appeler quand même : c'est ainsi que la demande est enregistrée.

En journée, les accueils de jour permettent de se poser au chaud, de se laver, de laver son linge, de recevoir son courrier et de rencontrer un travailleur social. Des maraudes vont aussi à la rencontre des personnes dans la rue.

Une démarche à faire vite : la domiciliation. C'est le droit d'avoir une adresse administrative pour recevoir son courrier et accéder à ses droits, comme le RSA ou la couverture santé. Elle se demande au centre communal d'action sociale de la commune. C'est gratuit et valable un an.

Pour l'aide alimentaire, voyez la fiche du rayon budget. Pour les adresses de votre secteur, voyez « Près de chez moi » ou un travailleur social.
=== FIN ===

Termine par un bloc entre [CONTROLE rayon: logement] et [/CONTROLE]. Une entrée par fiche, dans cet ordre :
fiche: l'identifiant de la fiche, repris exactement
etat: A JOUR | CHANGEMENT | PRINCIPE OBSOLETE | INCERTAIN
depuis: AAAA-MM (seulement si CHANGEMENT ou PRINCIPE OBSOLETE ; le mois de la dernière vérification rappelé plus haut)
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot
resume: deux ou trois lignes maximum, ce qui a changé concrètement (« rien à signaler » si A JOUR)
sources:
- une adresse officielle par ligne, celles où tu l'as vérifié

Ensuite, APRÈS la ligne [/CONTROLE], ajoute un second bloc entre [NOUVEAUX-SUJETS] et [/NOUVEAUX-SUJETS] : jusqu'à 5 sujets IMPORTANTS pour ce rayon, utiles à une personne en insertion professionnelle, que les fiches ci-dessus ne couvrent pas du tout. Ne propose rien qui soit déjà traité par l'une de ces fiches. Si tu n'en vois aucun, écris seulement « aucun » dans ce bloc. Une entrée par sujet :
sujet: une question qu'une personne se pose vraiment
resume: une phrase, pourquoi ce sujet manque et ce qu'il faudrait y dire
sources:
- une adresse officielle par ligne, celles où tu as vu l'information

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S26 : Comprendre le cadre, ce qui circule dans le réseau (à confronter)

*Signaux non officiels recoupés avec l'officiel.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je prépare des pistes de réflexion pour un conseiller en insertion professionnelle. Je veux savoir ce qui se dit dans le réseau des professionnels de l'insertion sur le trimestre « juillet à septembre 2026 » (du 01/07/2026 au 30/09/2026 inclus), et le confronter à l'information officielle.

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire.

Étape 1, le terrain : cherche sur des sources NON officielles orientées métier ce qui revient sur l'accompagnement vers l'emploi, l'insertion, la formation, les aides, les publics en difficulté : publications LinkedIn de conseillers en insertion, de France Travail, de missions locales, de structures de l'insertion par l'activité économique ; lettres d'information de réseaux professionnels ; groupes et pages métier ; blogs spécialisés emploi-formation. On cherche le SIGNAL FAIBLE, pas l'actualité déjà officielle : une pratique de terrain qui se répand, une inquiétude qui circule (fermeture, gel de crédits, délai qui se dégrade), une consigne interne relayée, un écart entre ce que disent les collègues et ce que dit le texte. N'inclus PAS un événement déjà annoncé par une administration ou France Travail (job dating, semaine des métiers, tournée d'un dispositif) : ça relève du Balayage, pas d'ici. Zone : Nouvelle-Aquitaine, les départements de la Dordogne (24) et de la Haute-Vienne (87) quand c'est local.

Étape 2, la confrontation : pour CHAQUE point retenu, fais une recherche web sur les sources officielles (service-public.fr, Légifrance, ministères, France Travail, France compétences, CARIF-OREF, INSEE, DARES) et dis ce qu'elles disent, ou si elles ne disent rien. Puis classe le point.

Ne donne pas d'avis sur les personnes, pas de conseil, pas de ton alarmiste. Tu rapportes un signal et tu le recoupes.

COMMENT TRAVAILLER : rien de rappelé de mémoire, ce que tu rapportes vient de pages que tu as ouvertes. « rien trouvé » dans la confrontation n'est permis qu'après avoir ouvert au moins deux pages officielles différentes, en les nommant. Un point que tu ne peux pas confronter reçoit le statut PAS DE POSITION, jamais un statut déduit. Une adresse = une seule URL complète, sans lien cliquable ni parenthèses.

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Ici la preuve est la page OFFICIELLE que tu as lue pour la confrontation. Si ta confrontation est « rien trouvé » (permis seulement après deux pages officielles ouvertes, nommées dans la confrontation), écris « preuve: aucune ». L'outil ouvrira les pages citées pour y retrouver ces passages.

Termine par un bloc entre [CONFRONTER periode: juillet à septembre 2026] et [/CONFRONTER]. Un point par entrée, séparé du suivant par une ligne vide, chacun décrit par sept lignes « champ: valeur » dans cet ordre :
signal: ce qui se dit, en une ou deux phrases
d_ou: le type de source (ex. « publication LinkedIn d'un conseiller », « lettre d'un réseau »), sans nom de personne
rayon: un de ces mots, celui qui colle le mieux, ou « général » : etranger, mobilite, jeunes, handicap, emploi, former, creer, employeurs, accompagnement, justice, budget, logement, garde, francais, juridique, seniors, sante
confrontation: ce que disent les sources officielles, ou « rien trouvé »
statut: CONFIRME | EN PARTIE | INEXACT | PAS DE POSITION
a_recouper: ce qu'un CIP devrait vérifier lui-même pour être sûr
preuve: https://adresse-exacte-de-la-page-lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot

Si rien de solide ne ressort ce trimestre, écris une seule ligne « signal: Rien retenu ce trimestre ».
Sans puce, sans gras, sans note de bas de page dans le bloc.

[CONFRONTER periode: juillet à septembre 2026]
signal: ...
d_ou: ...
rayon: ...
confrontation: ...
statut: EN PARTIE
a_recouper: ...
preuve: ...

signal: ...
(etc.)

[/CONFRONTER]

Après [/CONFRONTER], en dehors de ce bloc, écris les sites que tu n'as pas pu ouvrir :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S27 : Comprendre les chiffres, les 5 chiffres clés et la lecture du territoire : Dordogne (24)

*Un message par département : ne jamais les mélanger.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue un digest trimestriel de chiffres clés pour des professionnels de l'insertion et des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur, avec sa source, la date exacte de la donnée, la valeur du trimestre précédent et celle du même trimestre l'an dernier si tu les as. Trimestre de référence : « juillet à septembre 2026 » (du 01/07/2026 au 30/09/2026 inclus). Ces dates sont exactes.

Territoires : le département de la Dordogne (24), la région Nouvelle-Aquitaine, la France entière. Ne mélange jamais les territoires ; une entrée par territoire. RÈGLE ABSOLUE, valable pour TOUT texte libre que tu écris ici (y compris un éventuel « repère ») : le texte d'un territoire ne nomme jamais un autre territoire suivi ici (jamais « comme en Dordogne », « contrairement à la Haute-Vienne »...) - un département sera un jour comparé à d'autres départements que ceux suivis aujourd'hui. Seules comparaisons autorisées : à la moyenne nationale/régionale (sans nommer un département précis), ou aux périodes précédentes du même territoire.

Indicateurs (les 5 du module, dans cet ordre) :
1. Taux de chômage localisé (au sens du Bureau international du travail). Paraît avec un trimestre de retard : donne le dernier trimestre publié, ne l'avance pas. Le dernier trimestre est souvent provisoire : dis-le.
2. Nombre de demandeurs d'emploi inscrits à France Travail, catégorie A ; et le total A+B+C ; pour le département de la Dordogne (24), la région et la France. SOURCE À UTILISER (vérifiée le 2026-09-12, donne un vrai historique) : Dares, fichier « Demandeurs d'emploi inscrits à France Travail, Stock France et régions (trimestrielles, CVS-CJO) », https://www.data.gouv.fr/datasets/demandeurs-demploi-inscrits-a-france-travail-stock-france-et-regions-trimestrielles-cvs-cjo/ - malgré son nom, ce fichier contient une vraie colonne « Département » (101 départements, pas seulement des totaux régionaux), en données CVS-CJO. Filtre Sexe = Total, Tranche d'âge = Total, Ancienneté = Total, Catégorie = A (puis ABC pour le total). Donne directement les 8 derniers trimestres pour la ligne « serie ». N'utilise PAS le fichier « par zone d'emploi » pour cet indicateur : il n'existe qu'en données brutes (non désaisonnalisées) depuis l'arrêt de la CVS-CJO à ce niveau en 2021, incompatible avec le reste du digest. ATTENTION : ce fichier est gros (plus de 20 Mo) et demande un vrai filtrage de données, pas juste une lecture de page web - une IA de recherche web simple peut ne pas y arriver seule. Si elle bloque, apportez le fichier (ou la question) à Claude, qui peut l'analyser directement.
3. Part des inscrits depuis plus d'un an (chômage de longue durée) parmi les A+B+C, pour le département de la Dordogne (24), la région Nouvelle-Aquitaine ET la France. MÊME SOURCE que l'indicateur 2 (colonne Ancienneté = « Un an ou plus » divisée par Ancienneté = « Total », Catégorie = ABC) : donne directement les 8 derniers trimestres. Vérification croisée déjà faite pour la Nouvelle-Aquitaine le 2026-09-12 : ce calcul tombe exactement sur le chiffre déjà publié par la note DREETS.
4. Emploi salarié : la variation sur le trimestre (en %) - jamais un décompte en nombre, pour rester comparable et cohérent d'un trimestre à l'autre - pour le département de la Dordogne (24), la région et la France (bulletin INSEE « Informations rapides » du trimestre, comparaisons régionales et départementales). Historique réparti sur plusieurs bulletins trimestriels distincts (pas un seul fichier) : reporte la ligne « serie » du digest du trimestre précédent pour cet indicateur (les 4 territoires) et ajoute ce nouveau point à la suite.
5. Nombre d'offres d'emploi diffusées par France Travail, cumul sur douze mois glissants (panorama Data Emploi), pour le département de la Dordogne (24), la région Nouvelle-Aquitaine ET la France entière (adresses : .../emploi/panorama/DEP/<code>, .../emploi/panorama/REG/<code région>, .../emploi/panorama/NAT/FR sur dataemploi.francetravail.fr). Donne aussi la tendance sur un an : sur l'onglet « Offres et demandeurs > Rapprochement > Offres d'emploi » de ce même site, le graphique donne, pour le dernier trimestre, une évolution annuelle en pourcentage (distincte du cumul douze mois) - c'est cette valeur qu'il faut reporter en « en hausse/en baisse d'environ X % par rapport à un an plus tôt ». Donne aussi la part d'embauches trimestrielles qui durent plus d'un mois (case « Embauches » du panorama), pour ces mêmes 3 territoires - la période disponible peut différer de celle des offres, donne-la telle quelle. CAS PARTICULIER pour cette part : contrairement au chômage, aucune source connue n'a d'historique - donne seulement le trimestre en cours, tu ne peux pas trouver de série ancienne (ce n'est pas une erreur de recherche). Avant d'assembler le digest, reporte la ligne « serie » du digest du trimestre précédent pour cet indicateur et ajoute ce nouveau point à la suite, sinon l'historique repart de zéro.
6. Où se situer : dans le même tableau INSEE que l'indicateur 1 (taux de chômage localisé par département et par région, dernier trimestre publié), le département français au taux le plus bas et celui au taux le plus haut (nom + valeur), puis la région française la plus basse et la plus haute (nom + valeur). Une seule fois pour le trimestre, indépendant du département choisi ci-dessus.
7. Zones d'emploi du département choisi (le département de la Dordogne (24)) : le même taux de chômage localisé que l'indicateur 1, mais pour CHAQUE zone d'emploi qui compose ce département (même fichier INSEE « Taux de chômage par zone d'emploi » que l'indicateur 1, colonne « zone d'emploi » au lieu de « département »). Donne le nom de chaque zone et sa valeur au même trimestre. Sert à alimenter le bloc « Les écarts à l'intérieur du département » de la Vue d'ensemble - jamais un classement, une donnée brute à mettre à jour.
8. Départements suivis dans le bloc « Les écarts entre départements de la région » : le même taux de chômage localisé que l'indicateur 1 (même tableau INSEE département/région que l'indicateur 6), pour ces 4 départements précis de Nouvelle-Aquitaine : Deux-Sèvres, Lot-et-Garonne, Dordogne et Haute-Vienne. Juste la valeur trimestrielle de chacun, une donnée brute à mettre à jour - le texte d'explication de `departements-region.md` est structurel et n'a pas besoin d'être refait à chaque trimestre, sauf si l'écart entre eux change nettement.
9. Régions suivies dans le bloc « Les écarts entre régions de France » : le même taux de chômage localisé que l'indicateur 1, mais dans l'onglet « Région » du même tableau INSEE (pas « Département »), pour ces 3 régions précises : Pays de la Loire, Hauts-de-France et Nouvelle-Aquitaine. Juste la valeur trimestrielle de chacune, une donnée brute à mettre à jour - le texte d'explication de `regions-france.md` est structurel et n'a pas besoin d'être refait à chaque trimestre, sauf si l'écart entre elles change nettement (par exemple si Pays de la Loire ou Hauts-de-France perdent leur position d'extrême).

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Cherche sur : l'INSEE (taux de chômage localisés, estimations trimestrielles d'emploi), la DARES et France Travail (STMT, offres collectées, statistiques.francetravail.org), l'Observatoire des territoires pour la part de longue durée.

Produis une entrée pour CHAQUE indicateur et CHAQUE territoire demandé, même sans valeur (« valeur: non trouvée » + où tu as cherché). N'en omets aucun. Pas d'avis, pas de commentaire d'opportunité. Quand la donnée vient d'un PDF ou d'un tableau de bord, donne l'adresse directe.

POUR LE TAUX DE CHÔMAGE (chaque territoire) et POUR LES INSCRITS CATÉGORIE A, ajoute une ligne « serie » avec les 6 à 8 derniers trimestres connus, sous la forme « T3 2024: 7,7 % ; T4 2024: 7,6 % ; ... » (point-virgule entre les points). Sinon « serie » reste vide.

Ne rédige PAS de texte de synthèse ni d'interprétation (pas de bloc [LECTURE] ni [SYNTHESE-COURTE]) : cette partie est rédigée séparément avec Claude, à partir des chiffres collectés ici. Contente-toi des chiffres bruts, sourcés, ci-dessous.

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un indicateur entier, ferme le bloc ouvert par [/CHIFFRES], puis écris la ligne « SUITE DISPONIBLE : il reste les indicateurs [numéros restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [CHIFFRES...], sans répéter ce qui est déjà donné. Ne saute jamais un indicateur en silence et ne raccourcis jamais la liste pour la faire tenir. Les blocs [OU-SE-SITUER], [ZONES-EMPLOI], [DEPARTEMENTS-REGION] et [REGIONS-FRANCE] (indicateurs 6 à 9) comptent comme des indicateurs : un seul de chaque, dans la réponse où tu les traites.

Format de sortie. D'abord le bloc chiffres, entre [CHIFFRES periode: juillet à septembre 2026] et [/CHIFFRES]. Une entrée par ligne de résultat (un indicateur a plusieurs entrées, une par territoire), lignes « champ: valeur » dans cet ordre (indicateur, territoire, valeur, date_donnee, valeur_precedente, valeur_an_precedent, serie, source), séparées par une ligne vide.
[CHIFFRES periode: juillet à septembre 2026]
indicateur: Taux de chômage localisé
territoire: Dordogne (24)
valeur: 7,8 %
date_donnee: 1er trimestre 2026 (provisoire)
valeur_precedente: 7,9 %
valeur_an_precedent: 8,1 %
serie: T3 2024: 8,3 % ; T4 2024: 8,1 % ; T1 2025: 8,0 % ; T2 2025: 7,9 % ; T3 2025: 7,9 % ; T4 2025: 7,9 % ; T1 2026: 7,8 %
source: nom-court | titre | https://adresse | AAAA-MM-JJ

indicateur: ...
territoire: ...
(etc.)
[/CHIFFRES]

Puis le bloc « où se situer » (une seule fois, pas par territoire) :
[OU-SE-SITUER]
departement_bas: Cantal | 4,7 % | 1er trimestre 2026
departement_haut: Pyrénées-Orientales | 12,7 % | 1er trimestre 2026
region_bas: Pays de la Loire | 6,6 % | 1er trimestre 2026
region_haut: Hauts-de-France | 9,8 % | 1er trimestre 2026
source: nom-court | titre | https://adresse | AAAA-MM-JJ
[/OU-SE-SITUER]

Puis le bloc zones d'emploi (indicateur 7, une entrée par zone) :
[ZONES-EMPLOI]
zone: <nom de la 1ère zone>
valeur: 7,8 %

zone: <nom de la 2e zone>
valeur: 8,1 %
(etc., une entrée par zone du département)
[/ZONES-EMPLOI]

Puis le bloc départements de la région (indicateur 8, une entrée par département) :
[DEPARTEMENTS-REGION]
departement: Deux-Sèvres
valeur: 6,0 %

departement: Lot-et-Garonne
valeur: 8,2 %

departement: Dordogne
valeur: 7,8 %

departement: Haute-Vienne
valeur: 7,4 %
[/DEPARTEMENTS-REGION]

Puis le bloc régions de France (indicateur 9, une entrée par région) :
[REGIONS-FRANCE]
region: Pays de la Loire
valeur: 6,6 %

region: Hauts-de-France
valeur: 9,8 %

region: Nouvelle-Aquitaine
valeur: 7,3 %
[/REGIONS-FRANCE]

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S28 : Comprendre les chiffres, les 5 chiffres clés et la lecture du territoire : Haute-Vienne (87)

*Un message par département : ne jamais les mélanger.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue un digest trimestriel de chiffres clés pour des professionnels de l'insertion et des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur, avec sa source, la date exacte de la donnée, la valeur du trimestre précédent et celle du même trimestre l'an dernier si tu les as. Trimestre de référence : « juillet à septembre 2026 » (du 01/07/2026 au 30/09/2026 inclus). Ces dates sont exactes.

Territoires : le département de la Haute-Vienne (87), la région Nouvelle-Aquitaine, la France entière. Ne mélange jamais les territoires ; une entrée par territoire. RÈGLE ABSOLUE, valable pour TOUT texte libre que tu écris ici (y compris un éventuel « repère ») : le texte d'un territoire ne nomme jamais un autre territoire suivi ici (jamais « comme en Dordogne », « contrairement à la Haute-Vienne »...) - un département sera un jour comparé à d'autres départements que ceux suivis aujourd'hui. Seules comparaisons autorisées : à la moyenne nationale/régionale (sans nommer un département précis), ou aux périodes précédentes du même territoire.

Indicateurs (les 5 du module, dans cet ordre) :
1. Taux de chômage localisé (au sens du Bureau international du travail). Paraît avec un trimestre de retard : donne le dernier trimestre publié, ne l'avance pas. Le dernier trimestre est souvent provisoire : dis-le.
2. Nombre de demandeurs d'emploi inscrits à France Travail, catégorie A ; et le total A+B+C ; pour le département de la Haute-Vienne (87), la région et la France. SOURCE À UTILISER (vérifiée le 2026-09-12, donne un vrai historique) : Dares, fichier « Demandeurs d'emploi inscrits à France Travail, Stock France et régions (trimestrielles, CVS-CJO) », https://www.data.gouv.fr/datasets/demandeurs-demploi-inscrits-a-france-travail-stock-france-et-regions-trimestrielles-cvs-cjo/ - malgré son nom, ce fichier contient une vraie colonne « Département » (101 départements, pas seulement des totaux régionaux), en données CVS-CJO. Filtre Sexe = Total, Tranche d'âge = Total, Ancienneté = Total, Catégorie = A (puis ABC pour le total). Donne directement les 8 derniers trimestres pour la ligne « serie ». N'utilise PAS le fichier « par zone d'emploi » pour cet indicateur : il n'existe qu'en données brutes (non désaisonnalisées) depuis l'arrêt de la CVS-CJO à ce niveau en 2021, incompatible avec le reste du digest. ATTENTION : ce fichier est gros (plus de 20 Mo) et demande un vrai filtrage de données, pas juste une lecture de page web - une IA de recherche web simple peut ne pas y arriver seule. Si elle bloque, apportez le fichier (ou la question) à Claude, qui peut l'analyser directement.
3. Part des inscrits depuis plus d'un an (chômage de longue durée) parmi les A+B+C, pour le département de la Haute-Vienne (87), la région Nouvelle-Aquitaine ET la France. MÊME SOURCE que l'indicateur 2 (colonne Ancienneté = « Un an ou plus » divisée par Ancienneté = « Total », Catégorie = ABC) : donne directement les 8 derniers trimestres. Vérification croisée déjà faite pour la Nouvelle-Aquitaine le 2026-09-12 : ce calcul tombe exactement sur le chiffre déjà publié par la note DREETS.
4. Emploi salarié : la variation sur le trimestre (en %) - jamais un décompte en nombre, pour rester comparable et cohérent d'un trimestre à l'autre - pour le département de la Haute-Vienne (87), la région et la France (bulletin INSEE « Informations rapides » du trimestre, comparaisons régionales et départementales). Historique réparti sur plusieurs bulletins trimestriels distincts (pas un seul fichier) : reporte la ligne « serie » du digest du trimestre précédent pour cet indicateur (les 4 territoires) et ajoute ce nouveau point à la suite.
5. Nombre d'offres d'emploi diffusées par France Travail, cumul sur douze mois glissants (panorama Data Emploi), pour le département de la Haute-Vienne (87), la région Nouvelle-Aquitaine ET la France entière (adresses : .../emploi/panorama/DEP/<code>, .../emploi/panorama/REG/<code région>, .../emploi/panorama/NAT/FR sur dataemploi.francetravail.fr). Donne aussi la tendance sur un an : sur l'onglet « Offres et demandeurs > Rapprochement > Offres d'emploi » de ce même site, le graphique donne, pour le dernier trimestre, une évolution annuelle en pourcentage (distincte du cumul douze mois) - c'est cette valeur qu'il faut reporter en « en hausse/en baisse d'environ X % par rapport à un an plus tôt ». Donne aussi la part d'embauches trimestrielles qui durent plus d'un mois (case « Embauches » du panorama), pour ces mêmes 3 territoires - la période disponible peut différer de celle des offres, donne-la telle quelle. CAS PARTICULIER pour cette part : contrairement au chômage, aucune source connue n'a d'historique - donne seulement le trimestre en cours, tu ne peux pas trouver de série ancienne (ce n'est pas une erreur de recherche). Avant d'assembler le digest, reporte la ligne « serie » du digest du trimestre précédent pour cet indicateur et ajoute ce nouveau point à la suite, sinon l'historique repart de zéro.
6. Où se situer : dans le même tableau INSEE que l'indicateur 1 (taux de chômage localisé par département et par région, dernier trimestre publié), le département français au taux le plus bas et celui au taux le plus haut (nom + valeur), puis la région française la plus basse et la plus haute (nom + valeur). Une seule fois pour le trimestre, indépendant du département choisi ci-dessus.
7. Zones d'emploi du département choisi (le département de la Haute-Vienne (87)) : le même taux de chômage localisé que l'indicateur 1, mais pour CHAQUE zone d'emploi qui compose ce département (même fichier INSEE « Taux de chômage par zone d'emploi » que l'indicateur 1, colonne « zone d'emploi » au lieu de « département »). Donne le nom de chaque zone et sa valeur au même trimestre. Sert à alimenter le bloc « Les écarts à l'intérieur du département » de la Vue d'ensemble - jamais un classement, une donnée brute à mettre à jour.
8. Départements suivis dans le bloc « Les écarts entre départements de la région » : le même taux de chômage localisé que l'indicateur 1 (même tableau INSEE département/région que l'indicateur 6), pour ces 4 départements précis de Nouvelle-Aquitaine : Deux-Sèvres, Lot-et-Garonne, Dordogne et Haute-Vienne. Juste la valeur trimestrielle de chacun, une donnée brute à mettre à jour - le texte d'explication de `departements-region.md` est structurel et n'a pas besoin d'être refait à chaque trimestre, sauf si l'écart entre eux change nettement.
9. Régions suivies dans le bloc « Les écarts entre régions de France » : le même taux de chômage localisé que l'indicateur 1, mais dans l'onglet « Région » du même tableau INSEE (pas « Département »), pour ces 3 régions précises : Pays de la Loire, Hauts-de-France et Nouvelle-Aquitaine. Juste la valeur trimestrielle de chacune, une donnée brute à mettre à jour - le texte d'explication de `regions-france.md` est structurel et n'a pas besoin d'être refait à chaque trimestre, sauf si l'écart entre elles change nettement (par exemple si Pays de la Loire ou Hauts-de-France perdent leur position d'extrême).

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Cherche sur : l'INSEE (taux de chômage localisés, estimations trimestrielles d'emploi), la DARES et France Travail (STMT, offres collectées, statistiques.francetravail.org), l'Observatoire des territoires pour la part de longue durée.

Produis une entrée pour CHAQUE indicateur et CHAQUE territoire demandé, même sans valeur (« valeur: non trouvée » + où tu as cherché). N'en omets aucun. Pas d'avis, pas de commentaire d'opportunité. Quand la donnée vient d'un PDF ou d'un tableau de bord, donne l'adresse directe.

POUR LE TAUX DE CHÔMAGE (chaque territoire) et POUR LES INSCRITS CATÉGORIE A, ajoute une ligne « serie » avec les 6 à 8 derniers trimestres connus, sous la forme « T3 2024: 7,7 % ; T4 2024: 7,6 % ; ... » (point-virgule entre les points). Sinon « serie » reste vide.

Ne rédige PAS de texte de synthèse ni d'interprétation (pas de bloc [LECTURE] ni [SYNTHESE-COURTE]) : cette partie est rédigée séparément avec Claude, à partir des chiffres collectés ici. Contente-toi des chiffres bruts, sourcés, ci-dessous.

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un indicateur entier, ferme le bloc ouvert par [/CHIFFRES], puis écris la ligne « SUITE DISPONIBLE : il reste les indicateurs [numéros restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [CHIFFRES...], sans répéter ce qui est déjà donné. Ne saute jamais un indicateur en silence et ne raccourcis jamais la liste pour la faire tenir. Les blocs [OU-SE-SITUER], [ZONES-EMPLOI], [DEPARTEMENTS-REGION] et [REGIONS-FRANCE] (indicateurs 6 à 9) comptent comme des indicateurs : un seul de chaque, dans la réponse où tu les traites.

Format de sortie. D'abord le bloc chiffres, entre [CHIFFRES periode: juillet à septembre 2026] et [/CHIFFRES]. Une entrée par ligne de résultat (un indicateur a plusieurs entrées, une par territoire), lignes « champ: valeur » dans cet ordre (indicateur, territoire, valeur, date_donnee, valeur_precedente, valeur_an_precedent, serie, source), séparées par une ligne vide.
[CHIFFRES periode: juillet à septembre 2026]
indicateur: Taux de chômage localisé
territoire: Haute-Vienne (87)
valeur: 7,8 %
date_donnee: 1er trimestre 2026 (provisoire)
valeur_precedente: 7,9 %
valeur_an_precedent: 8,1 %
serie: T3 2024: 8,3 % ; T4 2024: 8,1 % ; T1 2025: 8,0 % ; T2 2025: 7,9 % ; T3 2025: 7,9 % ; T4 2025: 7,9 % ; T1 2026: 7,8 %
source: nom-court | titre | https://adresse | AAAA-MM-JJ

indicateur: ...
territoire: ...
(etc.)
[/CHIFFRES]

Puis le bloc « où se situer » (une seule fois, pas par territoire) :
[OU-SE-SITUER]
departement_bas: Cantal | 4,7 % | 1er trimestre 2026
departement_haut: Pyrénées-Orientales | 12,7 % | 1er trimestre 2026
region_bas: Pays de la Loire | 6,6 % | 1er trimestre 2026
region_haut: Hauts-de-France | 9,8 % | 1er trimestre 2026
source: nom-court | titre | https://adresse | AAAA-MM-JJ
[/OU-SE-SITUER]

Puis le bloc zones d'emploi (indicateur 7, une entrée par zone) :
[ZONES-EMPLOI]
zone: <nom de la 1ère zone>
valeur: 7,8 %

zone: <nom de la 2e zone>
valeur: 8,1 %
(etc., une entrée par zone du département)
[/ZONES-EMPLOI]

Puis le bloc départements de la région (indicateur 8, une entrée par département) :
[DEPARTEMENTS-REGION]
departement: Deux-Sèvres
valeur: 6,0 %

departement: Lot-et-Garonne
valeur: 8,2 %

departement: Dordogne
valeur: 7,8 %

departement: Haute-Vienne
valeur: 7,4 %
[/DEPARTEMENTS-REGION]

Puis le bloc régions de France (indicateur 9, une entrée par région) :
[REGIONS-FRANCE]
region: Pays de la Loire
valeur: 6,6 %

region: Hauts-de-France
valeur: 9,8 %

region: Nouvelle-Aquitaine
valeur: 7,3 %
[/REGIONS-FRANCE]

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S29 : Comprendre les chiffres, le portrait annuel du territoire : Dordogne (24)

*Une fois par an.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue le portrait annuel d'un territoire pour des professionnels de l'insertion et des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur, avec sa source, la date exacte de la donnée, et l'avant-dernière valeur si tu l'as pour montrer le sens d'évolution. Territoires : le département de la Dordogne (24), la région Nouvelle-Aquitaine, la France entière. Année de référence : 2026.

A. De quoi vit le territoire
   - répartition de l'emploi par grand secteur (agriculture, industrie, construction, commerce-transports-services, administration-enseignement-santé-social), en %
   - les plus gros secteurs employeurs du département
   - poids de l'emploi public et de l'économie présentielle

B. Comment on est embauché ici
   - part des CDI, des CDD, de l'intérim dans les embauches ; part des CDD de moins d'un mois
   - part des temps partiels ; part des salariés de la fonction publique

C. Salaires
   - salaire net mensuel médian en équivalent temps plein, pour le département et la région
   - salaire net médian par grand secteur (régional ou national si pas de niveau départemental)
   - écart salarial femmes / hommes

D. Qui cherche un emploi ici (demandeurs A+B+C du département)
   - part des moins de 25 ans, part des 50 ans et plus, part des femmes
   - part des demandeurs de longue durée (plus d'un an)
   - part des bénéficiaires de l'obligation d'emploi (travailleurs handicapés)
   - niveau de formation des demandeurs : part de niveau CAP-BEP, part sans qualification reconnue
   - nombre et part d'allocataires du RSA dans la population

E. Le territoire bouge-t-il
   - nombre de créations d'entreprises sur l'année, dont micro-entrepreneurs ; taux de création
   - créations d'entreprises par grand secteur (les mêmes 5 familles qu'au bloc A), pour le département, la région et la France - source : publication annuelle INSEE « Créations d'entreprises par secteur d'activité », déclinaison départementale (vérifié 2026-09-12)
   - défaillances d'entreprises (fermetures par procédure judiciaire) : nombre sur l'année, évolution sur un an, et les secteurs les plus touchés, pour la région - source : notes de conjoncture INSEE régionales, complétées si besoin par le tableau de bord trimestriel de conjoncture régionale de l'INSEE (mis à jour plus souvent que le portrait annuel, utile pour rafraîchir ce point entre deux passages)
   - défaillances par département (Dordogne, Haute-Vienne) : NE LES CHERCHE PAS et ne les recompte pas, n'écris AUCUNE entrée pour cet indicateur. Ce chiffre est préparé et vérifié à la main par l'outil de prospection (annonces de jugement d'ouverture du BODACC) et publié dans le bloc « Les entreprises ici » : le portrait le reprend tel quel, il ne le recalcule jamais
   - poids du tourisme (emplois touristiques, part dans l'emploi) si disponible

F. Qui habite ici
   - population, densité (hab/km2)
   - part des 60 ans et plus, part des moins de 25 ans
   - évolution de la population sur 5 ans (solde naturel, solde migratoire)

G. Le niveau de formation (population 25-64 ans ou 15+ non scolarisée)
   - part sans diplôme ou brevet seul ; part diplômés du supérieur
   - taux de décrochage scolaire ou part de jeunes 18-24 ans peu diplômés sans emploi ni formation (NEET), au niveau régional si pas de niveau départemental

H. Les freins périphériques à l'emploi
   - mobilité : part des ménages sans voiture (INSEE, comparateur de territoire)
   - garde d'enfant : taux de couverture d'accueil du jeune enfant pour 100 enfants de moins de 3 ans, PAR DÉPARTEMENT - CNAF, data.caf.fr, jeu de données « Taux de couverture d'accueil du jeune enfant [Département] » (txcouv_pe_dep), champ txcouv_dep pour le total tous modes d'accueil
   - santé, deux angles à traiter séparément : (a) part de demandeurs déclarant un problème de santé qui limite le travail (national, DARES) ; (b) densité de médecins généralistes PAR DÉPARTEMENT - INSEE, séries « Densité des médecins généralistes - Pour 100 000 habitants », une série par département (chercher "insee.fr statistiques serie densité médecins généralistes <département>", ou télécharger le fichier de la famille TCRED-SANTE-PERSONNELS qui couvre aussi chirurgiens-dentistes, pharmaciens, infirmiers et médecins spécialistes par département - pistes pour un futur enrichissement "déserts médicaux", pas seulement les généralistes). Complète avec le zonage ARS Nouvelle-Aquitaine (zones d'installation prioritaire) si trouvé.
   - logement : part des résidences principales en suroccupation PAR DÉPARTEMENT si trouvée (INSEE Flash Nouvelle-Aquitaine "Les conditions de logement en Nouvelle-Aquitaine", ou dossier complet du département) ; à défaut, repère national (Fondation pour le logement des défavorisés)
   - savoirs de base / illettrisme (chiffres ANLCI régionaux), illectronisme (INSEE)
   - donne ce qui est chiffré au niveau national ou régional, en disant à chaque fois si une déclinaison départementale existe ; marque « difficile à chiffrer » là où il n'y a pas de source solide. Sujet à traiter avec prudence, sans dramatiser.

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Cherche sur : l'INSEE (dossier complet et comparateur de territoire, recensement, répertoire des entreprises pour les créations, DADS/DSN pour les salaires, estimations d'emploi, publication annuelle « créations d'entreprises par secteur d'activité », tableau de bord trimestriel de conjoncture régionale pour les défaillances), la DARES, France Travail (STMT, déclarations d'embauche, enquête Besoins en Main d'Œuvre), l'Agefiph, la CAF ou le conseil départemental pour le RSA, Cap Métiers Nouvelle-Aquitaine (SI-Terr, portraits de territoire par région, département et zone d'emploi, qui rassemblent emploi, chômage, formation et démographie ; garde la source primaire pour la citation), l'ANLCI pour l'illettrisme, l'Observatoire des territoires. Pour les défaillances régionales, si aucune source officielle claire n'est trouvée (INSEE, Banque de France), dis-le explicitement plutôt que de reprendre un chiffre de presse économique sans source primaire identifiable.

Ajoute enfin la couche « métiers en tension » : les 8 à 12 métiers avec le plus de projets de recrutement dans le département et la part jugée difficile à recruter (enquête BMO de l'année), plus les 3 à 5 secteurs les plus en tension au niveau régional.

Produis une entrée pour CHAQUE indicateur sauf les défaillances par département, même sans valeur (« valeur: non trouvée » + où tu as cherché). Pas d'avis, pas de conseil, pas de ton alarmiste (surtout sur les freins et sur le niveau de formation).

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un bloc (A à H, puis « tension ») entier, ferme le bloc ouvert par [/PORTRAIT], puis écris la ligne « SUITE DISPONIBLE : il reste les blocs [lettres restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [PORTRAIT...], sans répéter ce qui est déjà donné. Ne saute jamais un bloc (A à H, puis « tension ») en silence et ne raccourcis jamais la liste pour la faire tenir.

Termine par un bloc entre [PORTRAIT annee: 2026] et [/PORTRAIT]. Une entrée par ligne de résultat, séparées par une ligne vide, lignes « champ: valeur » dans cet ordre : bloc (une lettre A à H, ou « tension »), indicateur, territoire, valeur, date_donnee, source (nom-court | titre | https://adresse | AAAA-MM-JJ).

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S30 : Comprendre les chiffres, le portrait annuel du territoire : Haute-Vienne (87)

*Une fois par an.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je constitue le portrait annuel d'un territoire pour des professionnels de l'insertion et des personnes en recherche d'emploi. Donne la dernière valeur connue de chaque indicateur, avec sa source, la date exacte de la donnée, et l'avant-dernière valeur si tu l'as pour montrer le sens d'évolution. Territoires : le département de la Haute-Vienne (87), la région Nouvelle-Aquitaine, la France entière. Année de référence : 2026.

A. De quoi vit le territoire
   - répartition de l'emploi par grand secteur (agriculture, industrie, construction, commerce-transports-services, administration-enseignement-santé-social), en %
   - les plus gros secteurs employeurs du département
   - poids de l'emploi public et de l'économie présentielle

B. Comment on est embauché ici
   - part des CDI, des CDD, de l'intérim dans les embauches ; part des CDD de moins d'un mois
   - part des temps partiels ; part des salariés de la fonction publique

C. Salaires
   - salaire net mensuel médian en équivalent temps plein, pour le département et la région
   - salaire net médian par grand secteur (régional ou national si pas de niveau départemental)
   - écart salarial femmes / hommes

D. Qui cherche un emploi ici (demandeurs A+B+C du département)
   - part des moins de 25 ans, part des 50 ans et plus, part des femmes
   - part des demandeurs de longue durée (plus d'un an)
   - part des bénéficiaires de l'obligation d'emploi (travailleurs handicapés)
   - niveau de formation des demandeurs : part de niveau CAP-BEP, part sans qualification reconnue
   - nombre et part d'allocataires du RSA dans la population

E. Le territoire bouge-t-il
   - nombre de créations d'entreprises sur l'année, dont micro-entrepreneurs ; taux de création
   - créations d'entreprises par grand secteur (les mêmes 5 familles qu'au bloc A), pour le département, la région et la France - source : publication annuelle INSEE « Créations d'entreprises par secteur d'activité », déclinaison départementale (vérifié 2026-09-12)
   - défaillances d'entreprises (fermetures par procédure judiciaire) : nombre sur l'année, évolution sur un an, et les secteurs les plus touchés, pour la région - source : notes de conjoncture INSEE régionales, complétées si besoin par le tableau de bord trimestriel de conjoncture régionale de l'INSEE (mis à jour plus souvent que le portrait annuel, utile pour rafraîchir ce point entre deux passages)
   - défaillances par département (Dordogne, Haute-Vienne) : NE LES CHERCHE PAS et ne les recompte pas, n'écris AUCUNE entrée pour cet indicateur. Ce chiffre est préparé et vérifié à la main par l'outil de prospection (annonces de jugement d'ouverture du BODACC) et publié dans le bloc « Les entreprises ici » : le portrait le reprend tel quel, il ne le recalcule jamais
   - poids du tourisme (emplois touristiques, part dans l'emploi) si disponible

F. Qui habite ici
   - population, densité (hab/km2)
   - part des 60 ans et plus, part des moins de 25 ans
   - évolution de la population sur 5 ans (solde naturel, solde migratoire)

G. Le niveau de formation (population 25-64 ans ou 15+ non scolarisée)
   - part sans diplôme ou brevet seul ; part diplômés du supérieur
   - taux de décrochage scolaire ou part de jeunes 18-24 ans peu diplômés sans emploi ni formation (NEET), au niveau régional si pas de niveau départemental

H. Les freins périphériques à l'emploi
   - mobilité : part des ménages sans voiture (INSEE, comparateur de territoire)
   - garde d'enfant : taux de couverture d'accueil du jeune enfant pour 100 enfants de moins de 3 ans, PAR DÉPARTEMENT - CNAF, data.caf.fr, jeu de données « Taux de couverture d'accueil du jeune enfant [Département] » (txcouv_pe_dep), champ txcouv_dep pour le total tous modes d'accueil
   - santé, deux angles à traiter séparément : (a) part de demandeurs déclarant un problème de santé qui limite le travail (national, DARES) ; (b) densité de médecins généralistes PAR DÉPARTEMENT - INSEE, séries « Densité des médecins généralistes - Pour 100 000 habitants », une série par département (chercher "insee.fr statistiques serie densité médecins généralistes <département>", ou télécharger le fichier de la famille TCRED-SANTE-PERSONNELS qui couvre aussi chirurgiens-dentistes, pharmaciens, infirmiers et médecins spécialistes par département - pistes pour un futur enrichissement "déserts médicaux", pas seulement les généralistes). Complète avec le zonage ARS Nouvelle-Aquitaine (zones d'installation prioritaire) si trouvé.
   - logement : part des résidences principales en suroccupation PAR DÉPARTEMENT si trouvée (INSEE Flash Nouvelle-Aquitaine "Les conditions de logement en Nouvelle-Aquitaine", ou dossier complet du département) ; à défaut, repère national (Fondation pour le logement des défavorisés)
   - savoirs de base / illettrisme (chiffres ANLCI régionaux), illectronisme (INSEE)
   - donne ce qui est chiffré au niveau national ou régional, en disant à chaque fois si une déclinaison départementale existe ; marque « difficile à chiffrer » là où il n'y a pas de source solide. Sujet à traiter avec prudence, sans dramatiser.

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Cherche sur : l'INSEE (dossier complet et comparateur de territoire, recensement, répertoire des entreprises pour les créations, DADS/DSN pour les salaires, estimations d'emploi, publication annuelle « créations d'entreprises par secteur d'activité », tableau de bord trimestriel de conjoncture régionale pour les défaillances), la DARES, France Travail (STMT, déclarations d'embauche, enquête Besoins en Main d'Œuvre), l'Agefiph, la CAF ou le conseil départemental pour le RSA, Cap Métiers Nouvelle-Aquitaine (SI-Terr, portraits de territoire par région, département et zone d'emploi, qui rassemblent emploi, chômage, formation et démographie ; garde la source primaire pour la citation), l'ANLCI pour l'illettrisme, l'Observatoire des territoires. Pour les défaillances régionales, si aucune source officielle claire n'est trouvée (INSEE, Banque de France), dis-le explicitement plutôt que de reprendre un chiffre de presse économique sans source primaire identifiable.

Ajoute enfin la couche « métiers en tension » : les 8 à 12 métiers avec le plus de projets de recrutement dans le département et la part jugée difficile à recruter (enquête BMO de l'année), plus les 3 à 5 secteurs les plus en tension au niveau régional.

Produis une entrée pour CHAQUE indicateur sauf les défaillances par département, même sans valeur (« valeur: non trouvée » + où tu as cherché). Pas d'avis, pas de conseil, pas de ton alarmiste (surtout sur les freins et sur le niveau de formation).

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un bloc (A à H, puis « tension ») entier, ferme le bloc ouvert par [/PORTRAIT], puis écris la ligne « SUITE DISPONIBLE : il reste les blocs [lettres restantes]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [PORTRAIT...], sans répéter ce qui est déjà donné. Ne saute jamais un bloc (A à H, puis « tension ») en silence et ne raccourcis jamais la liste pour la faire tenir.

Termine par un bloc entre [PORTRAIT annee: 2026] et [/PORTRAIT]. Une entrée par ligne de résultat, séparées par une ligne vide, lignes « champ: valeur » dans cet ordre : bloc (une lettre A à H, ou « tension »), indicateur, territoire, valeur, date_donnee, source (nom-court | titre | https://adresse | AAAA-MM-JJ).

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S31 : Comprendre les chiffres, la France dans l'Union européenne

*Onze indicateurs, une fois par an.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je situe la France dans l'Union européenne pour des professionnels de l'insertion et un public en recherche d'emploi. Pour chacun des 11 indicateurs ci-dessous, donne : la valeur France, la moyenne UE27, l'année de la donnée, et le code de la table Eurostat. Année de référence : 2026.

1. Taux de chômage harmonisé, 15-74 ans (table une_rt_m) - donne aussi le pays le plus bas et le plus haut, avec leur valeur
2. Taux de chômage des jeunes, 15-24 ans (table une_rt_m)
3. Taux de chômage de longue durée, part des actifs au chômage depuis 12 mois et plus, 15-74 ans (table une_ltu_a, unit PC_ACT)
4. Taux d'emploi, 20-64 ans (table lfsi_emp_a)
5. Taux d'emploi des seniors, 55-64 ans (table lfsi_emp_a)
6. Part des NEET, jeunes 15-29 ans ni en emploi ni en études ni en formation (table edat_lfse_20)
7. Part de l'emploi à durée limitée (salariés temporaires), 15-64 ans (table lfsa_etpga)
8. Part du temps partiel dans l'emploi, 20-64 ans (table lfsa_eppga)
9. Écart de salaire femmes-hommes non ajusté (table sdg_05_20)
10. Part des diplômés du supérieur, 25-64 ans (table edat_lfse_03, isced11 ED5-8)
11. Participation des adultes 25-64 ans à une formation au cours des 4 dernières semaines (table trng_lfse_01)

Ajoute une note « freins comparés » France contre moyenne de l'Union : accueil formel des enfants de moins de 3 ans (table ilc_caindformal), accès internet des ménages (table isoc_ci_in_h), et si tu la trouves, la répartition des personnes hors du marché du travail par principal obstacle déclaré (module ad hoc 2021 de l'enquête sur les forces de travail, séries lfso_21).

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. La base Eurostat (Data Browser) s'affiche en JavaScript ; pour lire une valeur sans l'ouvrir, utilise l'interface de diffusion : https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/<CODE>?format=JSON&geo=FR&geo=EU27_2020&time=2026 (ajoute sex=T, age=... et unit=... selon la table). Adresse de la source obligatoire pour chaque indicateur. Pas d'avis, pas de classement moralisant : on situe, on ne juge pas.

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un indicateur entier, ferme le bloc ouvert par [/CHIFFRES-UE], puis écris la ligne « SUITE DISPONIBLE : il reste les indicateurs [numéros restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [CHIFFRES-UE...], sans répéter ce qui est déjà donné. Ne saute jamais un indicateur en silence et ne raccourcis jamais la liste pour la faire tenir. La note « freins comparés » compte comme un indicateur.

Rends le résultat au format du fichier du module : pour chaque indicateur, DEUX lignes, la valeur en gras, l'année entre parenthèses :
- France : **<valeur>** (<année>). Source : Eurostat, table <code> | https://ec.europa.eu/eurostat/databrowser/view/<code>
- Moyenne UE-27 : **<valeur>** (<année>). Source : Eurostat.
(pour l'indicateur 1, ajoute une 3e ligne « - Pays les mieux placés, pays les moins bien placés : ... ».)

Termine par un bloc entre [CHIFFRES-UE annee: 2026] et [/CHIFFRES-UE] qui reprend, pour chaque indicateur, une ligne « champ: valeur » dans cet ordre : indicateur, france, ue27, date_donnee, table, source (https://adresse). Ne rédige aucun texte d'interprétation : cette partie est faite séparément avec Claude, à partir des chiffres collectés ici.

Pour finir, à la fin de CHAQUE réponse, les sites que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S32 : Comprendre les chiffres, le profil des découpes (âge, diplôme, départements, régions)

*Une fois par an. Cette carte n'a pas de lecteur dans l'outil : les tableaux se traitent en conversation.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Pour chacun des territoires ci-dessous, ouvre la page « Dossier complet » de l'INSEE, cherche (Ctrl+F) les deux tableaux suivants et copie-les intégralement :
- POP T5 - Population par sexe et grandes tranches d'âges
- FOR T3 - Diplôme le plus élevé de la population non scolarisée de 15 ans ou plus

Le site répond une fois sur deux (erreur 500 aléatoire, pas un problème de connexion) : recharger la page suffit en général.

Zones d'emploi (zones-emploi.md) :
- Bergerac : https://www.insee.fr/fr/statistiques/2011101?geo=ZE2020-7504
- Périgueux : https://www.insee.fr/fr/statistiques/2011101?geo=ZE2020-7523
- Sarlat-la-Canéda : https://www.insee.fr/fr/statistiques/2011101?geo=ZE2020-7529
- Limoges : https://www.insee.fr/fr/statistiques/2011101?geo=ZE2020-7517
- Saint-Junien : https://www.insee.fr/fr/statistiques/2011101?geo=ZE2020-7527

Départements (departements-region.md) :
- Deux-Sèvres : https://www.insee.fr/fr/statistiques/2011101?geo=DEP-79
- Lot-et-Garonne : https://www.insee.fr/fr/statistiques/2011101?geo=DEP-47
- Dordogne : https://www.insee.fr/fr/statistiques/2011101?geo=DEP-24
- Haute-Vienne : https://www.insee.fr/fr/statistiques/2011101?geo=DEP-87

Régions (regions-france.md) :
- Nouvelle-Aquitaine : https://www.insee.fr/fr/statistiques/2011101?geo=REG-75
- Pays de la Loire : https://www.insee.fr/fr/statistiques/2011101?geo=REG-52
- Hauts-de-France : https://www.insee.fr/fr/statistiques/2011101?geo=REG-32

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un territoire entier, puis écris la ligne « SUITE DISPONIBLE : il reste les territoires [noms restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, sans répéter ce qui est déjà donné. Ne saute jamais un territoire en silence et ne raccourcis jamais la liste pour la faire tenir.

Pour finir, les pages que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Colle les tableaux copiés directement dans la conversation avec Claude : il calcule les pourcentages (part des 65 ans et plus, part sans diplôme ou brevet seul, part de diplômés du supérieur) et met à jour les 3 fichiers concernés, avec la même méthode que le 2026-09-12.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S33 : Comprendre les chiffres, l'accès aux médecins, dentistes et pharmaciens

*Une fois par an. Cette carte n'a pas de lecteur dans l'outil : les tableaux se traitent en conversation.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Pour chacun des territoires ci-dessous, ouvre la série INSEE (famille TCRED - Personnels de santé) et relève la dernière valeur disponible, avec son année.

IMPORTANT : les départements et les régions marqués « extrême, à vérifier chaque année » peuvent ne plus être les bons - un autre territoire a pu prendre leur place au premier ou au dernier rang depuis 2026-09-12. Avant de recopier simplement leur nouvelle valeur, vérifie si un autre territoire est devenu plus extrême (Claude peut le faire en parcourant les 13 régions ou en cherchant le classement national des départements, comme lors de la construction initiale).

=== Densité des médecins généralistes - Pour 100 000 habitants ===
Départements (medecins-departements-region.md) :
- Hautes-Alpes (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760977
- Eure-et-Loir (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760999
- Dordogne : https://www.insee.fr/fr/statistiques/serie/010760995
- Haute-Vienne : https://www.insee.fr/fr/statistiques/serie/010761060
Régions (medecins-regions-france.md) :
- Bretagne (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761084
- Centre-Val de Loire (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761078
- Nouvelle-Aquitaine : https://www.insee.fr/fr/statistiques/serie/010761085
France (portrait-2026.md, déjà suivi) :
- France entière : https://www.insee.fr/fr/statistiques/serie/010761075

=== Densité des médecins spécialistes - Pour 100 000 habitants ===
Départements (specialistes-departements-region.md) :
- Paris (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761399
- Ain (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761324
- Dordogne : https://www.insee.fr/fr/statistiques/serie/010761346
- Haute-Vienne : https://www.insee.fr/fr/statistiques/serie/010761411
Régions (specialistes-regions-france.md) :
- Île-de-France (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761428
- Centre-Val de Loire (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761429
- Nouvelle-Aquitaine : https://www.insee.fr/fr/statistiques/serie/010761436
France (portrait-2026.md, déjà suivi) :
- France entière : https://www.insee.fr/fr/statistiques/serie/010761426

=== Densité des chirurgiens-dentistes - Pour 100 000 habitants ===
Départements (dentistes-departements-region.md) :
- Paris (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761516
- Creuse (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761462
- Dordogne : https://www.insee.fr/fr/statistiques/serie/010761463
- Haute-Vienne : https://www.insee.fr/fr/statistiques/serie/010761528
Régions (dentistes-regions-france.md) :
- Provence-Alpes-Côte d'Azur (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761556
- Normandie (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010761548
- Nouvelle-Aquitaine : https://www.insee.fr/fr/statistiques/serie/010761553
France (portrait-2026.md, déjà suivi) :
- France entière : https://www.insee.fr/fr/statistiques/serie/010761543

=== Densité des pharmaciens - Pour 100 000 habitants ===
Départements (pharmaciens-departements-region.md) :
- Haute-Vienne (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760943
- Seine-Saint-Denis (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760949
- Dordogne : https://www.insee.fr/fr/statistiques/serie/010760878
Régions (pharmaciens-regions-france.md) :
- Provence-Alpes-Côte d'Azur (extrême le plus haut, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760971
- Pays de la Loire (extrême le plus bas, à vérifier chaque année) : https://www.insee.fr/fr/statistiques/serie/010760966
- Nouvelle-Aquitaine : https://www.insee.fr/fr/statistiques/serie/010760968
France (portrait-2026.md, déjà suivi) :
- France entière : https://www.insee.fr/fr/statistiques/serie/010760958

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'une profession entier, puis écris la ligne « SUITE DISPONIBLE : il reste les professions [noms restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, sans répéter ce qui est déjà donné. Ne saute jamais une profession en silence et ne raccourcis jamais la liste pour la faire tenir.

Pour finir, les pages que tu n'as pas pu ouvrir (pour que je les ouvre moi-même) :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Colle les valeurs relevées directement dans la conversation avec Claude : il met à jour les fichiers concernés (les blocs « écarts » de chaque métier et la ligne « Santé » du portrait annuel), avec la même méthode et les mêmes sources que le 2026-09-12 - y compris une nouvelle recherche de fond sourcée si un extrême a changé (jamais juste remplacer un nom par un autre sans explication).

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S34 : Lexique, les mots du lexique : termes nouveaux ou changés de sens

*Sur les douze derniers mois. La liste des mots déjà présents est dans le message, pour éviter les doublons.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

Je maintiens un lexique pour des professionnels de l'insertion et des personnes en recherche d'emploi. Repère les termes, sigles, dispositifs et pratiques du champ de l'insertion professionnelle qui sont APPARUS ou ont CHANGÉ DE SENS sur les douze derniers mois, soit du 02/11/2025 au 01/11/2026 inclus. Ton rôle est UNIQUEMENT de collecter des faits sur ces termes, PAS de rédiger une définition ni de classer le terme (cette partie est faite séparément, avec Claude).

Nous sommes le 01/11/2026. Recherche web obligatoire : si tu ne peux pas consulter le web, dis-le et ne réponds pas. N'utilise que des pages que tu as réellement ouvertes. Ne fabrique jamais une adresse, un numéro de texte (NOR, JORFTEXT, ELI, « décret n° ... ») ni une date : si tu ne l'as pas vu dans un résultat, écris « à vérifier » à la place. Une adresse de source = une seule URL, d'un seul tenant, sans espace ni texte inséré ; en cas de doute sur l'URL exacte, donne l'adresse d'accueil du site officiel (https://www.legifrance.gouv.fr, https://www.service-public.fr...). Certains sites officiels (Légifrance, ministères, education.gouv.fr) bloquent parfois la lecture automatique : si tu ne peux pas ouvrir une source primaire, appuie-toi sur les relais qui la republient (service-public.gouv.fr, la lettre hebdo du ministère du Travail, les CARIF-OREF dont Cap Métiers Nouvelle-Aquitaine, vie-publique.fr, l'espace presse de France Travail, l'Unédic, la presse spécialisée emploi-formation) et signale clairement chaque point que tu n'as pas pu confirmer sur la source primaire. Cherche sur : service-public.fr, Légifrance, ministère du Travail (dont la lettre hebdo travail-emploi), France Travail, France compétences, les CARIF-OREF (Cap Métiers Nouvelle-Aquitaine), vie-publique.fr. Adresse de la source obligatoire. Ne propose pas un terme dont tu n'as pas trouvé de source officielle : mieux vaut une liste courte et sûre. Pas d'avis, pas de recommandation.

COMMENT TRAVAILLER (valable pour tout ce message)
1. Pour chaque valeur, ouvre la page de la source indiquée, ou de la source officielle qui la publie. Une valeur n'est donnée que si tu l'as lue sur une page ouverte : rien de rappelé de mémoire, rien d'estimé, rien déduit d'un autre chiffre.
2. « non trouvée » n'est permis qu'après avoir ouvert la source indiquée ET au moins une autre page, et en disant lesquelles. Dire « non trouvée » est toujours préférable à un chiffre non vérifié.
3. Si une source est un fichier trop lourd, un tableau de bord qui s'affiche en JavaScript ou une page qui refuse l'accès, ne la remplace pas par un chiffre approché : note-la dans le bloc des sites non ouverts.
4. Une adresse = une seule URL complète, écrite telle quelle, sans lien cliquable, sans crochets, sans parenthèses.

Pour chaque terme, renseigne EXACTEMENT ces champs, dans cet ordre :
- id : identifiant court en minuscules avec des traits d'union (ex. contrat-valorisation-experience)
- titre : le terme tel qu'on l'écrit (sigle développé entre parenthèses si utile)
- statut : nouveau / evolue / obsolete
- changement : seulement si évolué ou obsolète, ce qui a changé et par quoi c'est remplacé
- fait_brut : ce que dit la source officielle sur ce terme, TEL QUEL (à qui il s'adresse, ce qu'il permet, conditions, montants) - pas une définition simplifiée, le fait complet, même long
- source : nom-court | titre | https://adresse | JJ/MM/AAAA
- preuve : adresse exacte de la page lue | JJ/MM/AAAA ou sans date | passage recopié mot pour mot (voir la consigne PREUVE plus bas)

PREUVE, obligatoire pour chaque entrée : ajoute à la fin de l'entrée une ligne « preuve: » avec trois éléments séparés par « | » : (1) l'adresse exacte et complète de la page précise que tu as lue, jamais la page d'accueil du site ; (2) la date de mise à jour affichée sur cette page (JJ/MM/AAAA), ou « sans date » si la page n'en affiche pas ; (3) un passage de cette page recopié mot pour mot, de 5 à 25 mots, qui montre l'information rapportée. Le passage doit exister tel quel sur la page : ne le reformule pas et ne le tire pas de ton propre texte. Un terme pour lequel tu n'as ouvert aucune page ne doit pas être proposé. L'outil ouvrira les pages citées pour y retrouver ces passages.

TERMES EXISTANTS, pour ne pas proposer un doublon (identifiant | titre) :
pmsmp | PMSMP
cdi | CDI
cdd | CDD
interim | Intérim
alternance | Alternance
stage | Stage
periode-essai | Période d'essai
periode-essai-cote-employeur | Période d'essai : pourquoi l'employeur y tient
contrat-valorisation-experience | Contrat de valorisation de l'expérience (CVE)
temps-partiel | Temps partiel
cesu | CESU (chèque emploi service universel)
salaire-brut | Salaire brut
salaire-net | Salaire net
bulletin-salaire | Comment lire son bulletin de salaire
cotisations-sociales | Cotisations sociales
prelevement-source | Prélèvement à la source
heures-supplementaires | Heures supplémentaires
primes | Prime
indemnites | Indemnité
conges-payes | Congés payés
absences | Absence
remboursement-frais | Remboursement de frais
cumuls | Cumuls
cout-employeur | Coût employeur
cdd-ou-interim | CDD ou intérim ?
cdi-ou-cdd | CDI ou CDD ?
stage-ou-pmsmp | Stage ou PMSMP ?
diagnostic-partage | Diagnostic partagé
frein-emploi | Frein à l'emploi
plan-action | Plan d'action
positionnement | Positionnement
prescription | Prescription
employabilite | Employabilité
reconversion | Reconversion
autonomie | Que veut dire "autonomie" dans une offre d'emploi ?
parlez-moi-de-vous | Pourquoi on vous demande "parlez-moi de vous" ?
savoir-etre | Que veut dire "savoir-être" ?
savoir-faire | Que veut dire "savoir-faire" ?
savoirs-connaissances | Que veut dire "savoirs" (ce que l'on connaît) ?
prouver-une-competence | Comment prouver une compétence ?
esprit-equipe | Que veut dire "esprit d'équipe" dans une offre d'emploi ?
force-proposition | Que veut dire "être force de proposition" ?
rigueur | Que veut dire "rigueur" dans une offre d'emploi ?
cv-lecture-recruteur | Ce que regarde un recruteur sur un CV
lettre-motivation | Comment lire une lettre de motivation
france-travail | Le rôle de France Travail
mission-locale | Le rôle de la Mission Locale
cap-emploi | Le rôle de Cap Emploi
caf | CAF
siae | Les structures de l'insertion par l'activité économique (SIAE)
aci | Chantier d'insertion (ACI)
ei | Entreprise d'insertion (EI)
ai | Association intermédiaire (AI)
etti | ETTI
geiq | GEIQ (groupement d'employeurs pour l'insertion et la qualification)
cpf | CPF
vae | VAE
aref-ou-rfft | AREF ou RFFT ?
aif | AIF (aide individuelle à la formation)
projet-transition-professionnelle | Projet de transition professionnelle (PTP)
rqth | RQTH
medecine-travail | Médecine du travail
arret-de-travail-indemnites-journalieres | Arrêt de travail et indemnités journalières
accident-travail-maladie-professionnelle | Accident du travail et maladie professionnelle (AT/MP)
maintien-emploi | Maintien dans l'emploi
amenagement-poste | Aménagement de poste
aptitude-ou-inaptitude | Aptitude ou inaptitude ?
prime-ou-indemnite | Prime ou indemnité ?
savoir-etre-ou-savoir-faire | Savoir-être ou savoir-faire ?
cpf-ou-vae | CPF ou VAE ?
francetravail-missionlocale-capemploi | France Travail, Mission Locale ou Cap Emploi ?
franceconnect | FranceConnect
actualisation | Actualisation
attestation-employeur | Attestation employeur
are | ARE
poei | POEI
cej | CEJ
pacea | PACEA
bilan-competences | Bilan de compétences
rncp | RNCP
cqp | CQP
titre-professionnel | Titre professionnel
certification | Certification
qualification | Qualification
formation-qualifiante-ou-certifiante | Formation qualifiante ou certifiante ?
rncp-ou-cqp | RNCP ou CQP ?
rs | RS (répertoire spécifique)
rncp-ou-rs | RNCP ou RS ?
cpf-plafonds-2026 | Les plafonds du CPF depuis 2026
diplome-titre-certification | Diplôme, titre professionnel ou certification ?
ecoute-active | Écoute active
reformulation | Reformulation
estime-de-soi | Estime de soi
confiance-en-soi | Confiance en soi
affirmation-de-soi | Affirmation de soi
estime-confiance-ou-affirmation | Estime de soi, confiance en soi ou affirmation de soi ?
croyance-limitante | Croyance limitante
message-en-je | Message en « je »
methode-desc | Méthode DESC
critique-ou-reproche | Critique ou reproche ?
styles-de-communication | Styles de communication : passif, agressif ou assertif ?
coach | Coach
cesf | Le rôle du CESF
caces | CACES
questionnement | Questionnement
conduite-entretien | Conduite d'un entretien d'accompagnement
advp | ADVP
trefle-chanceux | Trèfle Chanceux
objectifs-smart | Objectifs SMART
co-construction | Co-construction
pouvoir-agir | Pouvoir d'agir
convention-collective | Convention collective
preavis | Préavis
licenciement | Licenciement
licenciement-procedure-employeur | Licencier : une décision encadrée pour l'employeur
demission | Démission
abandon-de-poste | Abandon de poste
rupture-conventionnelle | Rupture conventionnelle
solde-tout-compte | Solde de tout compte
demission-ou-rupture-conventionnelle | Démission ou rupture conventionnelle ?
entretien-annuel | Entretien annuel
culture-entreprise | Culture d'entreprise
marque-employeur | Marque employeur
cooptation | Cooptation
bassin-emploi | Bassin d'emploi
qpv | QPV (quartier prioritaire de la politique de la ville)
frr | FRR (zone France Ruralités Revitalisation)
emploi-franc | Emploi franc (dispositif arrêté)
polyvalence | Polyvalence
sens-organisation | Sens de l'organisation
auto-entrepreneur | Auto-entrepreneur
acre | ACRE (aide à la création ou reprise d'entreprise)
projet-professionnel | Projet professionnel
orientation | Orientation
reorientation-professionnelle | Réorientation professionnelle
evolution-professionnelle | Évolution professionnelle
reorientation-ou-reconversion | Réorientation ou reconversion ?
reconversion-ou-evolution | Reconversion ou évolution professionnelle ?
ats | ATS
soft-skills-ou-hard-skills | Soft skills ou hard skills ?
rqth-ou-invalidite | RQTH ou invalidité ?
cep | CEP
iae | L'insertion par l'activité économique (IAE)
reseau-pour-emploi | Réseau Pour l'Emploi
cip | Le rôle du CIP
plie | PLIE
dialogue-social | Dialogue social
cse | CSE
discrimination-embauche | Discrimination à l'embauche
obligations-employeur-embauche | Ce que l'employeur doit faire pour embaucher
portage-salarial | Portage salarial
profession-liberale | Profession libérale
auto-entrepreneur-portage-liberale | Auto-entrepreneur, portage salarial ou profession libérale ?
illettrisme | Illettrisme
fle | FLE (français langue étrangère)
illectronisme | Illectronisme
casier-judiciaire | Casier judiciaire
aide-alimentaire | Aide alimentaire
hebergement-urgence | Hébergement d'urgence
aide-materielle | Aide matérielle
violences | Violences (et parcours professionnel)
aide-a-la-mobilite | Aide à la mobilité
aide-carburant-grands-rouleurs | Aide carburant « grands rouleurs »
surendettement | Surendettement
credit-conso-nouvelles-regles-2026 | De nouvelles règles pour le crédit à la consommation (2026)
aides-garde-enfants | Aides à la garde d'enfants
monoparentalite | Monoparentalité et allocation de soutien familial (ASF)
proche-aidant | Proche aidant : congé et allocation (AJPA)
conge-maternite-paternite | Congés maternité et paternité : protection de l’emploi
assistante-sociale | Assistante sociale de secteur
addictologie | Addictologie (CSAPA)
visite-entreprise | Visite d'entreprise
atelier-thematique | Atelier thématique
mobilite-internationale | Mobilité internationale
job-dating | Job dating et forums de l'emploi
parrainage-vers-l-emploi | Parrainage vers l'emploi
groupe-de-pairs | Groupe de pairs
o2r | O2R (Offre de Repérage et de Remobilisation)
teletravail | Télétravail
horaires-travail | Horaires de travail
rythme-travail | Rythme et variété des missions
travail-de-nuit | Travail de nuit
astreintes | Astreintes
deplacements-professionnels | Déplacements professionnels
port-de-charges | Port de charges et effort physique
environnement-travail | Environnement de travail
formation-prise-de-poste | Formation et accompagnement à la prise de poste
temps-partiel-choisi-ou-subi | Temps partiel choisi ou subi ?
contact-public | Contact avec le public
proximite-domicile-travail | Proximité domicile-travail
erip | ERIP
pait | PAIT
bprea | BPREA
dnja | DNJA (ex-DJA)
fondation-2eme-chance | La Fondation de la 2ème Chance
clause-sociale | La clause sociale d'insertion
facilitateur-clause-sociale | Le facilitateur de la clause sociale
maitre-ouvrage-ou-maitre-oeuvre | Maître d'ouvrage ou maître d'œuvre ?
rsa | RSA
prime-activite | Prime d'activité
rsa-ou-prime-activite | RSA ou prime d'activité ?
aah | AAH
aah-ou-pension-invalidite | AAH ou pension d'invalidité ?
ass | ASS
are-ou-ass | ARE ou ASS ?
csp | CSP (contrat de sécurisation professionnelle)
aides-au-logement | Les aides au logement (APL, ALS, ALF)
css | Complémentaire santé solidaire (CSS)
desert-medical | Désert médical
ccas | CCAS (centre communal d'action sociale)
france-services | France Services
msa | MSA (Mutualité sociale agricole)
non-recours | Non-recours aux droits
quotient-familial | Quotient familial
plafond-de-ressources | Plafond de ressources
reste-a-vivre | Reste à vivre
declaration-de-ressources | Déclaration de ressources
conseil-de-prud-hommes | Conseil de prud'hommes
inspection-du-travail | Inspection du travail
defenseur-des-droits | Défenseur des droits
aide-juridictionnelle | Aide juridictionnelle
point-justice | Point-justice
recours-amiable | Recours amiable
recours-amiable-ou-contentieux | Recours amiable ou contentieux ?
discrimination | Discrimination
discrimination-ou-difference-de-traitement | Discrimination ou différence de traitement ?
dalo | Droit au logement opposable (DALO)
siao-115 | SIAO et 115
treve-hivernale | Trêve hivernale
fsl | Fonds de solidarité pour le logement (FSL)
visale | Garantie Visale
mobili-jeune | Mobili-Jeune : une aide pour payer son loyer en alternance
maprimerenov | MaPrimeRénov'
maprimeadapt | MaPrimeAdapt'
prets-action-logement-salaries | Prêts d'Action Logement pour les salariés propriétaires
intermediation-locative | Intermédiation locative
pension-de-famille | Pension de famille
foyer-jeunes-travailleurs | Foyer de jeunes travailleurs (FJT)
accueil-de-jour | Accueil de jour
domiciliation | Domiciliation
hebergement-ou-logement-accompagne | Hébergement ou logement accompagné ?
commission-de-surendettement | Commission de surendettement
plan-conventionnel-de-redressement | Plan conventionnel de redressement
mesures-imposees | Mesures imposées
retablissement-personnel | Rétablissement personnel
ficp | FICP (fichier des incidents de crédit)
droit-au-compte | Droit au compte
services-bancaires-de-base | Services bancaires de base
saisie-sur-salaire | Saisie sur salaire
point-conseil-budget | Point conseil budget (PCB)
microcredit-personnel | Microcrédit personnel
epicerie-sociale | Épicerie sociale et solidaire
bonne-foi | Bonne foi
radiation | Radiation de France Travail
plan-conventionnel-ou-mesures-imposees | Plan conventionnel ou mesures imposées ?
mdph | MDPH (maison départementale des personnes handicapées)
agefiph | Agefiph et FIPHFP
oeth | Obligation d'emploi des travailleurs handicapés (OETH)
esat | ESAT (établissement ou service d'aide par le travail)
entreprise-adaptee | Entreprise adaptée (EA)
emploi-accompagne | Emploi accompagné
reclassement | Reclassement
visite-de-reprise | Visite de reprise
milieu-ordinaire-ou-milieu-protege | Milieu ordinaire ou milieu protégé ?
rqth-ou-oeth | RQTH ou OETH ?
pension-invalidite | Pension d'invalidité
pch | PCH (prestation de compensation du handicap)
carte-mobilite-inclusion | CMI (carte mobilité inclusion)
rlh | RLH (reconnaissance de la lourdeur du handicap)
demandeur-emploi-categories | Les catégories A, B, C de demandeurs d'emploi
inscription-automatique-france-travail-2025 | L'inscription automatique à France Travail depuis 2025
chomage-au-sens-du-bit | Chômage au sens du Bureau international du travail
demandeur-emploi-longue-duree | Demandeur d'emploi de longue durée
besoins-en-main-d-oeuvre | Besoins en main-d'œuvre (BMO)
metier-en-tension | Métier en tension
neet | NEET (ni en emploi, ni en études, ni en formation)
zone-d-emploi | Zone d'emploi
economie-presentielle | Économie présentielle
inscrit-a-france-travail-ou-chomeur-bit | Inscrit à France Travail ou chômeur au sens du BIT ?
metier-en-tension-ou-metier-qui-recrute | Métier en tension ou métier qui recrute ?
creations-entreprises-micro-entrepreneurs | Créations d'entreprises et micro-entrepreneurs
radiation-d-office-entreprise | Radiation d'office d'une entreprise
defaillance-entreprise | Défaillance d'entreprise
vente-fonds-de-commerce | Vente d'un fonds de commerce
cae | Coopérative d'activité et d'emploi (CAE)
pret-d-honneur | Prêt d'honneur
microcredit-professionnel | Microcrédit professionnel
guichet-unique-entreprises | Guichet unique des formalités des entreprises
travailleur-non-salarie | Travailleur non salarié (TNS)
siren-ou-siret | SIREN ou SIRET ?
entreprise-individuelle-ou-societe | Entreprise individuelle ou société ?
salarie-ou-travailleur-non-salarie | Salarié ou travailleur non salarié ?
microcredit-personnel-ou-professionnel | Microcrédit personnel ou professionnel ?
cfa | Centre de formation d'apprentis (CFA)
opco | OPCO (opérateur de compétences)
ecole-2e-chance | École de la deuxième chance (E2C)
epide | EPIDE (établissement pour l'insertion dans l'emploi)
ecole-de-production | École de production
service-civique | Service civique
obligation-de-formation | Obligation de formation des 16-18 ans
psad | Plateforme de suivi et d'appui aux décrocheurs (PSAD)
apprentissage-ou-professionnalisation | Apprentissage ou professionnalisation ?
ecole-2e-chance-ou-epide | École de la deuxième chance ou EPIDE ?
ofii | OFII (Office français de l'immigration et de l'intégration)
ofpra | OFPRA (Office français de protection des réfugiés et apatrides)
protection-subsidiaire | Protection subsidiaire
contrat-integration-republicaine | Contrat d'intégration républicaine (CIR)
autorisation-de-travail | Autorisation de travail
primo-arrivant | Primo-arrivant
attestation-de-comparabilite | Attestation de comparabilité
titre-de-sejour | Titre de séjour
refugie-ou-protection-subsidiaire | Statut de réfugié ou protection subsidiaire ?
titre-de-sejour-ou-autorisation-de-travail | Titre de séjour ou autorisation de travail ?
spip | SPIP (service pénitentiaire d'insertion et de probation)
amenagement-de-peine | Aménagement de peine
bulletin-n-3 | Bulletin n° 3 du casier judiciaire
bulletin-2-ou-bulletin-3 | Bulletin n° 2 ou bulletin n° 3 ?
milieu-ouvert-ou-milieu-ferme | Milieu ouvert ou milieu fermé ?
cumul-emploi-retraite | Cumul emploi-retraite
suspension-reforme-retraites-2026 | La suspension de la réforme des retraites (2026-2028)
retraite-progressive | Retraite progressive
releve-de-carriere | Relevé de carrière
entretien-information-retraite | Entretien information retraite
mise-a-la-retraite | Mise à la retraite
cumul-integral-ou-cumul-plafonne | Cumul intégral ou cumul plafonné ?
depart-volontaire-ou-mise-a-la-retraite | Départ volontaire ou mise à la retraite ?
garage-solidaire | Garage solidaire
auto-ecole-sociale | Auto-école sociale et solidaire
plateforme-mobilite | Plateforme de mobilité
transport-a-la-demande | Transport à la demande (TAD)
permis-points | Permis à points : perte et récupération
permis-suspendu-ou-annule | Permis suspendu ou annulé ?
mam | Maison d'assistants maternels (MAM)
relais-petite-enfance | Relais petite enfance (RPE)
creche-avip | Crèche à vocation d'insertion professionnelle (AVIP)
aripa | Aripa (recouvrement des pensions alimentaires)
cddi | CDD d'insertion (CDDI)
cdd-tremplin | CDD Tremplin
prime-de-precarite | Prime de précarité
contrat-saisonnier | Contrat saisonnier
entretien-prealable | Entretien préalable
delais-qui-protegent | Les délais qui protègent (rétractation, réflexion, prévenance)
portabilite-mutuelle | Portabilité de la mutuelle
demission-legitime | Démission légitime
cdd-classique-ou-cdd-d-insertion | CDD classique ou CDD d'insertion ?
prime-de-precarite-ou-indemnite-de-licenciement | Prime de précarité ou indemnité de licenciement ?
competences-de-base | Compétences de base
clea | CléA
cecrl | Échelle européenne des langues (CECRL)
diplomes-de-francais | Les diplômes et tests de français (DELF, DILF, TCF)
atelier-sociolinguistique | Atelier sociolinguistique (ASL)
illettrisme-ou-illectronisme | Illettrisme ou illectronisme ?
alphabetisation-ou-fle | Alphabétisation ou français langue étrangère ?
contrat-d-engagement | Contrat d'engagement
referent-unique | Référent unique
accompagnement-global | Accompagnement global
personnes-invisibles | Les personnes invisibles
offre-raisonnable-d-emploi | Offre raisonnable d'emploi
pair-aidance | Pair-aidance
secret-professionnel | Secret professionnel et partage d'informations
personne-de-confiance | Personne de confiance
tiers-de-confiance-numerique | Aidant numérique et mandat
marche-public | Marché public
acheteur-public | Acheteur public
heures-d-insertion | Heures d'insertion
marche-reserve | Marché réservé
allotissement | Allotissement
sous-traitance | Sous-traitance
co-traitance | Co-traitance (groupement)
sous-traitance-ou-co-traitance | Sous-traitance ou co-traitance ?
moins-disant-ou-mieux-disant | Moins-disant ou mieux-disant ?
clause-d-execution-ou-critere-d-attribution | Clause d'exécution ou critère d'attribution ?
arce | ARCE (aide à la reprise ou à la création d'entreprise)
pass-iae | Pass IAE
cape | Contrat d'appui au projet d'entreprise (CAPE)
garantie-de-pret | Garantie de prêt
franchise-de-tva | Franchise de TVA
versement-liberatoire | Versement libératoire
suspension-remobilisation | Suspension-remobilisation
fonds-d-aide-aux-jeunes | Fonds d'aide aux jeunes (FAJ)
contrat-d-apprentissage | Contrat d'apprentissage
pec | Parcours emploi compétences (PEC)
indemnite-legale-de-licenciement | Indemnité légale de licenciement
homologation-rupture-conventionnelle | Homologation (rupture conventionnelle)
index-egalite-professionnelle | L'index de l'égalité professionnelle
tese | Titre emploi-service entreprise (Tese)
complementaire-sante-collective | Complémentaire santé collective
prevoyance-complementaire | Prévoyance complémentaire
duerp | Document unique d'évaluation des risques professionnels (DUERP)
delegue-syndical | Délégué syndical
visite-d-information-et-de-prevention | Visite d'information et de prévention (VIP)
indemnite-depart-volontaire-retraite | Indemnité de départ volontaire à la retraite
prepa-apprentissage | Prépa-apprentissage
france-vae | France VAE
action-de-formation-conventionnee | Action de formation conventionnée (AFC)
reste-a-charge-formation | Reste à charge (formation)
bourse-sur-criteres-sociaux | Bourse sur critères sociaux
abondement-cpf | Abondement (CPF)
transitions-pro | Transitions Pro
oepre | OEPRE (Ouvrir l'école aux parents pour la réussite des enfants)
francais-a-visee-professionnelle | Français à visée professionnelle
profession-reglementee | Profession réglementée
attestation-de-demande-d-asile | Attestation de demande d'asile
naturalisation-par-decret | Naturalisation par décret
examen-civique | Examen civique
accord-de-reciprocite | Accord de réciprocité (permis de conduire)
admission-exceptionnelle-au-sejour | Admission exceptionnelle au séjour
recepisse | Récépissé
liberation-sous-contrainte | Libération sous contrainte
juge-de-l-application-des-peines | Juge de l'application des peines
rehabilitation | Réhabilitation
levee-d-ecrou | Levée d'écrou
contrat-emploi-penitentiaire | Contrat d'emploi pénitentiaire
france-travail-justice | France Travail justice
prescription-delai | Prescription (délai)
numero-unique-enregistrement | Numéro unique d'enregistrement
commandement-de-payer | Commandement de payer
permis-a-1-euro-par-jour | Permis à 1 euro par jour
pajemploi | Pajemploi
secours-d-urgence | Secours d'urgence
recevabilite | Recevabilité (surendettement)
chomage-recensement | Chômage au sens du recensement
taux-d-emploi | Taux d'emploi
population-active | Population active
correction-variations-saisonnieres | Correction des variations saisonnières (CVS)
zonage-ars | Zonage ARS (ZIP, ZAC)

Termine par un bloc entre [LEXIQUE-BRUT] et [/LEXIQUE-BRUT], une entrée par terme, séparées par une ligne vide, les champs dans l'ordre ci-dessus (une ligne champ: valeur chacun).
[LEXIQUE-BRUT]
id: ...
titre: ...
statut: nouveau | evolue | obsolete
changement: -
fait_brut: ...
source: nom-court | titre | https://adresse | JJ/MM/AAAA
preuve: ...
[/LEXIQUE-BRUT]

RÉPONSE EN PLUSIEURS FOIS : si la réponse est trop longue pour tenir en une seule fois, arrête-toi proprement à la fin d'un terme entier, ferme le bloc ouvert par [/LEXIQUE-BRUT], puis écris la ligne « SUITE DISPONIBLE : il reste [liste des termes restants]. Voulez-vous la suite ? ». Je répondrai oui et tu reprendras à la partie suivante, dans un nouveau bloc [LEXIQUE-BRUT...], sans répéter ce qui est déjà donné. Ne saute jamais un terme en silence et ne raccourcis jamais la liste pour la faire tenir. Dans la suite, ne repropose aucun terme déjà donné.

Après [/LEXIQUE-BRUT], en dehors de ce bloc, écris les sites officiels que tu n'as pas pu ouvrir :
[SITES-NON-OUVERTS]
site | adresse de la page ou de la rubrique | raison (bloqué, introuvable, trop long, non essayé) | ce que je cherchais
[/SITES-NON-OUVERTS]
S'il n'y en a aucun, écris seulement « aucun » entre les deux balises.

Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot S35 : Lexique, les chiffres à jour des 6 fiches qui ont un bloc de chiffres

*Mobili-Jeune, MaPrimeRénov', MaPrimeAdapt', prêts Action Logement, contrat de valorisation de l'expérience, primes. L'outil les juge « à jour » (vérifiées les 27 et 29 octobre) : à lancer seulement si vous voulez un second contrôle.*

Tu travailles dans une session cloud, sans navigateur. Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats. Si une page refuse les robots (403, Access Denied, Just a moment ou équivalent), ne la remplace jamais par une valeur approchée : note-la dans le bloc des sites non ouverts demandé plus bas. Respecte à la lettre les blocs entre crochets demandés dans le message qui suit, ils sont lus par un outil.

Le message commence ici.

@Recherche sur le Web

Nous sommes le 01/11/2026.

Je vais te donner une liste de chiffres (dates, montants, durées) tirés de fiches d'un lexique d'insertion professionnelle. Tu dois vérifier chacun UNIQUEMENT sur les sites OFFICIELS (administration, organisme qui verse l'aide, texte de loi).

Tu peux traiter autant de lignes que possible en une réponse, mais tu privilégies toujours la fiabilité plutôt que la quantité.

Pour chaque ligne :
1. Ouvre la page officielle qui donne cette valeur.
2. Lis uniquement ce qui est affiché sur cette page.
3. N'utilise aucun forum, aucun blog, aucun comparateur, aucun article de presse, aucun annuaire, et aucun autre assistant.
4. N'invente jamais une information. Si tu ne peux pas ouvrir la page officielle, indique « non vérifiable ».
5. Si la valeur affichée est la même, indique « confirmé ».
6. Si la valeur affichée est différente, indique « corrigé » et donne UNIQUEMENT la valeur lue sur la page officielle, avec les mêmes unités.
7. Si le dispositif n'existe plus, indique « corrigé » et écris ce que dit la page officielle (par exemple « supprimé le ... »).

Réponds uniquement sous cette forme, une ligne par valeur, entre les marqueurs [LEXIQUE-CHIFFRES] et [/LEXIQUE-CHIFFRES] :

[LEXIQUE-CHIFFRES]
identifiant de la fiche | libellé | statut | valeur lue sur la page officielle | URL exacte de la page lue | ce que tu as lu
[/LEXIQUE-CHIFFRES]

Recopie l'identifiant de la fiche et le libellé EXACTEMENT comme ci-dessous. Ne fais aucun commentaire.

Si toutes les lignes ne tiennent pas dans une réponse, continue automatiquement avec PARTIE 2, PARTIE 3, etc., jusqu'à avoir traité toute la liste. Ne t'arrête jamais après quelques lignes.

FICHE mobili-jeune (Mobili-Jeune : une aide pour payer son loyer en alternance) ; source officielle attendue : Action Logement, page « Aide Mobili-Jeune » https://www.actionlogement.fr/aide-mobili-jeune
  - Âge : moins de 30 ans (au-delà, possible avec une reconnaissance de handicap)
  - Plafond de salaire : 120 % du SMIC brut mensuel
  - Moment de la demande : dans les 3 mois avant ou les 5 mois après le début du contrat
  - Distance avec l'ancien logement : plus de 70 km, ou trajet de plus de 40 minutes, ou double loyer
  - Montant de l'aide : de 10 à 100 € par mois, plafond de 1 100 € par année de formation, en 11 mensualités
  - Durée maximale : 2 années de formation
  - Délai d'étude d'un dossier complet : 7 jours ouvrés

FICHE maprimerenov (MaPrimeRénov') ; source officielle attendue : Service-public.gouv.fr, fiche « MaPrimeRénov' (propriétaires occupants) » https://www.service-public.gouv.fr/particuliers/vosdroits/F35083
  - Ancienneté du logement : construit depuis au moins 15 ans (en métropole)
  - Rénovation d'ampleur : occupation : résidence principale pendant au moins 3 ans
  - Rénovation d'ampleur : état du logement : classé E, F ou G avant les travaux, gain d'au moins 2 classes
  - Part prise en charge selon les ressources (gain de 2 classes) : ménages très modestes 80 %, modestes 60 %, intermédiaires 45 %, supérieurs 10 %
  - Dépenses prises en compte (hors taxes) : jusqu'à 30 000 € (gain de 2 classes) ou 40 000 € (gain de 3 classes ou plus)
  - Plafonds de ressources pour une personne, hors Île-de-France : très modestes 17 363 €, modestes 22 259 €, intermédiaires 31 185 € (revenu fiscal de référence 2025, demande en 2026)
  - Délai pour terminer les travaux : 3 ans (1 an si une avance a été versée)

FICHE maprimeadapt (MaPrimeAdapt') ; source officielle attendue : Service-public.gouv.fr, fiche « MaPrimeAdapt' : travaux d'adaptation du logement » https://www.service-public.gouv.fr/particuliers/vosdroits/F37501
  - Âge : 70 ans ou plus, ou 60 à 69 ans avec un classement en GIR (perte d'autonomie)
  - Handicap : taux d'incapacité d'au moins 50 %, ou éligibilité à la PCH, à l'AEEH ou à l'AAH
  - Plafonds de ressources pour une personne, hors Île-de-France : très modestes 17 363 €, modestes 22 259 € (revenu fiscal de référence)
  - Part des travaux prise en charge : ménages très modestes 70 %, modestes 50 %
  - Plafond de travaux pris en compte (hors taxes) : 22 000 €

FICHE prets-action-logement-salaries (Prêts d'Action Logement pour les salariés propriétaires) ; source officielle attendue : Action Logement, pages « Prêt travaux » et « Prêt accession » https://www.actionlogement.fr/le-pret-travaux-amelioration
  - Entreprise du salarié : secteur privé non agricole, au moins 10 salariés
  - Prêt travaux : montant : jusqu'à 10 000 €, jusqu'à 100 % du prix des travaux
  - Prêt travaux : taux : 1,5 % fixe, hors assurance facultative
  - Prêt travaux : durée : 10 ans au plus
  - Prêt accession : montant : jusqu'à 30 000 €
  - Prêt accession : taux : 1 % fixe, hors assurance obligatoire
  - Prêt accession : durée : 25 ans au plus
  - Prêt accession : dépôt du dossier : au moins 30 jours ouvrés avant la signature chez le notaire

FICHE contrat-valorisation-experience (Contrat de valorisation de l'expérience (CVE)) ; source officielle attendue : https://entreprendre.service-public.gouv.fr/vosdroits/F39356?lang https://www.service-public.fr
  - Texte de création : loi du 24 octobre 2025
  - Durée de l'expérimentation : jusqu'en 2030
  - Âge des personnes concernées : 60 ans et plus, ou 57 ans si un accord de branche le prévoit
  - Durée de l'exonération pour l'employeur : trois ans -  l’exonération de la contribution patronale spécifique de 40% sur l’indemnité de mise à la retraite vaut pour les ruptures intervenant jusqu’au 31 décembre 2028.

FICHE primes (Prime) ; source officielle attendue : www.service-public.gouv.fr https://www.service-public.gouv.fr/particuliers/vosdroits/F2301?lang=fr
  - Prime de fin d’année : un mois


Le message se termine ici. Après le dernier bloc qu'il demande, ajoute ces deux sections, en dehors de tout bloc :

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

## Ce que le cloud ne remplace pas : les 21 sites à consulter vous-même

L'outil les liste dans « À aller chercher vous-même » : les assistants ne les lisent pas bien (pages en JavaScript, tableaux de bord, fichiers PDF). Si Claude cloud les refuse aussi, ce sont les mêmes pour lui. Pour chacun, copiez le texte de la page (ce qui est paru en octobre 2026, ou la dernière valeur publiée avec sa date) dans l'outil, à la place « Coller le texte copié ».

- [Légifrance](https://www.legifrance.gouv.fr/jorf/jo) (Comprendre le cadre) : le sommaire du Journal officiel, jour par jour.
- [service-public.gouv.fr (actualités)](https://www.service-public.gouv.fr/particuliers/actualites) (Comprendre le cadre) : les actualités et l'article « Ce qui change » du mois (aides, minima sociaux, emploi, formation).
- [Ministère de l'Intérieur](https://www.interieur.gouv.fr/immigration) (Comprendre le cadre) : immigration, titres de séjour.
- [Immigration (Intérieur)](https://www.immigration.interieur.gouv.fr/fr/Actualites) (Comprendre le cadre) : séjour et droit au travail des personnes étrangères, CIR, OFII, parcours linguistique.
- [info.gouv.fr](https://www.info.gouv.fr/organisation/delegation-interministerielle-a-l-hebergement-et-a-l-acces-au-logement) (Comprendre le cadre) : hébergement, accès au logement, logement d'abord (DIHAL).
- [economie.gouv.fr](https://www.economie.gouv.fr/actualites) (Comprendre le cadre) : création et micro-entreprise (seuils, cotisations), clauses sociales.
- [education.gouv.fr](https://www.education.gouv.fr/le-bulletin-officiel-de-l-education-nationale-de-la-jeunesse-et-des-sports-6152) (Comprendre le cadre) : Bulletin officiel : obligation de formation 16-18 ans, OEPRE, décrochage.
- [Eduscol](https://eduscol.education.gouv.fr/) (Comprendre le cadre) : dispositifs de l'Éducation nationale (OEPRE...).
- [Académie de Bordeaux](https://www.ac-bordeaux.fr/) (Comprendre le cadre) : établissements scolaires du territoire.
- [monenfant.fr](https://monenfant.fr/) (Comprendre le cadre) : modes de garde, relais petite enfance, aides à la garde.
- [justice.fr](https://www.justice.fr/) (Comprendre le cadre) : aide juridictionnelle, points-justice, conseil de prud'hommes.
- [mesdroitssociaux.gouv.fr](https://www.mesdroitssociaux.gouv.fr/) (Comprendre le cadre) : simulateurs de prestations sociales.
- [Ministère du Travail - Travailler après 50 ans et retraite](https://travail-emploi.gouv.fr/actualites-presse-et-outils/actualites-et-breves) (Comprendre le cadre) : fin de carrière et retraite : retraite progressive, cumul emploi-retraite, départ volontaire et mise à la retraite, mesures des lois de financement de la Sécurité sociale.
- [Le Guide des aides de la Région Nouvelle-Aquitaine](https://les-aides.nouvelle-aquitaine.fr/economie-et-emploi) (Comprendre le cadre) : aides régionales à la formation, à la reconversion, à la création et à l'installation (montants, plafonds de ressources, calendriers de dépôt), revues par délibération du conseil régional.
- [Onisep](https://www.onisep.fr/) (Comprendre le cadre) : fiches diplômes et fiches métiers (dont le BPREA) : pages en JavaScript, non lisibles par un assistant.
- [INSEE - séries chronologiques](https://www.insee.fr/fr/statistiques) (Comprendre les chiffres) : taux de chômage localisés trimestre par trimestre, estimations d'emploi, séries longues (les pages « série » s'affichent en JavaScript, illisibles par un assistant).
- [statistiques.francetravail.org (STMT)](https://statistiques.francetravail.org/stmt/publication) (Comprendre les chiffres) : demandeurs d'emploi par département et par tranche (âge, ancienneté, sexe), offres collectées : tableaux de bord interactifs, non lisibles automatiquement.
- [DREETS Nouvelle-Aquitaine (PDF départementaux)](https://nouvelle-aquitaine.dreets.gouv.fr/) (Comprendre les chiffres) : les notes trimestrielles « Personnes inscrites à France Travail » Dordogne et Haute-Vienne sont en PDF joint, pas dans la page.
- [Eurostat - Data Browser](https://ec.europa.eu/eurostat/databrowser/) (Comprendre les chiffres) : les 11 indicateurs de comparaison européenne (chômage, NEET, emploi, temps partiel, écart salarial, diplômés, formation des adultes...) : base en JavaScript ; pour lire une valeur sans l'ouvrir, l'interface de diffusion .../api/dissemination/... renvoie du JSON.
- [Enquête Besoins en Main d'Œuvre (France Travail)](https://www.francetravail.org/statistiques-analyses/enquete-besoins-main-oeuvre.html) (Comprendre les chiffres) : métiers en tension par département : résultats souvent dans un tableau de bord ou un fichier à télécharger.
- [SI-Terr - Cap Métiers Nouvelle-Aquitaine](https://siterr.cap-metiers.pro/) (Comprendre les chiffres) : portraits de territoire (région, département, zone d'emploi) qui rassemblent en un seul endroit emploi, chômage, formation, démographie, secteurs. Croise INSEE, DARES, France Travail et le Rectorat ; utile comme point de départ, mais la source à citer reste la source primaire (INSEE, DARES...). Navigation interactive, à lire à la main..

# PARTIE 3 : contrôles qui n'étaient dans aucun outil (urgences, répertoire des freins, adresses publiées en défaut)

Ces quatre messages couvrent ce qui vieillit dans l'application sans qu'aucun outil ne le revérifie. J'ai d'abord fait moi-même un **contrôle automatique de 715 adresses déjà publiées** (registre du Cadre, répertoire des freins, lieux, employeurs, offres) : **631 répondent**, **64 refusent les robots** (déjà vérifiées à la main par vous, rien à faire), **20 sont en défaut** (4 pages introuvables, 16 sans réponse). Ce sont ces 20 qui forment le dernier lot.

**Pour Perplexity ou ChatGPT** (valable pour toutes les parties de ce fichier) : ces deux assistants lisent le web sans la commande curl, donc retirez trois choses avant de coller. (1) Dans la partie 2 : le début, de « Tu travailles dans une session cloud » jusqu'à « Le message commence ici. ». (2) Dans toutes les parties : le paragraphe « Méthode : utilise la commande curl -L… » quand il existe. (3) Dans toutes les parties : le paragraphe de la section « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER », qui ne sert qu'au cloud ; gardez « À OUVRIR PAR MOI », utile partout. Le reste se colle tel quel.

**Pas ajoutés, volontairement :** les registres publiés des lieux (194), des employeurs (108) et des offres (127) ont tous été vérifiés en octobre 2026 : la revérification n'est due qu'au bout de six mois. Les 426 mots du Lexique n'ont aucun chiffre dans leur texte (ils sont déplacés dans des blocs, déjà couverts par le lot du Lexique). Le sas des téléphones (`sans-numero`) et les fiches « en attente » sont vides aujourd'hui.

## Sommaire de la partie 3

| Lot | Message | Lignes |
|---|---|---|
| T1 | Numéros et portes d'urgence | 12 |
| T2 | Répertoire des freins (1/2) | 17 |
| T3 | Répertoire des freins (2/2) | 16 |
| T4 | Adresses publiées qui ne répondent plus | 20 |

---

# Lot T1 : numéros et portes d'urgence

*Les 8 numéros d'urgence affichés à froid et les 4 affirmations qui les accompagnent. Court, à lancer en premier.*

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Je vérifie les numéros d'urgence nationaux et les « portes » qu'une application d'aide à la recherche d'emploi affiche à froid, pour des personnes en grande difficulté. Pour chaque numéro de la liste, vérifie sur une page officielle (service-public.fr, ministère concerné, 3114.fr, 119.gouv.fr, 3919 sur arretonslesviolences.gouv.fr, solidarites.gouv.fr) : (1) que le numéro existe toujours et porte bien ce nom, (2) les horaires (« 24h/24 » ou non), (3) la gratuité, (4) la confidentialité ou l'anonymat quand la liste les annonce. Donne pour chaque ligne l'adresse exacte de la page lue et un passage recopié mot pour mot.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Liste des numéros (numéro | nom | ce que l'application annonce) :
1. 15 | SAMU | 24h/24, gratuit
2. 17 | Police / Gendarmerie | 24h/24, gratuit
3. 18 | Pompiers | 24h/24, gratuit
4. 112 | Numéro d'urgence européen | 24h/24, gratuit
5. 115 | SAMU social | 24h/24, gratuit
6. 119 | Enfance en danger | 24h/24, gratuit, confidentiel
7. 3114 | Prévention du suicide | 24h/24, gratuit, confidentiel
8. 3919 | Violences faites aux femmes | 24h/24, gratuit, anonyme

Vérifie aussi quatre affirmations de l'application, sur une page officielle chacune :
A. La trêve hivernale va du 1er novembre au 31 mars, et le fournisseur ne peut pas couper l'électricité pendant cette période.
B. Le FSL Maintien (Fonds de Solidarité pour le Logement) existe encore et se demande auprès de la Maison Départementale des Solidarités (MDS) ou du CCAS.
C. L'ADIL (Agence Départementale d'Information sur le Logement) informe gratuitement sur les droits et les délais en cas d'expulsion.
D. Le CCAS de la mairie peut accorder un secours d'urgence (aide financière ponctuelle).
Pour A à D : « confirmé », « différent : [ce que dit la page] » ou « non vérifiable », avec l'adresse de la page lue.

Pour les mêmes sujets, dis aussi s'il existe une particularité en Dordogne (24) ou en Haute-Vienne (87) : numéro local, ADIL (ADIL 24 et ADIL 87), MDS ou CCAS de Périgueux et de Limoges. Réponds « pas de particularité trouvée » sinon. Ne donne aucune adresse ni aucun téléphone local que tu n'as pas lu sur une page officielle ouverte.

Format de réponse : un tableau Markdown : Numéro ou point (1 à 8, A à D) | Verdict (confirmé / différent / non vérifiable) | Ce que dit la page | Page lue | Passage recopié | Confiance (sûr / à vérifier / non fiable).

Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

---

# Lot T2 : répertoire des freins (1/2)

*17 ressources : jamais revérifiées depuis leur ajout.*

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Je contrôle les ressources d'un répertoire d'aides pour des personnes en difficulté (logement, santé, argent, mobilité, droits, violences…). Aucune de ces adresses n'a été revérifiée depuis son ajout. Pour chaque ressource, (1) ouvre l'adresse proposée et dis si c'est bien le site de l'organisme ou du service nommé, (2) dis si le service existe et est actif aujourd'hui (pas fermé, pas fusionné, pas rebaptisé), (3) dis si le nom affiché dans la liste décrit encore son rôle, (4) si l'adresse a changé ou si la page d'accueil ne présente plus ce service, donne l'adresse officielle actuelle. Ces ressources sont nationales : la présence en Dordogne (24) et en Haute-Vienne (87) ne se vérifie que si la page parle d'un service local, et tu dis alors lequel (ne donne jamais une adresse ou un téléphone local que tu n'as pas lu sur la page).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Ressource | Adresse officielle (confirmée / nouvelle adresse) | Service actif (oui / non / non lisible) | Le nom décrit encore son rôle (oui / non : [proposition]) | Phrase lue | Confiance (sûr / à vérifier / non fiable).

Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Fédération française des Banques Alimentaires | adresse : https://www.banquealimentaire.org [répond]
2. Les Restos du Cœur | adresse : https://www.restosducoeur.org [répond]
3. Secours Populaire Français | adresse : https://www.secourspopulaire.fr [répond]
4. Croix-Rouge française | adresse : https://www.croix-rouge.fr [répond]
5. service-public.fr | adresse : https://www.service-public.fr [répond]
6. Solidarauto | adresse : https://solidarauto.org [répond]
7. service-public.fr | adresse : https://www.service-public.fr [répond]
8. Secours Populaire Français | adresse : https://www.secourspopulaire.fr [répond]
9. Croix-Rouge française | adresse : https://www.croix-rouge.fr [répond]
10. Mon Soutien Psy | adresse : https://www.monsoutienpsy.sante.gouv.fr [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
11. Ameli | adresse : https://www.ameli.fr [répond]
12. Mon Parcours Handicap | adresse : https://www.monparcourshandicap.gouv.fr [répond]
13. AGEFIPH | adresse : https://www.agefiph.fr [répond]
14. EPNAK (emploi accompagné, ESAT) | adresse : https://www.epnak.org [répond]
15. Banque de France (particuliers) | adresse : https://www.banque-france.fr [répond]
16. Mes Droits Sociaux | adresse : https://www.mesdroitssociaux.gouv.fr [répond]
17. service-public.fr | adresse : https://www.service-public.fr [répond]

---

# Lot T3 : répertoire des freins (2/2)

*16 ressources.*

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Je contrôle les ressources d'un répertoire d'aides pour des personnes en difficulté (logement, santé, argent, mobilité, droits, violences…). Aucune de ces adresses n'a été revérifiée depuis son ajout. Pour chaque ressource, (1) ouvre l'adresse proposée et dis si c'est bien le site de l'organisme ou du service nommé, (2) dis si le service existe et est actif aujourd'hui (pas fermé, pas fusionné, pas rebaptisé), (3) dis si le nom affiché dans la liste décrit encore son rôle, (4) si l'adresse a changé ou si la page d'accueil ne présente plus ce service, donne l'adresse officielle actuelle. Ces ressources sont nationales : la présence en Dordogne (24) et en Haute-Vienne (87) ne se vérifie que si la page parle d'un service local, et tu dis alors lequel (ne donne jamais une adresse ou un téléphone local que tu n'as pas lu sur la page).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

Format de réponse : un tableau Markdown : Ressource | Adresse officielle (confirmée / nouvelle adresse) | Service actif (oui / non / non lisible) | Le nom décrit encore son rôle (oui / non : [proposition]) | Phrase lue | Confiance (sûr / à vérifier / non fiable).

Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. France Travail | adresse : https://www.francetravail.fr [répond]
2. La Bonne Boîte | adresse : https://labonneboite.francetravail.fr [répond]
3. Emploi Store | adresse : https://www.francetravail.fr/candidat/vos-services-en-ligne/emploi-store.html [répond]
4. Mon Compte Formation | adresse : https://www.moncompteformation.gouv.fr [répond]
5. France VAE | adresse : https://vae.gouv.fr [répond]
6. AFPA | adresse : https://www.afpa.fr [répond]
7. Cap Métiers Nouvelle-Aquitaine | adresse : https://www.cap-metiers.fr [répond]
8. monenfant.fr | adresse : https://monenfant.fr [répond]
9. CAF | adresse : https://www.caf.fr [répond]
10. service-public.fr | adresse : https://www.service-public.fr [répond]
11. ANLCI | adresse : https://www.anlci.gouv.fr [répond]
12. ANLCI | adresse : https://www.anlci.gouv.fr [répond]
13. Défenseur des Droits | adresse : https://www.defenseurdesdroits.fr [répond]
14. arretonslesviolences.gouv.fr | adresse : https://arretonslesviolences.gouv.fr [répond]
15. CIDFF | adresse : https://www.fncidff.info [répond]
16. Association Addictions France | adresse : https://www.addictions-france.org [répond]

---

# Lot T4 : adresses publiées qui ne répondent plus

*20 adresses relevées par le contrôle automatique du 01/11/2026 dans le Cadre, les lieux, les employeurs et les offres.*

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des adresses DÉJÀ PUBLIÉES dans l'application et qui ne répondent plus à un contrôle automatique (adresse morte, erreur 404, certificat incomplet, connexion coupée). Un certificat incomplet ou une connexion coupée est souvent un site qui refuse les robots : l'adresse peut être bonne. Pour chaque ligne : (1) ouvre l'adresse avec curl -L (et sans désactiver la vérification des certificats) et dis ce qui se passe ; (2) si elle est morte, trouve l'adresse officielle actuelle de la MÊME page ou du même sujet (jamais un annuaire ni un site tiers) et donne la phrase de la page qui le prouve ; (3) si le dispositif ou le service n'existe plus, écris « n'existe plus » avec la page qui le dit ; (4) si le site refuse les robots, écris « bloque les robots » et mets le lien dans « À OUVRIR PAR MOI ». Pour les employeurs, les lieux et les agences, établis en plus la présence en Dordogne 24 et en Haute-Vienne 87.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne qui concerne un employeur, une agence ou un lieu, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Adresse publiée | Ce qui se passe | Adresse officielle actuelle | Phrase lue | Dordogne 24 | Haute-Vienne 87 | Verdict de présence (ou « sans objet » pour une page de textes officiels) | Confiance (sûr / à vérifier / non fiable).

Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. cadre : primealaconversion-leasing-social-2026 | adresse : https://www.primealaconversion.gouv.fr/dboneco/accueil/leasingsocial2026.html [erreur 404]
2. cadre : pour-les-personnes-agees-conge-proche-aidant | adresse : https://www.pour-les-personnes-agees.gouv.fr/solutions-pour-les-aidants/travailler-et-aider-un-proche/le-conge-de-proche-aidant [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
3. cadre : pour-les-personnes-agees-ajpa | adresse : https://www.pour-les-personnes-agees.gouv.fr/solutions-pour-les-aidants/soutien-financier/l-allocation-journaliere-du-proche-aidant-qu-est-ce-que-c-est [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
4. cadre : education-obligation-formation-16-18 | adresse : https://www.1jeune1solution.gouv.fr/articles/16-18-obligation-de-formation [erreur 404]
5. cadre : urssaf-autoentrepreneur-essentiel | adresse : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/lessentiel-du-statut.html [ne répond pas (ECONNRESET)]
6. cadre : urssaf-seuils-2026 | adresse : https://www.autoentrepreneur.urssaf.fr/portail/accueil/sinformer-sur-le-statut/toutes-les-actualites/2026--modification-des-seuils-de.html [ne répond pas (ECONNRESET)]
7. cadre : urssaf-evolution-cmg | adresse : https://www.urssaf.fr/accueil/actualites/evolution-cmg-ce-qui-va-changer.html [ne répond pas (connexion)]
8. cadre : pajemploi-urssaf | adresse : https://www.pajemploi.urssaf.fr/ [ne répond pas (ECONNRESET)]
9. cadre : urssaf-reduction-generale | adresse : https://www.urssaf.fr/accueil/employeur/beneficier-exonerations/reduction-generale-cotisation.html [ne répond pas (ECONNRESET)]
10. cadre : urssaf-tese | adresse : https://www.urssaf.fr/portail/sites/urssaf/home/employeur/creer/quelle-urssaf-pour-votre-entrepr/les-offres-de-simplification/le-titre-emploi-service-entrepri.html [ne répond pas (ECONNRESET)]
11. cadre : urssaf-complementaire-sante | adresse : https://www.urssaf.fr/accueil/employeur/embaucher-gerer-salaries/embaucher/complementaire-frais-sante.html [ne répond pas (ECONNRESET)]
12. lieux : Points-justice de la Dordogne | adresse : https://cdad-dordogne.fr/lieux-d-acces-au-droit.html [erreur 404]
13. lieux : URSSAF Nouvelle-Aquitaine | adresse : https://aquitaine.urssaf.fr/accueil.html [ne répond pas (ECONNRESET)]
14. employeurs (recrutement) : Intermarché ; employeurs (recrutement) : Netto | adresse : https://www.carrieres-mousquetaires.com/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
15. employeurs (site) : Profil Intérim Périgueux ; employeurs (site) : Profil Intérim Ribérac ; employeurs (site) : Profil Intérim Montpon | adresse : https://www.profilinterim.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
16. employeurs (site) : Les Briconautes | adresse : https://www.briconautes.fr [ne répond pas (ECONNREFUSED)]
17. offres : ADEME | adresse : https://recrutement.ademe.fr/accueil.aspx [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
18. offres : CROUS de Limoges | adresse : https://recrutement.lescrous.fr/ [ne répond pas (UNABLE_TO_VERIFY_LEAF_SIGNATURE)]
19. offres : Centre hospitalier Jean Leclaire (Sarlat) | adresse : https://ch-sarlat.wixsite.com/monsite/recrutement-du-ch [erreur 404]
20. freins : Mon Soutien Psy | adresse : https://www.monsoutienpsy.sante.gouv.fr [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
