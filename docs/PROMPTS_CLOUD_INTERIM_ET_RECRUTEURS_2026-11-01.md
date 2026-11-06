# Messages du cloud : agences d'intérim et pages de recrutement (2026-11-01)

Complète `docs/PROMPTS_CLOUD_PAR_SECTEUR_2026-11-01.md` (employeurs et structures). Un message = un lot à coller dans une session cloud ; le résultat revient ensuite au Claude local, qui teste chaque adresse avant de l'inscrire. Fabriqué par `scripts/veille_sas/fabriquer_prompts_interim_recruteurs.js` (lots de 18 au plus). Seules les lignes sans date de vérification sont reprises.

## Sommaire

| Lot | Type | Réseau ou secteur | Lignes |
|---|---|---|---|
| I1 | Agences d'intérim | Adecco | 9 |
| I2 | Agences d'intérim | Adéquat | 7 |
| I3 | Agences d'intérim | Claudette Intérim | 7 |
| I4 | Agences d'intérim | Manpower | 8 |
| I5 | Agences d'intérim | autres réseaux (1/4) | 16 |
| I6 | Agences d'intérim | autres réseaux (2/4) | 16 |
| I7 | Agences d'intérim | autres réseaux (3/4) | 16 |
| I8 | Agences d'intérim | autres réseaux (4/4) | 14 |
| I9 | Pages de recrutement | Dordogne (1/4) | 16 |
| I10 | Pages de recrutement | Dordogne (2/4) | 16 |
| I11 | Pages de recrutement | Dordogne (3/4) | 16 |
| I12 | Pages de recrutement | Dordogne (4/4) | 14 |
| I13 | Pages de recrutement | Employeurs publics | 17 |
| I14 | Pages de recrutement | Haute-Vienne (1/2) | 17 |
| I15 | Pages de recrutement | Haute-Vienne (2/2) | 16 |

---

# Lot I1 : agences d'intérim, Adecco

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Adecco : Adecco Périgueux à Périgueux (24000) | adresse de la fiche : 2 Cours Saint-Georges | téléphone de la fiche : 05 53 45 42 20 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/perigueux/ADFR_229 [répond]
2. Adecco : Adecco Bergerac à Bergerac (24100) | adresse de la fiche : 109 Rue Neuve d'Argenson | téléphone de la fiche : 05 53 57 79 99 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/bergerac/ADFR_144 [répond]
3. Adecco : Adecco Nontron à Nontron (24300) | adresse de la fiche : 48 Boulevard Gambetta | téléphone de la fiche : 05 53 56 39 40 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/nontron/ADFR_B27 [répond]
4. Adecco : Adecco Sarlat à Sarlat-la-Canéda (24200) | adresse de la fiche : 73 Avenue Thiers | téléphone de la fiche : 05 53 31 78 78 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/sarlat-la-caneda/ADFR_743 [répond]
5. Adecco : Adecco Limoges à Limoges (87280) | adresse de la fiche : 26 Rue Atlantis | téléphone de la fiche : 05 55 10 02 87 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/limoges/adfr_850 [répond]
6. Adecco : Adecco Limoges Tertiaire à Limoges (87280) | adresse de la fiche : 26 Rue Atlantis | téléphone de la fiche : 05 55 77 27 27 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/limoges/adecco-limoges-tertiaire [répond]
7. Adecco : Adecco BTP Limoges à Limoges (87100) | adresse de la fiche : 26 Rue Atlantis, Parc Ester | téléphone de la fiche : 05 55 34 25 49 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/limoges/adfr_bb3 [répond]
8. Adecco : Adecco Logistique Transport Limoges à Limoges (87000) | adresse de la fiche : 26 Rue Atlantis, Parc Ester | téléphone de la fiche : 05 55 10 30 10 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/limoges/adfr_f92 [répond]
9. Adecco : Adecco Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 3 Boulevard de la République | téléphone de la fiche : 05 55 77 27 27 | page proposée : https://www.adecco.com/fr-fr/agences/nouvelle-aquitaine/saint-junien/adfr_298 [répond]

---

# Lot I2 : agences d'intérim, Adéquat

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Adéquat : Adéquat Bergerac à Bergerac (24100) | adresse de la fiche : 27 Rue Neuve d'Argenson | téléphone de la fiche : 05 53 23 69 29 | page proposée : https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-bergerac [répond]
2. Adéquat : Adéquat Périgueux BTP à Périgueux (24000) | adresse de la fiche : 36 Rue du Président Wilson | téléphone de la fiche : 05 53 35 16 20 | page proposée : https://www.lejobadequat.com/nos-agences/adequat-interim-recrutement-perigueux-btp [répond]
3. Adéquat : Adéquat Périgueux à Périgueux (24000) | adresse de la fiche : 51 Rue du Président Wilson | téléphone de la fiche : 05 53 09 90 60 | page proposée : https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-perigueux [répond]
4. Adéquat : Adéquat Nontron à Nontron (24300) | adresse de la fiche : 18 bis Avenue Yvon Delbos | téléphone de la fiche : 05 47 62 50 20 | page proposée : https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-nontron [répond]
5. Adéquat : Adéquat Terrasson-Lavilledieu à Terrasson-Lavilledieu (24120) | adresse de la fiche : 10 Avenue Jean Jaurès | téléphone de la fiche : 05 53 51 02 15 | page proposée : https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-terrasson [répond]
6. Adéquat : Adéquat Inside Staffing Industrie Parfumerie à Neuvic (24190) | adresse de la fiche : Théorat | téléphone de la fiche : 06 61 79 24 96 | page proposée : https://www.lejobadequat.com/nos-agences [répond]
7. Adéquat : Adéquat Limoges à Limoges (87000) | adresse de la fiche : 13 avenue de la Libération | page proposée : https://www.lejobadequat.com/nos-agences/agence-adequat-interim-recrutement-limoges [répond]

---

# Lot I3 : agences d'intérim, Claudette Intérim

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Claudette Intérim : Claudette Intérim Bergerac à Bergerac (24100) | adresse de la fiche : 48 Rue Neuve d'Argenson | téléphone de la fiche : 05 53 22 34 84 | page proposée : https://claudette-interim.fr/agences/bergerac/ [répond]
2. Claudette Intérim : Claudette Intérim Périgueux à Périgueux (24000) | adresse de la fiche : 17 Place Francheville | téléphone de la fiche : 05 53 35 17 01 | page proposée : https://claudette-interim.fr/agences/perigueux/ [répond]
3. Claudette Intérim : Claudette Intérim Nontron à Nontron (24300) | adresse de la fiche : 20 Place Alfred Agard | téléphone de la fiche : 05 53 60 82 88 | page proposée : https://claudette-interim.fr/agences/nontron/ [répond]
4. Claudette Intérim : Claudette Intérim Sarlat à Sarlat-la-Canéda (24200) | adresse de la fiche : 10 Avenue Aristide Briand | téléphone de la fiche : 05 53 30 43 30 | page proposée : https://claudette-interim.fr/agences/sarlat/ [répond]
5. Claudette Intérim : Claudette Intérim Saint-Astier à Saint-Astier (24110) | adresse de la fiche : 2 Place Gambetta | téléphone de la fiche : 05 53 09 49 28 | page proposée : https://claudette-interim.fr/agences/saint-astier/ [répond]
6. Claudette Intérim : Claudette Intérim Thiviers à Thiviers (24800) | adresse de la fiche : 15 Rue Jean Jaurès | téléphone de la fiche : 05 33 09 05 33 | page proposée : https://claudette-interim.fr/agences/thiviers/ [répond]
7. Claudette Intérim : Claudette Intérim Montpon-Ménestérol à Montpon-Ménestérol (24700) | adresse de la fiche : 56 Rue Thiers | téléphone de la fiche : 05 33 09 29 19 | page proposée : https://claudette-interim.fr/agences/montpon-menesterol/ [répond]

---

# Lot I4 : agences d'intérim, Manpower

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Manpower : Manpower Périgueux à Périgueux (24000) | adresse de la fiche : 4 Cours Saint-Georges | téléphone de la fiche : 05 53 45 46 30 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/perigueux/manpower-perigueux-687 [bloque les robots]
2. Manpower : Manpower Bergerac à Bergerac (24100) | adresse de la fiche : 1 Rue Ragueneau | téléphone de la fiche : 05 53 22 13 00 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/bergerac/manpower-bergerac-218 [bloque les robots]
3. Manpower : Manpower Montpon à Montpon-Ménestérol (24700) | adresse de la fiche : 51 Avenue Jean Moulin | téléphone de la fiche : 05 53 22 13 00 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/montpon-menesterol/manpower-montpon-760 [bloque les robots]
4. Manpower : Manpower Espace Nontron à Nontron (24300) | adresse de la fiche : Rue Brune | téléphone de la fiche : 05 53 60 80 00 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/nontron/manpower-espace-nontron-607 [bloque les robots]
5. Manpower : Manpower Sarlat à Sarlat-la-Canéda (24200) | adresse de la fiche : 76 Avenue Aristide Briand | téléphone de la fiche : 05 53 31 70 50 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/dordogne/sarlat-la-caneda/manpower-sarlat-259 [bloque les robots]
6. Manpower : Manpower Limoges BTP Transport à Limoges (87000) | adresse de la fiche : 1-3 Avenue du Midi, Immeuble le Manager | téléphone de la fiche : 05 55 38 84 00 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/limoges/manpower-limoges-btp-transport-559 [bloque les robots]
7. Manpower : Manpower Limoges Industrie Tertiaire à Limoges (87000) | adresse de la fiche : 1-3 Avenue du Midi, Immeuble le Manager | téléphone de la fiche : 05 55 34 81 40 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/limoges/manpower-limoges-industrie-tertiaire-336 [bloque les robots]
8. Manpower : Manpower Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 1 Rue Junien Rigaud | téléphone de la fiche : 05 55 43 03 00 | page proposée : https://vosagences.manpower.fr/nouvelle-aquitaine/haute-vienne/saint-junien/manpower-saint-junien-289 [bloque les robots]

---

# Lot I5 : agences d'intérim, autres réseaux (1/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. ALM Intérim : ALM Intérim Périgueux à Périgueux (24000) | adresse de la fiche : 171 Route de Lyon | téléphone de la fiche : 05 54 67 10 53 | page proposée : https://www.alm-interim.fr/contact [répond]
2. Actual : Actual Périgueux Wilson à Périgueux (24000) | adresse de la fiche : 3 Rue du Président Wilson | téléphone de la fiche : 05 53 02 14 14 | page proposée : https://reseau.actualgroup.com/nouvelle-aquitaine/dordogne/perigueux [répond]
3. Actual : Actual Périgueux Centre à Périgueux (24000) | adresse de la fiche : 1 Place Yves Guéna | téléphone de la fiche : 05 53 09 46 56 | page proposée : https://www.actualgroup.com/agences/actual-perigueux-centre-a306 [répond]
4. Actual : Actual Nontron à Nontron (24300) | adresse de la fiche : 21 Place Alfred Agard | téléphone de la fiche : 05 53 56 67 42 | page proposée : https://www.actualgroup.com/agences/actual-nontron-ac46 [répond]
5. Actual : Actual Limoges à Limoges (87000) | adresse de la fiche : 16 avenue Baudin | téléphone de la fiche : 05 55 49 07 22 | page proposée : https://reseau.actualgroup.com/nouvelle-aquitaine/haute-vienne/limoges/actual-emploi-limoges-96 [répond]
6. Adecco Medical : Adecco Medical Limoges à Limoges (87280) | adresse de la fiche : 26 Rue Atlantis | téléphone de la fiche : 05 55 10 15 98 | page proposée : https://www.adecco.com/fr-fr/medical/agences/nouvelle-aquitaine/limoges/adecco-medical-limoges [répond]
7. Appel Médical : Appel Médical Périgueux à Coulounieix-Chamiers (24660) | adresse de la fiche : 212 Boulevard des Saveurs, Immeuble Créa Vallée Nord | téléphone de la fiche : 05 53 04 70 33 | page proposée : https://www.appelmedical.com/agence/1003/ [répond]
8. Artus Intérim : Artus Intérim Périgueux à Marsac-sur-l'Isle (24430) | adresse de la fiche : 4 Boulevard de l'Industrie | téléphone de la fiche : 05 33 82 00 44 | page proposée : https://www.artus-interim.com/agence/artus-perigueux/ [répond]
9. Artus Intérim : Artus Intérim Nontron à Nontron (24300) | adresse de la fiche : 6 Allée de Bussac | téléphone de la fiche : 05 53 56 44 17 | page proposée : https://www.artus-interim.com/agence/artus-nontron/ [répond]
10. Artus Intérim : Artus Intérim Limoges à Limoges (87000) | adresse de la fiche : 14 cour Gay Lussac | téléphone de la fiche : 05 55 79 74 08 | page proposée : https://www.artus-interim.com/agence/artus-limoges/ [répond]
11. Artus Intérim : Artus Intérim Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 55 boulevard Victor Hugo | téléphone de la fiche : 05 55 01 79 20 | page proposée : https://www.artus-interim.com/agence/artus-st-junien/ [répond]
12. Camo Emploi : Camo Emploi Limoges à Limoges (87000) | adresse de la fiche : 10 rue d'Isly | téléphone de la fiche : 06 30 27 23 49 | page proposée : https://www.camo-emploi.fr/agence/camo-emploi-limoges-79 [répond]
13. Crit : Crit Limoges Nord à Limoges (87000) | adresse de la fiche : 208 bis Rue de Toulouse, Bâtiment 1B | téléphone de la fiche : 05 55 77 97 30 | page proposée : https://www.crit-job.com/agences/voir/046-crit-limoges-nord/ [répond]
14. Crit : Crit Limoges Sud à Limoges (87000) | adresse de la fiche : 208 Rue de Toulouse, Bâtiment 1A | téléphone de la fiche : 05 55 10 10 31 | page proposée : https://www.crit-job.com/agences/voir/415-crit-limoges-sud/ [répond]
15. Domino RH : Domino Care Limoges à Limoges (87000) | adresse de la fiche : 25 cours Bugeaud | téléphone de la fiche : 05 19 08 28 40 | page proposée : https://domino-rh.com/agences/domino-care-limoges/ [répond]
16. Fusion Intérim : Fusion Intérim Limoges à Limoges (87000) | adresse de la fiche : 18 boulevard Victor Hugo | téléphone de la fiche : 05 55 05 06 00 | page proposée : https://fusioninterim.fr/ [ne répond pas (ENOTFOUND)]

---

# Lot I6 : agences d'intérim, autres réseaux (2/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Interim 24 : Interim 24 Bergerac à Creysse (24100) | adresse de la fiche : 24 Avenue de la Roque | téléphone de la fiche : 05 64 34 00 36 | page proposée : https://interim24.fr/ [bloque les robots]
2. Job Direct : Job Direct Limoges à Limoges (87000) | adresse de la fiche : 12 avenue Garibaldi | page proposée : https://www.job-direct.fr [répond]
3. Jubil Intérim : Jubil Intérim Périgueux à Marsac-sur-l'Isle (24430) | adresse de la fiche : 35 Impasse Louis Suder | téléphone de la fiche : 05 18 22 20 20 | page proposée : https://www.jubil.fr/nos-agences [erreur 404]
4. LIP Intérim : LIP Intérim Limoges à Limoges (87000) | adresse de la fiche : 21 cours Bugeaud | téléphone de la fiche : 05 19 08 01 71 | page proposée : https://www.lipinterim.fr/agence/lip-limoges [erreur 404]
5. Les 5 Pierre : Les 5 Pierre à Limoges (87000) | adresse de la fiche : 5 bis cours Vergniaud | téléphone de la fiche : 05 55 12 78 56 | page proposée : https://www.les5pierre.fr/ [répond]
6. Menco : Menco Bergerac à Bergerac (24100) | adresse de la fiche : Route de Saint-Alvère, Galerie Carrefour Market | téléphone de la fiche : 05 64 34 02 10 | page proposée : https://www.menco-rh.fr/agences/agence-dinterim-bergerac/ [répond]
7. Optineris : Optineris Industrie Tertiaire Transport Limoges à Limoges (87000) | adresse de la fiche : 18 cours Jourdan | téléphone de la fiche : 05 55 77 87 87 | page proposée : https://agence.optineris.fr/9-optineris-industrie-tertiaire-transport-limoges [répond]
8. Optineris : Optineris BTP Limoges à Limoges (87000) | adresse de la fiche : 66 rue François Chénieux | téléphone de la fiche : 05 55 77 71 66 | page proposée : https://agence.optineris.fr/10-optineris-btp-limoges [répond]
9. Optineris : Optineris Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 11 boulevard de la République | téléphone de la fiche : 05 55 02 02 55 | page proposée : https://agence.optineris.fr/33-optineris-saint-junien [répond]
10. Partnaire : Partnaire Limoges à Limoges (87000) | adresse de la fiche : 1 rue Jean Jaurès | téléphone de la fiche : 05 44 19 14 00 | page proposée : https://www.partnaire.fr/nos-agences/a/71-agence-d-interim-cdd-cdi-limoges-partnaire/ [répond]
11. PlaceActiv : PlaceActiv Limousin à Saint-Junien (87200) | adresse de la fiche : 16 rue Augustin Fresnel | téléphone de la fiche : 05 55 03 63 40 | page proposée : https://placeactiv.fr [répond]
12. Profil Intérim : Profil Intérim Bergerac à Bergerac (24100) | adresse de la fiche : 45 Place Gambetta | téléphone de la fiche : 05 53 58 18 50 | page proposée : https://www.actualgroup.com/agences/profil-interim-ac37 [répond]
13. Profil Intérim : Profil Intérim Périgueux à Périgueux (24000) | adresse de la fiche : 134 Avenue Maréchal Juin | téléphone de la fiche : 05 53 06 06 21 | page proposée : https://www.profilinterim.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
14. Profil Intérim : Profil Intérim Ribérac à Ribérac (24600) | adresse de la fiche : 21 ter Place du Général de Gaulle | téléphone de la fiche : 05 53 91 39 07 | page proposée : https://www.profilinterim.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
15. Profil Intérim : Profil Intérim Montpon à Montpon-Ménestérol (24700) | adresse de la fiche : 2 Place Gambetta | téléphone de la fiche : 05 53 80 33 33 | page proposée : https://www.profilinterim.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]
16. Profil Intérim : Profil Intérim Thiviers à Thiviers (24800) | adresse de la fiche : 2 Place du Chapeau Rouge | téléphone de la fiche : 05 53 55 05 00 | page proposée : https://www.profilinterim.fr [ne répond pas (ERR_TLS_CERT_ALTNAME_INVALID)]

---

# Lot I7 : agences d'intérim, autres réseaux (3/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Profrais : Profrais Bergerac à Bergerac (24100) | adresse de la fiche : 5 Rue Junien Rabier | téléphone de la fiche : 05 35 54 13 10 | page proposée : https://www.profrais.fr/ [répond]
2. Proman : Proman Bergerac à Bergerac (24100) | adresse de la fiche : 21 Place Gambetta | téléphone de la fiche : 05 53 74 01 15 | page proposée : https://www.proman.group/pays/proman-en-france/ [répond]
3. Proman : Proman Périgueux à Périgueux (24000) | adresse de la fiche : 175 Route de Lyon | téléphone de la fiche : 05 53 09 32 90 | page proposée : https://www.proman.group/pays/proman-en-france/ [répond]
4. Proman : Proman Limoges à Limoges (87000) | adresse de la fiche : 5-7 rue des Petites Maisons, avenue Gabriel Péri | téléphone de la fiche : 05 55 10 85 92 | page proposée : https://www.proman-emploi.fr/agence/limoges/ [erreur 404]
5. R.A.S Intérim : R.A.S Intérim Périgueux à Boulazac Isle Manoire (24750) | adresse de la fiche : 13 ZA du Ponteix | téléphone de la fiche : 05 19 08 18 60 | page proposée : https://www.ras-interim.fr/le-reseau/ [répond]
6. R.A.S Intérim : R.A.S Intérim Limoges à Limoges (87280) | adresse de la fiche : 31 rue Amédée Gordini | téléphone de la fiche : 05 55 50 11 30 | page proposée : https://www.ras-interim.fr/agences/limoges/ [erreur 404]
7. Randstad : Randstad Périgueux à Coulounieix-Chamiers (24660) | adresse de la fiche : 212 Boulevard des Saveurs | téléphone de la fiche : 05 53 06 64 90 | page proposée : https://www.randstad.fr/nos-agences/randstad-perigueux_2429/ [répond]
8. Randstad : Randstad Bergerac à Bergerac (24100) | adresse de la fiche : 53 Rue Neuve d'Argenson | téléphone de la fiche : 05 53 74 54 20 | page proposée : https://www.randstad.fr/nos-agences/randstad-bergerac_2439/ [répond]
9. Randstad : Randstad Limoges à Limoges (87000) | adresse de la fiche : 21 Rue Columbia | téléphone de la fiche : 05 55 12 81 20 | page proposée : https://www.randstad.fr/nos-agences/randstad-limoges_2402/ [répond]
10. Randstad : Randstad Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 2 ter Avenue Anatole France | téléphone de la fiche : 05 55 02 61 80 | page proposée : https://www.randstad.fr/nos-agences/randstad-saint-junien_2408/ [répond]
11. Réseau Alliance : Réseau Alliance Intérim Limoges à Limoges (87000) | adresse de la fiche : 8 bis rue François Chénieux | téléphone de la fiche : 05 55 77 60 07 | page proposée : https://www.reseaualliance.fr/agence/limoges [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
12. Réseau Alliance : Réseau Alliance Intérim Saint-Junien à Saint-Junien (87200) | adresse de la fiche : 67 avenue Henri Barbusse | téléphone de la fiche : 05 55 01 45 14 | page proposée : https://www.reseaualliance.fr/agence/saint-junien [ne répond pas (UND_ERR_CONNECT_TIMEOUT)]
13. Saintext Intérim : Saintext Intérim Limoges à Limoges (87000) | adresse de la fiche : 67 boulevard Gambetta | téléphone de la fiche : 08 06 11 04 40 | page proposée : https://www.saintext.fr/ [répond]
14. Samsic Emploi : Samsic Emploi Bergerac à Bergerac (24100) | adresse de la fiche : 38 Rue Neuve d'Argenson | téléphone de la fiche : 05 53 22 27 40 | page proposée : https://www.samsic-emploi.fr/nos-agences/nouvelle-aquitaine/dordogne/bergerac/samsic-emploi-bergerac [répond]
15. Samsic Emploi : Samsic Emploi Périgueux à Périgueux (24000) | adresse de la fiche : 14 Rue du Président Wilson | téléphone de la fiche : 05 53 03 26 26 | page proposée : https://www.samsic-emploi.fr/nos-agences/nouvelle-aquitaine/dordogne/perigueux/samsic-emploi-perigueux [répond]
16. Samsic Emploi : Samsic Emploi Limoges à Limoges (87000) | adresse de la fiche : 9 cours Vergniaud | téléphone de la fiche : 05 55 78 15 82 | page proposée : https://www.samsic-emploi.fr/nos-agences/nouvelle-aquitaine/haute-vienne/limoges [répond]

---

# Lot I8 : agences d'intérim, autres réseaux (4/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des AGENCES D'INTÉRIM proposées pour la Dordogne et la Haute-Vienne. Pour chaque agence, (1) dis si elle existe et est ouverte à la commune indiquée, d'après la page officielle de l'agence ou celle de son réseau (réponse : « ouverte », « fermée ou introuvable », « déplacée vers [commune] »), (2) donne l'adresse de la page officielle de cette agence, (3) recopie EXACTEMENT l'adresse postale et le numéro de téléphone affichés sur cette page, avec la phrase qui les entoure (« pas de numéro vu » ou « pas d'adresse vue » sinon : ne les cherche jamais ailleurs, ne les devine jamais).

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Pour un réseau, la présence se lit sur la page « trouver une agence » du réseau : liste, pour chaque département, les communes où le réseau a une agence.

Format de réponse : un tableau Markdown : Agence (réseau, commune) | État (ouverte / fermée ou introuvable / déplacée) | Page officielle de l'agence | Adresse affichée (copiée exactement) | Téléphone affiché (copié exactement) | Phrase lue autour | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Start People : Start People Périgueux à Boulazac Isle Manoire (24750) | adresse de la fiche : 28 Impasse Denis Diderot | téléphone de la fiche : 05 53 03 04 70 | page proposée : https://www.startpeople.fr/nos-agences/start-people-perigueux [répond]
2. Start People : Start People Limoges à Limoges (87100) | adresse de la fiche : 1 Allée Duke Ellington | téléphone de la fiche : 05 55 77 38 50 | page proposée : https://www.startpeople.fr/agence/603/limoges [répond]
3. Supplay : Supplay Limoges à Limoges (87000) | adresse de la fiche : 278 Rue François Perrin | téléphone de la fiche : 05 55 03 02 01 | page proposée : https://interim.supplay.fr/supplay-agences-interim [bloque les robots]
4. Synergie : Agence Synergie Bergerac à Bergerac (24100) | adresse de la fiche : 24 Place Gambetta | téléphone de la fiche : 05 53 22 15 00 | page proposée : https://www.synergie.fr/trouver-une-agence/agence-synergie-bergerac [répond]
5. Synergie : Agence Synergie Périgueux-Boulazac à Boulazac Isle Manoire (24750) | adresse de la fiche : Place Nelson Mandela | téléphone de la fiche : 05 53 02 69 50 | page proposée : https://www.synergie.fr/trouver-une-agence/agence-synergie-perigueux-boulazac [répond]
6. Synergie : Synergie Limoges à Limoges (87000) | adresse de la fiche : 3 avenue du Général de Gaulle | téléphone de la fiche : 05 55 33 20 30 | page proposée : https://www.synergie.fr/trouver-une-agence/synergie-limoges [répond]
7. Temporis : Temporis Terrasson à Terrasson-Lavilledieu (24120) | adresse de la fiche : 38 Avenue Charles de Gaulle | téléphone de la fiche : 05 53 50 34 69 | page proposée : https://www.temporis-franchise.fr/agences/temporis-terrasson-lavilledieu [répond]
8. Temporis : Temporis Sarlat à Sarlat-la-Canéda (24200) | adresse de la fiche : 7 Boulevard Nessmann | téléphone de la fiche : 05 33 09 28 25 | page proposée : https://www.temporis-franchise.fr/agences/temporis-sarlat-la-caneda [erreur 404]
9. Temporis : Temporis Limoges à Limoges (87000) | adresse de la fiche : 21 boulevard Victor Hugo | téléphone de la fiche : 05 55 35 13 81 | page proposée : https://www.temporis-franchise.fr/agences/temporis-interim-limoges [erreur 404]
10. Triangle Intérim : Triangle Intérim Périgueux à Périgueux (24000) | adresse de la fiche : 167 bis Route de Lyon | téléphone de la fiche : 05 64 74 00 05 | page proposée : https://www.triangle.fr/nos-agences/ [répond]
11. Triangle Intérim : Triangle Intérim Limoges à Limoges (87000) | adresse de la fiche : 60 ter avenue Garibaldi | téléphone de la fiche : 05 44 00 04 00 | page proposée : https://www.triangle.fr/nos-agences/ [répond]
12. Vitalis Médical : Vitalis Médical Périgueux à Marsac-sur-l'Isle (24430) | adresse de la fiche : 7 bis Boulevard de l'Industrie | téléphone de la fiche : 05 64 31 14 44 | page proposée : https://www.vitalis-medical.com/agence-interim-recrutement/emploi-medical-perigueux.html [répond]
13. WellJob : WellJob Périgueux à Périgueux (24000) | adresse de la fiche : 2 Cours Saint-Georges | téléphone de la fiche : 05 53 13 17 13 | page proposée : https://www.welljob.fr/agences [répond]
14. Work 2000 : Work 2000 Boulazac à Boulazac Isle Manoire (24750) | adresse de la fiche : 547 Avenue Louis Lescure | téléphone de la fiche : 05 53 08 57 02 | page proposée : https://www.work2000.fr/nos-agences/ [répond]

---

# Lot I9 : pages de recrutement, Dordogne (1/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Ministère de l'Intérieur (offres en Dordogne) (Dordogne, secteur administration, employeur) | page proposée : https://ministereinterieur-career.talent-soft.com/offre-de-emploi/liste-toutes-offres.aspx?changefacet=1&facet_JobDepartment=238&facet_JobRegion=-197 [répond]
2. Centre de gestion de la Dordogne, bourse de l'emploi (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.cdg24.fr/emploi_les_emplois_offres.php [répond]
3. Ville de Périgueux (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.perigueux.fr/ma-mairie-pratique/offres-demploi/offres-demploi.html [répond]
4. Ville de Bergerac (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.bergerac.fr/document-category/offres-demploi/ [répond]
5. Ville de Sarlat-la-Canéda (Dordogne, secteur administration, portail-officiel) | page proposée : https://sarlat.fr/ma-mairie/offres-demploi/ [répond]
6. Communauté d'agglomération bergeracoise (CAB) (Dordogne, secteur administration, portail-officiel) | page proposée : https://la-cab.fr/emplois-cab/ [nom absent]
7. Communauté de communes Sarlat-Périgord Noir (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.cc-sarlatperigordnoir.fr/offres-demploi/ [répond]
8. Office national des forêts (national, secteur administration, portail-officiel) | page proposée : https://choisirleservicepublic.gouv.fr/employeurs/onf/ [répond]
9. Voies navigables de France (national, secteur administration, portail-officiel) | page proposée : https://recrutement.vnf.fr/nos-offres/ [répond]
10. Direction générale des Finances publiques (national, secteur administration, portail-officiel) | page proposée : https://choisirleservicepublic.gouv.fr/employeurs/dgfip/ [répond]
11. MSA Dordogne Lot-et-Garonne (Dordogne, secteur administration, portail-officiel) | page proposée : https://dlg.msa.fr/lfp/les-offres-de-postes-a-la-msa-dordogne-lot-et-garonne [répond]
12. Enedis (national, secteur administration, portail-officiel) | page proposée : https://www.enedis.fr/emploi [répond]
13. RTE (national, secteur administration, portail-officiel) | page proposée : https://www.rte-france.com/carrieres/recrutement [répond]
14. La Poste Groupe (national, secteur administration, portail-officiel) | page proposée : https://recrutement.lapostegroupe.com/offres/ [répond]
15. Chambre de métiers et de l'artisanat (réseau) (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://www.artisanat.fr/nous-connaitre/carrieres-emplois [répond]
16. DREAL Nouvelle-Aquitaine (ministères de la Transition écologique) (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://recrutement.ecologie.gouv.fr/offres-demploi [répond]

---

# Lot I10 : pages de recrutement, Dordogne (2/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Préfecture, DDT et DDETSPP de la Dordogne (Choisir le service public) (Dordogne, secteur administration, portail-officiel) | page proposée : https://choisirleservicepublic.gouv.fr [répond]
2. Ministère de la Justice, La Justice recrute (national, secteur administration, portail-officiel) | page proposée : https://lajusticerecrute.fr [répond]
3. Armée de Terre (S'engager) (national, secteur administration, portail-officiel) | page proposée : https://www.sengager.fr [répond]
4. Marine nationale (national, secteur administration, portail-officiel) | page proposée : https://www.lamarinerecrute.fr [répond]
5. Armée de l'Air et de l'Espace (national, secteur administration, portail-officiel) | page proposée : https://devenir-aviateur.fr [répond]
6. Armée de Terre, tous les postes (CIRFA de Périgueux pour rencontrer un conseiller) (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.sengager.fr/tous-nos-postes [répond]
7. Banque de France (national, secteur administration, portail-officiel) | page proposée : https://www.recrutement.banque-france.fr/fr [répond]
8. CNFPT (national, secteur administration, portail-officiel) | page proposée : https://recrutement-cnfpt.fr/ [répond]
9. ARS Nouvelle-Aquitaine (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://ars-nouvelle-aquitaine-recrute.talent-soft.com/offre-de-emploi/liste-offres.aspx [répond]
10. Office français de la biodiversité (national, secteur administration, portail-officiel) | page proposée : https://ofb.gestmax.fr/employee/search [répond]
11. Région Nouvelle-Aquitaine (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://www.nouvelle-aquitaine.fr/aides-et-ressources/les-offres-demploi [répond]
12. Agence de services et de paiement (national, secteur administration, portail-officiel) | page proposée : https://agencedeservicesetdepaiement.recruitee.com/ [répond]
13. IGN (national, secteur administration, portail-officiel) | page proposée : https://www.ign.fr/nous-rejoindre/offres-emploi [répond]
14. INPI (national, secteur administration, portail-officiel) | page proposée : https://www.inpi.fr/decouvrir-inpi/notre-organisation/nous-rejoindre [répond]
15. UGAP (national, secteur administration, portail-officiel) | page proposée : https://ugap-recrute.talent-soft.com/ [répond]
16. Groupement Employeurs Métiers 24 (Dordogne, secteur artisanat, groupement) | page proposée : https://gem24.fr/les-offres-demplois [répond]

---

# Lot I11 : pages de recrutement, Dordogne (3/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Eurovia (groupe Vinci) (Dordogne, secteur btp, employeur) | page proposée : https://jobs.vinci.com [répond]
2. GEIQ 24 (Dordogne, secteur btp, groupement) | page proposée : https://geiq24.com/offres-demploi/ [répond]
3. E.Leclerc (national, secteur commerce-vente, employeur) | page proposée : https://www.recrutement.leclerc/ [répond]
4. Brico Dépôt (Creysse, Trélissac) (national, secteur commerce-vente, employeur) | page proposée : https://recrute.bricodepot.fr/jobs [répond]
5. Lidl France (national, secteur commerce-vente, employeur) | page proposée : https://emplois.lidl.fr/ [répond]
6. Sonepar France (Marsac-sur-l'Isle) (Dordogne, secteur commerce-vente, employeur) | page proposée : https://www.soneparfrance.fr/fr-fr/talents/nous-rejoindre [répond]
7. H&M (national, secteur commerce-vente, employeur) | page proposée : https://career.hm.com/ [répond]
8. Polyrey (Dordogne, secteur industrie, employeur) | page proposée : https://www.polyrey.com/carriere [répond]
9. Onet Propreté et Services (national, secteur proprete, employeur) | page proposée : https://www.groupeonet.com/nous-rejoindre [répond]
10. GSF (Dordogne, secteur proprete, employeur) | page proposée : https://gsf-recrute.talent-soft.com/accueil.aspx [répond]
11. Centre hospitalier de Périgueux (Dordogne, secteur sante, employeur) | page proposée : https://www.ch-perigueux.fr/offres-d-emploi-79.html [bloque les robots]
12. Centre hospitalier intercommunal Ribérac Dronne Double (Dordogne, secteur sante, employeur) | page proposée : https://www.chicrdd.fr/on-recrute/ [répond]
13. Centre hospitalier de Domme (Dordogne, secteur sante, employeur) | page proposée : https://ch-domme.fr/offres-demplois/ [répond]
14. Clinique Pasteur Bergerac (ELSAN) (Dordogne, secteur sante, employeur) | page proposée : https://talents.groupe-elsan.com/ [répond]
15. Hôpital privé Francheville (Vivalto Santé) (Dordogne, secteur sante, employeur) | page proposée : https://www.vivalto-sante.com/recrutement [répond]
16. Centre hospitalier Samuel Pozzi de Bergerac (Dordogne, secteur sante, portail-officiel) | page proposée : https://www.ch-bergerac.fr/offres_demplois/ [répond]

---

# Lot I12 : pages de recrutement, Dordogne (4/4)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Centre hospitalier de Saint-Astier (Dordogne, secteur sante, portail-officiel) | page proposée : https://etablissements.fhf.fr/annuaire/establishment/structure523-establishment4335 [répond]
2. Centre hospitalier d'Excideuil (Dordogne, secteur sante, portail-officiel) | page proposée : https://etablissements.fhf.fr/annuaire/establishment/structure527-establishment4339 [répond]
3. Centre hospitalier de Lanmary (Dordogne, secteur sante, portail-officiel) | page proposée : https://chlanmary.jimdoweb.com/rejoignez-nous/ [répond]
4. Shiva (agences de la Dordogne) (Dordogne, secteur social-personne, employeur) | page proposée : https://www.shiva.fr/shiva-recrutement [répond]
5. Fondation John Bost (Dordogne, secteur social-personne, employeur) | page proposée : https://www.johnbost.org/emploi/ [répond]
6. Fondation Partage et Vie (Dordogne, secteur social-personne, employeur) | page proposée : https://recrutement.fondationpartageetvie.org/fr/annonces [répond]
7. Vitalliance (Dordogne, secteur social-personne, employeur) | page proposée : https://emploi.vitalliance.fr/offres [répond]
8. ADHAP (Dordogne, secteur social-personne, employeur) | page proposée : https://www.adhap.fr/carriere/offres-emplois/ [répond]
9. ADMR de Dordogne (Dordogne, secteur social-personne, employeur) | page proposée : https://www.fede24.admr.org/offre-emploi [répond]
10. Groupement d'employeurs DMS (Dordogne, secteur social-personne, groupement) | page proposée : https://www.ge-dms.fr/offres-demploi/ [nom absent]
11. Groupe Jardel (Dordogne, secteur transport-logistique, employeur) | page proposée : https://www.jardel.eu/rejoignez-nous/nos-offres [répond]
12. Groupe Doumen (Dordogne, secteur transport-logistique, employeur) | page proposée : https://www.doumen.fr/recrutement [répond]
13. Defitrans (Dordogne, secteur transport-logistique, employeur) | page proposée : https://www.transports-defitrans.fr/nous-rejoindre/ [répond]
14. Groupe SNCF (national, secteur transport-logistique, portail-officiel) | page proposée : https://emploi.sncf.com/nos-offres [répond]

---

# Lot I13 : pages de recrutement, Employeurs publics

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Conseil départemental de la Haute-Vienne (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://recrutement.haute-vienne.fr/ [répond]
2. Centre de gestion de la Haute-Vienne (offres des collectivités) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.cdg87.fr/emploi_les_emplois_offres.php [répond]
3. Ville de Limoges (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://mairie-limoges.gestmax.fr/ [nom absent]
4. Limoges Métropole (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.limoges-metropole.fr/limoges-metropole/limoges-metropole-recrute/nos-offres-demploi [répond]
5. Préfecture de la Haute-Vienne (portail du ministère de l'Intérieur) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://ministereinterieur-career.talent-soft.com/offre-de-emploi/liste-toutes-offres.aspx?changefacet=1&facet_JobDepartment=297&facet_JobRegion=-197 [répond]
6. Finances publiques de la Haute-Vienne (portail Passerelles) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.passerelles.economie.gouv.fr/offre-de-emploi/liste-offres.aspx?changefacet=1&facet_JobCountry=-79&facet_JobRegion=197 [répond]
7. Région Nouvelle-Aquitaine (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://www.nouvelle-aquitaine.fr/aides-et-ressources/les-offres-demploi [répond]
8. Centre de gestion de la Dordogne (offres des collectivités) (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.cdg24.fr/emploi_les_emplois_offres.php [répond]
9. Ville de Périgueux (Dordogne, secteur administration, portail-officiel) | page proposée : https://perigueux.fr/ma-mairie-pratique/offres-demploi/offres-demploi.html [répond]
10. Ville de Bergerac (Dordogne, secteur administration, portail-officiel) | page proposée : https://www.bergerac.fr/document-category/offres-demploi/ [répond]
11. Ville de Sarlat-la-Canéda (Dordogne, secteur administration, portail-officiel) | page proposée : https://sarlat.fr/ma-mairie/offres-demploi/ [répond]
12. Communauté d'agglomération Bergeracoise (Dordogne, secteur administration, portail-officiel) | page proposée : https://la-cab.fr/emplois-cab/ [nom absent]
13. Académie de Limoges, espace recrutement (Haute-Vienne, secteur education-formation, portail-officiel) | page proposée : https://www.ac-limoges.fr/espace-recrutement-123263 [bloque les robots]
14. Université de Limoges (Haute-Vienne, secteur education-formation, portail-officiel) | page proposée : https://www.unilim.fr/presentation/recrutement/ [répond]
15. Centre hospitalier de Périgueux (Dordogne, secteur sante, portail-officiel) | page proposée : https://www.ch-perigueux.fr/offres-d-emploi-79.html [bloque les robots]
16. Centre hospitalier de Bergerac (Dordogne, secteur sante, portail-officiel) | page proposée : https://www.ch-bergerac.fr/nous-rejoindre/ [répond]
17. SDIS 24 (sapeurs-pompiers) (Dordogne, secteur securite, portail-officiel) | page proposée : https://www.sdis24.fr/formulaire-de-recrutement-sapeur-pompier-volontaire/ [répond]

---

# Lot I14 : pages de recrutement, Haute-Vienne (1/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Département de la Haute-Vienne (Haute-Vienne, secteur administration, employeur) | page proposée : https://recrutement.haute-vienne.fr/candidat [répond]
2. Ville de Saint-Junien (Haute-Vienne, secteur administration, employeur) | page proposée : https://saint-junien.gestmax.fr/search [bloque les robots]
3. Ville de Panazol (Haute-Vienne, secteur administration, employeur) | page proposée : https://www.panazol.fr/ma-ville/la-mairie-recrute/ [ne répond pas (ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR)]
4. Ville de Bellac (Haute-Vienne, secteur administration, employeur) | page proposée : https://www.bellac.fr/offres-demplois/ [répond]
5. Centre de gestion de la Haute-Vienne, bourse de l'emploi territorial (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.cdg87.fr/emploi_les_emplois_offres.php [répond]
6. Ville de Limoges (autre adresse proposée) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://mairie-limoges.gestmax.fr/employee/search [répond]
7. Ville de Limoges (page d'entrée) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.limoges.fr/pratique/offres-demplois-municipaux [répond]
8. Limoges Métropole (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.limoges-metropole.fr/limoges-metropole/limoges-metropole-recrute/nos-offres-demploi [répond]
9. Services de l'État en Haute-Vienne (préfecture) (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://www.haute-vienne.gouv.fr/Publications/Concours-recrutement-stages/Recrutement-et-concours-dans-la-fonction-publique [répond]
10. La Sécu recrute (CPAM, CAF, Carsat, Urssaf) (national, secteur administration, portail-officiel) | page proposée : https://www.lasecurecrute.fr/accueil [répond]
11. MSA du Limousin (Haute-Vienne, secteur administration, portail-officiel) | page proposée : https://limousin.msa.fr/lfp/les-offres-d-emploi-a-la-msa-du-limousin [répond]
12. Carsat Centre Ouest (Nouvelle-Aquitaine, secteur administration, portail-officiel) | page proposée : https://recrutement.carsat-centreouest.fr/ [répond]
13. Cooperl (Madrange, Limoges) (Haute-Vienne, secteur agriculture-nature, employeur) | page proposée : https://recrutement.cooperl.com/fr [répond]
14. Fédération départementale des CUMA de la Haute-Vienne (Haute-Vienne, secteur agriculture-nature, federation) | page proposée : https://haute-vienne.cuma.fr/nos-offres-demploi/ [répond]
15. Groupama Gan recrute (national, secteur banque-assurance-immobilier, employeur) | page proposée : https://www.groupama-gan-recrute.com/ [répond]
16. Hunyvers (Haute-Vienne, secteur commerce-vente, employeur) | page proposée : https://www.hunyvers.com/offres-emplois-hunyvers [répond]
17. Université de Limoges (Haute-Vienne, secteur education-formation, portail-officiel) | page proposée : https://www.unilim.fr/category/recrutement/ [répond]

---

# Lot I15 : pages de recrutement, Haute-Vienne (2/2)

Tu fais une recherche web pour une application d'aide à la recherche d'emploi et d'accès aux démarches (Dordogne 24 et Haute-Vienne 87). Voici des PAGES DE RECRUTEMENT proposées pour des employeurs de Dordogne et de Haute-Vienne. Pour chaque ligne, (1) ouvre la page proposée et dis si c'est bien la page de recrutement de l'employeur lui-même ou d'un portail officiel de son organisme (réponse : « oui », « non : [autre adresse officielle] », « page introuvable »), (2) dis si elle affiche des offres en ce moment (« offres visibles », « aucune offre visible », « inscription ou compte demandé avant d'afficher »), (3) donne la date de l'offre la plus récente si elle est visible, (4) établis la présence de l'employeur en Dordogne 24 et en Haute-Vienne 87. Ne recopie jamais le contenu des offres.

Méthode : utilise la commande curl -L avec un en-tête User-Agent de navigateur (l'outil de lecture de pages ne résout pas les domaines). Ne contourne jamais un blocage, ne désactive jamais la vérification des certificats.

Règles strictes :
- Lis la page : le nom doit y figurer. Les adresses de ma liste sont des INDICATIONS, souvent fausses : vérifie-les.
- Méfie-toi des homonymes et des filiales régionales (autre région, autre département). Cherche une phrase de la page qui nomme la commune, la Dordogne, la Haute-Vienne ou la région Nouvelle-Aquitaine.
- Refuse les annuaires, les sites parqués ou « à vendre », les sites de ressemblance, les agrégateurs.
- Si tu n'es pas sûr, écris « non fiable » : ne devine jamais. Si la connexion échoue, écris « connexion impossible » (pas « domaine inexistant »).

PRÉSENCE SUR LE TERRITOIRE (très important, obligatoire pour CHAQUE ligne, y compris quand le site est bloqué ou que la fiche semble sûre) : réponds séparément « Dordogne 24 : oui / non / non lisible » et « Haute-Vienne 87 : oui / non / non lisible », avec la phrase de la page officielle qui nomme l'agence, le point d'accueil, le magasin, l'usine ou la commune (ou qui montre qu'il n'y en a pas). Si, après lecture de la page des implantations, il n'y a ni agence ni point dans ces deux départements, écris exactement « pas de présence sur le territoire » : c'est une réponse attendue et utile, pas un échec. N'écris « non lisible » que si tu n'as pas pu ouvrir la bonne page, et dis alors laquelle. Conclus chaque ligne par un verdict parmi : présent en 24 et en 87 / présent en 24 seulement / présent en 87 seulement / pas de présence sur le territoire / non lisible.

Format de réponse : un tableau Markdown : Employeur | Page de recrutement officielle (oui / non + autre adresse / introuvable) | Offres (visibles / aucune / compte demandé) | Date de l'offre la plus récente | Dordogne 24 (oui / non / non lisible + phrase) | Haute-Vienne 87 (oui / non / non lisible + phrase) | Verdict de présence | Confiance (sûr / à vérifier / non fiable). Termine par la ligne « Pages ouvertes au total : N ».

À la toute fin, avant « À OUVRIR PAR MOI », une section intitulée « CE QUI ME BLOQUE ET CE QUE TU PEUX M'AUTORISER » : liste précisément ce qui t'a empêché de vérifier (sites qui refusent les robots, certificats incomplets, connexions coupées, outil absent), et pour chaque cas dis quelle autorisation, quel accord ou quel réglage je peux te donner (accès réseau à certains domaines, outil de navigateur, autre méthode de lecture, session avec navigateur) pour que tu passes, sans rien contourner toi-même. Écris « rien à débloquer » si tout s'est passé normalement.

Dernière section obligatoire, intitulée « À OUVRIR PAR MOI » : pour chaque ligne dont le site a refusé les robots (403, Access Denied, Just a moment ou équivalent), un lien cliquable au format Markdown vers le site et, s'il y en a une, vers la page concernée, par exemple : [Site](https://...) · [Page](https://...).

Liste du lot :
1. Académie de Limoges, espace recrutement (Nouvelle-Aquitaine, secteur education-formation, portail-officiel) | page proposée : https://www.ac-limoges.fr/espace-recrutement-123263 [bloque les robots]
2. Legrand (national, secteur industrie, employeur) | page proposée : https://www.legrand.com/fr/carrieres/rejoignez-nous/nos-offres-demploi [répond]
3. Catalent France Limoges (Haute-Vienne, secteur industrie, employeur) | page proposée : https://careers.catalent.com/ [répond]
4. CGI (Limoges) (national, secteur numerique, employeur) | page proposée : https://www.cgi.com/france/fr-fr/recrute/limoges [répond]
5. Armatis (national, secteur numerique, employeur) | page proposée : https://emploi.armatis.com/ [répond]
6. Sogelink (national, secteur numerique, employeur) | page proposée : https://www.sogelink.com/carriere/ [répond]
7. CHU de Limoges (Haute-Vienne, secteur sante, employeur) | page proposée : https://chu-limoges.nous-recrutons.fr/nos-offres-demploi-1/ [répond]
8. Polyclinique de Limoges (ELSAN) (Haute-Vienne, secteur sante, employeur) | page proposée : https://talents.groupe-elsan.com/fr/annonces?localisation=25914 [répond]
9. emeis (ex-Orpea) (national, secteur sante, employeur) | page proposée : https://www.emeis.com/fr/carrieres/rejoindre-emeis [répond]
10. Centre hospitalier Esquirol de Limoges (Haute-Vienne, secteur sante, portail-officiel) | page proposée : https://www.ch-esquirol-limoges.fr/professionnels-etudiants/nous-rejoindre-offre-emploi/ [répond]
11. Hôpital intercommunal du Haut-Limousin (Bellac) (Haute-Vienne, secteur sante, portail-officiel) | page proposée : https://hopital-hautlimousin.nous-recrutons.fr/ [bloque les robots]
12. Centre hospitalier Jacques Boutard de Saint-Yrieix-la-Perche (Haute-Vienne, secteur sante, portail-officiel) | page proposée : https://ch-saintyrieix.nous-recrutons.fr/ [bloque les robots]
13. Centre hospitalier de Saint-Junien (Haute-Vienne, secteur sante, portail-officiel) | page proposée : https://ch-saintjunien.nous-recrutons.fr/ [bloque les robots]
14. Fédération hospitalière de France, emploi hospitalier (national, secteur sante, portail-officiel) | page proposée : https://emploi.fhf.fr/ [répond]
15. Service départemental d'incendie et de secours de la Haute-Vienne (Haute-Vienne, secteur securite, portail-officiel) | page proposée : https://sdis-87.fr/recrutement/ [nom absent]
16. VYV3 Cœur d'Aquitaine (Haute-Vienne, secteur social-personne, employeur) | page proposée : https://recrutement.vyv3.fr/ [répond]
