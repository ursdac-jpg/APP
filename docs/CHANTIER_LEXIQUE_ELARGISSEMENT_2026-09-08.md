# Chantier : élargir le Lexique au cadre de vie autour de l'emploi

> **TERMINÉ le 2026-09-09.** Les 18 lots sont intégrés : `data/lexique.js` passe de
> 162 à **318 fiches** et de 18 à **36 collections / parcours**. `checkLexique`
> 0 erreur / 0 avertissement à chaque lot, `npm test` 780, test navigateur clair +
> sombre (recherche, fiche, comparatif, collection) à chaque lot. Commits
> `3aead85` → `34a3c63`. Suite : entretien par la veille (`VEILLE_PROMPTS.md`
> §5quater, inventaire `node scripts/checkLexique.js --termes`).
>
> Ouvert le 2026-09-08. **Décision de Denis** : tous les termes relevés dans
> `docs/LEXIQUE_CANDIDATS_MODULES_VEILLE_2026-09-08.md` (sections B, C, D, E,
> validées en bloc) qui ne sont pas encore dans `data/lexique.js` deviennent des
> fiches, **au même format exact** que l'existant. On crée les familles
> (collections / parcours) qui manquent et on ajoute les termes de liaison
> nécessaires au maillage.
>
> Base de tri et verdicts : `docs/LEXIQUE_CANDIDATS_MODULES_VEILLE_2026-09-08.md`.
> Doctrine : `docs/DOCTRINE_LEXIQUE.md`. Modèle de champs :
> `docs/MAQUETTE_LEXIQUE.md` §3. Contrôle : `node scripts/checkLexique.js`
> (0 erreur ET 0 avertissement) + `npm test` + test navigateur clair/sombre.

---

## Fondement doctrinal (à garder en tête à chaque fiche)

- **Principe 1** : concept stable, **jamais** de montant, de durée, de condition ni
  de procédure susceptible d'évoluer. Un dispositif défini par un barème est écrit
  au niveau du **principe** (« une allocation qui remplace une partie du revenu quand
  on est au chômage »), le barème restant dans la fiche datée de « Comprendre le
  cadre ».
- **Principe 6 + clarification du 2026-08-17** : chaque terme retenu ici **apparaît
  déjà dans une fiche d'un module en production** (« Comprendre le cadre »,
  « Comprendre les chiffres »). Le besoin est donc observé, pas anticipé — ce n'est
  pas une campagne de couverture à vide.
- **Principe 4** : expliquer un **pourquoi**, jamais un **comment se conformer**.
- **Principe 7** : chaque fiche ouvre vers au moins un prolongement (`relations`).
- **Principe 5** : une seule définition pour tous les publics.

---

## Coordination avec l'autre chantier Lexique

**Tranché par Denis le 2026-09-08 : séquentiel, ce chantier commence maintenant.**
L'autre compte travaille « Les compétences » **en maquette uniquement** (aucune
écriture dans `data/lexique.js`) ; il reprendra l'intégration après. Ce chantier a
donc `data/lexique.js` pour lui : écriture directe sur `master`, lot par lot.

Le trio **clause sociale** est déjà en place (`clause-sociale`,
`facilitateur-clause-sociale`, `maitre-ouvrage-ou-maitre-oeuvre`, ajoutés en
`9f40639`) : le lot 18 les prolonge sans les réécrire.

---

## Méthode par lot

1 lot = 1 rayon (ou 1 thème). Pour chaque lot :

1. Rédiger les entrées `LEXIQUE_FICHES` (format exact de l'existant : `id`, `titre`,
   `titreDeTri`, `type` (`terme` / `notion`), `gabarit: 'comparatif'` si c'est une
   paire, `univers`, `registres`, `variantesRecherche`, `corps`, `relations`).
2. Rédiger les comparatifs (`X ou Y ?`) prévus au lot.
3. Câbler les `relations` **dans les deux sens** avec les fiches existantes visées
   (plafond 3 par fiche : si une fiche cible est pleine, choisir le renvoi le plus
   utile).
4. Ajouter / compléter la ou les **collections** du lot dans `LEXIQUE_COLLECTIONS`.
5. Secondes lectures (`LEXIQUE_SECOND_NIVEAU`) **seulement** si les 3 conditions
   éditoriales sont réunies (cf. `modules/lexique/ARCHITECTURE_TECHNIQUE.md`) — pas
   systématique.
6. Brancher la recherche : `variantesRecherche` sur chaque fiche (barre d'accueil +
   Lexique héritent automatiquement).
7. `node scripts/checkLexique.js` (0 / 0) + `npm test` + test navigateur (recherche,
   affichage fiche, collection, clair + sombre).
8. Commit `master` : `Lexique : lot <rayon> (<n> fiches)`.
9. Mettre à jour la case du lot ci-dessous + cocher les termes dans
   `LEXIQUE_CANDIDATS_MODULES_VEILLE_2026-09-08.md`.

---

## Nouvelles familles (collections / parcours) à créer

| id proposé | titre | mode | lots concernés |
|---|---|---|---|
| `collection-droits-sociaux` | Comprendre ses droits sociaux | collection | 1 |
| `collection-budget-dettes` | Budget, dettes et surendettement | collection | 2 |
| `collection-se-loger` | Se loger quand c'est difficile | collection | 3 |
| `collection-faire-valoir-droits` | Faire valoir ses droits | collection | 4 |
| `parcours-creer-activite` | Créer son activité | parcours | 5 |
| `collection-handicap-emploi` | Comprendre le handicap et l'emploi | collection | 6 |
| `collection-jeunes-16-25` | Les repères des 16-25 ans | collection | 7 |
| `collection-venir-de-l-etranger` | Travailler en venant de l'étranger | collection | 8 |
| `collection-sortie-detention` | Emploi et sortie de détention | collection | 9 |
| `parcours-preparer-retraite` | Travailler après 50 ans, préparer sa retraite | parcours | 10 |
| `collection-mobilite-quotidien` | Se déplacer pour travailler | collection | 11 |
| `collection-lire-les-chiffres` | Lire les chiffres de l'emploi | collection | 12 |
| `collection-commande-publique-insertion` | Comprendre l'insertion par la commande publique | collection | 18 |

`surendettement`, `hebergement-urgence`, `aide-a-la-mobilite`, `fle`, `rqth`,
`cap-emploi`, `mission-locale`, `service-civique`, les 4 fiches « travail
indépendant » : fiches existantes qui rejoindront ces collections.

---

## Les lots

### Lot 1 — Droits sociaux  (collection `collection-droits-sociaux`)

Fiches (principe 1 : concept, sans barème) :
`rsa` · `prime-activite` · `are` *(existe — vérifier rattachement)* · `aah` ·
`ass` (allocation de solidarité spécifique) · `aides-au-logement` (APL / ALS / ALF,
une seule fiche) · `css` (complémentaire santé solidaire) · `caf` *(existe)* ·
`msa` · `ccas` · `france-services` · `non-recours` (notion) · `quotient-familial` ·
`plafond-de-ressources` · `reste-a-vivre` (notion) · `declaration-de-ressources`
(concept, pas la procédure trimestrielle).

Comparatifs : `rsa-ou-prime-activite` · `are-ou-ass`.

Liaisons : `france-travail`, `frein-emploi`, `assistante-sociale`, `surendettement`,
`cip`.

### Lot 2 — Budget, dettes, surendettement  (`collection-budget-dettes`)

`surendettement` *(existe, pivot)* · `commission-de-surendettement` ·
`plan-conventionnel-de-redressement` · `mesures-imposees` ·
`retablissement-personnel` · `ficp` · `droit-au-compte` ·
`services-bancaires-de-base` · `saisie-sur-salaire` (avec `fraction-insaisissable`
dans le corps) · `point-conseil-budget` · `microcredit-personnel` ·
`epicerie-sociale` · `bonne-foi` (notion) · `radiation` (de la liste France Travail).

Comparatifs : `plan-conventionnel-ou-mesures-imposees` (les 3 issues, gabarit
comparatif étendu) · `microcredit-personnel-ou-professionnel`.

Liaisons : `surendettement`, `assistante-sociale`, `prfalse`… → `france-travail`,
`are`, `frein-emploi`.

### Lot 3 — Se loger quand c'est difficile  (`collection-se-loger`)

`dalo` · `hebergement-urgence` *(existe)* · `siao-115` · `treve-hivernale` ·
`fsl` (fonds de solidarité pour le logement) · `visale` · `intermediation-locative`
· `pension-de-famille` · `foyer-jeunes-travailleurs` · `accueil-de-jour` ·
`domiciliation` (transverse justice / banque / logement) · `plafond-de-ressources`
*(mutualisé lot 1)*.

Comparatifs : `hebergement-ou-logement-accompagne`.

Liaisons : `hebergement-urgence`, `assistante-sociale`, `aides-au-logement` (lot 1),
`frein-emploi`.

### Lot 4 — Faire valoir ses droits  (`collection-faire-valoir-droits`)

`conseil-de-prud-hommes` · `inspection-du-travail` · `defenseur-des-droits` ·
`aide-juridictionnelle` (avec bureau d'AJ dans le corps) · `point-justice` ·
`recours-amiable` (RAPO, transverse) · `discrimination` (au sens large : les
critères ; distinct de `discrimination-embauche` existant) · `prescription`
*(existe)* · `cse` *(existe)*.

Comparatifs : `recours-amiable-ou-contentieux` · `discrimination-ou-difference-de-traitement`.

Liaisons : `discrimination-embauche`, `cse`, `medecine-travail`, `licenciement`,
`rupture-conventionnelle`.

### Lot 5 — Créer son activité  (parcours `parcours-creer-activite`)

`micro-entreprise` *(→ vérifier renvoi `auto-entrepreneur`, sinon fiche courte
« micro-entreprise = auto-entrepreneur »)* · `cae` (coopérative d'activité et
d'emploi) · `pret-d-honneur` · `microcredit-professionnel` ·
`guichet-unique-entreprises` · `siren-siret` (comparatif) · `travailleur-non-salarie`
· `msa` *(mutualisé lot 1)* · `pait` *(existe)* · `bprea` *(existe)* · `dnja`
*(existe)*.

Comparatifs : `siren-ou-siret` · `entreprise-individuelle-ou-societe` ·
`salarie-ou-travailleur-non-salarie`.

Liaisons : `auto-entrepreneur`, `portage-salarial`, `profession-liberale`,
`reconversion`, `cep`.

### Lot 6 — Handicap et emploi  (`collection-handicap-emploi`)

`mdph` · `agefiph` (+ FIPHFP dans le corps) · `oeth` (obligation d'emploi, les 6 %)
· `esat` · `entreprise-adaptee` · `emploi-accompagne` · `reclassement` ·
`visite-de-reprise` · `rqth` *(existe, pivot)* · `cap-emploi` *(existe)* ·
`amenagement-poste` *(existe)*.

Comparatifs : `milieu-ordinaire-ou-milieu-protege` · `rqth-ou-oeth`
*(distinguer le droit de la personne et l'obligation de l'entreprise)*.

Liaisons : `rqth`, `rqth-ou-invalidite`, `aptitude-ou-inaptitude`, `cap-emploi`,
`medecine-travail`, `maintien-emploi`.

### Lot 7 — Repères des 16-25 ans  (`collection-jeunes-16-25`)

`cfa` · `ecole-2e-chance` · `epide` · `ecole-de-production` · `obligation-de-formation`
· `psad` (plateforme de suivi et d'appui aux décrocheurs) · `mission-locale`
*(existe)* · `cej` *(existe)* · `service-civique` *(existe)* · `alternance`
*(existe)*.

Comparatifs : `apprentissage-ou-professionnalisation` · `ecole-2e-chance-ou-epide`.

Liaisons : `alternance`, `mission-locale`, `cej`, `orientation`, `frein-emploi`.

### Lot 8 — Travailler en venant de l'étranger  (`collection-venir-de-l-etranger`)

`ofii` · `ofpra` · `protection-subsidiaire` · `contrat-integration-republicaine` ·
`autorisation-de-travail` · `metier-en-tension` *(mutualisé lot 12)* ·
`primo-arrivant` · `attestation-de-comparabilite` (reconnaissance des diplômes) ·
`titre-de-sejour` (concept transverse, sans lister les types).

Comparatifs : `refugie-ou-protection-subsidiaire` · `titre-de-sejour-ou-autorisation-de-travail`.

Liaisons : `fle`, `enic-naric` *(à créer ? sinon dans le corps)*, `metier-en-tension`,
`france-travail`.

### Lot 9 — Emploi et sortie de détention  (`collection-sortie-detention`)

`spip` · `milieu-ouvert-milieu-ferme` (comparatif) · `amenagement-de-peine`
(bracelet, semi-liberté, libération sous contrainte — un seul concept) ·
`bulletin-n-3` (extrait de casier demandé par un employeur) · `domiciliation`
*(mutualisé lot 3)* · `casier-judiciaire` *(existe)*.

Comparatifs : `bulletin-2-ou-bulletin-3` · `milieu-ouvert-ou-milieu-ferme`.

Liaisons : `casier-judiciaire`, `frein-emploi`, `iae`, `cip`.

### Lot 10 — Après 50 ans, préparer sa retraite  (parcours `parcours-preparer-retraite`)

`cumul-emploi-retraite` (intégral / plafonné, un concept) · `retraite-progressive`
· `releve-de-carriere` · `entretien-information-retraite` ·
`mise-a-la-retraite` (par l'employeur) · `contrat-valorisation-experience`
*(existe)*.

Comparatifs : `depart-volontaire-ou-mise-a-la-retraite` ·
`cumul-integral-ou-cumul-plafonne`.

Liaisons : `contrat-valorisation-experience`, `evolution-professionnelle`,
`amenagement-poste`, `temps-partiel`.

### Lot 11 — Se déplacer pour travailler  (`collection-mobilite-quotidien`)

`garage-solidaire` · `auto-ecole-sociale` · `plateforme-mobilite` ·
`transport-a-la-demande` · `permis-points` (perte, stage de récupération, visite
médicale — un concept) · `aide-a-la-mobilite` *(existe, pivot)*.

Comparatifs : `permis-suspendu-ou-annule`.

Liaisons : `aide-a-la-mobilite`, `frein-emploi`, `plan-action`.

### Lot 12 — Lire les chiffres de l'emploi  (`collection-lire-les-chiffres`)

`demandeur-emploi-categories` (A, B, C : ce que veulent dire les catégories) ·
`chomage-au-sens-du-bit` · `demandeur-emploi-longue-duree` ·
`besoins-en-main-d-oeuvre` (BMO) · `metier-en-tension` · `neet` ·
`zone-d-emploi` *(→ renvoi `bassin-emploi`)* · `economie-presentielle` (notion).

Comparatifs : `inscrit-a-france-travail-ou-chomeur-bit` ·
`metier-en-tension-ou-metier-qui-recrute`.

Liaisons : `bassin-emploi`, `france-travail`, `frein-emploi`, `projet-professionnel`.

### Lot 13 — Garde d'enfant (repères stables uniquement)

`mam` (maison d'assistants maternels) · `relais-petite-enfance` ·
`creche-avip` · `aripa` (recouvrement des pensions alimentaires).

Liaisons : `aides-garde-enfants` *(existe)*, `frein-emploi`, `assistante-sociale`.

### Lot 14 — Contrats et fin de contrat (compléments IAE et délais)

`cddi` (CDD d'insertion) · `cdd-tremplin` · `prime-de-precarite`
(indemnité de fin de mission / de fin de CDD, un concept) · `contrat-saisonnier` ·
`entretien-prealable` · `delais-qui-protegent` (prévenance, rétractation,
réflexion — un concept) · `portabilite-mutuelle` · `demission-legitime`.

Comparatifs : `cdd-classique-ou-cdd-d-insertion` · `prime-de-precarite-ou-indemnite-de-licenciement`.

Liaisons : `cdd`, `interim`, `iae`, `licenciement`, `solde-tout-compte`,
`are`, `demission`.

### Lot 15 — Français et savoirs de base

`competences-de-base` · `clea` · `cecrl` (échelle A1-C2, avec « niveau A2 » dans
le corps) · `diplomes-de-francais` (DELF / DILF / TCF, un concept) ·
`atelier-sociolinguistique` · `fle` *(existe, pivot)*.

Comparatifs : `illettrisme-ou-illectronisme` *(→ vérifier s'il existe déjà)* ·
`alphabetisation-ou-fle`.

Liaisons : `fle`, `illettrisme`, `illectronisme`, `qualification`.

### Lot 16 — Accompagnement (compléments loi plein emploi)

`contrat-d-engagement` · `referent-unique` · `accompagnement-global` ·
`personnes-invisibles` (notion) · `orientation` *(existe)* ·
`offre-raisonnable-d-emploi` (concept, sans les seuils).

Liaisons : `actualisation`, `diagnostic-partage`, `france-travail`, `frein-emploi`,
`cip`, `reseau-pour-emploi`.

### Lot 18 — Insertion par la commande publique  (`collection-commande-publique-insertion`)

> Demande Denis 2026-09-08 : prolonger le trio « clause sociale » (déjà en place).
> Domaine explicitement utile aux CIP et à ses collègues, pas seulement au public
> bénéficiaire.

`marche-public` · `commande-publique` · `acheteur-public` · `heures-d-insertion`
(à promouvoir depuis le corps de `clause-sociale`) · `marche-reserve` (aux SIAE et
au secteur du travail protégé) · `sous-traitance` · `co-traitance` · `allotissement`
· `mieux-disant` (le choix ne se réduit pas au prix) · `clause-sociale` *(existe)* ·
`facilitateur-clause-sociale` *(existe)* · `maitre-ouvrage-ou-maitre-oeuvre` *(existe)*.

Comparatifs : `sous-traitance-ou-co-traitance` · `moins-disant-ou-mieux-disant` ·
`clause-d-execution-ou-critere-d-attribution` (les deux façons d'inscrire le social
dans un marché).

Liaisons : `clause-sociale`, `facilitateur-clause-sociale`, `iae`, `plie`,
`maitre-ouvrage-ou-maitre-oeuvre`.

### Lot 17 — Suggestions transverses (section D du tri)

`non-recours` *(mutualisé lot 1)* · `pair-aidance` · `secret-professionnel` ·
`personne-de-confiance` · `tiers-de-confiance-numerique` ·
`reste-a-vivre` *(mutualisé lot 1)* · `quotient-familial` *(mutualisé lot 1)*.

Rattachements : `groupe-de-pairs`, `assistante-sociale`, `franceconnect`,
`co-construction`.

---

## Suivi des lots

| Lot | Rayon / thème | Fiches | Collection | État |
|---|---|---|---|---|
| 1 | Droits sociaux | 16 (14 termes + 2 comparatifs) | `collection-droits-sociaux` | FAIT (commit) |
| 2 | Budget, dettes | 14 (13 termes + 1 comparatif) | `collection-budget-dettes` | FAIT (commit) |
| 3 | Se loger | 11 (10 termes + 1 comparatif) | `collection-se-loger` | FAIT (commit) |
| 4 | Faire valoir ses droits | 9 (7 termes + 2 comparatifs) | `collection-faire-valoir-droits` | FAIT (commit) |
| 5 | Créer son activité | 9 (5 termes + 4 comparatifs) + variantes auto-entrepreneur | `parcours-creer-activite` | FAIT (commit) |
| 6 | Handicap et emploi | 10 (8 termes + 2 comparatifs) | `collection-handicap-emploi` | FAIT (commit) |
| 7 | Jeunes 16-25 | 9 (7 termes + 2 comparatifs) | `collection-jeunes-16-25` | FAIT (commit) |
| 8 | Venir de l'étranger | 10 (8 termes + 2 comparatifs) | `collection-venir-de-l-etranger` | FAIT (commit) |
| 9 | Sortie de détention | 5 (3 termes + 2 comparatifs) | `collection-sortie-detention` | FAIT (commit) |
| 10 | Préparer sa retraite | 7 (5 termes + 2 comparatifs) | `parcours-preparer-retraite` | FAIT (commit) |
| 11 | Mobilité au quotidien | 6 (5 termes + 1 comparatif) | `collection-mobilite-quotidien` | FAIT (commit) |
| 12 | Lire les chiffres | 10 (8 termes + 2 comparatifs) | `collection-lire-les-chiffres` | FAIT (commit) |
| 13 | Garde d'enfant | 4 termes | `collection-garde-enfant` (nouvelle) | FAIT (commit) |
| 14 | Contrats / fin de contrat | 10 (8 termes + 2 comparatifs) | `collection-cdd-fin-de-contrat` (nouvelle) | FAIT (commit) |
| 15 | Français, savoirs de base | 7 (5 termes + 2 comparatifs) | `collection-savoirs-de-base` (nouvelle) | FAIT (commit) |
| 16 | Accompagnement (compléments) | 5 termes | `collection-accompagnement-plein-emploi` (nouvelle) | FAIT (commit) |
| 17 | Suggestions transverses | 4 termes | `collection-relation-accompagnement` (nouvelle) | FAIT (commit) |
| 18 | Insertion par la commande publique | 10 (7 termes + 3 comparatifs) | `collection-commande-publique-insertion` | FAIT (commit) |

**Total indicatif : ~155 fiches neuves + ~33 comparatifs + 13 collections.**
Chantier long, mené lot par lot, chaque lot vérifié et commité avant le suivant.

---

## Ordre proposé

Priorité aux trous les plus visibles pour le public cible :
**1 (droits sociaux) → 4 (faire valoir ses droits) → 3 (se loger) → 2 (budget) →
6 (handicap) → 12 (lire les chiffres)**, puis le reste dans l'ordre du tableau.
