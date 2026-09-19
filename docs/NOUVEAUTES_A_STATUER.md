# Nouveautés à statuer - registre du circuit veille

> Créé le 2026-09-06. Rien ne se perd : chaque ligne porte **la décision de Denis**.
> Trois tableaux : **dispositifs / mesures / lois** repérés (Balayage, contrôle mensuel,
> Denis en direct), **mots du Lexique**, **structures associatives**. Fait partie du
> module « Comprendre le cadre » (voir `docs/VEILLE_PROMPTS.md`, prompts `[TRIAGE]`
> § 5bis.2, `[CONTROLE-SOURCE]` § 5septies, `[LEXIQUE]`/`[TRIAGE-MOTS]` § 5quater,
> `[ASSOCIATIONS]` § 5octies).

## Comment ça marche

1. Après un **Balayage trimestriel**, coller le digest + la liste des fiches dans le
   prompt `[TRIAGE]` (`VEILLE_PROMPTS.md` § 5bis.2). Il ressort, pour chaque
   changement : la ou les fiches concernées (ou « sujet nouveau »), et une action
   suggérée.
2. Recopier chaque changement retenu comme **une ligne du tableau ci-dessous**, décision
   = `À STATUER`.
3. Denis tranche, ligne par ligne, et met à jour la colonne **Décision** :
   - `MISE À JOUR` -> passer par « Traiter » dans `veille.html` (prompt 1 ciblé),
     la nouvelle version rejoint la même fiche avec une ligne `revisions:` datée ;
   - `NOUVELLE FICHE` -> prompt 1 COLLECTE sur le rayon, prompt 2 RÉDACTION ;
   - `ÉCARTÉ (actu seulement)` -> reste dans le digest Balayage, pas de fiche
     permanente (les fiches n'affichent jamais un montant ou une date figés) ;
   - `FAIT` -> mise à jour ou fiche réalisée et commitée (indiquer le commit).
4. Une ligne `ÉCARTÉ` ou `FAIT` peut être archivée dans la section du bas au bout d'un
   ou deux trimestres.

Un **lien source qui ne répond plus** ne passe pas par ici : il passe par
`[CONTROLE-SOURCE]` (§ 5septies), qui dit si l'info a été relogée (restructuration) ou
abandonnée. Si abandonnée -> ça devient une ligne ici avec décision `MISE À JOUR` ou
`ÉCARTÉ`.

**Les mots du Lexique** passent aussi par ici : après un `[LEXIQUE]` + `[TRIAGE-MOTS]`
(`VEILLE_PROMPTS.md` § 5quater), chaque terme repéré fait une ligne dans le tableau
« Mots du Lexique » ci-dessous. Colonne « Fiche(s) » = l'`id` d'une fiche `data/lexique.js`
existante (décision `MISE À JOUR`) ou « nouveau mot » (décision `NOUVEAU MOT`). Dépôt :
`data/lexique.js` + `node scripts/checkLexique.js` + commit.

**Les structures associatives** repérées par `[ASSOCIATIONS]` (`VEILLE_PROMPTS.md` § 5octies)
font une ligne dans le tableau « Structures associatives à vérifier » ci-dessous. Elles sont
déjà collées (non datées) dans les `structures:` des collectes et dans `liens-verifies.txt` ;
la décision ici, c'est **le résultat de la vérification au navigateur** : `DATÉE` (site ouvert,
c'est bien l'asso -> date écrite dans `liens-verifies.txt`), `URL CORRIGÉE`, ou `ÉCARTÉE`
(site mort, doute sur l'identité, hors périmètre).

---

## À statuer

| Repéré le | D'où | Nouveauté (1 ligne) | Fiche(s) concernée(s) | Décision | Note |
|---|---|---|---|---|---|
| 2026-09-06 | contrôle 3 fiches | Mesure « retraites femmes / parentalité » : calcul de la pension de base sur 24 meilleures années dès 1 enfant, 23 dès 2 ; jusqu'à 2 trimestres enfants comptés pour la carrière longue ; en vigueur au 1er septembre 2026 (art. 104 LFSS 2026) | aucune (sujet nouveau, rayon `seniors`) | ÉCARTÉ (actu seulement) | Va dans le **prochain** digest Balayage (juillet-sept 2026), pas dans une fiche. À réévaluer si le sujet « calcul de la retraite » devient une demande fréquente. |
| 2026-09-06 | contrôle 3 fiches | Évolutions du parcours d'intégration républicaine au 1er janvier 2026 (formation linguistique : heures, niveau visé) | `francais-cours-de-l-ofii-cir` | **FAIT** (`83edbae`, texte validé par Denis le 2026-09-08) | Vérifié sur service-public F17048 (page vérifiée le 26 juin 2026) + arrêté du 22 juillet 2025. Trois changements portés dans la fiche : niveau visé passé de A1 à **A2** ; durée « jusqu'à 600 heures » (l'ancienne fourchette « 100 à 600 h » n'est plus le cadrage officiel) ; **fait nouveau** : depuis le 1er janvier 2026 le niveau de français conditionne la délivrance d'un 1er titre pluriannuel (A2) ou d'une 1re carte de résident (B1). Formation complémentaire ~100 h vers le B1 : formulation assouplie (plus détaillée sur service-public). `revisions:` datée. |
| 2026-09-14 | [TRIAGE] digest avril-juin 2026 | Nouvelle tarification des titres de séjour au 1er mai 2026 (LFI 2026 art. 128) : timbre naturalisation 55 € -> 255 €, droit de visa de régularisation 200 € -> 300 €, première carte de séjour 225 € -> 350 € au total | `etranger-naturalisation-grandes-etapes`, `etranger-regularisation-par-le-travail` | **FAIT** (`c01d625`) | Une ligne `revisions:` datée ajoutée sur chaque fiche, sans montant dans le corps (politique du module). Source ajoutée au registre (`prefecture-ardennes-tarifs-titres-sejour`) et à `etranger.collecte.md`. Note au passage : la collecte du rayon (2026-09-04) avait déjà les tarifs à jour aux lignes 54 et 99 - seule la mise en fiche manquait. |
| 2026-09-14 | [TRIAGE] digest avril-juin 2026 | Nouvelle aide régionale Nouvelle-Aquitaine « développement des compétences et de l'emploi » ouverte aux demandeurs d'emploi (délibération du 2 avril 2026, application le 31 mai 2026) | aucune (sujet nouveau, pas de fiche dédiée aux aides régionales par nom) | À STATUER | Hésitation MISE À JOUR / NOUVELLE FICHE / DIGEST SEULEMENT : dispositif récent et propre à la région, mais durable (pas une campagne ponctuelle). Reste dans le digest en l'état ; à transformer en fiche seulement si la demande devient fréquente (même logique que la mesure retraites femmes/parentalité ci-dessus). |

---

## Mots du Lexique à statuer

| Repéré le | D'où | Terme | Fiche `data/lexique.js` | Décision | Note |
|---|---|---|---|---|---|
| 2026-09-06 | test `[LEXIQUE]` | Contrat de valorisation de l'expérience (CVE) | `contrat-valorisation-experience` | **FAIT** (`b2c83b5`) | NOUVEAU MOT. CDI senior, loi du 24 octobre 2025, expérimental jusqu'en 2030. Famille « Contrats et statuts d'emploi », `univers: contrats-statuts-emploi`. Renvoi depuis `alternance`. |
| 2026-09-06 | test `[LEXIQUE]` | Réseau pour l'emploi | `reseau-pour-emploi` | **FAIT** (`b2c83b5`) | **MISE À JOUR** (la fiche `reseau-pour-emploi` existait déjà - le test n'avait pas la liste des termes existants). Corps enrichi : loi pour le plein emploi, remplace « service public de l'emploi », ouverture aux SIAE / PLIE / ETT / GEIQ. + 2 variantes de recherche. |

---

## Structures associatives à vérifier

Portée : 24 = Dordogne, 87 = Haute-Vienne. Décision = résultat de la vérification navigateur
(`DATÉE` / `URL CORRIGÉE` / `ÉCARTÉE`).

**2026-09-08 : Denis a vérifié au navigateur toutes les structures en attente.** Les 37 lignes
`DATÉE 2026-09-08` ci-dessous sont désormais cliquables en pied de fiche (date écrite dans
`liens-verifies.txt`). Les prochaines structures repérées par `[ASSOCIATIONS]` repartent
« non datées » et repassent par ce tableau.

| Repéré le | Rayon | Association | Ville | URL | Décision | Note |
|---|---|---|---|---|---|---|
| 2026-09-06 | mobilite | AFAC 24 | Coulounieix-Chamiers / Bergerac (24) | https://afac24.com/ | **DATÉE 2026-09-08** | Garage solidaire, location de véhicules à tarif social, ACI. Site ouvert à la collecte (DORA). |
| 2026-09-06 | mobilite | Auto-Mobilité Solidaire Dordogne | Périgueux (24) | https://automobilitesolida.wixsite.com/website | **DATÉE 2026-09-08** | Auto-école sociale, permis B, formule « 1 € par jour ». Site Wix. |
| 2026-09-06 | mobilite | Plateforme MUST | Coulounieix-Chamiers (24) | https://www.plateforme-must.fr/ | **DATÉE 2026-09-08** | Plateforme mobilité du Grand Périgueux. |
| 2026-09-06 | mobilite | Mobilim 87 | Limoges (87) | https://mobilim87.fr/ | **DATÉE 2026-09-08** | Garage solidaire (association Varlin Pont-Neuf), école de vélo. |
| 2026-09-06 | accompagnement | Varlin Pont-Neuf | Limoges (87) | https://varlinpontneuf.fr/ | **DATÉE 2026-09-08** | Insertion : logement jeunes, mobilité, emploi, création d'activité. Depuis 1959. |
| 2026-09-06 | francais | Ligue de l'enseignement de la Dordogne | Périgueux / Bergerac (24) | https://laligue24.org/ | **DATÉE 2026-09-08** | Ateliers sociolinguistiques, alphabétisation, FLE, FLI. Clé `asso-ligue-de-l-enseignement-24`. |
| 2026-09-06 | francais | Association L.I.R.E. | Limoges (87) | https://www.associationlire.com/ | **DATÉE 2026-09-08** | Lutte contre l'illettrisme, savoirs de base. Créée en 2019. Clé `asso-lire-87`. |
| 2026-09-06 | budget | UDAF de la Haute-Vienne | Limoges (87) | https://www.udaf87.fr/ | **DATÉE 2026-09-08** | Point conseil budget + microcrédit personnel garanti 87. (UDAF 24 déjà datée.) |
| 2026-09-06 | etranger | France Terre d'Asile, CADA de Périgueux | Périgueux (24) | https://www.france-terre-asile.org/etablissement/cada-de-perigueux | **DATÉE 2026-09-08** | CADA, accompagnement administratif / juridique / social des demandeurs d'asile. Antenne locale d'une fédération nationale. |
| 2026-09-06 | logement | SOLIHA Dordogne-Périgord | Périgueux (24) | https://www.dordogne.soliha.fr/ | **DATÉE 2026-09-08** | Habitat à vocation sociale : rénovation, adaptation, habitat indigne. Réseau SOLIHA. |
| 2026-09-06 | juridique | CIDFF de la Dordogne | Périgueux (24) | https://dordogne.cidff.info/ | **DATÉE 2026-09-08** | Accès aux droits, violences, emploi, parentalité. Locaux dans ceux de la Ligue de l'enseignement 24. Clé `asso-cidff-24`. |
| 2026-09-06 | juridique | CIDFF Limousin | Limoges (87) | https://limousin.cidff.info/ | **DATÉE 2026-09-08** | Couvre Haute-Vienne, Corrèze, Creuse. Clé `asso-cidff-limousin`. |
| 2026-09-06 | handicap | APF France handicap, délégation Dordogne | Trélissac (24) | https://dordogne.apf-francehandicap.org/ | **DATÉE 2026-09-08** | Défense des droits, emploi « Boostons les talents », vie sociale. Clé `asso-apf-24`. |
| 2026-09-06 | handicap | APF France handicap, délégation Haute-Vienne | Limoges (87) | https://haute-vienne.apf-francehandicap.org/ | **DATÉE 2026-09-08** | Handi-Droits, emploi, accompagnement numérique. Clé `asso-apf-87`. |
| 2026-09-06 | jeunes | Info Jeunes Nouvelle-Aquitaine (CRIJ) | Limoges + réseau (région) | https://crijna.fr/ | **DATÉE 2026-09-08** | Accueil gratuit, anonyme, sans rendez-vous : emploi, logement, formation, droits, mobilité. Clé `asso-crij-nouvelle-aquitaine`. |
| 2026-09-06 | justice | ARSL (Association régionale des solidarités) | Panazol / Limoges (87) | http://www.arsl.eu/ | **DATÉE 2026-09-08** | Ex « Association de réinsertion sociale du Limousin ». CHRS, hébergement, dispositifs sortants de détention (via SIAO 87). Clé `asso-arsl-87`. |
| 2026-09-06 | francais | Culture Alpha (Limoges) | Limoges (87) | *(fermée)* | ÉCARTÉE | Association de cours de français **fermée définitivement le 31 octobre 2025** (difficultés financières). Ne pas ajouter. |
| 2026-09-07 | creer | Coop'alpha | Périgueux / Coulounieix-Chamiers (24) | https://www.coopalpha.coop/ | **DATÉE 2026-09-08** | Coopérative d'activité et d'emploi : entrepreneur salarié, test d'activité. Clé `asso-coopalpha-24`. |
| 2026-09-07 | creer | IRISCOP | Montignac-Lascaux (24) | https://iriscop.com/ | **DATÉE 2026-09-08** | CAE en Périgord rural. Clé `asso-iriscop-24`. |
| 2026-09-07 | logement | SOLIHA Limousin | Limoges (87) | https://limousin.soliha.fr/ | **DATÉE 2026-09-08** | Rénovation, maintien à domicile, habitat indigne pour la Haute-Vienne (et Corrèze, Creuse). Complète SOLIHA Dordogne. Clé `asso-soliha-limousin`. |
| 2026-09-07 | logement | ADIL de la Haute-Vienne | Limoges (87) | https://www.anil.org/adil-87/ | **DATÉE 2026-09-08** | Conseil juridique / financier / fiscal gratuit sur le logement. Site redirige vers anil.org/adil-87. Clé `asso-adil-87`. |
| 2026-09-07 | garde / seniors | *(aucune)* | 24 et 87 | — | RIEN CE PASSAGE | Garde d'enfant : petites crèches associatives sans site propre (La Ronde des Oursons, À la Claire Fontaine…), couvert par l'officiel (CAF, RPE, monenfant). Retraite : CARSAT (Aquitaine pour la Dordogne, Centre-Ouest pour la Haute-Vienne), CD, France Services - tout officiel, le rayon `seniors` V1 est volontairement restreint. À retenter si le périmètre du rayon s'élargit. |
| — | seniors (note) | — | — | — | POUR MÉMOIRE | La CARSAT diffère selon le département : `carsat-aquitaine.fr` (Dordogne) vs `carsat-centreouest.fr` (Haute-Vienne). Le rayon `seniors` pointe aujourd'hui sur `lassuranceretraite.fr` (national) : envisager d'ajouter les deux CARSAT en structures régionales datées, si Denis le souhaite. |
| 2026-09-07 | budget | Les Restos du Cœur de la Haute-Vienne | Feytiat (87) | https://ad87.restosducoeur.org/ | **DATÉE 2026-09-08** | Aide alimentaire + aide au logement, à l'emploi, aux démarches, cours de français. Complète les Restos 24. Clé `asso-restos-du-coeur-87`. |
| 2026-09-07 | budget | Banque alimentaire de la Haute-Vienne | Limoges (87) | https://ba87.banquealimentaire.org/ | **DATÉE 2026-09-08** | Collecte et redistribue à ~60 associations et CCAS du département. Clé `asso-banque-alimentaire-87`. |
| 2026-09-07 | accès aux soins | *(aucune)* | 24 et 87 | — | RIEN CE PASSAGE | Pas d'association locale à site propre pour l'accès aux soins des personnes précaires : couvert par les PASS (hôpital), la complémentaire santé solidaire (CPAM), le Centre départemental de santé 24 et « Haute-Vienne Santé » 87 - tout officiel ou hospitalier. Médecins du Monde : délégation à Bordeaux, pas d'antenne permanente 24/87. |
| 2026-09-07 | accompagnement | Carte nationale des lieux d'inclusion numérique (ANCT / La MedNum) | national | https://cartographie.societenumerique.gouv.fr/ | **DATÉE 2026-09-07** | Outil officiel (pas de l'associatif), mais c'est LE moyen de trouver un point d'aide au numérique près de chez soi (recherche par adresse : associations, médiathèques, centres sociaux, France Services...). Clé `carto-inclusion-numerique`, ajoutée au rayon Accompagnement, cliquable. Le portail associatif `hauteviennenumerique.fr` (AAJPN) et Emmaüs Connect ont été écartés (portail 87 plus à jour depuis 2022 ; pas d'antenne Emmaüs Connect en 24/87). |
| 2026-09-07 | accompagnement | BASE (Bergerac Actions Solidarité Emploi) | Bergerac (24) | https://associationbase.fr/ | **DATÉE 2026-09-08** | ACI sur le Bergeracois + bus numérique pour les démarches en ligne. Clé `asso-base-24`. |
| 2026-09-07 | accompagnement | La Main Forte | Sarlat (24) | https://lamainforte.org/ | **DATÉE 2026-09-08** | ACI + O2R (remobilisation 16-66 ans) + accompagnement des artistes, depuis 1996. Clé `asso-la-main-forte-24`. |
| 2026-09-07 | jeunes | Mission locale et Maison de l'emploi du Périgord Noir | Sarlat / Terrasson (24) | https://www.missionlocaleperigordnoir.com/ | **DATÉE 2026-09-08** | 16-25 ans : emploi, formation, autonomie, logement des saisonniers. Clé `asso-mission-locale-perigord-noir-24`. |
| 2026-09-07 | villes moyennes (note) | ESCALE (Sarlat), D'ici et d'ailleurs (Saint-Yrieix), Causa Bambino (Saint-Yrieix) | 24 / 87 | *(pas de site propre)* | ÉCARTÉES CE PASSAGE | ESCALE : entraide/accompagnement personnes isolées à Sarlat, pas de site. D'ici et d'ailleurs : épicerie sociale et solidaire participative à Saint-Yrieix (produits -70 %), pas de site propre (articles de presse seulement). Causa Bambino : cause de l'enfance, hors périmètre. À retenter si un site apparaît, ou à récupérer via les guides des solidarités des CD. |
| 2026-09-07 | accompagnement | DORA (service public, ANCT) | national | https://dora.inclusion.gouv.fr/ | **DATÉE 2026-09-07** | Recherche par adresse + par besoin (accompagnement, mobilité, logement, numérique, aide alimentaire, français, budget...) les structures d'insertion près de chez soi. L'équivalent « guide des solidarités » à l'échelle nationale, tenu à jour. Clé `dora-services-insertion`. |
| 2026-09-07 | accompagnement | Annuaire des acteurs de la Dordogne (Conseil départemental 24) | 24 | https://www.dordogne.fr/information-transversale/annuaire-des-acteurs | **DATÉE 2026-09-07** | ~6 000 structures locales cherchables par canton et par thème, avec coordonnées et carte. Le « guide des solidarités » du CD24, en ligne. Clé `annuaire-acteurs-dordogne`. Pas d'équivalent public trouvé côté CD87 (DORA + l'annuaire service-public couvrent la Haute-Vienne). |
| 2026-09-07 | accompagnement | ALEAS (Association Limousine Emplois Activités Services) | Saint-Junien (87) | https://www.association-aleas.fr/ | **DATÉE 2026-09-08** | ACI + entreprise d'insertion autour du réemploi (ressourcerie, friperie, débarras, atelier bois, bouquinerie) + auto-école sociale, depuis 1981. Clé `asso-aleas-87`. |
| 2026-09-07 | jeunes | Mission locale rurale de la Haute-Vienne | Bellac + 4 antennes / 32 points (87) | https://www.missionlocaleruralehautevienne.com/ | **DATÉE 2026-09-08** | 16-25 ans sur tout le territoire rural du 87 (Bellac, Saint-Junien, Aixe-sur-Vienne, Saint-Yrieix). Distincte du CRIJ et de la ML du Périgord Noir. Clé `asso-mission-locale-rurale-87`. |
| 2026-09-07 | accompagnement (aide aux aidants) | France Alzheimer Dordogne | Bergerac (24) | https://www.francealzheimer.org/dordogne/ | **DATÉE 2026-09-08** | Soutien aux aidants : formation, groupes de parole, cafés-mémoire, haltes-relais de répit. Clé `asso-france-alzheimer-24`. **France Alzheimer Haute-Vienne** : site injoignable au moment du contrôle (timeout / connexion refusée), à retenter et ajouter au prochain passage. |
| 2026-09-07 | accompagnement (santé mentale) | UNAFAM Dordogne | Périgueux / Bergerac (24) | https://www.unafam.org/dordogne | **DATÉE 2026-09-08** | Accueil et écoute des familles de personnes vivant avec un trouble psychique. Clé `asso-unafam-24`. |
| 2026-09-07 | accompagnement (santé mentale) | UNAFAM Haute-Vienne | Limoges (87) | https://www.unafam.org/haute-vienne | **DATÉE 2026-09-08** | Idem + soutien aux groupes d'entraide mutuelle (GEM). Clé `asso-unafam-87`. |
| 2026-09-07 | mobilite (transport solidaire) | Atchoum | Périgord Noir + autres CC (24) | https://www.atchoum.eu/ | **DATÉE 2026-09-08** | Plateforme de transport solidaire (conducteurs bénévoles), déployée par des communautés de communes de Dordogne. Clé `asso-atchoum-24`. Autres dispositifs vus sans site propre : Le Vime (Piégut-Pluviers), MSO / Secours catholique Pays du Haut Limousin (87). |
| 2026-09-07 | santé - accès aux soins | *(toujours rien de propre)* | 24 / 87 | — | RIEN CE PASSAGE | Confirmé : pas d'association locale à site propre pour l'accès aux soins des personnes précaires. Reste couvert par les PASS, la CSS, DORA et l'annuaire CD24. |
| 2026-09-07 | accompagnement (santé mentale) | FIGEM, annuaire national des GEM | national | https://www.figem.fr/annuaire | **DATÉE 2026-09-07** | Les GEM individuels (10 en Dordogne dont « La Pause que GEM » à Neuvic, « La Vallée de l'Isle » ; celui de Limoges, celui de Saint-Junien...) n'ont pas de site propre. L'annuaire FIGEM (fédération fondée par Fnapsy, UNAFAM, Santé Mentale France) permet de trouver un GEM près de chez soi. Il remplace la carte Psycom, plus mise à jour depuis octobre 2025. Clé `figem-annuaire-gem`. |
| 2026-09-07 | accompagnement (aide aux aidants) | France Alzheimer Haute-Vienne | 87 | *(pas de page dédiée)* | ÉCARTÉE CE PASSAGE | L'association existe (102 associations départementales), mais `francealzheimer.org/haute-vienne/` renvoie la page nationale « Contactez votre association locale », pas de page 87 distincte ni d'URL propre. Entrée = le localisateur national. À retenter si une page dédiée apparaît. |
| 2026-09-07 | budget (aide alimentaire) | La Maison 24 | Périgueux + Saint-Léon-sur-Vézère (24) | https://www.lamaison24.net/ | **DATÉE 2026-09-08** | Depuis 2013 : colis alimentaires, repas chauds en maraude, cours de français, friperie solidaire, café associatif, ateliers. Clé `asso-la-maison-24`. |
| 2026-09-07 | accompagnement | Réseau Alliage | Limoges (87) | https://www.reseau-alliage.fr/ | **DATÉE 2026-09-08** | Groupement de 4 SIAE (ATOS, AJIS 87, ACTO insertion, Chantiers des Chemins Jacquaires) : missions de travail (bâtiment, espaces verts, nettoyage, intérim) + accompagnement + FLE. Clé `asso-reseau-alliage-87`. |
| 2026-09-07 | régies de quartier (note) | *(aucune)* | 24 et 87 | — | RIEN À AJOUTER | Le Mouvement des Régies (CNLRQ, `regiedequartier.org`) compte 130 régies de quartier / de territoire, **aucune en Dordogne ni en Haute-Vienne**. Le rôle de proximité + insertion y est tenu par les SIAE (AFAC 24, BASE, ALEAS, La Main Forte, Réseau Alliage...) déjà listées. Rien à ajouter tant qu'une régie ne s'implante pas. |
| 2026-09-07 | aide alimentaire hyper-locale (note) | CAFEJ 24, La Graine de l'Arbre du Voyageur (Limoges), ONPAP (Limoges) | 24 / 87 | *(pas de site propre)* | ÉCARTÉES CE PASSAGE | Structures actives mais sans site : CAFEJ 24 (aide alimentaire + éducatif, Périgueux), La Graine de l'Arbre du Voyageur (épicerie sociale, Limoges), ONPAP (aide alimentaire + administratif + emploi, Limoges). À récupérer via l'annuaire CD24, DORA, ou les guides des solidarités. |
| 2026-09-08 | accompagnement (santé mentale) | Croix Marine Dordogne | Trélissac (siège) + 9 GEM (24) | https://www.croixmarine24.fr/ | **DATÉE 2026-09-08** | Photos du bureau d'une CIP à Bergerac. Association d'aide à la santé mentale : rompre l'isolement, réinsertion sociale ; anime les GEM du département (Bergerac, Périgueux, Sarlat, Nontron, Terrasson, Montpon, Neuvic, Excideuil, Pineuilh). C'est la structure concrète derrière « les GEM de Dordogne » restés sans réponse au passage précédent. Clé `asso-croix-marine-24`. Vérifiée au navigateur par Denis. |
| 2026-09-08 | accompagnement | Les Saveurs du Bois du Roc | Monestier (Bergeracois, 24) | https://www.saveursduboisduroc.fr/ | **DATÉE 2026-09-08** | Photos du bureau d'une CIP à Bergerac. Atelier chantier d'insertion : maraîchage biologique + travaux viticoles, vente directe de paniers de légumes. Clé `asso-saveurs-du-bois-du-roc-24`. Vérifiée au navigateur par Denis (URL ajustée en `https://www.`). |
| 2026-09-08 | accompagnement | GEIQ 24 | Bergerac (24) | https://geiq24.com/ | **DATÉE 2026-09-08** | Photos du bureau d'une CIP à Bergerac. Groupement d'employeurs pour l'insertion et la qualification : recrute sans condition de diplôme, place en entreprise du bâtiment avec formation qualifiante en alternance + accompagnement socio-professionnel. Clé `asso-geiq-24`. Vérifiée au navigateur par Denis (URL ajustée sans `www.`). |
| 2026-09-08 | creer | La Traverse | Bergerac (ancienne Manufacture des Tabacs, 24) | https://latraverse-bergerac.fr/ | **DATÉE 2026-09-08** | Photos du bureau d'une CIP à Bergerac. Tiers-lieu social, entrepreneurial et culturel : atelier partagé, coworking à petit prix, rendez-vous des entrepreneurs, réseau d'entraide ; vise l'inclusion des personnes éloignées de l'emploi. Clé `asso-la-traverse-bergerac-24`. Vérifiée au navigateur par Denis. |
| 2026-09-08 | photos bureau CIP Bergerac (note) | APES 24 / Terres Equi'Solidaires, Équipe Mobile Psychiatrie Précarité (CH Vauclaire), Codefilao | 24 | *(pas de site propre exploitable)* | ÉCARTÉES CE PASSAGE | Vues sur les documents photographiés mais sans site propre : APES 24 / Terres Equi'Solidaires (dispositif « Mieux dans ma tête, mieux dans mon job » : médiation par le cheval + accompagnement emploi, présence LinkedIn seulement) ; Équipe Mobile Psychiatrie Précarité rattachée au CH Vauclaire pour le Bergeracois (service hospitalier, contact courriel) ; Codefilao (non retrouvé). À récupérer via DORA ou l'annuaire CD24 si un site apparaît. |

---

## Archivé (traité ou écarté depuis > 1 trimestre)

*(vide pour l'instant)*
