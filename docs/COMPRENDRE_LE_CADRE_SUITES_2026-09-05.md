# Comprendre le cadre : ce qui reste après la migration des 14 rayons

> **Mise à jour 2026-09-06.** Les 14 rayons ont été vérifiés sur les sources officielles par Claude
> (sous autorisation explicite de Denis, mode automatique), corrigés et migrés vers
> `modules/comprendre-le-cadre/contenu/`. Les packets `VERIF_<rayon>_2026-09-05.md` ont été supprimés
> à la migration ; le résultat de chaque vérification est repris dans le message du commit du rayon
> (`git log --grep "verifie et mis en ligne"`).
>
> Ce document garde ce qui **traverse plusieurs rayons**, les **décisions transverses** déjà prises,
> et surtout la **liste des suites** : fiches recommandées et points à finaliser par Denis
> (§ 3 et suivants). La vérification factuelle que Claude n'a pas pu faire (sites qui bloquent les
> robots) est listée par rayon dans les messages de commit et récapitulée au § 4.

---

## 1. Corrections déjà appliquées (committées)

| Rayon | Correction | Commit |
|---|---|---|
| Budget | durées FICP unifiées entre `budget-surendettement` et `budget-fichage` (le matériau en portait 3 versions) | 3f2defa |
| Budget | dettes non effaçables complétées, durée de suspension ajoutée, carte à autorisation systématique, aides France Travail remises | 557fca1 |
| Budget | tags : `interdit bancaire`, `ouvrir un compte`, `Secours populaire`, `Croix-Rouge` | 0a2032d |
| Accompagnement | dispenses d'activité harmonisées entre `contrat-d-engagement` et `rsa` | 1e7802c |
| Mobilité | « mise au rebut » aligné entre corps et lexique | 3230247 |
| Garde | crèche AVIP de Bergerac retirée du corps de fiche (LECONS 9.16) | 94fcfc8 |

**Toutes ces corrections sont marquées « à confirmer sur la source » dans les packets** : ce sont
les meilleures formulations possibles sans accès direct à Légifrance / service-public.

---

## 2. Décisions à prendre (transverses)

### 2.1 Les heures d'activité du RSA -> TRANCHÉ le 2026-09-05 : vague partout

Décision Denis : on ne cite plus de nombre d'heures dans les fiches. Le corps de
`accompagnement-contrat-d-engagement` et de `accompagnement-rsa` a été reformulé (« plusieurs heures
par semaine, fixé avec vous dans le contrat »), cohérent avec `budget-rsa-prime-activite-reprise-emploi`
qui était déjà vague. Le **CEJ** (rayon Jeunes) garde « 15 à 20 h » : c'est la valeur par
construction du dispositif, pas le débat sur le RSA.

### 2.2 Le CIR décrit dans deux rayons -> TRANCHÉ le 2026-09-05 : on garde les deux, chacun dans sa voie

Les deux fiches sont légitimes à leur point d'entrée (« Venir de l'étranger » : qu'est-ce que je
signe ? ; « Apprendre le français » : comment j'obtiens des cours gratuits ?). Aucune contradiction
n'a été trouvée entre elles. Édité le 2026-09-05 pour que chacune reste dans sa voie :
- `etranger-contrat-integration-republicaine` : le contrat dans son ensemble ; sur les cours de
  français, une phrase brève + renvoi à la fiche du rayon « Apprendre le français ».
- `francais-cours-de-l-ofii-cir` : les cours de français en détail ; sur le contrat et ses
  engagements, une phrase brève + renvoi au rayon « Venir de l'étranger ».

### 2.3 Le financement d'une formation -> TRANCHÉ le 2026-09-05 : règle posée, exécution à la création de la fiche

Règle : la future fiche `former-financer-sa-formation-demandeur-emploi` (§ 3) **porte le traitement
général** (aide individuelle à la formation, actions de formation conventionnées, programme régional,
rémunération de formation de France Travail). À sa création, `francais-se-former-pour-le-travail`
**réduit sa partie financement** à ce qui est propre au français (CPF pour le FLE certifiant,
participation de 150 €) et renvoie vers la fiche générale pour le reste. Noté dans les README des
rayons « Se former » et « Apprendre le français ».

### 2.4 Le champ `frein:` -> TRANCHÉ le 2026-09-05 : on ne touche à rien, la règle est écrite

Le champ est lu par le module mais **consommé nulle part** (Freins et Comprendre le cadre restent
deux systèmes séparés, décision actée). Harmoniser les ~30 valeurs maintenant serait du churn pour
zéro effet et risquerait de ne pas coller à la sémantique du branchement futur. **On laisse les
valeurs telles quelles.** Règle à appliquer d'un coup au moment du branchement :
> `frein: true` = la fiche traite un **obstacle concret** à trouver ou garder un emploi que la
> personne doit lever (argent, transport, logement, garde d'enfant, langue, santé, papiers, blocage
> juridique). `frein: false` = la fiche explique un **mécanisme, un droit ou une structure
> d'accompagnement**, sans être elle-même un obstacle.

---

## 3. Fiches manquantes recommandées

**Les 8 ont été écrites et mises en ligne le 2026-09-06** (recherche sur service-public.fr + sources
spécialisées, un commit « Comprendre le cadre : fiches recommandees … »). Détail :

| Fiche | Rayon | Source datée |
|---|---|---|
| `budget-saisie-sur-salaire` | Budget (8 fiches) | service-public F115 ; part insaisissable = RSA personne seule, procédure par commissaire de justice depuis juillet 2025 |
| `emploi-licenciement` | Emploi (8 fiches) | service-public F2839 + F987 ; entretien préalable, indemnité 1/4 puis 1/3, chômage ouvert, prud'hommes 12 mois |
| `emploi-demission` | Emploi (8 fiches) | service-public F2883 ; préavis, pas d'ARE sauf cas légitimes, réexamen après 121 jours |
| `former-financer-sa-formation-demandeur-emploi` | Se former (7 fiches) | service-public F3147 ; AFC, programme régional, AIF, CPF, AREF / rémunération de formation |
| `jeunes-contrat-apprentissage` | Moins de 26 ans (7 fiches) | service-public F2918 ; 16-29 ans, % du SMIC, salarié, rupture libre 45 jours |
| `logement-expulsion` | Logement (8 fiches) | service-public F31272 ; commandement de payer, délais du juge jusqu'à 3 ans, trêve hivernale |
| `logement-demande-de-logement-social` | Logement (8 fiches) | service-public F869 ; numéro unique, plafonds, renouvellement annuel obligatoire |
| `handicap-aah-et-travail` | Handicap (7 fiches) | service-public F12242 ; taux d'incapacité, montant max ~1 040 euros, déconjugalisation d'octobre 2023, abattement sur les revenus d'activité |

`francais-se-former-pour-le-travail` renvoie désormais à `former-financer-sa-formation-demandeur-emploi`
pour le financement général (décision § 2.3).

### Fiches ajoutées le 2026-09-08 (recherche « dispositifs et fondations », demande Denis)

Recherche croisée + liens vérifiés au navigateur. Un premier commit (`d418529`) puis
un commit de correction après relecture. `npm test` 780 verts.

| Fiche | Rayon | Sources datées |
|---|---|---|
| `creer-s-installer-en-agriculture` | Créer son activité (7 fiches) | `chambres-agriculture-sinstaller`, `chambre-agriculture-dordogne`, `onisep-bprea`, `region-na-dnja` (2026-09-08) |
| `former-fondation-deuxieme-chance` | Se former (9 fiches) | `fondation-deuxieme-chance`, `fondation-deuxieme-chance-etre-aide` (2026-09-08) |
| `former-aides-moins-connues-financer-formation` | Se former (9 fiches) | `region-na-bourses-sanitaires-sociales`, `institut-engagement` (2026-09-08), `agefiph-aides-financieres` (2026-09-05) |

**Abandonnée à la relecture** : `emploi-clause-sociale-insertion` faisait doublon avec
`accompagnement-clause-sociale-plie` (déjà en ligne). L'apport (clause sociale obligatoire au
22 août 2026, loi Climat et résilience) a été reporté dans cette fiche existante (corps +
`revisions`). Retiré aussi : le « fonds social formation » de la Région dans la fiche « aides
moins connues » (pas de page officielle stable, slug en 404).

Veille : `outils/veille.html`, `SITES_BLOQUES` reçoit `region-na-aides` (guide des
aides NA, en balayage trimestriel) et `onisep`. Matière première :
`docs/NOTES_RESSOURCES_2026-09-08.md`.

**Lexique** : 8 entrées (ERIP, PAIT, BPREA, DNJA, Fondation 2ème Chance, clause
sociale, facilitateur, comparatif maître d'ouvrage / maître d'œuvre) + 8 secondes
lectures + 1 ajout réciproque sur `reconversion` : **intégrées à `data/lexique.js`
le 2026-09-08, commit `9f40639`** (checkLexique aucune erreur ni avertissement,
npm test 780, vérifié au navigateur). Détail : `docs/LEXIQUE_ENTREES_A_INTEGRER_2026-09-08.md`.

**Reste pour Denis** : relire les 3 fiches « Comprendre le cadre » et les 8 entrées
Lexique désormais en ligne.

Décisions tranchées le 2026-09-06 :
- `garde` : **paragraphe ajouté** à `garde-trouver-un-mode-de-garde` (accueil périscolaire, accueil
  de loisirs du mercredi et des vacances, tarif au quotient familial, mairie / CCAS / aide aux
  temps libres de la CAF).
- `etranger` : **fiche `etranger-regularisation-par-le-travail` créée** (Venir de l'étranger passe à
  7 fiches). Ton prudent, décision Denis « option 2 » : les deux voies présentées comme possibles
  mais jamais automatiques (métiers en tension L. 435-4, expérimentation jusqu'au 31 décembre 2026,
  demande individuelle sans l'employeur ; admission exceptionnelle L. 435-1, pouvoir discrétionnaire
  du préfet, plus de grille depuis janvier 2025), renvoi vers une permanence d'accès au droit des
  étrangers.

---

## 4. Adresses : état au 2026-09-06

Le fichier maître est `modules/comprendre-le-cadre/liens-verifies.txt`. Une adresse ne devient un
lien cliquable en pied de fiche que si sa 3e colonne porte une date.

> **Liste complète des paquets B et C, groupée par rayon** :
> `docs/CHANTIER_COMPRENDRE_LE_CADRE_ADRESSES.md` (chantier complément, à faire après « Comprendre
> les chiffres » ; paquet C à fondre dans le chantier territoire).

### Fait
- **Pendant la vérification des 14 rayons** : ~50 pages de sources ouvertes et datées ; adresses
  mortes corrigées (F34→F36, F2837→F1704, france-vae.gouv.fr→.fr, alliancevilleemploi.fr→
  ville-emploi.asso.fr, cma-dordogne.fr→artisanat.fr, unhaj.org→habitatjeunes.org,
  covoit.modalis.fr→modalis.fr, cdad-dordogne.justice.fr→justice.fr, caf-reclamation→
  service-public F2474, +2 URL francetravail accompagnement) ; portées `france-vae-point-relais-conseil`
  et `covoit-modalis` passées en `region`.
- **Paquet A (2026-09-06, commit 68aabfc)** : 25 pages de sources supplémentaires ouvertes et
  datées (service-public.gouv.fr, entreprendre.service-public.gouv.fr, solidarites.gouv.fr,
  securite-routiere.gouv.fr, anlci.gouv.fr, mon-cep.org). Deux pages fausses corrigées :
  `service-public-aide-alimentaire` (pointait sur « Retour en France, chômage ») →
  `solidarites-precarite-alimentaire` ; `service-public-115-siao` + `115-samu-social` (pointaient
  sur la page APL) → page de la DIHAL, clé renommée `dihal-115-siao`.

### Paquet B — pour Denis, au navigateur (~20 adresses)
Sources en pied de fiche sur des sites qui bloquent la lecture automatique : `travail-emploi.gouv.fr`
(CAPTCHA), `francetravail.fr` et `mes-aides.francetravail.fr`, `banque-france.fr`, `caf.fr`,
`immigration.interieur.gouv.fr` et `interieur.gouv.fr`, `education.gouv.fr` / `eduscol` /
`ac-bordeaux.fr`, `actionlogement.fr`, `monenfant.fr`, `legifrance.gouv.fr`, `france-vae.fr`,
`transitionspro.fr`, `france-education-international.fr` (ERR-BOT-403), `info.gouv.fr`,
`economie.gouv.fr`. Elles s'ouvrent normalement dans un vrai navigateur : ouvrir, confirmer, dater
au format `AAAA-MM-JJ`. Procédure notée dans `outils/veille.html` (section « Déposer dans le dépôt »).

### Paquet C — avec le chantier territoire
Les ~90 structures « à qui s'adresser » se datent au moment où on valide leur portée
(24 / région / national) — voir `docs/CHANTIER_TERRITOIRE_REGION_DEPARTEMENT.md`. Quelques-unes
pointent encore vers des sites nationaux là où il faudrait du local (`mission-locale-perigord`,
`adil-dordogne`, `habitat-jeunes-perigord`, `mdph-dordogne`, plusieurs pages `justice.fr`…),
ou vers des domaines morts non repris (`msa-dordogne.fr`, `presanse-aquitaine.org`).

### Recherche d'accueil (fait, commit 004cc12)
Taper « surendettement », « RQTH », « titre de séjour »… dans la barre de recherche de l'accueil
renvoie maintenant vers le rayon concerné (groupe « Comprendre le cadre »). V1 : le clic ouvre le
module à son accueil, pas le rayon directement (lien profond = petite modif de `js/app.js`, plus
tard).

---

## 5. Les changements 2024-2026 à vérifier en priorité (par ordre d'importance)

1. **Naturalisation** : niveau B2 + examen civique (40 questions, 80 %) au 1er janvier 2026 (Étranger).
2. **Demandeur d'asile** : délai d'accès au travail (6 mois) modifié par le Pacte européen du 12 juin 2026 ? (Étranger).
3. **Rupture conventionnelle** : durée d'indemnisation chômage spécifique au 1er septembre 2026 (15 / 20,5 mois) (Emploi, ligne `revisions:` jamais confirmée).
4. **CMG emploi direct** : réforme du décret du 30 mai 2025 (calcul aux heures, fin des 15 % de reste à charge), en vigueur au 1er septembre 2025 (Garde).
5. **Cotisations micro** : évolution au 1er juillet 2026 (Créer).
6. **Franchise de TVA** : seuils réellement en vigueur en 2026 (Créer).
7. **ACRE** : demande à l'URSSAF sous 60 jours depuis 2026 (Créer).
8. **Maintien de l'ARE** : plafonné à 60 % du reliquat depuis le 1er avril 2025 (Créer).
9. **Aide au permis B de France Travail** : supprimée au 1er avril 2026 (Mobilité).
10. **Offre AGEFIPH** : révisée au 1er octobre 2025 (Handicap).
11. **Timbre fiscal de 50 €** pour saisir une juridiction civile ou les prud'hommes, au 1er mars 2026 (Juridique).
12. **Libération sous contrainte** : automatique à 3 mois de reliquat, loi de 2023 (Justice).
13. **Participation CPF** : 150 € au 2 avril 2026 (Se former, Apprendre le français).
14. **Bonus écologique** supprimé en juillet 2025, **leasing social** rouvert le 16 juillet 2026 (Mobilité).
15. **FICP** : la formulation unifiée par Claude (5 ans incident / 7 ans surendettement / 5 ans rétablissement personnel) reste à confirmer (Budget).
16. **Attestation employeur** : n'est plus remise en papier au salarié depuis 2024 (Emploi).
17. **Contrat d'emploi pénitentiaire** et ouverture des droits sociaux du détenu travailleur (Justice).

---

## 6. La suite

Rayon par rayon : Denis vérifie, dit « <rayon> vérifié » (avec la liste des corrections ou en les
faisant lui-même), Claude migre `contenu/<rayon>/` vers `modules/comprendre-le-cadre/contenu/<rayon>/`,
teste en navigateur, met en ligne. Les autres rayons restent en écran d'erreur honnête jusqu'à leur
tour. Ordre suggéré : commencer par les rayons **les plus stables** (Justice, Questions juridiques,
Moins de 26 ans) pour avoir vite du contenu en ligne, garder les rayons **les plus mouvants** (Créer,
Étranger, Mobilité) pour quand on a le temps de bien vérifier.
