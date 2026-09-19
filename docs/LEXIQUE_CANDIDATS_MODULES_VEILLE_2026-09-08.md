# Lexique : les mots des modules « Comprendre le cadre » et « Comprendre les chiffres »

> **2026-09-09 : sections B/C/D/E validées en bloc par Denis et INTÉGRÉES.**
> Voir `docs/CHANTIER_LEXIQUE_ELARGISSEMENT_2026-09-08.md` (18 lots, `data/lexique.js`
> passé de 162 à 318 fiches). Ce document reste comme trace du tri.
>
> Créé le 2026-09-08, à la demande de Denis. **Rien n'est décidé, rien n'est rédigé.**
> Objet : passer en revue, terme par terme, le vocabulaire que les deux modules de
> « Se tenir informé » emploient déjà (blocs `lexique:` des fiches + vocabulaire
> statistique), et décider lesquels méritent une fiche dans le **Lexique central**
> (`data/lexique.js`).
>
> Complète, sans le remplacer, le backlog `docs/LEXIQUE_MATIERE_A_INTEGRER.md`
> (du 2026-08-28, antérieur à l'existence de ces deux modules).
>
> **Coordination** : un autre compte Claude travaille en ce moment sur le Lexique
> (worktree actif, `docs/LEXIQUE_ENTREES_A_INTEGRER_2026-09-08.md` intégré en
> `9f40639`, grand sujet « Les compétences » ouvert dans `TACHES_VALIDEES.md`).
> Toute intégration décidée ici doit être coordonnée avec ce chantier pour éviter
> les collisions dans `data/lexique.js`.

---

## Rappel : ce que dit la doctrine (`docs/DOCTRINE_LEXIQUE.md`)

- **Principe 1** : le Lexique explique des **concepts stables**, jamais des règles qui
  peuvent devenir fausses (pas de montant, pas de durée, pas de condition ni de
  procédure susceptible d'évoluer). Un dispositif défini par un barème vit **dans la
  fiche du rayon** (datée, révisée), pas forcément dans le Lexique.
- **Principe 6** : une fiche naît d'un **besoin réel**, jamais d'un effort de
  couverture systématique d'un domaine. Comprendre un rouage de l'écosystème pour
  mieux s'y repérer *est* un besoin réel (clarification du 2026-08-17), y compris
  pour un CIP débutant.
- **Principe 4** : expliquer un **pourquoi**, jamais un **comment se conformer**.

Traduction pour ce tri :
- **[DÉJÀ]** : le concept est déjà dans `data/lexique.js`.
- **[OUI]** : concept stable + besoin réel de compréhension → candidat à une fiche.
- **[DISC]** : à discuter (semi-volatil, très niche, ou recoupe une fiche existante).
- **[FICHE]** : à laisser dans le glossaire local du rayon (dispositif défini par un
  barème / une procédure ; le Lexique le rendrait fragile).

---

## État actuel du Lexique (pour situer)

`node scripts/checkLexique.js` au 2026-09-08 : **162 fiches, 18 collections/parcours,
151 secondes lectures. Aucune erreur, aucun avertissement.**

Répartition des univers : accompagnement-insertion 38 · emploi-recrutement 18 ·
structures-organismes 17 · bulletin-salaire 14 · formation 12 · conditions-travail 12 ·
droit-travail 11 · dispositifs 11 · contrats-statuts-emploi 11 · santé-travail 6 ·
entrepreneuriat 4 · démarches-administratives 4 · RH 3 · organisation-travail 1.

**Lecture** : le corpus est déjà nourri et cohérent, mais il est centré sur
**emploi / insertion / contrat / formation / paie**. Les domaines couverts par
« Comprendre le cadre » — **droits sociaux, budget et dettes, logement, justice,
étranger, agriculture, retraite, garde d'enfant** — sont presque absents du Lexique.
C'est là que se trouve le sentiment de « pas assez complet » : ce n'est pas un manque
de profondeur, c'est un périmètre plus étroit que celui des modules récents.

---

## A. Les 18 collections / parcours actuels

| Collection ou parcours | Type |
|---|---|
| Comprendre l'insertion par l'activité économique | collection |
| Les acteurs de l'insertion professionnelle | collection |
| Comprendre les dispositifs d'accompagnement | collection |
| Comprendre les méthodes d'accompagnement | collection |
| Comprendre le monde de l'entreprise | collection |
| Comprendre le travail indépendant | collection |
| Quand la vie pèse sur le parcours | collection |
| Se faire aider : accompagnements et mises en relation | collection |
| Je prépare un entretien | parcours |
| Comprendre sa fiche de paie | parcours |
| Comprendre un contrat de travail | parcours |
| Comprendre les mots de mon accompagnement | parcours |
| Comprendre sa santé au travail | parcours |
| Mes démarches avec France Travail | parcours |
| Comprendre la formation professionnelle | parcours |
| Comprendre la fin d'un contrat de travail | parcours |
| Construire mon projet professionnel | parcours |
| Comprendre les conditions de travail | parcours |

**Collections qui manquent probablement** (si on décide d'ouvrir le Lexique aux
domaines de « Comprendre le cadre ») :
- **Comprendre ses droits sociaux** (RSA, prime d'activité, ARE, AAH, aides au logement…)
- **Budget, dettes, surendettement** (surendettement est déjà une fiche isolée)
- **Se loger quand c'est difficile** (DALO, trêve hivernale, hébergement d'urgence…)
- **Faire valoir ses droits** (prud'hommes, inspection du travail, Défenseur des droits,
  aide juridictionnelle…)
- **Créer son activité** (micro-entreprise, CAE, prêt d'honneur… — 4 fiches
  « travail indépendant » existent, la collection pourrait s'élargir)
- **Travailler et préparer sa retraite** (cumul emploi-retraite, retraite progressive…)

À décider **après** le tri des termes ci-dessous : une collection ne se crée que si
assez de fiches la peuplent.

---

## B. Termes des fiches « Comprendre le cadre », rayon par rayon

> Format : `terme` — **[verdict]** — courte raison. Verdict = ma proposition, à
> trancher ensemble.

### Rayon « Accompagnement »

- `insertion par l'activité économique` — **[DÉJÀ]** (`iae`)
- `atelier et chantier d'insertion` — **[DÉJÀ]** (`aci`)
- `plan local pour l'insertion et l'emploi` — **[DÉJÀ]** (`plie`)
- `clause sociale d'insertion` — **[DÉJÀ]** (`clause-sociale`)
- `facilitateur de la clause sociale` — **[DÉJÀ]** (`facilitateur-clause-sociale`)
- `diagnostic` — **[DÉJÀ]** (`diagnostic-partage`)
- `orientation` — **[DÉJÀ]** (`orientation`)
- `contrat d'engagement` — **[OUI]** — concept central de la loi plein emploi, stable, remplace le PPAE ; recoupe `actualisation` sans la doublonner.
- `référent unique` / `organisme référent` — **[OUI]** — une seule fiche : « qui pilote mon accompagnement ». Concept stable de la loi plein emploi.
- `accompagnement global` — **[OUI]** — binôme France Travail + travailleur social ; concept stable, souvent cité en entretien.
- `personnes invisibles` — **[OUI]** — notion (les personnes ni en emploi, ni en études, ni suivies) ; utile pour comprendre le « aller vers ».
- `offre raisonnable d'emploi` — **[DISC]** — concept connu mais surtout défini par des seuils (salaire, distance) qui bougent ; à écrire sans chiffres si on la prend.
- `offre de repérage et de remobilisation` — **[DISC]** — c'est O2R, déjà une fiche (`o2r`) ; vérifier que le libellé long y renvoie.
- `Pass IAE` — **[DISC]** — plutôt une pièce de procédure ; peut rester dans la fiche IAE.
- `accompagnement intensif` — **[FICHE]** — recouvre des dispositifs datés (AIJ…).
- `suspension-remobilisation` — **[FICHE]** — mécanisme du barème de sanctions 2025, susceptible d'évoluer.
- `sous-traitance` — **[DISC]** — concept stable et transverse (utile hors clause sociale) ; à voir.

### Rayon « Budget, dettes, droits sociaux »

- `surendettement` — **[DÉJÀ]** (`surendettement`)
- `commission de surendettement` — **[OUI]** — l'instance ; concept stable, complète la fiche `surendettement`.
- `recevabilité` — **[DISC]** — étape de procédure ; peut-être en seconde lecture de `surendettement`.
- `plan conventionnel de redressement` / `mesures imposées` / `rétablissement personnel` — **[OUI]** — les 3 issues du surendettement, concepts stables ; une fiche comparatif possible.
- `FICP` — **[OUI]** — fichier des incidents de crédit ; stable, très mal compris, souvent confondu avec le « fichage Banque de France ».
- `droit au compte` — **[OUI]** — droit stable (toute personne peut obtenir un compte) ; concept, pas procédure.
- `services bancaires de base` — **[DISC]** — lié au droit au compte ; peut-être une seule fiche pour les deux.
- `saisie sur salaire` — **[OUI]** — concept stable et fréquent ; expliquer le principe, pas le barème.
- `fraction insaisissable` — **[DISC]** — à intégrer dans la fiche `saisie sur salaire` plutôt qu'à part.
- `prime d'activité` — **[OUI]** — complément de revenu pour les travailleurs modestes ; concept stable si écrit sans montant. Pilier manquant.
- `point conseil budget` — **[OUI]** — dispositif d'accueil stable et gratuit ; concept « où se faire aider sur son budget ».
- `microcrédit personnel accompagné` — **[OUI]** — concept stable (petit prêt bancaire garanti, avec accompagnement) ; complète `prêt d'honneur`.
- `épicerie sociale et solidaire` — **[OUI]** — concept stable ; le module `data/freins.js` s'en sert déjà.
- `bonne foi` — **[DISC]** — notion juridique transverse (surendettement, prestations) ; utile mais délicate à cadrer.
- `radiation` — **[OUI]** — de la liste France Travail ; concept stable et anxiogène, à expliquer calmement (pourquoi, pas comment l'éviter).
- `secours d'urgence` / `réseau accompagnant` — **[FICHE]** — trop liés au fonctionnement d'un CCAS local.
- `déclaration trimestrielle de ressources` — **[FICHE]** — pièce de procédure.

### Rayon « Créer son activité »

- `micro-entreprise` — **[DÉJÀ / DISC]** — `auto-entrepreneur` existe ; vérifier que « micro-entreprise » y renvoie (même chose depuis 2016).
- `BPREA` / `DNJA` / `PAIT` — **[DÉJÀ]** (ajoutés en `9f40639`)
- `coopérative d'activité et d'emploi` — **[OUI]** — statut d'entrepreneur salarié ; concept stable, cité dans `creer.collecte.md`.
- `prêt d'honneur` — **[OUI]** — prêt à taux zéro à la personne (Adie, Initiative France) ; concept stable.
- `microcrédit professionnel` — **[OUI]** — pendant pro du microcrédit personnel.
- `guichet unique des formalités des entreprises` — **[OUI]** — le point d'entrée unique depuis 2023 ; concept stable.
- `SIREN et SIRET` — **[OUI]** — identifiants stables, mal distingués ; une fiche comparatif.
- `travailleur non salarié` — **[OUI]** — catégorie stable, structure toute la protection sociale de l'indépendant.
- `société` — **[DISC]** — trop large ; peut-être « entreprise individuelle ou société ? » en comparatif.
- `ACRE` / `ARCE` / `maintien de l'ARE` — **[FICHE]** — aides définies par des taux et des plafonds qui changent (déjà noté dans les révisions des fiches).
- `franchise de TVA` / `versement libératoire` — **[FICHE]** — seuils fiscaux, révisés régulièrement.
- `capacité professionnelle agricole` — **[DISC]** — déjà expliquée dans le corps de `bprea` (choix acté le 2026-09-08).
- `contrat d'appui au projet d'entreprise` / `contrat d'entrepreneur salarié associé` — **[DISC]** — à rattacher à la fiche CAE.
- `garantie de prêt` — **[DISC]** — concept bancaire transverse.
- `MSA` — **[OUI]** — régime agricole ; pendant de « France Travail » / « CAF » pour le monde agricole. Déjà listé au backlog.

### Rayon « Travailler : contrats, fin de contrat »

- `période d'essai` — **[DÉJÀ]** (`periode-essai`)
- `rupture conventionnelle` — **[DÉJÀ]** (`rupture-conventionnelle`)
- `reçu pour solde de tout compte` — **[DÉJÀ]** (`solde-tout-compte`)
- `entreprise de travail temporaire` / `d'insertion` — **[DÉJÀ]** (`interim`, `etti`)
- `CDD d'insertion` / `CDD Tremplin` — **[OUI]** — contrats stables propres à l'IAE ; une fiche (ou une paire) manquante à côté de `cdd`.
- `indemnité de fin de mission` / `prime de précarité` — **[OUI]** — une fiche : la prime versée en fin de CDD/intérim ; concept stable (le taux, non).
- `indemnité légale de licenciement` — **[DISC]** — barème → à écrire sans chiffres ou à laisser dans `licenciement`.
- `contrat saisonnier` — **[OUI]** — très présent sur le territoire (tourisme, agriculture) ; concept stable.
- `entretien préalable` — **[OUI]** — étape stable et anxiogène d'une procédure de licenciement ; expliquer ce que c'est.
- `délai de carence` (entre deux CDD) — **[DISC]** — règle chiffrée ; concept explicable sans le chiffre.
- `délai de prévenance` / `délai de rétractation` — **[OUI]** — notions de délai transverses (essai, rupture conventionnelle) ; une fiche « les délais qui protègent ».
- `portabilité de la mutuelle` — **[OUI]** — droit stable, très mal connu (garder sa complémentaire après la fin du contrat).
- `démission légitime` — **[OUI]** — concept stable : les cas où une démission ouvre quand même droit à l'ARE (sans lister les cas, qui bougent).
- `homologation` / `réexamen après quatre mois` / `attestation destinée à France Travail` — **[FICHE]** — pièces de procédure.
- `parcours emploi compétences` — **[FICHE]** — contrat aidé, volume et publics fixés chaque année.

### Rayon « Se former »

- `compte personnel de formation` — **[DÉJÀ]** (`cpf`)
- `conseil en évolution professionnelle` — **[DÉJÀ]** (`cep`)
- `validation des acquis de l'expérience` / `France VAE` — **[DÉJÀ]** (`vae`)
- `POEI` — **[DÉJÀ]** (`poei`) ; `POEC` — **[OUI]** — le pendant collectif, manquant.
- `Transitions Pro` — **[DÉJÀ]** (`transitions-pro`)
- `projet de transition professionnelle` — **[OUI]** — l'ex-« CIF » ; concept stable, financé par Transitions Pro.
- `commission paritaire interprofessionnelle régionale` — **[DISC]** — c'est l'instance de Transitions Pro ; à rattacher.
- `formation certifiante` — **[DÉJÀ / DISC]** — `formation-qualifiante-ou-certifiante` existe ; vérifier le renvoi.
- `rémunération de formation de France Travail` / `salaire moyen de référence` — **[FICHE]** — barèmes.
- `aide individuelle à la formation` / `action de formation conventionnée` — **[FICHE]** — dispositifs de financement, publics et montants annuels.
- `abondement` — **[OUI]** — concept stable (compléter un financement de formation) ; transverse CPF.
- `reste à charge` — **[OUI]** — notion transverse (formation, garde, santé) ; ce qui reste à payer après les aides.
- `bourse sur critères sociaux` — **[DISC]** — surtout étudiante ; hors périmètre principal.
- `parrainage` — **[DÉJÀ]** (`parrainage-vers-l-emploi`) — vérifier le renvoi.
- `opérateur régional` / `projet réel et sérieux` / `recevabilité` (VAE) — **[FICHE]** — vocabulaire de procédure VAE.
- `aide de dernier recours` — **[DISC]** — c'est le principe de la Fondation de la 2ème Chance (fiche existante).

### Rayon « Apprendre le français »

- `FLE` — **[DÉJÀ]** (`fle`)
- `compétences de base` — **[OUI]** — socle stable (lire, écrire, compter, usages du numérique) ; central pour ce public.
- `CléA` — **[OUI]** — certification stable du socle de compétences ; complète `compétences de base`.
- `CECRL` — **[OUI]** — l'échelle A1-C2 ; référence stable, déjà expliquée en glossaire local de la fiche CIR, à promouvoir.
- `niveau A2` — **[DISC]** — sous-cas du CECRL ; à intégrer dans la fiche CECRL plutôt qu'à part.
- `DELF` / `TCF` — **[DISC]** — une fiche « les diplômes et tests de français » (DELF, DILF, TCF) ; concepts stables.
- `atelier sociolinguistique (ASL)` — **[OUI]** — format d'apprentissage stable et de proximité.
- `français à visée professionnelle` — **[DISC]** — nuance à intégrer dans la fiche FLE.
- `OFII` — **[OUI]** — l'établissement qui pilote l'accueil des étrangers ; structure stable (voir rayon Étranger).
- `OEPRE` — **[DISC]** — dispositif « ouvrir l'école aux parents » ; niche.
- `primo-arrivant` — **[OUI]** — catégorie stable, structure l'accès aux droits des étrangers.
- `AIF` — voir « Se former » (**[FICHE]**).

### Rayon « Garde d'enfant »

- `CMG` (complément de libre choix du mode de garde) — **[FICHE]** — barème CAF, réformé en 2025 puis 2027.
- `AGE` (ex-AGEPI) — **[FICHE]** — aide France Travail, montant et conditions annuels.
- `allocation de soutien familial` — **[FICHE]** — prestation CAF chiffrée.
- `Aripa` — **[OUI]** — l'agence de recouvrement des pensions alimentaires ; structure stable, mal connue.
- `MAM` (maison d'assistants maternels) — **[OUI]** — mode de garde stable, concept clair.
- `relais petite enfance` — **[OUI]** — le point info local sur les modes de garde ; structure stable (ex-RAM).
- `crèche AVIP` (à vocation d'insertion professionnelle) — **[OUI]** — concept stable et directement lié à l'emploi.
- `Pajemploi` — **[DISC]** — dispositif de déclaration ; plutôt une pièce de procédure.
- `accueil occasionnel` — **[DISC]** — nuance à intégrer ailleurs.

### Rayon « Handicap et emploi »

- `RQTH` — **[DÉJÀ]** (`rqth`) ; `inaptitude` — **[DÉJÀ]** (`aptitude-ou-inaptitude`)
- `Cap emploi` — **[DÉJÀ]** (`cap-emploi`)
- `MDPH` — **[OUI]** — la maison départementale ; structure pivot, absente du Lexique. Prioritaire.
- `AGEFIPH` — **[OUI]** — le fonds pour l'emploi des personnes handicapées ; structure stable (le FIPHFP en pendant public).
- `obligation d'emploi des travailleurs handicapés` — **[OUI]** — le principe des 6 % ; concept stable et structurant (le taux est ancien et fixe).
- `ESAT` — **[OUI]** — établissement de travail protégé ; concept stable.
- `entreprise adaptée` — **[OUI]** — milieu ordinaire avec majorité de travailleurs handicapés ; concept stable.
- `milieu protégé` / `milieu ordinaire` — **[OUI]** — une fiche comparatif ; structure toute la question.
- `emploi accompagné` — **[OUI]** — dispositif stable depuis 2017 (job coach sans limite de durée) ; déjà au backlog.
- `reclassement` — **[OUI]** — obligation stable de l'employeur après une inaptitude ; concept, pas procédure.
- `visite de reprise` — **[OUI]** — rendez-vous stable avec la médecine du travail après un arrêt long.
- `reconnaissance de la lourdeur du handicap` — **[DISC]** — dispositif fin, montant annuel.
- `abattement sur les revenus d'activité` (AAH) — **[FICHE]** — règle de calcul.
- `appui spécifique` — **[FICHE]** — prestation Agefiph.

### Rayon « Jeunes »

- `mission locale` — **[DÉJÀ]** (`mission-locale`)
- `contrat d'engagement jeune` — **[DÉJÀ]** (`cej`)
- `contrat d'apprentissage` — **[DISC]** — `alternance` existe ; « apprentissage ou professionnalisation ? » serait le vrai manque.
- `centre de formation d'apprentis` — **[OUI]** — structure stable ; où se passe la partie théorique de l'alternance.
- `service civique` — **[DÉJÀ]** (`service-civique`)
- `école de la deuxième chance` — **[OUI]** — structure stable ; déjà au backlog.
- `EPIDE` — **[OUI]** — établissement pour l'insertion (cadre quasi militaire) ; structure stable.
- `école de production` — **[OUI]** — « faire pour apprendre » ; concept pédagogique stable.
- `obligation de formation` (16-18 ans) — **[OUI]** — obligation stable depuis 2020 ; concept clair.
- `prépa-apprentissage` — **[DISC]** — sas vers l'apprentissage ; à rattacher à l'alternance.
- `plateforme de suivi et d'appui aux décrocheurs` — **[OUI]** — structure stable (PSAD) ; le filet des 16-25 ans sortis du système.
- `fonds d'aide aux jeunes` — **[FICHE]** — aide départementale, montants locaux.
- `prestation de subsistance` — **[FICHE]** — volet chiffré du CEJ.

### Rayon « Faire valoir ses droits (juridique) »

- `CSE` — **[DÉJÀ]** (`cse`) ; `prescription` — **[DÉJÀ]** (`prescription`)
- `discrimination` — **[DÉJÀ / DISC]** — `discrimination-embauche` existe ; « discrimination » au sens large (les critères, hors embauche) serait un élargissement utile.
- `conseil de prud'hommes` — **[OUI]** — le tribunal du travail ; concept pivot, absent. Prioritaire.
- `inspection du travail` — **[OUI]** — service de contrôle stable ; « qui fait respecter le droit du travail ».
- `Défenseur des droits` — **[OUI]** — autorité stable (ex-HALDE) ; recours gratuit contre les discriminations.
- `aide juridictionnelle` — **[OUI]** — prise en charge des frais de justice ; concept stable (le barème, non).
- `point-justice` (ex-point d'accès au droit) — **[OUI]** — lieu d'information juridique gratuit et de proximité ; structure stable.
- `CDAD` — **[DISC]** — le conseil départemental de l'accès au droit ; à rattacher à `point-justice`.
- `recours amiable` / `RAPO` — **[OUI]** — une fiche : la contestation d'une décision administrative avant le juge ; concept stable et transverse (France Travail, CAF, préfecture).
- `bureau d'aide juridictionnelle` — **[DISC]** — à intégrer dans `aide juridictionnelle`.

### Rayon « Étranger »

- `OFII` — **[OUI]** — voir rayon « Apprendre le français ».
- `OFPRA` — **[OUI]** — l'office qui examine les demandes d'asile ; structure stable.
- `protection subsidiaire` — **[OUI]** — statut stable, à côté du statut de réfugié.
- `contrat d'intégration républicaine` — **[OUI]** — cadre stable de l'accueil ; la fiche CIR du module s'en sert déjà, à promouvoir.
- `autorisation de travail` — **[OUI]** — concept stable : le droit de travailler attaché (ou non) au titre de séjour.
- `métier en tension` — **[OUI]** — notion stable et transverse (immigration, formation, BMO) ; à mutualiser avec « Comprendre les chiffres ».
- `naturalisation par décret` — **[DISC]** — procédure ; concept « devenir français » explicable sans les étapes.
- `attestation de comparabilité` — **[DISC]** — reconnaissance des diplômes étrangers (ENIC-NARIC) ; concept utile mais niche.
- `admission exceptionnelle au séjour` — **[FICHE]** — dispositif à forte évolution réglementaire.
- `examen civique` / `entretien d'assimilation` / `niveau A2` — **[FICHE / DISC]** — étapes datées (1er janvier 2026) ; à laisser dans les fiches du rayon, où elles sont déjà suivies.
- `attestation de demande d'asile` / `récépissé` / `attestation de dépôt sécurisée` / `numéro unique` — **[FICHE]** — pièces administratives.
- `accord de réciprocité` / `profession réglementée` — **[DISC]** — concepts stables mais très niche.

### Rayon « Justice : sortie de détention »

- `SPIP` — **[OUI]** — le service qui suit les personnes sous main de justice ; structure stable, pivot du rayon.
- `conseiller pénitentiaire d'insertion et de probation` — **[DISC]** — à rattacher à `SPIP`.
- `milieu ouvert` / `milieu fermé` — **[OUI]** — une fiche comparatif ; structure toute la compréhension du rayon.
- `aménagement de peine` (bracelet, libération sous contrainte, semi-liberté…) — **[OUI]** — une fiche « purger sa peine autrement » ; concepts stables.
- `bulletin n° 3` — **[OUI]** — l'extrait de casier que peut demander un employeur ; concept stable, très mal connu (à mettre en lien avec `casier-judiciaire`, qui existe).
- `domiciliation` — **[OUI]** — avoir une adresse administrative sans logement ; concept stable et transverse (justice, logement, banque).
- `réhabilitation` (effacement du casier) — **[DISC]** — concept stable mais niche.
- `contrat d'emploi pénitentiaire` / `droits sociaux du détenu travailleur` — **[DISC]** — nouveau cadre (2022), encore mouvant.
- `juge de l'application des peines` / `levée d'écrou` — **[FICHE]** — vocabulaire de procédure.
- `France Travail justice` — **[DISC]** — l'offre de service dédiée ; à rattacher à `france-travail`.

### Rayon « Se loger »

- `droit au logement opposable` (DALO) — **[OUI]** — recours stable pour les mal-logés ; concept pivot.
- `hébergement d'urgence` — **[DÉJÀ]** (`hebergement-urgence`) ; `SIAO` / `115` — **[OUI]** — le service qui régule l'hébergement d'urgence ; structure stable.
- `trêve hivernale` — **[OUI]** — période stable sans expulsion ; très connu, mérite une fiche claire (dates mises à jour rarement).
- `fonds de solidarité pour le logement` (FSL) — **[OUI]** — aide départementale stable dans son principe (impayés, accès) ; écrire sans montant.
- `garantie Visale` — **[DISC]** — dispositif Action Logement ; concept « caution gratuite » stable, l'opérateur peut changer.
- `intermédiation locative` — **[OUI]** — une association loue puis sous-loue ; concept stable.
- `pension de famille` — **[OUI]** — logement accompagné durable ; concept stable.
- `foyer de jeunes travailleurs` — **[OUI]** — structure stable.
- `commission de médiation` (DALO) — **[DISC]** — à rattacher à `DALO`.
- `plafond de ressources` — **[OUI]** — notion transverse (logement social, aides) ; « le revenu à ne pas dépasser ».
- `numéro unique d'enregistrement` / `commandement de payer` / `avance Loca-Pass` / `aide au maintien` / `dépôt de garantie` — **[FICHE]** — pièces et aides chiffrées.
- `accueil de jour` — **[OUI]** — lieu de répit en journée pour personnes sans abri ; concept stable.
- `APL` / `ALS` / `ALF` — **[OUI]** — une fiche « les aides au logement » (concept, sans barème). Pilier manquant.

### Rayon « Mobilité »

- `aide à la mobilité` — **[DÉJÀ]** (`aide-a-la-mobilite`)
- `garage solidaire` — **[OUI]** — réparation et location à tarif social ; concept stable, dans `data/freins.js`.
- `auto-école associative ou sociale` — **[OUI]** — apprentissage du permis accompagné ; concept stable.
- `plateforme mobilité` — **[OUI]** — le guichet local qui coordonne les aides au déplacement ; concept stable.
- `transport à la demande` — **[OUI]** — desserte souple en zone rurale ; concept stable, central sur le territoire.
- `leasing social` — **[DISC]** — location longue durée de voiture électrique à bas prix ; dispositif récent et mouvant.
- `permis à 1 euro par jour` — **[FICHE]** — dispositif chiffré (et l'aide apprentis a été supprimée en 2026).
- `prime coup de pouce pour un véhicule électrique` — **[FICHE]** — barème, remplace le bonus écologique.
- `invalidation` / `stage de récupération de points` / `test psychotechnique` — **[DISC]** — une fiche « permis : perte et récupération de points » ; concepts stables.
- `carte de réduction régionale des transports` — **[FICHE]** — dispositif régional, tarifs variables.

### Rayon « Travailler après 50 ans / retraite »

- `cumul emploi-retraite` (`cumul intégral` / `cumul plafonné`) — **[OUI]** — une fiche comparatif ; concept stable (travailler tout en touchant sa retraite).
- `retraite progressive` — **[OUI]** — réduire son temps de travail en fin de carrière ; concept stable.
- `relevé de carrière` — **[OUI]** — le récapitulatif de ses droits ; concept stable et utile à tout âge.
- `entretien information retraite` — **[OUI]** — rendez-vous stable proposé à partir de 45 ans.
- `mise à la retraite` (par l'employeur) — **[OUI]** — à distinguer du départ volontaire ; concept stable.
- `indemnité de départ volontaire à la retraite` — **[DISC]** — barème → dans une fiche « partir à la retraite ».
- `liquidation provisoire` — **[FICHE]** — vocabulaire de procédure de la caisse de retraite.
- `contrat de valorisation de l'expérience` (CVE) — **[DÉJÀ]** (`contrat-valorisation-experience`, ajouté en `b2c83b5`)

---

## C. Vocabulaire de « Comprendre les chiffres »

Ces mots ne sont pas dans des blocs `lexique:` (le module n'en a pas), mais ils sont
employés dans les fiches statistiques et méritent d'être clarifiés quelque part.

- `demandeur d'emploi de catégorie A, B, C` — **[OUI]** — une fiche : ce que veulent dire les catégories, pourquoi « inscrit » ≠ « au chômage ». Très fréquent.
- `chômage au sens du Bureau international du travail` — **[OUI]** — la définition qui sert aux comparaisons ; concept stable.
- `taux de chômage localisé` — **[DISC]** — notion technique ; à intégrer dans la fiche ci-dessus.
- `demandeur d'emploi de longue durée` — **[OUI]** — inscrit depuis un an et plus ; notion stable et structurante pour l'accompagnement.
- `besoins en main-d'œuvre` (BMO) — **[OUI]** — l'enquête annuelle sur les intentions d'embauche ; concept stable (à mutualiser avec `métier en tension`).
- `zone d'emploi` / `bassin d'emploi` — **[DÉJÀ]** (`bassin-emploi`) — vérifier que « zone d'emploi » y renvoie.
- `NEET` (ni en emploi, ni en études, ni en formation) — **[OUI]** — notion stable, souvent citée pour les jeunes.
- `équivalent temps plein` (EQTP) — **[DISC]** — utile pour lire les chiffres de salaire ; niche.
- `économie présentielle` — **[DISC]** — notion d'analyse territoriale ; explique pourquoi certains emplois ne « partent » pas. À voir.
- `emploi salarié / non salarié` — **[DISC]** — à intégrer dans `travailleur non salarié`.
- `taux de couverture` (garde d'enfant) — **[FICHE]** — indicateur, pas concept.

---

## D. Mes suggestions en plus (hors modules)

Concepts stables, besoin réel probable, pas encore vus ailleurs :

- `France Services` — le guichet unique de services publics de proximité ; structure stable, très utile au public cible.
- `CCAS / CIAS` — centre communal d'action sociale ; la porte d'entrée locale de l'aide sociale. Pivot absent.
- `quotient familial` (CAF) — la mesure du niveau de vie qui ouvre (ou non) les aides ; notion transverse.
- `reste à vivre` — ce qu'il reste une fois les charges fixes payées ; notion budgétaire stable, utilisée en accompagnement.
- `tiers de confiance` / `personne de confiance` — dans les démarches administratives et de santé ; concept stable.
- `non-recours` — le fait de ne pas demander une aide à laquelle on a droit ; notion clé de l'accompagnement, jamais un jugement.
- `secret professionnel / partage d'informations` — ce que le conseiller peut ou non transmettre ; rassure sur la confidentialité.
- `pair-aidance` — l'entraide entre personnes ayant vécu la même situation ; `groupe-de-pairs` existe, la notion large manque.

---

## E. Ce qui reste à vérifier dans le Lexique existant (audit)

- **Liens (`relations`)** : `checkLexique` ne signale aucune fiche « jamais citée »
  ni relation cassée → le maillage est sain. À refaire après chaque ajout.
- **Collections** : les 18 sont cohérentes ; il manque surtout des collections pour
  les nouveaux domaines (section A ci-dessus).
- **Mode Livre** : parcourt l'ensemble des fiches dans l'ordre de tri ; rien à
  corriger, il s'étendra mécaniquement avec les nouvelles fiches.
- **Secondes lectures** : 151 pour 162 fiches ; les fiches sans seconde lecture sont
  volontairement laissées ainsi (3 conditions éditoriales à réunir, cf.
  `modules/lexique/ARCHITECTURE_TECHNIQUE.md`).
- **Renvois à vérifier au moment de l'intégration** : `micro-entreprise` →
  `auto-entrepreneur` ; `zone d'emploi` → `bassin-emploi` ; `formation certifiante`
  → `formation-qualifiante-ou-certifiante` ; `offre de repérage et de remobilisation`
  → `o2r` ; `France VAE` → `vae` ; `parrainage` → `parrainage-vers-l-emploi`.

---

## Décompte indicatif (ma proposition, à trancher)

| Verdict | Nombre approximatif |
|---|---|
| **[DÉJÀ]** couvert | ~25 |
| **[OUI]** candidat à une fiche | ~70 |
| **[DISC]** à discuter | ~45 |
| **[FICHE]** rester dans le rayon | ~40 |

Si on retient ne serait-ce que la moitié des **[OUI]**, le Lexique passe d'un outil
« emploi / contrat / formation » à un outil qui couvre vraiment **le cadre de vie
autour de l'emploi** — ce qui est le manque que tu ressens.

**Prochaine étape proposée** : tu passes la section B rayon par rayon, tu confirmes
ou corriges chaque verdict ; on en tire une liste ferme ; l'intégration se fait par
lots (un rayon = un lot), coordonnée avec l'autre chantier Lexique en cours.
