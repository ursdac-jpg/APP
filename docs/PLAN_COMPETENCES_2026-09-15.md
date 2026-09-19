# Plan : fiabiliser et enrichir le système compétences → métiers

> **Chantier CLOS le 2026-09-16.** Le détail de l'audit, l'enquête technique et les échanges avec
> Denis qui ont mené à ce plan sont dans `docs/CHANTIER_COMPETENCES.md` (le cahier). Ce fichier-ci
> est la liste d'étapes tenues, dans l'ordre, avec pour chacune le quoi, le pourquoi, le comment,
> la complexité et l'état final.
>
> **Règle de méthode du projet, rappelée ici** : un commit par sous-étape, `npm test` + test
> navigateur avant de passer à la suivante, jamais un état à moitié fait. `js/app.js` n'est pas
> couvert par les tests Node : toute étape qui le touche exige une vérification navigateur
> explicite (clair et sombre).

---

## Vue d'ensemble

| # | Étape | Priorité | Complexité | Maquette requise | État |
|---|---|---|---|---|---|
| 0 | Fusion des 3 fichiers métiers en un seul | n/a | n/a | Non | **FAIT** (2026-09-15, commit `006ccbd`) |
| 1 | Fichier compétences dédié (`data/competences.js`) | Maintenant | Faible | Non | **FAIT** (2026-09-16) |
| 2 | Script de contrôle automatique des compétences | Maintenant (même passage que 1) | Faible | Non | **FAIT** (2026-09-16) |
| 3 | Tri par pertinence du clic compétence (volet B) | Ensuite | Faible | Non | **FAIT** (2026-09-16) |
| 4 | Garde-fou anti-répétition entre compétences | Conditionnel | Faible si besoin confirmé | Non | Non nécessaire à ce stade (observé après l'étape 3) |
| 5 | Nouveau bloc de pistes sans clic (volet A) | n/a | n/a | n/a | **ANNULÉE** (2026-09-16), déjà satisfaite par le bloc « Métiers » existant |
| 6 | Note de gouvernance vocabulaire (400 métiers) | Ensuite | Très faible | Non | **FAIT** (2026-09-16) |
| 7 | Nettoyage du code mort | En clôture | Très faible | Non | **FAIT** (2026-09-16) |
| n/a | Corriger les 2 failles de `calculerScoreMetier()` | Plus tard, optionnel | Élevée (impact large) | À évaluer | Documenté, non engagé |
| n/a | Chargement à la demande / JSON du fichier métiers | Plus tard, si le poids devient un problème | Moyenne | Non | Documenté, non engagé |
| n/a | Compétences dans le Lexique | **Écarté** | n/a | n/a | Décidé : non (voir raison ci-dessous) |

---

## Étape 0 : fusion des fichiers métiers (FAIT)

**Quoi** : `data/metiers.js` contient désormais les 129 fiches métiers en dur (65 d'origine + 63 de
l'ancien `referentielMetiersERIP.js` + 1 de l'ancien `metiersComplementaires.js`, tous deux
supprimés). Une seule source de vérité.

**Pourquoi** : Denis avait constaté qu'un audit qui ne lisait que `data/metiers.js` sous-comptait
la base à 65 au lieu de 129 (l'assemblage dépendait de l'ordre de chargement des 3 fichiers).
Cause racine aussi du défaut de tri (les « 5 pistes » étaient toujours les 5 premiers du fichier
d'origine, jamais un métier des 64 ajoutés après).

**Vérifié** : `npm test` 924/924 verts. Test navigateur fait le 2026-09-15 : `baseMetiers.length`
= 129 en direct, recherche d'accueil teste avec succès sur « Vigneron » (un des 63) et « Gendarme »
(le 1 du 3ᵉ fichier), fiches complètes retournées, aucune erreur console. Gain vérifié en plus de
la fusion : 2 fonctions de `js/app.js` (`classerCompetencesParPertinence`,
`unifierEtPlafonnerCompetences`) cherchaient un métier par son nom **uniquement dans les 63 du
référentiel ERIP** : elles cherchent maintenant dans les 129, un vrai gain de justesse, pas
seulement de rangement.

**Commit** : `006ccbd`.

---

## Étape 1 : fichier compétences dédié (`data/competences.js`), FAIT le 2026-09-16

`categorieCompetence` et `DESCRIPTIFS_COMPETENCES` vivent désormais dans `data/competences.js`
(chargé avant `js/app.js` dans `index.html`, juste après `data/metiers.js`), avec `module.exports`
pour les tests Node. `js/app.js` ne les déclare plus, juste un commentaire de renvoi.

**Correction en cours de route** : le premier calcul (2026-09-15) annonçait 8 termes
savoir-faire/savoir-être absents, dont « Esprit d'équipe » (14x) à vérifier pour doublon. Un bug
d'échappement d'apostrophe dans le script d'audit faisait apparaître ce terme comme absent à tort
: il existait déjà. Recalcul exact (objets réels du navigateur) : **6 termes réellement absents**,
pas 8 : voir `docs/CHANTIER_COMPETENCES.md` pour le détail. Un vrai bug trouvé au passage et
corrigé : la fiche « Technicien qualité » (`data/metiers.js`) avait « Analyse de donnees » sans
accent au lieu de « Analyse de données » : corrigé dans la fiche plutôt qu'ajouté en double.

**Résultat** : `categorieCompetence` passe de 65 à **79 entrées** :
- 3 savoir-faire ajoutés : `Intervention`, `Rédaction de procédures`, `Secourisme`.
- 3 savoir-être ajoutés : `Sang-froid`, `Sens du devoir`, `Discrétion`.
- Catégorie **« Savoirs »** créée : 5 termes déjà décrits mais jamais catégorisés jusqu'ici
  (`Encaissement`, `Mise en rayon`, `Règles d'hygiène`, `Gamme de produits`, `Plan et sécurité du
  magasin`) + 3 nouveaux (`Règles de sécurité`, `Gestes de premiers secours`, `Anglais et langues
  étrangères`). Les 184 autres libellés de « savoirs » restent volontairement non catalogués (par
  nature spécifiques à un métier/secteur).

Parité stricte vérifiée : les 79 clés de `categorieCompetence` correspondent exactement aux 79
clés de `DESCRIPTIFS_COMPETENCES`, aucun orphelin des deux côtés.

**Vérifié** : `npm test` 924/924 (a nécessité une correction annexe, voir note ci-dessous) + test
navigateur (recherche « Secourisme » → pastille compétence reconnue + « Gendarme » remonté avec
« Savoir-faire en commun : Secourisme », aucune erreur console).

**Régression trouvée et corrigée en cours de route** : `tests/decouverteLogique.test.js` charge
`js/app.js` sous Node via un stub DOM (`tests/_domStub.js`) qui doit fournir en `global` tout ce
qu'`app.js` attend déjà chargé (même principe que `baseMetiers`/`rienEteChoisi`, documenté dans ce
fichier). L'extraction a cassé ce test (`categorieCompetence is not defined` à la ligne
`BASE_CONNAISSANCES_ERIP.competences = categorieCompetence`) le temps d'ajouter le même stub pour
`categorieCompetence`/`DESCRIPTIFS_COMPETENCES` dans `_domStub.js`. Corrigé, revérifié vert.

---

## Étape 2 : script de contrôle automatique des compétences, FAIT le 2026-09-16

`scripts/checkCompetences.js` (sur le modèle de `checkLexique.js`, ERREUR bloquante vs
AVERTISSEMENT informatif). Usage : `node scripts/checkCompetences.js`.

**Vérifie** : catégorie valide (Savoir-faire/Savoir-être/Savoirs), parité
categorieCompetence/DESCRIPTIFS_COMPETENCES, descriptif non vide, doublons probables entre
libellés (réutilise `correspond()`, désormais exporté par `data/metiers.js`), vocabulaire réel
savoir-faire/savoir-être absent du référentiel (avec détection de proximité : c'est ce qui aurait
détecté automatiquement la coquille « Analyse de donnees »), compte global des « savoirs » non
catalogués (top 5 les plus fréquents, pas un par un), compétences à 0 métier associé, compétences
peu discriminantes (> 40 % des métiers).

**Premier passage réel (2026-09-16)** : 0 erreur, 12 avertissements, tous pertinents et vérifiés un
par un : pas de bruit. Exemples : doublons à vérifier signalés (`Sécurité`/`Règles de sécurité`,
`Rédaction`/`Rédaction de procédures` : légitimement distincts, pas fusionnés automatiquement) ;
3 compétences supplémentaires à 0 piste découvertes en même temps que les 4 déjà connues
(`Mise en rayon`, `Gamme de produits`, `Plan et sécurité du magasin` : décrites mais jamais citées
par aucune fiche métier) ; `Rigueur` confirmée peu discriminante (70/129, 54 %).

---

## Étape 3, volet B : tri par pertinence pour le clic compétence, FAIT le 2026-09-16

**Quoi** : le mécanisme actuel (clic sur une pastille de compétence → jusqu'à 5 pistes de métiers,
`ouvrirPanneauMetiersListePourCible()`) garde son écran et son fonctionnement identiques. Seule la
sélection des 5 métiers change, avec les 2 critères confirmés par Denis :
1. **Lien réel avec la compétence cliquée** : élargir le filtre de candidats (garder le principe
   de `trouverMetiersAssocies()`, envisager la correspondance floue `correspond()` plutôt que
   l'égalité stricte actuelle, pour capter aussi les 63 métiers fusionnés à l'étape 0 dont le
   vocabulaire ne colle pas toujours mot pour mot).
2. **Classement par compatibilité avec l'ensemble du profil** : noter ce pool de candidats avec
   `calculerScoreMetier(profilComplet, metier)` (déjà utilisé ailleurs en production : module
   Découverte, `meilleurMetierAssocie()` pour la version « 1 piste ») : **résultat interne
   seulement, jamais affiché comme pourcentage** (voir raison à l'étape « Non-négociables »
   ci-dessous). Garder les 5 premiers du classement.

**Unification** : fusionner avec `meilleurMetierAssocie()` (la version « 1 piste »), qui fait déjà
presque ce calcul, pour n'avoir qu'une seule logique dans le code au lieu de deux proches mais
distinctes.

**Cas particulier tranché pendant le code** : `construireProfil()`/`rienEteChoisi()` lisent le
`dossier` global, un état partagé par toute l'application, pas propre à l'écran « Votre profil ».
Décision : appliquer le même traitement partout, y compris à la recherche d'accueil
(`ouvrirPanneauMetiersAssocies()`, `js/app.js:1136`) plutôt que de la mettre à part comme prévu
initialement : si la personne a déjà rempli des éléments de son profil avant de chercher depuis
l'accueil, autant en tenir compte ici aussi. Le repli sur l'ordre actuel reste automatique et
gratuit dans tous les cas grâce à `rienEteChoisi()` (profil vide, ex. juste après l'arrivée sur
l'app) : pas de code spécial à écrire pour ce cas.

**Choix technique tranché en cours de code** : le pool de candidats de départ n'est pas élargi à
20 (comme le faisait déjà `meilleurMetierAssocie()`) mais à `baseMetiers.length` (tous les métiers
réellement liés à la compétence, sans plafond arbitraire), sinon pour une compétence très
fréquente comme « Rigueur » (70 correspondances réelles), le tri par pertinence n'aurait vu que
les 20 premiers du tableau (toujours les mêmes, biais partiellement reconduit) au lieu de vraiment
choisir parmi tous les candidats possibles. Coût négligeable (129 métiers au maximum à noter).
La correspondance floue `correspond()` envisagée pour élargir le filtre lui-même (au-delà du
plafond) n'a **pas** été activée dans cette passe : le référentiel de compétences vient d'être
complété (étape 1, 6 vrais termes ajoutés), l'égalité stricte actuelle suffit désormais dans
l'immense majorité des cas ; activer la correspondance floue en plus aurait élargi le
comportement de 4 fonctions à la fois pour un gain marginal, non nécessaire pour l'instant.

**Pourquoi** : répond exactement aux 2 critères que Denis a formulés lui-même (lien réel + prise en
compte de l'ensemble du profil), en réutilisant un moteur déjà éprouvé plutôt qu'en inventant un
nouvel algorithme.

**Complexité** : faible, confirmée. Aucun changement visuel (l'écran affiche toujours une liste de
noms, sans chiffre). A touché 4 fonctions dans `js/app.js` (nouvelle fonction commune
`metiersTriesParPertinence`, `meilleurMetierAssocie` simplifiée pour la réutiliser,
`ouvrirPanneauMetierUniquePourCible`, `ouvrirPanneauMetiersListePourCible`,
`ouvrirPanneauMetiersAssocies`), aucune modification de `data/baseConnaissancesERIP.js`.

**Vérifié** : `npm test` 924/924. Test navigateur ciblé (profil vide) : les résultats restent
identiques à avant le changement, bit à bit (`Employé libre-service`, `Préparateur de commandes /
Magasinier`, `Cariste`, `Agent d'entretien`, `Infirmier` pour « Rigueur »). Test navigateur ciblé
(profil simulé favorisant « Gendarme », le tout dernier métier du tableau, jamais choisi
auparavant) : « Gendarme » remonte bien en tête (score 70), les 3 écrans concernés (1 piste,
jusqu'à 5 pistes, recherche d'accueil) affichent tous le même classement cohérent, aucune erreur
console. Défaut de français annexe trouvé et corrigé au passage dans la fonction touchée (accents
manquants sur le texte affiché par la recherche d'accueil).

**À observer après coup, pas à traiter par avance** : les compétences non discriminantes trouvées
à l'audit (`Rigueur` présente dans 54 % des métiers, `Autonomie` 28 %...) : le tri par pertinence
+ profil limite déjà l'effet mécaniquement, confirmé par le test ci-dessus (le classement change
bien selon le profil, même si le pool de candidats reste large). Pas de garde-fou spécial construit
à ce stade : Denis pourra juger sur pièce, une fois l'écran testé en conditions réelles, s'il en
faut un. Détail dans `docs/CHANTIER_COMPETENCES.md`, section « Compétences non discriminantes ».

---

## Étape 4 : garde-fou anti-répétition entre compétences cliquées (conditionnel)

**Le risque identifié par Denis lui-même** : si le classement par profil complet pèse trop, un même
métier « généraliste » pourrait sortir en tête quelle que soit la compétence cliquée, ce qui
viderait l'intérêt de cliquer sur des compétences différentes.

**Analyse** : le filtre de l'étape 3 (critère 1, lien réel à la compétence cliquée) limite déjà ce
risque mécaniquement : le pool de candidats diffère d'une compétence à l'autre, seul le classement
à l'intérieur de ce pool est commun. Un métier ne peut dominer une compétence que s'il la possède
réellement.

**Décision retenue** : **ne pas construire de garde-fou anti-répétition par avance.** Observer en
usage réel, après l'étape 3, si le problème se manifeste effectivement (plusieurs compétences
cliquées d'affilée renvoient le même métier en position 1). Si oui, mécanisme léger déjà esquissé
et prêt à activer : mémoriser (en mémoire de session, jamais enregistré) les métiers déjà sortis en
tête pour une autre compétence du même profil sur le même écran, et les reléguer d'un rang si le
cas se présente. Ne pas construire cette complexité avant d'avoir constaté le besoin.

**Pourquoi cette prudence** : cohérent avec la discipline du projet (pas de complexité ajoutée pour
un problème hypothétique). Aucune brique de ce type n'a été trouvée ailleurs dans le dépôt à
réutiliser (vérifié le 2026-09-15) : ce serait un vrai développement, à ne faire que si nécessaire.

---

## Étape 5, volet A : ANNULÉE le 2026-09-16, déjà satisfaite par l'existant

**Décision de Denis** : pas de nouveau bloc. Le bloc « Métiers » actuel sur « Votre profil »
(`CONFIG_BLOC_METIERS`, `js/app.js:8577`) fait déjà tout ce que le volet A visait à construire :
- **« Métiers qui pourraient vous intéresser »** : cartes `metiersRecommandes()` (proches du
  profil, via `rechercherMetiers()`) + `pistesRecommandees()` (même domaine que le métier visé) :
  exactement le « métiers qui pourraient correspondre selon les compétences » que Denis décrit.
- **Sous-section « Pourquoi ces métiers ? »** : garde le score existant (`contenuPourquoiMetiers`),
  décision explicite de Denis de le conserver tel quel (« j'aime bien cette idée »).
- **Sous-section « Des métiers qui recrutent souvent »** : les métiers sans diplôme requis, en
  tension, à fort turnover (`metiersQuiRecrutentGeneralement()`).
- **Sous-section « Jobs saisonniers et alimentaires »** : `metiersSaisonnierAlimentaire()`.

Vérifié le 2026-09-16 en relisant `CONFIG_BLOC_METIERS` : les 4 pièces citées par Denis existent
déjà, en production, assemblées exactement comme il les décrit. Rien à construire. `metiersPourSynthese()`
(l'ancien bloc « Des pistes à explorer », voir étape 5 initiale ci-dessous conservée pour mémoire)
n'a donc pas besoin d'être ressuscité : son rôle est aujourd'hui rempli par
`CONFIG_BLOC_METIERS` dans son ensemble.

**Les compétences elles-mêmes** (« on identifiera les compétences, elles seront dans le bloc
compétences ») : c'est `CONFIG_BLOC_PROFIL`, déjà en place, où vit le mécanisme corrigé à l'étape
3 (clic sur une pastille → « une piste à explorer » ou « quelques pistes », désormais classées par
pertinence au profil complet).

<details>
<summary>Version initiale de l'étape 5, avant la décision de Denis du 2026-09-16 (conservée pour mémoire)</summary>

**Quoi** : sur la page « Votre profil » (où toutes les compétences repérées sont listées), un bloc
qui propose des métiers en tenant compte de l'ensemble du profil, sans dépendre d'un clic sur une
compétence précise. Utilise directement `rechercherMetiers(profilComplet, max)` : déjà écrit, déjà
utilisé ailleurs (module Découverte).

**Ce principe a déjà existé** (bonne nouvelle, pas à inventer) : `metiersPourSynthese()`, bloc
d'abord nommé « Ce qui vous correspond », renommé **« Des pistes à explorer »** le 2026-09-02
(Denis l'a jugé trop affirmatif à l'époque), supprimé le 2026-09-03 comme effet de bord d'une
fusion d'écrans sans rapport, pas pour un défaut de fiabilité.

**Reste à trancher avec Denis avant code** (maquette légère, pas un gros aller-retour) :
- Emplacement précis dans le bloc « Métiers » unifié (en tête ? en complément des cartes
  existantes ?).
- Nombre de métiers proposés (5 comme l'ancien mécanisme, ou plus : Denis a évoqué l'idée d'en
  montrer 10 lors d'un échange : à trancher, sachant que plus on en montre, moins chaque piste
  paraît sélective).

**Complexité** : moyenne. Nouvelle surface d'interface, mais rien à inventer sur le calcul (réutilise
l'étape 3/`rechercherMetiers`), et un précédent direct à suivre pour le ton.

</details>

---

## Étape 6 : note de gouvernance vocabulaire (préparer les 400 métiers), FAIT le 2026-09-16

**Quoi** : ajouter, dans l'en-tête de `data/metiers.js` (là où vit aujourd'hui le guide « comment
ajouter un métier soi-même », hérité de l'ancien `metiersComplementaires.js`), une consigne
explicite : avant d'inventer un nouveau libellé de savoir-faire ou de savoir-être pour une
nouvelle fiche métier, vérifier d'abord dans `data/competences.js` (étape 1) si un terme existant
convient déjà : même discipline que celle qui existe déjà pour les identifiants
activités/actions/environnement/valeurs.

**Pourquoi** : répond directement à la question de Denis sur la tenue à 400 métiers. Mesuré le
2026-09-15 : les 129 métiers actuels (21 secteurs très variés) ne génèrent que 70 libellés
distincts de savoir-faire/savoir-être au total : cette économie ne tient que si le vocabulaire
existant est réutilisé en priorité plutôt que reformulé à chaque nouvelle fiche. Sans cette
discipline, le référentiel se fragmenterait au même rythme que les « savoirs » (192 libellés
distincts, quasiment un par métier) : normal et attendu pour les savoirs (connaissances
spécifiques), mais à éviter pour les savoir-faire/savoir-être qui doivent rester génériques et
réutilisables. Le script de l'étape 2 peut détecter après coup les manquements à cette règle.

**Complexité** : très faible. Une note de documentation, pas de code.

---

## Étape 7 : nettoyage du code mort (en clôture du chantier), FAIT le 2026-09-16

**Quoi** : `metiersPourCompetence()`, `ouvrirFenetreCompetence()` et `fermerFenetreCompetence()`
supprimées (`data/metiers.js`) : confirmé code mort orphelin depuis le tout premier commit du
dépôt, jamais rebranché après le retrait de son ancien déclencheur (bug de fenêtres superposées,
pas un abandon sur le fond). Recherche exhaustive faite avant suppression (`grep` sur tout le
dépôt) : aucun appelant nulle part, y compris dans les tests. Le commentaire de `js/app.js`
(`wireCompetencesCliquablesGlobal`) qui citait `ouvrirFenetreCompetence` mis à jour pour ne plus
pointer vers une fonction supprimée.

**Non touché volontairement** : l'IIFE juste après (ajout d'un style `cursor:pointer` + effet de
survol sur les classes Bootstrap `.badge.bg-success/.bg-primary/.bg-info`), cosmétique et sans
appelant fonctionnel lui non plus, mais dont la suppression pourrait affecter d'autres badges
utilisant ces mêmes classes Bootstrap ailleurs dans l'app (non vérifié) : hors du périmètre exact
de cette étape, laissé en l'état.

**Vérifié** : `npm test` 924/924, aucun test ne référençait ces fonctions. Test navigateur :
`typeof metiersPourCompetence` et `typeof ouvrirFenetreCompetence` confirmés `undefined`, le
mécanisme actif (`metiersTriesParPertinence`) inchangé, aucune erreur console.

**Complexité** : très faible, confirmée.

---

## Documenté mais non engagé dans ce chantier

- **Corriger les 2 failles de `calculerScoreMetier()`** (normalisation par poids utilisé plutôt
  que poids total ; `comparerListes()` qui rapporte au plus petit des deux ensembles comparés :
  un profil pauvre peut afficher un score gonflé, jamais l'inverse). Trouvé le 2026-09-15, détail
  dans `docs/CHANTIER_COMPETENCES.md` section 4.3. Non traité ici parce que ça impacterait aussi le
  module Découverte et le bloc « Pourquoi ces métiers ? » existant : chantier séparé si Denis le
  décide un jour, avec sa propre validation.
- **Chargement à la demande ou passage en JSON du fichier métiers.** Pas un problème aujourd'hui
  (524 Ko contre 2,2 Mo pour `js/app.js` : il faudrait environ 550 métiers pour rattraper cette
  taille). À revisiter seulement si le fichier dépasse 1 à 2 Mo, ou quand l'horizon d'une vraie
  base de données/serveur se précisera pour le projet.
- **Compétences dans le Lexique : écarté**, pas juste reporté. Cohérent avec la décision de Denis
  du 2026-09-09 (abandon du « grand sujet Lexique compétences », 80-120 fiches auraient dénaturé le
  Lexique en répertoire lourd). Le Lexique explique des notions qu'on ne comprend pas
  spontanément (jargon administratif/institutionnel) ; une compétence comme « Rigueur » n'a pas
  besoin de ce traitement, son descriptif contextuel (`DESCRIPTIFS_COMPETENCES`, étape 1) suffit.
  Seule nuance possible, non nécessaire ici : 1-2 fiches « comparatif » sur la distinction
  savoir-faire/savoir-être/savoirs elle-même, si le besoin se présente un jour.

---

## Non-négociables à vérifier à chaque étape (rappel)

- **Jamais de score/pourcentage affiché à l'utilisateur pour un métier.** Décision du 2026-09-15,
  fondée sur 2 éléments trouvés dans l'audit : (a) les 2 failles de `calculerScoreMetier()`
  peuvent gonfler artificiellement le score d'un profil incomplet ; (b) précédent produit déjà acté
  dans le module Bilan de candidature (`docs/ETAT_DES_CHANTIERS_2026-08-24.md:141`) : un « score de
  compétitivité chiffré » a été explicitement écarté au profit d'une échelle qualitative, pour ce
  même public à confiance fragile. La barre `% de cohérence` existante (accordéon replié « Pourquoi
  ces métiers ? ») n'est pas touchée par ce chantier mais reste un point de vigilance : elle
  affiche aujourd'hui un chiffre qui hérite des mêmes failles, et sa couleur (classes Bootstrap
  `bg-success`/`bg-info`/`bg-warning`/`bg-secondary`) n'a pas de valeur mode sombre : dette notée,
  hors scope de ce chantier sauf si Denis veut l'inclure.
- Mode sombre sur toute nouvelle variable de couleur (volet A).
- Français impeccable, aucun tiret cadratin, sur tout texte ajouté (intitulé du volet A, notes de
  gouvernance).
- Un commit par sous-étape, `npm test` + navigateur avant la suivante.
- `js/app.js` non couvert par les tests Node : vérification navigateur obligatoire pour les étapes
  1, 3, 5, 7.

---

## Chantier clos le 2026-09-16

Toutes les étapes engagées sont faites (0, 1, 2, 3, 6, 7) ou annulées comme inutiles (4 : pas de
garde-fou nécessaire, le mécanisme de l'étape 3 suffit ; 5 : le bloc « Métiers » existant couvrait
déjà le besoin, décision de Denis). Seul point resté volontairement hors chantier, documenté et non
engagé : la correction des 2 failles de `calculerScoreMetier()` (section « Documenté mais non
engagé » ci-dessus), à reprendre séparément si Denis le décide un jour, avec sa propre validation
(impact plus large que ce chantier, touche aussi le module Découverte).
