# VEILLE_SOURCES_REFERENCE - la bibliothèque des sources du projet

> **Document privé. Jamais publié, jamais montré à une personne accompagnée.**
> Créé le 2026-09-08.
>
> **Ce que c'est :** l'inventaire de toutes les sources que le projet utilise ou pourrait
> utiliser, avec pour chacune : sa nature, si elle est déjà branchée dans le module, si un
> assistant sait la lire, si elle a une lettre d'information, et quel(s) circuit(s) elle nourrit.
>
> **Ce que ce n'est pas :** la source de vérité. Chaque circuit garde la sienne :
> - l'écran public « Trouver une source officielle » = `modules/comprendre-le-cadre/sources.txt` ;
> - les adresses citées par les fiches = `modules/comprendre-le-cadre/liens-verifies.txt` ;
> - les sites bloqués = `SITES_BLOQUES` dans `outils/veille.html` ;
> - les abonnements de Denis = `docs/VEILLE_NEWSLETTERS.md` ;
> - les prompts de veille = `docs/VEILLE_PROMPTS.md`.
>
> Ce document les met côte à côte. En cas de contradiction, les fichiers ci-dessus font foi.

---

## Légende des colonnes

**Nature**
- `Publique` : État, établissement public, opérateur public, service ministériel.
- `Para-publique` : GIP ou association investie d'une mission de service public (France compétences, Agefiph, missions locales, CARIF-OREF, ANLCI...).
- `Réseau` : fédération ou tête de réseau (associatif ou professionnel).
- `Non officielle` : presse, think tank, association de terrain, communauté de praticiens.

**Dans le module ?**
- `Tableau` : figure dans l'écran public « Trouver une source officielle ».
- `Fiches` : citée comme source d'au moins une fiche (`liens-verifies.txt`).
- `Structures` : citée dans « Près de chez moi ».
- `-` : pas branchée dans le module.

**Lisible ?** (par un assistant en ligne, sans intervention de Denis)
- `oui` / `non` (pare-feu anti-robot ou page en JavaScript) / `partiel`.

**Lettre ?** : lien d'abonnement si vérifié (voir `VEILLE_NEWSLETTERS.md`), sinon `-`.

**Circuits** (ce que la source nourrit)
- `F` fiche (prompt de collecte) · `C` Comprendre les chiffres · `B` balayage trimestriel ·
  `AC` À confronter (non officiel) · `A` annuaire associatif / structures · `N` abonnement de Denis.

---

## 1. Europe

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| Eurostat | Publique (UE) | - | non (Data Browser en JavaScript ; interface JSON de diffusion accessible) | https://ec.europa.eu/eurostat/web/main/alert | C, N |
| Cedefop (formation professionnelle) | Publique (UE) | - | oui | https://www.cedefop.europa.eu/en/news | C, N |
| Eurofound (conditions de vie et de travail) | Publique (UE) | - | oui | eurofound.europa.eu (« Subscribe to updates ») | C, N |
| Commission européenne, Emploi et affaires sociales | Publique (UE) | - | oui | employment-social-affairs.ec.europa.eu | N |

---

## 2. National - droit et cadre

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| Légifrance | Publique | Tableau + Fiches | **non** (pare-feu) | - (API PISTE et open data JORF sur data.gouv.fr) | F, B |
| service-public.gouv.fr | Publique | Tableau + Fiches (74 pages) | oui | https://www.service-public.gouv.fr/actualites/lettresp/abonnement | F, B, N |
| Ministère du Travail (travail-emploi.gouv.fr) | Publique | Tableau + Fiches (18 pages) | oui | https://travail-emploi.gouv.fr/la-lettre-hebdo-travail-emploi | F, B, N |
| Bulletins officiels travail-emploi-formation | Publique | Tableau + Fiches | partiel | - | F |
| code.travail.gouv.fr (le code du travail numérique) | Publique | Fiches | oui | - | F |
| vie-publique.fr (DILA) | Publique | **Tableau** (depuis 2026-09-08) + Fiches | oui | https://www.vie-publique.fr/ressources/mots-cles/abonnement | F, B, N |
| BOSS - Bulletin officiel de la Sécurité sociale | Publique | - | oui | https://boss.gouv.fr/ (compte + alertes) | F, N |
| Ministère de l'Intérieur / Immigration-Intérieur | Publique | Tableau + Fiches | **non** (pare-feu) | - | F |
| info.gouv.fr (organisation de l'État, DIHAL) | Publique | Fiches | **non** | https://www.info.gouv.fr/newsletter (répertoire) | F, N |
| economie.gouv.fr (clauses sociales, création) | Publique | Fiches | **non** | - | F |
| education.gouv.fr / Eduscol / Académie de Bordeaux | Publique | Fiches | **non** | - | F |
| justice.gouv.fr / justice.fr / ATIGIP | Publique | Fiches | justice.fr **non**, justice.gouv.fr partiel | - | F |
| Défenseur des droits | Publique | Fiches | oui | https://www.defenseurdesdroits.fr/inscrivez-vous-nos-lettres-dinformation-129 | F, N |
| Unédic | Para-publique | Fiches | oui | https://www.unedic.org/publications | F, B, N |
| France compétences | Publique | Tableau + Fiches | oui | https://www.francecompetences.fr/sabonner-a-la-newsletter-france-competences/ | F, B, N |

---

## 3. National - statistiques et études

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| INSEE | Publique | Tableau + Fiches | pages courantes oui ; **séries chronologiques non** (JavaScript) | https://www.insee.fr/fr/information/1405555 | C, N |
| DARES | Publique | Tableau + Fiches | oui | https://dares.travail-emploi.gouv.fr/abonnement-newsletter | C, B, N |
| France Travail - statistiques (STMT, offres) | Publique | Tableau + Fiches | tableaux de bord STMT **non** (interactifs) | https://www.francetravail.org/accueil/abonnez-vous-a-notre-newsletter.html | C, B, N |
| France Travail - enquête Besoins en main-d'œuvre | Publique | Tableau | résultats en tableau de bord / fichier : **non** | (idem France Travail) | C |
| DREES (solidarité et santé) | Publique | - | oui | https://drees.solidarites-sante.gouv.fr/article/vous-souhaitez-recevoir-nos-publications | C, N |
| Céreq (recherche formation-emploi) | Publique | - | oui | https://www.cereq.fr/abonnements | C, AC, N |
| France Stratégie (Haut-commissariat à la stratégie et au plan) | Publique | - | oui | strategie-plan.gouv.fr (rubrique Publications) | C, N |
| Observatoire des territoires (ANCT) | Publique | Tableau + Fiches | oui | https://anct.gouv.fr/ressources/infolettre | C, N |
| data.gouv.fr (open data) | Publique | - | oui | - | (contourne Légifrance/INSEE bloqués) |

---

## 4. National - opérateurs et réseaux de l'emploi, de la formation, de l'insertion

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| France Travail (francetravail.fr) | Publique | Tableau + Fiches (19 pages) + Structures | partiel (certaines pages en pare-feu) | (voir France Travail statistiques) | F, B, A |
| moncompteformation.gouv.fr | Publique | Fiches | oui | - | F |
| vae.gouv.fr (France VAE) | Publique | Fiches | oui | - | F |
| mon-cep.org (conseil en évolution professionnelle) | Para-publique | Fiches + Structures | oui | - | F, A |
| Transitions Pro (national + Nouvelle-Aquitaine) | Para-publique | Tableau + Fiches + Structures | oui | transitionspro-na.fr (rubrique actualités) | F, A, N |
| AFPA | Publique | Structures | oui | - | A |
| Onisep | Publique | - (listée comme bloquée) | **non** (JavaScript) | - | F |
| APEC | Para-publique | Fiches + Structures | oui | https://corporate.apec.fr/inscription-a-la-newsletter.html | AC, N |
| AGEFIPH | Para-publique | Tableau + Fiches + Structures | oui | https://www.agefiph.fr/newsletter/inscription | F, B, A, N |
| FIPHFP (handicap dans la fonction publique) | Publique | - | oui | - | F |
| Cheops (réseau national Cap emploi) | Réseau | - | oui | cheops-ops.org (formulaire à trouver) | AC, N |
| UNML (réseau des missions locales) | Réseau | - | oui | https://www.unml.info/nos-newsletters/ | AC, N |
| Missions locales 24 (Bergeracois, Grand Périgueux, Périgord Noir) | Para-publique | Structures | oui | - | A |
| Cap emploi Dordogne | Para-publique | Structures | oui | - | A |
| Agence du Service Civique | Publique | Tableau + Fiches | oui | - | F |
| 1jeune1solution.gouv.fr | Publique | Fiches | oui | - | F |
| Réseau E2C, EPIDE, CRIJ Nouvelle-Aquitaine | Para-publique / Réseau | Structures | oui | - | A |
| La Plateforme de l'inclusion (emplois.inclusion, DORA, data.inclusion, le Marché) | Publique | DORA en Structures | oui | https://infolettres.inclusion.beta.gouv.fr/ | F, A, N |
| data.inclusion (open data des services d'insertion) | Publique | - | oui (open data + API) | (via Plateforme de l'inclusion) | piste « Près de chez moi » (voir CHANTIER_TERRITOIRE § 10) |
| ville-emploi.asso.fr (réseau des PLIE et maisons de l'emploi) | Réseau | Structures | oui | - | A |
| INAE Nouvelle-Aquitaine (réseau régional de l'IAE) | Réseau | Structures | oui | inae-nouvelleaquitaine.org (formulaire à trouver) | A, N |
| Fédérations de l'IAE : Les entreprises d'insertion, COORACE, Chantier école, Fédération des GEIQ | Réseau | - | oui | coorace.org, etc. | AC, A |
| Banque des Territoires / Localtis | Para-publique (Caisse des dépôts) | - | oui | https://www.banquedesterritoires.fr/les-newsletters | AC, N |
| Réseau des Carif-Oref (intercariforef.org) | Réseau | - | oui | https://www.intercariforef.org/actualites-des-cariforef | B, N |
| CIDJ (Info Jeunes) | Para-publique | - | oui | https://www.cidj.com/inscription-aux-newsletters-cidj | AC, N |

---

## 5. National - budget, prestations sociales, solidarité

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| CAF (caf.fr) | Para-publique | Tableau + Fiches + Structures | oui | - (actualités sur caf.fr) | F, A |
| solidarites.gouv.fr | Publique | Fiches | oui | - | F |
| Banque de France (surendettement, FICP, droit au compte, microcrédit) | Publique | Fiches | **non** (pare-feu) | - | F |
| URSSAF (autoentrepreneur.urssaf.fr, Pajemploi) | Publique | Fiches | oui | - | F |
| MSA (mutualité sociale agricole) | Para-publique | Fiches + Structures | oui | - | F, A |
| mesdroitssociaux.gouv.fr (simulateurs) | Publique | Fiches | **non** | - | F |
| ANLCI (illettrisme) | Para-publique | Fiches | oui | https://www.anlci.gouv.fr/ressources/infolettre-e-lci/ | F, N |
| Action Logement | Para-publique | Fiches + Structures | oui | - | F, A |
| ANIL / ADIL (information logement) | Réseau | Structures | oui | - | A |
| CRESUS, ANDES, UDAF 24 et 87, mesquestionsdargent.fr | Réseau / asso | Structures | oui | - | A |
| Restos du Cœur (national + 24 + 87), Banque alimentaire (+ 87), Secours populaire, Croix-Rouge, Secours catholique | Non officielle (grandes assos) | Structures | oui | - | A, AC |
| Fédération des acteurs de la solidarité (FAS) | Réseau | - | oui | https://www.federationsolidarite.org/newsletter/ | AC, N |
| info-retraite.fr, l'Assurance retraite, France Services | Publique | Fiches + Structures | oui | - | F, A |

---

## 6. Venir de l'étranger

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| immigration.interieur.gouv.fr, interieur.gouv.fr, ANEF | Publique | Tableau + Fiches | **non** (pare-feu) | - | F |
| ANTS (titres, permis) | Publique | Structures | oui | - | A |
| OFII | Publique | Fiches + Structures | oui | - | F, A |
| France Éducation International (ENIC-NARIC) | Publique | Tableau + Fiches | oui | - | F |
| La Cimade, France Terre d'Asile, SPADA Dordogne | Non officielle (assos) | Structures | oui | - | A, AC |

---

## 7. Régional - Nouvelle-Aquitaine

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| Cap Métiers Nouvelle-Aquitaine (CARIF-OREF) | Para-publique | Tableau (SI-Terr) + Structures | site oui ; **SI-Terr non** (interactif) | https://pro.cap-metiers.fr/newsletter/ | F, C, B, A, N |
| Conseil régional Nouvelle-Aquitaine (nouvelle-aquitaine.fr, jeunes., les-aides.) | Publique | Fiches + Structures | oui | https://www.nouvelle-aquitaine.fr/abonnement-la-newsletter | F, A, N |
| DREETS Nouvelle-Aquitaine | Publique | Fiches + Structures ; **PDF départementaux non** | site oui ; PDF non | pas de formulaire public (alpc.communication@direccte.gouv.fr) | F, C, B, N |
| INSEE Nouvelle-Aquitaine | Publique | (via INSEE) | oui | (formulaire INSEE, cocher la région) | C, N |
| transports.nouvelle-aquitaine.fr, Modalis | Publique | Fiches + Structures | oui | - | F, A |
| CARSAT / l'Assurance retraite Nouvelle-Aquitaine | Para-publique | Structures | oui | - | A |

---

## 8. Départemental - Dordogne (24) et Haute-Vienne (87)

| Source | Nature | Dans le module ? | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|---|
| Département de la Dordogne (dordogne.fr, habitat.dordogne.fr) | Publique | Fiches + Structures (9 pages) | oui | https://www.dordogne.fr/informations-pratiques/lettre-dinformation | F, A, N |
| Les services de l'État en Dordogne (dordogne.gouv.fr) | Publique | Structures | oui | https://www.dordogne.gouv.fr/lettreinformation/abonnement | A, N |
| Département de la Haute-Vienne (hautevienne.fr) | Publique | Structures | oui | https://www.hautevienne.fr/nav-newsletter | A, N |
| Les services de l'État en Haute-Vienne (haute-vienne.gouv.fr) | Publique | Structures | oui | https://www.haute-vienne.gouv.fr/lettreinformation/abonnement | A, N |
| CAF Dordogne, Cap emploi 24, PMI, MDPH 24 | Para-publique | Structures | oui | - | A |
| CDAD Dordogne (accès au droit), ordre des avocats de Périgueux, France Victimes | Réseau / asso | Structures | oui | - | A |
| Associations locales 24 : AFAC 24, plateforme MUST, Auto-mobilité solidaire, Base 24, La Main Forte 24, SoliHA Dordogne, CIDFF 24, Ligue de l'enseignement 24, CoopAlpha, Iriscop, BGE Périgord, Initiative Périgord, restos et banque alimentaire 24... | Non officielle (assos) | Structures | oui | - | A |
| Associations locales 87 : Mobilim 87, Varlin Pont-Neuf, ARSL, APF 87, SoliHA Limousin, ADIL 87, CIDFF Limousin, association LIRE, UDAF 87... | Non officielle (assos) | Structures | oui | - | A |
| Annuaires : lannuaire.service-public.gouv.fr, annuaire.action-sociale.org | Publique / Réseau | Structures (9 renvois) | oui | - | A |

> Le détail ligne par ligne des ~110 structures locales est dans
> `modules/comprendre-le-cadre/liens-verifies.txt` (avec portée `national` / `region` / `24` / `87`).
> Beaucoup n'ont pas encore de date de vérification : elles s'affichent sans lien cliquable
> (LECONS 9.16). Suivi : `docs/PAQUET_C_A_DATER.md`.

---

## 9. Presse spécialisée et communautés (non officiel)

Contenu complet souvent payant ; une lettre de tête gratuite existe presque toujours.
Ces sources ne nourrissent **jamais une fiche** : uniquement le circuit « À confronter ».

| Source | Nature | Lisible ? | Lettre ? | Circuits |
|---|---|---|---|---|
| AEF info (dépêches Emploi / Formation / Social) | Non officielle (presse) | partiel | payant, alertes gratuites (aefinfo.fr) | AC, N |
| ID-Cité (idcite.com) - veille des collectivités | Non officielle (presse) | oui | bulletin quotidien gratuit | AC, N |
| Actualités Sociales Hebdomadaires (ASH) | Non officielle (presse) | partiel | payant, newsletter gratuite | AC |
| Le Media Social (ex-Lien Social) | Non officielle (presse) | partiel | payant, newsletter gratuite | AC |
| La Gazette des communes (newsletter Social / Emploi) | Non officielle (presse) | partiel | payant, newsletters thématiques gratuites | AC |
| Éditions Législatives - actuEL | Non officielle (presse) | partiel | inscription gratuite possible | AC |
| Le Repère des CIP (lereperedescip.fr) | Non officielle (praticiens) | oui | - | AC |
| La Communauté de l'inclusion (communaute.inclusion.gouv.fr) | Para-publique (beta.gouv) | oui | (via Plateforme de l'inclusion) | AC |
| Terra Nova, Institut Montaigne, Fondation Jean-Jaurès, Fondapol | Non officielle (think tanks) | oui | sites respectifs | AC |
| LinkedIn, Facebook, X, YouTube, Reddit | Non officielle | LinkedIn et Facebook **non** ; Reddit oui ; X et YouTube partiels | - | AC |

> Le circuit « À confronter » (`VEILLE_PROMPTS.md` § 5quinquies) est le **seul** endroit où on
> regarde le non officiel, et il est lancé par Denis sur son compte personnel, jamais par l'outil.

---

## 10. Récapitulatif : les sites qu'un assistant ne peut pas lire

Repris de `SITES_BLOQUES` (`outils/veille.html`). Consultation à la main, puis bloc
« Importer un texte à la main » de `veille.html`.

**Cadre** : Légifrance, Ministère de l'Intérieur, Immigration-Intérieur, info.gouv.fr,
economie.gouv.fr, education.gouv.fr, Eduscol, Académie de Bordeaux, monenfant.fr, justice.fr,
mesdroitssociaux.gouv.fr, Onisep, + 2 pages « aides Nouvelle-Aquitaine ».

**Chiffres** : séries chronologiques INSEE, tableaux STMT de France Travail, PDF départementaux
de la DREETS Nouvelle-Aquitaine, Eurostat Data Browser, enquête Besoins en main-d'œuvre,
SI-Terr de Cap Métiers.

---

## 11. Tenue de ce document

- Ce document **reflète**, il ne décide pas. Quand une source entre ou sort d'un circuit,
  on modifie d'abord le fichier de ce circuit (voir l'en-tête), puis on répercute ici.
- Deux comptes Claude travaillent sur ce dépôt : vérifier `git log` avant de reprendre.
- Dernière revue complète : 2026-09-08 (création).
- Changements notables à cette date : Centre Inffo retiré (liquidation, voir
  `docs/VEILLE_NEWSLETTERS.md`), remplacé par vie-publique.fr dans le tableau public et les
  relais de veille ; ajout des réseaux nationaux (Banque des Territoires, UNML, FAS, CIDJ,
  APEC, Cheops, Carif-Oref) ; `data.inclusion` noté comme piste pour « Près de chez moi ».
