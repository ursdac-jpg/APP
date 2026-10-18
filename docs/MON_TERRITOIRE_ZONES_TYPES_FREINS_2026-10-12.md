# Mon territoire : zones, types, freins et rayons (P0.7 et P0.8) - 2026-10-12

> Conception de Claude, à valider par Denis. Fait suite à la seconde passe critique (`docs/SECONDE_PASSE_CRITIQUE_MON_TERRITOIRE_2026-10-12.md`, constats E1, E4, E5). Rien n'est codé.

## 1. Liste des types de structure, version 2 (28 types)
La lecture des 17 freins (`quiVoir`) fait apparaître des types absents de la première liste : France Services, service social de secteur, soins et addictions, inclusion numérique. **Les identifiants qui existent déjà dans le Lexique sont conservés tels quels** (`france-travail`, `mission-locale`, `cap-emploi`, `plie`, `caf`, `siae`), pour que le Lexique et le répertoire parlent de la même chose.

`france-travail` · `mission-locale` · `cap-emploi` · `plie` · `siae` (insertion par l'activité économique : ateliers et chantiers d'insertion, entreprises d'insertion, GEIQ) · `caf` · `caisse-assurance-maladie-retraite` · `ccas` · `service-social-secteur` (maison départementale des solidarités, assistante sociale) · `france-services` · `inclusion-numerique` · `creation-activite` · `formation-orientation` · `formation-jeunes` (E2C, EPIDE, écoles de production) · `logement-hebergement` · `mobilite-solidaire` · `aide-alimentaire-materielle` (banque alimentaire, épicerie sociale, Restos du Cœur, Secours populaire, Croix-Rouge) · `budget-endettement` (point conseil budget, UDAF, Banque de France) · `acces-au-droit` · `justice-insertion` (SPIP, sortants de détention) · `handicap` · `sante-soins-addictions` (CMP, CSAPA, centres de santé) · `soutien-aux-familles` · `petite-enfance` · `accueil-etrangers` · `francais-langue` (dont lutte contre l'illettrisme) · `appui-aux-employeurs` · `collectivite-etat` (conseil départemental, région, préfecture, DDETS). Tout type ajouté plus tard s'ajoute à la liste ; **on ne renomme jamais un type**.

## 2. Zones : un fichier unique, partagé (constat E4)
**Source de départ** : `docs/donnees_preparees/communes-24_api-geo_2026-10-12.txt` : **503 communes de la Dordogne et leur intercommunalité** (22 intercommunalités), préparées hors site, d'après le Code Officiel Géographique (Licence Ouverte 2.0, à citer avec la date). Conditions propres à l'API Géo non vérifiées : à contrôler, ou à refaire depuis le jeu de données data.gouv.fr du Code Officiel Géographique.

**Fichier des zones** (envisagé : `modules/mon-territoire/contenu/zones.txt`, même style que `liens-verifies.txt`) : `zone | libellé | contenu | source | date de vérification`, où `contenu` est une liste d'éléments `epci:<code>` ou `commune:<nom>`. Exemples de zones : « Grand Périgueux » = `epci:200040392` ; « Sud Dordogne (Mission locale du Bergeracois) » = à relever sur le site de la structure, à partir des 145 communes annoncées (ne pas deviner : plusieurs intercommunalités et peut-être des communes isolées) ; « Périgord Noir (Sarlat, Terrasson) » = à relever de même ; « commune » (CCAS) = la commune de résidence elle-même.
**Règle de lecture** : la personne donne sa commune ; l'application la retrouve dans la liste des 503, en déduit son intercommunalité, puis cherche la zone qui la contient. Si aucune zone ne la contient ou si la commune est inconnue : option C (toutes les structures du type, avec « selon votre commune de résidence »).
**Vérificateur** : une commune non couverte par une zone pour un type donné, ou couverte par deux zones du même type, est signalée.

## 3. Freins vers types (constat E5, tâche P0.8)
Ajouter à chaque entrée de `data/freins.js` un champ `types` (liste d'identifiants de la section 1). Proposition, tirée de `quiVoir` :

| Frein | Types proposés |
|---|---|
| alimentaire | ccas, service-social-secteur, aide-alimentaire-materielle |
| hebergement | logement-hebergement, ccas, service-social-secteur |
| mobilite | mobilite-solidaire, france-travail, mission-locale, service-social-secteur |
| materiel | ccas, aide-alimentaire-materielle |
| sante | sante-soins-addictions |
| handicap | handicap, cap-emploi |
| endettementAdministratif | budget-endettement, service-social-secteur, france-services |
| emploi | france-travail, mission-locale, plie, siae |
| formation | formation-orientation, france-travail, mission-locale |
| gardeEnfants | petite-enfance, caf |
| judiciaire | acces-au-droit, justice-insertion |
| langue | francais-langue, accueil-etrangers |
| illettrisme | francais-langue |
| illectronisme | france-services, inclusion-numerique |
| discrimination | acces-au-droit |
| violences | acces-au-droit, soutien-aux-familles (numéro national d'écoute affiché d'abord) |
| addiction | sante-soins-addictions |

**Précaution** : `violences` et `addiction` sont marqués « sensibles » dans `freins.js` (hors vue-liste en accès libre, formulation prudente). Le répertoire **n'affiche jamais ces deux freins dans une liste ouverte** et ne les met pas dans les résultats de recherche de l'accueil : mêmes règles que le fichier des freins.

## 4. Types par défaut par rayon de « Comprendre le cadre »
Un rayon affiche par défaut les structures de ses types ; une fiche peut en préciser d'autres plus tard.

| Rayon | Types par défaut |
|---|---|
| accompagnement | france-travail, mission-locale, cap-emploi, plie, siae, service-social-secteur |
| budget | budget-endettement, aide-alimentaire-materielle, caf, caisse-assurance-maladie-retraite, ccas |
| creer | creation-activite |
| emploi | collectivite-etat (inspection du travail), acces-au-droit, france-travail |
| employeurs | appui-aux-employeurs, creation-activite |
| etranger | accueil-etrangers, collectivite-etat, acces-au-droit |
| former | formation-orientation, france-travail |
| francais | francais-langue, accueil-etrangers |
| garde | petite-enfance, caf |
| handicap | handicap, cap-emploi |
| jeunes | mission-locale, formation-jeunes, logement-hebergement |
| juridique | acces-au-droit |
| justice | justice-insertion, acces-au-droit, logement-hebergement |
| logement | logement-hebergement, ccas, caf, collectivite-etat |
| mobilite | mobilite-solidaire |
| sante | caisse-assurance-maladie-retraite, france-services, sante-soins-addictions |
| seniors | caisse-assurance-maladie-retraite, france-services |

À vérifier à la migration de chaque rayon : le pilote Logement doit afficher au moins les 11 structures déplacées (audit, section 3).

## 5. Ce qui reste hors code et à relever à la main
Les zones des trois Missions locales de la Dordogne et des agences France Travail et Cap emploi (sites officiels), la liste des communes dans le cadre des CCAS (la commune elle-même), la vérification de la licence des conditions de l'API Géo.
