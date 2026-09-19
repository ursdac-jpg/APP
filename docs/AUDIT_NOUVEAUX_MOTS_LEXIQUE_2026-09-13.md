# Audit du 2026-09-13 : nouveaux mots candidats pour le Lexique

Fait suite à l'item 13 de `docs/TACHES_VALIDEES.md` (demande de Denis après l'audit Cadre/Lexique/Chiffres).
Chaque fiche de « Comprendre le cadre » a son propre mini-glossaire local (champ `lexique:` dans son
en-tête) : une définition valable seulement pour cette fiche. Ce document liste les termes de ces
mini-glossaires qui **n'existent nulle part dans le vrai Lexique** (`data/lexique.js`) et qui, de l'avis
de l'audit, mériteraient de devenir une vraie fiche autonome (utile ailleurs, pas seulement dans la fiche
d'origine).

**Chiffres de l'audit** : 259 termes examinés (2 recherches indépendantes, une par moitié des rayons),
175 déjà couverts par le Lexique sous un autre nom, 35 jugés trop étroits pour mériter une fiche à part,
**49 recommandés ci-dessous**.

**Denis a validé l'ensemble des 49 le 2026-09-13.** Rédaction en cours, lot par lot (voir
`docs/TACHES_VALIDEES.md` item 13). Statut : `[ ]` pas encore écrit, `[x]` créé et committé,
`[-]` écarté. **État au 2026-09-13 (checkpoint avant compactage de session)** : 20/49 créés et
committés (commit `e02e238`), en 2 lots : création/entrepreneuriat (7) + 1 terme jeunes (lot 1),
emploi/contrats/droit du travail (12, lot 2). **Reste à faire** :
- Lots 3 à 6 ci-dessous (29 fiches : formation 9, étranger 7, justice 7, logement/mobilité/budget/garde 6).
- **Une fois les 49 terminés** : ajouter, sur chaque fiche SOURCE de Comprendre le cadre, un lien
  `voir_aussi_lexique` vers le nouveau mot créé (même principe que les 102 fiches déjà reliées le
  2026-09-13, item 9) - pas encore fait pour les 20 déjà créés. Chaque nouvelle fiche Lexique doit
  aussi avoir au moins une relation interne (`voir-aussi` ou `a-ne-pas-confondre`) vers une entrée
  existante ayant de la place (plafonds : 3 voir-aussi, 2 a-ne-pas-confondre par fiche), pour éviter
  l'avertissement "jamais citee" de `checkLexique.js` - déjà fait pour les 20 premiers, à refaire pour
  chaque nouveau lot.
- **5 candidats supplémentaires trouvés depuis Comprendre les chiffres lui-même** (chômage au sens du
  recensement, taux d'emploi, population active, correction des variations saisonnières, zonage ARS) :
  voir `docs/TACHES_VALIDEES.md` item 13, sous-point dédié. **Validés et rédigés le 2026-09-13**
  (ids `chomage-recensement`, `taux-d-emploi`, `population-active`, `correction-variations-saisonnieres`,
  `zonage-ars`), avec le champ `voirAussiChiffres` sur les 4 qui s'y prêtaient. Vérifié au navigateur
  (bouton "Pour aller plus loin" + retour "Revenir à Lexique"). `checkLexique.js` 0 erreur/0
  avertissement, `npm test` 924 verts.

## Point de vigilance avant de commencer

- **Collision de nom** : le terme n°40 ci-dessous (« Prescription », au sens délai judiciaire) entrerait
  en collision avec une fiche Lexique existante intitulée « Prescription » (qui désigne l'orientation par
  un conseiller, sens totalement différent). S'il est retenu, il lui faudra un titre distinct
  (ex. « Prescription (délai) ») pour ne pas se confondre avec l'existant.

## Liste des 49 candidats

### Création, entrepreneuriat (creer, accompagnement) - LOT 1, CLOS (commit `e02e238`)

- [x] **ARCE** -> id Lexique `arce` (source : `creer-aides-a-la-creation`) - *dispositifs*
- [x] **Pass IAE** -> id Lexique `pass-iae` (source : `accompagnement-insertion-par-activite-economique`) - *dispositifs*
- [x] **Contrat d'appui au projet d'entreprise (CAPE)** -> id Lexique `cape` (source : `creer-cooperative-activite-emploi`) - *entrepreneuriat-independance*
- [x] **Garantie de prêt** -> id Lexique `garantie-de-pret` (source : `creer-se-faire-accompagner`) - *entrepreneuriat-independance*
- [x] **Franchise de TVA** -> id Lexique `franchise-de-tva` (source : `creer-regime-micro-au-quotidien`) - *entrepreneuriat-independance*
- [x] **Versement libératoire** -> id Lexique `versement-liberatoire` (source : `creer-regime-micro-au-quotidien`) - *entrepreneuriat-independance*
- [x] **Suspension-remobilisation** -> id Lexique `suspension-remobilisation` (source : `accompagnement-contrat-d-engagement`) - *dispositifs*
- [x] **Fonds d'aide aux jeunes (FAJ)** -> id Lexique `fonds-d-aide-aux-jeunes` (source : `jeunes-aides-financieres`) - *dispositifs* (terme oublié dans le comptage initial de ce document, ajouté au lot 1 - c'est le 49e)

### Emploi, contrats, droit du travail (emploi, employeurs, jeunes, seniors) - LOT 2, CLOS (commit `e02e238`)

- [x] **Contrat d'apprentissage** -> id Lexique `contrat-d-apprentissage` (source : `jeunes-contrat-apprentissage`) - *contrats-statuts-emploi*
- [x] **Parcours emploi compétences (PEC)** -> id Lexique `pec` (source : `emploi-contrats-de-l-insertion`) - *contrats-statuts-emploi*
- [x] **Indemnité légale de licenciement** -> id Lexique `indemnite-legale-de-licenciement` (source : `emploi-licenciement`) - *droit-travail*
- [x] **Homologation (rupture conventionnelle)** -> id Lexique `homologation-rupture-conventionnelle` (source : `emploi-rupture-conventionnelle`) - *droit-travail*
- [x] **Index de l'égalité professionnelle** -> id Lexique `index-egalite-professionnelle` (source : `employeurs-egalite-professionnelle`) - *ressources-humaines*
- [x] **Titre emploi-service entreprise (Tese)** -> id Lexique `tese` (source : `employeurs-devenir-employeur`) - *structures-organismes*
- [x] **Complémentaire santé collective** -> id Lexique `complementaire-sante-collective` (source : `employeurs-mutuelle-obligatoire`) - *protection-sociale*
- [x] **Prévoyance complémentaire** -> id Lexique `prevoyance-complementaire` (source : `employeurs-mutuelle-obligatoire`) - *protection-sociale*
- [x] **Document unique d'évaluation des risques professionnels (DUERP)** -> id Lexique `duerp` (source : `employeurs-obligations-sante-securite`) - *sante-travail*
- [x] **Délégué syndical** -> id Lexique `delegue-syndical` (source : `employeurs-seuils-representation-personnel`) - *droit-travail*
- [x] **Visite d'information et de prévention (VIP)** -> id Lexique `visite-d-information-et-de-prevention` (source : `employeurs-suivi-medical`) - *sante-travail*
- [x] **Indemnité de départ volontaire à la retraite** -> id Lexique `indemnite-depart-volontaire-retraite` (source : `seniors-depart-volontaire-retraite`) - *droit-travail*

### Formation - LOT 3, CLOS (commit `52b8e51`)

**Comment continuer (pour reprendre sans le fil de conversation)** : suivre exactement le patron des
lots 1 et 2 (commit `e02e238`, `git show e02e238 -- data/lexique.js`) : chaque terme devient une entree
`{ id, titre, titreDeTri, type: 'terme', univers, registres, variantesRecherche, corps, relations }`
inseree juste avant le `];` qui ferme `var LEXIQUE_FICHES = [` (ligne ~3468 avant ce lot, verifier avec
`grep -n "^var LEXIQUE_FICHES\|^];" data/lexique.js` - **attention, un 2e tableau `LEXIQUE_SECOND_NIVEAU`
existe plus bas dans le fichier avec sa propre fermeture `];` : ne pas s'y tromper, erreur deja faite et
corrigee dans cette session**. Le texte source (definition locale de chaque terme, telle qu'ecrite dans
la fiche Cadre d'origine) est dans `data/lexique.js` lui-meme pour les 20 deja faits (a relire comme
modele de ton), et dans les fiches sources listees ci-dessous pour les 29 restants (`modules/comprendre-
le-cadre/contenu/<rayon>/<id-fiche>.md`, champ `lexique:` de l'en-tete). Donner a CHAQUE nouvelle fiche
au moins une relation (`voir-aussi` ou `a-ne-pas-confondre`) vers une entree EXISTANTE ayant de la place
(plafonds : 3 voir-aussi, 2 a-ne-pas-confondre par fiche - verifier avec `grep -A6 "id: 'xxx',"
data/lexique.js`), et ajouter la relation reciproque du cote de l'entree existante si elle n'a encore
aucune fiche qui pointe vers elle. Verifier avec `node scripts/checkLexique.js` (0 erreur, 0
avertissement attendus) puis `npm test` avant de committer. Une fois les 49 fiches creees : revenir sur
CHAQUE fiche source de Comprendre le cadre listee ci-dessous pour lui ajouter (ou completer) son champ
`voir_aussi_lexique:` avec l'id de la nouvelle fiche Lexique correspondante (meme mecanisme que les 102
fiches deja reliees le 2026-09-13, voir `docs/TACHES_VALIDEES.md` item 9) - **pas encore fait, meme pour
les 20 premiers deja crees**.

- [x] **Prépa-apprentissage** -> id Lexique `prepa-apprentissage` (source : `jeunes-prepa-apprentissage-ecoles-de-production`) - *formation*
- [x] **France VAE** -> id Lexique `france-vae` (source : `former-validation-des-acquis-vae`) - *demarches-administratives*
- [x] **Action de formation conventionnée (AFC)** -> id Lexique `action-de-formation-conventionnee` (source : `former-financer-sa-formation-demandeur-emploi`) - *formation*
- [x] **Reste à charge** -> id Lexique `reste-a-charge-formation` (source : `former-aides-moins-connues-financer-formation`) - *formation*
- [x] **Bourse sur critères sociaux** -> id Lexique `bourse-sur-criteres-sociaux` (source : `former-aides-moins-connues-financer-formation`) - *formation*
- [x] **Abondement** -> id Lexique `abondement-cpf` (source : `former-compte-personnel-de-formation`) - *formation*
- [x] **Transitions Pro** -> id Lexique `transitions-pro` (source : `former-projet-de-transition-professionnelle`, `former-demission-reconversion`) - *structures-organismes*
- [x] **OEPRE** -> id Lexique `oepre` (source : `francais-apprendre-pres-de-chez-soi`) - *formation*
- [x] **Français à visée professionnelle** -> id Lexique `francais-a-visee-professionnelle` (source : `francais-se-former-pour-le-travail`) - *formation*

### Étranger, droit au séjour - LOT 4, CLOS (commit à venir)

- [x] **Profession réglementée** -> id Lexique `profession-reglementee` (source : `etranger-comparabilite-diplome`) - *demarches-administratives*
- [x] **Attestation de demande d'asile** -> id Lexique `attestation-de-demande-d-asile` (source : `etranger-demandeur-asile-et-emploi`) - *demarches-administratives*
- [x] **Naturalisation par décret** -> id Lexique `naturalisation-par-decret` (source : `etranger-naturalisation-grandes-etapes`) - *demarches-administratives*
- [x] **Examen civique** -> id Lexique `examen-civique` (source : `etranger-naturalisation-grandes-etapes`) - *demarches-administratives*
- [x] **Accord de réciprocité** -> id Lexique `accord-de-reciprocite` (source : `etranger-permis-de-conduire-etranger`) - *demarches-administratives*
- [x] **Admission exceptionnelle au séjour** -> id Lexique `admission-exceptionnelle-au-sejour` (source : `etranger-regularisation-par-le-travail`) - *demarches-administratives*
- [x] **Récépissé** -> id Lexique `recepisse` (source : `etranger-titre-de-sejour-et-travail`) - *demarches-administratives*

### Justice, sortie de détention - LOT 5, CLOS (commit à venir)

- [x] **Libération sous contrainte** -> id Lexique `liberation-sous-contrainte` (source : `justice-amenagement-de-peine`) - *dispositifs*
- [x] **Juge de l'application des peines** -> id Lexique `juge-de-l-application-des-peines` (source : `justice-amenagement-de-peine`) - *structures-organismes*
- [x] **Réhabilitation** -> id Lexique `rehabilitation` (source : `justice-casier-judiciaire`) - *droit-travail*
- [x] **Levée d'écrou** -> id Lexique `levee-d-ecrou` (source : `justice-sortie-acces-aux-droits`) - *dispositifs*
- [x] **Contrat d'emploi pénitentiaire** -> id Lexique `contrat-emploi-penitentiaire` (source : `justice-travail-formation-en-detention`) - *contrats-statuts-emploi*
- [x] **France Travail justice** -> id Lexique `france-travail-justice` (source : `justice-vers-l-emploi`) - *structures-organismes*
- [x] **Prescription (délai)** -> id Lexique `prescription-delai` (source : `juridique-litige-avec-l-employeur`) - collision de nom gérée par un titre distinct + relation `a-ne-pas-confondre` réciproque avec l'id `prescription` existant - *droit-travail*

### Logement, mobilité, budget, garde - LOT 6, CLOS (commit à venir)

- [x] **Numéro unique d'enregistrement** -> id Lexique `numero-unique-enregistrement` (source : `logement-demande-de-logement-social`) - *demarches-administratives*
- [x] **Commandement de payer** -> id Lexique `commandement-de-payer` (source : `logement-expulsion`) - *demarches-administratives*
- [x] **Permis à 1 euro par jour** -> id Lexique `permis-a-1-euro-par-jour` (source : `mobilite-financer-le-permis`) - rédigé sans citer le montant précis de remboursement (règle anti-obsolescence) - *mobilite-budget*
- [x] **Pajemploi** -> id Lexique `pajemploi` (source : `garde-complement-mode-de-garde-cmg`) - relation `a-ne-pas-confondre` réciproque avec le CESU - *demarches-administratives*
- [x] **Secours d'urgence** -> id Lexique `secours-d-urgence` (source : `budget-aide-alimentaire-et-aides-urgence`) - *accompagnement-insertion*
- [x] **Recevabilité (surendettement)** -> id Lexique `recevabilite` (source : `budget-surendettement-dossier-recevable`) - *mobilite-budget*

**Les 6 lots de l'audit "nouveaux mots" sont désormais tous clos (49 fiches créées).**

**Bouclage fait le 2026-09-13** : les 45 fiches sources de « Comprendre le cadre » (49 mots, dont 4 fiches
qui en portent 2 chacune) ont chacune reçu le lien retour `voir_aussi_lexique:` vers leur nouvelle fiche
Lexique (même mécanisme que les 102 fiches de l'item 9). `node scripts/checkLexique.js` : 0 erreur, 0
avertissement. `npm test` : 924 verts.

**Les 5 candidats "vocabulaire des chiffres" ont aussi été validés et rédigés le 2026-09-13** (voir
plus haut). **L'audit "nouveaux mots" (item 13 de `TACHES_VALIDEES.md`) est désormais entièrement
clos, sans reste.**

## Termes examinés et écartés (pour référence, rien à faire)

Trop étroits ou exclus par la doctrine du Lexique (montants/conditions volatiles, détail procédural
interne à une seule démarche) : radiation FICP, réseau accompagnant, entretien d'assimilation,
attestation de dépôt sécurisée, AGE, CMG, accueil occasionnel, bureau d'aide juridictionnelle, droits
sociaux du détenu travailleur, leasing social, prime véhicule électrique, carte de réduction régionale
des transports, organisation coordonnée territoriale, et 22 autres du même type (liste complète dans les
notes de l'audit si besoin).
