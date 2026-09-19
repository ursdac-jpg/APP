# Rayon « Créer son activité » : 7 fiches

**Statut : relu et validé par Denis le 2026-09-06.** Recherche web sur les pages officielles (service-public.gouv.fr,
URSSAF, France Travail, Bpifrance Création, fédération des coopératives d'activité et d'emploi),
consignée dans `creer.collecte.md`. Deux fiches distinctes pour micro/société d'une part et
coopérative d'autre part (décision 13 de la maquette).

## Avant de publier

1. **Relire les 7 fiches** dans `outils/veille.html`.
2. **Vérifier les adresses** de `../../liens-verifies.txt` : `sources:` (15), `structures:` (9).
3. **Points sensibles à confirmer** (recherche de septembre 2026, la fiscalité bouge vite) :
   - plafonds micro 2026 : **203 100 € (vente) / 83 600 € (services)** ;
   - seuils de franchise de TVA : 85 000 / 93 500 € (vente), 37 500 / 41 250 € (services) ;
   - **cotisations micro : passage du taux minoré de 50 % à 25 % au 1er juillet 2026**, à confirmer ;
   - **ACRE : demande à l'URSSAF sous 60 jours depuis le 1er janvier 2026** (ligne `revisions:`) ;
   - **ARE : cumul plafonné à 60 % du reliquat depuis le 1er avril 2025** ; **ARCE = 60 %** en 2 fois ;
   - CAPE : jusqu'à 36 mois ; contribution CAE 8-15 % du chiffre d'affaires ;
   - **plafond de revenu fiscal du versement libératoire** : la collecte donne « environ 29 315 €
     par part pour 2024 », un chiffre déjà daté à la rédaction (septembre 2026) et jamais repris
     dans la fiche `creer-regime-micro-au-quotidien` (volontairement, faute d'être à jour) : à
     revérifier avant publication.
   - `creer-s-installer-en-agriculture` (ajoutée le 2026-09-08) : **DNJA nom et âge (18-55 ans,
     jeunes 18-40 / nouveaux 41-54) confirmés le 2026-09-08** sur la page DNJA du guide des aides
     NA (`region-na-dnja`) ; **les montants par zone (plaine / défavorisée / montagne) et les
     modulations (hors cadre familial, bio) NE SONT PAS repris dans la fiche, à confirmer** ;
     la « capacité professionnelle agricole » admet aussi la voie diplôme non agricole niveau 4
     plus 24 mois d'expérience agricole (repris dans le lexique de la fiche) ; PAIT = « Point
     Accueil Installation Transmission », terme de Nouvelle-Aquitaine (ailleurs : PAI).
     **Seule fiche du corpus en `territoire: region`** (décision Denis 2026-09-08) : l'aide à
     l'installation, cœur de la fiche, est régionale (DNJA = Région + FEADER). Le champ
     `territoire` n'est encore lu nulle part dans `index.js` : la bascule est un marqueur, sans
     effet d'affichage aujourd'hui.

## Les 7 fiches

| id | titre |
|---|---|
| `creer-micro-entreprise-ou-societe` | Micro-entreprise ou société : comment choisir ? |
| `creer-cooperative-activite-emploi` | La coopérative d'activité et d'emploi : tester en gardant un statut de salarié |
| `creer-aides-a-la-creation` | Créer en gardant un filet : ACRE, ARE, ARCE, RSA |
| `creer-se-faire-accompagner` | Se faire accompagner et financer son projet (chambres, BGE, ADIE, Initiative France, France Active) |
| `creer-premieres-demarches` | Les premières démarches : le guichet unique, l'immatriculation, le SIRET |
| `creer-regime-micro-au-quotidien` | Le régime micro-entrepreneur au quotidien : chiffre d'affaires, cotisations, plafonds |
| `creer-s-installer-en-agriculture` | S'installer en agriculture : créer ou reprendre une exploitation (ajoutée le 2026-09-08) |

## Recoupements

- Le microcrédit personnel accompagné est détaillé au rayon Budget (`budget-microcredit-personnel`).
- Les réunions d'information et ateliers créateurs sont des **événements** : page des événements
  locale, pas une fiche (décision 13).
- La coopérative d'activité et d'emploi comme structure : « Près de chez moi » (pour le 24, Coop'Alpha
  et les autres CAE de Nouvelle-Aquitaine, à vérifier au build).

## Section « à qui s'adresser »

`creer.collecte.md` : chambre de métiers et de l'artisanat 24, CCI 24, BGE Périgord, ADIE
Nouvelle-Aquitaine, Initiative Périgord, France Active Nouvelle-Aquitaine, coopératives d'activité et
d'emploi de Dordogne, France Travail créateur 24.
