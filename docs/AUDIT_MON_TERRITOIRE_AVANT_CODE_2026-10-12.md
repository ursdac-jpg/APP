# Mon territoire : audit avant code (P0.6) - 2026-10-12

> Étape 4 de la méthode : comparer la maquette détaillée (`docs/MAQUETTE_MON_TERRITOIRE_DETAILLEE_2026-10-12.html`) au code réel, inventaire de l'existant du rayon pilote, verdict élément par élément. Brouillon de Claude, à valider par Denis. Rien n'est codé.

## 1. Décisions de Denis (2026-10-12)
D1 répertoire unique (oui), D2 communes option C, D3 pilote Logement et grande distribution à Bergerac, **D4 à D8 : oui à toutes les recommandations** :
- **D4** branches ajoutées : Créer son activité ; insertion par l'activité économique et intérim (dans Emploi) ; Accueil et langue ; Droits et justice.
- **D5** liste fermée des types (section 2).
- **D6** « Une information est incorrecte ? » : **le bouton est retiré** tant qu'il n'existe pas de boîte de réception réelle (à ajouter quand Denis fournit l'adresse). La page « Comment les fiches sont choisies » ne promet donc pas de réponse. Aucun engagement de revérification annuelle n'est écrit sans accord explicite de Denis.
- **D7** Fonction publique et Armées : branches séparées pour la personne, fiche employeur réutilisée.
- **D8** services en ligne et annuaires nationaux (19 entrées) hors du répertoire de lieux, gardés dans « Comprendre le cadre » comme sources datées.

## 2. Types de structure : liste fermée proposée (D5), 24 types
france-travail ; mission-locale ; cap-emploi ; ccas ; caisse-protection-sociale (CAF, CPAM, MSA, retraite) ; insertion-activite-economique (SIAE, PLIE, GEIQ, maison de l'emploi) ; creation-activite ; formation-orientation ; logement-hebergement ; mobilite-solidaire ; aide-alimentaire-budget ; acces-au-droit ; justice-insertion (SPIP, sortants de détention) ; handicap ; soutien-aux-familles ; petite-enfance ; accueil-etrangers ; francais-langue ; appui-aux-employeurs (santé au travail, URSSAF, inspection du travail) ; conseil-departemental ; region ; prefecture-etat ; retraite-seniors ; formation-jeunes (E2C, EPIDE, écoles de production). Les deux trop larges de l'extraction sont coupées : « accueil-etrangers-francais » en accueil-etrangers et francais-langue ; « acces-au-droit-justice » en acces-au-droit et justice-insertion. Les types peuvent être précisés à la migration de chaque rayon ; **un type ajouté plus tard coûte peu, un type renommé coûte cher** : on ne renomme pas, on ajoute.

## 3. Inventaire du rayon pilote : Logement (13 lignes de structures)
Étiquettes : DÉPLACÉ (la donnée vit désormais dans le répertoire, le rayon y renvoie) ; GARDÉ (reste tel quel dans le rayon) ; FUSIONNÉ.

| Ligne actuelle | Portée | Étiquette | Remarque |
|---|---|---|---|
| 115-samu-social | national | DÉPLACÉ | type logement-hebergement |
| siao-dordogne | 24 | DÉPLACÉ | **aussi cité dans le rayon Justice** : la ligne de Justice reste GARDÉE jusqu'à la migration de ce rayon, puis FUSIONNÉE |
| accueils-de-jour-dordogne | 24 | DÉPLACÉ | |
| ccas-domiciliation | national | DÉPLACÉ puis FUSIONNÉ | même type que `ccas-mairie` et `ccas-commune` (autres rayons) : un seul type « ccas », structures par commune |
| conseil-departemental-dordogne-fsl | 24 | DÉPLACÉ | type conseil-departemental |
| adil-dordogne | 24 | DÉPLACÉ | |
| action-logement-nouvelle-aquitaine | région | DÉPLACÉ | |
| caf-dordogne-logement | 24 | DÉPLACÉ puis FUSIONNÉ | même structure que `caf-dordogne` (rayons Budget, Garde) : plusieurs « services », une structure |
| prefecture-dordogne-dalo | 24 | DÉPLACÉ | type prefecture-etat |
| habitat-jeunes-perigord | 24 | DÉPLACÉ | |
| asso-soliha-dordogne | 24 | DÉPLACÉ | |
| asso-soliha-limousin | 87 | **GARDÉ** | affichage actuel conservé pour la Haute-Vienne |
| asso-adil-87 | 87 | **GARDÉ** | idem |

Aucune ligne n'est RETIRÉE. **Règle de bascule** : pour un visiteur de la Dordogne, l'écran « Près de chez moi » du rayon Logement lit le répertoire ; pour un visiteur de la Haute-Vienne ou d'ailleurs, il garde l'ancienne lecture jusqu'à la migration du 87. Les anciennes lignes restent dans le fichier de collecte jusqu'à la validation de Denis. **Contrôle automatique** : chaque identifiant déplacé existe dans le répertoire ; le nombre de structures affichées pour la Dordogne avant et après est identique ou supérieur.

## 4. Code touché et tests à garder verts
- Touchés : `modules/comprendre-le-cadre/index.js` (`_comprendreLeCadreChargerStructuresRayon`, `_comprendreLeCadreRenduStructures`, aiguillage par département), `data/baseConnaissancesERIP.js` (nouveau groupe de recherche), `js/app.js` (route du module, tuile d'accueil), `outils/veilleDepot.js` (nouvelle destination fermée), nouveau dossier `modules/mon-territoire/`.
- **Jamais modifiée sans grep global** : `demanderDepartementSiInconnu` (5 usages dans `js/app.js` et utilisée par d'autres modules).
- Tests existants à conserver verts : `tests/comprendreLeCadreLogique.test.js` (lecture du registre de liens et portées), `tests/veilleLiens.test.js`, `tests/veilleDepot.test.js`, `tests/baseVeille.test.js`, suite complète `npm test`, essais navigateur du module.

## 5. Verdict élément par élément de la maquette

| Élément | Verdict | Détail |
|---|---|---|
| Barre d'étapes, bouton « Revoir la présentation », tuiles, encarts, dépliants, barre « Retour / Accueil » | **Faisable tel quel** | Composants existants (`barreEtapesModule`, `htmlBoutonRevoirModule`, `.sous-carte-accueil`, `.bloc-depli`, `barreNavigation`). |
| Page de présentation du module | **Faisable, texte à écrire** | Patron de `LANGAGE_VISUEL_COMMUN.md` section 5, famille 1 (consultation). Texte à valider par Denis. |
| Retour exact à la fiche d'origine | **Faisable tel quel** | `definirRetourModuleExterne` accepte une fonction ; à tester contre les boucles. |
| Liste des 21 secteurs avec icônes et exemples de métiers | **Faisable avec un ajustement** | Les exemples viennent de `metiersPhares` de `data/secteurs.js` (une seule source) ; les icônes sont à ajouter dans les données du module, pas dans `secteurs.js`. |
| Liste, fiche employeur, fiche concours, fiche structure | **Faisable tel quel** | Rendu neuf, lecture du registre. |
| Choix de la commune | **Ajustement à décider (D9)** | La fenêtre commune « Votre département » ne demande que le département. L'élargir toucherait une fonction partagée (risque haut). **Recommandation : un champ de commune sur la page d'accueil du module (« Changer »), sans fenêtre**, ce qui respecte aussi ta règle « tout sur la page ». |
| « Copier l'adresse » | **Faisable tel quel** | Mécanisme de copie existant à réutiliser. |
| « Écrire une candidature spontanée à cet employeur » | **Faisable avec réserve** | Le parcours actuel exige entreprise et poste ; passer le nom d'employeur est à auditer. **Si ce n'est pas simple, le bouton est absent en V1** (jamais un bouton mort). |
| « Me former pour ce secteur » | **Faisable, conditionné** | Affiché seulement quand la branche Formation a une liste pour ce secteur ; sinon masqué. |
| « Voir les métiers de ce secteur » | **Faisable, route à confirmer** | Fiches de secteur existantes (chantier « Candidater depuis la recherche + secteurs »). |
| Recherche du module et de l'accueil | **Faisable avec un ajustement** | Index généré par script (modèle `lexique-renvois-cadre.js`), test de fraîcheur. |
| « Une information est incorrecte ? » | **Retiré (D6)** | Maquette à mettre à jour. |
| Pastilles « Comment candidater ici ? » | **Faisable tel quel** | `badge rounded-pill`, informatives. |
| Boutons d'appel `tel:` | **Faisable tel quel** | Affichés seulement si le numéro est daté et récent. |

## 6. Points bloquants ou imprévus
- **Aucun point bloquant.** Trois points sensibles : la fonction partagée `demanderDepartementSiInconnu` (D9), la structure `siao-dordogne` partagée entre Logement et Justice, et le parcours de candidature spontanée qui exige entreprise et poste.
- **Simple** : lecture d'un fichier texte, composants existants, vérificateur sur le modèle de `checkLexique.js`.
- **Risqué** : l'aiguillage par département dans l'écran « Près de chez moi » (risque de régression sur la Haute-Vienne, déjà déployée chez le partenaire).

## 7. Verdict mode nuit pour la phase 1
**NON APTE pour l'instant.** Il reste à Denis : valider la maquette détaillée, trancher **D9** (commune en champ sur la page, recommandé), valider les textes publics (présentation, « Comment les fiches sont choisies »). Dès ces trois points levés, la phase 1 devient apte.
