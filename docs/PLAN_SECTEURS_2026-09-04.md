# Plan — Normalisation des secteurs de métier

> Sous-lot 1 du chantier `CHANTIER_CANDIDATURE_DEPUIS_RECHERCHE_ET_SECTEURS.md`.
> Décisions A→E validées par Denis le 2026-09-04. Taxonomie **21 secteurs** validée
> le 2026-09-04 (après correction : `baseMetiers` = **129 fiches**, assemblées de 3
> fichiers, pas 65).

## 1. Objectif du sous-lot 1

Passer le champ `secteur` des fiches de `baseMetiers` de **52 chaînes libres** à une
**liste contrôlée de 21 secteurs**. Pur data + registre + tests. Aucun visuel.
**Zéro régression** : les 2 sous-sections « métiers saisonniers » et « métiers qui
recrutent » de « Votre profil » affichent exactement les mêmes métiers — leurs listes
de filtrage passent de « libellés de secteur » (disparus à la fusion) à
« identifiants de métier », calculées sur les anciens libellés sur les 129 fiches.

## 2. `baseMetiers` = 3 fichiers

| Fichier | Fiches | Style |
|---|---|---|
| `data/metiers.js` (`const baseMetiers`) | 65 | `secteur: "..."` (guillemets doubles) |
| `data/metiersComplementaires.js` (`METIERS_COMPLEMENTAIRES`, poussé dans `baseMetiers`) | ~24 | `secteur: '...'` (guillemets simples) |
| `data/referentielMetiersERIP.js` (`REFERENTIEL_METIERS_ERIP`, poussé) | ~40 | `secteur: '...'` |
| **Total** | **129** | |

## 3. Les 21 secteurs (valeur contrôlée)

`SECTEURS_APP` (dans `data/metiers.js`) — ordre = ordre d'affichage (nb de fiches décroissant).

| Clé | Libellé (= valeur stockée) | Fiches |
|---|---|---|
| `btp` | Bâtiment et travaux publics | 13 |
| `industrie` | Industrie, production et énergie | 14 |
| `hotellerie-restauration` | Hôtellerie, restauration et tourisme | 13 |
| `agriculture-nature` | Agriculture, nature et espaces verts | 10 |
| `transport-logistique` | Transport et logistique | 9 |
| `sante` | Santé et soins | 8 |
| `social-personne` | Social et services à la personne | 8 |
| `commerce-vente` | Commerce et vente | 7 |
| `administration` | Administration, gestion et bureau | 7 |
| `communication-culture` | Communication, culture et événementiel | 6 |
| `animalier` | Métiers animaliers | 5 |
| `proprete` | Propreté et gestion des déchets | 4 |
| `sport-animation` | Sport, animation et loisirs | 4 |
| `numerique` | Informatique et numérique | 3 |
| `banque-assurance-immobilier` | Banque, assurance et immobilier | 3 |
| `artisanat` | Artisanat et création | 3 |
| `artisanat-bouche` | Métiers de bouche (artisanat) | 3 |
| `education-formation` | Éducation et formation | 3 |
| `automobile` | Mécanique et automobile | 2 |
| `securite` | Sécurité | 2 |
| `coiffure-esthetique` | Coiffure et esthétique | 2 |

**Total : 129 fiches, 21 secteurs, tous ≥ 2 fiches.**

> Note : le libellé de `artisanat` est « Artisanat et création » (pas « Artisanat d'art »)
> pour rester compatible avec les chaînes en guillemets simples des 2 fichiers annexes.

### Arbitrages validés Denis (2026-09-04)

1. `numerique` (3) → secteur autonome. 2. `animalier` (5) → autonome. 3. « Animateur »
sort de `social-personne` pour `sport-animation`. 4. Communication + Culture +
Événementiel = un seul secteur. 5. Banque + Assurance + Immobilier = un seul secteur.
6. `artisanat` (fleuriste, ébéniste, bijoutier) séparé de `artisanat-bouche`.
7. « Conseiller en insertion professionnelle » → `social-personne`. 8. « Énergie »
(2) fondu dans `industrie`. 9. « Agent polyvalent de collectivité » → `administration`.

## 4. Fusion (52 anciens libellés → 21 nouveaux)

Chaque ancien libellé va vers **un seul** nouveau secteur (fusion pure). Exceptions
par identifiant (`ID_OVERRIDE`, appliquées après la fusion) : les 5 métiers animaliers
(`veterinaire`, `auxiliaire_veterinaire`, `agent_equestre`, `agent_animalier`,
`toiletteur_animalier` → `Métiers animaliers`) et `agent_accueil` (ancien libellé
« Services » → `Administration, gestion et bureau` ; `toiletteur_animalier` a le même
ancien libellé « Services » mais part en `animalier`).

| Anciens libellés | Nouveau |
|---|---|
| BTP | Bâtiment et travaux publics |
| Industrie · Industrie chimique · Agroalimentaire · Maintenance · Énergie | Industrie, production et énergie |
| Hôtellerie-restauration · Restauration · Hôtellerie-tourisme · Hôtellerie · Tourisme | Hôtellerie, restauration et tourisme |
| Agriculture · Viticulture · Espaces verts | Agriculture, nature et espaces verts |
| Logistique · Transport | Transport et logistique |
| Santé | Santé et soins |
| Médico-social · Petite enfance · Services à la personne · Social · Insertion professionnelle | Social et services à la personne |
| Commerce · Commerce alimentaire · Grande distribution · Relation client | Commerce et vente |
| Administration · Gestion · Encadrement · Ressources humaines · Collectivites · (Services → `agent_accueil`) | Administration, gestion et bureau |
| Communication · Culture · Événementiel | Communication, culture et événementiel |
| (par id) veterinaire · auxiliaire_veterinaire · agent_equestre · agent_animalier · toiletteur_animalier | Métiers animaliers |
| Propreté · Environnement | Propreté et gestion des déchets |
| Sport · Animation | Sport, animation et loisirs |
| Numérique | Informatique et numérique |
| Banque · Assurance · Immobilier | Banque, assurance et immobilier |
| Artisanat | Artisanat et création |
| Artisanat alimentaire | Métiers de bouche (artisanat) |
| Formation · Éducation | Éducation et formation |
| Automobile | Mécanique et automobile |
| Sécurité · Sécurité publique | Sécurité |
| Artisanat / Beauté · Beauté | Coiffure et esthétique |

## 5. Répartition fiche par fiche (129)

<!-- Généré automatiquement (extraction des 3 fichiers après normalisation). -->

### Industrie, production et énergie (14)

- Agent de production `agent_production` (metiers)
- Technicien de maintenance `technicien_maintenance` (metiers)
- Opérateur de production agroalimentaire `operateur_agroalimentaire` (metiers)
- Opérateur en transformation des viandes / conserverie `operateur_decoupe` (metiers)
- Opérateur de production chimique `operateur_chimie` (metiers)
- Soudeur `soudeur` (metiers)
- Opérateur d `usineur` (metiers)
- Agent de maintenance des bâtiments `agent_maintenance_batiment` (metiers)
- Monteur de réseaux électriques `monteur_reseaux_electriques` (referentielMetiersERIP)
- Technicien froid et climatisation `technicien_froid_climatisation` (referentielMetiersERIP)
- Technicien qualité `technicien_qualite` (referentielMetiersERIP)
- Régleur sur machine à commande numérique `regleur_cn` (referentielMetiersERIP)
- Conducteur de ligne de production `conducteur_ligne` (referentielMetiersERIP)
- Technicien de maintenance éolienne `technicien_eolien` (referentielMetiersERIP)

### Hôtellerie, restauration et tourisme (13)

- Serveur en restauration `serveur` (metiers)
- Cuisinier / Commis de cuisine `cuisinier` (metiers)
- Employé polyvalent de restauration / Aide de cuisine `employe_polyvalent_restauration` (metiers)
- Plongeur en restauration `plongeur` (metiers)
- Réceptionniste en hôtellerie `receptionniste` (metiers)
- Employé d `employe_etage` (metiers)
- Barman / Employé de café `barman` (metiers)
- Agent d `accueil_touristique` (metiers)
- Chef de cuisine `chef_cuisine` (referentielMetiersERIP)
- Sommelier `sommelier` (referentielMetiersERIP)
- Guide touristique `guide_touristique` (referentielMetiersERIP)
- Concierge d `concierge_hotel` (referentielMetiersERIP)
- Chef de reception `chef_reception` (referentielMetiersERIP)

### Bâtiment et travaux publics (13)

- Maçon `macon` (metiers)
- Peintre en bâtiment `peintre` (metiers)
- Plombier `plombier` (metiers)
- Électricien `electricien` (metiers)
- Manœuvre / Aide de chantier `manoeuvre_btp` (metiers)
- Menuisier poseur `menuisier_poseur` (metiers)
- Plaquiste `plaquiste` (metiers)
- Couvreur `couvreur` (metiers)
- Conducteur d `conducteur_engins_chantier` (metiers)
- Charpentier `charpentier` (referentielMetiersERIP)
- Carreleur `carreleur` (referentielMetiersERIP)
- Chef de chantier `chef_chantier` (referentielMetiersERIP)
- Grutier `grutier` (referentielMetiersERIP)

### Agriculture, nature et espaces verts (10)

- Ouvrier paysagiste / Jardinier `paysagiste` (metiers)
- Ouvrier agricole / viticole `ouvrier_agricole` (metiers)
- Ouvrier de chai / Agent de cave `ouvrier_chai` (metiers)
- Ouvrier horticole / Maraîcher `ouvrier_horticole` (metiers)
- Conducteur d `conducteur_engins_agricoles` (metiers)
- Vigneron `vigneron` (referentielMetiersERIP)
- Arboriculteur `arboriculteur` (referentielMetiersERIP)
- Apiculteur `apiculteur` (referentielMetiersERIP)
- Chef de culture viticole `chef_de_culture` (referentielMetiersERIP)
- Éleveur `eleveur` (referentielMetiersERIP)

### Transport et logistique (9)

- Préparateur de commandes / Magasinier `preparateur_commandes` (metiers)
- Cariste `cariste` (metiers)
- Chauffeur-livreur `chauffeur_livreur` (metiers)
- Chauffeur routier `chauffeur_routier` (metiers)
- Conducteur de transport en commun `conducteur_bus` (metiers)
- Manutentionnaire / Agent de quai `manutentionnaire` (metiers)
- Logisticien `logisticien` (referentielMetiersERIP)
- Agent de tri `agent_tri` (referentielMetiersERIP)
- Livreur à vélo `livreur_velo` (referentielMetiersERIP)

### Social et services à la personne (8)

- Assistant de vie aux familles (ADVF) `advf` (metiers)
- Auxiliaire petite enfance `auxiliaire_petite_enfance` (metiers)
- Accompagnant éducatif et social (AES) `aes` (metiers)
- Employé de ménage à domicile `menage_domicile` (metiers)
- Conseiller en insertion professionnelle `conseiller_insertion_professionnelle` (referentielMetiersERIP)
- Éducateur spécialisé `educateur_specialise` (referentielMetiersERIP)
- Assistant de service social `assistant_social` (referentielMetiersERIP)
- Garde d `garde_enfants_domicile` (referentielMetiersERIP)

### Santé et soins (8)

- Aide-soignant `aide_soignant` (metiers)
- Infirmier `infirmier` (metiers)
- Agent de service hospitalier (ASH) `ash` (metiers)
- Secrétaire médicale `secretaire_medicale` (metiers)
- Ambulancier / Auxiliaire ambulancier `ambulancier` (metiers)
- Assistant dentaire `assistant_dentaire` (referentielMetiersERIP)
- Préparateur en pharmacie `preparateur_pharmacie` (referentielMetiersERIP)
- Brancardier `brancardier` (referentielMetiersERIP)

### Commerce et vente (7)

- Conseiller de vente `conseiller_vente` (metiers)
- Téléconseiller `teleconseiller` (metiers)
- Employé libre-service `employe_libre_service` (metiers)
- Hôte de caisse `hote_caisse` (metiers)
- Vendeur en alimentation `vendeur_alimentation` (metiers)
- Responsable de magasin `responsable_magasin` (referentielMetiersERIP)
- Merchandiseur `merchandiseur` (referentielMetiersERIP)

### Administration, gestion et bureau (7)

- Agent d `agent_accueil` (metiers)
- Assistant administratif `assistant_administratif` (metiers)
- Comptable / Assistant comptable `comptable` (metiers)
- Chef d `chef_equipe` (metiers)
- Gestionnaire ressources humaines `gestionnaire_rh` (referentielMetiersERIP)
- Assistant ressources humaines `assistant_rh` (referentielMetiersERIP)
- Agent polyvalent de collectivite `agent_polyvalent_collectivite` (referentielMetiersERIP)

### Communication, culture et événementiel (6)

- Community manager `community_manager` (referentielMetiersERIP)
- Graphiste `graphiste` (referentielMetiersERIP)
- Photographe `photographe` (referentielMetiersERIP)
- Animateur evenementiel `animateur_evenementiel` (referentielMetiersERIP)
- Technicien son et lumière `technicien_son_lumiere` (referentielMetiersERIP)
- Bibliothécaire `bibliothecaire` (referentielMetiersERIP)

### Métiers animaliers (5)

- Toiletteur animalier `toiletteur_animalier` (referentielMetiersERIP)
- Vétérinaire `veterinaire` (referentielMetiersERIP)
- Auxiliaire vétérinaire `auxiliaire_veterinaire` (referentielMetiersERIP)
- Agent équestre / Palefrenier `agent_equestre` (referentielMetiersERIP)
- Agent animalier `agent_animalier` (referentielMetiersERIP)

### Propreté et gestion des déchets (4)

- Agent d `agent_entretien` (metiers)
- Agent de propreté urbaine / Ripeur `agent_proprete_urbaine` (metiers)
- Agent de collecte des dechets `agent_collecte_dechets` (referentielMetiersERIP)
- Technicien de traitement des eaux `technicien_eaux` (referentielMetiersERIP)

### Sport, animation et loisirs (4)

- Animateur `animateur` (metiers)
- Éducateur sportif `educateur_sportif` (referentielMetiersERIP)
- Moniteur de fitness `moniteur_fitness` (referentielMetiersERIP)
- Maître-nageur sauveteur `maitre_nageur` (referentielMetiersERIP)

### Éducation et formation (3)

- Formateur / Éducateur `formateur` (metiers)
- Moniteur auto-école `moniteur_auto_ecole` (referentielMetiersERIP)
- Accompagnant d `aesh` (referentielMetiersERIP)

### Informatique et numérique (3)

- Développeur informatique `developpeur` (metiers)
- Technicien réseau informatique `technicien_reseau` (referentielMetiersERIP)
- Webmaster `webmaster` (referentielMetiersERIP)

### Métiers de bouche (artisanat) (3)

- Boulanger `boulanger` (metiers)
- Boucher `boucher` (metiers)
- Pâtissier `patissier` (referentielMetiersERIP)

### Artisanat et création (3)

- Fleuriste `fleuriste` (referentielMetiersERIP)
- Ébéniste `ebeniste` (referentielMetiersERIP)
- Bijoutier `bijoutier` (referentielMetiersERIP)

### Banque, assurance et immobilier (3)

- Agent immobilier `agent_immobilier` (referentielMetiersERIP)
- Conseiller bancaire `conseiller_bancaire` (referentielMetiersERIP)
- Agent d `agent_assurance` (referentielMetiersERIP)

### Mécanique et automobile (2)

- Mécanicien automobile `mecanicien` (metiers)
- Carrossier-peintre automobile `carrossier` (metiers)

### Sécurité (2)

- Agent de sécurité `agent_securite` (metiers)
- Gendarme `gendarme` (metiersComplementaires)

### Coiffure et esthétique (2)

- Coiffeur `coiffeur` (metiers)
- Esthéticienne `estheticienne` (referentielMetiersERIP)

## 6. Les 2 listes de filtrage (`data/metiers.js`, zéro régression)

Ex-`SECTEURS_ALIMENTAIRE_SAISONNIER` / `SECTEURS_QUI_RECRUTENT_GENERALEMENT` (de
`js/app.js`) filtraient sur `m.secteur`. Convertis en **identifiants de métier** :
membres calculés à partir des **anciens** libellés, sur les 129 fiches.

- **`METIERS_SAISONNIER_ALIMENTAIRE`** (26 ids) — anciens libellés : Agriculture,
  Agroalimentaire, Artisanat alimentaire, Commerce alimentaire, Hôtellerie,
  Hôtellerie-restauration, Hôtellerie-tourisme, Restauration, Tourisme.
- **`METIERS_QUI_RECRUTENT_GENERALEMENT`** (39 ids) — anciens libellés : Logistique,
  Grande distribution, BTP, Transport, Santé, Services à la personne, Médico-social,
  Propreté, Sécurité.

Aucun chevauchement. Les 3 consommateurs (`metiersSaisonnierAlimentaire`,
`metiersQuiRecrutentGeneralement`, le tri de `pistesRecommandees`) passent de
`SECTEURS_X.indexOf(m.secteur)` à `METIERS_X.indexOf(m.id)`. Résultat visible identique.

## 7. Tests (`tests/secteursMetiers.test.js`)

- Les 3 sources assemblent 129 fiches.
- `SECTEURS_APP` : 21 entrées, clés + libellés uniques.
- Tout `<fiche>.secteur` ∈ libellés de `SECTEURS_APP` (les 3 sources).
- Chaque secteur ≥ 2 fiches ; répartition exacte conforme à §3.
- Les 2 listes id : 26 / 39 ids, tous valides, pas de doublon, pas de chevauchement.

## 8. Suite (sous-lots 2→5)

`data/secteurs.js` (fiches d'explication + métiers phares), secteur comme résultat de
recherche, revue visuelle du parcours (maquette), candidater depuis un secteur + passe
de prompt. Voir `CHANTIER_CANDIDATURE_DEPUIS_RECHERCHE_ET_SECTEURS.md`.
