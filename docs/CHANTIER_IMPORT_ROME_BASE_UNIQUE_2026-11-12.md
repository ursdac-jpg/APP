# Chantier : tous les métiers du ROME dans une base unique (consigne 263)

Créé le 12/11/2026. **État : phase 1 faite le 12/11/2026 (générateur, fichier généré, échantillon de 30 fiches à relire par Denis). Rien n'est encore branché à l'application (phase 2).**

## 1. La consigne de Denis

- Importer les 1 923 fiches ROME (France Travail, version 62) **dans la même base que les 139 métiers déjà détaillés** : une seule base, jamais deux sources de vérité, pas de conflit entre les métiers déjà répertoriés et les nouveaux.
- Ensuite, décliner pour tous ces métiers les compétences (comme pour les 139) et les classer dans leur secteur d'activité.
- Bénéfices voulus : (a) créer un CV **sans assistant en ligne** avec toutes les compétences d'un métier proposées par le code ; (b) **alléger les consignes** du CV avec assistant : il ne cherche plus les compétences du métier, seulement les compétences complémentaires à celles que le code donne déjà ; (c) tous les autres modules profitent de la même base.
- Ne créer ni régression ni conflit.

## 2. Mes propositions précédentes restent-elles valables ?

**Non, une est abandonnée et une est confirmée.**

| Proposition précédente | Verdict | Pourquoi |
|---|---|---|
| Fichier à part, chargé au besoin, pour les métiers du ROME | **Abandonnée** | Deux endroits à tenir, et la décision de conception de `js/app.js` (« les métiers du répertoire élargi restent hors de `baseMetiers` ») devient un obstacle : un métier recommandé hors de la base n'a pas de fiche pour les 18 appels `metierParNom`. Denis veut une seule base. |
| Tout dans `baseMetiers` | **Retenue, avec garde-fous** | C'est la bonne cible. Le risque (25 endroits qui lisent la base) se maîtrise par un champ de niveau et des protections ciblées, voir les sections 4 et 5. |
| Lots de dix fiches à la main | **Gardée comme voie de promotion** | Une fiche ROME qui mérite d'être enrichie à la main (phrases pour le CV, la lettre, l'entretien) passe dans le niveau « détaillée », comme le lot textile. |

## 3. Ce que j'ai mesuré (prototype jetable, rien dans le dépôt)

Prototype : les 1 923 fiches ROME étiquetées avec les tables de correspondance existantes (`scripts/couvertureListesParcours.js`) puis comparées aux 139 fiches détaillées avec le vrai moteur de score.

| Mesure | Résultat | Lecture |
|---|---|---|
| Fiches sans aucune action reconnue | **4 sur 1 923** | La correspondance entre les 84 « objectifs » du ROME et nos 51 actions est quasi complète : déduire les listes mécaniquement est faisable. |
| Actions par fiche, sans plafond | **10,7 en moyenne** (contre 3 à 5 pour les fiches détaillées) | Trop long : il faut un plafond, sinon ces fiches obtiennent trop facilement 100 %. |
| Poids du fichier généré | **environ 800 Ko** compacté (la base actuelle `data/metiers.js` pèse 790 Ko) | Le fichier total double environ. Les savoir-faire et savoir-être n'ont pas besoin d'être stockés : ils se déduisent des choix au chargement. |
| Fiche détaillée retrouvée dans le top 5 avec ses propres choix | **137 sur 139** avant, **137 sur 139** après | Pas de régression sur les 139 métiers, même sans plafond. |
| Places du top 5 prises par une fiche ROME | **33 %** (sans plafond) | Les fiches ROME entrent dans les propositions, comme voulu, mais il faut s'assurer qu'elles ne chassent pas systématiquement les fiches soignées : plafond de listes et départage en faveur des fiches détaillées à score égal. |

Limite honnête : c'est un ordre de grandeur sur des profils fabriqués à partir des fiches détaillées elles-mêmes, pas une preuve de qualité sur de vraies personnes. L'étiquetage automatique est une approximation : les fiches ROME auront des listes justes dans l'ensemble, mais sans les phrases rédigées (accroches CV, lettre, entretien).

## 4. Organisation recommandée : une base, deux niveaux de finesse

**Une seule base logique** : le tableau `baseMetiers`, le même format de fiche, le même espace d'identifiants, les mêmes tests. Un champ `niveau` (`detaillee` ou `rome`) dit la finesse de la fiche. Aucune fiche n'existe en double : un code ROME est soit détaillé à la main, soit généré, jamais les deux.

**Deux fichiers sources, une seule base au chargement** :
- `data/metiers.js` : les fiches détaillées, écrites à la main (139 aujourd'hui), inchangé dans sa forme.
- `data/metiersRome.js` : les fiches du ROME, **générées par un script, jamais modifiées à la main**. Le script ignore les codes déjà détaillés dans `data/metiers.js` ; si on enrichit une fiche à la main, elle est déplacée dans `data/metiers.js` et disparaît au prochain calcul du fichier généré.
- Au chargement, une seule instruction fusionne les deux : toute l'application voit **un seul tableau**.

Pourquoi pas un seul fichier physique : un fichier de 2 Mo mélangeant texte écrit à la main et lignes générées serait dangereux à éditer (la régénération écraserait les retouches) et pénible à relire. Le résultat pour l'application est pourtant le même : un seul tableau, une seule source par métier.

Contenu d'une fiche de niveau `rome` : identifiant (`rome_` + code), nom (intitulé principal du ROME au masculin, comme la base), secteur (le domaine du répertoire, déjà aux 21 libellés de l'application), code ROME, publics et matières, actions (plafond de 6), lieux, savoir-faire et savoir-être déduits des choix, savoirs du ROME (sans titre, diplôme, permis ni habilitation, règle déjà testée), listes d'accroches vides.

## 5. Conséquences sur l'existant, endroit par endroit

| Endroit | Effet avec 1 900 fiches de plus | Traitement |
|---|---|---|
| Propositions de métiers de « Votre parcours », métiers proches, panneaux « compétence recherchée dans » (`rechercherMetiers`, `trouverMetiersAssocies`) | Plus de métiers trouvés : c'est le but | Plafond de listes + départage en faveur du niveau `detaillee` à score égal |
| Retrouver une fiche par son nom (`metierParNom`, 18 appels) | Plus de fiches retrouvées | Aucun changement de code ; vérifier la gestion des féminins et des doubles intitulés |
| CV : compétences de référence du métier (`moteurDecisionCV`) | Meilleur : la plupart des métiers ont enfin des compétences | Aucun changement de code |
| Outil de lecture d'offre (ATS), `bilanSecteurDepuisMetierLibre` | Vocabulaire plus riche, meilleure reconnaissance du secteur | Vérifier le temps de calcul |
| Métier choisi dans le répertoire élargi (13 853 intitulés, `js/app.js` autour de la ligne 9053) | Aujourd'hui « sans fiche complète » | Rattacher le code ROME du choix à sa fiche dans la base : le cas « sans fiche » disparaît |
| Statistiques par secteur (`competencesFrequentesDuSecteur`, `secteursDisponibles`, `exemplesMetiersDuSecteur`) | Elles changeraient de nature (comptes, tri des raccourcis) | À protéger : calculer sur le niveau `detaillee` tant que les fiches ROME n'ont pas été relues |
| Tests (`secteursMetiers.test.js`, `metiersSavoirsSansTitres.test.js`) et `scripts/checkCompetences.js` | Effectifs figés à 139, seuils de fréquence rapportés au total | Distinguer « fiches détaillées » et « total » ; seuils sur les détaillées |
| Mots-clés de la base de connaissances et du Lexique (`baseConnaissancesERIP.js`, `extractionConceptsERIP.js`) | Plus de termes | Contrôle `checkLexique.js` et lecture d'un échantillon |
| Poids de chargement (public avec appareils modestes) | Environ 800 Ko de plus | Format compact ; mesurer le temps de chargement avant et après sur le téléphone de test |

## 6. Plan en phases (une phase = un commit vérifié)

| Phase | Contenu | Effort |
|---|---|---|
| 1 | **FAIT le 12/11/2026, relecture de Denis attendue.** **Générateur** `scripts/importRome/` : lit les CSV du ROME, applique les tables de correspondance (84 objectifs, publics, lieux, matières), produit `data/metiersRome.js` et un **rapport d'échantillon** (30 fiches tirées au sort, à relire par Denis). Rien n'est branché. | `[effort : haut]` |
| 2 | **Branchement** : fusion au chargement, champ `niveau`, plafond et départage dans le score, protections des statistiques par secteur, tests réécrits (détaillées / total), test permanent « les 139 fiches restent trouvées avec leurs propres choix » | `[effort : haut]` |
| 3 | **Vérification navigateur** : parcours « Créer un nouveau CV » à la main et avec assistant, métiers proposés, Découvrir mes compétences, lecture d'offre, secteurs, métier choisi dans le répertoire élargi, chargement sur écran étroit | `[effort : moyen]` |
| 4 | **Compétences finement déclinées** (la demande de Denis) : des 489 macro-compétences du ROME vers notre vocabulaire de savoir-faire et savoir-être, pour remplacer les listes déduites des actions | `[effort : haut]` |
| 5 | **Créer un CV sans assistant** et **consignes allégées** avec assistant : chantiers séparés, après stabilisation de la base (le séquencement existant est maintenu : modules, stabilisation, accessibilité, puis découpage de `app.js`) | `[effort : haut]` chacun |
| 6 | **Veille du ROME tous les six mois** : script de comparaison de deux versions, rapport d'écarts, journal, rappel programmé (voir section 8) | `[effort : moyen]` |

## 7. Ce que je décide seul (technique) et ce qui reste à Denis

Décidé : le champ `niveau`, les plafonds de listes, le départage, la protection des statistiques, le format compact.

À valider par Denis avant la phase 2 : **la lecture de l'échantillon de 30 fiches** produit par la phase 1 (« est-ce que ces listes décrivent bien le métier ? »). Si trop de fiches sont fausses, on corrige les tables avant tout branchement.

## 8. Entretien dans le temps : la veille du ROME tous les six mois (demande de Denis, 12/11/2026)

Idée de Denis, confirmée comme bonne direction et réalisable : **une seule base**, avec une partie **à la main** (les fiches détaillées, où l'on décline les compétences, savoirs, savoir-faire et savoir-être, toujours fortement inspirés de la fiche ROME) et une partie **générée** (tout le reste). Tous les six mois, on compare la nouvelle version du ROME à la nôtre.

**Ce qui existe déjà (phase 1)** : `scripts/importRome/lireRome.js` lit un paquet ROME ; `docs/suivi_rome/empreintes_ROME.json` garde, pour chacun des 1 923 codes de la version 62, son libellé, son nombre d'appellations et une **empreinte** (qui change dès que le libellé, les appellations, les compétences, les savoir-être, les savoirs ou les contextes changent).

**Marche à suivre prévue (phase 6)**

1. Apporter le nouveau paquet CSV du ROME (téléchargement officiel de France Travail, à faire à la main ou via l'outil de veille).
2. Un script de comparaison produit un rapport : codes **nouveaux**, codes **supprimés**, **intitulés changés**, fiches dont le **contenu a changé** (empreinte), **appellations** nouvelles ou disparues (c'est ce qui nourrit les synonymes de la recherche : `data/repertoireRome.js` est régénéré).
3. Fiches de niveau `rome` : régénérées automatiquement, rien à faire.
4. Fiches **détaillées** dont la fiche ROME a changé : liste « à relire » avec ce qui a bougé ; Claude propose l'adaptation dans la base, Denis valide.
5. Codes **nouveaux** : la fiche générée est utilisable tout de suite ; l'enrichissement à la main vient ensuite, dans l'ordre que Denis choisit.
6. Chaque écart est noté dans un journal daté (`docs/suivi_rome/JOURNAL_VEILLE_ROME.md`), pour répertorier les différences entre notre base et celle de France Travail.
7. Rappel tous les six mois dans `outils/taches_programmees.json` (à ajouter avec l'accord de Denis, après le branchement de la phase 2) et marche à suivre dans `docs/VERIFICATIONS_A_DATE_FIXE.md`.

**Limites honnêtes** : le paquet ROME ne se télécharge pas tout seul ; la comparaison est automatique, mais le jugement (adapter ou non une fiche) reste à Denis et Claude ; une empreinte change aussi pour une correction de forme sans importance, d'où un rapport qui montre ce qui a bougé pour trier vite.

## 9. Résultat de la phase 1 (12/11/2026)

- **Produit** : `scripts/importRome/` (`lireRome.js` lecture du paquet, `tablesRome.js` correspondances à relire, `genererMetiersRome.js` générateur), `data/metiersRome.js` (**1 791 fiches générées**, 129 codes déjà détaillés ignorés, 3 codes rattachés par alias à une fiche du même nom : Couvreur, Développeur informatique, Logisticien), `docs/ECHANTILLON_METIERS_ROME_2026-11-12.md` (30 fiches à relire), `docs/suivi_rome/empreintes_ROME.json`, `tests/metiersRome.test.js` (7 tests de cohérence). `npm test` : 2 708 verts.
- **D'où viennent les listes** : actions, lieux, publics et matières se déduisent des catégories du ROME (84 objectifs, contextes, sous-catégories de savoirs) avec plafonds ; **les savoir-être viennent directement du ROME** (16 savoir-être professionnels, présents sur 1 918 codes) ; les savoirs sont ceux du ROME, sans titre ni certification ; les savoir-faire se déduisent des actions et matières retenues.
- **Corrigé après la première relecture de 30 fiches** : noms mal assemblés (« Economiste financier financière »), lieu « Route / Transport » ajouté à tous les métiers à déplacements, actions parasites (« Saisir », « Vendre », « Conseiller », « Appliquer les règles de sécurité » déduits d'objectifs trop généraux), « Cabinet médical » donné à un notaire.
- **Reste imparfait, à juger par Denis sur l'échantillon** : 474 fiches n'ont qu'une ou deux actions (le seuil est volontairement strict), 14 sans « avec qui / avec quoi » et 67 sans lieu après le comblement des « rien » (avant : 129 et 207), 5 sans savoir-être, 5 sans savoir-être ; quelques secteurs viennent du classement du répertoire déjà en place (par exemple « Chargé de mission eaux pluviales » rangé en Social et services à la personne) et ne sont pas de notre fait.
- **Poids** : 1 216 Ko (la base à la main fait 790 Ko). Pistes pour la phase 2, à mesurer sur téléphone avant de choisir : ne pas stocker les savoir-faire (les déduire au chargement), index de secteur au lieu du libellé répété, chargement compressé par le serveur.

- **Combler les « rien » (retour de Denis, 12/11/2026)** : deux causes. (1) Trous d'**interprétation** de notre part : le ROME ne nomme pas toujours l'objet (soigner des animaux sans dire lesquels, cultiver sans dire quoi) ; on lit alors le titre et le texte de la fiche pour choisir l'animal ou le végétal (cheval, élevage, abeilles, animaux de compagnie, plantes). (2) Trous **réels du ROME** : métiers de gestion, de coordination ou de droit, où le ROME ne cite ni public ni matière ; on déduit alors, depuis les objectifs de compétences, « Des collègues », « Des documents », « Des clients », « Un ordinateur »..., au plus 2 déductions, seulement si le ROME donne moins de 2 choix. Lieux : à défaut, déduits de l'objectif (conduite : route ; stockage : entrepôt) puis du secteur de bureau (informatique, administration, banque : bureau). Règles dans `tablesRome.js` (`OBJECTIFS_ACTIVITES`, `OBJECTIFS_LIEUX`, `LIEU_PAR_DEFAUT_DU_SECTEUR`), à relire par Denis. Restent vides les cas où rien ne permet de deviner (par exemple artiste de complément, professeur à domicile) : ils ne seront pas inventés.

- **Cartes qui n'étaient jamais produites (question de Denis, 12/11/2026)** : toutes les cartes de « Avec qui, avec quoi » existent dans l'application ; les choix déduits (collègues, documents, clients, ordinateur, chevaux, patients, machines, outils) sont tous des cartes du catalogue (test de vocabulaire). Le ROME ne dit rien d'inconnu sur les publics et les structures : tout ce qu'il nomme en public ou en lieu est déjà relié, le reste n'est que conditions de travail (déplacements, EPI, horaires, statut). Le vrai défaut était dans l'import : 5 cartes d'actions et 2 cartes de matière ou de lieu n'étaient jamais choisies (rédiger, installer, monter, découper, imaginer, appareils numériques, espaces verts). Corrigé par la lecture du verbe des compétences, des outils numériques et du titre du métier ; « Imaginer » reste presque jamais produite, car le ROME parle de « concevoir ».

## 11. Résultat de la phase 2 : branchement (12/11/2026)

- **Une seule base** : `data/metiers.js` garde les 139 fiches à la main (`baseMetiersDetaillees`, `niveau: 'detaillee'`) puis y ajoute les 1 791 fiches générées (`data/metiersRome.js`, chargé avant dans `index.html`) : `baseMetiers` = 1 930 fiches, détaillées toujours en premier.
- **Départage** : `comparerMetiersParScore` (à score égal, la fiche détaillée passe avant), utilisé par `rechercherMetiers` et `metiersTriesParPertinence`. Test permanent : les 139 fiches restent dans les 5 premières avec leurs propres choix.
- **Statistiques protégées** : `secteursDisponibles`, `exemplesMetiersDuSecteur`, `competencesFrequentesDuSecteur` calculent sur les fiches détaillées seules.
- **Recherche d'accueil inchangée** : les fiches générées n'y apparaissent pas (sinon « agent » donnait 89 cartes) ; leurs intitulés arrivent par le répertoire élargi, qui ne les écarte plus. Les savoirs des fiches générées ne vont pas non plus dans la recherche (164 lignes pour « sécurité »).
- **Fiche retrouvée par le code du ROME** : `metierParNom` retombe sur `ficheDeIntituleChoisi` quand un intitulé du répertoire élargi a été choisi (registre en mémoire, puis le code gardé dans `dossier.secteurMetierSaisi.rome` après rechargement) : le CV, les pistes et le composeur lisent alors les savoir-faire, savoir-être et savoirs de la fiche.
- **Mesuré dans le navigateur** : page prête en 265 ms sur le poste de test, aucune erreur ; à mesurer sur téléphone en phase 3.
- **Reste pour la phase 3** : parcours réels (Créer un nouveau CV, Découvrir mes compétences, lecture d'offre, Comparer mes pistes), vérifier les panneaux « compétence recherchée dans » (plus de métiers, tri par pertinence), poids sur écran étroit.

## 12. Listes trop courtes complétées, passage en fiche écrite à la main, veille (12/11/2026)

- **Savoir-être et savoir-faire manquants (question de Denis)** : le ROME lui-même ne donne aucun savoir-être pour 5 codes (sur 1 923) et nos actions n'ont pas toujours de savoir-faire (« Accompagner » n'en a aucun : masseur bien-être, assistant familial). Ce n'est donc ni un lien perdu à l'import ni un métier sans qualité : c'est un trou du ROME ou de notre table. Corrigé : toute fiche à moins de 3 savoir-faire (37 fiches) ou 3 savoir-être (26 fiches) reçoit d'abord ceux des choix retenus, puis les plus fréquents des métiers du même secteur. Résultat : plus aucune fiche sans savoir-faire ni sans savoir-être. Ce sont des déductions de notre fait, à relire. La vraie précision viendra de la phase 4 (macro-compétences du ROME).
- **Passage d'une fiche du ROME à une fiche écrite à la main** : une seule base, toujours. La fiche quitte le fichier généré (`data/metiersRome.js`) pour `data/metiers.js` ; le code ROME ne peut être qu'à un seul endroit (test existant). À construire avant le premier passage : un petit script `promouvoirFiche` qui recopie la fiche générée dans `data/metiers.js` (avec son code ROME) pour qu'on parte de ses listes au lieu d'une page blanche, puis le générateur l'ignore tout seul.
- **Veille du ROME dans l'outil de veille** : possible, c'est la phase 6. Un onglet « Métiers du ROME » comparerait l'empreinte de chaque code (`docs/suivi_rome/empreintes_ROME.json`) avec le nouveau paquet : codes nouveaux, supprimés, intitulés ou compétences changés, nouvelles appellations. Une fiche générée se met à jour toute seule ; une fiche écrite à la main n'est jamais modifiée seule : l'écart est affiché pour que Denis décide.

- **« À savoir sur ce métier » (décision Denis 12/11/2026)** : les conditions de travail du ROME (63 libellés, regroupés en 18 phrases et 4 statuts) sont générées pour tous les codes dans `data/conditionsRome.js` (105 Ko, 1 876 codes sur 1 923, fiches à la main comprises) et affichées seulement en bas de la fiche d'un métier (`aSavoirSurLeMetierHTML`, js/app.js). Jamais une question, jamais un score. Règles : `CONDITIONS_REGLES` dans `tablesRome.js`. Reste : vérifier le rendu sur téléphone (phase 3).

## 13. Résultat de la phase 3 : vérification dans le navigateur (12/11/2026)

- **Parcours vérifié** : « Créer un nouveau CV » avec l'assistant, objectif « Candidature spontanée », « Un métier précis », saisie « bûcheron » : les deux intitulés du répertoire (Bûcheron, Bûcheron élagueur) sont proposés, le métier choisi garde son code du ROME (A1201), sa fiche est retrouvée, « Votre parcours » et « Votre profil » s'affichent sans erreur (15 métiers proposés, 23 compétences). Aucune erreur dans la console.
- **Lenteur trouvée et corrigée** : avec 1 930 fiches, le calcul des métiers proposés prenait environ 210 ms sur le poste de test (donc 1 s ou plus sur un petit téléphone). La normalisation des textes est maintenant mémorisée (`normaliserTexte`, `motsCles`, mémoire bornée à 30 000 entrées) : environ 5 ms. Résultats identiques, tests verts.
- **Écran étroit (375 px)** : le bloc « À savoir sur ce métier » ne déborde pas, aucun défilement horizontal, page prête en 283 ms.
- **Vérifiés sans erreur** : lecture d'offre (ATS : 1 930 fiches pour le vocabulaire, 2 ms), Comparer mes pistes, panneau « compétence recherchée dans » (1 178 métiers pour « Rigueur », tri par pertinence en 123 ms avant mémorisation), secteur d'un métier saisi librement (« élagueur » donne Agriculture).
- **Observation à trancher par Denis** : les fiches du ROME, bien plus nombreuses (1 791 contre 139), prennent la plupart des premières places des métiers proposés (sur un profil d'essai : Maçon, puis quatre fiches du ROME avant Vigneron). C'est le but (plus de métiers trouvés) mais la qualité de certains rapprochements est faible (« Technicien-cuisiniste », « Agent technique d'affichage » pour un profil nature et machines). Option : un léger avantage aux fiches écrites à la main, ou attendre leur enrichissement. Rien n'est changé pour l'instant.
- **Pas vérifié** : un téléphone réel (seulement un écran émulé à 375 px, sans ralentissement du processeur) ; « Découvrir mes compétences » n'utilise pas la base des métiers (aucun usage trouvé), donc non concerné.

## 14. Résultat de la phase 4 : compétences finement déclinées (12/11/2026)

- **Choix de Denis : option B** (traduire vers le vocabulaire existant ET ajouter des mots). 29 mots ajoutés à `data/competences.js`, chacun avec son descriptif : 23 savoir-faire (Informatique, Contrôle qualité, Prévention des risques, Comptabilité, Conception, Veille et recherche, Création graphique, Audiovisuel, Marketing, Vente, Réglementation, Ressources humaines, Conduite de chantier, Soins aux animaux, Culture et récolte, Médiation, Organisation d'événements, Fabrication, Utilisation de machines, Protection de l'environnement, Achats, Pilotage d'activité, Gestion documentaire) et 6 savoir-être (Esprit d'analyse, Curiosité, Concentration, Esprit d'initiative, Sens de l'éthique, Sens du dialogue). Le vocabulaire passe de 108 à 137 mots. Aucun mot ne contient « IA ».
- **Table de traduction** : `scripts/importRome/tablesCompetences.js`. 83 lignes (une par objectif du ROME) et 191 règles plus précises sur le libellé de la macro-compétence (la première qui correspond l'emporte sur la ligne de l'objectif). Chaque ligne donne les savoir-faire (`sf`), les savoir-être (`se`) et parfois un savoir (`sv`, par exemple langues étrangères). Le générateur refuse la table si un mot n'existe pas ou est rangé du mauvais côté.
- **Calcul d'une fiche** (`genererMetiersRome.js`, fonction `motsDuCode`) : on compte les compétences du code qui mènent à chaque mot, on multiplie par la rareté du mot dans l'ensemble du ROME (un mot présent partout, comme « Rigueur », pèse peu), on écarte les mots qui pèsent moins de 12 % du premier, on garde 6 savoir-faire au plus. Les savoir-être que le ROME donne lui-même restent en premier (4 au plus), complétés par ceux traduits des compétences. Les savoir-faire déduits des actions ne servent plus qu'à compléter jusqu'à 3.
- **Mesure avant / après (1 791 fiches)** : savoir-faire différents employés 45 puis 77 ; « Technique » dans 57 % des fiches puis 23 %, « Précision » 53 % puis 14 %, « Analyse de données » 47 % puis moins de 14 % ; les 1 791 fiches gardent au moins 3 savoir-faire et 3 savoir-être ; 4 fiches seulement gardent exactement leurs anciens savoir-faire. Compléments « par secteur » encore nécessaires : 6 fiches (savoir-faire) et 2 (savoir-être), contre des dizaines avant.
- **Pour le CV** : rien ne disparaît. Les listes `savoirFaire`, `savoirEtre`, `savoirs` restent dans chaque fiche, au même format. Le test `tests/competencesRome.test.js` échoue si une fiche perd ses listes (moins de 3 savoir-faire ou savoir-être, aucun savoir), si un mot sort du vocabulaire ou du bon côté, si une règle cite un mot sans descriptif, ou si un mot devient passe-partout (plus de 40 % des fiches).
- **Fiches écrites à la main** : non touchées. Les nouveaux mots n'y apparaissent que si on les y ajoute (ou via `promouvoirFiche.js`).
- **À relire par Denis** : les règles de `tablesCompetences.js` (ce sont des déductions de notre fait) et les 29 descriptifs. Le mot « Concentration » n'apparaît dans aucune fiche pour l'instant (les places de savoir-être sont prises par ceux du ROME) : il reste disponible.
- **Pas fait** : relier les nouveaux mots aux cartes du catalogue (elles gardent leurs anciens savoir-faire), pondération du classement par le poids des compétences (idée notée dans `docs/IDEES_A_RECLASSER.md`).

## 15. Suite de la phase 4 (12/11/2026, validée par Denis : 1 puis 2 puis 3)

- **Étape 1 faite : 42 fiches écrites à la main complétées.** Elles avaient moins de 3 savoir-faire ou 3 savoir-être (4 en avaient moins de 2). Script `scripts/importRome/completerFichesMain.js` (essai à blanc puis `--ecrire`) : ajouts seulement, à la fin de la liste, jusqu'à 3, avec la même traduction que les fiches générées (calcul partagé dans `scripts/importRome/traducteurCompetences.js`). « Bureautique » est exclu de ces ajouts (il sortait pour un chauffeur). Deux mots corrigés à la main (chauffeur routier : Manutention ; animateur événementiel : Organisation d'événements). Webmaster et technicien son et lumière n'ont pas de code ROME : rattachés aux codes M1805 et L1504 pour le calcul. Test ajouté : toute fiche à la main a au moins 3 savoir-faire et 3 savoir-être.
- **Étape 2 faite : les 489 macro-compétences en phrases simples.** Fichier écrit à la main `scripts/importRome/phrasesMacros.js` (clé « objectif|libellé officiel », phrase à l'infinitif, sans jargon, sans jugement sur la personne). Le générateur produit `data/competencesRome.js` (184 Ko) : `phrases` (489), `objectifs` (l'objectif du ROME de chaque phrase), `parCode` (pour chacun des 1 923 codes, les numéros de ses phrases classés du plus au moins important ; 19 en moyenne, 52 au maximum). Rattaché à la fiche par son code ROME : ce n'est pas une seconde base de métiers. Exemple, hôte de caisse : « Tenir une caisse », « Traiter les réclamations et les litiges », « Organiser l'accueil du public »... Deux codes (C1129, C1216) n'ont aucune compétence dans le ROME 62 : sans phrase.
- **Veille** : si le ROME fait apparaître une macro-compétence nouvelle, le générateur s'arrête et la liste ; il suffit d'ajouter sa phrase dans `phrasesMacros.js`.
- **Pas encore branché** : le fichier n'est pas chargé par l'application (`index.html`). L'étape 3 (maquette et questions à Denis) décide où il s'affiche. Tests : `tests/phrasesMacros.test.js`.
- **À relire par Denis** : les 489 phrases (`scripts/importRome/phrasesMacros.js`). Le classement par poids vient du ROME : par exemple « Monter, assembler et démonter » remonte pour un hôte de caisse, car le ROME le décrit dans ses compétences ; l'affichage devra donc choisir un nombre limité de phrases et laisser la personne trier.
- **Étape 3 : où les afficher** : maquette et questions à Denis avant tout code.

## 10. Reprise

Prochaine étape : **Denis relit l'échantillon** (`docs/ECHANTILLON_METIERS_ROME_2026-11-12.md`) et répond fiche par fiche : juste, à peu près ou faux, avec ce qui manque ou gêne. Selon les réponses : corriger `tablesRome.js` et régénérer, ou lancer la phase 2 (branchement). Commande de régénération : `node scripts/importRome/genererMetiersRome.js "C:\Users\Denis\Documents\ROME_v62_donnees"`.

## 16. Fiches complètes du ROME, récupérées sans limite (12/11/2026)

Demande de Denis : récupérer tout ce qui est pertinent dans les fiches du ROME pour que le CV et les prompts inventent le moins possible, sans plafond.
- **Fait** : `data/rome/fiche_A.js` à `fiche_N.js` (14 fichiers, 7,1 Mo au total, le plus gros 1,16 Mo), générés par `genererMetiersRome.js`, **chargés à la demande** (jamais par `index.html`). Par code : `d` présentation, `m` missions, `a` accès au métier, `r` emploi réglementé, `k` toutes les compétences détaillées regroupées par macro-compétence (cœur de métier d'abord), `s` tous les savoirs par catégorie, `p` métiers proches. 1 923 codes, 10 138 missions, 47 480 compétences, 40 715 savoirs. Le mot « IA » est réécrit à la génération. Test : `tests/fichesRome.test.js`.
- **Limites connues** : 6 codes sans missions (repli sur les 489 phrases), 2 codes (C1129, C1216) sans aucune compétence dans le ROME lui-même.
- **Pas encore fait (en attente de Denis)** : le texte du ROME est parfois trop technique pour le public. Il ne sera pas affiché tel quel : réécriture en langage simple, et éventuellement adaptation au niveau du poste visé. Maquette et questions avant tout affichage.

## 17. Écran de choix des tâches : décisions du 13/11/2026

- **Présentation retenue par Denis : une famille de tâches par carte** (maquette v3 : `docs/maquettes/maquette-choix-cv-rome-v3-cartes-2026-11-13.html`). Repère « Carte 2 sur 6 » et barre, pause après les familles « au cœur du métier » (voir les autres ou passer), carte des outils, carte « Autre chose que vous faisiez ? » en mots libres, récapitulatif avec « Modifier », puis validation.
- **Trois échelons** : sans assistant (cartes directes, choix versés dans les missions), avec l'assistant comme aujourd'hui (prompt actuel inchangé), avec l'assistant et tâches cochées (second prompt choisi automatiquement). Au départ du parcours avec assistant : deux gros boutons, « L'assistant me propose des idées » et « Je choisis moi-même ce que j'ai fait ». Aucun niveau nommé « débutant » ou « autonome ».
- **Second prompt** : à rédiger après les essais réels de Denis (3 profils). Pas d'alourdissement de `prompts/cv.md`. Test à prévoir : les deux prompts demandent exactement les mêmes champs de réponse.
- **Reste à valider par Denis** : emplacement (recommandé : « Votre parcours », après les 3 cartes, seulement quand un métier est visé), une liste pour le métier visé plutôt que par expérience, rien d'affiché sans métier visé, titres de famille trop généraux à corriger à la main.
- **Ordre de travail** : 1) fiche en lecture seule, 2) écran de choix et parcours sans assistant, 3) second prompt.

## 18. Intégration dans les parcours (13/11/2026)

Maquette : `docs/maquettes/maquette-integration-taches-rome-dans-les-parcours-2026-11-13.html`. Un seul composant (les cartes de la maquette v3), six portes : Créer (avec l'assistant, à partir de mon récit, à la main) et Reprendre (garder et compléter, reformuler, sans assistant).
- **Créer avec l'assistant** : nouvelle étape « Vos tâches » après « Votre parcours », avec choix de départ (l'assistant propose / je choisis). **Créer à la main** : mêmes cartes, directement, les choix vont dans les missions. **Récit** : complément léger après « Compétences » (à décider). **Reprendre** : un bloc « Ajouter des tâches de mon métier » dans « Corriger mon CV », dans « Préparer » (reformuler, facultatif, à décider) et dans « Vérifier » (sans assistant).
- **Fiche du métier dans l'application** (idée de Denis, 13/11) : tout ce qui sert au CV reste chez nous pour tous les métiers ; le lien « Fiche du métier (France Travail) » (`lienFicheROME`, déjà en place) renvoie pour le reste (salaires, difficulté de recrutement, conditions).
- **Ordre proposé** : composant + « à la main », puis « avec l'assistant » (second prompt après essais), puis Reprendre, puis récit et reformuler.
- **Décisions de Denis en attente** : complément léger ou complet pour le récit ; ajout autorisé dans « reformuler » ; avertissement simple contre les doublons dans Reprendre ; nombre de prompts décidé après les essais.

## 19. Fiche complète d’un métier, codée derrière un interrupteur (13/11/2026)

- **Fait** : dans la fenêtre d’un métier (`ouvrirDescriptifMetier`), un bloc s’ajoute au-dessus des mots actuels : accès, ce que fait le métier, tâches concrètes par familles (cœur du métier d’abord, le reste sous « Voir les autres tâches »), outils et connaissances par catégorie, autres noms du métier, métiers proches, bouton « Voir la fiche complète sur France Travail » (salaires, conditions, difficulté de recrutement).
- **Fermée au public** : `FICHE_ROME_COMPLETE_OUVERTE = false` (`js/app.js`). Pour la voir : ajouter `?fiche_rome=1` à l’adresse de l’application. Pour l’ouvrir à tous : passer l’interrupteur à `true` sur le feu vert de Denis, puis ajouter la ligne au journal et à `data/nouveautes.js`.
- **Données ajoutées au générateur** : `n` (8 autres noms usuels du métier) dans chaque fiche, `categories` (noms affichés des catégories de savoirs) dans `data/competencesRome.js`. Fiches régénérées, 2 758 tests puis 2 759 verts.
- **Contrôlé dans le navigateur** : métier détaillé et métier généré, clair, sombre, mobile (375 px, aucun débordement après correction des étiquettes longues), interrupteur fermé = fenêtre inchangée, aucune erreur de console.
- **Non fait, à savoir** : les titres de famille viennent du ROME ; certains classements du ROME eux-mêmes sont étranges (une tâche de réglage de machines agricoles rangée sous « machine d’impression »). Une correction à la main est possible tâche par tâche, pas un renommage global. À relire par Denis pendant ses essais.
- **Question de Denis du 13/11 (reconversion)** : comparer les familles de tâches d’un ancien métier avec le métier visé marche pour des métiers proches (serveur vers vendeur : 5 familles sur 14) mais rate des évidences (vendeur vers conseiller bancaire : 0). Jamais afficher « rien en commun ». Pistes retenues pour l’écran de cartes : question de départ « ce métier, l’avez-vous déjà exercé ? », ordre inversé pour un métier nouveau (tâches communes à beaucoup de métiers d’abord), carte « où l’avez-vous fait ? », étiquette facultative « vous le faisiez peut-être déjà ». Maquette v4 à faire avant le code des cartes.


## 20. Maquette « fiche du métier sur la page + Candidater mis à jour » (13/11/2026)

Maquette : `docs/maquettes/maquette-fiche-page-et-candidater-2026-11-13.html` (4 écrans cliquables, vraies données de 3 métiers, mode sombre). **Aucun code d’application écrit.** Elle répond aux consignes 271 (fiche sur la page, boutons, légende des trois couleurs) et 273 (écran Candidater depuis la recherche).

Parcours réel constaté dans le code (js/app.js) :
- Aujourd’hui : clic sur un métier dans la recherche d’accueil -> `ouvrirPanneauChoixParcours` -> `rechercheGuidee` -> écran Candidater (`pageCandidaterDepuisRecherche`). La personne ne voit jamais la fiche.
- Sur l’écran Candidater, trois blocs : ce qu’on prépare (CV / lettre / entretien, stocké dans `rechercheGuidee.parcours`), la cible (offre précise ou recherche générale, `dossier.typeRecherche`), le CV (déjà un CV ? mise à jour ?).
- « Continuer » (`_candidaterFinaliser`) route ensuite : CV déjà dans l’application -> entretien (`ouvrirParcoursEntretien`) ou page `resultats` ; pas de CV -> page `objectif` du parcours « créer un CV » ; CV existant -> `reprendre-cv` (mise à jour) ou `preparer-lettre-entretien`.

Ce que montre la maquette : fiche en page (titre sans lien, boutons Candidater / France Travail / Comparer / Garder, trois colonnes de compétences avec point de couleur = légende, non cliquables, autres noms et métiers proches en listes simples), barre d’étapes standard, métier avec grande initiale et bouton « Changer de métier » plus petit, « Votre objectif » avec les six cartes, barre du bas Retour / Accueil / Continuer, encart « Reprendre » sous la barre de recherche de l’accueil.

Points à trancher par Denis avant le code : (a) autres accès à la fiche (Votre profil, Voir tous les métiers...) : même page avec Retour, ou fenêtre conservée ; (b) listes de compétences informatives (recommandé) ou cliquables ; (c) garder les blocs 4 et 5 de la fiche tous les deux ; (d) risque moyen à élevé : remplacer « Votre cible » par les cartes d’objectif change le lien entre `dossier.typeRecherche` et `dossier.objectif`, audit nécessaire avant de coder.

## 21. Page « fiche du métier » codée derrière l’interrupteur (13/11/2026)

Code : `js/app.js` (`ficheRomeDonnees` source unique des données, `ficheRomeCompleteHTML` refactorée pour l’utiliser, `pageFicheMetier`, `ficheMetierCorpsHTML`, `ouvrirFicheMetierOuCandidater`, route `fiche-metier`, aide `AIDE_PAGES['fiche-metier']`), `css/style.css` (classes `.fm-*`). Atteinte depuis : la barre de recherche de l’accueil (clic sur un métier) et le panneau « métiers associés » (compétence, domaine). Un métier sans fiche ROME, un secteur ou un métier hors répertoire gardent le chemin direct vers Candidater. Retour = page d’avant (pile de navigation), Accueil, « Candidater » en bas : ouvre l’écran Candidater (qui reste tel quel, mis à niveau à l’étape suivante).

Vérifié : parcours réel dans le navigateur (saisie, clic, fiche, « Candidater », « Voir les autres tâches »), mode sombre, téléphone (aucun débordement), fenêtre de « Votre profil » inchangée, public (sans `?fiche_rome=1`) inchangé, `npm test` 2 767 verts.

À faire ensuite : écran Candidater (consigne 273, décisions notées), décision sur les autres accès à la fiche, ouverture au public (journal des changements et `data/nouveautes.js` à ce moment-là).

## 22. Inventaire : ce qui lit la base ROME aujourd'hui et ce qu'elle pourrait alimenter (13/11/2026)

Demande de Denis (13/11/2026) : profiter au maximum de la base dans toute l'application. Inventaire fait par lecture du code (grep sur tout le dépôt), aucune modification. Maquette et questions avant tout code.

**Ce que la base contient (vérifié)** : `baseMetiers` = 1 930 fiches (139 à la main, 1 791 générées), chacune avec savoir-faire, savoir-être, savoirs, actions, lieux, secteur, code ROME. À la demande (jamais au chargement) : les fiches complètes (missions, 47 480 compétences détaillées, savoirs, accès, métiers proches, autres noms) et les 489 phrases simples (`parCode`). Conditions « À savoir » : 1 876 codes. Répertoire élargi : 13 853 intitulés, utilisés par la recherche seulement.

**Correction d'une erreur de ma part (13/11/2026)** : j'ai dit que les listes de secteur reposaient sur « 129 fiches ». C'est faux : `baseMetiers` en compte 1 930, la liste « Voir les métiers de ce secteur » contient donc aussi les fiches générées (15 métiers de bouche, par exemple). Seuls les 13 853 intitulés du répertoire élargi n'y sont pas.

**Qui lit la base aujourd'hui**
- Recherche et orientation : recherche de l'accueil (les fiches générées en sont volontairement exclues, leurs intitulés passent par le répertoire élargi), « Votre parcours » et « Votre profil » (`rechercherMetiers`, `metiersTriesParPertinence`), panneaux « compétence recherchée dans » (`trouverMetiersAssocies`), Comparer mes pistes (savoir-faire et savoir-être par piste), pages Candidater, fiche, secteur.
- CV : `moteurDecisionCV` (classe les compétences du CV, 5 par catégorie, en donnant priorité à celles du métier visé), `cvPdfDonnees`, composeur (règles et stratégies). Dans la consigne envoyée à l'assistant : une seule ligne « Compétences typiquement attendues pour ce métier », et seulement en mode « CV spécifique » ; si le métier n'est pas dans la base, la liste des 21 secteurs.
- Lecture d'offre (ATS) : vocabulaire tiré de la base.
- Secteurs : statistiques calculées sur les 139 fiches à la main seulement (protection voulue).

**Ce qui ne la lit pas du tout** : la lettre de motivation et la préparation d'entretien (elles ne reçoivent que le nom du métier), le Bilan de candidature, Découvrir mes compétences. Les 489 phrases ne sont lues que par la page de fiche.

**Ce que la base pourrait alimenter** (S = simple, reprise de l'existant ; R = risqué ; B = bloquant)
1. Cartes de tâches du CV sans assistant (maquette v3 validée, six portes, sections 17 et 18) : R, composant neuf et lien avec la création du CV ; effort haut. C'est le cœur de la consigne 263.
2. Second prompt du CV avec tâches cochées, consignes allégées : B tant que Denis n'a pas fait ses essais réels (3 profils).
3. Lettre de motivation : donner à l'assistant les vraies tâches du métier visé (5 à 8 phrases) pour moins d'invention : S à R (une ligne de plus dans le contexte, comme « Compétences typiquement attendues », mais toucher un prompt impose les essais).
4. Préparation d'entretien : mêmes tâches, pour des questions probables plus justes : S à R, même remarque.
5. « Ce que fait ce métier » en phrases simples dans « Votre profil » et « Vos pistes » : S, affichage seulement ; décision de la phase 4, étape 3 (où afficher les 489 phrases).
6. Reconversion et Comparer mes pistes par familles de tâches : R (section 19 : rate des évidences, jamais afficher « rien en commun »).
7. Lecture d'offre : rapprocher l'offre des tâches du métier : R moyen.
8. Bilan : vérifier que le CV contient les tâches clés du métier visé : R (prompt du Bilan déjà chargé).
9. Statistiques par secteur sur les 1 930 fiches : S techniquement, mais B tant que les fiches générées ne sont pas relues.

**Points bloquants communs** : relecture par Denis de l'échantillon de 30 fiches, des règles `tablesCompetences.js` et des 489 phrases (section 14 : « à relire »), et aucun affichage au public des fiches générées sans cette relecture ; essais réels de Denis pour tout changement de prompt.

## 23. Autres noms et lettres RIASEC (13/11/2026, consigne 263)

- Les fichiers `data/rome/fiche_*.js` contiennent désormais **tous** les autres noms du métier (plus de plafond à 8) et le champ `ri` (lettres RIASEC, majeure puis mineure). La fiche en affiche 8 puis un bouton « Voir les N autres noms ». Les noms ne sont pas cliquables.
- Les lettres RIASEC sont affichées une par une, uniquement dans « Voir d'autres options » des cartes de métier, avec « Qu'est-ce que le RIASEC ? ». Rien dans le Lexique pour l'instant. Elles décrivent le métier, jamais la personne.
- Le contrôle du mot « IA » ignore le champ `ri` (« IA » = Investigateur + Artistique), dans le générateur et dans le test.

## 24. Analyse de la pertinence des suggestions (13/11/2026, mesures, aucun code modifié)

**Mesures** (4 profils types, `rechercherMetiers`, 10 premiers) :
- Presque tous les métiers du haut de liste ont **100 %** : le score est calculé par rapport à la plus petite des deux listes (profil ou métier). Quelqu'un qui coche 2 actions et 1 activité obtient 100 % dès que le métier les contient, donc des dizaines d'ex æquo. Le départage (fiches rédigées à la main d'abord) ne suffit plus avec 1 930 fiches.
- Conséquence visible : « conduire + transporter + véhicules » propose pilote de chasse, pilote d'hélicoptère militaire et distributeur de prospectus ; « soigner + accompagner + personnes âgées » propose médecin coordonnateur, gériatre, infirmier en pratique avancée avant l'assistant de vie. Aucun critère de niveau de qualification n'existe.
- Les fiches générées ont des listes plus longues que les fiches rédigées (actions 4,0 contre 2,9 ; savoirs 6,0 contre 2,1) : plus de chances de correspondre.
- Les choix proposés : 51 actions et 40 activités distinctes. Très inégaux : « contrôler » 578 métiers, « organiser » 521, mais « vendre » 56, « conduire » 83, « accueillir » 58. Les actions très répandues ne distinguent rien.
- Aucune fiche n'a de `valeurs` (0,0) : le point « ce qui compte pour vous » n'agit déjà sur rien.

**Pistes, par ordre de gain** (à maquetter et valider avant tout code) :
1. Pondérer chaque correspondance par sa rareté (une action rare comme « conduire » pèse plus que « organiser ») et calculer le taux sur la liste de la personne, pas sur la plus petite.
2. Ajouter un critère de niveau (formation d'accès) pour ne pas proposer d'emblée un métier de médecin à qui n'a coché que des gestes simples.
3. Utiliser le poids des macro-compétences du ROME dans chaque métier.
4. Compléter les choix (actions rares du ROME absentes de la liste), après la 1 et la 2.
5. Pour le CV : cartes de tâches issues des compétences du ROME (chantier des cartes de tâches).

## 25. Plan des trois suites demandées et reste à faire du chantier (13/11/2026, demande de Denis)

**A. Pertinence des suggestions (rareté + niveau)** `[effort : haut]`, trois étapes, une maquette avant/après avant tout code.
1. Mesure : rejouer 10 à 15 profils réels (des CV de Denis) et noter les propositions absurdes. Base : section 24.
2. Rareté : chaque correspondance pèse selon la rareté du choix dans la base (« conduire » 83 métiers pèse plus que « organiser » 521) ; taux calculé sur les choix de la personne et non sur la plus petite liste. Risque moyen : change l'ordre partout où `rechercherMetiers` et `metiersTriesParPertinence` servent (grep tout le dépôt avant). Les 139 fiches à la main doivent rester dans les 5 premières avec leurs propres choix (test permanent existant).
3. Niveau : le niveau d'accès n'existe aujourd'hui que sous forme de phrase (champ `a` des fiches : « du niveau Bac à Bac+3 »). À vérifier : extraire un niveau chiffré par motifs de texte, sans l'inventer quand la phrase est absente. Risque : un métier mal classé disparaît à tort ; donc jamais exclure, seulement placer plus bas, et ne jamais afficher « trop qualifié ».
4. Poids des compétences du ROME dans chaque métier : après 2 et 3.

**B. Bouton « Utiliser ce nom pour mon CV »** `[effort : moyen]` : à côté des autres noms de la fiche, il met le nom choisi comme titre visé du CV. À auditer : où le titre est lu (`dossier`, composeur, PDF, Word) avant de brancher ; maquette courte ; décision de Denis (faut-il garder le métier ROME de référence ?).

**C. Cartes de tâches du CV** `[effort : haut]` : maquette v3 et intégration validées (sections 17 et 18). Ordre : composant + « à la main », puis « avec l'assistant » (second prompt après les essais de Denis), puis Reprendre, puis récit et reformuler.

**Reste à faire sur le chantier ROME (tout ce qui est noté et pas fait)**
- Côté Denis : relire l'échantillon de 30 fiches, les règles `tablesRome.js` et `tablesCompetences.js`, les 489 phrases et les 29 descriptifs ; essayer l'aperçu `?fiche_rome=1` ; essais réels de 3 profils pour le second prompt ; trancher les décisions en attente (section 18) et les titres de famille trop généraux.
- Ouverture au public (sur son feu vert) : retirer l'ancien écran Candidater, ligne dans `docs/JOURNAL_DES_CHANGEMENTS.md` et `data/nouveautes.js`.
- Cartes de tâches du CV (C) et second prompt ; vérifier la sortie réelle du CV pour stage et alternance.
- Lettre de motivation et entretien : donner les vraies tâches du métier visé (essais obligatoires).
- Lecture d'offre, Bilan, Découvrir mes compétences, Comparer mes pistes par familles : non branchés.
- Statistiques par secteur sur les 1 930 fiches : bloquées tant que les fiches générées ne sont pas relues.
- Veille du ROME tous les six mois : onglet dans l'outil de veille, journal, rappel programmé (accord de Denis).
- Enrichir à la main les métiers les plus recherchés (`promouvoirFiche.js`, ordre à choisir par Denis).
- Facultatifs : bouton « autres noms » dans les listes de secteur, RIASEC sur la fiche, RIASEC dans le Lexique (écarté pour l'instant), revue des textes avec « on » (consigne 274), comparaison des listes de choix après la pertinence (plafonds 16 / 16 / 12).

## 26. Pertinence : prototype mesuré et niveau d'accès (13/11/2026, aucun code de l'application modifié)

Prototype jetable (dossier temporaire, hors dépôt) : score v1 actuel contre v2 (rareté de chaque choix, taux sur les choix de la personne) et v3 (rareté, rang du choix dans la liste du métier, part des choix dans la liste, léger malus pour les métiers de niveau Bac+5 et plus).
- **Test « son propre métier revient »** : 128 profils tirés des fiches à la main (2 actions, 2 lieux ou publics, 2 savoir-faire) : le métier revient dans les 5 premiers dans les trois cas (128 sur 128). Test peu discriminant : il ne mesure pas l'absurde.
- **Fiches générées dans les 10 premiers** : 5,4 (v1), 5,2 (v2 : la rareté seule change peu), 4,5 (v3).
- **Profils types** : la rareté seule met même les pilotes de chasse en tête pour « conduire + véhicules » (v2). Avec le rang du choix, la précision et le malus de niveau (v3), « soigner + personnes âgées » met l'aide-soignant en premier, « conduire » fait monter les conducteurs de poids lourds. Gériatre et pilote restent présents : le malus à 0,85 ne suffit pas, et le niveau de la personne est inconnu au moment du calcul.
- **Niveau d'accès** : 1 930 fiches = 1 101 niveaux lisibles dans la phrase d'accès + 824 phrases sans niveau (permis, CACES, certificats, expérience, santé, 14 « diplôme d'État ») + 5 fiches à la main sans code ROME. Rien n'est perdu : ces fiches gardent leur phrase d'accès affichée dans « Comment y accéder » ; seule la pénalité de niveau ne s'applique pas (jamais de malus sans niveau lu).
- **À décider** : lire le niveau de la personne (diplôme saisi dans « Vos informations ») pour un malus à la mesure de l'écart, au lieu d'un malus fixe ; audit à faire sur ce que le profil contient au moment du calcul.

## 27. Audit : le niveau de la personne est-il connu au moment du calcul ? (13/11/2026, lecture du code, rien modifié)

- **Qui calcule** : `rechercherMetiers` (data/metiers.js) est appelé par `metiersRecommandes` (js/app.js, les 10 métiers de « Votre profil » et des pistes, avec `construireProfil()`), par la liste de 15 (« Voir tous les métiers »), par `app.js` lignes 3491 et 6623, par `data/moteurPertinenceRechercheERIP.js` et par le module Découverte (`decouverteStrategie.js`, qui construit son propre profil). `metiersTriesParPertinence` (app.js) trie les listes de candidats.
- **Où est le diplôme** : `dossier.formations[]`, chaque entrée porte `niveau` (libellé : « CAP / BEP », « Bac », « Bac +2 », « Bac +3 / Bac +4 », « Bac +5 ») et, pour la saisie à la main, `niveauRNCP` (3, 4, 5, 6, 7). Un CV importé n'a que le libellé. Aucun champ « niveau de la personne » n'existe : il faut le déduire (le plus haut des diplômes saisis).
- **Quand** : les formations se saisissent dans le même hub que les métiers recommandés. Si la personne n'a rien saisi, le niveau est inconnu : dans ce cas aucun malus (jamais d'hypothèse).
- **Conception retenue pour le code** (à valider par maquette) : un champ facultatif `niveauPersonne` dans le profil de `construireProfil()` seulement. Les autres appelants (Découverte, moteur de recherche) ne le renseignent pas, donc rien ne change pour eux : sans régression. Dans `calculerScoreMetier`, le malus ne joue que si le niveau du métier ET celui de la personne sont connus, proportionnel à l'écart (un malus par palier de diplôme manquant, plafonné), jamais d'exclusion, jamais de texte « trop qualifié » ou « pas assez diplômé » affiché, aucun malus quand la personne est plus diplômée que le métier. La correspondance 1 à 7 du RNCP et les « Bac +n » des fiches est à écrire une seule fois (une fonction partagée).
- **Risques** : l'expérience remplace parfois le diplôme (un malus doux, plafonné) ; le niveau des fiches vient d'un texte (824 fiches sans niveau lisible, voir section 26) ; l'ordre des métiers change partout où `construireProfil` sert : comparaison avant/après sur des profils concrets obligatoire, et le test permanent « les 139 fiches restent dans les 5 premiers avec leurs propres choix » doit rester vert.
- **Prochaine étape** : maquette avant/après sur 6 profils (avec et sans diplôme saisi), puis code, puis tests (rareté, rang, malus, absence de niveau).

## 28. Maquette avant/après de la pertinence et décisions de Denis (13/11/2026)

Maquette : `docs/maquettes/maquette-pertinence-suggestions-2026-11-13.html` (6 profils, avant/après, rien codé). Générée par un script jetable (hors dépôt).
- **Décisions de Denis** : aucun nivellement par le bas ; tous les métiers exploitables quel que soit le niveau d'études ; monter le niveau des données des 824 fiches sans niveau lisible et des 139 fiches à la main ; **les titres professionnels comptent** (niveau 3 = CAP, 4 = Bac, 5 = Bac+2, 6 = Bac+3, 7 = Bac+5, 8 = doctorat : même échelle que celle de l'application, `NIVEAUX_DIPLOME_SIMPLES`).
- **Correction à noter** : le niveau 6 est la licence (Bac+3) et le niveau 7 le master (Bac+5).
- **Constat de la maquette** : la rareté et le rang améliorent les premières places (conducteurs de poids lourds avant les pilotes, aide-soignant avant les médecins pour un CAP), mais des métiers évidents n'ont aucun niveau lisible (aide-soignant, infirmier, médecin coordonnateur, éducateur spécialisé : le ROME écrit « diplôme d'État » sans niveau). La lecture automatique ne suffit pas : il faut une table de niveaux relue par Denis.
- **Plan pour monter le niveau des données** : (1) table de niveaux d'accès par code ROME pour les professions réglementées et les cas évidents (diplôme d'État, médecins, infirmiers, pilotes militaires, etc.), générée par règles de titre puis relue par Denis ; (2) détection complète des titres professionnels et CQP (« niveau 4 », « niveau 5 »...) ; (3) pour les métiers dont le ROME dit « accessible sans diplôme » ou n'exige que permis, CACES ou expérience : un niveau « sans diplôme exigé » explicite, au lieu d'« inconnu » ; (4) les 5 fiches à la main sans code ROME reliées à un code ; (5) les fiches à la main gardent leur avantage de départage, jamais retirées.

## 29. Retour de Denis sur la maquette et analyse par catégorie de personnes (13/11/2026)

Retour : « sans diplôme saisi, un Bac+5 ou un docteur en tête est contre-intuitif et peut décourager ; ceux qui font un CV sont déjà aptes à travailler ». Analyse refaite (6 profils de goûts, 5 niveaux de diplôme). Maquette : `docs/maquettes/maquette-pertinence-par-diplome-2026-11-13.html`.
- **Règle corrigée** : sans diplôme saisi = traité comme « sans diplôme exigé » (niveau 2), jamais comme inconnu. Malus selon l'écart : 1 niveau de plus ×0,92, 2 ×0,78, 3 ×0,60, 4 et plus ×0,45. Rien n'est retiré de « Voir tous les métiers ».
- **Défaut repéré** : une même profession existe en double (fiche à la main + fiche du répertoire : « Accompagnant éducatif et social (AES) » deux fois). À dédoublonner dans le classement.
- **Niveau inconnu** : 695 fiches ni lues dans le texte ni couvertes par la table d'essai (85 fiches par règles de titre). La table est à étendre (médecins spécialistes, pilotes militaires) et à faire relire par Denis.
- **Limites** : certains rapprochements restent faibles (« Ministre du culte » pour un profil « enfants », « Chef d'équipe de travaux de milieux naturels » pour un profil bureau) : fiches générées aux listes courtes ou larges.
- **Piste suivante** : l'expérience professionnelle (métiers déjà exercés) pourrait remonter un métier voisin même sans diplôme saisi.

## 30. Pertinence codée (13/11/2026, consigne 279)

- **Fait** : niveau d'accès par code du ROME (METIERS_ROME_NIVEAUX dans data/metiersRome.js, règles dans scripts/importRome/niveauxAcces.js : texte du ROME, plus bas niveau cité, titres professionnels, « sans diplôme », table de titres à relire) ; 1 257 codes sur 1 923 ont un niveau, les autres restent neutres. Calcul : comparerListesPonderees (rareté, rang, précision), _facteurNiveauEtExperience (malus 0,92 / 0,78 / 0,60 / 0,45 selon l'écart de niveaux, réduit par l'expérience dans le même domaine ; bonus d'expérience 12 % / 8 % / 4 % selon le lien et les années ; petit avantage aux métiers de niveau 3 et moins pour une personne peu diplômée et sans expérience), dédoublonnage dans rechercherMetiers. Le profil de construireProfil() porte niveauPersonne (2 si rien saisi) et experience ; les autres appelants (Découverte, recherche) ne les renseignent pas et ne changent donc pas. Tests : tests/pertinenceMetiers.test.js (2 781 au total).
- **Reste** : relecture de la table de niveaux par Denis ; les 5 fiches à la main sans code ROME (ni niveau ni lettres RIASEC) ; rapprochements faibles des fiches générées aux listes de choix trop larges (« Masseur bien-être » ou « Educateur canin » en tête pour « soigner ») ; l'expérience n'est reconnue que par l'intitulé du poste (pas encore par les missions) ; essais de Denis sur de vrais profils.

## 31. Niveaux vérifiés, cinq fiches sans code, comparaison main / ROME (13/11/2026)

- **Table de niveaux vérifiée en ligne** (France Compétences, Certif Info) : ambulancier 3 (diplôme d'État niveau 3) ; kinésithérapeute, sage-femme, orthophoniste 7 (grade Master) ; pilote de ligne 6 ; chercheur 8 ; ergothérapeute, infirmier, éducateur spécialisé, éducateur de jeunes enfants, assistant de service social 6 ; aide-soignant et auxiliaire de puériculture 4 ; accompagnant éducatif et social 3. Médecins, chirurgiens, pharmaciens, dentistes, vétérinaires : le RNCP indique 7 mais les études durent 9 à 11 ans, gardés à 8. Pilotes militaires retirés (concours, pas de diplôme). Architecte, avocat, juriste (7) non vérifiés en ligne, notés comme tels dans le fichier.
- **Cinq fiches à la main sans code** : le ROME connaît bien ces activités, mais sous d'autres noms et sans code générique unique. Décision appliquée (consigne de Denis : sans code, on retire) : Webmaster relié à M1834 (appellations « Webmaster concepteur de site web », « éditorialiste », « chargé de communication ») ; Conducteur de ligne de production, Gestionnaire ressources humaines, Technicien son et lumière, Éleveur retirés (le ROME les décline par filière : H3301, H2202, H2924... ; M1501 et M1507 ; L1504 et L1508 ; A1407, A1408, A1410, A1411...). Les fiches générées de ces codes restent trouvables par leur nom. Fiches à la main : 139 devient 135. Identifiants retirés aussi de data/secteurs.js et de METIERS_SAISONNIER_ALIMENTAIRE. Tests ajustés (135, répartition par secteur, 25 métiers saisonniers).
- **Comparaison fiches à la main / fiches que le générateur donnerait pour le même code (135 codes)** : actions communes 40 % seulement ; activités 35 % ; lieux 70 % ; savoir-faire 52 % ; savoir-être 43 % ; savoirs 5 % (formulations différentes). Constats : (1) la fiche du ROME est plus riche en savoir-faire (5,5 contre 3,5) et en savoirs (6 contre 2,1), mais ses listes d'activités contiennent beaucoup de « machines » et « outils » (dans plus de 60 des 135 cas), peu distinctifs ; (2) la fiche à la main est plus juste sur le quotidien humain (clients, collègues, seul : 46, 39 et 32 cas absents du ROME) et sur certaines actions (organiser, vendre, conseiller, créer) ; (3) la fiche du ROME oublie parfois l'action centrale (aide-soignant : « accompagner » sans « soigner »). Aucun des deux côtés n'est systématiquement meilleur : ils se complètent. Recommandation : une seule chaîne de fabrication pour tous les codes, et une couche de corrections par code (listes à la main prioritaires pour actions, activités, lieux ; savoir-faire et savoirs : union). Non appliqué, en attente de la décision de Denis.

## 32. Vers une seule source de choix (consigne 280, 13/11/2026)

- **Décision de Denis** : une seule source pour tous les métiers, aucun avantage aux 135 premières fiches ; leur savoir est transféré dans les règles du générateur.
- **Test croisé (135 fiches, personne qui coche comme la fiche à la main ou comme le ROME)** : fiche à la main seule, une personne « ROME » la retrouve dans 19 % des cas (top 10) ; fiche du ROME seule, une personne « main » la retrouve dans 15 % ; listes fusionnées en une : 99 % et 59 % ; deux signatures (la meilleure des deux) : 99 % et 93 %. Les deux sources décrivent bien le même métier avec des choix différents.
- **19 % des choix « avec qui, avec quoi » des fiches à la main n'existent plus dans la liste proposée** (seul 32, exterieur 22, deplacement 10, bureau 9, magasin 6, famille 2) : personne ne peut les cocher.
- **Règles ajoutées au générateur** (tablesRome.js : SAVOIR_ETRE_ACTIONS, OBJECTIFS_ACTIVITES_TOUJOURS, objectifs 5A2, 5B3, 5B5 vers vendre, 1E1 vers soigner, trois macros) : actions retrouvées 40 % à 48 %, avec qui ou quoi 35 % à 48 %. Les seuils d'action (2 compétences, 30 %) ne changent presque rien (balayage de 9 combinaisons, F entre 36 et 38 %).
- **Provisoire** : les 135 fiches portent une seconde signature (`signatureRome`, METIERS_ROME_SIGNATURES dans data/metiersRome.js) et le classement garde la meilleure des deux (calculerScoreMetier). À retirer quand la signature du ROME seule retrouve le métier dans au moins 90 % des cas.
- **Expérience** : un poste qui n'est le nom d'aucune fiche est cherché dans le répertoire élargi (13 800 intitulés) s'il est chargé ; construireProfil() le charge à la demande.
- **Feuille de relecture de la table de niveaux** : docs/RELECTURE_TABLE_NIVEAUX_2026-11-13.md.

### 32 bis. Résultats mesurés le 13/11/2026

- **Test décisif de la source unique** (135 fiches ; choix cochés comme la fiche à la main, en ne gardant que les choix qui existent encore) : fiche du ROME seule, la personne « main » retrouve le métier dans les 10 premiers dans **18 %** des cas (objectif 90 % : NON atteint, les nouvelles règles n'ont fait passer ce chiffre que de 15 % à 18 %) ; la personne « ROME » retrouve la fiche du ROME à 90 %, la fiche à la main seule à 24 % ; les deux signatures : 99 % et 92 %. L'écart est structurel (accord choix par choix : actions 48 %, avec qui ou quoi 48 %, lieux 70 %), pas un réglage de seuil. Décision de Denis demandée.
- **Simulation quantité et qualité des choix** (80 métiers, 40 à la main et 40 du ROME ; une personne qui a exercé le métier et coche ses choix) : 1 choix par question : métier dans les 10 premiers dans 63 % des cas ; 2 choix : 90 % ; 3 choix : 98 % ; tous : 99 %. Catégories : actions seules 64 %, avec qui ou quoi seul 45 %, lieux seuls 31 %, actions + avec qui ou quoi 96 %, les trois 99 %. Choix faux en plus (au hasard) : +1 par question 96 %, +2 94 %, +4 86 %, +8 69 % : chaque mauvais choix coûte. Une personne qui coche les choix de 2 métiers à la fois : 78 % ; de 3 métiers : 66 % ; de 5 métiers : 43 % ; relever les plafonds de 16/16/12 à 30/30/20 n'améliore rien (3 métiers : 59 %). Choix génériques (machines, outils, collègues, clients) : sans eux 98 %, eux seuls 92 % : ils ne gênent pas.
- **Conclusions** : (1) le plus grand levier est de ne pas mélanger plusieurs expériences dans une seule liste de choix : demander les choix par expérience ; (2) 2 à 4 choix par question suffisent, plus n'aide pas, et les mauvais choix coûtent : inviter à ne cocher que ce qui a été réellement fait ; (3) ne pas relever les plafonds ; (4) les actions et le « avec qui, avec quoi » pèsent le plus, les lieux départagent.

### 32 ter. Essai à l'aveugle sur 30 fiches et nettoyage des choix morts (13/11/2026)

- **Essai** : une seconde description (actions, avec qui ou quoi, lieux) a été écrite pour 30 fiches tirées au hasard, à partir du seul texte du ROME, sans voir les listes à la main. Accord avec les listes à la main (mesure F) : actions 45 % (règles automatiques 37 %), avec qui ou quoi 66 % (45 %), lieux 70 % (61 %).
- **Classement** (retrouver le métier dans les 10 premiers) : personne qui reprend 60 % des choix de « main + règles » : main seule 50 %, règles seules 61 %, main + règles (état actuel) 86 %, écrit à l'aveugle + règles 74 %. Personne neutre (60 % des choix de main + règles + aveugle) : 54 %, 51 %, 73 %, **83 %**. Personne à 40 % des choix : 43 %, 39 %, 65 %, 51 %.
- **Lecture** : une seconde description écrite d'après le ROME vaut une seconde source (elle bat nettement chaque source seule), mais elle n'est pas identique aux listes à la main : les personnes bâties avec les listes à la main favorisent mécaniquement l'état actuel. Reste à décider avec Denis l'écriture pour les 1 790 autres fiches, par lots de 100, clé = identifiant de fiche (cinq codes sont partagés par deux fiches).
- **Nettoyage** : 81 choix « avec qui ou quoi » qui n'existaient plus dans le catalogue (seul 32, extérieur 22, déplacement 10, bureau 9, magasin 6, famille 2) retirés des fiches à la main ; « Employé de ménage à domicile » n'a plus aucun choix de cette famille (à compléter). Garde-fou : test « tous les choix de toutes les fiches existent dans les catalogues proposés » (`tests/metiersRome.test.js`).

## 33. Secondes descriptions des 1 790 fiches du ROME, par lots (consigne 280, décision de Denis du 13/11/2026)

- **Principe** : chaque fiche du ROME reçoit une seconde description écrite d'après le texte du ROME (définition, missions, conditions) : actions, « avec qui ou quoi », lieux. Fichier unique **`data/descriptionsEcrites.js`**, tenu à la main, clé = identifiant de fiche (`rome_XXXX`). Les listes écrites deviennent les listes de la fiche et la signature déduite du ROME devient sa seconde signature : la fiche se comporte exactement comme une fiche à la main (`data/metiers.js`, juste après la pose des signatures des fiches à la main). Chargé dans `index.html` avant `data/metiers.js`.
- **Ordre des lots** : les fiches les plus riches en appellations d'abord (proxy de « les plus proposées »), lots de 100 écrits par tranches de 25. Contrôle à chaque versement : les identifiants doivent exister dans les catalogues, aucune liste vide.
- **Terminé le 13/11/2026** : les 1 790 fiches du ROME portent une seconde description (1 790 entrées dans `data/descriptionsEcrites.js`, 72 lots de 25). Contrôle sur un échantillon de 299 fiches (une sur six) : une personne qui coche les 3 premières actions, les 2 premiers « avec qui ou quoi » et le 1er lieu de la description retrouve la fiche dans les 3 premiers dans **93,6 %** des cas et dans les 10 premiers dans **99,3 %** (2 absentes : Opérateur de production de papier carton, Opérateur de production des matières plastiques et du caoutchouc, deux métiers voisins de plusieurs autres). Test réel de la même source : elle ne prouve pas que la description soit juste (test circulaire, leçon 9.156), seulement qu'elle est assez distinctive.
- **Fait ensuite** : le départage des scores égaux ne favorise plus les fiches à la main (`comparerMetiersParScore` : ordre alphabétique des noms). Les 135 fiches à la main et les 1 790 fiches du ROME sont désormais traitées de la même façon au classement.
- **Reste (sans urgence)** : (1) `promouvoirFiche` (outil qui sert à écrire une fiche à la main) peut être retiré quand Denis le décide ; (2) les statistiques par secteur utilisent encore les 135 fiches à la main seules (`baseMetiersDetaillees`) : à basculer sur toutes les fiches après relecture ; (3) ranger les listes des 135 fiches à la main dans le même fichier que les autres ; (4) relecture par Denis d'un échantillon de chaque lot ; (5) le choix des cartes par expérience (docs/CHANTIER_CHOIX_PAR_EXPERIENCE_2026-11-13.md).
